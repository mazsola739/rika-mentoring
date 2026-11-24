# Mit építünk?

Egy párkereső memóriajátékot. A kártyák képpel lefelé fekszenek, egyszerre kettőt fordíthatsz fel, és ha a két kép
egyforma, a pár nyitva marad. Ha nem, egy másodperc múlva mindkettő visszafordul, és jól meg kell jegyezned, mi hol
volt. Közben megtanulod, hogyan tart rendben a React egy összetettebb állapotot (a kártyák listáját és a kiválasztott
párt), hogyan késleltet valamit a `setTimeout`, hogyan keverünk meg egy paklit, és hogyan fordul meg egy kártya térben,
CSS-animációval.

:::levels
- Kártyák, amelyek kattintásra megfordulnak, párkeresés és egy „Nyertél!” üzenet. | kb. 2 óra
- Lépésszámláló, időmérő, térben forduló kártyák és három nehézségi szint. | kb. 3 óra
- Legjobb eredmények mentése, emojitémák, kétjátékos mód és billentyűvezérlés. | kb. 3 óra
:::

**Előismeret:** az előző leckék. Leginkább ezekre építünk: a 3. lecke (Fisher–Yates-keverés, `setTimeout`
takarítással), a 6. lecke (kártyafordítás CSS-sel, `useLocalStorage`), a 9. lecke (listák `key`-vel, tömbök az
állapotban) és a 12. lecke (`setInterval`). Ahol egy ismerős dolgot új módon használunk, ott újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/13-memory-game/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Az 1. lecke részletesen elmagyarázza, hogyan jutsz hozzá; itt
csak röviden. Nyiss egy terminált a munkamappádban, ahol a korábbi leckékből a `rika-mentoring` repó van, hozd le az új
leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját `memory-game` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/13-memory-game/exercise memory-game
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/13-memory-game/exercise` mappát a munkamappádba, `memory-game` néven. A másolatodban
dolgozol: a repó érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `memory-game` mappát a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér panelt látsz
„Memory Game” címmel. Más még nincs rajta: a játékot te építed fel.
:::

A szervert hagyd futni. Egy második terminálban, a `memory-game` mappában csinálj a másolatodból git-repót egyetlen
committal, a kezdőállapottal:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni.

A kiinduló projektben három fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: az oldal stílusai, készen (a fehér panel, a kártyák rácsa, a gombok, a „Nyertél!” sáv…). Ezeket nem
  kell megírnod, csak a lépésekben megadott osztályneveket (`game`, `board`, `win`, …) használod.
- `src/components/Card.css`: egy kártya kinézete. Az ezt használó `Card` komponenst te írod meg a következő lépésben. A
  középszinten pedig lecseréled ezt a fájlt egy olyan változatra, amelyben a kártyák tényleg megfordulnak: az már a te
  CSS-ed lesz.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a „Memory Game” cím angolul
vannak. Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te írsz be, magyar
feliratokkal és megjegyzésekkel mutatjuk.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza. Kívülről a [[props]]-ain keresztül kap adatot, és a
[[useState]] segítségével emlékszik: ha egy állapotérték megváltozik, a React újrarajzolja a komponenst. A rajzoláson
kívüli munka, például egy időzítő, a [[useEffect]]-be kerül. Egy tömbből a `map` készít listát, és minden elem egyedi
[[key]]-t kap. Az állapotban lévő tömböt vagy objektumot sosem módosítjuk helyben: mindig egy új példányt adunk a
setternek. Ezekre a lépésekben röviden emlékeztetünk.
:::

### A pakli

A memóriajáték egy pakli kártyával indul. Minden kártyán egy kép van (nálunk egy emoji), és minden képből pontosan két
kártya készül. A kártyákat megkeverjük, hogy senki ne tudja, mi hol van.

Egy kártyáról három dolgot kell tudnunk: az azonosítóját, a képét és azt, hogy megtalálták-e már a párját. Ez egy
[[objektum]]: `{ id: 3, emoji: '🦊', matched: false }`. A pakli az ilyen objektumok [[tömbje|tömb]].

Ennek a logikának semmi köze a Reacthez, ezért külön fájlba kerül. Hozd létre az `src` mappában a `game.js` fájlt:

```js file=src/game.js
// A kártyák képei: mindegyikből egy pár lesz.
const EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐰']

// Fisher–Yates-keverés: új, összekevert tömböt ad vissza, az eredetihez nem nyúl.
export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

// Új pakli: minden emoji kétszer, összekeverve. Minden kártya egy objektum.
export function createDeck() {
  const doubled = [...EMOJIS, ...EMOJIS]
  return shuffle(doubled).map((emoji, index) => ({ id: index, emoji, matched: false }))
}
```

- A `shuffle` a 3. leckéből ismert [[Fisher–Yates-keverés]]: az utolsó helytől halad az első felé, és minden elemet
  felcserél egy véletlenszerűen kiválasztottal a még össze nem kevert részből. Egy különbség van: a `[...items]`
  először lemásolja a kapott tömböt, és a másolatot keveri. Így a kapott tömb érintetlen marad, és a függvény bármilyen
  tömbbel biztonságosan használható (a középszinttől magát az `EMOJIS`-t is ezzel keverjük).
- A `[...EMOJIS, ...EMOJIS]` a [[spread]]: mindkét `...` „kiönti” az `EMOJIS` elemeit az új tömbbe, egymás után. Az
  eredmény egy 16 elemű tömb, benne minden emoji kétszer.
- A `map` minden emojiból egy kártyaobjektumot készít. A neki átadott nyílfüggvény második paramétere, az `index`, az
  emoji helye a már összekevert tömbben (0, 1, 2…): ez lesz a kártya azonosítója. A `({ … })`-ben a kapcsos zárójelet
  körülvevő kerek zárójel azért kell, mert a kapcsos zárójelet a nyílfüggvény után a JavaScript a függvény törzsének
  hinné; a kerek zárójel jelzi, hogy egy objektumot adunk vissza. Az `emoji,` pedig az `emoji: emoji` rövid formája.

Most a kártya. Hozd létre az `src/components/Card.jsx` fájlt (a `components` mappa már megvan, benne a `Card.css`-sel):

```jsx file=src/components/Card.jsx
import './Card.css'

function Card({ card }) {
  return (
    <button type="button" className="card is-up">
      {card.emoji}
    </button>
  )
}

export default Card
```

A kártya egy igazi `<button>`: így egérrel kattintani, a ++Tab++ billentyűvel ráugrani és ++Enter++-rel megnyomni is
lehet, külön kód nélkül. Az `is-up` osztály egyelőre képpel felfelé mutatja; a következő lépésben ez változik.

Végül az `App` rajzolja ki a paklit. Cseréld le az `src/App.jsx` tartalmát erre:

```jsx file=src/App.jsx mark=1-3,7,13-17
import { useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="board">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </main>
  )
}

export default App
```

- A pakli [[állapot]]ba kerül, mert játék közben változni fog. A `useState(() => createDeck())` a 3. leckéből ismert
  [[lusta kezdőérték]]: a React csak az első rajzoláskor hívja meg a függvényt. A `useState(createDeck())` minden
  rajzoláskor megkeverne egy új paklit, amit aztán rögtön el is dobna. A `setCards`-ra a 3. lépésben lesz szükség.
- A `cards.map(…)` minden kártyából egy `<Card>`-ot készít. A `key={card.id}` mondja meg a Reactnek, melyik elem
  melyik, a `card={card}` pedig propként adja át az egész kártyaobjektumot.
- A `board` osztály az `App.css`-ben egy négyoszlopos rács.

:::check Ellenőrizd
16 kártya áll egy 4 × 4-es rácsban, mindegyiken egy állat, és minden állat pontosan kétszer szerepel. Frissítsd az
oldalt (++F5++): minden alkalommal más a sorrend.
:::

:::mistake Gyakori hiba
Csak két kártya jelenik meg, és mindkettőn ott van mind a nyolc emoji? Lemaradt a három pont: `[EMOJIS, EMOJIS]`. Ez
egy kételemű tömb, amelynek mindkét eleme maga is egy tömb. A `...` nélkül a tömböt magát tesszük bele, nem az
elemeit.
:::

:::try Próbáld ki
Cseréld le az állatokat a kedvenc emojijaidra (Windowson a ++Win++ + ++.++, Macen a ++Ctrl++ + ++Cmd++ + ++Szóköz++
nyitja meg az emojiválasztót). Csak arra figyelj, hogy mind a nyolc különböző legyen.
:::

### Kártyák képpel lefelé

Most minden kártya képpel felfelé fekszik, így nincs mit keresni. Fordítsuk le őket, és egy kattintás fordítson fel
egyet.

Hogy melyik kártya van felfordítva, az is [[állapot]], hiszen kattintásra változik. Tárolhatnánk minden kártyán egy
`up: true` mezőt, de van egyszerűbb: egy külön tömb, a `flipped`, amely csak a felfordított kártyák
**azonosítóit** tartalmazza. Egyszerre legfeljebb két kártya lehet felfordítva (a már megtalált párokat nem számítva),
így ez a tömb sosem hosszabb kettőnél: ez a kiválasztott pár.

Miért csak az azonosító, és nem az egész kártya? Mert így a kártyák adatai egyetlen helyen élnek, a `cards` tömbben, a
`flipped` csak rájuk mutat. Ha ugyanaz az adat két állapotban is ott volna, a két példány előbb-utóbb eltérne
egymástól. Ezt az elvet [[egyetlen igazságforrásnak|egyetlen igazságforrás]] hívják.

Előbb a kártya kap két új propot. A `faceUp` megmondja, képpel felfelé fekszik-e, az `onFlip` pedig az a függvény,
amit kattintáskor meghív. Cseréld le az `src/components/Card.jsx` tartalmát:

```jsx file=src/components/Card.jsx mark=3,5-6
import './Card.css'

function Card({ card, faceUp, onFlip }) {
  return (
    <button type="button" className={faceUp ? 'card is-up' : 'card'} onClick={onFlip}>
      {faceUp ? card.emoji : '?'}
    </button>
  )
}

