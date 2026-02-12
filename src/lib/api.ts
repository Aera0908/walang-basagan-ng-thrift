const API_BASE = '/api'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await res.text()
    if (text.startsWith('<!') || text.startsWith('<')) {
      throw new Error('Backend server may not be running. Start it with: npm run dev:server')
    }
    throw new Error(text || 'Request failed')
  }
  const data = await res.json()
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Request failed')
  return data as T
}

export interface User {
  id: number
  email: string
  username: string
  role: 'admin' | 'mod' | 'buyer'
  status?: 'active' | 'suspended' | 'banned'
  created_at: string
}

export async function login(email: string, password: string): Promise<{ user: User }> {
  return fetchJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function register(email: string, username: string, password: string, role: 'admin' | 'mod' | 'buyer' = 'buyer'): Promise<{ user: User }> {
  return fetchJson(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, role }),
  })
}

export function authHeaders(userId: number): Record<string, string> {
  return { 'X-User-Id': String(userId) }
}

export async function fetchAdminUsers(userId: number): Promise<{ users: User[] }> {
  return fetchJson(`${API_BASE}/admin/users`, { headers: authHeaders(userId) })
}

export async function createUser(userId: number, data: { email: string; username: string; password: string; role: 'mod' | 'buyer' }): Promise<{ user: User }> {
  return fetchJson(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify(data),
  })
}

export async function updateUserRole(userId: number, targetUserId: number, role: 'mod' | 'buyer'): Promise<{ user: User }> {
  return fetchJson(`${API_BASE}/admin/users/${targetUserId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({ role }),
  })
}

export async function updateUserStatus(userId: number, targetUserId: number, status: 'active' | 'suspended' | 'banned'): Promise<{ user: User }> {
  return fetchJson(`${API_BASE}/admin/users/${targetUserId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({ status }),
  })
}

export interface SupportThread {
  id: number
  user_id: number
  subject: string
  created_at: string
  assigned_to?: number | null
  user?: { username: string; email: string }
  assigned_to_user?: { username: string; email: string } | null
}

export interface SupportMessage {
  id: number
  thread_id: number
  sender_role: 'user' | 'admin'
  sender_id: number | null
  content: string
  created_at: string
}

export async function fetchAdminSupportThreads(userId: number): Promise<{ threads: SupportThread[] }> {
  return fetchJson(`${API_BASE}/admin/support/threads`, { headers: authHeaders(userId) })
}

export async function fetchAdminThreadMessages(userId: number, threadId: number): Promise<{ thread: SupportThread; messages: SupportMessage[] }> {
  return fetchJson(`${API_BASE}/admin/support/threads/${threadId}/messages`, { headers: authHeaders(userId) })
}

export async function sendAdminSupportMessage(userId: number, threadId: number, content: string): Promise<{ messages: SupportMessage[] }> {
  return fetchJson(`${API_BASE}/admin/support/threads/${threadId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({ content }),
  })
}

export async function assignSupportThread(userId: number, threadId: number, assignedTo: number | null): Promise<{ thread: SupportThread }> {
  return fetchJson(`${API_BASE}/admin/support/threads/${threadId}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({ assigned_to: assignedTo }),
  })
}

export async function fetchSupportThreads(userId: number): Promise<{ threads: SupportThread[] }> {
  return fetchJson(`${API_BASE}/support/threads`, { headers: authHeaders(userId) })
}

export async function createSupportThread(userId: number, subject: string): Promise<{ thread: SupportThread }> {
  return fetchJson(`${API_BASE}/support/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({ subject }),
  })
}

export async function fetchThreadMessages(userId: number, threadId: number): Promise<{ thread: SupportThread; messages: SupportMessage[] }> {
  return fetchJson(`${API_BASE}/support/threads/${threadId}/messages`, { headers: authHeaders(userId) })
}

export async function sendSupportMessage(userId: number, threadId: number, content: string): Promise<{ messages: SupportMessage[] }> {
  return fetchJson(`${API_BASE}/support/threads/${threadId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({ content }),
  })
}

export interface Product {
  id: number
  name: string
  price: number
  size: string
  status: 'Available' | 'Sold'
  category: string | null
  rating: number
  review_count: number
  description: string | null
  image?: string | null
  created_at: string
}

export interface ProductReview {
  id: number
  product_id: number
  username: string | null
  rating: number
  comment: string | null
  created_at: string
}

export async function fetchProducts(limit?: number): Promise<{ products: Product[] }> {
  const url = limit ? `${API_BASE}/products?limit=${limit}` : `${API_BASE}/products`
  return fetchJson(url)
}

export interface HomepageContent {
  hero_banners?: { id: string; title: string; subtitle: string; description: string; image: string }[]
  achievements_title?: string
  brand_intro?: { title?: string; headline: string; paragraph1: string; paragraph2: string; image?: string }
  cta?: { title: string; buttonText: string }
  about_us?: { title: string; headline: string; sub_text?: string; image?: string }
  trusted_section?: { title: string; review_ids?: number[] }
}

