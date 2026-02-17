/**
 * Seed users for SQLite: 1 admin, 3 mod, 5 buyer.
 * Run: node server/seed-users.js
 */
import bcrypt from 'bcryptjs'
import db from './db.js'

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

const insertStmt = db.prepare(`
  INSERT INTO users (email, username, password_hash, role)
  VALUES (?, ?, ?, ?)
`)
const getByEmail = db.prepare('SELECT id FROM users WHERE email = ?')

let created = 0
for (const u of USERS) {
  if (getByEmail.get(u.email)) {
    console.log('Exists:', u.email)
    continue
  }
  try {
    const hash = bcrypt.hashSync(u.password, 10)
    insertStmt.run(u.email, u.username, hash, u.role)
    console.log('Created:', u.role, '-', u.email, '/', u.username)
    created++
  } catch (err) {
    if (err.message?.includes('Only one admin')) {
      console.log('Admin already exists, skipping')
    } else if (err.message?.includes('UNIQUE')) {
      console.log('Exists:', u.email)
    } else {
      console.error('Error for', u.email, err.message)
    }
  }
}

console.log('\nTotal created:', created)
