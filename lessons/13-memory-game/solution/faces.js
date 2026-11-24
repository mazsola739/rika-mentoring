import { PEACOCK_PALETTE } from '@shared/ui/palette.js'

function color(key) {
  return PEACOCK_PALETTE.find((c) => c.key === key).hex
}

// Every pair gets its own flat colour: the site's 11 peacock colours and one lighter gold make 12.
const PAIR_COLORS = [
  color('deepTeal'),
  color('gold'),
  color('peacockBlue'),
  color('surface'),
  color('peacockGreen'),
  color('violet'),
  color('night'),
  color('orange'),
  color('turquoise'),
  color('sky'),
  color('magenta'),
  '#FFD866',
]

// A theme is a set of 12 faces (the hard level uses all of them) and a colour for the backs of the cards.
// Every face is [key, emoji, English name, Hungarian name]. A face never takes the colour of the card backs
// (a face-up card would look face down), it gets a light grey instead.
function makeTheme(key, name, back, list) {
  const faces = list.map(([faceKey, emoji, en, hu], i) => ({
    key: faceKey,
    emoji,
    color: PAIR_COLORS[i] === back ? '#E4E9F0' : PAIR_COLORS[i],
    name: { en, hu },
  }))
  return { key, name, back, faces }
}

export const THEMES = [
  makeTheme('animals', { en: 'Animals', hu: 'Állatok' }, color('peacockGreen'), [
    ['dog', '🐶', 'Dog', 'Kutya'],
    ['cat', '🐱', 'Cat', 'Macska'],
    ['fox', '🦊', 'Fox', 'Róka'],
    ['panda', '🐼', 'Panda', 'Panda'],
    ['frog', '🐸', 'Frog', 'Béka'],
    ['lion', '🦁', 'Lion', 'Oroszlán'],
    ['monkey', '🐵', 'Monkey', 'Majom'],
    ['rabbit', '🐰', 'Rabbit', 'Nyúl'],
    ['koala', '🐨', 'Koala', 'Koala'],
    ['tiger', '🐯', 'Tiger', 'Tigris'],
    ['pig', '🐷', 'Pig', 'Malac'],
    ['octopus', '🐙', 'Octopus', 'Polip'],
  ]),
  makeTheme('treats', { en: 'Treats', hu: 'Finomságok' }, color('violet'), [
    ['apple', '🍎', 'Apple', 'Alma'],
    ['banana', '🍌', 'Banana', 'Banán'],
    ['grapes', '🍇', 'Grapes', 'Szőlő'],
    ['strawberry', '🍓', 'Strawberry', 'Eper'],
    ['watermelon', '🍉', 'Watermelon', 'Görögdinnye'],
    ['cherries', '🍒', 'Cherries', 'Cseresznye'],
    ['kiwi', '🥝', 'Kiwi', 'Kivi'],
    ['pineapple', '🍍', 'Pineapple', 'Ananász'],
    ['carrot', '🥕', 'Carrot', 'Sárgarépa'],
    ['corn', '🌽', 'Corn', 'Kukorica'],
    ['doughnut', '🍩', 'Doughnut', 'Fánk'],
    ['cookie', '🍪', 'Cookie', 'Keksz'],
  ]),
  makeTheme('space', { en: 'Space', hu: 'Világűr' }, color('peacockBlue'), [
    ['rocket', '🚀', 'Rocket', 'Rakéta'],
    ['moon', '🌙', 'Moon', 'Hold'],
    ['star', '⭐', 'Star', 'Csillag'],
    ['planet', '🪐', 'Ringed planet', 'Gyűrűs bolygó'],
    ['earth', '🌍', 'Earth', 'Föld'],
    ['alien', '👽', 'Alien', 'Űrlény'],
    ['saucer', '🛸', 'Flying saucer', 'Repülő csészealj'],
    ['sun', '🌞', 'Sun', 'Nap'],
    ['telescope', '🔭', 'Telescope', 'Távcső'],
    ['shooting-star', '🌠', 'Shooting star', 'Hullócsillag'],
    ['milky-way', '🌌', 'Milky Way', 'Tejút'],
    ['comet', '☄️', 'Comet', 'Üstökös'],
  ]),
]

// A saved theme key that no longer exists falls back to the first theme.
export function themeByKey(key) {
  return THEMES.find((theme) => theme.key === key) ?? THEMES[0]
}

export function faceOf(theme, key) {
  return theme.faces.find((face) => face.key === key) ?? theme.faces[0]
}
