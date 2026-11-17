export function getApiErrorMessage(error, fallback) {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.message === 'Network Error') {
    return 'Unable to reach the server. Check your connection and try again.'
  }

  if (error?.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.'
  }

  if (error?.response?.status) {
    return `The server returned an error (${error.response.status}).`
  }

  if (error?.message) {
    return error.message
  }

  return fallback
}
