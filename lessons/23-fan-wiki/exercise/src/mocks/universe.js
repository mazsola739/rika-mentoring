// The Huebloom Isles: a made-up cartoon universe for the lesson's wiki API.
// Floating islands in the sky run on colour. The lighthouse on Plumage Point shines it to every
// island through a lamp made of peacock-feather "eyes", and the Grey Drizzle, a drifting fog,
// fades whatever it touches. Every name, place and episode here is original.
// Text fields are bilingual { en, hu }; character names are proper names and stay the same.

const t = (en, hu) => ({ en, hu })

export const SPECIES = {
  peafolk: t('Peafolk', 'Pávanép'),
  cloudwhale: t('Cloudwhale', 'Felhőbálna'),
  robot: t('Robot', 'Robot'),
  blotling: t('Blotling', 'Pacaló'),
  prismite: t('Prismite', 'Prizmit'),
  human: t('Human', 'Ember'),
  brushfox: t('Brushfox', 'Ecsetróka'),
  puddlefrog: t('Puddlefrog', 'Tócsabéka'),
  glowmoth: t('Glowmoth', 'Fénymoly'),
  capling: t('Capling', 'Kalapka'),
  snail: t('Snail', 'Csiga'),
  huewisp: t('Hue Wisp', 'Színlidérc'),
}

const UPPER = t('Upper Isles', 'Felső-szigetek')
const MIDDLE = t('Middle Isles', 'Középső-szigetek')
const LOWER = t('Lower Isles', 'Alsó-szigetek')

export const LOCATIONS = [
  { id: 1, name: t('Plumage Point', 'Tollazat-fok'), type: t('Lighthouse island', 'Világítótorony-sziget'), region: UPPER },
  { id: 2, name: t('Sky Harbour', 'Égi kikötő'), type: t('Floating port', 'Lebegő kikötő'), region: UPPER },
  { id: 3, name: t('Marigold Market', 'Körömvirág-piac'), type: t('Market town', 'Vásárváros'), region: MIDDLE },
  { id: 4, name: t('Tangerine Terraces', 'Mandarin-teraszok'), type: t('Hillside town', 'Domboldali város'), region: MIDDLE },
  { id: 5, name: t('Violet Vale', 'Ibolya-völgy'), type: t('Valley', 'Völgy'), region: UPPER },
  { id: 6, name: t('Crayon Caverns', 'Zsírkréta-barlangok'), type: t('Caves', 'Barlangrendszer'), region: LOWER },
  { id: 7, name: t('Mintwater Marsh', 'Mentavíz-mocsár'), type: t('Marsh', 'Mocsár'), region: LOWER },
  { id: 8, name: t('Cobalt Cliffs', 'Kobalt-sziklák'), type: t('Cliffs', 'Sziklafal'), region: MIDDLE },
  { id: 9, name: t('Rosepetal Reef', 'Rózsaszirom-zátony'), type: t('Sky reef', 'Égi zátony'), region: LOWER },
  { id: 10, name: t('Lemon Lagoon', 'Citrom-lagúna'), type: t('Lagoon', 'Lagúna'), region: MIDDLE },
  {
    id: 11,
    name: t('The Grey Drizzle', 'A Szürke Szitálás'),
    type: t('Fog bank', 'Ködfelhő'),
    region: t('Off the map', 'A térképen túl'),
  },
  { id: 12, name: t('Indigo Deeps', 'Indigó-mélység'), type: t('Cloud sea', 'Felhőtenger'), region: LOWER },
]

