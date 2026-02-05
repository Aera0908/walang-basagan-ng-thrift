import products from '../data/products.json'

interface Product {
  id: string
  name: string
  price: number
  size: string
  status: 'Available' | 'Sold'
}

function AchievementsSection() {
  const items = products as Product[]

  return (
    <section className="bg-pink-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <span className="mx-auto block w-fit rounded-lg bg-pink-500 px-6 py-2 font-bold uppercase tracking-widest text-white">
          Some of Our Achievements
        </span>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-pink-100 bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 text-4xl text-pink-200">
                Outfit
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
                <p className="text-pink-500">P{p.price}</p>
                <p className="text-xs text-gray-400">{p.size}</p>
                <p className={'mt-1 text-xs font-medium ' + (p.status === 'Sold' ? 'text-gray-400' : 'text-green-500')}>
                  {p.status === 'Sold' ? 'Item sold' : 'Available'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AchievementsSection

