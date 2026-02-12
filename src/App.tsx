import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import * as api from './lib/api'
import type { HomepageContent } from './lib/api'
import categories from './data/categories.json'
import Header from './components/Header'
import BackgroundMusic from './components/BackgroundMusic'
import Hero from './components/Hero'
import BrandIntro from './components/BrandIntro'
import JacketShowcase from './components/JacketShowcase'
import TrustedSection from './components/TrustedSection'
import AchievementsSection from './components/AchievementsSection'
import ProductsPage from './components/ProductsPage'
import FeaturesSection from './components/FeaturesSection'
import AboutUsSection from './components/AboutUsSection'
import ReviewsSection from './components/ReviewsSection'
import Footer from './components/Footer'
import ProductDetailPage from './components/ProductDetailPage'
import CartPage from './components/CartPage'
import CheckoutPage from './components/CheckoutPage'
import OrdersPage from './components/OrdersPage'
import SupportWidget from './components/SupportWidget'

function App() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [cartItems, setCartItems] = useState<{ productId: number; quantity: number }[]>([])
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const [scrollTarget, setScrollTarget] = useState<string | null>(null)
  const [homepageContent, setHomepageContent] = useState<HomepageContent>({})

  const isProductsPage = pathname === '/products' || pathname.startsWith('/products/')
  const isCart = pathname === '/cart'
  const isCheckout = pathname === '/checkout'
  const isOrders = pathname === '/orders'
  const isHome = pathname === '/'

  useEffect(() => {
    api.fetchHomepage().then((res) => setHomepageContent(res.content)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'mod')) {
      navigate('/admin/products')
    }
  }, [user, navigate])

  useEffect(() => {
    if (isHome && scrollTarget) {
      const el = document.getElementById(scrollTarget)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      const id = setTimeout(() => setScrollTarget(null), 0)
      return () => clearTimeout(id)
    }
  }, [isHome, scrollTarget])

  useEffect(() => {
    if (!user && (pathname === '/products' || pathname === '/orders')) {
      navigate('/login')
    }
  }, [user, pathname, navigate])

  const handleReviewsClick = () => {
    navigate('/')
    setScrollTarget('reviews')
  }

  const handleAboutUsClick = () => {
    navigate('/')
    setScrollTarget('about-us')
  }

  const handleProductsClick = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/products')
  }

  const handleAddToCart = (productId: number) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.productId === productId)
      if (found) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { productId, quantity: 1 }]
    })
  }

  const handleBuyNow = (productId: number) => {
    const items = [{ productId, quantity: 1 }]
    setCartItems((prev) => {
      const found = prev.find((i) => i.productId === productId)
      if (found) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { productId, quantity: 1 }]
    })
    navigate('/checkout', { state: { items } })
  }

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-900">
      <BackgroundMusic />
      <SupportWidget onLoginPrompt={() => navigate('/login')} />
      <Header
        categories={categories}
        cartCount={cartCount}
        hasLightPageBackground={isProductsPage || isCart || isCheckout || isOrders}
        onLogin={() => navigate('/login')}
        onSignup={() => navigate('/signup')}
        onGoToAdmin={() => navigate('/admin/products')}
        onHomeClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        onReviewsClick={handleReviewsClick}
        onAboutUsClick={handleAboutUsClick}
        onProductsClick={handleProductsClick}
        onOrdersClick={() => (user ? navigate('/orders') : navigate('/login'))}
        onCartClick={() => (user ? navigate('/cart') : navigate('/login'))}
      />

      <Routes>
        <Route
          path="/products/:id"
          element={
            <ProductDetailPage
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onBack={() => navigate('/products')}
            />
          }
        />
        <Route
          path="/products"
          element={
            <ProductsPage
              onProductClick={(id) => navigate(`/products/${id}`)}
              onBack={() => navigate('/')}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              onUpdateCart={setCartItems}
              onProceedToCheckout={(items) => navigate('/checkout', { state: { items } })}
              onBack={() => navigate('/products')}
            />
          }
        />
        <Route
          path="/orders"
          element={
            user?.role === 'buyer' ? (
              <OrdersPage
                userId={user.id}
                onBack={() => navigate('/')}
                onProductClick={(id) => navigate(`/products/${id}`)}
              />
            ) : user ? (
              <div className="min-h-screen pt-28 flex items-center justify-center">
                <p className="text-gray-600">Admins can view orders in the dashboard.</p>
              </div>
            ) : (
              <div className="min-h-screen pt-28 flex items-center justify-center">
                <button onClick={() => navigate('/login')} className="text-pink-500 font-semibold hover:text-pink-600">
                  Log in to view orders
                </button>
              </div>
            )
          }
        />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              user={user}
              onGoToOrders={user?.role === 'buyer' ? () => navigate('/orders') : undefined}
              onPlaceOrder={(orderedItems) => {
                setCartItems((prev) =>
                  prev
                    .map((i) => {
                      const o = orderedItems.find((o) => o.productId === i.productId)
                      if (!o) return i
                      const remaining = i.quantity - o.quantity
                      return remaining <= 0 ? null : { ...i, quantity: remaining }
                    })
                    .filter((x): x is { productId: number; quantity: number } => x !== null)
                )
              }}
              onBack={() => navigate('/cart')}
            />
          }
        />
        <Route
          path="/"
          element={
            <>
              <Hero banners={homepageContent.hero_banners} />
              <BrandIntro content={homepageContent.brand_intro} />
              <JacketShowcase />
              <TrustedSection content={homepageContent.trusted_section} />
              <AchievementsSection
                achievementsTitle="Some of Our Achievements"
                isLoggedIn={!!user}
                onProductClick={(id) => navigate(`/products/${id}`)}
                onBrowseMoreClick={() => navigate('/products')}
                onLoginPrompt={() => navigate('/login')}
              />
              <FeaturesSection />
              <AboutUsSection content={homepageContent.about_us} />
              <ReviewsSection />
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default App
