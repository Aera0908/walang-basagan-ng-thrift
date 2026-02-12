/**
 * Create admin user in JSON store. Run when using the JSON fallback.
 * Usage: node server/seed-admin-json.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
const usersPath = path.join(dataDir, 'users.json')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let users = []
try {
  users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
} catch {}

if (users.some((u) => u.role === 'admin')) {
  console.log('Admin account already exists.')
  process.exit(0)
}

const email = process.argv.find((a, i) => process.argv[i - 1] === '--email') || 'admin@wbnt.com'
const username = process.argv.find((a, i) => process.argv[i - 1] === '--username') || 'admin'
const password = process.argv.find((a, i) => process.argv[i - 1] === '--password') || 'admin123'

const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
users.push({
  id,
  email,
  username,
  password_hash: bcrypt.hashSync(password, 10),
  role: 'admin',
  created_at: new Date().toISOString(),
})
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))
console.log('Admin created:', email, '/', username)
