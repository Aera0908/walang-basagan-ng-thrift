import { useState, useEffect } from 'react'
import * as api from '../lib/api'
import type { ProductReview } from '../lib/api'

interface TrustedContent {
  title?: string
  review_ids?: number[]
}

function TrustedSection({ content }: { content?: TrustedContent }) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const ids = content?.review_ids || []

  useEffect(() => {
    if (ids.length === 0) {
      setReviews([])
      return
    }
    api.fetchReviews(ids).then((res) => setReviews(res.reviews)).catch(() => setReviews([]))
  }, [ids.join(',')])

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-6">
        <span className="mx-auto block w-fit rounded-lg bg-pink-500 px-6 py-2 font-bold uppercase tracking-widest text-white">
          {content?.title || 'They Trusted Us'}
        </span>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {reviews.length === 0 ? (
            <p className="col-span-2 text-center text-gray-500">No featured reviews yet. Admins can select reviews from product reviews.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-yellow-50 p-6">
                <p className="text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                <p className="mt-2 text-gray-800">{r.comment || 'No comment'}</p>
                <p className="mt-4 text-sm text-gray-500">@{r.username || 'Customer'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default TrustedSection
