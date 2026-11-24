// The sample data of the lesson: the six products of the Peacock Shop and their first reviews.
// The pictures are simple drawings in public/images, so they work without the internet.
// The texts are in English; translate them if you like, the code does not depend on them.

export const PRODUCTS = [
  {
    id: 'silk-scarf',
    name: 'Teal silk scarf',
    price: 59, // in euros
    image: '/images/silk-scarf.svg',
    description:
      'A 90 × 90 cm square of pure silk twill with hand-rolled edges. Light enough for summer, bold enough for a grey winter coat.',
  },
  {
    id: 'notebook',
    name: 'Gold A5 notebook',
    price: 18,
    image: '/images/notebook.svg',
    description: '160 dotted pages of 100 g paper, a lay-flat binding and a soft-touch cover in warm gold.',
  },
  {
    id: 'tote-bag',
    name: 'Ruby canvas tote bag',
    price: 29,
    image: '/images/tote-bag.svg',
    description:
      'Heavy organic cotton canvas with long handles and an inner pocket. Fits a laptop and the weekly groceries.',
  },
  {
    id: 'art-print',
    name: 'Peacock blue art print',
    price: 45,
    image: '/images/art-print.svg',
    description:
      'A gold sun over a peacock blue field. Giclée print on 310 g cotton rag paper, 30 × 40 cm, signed on the back.',
  },
  {
    id: 'phone-case',
    name: 'Plum phone case',
    price: 24,
    image: '/images/phone-case.svg',
    description: 'A slim, shock-absorbing case with a matte finish that keeps the colour deep and fingerprints away.',
  },
  {
    id: 'umbrella',
    name: 'Gold & ruby folding umbrella',
    price: 39,
    image: '/images/umbrella.svg',
    description:
      'Wind-resistant frame, automatic open and close, and gold and ruby panels that brighten up a grey day.',
  },
]

// The first reviews.
//   productId: which product it is about (the id of a product above)
//   rating:    how many stars, from 1 to 5
//   createdAt: when it was written, as an ISO date (year-month-day, then the time)
//   helpfulBy: the accounts that found it helpful. You need it only in the advanced level.
export const SAMPLE_REVIEWS = [
  {
    id: 'r1',
    productId: 'silk-scarf',
    author: 'Anna K.',
    rating: 5,
    text: 'The colours glow and the silk feels heavy and soft. I get compliments every time I wear it.',
    createdAt: '2026-10-02T10:00:00.000Z',
    helpfulBy: ['a1', 'a2', 'a3', 'a4'],
  },
  {
    id: 'r2',
    productId: 'silk-scarf',
    author: 'Márton B.',
    rating: 4,
    text: 'Bought it for my mother. Beautiful colour, the box could be a little sturdier.',
    createdAt: '2026-09-14T10:00:00.000Z',
    helpfulBy: ['a5'],
  },
  {
    id: 'r3',
    productId: 'silk-scarf',
    author: 'Sofia R.',
    rating: 5,
    text: 'Hand-rolled edges and an even, deep colour. A small work of art, worth every cent.',
    createdAt: '2026-08-21T10:00:00.000Z',
    helpfulBy: ['a2', 'a6'],
  },
  {
    id: 'r4',
    productId: 'notebook',
    author: 'Bence T.',
    rating: 5,
    text: 'My new favourite notebook. Fountain pen ink does not bleed through and it really lies flat.',
    createdAt: '2026-10-30T10:00:00.000Z',
    helpfulBy: ['a1', 'a3', 'a7'],
  },
  {
    id: 'r5',
    productId: 'notebook',
    author: 'Lili H.',
    rating: 3,
    text: 'The cover is gorgeous. I expected a few more pages for the price.',
    createdAt: '2026-09-03T10:00:00.000Z',
    helpfulBy: [],
  },
  {
    id: 'r6',
    productId: 'tote-bag',
    author: 'James W.',
    rating: 4,
    text: 'Strong and roomy: it carries my laptop and lunch with ease. The colour has survived three washes.',
    createdAt: '2026-11-08T10:00:00.000Z',
    helpfulBy: ['a4', 'a8'],
  },
  {
    id: 'r7',
    productId: 'tote-bag',
    author: 'Eszter N.',
    rating: 5,
    text: 'I thought ruby red would be too loud, but it goes with everything.',
    createdAt: '2026-10-11T10:00:00.000Z',
    helpfulBy: ['a2'],
  },
  {
    id: 'r8',
    productId: 'tote-bag',
    author: 'Dóra P.',
    rating: 2,
    text: 'Great fabric, but the handles are too long to carry it by hand comfortably.',
    createdAt: '2026-07-19T10:00:00.000Z',
    helpfulBy: [],
  },
  {
    id: 'r9',
    productId: 'art-print',
    author: 'Gergő S.',
    rating: 5,
    text: 'The blues are unreal. I framed it for the hallway; the paper has a lovely texture.',
    createdAt: '2026-11-15T10:00:00.000Z',
    helpfulBy: ['a1', 'a2', 'a5', 'a6', 'a9'],
  },
  {
    id: 'r10',
    productId: 'art-print',
    author: 'Mia L.',
    rating: 4,
    text: 'The print is perfect. It took almost two weeks to arrive, though.',
    createdAt: '2026-09-27T10:00:00.000Z',
    helpfulBy: ['a3'],
  },
  {
    id: 'r11',
    productId: 'phone-case',
    author: 'Ádám F.',
    rating: 3,
    text: 'Pretty, but a bit slippery: the matte finish slides off the sofa easily.',
    createdAt: '2026-10-20T10:00:00.000Z',
    helpfulBy: [],
  },
  {
    id: 'r12',
    productId: 'phone-case',
    author: 'Nora V.',
    rating: 4,
    text: 'I dropped my phone on the pavement on day two: not a scratch. The plum colour is deep and vivid.',
    createdAt: '2026-08-05T10:00:00.000Z',
    helpfulBy: ['a7', 'a8'],
  },
  {
    id: 'r13',
    productId: 'umbrella',
    author: 'Péter G.',
    rating: 5,
    text: 'Rainy days are fun now. Opening it feels like a little sunset overhead, and it is solid in the wind too.',
    createdAt: '2026-11-02T10:00:00.000Z',
    helpfulBy: ['a4', 'a6', 'a9'],
  },
]
