import { useState } from 'react'

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
  }

  return (
    <section className="bg-gradient-to-r from-pink-50 via-white to-purple-50 py-16 px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto block w-fit rounded-lg bg-pink-500 px-6 py-2 font-bold uppercase tracking-widest text-white">
          Newsletter
        </span>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-800">
          Sign up for our newsletter
        </h2>
        <p className="mt-3 text-gray-600">
          Receive our exclusive offers and be the first to access new drops.
        </p>

        {subscribed ? (
          <p className="mt-8 text-lg font-semibold text-pink-600">
            Thanks for subscribing!
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 min-w-0 rounded-xl border border-pink-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 bg-white"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-pink-500 px-6 py-3 font-bold text-white hover:bg-pink-600 transition"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default NewsletterSection