export default Card
```

A `faceUp ? … : …` a [[ternáris operátor]]: ha a kártya képpel felfelé fekszik, `is-up` osztályt kap, és az emojit
mutatja, különben egy kérdőjelet. A lefordított kártya sötét színét a `Card.css` adja.

Az `App`-ba jön az új állapot és a kattintás kezelése. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=8-9,11-15,23-28
import { useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])

  function flipCard(card) {
    // Ha már két kártya látszik, vagy ez a kártya már fel van fordítva, nem történik semmi.
    if (flipped.length === 2 || flipped.includes(card.id)) return
    setFlipped([...flipped, card.id])
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

- Az [[includes]] megmondja, benne van-e egy érték a tömbben: a `flipped.includes(card.id)` igaz, ha a kártya
  azonosítója a felfordítottak között van. Ezt kapja meg a kártya `faceUp` propként.
- Az `onFlip={() => flipCard(card)}` egy kis nyílfüggvény: kattintáskor meghívja a `flipCard`-ot, és átadja neki,
  **melyik** kártyáról van szó. Egy sima `onFlip={flipCard}` nem tudná megmondani, melyik kártyára kattintottak.
- A `flipCard` elején álló `return` egy korai kilépés: ha már két kártya látszik, vagy ugyanarra a kártyára
  kattintottak újra, a függvény nem csinál semmit.
- A `[...flipped, card.id]` egy új tömb: a régi elemek, és a végén az új azonosító. Az állapotot most sem módosítjuk
  helyben.

:::check Ellenőrizd
Minden kártya sötét, egy kérdőjellel. Kattints egyre: megjelenik a képe. Kattints egy másikra: az is. A harmadik
kattintás már nem csinál semmit, a két kártya nyitva marad. Ez most még így van rendjén, a következő két lépés teszi
játszhatóvá. Az ++F5++ új játékot kezd.
:::

:::mistake Gyakori hiba
`flipped.push(card.id)`, majd `setFlipped(flipped)`. Kattintásra semmi sem történik: a `push` helyben módosítja a régi
tömböt, a React pedig azt látja, hogy a setter ugyanazt a tömböt kapta vissza, tehát nincs mit újrarajzolni. Mindig új
tömböt adj a setternek, ahogy a `[...flipped, card.id]` teszi.
:::

### Pár vagy nem pár?

A második kártyánál dől el minden. Ha a képe ugyanaz, mint az elsőé, megvan egy pár: meg kell jelölni a `cards`
tömbben (`matched: true`), és a két kártya onnantól mindig nyitva marad. Ha a kép más, a két kártya egyelőre nyitva
marad; a visszafordításuk a következő lépés.

Az első kártyát a [[find]] keresi meg: a `cards.find((item) => item.id === flipped[0])` végigmegy a kártyákon, és
visszaadja az elsőt, amelyikre a feltétel igaz, itt azt, amelyiknek az azonosítója az első felfordított kártyáé. (A
második kattintásnál a `flipped` pontosan egy azonosítót tartalmaz, ezért `flipped[0]`.)

A megjelölés a nehezebb rész. Az állapotban lévő kártyát nem írhatjuk át helyben (`first.matched = true`), ehelyett a
`map` egy új tömböt készít: minden kártya úgy kerül bele, ahogy volt, kivéve azt a kettőt, amelyekből egy-egy
módosított másolat lesz. Ez az [[immutábilis frissítés]]: semmit nem írunk át, ahol változás van, ott új példány készül. A
`{ ...item, matched: true }` a spread egy objektummal: lemásolja a kártya összes mezőjét, és felülírja a `matched`-et.

Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=12-13,15-19,21-36,48
import { useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])

  function flipCard(card) {
    // Ha már két kártya látszik, ez a kártya már fel van fordítva, vagy már megvan a párja, nem történik semmi.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // Az első kártya a kettőből: csak megjegyezzük.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // A második kártya: összehasonlítjuk az elsővel.
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // Pár! A két kártya másolata matched: true értéket kap, a többi marad, ami volt.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Nem pár: egy darabig mindkettő látszik.
      setFlipped([first.id, card.id])
    }
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

A `flipCard` most három esetet különböztet meg:

- Ha a kártya már egy megtalált pár tagja (`card.matched`), arra kattintani nem ér: kilépünk.
- Ha még nincs felfordított kártya, ez az első: csak megjegyezzük.
- Ha már van egy, ez a második: összehasonlítjuk a képüket. Párnál a `setCards` megkapja az új tömböt, és a
  `flipped` kiürül, hiszen a két kártyát mostantól a `matched` tartja nyitva. Ezért kell a `faceUp`-ba a
  `card.matched ||`: a `||` (vagy) miatt egy kártya akkor fekszik képpel felfelé, ha egy megtalált pár tagja, **vagy**
  éppen fel van fordítva.

A megtalált kártyák `is-matched` osztályt kapnak, és a `Card.css` világoszöldre festi őket. Az osztálynév ezért most
darabokból áll össze. Cseréld le az `src/components/Card.jsx` tartalmát:

```jsx file=src/components/Card.jsx mark=4-6,9
import './Card.css'

function Card({ card, faceUp, onFlip }) {
  let className = 'card'
  if (faceUp) className += ' is-up'
  if (card.matched) className += ' is-matched'

  return (
    <button type="button" className={className} onClick={onFlip}>
      {faceUp ? card.emoji : '?'}
    </button>
  )
}

export default Card
```

A `let` olyan változót hoz létre, aminek később új értéket adhatsz, a `+=` pedig a szöveg végéhez fűz. Figyelj a
szóközre az `' is-up'` elején: egy megtalált kártya osztálya így `card is-up is-matched` lesz, három külön osztály.

:::check Ellenőrizd
Fordíts fel két egyforma kártyát: mindkettő világoszöld lesz, nyitva marad, és utána újra fordíthatsz kettőt. Ha két
különbözőt fordítasz fel, azok nyitva maradnak, és a játék elakad: ezt javítja a következő lépés, addig az ++F5++
segít.
:::

:::mistake Gyakori hiba
Kimarad a `map`-ből a `return item`. Az első talált párnál üres lesz az oldal, a konzolban (++F12++ → Console) pedig
ez áll: „Cannot read properties of undefined (reading 'matched')”. Egy függvény, amely nem ad vissza semmit,
`undefined`-ot ad: a két megjelölt kártyán kívül minden kártya helyén `undefined` lett.
:::

### Visszafordítás egy másodperc múlva

Ha a két kártya nem pár, egy kis idő múlva vissza kell fordulniuk, hogy a játékos megnézhesse, mi volt rajtuk, aztán
újra próbálkozhasson. A várakozás a [[setTimeout]] dolga: a `setTimeout(fn, 1000)` 1000 ezredmásodperc, vagyis egy
másodperc múlva meghívja az `fn` függvényt.

Hová kerüljön az időzítő? A 3. leckében a „Másolva!” felirat egy [[useEffect]]-ben indított időzítővel tűnt el, és
itt is ez a jó hely. Nézd meg, mikor kell visszafordítani: akkor, amikor két kártya van felfordítva. (Egy talált párnál
a `flipped` rögtön kiürül, így két felfordított kártya mindig egy el nem talált párt jelent.) Ez nem egy kattintás,
hanem egy **helyzet**, amelyet az állapot ír le, és az effekt éppen arra való, hogy egy ilyen helyzetre reagáljon:
rajzolás után lefut, megnézi az állapotot, és ha kell, elindítja az időzítőt.

Az `src/App.jsx` első sorában a `useState` mellé importáld a `useEffect`-et is:
`import { useEffect, useState } from 'react'`. Aztán írd be az effektet a két `useState` sor alá:

```jsx file=src/App.jsx mark=6-12
function App() {
  const [cards, setCards] = useState(() => createDeck())
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])

  // Két felfordított kártya csak egy el nem talált pár lehet: egy másodperc múlva visszafordulnak.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Takarítás: ha a helyzet előbb megváltozik, az időzítő leáll.
    return () => clearTimeout(timer)
  }, [flipped])
```

- A `[flipped]` a [[függőségi tömb]]: az effekt az első rajzolás után lefut, és utána mindig, amikor a `flipped`
  megváltozott.
- Ha kettőnél kevesebb kártya van felfordítva (a megtalált párokat nem számítva), a `return` azonnal kilép: nincs
  teendő.
- Ha kettő, elindul az időzítő, és egy másodperc múlva a `setFlipped([])` kiüríti a kiválasztott párt: mindkét kártya
  visszafordul.
- A visszaadott függvény a [[takarító függvény]]. A React meghívja, mielőtt újra lefuttatná az effektet, és akkor is,
  amikor a komponens eltűnik. Így egy időzítő sosem sül el olyankor, amikor már nem áll fenn a helyzet, amely miatt
  elindult.

A `flipCard` elején álló `flipped.length === 2` feltétel most kap igazi értelmet: amíg a rossz pár látszik, a többi
kártyára hiába kattintasz.

:::check Ellenőrizd
Fordíts fel két különböző kártyát: egy másodpercig látszanak, aztán mindkettő visszafordul. Közben egy harmadik kártya
nem fordul meg, akárhányszor kattintasz rá. A talált párok továbbra is nyitva maradnak.
:::

:::mistake Gyakori hiba
`setTimeout(setFlipped([]), 1000)`, nyílfüggvény nélkül. Ez a `setFlipped([])`-et azonnal meghívja, és az eredményét
adja oda az időzítőnek, így a második kártya fel sem tud fordulni: ugyanabban a pillanatban vissza is fordul. A
`setTimeout` egy függvényt vár, amit majd később hív meg: `() => setFlipped([])`.
:::

:::try Próbáld ki
Írd át az 1000-et 400-ra, aztán 2500-ra. Melyikkel nehezebb a játék? Melyikkel bosszantóbb? Utána állítsd vissza.
:::

### Nyertél!

A játék akkor ér véget, amikor minden kártya párja megvan. Ehhez nem kell új állapot: a `cards` tömbből bármikor
kiszámolható. Az [[every]] akkor ad `true`-t, ha a tömb **minden** elemére igaz a feltétel, így a
`cards.every((card) => card.matched)` pontosan akkor igaz, ha nincs több keresnivaló. Az ilyen, az állapotból
kiszámolt érték a [[származtatott érték]] (a 3. lecke erősségjelzője is ilyen volt).

A győzelmi üzenet [[feltételes megjelenítés]]: a `{won && (…)}` csak akkor rajzolja ki a sávot, ha a `won` igaz. Az
„Új játék” gomb új paklit kever, és kiüríti a kiválasztott párt. Itt a teljes `src/App.jsx`, ahogy a kezdő szint végén
kinéz:

```jsx file=src/App.jsx mark=11-12,50-53,59-69
import { useEffect, useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])

  // Származtatott érték: a kártyákból számoljuk ki, nem kell neki saját állapot.
  const won = cards.every((card) => card.matched)

  // Két felfordított kártya csak egy el nem talált pár lehet: egy másodperc múlva visszafordulnak.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Takarítás: ha a helyzet előbb megváltozik, az időzítő leáll.
    return () => clearTimeout(timer)
  }, [flipped])

  function flipCard(card) {
    // Ha már két kártya látszik, ez a kártya már fel van fordítva, vagy már megvan a párja, nem történik semmi.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // Az első kártya a kettőből: csak megjegyezzük.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // A második kártya: összehasonlítjuk az elsővel.
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // Pár! A két kártya másolata matched: true értéket kap, a többi marad, ami volt.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Nem pár: egy darabig mindkettő látszik.
      setFlipped([first.id, card.id])
    }
  }

  function playAgain() {
    setCards(createDeck())
    setFlipped([])
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>Nyertél! 🎉</h2>
            <p>Minden párt megtaláltál.</p>
          </div>
          <button type="button" className="button--primary" onClick={playAgain}>
            Új játék
          </button>
        </section>
      )}

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

