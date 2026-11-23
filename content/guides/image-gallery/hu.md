# Mit építünk?

Egy kiállítást, ami elfér a zsebedben. A Pocket Gallery 36 kicsi, kódból rajzolt műalkotást mutat rácsba rendezve:
ha rákattintasz egyre, nagyban is megnézheted, és lapozhatsz a képek között. Az oldal tetején egy magától lapozó
képváltó (carousel) váltogatja a képeket, és a saját fotóidat is hozzáadhatod. Közben megtanulod, hogyan lesz egy
weboldalon igazi modális ablak, hogyan dolgozik a React időzítőkkel és billentyűkkel, és hogyan olvas be a böngésző
fájlokat a gépedről.

:::levels
- Képek rácsban, kattintásra nagy nézet egy igazi modális ablakban, lapozással. | kb. 2 óra
- Saját képek feltöltése, magától lapozó carousel kézi vezérléssel, lapozás a nyílbillentyűkkel. | kb. 3 óra
- Albumok, lusta betöltés, végtelen görgetés, átrendezés húzással és kitekintés a felhős képtárhelyekre. | kb. 3 óra
:::

**Előismeret:** az előző leckék, főleg ezek: listák `map`-pel és `key`-jel (9. lecke), a `useEffect` takarító
függvénye (3. lecke), a frissítő függvény (6. lecke), a `setInterval` (11. lecke), a `useRef` (az 5. és a 8. lecke
haladó szintje), billentyűesemények (6–8. lecke), származtatott értékek (3. és 11. lecke). Amit itt új módon
használunk, azt újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Töltsd le a lecke **alapját** (fent: „Alap letöltése”), csomagold ki, és nyisd meg a `pocket-gallery` mappát a
szerkesztőben. Aztán írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Világosszürke oldalt látsz, rajta nagy
betűkkel a „Pocket Gallery” címet, alatta egy szürke sort: „36 small artworks, drawn in code.” Képek még nincsenek:
azokat te teszed ki.
:::

Az alapban négy dolog fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért nem kell stílust
  írnod: csak a lépésekben megadott osztályneveket (`grid`, `thumb`, `lightbox`, `carousel`, …) használod. Azért nézz
  bele!
- `src/photos.js`: a 36 kép adatai egy `PHOTOS` nevű tömbben.
- `public/photos/`: maguk a képek, 36 darab [[SVG]]-fájl. Az SVG olyan képformátum, ami nem pontokból áll, hanem
  alakzatokból (körökből, téglalapokból, görbékből), szövegként leírva: ezért bármekkorára nagyítod, éles marad.
  Nyiss meg egyet a szerkesztőben, és belenézhetsz.

A `PHOTOS` tömb minden eleme egy objektum, ami egy képet ír le. Az első így néz ki:

```js
{
  id: 'golden-hour',
  src: '/photos/golden-hour.svg',
  title: 'Golden Hour',
  alt: 'A gold sun setting into a navy sea under a violet and magenta sky',
  album: 'landscapes',
},
```

Az `id` egy egyedi név, a `src` az a cím, ahonnan a böngésző letölti a képet, a `title` a kép neve, ami a nagy nézetben
látszik, az `alt` egy leírás arról, mi van a képen (erről mindjárt bővebben), az `album` pedig az, hogy melyik albumba
tartozik. Az albumok csak a haladó szinten kellenek.

A `src` furcsán indul: `/photos/…`, pedig a fájl a `public/photos` mappában van. A [[public mappa]] különleges: a Vite
mindent, ami benne van, változatlanul kiszolgál a webhely gyökeréből. A `public/photos/golden-hour.svg` tehát a
`/photos/golden-hour.svg` címen érhető el, és pont ez áll a `src` mezőben.

:::try Próbáld ki
Írd be a böngésző címsorába: `http://localhost:5173/photos/golden-hour.svg`. Ott a kép magában: egy arany nap, ami a
tengerbe bukik.
:::

Az alap mindkét nyelven ugyanaz, ezért az oldal alcíme („36 small artworks, drawn in code.”), a képek címei és
leírásai, valamint a fájlokban lévő megjegyzések angolul vannak. Ha szeretnéd, fordítsd le őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te írsz be, magyar
feliratokkal és megjegyzésekkel mutatjuk.

:::concept Az alap egy git-repó
Ahogy az előző leckékben, a mappában már van egy első commit. A `git restore .` eldob minden változtatást az utolsó
commit óta (az új fájlok megmaradnak, azokat kézzel töröld). Ha egy lépés működik, commitold: `git add .`, majd
`git commit -m "Képek rácsban"`.
:::

### Képek rácsban

