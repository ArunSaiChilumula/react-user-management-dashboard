import apiClient from './apiClient'

// Load every post from the API.
export async function getPosts() {
  const response = await apiClient.get('/posts')
  return response.data
}

// Load one post by its ID.
export async function getPost(postId) {
  const response = await apiClient.get(`/posts/${postId}`)
  return response.data
}

// Send a new post to the API.
export async function createPost(postData) {
  const response = await apiClient.post('/posts', postData)
  return response.data
}

// Replace an existing post with the updated post data.
export async function updatePost(postId, postData) {
  const response = await apiClient.put(`/posts/${postId}`, postData)
  return response.data
}

// Delete one post by its ID.
export async function deletePost(postId) {
  const response = await apiClient.delete(`/posts/${postId}`)
  return response.data
}
