// A sajat-50.md (magyar, ez adja a sorrendet) és a content/lessons.en.json (angol)
// alapján legyártja a kétnyelvű shared/lessons.json-t.
// Futtatás: npm run lessons (a dev és a build előtt magától lefut).
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tierByKey, tierFor } from '../shared/tiers.js'

const SLUGS = {
  'Me, Myself & React': 'portfolio',
  'Dark Mode': 'dark-mode',
  'Password Generator': 'password-generator',
  'Mad Libs': 'mad-libs',
  'QR Code Generator': 'qr-code',
  Flashcards: 'flashcards',
  'Color Palette Generator': 'color-palette',
  Calculator: 'calculator',
  'To-Do List': 'todo',
  'Shopping List': 'shopping-list',
  'Notes App': 'notes',
  'Image Gallery & Carousel': 'image-gallery',
  'Memory Game': 'memory-game',
  'Currency Converter': 'currency-converter',
  'Space Explorer': 'space-explorer',
  'Typing Speed Test': 'typing-test',
  'Musical Instrument': 'piano',
  'Video Player': 'video-player',
  'Wordle-szerű játék': 'wordle',
  'Movie Search': 'movie-search',
  'Book Library': 'book-library',
  'Multi-Step Form': 'multi-step-form',
  'Fan Wiki': 'fan-wiki',
  'Review & Rating App': 'review-rating',
  'Meme Generator': 'meme-generator',
  'Blog Platform': 'blog',
  'Piggy Bank / Wallet': 'piggy-bank',
  'Subscription Tracker': 'subscriptions',
  'Plant Care Tracker': 'plant-care',
  'Mood Tracker': 'mood-tracker',
  'Virtual Pet (Tamagotchi-szerű)': 'virtual-pet',
  Snake: 'snake',
  'Lofi Study Room': 'lofi-room',
  'Digital Wardrobe': 'wardrobe',
  'Drawing App': 'drawing',
  'Winamp Clone': 'winamp',
  'Job Application Tracker': 'job-tracker',
  'Kanban Board': 'kanban',
  'Photo Booth': 'photo-booth',
  'Mood Board': 'mood-board',
  'Swipe-os választó (Tinder-szerű)': 'swipe',
  'Travel Bucket List': 'travel-map',
  'Data Table': 'data-table',
  'E-commerce Store (Webshop)': 'webshop',
  'User Authentication System': 'auth',
  'Reddit-szerű feed': 'feed',
  'Booking App (Időpontfoglaló)': 'booking',
  'AI Chat Assistant': 'ai-chat',
  'Retro OS Desktop': 'retro-os',
  'Real-Time Chat / Slack Clone': 'chat',
}

const FIELDS = { 'Mit tanulunk': 'learn', Kezdő: 'beginner', Közép: 'intermediate', Haladó: 'advanced' }

const md = readFileSync(new URL('../sajat-50.md', import.meta.url), 'utf8')
const lessons = []
let current = null

for (const line of md.split(/\r?\n/)) {
  const title = line.match(/^(\d+)\. \*\*(.+?)\*\* – (.+)$/)
  if (title) {
    const [, n, name, short] = title
    const slug = SLUGS[name]
    if (!slug) throw new Error(`Nincs slug ehhez a leckéhez: "${name}" – add hozzá a SLUGS listához.`)
    const { key, buttons } = tierFor(Number(n))
    current = { n: Number(n), slug, tier: { key, buttons }, hu: { title: name, short } }
    lessons.push(current)
    continue
  }
  const field = line.match(/^\s+- \*\*(.+?):\*\* (.+)$/)
  if (field && current && FIELDS[field[1]]) current.hu[FIELDS[field[1]]] = field[2]
}

const REQUIRED = ['title', 'short', 'learn', 'beginner', 'intermediate', 'advanced']
const english = JSON.parse(readFileSync(new URL('../content/lessons.en.json', import.meta.url), 'utf8'))

