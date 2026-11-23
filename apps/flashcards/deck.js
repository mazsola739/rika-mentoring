// Seed text is bilingual ({ en, hu }); cards the user writes are plain strings.
export const label = (value, lang) => (typeof value === 'string' ? value : value[lang])

export const SEED_DECK_ID = 'react-basics'

const card = (id, q, a) => ({ id, q, a })

export const SEED_CARDS = [
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
    { en: 'What is a cleanup function?', hu: 'Mi a cleanup függvény?' },
    {
      en: 'The function returned from an effect. React calls it before the effect runs again and when the component unmounts.',
      hu: 'Az effectből visszaadott függvény. A React az effect újrafutása előtt és a komponens eltávolításakor hívja meg.',
    },
  ),
  card(
    'controlled',
    { en: 'What is a controlled input?', hu: 'Mi az a kontrollált input?' },
    {
      en: 'An input whose value comes from state and changes only through onChange.',
      hu: 'Olyan beviteli mező, aminek az értéke a state-ből jön, és csak az onChange-en keresztül változik.',
    },
  ),
  card(
    'conditional',
    { en: 'How do you render something conditionally?', hu: 'Hogyan jelenítesz meg valamit feltételesen?' },
    {
      en: 'With && or the ternary operator: {isOpen && <Modal />}',
      hu: 'A && vagy a feltételes (ternary) operátorral: {isOpen && <Modal />}',
    },
  ),
  card(
    'immutable',
    { en: 'Why should you never mutate state directly?', hu: 'Miért nem szabad közvetlenül módosítani a state-et?' },
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

export const SEED_DECKS = [
  { id: SEED_DECK_ID, builtIn: true, name: { en: 'React basics', hu: 'React alapok' }, cards: SEED_CARDS },
]

// Fisher–Yates shuffle on a copy: the original array (state!) stays untouched.
export function shuffled(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
