import { PEACOCK } from '@shared/ui/palette.js'

// The catalogue: everyday objects in the flat colours of the peacock palette.
// Prices are in EUR (VAT included). `color` and `accent` are keys of COLORS below.
// The ids are kept from the first catalogue, so carts saved in localStorage still work.

// Every colour has a hex value (from the shared palette) and a bilingual name.
export const COLORS = {
  night: { hex: PEACOCK.night, name: { en: 'Midnight', hu: 'Éjkék' } },
  teal: { hex: PEACOCK.teal, name: { en: 'Teal', hu: 'Türkiz' } },
  tealLight: { hex: PEACOCK.tealLight, name: { en: 'Lagoon', hu: 'Lagúnakék' } },
  blue: { hex: PEACOCK.blue, name: { en: 'Peacock blue', hu: 'Pávakék' } },
  plum: { hex: PEACOCK.plum, name: { en: 'Plum', hu: 'Szilva' } },
  ruby: { hex: PEACOCK.ruby, name: { en: 'Ruby', hu: 'Rubin' } },
  gold: { hex: PEACOCK.gold, name: { en: 'Gold', hu: 'Arany' } },
}

export const colorName = (key, lang) => COLORS[key].name[lang]

export const CATEGORIES = ['scarves', 'stationery', 'cases', 'bags', 'prints']

const scarf = {
  en: ['100% mulberry silk twill', '90 × 90 cm, hand-rolled edges', 'Dry clean or gentle hand wash'],
  hu: ['100% eperfaselyem twill', '90 × 90 cm, kézzel sodort szegély', 'Vegytisztítás vagy kíméletes kézi mosás'],
}
const notebook = {
  en: ['A5, 160 pages, 100 g/m² paper', 'Lay-flat binding, elastic closure', 'Solid colour cover, matte finish'],
  hu: ['A5, 160 oldal, 100 g/m² papír', 'Laposan nyíló kötés, gumis zár', 'Egyszínű, matt borító'],
}
const phoneCase = {
  en: ['Slim, shock-absorbing shell', 'Soft-touch, scratch-resistant finish', 'Fits most 6.1″ phones'],
  hu: ['Vékony, ütéselnyelő tok', 'Selymes tapintású, karcálló felület', 'A legtöbb 6,1″-os telefonhoz'],
}
const tote = {
  en: ['Heavy organic cotton canvas', '38 × 42 cm, long handles', 'Inside pocket for keys'],
  hu: ['Vastag bio pamutvászon', '38 × 42 cm, hosszú fül', 'Belső zseb a kulcsoknak'],
}
const print = {
  en: ['Giclée print on 300 g/m² cotton paper', 'A3 (29.7 × 42 cm) with white margin', 'Shipped flat, unframed'],
  hu: ['Giclée nyomat 300 g/m²-es pamutpapíron', 'A3 (29,7 × 42 cm), fehér margóval', 'Laposan csomagolva, keret nélkül'],
}

