import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import { getApiErrorMessage } from '../services/apiError'
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from '../services/postsService'

let localPostSequence = 0

function PostsPage() {
  const { postId } = useParams()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [detailRecord, setDetailRecord] = useState({ id: null, post: null, error: '' })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [mutationError, setMutationError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadPosts() {
      try {
        const postsData = await getPosts()
        if (isActive) {
          setPosts(postsData)
        }
      } catch (requestError) {
        if (isActive) {
          setListError(getApiErrorMessage(requestError, 'Could not load posts.'))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!postId || isLoading) return undefined
    if (posts.some((post) => String(post.id) === postId)) return undefined

    let isActive = true

    async function loadPostDetails() {
      try {
        const postData = await getPost(postId)
        if (!postData?.id) {
          throw new Error('Post not found.')
        }

        if (isActive) {
          setDetailRecord({ id: postId, post: postData, error: '' })
        }
      } catch (requestError) {
        if (isActive) {
          setDetailRecord({
            id: postId,
            post: null,
            error: getApiErrorMessage(requestError, 'Could not load this post.'),
          })
        }
      }
    }

    loadPostDetails()

    return () => {
      isActive = false
    }
  }, [postId, posts, isLoading])

  async function reloadPosts() {
    setIsLoading(true)
    setListError('')

    try {
      setPosts(await getPosts())
    } catch (requestError) {
      setListError(getApiErrorMessage(requestError, 'Could not load posts.'))
    } finally {
      setIsLoading(false)
    }
  }

  function startCreate() {
    setEditingPost(null)
    setTitle('')
    setBody('')
    setFormErrors({})
    setMutationError('')
    setFeedback('')
    setIsFormOpen(true)
  }

  function startEdit(post) {
    setEditingPost(post)
    setTitle(post.title)
    setBody(post.body)
    setFormErrors({})
    setMutationError('')
    setFeedback('')
    setIsFormOpen(true)
  }

  function cancelForm() {
    setIsFormOpen(false)
    setEditingPost(null)
    setFormErrors({})
  }

  function handleTitleChange(event) {
    const nextTitle = event.target.value
    setTitle(nextTitle)

    if (nextTitle.trim()) {
      setFormErrors((currentErrors) => ({ ...currentErrors, title: undefined }))
    }
  }

  function handleBodyChange(event) {
    const nextBody = event.target.value
    setBody(nextBody)

    if (nextBody.trim()) {
      setFormErrors((currentErrors) => ({ ...currentErrors, body: undefined }))
    }
  }

  async function handleFormSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!title.trim()) {
      nextErrors.title = 'Title is required.'
    }
    if (!body.trim()) {
      nextErrors.body = 'Body is required.'
    }
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    await handleSave({
      title: title.trim(),
      body: body.trim(),
      userId: editingPost?.userId ?? 1,
    })
  }

  async function handleSave(postData) {
    setIsSaving(true)
    setMutationError('')
    setFeedback('')

    try {
      if (editingPost) {
        const updatedPost = editingPost.isLocal
          ? postData
          : await updatePost(editingPost.id, postData)
        const nextPost = { ...editingPost, ...postData, ...updatedPost, id: editingPost.id }
        setPosts((currentPosts) =>
          currentPosts.map((post) => (post.id === editingPost.id ? nextPost : post)),
        )
        setFeedback('Post updated successfully.')
      } else {
        const createdPost = await createPost(postData)
        if (!createdPost?.id) {
          throw new Error('The server did not return the new post.')
        }
        const localId = `local-${Date.now()}-${++localPostSequence}`
        setPosts((currentPosts) => [
          { ...createdPost, id: localId, isLocal: true },
          ...currentPosts,
        ])
        setFeedback('Post created successfully.')
      }

      cancelForm()
    } catch (requestError) {
      setMutationError(getApiErrorMessage(requestError, 'Unable to save this post.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(post) {
    setDeletingId(post.id)
    setMutationError('')
    setFeedback('')

    try {
      if (!post.isLocal) await deletePost(post.id)
      setPosts((currentPosts) => currentPosts.filter((currentPost) => currentPost.id !== post.id))
      setFeedback('Post deleted successfully.')
    } catch (requestError) {
      setMutationError(getApiErrorMessage(requestError, 'Unable to delete this post.'))
    } finally {
      setDeletingId(null)
    }
  }

  const listedPost = posts.find((post) => String(post.id) === postId)
  const detailRecordForRoute = detailRecord.id === postId ? detailRecord : null
  const detailPost = listedPost ?? detailRecordForRoute?.post
  const detailError = listedPost ? '' : detailRecordForRoute?.error

  if (postId) {
    return (
      <>
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Post details</h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Read the full content of this post.
            </p>
          </div>
          <Link
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            to="/posts"
          >
            Back to posts
          </Link>
        </div>
        {!detailPost && !detailError && <Loading label="Loading post details…" />}
        {detailError && <ErrorMessage message={detailError} title="Unable to load post" />}
        {detailPost && (
          <article className="rounded-md border border-gray-200 bg-white p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                Post #{detailPost.id}
              </span>
              <span className="text-xs font-medium text-slate-400">
                Author #{detailPost.userId}
              </span>
            </div>
            <h2 className="mt-5 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {detailPost.title}
            </h2>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
              {detailPost.body}
            </p>
          </article>
        )}
      </>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Posts</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Create, review, and manage workspace content.
          </p>
        </div>
        <Button onClick={startCreate}>
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          Add post
        </Button>
      </div>

      {feedback && (
        <div className="mb-5 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700" role="status">
          {feedback}
        </div>
      )}
      {mutationError && (
        <div className="mb-5">
          <ErrorMessage message={mutationError} title="Post action failed" />
        </div>
      )}

      {isFormOpen && (
        <section className="mb-6 rounded-md border border-gray-200 bg-white p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingPost ? 'Edit post' : 'Create a post'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingPost ? 'Update the title or body below.' : 'Add a title and body to publish a post.'}
            </p>
          </div>
          <form className="space-y-5" noValidate onSubmit={handleFormSubmit}>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="post-title">
                Title
              </label>
              <input
                aria-describedby={formErrors.title ? 'post-title-error' : undefined}
                aria-invalid={Boolean(formErrors.title)}
                autoFocus
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
                id="post-title"
                onChange={handleTitleChange}
                placeholder="Give your post a title"
                value={title}
              />
              {formErrors.title && (
                <p className="mt-1.5 text-sm text-red-700" id="post-title-error" role="alert">
                  {formErrors.title}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="post-body">
                Body
              </label>
              <textarea
                aria-describedby={formErrors.body ? 'post-body-error' : undefined}
                aria-invalid={Boolean(formErrors.body)}
                className="mt-2 min-h-36 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
                id="post-body"
                onChange={handleBodyChange}
                placeholder="Write the post content"
                rows={5}
                value={body}
              />
              {formErrors.body && (
                <p className="mt-1.5 text-sm text-red-700" id="post-body-error" role="alert">
                  {formErrors.body}
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <Button className="w-full sm:w-auto" onClick={cancelForm} variant="secondary">
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" disabled={isSaving} type="submit">
                {isSaving ? 'Saving…' : editingPost ? 'Save changes' : 'Create post'}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">All posts</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading ? 'Loading your posts…' : `${posts.length} posts`}
            </p>
          </div>
          {!isLoading && listError && (
            <Button onClick={reloadPosts} variant="secondary">Try again</Button>
          )}
        </div>

        {isLoading && <div className="p-6"><Loading label="Loading posts…" /></div>}
        {!isLoading && listError && (
          <div className="p-5">
            <ErrorMessage message={listError} title="Unable to load posts" />
          </div>
        )}
        {!isLoading && !listError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Post</th>
                  <th className="px-5 py-3.5">Author</th>
                  <th className="px-5 py-3.5">Content</th>
                  <th className="px-5 py-3.5 text-right" colSpan="3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr className="transition hover:bg-slate-50/70" key={post.id}>
                    <td className="max-w-64 px-5 py-4">
                      <p className="line-clamp-2 font-semibold capitalize text-slate-900">{post.title}</p>
                      <p className="mt-1 text-xs text-slate-400">#{post.id}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">User #{post.userId}</td>
                    <td className="max-w-md px-5 py-4 text-slate-500">
                      <p className="line-clamp-2">{post.body}</p>
                    </td>
                    <td className="whitespace-nowrap px-2 py-4">
                      <Link
                        className="font-semibold text-gray-800 underline hover:text-gray-600"
                        to={`/posts/${post.id}`}
                      >
                        View
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-2 py-4">
                      <button
                        className="font-semibold text-gray-600 hover:text-gray-900"
                        onClick={() => startEdit(post)}
                        type="button"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button
                        className="font-semibold text-red-700 hover:text-red-900 disabled:opacity-50"
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post)}
                        type="button"
                      >
                        {deletingId === post.id ? 'Deleting…' : 'Delete'}
                        <span className="sr-only"> post {post.id}</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan="6">
                      No posts found. Create your first post to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

export default PostsPage
