function BrandIntro() {
  return (
    <section className="bg-gradient-to-r from-orange-100 via-pink-100 to-lime-100 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
        <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-300 to-pink-100">
          <div className="absolute inset-0 flex items-center justify-center text-pink-400/60">
            <span className="text-6xl">Model Photo</span>
          </div>
          <span className="relative mb-6 text-xs text-pink-600">
            (Model / outfit photo placeholder)
          </span>
        </div>

        <div className="space-y-6 text-gray-800">
          <p className="font-brand text-2xl text-pink-600">
            Walang Basagan ng Thrift is ...
          </p>
          <h2 className="text-3xl font-bold leading-snug sm:text-4xl">
            The brand that brightens up your wardrobe!
          </h2>
          <div className="rounded-2xl bg-white p-6 shadow">
            <p>
              We transform pre-loved pieces into colorful and unique ensembles through an
              upcycling process inspired by early-2000s Filipino fashion icons like Jolina
              Magdangal and Julie Anne San Jose.
            </p>
            <p className="mt-4">
              What is more, we hunt quality, iconic vintage clothing from the 90s/2000s for our
              <span className="font-semibold text-pink-500"> online Y2K thrift shop</span>.
            </p>
          </div>
          <button className="rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-pink-400">
            Upcycling
          </button>
        </div>
      </div>
    </section>
  )
}

export default BrandIntro

