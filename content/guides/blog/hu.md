# Mit építünk?

Saját blogot, „The Peacock Journal” néven: bejegyzések listáját, minden bejegyzésnek külön oldalt és egy
szerkesztőt, ahol [[Markdownban|Markdown]] írhatsz új bejegyzéseket, átírhatod és törölheted őket. A bejegyzések egy kis
adatbázissal működő álszerveren élnek, így amit ma megírsz, holnap is ott lesz. A haladó szinten a blog felnő: a
szerzők bejelentkeznek, az olvasók kommentelnek, a bejegyzések címkéket kapnak, a lista keresőt, és minden oldal
elmondja a keresőmotoroknak, miről szól.

Közben megtanulod, hogyan mutat egyetlen React-app több oldalt (routing), hogyan hoz létre, olvas, módosít és töröl
adatot egy szerveren, hogyan lesz a Markdown-szövegből cím, lista és link úgy, hogy közben ne nyiss kaput a
támadásoknak, és hogyan szolgálhatja ki ugyanaz az űrlap az írást és a szerkesztést is.

:::levels
- Bejegyzések listája az álszerverről és minden bejegyzésnek saját oldal. | kb. 2 óra
- Bejegyzések írása, szerkesztése, törlése és Markdown, amelyből cím, lista, kód és link lesz. | kb. 3 óra
- Bejelentkező szerzők, kommentek, címkék, kereső és minden oldalnak saját cím és leírás (SEO). | kb. 4 óra
:::

**Előismeret:** az eddigi leckék, legfőképp a 14., a „Currency Converter” (`fetch`, betöltés- és hibaállapot,
`useFetch`), a 22., a „Multi-Step Form” (űrlapok ellenőrzéssel, az álszerver a `fakeApi.js`-ben) és a 23., a „Fan
Wiki” (saját hash-router). A 11. lecke Markdown-előnézete is visszatér, bővebb változatban. Amit újra felhasználunk,
azt néhány mondatban felidézzük, minden újat pedig lépésről lépésre elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Ennek a leckének a kiinduló projektje a kurzus GitHub-repójában a `lessons/26-blog/exercise` mappa (a fenti „Feladat
a GitHubon” gomb ezt nyitja meg). Ugyanúgy szerzed meg, mint a korábbi leckékben; az 1. lecke minden lépést
részletesen elmagyaráz. A terminálban, a munkamappádban (abban, amelyikben a `rika-mentoring` mappa van):

```shell
cd rika-mentoring
git pull        # lehozza a repóba az új leckéket
cd ..
cp -r rika-mentoring/lessons/26-blog/exercise peacock-journal
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git` (git nélkül: a GitHub-oldalon **Code → Download ZIP**).
A mappát a fájlkezelőben is átmásolhatod; az a lényeg, hogy a másolatod neve `peacock-journal` legyen, és a
`rika-mentoring` mappán kívülre kerüljön: így a `git pull` továbbra is működik. Nyisd meg a másolatodat a
szerkesztőben, aztán írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Halvány szürkészöld oldalon egy mély
türkizkék sávot látsz „The Peacock Journal” címmel és ezzel a sorral: „Notes on React, writing and the web.” Alatta,
szaggatott keretben: „The posts will appear here.” A böngészőfülön is „The Peacock Journal” áll. Bejegyzések még
nincsenek: megmutatni őket a te dolgod.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. A szervert hagyd futni, és nyiss egy
második terminált (a terminálpanel **+** gombja; ez is a `peacock-journal` mappában nyílik meg):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára (az új fájlokat kézzel töröld), és
érdemes minden működő lépés után commitolni.

Ezek a fájlok fontosak a kiinduló projektben:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címsávot és egy helykitöltő sort mutat, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért nem kell stílust
  írnod: csak a lépésekben megadott osztályneveket használod (`page`, `card`, `post`, `markdown`, `field`…).
- `src/index.css`: az oldal háttere és betűtípusa.
- `src/fakeApi.js`: az álszerver. Hogy mi ez, azt a lenti doboz mondja el.
- `src/sampleData.js`: négy mintabejegyzés, két szerző és három komment: ez van az álszerver adatbázisában a legelső
  indításkor. A szerzőkre és a kommentekre csak a haladó szinten lesz szükség.
- `index.html`: ezt az oldalt tölti be először a böngésző. A `<title>`-je és a leírása az utolsó lépésben tér vissza.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések, a blog címe, az alcím és a
mintabejegyzések angolul vannak. Ha szeretnéd, fordítsd le őket nyugodtan; a kódban, amit te írsz, magyar feliratok és
megjegyzések lesznek.

:::concept Az álszerver
Egy igazi blog egy [[szerveren|szerver]] tartja a bejegyzéseit: ez egy számítógép az interneten, ami egy
[[adatbázisban|adatbázis]] tárolja az adatokat, és válaszol az oldalak kéréseire. Az oldal elkéri a bejegyzések
listáját, a szerver elküldi; az oldal elküld egy új bejegyzést, a szerver elmenti. Az app szerveren futó része a
[[backend]], a böngészőben futó része a [[frontend]]. Mindaz, amit eddig Reactben írtál, frontend volt.

Ez a kurzus nem használ külső szolgáltatásokat, ezért a kiinduló projekt a saját backendjét is hozza: az
`src/fakeApi.js`-t. A 22. leckében már találkoztál vele (ott kitalált szervernek hívtuk). Úgy tesz, mintha a blog
szervere és adatbázisa lenne, közben viszont a böngésződben fut. Az adatbázisa [[gyűjteményekből|gyűjtemény]] áll,
mint egy igazi adatbázis a tábláiból: itt `posts` (bejegyzések), `authors` (szerzők) és `comments` (kommentek),
mindegyik `id`-vel ellátott elemek listája. Mindent
egyetlen [[localStorage]]-kulcsban tart, így amit elmentesz, az túléli az újratöltést, akárcsak egy igazi
adatbázisban. Minden kérés eltart egy pillanatig, ahogy az interneten is, és ha megkéred rá, néhány kérés szándékosan
elbukik. A fájl elején lévő megjegyzés felsorolja, mit tud: `list`, `get`, `create`, `update` és `remove`. Mindegyik
egy [[Promise]]-t ad vissza, ezért a válaszra `await`-tel vársz.
:::

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza, kívülről pedig a [[props]]-ain keresztül kap adatot.
Emlékezni a [[useState]] segítségével tud: ha egy állapotérték megváltozik, a React újrarajzolja a komponenst. Ami
nem rajzolás, például adatot kérni egy szervertől, az egy [[useEffect]]-be kerül. A [[saját hook]] egy `use`-zal
kezdődő nevű függvény, ami más hookokat hív, mint a 14. és a 23. lecke `useFetch`-e. Egy [[async függvény]] `await`-tel
megvárhat egy Promise-t, a [[try/catch]] pedig elkapja a hibát, ha az elbukik. Ha ezek közül valami ismeretlennek
tűnik, lapozz vissza azokhoz a leckékhez.
:::

### Bejegyzések az álszerverről

Először maga a szerver. A `fakeApi.js` `createMockApi` függvénye készít egyet: megadod a nevét és a kezdő adatait.
Hozd létre az `src/api.js` fájlt:

```js file=src/api.js
import { createMockApi } from './fakeApi.js'
import { SAMPLE_AUTHORS, SAMPLE_COMMENTS, SAMPLE_POSTS } from './sampleData.js'

// A blog álszervere. Az adatbázisának három gyűjteménye van: posts, authors és comments.
// Egyelőre csak a bejegyzéseket olvassuk; a szerzők és a kommentek a haladó szinten jönnek.
export const api = createMockApi('peacock-journal', {
  seed: { posts: SAMPLE_POSTS, authors: SAMPLE_AUTHORS, comments: SAMPLE_COMMENTS },
  latency: [300, 800], // minden válasz 0,3–0,8 másodpercig tart
  failRate: 0, // 0.3 esetén 10 kérésből 3 elbukna
})
```

- A `'peacock-journal'` az adatbázis neve: a localStorage-kulcsa `fake-api:peacock-journal` lesz.
- A `seed` a kezdő tartalom. A szerver csak addig használja, amíg nincs semmi elmentve; az első változtatástól kezdve
  azzal dolgozik, ami a localStorage-ben van. Ezért vannak a szerzők és a kommentek már a legelejétől benne: egy már
  elmentett adatbázis később nem kapná meg őket.
- A `latency` és a `failRate` miatt viselkedik úgy, mint egy igazi szerver: néha lassú, és ha akarod, megbízhatatlan.

Az `api.list('posts')` elkéri az összes bejegyzést, a válasza pedig később érkezik, Promise-ként. A 14. és a 23.
leckében egy `useFetch` hook várt helyetted: kapott egy címet, és megmondta, hogy a válasz még töltődik, megjött vagy
elbukott. A mi szerverünket viszont nem `fetch`-csel és címmel hívjuk, hanem olyan függvényekkel, mint az `api.list`.
Ezért ennek a leckének a hookja magát a kérést kapja meg, függvényként. Hozd létre az `src/useRequest.js` fájlt:

```js file=src/useRequest.js
import { useEffect, useState } from 'react'

// Elküld egy kérést a szervernek, és megmondja, hogyan áll:
// { status: 'loading' | 'success' | 'error', data, error, reload }
// request: egy függvény, ami Promise-t ad vissza. deps: ha valamelyikük megváltozik, a kérés újra elmegy.
function useRequest(request, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false // a takarítás állítja true-ra: onnantól a válaszra nincs szükség

    async function load() {
      setState({ status: 'loading', data: null, error: null })
      try {
        const data = await request()
        if (!ignore) setState({ status: 'success', data, error: null })
      } catch (error) {
        if (!ignore) setState({ status: 'error', data: null, error })
      }
    }

    load()
    return () => {
      ignore = true
    }
    // A request minden rajzoláskor új függvény, ezért nincs a listában: a deps dönti el, mikor menjen újra.
  }, [...deps, attempt])

  function reload() {
    setAttempt(attempt + 1)
  }

  return { ...state, reload }
}

export default useRequest
```

- A `request` egy függvény, például `() => api.list('posts')`. Az effekt meghívja, az `await request()` pedig
  megvárja a szerver válaszát.
- A `deps` úgy működik, mint a `useEffect` [[függőségi tömbje|függőségi tömb]]: ha valamelyik eleme megváltozik, a kérés újra
  elmegy. A `[...deps, attempt]` a [[spread]] segítségével átrakja az elemeit az effekt saját tömbjébe, utánuk pedig
  az `attempt`-et. Az üres `[]` azt jelenti: egyszer küldd el, amikor a komponens megjelenik.
- Az `ignore` a [[versenyhelyzet]] elleni védelem. A 23. lecke `useFetch`-e egy `AbortController`-rel megszakította a
  `fetch`-et. Az álszerverünk kéréseit nem lehet megszakítani, ezért hagyjuk őket végigfutni, de a válaszukat
  figyelmen kívül hagyjuk. Mikor számít ez? Ha az egyik bejegyzésről egyenesen a másikra lépsz, az első válasza a
  második után is megérkezhet, és nem szabad felülírnia az oldalt. Az effekt [[takarító függvénye|takarító függvény]] a következő kérés
  előtt (és amikor a komponens eltűnik) lefut, és `true`-ra állítja az `ignore`-t. A React StrictMode-ja fejlesztés
  közben ráadásul minden effektet kétszer futtat: az `ignore`-nak köszönhetően az első futás válasza egyszerűen
  elvész.
- A `reload` eggyel növeli az `attempt`-et, ami benne van a függőségi tömbben: az effekt újra lefut, és még egyszer
  elküldi ugyanazt a kérést. A 23. leckében `retry` volt a neve.

A piros hibadoboz több oldalon is megjelenik majd, ezért saját komponenst kap, mint a 23. leckében. Hozd létre az
`src/components/ErrorMessage.jsx` fájlt:

```jsx file=src/components/ErrorMessage.jsx
// Piros doboz egy üzenettel és egy „Újrapróbálom” gombbal.
function ErrorMessage({ text, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <p>{text}</p>
      <button type="button" className="button" onClick={onRetry}>
        Újrapróbálom
      </button>
    </div>
  )
}

export default ErrorMessage
```

A blognak több oldala lesz: a lista, egy bejegyzés, a szerkesztő… Mindegyik egy új `src/pages` mappába kap
komponenst, hogy a `components` építőkockái és az egész oldalak könnyen megkülönböztethetők legyenek. Az első a
lista. Hozd létre az `src/pages/ListPage.jsx` fájlt:

```jsx file=src/pages/ListPage.jsx
import { api } from '../api.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage() {
  // []: a lista egyszer töltődik be, amikor az oldal megjelenik.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])

  return (
    <section className="page">
      <h1 className="page__title">Az összes bejegyzés</h1>
      {status === 'loading' && <p className="state">Bejegyzések betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a bejegyzéseket." onRetry={reload} />}
      {status === 'success' && data.length === 0 && <p className="state">Még nincs bejegyzés.</p>}
      {status === 'success' && data.length > 0 && (
        <ul className="post-list">
          {data.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

Ez megint [[feltételes megjelenítés]]: a négy `&&`-es sor közül csak az rajzol valamit, amelyiknek igaz a feltétele.
A `data` a szerver válasza: bejegyzések tömbje, mindegyik egy objektum `id`, `title`, `author`, `createdAt`, `tags`
és `body` mezőkkel (nyisd meg a `sampleData.js`-t, és nézd meg őket). Végül az `App` a helykitöltő sor helyett a
listát mutatja. Írd át az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,15
import ListPage from './pages/ListPage.jsx'
import './App.css'

function App() {
  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">
        <ListPage />
      </main>
    </div>
  )
}

export default App
```

:::check Ellenőrizd
„Az összes bejegyzés” cím alatt egy pillanatra megjelenik szaggatott keretben a „Bejegyzések betöltése…”, aztán a
helyén négy bejegyzés címe, a „Welcome to the Peacock Journal”-tól a „Picking colours for a website”-ig. Most próbáld
ki a hibát: az `src/api.js`-ben állítsd be, hogy `failRate: 1` (minden kérés elbukik), mentsd el, és töltsd újra az
oldalt (++F5++): a már betöltött lista magától nem kéri le újra a bejegyzéseket. A várakozás után egy piros doboz
jelenik meg: „Nem sikerült betölteni a bejegyzéseket.”, egy „Újrapróbálom” gombbal. Kattints rá: „Bejegyzések
betöltése…”, aztán megint a piros doboz. Állítsd vissza a `failRate`-et `0`-ra, mentsd el, és kattints még egyszer az
„Újrapróbálom” gombra: visszajönnek a bejegyzések.
:::

:::mistake Gyakori hiba
`useRequest(api.list('posts'), [])`, a `() =>` nélkül. Ilyenkor a kérés azonnal elmegy, minden rajzoláskor, a hook
pedig függvény helyett magát a Promise-t kapja meg. Amikor az effekt meghívja a `request()`-et, a hívás „request is
not a function” hibát dob, de a `try/catch` elkapja: újratöltés után azonnal, várakozás nélkül megjelenik a piros „Nem
sikerült betölteni a bejegyzéseket.” doboz, pedig a `failRate` `0`, az „Újrapróbálom” sem segít, a konzol pedig üres.
Egy függvényt adj át, ami elküldi a kérést, ne magát a kérést.
:::

:::try Próbáld ki
Írd át az `src/api.js`-ben, hogy `latency: [2000, 3000]`, töltsd újra az oldalt, és nézd néhány másodpercig a
betöltési üzenetet. Utána állítsd vissza.
:::

### Kártyák: dátum, szerző és egy rövid kivonat

Egy címlista még nem blog. Minden bejegyzésnek kártya jár a dátumával, az olvasási idejével, a szövege elejével és a
szerzőjével. Ehhez a munkához nem kell React: adatból szöveg lesz. Ezért sima függvények végzik, egy külön fájlban.
Hozd létre az `src/posts.js` fájlt:

```js file=src/posts.js
// Kis segédfüggvények a bejegyzések megjelenítéséhez. Semmi közük a Reacthez: adatot kapnak, szöveget adnak vissza.

const dateFormat = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })

// '2026-11-12T09:30:00.000Z' → '2026. november 12.'
export function formatDate(isoDate) {
  return dateFormat.format(new Date(isoDate))
}

// Percenként nagyjából 200 szó, és legalább 1 perc.
export function readingTime(text) {
  const words = text.split(/\s+/).filter((word) => word !== '').length
  return Math.max(1, Math.round(words / 200))
}

// Az első közönséges bekezdés eleje, Markdown-jelek nélkül: legfeljebb 160 karakter.
export function excerpt(text) {
  // Az első bekezdés, ami nem jellel kezdődik (# cím, - lista, > idézet, a kód fordított aposztrófjai).
  const first = text.split('\n\n').find((paragraph) => !/^[#>`-]/.test(paragraph)) ?? ''
  // Csillagok és fordított aposztrófok nélkül, egy sorban.
  const plain = first.replace(/[*`]/g, '').replaceAll('\n', ' ')
  if (plain.length <= 160) return plain
  // A 160. karakter előtti utolsó szóköznél vágunk, hogy egyetlen szó se törjön ketté.
  return plain.slice(0, plain.lastIndexOf(' ', 160)) + '…'
}

// A bejegyzések rendezett másolata: elöl a legújabb.
export function newestFirst(posts) {
  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
```

- A szerver [[ISO 8601]] formátumú szövegként küldi a dátumokat: a `'2026-11-12T09:30:00.000Z'` 2026. november 12.,
  9:30, UTC szerint, vagyis világidőben (ezt jelenti a `Z`). A `new Date(…)` dátummá alakítja a szöveget, az
  [[Intl.DateTimeFormat]] (11. lecke) pedig úgy írja ki, ahogy egy adott nyelven olvasni szokás: a `'hu-HU'` a magyar.
- A két perjel közötti minták [[reguláris kifejezések|reguláris kifejezés]]. A `/\s+/` jelentése: „egy vagy több
  szóközféle karakter” (szóköz, sortörés), így a `split` szavakra vágja a szöveget. Az `excerpt` első mintájának
  jelentése: „ezek egyikével kezdődik”: a `^` a szöveg eleje, a szögletes zárójel pedig a benne lévő karakterek (`#`,
  `>`, a fordított aposztróf és a `-`) bármelyike. A `test` `true`-t vagy `false`-t felel, a `!` pedig megfordítja. A
  második minta végén álló `g` azt jelenti, hogy „mindegyiket”, nem csak az elsőt: a `replace` minden csillagot és
  fordított aposztrófot kitöröl.
- A `find` az első illeszkedő bekezdést adja vissza, vagy `undefined`-ot, ha egy sem illik. A `?? ''`
  ([[nullish coalescing]]) jelentése: „vagy, ha az `undefined` vagy `null`, egy üres szöveg”, így a `plain` mindig
  szöveg lesz.
- A `lastIndexOf(' ', 160)` visszafelé keres szóközt a 160. pozíciótól: a vágás két szó közé esik.
- A `sort` nem másolatot ad vissza, hanem magát a tömböt rendezi át ([[helyben rendezés]]), egy komponens állapotában
  lévő adatot pedig nem szabad megváltoztatni. Ezért a `newestFirst` előbb lemásolja a tömböt (`[...posts]`, mint a 7.
  leckében). A [[localeCompare]] két szöveget hasonlít össze. Az ISO-dátumok szövegként összehasonlítva is időrendbe
  kerülnek, mert elöl áll az év, aztán a hónap, aztán a nap, mindig ugyanannyi számjeggyel. Az, hogy a `b`-t
  hasonlítjuk az `a`-hoz (és nem fordítva), megfordítja a sorrendet: elöl a legújabb.

A kártya az `src/components/PostCard.jsx`-be kerül:

```jsx file=src/components/PostCard.jsx
import { excerpt, formatDate, readingTime } from '../posts.js'

function PostCard({ post }) {
  return (
    <li className="card">
      <p className="meta">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time> · {readingTime(post.body)} perc olvasás
      </p>
      <h2 className="card__title">{post.title}</h2>
      <p className="card__excerpt">{excerpt(post.body)}</p>
      <p className="meta">Írta: {post.author}</p>
    </li>
  )
}

export default PostCard
```

A `<time>` a dátum HTML-eleme. A szövege az embereknek szól, a `dateTime` attribútuma pedig ugyanazt a dátumot
gépek számára érthető formában tartalmazza, például a keresőmotoroknak (ez a lecke végén visszatér). Most a lista
sorba rendezi a bejegyzéseket, és kártyákat rajzol. Írd át az `src/pages/ListPage.jsx`-et:

```jsx file=src/pages/ListPage.jsx mark=2,4,10-11,18-19,21-22
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage() {
  // []: a lista egyszer töltődik be, amikor az oldal megjelenik.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Minden rajzoláskor a szerver válaszából számoljuk ki: származtatott érték, nem állapot.
  const posts = status === 'success' ? newestFirst(data) : []

  return (
    <section className="page">
      <h1 className="page__title">Az összes bejegyzés</h1>
      {status === 'loading' && <p className="state">Bejegyzések betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a bejegyzéseket." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && <p className="state">Még nincs bejegyzés.</p>}
      {posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

A `posts` [[származtatott érték]]: amíg a válasz nem jött meg, üres tömb, utána a rendezett másolat. Nem kell neki
saját állapot, mert a hook adataiból bármikor kiszámolható. A `key` továbbra is a bejegyzés `id`-je, de átkerül a
`PostCard`-ra: a Reactnek a `map` által készített elemek legkülső elemén van rá szüksége.

:::check Ellenőrizd
Négy fehér kártya, elöl a legújabb: „Welcome to the Peacock Journal” (2026. november 16.), „Writing posts in
Markdown”, „Why this blog uses hash routes” és „Picking colours for a website” (2026. október 9.). Minden kártyán
ott a dátum, az „1 perc olvasás”, a szöveg eleje és a szerző („Írta: Rika” vagy „Írta: Sam”). A Markdown-bejegyzés
kivonata a „headings, lists and bold words.” szavakkal végződik, a „bold” körüli csillagok nélkül.
:::

:::mistake Gyakori hiba
`dateFormat.format(isoDate)`, a `new Date(…)` nélkül. A `format` dátumot vagy számot vár, nem szöveget. Megpróbálja
számmá alakítani a szöveget, `NaN`-t kap („not a number”, vagyis nem szám), és leáll ezzel: „RangeError: Invalid time
value”. Az oldal elfehéredik, a konzolban pedig ott a hiba.
:::

:::try Próbáld ki
Mutasd az időpontot is a kártyákon: add hozzá a `dateFormat` beállításaihoz, hogy `hour: '2-digit', minute:
'2-digit'`. Az idő a saját időzónád szerint jelenik meg, nem UTC szerint.
:::

### Minden bejegyzésnek saját oldal

Minden bejegyzés saját oldalt kap, saját címmel: `#/post/welcome` az üdvözlő bejegyzésé, `#/post/hash-routing` a
routingosé. A cím dönti el, mit mutat az app: ez a [[routing]]. A 23. leckében az 1. lecke `useHashRoute` hookjából
kiindulva saját kis routert írtál; ez a blog ugyanezt az ötletet használja. A hook a cím `#` utáni részét, az
[[URL-hash]]-t figyeli, és útvonalként adja vissza. Most a fájl egy második függvényt is kap, a `matchRoute`-ot, ami
megmondja, melyik oldal tartozik egy útvonalhoz. Hozd létre az `src/useHashRoute.js` fájlt:

```js file=src/useHashRoute.js
import { useEffect, useState } from 'react'

const currentPath = () => window.location.hash.slice(1) || '/'

// Visszaadja a cím # utáni részét, és frissül, amikor az megváltozik.
function useHashRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    // Takarítás: amikor a komponens eltűnik, már nem figyelünk.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

// Melyik oldal tartozik egy útvonalhoz? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  return { name: 'notFound' }
}

export default useHashRoute
```

Gyors ismétlés a hookról: a `slice(1)` levágja a `#`-et, a `|| '/'` pedig azt jelenti: „vagy `/`, ha nem maradt
semmi”. Az effekt a böngésző `hashchange` eseményét figyeli, ami akkor következik be, amikor a `#` utáni rész
megváltozik, a takarítása pedig leállítja a figyelést.

A `matchRoute` minden `/`-nél elvágja az útvonalat. A `'/post/welcome'.split('/')` eredménye `['', 'post',
'welcome']`: az első `/` előtti szöveg üres, ezért a `filter` kidobja az üres részeket. Nincs rész: a lista. Két
rész, és az első a `post`: egy bejegyzés, a második rész pedig az `id`-je. Minden más: nem létező oldal. A címben
lévő `id` [[útvonal-paraméter]]: egyetlen címminta, a `/post/:id`, szolgálja ki az összes bejegyzést. A
mintabejegyzéseknek olvasható azonosítójuk van, például `welcome`, amit a címükből készítettünk ([[slug]]); az appban
írt bejegyzések a szervertől véletlenszerű azonosítót kapnak.

Jól jön egy oldal az olyan címekhez, amikhez nem tartozik oldal. Hozd létre az `src/pages/NotFoundPage.jsx` fájlt:

```jsx file=src/pages/NotFoundPage.jsx
// Olyan címhez, amihez nem tartozik oldal. A text mondja meg, mi a baj; van alapértéke.
function NotFoundPage({ text = 'Ezen a címen nincs semmi.' }) {
  return (
    <section className="state">
      <h1 className="page__title">Nincs ilyen oldal</h1>
      <p>{text}</p>
      <a className="button" href="#/">
        ← Az összes bejegyzés
      </a>
    </section>
  )
}

export default NotFoundPage
```

A `text = '…'` [[alapértelmezett paraméter]] (21. lecke): ha a `NotFoundPage` nem kap `text` propot, ezt használja.
Egy nem létező bejegyzés majd más szöveget ad neki.

A bejegyzés oldala egyetlen bejegyzést tölt be: `api.get('posts', id)`. Ha a szervernek nincs ilyen azonosítójú
bejegyzése, olyan hibával válaszol, aminek a `status`-a 404: ez a „nem található” [[HTTP-állapotkódja|HTTP-állapotkód]]. Hozd létre
az `src/pages/PostPage.jsx` fájlt:

```jsx file=src/pages/PostPage.jsx
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id }) {
  // Új id, új bejegyzés: a deps mondja meg, mikor menjen újra a kérés.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    // 404: a szervernek nincs ilyen azonosítójú bejegyzése. Minden más hiba elmúlhat, ha újrapróbáljuk.
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← Az összes bejegyzés
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          Írta: {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        </p>
      </header>
      <div className="post__body">
        {/* Egyelőre úgy mutatjuk a szöveget, ahogy van, bekezdésenként. */}
        {post.body.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}

export default PostPage
```

- A `data: post` átnevezéses [[destrukturálás]]: a hook `data`-nak hívja, mi itt `post`-nak.
- A két `return`-ös `if` [[korai visszatérés]]: amíg a bejegyzés töltődik, vagy ha elbukott, a komponens mást ad
  vissza, és a függvény többi része le sem fut. Így az utolsó `return`-höz érve a `post` biztosan megvan.
- A szöveget az üres soroknál vágjuk bekezdésekre (`'\n\n'`: két sortörés). A bekezdéseknek nincs állapotuk, és
  minden rajzoláskor újra elkészülnek, ezért a helyük (`i`) elég jó `key`.

Most az `App` a címhez tartozó oldalt rajzolja ki. Írd át az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1-2,4-5,9-10,12-15,17-21,32
import { useEffect } from 'react'
import useHashRoute, { matchRoute } from './useHashRoute.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)

  // Az új oldal a tetején kezdődik, akármilyen mélyre görgettünk az előzőn.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  // A JSX is érték: a címhez tartozó oldal egy változóba kerül.
  let page
  if (route.name === 'list') page = <ListPage />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

- A `let page` értékét egy `if … else if … else` lánc adja: az ágak közül pontosan egy fut le. Ha több oldal lesz,
  egy új oldal itt egy újabb sort jelent.
- `key={route.id}`: amikor a key megváltozik, a React eldobja a régi komponenst, és vadonatújat készít, friss
  állapottal (23. lecke). Ha egyik bejegyzésről egyenesen a másikra lépsz, semmi sem marad meg az előzőből.
- Az effekt minden útvonalváltáskor lefut, és az oldal tetejére görget: a böngésző különben megtartaná a lista
  görgetési helyzetét.

Végül a kártyákból linkek lesznek. Az `src/components/PostCard.jsx`-ben a cím egy `<a>`-t kap:

```jsx file=src/components/PostCard.jsx mark=9-12
import { excerpt, formatDate, readingTime } from '../posts.js'

function PostCard({ post }) {
  return (
    <li className="card">
      <p className="meta">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time> · {readingTime(post.body)} perc olvasás
      </p>
      <h2 className="card__title">
        {/* Az App.css az egész kártyára kifeszíti ezt a linket: a kártyán bárhová kattintva megnyílik a bejegyzés. */}
        <a href={`#/post/${post.id}`}>{post.title}</a>
      </h2>
      <p className="card__excerpt">{excerpt(post.body)}</p>
      <p className="meta">Írta: {post.author}</p>
    </li>
  )
}

export default PostCard
```

Egyszerű link. Ha rákattintasz, csak a cím `#` utáni része változik meg: a böngésző nem tölt be új oldalt, hanem
`hashchange` eseményt küld, a hookunk pedig átadja az új útvonalat az `App`-nak. A Vissza gomb magától működik, mert
minden új cím új elemként kerül a böngésző előzményei közé.

:::check Ellenőrizd
Kattints a „Writing posts in Markdown” kártyájára (bárhová): a cím `#/post/markdown-basics`-re végződik, felvillan a
„Bejegyzés betöltése…”, aztán megjelenik a nagy cím, az „Írta: Rika · 2026. november 12.” és a szöveg. A szöveg
egyelőre úgy mutatja a Markdown-jeleit, ahogy vannak: `# Marks inside a line`, `**bold**`, három fordított
aposztróf a kód előtt. Hogy ezekből igazi címek és félkövér szavak legyenek, az a középszint első lépése. Az „← Az összes bejegyzés”,
a blog címe és a Vissza gomb is visszavisz a listára. Most írj be kézzel címeket a címsorba, a `localhost:5173/` után: a
`#/post/nothing-here`-re „Nincs ilyen oldal” jön, „Ez a bejegyzés nem létezik (vagy már nem).” szöveggel, a `#/hello`-ra pedig „Ezen a címen nincs
semmi.” Kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
Kimarad a `.filter((part) => part !== '')` a `matchRoute`-ból. Ilyenkor a `'/post/welcome'` három részből áll
(`['', 'post', 'welcome']`), és az első üres, így sosem lesz „két rész, ami `post`-tal kezdődik”: minden bejegyzésre
„Nincs ilyen oldal” jön. A `'/'` eredménye `['', '']`, úgyhogy még a lista is eltűnik.
:::

:::mistake Gyakori hiba
A `post.title` kiolvasása a két `if` előtt, például egy `const title = post.title` sorban a függvény elején. Amíg a
bejegyzés töltődik, a `data` még `null`, és az oldal leáll ezzel: „Cannot read properties of null (reading 'title')”.
Az adatokkal csak a korai visszatérések után dolgozz.
:::

:::try Próbáld ki
Az üdvözlő bejegyzés egy Markdownban írt linkkel végződik: `[Writing posts in Markdown](#/post/markdown-basics)`.
Egyelőre ez sima szöveg. Másold ki a kerek zárójelek közötti részt, írd a címsorba a `localhost:5173/` után (a
mostani `#/…` rész helyére), és nyomj ++Enter++-t: megnyílik a bejegyzés, mert a `#/post/markdown-basics` a blog érvényes címe.
:::

## Középszint {level=2}

### Markdown: címek, listák, kód és linkek

A bejegyzéseket Markdownban írjuk: néhány jel a sima szövegben megmondja, mi a cím, a lista, a félkövér szó vagy a
link. A 11. leckében egy kis Markdown-olvasót írtál a jegyzetek előnézetéhez. A blognak ennél több kell: a
bejegyzésekben többféle méretű cím, számozott lista, idézet, kódblokk és link is van. Ezeket a jeleket fogja érteni:

```md
# Egy cím, ## egy kisebb, ### egy még kisebb
- egy listaelem
1. egy számozott listaelem
> egy idézet
**félkövér**, *dőlt*, `kód` és [egy link](#/post/welcome)
három fordított aposztróf (```) egy külön sorban nyit és zár egy kódblokkot
```

Ahogy a 11. leckében, az olvasó most is React-elemeket épít, sosem HTML-t. Hozd létre az
`src/components/Markdown.jsx` fájlt; lent részenként elmagyarázzuk:

```jsx file=src/components/Markdown.jsx
// Egy kis Markdown-olvasó. Sosem készít HTML-t, csak React-elemeket:
// akármi van egy bejegyzésben, még egy <script> is, szöveg marad a képernyőn.

// Linkek csak weboldalakra, e-mail-címekre és ennek a blognak az oldalaira (#/…) mutathatnak.
const SAFE_LINK = /^(https?:\/\/|mailto:|#)/

// 1. Egy soron belül: **félkövér**, *dőlt*, `kód` és [link](cím).
function renderInline(text) {
  // A kerek zárójeleknek köszönhetően a split a megjelölt részeket is megtartja, a páratlan helyeken (1, 3, 5…).
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/)
  return parts.map((part, i) => {
    if (i % 2 === 0) return part // a páros helyeken sima szöveg áll
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    // Ami maradt, az link: [felirat](cím).
    const label = part.slice(1, part.indexOf(']'))
    const href = part.slice(part.indexOf('](') + 2, -1)
    if (!SAFE_LINK.test(href)) return label // a veszélyes cím (javascript:…) sima szöveg marad
    return (
      <a key={i} href={href}>
        {label}
      </a>
    )
  })
}

// 2. A szövegből soronként blokkok lesznek. Minden blokk egy { type, lines }, ahol a type
//    annak az elemnek a neve, ami kirajzolja: p, h2, h3, h4, ul, ol, blockquote vagy pre.
function parseBlocks(text) {
  const blocks = []
  let current = null // a nyitott blokk: a következő sor folytathatja

  // A nyitott blokkhoz adja a sort, ha ugyanilyen típusú; különben új blokkot nyit.
  function add(type, line) {
    if (current?.type !== type) {
      current = { type, lines: [] }
      blocks.push(current)
    }
    current.lines.push(line)
  }

  for (const line of text.split('\n')) {
    const heading = line.match(/^(#{1,3}) (.+)/)
    if (current?.type === 'pre') {
      // Egy kódblokkon belül minden sor marad, ahogy van, a záró fordított aposztrófokig.
      if (line.startsWith('```')) current = null
      else current.lines.push(line)
    } else if (line.startsWith('```')) {
      current = { type: 'pre', lines: [] }
      blocks.push(current)
    } else if (heading) {
      // # → h2, ## → h3, ### → h4: az oldal h1-e a bejegyzés címe.
      blocks.push({ type: `h${heading[1].length + 1}`, lines: [heading[2]] })
      current = null
    } else if (line.startsWith('- ')) {
      add('ul', line.slice(2))
    } else if (/^\d+\. /.test(line)) {
      add('ol', line.slice(line.indexOf(' ') + 1))
    } else if (line.startsWith('> ')) {
      add('blockquote', line.slice(2))
    } else if (line.trim() === '') {
      current = null // az üres sor lezárja a bekezdést, a listát vagy az idézetet
    } else {
      add('p', line)
    }
  }
  return blocks
}

// 3. Minden blokkból egy elem lesz.
function Markdown({ text }) {
  const blocks = parseBlocks(text)
  if (blocks.length === 0) return <p className="muted">Még nincs mit megmutatni.</p>

  return (
    <div className="markdown">
      {blocks.map((block, i) => {
        // Nagybetűs változó elemnévként is állhat: a <Tag> p-t, h2-t, ul-t… rajzol.
        const Tag = block.type
        if (Tag === 'pre') {
          return (
            <pre key={i}>
              <code>{block.lines.join('\n')}</code>
            </pre>
          )
        }
        if (Tag === 'ul' || Tag === 'ol') {
          return (
            <Tag key={i}>
              {block.lines.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </Tag>
          )
        }
        // p, h2, h3, h4 és blockquote: a blokk sorai egybefűzve.
        return <Tag key={i}>{renderInline(block.lines.join(' '))}</Tag>
      })}
    </div>
  )
}

export default Markdown
```

Három lépésben dolgozik.

1. A `renderInline` a 11. lecke ötlete: a kerek zárójelbe tett reguláris kifejezéssel hívott `split` a megtalált
   részeket is megtartja, mindig a páratlan helyeken. Az `'a **b** c'`-ből `['a ', '**b**', ' c']` lesz. Az `i % 2`
   (a [[modulo]], az osztás maradéka) a páros helyeken 0, ott sima szöveg áll. A mintának négy része van, `|`-vel
   („vagy”) elválasztva: a `\*\*[^*]+\*\*` két csillag, egy vagy több nem csillag karakter (`[^*]`: a szögletes
   zárójelen belüli `^` azt jelenti, hogy „nem”), aztán megint két csillag; utána ugyanez egy csillaggal, aztán a
   fordított aposztrófok, végül a link. A `*`, `[`, `]`, `(` és `)` előtti `\` közönséges karakterré teszi őket:
   magukban mást jelentenek egy mintában. A minta utolsó része, a linké, a `\[[^\]]+\]\([^)\s]+\)` jelentése: egy `[`, egy vagy több
   karakter, ami nem `]`, egy `]`, aztán egy `(`, egy vagy több karakter, ami se nem `)`, se nem szóköz (`\s`), végül
   egy `)`. Ezután a `label` a második karaktertől a `]`-ig tartó szöveg, a `href` pedig a `](` utáni rész a záró
   zárójel nélkül (a `slice`-ban a `-1` hátulról számol).
2. A `parseBlocks` végigmegy a sorokon, és a `current`-ben megjegyzi a nyitott blokkot. A `current?.type`
   [[opcionális láncolás]] (14. lecke): ha a `current` `null`, hiba helyett `undefined` az eredmény. Az `add` akkor
   folytatja a nyitott blokkot, ha ugyanolyan a típusa: az egymás utáni listaelemekből egy lista lesz, az egymás utáni
   sorokból egy bekezdés. Az üres sor lezárja a blokkot. A kódblokk más: benne minden sor marad, ahogy van, még az
   üres és a `#`-tel kezdődő is, egészen a záró három fordított aposztrófig. A címek mintája, a
   `/^(#{1,3}) (.+)/` jelentése: a sor elején egy–három kettőskereszt (a `{1,3}` azt jelenti: „legalább egyszer,
   legfeljebb háromszor”), egy szóköz, aztán legalább egy akármilyen karakter (`.+`: a `.` bármelyik karakter lehet,
   mint a 11. lecke `.+?`-jében). A számozott listáé, a `/^\d+\. /` jelentése: egy vagy több számjegy (a `\d` a 22.
   leckéből ismerős), egy valódi pont (a `\` itt is közönséges karakterré teszi a `.`-ot) és egy szóköz. A
   `line.match(…)` a sornak a minta kerek
   zárójeleibe eső részeit adja vissza: a `'# Blocks'`-ra a `heading[1]` a `'#'`, a `heading[2]` pedig a
   `'Blocks'`. Egy kettőskeresztből `h2` lesz, kettőből `h3`.
3. A `Markdown` kirajzolja a blokkokat. A trükk a `const Tag = block.type`: nagybetűvel kezdődő nevű változó a
   JSX-ben elemnévként is használható, és ha a `'h2'` szöveg van benne, a `<Tag>` egy `<h2>`-t rajzol. Kisbetűvel a
   `<tag>` egy `tag` nevű HTML-elemet jelentene. Így egyetlen sor rajzolja a bekezdéseket, a címeket és az idézeteket. A listáknak és a
   kódblokkoknak saját sorok kellenek: a lista minden sorhoz egy `<li>`-t rajzol, a kódblokk pedig megtartja a
   sortöréseit.

Most a bejegyzés oldala használja. Az `src/pages/PostPage.jsx`-ben a `Markdown` veszi át a bekezdések helyét:

```jsx file=src/pages/PostPage.jsx mark=5,30
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id }) {
  // Új id, új bejegyzés: a deps mondja meg, mikor menjen újra a kérés.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    // 404: a szervernek nincs ilyen azonosítójú bejegyzése. Minden más hiba elmúlhat, ha újrapróbáljuk.
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← Az összes bejegyzés
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          Írta: {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        </p>
      </header>
      <Markdown text={post.body} />
    </article>
  )
}

export default PostPage
```

:::check Ellenőrizd
Nyisd meg a „Writing posts in Markdown” bejegyzést. A „Marks inside a line” és a „Blocks” most már cím; az első
alatti három sor felsorolás lett, benne félkövéren a „bold”, dőlten az „italic”, kódként pedig a `useState`. Az „1. Write the post.” és az
utána következő két sor számozott lista, a `>`-lel kezdődő sor türkiz csíkos idézet, a `Hello` függvény pedig sötét
kóddobozban ül, soronként. Az utolsó sorban a `<script>` sima kód, nem az oldal része. Kattints a „the post about
routing” linkre: megnyílik a routingos bejegyzés. Az üdvözlő bejegyzés végén lévő link is működik már.
:::

:::concept Miért ellenőrizzük a linkeket?
A 11. lecke elmondta, miért nem készítünk soha HTML-t a szövegből: amit HTML-ként teszünk az oldalba, abban a böngésző
a kódot is lefuttatja, így valaki egy `<img src=x onerror="…">` elemmel JavaScriptet csempészhetne egy bejegyzésbe. Ez
az [[XSS]] (cross-site scripting). A
React-elemekben lévő szöveg mindig szöveg marad, így a címek, a listák és a félkövér szavak biztonságosak. A link a
kivétel: a címe a `href`-be kerül, egy cím pedig kód is lehet. Egy `javascript:alert(1)`-re mutató link lefuttatná
azt a kódot, ha valaki rákattint. A React újabb változatai figyelmeztetnek az ilyen címekre, sőt le is tiltják őket,
de mi nem bízzuk a véletlenre: a `SAFE_LINK` csak a `http://`, `https://`, `mailto:` vagy `#` kezdetű címeket
engedi át. Minden más sima felirat marad.
:::

:::mistake Gyakori hiba
Felcserélni a `renderInline` két csillagos `if`-jét: a `part.startsWith('*')` kerül a `part.startsWith('**')` elé. A
`'**bold**'` is csillaggal kezdődik, ezért `<em>` lesz belőle a `slice(1, -1)`-gyel: egy dőlt `*bold*`, mindkét
oldalán egy csillaggal. Előbb mindig a hosszabb jelet vizsgáld.
:::

:::try Próbáld ki
Taníts meg az olvasónak még egy sorjelet: a három kötőjelből álló sor, a `---`, rajzoljon vízszintes vonalat
(`<hr>`). A `parseBlocks`-ban a `'- '`-t vizsgáló sor elé írj egy ágat a `line === '---'` esetre, ami egy
`{ type: 'hr', lines: [] }` blokkot tesz a tömbbe, a `current`-et pedig `null`-ra állítja. A `Markdown`-ban, rögtön a
`const Tag = block.type` sor után: `if (Tag === 'hr') return <hr key={i} />`.
:::

### Új bejegyzés írása

Most a blog megkapja az első űrlapját. A bejegyzések megjelenítése az adatokon végzett négy alapművelet közül csak az
egyik; a négyet együtt gyakran [[CRUD]]-nak hívják: **c**reate (létrehozás), **r**ead (olvasás), **u**pdate
(módosítás) és **d**elete (törlés). A kezdő szint az olvasást csinálta meg; ez a lépés a létrehozásról szól, utána
jön a módosítás és a törlés.

Az írás oldala saját címet kap: `#/new`. Két kiegészítés az `src/useHashRoute.js`-ben: a `matchRoute` megtanulja az
új címet, egy új függvény, a `navigate` pedig lehetővé teszi, hogy a kód egy másik oldalra lépjen, mintha egy linkre
kattintottak volna. Cseréld le a `matchRoute`-ot, és írd utána a `navigate`-et:

```js file=src/useHashRoute.js mark=5,10-13
// Melyik oldal tartozik egy útvonalhoz? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  return { name: 'notFound' }
}

// A kódból lép a blog egy másik oldalára, mintha egy linkre kattintottak volna.
export function navigate(path) {
  window.location.hash = path
}
```

A `navigate` beállítja a `#` utáni részt. A böngésző `hashchange` eseményt küld, a `useHashRoute` átadja az új
útvonalat az `App`-nak, és megjelenik az új oldal. Az új cím az előzmények közé is bekerül, így a Vissza gomb a
szokott módon működik.

Az űrlap saját komponenst kap, mert a következő lépés a szerkesztéshez is használja. Nem tudja, hogy létrehoz vagy
szerkeszt egy bejegyzést: a kezdőértékeket és a gombja feliratát propként kapja, és ha minden rendben, az `onSave`
propot hívja meg az értékekkel. Hogy mit jelent a mentés, azt az oldal dönti el. Hozd létre az
`src/components/PostForm.jsx` fájlt:

```jsx file=src/components/PostForm.jsx
import { useState } from 'react'
import Markdown from './Markdown.jsx'

// Egy bejegyzés szabályai. A válasz: üzenet minden olyan mezőhöz, ami még nincs rendben.
function validate(values) {
  const errors = {}
  if (values.title.trim().length < 3) errors.title = 'A cím legyen legalább 3 karakter hosszú.'
  if (values.author.trim() === '') errors.author = 'Ki írta? Írj be egy nevet.'
  if (values.body.trim().length < 20) errors.body = 'A bejegyzés legyen legalább 20 karakter hosszú.'
  return errors
}

function PostForm({ initialValues, submitLabel, cancelHref, onSave }) {
  const [values, setValues] = useState(initialValues)
  const [showErrors, setShowErrors] = useState(false) // az első mentési próba után true
  const [preview, setPreview] = useState(false) // a szöveget írjuk, vagy az előnézetét nézzük?
  const [status, setStatus] = useState('editing') // 'editing', 'saving' vagy 'error'

  // Származtatott érték: a szabályokat minden rajzoláskor újra megnézzük.
  const errors = validate(values)
  // Az üzenetek csak az első mentési próba után látszanak.
  const shown = showErrors ? errors : {}

  // Egy függvény minden mezőhöz: a mező neve mondja meg, melyik érték változik.
  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // a bejegyzést az oldal maga menti: nincs újratöltés
    if (Object.keys(errors).length > 0) {
      setShowErrors(true)
      return
    }
    setStatus('saving')
    try {
      // Az oldal dönti el, mit jelent a mentés: új bejegyzés létrehozását vagy egy meglévő módosítását.
      await onSave({
        title: values.title.trim(),
        author: values.author.trim(),
        body: values.body.trim(),
      })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Cím</span>
        <input name="title" value={values.title} onChange={handleChange} aria-invalid={Boolean(shown.title)} />
        {shown.title && <span className="field__error">{shown.title}</span>}
      </label>

      <label className="field">
        <span className="field__label">Szerző</span>
        <input name="author" value={values.author} onChange={handleChange} aria-invalid={Boolean(shown.author)} />
        {shown.author && <span className="field__error">{shown.author}</span>}
      </label>

      <div className="field">
        <div className="field__bar">
          <label className="field__label" htmlFor="post-body">
            Szöveg (Markdown)
          </label>
          <div className="tabs">
            <button type="button" className="tab" aria-pressed={!preview} onClick={() => setPreview(false)}>
              Írás
            </button>
            <button type="button" className="tab" aria-pressed={preview} onClick={() => setPreview(true)}>
              Előnézet
            </button>
          </div>
        </div>
        {preview ? (
          <div className="preview">
            <Markdown text={values.body} />
          </div>
        ) : (
          <textarea
            id="post-body"
            name="body"
            rows={14}
            value={values.body}
            onChange={handleChange}
            aria-invalid={Boolean(shown.body)}
          />
        )}
        {shown.body && <span className="field__error">{shown.body}</span>}
      </div>

      {status === 'error' && (
        <p className="alert" role="alert">
          Nem sikerült menteni a bejegyzést. Próbáld újra!
        </p>
      )}

      <div className="actions">
        <button type="submit" className="button button--primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Mentés…' : submitLabel}
        </button>
        <a className="button" href={cancelHref}>
          Mégse
        </a>
      </div>
    </form>
  )
}

export default PostForm
```

