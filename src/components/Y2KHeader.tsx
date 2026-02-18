import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { FaCartShopping } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/wbnt_logo.png'

interface Y2KHeaderProps {
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
  hasLightPageBackground?: boolean
}

function Y2KHeader({
  categories,
  cartCount = 0,
  onLogin,
  onSignup,
  onGoToAdmin,
  onHomeClick,
  onReviewsClick,
  onAboutUsClick,
  onProductsClick,
  onOrdersClick,
  onCartClick,
  rightSlot,
  hasLightPageBackground,
}: Y2KHeaderProps) {
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled((window.scrollY ?? document.documentElement.scrollTop) > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const useSolidHeader = hasLightPageBackground || isScrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        useSolidHeader ? 'bg-white/95 shadow-md' : 'bg-transparent'
      }`}
    >
      {/* Free shipping marquee - only when scrolled/solid (merged with hero when at top) */}
      {useSolidHeader && (
      <div className="overflow-hidden border-b-2 border-black bg-[#FF00FF] py-2">
        <div className="flex animate-marquee whitespace-nowrap font-y2k text-sm font-black uppercase tracking-widest text-white" style={{ width: 'max-content' }}>
          {[1, 2].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 2}>
              {[...Array(8)].map((_, i) => (
                <span key={i} className="mx-8">
                  🚚 FREE SHIPPING
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      )}
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-6 px-4 py-3">
        {/* Logo - far left */}
        <button type="button" onClick={onHomeClick} className="flex shrink-0 justify-self-start mr-10">
          <img
            src={logo}
            alt="Walang Basagan ng Thrift"
            className={`h-10 w-auto transition-all duration-300 ${
              useSolidHeader ? '' : 'drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] brightness-110'
            }`}
          />
        </button>
        {/* Nav links */}
        <nav className="hidden items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider md:flex md:justify-self-center md:ml-16">
          {categories.map((cat) => {
            const linkClass = `transition hover:underline ${
              useSolidHeader ? 'text-black' : 'text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]'
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

        {/* Icons - right */}
        <div className="flex items-center justify-end gap-3">
          {user?.role === 'buyer' && (
            <button
              onClick={onOrdersClick}
              className={`transition hover:underline ${
                useSolidHeader ? 'text-black' : 'text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]'
              }`}
              title="Orders"
            >
              <span className="text-xs font-bold">Orders</span>
            </button>
          )}
          <button
            onClick={user ? onCartClick : onLogin}
            className={`relative p-1 transition hover:opacity-80 ${
              useSolidHeader ? 'text-black' : 'text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]'
            }`}
            title="Cart"
          >
            <FaCartShopping className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'mod') && (
                <button
                  onClick={onGoToAdmin}
                  className={`rounded border-2 px-3 py-1.5 text-xs font-bold tracking-wider transition ${
                  useSolidHeader ? 'border-black bg-white text-black hover:bg-black hover:text-white' : 'border-white bg-white/10 text-white hover:bg-white/20'
                }`}
                >
                  Admin
                </button>
              )}
              <button
                onClick={logout}
                className={`rounded border-2 px-3 py-1.5 text-xs font-bold tracking-wider transition ${
                  useSolidHeader ? 'border-black bg-black text-white hover:bg-white hover:text-black' : 'border-white bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className={`hidden rounded border-2 px-3 py-1.5 text-xs font-bold tracking-wider transition md:inline-block ${
                  useSolidHeader ? 'border-black bg-white text-black hover:bg-black hover:text-white' : 'border-white bg-white/10 text-white hover:bg-white/20'
                }`}
                onClick={onSignup}
              >
                Sign Up
              </button>
              <button
                className={`rounded border-2 px-3 py-1.5 text-xs font-bold tracking-wider transition ${
                  useSolidHeader ? 'border-black bg-black text-white hover:bg-white hover:text-black' : 'border-white bg-white text-black hover:bg-black hover:text-white'
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

export default Y2KHeader
