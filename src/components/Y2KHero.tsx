import { useState, useEffect } from 'react'
import heroBanners from '../data/heroBanners.json'
import { getImageUrl } from '../lib/api'

interface HeroBanner {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
}

const defaultBanners = heroBanners as HeroBanner[]

function Y2KHero({ banners = defaultBanners }: { banners?: HeroBanner[] }) {
  const bannersToUse = banners?.length ? banners : defaultBanners
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannersToUse.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [bannersToUse.length])

  const handleBannerClick = (index: number) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Full-screen banner images with carousel */}
      {bannersToUse.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Full-bleed background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${getImageUrl(banner.image)})` }}
          >
            {/* Diagonal fuchsia/white gradient overlay */}
            <div
              className="absolute inset-0 mix-blend-multiply"
              style={{
                background: 'linear-gradient(165deg, rgba(255,0,255,0.4) 0%, rgba(255,0,255,0.2) 40%, transparent 60%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        </div>
      ))}

      {/* Floating starburst labels */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <div className="absolute left-[8%] top-[28%] animate-float">
          <span className="inline-block rounded-sm bg-yellow-400 px-4 py-2 font-y2k text-sm font-black uppercase tracking-wider text-black shadow-lg" style={{ transform: 'rotate(-12deg)' }}>
            HOT ITEM
          </span>
        </div>
        <div className="absolute right-[12%] top-[18%] animate-float" style={{ animationDelay: '0.5s' }}>
          <span className="inline-block rounded-sm bg-yellow-400 px-4 py-2 font-y2k text-sm font-black uppercase tracking-wider text-black shadow-lg" style={{ transform: 'rotate(8deg)' }}>
            BOOM
          </span>
        </div>
        <div className="absolute right-[18%] top-[48%] animate-float" style={{ animationDelay: '1s' }}>
          <span className="inline-block rounded-sm bg-yellow-400 px-4 py-2 font-y2k text-sm font-black uppercase tracking-wider text-black shadow-lg" style={{ transform: 'rotate(-5deg)' }}>
            NEW DROP
          </span>
        </div>
        <div className="absolute left-[5%] top-[12%] animate-float" style={{ animationDelay: '1.5s' }}>
          <span className="inline-block rounded-sm border-2 border-black bg-white px-3 py-1.5 font-y2k text-xs font-black uppercase tracking-wider text-black">
            Y2K CLUB
          </span>
        </div>
      </div>

      {/* Centered content - Y2K RE. CLUB style */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-y2k text-4xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_0_4px_rgba(0,0,0,0.8)] sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-sky-200 drop-shadow-[0_0_0_3px_rgba(0,0,0,0.9)]">Y2K</span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">RE. CLUB</span>
          </h1>
          <p className="mt-4 font-y2k text-lg font-bold text-white/95 sm:text-xl md:text-2xl">
            {bannersToUse[currentIndex]?.title || 'Fashion From the Future'}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/90 sm:text-base">
            {bannersToUse[currentIndex]?.description}
          </p>
        </div>
      </div>

      {/* Carousel thumbnails - bottom right */}
      <div className="absolute bottom-6 right-6 z-20 flex gap-2 sm:gap-3">
        {bannersToUse.map((b, i) => (
          <button
            key={b.id}
            onClick={() => handleBannerClick(i)}
            className={`relative overflow-hidden rounded-lg border-2 border-white/50 transition-all ${
              i === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
            }`}
            aria-label={`View ${b.title}`}
          >
            <div
              className="h-20 w-28 bg-cover bg-center sm:h-24 sm:w-36"
              style={{ backgroundImage: `url(${getImageUrl(b.image)})` }}
            />
            {i === currentIndex && <div className="absolute inset-0 bg-white/20" />}
          </button>
        ))}
      </div>

      {/* Carousel dots - bottom center */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {bannersToUse.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 w-2 rounded-full transition-all ${i === currentIndex ? 'scale-125 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default Y2KHero
