import { useState, useEffect } from 'react'
import * as api from '../lib/api'
import type { Product } from '../lib/api'

interface AchievementsSectionProps {
  achievementsTitle?: string
  onProductClick?: (productId: string) => void
  onBrowseMoreClick?: () => void
  onLoginPrompt?: () => void
  isLoggedIn?: boolean
}

function AchievementsSection({ achievementsTitle = 'Some of Our Achievements', onProductClick, onBrowseMoreClick, onLoginPrompt, isLoggedIn }: AchievementsSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.fetchProducts(4).then((res) => {
      setProducts(res.products)
    }).catch(() => setProducts([])).finally(() => setLoading(false))
  }, [])

  const handleProductClick = (p: Product) => {
    if (p.status !== 'Available') return
    if (!isLoggedIn) {
      onLoginPrompt?.()
      return
    }
    onProductClick?.(String(p.id))
  }

  return (
    <section id="achievements" className="scroll-mt-20 bg-gradient-to-r from-sky-50 via-pink-50 to-yellow-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <span className="mx-auto block w-fit rounded-lg bg-pink-500 px-6 py-2 font-bold uppercase tracking-widest text-white">
          {achievementsTitle}
        </span>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-pink-100 bg-white p-4">
                <div className="aspect-[3/4] rounded-xl bg-gray-200" />
                <div className="mt-4 h-4 bg-gray-200 rounded" />
                <div className="mt-2 h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))
          ) : (
            products.slice(0, 4).map((p) => (
              <article
                key={p.id}
                onClick={() => handleProductClick(p)}
                className={`group overflow-hidden rounded-2xl border border-pink-100 bg-white shadow transition hover:-translate-y-1 hover:shadow-lg ${
                  p.status === 'Available' ? 'cursor-pointer' : 'cursor-default opacity-80'
                }`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                  {p.image ? (
                    <img src={api.getImageUrl(p.image)} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-pink-200">Outfit</div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-pink-500">{api.formatPrice(p.price)}</p>
                  <p className="text-xs text-gray-400">{p.size}</p>
                  <p className="text-xs text-gray-500">{p.category || '—'}</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-amber-500 text-xs">
                    {'★'.repeat(Math.round(p.rating || 0))}{'☆'.repeat(5 - Math.round(p.rating || 0))}
                    <span className="text-gray-500">({p.review_count || 0})</span>
                  </div>
                  <p className={'mt-1 text-xs font-medium ' + (p.status === 'Sold' ? 'text-gray-400' : 'text-green-500')}>
                    {p.status === 'Sold' ? 'Item sold' : 'Available'}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (!isLoggedIn) onLoginPrompt?.()
              else onBrowseMoreClick?.()
            }}
            className="text-pink-600 font-semibold underline hover:text-pink-700 transition"
          >
            Browse more products
          </button>
        </div>
      </div>
    </section>
  )
}

export default AchievementsSection
