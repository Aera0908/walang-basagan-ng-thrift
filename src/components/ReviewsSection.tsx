import reviews from '../data/reviews.json'

interface Review {
  id: string
  name: string
  text: string
  rating: number
}

function ReviewsSection() {
  const items = reviews as Review[]

  return (
    <section id="reviews" className="scroll-mt-20 bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <span className="mx-auto block w-fit rounded-lg bg-pink-500 px-6 py-2 font-bold uppercase tracking-widest text-white">
          Customer Reviews
        </span>
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-800">What our customers say</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((r) => (
            <div key={r.id} className="rounded-xl border border-pink-100 bg-pink-50 p-4">
              <p className="font-semibold text-gray-800">{r.name}</p>
              <p className="text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
              <p className="mt-2 text-sm text-gray-600">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ReviewsSection
