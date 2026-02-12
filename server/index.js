import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext.toLowerCase()) ? ext : '.jpg'
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}${safeExt}`
    cb(null, unique)
  },
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// Try better-sqlite3 first; fall back to JSON file store if it fails (e.g. Windows without build tools)
// Set USE_JSON_DB=1 to force JSON mode
let db
if (process.env.USE_JSON_DB === '1') {
  console.log('Using JSON file store (USE_JSON_DB=1)')
  const dbJson = await import('./db-json.js')
  db = dbJson.default
} else {
  try {
    const dbModule = await import('./db.js')
    db = dbModule.default
    console.log('Using SQLite database')
  } catch (err) {
    console.warn('SQLite unavailable:', err.message)
    console.warn('Using JSON file store instead. Run "npm run seed:admin:json" to create admin.')
    const dbJson = await import('./db-json.js')
    db = dbJson.default
  }
}

const app = express()
const PORT = parseInt(process.env.PORT || '3002', 10)

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

// Admin middleware: require X-User-Id header and admin role
const requireAdmin = (req, res, next) => {
  const userId = req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(userId)
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
  req.adminUser = user
  next()
}

// Admin or Mod middleware (for products)
const requireAdminOrMod = (req, res, next) => {
  const userId = req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(userId)
  if (!user || (user.role !== 'admin' && user.role !== 'mod')) return res.status(403).json({ error: 'Admin or moderator access required' })
  req.adminUser = user
  next()
}

// Auth middleware: require X-User-Id (any logged-in user)
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const user = db.prepare('SELECT id, role, status FROM users WHERE id = ?').get(userId)
  if (!user) return res.status(401).json({ error: 'User not found' })
  if (user.status === 'banned' || user.status === 'suspended') {
    return res.status(403).json({ error: 'Account is ' + user.status })
  }
  req.authUser = user
  next()
}

// --- Auth routes ---

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, username, password, role = 'buyer' } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' })
    }

    if (!['admin', 'mod', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be: admin, mod, or buyer' })
    }

    const passwordHash = bcrypt.hashSync(password, 10)

    const stmt = db.prepare(`
      INSERT INTO users (email, username, password_hash, role)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(email, username, passwordHash, role)

    const user = db.prepare('SELECT id, email, username, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid)

    res.status(201).json({ user: { ...user, password: undefined } })
  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email or username already exists' })
    }
    if (err.message?.includes('Only one admin')) {
      return res.status(409).json({ error: 'Only one admin account is allowed' })
    }
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = db.prepare('SELECT id, email, username, password_hash, role, status, created_at FROM users WHERE email = ?').get(email)

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const status = user.status || 'active'
    if (status === 'banned') {
      return res.status(403).json({ error: 'Your account has been banned' })
    }
    if (status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended' })
    }

    const valid = bcrypt.compareSync(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const { password_hash, ...safeUser } = user
    res.json({ user: safeUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get user by id (for session check)
app.get('/api/auth/me/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, username, role, created_at FROM users WHERE id = ?').get(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// --- Admin routes (admin only) ---

// List all users (with status)
app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, email, username, role, status, created_at FROM users ORDER BY id ASC').all()
    res.json({ users })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Update user role (cannot change first admin)
app.patch('/api/admin/users/:id/role', requireAdmin, (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    if (!['mod', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Can only set Moderator or User' })
    }
    const firstAdmin = db.prepare('SELECT id FROM users WHERE role = ? ORDER BY id ASC LIMIT 1').get('admin')
    if (firstAdmin && String(firstAdmin.id) === String(id)) {
      return res.status(403).json({ error: 'Cannot change the first admin account' })
    }
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id)
    const user = db.prepare('SELECT id, email, username, role, status, created_at FROM users WHERE id = ?').get(id)
    res.json({ user })
  } catch (err) {
    if (err.message?.includes('Only one admin') || err.message?.includes('Cannot remove')) {
      return res.status(409).json({ error: err.message })
    }
    console.error(err)
    res.status(500).json({ error: 'Failed to update role' })
  }
})

// Create user (admin only, role must be mod or buyer)
app.post('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const { email, username, password, role = 'buyer' } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' })
    }

    if (!['mod', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be Moderator or User' })
    }

    const passwordHash = bcrypt.hashSync(password, 10)

    const stmt = db.prepare(`
      INSERT INTO users (email, username, password_hash, role)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(email, username, passwordHash, role)

    const user = db.prepare('SELECT id, email, username, role, status, created_at FROM users WHERE id = ?').get(result.lastInsertRowid)

    res.status(201).json({ user })
  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email or username already exists' })
    }
    console.error(err)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Update user status (ban, suspend, activate)
app.patch('/api/admin/users/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const firstAdmin = db.prepare('SELECT id FROM users WHERE role = ? ORDER BY id ASC LIMIT 1').get('admin')
    if (firstAdmin && String(firstAdmin.id) === String(id)) {
      return res.status(403).json({ error: 'Cannot change the first admin account' })
    }
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id)
    const user = db.prepare('SELECT id, email, username, role, status, created_at FROM users WHERE id = ?').get(id)
    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

// List all products
app.get('/api/admin/products', requireAdminOrMod, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all()
    res.json({ products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Create product (with optional image)
app.post('/api/admin/products', requireAdminOrMod, upload.single('image'), (req, res) => {
  try {
    const { name, price, size = 'Free Size', status = 'Available', category, rating = 0, review_count = 0, description } = req.body
    if (!name || price == null) return res.status(400).json({ error: 'Name and price are required' })
    const image = req.file ? req.file.filename : null
    const stmt = db.prepare(`
      INSERT INTO products (name, price, size, status, category, rating, review_count, description, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(name, parseInt(price), size, status, category || null, parseFloat(rating) || 0, parseInt(review_count) || 0, description || null, image)
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json({ product })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// Update product (with optional image)
app.patch('/api/admin/products/:id', requireAdminOrMod, upload.single('image'), (req, res) => {
  try {
    const { id } = req.params
    const { name, price, size, status, category, rating, review_count, description } = req.body
    const existing = db.prepare('SELECT id, image FROM products WHERE id = ?').get(id)
    if (!existing) return res.status(404).json({ error: 'Product not found' })
    const updates = []
    const values = []
    if (name !== undefined) { updates.push('name = ?'); values.push(name) }
    if (price !== undefined) { updates.push('price = ?'); values.push(parseInt(price)) }
    if (size !== undefined) { updates.push('size = ?'); values.push(size) }
    if (status !== undefined) { updates.push('status = ?'); values.push(status) }
    if (category !== undefined) { updates.push('category = ?'); values.push(category) }
    if (rating !== undefined) { updates.push('rating = ?'); values.push(parseFloat(rating)) }
    if (review_count !== undefined) { updates.push('review_count = ?'); values.push(parseInt(review_count)) }
    if (description !== undefined) { updates.push('description = ?'); values.push(description) }
    if (req.file) {
      updates.push('image = ?')
      values.push(req.file.filename)
      if (existing.image) {
        const oldPath = path.join(uploadsDir, existing.image)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' })
    values.push(id)
    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values)
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    res.json({ product })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Get product reviews
app.get('/api/admin/products/:id/reviews', requireAdminOrMod, (req, res) => {
  try {
    const { id } = req.params
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    const reviews = db.prepare('SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC').all(id)
    res.json({ product, reviews })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

// Delete product
app.delete('/api/admin/products/:id', requireAdminOrMod, (req, res) => {
  try {
    const { id } = req.params
    const existing = db.prepare('SELECT image FROM products WHERE id = ?').get(id)
    if (existing?.image) {
      const imgPath = path.join(uploadsDir, existing.image)
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
    }
    db.prepare('DELETE FROM product_reviews WHERE product_id = ?').run(id)
    db.prepare('DELETE FROM order_items WHERE product_id = ?').run(id)
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id)
    if (result.changes === 0) return res.status(404).json({ error: 'Product not found' })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// --- Support / Customer Service (admin) ---
app.get('/api/admin/support/threads', requireAdminOrMod, (req, res) => {
  try {
    const { id: currentId, role } = req.adminUser
    const allUsers = db.prepare('SELECT id, username, email, role FROM users').all()
    const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]))
    let threads = db.prepare('SELECT * FROM support_threads ORDER BY created_at DESC').all()
    // Only threads where the customer (thread user) has role 'buyer'
    threads = threads.filter((t) => {
      const customer = userMap[t.user_id]
      return customer && customer.role === 'buyer'
    })
    // Mod: only unassigned or assigned to self. Admin: all
    if (role === 'mod') {
      threads = threads.filter((t) => t.assigned_to == null || t.assigned_to === currentId)
    }
    const enriched = threads.map((t) => ({
      ...t,
      user: userMap[t.user_id] || { username: 'Unknown', email: '' },
      assigned_to_user: t.assigned_to ? userMap[t.assigned_to] : null,
    }))
    res.json({ threads: enriched })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch threads' })
  }
})

app.get('/api/admin/support/threads/:id/messages', requireAdminOrMod, (req, res) => {
  try {
    const { id } = req.params
    const { id: currentId, role } = req.adminUser
    const thread = db.prepare('SELECT * FROM support_threads WHERE id = ?').get(id)
    if (!thread) return res.status(404).json({ error: 'Thread not found' })
    // Only buyer threads
    const customer = db.prepare('SELECT role FROM users WHERE id = ?').get(thread.user_id)
    if (!customer || customer.role !== 'buyer') return res.status(403).json({ error: 'Can only message customer accounts' })
    // Mod: must be unassigned or assigned to self. Admin: all
    if (role === 'mod') {
      if (thread.assigned_to != null && thread.assigned_to !== currentId) {
        return res.status(403).json({ error: 'This thread is assigned to another moderator' })
      }
      if (thread.assigned_to == null) {
        db.prepare('UPDATE support_threads SET assigned_to = ? WHERE id = ?').run(currentId, id)
        thread.assigned_to = currentId
      }
    }
    const messages = db.prepare('SELECT * FROM support_messages WHERE thread_id = ? ORDER BY created_at ASC').all(id)
    const users = db.prepare('SELECT id, username, email FROM users').all()
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
    const enrichedThread = { ...thread, user: userMap[thread.user_id] || { username: 'Unknown', email: '' }, assigned_to_user: thread.assigned_to ? userMap[thread.assigned_to] : null }
    res.json({ thread: enrichedThread, messages })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

app.patch('/api/admin/support/threads/:id/assign', requireAdminOrMod, (req, res) => {
  try {
    const { id } = req.params
    const { assigned_to } = req.body
    const { id: currentId, role } = req.adminUser
    const thread = db.prepare('SELECT * FROM support_threads WHERE id = ?').get(id)
    if (!thread) return res.status(404).json({ error: 'Thread not found' })
    const customer = db.prepare('SELECT role FROM users WHERE id = ?').get(thread.user_id)
    if (!customer || customer.role !== 'buyer') return res.status(403).json({ error: 'Can only assign buyer threads' })
    if (role === 'admin') {
      // Admin can assign to any mod or unassign
      if (assigned_to != null) {
        const target = db.prepare('SELECT id, role FROM users WHERE id = ?').get(assigned_to)
        if (!target || target.role !== 'mod') return res.status(400).json({ error: 'Can only assign to moderators' })
      }
    } else {
      // Mod: can assign to self (if unassigned) or unassign (if assigned to self)
      if (assigned_to != null) {
        if (assigned_to !== currentId) return res.status(403).json({ error: 'Moderators can only assign threads to themselves' })
        if (thread.assigned_to != null) return res.status(400).json({ error: 'Thread is already assigned' })
      } else {
        if (thread.assigned_to !== currentId) return res.status(403).json({ error: 'Can only unassign threads assigned to you' })
      }
    }
    db.prepare('UPDATE support_threads SET assigned_to = ? WHERE id = ?').run(assigned_to ?? null, id)
    const users = db.prepare('SELECT id, username, email FROM users').all()
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
    const updated = db.prepare('SELECT * FROM support_threads WHERE id = ?').get(id)
    const enriched = { ...updated, user: userMap[updated.user_id] || { username: 'Unknown', email: '' }, assigned_to_user: updated.assigned_to ? userMap[updated.assigned_to] : null }
    res.json({ thread: enriched })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to assign thread' })
  }
})

app.post('/api/admin/support/threads/:id/messages', requireAdminOrMod, (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const { id: currentId, role } = req.adminUser
    if (!content?.trim()) return res.status(400).json({ error: 'Message content required' })
    const thread = db.prepare('SELECT * FROM support_threads WHERE id = ?').get(id)
    if (!thread) return res.status(404).json({ error: 'Thread not found' })
    const customer = db.prepare('SELECT role FROM users WHERE id = ?').get(thread.user_id)
    if (!customer || customer.role !== 'buyer') return res.status(403).json({ error: 'Can only message customer accounts' })
    if (role === 'mod') {
      if (thread.assigned_to != null && thread.assigned_to !== currentId) {
        return res.status(403).json({ error: 'This thread is assigned to another moderator' })
      }
    }
    db.prepare('INSERT INTO support_messages (thread_id, sender_role, sender_id, content) VALUES (?, ?, ?, ?)').run(id, 'admin', req.adminUser.id, content.trim())
    const messages = db.prepare('SELECT * FROM support_messages WHERE thread_id = ? ORDER BY created_at ASC').all(id)
    res.status(201).json({ messages })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// --- Support / Customer Service (user) ---
app.get('/api/support/threads', requireAuth, (req, res) => {
  try {
    const threads = db.prepare('SELECT * FROM support_threads ORDER BY created_at DESC').all()
    const mine = threads.filter((t) => t.user_id === req.authUser.id)
    res.json({ threads: mine })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch threads' })
  }
})

app.post('/api/support/threads', requireAuth, (req, res) => {
  try {
    const { subject } = req.body
    if (!subject?.trim()) return res.status(400).json({ error: 'Subject required' })
    const result = db.prepare('INSERT INTO support_threads (user_id, subject) VALUES (?, ?)').run(req.authUser.id, subject.trim())
    const thread = db.prepare('SELECT * FROM support_threads WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json({ thread })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create thread' })
  }
})

app.get('/api/support/threads/:id/messages', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const thread = db.prepare('SELECT * FROM support_threads WHERE id = ?').get(id)
    if (!thread) return res.status(404).json({ error: 'Thread not found' })
    if (thread.user_id !== req.authUser.id) return res.status(403).json({ error: 'Access denied' })
    const messages = db.prepare('SELECT * FROM support_messages WHERE thread_id = ? ORDER BY created_at ASC').all(id)
    res.json({ thread, messages })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

app.post('/api/support/threads/:id/messages', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Message content required' })
    const thread = db.prepare('SELECT * FROM support_threads WHERE id = ?').get(id)
    if (!thread) return res.status(404).json({ error: 'Thread not found' })
    if (thread.user_id !== req.authUser.id) return res.status(403).json({ error: 'Access denied' })
    db.prepare('INSERT INTO support_messages (thread_id, sender_role, sender_id, content) VALUES (?, ?, ?, ?)').run(id, 'user', req.authUser.id, content.trim())
    const messages = db.prepare('SELECT * FROM support_messages WHERE thread_id = ? ORDER BY created_at ASC').all(id)
    res.status(201).json({ messages })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// --- Homepage content (public) ---
app.get('/api/homepage', (req, res) => {
  try {
    const rows = db.prepare('SELECT section_key, content FROM homepage_content').all()
    const content = {}
    for (const r of rows) {
      try {
        content[r.section_key] = JSON.parse(r.content)
      } catch {
        content[r.section_key] = r.content
      }
    }
    res.json({ content })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch homepage content' })
  }
})

// --- Homepage content (admin) ---
app.get('/api/admin/homepage', requireAdminOrMod, (req, res) => {
  try {
    const rows = db.prepare('SELECT section_key, content FROM homepage_content').all()
    const content = {}
    for (const r of rows) {
      try {
        content[r.section_key] = JSON.parse(r.content)
      } catch {
        content[r.section_key] = r.content
      }
    }
    res.json({ content })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch homepage content' })
  }
})

app.patch('/api/admin/homepage', requireAdminOrMod, (req, res) => {
  try {
    const { section_key, content } = req.body
    if (!section_key) return res.status(400).json({ error: 'section_key required' })
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content)
    db.prepare(`
      INSERT INTO homepage_content (section_key, content) VALUES (?, ?)
      ON CONFLICT(section_key) DO UPDATE SET content = excluded.content, updated_at = datetime('now')
    `).run(section_key, contentStr)
    const row = db.prepare('SELECT section_key, content FROM homepage_content WHERE section_key = ?').get(section_key)
    let parsed = row.content
    try {
      parsed = JSON.parse(row.content)
    } catch {}
    res.json({ section_key: row.section_key, content: parsed })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update homepage content' })
  }
})

app.post('/api/admin/homepage/upload', requireAdminOrMod, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' })
    const filename = req.file.filename
    res.json({ filename })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

// --- Public product reviews (for homepage "They Trusted Us") ---
app.get('/api/reviews', (req, res) => {
  try {
    const idsParam = req.query.ids || ''
    const ids = idsParam.split(',').map((n) => parseInt(n, 10)).filter((n) => !isNaN(n) && n > 0)
    if (ids.length === 0) return res.json({ reviews: [] })
    const placeholders = ids.map(() => '?').join(',')
    const reviews = db.prepare(`SELECT * FROM product_reviews WHERE id IN (${placeholders}) ORDER BY created_at DESC`).all(...ids)
    res.json({ reviews })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

// --- Admin: all product reviews (for selecting featured reviews) ---
app.get('/api/admin/reviews', requireAdminOrMod, (req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM product_reviews ORDER BY created_at DESC').all()
    const products = db.prepare('SELECT id, name FROM products').all()
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    const enriched = reviews.map((r) => ({ ...r, product_name: productMap[r.product_id]?.name || 'Unknown' }))
    res.json({ reviews: enriched })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

// --- Orders ---
app.post('/api/orders', requireAuth, (req, res) => {
  try {
    const userId = req.authUser.id
    const { shipping_address, payment_method, items } = req.body
    if (!shipping_address || !payment_method || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'shipping_address, payment_method, and items (array) are required' })
    }
    let totalAmount = 0
    const validItems = []
    for (const it of items) {
      const product = db.prepare('SELECT id, price, status FROM products WHERE id = ?').get(it.product_id)
      if (!product) continue
      if (product.status !== 'Available') continue
      const qty = Math.max(1, parseInt(it.quantity, 10) || 1)
      validItems.push({ product_id: product.id, quantity: qty, price_at_time: product.price })
      totalAmount += product.price * qty
    }
    if (validItems.length === 0) {
      return res.status(400).json({ error: 'No valid items to order' })
    }
    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, shipping_address, payment_method, status, total_amount)
      VALUES (?, ?, ?, 'pending', ?)
    `).run(userId, String(shipping_address), String(payment_method), totalAmount)
    const orderId = orderResult.lastInsertRowid
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)')
    for (const it of validItems) {
      insertItem.run(orderId, it.product_id, it.quantity, it.price_at_time)
    }
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId)
    res.status(201).json({ order })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

app.get('/api/orders', requireAuth, (req, res) => {
  try {
    const userId = req.authUser.id
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId)
    const products = db.prepare('SELECT id, name, image FROM products').all()
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    const enriched = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id)
      const itemsWithProduct = items.map((i) => ({
        ...i,
        product_name: productMap[i.product_id]?.name || 'Unknown',
        product_image: productMap[i.product_id]?.image,
      }))
      return { ...o, items: itemsWithProduct }
    })
    res.json({ orders: enriched })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

app.patch('/api/orders/:id/cancel', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const userId = req.authUser.id
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.user_id !== userId) return res.status(403).json({ error: 'Access denied' })
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ error: 'Only pending or processing orders can be cancelled' })
    }
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', id)
    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id)
    const products = db.prepare('SELECT id, name, image FROM products').all()
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    const itemsWithProduct = items.map((i) => ({
      ...i,
      product_name: productMap[i.product_id]?.name || 'Unknown',
      product_image: productMap[i.product_id]?.image,
    }))
    res.json({ order: { ...updated, items: itemsWithProduct } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to cancel order' })
  }
})

app.get('/api/admin/orders', requireAdminOrMod, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
    const users = db.prepare('SELECT id, username, email FROM users').all()
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
    const products = db.prepare('SELECT id, name FROM products').all()
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    const enriched = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id)
      const itemsWithProduct = items.map((i) => ({
        ...i,
        product_name: productMap[i.product_id]?.name || 'Unknown',
      }))
      return {
        ...o,
        user: userMap[o.user_id] || { username: 'Unknown', email: '' },
        items: itemsWithProduct,
      }
    })
    res.json({ orders: enriched })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

app.patch('/api/admin/orders/:id', requireAdminOrMod, (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required: pending, processing, shipped, delivered, cancelled' })
    }
    const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id)
    if (!existing) return res.status(404).json({ error: 'Order not found' })
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id)
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id)
    const products = db.prepare('SELECT id, name FROM products').all()
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    const itemsWithProduct = items.map((i) => ({ ...i, product_name: productMap[i.product_id]?.name || 'Unknown' }))
    const users = db.prepare('SELECT id, username, email FROM users').all()
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
    res.json({
      order: {
        ...order,
        user: userMap[order.user_id] || { username: 'Unknown', email: '' },
        items: itemsWithProduct,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// --- Public products (for storefront) ---
app.get('/api/products', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null
    let products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all()
    if (limit && limit > 0) products = products.slice(0, limit)
    res.json({ products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

function startServer(port) {
  return app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

const server = startServer(PORT)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use.`)
    console.error(`Try: set PORT=3003 && npm run dev:server (then update vite.config.ts proxy target)`)
    process.exit(1)
  }
  console.error('Server error:', err)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  process.exit(1)
})
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
})
