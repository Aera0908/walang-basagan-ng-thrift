import { useState, useEffect, useMemo } from 'react'
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
  pending: 'bg-amber-100 text-amber-900',
  processing: 'bg-blue-100 text-blue-900',
  shipped: 'bg-indigo-100 text-indigo-900',
  delivered: 'bg-green-100 text-green-900',
  cancelled: 'bg-black/10 text-black/70',
}

// Shopee-style tab order: Pending first, Cancelled last
const STATUS_TABS: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

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
  const [orderToTrack, setOrderToTrack] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Order['status']>('pending')

  const ordersByStatus = useMemo(() => {
    const map: Record<Order['status'], Order[]> = {
      pending: [],
      processing: [],
      shipped: [],
      delivered: [],
      cancelled: [],
    }
    for (const o of orders) {
      map[o.status].push(o)
    }
    return map
  }, [orders])

  const filteredOrders = useMemo(
    () => ordersByStatus[selectedStatus] ?? [],
    [ordersByStatus, selectedStatus]
  )

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

  // Auto-select first tab with orders when current tab is empty
  useEffect(() => {
    if (loading || orders.length === 0) return
    if (filteredOrders.length > 0) return
    const firstWithOrders = STATUS_TABS.find((s) => (ordersByStatus[s] ?? []).length > 0)
    if (firstWithOrders) setSelectedStatus(firstWithOrders)
  }, [loading, orders.length, filteredOrders.length, ordersByStatus])

  return (
    <div className="min-h-screen border-t-4 border-black bg-gradient-to-b from-fuchsia-50/80 via-white to-fuchsia-50/60 pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <button
          onClick={onBack}
          className="mb-6 font-y2k text-sm font-bold text-black hover:text-[#FF00FF] transition"
        >
          ← Back to home
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-y2k text-2xl font-black uppercase tracking-tight text-black">My Orders</h1>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="font-y2k text-sm font-bold text-[#E6007E] hover:text-[#FF00FF] disabled:opacity-50 transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border-2 border-black bg-red-50 text-red-800 font-y2k text-sm font-bold shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            {error}
          </div>
        )}

        {/* Y2K-style status tabs */}
        {!loading && orders.length > 0 && (
          <div className="mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1 min-w-max sm:min-w-0 border-b-2 border-black pb-0">
              {STATUS_TABS.map((status) => {
                const count = (ordersByStatus[status] ?? []).length
                const isActive = selectedStatus === status
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`shrink-0 px-4 py-3 font-y2k text-sm font-bold whitespace-nowrap border-b-4 -mb-px transition ${
                      isActive
                        ? 'border-black text-black'
                        : 'border-transparent text-black/60 hover:text-black hover:border-black/30'
                    }`}
                  >
                    {STATUS_LABELS[status]}
                    {count > 0 && (
                      <span className={`ml-1.5 ${isActive ? 'text-black' : 'text-black/50'}`}>
                        ({count})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center font-y2k font-bold text-black">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border-2 border-black bg-white p-12 text-center shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            <p className="font-y2k font-bold text-black">You haven&apos;t placed any orders yet.</p>
            <button
              onClick={onBack}
              className="mt-4 font-y2k font-bold text-[#E6007E] hover:text-[#FF00FF] transition"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="rounded-lg border-2 border-black bg-white p-12 text-center shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                <p className="font-y2k font-bold text-black">No {STATUS_LABELS[selectedStatus].toLowerCase()} orders.</p>
                <p className="font-y2k text-sm font-bold text-black/70 mt-1">Select another tab to view orders.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border-2 border-black bg-white overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)] transition"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-fuchsia-50/50 border-b-2 border-black">
                  <div className="flex items-center gap-4">
                    <span className="font-y2k text-sm font-bold text-black">
                      Order #{order.id}
                    </span>
                    <span className="font-y2k text-sm font-bold text-black/70">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded border-2 border-black text-xs font-y2k font-bold ${
                      STATUS_COLORS[order.status]
                    }`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Order items */}
                <div className="divide-y-2 divide-black/10">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id ?? item.product_id}
                      className="flex gap-4 p-4"
                    >
                      <button
                        onClick={() => onProductClick(item.product_id)}
                        className="shrink-0 w-20 h-20 rounded border-2 border-black overflow-hidden bg-fuchsia-50/50"
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
                          className="font-y2k font-bold text-black hover:text-[#FF00FF] truncate block text-left transition"
                        >
                          {item.product_name || `Product #${item.product_id}`}
                        </button>
                        <p className="font-y2k text-sm font-bold text-black/70 mt-0.5">
                          Qty: {item.quantity} × {api.formatPrice(item.price_at_time)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-y2k font-bold text-[#E6007E]">
                          {api.formatPrice((item.price_at_time || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order footer */}
                <div className="flex justify-between items-center gap-4 px-4 py-3 bg-fuchsia-50/50 border-t-2 border-black">
                  <div className="flex items-center gap-3">
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button
                        onClick={() => setOrderToCancel(order)}
                        className="px-4 py-2 rounded border-2 border-black bg-red-50 text-red-800 font-y2k text-sm font-bold hover:bg-red-100 transition"
                      >
                        Cancel order
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => setOrderToTrack(order)}
                        className="px-4 py-2 rounded border-2 border-black bg-indigo-50 text-indigo-900 font-y2k text-sm font-bold hover:bg-indigo-100 transition"
                      >
                        Track order
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-y2k text-sm font-bold text-black">Total:</span>
                    <span className="font-y2k text-lg font-black text-[#E6007E]">
                      {api.formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Track order modal (dummy map) */}
      {orderToTrack && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={() => setOrderToTrack(null)}
        >
          <div
            className="w-full max-w-2xl rounded-lg border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-fuchsia-50/50">
              <h3 className="font-y2k font-bold text-black">Track Order #{orderToTrack.id}</h3>
              <button
                onClick={() => setOrderToTrack(null)}
                className="p-2 rounded border-2 border-black text-black hover:bg-black hover:text-white transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="font-y2k text-sm font-bold text-black/70 mb-3">
                Tracking preview — no actual tracking data. Map shown for demo only.
              </p>
              <div className="rounded-lg overflow-hidden border-2 border-black bg-black/5 aspect-video">
                <iframe
                  title="Order tracking map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=120.9%2C14.4%2C121.1%2C14.7&layer=mapnik&marker=14.5995%2C121.0"
                  className="w-full h-full min-h-[300px] border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel order confirmation modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="w-full max-w-sm rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
            <h3 className="font-y2k text-lg font-black text-black mb-2">Cancel order?</h3>
            <p className="font-y2k text-sm font-bold text-black/80 mb-6">
              Are you sure you want to cancel Order #{orderToCancel.id}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderToCancel(null)}
                disabled={cancelling}
                className="flex-1 rounded border-2 border-black px-4 py-2.5 font-y2k font-bold text-black hover:bg-black/5 disabled:opacity-50 transition"
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
                className="flex-1 rounded border-2 border-black bg-red-600 px-4 py-2.5 font-y2k font-bold text-white hover:bg-red-700 disabled:opacity-50 transition"
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