Kezdjük a legfontosabbal: jelenjen meg mind a 36 kép. A `PHOTOS` tömb minden eleméből egy listaelem lesz, benne egy
`<img>` elemmel. Ahogy a 9. leckében a feladatokból, ezt most is a tömbök `map` függvénye csinálja. Írd át az
`src/App.jsx`-et így (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1,12-18
import { PHOTOS } from './photos.js'
import './App.css'

function App() {
  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <ul className="grid">
        {PHOTOS.map((photo) => (
          <li key={photo.id} className="grid__item">
            <img src={photo.src} alt={photo.alt} />
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

- A `PHOTOS` nevesített exporttal érkezik, ezért kapcsos zárójelben töltjük be: `import { PHOTOS } from …`.
- A `map` minden képhez visszaad egy `<li>`-t, a React pedig a kapott elemeket egymás után kirajzolja.
- A `key={photo.id}` segít a Reactnek megkülönböztetni a listaelemeket. Az `id` egyedi, és sosem változik: tökéletes
  kulcs.
- A `src={photo.src}` kapcsos zárójelben egy JavaScript-értéket ad át: a böngésző erről a címről tölti le a képet.
- Az `alt` a kép [[alt szövege|alt szöveg]]: rövid leírás arról, mi látszik a képen. A képernyőolvasók ezt olvassák fel
  annak, aki nem látja a képet, és a böngésző is ezt írja ki, ha a kép nem tud betöltődni. A jó alt szöveg azt mondja
  el, amit a kép mutat („Egy arany nap a tengerbe bukik”), nem azt, hogy „kép” vagy „IMG_2041.jpg”.

A rácsot az `App.css` `.grid` szabálya rajzolja meg, és a lényeg egyetlen sor, a `grid-template-columns`:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}
```

A `repeat(auto-fill, minmax(130px, 1fr))` jelentése: annyi oszlop, amennyi kifér, mindegyik legalább 130 pixel széles,
a maradék helyen pedig egyenlően osztoznak. Így egy telefonon kettő, egy széles képernyőn hat oszlop lesz, egyetlen media
query nélkül. A `.grid img` szabály `aspect-ratio: 1` és `object-fit: cover` sora pedig négyzetre vágja az álló képeket:
a rács rendezett marad, a teljes kép majd a nagy nézetben látszik.

:::check Ellenőrizd
36 színes négyzet sorakozik a cím alatt, széles ablakban hat egy sorban. Húzd keskenyebbre a böngészőablakot: egyre
kevesebb oszlop lesz. A Chrome ablaka kb. 500 pixelnél nem lesz keskenyebb, ott még három oszlop van; kettőt a
telefonos nézetben látsz (++F12++, aztán ++Ctrl++ + ++Shift++ + ++M++, Macen ++Cmd++ + ++Shift++ + ++M++).
:::

:::mistake Gyakori hiba
`src="photo.src"`, idézőjelben. Ez nem a változó értéke, hanem szó szerint a „photo.src” szöveg: a böngésző egy ilyen
nevű fájlt keres, nem találja, és minden négyzet helyén egy törött kép ikonja meg az alt szöveg jelenik meg. JSX-ben a
JavaScript-érték kapcsos zárójelbe kerül.
:::

:::try Próbáld ki
Az `App.css`-ben írd át a `130px`-et `200px`-re: kevesebb, nagyobb kép lesz egy sorban. Utána állítsd vissza.
:::

### Kattintásra nagy nézet

Ha rákattintasz egy képre, nagyban kellene megjelennie. Ehhez három dolog kell: a kép legyen kattintható, az oldal
jegyezze meg, melyik képet nyitottad meg, és ha van megnyitott kép, rajzolja ki nagyban.

Kattintható elemre a HTML-ben a `<button>` való. Nemcsak egérrel működik: a ++Tab++ billentyűvel rá lehet lépni, az
++Enter++ megnyomja, és a képernyőolvasó is gombként mutatja be. A gomb neve a benne lévő kép alt szövege lesz. Egy
[[bélyegkép]] (thumbnail: a kép kicsinyített változata a rácsban) saját komponenst kap: hozz létre az `src` mappában egy
`components` mappát, benne egy `Thumbnail.jsx` fájlt:

```jsx file=src/components/Thumbnail.jsx
function Thumbnail({ photo, onOpen }) {
  return (
    <li className="grid__item">
      <button type="button" className="thumb" onClick={onOpen}>
        <img src={photo.src} alt={photo.alt} />
      </button>
    </li>
  )
}

export default Thumbnail
```

A `Thumbnail` nem tudja, mi történik kattintáskor: az `onOpen` propként kapott függvényt hívja meg, a többit az `App`
intézi. Az `App` egy állapotban jegyzi meg a megnyitott kép sorszámát. Írd át az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,3,7-9,19-21,24-41
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Thumbnail from './components/Thumbnail.jsx'
import './App.css'

function App() {
  // A nagyban megnyitott kép sorszáma a PHOTOS-ban, vagy null, ha egyik sincs megnyitva.
  const [openIndex, setOpenIndex] = useState(null)
  const openPhoto = openIndex === null ? null : PHOTOS[openIndex]

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <ul className="grid">
        {PHOTOS.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      {openPhoto && (
        <div className="lightbox">
          <button
            type="button"
            className="round lightbox__close"
            aria-label="Bezárás"
            onClick={() => setOpenIndex(null)}
          >
            ×
          </button>
          <figure className="lightbox__figure">
            <img src={openPhoto.src} alt={openPhoto.alt} />
            <figcaption>
              <strong>{openPhoto.title}</strong>
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  )
}

export default App
```

- A [[null]] a JavaScriptben azt jelenti: „nincs semmi”. Az `openIndex` kezdetben `null`, mert egyik kép sincs
  megnyitva. A 0 erre nem jó: az az első kép sorszáma.
- Az `openPhoto` nem saját állapot: az `openIndex`-ből számoljuk ki minden rajzoláskor. Ha az `openIndex` `null`,
  akkor `null`, különben a `PHOTOS` tömb `openIndex`-edik eleme.
- A `map` második paramétere, az `index`, megmondja, hányadik képnél tartunk (0-tól számolva).
- Az `onOpen={() => setOpenIndex(index)}` egy kis nyílfüggvény, amit a gomb csak kattintáskor hív meg. Minden
  bélyegkép saját függvényt kap, benne a saját sorszámával.
- A `key` most a `<Thumbnail>`-re kerül, mert a `map` ezt adja vissza. A komponensen belüli `<li>`-nek már nem kell.
- Az `{openPhoto && (…)}` [[feltételes megjelenítés]]: ha az `openPhoto` `null`, a helyén nem jelenik meg semmi.
- A `<figure>` egy képet fog össze a képaláírásával, a `<figcaption>` pedig maga a képaláírás.
- A bezárógombon csak egy × látszik, amit a képernyőolvasó „szorzásnak” olvasna, vagy sehogy. Az [[aria-label]] ad neki
  érthető nevet: „Bezárás”.

:::check Ellenőrizd
Kattints bármelyik képre: az oldal elsötétül, középen ott a kép teljes egészében (állóban, nem négyzetre vágva), alatta
a címe. A jobb felső × bezárja. Billentyűvel is megy: a ++Tab++ lépked a képeken (a kék keret mutatja, hol jársz), az
++Enter++ megnyitja azt, amelyiken állsz.
:::

:::mistake Gyakori hiba
`{openIndex && (…)}` az `{openPhoto && (…)}` helyett. A legelső kép nem nyílik meg, az oldal alján pedig egy magányos 0
jelenik meg. Az `a && b` ugyanis az `a`-t adja vissza, ha az „hamisnak számít” (`0`, `''`, `null`, `undefined`,
`false`), a React pedig a számokat kirajzolja, a 0-t is. Az `openPhoto` vagy egy objektum, vagy `null`, ezért vele ez
nem fordulhat elő.
:::

:::try Próbáld ki
Nyiss meg egy képet, és nyomd meg néhányszor a ++Tab++ billentyűt, aztán az ++Esc++-et. A kék keret eltűnik a sötét
réteg mögött: a láthatatlan képeken lépked. Az ++Esc++ pedig semmit sem csinál. A következő lépés ezt hozza rendbe.
:::

### Igazi modális ablak: a dialog elem

A sötét réteg kívülről úgy néz ki, mint egy ablak, de a böngésző csak egy újabb `<div>`-et lát. Egy igazi
[[modális ablak]] (modal) ennél többet tud: amíg nyitva van, az oldal többi része „nem létezik”. A billentyűzet fókusza
nem tud kiszökni belőle, az ++Esc++ bezárja, a képernyőolvasó nem olvassa fel a mögötte lévő oldalt, bezáráskor pedig a
fókusz visszaugrik oda, ahonnan jöttél.

Mindezt a böngésző beépített `<dialog>` eleme tudja, ha a `showModal()` függvényével nyitod meg. Itt jön a csavar: a
`showModal()` a böngészőben élő elem saját függvénye, és nincs olyan prop, amivel a React meghívhatná. (Van egy `open`
attribútum, de az modális viselkedés nélkül nyitja ki az ablakot, a fenti védelmek nélkül.) A JSX csak leírja, minek
kellene a képernyőn lennie; ami ebből ténylegesen létrejön, az a [[DOM]]: a böngészőben élő elemek fája. A `<dialog>`
DOM-elemét kell megfognunk, és ehhez a [[useRef]] hook kell, amellyel az 5. és a 8. lecke haladó szintjén már
találkozhattál.

Emlékeztetőül: a `useRef` egy dobozt ad, amit a React megőriz a rajzolások között, mint az állapotot, de ha a tartalma
megváltozik, **nem** rajzol újra. A doboz tartalma a `.current` mezőjében van. Ha egy JSX-elemnek `ref={dialogRef}`-et adsz, a React
a rajzolás után beleteszi a dobozba a valódi DOM-elemet: onnantól a `dialogRef.current` maga a `<dialog>`.

Hozd létre az `src/components/Lightbox.jsx` fájlt. A [[lightbox]] (szó szerint „fénydoboz”) a nagy képnézegetők
szokásos neve a weben.

```jsx file=src/components/Lightbox.jsx
import { useEffect, useRef } from 'react'

function Lightbox({ photo, onClose }) {
  const dialogRef = useRef(null)
  const isOpen = photo !== null

  // A <dialog>-ot a böngésző nyitja és zárja: rajzolás után szólunk neki.
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
    <dialog ref={dialogRef} className="lightbox" onClose={onClose} onClick={handleClick}>
      {isOpen && (
        <>
          <button type="button" className="round lightbox__close" aria-label="Bezárás" onClick={onClose}>
            ×
          </button>
          <figure className="lightbox__figure">
            <img src={photo.src} alt={photo.alt} />
            <figcaption>
              <strong>{photo.title}</strong>
            </figcaption>
          </figure>
        </>
      )}
    </dialog>
  )
}

export default Lightbox
```

- Az effekt a rajzolás **után** fut, amikor a `<dialog>` már létezik, és a `dialogRef.current`-ben van. A
  `dialog.open` megmondja, nyitva van-e éppen. Ha nyitva kellene lennie, de nincs, kinyitjuk; ha zárva kellene lennie,
  de nyitva van, bezárjuk. A függőségi tömb `[isOpen]`, mert csak akkor van dolgunk, amikor ez megváltozik.
- Miért kell a két `if`? Az ablak a React nélkül is bezárulhat (az ++Esc++ magától bezárja), ezért az effekt előbb
  megnézi, mi van valójában a képernyőn: csak akkor nyitja ki az ablakot, ha zárva van, és csak akkor zárja be, ha
  nyitva van. Így az effekt akárhányszor lefuthat baj nélkül. Ez fejlesztés közben is számít: ott a [[StrictMode]] egy
  komponens első megjelenésekor egyszer pluszban is lefuttatja az effekteket.
- A `<dialog>` mindig ott van az oldalon. Zárva láthatatlan (erről az `App.css` gondoskodik), csak a **tartalma** függ
  attól, van-e megnyitott kép. Ezért tudja az effekt bezárni is, és ezért tudja a `close()` visszavinni a fókuszt arra
  a bélyegképre, amelyikről jöttél.
- A `<dialog>` minden bezáráskor `close` eseményt küld, az ++Esc++ megnyomásakor is. Az `onClose={onClose}` erre
  figyel, így az `App` állapota mindig azt mutatja, ami a képernyőn van.
- A `handleClick` a sötét hátteret figyeli. Az `event.target` az az elem, amire ténylegesen kattintottál, az
  `event.currentTarget` pedig az, amelyiknek a kezelője éppen fut: a `<dialog>`. A kettő csak akkor ugyanaz, ha a
  kattintás magát a `<dialog>`-ot érte, nem a képet vagy egy gombot benne. A `<dialog>` az egész képernyőt beborítja,
  ezért a kép körüli sötét rész maga a `<dialog>`.
- A `<>` és a `</>` egy [[fragment]]: több elemet fog össze anélkül, hogy egy újabb HTML-elem kerülne az oldalra.

Az `App`-ból kikerül a `<div className="lightbox">`, és a helyére a `Lightbox` komponens lép. Itt a teljes
`src/App.jsx`:

```jsx file=src/App.jsx mark=4,25
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import './App.css'

function App() {
  // A nagyban megnyitott kép sorszáma a PHOTOS-ban, vagy null, ha egyik sincs megnyitva.
  const [openIndex, setOpenIndex] = useState(null)
  const openPhoto = openIndex === null ? null : PHOTOS[openIndex]

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <ul className="grid">
        {PHOTOS.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      <Lightbox photo={openPhoto} onClose={() => setOpenIndex(null)} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Ugyanúgy néz ki, mint eddig, de most tényleg ablakként viselkedik. Lépj egy képre a ++Tab++ billentyűvel, nyisd meg
++Enter++-rel, és zárd be ++Esc++-pel: a kék keret ott van azon a képen, amelyiket megnyitottad. Nyitott képnél a ++Tab++
már nem jut ki a sötét réteg mögé. Kattints a kép melletti sötét részre: az ablak bezáródik. Ha magára a képre
kattintasz, nyitva marad.
:::

:::mistake Gyakori hiba
Az effekt helyett közvetlenül a komponensben hívni: `dialogRef.current.showModal()`. A konzolban (++F12++) ez áll:
„Cannot read properties of null (reading 'showModal')”, az oldal pedig üres marad. Az első rajzolás közben a `<dialog>`
még nem létezik, a doboz üres (`null`): a React csak a rajzolás után teszi bele az elemet. Ezért kell a DOM-mal dolgozó
kód a `useEffect`-be.
:::

### Lapozás a nagy nézetben

Ha már nagyban nézed a képeket, kényelmes lenne a következőre lépni anélkül, hogy bezárnád az ablakot. A `Lightbox`
kap két nyílgombot és egy számlálót („3 / 36”). Itt a teljes `src/components/Lightbox.jsx`, a kiemelt sorok az újak:

```jsx file=src/components/Lightbox.jsx mark=3,30,33-38
import { useEffect, useRef } from 'react'

function Lightbox({ photo, position, onClose, onPrev, onNext }) {
  const dialogRef = useRef(null)
  const isOpen = photo !== null

  // A <dialog>-ot a böngésző nyitja és zárja: rajzolás után szólunk neki.
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
    <dialog ref={dialogRef} className="lightbox" onClose={onClose} onClick={handleClick}>
      {isOpen && (
        <>
          <button type="button" className="round lightbox__close" aria-label="Bezárás" onClick={onClose}>
            ×
          </button>
          <figure className="lightbox__figure">
            <img src={photo.src} alt={photo.alt} />
            <figcaption>
              <strong>{photo.title}</strong>
              <span>{position}</span>
            </figcaption>
          </figure>
          <button type="button" className="round lightbox__prev" aria-label="Előző kép" onClick={onPrev}>
            ←
          </button>
          <button type="button" className="round lightbox__next" aria-label="Következő kép" onClick={onNext}>
            →
          </button>
        </>
      )}
    </dialog>
  )
}

export default Lightbox
```

A lapozás az `App` dolga, hiszen ott él az `openIndex`. A „következő” egyszerű: eggyel nagyobb sorszám. De mi jön a
36. kép után? Az első, körbe-körbe. Erre való a 3. leckéből ismert [[modulo]], a `%`: a maradékos osztás maradéka.
A `(35 + 1) % 36` értéke 0, mert a 36-ban a 36 pontosan egyszer van meg, és nem marad semmi. Így az utolsó kép (35-ös
sorszám) után a 0-s, vagyis az első jön.

Visszafelé csavar van benne: a JavaScriptben a `-1 % 36` értéke -1, nem 35. Ezért előbb hozzáadjuk a képek számát, és
csak utána osztunk: `(0 - 1 + 36) % 36` = 35, a többi sorszámnál pedig a hozzáadott 36 a maradékon nem változtat. Itt a
teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=12-15,17-20,35-41
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import './App.css'

function App() {
  // A nagyban megnyitott kép sorszáma a PHOTOS-ban, vagy null, ha egyik sincs megnyitva.
  const [openIndex, setOpenIndex] = useState(null)
  const openPhoto = openIndex === null ? null : PHOTOS[openIndex]

  function showPrev() {
    // Az első előtt az utolsó jön; a + PHOTOS.length miatt nem lesz negatív.
    setOpenIndex((openIndex - 1 + PHOTOS.length) % PHOTOS.length)
  }

  function showNext() {
    // Az utolsó után az első jön: a % körbeér.
    setOpenIndex((openIndex + 1) % PHOTOS.length)
  }

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <ul className="grid">
        {PHOTOS.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      <Lightbox
        photo={openPhoto}
        position={`${openIndex + 1} / ${PHOTOS.length}`}
        onClose={() => setOpenIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
      />
    </main>
  )
}

export default App
```

A `position` egy [[template literal]]: a fordított aposztrófok közé írt szövegben a `${…}` helyére egy
JavaScript-érték kerül. A sorszám 0-tól indul, az emberek viszont 1-től számolnak, ezért `openIndex + 1`.

:::check Ellenőrizd
Nyisd meg az első képet: alatta „Golden Hour” és „1 / 36”. A → gomb lapoz („2 / 36”, „High Tide”), a ← visszalép. Az
első képen a ← az utolsóra ugrik („36 / 36”), az utolsón a → az elsőre. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
`(openIndex - 1) % PHOTOS.length`, a hozzáadás nélkül. Az első képen a ← -1-et ad, a `PHOTOS[-1]` értéke `undefined`,
és az oldal összeomlik: a konzolban „Cannot read properties of undefined (reading 'src')”. Visszafelé mindig add hozzá a
hosszt, mielőtt osztasz.
:::

:::try Próbáld ki
Lapozzon a kép is, ha rákattintasz: a `Lightbox`-ban add a nagy `<img>`-nek ezt: `onClick={onNext}`. Miért nem zárja
be ez a kattintás az ablakot? (Mert az `event.target` ilyenkor a kép, nem a `<dialog>`.)
:::

## Középszint {level=2}

### Saját képek feltöltése

Eddig a képek a `photos.js`-ből jöttek, és sosem változtak. Ha a felhasználó képeket adhat hozzá, a lista az oldal
használata közben változik, és az, ami változik, állapot. A `PHOTOS` tömb ezentúl csak a kezdőérték:
`useState(PHOTOS)`.

Fájlokat a böngészőben egy `<input type="file">` mezővel lehet kiválasztani. Kattintásra megnyitja a gép
fájlválasztóját, és amikor választottál, `change` eseményt küld. A feltöltőgomb saját komponens lesz. Hozd létre az
`src/components/UploadButton.jsx` fájlt:

```jsx file=src/components/UploadButton.jsx
// Minden feltöltött kép új azonosítót kap: upload-1, upload-2, …
let nextId = 1

function UploadButton({ onAdd }) {
  function handleChange(event) {
    // A kiválasztott fájlok listája, tömbbé alakítva.
    const files = Array.from(event.target.files)
    const newPhotos = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `upload-${nextId++}`,
        src: URL.createObjectURL(file),
        title: file.name,
        alt: file.name,
        album: 'uploads',
      }))
    onAdd(newPhotos)
    // Kiürítjük a mezőt, hogy ugyanazt a fájlt újra is ki lehessen választani.
    event.target.value = ''
  }

  return (
    <label className="upload">
      <input type="file" accept="image/*" multiple onChange={handleChange} />
      Képek feltöltése
    </label>
  )
}

export default UploadButton
```

Sok új dolog van benne, sorban:

- Az `accept="image/*"` megkéri a fájlválasztót, hogy csak képeket mutasson, a `multiple` pedig megengedi, hogy egyszerre
  többet is kiválassz.
- Az `event.target.files` a kiválasztott fájlok listája, egy [[FileList]]. Majdnem olyan, mint egy tömb, de nincs `map`
  és `filter` függvénye: az `Array.from` igazi tömböt csinál belőle.
- Minden elem egy `File` objektum: van neve (`file.name`, például `cica.jpg`), mérete (`file.size`, bájtban) és típusa
  (`file.type`). A típus egy [[MIME-típus]], vagyis szabványos név a fájl fajtájára: `image/png`, `image/jpeg`,
  `application/pdf`… Az `accept`-et meg lehet kerülni (a fájlválasztóban át lehet állítani „Minden fájl”-ra), ezért a
  `filter` csak azokat a fájlokat tartja meg, amelyek típusa így kezdődik: `image/`.
- Az `URL.createObjectURL(file)` az 5. leckéből ismert [[objektum-URL]]-t készít, egy ilyen címet:
  `blob:http://localhost:5173/3f2a…`. Ez a böngésző memóriájában tárolt fájlra mutat, és az `<img>` ugyanúgy betölti
  róla a képet, mint bármelyik másik címről. A képek tehát nem mennek sehova: a gépeden maradnak, a böngésző csak
  kölcsönad nekik egy címet. Ezért is tűnnek el, ha újratöltöd az oldalt.
- Az `alt` itt kényszerűségből a fájl neve: a program nem tudja, mi van a képen. Egy igazi galéria feltöltéskor megkéri
  a felhasználót, hogy írjon a képhez egy rövid leírást, és azt teszi az `alt`-ba.
- A `.map((file) => ({ … }))` egy objektumot ad vissza minden fájlhoz. Az objektum köré zárójel kell, különben a
  JavaScript a kapcsos zárójelet a függvény törzsének hinné.
- A `nextId` a komponensen **kívül** van, ezért egyetlen példányban létezik, és megmarad a rajzolások között. A
  `nextId++` előbb odaadja a mostani értékét, aztán eggyel növeli: az első kép `upload-1` lesz, a második `upload-2`.
  Nem állapot, mert semmi sem függ tőle a képernyőn.
- A `<label>` a mezőt is magában foglalja, ezért ha a feliratra kattintasz, az olyan, mintha a mezőre kattintanál. Magát
  a mezőt az `App.css` elrejti, de a ++Tab++ billentyűvel továbbra is el lehet érni, a kék keretet pedig a `<label>`
  kapja.

Az `App`-ban a `PHOTOS` helyére mindenhol a `photos` állapot kerül, és egy új függvény, az `addPhotos` fűzi hozzá az új
képeket. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=5,9-13,15-18,21-22,27,37-39,42,49
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import UploadButton from './components/UploadButton.jsx'
import './App.css'

function App() {
  // A képek listája mostantól állapot: a PHOTOS csak a kezdőértéke.
  const [photos, setPhotos] = useState(PHOTOS)
  // A nagyban megnyitott kép sorszáma a photos-ban, vagy null, ha egyik sincs megnyitva.
  const [openIndex, setOpenIndex] = useState(null)
  const openPhoto = openIndex === null ? null : photos[openIndex]

  function addPhotos(newPhotos) {
    // Az új képek előre kerülnek, a régiek utánuk: egy új tömb, a régit nem módosítjuk.
    setPhotos([...newPhotos, ...photos])
  }

  function showPrev() {
    // Az első előtt az utolsó jön; a + photos.length miatt nem lesz negatív.
    setOpenIndex((openIndex - 1 + photos.length) % photos.length)
  }

  function showNext() {
    // Az utolsó után az első jön: a % körbeér.
    setOpenIndex((openIndex + 1) % photos.length)
  }

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <div className="toolbar">
        <UploadButton onAdd={addPhotos} />
      </div>

      <ul className="grid">
        {photos.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      <Lightbox
        photo={openPhoto}
        position={`${openIndex + 1} / ${photos.length}`}
        onClose={() => setOpenIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
      />
    </main>
  )
}

export default App
```

A `[...newPhotos, ...photos]` a jól ismert [[spread]], ahogy a 7. leckében a tömbös állapotnál: egy új tömb, elöl az új
képekkel, utánuk a régiekkel. Az állapotban lévő tömböt sosem módosítjuk közvetlenül (például `push`-sal), mert akkor a
React nem venné észre a változást: a `setPhotos` mindig új tömböt kap.

:::check Ellenőrizd
A cím alatt megjelenik egy kék „Képek feltöltése” gomb. Kattints rá, és válassz ki egy vagy több képet a gépedről
(többet úgy jelölhetsz ki, hogy kattintás közben nyomva tartod a ++Ctrl++, Macen a ++Cmd++ billentyűt). A képeid a
rács elejére kerülnek. Nyisd meg az elsőt: nagyban is látszik, a számláló pedig egy új képnél már „1 / 37” (kettőnél
„1 / 38”, és így tovább). Töltsd újra az oldalt: a feltöltött képek eltűnnek, a 36 mintakép marad.
:::

:::mistake Gyakori hiba
Kimarad a zárójel az objektum körül: `.map((file) => { id: …, src: … })`. A JavaScript a kapcsos zárójelet a függvény
törzsének olvassa, abban pedig az `id: …, src: …` nem érvényes kód. Az oldal be sem töltődik: a Vite egy piros
hibaüzenetet mutat (a terminálban is), ami egy hiányzó pontosvesszőről szól („Expected a semicolon…”), és a `src:` sorra
mutat. Egy nyílfüggvényből közvetlenül visszaadott objektum mindig zárójelbe kerül: `({ … })`.
:::

:::concept Mikor szabadul fel a memória?
Egy objektum-URL addig tartja a fájlt a böngésző memóriájában, amíg az oldal nyitva van, vagy amíg meg nem hívod rá az
`URL.revokeObjectURL(photo.src)` függvényt. Nálunk a feltöltött képek addig kellenek, amíg az oldal nyitva van, úgyhogy
nincs vele dolgunk. Ha viszont egyszer törlés gombot írsz a feltöltött képekhez, törléskor így szabadítsd fel a kép
címét is, különben a fájl feleslegesen foglalja a memóriát.
:::

:::try Próbáld ki
Állítsd át a fájlválasztóban a szűrőt „Minden fájl”-ra, és válassz ki egy képet meg egy PDF-et vagy egy szöveges fájlt
egyszerre. Csak a kép jelenik meg: a `filter` kiszűrte a többit.
:::

### Carousel kézi léptetéssel

A [[carousel]] (magyarul képváltó) egy nagy színpad, ahol egyszerre egy kép látszik, és nyilakkal lehet lépkedni.
Ugyanaz a körbeérő lapozás, mint a nagy nézetben, csak most a carousel maga jegyzi meg, hányadik képnél tart. Ezt a
sorszámot senki más nem használja, ezért a carousel saját állapota lesz, nem az `App`-é. Hozd létre az
`src/components/Carousel.jsx` fájlt:

```jsx file=src/components/Carousel.jsx
import { useState } from 'react'

function Carousel({ photos }) {
  const [index, setIndex] = useState(0)
  const count = photos.length
  const photo = photos[index]

  function showPrev() {
    setIndex((index - 1 + count) % count)
  }

  function showNext() {
    setIndex((index + 1) % count)
  }

  return (
    <section className="carousel" aria-roledescription="képváltó" aria-label="Kiemelt képek">
      <div className="carousel__stage">
        {/* A key miatt minden képhez új <img> készül, így az előtűnő animáció mindig lejátszódik. */}
        <img key={photo.id} className="carousel__image" src={photo.src} alt={photo.alt} />
        <button type="button" className="round carousel__prev" aria-label="Előző kép" onClick={showPrev}>
          ←
        </button>
        <button type="button" className="round carousel__next" aria-label="Következő kép" onClick={showNext}>
          →
        </button>
      </div>
      <div className="carousel__bar">
        <p className="carousel__caption" aria-live="polite">
          <strong>{photo.title}</strong>
          <span>
            {index + 1} / {count}
          </span>
        </p>
      </div>
    </section>
  )
}

export default Carousel
```

- Az `aria-roledescription="képváltó"` és az `aria-label="Kiemelt képek"` megmondja a képernyőolvasónak, mi ez a
  rész: „Kiemelt képek, képváltó”. Az `aria-roledescription` a szerep nevét adja meg, és ezt is felolvassa a
  képernyőolvasó, ezért a felhasználó nyelvén írjuk.
- Az [[aria-live]] a 3. leckéből ismerős: ha a bekezdés tartalma megváltozik, a képernyőolvasó felolvassa, így a
  lapozás is hallható.
- A `key={photo.id}` a nagy képen: ha a kulcs megváltozik, a React nem a régi `<img>`-t frissíti, hanem újat készít
  helyette. Az `App.css` minden új `.carousel__image`-et finoman előtüntet, így ez az animáció minden lapozáskor
  lejátszódik.

A carousel a fejléc alá kerül, és ugyanazt a `photos` listát kapja, mint a rács, így a feltöltött képek is benne vannak.
Az `src/App.jsx`-ben töltsd be a többi import mellett, és tedd a `<header>` és a `toolbar` közé:

```jsx file=src/App.jsx mark=1,11
import Carousel from './components/Carousel.jsx'
// … a többi import és az App eleje, mint eddig

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <Carousel photos={photos} />

      {/* … a toolbar, a rács és a Lightbox, mint eddig … */}
    </main>
  )
}
```

:::check Ellenőrizd
A cím alatt egy sötét színpad jelenik meg a „Golden Hour” képpel, alatta „Golden Hour” és „1 / 36”. A nyilak lapoznak,
a kép minden váltáskor finoman előtűnik. A 36. kép után megint az első jön. Tölts fel egy képet: a számláló végén 37 áll.
:::

:::mistake Gyakori hiba
Kimarad a `key` a nagy képről. A lapozás működik, de az előtűnő animáció csak egyszer, az elején játszódik le: a React
ugyanazt az `<img>`-t tartja meg, és csak a `src`-jét írja át, a CSS-animáció pedig csak egy új elemen indul el.
:::

### Magától lapoz: setInterval

Egy carousel attól az igazi, hogy magától is lapoz. A 3. leckében a [[setTimeout]] egyszer hívott meg egy függvényt,
egy idő múlva. A [[setInterval]]-t a 11. leckéből már ismered (ott a `useNow` óráját frissítette 30 másodpercenként):
ugyanúgy indul, mint a `setTimeout`, de nem áll meg. A `setInterval(fn, 4000)` négymásodpercenként újra és újra
meghívja az `fn`-t, amíg a `clearInterval` le nem állítja.

Hol indítsuk el? Rajzolás közben semmiképp: az időzítő a rajzoláson kívüli munka, a `useEffect`-be való. És mivel nem
áll meg magától, a takarító függvénynek kell leállítania. Itt a teljes `src/components/Carousel.jsx`, egy Szünet /
Lejátszás gombbal:

```jsx file=src/components/Carousel.jsx mark=1,3,5-8,12,16-24,47-51
import { useEffect, useState } from 'react'

const DELAY = 4000 // ennyi ezredmásodpercig látszik egy kép: 4 másodperc

// Aki a gépén kevesebb mozgást kért, annak nem indul el magától a vetítés.
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Carousel({ photos }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const count = photos.length
  const photo = photos[index]

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      // Frissítő függvény: a React a legfrissebb indexet adja oda.
      setIndex((current) => (current + 1) % count)
    }, DELAY)
    // Takarítás: leállítja az időzítőt, mielőtt új indulna, és amikor a carousel eltűnik.
    return () => clearInterval(timer)
  }, [playing, count])

  function showPrev() {
    setIndex((index - 1 + count) % count)
  }

  function showNext() {
    setIndex((index + 1) % count)
  }

  return (
    <section className="carousel" aria-roledescription="képváltó" aria-label="Kiemelt képek">
      <div className="carousel__stage">
        {/* A key miatt minden képhez új <img> készül, így az előtűnő animáció mindig lejátszódik. */}
        <img key={photo.id} className="carousel__image" src={photo.src} alt={photo.alt} />
        <button type="button" className="round carousel__prev" aria-label="Előző kép" onClick={showPrev}>
          ←
        </button>
        <button type="button" className="round carousel__next" aria-label="Következő kép" onClick={showNext}>
          →
        </button>
      </div>
      <div className="carousel__bar">
        <button type="button" className="button" onClick={() => setPlaying(!playing)}>
          {playing ? 'Szünet' : 'Lejátszás'}
        </button>
        {/* Vetítés közben a képernyőolvasó nem olvas fel minden képváltást, csak ha valaki maga lapoz. */}
        <p className="carousel__caption" aria-live={playing ? 'off' : 'polite'}>
          <strong>{photo.title}</strong>
          <span>
            {index + 1} / {count}
          </span>
        </p>
      </div>
    </section>
  )
}

