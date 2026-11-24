# Mit építünk?

Rajongói wikit egy rajzfilmhez: rácsba rendezett szereplőket képpel, minden szereplőnek saját adatlapot, keresőt,
szűrőket, lapozást, epizódlistát és olyan bejegyzéseket, amelyeket maguk a rajongók írnak. A rajzfilm a Színvirág-szigetek
(angolul The Huebloom Isles), amit ehhez a tanfolyamhoz találtunk ki: színekből élő, lebegő szigetekről szól, ahol a
Szürke Szitálás, egy vándorló köd, kifakít mindent, amihez hozzáér. A 40 szereplő, a 12 helyszín és a 20 epizód a lecke
saját REST API-jából érkezik, ami a böngésződben fut.

Közben megtanulod, hogyan épít egy React-app listát és adatlapot egy API adataiból, hogyan mutathat egyetlen
címminta (`#/character/:id`) bármelyik szereplőt, hogyan lesz a keresőből és a szűrőkből kérés, és hogyan működik a
lapozás.

:::levels
- Szereplők rácsa képpel és névvel az API-ból, betöltés- és hibaüzenettel. | kb. 2 óra
- Saját adatlap minden szereplőnek, kereső, ami megvárja, amíg abbahagyod a gépelést, szűrés állapotra és nemre. | kb. 3 óra
- Lapozás, epizódlista, az ugyanott élő szereplők és bejegyzések, amelyeket a rajongók írhatnak és szerkeszthetnek. | kb. 3 óra
:::

**Előismeret:** az eddigi leckék, legfőképp a 14., a „Currency Converter” (`fetch`, betöltés- és hibaállapot,
`useFetch`), a 20., a „Movie Search” (routing, `useDebounce`) és a 21., a „Book Library” (`useFetch` az állapotkóddal,
`useLocalStorage`). Az 1. lecke `useHashRoute` hookja is visszatér.
Amit újra felhasználunk, azt néhány mondatban felidézzük, minden újat pedig lépésről lépésre elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/23-fan-wiki/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Ugyanúgy indulsz, mint az 1. leckében, és annak a 0. lépése minden
parancsot részletesen elmagyaráz. Röviden: nyiss egy terminált a munkamappádban, ahol a `rika-mentoring` repó van, hozd
le az új leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját `huebloom-wiki` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/23-fan-wiki/exercise huebloom-wiki
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/23-fan-wiki/exercise` mappát a munkamappádba, `huebloom-wiki` néven. A másolatodban
dolgozol: a repó érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `huebloom-wiki` mappát a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a Reactot, a Vite-ot és az MSW-t
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„Fan Wiki” címmel, alatta egyetlen angol mondattal: „The Huebloom Isles: a cartoon about floating islands that run on
colour.” Más még nincs rajta: a szereplőket te teszed fel rá.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. Az első terminált az `npm run dev`
foglalja, ezért nyiss egy másodikat a szerkesztőben, a `huebloom-wiki` mappában:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni.

Mi van a kiinduló projektben?

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről és az API-król szól, nem a CSS-ről, ezért csak
  a lépésekben megadott osztályneveket használod (`grid`, `card`, `status`, `filters`, `detail`…). Azért nézz bele!
- `src/mocks/`: a wiki API-ja. Hogy mi ez, azt a lenti doboz mondja el.
- `src/main.jsx`: elindítja az API-t, aztán kirajzolja az oldalt.
- `public/mockServiceWorker.js`: egy segédszkript, ami az API-nak kell. Hagyd úgy, ahogy van.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és az alcím angolul vannak. A kódban,
amit te írsz, magyar feliratok és megjegyzések lesznek.

:::concept Álszerver a böngésződben
Egy igazi rajongói wiki az interneten lévő szerverről kapja az adatait, egy [[API]]-n keresztül: ez címek gyűjteménye,
ahonnan egy program adatot kérhet. Ez a tanfolyam nem használ külső szolgáltatásokat, ezért a kiinduló projekt a saját
szerverét is hozza: az `src/mocks` egy álszerver, amit a [[Mock Service Worker]] (MSW) segítségével építettünk. Az MSW
elindít egy [[service workert|service worker]]: ez egy kis szkript, amit a böngésző az oldalad mellett futtat, és ami el
tudja kapni az oldal kéréseit, és maga tud válaszolni rájuk.

A `main.jsx` még azelőtt elindítja, hogy a React bármit kirajzolna (`await startMockApi(handlers)`). Ettől kezdve az
oldalad minden `fetch('/api/…')` kérésére az `src/mocks/handlers.js` felel, egy kis várakozás után, állapotkóddal és
adatokkal, pont úgy, ahogy egy igazi szerver tenné. A kódod nem látja a különbséget: ha egyszer igazi API-ra váltasz,
csak a cím változik. A `handlers.js` elején lévő megjegyzés felsorolja az API összes címét; a `universe.js`-ben vannak a
szereplők, a helyszínek és az epizódok, az `avatars.js` pedig kóddal rajzolja meg a képeket.
:::

:::try Próbáld ki
Nyisd meg a böngésző konzolját (++F12++ → **Console**), írd be ezt a sort, és nyomj ++Enter++-t:

```js
await fetch('/api/character?lang=hu').then((response) => response.json())
```

Megjelenik egy objektum, benne `info` és `results`. Kattints a kis nyilakra, és nyisd ki őket: a `results` tömbben a
wiki első 12 szereplője van.
:::

### Az első kérés

Kérjük el az API-tól a szereplőket! A cím `/api/character?lang=hu`:

- az `/api` az a hely, ahol az API lakik, a `/character` pedig az az [[erőforrás]], amit kérünk: a szereplők. Egy
  [[REST API]]-ban minden adatfajtának saját címe van, ez a [[végpont]]: `/api/character`, `/api/location`,
  `/api/episode`;
- a `?` utáni rész egy [[lekérdezési paraméter]]: plusz információ a szervernek, `név=érték` párokban. A `lang=hu`
  magyar szövegeket kér: így a fajok, a helyszínek és az epizódcímek magyarul jönnek. A neveket nem fordítjuk, azok
  tulajdonnevek.

A kérést a [[fetch]] küldi el. A 14. leckében már találkoztál vele: a válaszra várni kell, ezért a `fetch` egy
[[Promise]]-t ad vissza, amit egy [[async függvényben|async függvény]] az `await` vár ki. A válasz két részletben
érkezik. Előbb az állapotkód és a fejlécek érkeznek, aztán a törzs, vagyis maga az adat: a `response.json()` beolvassa
a törzset, és a [[JSON]]-szöveget JavaScript-objektumokká és -tömbökké alakítja. Ez is időbe telik, ezért ez is
`await`-et kap. Az API
ilyen formában válaszol (rövidítve, a `…` jelzi, mi maradt ki):

```text
{
  "info": { "count": 40, "pages": 4, "next": "http://localhost:5173/api/character?lang=hu&page=2", "prev": null },
  "results": [
    { "id": 1, "name": "Juno Plumewick", "status": "Bright", "species": "Pávanép", "image": "http://…/1.svg", … },
    { "id": 2, "name": "Captain Nimbus", … },
    …
  ]
}
```

A `results`-ban vannak a szereplők, egyszerre 12; az `info` megmondja, összesen hányan vannak.

Hová kerüljön a kérés? Nem a rajzolás közepére: a rajzolás csak leírja, mi legyen a képernyőn, és minden újabb rajzolás
újabb kérést küldene. Ami a rajzoláson kívül történik, az a [[useEffect]]-be való; üres [[függőségi tömbbel|függőségi
tömb]] (`[]`) az effekt csak egyszer fut le, az első rajzolás után. Maga az effekt függvénye nem lehet `async`: a React
azt várja tőle, hogy semmit vagy egy takarító függvényt adjon vissza, egy async függvény viszont mindig Promise-t ad.
Ezért az effekten belül írunk egy async függvényt, és rögtön meg is hívjuk. Cseréld le az `src/App.jsx`
tartalmát erre:

```jsx file=src/App.jsx mark=1,5,7-14,20,23-27
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [characters, setCharacters] = useState([])

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/character?lang=hu')
      const data = await response.json()
      setCharacters(data.results)
    }
    load()
  }, [])

  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>Fan Wiki</h1>
        <p>A Színvirág-szigetek szereplői, a lecke saját API-jából.</p>
      </header>

      <ul>
        {characters.map((character) => (
          <li key={character.id}>{character.name}</li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

A `characters` üres tömbként indul, így az első rajzolás üres listát mutat. Amikor megjön a válasz, a `setCharacters`
eltárolja a 12 szereplőt, a React pedig újrarajzolja a listát. A `map` minden szereplőből egy `<li>`-t csinál, [[key]]
gyanánt az `id`-jával.

:::check Ellenőrizd
A fejléc alatt megjelenik 12 név: Juno Plumewick, Captain Nimbus, Steepwell… Nyisd meg a fejlesztői eszközök **Network**
fülét (++F12++ → **Network**), válaszd a **Fetch/XHR** szűrőt, és töltsd újra az oldalt: a listában ott a
`character?lang=hu` kérés. Kattints rá, aztán a **Response** fülre: ez az a JSON, amit az API küldött.
:::

:::concept Miért két kérés?
A Network fülön a kérést kétszer is láthatod. Fejlesztés közben a React [[StrictMode]]-ja (a `main.jsx`-ben) minden
komponenst feltesz az oldalra, leveszi, majd újra felteszi, így minden effekt kétszer fut le. Ez segít elkapni azokat az
effekteket, amelyek nem takarítanak maguk után. A kész oldalon (`npm run build`) ez csak egyszer történik meg, a 3.
lépéstől pedig a takarítás meg is szakítja a fölösleges kérést.
:::

:::mistake Gyakori hiba
`const data = response.json()`, `await` nélkül. Ekkor a `data` egy Promise, nem a válasz: a `data.results` értéke
`undefined`, az oldal elfehéredik, a konzol pedig azt írja: „Cannot read properties of undefined (reading 'map')”.
:::

### Kártyák képpel

Egy wikiben nem elég a név: minden szereplő kap egy kártyát képpel, névvel, állapottal és fajjal. A kártya saját
komponens lesz, és a lista is, hogy az `App` rövid maradjon.

Előbb egy kis szótár. Az állapotot az API a `lang=hu` mellett is angolul küldi, mert ez nem szöveg, hanem rögzített
érték, amire szűrni is lehet: `'Bright'` (ragyogó, tele színnel), `'Faded'` (kifakult, a Szürke Szitálás érintette)
vagy `'unknown'` (ismeretlen). Mi a saját szavainkkal mutatjuk, és ezekre a szavakra több komponensnek is szüksége
lesz, ezért külön fájlba kerülnek. Hozd létre az `src/labels.js` fájlt:

```js file=src/labels.js
// Az API ezeket az értékeket angolul küldi. Mi a saját szavainkkal mutatjuk őket.
export const STATUS_LABELS = {
  bright: 'Ragyogó',
  faded: 'Kifakult',
  unknown: 'Ismeretlen',
}
```

Aztán jöhet a kártya. Hozz létre az `src` mappában egy `components` mappát, benne egy `CharacterCard.jsx` fájlt:

```jsx file=src/components/CharacterCard.jsx mark=5,9,11-13
import { STATUS_LABELS } from '../labels.js'

function CharacterCard({ character }) {
  // 'Bright' → 'bright': ez a kulcs a feliratokhoz és a CSS-osztályhoz is.
  const status = character.status.toLowerCase()

  return (
    <li className="card">
      <img className="card__image" src={character.image} alt="" width="300" height="300" loading="lazy" />
      <div className="card__body">
        <p className="card__name">{character.name}</p>
        <p className="card__meta">
          <span className={`status status--${status}`}>{STATUS_LABELS[status]}</span> · {character.species}
        </p>
      </div>
    </li>
  )
}

export default CharacterCard
```

- A `toLowerCase()` a `'Bright'`-ból `'bright'`-ot csinál. Ezzel keressük ki a feliratot: a `STATUS_LABELS[status]`
  annak a kulcsnak az értékét olvassa ki, amelyiknek a neve a `status`-ban van. Az osztálynévbe is bekerül: a `status status--bright`
  zöld pöttyöt kap az `App.css`-ből, a `status--faded` szürkét.
- A kép címét az API adja (`character.image`). A képet az álszerver rajzolja meg kóddal, és az `<img>` kérésére is ő
  válaszol.
- Az `alt=""` szándékos: a név ott van a kép alatt, a képernyőolvasó csak kétszer olvasná fel. A `width` és a `height`
  már a kép megérkezése előtt megmondja a böngészőnek a méretét, így nem ugrál az oldal, a `loading="lazy"` pedig az
  oldal alján lévő képeket csak akkor tölti be, amikor a közelükbe görgetsz.

A lista az `src/components/CharacterList.jsx`-be költözik. Az effekt változatlanul jön vele; a lista minden
szereplőhöz egy kártyát rajzol:

```jsx file=src/components/CharacterList.jsx mark=2,4,17-21
import { useEffect, useState } from 'react'
import CharacterCard from './CharacterCard.jsx'

function CharacterList() {
  const [characters, setCharacters] = useState([])

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/character?lang=hu')
      const data = await response.json()
      setCharacters(data.results)
    }
    load()
  }, [])

  return (
    <ul className="grid">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </ul>
  )
}

export default CharacterList
```

A `key` most a `CharacterCard`-ra kerül, mert a `map` ezt adja vissza. Az `App`-ban csak a fejléc és a lista marad:

```jsx file=src/App.jsx mark=1,12
import CharacterList from './components/CharacterList.jsx'
import './App.css'

function App() {
  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>Fan Wiki</h1>
        <p>A Színvirág-szigetek szereplői, a lecke saját API-jából.</p>
      </header>

      <CharacterList />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
12 kártya rácsban: kép, név, zöld pötty „Ragyogó” felirattal és a faj („Pávanép”, „Felhőbálna”…). Duke Drabwell
állapota „Ismeretlen”, a pötty helyén üres karikával. Húzd keskenyre az ablakot: egyre kevesebb oszlop lesz,
telefonszélességen már csak kettő.
:::

:::mistake Gyakori hiba
`const status = character.status`, `toLowerCase()` nélkül. A szótárban nincs `'Bright'` kulcs, ezért az állapot szava
eltűnik (az `undefined` semmit sem rajzol), az osztály pedig `status--Bright` lesz, amit a CSS nem ismer: a pötty
szürke marad.
:::

:::try Próbáld ki
A `CharacterList.jsx`-ben írd át a `lang=hu`-t `lang=en`-re: a fajok angolul jelennek meg (Peafolk, Cloudwhale…), a
nevek ugyanazok maradnak. Aztán állítsd vissza.
:::

### Betöltés és hibák: a useFetch hook

Két dolog hiányzik még. Amíg a válasz úton van, az oldal semmit sem mutat; ha pedig a kérés nem sikerül, örökre üres
marad, egy szó nélkül. A lecke minden kérésének (a listának, egy szereplőnek, az epizódoknak…) ugyanaz a három
állapota van: töltés, siker, hiba. A 14. leckében ezt egy [[saját hookba|saját hook]] tetted, a `useFetch`-be. Itt a
lecke saját változata; lent soronként elmagyarázzuk. Hozd létre az `src/useFetch.js` fájlt:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// JSON-t tölt le egy címről, és elmondja, hol tart:
// { status: 'idle' | 'loading' | 'success' | 'error', data, error, retry }
function useFetch(url) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!url) return // még nincs cím: nincs mit letölteni
    const controller = new AbortController()

    async function load() {
      setState({ status: 'loading', data: null, error: null })
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          // Hibás válasz (404, 500…): a kódját eltesszük, az oldal dönti el, mit mond.
          const error = new Error(`HTTP ${response.status}`)
          error.status = response.status
          throw error
        }
        const data = await response.json()
        setState({ status: 'success', data, error: null })
      } catch (error) {
        // A takarítás szakította meg: egy újabb kérés vette át a helyét, ezért csendben maradunk.
        if (controller.signal.aborted) return
        setState({ status: 'error', data: null, error })
      }
    }

    load()
    // Takarítás: ha a cím megváltozik, vagy a komponens eltűnik, a kérést megszakítjuk.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt(attempt + 1)
  }

  return { ...state, retry }
}

export default useFetch
```

- Az állapot egyetlen objektum: `status` (`'idle'`, `'loading'`, `'success'` vagy `'error'`), `data` (a válasz) és
  `error`. Az `'idle'` (tétlen) azt jelenti, hogy „még nincs cím”: ilyenkor az `if (!url) return` miatt az effekt nem
  csinál semmit. A haladó szinten egy olyan kéréshez kell majd, aminek meg kell várnia egy másikat.
- A `response.ok` akkor igaz, ha a válasz [[HTTP-állapotkódja|HTTP-állapotkód]] 200 és 299 közé esik. Maga a `fetch`
  csak akkor hibázik, ha egyáltalán nem jön válasz (például nincs hálózat); egy 404 (nem található) vagy egy 400 (hibás
  kérés) is válasz. Ezért magunk nézzük meg, és ha baj van, `throw`-val dobunk egy hibát, ami az `error.status`-ban
  magával viszi a kódot: hogy egy 404 mit jelent, azt majd az oldal dönti el. A `throw` egyenesen a `catch`-be ugrik,
  ahogy a 3. lecke [[try/catch]]-ében.
- Az [[AbortController]] meg tud szakítani egy kérést: `controller.abort()`. Az effekt [[takarító függvénye|takarító
  függvény]] hívja meg, amikor a cím megváltozik, vagy a komponens eltűnik. Így egy régi, lassú válasz soha nem írhatja
  felül egy újabbét, a StrictMode fölösleges kérése pedig rögtön elhal. A megszakított `fetch` is hibát dob, ezért a
  `catch` megnézi a `controller.signal.aborted`-et, és ilyenkor csendben marad.
- A `retry` eggyel megnöveli az `attempt`-et. Az `attempt` benne van a függőségi tömbben, így az effekt ugyanazzal a
  címmel újra lefut: ez az újrapróbálás.
- A `return { ...state, retry }` mindent egyetlen objektumban ad vissza, az 1. leckéből ismert [[spread]]-del.

A címek külön fájlba kerülnek, hogy a komponenseknek ne kelljen tudniuk, hogyan épülnek fel. Hozd létre az `src/api.js`
fájlt:

```js file=src/api.js
// A wiki API-jának címe. Ebben a projektben az src/mocks álszervere válaszol rá.
const API = '/api'
// Az API két nyelven beszél: a lang=hu magyar, a lang=en angol szövegeket ad.
const LANG = 'hu'

// A szereplők listája (egyelőre csak az első oldal): /api/character?lang=hu
export function charactersUrl() {
  return `${API}/character?lang=${LANG}`
}
```

Az `API` és a `LANG` előtt nincs `export`: csak ez a fájl használja őket. Ha egyszer angolul szeretnéd a szövegeket,
egyetlen sort kell átírnod.

A piros hibadoboz több helyen is felbukkan majd (a listában, egy szereplő oldalán, az epizódoknál…), ezért saját
komponenst kap: `src/components/ErrorMessage.jsx`.

```jsx file=src/components/ErrorMessage.jsx
// Piros doboz egy üzenettel és egy „Újrapróbálás” gombbal.
function ErrorMessage({ text, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <p>{text}</p>
      <button type="button" onClick={onRetry}>
        Újrapróbálás
      </button>
    </div>
  )
}

export default ErrorMessage
```

A `role="alert"` miatt a képernyőolvasók azonnal felolvassák az üzenetet, amint megjelenik. Az `onRetry` a szülőtől
kapott függvény, itt a hook `retry`-a. Most a lista mindhárom újdonságot használja: a hookot, a címet építő függvényt
és a hibadobozt. Cseréld le az
`src/components/CharacterList.jsx` tartalmát:

```jsx file=src/components/CharacterList.jsx mark=1-2,4,7,10-23
import useFetch from '../useFetch.js'
import { charactersUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'

function CharacterList() {
  const { status, data, retry } = useFetch(charactersUrl())

  return (
    <section className="list">
      {status === 'loading' && <p className="state">Szereplők betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a szereplőket." onRetry={retry} />}
      {status === 'success' && (
        <>
          <p className="list__count">Szereplők: {data.info.count}</p>
          <ul className="grid">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default CharacterList
```

A `useState` és az effekt a hookba költözött, így a komponens már csak azt kérdezi: mi az állapot? Ez [[feltételes
megjelenítés]]: a három `&&`-es sor közül csak az rajzol valamit, amelyiknek igaz a feltétele. A `<>…</>` egy
[[Fragment]]: összefogja a darabszámot és a rácsot, de nem tesz új elemet az oldalra. A `data.info.count` az összes
szereplő száma (40), nem csak az ezen az oldalon lévő 12-é: a többi a lapozással jön, a haladó szinten.

:::check Ellenőrizd
Egy pillanatra megjelenik a „Szereplők betöltése…”, aztán a „Szereplők: 40” és a kártyák. Most rontsd el szándékosan a
címet: az `src/api.js`-ben írd a cím végére, közvetlenül a `${LANG}` után, hogy `&status=happy`. Ilyen állapotot az API
nem ismer, ezért 400-zal (Bad Request, hibás kérés) válaszol: egy piros doboz jelzi, hogy „Nem sikerült betölteni a
szereplőket”, alatta az „Újrapróbálás” gomb. Kattints rá: felvillan a „Szereplők betöltése…”, aztán visszajön a hiba,
hiszen a cím még mindig rossz. A konzol is pirossal mutatja a 400-at: ez a böngésző feljegyzése a sikertelen kérésről. Állítsd
vissza a címet. A kezdő szint kész: commitold!
:::

:::mistake Gyakori hiba
Kimarad a `response.ok` vizsgálata. Ekkor egy 404 vagy 400 is sikernek számít: a `response.json()` az API hibaüzenetét
olvassa be (`{ error, message }`), az oldal pedig a `data.info.count`-nál elhasal, mert egy hibaüzenetben nincs `info`.
:::

## Középszint {level=2}

### Saját kis router

Minden szereplő saját oldalt kap, saját címmel: Juno a `#/character/1`-en lakik, Captain Nimbus a `#/character/2`-n. A
cím mondja meg az appnak, mit mutasson: ez a [[routing]]. A 20. leckében, a „Movie Search”-ben már építettél ilyet: a
`useHashRoute` hook és egy útvonal-paraméter (`#/show/42`) döntötte el, melyik sorozat oldala jelenjen meg. Most
ugyanezt építjük meg a szereplőknek, az 1. lecke egyszerű `useHashRoute` hookjából kiindulva. Kicsi, nem kell hozzá
könyvtár, és a GitHub Pagesen is működik (hogy miért, azt az ellenőrzés utáni doboz mondja el).

A `useHashRoute` a cím `#` utáni részét, a [[hash|URL-hash]]-t figyeli, és útvonalként adja vissza: `'/character/3'`,
vagy a listánál `'/'`. Ha megvan az 1. leckés projekted, másold át onnan a fájlt (a 20. leckéből ne: ott a haladó
szinten a hook már `{ path, params }`-t ad vissza); ha nincs, hozd létre az `src/useHashRoute.js`-t:

```js file=src/useHashRoute.js
import { useEffect, useState } from 'react'

const currentPath = () => window.location.hash.slice(1) || '/'

// A cím # utáni részét adja vissza, és frissül, amikor az megváltozik.
function useHashRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    // Takarítás: ha a komponens eltűnik, már nem figyelünk.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export default useHashRoute
```

Gyors ismétlés: a `slice(1)` levágja a `#`-et, a `|| '/'` pedig azt jelenti: „vagy `/`, ha semmi sem maradt”. A
`useState(currentPath)` egyszer, az elején olvassa ki a címet ([[lusta kezdőérték]]). Az effekt a böngésző `hashchange`
eseményére figyel, ami mindig bekövetkezik, amikor a `#` utáni rész megváltozik, a takarítása pedig leiratkozik róla.

Előbb a szereplő oldala, egyelőre csak a számmal. Hozd létre az `src/components/CharacterDetail.jsx` fájlt:

```jsx file=src/components/CharacterDetail.jsx mark=4-7
import { useEffect } from 'react'

function CharacterDetail({ id }) {
  // Egy új szereplő oldala felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="detail">
      <a className="back" href="#/">
        ← Vissza a listához
      </a>
      <p className="detail__number">#{id}</p>
      <h2 className="detail__name">Itt lesz a szereplő adatlapja.</h2>
    </article>
  )
}

export default CharacterDetail
```

Ha a lista aljáról kattintasz egy kártyára, a `scrollTo` nélkül az új oldal teteje a képernyőn kívül maradna, mert a
böngésző megtartja a görgetési helyzetet. A `window.scrollTo(0, 0)` a lap tetejére görget. Az üres `[]` itt azt
jelenti: „minden szereplőnél egyszer”, mert az `App` minden szereplőnek új `key`-t ad (ezt mindjárt látod).

Egyetlen címminta, a `/character/:id`, áll az összes szereplő helyett: ez a [[dinamikus útvonal]]. A változó része, az
`id`, a 20. leckéből ismert [[útvonal-paraméter]], mint ott a `#/show/42`-ben a `42`. (React Routerben így írnád le:
`path="/character/:id"`, ahogy a 20. lecke dobozában a `path="/show/:id"`-t.) Az `App` kiolvassa az útvonalból az
azonosítót, és vagy a listát, vagy a szereplő oldalát rajzolja ki. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=1,3,6-11,14-15,20-22,26
import useHashRoute from './useHashRoute.js'
import CharacterList from './components/CharacterList.jsx'
import CharacterDetail from './components/CharacterDetail.jsx'
import './App.css'

// '/character/3' → 3. Minden más útvonal (a lista: '/') → null.
function characterIdFrom(path) {
  if (!path.startsWith('/character/')) return null
  const id = Number(path.slice('/character/'.length))
  return Number.isInteger(id) && id > 0 ? id : null
}

function App() {
  const path = useHashRoute()
  const id = characterIdFrom(path)

  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>
          <a href="#/">Fan Wiki</a>
        </h1>
        <p>A Színvirág-szigetek szereplői, a lecke saját API-jából.</p>
      </header>

      {id ? <CharacterDetail key={id} id={id} /> : <CharacterList />}
    </main>
  )
}

export default App
```

- A `characterIdFrom` megnézi, hogy az útvonal `/character/`-rel kezdődik-e, és a maradékot számmá alakítja. A
  `Number('abc')` eredménye `NaN` („nem szám”), a `Number.isInteger` pedig csak egész számokra igaz, így egy hibás
  címből `null` lesz, és a lista jelenik meg.
- Az `id ? … : …` a [[ternáris operátor]]: ha van azonosító, a szereplő oldala, ha nincs, a lista. A „Fan Wiki”
  főcím is link lett: a `#/`-re, vagyis a listára mutat.
- `key={id}`: a [[key]]-t a listáknál ismerted meg, a 3. leckében pedig a `CopyButton`-on már láttad, hogy bármelyik
  komponensen működik. Ha a key megváltozik, a React eldobja a régi komponenst, és egy vadonatújat készít, friss
  állapottal és friss effektekkel. Amikor egy szereplő oldaláról egyenesen egy másikéra lépsz (a haladó szinten ehhez
  egy kattintás is elég), semmi sem marad itt az előző szereplőből.

Végül a kártyák linkek lesznek. Cseréld le az `src/components/CharacterCard.jsx` tartalmát; az `<a>` új, és a kártya
minden más része a belsejébe kerül:

```jsx file=src/components/CharacterCard.jsx mark=9,17
import { STATUS_LABELS } from '../labels.js'

function CharacterCard({ character }) {
  // 'Bright' → 'bright': ez a kulcs a feliratokhoz és a CSS-osztályhoz is.
  const status = character.status.toLowerCase()

  return (
    <li className="card">
      <a className="card__link" href={`#/character/${character.id}`}>
        <img className="card__image" src={character.image} alt="" width="300" height="300" loading="lazy" />
        <div className="card__body">
          <p className="card__name">{character.name}</p>
          <p className="card__meta">
            <span className={`status status--${status}`}>{STATUS_LABELS[status]}</span> · {character.species}
          </p>
        </div>
      </a>
    </li>
  )
}

