# Walang Basagan ng Thrift

React + TypeScript + Tailwind CSS using Vite. E-commerce storefront with admin/moderator dashboard.

## Quick start (Windows)

1. **Install Node.js** — Double-click `install-node.bat` (uses `node-installer.msi` in this folder). Run once, follow the installer.
2. **Start the site** — Double-click `run.bat`. It installs packages if needed, then runs frontend + backend.
3. **Create admin** — In a new terminal: `npm run seed:admin` (or `npm run seed:admin:json` if using JSON store).

Open http://localhost:5173 in your browser.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Frontend dev server (Vite, port 5173) |
| `npm run dev:server` | Backend API server (port 3002) |
| `npm run dev:all` | Frontend + backend together — **use for Admin Dashboard** |
| `npm run seed:admin` | Create first admin account (SQLite) |
| `npm run seed:admin:json` | Create admin for JSON store |
| `npm run build` | Production build |
| `npm run preview` | Serve production build locally |

## Windows batch files

| File | Description |
|------|-------------|
| `install-node.bat` | Install Node.js from `node-installer.msi`. Run once. |
| `run.bat` | Start frontend + backend. Checks for Node.js; runs `npm install` on first run. |
| `run-server-json.bat` | Backend with JSON store (no SQLite). Use if SQLite fails. |

## Backend & Database

- **SQLite** (default): `server/data/walang-basagan.db`
- **JSON fallback**: Set `USE_JSON_DB=1` or use `run-server-json.bat` if SQLite build fails (e.g. Windows without build tools)

### User roles

| Role   | Count | Description        |
|--------|-------|--------------------|
| admin  | 1 only | Full access       |
| mod    | Any   | Moderator         |
| buyer  | Any   | Customer           |

### First-time setup

1. Start both: `npm run dev:all` or double-click `run.bat`
2. Create admin: `npm run seed:admin` (SQLite) or `npm run seed:admin:json` (JSON store)

### If the server exits immediately

- **Port in use:** Backend uses port 3002. Close any process using it, or set `PORT=3003` and update the proxy in `vite.config.ts`
- **SQLite build failed:** Use the JSON store:
  1. Double-click `run-server-json.bat` (or `set USE_JSON_DB=1 && npm run dev:server`)
  2. Run `npm run dev` in another window
  3. Run `npm run seed:admin:json` to create the admin

### API endpoints

- `POST /api/auth/register` — Register (body: `{ email, username, password, role? }`)
- `POST /api/auth/login` — Login (body: `{ email, password }`)
- `GET /api/auth/me/:id` — Get user by ID

## Tailwind CSS

Tailwind is configured in `tailwind.config.js`. Global styles and Tailwind layers are in `src/index.css`.
