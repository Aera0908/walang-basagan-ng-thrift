import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6'
import * as api from '../lib/api'
import type { User, Product } from '../lib/api'

type PaymentMethod = 'cod' | 'paypal' | 'maya' | null

interface CheckoutPageProps {
  user: User | null
  onPlaceOrder: (orderedItems: { productId: number; quantity: number }[]) => void
  onBack: () => void
  onGoToOrders?: () => void
}

function CheckoutPage({ user, onPlaceOrder, onBack, onGoToOrders }: CheckoutPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const checkoutItems = (location.state as { items?: { productId: number; quantity: number }[] })?.items ?? []

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [address, setAddress] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)

  useEffect(() => {
    if (checkoutItems.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [checkoutItems.length, navigate])

  useEffect(() => {
    api.fetchProducts().then((res) => setProducts(res.products)).catch(() => setProducts([]))
  }, [])

  if (checkoutItems.length === 0) {
    return null
  }

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
  const cartWithProducts = checkoutItems
    .map((i) => ({ ...i, product: productMap[i.productId] }))
    .filter((i) => i.product)
  const totalAmount = cartWithProducts.reduce((sum, i) => sum + (i.product!.price * i.quantity), 0)

  const handlePlaceOrder = async () => {
    if (!user) {
      setError('Please log in to place an order')
      return
    }
    if (!address.trim()) {
      setError('Please enter your shipping address')
      return
    }
    if (!paymentMethod) {
      setError('Please select a payment method')
      return
    }
    if (cartWithProducts.length === 0) {
      setError('Your cart is empty')
      return
    }
    setError('')
    setPlacing(true)
    try {
      await api.createOrder(user.id, {
        shipping_address: address.trim(),
        payment_method: paymentMethod,
        items: checkoutItems.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      })
      onPlaceOrder(checkoutItems)
      setOrderSuccess(true)
      setTimeout(() => {
        if (onGoToOrders) onGoToOrders()
        else onBack()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="mx-auto max-w-2xl px-6">
        <button
          onClick={() => navigate('/cart')}
          className="mb-6 text-sm text-gray-600 hover:text-pink-500 transition"
        >
          ← Back to cart
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            Please log in to place an order.
          </div>
        )}

        {orderSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl text-center">
              <FaCircleCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Order successful!</h3>
              <p className="text-gray-600 text-sm">Your order has been placed. Redirecting...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl text-center">
              <FaCircleXmark className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Order unsuccessful</h3>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <button
                onClick={() => setError('')}
                className="rounded-xl bg-gray-200 px-6 py-2.5 font-medium text-gray-800 hover:bg-gray-300 transition"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {cartWithProducts.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-pink-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order summary</h2>
            <ul className="space-y-2">
              {cartWithProducts.map((i) => (
                <li key={i.productId} className="flex justify-between text-sm">
                  <span>{i.product!.name} × {i.quantity}</span>
                  <span>{api.formatPrice(i.product!.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 pt-4 border-t border-gray-100 font-semibold flex justify-between">
              <span>Total</span>
              <span>{api.formatPrice(totalAmount)}</span>
            </p>
          </div>
        )}

        <div className="space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-pink-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address (street, barangay, city, province, postal code)"
              className="w-full rounded-xl border border-pink-200 px-4 py-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[120px] resize-none"
              rows={4}
            />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-pink-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>
            <p className="text-sm text-gray-500 mb-4">Select your preferred payment option</p>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 transition ${
                  paymentMethod === 'cod'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-200'
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-600">
                  COD
                </span>
                <span className="font-semibold text-gray-800">Cash on Delivery</span>
              </button>
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 transition ${
                  paymentMethod === 'paypal'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-200'
                }`}
              >
                <img src="/paypal-logo.svg" alt="PayPal" className="h-10 w-auto object-contain" />
                <span className="font-semibold text-gray-800">PayPal</span>
              </button>
              <button
                onClick={() => setPaymentMethod('maya')}
                className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 transition ${
                  paymentMethod === 'maya'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-200'
                }`}
              >
                <img src="/maya-logo.svg" alt="Maya" className="h-10 w-auto object-contain" />
                <span className="font-semibold text-gray-800">Maya (PayMaya)</span>
              </button>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing || orderSuccess || !user || cartWithProducts.length === 0}
            className="w-full rounded-xl bg-pink-500 px-6 py-4 text-lg font-semibold text-white shadow hover:bg-pink-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {placing ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
