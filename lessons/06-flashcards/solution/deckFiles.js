import { label } from './deck.js'

const MAX_NAME = 40

// A deck as plain data, in the current language: the same JSON format as the app built in the guide,
// so a deck downloaded here can be loaded there, and the other way round.
export function deckData(deck, lang, { withImages = true } = {}) {
  return {
    name: label(deck.name, lang),
    cards: deck.cards.map((card) => {
      const data = { question: label(card.q, lang), answer: label(card.a, lang) }
      if (withImages && card.image) {
        data.image = card.image
        if (card.imageAlt) data.imageAlt = card.imageAlt
      }
      return data
    }),
  }
}

// Downloads the deck as a JSON file: a Blob, a temporary object URL and a link we click from code (as in lesson 5).
export function downloadDeck(deck, lang) {
  const json = JSON.stringify(deckData(deck, lang), null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${label(deck.name, lang)}.json`
  // Some browsers only click links that are on the page, so it goes in for a moment.
  document.body.append(link)
  link.click()
  link.remove()
  // The temporary address takes up memory: once the download has started, we free it.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const text = (value) => (typeof value === 'string' ? value.trim() : '')

// Data from outside (a file or a link) becomes a deck only after a check, and it always gets fresh ids,
// so loading the same file twice never clashes with the cards already there.
export function toDeck(data) {
  const name = text(data?.name).slice(0, MAX_NAME)
  if (!name || !Array.isArray(data.cards)) throw new Error('Not a deck')
  const cards = data.cards
    .filter((card) => text(card?.question) && text(card?.answer))
    .map((card) => {
      const result = { id: crypto.randomUUID(), q: text(card.question), a: text(card.answer) }
      // Only pictures stored in the data itself: an address on another website would let that site
      // see every time the card is studied.
      if (typeof card.image === 'string' && card.image.startsWith('data:image/')) {
        result.image = card.image
        result.imageAlt = text(card.imageAlt)
      }
      return result
    })
  return { id: crypto.randomUUID(), name, cards }
}

// Reads the chosen file and makes a deck from it. Throws if it is not one of our decks.
export async function readDeckFile(file) {
  return toDeck(JSON.parse(await file.text()))
}
