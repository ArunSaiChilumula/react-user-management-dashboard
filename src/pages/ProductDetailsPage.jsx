import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import { getApiErrorMessage } from '../services/apiError'
import { getProduct } from '../services/productsService'

function ProductDetailsPage() {
  const { productId } = useParams()
  const [productRecord, setProductRecord] = useState({
    id: null,
    product: null,
    error: '',
  })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isActive = true

    async function loadProduct() {
      try {
        const productData = await getProduct(productId)

        if (!productData?.id) {
          throw new Error('Product not found.')
        }

        if (isActive) {
          setProductRecord({ id: productId, product: productData, error: '' })
        }
      } catch (requestError) {
        if (isActive) {
          setProductRecord({
            id: productId,
            product: null,
            error: getApiErrorMessage(requestError, 'Could not load this product.'),
          })
        }
      }
    }

    loadProduct()

    return () => {
      isActive = false
    }
  }, [productId, retryCount])

  const product = productRecord.id === productId ? productRecord.product : null
  const error = productRecord.id === productId ? productRecord.error : ''
  const productImages = product?.images?.length
    ? product.images
    : product?.thumbnail
      ? [product.thumbnail]
      : []

  function retryLoadingProduct() {
    setProductRecord({ id: null, product: null, error: '' })
    setRetryCount((currentCount) => currentCount + 1)
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Product details</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Product information and images.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          to="/products"
        >
          Back to products
        </Link>
      </div>

      {!product && !error && (
        <div className="py-8">
          <Loading label="Loading product details…" />
        </div>
      )}

      {error && (
        <div className="space-y-3">
          <ErrorMessage message={error} title="Unable to load product" />
          <Button onClick={retryLoadingProduct} variant="secondary">Try again</Button>
        </div>
      )}

      {product && (
        <section className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2 lg:gap-10">
            <div className="grid grid-cols-2 gap-3">
              {productImages.map((image, index) => (
                <div
                  className={`flex min-h-40 items-center justify-center rounded-md bg-gray-50 p-4 ${
                    index === 0 ? 'col-span-2 min-h-72' : ''
                  }`}
                  key={`${image}-${index}`}
                >
                  <img
                    alt={`${product.title} image ${index + 1}`}
                    className="max-h-80 w-full object-contain"
                    src={image}
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-2xl font-semibold text-gray-900">{product.title}</h2>
                <span className="text-xl font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <p className="mt-4 leading-7 text-gray-600">{product.description}</p>

              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-gray-200 pt-6">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rating</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.rating}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</dt>
                  <dd className="mt-1 capitalize text-sm font-medium text-gray-900">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Brand</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.brand || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.stock}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default ProductDetailsPage