Nagy része ismerős az 1. és a 22. leckéből:

- Minden mező [[vezérelt mező]]: az értéke a `values` objektumból jön, a `handleChange` pedig minden leütést
  visszaír. A mezőknek van `name`-jük, így egyetlen függvény szolgálja ki mindet: a szögletes zárójelbe tett
  `[event.target.name]` azt jelenti, hogy „az a kulcs, amelynek a neve az `event.target.name`-ben van”, a spread pedig
  átmásolja a többi értéket.
- A `validate` egy egyszerű függvény, ami visszaadja az üzeneteket; az `errors` minden rajzoláskor ebből jön. Az
  üzenetek csak a gomb első megnyomása után jelennek meg (`showErrors`), onnantól viszont követik a gépelést. A
  `noValidate` kikapcsolja a böngésző saját buborékait, így csak a mi üzeneteink látszanak. Az `aria-invalid`
  elmondja a képernyőolvasóknak, hogy egy mező hibás, az `App.css` pedig pirosra rajzolja az ilyen mezőt.
- Az `event.preventDefault()` megakadályozza, hogy a böngésző a régi módon, egy új oldal betöltésével küldje el az
  űrlapot.
- A `handleSubmit` async függvény: az `await onSave(…)` megvárja, amíg az oldal elmenti a bejegyzést. Mentés közben a
  gomb le van tiltva, és „Mentés…” áll rajta, így a bejegyzés nem mehet el kétszer. Ha a mentés elbukik, az `onSave`
  hibát dob, a `catch` elkapja, és megjelenik a piros üzenet. Ha sikerül, az oldal az új bejegyzésre lép, az űrlap
  pedig eltűnik: nincs több dolga.
- Az „Írás” és az „Előnézet” két gomb [[aria-pressed]]-del, mint a 11. lecke fülei. Előnézet módban az előző lépés
  `Markdown` komponense veszi át a szövegdoboz helyét, így közzététel előtt láthatod a bejegyzést.
- A szöveg felirata nem foghatja körül a szövegdobozt, mert mellette a két fülgomb is ott van. Ezért a `<label>` a
  `htmlFor` segítségével mutat rá: az értéke a szövegdoboz `id`-je (`post-body`), így a feliratra kattintva is a
  szövegdobozba kerülsz, és a képernyőolvasó is tudja, melyik mezőhöz tartozik. A `htmlFor` a HTML `for`
  attribútuma: a `className`-hez hasonlóan azért más a neve, mert a `for` foglalt szó a JavaScriptben.
- A `submitLabel` és a `cancelHref` az oldaltól jön: itt „Közzététel” és a lista, a következő lépésben „Módosítások
  mentése” és a bejegyzés.

Az űrlapot körülvevő oldal rövid. Hozd létre az `src/pages/NewPostPage.jsx` fájlt:

```jsx file=src/pages/NewPostPage.jsx
import { api } from '../api.js'
import { navigate } from '../useHashRoute.js'
import PostForm from '../components/PostForm.jsx'

const EMPTY_POST = { title: '', author: '', body: '' }

function NewPostPage() {
  async function save(values) {
    // A szerver válasza az elmentett bejegyzés, az új azonosítójával: egyenesen az oldalára lépünk.
    const post = await api.create('posts', values)
    navigate(`/post/${post.id}`)
  }

  return (
    <section className="page">
      <h1 className="page__title">Új bejegyzés</h1>
      <PostForm initialValues={EMPTY_POST} submitLabel="Közzététel" cancelHref="#/" onSave={save} />
    </section>
  )
}

export default NewPostPage
```

Az `api.create('posts', values)` elmenti a bejegyzést az adatbázisba. A szerver egy `id`-t és egy `createdAt`
dátumot tesz hozzá, a válasza pedig az elmentett bejegyzés. Ha a kérés elbukik, a `save` nem kapja el a hibát: az
továbbjut az űrlap `handleSubmit`-jének `catch`-ébe, és az űrlap kiírja a saját hibaüzenetét.

Az `App` megkapja az új oldalt. Írd át az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=5,22
import { useEffect } from 'react'
import useHashRoute, { matchRoute } from './useHashRoute.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)

  // Az új oldal a tetején kezdődik, akármilyen mélyre görgettünk az előzőn.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  // A JSX is érték: a címhez tartozó oldal egy változóba kerül.
  let page
  if (route.name === 'list') page = <ListPage />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} />
  else if (route.name === 'new') page = <NewPostPage />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

Végül egy „Új bejegyzés” gomb a listára. Az `src/pages/ListPage.jsx`-ben a cím és a gomb egy sorba kerül:

```jsx file=src/pages/ListPage.jsx mark=15-20
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage() {
  // []: a lista egyszer töltődik be, amikor az oldal megjelenik.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Minden rajzoláskor a szerver válaszából számoljuk ki: származtatott érték, nem állapot.
  const posts = status === 'success' ? newestFirst(data) : []

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">Az összes bejegyzés</h1>
        <a className="button button--primary" href="#/new">
          + Új bejegyzés
        </a>
      </div>
      {status === 'loading' && <p className="state">Bejegyzések betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a bejegyzéseket." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && <p className="state">Még nincs bejegyzés.</p>}
      {posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

:::check Ellenőrizd
„Az összes bejegyzés” mellett ott egy zöld „+ Új bejegyzés” gomb. Kattints rá: a cím `#/new`-ra végződik, és
megjelenik az „Új bejegyzés” űrlap. Kattints rögtön a „Közzététel”-re: három piros üzenet, a mezők piros keretet
kapnak. Írj be egy címet, a nevedet és néhány sort némi Markdownnal (`# Egy cím`, egy `- lista`, egy `**félkövér**`
szó), aztán kattints az „Előnézet”-re: a szöveg formázva jelenik meg; az „Írás” visszahozza a szövegdobozt. Kattints a
„Közzététel”-re: egy pillanatra „Mentés…” áll a gombon, aztán megnyílik az új bejegyzésed oldala. A listán ez az első
kártya, mai dátummal. Töltsd újra az oldalt: még mindig ott van. A fejlesztői eszközökben (++F12++) az
**Application** → **Local storage** alatt a `fake-api:peacock-journal` kulcsban most már az egész adatbázis ott van.
Állítsd be az `src/api.js`-ben, hogy `failRate: 1`, és próbálj meg újra közzétenni valamit: „Nem sikerült menteni a
bejegyzést. Próbáld újra!”, a szöveged pedig ott marad az űrlapban. Állítsd vissza `0`-ra.
:::

:::mistake Gyakori hiba
Kimarad az `event.preventDefault()`. Ilyenkor a böngésző a régi módon küldi el az űrlapot: újratölti az oldalt, a
mezőkkel a címben (`?title=…&author=…&body=…`). Az app elölről indul, az űrlap megint üres, és semmi sem mentődött el,
mert az oldal újratöltődött, mielőtt a szerver válaszolhatott volna.
:::

:::try Próbáld ki
Kezdj egy új bejegyzést, és írd be a szövegébe ezt a sort: `[Kattints ide](javascript:alert(1))`. Kattints az
„Előnézet”-re: a „Kattints ide” sima szöveg, nem link (utána ott marad egy magányos záró zárójel is). Most írd át a
kerek zárójelek közötti részt, a link címét, `#/post/welcome`-ra: az előnézetben link lesz belőle. Utána kattints a
„Mégse” gombra, hogy a próba ne kerüljön ki a blogra.
:::

### Egy bejegyzés szerkesztése

A szerkesztés majdnem ugyanaz, mint az írás: ugyanaz az űrlap, csak a bejegyzés saját értékeivel, és a mentés nem új
bejegyzést hoz létre, hanem a meglévőt módosítja. A cím: `#/edit/` és a bejegyzés azonosítója. Az
`src/useHashRoute.js`-ben cseréld le még egyszer a `matchRoute`-ot:

```js file=src/useHashRoute.js mark=7
// Melyik oldal tartozik egy útvonalhoz? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  if (parts.length === 2 && parts[0] === 'edit') return { name: 'edit', id: parts[1] }
  return { name: 'notFound' }
}
```

A szerkesztőoldal először betölti a bejegyzést, ahogy a bejegyzés oldala is, és csak akkor rajzolja ki az űrlapot,
amikor a bejegyzés megvan. Hozd létre az `src/pages/EditPostPage.jsx` fájlt:

```jsx file=src/pages/EditPostPage.jsx
import { api } from '../api.js'
import useRequest from '../useRequest.js'
import { navigate } from '../useHashRoute.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import PostForm from '../components/PostForm.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function EditPostPage({ id }) {
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  async function save(values) {
    // Az update csak a kapott mezőket módosítja, a szerver pedig egy updatedAt dátumot tesz hozzá.
    await api.update('posts', id, values)
    navigate(`/post/${id}`)
  }

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }

  return (
    <section className="page">
      <h1 className="page__title">Bejegyzés szerkesztése</h1>
      {/* Az űrlap csak most rajzolódik ki, amikor a bejegyzés megvan: a useState csak egyszer olvassa az initialValues-t. */}
      <PostForm
        initialValues={{ title: post.title, author: post.author, body: post.body }}
        submitLabel="Módosítások mentése"
        cancelHref={`#/post/${id}`}
        onSave={save}
      />
    </section>
  )
}

export default EditPostPage
```

Miért vár az űrlap a bejegyzésre? A `PostForm` a `useState(initialValues)`-ban tartja az értékeit, a `useState` pedig
csak a legelső rajzoláskor olvassa a kezdőértékét. Ha az űrlap a bejegyzés töltődése közben jelenne meg, üresen
indulna, és üres is maradna, amikor a bejegyzés megjön. A korai visszatérések miatt a `PostForm` először akkor
rajzolódik ki, amikor az értékek már megvannak.

Az `App`-ban eggyel több import és eggyel több útvonal. Írd át az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=6,24
import { useEffect } from 'react'
import useHashRoute, { matchRoute } from './useHashRoute.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import EditPostPage from './pages/EditPostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)

  // Az új oldal a tetején kezdődik, akármilyen mélyre görgettünk az előzőn.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  // A JSX is érték: a címhez tartozó oldal egy változóba kerül.
  let page
  if (route.name === 'list') page = <ListPage />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} />
  else if (route.name === 'new') page = <NewPostPage />
  else if (route.name === 'edit') page = <EditPostPage key={route.id} id={route.id} />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

A bejegyzés oldala alul egy „Szerkesztés” gombot kap, és ha a bejegyzést már szerkesztették, azt is kiírja, mikor.
Írd át az `src/pages/PostPage.jsx`-et:

```jsx file=src/pages/PostPage.jsx mark=28,32-36
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id }) {
  // Új id, új bejegyzés: a deps mondja meg, mikor menjen újra a kérés.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    // 404: a szervernek nincs ilyen azonosítójú bejegyzése. Minden más hiba elmúlhat, ha újrapróbáljuk.
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← Az összes bejegyzés
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          Írta: {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {post.updatedAt && <> · frissítve: {formatDate(post.updatedAt)}</>}
        </p>
      </header>
      <Markdown text={post.body} />
      <footer className="post__actions">
        <a className="button" href={`#/edit/${id}`}>
          Szerkesztés
        </a>
      </footer>
    </article>
  )
}

export default PostPage
```

Az `api.update` egy `updatedAt` dátumot ad a bejegyzésnek. A mintabejegyzéseket még sosem szerkesztették, ezért nincs
`updatedAt`-jük: náluk a sor nem jelenik meg. A `<>…</>` egy [[Fragment]]: összefogja a szöveget és a dátumot, de nem
tesz új elemet az oldalra.

:::check Ellenőrizd
Nyiss meg egy bejegyzést, és kattints alul a „Szerkesztés”-re: a cím `#/edit/…`-ra végződik, felvillan a „Bejegyzés
betöltése…”, és megjelenik a „Bejegyzés szerkesztése” űrlap, benne a bejegyzés címével, szerzőjével és szövegével.
Írd át a címet, és kattints a „Módosítások mentése” gombra: megnyílik a bejegyzés oldala az új címmel, alatta a sor
pedig így végződik: „· frissítve:” és a mai dátum. A listán a kártya is az új címet mutatja. Nyisd meg újra a
„Szerkesztés”-t, változtass valamit, és kattints a „Mégse” gombra: visszakerülsz a bejegyzésre, és semmi sem
változott.
:::

:::mistake Gyakori hiba
Kirajzolni az űrlapot, mielőtt a bejegyzés megjön, például `initialValues={post ?? { title: '', author: '', body: '' }}`
alakban, a betöltési állapot korai visszatérése nélkül. Az űrlap azonnal megjelenik, üresen, és üres is marad, még a
bejegyzés megérkezése után is: a `useState` már beolvasta a kezdőértékét. Várd meg az adatot, aztán rajzold ki az
űrlapot.
:::

:::try Próbáld ki
Szerkessz meg egy mintabejegyzést, aztán töröld a `fake-api:peacock-journal` kulcsot a fejlesztői eszközökben
(**Application** → **Local storage**), és töltsd újra az oldalt. A szerver újra a `seed`-ből indul: a módosításod és
a saját bejegyzéseid eltűntek, mint egy friss telepítés után. (A következő lépés hoz erre egy gombot.)
:::

### Egy bejegyzés törlése

A négy művelet közül az utolsó. A törlést nem lehet visszavonni, ezért két kattintás kell hozzá: az első csak
megkérdezi, biztos vagy-e benne, mint a 11. leckében. A gomb és a kérdése saját komponenst kap, saját állapottal. Hozd
létre az `src/components/DeleteButton.jsx` fájlt:

```jsx file=src/components/DeleteButton.jsx
import { useState } from 'react'
import { api } from '../api.js'
import { navigate } from '../useHashRoute.js'

// A törléshez két kattintás kell: az első csak megkérdezi, biztos vagy-e benne.
function DeleteButton({ id }) {
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle', 'deleting' vagy 'error'

  async function handleDelete() {
    setStatus('deleting')
    try {
      await api.remove('posts', id)
      navigate('/') // a bejegyzés eltűnt: vissza a listára
    } catch {
      setStatus('error')
    }
  }

  if (!confirming) {
    return (
      <button type="button" className="button button--danger-ghost" onClick={() => setConfirming(true)}>
        Törlés
      </button>
    )
  }

  return (
    <div className="confirm">
      <p className="confirm__text">Végleg törlöd ezt a bejegyzést? Ez nem vonható vissza.</p>
      {status === 'error' && <p role="alert">Nem sikerült törölni a bejegyzést. Próbáld újra!</p>}
      <div className="actions">
        <button type="button" className="button button--danger" onClick={handleDelete} disabled={status === 'deleting'}>
          {status === 'deleting' ? 'Törlés…' : 'Igen, töröld'}
        </button>
        <button type="button" className="button" onClick={() => setConfirming(false)} autoFocus>
          Mégse
        </button>
      </div>
    </div>
  )
}

export default DeleteButton
```

- Amíg a `confirming` `false`, a komponens csak a „Törlés” gombot adja vissza. Erre kattintva beállítja a
  `confirming`-et, és a gomb helyén megjelenik a kérdés.
- Az `autoFocus` a „Mégse” gombra teszi a billentyűzetfókuszt, amikor a kérdés megjelenik: ha valaki megszokásból
  ++Enter++-t nyom, nem vész el semmi.
- A sikeres `api.remove` után a `navigate('/')` a listára lép, ami újra betölti a bejegyzéseket, már a törölt nélkül.

Miért külön komponens, és miért nem két újabb `useState` a `PostPage`-ben? Az állapota csak a gombé, a `PostPage`-ben
pedig korai visszatérések vannak. A hookokat minden rajzoláskor ugyanabban a sorrendben kell meghívni (a
[[hookok szabálya]]), így egy korai visszatérés alatti `useState` elrontaná az oldalt (a lenti doboz megmutatja,
hogyan). Egy saját komponensben fel sem merül a probléma.

A gomb a „Szerkesztés” mellé kerül. Írd át az `src/pages/PostPage.jsx`-et:

```jsx file=src/pages/PostPage.jsx mark=6,37
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import DeleteButton from '../components/DeleteButton.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id }) {
  // Új id, új bejegyzés: a deps mondja meg, mikor menjen újra a kérés.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    // 404: a szervernek nincs ilyen azonosítójú bejegyzése. Minden más hiba elmúlhat, ha újrapróbáljuk.
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← Az összes bejegyzés
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          Írta: {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {post.updatedAt && <> · frissítve: {formatDate(post.updatedAt)}</>}
        </p>
      </header>
      <Markdown text={post.body} />
      <footer className="post__actions">
        <a className="button" href={`#/edit/${id}`}>
          Szerkesztés
        </a>
        <DeleteButton id={id} />
      </footer>
    </article>
  )
}

export default PostPage
```

Ha minden bejegyzést törölsz, a lista azt írja: „Még nincs bejegyzés.” Mostantól ott egy gomb is megjelenik, ami
visszahozza a mintabejegyzéseket: az `api.reset()` hatására az álszerver elfelejt minden változtatást, és újra a `seed`-ből indul, a
`reload` pedig újra elkéri tőle a listát. Írd át az `src/pages/ListPage.jsx`-et:

```jsx file=src/pages/ListPage.jsx mark=13-16,28-35
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage() {
  // []: a lista egyszer töltődik be, amikor az oldal megjelenik.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Minden rajzoláskor a szerver válaszából számoljuk ki: származtatott érték, nem állapot.
  const posts = status === 'success' ? newestFirst(data) : []

  function restoreSamples() {
    api.reset() // az álszerver elfelejt minden változtatást, és újra a seedből indul
    reload()
  }

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">Az összes bejegyzés</h1>
        <a className="button button--primary" href="#/new">
          + Új bejegyzés
        </a>
      </div>
      {status === 'loading' && <p className="state">Bejegyzések betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a bejegyzéseket." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && (
        <div className="state">
          <p>Még nincs bejegyzés.</p>
          <button type="button" className="button" onClick={restoreSamples}>
            Mintabejegyzések visszaállítása
          </button>
        </div>
      )}
      {posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

:::check Ellenőrizd
Nyiss meg egy saját bejegyzést, és kattints a „Törlés”-re: egy rózsaszín doboz megkérdezi: „Végleg törlöd ezt a
bejegyzést? Ez nem vonható vissza.”, a billentyűzetfókusz pedig már a „Mégse” gombon van: nyomj ++Enter++-t, és
csak a „Törlés” gomb marad. Kattints újra a „Törlés”-re, aztán az „Igen, töröld”-re: „Törlés…”, majd a lista, a
bejegyzés nélkül. Nyomd meg a böngésző Vissza gombját: a törölt bejegyzés címén „Ez a bejegyzés nem létezik (vagy már
nem).” áll. Most törölj minden bejegyzést, és a lista azt írja: „Még nincs
bejegyzés.” Kattints a „Mintabejegyzések visszaállítása” gombra, és visszajön a négy mintabejegyzés. Kész a középszint: commitold!
:::

:::mistake Gyakori hiba
A kérdés két `useState`-jét a `PostPage`-be tenni, a korai visszatérések alá. Az első rajzoláskor a bejegyzés
töltődik, a komponens korán visszatér, és a React csak a `useRequest` hookjait számolja meg. Amikor a bejegyzés
megjön, a két új `useState` miatt többet számol, és az oldal leáll ezzel: „Rendered more hooks than during the previous render”. A hookok mindig a
komponens elején állnak, minden `return` előtt.
:::

:::try Próbáld ki
Egy megnyitott bejegyzés oldalán állítsd be az `src/api.js`-ben, hogy `failRate: 1`, és kattints a „Törlés”-re, majd
az „Igen, töröld”-re: a várakozás után a doboz azt írja: „Nem sikerült törölni a bejegyzést. Próbáld újra!”, a
bejegyzés pedig marad. (Maga az oldal is ott maradhat, mert még korábban töltődött be.) Állítsd vissza a `failRate`-et
`0`-ra.
:::

## Haladó szint {level=3}

### A szerzők bejelentkeznek

Eddig bárki írhatott, szerkeszthetett és törölhetett. Egy igazi blogon ezt csak a szerzők tehetik meg: előbb be kell
bizonyítaniuk, kik ők, vagyis be kell jelentkezniük. Ez a [[hitelesítés]]. Az `authors` gyűjtemény az első lépés óta
megvan az adatbázisban: a `sampleData.js`-ben két szerző van, Rika (jelszó: `peacock`) és Sam (jelszó: `pancakes`).

Egy igazi szerveren a bejelentkezés is egy kérés: az oldal elküldi a nevet és a jelszót, a szerver pedig ellenőrzi
őket. Az álszerverünk szűrővel is tud elemeket keresni: az `api.list('authors', filter)` csak azokat az elemeket adja
vissza, amelyekre a `filter` `true`-t ad. Írd a `logIn` függvényt az `src/api.js` végére:

```js file=src/api.js
// „POST /login”: megkeresi a szerzőt ezzel a névvel és jelszóval.
// A válasz a szerző a jelszava nélkül; ha nincs ilyen, egy 401-es állapotú hiba.
export async function logIn(name, password) {
  const found = await api.list(
    'authors',
    (author) => author.name.toLowerCase() === name.toLowerCase() && author.password === password,
  )
  if (found.length === 0) {
    const error = new Error('Hibás név vagy jelszó.')
    error.status = 401
    throw error
  }
  return { id: found[0].id, name: found[0].name }
}
```

- A szűrő a „szerveren” fut: az oldal csak az illeszkedő szerzőket kapja vissza, sosem az egész listát mindenki
  jelszavával. A `toLowerCase()` engedékennyé teszi a nevet: a `rika` és a `Rika` ugyanaz a szerző. A jelszónak
  viszont pontosan egyeznie kell.
- A `throw` hibát dob ([[hibadobás]]), ami egyenesen a `logIn`-t hívó kód `catch`-ébe ugrik. A `status`-a 401, a „ki
  vagy te?” HTTP-állapotkódja: ezt küldené egy igazi szerver is.
- A válaszban csak az `id` és a `name` van. Egy jelszónak semmi keresnivalója az oldal állapotában.

A bejelentkezett szerzőnek túl kell élnie az újratöltést. A 9–11. és a 21. leckében pont erre írtál egy
`useLocalStorage` hookot: úgy működik, mint a `useState`, de az értéket [[JSON]]-szövegként a localStorage-ben is
eltárolja. Ha megtartottad a sajátodat, másold be az `src` mappába; ha nem, hozd létre az `src/useLocalStorage.js`
fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Úgy működik, mint a useState, de az érték túléli az újratöltést:
// JSON-ként a localStorage-ben tároljuk, a megadott kulcs alatt.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Letiltott tárhely vagy sérült mentés: marad a kezdőérték.
    }
    return initialValue
  })

  // Mentés minden változás után.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Nem baj, ha nem sikerül: az érték így is működik, csak nem emlékszik rá.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

Egy rövid emlékeztető: a `useState`-nek átadott függvény csak az első rajzoláskor fut le (ez a
[[lusta kezdőérték]]), és a `JSON.parse`-szal olvassa vissza az elmentett szöveget. Az effekt minden változás után a
`JSON.stringify`-jal menti az értéket.

A bejelentkezőoldalon egy név, egy jelszó és egy gomb van. Hozd létre az `src/pages/LoginPage.jsx` fájlt:

```jsx file=src/pages/LoginPage.jsx
import { useState } from 'react'
import { logIn } from '../api.js'

function LoginPage({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false) // úton van a bejelentkezés?
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const author = await logIn(name.trim(), password)
      onLogin(author)
    } catch (err) {
      setError(err.status === 401 ? 'Hibás név vagy jelszó.' : 'A szerver most nem válaszol. Próbáld újra!')
      setBusy(false)
    }
  }

  return (
    <section className="page">
      <h1 className="page__title">Bejelentkezés</h1>
      <p className="muted">
        Bejegyzést írni, szerkeszteni és törölni csak a blog szerzői tudnak. Gyakorlófiókok: Rika (jelszó: peacock) és
        Sam (jelszó: pancakes).
      </p>
      <form className="login" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Név</span>
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" required />
        </label>
        <label className="field">
          <span className="field__label">Jelszó</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="button button--primary" disabled={busy}>
            {busy ? 'Bejelentkezés…' : 'Bejelentkezés'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default LoginPage
```

- A `required` megkéri a böngészőt, hogy üres mezővel ne küldje el az űrlapot: itt elég a saját kis buboréka.
- A `busy` letiltja a gombot, amíg a válasz úton van, mint a 21. leckében. Sikeres bejelentkezés után az oldal
  eltűnik, így nem kell visszaállítania; hiba után viszont igen, hogy újra próbálkozhass. A `catch`-en belül a hiba
  neve `err`, mert az `error` már az állapot neve.
- Az `autoComplete` megmondja a böngészőnek, melyik mező a felhasználónév, és melyik a jelszó, így egy jelszókezelő
  ki tudja tölteni őket.

A bejelentkezőoldal saját címet kap: `#/login`. Az `src/useHashRoute.js`-ben cseréld le a `matchRoute`-ot:

```js file=src/useHashRoute.js mark=6
// Melyik oldal tartozik egy útvonalhoz? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new' }
  if (parts.length === 1 && parts[0] === 'login') return { name: 'login' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  if (parts.length === 2 && parts[0] === 'edit') return { name: 'edit', id: parts[1] }
  return { name: 'notFound' }
}
```

Az `App` tartja számon a bejelentkezett szerzőt: ez a [[munkamenet]]. A `null` azt jelenti, hogy senki sincs
bejelentkezve. A fejléc egy „Bejelentkezés” linket mutat, vagy a szerző nevét egy „Kijelentkezés” gombbal. Írd át az
`src/App.jsx`-et:

```jsx file=src/App.jsx mark=2-3,8,15-16,23-26,34,40,44-60
import { useEffect } from 'react'
import useHashRoute, { matchRoute, navigate } from './useHashRoute.js'
import useLocalStorage from './useLocalStorage.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import EditPostPage from './pages/EditPostPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)
  // A bejelentkezett szerző ({ id, name }) vagy null. A localStorage-ben van, így az újratöltés nem jelentkeztet ki.
  const [author, setAuthor] = useLocalStorage('peacock-journal:author', null)

  // Az új oldal a tetején kezdődik, akármilyen mélyre görgettünk az előzőn.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  function handleLogin(newAuthor) {
    setAuthor(newAuthor)
    navigate('/')
  }

  // A JSX is érték: a címhez tartozó oldal egy változóba kerül.
  let page
  if (route.name === 'list') page = <ListPage />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} />
  else if (route.name === 'new') page = <NewPostPage />
  else if (route.name === 'edit') page = <EditPostPage key={route.id} id={route.id} />
  else if (route.name === 'login') page = <LoginPage onLogin={handleLogin} />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <div className="blog__bar">
          <a className="blog__title" href="#/">
            The Peacock Journal
          </a>
          <div className="blog__account">
            {author ? (
              <>
                <span>
                  Bejelentkezve: <strong>{author.name}</strong>
                </span>
                <button type="button" className="button button--small" onClick={() => setAuthor(null)}>
                  Kijelentkezés
                </button>
              </>
            ) : (
              <a className="button button--small" href="#/login">
                Bejelentkezés
              </a>
            )}
          </div>
        </div>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

Az `author ? (…) : (…)` a [[ternáris operátor]]: ha van szerző, a neve és a „Kijelentkezés” gomb, ha nincs, a
„Bejelentkezés” link. Az új `blog__bar` egy sorba teszi a címet és a bejelentkezést (az `App.css` gondoskodik róla). A
kijelentkezés egyszerűen `setAuthor(null)`: a hook `null`-t ment, és senki sincs többé bejelentkezve.

:::check Ellenőrizd
A sáv jobb felső részén egy „Bejelentkezés” gomb van. Kattints rá: a cím `#/login`-ra végződik, és megjelenik a
bejelentkezőűrlap. Írd be, hogy `Rika`, és egy rossz jelszót: egy pillanatra „Bejelentkezés…”, aztán pirossal „Hibás
név vagy jelszó.” Most `rika` és `peacock`: megjelenik a lista, a sávon pedig „Bejelentkezve: Rika” áll, egy
„Kijelentkezés” gombbal. Töltsd újra az oldalt: még mindig be vagy jelentkezve. A fejlesztői eszközökben az
**Application** → **Local storage** alatt a `peacock-journal:author` kulcsban `{"id":"rika","name":"Rika"}` áll,
jelszó nélkül. Kattints a „Kijelentkezés”-re: visszajön a „Bejelentkezés” gomb.
:::

:::concept Hogyan működik egy igazi bejelentkezés?
Egy igazi szerver sosem tárolja magát a jelszót, csak a [[hash]]-ét: egy ujjlenyomatot, amiből a jelszót nem lehet
visszafejteni. Bejelentkezéskor ugyanazt az ujjlenyomatot készíti el abból, amit beírtál, és összehasonlítja a
kettőt. A bejelentkezés titkosított `https://` kapcsolaton utazik, a szerver pedig egy [[hozzáférési tokennel|hozzáférési token]]
válaszol (21. lecke), amit az oldal minden későbbi kéréssel elküld: ebből tudja a szerver, ki kérdez. Az álszerverünk
sima szövegként tartja a jelszavakat a localStorage-ben, ahol bárki elolvashatja őket: gyakorlásra jó, valódi
adatokra soha. Ezért ne használj soha valódi jelszót ebben a projektben.
:::

:::mistake Gyakori hiba
A szerzőt egy sima `useState(null)`-ban tartani. A bejelentkezés működik, de minden újratöltés kijelentkeztet, mert az
állapot csak addig él, amíg az oldal nyitva van. A munkamenetet olyan helyre kell menteni, ami túléli az
újratöltést: itt a localStorage-be.
:::

### Csak a szerzők írhatnak

A bejelentkezés megmondja, ki vagy. Az, hogy mit tehetsz, egy másik kérdés, ez a [[jogosultság-ellenőrzés]]: írni és
szerkeszteni csak bejelentkezett szerzők tudnak, egy bejegyzést pedig csak a saját szerzője módosíthat. Négy helyen
kell a szabály: az „Új bejegyzés” gombnál, a „Szerkesztés” és „Törlés” gomboknál, az írás oldalán és a
szerkesztőoldalon.

Először maga a szabály, egyetlen helyen. Írd a `canEdit` függvényt az `src/posts.js` végére:

```js file=src/posts.js
// Módosíthatja ez a szerző ezt a bejegyzést? Csak a saját szerzője. A bejelentkezés előtti bejegyzéseknek nincs
// authorId-juk: azokat bármelyik bejelentkezett szerző módosíthatja.
export function canEdit(post, author) {
  return author !== null && (!post.authorId || post.authorId === author.id)
}
```

A mintabejegyzéseknek van `authorId`-juk (`'rika'` vagy `'sam'`). A középszinten írt bejegyzéseidnek nincs: rájuk a
`!post.authorId` `true`, így bármelyik szerző módosíthatja őket. A zárójelek fontosak: „van szerző, **és** (a
bejegyzésnek nincs gazdája, **vagy** a szerzőé)”.

Az `App`-ban az írás és a szerkesztés oldala [[védett oldal]] lesz: bejelentkezett szerző nélkül a helyükön a
bejelentkezőűrlap jelenik meg. A bejelentkezés után ugyanaz a cím már a kért oldalt rajzolja, mert az `App` újra
kirajzolódik az új szerzővel. Minden oldal, aminek tudnia kell róla, megkapja az `author` propot. Írd át az
`src/App.jsx`-et:

```jsx file=src/App.jsx mark=25-26,29-30,34-38
import { useEffect } from 'react'
import useHashRoute, { matchRoute, navigate } from './useHashRoute.js'
import useLocalStorage from './useLocalStorage.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import EditPostPage from './pages/EditPostPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)
  // A bejelentkezett szerző ({ id, name }) vagy null. A localStorage-ben van, így az újratöltés nem jelentkeztet ki.
  const [author, setAuthor] = useLocalStorage('peacock-journal:author', null)

  // Az új oldal a tetején kezdődik, akármilyen mélyre görgettünk az előzőn.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  function handleLogin(newAuthor) {
    setAuthor(newAuthor)
    // A bejelentkezőoldalról a főoldalra megyünk. Védett oldalon maradunk: az most magától megnyílik.
    if (route.name === 'login') navigate('/')
  }

  // Íráshoz és szerkesztéshez bejelentkezett szerző kell: bárki más a helyükön a bejelentkezőűrlapot kapja.
  const needsAuthor = route.name === 'new' || route.name === 'edit'

  // A JSX is érték: a címhez tartozó oldal egy változóba kerül.
  let page
  if (route.name === 'login' || (needsAuthor && !author)) page = <LoginPage onLogin={handleLogin} />
  else if (route.name === 'list') page = <ListPage author={author} />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} author={author} />
  else if (route.name === 'new') page = <NewPostPage author={author} />
  else if (route.name === 'edit') page = <EditPostPage key={route.id} id={route.id} author={author} />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <div className="blog__bar">
          <a className="blog__title" href="#/">
            The Peacock Journal
          </a>
          <div className="blog__account">
            {author ? (
              <>
                <span>
                  Bejelentkezve: <strong>{author.name}</strong>
                </span>
                <button type="button" className="button button--small" onClick={() => setAuthor(null)}>
                  Kijelentkezés
                </button>
              </>
            ) : (
              <a className="button button--small" href="#/login">
                Bejelentkezés
              </a>
            )}
          </div>
        </div>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

Az `if`-ek sorrendje számít: a bejelentkezés ellenőrzése jön először, így egy védett oldal szerző nélkül el sem
indul.

A listán az „Új bejegyzés” gomb csak a szerzőknek jelenik meg. Az `src/pages/ListPage.jsx`-ben csak két hely
változik: a komponens megkapja az `author` propot, a gomb pedig egy `author && (…)`-ba kerül. Írd át a fájlt:

```jsx file=src/pages/ListPage.jsx mark=7,22-26
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage({ author }) {
  // []: a lista egyszer töltődik be, amikor az oldal megjelenik.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Minden rajzoláskor a szerver válaszából számoljuk ki: származtatott érték, nem állapot.
  const posts = status === 'success' ? newestFirst(data) : []

  function restoreSamples() {
    api.reset() // az álszerver elfelejt minden változtatást, és újra a seedből indul
    reload()
  }

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">Az összes bejegyzés</h1>
        {author && (
          <a className="button button--primary" href="#/new">
            + Új bejegyzés
          </a>
        )}
      </div>
      {status === 'loading' && <p className="state">Bejegyzések betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a bejegyzéseket." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && (
        <div className="state">
          <p>Még nincs bejegyzés.</p>
          <button type="button" className="button" onClick={restoreSamples}>
            Mintabejegyzések visszaállítása
          </button>
        </div>
      )}
      {posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

A bejegyzés oldalán a „Szerkesztés” és a „Törlés” csak akkor jelenik meg, ha a `canEdit` megengedi. Írd át az
`src/pages/PostPage.jsx`-et:

```jsx file=src/pages/PostPage.jsx mark=2,9,33,40
import { api } from '../api.js'
import { canEdit, formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import DeleteButton from '../components/DeleteButton.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id, author }) {
  // Új id, új bejegyzés: a deps mondja meg, mikor menjen újra a kérés.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    // 404: a szervernek nincs ilyen azonosítójú bejegyzése. Minden más hiba elmúlhat, ha újrapróbáljuk.
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← Az összes bejegyzés
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          Írta: {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {post.updatedAt && <> · frissítve: {formatDate(post.updatedAt)}</>}
        </p>
      </header>
      <Markdown text={post.body} />
      {canEdit(post, author) && (
        <footer className="post__actions">
          <a className="button" href={`#/edit/${id}`}>
            Szerkesztés
          </a>
          <DeleteButton id={id} />
        </footer>
      )}
    </article>
  )
}

export default PostPage
```

Az új bejegyzés a bejelentkezésből kapja a szerzőjét: a „Szerző” mező a szerző nevével indul (álnévre azért még
átírható), a szerver pedig az `authorId`-t is elmenti. Írd át az `src/pages/NewPostPage.jsx`-et:

```jsx file=src/pages/NewPostPage.jsx mark=7,10,17-22
import { api } from '../api.js'
import { navigate } from '../useHashRoute.js'
import PostForm from '../components/PostForm.jsx'

const EMPTY_POST = { title: '', author: '', body: '' }

function NewPostPage({ author }) {
  async function save(values) {
    // A szerver válasza az elmentett bejegyzés, az új azonosítójával: egyenesen az oldalára lépünk.
    const post = await api.create('posts', { ...values, authorId: author.id })
    navigate(`/post/${post.id}`)
  }

  return (
    <section className="page">
      <h1 className="page__title">Új bejegyzés</h1>
      <PostForm
        initialValues={{ ...EMPTY_POST, author: author.name }}
        submitLabel="Közzététel"
        cancelHref="#/"
        onSave={save}
      />
    </section>
  )
}

export default NewPostPage
```

Végül a szerkesztőoldal: egy elrejtett gomb nem elég, mert bárki beírhatja a címsorba, hogy `#/edit/welcome`. Ha a
bejelentkezett szerző nem módosíthatja a bejegyzést, az oldal ezt mondja az űrlap helyett. Írd át az
`src/pages/EditPostPage.jsx`-et:

```jsx file=src/pages/EditPostPage.jsx mark=2,9,23
import { api } from '../api.js'
import { canEdit } from '../posts.js'
import useRequest from '../useRequest.js'
import { navigate } from '../useHashRoute.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import PostForm from '../components/PostForm.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function EditPostPage({ id, author }) {
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  async function save(values) {
    // Az update csak a kapott mezőket módosítja, a szerver pedig egy updatedAt dátumot tesz hozzá.
    await api.update('posts', id, values)
    navigate(`/post/${id}`)
  }

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }
  if (!canEdit(post, author)) return <p className="state">Ezt a bejegyzést csak {post.author} szerkesztheti.</p>

  return (
    <section className="page">
      <h1 className="page__title">Bejegyzés szerkesztése</h1>
      {/* Az űrlap csak most rajzolódik ki, amikor a bejegyzés megvan: a useState csak egyszer olvassa az initialValues-t. */}
      <PostForm
        initialValues={{ title: post.title, author: post.author, body: post.body }}
        submitLabel="Módosítások mentése"
        cancelHref={`#/post/${id}`}
        onSave={save}
      />
    </section>
  )
}

export default EditPostPage
```

:::check Ellenőrizd
Jelentkezz ki. A listán nincs „Új bejegyzés” gomb, a bejegyzéseken pedig nincs „Szerkesztés” és „Törlés”. Írd be a
címsorba, hogy `#/new`: a szerkesztő helyén a bejelentkezőűrlap jelenik meg. Jelentkezz be `sam` / `pancakes`
adatokkal: magától megnyílik az „Új bejegyzés” űrlap, a „Szerző” mezőben „Sam” áll. Tegyél közzé egy bejegyzést: van
rajta „Szerkesztés” és „Törlés”. Nyisd meg a „Why this blog uses hash routes” bejegyzést (Samét): rajta is ott vannak.
Nyisd meg a „Writing posts in Markdown” bejegyzést (Rikáét): nincsenek gombok. Írd be, hogy
`#/edit/markdown-basics`: „Ezt a bejegyzést csak Rika szerkesztheti.” Most kattints a „Kijelentkezés”-re: mivel ez
védett oldal, a helyén a bejelentkezőűrlap jelenik meg. Jelentkezz be Rikaként: ugyanezen a címen most már a
„Bejegyzés szerkesztése” űrlap nyílik meg, és a bejegyzés oldalán is ott vannak a gombok.
:::

:::concept Egy elrejtett gomb nem védelem
Mindaz, amit itt csináltunk, a böngészőben történik, a böngésző pedig a felhasználóé. Bárki megnyithatja a fejlesztői
eszközöket, és kézzel küldhet kérést a szervernek, gomb nélkül is. Egy igazi blogon a védelem a **szerveren** van:
minden adatot módosító kérésnél ellenőrzi a tokent, és Sam módosítását Rika bejegyzésén 403-as hibával (Forbidden,
tiltott) utasítja el, akármit mutat az oldal. Az oldal csak elrejti azt, ami úgysem működne, hogy barátságos legyen. Az álszerverünk is a
böngészőben fut, ezért semmit sem tud megvédeni: ez a rész a szokást gyakoroltatja, nem igazi biztonság.
:::

:::mistake Gyakori hiba
`author !== null && !post.authorId || post.authorId === author.id`, a belső zárójelek nélkül. Az `&&` erősebb a
`||`-nél, így ennek a jelentése: „(van szerző, és a bejegyzésnek nincs gazdája) vagy a szerzőé”. Ha senki sincs
bejelentkezve, a második fele is lefut, és az `author.id` leállítja az oldalt ezzel: „Cannot read properties of null
(reading 'id')”.
:::

### Kommentek

Az olvasók kommentet írhatnak a bejegyzések alá. Az adatbázisban a kommentek külön gyűjteményt alkotnak: minden
kommentnek van egy `postId`-ja, ami megmondja, melyik bejegyzéshez tartozik. Az olyan mezőt, amely egy másik
gyűjtemény egy elemére mutat, [[idegen kulcsnak|idegen kulcs]] hívják. A `sampleData.js` mintakommentjei a `markdown-basics` és a
`hash-routing` bejegyzésre mutatnak.

Egy bejegyzés kommentjeit szűrővel töltjük be: `api.list('comments', (comment) => comment.postId === postId)`. Egy
igazi API-nak erre egy ilyen címe lenne: `GET /posts/markdown-basics/comments`. Ha elmentettünk egy új kommentet, a
listának meg kell mutatnia. Betölthetnénk újra az egész listát, de a szerver válasza már maga az elmentett komment:
elég a meglévő lista végére tenni. Ehhez a `useRequest` még egy függvényt kap, a `setData`-t. Írd át az
`src/useRequest.js`-t:

```js file=src/useRequest.js mark=4,34-37,39
import { useEffect, useState } from 'react'

// Elküld egy kérést a szervernek, és megmondja, hogyan áll:
// { status: 'loading' | 'success' | 'error', data, error, reload, setData }
// request: egy függvény, ami Promise-t ad vissza. deps: ha valamelyikük megváltozik, a kérés újra elmegy.
function useRequest(request, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false // a takarítás állítja true-ra: onnantól a válaszra nincs szükség

    async function load() {
      setState({ status: 'loading', data: null, error: null })
      try {
        const data = await request()
        if (!ignore) setState({ status: 'success', data, error: null })
      } catch (error) {
        if (!ignore) setState({ status: 'error', data: null, error })
      }
    }

    load()
    return () => {
      ignore = true
    }
    // A request minden rajzoláskor új függvény, ezért nincs a listában: a deps dönti el, mikor menjen újra.
  }, [...deps, attempt])

  function reload() {
    setAttempt(attempt + 1)
  }

  // Lecseréli az adatot anélkül, hogy újra megkérdezné a szervert: amikor már tudjuk, mi az új adat.
  function setData(data) {
    setState({ status: 'success', data, error: null })
  }

  return { ...state, reload, setData }
}

export default useRequest
```

A kommentek az `src/components/CommentSection.jsx`-be kerülnek:

```jsx file=src/components/CommentSection.jsx
import { useState } from 'react'
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from './ErrorMessage.jsx'

function CommentSection({ postId, author }) {
  // Csak ennek a bejegyzésnek a kommentjei: a szűrő a szerveren válogatja ki őket.
  const comments = useRequest(() => api.list('comments', (comment) => comment.postId === postId), [postId])
  const [name, setName] = useState(author ? author.name : '') // a bejelentkezett szerzőnek nem kell beírnia
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // 'idle', 'sending' vagy 'error'

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '' || text.trim() === '') return
    setStatus('sending')
    try {
      const saved = await api.create('comments', { postId, name: name.trim(), text: text.trim() })
      // A szerver válasza az elmentett komment: a meglévő lista végére kerül.
      comments.setData([...comments.data, saved])
      setText('')
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Kommentek</h2>
      {comments.status === 'loading' && <p className="muted">Kommentek betöltése…</p>}
      {comments.status === 'error' && (
        <ErrorMessage text="Nem sikerült betölteni a kommenteket." onRetry={comments.reload} />
      )}
      {comments.status === 'success' && (
        <>
          {comments.data.length === 0 && <p className="muted">Még nincs komment. Írd meg az elsőt!</p>}
          <ul className="comment-list">
            {comments.data.map((comment) => (
              <li key={comment.id} className="comment">
                <p className="meta">
                  <strong>{comment.name}</strong> · <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                </p>
                <p className="comment__text">{comment.text}</p>
              </li>
            ))}
          </ul>
          <form className="comment-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">A neved</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required />
            </label>
            <label className="field">
              <span className="field__label">Komment</span>
              <textarea value={text} onChange={(event) => setText(event.target.value)} rows={3} required />
            </label>
            {status === 'error' && (
              <p className="alert" role="alert">
                Nem sikerült elküldeni a kommentet. Próbáld újra!
              </p>
            )}
            <div className="actions">
              <button type="submit" className="button button--primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Küldés…' : 'Komment küldése'}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  )
}

export default CommentSection
```

- Ezúttal nem szedjük szét a hook válaszát: a `comments.status`, a `comments.data` és a `comments.reload` jól
  olvasható, a komponens saját `status`-a (a küldésé) pedig saját nevet kap.
- `useState(author ? author.name : '')`: a bejelentkezett szerző a nevét már a mezőben találja. A kezdőértéket a
  `useState` csak egyszer olvassa be, amikor a szakasz megjelenik, mint minden kezdőértéket.
- A `[...comments.data, saved]` új tömb: a régi kommentek, a végén az újjal. Ahogy mindig, most sem `push`-olunk az
  állapotba, hanem új tömböt adunk át.
- Küldés után a kommentdoboz kiürül, a név viszont marad: a következő kommentet gyorsabb megírni.
- Az űrlap csak akkor jelenik meg, amikor a kommentek betöltődtek: előtte nem lenne lista, amihez hozzáadhatnánk.
- A komment szövege egy `comment__text` bekezdésben van, az `App.css` pedig megtartja a sortöréseit
  (`white-space: pre-line`). A kommentek sima szövegek, nem Markdown: a React pontosan úgy mutatja őket, ahogy
  beírták.

A kommentek a bejegyzés alá kerülnek. Az oldal most két dolgot ad vissza egymás mellett, ezért egy Fragment fogja
össze őket. Írd át az `src/pages/PostPage.jsx`-et:

```jsx file=src/pages/PostPage.jsx mark=7,22,44-45
import { api } from '../api.js'
import { canEdit, formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import DeleteButton from '../components/DeleteButton.jsx'
import CommentSection from '../components/CommentSection.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id, author }) {
  // Új id, új bejegyzés: a deps mondja meg, mikor menjen újra a kérés.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    // 404: a szervernek nincs ilyen azonosítójú bejegyzése. Minden más hiba elmúlhat, ha újrapróbáljuk.
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }

  return (
    <>
      <article className="post">
        <a className="back" href="#/">
          ← Az összes bejegyzés
        </a>
        <header className="post__header">
          <h1 className="post__title">{post.title}</h1>
          <p className="meta">
            Írta: {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            {post.updatedAt && <> · frissítve: {formatDate(post.updatedAt)}</>}
          </p>
        </header>
        <Markdown text={post.body} />
        {canEdit(post, author) && (
          <footer className="post__actions">
            <a className="button" href={`#/edit/${id}`}>
              Szerkesztés
            </a>
            <DeleteButton id={id} />
          </footer>
        )}
      </article>
      <CommentSection postId={id} author={author} />
    </>
  )
}

