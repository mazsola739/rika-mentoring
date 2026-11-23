import { PEACOCK as C } from '@shared/ui/palette.js'

// Sample pictures drawn in code: small SVG compositions in the peacock colors.
// An SVG string becomes a normal image URL with a data: URL, so <img> and the lightbox
// treat it exactly like an uploaded photo. Nothing is downloaded from the internet.

const W = 600
const H = 800

const toDataUrl = (markup) => `data:image/svg+xml,${encodeURIComponent(markup)}`
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`
const background = (fill) => `<rect width="${W}" height="${H}" fill="${fill}"/>`
const circle = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`
const range = (n) => Array.from({ length: n }, (_, i) => i)

// A band whose top edge is a soft wave, filled down to the bottom of the picture.
function wave(y, shift, fill) {
  const x0 = -150 + shift
  const steps = range(6)
    .map((i) => `T${x0 + 150 * (i + 2)} ${y}`)
    .join(' ')
  return `<path d="M${x0} ${y} Q${x0 + 75} ${y - 45} ${x0 + 150} ${y} ${steps} V${H} H${x0} Z" fill="${fill}"/>`
}

const sunset = svg(
  `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.plum}"/><stop offset="1" stop-color="${C.ruby}"/></linearGradient></defs>` +
    background('url(#sky)') +
    circle(300, 470, 170, C.gold) +
    `<rect y="470" width="${W}" height="${H - 470}" fill="${C.teal}"/>` +
    [
      [110, 520, 380],
      [170, 580, 260],
      [230, 640, 140],
    ]
      .map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="16" rx="8" fill="${C.tealLight}"/>`)
      .join(''),
)

const peacockEye = svg(
  background(C.teal) + circle(300, 400, 250, C.blue) + circle(300, 420, 185, C.tealLight) + circle(300, 440, 125, C.night) + circle(300, 455, 62, C.gold),
)

const stripes = svg(
  background(C.gold) +
    `<g transform="rotate(-30 300 400)">` +
    range(10)
      .map((i) => `<rect x="${-340 + i * 140}" y="-400" width="70" height="1600" fill="${i % 2 ? C.plum : C.ruby}"/>`)
      .join('') +
    `</g>`,
)

const blocks = svg(
  background(C.night) +
    [
      [16, 16, 352, 440, C.blue],
      [384, 16, 200, 212, C.gold],
      [384, 244, 200, 212, C.ruby],
      [16, 472, 200, 312, C.tealLight],
      [232, 472, 352, 312, C.plum],
    ]
      .map(([x, y, w, h, fill]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}"/>`)
      .join(''),
)

// A 3 × 4 grid of half circles; every other one is turned upside down.
const halfMoons = svg(
  background(C.plum) +
    range(12)
      .map((i) => {
        const [col, row] = [i % 3, Math.floor(i / 3)]
        const [x, y] = [col * 200, row * 200]
        const fill = [C.gold, C.ruby, C.tealLight][(col + row) % 3]
        const flip = (col + row) % 2 ? ` transform="rotate(180 ${x + 100} ${y + 100})"` : ''
        return `<path d="M${x + 20} ${y + 140} A80 80 0 0 1 ${x + 180} ${y + 140} Z" fill="${fill}"${flip}/>`
      })
      .join(''),
)

const waves = svg(background(C.tealLight) + circle(450, 150, 60, C.gold) + wave(300, 0, C.blue) + wave(460, 75, C.teal) + wave(620, 0, C.night))

const dots = svg(
  background(C.night) +
    range(20)
      .map((i) => {
        const [col, row] = [i % 4, Math.floor(i / 4)]
        const fill = [C.teal, C.tealLight, C.blue, C.plum, C.ruby, C.gold][(row * 4 + col) % 6]
        return circle(75 + col * 150, 80 + row * 160, 52, fill)
      })
      .join(''),
)

// Tiles with a quarter circle in one corner; the corner turns from tile to tile.
const quarterCircles = svg(
  range(12)
    .map((i) => {
      const [col, row] = [i % 3, Math.floor(i / 3)]
      const [x, y] = [col * 200, row * 200]
      const colors = [C.teal, C.gold, C.ruby, C.blue, C.plum, C.tealLight, C.night]
      const turn = ((row * 2 + col) % 4) * 90
      return (
        `<rect x="${x}" y="${y}" width="200" height="200" fill="${colors[(i * 3) % 7]}"/>` +
        `<path d="M${x} ${y} H${x + 200} A200 200 0 0 1 ${x} ${y + 200} Z" fill="${colors[(i * 3 + 2) % 7]}" transform="rotate(${turn} ${x + 100} ${y + 100})"/>`
      )
    })
    .join(''),
)

const arches = svg(
  background(C.gold) +
    circle(150, 220, 70, C.teal) +
    [
      [300, C.ruby],
      [240, C.plum],
      [180, C.blue],
      [120, C.tealLight],
      [60, C.gold],
    ]
      .map(([r, fill]) => circle(300, H, r, fill))
      .join(''),
)