// Two seasons, one episode every Saturday. `cast` lists the characters (by id) who appear in it.
export const EPISODES = [
  {
    id: 1,
    episode: 'S01E01',
    air: '2025-03-01',
    name: t('The Lighthouse Has Lost Its Blue', 'A világítótorony elvesztette a kékjét'),
    cast: [1, 3, 4, 2, 6, 5, 13, 17],
  },
  {
    id: 2,
    episode: 'S01E02',
    air: '2025-03-08',
    name: t('Marigold Market Mix-Up', 'Kavarodás a Körömvirág-piacon'),
    cast: [1, 3, 4, 2, 6, 7, 14, 23, 30, 36],
  },
  {
    id: 3,
    episode: 'S01E03',
    air: '2025-03-15',
    name: t('A Whale of a Weather Report', 'Bálnányi időjárás-jelentés'),
    cast: [1, 3, 4, 2, 7, 8, 16, 34],
  },
  {
    id: 4,
    episode: 'S01E04',
    air: '2025-03-22',
    name: t('Steepwell Boils Over', 'Steepwell felforr'),
    cast: [1, 3, 2, 17, 30, 14],
  },
  {
    id: 5,
    episode: 'S01E05',
    air: '2025-03-29',
    name: t('Night of the Glowmoths', 'A fénymolyok éjszakája'),
    cast: [1, 3, 4, 2, 6, 5, 9, 20, 31],
  },
  {
    id: 6,
    episode: 'S01E06',
    air: '2025-04-05',
    name: t('The Crayon Cavern Echo', 'Visszhang a Zsírkréta-barlangokban'),
    cast: [1, 3, 4, 7, 15, 35, 25, 24],
  },
  {
    id: 7,
    episode: 'S01E07',
    air: '2025-04-12',
    name: t('Snail Mail, Fast Mail', 'Csigaposta, gyorsposta'),
    cast: [1, 3, 4, 2, 10, 23, 39, 31],
  },
  {
    id: 8,
    episode: 'S01E08',
    air: '2025-04-19',
    name: t('Who Painted the Moon?', 'Ki festette ki a Holdat?'),
    cast: [1, 3, 4, 2, 6, 7, 19, 12, 9],
  },
  {
    id: 9,
    episode: 'S01E09',
    air: '2025-04-26',
    name: t('Into the Grey Drizzle', 'Be a Szürke Szitálásba'),
    cast: [1, 4, 2, 5, 12, 13, 20, 28, 25],
  },
  {
    id: 10,
    episode: 'S01E10',
    air: '2025-05-03',
    name: t('A Tail of Many Eyes', 'Száz szem, egy pávafarok'),
    cast: [1, 3, 4, 2, 6, 7, 5, 12, 13, 40, 17],
  },
  {
    id: 11,
    episode: 'S02E01',
    air: '2026-03-07',
    name: t('Back to Bright', 'Vissza a ragyogásba'),
    cast: [1, 3, 4, 2, 6, 12, 18, 27],
  },
  {
    id: 12,
    episode: 'S02E02',
    air: '2026-03-14',
    name: t('The Mintwater Mystery', 'A Mentavíz-mocsár rejtélye'),
    cast: [1, 3, 4, 5, 8, 11, 37, 33, 36],
  },
  {
    id: 13,
    episode: 'S02E03',
    air: '2026-03-21',
    name: t('Brushfox and the Missing Stroke', 'Az ecsetróka és az eltűnt ecsetvonás'),
    cast: [1, 3, 4, 2, 7, 19, 29, 14],
  },
  {
    id: 14,
    episode: 'S02E04',
    air: '2026-03-28',
    name: t('The Caplings’ Hat Parade', 'A kalapkák kalapparádéja'),
    cast: [1, 3, 4, 2, 6, 11, 24, 36],
  },
  {
    id: 15,
    episode: 'S02E05',
    air: '2026-04-04',
    name: t('Reef of a Thousand Pinks', 'Az ezer rózsaszín zátonya'),
    cast: [1, 3, 2, 18, 27, 12, 38],
  },
  {
    id: 16,
    episode: 'S02E06',
    air: '2026-04-11',
    name: t('Lemon Lagoon Regatta', 'Regatta a Citrom-lagúnán'),
    cast: [1, 3, 4, 2, 7, 21, 26, 39, 30],
  },
  {
    id: 17,
    episode: 'S02E07',
    air: '2026-04-18',
    name: t('The Prismite Who Couldn’t Shine', 'A prizmit, aki nem tudott ragyogni'),
    cast: [1, 3, 4, 5, 25, 38, 32],
  },
  {
    id: 18,
    episode: 'S02E08',
    air: '2026-04-25',
    name: t('Sky Harbour Lost and Found', 'Talált tárgyak az Égi kikötőben'),
    cast: [1, 3, 4, 2, 6, 12, 10, 27, 22, 34, 28],
  },
  {
    id: 19,
    episode: 'S02E09',
    air: '2026-05-02',
    name: t('The Great Repaint, Part One', 'A nagy újrafestés, 1. rész'),
    cast: [1, 3, 4, 2, 6, 7, 5, 12, 32, 22, 31, 9],
  },
  {
    id: 20,
    episode: 'S02E10',
    air: '2026-05-09',
    name: t('The Great Repaint, Part Two', 'A nagy újrafestés, 2. rész'),
    cast: [1, 3, 4, 2, 6, 7, 5, 12, 13, 40, 32, 16, 26, 37],
  },
]