export default PostPage
```

Még egy dolog: ha egy bejegyzést törölnek, a kommentjeinek vele kell menniük. Különben örökre az adatbázisban
maradnak, egy már nem létező bejegyzésre mutatva. Írd a `deletePost` függvényt az `src/api.js` végére:

```js file=src/api.js
// Töröl egy bejegyzést a kommentjeivel együtt, hogy egy komment se maradjon a bejegyzése nélkül.
export async function deletePost(id) {
  const comments = await api.list('comments', (comment) => comment.postId === id)
  for (const comment of comments) {
    await api.remove('comments', comment.id)
  }
  await api.remove('posts', id)
}
```

A `for … of` cikluson belüli `await` minden törlést megvár, mielőtt a következő elindul. Most a `DeleteButton` ezt
használja. Írd át az `src/components/DeleteButton.jsx`-et:

```jsx file=src/components/DeleteButton.jsx mark=2,13
import { useState } from 'react'
import { deletePost } from '../api.js'
import { navigate } from '../useHashRoute.js'

// A törléshez két kattintás kell: az első csak megkérdezi, biztos vagy-e benne.
function DeleteButton({ id }) {
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle', 'deleting' vagy 'error'

  async function handleDelete() {
    setStatus('deleting')
    try {
      await deletePost(id) // a bejegyzést, és a kommentjeit is
      navigate('/') // a bejegyzés eltűnt: vissza a listára
    } catch {
      setStatus('error')
    }
  }

  if (!confirming) {
    return (
      <button type="button" className="button button--danger-ghost" onClick={() => setConfirming(true)}>
        Törlés
      </button>
    )
  }

  return (
    <div className="confirm">
      <p className="confirm__text">Végleg törlöd ezt a bejegyzést? Ez nem vonható vissza.</p>
      {status === 'error' && <p role="alert">Nem sikerült törölni a bejegyzést. Próbáld újra!</p>}
      <div className="actions">
        <button type="button" className="button button--danger" onClick={handleDelete} disabled={status === 'deleting'}>
          {status === 'deleting' ? 'Törlés…' : 'Igen, töröld'}
        </button>
        <button type="button" className="button" onClick={() => setConfirming(false)} autoFocus>
          Mégse
        </button>
      </div>
    </div>
  )
}

export default DeleteButton
```

:::check Ellenőrizd
Nyisd meg a „Writing posts in Markdown” bejegyzést: alatta betöltődik egy „Kommentek” doboz Bence és Mia kommentjével
és a dátumukkal. Nyisd meg a „Picking colours for a website” bejegyzést: „Még nincs komment. Írd meg az elsőt!” Írj
oda egy kommentet a neveddel: „Küldés…”, aztán a komment megjelenik a lista végén, a kommentdoboz újra üres, a neved
pedig ott maradt. Töltsd újra az oldalt: a komment még mindig ott van. Most jelentkezz be, írj egy próbabejegyzést,
és másold ki az azonosítóját a címsorból (a `#/post/` utáni részt). Kommentelj alá kétszer, és töröld a bejegyzést. A
fejlesztői eszközökben az **Application** → **Local storage** alatt kattints a `fake-api:peacock-journal` kulcsra: a
`comments` listájában egyetlen komment `postId`-ja sem ez az azonosító.
:::

:::concept Mit csinál itt egy igazi adatbázis?
Egy igazi adatbázisban, például a PostgreSQL-ben, a két tábla közötti kapcsolatot magába az adatbázisba is be lehet
írni: egy komment `postId`-jának létező bejegyzésre kell mutatnia, és amikor egy bejegyzést törölnek, az adatbázis
magától törli a kommentjeit („on delete cascade”). Ráadásul mindezt egyetlen [[tranzakcióként|tranzakció]] csinálja: vagy minden
része sikerül, vagy egyik sem. A mi `deletePost`-unk több külön kérés: ha félúton elbukik az egyik, néhány komment már
eltűnt, a bejegyzés viszont még megvan. Egy gyakorló blognál ez elfogadható; egy igazi szerveren a törlés egyetlen kérés
lenne, a többit pedig a szerver intézné.
:::

:::mistake Gyakori hiba
`comments.data.push(saved)` a `setData` helyett. Itt látszólag működik, mert a `setText('')` és a `setStatus('idle')`
úgyis újrarajzolja a komponenst. A `push` viszont a React tudta nélkül változtatja meg az állapotban lévő tömböt: ha
csak ez az egy sor változtatna valamit, a képernyőn semmi sem változna, amíg valami más okból újra nem rajzolódik a
komponens. Az állapotot mindig új értékre cseréljük, sosem változtatjuk meg helyben.
:::

:::try Próbáld ki
Nyisd meg ugyanazt a bejegyzést két böngészőfülön, és írj kommentet az egyikben. A másik fül csak akkor mutatja,
amikor újratöltöd: mindkét fül egyszer töltötte be a kommenteket. Az élő frissítéshez az egyik fülnek üzennie kellene
a másiknak: a `fakeApi.js` végén lévő `createChannel` pont ezt tudja, a csevegős leckék használják is.
:::

### Címkék

A címkék téma szerint csoportosítják a bejegyzéseket: `react`, `markdown`, `design`. A mintabejegyzéseknek már van
`tags` tömbjük. Egy bejegyzésnek akárhány címkéje lehet, minden címke link, a `#/tag/react` pedig a `react` címkéjű
bejegyzéseket listázza.

Egy bejegyzés címkéit egy kis komponens rajzolja, a kártyákon és a bejegyzés oldalán egyaránt. Hozd létre az
`src/components/TagList.jsx` fájlt:

```jsx file=src/components/TagList.jsx
// Egy bejegyzés címkéi, mindegyik egy link az adott címkéjű bejegyzések listájára.
function TagList({ tags }) {
  if (tags.length === 0) return null

  return (
    <ul className="tags">
      {tags.map((tag) => (
        <li key={tag}>
          <a className="tag" href={`#/tag/${encodeURIComponent(tag)}`}>
            #{tag}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default TagList
