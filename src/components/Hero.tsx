function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-yellow-200 via-pink-300 to-sky-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center text-white">
        <p className="text-sm font-medium">Home - The concept</p>
        <h1 className="mt-4 text-4xl font-bold drop-shadow-lg sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-lime-500 to-sky-500">
          The concept
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed drop-shadow">
          Dive into the <span className="font-bold">Walang Basagan ng Thrift</span> universe!
          Discover a selection of Y2K pieces and upcycled creations that transform vintage
          clothing into trendy, colorful new outfits
        </p>
      </div>
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-yellow-200/50 blur-2xl" />
    </section>
  )
}

export default Hero

