import { getImageUrl } from '../lib/api'

interface AboutUsContent {
  title?: string
  headline?: string
  sub_text?: string
  image?: string
}

function AboutUsSection({ content }: { content?: AboutUsContent }) {
  return (
    <section id="about-us" className="scroll-mt-20 border-y-4 border-black bg-gradient-to-r from-fuchsia-50 via-white to-fuchsia-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <span className="mx-auto block w-fit rounded border-2 border-black bg-[#FF00FF] px-6 py-2 font-y2k font-bold uppercase tracking-widest text-white">
          {content?.title || 'About Us'}
        </span>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 items-center">
          <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-lg border-4 border-black bg-gradient-to-br from-pink-300 to-fuchsia-200 shadow-[6px_6px_0_rgba(0,0,0,0.3)]">
            {content?.image ? (
              <img src={getImageUrl(content.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-pink-400/60">
                <span className="text-6xl">Team Photo</span>
              </div>
            )}
          </div>
          <div className="space-y-6 text-gray-900">
            <h2 className="font-y2k text-3xl font-black uppercase tracking-tight">{content?.headline || 'Walang Basagan ng Thrift'}</h2>
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
