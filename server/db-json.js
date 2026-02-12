/**
 * JSON file fallback when better-sqlite3 fails (e.g. on Windows without build tools).
 * Uses the same interface as better-sqlite3 for compatibility.
 */
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const usersPath = path.join(dataDir, 'users.json')
const productsPath = path.join(dataDir, 'products.json')
const threadsPath = path.join(dataDir, 'support_threads.json')
const messagesPath = path.join(dataDir, 'support_messages.json')
const reviewsPath = path.join(dataDir, 'product_reviews.json')
const homepagePath = path.join(dataDir, 'homepage_content.json')
const ordersPath = path.join(dataDir, 'orders.json')
const orderItemsPath = path.join(dataDir, 'order_items.json')

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))
}

function loadProducts() {
  try {
    return JSON.parse(fs.readFileSync(productsPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveProducts(products) {
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2))
}

function loadThreads() {
  try {
    return JSON.parse(fs.readFileSync(threadsPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveThreads(threads) {
  fs.writeFileSync(threadsPath, JSON.stringify(threads, null, 2))
}

function loadMessages() {
  try {
    return JSON.parse(fs.readFileSync(messagesPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveMessages(messages) {
  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2))
}

function loadReviews() {
  try {
    return JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveReviews(reviews) {
  fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2))
}

function loadHomepage() {
  try {
    return JSON.parse(fs.readFileSync(homepagePath, 'utf-8'))
  } catch {
    return {}
  }
}

function saveHomepage(data) {
  fs.writeFileSync(homepagePath, JSON.stringify(data, null, 2))
}

function loadOrders() {
  try {
    return JSON.parse(fs.readFileSync(ordersPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveOrders(orders) {
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2))
}

function loadOrderItems() {
  try {
    return JSON.parse(fs.readFileSync(orderItemsPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveOrderItems(items) {
  fs.writeFileSync(orderItemsPath, JSON.stringify(items, null, 2))
}

// Seed homepage content from JSON if empty
const homepageData = loadHomepage()
if (Object.keys(homepageData).length === 0) {
  saveHomepage({
    achievements_title: 'Some of Our Achievements',
    hero_banners: [{ id: 'banner1', title: 'The concept', subtitle: 'Home - The concept', description: 'Dive into the Walang Basagan ng Thrift universe!', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop' }, { id: 'banner2', title: 'Y2K Collection', subtitle: 'Home - Collection', description: 'Explore our curated selection.', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop' }, { id: 'banner3', title: 'Vintage Finds', subtitle: 'Home - Vintage', description: 'Discover unique pre-loved clothing.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop' }],
    brand_intro: { title: 'Walang Basagan ng Thrift is ...', headline: 'The brand that brightens up your wardrobe!', paragraph1: 'We curate colorful and unique ensembles...', paragraph2: 'What is more, we hunt quality, iconic vintage clothing...', image: '' },
    cta: { title: 'Shop Y2K Thrift', buttonText: 'Browse Collection' },
    about_us: { title: 'About Us', headline: 'Walang Basagan ng Thrift', sub_text: 'We curate colorful and unique ensembles from pre-loved pieces inspired by early-2000s Filipino fashion icons. Our mission is to bring Y2K vibes to your wardrobe while promoting sustainable fashion through thrifting.', image: '' },
    trusted_section: { title: 'They Trusted Us', review_ids: [] },
  })
}

// Seed products from JSON if empty
let products = loadProducts()
if (products.length === 0) {
  try {
    const seedPath = path.join(__dirname, '..', 'src', 'data', 'products.json')
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'))
    products = seed.map((p, i) => ({
      id: i + 1,
      name: p.name,
      price: p.price,
      size: p.size || 'Free Size',
      status: p.status || 'Available',
      category: p.category || null,
      rating: p.rating ?? 0,
      review_count: p.reviewCount ?? 0,
      description: p.description || null,
      image: null,
      created_at: new Date().toISOString(),
    }))
    saveProducts(products)
  } catch {}
}

const db = {
  prepare(sql) {
    const isSelect = /^\s*SELECT/i.test(sql)
    const isInsert = /^\s*INSERT/i.test(sql)
    const isUpdate = /^\s*UPDATE/i.test(sql)
    const isDelete = /^\s*DELETE/i.test(sql)

    return {
      get(...args) {
        const users = loadUsers()
        const prods = loadProducts()
        if (sql.includes('FROM users') && sql.includes('WHERE id')) {
          const id = parseInt(args[0]) || args[0]
          const u = users.find((x) => x.id === id)
          if (!u) return null
          const { password_hash, ...rest } = u
          return { ...rest, status: rest.status || 'active' }
        }
        if (sql.includes('FROM users') && sql.includes('WHERE email')) {
          const u = users.find((x) => x.email === args[0])
          if (!u) return null
          return u
        }
        if (sql.includes('COUNT(*)') && sql.includes('users')) {
          return { c: users.length }
        }
        if (sql.includes('COUNT(*)') && sql.includes('products')) {
          return { c: prods.length }
        }
        if (sql.includes('FROM products') && sql.includes('WHERE id')) {
          const id = parseInt(args[0]) || args[0]
          return prods.find((p) => p.id === id) || null
        }
        if (sql.includes('FROM support_threads') && sql.includes('WHERE id')) {
          const threads = loadThreads()
          const id = parseInt(args[0]) || args[0]
          return threads.find((t) => t.id === id) || null
        }
        if (sql.includes('FROM homepage_content') && sql.includes('WHERE section_key')) {
          const data = loadHomepage()
          const section_key = args[0]
          if (!(section_key in data)) return null
          const content = data[section_key]
          return { section_key, content: typeof content === 'string' ? content : JSON.stringify(content) }
        }
        if (sql.includes('FROM orders') && sql.includes('WHERE id')) {
          const orders = loadOrders()
          const id = parseInt(args[0]) || args[0]
          return orders.find((o) => o.id === id) || null
        }
        return null
      },
      all(...args) {
        const users = loadUsers()
        const prods = loadProducts()
        if (sql.includes('FROM users')) {
          const byId = (a, b) => (a.id || 0) - (b.id || 0)
          const sorted = sql.includes('ORDER BY id ASC') ? [...users].sort(byId) : [...users].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
          return sorted.map(({ password_hash, ...u }) => ({ ...u, status: u.status || 'active' }))
        }
        if (sql.includes('FROM products')) {
          return prods.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        }
        if (sql.includes('FROM support_threads')) {
          const threads = loadThreads()
          return threads.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        }
        if (sql.includes('FROM support_messages') && sql.includes('WHERE thread_id')) {
          const messages = loadMessages()
          const threadId = parseInt(args[0]) || args[0]
          return messages.filter((m) => m.thread_id === threadId).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
        }
        if (sql.includes('FROM product_reviews')) {
          const reviews = loadReviews()
          if (sql.includes('WHERE product_id')) {
            const productId = parseInt(args[0]) || args[0]
            return reviews.filter((r) => r.product_id === productId).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
          }
          if (sql.includes('WHERE id IN') || sql.includes('id IN')) {
            const ids = args.map((a) => parseInt(a)).filter((n) => !isNaN(n))
            return reviews.filter((r) => ids.includes(r.id)).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
          }
          return reviews.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        }
        if (sql.includes('FROM homepage_content')) {
          const data = loadHomepage()
          return Object.entries(data).map(([section_key, content]) => ({
            section_key,
            content: typeof content === 'string' ? content : JSON.stringify(content),
          }))
        }
        if (sql.includes('FROM orders')) {
          const orders = loadOrders()
          const filtered = sql.includes('WHERE user_id') && args.length > 0
            ? orders.filter((o) => Number(o.user_id) === Number(args[0]))
            : orders
          return filtered.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        }
        if (sql.includes('FROM order_items') && sql.includes('WHERE order_id')) {
          const items = loadOrderItems()
          const orderId = parseInt(args[0]) || args[0]
          return items.filter((i) => i.order_id === orderId)
        }
        return []
      },
      run(...args) {
        const users = loadUsers()
        const prods = loadProducts()
        if (isInsert && sql.includes('users')) {
          const email = args[0]
          const username = args[1]
          const password_hash = args[2]
          const role = args[3]
          const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
          if (users.some((u) => u.email === email || u.username === username)) {
            throw new Error('UNIQUE constraint failed')
          }
          if (role === 'admin' && users.some((u) => u.role === 'admin')) {
            throw new Error('Only one admin account is allowed')
          }
          users.push({
            id: newId,
            email,
            username,
            password_hash,
            role,
            status: 'active',
            created_at: new Date().toISOString(),
          })
          saveUsers(users)
          return { lastInsertRowid: newId }
        }
        if (isInsert && sql.includes('products')) {
          const id = prods.length ? Math.max(...prods.map((p) => p.id)) + 1 : 1
          prods.push({
            id,
            name: args[0],
            price: args[1],
            size: args[2] || 'Free Size',
            status: args[3] || 'Available',
            category: args[4] || null,
            rating: args[5] ?? 0,
            review_count: args[6] ?? 0,
            description: args[7] || null,
            image: args[8] || null,
            created_at: new Date().toISOString(),
          })
          saveProducts(prods)
          return { lastInsertRowid: id }
        }
        if (isUpdate && sql.includes('users')) {
          const id = parseInt(args[args.length - 1]) || args[args.length - 1]
          const u = users.find((x) => x.id === id)
          if (!u) return { changes: 0 }
          if (sql.includes('status = ?')) {
            u.status = args[0]
          } else if (sql.includes('role = ?')) {
            const role = args[0]
            const wasAdmin = u.role === 'admin'
            if (role === 'admin' && users.some((x) => x.role === 'admin' && x.id !== id)) {
              throw new Error('Only one admin account is allowed')
            }
            if (wasAdmin && role !== 'admin' && users.filter((x) => x.role === 'admin').length <= 1) {
              throw new Error('Cannot remove the only admin account')
            }
            u.role = role
          }
          saveUsers(users)
          return { changes: 1 }
        }
        if (isUpdate && sql.includes('products')) {
          const id = args[args.length - 1]
          const p = prods.find((x) => x.id === id)
          if (!p) return { changes: 0 }
          const colMatches = sql.match(/(\w+)\s*=\s*\?/g) || []
          const cols = colMatches.map((m) => m.split('=')[0].trim())
          const vals = args.slice(0, -1)
          cols.forEach((col, i) => {
            if (vals[i] !== undefined) p[col] = vals[i]
          })
          saveProducts(prods)
          return { changes: 1 }
        }
        if (isDelete && sql.includes('product_reviews')) {
          const productId = parseInt(args[0])
          const reviews = loadReviews()
          const before = reviews.length
          const filtered = reviews.filter((r) => r.product_id !== productId)
          if (filtered.length < before) {
            saveReviews(filtered)
            return { changes: before - filtered.length }
          }
          return { changes: 0 }
        }
        if ((isInsert || sql.includes('INSERT')) && sql.includes('homepage_content')) {
          const data = loadHomepage()
          const section_key = args[0]
          const content = args[1]
          data[section_key] = content
          saveHomepage(data)
          return { changes: 1 }
        }
        if (isDelete && sql.includes('products')) {
          const id = parseInt(args[0])
          const idx = prods.findIndex((p) => p.id === id)
          if (idx < 0) return { changes: 0 }
          prods.splice(idx, 1)
          saveProducts(prods)
          const reviews = loadReviews().filter((r) => r.product_id !== id)
          saveReviews(reviews)
          return { changes: 1 }
        }
        if (isInsert && sql.includes('support_threads')) {
          const threads = loadThreads()
          const user_id = args[0]
          const subject = args[1]
          const newId = threads.length ? Math.max(...threads.map((t) => t.id)) + 1 : 1
          threads.push({
            id: newId,
            user_id,
            subject,
            created_at: new Date().toISOString(),
            assigned_to: null,
          })
          saveThreads(threads)
          return { lastInsertRowid: newId }
        }
        if (isUpdate && sql.includes('support_threads') && sql.includes('assigned_to')) {
          const threads = loadThreads()
          const assigned_to = args[0]
          const id = parseInt(args[args.length - 1]) || args[args.length - 1]
          const t = threads.find((x) => x.id === id)
          if (!t) return { changes: 0 }
          t.assigned_to = assigned_to
          saveThreads(threads)
          return { changes: 1 }
        }
        if (isInsert && sql.includes('support_messages')) {
          const messages = loadMessages()
          const thread_id = args[0]
          const sender_role = args[1]
          const sender_id = args[2]
          const content = args[3]
          const newId = messages.length ? Math.max(...messages.map((m) => m.id)) + 1 : 1
          messages.push({
            id: newId,
            thread_id,
            sender_role,
            sender_id: sender_id ?? null,
            content,
            created_at: new Date().toISOString(),
          })
          saveMessages(messages)
          return { lastInsertRowid: newId }
        }
        if (isInsert && sql.includes('orders')) {
          const orders = loadOrders()
          const user_id = args[0]
          const shipping_address = args[1]
          const payment_method = args[2]
          const status = args[3] || 'pending'
          const total_amount = args[4]
          const newId = orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1
          orders.push({
            id: newId,
            user_id,
            shipping_address,
            payment_method,
            status,
            total_amount,
            created_at: new Date().toISOString(),
          })
          saveOrders(orders)
          return { lastInsertRowid: newId }
        }
        if (isInsert && sql.includes('order_items')) {
          const items = loadOrderItems()
          const order_id = args[0]
          const product_id = args[1]
          const quantity = args[2] || 1
          const price_at_time = args[3]
          const newId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1
          items.push({
            id: newId,
            order_id,
            product_id,
            quantity,
            price_at_time,
          })
          saveOrderItems(items)
          return { lastInsertRowid: newId }
        }
        if (isUpdate && sql.includes('orders') && sql.includes('status = ?')) {
          const orders = loadOrders()
          const id = parseInt(args[args.length - 1]) || args[args.length - 1]
          const o = orders.find((x) => x.id === id)
          if (!o) return { changes: 0 }
          o.status = args[0]
          saveOrders(orders)
          return { changes: 1 }
        }
        return { changes: 0 }
      },
    }
  },
}

export default db