export default Carousel
```

- Az effekt csak akkor indít időzítőt, ha a `playing` igaz. A `clearInterval(timer)` a [[takarító függvény]]ben fut,
  amit a React meghív, mielőtt újra lefuttatná az effektet, és akkor is, ha a carousel eltűnik az oldalról.
- A függőségi tömb `[playing, count]`. Ha a Szünet gombbal megállítod a vetítést, a takarítás leállítja az időzítőt,
  és az effekt nem indít újat. Ha feltöltesz egy képet, a `count` változik: a régi időzítő leáll, és indul egy új, ami
  már az új számmal számol.
- A `setIndex` itt a 6. és a 7. leckéből ismert [[frissítő függvényt|frissítő függvény]] kapja: nem egy új értéket,
  hanem egy függvényt, amit a React a legfrissebb állapottal hív meg. Hogy erre miért van szükség, arról szól a lenti
  „Gyakori hiba” doboz.
- A `prefersReducedMotion` a 2. leckéből ismert `matchMedia`-t használja. A [[prefers-reduced-motion]] az 1. és a 2.
  leckéből ismerős rendszerbeállítás: aki szédül vagy elfárad a sok mozgástól, kérheti, hogy az oldalak kevesebbet
  mozogjanak. Nekik a vetítés megállítva indul, de a Lejátszás gombbal bármikor elindíthatják. A `useState(() => …)` a
  3. leckéből ismert [[lusta kezdőérték]]: a függvény csak az első rajzoláskor fut le.
- Miért kell Szünet gomb? Ami magától mozog, azt meg kell tudni állítani: aki lassabban olvas, vagy egy képet tovább
  nézne, annak a vetítés elrohan a szeme elől. Az akadálymentességi irányelvek (WCAG) ezt elő is írják.
- Vetítés közben az `aria-live` kikapcsol (`'off'`), különben a képernyőolvasó négymásodpercenként félbeszakítaná a
  felhasználót egy új képcímmel.

:::check Ellenőrizd
A carousel négymásodpercenként magától a következő képre lép. A „Szünet” gomb megállítja (a felirata „Lejátszás” lesz),
a „Lejátszás” újraindítja. A nyilak vetítés közben is működnek. (Ha a gépeden ki vannak kapcsolva az animációk, a
vetítés megállítva indul: ezt a `prefersReducedMotion` intézi. Ilyenkor a „Lejátszás” gombbal indítsd el.)
:::

:::mistake Gyakori hiba
`setIndex((index + 1) % count)` a frissítő függvény helyett. A carousel egyszer lép, a második képre, aztán ott ragad.
Az időzítő függvénye akkor készült, amikor az effekt lefutott, és azóta is azt az `index`-et látja, ami akkor volt: 0-t.
Ez a 7. leckéből ismert [[closure]]-csapda: a függvény magával viszi a változókat onnan, ahol létrejött, a régi
értékükkel együtt. Így négy másodperc múlva is, nyolc múlva is a `(0 + 1) % 36`-ot számolja. A frissítő függvény ezt kerüli meg: a React mindig az aktuális
értéket adja oda neki.
:::

:::try Feladat
Ha kézzel lapozol, a következő automatikus váltás nem vár ki egy teljes négy másodpercet: ha az időzítő éppen lejárni
készült, a kép rögtön tovább is lép. Tedd az `index`-et is a függőségi tömbbe: `[playing, count, index]`. Ettől minden
lapozás után lefut a takarítás, és egy friss időzítő indul. (A következő lépés kódja a feladat nélküli változatot
mutatja; ha megcsináltad, a te tömbödben maradjon benne az `index`.)
:::

### Lapozás a nyílbillentyűkkel

Egérrel már lehet lapozni, a nyílbillentyűkkel még nem. A 6–8. leckében már figyeltél
[[billentyűeseményre|billentyűesemény]]: a `keydown` esemény akkor jön, amikor lenyomnak egy billentyűt, és az `event.key` megmondja, melyiket. A nyilak neve
`'ArrowLeft'` és `'ArrowRight'`.

A kérdés most az, **ki** figyeljen. Ha az egész ablak figyelne (`window.addEventListener('keydown', …)` egy effektben),
minden nyíl mindenhol számítana: nyitott nagy nézetnél a carousel is lapozna a háttérben. A Reactben viszont bármelyik
elemre tehetsz `onKeyDown`-t, és az csak akkor fut le, ha a fókusz azon az elemen **vagy valahol benne** van. Ez a
[[buborékolás|eseménybuborékolás]] (a 8. lecke haladó szintjén már találkozhattál vele): egy esemény először azon az
elemen történik meg, amelyiken a fókusz áll (például egy gombon), aztán sorban az összes befoglaló elemen is, egészen a
`window`-ig. A nagy nézet a `<dialog>`-ban tartja a fókuszt, így a `<dialog>` `onKeyDown`-ja pontosan akkor fut le,
amikor kell.

Itt a teljes `src/components/Lightbox.jsx`:

```jsx file=src/components/Lightbox.jsx mark=19-22,25-31
import { useEffect, useRef } from 'react'

