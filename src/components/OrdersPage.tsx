import { useState, useEffect } from 'react'
import * as api from '../lib/api'
import type { Order } from '../lib/api'

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-700',
}

interface OrdersPageProps {
  userId: number
  onBack: () => void
  onProductClick: (id: number) => void
}

function OrdersPage({ userId, onBack, onProductClick }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const loadOrders = () => {
    setLoading(true)
    setError(null)
    api
      .fetchUserOrders(userId)
      .then((res) => {
        setOrders(res.orders)
      })
      .catch((err) => {
        setOrders([])
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [userId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/80 via-white to-amber-50/60 pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-gray-600 hover:text-pink-500 transition"
        >
          ← Back to home
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="text-sm text-pink-500 font-medium hover:text-pink-600 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
            <button
              onClick={onBack}
              className="mt-4 text-pink-500 font-semibold hover:text-pink-600"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">
                      Order #{order.id}
                    </span>
                    <span className="text-sm text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      STATUS_COLORS[order.status]
                    }`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Order items */}
                <div className="divide-y divide-gray-100">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id ?? item.product_id}
                      className="flex gap-4 p-4"
                    >
                      <button
                        onClick={() => onProductClick(item.product_id)}
                        className="shrink-0 w-20 h-20 rounded-lg bg-gray-100 overflow-hidden border border-gray-200"
                      >
                        {item.product_image ? (
                          <img
                            src={api.getImageUrl(item.product_image)}
                            alt={item.product_name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                            ?
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => onProductClick(item.product_id)}
                          className="font-medium text-gray-900 hover:text-pink-500 truncate block text-left"
                        >
                          {item.product_name || `Product #${item.product_id}`}
                        </button>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Qty: {item.quantity} × {api.formatPrice(item.price_at_time)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-pink-600">
                          {api.formatPrice((item.price_at_time || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order footer */}
                <div className="flex justify-between items-center gap-4 px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div>
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button
                        onClick={() => setOrderToCancel(order)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Cancel order
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-lg font-bold text-pink-600">
                      {api.formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel order confirmation modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel order?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to cancel Order #{orderToCancel.id}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderToCancel(null)}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Keep order
              </button>
              <button
                onClick={async () => {
                  if (!orderToCancel) return
                  setCancelling(true)
                  try {
                    const { order: updated } = await api.cancelUserOrder(userId, orderToCancel.id)
                    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
                    setOrderToCancel(null)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to cancel order')
                  } finally {
                    setCancelling(false)
                  }
                }}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
