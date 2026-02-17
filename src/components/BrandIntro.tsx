import { getImageUrl } from '../lib/api'

interface BrandIntroContent {
  title?: string
  headline?: string
  paragraph1?: string
  paragraph2?: string
  image?: string
}

const defaultContent: BrandIntroContent = {
  title: 'Walang Basagan ng Thrift is ...',
  headline: 'The brand that brightens up your wardrobe!',
  paragraph1: 'We curate colorful and unique ensembles from pre-loved pieces inspired by early-2000s Filipino fashion icons like Jolina Magdangal and Julie Anne San Jose.',
  paragraph2: 'What is more, we hunt quality, iconic vintage clothing from the 90s/2000s for our online Y2K thrift shop.',
}

function BrandIntro({ content }: { content?: BrandIntroContent }) {
  const c = content || defaultContent
  return (
    <section className="border-y-4 border-black bg-gradient-to-r from-pink-100 via-fuchsia-100 to-pink-100 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
        <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-lg border-4 border-black bg-gradient-to-br from-pink-300 to-fuchsia-200 shadow-[6px_6px_0_rgba(0,0,0,0.3)]">
          {c.image ? (
            <img src={getImageUrl(c.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center text-pink-400/60">
                <span className="text-6xl">Model Photo</span>
              </div>
              <span className="relative mb-6 text-xs text-pink-600">(Model / outfit photo placeholder)</span>
            </>
          )}
        </div>

        <div className="space-y-6 text-gray-900">
          <p className="font-brand text-2xl text-[#E6007E]">{c.title || defaultContent.title}</p>
          <h2 className="font-y2k text-3xl font-black uppercase leading-snug tracking-tight sm:text-4xl">{c.headline || defaultContent.headline}</h2>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{c.paragraph1 || defaultContent.paragraph1}</p>
            <p className="text-gray-700 leading-relaxed">{c.paragraph2 || defaultContent.paragraph2}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandIntro

