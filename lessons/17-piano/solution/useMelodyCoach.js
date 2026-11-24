import { useState } from 'react'
import { MELODIES } from './melodies.js'

// Melody teacher: which melody is practised, how far the player got, and how many mistakes they made.
// Only the id is state; the melody itself and the next note are worked out from it at every drawing.
export function useMelodyCoach() {
  const [practice, setPractice] = useState(null) // { id, position, mistakes }, or null for free play

  const melody = practice ? MELODIES.find((m) => m.id === practice.id) : null
  const position = practice ? practice.position : 0
  const finished = melody !== null && position === melody.notes.length
  // The next note (its key glows gold), or undefined in free play and at the end.
  const target = melody && !finished ? melody.notes[position] : undefined

  function choose(id) {
    setPractice(MELODIES.some((m) => m.id === id) ? { id, position: 0, mistakes: 0 } : null)
  }

  // Every note the player plays is checked. The updater function sees the latest state even when
  // two notes arrive before React draws again (a chord from a MIDI keyboard, for example).
  function check(midi) {
    setPractice((current) => {
      if (current === null) return current
      const notes = MELODIES.find((m) => m.id === current.id).notes
      if (current.position === notes.length) return current
      if (notes[current.position] === midi) return { ...current, position: current.position + 1 }
      return { ...current, mistakes: current.mistakes + 1 }
    })
  }

  return { melody, position, mistakes: practice ? practice.mistakes : 0, finished, target, choose, check }
}