```

A `return null` semmit sem rajzol: egy címke nélküli bejegyzés nem kap üres listát. Az `encodeURIComponent`
[[URL-kódolást|URL-kódolás]] végez: kódokká alakítja azokat a karaktereket, amelyek nem állhatnak egy címben, például a
szóközt `%20`-szá, a `színek` `í`-jét pedig `%C3%AD`-vé. A routernek vissza kell alakítania őket: a
`decodeURIComponent` az ellenkezőjét csinálja. Az `src/useHashRoute.js`-ben írd a `matchRoute` elé ezt a `decodePart`
függvényt, és cseréld le a `matchRoute`-ot:

```js file=src/useHashRoute.js mark=1-8,18
// '%C3%AD' → 'í'. Egy hibás kód (például egy kézzel beírt '100%') úgy marad, ahogy van.
function decodePart(part) {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

// Melyik oldal tartozik egy útvonalhoz? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new' }
  if (parts.length === 1 && parts[0] === 'login') return { name: 'login' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  if (parts.length === 2 && parts[0] === 'edit') return { name: 'edit', id: parts[1] }
  if (parts.length === 2 && parts[0] === 'tag') return { name: 'tag', tag: decodePart(parts[1]) }
  return { name: 'notFound' }
}
```

Egy hibás %-kódnál (például a kézzel beírt `#/tag/100%`-nál) a `decodeURIComponent` hibát dob. A `matchRoute` az `App`
rajzolása közben fut, így `try/catch` nélkül az egész oldal eltűnne.

A címkeoldal megint a lista, egy szűrővel. Az `src/App.jsx`-ben írj még egy sort az `if`-láncba, közvetlenül a lista
sora után:

```jsx file=src/App.jsx mark=2
  else if (route.name === 'list') page = <ListPage author={author} />
  else if (route.name === 'tag') page = <ListPage author={author} tag={route.tag} />
```

Mindkét sor egy `ListPage`-et rajzol ugyanarra a helyre, ezért amikor a listáról egy címkeoldalra lépsz, a React
megtartja ugyanazt a komponenst, és csak a `tag` propja változik: a bejegyzések újra sem töltődnek. A szűrést a lista
végzi. Írd át az `src/pages/ListPage.jsx`-et:

```jsx file=src/pages/ListPage.jsx mark=7,10,12-13,23,30-34,45-46,48
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage({ author, tag }) {
  // []: a lista egyszer töltődik be, amikor az oldal megjelenik.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Minden rajzoláskor a szerver válaszából számoljuk ki: származtatott értékek, nem állapot.
  const posts = status === 'success' ? newestFirst(data) : []
  // A címkék előtt írt bejegyzéseknek nincs címkéjük: helyettük a ?? [] áll.
  const tagged = tag ? posts.filter((post) => (post.tags ?? []).includes(tag)) : posts

  function restoreSamples() {
    api.reset() // az álszerver elfelejt minden változtatást, és újra a seedből indul
    reload()
  }

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">{tag ? `Bejegyzések #${tag} címkével` : 'Az összes bejegyzés'}</h1>
        {author && (
          <a className="button button--primary" href="#/new">
            + Új bejegyzés
          </a>
        )}
      </div>
      {tag && (
        <a className="back" href="#/">
          ← Az összes bejegyzés
        </a>
      )}
      {status === 'loading' && <p className="state">Bejegyzések betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a bejegyzéseket." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && (
        <div className="state">
          <p>Még nincs bejegyzés.</p>
          <button type="button" className="button" onClick={restoreSamples}>
            Mintabejegyzések visszaállítása
          </button>
        </div>
      )}
      {posts.length > 0 && tagged.length === 0 && <p className="state">Egy bejegyzésnek sincs ilyen címkéje.</p>}
      {tagged.length > 0 && (
        <ul className="post-list">
          {tagged.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

A kártyák a szerző alatt mutatják a címkéket. Írd át az `src/components/PostCard.jsx`-et:

```jsx file=src/components/PostCard.jsx mark=2,16
import { excerpt, formatDate, readingTime } from '../posts.js'
import TagList from './TagList.jsx'

function PostCard({ post }) {
  return (
    <li className="card">
      <p className="meta">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time> · {readingTime(post.body)} perc olvasás
      </p>
      <h2 className="card__title">
        {/* Az App.css az egész kártyára kifeszíti ezt a linket: a kártyán bárhová kattintva megnyílik a bejegyzés. */}
        <a href={`#/post/${post.id}`}>{post.title}</a>
      </h2>
      <p className="card__excerpt">{excerpt(post.body)}</p>
      <p className="meta">Írta: {post.author}</p>
      <TagList tags={post.tags ?? []} />
    </li>
  )
}

export default PostCard
```

A kártya nagy linkje az egész kártyát lefedi, de az `App.css` a címkéket fölé emeli, így egy címkére kattintva a
címkeoldal nyílik meg, bárhová máshová kattintva pedig a bejegyzés. A bejegyzés oldalán a címkék a dátum alá
kerülnek. Az `src/pages/PostPage.jsx`-ben importáld a `TagList`-et a többi komponens mellé:

```jsx file=src/pages/PostPage.jsx
import TagList from '../components/TagList.jsx'
```

és rajzold ki a `<header>` végén, közvetlenül a `<p className="meta">` bekezdés után:

```jsx file=src/pages/PostPage.jsx mark=1
          <TagList tags={post.tags ?? []} />
        </header>
```

:::check Ellenőrizd
A kártyák mutatják a címkéiket: `#news`, `#markdown` és `#writing`, `#react` és `#routing`, `#design`. Kattints egy
kártyán a `#markdown` címkére: nem a bejegyzés, hanem a „Bejegyzések #markdown címkével” oldal nyílik meg, rajta csak
a Markdown-bejegyzéssel és egy „← Az összes bejegyzés” linkkel. A bejegyzés oldalán a címkék a dátum alatt vannak,
és ott is linkek. A `#/tag/nothing` azt írja: „Egy bejegyzésnek sincs ilyen címkéje.” Ugyanezt írja a kézzel beírt
`#/tag/100%` is, az oldal nem tűnik el.
:::

### Címkék a szerkesztőben

Most a szerzők maguk adhatják meg a címkéket. Az űrlapon egyetlen szövegként, vesszővel elválasztva írjuk be őket:
`React, Markdown, tippek`. A szerveren viszont rendes tömbnek kell lenniük: `['react', 'markdown', 'tippek']`. Írd a
`parseTags` függvényt az `src/posts.js` végére:

```js file=src/posts.js
// 'React, Markdown ,, tippek' → ['react', 'markdown', 'tippek']: rendbe tett, kisbetűs, és mindegyik csak egyszer.
export function parseTags(text) {
  const tags = text
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '')
  return [...new Set(tags)]
}
```

A `split(',')` a vesszőknél elvágja a szöveget, a `map` minden darabot rendbe tesz (nincs körülötte szóköz, kisbetűs),
a `filter` pedig kidobja az üreseket (két egymás utáni vessző egy üreset ad). Egy [[Set]] (3. lecke) minden értéket
csak egyszer tárol, így a `[...new Set(tags)]` a tömb ismétlődések nélkül.

Az űrlap egy „Címkék” mezőt kap. Mentéskor a `parseTags` tömbbé alakítja a szöveget. Írd át az
`src/components/PostForm.jsx`-et:

```jsx file=src/components/PostForm.jsx mark=2,43,95-99
import { useState } from 'react'
import { parseTags } from '../posts.js'
import Markdown from './Markdown.jsx'

// Egy bejegyzés szabályai. A válasz: üzenet minden olyan mezőhöz, ami még nincs rendben.
function validate(values) {
  const errors = {}
  if (values.title.trim().length < 3) errors.title = 'A cím legyen legalább 3 karakter hosszú.'
  if (values.author.trim() === '') errors.author = 'Ki írta? Írj be egy nevet.'
  if (values.body.trim().length < 20) errors.body = 'A bejegyzés legyen legalább 20 karakter hosszú.'
  return errors
}

function PostForm({ initialValues, submitLabel, cancelHref, onSave }) {
  const [values, setValues] = useState(initialValues)
  const [showErrors, setShowErrors] = useState(false) // az első mentési próba után true
  const [preview, setPreview] = useState(false) // a szöveget írjuk, vagy az előnézetét nézzük?
  const [status, setStatus] = useState('editing') // 'editing', 'saving' vagy 'error'

  // Származtatott érték: a szabályokat minden rajzoláskor újra megnézzük.
  const errors = validate(values)
  // Az üzenetek csak az első mentési próba után látszanak.
  const shown = showErrors ? errors : {}

  // Egy függvény minden mezőhöz: a mező neve mondja meg, melyik érték változik.
  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // a bejegyzést az oldal maga menti: nincs újratöltés
    if (Object.keys(errors).length > 0) {
      setShowErrors(true)
      return
    }
    setStatus('saving')
    try {
      // Az oldal dönti el, mit jelent a mentés: új bejegyzés létrehozását vagy egy meglévő módosítását.
      await onSave({
        title: values.title.trim(),
        author: values.author.trim(),
        body: values.body.trim(),
        tags: parseTags(values.tags),
      })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Cím</span>
        <input name="title" value={values.title} onChange={handleChange} aria-invalid={Boolean(shown.title)} />
        {shown.title && <span className="field__error">{shown.title}</span>}
      </label>

      <label className="field">
        <span className="field__label">Szerző</span>
        <input name="author" value={values.author} onChange={handleChange} aria-invalid={Boolean(shown.author)} />
        {shown.author && <span className="field__error">{shown.author}</span>}
      </label>

      <div className="field">
        <div className="field__bar">
          <label className="field__label" htmlFor="post-body">
            Szöveg (Markdown)
          </label>
          <div className="tabs">
            <button type="button" className="tab" aria-pressed={!preview} onClick={() => setPreview(false)}>
              Írás
            </button>
            <button type="button" className="tab" aria-pressed={preview} onClick={() => setPreview(true)}>
              Előnézet
            </button>
          </div>
        </div>
        {preview ? (
          <div className="preview">
            <Markdown text={values.body} />
          </div>
        ) : (
          <textarea
            id="post-body"
            name="body"
            rows={14}
            value={values.body}
            onChange={handleChange}
            aria-invalid={Boolean(shown.body)}
          />
        )}
        {shown.body && <span className="field__error">{shown.body}</span>}
      </div>

      <label className="field">
        <span className="field__label">Címkék</span>
        <input name="tags" value={values.tags} onChange={handleChange} placeholder="react, markdown" />
        <span className="field__hint">Vesszővel válaszd el a címkéket.</span>
      </label>

      {status === 'error' && (
        <p className="alert" role="alert">
          Nem sikerült menteni a bejegyzést. Próbáld újra!
        </p>
      )}

      <div className="actions">
        <button type="submit" className="button button--primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Mentés…' : submitLabel}
        </button>
        <a className="button" href={cancelHref}>
          Mégse
        </a>
      </div>
    </form>
  )
}

export default PostForm
```

Az űrlap most már egy `tags` szöveget is vár a kezdőértékei között, ezért mindkét oldalnak adnia kell egyet. Az
`src/pages/NewPostPage.jsx`-ben az üres bejegyzés üres `tags`-et kap:

```jsx file=src/pages/NewPostPage.jsx
const EMPTY_POST = { title: '', author: '', body: '', tags: '' }
```

Az `src/pages/EditPostPage.jsx`-ben a bejegyzés címketömbje a `join` segítségével újra egyetlen szöveg lesz. Cseréld
le a `PostForm` `initialValues` sorát:

```jsx file=src/pages/EditPostPage.jsx
        initialValues={{ title: post.title, author: post.author, body: post.body, tags: (post.tags ?? []).join(', ') }}
```

:::check Ellenőrizd
Jelentkezz be Samként, és szerkeszd meg a „Why this blog uses hash routes” bejegyzést: a „Címkék” mezőben
`react, routing` áll. Írd a végére, hogy `, Tippek , react`, és mentsd el: a bejegyzésnek három címkéje van, `#react`,
`#routing` és `#tippek`, kisbetűvel, a második `react` nélkül. Írj egy új bejegyzést `színek` címkével, aztán kattints
a címkéjére: „Bejegyzések #színek címkével”, pedig a címsor a kódolt alakot is mutathatja: `sz%C3%ADnek`.
:::

:::mistake Gyakori hiba
Kimarad a `tags: ''` az `EMPTY_POST`-ból. Ilyenkor a `values.tags` `undefined`. Ha írsz a „Címkék” mezőbe, a React a
konzolban arra figyelmeztet, hogy egy nem vezérelt mezőből vezérelt lett. Ha üresen hagyod, a „Közzététel” után a
`parseTags` hibát dob („Cannot read properties of undefined (reading 'split')”), a `catch` elkapja, és az űrlap azt
írja: „Nem sikerült menteni a bejegyzést. Próbáld újra!”, pedig a szerverrel semmi baj. Egy űrlap minden mezőjének
kezdőérték kell.
:::

### Keresés

A lista utolsó darabja: egy kereső. A keresés egy mondatban: azokat a bejegyzéseket mutatja, amelyekben a beírt
szavak mindegyike előfordul, a címben, a szövegben vagy a címkék között. Írd a `matchesSearch` függvényt az
`src/posts.js` végére:

```js file=src/posts.js
// Előfordul a keresés minden szava a bejegyzés címében, szövegében vagy címkéi között? A kis- és nagybetű nem számít.
export function matchesSearch(post, query) {
  const text = `${post.title} ${post.body} ${(post.tags ?? []).join(' ')}`.toLowerCase()
  const words = query.toLowerCase().split(' ').filter((word) => word !== '')
  return words.every((word) => text.includes(word))
}
```

A [[template literal]] egyetlen hosszú szöveggé fűzi a címet, a szöveget és a címkéket. Ezt is és a keresést is
kisbetűssé alakítjuk, így a `React` megtalálja a `react`-et. Az [[every]] akkor igaz, ha a függvénye a tömb
**minden** elemére igaz. Üres tömbre is igaz: az üres keresőmező minden bejegyzést mutat.

A keresés még egy származtatott érték a listában: előbb jön a címkeszűrő, aztán a keresés. A mező szövege állapot,
mert a felhasználó változtatja. Írd át az `src/pages/ListPage.jsx`-et:

```jsx file=src/pages/ListPage.jsx mark=1,3,11,16,38-41,53-54,56
import { useState } from 'react'
import { api } from '../api.js'
import { matchesSearch, newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage({ author, tag }) {
  // []: a lista egyszer töltődik be, amikor az oldal megjelenik.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  const [query, setQuery] = useState('')
  // Minden rajzoláskor a szerver válaszából számoljuk ki: származtatott értékek, nem állapot.
  const posts = status === 'success' ? newestFirst(data) : []
  // A címkék előtt írt bejegyzéseknek nincs címkéjük: helyettük a ?? [] áll.
  const tagged = tag ? posts.filter((post) => (post.tags ?? []).includes(tag)) : posts
  const shown = tagged.filter((post) => matchesSearch(post, query))

  function restoreSamples() {
    api.reset() // az álszerver elfelejt minden változtatást, és újra a seedből indul
    reload()
  }

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">{tag ? `Bejegyzések #${tag} címkével` : 'Az összes bejegyzés'}</h1>
        {author && (
          <a className="button button--primary" href="#/new">
            + Új bejegyzés
          </a>
        )}
      </div>
      {tag && (
        <a className="back" href="#/">
          ← Az összes bejegyzés
        </a>
      )}
      <label className="search">
        <span className="visually-hidden">Keresés a bejegyzések között</span>
        <input type="search" placeholder="Keresés…" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {status === 'loading' && <p className="state">Bejegyzések betöltése…</p>}
      {status === 'error' && <ErrorMessage text="Nem sikerült betölteni a bejegyzéseket." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && (
        <div className="state">
          <p>Még nincs bejegyzés.</p>
          <button type="button" className="button" onClick={restoreSamples}>
            Mintabejegyzések visszaállítása
          </button>
        </div>
      )}
      {posts.length > 0 && tagged.length === 0 && <p className="state">Egy bejegyzésnek sincs ilyen címkéje.</p>}
      {tagged.length > 0 && shown.length === 0 && <p className="state">Nincs találat erre: „{query}”.</p>}
      {shown.length > 0 && (
        <ul className="post-list">
          {shown.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

- A `type="search"` keresésre szánt szövegmező: sok böngészőben kap egy kis ✕-et, ami kiüríti, telefonon pedig a
  billentyűzeten „keresés” gomb jelenik meg.
- A `<label>` szövege (a „Keresés a bejegyzések között”) a képernyőolvasóknak szól; a képernyőn elég, amit a
  helykitöltő szöveg mond. Az `App.css` `visually-hidden` osztálya csak a szemek elől rejti el.
- Itt nincs kérés és nincs várakozás. A 20. leckében minden leütés egy kérés lett volna a szervernek, ezért a
  `useDebounce` megvárta a szünetet. Itt a bejegyzések már az oldalon vannak, négy (vagy négyszáz) bejegyzés
  megszűrése pedig nem tart semeddig: a lista minden leütést követ.

:::check Ellenőrizd
Írd be a keresőbe, hogy `react`: gépelés közben eltűnnek azok a kártyák, amelyek nem említik a Reactet. A `REACT`
ugyanezt csinálja. A `markdown preview` csak a Markdown-bejegyzést találja meg: mindkét szó benne van. Egy
címkeoldalon a kereső csak a címke bejegyzései között keres. Az `xyz`-re ez jön: „Nincs találat erre: »xyz«.” A mező
végén lévő ✕ (vagy a szöveg kitörlése) visszahoz minden bejegyzést.
:::

:::try Próbáld ki
A kereső még nem bocsátja meg a hiányzó ékezeteket: a `szinek` nem találja meg a `színek`-et. A 11. lecke `normalize`
függvénye már megoldotta ezt: a `text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()` leveszi az ékezeteket a
betűkről, és kisbetűssé alakítja őket. Másold be a `posts.js`-be `simplify` néven (hogy ne keveredjen a beépített
`normalize`-zal), és használd a szövegre és a keresésre is.
:::

### Minden oldalnak saját cím és leírás (SEO)

A [[SEO]] (search engine optimization, keresőoptimalizálás) mindaz, ami segít a keresőmotoroknak megérteni egy
oldalt, az embereknek pedig megtalálni. A két legfontosabb dolog az oldal `<head>` részében van: a `<title>`, amit a
keresőmotor egy találat címeként mutat (a böngésző pedig a fülön, az előzmények között és a könyvjelzőkben), meg a
leírás, egy [[meta-tag]], aminek a szövege a találat címe alatt jelenik meg. Az `index.html`-ben mindkettő megvan, de
minden oldalra ugyanaz: egy bejegyzés oldalán a fülön is csak „The Peacock Journal” áll.

Egy komponens egy effektben be tudja állítani őket: a `document.title` az oldal címe, a
`document.querySelector('meta[name="description"]')` pedig megtalálja a leírást a `<head>`-ben. Ez rajzoláson kívüli
munka, és minden oldalnak szüksége lesz rá, ezért saját hook lesz belőle. Hozd létre az `src/usePageMeta.js` fájlt:

```js file=src/usePageMeta.js
import { useEffect } from 'react'

const SITE_NAME = 'The Peacock Journal'
const SITE_DESCRIPTION = 'Jegyzetek Reactről, írásról és a webről.'

// Beállítja a böngészőfül címét és a leírást, amelyet a keresőmotorok a cím alatt mutatnak.
// Üres címmel csak a blog neve marad.
function usePageMeta(title, description = SITE_DESCRIPTION) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}

export default usePageMeta
```

A `setAttribute` az oldal egy elemének egy attribútumát változtatja meg, itt a leírás `content`-jét. A `?.` csak
akkor hívja meg, ha az elem létezik. A listán a cím a blog neve, címkeoldalon pedig a címke. Az
`src/pages/ListPage.jsx`-ben importáld a hookot:

```jsx file=src/pages/ListPage.jsx
import usePageMeta from '../usePageMeta.js'
```

és hívd meg közvetlenül a keresés `useState` sora után:

```jsx file=src/pages/ListPage.jsx mark=2
  const [query, setQuery] = useState('')
  usePageMeta(tag ? `#${tag}` : '')
```

Egy bejegyzés oldalán a cím a bejegyzés címe, a leírás pedig a kivonata. Íme a teljes `src/pages/PostPage.jsx`:

```jsx file=src/pages/PostPage.jsx mark=2,4,15-16
import { api } from '../api.js'
import { canEdit, excerpt, formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import usePageMeta from '../usePageMeta.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import DeleteButton from '../components/DeleteButton.jsx'
import CommentSection from '../components/CommentSection.jsx'
import TagList from '../components/TagList.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id, author }) {
  // Új id, új bejegyzés: a deps mondja meg, mikor menjen újra a kérés.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])
  // Hook, ezért a korai visszatérések előtt áll. Amíg a bejegyzés nem jön meg, a fülön a blog neve látszik.
  usePageMeta(post ? post.title : '', post ? excerpt(post.body) : undefined)

  if (status === 'loading') return <p className="state">Bejegyzés betöltése…</p>
  if (status === 'error') {
    // 404: a szervernek nincs ilyen azonosítójú bejegyzése. Minden más hiba elmúlhat, ha újrapróbáljuk.
    if (error.status === 404) return <NotFoundPage text="Ez a bejegyzés nem létezik (vagy már nem)." />
    return <ErrorMessage text="Nem sikerült betölteni a bejegyzést." onRetry={reload} />
  }

  return (
    <>
      <article className="post">
        <a className="back" href="#/">
          ← Az összes bejegyzés
        </a>
        <header className="post__header">
          <h1 className="post__title">{post.title}</h1>
          <p className="meta">
            Írta: {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            {post.updatedAt && <> · frissítve: {formatDate(post.updatedAt)}</>}
          </p>
          <TagList tags={post.tags ?? []} />
        </header>
        <Markdown text={post.body} />
        {canEdit(post, author) && (
          <footer className="post__actions">
            <a className="button" href={`#/edit/${id}`}>
              Szerkesztés
            </a>
            <DeleteButton id={id} />
          </footer>
        )}
      </article>
      <CommentSection postId={id} author={author} />
    </>
  )
}

export default PostPage
```

Ha a `description` `undefined`, a hook az alapértelmezett paraméterét használja, a blog saját leírását. A nem létező
címek oldala pedig a fülén is elmondja, mi a helyzet. Írd át az `src/pages/NotFoundPage.jsx`-et:

```jsx file=src/pages/NotFoundPage.jsx mark=1,5
import usePageMeta from '../usePageMeta.js'

// Olyan címhez, amihez nem tartozik oldal. A text mondja meg, mi a baj; van alapértéke.
function NotFoundPage({ text = 'Ezen a címen nincs semmi.' }) {
  usePageMeta('Nincs ilyen oldal')

  return (
    <section className="state">
      <h1 className="page__title">Nincs ilyen oldal</h1>
      <p>{text}</p>
      <a className="button" href="#/">
        ← Az összes bejegyzés
      </a>
    </section>
  )
}

export default NotFoundPage
```

:::check Ellenőrizd
Nyisd meg a „Writing posts in Markdown” bejegyzést: a böngészőfülön „Writing posts in Markdown · The Peacock Journal”
áll. A fejlesztői eszközökben az **Elements** fülön nyisd ki a `<head>`-et: a `<meta name="description">` `content`-je
a bejegyzés eleje. A listán a fül újra „The Peacock Journal”-t mutat, egy címkeoldalon pedig „#markdown · The Peacock
Journal”-t. Nyomd meg és tartsd lenyomva a böngésző Vissza gombját (vagy kattints rá jobb gombbal): az előzmények a
címükkel sorolják fel az oldalakat. A `#/hello`-ra „Nincs ilyen oldal · The Peacock Journal” jön. Gratulálunk, kész a
blogod!
:::

:::concept Amit a keresőmotorok látnak, és amit nem
A cím és a leírás jó kezdet, de a HTML többi része is számít: minden oldalon egy `<h1>` (ezért lett a Markdown `#`-jéből
`<h2>`), sorrendben következő címek, `<time>` `dateTime`-mal és `alt` szövegek a képeken. Ennek a blognak viszont két
gyenge pontja van. Az egyik, hogy a szerver által küldött HTML szinte üres, egy `<div id="root">`; a bejegyzések csak
a JavaScript lefutása után jelennek meg. A Google lefuttatja a JavaScriptet, de később és nem mindig, a
csevegőalkalmazások linkelőnézetei pedig egyáltalán nem. A másik, hogy a `#` után minden láthatatlan a keresőmotorok számára: nekik az
egész blog egyetlen oldal. Az igazi blogok ezért valódi útvonalakat használnak (`/post/welcome`, mint a React Router
`BrowserRouter`-e), és minden oldal HTML-jét a szerveren készítik el ([[szerveroldali renderelés]]), vagy előre, az
oldal építésekor ([[statikus oldalgenerálás]]): ezt csinálják az olyan keretrendszerek, mint a Next.js vagy az Astro.
Közzétesznek egy `sitemap.xml`-t is, az összes oldal listáját, és [[Open Graph]]-tageket (`og:title`, `og:image`) az
előnézetekhez.
:::

:::try Feladat
Adj címet a többi oldalnak is: `usePageMeta('Új bejegyzés')` a `NewPostPage`-ben, `usePageMeta('Bejegyzés
szerkesztése')` az `EditPostPage`-ben (az elején, a korai visszatérések előtt) és `usePageMeta('Bejelentkezés')` a
`LoginPage`-ben. Aztán a fejlesztői eszközökben futtasd le a Lighthouse-t (1. lecke) egy bejegyzés oldalán, csak az
**SEO** kategóriát bejelölve.
:::
