import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const dbPath = path.join(dataDir, 'walang-basagan.db')

const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create schema
db.exec(`
  -- Roles: admin (only 1), mod, buyer
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'mod', 'buyer')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Trigger: only 1 admin allowed
  CREATE TRIGGER IF NOT EXISTS enforce_single_admin_insert
  BEFORE INSERT ON users
  WHEN NEW.role = 'admin'
  BEGIN
    SELECT RAISE(ABORT, 'Only one admin account is allowed')
    WHERE (SELECT COUNT(*) FROM users WHERE role = 'admin') >= 1;
  END;

  CREATE TRIGGER IF NOT EXISTS enforce_single_admin_update
  BEFORE UPDATE OF role ON users
  WHEN NEW.role = 'admin' AND OLD.role != 'admin'
  BEGIN
    SELECT RAISE(ABORT, 'Only one admin account is allowed')
    WHERE (SELECT COUNT(*) FROM users WHERE role = 'admin' AND id != NEW.id) >= 1;
  END;

  CREATE TRIGGER IF NOT EXISTS enforce_single_admin_update_from_admin
  BEFORE UPDATE OF role ON users
  WHEN OLD.role = 'admin' AND NEW.role != 'admin'
  BEGIN
    SELECT RAISE(ABORT, 'Cannot remove the only admin account')
    WHERE (SELECT COUNT(*) FROM users WHERE role = 'admin') <= 1;
  END;

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

  -- Add status column if missing (migration)
  CREATE TABLE IF NOT EXISTS _schema_version (version INT);
  INSERT OR IGNORE INTO _schema_version (version) VALUES (1);
  -- SQLite doesn't support IF NOT EXISTS for ADD COLUMN; use try/catch in app or separate migration
`)
try {
  db.exec(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'banned'))`)
} catch (e) {
  if (!e.message?.includes('duplicate column')) throw e
}
try {
  db.exec(`ALTER TABLE products ADD COLUMN image TEXT`)
} catch (e) {
  if (!e.message?.includes('duplicate column')) throw e
}
try {
  db.exec('ALTER TABLE support_threads ADD COLUMN assigned_to INTEGER')
} catch (e) {
  if (!e.message?.includes('duplicate column')) throw e
}
db.exec(`
  -- Support threads (customer service)
  CREATE TABLE IF NOT EXISTS support_threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    assigned_to INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    sender_role TEXT NOT NULL CHECK(sender_role IN ('user', 'admin')),
    sender_id INTEGER,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (thread_id) REFERENCES support_threads(id)
  );
  CREATE INDEX IF NOT EXISTS idx_support_threads_user ON support_threads(user_id);
  CREATE INDEX IF NOT EXISTS idx_support_messages_thread ON support_messages(thread_id);

  -- Products
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    size TEXT DEFAULT 'Free Size',
    status TEXT NOT NULL CHECK(status IN ('Available', 'Sold')),
    category TEXT,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    description TEXT,
    image TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

  -- Product reviews
  CREATE TABLE IF NOT EXISTS product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    username TEXT,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);

  -- Homepage content (customizable by admin)
  CREATE TABLE IF NOT EXISTS homepage_content (
    section_key TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Orders
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`)

// Seed products from initial data if empty
const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get()
if (productCount.c === 0) {
  const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.json')
  try {
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'))
    const insert = db.prepare(`
      INSERT INTO products (name, price, size, status, category, rating, review_count, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const p of products) {
      insert.run(
        p.name,
        p.price,
        p.size || 'Free Size',
        p.status || 'Available',
        p.category || null,
        p.rating ?? 0,
        p.reviewCount ?? 0,
        p.description || null
      )
    }
  } catch (e) {
    // Skip seed if file not found
  }
}

// Seed homepage content defaults if empty
const homepageCount = db.prepare('SELECT COUNT(*) as c FROM homepage_content').get()
if (homepageCount.c === 0) {
  const defaults = {
    achievements_title: JSON.stringify('Some of Our Achievements'),
    hero_banners: JSON.stringify([
      { id: 'banner1', title: 'The concept', subtitle: 'Home - The concept', description: 'Dive into the Walang Basagan ng Thrift universe!', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop' },
      { id: 'banner2', title: 'Y2K Collection', subtitle: 'Home - Collection', description: 'Explore our curated selection of authentic Y2K thrifted pieces.', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop' },
      { id: 'banner3', title: 'Vintage Finds', subtitle: 'Home - Vintage', description: 'Discover unique pre-loved clothing from the 90s and 2000s.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop' },
    ]),
    brand_intro: JSON.stringify({ title: 'Walang Basagan ng Thrift is ...', headline: 'The brand that brightens up your wardrobe!', paragraph1: 'We curate colorful and unique ensembles...', paragraph2: 'What is more, we hunt quality, iconic vintage clothing...', image: '' }),
    cta: JSON.stringify({ title: 'Shop Y2K Thrift', buttonText: 'Browse Collection' }),
    about_us: JSON.stringify({ title: 'About Us', headline: 'Walang Basagan ng Thrift', sub_text: 'We curate colorful and unique ensembles from pre-loved pieces inspired by early-2000s Filipino fashion icons. Our mission is to bring Y2K vibes to your wardrobe while promoting sustainable fashion through thrifting.', image: '' }),
    trusted_section: JSON.stringify({ title: 'They Trusted Us', review_ids: [] }),
  }
  const stmt = db.prepare('INSERT INTO homepage_content (section_key, content) VALUES (?, ?)')
  for (const [k, v] of Object.entries(defaults)) {
    stmt.run(k, v)
  }
}

export default db
