function TrustedSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-6">
        <span className="mx-auto block w-fit rounded-lg bg-pink-500 px-6 py-2 font-bold uppercase tracking-widest text-white">
          They Trusted Us
        </span>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="relative h-72 w-56 overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100 to-yellow-100">
                <span className="absolute inset-0 flex items-center justify-center text-5xl text-pink-300">
                  Customer
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-500">@happy_customer_{i}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustedSection

