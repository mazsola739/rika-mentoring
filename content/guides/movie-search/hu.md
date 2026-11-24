# Mit építünk?

Egy sorozatkeresőt. Beírsz egy címet, a találatok plakátos kártyákként jelennek meg, egy kártyára kattintva pedig
megnyílik a sorozat saját oldala, rajta minden fontos adattal. Az adatok egy igazi HTTP API-ból jönnek, a lecke saját
sorozat-API-jából, amely itt, a böngésződben fut, és kitalált sorozatokat tartalmaz (a „filmek” ezúttal tehát
tévésorozatok). Közben megtanulod, hogyan beszélget egy React-app egy szerverrel: kérések a `fetch`-csel, töltés- és
hibaállapotok, saját `useFetch` és `useDebounce` hook, és olyan oldalak, amelyeknek a címében egy paraméter is van,
például `#/show/42`.

:::levels
- Keresőmező, találatok címmel és plakáttal, „Keresés…” felirat és hibaüzenet. | kb. 2 óra
- Saját oldal minden sorozatnak, keresés, amely csak a gépelés végén indul el, és barátságos üzenetek, ha nincs találat, vagy hiba történt. | kb. 3 óra
- A keresés a címsorban marad, szűrés műfaj és évtized szerint, kedvencek, és a teljes katalógus oldalanként. | kb. 3 óra
:::

**Előismeret:** az előző leckék, főleg ezek: az 1. (oldalak a cím `#` utáni része alapján, a saját `useHashRoute`
hookkal), a 2. (Context), a 3. (vezérelt mezők, a `key`-trükk), a 6. és a 9. (a `useLocalStorage` hook) és a 14., a
„Currency Converter” (`fetch`, töltés- és hibaállapotok, az első `useFetch` hook és az álszerver az MSW-vel). Ahol egy
ismerős dolgot új módon használunk, ott újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/20-movie-search/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Ugyanúgy indulsz, mint az 1. leckében, és annak a 0. lépése minden
parancsot részletesen elmagyaráz. Röviden: nyiss egy terminált a munkamappádban, ahol a `rika-mentoring` repó van, hozd
le az új leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját `movie-search` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/20-movie-search/exercise movie-search
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/20-movie-search/exercise` mappát a munkamappádba, `movie-search` néven. A másolatodban
dolgozol: a repó érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `movie-search` mappát a szerkesztőben (VS Code-ban: **File** → **Open Folder**), nyiss benne egy terminált
(**Terminal** → **New Terminal**), és indítsd el a projektet:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite és MSW)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Egy sötétkék oldal tetején a türkiz „Movie
Search” cím látszik.
:::

A szervert hagyd futni. Egy második terminálban (a terminálpanel **+** gombjával) csinálj a másolatodból git-repót
egyetlen committal, a kezdőállapottal:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni. Ha a git azt kérdezi, ki vagy, az 1. lecke 0. lépése megmutatja, hogyan add meg a nevedet és az
e-mail-címedet.

A kiinduló projektben most a szokásosnál több fájl van:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért nem kell stílust
  írnod: csak a lépésekben megadott osztályneveket (`search`, `grid`, `card`, …) használod. Azért nézz bele!
- `src/mocks/`: a lecke sorozat-API-ja, az „álszerver”, amelyről rögtön alább olvashatsz.
- `public/mockServiceWorker.js`: az MSW csomag egyik fájlja. Hagyd úgy, ahogy van.
- `src/main.jsx`: először elindítja a sorozat-API-t, és csak utána rajzolja ki az oldalt.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a „Movie Search” cím angolul
vannak. Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te írsz be, magyar
feliratokkal és megjegyzésekkel mutatjuk.

:::concept Egy álszerver a böngésződben
A 14. leckéből ismered: a kiinduló projektben megint egy álszerver van, ezúttal egy sorozat-API. Emlékeztetőül: a
legtöbb webapp egy [[szerver]]től kapja az adatait, egy másik számítógéptől, amely válaszol az app kéréseire. A [[HTTP API]] olyan
címek gyűjteménye, amelyekre nem ember, hanem program küld kérést, azzal együtt, hogy melyik címen mit lehet kérni, és
milyen választ ad rá a szerver. Az API egyes címei, például a „sorozatok keresése”, a [[végpont]]ok.

Ez az API sem egy másik gépen fut: a [[Mock Service Worker]] (röviden MSW) itt, a böngésződben működteti. A [[service
worker]] egy kis szkript, amelyet a böngésző az oldal mellett futtat, és amely el tudja kapni az oldal kéréseit. Az MSW
saját service workere (`public/mockServiceWorker.js`) elkap minden kérést, amely `/api/`-val kezdődő címre megy, és az
`src/mocks/` mappa adataiból válaszol rá, pontosan úgy, ahogy egy igazi szerver tenné: JSON-adatokkal, egy kis
késéssel, és hibakóddal, ha valami nem stimmel. A kódod nem látja a különbséget. Ugyanúgy hívja a `fetch('/api/tv/…')`-t,
mintha egy internetes sorozat-API-t kérdezne, így minden, amit itt megtanulsz, igazi szerverekkel is működik. Az
`src/main.jsx`-ben az `await startMockApi(handlers)` sor indítja el az álszervert, még mielőtt a React kirajzolná az
oldalt.

A végpontokat, amelyeket használni fogsz, az `src/mocks/handlers.js` eleje sorolja fel. A sorozatok, a plakátok és a
szereplők mind kitaláltak, a címüket és a leírásukat pedig angolul küldi az API.
:::

:::mistake Gyakori hiba
Telefonról nyitod meg az oldalt: a szervert `npm run dev -- --host` paranccsal indítod (ahogy a 3. leckében), és a
terminál „Network” sorában kiírt címet (`http://192.168…`) nyitod meg. A böngészők csak biztonságos címeken futtatnak
service workert (`https://…` és `localhost`), ezért ott az álszerver nem tud elindulni, és minden keresés hibával
végződik. Dolgozz a gépeden, a `localhost` címen.
:::

:::try Próbáld ki
Kérdezd meg az API-t, még mielőtt egyetlen sor Reactet írnál. Nyisd meg a böngésző konzolját (++F12++ → Console), írd be
ezt a sort, és nyomj ++Enter++-t (ha beilleszted, a Chrome előbb arra kér, hogy gépeld be: `allow pasting`):

```js
fetch('/api/tv/search/shows?q=lighthouse').then((response) => response.json()).then(console.log)
```

Egy pillanat múlva megjelenik egy kételemű lista: a két sorozat, amelynek a címében benne van a „lighthouse”. A kis
háromszögekre kattintva belenézhetsz.
:::

### A keresőmező

Az oldal első darabja egy keresőűrlap. A mezője [[vezérelt mező]], ahogy a 3. leckében: az értékét az állapotból kapja,
és minden billentyűleütés frissíti az állapotot. Cseréld le a teljes `src/App.jsx`-et (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1,5-12,17-31
import { useState } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  function handleSubmit(event) {
    // Enélkül a böngésző újratöltené az oldalt, ahogy minden űrlap elküldésekor.
    event.preventDefault()
    setSubmitted(query.trim())
  }

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
        <button type="submit">Keresés</button>
      </form>

      {submitted && <p className="status">Erre kerestél: {submitted}</p>}
    </main>
  )
}

export default App
```

- Az űrlap akkor **küldődik el**, amikor ++Enter++-t nyomsz a mezőjében, vagy rákattintasz a `type="submit"` gombjára.
  Ilyenkor az `onSubmit` meghívja a `handleSubmit`-et. A böngésző [[alapértelmezett viselkedés]]e az, hogy az elküldött
  űrlappal új oldalt tölt be; az `event.preventDefault()` ezt akadályozza meg, ugyanúgy, mint az 1. lecke kapcsolati
  űrlapján.
- Két állapot van. A `query` betűről betűre követi a gépelést, a `submitted` csak elküldéskor változik. A `trim()`
  levágja a szöveg két végéről a szóközöket.
- A `type="search"` keresésre szánt mezőt csinál: telefonon a billentyűzeten „keresés” gomb jelenik meg, és egyes
  böngészők egy kis ×-et is tesznek bele a törléshez. A `role="search"` a képernyőolvasóknak jelzi, hogy ez az oldal
  keresője.
- A `{submitted && …}` [[feltételes megjelenítés]]: a sor csak akkor jelenik meg, ha a `submitted` nem üres szöveg.

:::check Ellenőrizd
Írd be, hogy `lighthouse`, és nyomj ++Enter++-t (vagy kattints a „Keresés” gombra): az űrlap alatt megjelenik az „Erre
kerestél: lighthouse” sor, az oldal pedig nem töltődik újra. Írj valami mást a mezőbe: a sor változatlan marad, amíg
újra nem keresel.
:::

:::mistake Gyakori hiba
Kimarad az `event.preventDefault()`. Ekkor minden keresésnél újratöltődik az oldal, így a sor sosem marad ott, a cím
végén pedig megjelenik egy `?`.
:::

### Az első kérés

Most küldjük el a szöveget a sorozat-API-nak. A keresés végpontja a `/api/tv/search/shows`, és a keresett szöveget a
címben várja: `/api/tv/search/shows?q=lighthouse`. A `?` utáni rész a [[query string]]: a 14. leckéből ismert
[[lekérdezési paraméterek|lekérdezési paraméter]] sora, vagyis `név=érték` párok, amelyekkel további részleteket adunk
át a szervernek. Itt a név `q` (a „query”, vagyis lekérdezés rövidítése), az érték pedig a keresett szöveg.

Egy szövegben lehetnek olyan karakterek is, amelyek egy címben mást jelentenek: szóköz, `&`, `?` vagy `#`. A 4. és a 6.
leckéből ismert `encodeURIComponent` biztonságos kódokká alakítja őket ([[URL-kódolás]]): a `three a.m.`-ből
`three%20a.m.` lesz, a szerver pedig visszaalakítja. Az API címei saját fájlba kerülnek. Hozd létre az `src/api.js`
fájlt:

```js file=src/api.js
// A lecke sorozat-API-jának címe. A böngészőben válaszol (lásd src/mocks), de úgy hívjuk, mint bármelyik igazi szervert.
const API = '/api/tv'

// Egy keresés címe: searchUrl('three a.m.') → '/api/tv/search/shows?q=three%20a.m.'
export function searchUrl(text) {
  return `${API}/search/shows?q=${encodeURIComponent(text)}`
}
```

Gyors ismétlés a 14. leckéből: a [[fetch]]. A `fetch(cím)` elküld egy kérést, és azonnal visszaad egy [[Promise]]-t,
vagyis egy ígéretet, hogy jön majd válasz. Ezt az `await` várja ki, egy [[async függvény]]en belül. Először a
[[válasz|HTTP-válasz]] érkezik meg: a válasz státusza és a [[fejléc]]ei, vagyis a tartalom előtt utazó név–érték párok
(például hogy milyen fajta adat jön). A törzse, vagyis maga az adat, csak utána jön,
ezért a `response.json()` egy második ígéret: beolvassa a törzset, és a [[JSON]]-szövegből JavaScript-tömböket és
-objektumokat csinál. Írd át az `src/App.jsx`-et így:

```jsx file=src/App.jsx mark=2,7,9,11-16,36-40
import { useState } from 'react'
import { searchUrl } from './api.js'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    const text = query.trim()
    // Üres keresésre az API csak hibát küldene (400 Bad Request).
    if (text === '') return
    const response = await fetch(searchUrl(text))
    const data = await response.json()
    setResults(data)
  }

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
        <button type="submit">Keresés</button>
      </form>

      <ul>
        {results.map((result) => (
          <li key={result.show.id}>{result.show.name}</li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

A `submitted` állapot eltűnt: mostantól a találatokat mutatjuk. Az API egy tömbbel válaszol, elöl a legjobb
találatokkal. Minden eleme egy kétmezős objektum: a `score` (mennyire illik a sorozat a kereséshez, 0 és 1 között) és a
`show`, maga a sorozat, egy nagy objektum több tucat mezővel. Egyelőre kettő kell belőlük: az `id`, ami egyedi, ezért jó
[[key]], és a `name`, a sorozat címe.

:::check Ellenőrizd
Keress rá arra, hogy `lighthouse`: megjelenik egy lista két címmel, „Lighthouse at Lowtide” és „Lighthouse at Lowtide:
The Keeper's Log”. Nyisd meg a fejlesztői eszközöket (++F12++) a Network fülön, és keress újra: megjelenik egy új sor,
`shows?q=lighthouse`, 200-as státusszal. A Size oszlopban az áll: „(ServiceWorker)”, vagyis az álszerver válaszolt.
Kattints a sorra: a Preview fülön az egész válasz látszik.
:::

:::mistake Gyakori hiba
Kimarad a második `await`: `const data = response.json()`. Ekkor a `data` nem a lista, hanem egy ígéret, az oldal
kiürül (még a „Movie Search” cím is eltűnik), a konzolban pedig ez áll: „results.map is not a function”.
:::

:::try Próbáld ki: milyen, ha elbukik?
Töröld ki egy időre az `if (text === '') return` sort, és keress üres mezővel. Az API „400 Bad Request” választ küld,
lista helyett egy objektummal (`{ error, message }`), és az oldal ugyanígy összeomlik. Tedd vissza a sort. Két lépés
múlva az ilyen válaszok már nem döntik be az oldalt.
:::

### Kártyák plakáttal

Minden találat legyen egy plakátos kártya. Előbb nézd meg, mit küld az API egy sorozatról (Network fül → Preview).
Nagyon sok mezőt, és ezek egy része egy belső objektumban van: a plakát az `image.medium` mezőben, de a plakát nélküli
sorozatnál `image: null`; az első rész dátuma `premiered: '2019-09-24'`, vagy `null`, ha a sorozat még el sem indult; az
értékelés a `rating.average`.

A kártyáknak csak néhány mező kell, ezért az API minden sorozatából egy kis saját objektumot készítünk. Ez „lapos” lesz:
minden mezője közvetlenül benne van, nem egy belső objektumban, így például `show.poster`-t írhatunk az
`apiShow.image.medium` helyett. Írd ezt a függvényt az `src/api.js` végére:

```js file=src/api.js
// Az API sorozatobjektumai nagyok és egymásba ágyazottak; a kártyáknak csak néhány lapos mező kell.
export function toShow(apiShow) {
  return {
    id: apiShow.id,
    name: apiShow.name,
    // Nem minden sorozatnak van plakátja: ilyenkor az image értéke null.
    poster: apiShow.image ? apiShow.image.medium : null,
    // '2019-09-24' → 2019. A még el nem indult sorozatnak nincs bemutatási dátuma.
    year: apiShow.premiered ? Number(apiShow.premiered.slice(0, 4)) : null,
    genres: apiShow.genres,
    rating: apiShow.rating.average,
  }
}
```

A `slice(0, 4)` kivágja a dátum első négy karakterét, a `Number()` pedig a `'2019'` szövegből a 2019-es számot csinálja.
Az app többi részének így sosem kell tudnia, hogyan tárolja a dolgokat az API: ha az API megváltozik, csak a
`toShow`-hoz kell hozzányúlni.

A plakát saját komponenst kap, mert a sorozat oldala is használni fogja. Hozd létre az `src/components/Poster.jsx`
fájlt:

```jsx file=src/components/Poster.jsx
// Egy sorozat plakátja, vagy egy helykitöltő doboz, ha az API-nak nincs hozzá képe.
function Poster({ src }) {
  if (!src) {
    return <div className="poster poster--empty">Még nincs plakát</div>
  }
  // alt="", mert a cím ott áll közvetlenül a kép alatt: a képernyőolvasónak nem kell kétszer felolvasnia.
  return <img className="poster" src={src} alt="" loading="lazy" />
}

export default Poster
```

- Ha nincs kép (az `src` értéke `null`), a komponens rögtön a helykitöltőt adja vissza: ez a [[korai visszatérés]]. Az
  `<img>`-es sorig csak akkor jut el a kód, ha van kép.
- A plakátok is a sorozat-API-ból jönnek (például `/api/tv/posters/1/medium.svg`), és ezekre a kérésekre is az MSW
  válaszol: a képeket kód rajzolja.
- A `loading="lazy"` a 12. leckéből ismert [[lusta betöltés]]: a böngésző csak akkor tölti le a képet, amikor az a
  képernyő közelébe ér.
- Az [[alt szöveg]] azoknak írja le a képet, akik nem látják. Itt a sorozat címe közvetlenül a plakát alatt áll, ezért
  az üres `alt` a jó választás.

Aztán hozd létre a kártyát, az `src/components/ShowCard.jsx` fájlt:

```jsx file=src/components/ShowCard.jsx
import Poster from './Poster.jsx'

// Egy találat: plakát, cím, év és műfajok.
function ShowCard({ show }) {
  return (
    <li className="card">
      <Poster src={show.poster} />
      <h2 className="card__title">{show.name}</h2>
      <p className="card__meta">
        {show.year ?? 'Hamarosan'} · {show.genres.join(', ')}
      </p>
    </li>
  )
}