// status: 'Bright' (full of colour), 'Faded' (touched by the Grey Drizzle) or 'unknown'.
// origin and location are location ids; null means nobody knows.
const CAST = [
  [1, 'Juno Plumewick', 'Bright', 'peafolk', t('Lighthouse apprentice', 'Világítótorony-inas'), 'Female', 1, 1],
  [2, 'Captain Nimbus', 'Bright', 'cloudwhale', t('Sky ferry captain', 'Égi komp kapitánya'), 'Male', 2, 2],
  [3, 'Steepwell', 'Bright', 'robot', t('Teapot robot', 'Teáskanna-robot'), 'Genderless', 3, 1],
  [4, 'Dot Blotsworth', 'Bright', 'blotling', null, 'Female', 6, 1],
  [5, 'Professor Hexley', 'Bright', 'prismite', t('Crystal scholar', 'Kristálytudós'), 'Genderless', 5, 5],
  [6, 'Granny Marjoram', 'Bright', 'human', t('Lighthouse keeper', 'Világítótorony-őr'), 'Female', 1, 1],
  [7, 'Rusty Brushtail', 'Bright', 'brushfox', t('Street painter', 'Utcafestő'), 'Male', 4, 3],
  [8, 'Mossimo Croakley', 'Bright', 'puddlefrog', t('Weather forecaster', 'Időjós'), 'Male', 7, 7],
  [9, 'Lumen', 'Bright', 'glowmoth', t('Night courier', 'Éjszakai futár'), 'Female', 5, 2],
  [10, 'Shelby Slowpost', 'Bright', 'snail', t('Postmaster', 'Postamester'), 'Female', 2, 2],
  [11, 'Mayor Morel', 'Bright', 'capling', t('Mayor', 'Polgármester'), 'Male', 7, 7],
  [12, 'Duke Drabwell', 'unknown', 'human', t('Colour collector', 'Színgyűjtő'), 'Male', null, 11],
  [13, 'Azura', 'Faded', 'huewisp', t('Blue wisp', 'Kék lidérc'), 'Genderless', 1, 11],
  [14, 'Marigold Mae', 'Bright', 'human', t('Market trader', 'Piaci árus'), 'Female', 3, 3],
  [15, 'Pebble', 'Bright', 'blotling', t('Little blotling', 'Kis pacaló'), 'unknown', 6, 6],
  [16, 'Old Fathom', 'Bright', 'cloudwhale', t('Storm elder', 'Viharvén'), 'Male', 12, 12],
  [17, 'Sprocket', 'Bright', 'robot', t('Lamp-polishing robot', 'Lámpafényesítő robot'), 'Genderless', 1, 1],
  [18, 'Coral Quill', 'Bright', 'peafolk', t('Reef diver', 'Zátonybúvár'), 'Female', 9, 9],
  [19, 'Tansy Brushtail', 'Bright', 'brushfox', t('Sign painter', 'Cégérfestő'), 'Female', 4, 4],
  [20, 'Flicker', 'Faded', 'glowmoth', t('Lantern moth', 'Lámpásmoly'), 'Male', 5, 11],
  [21, 'Sir Puffington', 'Bright', 'puddlefrog', t('Regatta champion', 'Regattabajnok'), 'Male', 10, 10],
  [22, 'Ottoline Inkwell', 'Bright', 'human', t('Mapmaker', 'Térképész'), 'Female', 2, 8],
  [23, 'Biscuit', 'Bright', 'snail', t('Racing snail', 'Versenycsiga'), 'Male', 3, 3],
  [24, 'Chanterelle', 'Bright', 'capling', t('Choir leader', 'Kórusvezető'), 'Female', 7, 6],
  [25, 'Quartzby', 'Faded', 'prismite', t('Gem miner', 'Drágakőbányász'), 'Male', 6, 11],
  [26, 'Saffron', 'Bright', 'huewisp', t('Yellow wisp', 'Sárga lidérc'), 'Genderless', 10, 10],
  [27, 'Rosa Rubytail', 'Bright', 'peafolk', t('Harbour pilot', 'Révkalauz'), 'Female', 2, 2],
  [28, 'Mister Gloam', 'unknown', 'human', t('Fog merchant', 'Ködkereskedő'), 'Male', null, null],
  [29, 'Bramble', 'Bright', 'brushfox', t('Cub', 'Kölyök'), 'Male', 4, 4],
  [30, 'Fizzwick', 'Bright', 'robot', t('Soda-fountain robot', 'Szódagép-robot'), 'Genderless', 10, 3],
  [31, 'Wren Featherby', 'Bright', 'peafolk', t('Courier', 'Futár'), 'Male', 1, 5],
  [32, 'Lady Lilac', 'Bright', 'human', t('Duchess of Violet Vale', 'Ibolya-völgy hercegnője'), 'Female', 5, 5],
  [33, 'Dewdrop', 'Faded', 'puddlefrog', t('Tadpole', 'Ebihal'), 'unknown', 7, 11],
  [34, 'Cirrus', 'Bright', 'cloudwhale', t('Whale calf', 'Bálnaborjú'), 'Female', 2, 2],
  [35, 'Smudge', 'Faded', 'blotling', null, 'Male', 6, null],
  [36, 'Doctor Truffle', 'Bright', 'capling', t('Doctor', 'Doktor'), 'Male', 7, 3],
  [37, 'Verdigris', 'Bright', 'huewisp', t('Green wisp', 'Zöld lidérc'), 'Genderless', 7, 7],
  [38, 'Opal', 'unknown', 'prismite', null, 'Female', 8, null],
  [39, 'Turbo Tess', 'Bright', 'snail', t('Racing snail', 'Versenycsiga'), 'Female', 3, 10],
  [40, 'Ember Plumewick', 'unknown', 'peafolk', t('Explorer', 'Felfedező'), 'Female', 1, null],
]

// A fixed "created" time for each record, like the timestamps a real database keeps.
const createdAt = (n) => new Date(Date.UTC(2026, 5, 1, 9) + n * 37 * 60_000).toISOString()

export const CHARACTERS = CAST.map(([id, name, status, species, type, gender, origin, location]) => ({
  id,
  name,
  status,
  species,
  type,
  gender,
  origin,
  location,
  // The episodes come from the casts above, so the two lists can never disagree.
  episodes: EPISODES.filter((episode) => episode.cast.includes(id)).map((episode) => episode.id),
  created: createdAt(id),
}))

for (const location of LOCATIONS) {
  location.residents = CHARACTERS.filter((c) => c.location === location.id).map((c) => c.id)
  location.created = createdAt(100 + location.id)
}

for (const episode of EPISODES) episode.created = createdAt(200 + episode.id)
