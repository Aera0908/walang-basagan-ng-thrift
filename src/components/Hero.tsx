import { useState, useEffect } from 'react'
import heroBanners from '../data/heroBanners.json'

interface HeroBanner {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
}

function Hero() {
  const banners = heroBanners as HeroBanner[]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-rotate every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
        setTimeout(() => setIsTransitioning(false), 100)
      }, 350)
    }, 10000)

    return () => clearInterval(interval)
  }, [banners.length])

  const handleBannerClick = (index: number) => {
    if (index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 100)
    }, 350)
  }

  return (
    <section className="relative overflow-hidden h-screen max-h-screen w-full">
      {/* Main Hero Section */}
      <div className="relative h-full max-h-full w-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${banner.image})` }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40" />
            </div>
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center px-6 pt-20 pb-12 text-center text-white">
              <div className="mx-auto max-w-6xl">
                <p className={`text-sm font-medium transition-opacity duration-500 ${
                  index === currentIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
                }`}>
                  {banner.subtitle}
                </p>
                <h1 className={`mt-3 text-3xl font-bold drop-shadow-lg sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-lime-400 to-sky-400 transition-opacity duration-500 ${
                  index === currentIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
                }`}>
                  {banner.title}
                </h1>
                <p className={`mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed drop-shadow transition-opacity duration-500 ${
                  index === currentIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
                }`}>
                  {banner.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Smaller Banner Thumbnails - Bottom Right */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex gap-2 sm:gap-3">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            onClick={() => handleBannerClick(index)}
            className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
              index === currentIndex
                ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110'
                : 'opacity-70 hover:opacity-100 hover:scale-105'
            }`}
            aria-label={`View ${banner.title}`}
          >
            <div 
              className="h-24 w-36 sm:h-28 sm:w-40 bg-cover bg-center transition-opacity duration-300"
              style={{ backgroundImage: `url(${banner.image})` }}
            />
            {index === currentIndex && (
              <div className="absolute inset-0 bg-white/20" />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

export default Hero

