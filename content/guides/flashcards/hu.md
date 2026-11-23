# Mit építünk?

Tanulókártyákat: a kártya egyik oldalán egy kérdés áll, a másikon a válasz, és ha rákattintasz, térben megfordul, mint
egy igazi kártya. Lapozhatsz előre és hátra, saját paklikat állíthatsz össze, megjelölheted, mit tudsz már, és az app
mindezt megjegyzi. A végére okosabb is lesz: azokat a kártyákat, amelyek még kifognak rajtad, gyakrabban teszi eléd,
mint azokat, amelyeket már álmodból is tudsz.

Közben megtanulod, hogyan forgat a CSS egy elemet három dimenzióban, hogyan lapozol a kártyák között egérrel és
billentyűzettel, hogyan kever meg egy paklit, és hogyan lesz a 2. lecke `localStorage`-os mentéséből egy saját hook,
amit bármire használhatsz.

:::levels
- Kártyák kérdéssel és válasszal, amelyek kattintásra 3D-ben megfordulnak; lapozás gombokkal és a nyílbillentyűkkel. | kb. 2 óra
- Paklik és saját kártyák, „Tudom / Még nem” jelölés, haladásjelző, keverés és mentés egy saját `useLocalStorage` hookkal. | kb. 3 óra
- A nehezebb kártyák gyakrabban jönnek elő (Leitner-rendszer), képek a kártyákon, pakli letöltése és betöltése, megosztható link. | kb. 3 óra
:::

**Előismeret:** az első öt lecke, de leginkább az 1–3.: komponensek, props, JSX, `useState`, `useEffect` és a
takarítás, a `localStorage`, egy saját hook (`useDarkMode`), vezérelt űrlapmezők és a Fisher–Yates-keverés. Amit új
módon használunk, azt itt újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Töltsd le a lecke **alapját** (fent: „Alap letöltése”), és csomagold ki. Windowson a kibontás egy `flashcards` mappát
készíthet, benne egy újabb `flashcards` mappával: a belsőt nyisd meg a szerkesztőben, azt, amelyikben a `package.json`
van. Ha megcsináltad az előző leckéket, a Node.js és a VS Code már megvan; ha nem, az 1. lecke 0. lépése megmutatja,
hogyan telepítsd őket. Aztán a szerkesztő termináljában:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Egy halványszürke oldal közepén egy fehér
panelt látsz, a tetején a „Flashcards” címmel. Más még nincs rajta.
:::

Az alapban három fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen, az útmutató ezeket az osztályneveket (`card`, `study`, `decks`, …)
  használja. Egy dolog szándékosan hiányzik belőle: a kártya 3D-s megfordítása. Az a lecke egyik fő témája, azt te írod
  meg, a 2. lépésben.
- `src/cards.js`: két mintapakli. A `REACT_CARDS` a korábbi leckékben tanult React-fogalmakat kérdezi vissza (így
  építés közben ismételsz is), a `SPACE_CARDS` egy kis űrkvíz. Mindkettő egy [[tömb]], és minden eleme egy
  [[objektum]] három mezővel: `id` (egyedi azonosító, ami sosem jelenik meg), `question` (kérdés) és `answer` (válasz).

Az alap mindkét nyelven ugyanaz, ezért a mintakártyák és a fájlokban lévő megjegyzések angolul vannak, és a cím is
„Flashcards”. Ha szeretnéd, fordítsd le őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te írsz,
magyar feliratokkal és megjegyzésekkel mutatjuk.

Ahogy az eddigi leckékben, a mappa most is egy git-repó egyetlen committal, a kezdőállapottal: a `git restore .` minden
fájlt visszaállít, és érdemes minden működő lépés után commitolni.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza, vagyis HTML-szerű leírást arról, mi jelenjen meg. Kívülről a
[[props]]-ain keresztül kap adatot. Emlékezni a [[useState]] segítségével tud: ha egy állapotérték megváltozik, a React
újrarajzolja a komponenst. A rajzoláson kívüli munka, például egy figyelő vagy egy időzítő, a [[useEffect]]-be kerül,
és a takarító függvénye állítja le. Ha ezek közül valami ismeretlennek tűnik, lapozz vissza az 1–3. leckéhez.
:::

### Egy kártya a képernyőn

Kezdjük egyetlen kártyával. Saját komponenst kap, `Flashcard` néven: kívülről, propként megkapja a kártya adatait, és
egy saját állapotban jegyzi meg, hogy éppen melyik oldala látszik. Hozz létre az `src` mappában egy `components` mappát,
benne a `Flashcard.jsx` fájlt:

```jsx file=src/components/Flashcard.jsx
import { useState } from 'react'

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button type="button" className="card" onClick={() => setFlipped(!flipped)}>
      <span className="card__face card__front">
        <span className="card__label">{flipped ? 'Válasz' : 'Kérdés'}</span>
        <span className="card__text">{flipped ? card.answer : card.question}</span>
      </span>
    </button>
  )
}

export default Flashcard
```

- A `flipped` (megfordítva) állapot `false`-szal indul: a kártya a kérdésével kezd. Kattintáskor a
  `setFlipped(!flipped)` az ellenkezőjére állítja: a `false`-ból `true` lesz, a `true`-ból `false`.
- A `flipped ? card.answer : card.question` a 3. leckéből ismert [[ternáris operátor]]: ha a kártya meg van fordítva,
  a választ mutatja, különben a kérdést. A felirat (`Kérdés` / `Válasz`) is így dől el.
- Miért `<button>` a kártya, és nem egy `<div>`? Mert kattintani lehet rá. Egy gombra a billentyűzettel is rá lehet
  lépni (++Tab++), a ++Szóköz++ és az ++Enter++ megnyomja, és a képernyőolvasó is gombként mutatja be. Egy `<div>`
  ezek közül semmit sem tud magától.
- Egy gombon belül csak szövegszintű elemek állhatnak, például `<span>`, ezért nincs benne `<div>` vagy `<p>`. Hogy a
  belső `<span>`-ek mégis egymás alatt álljanak, azt az `App.css` intézi.

Most tedd ki az első kártyát az `src/App.jsx`-ben:

```jsx file=src/App.jsx mark=1,2,9
import { REACT_CARDS } from './cards.js'
import Flashcard from './components/Flashcard.jsx'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1>Flashcards</h1>
      <Flashcard card={REACT_CARDS[0]} />
    </main>
  )
}

export default App
```

A `REACT_CARDS[0]` a tömb első eleme: a tömbök 0-tól számolnak. A `{ REACT_CARDS }` kapcsos zárójele azért kell, mert
a `cards.js` [[nevesített exporttal|nevesített export]] adja a két tömböt (`export const …`), nem `default`-tal,
ahogy a 3. lecke `generator.js`-e is.

:::check Ellenőrizd
A cím alatt egy fehér kártya jelenik meg: fent zölddel „KÉRDÉS”, középen „What is JSX?”. Kattints rá: a felirat
„VÁLASZ” lesz, és megjelenik a válasz. Még egy kattintás, és visszajön a kérdés. A ++Tab++ billentyűvel is rá tudsz
lépni (sárga keret jelzi), és ilyenkor a ++Szóköz++ is megfordítja.
:::

:::mistake Gyakori hiba
`import REACT_CARDS from './cards.js'`, kapcsos zárójel nélkül. Ez a fájl `default` exportját kérné, de olyan nincs: az
oldal üres marad, a konzolban (++F12++ → Console) pedig ez áll: `does not provide an export named 'default'`.
:::

:::try Próbáld ki
Írd át a kártyát `REACT_CARDS[3]`-ra, aztán egy űrkvízes kártyára: ehhez a `SPACE_CARDS`-ot is be kell töltened az
`import { REACT_CARDS, SPACE_CARDS } from './cards.js'` sorral. Utána állítsd vissza `REACT_CARDS[0]`-ra.
:::

### Megfordítás 3D-ben

A kártya most csak kicseréli a szövegét. Egy igazi kártya viszont megfordul: a függőleges tengelye körül átbillen, és a
hátoldala kerül elénk. Ezt a böngésző is tudja, néhány CSS-szabállyal.

A CSS [[transform]] tulajdonsága elforgat, elmozdít vagy átméretez egy elemet, anélkül hogy a körülötte lévők odébb
mennének. A `rotateY(180deg)` 180 fokkal elforgatja a függőleges (Y) tengelye körül, vagyis éppen a hátát fordítja
felénk. Ahhoz, hogy ez igazi kártyafordulásnak látsszon, a kártyának két külön oldal kell, és négy dolog:

1. [[perspective]] (perspektíva): enélkül a forgás lapos. A kártya csak összeszűkül, majd újra kiszélesedik, mintha
   egy papírcsíkot néznél. A `perspective: 1000px` azt mondja meg, milyen messziről nézzük: a kisebb szám közelebb
   visz, és erősebb lesz a térhatás.
2. [[transform-style: preserve-3d|transform-style]] a forgó rétegen: a két oldal vele együtt, térben fordul. Enélkül a
   böngésző egyetlen lapos képpé préselné őket.
3. [[backface-visibility: hidden|backface-visibility]] az oldalakon: amelyik oldal háttal áll nekünk, az nem látszik.
4. A hátoldal eleve meg van fordítva (`rotateY(180deg)`), így a kártya fordulásakor éppen ez kerül elénk, és a szövege
   sem tükörírás.

A két oldal pontosan egymáson fekszik: a forgó réteg `position: relative`, az oldalak `position: absolute`, az
`inset: 0` pedig a forgó réteg mind a négy széléig kihúzza őket. A forgást az 1. leckéből ismert [[transition]]
animálja. Hozd létre az `src/components/Flashcard.css` fájlt:

```css file=src/components/Flashcard.css
/* A színpad: a perspektíva adja a mélységet, mintha 1000 pixel távolságból néznénk a kártyát. */
.card {
  perspective: 1000px;
}

/* Ez a réteg forog. A preserve-3d miatt a két oldala vele együtt, térben fordul. */
.card__inner {
  display: block;
  position: relative;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.card.is-flipped .card__inner {
  transform: rotateY(180deg);
}

/* A két oldal pontosan egymáson fekszik, és amelyik háttal áll nekünk, az nem látszik. */
.card__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden; /* a régebbi Safarinak */
}

/* A hátoldal eleve meg van fordítva: a kártya fordulásakor kerül elénk. */
.card__back {
  transform: rotateY(180deg);
}

/* Aki kikapcsolta a gépén az animációkat, annak a kártya azonnal fordul. */
@media (prefers-reduced-motion: reduce) {
  .card__inner {
    transition: none;
  }
}
```

A `-webkit-` kezdetű sor ugyanaz, mint fölötte, csak a régebbi Safari ezen a néven ismeri. Most cseréld le a
`Flashcard.jsx` tartalmát: a kártyának két oldala lesz, és egy köztes, forgó rétege.

```jsx file=src/components/Flashcard.jsx mark=2,10,13-23
import { useState } from 'react'
import './Flashcard.css'

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className={flipped ? 'card is-flipped' : 'card'}
      onClick={() => setFlipped(!flipped)}
    >
      <span className="card__inner">
        <span className="card__face card__front" aria-hidden={flipped}>
          <span className="card__label">Kérdés</span>
          <span className="card__text">{card.question}</span>
          <span className="card__hint">Kattints a megfordításhoz</span>
        </span>
        <span className="card__face card__back" aria-hidden={!flipped}>
          <span className="card__label">Válasz</span>
          <span className="card__text">{card.answer}</span>
        </span>
      </span>
    </button>
  )
}

export default Flashcard
```

