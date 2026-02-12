import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FaStar } from 'react-icons/fa6'
import * as api from '../lib/api'
import type { Product } from '../lib/api'

interface ProductDetailPageProps {
  onAddToCart: (productId: number) => void
  onBuyNow: (productId: number) => void
  onBack: () => void
}

function ProductDetailPage({ onAddToCart, onBuyNow, onBack }: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const productId = id ?? ''
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.fetchProducts().then((res) => {
      const id = parseInt(productId, 10)
      const p = res.products.find((x) => x.id === id)
      setProduct(p || null)
    }).catch(() => setProduct(null)).finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <p className="text-gray-500">Product not found</p>
        <button onClick={onBack} className="ml-4 text-pink-500 underline">Back</button>
      </div>
    )
  }

  const rating = product.rating ?? 4.5
  const reviewCount = product.review_count ?? 0

  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-gray-600 hover:text-pink-500 transition"
        >
          ← Back to shop
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50">
              {product.image ? (
                <img src={api.getImageUrl(product.image)} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-6xl text-pink-200">Outfit</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-400">
              {product.category ?? 'Thrift'}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(rating) ? 'fill-current' : 'fill-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>

            <p className="text-2xl font-bold text-pink-500">{api.formatPrice(product.price)}</p>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600">
                {product.size}
              </span>
              <span className={`text-sm font-medium ${product.status === 'Sold' ? 'text-gray-400' : 'text-green-500'}`}>
                {product.status}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {product.description ?? 'Pre-loved thrifted clothing. Unique finds for your wardrobe.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={() => onAddToCart(product.id)}
                className="rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-pink-400 transition"
              >
                Add to cart
              </button>
              <button
                onClick={() => onBuyNow(product.id)}
                disabled={product.status === 'Sold'}
                className="rounded-full border-2 border-pink-500 px-6 py-3 text-sm font-semibold text-pink-500 hover:bg-pink-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