export default CharacterCard
```

Ez egy közönséges link. Ha rákattintasz, csak a hash változik meg: a böngésző nem tölt be új oldalt, hanem kiváltja a
`hashchange` eseményt, a hookunk pedig átadja az új útvonalat az `App`-nak. A böngésző Vissza gombja magától működik,
mert minden új hash új bejegyzés a böngésző előzményeiben.

:::check Ellenőrizd
Kattints Juno kártyájára: a cím `#/character/1`-re végződik, az oldalon pedig ott a „← Vissza a listához”, a „#1” és az
„Itt lesz a szereplő adatlapja.” A visszalink, a böngésző Vissza gombja és a „Fan Wiki” cím is visszavisz a listához.
Most írd át kézzel a címsorban a cím végét `#/character/abc`-re (a `#`-től kezdve mindent cserélj le), és nyomj
++Enter++-t: a lista jelenik meg, mert az `abc` nem érvényes azonosító.
:::

:::concept Miért van # a címben?
Egy olyan szerver, mint a GitHub Pages, fájlokat szolgál ki. A `/character/3` címre ilyen nevű fájlt keres, nem talál,
és 404-gyel válaszol, például ha valaki újratölti az oldalt, vagy megnyit egy elküldött linket. A `#` utáni rész viszont
el sem jut a szerverhez: a szerver így mindig az `index.html`-t adja vissza, a `#` utáni részt pedig a mi kódunk
olvassa ki. Ezért működik a
hash-alapú router bárhol, a szerver beállítása nélkül. A React Router `BrowserRouter`-e szebb, `#` nélküli címeket ad,
de akkor a szervernek minden útvonalra az `index.html`-lel kell válaszolnia; a React Routernek egyébként van
`HashRouter`-e is, ami ugyanarra az ötletre épül, mint a miénk.
:::

