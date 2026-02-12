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
    <section className="bg-gradient-to-r from-orange-100 via-pink-100 to-lime-100 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
        <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-300 to-pink-100">
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

        <div className="space-y-6 text-gray-800">
          <p className="font-brand text-2xl text-pink-600">{c.title || defaultContent.title}</p>
          <h2 className="text-3xl font-bold leading-snug sm:text-4xl">{c.headline || defaultContent.headline}</h2>
          <div className="rounded-2xl bg-white p-6 shadow">
            <p>{c.paragraph1 || defaultContent.paragraph1}</p>
            <p className="mt-4">{c.paragraph2 || defaultContent.paragraph2}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandIntro

