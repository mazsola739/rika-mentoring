// The TV catalogue behind the lessons' own TV API (see ./shows-handlers.js).
// Every show, channel and person here is made up for the lessons: no real titles, people or logos.
// The records are kept short; the handlers turn them into the full JSON a TV API sends.

// Channels: "network" is classic TV, "web" a streaming service (the API splits them like real TV APIs do).
const COUNTRY = {
  GB: { name: 'United Kingdom', code: 'GB', timezone: 'Europe/London' },
  US: { name: 'United States', code: 'US', timezone: 'America/New_York' },
  CA: { name: 'Canada', code: 'CA', timezone: 'America/Toronto' },
  HU: { name: 'Hungary', code: 'HU', timezone: 'Europe/Budapest' },
  ES: { name: 'Spain', code: 'ES', timezone: 'Europe/Madrid' },
  JP: { name: 'Japan', code: 'JP', timezone: 'Asia/Tokyo' },
  FR: { name: 'France', code: 'FR', timezone: 'Europe/Paris' },
  NO: { name: 'Norway', code: 'NO', timezone: 'Europe/Oslo' },
  KR: { name: 'Korea, Republic of', code: 'KR', timezone: 'Asia/Seoul' },
}

export const CHANNELS = {
  lantern: { id: 1, name: 'Lantern One', kind: 'network', country: COUNTRY.GB },
  kestrel: { id: 2, name: 'Kestrel TV', kind: 'network', country: COUNTRY.US },
  copperpot: { id: 3, name: 'Copperpot', kind: 'network', country: COUNTRY.US },
  pocket: { id: 4, name: 'Pocket Kids', kind: 'network', country: COUNTRY.GB },
  hilltop: { id: 5, name: 'Hilltop Channel', kind: 'network', country: COUNTRY.CA },
  kokeny: { id: 6, name: 'Kökény TV', kind: 'network', country: COUNTRY.HU },
  limon: { id: 7, name: 'Canal Limón', kind: 'network', country: COUNTRY.ES },
  tsubame: { id: 8, name: 'Tsubame TV', kind: 'network', country: COUNTRY.JP },
  mirabelle: { id: 9, name: 'Télé Mirabelle', kind: 'network', country: COUNTRY.FR },
  fjell: { id: 10, name: 'Fjellkanalen', kind: 'network', country: COUNTRY.NO },
  haneul: { id: 11, name: 'Haneul TV', kind: 'network', country: COUNTRY.KR },
  tidepool: { id: 21, name: 'Tidepool+', kind: 'web' },
  nebula: { id: 22, name: 'Nebula Nine', kind: 'web' },
  riverlight: { id: 23, name: 'Riverlight', kind: 'web' },
}

// One record per show.
//   years: [first, last] – no last year while the show is still running; no years at all before its premiere
//   seasons × episodes: how many seasons and episodes per season
//   leads: the main characters (the rest of the cast is generated); roles: the people in unscripted shows
//   poster: how the poster is drawn (style + options, see shows-handlers.js); no poster yet = null
const show = (id, name, type, language, genres, years, rating, runtime, channel, seasons, episodes, summary, extra = {}) => ({
  id,
  name,
  type,
  language,
  genres,
  years,
  rating,
  runtime,
  channel,
  seasons,
  episodes,
  summary,
  leads: [],
  poster: null,
  ...extra,
})