- A `won` a `useState` sorok alatt áll, és nincs hozzá `setWon`: minden rajzoláskor újra kiszámoljuk, így sosem
  mondhat mást, mint amit a kártyák mutatnak.
- A sáv a kártyák **fölé** kerül, hogy telefonon is rögtön látsszon, ne kelljen legörgetni érte. A `role="status"`
  miatt a képernyőolvasók felolvassák, amikor megjelenik.
- A `playAgain` két állapotot állít vissza: új, megkevert pakli és üres kiválasztott pár.

:::check Ellenőrizd
Találd meg mind a nyolc párt: a kártyák fölött megjelenik egy sötét sáv, „Nyertél! 🎉 Minden párt megtaláltál.” Az
„Új játék” gombra friss, összekevert, lefordított pakli jön, a sáv pedig eltűnik. Ezzel kész a kezdő szint:
commitold!
:::

:::mistake Gyakori hiba
A győzelem külön állapotban: `const [won, setWon] = useState(false)`, amit a `flipCard` állít `true`-ra az utolsó
párnál. Működik, de könnyű elfelejteni a visszaállítását: ha a `playAgain`-ből kimarad a `setWon(false)`, az új játék
alatt is ott marad a „Nyertél!”. Egy származtatott értéket nem lehet elfelejteni visszaállítani, mert nincs mit.
:::

:::try Próbáld ki
Hogy ne kelljen minden próbánál nyolc párt megkeresni, vegyél ki ideiglenesen hat emojit az `EMOJIS` tömbből: két
párral fél perc alatt kipróbálhatod a győzelmet. Utána tedd vissza őket.
:::

## Középszint {level=2}

### Lépésszámláló

Egy jó memóriajátékos kevés lépésből találja meg a párokat. Egy lépés két felfordított kártya, vagyis a második kártya
megfordítása. Ez új állapot (`moves`), mert csak a `flipCard` tudja, mikor történt egy lépés: a kártyákból utólag nem
lehetne kiszámolni.

A megtalált párok száma viszont megint származtatott érték. A [[filter]] azokat az elemeket tartja meg egy új
tömbben, amelyekre a feltétel igaz, így a `cards.filter((card) => card.matched).length` a megtalált kártyák száma, a
párok száma pedig ennek a fele. Az összes pár száma ugyanígy a pakli mérete osztva kettővel: `cards.length / 2`.

A számok egy [[leíró listába|leíró lista]] kerülnek. A `<dl>` (description list) név–érték párokat tartalmaz: a `<dt>`
a nevet, a `<dd>` az értéket. Minden név–érték párt egy `<div>` fog össze (a `<dl>`-ben ez megengedett). A
képernyőolvasók így párban olvassák fel őket („Lépések: 5”), az `App.css` `stats` osztálya pedig minden `<div>`-ből
egy kis dobozt rajzol. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=10,12,14,34-35,56,63-74,80
import { useEffect, useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)

  // Származtatott értékek: az állapotból számoljuk ki őket minden rajzoláskor.
  const won = cards.every((card) => card.matched)
  const found = cards.filter((card) => card.matched).length / 2

  // Két felfordított kártya csak egy el nem talált pár lehet: egy másodperc múlva visszafordulnak.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Takarítás: ha a helyzet előbb megváltozik, az időzítő leáll.
    return () => clearTimeout(timer)
  }, [flipped])

  function flipCard(card) {
    // Ha már két kártya látszik, ez a kártya már fel van fordítva, vagy már megvan a párja, nem történik semmi.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // Az első kártya a kettőből: csak megjegyezzük.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // A második kártya: ez egy lépés. Összehasonlítjuk az elsővel.
    setMoves(moves + 1)
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // Pár! A két kártya másolata matched: true értéket kap, a többi marad, ami volt.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Nem pár: egy darabig mindkettő látszik.
      setFlipped([first.id, card.id])
    }
  }

  function playAgain() {
    setCards(createDeck())
    setFlipped([])
    setMoves(0)
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <dl className="stats">
        <div>
          <dt>Lépések</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Párok</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
      </dl>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>Nyertél! 🎉</h2>
            <p>Minden pár megvan: {moves} lépés.</p>
          </div>
          <button type="button" className="button--primary" onClick={playAgain}>
            Új játék
          </button>
        </section>
      )}

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A kártyák fölött két doboz áll: „Lépések 0” és „Párok 0 / 8” (az `App.css` `stats` osztálya nagybetűvel írja a
neveket). Minden második felfordított kártyánál eggyel nő a lépésszám, minden talált párnál a párok száma. A győzelmi
sáv azt is kiírja, hány lépésből sikerült, az „Új játék” pedig lenullázza a lépéseket.
:::

:::mistake Gyakori hiba
A `setMoves(moves + 1)` a `flipCard` elejére kerül, az első kártya kezelése elé. Ekkor minden kattintás lépésnek
számít, és egy 8 párból álló játék legalább 16 lépés lesz. Csak a második kártya számít: a `setMoves` az „első kártya”
ág után jön.
:::

:::try Feladat
Írj ki egy harmadik dobozt „Tévedések” címmel: hány lépésben nem találtál párt. Kell hozzá új állapot? (Nem kell: a
lépésekből és a megtalált párokból kiszámolható, `moves - found`.)
:::

### Időmérő

Az óra az első kattintással indul, és a győzelemnél áll meg. Az eltelt másodperceket egy új állapot, a
`seconds` tárolja, és egy [[setInterval]] növeli eggyel minden másodpercben. A 12. leckében ugyanígy lapozott magától a
képgaléria: a `setInterval(fn, 1000)` másodpercenként újra és újra meghívja az `fn`-t, amíg a `clearInterval` le nem
állítja.

Mikor jár az óra? Ezt is ki lehet számolni:
`const running = (moves > 0 || flipped.length > 0) && !won`. Szavakkal: ha már volt egy lépés, vagy legalább egy
kártya fel van fordítva (vagyis elkezdődött a játék), és még nem nyertél. Az effekt a `running`-ra figyel: amikor
`true` lesz, elindítja az időzítőt; amikor `false` lesz, a takarító függvény leállítja.

Az időt perc:másodperc alakban írjuk ki. Írd ezt a függvényt az `src/game.js` végére:

```js file=src/game.js
// Másodpercekből perc:másodperc, például 75-ből „1:15”.
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
```

A `%` a maradékos osztás (a 3. leckében [[modulo]] néven találkoztál vele): a `75 % 60` értéke 15. A `String(…)`
szöveggé alakítja a számot, a [[padStart]] pedig nullákat tesz az elejére, amíg két karakter hosszú nem lesz: az
`'5'`-ből `'05'` lesz, hogy 1:05 álljon az órán, ne 1:5. A fordított aposztrófok (backtickek) közötti szöveg az
1. leckéből ismert [[template literal]]: a `${…}` helyére a kapcsos zárójelben álló érték kerül.

Most cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=2,11,16-17,27-34,69,81-84,97-99
import { useEffect, useState } from 'react'
import { createDeck, formatTime } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // Származtatott értékek: az állapotból számoljuk ki őket minden rajzoláskor.
  const won = cards.every((card) => card.matched)
  const found = cards.filter((card) => card.matched).length / 2
  // Az óra az első kattintástól a győzelemig jár.
  const running = (moves > 0 || flipped.length > 0) && !won

  // Két felfordított kártya csak egy el nem talált pár lehet: egy másodperc múlva visszafordulnak.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Takarítás: ha a helyzet előbb megváltozik, az időzítő leáll.
    return () => clearTimeout(timer)
  }, [flipped])

  // Amíg jár az óra, másodpercenként eggyel nő az idő.
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  function flipCard(card) {
    // Ha már két kártya látszik, ez a kártya már fel van fordítva, vagy már megvan a párja, nem történik semmi.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // Az első kártya a kettőből: csak megjegyezzük.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // A második kártya: ez egy lépés. Összehasonlítjuk az elsővel.
    setMoves(moves + 1)
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // Pár! A két kártya másolata matched: true értéket kap, a többi marad, ami volt.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Nem pár: egy darabig mindkettő látszik.
      setFlipped([first.id, card.id])
    }
  }

  function playAgain() {
    setCards(createDeck())
    setFlipped([])
    setMoves(0)
    setSeconds(0)
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <dl className="stats">
        <div>
          <dt>Lépések</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Idő</dt>
          <dd>{formatTime(seconds)}</dd>
        </div>
        <div>
          <dt>Párok</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
      </dl>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>Nyertél! 🎉</h2>
            <p>
              Minden pár megvan: {moves} lépés, {formatTime(seconds)}.
            </p>
          </div>
          <button type="button" className="button--primary" onClick={playAgain}>
            Új játék
          </button>
        </section>
      )}

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

Az új effektben a `setSeconds` nem egy számot kap, hanem egy függvényt: `(current) => current + 1`. Ez a
[[frissítő függvény]], amivel a 12. leckében a magától lapozó képgalériát léptetted. A React a legfrissebb állapottal
hívja meg, és az lesz az új érték, amit visszaad.

