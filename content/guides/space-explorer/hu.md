# Mit építünk?

Egy űrfelfedezőt: minden napra egy kép a világegyetemről, címmel és rövid magyarázattal, ahogy a NASA híres
„Astronomy Picture of the Day” (APOD, a nap csillagászati képe) oldalán 1995 óta. A képeket egy API-tól kérjük le,
kulccsal, ahogy egy igazi szolgáltatástól. Közben megtanulod, mire jó egy API-kulcs és hová kerül, hogyan bánj a
dátumokkal és az időzónákkal, hogyan jeleníts meg mást egy képnél és mást egy videónál, és hogyan spórolj a
kérésekkel egy gyorsítótárral. A végén egy végtelenül görgethető galériád is lesz, szűrőkkel és nagy nézettel.

:::levels
- A mai kép dátummal, címmel és magyarázattal, töltés- és hibaállapottal, saját API-kulccsal. | kb. 2 óra
- Dátumválasztó az archívumhoz, videós napok, kedvencek és gyorsítótár. | kb. 3 óra
- Galéria időszakokkal és véletlen képekkel, végtelen görgetés, szűrők és nagy nézet. | kb. 3 óra
:::

**Előismeret:** az előző leckék, főleg ezek: a `useEffect` takarító függvénye és a késve érkező válaszok eldobása
(5. és 9. lecke), az `Intl.DateTimeFormat` (11. lecke), a `fetch`, a töltés- és hibaállapot, a saját `useFetch` hook
és a környezeti változó (14. lecke), a `useLocalStorage` hook (6. és 9–11. lecke), a `<dialog>` elem, a `useRef` és a
végtelen görgetés (12. lecke). Amit felidézünk, azt egy-két mondatban újra elmagyarázzuk; minden újat lépésről
lépésre.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke feladata, egy kész kiinduló projekt, a kurzus GitHub-repójában van, a `lessons/15-space-explorer/exercise`
mappában (a fenti „Feladat a GitHubon” gomb ezt a mappát nyitja meg). Az 1. lecke 0. lépése részletesen elmagyarázza,
hogyan szerzed meg és állítod be; itt csak a parancsok következnek.

Nyiss egy terminált a munkamappádban, ahol a projektjeidet tartod. Ha még nincs meg a repó, klónozd le, aztán másold
ki belőle az exercise mappát, és a másolat neve legyen `space-explorer`:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/15-space-explorer/exercise space-explorer
```

Ha egy korábbi leckéből már megvan a repó, a `git clone` sor helyett ezt a három parancsot írd be: `cd rika-mentoring`,
`git pull` (ez hozza le az új leckéket), majd `cd ..`; utána jöhet a másolás. Git nélkül a repó GitHub-oldalán a
**Code → Download ZIP** is megfelel, másolni pedig fájlkezelővel is lehet. Magához a repóhoz nem nyúlsz, így a
`git pull` később is működik; a másolatod a saját projekted.

Nyisd meg a `space-explorer` mappát a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite, Mock Service Worker)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Sötét, éjkék oldalt látsz, felül nagy,
arany betűkkel a „Space Explorer” cím, alatta halványabban: „A picture of our universe for every day.” Más még nincs
rajta: a képek a te dolgod.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. Az első terminált az `npm run dev`
foglalja, ezért nyiss egy másodikat (a terminálpanel **+** gombjával), a `space-explorer` mappában:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni.

A kiinduló projektben ezek a fájlok fontosak ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a fejlécet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke az adatlekérésről szól, nem a CSS-ről, ezért most nem
  kell stílust írnod: csak a lépésekben megadott osztályneveket (`apod`, `media`, `date-nav`, `gallery`, …) használod.
  A színek az `src/index.css` elején vannak, változókban.
- `src/mocks/`: egy kitalált szerver, az űr-API. Mindjárt elmondjuk, mi ez.
- `public/mockServiceWorker.js`: a kitalált szerver egyik saját fájlja. Ne írd át.
- `src/main.jsx`: elindítja a kitalált szervert, aztán kirajzolja az appot.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a fejléc két sora angolul vannak.
Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te írsz be, magyar
feliratokkal és megjegyzésekkel mutatjuk.

**A kitalált szerver.** A NASA képeit egy [[API]]-n keresztül bármelyik program lekérheti: egy webcímen, amely nem
weboldalt ad vissza, hanem adatot. Ebben a kurzusban nem hívunk külső szolgáltatást, ezért a kiinduló projektben egy
ugyanígy működő, kitalált API van, saját, kódból rajzolt képekkel. A [[Mock Service Worker]] (MSW) nevű csomag
futtatja, és ehhez egy [[service worker]]-t használ: egy kis programot, amelyet a böngésző az oldal és a hálózat közé
tesz. A
service worker minden kérést lát, amit az oldal küld, és válaszolhat is rájuk. Az MSW így a `/api/…` címekre érkező
kérésekre a `src/mocks/handlers.js` alapján válaszol, a többit (az oldalt, a szkripteket, a stílusokat) továbbengedi.
A te kódod számára ez pontosan olyan, mint egy igazi szerver: közönséges `fetch`-hívásokat írsz, és ha egyszer egy
igazi API-ra váltasz, csak a címet és a kulcsot kell kicserélned.

Az `src/main.jsx` indítja el, még mielőtt a React bármit kirajzolna:

```jsx file=src/main.jsx mark=3,8
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startMockApi } from './mocks/browser.js'
import './index.css'
import App from './App.jsx'

// First the pretend space API starts (src/mocks), so even the very first fetch('/api/…') gets an answer.
await startMockApi()

// React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Az `await` most nem egy `async` függvényben áll, hanem a fájl legfelső szintjén. Ez a [[felső szintű await]]: maga a
fájl is megvárhat egy Promise-t, mielőtt a következő sorra lépne. Így az első `fetch` már a működő szerverhez érkezik.

:::concept Az űr-API röviden
Minden kérés a `/api/apod` címre megy, a beállítások a `?` után jönnek. Az `api_key` mindig kell, a többi
elhagyható:

- `api_key=DEMO_KEY`: a kulcs. Nélküle a válasz `403 Forbidden` (tilos).
- `date=2026-11-15`: egy adott nap képe. Ha nincs megadva, a mai napé.
- `start_date=…&end_date=…`: egy időszak összes napja, tömbben (legfeljebb 100 nap).
- `count=12`: 12 véletlenszerűen választott nap, tömbben.
- `lang=hu`: magyar cím és magyarázat. Enélkül angolul válaszol.
- `thumbs=true`: a videós napokhoz egy állóképet is küld.

Egy nap képe így néz ki (a magyarázatot itt lerövidítettük):

```json
{
  "copyright": "Rika Mentoring",
  "date": "2026-11-15",
  "explanation": "A Jupiter olyan nagy, hogy több mint 1300 Föld elférne benne. …",
  "media_type": "image",
  "service_version": "v1",
  "title": "A Jupiter és a Nagy Vörös Folt",
  "url": "http://localhost:5173/api/apod/image/jupiter.svg",
  "hdurl": "http://localhost:5173/api/apod/image/jupiter-hd.svg"
}
```

Ugyanezeket a neveket használja a NASA igazi APOD API-ja is. A kitalált archívum is 1995. június 16-án kezdődik, és
minden napjához tartozik egy kép; 50 különböző kép ismétlődik benne, mindig ugyanabban a sorrendben.
:::

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza. Kívülről a [[props]]-ain keresztül kap adatot, emlékezni
pedig a [[useState]] segítségével tud. A rajzoláson kívüli munka, például egy kérés a szerverhez, a [[useEffect]]-be
kerül; a [[takarító függvény]]e akkor fut le, amikor az effekt újraindul, vagy a komponens eltűnik. A [[saját hook]]
egy `use`-zal kezdődő nevű függvény, ami más hookokat hív. Ha ezek közül valami ismeretlennek tűnik, lapozz vissza a
2., a 9. és a 14. leckéhez.
:::

:::try Próbáld ki
Kérdezd meg a szervert kézzel. Nyisd meg a fejlesztői eszközöket (++F12++), válts a Console fülre, és írd be:
`await (await fetch('/api/apod?api_key=DEMO_KEY&lang=hu')).json()`. A válasz a mai nap adatai. Aztán hagyd el a
kulcsot: `await (await fetch('/api/apod?lang=hu')).json()`. Most egy hibaüzenet jön, és a konzol pirossal jelzi a
`403 (Forbidden)` választ.
:::

### Az első kérés

Kérjük le a mai képet. Ahogy a 14. leckében, egy kérés címe most is két részből áll: a `/api/apod` a [[végpont]] (endpoint), vagyis az API-nak az
a „címe”, amelyik a nap képeivel foglalkozik. A `?` után jönnek a [[lekérdezési paraméterek|lekérdezési paraméter]]
(query string): `név=érték` párok, `&` jellel elválasztva.

Az `api_key=DEMO_KEY` az [[API-kulcs]]. Egy szolgáltatás ebből tudja, ki kérdez: minden fejlesztő saját kulcsot kap,
és a szolgáltatás kulcsonként számolja, hány kérést küldtek. A `DEMO_KEY` egy közös, nyilvános kulcs kipróbáláshoz,
erősen korlátozva: a mi API-nk óránként 30 kérést enged vele (a NASA igazi demókulcsa is nagyjából ennyit). A
`lang=hu` a mi API-nk saját paramétere: magyarul kérjük a címet és a magyarázatot.

A 14. leckéből már ismered a `fetch`-et: elküldi a kérést, és egy [[Promise]]-t ad vissza, ami a szerver válaszával
teljesül. A válasz tartalma [[JSON]] szöveg, ezt a `response.json()` alakítja JavaScript-objektummá (ez is Promise,
ezért kell elé is `await`). Írd át az `src/App.jsx`-et így:

```jsx file=src/App.jsx mark=1,5,7-21,30-38
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apod, setApod] = useState(null) // a mai kép adatai, amint megérkeznek

  useEffect(() => {
    let ignore = false

    async function load() {
      const response = await fetch('/api/apod?api_key=DEMO_KEY&lang=hu')
      const data = await response.json()
      if (!ignore) setApod(data)
    }

    load()
    // Takarítás: ha a komponens közben eltűnt (vagy új kérés indult), ennek a kérésnek a válaszát eldobjuk.
    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      {apod && (
        <article className="apod">
          <figure className="media">
            <img src={apod.url} alt={apod.title} />
          </figure>
          <h2 className="apod__title">{apod.title}</h2>
          <p className="apod__text">{apod.explanation}</p>
        </article>
      )}
    </main>
  )
}

export default App
```

- Az `apod` állapot `null`-lal indul: amíg a válasz nem érkezett meg, nincs mit mutatni. Az `{apod && (…)}` csak
  akkor rajzolja ki a kártyát, ha már van adat. (Az APOD az „Astronomy Picture of the Day” rövidítése, ezért hívjuk
  így a nap képének adatait.)
- Az üres [[függőségi tömb]] (`[]`) miatt az effekt egyszer fut le, az első rajzolás után.
- Maga az effektfüggvény nem lehet `async`, mert csak takarító függvényt adhat vissza, Promise-t nem. Ezért benne
  írunk egy `async function load()`-ot, és rögtön meg is hívjuk, ahogy a 9. és a 14. leckében.
- Az `ignore` is a 9. leckéből ismerős: ha a komponens eltűnik, mielőtt a válasz megérkezne, a takarító függvény
  `true`-ra állítja, és a késve érkező választ eldobjuk.
- A `src={apod.url}` a kép webcíme (URL-je) a válaszból. A képet már nem a mi kódunk kéri le, hanem az `<img>` maga;
  ezt is a kitalált szerver szolgálja ki. Az `alt` a kép címe (a `title`), ezt olvassa fel a képernyőolvasó.

:::check Ellenőrizd
Egy pillanat múlva megjelenik egy kódból rajzolt űrkép (minden nap más), alatta a címe és egy hosszabb magyarázat,
magyarul. Nyisd meg a fejlesztői eszközöket (++F12++), válts a Network fülre, válaszd a Fetch/XHR szűrőt, és töltsd
újra az oldalt: ott az `apod?api_key=DEMO_KEY&lang=hu` kérés, `200`-as státuszkóddal. Kattints rá, és a Response fülön
ott a JSON. A kérést kétszer látod: fejlesztés közben a [[StrictMode]] minden effektet kétszer futtat, hogy a
hiányzó takarítás hamar kiderüljön. Az első válasz az `ignore` miatt nem számít.
:::

:::mistake Gyakori hiba
Kimarad a kulcs a címből: `fetch('/api/apod?lang=hu')`. Nincs kép, nincs cím, csak egy üres, fekete téglalap, a
Network fülön pedig pirossal a `403 Forbidden`. A szerver hibaüzenetet küldött (`{ "error": "API_KEY_MISSING", … }`),
a kódunk pedig ezt is képadatnak hitte. A 3. lépésben megtanítjuk észrevenni az ilyen választ.
:::

:::try Próbáld ki
Írd át a címben a `lang=hu`-t `lang=en`-re: angolul jön a cím és a magyarázat. Utána írd vissza.
:::

### Kártya és olvasható dátum

A válaszban ott a nap dátuma is, `"2026-11-15"` alakban. Ez az [[ISO 8601]] szabvány formája: év, hónap, nap,
mindig ugyanennyi számjeggyel. A gépeknek ideális (a középszinten meglátod, miért), egy embernek viszont kedvesebb a
„2026. november 15., vasárnap”.

A JavaScriptben egy időpontot a [[Date]] objektum tárol, a `new Date(…)` hozza létre egy szövegből. A szép
formázást a 11. leckéből ismert [[Intl.DateTimeFormat]] végzi: megadod neki a nyelvet és az országot (`'hu-HU'`, ez a
[[locale]]), meg hogy milyen hosszú legyen a dátum, és ő tudja, hogy magyarul az év van elöl, a hónap kisbetűs, és pont
kerül a végére.