:::mistake Gyakori hiba
`href="/character/1"`, `#` nélkül. Ekkor a böngésző elhagyja az oldalt, és a szervertől kéri a `/character/1`-et: az
egész app elölről indul, a routerünk pedig, ami csak a `#` utáni részt olvassa, nem is látja az azonosítót.
:::

### A szereplő adatlapja

Most jöjjön maga a szereplő. A címe `/api/character/1`: az azonosító ezúttal az útvonal része, nem lekérdezési
paraméter, mert egy konkrét dolgot nevez meg. Írd ezt a függvényt az `src/api.js` végére:

```js file=src/api.js
// Egy szereplő: /api/character/3?lang=hu
export function characterUrl(id) {
  return `${API}/character/${id}?lang=${LANG}`
}
```

Az adatlap a szereplő nemét is mutatja, ezért az `src/labels.js` kap egy második szótárt. Itt az egész fájl:

```js file=src/labels.js mark=8-13
// Az API ezeket az értékeket angolul küldi. Mi a saját szavainkkal mutatjuk őket.
export const STATUS_LABELS = {
  bright: 'Ragyogó',
  faded: 'Kifakult',
  unknown: 'Ismeretlen',
}

export const GENDER_LABELS = {
  female: 'Nő',
  male: 'Férfi',
  genderless: 'Nincs neme',
  unknown: 'Ismeretlen',
}
```

Cseréld le az `src/components/CharacterDetail.jsx` tartalmát:

```jsx file=src/components/CharacterDetail.jsx mark=2-5,7-18,21,34-38,40-56
import { useEffect } from 'react'
import useFetch from '../useFetch.js'
import { characterUrl } from '../api.js'
import { GENDER_LABELS, STATUS_LABELS } from '../labels.js'
import ErrorMessage from './ErrorMessage.jsx'

// A megmutatandó adatok címke–érték párokban, az üres adatok és az ismeretlen helyek nélkül.
function factsOf(character) {
  const facts = [
    { label: 'Állapot', value: STATUS_LABELS[character.status.toLowerCase()] },
    { label: 'Faj', value: character.species },
    { label: 'Típus', value: character.type },
    { label: 'Nem', value: GENDER_LABELS[character.gender.toLowerCase()] },
    { label: 'Származás', value: character.origin.name },
    { label: 'Utolsó ismert helyszín', value: character.location.name },
  ]
  return facts.filter((fact) => fact.value && fact.value !== 'unknown')
}

function CharacterDetail({ id }) {
  const { status, data, error, retry } = useFetch(characterUrl(id))

  // Egy új szereplő oldala felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="detail">
      <a className="back" href="#/">
        ← Vissza a listához
      </a>

      {status === 'loading' && <p className="state">A szereplő betöltése…</p>}
      {status === 'error' && error.status === 404 && <p className="state">Nincs ilyen számú szereplő.</p>}
      {status === 'error' && error.status !== 404 && (
        <ErrorMessage text="Nem sikerült betölteni a szereplőt." onRetry={retry} />
      )}

      {status === 'success' && (
        <div className="detail__main">
          <img className="detail__image" src={data.image} alt={data.name} width="300" height="300" />
          <div className="detail__info">
            <p className="detail__number">#{data.id}</p>
            <h2 className="detail__name">{data.name}</h2>
            <dl className="facts">
              {factsOf(data).map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </article>
  )
}

export default CharacterDetail
```

- `useFetch(characterUrl(id))`: ugyanaz a hook, csak más címmel.
- A hiba itt kétfélét jelenthet. A 404 azt mondja, hogy „nincs ilyen szereplő”: ez nem üzemzavar, ezért egyszerű
  üzenetet kap, újrapróbálás nélkül. Minden más kód igazi hiba, újrapróbálással. Az `error.status` az a kód, amit a
  `useFetch` eltett.
- A `factsOf` címke–érték párokká alakítja a szereplőt, és kihagyja az üreseket: Dot Blotsworthnek nincs típusa (az API
  `''`-t küld), és azt sem tudja senki, honnan jött Mister Gloam (az API szerint `'unknown'`). A [[filter]] azokat az
  elemeket tartja meg, amelyekre a függvény igazat ad; a `fact.value && …` üres szövegre hamis. Az ilyen átalakítás
  mindennapos munka: egy API adatai ritkán érkeznek pont olyan formában, amilyenre az oldalnak szüksége van. (Az
  ismeretlen állapot vagy nem ettől még megjelenik, „Ismeretlen” szóval: addigra a szótár már szóvá alakította.)
- A `<dl>` egy [[leíró lista]]: a `<dt>` a fogalom, a `<dd>` a leírása. Minden pár egy `<div>`-ben van (ez a `<dl>`-en
  belül megengedett), így a CSS rácsba tudja rendezni őket.
- `alt={data.name}`: itt a kép az oldal fő tartalma, ezért a név lesz az alternatív szövege.

:::check Ellenőrizd
Kattints Junóra: nagy kép, „#1”, „Juno Plumewick” és hat adat: Állapot Ragyogó, Faj Pávanép, Típus
Világítótorony-inas, Nem Nő, és Származásnál meg Utolsó ismert helyszínnél is Tollazat-fok. Dot Blotsworthnél (#4)
nincs Típus sor. Írd át a címsorban a cím végét `#/character/99`-re: „Nincs ilyen számú szereplő.”
:::

:::mistake Gyakori hiba
A `data` használata a `status === 'success'` blokkon kívül, például egy `<h2>{data.name}</h2>` közvetlenül a visszalink
alatt. Amíg a válasz úton van, a `data` értéke `null`: az oldal elfehéredik, a konzol pedig azt írja: „Cannot read
properties of null (reading 'name')”. Minden, ami a `data`-t olvassa, a sikerblokkba kerül.
:::

:::try Próbáld ki
Tegyél a visszalink mellé egy „Következő ›” linket `href={'#/character/' + (id + 1)}` címmel, meg egy „‹ Előző”-t
`id - 1`-gyel. Az Előzőt csak akkor mutasd, ha `id > 1`, `&&`-vel. Mit látsz a #40 után?
:::

### Keresés név szerint

Egy 40 szereplős wikibe kereső kell. Az API tud keresni: az `/api/character?name=ju` azokat a szereplőket adja, akiknek
a nevében benne van a „ju”. A többi szűrő is így működik (`status=faded`, `gender=female`), és kombinálni is lehet
őket.

Kézzel összerakni egy ilyen címet macerás: a párok közé `&` kell, és néhány karaktert (a szóközt vagy magát az `&`-et)
különleges, kódolt formában kell leírni. Az [[URLSearchParams]] megcsinálja helyettünk: a `set(név, érték)` hozzáad egy
párt, egy template literalban pedig az objektum magától a `?` utáni szöveggé alakul.

Ennek a lépésnek a fájljai egymásra épülnek: amíg az utolsót el nem mented, az oldal üres lehet, vagy hibát mutat. Ez
így rendben van. Cseréld le az `src/api.js`-ben a `charactersUrl` függvényt erre:

```js file=src/api.js
// A lista, csak a beállított szűrőkkel: /api/character?lang=hu&name=ju&status=faded
export function charactersUrl({ name, status, gender }) {
  const params = new URLSearchParams({ lang: LANG })
  if (name) params.set('name', name)
  if (status) params.set('status', status)
  if (gender) params.set('gender', gender)
  return `${API}/character?${params}`
}
```

A függvény egy objektumot kap, és a paraméterlistájában szedi szét, ahogy egy komponens a propjait
([[destrukturálás]]). Ami nincs beállítva, az kimarad: az `if (name)` üres szövegre hamis. Az állapotszűrő és a
nemszűrő egyelőre üres marad; a 8. lépésben saját vezérlőt kapnak.

A keresőmező egy új komponensbe kerül: `src/components/Filters.jsx`. A benne lévő `<input>` [[vezérelt mező]], mint
a 3. lecke csúszkája: az értékét a propokból kapja, és minden leütésnél felfelé jelzi az új szöveget.

```jsx file=src/components/Filters.jsx
// A szűrők, amikor egyik sincs beállítva.
export const NO_FILTERS = { name: '', status: '', gender: '' }

function Filters({ filters, onChange }) {
  // A szűrők másolata, egyetlen kulcs átírva: ezt kapja meg az App.
  function change(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="filters">
      <label className="field filters__search">
        <span>Keresés név szerint</span>
        <input
          type="search"
          value={filters.name}
          placeholder="pl. Juno, Nimbus, Steepwell…"
          onChange={(event) => change('name', event.target.value)}
        />
      </label>
    </div>
  )
}

export default Filters
```

A `change` a [[spread]]-del lemásolja a szűrőket, a szögletes zárójeles `[key]` pedig azt a kulcsot írja felül,
amelyiknek a neve a `key`-ben van, akárcsak a 3. lecke `toggleOption`-jében. A `type="search"` olyan szövegmező,
amelynél a telefon billentyűzetén keresőgomb jelenik meg, és amelyet az ++Esc++ kiürít. A `NO_FILTERS` külön
`export`-ot kapott, mert az `App`-nak is kell.

Hol éljenek a szűrők? Nem a `CharacterList`-ben. Amikor megnyitsz egy szereplőt, az `App` a lista helyett a szereplő
oldalát rajzolja ki: a lista eltűnik, és vele az állapota is. Amikor visszatérsz, a keresőmező megint üres lenne. Ezért a
szűrők eggyel feljebb, az `App`-ban élnek, ami végig az oldalon marad. Ez az [[állapot felemelése]] a 3. leckéből: az
`App` tárolja a szűrőket, a `CharacterList` propként kapja, és minden változást felfelé ad. Cseréld le az
`src/components/CharacterList.jsx` tartalmát:

```jsx file=src/components/CharacterList.jsx mark=5,7-8,12
import useFetch from '../useFetch.js'
import { charactersUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import Filters from './Filters.jsx'

function CharacterList({ filters, onFiltersChange }) {
  const { status, data, retry } = useFetch(charactersUrl(filters))

  return (
    <section className="list">
      <Filters filters={filters} onChange={onFiltersChange} />

      {status === 'loading' && <p className="state">Szereplők betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a szereplőket." onRetry={retry} />}
      {status === 'success' && (
        <>
          <p className="list__count">Szereplők: {data.info.count}</p>
          <ul className="grid">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default CharacterList
```

És az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,5,18-19,30-34
import { useState } from 'react'
import useHashRoute from './useHashRoute.js'
import CharacterList from './components/CharacterList.jsx'
import CharacterDetail from './components/CharacterDetail.jsx'
import { NO_FILTERS } from './components/Filters.jsx'
import './App.css'

// '/character/3' → 3. Minden más útvonal (a lista: '/') → null.
function characterIdFrom(path) {
  if (!path.startsWith('/character/')) return null
  const id = Number(path.slice('/character/'.length))
  return Number.isInteger(id) && id > 0 ? id : null
}

function App() {
  const path = useHashRoute()
  const id = characterIdFrom(path)
  // A lista szűrői itt, az App-ban élnek, így túlélik egy szereplő oldalának meglátogatását.
  const [filters, setFilters] = useState(NO_FILTERS)

  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>
          <a href="#/">Fan Wiki</a>
        </h1>
        <p>A Színvirág-szigetek szereplői, a lecke saját API-jából.</p>
      </header>

      {id ? (
        <CharacterDetail key={id} id={id} />
      ) : (
        <CharacterList filters={filters} onFiltersChange={setFilters} />
      )}
    </main>
  )
}