// Short texts for the back of the lesson cards ("What we build" / "What you learn").
const cards = JSON.parse(readFileSync(new URL('../content/cards.json', import.meta.url), 'utf8'))
const CARD_MAX = 52

for (const lesson of lessons) {
  lesson.en = english[lesson.slug]
  // The lesson's folder in the repository: lessons/<NN-slug>/ with solution/ and exercise/ in it.
  lesson.dir = `${String(lesson.n).padStart(2, '0')}-${lesson.slug}`
  if (!existsSync(new URL(`../lessons/${lesson.dir}/solution/index.html`, import.meta.url)))
    throw new Error(
      `Nincs meg a lessons/${lesson.dir}/solution/ mappa. Ha a sorrend változott, nevezd át a lecke mappáját erre.`,
    )
  // The exercise: the learner's starting project, a plain Vite + React app.
  lesson.exercise = existsSync(new URL(`../lessons/${lesson.dir}/exercise/package.json`, import.meta.url))
  for (const lang of ['hu', 'en']) {
    const card = cards[lesson.slug]?.[lang]
    if (!card?.build || !card?.learn)
      throw new Error(`Hiányzik (${lang}) a kártyaszöveg a(z) "${lesson.slug}" leckénél (content/cards.json).`)
    for (const k of ['build', 'learn'])
      if (card[k].length > CARD_MAX)
        throw new Error(`Túl hosszú (${lang}, ${k}) a(z) "${lesson.slug}" kártyaszövege: max ${CARD_MAX} karakter.`)
    if (lesson[lang]) lesson[lang].card = card
  }
  for (const lang of ['hu', 'en']) {
    const missing = REQUIRED.filter((k) => !lesson[lang]?.[k])
    if (missing.length) throw new Error(`Hiányzik (${lang}) a(z) "${lesson.slug}" leckénél: ${missing.join(', ')}`)
  }
}

const slugs = new Set(lessons.map((l) => l.slug))
if (slugs.size !== lessons.length) throw new Error('Két leckének ugyanaz a slugja.')

writeFileSync(new URL('../shared/lessons.json', import.meta.url), JSON.stringify(lessons, null, 2) + '\n')
console.log(`lessons.json: ${lessons.length} lecke (hu + en)`)

// README files for GitHub: one in every lesson folder, and the lesson table of the main README.
const site = JSON.parse(readFileSync(new URL('../shared/site.json', import.meta.url), 'utf8'))
const pad = (n) => String(n).padStart(2, '0')
const pageUrl = (lesson) => `${site.url}lessons/${lesson.dir}/solution/`

