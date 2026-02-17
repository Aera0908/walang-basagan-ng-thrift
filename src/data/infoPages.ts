export const INFO_PAGES = {
  reviews: {
    title: 'Reviews',
    content: 'Customer reviews and testimonials will be displayed here.\n\nPlaceholder: Read what our customers say about their Y2K thrift finds. We value your feedback!',
  },
  'about-us': {
    title: 'About Us',
    content: 'Learn more about Walang Basagan ng Thrift.\n\nPlaceholder: We curate colorful and unique ensembles from pre-loved pieces inspired by early-2000s Filipino fashion icons. Our mission is to bring Y2K vibes to your wardrobe while promoting sustainable fashion through thrifting.',
  },
  'the-concept': {
    title: 'The Concept',
    content: 'Discover the vision behind our Y2K thrift store.\n\nPlaceholder: Y2K fashion meets sustainability. We believe in giving pre-loved pieces a second life while celebrating the bold, nostalgic aesthetic of the early 2000s.',
  },
  contact: {
    title: 'Contact',
    content: 'Get in touch with us.\n\nPlaceholder: Email: contact@walangbasagan.com\nPhone: (123) 456-7890\nAddress: Manila, Philippines\n\nWe typically respond within 24-48 hours.',
  },
  'delivery-returns': {
    title: 'Delivery and Returns',
    content: 'Shipping and return policy information.\n\nPlaceholder: Free shipping on orders over a certain amount. Standard delivery: 5-7 business days. Returns accepted within 14 days of delivery. Items must be unworn and in original condition.',
  },
  'terms-of-sale': {
    title: 'Terms of Sale',
    content: 'Terms and conditions for purchases.\n\nPlaceholder: By placing an order, you agree to our terms of sale. All sales are final unless otherwise stated. We reserve the right to refuse or cancel orders. Prices are subject to change without notice.',
  },
} as const

export type InfoPageSlug = keyof typeof INFO_PAGES
