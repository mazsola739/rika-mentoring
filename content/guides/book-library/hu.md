# Mit építünk?

Egy saját olvasólistát: minden könyv a három polc egyikén áll („Szeretném elolvasni”, „Olvasom”, „Elolvastam”), és
egy kattintással átteheted egy másikra. Új könyvet keresővel találsz: beírsz egy címet, egy szerzőt vagy egy témát,
az app pedig megkérdezi a lecke saját könyv-[[API]]-ját, és megmutatja a találatokat, borítóval együtt. A haladó
szinten csillagokkal értékeled az elolvasott könyveket, jegyzetet írsz hozzájuk, kitűzöd az éves olvasási célodat és
megnézed a statisztikádat, a végén pedig bejelentkezel, így a polcaid a fiókodba kerülnek egy (kitalált) szerveren,
ahogy a valódi appok minden eszközöd számára őrzik őket.

Közben megtanulod, hogyan beszélget egy app egy API-val: hogyan küldesz kérést `fetch`-csel, hogyan mutatod a
töltést, a hibát és azt, hogy „nincs találat”, hogyan alakítod az API adatait a saját appod formájára, és hogyan
olvassa több nézet (a polcok, a találatok, a statisztika) ugyanazt az egyetlen könyvlistát.

:::levels
- Saját könyvlista: cím, szerző és egy átállítható olvasási státusz, a böngészőbe mentve. | kb. 2 óra
- Könyvkeresés a lecke saját könyv-API-jában `fetch`-csel és `useFetch` hookkal, három polc, könyvek áthelyezése egyikről a másikra. | kb. 3 óra
- Csillagos értékelés és jegyzetek, olvasási cél statisztikával, bejelentkezés és a polcaid a szerveren. | kb. 4 óra
:::

**Előismeret:** az eddigi leckék. Leginkább ezekre építünk: listák `map`-pel és `key`-vel, vezérelt űrlapmezők,
elemek hozzáadása, módosítása és törlése `map`-pel és `filter`-rel, valamint a `useLocalStorage` hook (6. és 9–11.
lecke); `async`/`await`, `try/catch` és takarító függvényes effektek (3. és 12. lecke); a `fetch`, a töltés és a hiba
állapota, meg a `useFetch` hook (14. és 20. lecke). Amit felidézünk, arról egy-két mondatban újra elmondjuk, mi az;
minden újat lépésről lépésre elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/21-book-library/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Ugyanúgy indulsz, mint az 1. leckében, és annak a 0. lépése minden
parancsot részletesen elmagyaráz. Röviden: nyiss egy terminált a munkamappádban, ahol a `rika-mentoring` repó van, hozd
le az új leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját `book-library` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/21-book-library/exercise book-library
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/21-book-library/exercise` mappát a munkamappádba, `book-library` néven. A `cp -r`
PowerShellben, Macen és Linuxon is működik; fájlkezelővel is megy: másold át a mappát, és nevezd át a másolatot. A
másolatodban dolgozol: a repó érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `book-library` mappát a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite, MSW)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Világosszürke oldalt látsz, rajta egy
sötétzöld sávot „Book Library” címmel és egy angol mondattal: „Your books, on your own shelves.” Más még nincs rajta: a
könyvek a te dolgod.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. Az első terminált az `npm run dev`
foglalja, ezért nyiss egy másodikat a szerkesztőben, a `book-library` mappában:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni.

Most a szokásosnál több fájl van a kiinduló projektben. Ezek a fontosak:

- `src/App.jsx`: maga az oldal. Egyelőre csak a zöld sávot mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért nem kell stílust
  írnod: csak a lépésekben megadott osztályneveket (`panel`, `book`, `results`, `shelf-tabs`, …) használod.
- `src/main.jsx`: mielőtt kirajzolja az appot, elindít egy **kitalált szervert**, ahogy a 14. és a 20. leckében. A
  középszinttől kezdve tőle kéri le az app a könyveket, mintha egy igazi könyv-API lenne az interneten.
- `src/mocks/`: maga a kitalált szerver. A `handlers.js` sorolja fel, mire tud válaszolni a könyv-API, a
  `catalogue.js`-ben vannak a mintakönyvei, az `accounts.js` pedig egy kis fiókszolgáltatás a haladó szinthez.
  Belenézhetsz, de semmit sem kell átírnod bennük.
- `public/mockServiceWorker.js`: a kitalált szerver segédszkriptje. Ne nyúlj hozzá!

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban angolul vannak a megjegyzések és a szövegek. Az első
lépésben a fejléc mondata már magyarul szerepel; a többit is nyugodtan fordítsd le, ha szeretnéd.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza, vagyis HTML-szerű leírást arról, mi jelenjen meg a
képernyőn. Kívülről a [[props]]-ain keresztül kap adatot, emlékezni pedig a [[useState]] segítségével tud: ha egy
állapotérték megváltozik, a React újrarajzolja a komponenst. Ami nem rajzolás, például a mentés, az egy [[useEffect]]-be
kerül. A [[saját hook]] egy `use`-zal kezdődő nevű függvény, ami más hookokat hív, mint a 9–11. lecke
`useLocalStorage`-a. Ha ezek közül valami ismeretlennek tűnik, lapozz vissza az Előismeretnél felsorolt leckékhez.
:::

### Lista egy tömbből

Egy könyvnek négy adata van: egy [[azonosító]] (`id`), a címe (`title`), a szerzője (`author`) és az olvasási
státusza (`status`). Minden könyv tehát egy [[objektum]], a lista pedig objektumok [[tömbje|tömb]].

A státusz háromféle lehet: el szeretnéd olvasni a könyvet, éppen olvasod, vagy már elolvastad. Nem a hosszú szöveget
tároljuk („Szeretném elolvasni”), hanem egy rövid, rögzített kulcsot: `'want'`, `'reading'` vagy `'read'`. Az ilyen
kulcsokat kényelmes összehasonlítani a kódban (`book.status === 'read'`), és akkor sem változnak, ha egyszer az
„Elolvastam” helyett „Kész” lesz a felirat. Hogy melyik kulcshoz melyik szöveg tartozik, azt egyetlen helyen tartjuk
számon. Hozd létre az `src/statuses.js` fájlt:

```js file=src/statuses.js
// A három olvasási státusz. A kulcsot (want, reading, read) mentjük a könyvvel, a szöveget mutatjuk.
export const STATUSES = {
  want: 'Szeretném elolvasni',
  reading: 'Olvasom',
  read: 'Elolvastam',
}
```

Az `export const` [[nevesített export]]: egy másik fájl név szerint, kapcsos zárójelben tölti be. Egy könyv
megjelenítése saját komponenst kap. Hozz létre az `src` mappában egy `components` mappát, benne egy `BookItem.jsx`
fájlt:

```jsx file=src/components/BookItem.jsx mark=1,9
import { STATUSES } from '../statuses.js'

function BookItem({ book }) {
  return (
    <li className="book">
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">{book.author}</span>
        <span className={`badge badge--${book.status}`}>{STATUSES[book.status]}</span>
      </div>
    </li>
  )
}

export default BookItem
```

- `'../statuses.js'`: a fájl a `components` mappában van, ezért a `..` előbb egy mappát feljebb lép, az `src`-be.
- A `STATUSES[book.status]` azt a kulcsot olvassa ki, amelyiknek a neve egy változóban van: ha a `book.status` értéke
  `'reading'`, ugyanaz, mint a `STATUSES.reading`, vagyis „Olvasom”. Ezt a szögletes zárójeles formát a 3. leckében
  használtad.
- A címke két osztályt kap: a `badge`-et és egy státusztól függőt, például a `badge--read`-et. A második színezi
  (sárgára, kékre vagy zöldre, mind benne van az `App.css`-ben). A fordított aposztrófok [[template literal]]-t
  csinálnak belőle (az 1. leckéből ismerős): olyan szöveget, amibe a `${…}` helyén egy érték kerül.

Most cseréld le a teljes `src/App.jsx`-et erre:

```jsx file=src/App.jsx mark=1,4-9,19-26
import BookItem from './components/BookItem.jsx'
import './App.css'

// Néhány könyv kezdésnek, hogy ne legyen üres a lista.
const START_BOOKS = [
  { id: 1, title: 'A Pál utcai fiúk', author: 'Molnár Ferenc', status: 'read' },
  { id: 2, title: 'Egri csillagok', author: 'Gárdonyi Géza', status: 'reading' },
  { id: 3, title: 'Kincskereső kisködmön', author: 'Móra Ferenc', status: 'want' },
]