// prettier-ignore
export const SHOWS = [
  show(1, 'Lighthouse at Lowtide', 'Scripted', 'English', ['Drama', 'Mystery'], [2019, 2023], 8.1, 50, 'lantern', 4, 8,
    'When the old keeper retires, his granddaughter Nell takes over a lighthouse whose lamp keeps signalling to ships that nobody else can see.',
    { leads: ['Nell Avery', 'Old Tobias'], poster: { style: 'beam', font: 'serif' } }),
  show(2, 'Three A.M. Bakery', 'Scripted', 'English', ['Comedy', 'Food'], [2021], 7.6, 25, 'kestrel', 3, 10,
    'Four night-shift bakers, one temperamental oven and a town that wakes up hungry. Every episode ends with a loaf, a lesson or a small kitchen fire.',
    { leads: ['Dot Farrow', 'Marco Bell'], poster: { style: 'blocks', font: 'heavy' } }),
  show(3, 'Orbit of Small Things', 'Scripted', 'English', ['Science-Fiction', 'Drama'], [2022], 8.7, 55, 'nebula', 2, 8,
    'On a research station circling a tiny moon, a crew of six slowly realises that the moon is circling them back.',
    { leads: ['Commander Ines Halloran', 'Dr. Theo Marsh'], poster: { style: 'orbit', font: 'sans' } }),
  show(4, 'Inspector Gherkin', 'Animation', 'English', ['Children', 'Comedy', 'Mystery'], [2018], 7.9, 11, 'pocket', 5, 26,
    'A very serious cucumber solves very silly mysteries in the vegetable drawer, with help from his loyal assistant, a nervous radish.',
    { leads: ['Inspector Gherkin', 'Constable Radish'], poster: { style: 'critter', critter: 'gherkin', palette: 'Pickle' } }),
  show(5, 'Salt & Thunder', 'Documentary', 'English', ['Nature'], [2020, 2020], 8.9, 50, 'lantern', 1, 6,
    'A six-part journey that follows storms from the open ocean all the way to the kitchen window, filmed over three restless years.',
    { poster: { style: 'waves', storm: true, font: 'condensed', palette: 'Storm' } }),
  show(6, 'Copper Street Precinct', 'Scripted', 'English', ['Crime', 'Drama'], [2015, 2021], 7.8, 45, 'kestrel', 6, 13,
    'Detective Rosa Quill runs the smallest police station in the city, where the cases are odd, the coffee is worse and no file is closed without cake.',
    { leads: ['Det. Rosa Quill', 'Sgt. Barnaby Holt'], poster: { style: 'skyline', font: 'condensed' } }),
  show(7, "Granny's Secret Spice", 'Reality', 'English', ['Food', 'Family'], [2017], 7.2, 45, 'copperpot', 8, 10,
    'Grandparents coach nervous young cooks through family recipes, one secret ingredient at a time. The judges taste everything; the grannies judge the judges.',
    { poster: { style: 'bubbles', font: 'rounded' } }),
  show(8, 'Paper Planets', 'Animation', 'English', ['Family', 'Science-Fiction', 'Adventure'], [2023], 8.3, 22, 'tidepool', 2, 12,
    'Two siblings fold a paper rocket and wake up in a solar system where every planet is made of something from the craft drawer.',
    { leads: ['Juno', 'Pip'], poster: { style: 'orbit', font: 'rounded', palette: 'Children', ring: 'dashed' } }),
  show(9, 'Frost Harbour', 'Scripted', 'Norwegian', ['Crime', 'Mystery', 'Thriller'], [2016, 2019], 8.2, 58, 'fjell', 3, 8,
    'In a fishing town where the sun barely rises in winter, the new harbour master starts asking questions about a boat that sank twice.',
    { leads: ['Harbour Master Sigrid Lund', 'Officer Even Dahl'], poster: { style: 'peaks', font: 'sans', palette: 'Frost' } }),
  show(10, 'Ferris Wheel Summer', 'Scripted', 'English', ['Romance', 'Comedy', 'Drama'], [2016, 2018], 6.9, 42, 'hilltop', 2, 10,
    'Every summer a travelling fair comes back to Pebble Bay, and every summer Lou promises herself she will not fall for the boy who runs the Ferris wheel.',
    { leads: ['Lou Kettering', 'Sam Okafor'], poster: { style: 'rings', spokes: true, font: 'serif' } }),
  show(11, 'Robot Gardeners', 'Animation', 'English', ['Children', 'Science-Fiction', 'Nature'], [2020], 7.4, 11, 'pocket', 3, 20,
    'Bolt and Petal are two little robots who look after the last garden on a busy space station, and every weed is an adventure.',
    { leads: ['Bolt', 'Petal'], poster: { style: 'critter', critter: 'robot', palette: 'Robot' } }),
  show(12, 'Haunted? Probably Not.', 'Scripted', 'English', ['Comedy', 'Supernatural'], [2019], 7.7, 24, 'riverlight', 3, 8,
    'Two sceptical sisters investigate haunted houses for a tiny local newspaper. So far every ghost has turned out to be a raccoon. So far.',
    { leads: ['Maud Pemberton', 'Effie Pemberton'], poster: { style: 'bigtype', font: 'heavy', palette: 'Supernatural' } }),
  show(13, 'Kings of the Car Park', 'Scripted', 'English', ['Comedy'], [2012, 2017], 7.3, 22, 'lantern', 5, 6,
    'A workplace comedy about the attendants of a shopping-centre car park, who treat every lost ticket like a royal crisis.',
    { leads: ['Dennis Ashdown', 'Priya Lal'], poster: { style: 'stripes', font: 'heavy' } }),
  show(14, 'Deep Blue Diaries', 'Documentary', 'English', ['Nature'], [2014, 2016], 8.5, 50, 'hilltop', 2, 8,
    'A diving team keeps a video diary of one coral reef through every season, from octopus house-moves to the night the whole reef glowed.',
    { poster: { style: 'bubbles', outlined: true, font: 'sans', palette: 'Ocean' } }),
  show(15, 'Starship Janitor', 'Scripted', 'English', ['Comedy', 'Science-Fiction'], [2020], 8.0, 28, 'nebula', 3, 10,
    "Gus mops the corridors of the galaxy's most important starship, and somehow keeps saving it from disasters the captain never notices.",
    { leads: ['Gus Mbeki', 'Captain Orla Vance'], poster: { style: 'bigtype', font: 'condensed', palette: 'Science-Fiction' } }),
  show(16, 'The Last Train to Elderwick', 'Scripted', 'English', ['Fantasy', 'Adventure', 'Family'], [2021, 2022], 8.4, 48, 'lantern', 2, 8,
    'A night train that only stops for people who are lost carries a young conductor and her passengers towards a town that is not on any map.',
    { leads: ['Conductor Hettie Moss', 'The Ticket Inspector'], poster: { style: 'peaks', font: 'serif', palette: 'Fantasy', moon: true } }),
  show(17, 'Night Nurses of Brightwater', 'Scripted', 'English', ['Medical', 'Drama'], [2013, 2019], 7.5, 45, 'kestrel', 7, 18,
    'The night shift at Brightwater General: tired feet, big hearts and a vending machine that is somehow older than the hospital.',
    { leads: ['Nurse Adaeze Brooks', 'Dr. Felix Hartmann'], poster: { style: 'split', cross: true, font: 'heavy' } }),
  show(18, 'Tilly Brandt, Small Claims', 'Scripted', 'English', ['Legal', 'Comedy'], [2018, 2020], 7.1, 30, 'hilltop', 2, 10,
    "A newly qualified judge handles her town's smallest disputes: stolen garden gnomes, noisy roosters and a very contested last slice of pie.",
    { leads: ['Judge Tilly Brandt', 'Clerk Oswald Pine'], poster: { style: 'frame', font: 'serif' } }),
  show(19, 'Snowline Rescue', 'Scripted', 'English', ['Adventure', 'Drama', 'Family'], [2011, 2016], 7.6, 44, 'hilltop', 5, 12,
    'A mountain rescue team, two avalanche dogs and the families who wait for them at the bottom of the hill.',
    { leads: ['Team Leader Kit Varga', 'Ana Lindqvist'], poster: { style: 'peaks', snow: true, font: 'heavy', palette: 'Snow' } }),
  show(20, 'Band in a Van', 'Reality', 'English', ['Music', 'Travel'], [2019], 6.8, 40, 'riverlight', 4, 8,
    'Young bands share a tiny van, a tinier budget and a tour of thirty towns. The band that still talks to each other at the end wins a recording session.',
    { roles: ['Host', 'Tour Manager'], poster: { style: 'beam', font: 'heavy', twin: true } }),
  show(21, 'Hammer & Hum', 'Reality', 'English', ['DIY'], [2016, 2022], 7.0, 30, 'hilltop', 6, 12,
    'A carpenter who sings while she works helps a family rebuild one room every week. The songs are optional; the safety goggles are not.',
    { roles: ['Carpenter and Host', 'Designer'], poster: { style: 'blocks', font: 'condensed' } }),
  show(22, 'Forty Winks Inn', 'Scripted', 'English', ['Comedy', 'Family'], [2008, 2014], 7.9, 30, 'lantern', 6, 8,
    'A guest house where nothing works, everyone is welcome and the owner insists that the creaky stairs are a feature.',
    { leads: ['Mrs. Odette Winslow', 'Basil Thorne'], poster: { style: 'dots', shape: 'window', font: 'serif', palette: 'Inn' } }),
  show(23, 'Chronicles of the Paper Crown', 'Scripted', 'English', ['Fantasy', 'History', 'Drama'], [2017, 2022], 8.6, 60, 'nebula', 4, 10,
    'A kingdom crowns a twelve-year-old after its king vanishes, and its fiercest battles are fought with letters, maps and very long dinners.',
    { leads: ['Queen Amalia', 'Lord Chancellor Grey'], poster: { style: 'frame', crown: true, font: 'serif', palette: 'Royal' } }),
  show(24, 'Penguin Parcel Service', 'Animation', 'English', ['Children', 'Comedy'], [2015], 7.8, 7, 'pocket', 7, 52,
    "Pip and the Penguin Parcel Service deliver anything to anywhere on the ice, even when the address just says 'the big snowy bit'.",
    { leads: ['Pip', 'Mrs. Flipper'], poster: { style: 'critter', critter: 'penguin', palette: 'Ice' } }),
  show(25, 'Noodle Duel', 'Reality', 'English', ['Food'], [2022], 7.4, 45, 'copperpot', 3, 10,
    'Two chefs, one mystery ingredient and thirty minutes to turn it into a bowl of noodles the judges will remember.',
    { poster: { style: 'split', duel: true, font: 'condensed', palette: 'Chili' } }),
  show(26, 'The Clockmaker of Pell Street', 'Scripted', 'English', ['Drama', 'History', 'Mystery'], [2010, 2012], 8.0, 55, 'lantern', 3, 6,
    "In 1890s London a clockmaker repairs the city's clocks by day and quietly mends its secrets by night.",
    { leads: ['Ezra Pell', 'Constance Abernathy'], poster: { style: 'rings', ticks: true, font: 'serif', palette: 'History' } }),
  show(27, 'Gravity Is Optional', 'Scripted', 'English', ['Comedy', 'Science-Fiction'], [2014, 2014], 6.5, 22, 'kestrel', 1, 13,
    'A family wins a holiday at the first hotel in orbit and discovers that the brochure left out a few details. Cancelled after one season, loved ever since.',
    { leads: ['Doug Fenwick', 'Marsha Fenwick'], poster: { style: 'bigtype', font: 'heavy', palette: 'Comedy', tilt: true } }),
  show(28, 'Pedal to the Peak', 'Documentary', 'English', ['Sports', 'Travel'], [2021, 2021], 8.1, 52, 'riverlight', 1, 5,
    "Five amateur cyclists train for a whole year to climb Europe's steepest road, and the cameras follow every sore muscle.",
    { poster: { style: 'stripes', font: 'condensed', palette: 'Sports' } }),
  show(29, 'Ghost Town Gazette', 'Scripted', 'English', ['Western', 'Comedy', 'Supernatural'], [2018, 2021], 7.5, 40, 'hilltop', 3, 10,
    'The only newspaper in a desert town where the readers are friendly, the sheriff is a ghost and the deadline is always at sundown.',
    { leads: ['Editor Clem Ibarra', 'Sheriff Wyatt (deceased)'], poster: { style: 'sun', font: 'serif', palette: 'Western' } }),
  show(30, 'Soup for Strangers', 'Talk Show', 'English', ['Food'], [2019], 7.0, 30, 'copperpot', 6, 20,
    'A host invites two strangers into her kitchen, cooks them a soup and lets the conversation simmer.',
    { roles: ['Host'], poster: { style: 'rings', font: 'rounded', palette: 'Soup' } }),
  show(31, 'The Map Thieves', 'Scripted', 'English', ['Adventure', 'Crime', 'Family'], [2017, 2019], 7.7, 45, 'tidepool', 3, 8,
    'A teenage map-maker and her grandfather chase the gang that steals old maps from museums all over Europe.',
    { leads: ['Wren Castellanos', 'Grandpa Teodor'], poster: { style: 'stripes', font: 'serif', palette: 'Adventure', route: true } }),
  show(32, 'Moonbase Kindergarten', 'Animation', 'English', ['Children', 'Comedy', 'Science-Fiction'], [2019], 8.2, 12, 'pocket', 4, 26,
    'Low gravity, high spirits: the first kindergarten on the Moon, where nap time floats and the sandpit is grey.',
    { leads: ['Miss Comet', 'Little Orbit'], poster: { style: 'orbit', craters: true, font: 'rounded', palette: 'Children' } }),
  show(33, 'Rehearsal Room B', 'Scripted', 'English', ['Drama', 'Music'], [2015, 2018], 7.9, 46, 'lantern', 3, 8,
    'A youth orchestra with no money, no concert hall and one last concert to save, told from the cramped room where it all happens.',
    { leads: ['Conductor Ilse Moreau', 'Kofi Mensah'], poster: { style: 'beam', font: 'sans', palette: 'Music' } }),
  show(34, 'Csillagpor utca', 'Scripted', 'Hungarian', ['Drama', 'Comedy', 'Family'], [2012], 7.3, 25, 'kokeny', 12, 40,
    'Life, love and gossip in a Budapest courtyard house, where everyone knows everyone and the lift has been out of order since episode one.',
    { leads: ['Rózsa néni', 'Bence Szalai'], poster: { style: 'skyline', font: 'heavy', palette: 'Dusk', courtyard: true } }),
  show(35, 'Las Recetas de Luz', 'Reality', 'Spanish', ['Food', 'Travel'], [2018, 2023], 8.0, 28, 'limon', 5, 12,
    'Luz, a retired school cook, travels from village to village collecting recipes from grandmothers before they are forgotten.',
    { roles: ['Host'], poster: { style: 'sun', font: 'heavy', palette: 'Food' } }),
  show(36, 'Cloudletter Courier', 'Animation', 'Japanese', ['Anime', 'Fantasy', 'Adventure'], [2020, 2021], 8.8, 24, 'tsubame', 2, 12,
    'Mio delivers letters between floating islands on a bicycle with wings, and every letter changes somebody’s day.',
    { leads: ['Mio', 'Captain Kumo'], poster: { style: 'bubbles', clouds: true, font: 'rounded', palette: 'Anime' } }),
  show(37, 'Le Club des Parapluies', 'Scripted', 'French', ['Drama', 'Romance'], [2016, 2019], 7.7, 52, 'mirabelle', 3, 8,
    'On a rainy street in Lyon, an umbrella repair shop becomes the meeting place for strangers who have nothing in common except the bad weather.',
    { leads: ['Margaux Delacroix', 'Monsieur Albin'], poster: { style: 'split', umbrella: true, font: 'serif', palette: 'Romance' } }),
  show(38, 'Rooftop Radio', 'Scripted', 'Korean', ['Romance', 'Comedy', 'Music'], [2021, 2021], 8.3, 60, 'haneul', 1, 16,
    'Two strangers who share a rooftop start a secret late-night radio show, not knowing that they work in the same office.',
    { leads: ['Han Ji-woo', 'Seo Min-jae'], poster: { style: 'rings', waves: true, font: 'heavy', palette: 'Night' } }),
  show(39, 'Know-It-Owls', 'Game Show', 'English', ['Family'], [2016], 6.9, 30, 'kestrel', 9, 30,
    'A family quiz show where children and their grandparents team up against a panel of very smug owls (puppets, mostly).',
    { roles: ['Host', 'Owl Puppeteer'], poster: { style: 'critter', critter: 'owl', palette: 'Owl' } }),
  show(40, 'Late Night with a Llama', 'Talk Show', 'English', ['Comedy'], [2022], 7.1, 35, 'riverlight', 2, 40,
    'A chat show hosted by a comedian and a llama who refuses to read the autocue. The guests are real; the llama is in charge.',
    { roles: ['Host', 'Bandleader'], poster: { style: 'bigtype', font: 'condensed', palette: 'Night' } }),
  show(41, 'The Volcano Diaries', 'Documentary', 'English', ['Nature'], [2012, 2013], 8.4, 50, 'lantern', 2, 6,
    'Volcano scientists camp on the slopes of three restless mountains to find out how they breathe.',
    { poster: { style: 'peaks', lava: true, font: 'condensed', palette: 'Volcano' } }),
  show(42, 'Snack Smugglers', 'Scripted', 'English', ['Children', 'Comedy'], [2017, 2020], 7.0, 22, 'pocket', 3, 13,
    'Three kids run a secret snack exchange at the strictest school in the country. The headmistress is closing in.',
    { leads: ['Ollie Brandt', 'Tamsin Achterberg'], poster: { style: 'stripes', font: 'rounded', palette: 'Candy' } }),
  show(43, 'Operation Knitting Needle', 'Scripted', 'English', ['Espionage', 'Comedy'], [2020], 8.1, 45, 'lantern', 3, 6,
    'Retired spies meet every Tuesday at the village knitting club, and they are not quite as retired as their families think.',
    { leads: ['Agent Marigold', 'Agent Bertram'], poster: { style: 'frame', dossier: true, font: 'mono', palette: 'Espionage' } }),
  show(44, 'Roadtrip Recipes', 'Reality', 'English', ['Food', 'Travel'], [2015, 2019], 7.3, 30, 'copperpot', 4, 10,
    'A chef and a camper van with a kitchen in the back cook one local dish in every town they reach.',
    { roles: ['Chef and Host', 'Driver'], poster: { style: 'sun', font: 'rounded', palette: 'Travel', road: true } }),
  show(45, 'Islands of Tomorrow', 'Documentary', 'English', ['Travel', 'Nature'], [2019, 2019], 8.0, 48, 'tidepool', 1, 8,
    'Small island communities show how they are getting ready for the next hundred years, with seaweed farms, wind kites and clever boats.',
    { poster: { style: 'waves', font: 'sans', palette: 'Lagoon', island: true } }),
  show(46, 'Hoof & Heart Ranch', 'Scripted', 'English', ['Family', 'Drama', 'Western'], [2009, 2015], 7.6, 44, 'hilltop', 6, 13,
    'A city family inherits a horse ranch and has one summer to learn which end of a horse is which.',
    { leads: ['June Calloway', 'Eli Calloway'], poster: { style: 'sun', font: 'condensed', palette: 'Ranch', hills: true } }),
  show(47, 'Quantum Café', 'Scripted', 'English', ['Comedy', 'Science-Fiction', 'Romance'], [2018, 2019], 7.2, 25, 'nebula', 2, 10,
    "Every cup of coffee at this café comes from a slightly different universe, which makes ordering 'the usual' surprisingly hard.",
    { leads: ['Barista Noor Haddad', 'Professor Lumen'], poster: { style: 'dots', font: 'heavy', palette: 'Cafe' } }),
  show(48, 'The Glass Archive', 'Scripted', 'English', ['Thriller', 'Mystery'], [2026], 8.5, 50, 'riverlight', 1, 8,
    'A junior archivist finds a file about herself, dated fifty years before she was born.',
    { leads: ['Archivist Cleo Marsh', 'The Curator'], poster: { style: 'bigtype', font: 'heavy', outline: true, palette: 'Glass' } }),
  show(49, 'Gnome Repair Shop', 'Animation', 'English', ['Children', 'Fantasy'], [2016], 7.5, 11, 'pocket', 6, 26,
    'Garden gnomes run a tiny repair shop under the rhubarb, fixing everything from snail shells to broken rainbows.',
    { leads: ['Grandpa Tinker', 'Fern'], poster: { style: 'critter', critter: 'gnome', palette: 'Garden' } }),
  show(50, 'Pottery Panic', 'Reality', 'English', ['DIY'], [2021], 6.7, 45, 'kestrel', 2, 8,
    'Ten amateur potters, one wobbly wheel each and a kiln that decides who goes home.',
    { poster: { style: 'rings', font: 'condensed', palette: 'Clay' } }),
  show(51, 'Ice Rink Rivals', 'Scripted', 'English', ['Sports', 'Drama', 'Romance'], [2019, 2022], 7.4, 42, 'tidepool', 3, 10,
    'Two figure skaters who cannot stand each other are paired up for the national championships.',
    { leads: ['Sasha Petrov', 'Leo Kaur'], poster: { style: 'split', skate: true, font: 'heavy', palette: 'Ice' } }),
  show(52, 'Attic Detectives', 'Reality', 'English', ['History', 'Mystery'], [2014], 7.8, 40, 'lantern', 9, 10,
    'Historians help families solve the mysteries of objects found in their attics: medals, love letters and, once, a stuffed crocodile.',
    { roles: ['Host', 'Historian', 'Historian'], poster: { style: 'frame', font: 'serif', palette: 'History' } }),
  show(53, 'Moss & Mortar', 'Reality', 'English', ['DIY', 'Nature'], [2017, 2018], 7.6, 30, 'hilltop', 2, 8,
    'Stonemasons restore crumbling cottages with old techniques and a lot of patience, while the moss quietly moves back in.',
    { roles: ['Narrator', 'Stonemason', 'Stonemason'], poster: { style: 'dots', shape: 'stone', font: 'serif', palette: 'Moss' } }),
  show(54, 'Comet Club Juniors', 'Animation', 'English', ['Children', 'Adventure', 'Science-Fiction'], [2021], 7.7, 12, 'tidepool', 2, 26,
    "Four friends with a backyard telescope chase comets, meteor showers and the neighbour's runaway cat.",
    { leads: ['Ravi', 'Lottie'], poster: { style: 'orbit', comet: true, font: 'rounded', palette: 'Night' } }),
  show(55, 'The Weather Witch of Wallow', 'Scripted', 'English', ['Fantasy', 'Comedy', 'Family'], [2022], 7.9, 30, 'lantern', 2, 8,
    "The village's new weather presenter can actually change the weather, which is mostly a problem on bank holidays.",
    { leads: ['Agatha Bramble', 'Mayor Pugh'], poster: { style: 'bubbles', clouds: true, rain: true, font: 'serif', palette: 'Witch' } }),
  show(56, 'Stage Fright Academy', 'Scripted', 'English', ['Music', 'Comedy'], [2013, 2016], 7.0, 25, 'kestrel', 4, 20,
    'At a performing arts school for very shy students, the hardest lesson of all is walking on stage.',
    { leads: ['Ms. Vera Quinn', 'Toby Nakamura'], poster: { style: 'beam', font: 'rounded', palette: 'Stage', twin: true } }),
  show(57, 'The Seventh Satellite', 'Scripted', 'English', ['Science-Fiction', 'Thriller', 'Mystery'], [2017], 8.2, 52, 'nebula', 1, 10,
    'Six satellites were launched. Seven are answering. A ground-control team tries to find out who else is listening.',
    { leads: ['Flight Director Mara Eriksen', 'Junior Engineer Dario Ruiz'], status: 'To Be Determined', poster: { style: 'orbit', satellites: true, font: 'condensed', palette: 'Thriller' } }),
  show(58, "Lighthouse at Lowtide: The Keeper's Log", 'Scripted', 'English', ['Drama', 'Mystery'], null, null, null, 'lantern', 0, 0,
    null,
    { status: 'In Development' }),
  show(59, 'The Pancake Detectives', 'Animation', 'English', ['Children', 'Mystery'], null, null, 11, 'pocket', 0, 0,
    'Coming soon: two breakfast-loving siblings who solve every mystery before the pancakes get cold.',
    { status: 'In Development' }),
  show(60, 'Velvet Orbit', 'Scripted', 'English', ['Science-Fiction', 'Romance'], null, null, null, 'nebula', 0, 0,
    'Announced: a love story told across two space stations that only come close to each other once a year.',
    { status: 'In Development' }),
]