const mountains = svg(
  background(C.night) +
    circle(440, 190, 70, C.gold) +
    [
      [-60, 180, 380, 400, C.plum],
      [140, 380, 300, 660, C.blue],
      [-120, 60, 560, 260, C.teal],
      [240, 470, 520, 700, C.tealLight],
    ]
      .map(([left, peakX, peakY, right, fill]) => `<path d="M${left} ${H} L${peakX} ${peakY} L${right} ${H} Z" fill="${fill}"/>`)
      .join(''),
)

const ART = [
  {
    id: 'sunset',
    art: sunset,
    colors: [C.plum, C.ruby, C.gold, C.teal, C.tealLight],
    caption: { en: 'Sunset', hu: 'Naplemente' },
    alt: {
      en: 'A gold sun setting into a teal sea under a plum and ruby sky',
      hu: 'Arany nap ereszkedik a türkiz tengerbe, szilva- és rubinszínű ég alatt',
    },
  },
  {
    id: 'peacock-eye',
    art: peacockEye,
    colors: [C.teal, C.blue, C.tealLight, C.night, C.gold],
    caption: { en: 'Peacock eye', hu: 'Pávaszem' },
    alt: {
      en: 'Blue, turquoise, navy and gold circles inside each other on teal',
      hu: 'Egymásba rajzolt kék, világostürkiz, sötétkék és arany körök türkiz alapon',
    },
  },
  {
    id: 'stripes',
    art: stripes,
    colors: [C.gold, C.ruby, C.plum],
    caption: { en: 'Diagonal stripes', hu: 'Átlós csíkok' },
    alt: { en: 'Ruby and plum diagonal stripes on gold', hu: 'Rubin és szilva átlós csíkok arany alapon' },
  },
  {
    id: 'blocks',
    art: blocks,
    colors: [C.night, C.blue, C.gold, C.ruby, C.tealLight, C.plum],
    caption: { en: 'Color blocks', hu: 'Színtömbök' },
    alt: {
      en: 'Blue, gold, ruby, turquoise and plum rectangles on navy',
      hu: 'Kék, arany, rubin, világostürkiz és szilva téglalapok sötétkék alapon',
    },
  },
  {
    id: 'half-moons',
    art: halfMoons,
    colors: [C.plum, C.gold, C.ruby, C.tealLight],
    caption: { en: 'Half moons', hu: 'Félholdak' },
    alt: {
      en: 'Rows of gold, ruby and turquoise half circles on plum',
      hu: 'Arany, rubin és világostürkiz félkörök sorai szilva alapon',
    },
  },
  {
    id: 'waves',
    art: waves,
    colors: [C.tealLight, C.gold, C.blue, C.teal, C.night],
    caption: { en: 'Waves', hu: 'Hullámok' },
    alt: { en: 'Blue, teal and navy waves under a small gold sun', hu: 'Kék, türkiz és sötétkék hullámok egy kis arany nap alatt' },
  },
  {
    id: 'dots',
    art: dots,
    colors: [C.night, C.teal, C.tealLight, C.blue, C.plum, C.ruby, C.gold],
    caption: { en: 'Dots', hu: 'Pöttyök' },
    alt: { en: 'A grid of colorful dots on navy', hu: 'Színes pöttyök rácsa sötétkék alapon' },
  },
  {
    id: 'quarter-circles',
    art: quarterCircles,
    colors: [C.teal, C.gold, C.ruby, C.blue, C.plum, C.tealLight, C.night],
    caption: { en: 'Quarter circles', hu: 'Negyedkörök' },
    alt: { en: 'Square tiles, each with a quarter circle in another color', hu: 'Négyzetes lapok, mindegyiken egy más színű negyedkör' },
  },
  {
    id: 'arches',
    art: arches,
    colors: [C.gold, C.teal, C.ruby, C.plum, C.blue, C.tealLight],
    caption: { en: 'Arches', hu: 'Ívek' },
    alt: {
      en: 'Ruby, plum, blue and turquoise arches inside each other on gold, with a teal sun',
      hu: 'Egymásba simuló rubin, szilva, kék és világostürkiz ívek arany alapon, türkiz nappal',
    },
  },
  {
    id: 'mountains',
    art: mountains,
    colors: [C.night, C.gold, C.plum, C.blue, C.teal, C.tealLight],
    caption: { en: 'Night mountains', hu: 'Éjszakai hegyek' },
    alt: { en: 'Layered mountains under a gold moon at night', hu: 'Egymás mögötti hegyek arany hold alatt, éjszaka' },
  },
]

// The same URL works for the big picture and the thumbnail: SVG stays sharp at any size.
export const SAMPLES = ART.map(({ art, ...sample }) => {
  const src = toDataUrl(art)
  return { ...sample, kind: 'sample', src, thumb: src }
})