export default ShowCard
```

A `??` a 13. leckéből ismert [[nullish coalescing]]: a bal oldali értéket adja, kivéve, ha az `null` vagy `undefined`,
mert akkor a jobb oldalit. A `join(', ')` egyetlen szöveggé fűzi a műfajokat, közéjük vesszőt és szóközt téve. A műfajok
neve angol, mert az API így küldi.

Az `App`-ban minden találat átmegy a `toShow`-n, a lista pedig kártyák rácsává válik. Itt a teljes fájl:

```jsx file=src/App.jsx mark=2-3,17-18,38-42
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import ShowCard from './components/ShowCard.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    const text = query.trim()
    // Üres keresésre az API csak hibát küldene (400 Bad Request).
    if (text === '') return
    const response = await fetch(searchUrl(text))
    const data = await response.json()
    // Minden találat { score, show } alakú: csak a sorozatot tartjuk meg, a saját kis formánkban.
    setResults(data.map((result) => toShow(result.show)))
  }

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
        <button type="submit">Keresés</button>
      </form>

      <ul className="grid">
        {results.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Mentés után nyomj egy ++F5++-öt: a Vite gyors újratöltése megtartaná az előző lépés találatait, amelyek még a régi,
`{ score, show }` alakúak, és az oldal „Cannot read properties of undefined (reading 'join')” hibával kiürülne. Aztán
keress rá arra, hogy `lighthouse`: két kártya jelenik meg. Az elsőn egy plakát látszik (fénysugár a sötét víz fölött), a
cím alatt pedig „2019 · Drama, Mystery”. A másodikon egy szaggatott keretes doboz áll, benne „Még nincs plakát”, alatta
pedig „Hamarosan · Drama, Mystery”. Keress rá arra, hogy `the`: tíz kártya, egy sorban annyi, amennyi az ablakba fér.
:::

:::mistake Gyakori hiba
`poster: apiShow.image.medium` a `toShow`-ban, ellenőrzés nélkül. A `lighthouse` keresésre ekkor egyetlen kártya sem
jelenik meg: a plakát nélküli sorozatnál az `image` értéke `null`, a `toShow` hibát dob, még mielőtt a találatok az
állapotba kerülnének, a konzolban pedig ez áll: „Uncaught (in promise) TypeError: Cannot read properties of null
(reading 'medium')”. Egy szerver adataiban bármikor lehet hiány; mielőtt beleolvasnál, ellenőrizd.
:::

:::try Feladat
Kerüljön az értékelés is a kártyákra: egy harmadik sor, például `★ 8.1`, de csak azoknál a sorozatoknál, amelyeknek van
értékelése (`show.rating !== null`). A `card__meta` osztály jól áll neki.
:::

### Töltés és hibaüzenet

Egy kérés időbe telik, és el is romolhat. Az oldal most semmit sem mond, amíg vár, ha pedig hibás a válasz, csendben
elakad: a konzolban hiba jelenik meg, az oldalon semmi sem változik. Egy kérés mindig a négy állapot valamelyikében van: még nem kérdeztünk semmit (`'idle'`), várjuk a választ
(`'loading'`), megjött a válasz (`'success'`), vagy valami elromlott (`'error'`). Egyetlen állapot, a `status` mondja
meg, melyikben vagyunk, az oldal pedig mindegyikben mást mutat.

Honnan tudjuk, hogy valami elromlott? Minden HTTP-válasz egy [[HTTP-státuszkód]]dal kezdődik: a 200 azt jelenti, hogy
rendben, a 400 hibás kérést, a 404 azt, hogy nincs ilyen, a 429 túl sok kérést, az 500 pedig szerverhibát. Vigyázz: a
`fetch` csak akkor bukik el (csak akkor utasítja el az ígéretét), ha egyáltalán nem jön válasz, például mert nincs
hálózat. Egy 404-es vagy 429-es válasz a `fetch` szemében is válasz. A `response.ok` megmondja, hogy a kód sikert
jelent-e (200–299), ezért ezt mi ellenőrizzük, és ha nincs rendben, [[hibát dobunk|hibadobás]]. A `throw` ott megállítja a
függvényt, és a kód a [[try/catch]] `catch` részében folytatódik. Itt a teljes `src/App.jsx`, ahogy a kezdő szint végén
kinéz:

```jsx file=src/App.jsx mark=9,16-29,32-34,53-63,69
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import ShowCard from './components/ShowCard.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // 'idle', 'loading', 'success' vagy 'error'

  async function handleSubmit(event) {
    event.preventDefault()
    const text = query.trim()
    // Üres keresésre az API csak hibát küldene (400 Bad Request).
    if (text === '') return
    setStatus('loading')
    try {
      const response = await fetch(searchUrl(text))
      // Az ok akkor igaz, ha a státuszkód sikert jelent (200–299).
      if (!response.ok) {
        throw new Error(`A sorozat-API válasza: ${response.status}`)
      }
      const data = await response.json()
      // Minden találat { score, show } alakú: csak a sorozatot tartjuk meg, a saját kis formánkban.
      setResults(data.map((result) => toShow(result.show)))
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  let message = ''
  if (status === 'loading') message = 'Keresés…'
  if (status === 'success') message = `${results.length} találat.`

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
        <button type="submit">Keresés</button>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <p className="notice notice--error" role="alert">
          A keresés nem sikerült. Várj pár másodpercet, és próbáld újra.
        </p>
      )}

      {status === 'success' && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
```

- A `message` [[származtatott érték]]: a `status`-ból és a `results`-ból következik, ezért minden rajzoláskor újra
  kiszámoljuk, és nem kell hozzá saját állapot.
- Az állapotsor mindig ott van az oldalon, csak a szövege változik. Az [[aria-live]] arra kéri a képernyőolvasókat, hogy
  olvassák fel az új szöveget, amikor megváltozik, így a „Keresés…” és a „2 találat.” hallható is. A hibaüzenet
  `role="alert"` attribútuma pedig azt kéri, hogy ezt a szöveget azonnal olvassák fel.
- A rács csak sikeres válasz után jelenik meg. Amíg egy új keresés töltődik, a régi kártyák eltűnnek, így senki sem
  hiszi őket az új találatoknak.

:::check Ellenőrizd
Keress valamire: egy pillanatra megjelenik a „Keresés…”, aztán a „2 találat.” (vagy ahány van) és a kártyák. Most
szándékosan dühítsük fel az API-t. Kattints a keresőmezőbe, és nyomd meg gyorsan az ++Enter++-t, újra és újra, több mint
hússzor. Sok igazi API-hoz hasonlóan a miénk is legfeljebb 20 kérést enged 10 másodperc alatt, utána „429 Too Many
Requests” a válasza. A kártyák eltűnnek, és megjelenik a narancssárga keretes hibaüzenet. A Network fülön a 429-es sorok
pirosak. Várj tíz másodpercet, és keress újra: minden működik. Kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
Kimarad a `try` és a `catch`, és csak a `try` belsejében álló sorok maradnak meg. A dobott hiba ilyenkor nem jut
sehová: egy sikertelen kérés után a
„Keresés…” örökre az oldalon marad, a konzolban pedig ez áll: „Uncaught (in promise) Error: A sorozat-API válasza: 429”.
:::

:::try Próbáld ki
Amíg egy keresés fut, nincs értelme újra elindítani. Add a „Keresés” gombhoz a `disabled={status === 'loading'}`
attribútumot: amíg az oldal válaszra vár, a gombra nem lehet kattintani.
:::

## Középszint {level=2}

### Keresés gépelés közben: a useFetch hook

A legtöbb keresőhöz ma már nem kell gomb: a találatok követik a gépelést. Ehhez minden szövegváltozáskor kérést kell
küldeni. A kérés küldése a rajzoláson kívüli munka, ezért a helye egy [[useEffect]]-ben van, és ahogy a 14. leckében,
most is egy [[saját hook]]ba, a `useFetch`-be tesszük. A hook egy címet kap, és visszaadja a kérés állapotát; ha a cím
megváltozik, újra kérdez. A 14. leckében már írtál egy `useFetch`-et; most újra felépítjük, és közben jobbá tesszük. Az
egyik újdonság: meg lehet neki mondani, hogy még nincs mit kérdeznie (ilyenkor a cím `null`).

Előbb azonban egy csapda. Ha gyorsan beírod, hogy „lig”, két kérés indul el egymás után: egy a „li”-re, egy a „lig”-re.
Az álszerver, akárcsak egy igazi, egyes kérésekre gyorsabban válaszol, mint másokra. Ha a „li” válasza később ér oda,
mint a „lig”-é, felülírja az újabb találatokat, és az oldal egy olyan szöveg találatait mutatja, amely már nincs is a
mezőben. Ez a [[versenyhelyzet]], amellyel az 5., a 9. és a 14. leckében is találkoztál: az eredmény attól függ, hogy
két dolog közül melyik végez előbb.

A 14. leckében egy `ignore` jelző dobta el a régi választ, maga a kérés viszont végigfutott. Most azt a megoldást
használjuk, amelyről ott egy fogalomdobozban olvastál: amikor új kérés indul, a régit meg is szakítjuk. Erre való az
[[AbortController]]: a `new AbortController()`
létrehoz egyet, a `signal`-ját odaadjuk a `fetch`-nek, a `controller.abort()` pedig megszakítja a kérést. A megszakított
`fetch` hibával végződik, ezt egyszerűen figyelmen kívül hagyjuk. És mikor szakítsuk meg? Pont akkor, amikor az effekt
[[takarító függvény]]e lefut: a React meghívja, mielőtt új címmel újra lefuttatná az effektet, és akkor is, amikor a
komponens eltűnik. Hozd létre az `src/useFetch.js` fájlt:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// Betölti a JSON-t az url-ről, és újra betölti, valahányszor az url megváltozik.
// Ezt adja vissza: { status, data }. A status: 'idle' (nincs url), 'loading', 'success' vagy 'error'.
function useFetch(url) {
  const [result, setResult] = useState({ status: 'idle', data: null })

  useEffect(() => {
    if (!url) {
      setResult({ status: 'idle', data: null })
      return
    }

    const controller = new AbortController()
    setResult({ status: 'loading', data: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Az API válasza: ${response.status}`)
        }
        const data = await response.json()
        setResult({ status: 'success', data })
      } catch {
        // A lenti takarítás szakította meg: egy újabb kérés vette át a helyét, ezért csendben maradunk.
        if (controller.signal.aborted) return
        setResult({ status: 'error', data: null })
      }
    }
    load()

    // Takarítás: ha az url megváltozik (vagy a komponens eltűnik), a régi kérést megszakítjuk.
    return () => controller.abort()
  }, [url])

  return result
}

export default useFetch
```

- A `status` és a `data` egy objektumban lakik, mert mindig együtt változnak: a sikeres válasznak mindig van adata, a
  többi állapotnak soha.
- A `useEffect`-nek átadott függvény maga nem lehet `async`: egy async függvény mindig ígéretet ad vissza, a React
  viszont a visszatérési értékben a takarító függvényt keresi. Ezért írunk bele egy kis async függvényt (`load`), és
  azonnal meg is hívjuk.
- A `{ status: 'success', data }` a `{ status: 'success', data: data }` rövidítése: ha a mező neve ugyanaz, mint a
  változóé, elég egyszer leírni.
- A [[függőségi tömb]] itt az `[url]`. Az `url` szöveg, így az effekt csak akkor fut le újra, ha a szöveg tényleg
  megváltozott.

Az `App` mostantól nem maga küldi a kéréseket: csak megmondja a hooknak, melyik címre kíváncsi. Egy betűre szinte minden
sorozat illene, ezért a keresés két betűtől indul; addig a cím `null`, és a hook nem kérdez semmit. A gomb eltűnik, az
űrlapnak pedig csak annyi a dolga, hogy ++Enter++-re ne töltse újra az oldalt. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=3,9-13,23
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import useFetch from './useFetch.js'
import ShowCard from './components/ShowCard.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const text = query.trim()
  // Egy betűre szinte minden sorozat illene, ezért a keresés két betűtől indul.
  const { status, data } = useFetch(text.length >= 2 ? searchUrl(text) : null)
  // Minden találat { score, show } alakú: csak a sorozatot tartjuk meg, a saját kis formánkban.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (status === 'loading') message = 'Keresés…'
  if (status === 'success') message = `${results.length} találat.`

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <p className="notice notice--error" role="alert">
          A keresés nem sikerült. Várj pár másodpercet, és próbáld újra.
        </p>
      )}

      {status === 'success' && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
```

A `results` is származtatott érték lett: minden rajzoláskor a hook válaszából készül. Eltűnt a `results` és a `status`
`useState`-je, a `setResults`, a `setStatus` és a `handleSubmit`, az `App` pedig egyszerűbb lett: azt mondja meg,
**mit** szeretne, a **hogyan** a hook dolga.

:::check Ellenőrizd
Írd be betűnként, hogy `lig`: a második betűtől kezdve a találatok követik a gépelést, gomb pedig már nincs. Figyeld a
Network fület: a második betűtől minden betűre elmegy egy kérés, és ha gyorsan gépelsz, azok a kérések, amelyek helyére
még a válaszuk előtt újabb indult, pirosan, „(canceled)” állapottal végződnek. Ezeket állította le a takarító
függvényünk.
:::

:::mistake Gyakori hiba
Kimarad az `[url]` a `useEffect` végéről. Függőségi tömb nélkül az effekt minden rajzolás után lefut. Mivel állapotot
állít be, az oldal újra kirajzolódik, az effekt megint lefut, és így tovább, vég nélkül. A konzol már az oldal megnyitásakor
megtelik „Maximum update depth exceeded” hibákkal, és amint beírsz két betűt, a Network fül is megtelik több száz
megszakított kéréssel.
:::

:::try Próbáld ki
Írj be gyorsan egy hosszú szót, töröld ki, írd be újra, és megint. Előbb-utóbb 429 lesz a válasz (10 másodperc alatt
több mint 20 kérés), és megjelenik a hibaüzenet. Betűnként egy kérés túl sok: a következő lépés ezt hozza rendbe.
:::

### Várjuk meg, amíg abbamarad a gépelés: useDebounce

Ha azt írod be, hogy „lighthouse”, fölösleges rákeresni a „li”-re, a „lig”-re, a „ligh”-ra és a többire: csak az utolsó
számít. A [[debounce]] azt jelenti: megvárjuk, amíg valami abbamarad, és utána egyszer cselekszünk. Olyan, mint a lift
ajtaja: megvárja az utolsó beszállót, és csak akkor csukódik be, ha pár másodpercig senki sem jön.

Olyan értékre van szükségünk, amely követi a `query`-t, de csak akkor, ha a `query` egy kis ideje már nem változott. Ez
is egy kis saját hookba illik. Hozd létre az `src/useDebounce.js` fájlt:

```js file=src/useDebounce.js
import { useEffect, useState } from 'react'

// A value-t adja vissza, de késleltetve: csak akkor veszi át az új értéket, ha a value delay ezredmásodpercig nem változott.
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Minden új érték leállítja az előző időzítőt, így csak az utolsó sül el.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce
```

Kövesd végig: minden billentyűleütés megváltoztatja a `value`-t, ezért az effekt újra lefut. Előtte azonban a takarítása
a `clearTimeout`-tal leállítja az előző időzítőt (a [[setTimeout]]-ot és az időzítő eltakarítását a 3. leckéből
ismered). Amíg tehát gépelsz, egyik időzítő sem jut el a végéig. Amikor abbahagyod, az utolsó időzítő `delay` ezredmásodperc múlva lejár, beállítja a
`debounced`-ot, és a hook visszaadja az új szöveget.

Az `App`-ban csak a `text`-et előállító sor változik, meg egy import. Írd át az `src/App.jsx` elejét így (a
`useFetch`-es sor után minden marad, ahogy volt):

```jsx file=src/App.jsx mark=4,10-11
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import useFetch from './useFetch.js'
import useDebounce from './useDebounce.js'
import ShowCard from './components/ShowCard.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  // A keresés megvárja, hogy a gépelésben 400 ezredmásodperc szünet legyen.
  const text = useDebounce(query.trim(), 400)
  // Egy betűre szinte minden sorozat illene, ezért a keresés két betűtől indul.
  const { status, data } = useFetch(text.length >= 2 ? searchUrl(text) : null)
```

A mező továbbra is a `query`-t mutatja, így amit gépelsz, azonnal megjelenik; csak a keresés vár.

:::check Ellenőrizd
Írd be gyorsan, hogy `lighthouse`: a Network fülön egyetlen kérés látszik, nagyjából fél másodperccel az utolsó
billentyű után. Most gépelj lassan, minden betű után várj egy másodpercet: így minden szünetben elmegy egy kérés.
:::

:::mistake Gyakori hiba
Kimarad a takarítás (`return () => clearTimeout(timer)`). Ekkor semmi sem állítja le a régi időzítőket: minden
billentyűleütés 400 ezredmásodperccel később mégis beállítja a `debounced`-ot, és a kérések egyenként elmennek, csak
kicsit később.
:::

:::try Próbáld ki
Próbálj ki 100 és 1500 ezredmásodperces késleltetést is. 100-nál még mindig sok a kérés, 1500-nál lomhának érződik az
oldal. A legtöbb kereső valahol 300 és 500 ezredmásodperc között vár.
:::

### Üres mező, túl rövid szöveg, nincs találat, hiba

A keresőnk gyors, de nem túl beszédes. Egy jó keresőoldalnak minden helyzetre van válasza:

- üres a mező: mondja meg, mit érdemes beírni,
- túl rövid a szöveg: szóljon, hogy két betű kell,
- töltés közben: „Keresés…”,
- hiba esetén: mondja meg, mi történt, és ajánlja fel az újrapróbálást,
- ha nincs találat: mondja ki világosan, egy tippel együtt, üres oldal helyett,
- ha vannak találatok: hány darab, és a kártyák.

A „nincs találat” és a hiba doboza hasonlít egymásra: egy cím, alatta pedig egy sor szöveg vagy egy gomb. Érdemes hát
egy kis komponenst írni rájuk. Hozd létre az `src/components/Notice.jsx` fájlt:

```jsx file=src/components/Notice.jsx
// Doboz a „nincs találat” és a hiba jelzésére: egy cím, alatta pedig az, amit a nyitó és a záró címke közé teszünk.
function Notice({ title, error = false, children }) {
  return (
    <div className={error ? 'notice notice--error' : 'notice'} role={error ? 'alert' : undefined}>
      <p className="notice__title">{title}</p>
      {children}
    </div>
  )
}

export default Notice
```

A [[children]] az a különleges prop, amellyel a 2. leckében, a Contextnél találkoztál: mindaz, ami a `<Notice>` és a
`</Notice>` között áll. Az `error = false` [[alapértelmezett paraméter]]: ha nem adunk át `error` propot, az értéke
`false`. Az érték nélkül leírt prop (például `<Notice error>`) értéke `true`.

Az újrapróbálás úgy működik, mint a 14. lecke `useFetch`-ében: az effekt csak akkor fut le újra, ha valamelyik
függősége megváltozik, a cím viszont ugyanaz marad. Ezért kap az effekt egy második függőséget, egy számlálót (ugyanazt
az `attempt`-et, mint ott): a `retry` eggyel növeli, az effekt változást lát, és újra elküldi a kérést. Itt a teljes
`src/useFetch.js`:

```js file=src/useFetch.js mark=4,7-8,37-43
import { useEffect, useState } from 'react'

// Betölti a JSON-t az url-ről, és újra betölti, valahányszor az url megváltozik.
// Ezt adja vissza: { status, data, retry }. A status: 'idle' (nincs url), 'loading', 'success' vagy 'error'.
function useFetch(url) {
  const [result, setResult] = useState({ status: 'idle', data: null })
  // Ha ezt a számot növeljük, a kérés megismétlődik, akkor is, ha az url ugyanaz.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!url) {
      setResult({ status: 'idle', data: null })
      return
    }

    const controller = new AbortController()
    setResult({ status: 'loading', data: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Az API válasza: ${response.status}`)
        }
        const data = await response.json()
        setResult({ status: 'success', data })
      } catch {
        // A lenti takarítás szakította meg: egy újabb kérés vette át a helyét, ezért csendben maradunk.
        if (controller.signal.aborted) return
        setResult({ status: 'error', data: null })
      }
    }
    load()

    // Takarítás: ha az url megváltozik (vagy a komponens eltűnik), a régi kérést megszakítjuk.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt((n) => n + 1)
  }

  return { ...result, retry }
}

export default useFetch
```

A `setAttempt((n) => n + 1)` egy [[frissítő függvény]]t használ: a React átadja neki az aktuális értéket, és azt tárolja
el, amit visszaad. A `{ ...result, retry }` egy új objektum, benne a `result` összes mezőjével (ez a [[spread]]), és
mellettük a `retry`-jal.

Az `App` most már meg tudja különböztetni a helyzeteket. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=6,9-10,15-17,22-25,48-52,55-61
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import useFetch from './useFetch.js'
import useDebounce from './useDebounce.js'
import ShowCard from './components/ShowCard.jsx'
import Notice from './components/Notice.jsx'
import './App.css'

const MIN_LENGTH = 2

function App() {
  const [query, setQuery] = useState('')
  // A keresés megvárja, hogy a gépelésben 400 ezredmásodperc szünet legyen.
  const text = useDebounce(query.trim(), 400)
  // Egy betűre szinte minden sorozat illene, ezért a keresés MIN_LENGTH betűtől indul.
  const tooShort = text.length < MIN_LENGTH
  const { status, data, retry } = useFetch(tooShort ? null : searchUrl(text))
  // Minden találat { score, show } alakú: csak a sorozatot tartjuk meg, a saját kis formánkban.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (text === '') message = 'Írd be egy sorozat címét, például: lighthouse, bakery vagy orbit.'
  else if (tooShort) message = 'Írj be legalább két betűt.'
  else if (status === 'loading') message = 'Keresés…'
  else if (status === 'success' && results.length > 0) message = `${results.length} találat.`

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <Notice title="A keresés nem sikerült." error>
          <button type="button" onClick={retry}>
            Újrapróbálás
          </button>
        </Notice>
      )}

      {status === 'success' && results.length === 0 && (
        <Notice title={`Nincs találat erre: „${text}”.`}>
          <p>Ellenőrizd a helyesírást, vagy próbálkozz egyetlen szóval.</p>
        </Notice>
      )}

      {status === 'success' && results.length > 0 && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
```

Az `if … else if …` sorban végignézi a feltételeket, és az első igaznál megáll: az üres mező is „túl rövid”, de mivel az
ő feltétele áll elöl, saját, barátságosabb mondatot kap. A `MIN_LENGTH` egy névvel ellátott állandó: ha egyszer három
betűt szeretnél, a keresésben elég ezt az egy számot átírnod, az üzenetben pedig a „két” szót.

:::check Ellenőrizd
Üres mező: „Írd be egy sorozat címét, például: lighthouse, bakery vagy orbit.” Egy betű, `l`: „Írj be legalább két
betűt.” Aztán `xyz`: egy szaggatott keretes doboz a „Nincs találat erre: »xyz«” címmel, alatta a tipp. A hibához állítsd egy
időre 0-ra a késleltetést (`useDebounce(query.trim(), 0)`), kattints a mezőbe, és tarts lenyomva egy betűbillentyűt két
másodpercig: 20 kérés után az API 429-cel válaszol, és megjelenik a narancssárga doboz az „Újrapróbálás” gombbal. Várj
tíz másodpercet, aztán kattints rá: a kérés újra elmegy, és ezúttal megjön a válasz (a betűsorodra valószínűleg „Nincs
találat”). Állítsd vissza a késleltetést 400-ra.
:::

:::mistake Gyakori hiba
`onClick={retry()}`, zárójellel. Amint megjelenik a hibadoboz, ez már rajzolás közben meghívja a `retry`-t, ami
állapotot változtat, ezért a React újrarajzolja az oldalt, ami megint meghívja a `retry`-t, és így tovább. Végül a React
„Too many re-renders” hibával feladja, és az oldal kiürül. A függvényt add át, ne hívd meg.
:::

### Saját oldal minden sorozatnak: útvonal-paraméter

Minden sorozatnak legyen saját oldala, saját webcímmel: az elsőnek `#/show/1`, a harminckettediknek `#/show/32`. Ilyet
az 1. leckében már csináltál a `useHashRoute`-tal: a hook visszaadja a cím `#` utáni részét, az `App` pedig ebből dönti
el, melyik oldalt rajzolja ki. A címnek most is van egy változó része, ahogy ott a projekt `slug`-ja volt: itt a sorozat
`id`-ja. Az útvonal ilyen változó részének neve is van: [[útvonal-paraméter]]. Kivágjuk a címből, és továbbadjuk az
oldalnak.

Előbb a hook. Hozd létre az `src/useHashRoute.js` fájlt, ugyanúgy, ahogy az 1. leckében:

```js file=src/useHashRoute.js
import { useEffect, useState } from 'react'

const currentPath = () => window.location.hash.slice(1) || '/'

// Visszaadja a cím # utáni részét, és frissül, ha az megváltozik.
function useHashRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    // Takarítás: ha a komponens eltűnik, ne figyeljünk tovább.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export default useHashRoute
```

Mostantól két oldal van, ezért az `App` csak választ közöttük, a keresés pedig saját komponenst kap. Egy dologra azonban
figyelni kell. Ha a keresett szöveg a keresőoldal saját állapotában maradna, azzal együtt eltűnne, amint megnyitsz egy
sorozatot: visszatérve üres lenne a mező. Ezért a `query` az `App`-ban marad, a keresőoldal pedig propként kapja meg,
egy függvénnyel együtt, amellyel módosíthatja. Ez az [[állapot felemelése]], a 3. leckéből. Hozd létre az
`src/components/SearchPage.jsx` fájlt; ez az, amit eddig az `App` rajzolt ki:

```jsx file=src/components/SearchPage.jsx mark=1-5,9-10,26,33,64
import { searchUrl, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import ShowCard from './ShowCard.jsx'
import Notice from './Notice.jsx'

const MIN_LENGTH = 2

// A keresőoldal. A keresett szöveg az App-tól jön, így egy sorozat megnézése után is megmarad.
function SearchPage({ query, onQueryChange }) {
  // A keresés megvárja, hogy a gépelésben 400 ezredmásodperc szünet legyen.
  const text = useDebounce(query.trim(), 400)
  // Egy betűre szinte minden sorozat illene, ezért a keresés MIN_LENGTH betűtől indul.
  const tooShort = text.length < MIN_LENGTH
  const { status, data, retry } = useFetch(tooShort ? null : searchUrl(text))
  // Minden találat { score, show } alakú: csak a sorozatot tartjuk meg, a saját kis formánkban.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (text === '') message = 'Írd be egy sorozat címét, például: lighthouse, bakery vagy orbit.'
  else if (tooShort) message = 'Írj be legalább két betűt.'
  else if (status === 'loading') message = 'Keresés…'
  else if (status === 'success' && results.length > 0) message = `${results.length} találat.`

  return (
    <>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <Notice title="A keresés nem sikerült." error>
          <button type="button" onClick={retry}>
            Újrapróbálás
          </button>
        </Notice>
      )}

      {status === 'success' && results.length === 0 && (
        <Notice title={`Nincs találat erre: „${text}”.`}>
          <p>Ellenőrizd a helyesírást, vagy próbálkozz egyetlen szóval.</p>
        </Notice>
      )}

      {status === 'success' && results.length > 0 && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      )}
    </>
  )
}

export default SearchPage
```

A fájl a `components` mappában van, ezért az importjai `../`-rel kezdődnek, amikor feljebb, az `src`-be nyúlnak. A
komponensnek nincs saját burkoló eleme: a `<>` és a `</>` egy [[Fragment]], amely csoportba fogja az elemeket, de semmi
pluszt nem tesz az oldalra.

A sorozat oldala egyelőre egyszerűen indul: megmutatja, melyik sorozatot kérték, és van rajta egy „← Vissza a
kereséshez” link. Két propot kap az `App`-tól: az `id`-t, vagyis az útvonal-paramétert, és a `backHref`-et, ennek a
linknek a címét. Hozd létre az `src/components/ShowPage.jsx` fájlt:

```jsx file=src/components/ShowPage.jsx
// Egy sorozat oldala, például #/show/42. Az id-t az App adja, a címből.
function ShowPage({ id, backHref }) {
  return (
    <article className="detail">
      <a className="back" href={backHref}>
        ← Vissza a kereséshez
      </a>
      <h2 className="detail__title">Sorozat #{id}</h2>
    </article>
  )
}

export default ShowPage
```

Miért kívülről kapja a link a címét? Mert az `App` tudja, hová kell visszavinnie. Egyelőre mindig a keresőoldalra
(`#/`), a haladó szinten viszont a keresésre is emlékezni fog.

A kártya linkké válik, amely a sorozata oldalára mutat. Cseréld le az `src/components/ShowCard.jsx`-et:

```jsx file=src/components/ShowCard.jsx mark=7,13
import Poster from './Poster.jsx'

// Egy találat: plakát, cím, év és műfajok.
function ShowCard({ show }) {
  return (
    <li className="card">
      <a className="card__link" href={`#/show/${show.id}`}>
        <Poster src={show.poster} />
        <h2 className="card__title">{show.name}</h2>
        <p className="card__meta">
          {show.year ?? 'Hamarosan'} · {show.genres.join(', ')}
        </p>
      </a>
    </li>
  )
}

export default ShowCard
```

Végül az `App`-ból útválasztó lesz. Cseréld le a teljes `src/App.jsx`-et:

```jsx file=src/App.jsx mark=2-4,8-9,11-13,18-22
import { useState } from 'react'
import useHashRoute from './useHashRoute.js'
import SearchPage from './components/SearchPage.jsx'
import ShowPage from './components/ShowPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  // A keresett szöveg itt él, nem a SearchPage-ben, így egy sorozat megnézése után is megmarad.
  const [query, setQuery] = useState('')

  // #/show/42 → a showId értéke '42'. A cím változó része az útvonal-paraméter.
  const showId = path.startsWith('/show/') ? path.slice('/show/'.length) : null

  return (
    <main className="app">
      <h1>Movie Search</h1>
      {showId ? (
        <ShowPage id={showId} backHref="#/" />
      ) : (
        <SearchPage query={query} onQueryChange={setQuery} />
      )}
    </main>
  )
}

export default App
```

A `startsWith` és a `slice` úgy működik, mint az 1. leckében: ha az útvonal `/show/`-val kezdődik, a `showId` a maradéka
lesz, különben `null`. Figyeld meg, hogy a `showId` szöveg (`'32'`, nem a 32-es szám): ami a címből jön, az mind szöveg.

:::check Ellenőrizd
Keress rá arra, hogy `moon`, és kattints a „Moonbase Kindergarten”-re: a cím végén `#/show/32` áll, az oldalon pedig
„Sorozat #32” és egy „← Vissza a kereséshez” link. Kattints a linkre: visszakerülsz, és a `moon` keresés is ott van még
a találataival együtt. A böngésző Vissza gombja is működik. Most írd át kézzel a címsorban a cím végét úgy, hogy
`#/show/3` legyen (a `#` után tehát `/show/3` álljon), és nyomj ++Enter++-t: „Sorozat #3”.
:::

:::mistake Gyakori hiba
A `const [query, setQuery] = useState('')` a `SearchPage`-ben marad, ahelyett, hogy átkerülne az `App`-ba. Minden
működni látszik, amíg vissza nem jössz egy sorozattól: üres a mező, a találatok eltűntek. Egy komponens állapota csak
addig él, amíg a komponens az oldalon van.
:::

:::concept És a React Router?
A nagyobb appokban az útválasztást általában egy külön csomag végzi, leggyakrabban a [[React Router]]. Vele így írnánk
le a két oldalunkat: `<Route path="/" element={<SearchPage />} />` és `<Route path="/show/:id" element={<ShowPage />} />`,
a `ShowPage`-ben pedig a `const { id } = useParams()` olvasná ki a paramétert. A mintában szereplő `:id` pontosan a mi
útvonal-paraméterünk. A React Router ezenkívül a `#` nélküli címeket is kezeli (`/show/42`), és a linkjei ilyenkor sem
töltik újra az oldalt; kezeli az oldalakba ágyazott oldalakat, és még sok mást. A mi `useHashRoute`-unk néhány sorban, új csomag nélkül végzi
el ugyanazt az alapfeladatot; ha ezt érted, a React Router is ismerősnek fog tűnni.
:::

### A sorozat oldala betölti az adatait

Most a sorozat oldala kérje le az API-tól a sorozat adatait. A végpont a `/api/tv/shows/` és utána az azonosító:
`/api/tv/shows/1`. Ha nincs ilyen azonosítójú sorozat, az API 404 Not Found választ küld. Ez más helyzet, mint egy
olyan hiba, amely elmúlhat: fölösleges újrapróbálást ajánlani, mert a sorozat attól sem kerül elő. A hooknak ezért azt is
meg kell mondania, milyen státuszkód jött vissza. Itt a teljes `src/useFetch.js`, ahogy ezentúl marad:

```js file=src/useFetch.js mark=4,6,12,17,23-25,28,32-33
import { useEffect, useState } from 'react'

// Betölti a JSON-t az url-ről, és újra betölti, valahányszor az url megváltozik.
// Ezt adja vissza: { status, data, httpStatus, retry }. A status: 'idle' (nincs url), 'loading', 'success' vagy 'error'.
function useFetch(url) {
  const [result, setResult] = useState({ status: 'idle', data: null, httpStatus: null })
  // Ha ezt a számot növeljük, a kérés megismétlődik, akkor is, ha az url ugyanaz.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!url) {
      setResult({ status: 'idle', data: null, httpStatus: null })
      return
    }

    const controller = new AbortController()
    setResult({ status: 'loading', data: null, httpStatus: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          // A szerver válaszolt, de hibakóddal (404, 429, 500…): a kódot megjegyezzük.
          setResult({ status: 'error', data: null, httpStatus: response.status })
          return
        }
        const data = await response.json()
        setResult({ status: 'success', data, httpStatus: response.status })
      } catch {
        // A lenti takarítás szakította meg: egy újabb kérés vette át a helyét, ezért csendben maradunk.
        if (controller.signal.aborted) return
        // Egyáltalán nem jött válasz, vagy nem JSON: nincs megjegyezhető kód.
        setResult({ status: 'error', data: null, httpStatus: null })
      }
    }
    load()

    // Takarítás: ha az url megváltozik (vagy a komponens eltűnik), a régi kérést megszakítjuk.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt((n) => n + 1)
  }

  return { ...result, retry }
}

export default useFetch
```

Ha a válasz nincs rendben, a kód most nem dob hibát, hanem eltárolja a státuszkódot, és kilép (`return`); a `catch`
azokra az esetekre marad, amikor egyáltalán nincs használható válasz.

Az API egy kis [[HTML]]-ként küldi a sorozat leírását: `<p>When the old keeper retires…</p>`, néha `<b>` címkékkel is.
Ha így, ahogy van, beletesszük a JSX-be, a React szövegként jeleníti meg, címkéstül. Ez szándékos: a React magától sosem
alakít szöveget HTML-lé, mert egy máshonnan érkezett szövegben kártékony szkript is lapulhat ([[XSS]]). Nekünk úgyis csak a
szöveg kell. A [[DOMParser]] a böngésző saját HTML-olvasója: dokumentumot épít a HTML-ből, közben semmit sem futtat le
belőle, a `textContent` pedig csak a szöveget adja vissza. Írj két függvényt az `src/api.js` végére:

```js file=src/api.js
// Egy sorozat adatainak címe az API-ban: showUrl('42') → '/api/tv/shows/42'
export function showUrl(id) {
  return `${API}/shows/${encodeURIComponent(id)}`
}

// Az API egy kis HTML-ként küldi a leírást (<p>, <b>). Nekünk csak a szövege kell.
export function stripHtml(html) {
  if (!html) return ''
  return new DOMParser().parseFromString(html, 'text/html').body.textContent
}
```

Az azonosító a címből jön, oda pedig bárki bármit beírhat; az `encodeURIComponent` gondoskodik róla, hogy akármi áll is
benne, az API címében egyetlen darab maradjon (egy `/` vagy egy `?` se változtassa meg a kérést).

Most jöhet maga a sorozat oldala. Cseréld le az `src/components/ShowPage.jsx`-et:

```jsx file=src/components/ShowPage.jsx mark=1-5,8,15-28,32-55
import { showUrl, stripHtml, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import Notice from './Notice.jsx'
import Poster from './Poster.jsx'

// Egy sorozat oldala, például #/show/42. Az id-t az App adja, a címből.
function ShowPage({ id, backHref }) {
  const { status, data, httpStatus, retry } = useFetch(showUrl(id))

  return (
    <article className="detail">
      <a className="back" href={backHref}>
        ← Vissza a kereséshez
      </a>

      {status === 'loading' && <p className="status">A sorozat betöltése…</p>}

      {status === 'error' && httpStatus === 404 && <Notice title="Ez a sorozat nincs a katalógusban." />}

      {status === 'error' && httpStatus !== 404 && (
        <Notice title="A sorozatot nem sikerült betölteni." error>
          <button type="button" onClick={retry}>
            Újrapróbálás
          </button>
        </Notice>
      )}

      {status === 'success' && <ShowDetails apiShow={data} />}
    </article>
  )
}

// Egy már megérkezett sorozat adatai: plakát, cím, évek, műfajok, értékelés és leírás.
function ShowDetails({ apiShow }) {
  const show = toShow(apiShow)
  const summary = stripHtml(apiShow.summary)
  // 2019–2023 egy befejezett sorozatnál, 2021– egy még futónál.
  const years = show.year ? `${show.year}–${apiShow.ended ? apiShow.ended.slice(0, 4) : ''}` : 'Hamarosan'

  return (
    <div className="detail__body">
      <div className="detail__poster">
        <Poster src={show.poster} />
      </div>
      <div className="detail__info">
        <h2 className="detail__title">{show.name}</h2>
        <p className="detail__meta">
          {years} · {show.genres.join(', ')}
        </p>
        {show.rating !== null && <p className="detail__rating">★ {show.rating} / 10</p>}
        <p className="detail__summary">{summary || 'Még nincs leírás.'}</p>
      </div>
    </div>
  )
}

export default ShowPage
```

- Az oldal két komponensből áll. A `ShowPage` a kérés állapotaival foglalkozik, és csak akkor rajzolja ki a
  `ShowDetails`-t, amikor megjöttek az adatok. Így a `ShowDetails`-nek sosem kell azon tűnődnie, megvan-e már az
  `apiShow`.
- A `ShowDetails` ugyanabban a fájlban marad, export nélkül, mert más nem használja.
- A `toShow` és a `Poster` megint jól jön: a sorozat oldala ugyanazt a kis formát és ugyanazt a plakátot használja, mint
  a kártyák.
- A `summary || 'Még nincs leírás.'`: ha a szöveg üres, a `||` a jobb oldalt adja. A leírás angol, mert az API így
  küldi.

:::check Ellenőrizd
Kattints a keresőoldalon a „Lighthouse at Lowtide”-ra: balra a plakát, mellette a cím, a „2019–2023 · Drama, Mystery”, a
„★ 8.1 / 10” és a leírás. Tedd keskenyre az ablakot: a plakát a szöveg fölé kerül. Írd át a cím végét `#/show/58`-ra:
nincs plakát, „Hamarosan · Drama, Mystery”, nincs értékelés, a leírás helyén pedig „Még nincs leírás.” És a
`#/show/999`: „Ez a sorozat nincs a katalógusban.” (A konzolban megjelenik egy piros „404 (Not Found)” sor: ez a
böngésző jelentése a válaszról, nem hiba.) Kész a középszint: commitold!
:::

:::concept Miért megy el két kérés egy oldalhoz?
Nyiss meg egy sorozatot úgy, hogy közben a Network fül látszik: ugyanarra a sorozatra két kérés megy el, és az első
„(canceled)”. Ez csak fejlesztés közben történik, a [[StrictMode]] miatt (az `<App />` körüli `<StrictMode>` az
`src/main.jsx`-ben). Minden új komponenst feltesz az oldalra, leveszi, majd újra felteszi, hogy kiderüljenek a hibák:
egy olyan effekt, amely nem takarít rendesen maga után, most kétszer végezné el a munkáját. A miénk jól viselkedik: az első kérést a
takarítás megszakítja, a második átmegy. A kész, lefordított appban (`npm run build`) csak egy kérés van.
:::

:::mistake Gyakori hiba
`<p className="detail__summary">{apiShow.summary}</p>`, `stripHtml` nélkül. A leírás ilyenkor a címkéivel együtt jelenik
meg: `<p>When the old keeper retires…</p>`.
:::

:::try Feladat
Az API a sorozat szereplőit is el tudja küldeni: kérd a `showUrl(id) + '?embed[]=cast'` címet. A szereplők ilyenkor az
`apiShow._embedded.cast` tömbben vannak, `{ person, character }` alakú objektumokként (nézd meg őket a Network fülön).
Mutasd meg az első hatot a leírás alatt: a színész nevét (`person.name`) és a szerepét (`character.name`).
:::

## Haladó szint {level=3}

### A keresés a címsorban

Keress valamire, aztán nyomj ++F5++-öt: a keresés eltűnt. Ha a címet elküldöd egy barátodnak, ő is üres keresőt kap.
Tegyük bele a keresést a címbe, ahogy a legtöbb keresőoldal teszi: `#/?q=moon`. Így újratöltés után is megmarad, a cím
megosztható, a sorozat oldala pedig emlékezni tud arra, melyik keresésből nyitották meg.

A `?q=moon` rész egy query string, pont olyan, mint az API címeiben, csak most a `#` után. A 15. leckében az
[[URLSearchParams]] rakott össze egy ilyet, de szét is tud szedni egyet: objektumot készít belőle, amelynek a `get('q')`
[[metódus]]a (vagyis az objektumhoz tartozó függvénye) visszaadja a `q` értékét (már visszaalakítva), vagy `null`-t, ha
nincs ilyen.

Gépelés közben változnia kell a címnek, de úgy, hogy ne kerüljön minden betű külön bejegyzésként a böngésző előzményei
közé: erre a 6. és a 7. leckéből ismert [[history.replaceState]] való. Van azonban egy bökkenő: a `replaceState` nem
vált ki `hashchange` eseményt, így a hookunk észre sem venné a változást. A megoldás: kiváltjuk mi magunk. A
`window.dispatchEvent(new HashChangeEvent('hashchange'))` egy `hashchange` eseményt készít, és minden figyelő megkapja,
pontosan úgy, mintha a böngésző küldte volna.

Itt a teljes `src/useHashRoute.js`. A hook mostantól két dolgot ad vissza, és három kis segédfüggvény kerül mellé:

```js file=src/useHashRoute.js mark=3,5,7,10,16-17,19-35
import { useEffect, useState } from 'react'

const currentHash = () => window.location.hash.slice(1) || '/'

// Visszaadja a cím # utáni részét, két darabban: '#/show/3?q=moon' → path '/show/3', params q=moon.
function useHashRoute() {
  const [hash, setHash] = useState(currentHash)

  useEffect(() => {
    const onChange = () => setHash(currentHash())
    window.addEventListener('hashchange', onChange)
    // Takarítás: ha a komponens eltűnik, ne figyeljünk tovább.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const [path, search = ''] = hash.split('?')
  return { path, params: new URLSearchParams(search) }
}

// Új előzménybejegyzés nélkül írja át a címet: a gépelés ne töltse tele az előzményeket (és a Vissza gombot).
export function replaceHash(newHash) {
  history.replaceState(null, '', newHash)
  // A replaceState nem vált ki hashchange eseményt, ezért mi váltjuk ki: a useHashRoute erre figyel.
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

// '#/?q=moon': a keresőoldal, benne ezzel a kereséssel.
export function searchHash(query) {
  return query ? `#/?q=${encodeURIComponent(query)}` : '#/'
}

// '#/show/3?q=moon': egy sorozat oldala, amely emlékszik a keresésre, ahonnan megnyitották.
export function showHash(id, query) {
  return query ? `#/show/${id}?q=${encodeURIComponent(query)}` : `#/show/${id}`
}

export default useHashRoute
```

A `hash.split('?')` a `?`-nél kettévágja a szöveget. Ha nincs benne `?`, csak egy darab lesz, így a `search` az
alapértékét kapja, az üres szöveget: ez egy alapérték a [[destrukturálás]]ban.

Az `App` már nem tartja állapotban a keresést: a címből olvassa ki, gépeléskor pedig a címet írja át. A keresésnek
mostantól a cím az [[egyetlen igazságforrás]]a. Cseréld le az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,7-9,14-17,22,24
import useHashRoute, { replaceHash, searchHash } from './useHashRoute.js'
import SearchPage from './components/SearchPage.jsx'
import ShowPage from './components/ShowPage.jsx'
import './App.css'

function App() {
  const { path, params } = useHashRoute()
  // A keresés a címben van (#/?q=moon), ezért nem kell hozzá saját állapot.
  const query = params.get('q') ?? ''

  // #/show/42 → a showId értéke '42'. A cím változó része az útvonal-paraméter.
  const showId = path.startsWith('/show/') ? path.slice('/show/'.length) : null

  function changeQuery(newQuery) {
    replaceHash(searchHash(newQuery))
  }

  return (
    <main className="app">
      <h1>Movie Search</h1>
      {showId ? (
        <ShowPage id={showId} backHref={searchHash(query)} />
      ) : (
        <SearchPage query={query} onQueryChange={changeQuery} />
      )}
    </main>
  )
}

export default App
```

A `useState` eltűnt az importok közül: az `App`-nak nem maradt állapota. A „← Vissza a kereséshez” link most arra a
keresésre visz vissza, ahonnan jöttél, mert a kártya linkje magával viszi a keresést. Cseréld le az
`src/components/ShowCard.jsx`-et: a kártya új propként megkapja a keresést (`query`), és a `showHash`-sel rakja össze a
linkjét:

```jsx file=src/components/ShowCard.jsx mark=1,4-5,8
import { showHash } from '../useHashRoute.js'
import Poster from './Poster.jsx'

// Egy találat: plakát, cím, év és műfajok. A query: a keresés, amellyel megtaláltuk (ha van ilyen).
function ShowCard({ show, query }) {
  return (
    <li className="card">
      <a className="card__link" href={showHash(show.id, query)}>
        <Poster src={show.poster} />
        <h2 className="card__title">{show.name}</h2>
        <p className="card__meta">
          {show.year ?? 'Hamarosan'} · {show.genres.join(', ')}
        </p>
      </a>
    </li>
  )
}

export default ShowCard
```

A keresőoldal továbbadja a `query`-t a kártyáknak. Az `src/components/SearchPage.jsx`-ben csak a `ShowCard` sorát írd
át:

```jsx file=src/components/SearchPage.jsx mark=4
      {status === 'success' && results.length > 0 && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} query={query} />
          ))}
        </ul>
      )}
```

:::check Ellenőrizd
Keress rá arra, hogy `moon`: a cím végén `#/?q=moon` áll, és gépelés közben változik. Nyomj ++F5++-öt: a keresés és a
találatai megmaradnak. Kattints a „Moonbase Kindergarten” kártyájára: a cím `#/show/32?q=moon`. A „← Vissza a kereséshez” a `moon` kereséshez
visz vissza. Másold át a címet egy új lapra: ugyanez az oldal nyílik meg. A böngésző Vissza gombja pedig nem lépked
visszafelé betűnként végig azon, amit begépeltél.
:::

:::mistake Gyakori hiba
`window.location.hash = searchHash(newQuery)` a `replaceHash` helyett. Működik, még a külön eseményre sincs szükség, de
minden betű új bejegyzés lesz az előzményekben: miután beírtad, hogy „lighthouse”, tízszer kell a Vissza gombot nyomnod,
hogy visszajuss az üres keresőmezőhöz.
:::

### Szűrők: műfaj és évtized

Ha sok a találat, jól jön, ha szűkíteni lehet őket. Két szűrő kerül a kártyák fölé: gombok a műfajokhoz, és egy
legördülő lista a bemutató évtizedéhez. A választható lehetőségek magukból a találatokból jönnek: csak azok a műfajok és
évtizedek, amelyek tényleg előfordulnak bennük.

- A `flatMap`, amelyet a 11. leckében a címkékhez használtál, olyan, mint a `map`, de ha a függvény minden elemre egy
  tömböt ad vissza, ezekből egyetlen lapos listát készít. Három sorozat két-két műfajjal egy hatelemű tömböt ad, nem három kis tömböt: ez a [[flatMap]].
- A 3. leckéből ismert [[Set]] minden értéket csak egyszer tart meg. A `[...new Set(lista)]` a [[spread]] segítségével
  tömbbé alakítja vissza: így kapjuk meg a műfajokat ismétlődés nélkül.
- A `sort()` ábécérendbe teszi a szövegeket, és ha nem adunk neki mást, a számokat is szövegként hasonlítja össze. Itt
  a legújabb évtized kerüljön előre, ezért [[összehasonlító függvény]]t adunk neki: a `(a, b) => b - a` a nagyobb számot
  teszi előre.

A szűrők és alattuk a rács egy új komponensbe kerülnek. Hozd létre az `src/components/Results.jsx` fájlt:

```jsx file=src/components/Results.jsx
import { useState } from 'react'
import ShowCard from './ShowCard.jsx'

// 2017 → 2010: az évtized első éve.
function decadeOf(year) {
  return Math.floor(year / 10) * 10
}

// A találatok, két szűrővel. A SearchPage minden kereséshez új key-t ad neki,
// így a szűrők minden alkalommal alapállásból („Minden műfaj”, „Bármikor”) indulnak.
function Results({ shows, query }) {
  const [genre, setGenre] = useState('') // '' = minden műfaj
  const [decade, setDecade] = useState('') // '' = bármikor

  // Származtatott értékek: a választható lehetőségek magukból a találatokból jönnek.
  const genres = [...new Set(shows.flatMap((show) => show.genres))].sort()
  const years = shows.filter((show) => show.year !== null).map((show) => show.year)
  const decades = [...new Set(years.map(decadeOf))].sort((a, b) => b - a)

  const visible = shows.filter((show) => {
    if (genre !== '' && !show.genres.includes(genre)) return false
    if (decade !== '' && (show.year === null || decadeOf(show.year) !== Number(decade))) return false
    return true
  })

  return (
    <>
      <div className="filters">
        <div className="filters__genres" role="group" aria-label="Műfajok">
          <button type="button" className="chip" aria-pressed={genre === ''} onClick={() => setGenre('')}>
            Minden műfaj
          </button>
          {genres.map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={genre === name}
              onClick={() => setGenre(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <label className="filters__decade">
          <span>Bemutató</span>
          <select value={decade} onChange={(event) => setDecade(event.target.value)}>
            <option value="">Bármikor</option>
            {decades.map((start) => (
              <option key={start} value={start}>
                {start}–{start + 9}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="status">Ezekkel a szűrőkkel nincs találat.</p>
      ) : (
        <ul className="grid">
          {visible.map((show) => (
            <ShowCard key={show.id} show={show} query={query} />
          ))}
        </ul>
      )}
    </>
  )
}

export default Results
```

- A `genres`, a `decades` és a `visible` származtatott érték: minden rajzoláskor a találatokból és a két szűrőből
  számoljuk ki őket.
- A bemutatási év nélküli sorozatnak (`null`) nincs évtizede, ezért csak akkor látszik, ha az évtizedszűrő „Bármikor”
  állásban van.
- A `<select>` egy [[legördülő lista]], és vezérelt mező: a `value` értékét az állapotból kapja. Az értéke mindig szöveg
  (`'2010'`), ezért a `Number(decade)` számmá alakítja az összehasonlítás előtt.
- Az [[aria-pressed]] elárulja a képernyőolvasóknak, melyik műfajgomb van bekapcsolva, és a CSS is ez alapján színezi. A
  `role="group"` az `aria-label`-lel együtt nevet ad a gombok csoportjának.
- A `{start}–{start + 9}` azt írja ki, hogy „2010–2019”: az évtizedet évszámokkal adja meg, ami minden nyelven
  ugyanúgy olvasható. A műfajok neve angol, ahogy az API küldi.

A keresőoldalon a rács helyére a `Results` kerül. Minden új keresés „Minden műfaj” és „Bármikor” állásból induljon. A
`key={text}` ezt biztosra is veszi, a 3. leckéből ismert trükkel: ha egy komponens [[key]]-je megváltozik, a React
vadonatúj komponensnek tekinti, friss állapottal. (Amíg a következő keresés töltődik, a `Results` egyáltalán nincs az
oldalon, így most a kulcs nélkül is elveszne az állapota. A kulcs akkor is működik, ha egyszer úgy alakítod át az
oldalt, hogy új keresés közben is látszódjanak a régi kártyák.) Itt a teljes `src/components/SearchPage.jsx`:

```jsx file=src/components/SearchPage.jsx mark=5,57
import { searchUrl, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import Notice from './Notice.jsx'
import Results from './Results.jsx'

const MIN_LENGTH = 2

// A keresőoldal. A keresett szöveg az App-tól jön, így egy sorozat megnézése után is megmarad.
function SearchPage({ query, onQueryChange }) {
  // A keresés megvárja, hogy a gépelésben 400 ezredmásodperc szünet legyen.
  const text = useDebounce(query.trim(), 400)
  // Egy betűre szinte minden sorozat illene, ezért a keresés MIN_LENGTH betűtől indul.
  const tooShort = text.length < MIN_LENGTH
  const { status, data, retry } = useFetch(tooShort ? null : searchUrl(text))
  // Minden találat { score, show } alakú: csak a sorozatot tartjuk meg, a saját kis formánkban.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (text === '') message = 'Írd be egy sorozat címét, például: lighthouse, bakery vagy orbit.'
  else if (tooShort) message = 'Írj be legalább két betűt.'
  else if (status === 'loading') message = 'Keresés…'
  else if (status === 'success' && results.length > 0) message = `${results.length} találat.`

  return (
    <>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <Notice title="A keresés nem sikerült." error>
          <button type="button" onClick={retry}>
            Újrapróbálás
          </button>
        </Notice>
      )}

      {status === 'success' && results.length === 0 && (
        <Notice title={`Nincs találat erre: „${text}”.`}>
          <p>Ellenőrizd a helyesírást, vagy próbálkozz egyetlen szóval.</p>
        </Notice>
      )}

      {status === 'success' && results.length > 0 && <Results key={text} shows={results} query={query} />}
    </>
  )
}

export default SearchPage
```

A `ShowCard` importja átköltözött a `Results`-ba, ezért innen eltűnt.

:::check Ellenőrizd
Keress rá arra, hogy `the`: tíz találat, fölöttük egy sor műfajgomb, amelyek közül a „Minden műfaj” világít, mellettük
pedig a „Bemutató” lista. Kattints a „Mystery”-re: négy sorozat marad. Válaszd a listában a „2010–2019”-et: kettő marad,
a „The Seventh Satellite” és a „The Clockmaker of Pell Street”. Most keress rá arra, hogy `comedy`: a szűrők
visszaálltak „Minden műfaj” és „Bármikor” állásba.
:::

:::mistake Gyakori hiba
A két szűrőállapot (`genre`, `decade`) a `Results` helyett a `SearchPage`-be kerül, és propként adod át őket a
`Results`-nak. A `SearchPage` az egyik keresésről a másikra is az oldalon marad, így a szűrők is megmaradnak. Válaszd a
`the` keresésnél a „Mystery”-t, aztán keress rá arra, hogy `bakery`, és az oldal azt írja: „Ezekkel a szűrőkkel nincs
találat”, pedig van találat. A „Mystery” gomb ott sincs, hogy kikapcsold, mert a „Three A.M. Bakery”-nek nincs ilyen
műfaja. Az egy kereséshez tartozó állapot abban a komponensben a helye, amelyet a `key` újraindít.
:::

:::try Feladat
Kerüljenek a szűrők is a címbe, ahogy a keresés: `#/?q=the&genre=Mystery`. A `params.get('genre')` kiolvassa. Ha több
értéket kell a címbe írnod, az `URLSearchParams` segíthet: a `new URLSearchParams({ q: 'the', genre: 'Mystery' }).toString()` eredménye
`'q=the&genre=Mystery'`.
:::

### Kedvencek

A sorozatokat, amelyek tetszenek, érdemes megjegyezni: egy csillag minden kártya sarkában, és egy „Kedvencek” oldal a
megcsillagozottakkal. A kedvenceknek túl kell élniük az újratöltést, ezért a [[localStorage]]-ba kerülnek, a 6. és a 9.
leckében megírt `useLocalStorage` hookkal. Sok komponensnek van rájuk szüksége: a kártyáknak (be van-e kapcsolva a csillag?), a
kedvencek oldalának és a menünek, amely kiírja, hány van belőlük. Ha minden komponensen át lefelé adogatnánk őket, az
[[prop drilling]] lenne; ez a [[Context]] dolga, ahogy a 2. leckében.

Előbb a hook. Ugyanúgy működik, mint a 6. és a 9. leckében, a mentett érték beolvasása pedig a 6. lecke mintájára egy
külön kis függvényben, a `readValue`-ban van. Hozd létre az `src/useLocalStorage.js` fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Beolvassa a kulcs alatt mentett értéket. Ha nincs ott semmi, vagy nem olvasható, a kezdőértéket adja.
function readValue(key, initialValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Letiltott tároló vagy hibás JSON: a kezdőértékkel indulunk.
  }
  return initialValue
}

// Úgy működik, mint a useState, de az érték túléli az újratöltést.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue))

  // Minden változás után elmentjük, szövegként.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Tele a tároló, vagy le van tiltva: az app a memóriában tovább működik.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

Aztán a Context, ugyanúgy felépítve, mint a 2. lecke `ThemeContext`-je. Hozd létre az `src/FavoritesContext.jsx` fájlt:

```jsx file=src/FavoritesContext.jsx
import { createContext, useContext } from 'react'
import useLocalStorage from './useLocalStorage.js'

const FavoritesContext = createContext(null)

// Megőrzi a kedvenc sorozatokat (a localStorage-ban), és megosztja őket minden benne lévő komponenssel.
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage('movie-search:favorites', [])

  function isFavorite(id) {
    return favorites.some((show) => show.id === id)
  }

  function toggleFavorite(show) {
    if (isFavorite(show.id)) {
      // Új tömb, ennek a sorozatnak a kihagyásával.
      setFavorites(favorites.filter((item) => item.id !== show.id))
    } else {
      // Új tömb: elöl az új kedvenc, mögötte a régiek.
      setFavorites([show, ...favorites])
    }
  }

  return <FavoritesContext value={{ favorites, isFavorite, toggleFavorite }}>{children}</FavoritesContext>
}

// A FavoritesProvideren belül bármelyik komponens ezzel a hookkal olvassa ki a kedvenceket.
export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('A useFavorites csak a <FavoritesProvider>-en belül használható')
  return value
}
```

- Egy kedvenc az a kis objektum, amelyet a `toShow` készít (`id`, `name`, `poster`, `year`, `genres`, `rating`). Minden
  benne van, ami egy kártyához kell, így a kedvencek oldala egyetlen kérés nélkül ki tudja rajzolni a kártyákat.
- A `some` akkor ad `true`-t, ha legalább egy elem átmegy a próbán: itt, ha valamelyik kedvencnek ez az `id`-ja.
- Az állapotot sosem módosítjuk helyben: a `filter` és a `[show, ...favorites]` is új tömböt készít.
- Ahogy a 2. lecke `ThemeContext.jsx`-jénél, a terminál itt is kiírhatja, hogy „Could not Fast Refresh”, ha módosítod a
  fájlt, mert egy komponens mellett egy hookot is exportál. Nincs semmi baj: a Vite egyszerűen újratölti az oldalt.

Az egész app a Provider belsejébe kerül, az `src/main.jsx`-ben (a kiinduló projekt angol megjegyzései maradhatnak):

```jsx file=src/main.jsx mark=5,15-17
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FavoritesProvider } from './FavoritesContext.jsx'
import { startMockApi } from './mocks/msw.js'
import { handlers } from './mocks/handlers.js'

// First the pretend TV API starts (see src/mocks), so even the very first fetch('/api/tv/…') gets an answer.
await startMockApi(handlers)

// Then React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  </StrictMode>,
)
```

A kártya megkapja a csillagát. Cseréld le az `src/components/ShowCard.jsx`-et:

```jsx file=src/components/ShowCard.jsx mark=1,7-9,19-27
import { useFavorites } from '../FavoritesContext.jsx'
import { showHash } from '../useHashRoute.js'
import Poster from './Poster.jsx'

// Egy találat: plakát, cím, év és műfajok. A query: a keresés, amellyel megtaláltuk (ha van ilyen).
function ShowCard({ show, query }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const saved = isFavorite(show.id)

  return (
    <li className="card">
      <a className="card__link" href={showHash(show.id, query)}>
        <Poster src={show.poster} />
        <h2 className="card__title">{show.name}</h2>
        <p className="card__meta">
          {show.year ?? 'Hamarosan'} · {show.genres.join(', ')}
        </p>
      </a>
      <button
        type="button"
        className="card__star"
        aria-pressed={saved}
        aria-label={`Kedvenc: ${show.name}`}
        onClick={() => toggleFavorite(show)}
      >
        {saved ? '★' : '☆'}
      </button>
    </li>
  )
}

export default ShowCard
```

A csillag önálló gomb a link mellett, nem benne: egy linkbe tett gomb egyszerre két kattintható dolog lenne, és a
képernyőolvasók nem tudnák szétválasztani őket. A CSS a plakát jobb felső sarkába teszi. Az [[aria-label]]-je ugyanaz,
akár be van kapcsolva, akár nincs; azt, hogy melyik állapotban van, az `aria-pressed` mondja meg.

A kedvencek oldala a Contextből olvassa ki a listát. Hozd létre az `src/components/FavoritesPage.jsx` fájlt:

```jsx file=src/components/FavoritesPage.jsx
import { useFavorites } from '../FavoritesContext.jsx'
import Notice from './Notice.jsx'
import ShowCard from './ShowCard.jsx'

// #/favorites: a megcsillagozott sorozatok, egyenesen a localStorage-ból, egyetlen kérés nélkül.
function FavoritesPage() {
  const { favorites } = useFavorites()

  if (favorites.length === 0) {
    return (
      <Notice title="Még nincs kedvenced.">
        <p>Egy sorozat csillagára kattintva ide mentheted.</p>
      </Notice>
    )
  }

  return (
    <ul className="grid">
      {favorites.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </ul>
  )
}

export default FavoritesPage
```

Az `App` egy harmadik oldalt és egy menüt kap. Három oldalnál egy `let` és egy `if … else if` könnyebben olvasható, mint
az egymásba ágyazott `? :`. Cseréld le az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,3,10,16,22-26,30-38
import { useFavorites } from './FavoritesContext.jsx'
import useHashRoute, { replaceHash, searchHash } from './useHashRoute.js'
import FavoritesPage from './components/FavoritesPage.jsx'
import SearchPage from './components/SearchPage.jsx'
import ShowPage from './components/ShowPage.jsx'
import './App.css'

function App() {
  const { path, params } = useHashRoute()
  const { favorites } = useFavorites()
  // A keresés a címben van (#/?q=moon), ezért nem kell hozzá saját állapot.
  const query = params.get('q') ?? ''

  // #/show/42 → a showId értéke '42'. A cím változó része az útvonal-paraméter.
  const showId = path.startsWith('/show/') ? path.slice('/show/'.length) : null
  const onFavorites = path === '/favorites'

  function changeQuery(newQuery) {
    replaceHash(searchHash(newQuery))
  }

  let page
  if (showId) page = <ShowPage id={showId} backHref={searchHash(query)} />
  else if (onFavorites) page = <FavoritesPage />
  else page = <SearchPage query={query} onQueryChange={changeQuery} />

  return (
    <main className="app">
      <h1>Movie Search</h1>
      <nav className="nav" aria-label="Oldalak">
        <a href={searchHash(query)} aria-current={!showId && !onFavorites ? 'page' : undefined}>
          Keresés
        </a>
        <a href="#/favorites" aria-current={onFavorites ? 'page' : undefined}>
          Kedvencek <span className="nav__count">{favorites.length}</span>
        </a>
      </nav>
      {page}
    </main>
  )
}

export default App
```

Az [[aria-current]] `'page'` értékkel annak az oldalnak a menüpontját jelöli meg, amelyen éppen vagy: a képernyőolvasók
azt mondják rá, hogy „aktuális oldal”, a CSS pedig aláhúzza. Egy sorozat oldalán egyik menüpont sincs megjelölve. Ahogy
a `page` mutatja, a JSX-et változóban is el lehet tárolni, mint bármilyen más értéket.

:::check Ellenőrizd
Keress rá arra, hogy `bakery`, és kattints a kártya sarkában lévő ☆-ra: teli ★ lesz belőle, a „Kedvencek” melletti szám
pedig 1-re nő. Kattints a „Kedvencek”-re: ott a kártya. Nyomj ++F5++-öt: még mindig ott van. Kattints a csillagára: a
kártya eltűnik, az oldal pedig azt írja: „Még nincs kedvenced.” A fejlesztői eszközökben (Application → Local Storage)
a `movie-search:favorites` kulcs alatt szövegként ott a lista.
:::

:::mistake Gyakori hiba
„A useFavorites csak a `<FavoritesProvider>`-en belül használható” a konzolban, és üres oldal: a `main.jsx` még mindig
Provider nélkül rajzolja ki az `<App />`-ot. A hibaüzenet a sajátunk, a `useFavorites`-ből.
:::

:::try Feladat
Kerüljön egy „☆ Mentés a kedvencek közé” gomb a sorozat oldalára is, az értékelés alá. A `ShowDetails`-ben már megvan a
kis `show` objektum: hívd meg benne a `useFavorites()`-t, kattintásra pedig a `toggleFavorite(show)`-t. A felirat
követheti az állapotot: „★ Elmentve”, ha az `isFavorite(show.id)` igaz.
:::

### A teljes katalógus, oldalanként

Ha üres a keresőmező, az oldal mutathatná az összes sorozatot, böngészésre. Hatvan van belőlük, egy igazi katalógusban
viszont ezrek is lehetnek, ezért az API-k nem küldenek el mindent egyszerre: oldalanként adják. Ez a [[lapozás]]. A
sorozat-API-nak is van erre végpontja: a `/api/tv/shows?page=1` az első 40 sorozatot adja, a `?page=2` a következő
40-et, és így tovább; az utolsó oldal után 404 a válasz.

A képernyőn az első oldallal kezdünk, a „Továbbiak betöltése” gomb pedig alá teszi a következőt. Erre van egy elegáns
React-megoldás: minden oldal külön komponens, saját kéréssel. A szülő csak azt számolja, hány oldal van nyitva, és annyi
oldalkomponenst rajzol ki. Egy új oldal megnyitása mindössze egy `setPageCount(pageCount + 1)`; a már nyitott oldalak
megtartják az adataikat, és nem kérdeznek újra.

Honnan tudjuk, hogy nincs több? Ha egy oldalon 40-nél kevesebb sorozat érkezik, az volt az utolsó. Az oldalméret és az
oldalak címét előállító függvény az `src/api.js` végére kerül:

```js file=src/api.js
// Az API ennyi sorozatból álló oldalakban küldi a teljes katalógust.
export const PAGE_SIZE = 40

// A teljes katalógus egy oldalának címe: pageUrl(2) → '/api/tv/shows?page=2'
export function pageUrl(page) {
  return `${API}/shows?page=${page}`
}
```

Hozd létre az `src/components/BrowseAll.jsx` fájlt:

```jsx file=src/components/BrowseAll.jsx
import { useState } from 'react'
import { PAGE_SIZE, pageUrl, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import Notice from './Notice.jsx'
import ShowCard from './ShowCard.jsx'

// A katalógus egy oldala, saját kéréssel. Az utolsó nyitott oldal a „Továbbiak betöltése” gombot is megkapja.
function BrowsePage({ page, isLast, onLoadMore }) {
  const { status, data, retry } = useFetch(pageUrl(page))

  if (status === 'error') {
    return (
      <Notice title="A lista nem töltődött be." error>
        <button type="button" onClick={retry}>
          Újrapróbálás
        </button>
      </Notice>
    )
  }
  if (status !== 'success') {
    return <p className="status">Betöltés…</p>
  }

  return (
    <>
      <ul className="grid">
        {data.map((apiShow) => (
          <ShowCard key={apiShow.id} show={toShow(apiShow)} />
        ))}
      </ul>
      {/* Ha tele van az oldal, utána még jöhet több. */}
      {isLast && data.length === PAGE_SIZE && (
        <button type="button" className="more" onClick={onLoadMore}>
          Továbbiak betöltése
        </button>
      )}
    </>
  )
}

// A teljes katalógus: először egy oldal, aztán minden „Továbbiak betöltése” kattintásra még egy.
function BrowseAll() {
  const [pageCount, setPageCount] = useState(1)
  // [1, 2, …, pageCount]: a nyitott oldalak sorszámai.
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <section className="browse" aria-labelledby="browse-title">
      <h2 id="browse-title" className="browse__title">
        Minden sorozat
      </h2>
      {pages.map((page) => (
        <BrowsePage
          key={page}
          page={page}
          isLast={page === pageCount}
          onLoadMore={() => setPageCount(pageCount + 1)}
        />
      ))}
    </section>
  )
}

export default BrowseAll
```

- Az `Array.from({ length: pageCount }, …)` egy `pageCount` elemű tömböt készít, minden elemét a függvény állítja elő:
  megkapja az elem helyét (`index`, 0-tól számolva), és az `index + 1`-et adja vissza. Az első paraméter, maga az elem,
  itt üres; a `_` a szokásos neve egy olyan paraméternek, amelyet nem használunk.
- Az oldal sorszáma a `key`: a 2. oldal mindig a 2. oldal marad, így a React sosem keveri össze az oldalak adatait.
- A `{/* … */}` a JSX-en belüli megjegyzés formája.
- Az `aria-labelledby` nevet ad a szakasznak: annak az elemnek a szövegét, amelynek az `id`-jára hivatkozik, itt a
  „Minden sorozat” címet.

A keresőoldalon a lista az üres mezőhöz tartozó tipp helyére kerül. Itt a teljes `src/components/SearchPage.jsx`, ahogy
végleg marad:

```jsx file=src/components/SearchPage.jsx mark=4,21,43-44
import { searchUrl, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import BrowseAll from './BrowseAll.jsx'
import Notice from './Notice.jsx'
import Results from './Results.jsx'

const MIN_LENGTH = 2

// A keresőoldal. A keresett szöveg az App-tól jön, így egy sorozat megnézése után is megmarad.
function SearchPage({ query, onQueryChange }) {
  // A keresés megvárja, hogy a gépelésben 400 ezredmásodperc szünet legyen.
  const text = useDebounce(query.trim(), 400)
  // Egy betűre szinte minden sorozat illene, ezért a keresés MIN_LENGTH betűtől indul.
  const tooShort = text.length < MIN_LENGTH
  const { status, data, retry } = useFetch(tooShort ? null : searchUrl(text))
  // Minden találat { score, show } alakú: csak a sorozatot tartjuk meg, a saját kis formánkban.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (text !== '' && tooShort) message = 'Írj be legalább két betűt.'
  else if (status === 'loading') message = 'Keresés…'
  else if (status === 'success' && results.length > 0) message = `${results.length} találat.`

  return (
    <>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Sorozat keresése</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="pl. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {text === '' && <BrowseAll />}

      {status === 'error' && (
        <Notice title="A keresés nem sikerült." error>
          <button type="button" onClick={retry}>
            Újrapróbálás
          </button>
        </Notice>
      )}

      {status === 'success' && results.length === 0 && (
        <Notice title={`Nincs találat erre: „${text}”.`}>
          <p>Ellenőrizd a helyesírást, vagy próbálkozz egyetlen szóval.</p>
        </Notice>
      )}

      {status === 'success' && results.length > 0 && <Results key={text} shows={results} query={query} />}
    </>
  )
}

export default SearchPage
```

Az üres mezőhöz már nem tartozik üzenet, hiszen ott a katalógus: az `if … else if` lánc első sora eltűnt, a „két betű”
mondathoz pedig most az is kell, hogy a szöveg ne legyen üres (`&&`: mindkét feltételnek igaznak kell lennie).

:::check Ellenőrizd
Ürítsd ki a keresőmezőt: alatta a „MINDEN SOROZAT” felirat és 40 kártya látszik. Legalul ott a „Továbbiak betöltése”
gomb. Kattints rá: az első 40 alatt megjelenik még 20 kártya, a gomb pedig eltűnik, mert a második oldal nem volt tele.
Írd a Network fül szűrőmezőjébe, hogy `page=`: ott a `shows?page=1` és a `shows?page=2` kérés. Fejlesztés közben a
StrictMode miatt mindkettő kétszer szerepel, és az első példány „(canceled)”, ahogy a sorozat oldalánál. Írj be egy
keresést: a katalógus átadja a helyét a
találatoknak. Ürítsd ki újra a mezőt: visszajön az 1. oldal. Gratulálok, kész a sorozatkeresőd!
:::

:::mistake Gyakori hiba
Kimarad az `isLast &&`. Ekkor minden tele oldal saját gombot kap: az első kattintás után a „Továbbiak betöltése” gomb
ott marad, ahol volt, az első és a második oldal között. Ha újra rákattintasz, egy harmadik oldalt kér, ami nem létezik:
az API 404-gyel válaszol, és alul megjelenik egy hibadoboz.
:::

:::concept Honnan tudja egy igazi app, hogy nincs több oldal?
A „40-nél kevesebb, tehát vége” jó tipp, de ha a katalógusban pontosan 80 sorozat lenne, a második oldal is tele lenne,
és a gomb egy nem létező harmadik oldalt kérne (404). Az API-k ezt általában a válasz fejléceiben árulják el. A miénk
`X-Total-Count: 60` fejlécet küld, vagyis az összes sorozat számát, és az utolsó kivételével minden oldalon egy `Link`
fejlécet a következő oldal címével (Network fül → kattints a kérésre → Headers). Kódból a
`response.headers.get('X-Total-Count')` olvassa ki őket; ehhez a `useFetch`-nek a `data` mellett ezeket is vissza
kellene adnia.
:::

:::try Feladat
Alakítsd át a gombot [[végtelen görgetés]]sé, ahogy a 12. leckében: a gomb helyett tegyél egy [[őrszem]] elemet az
utolsó oldal alá (például `<p className="status">Továbbiak betöltése…</p>`, egy `useRef`-fel), figyeld egy effektben egy
[[IntersectionObserver]]-rel, és hívd meg az `onLoadMore()`-t, amikor a képernyőre ér. Az új hookok a `BrowsePage`
elejére kerülnek, a korai visszatérések elé (a [[hookok szabálya]] miatt), és a takarítást se felejtsd el:
`observer.disconnect()`.
:::
