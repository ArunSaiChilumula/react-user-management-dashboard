import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import { getApiErrorMessage } from '../services/apiError'
import { getProducts } from '../services/productsService'

const productsPerPage = 10

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 300)

    return () => clearTimeout(timerId)
  }, [search])

  useEffect(() => {
    let isActive = true

    async function loadProducts() {
      setIsLoading(true)
      setError('')

      try {
        const productsData = await getProducts({
          search: debouncedSearch,
          limit: productsPerPage,
          skip: page * productsPerPage,
        })

        if (isActive) {
          setProducts(productsData.products)
          setTotal(productsData.total)
        }
      } catch (requestError) {
        if (isActive) {
          setError(getApiErrorMessage(requestError, 'Could not load products.'))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isActive = false
    }
  }, [debouncedSearch, page, retryCount])

  const totalPages = Math.ceil(total / productsPerPage)
  const isSearchPending = search !== debouncedSearch

  function updateSearch(event) {
    setSearch(event.target.value)
  }

  function retryLoadingProducts() {
    setRetryCount((currentCount) => currentCount + 1)
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Products</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Browse the catalog and view product details.
          </p>
        </div>
        {!isLoading && !isSearchPending && !error && (
          <p className="text-sm font-medium text-gray-600">
            {total} {total === 1 ? 'product' : 'products'}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="product-search">
          Search products
        </label>
        <input
          autoComplete="off"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:max-w-md"
          id="product-search"
          onChange={updateSearch}
          placeholder="Search by product title"
          type="search"
          value={search}
        />
      </div>

      {error && !isSearchPending && (
        <div className="mb-6 space-y-3">
          <ErrorMessage message={error} title="Unable to load products" />
          <Button onClick={retryLoadingProducts} variant="secondary">Try again</Button>
        </div>
      )}

      {(isSearchPending || (isLoading && !error)) && (
        <div className="py-8">
          <Loading label="Loading products…" />
        </div>
      )}

      {!isLoading && !isSearchPending && !error && products.length === 0 && (
        <section className="rounded-md border border-gray-200 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No products found</h2>
          <p className="mt-2 text-sm text-gray-600">
            Try a different search term to find products.
          </p>
        </section>
      )}

      {!isLoading && !isSearchPending && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((product) => (
              <Link
                className="group flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                key={product.id}
                to={`/products/${product.id}`}
              >
                <div className="flex h-52 items-center justify-center bg-gray-50 p-4">
                  <img
                    alt={product.title}
                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                    loading="lazy"
                    src={product.thumbnail}
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 font-semibold text-gray-900">{product.title}</h2>
                    <span className="shrink-0 text-sm font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-600">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-gray-500">
                    <span className="truncate capitalize">{product.category}</span>
                    <span className="shrink-0">Rating: {product.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page === 0}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ProductsPage
