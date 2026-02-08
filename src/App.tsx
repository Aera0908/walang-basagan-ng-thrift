import categories from './data/categories.json'
import Header from './components/Header'
import Hero from './components/Hero'
import BrandIntro from './components/BrandIntro'
import JacketShowcase from './components/JacketShowcase'
import TrustedSection from './components/TrustedSection'
import AchievementsSection from './components/AchievementsSection'
import ProductView from './components/ProductView'
import CTASection from './components/CTASection'
import FeaturesSection from './components/FeaturesSection'
import Footer from './components/Footer'

interface AppProps {
  onLogin?: () => void
  onSignup?: () => void
}

function App({ onLogin, onSignup }: AppProps) {
  return (
    <div className="min-h-screen bg-white font-poppins text-gray-900">
      <Header categories={categories} onLogin={onLogin} onSignup={onSignup} />
      <Hero />
      <BrandIntro />
      <JacketShowcase />
      <TrustedSection />
      <AchievementsSection />
      <ProductView />
      <CTASection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

export default App
