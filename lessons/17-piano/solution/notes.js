// Notes as MIDI numbers: 60 = C4 (middle C). Two octaves on screen, from C4 up to C6.
export const FIRST_NOTE = 60
export const LAST_NOTE = 84
export const OCTAVES = [
  { from: 60, to: 71 },
  { from: 72, to: 84 },
]

const NAMES = {
  en: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'],
  // Hungarian (German) naming: B is H, and B♭ is called B.
  hu: ['C', 'Cisz', 'D', 'Disz', 'E', 'F', 'Fisz', 'G', 'Gisz', 'A', 'B', 'H'],
}

export const isBlack = (midi) => [1, 3, 6, 8, 10].includes(midi % 12)
export const noteName = (midi, lang) => `${NAMES[lang][midi % 12]}${Math.floor(midi / 12) - 1}`
export const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12)

export const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

// Physical key positions (KeyboardEvent.code), so the layout works on QWERTY and QWERTZ alike.
// The value is the distance in semitones from the C at the start of the mapped octave.
export const KEY_OFFSETS = {
  KeyA: 0,
  KeyW: 1,
  KeyS: 2,
  KeyE: 3,
  KeyD: 4,
  KeyF: 5,
  KeyT: 6,
  KeyG: 7,
  KeyY: 8,
  KeyH: 9,
  KeyU: 10,
  KeyJ: 11,
  KeyK: 12,
  KeyO: 13,
  KeyL: 14,
  KeyP: 15,
  Semicolon: 16,
  Quote: 17,
}
export const OCTAVE_DOWN = 'KeyZ'
export const OCTAVE_UP = 'KeyX'
export const BASES = [60, 72] // the computer keys start at C4 or at C5

// What is printed on a physical key, when the browser cannot tell us (navigator.keyboard is Chromium-only).
const US_LABELS = { Semicolon: ';', Quote: "'" }
const HU_LABELS = { KeyY: 'Z', KeyZ: 'Y', Semicolon: 'É', Quote: 'Á' }

export function fallbackLabel(code, lang) {
  const map = lang === 'hu' ? HU_LABELS : US_LABELS
  return map[code] ?? code.replace('Key', '')
}

// Sound presets: oscillator waveform + a simple ADSR envelope (+ an optional low-pass filter).
export const INSTRUMENTS = [
  { id: 'piano', wave: 'triangle', attack: 0.005, decay: 1.1, sustain: 0, release: 0.35, filter: 3800 },
  { id: 'organ', wave: 'square', attack: 0.02, decay: 0.1, sustain: 0.75, release: 0.1, filter: 1600 },
  { id: 'synth', wave: 'sawtooth', attack: 0.01, decay: 0.35, sustain: 0.55, release: 0.3, filter: 2400 },
  { id: 'flute', wave: 'sine', attack: 0.07, decay: 0.2, sustain: 0.85, release: 0.25, filter: null },
]
