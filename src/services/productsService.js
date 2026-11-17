import apiClient from './apiClient'

// Load a page of products, or search for products by title.
export async function getProducts({ search = '', limit = 10, skip = 0 } = {}) {
  const searchTerm = search.trim()
  const endpoint = searchTerm ? '/products/search' : '/products'
  const response = await apiClient.get(`https://dummyjson.com${endpoint}`, {
    params: {
      q: searchTerm || undefined,
      limit,
      skip,
    },
  })
  return response.data
}

// Load one product by its ID.
export async function getProduct(productId) {
  const response = await apiClient.get(`https://dummyjson.com/products/${productId}`)
  return response.data
}
