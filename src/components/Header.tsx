import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { FaCartShopping } from 'react-icons/fa6'
import logo from '../assets/wbnt_logo.png'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  categories: string[]
  cartCount?: number
  onLogin?: () => void
  onSignup?: () => void
  onGoToAdmin?: () => void
  onHomeClick?: () => void
  onReviewsClick?: () => void
  onAboutUsClick?: () => void
  onProductsClick?: () => void
  onOrdersClick?: () => void
  onCartClick?: () => void
  rightSlot?: ReactNode
  /** When true, header uses solid background + dark nav (for product/checkout pages) */
  hasLightPageBackground?: boolean
}

function Header({ categories, cartCount = 0, onLogin, onSignup, onGoToAdmin, onHomeClick, onReviewsClick, onAboutUsClick, onProductsClick, onOrdersClick, onCartClick, rightSlot, hasLightPageBackground }: HeaderProps) {
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY ?? document.documentElement.scrollTop
      setIsScrolled(scrollY > 50)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const useSolidHeader = hasLightPageBackground || isScrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow] duration-300 ease-out ${
        useSolidHeader
          ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'bg-transparent shadow-none'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <button type="button" onClick={onHomeClick} className="flex items-center">
          <img
            src={logo}
            alt="Walang Basagan ng Thrift"
            className={`h-[3.75rem] w-auto sm:h-[4.5rem] transition-all duration-300 ${
              useSolidHeader ? '' : 'drop-shadow-lg brightness-110'
            }`}
          />
        </button>

        <nav className="hidden items-center gap-6 text-sm font-poppins font-semibold md:flex">
          {categories.map((cat) => {
            const linkClass = `transition hover:text-pink-500 ${
              useSolidHeader ? 'text-gray-700' : 'text-white drop-shadow-md'
            }`
            if (cat === 'Reviews') {
              return (
                <button key={cat} onClick={onReviewsClick} className={linkClass}>
                  {cat}
                </button>
              )
            }
            if (cat === 'About Us') {
              return (
                <button key={cat} onClick={onAboutUsClick} className={linkClass}>
                  {cat}
                </button>
              )
            }
            if (cat === 'Products') {
              return (
                <button key={cat} onClick={onProductsClick} className={linkClass}>
                  {cat}
                </button>
              )
            }
            if (cat === 'Home') {
              return (
                <button key={cat} onClick={onHomeClick} className={linkClass}>
                  {cat}
                </button>
              )
            }
            return (
              <a key={cat} href="#" className={linkClass}>
                {cat}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          {user?.role === 'buyer' && (
            <button
              onClick={onOrdersClick}
              className={`transition hover:text-pink-500 ${
                useSolidHeader ? 'text-gray-600' : 'text-white drop-shadow-md'
              }`}
              title="Orders"
            >
              <span className="text-sm font-semibold">Orders</span>
            </button>
          )}
          <button
            onClick={user ? onCartClick : onLogin}
            className={`relative p-1 transition hover:text-pink-500 ${
              useSolidHeader ? 'text-gray-600' : 'text-white drop-shadow-md'
            }`}
            title="Cart"
          >
            <FaCartShopping className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'mod') && (
                <button
                  onClick={onGoToAdmin}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    useSolidHeader
                      ? 'border border-pink-500 text-pink-500 hover:bg-pink-50'
                      : 'border border-white/80 text-white hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  Admin
                </button>
              )}
              <button
                onClick={logout}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  useSolidHeader
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className={`hidden rounded-full px-4 py-2 text-xs font-semibold transition md:inline-flex ${
                  useSolidHeader
                    ? 'border border-pink-500 text-pink-500 hover:bg-pink-50'
                    : 'border border-white/80 text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
                onClick={onSignup}
              >
                Sign Up
              </button>
              <button
                className={`rounded-full px-4 py-2 text-xs font-semibold shadow transition ${
                  useSolidHeader
                    ? 'bg-pink-500 text-white hover:bg-pink-400'
                    : 'bg-white/90 text-pink-500 hover:bg-white'
                }`}
                onClick={onLogin}
              >
                Log In
              </button>
            </>
          )}
          {rightSlot}
        </div>
      </div>
    </header>
  )
}

export default Header