export default App
```

Az `onFiltersChange={setFilters}` magát az állapotbeállító függvényt adja tovább: a `CharacterList` átadja a
`Filters`-nek, az pedig ezt hívja meg az új szűrőobjektummal.

:::check Ellenőrizd
Írd be, hogy „nim”: egy pillanat múlva csak Captain Nimbus marad, a darabszám pedig „Szereplők: 1”. Töröld ki a
mezőt, aztán lassan gépeld be, hogy „steep”, és közben figyeld a Network fület: minden betűre új kérés indul, a kártyák pedig minden töltésnél
eltűnnek egy pillanatra. Nyisd meg Steepwellt, és gyere vissza: a keresőben még mindig ott a „steep”. Végül írd be, hogy
„xyz”: piros hibadoboz. Itt valami nincs rendben: a következő lépés mindkét gondot megoldja.
:::

:::mistake Gyakori hiba
A szűrők a `CharacterList` saját `useState`-jében. A keresés működik, de minden szereplőlátogatás kiüríti, mert a lista
komponense közben eltűnik.
:::

### Várd ki a szünetet: debounce és „nincs találat”

Két gond maradt az előző lépésből:

1. Minden leütés kérést küld. A „steepwell” kilenc kérés, pedig csak az utolsó számít. Egy igazi API számolja a
   kéréseket: a lecke API-ja tíz másodpercen belül 60 kérés után 429-cel válaszol (Too Many Requests, túl sok kérés).
2. Ha semmi sem illik a keresésre, az API 404-gyel válaszol, az oldal pedig hibaként mutatja. Pedig az, hogy „senkit
   sem hívnak xyz-nek”, nem üzemzavar, hanem üres eredmény. Sok nyilvános API válaszol így, ezért érdemes tudni róla.

Az elsőre a [[debounce]] a megoldás: megvárjuk, amíg egy érték egy ideig nem változik, és csak akkor használjuk. A 20.
leckében írtál egy `useDebounce` hookot; hozd létre az `src/useDebounce.js` fájlt:

```js file=src/useDebounce.js
import { useEffect, useState } from 'react'