- A kártya most nem a szövegét cseréli, hanem egy osztályt kap: megfordítva `card is-flipped`, különben csak `card`.
  A forgatás a CSS dolga: a `.card.is-flipped .card__inner` szabály akkor érvényes, ha a kártyán ott az `is-flipped`.
- A kártya mindkét oldala mindig ott van a képernyőn, csak az egyik háttal áll nekünk. A képernyőolvasó viszont
  mindkettőt felolvasná, ezért az [[aria-hidden]] elrejti előle azt, amelyik éppen nem látszik.

:::concept Hogyan áll össze?
Képzeld el rétegenként. Kívül a gomb (`.card`): ez a színpad, és ezen van a perspektíva. Benne a `.card__inner`: ez a
réteg forog, és viszi magával a két oldalt. Legbelül a két oldal, egymáson: elöl a kérdés, mögötte, eleve megfordítva
és ezért láthatatlanul, a válasz. Amikor a réteg 180 fokot fordul, a kérdés hátat fordít nekünk, és eltűnik, a válasz
pedig szembefordul velünk.
:::

:::check Ellenőrizd
Kattints a kártyára: kicsit több mint fél másodperc alatt átbillen, mint egy igazi kártya, és a sötétkék hátoldalán
megjelenik a válasz. Újabb kattintásra visszafordul. Ha a gépeden ki van kapcsolva az animáció (vagy a fejlesztői
eszközök Rendering paneljén a „prefers-reduced-motion” értékét `reduce`-ra állítod), a kártya azonnal fordul.
:::

:::mistake Gyakori hiba
Ha kimarad a `backface-visibility: hidden`, már megfordítás előtt is a sötét hátoldal látszik, tükörírással: a két
oldal egymáson fekszik, és a később következő hátoldal takarja a kérdést. Ha a `transform-style: preserve-3d` marad
ki, megfordítás után a kérdés látszik tükörírással, a válasz pedig sosem kerül elő.
:::

:::try Próbáld ki
Fordítsd a kártyát fölfelé, mint egy naptár lapját: írd át mindkét `rotateY(180deg)`-et `rotateX(180deg)`-re. Aztán
próbáld ki a `perspective`-et 300 és 3000 pixellel is. Ha megvan a kedvenced, a `rotateX`-et állítsd vissza
`rotateY`-ra, mert az útmutató így folytatja.
:::

### Előző és következő

Egy kártya kevés: lapozni szeretnénk a pakliban. Hogy hányadik kártyánál tartunk, az egy szám, az [[index]]: 0 az
első, 1 a második, és így tovább. Ez változik, miközben az oldalt használod, ezért állapot. Írd át az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,7-9,14-27
import { useState } from 'react'
import { REACT_CARDS } from './cards.js'
import Flashcard from './components/Flashcard.jsx'
import './App.css'

