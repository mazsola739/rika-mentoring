// Seed text is bilingual ({ en, hu }); cards the user writes or loads are plain strings.
export const label = (value, lang) => (typeof value === 'string' ? value : value[lang])

const card = (id, q, a) => ({ id, q, a })

const REACT_CARDS = [
  card(
    'jsx',
    { en: 'What is JSX?', hu: 'Mi a JSX?' },
    {
      en: 'A syntax extension that lets you write HTML-like markup inside JavaScript. It compiles to function calls.',
      hu: 'Szintaxisbővítés, amivel HTML-szerű jelölést írhatsz JavaScriptben. Függvényhívásokká fordul le.',
    },
  ),
  card(
    'component',
    { en: 'What is a component?', hu: 'Mi az a komponens?' },
    {
      en: 'A function that returns JSX. Its name starts with a capital letter, e.g. <Card />.',
      hu: 'Egy függvény, ami JSX-et ad vissza. A neve nagybetűvel kezdődik, pl. <Card />.',
    },
  ),
  card(
    'props',
    { en: 'What are props?', hu: 'Mik a propok?' },
    {
      en: 'Read-only inputs that a parent passes to a child component, like arguments of a function.',
      hu: 'Csak olvasható bemenetek, amiket a szülő ad át a gyerek komponensnek, mint egy függvény paramétereit.',
    },
  ),
  card(
    'use-state',
    { en: 'What does useState return?', hu: 'Mit ad vissza a useState?' },
    {
      en: 'An array with the current value and a setter: const [count, setCount] = useState(0)',
      hu: 'Egy tömböt az aktuális értékkel és egy beállító függvénnyel: const [count, setCount] = useState(0)',
    },
  ),
  card(
    'key',
    { en: 'Why do list items need a key?', hu: 'Miért kell key a listaelemeknek?' },
    {
      en: 'So React can tell which item changed, moved or disappeared between two renders.',
      hu: 'Hogy a React tudja, melyik elem változott, mozdult el vagy tűnt el két renderelés között.',
    },
  ),
  card(
    'use-effect',
    { en: 'When does useEffect run?', hu: 'Mikor fut le a useEffect?' },
    {
      en: 'After React has updated the screen, and again whenever one of its dependencies changes.',
      hu: 'Miután a React frissítette a képernyőt, és újra, ha valamelyik függősége megváltozik.',
    },
  ),
  card(
    'cleanup',
    { en: 'What is a cleanup function?', hu: 'Mi a takarító függvény?' },
    {
      en: 'The function returned from an effect. React calls it before the effect runs again and when the component unmounts.',
      hu: 'Az effektből visszaadott függvény. A React az effekt újrafutása előtt és a komponens eltűnésekor hívja meg.',
    },
  ),
  card(
    'controlled',
    { en: 'What is a controlled input?', hu: 'Mi az a vezérelt mező?' },
    {
      en: 'An input whose value comes from state and changes only through onChange.',
      hu: 'Olyan beviteli mező, aminek az értéke az állapotból jön, és csak az onChange-en keresztül változik.',
    },
  ),
  card(
    'conditional',
    { en: 'How do you render something conditionally?', hu: 'Hogyan jelenítesz meg valamit feltételesen?' },
    {
      en: 'With && or the ternary operator: {isOpen && <Modal />}',
      hu: 'A && vagy a ternáris operátor segítségével: {isOpen && <Modal />}',
    },
  ),
  card(
    'immutable',
    { en: 'Why should you never mutate state directly?', hu: 'Miért nem szabad közvetlenül módosítani az állapotot?' },
    {
      en: 'React compares references. Create a new array or object (e.g. with spread) so it notices the change.',
      hu: 'A React referenciákat hasonlít össze. Hozz létre új tömböt vagy objektumot (pl. spread-del), hogy észrevegye a változást.',
    },
  ),
  card(
    'custom-hook',
    { en: 'What is a custom hook?', hu: 'Mi az a saját hook?' },
    {
      en: 'A function whose name starts with “use” and that calls other hooks, like useLocalStorage in this app.',
      hu: 'Egy „use”-zal kezdődő nevű függvény, ami más hookokat hív, mint ebben az appban a useLocalStorage.',
    },
  ),
]