// A value-t csak akkor adja tovább, ha delay ezredmásodpercig nem változott.
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Minden új leütés törli az előző időzítőt, és újat indít.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce
```

A `value` minden változása újra lefuttatja az effektet, előtte viszont a takarítása törli az előző időzítőt. Egy
időzítő csak akkor jár le, ha `delay` ezredmásodpercig nem jön új változás: ekkor a `debounced` felveszi az új értéket.
Amíg gépelsz, a régit tartja.

A `CharacterList` most késlelteti a nevet, és a 404-et üres listaként kezeli. Cseréld le az
`src/components/CharacterList.jsx` tartalmát:

```jsx file=src/components/CharacterList.jsx mark=2,9-11,13-14,21-22
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import { charactersUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import Filters from './Filters.jsx'

function CharacterList({ filters, onFiltersChange }) {
  // A név megvárja, amíg abbahagyod a gépelést; a többi szűrő azonnal hat.
  const name = useDebounce(filters.name.trim(), 400)
  const { status, data, error, retry } = useFetch(charactersUrl({ ...filters, name }))

  // Ha semmi sem felel meg a szűrőknek, az API 404-et küld. Nekünk ez csak egy üres lista.
  const noMatch = status === 'error' && error.status === 404

  return (
    <section className="list">
      <Filters filters={filters} onChange={onFiltersChange} />

      {status === 'loading' && <p className="state">Szereplők betöltése…</p>}
      {noMatch && <p className="state">Egy szereplő sem felel meg a szűrőknek. Próbálj rövidebb nevet, vagy töröld a szűrőket!</p>}
      {status === 'error' && !noMatch && <ErrorMessage text="Nem sikerült betölteni a szereplőket." onRetry={retry} />}
      {status === 'success' && (
        <>
          <p className="list__count">Szereplők: {data.info.count}</p>
          <ul className="grid">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default CharacterList
```

- A keresőmező továbbra is azonnal a `filters.name`-et mutatja: csak a kérés vár. A `{ ...filters, name }` a szűrők
  másolata, de már a késleltetett névvel.
- A `trim()` levágja a szóközöket a két végéről, így egy magányos szóköz nem számít keresésnek.
- A `noMatch` akkor igaz, ha 404-es kódú hiba jött. A `!noMatch` miatt a piros doboz csak az igazi hibáknak marad.

:::check Ellenőrizd
Gépeld be a szokásos tempódban, hogy „steepwell”, és figyeld a Network fület: csak egy-két kérés indul, akkor is csak
azután, hogy abbahagytad. Írd be, hogy „xyz”: a piros doboz helyett egy nyugodt, szürke üzenet jelenik meg: „Egy
szereplő sem felel meg a szűrőknek. Próbálj rövidebb nevet, vagy töröld a szűrőket!” A konzol továbbra is pirossal mutatja a 404-et: ez csak a
böngésző feljegyzése a válaszról, nem hiba a kódodban.
:::

:::mistake Gyakori hiba
Elkészül a késleltetett `name`, de a hívás marad `useFetch(charactersUrl(filters))`. Ekkor semmi sem változik: a cím a
friss névből épül, és minden leütésre elmegy. A késleltetett értéknek a címbe kell kerülnie.
:::

:::try Próbáld ki
Állítsd a késleltetést 1500 ezredmásodpercre, és gépelj: a várakozás hamar idegesítő lesz. 300 és 500 között érződik
természetesnek.
:::

### Szűrők: állapot és nem

Még két szűrő jön: az állapot és a nem. Az állapot kapcsológombokat („chipeket”) kap, a nem egy
[[legördülő listát|legördülő lista]] (`<select>`), és ha bármelyik szűrő be van állítva, megjelenik egy „Szűrők
törlése” gomb. Cseréld le az `src/components/Filters.jsx` tartalmát:

```jsx file=src/components/Filters.jsx mark=1,12,26-56,58-62
import { GENDER_LABELS, STATUS_LABELS } from '../labels.js'

// A szűrők, amikor egyik sincs beállítva.
export const NO_FILTERS = { name: '', status: '', gender: '' }

function Filters({ filters, onChange }) {
  // A szűrők másolata, egyetlen kulcs átírva: ezt kapja meg az App.
  function change(key, value) {
    onChange({ ...filters, [key]: value })
  }

  const hasFilters = filters.name !== '' || filters.status !== '' || filters.gender !== ''

  return (
    <div className="filters">
      <label className="field filters__search">
        <span>Keresés név szerint</span>
        <input
          type="search"
          value={filters.name}
          placeholder="pl. Juno, Nimbus, Steepwell…"
          onChange={(event) => change('name', event.target.value)}
        />
      </label>

      <fieldset>
        <legend>Állapot</legend>
        <div className="chips">
          <button type="button" className="chip" aria-pressed={filters.status === ''} onClick={() => change('status', '')}>
            Bármelyik
          </button>
          {Object.keys(STATUS_LABELS).map((key) => (
            <button
              key={key}
              type="button"
              className="chip"
              aria-pressed={filters.status === key}
              onClick={() => change('status', key)}
            >
              {STATUS_LABELS[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Nem</span>
        <select value={filters.gender} onChange={(event) => change('gender', event.target.value)}>
          <option value="">Bármelyik</option>
          {Object.keys(GENDER_LABELS).map((key) => (
            <option key={key} value={key}>
              {GENDER_LABELS[key]}
            </option>
          ))}
        </select>
      </label>

      {hasFilters && (
        <button type="button" className="link-button" onClick={() => onChange(NO_FILTERS)}>
          Szűrők törlése
        </button>
      )}
    </div>
  )
}

export default Filters
```

- Az `Object.keys(STATUS_LABELS)` eredménye `['bright', 'faded', 'unknown']`. A chipek a szótárból készülnek, így a
  kulcsaik egyenesen a kérésbe mennek (`status=faded`); az API kisbetűvel is elfogadja őket. A „Bármelyik” az üres
  szöveg, vagyis nincs szűrés.
- Az [[aria-pressed]] elárulja a képernyőolvasóknak, hogy egy kapcsológomb be van-e nyomva, a CSS pedig ugyanezzel az
  attribútummal színezi a lenyomott chipet (`.chip[aria-pressed='true']`). A `<fieldset>` és a `<legend>` egy cím alá
  fogja a chipeket, és a képernyőolvasó minden gombnál felolvassa ezt a címet.
- A `<select>` is vezérelt mező: a `value` a szűrőkből jön, az `onChange` állítja őket. Az `<option>`-ök a
  választási lehetőségek; a kiválasztott opció értéke az `event.target.value`-ban érkezik.
- A `hasFilters` [[származtatott érték]]: minden rajzoláskor kiszámoljuk a szűrőkből, ezért nem kell neki saját
  állapot. Az `onChange(NO_FILTERS)` az üres szűrőket adja át az `App`-nak.

A `CharacterList`-en és az `App`-on nem kell változtatni: az új szűrők ugyanabban az objektumban utaznak, a
`charactersUrl` pedig már most beleteszi őket a címbe.

:::check Ellenőrizd
Kattints a „Kifakult” chipre: öt szereplő marad, mind kifakult színekkel, a Szürke Szitálás nyomán, a chip pedig zöld
lesz. A „Nem” listában válaszd ki a „Férfi” lehetőséget: hárman maradnak. Ha a „Nő”-t választod: „Egy szereplő sem
felel meg a szűrőknek.” Kattints a „Szűrők törlése” gombra: visszajön mind a 40, a kereső üres, és újra a „Bármelyik”
van lenyomva. A középszint kész: commitold!
:::

:::mistake Gyakori hiba
`onClick={change('status', key)}`, nyílfüggvény nélkül. Ez rögtön, rajzolás közben meghívja a `change`-et, minden
chipre, nem pedig kattintáskor. Minden hívás rajzolás közben állítja az `App` állapotát, az `App` újrarajzol, ami megint
meghívja őket… Az „Ismeretlen” chip magától lenyomódik, a lista sosem nyugszik meg, a konzol pedig megtelik pirossal:
„Cannot update a component while rendering a different component”. Néhány másodperc múlva az API is megelégeli:
429-cel (túl sok kérés) válaszol, és megjelenik a piros hibadoboz. Függvényt adj át:
`onClick={() => change('status', key)}`.
:::

:::try Próbáld ki
Ismeretlen állapot és nő egyszerre: ki az a két rejtélyes hölgy? Nézd meg az adatlapjukat!
:::

## Haladó szint {level=3}

### Lapozás

Negyven szereplő, oldalanként tizenkettő: ez négy oldal, és eddig csak az elsőt látod. Az API azt az oldalt küldi,
amelyiket kéred (`page=2`), az `info.pages` pedig megmondja, hány oldal van. Ez a 20. lecke katalógusából már ismert
[[lapozás]]: a szerver nem küld el mindent egyszerre, csak egy oldalnyit, így az első válasz akkor is gyors, ha ezernyi
bejegyzés van.

Ennek a lépésnek a fájljai is egymásra épülnek: amíg az utolsót el nem mented, az oldal hibát mutathat. Ez így
rendben van. Cseréld le még egyszer a `charactersUrl`-t az `src/api.js`-ben; a `page` is a cím része lesz:

```js file=src/api.js mark=1-3
// A lista, csak a beállított szűrőkkel: /api/character?lang=hu&page=2&name=ju&status=faded
export function charactersUrl({ name, status, gender, page }) {
  const params = new URLSearchParams({ lang: LANG, page: String(page) })
  if (name) params.set('name', name)
  if (status) params.set('status', status)
  if (gender) params.set('gender', gender)
  return `${API}/character?${params}`
}
```

Az `URLSearchParams` szöveget vár, ezért a `String(page)` a 2-es számból `'2'`-t csinál.

A lapozógombok saját komponenst kapnak: `src/components/Pagination.jsx`.

```jsx file=src/components/Pagination.jsx
function Pagination({ page, pages, onPageChange }) {
  // Egyetlen oldalhoz nem kell lapozó.
  if (pages <= 1) return null

  return (
    <nav className="pages" aria-label="Lapozás">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Előző
      </button>
      <span className="pages__info">
        Oldal: {page} / {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Következő →
      </button>
    </nav>
  )
}

export default Pagination
```

Ha egy komponens `null`-t ad vissza, a React semmit sem rajzol a helyére. A `disabled` gombra nem lehet kattintani: az
első oldalon ilyen az „Előző”, az utolsón a „Következő”. Az [[aria-label]]-lel ellátott `<nav>` elárulja a
képernyőolvasóknak, hogy ez navigáció.

Az oldalszám az `App`-ban él, a szűrők mellett, így ez is túléli egy szereplő meglátogatását. Új szűrő esetén a lista
újra az 1. oldalról indul, hiszen a „Kifakult” listának lehet, hogy nincs is 3. oldala. Cseréld le az `src/App.jsx`
tartalmát:

```jsx file=src/App.jsx mark=18,20,22-31,45
import { useState } from 'react'
import useHashRoute from './useHashRoute.js'
import CharacterList from './components/CharacterList.jsx'
import CharacterDetail from './components/CharacterDetail.jsx'
import { NO_FILTERS } from './components/Filters.jsx'
import './App.css'

// '/character/3' → 3. Minden más útvonal (a lista: '/') → null.
function characterIdFrom(path) {
  if (!path.startsWith('/character/')) return null
  const id = Number(path.slice('/character/'.length))
  return Number.isInteger(id) && id > 0 ? id : null
}

function App() {
  const path = useHashRoute()
  const id = characterIdFrom(path)
  // A lista beállításai itt, az App-ban élnek, így túlélik egy szereplő oldalának meglátogatását.
  const [filters, setFilters] = useState(NO_FILTERS)
  const [page, setPage] = useState(1)

  // Új szűrő: a lista újra az első oldalról indul.
  function changeFilters(newFilters) {
    setFilters(newFilters)
    setPage(1)
  }

  function changePage(newPage) {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>
          <a href="#/">Fan Wiki</a>
        </h1>
        <p>A Színvirág-szigetek szereplői, a lecke saját API-jából.</p>
      </header>

      {id ? (
        <CharacterDetail key={id} id={id} />
      ) : (
        <CharacterList filters={filters} onFiltersChange={changeFilters} page={page} onPageChange={changePage} />
      )}
    </main>
  )
}

export default App
```

A `changePage` a lap tetejére is görget: a gombok a rács alatt vannak, egy új oldalt viszont az elejétől olvasunk.
Végül a `CharacterList` továbbadja az oldalszámot a címnek és a gomboknak. Cseréld le az
`src/components/CharacterList.jsx` tartalmát:

```jsx file=src/components/CharacterList.jsx mark=7,9-10,12,32
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import { charactersUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import Filters from './Filters.jsx'
import Pagination from './Pagination.jsx'

function CharacterList({ filters, onFiltersChange, page, onPageChange }) {
  // A név megvárja, amíg abbahagyod a gépelést; a többi szűrő és az oldal azonnal hat.
  const name = useDebounce(filters.name.trim(), 400)
  const { status, data, error, retry } = useFetch(charactersUrl({ ...filters, name, page }))

  // Ha semmi sem felel meg a szűrőknek, az API 404-et küld. Nekünk ez csak egy üres lista.
  const noMatch = status === 'error' && error.status === 404

  return (
    <section className="list">
      <Filters filters={filters} onChange={onFiltersChange} />

      {status === 'loading' && <p className="state">Szereplők betöltése…</p>}
      {noMatch && <p className="state">Egy szereplő sem felel meg a szűrőknek. Próbálj rövidebb nevet, vagy töröld a szűrőket!</p>}
      {status === 'error' && !noMatch && <ErrorMessage text="Nem sikerült betölteni a szereplőket." onRetry={retry} />}
      {status === 'success' && (
        <>
          <p className="list__count">Szereplők: {data.info.count}</p>
          <ul className="grid">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
          <Pagination page={page} pages={data.info.pages} onPageChange={onPageChange} />
        </>
      )}
    </section>
  )
}

export default CharacterList
```

:::check Ellenőrizd
A rács alatt: „Oldal: 1 / 4”, az „← Előző” szürke. A „Következő →” a 2. oldalt hozza, Azurával az élén; a 4. oldalon
csak négy szereplő van, és ott a „Következő →” a szürke. Menj a 3. oldalra, nyiss meg egy szereplőt, és gyere vissza:
még mindig a 3. oldalon vagy. Kattints a „Kifakult” chipre: öt szereplő elfér egy oldalon, ezért a gombok eltűnnek.
:::

:::mistake Gyakori hiba
Kimarad a `setPage(1)` a `changeFilters`-ből. Menj a 4. oldalra, és kattints a „Kifakult” chipre: az app öt találat 4.
oldalát kéri, pedig azok egy oldalt sem töltenek meg. Az API 404-gyel válaszol, az oldal pedig azt írja, hogy egy
szereplő sem felel meg a szűrőknek, holott öten is megfelelnek.
:::

:::try Feladat
Írd ki, a lista melyik része látszik, például a 2. oldalon: „13–24 / 40”. Add át a `Pagination`-nek a
`count={data.info.count}`-ot is. Az első szám `(page - 1) * 12 + 1`, az utolsó `Math.min(page * 12, count)`.
:::

### Epizódlista: egy második kérés

Egy szereplő oldalán ott a helye azoknak az epizódoknak, amelyekben szerepel. A szereplő adataiban már benne vannak, de
csak címként: `episode: ['http://localhost:5173/api/episode/1', 'http://localhost:5173/api/episode/2', …]`. Így köti
össze egy REST API az erőforrásait: ahelyett, hogy minden epizódot bemásolna minden szereplőbe, rájuk mutat.

Lekérhetnénk a címeket egyenként is, de ez Junónál 20 kérést jelentene. Ez az API viszont (sok másikhoz hasonlóan) egyszerre
több azonosítót is elfogad: az `/api/episode/1,2,3` három epizód tömbjét adja. Ezért minden címből kivesszük az
azonosítót, vesszővel összefűzzük őket, és egyetlen kérést küldünk. Írd ezt a három függvényt az `src/api.js` végére:

```js file=src/api.js
// Az API címekkel hivatkozik a dolgokra; az azonosító az utolsó perjel utáni rész.
// 'http://localhost:5173/api/episode/7' → 7
export function idFromUrl(url) {
  return Number(url.split('/').pop())
}

// Több epizód egyetlen kérésben: /api/episode/1,2,3
export function episodesUrl(episodeUrls) {
  const ids = episodeUrls.map(idFromUrl)
  return `${API}/episode/${ids.join(',')}?lang=${LANG}`
}

// Egy azonosítóra az API egyetlen objektummal felel, többre tömbbel. Ez mindig tömböt ad.
export function asList(data) {
  return Array.isArray(data) ? data : [data]
}
```

- A `split('/')` minden `/`-nél feldarabolja a szöveget egy tömbbe, a `pop()` kiveszi az utolsó elemét (`'7'`), a
  `Number` pedig számot csinál belőle.
- A `map(idFromUrl)` minden címet átad az `idFromUrl`-nek, a `join(',')` pedig vesszővel összefűzi az azonosítókat.
- `asList`: egyetlen azonosítóra (`/api/episode/6`) az API egy objektumot küld, nem egyelemű tömböt. Az `Array.isArray`
  megmondja, melyik jött, az `asList` pedig a magányos objektumot tömbbe csomagolja, így az oldal mindig használhatja a
  `map`-et.

A lista az `src/components/EpisodeList.jsx`-be kerül:

```jsx file=src/components/EpisodeList.jsx
import useFetch from '../useFetch.js'
import { asList, episodesUrl } from '../api.js'
import ErrorMessage from './ErrorMessage.jsx'

function EpisodeList({ episodeUrls }) {
  // Második kérés: a címe a szereplő adataiból áll össze, ezért csak akkor indulhat, amikor a szereplő már megvan.
  const { status, data, retry } = useFetch(episodesUrl(episodeUrls))

  return (
    <section className="section">
      <h3 className="section-title">Epizódok ({episodeUrls.length})</h3>
      {status === 'loading' && <p className="state">Az epizódok betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni az epizódokat." onRetry={retry} />}
      {status === 'success' && (
        <ol className="episodes">
          {asList(data).map((episode) => (
            <li key={episode.id}>
              <code>{episode.episode}</code>
              <span>{episode.name}</span>
              <small>{episode.air_date}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default EpisodeList
```

Az olyan kérés, amelyhez egy korábbi kérés válaszára van szükség, [[függő kérés]]. Ez itt magától kivárja a sorát: az
`EpisodeList` csak a szereplő oldalának sikerblokkjában jelenik meg, így mire lefut, a `data.episode` már megvan. Az
`<ol>` számozott lista, mert az epizódoknak sorrendje van; az `air_date` már a választott nyelven, kiírva érkezik.

Tedd a listát a szereplő alá az `src/components/CharacterDetail.jsx`-ben. A sikerblokkban most két dolog van, ezért egy
Fragmentbe kerülnek:

```jsx file=src/components/CharacterDetail.jsx mark=6,42,58-59
import { useEffect } from 'react'
import useFetch from '../useFetch.js'
import { characterUrl } from '../api.js'
import { GENDER_LABELS, STATUS_LABELS } from '../labels.js'
import ErrorMessage from './ErrorMessage.jsx'
import EpisodeList from './EpisodeList.jsx'

// A megmutatandó adatok címke–érték párokban, az üres adatok és az ismeretlen helyek nélkül.
function factsOf(character) {
  const facts = [
    { label: 'Állapot', value: STATUS_LABELS[character.status.toLowerCase()] },
    { label: 'Faj', value: character.species },
    { label: 'Típus', value: character.type },
    { label: 'Nem', value: GENDER_LABELS[character.gender.toLowerCase()] },
    { label: 'Származás', value: character.origin.name },
    { label: 'Utolsó ismert helyszín', value: character.location.name },
  ]
  return facts.filter((fact) => fact.value && fact.value !== 'unknown')
}

function CharacterDetail({ id }) {
  const { status, data, error, retry } = useFetch(characterUrl(id))

  // Egy új szereplő oldala felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="detail">
      <a className="back" href="#/">
        ← Vissza a listához
      </a>

      {status === 'loading' && <p className="state">A szereplő betöltése…</p>}
      {status === 'error' && error.status === 404 && <p className="state">Nincs ilyen számú szereplő.</p>}
      {status === 'error' && error.status !== 404 && (
        <ErrorMessage text="Nem sikerült betölteni a szereplőt." onRetry={retry} />
      )}

      {status === 'success' && (
        <>
          <div className="detail__main">
            <img className="detail__image" src={data.image} alt={data.name} width="300" height="300" />
            <div className="detail__info">
              <p className="detail__number">#{data.id}</p>
              <h2 className="detail__name">{data.name}</h2>
              <dl className="facts">
                {factsOf(data).map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <EpisodeList episodeUrls={data.episode} />
        </>
      )}
    </article>
  )
}

export default CharacterDetail
```

:::check Ellenőrizd
Juno oldalán az adatok alatt egy pillanatig „Az epizódok betöltése…” áll az „EPIZÓDOK (20)” cím alatt (a CSS csupa
nagybetűvel írja ki), aztán mind a 20
megjelenik, az S01E01-es „A világítótorony elvesztette a kékjét” (2025. március 1.) epizódtól az S02E10-ig. Nyisd meg
Pebble-t (#15): egyetlen epizód, az S01E06. A Network fülön látszik, hogy Juno epizódjai egyetlen kérésben jönnek:
`episode/1,2,3,…`.
:::

:::mistake Gyakori hiba
`data.map(…)` az `asList(data).map(…)` helyett. Junónál működik, de Pebble oldalán az API egyetlen objektumot küld, nem
tömböt: az oldal elfehéredik, a konzol pedig azt írja: „data.map is not a function”.
:::

:::try Feladat
A hosszú lista fárasztó: mutasd csak az első 5 epizódot, egy „Mind” gombbal. Kell hozzá egy `useState(false)` a
`showAll`-nak, aztán `const episodes = asList(data)`, és `(showAll ? episodes : episodes.slice(0, 5)).map(…)`.
:::

### Kapcsolatok: kik élnek még ott?

A szereplők kapcsolódnak egymáshoz: ugyanott élnek, ugyanazokban az epizódokban találkoznak. Mutassuk meg, kiket láttak
még utoljára ugyanott, ahol a szereplőt! Az adatok megvannak, csak két linknyire:

1. A szereplő `location.url`-je egy helyszínre mutat: `/api/location/1`.
2. A helyszín felsorolja a lakóit, megint csak címekkel: `residents: ['…/api/character/1', '…/api/character/3', …]`.
3. Az azonosítóikkal (a szereplőé nélkül) egyetlen kérés hozza a többieket: `/api/character/3,4,6,17`.

Ez tehát két kérés, és a másodiknak szüksége van az első válaszára. Írd a `locationUrl`-t az `src/api.js` végére:

```js file=src/api.js
// Egy helyszín: /api/location/1?lang=hu
export function locationUrl(id) {
  return `${API}/location/${id}?lang=${LANG}`
}
```

A `characterUrl`-nek nem kell testvér: ha egyetlen azonosító helyett `'3,4,6,17'`-et kap, ugyanúgy jó címet épít. A
rész az `src/components/SamePlace.jsx`-be kerül:

```jsx file=src/components/SamePlace.jsx mark=9,12-16
import useFetch from '../useFetch.js'
import { asList, characterUrl, idFromUrl, locationUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'

// Kiket láttak még ugyanott? Két kérés, egymás után.
function SamePlace({ character }) {
  // 1. Maga a helyszín. A lakói (residents) szereplők címei.
  const place = useFetch(locationUrl(idFromUrl(character.location.url)))

  // 2. A többi lakó (mindenki, csak ő nem), egyetlen kérésben.
  let otherIds = []
  if (place.status === 'success') {
    otherIds = place.data.residents.map(idFromUrl).filter((id) => id !== character.id)
  }
  const others = useFetch(otherIds.length > 0 ? characterUrl(otherIds.join(',')) : null)

  return (
    <section className="section">
      <h3 className="section-title">Szintén itt: {character.location.name}</h3>
      {(place.status === 'loading' || others.status === 'loading') && <p className="state">Betöltés…</p>}
      {place.status === 'error' && <ErrorMessage text="Nem sikerült betölteni a helyszínt." onRetry={place.retry} />}
      {others.status === 'error' && <ErrorMessage text="Nem sikerült betölteni a lakóit." onRetry={others.retry} />}
      {place.status === 'success' && otherIds.length === 0 && <p className="state">Rajta kívül senkit sem láttak itt.</p>}
      {others.status === 'success' && (
        <ul className="grid grid--small">
          {asList(others.data).map((other) => (
            <CharacterCard key={other.id} character={other} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default SamePlace
```

- A `place` és az `others` ugyanannak a hooknak két hívása, mindkettőnek saját állapota van. Ezért nem szedjük szét
  őket `status`-ra és `data`-ra, hanem így olvassuk: `place.status`, `others.data`.
- Amíg a helyszín adatai úton vannak, az `otherIds` üres. Utána a lakók azonosítóit tartalmazza, a szereplőé nélkül: a
  `filter` csak azokat az azonosítókat tartja meg, amelyek nem egyeznek (`!==`) a szereplőével.
- `useFetch(otherIds.length > 0 ? … : null)`: amíg nincs mit kérni, a cím `null`, és a hookunk `'idle'` marad. Amint
  megjön a helyszín, megjelenik a cím, és az effekt elküldi a második kérést. Ezért fogadja el a `useFetch` a hiányzó
  címet: hookot nem hívhatsz meg egy `if`-en belül, az argumentuma viszont mondhatja azt, hogy „még semmi”.
- A kártyák ugyanazok a `CharacterCard`-ok, mint a listában, így ezek is linkek.

Az `src/components/CharacterDetail.jsx`-ben importáld az új komponenst az `EpisodeList` mellé, és tedd az epizódlista
fölé. Csak ezek a sorok változnak, a fájl többi része marad, ahogy volt:

```jsx file=src/components/CharacterDetail.jsx mark=2,11
import EpisodeList from './EpisodeList.jsx'
import SamePlace from './SamePlace.jsx'

// … a factsOf és a CharacterDetail eleje, mint eddig

      {status === 'success' && (
        <>
          <div className="detail__main">
            {/* … a kép és az adatok, mint eddig … */}
          </div>
          {data.location.url && <SamePlace character={data} />}
          <EpisodeList episodeUrls={data.episode} />
        </>
      )}
```

Nem mindenkinek ismert a helye: Mister Gloam valahol a ködben bolyong. Ilyenkor az API `location.url`-je üres szöveg, és
az `&&` semmit sem rajzol.

:::check Ellenőrizd
Juno oldalán: „SZINTÉN ITT: TOLLAZAT-FOK”, Steepwell-lel, Dot Blotsworth-szel, Granny Marjorammal és Sprockettel.
Kattints Steepwellre: az oldala felülről nyílik meg, és most Juno is a szomszédai között van. Ottoline Inkwell (#22)
egyedül él a Kobalt-sziklákon: „Rajta kívül senkit sem láttak itt.” Mister Gloamnál (#28) ilyen rész nincs is.
:::

:::mistake Gyakori hiba
A `useFetch` egy `if`-en belül: `if (place.status === 'success') { const others = useFetch(…) }`. A React hibával
megáll: az első rajzoláskor a komponens egy hookot hívott, a következőnél kettőt, a React pedig csak a sorrendjük alapján
tudja megkülönböztetni őket. Minden hookot hívj meg minden rajzoláskor, és amíg nincs mit kérni, legyen a cím `null`.
:::

:::try Próbáld ki
Nyisd meg Pebble-t (#15): a Zsírkréta-barlangokban él, rajta kívül egyetlen szereplővel, Chanterelle-lel. A `SamePlace`
melyik sora miatt
működik ez? (Az `asList` miatt: egyetlen azonosítóra az API megint objektummal felel.)
:::

### Szerkeszthető bejegyzések

Egy wikit a rajongók írnak. Minden szereplő kap egy rajongói bejegyzést: néhány sort, amit bárki megírhat és
átszerkeszthet. A lecke API-ját csak olvasni lehet, mint a legtöbb nyilvános rajongói API-t, ezért a bejegyzések a
böngésződbe, a [[localStorage]]-ba kerülnek, az oldal pedig az API adatai mellett mutatja őket.

A korábbi leckékben (például a 6., „Flashcards” és a 9., „To-Do List” leckében) írtál már egy `useLocalStorage` hookot;
hozd létre az `src/useLocalStorage.js` fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Olyan, mint a useState, de az értéket a böngésző localStorage-ában is megőrzi.
function useLocalStorage(key, startValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? startValue : JSON.parse(saved)
    } catch {
      return startValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Tele van, vagy a böngésző nem engedi: az érték a memóriában azért megmarad.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

Gyors ismétlés: a kezdőértéket csak egyszer, az elején olvassuk ki a tárolóból (lusta kezdőérték), és a `JSON.parse`
alakítja vissza a JSON-szöveget objektummá. Minden változás után az effekt visszaírja, `JSON.stringify`-jal. Mindkettő
`try`-ban van, mert a tároló megtelhet, vagy privát ablakban le is lehet tiltva.

A bejegyzés saját komponenst kap: `src/components/WikiEntry.jsx`.

```jsx file=src/components/WikiEntry.jsx
import { useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'

function WikiEntry({ character }) {
  // Minden bejegyzés egyetlen objektumban, a szereplők azonosítója szerint: { 1: '…', 7: '…' }
  const [entries, setEntries] = useLocalStorage('fan-wiki-entries', {})
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const text = entries[character.id] ?? ''

  function startEditing() {
    setDraft(text)
    setEditing(true)
  }

  function save(event) {
    event.preventDefault()
    setEntries({ ...entries, [character.id]: draft.trim() })
    setEditing(false)
  }

  return (
    <section className="section entry">
      <h3 className="section-title">Rajongói bejegyzés</h3>
      {editing ? (
        <form className="entry__form" onSubmit={save}>
          <label className="field">
            <span>Mit írnál {character.name} lapjára?</span>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus />
          </label>
          <div className="entry__actions">
            <button type="submit" className="button--primary">
              Mentés
            </button>
            <button type="button" onClick={() => setEditing(false)}>
              Mégse
            </button>
          </div>
        </form>
      ) : (
        <>
          {text ? (
            <p className="entry__text">{text}</p>
          ) : (
            <p className="entry__empty">Még senki sem írt róla. Légy te az első!</p>
          )}
          <button type="button" onClick={startEditing}>
            {text ? 'Szerkesztés' : 'Bejegyzés írása'}
          </button>
        </>
      )}
    </section>
  )
}

export default WikiEntry
```

- Minden bejegyzés egyetlen objektumban él, egyetlen localStorage-kulcs alatt, a szereplők azonosítója szerint. Az
  `entries[character.id] ?? ''` ennek a szereplőnek a bejegyzését olvassa ki; a `??` akkor ad `''`-t, ha nincs ilyen
  (az érték `undefined`).
- Még két állapot: az `editing` (olvasunk vagy szerkesztünk?) és a `draft`, a szerkesztés alatt álló szöveg, a
  piszkozat. A piszkozat szándékosan külön van: amíg nem nyomod meg a Mentést, a mentett bejegyzés változatlan marad,
  így a Mégse egyszerűen eldobja a piszkozatot.
- A `save` az űrlap `onSubmit`-je: a Mentés gomb (`type="submit"`) küldi el az űrlapot. Az `event.preventDefault()`
  leállítja a böngésző [[alapértelmezett
  viselkedését|alapértelmezett viselkedés]], az oldal újratöltését. A `{ ...entries, [character.id]: draft.trim() }`
  az összes bejegyzés másolata, benne ezzel az eggyel kicserélve vagy hozzáadva; az üres szöveg törli a bejegyzést.
- Az `autoFocus` a szövegmezőbe teszi a billentyűzet fókuszát, amint megjelenik, így rögtön gépelhetsz.
- Az `entry__text` megtartja a beírt sortöréseket (`white-space: pre-line` az `App.css`-ben).

Az `src/components/CharacterDetail.jsx`-ben importáld a `WikiEntry`-t is, és tedd közvetlenül a kép és az adatok alá:

```jsx file=src/components/CharacterDetail.jsx mark=3,12
import EpisodeList from './EpisodeList.jsx'
import SamePlace from './SamePlace.jsx'
import WikiEntry from './WikiEntry.jsx'

// … a factsOf és a CharacterDetail eleje, mint eddig

      {status === 'success' && (
        <>
          <div className="detail__main">
            {/* … a kép és az adatok, mint eddig … */}
          </div>
          <WikiEntry character={data} />
          {data.location.url && <SamePlace character={data} />}
          <EpisodeList episodeUrls={data.episode} />
        </>
      )}
```

:::check Ellenőrizd
Steepwell oldalán kattints a „Bejegyzés írása” gombra, írj két sort, és kattints a „Mentés”-re: megjelenik a szöveg, a
sortöréssel együtt. Töltsd újra az oldalt: még mindig ott van. Kattints a „Szerkesztés”-re, írj át valamit, aztán
kattints a „Mégse” gombra: a mentett szöveg marad. Ments el egy üres mezőt: újra a „Még senki sem írt róla.” látszik. Gratulálunk, kész a
rajongói wikid!
:::

:::mistake Gyakori hiba
Minden leütés egyenesen az `entries`-be kerül, piszkozat nélkül. Látszólag működik, csak a Mégse már semmit sem tud
visszacsinálni, mert a változás azonnal mentődik.
:::

:::concept Hogyan mentene egy igazi wiki?
Egy olyan szerverre, ami változtatásokat is fogad. Minden kérésnek van [[HTTP-metódusa|HTTP-metódus]]: ebben a
leckében eddig csak `GET`-et küldtünk („add ide”); a 21. leckében a belépéshez már `POST`-ot is. Egy változtatás
`POST`-tal (valami új), `PUT`-tal vagy `PATCH`-csel (módosítás), illetve `DELETE`-tel (törlés) megy, az adat pedig a
kérés törzsében utazik:

```js
await fetch(`/api/character/${character.id}/entry`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: draft.trim() }),
})
```

A lecke álszerverén nincs ilyen cím, de az MSW erre is tudna válaszolni: egy `http.patch(…)` a `handlers.js`-ben, a
`http.get(…)`-ek mellett.
:::

:::try Feladat
Jelöld meg a listában azokat a szereplőket, akiknek már van bejegyzésük: a `CharacterCard`-ban olvasd ki a
bejegyzéseket a `useLocalStorage('fan-wiki-entries', {})`-vel, és tegyél egy ✎ jelet a név után, ha az
`entries[character.id]` nem üres.
:::
