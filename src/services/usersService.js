import apiClient from './apiClient'

// Load every user from the API.
export async function getUsers() {
  const response = await apiClient.get('/users')
  return response.data
}

// Load one user by their ID.
export async function getUser(userId) {
  const response = await apiClient.get(`/users/${userId}`)
  return response.data
}