function App() {
  const [index, setIndex] = useState(0)
  const cards = REACT_CARDS
  const card = cards[index]

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <section className="study">
        <p className="study__counter">
          {index + 1}. kártya / {cards.length}
        </p>
        <Flashcard key={card.id} card={card} />
        <div className="study__nav">
          <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
            ← Előző
          </button>
          <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
            Következő →
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
```

- A `cards` egyelőre csak egy másik név a `REACT_CARDS`-ra. Hasznos lesz: a középszinten innen fog jönni a választott
  pakli, és a komponens többi részén semmit sem kell majd változtatni.
- A számláló `index + 1`-et ír ki, mert az emberek 1-től számolnak, a tömbök 0-tól. A `cards.length` a kártyák száma.
- Egy gomb a [[disabled]] attribútumtól lesz letiltva: ilyenkor nem lehet rákattintani, és az `App.css` halványabbra
  színezi. Az „Előző” az első kártyánál tiltott (`index === 0`), a „Következő” az utolsónál
  (`index === cards.length - 1`). Így az index sosem csúszhat ki a tömbből.
- A `key={card.id}` a 3. leckéből ismerős: ha egy komponens [[key]]-je megváltozik, a React vadonatúj komponensnek
  tekinti, friss állapottal. Lapozáskor az új kártya így mindig a kérdésével kezd.

:::check Ellenőrizd
A kártya fölött „1. kártya / 8” áll, az „Előző” gomb halvány. A „Következő” gombbal végiglapozhatod mind a nyolc
kártyát; az utolsónál ez a gomb lesz halvány. Fordíts meg egy kártyát, aztán lapozz: a következő kártya a kérdésével
kezd.
:::

:::mistake Gyakori hiba
Ha kimarad a `key={card.id}`, a React ugyanazt a `Flashcard`-ot tartja meg, csak új kártyát ad neki, a régi `flipped`
állapot pedig megmarad. Ha megfordítva lapozol tovább, a következő kártya rögtön a válaszával jelenik meg: a kártya
lelövi a poént, mielőtt gondolkodhatnál.
:::

:::try Próbáld ki
Lapozz az űrkvízben: töltsd be a `SPACE_CARDS`-ot is (`import { REACT_CARDS, SPACE_CARDS } from './cards.js'`), és
írd át a `const cards = REACT_CARDS` sort `SPACE_CARDS`-ra. Utána állítsd vissza.
:::

### Lapozás billentyűkkel

Gyorsabb, ha a nyílbillentyűkkel is lehet lapozni: a ++→++ előre, a ++←++ hátra. Ehhez a böngészőnek szólnunk kell,
hogy minden billentyűleütéskor hívja meg egy függvényünket. A billentyű lenyomása egy [[esemény]], a neve `keydown`. A
`window.addEventListener('keydown', fn)` feliratkozik rá: ettől kezdve a böngésző az egész oldalon minden
billentyűleütésnél meghívja az `fn`-t. Az 1. lecke `useHashRoute`-ja ugyanígy figyelte a `hashchange` eseményt.

A feliratkozás rajzoláson kívüli munka, ezért `useEffect`-be kerül, és egy takarító függvény iratkozik le, ha a
komponens eltűnik. Írd át az `src/App.jsx`-et így (a `return` nem változik):

```jsx file=src/App.jsx mark=1,10-19
import { useEffect, useState } from 'react'
import { REACT_CARDS } from './cards.js'
import Flashcard from './components/Flashcard.jsx'
import './App.css'

function App() {
  const [index, setIndex] = useState(0)
  const cards = REACT_CARDS

  // Billentyűparancsok: a ← és a → lapoz.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Takarítás: ha a komponens eltűnik, a figyelés is véget ér.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  const card = cards[index]

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <section className="study">
        <p className="study__counter">
          {index + 1}. kártya / {cards.length}
        </p>
        <Flashcard key={card.id} card={card} />
        <div className="study__nav">
          <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
            ← Előző
          </button>
          <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
            Következő →
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
```

- Az `event.key` a lenyomott billentyű neve: `'ArrowRight'`, `'ArrowLeft'`, `'a'`, `'Enter'`… Ha egy `if` után csak
  egyetlen utasítás jön, a kapcsos zárójel elhagyható.
- A [[Math.min]] a kisebbet adja vissza a két szám közül, a [[Math.max]] a nagyobbat. A
  `Math.min(i + 1, cards.length - 1)` így legfeljebb az utolsó kártyáig enged, a `Math.max(i - 1, 0)` pedig az első elé
  nem enged: a pakli két végén a billentyű egyszerűen nem csinál semmit.
- A [[függőségi tömb]] `[cards.length]`: a figyelő akkor iratkozik fel újra, ha megváltozik a kártyák száma. Lapozáskor
  nem.

És mi az a `setIndex((i) => …)`? Eddig mindig az új értéket adtuk a `set…` függvénynek. Most egy függvényt kap, egy
[[frissítő függvényt|frissítő függvény]]: a React meghívja a legfrissebb állapottal (itt `i` néven), és amit visszaad,
az lesz az új érték. Erre azért van szükség, mert az `onKeyDown` csak egyszer jön létre, az első rajzoláskor, és az
akkori változókat látja, köztük az akkori `index`-et, a 0-t. Az effekt nem fut le újra lapozáskor, így ez a régi 0 nem
frissül benne. A frissítő függvénynek viszont nem kell tudnia, mennyi most az `index`: a React megmondja neki.

:::check Ellenőrizd
Kattints az oldal egy üres részére, és nyomd meg többször a ++→++ billentyűt: a számláló lépked, egészen „8. kártya /
8”-ig, ott megáll. A ++←++ visszafelé visz, az első kártyánál megáll. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
`setIndex(index + 1)` a figyelőben, frissítő függvény nélkül. A ++→++ elvisz a 2. kártyáig, és ott megáll, akárhányszor
nyomod: a figyelő számára az `index` örökre 0 maradt, így mindig `0 + 1`-et állít be.
:::

:::try Feladat
A ++Home++ ugorjon az első kártyára, az ++End++ az utolsóra. Két új sor kell az `onKeyDown`-ba, a billentyűk neve
`'Home'` és `'End'`. (Laptopon ezek gyakran az ++Fn++ + ++←++ és az ++Fn++ + ++→++.)
:::

## Középszint {level=2}

### Paklik

Az alapban két pakli van, de egyszerre csak az egyiket látjuk. Legyen egy pakliválasztó: a paklik nevére kattintva
lehessen váltani. Ehhez szétszedjük az `App`-ot. Ami a lapozásról szól (az index, a billentyűk, a számláló, a kártya és
a gombok), az egy új komponensbe, a `Study`-ba (tanulás) költözik. Az `App` dolga pedig az lesz, hogy tudja, melyik
pakli van kiválasztva.

Hozd létre az `src/components/Study.jsx` fájlt. A java ismerős: ez az eddigi `App` lapozós része, csak a kártyákat most
propként kapja.

```jsx file=src/components/Study.jsx mark=4,9-10,20-23
import { useEffect, useState } from 'react'
import Flashcard from './Flashcard.jsx'

function Study({ cards }) {
  const [index, setIndex] = useState(0)

  // Billentyűparancsok: a ← és a → lapoz.
  useEffect(() => {
    // Üres pakliban nincs mit lapozni.
    if (cards.length === 0) return
    function onKeyDown(event) {
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Takarítás: ha a komponens eltűnik, a figyelés is véget ér.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  // Minden hook után: ha nincs kártya, csak egy üzenet jelenik meg.
  if (cards.length === 0) {
    return <p className="empty">Ez a pakli még üres.</p>
  }

  const card = cards[index]

  return (
    <section className="study">
      <p className="study__counter">
        {index + 1}. kártya / {cards.length}
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Előző
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
          Következő →
        </button>
      </div>
    </section>
  )
}

export default Study
```

Egy újdonság van benne: mi legyen, ha egy paklinak egyetlen kártyája sincs? A következő lépésben üres paklikat is
létrehozhatsz, és akkor a `cards[0]` értéke `undefined` lenne, a `card.id` pedig hibát dobna. Ezért ilyenkor a
komponens korán visszatér, és csak egy üzenetet rajzol ki. Ez a korai `return` viszont csak a hookok (`useState`,
`useEffect`) **után** állhat. Ez a [[hookok szabálya]]: a React a hookokat a sorrendjük alapján tartja nyilván, ezért
minden rajzoláskor ugyanazoknak, ugyanabban a sorrendben kell lefutniuk. Egy hook sosem állhat `if` mögött, és egy
korai `return` után sem.

A pakliválasztó gombjai a 2. lecke témaváltójára hasonlítanak: a kiválasztottat az [[aria-pressed]] jelzi, és a CSS is
ebből tudja, melyiket színezze ki. Hozd létre az `src/components/DeckPicker.jsx` fájlt:

```jsx file=src/components/DeckPicker.jsx
function DeckPicker({ decks, activeId, onSelect }) {
  return (
    <div className="decks">
      <div className="decks__list" role="group" aria-label="Paklik">
        {decks.map((deck) => (
          <button
            key={deck.id}
            type="button"
            className="chip"
            aria-pressed={deck.id === activeId}
            onClick={() => onSelect(deck.id)}
          >
            {deck.name}
            <span className="chip__count">{deck.cards.length}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DeckPicker
```

Végül az `App`. A paklik egy tömbbe kerülnek: mindegyik egy objektum azonosítóval, névvel és a kártyáival. A nevüket te
adod, ezért magyarul. Az állapot csak a kiválasztott pakli azonosítója. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=2-4,7-10,13,14,19-21
import { useState } from 'react'
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import './App.css'

const DECKS = [
  { id: 'react', name: 'React-alapok', cards: REACT_CARDS },
  { id: 'space', name: 'Űrkvíz', cards: SPACE_CARDS },
]

function App() {
  const [activeId, setActiveId] = useState(DECKS[0].id)
  const deck = DECKS.find((d) => d.id === activeId)

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={DECKS} activeId={activeId} onSelect={setActiveId} />
      {/* A key miatt pakliváltáskor új Study születik, és az első kártyával kezd. */}
      <Study key={deck.id} cards={deck.cards} />
    </main>
  )
}

export default App
```

- A [[find]] végigmegy a tömbön, és visszaadja az első elemet, amelyre a kapott függvény `true`-t mond: itt azt a
  paklit, amelyiknek az azonosítója a kiválasztott.
- A `DeckPicker` nem maga dönt: az `onSelect`-tel jelzi, melyik paklira kattintottak, és az `App` állítja át az
  állapotot. Átadhatjuk egyenesen a `setActiveId`-t is, hiszen az is egy függvény, ami egy azonosítót vár.
- A `Study` a `key={deck.id}` miatt minden pakliváltáskor újraszületik, friss, 0-s indexszel.
- A `Flashcard` importja az `App`-ból átköltözött a `Study`-ba, oda, ahol használjuk.

:::check Ellenőrizd
A cím alatt két gomb: „React-alapok 8” (sötét, ki van választva) és „Űrkvíz 8”. Kattints az „Űrkvíz”-re: a kártyán
„Which planet has a day longer than its year?” áll, a számláló „1. kártya / 8”. A nyilak és a gombok itt is lapoznak.
:::

:::mistake Gyakori hiba
Ha a `Study`-ról lemarad a `key={deck.id}`, pakliváltáskor megmarad a régi index: az 5. React-kártyáról az 5.
űrkérdésre ugrasz, nem az elsőre. Egy rövidebb paklinál pedig az index kicsúszhat a tömbből, és az oldal összeomlik.
:::

:::try Feladat
Írj egy harmadik paklit a `DECKS` tömbbe, három saját kártyával (`id`, `question`, `answer`), például a kedvenc
sorozatodról. Az azonosítók legyenek egyediek, mert a `key`-ek is ezekből lesznek.
:::

### Saját pakli, saját kártyák

Eddig minden kártyát a kódba írtunk. Most az appban lehessen új paklit nyitni és kártyát írni. Ettől kezdve a paklik
listája változik, miközben az oldalt használod, tehát állapot lesz belőle.

Az állapotot most sem módosítjuk közvetlenül, hanem mindig újat készítünk helyette. Ez az [[immutábilis frissítés]]
(immutábilis: megváltoztathatatlan): a React úgy veszi észre a változást, hogy összehasonlítja a régi és az új
értéket, és ha a tömb ugyanaz a tömb, azt hiszi, nem történt semmi. Két fogást használunk:

- `[...decks, newDeck]`: egy új tömb a régi elemeivel és a végén egy újjal. A `...` a [[spread]], amit az 1. leckében
  objektumokkal láttál; tömbökre ugyanígy működik.
- `decks.map((d) => (d.id === deck.id ? { ...d, cards } : d))`: egy új tömb, amelyben a kiválasztott pakli helyén
  egy másolat áll új kártyákkal, a többi pakli pedig változatlan. A `{ ...d, cards }` a `{ ...d, cards: cards }`
  rövidítése.

Előbb az űrlapok. Mindkettő az 1. lecke kapcsolati űrlapjának mintáját követi: [[vezérelt mezők|vezérelt mező]], az
`onSubmit` a küldésre figyel, és az `event.preventDefault()` megakadályozza, hogy a böngésző újratöltse az oldalt. A
pakliválasztó kap egy kis űrlapot az új pakli nevéhez. Itt a teljes `src/components/DeckPicker.jsx`:

```jsx file=src/components/DeckPicker.jsx mark=1,3-11,29-38
import { useState } from 'react'

function DeckPicker({ decks, activeId, onSelect, onCreate }) {
  const [name, setName] = useState('')

  function submit(event) {
    event.preventDefault()
    if (name.trim() === '') return
    onCreate(name.trim())
    setName('')
  }

  return (
    <div className="decks">
      <div className="decks__list" role="group" aria-label="Paklik">
        {decks.map((deck) => (
          <button
            key={deck.id}
            type="button"
            className="chip"
            aria-pressed={deck.id === activeId}
            onClick={() => onSelect(deck.id)}
          >
            {deck.name}
            <span className="chip__count">{deck.cards.length}</span>
          </button>
        ))}
      </div>
      <form className="deck-form" onSubmit={submit}>
        <input
          aria-label="Az új pakli neve"
          placeholder="Az új pakli neve"
          maxLength={40}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">+ Új pakli</button>
      </form>
    </div>
  )
}

export default DeckPicker
```

A [[trim]] levágja a szöveg elejéről és végéről a szóközöket: a `'  Angol  '.trim()` értéke `'Angol'`. Így egy csupa
szóközből álló név üresnek számít, és nem lesz belőle pakli. A mezőnek nincs látható címkéje, csak a szürke
`placeholder` (helykitöltő) szöveg, ami gépeléskor eltűnik; ezért az `aria-label` adja a nevét a képernyőolvasónak. A
`maxLength={40}` legfeljebb 40 karaktert enged beírni.

A kártyák űrlapja hasonló, csak két mezővel. A `<textarea>` a 4–5. leckéből ismert többsoros szövegmező
([[szövegterület|textarea]]); Reactben ugyanúgy `value`-t és `onChange`-et kap, mint egy `<input>`. Hozd létre az
`src/components/CardForm.jsx` fájlt:

```jsx file=src/components/CardForm.jsx
import { useState } from 'react'

function CardForm({ onAdd }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  function submit(event) {
    event.preventDefault()
    // Üres (vagy csak szóközökből álló) kérdést vagy választ nem mentünk.
    if (question.trim() === '' || answer.trim() === '') return
    onAdd(question.trim(), answer.trim())
    setQuestion('')
    setAnswer('')
  }

  return (
    <form className="card-form" onSubmit={submit}>
      <h2>Új kártya ebbe a pakliba</h2>
      <label>
        Kérdés
        <textarea rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} />
      </label>
      <label>
        Válasz
        <textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} />
      </label>
      <button type="submit" className="button--primary">
        Kártya hozzáadása
      </button>
    </form>
  )
}

export default CardForm
```

Az új pakliknak és kártyáknak egyedi azonosító kell. A böngésző gyárt nekünk: a `crypto.randomUUID()` minden hívásra egy
új, 36 karakteres [[UUID]]-t ad, például `'3b241101-e2bb-4255-8caf-4136c566a962'`. Két egyforma gyakorlatilag sosem
jön ki. Most kösd be az űrlapokat az `src/App.jsx`-ben:

```jsx file=src/App.jsx mark=5,8,14-16,18-31,36,39
import { useState } from 'react'
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React-alapok', cards: REACT_CARDS },
  { id: 'space', name: 'Űrkvíz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useState(START_DECKS)
  const [activeId, setActiveId] = useState(START_DECKS[0].id)
  const deck = decks.find((d) => d.id === activeId)

  function createDeck(name) {
    const newDeck = { id: crypto.randomUUID(), name, cards: [] }
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  // Az aktív pakli kártyáit cseréli le; a többi pakli változatlan marad.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer }])
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={decks} activeId={activeId} onSelect={setActiveId} onCreate={createDeck} />
      {/* A key miatt pakliváltáskor új Study születik, és az első kártyával kezd. */}
      <Study key={deck.id} cards={deck.cards} />
      <CardForm onAdd={addCard} />
    </main>
  )
}

export default App
```

A `DECKS` neve `START_DECKS` lett, mert már csak a kezdőérték: a paklik ezentúl a `decks` állapotban élnek. A
`createDeck` létrehoz egy üres paklit, és rögtön ki is választja. Az `addCard` az aktív pakli kártyáinak végére fűz egy
újat.

Végül két apróság a `Study`-ban. Most már vannak szövegmezők az oldalon, és bennük a nyilakkal a szövegkurzort
mozgatod. A figyelőnk viszont az egész oldalon minden billentyűt elkap, így gépelés közben a kártyák is lapoznának.
Az `event.target` az az elem, amelyikben a billentyűt lenyomták, a `matches('input, textarea')` pedig megmondja,
illik-e rá ez a CSS-szelektor, vagyis szövegmező-e. Az üres pakli üzenete pedig megmondhatja, mi a teendő. Itt a
teljes `src/components/Study.jsx`:

```jsx file=src/components/Study.jsx mark=12-13,24
import { useEffect, useState } from 'react'
import Flashcard from './Flashcard.jsx'

function Study({ cards }) {
  const [index, setIndex] = useState(0)

  // Billentyűparancsok: a ← és a → lapoz.
  useEffect(() => {
    // Üres pakliban nincs mit lapozni.
    if (cards.length === 0) return
    function onKeyDown(event) {
      // Gépelés közben a nyilak a szövegmezőé.
      if (event.target.matches('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Takarítás: ha a komponens eltűnik, a figyelés is véget ér.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  // Minden hook után: ha nincs kártya, csak egy üzenet jelenik meg.
  if (cards.length === 0) {
    return <p className="empty">Ez a pakli még üres. Írd meg az első kártyáját lent!</p>
  }

  const card = cards[index]

  return (
    <section className="study">
      <p className="study__counter">
        {index + 1}. kártya / {cards.length}
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Előző
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
          Következő →
        </button>
      </div>
    </section>
  )
}

export default Study
```

:::check Ellenőrizd
Írd be egy új pakli nevét, például „Angol szavak”, és nyomj ++Enter++-t: megjelenik az új gomb „0”-val, ki is van
választva, alatta pedig az „Ez a pakli még üres” üzenet. Írj egy kérdést és egy választ, és kattints a „Kártya
hozzáadása” gombra: ott az első kártyád, a gombon „1” áll. Gépelés közben a ++←++ és a ++→++ a szövegben mozog, a
kártyákhoz nem nyúl. (Egy újratöltés még mindent eltüntet: a mentés a középszint utolsó lépése.)
:::

:::mistake Gyakori hiba
`deck.cards.push(newCard)`, aztán `setDecks(decks)`. A `push` a meglévő tömböt módosítja, így a `setDecks` ugyanazt a
tömböt kapja vissza, amit már ismer. A React nem lát változást, és a képernyőn semmi sem történik. Mindig új tömböt adj
az állapotnak.
:::

:::concept Mikor nincs crypto.randomUUID?
A `crypto.randomUUID` a vágólaphoz hasonlóan csak biztonságos oldalakon létezik: `https://` címeken és a `localhost`-on.
Ha a telefonodról a géped IP-címén nyitod meg az oldalt (`npm run dev -- --host`, aztán a „Network” sorban kiírt
`http://192.168…` cím), új pakli létrehozásakor a konzolban `crypto.randomUUID is not a function` hibát látsz. A kész,
`https://`-en közzétett appban ez nem gond.
:::

### Tudom / Még nem

A tanuláshoz tudni kell, mit tudsz már. Minden kártya alá jöjjön két gomb: „Még nem” és „Tudom”. A válasz egy
jelölés, amit a kártya azonosítójához kötünk, egy objektumban: `{ jsx: 'known', props: 'learning' }`. A kulcs a kártya
`id`-je, az érték `'known'` (tudom) vagy `'learning'` (tanulom). A jelöléseknek túl kell élniük a pakliváltást, a
`Study` viszont minden pakliváltáskor elölről kezd (ezt csinálja a `key`). Ezért a jelölések egy szinttel feljebb, az
`App`-ban laknak.

A jelölésekből egy haladásjelző is lesz: hány kártyát tudsz a pakliból. Ez nem új állapot, hanem a 3. leckéből ismert
[[származtatott érték]]: minden rajzoláskor kiszámoljuk a pakliból és a jelölésekből.

A sáv szélességét a kód számolja ki, ezért JSX-ből adjuk meg, a `style` proppal. Ez egy objektumot vár, ezért kettős a
kapcsos zárójel: a külső a JSX-é („itt JavaScript jön”), a belső maga az objektum. A tulajdonságneveket camelCase-ben
írjuk (`backgroundColor`, nem `background-color`). Hozd létre az `src/components/ProgressBar.jsx` fájlt:

```jsx file=src/components/ProgressBar.jsx
function ProgressBar({ known, total }) {
  const percent = total === 0 ? 0 : Math.round((known / total) * 100)

  return (
    <div className="progress">
      <div className="progress__labels">
        <span>
          Tudod: {known} / {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label="Haladás"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={known}
      >
        <span className="progress__bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
```

A `role="progressbar"` és az `aria-value…` attribútumok megmondják a képernyőolvasónak, hogy ez egy haladásjelző, és
hol tart. A `width` értéke az 1. leckéből ismert [[template literal]], a fordított aposztrófok közé írt szöveg: a
benne álló `${percent}` helyére a `percent` értéke kerül, így lesz belőle `'38%'`-hoz hasonló szöveg. A
`total === 0 ? 0 : …` azért kell, mert egy üres paklinál nullával osztanánk.

A `Study` kapja meg a jelöléseket (`marks`) és a jelölő függvényt (`onMark`). Itt a teljes `src/components/Study.jsx`:

```jsx file=src/components/Study.jsx mark=3,5,29-37,41,43-46,49-56
import { useEffect, useState } from 'react'
import Flashcard from './Flashcard.jsx'
import ProgressBar from './ProgressBar.jsx'

function Study({ cards, marks, onMark }) {
  const [index, setIndex] = useState(0)

  // Billentyűparancsok: a ← és a → lapoz.
  useEffect(() => {
    // Üres pakliban nincs mit lapozni.
    if (cards.length === 0) return
    function onKeyDown(event) {
      // Gépelés közben a nyilak a szövegmezőé.
      if (event.target.matches('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Takarítás: ha a komponens eltűnik, a figyelés is véget ér.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  // Minden hook után: ha nincs kártya, csak egy üzenet jelenik meg.
  if (cards.length === 0) {
    return <p className="empty">Ez a pakli még üres. Írd meg az első kártyáját lent!</p>
  }

  const card = cards[index]
  const mark = marks[card.id] // 'known', 'learning' vagy undefined
  // Nem állapot: minden rajzoláskor a propokból számoljuk.
  const known = cards.filter((c) => marks[c.id] === 'known').length

  function answer(value) {
    onMark(card.id, value)
    // Továbblépünk, ha van még kártya.
    if (index < cards.length - 1) setIndex(index + 1)
  }

  return (
    <section className="study">
      <ProgressBar known={known} total={cards.length} />
      <p className="study__counter">
        <span>
          {index + 1}. kártya / {cards.length}
        </span>
        {mark && <span className={`badge badge--${mark}`}>{mark === 'known' ? 'Tudom' : 'Tanulom'}</span>}
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__answer">
        <button type="button" onClick={() => answer('learning')}>
          Még nem
        </button>
        <button type="button" className="button--primary" onClick={() => answer('known')}>
          Tudom
        </button>
      </div>
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Előző
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
          Következő →
        </button>
      </div>
    </section>
  )
}

export default Study
```

- A `marks[card.id]` az aktuális kártya jelölése. Ha még nem jelölted, `undefined`, és a `{mark && …}` (az 1. lecke
  űrlapjából ismert [[feltételes megjelenítés]]) semmit sem rajzol ki. Ha van, egy kis címke mutatja: a
  `badge--known` zöld, a `badge--learning` narancs.
- A `filter` csak azokat a kártyákat tartja meg, amelyekre a függvénye `true`-t mond, itt a tudottakat; a `length`
  megszámolja őket.
- Az `answer` jelöl, és továbblép. Az utolsó kártyánál nincs hová, ott marad.

Az `App` tárolja a jelöléseket. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=16,34-36,43
import { useState } from 'react'
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React-alapok', cards: REACT_CARDS },
  { id: 'space', name: 'Űrkvíz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useState(START_DECKS)
  const [activeId, setActiveId] = useState(START_DECKS[0].id)
  const [marks, setMarks] = useState({})
  const deck = decks.find((d) => d.id === activeId)

  function createDeck(name) {
    const newDeck = { id: crypto.randomUUID(), name, cards: [] }
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  // Az aktív pakli kártyáit cseréli le; a többi pakli változatlan marad.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer }])
  }

  function markCard(cardId, value) {
    setMarks({ ...marks, [cardId]: value })
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={decks} activeId={activeId} onSelect={setActiveId} onCreate={createDeck} />
      {/* A key miatt pakliváltáskor új Study születik, és az első kártyával kezd. */}
      <Study key={deck.id} cards={deck.cards} marks={marks} onMark={markCard} />
      <CardForm onAdd={addCard} />
    </main>
  )
}

export default App
```

A `{ ...marks, [cardId]: value }` a 3. leckéből ismert: lemásolja a régi objektumot, és felülír (vagy hozzáad) egy
kulcsot. A szögletes zárójel azt jelenti: „az a kulcs, amelyiknek a neve a `cardId` változóban van”.

:::check Ellenőrizd
A kártya fölött egy üres sáv: „Tudod: 0 / 8”, „0%”. Kattints a „Tudom” gombra: jön a következő kártya, a sáv pedig
megnő („Tudod: 1 / 8”, „13%”). Lapozz vissza: a számláló mellett zöld „Tudom” címke. A „Még nem” narancs „Tanulom”
címkét ad. Ha meggondolod magad, jelöld újra: az utolsó jelölés számít. Válts paklit és vissza: a jelölések
megmaradnak.
:::

:::mistake Gyakori hiba
`style="width: 50%"`, ahogy HTML-ben szokás. Reactben a `style` objektumot vár, és szövegre hibát ad: üres lesz az
oldal, a konzolban pedig „The `style` prop expects a mapping from style properties to values, not a string”. A helyes
alak: `style={{ width: '50%' }}`.
:::

:::try Feladat
Írd ki a haladásjelző alá azt is, hány kártyát jelöltél „Még nem”-mel. Elég egy újabb `filter` a `Study`-ban, és egy
új prop a `ProgressBar`-nak.
:::

### Keverés

Ha mindig ugyanabban a sorrendben jönnek a kártyák, egy idő után a sorrendet tanulod meg, nem a válaszokat. Kell egy
„Keverés” gomb. A 3. leckében már kevertél egy tömböt a [[Fisher–Yates-keverés]] módszerével: az
utolsó helytől halad az első felé, és minden elemet felcserél egy véletlenszerűen választottal a még össze nem kevert
részből. Most egyetlen különbség van: a pakli kártyái állapotban vannak, amit nem szabad módosítani. Ezért a függvény
előbb lemásolja a tömböt, és a másolatot keveri meg. Hozd létre az `src/shuffle.js` fájlt:

```js file=src/shuffle.js
// Fisher–Yates-keverés egy másolaton: az eredeti tömb (az állapot!) érintetlen marad.
export function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}
```

A keverés a pakli sorrendjét változtatja meg, ezért az `App`-ban történik, a már meglévő `setActiveCards`-szal. Az
`src/App.jsx`-ben három dolog változik: egy új import, egy új függvény és egy új prop. A `…` kezdetű megjegyzések
helyén minden marad, ahogy volt.

```jsx file=src/App.jsx mark=1,4-6,11
import { shuffle } from './shuffle.js'
// … a többi import, a START_DECKS és az App eleje, mint eddig

  function shuffleDeck() {
    setActiveCards(shuffle(deck.cards))
  }

  return (
    <main className="app">
      {/* … a cím és a DeckPicker, mint eddig … */}
      <Study key={deck.id} cards={deck.cards} marks={marks} onMark={markCard} onShuffle={shuffleDeck} />
      <CardForm onAdd={addCard} />
    </main>
  )
}
```

A `Study`-ban egy gomb indítja a keverést, és utána az első kártyára állunk, hiszen a régi index egy másik kártyára
mutatna. Itt a teljes `src/components/Study.jsx`:

```jsx file=src/components/Study.jsx mark=5,39-42,70-74
import { useEffect, useState } from 'react'
import Flashcard from './Flashcard.jsx'
import ProgressBar from './ProgressBar.jsx'

function Study({ cards, marks, onMark, onShuffle }) {
  const [index, setIndex] = useState(0)

  // Billentyűparancsok: a ← és a → lapoz.
  useEffect(() => {
    // Üres pakliban nincs mit lapozni.
    if (cards.length === 0) return
    function onKeyDown(event) {
      // Gépelés közben a nyilak a szövegmezőé.
      if (event.target.matches('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Takarítás: ha a komponens eltűnik, a figyelés is véget ér.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  // Minden hook után: ha nincs kártya, csak egy üzenet jelenik meg.
  if (cards.length === 0) {
    return <p className="empty">Ez a pakli még üres. Írd meg az első kártyáját lent!</p>
  }

  const card = cards[index]
  const mark = marks[card.id] // 'known', 'learning' vagy undefined
  // Nem állapot: minden rajzoláskor a propokból számoljuk.
  const known = cards.filter((c) => marks[c.id] === 'known').length

  function answer(value) {
    onMark(card.id, value)
    // Továbblépünk, ha van még kártya.
    if (index < cards.length - 1) setIndex(index + 1)
  }

  function shuffleCards() {
    onShuffle()
    setIndex(0)
  }

  return (
    <section className="study">
      <ProgressBar known={known} total={cards.length} />
      <p className="study__counter">
        <span>
          {index + 1}. kártya / {cards.length}
        </span>
        {mark && <span className={`badge badge--${mark}`}>{mark === 'known' ? 'Tudom' : 'Tanulom'}</span>}
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__answer">
        <button type="button" onClick={() => answer('learning')}>
          Még nem
        </button>
        <button type="button" className="button--primary" onClick={() => answer('known')}>
          Tudom
        </button>
      </div>
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Előző
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
          Következő →
        </button>
      </div>
      <div className="study__tools">
        <button type="button" onClick={shuffleCards}>
          Keverés
        </button>
      </div>
    </section>
  )
}

export default Study
```

:::check Ellenőrizd
Kattints a „Keverés” gombra: a számláló visszaugrik „1. kártya / 8”-ra, és (szinte mindig) egy másik kártya áll
elöl. Lapozz végig: más a sorrend, de minden kártya megvan, és a „Tudom” címkék a kártyáikkal együtt költöztek. Keverj
még párszor: mindig más sorrendet kapsz.
:::

:::mistake Gyakori hiba
`shuffle(deck.cards)`, majd `setActiveCards(deck.cards)`. A sorrend nem változik, csak visszaugrasz az első kártyára:
a `shuffle` nem nyúl az eredeti tömbhöz, hanem egy új, megkevert tömböt **ad vissza**. Az eredményét kell továbbadni:
`setActiveCards(shuffle(deck.cards))`.
:::

:::try Feladat
Csinálj egy „Fordított sorrend” gombot is. Vigyázz: a tömbök `reverse()` függvénye nem másolatot ad, hanem helyben
fordítja meg a tömböt, ezért előbb másolj: `[...deck.cards].reverse()`.
:::

### Mentés: useLocalStorage

Töltsd újra az oldalt: eltűnt a saját paklid, a jelölések és a keverés is. Az állapot csak addig él, amíg az oldal
nyitva van. A 2. leckében a választott témát a böngésző [[localStorage]] nevű tárolójába mentetted, és a `useDarkMode`
hook gondoskodott róla: induláskor beolvasta, és minden változáskor elmentette. Most háromféle adatot kell így kezelnünk
(a paklikat, a kiválasztott pakli azonosítóját és a jelöléseket), ezért egy általános [[saját hookot|saját hook]] írunk,
ami bármit el tud menteni: a `useLocalStorage`-et. Pont úgy használjuk majd, mint a `useState`-et, csak egy kulcsot is
kap: ezen a néven menti el az értéket.

A `localStorage` csak szöveget tud tárolni, mi viszont tömböket és objektumokat mentenénk. Az átalakítást a [[JSON]]
végzi: ez egy szöveges formátum, ami úgy néz ki, mint a JavaScript tömbjei és objektumai. A `JSON.stringify(érték)`
szöveggé alakít egy értéket, a `JSON.parse(szöveg)` pedig visszaalakítja. Hozd létre az `src/useLocalStorage.js`
fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Beolvassa a mentett értéket. Ha nincs mentés, vagy nem olvasható, a kezdőértéket adja.
function readSaved(key, startValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Letiltott tároló vagy elrontott mentés: a kezdőértékkel indulunk.
  }
  return startValue
}

// Úgy működik, mint a useState, de az érték túléli az újratöltést.
function useLocalStorage(key, startValue) {
  const [value, setValue] = useState(() => readSaved(key, startValue))

  // Minden változást elmentünk, szövegként.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Tele van a tároló, vagy le van tiltva: az app a memóriában tovább működik.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

Minden darabját ismered a 2. leckéből, csak általánosabb lett:

- A `useState` [[lusta kezdőértéket|lusta kezdőérték]] kap, `() => readSaved(key, startValue)`: a tárolót csak egyszer,
  az első rajzoláskor olvassuk be. Ha nincs mentés (`null`), a `startValue`-val indulunk.
- A `try … catch` most két bajtól is véd: a letiltott tárolótól és az elrontott mentéstől, ami miatt a `JSON.parse`
  hibát dobna.
- Az effekt minden változás után elmenti az értéket. A függőségi tömbben ott a `key` is, mert az effekt azt is
  használja.
- A hook pontosan azt adja vissza, amit a `useState`: egy kételemű tömböt az értékkel és a beállító függvénnyel. Ezért
  lehet ugyanúgy kibontani: `const [decks, setDecks] = useLocalStorage(…)`.

Az `App`-ban mindhárom `useState` helyére `useLocalStorage` kerül, egy-egy kulccsal. A `useState`-re itt már nincs
szükség, az importja kimaradhat. Itt a teljes `src/App.jsx`, ahogy a középszint végén kinéz:

```jsx file=src/App.jsx mark=2,15-17,19-20,48
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import useLocalStorage from './useLocalStorage.js'
import { shuffle } from './shuffle.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React-alapok', cards: REACT_CARDS },
  { id: 'space', name: 'Űrkvíz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useLocalStorage('flashcards-decks', START_DECKS)
  const [activeId, setActiveId] = useLocalStorage('flashcards-active', START_DECKS[0].id)
  const [marks, setMarks] = useLocalStorage('flashcards-marks', {})

  // Ha a mentett azonosítójú pakli valamiért nincs meg, az elsőt mutatjuk.
  const deck = decks.find((d) => d.id === activeId) || decks[0]

  function createDeck(name) {
    const newDeck = { id: crypto.randomUUID(), name, cards: [] }
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  // Az aktív pakli kártyáit cseréli le; a többi pakli változatlan marad.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer }])
  }

  function shuffleDeck() {
    setActiveCards(shuffle(deck.cards))
  }

  function markCard(cardId, value) {
    setMarks({ ...marks, [cardId]: value })
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={decks} activeId={deck.id} onSelect={setActiveId} onCreate={createDeck} />
      {/* A key miatt pakliváltáskor új Study születik, és az első kártyával kezd. */}
      <Study key={deck.id} cards={deck.cards} marks={marks} onMark={markCard} onShuffle={shuffleDeck} />
      <CardForm onAdd={addCard} />
    </main>
  )
}

export default App
```

A `|| decks[0]` óvatosság: ha a mentett azonosító egy olyan paklira mutat, ami nincs meg (például mert valaki kézzel
belenyúlt a tárolóba), a `find` `undefined`-ot adna, és az oldal összeomlana. A `||` ilyenkor az első paklit adja. Ezért
kapja a `DeckPicker` is a `deck.id`-t: azt a paklit jelölje, amit tényleg látsz.

:::check Ellenőrizd
Hozz létre egy paklit egy kártyával, jelölj meg néhány React-kártyát, keverd meg az Űrkvízt, aztán töltsd újra az oldalt
(++F5++): minden ott van, ahol hagytad, és ugyanaz a pakli van kiválasztva. A fejlesztői eszközök Application →
Local storage → `http://localhost:5173` részén ott a három kulcs (`flashcards-decks`, `flashcards-active`,
`flashcards-marks`), és látod, hogyan néznek ki szövegként. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
`localStorage.setItem(key, value)`, `JSON.stringify` nélkül. A tároló ilyenkor maga alakítja szöveggé a tömböt, és
`'[object Object],[object Object]'` lesz belőle. Újratöltéskor a `JSON.parse` ezen elhasal, a `catch` a kezdőértéket
adja, és minden saját paklid eltűnik.
:::

:::concept Tiszta lappal
Ha elölről kezdenéd, töröld a mentést: az Application panelen jobb klikk a `http://localhost:5173` sorra → Clear, vagy a
konzolban `localStorage.clear()`, aztán töltsd újra az oldalt. Ugyanez segít, ha egy félresikerült kísérlet után
furcsán viselkedik az app.
:::

## Haladó szint {level=3}

### A nehezebb kártyák gyakrabban jönnek

Ha egy kártyát már ötödször tudsz hibátlanul, kár minden körben elővenni; ha egy másikat mindig elrontod, azt kellene
gyakrabban látnod. Ez a [[térközös ismétlés]] (angolul spaced repetition) ötlete: amit már tudsz, egyre ritkábban
kerül elő. A legegyszerűbb változata a [[Leitner-rendszer]], amelyet papírkártyákkal is lehet használni:

- Van három doboz. Minden új kártya az 1. dobozban kezd.
- Ha tudtad a választ, a kártya egy dobozzal tovább lép (legfeljebb a 3.-ig). Ha nem tudtad, visszakerül az 1.-be.
- Az 1. doboz kártyái minden körben előjönnek, a 2. dobozéi minden második körben, a 3. dobozéi csak minden
  negyedikben.

A program minden kártyáról két számot jegyez meg: melyik dobozban van (`box`), és hányadik körben kerül újra sorra
(`due`). Egy kártya akkor jön elő, ha a `due` legfeljebb annyi, ahányadik körnél tartunk. Ez a logika semmit sem tud a
Reactről, ezért külön fájlba kerül. Hozd létre az `src/leitner.js` fájlt:

```js file=src/leitner.js
// Dobozonként: hány körönként kerül sorra egy kártya.
const INTERVALS = { 1: 1, 2: 2, 3: 4 }

// Egy új kártya az 1. dobozban kezd, és rögtön sorra kerül.
const NEW_CARD = { box: 1, due: 0 }

// Hol tart a kártya? Ha még sosem válaszoltál rá, új kártya.
export function getEntry(progress, cardId) {
  return progress[cardId] || NEW_CARD
}

// Sorra kerül ebben a körben?
export function isDue(entry, round) {
  return entry.due <= round
}

// Tudtad: egy dobozzal tovább lép. Nem tudtad: vissza az 1. dobozba.
export function nextEntry(entry, round, knew) {
  const box = knew ? Math.min(entry.box + 1, 3) : 1
  return { box, due: round + INTERVALS[box] }
}
```

Egy példa: az 5. körben tudtad egy 2. dobozos kártya válaszát. A kártya a 3. dobozba kerül, és a `due` értéke
`5 + 4 = 9` lesz: a 9. körben látod újra. Ha nem tudtad volna, az 1. dobozba kerülne, `due: 6`-tal, vagyis rögtön a
következő körben visszajönne. Mivel a `due` mindig nagyobb lesz a mostani körnél, a megválaszolt kártya ebben a körben
már nem jön elő.

A `Study` mostantól nem a teljes paklit mutatja, hanem csak azokat a kártyákat, amelyek ebben a körben esedékesek. Ez a
`queue` (sor), egy újabb származtatott érték. Ha elfogy, véget ér a kör, és egy összegzés jelenik meg a „Következő
kör” gombbal. Itt a teljes új `src/components/Study.jsx`:

```jsx file=src/components/Study.jsx mark=2,6,9-10,14,18,23,29-30,37-40,42-56,58-59,61-66,73,75,79,82,90
import { useEffect, useState } from 'react'
import { getEntry, isDue } from '../leitner.js'
import Flashcard from './Flashcard.jsx'
import ProgressBar from './ProgressBar.jsx'

function Study({ cards, progress, round, onAnswer, onNextRound, onShuffle }) {
  const [index, setIndex] = useState(0)

  // Ebben a körben csak az esedékes kártyák jönnek, a pakli sorrendjében.
  const queue = cards.filter((card) => isDue(getEntry(progress, card.id), round))

  // Billentyűparancsok: a ← és a → lapoz.
  useEffect(() => {
    if (queue.length === 0) return
    function onKeyDown(event) {
      // Gépelés közben a nyilak a szövegmezőé.
      if (event.target.matches('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, queue.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [queue.length])

  if (cards.length === 0) {
    return <p className="empty">Ez a pakli még üres. Írd meg az első kártyáját lent!</p>
  }

  // Azt a kártyát tudod, amelyik már legalább egyszer továbbjutott az 1. dobozból.
  const known = cards.filter((card) => getEntry(progress, card.id).box > 1).length

  function shuffleCards() {
    onShuffle()
    setIndex(0)
  }

  function nextRound() {
    onNextRound()
    setIndex(0)
  }

  // Elfogytak a kör kártyái: összegzés.
  if (queue.length === 0) {
    return (
      <section className="study">
        <ProgressBar known={known} total={cards.length} />
        <div className="summary" role="status">
          <h2>Kör vége</h2>
          <p>Ebben a körben nincs több kártya. Amit nem tudtál, a következő körben visszajön, amit tudtál, csak később.</p>
          <button type="button" className="button--primary" onClick={nextRound}>
            Következő kör
          </button>
        </div>
      </section>
    )
  }

  const card = queue[index]
  const entry = getEntry(progress, card.id)

  function answer(knew) {
    onAnswer(card.id, knew)
    // A megválaszolt kártya kikerül a körből, a helyére a következő csúszik.
    // Ha az utolsó volt, eggyel visszalépünk.
    setIndex(Math.max(Math.min(index, queue.length - 2), 0))
  }

  return (
    <section className="study">
      <ProgressBar known={known} total={cards.length} />
      <p className="study__counter">
        <span>
          {round}. kör · {index + 1}. kártya / {queue.length}
        </span>
        <span className="badge badge--box">{entry.box}. doboz</span>
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__answer">
        <button type="button" onClick={() => answer(false)}>
          Még nem
        </button>
        <button type="button" className="button--primary" onClick={() => answer(true)}>
          Tudom
        </button>
      </div>
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Előző
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === queue.length - 1}>
          Következő →
        </button>
      </div>
      <div className="study__tools">
        <button type="button" onClick={shuffleCards}>
          Keverés
        </button>
      </div>
    </section>
  )
}

export default Study
```

- A `queue` a pakli kártyái közül csak az esedékeseket tartja meg. Minden rajzoláskor újra kiszámoljuk, így ha egy
  kártyára válaszolsz, magától kiesik belőle.
- Az index mostantól a `queue`-ban lépked, nem a teljes pakliban, és a billentyűk is ehhez igazodnak.
- Az `answer` most nem lép tovább, mert a megválaszolt kártya kikerül a sorból, és a helyére magától becsúszik a
  következő. Ha viszont a sor utolsó kártyájára válaszoltál, az index kilógna a rövidebb sorból: a
  `Math.min(index, queue.length - 2)` ilyenkor eggyel visszalép (a `queue.length - 2` a rövidebb sor utolsó helye), a
  `Math.max(…, 0)` pedig nem engedi 0 alá.
- A gombok már nem szöveget adnak az `answer`-nek, hanem `true`-t vagy `false`-t: tudtad-e.

Az `App`-ban a jelölések (`marks`) helyére két új mentett érték kerül: a `progress` (a kártyák dobozai és esedékességei,
kártyaazonosító szerint) és a `round` (hányadik körnél tartunk). Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=4,18-19,43-45,52-60
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import useLocalStorage from './useLocalStorage.js'
import { shuffle } from './shuffle.js'
import { getEntry, nextEntry } from './leitner.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React-alapok', cards: REACT_CARDS },
  { id: 'space', name: 'Űrkvíz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useLocalStorage('flashcards-decks', START_DECKS)
  const [activeId, setActiveId] = useLocalStorage('flashcards-active', START_DECKS[0].id)
  const [progress, setProgress] = useLocalStorage('flashcards-progress', {})
  const [round, setRound] = useLocalStorage('flashcards-round', 1)

  // Ha a mentett azonosítójú pakli valamiért nincs meg, az elsőt mutatjuk.
  const deck = decks.find((d) => d.id === activeId) || decks[0]

  function createDeck(name) {
    const newDeck = { id: crypto.randomUUID(), name, cards: [] }
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  // Az aktív pakli kártyáit cseréli le; a többi pakli változatlan marad.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer }])
  }

  function shuffleDeck() {
    setActiveCards(shuffle(deck.cards))
  }

  function answerCard(cardId, knew) {
    setProgress({ ...progress, [cardId]: nextEntry(getEntry(progress, cardId), round, knew) })
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={decks} activeId={deck.id} onSelect={setActiveId} onCreate={createDeck} />
      {/* A key miatt pakliváltáskor új Study születik, és az első kártyával kezd. */}
      <Study
        key={deck.id}
        cards={deck.cards}
        progress={progress}
        round={round}
        onAnswer={answerCard}
        onNextRound={() => setRound(round + 1)}
        onShuffle={shuffleDeck}
      />
      <CardForm onAdd={addCard} />
    </main>
  )
}

export default App
```

A `round` közös az összes paklinak: úgy működik, mint egy naptár, amelyben a kör egy napnak felel meg. A régi
`flashcards-marks` kulcsot már semmi sem használja; az Application panelen törölheted.

:::check Ellenőrizd
Válaszd a React-alapokat. A számláló „1. kör · 1. kártya / 8”, mellette „1. doboz”. Az első kártyára mondd, hogy „Még
nem”, a többi hétre, hogy „Tudom”. Jön a „Kör vége”, a sáv „Tudod: 7 / 8”. Kattints a „Következő kör” gombra: a 2.
körben csak egyetlen kártya jön, az, amelyiket nem tudtad. Mondd rá, hogy „Tudom”, és kezdd el a 3. kört: most a másik
hét kártya jön vissza, mind a „2. doboz” címkével.
:::

:::mistake Gyakori hiba
Ha az `answer`-ben megmarad a középszint továbblépése (`setIndex(index + 1)`), minden válasz után kimarad egy kártya: a
megválaszolt kártya kiesik a sorból, és a helyére csúszó következőt is átugrod. A negyedik válasz után pedig az index
kicsúszik a megrövidült sorból, a `card` `undefined` lesz, és az oldal összeomlik.
:::

:::concept Körök helyett napok
Az igazi tanulóappok (a legismertebb az Anki) nem körökben, hanem napokban számolnak: ami ma a 3. dobozba került, azt
egy hét múlva kérdezik újra. A mi `round` számunk ugyanezt a szerepet játssza, csak nem kell napokat várnod, hogy
kipróbáld. Ha kedved van, írd át: a `due` legyen egy dátum, és a `Date.now()`-val (a mostani időpont,
ezredmásodpercben) hasonlítsd össze.
:::

:::try Feladat
Legyen négy doboz: a `nextEntry`-ben írd át a `3`-at `4`-re, és adj egy negyedik elemet az `INTERVALS`-hoz, például
`4: 8`. Egy kártya így csak a harmadik egymás utáni helyes válasz után kerül a nyolckörös, 4. dobozba.
:::

### Képek a kártyán

Néha egy kép maga a kérdés: egy zászló, egy madár, egy festmény. Legyen a kártyák elején egy nem kötelező kép, amit a
saját gépedről választasz ki.

Egy `<input type="file">` [[fájlmező]] megnyitja a gép fájlválasztóját. Amikor választottál, az `onChange` eseményben az
`event.target.files` egy lista a kiválasztott fájlokról, az első a `files[0]`. Ez egy [[File]] objektum: a fájl neve,
mérete és tartalma. A fájlmezőt nem lehet állapotból vezérelni, mint a szövegmezőket: biztonsági okból egy oldal nem
írhat bele fájlnevet, csak olvashatja, amit a felhasználó választott.

Hová tegyük a képet? A paklik a `localStorage`-ban vannak, ami csak szöveget tárol, oldalanként nagyjából 5 MB-ot. Egy
telefonfotó ennek a fele is lehet. Ezért a képet előbb lekicsinyítjük, aztán szöveggé alakítjuk:

1. A [[createImageBitmap]] beolvassa a fájlt, és kirajzolható képet csinál belőle. Ez időbe telik, ezért egy
   [[Promise]]-t ad, amit `await`-tel várunk meg, ahogy a 3. leckében a vágólapot.
2. Egy [[canvas]] (vászon) egy rajzlap, amire JavaScriptből lehet rajzolni; az 5. leckében az emojis logót rajzoltad
   egy ilyenre. Akkorát csinálunk, hogy a kép hosszabbik oldala legfeljebb 480 pixel legyen, és ráfestjük a képet.
3. A `canvas.toDataURL('image/jpeg', 0.8)` (ugyanaz a függvény, ami az 5. leckében a logós PNG-t készítette) a vászon
   tartalmából egy [[data URL]]-t készít: egy hosszú szöveget, ami `data:image/jpeg;base64,` kezdetű, és benne van az
   egész kép. Egy `<img src={…}>` ugyanúgy megjeleníti, mintha egy képfájl címe volna, és szövegként a `localStorage`-ba
   is befér. A `0.8` a JPEG minősége (0 és 1 között): így egy kép nagyjából 20–60 kB.

Hozd létre az `src/images.js` fájlt:

```js file=src/images.js
// A kép hosszabbik oldala legfeljebb ennyi pixel lesz.
const MAX_SIZE = 480

// Lekicsinyíti a képet, és szövegként (data URL-ként) adja vissza, hogy elférjen a localStorage-ban.
export async function readImage(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  // Fehér alap: a JPEG nem ismeri az átlátszóságot.
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.8)
}
```

Az 5. leckében a vásznat a qrcode könyvtár készítette el neked; itt a `document.createElement('canvas')` csinál egy
üreset, ahogy az 5. leckében a letöltőlinket is így hoztad létre. Ez a vászon sosem kerül az oldalra: csak rajzolunk
rá, aztán kiolvassuk belőle a képet.

A `scale` a kicsinyítés aránya: egy 1200 pixel széles képnél `480 / 1200 = 0.4`. A `Math.min(1, …)` miatt a kisebb
képeket nem nagyítjuk fel. A `getContext('2d')` adja a vászon rajzeszközeit: a `fillRect` kitölt egy téglalapot, a
`drawImage` ráfesti a képet a megadott méretben.

Az űrlap kap egy fájlmezőt, egy előnézetet és egy hibaüzenetet arra az esetre, ha a fájl nem kép. Itt a teljes
`src/components/CardForm.jsx`:

```jsx file=src/components/CardForm.jsx mark=2,7-8,10-20,26,29-32,46-51
import { useState } from 'react'
import { readImage } from '../images.js'

function CardForm({ onAdd }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')

  async function chooseImage(event) {
    const file = event.target.files[0]
    if (!file) return
    try {
      setImage(await readImage(file))
      setError('')
    } catch {
      setImage('')
      setError('Ezt a fájlt nem sikerült képként beolvasni.')
    }
  }

  function submit(event) {
    event.preventDefault()
    // Üres (vagy csak szóközökből álló) kérdést vagy választ nem mentünk.
    if (question.trim() === '' || answer.trim() === '') return
    onAdd(question.trim(), answer.trim(), image)
    setQuestion('')
    setAnswer('')
    setImage('')
    setError('')
    // A fájlmezőt nem lehet állapotból üríteni: ezt az űrlap reset() függvénye teszi meg.
    event.target.reset()
  }

  return (
    <form className="card-form" onSubmit={submit}>
      <h2>Új kártya ebbe a pakliba</h2>
      <label>
        Kérdés
        <textarea rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} />
      </label>
      <label>
        Válasz
        <textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} />
      </label>
      <label>
        Kép a kérdéshez (nem kötelező)
        <input type="file" accept="image/*" onChange={chooseImage} />
      </label>
      {image && <img className="card-form__preview" src={image} alt="Az új kártya képe" />}
      {error && <p className="message message--error">{error}</p>}
      <button type="submit" className="button--primary">
        Kártya hozzáadása
      </button>
    </form>
  )
}

export default CardForm
```

- Az `accept="image/*"` azt kéri a fájlválasztótól, hogy csak képeket kínáljon fel.
- A `chooseImage` egy [[async függvény]]: megvárja a kicsinyítést, aztán eltárolja az eredményt. Ha a fájl nem
  olvasható képként, a `readImage` hibát dob, és a `catch` kiírja az üzenetet.
- Beküldéskor az `event.target` maga az űrlap, a `reset()` pedig visszaállítja az összes mezőjét, a fájlmezőt is. A
  `setError('')` egy korábbi hibaüzenetet is eltüntet.

A képet az `App` teszi a kártyára: az `src/App.jsx`-ben az `addCard` egy harmadik paramétert kap. Csak ez a függvény
változik:

```jsx file=src/App.jsx mark=1-2
  function addCard(question, answer, image) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer, image }])
  }
```

Végül a kártya eleje kirajzolja a képet, ha van. Itt a teljes `src/components/Flashcard.jsx`:

```jsx file=src/components/Flashcard.jsx mark=16
import { useState } from 'react'
import './Flashcard.css'

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className={flipped ? 'card is-flipped' : 'card'}
      onClick={() => setFlipped(!flipped)}
    >
      <span className="card__inner">
        <span className="card__face card__front" aria-hidden={flipped}>
          <span className="card__label">Kérdés</span>
          {card.image && <img className="card__image" src={card.image} alt="" />}
          <span className="card__text">{card.question}</span>
          <span className="card__hint">Kattints a megfordításhoz</span>
        </span>
        <span className="card__face card__back" aria-hidden={!flipped}>
          <span className="card__label">Válasz</span>
          <span className="card__text">{card.answer}</span>
        </span>
      </span>
    </button>
  )
}

export default Flashcard
```

A régebbi kártyáknak nincs `image` mezőjük; a `card.image` náluk `undefined`, és a `&&` miatt semmi sem jelenik meg. Az
`alt=""` (üres alternatív szöveg) azt jelzi, hogy a kép csak kiegészíti a kérdést, és a képernyőolvasó kihagyhatja: a
kérdés szövege elmondja, mit kell felelni.

:::check Ellenőrizd
Hozz létre egy „Zászlók” paklit, írj egy kérdést („Melyik ország zászlója ez?”) és egy választ, a „Kép a kérdéshez”
mezőben pedig válassz egy képet a gépedről: az űrlapban rögtön megjelenik az előnézete. A „Kártya hozzáadása” után a
kártya elején, a kérdés fölött ott a kép, a fájlmező pedig újra üres. Töltsd újra az oldalt: a kép megmaradt. Ha egy
nem képfájlt választasz (például egy PDF-et a „Minden fájl” beállítással), piros hibaüzenet jelenik meg.
:::

:::mistake Gyakori hiba
A képet kicsinyítés nélkül menteni, például egy `FileReader`-rel a teljes fájlt data URL-lé alakítva. Két-három
telefonfotó után megtelik a `localStorage`, a `useLocalStorage` `catch` ága csendben lenyeli a hibát, és újratöltéskor
az utolsó változások eltűnnek. A konzolban ilyenkor nincs hibaüzenet. Ha egy kép „elveszik”, írd be a konzolba:
`localStorage.getItem('flashcards-decks').length`. Ha ez 5 millió karakter körül jár, megtelt a tároló.
:::

:::try Feladat
Az `alt=""` csak akkor jó, ha a kép tényleg csak díszít. Ha egy kártyán maga a kép a kérdés („Mi ez a madár?”), a
képernyőolvasót használóknak le kell írni, mi van rajta. Adj az űrlaphoz egy „A kép leírása” mezőt, mentsd el a kártyán
`imageAlt` néven, és a `Flashcard` az `alt={card.imageAlt || ''}` attribútummal adja tovább (a leírás nélküli régebbi
kártyáknál így marad az üres `alt`).
:::

### Letöltés és betöltés

A paklijaid most csak ebben a böngészőben élnek. Ha gépet váltasz, vagy törlöd a böngésző adatait, elvesznek. Mentsük
el őket egy fájlba, és legyen mód vissza is tölteni őket. A formátum adja magát: [[JSON]], ugyanaz a szöveg, ami a
`localStorage`-ba is kerül.

**Letöltés.** Az 5. leckében a QR-kódot SVG-fájlként töltötted le a `downloadFile` függvénnyel. A paklit pontosan
ugyanígy töltjük le, csak a fájlban JSON-szöveg van. Emlékeztetőül a három összetevő:

1. Egy [[Blob]]: a böngésző memóriájában tárolt fájltartalom, itt a JSON-szöveg, `application/json` típussal.
2. Egy [[objektum-URL]]: a `URL.createObjectURL(blob)` ideiglenes címet ad a Blobnak, `blob:http://localhost:5173/…`
   formában.
3. Egy link `download` attribútummal: erre kattintva a böngésző nem megnyitja a címet, hanem letölti, a megadott néven.
   A linket a kódban hozzuk létre, egy pillanatra betesszük az oldalba, rákattintunk a `link.click()`-kel, aztán
   kivesszük.

A végén a `URL.revokeObjectURL` felszabadítja az ideiglenes címet, ahogy az 5. leckében: egy másodpercet várunk vele,
hogy a letöltésnek legyen ideje elindulni.

**Betöltés.** A kiválasztott [[File]] szövegét a `file.text()` adja (ez is Promise), és a `JSON.parse` csinál belőle
újra objektumot. Csakhogy a felhasználó bármilyen fájlt kiválaszthat: egy másik program JSON-ját, egy kézzel elrontott
paklit, akármit. Mielőtt elhinnénk, hogy pakli, ellenőrizzük:

- A [[typeof]] megmondja egy érték típusát szövegként: `typeof 'alma'` értéke `'string'`, `typeof 42` értéke
  `'number'`.
- Az `Array.isArray(x)` megmondja, hogy az `x` tömb-e.
- Csak azokat a kártyákat tartjuk meg, amelyeknek szöveges kérdése és válasza van, és mindegyik új azonosítót kap,
  ahogy a pakli is. Így egy kétszer betöltött fájl sem ütközik a már meglévő kártyákkal.
- Képet csak `data:image/` kezdetűt fogadunk el. Egy idegen fájlban állhatna egy másik weboldal képének címe is, és
  akkor az a weboldal minden tanulásnál látná, hogy éppen nézed a kártyát.

Az ellenőrzést a következő lépésben a megosztott linkek is használják, ezért külön függvénybe kerül, `toDeck` néven, és
exportáljuk. Ha a fájl nem pakli, a `throw new Error(…)` hibát dob (ahogy a 2. lecke `useTheme`-je), és a hívó `catch`-e
kapja el. Hozd létre az `src/deckFiles.js` fájlt:

```js file=src/deckFiles.js
// A pakli letöltése JSON-fájlként.
export function downloadDeck(deck) {
  const json = JSON.stringify({ name: deck.name, cards: deck.cards }, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${deck.name}.json`
  // Egyes böngészők csak az oldalon lévő linkre indítják el a letöltést, ezért egy pillanatra betesszük.
  document.body.append(link)
  link.click()
  link.remove()
  // Az ideiglenes cím memóriát foglal: ha a letöltés elindult, felszabadítjuk.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Kívülről érkezett adatból (fájlból vagy linkből) pakli: ellenőrizzük, és friss azonosítókat kap.
export function toDeck(data) {
  if (!data || typeof data.name !== 'string' || !Array.isArray(data.cards)) {
    throw new Error('Ez nem egy pakli.')
  }
  const cards = data.cards
    .filter((card) => card && typeof card.question === 'string' && typeof card.answer === 'string')
    .map((card) => ({
      id: crypto.randomUUID(),
      question: card.question,
      answer: card.answer,
      // Csak a fájlba ágyazott képet fogadjuk el, más weboldalról betöltöttet nem.
      image: typeof card.image === 'string' && card.image.startsWith('data:image/') ? card.image : '',
    }))
  return { id: crypto.randomUUID(), name: data.name, cards }
}

// Beolvassa a kiválasztott fájlt, és paklit csinál belőle.
export async function readDeckFile(file) {
  const text = await file.text()
  return toDeck(JSON.parse(text))
}
```

A `JSON.stringify(…, null, 2)` harmadik paramétere a behúzás: így a fájl szépen tagolt, emberek is el tudják olvasni.
A `filter(…).map(…)` láncban a `map` már csak a jó kártyákat kapja meg. A `startsWith` megmondja, hogy egy szöveg az
adott szöveggel kezdődik-e. A `.map((card) => ({ … }))`-ben az objektum körüli kerek zárójel azért kell, mert nélküle a
nyílfüggvény a kapcsos zárójelet a saját testének hinné, nem egy objektumnak.

A gombok egy új komponensbe kerülnek. A betöltés gombja valójában egy `<label>`, benne egy elrejtett fájlmezővel: a
címkére kattintás megnyitja a fájlválasztót, és így a gomb pont úgy néz ki, mint a többi. A `visually-hidden` osztály
csak a szemek elől rejti el a mezőt; billentyűzettel továbbra is rá lehet lépni. Hozd létre az
`src/components/DeckTools.jsx` fájlt:

```jsx file=src/components/DeckTools.jsx
import { useState } from 'react'
import { downloadDeck, readDeckFile } from '../deckFiles.js'

function DeckTools({ deck, onImport }) {
  const [message, setMessage] = useState(null) // { text, error }

  async function importFile(event) {
    const file = event.target.files[0]
    // Kiürítjük a mezőt, így ugyanazt a fájlt később újra be lehet tölteni.
    event.target.value = ''
    if (!file) return
    try {
      const newDeck = await readDeckFile(file)
      onImport(newDeck)
      setMessage({ text: `Betöltve: ${newDeck.name} (${newDeck.cards.length} kártya)`, error: false })
    } catch {
      setMessage({ text: 'Ez a fájl nem egy pakli. Olyan JSON-fájlt válassz, amit ez az app mentett.', error: true })
    }
  }

  return (
    <section className="deck-tools">
      <h2>Mentés és megosztás</h2>
      <div className="deck-tools__buttons">
        <button type="button" onClick={() => downloadDeck(deck)}>
          Pakli letöltése
        </button>
        <label className="file-button">
          Pakli betöltése
          <input type="file" accept=".json,application/json" className="visually-hidden" onChange={importFile} />
        </label>
      </div>
      {message && (
        <p className={message.error ? 'message message--error' : 'message'} role="status">
          {message.text}
        </p>
      )}
    </section>
  )
}

export default DeckTools
```

Az üzenet egy objektum, a szövegével és azzal, hogy hiba-e: így egyetlen állapotban elfér mindkettő, és a hibák pirosak
lesznek. A `role="status"` miatt a képernyőolvasó felolvassa.

Az `App`-ban a betöltött pakli ugyanúgy kerül a többi közé, mint egy újonnan létrehozott, ezért a közös részt egy
`addDeck` függvénybe tesszük, és a `createDeck` is ezt hívja. Az `src/App.jsx` változásai (a `…` kezdetű megjegyzések
helyén minden marad):

```jsx file=src/App.jsx mark=1,4-8,10-12,19
import DeckTools from './components/DeckTools.jsx'
// … a többi import, a START_DECKS és az App eleje, mint eddig

  // Egy kész paklit (fájlból vagy linkről) hozzáad, és ki is választja.
  function addDeck(newDeck) {
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  function createDeck(name) {
    addDeck({ id: crypto.randomUUID(), name, cards: [] })
  }

  // … a setActiveCards, az addCard, a shuffleDeck és az answerCard, mint eddig

  return (
    <main className="app">
      {/* … a cím, a DeckPicker, a Study és a CardForm, mint eddig … */}
      <DeckTools deck={deck} onImport={addDeck} />
    </main>
  )
}
```

:::check Ellenőrizd
Az oldal alján egy „Mentés és megosztás” rész két gombbal. Válaszd a React-alapokat, és kattints a „Pakli letöltése”
gombra: a Letöltések mappádba kerül egy `React-alapok.json`; nyisd meg a szerkesztőben, és olvasd el. Most kattints a
„Pakli betöltése” gombra, és válaszd ki ezt a fájlt: megjelenik egy második „React-alapok 8” gomb, ki is van választva,
az oldal alján pedig ez áll: „Betöltve: React-alapok (8 kártya)”. Ha egy másik JSON-fájlt választasz, például a projekt
`package.json`-ját, piros üzenet jön.
:::

:::mistake Gyakori hiba
Kimarad az `event.target.value = ''`. Ekkor ugyanazt a fájlt másodszorra nem tudod betölteni: a mező értéke nem
változik, ezért a böngésző nem küld újabb `change` eseményt, és nem történik semmi.
:::

:::try Próbáld ki
Nyisd meg a letöltött JSON-t a szerkesztőben, írj bele kézzel egy új kártyát (vigyázz a vesszőkre és az
idézőjelekre), és mentsd el más néven. Töltsd be: ott az új kártya. Ha elrontottad a JSON-t, a piros üzenet szól.
:::

### Megosztható link

Egy fájlt el kell küldeni, le kell tölteni, be kell tölteni. Egyszerűbb lenne egy link: aki megnyitja, rögtön
megkapja a paklit. Szerver nélkül is megoldható, ahogy a 4. leckében a saját történetnél: maga a pakli utazik a
linkben, a cím `#` utáni részében. Ezt a részt (a [[hash|URL-hash]]) a böngésző sosem küldi el a szervernek.

A JSON-szövegben vannak olyan karakterek (szóköz, idézőjel, ékezetes betű), amelyek nem állhatnak egy címben. A 4.
leckéből ismert `encodeURIComponent` kódolja őket ([[URL-kódolás]]): a szóközből `%20` lesz, az `á`-ból `%C3%A1`, a
`decodeURIComponent` pedig visszaalakítja a szöveget. A képeket kihagyjuk: egyetlen kép is több tízezer karakterrel
nyújtaná meg a linket.

Ha a linkben pakli érkezik, az app előbb megkérdezi, kéred-e. Akár igent mondasz, akár nemet, utána kivesszük a paklit a
címből, hogy egy újratöltés ne kérdezze meg újra. Erre való a [[window.history.replaceState|history.replaceState]]:
kicseréli a címsorban álló címet, az oldal újratöltése nélkül, és az előzmények közé sem kerül új bejegyzés. Hozd létre
az `src/share.js` fájlt:

```js file=src/share.js
import { toDeck } from './deckFiles.js'

const PREFIX = '#deck='

// A pakli egy linkbe csomagolva. A képek kimaradnak: velük a link több tízezer karakter hosszú lenne.
export function makeShareLink(deck) {
  const data = {
    name: deck.name,
    cards: deck.cards.map((card) => ({ question: card.question, answer: card.answer })),
  }
  return window.location.origin + window.location.pathname + PREFIX + encodeURIComponent(JSON.stringify(data))
}

// A címben érkezett pakli, vagy null, ha nincs (vagy elromlott).
export function readSharedDeck() {
  const hash = window.location.hash
  if (!hash.startsWith(PREFIX)) return null
  try {
    return toDeck(JSON.parse(decodeURIComponent(hash.slice(PREFIX.length))))
  } catch {
    return null
  }
}

// Kiveszi a paklit a címből, hogy egy újratöltés ne kérdezzen rá újra.
export function clearSharedDeck() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}
```

A `window.location` az oldal címe darabokra szedve: az `origin` a `http://localhost:5173`, a `pathname` a `/`, a `hash`
a cím `#`-tel kezdődő vége (ezért kezdődik a `PREFIX` is `#`-tel), a `search` a `?`-lel kezdődő rész (most üres). A
`slice(PREFIX.length)` levágja a `#deck=` részt a hash elejéről. A `readSharedDeck` minden hibát elnyel, és `null`-t
ad: egy félig kimásolt vagy elrontott linktől így nem omlik össze az app, egyszerűen nem kínál fel semmit.

A paklit egy kis sáv kínálja fel az oldal tetején. Hozd létre az `src/components/SharedDeck.jsx` fájlt:

```jsx file=src/components/SharedDeck.jsx
function SharedDeck({ deck, onAccept, onDismiss }) {
  return (
    <section className="shared" aria-label="Megosztott pakli">
      <p>
        Valaki megosztott veled egy paklit: <strong>{deck.name}</strong> ({deck.cards.length} kártya).
      </p>
      <div className="shared__buttons">
        <button type="button" className="button--primary" onClick={onAccept}>
          Hozzáadom
        </button>
        <button type="button" onClick={onDismiss}>
          Nem kérem
        </button>
      </div>
    </section>
  )
}

export default SharedDeck
```

A `DeckTools` kap egy harmadik gombot. A link a 3. leckéből ismert vágólap-API-val kerül a vágólapra. Itt a teljes
`src/components/DeckTools.jsx`:

```jsx file=src/components/DeckTools.jsx mark=3,22-29,42-44
import { useState } from 'react'
import { downloadDeck, readDeckFile } from '../deckFiles.js'
import { makeShareLink } from '../share.js'

function DeckTools({ deck, onImport }) {
  const [message, setMessage] = useState(null) // { text, error }

  async function importFile(event) {
    const file = event.target.files[0]
    // Kiürítjük a mezőt, így ugyanazt a fájlt később újra be lehet tölteni.
    event.target.value = ''
    if (!file) return
    try {
      const newDeck = await readDeckFile(file)
      onImport(newDeck)
      setMessage({ text: `Betöltve: ${newDeck.name} (${newDeck.cards.length} kártya)`, error: false })
    } catch {
      setMessage({ text: 'Ez a fájl nem egy pakli. Olyan JSON-fájlt válassz, amit ez az app mentett.', error: true })
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(makeShareLink(deck))
      setMessage({ text: 'A link a vágólapon: küldd el annak, akivel megosztanád a paklit.', error: false })
    } catch {
      setMessage({ text: 'Nem sikerült a vágólapra másolni a linket.', error: true })
    }
  }

  return (
    <section className="deck-tools">
      <h2>Mentés és megosztás</h2>
      <div className="deck-tools__buttons">
        <button type="button" onClick={() => downloadDeck(deck)}>
          Pakli letöltése
        </button>
        <label className="file-button">
          Pakli betöltése
          <input type="file" accept=".json,application/json" className="visually-hidden" onChange={importFile} />
        </label>
        <button type="button" onClick={copyLink}>
          Link másolása
        </button>
      </div>
      {message && (
        <p className={message.error ? 'message message--error' : 'message'} role="status">
          {message.text}
        </p>
      )}
    </section>
  )
}

export default DeckTools
```

Az `App` induláskor megnézi, érkezett-e pakli a címben. A felkínált paklit nem kell elmenteni, hiszen a címből jön,
ezért ez egy közönséges `useState`, és a `useState` importja visszajön. Itt a teljes `src/App.jsx`, ahogy a lecke végén
kinéz:

```jsx file=src/App.jsx mark=1,6,11,24,56-65,70
import { useState } from 'react'
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import useLocalStorage from './useLocalStorage.js'
import { shuffle } from './shuffle.js'
import { getEntry, nextEntry } from './leitner.js'
import { clearSharedDeck, readSharedDeck } from './share.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import DeckTools from './components/DeckTools.jsx'
import SharedDeck from './components/SharedDeck.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React-alapok', cards: REACT_CARDS },
  { id: 'space', name: 'Űrkvíz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useLocalStorage('flashcards-decks', START_DECKS)
  const [activeId, setActiveId] = useLocalStorage('flashcards-active', START_DECKS[0].id)
  const [progress, setProgress] = useLocalStorage('flashcards-progress', {})
  const [round, setRound] = useLocalStorage('flashcards-round', 1)
  const [shared, setShared] = useState(readSharedDeck)

  // Ha a mentett azonosítójú pakli valamiért nincs meg, az elsőt mutatjuk.
  const deck = decks.find((d) => d.id === activeId) || decks[0]

  // Egy kész paklit (fájlból vagy linkről) hozzáad, és ki is választja.
  function addDeck(newDeck) {
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  function createDeck(name) {
    addDeck({ id: crypto.randomUUID(), name, cards: [] })
  }

  // Az aktív pakli kártyáit cseréli le; a többi pakli változatlan marad.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer, image) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer, image }])
  }

  function shuffleDeck() {
    setActiveCards(shuffle(deck.cards))
  }

  function answerCard(cardId, knew) {
    setProgress({ ...progress, [cardId]: nextEntry(getEntry(progress, cardId), round, knew) })
  }

  function acceptShared() {
    addDeck(shared)
    setShared(null)
    clearSharedDeck()
  }

  function dismissShared() {
    setShared(null)
    clearSharedDeck()
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      {shared && <SharedDeck deck={shared} onAccept={acceptShared} onDismiss={dismissShared} />}
      <DeckPicker decks={decks} activeId={deck.id} onSelect={setActiveId} onCreate={createDeck} />
      {/* A key miatt pakliváltáskor új Study születik, és az első kártyával kezd. */}
      <Study
        key={deck.id}
        cards={deck.cards}
        progress={progress}
        round={round}
        onAnswer={answerCard}
        onNextRound={() => setRound(round + 1)}
        onShuffle={shuffleDeck}
      />
      <CardForm onAdd={addCard} />
      <DeckTools deck={deck} onImport={addDeck} />
    </main>
  )
}

export default App
```

A `useState(readSharedDeck)` megint lusta kezdőérték: a címet csak egyszer, induláskor nézzük meg. Ha nincs benne pakli,
a `shared` `null`, és a sáv nem jelenik meg.

:::check Ellenőrizd
Válaszd az Űrkvízt, és kattints a „Link másolása” gombra: „A link a vágólapon”. Nyiss egy új böngészőlapot, illeszd be a
címsorba (++Ctrl++ + ++V++), és nyomj ++Enter++-t. Az oldal tetején egy türkiz keretes sáv: „Valaki megosztott veled
egy paklit: Űrkvíz (8 kártya)”. A „Hozzáadom” után megjelenik egy új „Űrkvíz 8” gomb, ki is van választva, a
címsorból pedig eltűnik a hosszú `#deck=…` rész. Gratulálok, elkészült a tanulókártyás appod: commitold!
:::

:::mistake Gyakori hiba
A linket ugyanabba a lapba illeszted be, ahol az app már nyitva van, és nem történik semmi. Ha egy címben csak a `#`
utáni rész változik, a böngésző nem tölti újra az oldalt, így a `readSharedDeck` sem fut le újra. Nyomj ++F5++-öt, vagy
nyisd meg a linket új lapon, ahogy a címzett is tenné.
:::

:::concept Mekkora lehet egy link?
A nyolckártyás Űrkvíz linkje nagyjából 1700 karakter. A böngészők ennél sokkal hosszabbat is elfogadnak, de egy
csevegőapp levághatja, és egy több száz kártyás pakli linkjét már senki sem szeretné bemásolni. Az igazi appok ezért a
paklit egy szerverre mentik, és csak egy rövid azonosítót tesznek a linkbe, például `…/deck/x7Kq2`. Ehhez szerver
kell; a későbbi, API-s leckékben megnézzük, hogyan beszél egy React-app egy szerverrel.
:::
