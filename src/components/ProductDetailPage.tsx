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
      <div className="min-h-screen flex items-center justify-center pt-28 border-t-4 border-black bg-fuchsia-50/30">
        <p className="font-y2k font-bold text-black">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28 border-t-4 border-black bg-fuchsia-50/30">
        <p className="font-y2k font-bold text-black">Product not found</p>
        <button onClick={onBack} className="ml-4 font-y2k font-bold text-[#E6007E] underline hover:text-[#FF00FF]">Back</button>
      </div>
    )
  }

  const rating = product.rating ?? 4.5
  const reviewCount = product.review_count ?? 0

  return (
    <div className="min-h-screen border-t-4 border-black bg-gradient-to-b from-fuchsia-50/50 via-white to-fuchsia-50/50 pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <button
          onClick={onBack}
          className="mb-6 font-y2k text-sm font-bold text-black hover:text-[#FF00FF] transition"
        >
          ← Back to shop
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border-4 border-black bg-gradient-to-br from-fuchsia-50 to-pink-50 shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
              {product.image ? (
                <img src={api.getImageUrl(product.image)} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-6xl text-[#FF00FF]/30">Outfit</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-y2k text-xs font-bold uppercase tracking-[0.3em] text-[#E6007E]">
              {product.category ?? 'Thrift'}
            </p>
            <h1 className="font-y2k text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">{product.name}</h1>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(rating) ? 'fill-current' : 'fill-black/20'}`}
                  />
                ))}
              </div>
              <span className="font-y2k text-sm font-bold text-black/70">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>

            <p className="font-y2k text-2xl font-black text-[#E6007E] sm:text-3xl">{api.formatPrice(product.price)}</p>

            <div className="flex items-center gap-2">
              <span className="rounded border-2 border-black bg-fuchsia-50/80 px-4 py-2 font-y2k text-sm font-bold text-black">
                {product.size}
              </span>
              <span className={`font-y2k text-sm font-bold ${product.status === 'Sold' ? 'text-black/50' : 'text-green-600'}`}>
                {product.status}
              </span>
            </div>

            <p className="font-y2k text-sm font-bold text-black/80">
              {product.description ?? 'Pre-loved thrifted clothing. Unique finds for your wardrobe.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={product.status === 'Sold'}
                className="rounded border-2 border-black bg-black px-6 py-3 font-y2k text-sm font-bold text-white shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:bg-[#FF00FF] hover:border-[#FF00FF] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to cart
              </button>
              <button
                onClick={() => onBuyNow(product.id)}
                disabled={product.status === 'Sold'}
                className="rounded border-2 border-black bg-white px-6 py-3 font-y2k text-sm font-bold text-black hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
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
