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
    <div className="mt-12">
      <h3 className="text-lg font-bold text-gray-800">Reviews</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map((r) => (
          <div key={r.id} className="rounded-xl border border-pink-100 bg-pink-50 p-4">
            <p className="font-semibold text-gray-800">{r.name}</p>
            <p className="text-pink-400">{'*'.repeat(r.rating)}</p>
            <p className="mt-2 text-sm text-gray-600">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewsSection

