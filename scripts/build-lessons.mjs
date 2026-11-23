// A sajat-50.md (magyar, ez adja a sorrendet) és a content/lessons.en.json (angol)
// alapján legyártja a kétnyelvű shared/lessons.json-t.
// Futtatás: npm run lessons (a dev és a build előtt magától lefut).
import { readFileSync, writeFileSync } from 'node:fs'
import { tierFor } from '../shared/tiers.js'

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