export const findShow = (id) => (/^\d+$/.test(String(id)) ? SHOWS.find((s) => s.id === Number(id)) : undefined)

// ── Repeatable "randomness": the same seed always gives the same numbers ──────────────────
export function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (random, list) => list[Math.floor(random() * list.length)]
const pad = (n) => String(n).padStart(2, '0')

// ── Dates and seasons ───────────────────────────────────────────────────
const THIS_YEAR = 2026

export const statusOf = (s) => s.status ?? (!s.years ? 'In Development' : s.years[1] ? 'Ended' : 'Running')

// A repeatable date inside a given year (every show premieres on "its" day). `latestMonth` keeps
// a season that must end in the same year from starting too late.
function dateIn(year, seed, latestMonth = 12) {
  const random = seeded(seed)
  return `${year}-${pad(1 + Math.floor(random() * latestMonth))}-${pad(1 + Math.floor(random() * 28))}`
}

const DAY = 86_400_000
const plusWeeks = (date, weeks) => new Date(Date.parse(date) + weeks * 7 * DAY).toISOString().slice(0, 10)

// Seasons spread evenly between the first and the last year (or this year, while running).
// One episode a week; the season that is still on air has no end date yet.
export function seasonsOf(s) {
  if (!s.years || !s.seasons) return []
  const status = statusOf(s)
  const [first, last = THIS_YEAR] = s.years
  const step = s.seasons > 1 ? (Math.max(last, first + s.seasons - 1) - first) / (s.seasons - 1) : 0
  const weeks = s.episodes - 1
  return Array.from({ length: s.seasons }, (_, i) => {
    const year = Math.min(THIS_YEAR, Math.round(first + i * step))
    const isLast = i === s.seasons - 1
    const latestMonth = isLast && status === 'Ended' ? Math.max(1, 12 - Math.ceil((weeks * 7) / 30)) : 12
    const premiereDate = dateIn(year, s.id * 31 + i, latestMonth)
    const onAir = isLast && status === 'Running'
    return {
      id: s.id * 100 + i + 1,
      number: i + 1,
      name: '',
      episodeOrder: s.episodes,
      premiereDate,
      endDate: onAir ? null : plusWeeks(premiereDate, weeks),
    }
  })
}