function App() {
  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>

      <section className="panel">
        <h2>Könyveim</h2>
        <ul className="book-list">
          {START_BOOKS.map((book) => (
            <BookItem key={book.id} book={book} />
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
```

A `map` a tömb minden könyvére meghívja a függvényt, és a visszaadott `<BookItem>` elemekből lesz a lista, ahogy a
9–11. leckében. A [[key]] alapján ismeri fel a React a sorokat, amikor a lista változik, ezért olyan érték kell bele,
ami csak ehhez az egy könyvhöz tartozik, és sosem változik: az azonosítója.

:::check Ellenőrizd
A zöld sáv alatt megjelenik egy „Könyveim” című fehér kártya, benne három könyvvel. Minden cím alatt ott a szerző és
egy színes címke: A Pál utcai fiúknál zöld „Elolvastam”, az Egri csillagoknál kék „Olvasom”, a Kincskereső
kisködmönnél sárga „Szeretném elolvasni”.
:::

:::mistake Gyakori hiba
Kimarad a `key`. A lista így is megjelenik, de a konzol (++F12++ → Console) figyelmeztet: `Each child in a list should
have a unique "key" prop`. Kulcsok nélkül a React csak a helyük alapján tudja megkülönböztetni a sorokat, így amikor a
könyvek mozogni kezdenek, egy sor állapota rossz könyvnél maradhat.
:::

:::try Próbáld ki
Írj egy negyedik könyvet a `START_BOOKS`-ba `id: 4`-gyel és egy tetszőleges státusszal. Aztán próbálj ki egy nem
létező státuszt, például `'lost'`-ot: a címke üres és színtelen marad, mert a `STATUSES.lost` értéke `undefined`.
Utána írd vissza egy létezőre.
:::

### Új könyv hozzáadása

Új könyvet egy űrlapon lehet felvenni. A mezői [[vezérelt mezők|vezérelt mező]], ahogy az 1. lecke kapcsolati
űrlapja óta mindig: az értéküket az állapotból kapják, és minden billentyűleütés frissíti az állapotot. Hozd létre az
`src/components/AddBookForm.jsx` fájlt:

```jsx file=src/components/AddBookForm.jsx
import { useState } from 'react'

function AddBookForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (title.trim() === '') return
    onAdd({ id: crypto.randomUUID(), title: title.trim(), author: author.trim() })
    setTitle('')
    setAuthor('')
  }

  return (
    <form className="panel add-book" onSubmit={handleSubmit}>
      <h2>Új könyv</h2>
      <div className="add-book__fields">
        <label className="field">
          Cím
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          Szerző
          <input value={author} onChange={(event) => setAuthor(event.target.value)} />
        </label>
      </div>
      <button type="submit" className="button button--primary" disabled={title.trim() === ''}>
        Hozzáadás
      </button>
    </form>
  )
}

export default AddBookForm
```

- Az `event.preventDefault()` megállítja a böngésző [[alapértelmezett viselkedését|alapértelmezett viselkedés]]:
  enélkül az űrlap elküldése újratöltené az oldalt.
- A `trim()` levágja a szöveg két végéről a szóközöket, így a csupa szóközből álló cím is üresnek számít. A gomb
  `disabled`, amíg üres a cím, és ilyenkor egy mezőben leütött ++Enter++ sem küldi el az űrlapot. A `handleSubmit`
  mégis ellenőrzi még egyszer: biztos, ami biztos, így akkor is helyes marad, ha a gombot egyszer átírod.
- A 6. leckéből ismert `crypto.randomUUID()` egy [[UUID]]-t készít: egy hosszú, véletlen azonosítót, amit soha
  egyetlen másik könyv sem kap meg.
- Az űrlap nem tudja, hol vannak tárolva a könyvek. Az új könyvet az `onAdd` propon át adja tovább a szülőjének, és
  az dönti el, mi legyen vele.

A könyvek mostantól változnak az oldal használata közben, ezért az `App` állapotába kerülnek. Ez az
[[állapot felemelése]]: a lista az `App`-ban lakik, mert az `App` rajzolja ki, és az űrlap is ide küldi az új
könyveket. Cseréld le az `src/App.jsx`-et erre:

```jsx file=src/App.jsx mark=1-2,14,16-19,31,37
import { useState } from 'react'
import AddBookForm from './components/AddBookForm.jsx'
import BookItem from './components/BookItem.jsx'
import './App.css'

// Néhány könyv kezdésnek, hogy ne legyen üres a lista.
const START_BOOKS = [
  { id: 1, title: 'A Pál utcai fiúk', author: 'Molnár Ferenc', status: 'read' },
  { id: 2, title: 'Egri csillagok', author: 'Gárdonyi Géza', status: 'reading' },
  { id: 3, title: 'Kincskereső kisködmön', author: 'Móra Ferenc', status: 'want' },
]

function App() {
  const [books, setBooks] = useState(START_BOOKS)

  function handleAdd(book) {
    // Új tömb: elöl az új könyv „want” státusszal, utána az összes régi.
    setBooks([{ ...book, status: 'want' }, ...books])
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>

      <section className="panel">
        <h2>Könyveim</h2>
        <ul className="book-list">
          {books.map((book) => (
            <BookItem key={book.id} book={book} />
          ))}
        </ul>
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

A `{ ...book, status: 'want' }` a jól ismert [[spread]]: egy új objektum a `book` összes mezőjével (`id`, `title`,
`author`), plusz egy `status`-szal. Minden új könyv „Szeretném elolvasni” státusszal kezd. A `[…, ...books]` egy új
tömb, elöl az új könyvvel, utána a régiekkel. A régi tömbhöz nem nyúlunk: a React csak akkor veszi észre a
változást, ha új tömböt kap. Ez az [[immutábilis frissítés]].

:::check Ellenőrizd
Írj be egy címet és egy szerzőt, és kattints a „Hozzáadás” gombra (vagy nyomj ++Enter++-t): a könyv megjelenik a
lista tetején, sárga „Szeretném elolvasni” címkével, a mezők pedig kiürülnek. Amíg üres a címmező, a gomb szürke, és
nem lehet rákattintani. Frissítsd az oldalt: az új könyved eltűnt. Ezt a 4. lépés javítja meg.
:::

:::mistake Gyakori hiba
`books.push(newBook)`, utána `setBooks(books)`. Nem jelenik meg semmi: a `push` magát a régi tömböt változtatja meg,
így a React ugyanazt a tömböt kapja, ami már nála van, és úgy gondolja, nincs mit újrarajzolni. A `setBooks` mindig új
tömböt kapjon.
:::

:::try Próbáld ki
Vegyél fel egy könyvet szerző nélkül. A cím alatti sor üres marad; a következő lépés „Ismeretlen szerző”-t ír oda.
:::

### A státusz átállítása és a törlés

A státuszt a listában is át kell tudni állítani. Erre jó egy [[legördülő lista]] (`<select>`): három lehetőség, ebből
egy kiválasztva. Az `<input>`-hoz hasonlóan ez is lehet vezérelt mező: a `value` mondja meg, melyik lehetőség van
kiválasztva, az `onChange` pedig jelzi, ha valaki mást választ. Mellé kerül egy „Törlés” gomb. Cseréld le az
`src/components/BookItem.jsx`-et erre:

```jsx file=src/components/BookItem.jsx mark=3,8,10-29
import { STATUSES } from '../statuses.js'

function BookItem({ book, onStatusChange, onRemove }) {
  return (
    <li className="book">
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">{book.author || 'Ismeretlen szerző'}</span>
        <div className="book__actions">
          <select
            className="book__status"
            aria-label={`Státusz: ${book.title}`}
            value={book.status}
            onChange={(event) => onStatusChange(book.id, event.target.value)}
          >
            {Object.entries(STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button--small button--danger"
            aria-label={`${book.title} törlése`}
            onClick={() => onRemove(book.id)}
          >
            Törlés
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookItem
```

- `book.author || 'Ismeretlen szerző'`: a `||` a bal oldalát adja, ha az „igaznak számít”, különben a jobb oldalát.
  Az üres szöveg hamisnak számít, így a szerző nélküli könyvnél „Ismeretlen szerző” áll.
- A lehetőségeket nem gépeljük be háromszor: az [[Object.entries]] a `STATUSES` objektumból párok tömbjét készíti.
  Minden pár egy kis tömb, benne egy kulccsal és a szövegével: `['want', 'Szeretném elolvasni']`, aztán
  `['reading', 'Olvasom']`, végül `['read', 'Elolvastam']`. A `map` függvényében a `([value, label])` minden párt két
  változóra bont szét. Ez a tömbök [[destrukturálás]]a, ugyanaz,
  mint minden `useState`-es sorban.
- Az `<option>` értéke (`value`) a kulcs, a szövege a felirat. Így az `event.target.value` is kulcs, például `'read'`.
- Az `aria-label` nevet ad a legördülő listának és a gombnak a képernyőolvasók számára. Enélkül minden sorban egy név
  nélküli lista és egy egyszerűen „Törlés” nevű gomb lenne, és egy vak felhasználó nem tudná, melyik könyvhöz
  tartoznak.
- A színes címke eltűnt: a legördülő lista maga mutatja a státuszt.

A `BookItem` két propon át jelzi, mi történt; a munkát az `App` végzi. Cseréld le az `src/App.jsx`-et erre:

```jsx file=src/App.jsx mark=21-24,26-29,40-48
import { useState } from 'react'
import AddBookForm from './components/AddBookForm.jsx'
import BookItem from './components/BookItem.jsx'
import './App.css'

// Néhány könyv kezdésnek, hogy ne legyen üres a lista.
const START_BOOKS = [
  { id: 1, title: 'A Pál utcai fiúk', author: 'Molnár Ferenc', status: 'read' },
  { id: 2, title: 'Egri csillagok', author: 'Gárdonyi Géza', status: 'reading' },
  { id: 3, title: 'Kincskereső kisködmön', author: 'Móra Ferenc', status: 'want' },
]

function App() {
  const [books, setBooks] = useState(START_BOOKS)

  function handleAdd(book) {
    // Új tömb: elöl az új könyv „want” státusszal, utána az összes régi.
    setBooks([{ ...book, status: 'want' }, ...books])
  }

  function handleStatusChange(id, status) {
    // Új tömb, amiben csak ez az egy könyv cserélődik le: egy másolatára, az új státusszal.
    setBooks(books.map((book) => (book.id === id ? { ...book, status } : book)))
  }

  function handleRemove(id) {
    // Új tömb az összes többi könyvvel.
    setBooks(books.filter((book) => book.id !== id))
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>

      <section className="panel">
        <h2>Könyveim</h2>
        {books.length === 0 ? (
          <p className="empty">Még üres a listád. Lent add hozzá az első könyvedet!</p>
        ) : (
          <ul className="book-list">
            {books.map((book) => (
              <BookItem key={book.id} book={book} onStatusChange={handleStatusChange} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

Ez a két minta a 9. lecke teendőlistájából ismerős. A `map` ugyanolyan hosszú új tömböt készít: a megadott
azonosítójú könyv helyére egy másolat kerül (a `{ ...book, status }` a `{ ...book, status: status }` rövid formája),
a többi könyv marad, ami volt. A [[filter]] azokat a könyveket tartja meg, amelyekre a függvény `true`-t ad: itt
mindegyiket, kivéve a megadott azonosítójút. Ha nem maradt könyv, az üres lista helyett egy üzenet jelenik meg: a
kettő közül egy [[ternáris operátor]] választ.

:::check Ellenőrizd
Minden könyvnél ott egy legördülő lista és egy piros feliratú „Törlés” gomb. Állítsd az Egri csillagokat
„Elolvastam”-ra: a lista megtartja a választásodat. Töröld mindhárom könyvet: megjelenik a „Még üres a listád. Lent
add hozzá az első könyvedet!” üzenet. Egy frissítés még mindig visszahozza a három mintakönyvet.
:::

:::mistake Gyakori hiba
`===` a `!==` helyett a `handleRemove`-ban: `books.filter((book) => book.id === id)`. Kattints az egyik könyvnél a
„Törlés”-re, és az **összes többi** eltűnik: a szűrő éppen azt az egyet tartotta meg, amitől meg akartál szabadulni.
A `filter` azt tartja meg, amit leírsz, úgyhogy a maradó könyveket írd le.
:::

:::try Próbáld ki
Írd ki a kártya címében, hány könyved van: `<h2>Könyveim ({books.length})</h2>`.
:::

### Mentés a böngészőbe: useLocalStorage

A listának túl kell élnie egy frissítést. A 9–11. leckében pontosan erre írtál egy `useLocalStorage` [[saját
hook]]ot: úgy működik, mint a `useState`, de az értéket a [[localStorage]]-ben is eltárolja [[JSON]]-szövegként, és a
következő látogatáskor onnan olvassa vissza. Ha megvan a sajátod, másold be az `src`-be; ha nincs, hozd létre az
`src/useLocalStorage.js` fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Úgy működik, mint a useState, de az érték túléli a frissítést:
// JSON-ként tároljuk a localStorage-ben, a megadott kulcs alatt.
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

  // Minden változás után mentünk.
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

Röviden, hogyan működik: a `useState`-nek átadott függvény csak az első rajzoláskor fut le (ez a [[lusta
kezdőérték]]), és a `JSON.parse`-szal olvassa vissza a mentett szöveget. Az effekt a `value` minden változása után
lefut (ezt mondja a [[függőségi tömb]]), és a `JSON.stringify`-jal menti el. A `try/catch` miatt az oldal akkor sem
omlik össze, ha a böngésző letiltja a tárolást, vagy ha elromlott a mentett szöveg.

Az `App`-ban csak két sor változik: az import és a könyvek sora. Itt a teljes fájl, ahogy a kezdő szint végén kinéz:

```jsx file=src/App.jsx mark=1,14
import useLocalStorage from './useLocalStorage.js'
import AddBookForm from './components/AddBookForm.jsx'
import BookItem from './components/BookItem.jsx'
import './App.css'

// Néhány könyv kezdésnek, hogy ne legyen üres a lista.
const START_BOOKS = [
  { id: 1, title: 'A Pál utcai fiúk', author: 'Molnár Ferenc', status: 'read' },
  { id: 2, title: 'Egri csillagok', author: 'Gárdonyi Géza', status: 'reading' },
  { id: 3, title: 'Kincskereső kisködmön', author: 'Móra Ferenc', status: 'want' },
]

function App() {
  const [books, setBooks] = useLocalStorage('book-library-books', START_BOOKS)

  function handleAdd(book) {
    // Új tömb: elöl az új könyv „want” státusszal, utána az összes régi.
    setBooks([{ ...book, status: 'want' }, ...books])
  }

  function handleStatusChange(id, status) {
    // Új tömb, amiben csak ez az egy könyv cserélődik le: egy másolatára, az új státusszal.
    setBooks(books.map((book) => (book.id === id ? { ...book, status } : book)))
  }

  function handleRemove(id) {
    // Új tömb az összes többi könyvvel.
    setBooks(books.filter((book) => book.id !== id))
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>

      <section className="panel">
        <h2>Könyveim</h2>
        {books.length === 0 ? (
          <p className="empty">Még üres a listád. Lent add hozzá az első könyvedet!</p>
        ) : (
          <ul className="book-list">
            {books.map((book) => (
              <BookItem key={book.id} book={book} onStatusChange={handleStatusChange} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

A `useState`-et már nem kell importálni: az `App` a saját hookot hívja, és a `useState` annak a belsejében dolgozik.
Minden más ugyanaz maradhat, mert a `useLocalStorage` ugyanazt a párt adja vissza, mint a `useState`.

:::check Ellenőrizd
Vegyél fel egy könyvet, állíts át egy státuszt, törölj egy könyvet, aztán frissítsd az oldalt (++F5++): minden úgy
van, ahogy hagytad. A fejlesztői eszközökben (++F12++ → Application → Local storage → `http://localhost:5173`)
megtalálod a `book-library-books` kulcsot, mellette JSON-ként a listádat. Kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
Olyan kulcs, amit egy másik app is használ, például csak `'books'`. Minden projekt, amit a `http://localhost:5173`
címen futtatsz, ugyanazt a localStorage-et látja, így egy korábbi lecke adatai bekerülhetnek a listádba, vagy
fordítva. Ezért kezdődik a kulcs az app nevével: `book-library-books`.
:::

:::try Próbáld ki
Töröld a `book-library-books` kulcsot a fejlesztői eszközökben (jobb klikk → Delete), és frissíts: visszajön a három
mintakönyv.
:::

## Középszint {level=2}

### Az első kérés a könyv-API-hoz

Eddig minden könyvet kézzel írtál be. Mostantól egy katalógusból is jöhetnek: egy [[API]]-tól, ami sok könyvet ismer,
és válaszol a kérdéseinkre. A 14. lecke árfolyamainál és a 20. lecke sorozatainál már láttad, hogyan megy ez: az app
egy [[kérés]]t küld egy címre, a [[szerver]] pedig visszaküldi a [[válasz]]t, általában [[JSON]]-ként. Egy keresés
címe így néz ki:

```text
/api/books/search?q=verne
```

A `?` utáni rész a [[query string]]: névvel ellátott értékek a szervernek, a
[[lekérdezési paraméterek|lekérdezési paraméter]]. Itt egyetlen ilyen van, a `q` (a query, vagyis lekérdezés
rövidítése): ez az, amire keresünk. Egy API egy-egy címét, azzal együtt, amit csinál,
[[végpont]]nak hívják. A lecke könyv-API-jának ezek a végpontjai (az `src/mocks/handlers.js` első sorai írják le
őket):

- `GET /api/books/search?q=…`: keresés cím, szerző, téma vagy év alapján.
- `GET /api/books/bk018`: egy könyv részletesen (ebben a leckében nem lesz rá szükség).
- `GET /api/covers/7018-M.svg`: egy könyv borítója, képként.

A `GET` annak a kérésnek a [[HTTP-metódus]]a, amelyik csak lekér valamit, és nem változtat semmin. Egy keresésre
ilyen objektum a válasz (rövidítve):

```json
{
  "q": "verne",
  "numFound": 3,
  "start": 0,
  "page": 1,
  "limit": 12,
  "docs": [
    {
      "key": "/books/bk019",
      "title": "Around the World in Eighty Days",
      "author_name": ["Jules Verne"],
      "first_publish_year": 1872,
      "cover_i": 7019
    }
  ]
}
```

A `numFound` a találatok száma, a `docs` (documents, vagyis dokumentumok) pedig maguknak a könyveknek a tömbje. Az
interneten elérhető igazi katalógus-API-k is így válaszolnak; a miénk egy jól ismert API mezőneveit vette át.

:::concept Honnan jön a válasz? Megint a kitalált szerver
Ahogy a 14. és a 20. leckében, most sincs szerver az interneten az API mögött: az `src/main.jsx` még az app
kirajzolása előtt elindítja a [[Mock Service Worker]]t (MSW). Ennek a [[service worker]]e, vagyis a böngésző által a
lap mellett futtatott kis szkript, elkap minden `/api/…` címre menő kérést, és az `src/mocks/handlers.js` függvényei
válaszolnak rá a `catalogue.js` mintakatalógusából, rövid, véletlen várakozás után, mintha a szerver a világ másik
végén lenne. A kódod ebből semmit sem vesz észre: igazi kéréseket küld, és igazi válaszokat kap. Minden más kérés (maga
az oldal, a szkriptek, a stílusok) érintetlenül megy tovább.
:::

A keresés saját komponenst kap. Hozd létre az `src/components/SearchPanel.jsx` fájlt:

```jsx file=src/components/SearchPanel.jsx mark=7-15,35-44
import { useState } from 'react'

function SearchPanel() {
  const [text, setText] = useState('') // ami a keresőmezőben van
  const [data, setData] = useState(null) // az API utolsó válasza

  async function handleSubmit(event) {
    event.preventDefault()
    const query = text.trim()
    if (query === '') return
    // Az encodeURIComponent címbe illővé teszi a szöveget: "jules verne" → "jules%20verne"
    const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`)
    const answer = await response.json()
    setData(answer)
  }

  return (
    <section className="panel search">
      <h2>Keresés a katalógusban</h2>
      <form className="search__form" role="search" onSubmit={handleSubmit}>
        <label className="field">
          Cím, szerző vagy téma
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="pl. Verne, sárkány, Egri csillagok"
          />
        </label>
        <button type="submit" className="button button--primary">
          Keresés
        </button>
      </form>

      {data && (
        <>
          <p className="search__status">Találatok: {data.numFound}</p>
          <ul>
            {data.docs.map((doc) => (
              <li key={doc.key}>{doc.title}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default SearchPanel
```

A `handleSubmit` dióhéjban ugyanaz a kérés, amit a 14. és a 20. leckében írtál:

- A `fetch(cím)` elküldi a kérést. A válasz nem érkezik meg azonnal, ezért a `fetch` egy [[Promise]]-t ad vissza, és
  az [[async függvény]]en belül az `await` kivárja.
- Először egy `Response` objektum érkezik: benne a státuszkód (például 200) és néhány kísérő adat a válaszról. Maga a
  tartalom, a válasz **törzse** (itt a JSON-szöveg), még úton van, ezért a `response.json()` megint egy Promise, és
  megint `await` kell elé. Ez beolvassa a törzset, és a JSON-szövegből JavaScript-objektumot csinál.
- Az `encodeURIComponent` végzi az [[URL-kódolás]]t: egyes karaktereknek (szóköz, `&`, `?`, `#`) külön jelentésük van
  egy címben, vagy bele sem kerülhetnek. Ez biztonságos formára írja át őket, így a „Tom & Jerry” keresés nem vágja
  ketté a címet.
- A `{data && (…)}` csak akkor rajzolja ki a találatokat, ha már van válasz: az első keresés előtt a `data` értéke
  `null`. A `<>…</>` [[Fragment]] összefogja a két elemet anélkül, hogy egy újabb elem kerülne az oldalra.
- A `role="search"` elárulja a képernyőolvasóknak, hogy ez az űrlap egy kereső.

Most tedd fel a keresőt az oldalra. Az `src/App.jsx` elejére írd be az importot, a komponenst pedig közvetlenül a
fejléc alá (a fájl többi része marad, ami volt):

```jsx file=src/App.jsx mark=1,10
import SearchPanel from './components/SearchPanel.jsx'
// … a többi import, a START_BOOKS és az App függvényei, mint eddig

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>
      <SearchPanel />

      {/* … a „Könyveim” kártya és az űrlap, mint eddig … */}
```

:::check Ellenőrizd
A listád fölött megjelenik a „Keresés a katalógusban” kártya. Keress rá erre: `verne`. Egy pillanat múlva megjelenik a
„Találatok: 3”, alatta három címmel. Próbáld ki ezeket is: `sárkány`, `1984` vagy `jokai` (az ékezet nem számít).
Aztán nyisd meg a fejlesztői eszközöket (++F12++ → Network), és keress újra: megjelenik egy új sor, `search?q=…`.
Kattints rá: a Response fülön ott a JSON, amit az API küldött, a Size oszlopban pedig „(ServiceWorker)” áll: a
kitalált szerver válaszolt.
:::

:::mistake Gyakori hiba
Kimarad a második `await`: `const answer = response.json()`. Az oldal kifehéredik, a konzol pedig ezt írja: `Cannot
read properties of undefined (reading 'map')`. Az `answer` ilyenkor egy Promise, nem az adat: nincs se `numFound`-ja,
se `docs`-a. Minden Promise elé `await` (vagy `then`) kell, mielőtt a belsejét használnád.
:::

:::try Próbáld ki
A konzolban is kérdezheted az API-t (++F12++ → Console): írd be, hogy
`await (await fetch('/api/books/search?q=austen')).json()`, és nyomj ++Enter++-t. Nyisd ki a kiírt objektumot, és nézd
meg egy könyv mezőit a `docs`-ban.
:::

### Az API adatai a saját formánkra

Az API könyvei nem úgy néznek ki, mint a mieink. A mieinknek `id`, `title` és `author` mezője van; az API-éinak `key`
(az azonosító elé egy `/books/` is kerül), `author_name` (tömb, mert egy könyvnek több szerzője is lehet),
`first_publish_year` és `cover_i`, a borító száma. Ráadásul nem minden könyvnek van meg minden mezője: van, amelyiknek
nincs borítója, más katalógusokban pedig az év vagy a szerző is hiányozhat.

Használhatnánk mindenhol az API neveit, de akkor minden komponens attól függne, hogyan nevez el valamit ez az egy
API. Ha megváltozik, vagy másik API-ra váltunk, az egész appot végig kellene böngészni. Ehelyett egyetlen függvény
alakítja át az API könyvét a mi formánkra, rögtön ott, ahol az adat megérkezik, és az app többi része sosem látja az
API mezőneveit. Ezt hívják az API-adatok **átalakításának**. Hozd létre az `src/bookApi.js` fájlt:

```js file=src/bookApi.js
// Minden, ami a könyv-API-hoz tartozik, egy helyen: a címei és az adatai formája.
// A komponenseknek sosem kell tudniuk, hogyan néznek ki a címek vagy az API mezőnevei.
const API = '/api'

// Csak azokat a mezőket kérjük, amelyeket meg is mutatunk: így kicsi marad a válasz.
const FIELDS = 'key,title,author_name,first_publish_year,cover_i'

// Egy keresés címe, például /api/books/search?q=jules%20verne&fields=…
export function searchUrl(query) {
  return `${API}/books/search?q=${encodeURIComponent(query)}&fields=${FIELDS}`
}

// Egy könyv, ahogy az API küldi → egy könyv a mi appunk formájában.
export function toBook(doc) {
  return {
    id: doc.key.replace('/books/', ''),
    title: doc.title,
    author: doc.author_name?.join(', ') ?? '',
    year: doc.first_publish_year ?? null,
    cover: doc.cover_i ? `${API}/covers/${doc.cover_i}-M.svg` : null,
  }
}
```

- A `fields=` az API egyik lekérdezési paramétere: csak a felsorolt mezőket küldi el. Egy igazi katalógus minden
  könyvhöz mezők tucatjait küldi; ha csak azt kérjük, amit meg is mutatunk, kicsi és gyors marad a válasz.
- A `doc.key.replace('/books/', '')` levágja a `/books/` részt: a `'/books/bk019'`-ből `'bk019'` lesz.
- `doc.author_name?.join(', ')`: a `?.` az [[opcionális láncolás]]. Ha az `author_name` hiányzik (`undefined`), a
  kifejezés ott megáll, és `undefined` lesz az értéke, ahelyett, hogy a `.join`-nál elszállna. Ha megvan, a `join` egy
  szöveggé fűzi a neveket, vesszővel elválasztva.
- A `??` a [[nullish coalescing]] operátor: csak akkor adja a jobb oldalát, ha a bal oldal `null` vagy `undefined`. Így
  a hiányzó szerzőből üres szöveg lesz, a hiányzó évből `null`.
- A borító egy külön cím, amit a borító számából rakunk össze: `/api/covers/7019-M.svg`. Az `M` a méret; az API az
  `S`-t és az `L`-t is ismeri. Ha nincs szám, a `cover` értéke `null`.

A borító nélküli könyv helyére is kell valami. Hozd létre az `src/components/BookCover.jsx` fájlt:

```jsx file=src/components/BookCover.jsx
// A borító az API-ból, vagy egy zöld lapocska a cím első betűjével, ha nincs borító.
function BookCover({ book }) {
  if (book.cover) {
    // alt="", mert a cím mindig ott áll a borító mellett.
    return <img className="cover" src={book.cover} alt="" loading="lazy" />
  }
  return (
    <span className="cover cover--empty" aria-hidden="true">
      {book.title.charAt(0)}
    </span>
  )
}

export default BookCover
```

Az `if` a `return`-jével [[korai visszatérés]]: ha van borító, a függvény ott véget ér. Egy `<img>`-nek általában
`alt` szöveg kell, de itt a cím mindig ott áll közvetlenül a kép mellett, így a képernyőolvasó kétszer olvasná fel: az
üres `alt=""` azt mondja neki, hogy hagyja ki a képet. A lapocskát ugyanezért rejtjük el a képernyőolvasók elől
(`aria-hidden`). A `loading="lazy"` arra kéri a böngészőt, hogy csak akkor töltse be a borítót, amikor a képernyő
közelébe ér. A `charAt(0)` a cím első karaktere.

Egy találat az `src/components/SearchResult.jsx` fájlba kerül:

```jsx file=src/components/SearchResult.jsx
import BookCover from './BookCover.jsx'

function SearchResult({ book }) {
  return (
    <li className="result">
      <BookCover book={book} />
      <div className="result__body">
        <strong className="result__title">{book.title}</strong>
        <span>{book.author || 'Ismeretlen szerző'}</span>
        {book.year && <span className="result__year">{book.year}</span>}
      </div>
    </li>
  )
}

export default SearchResult
```

A `{book.year && …}` csak akkor mutatja az évet, ha van. Végül a `SearchPanel` mindezt használja. Cseréld le az
`src/components/SearchPanel.jsx`-et erre:

```jsx file=src/components/SearchPanel.jsx mark=2-3,9-10,16,39-44
import { useState } from 'react'
import { searchUrl, toBook } from '../bookApi.js'
import SearchResult from './SearchResult.jsx'

function SearchPanel() {
  const [text, setText] = useState('') // ami a keresőmezőben van
  const [data, setData] = useState(null) // az API utolsó válasza

  // Az API könyvei, a saját formánkra alakítva.
  const results = data ? data.docs.map(toBook) : []

  async function handleSubmit(event) {
    event.preventDefault()
    const query = text.trim()
    if (query === '') return
    const response = await fetch(searchUrl(query))
    const answer = await response.json()
    setData(answer)
  }

  return (
    <section className="panel search">
      <h2>Keresés a katalógusban</h2>
      <form className="search__form" role="search" onSubmit={handleSubmit}>
        <label className="field">
          Cím, szerző vagy téma
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="pl. Verne, sárkány, Egri csillagok"
          />
        </label>
        <button type="submit" className="button button--primary">
          Keresés
        </button>
      </form>

      {data && <p className="search__status">Találatok: {data.numFound}</p>}
      <ul className="results">
        {results.map((book) => (
          <SearchResult key={book.id} book={book} />
        ))}
      </ul>
    </section>
  )
}

export default SearchPanel
```

A `data.docs.map(toBook)` magát a `toBook` függvényt adja át a `map`-nek: ugyanaz, mint a
`data.docs.map((doc) => toBook(doc))`. A `results` nem állapot, hanem [[származtatott érték]]: minden rajzoláskor a
`data`-ból számoljuk ki. Az állapotban az van, amit az API küldött, a komponensek pedig a mi formánkat kapják.

:::check Ellenőrizd
Keress rá erre: `verne`. Három borító jelenik meg rácsban, mindegyik alatt a cím, a szerző és az év. Keress rá erre:
`sidereus`. Ennek a könyvnek nincs borítója a katalógusban, ezért egy zöld lapocska áll a helyén, rajta egy „S”.
Keress rá erre: `csillagászat`. Az API a témák között is keres.
:::

:::mistake Gyakori hiba
`doc.author_name.join(', ')`, a `?.` nélkül. Addig működik, amíg minden könyvnek van szerzője. Hogy lásd, mi történik,
ha egynek nincs, írd egy pillanatra a `.join`-t a `?.` nélkül, és vedd ki az `author_name`-et a `FIELDS`-ből: az API
nem küldi többé, és az első keresés elszáll ezzel: `Cannot read properties of undefined (reading 'join')`. Utána tedd
vissza mindkettőt. A kívülről jövő adatból bármikor hiányozhat egy mező, ezért az átalakításnak fel kell készülnie rá.
:::

:::try Próbáld ki
Írd át a borító címében az `M`-et `L`-re (nagy) vagy `S`-re (kicsi). A Network fülön kattints egy borító sorára, és
nyisd meg a Preview fület: a kép 200×300 helyett 400×600 vagy 100×150 képpontos, az oldalon mégis ugyanakkora helyet
foglal, mert a szélességét a CSS adja meg. A kicsiről a szerző is lemarad, hogy kis képként is olvasható maradjon a
cím. Aztán írd vissza `M`-re.
:::

### useFetch hook: töltés, hiba, nincs találat

A keresés működik, de a valódi használathoz még kevés:

- A kattintás után egy pillanatig semmi sem történik. A felhasználó nem tudja, dolgozik-e az app.
- Ha a szerver hibával válaszol, az oldal kifehéredik: a hibaválaszban (`{ error, message }`) nincs `docs`, így a
  `data.docs.map` elszáll. Emlékszel: a `fetch` csak akkor dob hibát, ha egyáltalán nem
  érkezik válasz. A hibakóddal érkező válasz, például a 404 (nincs ilyen) vagy a 429 (túl sok kérés), attól még válasz,
  és csak a `response.ok` (hamis) meg a `response.status` árulja el a bajt. Ezek a számok a
  [[HTTP-státuszkódok|HTTP-státuszkód]]: a 200 azt jelenti, hogy minden rendben, a 4xx, hogy a kérés volt hibás, az 5xx pedig, hogy a szerverrel
  van baj.
- Ha kétszer gyorsan keresel, a válaszok rossz sorrendben is megérkezhetnek, és a lassú, régi válasz felülírja az
  újat: ez a [[versenyhelyzet]].

A 20. leckében mindhármat egy `useFetch` [[saját hook]]kal oldottad meg: állapottal írja le a kérést, új kérésnél
leállítja a régit, és újra is tud próbálkozni. Ebben a projektben is megírjuk, egy különbséggel: a hibakódos válasz itt
hibát dob, a hook magát a hibát tartja meg (`error`), és a státuszkódot a hiba viszi magával (`error.status`), nem egy
külön `httpStatus` mező, mint a 20. leckében. Így a kereső meg tudja különböztetni a „túl sok keresést” (429) minden más hibától. Hozd létre az
`src/useFetch.js` fájlt:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// JSON-t tölt be egy címről, és elmondja, hogy áll: { status, data, error, retry }.
// status: 'idle' (még nincs cím), 'loading', 'success' vagy 'error'.
function useFetch(url) {
  const [result, setResult] = useState({ status: 'idle', data: null, error: null })
  const [attempt, setAttempt] = useState(0) // a retry() növeli, és az effekt újra lefut

  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    setResult({ status: 'loading', data: null, error: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          const error = new Error(`A szerver ${response.status} kóddal válaszolt`)
          error.status = response.status
          throw error
        }
        const data = await response.json()
        setResult({ status: 'success', data, error: null })
      } catch (error) {
        // A takarítás állította le: egy újabb kérés vette át a helyét, ez csendben marad.
        if (controller.signal.aborted) return
        setResult({ status: 'error', data: null, error })
      }
    }

    load()
    // Takarítás: új cím esetén leállítjuk a még úton lévő kérést.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt(attempt + 1)
  }

  return { ...result, retry }
}

export default useFetch
```

Gyorsan végigmegyünk rajta, a különbséggel kezdve.

- **A státuszkód a hibán (ez a különbség).** Ha a `response.ok` hamis, a `new Error(…)`-ral hibát készítünk, és mielőtt `throw`-val
  eldobnánk, ráteszünk egy saját mezőt: `error.status = response.status`. A hiba is csak egy objektum, vihet magával
  plusz adatot. A `throw` egyenesen a `catch` ágba ugrik, ahová egy hálózati hiba is érkezne, a hiba pedig bekerül az
  állapotba, így a komponens később kiolvashatja az `error.status`-t.
- **Egy állapot három dologra.** A `result` együtt tartja a státuszt, az adatot és a hibát, így egyetlen
  `setResult` mindhármat egyszerre változtatja: sosem kaphatsz `'success'`-t az előző keresés adataival.
- **Az effekt.** Akkor fut le, amikor változik a cím (és egy `retry` után). Cím nélkül (`null`) nem csinál semmit: ez
  az `'idle'` állapot, az első keresés előtt. Maga az effektfüggvény nem lehet `async`, ezért a belsejében írunk egy
  `async function load()`-ot, és rögtön meg is hívjuk.
- **Leállítás.** A [[takarító függvény]] meghívja az [[AbortController]] `abort()` függvényét; ennek a `signal`-ját
  kapta meg a `fetch`. A React a takarítást azelőtt hívja meg, hogy új címmel újra lefuttatná az effektet: a régi kérés
  leáll, a `catch`-e látja a `controller.signal.aborted`-et, és csendben marad. Így egy régi válasz soha nem írhat felül
  egy újat. (Fejlesztés közben a [[StrictMode]] szándékosan kétszer futtat minden effektet: az első futás ugyanígy
  leáll.)
- **Újrapróbálkozás.** A `retry` megnöveli az `attempt`-et. Mivel az `attempt` benne van a [[függőségi tömb]]ben, az
  effekt ugyanazzal a címmel újra lefut: új kérés indul.
- **Amit visszaad.** A `{ ...result, retry }` egy négymezős objektum: `status`, `data`, `error` és `retry`.

Most a `SearchPanel` használja a hookot. Közben más is változik: a keresőmezőben lévő szöveg (`text`) és az, amire
rákerestünk (`query`), mostantól két külön állapot. A kérés csak az űrlap elküldésekor indul, nem minden
billentyűleütésnél. Cseréld le az `src/components/SearchPanel.jsx`-et erre:

```jsx file=src/components/SearchPanel.jsx mark=2,8-9,14-21,23-29,44,49-51,53-64,66,72
import { useState } from 'react'
import useFetch from '../useFetch.js'
import { searchUrl, toBook } from '../bookApi.js'
import SearchResult from './SearchResult.jsx'

function SearchPanel() {
  const [text, setText] = useState('') // ami a keresőmezőben van
  const [query, setQuery] = useState('') // amire rákerestünk
  const { status, data, error, retry } = useFetch(query ? searchUrl(query) : null)

  // Az API könyvei, a saját formánkra alakítva.
  const results = data ? data.docs.map(toBook) : []

  function handleSubmit(event) {
    event.preventDefault()
    const newQuery = text.trim()
    if (newQuery === '') return
    // Ugyanaz a keresés még egyszer (például hiba után): megismételjük a kérést.
    if (newQuery === query) retry()
    else setQuery(newQuery)
  }

  let message = ''
  if (status === 'loading') message = 'Keresés…'
  if (status === 'success' && results.length === 0) message = `Nincs találat erre: „${query}”.`
  if (status === 'success' && results.length > 0) {
    message = `Találatok: ${data.numFound}`
    if (data.numFound > results.length) message += `, ebből az első ${results.length} látszik`
  }

  return (
    <section className="panel search">
      <h2>Keresés a katalógusban</h2>
      <form className="search__form" role="search" onSubmit={handleSubmit}>
        <label className="field">
          Cím, szerző vagy téma
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="pl. Verne, sárkány, Egri csillagok"
          />
        </label>
        <button type="submit" className="button button--primary" disabled={status === 'loading'}>
          Keresés
        </button>
      </form>

      <p className="search__status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <div className="search__error" role="alert">
          <p>
            {error.status === 429
              ? 'Túl sok keresés rövid idő alatt. Várj néhány másodpercet, aztán próbáld újra!'
              : 'A keresés nem sikerült: a könyv-API nem válaszolt.'}
          </p>
          <button type="button" className="button button--small" onClick={retry}>
            Újra
          </button>
        </div>
      )}

      {results.length > 0 && (
        <ul className="results">
          {results.map((book) => (
            <SearchResult key={book.id} book={book} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default SearchPanel
```

- `useFetch(query ? searchUrl(query) : null)`: az első keresésig üres a `query`, ezért a hook `null`-t kap, és vár. A
  `const { status, data, error, retry } = …` név szerint veszi ki a négy mezőt az objektumból: ez az objektumok
  [[destrukturálás]]a.
- A `handleSubmit` már nem `async`: csak beállítja a `query`-t, a többit a hook intézi. Ha ugyanarra keresel még
  egyszer (például egy hiba után), a `query` nem változna, így az effekt sem futna le: ilyenkor a `retry()` indítja el.
- A `message` megint származtatott érték: egyetlen mondat, a státuszból kiszámolva. Azért `let`, mert lejjebb új
  értéket kaphat; a `+=` a végéhez fűz.
- Az állapotsor akkor is az oldalon van, amikor üres. Az `aria-live="polite"` arra kéri a képernyőolvasókat, hogy
  olvassák fel, valahányszor változik a szövege (a 3. leckében már használtad), és ez olyan elemen működik a
  legbiztosabban, ami már a változás előtt is ott volt. A hibadoboz viszont akkor kerül az oldalra, amikor megjelenik,
  ezért `role="alert"`-et kap, amit a képernyőolvasó azonnal felolvas.
- A gomb `disabled`, amíg fut egy keresés.

:::check Ellenőrizd
Keress rá erre: `verne`. Egy pillanatig „Keresés…” látszik, és szürke a gomb, aztán megérkeznek a borítók, „Találatok:
3”. Keress rá erre: `regény`. „Találatok: 36, ebből az első 12 látszik” (az API egyszerre legfeljebb 12 könyvet
küld). Keress rá erre: `qqq`. Ezt kapod: Nincs találat erre: „qqq”. Most jöjjön a hiba: az API 10 másodperc alatt legfeljebb 12
keresést enged, utána 429-cel válaszol. Írd be a keresőmezőbe, hogy `verne`, de még ne keress. Aztán másold be ezt a
konzolba (ha a Chrome kéri, előbb írd be: `allow pasting`): `for (let i = 0; i < 12; i++) fetch('/api/books/search?q=dune')`.
Rögtön utána, néhány másodpercen belül kattints az oldalon a „Keresés” gombra: megjelenik egy piros doboz, „Túl sok
keresés rövid idő alatt…”. Várj tíz másodpercet, és kattints az „Újra” gombra: megérkeznek a találatok.
:::

:::mistake Gyakori hiba
A hookot az eseménykezelőben hívni: `const { data } = useFetch(searchUrl(newQuery))` a `handleSubmit`-ben. A React
megáll ezzel: `Invalid hook call`. Hookot csak a komponens (vagy egy másik hook) legfelső szintjén szabad hívni,
eseménykezelőben, `if`-ben vagy ciklusban soha: ezt mondják ki a [[hookok szabályai|hookok szabálya]]. A hook minden rajzoláskor megkapja a
címet, és az állapot (`query`) dönti el, mi az a cím.
:::

:::concept Miért Enterre, és miért nem gépelés közben?
A 20. lecke filmkeresője magától elindult, amikor abbahagytad a gépelést (debounce). Itt a keresés szándékosan vár az
Enterre vagy a gombra: ahogy a legtöbb ingyenes API-nak, a miénknek is van [[kéréskorlátja|kéréskorlát]], egy
felhasználótól legfeljebb 12 keresés 10 másodperc alatt. Ha minden gépelési szünetnél keresnénk, ez hamar elfogyna.
Hogy melyiket válaszd, az API-n múlik: ha gyors és nincs korlátja, keress gépelés közben; ha korlátos vagy lassú,
csak akkor keress, amikor a felhasználó kéri (Enterrel vagy a gombbal).
:::

:::try Feladat
Az API egyszerre legfeljebb 12 könyvet küld, a többi a további oldalakon van. A `page` lekérdezési paraméterrel kérhetsz
egy másik oldalt: `&page=2`. Vegyél fel egy `page` állapotot a `SearchPanel`-be (egy új keresés visszaállítja 1-re),
add át a `searchUrl`-nek második paraméterként, és tegyél „Előző” és „Következő” gombot a találatok alá. Hogy hány
oldal van, azt a válasz `numFound` és `limit` mezője árulja el: `Math.ceil(data.numFound / data.limit)`.
:::

### A találatokból a listádra

Ideje összekötni a két felet: a keresésben talált könyv egy kattintással kerüljön a listádra. Ha pedig már rajta van,
a találat ezt mondja, ahelyett, hogy újra felajánlaná.

Mely könyvek vannak a listádon? Ezt az `App` tudja: ott vannak a `books` állapotában. Az `App` tehát odaadja a listát a
`SearchPanel`-nek, a `SearchPanel` pedig minden találatnak megmondja a státuszát. Cseréld le az
`src/components/SearchResult.jsx`-et erre:

```jsx file=src/components/SearchResult.jsx mark=1,4,13-19
import { STATUSES } from '../statuses.js'
import BookCover from './BookCover.jsx'

function SearchResult({ book, status, onAdd }) {
  return (
    <li className="result">
      <BookCover book={book} />
      <div className="result__body">
        <strong className="result__title">{book.title}</strong>
        <span>{book.author || 'Ismeretlen szerző'}</span>
        {book.year && <span className="result__year">{book.year}</span>}
      </div>
      {status ? (
        <span className="result__on">✓ {STATUSES[status]}</span>
      ) : (
        <button type="button" className="button button--small button--primary" onClick={() => onAdd(book)}>
          + Szeretném elolvasni
        </button>
      )}
    </li>
  )
}

export default SearchResult
```

Ha a könyvnek van státusza, akkor rajta van a listádon, és a találat megmondja, milyen státusszal; ha nincs
(`undefined`), gombot kap. Az `src/components/SearchPanel.jsx`-ben három dolog változik: a komponens két propot kap
(`books`, `onAdd`), kiszámolja minden találat státuszát, és a státuszt meg az `onAdd`-ot továbbadja minden
`SearchResult`-nak. A kiemelt sorok újak vagy megváltoztak, minden más marad:

```jsx file=src/components/SearchPanel.jsx mark=6,14-17,74
import { useState } from 'react'
import useFetch from '../useFetch.js'
import { searchUrl, toBook } from '../bookApi.js'
import SearchResult from './SearchResult.jsx'

function SearchPanel({ books, onAdd }) {
  const [text, setText] = useState('') // ami a keresőmezőben van
  const [query, setQuery] = useState('') // amire rákerestünk
  const { status, data, error, retry } = useFetch(query ? searchUrl(query) : null)

  // Az API könyvei, a saját formánkra alakítva.
  const results = data ? data.docs.map(toBook) : []

  // Milyen státusszal van rajta a könyv a listánkon (undefined, ha nincs rajta).
  function statusOf(id) {
    return books.find((book) => book.id === id)?.status
  }

  function handleSubmit(event) {
    event.preventDefault()
    const newQuery = text.trim()
    if (newQuery === '') return
    // Ugyanaz a keresés még egyszer (például hiba után): megismételjük a kérést.
    if (newQuery === query) retry()
    else setQuery(newQuery)
  }

  let message = ''
  if (status === 'loading') message = 'Keresés…'
  if (status === 'success' && results.length === 0) message = `Nincs találat erre: „${query}”.`
  if (status === 'success' && results.length > 0) {
    message = `Találatok: ${data.numFound}`
    if (data.numFound > results.length) message += `, ebből az első ${results.length} látszik`
  }

  return (
    <section className="panel search">
      <h2>Keresés a katalógusban</h2>
      <form className="search__form" role="search" onSubmit={handleSubmit}>
        <label className="field">
          Cím, szerző vagy téma
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="pl. Verne, sárkány, Egri csillagok"
          />
        </label>
        <button type="submit" className="button button--primary" disabled={status === 'loading'}>
          Keresés
        </button>
      </form>

      <p className="search__status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <div className="search__error" role="alert">
          <p>
            {error.status === 429
              ? 'Túl sok keresés rövid idő alatt. Várj néhány másodpercet, aztán próbáld újra!'
              : 'A keresés nem sikerült: a könyv-API nem válaszolt.'}
          </p>
          <button type="button" className="button button--small" onClick={retry}>
            Újra
          </button>
        </div>
      )}

      {results.length > 0 && (
        <ul className="results">
          {results.map((book) => (
            <SearchResult key={book.id} book={book} status={statusOf(book.id)} onAdd={onAdd} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default SearchPanel
```

A [[find]] az első olyan elemet adja vissza, amelyre a függvény `true`-t ad, vagy `undefined`-ot, ha nincs ilyen. A
mögötte álló `?.` a második esetre kell: az `undefined.status` elszállna, az `undefined?.status` egyszerűen
`undefined`.

És az `App`? A `handleAdd`-je már most pontosan azt csinálja, amire szükség van: egy egész könyvet kap, azonosítóval
együtt, és „want” státusszal a lista elejére teszi. Az űrlap véletlen azonosítójú könyvet ad neki, a kereső az API
azonosítójával; a `handleAdd`-nek ez mindegy. Ezért készítette az űrlap maga az azonosítót. Az `src/App.jsx`-ben csak a
kereső sorát írd át:

```jsx file=src/App.jsx
      <SearchPanel books={books} onAdd={handleAdd} />
```

Az API könyveinek borítója és éve is van; a lista mutassa meg őket. Cseréld le az `src/components/BookItem.jsx`-et
erre:

```jsx file=src/components/BookItem.jsx mark=2,7,10-13
import { STATUSES } from '../statuses.js'
import BookCover from './BookCover.jsx'

function BookItem({ book, onStatusChange, onRemove }) {
  return (
    <li className="book">
      <BookCover book={book} />
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">
          {book.author || 'Ismeretlen szerző'}
          {book.year && ` · ${book.year}`}
        </span>
        <div className="book__actions">
          <select
            className="book__status"
            aria-label={`Státusz: ${book.title}`}
            value={book.status}
            onChange={(event) => onStatusChange(book.id, event.target.value)}
          >
            {Object.entries(STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button--small button--danger"
            aria-label={`${book.title} törlése`}
            onClick={() => onRemove(book.id)}
          >
            Törlés
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookItem
```

A kézzel beírt könyveidnek nincs `cover`-e és `year`-e (`undefined`), ezért ezek zöld lapocskát kapnak, évet pedig
nem.

:::check Ellenőrizd
Keress rá erre: `verne`, és kattints az „Around the World in Eighty Days” alatt a „+ Szeretném elolvasni” gombra: a
könyv a borítójával együtt megjelenik a listád tetején, a találatnál pedig a gomb helyén „✓ Szeretném elolvasni” áll.
Állítsd a listádban „Olvasom”-ra: a találat most azt mondja, „✓ Olvasom”. A három mintakönyved zöld lapocskát kapott,
rajta a címe első betűjével. (Őket „kézzel írtuk be”, ezért nincs API-azonosítójuk: ha rákeresel az
`egri csillagok`-ra, a kereső nem tudja, hogy rajta van a listádon.)
:::

:::concept Egy lista, sok nézet
A találat és a listád ugyanazt a tényt mutatja, egy könyv státuszát, de egyikük sem tárolja külön: mindkettő az
`App` egyetlen `books` tömbjéből olvassa. Ezt jelenti az [[egyetlen igazságforrás]]. Ha a találatnak saját
„hozzáadva” állapota lenne, akkor is azt mondaná, „✓ Szeretném elolvasni”, miután törölted a könyvet a listádról. Mivel
csak egy hely van, a kettő sosem mondhat ellent egymásnak.
:::

:::mistake Gyakori hiba
Az `onAdd` az API nyers könyvét (`doc`) kapja az átalakított helyett. A könyv felkerül a listára, de hiányosan: a címe
megvan (a `title` mindkét formában ugyanaz), a szerzője helyén viszont „Ismeretlen szerző” áll, éve nincs, és borító
helyett zöld lapocskát kap, mert a listád `author`-t, `year`-t és `cover`-t ismer, nem `author_name`-et,
`first_publish_year`-t és `cover_i`-t. A legnagyobb baj, hogy `id`-je sincs, csak `key`-e (`'/books/bk019'`): a konzol
a hiányzó `key` miatt figyelmeztet, és a találat sosem látja, hogy a könyv már rajta van a listádon, így továbbra is
felajánlja a „+ Szeretném elolvasni” gombot. A `SearchPanel`-en túl csak a mi formánk mehet.
:::

### Három polc

Tíz könyvnél még jó egy hosszú lista, de egy könyvtárhoz polcok kellenek: „Szeretném elolvasni”, „Olvasom”,
„Elolvastam”. Gondolhatnál három tömbre, polconként egyre, ahol az áthelyezés azt jelenti, hogy „kiveszem az egyikből,
beteszem a másikba”. Csakhogy a könyv már tudja, hova tartozik: ott a `status`-a. A polcokat tehát nem tároljuk
sehol: egy polc egyszerűen a lista azon könyvei, amelyeknek egyezik a státusza, `filter`-rel kiszámolva. A polcok
közti áthelyezés pedig semmi más, mint a `status` átírása. Egy tömb, három nézet.

A polcgombok az `src/components/ShelfTabs.jsx` fájlba kerülnek:

```jsx file=src/components/ShelfTabs.jsx
import { STATUSES } from '../statuses.js'

function ShelfTabs({ books, shelf, onChange }) {
  return (
    <div className="shelf-tabs" role="group" aria-label="Polcok">
      {Object.entries(STATUSES).map(([value, label]) => {
        // Hány könyv van ezen a polcon: kiszámoljuk, nem tároljuk.
        const count = books.filter((book) => book.status === value).length
        return (
          <button
            key={value}
            type="button"
            className="shelf-tab"
            aria-pressed={value === shelf}
            onClick={() => onChange(value)}
          >
            {label}
            <span className="shelf-tab__count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ShelfTabs
```

- Ennek a `map`-függvénynek kapcsos zárójeles törzse van, így ki tudja számolni a `count`-ot, mielőtt visszaadja a
  gombot. Ilyenkor kiírt `return` kell.
- Az [[aria-pressed]] megmondja a képernyőolvasóknak, hogy egy gomb „le van-e nyomva” (a 2. lecke témagombjainál
  használtad): a nyitott polc gombja igen. A CSS ugyanezt az attribútumot használja a zöld kitöltéshez, így amit a
  képernyőolvasó mond, és amit látsz, sosem térhet el. A `role="group"` az `aria-label`-lel együtt közös nevet ad a
  három gombnak.

Egy polcon már nem a legördülő lista a legkényelmesebb módja az áthelyezésnek: gyorsabb egy kattintás a másik polc
nevére. Cseréld le az `src/components/BookItem.jsx`-et erre:

```jsx file=src/components/BookItem.jsx mark=4,15-27
import { STATUSES } from '../statuses.js'
import BookCover from './BookCover.jsx'

function BookItem({ book, onMove, onRemove }) {
  return (
    <li className="book">
      <BookCover book={book} />
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">
          {book.author || 'Ismeretlen szerző'}
          {book.year && ` · ${book.year}`}
        </span>
        <div className="book__actions">
          {Object.entries(STATUSES)
            .filter(([value]) => value !== book.status)
            .map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="button button--small"
                aria-label={`${book.title} áthelyezése ide: ${label}`}
                onClick={() => onMove(book.id, value)}
              >
                → {label}
              </button>
            ))}
          <button
            type="button"
            className="button button--small button--danger"
            aria-label={`${book.title} törlése`}
            onClick={() => onRemove(book.id)}
          >
            Törlés
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookItem
```

A `filter` kihagyja azt a polcot, amelyiken a könyv áll, a `map` pedig a másik kettőből gombot csinál. Az ilyen
függvényeket egymás után is írhatod, ez a [[metódusláncolás]]: mindegyik azon dolgozik, amit az előző visszaadott. Az
`aria-label`-be most is bekerül a könyv címe, ahogy a 3. lépésben: a képernyőolvasó így azt mondja, „Egri csillagok
áthelyezése ide: Elolvastam”, nem csak azt, hogy melyik polcra.

Ha áthelyezel egy könyvet, eltűnik a nyitott polcról. Hogy ne csak úgy elillanjon, egy rövid üzenet megmondja, hová
került. Itt a teljes `src/App.jsx`, ahogy a középszint végén kinéz:

```jsx file=src/App.jsx mark=1,3,5,17-22,26-27,29-30,34,37-41,57-63,66-67
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { STATUSES } from './statuses.js'
import SearchPanel from './components/SearchPanel.jsx'
import ShelfTabs from './components/ShelfTabs.jsx'
import BookItem from './components/BookItem.jsx'
import AddBookForm from './components/AddBookForm.jsx'
import './App.css'

// Néhány könyv kezdésnek, hogy ne legyen üres a lista.
const START_BOOKS = [
  { id: 1, title: 'A Pál utcai fiúk', author: 'Molnár Ferenc', status: 'read' },
  { id: 2, title: 'Egri csillagok', author: 'Gárdonyi Géza', status: 'reading' },
  { id: 3, title: 'Kincskereső kisködmön', author: 'Móra Ferenc', status: 'want' },
]

// Ezt mondja egy üres polc.
const EMPTY_MESSAGES = {
  want: 'Még semmi sincs itt. Keress fent egy könyvet, és tedd fel ide!',
  reading: 'Most épp nem olvasol semmit.',
  read: 'Még nincs elolvasott könyved.',
}

function App() {
  const [books, setBooks] = useLocalStorage('book-library-books', START_BOOKS)
  const [shelf, setShelf] = useLocalStorage('book-library-shelf', 'reading')
  const [notice, setNotice] = useState('')

  // Nem állapot: a nyitott polc könyvei, minden rajzoláskor kiszámolva.
  const shelfBooks = books.filter((book) => book.status === shelf)

  function handleAdd(book) {
    setBooks([{ ...book, status: 'want' }, ...books])
    setNotice(`„${book.title}” felkerült ide: ${STATUSES.want}.`)
  }

  function handleMove(id, status) {
    const book = books.find((item) => item.id === id)
    setBooks(books.map((item) => (item.id === id ? { ...item, status } : item)))
    setNotice(`„${book.title}” átkerült ide: ${STATUSES[status]}.`)
  }

  function handleRemove(id) {
    setBooks(books.filter((book) => book.id !== id))
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>

      <SearchPanel books={books} onAdd={handleAdd} />

      <section className="panel">
        <h2>Polcaim</h2>
        <ShelfTabs books={books} shelf={shelf} onChange={setShelf} />
        <p className="notice" aria-live="polite">
          {notice}
        </p>
        {shelfBooks.length === 0 ? (
          <p className="empty">{EMPTY_MESSAGES[shelf]}</p>
        ) : (
          <ul className="book-list">
            {shelfBooks.map((book) => (
              <BookItem key={book.id} book={book} onMove={handleMove} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

- A `handleStatusChange` neve mostantól `handleMove`, mert a polcokon ezt csinálja. A `map`-en belül `item` a változó
  neve, hogy a `book` név szabad maradjon a `find`-dal megtalált könyvnek.
- A nyitott polcot is `useLocalStorage` tartja, így egy frissítés után ugyanazon a polcon folytatod. A kulcsa persze
  más, mint a könyveké.
- Az `EMPTY_MESSAGES[shelf]` a nyitott polc üzenetét választja ki, ugyanúgy, ahogy a `STATUSES[status]` egy nevet.

:::check Ellenőrizd
Hogy a számok egyezzenek, kezdd újra a három mintakönyvvel: a fejlesztői eszközökben (++F12++ → Application → Local
storage → `http://localhost:5173`) töröld a `book-library-books` kulcsot (jobb klikk → Delete), frissíts, és kattints
az „Olvasom” gombra. A „Polcaim” alatt három gomb áll számokkal: „Szeretném elolvasni 1”, „Olvasom 1”, „Elolvastam 1”;
az „Olvasom” zöld, alatta csak az Egri csillagok áll. Kattints az Egri csillagoknál a „→ Elolvastam” gombra: a könyv
eltűnik, az „Olvasom” mellett 0, az „Elolvastam” mellett 2 áll, megjelenik az üres polc üzenete, fölötte pedig ez az
üzenet: „Egri csillagok” átkerült ide: Elolvastam. Kattints az „Elolvastam”-ra: ott az Egri csillagok és A Pál utcai fiúk.
Vegyél fel egy könyvet a keresőből: a „Szeretném elolvasni” száma eggyel nő. Frissíts: ugyanaz a polc van nyitva. Kész
a középszint: commitold!
:::

:::mistake Gyakori hiba
A nyitott polc könyveit külön állapotban tartani: `const [shelfBooks, setShelfBooks] = useState(…)`. Eleinte a jó
könyveket mutatja, de egy áthelyezés után az áthelyezett könyv a polcon marad, mert a második állapotot senki sem
frissítette. Amit más állapotból ki lehet számolni, azt minden rajzoláskor számold ki, ne tárold.
:::

:::try Próbáld ki
Tedd ábécérendbe egy polc könyveit: `books.filter(…).toSorted((a, b) => a.title.localeCompare(b.title, 'hu'))`. A
`toSorted` rendezett másolatot ad vissza, az eredeti tömbhöz nem nyúl, a `'hu'` pedig a magyar ábécé szerint rendez.
:::

## Haladó szint {level=3}

### Csillagok és jegyzetek

Egy elolvasott könyv megérdemel egy értékelést: egytől öt csillagig. Jegyzetet pedig bármelyik könyv kaphat: miért
szeretnéd elolvasni, ki ajánlotta, mit gondoltál róla.

A csillagok öt gombból állnak. Hozd létre az `src/components/StarRating.jsx` fájlt:

```jsx file=src/components/StarRating.jsx
const STARS = [1, 2, 3, 4, 5]

// Öt csillaggomb. Ha a mostani értékelésre kattintasz, visszaáll 0-ra (nincs értékelés).
function StarRating({ value, onChange }) {
  return (
    <div className="rating" role="group" aria-label="Értékelésed">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'rating__star is-on' : 'rating__star'}
          aria-label={`${star} csillag az 5-ből`}
          aria-pressed={star === value}
          onClick={() => onChange(star === value ? 0 : star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default StarRating
```

Egy csillag akkor világít (`is-on`), ha a sorszáma legfeljebb akkora, mint az értékelés: 3-as értékelésnél az
1., a 2. és a 3. csillag arany. Csak a mostani értékelés csillaga `aria-pressed`, így a képernyőolvasó azt mondja:
„3 csillag az 5-ből, lenyomva”.

A jegyzet egy kis űrlapban készül, egy [[szövegterületben|textarea]] (többsoros szövegmezőben). Hozd létre az
`src/components/NoteForm.jsx` fájlt:

```jsx file=src/components/NoteForm.jsx
import { useState } from 'react'

function NoteForm({ note, onSave, onCancel }) {
  // Saját piszkozat: a könyv csak mentéskor változik.
  const [draft, setDraft] = useState(note)

  function handleSubmit(event) {
    event.preventDefault()
    onSave(draft.trim())
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <label className="field">
        Jegyzeted
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} autoFocus />
      </label>
      <div className="note-form__actions">
        <button type="submit" className="button button--small button--primary">
          Mentés
        </button>
        <button type="button" className="button button--small" onClick={onCancel}>
          Mégse
        </button>
      </div>
    </form>
  )
}

export default NoteForm
```

Az űrlap saját piszkozaton dolgozik, mint a 9. leckében a feladatok szerkesztése: a „Mégse” eldobhatja, hiszen a
könyv még nem változott. A `useState(note)` csak kezdőértékként használja a `note`-ot, az első rajzoláskor. Itt ez
rendben van, mert
az űrlap csak addig van az oldalon, amíg írsz: minden megnyitáskor újraindul a könyv aktuális jegyzetével. Az
`autoFocus` a mezőbe teszi a kurzort, amikor megjelenik az űrlap.

A `BookItem` mindkettőt megkapja, és megjegyzi, hogy épp írják-e a jegyzetet. Cseréld le az
`src/components/BookItem.jsx`-et erre:

```jsx file=src/components/BookItem.jsx mark=1,4-5,7-13,24-31,46-50
import { useState } from 'react'
import { STATUSES } from '../statuses.js'
import BookCover from './BookCover.jsx'
import StarRating from './StarRating.jsx'
import NoteForm from './NoteForm.jsx'

function BookItem({ book, onMove, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false) // épp írod a jegyzetet?

  function saveNote(note) {
    onUpdate(book.id, { note })
    setEditing(false)
  }

  return (
    <li className="book">
      <BookCover book={book} />
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">
          {book.author || 'Ismeretlen szerző'}
          {book.year && ` · ${book.year}`}
        </span>
        {book.status === 'read' && (
          <StarRating value={book.rating ?? 0} onChange={(rating) => onUpdate(book.id, { rating })} />
        )}
        {editing ? (
          <NoteForm note={book.note ?? ''} onSave={saveNote} onCancel={() => setEditing(false)} />
        ) : (
          book.note && <p className="book__note">{book.note}</p>
        )}
        <div className="book__actions">
          {Object.entries(STATUSES)
            .filter(([value]) => value !== book.status)
            .map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="button button--small"
                aria-label={`${book.title} áthelyezése ide: ${label}`}
                onClick={() => onMove(book.id, value)}
              >
                → {label}
              </button>
            ))}
          {!editing && (
            <button type="button" className="button button--small" onClick={() => setEditing(true)}>
              {book.note ? 'Jegyzet szerkesztése' : 'Jegyzet írása'}
            </button>
          )}
          <button
            type="button"
            className="button button--small button--danger"
            aria-label={`${book.title} törlése`}
            onClick={() => onRemove(book.id)}
          >
            Törlés
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookItem
```

- A csillagok csak az „Elolvastam” polcon látszanak. Az eddigi könyveknek egyáltalán nincs `rating` mezőjük, ezért a
  `book.rating ?? 0` az `undefined`-ból 0-t csinál, ami azt jelenti: nincs értékelés; ugyanígy a `book.note ?? ''`
  üres jegyzetet.
- Az `editing` [[helyi állapot]]: csak ennek a sornak kell tudnia, hogy épp írják a jegyzetét, ezért nem megy fel az
  `App`-ba.
- A csillagok és a jegyzet ugyanúgy jelzik a változást: `onUpdate(book.id, { … })`, a megváltozó mezők
  objektumával. A `{ note }` a `{ note: note }` rövid formája.

Az `App`-ban egyetlen függvény végez mindenféle módosítást: lemásolja a könyvet, és ráírja a megváltozott mezőket. A
`handleMove` is használhatja. Az `src/App.jsx`-ben írd be a `handleUpdate`-et a `handleMove` fölé, írd át a
`handleMove`-ot, és add át a `BookItem`-nek az új propot (a fájl többi része marad, ami volt):

```jsx file=src/App.jsx mark=1-4,8,15
  function handleUpdate(id, changes) {
    // Csak ez a könyv változik: egy másolata, ráírva a megváltozott mezők.
    setBooks(books.map((book) => (book.id === id ? { ...book, ...changes } : book)))
  }

  function handleMove(id, status) {
    const book = books.find((item) => item.id === id)
    handleUpdate(id, { status })
    setNotice(`„${book.title}” átkerült ide: ${STATUSES[status]}.`)
  }

  // … a handleRemove és a return eleje, mint eddig

            {shelfBooks.map((book) => (
              <BookItem key={book.id} book={book} onMove={handleMove} onUpdate={handleUpdate} onRemove={handleRemove} />
            ))}
```

`{ ...book, ...changes }`: előbb a könyv összes mezője, aztán a `changes` összes mezője. Ha egy mező mindkettőben
szerepel, a későbbi nyer: a `{ ...book, ...{ rating: 4 } }` a könyv 4-es értékeléssel.

:::check Ellenőrizd
Nyisd meg az „Elolvastam” polcot: A Pál utcai fiúknál öt szürke csillag áll. Kattints a negyedikre: négy aranyszínű
lesz. Bármelyik könyvnél kattints a „Jegyzet írása” gombra: megnyílik egy szövegmező, benne a kurzorral. Írj valamit,
és kattints a „Mentés”-re: a jegyzet dőlt betűvel megjelenik a cím alatt, a gomb pedig mostantól „Jegyzet
szerkesztése”. Nyisd meg újra, írd át a szöveget, és kattints a „Mégse”-re: marad a régi jegyzet. Frissíts: a négy
csillag és a jegyzet is megmaradt. Végül kattints megint a negyedikre: eltűnik az értékelés.
:::

:::mistake Gyakori hiba
Fordított sorrend a spreadben: `{ ...changes, ...book }`. Egy könyv első értékelése és első jegyzete még megmarad
(ilyen mezője addig nem volt), de utána hiába kattintasz: a könyv régi mezői kerülnek a végére, így felülírják az
újakat. Az áthelyező gombok pedig egyáltalán nem működnek, mert `status`-a minden könyvnek van. Ami nyerjen, az álljon
a végén.
:::

:::try Próbáld ki
Adj hosszkorlátot a jegyzetnek: `maxLength={300}` a `<textarea>`-ra, alá pedig egy számláló sort:
`{draft.length} / 300`.
:::

### Olvasási cél és statisztika

Hány könyvet olvasol el idén? Tűzzünk ki egy célt, és nézzük meg, hol tartasz. Ehhez az appnak tudnia kell, **mikor**
olvastál ki egy könyvet: amikor egy könyv az „Elolvastam” polcra kerül, kap egy dátumot.

A JavaScriptben a dátum `Date` objektum: a `new Date()` a „most”. A localStorage (és később a szerver) viszont csak
JSON-szöveget tud tárolni, a JSON-nak pedig nincs dátumtípusa. Ezért a dátumot szövegként tároljuk,
[[ISO-formátumban|ISO-dátum]]: a `new Date().toISOString()` értéke valami ilyesmi: `'2026-11-23T18:30:00.000Z'`. A
`new Date(szöveg)` visszaalakítja dátummá, a `getFullYear()` pedig megadja az évét. Az `src/App.jsx`-ben írd át így a
`handleMove`-ot:

```jsx file=src/App.jsx mark=3-5
  function handleMove(id, status) {
    const book = books.find((item) => item.id === id)
    // Az „Elolvastam” polcra tett könyv megjegyzi, mikor: az olvasási cél ezt számolja.
    if (status === 'read') handleUpdate(id, { status, finishedAt: new Date().toISOString() })
    else handleUpdate(id, { status })
    setNotice(`„${book.title}” átkerült ide: ${STATUSES[status]}.`)
  }
```

A statisztikát egy külön függvény számolja ki a könyvekből. Hozd létre az `src/stats.js` fájlt:

```js file=src/stats.js
// A statisztika, a könyvekből kiszámolva. Tiszta függvény: ugyanazokból a könyvekből mindig ugyanazok a számok jönnek ki.
export function readingStats(books, year) {
  const read = books.filter((book) => book.status === 'read')
  const readThisYear = read.filter((book) => book.finishedAt && new Date(book.finishedAt).getFullYear() === year)
  const rated = read.filter((book) => book.rating > 0)
  const ratingSum = rated.reduce((sum, book) => sum + book.rating, 0)

  return {
    total: books.length,
    read: read.length,
    readThisYear: readThisYear.length,
    averageRating: rated.length > 0 ? ratingSum / rated.length : null,
  }
}
```

- A [[reduce]] végigmegy egy tömbön, és egyetlen értéket épít fel belőle. Egy függvényt és egy kezdőértéket kap (itt
  `0`-t). A függvény megkapja az eddigi értéket (`sum`) és a következő elemet (`book`), és visszaadja az új eddigi
  értéket. Egy 4-es és egy 5-ös értékelésnél így megy: 0 → 0 + 4 = 4 → 4 + 5 = 9.
- Az átlag az összeg osztva az értékelt könyvek számával. Ha egy könyv sincs értékelve, nullával osztanánk, ezért
  ilyenkor `null`: „még nincs átlag”.
- Azoknak az elolvasott könyveknek, amelyek már e lépés előtt az „Elolvastam” polcon álltak (A Pál utcai fiúk, és az
  Egri csillagok, ha áttetted), nincs `finishedAt`-juk. A `book.finishedAt && …` kihagyja őket az idei számból, de az
  „Összesen elolvasva” számba beleszámítanak.
- Ez egy [[tiszta függvény]], mint a 8. lecke számológépének függvényei a `calculator.js`-ben: csak a paramétereit
  olvassa, semmit sem változtat meg, és ugyanarra a bemenetre mindig ugyanazt adja. A Reactről semmit sem tud, ezért könnyű tesztelni.

A cél és a számok saját kártyát kapnak. Hozd létre az `src/components/ReadingStats.jsx` fájlt:

```jsx file=src/components/ReadingStats.jsx
import { readingStats } from '../stats.js'

function ReadingStats({ books, goal, onGoalChange }) {
  const year = new Date().getFullYear()
  const stats = readingStats(books, year)
  // Gépelés közben a mező egy pillanatra üres is lehet: ilyenkor 1-nek számít a cél.
  const target = Math.max(1, Number(goal) || 1)
  const percent = Math.min(100, Math.round((stats.readThisYear / target) * 100))

  return (
    <section className="panel stats">
      <h2>Olvasónapló, {year}</h2>
      <div className="goal">
        <label className="goal__field">
          Célom:
          <input
            type="number"
            min="1"
            value={goal}
            onChange={(event) => onGoalChange(event.target.value)}
          />
          könyv ebben az évben
        </label>
        <progress className="goal__bar" value={stats.readThisYear} max={target} aria-label="Olvasási cél" />
        <p className="muted">
          {stats.readThisYear} / {target} elolvasva ({percent}%)
        </p>
      </div>
      <dl className="stats__grid">
        <div className="stat">
          <dt>A polcaimon</dt>
          <dd>{stats.total}</dd>
        </div>
        <div className="stat">
          <dt>Összesen elolvasva</dt>
          <dd>{stats.read}</dd>
        </div>
        <div className="stat">
          <dt>Átlagos értékelés</dt>
          <dd>
            {stats.averageRating === null
              ? '–'
              : `${stats.averageRating.toLocaleString('hu-HU', { maximumFractionDigits: 1 })} ★`}
          </dd>
        </div>
      </dl>
    </section>
  )
}

export default ReadingStats
```

- Az `<input type="number">` is szövegként adja az értékét. Ezt a szöveget úgy tároljuk, ahogy van
  (`onGoalChange(event.target.value)`), így kitörölheted a mezőt, és beírhatsz egy új számot. A szám, amivel számolunk,
  a `target`, származtatott érték: a `Number(goal)` számmá alakítja a szöveget, a `|| 1` az üres mezőből 1-et csinál
  (az üres szövegből 0 lesz, ami hamisnak számít), a `Math.max(1, …)` pedig legalább 1-en tartja, így sosem osztunk
  nullával.
- A `<progress>` a böngésző beépített haladásjelzője (a 6. leckében még magunk rajzoltuk meg): a `value` az, ahol
  tartasz, a `max` a vége. A `Math.min(100, …)` 100-on tartja a százalékot akkor is, ha többet olvasol, mint
  tervezted.
- A `toLocaleString('hu-HU', { maximumFractionDigits: 1 })` legfeljebb egy tizedesjeggyel, a magyar szokás szerint
  írja ki a számot: 4,5. (Angolul 4.5 lenne.)
- A számok egy [[leíró listában|leíró lista]] (`<dl>`) vannak: minden `<dt>` egy felirat, minden `<dd>` a hozzá
  tartozó érték. A képernyőolvasók párban olvassák fel őket.

Végül az `src/App.jsx`-ben: importáld a komponenst, a célt tartsd `useLocalStorage`-ben, a kártyát pedig tedd a fejléc
alá:

```jsx file=src/App.jsx mark=1,6,16
import ReadingStats from './components/ReadingStats.jsx'
// … a többi import, a START_BOOKS és az EMPTY_MESSAGES, mint eddig

function App() {
  const [books, setBooks] = useLocalStorage('book-library-books', START_BOOKS)
  const [goal, setGoal] = useLocalStorage('book-library-goal', 12)
  const [shelf, setShelf] = useLocalStorage('book-library-shelf', 'reading')
  // … a notice, a shelfBooks és a függvények, mint eddig

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>
      <ReadingStats books={books} goal={goal} onGoalChange={setGoal} />

      <SearchPanel books={books} onAdd={handleAdd} />
      {/* … a polcok és az űrlap, mint eddig … */}
```

:::check Ellenőrizd
A zöld sáv alatt új kártya jelenik meg: „Olvasónapló, 2026” (az aktuális év), „Célom: 12 könyv ebben az évben”, egy
üres sáv és „0 / 12 elolvasva (0%)”. Alatta három doboz: hány könyv van a polcaidon, hányat olvastál el összesen, és
mennyi az átlagos értékelés („–”, amíg egy könyv sincs értékelve). Tedd át a Kincskereső kisködmönt az „Elolvastam”
polcra: „1 / 12 elolvasva (8%)”, a sáv elkezd megtelni, az „Összesen elolvasva” pedig eggyel nő. Adj a Kincskereső
kisködmönnek 5 csillagot, A Pál utcai fiúknak 4-et: az átlag 4,5 ★ (ha más könyvet nem értékeltél). Állítsd a célt 2-re: „1 / 2 elolvasva
(50%)”. Frissíts: a cél 2 marad.
:::

:::mistake Gyakori hiba
`reduce` kezdőérték nélkül: `rated.reduce((sum, book) => sum + book.rating)`. Amíg egy könyv sincs értékelve, az oldal
elszáll: `Reduce of empty array with no initial value`. Kezdőérték nélkül a `reduce` az első elemet használja helyette,
egy üres tömbnek pedig nincs első eleme. (Könyveknél amúgy is hibás lenne: az első elem egy könyvobjektum, nem szám.)
A `reduce` mindig kapjon kezdőértéket.
:::

:::try Feladat
Tegyél be egy negyedik dobozt: hány könyv várakozik a „Szeretném elolvasni” polcon. Számold ki a `readingStats`-ban
(egy új mező a visszaadott objektumban), és mutasd meg a `ReadingStats`-ban.
:::

### Bejelentkezés

A polcaid most egyetlen böngészőben élnek. Ahhoz, hogy a telefonodon is lásd őket, egy [[szerver]]en kell tárolni
őket, a saját fiókodban. Ehhez az appnak előbb tudnia kell, ki vagy: [[bejelentkezés]] kell.

A kitalált szervernek erre is van egy fiókszolgáltatása. Az `src/mocks/accounts.js`-ben lakik, és a saját
localStorage-kulcsában (`book-library-server`) tartja az „adatbázisát”, de úgy viselkedik, mint egy igazi szerver:
minden válaszra várni kell egy kicsit, és a polcaidat csak annak a kérésnek adja oda, amelyik igazolja, ki vagy. A
végpontjai:

- `POST /api/login`, a törzsben `{ "name": "…", "password": "…" }`: bejelentkezés. Az első bejelentkezés egy új névvel
  létrehozza a fiókot, ezzel a jelszóval. A válasz: `{ "name", "token", "created" }`. Hibás jelszóra 401 a válasz.
- `GET /api/shelves`: a fiókban mentett polcok.
- `PUT /api/shelves`, a törzsben `{ "books": [ … ] }`: elmenti a polcokat a fiókba.

Itt új dolgok jönnek. A `POST` annak a kérésnek a [[HTTP-metódus]]a, amelyik adatot küld a szervernek, hogy az
csináljon vele valamit (itt: engedjen be, vagy hozzon létre egy fiókot); a `PUT` lecseréli a szerveren tárolt
valamit arra, amit a kérés küld. Az adat a kérés [[törzsében|kérés törzse]] utazik, JSON-szövegként, egy [[fejléc|HTTP-fejléc]]
(a törzs mellé tett, névvel ellátott információ) pedig megmondja a szervernek, milyen adat ez: `Content-Type:
application/json`. Sikeres bejelentkezés után a szerver kiad egy [[tokent|hozzáférési token]]: egy hosszú, véletlen
szöveget. Innentől az app minden kéréshez mellékeli az `Authorization` fejlécben, és a szerver ebből tudja, ki kérdez.
A token olyan, mint a ruhatári jegy: aki felmutatja, megkapja a kabátot, és nem kell újra elmondania a nevét meg a
jelszavát.

A fiókszolgáltatás minden kérése hasonló, ezért egy segédfüggvény küldi el őket. Hozd létre az `src/cloud.js` fájlt:

```js file=src/cloud.js
// A kitalált szerver fiókszolgáltatása (src/mocks/accounts.js): bejelentkezés, a polcok betöltése és mentése.

// Egy kérés a szervernek. Visszaadja a JSON-választ, vagy hibát dob, ami ismeri a státuszkódot.
async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data.message)
    error.status = response.status
    throw error
  }
  return data
}

// Az első bejelentkezés egy új névvel létrehozza a fiókot. A válasz: { name, token, created }.
export function logIn(name, password) {
  return request('/login', { method: 'POST', body: { name, password } })
}
```

- A `request` megkapja az útvonalat és a beállítások objektumát. A `{ method = 'GET', token, body } = {}` már a
  paraméterlistában szétszedi a beállításokat (destrukturálás), és a `method`-nak [[alapértelmezett paraméter]]értéket
  ad: ha a hívó nem ad meg metódust, `'GET'` lesz. A végén álló `= {}` miatt beállítások nélkül is hívható:
  `request('/shelves')`.
- A `fetch` második paramétere írja le a kérést: a metódusát, a fejléceit és a törzsét. A törzs csak szöveg lehet,
  ezért a `JSON.stringify` JSON-szöveggé alakítja az objektumot.
- A `headers.Authorization = …` egy már elkészült objektumhoz ad hozzá egy mezőt. A `Content-Type` névben kötőjel van,
  ezért csak szögletes zárójellel írható: `headers['Content-Type']`. A `Bearer` („a token felmutatója”) az a szó, ami
  megállapodás szerint a token elé kerül.
- A szerver hibaválaszából (`{ error, message }`) egy eldobott hiba lesz, rajta a státuszkóddal, ahogy a
  `useFetch`-ben.
- A `request`-et nem exportáljuk: csak a `cloud.js` használja. A `logIn` egyszerűen visszaadja a `request`
  Promise-át, így aki meghívja, `await`-tel megvárhatja.

A bejelentkezési űrlap az `src/components/LoginForm.jsx` fájlba kerül:

```jsx file=src/components/LoginForm.jsx
import { useState } from 'react'
import { logIn } from '../cloud.js'

function LoginForm({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false) // úton van a bejelentkezés?

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '' || password === '') {
      setError('Add meg a neved és egy jelszót.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const user = await logIn(name.trim(), password)
      await onLogin(user)
    } catch (err) {
      setError(err.status === 401 ? 'Hibás név vagy jelszó.' : 'A szerver nem válaszol. Próbáld újra!')
      setBusy(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <p className="muted">
        Az első bejelentkezés egy új névvel létrehozza a fiókodat. Ne valódi jelszót használj: ez csak egy gyakorló
        szerver.
      </p>
      <div className="login__fields">
        <label className="field">
          Név
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" />
        </label>
        <label className="field">
          Jelszó
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
      </div>
      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--primary" disabled={busy}>
        {busy ? 'Bejelentkezés…' : 'Bejelentkezés'}
      </button>
    </form>
  )
}

export default LoginForm
```

- A `busy` addig igaz, amíg a válaszra várunk: a gomb le van tiltva, és „Bejelentkezés…” áll rajta, így az űrlapot
  nem lehet kétszer elküldeni. Sikeres bejelentkezés után az űrlap eltűnik, ezért nem kell visszaállítani; hiba után
  viszont igen, hogy újra próbálkozhass.
- `await onLogin(user)`: az `App` függvényének is lehet még dolga (a következő lépésben lesz is), és az ő hibái is ebben
  az űrlapban jelenjenek meg.
- Az `autoComplete` megmondja a böngészőnek, melyik mező a felhasználónév és melyik a jelszó, így egy jelszókezelő ki
  tudja tölteni őket.

A bejelentkezést egy sáv mutatja: amíg senki sincs bejelentkezve, egy összecsukott űrlapot, utána a nevet és egy
„Kijelentkezés” gombot. Az összecsukást a böngésző `<details>` eleme végzi: csak a `<summary>` sora látszik, és egy
kattintás rá kinyitja a többit. Hozd létre az `src/components/AccountBar.jsx` fájlt:

```jsx file=src/components/AccountBar.jsx
import LoginForm from './LoginForm.jsx'

function AccountBar({ session, onLogin, onLogout }) {
  if (!session) {
    return (
      <details className="account">
        <summary>Jelentkezz be, hogy a polcaid a felhőben is meglegyenek</summary>
        <LoginForm onLogin={onLogin} />
      </details>
    )
  }

  return (
    <div className="account account--in">
      <span>
        Bejelentkezve: <strong>{session.name}</strong>
      </span>
      <button type="button" className="button button--small" onClick={onLogout}>
        Kijelentkezés
      </button>
    </div>
  )
}

export default AccountBar
```

Az `App`-ban a bejelentkezett felhasználó (a [[munkamenet]]: a név és a token) `useLocalStorage`-be kerül,
így egy frissítés nem jelentkeztet ki. A `null` azt jelenti, hogy senki sincs bejelentkezve. Az `src/App.jsx`-be írd
be ezeket (a többi marad, ami volt):

```jsx file=src/App.jsx mark=1,6,9-11,13-15,24-25
import AccountBar from './components/AccountBar.jsx'
// … a többi import, a START_BOOKS és az EMPTY_MESSAGES, mint eddig

function App() {
  // … a books, a goal és a shelf, mint eddig
  const [session, setSession] = useLocalStorage('book-library-session', null)
  // … a notice, a shelfBooks, a handleAdd, a handleUpdate, a handleMove és a handleRemove, mint eddig

  function handleLogin(user) {
    setSession({ name: user.name, token: user.token })
  }

  function handleLogout() {
    setSession(null)
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>

      <AccountBar session={session} onLogin={handleLogin} onLogout={handleLogout} />
      <ReadingStats books={books} goal={goal} onGoalChange={setGoal} />
      {/* … a kereső, a polcok és az űrlap, mint eddig … */}
```

:::check Ellenőrizd
A zöld sáv alatt egy sor áll: „Jelentkezz be, hogy a polcaid a felhőben is meglegyenek”. Kattints rá: kinyílik az
űrlap. Jelentkezz be egy tetszőleges névvel (például „Anna”) és egy kitalált jelszóval: egy pillanatig „Bejelentkezés…”
áll a gombon, aztán a sávban ez: „Bejelentkezve: Anna”, mellette egy „Kijelentkezés” gomb. Frissíts: bejelentkezve
maradsz. Jelentkezz ki, és lépj be „anna” néven egy másik jelszóval: „Hibás név vagy jelszó.” (A név nem érzékeny a kis-
és nagybetűkre.) A Network fülön kattints a `login` sorra: a Payload megmutatja, mit küldtél, a Response pedig a tokent.
:::

:::mistake Gyakori hiba
`body: body` a `JSON.stringify` nélkül. A böngésző az objektumból az `[object Object]` szöveget csinálja, a szerver
nem tud kiolvasni belőle se nevet, se jelszót, és 400-zal (hibás kérés) válaszol: az űrlap azt írja, „A szerver nem
válaszol”. A Network fülön látod az igazi okot: a kérés törzsét és a 400-as státuszt. Egy kérés törzse mindig szöveg.
:::

:::concept Hogyan működik egy igazi bejelentkezés?
Egy igazi szerver sosem tárolja magát a jelszavadat, csak a [[hash]]-ét (egy ujjlenyomatot, amiből a jelszó nem
fejthető vissza), a bejelentkezés pedig csak titkosított `https://` kapcsolaton utazik. Az igazi tokenek egy idő
(egy óra, egy nap) után lejárnak, kijelentkezéskor pedig a szerver is elfelejti a tokent. A mi kitalált szerverünk
olvasható szövegként tartja a jelszót a localStorage-ben: gyakorláshoz jó, igazi adathoz soha. Ezért kéri az űrlap,
hogy ne valódi jelszót használj.
:::

### A polcaid a szerveren

Most maguk a könyvek mennek a fiókba. A terv:

- **Bejelentkezés egy új fiókba:** a fiók megkapja ennek a böngészőnek a polcait, így semmi sem vész el.
- **Bejelentkezés egy meglévő fiókba, és minden frissítés bejelentkezve:** a fiókban mentett polcok lecserélik a
  böngészőben lévőket. (A böngésző a localStorage-ben megtart egy másolatot, így az oldalnak van mit mutatnia, amíg
  megérkezik a válasz.)
- **Minden változtatás bejelentkezve:** az egész lista elmegy a fiókba.
- **Kijelentkezés:** a böngésző elfelejti a polcokat; a fiókban várnak.

Előbb két újabb függvény kerül az `src/cloud.js`-be. Itt a teljes fájl:

```js file=src/cloud.js mark=28-37
// A kitalált szerver fiókszolgáltatása (src/mocks/accounts.js): bejelentkezés, a polcok betöltése és mentése.

// Egy kérés a szervernek. Visszaadja a JSON-választ, vagy hibát dob, ami ismeri a státuszkódot.
async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data.message)
    error.status = response.status
    throw error
  }
  return data
}

// Az első bejelentkezés egy új névvel létrehozza a fiókot. A válasz: { name, token, created }.
export function logIn(name, password) {
  return request('/login', { method: 'POST', body: { name, password } })
}

// A fiókban mentett könyvek (null, ha még semmit sem mentettek bele).
export async function loadBooks(token) {
  const data = await request('/shelves', { token })
  return data.books
}

// Elmenti a teljes listát a fiókba.
export function saveBooks(token, books) {
  return request('/shelves', { method: 'PUT', token, body: { books } })
}
```

A szerverrel való összhangot egy saját hook tartja. Hozd létre az `src/useCloudSync.js` fájlt:

```js file=src/useCloudSync.js
import { useEffect, useState } from 'react'
import { loadBooks, saveBooks } from './cloud.js'

// Összhangban tartja a könyveket a kitalált szerveren lévő fiókkal: bejelentkezés után (és minden
// frissítéskor) betölti őket, a save() pedig elküld minden változást.
function useCloudSync(token, setBooks) {
  // 'loading', 'saving', 'saved', 'load-failed', 'save-failed' vagy 'expired'
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0) // a reload() növeli, és az effekt újra lefut

  useEffect(() => {
    if (!token) return
    let ignore = false

    async function load() {
      setStatus('loading')
      try {
        const saved = await loadBooks(token)
        if (ignore) return
        // null: a fiókba még semmit sem mentettek, ezért maradnak ennek a böngészőnek a könyvei.
        if (saved !== null) setBooks(saved)
        setStatus('saved')
      } catch (error) {
        if (!ignore) setStatus(error.status === 401 ? 'expired' : 'load-failed')
      }
    }

    load()
    // Takarítás: kijelentkezés (vagy egy új próbálkozás) után erre a válaszra már nincs szükség.
    return () => {
      ignore = true
    }
  }, [token, attempt, setBooks])

  async function save(books) {
    if (!token) return // senki sincs bejelentkezve: a könyvek csak ebben a böngészőben maradnak
    setStatus('saving')
    try {
      await saveBooks(token, books)
      setStatus('saved')
    } catch (error) {
      setStatus(error.status === 401 ? 'expired' : 'save-failed')
    }
  }

  function reload() {
    setAttempt(attempt + 1)
  }

  return { status, save, reload }
}

export default useCloudSync
```

- **A betöltés** egy effektben történik, mert az állapotból következik (van token), nem egy kattintásból: lefut a
  bejelentkezés után, és bejelentkezve az oldal minden frissítésekor. Az `ignore` ugyanazt csinálja, amit a
  `useFetch`-ben az `AbortController`, csak egyszerűbben: ha kijelentkezel (vagy újra próbálkozol), mielőtt megjönne
  a válasz, a takarítás `true`-ra állítja, és a késve érkező választ eldobjuk. Ez a versenyhelyzet elkerülésének másik
  szokásos módja, a 9. lecke `useServerTodos`-ából ismerős: a kérést nem állítjuk le, csak a válaszát hagyjuk
  figyelmen kívül.
- A `setBooks` azért van a függőségi tömbben, mert az effekt használja. Ez a `useLocalStorage` belsejében lévő
  `useState` beállító függvénye, és a React minden rajzoláskor pontosan ugyanazt a függvényt adja vissza, így magától
  sosem futtatja újra az effektet.
- **A mentés** nem effekt, hanem egy függvény, a `save`, amit az `App` minden változás után meghív. Egy, a `books`-ra
  figyelő effekt a betöltés után is lefutna, és rögtön visszaküldené a szervernek, amit az épp most küldött nekünk.
  A változás annak az eredménye, amit a felhasználó csinált, ezért ott küldjük el, ahol ez történik, ahogy a 9. lecke
  teendőlistájának mentése is.
- A **401** azt jelenti, hogy a szerver nem ismeri (már) a tokent: ilyenkor a státusz `'expired'`, és újra be kell
  jelentkezni.

A sáv mutatja, hogy áll a mentés. Cseréld le az `src/components/AccountBar.jsx`-et erre:

```jsx file=src/components/AccountBar.jsx mark=3-11,13,28-35
import LoginForm from './LoginForm.jsx'

// Hogy áll a fiók, szavakban.
const MESSAGES = {
  loading: 'A polcaid betöltése…',
  saving: 'Mentés…',
  saved: 'Minden el van mentve a fiókodba',
  'load-failed': 'Nem sikerült betölteni a polcaidat.',
  'save-failed': 'Nem sikerült elmenteni az utolsó változtatást.',
  expired: 'Lejárt a bejelentkezésed: jelentkezz ki, aztán be újra.',
}

function AccountBar({ session, status, onLogin, onLogout, onRetry }) {
  if (!session) {
    return (
      <details className="account">
        <summary>Jelentkezz be, hogy a polcaid a felhőben is meglegyenek</summary>
        <LoginForm onLogin={onLogin} />
      </details>
    )
  }

  return (
    <div className="account account--in">
      <span>
        Bejelentkezve: <strong>{session.name}</strong>
      </span>
      <span className={`account__status account__status--${status}`} aria-live="polite">
        {MESSAGES[status]}
      </span>
      {(status === 'load-failed' || status === 'save-failed') && (
        <button type="button" className="button button--small" onClick={onRetry}>
          Újra
        </button>
      )}
      <button type="button" className="button button--small" onClick={onLogout}>
        Kijelentkezés
      </button>
    </div>
  )
}

export default AccountBar
```

A kötőjeles kulcsokat (`'load-failed'`) idézőjelbe kell tenni egy objektumban, különben a JavaScript kivonásnak
olvasná őket. Az állapotsor osztálya is a státusztól függ: a CSS pirosra színezi a hibákat.

Végül az `App`. Minden hely, amelyik eddig `setBooks`-szal változtatta a könyveket, mostantól a `changeBooks`-ot hívja,
ami a fiókba is elküldi a változást. Itt a teljes `src/App.jsx`, ahogy a lecke végén kinéz:

```jsx file=src/App.jsx mark=3-4,34,39-43,46,52,64,67-71,73-77,79-82,93,96
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useCloudSync from './useCloudSync.js'
import { saveBooks } from './cloud.js'
import { STATUSES } from './statuses.js'
import AccountBar from './components/AccountBar.jsx'
import ReadingStats from './components/ReadingStats.jsx'
import SearchPanel from './components/SearchPanel.jsx'
import ShelfTabs from './components/ShelfTabs.jsx'
import BookItem from './components/BookItem.jsx'
import AddBookForm from './components/AddBookForm.jsx'
import './App.css'

// Néhány könyv kezdésnek, hogy ne legyen üres a lista.
const START_BOOKS = [
  { id: 1, title: 'A Pál utcai fiúk', author: 'Molnár Ferenc', status: 'read' },
  { id: 2, title: 'Egri csillagok', author: 'Gárdonyi Géza', status: 'reading' },
  { id: 3, title: 'Kincskereső kisködmön', author: 'Móra Ferenc', status: 'want' },
]

// Ezt mondja egy üres polc.
const EMPTY_MESSAGES = {
  want: 'Még semmi sincs itt. Keress fent egy könyvet, és tedd fel ide!',
  reading: 'Most épp nem olvasol semmit.',
  read: 'Még nincs elolvasott könyved.',
}

function App() {
  const [books, setBooks] = useLocalStorage('book-library-books', START_BOOKS)
  const [goal, setGoal] = useLocalStorage('book-library-goal', 12)
  const [shelf, setShelf] = useLocalStorage('book-library-shelf', 'reading')
  const [session, setSession] = useLocalStorage('book-library-session', null)
  const [notice, setNotice] = useState('')
  const cloud = useCloudSync(session?.token, setBooks)

  // Nem állapot: a nyitott polc könyvei, minden rajzoláskor kiszámolva.
  const shelfBooks = books.filter((book) => book.status === shelf)

  // Minden változás itt megy át: azonnal látszik, és a fiókba is elmegy, ha valaki be van jelentkezve.
  function changeBooks(newBooks) {
    setBooks(newBooks)
    cloud.save(newBooks)
  }

  function handleAdd(book) {
    changeBooks([{ ...book, status: 'want' }, ...books])
    setNotice(`„${book.title}” felkerült ide: ${STATUSES.want}.`)
  }

  function handleUpdate(id, changes) {
    // Csak ez a könyv változik: egy másolata, ráírva a megváltozott mezők.
    changeBooks(books.map((book) => (book.id === id ? { ...book, ...changes } : book)))
  }

  function handleMove(id, status) {
    const book = books.find((item) => item.id === id)
    // Az „Elolvastam” polcra tett könyv megjegyzi, mikor: az olvasási cél ezt számolja.
    if (status === 'read') handleUpdate(id, { status, finishedAt: new Date().toISOString() })
    else handleUpdate(id, { status })
    setNotice(`„${book.title}” átkerült ide: ${STATUSES[status]}.`)
  }

  function handleRemove(id) {
    changeBooks(books.filter((book) => book.id !== id))
  }

  async function handleLogin(user) {
    // Egy új fiók ennek a böngészőnek a polcaival indul, így semmi sem vész el.
    if (user.created) await saveBooks(user.token, books)
    setSession({ name: user.name, token: user.token })
  }

  function handleLogout() {
    setSession(null)
    // A polcok a fiókban várnak; ez a böngésző elfelejti őket.
    setBooks([])
  }

  function handleRetry() {
    if (cloud.status === 'load-failed') cloud.reload()
    else cloud.save(books)
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>A könyveid, a saját polcaidon.</p>
      </header>

      <AccountBar
        session={session}
        status={cloud.status}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRetry={handleRetry}
      />
      <ReadingStats books={books} goal={goal} onGoalChange={setGoal} />
      <SearchPanel books={books} onAdd={handleAdd} />

      <section className="panel">
        <h2>Polcaim</h2>
        <ShelfTabs books={books} shelf={shelf} onChange={setShelf} />
        <p className="notice" aria-live="polite">
          {notice}
        </p>
        {shelfBooks.length === 0 ? (
          <p className="empty">{EMPTY_MESSAGES[shelf]}</p>
        ) : (
          <ul className="book-list">
            {shelfBooks.map((book) => (
              <BookItem key={book.id} book={book} onMove={handleMove} onUpdate={handleUpdate} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

- `session?.token`: amíg senki sincs bejelentkezve, a `session` értéke `null`, és a hook `undefined`-ot kap: nem tölt
  be semmit, a `save`-je pedig nem csinál semmit.
- A `changeBooks` az egyetlen ajtó, amin minden változás átmegy: a `handleAdd`, a `handleUpdate` és a `handleRemove`
  ezt hívja a `setBooks` helyett. (A `handleMove` a `handleUpdate`-et hívja, így az is ezen megy át.)
- A `handleLogout` az egyetlen kezelő az `App`-ban, ami szándékosan még közvetlenül a `setBooks`-ot hívja. A
  `changeBooks([])` a `cloud.save([])`-et is meghívná, és ennél a kattintásnál a hooknak még a régi tokenje van: az
  üres lista a fiókba is elmenne, és ott is letörölné a polcaidat. A kijelentkezés csak annyit tegyen, hogy ez a
  böngésző elfelejti őket.
- A `handleLogin` `async`, és egy új fióknál megvárja, amíg a szerver elmenti a könyveket, mielőtt beállítaná a
  munkamenetet.
  Ha a mentés nem sikerül, a hiba a `LoginForm` `catch`-ébe érkezik, és az űrlap kiírja. A munkamenet beállítása
  elindítja a hook effektjét, ami betölti a fiók polcait: egy új fióknál pontosan azt, amit az imént küldtünk el.
- A `handleRetry` tudja, mit kell újra megpróbálni: ha a betöltés nem sikerült, a betöltést; ha a mentés, a mostani
  lista elküldését.
- A könyvek továbbra is bekerülnek a localStorage-be: ez a másolat látszik, amíg a szerver nem válaszol.

:::check Ellenőrizd
Ha be vagy jelentkezve, jelentkezz ki, aztán lépj be egy új névvel, például „Bence”. A sávban ez áll: „Minden el van
mentve a fiókodba”. Vegyél fel egy könyvet: egy pillanatig „Mentés…”, aztán újra „Minden el van mentve a fiókodba”.
Jelentkezz ki: üresek a polcok. Lépj be újra Bence néven: visszajöttek a könyveid. Most nyisd meg ugyanezt a címet egy
privát ablakban (vagy egy másik böngészőben), és lépj be ott is Bence néven, akár egy másik jelszóval: beenged, és a
polcaidon csak a három mintakönyv áll, a te könyveid nélkül. A kitalált szerver ugyanis minden böngésző saját
tárolójában lakik, így ott még nem volt Bence nevű fiók, és most egy új jött létre (egy igazi szervernél a régibe
lépnél be). Végül a lejárt bejelentkezés: az első ablakban töröld a fejlesztői eszközökben a `book-library-server`
kulcsot (a kitalált szerver adatbázisát), és frissítsd az oldalt: „Lejárt a bejelentkezésed: jelentkezz ki, aztán be
újra.” (Vigyázz: ha most ki- és bejelentkezel, a polcaid elvesznek, mert a fiókod a törölt adatbázissal együtt
megszűnt, a kijelentkezés pedig a böngésző másolatát is törli.) Gratulálok, kész a könyvtárad: commitold!
:::

:::mistake Gyakori hiba
Valamelyik kezelőben `setBooks` marad a `changeBooks` helyett, például a `handleRemove`-ban. A törlés jónak tűnik, a
könyv eltűnik, de a fiók sosem értesül róla: jelentkezz ki és be, és a törölt könyv visszajön. Ha minden változás
egyetlen függvényen megy át, egyiket sem felejtheted ki.
:::

:::concept Mi van, ha egyszerre két eszközt használsz?
Ha a telefonodon és a laptopodon egyszerre változtatsz a polcaidon, az nyer, amelyik utoljára ment, a másik változás
pedig elvész: minden mentés az egész listát küldi. Az igazi appok ezt többféleképpen kezelik: csak a változást küldik
el („tedd a 7-es könyvet az Elolvastam polcra”), vagy verziószámot tartanak, és visszautasítják azt a mentést, ami egy
régi verzióra épült. Ez későbbi leckék témája; egy embernek, aki egyszerre egy eszközt használ, elég az „utolsó mentés
nyer”.
:::

:::try Próbáld ki
Az `src/mocks/accounts.js` elején a `FAIL_RATE` mondja meg, a kérések mekkora része hiúsuljon meg. Bejelentkezve állítsd
`1`-re, és mentsd el a fájlt. A fejlesztői szerver újratölti az oldalt, és már a betöltés sem sikerül: piros betűkkel
„Nem sikerült betölteni a polcaidat.”, mellette egy „Újra” gomb (ami persze most szintén kudarcot vall). Változtass
valamit a polcaidon: „Nem sikerült elmenteni az utolsó változtatást.” Most állítsd vissza a `FAIL_RATE`-et `0`-ra: az
újratöltés után a sávban megint „Minden el van mentve a fiókodba” áll. Az a változtatás, amit a szerver „kiesése”
alatt csináltál, elveszett: sosem jutott el a szerverig, a fiók példánya pedig lecserélte a böngészőben lévőt.
:::
