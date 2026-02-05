import type { ReactNode } from 'react'

interface HeaderProps {
  categories: string[]
  onLogin?: () => void
  onSignup?: () => void
  rightSlot?: ReactNode
}

function Header({ categories, onLogin, onSignup, rightSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="font-brand text-2xl text-pink-500">
          Walang Basagan ng Thrift
        </a>

        <nav className="hidden items-center gap-6 text-sm font-poppins font-semibold md:flex">
          {categories.map((cat) => (
            <a key={cat} href="#" className="text-gray-700 transition hover:text-pink-500">
              {cat}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-pink-500">Search</button>
          <button className="text-gray-600 hover:text-pink-500">Cart</button>
          <button
            className="hidden rounded-full border border-pink-500 px-4 py-2 text-xs font-semibold text-pink-500 hover:bg-pink-50 md:inline-flex"
            onClick={onSignup}
          >
            Sign Up
          </button>
          <button
            className="rounded-full bg-pink-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-pink-400"
            onClick={onLogin}
          >
            Log In
          </button>
          {rightSlot}
        </div>
      </div>
    </header>
  )
}

export default Header