export const PRODUCTS = [
  {
    id: 'scarf-teal',
    category: 'scarves',
    color: 'teal',
    accent: 'gold',
    price: 64,
    tag: 'bestseller',
    name: { en: 'Teal silk scarf', hu: 'Türkiz selyemkendő' },
    description: {
      en: 'Deep teal silk with a fine gold hem. Works as a neckerchief, a hair wrap or a bag accent.',
      hu: 'Mélytürkiz selyem vékony arany szegéllyel. Nyakba, hajba vagy táskára kötve is jól mutat.',
    },
    details: scarf,
  },
  {
    id: 'scarf-ruby',
    category: 'scarves',
    color: 'ruby',
    accent: 'gold',
    price: 64,
    name: { en: 'Ruby silk scarf', hu: 'Rubin selyemkendő' },
    description: {
      en: 'A clear ruby red, dyed edge to edge. Bold enough to carry a plain outfit on its own.',
      hu: 'Tiszta rubinvörös, széltől szélig festve. Elég merész ahhoz, hogy egy egyszerű szettet egyedül feldobjon.',
    },
    details: scarf,
  },
  {
    id: 'scarf-lagoon',
    category: 'scarves',
    color: 'tealLight',
    accent: 'blue',
    price: 58,
    tag: 'new',
    name: { en: 'Lagoon silk scarf', hu: 'Lagúnakék selyemkendő' },
    description: {
      en: 'A light, clear turquoise like shallow water, with a peacock blue hem. Airy enough for spring evenings.',
      hu: 'Világos, tiszta türkiz, mint a sekély víz, pávakék szegéllyel. Könnyű darab tavaszi estékre.',
    },
    details: scarf,
  },
  {
    id: 'notebook-gold',
    category: 'stationery',
    color: 'gold',
    accent: 'night',
    price: 18,
    name: { en: 'Gold dot-grid notebook', hu: 'Arany pontrácsos füzet' },
    description: {
      en: 'A warm gold cover for sketches, bullet journals and meeting notes. The dot grid keeps both drawings and lists tidy.',
      hu: 'Meleg aranysárga borító vázlatokhoz, bullet journalhoz és jegyzetekhez. A pontrács rajznál és listánál is rendben tartja a lapot.',
    },
    details: notebook,
  },
  {
    id: 'notebook-ruby',
    category: 'stationery',
    color: 'ruby',
    accent: 'gold',
    price: 18,
    tag: 'new',
    name: { en: 'Ruby notebook', hu: 'Rubin jegyzetfüzet' },
    description: {
      en: 'A deep ruby notebook with a gold elastic band. Opens flat on the desk, so it is great for coding notes.',
      hu: 'Mély rubinszínű füzet arany gumiszalaggal. Az asztalon kinyitva marad, így kódjegyzetekhez is ideális.',
    },
    details: notebook,
  },
  {
    id: 'sketchbook-midnight',
    category: 'stationery',
    color: 'night',
    accent: 'tealLight',
    price: 22,
    name: { en: 'Midnight sketchbook', hu: 'Éjkék vázlatfüzet' },
    description: {
      en: 'A midnight-blue cover with a lagoon band. Thick pages that take pencil, ink and light watercolour.',
      hu: 'Éjkék borító lagúnakék szalaggal. Vastag lapok ceruzához, tintához és könnyű akvarellhez.',
    },
    details: notebook,
  },
  {
    id: 'case-plum',
    category: 'cases',
    color: 'plum',
    accent: 'night',
    price: 26,
    tag: 'bestseller',
    name: { en: 'Plum phone case', hu: 'Szilvaszínű telefontok' },
    description: {
      en: 'A soft-touch plum case. Slim enough for a pocket, tough enough for everyday drops.',
      hu: 'Selymes tapintású, szilvaszínű tok. Zsebbe is elég vékony, a mindennapi leejtéseket is bírja.',
    },
    details: phoneCase,
  },
  {
    id: 'case-blue',
    category: 'cases',
    color: 'blue',
    accent: 'night',
    price: 26,
    name: { en: 'Peacock blue phone case', hu: 'Pávakék telefontok' },
    description: {
      en: 'A calm, saturated blue that looks good on any table. The matte finish keeps fingerprints away.',
      hu: 'Nyugodt, telt kék, ami minden asztalon jól mutat. A matt felületen nem látszik az ujjlenyomat.',
    },
    details: phoneCase,
  },
  {
    id: 'tote-gold',
    category: 'bags',
    color: 'gold',
    accent: 'teal',
    price: 32,
    name: { en: 'Gold tote bag', hu: 'Arany vászontáska' },
    description: {
      en: 'Sunny gold canvas with teal handles. Fits a laptop, a water bottle and a book.',
      hu: 'Napsárga vászon türkiz füllel. Befér egy laptop, egy kulacs és egy könyv.',
    },
    details: tote,
  },
  {
    id: 'tote-teal',
    category: 'bags',
    color: 'teal',
    accent: 'tealLight',
    price: 32,
    tag: 'new',
    name: { en: 'Teal tote bag', hu: 'Türkiz vászontáska' },
    description: {
      en: 'Deep teal canvas with lagoon handles. Your market bag, beach bag and gym bag in one.',
      hu: 'Mélytürkiz vászon lagúnakék füllel. Piaci, strand- és edzőtáska egyben.',
    },
    details: tote,
  },
  {
    id: 'print-blue',
    category: 'prints',
    color: 'blue',
    accent: 'gold',
    price: 40,
    name: { en: 'Peacock blue art print', hu: 'Pávakék művészi nyomat' },
    description: {
      en: 'A gold sun on a peacock blue field: a calm, graphic print on cotton paper.',
      hu: 'Arany nap pávakék mezőben: nyugodt, grafikus nyomat pamutpapíron.',
    },
    details: print,
  },
  {
    id: 'print-plum-ruby',
    category: 'prints',
    color: 'plum',
    accent: 'ruby',
    price: 40,
    name: { en: 'Plum & Ruby art print', hu: 'Szilva–rubin művészi nyomat' },
    description: {
      en: 'A ruby circle rising over a plum field. A cheerful focal point for a desk or a hallway.',
      hu: 'Rubin kör szilvaszínű mező fölött. Vidám hangsúly íróasztal fölé vagy előszobába.',
    },
    details: print,
  },
]

export const productById = (id) => PRODUCTS.find((p) => p.id === id)