const lessonReadme = (lesson) => {
  const { en, hu, dir } = lesson
  const tier = tierByKey(lesson.tier.key).label
  const url = pageUrl(lesson)
  // The learner works in a copy of the exercise, so the repository stays clean and `git pull` brings new lessons.
  const name = lesson.exercise
    ? JSON.parse(readFileSync(new URL(`../lessons/${dir}/exercise/package.json`, import.meta.url), 'utf8')).name
    : lesson.slug
  const start = (comment) => [
    '```bash',
    `git clone ${site.repo}.git`,
    `cp -r rika-mentoring/lessons/${dir}/exercise ${name}    # ${comment}`,
    `cd ${name}`,
    'npm install',
    'npm run dev',
    '```',
  ]
  return [
    `# ${pad(lesson.n)} · ${en.title}`,
    '',
    `Rika Mentoring · lesson ${lesson.n} of ${lessons.length} · ${tier.en} · [Magyarul](#magyarul)`,
    '',
    en.short,
    '',
    `**What you learn:** ${en.learn}`,
    '',
    '| Folder | What is in it |',
    '|---|---|',
    '| [`exercise/`](exercise/) | The starting project. You build the app here, step by step, following the guide. |',
    '| [`solution/`](solution/) | The finished app, as it runs on the website. |',
    '',
    `- The guide, step by step: ${url}?view=guide`,
    `- The finished app: ${url}?view=solution`,
    '',
    '## Start',
    '',
    'You need [Node.js](https://nodejs.org) (the LTS version), git and a code editor, for example VS Code.',
    '',
    ...start('your own copy of the exercise'),
    '',
    'You work in the copy: the repository stays as it is, and `git pull` in it brings the new lessons. No git? On the',
    `[repository page](${site.repo}) choose **Code → Download ZIP**, unpack it and copy the \`lessons/${dir}/exercise\``,
    'folder out of it. Step 0 of the guide explains everything.',
    '',
    "The solution is a page of the website: it uses the site's shared lesson frame from `shared/`. To run it on your",
    'own machine, run `npm install` and `npm run dev` in the root of the repository, then open',
    `http://localhost:7020/lessons/${dir}/solution/.`,
    '',
    '---',
    '',
    '## Magyarul',
    '',
    `**${pad(lesson.n)} · ${hu.title}** · Rika Mentoring, ${lesson.n}. lecke (${lessons.length}-ből) · ${tier.hu}`,
    '',
    hu.short,
    '',
    `**Mit tanulsz:** ${hu.learn}`,
    '',
    '| Mappa | Mi van benne? |',
    '|---|---|',
    '| [`exercise/`](exercise/) | A kiinduló projekt: ebben építed fel az appot, lépésről lépésre, az útmutató alapján. |',
    '| [`solution/`](solution/) | A kész app, ahogy a weboldalon fut. |',
    '',
    `- Az útmutató, lépésről lépésre: ${url}?view=guide`,
    `- A kész app: ${url}?view=solution`,
    '',
    '### Indítás',
    '',
    'Kell hozzá a [Node.js](https://nodejs.org) (az LTS-verzió), a git és egy kódszerkesztő, például a VS Code.',
    '',
    ...start('a feladat saját másolata'),
    '',
    'A másolatban dolgozol: a repó változatlan marad, és benne a `git pull` lehozza az új leckéket. Nincs gited? A',
    `[repó oldalán](${site.repo}) válaszd a **Code → Download ZIP** lehetőséget, csomagold ki, és másold ki belőle a`,
    `\`lessons/${dir}/exercise\` mappát. Az útmutató 0. lépése mindent elmagyaráz.`,
    '',
    'A megoldás a weboldal egyik oldala: az oldal közös leckekeretét használja a `shared/` mappából. Ha a saját gépeden',
    'futtatnád, a repó gyökerében futtasd az `npm install` és az `npm run dev` parancsot, majd nyisd meg a',
    `http://localhost:7020/lessons/${dir}/solution/ címet.`,
    '',
  ].join('\n')
}

for (const lesson of lessons)
  writeFileSync(new URL(`../lessons/${lesson.dir}/README.md`, import.meta.url), lessonReadme(lesson))

// The lesson table of the main README, between its two marker lines.
const readmeUrl = new URL('../README.md', import.meta.url)
const START = '<!-- lessons:start -->'
const END = '<!-- lessons:end -->'
const readme = readFileSync(readmeUrl, 'utf8')
const from = readme.indexOf(START)
const to = readme.indexOf(END)
if (from !== -1 && to > from) {
  const rows = lessons.map((l) => {
    const tier = tierByKey(l.tier.key).label
    return `| ${pad(l.n)} | [${l.en.title}](lessons/${l.dir}/) | ${l.hu.short} | ${tier.en} / ${tier.hu} |`
  })
  const table = ['| # | Lesson | Magyarul | Level / Szint |', '|---|---|---|---|', ...rows].join('\n')
  const next = `${readme.slice(0, from + START.length)}\n${table}\n${readme.slice(to)}`
  if (next !== readme) writeFileSync(readmeUrl, next)
}
console.log(`README: ${lessons.length} lecke-mappa`)
