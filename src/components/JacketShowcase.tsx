import * as api from '../lib/api'
import type { JacketShowcaseContent } from '../lib/api'

const COLOR_CLASSES: Record<string, string> = {
  'purple-200': 'bg-purple-200',
  'pink-200': 'bg-pink-200',
  'yellow-100': 'bg-yellow-100',
  'purple-100': 'bg-purple-100',
  'pink-100': 'bg-pink-100',
  'green-100': 'bg-green-100',
  'sky-200': 'bg-sky-200',
  'amber-100': 'bg-amber-100',
}

const DEFAULT_CARDS = [
  { label: 'Jacket', bg_color: 'purple-200', image: '' },
  { label: 'Jacket', bg_color: 'pink-200', image: '' },
  { label: 'Jacket', bg_color: 'yellow-100', image: '' },
]

function JacketShowcase({ content }: { content?: JacketShowcaseContent }) {
  const cards = content?.cards?.length ? content.cards : DEFAULT_CARDS
  const bottomText = content?.bottom_text ?? 'WALANG BASAGAN NG THRIFT'
  const defaultImage = content?.default_image

  return (
    <section className="border-y-4 border-black bg-white py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border-4 border-black" style={{ gridTemplateColumns: `repeat(${Math.max(1, cards.length)}, 1fr)` }}>
        {cards.map((card, i) => {
          const imgSrc = card.image ? api.getImageUrl(card.image) : defaultImage || ''
          return (
            <div
              key={i}
              className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden ${COLOR_CLASSES[card.bg_color || ''] || 'bg-purple-200'}`}
            >
              {imgSrc ? (
                <img src={imgSrc} alt={card.label || 'Jacket'} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="text-5xl opacity-40">{card.label || 'Jacket'}</span>
              )}
            </div>
          )
        })}
      </div>
      <p className="mx-auto mt-4 max-w-5xl px-6 text-center font-y2k text-5xl font-black uppercase tracking-[0.3em] text-[#FF00FF]/40 sm:text-6xl">
        {bottomText}
      </p>
    </section>
  )
}

export default JacketShowcase

