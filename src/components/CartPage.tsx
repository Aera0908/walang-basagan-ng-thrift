import { useState, useEffect } from 'react'
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa6'
import * as api from '../lib/api'
import type { Product } from '../lib/api'

export type CartItem = { productId: number; quantity: number }

interface CartPageProps {
  cartItems: CartItem[]
  onUpdateCart: (items: CartItem[]) => void
  onProceedToCheckout: (items: CartItem[]) => void
  onBack: () => void
}

function CartPage({ cartItems, onUpdateCart, onProceedToCheckout, onBack }: CartPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.fetchProducts().then((res) => setProducts(res.products)).catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    setSelectedIds((prev) => {
      const cartIds = new Set(cartItems.map((i) => i.productId))
      const next = new Set(prev)
      next.forEach((id) => {
        if (!cartIds.has(id)) next.delete(id)
      })
      if (next.size === 0 && cartIds.size > 0) return cartIds
      return next
    })
  }, [cartItems])

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
  const cartWithProducts = cartItems
    .map((i) => ({ ...i, product: productMap[i.productId] }))
    .filter((i) => i.product)

  const selectedItems = cartWithProducts.filter((i) => selectedIds.has(i.productId))
  const selectedTotal = selectedItems.reduce((sum, i) => sum + (i.product!.price * i.quantity), 0)
  const allSelected = cartWithProducts.length > 0 && cartWithProducts.every((i) => selectedIds.has(i.productId))

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(cartWithProducts.map((i) => i.productId)))
    }
  }

  const toggleSelect = (productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const updateQuantity = (productId: number, delta: number) => {
    onUpdateCart(
      cartItems
        .map((i) => {
          if (i.productId !== productId) return i
          const q = Math.max(1, i.quantity + delta)
          return { ...i, quantity: q }
        })
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (productId: number) => {
    onUpdateCart(cartItems.filter((i) => i.productId !== productId))
  }

  const handleProceed = () => {
    if (selectedItems.length === 0) return
    onProceedToCheckout(selectedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/80 via-white to-amber-50/60 pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-gray-600 hover:text-pink-500 transition"
        >
          ← Back to shop
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {cartWithProducts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Your cart is empty. Add some products to get started!
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <span className="font-semibold text-gray-800">Select all</span>
              </label>
            </div>

            <ul className="space-y-4 mb-8">
              {cartWithProducts.map((i) => (
                <li
                  key={i.productId}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <label className="flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(i.productId)}
                      onChange={() => toggleSelect(i.productId)}
                      className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />
                  </label>
                  <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-purple-50">
                    {i.product!.image ? (
                      <img
                        src={api.getImageUrl(i.product!.image)}
                        alt={i.product!.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-pink-200">
                        Outfit
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 truncate">{i.product!.name}</h3>
                    <p className="text-pink-500 font-medium mt-0.5">{api.formatPrice(i.product!.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(i.productId, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <FaMinus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[2rem] text-center font-medium">{i.quantity}</span>
                      <button
                        onClick={() => updateQuantity(i.productId, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <FaPlus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-semibold text-gray-800">
                      {api.formatPrice(i.product!.price * i.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(i.productId)}
                      className="text-gray-400 hover:text-red-500 transition"
                      title="Remove"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <span className="text-lg font-bold text-gray-900">{api.formatPrice(selectedTotal)}</span>
              </div>
              <button
                onClick={handleProceed}
                disabled={selectedItems.length === 0}
                className="w-full rounded-xl bg-pink-500 px-6 py-4 text-lg font-semibold text-white shadow hover:bg-pink-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
