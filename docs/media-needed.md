# Médialista – mit hozz, mennyit és hova

Minden kép, videó és hang az oldallal együtt töltődik be, külső szolgáltatás nélkül.
Amíg a te fájljaid nem érkeznek meg, a leckék kódból rajzolt képekkel, kódból szintetizált hangokkal
és egy saját mintaklippel működnek. Ezek helykitöltők, a te fájljaid kerülnek a helyükre.

**Hova:** `public/media/<lecke-mappa>/` (a mappát a táblázat mutatja). Ha egyszerűbb, bedobhatod őket
egy mappába leckénként szétválogatva, és én átnevezem, átalakítom (például WebP-be) és bekötöm őket.

**Miért a `public/media`?** Az innen kiszolgált fájlok címe nem változik a buildben, így a GitHub Pages-oldaladon
fix címen érhetők el, például `https://<felhasználónév>.github.io/rika-mentoring/media/book-library/bk001.webp`.
Ugyanezt a címet használja az oldal is, és a diákok kezdőcsomagjai is innen töltik be a képeket és az adatokat.
(Ehhez a repónak nyilvánosnak kell lennie, vagy fizetős GitHub-csomag kell, mert a Pages privát repóból ingyen nem megy.)

**Formátumok:** kép WebP vagy JPG (átlátszósághoz PNG), videó MP4 (H.264 + AAC), hang MP3 vagy OGG.
Csak saját vagy szabadon felhasználható (jogtiszta) anyag kerüljön fel, mert az oldal nyilvános lesz.

## Kell (most külső forrásból jönne, vagy csak helykitöltő van)