Miért kell itt is? Az időzítő függvénye egyszer jön létre, amikor az effekt lefut, és onnantól ugyanaz a függvény fut
le minden másodpercben. Egy függvény azokat a változókat ismeri, amelyek abban a rajzolásban léteztek, amikor
létrejött: ez a 7. leckéből ismert [[closure]]. Ha a függvényben `setSeconds(seconds + 1)` állna, a függvény szemében
a `seconds` örökre 0 maradna, hiszen az effekt nem fut le újra (a függősége, a `running`, nem változik), és az óra
minden másodpercben 0 + 1 = 1-et állítana be. A frissítő függvény nem a régi változót olvassa: a React adja oda neki
az aktuális értéket.

:::check Ellenőrizd
A két doboz között megjelenik az „Idő 0:00”, és áll, amíg nem kattintasz. Az első kártyával elindul, másodpercenként
lép, és a győzelemnél megáll; a sáv kiírja, például: „Minden pár megvan: 12 lépés, 0:47.” Az „Új játék” 0:00-ra
állítja.
:::

:::mistake Gyakori hiba
`setSeconds(seconds + 1)` az időzítőben. Az óra 0:01-re ugrik, és ott ragad: az időzítő függvénye abból a
rajzolásból maradt itt, amikor a `seconds` még 0 volt, és örökké azt látja. A frissítő függvény mindig a legfrissebb
értéket kapja.
:::

:::concept Mennyire pontos a setInterval?
A böngésző nem ígéri, hogy pontosan 1000 ezredmásodpercenként hív: ha éppen dolgozik, kicsit késik, egy háttérben
lévő lapon pedig szándékosan ritkábban futtatja az időzítőket, hogy kímélje a gépet. Egy játékhoz ez bőven elég. Ha
pontos idő kell, az indulás pillanatát érdemes eltárolni (`Date.now()`), és mindig kiszámolni, mennyi telt el azóta.
A kész app (Megoldás fül) így csinálja.
:::

### Igazi kártyafordítás

A kártya most egyszerűen színt vált. Egy igazi kártya viszont megfordul: elfordul a tengelye körül, és a hátlapja
helyett az előlapja kerül elénk. A 6. leckében már forgattál kártyát CSS-sel; most átismételjük lépésről lépésre, és
teszünk mellé egy saját animációt is a megtalált párokhoz.

A trükk lényege: a kártyának két oldala van, és **mindkettő** mindig ott van a gombban, egymáson fekve. Egy belső
doboz tartja őket, és ezt a dobozt forgatjuk el 180 fokkal. Ezért a JSX-nek is változnia kell: eddig a kártyán vagy a
kérdőjel, vagy az emoji állt, mostantól mindkettő. Cseréld le az `src/components/Card.jsx` tartalmát:

```jsx file=src/components/Card.jsx mark=9-19
import './Card.css'

function Card({ card, faceUp, onFlip }) {
  let className = 'card'
  if (faceUp) className += ' is-up'
  if (card.matched) className += ' is-matched'

  return (
    <button
      type="button"
      className={className}
      onClick={onFlip}
      aria-label={faceUp ? card.emoji : 'Lefordított kártya'}
    >
      {/* Mindkét oldal mindig ott van, a CSS fordítja meg a belső dobozt. */}
      <span className="card__inner" aria-hidden="true">
        <span className="card__face card__back">?</span>
        <span className="card__face card__front">{card.emoji}</span>
      </span>
    </button>
  )
}

export default Card
```

- A `card__inner` a forgó doboz, benne a hátlap (`card__back`, a kérdőjel) és az előlap (`card__front`, az emoji).
- Mivel az emoji mostantól mindig ott van a gombban (csak nem mindig látszik), a képernyőolvasó a lefordított kártyák
  képét is felolvasná, ami csalás volna. Ezért a belső doboz megkapja az [[aria-hidden]] attribútumot
  (`aria-hidden="true"`): ami benne van, azt a képernyőolvasó nem nézi meg. Helyette a gomb egy [[aria-label]]-t kap,
  ez lesz a felolvasott neve: felfordítva az emoji, lefordítva „Lefordított kártya”.

Most a CSS. Cseréld le az `src/components/Card.css` teljes tartalmát erre:

```css file=src/components/Card.css
/* A gomb csak egy keret: ez adja a méretet és a térhatást, a színeket a két oldal hordozza. */
.card {
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: none;
  /* Az emoji a ráccsal együtt nő: egy oszlop szélességének a fele. */
  font-size: calc(50cqi / var(--columns, 4));
  font-weight: 700;
  line-height: 1;
  /* Milyen messziről nézzük a kártyát: ettől lesz térbeli a fordulás. */
  perspective: 800px;
}

/* A belső doboz fordul meg, benne a két oldallal. */
.card__inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}

.card.is-up .card__inner {
  transform: rotateY(180deg);
}

/* A két oldal pontosan egymáson fekszik, és amelyik hátat fordít nekünk, az nem látszik. */
.card__face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  backface-visibility: hidden;
}

.card__back {
  background: var(--card-color, #083f58);
  color: rgb(255 255 255 / 0.6);
}

.card:hover .card__back {
  filter: brightness(1.2);
}

/* Az előlap eleve meg van fordítva: akkor néz felénk, amikor a belső doboz is megfordul. */
.card__front {
  background: #fff;
  box-shadow: inset 0 0 0 2px var(--card-color, #083f58);
  transform: rotateY(180deg);
}

.card.is-matched {
  cursor: default;
}

/* Megtalált pár: világoszöld lesz, és egy pillanatra megnő. */
.card.is-matched .card__front {
  background: #e3f8f3;
  box-shadow: inset 0 0 0 2px #01c5ac;
  animation: pop 0.4s ease 0.35s;
}

@keyframes pop {
  50% {
    transform: rotateY(180deg) scale(1.12);
  }
}

.card:focus-visible {
  outline: 3px solid #feb800;
  outline-offset: 2px;
}

/* Aki a gépén kevesebb mozgást kért, annak nincs forgás és ugrálás. */
@media (prefers-reduced-motion: reduce) {
  .card__inner {
    transition: none;
  }

  .card.is-matched .card__front {
    animation: none;
  }
}
```

A méret, a lekerekítés és a betűméret ugyanaz, mint eddig; az újdonságok:

- A gombon álló [[perspective]] (`perspective: 800px`) azt adja meg, milyen messziről nézünk a kártyára. Enélkül a
  forgás lapos (a kártya csak keskenyebb lesz, aztán újra szélesebb), vele viszont a hozzánk közelebbi éle nagyobbnak
  látszik, mint a távolabbi, ahogy a valóságban.
- A [[transform]] átalakítja egy elem megjelenését: a `rotateY(180deg)` 180 fokkal elforgatja a függőleges (Y)
  tengelye körül. A `.card.is-up .card__inner` szabály csak a felfordított kártyák belső dobozát forgatja el.
- A [[transition]] (átmenet) azt mondja meg, hogy ha a `transform` megváltozik, ne egy pillanat alatt ugorjon az új
  értékre, hanem 0,4 másodperc alatt, finoman gyorsulva és lassulva (`ease`). Ez maga az animáció: a React csak
  felteszi vagy leveszi az `is-up` osztályt, a mozgást a böngésző számolja ki.
- A [[transform-style]] `preserve-3d` értéke miatt a doboz gyerekei is a térben maradnak, amikor a doboz elfordul.
  Enélkül a két oldal egyetlen lapos képpé olvadna össze.
- `position: absolute` és `inset: 0`: mindkét oldal kitölti a teljes belső dobozt, pontosan egymáson.
- A [[backface-visibility]] `hidden` értéke azt jelenti: ha egy oldal hátat fordít nekünk, nem látszik. Az előlap
  eleve hátat fordít (`transform: rotateY(180deg)`), ezért egy lefordított kártyán csak a hátlap látszik. Amikor a
  belső doboz megfordul, a hátlap fordít hátat, az előlap pedig felénk néz.

A megtalált pároknak saját animációjuk van. A [[@keyframes]] egy animáció lépéseit írja le: a `pop` félúton (`50%`)
12 százalékkal felnagyítja az előlapot, az elején és a végén pedig az előlap a saját, szokásos `transform`-ját kapja
vissza. Az `animation: pop 0.4s ease 0.35s` ezt játssza le 0,4 másodperc alatt, 0,35 másodperc várakozás után, amikor
a második kártya már megfordult. Figyeld meg, hogy a `scale(1.12)` mellett a `rotateY(180deg)`-nek is ott kell
lennie: az animáció a teljes `transform`-ot cseréli le, és enélkül az előlap az animáció idejére visszafordulna.

Végül a [[prefers-reduced-motion]]: ez a [[media query]] akkor érvényes, ha a felhasználó a gépe beállításaiban
kérte, hogy kevesebb legyen a mozgás (van, akinek a sok animációtól szédülése lesz). Nála a kártya forgás nélkül, egy
pillanat alatt fordul meg.

:::check Ellenőrizd
Kattints egy kártyára: térben megfordul, és előbukkan a képe. A rossz pár egy másodperc múlva ugyanígy forogva
fordul vissza. Egy talált párnál a második kártya megfordul, aztán mindkettő világoszöld lesz, és egy pillanatra
megnő.
:::

:::mistake Gyakori hiba
Kimarad a `backface-visibility: hidden`. Ekkor a hátat fordító oldal is látszik: a lefordított kártyákon a
kérdőjel helyett az emoji tükörképe jelenik meg, vagyis mindenki látja, mi hol van. Ha a kártyáid „átlátszanak”,
először ezt a sort keresd.
:::

:::try Próbáld ki
Írd át a `transition`-ben a `0.4s`-t `1.5s`-re, és lassítva látod a forgást. Aztán cseréld a `rotateY`-t `rotateX`-re
mindhárom helyen (a felfordított belső doboznál, az előlapnál és a `pop` animációban): a kártya most bukfencezik.
:::

### Nehézségi szintek

Három nehézségi szint lesz: könnyű (6 pár, 4 oszlopban), közepes (8 pár, 4 oszlopban) és nehéz (12 pár, 6 oszlopban). Ehhez
először a pakli méretét kell paraméterré tenni. Cseréld le az `src/game.js` tartalmát (a `formatTime` marad a végén):

