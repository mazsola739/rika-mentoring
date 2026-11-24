// The Leitner system: three boxes. A right answer moves a card one box on, a wrong one sends it back to box 1,
// and the further a card is, the fewer rounds it comes up in. Plain logic, no React.

// Per box: every how many rounds a card comes up.
const INTERVALS = { 1: 1, 2: 2, 3: 4 }
export const LAST_BOX = 3

// A new card starts in box 1 and is due straight away.
const NEW_CARD = { box: 1, due: 0 }

// Where is the card? A card never answered is a new card.
export function getEntry(progress, cardId) {
  return progress[cardId] ?? NEW_CARD
}

// Is it due in this round?
export function isDue(entry, round) {
  return entry.due <= round
}

// Knew it: one box on (up to the last). Did not: back to box 1. Either way it is due again a few rounds later.
export function nextEntry(entry, round, knew) {
  const box = knew ? Math.min(entry.box + 1, LAST_BOX) : 1
  return { box, due: round + INTERVALS[box] }
}
