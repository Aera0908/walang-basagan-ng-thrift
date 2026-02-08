import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import logo from '../assets/wbnt_logo.png'

interface HeaderProps {
  categories: string[]
  onLogin?: () => void
  onSignup?: () => void
  rightSlot?: ReactNode
}

function Header({ categories, onLogin, onSignup, rightSlot }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center">
          <img
            src={logo}
            alt="Walang Basagan ng Thrift"
            className={`h-[3.75rem] w-auto sm:h-[4.5rem] transition-all duration-300 ${
              isScrolled ? '' : 'drop-shadow-lg brightness-110'
            }`}
          />
        </a>

        <nav className="hidden items-center gap-6 text-sm font-poppins font-semibold md:flex">
          {categories.map((cat) => (
            <a
              key={cat}
              href="#"
              className={`transition hover:text-pink-500 ${
                isScrolled ? 'text-gray-700' : 'text-white drop-shadow-md'
              }`}
            >
              {cat}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            className={`transition hover:text-pink-500 ${
              isScrolled ? 'text-gray-600' : 'text-white drop-shadow-md'
            }`}
          >
            Search
          </button>
          <button
            className={`transition hover:text-pink-500 ${
              isScrolled ? 'text-gray-600' : 'text-white drop-shadow-md'
            }`}
          >
            Cart
          </button>
          <button
            className={`hidden rounded-full px-4 py-2 text-xs font-semibold transition md:inline-flex ${
              isScrolled
                ? 'border border-pink-500 text-pink-500 hover:bg-pink-50'
                : 'border border-white/80 text-white hover:bg-white/20 backdrop-blur-sm'
            }`}
            onClick={onSignup}
          >
            Sign Up
          </button>
          <button
            className={`rounded-full px-4 py-2 text-xs font-semibold shadow transition ${
              isScrolled
                ? 'bg-pink-500 text-white hover:bg-pink-400'
                : 'bg-white/90 text-pink-500 hover:bg-white'
            }`}
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