```js file=src/game.js mark=1-2,16-19
// A kártyák képei. A legnehezebb szinthez 12 pár kell.
const EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐰', '🐨', '🐯', '🐷', '🐙']

// Fisher–Yates-keverés: új, összekevert tömböt ad vissza, az eredetihez nem nyúl.
export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

// Új pakli: pairs darab véletlenszerűen választott emoji, mindegyik kétszer, összekeverve.
export function createDeck(pairs) {
  const chosen = shuffle(EMOJIS).slice(0, pairs)
  const doubled = [...chosen, ...chosen]
  return shuffle(doubled).map((emoji, index) => ({ id: index, emoji, matched: false }))
}

// Másodpercekből perc:másodperc, például 75-ből „1:15”.
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
```

A `shuffle(EMOJIS)` összekeveri mind a 12 állatot, a [[slice]] pedig kivág belőle egy darabot: a `slice(0, pairs)` az
első `pairs` darabot adja vissza (a `slice` sem módosítja az eredeti tömböt, újat ad). Így a könnyű szinten is minden
játékban más hat állat jön elő.

Az `App` egyelőre paraméter nélkül hívja a `createDeck`-et, és a `slice(0, undefined)` ilyenkor az egész tömböt adja:
ha most frissíted az oldalt vagy új játékot kezdesz, 24 kártyát látsz. Ez így rendben van, a lépés végére helyreáll,
amikor az `App`-ot is lecseréled.

Most jön a nagyobb kérdés. Szintváltáskor minden állapotot vissza kell állítani: új pakli, üres kiválasztott pár, 0
lépés, 0:00. A `playAgain` már most négy settert hív, és minden új állapottal eggyel többet kell majd hívnia; egy
kimaradt sorból pedig furcsa hiba lesz. Van egy elegánsabb React-megoldás, amit a 3. leckében a másológombnál már
kipróbáltál: a [[key]]. Ha egy komponens `key`-je megváltozik, a React nem frissíti, hanem eldobja a régit minden
állapotával és effektjével együtt (a takarító függvények is lefutnak), és egy vadonatújat rajzol a helyére, friss
kezdőértékekkel.

Ehhez a játéknak saját komponens kell, a `Game`, amelyet az `App` egy `key`-vel rajzol ki. Hozd létre az
`src/components/Game.jsx` fájlt. A tartalma szinte szó szerint az eddigi `App`; a kiemelt sorok változtak:

```jsx file=src/components/Game.jsx mark=2-3,5-6,65,91,97,107,111
import { useEffect, useState } from 'react'
import { createDeck, formatTime } from '../game.js'
import Card from './Card.jsx'

function Game({ level, onRestart }) {
  const [cards, setCards] = useState(() => createDeck(level.pairs))
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // Származtatott értékek: az állapotból számoljuk ki őket minden rajzoláskor.
  const won = cards.every((card) => card.matched)
  const found = cards.filter((card) => card.matched).length / 2
  // Az óra az első kattintástól a győzelemig jár.
  const running = (moves > 0 || flipped.length > 0) && !won

  // Két felfordított kártya csak egy el nem talált pár lehet: egy másodperc múlva visszafordulnak.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Takarítás: ha a helyzet előbb megváltozik, az időzítő leáll.
    return () => clearTimeout(timer)
  }, [flipped])

  // Amíg jár az óra, másodpercenként eggyel nő az idő.
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  function flipCard(card) {
    // Ha már két kártya látszik, ez a kártya már fel van fordítva, vagy már megvan a párja, nem történik semmi.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // Az első kártya a kettőből: csak megjegyezzük.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // A második kártya: ez egy lépés. Összehasonlítjuk az elsővel.
    setMoves(moves + 1)
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // Pár! A két kártya másolata matched: true értéket kap, a többi marad, ami volt.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Nem pár: egy darabig mindkettő látszik.
      setFlipped([first.id, card.id])
    }
  }

  return (
    <>
      <dl className="stats">
        <div>
          <dt>Lépések</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Idő</dt>
          <dd>{formatTime(seconds)}</dd>
        </div>
        <div>
          <dt>Párok</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
      </dl>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>Nyertél! 🎉</h2>
            <p>
              Minden pár megvan: {moves} lépés, {formatTime(seconds)}.
            </p>
          </div>
          <button type="button" className="button--primary" onClick={onRestart}>
            Új játék
          </button>
        </section>
      )}

      <div className="board" style={{ '--columns': level.columns }}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </>
  )
}

export default Game
```

- A fájl a `components` mappában van, ezért a `'../game.js'` előbb egy mappát feljebb lép, a `Card` pedig ugyanebben a
  mappában van: `'./Card.jsx'`. A CSS-t az `App` tölti be, ide nem kell.
- A `Game` két propot kap: a szint adatait (`level`) és az `onRestart` függvényt, amit a győzelmi sáv gombja hív meg.
  A `playAgain` eltűnt: az új játékot mostantól az `App` intézi.
- A `<>…</>` egy [[Fragment]]: több elemet ad vissza egy csomagban, anélkül, hogy egy fölösleges `<div>`-et tenne
  köréjük az oldalon. A `<main>` és a cím az `App`-ban marad.
- `style={{ '--columns': level.columns }}`: a 2. leckében a [[CSS-változókat|CSS-változó]] főleg a CSS-ben állítottad
  be, de a Reactben a `style` propban is megadhatod őket. A `style` objektumban egy `--` kezdetű név CSS-változót
  állít be az adott elemen. A rács `repeat(var(--columns, 4), …)` oszlopot rajzol, a kártya pedig ebből számolja ki,
  mekkora legyen az emoji.

Az `App` most már csak a szintet és a játékok számát tartja számon. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx
import { useState } from 'react'
import Game from './components/Game.jsx'
import './App.css'

// A nehézségi szintek: hány pár van a pakliban, és hány oszlopban állnak a kártyák.
const LEVELS = [
  { id: 'easy', name: 'Könnyű', pairs: 6, columns: 4 },
  { id: 'medium', name: 'Közepes', pairs: 8, columns: 4 },
  { id: 'hard', name: 'Nehéz', pairs: 12, columns: 6 },
]

