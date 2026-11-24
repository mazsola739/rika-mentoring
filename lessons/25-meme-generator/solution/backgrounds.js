import { PEACOCK } from '@shared/ui/palette.js'

// Solid color backgrounds in the peacock colors. Each one is a tiny SVG turned into a data: URL,
// so it is local (no server), always loads, and never "taints" the canvas: downloading always works.
const NAMES = {
  night: { en: 'Night blue', hu: 'Éjkék' },
  teal: { en: 'Teal', hu: 'Türkiz' },
  tealLight: { en: 'Turquoise', hu: 'Világostürkiz' },
  blue: { en: 'Peacock blue', hu: 'Pávakék' },
  plum: { en: 'Plum', hu: 'Szilva' },
  ruby: { en: 'Ruby', hu: 'Rubin' },
  gold: { en: 'Gold', hu: 'Arany' },
}

const solidImage = (color) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="${color}"/></svg>`,
  )}`

export const BACKGROUNDS = Object.entries(PEACOCK).map(([key, color]) => ({
  id: `color:${key}`,
  key,
  color,
  src: solidImage(color),
  name: NAMES[key] ?? { en: color, hu: color },
}))

export const backgroundByKey = (key) => BACKGROUNDS.find((b) => b.key === key) ?? BACKGROUNDS[1]
