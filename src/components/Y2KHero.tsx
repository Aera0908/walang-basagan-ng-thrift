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

  const banner = bannersToUse[currentIndex]

  return (
    <section
      className="relative flex min-h-0 shrink-0 items-center justify-center overflow-hidden px-4 pt-16 pb-4 sm:pb-6"
      style={{ height: 'calc(100dvh - 3.5rem)', maxHeight: 'calc(100vh - 3.5rem)' }}
    >
      {/* Floating starburst labels - hidden on very small screens to prevent overflow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[2%] top-[15%] animate-float sm:left-[8%] sm:top-[25%]">
          <span className="inline-block rounded-sm bg-yellow-400 px-2 py-1 font-y2k text-[10px] font-black uppercase tracking-wider text-black shadow-lg sm:px-4 sm:py-2 sm:text-sm" style={{ transform: 'rotate(-12deg)' }}>
            HOT ITEM
          </span>
        </div>
        <div className="absolute right-[2%] top-[8%] animate-float sm:right-[12%] sm:top-[15%]" style={{ animationDelay: '0.5s' }}>
          <span className="inline-block rounded-sm bg-yellow-400 px-2 py-1 font-y2k text-[10px] font-black uppercase tracking-wider text-black shadow-lg sm:px-4 sm:py-2 sm:text-sm" style={{ transform: 'rotate(8deg)' }}>
            BOOM
          </span>
        </div>
        <div className="absolute right-[5%] top-[40%] animate-float sm:right-[18%] sm:top-[45%]" style={{ animationDelay: '1s' }}>
          <span className="inline-block rounded-sm bg-yellow-400 px-2 py-1 font-y2k text-[10px] font-black uppercase tracking-wider text-black shadow-lg sm:px-4 sm:py-2 sm:text-sm" style={{ transform: 'rotate(-5deg)' }}>
            NEW DROP
          </span>
        </div>
        <div className="absolute left-[2%] top-[3%] animate-float sm:left-[5%] sm:top-[8%]" style={{ animationDelay: '1.5s' }}>
          <span className="inline-block rounded-sm border-2 border-black bg-white px-2 py-1 font-y2k text-[9px] font-black uppercase tracking-wider text-black sm:px-3 sm:py-1.5 sm:text-xs">
            Y2K CLUB
          </span>
        </div>
      </div>

      {/* Central poster - Y2K RE. CLUB style, responsive to viewport */}
      <div className="relative z-10 w-full max-w-4xl">
        <div
          className="relative mx-auto min-h-0 shrink overflow-hidden rounded-lg border-4 border-black shadow-2xl"
          style={{
            boxShadow: '8px 8px 0 rgba(0,0,0,0.3)',
            width: 'min(100%, 64vh, 34rem)',
            aspectRatio: '4/5',
          }}
        >
          {/* Poster background image */}
          <div
            className="relative h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${getImageUrl(banner.image)})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-[#FF00FF]/20 mix-blend-multiply" />

            {/* Poster content overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-6 md:p-8">
              <div className="flex justify-between">
                <div className="text-white/90">
                  <p className="font-y2k text-[10px] font-bold tracking-widest sm:text-xs">@walangbasagan</p>
                  <p className="font-y2k text-[10px] sm:text-xs">www.walangbasagan.com</p>
                </div>
                <div className="text-right font-y2k text-[10px] font-bold text-white/90 sm:text-xs">
                  01/01-2000
                  <br />
                  Pixelwave Loft
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <h1 className="font-y2k text-2xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_0_4px_rgba(0,0,0,0.8)] sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="text-sky-200 drop-shadow-[0_0_0_3px_rgba(0,0,0,0.9)]">Y2K</span>
                  <br />
                  <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl">RE. CLUB</span>
                </h1>
                <p className="font-y2k text-sm font-bold text-white/95 sm:text-lg md:text-xl">
                  {banner.title || 'Fashion From the Future'}
                </p>
                <p className="max-w-md text-xs text-white/80 line-clamp-2 sm:text-sm">{banner.description}</p>
              </div>
            </div>

            {/* Badges on poster */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 space-y-1 sm:left-4 sm:space-y-2">
              <span className="block rounded-full bg-black px-2 py-0.5 font-y2k text-[8px] font-bold text-white sm:px-3 sm:py-1 sm:text-[10px]">Exclusive</span>
              <span className="block rounded-full bg-red-600 px-2 py-0.5 font-y2k text-[8px] font-bold text-white sm:px-3 sm:py-1 sm:text-[10px]">Limited!</span>
            </div>
            <div className="absolute right-2 top-1/3 flex flex-col gap-1 sm:right-4 sm:gap-2">
              <span className="rounded-full bg-black px-2 py-0.5 font-y2k text-[8px] font-bold text-white sm:px-3 sm:py-1 sm:text-[10px]">Y2K</span>
              <span className="rounded-full bg-black px-2 py-0.5 font-y2k text-[8px] font-bold text-white sm:px-3 sm:py-1 sm:text-[10px]">2000s</span>
            </div>
          </div>
        </div>

        {/* Poster thumbnails */}
        <div className="mt-2 flex shrink-0 justify-center gap-2 sm:mt-3">
          {bannersToUse.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 w-2 rounded-full transition-all ${i === currentIndex ? 'scale-125 bg-black' : 'bg-black/40 hover:bg-black/60'}`}
              aria-label={`View ${b.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Y2KHero