Van egy csapda, amellyel a 14. leckében már találkoztál. Egy `Date` mindig egy pontos pillanat, és hogy az a pillanat
melyik napra esik, az az [[időzónától|időzóna]] függ: amikor Budapesten november 15. éjfél van, New Yorkban még
november 14. este hat. Ezért mindent az [[UTC]]-ben (a világidőben, a földi időzónák nullpontjában) számolunk: a
`T00:00:00Z` jelentése éjfél UTC szerint (a `Z` az UTC jele), a `timeZone: 'UTC'` pedig azt kéri, hogy a formázás is
UTC szerint történjen. Így a dátum ugyanaz marad, bárhol van a látogató.

A dátumkezelés külön fájlba kerül. Hozd létre az `src/dates.js` fájlt:

```js file=src/dates.js
// A dátumokat 'ÉÉÉÉ-HH-NN' alakú szövegként kezeljük, ahogy az API küldi őket: '2026-11-15'.

// Olvasható dátum. A style lehet 'full' (2026. november 15., vasárnap), 'long' (2026. november 15.)
// vagy 'medium' (2026. nov. 15.).
export function formatDay(iso, style = 'full') {
  // A Z azt jelenti: éjfél UTC szerint. A formázás is UTC-ben történik, így a nap
  // ugyanaz marad, bárhol van is a látogató.
  const date = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('hu-HU', { dateStyle: style, timeZone: 'UTC' }).format(date)
}
```

- A fordított aposztrófok közötti `${iso}T00:00:00Z` egy [[template literal]], mint a 4. leckében: a `${iso}` helyére
  a dátum kerül, így lesz belőle `'2026-11-15T00:00:00Z'`.
- A `style = 'full'` egy [[alapértelmezett paraméter]]: ha a hívó nem ad meg második értéket, a `style` értéke
  `'full'`. A kártyán a teljes (`'full'`), a későbbi kis kártyákon a rövidebb `'medium'` formát használjuk majd.
- A `dateStyle` a formázó beépített hosszúságait kéri: a `'full'`-ban a hét napja is benne van.

A nap képe saját komponenst kap. Hozd létre az `src/components` mappát, benne az `ApodCard.jsx` fájlt:

```jsx file=src/components/ApodCard.jsx
import { formatDay } from '../dates.js'

// Egy nap képe: a kép, a dátum, a cím, a készítő és a magyarázat.
function ApodCard({ apod }) {
  return (
    <article className="apod">
      <figure className="media">
        <img src={apod.url} alt={apod.title} />
      </figure>
      <p className="apod__date">{formatDay(apod.date)}</p>
      <h2 className="apod__title">{apod.title}</h2>
      {apod.copyright && <p className="apod__credit">Kép: {apod.copyright}</p>}
      <p className="apod__text">{apod.explanation}</p>
    </article>
  )
}

export default ApodCard
```

A `copyright` mező nem mindig van ott: a NASA saját képei közkincsek, azokat bárki szabadon használhatja, és
ilyenkor a mező hiányzik a válaszból, az értéke `undefined`. A `&&` miatt ilyenkor a sor el is marad. Az `App`-ban a
kártya helyére a komponens kerül. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=2,31
import { useEffect, useState } from 'react'
import ApodCard from './components/ApodCard.jsx'
import './App.css'