function Lightbox({ photo, position, onClose, onPrev, onNext }) {
  const dialogRef = useRef(null)
  const isOpen = photo !== null

  // A <dialog>-ot a böngésző nyitja és zárja: rajzolás után szólunk neki.
  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleClick(event) {
    // Ha magát a <dialog>-ot érte a kattintás (nem a képet, nem egy gombot), az a sötét háttér volt.
    if (event.target === event.currentTarget) onClose()
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') onPrev()
    if (event.key === 'ArrowRight') onNext()
  }

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      onClose={onClose}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {isOpen && (
        <>
          <button type="button" className="round lightbox__close" aria-label="Bezárás" onClick={onClose}>
            ×
          </button>
          <figure className="lightbox__figure">
            <img src={photo.src} alt={photo.alt} />
            <figcaption>
              <strong>{photo.title}</strong>
              <span>{position}</span>
            </figcaption>
          </figure>
          <button type="button" className="round lightbox__prev" aria-label="Előző kép" onClick={onPrev}>
            ←
          </button>
          <button type="button" className="round lightbox__next" aria-label="Következő kép" onClick={onNext}>
            →
          </button>
        </>
      )}
    </dialog>
  )
}

export default Lightbox
```

Az ++Esc++-hez nem kell kód: azt a `<dialog>` magától intézi. A carousel ugyanígy kap egy `onKeyDown`-t: ott akkor
lapoznak a nyilak, ha a fókusz a carouselben van, például miután rákattintottál az egyik nyílgombjára. Az
`src/components/Carousel.jsx`-ben írd a `handleKeyDown` függvényt a `showNext` alá, a `<section>` nyitócímkéjét pedig
cseréld le erre:

```jsx file=src/components/Carousel.jsx mark=1-4,11
  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') showPrev()
    if (event.key === 'ArrowRight') showNext()
  }

  return (
    <section
      className="carousel"
      aria-roledescription="képváltó"
      aria-label="Kiemelt képek"
      onKeyDown={handleKeyDown}
    >
```

:::check Ellenőrizd
Nyiss meg egy képet: a ++→++ és a ++←++ lapoz, az ++Esc++ bezár. Kattints a carousel → gombjára, aztán nyomkodd a
nyilakat: most a carousel lép. Amíg a nagy nézet nyitva van, a nyilak csak azt lapozzák, a carouselt nem. Ezzel kész a
középszint: commitold!
:::

:::mistake Gyakori hiba
`event.key === 'arrowright'` vagy `'Right'`. A billentyűk nevében a kis- és a nagybetű is számít: `'ArrowRight'`. Ha
nem vagy biztos egy névben, írd az eseménykezelő elejére: `console.log(event.key)`, és nyomd meg a billentyűt: a konzol
megmondja.
:::

:::try Feladat
A carousel a nyitott nagy nézet mögött is tovább vetít. Állítsd meg, amíg a nagy nézet nyitva van. Az `App` adja át
neki a `paused={openIndex !== null}` propot, a `Carousel` pedig fogadja a `paused`-ot: az effekt ne indítson
időzítőt, ha ez igaz (`if (!playing || paused) return`), és a `paused` kerüljön be a függőségi tömbbe. (A haladó
szinten közölt teljes `src/App.jsx` fájlok a feladat nélküli változatot mutatják; ha megcsináltad, a `<Carousel>`-on
hagyd meg a `paused` propot.)
:::

## Haladó szint {level=3}

### Albumok

A 36 kép három albumba tartozik: tájak (`landscapes`), formák (`shapes`) és minták (`patterns`). A feltöltött képek a
saját albumukba kerülnek (`uploads`). Jöjjön egy albumválasztó: gombok, amelyek közül egyszerre egy lehet kiválasztva.
Hozd létre az `src/components/AlbumFilter.jsx` fájlt:

```jsx file=src/components/AlbumFilter.jsx
const ALBUMS = [
  { id: 'all', label: 'Mind' },
  { id: 'landscapes', label: 'Tájak' },
  { id: 'shapes', label: 'Formák' },
  { id: 'patterns', label: 'Minták' },
  { id: 'uploads', label: 'Feltöltéseim' },
]

function AlbumFilter({ album, photos, onChange }) {
  return (
    <div className="albums" role="group" aria-label="Albumok">
      {ALBUMS.map((item) => {
        // Hány kép van ebben az albumban? A „Mind” az összes.
        const count =
          item.id === 'all' ? photos.length : photos.filter((photo) => photo.album === item.id).length
        return (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={album === item.id}
            onClick={() => onChange(item.id)}
          >
            {item.label}
            <span className="chip__count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default AlbumFilter
```

- A `map`-nek átadott nyílfüggvény most nem `(…)`, hanem `{…}` törzset kapott, mert a visszaadott gomb előtt még
  kiszámolunk valamit, a `count`-ot. Ilyenkor a `return` kiírása kötelező.
- Az [[aria-pressed]] a 2. leckéből ismerős: a ki-be kapcsolható gombokon jelzi, hogy a gomb le van-e nyomva (`true`,
  ha igen). A képernyőolvasó ezt is felolvassa, az `App.css` pedig ebből tudja, melyik gombot kell kitölteni.
- A `role="group"` és az `aria-label` egy csoportba foglalja a gombokat, „Albumok” néven.

Az `App`-ban az album új állapot lesz. Ami a rácsban látszik, az viszont **nem**: a 3. és a 11. leckéből ismert
[[származtatott érték]], az albumból és a képek listájából számoljuk ki minden rajzoláskor. Ha külön állapotban
tartanánk, minden feltöltésnél, minden albumváltásnál kézzel kellene frissíteni, és egyszer biztosan kimaradna. Fontos
még: a nagy nézet mostantól az album képei között lapoz, ezért az `openIndex` is az albumon belüli sorszám. Ha
megcsináltad a középszint utolsó feladatát, ebben és a következő teljes `App.jsx`-ben is hagyd meg a `<Carousel>`-nél
a `paused={openIndex !== null}` propot: a lenti kódok a feladat nélküli változatot mutatják. Itt a teljes
`src/App.jsx`:

```jsx file=src/App.jsx mark=5,13-14,17-19,27-28,33,46,50,53,60
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Carousel from './components/Carousel.jsx'
import UploadButton from './components/UploadButton.jsx'
import AlbumFilter from './components/AlbumFilter.jsx'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import './App.css'

function App() {
  // A képek listája: a PHOTOS csak a kezdőértéke.
  const [photos, setPhotos] = useState(PHOTOS)
  const [album, setAlbum] = useState('all')
  // A nagyban megnyitott kép sorszáma az albumPhotos-ban, vagy null, ha egyik sincs megnyitva.
  const [openIndex, setOpenIndex] = useState(null)

  // Származtatott értékek: minden rajzoláskor az állapotból számoljuk őket, nem kell hozzájuk saját állapot.
  const albumPhotos = album === 'all' ? photos : photos.filter((photo) => photo.album === album)
  const openPhoto = openIndex === null ? null : albumPhotos[openIndex]

  function addPhotos(newPhotos) {
    // Az új képek előre kerülnek, a régiek utánuk: egy új tömb, a régit nem módosítjuk.
    setPhotos([...newPhotos, ...photos])
  }

  function showPrev() {
    // Az első előtt az utolsó jön; a + albumPhotos.length miatt nem lesz negatív.
    setOpenIndex((openIndex - 1 + albumPhotos.length) % albumPhotos.length)
  }

  function showNext() {
    // Az utolsó után az első jön: a % körbeér.
    setOpenIndex((openIndex + 1) % albumPhotos.length)
  }

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <Carousel photos={photos} />

      <div className="toolbar">
        <AlbumFilter album={album} photos={photos} onChange={setAlbum} />
        <UploadButton onAdd={addPhotos} />
      </div>

      {albumPhotos.length === 0 && <p className="empty">Ebben az albumban még nincs kép.</p>}

      <ul className="grid">
        {albumPhotos.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      <Lightbox
        photo={openPhoto}
        position={`${openIndex + 1} / ${albumPhotos.length}`}
        onClose={() => setOpenIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
      />
    </main>
  )
}

export default App
```

A carousel továbbra is az összes képet kapja (`photos`): ő a kiállítás kirakata, nem az albumé.

:::check Ellenőrizd
A feltöltőgomb mellett megjelenik öt gomb, mindegyiken egy szám: Mind 36, Tájak 12, Formák 12, Minták 12,
Feltöltéseim 0. A „Mind” kék. Kattints a „Minták”-ra: a rácsban csak a 12 minta marad. Nyisd meg az elsőt: a
számláló „1 / 12”, és a lapozás a mintákon belül marad. Kattints a még üres „Feltöltéseim” albumra: szaggatott
keretben megjelenik az „Ebben az albumban még nincs kép.” üzenet. Tölts fel egy képet: a „Feltöltéseim” száma eggyel
nő.
:::

:::mistake Gyakori hiba
A `showPrev`, a `showNext` vagy az `openPhoto` még a `photos`-zal számol. A „Minták” albumban a második képre kattintva
akkor nem az nyílik meg, hanem az összes kép közül a második: egy táj. A rács, a nagy nézet és a lapozás mindig
ugyanazt a listát használja, itt az `albumPhotos`-t.
:::

### Lusta betöltés

Egy igazi galériában több száz kép is lehet, és a nagy részükig soha senki nem görget le. Fölösleges mindet letölteni,
amikor az oldal megnyílik. A [[lusta betöltés]] (lazy loading) azt jelenti, hogy a böngésző csak akkor tölt le egy
képet, amikor az közel ér a képernyőhöz. Ehhez egyetlen attribútum kell: `loading="lazy"`.

Ha már ott tartunk, a bélyegképek ne ugorjanak be hirtelen, hanem finoman tűnjenek elő, amikor megérkeztek. Az `<img>`
`load` eseményt küld, amikor a kép letöltődött, és kirajzolható; Reactben ez az `onLoad`. Itt a teljes
`src/components/Thumbnail.jsx`:

```jsx file=src/components/Thumbnail.jsx mark=1,4-5,13-15
import { useState } from 'react'

function Thumbnail({ photo, onOpen }) {
  // Megérkezett már a kép? Amíg nem, láthatatlan; utána a CSS finoman előtünteti.
  const [loaded, setLoaded] = useState(false)

  return (
    <li className="grid__item">
      <button type="button" className="thumb" onClick={onOpen}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className={loaded ? '' : 'is-loading'}
          onLoad={() => setLoaded(true)}
        />
      </button>
    </li>
  )
}

export default Thumbnail
```

Minden bélyegkép saját `loaded` állapotot kap, hiszen minden `<Thumbnail>` a komponens külön példánya, saját
memóriával. Amíg a kép nem érkezett meg, az `is-loading` osztály láthatatlanná teszi (`opacity: 0`), aztán az osztály
lekerül, és a CSS átmenete fél másodpercen belül előtünteti. Addig a gomb szürke háttere tölti ki a négyzetet.

A carousel képére **ne** tegyél `loading="lazy"`-t: az az oldal tetején van, azonnal látszik, a lusta betöltés csak
késleltetné.

:::check Ellenőrizd
A bélyegképek finoman előtűnnek, amikor az oldal betöltődik. A lusta betöltést a fejlesztői eszközökben figyelheted
meg. Nyisd meg őket (++F12++), válts a Network fülre, és a szűrőkben válaszd az Img-t. A Chrome jó messzire előre tölt
(kb. 1250 pixellel a látható rész alja alá), ezért egy számítógép képernyőjén (laptopon is) mind a 36 kép rögtön
letöltődik. Kapcsold be a telefonos nézetet (++Ctrl++ + ++Shift++ + ++M++, Macen ++Cmd++ + ++Shift++ + ++M++), és
töltsd újra az oldalt: a listában most nagyjából csak a képek fele szerepel, a képernyőn lévők és a kb. 1250 pixellel
alattuk lévők. Görgess lefelé: ahogy közeledsz, újabb `.svg` sorok jelennek meg a listában, a képek pedig előtűnnek.
:::

:::mistake Gyakori hiba
`onload`, kisbetűvel. A React figyelmeztet a konzolban („Invalid event handler property `onload`. Did you mean
`onLoad`?”), és nem köti be a kezelőt. A `loaded` így sosem lesz igaz, és az összes bélyegkép láthatatlan marad: csak a
szürke négyzetek látszanak. Reactben minden eseménykezelő prop neve az `on` után nagybetűvel folytatódik: `onClick`,
`onLoad`, `onKeyDown`.
:::

:::concept Hol laknak a képek egy igazi galériában?
A mintaképek a projekt `public` mappájában vannak, a feltöltöttek pedig csak a böngésző memóriájában: egy újratöltés,
és eltűnnek. Egy igazi galéria a feltöltött fájlt elküldi a saját szerverének (`fetch`-csel, egy `FormData`
objektumban), az pedig egy [[felhős képtárhelyre|felhős képtárhely]] teszi, például az Amazon S3-ra vagy a
Cloudinaryre. Cserébe egy állandó címet kap, amit adatbázisba ment, és amit bárki, bármelyik eszközről megnyithat. A
jobb képtárhelyek ennél többet is tudnak: egy képből magától kisebb változatokat készítenek (bélyegképet a rácsba,
nagyobbat a nagy nézetbe), és a világ sok pontján álló szervereikről, egy [[CDN]]-ről szolgálják ki, mindig a
látogatóhoz legközelebbiről. A rácsba így nem a 4 megabájtos eredeti fotó töltődik le, hanem egy 20 kilobájtos
bélyegkép: a lusta betöltés és a kicsi képek együtt adnak igazán gyors galériát. Ebben a kurzusban nem használunk
külső szolgáltatást, ezért a mi feltöltéseink a böngészőlapban maradnak.
:::

### Végtelen görgetés

A lusta betöltés a képek letöltését halasztja el, a bélyegképek elemei viszont mind ott vannak az oldalon. Egy több ezer
képes galériánál már ez is sok. A [[végtelen görgetés]] (infinite scroll) ennél tovább megy: eleinte csak 12 kép kerül
a rácsba, és amikor a görgetés a rács aljára ér, jön a következő 12. Egy igazi alkalmazás ilyenkor a szervertől kéri a
következő adagot (például `?page=2`), nálunk minden kép megvan már, úgyhogy csak egyre többet mutatunk belőlük. A
működés ugyanaz.

Honnan tudjuk, hogy a görgetés a rács aljára ért? A rács alá teszünk egy [[őrszem]] (sentinel) elemet, egy rövid
„Még több kép érkezik…” feliratot, és megkérjük a böngészőt, hogy szóljon, ha ez a képernyőre ér. Erre való az
[[IntersectionObserver]] (metszésfigyelő):

- A `new IntersectionObserver(callback, beállítások)` létrehoz egy figyelőt. A `callback` függvényt akkor hívja meg,
  amikor egy figyelt elem a képernyőre ér, vagy elhagyja azt, és egyszer rögtön az elején is, a kiinduló helyzettel.
- Az `observer.observe(elem)` elindítja egy elem figyelését, az `observer.disconnect()` leállít mindent.
- A `callback` egy listát kap (`entries`), figyelt elemenként egy bejegyzéssel. Nekünk egy elemünk van, az
  `entries[0]`, és annak az `isIntersecting` mezője igaz, ha az elem éppen látszik.
- A `rootMargin: '200px'` úgy tesz, mintha a képernyő 200 pixellel nagyobb lenne: a figyelő már akkor szól, amikor az
  őrszem még 200 pixellel a képernyő alja alatt van. Mire odagörgetsz, a képek már ott vannak.

Az őrszem DOM-elemére van szükség, ehhez megint egy `useRef` kell, ugyanúgy, mint a `<dialog>`-nál. Itt a teljes
`src/App.jsx`:

```jsx file=src/App.jsx mark=1,10,16-17,20-21,25-26,29-41,48-52,74,81,86-90
import { useEffect, useRef, useState } from 'react'
import { PHOTOS } from './photos.js'
import Carousel from './components/Carousel.jsx'
import UploadButton from './components/UploadButton.jsx'
import AlbumFilter from './components/AlbumFilter.jsx'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import './App.css'

const PAGE_SIZE = 12 // ennyi képpel bővül a rács egyszerre

function App() {
  // A képek listája: a PHOTOS csak a kezdőértéke.
  const [photos, setPhotos] = useState(PHOTOS)
  const [album, setAlbum] = useState('all')
  // Hány kép látszik az albumból a rácsban.
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  // A nagyban megnyitott kép sorszáma az albumPhotos-ban, vagy null, ha egyik sincs megnyitva.
  const [openIndex, setOpenIndex] = useState(null)
  // Az őrszem: egy elem a rács alatt. Ha a képernyő közelébe ér, jöhet a következő adag.
  const sentinelRef = useRef(null)

  // Származtatott értékek: minden rajzoláskor az állapotból számoljuk őket, nem kell hozzájuk saját állapot.
  const albumPhotos = album === 'all' ? photos : photos.filter((photo) => photo.album === album)
  const shownPhotos = albumPhotos.slice(0, shownCount)
  const hasMore = shownCount < albumPhotos.length
  const openPhoto = openIndex === null ? null : albumPhotos[openIndex]

  useEffect(() => {
    if (!hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        // Az őrszem a képernyő közelébe ért: jöhet a következő adag.
        if (entries[0].isIntersecting) setShownCount((count) => count + PAGE_SIZE)
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinelRef.current)
    // Takarítás: a régi figyelő leáll, mielőtt új indulna.
    return () => observer.disconnect()
  }, [hasMore, shownCount])

  function addPhotos(newPhotos) {
    // Az új képek előre kerülnek, a régiek utánuk: egy új tömb, a régit nem módosítjuk.
    setPhotos([...newPhotos, ...photos])
  }

  function changeAlbum(newAlbum) {
    setAlbum(newAlbum)
    // Új album: a rács újra az első adaggal indul.
    setShownCount(PAGE_SIZE)
  }

  function showPrev() {
    // Az első előtt az utolsó jön; a + albumPhotos.length miatt nem lesz negatív.
    setOpenIndex((openIndex - 1 + albumPhotos.length) % albumPhotos.length)
  }

  function showNext() {
    // Az utolsó után az első jön: a % körbeér.
    setOpenIndex((openIndex + 1) % albumPhotos.length)
  }

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <Carousel photos={photos} />

      <div className="toolbar">
        <AlbumFilter album={album} photos={photos} onChange={changeAlbum} />
        <UploadButton onAdd={addPhotos} />
      </div>

      {albumPhotos.length === 0 && <p className="empty">Ebben az albumban még nincs kép.</p>}

      <ul className="grid">
        {shownPhotos.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      {hasMore && (
        <p ref={sentinelRef} className="load-more">
          Még több kép érkezik…
        </p>
      )}

      <Lightbox
        photo={openPhoto}
        position={`${openIndex + 1} / ${albumPhotos.length}`}
        onClose={() => setOpenIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
      />
    </main>
  )
}

export default App
```

- A `slice(0, shownCount)` a tömb első `shownCount` elemét adja, új tömbben. A `hasMore` azt mondja meg, van-e még
  mutatnivaló: ha nincs, az őrszem sem jelenik meg.
- Az effekt elején az `if (!hasMore) return` kell: ha nincs őrszem, a `sentinelRef.current` `null`, és azt nem lehet
  figyelni.
- A `setShownCount((count) => count + PAGE_SIZE)` megint frissítő függvényt kap: a figyelő függvénye is egy régebbi
  rajzoláskor készült, ahogy a carousel időzítője.
- Miért van a `shownCount` a függőségi tömbben? A figyelő csak **változást** jelez. Egy nagy képernyőn megeshet, hogy a
  12 új kép után az őrszem még mindig látszik: ilyenkor nem változott semmi, a figyelő hallgat, és a rács megakadna. Így
  viszont minden új adag után lefut a takarítás, és egy friss figyelő indul, ami rögtön jelenti a kiinduló helyzetet: ha
  az őrszem még látszik, jön a következő adag.
- A `changeAlbum` az albumváltással együtt visszaállítja a `shownCount`-ot. Ennek az eseménykezelőben a helye, nem egy
  effektben: egy effekt csak a rajzolás után futna, így a rács egyszer még a régi számmal rajzolódna ki.
- A lightbox továbbra is az egész albumban lapoz (`albumPhotos`), nem csak a már látszó képek között.

:::check Ellenőrizd
Kapcsold be a telefonos nézetet (++F12++, aztán ++Ctrl++ + ++Shift++ + ++M++, Macen ++Cmd++ + ++Shift++ + ++M++), és
töltsd újra az oldalt: a rácsban 12 kép van, alatta a „Még több kép érkezik…” felirat. Görgess lefelé: újabb 12 kép
jön, aztán az utolsó 12, és a felirat eltűnik. Válts albumot: a 12 képes albumoknál egy adagban minden kép kifér, nincs
felirat. Ha visszaváltasz a „Mind”-ra, a rács megint az elejéről indul.

Kapcsold ki a telefonos nézetet, és töltsd újra: ha az oldal látható része (a böngésző fülei és címsora nélkül)
legalább kb. 850 pixel magas, a rács rögtön 24 képpel indul, mert az őrszem már induláskor a képernyő közelében volt,
és a figyelő ezt rögtön jelentette. Hogy nálad mennyi ez a magasság, azt a konzolba írt `innerHeight` megmondja.
Alacsonyabb képernyőn maradhat 12 is, az is rendben van. Ha pedig kb. 1180 pixelnél is magasabb,
rögtön mind a 36 ott van, és az alábbi kicsinyítés nem mutat újat. Most kicsinyítsd le az oldalt (++Ctrl++ + ++-++, Macen
++Cmd++ + ++-++, néhányszor, kb. 50%-ig, kisebb képernyőn 33%-ig), és töltsd újra: mind a 36 kép rögtön ott van. A 24.
kép után az őrszem még mindig látszott, és a harmadik adag csak azért jött meg, mert a `shownCount` változásakor egy
friss figyelő indult. Próbaképp vedd ki a `shownCount`-ot a függőségi tömbből: a rács ugyanitt megáll 24 képnél. Utána
tedd vissza, és állítsd vissza a nagyítást (++Ctrl++ + ++0++, Macen ++Cmd++ + ++0++).
:::

:::mistake Gyakori hiba
Kimarad az `if (!hasMore) return`. Amikor minden kép kint van, az őrszem eltűnik, a `sentinelRef.current` `null` lesz,
és az effekt következő futásakor az oldal összeomlik: „Failed to execute 'observe' on 'IntersectionObserver':
parameter 1 is not of type 'Element'.”
:::

### Átrendezés húzással

Utolsó lépésként azt oldjuk meg, hogy a képek sorrendjét is meg lehessen változtatni: fogd meg az egyiket, és húzd rá
egy másikra, annak a helyére. A 9. lecke haladó szintjén a teendőket már így rendezted át, most ugyanezt a képekkel
csináljuk. A böngésző beépített [[fogd és vidd|Drag and Drop API]] rendszere négy eseménnyel dolgozik:

- `dragstart`: amikor elkezded húzni az elemet. Ez a húzott elemen történik.
- `dragover`: folyamatosan, amíg egy elem fölött húzod. Alapból semmire sem lehet rádobni semmit; ha a
  `preventDefault()`-tal letiltod ezt az alapviselkedést, azzal engeded meg az ejtést.
- `drop`: amikor elengeded egy elem fölött. Ez a célelemen történik.
- `dragend`: amikor a húzás véget ér, akár sikerült az ejtés, akár nem. Ez megint a húzott elemen.

Egy elemet a `draggable` attribútum tesz húzhatóvá. A húzás alatt az `event.dataTransfer` a „csomag”, amit a húzás
magával visz: a `dragstart`-ban a `setData`-val beleteszünk valamit (a kép azonosítóját), a `drop`-nál a `getData`-val
kivesszük. A `'text/plain'` azt mondja meg, hogy sima szöveg van benne. Itt a teljes
`src/components/Thumbnail.jsx`:

```jsx file=src/components/Thumbnail.jsx mark=3,6-7,9-13,15-18,20-23,26-33
import { useState } from 'react'

function Thumbnail({ photo, onOpen, onMove }) {
  // Megérkezett már a kép? Amíg nem, láthatatlan; utána a CSS finoman előtünteti.
  const [loaded, setLoaded] = useState(false)
  // Éppen ezt a képet húzzák? Addig halványabb.
  const [dragging, setDragging] = useState(false)

  function handleDragStart(event) {
    // A húzás „csomagjába” a kép azonosítója kerül: az ejtésnél ebből tudjuk, melyik kép jött.
    event.dataTransfer.setData('text/plain', photo.id)
    setDragging(true)
  }

  function handleDragOver(event) {
    // Alapból semmire sem lehet rádobni semmit: ezzel engedjük meg.
    event.preventDefault()
  }

  function handleDrop(event) {
    event.preventDefault()
    onMove(event.dataTransfer.getData('text/plain'), photo.id)
  }

  return (
    <li
      className={dragging ? 'grid__item is-dragging' : 'grid__item'}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={() => setDragging(false)}
    >
      <button type="button" className="thumb" onClick={onOpen}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className={loaded ? '' : 'is-loading'}
          onLoad={() => setLoaded(true)}
        />
      </button>
    </li>
  )
}

export default Thumbnail
```

A `Thumbnail` csak annyit jelez az `App`-nak: „ezt a képet ide ejtették”. A sorrend az `App` `photos` állapotában él,
úgyhogy az átrendezés is ott történik. Írd az `src/App.jsx`-be a `movePhoto` függvényt a `changeAlbum` alá, és add át a
`Thumbnail`-nek:

```jsx file=src/App.jsx mark=1-10,19
  function movePhoto(fromId, toId) {
    const fromIndex = photos.findIndex((photo) => photo.id === fromId)
    const toIndex = photos.findIndex((photo) => photo.id === toId)
    // Nem a mi képünket ejtették ide (hanem például egy fájlt), vagy önmagára: nincs dolgunk.
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
    const newPhotos = [...photos] // másolat: az állapotot nem módosítjuk közvetlenül
    const [moved] = newPhotos.splice(fromIndex, 1) // kivesszük a régi helyéről…
    newPhotos.splice(toIndex, 0, moved) // …és betesszük a cél helyére
    setPhotos(newPhotos)
  }

  // … a return-ben a rács, a Thumbnail új propjával:
      <ul className="grid">
        {shownPhotos.map((photo, index) => (
          <Thumbnail
            key={photo.id}
            photo={photo}
            onOpen={() => setOpenIndex(index)}
            onMove={movePhoto}
          />
        ))}
      </ul>
```

- A `findIndex` megadja, hányadik elemre igaz a feltétel, és -1-et, ha egyikre sem. Az átrendezés a teljes `photos`
  listában történik, a képek azonosítója alapján, így egy albumon belül is pontosan működik.
- A `splice` helyben változtatja meg a tömböt: a `splice(fromIndex, 1)` kivesz egy elemet a `fromIndex` helyről, és
  visszaadja egy tömbben; a `splice(toIndex, 0, moved)` nem vesz ki semmit (0 darabot), hanem a `toIndex` helyre
  beszúrja a `moved`-ot. Mivel helyben változtat, csak a másolaton (`newPhotos`) szabad használni, sosem magán az
  állapoton.
- A `const [moved] = …` [[destrukturálás]]: a visszaadott tömb első elemét teszi a `moved` változóba.
- A húzott kép átveszi a cél helyét, a többi pedig egy hellyel arrébb csúszik. Ha előre húzol, a cél hátrébb lép, ha
  hátra, akkor előrébb.

:::check Ellenőrizd
Fogd meg egérrel a „Golden Hour” képet, és húzd rá a harmadikra. Húzás közben az eredeti helyén elhalványul. Elengedve
a harmadik helyre kerül, a második és a harmadik pedig egy hellyel előrébb csúszik. Válts a „Formák” albumra, és
rendezd át ott is a képeket: húzz egyet egy másikra. Nézd meg a carouselt is: a sorrendje követi a rácsot. Gratulálok,
kész a galériád!
:::

:::mistake Gyakori hiba
Kimarad a `preventDefault()` a `handleDragOver`-ből. Húzás közben a kurzor egy áthúzott kört mutat, és ha elengeded, a
kép visszarepül a helyére: a `drop` esemény meg sem történik, mert a böngésző szerint oda nem lehet ejteni.
:::

:::concept Telefonon és billentyűzettel
A HTML fogd és vidd rendszere egérre készült: érintőképernyőn nem minden böngésző támogatja, billentyűzettel pedig
egyáltalán nem lehet húzni. Egy igazi alkalmazás ezért mellé tesz egy másik utat is, például „Előrébb” és „Hátrébb”
gombokat, vagy egy erre szakosodott könyvtárat használ (például a dnd kitet), ami az érintést és a billentyűzetet is
kezeli.
:::

:::try Feladat
Adj minden bélyegkép alá két kis gombot (← és →), amelyek eggyel előrébb, illetve hátrébb teszik a képet. A `Thumbnail`
kapjon egy `onShift` propot. Az `App` a szomszédot abban a listában keresse, amit a rács mutat, ahogy a 9. leckében a
teendőknél: `const neighbor = albumPhotos[index + step]`, és ha van ilyen, hívja meg a `movePhoto`-t:
`movePhoto(photo.id, neighbor.id)`. Ha a teljes `photos` tömbben lépnél egyet, egy albumon belül sokszor egy másik
album képével cserélnél helyet, és nem látszana semmi. Így billentyűzettel is át lehet rendezni a galériát.
:::
