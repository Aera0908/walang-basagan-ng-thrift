function Y2KSection() {
  const cards = [
    {
      title: 'Y2K STYLE: WHEN THE FUTURE MEETS RETRO',
      content: [
        'An explosive mix of cyberpunk futurism, vintage kitsch, and colors that pop like a CRT screen.',
        'Born at the turn of the 1990s and 2000s, Y2K is the aesthetic of an era when people believed that the year 2000 would change everything, and fashion dared to prove it.',
        'Rhinestones, vinyl, low-rise waistlines, and geeky references: a style that is as nostalgic as it is avant-garde.',
      ],
    },
    {
      title: 'HOW TO ADOPT THE Y2K STYLE? SPOILER: BE BOLD',
      content: [
        'Low-rise jeans... paired with a metallic crop top or oversized sweatshirt. Think futuristic materials—shiny vinyl, glossy plastic, sparkling rhinestones.',
        'Cyberpunk-style visor sunglasses, transparent bags, and XXL jewelry reminiscent of 2000s CD covers. Layer, mix, and own it. Because Y2K isn\'t a fashion trend to follow, it\'s an attitude to embody.',
      ],
    },
    {
      title: 'Y2K HAS NO AUTHOR, BUT IT DOES HAVE ICONS. AND IT\'S MAKING A STRONG COMEBACK.',
      content: [
        'Britney and her iconic jeans, the Spice Girls and their platform shoes, Matrix and its cyber style, video games and their saturated colors—Y2K was a cultural explosion.',
        'Y2K is back today because it embodies a time when anything seemed possible—technological optimism, freedom of dress, and that touch of madness that is missing today. Us? We\'re reinventing it—more sustainable, more daring, and just as electrifying as ever.',
      ],
    },
  ]

  return (
    <section className="border-y-4 border-black bg-gradient-to-r from-fuchsia-50 via-pink-50 to-fuchsia-50 py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <span className="mx-auto block w-fit rounded border-2 border-black bg-[#FF00FF] px-6 py-2 font-y2k font-bold uppercase tracking-widest text-white">
          Y2K Style
        </span>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg border-2 border-black bg-white p-6 shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)]"
            >
              <h3 className="font-y2k text-sm font-bold uppercase leading-tight text-black">
                {card.title}
              </h3>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                {card.content.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Y2KSection