function App() {
  const [apod, setApod] = useState(null) // a mai kép adatai, amint megérkeznek

  useEffect(() => {
    let ignore = false

    async function load() {
      const response = await fetch('/api/apod?api_key=DEMO_KEY&lang=hu')
      const data = await response.json()
      if (!ignore) setApod(data)
    }

    load()
    // Takarítás: ha a komponens közben eltűnt (vagy új kérés indult), ennek a kérésnek a válaszát eldobjuk.
    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      {apod && <ApodCard apod={apod} />}
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A kép alatt arany nagybetűkkel a mai dátum áll, a hét napjával, például: „2026. NOVEMBER 23., HÉTFŐ”. (A nagybetűket
a CSS adja, a szöveg maga kisbetűs.) Alatta a cím, és ha a képnek van készítője, egy halvány sor: „Kép: Rika
Mentoring”.
:::

:::mistake Gyakori hiba
Kimarad a `timeZone: 'UTC'`. Magyarországon minden jónak látszik, de egy amerikai látogató egy nappal korábbi
dátumot lát: a `'2026-11-15T00:00:00Z'` pillanat New Yorkban még november 14-e este. Az ilyen hiba azért alattomos,
mert a fejlesztő gépén sosem jön elő.
:::

:::try Próbáld ki
Nézd meg a csapdát a saját szemeddel. Írd be a konzolba (++F12++ → Console):
`new Intl.DateTimeFormat('hu-HU', { dateStyle: 'long', timeZone: 'America/New_York' }).format(new Date('2026-11-15T00:00:00Z'))`.
Az eredmény „2026. november 14.”. Aztán írd a `formatDay`-ben a `'full'` helyére `'long'`-ot, és nézd meg, mi
változik a kártyán.
:::

### Töltés, hiba és a useApod hook

Az első lépés hibájánál láttad: a `fetch` akkor sem jelez hibát, ha a szerver `403`-mal válaszol. A `fetch`
szemszögéből ugyanis minden rendben ment: elküldte a kérést, és jött válasz. Hogy a válasz jó hír-e, azt a 14.
leckéből ismerős [[HTTP-státuszkód]] (más néven állapotkód) mondja meg, egy háromjegyű szám a válasz elején:

- `200 OK`: minden rendben, itt az adat.
- `400 Bad Request`: rossz a kérés, például nem létező dátumot kértél.
- `403 Forbidden`: tilos. Nálunk: hiányzik vagy rossz a kulcs.
- `429 Too Many Requests`: túl sok kérés. Elfogyott a kulcsod óránkénti kerete.
- `500` és fölötte: a szerver hibázott.

A `response.ok` akkor igaz, ha a státuszkód 200 és 299 közé esik. Ha nem az, nekünk kell hibát jelezni: a
`throw` megállítja a függvényt, és a hibát a legközelebbi `catch`-nek adja. A `new Error(…)` egy hibaobjektumot
készít, és mi még hozzáírjuk a `status` mezőt, hogy később tudjuk, melyik üzenetet mutassuk.

Mindaz, ami az API-val beszélget, saját fájlba kerül, ahogy a 3. leckében a jelszó logikája. Hozd létre az
`src/api.js` fájlt:

```js file=src/api.js
// Minden, ami az űr-API-val beszélget: a cím, a kulcs, a kérés és a hibák felismerése.

// Az ismert hibakódok üzenetei. Minden másra az általános üzenet jön.
const ERROR_MESSAGES = {
  403: 'Az API nem fogadta el a kulcsot (403 Forbidden). Nézd meg, jól adtad-e meg!',
  429: 'Elfogyott a kulcsod óránkénti kerete (429 Too Many Requests). Várj egy kicsit, vagy töltsd újra az oldalt!',
}

// Egy kérés az API-hoz. Ha sikerült, a válasz adatait adja vissza; ha nem, hibát dob.
export async function fetchApod() {
  const response = await fetch('/api/apod?api_key=DEMO_KEY&lang=hu')
  if (!response.ok) {
    // A fetch magától csak akkor dob hibát, ha a szervert el sem éri. A 403-at és a 429-et nekünk kell észrevenni.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // ebből tudjuk majd, melyik üzenetet mutassuk
    throw problem
  }
  return response.json()
}

// A felhasználónak szóló üzenet egy hibához.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'Az űr-API most nem érhető el. Próbáld újra!'
}
```

A 13. leckéből ismert `??` ([[nullish coalescing]]) a bal oldalát adja, kivéve, ha az `null` vagy `undefined`: akkor
a jobb oldalát. Az `ERROR_MESSAGES[error.status]` egy 403-as hibánál a 403-as üzenet, egy 500-asnál `undefined`, és akkor
jön az általános üzenet. Ha a szerver el sem érhető, a `fetch` maga dob hibát, annak nincs `status`-a, és szintén az
általános üzenet jön.

Egy kérésnek tehát három állapota van: úton van, megjött, vagy hiba történt. A 14. leckében ezt a `useFetch` hookba
csomagoltad; most egy ugyanilyen, de a nap képére szabott saját hookot írunk. Hozd létre az `src/useApod.js` fájlt:

```js file=src/useApod.js
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'

// A nap képe az API-ból: { status, apod, error, retry }.
// A status: 'loading' (úton van), 'success' (megjött) vagy 'error' (hiba történt).
function useApod() {
  const [status, setStatus] = useState('loading')
  const [apod, setApod] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // az „Újra” gomb növeli, és ez újraindítja a lekérést

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchApod()
        if (ignore) return
        setApod(data)
        setStatus('success')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    // Takarítás: ha a komponens közben eltűnt (vagy új kérés indult), ennek a kérésnek a válaszát eldobjuk.
    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { status, apod, error, retry }
}

export default useApod
```

- A [[try/catch]] a 3. leckéből ismerős: ha a `try` részben bármi hibát dob (a `fetchApod` vagy a `fetch` maga), a
  kód a `catch` részben folytatódik.
- A `retry` visszaállítja a státuszt `'loading'`-ra, és növeli az `attempt`-et. Mivel az `attempt` a függőségi
  tömbben van, az effekt újra lefut, vagyis újra kérdez.
- A hook most nem tömböt ad vissza, mint a `useState`, hanem egy objektumot: négy értéknél a nevek többet mondanak,
  mint a sorrend. A hívó a nevükkel veszi ki őket: `const { status, apod } = useApod()`.

Végül egy komponens, ami a státusz szerint dönti el, mit mutasson. Hozd létre az
`src/components/PictureOfTheDay.jsx` fájlt:

```jsx file=src/components/PictureOfTheDay.jsx
import useApod from '../useApod.js'
import { errorMessage } from '../api.js'
import ApodCard from './ApodCard.jsx'

// A nap képe: amíg úton van, egy várakozó felirat; ha hiba történt, az üzenet és egy „Újra” gomb.
function PictureOfTheDay() {
  const { status, apod, error, retry } = useApod()

  if (status === 'loading') {
    return (
      <p className="status" role="status">
        A kép úton van…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>{errorMessage(error)}</p>
        <button type="button" className="button" onClick={retry}>
          Újra
        </button>
      </div>
    )
  }

  return <ApodCard apod={apod} />
}

export default PictureOfTheDay
```

Egy komponens is visszatérhet korán: amíg tölt, a felirattal, hiba esetén a hibadobozzal, és csak ha egyik sem, a
kártyával. A `role="status"` miatt a képernyőolvasó felolvassa a feliratot, a `role="alert"` pedig azonnal szól a
hibáról. Az `App` ettől nagyon rövid lesz. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=1,12
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import './App.css'

function App() {
  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <PictureOfTheDay />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Töltsd újra az oldalt: egy pillanatig egy lüktető doboz mondja, hogy „A kép úton van…”, aztán megjelenik a kártya.
Most rontsd el a kulcsot az `src/api.js`-ben: írd a címbe `api_key=DEMO_KEY` helyett azt, hogy `api_key=`. Egy
doboz jelenik meg, a bal szélén magenta csíkkal: „Az API nem fogadta el a kulcsot (403 Forbidden)…”, alatta az
„Újra” gomb.
Az „Újra” új kérést küld (a Network fülön látszik), de a válasz megint 403. Utána írd vissza a kulcsot.
:::

:::mistake Gyakori hiba
A `catch`-ből kimarad a `setStatus('error')`. A hiba után az oldal örökre azt mondja: „A kép úton van…”, pedig a
kérés már rég visszajött. Egy kérésnek mindig véget kell érnie: vagy `'success'`, vagy `'error'` lesz belőle.
:::

:::try Feladat
A szerver a hibához magyarázatot is küld: `{ "error": "API_KEY_MISSING", "message": "No api_key was supplied. …" }`.
Az `src/api.js` `if (!response.ok)` ágában olvasd ki (`const body = await response.json()`), és tedd a hibaobjektum
`message`-ébe a `body.message`-et. A hibadobozban aztán megjelenítheted az `error.message`-et is.
:::

### Saját kulcs a .env.local fájlban

A `DEMO_KEY` mindenkié, ezért erősen korlátozott. Egy igazi szolgáltatásnál regisztrálsz, és kapsz egy saját kulcsot
(a NASA-nál például egy 40 karakteres betű-szám sort), amivel sokkal többet kérdezhetsz. A mi API-nk óránként 30
kérést enged a demókulccsal, és 1000-et egy saját kulccsal.

Hogy mennyi kérés maradt, azt a szerver minden válaszban megírja, a [[HTTP-fejlécek|HTTP-fejléc]]ben. A fejlécek a
válasz adatai előtt érkező `név: érték` sorok, amelyek a válaszról szólnak: milyen típusú, meddig érvényes, és így
tovább. Az `X-RateLimit-Limit` a kulcs óránkénti kerete, az `X-RateLimit-Remaining` a még megmaradt kérések száma. Ezt a
korlátot [[kérési korlát]]nak (rate limit) hívják; ha elfogy, jön a `429`. (A mi kitalált szerverünk a böngésző
memóriájában számol, ezért egy újratöltés nullázza a számlálót. Egy igazi szerver ilyen engedékeny nem lesz.)

Hová kerüljön a saját kulcs? A kódba semmiképp: onnan a git-repóba, a repóból pedig akár a GitHubra jutna, ahol
bárki megtalálja. A 14. leckében láttad a megoldást: egy [[környezeti változó]]. Ott azt is olvastad, hogy a `.env` a
közös, commitolható beállításoké, a csak a te gépedre tartozó érték, például egy saját kulcs, pedig a `.env.local`-ba
való. A Vite mindkét fájl `VITE_` kezdetű sorait beolvassa, és a kódban az `import.meta.env`-ben adja oda őket.

Hozd létre a projekt gyökerében (a `package.json` mellett, nem az `src`-ben) a `.env.local` fájlt. A kitalált
szerverünk bármilyen kulcsot elfogad, ami a `.env.local`-ban áll, úgyhogy találj ki egyet:

```text file=.env.local
VITE_APOD_KEY=gyakorlo-kulcs-123
```

A kiinduló projekt `.gitignore`-jában még nincs benne a `*.local` sor (a 14. lecke kiinduló projektjében benne volt):
vedd fel a végére, hogy a git ne vegye észre a `.env.local`-t, és a kulcs sose kerüljön commitba. A `*` bármilyen
szöveget jelent, így a `*.local` minden `.local` végű fájlra illik, a `.env.local`-ra is. Itt a teljes `.gitignore`:

```text file=.gitignore mark=5
node_modules
dist
.DS_Store
*.log
*.local
```

Most jöhet a kód. A kérés címét eddig kézzel raktuk össze. Ha a kulcs egy változóból jön, a [[URLSearchParams]]
csinálja meg helyettünk: egy objektumból `név=érték&név=érték` szöveget készít, és közben minden értéket
[[URL-kódol|URL-kódolás]], ahogy a 4. leckében az `encodeURIComponent`: ha egy kulcsban `&`, `?` vagy szóköz lenne,
azt is biztonságos formára írja, így nem törheti szét a címet. Itt a teljes `src/api.js`:

```js file=src/api.js mark=2-4,14-16
// Minden, ami az űr-API-val beszélget: a cím, a kulcs, a kérés és a hibák felismerése.
const API_URL = '/api/apod'
// A kulcs a .env.local fájlból jön. Ha ott nincs, marad a nyilvános demókulcs.
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// Az ismert hibakódok üzenetei. Minden másra az általános üzenet jön.
const ERROR_MESSAGES = {
  403: 'Az API nem fogadta el a kulcsot (403 Forbidden). Nézd meg, jól adtad-e meg!',
  429: 'Elfogyott a kulcsod óránkénti kerete (429 Too Many Requests). Várj egy kicsit, vagy töltsd újra az oldalt!',
}

// Egy kérés az API-hoz. Ha sikerült, a válasz adatait adja vissza; ha nem, hibát dob.
export async function fetchApod() {
  // A URLSearchParams rakja össze a ? utáni részt, és minden értéket biztonságosan kódol.
  const query = new URLSearchParams({ api_key: API_KEY, lang: 'hu' })
  const response = await fetch(`${API_URL}?${query}`)
  if (!response.ok) {
    // A fetch magától csak akkor dob hibát, ha a szervert el sem éri. A 403-at és a 429-et nekünk kell észrevenni.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // ebből tudjuk majd, melyik üzenetet mutassuk
    throw problem
  }
  return response.json()
}

// A felhasználónak szóló üzenet egy hibához.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'Az űr-API most nem érhető el. Próbáld újra!'
}
```

Az `||` (vagy) a bal oldalát adja, ha az „igaznak számít”, különben a jobbat. Ha nincs `.env.local` fájl, az
`import.meta.env.VITE_APOD_KEY` értéke `undefined`; ha van, de üres (`VITE_APOD_KEY=`), akkor `''`. Az `||` mindkét
esetben a `'DEMO_KEY'`-t adja; a `??` az üres szövegnél nem segítene.

:::check Ellenőrizd
A Vite észreveszi az új `.env.local` fájlt, és magától újraindul (a terminálban: „.env.local changed, restarting
server...”). Ha
mégsem, állítsd le a szervert (++Ctrl++ + ++C++), és indítsd újra az `npm run dev` paranccsal. Töltsd újra az oldalt, és
a Network fülön kattints az `apod?…` kérésre. A Headers fülön a kérés címében már `api_key=gyakorlo-kulcs-123` áll,
lejjebb, a válasz fejlécei között pedig `x-ratelimit-limit: 1000`, és az `x-ratelimit-remaining` is 1000 körül van.
A terminálban a `git status` nem említi a `.env.local`-t. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
A változó neve elől kimarad a `VITE_`: `APOD_KEY=gyakorlo-kulcs-123`. Nincs hibaüzenet, minden működik, csak a
demókulccsal: a fejlécben megint `x-ratelimit-limit: 30` áll. A Vite szándékosan csak a `VITE_` kezdetű változókat
adja oda a böngészőnek, a többi a gépeden marad. Így egy véletlenül a `.env.local`-ba írt jelszó nem kerül az
oldalba.
:::

:::concept Egy kulcs a böngészőben nem titok
Minden, ami `VITE_` kezdetű, beépül a kész JavaScript-fájlba, és a kulcs ott van minden kérés címében is: bárki
kiolvashatja a Network fülről. Ez rendben van az olyan kulcsoknál, amelyeket arra szántak, hogy a böngészőben
használják őket, és amelyekkel legfeljebb a kérési keretet lehet elhasználni (ilyen az APOD-é). A titkos kulcsok
(fizetés, mesterséges intelligencia, adatbázis) viszont sosem kerülhetnek a böngészőbe. Azokat egy saját szerver
([[backend]]) őrzi: a böngésző a saját szerverednek szól, és az teszi hozzá a kulcsot, mielőtt továbbküldi a kérést.
A `.gitignore` attól véd, hogy a kulcs a repóba kerüljön, attól nem, hogy a kész oldalban látsszon.
:::

## Középszint {level=2}

### Bármelyik nap képe

Az archívum 1995. június 16-án kezdődik, és minden napjához tartozik egy kép. Lapozzunk benne! Az API-nak a `date`
paraméterrel mondhatod meg, melyik nap képét kéred, ugyanabban az `ÉÉÉÉ-HH-NN` formában. A böngésző
dátummezője, az `<input type="date">` is pontosan ilyen szöveget ad, úgyhogy semmit sem kell átalakítani.

Két új dolog kell a `dates.js`-be: az archívum első napja és a mai nap. Ez utóbbi trükkösebb, mint hinnéd. Az API
(ahogy a NASA is) New York-i idő szerint kezd új napot. Ha Budapesten hajnali négy van, New Yorkban még tegnap
este tíz: az API szerint ilyenkor még nincs „mai” kép. Az `Intl.DateTimeFormat` egy `timeZone`-nal bármelyik
időzóna naptárát megmondja. A kanadai angol (`'en-CA'`) formátum ráadásul éppen `ÉÉÉÉ-HH-NN` alakban írja a
dátumot. Itt a teljes `src/dates.js`:

```js file=src/dates.js mark=1,3-10
// A dátumokat 'ÉÉÉÉ-HH-NN' alakú szövegként kezeljük, ahogy az API és a dátummező is: '2026-11-15'.

// Az archívum első napja: ekkor jelent meg az első kép.
export const FIRST_DAY = '1995-06-16'

// A mai nap az API szerint. Az API-nál (ahogy a NASA-nál, amit utánoz) New Yorkban, éjfélkor kezdődik
// az új nap. A kanadai angol ('en-CA') formátum éppen ÉÉÉÉ-HH-NN alakban írja a dátumot.
export function apodToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

// Olvasható dátum. A style lehet 'full' (2026. november 15., vasárnap), 'long' (2026. november 15.)
// vagy 'medium' (2026. nov. 15.).
export function formatDay(iso, style = 'full') {
  // A Z azt jelenti: éjfél UTC szerint. A formázás is UTC-ben történik, így a nap
  // ugyanaz marad, bárhol van is a látogató.
  const date = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('hu-HU', { dateStyle: style, timeZone: 'UTC' }).format(date)
}
```

A `new Date()` paraméter nélkül a mostani pillanat. A `fetchApod` mostantól egy `params` objektumot is kap: ezek a
lekérdezés további részei, például `{ date: '2026-11-15' }`. A `...params` [[spread]] (a 3. leckéből ismerős)
beleteszi őket a `URLSearchParams` objektumába. Jön egy üzenet a `400`-as hibához is: ezt kapjuk, ha az archívumon
kívüli napot kérünk. Itt a teljes `src/api.js`:

```js file=src/api.js mark=8,13-15,17
// Minden, ami az űr-API-val beszélget: a cím, a kulcs, a kérés és a hibák felismerése.
const API_URL = '/api/apod'
// A kulcs a .env.local fájlból jön. Ha ott nincs, marad a nyilvános demókulcs.
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// Az ismert hibakódok üzenetei. Minden másra az általános üzenet jön.
const ERROR_MESSAGES = {
  400: 'Erre a napra nincs kép az archívumban (400 Bad Request).',
  403: 'Az API nem fogadta el a kulcsot (403 Forbidden). Nézd meg, jól adtad-e meg!',
  429: 'Elfogyott a kulcsod óránkénti kerete (429 Too Many Requests). Várj egy kicsit, vagy töltsd újra az oldalt!',
}

// Egy kérés az API-hoz. A params a lekérdezés többi része, például { date: '2026-11-15' }.
// Ha sikerült, a válasz adatait adja vissza; ha nem, hibát dob.
export async function fetchApod(params) {
  // A URLSearchParams rakja össze a ? utáni részt, és minden értéket biztonságosan kódol.
  const query = new URLSearchParams({ api_key: API_KEY, lang: 'hu', ...params })
  const response = await fetch(`${API_URL}?${query}`)
  if (!response.ok) {
    // A fetch magától csak akkor dob hibát, ha a szervert el sem éri. A 403-at és a 429-et nekünk kell észrevenni.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // ebből tudjuk majd, melyik üzenetet mutassuk
    throw problem
  }
  return response.json()
}

// A felhasználónak szóló üzenet egy hibához.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'Az űr-API most nem érhető el. Próbáld újra!'
}
```

A hook paraméterként kapja a dátumot, továbbadja a `fetchApod`-nak, és a függőségi tömbbe is beírja: a szabály
szerint mindennek ott a helye, amit az effekt a komponensből használ. Itt a teljes `src/useApod.js`:

```js file=src/useApod.js mark=4,6,17,33
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'

// Egy nap képe az API-ból: { status, apod, error, retry }.
// A status: 'loading' (úton van), 'success' (megjött) vagy 'error' (hiba történt).
function useApod(date) {
  const [status, setStatus] = useState('loading')
  const [apod, setApod] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // az „Újra” gomb növeli, és ez újraindítja a lekérést

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchApod({ date })
        if (ignore) return
        setApod(data)
        setStatus('success')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    // Takarítás: ha a komponens közben eltűnt (vagy új kérés indult), ennek a kérésnek a válaszát eldobjuk.
    return () => {
      ignore = true
    }
  }, [date, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { status, apod, error, retry }
}

export default useApod
```

A `PictureOfTheDay` a dátumot propként kapja, és továbbadja a hooknak. Itt a teljes
`src/components/PictureOfTheDay.jsx`:

```jsx file=src/components/PictureOfTheDay.jsx mark=5-7
import useApod from '../useApod.js'
import { errorMessage } from '../api.js'
import ApodCard from './ApodCard.jsx'

// Egy nap képe: amíg úton van, egy várakozó felirat; ha hiba történt, az üzenet és egy „Újra” gomb.
function PictureOfTheDay({ date }) {
  const { status, apod, error, retry } = useApod(date)

  if (status === 'loading') {
    return (
      <p className="status" role="status">
        A kép úton van…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>{errorMessage(error)}</p>
        <button type="button" className="button" onClick={retry}>
          Újra
        </button>
      </div>
    )
  }

  return <ApodCard apod={apod} />
}

export default PictureOfTheDay
```

Végül az `App`: itt él a megnyitott nap, és itt van a dátummező. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,7-14,23-34,36-37
import { useState } from 'react'
import { FIRST_DAY, apodToday } from './dates.js'
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import './App.css'

function App() {
  // A mai nap az API szerint. Egyszer számoljuk ki, amikor az oldal megnyílik.
  const [today] = useState(apodToday)
  const [date, setDate] = useState(today) // a megnyitott nap

  function changeDate(newDate) {
    // Üres vagy az archívumon kívül eső dátumot nem fogadunk el.
    if (newDate >= FIRST_DAY && newDate <= today) setDate(newDate)
  }

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <div className="date-nav">
        <label className="date-nav__field">
          <span className="visually-hidden">Dátum</span>
          <input
            type="date"
            min={FIRST_DAY}
            max={today}
            defaultValue={date}
            onChange={(event) => changeDate(event.target.value)}
          />
        </label>
      </div>

      {/* A key miatt minden új dátum egy vadonatúj PictureOfTheDay-t kap, tiszta állapottal. */}
      <PictureOfTheDay key={date} date={date} />
    </main>
  )
}

export default App
```

- A `useState(apodToday)` egy [[lusta kezdőérték]], mint a 3. leckében: a React csak az első rajzoláskor hívja meg a
  függvényt. A `today`-t sosem állítjuk, ezért nem is kérjük el a beállító függvényét. Azért mégis állapot, hogy csak
  egyszer, az első rajzoláskor számoljuk ki, és utána minden rajzolásnál ugyanaz maradjon.
- A dátumokat egyszerűen összehasonlíthatjuk szövegként: a `'2026-11-15' < '2026-12-01'` igaz, mert az ISO-formában
  elöl áll az év, utána a hónap, végül a nap, és mindegyik ugyanannyi számjegyből áll. Ezért jó formátum ez a
  gépeknek.
- A `changeDate` őrzi az archívum határait. A `min` és a `max` a naptárban ugyan nem engedi kiválasztani a határokon
  kívüli napokat, de a mező ki is üríthető, és billentyűzettel bármi beírható. Az üres szöveg (`''`) kisebb minden
  dátumnál, így azt is kiszűrjük.
- A mező `defaultValue`-t kap, nem `value`-t: a kezdőértéket a React adja, a gépelést viszont a böngészőre hagyjuk.
  Egy évszám beírása közben ugyanis félkész dátumok jönnek (`0002-11-23`, `0020-11-23`, `0202-11-23`…), ezeket a
  `changeDate` elutasítja, és egy `value={date}` mellett a React minden billentyűleütés után visszaírná a régi napot:
  billentyűzettel sosem jutnál el 2024-ig.
- A `<span className="visually-hidden">` egy felirat, amit csak a képernyőolvasó lát: a mezőnek így is van neve.
- A `key={date}` a 3. leckéből ismerős trükk. Ha a [[key]] megváltozik, a React a régi `PictureOfTheDay`-t eldobja, és
  egy vadonatújat rak a helyére, friss állapottal. Az új nap így mindig az „A kép úton van…” felirattal indul, és nem
  a régi kép marad ott, amíg az új meg nem érkezik.

:::check Ellenőrizd
A kártya fölött egy dátummező áll a mai nappal. Válassz a naptárból egy másik napot: rövid „A kép úton van…” után
megjelenik annak a napnak a képe. Válaszd 1995. június 16-át: „Az Orion-köd, a csillagok bölcsője”. A naptár ennél
korábbi és a mainál későbbi napot nem enged kiválasztani.
:::

:::mistake Gyakori hiba
A mai napot `new Date().toISOString().slice(0, 10)`-zel kiszámolni. Ez a mai nap UTC szerint: Magyarországon éjfél
után (télen 1 és 6, nyáron 2 és 6 óra között) az UTC már az új napot mutatja, New Yorkban viszont még az előző nap
van. Ilyenkor az API `400 Bad Request`-tel válaszol a „holnapi” napra, és az oldal azt írja: „Erre a napra nincs kép
az archívumban”. Az ilyen hiba csak éjszaka jön elő, ezért a `today`-t mindig az API időzónájában számold ki.
:::

:::try Próbáld ki
Vedd ki ideiglenesen a `key={date}`-et a `PictureOfTheDay`-ről, és válassz egy másik napot. A dátummező már az új
napot mutatja, a kártya viszont egy pillanatig még a régi képet, „A kép úton van…” felirat nélkül: a komponens
megtartotta a régi állapotát. Utána tedd vissza a `key`-t.
:::

### Előző nap, következő nap

A naptárban lapozni kényelmetlen, ha csak a tegnapi képre vagy kíváncsi. Kell két gomb: egy nappal vissza, egy nappal
előre. Egy dátumhoz egy napot hozzáadni nehezebb, mint amilyennek hangzik: november 30. után december 1. jön,
február 28. után hol 29., hol március 1. Szerencsére a `Date` ezt mind tudja. A `getUTCDate()` megadja a hónap napját
(például 15-öt), a `setUTCDate` átírja, és ha az új szám túlcsordul (például „november 31.”), a `Date` magától átlép a
következő hónapra. A `toISOString()` aztán
`'2026-11-16T00:00:00.000Z'` alakban adja vissza, aminek az első 10 karaktere (`slice(0, 10)`) éppen a dátum.

Itt is minden UTC-ben történik. A helyi idő szerinti számolásnál az [[óraátállítás]] napján egy nap csak 23 vagy 25
órás, és a „holnap éjfél” könnyen „ma este tizenegy” lesz. Az UTC-ben nincs óraátállítás. Itt a teljes
`src/dates.js`:

```js file=src/dates.js mark=12-18
// A dátumokat 'ÉÉÉÉ-HH-NN' alakú szövegként kezeljük, ahogy az API és a dátummező is: '2026-11-15'.

// Az archívum első napja: ekkor jelent meg az első kép.
export const FIRST_DAY = '1995-06-16'

// A mai nap az API szerint. Az API-nál (ahogy a NASA-nál, amit utánoz) New Yorkban, éjfélkor kezdődik
// az új nap. A kanadai angol ('en-CA') formátum éppen ÉÉÉÉ-HH-NN alakban írja a dátumot.
export function apodToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

// A days nappal későbbi nap (negatív számmal korábbi): shiftDay('2026-11-15', -1) → '2026-11-14'.
// Minden UTC-ben történik, így az óraátállítás sem csúsztathatja el a napot.
export function shiftDay(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// Olvasható dátum. A style lehet 'full' (2026. november 15., vasárnap), 'long' (2026. november 15.)
// vagy 'medium' (2026. nov. 15.).
export function formatDay(iso, style = 'full') {
  // A Z azt jelenti: éjfél UTC szerint. A formázás is UTC-ben történik, így a nap
  // ugyanaz marad, bárhol van is a látogató.
  const date = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('hu-HU', { dateStyle: style, timeZone: 'UTC' }).format(date)
}
```

A lapozó saját komponenst kap, és a dátummező is ide költözik az `App`-ból. Hozd létre az
`src/components/DateNav.jsx` fájlt:

```jsx file=src/components/DateNav.jsx
import { useEffect, useRef } from 'react'
import { FIRST_DAY, shiftDay } from '../dates.js'

// Lapozás a napok között: előző nap, dátummező, következő nap és a mai nap.
function DateNav({ date, today, onChange }) {
  const inputRef = useRef(null)

  // A gombok kívülről váltanak napot: a rajzolás után a mezőbe is beírjuk.
  useEffect(() => {
    inputRef.current.value = date
  }, [date])

  return (
    <div className="date-nav">
      <button
        type="button"
        className="button button--ghost"
        disabled={date <= FIRST_DAY}
        onClick={() => onChange(shiftDay(date, -1))}
      >
        ‹ Előző nap
      </button>
      <label className="date-nav__field">
        <span className="visually-hidden">Dátum</span>
        <input
          ref={inputRef}
          type="date"
          min={FIRST_DAY}
          max={today}
          defaultValue={date}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="button button--ghost"
        disabled={date >= today}
        onClick={() => onChange(shiftDay(date, 1))}
      >
        Következő nap ›
      </button>
      <button type="button" className="button" disabled={date === today} onClick={() => onChange(today)}>
        Ma
      </button>
    </div>
  )
}

export default DateNav
```

A `disabled` gombra nem lehet kattintani: az első napon nincs előző, a mai napon nincs következő, és a „Ma” gomb is
pihen, ha már a mai napon állsz. Az összehasonlítások megint szövegek között történnek. A `DateNav` maga nem tárol
semmit: megmutatja a kapott dátumot, és minden változtatást az `onChange` propon át jelez az `App`-nak, ahol az
állapot él (az [[állapot felemelése]], ahogy a 3. leckében a csúszkánál). A dátummezőt most a gombok is átállítják,
ezért egy `useRef`-fel fogjuk meg, és egy effekt a rajzolás után beleírja az új napot, ahogy a 12. leckében a
`<dialog>`-nak szóltunk. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=3,24
import { useState } from 'react'
import { FIRST_DAY, apodToday } from './dates.js'
import DateNav from './components/DateNav.jsx'
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import './App.css'

function App() {
  // A mai nap az API szerint. Egyszer számoljuk ki, amikor az oldal megnyílik.
  const [today] = useState(apodToday)
  const [date, setDate] = useState(today) // a megnyitott nap

  function changeDate(newDate) {
    // Üres vagy az archívumon kívül eső dátumot nem fogadunk el.
    if (newDate >= FIRST_DAY && newDate <= today) setDate(newDate)
  }

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <DateNav date={date} today={today} onChange={changeDate} />

      {/* A key miatt minden új dátum egy vadonatúj PictureOfTheDay-t kap, tiszta állapottal. */}
      <PictureOfTheDay key={date} date={date} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Az „‹ Előző nap” gomb egy nappal visszalép, a dátummező is követi. A mai napon a „Következő nap ›” és a „Ma” szürke,
nem kattintható. Állítsd a mezőt 2024. március 1-jére, és lépj vissza egyet: 2024. február 29. jön (2024 szökőév
volt). Állítsd 1995. június 17-ére, és lépj vissza: az Orion-köd jön, az „Előző nap” pedig kiszürkül.
:::

:::mistake Gyakori hiba
Helyi idővel számolni: a dátum végére `T00:00:00` kerül `Z` nélkül (ez helyi éjfél), és `setDate(getDate() + 1)`
lép egy napot. A `toISOString()` viszont UTC-ben ír: a magyar éjfél UTC szerint még az előző nap este 11 (nyáron 10),
így a `slice(0, 10)` a régi napot adja vissza. A „Következő nap” gomb ilyenkor egy helyben topog: hiába
kattintasz, ugyanaz a dátum marad, az „Előző nap” pedig egyszerre két napot ugrik vissza.
:::

:::try Feladat
Adj a lapozóhoz egy „Véletlen nap” gombot. Az első nap óta eltelt napok száma
`(new Date(today) - new Date(FIRST_DAY)) / 86400000` (két `Date` különbsége ezredmásodpercben jön, egy nap 86 400 000
ezredmásodperc). Válassz egy véletlen egész számot 0-tól eddig a számig, a végét is beleértve (`Math.random` és
`Math.floor`), és lépj ennyi napot előre a `FIRST_DAY`-től a `shiftDay`-jel.
:::

### Videós napok

Nem minden nap kép a nap képe: az igazi APOD-on időnként egy videó szerepel. Ezt a válasz [[médiatípus]]a jelzi, a
`media_type` mező: `'image'` vagy `'video'`. A mi archívumunkban is vannak videós napok, például 2026. november 14.
Ha most odalapozol, az oldal egy `<img>`-ben mutatja a videót. Nálunk ez véletlenül működik is, de egy igazi videónál
egy törött kép lenne a helyén.

A videó fajtáját az URL-je (a webcíme) árulja el. Egy `.mp4` vagy `.webm` végű URL igazi videófájl, ezt a böngésző
`<video>` eleme játssza le, saját gombokkal. A mi API-nk videói kódból rajzolt animációk, `.svg` végű URL-lel: ezeket
egy `<img>` magától lejátssza, ahogy egy animált GIF-et. Minden más (például egy videómegosztó oldal lejátszója) itt nem
játszható le. A szünethez egy állókép kell, ezt az API a `thumbs=true` paraméterre küldi, a `thumbnail_url`
mezőben. A szünet trükkje egyszerű: amíg szünetel, az animáció helyett az állóképet mutatjuk.

Előbb kérjük el az állóképeket is. Itt a teljes `src/api.js`:

```js file=src/api.js mark=17-18
// Minden, ami az űr-API-val beszélget: a cím, a kulcs, a kérés és a hibák felismerése.
const API_URL = '/api/apod'
// A kulcs a .env.local fájlból jön. Ha ott nincs, marad a nyilvános demókulcs.
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// Az ismert hibakódok üzenetei. Minden másra az általános üzenet jön.
const ERROR_MESSAGES = {
  400: 'Erre a napra nincs kép az archívumban (400 Bad Request).',
  403: 'Az API nem fogadta el a kulcsot (403 Forbidden). Nézd meg, jól adtad-e meg!',
  429: 'Elfogyott a kulcsod óránkénti kerete (429 Too Many Requests). Várj egy kicsit, vagy töltsd újra az oldalt!',
}

// Egy kérés az API-hoz. A params a lekérdezés többi része, például { date: '2026-11-15' }.
// Ha sikerült, a válasz adatait adja vissza; ha nem, hibát dob.
export async function fetchApod(params) {
  // A URLSearchParams rakja össze a ? utáni részt, és minden értéket biztonságosan kódol.
  // A thumbs: 'true' miatt a videós napokhoz egy állókép is jár (thumbnail_url).
  const query = new URLSearchParams({ api_key: API_KEY, lang: 'hu', thumbs: 'true', ...params })
  const response = await fetch(`${API_URL}?${query}`)
  if (!response.ok) {
    // A fetch magától csak akkor dob hibát, ha a szervert el sem éri. A 403-at és a 429-et nekünk kell észrevenni.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // ebből tudjuk majd, melyik üzenetet mutassuk
    throw problem
  }
  return response.json()
}

// A felhasználónak szóló üzenet egy hibához.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'Az űr-API most nem érhető el. Próbáld újra!'
}
```

Most jöhet a komponens, ami a médiatípus szerint dönt. Hozd létre az `src/components/ApodMedia.jsx` fájlt:

```jsx file=src/components/ApodMedia.jsx
import { useState } from 'react'

// Aki a gépén kevesebb mozgást kért, annak a videó állóképpel indul.
function prefersLessMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Egy videós nap. Hogy milyen videó, azt az URL vége árulja el.
function VideoPlayer({ apod }) {
  const [playing, setPlaying] = useState(() => !prefersLessMotion())
  const url = apod.url.toLowerCase()

  // Igazi videófájl: a böngésző <video> eleme lejátssza, saját gombokkal.
  if (url.endsWith('.mp4') || url.endsWith('.webm')) {
    return (
      <figure className="media">
        <video src={apod.url} poster={apod.thumbnail_url} controls />
      </figure>
    )
  }

  // Kódból rajzolt animáció: az <img> magától lejátssza. Szünetben az állókép kerül a helyére.
  if (url.endsWith('.svg')) {
    return (
      <figure className="media">
        <img src={playing ? apod.url : apod.thumbnail_url} alt={apod.title} />
        <figcaption className="media__bar">
          <span className="badge">Videó</span>
          <button type="button" className="media__button" onClick={() => setPlaying(!playing)}>
            {playing ? 'Szünet' : 'Lejátszás'}
          </button>
        </figcaption>
      </figure>
    )
  }

  // Minden más, például egy videómegosztó oldal lejátszója: ezt itt nem tudjuk lejátszani.
  return (
    <div className="media media--note">
      {apod.thumbnail_url && <img src={apod.thumbnail_url} alt="" />}
      <p>Ezen a napon videó szerepel, de ezt itt nem tudjuk lejátszani.</p>
    </div>
  )
}

// A nap képe a médiatípusa szerint: kép, videó vagy valami más.
function ApodMedia({ apod }) {
  if (apod.media_type === 'image') {
    return (
      <figure className="media">
        <img src={apod.url} alt={apod.title} />
      </figure>
    )
  }

  if (apod.media_type === 'video') {
    return <VideoPlayer apod={apod} />
  }

  return (
    <div className="media media--note">
      <p>Ezen a napon olyan tartalom szerepel, amit itt nem tudunk megjeleníteni.</p>
    </div>
  )
}

export default ApodMedia
```

- Az `ApodMedia` a `media_type` szerint választ, a `VideoPlayer` pedig az URL vége szerint: a `toLowerCase()`
  kisbetűsít, az `endsWith('.svg')` megmondja, hogy a szöveg `.svg`-re végződik-e. Egy fájlban több komponens is
  lehet; a `VideoPlayer`-t csak az `ApodMedia` használja, ezért nem exportáljuk.
- Miért külön komponens a `VideoPlayer`? Mert csak a videónak van állapota (megy vagy szünetel). Az `ApodMedia` korai
  visszatérései után nem hívhatnánk `useState`-et: a 6. leckéből ismert [[hookok szabálya]] szerint egy hookot mindig
  a komponens tetején, feltétel nélkül kell hívni, minden rajzoláskor ugyanabban a sorrendben, mert a React a
  sorrendjükből tudja, melyik állapot melyik. Az `ApodMedia` tetejére tehetnénk ugyan, de akkor minden képes napnak
  is lenne egy fölösleges állapota. Külön komponensben az állapot csak a videóké.
- A `prefersLessMotion` a 2. leckéből ismerős `matchMedia`-t használja. Akinek a rendszerében be van kapcsolva a
  „kevesebb mozgás” beállítás (az 1. leckéből ismert [[prefers-reduced-motion]]), annak nem indul el magától a
  mozgás, ahogy a 12. leckében a vetítés sem. A `useState` lusta kezdőértéke miatt ez csak egyszer, az első
  rajzoláskor fut le.
- A `poster` a `<video>` állóképe, amíg el nem indítod. Ha a `thumbnail_url` nincs meg, `undefined`, és a React
  egyszerűen kihagyja az attribútumot.

Az `ApodCard`-ban a `<figure>` helyére az új komponens kerül. Itt a teljes `src/components/ApodCard.jsx`:

```jsx file=src/components/ApodCard.jsx mark=2,4,8
import { formatDay } from '../dates.js'
import ApodMedia from './ApodMedia.jsx'

// Egy nap képe: a kép vagy a videó, a dátum, a cím, a készítő és a magyarázat.
function ApodCard({ apod }) {
  return (
    <article className="apod">
      <ApodMedia apod={apod} />
      <p className="apod__date">{formatDay(apod.date)}</p>
      <h2 className="apod__title">{apod.title}</h2>
      {apod.copyright && <p className="apod__credit">Kép: {apod.copyright}</p>}
      <p className="apod__text">{apod.explanation}</p>
    </article>
  )
}

export default ApodCard
```

:::check Ellenőrizd
Lapozz 2026. november 14-ére: „Táncoló fényfüggönyök”. A sarki fény mozog, alatta egy fekete sávban egy arany
„VIDEÓ” címke és egy „Szünet” gomb. A „Szünet” megállítja (az állókép jön), a „Lejátszás” újraindítja. Videós nap
még például 2026. november 8. és november 22. is; az archívum 50 naponként ismétlődik, így ezek előtt 50, 100, 150…
nappal is videó van. Egy sima képes napon nincs sáv, nincs gomb.
:::

:::mistake Gyakori hiba
Kimarad a `thumbs: 'true'`. A videó lejátszódik, de a „Szünet” után egy fekete doboz marad a helyén, a sarkában egy
törött kép ikonjával és a kép címével. A `thumbnail_url` ilyenkor nincs a válaszban, az `<img>` `src` nélkül marad, és
a böngésző csak az `alt` szövegét tudja kiírni. Amit az API csak egy paraméter kérésére küld, az a paraméter nélkül
hiányzik a válaszból, és a mező értéke `undefined`.
:::

:::try Próbáld ki
A fejlesztői eszközökben kapcsold be a „kevesebb mozgás” beállítást: ++F12++, aztán ++Ctrl++ + ++Shift++ + ++P++
(Macen ++Cmd++ + ++Shift++ + ++P++), írd be: „reduced motion”, és válaszd az „Emulate CSS prefers-reduced-motion:
reduce” sort. Töltsd újra az oldalt egy videós napon: az állókép jön, a gombon „Lejátszás” áll.
:::

### Kedvencek

Egy szép képet jó lenne eltenni. A kedvencek listája a böngészőben marad meg, a 6. leckéből ismert `useLocalStorage`
hookkal: úgy működik, mint a `useState`, de az értéket JSON-ként a `localStorage`-be is elmenti, és újratöltéskor
onnan olvassa vissza. Ha a 9. leckéből megvan a saját változatod, másold át; ha nincs, hozd létre az
`src/useLocalStorage.js` fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Úgy működik, mint a useState, de az érték túléli az újratöltést:
// JSON-ként tárolja a localStorage-ben, a key nevű kulcs alatt.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Letiltott tároló vagy hibás mentés: marad a kezdőérték.
    }
    return initialValue
  })

  // Minden változás után elmentjük.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Nem baj, ha nem sikerül: az érték így is működik, csak nem emlékszik.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

Mit mentsünk egy kedvencről? Nem az egész választ: a magyarázat hosszú, és a listához nem kell. Elég a dátum (ebből
bármikor újra lekérhető), a cím és egy kis kép a kártyára. A kis kép egy képnél maga a kép, egy videónál az állókép.
Ezt egy kis segédfüggvény mondja meg az `src/api.js` végén. Itt a teljes fájl:

```js file=src/api.js mark=34-37
// Minden, ami az űr-API-val beszélget: a cím, a kulcs, a kérés és a hibák felismerése.
const API_URL = '/api/apod'
// A kulcs a .env.local fájlból jön. Ha ott nincs, marad a nyilvános demókulcs.
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// Az ismert hibakódok üzenetei. Minden másra az általános üzenet jön.
const ERROR_MESSAGES = {
  400: 'Erre a napra nincs kép az archívumban (400 Bad Request).',
  403: 'Az API nem fogadta el a kulcsot (403 Forbidden). Nézd meg, jól adtad-e meg!',
  429: 'Elfogyott a kulcsod óránkénti kerete (429 Too Many Requests). Várj egy kicsit, vagy töltsd újra az oldalt!',
}

// Egy kérés az API-hoz. A params a lekérdezés többi része, például { date: '2026-11-15' }.
// Ha sikerült, a válasz adatait adja vissza; ha nem, hibát dob.
export async function fetchApod(params) {
  // A URLSearchParams rakja össze a ? utáni részt, és minden értéket biztonságosan kódol.
  // A thumbs: 'true' miatt a videós napokhoz egy állókép is jár (thumbnail_url).
  const query = new URLSearchParams({ api_key: API_KEY, lang: 'hu', thumbs: 'true', ...params })
  const response = await fetch(`${API_URL}?${query}`)
  if (!response.ok) {
    // A fetch magától csak akkor dob hibát, ha a szervert el sem éri. A 403-at és a 429-et nekünk kell észrevenni.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // ebből tudjuk majd, melyik üzenetet mutassuk
    throw problem
  }
  return response.json()
}

// A felhasználónak szóló üzenet egy hibához.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'Az űr-API most nem érhető el. Próbáld újra!'
}

// Egy nap kis képe: képnél maga a kép, videónál az állókép (ha nincs, undefined).
export function thumbnailOf(apod) {
  return apod.media_type === 'image' ? apod.url : apod.thumbnail_url
}
```

A kártyára egy csillagos gomb kerül. Ez egy kapcsológomb: az `aria-pressed` mondja meg (a képernyőolvasónak és a
CSS-nek is), hogy be van-e nyomva. Itt a teljes `src/components/ApodCard.jsx`:

```jsx file=src/components/ApodCard.jsx mark=4-5,12-20
import { formatDay } from '../dates.js'
import ApodMedia from './ApodMedia.jsx'

// Egy nap képe: a kép vagy a videó, a dátum, a cím, a készítő, a kedvenc gomb és a magyarázat.
function ApodCard({ apod, isFavorite, onToggleFavorite }) {
  return (
    <article className="apod">
      <ApodMedia apod={apod} />
      <p className="apod__date">{formatDay(apod.date)}</p>
      <h2 className="apod__title">{apod.title}</h2>
      {apod.copyright && <p className="apod__credit">Kép: {apod.copyright}</p>}
      <button
        type="button"
        className="favorite-button"
        aria-pressed={isFavorite}
        onClick={onToggleFavorite}
      >
        <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
        Kedvenc
      </button>
      <p className="apod__text">{apod.explanation}</p>
    </article>
  )
}

export default ApodCard
```

A `PictureOfTheDay` csak továbbadja a két propot. Az `onToggleFavorite`-ot úgy hívja, hogy átadja neki a betöltött
napot is, hiszen az `App` nem látja az `apod`-ot, csak a hook ismeri. Itt a teljes
`src/components/PictureOfTheDay.jsx`:

```jsx file=src/components/PictureOfTheDay.jsx mark=6,28
import useApod from '../useApod.js'
import { errorMessage } from '../api.js'
import ApodCard from './ApodCard.jsx'

// Egy nap képe: amíg úton van, egy várakozó felirat; ha hiba történt, az üzenet és egy „Újra” gomb.
function PictureOfTheDay({ date, isFavorite, onToggleFavorite }) {
  const { status, apod, error, retry } = useApod(date)

  if (status === 'loading') {
    return (
      <p className="status" role="status">
        A kép úton van…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>{errorMessage(error)}</p>
        <button type="button" className="button" onClick={retry}>
          Újra
        </button>
      </div>
    )
  }

  return <ApodCard apod={apod} isFavorite={isFavorite} onToggleFavorite={() => onToggleFavorite(apod)} />
}

export default PictureOfTheDay
```

A kedvencek listája kis kártyákból áll. Egy kártyára kattintva megnyílik az a nap, a sarkában lévő × pedig törli.
Hozd létre az `src/components/Favorites.jsx` fájlt:

```jsx file=src/components/Favorites.jsx
import { formatDay } from '../dates.js'

// A kedvenc napok kis kártyákon. Egy kártyára kattintva megnyílik az a nap.
function Favorites({ favorites, onOpen, onRemove }) {
  return (
    <section className="favorites">
      <h2 className="section-title">Kedvencek ({favorites.length})</h2>
      {favorites.length === 0 && <p className="muted">Még nincs kedvenced. Jelölj meg egy képet a csillaggal!</p>}
      <ul className="favorites__list">
        {favorites.map((favorite) => (
          <li key={favorite.date} className="favorite">
            <button type="button" className="favorite__open" onClick={() => onOpen(favorite.date)}>
              {favorite.thumb ? (
                <img src={favorite.thumb} alt="" loading="lazy" />
              ) : (
                <span className="favorite__placeholder" aria-hidden="true">
                  ★
                </span>
              )}
              <span className="favorite__date">{formatDay(favorite.date, 'medium')}</span>
              <span className="favorite__title">{favorite.title}</span>
            </button>
            <button
              type="button"
              className="favorite__remove"
              aria-label={`${favorite.title}: törlés a kedvencek közül`}
              onClick={() => onRemove(favorite.date)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Favorites
```

A kis kép `alt=""`-t kap, mert a cím úgyis ott áll mellette; egy üres `alt`-ot a képernyőolvasó átugrik. A
`loading="lazy"` a 12. leckéből ismerős: a böngésző csak akkor tölti le a képet, amikor a képernyő közelébe ér. Ha egy
kedvencnek nincs kis képe, egy csillag áll a helyén. A × gomb `aria-label`-je megmondja a képernyőolvasónak, mit töröl.

Végül az `App`: itt él a lista, és itt dől el, mi történik egy kattintásra. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=2-3,7,14,16-17,24-36,48,50
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { thumbnailOf } from './api.js'
import { FIRST_DAY, apodToday } from './dates.js'
import DateNav from './components/DateNav.jsx'
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import Favorites from './components/Favorites.jsx'
import './App.css'

function App() {
  // A mai nap az API szerint. Egyszer számoljuk ki, amikor az oldal megnyílik.
  const [today] = useState(apodToday)
  const [date, setDate] = useState(today) // a megnyitott nap
  const [favorites, setFavorites] = useLocalStorage('space-explorer-favorites', [])

  // Származtatott érték: kedvenc-e a megnyitott nap?
  const isFavorite = favorites.some((favorite) => favorite.date === date)

  function changeDate(newDate) {
    // Üres vagy az archívumon kívül eső dátumot nem fogadunk el.
    if (newDate >= FIRST_DAY && newDate <= today) setDate(newDate)
  }

  function removeFavorite(day) {
    setFavorites(favorites.filter((favorite) => favorite.date !== day))
  }

  function toggleFavorite(apod) {
    if (isFavorite) {
      removeFavorite(apod.date)
      return
    }
    // Csak azt mentjük, ami a listához kell. Az új kedvenc kerül előre.
    const favorite = { date: apod.date, title: apod.title, thumb: thumbnailOf(apod) }
    setFavorites([favorite, ...favorites])
  }

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <DateNav date={date} today={today} onChange={changeDate} />

      {/* A key miatt minden új dátum egy vadonatúj PictureOfTheDay-t kap, tiszta állapottal. */}
      <PictureOfTheDay key={date} date={date} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />

      <Favorites favorites={favorites} onOpen={changeDate} onRemove={removeFavorite} />
    </main>
  )
}

export default App
```

- Az `isFavorite` [[származtatott érték]]: nem tároljuk, minden rajzoláskor kiszámoljuk a listából és a dátumból. A
  `some` igazat ad, ha a tömbnek legalább egy eleme megfelel a feltételnek.
- A lista frissítése most is másolattal történik, mint a 9. leckében: a `filter` új tömböt ad a törölt nap nélkül, a
  `[favorite, ...favorites]` pedig egy új tömböt, aminek az elején az új kedvenc áll.
- A `Favorites` kártyái ugyanazt a `changeDate`-et hívják, mint a lapozó: egy kedvenc megnyitása is csak egy
  dátumváltás.

:::check Ellenőrizd
A kártyán a cím alatt egy „☆ Kedvenc” gomb áll. Kattints rá: arany lesz, a csillag pedig teli (★). Lent eddig „KEDVENCEK (0)”
állt, most „KEDVENCEK (1)”, alatta egy kis kártya a képpel, a rövid dátummal és a címmel. Lapozz egy másik napra, és jelöld
meg azt is: két kártya, az új elöl. Kattints egy kis kártyára: megnyílik az a nap. Töltsd újra az oldalt: a kedvencek
megmaradtak. A × törli a kis kártyát; ha éppen az a nap van megnyitva, a nagy kártyán is kialszik a csillag.
:::

:::mistake Gyakori hiba
Az egész választ elmenteni: `setFavorites([apod, ...favorites])`. Működik, de minden kedvenc a teljes
magyarázattal együtt kerül a `localStorage`-be, aminek a mérete korlátozott (böngészőnként nagyjából 5 MB). Csak azt
tárold, amire tényleg szükséged van; a többi úgyis lekérhető a dátum alapján.
:::

:::try Feladat
Jelöld meg a kis kártyák közül azt, amelyik éppen meg van nyitva: adj a `Favorites`-nak egy `current` propot (a
`date`-et), és a `<li>`-n egy `aria-current={favorite.date === current}` attribútumot. A hozzá tartozó stílust írd az
`src/App.css` végére: `.favorite[aria-current='true'] .favorite__open { border-color: var(--gold); }`.
:::

### Gyorsítótár: kevesebb kérés

Lapozz ide-oda néhányszor a napok között, és figyeld a Network fület: ugyanazt a napot minden alkalommal újra
lekérjük. Fölöslegesen, hiszen egy nap képe a megjelenése után sosem változik. Ráadásul minden kérés fogyasztja a
kulcsod óránkénti keretét (a demókulcs 30 kérése pillanatok alatt elfogyna), főleg fejlesztés közben, ahol a
StrictMode miatt minden nap két kérés.

Erre való a [[gyorsítótár]] (cache), amellyel a 14. lecke végén, az utolsó ismert árfolyamnál már találkoztál: egy
hely, ahol a már megkapott válaszokat megőrizzük, hogy legközelebb ne kelljen újra kérni őket. A mienk a `localStorage`-ben lesz, így egy újratöltést is túlél. Két szabálya van:

- Csak olyat tárolunk, ami nem avul el. A nap képe ilyen; egy árfolyam vagy egy időjárás-jelentés nem lenne az.
- Nem nőhet a végtelenségig. A `localStorage` mérete korlátozott, ezért csak az utolsó 40 megnézett napot tartjuk
  meg, a legrégebben mentett megy ki először.

Hozd létre az `src/apodCache.js` fájlt:

```js file=src/apodCache.js
// A már letöltött napok a böngészőben. Egy nap képe a megjelenése után sosem változik,
// ezért amit egyszer megkaptunk, azt nem kell újra kérni.
const CACHE_KEY = 'space-explorer-cache'
const MAX_DAYS = 40 // ennyi napot tartunk meg; a legrégebben mentett megy ki először

// Az egész gyorsítótár egy objektumban: { '2026-11-15': { …a nap adatai… }, … }.
function readAll() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {}
  } catch {
    return {} // letiltott tároló vagy hibás mentés: üres gyorsítótárral indulunk
  }
}

// Egy nap a gyorsítótárból, vagy null, ha még nincs benne.
export function readCache(date) {
  return readAll()[date] ?? null
}

// Egy nap mentése. Ha túl sok nap gyűlt össze, a legrégebben mentettek kikerülnek.
export function saveToCache(date, apod) {
  const cache = readAll()
  delete cache[date] // ha már benne volt, a végére kerül, mint a legfrissebb
  cache[date] = apod
  const dates = Object.keys(cache) // a mentés sorrendjében
  for (const old of dates.slice(0, Math.max(0, dates.length - MAX_DAYS))) {
    delete cache[old]
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Megtelt vagy le van tiltva a tároló: nem baj, legközelebb újra megkérdezzük az API-t.
  }
}
```

- A gyorsítótár egyetlen objektum, amelynek a kulcsai a dátumok. A `localStorage.getItem` `null`-t ad, ha még nincs
  ilyen kulcs; a `JSON.parse(null)` is `null`, és a `?? {}` ilyenkor üres objektumot ad.
- A `delete cache[date]` kitöröl egy kulcsot az objektumból. Az `Object.keys` abban a sorrendben adja a kulcsokat,
  ahogy bekerültek, ezért ha egy napot előbb törlünk, aztán újra beírunk, a sor végére kerül.
- Ha 40-nél több nap van benne, a `slice` a lista elejéről, a legrégebben mentettekből adja azokat, amelyek
  kimennek. A `Math.max(0, …)` gondoskodik róla, hogy 40 alatt egy se menjen ki.
- A `setItem` hibát dob, ha a tároló megtelt. A `try/catch` miatt ilyenkor sincs baj: a gyorsítótár csak
  gyorsít, nélküle is működik minden.

A hook most előbb a gyorsítótárba néz. Ha ott van a nap, rögtön `'success'` állapotban indul, és az effekt nem is
kérdezi meg a szervert. Itt a teljes `src/useApod.js`:

```js file=src/useApod.js mark=3,8-10,15-16,24
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'
import { readCache, saveToCache } from './apodCache.js'

// Egy nap képe az API-ból: { status, apod, error, retry }.
// A status: 'loading' (úton van), 'success' (megjött) vagy 'error' (hiba történt).
function useApod(date) {
  // Ha ez a nap már a gyorsítótárban van, rögtön megvan: nem kell rá várni.
  const [apod, setApod] = useState(() => readCache(date))
  const [status, setStatus] = useState(apod ? 'success' : 'loading')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // az „Újra” gomb növeli, és ez újraindítja a lekérést

  useEffect(() => {
    // A gyorsítótárban lévő napért nem kérdezzük újra a szervert.
    if (readCache(date)) return

    let ignore = false

    async function load() {
      try {
        const data = await fetchApod({ date })
        if (ignore) return
        saveToCache(date, data)
        setApod(data)
        setStatus('success')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    // Takarítás: ha a komponens közben eltűnt (vagy új kérés indult), ennek a kérésnek a válaszát eldobjuk.
    return () => {
      ignore = true
    }
  }, [date, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { status, apod, error, retry }
}

export default useApod
```

Az `apod` állapot lett az első, és a lusta kezdőértéke a gyorsítótárból jön. A `status` kezdőértékét már ebből
számoljuk: ha megvan a nap, `'success'`, ha nincs, `'loading'`. Mivel minden új dátum új `PictureOfTheDay`-t kap (a
`key` miatt), a React minden napnál újra kiszámolja a kezdőértékeket.

:::check Ellenőrizd
Szűrj a Network fülön az `apod?` szövegre, és lapozz vissza két napot, aztán előre kettőt. Visszafelé minden új nap
egy kérés (fejlesztés közben kettő), előre egy sem: a képek „A kép úton van…” nélkül, azonnal megjelennek. Töltsd
újra az oldalt: a mai kép is azonnal ott van, kérés nélkül. A fejlesztői eszközök Application fülén (Local Storage, `http://localhost:5173`) ott a
`space-explorer-cache` kulcs a mentett napokkal. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
A hibát is a gyorsítótárba menteni, például ha a `saveToCache` a `catch` ágba is bekerül. Egy egyszeri hiba (elfogyott
a keret, vagy épp nem volt net) így örökre ott ragad: a nap akkor sem töltődik be, amikor az API már rég újra
válaszolna. Csak a sikeres válasz kerülhet a gyorsítótárba.
:::

:::concept Gyorsítótár mindenhol
A gyorsítótárazás a web egyik legfontosabb trükkje, és sok helyen történik. A szerver a válasz fejlécében
(`Cache-Control`) megírhatja, meddig használhatja a böngésző újra a választ kérdezés nélkül; a mi szerverünk a képeknél
egy órát enged. A nagy oldalak a világ sok pontján álló szervereken, egy [[CDN]]-en tartják a fájljaik másolatát. Az
appokban pedig olyan könyvtárak segítenek, mint a TanStack Query vagy az SWR: ezek a háttérben frissítik is a
tárolt adatot, ha az elavulhat. A legnehezebb kérdés mindig ugyanaz: mikor kell egy tárolt választ eldobni?
:::

## Haladó szint {level=3}

### Galéria: sok nap egyetlen kéréssel

Eddig egy kérés egy napot hozott. Egy galériához viszont sok kép kell, és ha mindegyikért külön kérést küldenénk, a
demókulcs kerete egy pillanat alatt elfogyna. Az API ezért egy egész [[időszak]]ot is visszaad egyetlen kérésre: a
`start_date` és az `end_date` közötti összes nap jön, egy tömbben. A paraméterek neve kisbetűs, aláhúzással
elválasztott szavakból áll (`start_date`, nem `startDate`): ezt az API határozta meg, és pontosan így kell írni.

A galéria először a mai napot és az előtte lévő 11 napot mutatja. Egy ilyen 12 napos csomag egy [[adag]] (angolul
page, vagyis oldal); a következő lépésben a régebbiek is adagonként jönnek majd. A betöltés saját hookba kerül. Hozd
létre az `src/useGallery.js` fájlt:

```js file=src/useGallery.js
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'
import { FIRST_DAY, shiftDay } from './dates.js'

const PAGE_SIZE = 12 // ennyi nap képe jön egy kéréssel

// A page sorszámú adag napjai a mai naptól visszafelé, az API paramétereiként.
// A 0. adag a mai nap és az előtte lévő 11, az 1. adag az azelőtti 12 nap, és így tovább.
function pageRange(today, page) {
  const end = shiftDay(today, -page * PAGE_SIZE)
  const start = shiftDay(end, -(PAGE_SIZE - 1))
  // Az archívum első napja előtt nincs kép, ott megállunk.
  return { start_date: start < FIRST_DAY ? FIRST_DAY : start, end_date: end }
}

// A galéria képei: { pictures, status, error, retry }.
function useGallery(today) {
  const [pictures, setPictures] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' vagy 'error'
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // az „Újra” gomb növeli, és ez újraindítja a lekérést

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchApod(pageRange(today, 0))
        if (ignore) return
        // Az API a régebbi naptól az újabb felé küldi a napokat; nekünk a legújabb kell elöl.
        setPictures([...data].reverse())
        setStatus('ready')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [today, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { pictures, status, error, retry }
}

export default useGallery
```

- A `pageRange` egy adag első és utolsó napját számolja ki. A 0. adag a mai napon végződik, és 11 nappal korábban
  kezdődik: ez 12 nap a két végével együtt. A `-page * PAGE_SIZE` a következő lépésben kap értelmet, amikor a `page`
  már nem mindig 0.
- Az API a napokat időrendben küldi, a legrégebbivel kezdve. A `reverse()` megfordítja a tömböt, de az eredetit
  módosítja, ezért előbb egy másolatot készítünk (`[...data]`), ahogy a 9. leckében is mindig másolatot módosítottunk.
- A szerkezet ugyanaz, mint a `useApod`-ban: `ignore`, `try/catch`, `attempt` és `retry`. Egy kérés mindig így néz ki.

Most a galéria maga: kis kártyák rácsban. Egy kártyára kattintva „A nap képe” nézetben megnyílik az a nap. Hozd létre
az `src/components/Gallery.jsx` fájlt:

```jsx file=src/components/Gallery.jsx
import useGallery from '../useGallery.js'
import { errorMessage, thumbnailOf } from '../api.js'
import { formatDay } from '../dates.js'

// Sok nap képe egy rácsban, a legújabbal kezdve.
function Gallery({ today, onOpenDay }) {
  const { pictures, status, error, retry } = useGallery(today)

  return (
    <section className="gallery">
      <ul className="gallery__grid">
        {pictures.map((picture) => (
          <li key={picture.date}>
            <button type="button" className="gallery__item" onClick={() => onOpenDay(picture.date)}>
              <img src={thumbnailOf(picture)} alt="" loading="lazy" />
              {picture.media_type === 'video' && <span className="badge gallery__badge">Videó</span>}
              <span className="gallery__date">{formatDay(picture.date, 'medium')}</span>
              <span className="gallery__title">{picture.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {status === 'loading' && <p className="gallery__more">Képek érkeznek…</p>}
      {status === 'error' && (
        <div className="status status--error" role="alert">
          <p>{errorMessage(error)}</p>
          <button type="button" className="button" onClick={retry}>
            Újra
          </button>
        </div>
      )}
    </section>
  )
}

export default Gallery
```

Az `App` két nézetet kap: a nap képét (a lapozóval és a kedvencekkel) és a galériát. Hogy melyik látszik, azt egy új
állapot, a `view` dönti el, két gomb pedig vált közöttük. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=8,14,40-45,54-66,68-75,77
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { thumbnailOf } from './api.js'
import { FIRST_DAY, apodToday } from './dates.js'
import DateNav from './components/DateNav.jsx'
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import Favorites from './components/Favorites.jsx'
import Gallery from './components/Gallery.jsx'
import './App.css'

function App() {
  // A mai nap az API szerint. Egyszer számoljuk ki, amikor az oldal megnyílik.
  const [today] = useState(apodToday)
  const [view, setView] = useState('day') // 'day' (a nap képe) vagy 'gallery' (galéria)
  const [date, setDate] = useState(today) // a megnyitott nap
  const [favorites, setFavorites] = useLocalStorage('space-explorer-favorites', [])

  // Származtatott érték: kedvenc-e a megnyitott nap?
  const isFavorite = favorites.some((favorite) => favorite.date === date)

  function changeDate(newDate) {
    // Üres vagy az archívumon kívül eső dátumot nem fogadunk el.
    if (newDate >= FIRST_DAY && newDate <= today) setDate(newDate)
  }

  function removeFavorite(day) {
    setFavorites(favorites.filter((favorite) => favorite.date !== day))
  }

  function toggleFavorite(apod) {
    if (isFavorite) {
      removeFavorite(apod.date)
      return
    }
    // Csak azt mentjük, ami a listához kell. Az új kedvenc kerül előre.
    const favorite = { date: apod.date, title: apod.title, thumb: thumbnailOf(apod) }
    setFavorites([favorite, ...favorites])
  }

  // Egy nap megnyitása a galériából: átállunk arra a napra, és visszaváltunk a nap képére.
  function openDay(day) {
    changeDate(day)
    setView('day')
    window.scrollTo(0, 0) // a galéria aljáról is az oldal tetejére
  }

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <div className="tabs" role="group" aria-label="Nézet">
        <button type="button" className="tab" aria-pressed={view === 'day'} onClick={() => setView('day')}>
          A nap képe
        </button>
        <button
          type="button"
          className="tab"
          aria-pressed={view === 'gallery'}
          onClick={() => setView('gallery')}
        >
          Galéria
        </button>
      </div>

      {view === 'day' && (
        <>
          <DateNav date={date} today={today} onChange={changeDate} />
          {/* A key miatt minden új dátum egy vadonatúj PictureOfTheDay-t kap, tiszta állapottal. */}
          <PictureOfTheDay key={date} date={date} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
          <Favorites favorites={favorites} onOpen={changeDate} onRemove={removeFavorite} />
        </>
      )}

      {view === 'gallery' && <Gallery today={today} onOpenDay={openDay} />}
    </main>
  )
}

export default App
```

A `<>` és a `</>` egy [[fragment]], a 12. leckéből ismerős: több elemet fog össze anélkül, hogy egy újabb HTML-elem
kerülne az oldalra. A `role="group"` és az `aria-label` a képernyőolvasónak mondja meg, hogy a két gomb együtt egy
nézetválasztó.

:::check Ellenőrizd
A fejléc alatt két gomb: „A nap képe” (arany, ez van kiválasztva) és „Galéria”. Kattints a „Galéria” gombra: rövid
„Képek érkeznek…” után 12 kis kártya jelenik meg, a mai nappal kezdve, visszafelé. A videós napok kártyáján egy
„VIDEÓ” címke áll. A Network fülön egyetlen új `apod?` kérés jött (fejlesztés közben kettő), a címében
`start_date=…&end_date=…`. Kattints egy kártyára: a nap képe nézet nyílik meg, azzal a nappal.
:::

:::mistake Gyakori hiba
`startDate` és `endDate` a `start_date` és az `end_date` helyett. A galéria azt írja: „Az űr-API most nem érhető el”,
pedig a Network fülön a válasz `200`-as. Az API nem ismeri ezeket a neveket, ezért nem veszi őket figyelembe, és a mai
nap képét küldi, egyetlen objektumként, nem tömbként. A `[...data]` egy objektummal nem tud mit kezdeni, hibát dob, a
`catch` pedig a saját hibánkat is elkapja, és az általános üzenetet mutatja. Ha nem érted, mi történt, írj a `catch`
elejére egy `console.error(problem)` sort: a konzolban megjelenik a valódi ok („data is not iterable”).
:::

:::try Próbáld ki
Írd át a `PAGE_SIZE`-t 30-ra: egyetlen kérés most 30 napot hoz. Az API egyszerre legfeljebb 100 napot ad. Mi történik
101-nél? (Egy `400`-as hiba és az „Erre a napra nincs kép” üzenet, mert a mi `errorMessage`-ünk minden `400`-as
hibára ezt mutatja. A valódi okot a Network fülön, a válaszban látod.) Utána írd vissza 12-re.
:::

### Végtelen görgetés

Az archívumban több mint tizenegyezer nap van, ezeket nem kérhetjük le egyszerre. Az API-k az ilyen hosszú listákat
adagonként adják, ez a [[lapozás]] (pagination): a kérdező program (a [[kliens]], nálunk az app) megmondja, hányadik
adagot kéri, a szerver pedig csak azt küldi. Nálunk az adag sorszámából (`page`) a `pageRange` kiszámolja az időszakot: a 0. adag a mai nappal végződik, az
1. adag 12 nappal korábban, és így tovább.

A 12. leckében már írtál [[végtelen görgetés]]t: a rács alá egy [[őrszem]] kerül, és egy [[IntersectionObserver]]
szól, amikor ez a képernyő közelébe ér. Ott minden kép megvolt már, és csak egyre többet mutattunk belőlük. Most
minden adagért a szerverhez fordulunk, és ez két új kérdést vet fel. Mi legyen a régi képekkel, amikor az új adag
megérkezik? A lista végére kerül az új adag. És mi van, ha az őrszem kétszer is szól, mielőtt az első adag megérkezne?
Amíg egy adag úton van, nem kérünk újat. Itt a teljes `src/useGallery.js`:

```js file=src/useGallery.js mark=16,18,29,32-34,47,49-50,52-55,62
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'
import { FIRST_DAY, shiftDay } from './dates.js'

const PAGE_SIZE = 12 // ennyi nap képe jön egy kéréssel

// A page sorszámú adag napjai a mai naptól visszafelé, az API paramétereiként.
// A 0. adag a mai nap és az előtte lévő 11, az 1. adag az azelőtti 12 nap, és így tovább.
function pageRange(today, page) {
  const end = shiftDay(today, -page * PAGE_SIZE)
  const start = shiftDay(end, -(PAGE_SIZE - 1))
  // Az archívum első napja előtt nincs kép, ott megállunk.
  return { start_date: start < FIRST_DAY ? FIRST_DAY : start, end_date: end }
}

// A galéria képei adagonként: { pictures, status, error, hasMore, loadMore, retry }.
function useGallery(today) {
  const [page, setPage] = useState(0) // hányadik adagnál tartunk
  const [pictures, setPictures] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' vagy 'error'
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // az „Újra” gomb növeli, és ez újraindítja a lekérést

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchApod(pageRange(today, page))
        if (ignore) return
        // Az API a régebbi naptól az újabb felé küldi a napokat; nekünk a legújabb kell elöl.
        const newestFirst = [...data].reverse()
        // Frissítő függvény: a legutóbbi lista végére fűzzük az új adagot.
        setPictures((old) => [...old, ...newestFirst])
        setStatus('ready')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [today, page, attempt])

  // Van még régebbi adag? Az archívum első napjánál vége.
  const hasMore = pageRange(today, page).start_date > FIRST_DAY

  function loadMore() {
    setStatus('loading')
    setPage((current) => current + 1)
  }

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { pictures, status, error, hasMore, loadMore, retry }
}

export default useGallery
```

- A `page` állapot a függőségi tömbben van: amikor a `loadMore` növeli, az effekt újra lefut, és a következő adagot
  kéri. Az `attempt` és a `retry` ugyanazt az adagot kéri újra, ha egy hiba után az „Újra” gombra kattintasz.
- A `setPictures((old) => [...old, ...newestFirst])` [[frissítő függvény]]t kap, mint a 6. és a 12. leckében. Így a
  React a legutóbbi listát adja oda (`old`), és nem kell a `pictures`-t a függőségi tömbbe tenni. Ha ott lenne, az
  effekt minden új adag után újra lefutna, és még egyszer lekérné ugyanazt.
- A `hasMore` származtatott érték: ha az aktuális adag már az archívum első napjánál kezdődik, nincs több.
- A `loadMore` is frissítő függvénnyel növeli a `page`-et: az őrszem figyelője egy korábbi rajzoláskor készült, és a
  `page` ott még régi értéket mutathat.

A `Gallery`-be az őrszem és a figyelő kerül. Itt a teljes `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx mark=1,6,8-10,12-24,49-54
import { useEffect, useRef } from 'react'
import useGallery from '../useGallery.js'
import { errorMessage, thumbnailOf } from '../api.js'
import { formatDay } from '../dates.js'

// Sok nap képe egy rácsban, a legújabbal kezdve. Lefelé görgetve jönnek a régebbiek.
function Gallery({ today, onOpenDay }) {
  const { pictures, status, error, hasMore, loadMore, retry } = useGallery(today)
  // Az őrszem: egy felirat a rács alatt. Ha a képernyő közelébe ér, jöhet a következő adag.
  const sentinelRef = useRef(null)

  useEffect(() => {
    // Amíg egy adag úton van, hiba történt, vagy nincs több adag, nem figyelünk.
    if (status !== 'ready' || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinelRef.current)
    // Takarítás: a régi figyelő leáll, mielőtt új indulna.
    return () => observer.disconnect()
  }, [status, hasMore, loadMore])

  return (
    <section className="gallery">
      <ul className="gallery__grid">
        {pictures.map((picture) => (
          <li key={picture.date}>
            <button type="button" className="gallery__item" onClick={() => onOpenDay(picture.date)}>
              <img src={thumbnailOf(picture)} alt="" loading="lazy" />
              {picture.media_type === 'video' && <span className="badge gallery__badge">Videó</span>}
              <span className="gallery__date">{formatDay(picture.date, 'medium')}</span>
              <span className="gallery__title">{picture.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {status === 'error' && (
        <div className="status status--error" role="alert">
          <p>{errorMessage(error)}</p>
          <button type="button" className="button" onClick={retry}>
            Újra
          </button>
        </div>
      )}
      {status !== 'error' && hasMore && (
        <p ref={sentinelRef} className="gallery__more">
          {status === 'loading' ? 'Képek érkeznek…' : 'Görgess lejjebb a további képekért!'}
        </p>
      )}
      {!hasMore && <p className="gallery__more">Ez volt az archívum első napja.</p>}
    </section>
  )
}

export default Gallery
```

- Az őrszem a rács alatti felirat lett: töltés közben „Képek érkeznek…”, egyébként „Görgess lejjebb a további
  képekért!”. Ott áll, amíg van még adag, és nincs hiba. A `rootMargin: '300px'` miatt a figyelő már akkor szól,
  amikor az őrszem még 300 pixellel a képernyő alja alatt van.
- Az effekt elején álló feltétel a legfontosabb sor. Amíg egy adag úton van (`'loading'`), nem figyelünk, így egy
  adagot csak egyszer kérünk. Ha az adag megérkezett, a `status` `'ready'` lesz, az effekt újra lefut, és egy friss
  figyelő indul. Az új figyelő már az induláskor jelzi, hol tart az őrszem: ha még mindig a képernyő közelében van
  (egy nagy képernyőn 12 kép kevés lehet), máris jön a következő adag.
- A `loadMore` minden rajzoláskor új függvény, ezért a figyelő is minden rajzolás után újraindul. Ez nem baj: egy
  figyelő létrehozása olcsó, és így biztosan a legfrissebb `loadMore`-t hívja.

:::check Ellenőrizd
Nyisd meg a galériát, és görgess lefelé: a rács alján a „Képek érkeznek…” felirat, aztán 12 régebbi nap. A
dátumokban nincs hézag: minden nap ott van, a maitól visszafelé. A Network fülön minden adag egy új kérés, egyre
korábbi `start_date`-tel. Ha nagy a képernyőd, a galéria rögtön két adaggal indul, mert az őrszem az első 12 kép után
még látszott.
:::

:::mistake Gyakori hiba
Kimarad a `status !== 'ready'` feltétel. A galéria üres marad, a „Képek érkeznek…” felirat ott ragad, a Network fülön
pedig másodpercenként tucatnyi kérés jelenik meg, egyre régebbi dátumokkal. A figyelő töltés közben is szól, a
`loadMore` növeli a `page`-et, az előző kérés válaszát pedig az `ignore` eldobja. Az új rajzolás után új figyelő
indul, az megint szól, és így tovább: egyetlen adag sem ér célba, a kulcsod kerete viszont fogy. Ha ezt látod, töltsd
újra az oldalt, és tedd vissza a feltételt.
:::

:::try Próbáld ki
Hogy működik-e az archívum vége? Ahhoz több mint 900 adagot kellene legörgetned. Írd át inkább ideiglenesen a
`FIRST_DAY`-t a `dates.js`-ben egy három héttel ezelőtti napra: két-három adag után megjelenik az „Ez volt az
archívum első napja.” felirat, és a figyelő leáll. Utána írd vissza `'1995-06-16'`-ra.
:::

### Szűrők és véletlen képek

Az API egy harmadik módon is tud képeket adni: a `count=12` paraméterre 12 véletlenszerűen választott napot küld a
teljes archívumból. Legyen a galériának két forrása: az „Archívum” (a mai naptól visszafelé) és a „Véletlen képek”.
Véletlen módban minden adag 12 új véletlen nap, és ezekből sosem fogyunk ki.

Van egy csapda: a véletlen napok ismétlődhetnek. Ha ugyanaz a nap kétszer kerül a listába, két `<li>` kapja ugyanazt
a `key`-t, és a React összekeveri őket. Ezért az új adagból csak azok a napok kerülnek a listába, amelyek még nincsenek
benne. Hogy egy dátum benne van-e már, azt a 3. leckéből ismert [[Set]] mondja meg a leggyorsabban. Itt a teljes
`src/useGallery.js`:

```js file=src/useGallery.js mark=16-27,29-30,32,44-46,50-51,64,66-67,74-81,88
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'
import { FIRST_DAY, shiftDay } from './dates.js'

const PAGE_SIZE = 12 // ennyi nap képe jön egy kéréssel

// A page sorszámú adag napjai a mai naptól visszafelé, az API paramétereiként.
// A 0. adag a mai nap és az előtte lévő 11, az 1. adag az azelőtti 12 nap, és így tovább.
function pageRange(today, page) {
  const end = shiftDay(today, -page * PAGE_SIZE)
  const start = shiftDay(end, -(PAGE_SIZE - 1))
  // Az archívum első napja előtt nincs kép, ott megállunk.
  return { start_date: start < FIRST_DAY ? FIRST_DAY : start, end_date: end }
}

// A régi lista, a végén az új képekkel. Ami már benne van, az nem kerül bele még egyszer.
function addNew(old, incoming) {
  const seen = new Set(old.map((picture) => picture.date))
  const result = [...old]
  for (const picture of incoming) {
    if (!seen.has(picture.date)) {
      seen.add(picture.date)
      result.push(picture)
    }
  }
  return result
}

// A galéria képei adagonként: { mode, changeMode, pictures, status, error, hasMore, loadMore, retry }.
// A mode: 'archive' (a mai naptól visszafelé) vagy 'random' (véletlen napok).
function useGallery(today) {
  const [mode, setMode] = useState('archive')
  const [page, setPage] = useState(0) // hányadik adagnál tartunk
  const [pictures, setPictures] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' vagy 'error'
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // az „Újra” gomb növeli, és ez újraindítja a lekérést

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        // Véletlen módban 12 véletlen nap jön; különben a page sorszámú adag napjai.
        const params = mode === 'random' ? { count: PAGE_SIZE } : pageRange(today, page)
        const data = await fetchApod(params)
        if (ignore) return
        // Az API a régebbi naptól az újabb felé küldi a napokat; nekünk a legújabb kell elöl.
        const newestFirst = [...data].reverse()
        // Frissítő függvény: a legutóbbi lista végére fűzzük az új adagot, ismétlődés nélkül.
        setPictures((old) => addNew(old, newestFirst))
        setStatus('ready')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [mode, today, page, attempt])

  // Van még adag? Véletlen képből sosem fogyunk ki; az archívumnak viszont van eleje.
  const hasMore = mode === 'random' || pageRange(today, page).start_date > FIRST_DAY

  function loadMore() {
    setStatus('loading')
    setPage((current) => current + 1)
  }

  function changeMode(newMode) {
    if (newMode === mode) return
    // Új forrás: elölről kezdjük, üres listával.
    setMode(newMode)
    setPage(0)
    setPictures([])
    setStatus('loading')
  }

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { mode, changeMode, pictures, status, error, hasMore, loadMore, retry }
}

export default useGallery
```

- Az `addNew` egy [[tiszta függvény]] (8. lecke): ugyanarra a bemenetre mindig ugyanazt adja, és semmit sem módosít
  maga körül, csak a saját `seen` halmazát és `result` tömbjét. Ez a frissítő függvényeknél fontos: fejlesztés
  közben a StrictMode azokat is kétszer hívja meg, hogy kiderüljön, ha valamelyik a saját magán kívül is megváltoztat
  valamit (mellékhatással jár).
- Véletlen módban a `page` csak számláló: minden növelése új kérést indít, de az értékét nem használjuk.
- A `changeMode` az eseménykezelőben állít vissza mindent, nem egy effektben, ahogy a 12. leckében az albumváltásnál.
  Az elején álló `if` fontos: ha már abban a módban vagyunk, és még az első adagjánál tartunk (a `page` 0), a
  `setMode` és a `setPage(0)` semmit sem változtatna, az effekt nem futna újra, a lista viszont kiürülne, és örökre
  üres maradna.

A szűrő egy egyszerűbb eset: nem kell hozzá új kérés, csak a már betöltött képek közül mutatunk kevesebbet. Ez megint
származtatott érték, nem új lista az állapotban. Itt a teljes `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx mark=1,6-15,17,19-20,24-25,43-70,73
import { useEffect, useRef, useState } from 'react'
import useGallery from '../useGallery.js'
import { errorMessage, thumbnailOf } from '../api.js'
import { formatDay } from '../dates.js'

const MODES = [
  { value: 'archive', label: 'Archívum' },
  { value: 'random', label: 'Véletlen képek' },
]

const FILTERS = [
  { value: 'all', label: 'Mind' },
  { value: 'image', label: 'Képek' },
  { value: 'video', label: 'Videók' },
]

// Sok nap képe egy rácsban. Lefelé görgetve jön a következő adag.
function Gallery({ today, onOpenDay }) {
  const { mode, changeMode, pictures, status, error, hasMore, loadMore, retry } = useGallery(today)
  const [filter, setFilter] = useState('all') // 'all', 'image' vagy 'video'
  // Az őrszem: egy felirat a rács alatt. Ha a képernyő közelébe ér, jöhet a következő adag.
  const sentinelRef = useRef(null)

  // Származtatott érték: a szűrőn átjutó képek. Nem tároljuk, minden rajzoláskor kiszámoljuk.
  const visible = filter === 'all' ? pictures : pictures.filter((picture) => picture.media_type === filter)

  useEffect(() => {
    // Amíg egy adag úton van, hiba történt, vagy nincs több adag, nem figyelünk.
    if (status !== 'ready' || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinelRef.current)
    // Takarítás: a régi figyelő leáll, mielőtt új indulna.
    return () => observer.disconnect()
  }, [status, hasMore, loadMore])

  return (
    <section className="gallery">
      <div className="gallery__toolbar">
        <div className="chips" role="group" aria-label="Honnan jöjjenek a képek?">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={mode === item.value}
              onClick={() => changeMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Szűrés">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="gallery__grid">
        {visible.map((picture) => (
          <li key={picture.date}>
            <button type="button" className="gallery__item" onClick={() => onOpenDay(picture.date)}>
              <img src={thumbnailOf(picture)} alt="" loading="lazy" />
              {picture.media_type === 'video' && <span className="badge gallery__badge">Videó</span>}
              <span className="gallery__date">{formatDay(picture.date, 'medium')}</span>
              <span className="gallery__title">{picture.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {status === 'error' && (
        <div className="status status--error" role="alert">
          <p>{errorMessage(error)}</p>
          <button type="button" className="button" onClick={retry}>
            Újra
          </button>
        </div>
      )}
      {status !== 'error' && hasMore && (
        <p ref={sentinelRef} className="gallery__more">
          {status === 'loading' ? 'Képek érkeznek…' : 'Görgess lejjebb a további képekért!'}
        </p>
      )}
      {!hasMore && <p className="gallery__more">Ez volt az archívum első napja.</p>}
    </section>
  )
}

export default Gallery
```

A szűrő és a végtelen görgetés szépen együttműködik. Ha a „Videók” szűrő csak két kártyát hagy a rácsban, az őrszem
a képernyőn marad, a figyelő szól, és jön a következő adag, egészen addig, amíg a rács meg nem telik annyira, hogy az
őrszem lecsússzon a képernyőről.

:::check Ellenőrizd
A galéria tetején két gombcsoport áll: balra „Archívum” és „Véletlen képek”, jobbra „Mind”, „Képek” és „Videók”
(keskeny képernyőn a második csoport az első alá kerül). Kattints a
„Véletlen képek” gombra: a rács kiürül, aztán 12 kép jön az archívum bármely évéből, összevissza dátumokkal. Görgess
le: újabb 12 véletlen kép. Kattints a „Videók” gombra: csak a „VIDEÓ” címkés kártyák maradnak, és ha kevés van, a
galéria magától tölt még, amíg meg nem telik a képernyő. A „Mind” mindent visszahoz, amit addig betöltöttél.
:::

:::mistake Gyakori hiba
A szűrt listát külön állapotban tárolni, és a szűrő gombjával frissíteni:
`setVisible(pictures.filter(…))`. Az első adagnál működik, de amikor görgetéskor megérkezik a következő, a `visible`
nem frissül: az új képek nem jelennek meg, amíg újra rá nem kattintasz a szűrőre. Ami kiszámolható, azt ne tárold.
:::

:::try Próbáld ki
Vedd ki ideiglenesen az ismétlődések kiszűrését: az `addNew` helyett írd azt, hogy
`setPictures((old) => [...old, ...newestFirst])`, és véletlen módban görgess sokat lefelé. Előbb-utóbb ugyanaz a nap
kétszer is bekerül, és a konzolban megjelenik a React figyelmeztetése: „Encountered two children with the same key”.
Utána tedd vissza az `addNew`-t.
:::

### Nagy nézet

Egy kis kártyán nem sokat látni egy képből, és a magyarázat sem fér el rajta. Kattintásra nyíljon meg nagyban, egy
[[modális ablak]]ban, a dátummal, a címmel és a magyarázattal, és innen lehessen megnyitni a nap képeként is.

A 12. leckében már írtál ilyet a böngésző `<dialog>` elemével. Emlékeztetőül: a `showModal()` a `<dialog>` saját
függvénye, ezért a DOM-elemét egy `useRef`-fel fogjuk meg, és egy effektből nyitjuk ki vagy zárjuk be, a rajzolás
után. A bezárást (++Esc++, a sötét háttér, a „Bezárás” gomb) a `close` esemény jelzi, és ilyenkor az állapotot is
visszaállítjuk. Hozd létre az `src/components/PictureDialog.jsx` fájlt:

```jsx file=src/components/PictureDialog.jsx
import { useEffect, useRef } from 'react'
import { formatDay } from '../dates.js'
import ApodMedia from './ApodMedia.jsx'

// Egy nap nagyban, modális ablakban. A picture null, ha nincs megnyitott kép.
function PictureDialog({ picture, onClose, onOpenDay }) {
  const dialogRef = useRef(null)
  const isOpen = picture !== null

  // A <dialog>-ot a böngésző nyitja és zárja: a rajzolás után szólunk neki.
  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleClick(event) {
    // Ha magát a <dialog>-ot érte a kattintás (nem a képet, nem egy gombot), az a sötét háttér volt.
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="picture-dialog"
      aria-label={isOpen ? picture.title : undefined}
      onClose={onClose}
      onClick={handleClick}
    >
      {isOpen && (
        <>
          <ApodMedia apod={picture} />
          <div className="picture-dialog__body">
            <p className="apod__date">{formatDay(picture.date)}</p>
            <h2 className="apod__title">{picture.title}</h2>
            <p className="apod__text">{picture.explanation}</p>
            <div className="picture-dialog__actions">
              <button type="button" className="button" onClick={() => onOpenDay(picture.date)}>
                Megnyitás a nap képeként
              </button>
              <button type="button" className="button button--ghost" onClick={onClose}>
                Bezárás
              </button>
            </div>
          </div>
        </>
      )}
    </dialog>
  )
}

export default PictureDialog
```

Az `aria-label` nevet ad az ablaknak: a képernyőolvasó megnyitáskor felolvassa a kép címét. Az `ApodMedia` itt is
működik: egy videós nap a nagy nézetben is lejátszódik, a „Szünet” gombbal együtt. Ezért
volt érdemes a médiatípus szerinti megjelenítést külön komponensbe tenni. A galéria válaszaiban ugyanazok a mezők
vannak, mint egy nap képénél, a magyarázattal együtt, így nem kell új kérés: a már betöltött adatot mutatjuk.

A `Gallery`-ben egy új állapot jegyzi meg, melyik kép van nagyban megnyitva, és a kártyák mostantól ezt állítják. Itt
a teljes `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx mark=5,18,22,77,102
import { useEffect, useRef, useState } from 'react'
import useGallery from '../useGallery.js'
import { errorMessage, thumbnailOf } from '../api.js'
import { formatDay } from '../dates.js'
import PictureDialog from './PictureDialog.jsx'

const MODES = [
  { value: 'archive', label: 'Archívum' },
  { value: 'random', label: 'Véletlen képek' },
]

const FILTERS = [
  { value: 'all', label: 'Mind' },
  { value: 'image', label: 'Képek' },
  { value: 'video', label: 'Videók' },
]

// Sok nap képe egy rácsban. Lefelé görgetve jön a következő adag, kattintásra nagyban nyílik meg egy kép.
function Gallery({ today, onOpenDay }) {
  const { mode, changeMode, pictures, status, error, hasMore, loadMore, retry } = useGallery(today)
  const [filter, setFilter] = useState('all') // 'all', 'image' vagy 'video'
  const [openPicture, setOpenPicture] = useState(null) // a nagyban megnyitott nap, vagy null
  // Az őrszem: egy felirat a rács alatt. Ha a képernyő közelébe ér, jöhet a következő adag.
  const sentinelRef = useRef(null)

  // Származtatott érték: a szűrőn átjutó képek. Nem tároljuk, minden rajzoláskor kiszámoljuk.
  const visible = filter === 'all' ? pictures : pictures.filter((picture) => picture.media_type === filter)

  useEffect(() => {
    // Amíg egy adag úton van, hiba történt, vagy nincs több adag, nem figyelünk.
    if (status !== 'ready' || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinelRef.current)
    // Takarítás: a régi figyelő leáll, mielőtt új indulna.
    return () => observer.disconnect()
  }, [status, hasMore, loadMore])

  return (
    <section className="gallery">
      <div className="gallery__toolbar">
        <div className="chips" role="group" aria-label="Honnan jöjjenek a képek?">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={mode === item.value}
              onClick={() => changeMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Szűrés">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="gallery__grid">
        {visible.map((picture) => (
          <li key={picture.date}>
            <button type="button" className="gallery__item" onClick={() => setOpenPicture(picture)}>
              <img src={thumbnailOf(picture)} alt="" loading="lazy" />
              {picture.media_type === 'video' && <span className="badge gallery__badge">Videó</span>}
              <span className="gallery__date">{formatDay(picture.date, 'medium')}</span>
              <span className="gallery__title">{picture.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {status === 'error' && (
        <div className="status status--error" role="alert">
          <p>{errorMessage(error)}</p>
          <button type="button" className="button" onClick={retry}>
            Újra
          </button>
        </div>
      )}
      {status !== 'error' && hasMore && (
        <p ref={sentinelRef} className="gallery__more">
          {status === 'loading' ? 'Képek érkeznek…' : 'Görgess lejjebb a további képekért!'}
        </p>
      )}
      {!hasMore && <p className="gallery__more">Ez volt az archívum első napja.</p>}

      <PictureDialog picture={openPicture} onClose={() => setOpenPicture(null)} onOpenDay={onOpenDay} />
    </section>
  )
}

export default Gallery
```

A „Megnyitás a nap képeként” ugyanazt az `onOpenDay`-t hívja, amit eddig a kártyák: az `App` átáll arra a napra, és
visszavált a nap képére. A galéria ilyenkor eltűnik az oldalról, és vele együtt a nyitott ablak is.

:::check Ellenőrizd
Kattints egy kártyára a galériában: sötét háttér előtt nagyban megnyílik a kép, alatta a teljes dátum a hét napjával,
a cím, a magyarázat és két gomb. Egy videós nap itt is mozog, és megállítható. Az ++Esc++, a „Bezárás” gomb és az
ablak körüli sötét háttér is bezárja az ablakot, a billentyűzet fókusza pedig visszaugrik arra a kártyára, amelyikről
jöttél.
Nyisd meg újra, és kattints a „Megnyitás a nap képeként” gombra: a nap képe nézet nyílik meg azzal a nappal, a
kedvenc gombbal együtt. Gratulálok, kész az űrfelfedeződ!
:::

:::mistake Gyakori hiba
Kimarad az `onClose={onClose}` a `<dialog>`-ról. Az ++Esc++ ilyenkor is bezárja az ablakot, de a `Gallery` erről nem
tud: az `openPicture`-ben ott marad a kép. Ha utána bármelyik kártyára kattintasz, semmi sem történik: az `isOpen`
végig igaz maradt, ezért az effekt nem fut le újra, és senki sem hívja meg a `showModal()`-t. A `close` eseményre
figyelve az állapot mindig azt mutatja, ami a képernyőn van.
:::

:::try Feladat
Lehessen lapozni a nagy nézetben, ahogy a 12. leckében: a ++←++ és a ++→++ nyíl vigyen az előző és a következő
látható képre. Tipp: a `Gallery` adja át a `visible` tömböt, és jegyezze meg a megnyitott kép sorszámát a kép helyett.
Hogy a videó állapota (megy vagy szünetel) ne öröklődjön át a következő képre, adj az `ApodMedia`-nak
`key={picture.date}`-et.
:::

:::concept Egy igazi API felé
A kódod semmit sem tud arról, hogy a szerver kitalált. Ha egyszer egy igazi szolgáltatást használsz, az `api.js`-ben
az `API_URL` lesz a szolgáltatás címe, a `.env.local`-ban a `VITE_APOD_KEY` a saját kulcsod, és minden más ugyanígy
működik: a kulcs a kérésben, a hibakódok, a fejlécek, az időszakok és a véletlen napok. A NASA igazi APOD API-ja
ugyanezeket a paramétereket és mezőket használja, csak magyarul nem beszél, és a videói többnyire egy videómegosztó
oldal lejátszói. Ezekre az `ApodMedia` „itt nem tudjuk lejátszani” ága már készen áll.
:::
