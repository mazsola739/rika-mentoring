import { PEACOCK_PALETTE } from '@shared/ui/palette.js'

// The site's peacock palette has 11 colors; one lighter gold makes 12 different flat colors.
const color = (key) => PEACOCK_PALETTE.find((c) => c.key === key).hex

// One emoji per pair, each pair on its own flat color. Hard uses all 12.
export const FACES = [
  { key: 'peacock', emoji: '🦚', color: color('deepTeal'), name: { en: 'Peacock', hu: 'Páva' } },
  { key: 'wave', emoji: '🌊', color: color('gold'), name: { en: 'Wave', hu: 'Hullám' } },
  { key: 'lemon', emoji: '🍋', color: color('peacockBlue'), name: { en: 'Lemon', hu: 'Citrom' } },
  { key: 'watermelon', emoji: '🍉', color: color('surface'), name: { en: 'Watermelon', hu: 'Görögdinnye' } },
  { key: 'blossom', emoji: '🌸', color: color('peacockGreen'), name: { en: 'Blossom', hu: 'Virág' } },
  { key: 'star', emoji: '⭐', color: color('violet'), name: { en: 'Star', hu: 'Csillag' } },
  { key: 'moon', emoji: '🌙', color: color('night'), name: { en: 'Moon', hu: 'Hold' } },
  { key: 'clover', emoji: '🍀', color: color('orange'), name: { en: 'Clover', hu: 'Lóhere' } },
  { key: 'balloon', emoji: '🎈', color: color('turquoise'), name: { en: 'Balloon', hu: 'Léggömb' } },
  { key: 'music', emoji: '🎵', color: color('sky'), name: { en: 'Music', hu: 'Hangjegy' } },
  { key: 'key', emoji: '🔑', color: color('magenta'), name: { en: 'Key', hu: 'Kulcs' } },
  { key: 'puzzle', emoji: '🧩', color: '#FFD866', name: { en: 'Puzzle piece', hu: 'Kirakódarab' } },
]

export const FACE_KEYS = FACES.map((face) => face.key)

export const faceByKey = (key) => FACES.find((face) => face.key === key) ?? FACES[0]
