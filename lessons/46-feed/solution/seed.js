// Seed data for the fake backend. Texts are bilingual ({ en, hu }); posts written in the app are plain strings.
const HOUR = 60 * 60 * 1000
const ago = (hours) => new Date(Date.now() - hours * HOUR).toISOString()

export const COMMUNITIES = ['react', 'design', 'career']

export const SEED_POSTS = [
  {
    id: 'p1',
    community: 'react',
    author: 'lina_codes',
    createdAt: ago(5),
    score: 128,
    title: { en: 'What finally made useEffect click for you?', hu: 'Nálad mitől állt össze végre a useEffect?' },
    body: {
      en: 'I kept thinking of it as a lifecycle method. Then someone told me: an effect keeps your component in sync with something outside React. What was your aha moment?',
      hu: 'Sokáig életciklus-metódusként gondoltam rá. Aztán valaki azt mondta: egy effect a komponenst valami Reacten kívüli dologgal tartja szinkronban. Nálad mi volt az aha-élmény?',
    },
  },
  {
    id: 'p2',
    community: 'design',
    author: 'patternista',
    createdAt: ago(9),
    score: 96,
    title: { en: 'I turned my pattern collection into a colour system', hu: 'A mintagyűjteményemből színrendszert csináltam' },
    body: {
      en: 'Every pattern gets a solid colour, a dark and a light shade, and a text colour that passes contrast on white. Happy to share the spreadsheet.',
      hu: 'Minden minta kap egy fő színt, egy sötét és egy világos árnyalatot, meg egy szövegszínt, ami fehéren is elég kontrasztos. Szívesen megosztom a táblázatot.',
    },
  },
  {
    id: 'p3',
    community: 'career',
    author: 'mark_dev',
    createdAt: ago(26),
    score: 54,
    title: { en: 'First junior React interview next week: what should I practise?', hu: 'Jövő héten az első junior React interjúm: mit gyakoroljak?' },
    body: {
      en: 'They said there will be a small live coding task. I am comfortable with components and props, less so with effects and forms.',
      hu: 'Azt mondták, lesz egy kis élő kódolós feladat. A komponensek és a propok mennek, az effectek és az űrlapok kevésbé.',
    },
  },
  {
    id: 'p4',
    community: 'react',
    author: 'reducer_fan',
    createdAt: ago(50),
    score: 211,
    title: { en: 'Hot take: you probably do not need a state library yet', hu: 'Merész állítás: valószínűleg még nem kell állapotkezelő könyvtár' },
    body: {
      en: 'Context + useReducer covered our whole shop: cart, filters and checkout. We only reached for a library when several teams started working on the same state.',
      hu: 'A Context + useReducer lefedte az egész webshopunkat: kosár, szűrők, pénztár. Csak akkor nyúltunk könyvtárhoz, amikor több csapat kezdett ugyanazon az állapoton dolgozni.',
    },
  },
  {
    id: 'p5',
    community: 'design',
    author: 'night_owl',
    createdAt: ago(75),
    score: 37,
    title: { en: 'Dark mode palettes: do you invert or redesign?', hu: 'Sötét mód: invertálsz vagy újratervezel?' },
    body: {
      en: 'Simply inverting my light theme made the accent colours glow way too much. Curious how others handle it.',
      hu: 'A világos téma egyszerű invertálásától túlságosan világítottak a kiemelőszínek. Kíváncsi vagyok, ti hogyan oldjátok meg.',
    },
  },
  {
    id: 'p6',
    community: 'react',
    author: 'sam_ui',
    createdAt: ago(98),
    score: 73,
    title: { en: 'Keys in lists, explained with a shopping list', hu: 'A key a listákban, egy bevásárlólistán elmagyarázva' },
    body: {
      en: 'If you use the index as the key and then sort the list, React reuses the wrong items, and the checkbox jumps to another product. A stable id fixes it.',
      hu: 'Ha az indexet használod key-nek, majd rendezed a listát, a React rossz elemeket használ újra, és a pipa átugrik egy másik termékre. Egy stabil id megoldja.',
    },
  },
  {
    id: 'p7',
    community: 'career',
    author: 'patternista',
    createdAt: ago(146),
    score: 302,
    title: { en: 'I built 50 small React projects in a year. Ask me anything', hu: 'Egy év alatt 50 kis React projektet építettem. Kérdezz bármit!' },
    body: {
      en: 'From a password generator to a Reddit-style feed. Small, finished projects taught me more than one big unfinished one.',
      hu: 'A jelszógenerátortól a Reddit-szerű feedig. A kicsi, befejezett projektek többet tanítottak, mint egy nagy, félbehagyott.',
    },
  },
]

const c = (id, postId, parentId, author, hours, en, hu) => ({ id, postId, parentId, author, createdAt: ago(hours), body: { en, hu } })

export const SEED_COMMENTS = [
  c('c1', 'p1', null, 'sam_ui', 4.5, 'When I learned about the cleanup function. Every effect should be able to stop what it started.', 'Amikor megismertem a cleanup függvényt. Minden effectnek le kell tudnia állítani, amit elindított.'),
  c('c2', 'p1', 'c1', 'lina_codes', 4.2, 'This! StrictMode running effects twice finally made sense after that.', 'Ez az! Utána értettem meg, miért futtatja a StrictMode kétszer az effecteket.'),
  c('c3', 'p1', 'c2', 'mark_dev', 3.9, 'Same here, I thought it was a bug for weeks.', 'Nálam is, hetekig azt hittem, hogy ez egy hiba.'),
  c('c4', 'p1', 'c3', 'reducer_fan', 3.1, 'It is a feature: it shows you the missing cleanup early.', 'Ez funkció: idejében megmutatja a hiányzó cleanupot.'),
  c('c5', 'p1', null, 'patternista', 4, 'Reading “You might not need an effect” in the docs.', 'A dokumentáció „You might not need an effect” fejezete.'),
  c('c6', 'p1', 'c5', 'night_owl', 3.4, 'Half of my effects were derived state, honestly.', 'Őszintén, az effectjeim fele valójában számolt állapot volt.'),
  c('c7', 'p4', null, 'perf_nerd', 40, 'Agreed. Context re-renders are the only thing to watch.', 'Egyetértek. Csak a Context miatti újrarajzolásokra kell figyelni.'),
  c('c8', 'p4', 'c7', 'reducer_fan', 38, 'Splitting contexts and memoising the value fixes most of that.', 'A contextek szétbontása és az érték memoizálása ennek nagy részét megoldja.'),
  c('c9', 'p7', null, 'newbie_92', 120, 'Which one taught you the most?', 'Melyikből tanultál a legtöbbet?'),
  c('c10', 'p7', 'c9', 'patternista', 118, 'The Reddit clone, because of the recursive comment tree!', 'A Reddit-klónból, a rekurzív kommentfa miatt!'),
  c('c11', 'p7', 'c10', 'sam_ui', 117, 'Very meta.', 'Nagyon meta.'),
  c('c12', 'p3', null, 'lina_codes', 20, 'Lists and keys, controlled forms, and fetching with loading and error states.', 'Listák és key-ek, kontrollált űrlapok, és adatlekérés betöltés- és hibaállapottal.'),
  c('c13', 'p2', null, 'mark_dev', 8, 'Please share it!', 'Oszd meg, légyszi!'),
]