function App() {
  const [levelId, setLevelId] = useState('medium')
  // A játékok sorszáma: minden új játék eggyel nagyobb számot kap.
  const [round, setRound] = useState(1)

  const level = LEVELS.find((item) => item.id === levelId)

  function newGame() {
    setRound(round + 1)
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Nehézség">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === levelId}
              onClick={() => setLevelId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <button type="button" className="button" onClick={newGame}>
          Új játék
        </button>
      </div>

      {/* Ha a key megváltozik, a React eldobja a régi Game-et, és egy vadonatújat rajzol a helyére. */}
      <Game key={`${levelId}-${round}`} level={level} onRestart={newGame} />
    </main>
  )
}

export default App
```

- A `LEVELS` a komponensen kívül van, mert sosem változik: fölösleges volna minden rajzoláskor újra létrehozni.
- A `levelId` állapot csak a szint azonosítóját tárolja (`'medium'`), a szint adatait a `find` keresi elő. Ugyanaz az
  egyetlen igazságforrás, mint a kártyáknál: az adatok a `LEVELS`-ben élnek, az állapot csak rájuk mutat.
- A nehézséggombok kapcsolók. Az [[aria-pressed]] megmondja a képernyőolvasónak, hogy melyik van benyomva, és az
  `App.css` is ebből tudja, melyiket kell kiszínezni (`.chip[aria-pressed='true']`).
- A `Game` kulcsa egy template literal, például `medium-3`. Szintváltáskor és az „Új játék” gombra is megváltozik, és a
  React új `Game`-et rajzol: új pakli, 0 lépés, 0:00. Ha a rossz pár visszafordulása előtt kezdesz új játékot, a régi
  `Game` takarító függvényei leállítják az időzítőket, így azok nem nyúlnak bele az új játékba.

:::check Ellenőrizd
A cím alatt három gomb áll: „Könnyű”, „Közepes” (ez van benyomva) és „Nehéz”, mellettük az „Új játék”. A könnyű szint 12
kártya 4 oszlopban, a nehéz 24 kártya 6 oszlopban, mind a 12 állattal. Ha játék közben szintet váltasz, vagy az „Új
játék”-ra kattintasz, minden elölről indul: új pakli, 0 lépés, 0:00. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Lemarad a `key` a `<Game>`-ről. A szintgombok kiszíneződnek, de a pakli ugyanaz marad (legfeljebb más oszlopszámban
rendeződik el), és az „Új játék” sem csinál semmit. A `useState(() => createDeck(level.pairs))` kezdőértékét a React
csak a legelső rajzoláskor használja, utána hiába kap a `Game` új `level`-t: `key` nélkül a React ugyanazt a
komponenst frissíti, a régi állapotával.
:::

## Haladó szint {level=3}

### Legjobb eredmények

Mi a legjobb eredményed? Mentsük el szintenként, és mutassuk meg egy negyedik dobozban.
Ehhez az eredménynek túl kell élnie az oldal újratöltését: a böngésző [[localStorage]]-ába kerül.

A 6. és a 9. leckében írtál egy `useLocalStorage` hookot, ami úgy működik, mint a `useState`, csak az értéket el is menti.
Ha kéznél van a saját változatod, és ugyanígy egy `[érték, setter]` párt ad vissza, használhatod azt is. Ha nincs,
hozd létre az `src/useLocalStorage.js` fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Olyan, mint a useState, de az értéket a localStorage-ba is elmenti, így újratöltés után is megmarad.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? initialValue : JSON.parse(saved)
    } catch {
      // Letiltott tároló vagy hibás mentés: a kezdőértékkel indulunk.
      return initialValue
    }
  })

  // Minden változást elmentünk, szövegként.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Nem baj, ha nem sikerül: ilyenkor csak erre a látogatásra emlékszünk.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

A localStorage csak szöveget tud tárolni. A [[JSON]] egy szöveges formátum objektumokhoz és tömbökhöz: a
`JSON.stringify` szöveggé alakítja őket, a `JSON.parse` vissza. Így egy egész objektumot is el tudunk menteni. A
`try`/`catch` ugyanazért kell, mint a 2. leckében: a tárolót le lehet tiltani, és a `JSON.parse` is hibát dob, ha
valami olvashatatlan szöveg van elmentve.

Melyik eredmény a jobb? Írd ezt az `src/game.js` végére:

```js file=src/game.js
// Jobb-e az eredmény az eddigi legjobbnál? Kevesebb lépés a jobb; egyenlő lépésszámnál a gyorsabb.
export function isBetter(result, best) {
  if (!best) return true
  if (result.moves !== best.moves) return result.moves < best.moves
  return result.seconds < best.seconds
}
```

Ha még nincs legjobb eredmény, a `best` értéke `undefined`, és a `!best` igaz: ilyenkor bármi rekord.

A legjobb eredmények az `App`-ban élnek, egyetlen objektumban, szintenként: `{ easy: { moves: 9, seconds: 31 } }`. Az
`App` a `Game`-nek odaadja az adott szint rekordját (`best`), és egy függvényt (`onWin`), amit a `Game` a győzelemkor
meghív az eredménnyel. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=3-4,18-19,27-32,58-64
import { useState } from 'react'
import Game from './components/Game.jsx'
import { isBetter } from './game.js'
import useLocalStorage from './useLocalStorage.js'
import './App.css'

// A nehézségi szintek: hány pár van a pakliban, és hány oszlopban állnak a kártyák.
const LEVELS = [
  { id: 'easy', name: 'Könnyű', pairs: 6, columns: 4 },
  { id: 'medium', name: 'Közepes', pairs: 8, columns: 4 },
  { id: 'hard', name: 'Nehéz', pairs: 12, columns: 6 },
]

function App() {
  const [levelId, setLevelId] = useState('medium')
  // A játékok sorszáma: minden új játék eggyel nagyobb számot kap.
  const [round, setRound] = useState(1)
  // A legjobb eredmény szintenként, például { easy: { moves: 9, seconds: 31 } }.
  const [bests, setBests] = useLocalStorage('memory-game-bests', {})

  const level = LEVELS.find((item) => item.id === levelId)

  function newGame() {
    setRound(round + 1)
  }

  // A Game hívja meg, amikor egy játékos megtalálta az utolsó párt.
  function saveResult(result) {
    if (isBetter(result, bests[levelId])) {
      setBests({ ...bests, [levelId]: result })
    }
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Nehézség">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === levelId}
              onClick={() => setLevelId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <button type="button" className="button" onClick={newGame}>
          Új játék
        </button>
      </div>

      {/* Ha a key megváltozik, a React eldobja a régi Game-et, és egy vadonatújat rajzol a helyére. */}
      <Game
        key={`${levelId}-${round}`}
        level={level}
        best={bests[levelId]}
        onWin={saveResult}
        onRestart={newGame}
      />
    </main>
  )
}

export default App
```

A `bests[levelId]` a szögletes zárójellel azt a mezőt olvassa ki, amelyiknek a neve a `levelId`-ben van (`'easy'`
esetén ugyanaz, mint a `bests.easy`). A `{ ...bests, [levelId]: result }` pedig a 3. leckéből ismert minta: lemásolja
az objektumot, és felülír benne egy mezőt, a többi szint rekordja megmarad.

A `Game`-ben három helyen kell változtatni. Az elején az `isBetter` importja, a két új prop és egy új állapot:

```jsx file=src/components/Game.jsx mark=2,5,11-12
import { useEffect, useState } from 'react'
import { createDeck, formatTime, isBetter } from '../game.js'
import Card from './Card.jsx'

function Game({ level, best, onWin, onRestart }) {
  const [cards, setCards] = useState(() => createDeck(level.pairs))
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  // Megdöntötte-e ez a játék az eddigi legjobbat? A győzelem pillanatában döntjük el.
  const [newRecord, setNewRecord] = useState(false)
```

A `flipCard`-ban a „Pár!” ág végén, a `setFlipped([])` után jön a győzelem kezelése:

```jsx file=src/components/Game.jsx mark=4-9
      setCards(newCards)
      setFlipped([])

      // Ez volt az utolsó pár? Most szólunk az App-nak, hogy mentse az eredményt.
      if (newCards.every((item) => item.matched)) {
        const result = { moves: moves + 1, seconds }
        setNewRecord(isBetter(result, best))
        onWin(result)
      }
```

Végül a rajzolásban a `<dl>` végére, a „Párok” doboza után egy negyedik doboz kerül, a győzelmi sávba pedig a rekord
híre:

```jsx file=src/components/Game.jsx mark=7-10,20
        <div>
          <dt>Párok</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
        <div>
          <dt>Legjobb</dt>
          <dd>{best ? `${best.moves} lépés · ${formatTime(best.seconds)}` : '–'}</dd>
        </div>
      </dl>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>Nyertél! 🎉</h2>
            <p>
              Minden pár megvan: {moves} lépés, {formatTime(seconds)}.
            </p>
            {newRecord && <p className="win__record">Új rekord ezen a szinten!</p>}
          </div>
```

Három dologra figyelj a győzelem kezelésénél:

- Miért a `newCards.every(…)`, és miért nem a `won`? A `won`-t ebben a rajzolásban számoltuk ki, amikor még nem volt
  meg az utolsó pár, ezért `false`. Az új kártyák csak a `newCards`-ban vannak meg.
- Miért `moves + 1`? A `setMoves(moves + 1)` nem írja át azonnal a `moves`-ot: az új érték csak a következő rajzolásnál
  érkezik meg. Ebben a függvényben a `moves` még a régi szám.
- Miért kell a `newRecord` állapot? A győzelem pillanatában még a régi rekordot látjuk a `best`-ben, ezért most kell
  összehasonlítani. Az `onWin` után az `App` elmenti az új eredményt, a `Game` újrarajzolódik, és a `best` már
  ugyanaz lesz, mint az eredmény: akkor már nem tudnánk eldönteni, hogy rekord volt-e.

A mentés egy eseménykezelőben történik, nem egy effektben, mert egy eseményhez tartozik: az utolsó pár
megtalálásához. Ami egy kattintás következménye, az a kattintás kezelőjébe való.

:::check Ellenőrizd
A negyedik doboz: „Legjobb –”. Nyerj egy könnyű játékot: a sávban arany betűkkel „Új rekord ezen a szinten!”, a
dobozban például „9 lépés · 0:31”. Játssz még egyet rosszabbul: nincs rekordüzenet, és a doboz marad. Töltsd újra az
oldalt, és válaszd a könnyű szintet: a rekord megmaradt. A fejlesztői eszközökben (++F12++ → Application → Local
storage) ott a `memory-game-bests` kulcs.
:::

:::mistake Gyakori hiba
`onWin({ moves, seconds })`, a `+ 1` nélkül. A győzelmi sáv a helyes lépésszámot mutatja, de a „Legjobb” dobozba
eggyel kevesebb kerül: a `moves` ebben a függvényben még a régi érték.
:::

:::try Feladat
Tegyél az `App` eszköztárába, az „Új játék” mellé egy „Rekordok törlése” gombot. A kattintáskezelője egyetlen hívás:
`setBests({})`. Miért nem kell külön törölni a localStorage-ból is? (Mert a `useLocalStorage` effektje minden
változást elment, az üres objektumot is.)
:::

### Témák

Az állatok után jöhetnek más képek is. Egy téma egy emojikészlet és egy saját szín a kártyák hátára. Cseréld le az
`src/game.js` tartalmát: az `EMOJIS` helyére a `THEMES` kerül, a `createDeck` pedig paraméterként kapja meg, milyen
emojikból válogasson.

```js file=src/game.js mark=1-21,36-37
// A témák: mindegyiknek van 12 emojija és egy saját színe a kártyák hátára.
export const THEMES = [
  {
    id: 'animals',
    name: 'Állatok',
    color: '#017b6b',
    emojis: ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐰', '🐨', '🐯', '🐷', '🐙'],
  },
  {
    id: 'treats',
    name: 'Finomságok',
    color: '#9a03b7',
    emojis: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🥝', '🍍', '🥕', '🌽', '🍩', '🍪'],
  },
  {
    id: 'space',
    name: 'Világűr',
    color: '#013e8e',
    emojis: ['🚀', '🌙', '⭐', '🪐', '🌍', '👽', '🛸', '🌞', '🔭', '🌠', '🌌', '☄️'],
  },
]

// Fisher–Yates-keverés: új, összekevert tömböt ad vissza, az eredetihez nem nyúl.
export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

// Új pakli: pairs darab véletlenszerűen választott emoji, mindegyik kétszer, összekeverve.
export function createDeck(pairs, emojis) {
  const chosen = shuffle(emojis).slice(0, pairs)
  const doubled = [...chosen, ...chosen]
  return shuffle(doubled).map((emoji, index) => ({ id: index, emoji, matched: false }))
}

// Másodpercekből perc:másodperc, például 75-ből „1:15”.
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

// Jobb-e az eredmény az eddigi legjobbnál? Kevesebb lépés a jobb; egyenlő lépésszámnál a gyorsabb.
export function isBetter(result, best) {
  if (!best) return true
  if (result.moves !== best.moves) return result.moves < best.moves
  return result.seconds < best.seconds
}
```

A `Game` az emojikat propként kapja, és továbbadja a `createDeck`-nek. Írd át a `Game.jsx` két sorát:

```jsx file=src/components/Game.jsx mark=1-2
function Game({ level, emojis, best, onWin, onRestart }) {
  const [cards, setCards] = useState(() => createDeck(level.pairs, emojis))
```

Amíg az `App`-ot is át nem írod, a `Game` nem kap emojikat, és a `createDeck` hibát dob: ha közben frissíted az oldalt
vagy új játékot kezdesz, üres lesz az oldal, a konzolban pedig hibaüzenet áll. A lépés végére rendbe jön.

A választott téma az `App`-ba kerül, és ezt is a `useLocalStorage` őrzi, így a játék emlékszik rá. A választó egy
[[legördülő lista]] (`<select>`), mint a 10. lecke kategóriaválasztója: ugyanúgy [[vezérelt mező]], mint a 3. lecke
csúszkája, az értékét az állapotból kapja, és minden változást jelent az `onChange`-en át. Cseréld le az `src/App.jsx`
tartalmát:

```jsx file=src/App.jsx mark=3,18,23-24,38,55-64,72,74
import { useState } from 'react'
import Game from './components/Game.jsx'
import { THEMES, isBetter } from './game.js'
import useLocalStorage from './useLocalStorage.js'
import './App.css'

// A nehézségi szintek: hány pár van a pakliban, és hány oszlopban állnak a kártyák.
const LEVELS = [
  { id: 'easy', name: 'Könnyű', pairs: 6, columns: 4 },
  { id: 'medium', name: 'Közepes', pairs: 8, columns: 4 },
  { id: 'hard', name: 'Nehéz', pairs: 12, columns: 6 },
]

function App() {
  const [levelId, setLevelId] = useState('medium')
  // A játékok sorszáma: minden új játék eggyel nagyobb számot kap.
  const [round, setRound] = useState(1)
  const [themeId, setThemeId] = useLocalStorage('memory-game-theme', 'animals')
  // A legjobb eredmény szintenként, például { easy: { moves: 9, seconds: 31 } }.
  const [bests, setBests] = useLocalStorage('memory-game-bests', {})

  const level = LEVELS.find((item) => item.id === levelId)
  // Ha a mentett téma már nem létezik, az első témával megyünk tovább.
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0]

  function newGame() {
    setRound(round + 1)
  }

  // A Game hívja meg, amikor egy játékos megtalálta az utolsó párt.
  function saveResult(result) {
    if (isBetter(result, bests[levelId])) {
      setBests({ ...bests, [levelId]: result })
    }
  }

  return (
    <main className="game" style={{ '--card-color': theme.color }}>
      <h1>Memory Game</h1>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Nehézség">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === levelId}
              onClick={() => setLevelId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <label className="select">
          Téma
          <select value={theme.id} onChange={(event) => setThemeId(event.target.value)}>
            {THEMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" onClick={newGame}>
          Új játék
        </button>
      </div>

      {/* Ha a key megváltozik, a React eldobja a régi Game-et, és egy vadonatújat rajzol a helyére. */}
      <Game
        key={`${levelId}-${theme.id}-${round}`}
        level={level}
        emojis={theme.emojis}
        best={bests[levelId]}
        onWin={saveResult}
        onRestart={newGame}
      />
    </main>
  )
}

export default App
```

- A `??` operátor ([[nullish coalescing]]) a bal oldali értéket adja, kivéve ha az `null` vagy `undefined`: ilyenkor
  a jobb oldalit. Ha a
  `find` nem talál semmit (mert például egy régebbi mentés olyan témát tárol, amit azóta átneveztél), `undefined`-ot ad,
  és ilyenkor `THEMES[0]` lesz a téma. Ezért használjuk a `theme.id`-t a `themeId` helyett: az mindig létező téma.
- A `style={{ '--card-color': theme.color }}` a `<main>`-en állítja be a színt. A CSS-változókat minden benne lévő
  elem örökli, így minden kártya megkapja: a `Card.css` a hátlapnál és az előlap keretén `var(--card-color, …)`-t
  használ.
- A téma azonosítója is a `key`-be került: témaváltáskor új pakli kell, az új képekkel.
- A `<select>`-be az `<option>`-öket a `THEMES`-ből készítjük, a `value` mondja meg, melyik van kiválasztva, az
  `event.target.value` pedig a frissen választott `<option>` `value`-ja.

:::check Ellenőrizd
A nehézséggombok mellett megjelenik a „Téma” választó. Az „Állatok” kártyáinak hátlapja mostantól kékeszöld. A
„Világűr” témánál rakéták és bolygók jönnek, kék kártyahátakkal; a „Finomságok” lila hátú kártyáin gyümölcs, zöldség
és süti van. Töltsd újra az oldalt: a választott téma megmaradt.
:::

:::mistake Gyakori hiba
A `<select>`-nek `value`-t adsz, de `onChange`-et nem. A választó be van fagyva, a konzol pedig figyelmeztet, hogy a
mező csak olvasható. Ahogy minden vezérelt mezőnél, itt is mindkettő kell.
:::

:::concept Képek egy API-ból
Egy igazi memóriajáték fényképeket is mutathatna: kutyákat, festményeket, bármit. Ilyenkor a téma képeinek címét egy
[[API]]-tól kérnénk el, és a kártya előlapján `<img src={card.image} alt="">` állna az emoji helyett. Az adatok
lekérését (`fetch`) a 14. leckében tanulod meg. Ebben a kurzusban nem hívunk külső szolgáltatást, az emojik pedig
internet nélkül is működnek, és minden gépen ott vannak.
:::

:::try Feladat
Készíts egy negyedik témát a saját kedvenc emojijaidból. Csak a `THEMES` tömbhöz kell hozzányúlnod; arra figyelj, hogy
12 különböző emoji legyen benne, különben a nehéz szinten nem jut minden párnak kép.
:::

### Kétjátékos mód

Ketten játszanak, felváltva. Aki párt talál, kap egy pontot, és újra ő jön; aki mellényúl, átadja a kört a másiknak. A
végén az nyer, akinek több párja van.

A `Game` két új állapotot kap: a `turn` azt mondja meg, ki következik (0 az első, 1 a második játékos), a `scores`
pedig egy kételemű tömb a két játékos pontjával. A rossz párnál a kör átadása egyetlen sor: `setTurn(1 - turn)`. Ha a
`turn` 0, az új érték 1; ha 1, akkor 0. Egy talált párnál a soros játékos pontja nő eggyel; ez ugyanaz az immutábilis
frissítés, mint a kártyáknál, csak egy számokból álló tömbön:
`scores.map((score, index) => (index === turn ? score + 1 : score))`.

A legjobb eredményt csak egyjátékos módban mentjük: ketten a lépések közösek, a rekord nem volna összehasonlítható.
Ezért a győzelem kezelése elé bekerül a `players === 1 &&` feltétel, és kétjátékos módban a „Legjobb” doboz helyén a
két játékos pontjai állnak. Itt a teljes `src/components/Game.jsx`:

```jsx file=src/components/Game.jsx mark=5,7,15-17,65-66,68-69,75,77,81-87,106-118,121-125,130
import { useEffect, useState } from 'react'
import { createDeck, formatTime, isBetter } from '../game.js'
import Card from './Card.jsx'

const PLAYER_NAMES = ['1. játékos', '2. játékos']

function Game({ level, emojis, players, best, onWin, onRestart }) {
  const [cards, setCards] = useState(() => createDeck(level.pairs, emojis))
  // A felfordított, még pár nélküli kártyák azonosítói: legfeljebb kettő.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  // Megdöntötte-e ez a játék az eddigi legjobbat? A győzelem pillanatában döntjük el.
  const [newRecord, setNewRecord] = useState(false)
  // Kétjátékos mód: ki következik (0 vagy 1), és hány párt talált eddig a két játékos.
  const [turn, setTurn] = useState(0)
  const [scores, setScores] = useState([0, 0])

  // Származtatott értékek: az állapotból számoljuk ki őket minden rajzoláskor.
  const won = cards.every((card) => card.matched)
  const found = cards.filter((card) => card.matched).length / 2
  // Az óra az első kattintástól a győzelemig jár.
  const running = (moves > 0 || flipped.length > 0) && !won

  // Két felfordított kártya csak egy el nem talált pár lehet: egy másodperc múlva visszafordulnak.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Takarítás: ha a helyzet előbb megváltozik, az időzítő leáll.
    return () => clearTimeout(timer)
  }, [flipped])

  // Amíg jár az óra, másodpercenként eggyel nő az idő.
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  function flipCard(card) {
    // Ha már két kártya látszik, ez a kártya már fel van fordítva, vagy már megvan a párja, nem történik semmi.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // Az első kártya a kettőből: csak megjegyezzük.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // A második kártya: ez egy lépés. Összehasonlítjuk az elsővel.
    setMoves(moves + 1)
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // Pár! A két kártya másolata matched: true értéket kap, a többi marad, ami volt.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
      // A soros játékos kap egy pontot, és újra ő jön.
      setScores(scores.map((score, index) => (index === turn ? score + 1 : score)))

      // Ez volt az utolsó pár? Egyjátékos módban most szólunk az App-nak, hogy mentse az eredményt.
      if (players === 1 && newCards.every((item) => item.matched)) {
        const result = { moves: moves + 1, seconds }
        setNewRecord(isBetter(result, best))
        onWin(result)
      }
    } else {
      // Nem pár: egy darabig mindkettő látszik, és a másik játékos jön (1 - 0 = 1, 1 - 1 = 0).
      setFlipped([first.id, card.id])
      setTurn(1 - turn)
    }
  }

  // Kétjátékos módban a győzelmi üzenet azt is megmondja, ki nyert.
  let title = 'Nyertél! 🎉'
  if (players === 2) {
    if (scores[0] > scores[1]) title = '1. játékos nyert! 🎉'
    else if (scores[1] > scores[0]) title = '2. játékos nyert! 🎉'
    else title = 'Döntetlen!'
  }

  return (
    <>
      <dl className="stats">
        <div>
          <dt>Lépések</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Idő</dt>
          <dd>{formatTime(seconds)}</dd>
        </div>
        <div>
          <dt>Párok</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
        {players === 1 && (
          <div>
            <dt>Legjobb</dt>
            <dd>{best ? `${best.moves} lépés · ${formatTime(best.seconds)}` : '–'}</dd>
          </div>
        )}
        {players === 2 &&
          PLAYER_NAMES.map((name, index) => (
            <div key={name} className={index === turn && !won ? 'is-turn' : ''}>
              <dt>{name}</dt>
              <dd>{scores[index]}</dd>
            </div>
          ))}
      </dl>

      {players === 2 && !won && (
        <p className="turn" aria-live="polite">
          Következik: {PLAYER_NAMES[turn]}
        </p>
      )}

      {won && (
        <section className="win" role="status">
          <div>
            <h2>{title}</h2>
            <p>
              Minden pár megvan: {moves} lépés, {formatTime(seconds)}.
            </p>
            {newRecord && <p className="win__record">Új rekord ezen a szinten!</p>}
          </div>
          <button type="button" className="button--primary" onClick={onRestart}>
            Új játék
          </button>
        </section>
      )}

      <div className="board" style={{ '--columns': level.columns }}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </>
  )
}

export default Game
```

- Egyjátékos módban a `turn` és a `scores` is változik, de sehol sem látszik: nem kell külön kód, ami kikapcsolná
  őket.
- A `title` egy szöveg, amit a rajzolás előtt `if`-ekkel rakunk össze, ahogy a kártya osztálynevét. Az `else if`
  csak akkor néz meg egy feltételt, ha az előző hamis volt.
- A két játékos doboza a `PLAYER_NAMES` tömbből készül, és a nevük a `key` (két különböző szöveg, sosem változik).
  A soros játékos doboza `is-turn` osztályt kap, és türkizre vált.
- A „Következik:” sor `aria-live="polite"`, így a képernyőolvasó is bemondja, ha a kör átkerül a másik játékoshoz.

Az `App`-ban jön a játékosok száma, két kapcsolóval. Ez is a `key`-be kerül: egy- és kétjátékos mód között váltva új
játék indul. Itt a végleges `src/App.jsx`:

```jsx file=src/App.jsx mark=18,56-63,81,84
import { useState } from 'react'
import Game from './components/Game.jsx'
import { THEMES, isBetter } from './game.js'
import useLocalStorage from './useLocalStorage.js'
import './App.css'

// A nehézségi szintek: hány pár van a pakliban, és hány oszlopban állnak a kártyák.
const LEVELS = [
  { id: 'easy', name: 'Könnyű', pairs: 6, columns: 4 },
  { id: 'medium', name: 'Közepes', pairs: 8, columns: 4 },
  { id: 'hard', name: 'Nehéz', pairs: 12, columns: 6 },
]

function App() {
  const [levelId, setLevelId] = useState('medium')
  // A játékok sorszáma: minden új játék eggyel nagyobb számot kap.
  const [round, setRound] = useState(1)
  const [players, setPlayers] = useState(1)
  const [themeId, setThemeId] = useLocalStorage('memory-game-theme', 'animals')
  // A legjobb eredmény szintenként, például { easy: { moves: 9, seconds: 31 } }.
  const [bests, setBests] = useLocalStorage('memory-game-bests', {})

  const level = LEVELS.find((item) => item.id === levelId)
  // Ha a mentett téma már nem létezik, az első témával megyünk tovább.
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0]

  function newGame() {
    setRound(round + 1)
  }

  // A Game hívja meg, amikor egy játékos megtalálta az utolsó párt.
  function saveResult(result) {
    if (isBetter(result, bests[levelId])) {
      setBests({ ...bests, [levelId]: result })
    }
  }

  return (
    <main className="game" style={{ '--card-color': theme.color }}>
      <h1>Memory Game</h1>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Nehézség">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === levelId}
              onClick={() => setLevelId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Játékosok">
          <button type="button" className="chip" aria-pressed={players === 1} onClick={() => setPlayers(1)}>
            Egyedül
          </button>
          <button type="button" className="chip" aria-pressed={players === 2} onClick={() => setPlayers(2)}>
            Ketten
          </button>
        </div>
        <label className="select">
          Téma
          <select value={theme.id} onChange={(event) => setThemeId(event.target.value)}>
            {THEMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" onClick={newGame}>
          Új játék
        </button>
      </div>

      {/* Ha a key megváltozik, a React eldobja a régi Game-et, és egy vadonatújat rajzol a helyére. */}
      <Game
        key={`${levelId}-${theme.id}-${players}-${round}`}
        level={level}
        emojis={theme.emojis}
        players={players}
        best={bests[levelId]}
        onWin={saveResult}
        onRestart={newGame}
      />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Kattints a „Ketten” gombra: a „Legjobb” doboz helyén megjelenik az „1. játékos 0” és a „2. játékos 0”, az elsőé
türkiz, alattuk pedig: „Következik: 1. játékos”. Egy rossz pár után a második játékos jön, egy talált pár után ugyanaz
marad, és nő a pontja. A végén a sáv kiírja, ki nyert (vagy hogy döntetlen), és kétjátékos játék után nem kerül
semmi a rekordok közé.
:::

:::mistake Gyakori hiba
Kimarad a `players` a `Game` kulcsából. Ha ekkor játék közben a „Ketten”-re váltasz, a játék nem indul újra, és a két
játékos dobozában máris pontok állnak: az egyedül talált párok, aszerint szétosztva, ahogy a `turn` közben ide-oda
váltott. Ami a játék szabályait változtatja meg, annak új játékot kell indítania, vagyis a `key`-be való.
:::

:::try Feladat
Jelöld a kártyákon, ki találta meg a párt: a „Pár!” ágban a `{ ...item, matched: true }` mellé tedd el a `turn`-t is
(`owner: turn`), a `Card`-ban pedig adj egy `is-p2` osztályt a második játékos kártyáinak, és színezd őket máshogy a
`Card.css`-ben.
:::

### Billentyűvezérlés

Mivel minden kártya `<button>`, a billentyűzet már most is működik: a ++Tab++ a következő kártyára ugrik, az ++Enter++
vagy a ++Szóköz++ megfordítja. Próbáld ki! 24 kártyánál viszont sok ++Tab++ kell, mire az utolsóhoz érsz. A
játékokban megszokott, hogy a nyilakkal lehet lépkedni: jobbra-balra egy kártyát, fel-le egy egész sort.

Ehhez tudnunk kell, melyik gombon áll most a [[fókusz]] (a fókuszban lévő elem kapja a billentyűleütéseket), és át
kell tudnunk tenni egy másikra. Ezt nem a React tartja számon, hanem a böngésző: a `document.activeElement` megmondja,
melyik elemen van, egy elem `focus()` metódusa pedig odateszi (a 8. leckében a számológép beviteli mezőjén már
használtad).

A kártyák gombjait a rácson keresztül érjük el. Egy valódi HTML-elemhez a [[useRef]] ad hozzáférést, ahogy a 12.
leckében a `<dialog>`-hoz: a `useRef(null)` egy dobozt ad, amelynek a `current` mezőjébe a React beleteszi az elemet,
ha a JSX-ben `ref={…}` áll rajta. A `useState`-tel ellentétben a ref megváltozása nem rajzolja újra a komponenst;
arra való, hogy egy dolgot, például egy elemet, kézben tartsunk két rajzolás között.

A `Game.jsx` első sorában importáld a `useRef`-et is: `import { useEffect, useRef, useState } from 'react'`. Aztán a
`scores` állapot alá jön a ref:

```jsx file=src/components/Game.jsx mark=3-4
  const [turn, setTurn] = useState(0)
  const [scores, setScores] = useState([0, 0])
  // A kártyák rácsa, hogy a nyilakkal a gombjai között léptethessük a fókuszt.
  const boardRef = useRef(null)
```

A `flipCard` függvény után pedig a nyilak kezelője:

```jsx file=src/components/Game.jsx
  // A nyilak a rácsban mozgatják a fókuszt: jobbra-balra egy kártyát, fel-le egy egész sort lépnek.
  function moveFocus(event) {
    const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: level.columns, ArrowUp: -level.columns }
    const step = steps[event.key]
    if (step === undefined) return
    // Ne görgessen az oldal, csak a fókusz lépjen tovább.
    event.preventDefault()

    const buttons = [...boardRef.current.querySelectorAll('.card')]
    const current = buttons.indexOf(document.activeElement)
    const target = current + step
    if (current === -1 || target < 0 || target >= buttons.length) return
    buttons[target].focus()
  }
