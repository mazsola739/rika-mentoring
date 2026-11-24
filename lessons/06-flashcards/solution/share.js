import { deckData, toDeck } from './deckFiles.js'

const PREFIX = '#deck='

// The deck packed into a link (URL-encoded JSON after the #), opening on the Solution tab.
// The part after # never reaches a server. Pictures stay out: they would make the link huge.
export function makeShareLink(deck, lang) {
  const url = new URL(window.location.href)
  url.searchParams.set('view', 'solution')
  url.hash = PREFIX + encodeURIComponent(JSON.stringify(deckData(deck, lang, { withImages: false })))
  return url.href
}

// The deck a shared link brings, or null if there is none (or the link is mangled).
export function readSharedDeck() {
  const hash = window.location.hash
  if (!hash.startsWith(PREFIX)) return null
  try {
    return toDeck(JSON.parse(decodeURIComponent(hash.slice(PREFIX.length))))
  } catch {
    return null
  }
}

// Takes the deck out of the address without a reload or a new history entry, so a reload does not offer it again.
export function clearSharedDeck() {
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
}
