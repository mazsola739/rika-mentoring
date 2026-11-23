// The story templates: the {words in curly brackets} become the fields to fill in.
// The same field can appear more than once: it only has to be filled in once.
// The stories are the ones the guide builds, in both languages.
export const TEMPLATES = {
  en: [
    {
      id: 'guest',
      title: 'The Morning Guest',
      text:
        '{name} woke up one morning to find a giant {animal} sitting on the end of the bed, desperate to {verb}. ' +
        'There was nothing for it: they spent all morning trying to {verb} together, until the neighbours clapped.',
    },
    {
      id: 'first-app',
      title: 'My First React App',
      text:
        '{name} built their very first React app: a {adjective} button that made {number} {animal} clones appear ' +
        'on the screen with every click. Their mentor only said: ' +
        '“{exclamation}! That is not a bug, it is a {colour} feature.”',
    },
    {
      id: 'holiday',
      title: 'Summer Holiday',
      text:
        'This summer we went on holiday {place}. Every morning we had {food} for breakfast, and our neighbour, a retired ' +
        '{job}, started to {verb} whenever they saw us. ' +
        'On the way home the whole bus sang: “{exclamation}, {place}!”',
    },
  ],
  hu: [
    {
      id: 'guest',
      title: 'A reggeli vendég',
      text:
        '{név} egy reggel arra ébredt, hogy egy {állat} ül az ágya szélén, és nagyon szeretne {ige}. ' +
        'Nem volt mit tenni: egész délelőtt együtt próbáltak {ige}, amíg a szomszédok tapsolni nem kezdtek.',
    },
    {
      id: 'first-app',
      title: 'Az első React-app',
      text:
        '{név} megírta élete első React-appját: egy {melléknév} gombot, amitől minden kattintásra ' +
        '{szám} {állat} jelent meg a képernyőn. A mentora csak ennyit mondott: ' +
        '„{felkiáltás}! Ez nem hiba, hanem egy {szín} funkció.”',
    },
    {
      id: 'holiday',
      title: 'Nyaralás',
      text:
        'Idén nyáron {hely} nyaraltunk. Minden reggel {étel} volt a reggeli, a szomszédunk pedig, egy nyugdíjas ' +
        '{foglalkozás}, mindig {ige} kezdett, amikor meglátott minket. ' +
        'Hazafelé az egész busz ezt énekelte: „{felkiáltás}, {hely}!”',
    },
  ],
}

// The template a player's own story starts from, until they write their own.
export const START_TEMPLATE = {
  en: 'Once upon a time there was a {adjective} {animal} who loved to {verb} more than anything in the world.',
  hu: 'Hol volt, hol nem volt, volt egyszer egy {melléknév} {állat}, aki mindennél jobban szeretett {ige}.',
}

// Examples for the fields (shown as placeholder text).
export const HINTS = {
  en: {
    name: 'e.g. Alex',
    animal: 'e.g. giraffe',
    verb: 'e.g. dance',
    adjective: 'e.g. sticky',
    number: 'e.g. 42',
    exclamation: 'e.g. Hooray',
    colour: 'e.g. lemon yellow',
    place: 'e.g. in the fridge',
    food: 'e.g. pancakes',
    job: 'e.g. firefighter',
  },
  hu: {
    név: 'pl. Bence',
    állat: 'pl. zsiráf',
    ige: 'pl. táncolni',
    melléknév: 'pl. ragacsos',
    szám: 'pl. 42',
    felkiáltás: 'pl. Juhé',
    szín: 'pl. citromsárga',
    hely: 'pl. a hűtőben',
    étel: 'pl. palacsinta',
    foglalkozás: 'pl. tűzoltó',
  },
}

// The pieces of a template: every } becomes a {, and we cut the text at every {.
// 'A {animal} wants to {verb}.' → ['A ', 'animal', ' wants to ', 'verb', '.']
// The odd positions (1, 3, 5…) hold the field names, the even ones the plain text.
export function splitTemplate(text) {
  return text.replaceAll('}', '{').split('{')
}

// The template's unique field names, in the order they first appear.
export function fieldsOf(text) {
  const names = splitTemplate(text).filter((part, i) => i % 2 === 1)
  return Array.from(new Set(names))
}

// The word typed for a field, or '' if there is none yet. Only the object's own keys count,
// so a home-made field called {constructor} does not pick up a built-in function.
export function wordFor(words, field) {
  return Object.hasOwn(words, field) ? words[field] : ''
}

// The finished story as one string (for reading aloud).
export function fillTemplate(text, words) {
  return splitTemplate(text)
    .map((part, i) => (i % 2 === 1 ? wordFor(words, part).trim() : part))
    .join('')
}

// What is wrong with a home-made template? '' if nothing, otherwise a key of TEXT.problems.
export function templateProblem(text) {
  // Cutting a text at every { gives one more piece than the number of { in it.
  const opens = text.split('{').length - 1
  const closes = text.split('}').length - 1
  if (opens !== closes) return 'unbalanced'

  const fields = fieldsOf(text)
  if (fields.length === 0) return 'noFields'
  if (fields.some((field) => field.trim() === '')) return 'emptyField'
  return ''
}