export async function fetchHomepage(): Promise<{ content: HomepageContent }> {
  return fetchJson(`${API_BASE}/homepage`)
}

export async function fetchReviews(ids: number[]): Promise<{ reviews: ProductReview[] }> {
  if (ids.length === 0) return { reviews: [] }
  return fetchJson(`${API_BASE}/reviews?ids=${ids.join(',')}`)
}

export async function fetchAdminReviews(userId: number): Promise<{ reviews: (ProductReview & { product_name?: string })[] }> {
  return fetchJson(`${API_BASE}/admin/reviews`, { headers: authHeaders(userId) })
}

export async function fetchAdminHomepage(userId: number): Promise<{ content: HomepageContent }> {
  return fetchJson(`${API_BASE}/admin/homepage`, { headers: authHeaders(userId) })
}

export async function updateHomepageSection(userId: number, sectionKey: string, content: unknown): Promise<{ section_key: string; content: unknown }> {
  return fetchJson(`${API_BASE}/admin/homepage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({ section_key: sectionKey, content }),
  })
}

export async function uploadHomepageImage(userId: number, file: File): Promise<{ filename: string }> {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(`${API_BASE}/admin/homepage/upload`, {
    method: 'POST',
    headers: authHeaders(userId),
    body: form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to upload image')
  return data as { filename: string }
}

export async function fetchAdminProducts(userId: number): Promise<{ products: Product[] }> {
  return fetchJson(`${API_BASE}/admin/products`, { headers: authHeaders(userId) })
}

export function getImageUrl(image: string | null | undefined): string {
  if (!image) return ''
  return image.startsWith('http') ? image : `/uploads/${image}`
}

export function formatPrice(price: number): string {
  return `P ${Number(price).toFixed(2)}`
}

export interface OrderItem {
  id?: number
  order_id?: number
  product_id: number
  quantity: number
  price_at_time: number
  product_name?: string
  product_image?: string | null
}

export interface Order {
  id: number
  user_id: number
  shipping_address: string
  payment_method: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
  user?: { username: string; email: string }
  items?: OrderItem[]
}

export async function createOrder(userId: number, data: { shipping_address: string; payment_method: string; items: { product_id: number; quantity: number }[] }): Promise<{ order: Order }> {
  return fetchJson(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify(data),
  })
}

export async function fetchUserOrders(userId: number): Promise<{ orders: Order[] }> {
  return fetchJson(`${API_BASE}/orders`, { headers: authHeaders(userId) })
}

export async function cancelUserOrder(userId: number, orderId: number): Promise<{ order: Order }> {
  return fetchJson(`${API_BASE}/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({}),
  })
}

export async function fetchAdminOrders(userId: number): Promise<{ orders: Order[] }> {
  return fetchJson(`${API_BASE}/admin/orders`, { headers: authHeaders(userId) })
}

export async function updateOrderStatus(userId: number, orderId: number, status: Order['status']): Promise<{ order: Order }> {
  return fetchJson(`${API_BASE}/admin/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify({ status }),
  })
}

export async function createProduct(userId: number, product: Partial<Product>, imageFile?: File): Promise<{ product: Product }> {
  if (imageFile) {
    const form = new FormData()
    form.append('name', product.name ?? '')
    form.append('price', String(product.price ?? 0))
    form.append('size', product.size ?? 'Free Size')
    form.append('status', product.status ?? 'Available')
    form.append('category', product.category ?? '')
    form.append('rating', String(product.rating ?? 0))
    form.append('review_count', String(product.review_count ?? 0))
    form.append('description', product.description ?? '')
    form.append('image', imageFile)
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: authHeaders(userId),
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to create product')
    return data as { product: Product }
  }
  return fetchJson(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify(product),
  })
}

export async function updateProduct(userId: number, id: number, product: Partial<Product>, imageFile?: File): Promise<{ product: Product }> {
  if (imageFile) {
    const form = new FormData()
    form.append('name', product.name ?? '')
    form.append('price', String(product.price ?? 0))
    form.append('size', product.size ?? 'Free Size')
    form.append('status', product.status ?? 'Available')
    form.append('category', product.category ?? '')
    form.append('rating', String(product.rating ?? 0))
    form.append('review_count', String(product.review_count ?? 0))
    form.append('description', product.description ?? '')
    form.append('image', imageFile)
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PATCH',
      headers: authHeaders(userId),
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to update product')
    return data as { product: Product }
  }
  return fetchJson(`${API_BASE}/admin/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(userId) },
    body: JSON.stringify(product),
  })
}

export async function fetchProductReviews(userId: number, productId: number): Promise<{ product: Product; reviews: ProductReview[] }> {
  return fetchJson(`${API_BASE}/admin/products/${productId}/reviews`, { headers: authHeaders(userId) })
}

export async function deleteProduct(userId: number, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(userId),
  })
  if (!res.ok) {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const data = await res.json()
      throw new Error((data as { error?: string }).error || 'Failed to delete product')
    }
    throw new Error('Failed to delete product')
  }
}
