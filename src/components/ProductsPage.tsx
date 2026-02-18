import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import * as api from '../lib/api'
import type { Product } from '../lib/api'

const CATEGORIES = ['Top', 'Bottom', 'Accessories'] as const
type SortOption = 'name' | 'price_low' | 'price_high'

interface ProductsPageProps {
  onProductClick: (productId: string) => void
  onBack: () => void
}

function ProductsPage({ onProductClick, onBack }: ProductsPageProps) {
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>(() => {
    const c = categoryFromUrl
    if (c && CATEGORIES.includes(c as (typeof CATEGORIES)[number])) return c
    return ''
  })
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [priceMin, setPriceMin] = useState<number | ''>('')
  const [priceMax, setPriceMax] = useState<number | ''>('')

  useEffect(() => {
    api.fetchProducts().then((res) => setProducts(res.products)).catch(() => setProducts([])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (categoryFromUrl && CATEGORIES.includes(categoryFromUrl as (typeof CATEGORIES)[number])) {
      setCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

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
    <div className="min-h-screen border-t-4 border-black bg-gradient-to-b from-fuchsia-50/80 via-white to-fuchsia-50/60 pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <button
          onClick={onBack}
          className="mb-6 font-y2k text-sm font-bold text-black hover:text-[#FF00FF] transition"
        >
          ← Back to home
        </button>

        <h1 className="font-y2k text-2xl font-black uppercase tracking-tight text-black mb-6">All Products</h1>

        {/* Filters bar - Y2K style */}
        <div className="mb-6 rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF00FF] text-sm"
              />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-y2k text-sm font-bold text-black">Category:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded border-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-y2k text-sm font-bold text-black">Price:</span>
              <input
                type="number"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value === '' ? '' : e.target.valueAsNumber)}
                placeholder="Min"
                className="w-24 rounded border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
              />
              <span className="text-black/60">—</span>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value === '' ? '' : e.target.valueAsNumber)}
                placeholder="Max"
                className="w-24 rounded border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="font-y2k text-sm font-bold text-black">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded border-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="font-y2k text-sm font-bold text-black mb-4">
          {sorted.length} product{sorted.length !== 1 ? 's' : ''} found
        </p>

        {/* Product grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                <div className="aspect-[3/4] rounded bg-black/10" />
                <div className="mt-4 h-4 bg-black/10 rounded" />
                <div className="mt-2 h-4 w-16 bg-black/10 rounded" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-lg border-2 border-black bg-white p-12 text-center font-y2k font-bold text-black shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
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
                className={`group overflow-hidden rounded-lg border-2 border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 ${
                  p.status === 'Available' ? 'cursor-pointer' : 'cursor-default opacity-80'
                }`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-fuchsia-50 to-pink-50">
                  {p.image ? (
                    <img src={api.getImageUrl(p.image)} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-[#FF00FF]/30">Outfit</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-y2k font-bold text-black truncate">{p.name}</h3>
                  <p className="text-[#E6007E] font-bold mt-1">{api.formatPrice(p.price)}</p>
                  <p className="text-xs text-black/70 mt-0.5">{p.size}</p>
                  <p className="text-xs text-black/60">{p.category || '—'}</p>
                  <div className="mt-1 flex items-center gap-1 text-amber-500 text-xs">
                    {'★'.repeat(Math.round(p.rating || 0))}{'☆'.repeat(5 - Math.round(p.rating || 0))}
                    <span className="text-black/60">({p.review_count || 0})</span>
                  </div>
                  <p className={'mt-1 text-xs font-bold ' + (p.status === 'Sold' ? 'text-black/50' : 'text-green-600')}>
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