const SPACE_CARDS = [
  card(
    'venus-day',
    { en: 'Which planet has a day longer than its year?', hu: 'Melyik bolygón hosszabb egy nap, mint egy év?' },
    {
      en: 'Venus: one turn on its axis takes 243 Earth days, one trip around the Sun only 225.',
      hu: 'A Vénuszon: egy fordulat a tengelye körül 243 földi nap, egy kör a Nap körül csak 225.',
    },
  ),
  card(
    'sunlight',
    { en: 'How long does sunlight take to reach Earth?', hu: 'Mennyi idő alatt ér el a napfény a Földig?' },
    { en: 'About 8 minutes and 20 seconds.', hu: 'Nagyjából 8 perc 20 másodperc alatt.' },
  ),
  card(
    'hottest-planet',
    { en: 'Which planet is the hottest?', hu: 'Melyik a legforróbb bolygó?' },
    {
      en: 'Venus, at about 465 °C: its thick clouds trap the heat. Mercury is closer to the Sun, but cooler.',
      hu: 'A Vénusz, nagyjából 465 °C-kal: a vastag felhőzete csapdába ejti a hőt. A Merkúr közelebb van a Naphoz, mégis hűvösebb.',
    },
  ),
  card(
    'olympus-mons',
    { en: 'Where is the tallest volcano of the Solar System?', hu: 'Hol van a Naprendszer legmagasabb vulkánja?' },
    {
      en: 'On Mars: Olympus Mons is about 22 km high, more than twice as tall as Mount Everest.',
      hu: 'A Marson: az Olympus Mons nagyjából 22 km magas, több mint kétszer olyan magas, mint a Mount Everest.',
    },
  ),
  card(
    'sun-size',
    { en: 'How many Earths would fit inside the Sun?', hu: 'Hány Föld férne el a Napban?' },
    { en: 'About 1.3 million.', hu: 'Nagyjából 1,3 millió.' },
  ),
  card(
    'uranus',
    { en: 'Which planet rolls around the Sun on its side?', hu: 'Melyik bolygó gurul az oldalán a Nap körül?' },
    { en: 'Uranus: its axis is tilted by about 98 degrees.', hu: 'Az Uránusz: a tengelye nagyjából 98 fokkal megdőlt.' },
  ),
  card(
    'moon-face',
    { en: 'Why do we always see the same side of the Moon?', hu: 'Miért látjuk mindig a Hold ugyanazon oldalát?' },
    {
      en: 'The Moon turns once on its axis in exactly the time it takes to go around Earth once.',
      hu: 'A Hold pontosan annyi idő alatt fordul meg egyszer a tengelye körül, amennyi idő alatt egyszer megkerüli a Földet.',
    },
  ),
  card(
    'light-year',
    { en: 'Is a light-year a time or a distance?', hu: 'A fényév idő vagy távolság?' },
    {
      en: 'A distance: how far light travels in a year, about 9.5 trillion kilometres.',
      hu: 'Távolság: ennyit tesz meg a fény egy év alatt, nagyjából 9,5 billió kilométert.',
    },
  ),
]

// The two sample decks of the guide. builtIn decks cannot be deleted, and their sample cards can be restored.
export const SEED_DECKS = [
  { id: 'react-basics', builtIn: true, name: { en: 'React basics', hu: 'React-alapok' }, cards: REACT_CARDS },
  { id: 'space-quiz', builtIn: true, name: { en: 'Space quiz', hu: 'Űrkvíz' }, cards: SPACE_CARDS },
]

// Decks saved by an older version may lack a sample deck (or be broken): the samples always come first,
// with their names from the seed, followed by the user's own decks.
export function withSampleDecks(saved) {
  if (!Array.isArray(saved)) return SEED_DECKS
  const isDeck = (d) => Boolean(d) && Array.isArray(d.cards)
  const samples = SEED_DECKS.map((seed) => {
    const found = saved.find((d) => isDeck(d) && d.id === seed.id)
    return found ? { ...found, name: seed.name, builtIn: true } : seed
  })
  const own = saved.filter((d) => isDeck(d) && !SEED_DECKS.some((seed) => seed.id === d.id))
  return [...samples, ...own]
}

export const seedCardsOf = (deckId) => SEED_DECKS.find((d) => d.id === deckId)?.cards ?? []

// Fisher–Yates shuffle on a copy: the original array (state!) stays untouched.
export function shuffled(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
