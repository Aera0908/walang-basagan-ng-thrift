import ReviewsSection from './ReviewsSection'

function ProductView() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-800">Product View</h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-pink-50 text-6xl text-pink-200">
              Main Image
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-xl bg-pink-50 text-xl text-pink-200"
                >
                  Thumb
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-400">Tops</p>
            <h3 className="text-2xl font-bold text-gray-900">Bubblegum Layered Crop Top Set</h3>
            <p className="text-sm text-gray-600">
              Ultra-soft thrifted cotton with layered straps, adjustable fit, and a glossy Y2K
              finish.
            </p>
            <div className="rounded-xl bg-pink-50 p-4 text-sm text-gray-700">
              <p className="font-semibold">Description</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Pre-loved thrifted clothing.</li>
                <li>Perfect with flare pants and chrome accessories.</li>
                <li>Student-friendly pricing.</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-pink-400">
                Add to cart
              </button>
              <button className="rounded-full border-2 border-pink-500 px-6 py-3 text-sm font-semibold text-pink-500 hover:bg-pink-500 hover:text-white">
                Buy now
              </button>
            </div>
          </div>
        </div>

        <ReviewsSection />
      </div>
    </section>
  )
}

export default ProductView

