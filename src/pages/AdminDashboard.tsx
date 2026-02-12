import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaUserGroup, FaBox, FaMagnifyingGlass, FaPlus, FaComments, FaBan, FaPause, FaCheck, FaHouse, FaTrash, FaChevronDown, FaCartShopping } from 'react-icons/fa6'
import minimalistLogo from '../assets/wbnt_minimalist.png'
import heroBanners from '../data/heroBanners.json'
import { useAuth } from '../context/AuthContext'
import * as api from '../lib/api'
import type { User, Product, ProductReview, SupportThread, SupportMessage, Order } from '../lib/api'

type HeroBanner = { id: string; title: string; subtitle: string; description: string; image: string }

type AdminTab = 'users' | 'products' | 'messages' | 'orders' | 'homepage'
const ADMIN_TABS: AdminTab[] = ['users', 'products', 'messages', 'orders', 'homepage']

function pathToTab(path: string): AdminTab | null {
  const match = path.match(/\/admin\/([^/]+)/)
  const seg = match?.[1]
  return seg && ADMIN_TABS.includes(seg as AdminTab) ? (seg as AdminTab) : null
}

function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pathTab = pathToTab(location.pathname)
  const tab: AdminTab = pathTab ?? 'products'

  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [threads, setThreads] = useState<SupportThread[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dismissError, setDismissError] = useState(false)
  const [searchUsers, setSearchUsers] = useState('')
  const [userForm, setUserForm] = useState<{ email: string; username: string; password: string; role: 'mod' | 'buyer' } | null>(null)
  const [productForm, setProductForm] = useState<Partial<Product> & { imageFile?: File } | null>(null)
  const [productModal, setProductModal] = useState<Product | null>(null)
  const [productReviews, setProductReviews] = useState<ProductReview[]>([])
  const [homepageContent, setHomepageContent] = useState<Record<string, unknown>>({})
  const [adminReviews, setAdminReviews] = useState<(api.ProductReview & { product_name?: string })[]>([])
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null)
  const [threadMessages, setThreadMessages] = useState<SupportMessage[]>([])
  const [replyContent, setReplyContent] = useState('')

  const load = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    setDismissError(false)
    try {
      const [pRes, tRes, oRes, hRes] = await Promise.all([
        api.fetchAdminProducts(user.id),
        api.fetchAdminSupportThreads(user.id),
        api.fetchAdminOrders(user.id).catch(() => ({ orders: [] })),
        api.fetchAdminHomepage(user.id).catch(() => ({ content: {} })),
      ])
      if (user.role === 'admin') {
        const uRes = await api.fetchAdminUsers(user.id)
        setUsers(uRes.users)
      } else {
        setUsers([])
      }
      setProducts(pRes.products)
      setThreads(tRes.threads)
      setOrders(oRes?.orders || [])
      setHomepageContent(hRes?.content || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user?.id])

  // Redirect /admin, /admin/, invalid path, or mod on /admin/users to default tab
  useEffect(() => {
    if (!user?.id) return
    const p = location.pathname
    if (p === '/admin' || p === '/admin/' || !pathTab) {
      navigate('/admin/products', { replace: true })
      return
    }
    if (user.role === 'mod' && pathTab === 'users') {
      navigate('/admin/products', { replace: true })
    }
  }, [location.pathname, user?.id, user?.role, pathTab, navigate])

  useEffect(() => {
    if (tab === 'homepage' && user?.id) {
      api.fetchAdminReviews(user.id).then((r) => setAdminReviews(r.reviews)).catch(() => setAdminReviews([]))
    }
  }, [tab, user?.id])

  const firstAdminId = users.find((u) => u.role === 'admin')?.id
  const isFirstAdmin = (id: number) => firstAdminId != null && id === firstAdminId

  const handleRoleChange = async (targetUser: User, newRole: 'mod' | 'buyer') => {
    if (!user?.id || isFirstAdmin(targetUser.id)) return
    setError('')
    setDismissError(false)
    try {
      const { user: updated } = await api.updateUserRole(user.id, targetUser.id, newRole)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  const handleStatusChange = async (targetUser: User, newStatus: 'active' | 'suspended' | 'banned') => {
    if (!user?.id || isFirstAdmin(targetUser.id)) return
    setError('')
    setDismissError(false)
    try {
      const { user: updated } = await api.updateUserStatus(user.id, targetUser.id, newStatus)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const handleCreateUser = async () => {
    if (!user?.id || !userForm) return
    if (!userForm.email.trim() || !userForm.username.trim() || !userForm.password) {
      setError('Email, username, and password are required')
      return
    }
    setError('')
    setDismissError(false)
    try {
      const { user: created } = await api.createUser(user.id, {
        email: userForm.email.trim(),
        username: userForm.username.trim(),
        password: userForm.password,
        role: userForm.role,
      })
      setUsers((prev) => [...prev, created])
      setUserForm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  const handleSaveProduct = async () => {
    if (!user?.id || !productForm) return
    setError('')
    setDismissError(false)
    try {
      if (productForm.id) {
        await api.updateProduct(user.id, productForm.id, productForm, productForm.imageFile)
      } else {
        await api.createProduct(user.id, productForm, productForm.imageFile)
      }
      setProductForm(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    }
  }

  const openProductModal = async (product: Product) => {
    setProductModal(product)
    setProductReviews([])
    if (!user?.id) return
    try {
      const { reviews } = await api.fetchProductReviews(user.id, product.id)
      setProductReviews(reviews)
    } catch {
      setProductReviews([])
    }
  }

  const loadThreadMessages = async (thread: SupportThread) => {
    if (!user?.id) return
    setSelectedThread(thread)
    setReplyContent('')
    setError('')
    setDismissError(false)
    try {
      const { thread: updatedThread, messages } = await api.fetchAdminThreadMessages(user.id, thread.id)
      setSelectedThread(updatedThread)
      setThreadMessages(messages)
      setThreads((prev) => prev.map((t) => (t.id === updatedThread.id ? updatedThread : t)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    }
  }

  const refreshThreadMessages = useCallback(async () => {
    if (!user?.id || !selectedThread) return
    try {
      const { thread: updatedThread, messages } = await api.fetchAdminThreadMessages(user.id, selectedThread.id)
      setSelectedThread(updatedThread)
      setThreadMessages(messages)
      setThreads((prev) => prev.map((t) => (t.id === updatedThread.id ? updatedThread : t)))
    } catch {
      // ignore poll errors
    }
  }, [user?.id, selectedThread?.id])

  useEffect(() => {
    if (tab !== 'messages' || !user?.id) return
    const interval = setInterval(() => {
      api.fetchAdminSupportThreads(user.id).then((r) => setThreads(r.threads)).catch(() => {})
      if (selectedThread) {
        refreshThreadMessages()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [tab, selectedThread?.id, user?.id, refreshThreadMessages])

  const handleSendReply = async () => {
    if (!user?.id || !selectedThread || !replyContent.trim()) return
    setError('')
    setDismissError(false)
    try {
      const { messages } = await api.sendAdminSupportMessage(user.id, selectedThread.id, replyContent.trim())
      setThreadMessages(messages)
      setReplyContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  const handleAssignThread = async (assignedTo: number | null) => {
    if (!user?.id || !selectedThread) return
    setError('')
    setDismissError(false)
    try {
      const { thread: updated } = await api.assignSupportThread(user.id, selectedThread.id, assignedTo)
      setSelectedThread(updated)
      setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign thread')
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!user?.id || !confirm('Delete this product?')) return
    setError('')
    setDismissError(false)
    try {
      await api.deleteProduct(user.id, id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUsers.toLowerCase())
  )

  if (user?.role !== 'admin' && user?.role !== 'mod') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow">
          <p className="text-red-600 font-semibold">Access denied. Admin or moderator only.</p>
          <button onClick={onBack} className="mt-4 text-pink-500 underline">Back to home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-gray-800 text-white flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <img src={minimalistLogo} alt="Walang Basagan ng Thrift" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{user?.email}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            Logout
            <FaArrowLeft className="h-3 w-3 rotate-180" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 w-56 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 pt-6 z-40">
        <p className="px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {user?.role === 'mod' ? 'Moderator' : 'Admin'} Dashboard
        </p>
        <nav className="mt-2">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin/users')}
              className={`flex items-center gap-3 w-full px-6 py-3 text-left transition ${
                tab === 'users' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaUserGroup className="h-5 w-5" />
              Users
            </button>
          )}
          <button
            onClick={() => navigate('/admin/products')}
            className={`flex items-center gap-3 w-full px-6 py-3 text-left transition ${
              tab === 'products' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaBox className="h-5 w-5" />
            Products
          </button>
          <button
            onClick={() => navigate('/admin/messages')}
            className={`flex items-center gap-3 w-full px-6 py-3 text-left transition ${
              tab === 'messages' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaComments className="h-5 w-5" />
            Messages
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className={`flex items-center gap-3 w-full px-6 py-3 text-left transition ${
              tab === 'orders' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaCartShopping className="h-5 w-5" />
            Orders
          </button>
          <button
            onClick={() => navigate('/admin/homepage')}
            className={`flex items-center gap-3 w-full px-6 py-3 text-left transition ${
              tab === 'homepage' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaHouse className="h-5 w-5" />
            Homepage
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 mt-14 p-8">
        {tab === 'users' ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Users Management</h1>

            {error && !dismissError && (
              <div className="mb-6 flex items-start justify-between gap-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-3">
                  <span className="text-red-500 text-xl">!</span>
                  <div>
                    <p className="font-semibold text-red-800">Data Fetch Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDismissError(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                />
              </div>
              <button
                onClick={() => setUserForm({ email: '', username: '', password: '', role: 'buyer' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
              >
                <FaPlus className="h-4 w-4" />
                Add New User
              </button>
            </div>

            {userForm && (
              <div className="mb-6 bg-white rounded-xl p-6 shadow border border-gray-200 space-y-4">
                <h3 className="font-semibold text-gray-900">New User</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(e) => setUserForm((u) => u ? { ...u, email: e.target.value } : null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <input
                    placeholder="Username"
                    value={userForm.username}
                    onChange={(e) => setUserForm((u) => u ? { ...u, username: e.target.value } : null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={userForm.password}
                    onChange={(e) => setUserForm((u) => u ? { ...u, password: e.target.value } : null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm((u) => u ? { ...u, role: e.target.value as 'mod' | 'buyer' } : null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="mod">Moderator</option>
                    <option value="buyer">User</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateUser} className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
                    Create User
                  </button>
                  <button onClick={() => setUserForm(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const status = u.status || 'active'
                      const statusClass =
                        status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : status === 'suspended'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      return (
                        <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">WBNT-{String(u.id).padStart(3, '0')}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{u.username}</p>
                              <p className="text-sm text-gray-500">{u.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value as 'mod' | 'buyer')}
                              disabled={isFirstAdmin(u.id)}
                              className="rounded border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {u.role === 'admin' && <option value="admin">Admin</option>}
                              <option value="mod">Moderator</option>
                              <option value="buyer">User</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                              {status === 'active' ? 'Active' : status === 'suspended' ? 'Suspended' : 'Banned'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isFirstAdmin(u.id) ? (
                              <span className="text-xs text-gray-400">—</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                {status !== 'banned' && (
                                  <button
                                    onClick={() => handleStatusChange(u, 'banned')}
                                    className="p-1.5 rounded text-red-500 hover:bg-red-50"
                                    title="Ban"
                                  >
                                    <FaBan className="h-4 w-4" />
                                  </button>
                                )}
                                {status !== 'suspended' && (
                                  <button
                                    onClick={() => handleStatusChange(u, 'suspended')}
                                    className="p-1.5 rounded text-amber-600 hover:bg-amber-50"
                                    title="Suspend"
                                  >
                                    <FaPause className="h-4 w-4" />
                                  </button>
                                )}
                                {status !== 'active' && (
                                  <button
                                    onClick={() => handleStatusChange(u, 'active')}
                                    className="p-1.5 rounded text-green-600 hover:bg-green-50"
                                    title="Activate"
                                  >
                                    <FaCheck className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
              {!loading && filteredUsers.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                  <span>Showing 1 to {filteredUsers.length} of {filteredUsers.length} results</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : tab === 'products' ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Products Management</h1>

            {error && !dismissError && (
              <div className="mb-6 flex items-start justify-between gap-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-3">
                  <span className="text-red-500 text-xl">!</span>
                  <div>
                    <p className="font-semibold text-red-800">Data Fetch Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDismissError(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="flex justify-end mb-6">
              <button
                onClick={() => setProductForm({ name: '', price: 0, size: 'Free Size', status: 'Available', category: '', description: '' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
              >
                <FaPlus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            {productForm && (
              <div className="mb-6 bg-white rounded-xl p-6 shadow border border-gray-200 space-y-4">
                <h3 className="font-semibold text-gray-900">{productForm.id ? 'Edit Product' : 'New Product'}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Product Image</label>
                    <label className="flex flex-col items-center justify-center w-full min-h-[180px] border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-purple-50/50 hover:bg-purple-50 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                        <svg className="w-12 h-12 mb-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-1 text-sm font-medium text-purple-700">Click to upload product image</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF or WEBP (max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProductForm((p) => p ? { ...p, imageFile: e.target.files?.[0] } : null)}
                        className="hidden"
                      />
                    </label>
                    {productForm.image && !productForm.imageFile && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Current image:</p>
                        <img src={api.getImageUrl(productForm.image)} alt="" className="h-24 rounded-lg object-cover border border-gray-200" />
                      </div>
                    )}
                    {productForm.imageFile && (
                      <p className="mt-3 text-sm font-medium text-green-600">✓ Image selected: {productForm.imageFile.name}</p>
                    )}
                  </div>
                  <input
                    placeholder="Name"
                    value={productForm.name ?? ''}
                    onChange={(e) => setProductForm((p) => p ? { ...p, name: e.target.value } : null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={productForm.price ?? ''}
                    onChange={(e) => setProductForm((p) => p ? { ...p, price: parseInt(e.target.value) || 0 } : null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <input
                    placeholder="Size"
                    value={productForm.size ?? ''}
                    onChange={(e) => setProductForm((p) => p ? { ...p, size: e.target.value } : null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <select
                    value={productForm.status ?? 'Available'}
                    onChange={(e) => setProductForm((p) => p ? { ...p, status: e.target.value as 'Available' | 'Sold' } : null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={productForm.category ?? ''}
                      onChange={(e) => setProductForm((p) => p ? { ...p, category: e.target.value } : null)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="">Select category</option>
                      <option value="Top">Top</option>
                      <option value="Bottom">Bottom</option>
                      <option value="Set">Set</option>
                    </select>
                  </div>
                </div>
                <textarea
                  placeholder="Description"
                  value={productForm.description ?? ''}
                  onChange={(e) => setProductForm((p) => p ? { ...p, description: e.target.value } : null)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProduct} className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
                    Save
                  </button>
                  <button onClick={() => setProductForm(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading ? (
                <div className="col-span-full py-12 text-center text-gray-500">Loading...</div>
              ) : (
                products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openProductModal(p)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-purple-200 transition text-left group"
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      {p.image ? (
                        <img src={api.getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">?</div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${p.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                      <p className="text-purple-600 font-medium mt-1">{api.formatPrice(p.price)}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Size: {p.size}</p>
                      <p className="text-sm text-gray-500">{p.category || '—'}</p>
                      <div className="flex items-center gap-1 mt-2 text-amber-500 text-sm">
                        {'★'.repeat(Math.round(p.rating || 0))}{'☆'.repeat(5 - Math.round(p.rating || 0))}
                        <span className="text-gray-500">({p.review_count || 0})</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {productModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setProductModal(null)}>
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <h2 className="text-xl font-bold text-gray-900">{productModal.name}</h2>
                      <button onClick={() => setProductModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
                    </div>
                    <div className="mt-4 flex gap-6">
                      <div className="w-48 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {productModal.image ? (
                          <img src={api.getImageUrl(productModal.image)} alt={productModal.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">?</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-purple-600 font-semibold text-lg">{api.formatPrice(productModal.price)}</p>
                        <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Size:</span> {productModal.size}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Status:</span> {productModal.status}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Category:</span> {productModal.category || '—'}</p>
                        <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Avg rating:</span> {'★'.repeat(Math.round(productModal.rating || 0))}{'☆'.repeat(5 - Math.round(productModal.rating || 0))} ({productModal.rating?.toFixed(1) || '0'})</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Reviews:</span> {productModal.review_count || 0}</p>
                        {productModal.description && (
                          <p className="text-sm text-gray-600 mt-2">{productModal.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Reviews</h3>
                      {productReviews.length === 0 ? (
                        <p className="text-sm text-gray-500">No reviews yet</p>
                      ) : (
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {productReviews.map((r) => (
                            <div key={r.id} className="text-sm p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{r.username || 'Anonymous'}</span>
                                <span className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                              </div>
                              {r.comment && <p className="text-gray-600 mt-1">{r.comment}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={() => { setProductForm({ ...productModal }); setProductModal(null); }}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { handleDeleteProduct(productModal.id); setProductModal(null); }}
                        className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : tab === 'messages' ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Service Messages</h1>

            {error && !dismissError && (
              <div className="mb-6 flex items-start justify-between gap-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-3">
                  <span className="text-red-500 text-xl">!</span>
                  <div>
                    <p className="font-semibold text-red-800">Data Fetch Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDismissError(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="flex gap-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">Support threads</p>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[400px]">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                  ) : threads.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No support threads yet</div>
                  ) : (
                    threads.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => loadThreadMessages(t)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                          selectedThread?.id === t.id ? 'bg-purple-50 border-l-2 border-l-purple-600' : ''
                        }`}
                      >
                        <p className="font-medium text-gray-900 truncate">{t.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t.user?.username || 'User'} • {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}
                        </p>
                        <p className="text-xs mt-0.5 text-purple-600">
                          {t.assigned_to_user ? `Assigned to ${t.assigned_to_user.username}` : 'Unassigned'}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                {selectedThread ? (
                  <>
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{selectedThread.subject}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedThread.user?.username || 'User'} • {selectedThread.user?.email || ''}
                        </p>
                        <p className="text-xs text-purple-600 mt-0.5">
                          {selectedThread.assigned_to_user ? `Assigned to ${selectedThread.assigned_to_user.username}` : 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {user?.role === 'admin' ? (
                          <select
                            value={selectedThread.assigned_to ?? ''}
                            onChange={(e) => {
                              const v = e.target.value
                              handleAssignThread(v === '' ? null : parseInt(v, 10))
                            }}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                          >
                            <option value="">Unassigned</option>
                            {users.filter((u) => u.role === 'mod').map((m) => (
                              <option key={m.id} value={m.id}>{m.username}</option>
                            ))}
                          </select>
                        ) : (
                          <>
                            {!selectedThread.assigned_to ? (
                              <button
                                onClick={() => user?.id && handleAssignThread(user.id)}
                                className="rounded-lg border border-purple-600 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50"
                              >
                                Assign to me
                              </button>
                            ) : selectedThread.assigned_to === user?.id ? (
                              <button
                                onClick={() => handleAssignThread(null)}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                              >
                                Unassign
                              </button>
                            ) : null}
                          </>
                        )}
                        <button
                          onClick={() => setSelectedThread(null)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[280px]">
                      {threadMessages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex ${m.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              m.sender_role === 'admin'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{m.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {m.sender_role === 'admin' ? 'You' : 'Customer'} • {new Date(m.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Type your reply..."
                          className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                          rows={2}
                        />
                        <button
                          onClick={handleSendReply}
                          disabled={!replyContent.trim()}
                          className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
                    Select a thread to view messages
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : tab === 'orders' ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

            {error && !dismissError && (
              <div className="mb-6 flex items-start justify-between gap-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-3">
                  <span className="text-red-500 text-xl">!</span>
                  <div>
                    <p className="font-semibold text-red-800">Data Fetch Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDismissError(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
                >
                  Dismiss
                </button>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                No orders yet. Orders will appear here when customers complete checkout.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">
                          {order.user?.username || 'Unknown'} · {order.user?.email || ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.created_at ? new Date(order.created_at).toLocaleString() : ''} · {api.formatPrice(order.total_amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            const status = e.target.value as Order['status']
                            if (!user?.id) return
                            setError('')
                            try {
                              const { order: updated } = await api.updateOrderStatus(user.id, order.id, status)
                              setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Failed to update')
                            }
                          }}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Shipping address</p>
                      <p className="text-sm text-gray-800">{order.shipping_address || '—'}</p>
                      <p className="text-xs text-gray-500 mt-1">Payment: {order.payment_method || '—'}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Items</p>
                      <ul className="space-y-1">
                        {(order.items || []).map((item) => (
                          <li key={item.id ?? item.product_id} className="text-sm text-gray-800 flex justify-between">
                            <span>{item.product_name || `Product #${item.product_id}`} × {item.quantity}</span>
                            <span>{api.formatPrice((item.price_at_time || 0) * (item.quantity || 1))}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === 'homepage' ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Homepage Content</h1>

            {error && !dismissError && (
              <div className="mb-6 flex items-start justify-between gap-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-3">
                  <span className="text-red-500 text-xl">!</span>
                  <div>
                    <p className="font-semibold text-red-800">Data Fetch Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDismissError(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="space-y-6 max-w-2xl">
              {/* Hero Section - first */}
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSections((s) => ({ ...s, hero: !s.hero }))}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">Hero Section (Slideshow)</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Edit slides: title, subtitle, description, and image.</p>
                  </div>
                  <FaChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${openSections.hero ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.hero ? 'max-h-[3000px]' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                {((homepageContent.hero_banners as HeroBanner[] | undefined)?.length
                  ? (homepageContent.hero_banners as HeroBanner[])
                  : (heroBanners as HeroBanner[])
                ).map((banner, i) => (
                  <div key={banner.id} className="mb-6 p-4 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-700">Slide {i + 1}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const banners = [...((homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[]))]
                          if (banners.length <= 1) return
                          banners.splice(i, 1)
                          setHomepageContent((c) => ({ ...c, hero_banners: banners }))
                        }}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                        title="Remove slide"
                      >
                        <FaTrash className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                      <input
                        value={banner.title}
                        onChange={(e) => {
                          const banners = [...((homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[]))]
                          banners[i] = { ...banners[i], title: e.target.value }
                          setHomepageContent((c) => ({ ...c, hero_banners: banners }))
                        }}
                        placeholder="Title"
                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                      <input
                        value={banner.subtitle}
                        onChange={(e) => {
                          const banners = [...((homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[]))]
                          banners[i] = { ...banners[i], subtitle: e.target.value }
                          setHomepageContent((c) => ({ ...c, hero_banners: banners }))
                        }}
                        placeholder="Subtitle"
                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <input
                        value={banner.description}
                        onChange={(e) => {
                          const banners = [...((homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[]))]
                          banners[i] = { ...banners[i], description: e.target.value }
                          setHomepageContent((c) => ({ ...c, hero_banners: banners }))
                        }}
                        placeholder="Description"
                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Image (upload or URL)</label>
                      <div className="flex gap-3 items-center flex-wrap">
                        <input
                          type="file"
                          accept="image/*"
                          className="flex-1 min-w-0 text-sm text-gray-600 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file || !user?.id) return
                            setError('')
                            try {
                              const { filename } = await api.uploadHomepageImage(user.id, file)
                              const banners = [...((homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[]))]
                              banners[i] = { ...banners[i], image: filename }
                              setHomepageContent((c) => ({ ...c, hero_banners: banners }))
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Failed to upload')
                            }
                            e.target.value = ''
                          }}
                        />
                        <span className="text-xs text-gray-500">or</span>
                        <input
                          value={banner.image}
                          onChange={(e) => {
                            const banners = [...((homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[]))]
                            banners[i] = { ...banners[i], image: e.target.value }
                            setHomepageContent((c) => ({ ...c, hero_banners: banners }))
                          }}
                          placeholder="Image URL"
                          className="flex-1 min-w-[140px] rounded border border-gray-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    {banner.image && (
                      <img src={api.getImageUrl(banner.image)} alt="" className="h-20 w-32 object-cover rounded border" />
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!user?.id) return
                        setError('')
                        try {
                          const banners = [...((homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[]))]
                          await api.updateHomepageSection(user.id, 'hero_banners', banners)
                          setHomepageContent((c) => ({ ...c, hero_banners: banners }))
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to save')
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                    >
                      Save this slide
                    </button>
                  </div>
                ))}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const banners = [...((homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[]))]
                      const nextNum = banners.length + 1
                      banners.push({
                        id: `banner${nextNum}`,
                        title: 'New slide',
                        subtitle: '',
                        description: '',
                        image: '',
                      })
                      setHomepageContent((c) => ({ ...c, hero_banners: banners }))
                    }}
                    className="px-4 py-2 rounded-lg border border-purple-600 text-purple-600 text-sm font-medium hover:bg-purple-50 flex items-center gap-2"
                  >
                    <FaPlus className="w-4 h-4" /> Add slide
                  </button>
                  <button
                    onClick={async () => {
                      if (!user?.id) return
                      setError('')
                      try {
                        const banners = (homepageContent.hero_banners as HeroBanner[]) || (heroBanners as HeroBanner[])
                        await api.updateHomepageSection(user.id, 'hero_banners', banners)
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to save')
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                  >
                    Save all hero banners
                  </button>
                </div>
                  </div>
                </div>
              </div>

              {/* Brand Intro Section */}
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSections((s) => ({ ...s, brandIntro: !s.brandIntro }))}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">Brand Intro Section</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Edit title, header, description, and model photo.</p>
                  </div>
                  <FaChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${openSections.brandIntro ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.brandIntro ? 'max-h-[2000px]' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      value={String((homepageContent.brand_intro as { title?: string })?.title || '')}
                      onChange={(e) => setHomepageContent((c) => ({ ...c, brand_intro: { ...(c.brand_intro as object || {}), title: e.target.value } }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                      placeholder="Walang Basagan ng Thrift is ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
                    <input
                      value={String((homepageContent.brand_intro as { headline?: string })?.headline || '')}
                      onChange={(e) => setHomepageContent((c) => ({ ...c, brand_intro: { ...(c.brand_intro as object || {}), headline: e.target.value } }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                      placeholder="The brand that brightens up your wardrobe!"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (paragraph 1)</label>
                    <textarea
                      value={String((homepageContent.brand_intro as { paragraph1?: string })?.paragraph1 || '')}
                      onChange={(e) => setHomepageContent((c) => ({ ...c, brand_intro: { ...(c.brand_intro as object || {}), paragraph1: e.target.value } }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                      rows={3}
                      placeholder="We curate colorful and unique ensembles..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (paragraph 2)</label>
                    <textarea
                      value={String((homepageContent.brand_intro as { paragraph2?: string })?.paragraph2 || '')}
                      onChange={(e) => setHomepageContent((c) => ({ ...c, brand_intro: { ...(c.brand_intro as object || {}), paragraph2: e.target.value } }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                      rows={3}
                      placeholder="What is more, we hunt quality..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Photo</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="flex-1 text-sm text-gray-600 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file || !user?.id) return
                          setError('')
                          try {
                            const { filename } = await api.uploadHomepageImage(user.id, file)
                            setHomepageContent((c) => ({ ...c, brand_intro: { ...(c.brand_intro as object || {}), image: filename } }))
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to upload')
                          }
                          e.target.value = ''
                        }}
                      />
                      <span className="text-xs text-gray-500">or</span>
                      <input
                        value={String((homepageContent.brand_intro as { image?: string })?.image || '')}
                        onChange={(e) => setHomepageContent((c) => ({ ...c, brand_intro: { ...(c.brand_intro as object || {}), image: e.target.value } }))}
                        placeholder="Image URL"
                        className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    {(homepageContent.brand_intro as { image?: string })?.image && (
                      <img src={api.getImageUrl((homepageContent.brand_intro as { image?: string }).image)} alt="" className="mt-2 h-24 w-32 object-cover rounded border" />
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (!user?.id) return
                      setError('')
                      try {
                        await api.updateHomepageSection(user.id, 'brand_intro', homepageContent.brand_intro)
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to save')
                      }
                    }}
                    className="mt-3 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                  >
                    Save Brand Intro
                  </button>
                  </div>
                </div>
              </div>

              {/* About Us Section */}
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSections((s) => ({ ...s, aboutUs: !s.aboutUs }))}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">About Us Section</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Edit title, headline, sub text, and image.</p>
                  </div>
                  <FaChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${openSections.aboutUs ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.aboutUs ? 'max-h-[2000px]' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      value={String((homepageContent.about_us as { title?: string })?.title || '')}
                      onChange={(e) => setHomepageContent((c) => ({ ...c, about_us: { ...(c.about_us as object || {}), title: e.target.value } }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                      placeholder="About Us"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                    <input
                      value={String((homepageContent.about_us as { headline?: string })?.headline || '')}
                      onChange={(e) => setHomepageContent((c) => ({ ...c, about_us: { ...(c.about_us as object || {}), headline: e.target.value } }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                      placeholder="Walang Basagan ng Thrift"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub text</label>
                    <textarea
                      value={String((homepageContent.about_us as { sub_text?: string })?.sub_text || '')}
                      onChange={(e) => setHomepageContent((c) => ({ ...c, about_us: { ...(c.about_us as object || {}), sub_text: e.target.value } }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                      rows={4}
                      placeholder="We curate colorful and unique ensembles..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image (upload or URL)</label>
                    <div className="flex gap-3 items-center flex-wrap">
                      <input
                        type="file"
                        accept="image/*"
                        className="flex-1 min-w-0 text-sm text-gray-600 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file || !user?.id) return
                          setError('')
                          try {
                            const { filename } = await api.uploadHomepageImage(user.id, file)
                            setHomepageContent((c) => ({ ...c, about_us: { ...(c.about_us as object || {}), image: filename } }))
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to upload')
                          }
                          e.target.value = ''
                        }}
                      />
                      <span className="text-xs text-gray-500">or</span>
                      <input
                        value={String((homepageContent.about_us as { image?: string })?.image || '')}
                        onChange={(e) => setHomepageContent((c) => ({ ...c, about_us: { ...(c.about_us as object || {}), image: e.target.value } }))}
                        placeholder="Image URL"
                        className="flex-1 min-w-[140px] rounded border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    {(homepageContent.about_us as { image?: string })?.image && (
                      <img src={api.getImageUrl((homepageContent.about_us as { image?: string }).image)} alt="" className="mt-2 h-24 w-32 object-cover rounded border" />
                    )}
                  </div>
                  <button
                  onClick={async () => {
                    if (!user?.id) return
                    setError('')
                    try {
                      await api.updateHomepageSection(user.id, 'about_us', homepageContent.about_us)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to save')
                    }
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                >
                  Save About Us
                </button>
                  </div>
                </div>
              </div>

              {/* Trusted Section */}
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSections((s) => ({ ...s, trusted: !s.trusted }))}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">Trusted Section</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Select product reviews to feature in &quot;They Trusted Us&quot;.</p>
                  </div>
                  <FaChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${openSections.trusted ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.trusted ? 'max-h-[2000px]' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                  <input
                    value={String((homepageContent.trusted_section as { title?: string })?.title || '')}
                    onChange={(e) => setHomepageContent((c) => ({ ...c, trusted_section: { ...(c.trusted_section as object || {}), title: e.target.value } }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                    placeholder="They Trusted Us"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Reviews (select from product reviews)</label>
                  {adminReviews.length === 0 ? (
                    <p className="text-sm text-gray-500">No product reviews yet. Reviews appear when customers rate products.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto rounded border border-gray-200 p-3">
                      {adminReviews.map((r) => {
                        const reviewIds = (homepageContent.trusted_section as { review_ids?: number[] })?.review_ids || []
                        const checked = reviewIds.includes(r.id)
                        return (
                          <label key={r.id} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const current = (homepageContent.trusted_section as { review_ids?: number[] })?.review_ids || []
                                const next = checked ? current.filter((id) => id !== r.id) : [...current, r.id]
                                setHomepageContent((c) => ({ ...c, trusted_section: { ...(c.trusted_section as object || {}), review_ids: next } }))
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                              <p className="text-sm text-gray-800 truncate">{r.comment || 'No comment'}</p>
                              <p className="text-xs text-gray-500">@{r.username || 'Customer'} · {r.product_name || `Product #${r.product_id}`}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (!user?.id) return
                    setError('')
                    try {
                      await api.updateHomepageSection(user.id, 'trusted_section', homepageContent.trusted_section)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to save')
                    }
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                >
                  Save Trusted Section
                </button>
                  </div>
                </div>
              </div>

              {/* Footer Socials */}
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSections((s) => ({ ...s, footerSocials: !s.footerSocials }))}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">Footer Socials</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Upload images for Facebook, Instagram, TikTok profile modals.</p>
                  </div>
                  <FaChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${openSections.footerSocials ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.footerSocials ? 'max-h-[1200px]' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100 space-y-6">
                    {(['facebook', 'instagram', 'tiktok'] as const).map((social) => {
                      const socialData = (homepageContent.footer_socials || {})[social] as { image?: string } | undefined
                      const image = socialData?.image || ''
                      return (
                        <div key={social} className="p-4 rounded-lg border border-gray-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{social}</label>
                          <div className="flex gap-3 items-start flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex gap-2 items-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="text-sm text-gray-600 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || !user?.id) return
                                    setError('')
                                    try {
                                      const { filename } = await api.uploadHomepageImage(user.id, file)
                                      setHomepageContent((c) => ({
                                        ...c,
                                        footer_socials: {
                                          ...(c.footer_socials || {}),
                                          [social]: { image: filename },
                                        },
                                      }))
                                    } catch (err) {
                                      setError(err instanceof Error ? err.message : 'Failed to upload')
                                    }
                                    e.target.value = ''
                                  }}
                                />
                                <span className="text-xs text-gray-500">or URL:</span>
                                <input
                                  value={image}
                                  onChange={(e) =>
                                    setHomepageContent((c) => ({
                                      ...c,
                                      footer_socials: {
                                        ...(c.footer_socials || {}),
                                        [social]: { image: e.target.value },
                                      },
                                    }))
                                  }
                                  placeholder="Image URL"
                                  className="flex-1 min-w-[120px] rounded border border-gray-200 px-3 py-2 text-sm"
                                />
                              </div>
                              {image && (
                                <img
                                  src={api.getImageUrl(image)}
                                  alt=""
                                  className="mt-2 h-24 w-32 object-cover rounded border"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <button
                      onClick={async () => {
                        if (!user?.id) return
                        setError('')
                        try {
                          await api.updateHomepageSection(user.id, 'footer_socials', homepageContent.footer_socials || {})
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to save')
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                    >
                      Save Footer Socials
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default AdminDashboard
