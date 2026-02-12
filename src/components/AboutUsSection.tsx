import { getImageUrl } from '../lib/api'

interface AboutUsContent {
  title?: string
  headline?: string
  sub_text?: string
  image?: string
}

function AboutUsSection({ content }: { content?: AboutUsContent }) {
  return (
    <section id="about-us" className="scroll-mt-20 bg-gradient-to-r from-pink-50 via-white to-purple-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <span className="mx-auto block w-fit rounded-lg bg-pink-500 px-6 py-2 font-bold uppercase tracking-widest text-white">
          {content?.title || 'About Us'}
        </span>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 items-center">
          <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-300 to-pink-100">
            {content?.image ? (
              <img src={getImageUrl(content.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-pink-400/60">
                <span className="text-6xl">Team Photo</span>
              </div>
            )}
          </div>
          <div className="space-y-6 text-gray-800">
            <h2 className="text-3xl font-bold">{content?.headline || 'Walang Basagan ng Thrift'}</h2>
            <p className="text-lg leading-relaxed text-gray-600">
              {content?.sub_text || 'We curate colorful and unique ensembles from pre-loved pieces inspired by early-2000s Filipino fashion icons. Our mission is to bring Y2K vibes to your wardrobe while promoting sustainable fashion through thrifting.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUsSection
