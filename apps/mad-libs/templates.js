// A sablonokban a {kapcsos zárójeles} szavak lesznek a kitöltendő mezők.
// Ugyanaz a mező többször is szerepelhet: egyszer kell kitölteni.
export const TEMPLATES = {
  hu: [
    {
      id: 'studio',
      title: 'A tervezőstúdió',
      text: 'Egy {napszak} {név} besétált a tervezőstúdióba egy {melléknév} vászonnal. „Szeretném, ha {állat} mintát terveznének rá” – mondta. A tervező {szám} másodpercig gondolkodott, aztán {ige} kezdett örömében. Azóta a minta neve: {becenév}.',
    },
    {
      id: 'first-app',
      title: 'Az első React-appom',
      text: 'Ma megírtam életem első React-appját: egy {melléknév} {tárgy}-számlálót. Amikor megnyomtam a gombot, {szám} {állat} jelent meg a képernyőn, és kórusban kiabálták: „{felkiáltás}!” A mentorom csak annyit mondott: „Ez nem bug, ez egy {szín} feature.” Este {hely} ünnepeltem egy tányér {étel} mellett.',
    },
    {
      id: 'holiday',
      title: 'Nyaralás',
      text: 'Idén nyáron {hely} nyaraltunk. Minden reggel {étel} volt a reggeli, a szomszédunk pedig, egy {foglalkozás}, mindig {ige} kezdett, amikor meglátott minket. A legjobb nap az volt, amikor {szám} {állat} úszott el mellettünk {szín} úszógumiban. Hazafelé mindenki ezt énekelte: „{felkiáltás}, {név}!”',
    },
  ],
  en: [
    {
      id: 'studio',
      title: 'The Design Studio',
      text: 'One {time of day}, {name} walked into the design studio carrying a {adjective} canvas. “I’d like {animal} prints all over it,” they said. The designer thought for {number} seconds, then started to {verb} with joy. Ever since, the pattern has been called {nickname}.',
    },
    {
      id: 'first-app',
      title: 'My First React App',
      text: 'Today I built my very first React app: a {adjective} {object} counter. When I clicked the button, {number} {plural animal} appeared on the screen and shouted in chorus: “{exclamation}!” My mentor just said: “That’s not a bug, that’s a {color} feature.” In the evening I celebrated {place} with a plate of {food}.',
    },
    {
      id: 'holiday',
      title: 'Summer Holiday',
      text: 'This summer we spent our holiday {place}. Every morning we had {food} for breakfast, and our neighbor, a {job}, started to {verb} whenever they saw us. The best day was when {number} {plural animal} floated past us in {color} rubber rings. On the way home everyone sang: “{exclamation}, {name}!”',
    },
  ],
}

// Segítő példák a mezőkhöz (placeholder szövegként jelennek meg).
export const HINTS = {
  hu: {
    napszak: 'pl. esős reggel',
    név: 'pl. Bence',
    melléknév: 'pl. ragacsos',
    állat: 'pl. zsiráf',
    szám: 'pl. 42',
    ige: 'főnévi igenév, pl. táncolni',
    becenév: 'pl. Pöttyös Panna',
    tárgy: 'pl. zokni',
    felkiáltás: 'pl. Juhé',
    szín: 'pl. citromsárga',
    hely: 'pl. a hűtőben',
    étel: 'pl. palacsinta',
    foglalkozás: 'pl. tűzoltó',
  },
  en: {
    'time of day': 'e.g. rainy morning',
    name: 'e.g. Alex',
    adjective: 'e.g. sticky',
    animal: 'e.g. giraffe',
    'plural animal': 'e.g. penguins',
    number: 'e.g. 42',
    verb: 'e.g. dance',
    nickname: 'e.g. Polka Dot Polly',
    object: 'e.g. sock',
    exclamation: 'e.g. Hooray',
    color: 'e.g. lemon-yellow',
    place: 'e.g. in the fridge',
    food: 'e.g. pancakes',
    job: 'e.g. firefighter',
  },
}

// A sablon szövegéből kigyűjti az egyedi mezőneveket, megjelenési sorrendben.
export function fieldsOf(text) {
  return [...new Set([...text.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]))]
}

// A sablont darabokra bontja: sima szöveg és kitöltött mező felváltva.
export function fill(text, values) {
  return text.split(/(\{[^}]+\})/g).map((part) => {
    const match = part.match(/^\{([^}]+)\}$/)
    return match ? { field: match[1], value: values[match[1]] } : { text: part }
  })
}
