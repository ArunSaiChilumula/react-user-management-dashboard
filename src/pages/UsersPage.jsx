import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import { getApiErrorMessage } from '../services/apiError'
import { getUser, getUsers } from '../services/usersService'

function UsersPage() {
  const { userId } = useParams()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [userRecord, setUserRecord] = useState({ id: null, user: null, error: '' })
  const [detailRequest, setDetailRequest] = useState(0)

  useEffect(() => {
    let isActive = true

    async function loadUsers() {
      try {
        const usersData = await getUsers()
        if (isActive) {
          setUsers(usersData)
        }
      } catch (requestError) {
        if (isActive) {
          setError(getApiErrorMessage(requestError, 'Could not load users.'))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!userId) return undefined

    let isActive = true

    async function loadUserDetails() {
      try {
        const userData = await getUser(userId)
        if (!userData?.id) {
          throw new Error('User not found.')
        }

        if (isActive) {
          setUserRecord({ id: userId, user: userData, error: '' })
        }
      } catch (requestError) {
        if (isActive) {
          setUserRecord({
            id: userId,
            user: null,
            error: getApiErrorMessage(requestError, 'Could not load this user.'),
          })
        }
      }
    }

    loadUserDetails()

    return () => {
      isActive = false
    }
  }, [userId, detailRequest])

  async function reloadUsers() {
    setIsLoading(true)
    setError('')

    try {
      setUsers(await getUsers())
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not load users.'))
    } finally {
      setIsLoading(false)
    }
  }

  function retryUserDetails() {
    setUserRecord({ id: userId, user: null, error: '' })
    setDetailRequest((currentRequest) => currentRequest + 1)
  }

  const searchQuery = search.trim().toLowerCase()
  const filteredUsers = users.filter((user) => {
    const nameMatches = user.name.toLowerCase().includes(searchQuery)
    const emailMatches = user.email.toLowerCase().includes(searchQuery)

    return nameMatches || emailMatches
  })

  if (userId) {
    const user = userRecord.id === userId ? userRecord.user : null
    const detailError = userRecord.id === userId ? userRecord.error : ''

    return (
      <>
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">User details</h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Contact information and organization details.
            </p>
          </div>
          <Link
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            to="/users"
          >
            Back to users
          </Link>
        </div>
        {!user && !detailError && <Loading label="Loading user details…" />}
        {detailError && (
          <div className="space-y-3">
            <ErrorMessage message={detailError} title="Unable to load user" />
            <Button onClick={retryUserDetails} variant="secondary">Try again</Button>
          </div>
        )}
        {user && (
          <section className="overflow-hidden rounded-md border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-6 sm:px-7">
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{user.company?.name}</p>
            </div>
            <dl className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-7">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt>
                <dd className="mt-1 break-all text-sm font-medium text-slate-800">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">{user.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">{user.company?.name}</dd>
                {user.company?.catchPhrase && (
                  <p className="mt-1 text-sm text-slate-500">{user.company.catchPhrase}</p>
                )}
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">City</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">{user.address?.city}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Address</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {[user.address?.street, user.address?.suite, user.address?.zipcode]
                    .filter(Boolean)
                    .join(', ')}
                </dd>
              </div>
            </dl>
          </section>
        )}
      </>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Users</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Browse your directory and view contact details.
          </p>
        </div>
        <span className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
          {users.length} users
        </span>
      </div>

      <section className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-semibold text-slate-900">Directory</h2>
            <p className="mt-1 text-sm text-slate-500">Search by name or email address.</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search users by name or email</span>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users…"
              type="search"
              value={search}
            />
          </label>
        </div>

        {isLoading && <div className="p-6"><Loading label="Loading users…" /></div>}
        {!isLoading && error && (
          <div className="space-y-3 p-5">
            <ErrorMessage message={error} title="Unable to load users" />
            <Button onClick={reloadUsers} variant="secondary">Try again</Button>
          </div>
        )}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">City</th>
                  <th className="px-5 py-3.5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr className="transition hover:bg-slate-50/70" key={user.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{user.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{user.phone}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{user.company?.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{user.address?.city}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Link
                        className="font-semibold text-gray-800 underline hover:text-gray-600"
                        to={`/users/${user.id}`}
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan="6">
                      {search ? 'No users match your search.' : 'No users found.'}
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

export default UsersPage