export const premieredOf = (s) => seasonsOf(s)[0]?.premiereDate ?? null
export const endedOf = (s) => (statusOf(s) === 'Ended' ? (seasonsOf(s).at(-1)?.endDate ?? null) : null)

// ── People ──────────────────────────────────────────────────────────────
// Made-up names, mixed from two lists. People are generated per show, so their ids are stable.
const FIRST = [
  'Ada',
  'Bram',
  'Cleo',
  'Dario',
  'Edda',
  'Felix',
  'Gita',
  'Hugo',
  'Ines',
  'Jonah',
  'Kira',
  'Lior',
  'Mara',
  'Nils',
  'Odile',
  'Pavel',
  'Quinn',
  'Rosa',
  'Soren',
  'Talia',
  'Umar',
  'Vera',
  'Wren',
  'Yara',
  'Zoltán',
  'Hanna',
  'Réka',
  'Mei',
  'Kenji',
  'Amara',
  'Tomas',
  'Lucía',
  'Noor',
  'Aiko',
  'Elif',
  'Ravi',
  'Ottilie',
  'Basil',
  'Juno',
  'Femi',
  'Ingrid',
  'Matteo',
  'Sanna',
]
const LAST = [
  'Fenwick',
  'Okonjo',
  'Lindgren',
  'Moreau',
  'Takeda',
  'Varga',
  'Castellano',
  'Holloway',
  'Pemberley',
  'Nakashima',
  'Szabados',
  'Kowalczyk',
  'Abernethy',
  'Quillfeather',
  'Marchetti',
  'Delaunay',
  'Haddadi',
  'Eriksdottir',
  'Oyelaran',
  'Brambleton',
  'Ashcombe',
  'Kettleby',
  'Mossgrove',
  'Vantongeren',
  'Ruizal',
  'Lundquist',
  'Satorini',
  'Petrovan',
  'Callowhill',
  'Thornbury',
  'Winsloe',
]
// Character names for animated shows, when the record names fewer leads than the cast has.
const TOON = [
  'Professor Waffle',
  'Captain Biscuit',
  'Pebble',
  'Mr. Puddle',
  'Granny Thimble',
  'Sprocket',
  'Tilly Toast',
  'Dr. Fizz',
  'Noodle',
  'Auntie Sparkle',
]