```

Végül a rács kapja meg a refet és a kezelőt. Cseréld le a `board` nyitócímkéjét:

```jsx file=src/components/Game.jsx mark=2,5-7
      <div
        ref={boardRef}
        className="board"
        style={{ '--columns': level.columns }}
        role="group"
        aria-label="Kártyák"
        onKeyDown={moveFocus}
      >
```

- Az `event.key` a lenyomott billentyű neve, például `'ArrowRight'` (a 7. és a 12. leckében már figyeltél
  billentyűkre). A `steps` objektum minden nyílhoz megmondja, hányat kell lépni; a `steps[event.key]` minden más
  billentyűre `undefined`, és ilyenkor kilépünk, így a ++Tab++, az ++Enter++ és a ++Szóköz++ ugyanúgy működik, mint
  eddig.
- Az `event.preventDefault()` letiltja a böngésző [[alapértelmezett viselkedését|alapértelmezett viselkedés]], mint a
  7. leckében a szóköznél: a nyílbillentyűnél ez az oldal görgetése. Még a határok vizsgálata előtt hívjuk, így a rács
  szélén sem görget.
- A `querySelectorAll('.card')` a rácson belül megkeresi az összes kártyagombot, sorrendben. Ez nem igazi tömb, ezért
  a köré írt `[...` és `]` (spread) tömbbé alakítja, hogy használhassuk az `indexOf`-ot: ez megmondja, hányadik gombon
  áll a fókusz (vagy `-1`-et ad, ha egyiken sem).
- Ha a cél a rácson kívül esne (az első sor fölött vagy az utolsó kártya után), nem lépünk sehová.
- Az `onKeyDown` a rácson van, nem az egyes kártyákon. A billentyűesemény a fókuszban lévő gombtól felfelé
  [[buborékol|eseménybuborékolás]] a szülőkig, így egyetlen kezelő elég mind a 24 kártyához.
- A `role="group"` és az `aria-label` egy névvel ellátott csoportnak mutatja a rácsot a képernyőolvasóknak.

:::check Ellenőrizd
Nyomogasd a ++Tab++-ot, amíg a fókusz el nem ér az első kártyáig (sárga keret jelzi). A nyilakkal lépkedj a rácsban:
a fókusz lép, az oldal nem görget. A ++Szóköz++ vagy az ++Enter++ megfordítja a kártyát. Egy sor végén a ++→++ a
következő sor elejére visz, az első sorban a ++↑++, az utolsóban a ++↓++ pedig nem viszi tovább a fókuszt. A nehéz
szinten a ++↓++ hat kártyát lép, hiszen a rács hatoszlopos. Gratulálok, kész a memóriajátékod!
:::

:::mistake Gyakori hiba
`ArrowDown: 4` a `level.columns` helyett. A könnyű és a közepes szinten minden rendben, a nehéz szinten viszont a ++↓++
nem az alatta lévő kártyára ugrik: a hatoszlopos rácsban négy kártya nem egy egész sor, így a fókusz ferdén, balra
lefelé ugrik, egy sor első két kártyájáról pedig ugyanabban a sorban marad. Ami a szinttől függ, azt a szint
adataiból olvasd ki.
:::

:::try Feladat
Egészítsd ki a `moveFocus`-t úgy, hogy a ++Home++ az első, az ++End++ az utolsó kártyára ugorjon: a cél ilyenkor `0`,
illetve `buttons.length - 1`. Figyelj, a `step === undefined` most minden más billentyűnél kilép, ezért a sorrendet
is át kell gondolnod.
:::
