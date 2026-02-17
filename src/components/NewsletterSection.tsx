import { useState } from 'react'

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
  }

  return (
    <section className="border-y-4 border-black bg-gradient-to-r from-fuchsia-50 via-white to-fuchsia-50 py-16 px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto block w-fit rounded border-2 border-black bg-[#FF00FF] px-6 py-2 font-y2k font-bold uppercase tracking-widest text-white">
          Newsletter
        </span>
        <h2 className="mt-4 font-y2k text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
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
              className="flex-1 min-w-0 rounded border-2 border-black px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF00FF] bg-white"
            />
            <button
              type="submit"
              className="shrink-0 rounded border-2 border-black bg-black px-6 py-3 font-y2k font-bold text-white hover:bg-[#FF00FF] hover:border-[#FF00FF] transition"
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
