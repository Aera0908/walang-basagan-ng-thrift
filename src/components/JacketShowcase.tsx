function JacketShowcase() {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-3 overflow-hidden rounded-2xl">
        {['bg-purple-200', 'bg-pink-200', 'bg-yellow-100'].map((bg, i) => (
          <div key={i} className={bg + ' flex aspect-[3/4] items-center justify-center'}>
            <span className="text-5xl opacity-40">Jacket</span>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-5xl px-6 text-center text-6xl font-black uppercase tracking-widest text-pink-100">
        WALANG BASAGAN
      </p>
    </section>
  )
}

export default JacketShowcase

