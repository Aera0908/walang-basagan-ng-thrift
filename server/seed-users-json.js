/**
 * Seed users for JSON store: 1 admin, 3 mod, 5 buyer.
 * Run: node server/seed-users-json.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
const usersPath = path.join(dataDir, 'users.json')

const USERS = [
  { email: 'admin@wbnt.com', username: 'admin', password: 'admin123', role: 'admin' },
  { email: 'mod1@wbnt.com', username: 'mod1', password: 'mod123', role: 'mod' },
  { email: 'mod2@wbnt.com', username: 'mod2', password: 'mod123', role: 'mod' },
  { email: 'mod3@wbnt.com', username: 'mod3', password: 'mod123', role: 'mod' },
  { email: 'user1@wbnt.com', username: 'user1', password: 'user123', role: 'buyer' },
  { email: 'user2@wbnt.com', username: 'user2', password: 'user123', role: 'buyer' },
  { email: 'user3@wbnt.com', username: 'user3', password: 'user123', role: 'buyer' },
  { email: 'user4@wbnt.com', username: 'user4', password: 'user123', role: 'buyer' },
  { email: 'user5@wbnt.com', username: 'user5', password: 'user123', role: 'buyer' },
]

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let users = []
try {
  users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
} catch {}

const existingEmails = new Set(users.map((u) => u.email))
let created = 0

for (const u of USERS) {
  if (existingEmails.has(u.email)) {
    console.log('Exists:', u.email)
    continue
  }
  if (u.role === 'admin' && users.some((x) => x.role === 'admin')) {
    console.log('Admin already exists, skipping')
    continue
  }
  const id = users.length ? Math.max(...users.map((x) => x.id)) + 1 : 1
  users.push({
    id,
    email: u.email,
    username: u.username,
    password_hash: bcrypt.hashSync(u.password, 10),
    role: u.role,
    status: 'active',
    created_at: new Date().toISOString(),
  })
  existingEmails.add(u.email)
  console.log('Created:', u.role, '-', u.email, '/', u.username)
  created++
}

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))
console.log('\nTotal created:', created)
