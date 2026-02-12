import { useState, useEffect } from 'react'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import * as api from '../lib/api'
import type { Product } from '../lib/api'

const CATEGORIES = ['Top', 'Bottom', 'Set'] as const
type SortOption = 'name' | 'price_low' | 'price_high'

interface ProductsPageProps {
  onProductClick: (productId: string) => void
  onBack: () => void
}

function ProductsPage({ onProductClick, onBack }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [priceMin, setPriceMin] = useState<number | ''>('')
  const [priceMax, setPriceMax] = useState<number | ''>('')

  useEffect(() => {
    api.fetchProducts().then((res) => setProducts(res.products)).catch(() => setProducts([])).finally(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) => {
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !category || (p.category || '').toLowerCase() === category.toLowerCase()
    const min = priceMin === '' ? -Infinity : Number(priceMin)
    const max = priceMax === '' ? Infinity : Number(priceMax)
    const matchPrice = p.price >= min && p.price <= max
    return matchSearch && matchCategory && matchPrice
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'price_low') return a.price - b.price
    return b.price - a.price
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/80 via-white to-amber-50/60 pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-gray-600 hover:text-pink-500 transition"
        >
          ← Back to home
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Products</h1>

        {/* Filters bar - Shopee style */}
        <div className="mb-6 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 text-sm"
              />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Category:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Price:</span>
              <input
                type="number"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value === '' ? '' : e.target.valueAsNumber)}
                placeholder="Min"
                className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value === '' ? '' : e.target.valueAsNumber)}
                placeholder="Max"
                className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {sorted.length} product{sorted.length !== 1 ? 's' : ''} found
        </p>

        {/* Product grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
                <div className="aspect-[3/4] rounded-xl bg-gray-200" />
                <div className="mt-4 h-4 bg-gray-200 rounded" />
                <div className="mt-2 h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            No products match your filters. Try adjusting your search or filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((p) => (
              <article
                key={p.id}
                onClick={() => {
                  if (p.status !== 'Available') return
                  onProductClick(String(p.id))
                }}
                className={`group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 ${
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
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
                  <p className="text-pink-500 font-medium mt-1">{api.formatPrice(p.price)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.size}</p>
                  <p className="text-xs text-gray-500">{p.category || '—'}</p>
                  <div className="mt-1 flex items-center gap-1 text-amber-500 text-xs">
                    {'★'.repeat(Math.round(p.rating || 0))}{'☆'.repeat(5 - Math.round(p.rating || 0))}
                    <span className="text-gray-500">({p.review_count || 0})</span>
                  </div>
                  <p className={'mt-1 text-xs font-medium ' + (p.status === 'Sold' ? 'text-gray-400' : 'text-green-500')}>
                    {p.status === 'Sold' ? 'Item sold' : 'Available'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