// Who appears in unscripted shows, unless the record says otherwise.
const ROLES = {
  Reality: ['Host', 'Judge', 'Judge'],
  'Talk Show': ['Host'],
  'Game Show': ['Host'],
  Documentary: ['Narrator'],
}

// The cast of a show: [{ person, character, self, voice }] like a real TV API.
export function castOf(s) {
  if (statusOf(s) === 'In Development') return []
  const random = seeded(s.id * 977)
  const roles = s.roles ?? ROLES[s.type]
  const count = roles ? roles.length : s.type === 'Animation' ? 4 : 6
  // Nobody in one cast shares a first name (with the people or the characters).
  const used = new Set(s.leads.flatMap((lead) => lead.split(' ')))
  const firstName = () => {
    let name = pick(random, FIRST)
    while (used.has(name)) name = pick(random, FIRST)
    used.add(name)
    return name
  }
  return Array.from({ length: count }, (_, i) => {
    const name = `${firstName()} ${pick(random, LAST)}`
    const id = s.id * 100 + i + 1
    const character = roles
      ? roles[i]
      : (s.leads[i] ?? (s.type === 'Animation' ? TOON[(s.id + i) % TOON.length] : `${firstName()} ${pick(random, LAST)}`))
    return {
      person: {
        id,
        name,
        gender: null,
        birthday: null,
        // About one person in six has no photo yet, as in real data.
        hasImage: (s.id + i) % 6 !== 4,
      },
      character: { id: id + 50_000, name: character },
      self: Boolean(roles),
      voice: s.type === 'Animation',
    }
  })
}

// Finds one person (for their picture) by id: show id × 100 + position in the cast.
export function findPerson(id) {
  if (!/^\d+$/.test(String(id))) return undefined
  const s = findShow(Math.floor(Number(id) / 100))
  return s && castOf(s).find((c) => c.person.id === Number(id))?.person
}
