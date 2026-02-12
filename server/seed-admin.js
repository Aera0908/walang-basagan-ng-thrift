/**
 * Seed script: Create the first (and only) admin account.
 * Run: node server/seed-admin.js
 *
 * Usage: node server/seed-admin.js --email admin@example.com --username admin --password yourpassword
 */

import bcrypt from 'bcryptjs'
import db from './db.js'

const args = process.argv.slice(2)
const getArg = (name) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : null
}

const email = getArg('--email') || 'admin@wbnt.com'
const username = getArg('--username') || 'admin'
const password = getArg('--password') || 'admin123'

try {
  const passwordHash = bcrypt.hashSync(password, 10)
  const stmt = db.prepare(`
    INSERT INTO users (email, username, password_hash, role)
    VALUES (?, ?, ?, 'admin')
  `)
  stmt.run(email, username, passwordHash)
  console.log('Admin account created:')
  console.log('  Email:', email)
  console.log('  Username:', username)
  console.log('  Role: admin')
} catch (err) {
  if (err.message?.includes('Only one admin')) {
    console.error('Error: An admin account already exists. Only one admin is allowed.')
  } else if (err.message?.includes('UNIQUE constraint failed')) {
    console.error('Error: Email or username already exists.')
  } else {
    console.error(err)
  }
  process.exit(1)
}