| # | Lecke | Mi kell | Mennyi | Méret, formátum | Hova |
|---|---|---|---|---|---|
| 18 | Video Player | videó hanggal | 1 (a lejátszási listához 2–3) | 16:9, 1280×720 vagy 1920×1080, 20–90 mp, max. 15 MB, MP4 | `public/media/video-player/` |
| 18 | Video Player | borítókép (poster) a videóhoz | videónként 1 | 16:9, 1280×720 | ugyanide |
| 18 | Video Player | felirat (opcionális, a haladó szinthez) | videónként 1 EN + 1 HU | `.vtt` szövegfájl | ugyanide |
| 15 | Space Explorer | űrfotók (a „nap képe”) | 44 | 16:9 vagy 4:3, 1600 px széles | `public/media/space-explorer/` |
| 15 | Space Explorer | rövid űrvideók (a videó típusú napokhoz) | 6 | MP4, 10–30 mp, max. 10 MB | ugyanide |
| 20, 41 | Movie Search, Swipe | sorozatplakátok (közös katalógus; 3 fejlesztés alatti sorozatnak szándékosan nincs) | 57 | 2:3 álló, 680×1000 | `public/media/shows/` |
| 21 | Book Library | könyvborítók (54 könyv; 2-nek szándékosan nincs borítója) | 52 | 2:3 álló, 400×600 | `public/media/book-library/` |
| 23 | Fan Wiki | szereplőképek (saját kitalált világ: „The Huebloom Isles”) | 40 | négyzetes, 400×400 | `public/media/fan-wiki/` |
| 25 | Meme Generator | mémsablon-képek (szöveg nélkül) | 20 | bármilyen arány, legalább 800 px | `public/media/meme-generator/` |
| 42 | Travel Map | a Huebloom-szigetek rajzolt térképe (a Fan Wiki kitalált égi szigetvilága; saját vagy jogtiszta, például az Azgaar's Fantasy Map Generatorral készített térkép) | 1 | fekvő, 10:7 arányú, legalább 3000×2100, WebP/PNG | `public/media/travel-map/` |

A tételek listája (cím, leírás, azonosító) a leckék adatfájljaiban van; ezekből kiderül, melyik képhez mi kell:
`lessons/15-space-explorer/solution/mocks/pictures.js`, `shared/mock-api/shows.js`, `lessons/21-book-library/solution/mocks/catalogue.js`,
`lessons/23-fan-wiki/solution/mocks/universe.js`, `lessons/25-meme-generator/solution/mocks/templates.js`. Nevezd el a fájlokat az azonosítóval
(például `bk001.webp`, `7.webp`); ha ez macerás, elég a címet beleírni a fájlnévbe, és én párosítom.
Addig minden kép kódból rajzolt helykitöltő, és a leckék így is hibátlanul működnek.

## Opcionális (most kódból készül, és jól működik)

| # | Lecke | Mi | Mennyi | Méret, formátum | Hova |
|---|---|---|---|---|---|
| 1 | Me, Myself & React | profilkép (most monogram) | 1 | négyzetes, 800×800 | `public/media/portfolio/` |
| 12 | Image Gallery | mintafotók (most 10 kódból rajzolt kép) | 10–12 | 3:4 álló, 1200×1600 | `public/media/image-gallery/` |
| 17 | Musical Instrument | zongorahang-minta (most szintetizált) | 1 (C4) vagy 12 (egy oktáv) | WAV/OGG, 2–4 mp | `public/media/piano/` |
| 33 | Lofi Study Room | háttérhangok: eső, kávézó, tűz + 1 lofi zenei hurok (most szintetizáltak) | 4 | MP3/OGG, 30–120 mp, hézag nélkül ismételhető | `public/media/lofi-room/` |
| 36 | Winamp | demódalok (most 3 szintetizált dal) | 3 | MP3/OGG, 1–3 perc | `public/media/winamp/` |
| 29, 34, 40 | Plant Care, Wardrobe, Mood Board | mintaképek a kezdő adatokhoz (egyébként a felhasználó tölt fel) | 6 / 12 / 8 | 4:3 vagy négyzetes, 1200 px | `public/media/<lecke>/` |
| 44 | Webshop | termékfotók | termékenként 1 | négyzetes, 800×800 | `public/media/webshop/` |

## Nem kell semmi

A Photo Booth (39) a kamerát használja, a Drawing, a QR Code és a Meme Generator exportja pedig maga készít képet.

## A Travel Map térképe

A lecke a Fan Wiki kitalált világát, a **Huebloom-szigeteket** használja: égen lebegő szigetek, köztük felhőtenger.
Három régió van: Felső-, Középső- és Alsó-szigetek. Az égi világítótorony a Tollazat-fokon áll.
A térképre ezek a helyek kerüljenek (a zárójelben a mostani, ideiglenes mező a 10 × 7-es rácson,
A–J oszlop, 1–7 sor; de rajzolhatsz szabadon is, a gombostűket a kész térképhez igazítom):

| Hely | Régió | Ideiglenes mező |
|---|---|---|
| Plumage Point (Tollazat-fok), világítótorony-sziget | Felső | B2 |
| Sky Harbour (Égi kikötő), lebegő kikötő | Felső | E1 |
| Violet Vale (Ibolya-völgy), völgy | Felső | H2 |
| Marigold Market (Körömvirág-piac), vásárváros | Középső | D4 |
| Tangerine Terraces (Mandarin-teraszok), domboldali város | Középső | F4 |
| Cobalt Cliffs (Kobalt-sziklák), sziklafal | Középső | I4 |
| Lemon Lagoon (Citrom-lagúna), lagúna | Középső | B5 |
| Crayon Caverns (Zsírkréta-barlangok), barlangok | Alsó | D6 |
| Mintwater Marsh (Mentavíz-mocsár), mocsár | Alsó | G6 |
| Rosepetal Reef (Rózsaszirom-zátony), égi zátony | Alsó | I6 |
| Indigo Deeps (Indigó-mélység), felhőtenger | Alsó | a térkép alja |

A Szürke Szitálás (a ködfelhő) „a térképen túl” van, legfeljebb a szélén kandikálhat be.
