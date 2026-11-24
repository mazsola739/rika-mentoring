# Mit építünk?

Egy palettagenerátort, amilyet a tervezők is használnak: egy gombnyomásra öt szín jelenik meg egymás mellett. Ha egy
tetszik, zárolod, a többit pedig addig sorsolod újra, amíg össze nem áll a paletta; a kódokat egy kattintással
kimásolod, a legjobbakat elmented. Közben megtanulod, hogyan épül fel egy színkód, hogyan kezeli a React a tömböket az
állapotban (mindig másolattal, sosem helyben átírva), hogyan áll össze egy harmonikus paletta a színkörön, és hogyan
ellenőrizhető, hogy egy szöveg jól olvasható-e egy színen.

:::levels
- Öt véletlen szín egy gombnyomásra, hex kódokkal és másolással a vágólapra. | kb. 2 óra
- Színek zárolása, új paletta a szóközre, és kedvencek, amelyek az újratöltést is túlélik. | kb. 3 óra
- Harmonikus paletták a színkör alapján, kontrasztellenőrzés (WCAG), export CSS-változóként és megosztható link. | kb. 3 óra
:::

**Előismeret:** az első hat lecke. Leginkább arra építünk, amit a „Password Generator”-ban (3. lecke) tanultál:
véletlenszámok, a vágólap, az `async` függvények és az időzítő egy effektben; és arra, amit a „Flashcards”-ban (6.
lecke): a billentyűfigyelő, a frissítő függvény, a tömbök másolása az állapotban, a `useLocalStorage` és a link, ami
adatot visz a címben. Ahol valami korábbit használunk, ott egy-két mondatban felidézzük; minden újat lépésről lépésre
elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke feladata, egy kész kiinduló projekt, a kurzus GitHub-repójának `lessons/07-color-palette/exercise` mappája (a
fenti „Feladat a GitHubon” gomb ezt nyitja meg). Hogy hogyan jutsz hozzá, azt az 1. lecke 0. lépése részletesen
elmagyarázza; itt röviden a parancsok. A terminálban, a munkamappádban:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git    # csak az első alkalommal
cp -r rika-mentoring/lessons/07-color-palette/exercise color-palette    # a saját másolatod
```

Ha egy korábbi leckéből már megvan a repó, a `git clone` helyett a `rika-mentoring` mappában futtasd a `git pull`
parancsot (`cd rika-mentoring`, `git pull`, `cd ..`): ez lehozza az új leckéket, utána jöhet a másolás. (Nincs gited? A
repó GitHub-oldalán válaszd a **Code → Download ZIP** lehetőséget; az 1. lecke ezt is megmutatja.) A mappát a
fájlkezelővel is átmásolhatod: a lényeg, hogy a másolat neve `color-palette` legyen, és a repón kívülre kerüljön, így az
eredeti érintetlen marad.

Nyisd meg a szerkesztőben a másolatodat, a `color-palette` mappát, és írd be ezt a két parancsot a szerkesztő
termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Világosszürke oldalt látsz, a tetején egy
fehér kártyát „Color Palette” címmel. Más még nincs rajta: a palettát te építed.
:::

A szervert hagyd futni, és egy második terminálban (a terminálpanel **+** gombjával) tedd git-repóvá a másolatodat
egyetlen committal, a kezdőállapottal:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Ahogy a korábbi leckékben, a `git restore .` mostantól minden fájlt visszaállít az utolsó commitod állapotára, és
érdemes minden működő lépés után commitolni.

A kiinduló projektben két fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről és a színekről szól, nem a CSS-ről, ezért most
  nem kell stílust írnod: csak a lépésekben megadott osztályneveket (`swatch`, `toolbar`, `favorites`, …) használod.
  Azért nézz bele!

A kiinduló projekt mindkét nyelven ugyanaz, ezért a „Color Palette” cím és a fájlokban lévő megjegyzések angolul
vannak. Ha szeretnéd, írd át őket nyugodtan magyarra. A kódot, amit te írsz be, magyar feliratokkal és megjegyzésekkel
mutatjuk.

:::concept Gyors ismétlés
Egy [[komponens]] egy függvény, ami [[JSX]]-et ad vissza. Adatot a [[props]]-ain keresztül kap, emlékezni a
[[useState]]-tel tud: ha egy állapotérték megváltozik, a React újrarajzolja. A rajzoláson kívüli munka (egy időzítő,
egy eseményfigyelő) a [[useEffect]]-be kerül, és amit az effekt elindít, azt a [[takarító függvény]] állítja le. Ha
ezek közül valami homályos, lapozz vissza az 1–3. leckéhez.
:::

### Színkódok: mit jelent a #FF8800?

A képernyőd minden pontja három apró lámpából áll: egy vörösből, egy zöldből és egy kékből. Ez az [[RGB]] (red, green,
blue). Mindhárom 0 és 255 közötti erősséggel világíthat, és a szemed a hármat együtt egyetlen színnek látja: a
255, 136, 0 például narancssárga (sok vörös, közepes zöld, semmi kék), a 0, 0, 0 fekete, a 255, 255, 255 fehér.

A weben ezt a három számot többnyire [[hex kódként|hex kód]] írjuk le: `#FF8800`. A `#` után három kétjegyű szám áll,
sorban a vörös, a zöld és a kék, csak nem tízes, hanem [[tizenhatos számrendszerben|hexadecimális szám]]. Ebben a 9
után az A, B, C, D, E és F jön (10-től 15-ig), a bal oldali jegy tizenhatosokat számol, a jobb oldali egyeseket: az
`FF` 15 × 16 + 15 = 255, a `88` 8 × 16 + 8 = 136, a `00` pedig 0. Két ilyen jegy pontosan 256-féle értéket ír le, és a
három csatornából 256 × 256 × 256, vagyis több mint 16,7 millió szín jön ki.

Írjunk egy függvényt, ami három számból hex kódot készít, és egyet, ami véletlen színt sorsol. Hozd létre az `src`
mappában a `colors.js` fájlt:

```js file=src/colors.js
// Véletlen egész szám 0-tól max - 1-ig (ugyanaz, mint a 3. leckében).
export function randomInt(max) {
  return Math.floor(Math.random() * max)
}

// Egy 0 és 255 közötti szám két hexadecimális jeggyel: 10 → '0a', 255 → 'ff'.
function toHex(value) {
  return Math.round(value).toString(16).padStart(2, '0')
}

// A három csatornából (vörös, zöld, kék, mindegyik 0–255) hex kód: 255, 136, 0 → '#FF8800'.
export function rgbToHex(red, green, blue) {
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase()
}

// Egy teljesen véletlen szín.
export function randomHex() {
  return rgbToHex(randomInt(256), randomInt(256), randomInt(256))
}
```

- A `toString(16)` tizenhatos számrendszerben írja fel a számot: a `(255).toString(16)` eredménye `'ff'`, a
  `(10).toString(16)`-é `'a'`.
- A `padStart(2, '0')` a szöveg elejére tesz nullákat, amíg két karakter hosszú nem lesz: az `'a'`-ból `'0a'` lesz.
  Enélkül a 10, 0, 0 kódja `#a00` lenne, ami a CSS-ben egészen mást jelent.
- A `Math.round` kerekít. Most még csak egész számokat kap, de a haladó szinten törtek is érkeznek.
- A fordított aposztrófok közötti szöveg az 1. leckéből ismert [[template literal]]: a `${…}` helyére a benne lévő
  kifejezés értéke kerül. A végén a `toUpperCase()` nagybetűssé alakítja, mert a `#FF8800` jobban olvasható, mint a
  `#ff8800` (a böngészőnek mindegy).
- A `toHex` elől hiányzik az `export`: csak ebben a fájlban használjuk, kívülről nem látszik.

Most jelenjen meg egy szín az oldalon. Írd át az `src/App.jsx`-et így (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1,5,10-12
import { randomHex } from './colors.js'
import './App.css'

function App() {
  const color = randomHex()

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="swatch" style={{ background: color }}>
        <span className="swatch__hex">{color}</span>
      </div>
    </main>
  )
}

export default App
```

A `style` propot a 6. lecke haladásjelzőjén már láttad: vele a JSX-ből adhatsz stílust egy elemnek. Nem szöveget vár,
mint a HTML-ben, hanem egy JavaScript-[[objektumot|objektum]]: a külső kapcsos zárójel azt jelenti, hogy „itt
JavaScript jön”, a belső maga az objektum, `{ background: color }`. Ez az [[inline stílus]]. Akkor hasznos, ha egy
érték, mint itt a szín, csak futás közben dől el; minden más stílus marad az `App.css`-ben. Ha egy CSS-tulajdonság
neve kötőjeles, itt egybeírva, nagybetűvel folytatva szerepel: a `background-color`-ból `backgroundColor` lesz.

:::check Ellenőrizd
A cím alatt egy nagy, színes téglalap jelenik meg, alján egy fehér címkén a kódjával, például `#3FA2C7`. Frissítsd az
oldalt (++F5++): minden alkalommal más színt kapsz.
:::

:::mistake Gyakori hiba
`style="background: red"`, ahogy a HTML-ben szokás. A React ilyenkor hibát dob, az oldal üres lesz, a konzolban
(++F12++ → Console) pedig ez áll: „The `style` prop expects a mapping from style properties to values, not a string”.
JSX-ben a `style` mindig objektum: `style={{ background: 'red' }}`.
:::

:::try Próbáld ki
Írd át a `randomHex()` hívást `rgbToHex(255, 136, 0)`-ra (az első sorban az `rgbToHex`-et is importáld): narancssárga
lesz, `#FF8800` kóddal. Próbáld ki a `0, 0, 0`, a `255, 255, 255` és a `0, 0, 255` értékeket is, aztán állítsd vissza.
:::

### Öt szín egy tömbben

Egy palettához öt szín kell. Öt külön változó helyett egy [[tömbbe|tömb]] tesszük őket. A tömb egy sorszámozott lista,
például `['#3FA2C7', '#F0C808', '#DD1C1A', '#086788', '#FFF1D0']`. Írd ezt a függvényt az `src/colors.js` végére:

```js file=src/colors.js
// Öt véletlen szín egy tömbben, például ['#3FA2C7', '#F0C808', …].
export function randomPalette() {
  const colors = []
  for (let i = 0; i < 5; i++) {
    colors.push(randomHex())
  }
  return colors
}
```

Ugyanaz a minta, mint a 3. lecke jelszógenerátorában: egy üres tömb, egy `for` [[ciklus]], ami ötször fut le, és a
`push`, ami minden körben egy új színt tesz a tömb végére.

Minden szín saját komponenst kap. Hozz létre az `src` mappában egy `components` mappát, benne a `Swatch.jsx` fájlt (a
swatch színmintát jelent, mint a festékboltban a színkártya):

```jsx file=src/components/Swatch.jsx
// Egyetlen szín a palettán: a háttere maga a szín, rajta a kódja.
function Swatch({ hex }) {
  return (
    <li className="swatch" style={{ background: hex }}>
      <span className="swatch__hex">{hex}</span>
    </li>
  )
}

export default Swatch
```

Az `App` a tömb `map` metódusával rajzol ki minden színt, ahogy az 1. leckében a készségeidet:

```jsx file=src/App.jsx mark=1,2,6,11-15
import { randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const colors = randomPalette()

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <ul className="swatches">
        {colors.map((hex, index) => (
          <Swatch key={index} hex={hex} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

- A `map` a tömb minden eleméből csinál valamit, és az eredményekből új tömböt ad: itt öt `<Swatch>` komponenst. A
  második paramétere, az `index`, azt mondja meg, hányadik elemnél tartunk (0-tól számolva).
- A [[key]] segít a Reactnek megkülönböztetni a lista elemeit, amikor a lista változik. Az 1. leckében a készség neve
  volt a kulcs. Itt az `index` is jó kulcs, mert az öt hely sosem cserél sorrendet, és egyik sem tűnik el: az első
  színmintából mindig az első marad, legfeljebb a színe változik. (Ha egy listából törölni is lehet, az index már nem jó
  kulcs; a kedvenceknél meglátod, miért.)
- A `<ul>` és a `<li>` miatt a paletta egy igazi lista: a képernyőolvasó be is mondja, hogy „lista, 5 elem”.

:::check Ellenőrizd
Öt színes oszlop áll egymás mellett, mindegyik alján a saját kódjával (telefonon öt sáv egymás alatt). Minden
frissítésre öt új szín jön.
:::

:::mistake Gyakori hiba
Kimarad a `key={index}`. Az oldal működik, de a konzolban figyelmeztetés jelenik meg: „Each child in a list should have
a unique "key" prop.” Minden `map`-pel készült listaelemnek kell kulcs.
:::

:::try Próbáld ki
Írd át a `randomPalette`-ben az 5-öt 8-ra: nyolc keskenyebb oszlop lesz, a CSS bármennyit elrendez. Aztán tedd vissza
5-re, mert a későbbi lépések öt színnel számolnak.
:::

### Új paletta egy kattintásra

Most még csak az újratöltés hoz új színeket. Ami az oldal használata közben változik, az [[állapot]], ahhoz pedig
`useState` kell. Az állapot ezúttal nem egy szám vagy egy szöveg, hanem egy egész tömb:

```jsx file=src/App.jsx mark=1,7,9-11,16-20
import { useState } from 'react'
import { randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)

  function generate() {
    setColors(randomPalette())
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          Új paletta
        </button>
      </div>

      <ul className="swatches">
        {colors.map((hex, index) => (
          <Swatch key={index} hex={hex} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

- A `useState(randomPalette)` magát a függvényt kapja, zárójel nélkül. Ez a 2. és a 3. leckéből ismert
  [[lusta kezdőérték]]: a React csak egyszer, az első rajzoláskor hívja meg, hogy megkapja a kezdő palettát.
- A `generate` egy vadonatúj tömböt ad a `setColors`-nak. A React ebből tudja, hogy változott az állapot, és
  újrarajzolja az `App`-ot az öt új színnel.
- A gomb két osztályt kap, szóközzel elválasztva: a `button` az alapstílus, a `button--primary` teszi kitöltötté.

:::check Ellenőrizd
A cím alatt megjelenik egy zöld „Új paletta” gomb. Minden kattintásra mind az öt szín és mind az öt kód kicserélődik.
:::

:::mistake Gyakori hiba
Bent marad a régi `const colors = randomPalette()` sor is az új `useState` mellett. Ekkor üres lesz az oldal, a Vite
pedig hibát jelez: a `colors` nevet már létrehozták („has already been declared”). Egy függvényen belül egy név csak
egyszer hozható létre.
:::

:::try Feladat
Tegyél az „Új paletta” mellé egy második gombot „Fekete-fehér” felirattal, ami ezt a palettát állítja be:
`['#000000', '#444444', '#888888', '#CCCCCC', '#FFFFFF']`. Ehhez egy második függvény kell, ami ezt a tömböt adja a
`setColors`-nak. Ha működik, töröld ki: a következő lépésekben megváltozik, mi van a tömbben.
:::

### Másolás a vágólapra

A palettából akkor lesz hasznos eszköz, ha a kódokat be tudod illeszteni a saját CSS-edbe vagy egy rajzprogramba. A 3.
leckében már írtál a vágólapra a böngésző [[Clipboard API]]-jával: a `navigator.clipboard.writeText(text)` egy
[[Promise]]-t ad vissza, ezt egy [[async függvényben|async függvény]] az `await` megvárja, a [[try/catch]] pedig
elkapja a hibát, ha a böngésző nem engedi a másolást.

Ott a gomb maga jelezte, hogy sikerült. Most egy közös üzenetsáv lesz a képernyő alján, mert később mást is másolunk
majd: a haladó szinten a teljes palettát CSS-ként, és egy megosztható linket. Mindegyik ugyanazt a `copy` függvényt és
ugyanazt az üzenetet használja, ezért ezek az `App`-ba kerülnek.

Előbb a színminta: a kódja gomb lesz, ami kattintásra meghívja az `onCopy` propot. Cseréld le az
`src/components/Swatch.jsx` tartalmát erre:

```jsx file=src/components/Swatch.jsx mark=1,2,5-12
// Egyetlen szín a palettán: a háttere maga a szín, a kódjára kattintva kimásolható.
function Swatch({ hex, onCopy }) {
  return (
    <li className="swatch" style={{ background: hex }}>
      <button
        type="button"
        className="swatch__hex"
        onClick={onCopy}
        aria-label={`${hex} másolása`}
      >
        {hex}
      </button>
    </li>
  )
}

export default Swatch
```

Az `aria-label` a képernyőolvasóknak szól: a gomb felirata csak egy kód, így viszont azt hallják, hogy „#3FA2C7
másolása, gomb”.

Most az `App`. Itt a teljes fájl, ahogy a kezdő szint végén kinéz:

```jsx file=src/App.jsx mark=1,8,10-16,22-29,42,46-48
import { useEffect, useState } from 'react'
import { randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')

  // Az üzenet két másodperc múlva magától eltűnik.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Takarítás: ha közben új üzenet jön, a régi időzítő leáll.
    return () => clearTimeout(timer)
  }, [message])

  function generate() {
    setColors(randomPalette())
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Vágólapra másolva: ${text}`)
    } catch {
      setMessage('A böngésző nem engedte a másolást.')
    }
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          Új paletta
        </button>
      </div>

      <ul className="swatches">
        {colors.map((hex, index) => (
          <Swatch key={index} hex={hex} onCopy={() => copy(hex)} />
        ))}
      </ul>

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

- A `copy` megkap egy szöveget, kiírja a vágólapra, és a `message` állapotban elmondja, mi történt.
- Az effekt a 3. leckéből ismerős: ha van üzenet, elindít egy időzítőt, ami két másodperc múlva üres szövegre állítja.
  Ha közben új üzenet jön, a [[takarító függvény]] leállítja a régi időzítőt, az effekt pedig újat indít.
- Az `onCopy={() => copy(hex)}` minden színmintának egy saját kis [[nyílfüggvényt|nyílfüggvény]] ad, ami emlékszik a
  saját színére. A `Swatch` nem tudja, mi történik a kattintás után: csak szól, hogy kattintottak.
- A `role="status"` miatt a képernyőolvasók felolvassák az üzenetet, amikor megváltozik. Amíg üres, a CSS elrejti.

:::check Ellenőrizd
Kattints egy kódra: alul megjelenik egy sötét sáv „Vágólapra másolva: #3FA2C7” szöveggel, és két másodperc múlva
eltűnik. Illeszd be (++Ctrl++ + ++V++) a szerkesztődbe: ott a kód. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
A kódra kattintva semmi sem történik, és hibaüzenet sincs. Ilyenkor szinte mindig az `App`-ból maradt ki az
`onCopy={() => copy(hex)}`: a `Swatch` `onCopy` propja `undefined`, és a gomb csendben nem csinál semmit. Ha egy
komponens új propot vár, azt a hívás helyén is meg kell adni.
:::

:::try Próbáld ki
Írd át az időzítőt 2000-ről 5000-re, és másolj ki gyorsan egymás után két különböző kódot. A második üzenet a teljes öt
másodpercig látszik: a takarítás leállította az első időzítőt, és az effekt újat indított. Aztán állítsd vissza.
:::

## Középszint {level=2}

### Színek zárolása

Gyakran egy-két szín már tetszik, csak a többi nem. A zárolt szín marad, amikor új palettát kérsz. Ehhez minden színnek
két dolgot kell tudnia magáról: a kódját, és azt, hogy zárolva van-e. Ezért a tömbben mostantól szövegek helyett
[[objektumok|objektum]] állnak:

```js
[
  { hex: '#3FA2C7', locked: false },
  { hex: '#F0C808', locked: true },
  { hex: '#DD1C1A', locked: false },
  // … és még kettő
]
```

Cseréld le az `src/colors.js` végén a `randomPalette` függvényt erre a kettőre:

```js file=src/colors.js mark=1,5,10-13
// Öt véletlen szín. Mindegyik egy objektum: a kódja, és hogy zárolva van-e.
export function randomPalette() {
  const colors = []
  for (let i = 0; i < 5; i++) {
    colors.push({ hex: randomHex(), locked: false })
  }
  return colors
}

// Új paletta a régiből: a zárolt színek maradnak, a többi helyére új kerül.
export function nextPalette(colors) {
  return colors.map((color) => (color.locked ? color : { hex: randomHex(), locked: false }))
}
```

A `nextPalette` a régi palettából készít újat. A `map` minden színnél megkérdezi: zárolva van? Ha igen, változatlanul
visszaadja; ha nem, egy új, véletlen színű objektumot tesz a helyére. A `feltétel ? ez : az` a 3. leckéből ismert
[[ternáris operátor]]. Az eredmény egy **új** tömb, a régihez a `map` hozzá sem nyúl.

A színminta mostantól egy egész `color` objektumot kap, a tetejére pedig egy lakatgomb kerül. Cseréld le az
`src/components/Swatch.jsx` tartalmát:

```jsx file=src/components/Swatch.jsx mark=1,2,4-13,18,20
// Egyetlen szín a palettán: fent a lakat, lent a kód, amire kattintva kimásolható.
function Swatch({ color, onCopy, onToggleLock }) {
  return (
    <li className="swatch" style={{ background: color.hex }}>
      <button
        type="button"
        className="swatch__lock"
        aria-pressed={color.locked}
        aria-label={`${color.hex} zárolása`}
        onClick={onToggleLock}
      >
        {color.locked ? '🔒' : '🔓'}
      </button>
      <button
        type="button"
        className="swatch__hex"
        onClick={onCopy}
        aria-label={`${color.hex} másolása`}
      >
        {color.hex}
      </button>
    </li>
  )
}

export default Swatch
```

Az `aria-pressed`-et a 2. lecke témagombjairól ismered: jelzi, hogy ez egy be- és kikapcsolható gomb, és éppen le van-e
nyomva. A képernyőolvasó ki is mondja („#3FA2C7 zárolása, kapcsológomb, lenyomva”), a CSS pedig erre figyel: a
lenyomott lakat keretet kap. A 🔒 és a 🔓 emoji, ugyanolyan szöveg, mint a betűk.

És az `App`:

```jsx file=src/App.jsx mark=2,19,22-25,46-52
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')

  // Az üzenet két másodperc múlva magától eltűnik.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Takarítás: ha közben új üzenet jön, a régi időzítő leáll.
    return () => clearTimeout(timer)
  }, [message])

  function generate() {
    setColors(nextPalette(colors))
  }

  function toggleLock(index) {
    // Új tömb: a kattintott helyen egy új objektum áll, a többi elem a régi.
    setColors(colors.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)))
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Vágólapra másolva: ${text}`)
    } catch {
      setMessage('A böngésző nem engedte a másolást.')
    }
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          Új paletta
        </button>
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

A lényeg a `toggleLock`. Egyetlen szín egyetlen mezőjét kell átállítani, mégis egy egész új tömb készül: a `map`
végigmegy a színeken, a kattintottnál (`i === index`) új objektumot ad, a többinél a régit. Az új objektum a 3. leckéből
ismert [[spread]]-del készül: a `{ ...color, locked: !color.locked }` lemásolja a régi objektumot, és felülírja benne a
`locked`-ot az ellentétére.

:::concept Miért nem írhatjuk át egyszerűen?
Kézenfekvőnek tűnik ez:

```jsx
colors[index].locked = true
setColors(colors)
```

Csakhogy nem történik semmi. A React úgy dönti el, hogy változott-e az állapot, hogy megnézi: **ugyanazt a tömböt**
kapta-e vissza. Itt ugyanazt kapja, csak belül átírva, ezért úgy látja, nincs változás, és nem rajzol újra. (A lakat
majd akkor ugrik át, amikor valami más miatt újrarajzol, ami még rosszabb: kiszámíthatatlan.) Ezért az állapotban lévő
tömböket és objektumokat sosem módosítjuk helyben, hanem mindig új példányt készítünk, amiben benne van a változás. Ez
a 6. leckéből ismert [[immutábilis frissítés]]. A `map`, a `filter` és a spread (`...`) új tömböt vagy objektumot ad,
ezért ezeket használjuk; a `push`, a `colors[0] = …` és a `color.locked = …` a régit írja át. (A `randomPalette`-ben
azért nyugodtan használhatjuk a `push`-t, mert ott egy vadonatúj tömböt töltünk fel, ami még nincs az állapotban.)
:::

:::check Ellenőrizd
Minden szín tetején megjelenik egy 🔓. Kattints a második szín lakatjára: 🔒 lesz belőle, és keretet kap. Nyomd meg az „Új
paletta” gombot: a második szín marad, a többi kicserélődik. Oldd fel, és a következő kattintásra az is változik.
:::

:::mistake Gyakori hiba
A `Swatch`-ban valahol `hex` maradt `color.hex` helyett. Az oldal ilyenkor üres, a konzolban pedig ez áll: „hex is not
defined”. A színminta mostantól csak `color`-t kap: a kód `color.hex`, a zárolás `color.locked`.
:::

:::try Feladat
Zárold mind az öt színt, és kérj új palettát: semmi sem változik. Tegyél az eszköztárba (a `toolbar` osztályú
`<div>`-be) egy „Összes feloldása” gombot. A minta ugyanaz, mint a `toggleLock`-ban, csak itt minden szín új
objektumot kap:
`colors.map((color) => ({ ...color, locked: false }))`. (Az objektum körüli kerek zárójel azért kell, hogy a JavaScript
ne a függvény törzsének higgye a kapcsos zárójelet.)
:::

### Szóközre új paletta

Egérrel kattintgatni lassú; a palettagenerátorokban a szóköz a megszokott gyorsbillentyű. Ehhez az oldalnak figyelnie
kell a billentyűzetet.

A 6. leckében a nyílbillentyűkkel már lapoztál: minden billentyű lenyomásakor a böngésző egy `keydown`
[[billentyűeseményt|billentyűesemény]] vált ki, az eseményobjektum pedig elárulja, melyik billentyű volt. Ott az
`event.key`-t nézted, ami a billentyű jelentése az aktuális kiosztásban (`'ArrowRight'`, `'a'`, a szóköznél `' '`).
Most az `event.code`-ot használjuk: ez a billentyű helye a billentyűzeten (`'Space'`, `'KeyA'`, `'Enter'`), így nem
függ a billentyűzetkiosztástól.

A szóköznek akkor is működnie kell, ha éppen nem a palettán áll a fókusz (a fókusz azon az elemen van, amelyik a
billentyűket kapja, például azon a gombon, amelyikre utoljára kattintottál), ezért az egész ablakot figyeljük:
`window.addEventListener('keydown', …)`. Az ablak kívül esik a React világán, ezért egy effekt teszi fel a figyelőt, a
takarítás pedig leveszi, ugyanúgy, mint a 6. leckében a nyilaknál (vagy az 1. leckében a `hashchange`, a 2. leckében
pedig a `matchMedia` `change` eseményénél). Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=18-28,31,36-38,57-59
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')

  // Az üzenet két másodperc múlva magától eltűnik.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Takarítás: ha közben új üzenet jön, a régi időzítő leáll.
    return () => clearTimeout(timer)
  }, [message])

  // Szóközre új paletta. A figyelőt egyszer tesszük fel, és a takarítás leveszi.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // ne görgessen az oldal, és ne nyomja meg a fókuszban lévő gombot
      if (event.repeat) return // nyomva tartott billentyűnél csak az első leütés számít
      setColors((current) => nextPalette(current))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function generate() {
    setColors((current) => nextPalette(current))
  }

  function toggleLock(index) {
    // Új tömb: a kattintott helyen egy új objektum áll, a többi elem a régi.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Vágólapra másolva: ${text}`)
    } catch {
      setMessage('A böngésző nem engedte a másolást.')
    }
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          Új paletta
        </button>
        <span className="toolbar__hint">
          vagy nyomd le a <kbd>Szóköz</kbd> billentyűt
        </span>
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

Sorról sorra:

- `if (event.code !== 'Space') return`: minden más billentyűt figyelmen kívül hagyunk.
- `event.preventDefault()`: az 1. lecke űrlapjából ismerős (a 4. és a 6. leckében is ott volt). Letiltja a böngésző
  [[alapértelmezett viselkedését|alapértelmezett viselkedés]]: ott az újratöltést, itt a szóköz két szokásos hatását. A
  szóköz magától lejjebb görgeti az oldalt, és ha egy gombon áll a fókusz (például mert az előbb rákattintottál egy
  lakatra), meg is nyomja azt a gombot. Egyiket sem akarjuk: nálunk a szóköz azt jelenti, „új paletta”. (Aki a
  ++Tab++-bal lép a gombokra, az ++Enter++-rel továbbra is meg tudja nyomni őket.)
- `if (event.repeat) return`: ha nyomva tartod a billentyűt, a böngésző másodpercenként sokszor megismétli a
  `keydown`-t, ilyenkor az `event.repeat` igaz. Csak az első leütés számít, különben a paletta őrülten villogna.
- A `setColors` most nem egy kész tömböt kap, hanem egy függvényt: `(current) => nextPalette(current)`. Erről szól a
  lenti doboz.
- A `[]` [[függőségi tömb]] miatt az effekt csak egyszer fut le: a figyelő egyszer kerül fel, és ott marad, amíg az
  `App` az oldalon van.

A gomb mellé egy kis tipp is került: a `<kbd>` HTML-elem egy billentyűt jelöl, a CSS billentyűsapkának rajzolja.

:::concept A frissítő függvény újra: mindig a legfrissebb állapot
A `handleKeyDown` függvény az első rajzoláskor készül el, és mivel az effekt nem fut le újra, végig ugyanaz a példány
figyel. Egy függvény mindig azokat a változókat látja, amelyek ott voltak, ahol létrejött; ezt hívják [[closure]]-nek.
Ha a figyelőben `setColors(nextPalette(colors))` állna, a `colors` örökre az első rajzolás palettája maradna, ahogy
a 6. leckében az `index` a 0: a szóköz mindig abból a legelső, zárolatlan palettából sorsolna újat, és semmibe venné a
lakatokat.

A megoldás ugyanaz, mint a 6. leckében, a [[frissítő függvény]]: ha a `setColors` egy függvényt kap, a React azt a
**mostani** állapottal hívja meg (ez a `current`), és amit a függvény visszaad, az lesz az új állapot. Így a figyelőnek
nem kell tudnia, mi a paletta: a React megmondja neki. Jó szokás mindig így írni, ha az új állapotot a régiből
számoljuk ki, ezért a `generate` és a `toggleLock` is ezt a formát kapta.
:::

:::check Ellenőrizd
Nyomd meg a ++Szóköz++-t: új paletta jön, és az oldal nem görget. Zárolj egy színt, és nyomj ++Szóköz++-t: a zárolt
szín marad. Kattints egy lakatra, aztán nyomd meg a ++Szóköz++-t: a paletta változik, a lakat viszont nem kapcsol
vissza. Ha nyomva tartod a billentyűt, csak egyszer vált.
:::

:::mistake Gyakori hiba
`event.code !== 'space'`, kisbetűvel. A feltétel így minden billentyűre igaz, a függvény mindig a legelején kilép, a
szóköz pedig a régi módon görget, vagy megnyomja a fókuszban lévő gombot. Az `event.code` értékei nagybetűvel
kezdődnek:
`'Space'`, `'Enter'`, `'KeyA'`.
:::

:::try Próbáld ki
Írd a `handleKeyDown` első sorába: `console.log(event.code, event.key)`. Nyisd meg a konzolt, kattints az oldalra, és
nyomj meg néhány billentyűt, például az ++A++-t, a ++Shift++-et, az ++Enter++-t és a nyilakat. Látod, hogy a `code` a
billentyű helye, a `key` pedig a jelentése (betűnél az, amit beírna). Aztán töröld a sort.
:::

### Kedvencek

Ha összeállt egy szép paletta, mentsük el. A kedvencek listája egy újabb tömb az állapotban, és minden kedvenc maga is
egy tömb: az öt színkód, például `['#3FA2C7', '#F0C808', …]`. Tömbök tömbje.

A lista saját komponenst kap. Hozd létre az `src/components/Favorites.jsx` fájlt:

```jsx file=src/components/Favorites.jsx
// A mentett paletták: mindegyik egy színcsík, amire kattintva betöltődik a paletta, mellette egy törlőgomb.
function Favorites({ favorites, onLoad, onRemove }) {
  return (
    <section className="favorites">
      <h2>Kedvencek ({favorites.length})</h2>
      {favorites.length === 0 ? (
        <p className="favorites__empty">
          Még nincs mentett paletta. Ha tetszik egy, nyomd meg a „Mentés a kedvencekhez” gombot.
        </p>
      ) : (
        <ul className="favorites__list">
          {favorites.map((favorite) => (
            <li key={favorite.join()} className="favorite">
              <button
                type="button"
                className="favorite__colors"
                aria-label={`Betöltés: ${favorite.join(', ')}`}
                onClick={() => onLoad(favorite)}
              >
                {favorite.map((hex, index) => (
                  <span key={index} style={{ background: hex }} />
                ))}
              </button>
              <button
                type="button"
                className="favorite__remove"
                aria-label={`Törlés: ${favorite.join(', ')}`}
                onClick={() => onRemove(favorite)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Favorites
```

- A `favorites.length === 0 ? (…) : (…)` [[feltételes megjelenítés]]: amíg nincs kedvenc, egy rövid magyarázat jelenik
  meg, utána a lista. Az üres állapotot mindig érdemes megtervezni, így a látogató tudja, mire való az a rész.
- Minden kedvenc egy gomb, benne öt színes csíkkal (`<span>`); a kattintás betölti a palettát. Mellette egy kis ×
  gomb törli.
- A `favorite.join(', ')` egyetlen szöveggé fűzi a tömb elemeit, vesszővel és szóközzel elválasztva: ebből lesz a
  képernyőolvasóknak szóló felirat.
- A kulcs itt **nem** az index. A kedvencek közül törölni is lehet: ha a második helyről törölsz, a harmadikból második
  lesz, és minden index elcsúszik, a React pedig összekeverné, melyik elem melyik. Ezért a kulcs maga a paletta
  szövegként, a `favorite.join()` (a `join` paraméter nélkül vesszőt tesz az elemek közé). Ez minden kedvencnél más,
  mert ugyanazt a palettát nem engedjük kétszer elmenteni. A színcsíkoknál viszont jó az index: azok sosem cserélnek
  helyet.

Az `App` egy új állapotot kap a kedvenceknek, és három új függvényt:

```jsx file=src/App.jsx mark=4,10,12-14,56-69,94-98,100
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useState([])

  // Ezeket minden rajzoláskor az állapotból számoljuk ki.
  const hexes = colors.map((color) => color.hex)
  const isSaved = favorites.some((favorite) => favorite.join() === hexes.join())

  // Az üzenet két másodperc múlva magától eltűnik.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Takarítás: ha közben új üzenet jön, a régi időzítő leáll.
    return () => clearTimeout(timer)
  }, [message])

  // Szóközre új paletta. A figyelőt egyszer tesszük fel, és a takarítás leveszi.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // ne görgessen az oldal, és ne nyomja meg a fókuszban lévő gombot
      if (event.repeat) return // nyomva tartott billentyűnél csak az első leütés számít
      setColors((current) => nextPalette(current))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function generate() {
    setColors((current) => nextPalette(current))
  }

  function toggleLock(index) {
    // Új tömb: a kattintott helyen egy új objektum áll, a többi elem a régi.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Vágólapra másolva: ${text}`)
    } catch {
      setMessage('A böngésző nem engedte a másolást.')
    }
  }

  function saveFavorite() {
    // Új tömb: elöl a mostani paletta, mögötte a régi kedvencek.
    setFavorites((current) => [hexes, ...current])
  }

  function removeFavorite(favorite) {
    // Új tömb, amiből kimarad a törölt kedvenc.
    setFavorites((current) => current.filter((item) => item !== favorite))
  }

  function loadFavorite(favorite) {
    // A mentett szövegekből újra színobjektumok lesznek, zárolás nélkül.
    setColors(favorite.map((hex) => ({ hex, locked: false })))
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          Új paletta
        </button>
        <span className="toolbar__hint">
          vagy nyomd le a <kbd>Szóköz</kbd> billentyűt
        </span>
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="button" onClick={saveFavorite} disabled={isSaved}>
          {isSaved ? 'Elmentve ✓' : 'Mentés a kedvencekhez'}
        </button>
      </div>

      <Favorites favorites={favorites} onLoad={loadFavorite} onRemove={removeFavorite} />

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

- A `hexes` és az `isSaved` [[származtatott értékek|származtatott érték]], mint a 3. leckében az erősség: minden
  rajzoláskor az állapotból számoljuk őket, nem tároljuk külön. A `some` akkor igaz, ha a tömb legalább egy elemére igaz
  a feltétel: itt akkor, ha valamelyik kedvenc betűre ugyanaz, mint a mostani paletta.
- A `saveFavorite` új tömböt ad: `[hexes, ...current]`. A [[spread]] itt is tömbön dolgozik, mint a 6. leckében a
  `[...decks, newDeck]`: a `...current` a régi tömb összes elemét kiteríti az újba, elé pedig a mostani paletta kerül.
  Így a legújabb kedvenc áll elöl.
- A `removeFavorite` a `filter`-rel készít új tömböt. Ebbe csak azok az elemek kerülnek, amelyekre a feltétel igaz,
  vagyis mindegyik, amelyik nem a törölt kedvenc. A `!==` itt nem a színeket hasonlítja össze, hanem azt nézi, hogy az
  `item` és a `favorite` két különböző tömb-e. A kedvenc, amelyiknek a törlésére kattintottál, pontosan ugyanaz az
  elem, ami a listában van, ezért csak ő marad ki.
- A `loadFavorite` a szövegekből újra objektumokat készít. Az `({ hex, locked: false })` körüli kerek zárójel azért
  kell, hogy a JavaScript objektumnak lássa a kapcsos zárójelet, ne a függvény törzsének. A `{ hex }` a `{ hex: hex }`
  rövidítése, mint a 2. leckében a `return { theme, setTheme }`.
- A mentés gombja `disabled` (nem kattintható), ha a paletta már a kedvencek között van, és a felirata is ezt mondja.

:::check Ellenőrizd
A paletta alatt megjelenik egy „Mentés a kedvencekhez” gomb, alatta a „Kedvencek (0)” rész a magyarázattal. Mentsd el
a palettát: megjelenik egy színes csík, a szám 1 lesz, a gomb pedig szürke és „Elmentve ✓”. Kérj új palettát, mentsd
azt is, aztán kattints a második csíkra: visszakapod az első palettát, és a gomb megint „Elmentve ✓”. A × törli a
kedvencet. Most frissítsd az oldalt: a kedvencek eltűntek. Ezt javítjuk a következő lépésben.
:::

:::mistake Gyakori hiba
`favorites.push(hexes)`, aztán `setFavorites(favorites)`. Nem jelenik meg semmi, mert a `push` a régi tömböt írta át, a
React pedig ugyanazt a tömböt kapta vissza. Ugyanaz a csapda, mint a lakatoknál: mindig új tömb kell.
:::

:::try Feladat
Legfeljebb 12 kedvenc legyen: a `saveFavorite`-ben az új tömbből csak az első 12 elemet tartsd meg, az 5. leckéből
ismert `slice(0, 12)`-vel. A `slice` is új tömböt ad, a régit nem bántja.
:::

### Megmaradó kedvencek

Az állapot csak addig él, amíg az oldal nyitva van. A 2. leckében a böngésző [[localStorage]] tárolójába mentetted a
témát, a 6. leckében pedig egy `useLocalStorage` hookot írtál, ami ugyanezt bármilyen állapottal megcsinálja. Most a
kedvencek kerülnek bele.

A `localStorage` csak szöveget tud tárolni, a kedvencek viszont tömbök. A [[JSON]] egy szöveges formátum, amiben
tömbök és objektumok is leírhatók: a `JSON.stringify` szöveggé alakítja a tömböt (`'[["#3FA2C7","#F0C808",…]]'`), a
`JSON.parse` pedig visszaalakítja.

Hozd létre az `src/useLocalStorage.js` fájlt. Ha a 6. leckéből megvan a `src/useLocalStorage.js`, egyszerűen másold át
ide: ugyanaz a hook (alapértelmezett export, két paraméter: a kulcs és a kezdőérték).

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

Ez a 6. leckéből ismert [[saját hook]]. Röviden felidézve, mit csinál:

- Az első rajzoláskor a `readSaved` megnézi, van-e mentett érték a kulcs alatt. Ha van, a `JSON.parse` visszaalakítja;
  ha nincs, vagy hibás (például valaki kézzel átírta), a `startValue`-t, a kezdőértéket kapjuk.
- Az effekt minden változás után elmenti az értéket, a `JSON.stringify`-jal szöveggé alakítva.
- A hook ugyanazt a párt adja vissza, mint a `useState`: az értéket és a beállító függvényt. A beállító ugyanúgy
  elfogad frissítő függvényt is, ezért az `App`-ban elég egy importot hozzáadni és egy sort átírni.
- Mindkét helyen [[try/catch]] védi a kódot: a böngésző letilthatja a tárolót, és az oldalnak ilyenkor is működnie
  kell, csak nem emlékszik.

Az `src/App.jsx` elején importáld a hookot, és cseréld le vele a kedvencek `useState`-jét. A fájl többi része marad,
ahogy volt:

```jsx file=src/App.jsx mark=3,11
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import useLocalStorage from './useLocalStorage.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useLocalStorage('color-palette-favorites', [])
```

A kulcs, a `'color-palette-favorites'`, a lecke nevével kezdődik. Erre azért van szükség, mert a `localhost:5173`-on
futó összes projekted ugyanazt a tárolót látja: így ez a mentés nem keveredik össze egy másik leckéével.

:::check Ellenőrizd
Ments el két palettát, és frissítsd az oldalt: a kedvencek megmaradtak. A fejlesztői eszközökben (++F12++) az
Application → Local storage → `http://localhost:5173` alatt ott a `color-palette-favorites` kulcs, az értéke pedig egy
JSON-szöveg a színkódokkal. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Kimarad a `JSON.stringify` a mentésből. A `localStorage` ilyenkor magától szöveggé alakítja a tömböt, csak éppen JSON
helyett vesszőkkel összefűzve: `#3FA2C7,#F0C808,…`. Ezt a `JSON.parse` nem érti, ezért újratöltéskor a `catch` ág fut
le, és a kedvencek üresen indulnak, mintha sosem mentetted volna őket.
:::

:::try Próbáld ki
Nyisd meg az oldalt egy második böngészőlapon is. Ments el egy palettát az egyiken, aztán frissítsd a másikat: ott is
megjelenik, mert a két lap ugyanazt a tárolót használja.
:::

## Haladó szint {level=3}

### HSL: színek a színkörön

Az RGB a képernyőnek kényelmes, egy embernek kevésbé. Mondd meg fejből, mit kell átírni a `#3FA2C7`-ben, hogy ugyanez
a kék egy kicsit világosabb legyen! A [[HSL]] ugyanazt a színt három emberibb számmal írja le:

- **H**ue, színárnyalat: hol áll a szín a [[színkörön|színkör]], 0 és 360 fok között. A 0° vörös, a 60° sárga, a 120°
  zöld, a 180° türkiz, a 240° kék, a 300° lila, 360°-nál pedig újra vörös.
- **S**aturation, telítettség: 0% a szürke, 100% a legélénkebb.
- **L**ightness, világosság: 0% a fekete, 50% a tiszta szín, 100% a fehér.

A CSS közvetlenül is érti, például így: `hsl(200 70% 50%)`. Nekünk viszont továbbra is hex kód kell, mert azt mutatjuk
és azt másoljuk. Ezért egy függvény átváltja a HSL-t RGB-re, az RGB-ből pedig a meglévő `rgbToHex` készít hex kódot.

Erre az átváltásra van egy jól ismert képlet. Nem kell fejből tudnod (a legtöbb fejlesztő is kikeresi, ha kell), a
megjegyzések elmondják, mit csinál: a színkört hat 60 fokos szeletre osztja, és minden szeletben máshogy keveri a három
csatornát. Ha már itt tartunk, a véletlen színeket is HSL-ben sorsoljuk, így megadhatjuk, hogy ne legyenek se fakók, se
túl sötétek, se túl világosak. Az RGB-sorsolás gyakran ad sárszínű, szinte fekete vagy szinte fehér színeket.

Itt a teljes `src/colors.js`:

```js file=src/colors.js mark=6-9,21-41,43-46,48,50,51
// Véletlen egész szám 0-tól max - 1-ig (ugyanaz, mint a 3. leckében).
export function randomInt(max) {
  return Math.floor(Math.random() * max)
}

// Véletlen tört szám min és max között.
function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

// Egy 0 és 255 közötti szám két hexadecimális jeggyel: 10 → '0a', 255 → 'ff'.
function toHex(value) {
  return Math.round(value).toString(16).padStart(2, '0')
}

// A három csatornából (vörös, zöld, kék, mindegyik 0–255) hex kód: 255, 136, 0 → '#FF8800'.
export function rgbToHex(red, green, blue) {
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase()
}

// HSL-ből hex kód. h: 0–360 fok a színkörön; s és l: 0–100 százalék.
export function hslToHex(h, s, l) {
  const light = l / 100
  // Mennyi „szín” fér bele ebbe a világosságba: 50%-nál a legtöbb, a fekete és a fehér felé egyre kevesebb.
  const chroma = (1 - Math.abs(2 * light - 1)) * (s / 100)
  // A második legerősebb csatorna: attól függ, hol jár a h a 60 fokos szeleten belül.
  const middle = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  // Ennyit kap mindhárom csatorna, hogy kijöjjön a kért világosság.
  const base = light - chroma / 2
  // A színkör hat 60 fokos szelete: mindegyikben más a csatornák sorrendje.
  const slices = [
    [chroma, middle, 0], // 0–60°: vörösből sárgába
    [middle, chroma, 0], // 60–120°: sárgából zöldbe
    [0, chroma, middle], // 120–180°: zöldből türkizbe
    [0, middle, chroma], // 180–240°: türkizből kékbe
    [middle, 0, chroma], // 240–300°: kékből lilába
    [chroma, 0, middle], // 300–360°: lilából vörösbe
  ]
  const [red, green, blue] = slices[Math.floor(h / 60) % 6]
  return rgbToHex((red + base) * 255, (green + base) * 255, (blue + base) * 255)
}

// Véletlen szín HSL-ben: bármilyen árnyalat, de se nem fakó, se nem túl sötét, se nem túl világos.
function randomHsl() {
  return [randomInt(360), randomBetween(45, 85), randomBetween(32, 80)]
}

// Egy véletlen szín, mostantól a színkörről.
export function randomHex() {
  const [h, s, l] = randomHsl()
  return hslToHex(h, s, l)
}

// Öt véletlen szín. Mindegyik egy objektum: a kódja, és hogy zárolva van-e.
export function randomPalette() {
  const colors = []
  for (let i = 0; i < 5; i++) {
    colors.push({ hex: randomHex(), locked: false })
  }
  return colors
}

// Új paletta a régiből: a zárolt színek maradnak, a többi helyére új kerül.
export function nextPalette(colors) {
  return colors.map((color) => (color.locked ? color : { hex: randomHex(), locked: false }))
}
```

- A `randomBetween` a `randomInt` testvére, csak tört számot ad: a telítettségnek és a világosságnak nem kell egésznek
  lennie.
- A `Math.abs` egy szám abszolút értékét adja, vagyis elhagyja az előjelét: a `Math.abs(-0.4)` és a `Math.abs(0.4)`
  értéke is `0.4`.
- A `slices[Math.floor(h / 60) % 6]` választja ki, melyik szeletben jár a szín: 200 foknál a `Math.floor(200 / 60)`
  értéke 3, vagyis a türkiztől a kék felé tartó szelet. A `%` a 3. leckéből ismert maradékos osztás ([[modulo]]): a
  `% 6` a 360 fokot visszaviszi a 0-ra.
- A `const [h, s, l] = randomHsl()` egy tömböt bont három változóra. Ez a tömbös [[destrukturálás]]: ugyanezt csinálod
  minden `useState` sorban is, `const [colors, setColors] = …`.
- A `randomHsl` sincs exportálva: csak ennek a fájlnak a belső segédje.

:::check Ellenőrizd
Kérj néhány új palettát: a színek élénkebbek, és eltűntek a sárszínű, szinte fekete és szinte fehér színek. Minden más
ugyanúgy működik: a lakatok, a másolás és a kedvencek is.
:::

:::mistake Gyakori hiba
`hslToHex(200, 0.7, 0.5)`. Sok képlet és könyvtár 0 és 1 közötti számokkal adja meg a telítettséget és a világosságot,
nálunk viszont ezek százalékok, 0 és 100 között. A 0,5-ös világosság így fél százalék: majdnem fekete. Ha minden színed
szinte fekete, ezt nézd meg először.
:::

:::try Próbáld ki
Írd át a `randomHsl`-ben a világosság határait `75, 90`-re: pasztellpaletták jönnek. Ha `15, 35`-re állítod, sötét,
éjszakai palettákat kapsz. Aztán állítsd vissza.
:::

### Harmonikus paletták

A véletlen paletta néha telitalálat, gyakrabban kusza. A [[színharmónia]] szabályai a színkörön mért távolságokból
mondják meg, mely színek mutatnak jól együtt:

- **Analóg**: szomszédok a körön (±20–40 fok), például zöldek és kékek. Nyugodt, egységes.
- **Komplementer**: egy szín és a vele szemben álló párja (+180 fok), például kék és narancs. Erős kontraszt.
- **Monokróm**: egyetlen árnyalat, különböző világosságokkal. Elegáns, visszafogott.

Mindegyik egy alapszínből indul. Ha van zárolt színed, az első zárolt lesz az alapszín, így a többi hozzá illeszkedik;
ha nincs, véletlen alapszínt sorsolunk. Ehhez a hex kódból vissza kell tudnunk számolni a színárnyalatot.

Cseréld le az `src/colors.js` végén a `nextPalette` függvényt erre a blokkra:

```js file=src/colors.js
// Bármilyen szöget visszahoz 0 és 360 fok közé: -20 → 340, 400 → 40.
function wrapHue(h) {
  return ((h % 360) + 360) % 360
}

// Hex kódból a három csatorna: '#FF8800' → [255, 136, 0].
export function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

// Hol áll a szín a színkörön (0–360 fok)? A legerősebb csatornából és a másik kettő arányából derül ki.
export function hexToHue(hex) {
  const [red, green, blue] = hexToRgb(hex)
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  if (max === min) return 0 // szürke: nincs színárnyalata
  let hue
  if (max === red) hue = (green - blue) / (max - min)
  else if (max === green) hue = 2 + (blue - red) / (max - min)
  else hue = 4 + (red - green) / (max - min)
  return wrapHue(hue * 60)
}

// Minden harmónia az alapszínből öt [h, s, l] hármast készít.
const HARMONIES = {
  random: () => [randomHsl(), randomHsl(), randomHsl(), randomHsl(), randomHsl()],
  // Szomszédok a színkörön, sötéttől világosig.
  analogous: (hue) => [
    [hue - 40, randomBetween(55, 75), 30],
    [hue - 20, randomBetween(55, 75), 44],
    [hue, randomBetween(55, 75), 56],
    [hue + 20, randomBetween(55, 75), 68],
    [hue + 40, randomBetween(55, 75), 82],
  ],
  // Az alapszín és a színkörön vele szemben álló párja (+180 fok).
  complementary: (hue) => [
    [hue, randomBetween(55, 75), 28],
    [hue, randomBetween(55, 75), 48],
    [hue, randomBetween(30, 50), 82],
    [hue + 180, randomBetween(55, 75), 62],
    [hue + 180, randomBetween(60, 80), 42],
  ],
  // Egyetlen árnyalat öt világosságban.
  monochrome: (hue) => [18, 34, 50, 66, 84].map((light) => [hue, randomBetween(45, 70), light]),
}

// Új paletta a választott harmónia szerint. A zárolt színek maradnak,
// és ha van zárolt szín, az első lesz az alapszín.
export function nextPalette(colors, harmony) {
  const anchor = colors.find((color) => color.locked)
  const baseHue = anchor ? hexToHue(anchor.hex) : randomInt(360)
  const fresh = HARMONIES[harmony](baseHue)
  return colors.map((color, i) => {
    if (color.locked) return color
    const [h, s, l] = fresh[i]
    return { hex: hslToHex(wrapHue(h), s, l), locked: false }
  })
}
```

- A `wrapHue` bármilyen szöget visszahoz 0 és 360 közé: ha az alapszín 20 fokon áll, a `20 - 40` eredménye −20 fok,
  ami a körön 340 fok. A `+ 360` és a második `% 360` a negatív számok miatt kell: a `-20 % 360` ugyanis −20 marad.
- A `hexToRgb` a hex kód három párját alakítja vissza számmá: a `slice(1, 3)` az 1-es és a 2-es sorszámú karaktert
  vágja ki (0-tól számolva; a 3-as már nem kerül bele), vagyis a `#` utáni kettőt (`'FF'`), a `parseInt(…, 16)` pedig
  tizenhatos számrendszerben olvassa be (`255`).
- A `hexToHue` megkeresi a legerősebb csatornát, és abból, ahogy a másik kettő hozzá aránylik, kiszámolja, hol áll a
  szín a körön. Ezt is elég nagyjából érteni.
- A `HARMONIES` egy objektum, amelynek az értékei függvények. Mindegyik az alapszínből öt `[h, s, l]` hármast készít. A
  `HARMONIES[harmony]` név szerint kiválasztja az egyiket, a mögötte álló `(baseHue)` pedig meg is hívja.
- A `find` a tömb első olyan elemét adja, amelyre a feltétel igaz, vagy `undefined`-ot, ha nincs ilyen. Az `anchor ?
  … : …` ezért így dönthet: van zárolt szín, vagy nincs.

A harmónia választója négy gomb lesz, amelyek közül egy lehet lenyomva. Hozd létre az
`src/components/HarmonyPicker.jsx` fájlt:

```jsx file=src/components/HarmonyPicker.jsx
// A választható harmóniák: a kulcsok ugyanazok, mint a colors.js HARMONIES objektumában.
const HARMONY_NAMES = {
  random: 'Véletlen',
  analogous: 'Analóg',
  complementary: 'Komplementer',
  monochrome: 'Monokróm',
}

function HarmonyPicker({ harmony, onChange }) {
  return (
    <div className="harmony" role="group" aria-label="Harmónia">
      {Object.keys(HARMONY_NAMES).map((key) => (
        <button
          key={key}
          type="button"
          className="chip"
          aria-pressed={harmony === key}
          onClick={() => onChange(key)}
        >
          {HARMONY_NAMES[key]}
        </button>
      ))}
    </div>
  )
}

export default HarmonyPicker
```

Az `Object.keys(HARMONY_NAMES)` az objektum kulcsait adja (`['random', 'analogous', 'complementary', 'monochrome']`), a
`map` pedig mindegyikből egy gombot készít, ahogy a 3. leckében a jelölőnégyzeteket (`Object.keys(LABELS).map(…)`). A
`role="group"` és az `aria-label` egy névvel ellátott csoportba fogja a gombokat, így a képernyőolvasó elmondja,
mire valók. Az `aria-pressed` ugyanaz, mint a lakatnál: a lenyomott gomb kitöltve látszik.

Az `App`-ban a harmónia egy újabb állapot. Itt a teljes fájl:

```jsx file=src/App.jsx mark=6,13,27,33,37,40,43-47,90
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import useLocalStorage from './useLocalStorage.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import HarmonyPicker from './components/HarmonyPicker.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useLocalStorage('color-palette-favorites', [])
  const [harmony, setHarmony] = useState('random')

  // Ezeket minden rajzoláskor az állapotból számoljuk ki.
  const hexes = colors.map((color) => color.hex)
  const isSaved = favorites.some((favorite) => favorite.join() === hexes.join())

  // Az üzenet két másodperc múlva magától eltűnik.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Takarítás: ha közben új üzenet jön, a régi időzítő leáll.
    return () => clearTimeout(timer)
  }, [message])

  // Szóközre új paletta. Ha változik a harmónia, a takarítás leveszi a régi figyelőt, és új kerül a helyére.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // ne görgessen az oldal, és ne nyomja meg a fókuszban lévő gombot
      if (event.repeat) return // nyomva tartott billentyűnél csak az első leütés számít
      setColors((current) => nextPalette(current, harmony))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [harmony])

  function generate() {
    setColors((current) => nextPalette(current, harmony))
  }

  function changeHarmony(newHarmony) {
    setHarmony(newHarmony)
    // A newHarmony kell: a harmony állapotban itt még a régi érték van.
    setColors((current) => nextPalette(current, newHarmony))
  }

  function toggleLock(index) {
    // Új tömb: a kattintott helyen egy új objektum áll, a többi elem a régi.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Vágólapra másolva: ${text}`)
    } catch {
      setMessage('A böngésző nem engedte a másolást.')
    }
  }

  function saveFavorite() {
    // Új tömb: elöl a mostani paletta, mögötte a régi kedvencek.
    setFavorites((current) => [hexes, ...current])
  }

  function removeFavorite(favorite) {
    // Új tömb, amiből kimarad a törölt kedvenc.
    setFavorites((current) => current.filter((item) => item !== favorite))
  }

  function loadFavorite(favorite) {
    // A mentett szövegekből újra színobjektumok lesznek, zárolás nélkül.
    setColors(favorite.map((hex) => ({ hex, locked: false })))
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          Új paletta
        </button>
        <span className="toolbar__hint">
          vagy nyomd le a <kbd>Szóköz</kbd> billentyűt
        </span>
        <HarmonyPicker harmony={harmony} onChange={changeHarmony} />
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="button" onClick={saveFavorite} disabled={isSaved}>
          {isSaved ? 'Elmentve ✓' : 'Mentés a kedvencekhez'}
        </button>
      </div>

      <Favorites favorites={favorites} onLoad={loadFavorite} onRemove={removeFavorite} />

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

- A `nextPalette` mostantól két paramétert vár, ezért mindegyik hívása megkapja a harmóniát is.
- A `changeHarmony` rögtön új palettát is kér, mégpedig a `newHarmony`-val, mert a `harmony` állapotban ebben a
  függvényben még a régi érték van (pont úgy, mint a 3. lecke csúszkájánál).
- A billentyűfigyelő effekt függőségi tömbjébe bekerült a `harmony`. Amikor megváltozik, a React lefuttatja a
  takarítást (leveszi a régi figyelőt, ami még a régi harmóniát ismeri), aztán újra az effektet (feltesz egy újat, ami
  már az újat ismeri).

:::check Ellenőrizd
Az „Új paletta” sorában (telefonon alatta) négy gomb jelenik meg: Véletlen, Analóg, Komplementer, Monokróm. A
„Véletlen” ki van töltve, mert az a kezdőérték. Kattints az „Analóg”-ra: a színek a színkör szomszédai, sötéttől
világosig. A „Komplementer” két szemben álló árnyalatot ad, a „Monokróm” egyetlen árnyalat öt világosságát. Válaszd a
„Monokróm”-ot, zárolj egy színt, ami tetszik, és nyomkodd a ++Szóköz++-t: mindig a zárolt szín világosabb és sötétebb
változatai jönnek.
:::

:::mistake Gyakori hiba
Kimarad a `harmony` a billentyűfigyelő effekt függőségi tömbjéből. A gombok rendben működnek, a szóköz viszont
továbbra is véletlen palettákat ad, akármit választasz: a figyelő az első rajzoláskor jött létre, és csak az akkori
harmóniát ismeri. Ugyanaz a [[closure]]-csapda, mint az előző szinten a `colors`-szal. A frissítő függvény itt nem
segít: az csak a `colors` legfrissebb értékét adja meg, a `harmony`-ét nem. Ezért kell a `harmony` a függőségi tömbbe.
:::

:::try Feladat
Adj hozzá egy ötödik harmóniát, a triádot: három árnyalat, egymástól 120 fokra. Ez kerül a `colors.js`
`HARMONIES` objektumába, a `monochrome` sora után:

```js
  triadic: (hue) => [
    [hue, 70, 45],
    [hue, 55, 75],
    [hue + 120, 65, 50],
    [hue + 240, 65, 50],
    [hue + 240, 55, 78],
  ],
```

A `HarmonyPicker.jsx` `HARMONY_NAMES` objektumába pedig ez: `triadic: 'Triád',`. Ennyi: a gomb és a szóköz is működik
vele.
:::

### Kontrasztellenőrzés (WCAG)

A kód eddig egy fehér címkén ült, hogy minden színen olvasható legyen. Egy paletta színeire viszont általában szöveg is
kerül, ezért jó tudni, hogy egy színen sötét vagy világos szöveg olvasható-e jobban, és mennyire.

Erre a [[WCAG]] (Web Content Accessibility Guidelines, a webes akadálymentesség nemzetközi irányelvei) ad mércét, a
[[kontrasztarányt|kontrasztarány]]. Ez 1:1 (két egyforma szín) és 21:1 (fekete a fehéren) között mozog. Normál méretű
szövegnél legalább 4,5:1 kell az **AA** szinthez, és 7:1 az **AAA**-hoz.

Az arányhoz mindkét szín [[relatív fénysűrűségét|relatív fénysűrűség]] ismernünk kell: azt, hogy mennyire látjuk
világosnak, 0 (fekete) és 1 (fehér) között. A szemünk nem egyformán érzékeny a három színre: a zöldet látjuk a
legvilágosabbnak, a kéket a legsötétebbnek, ezért a képlet a zöldet szorozza a legnagyobb számmal. Írd ezeket az
`src/colors.js` végére:

```js file=src/colors.js
// Egy csatorna (0–255) fényereje úgy, ahogy a szem érzékeli (a WCAG képlete).
function channelLuminance(value) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

// Relatív fénysűrűség: 0 a fekete, 1 a fehér. A zöld számít a legtöbbet, a kék a legkevesebbet.
export function luminance(hex) {
  const [red, green, blue] = hexToRgb(hex)
  return 0.2126 * channelLuminance(red) + 0.7152 * channelLuminance(green) + 0.0722 * channelLuminance(blue)
}

// Két szín kontrasztaránya: 1 (nincs különbség) és 21 (fekete a fehéren) között.
export function contrast(a, b) {
  const lighter = Math.max(luminance(a), luminance(b))
  const darker = Math.min(luminance(a), luminance(b))
  return (lighter + 0.05) / (darker + 0.05)
}

const DARK_INK = '#111111'
const LIGHT_INK = '#FFFFFF'

// Sötét vagy világos szöveg: amelyik jobban olvasható ezen a háttéren.
export function readableInk(hex) {
  return contrast(hex, DARK_INK) >= contrast(hex, LIGHT_INK) ? DARK_INK : LIGHT_INK
}

// A WCAG szintje normál méretű szövegre.
export function wcagLevel(ratio) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'Gyenge'
}
```

- A `channelLuminance` a képernyő fényerejét olyan számmá alakítja, ami arányos azzal, amit a szem lát. A `**` a
  hatványozás, mint a 3. leckében a `2 ** 32`.
- A `contrast` a világosabb és a sötétebb szín fénysűrűségéből számol; a `+ 0.05` a WCAG képletéből jön.
- A `readableInk` kipróbálja a sötét és a világos szöveget, és azt adja vissza, amelyiknek nagyobb a kontrasztja.

A színminta kiszámolja a felirata színét és a kontrasztot, és mindkettőt meg is mutatja. Cseréld le az
`src/components/Swatch.jsx` tartalmát:

```jsx file=src/components/Swatch.jsx mark=1,3,5-7,10,28-30
import { contrast, readableInk, wcagLevel } from '../colors.js'

// Egyetlen szín a palettán: fent a lakat, lent a kód és a felirat kontrasztja.
function Swatch({ color, onCopy, onToggleLock }) {
  // A felirat színe és a kontraszt a háttérszínből következik: nem kell hozzájuk állapot.
  const ink = readableInk(color.hex)
  const ratio = Math.floor(contrast(color.hex, ink) * 10) / 10

  return (
    <li className="swatch swatch--ink" style={{ background: color.hex, color: ink }}>
      <button
        type="button"
        className="swatch__lock"
        aria-pressed={color.locked}
        aria-label={`${color.hex} zárolása`}
        onClick={onToggleLock}
      >
        {color.locked ? '🔒' : '🔓'}
      </button>
      <button
        type="button"
        className="swatch__hex"
        onClick={onCopy}
        aria-label={`${color.hex} másolása`}
      >
        {color.hex}
      </button>
      <span className="swatch__contrast">
        {wcagLevel(ratio)} · {ratio.toFixed(1)}:1
      </span>
    </li>
  )
}

export default Swatch
```

- Az `ink` és a `ratio` megint származtatott értékek: a színből következnek, nem kell hozzájuk állapot.
- A `ratio` egy tizedesjegyre levágva készül: a `* 10` után a `Math.floor` (a `randomInt`-ből ismerős) levágja a
  törtrészt, a `/ 10` pedig visszaosztja, így a `4.5871…`-ből `4.5` lesz. Azért vágjuk le, és nem kerekítjük, mert egy
  4,47-es arány még kevés az AA-hoz: kerekítve „Gyenge · 4.5:1” állna a címkén, ami ellentmond a 4,5-ös határnak.
  Levágva „Gyenge · 4.4:1” áll, így a szám és a szint mindig összeillik.
- A `style` most két tulajdonságot kap: a háttér a szín, a `color` (a szöveg színe) a kiszámolt `ink`.
- A `swatch--ink` osztály az `App.css`-ben van: eltünteti a fehér címkét, így a kód és a lakat is az `<li>`
  szövegszínét, vagyis az `ink`-et kapja.
- A `toFixed(1)` mindig pontosan egy tizedesjegyet ír ki: a `12`-ből `'12.0'` lesz. Tizedespontot használ, ahogy az
  angolban szokás, ezért a felületen például „12.6:1” áll, a szövegben pedig mi „12,6:1”-et írunk.

:::check Ellenőrizd
A fehér címkék eltűntek: sötét színeken fehér, világosakon szinte fekete a kód, alatta (telefonon mellette) pedig a
szint és az arány, például „AAA · 12.6:1”. A legtöbb szín AA vagy AAA. Kérj sok palettát: néha egy közepesen
világos színen a „Gyenge” is felbukkan, 4,5 alatti aránnyal. Ilyen színre csak nagy, vastag betűs szöveg kerülhet.
:::

:::mistake Gyakori hiba
`c ^ 2.4` a `c ** 2.4` helyett. JavaScriptben a `^` nem hatványozás, hanem egy bitművelet (kizáró vagy), ami tört
számokkal értelmetlen eredményt ad, hibaüzenet nélkül. Szinte minden színminta fehér feliratot kap „Gyenge · 1.4:1”
értékkel. Hatványozáshoz mindig `**` kell.
:::

:::try Próbáld ki
Írd át a `DARK_INK` értékét `'#000000'`-ra. A tiszta fekete egy kicsit nagyobb kontrasztot ad, mint a `#111111`, és ez
épp elég: bármilyen színen vagy a fekete, vagy a fehér szöveg eléri a 4,58:1-et, így a „Gyenge” többé nem fordul elő.
:::

### Export CSS-változóként

A 2. leckében [[CSS-változókba|CSS-változó]] gyűjtötted egy oldal színeit. Egy palettát pont így érdemes átvinni egy
projektbe:

```css
:root {
  --color-1: #3FA2C7;
  --color-2: #F0C808;
  --color-3: #DD1C1A;
  --color-4: #086788;
  --color-5: #FFF1D0;
}
```

Írd ezt a függvényt az `src/colors.js` végére:

```js file=src/colors.js
// A paletta CSS-változókként, egy :root szabályban, soronként egy színnel.
export function toCssVariables(hexes) {
  const lines = hexes.map((hex, i) => `  --color-${i + 1}: ${hex};`)
  return [':root {', ...lines, '}'].join('\n')
}
```

- A `map` második paramétere, az `i`, a sorszám 0-tól; a változók neve 1-től számol, ezért `i + 1`.
- A `[':root {', ...lines, '}']` egy új tömb: elöl a nyitó sor, középen a spread kiteríti az összes változósort, a végén
  a záró kapcsos zárójel.
- A `join('\n')` sortöréssel fűzi össze a sorokat: a `'\n'` egy szövegben az új sort jelenti.

Az `App` kiszámolja a CSS-t, megmutatja egy `<pre>` elemben (ez megtartja a sortöréseket és a behúzást), és egy gombbal
ki is másolja. Az üzenetsávba viszont nem kell az egész CSS, ezért a `copy` kap egy második, nem kötelező paramétert:
a feliratot, ami az üzenetben megjelenik. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=2,18,57,58,61,110-112,114
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette, toCssVariables } from './colors.js'
import useLocalStorage from './useLocalStorage.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import HarmonyPicker from './components/HarmonyPicker.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useLocalStorage('color-palette-favorites', [])
  const [harmony, setHarmony] = useState('random')

  // Ezeket minden rajzoláskor az állapotból számoljuk ki.
  const hexes = colors.map((color) => color.hex)
  const isSaved = favorites.some((favorite) => favorite.join() === hexes.join())
  const css = toCssVariables(hexes)

  // Az üzenet két másodperc múlva magától eltűnik.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Takarítás: ha közben új üzenet jön, a régi időzítő leáll.
    return () => clearTimeout(timer)
  }, [message])

  // Szóközre új paletta. Ha változik a harmónia, a takarítás leveszi a régi figyelőt, és új kerül a helyére.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // ne görgessen az oldal, és ne nyomja meg a fókuszban lévő gombot
      if (event.repeat) return // nyomva tartott billentyűnél csak az első leütés számít
      setColors((current) => nextPalette(current, harmony))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [harmony])

  function generate() {
    setColors((current) => nextPalette(current, harmony))
  }

  function changeHarmony(newHarmony) {
    setHarmony(newHarmony)
    // A newHarmony kell: a harmony állapotban itt még a régi érték van.
    setColors((current) => nextPalette(current, newHarmony))
  }

  function toggleLock(index) {
    // Új tömb: a kattintott helyen egy új objektum áll, a többi elem a régi.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  // A label az üzenetben jelenik meg. Ha a hívó nem ad meg ilyet, maga a szöveg lesz az.
  async function copy(text, label = text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Vágólapra másolva: ${label}`)
    } catch {
      setMessage('A böngésző nem engedte a másolást.')
    }
  }

  function saveFavorite() {
    // Új tömb: elöl a mostani paletta, mögötte a régi kedvencek.
    setFavorites((current) => [hexes, ...current])
  }

  function removeFavorite(favorite) {
    // Új tömb, amiből kimarad a törölt kedvenc.
    setFavorites((current) => current.filter((item) => item !== favorite))
  }

  function loadFavorite(favorite) {
    // A mentett szövegekből újra színobjektumok lesznek, zárolás nélkül.
    setColors(favorite.map((hex) => ({ hex, locked: false })))
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          Új paletta
        </button>
        <span className="toolbar__hint">
          vagy nyomd le a <kbd>Szóköz</kbd> billentyűt
        </span>
        <HarmonyPicker harmony={harmony} onChange={changeHarmony} />
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="button" onClick={saveFavorite} disabled={isSaved}>
          {isSaved ? 'Elmentve ✓' : 'Mentés a kedvencekhez'}
        </button>
        <button type="button" className="button" onClick={() => copy(css, 'CSS-változók')}>
          CSS másolása
        </button>
      </div>
      <pre className="export">{css}</pre>

      <Favorites favorites={favorites} onLoad={loadFavorite} onRemove={removeFavorite} />

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

A `label = text` egy [[alapértelmezett paraméter]]: ha a hívó nem ad meg feliratot, a `label` ugyanaz lesz, mint a
`text`. Így a színminták hívása (`copy(color.hex)`) változatlanul működik, a „CSS másolása” gomb után pedig az
üzenetsávban csak ennyi áll: „Vágólapra másolva: CSS-változók”.

:::check Ellenőrizd
A gombok alatt egy sötét kódblokk mutatja a palettát CSS-ként, és minden új palettával frissül. Kattints a „CSS
másolása” gombra: az üzenet „Vágólapra másolva: CSS-változók”. Illeszd be egy CSS-fájlba: öt szép sor egy `:root`
szabályban.
:::

:::mistake Gyakori hiba
`join()` a `join('\n')` helyett. Paraméter nélkül a `join` vesszőt tesz az elemek közé, így az egész CSS egyetlen
sorba kerül, tele vesszőkkel, és a böngésző nem érti.
:::

:::try Próbáld ki
Másold ki a CSS-t, illeszd be az `src/index.css` elejére, és írd a fájl végére: `body { background: var(--color-5); }`.
Az oldal háttere a paletta ötödik színe lesz. (Ez a CSS rögzített, nem követi a palettát; ha végeztél, töröld.)
:::

### Megosztható link

Végül osszuk meg a palettát: egy link, ami pontosan ezt az öt színt nyitja meg. Az 1. leckében a cím `#` utáni
részével, a [[URL-hash]]-sel váltottál oldalt, a 6. leckében pedig egy egész paklit osztottál meg benne; most a
paletta kerül oda:
`http://localhost:5173/#3FA2C7-F0C808-DD1C1A-086788-FFF1D0`. Ha csak ez a rész változik, a böngésző nem tölti újra az
oldalt, és a szerver sem kapja meg: minden a böngészőben marad.

Írd ezt a két függvényt az `src/colors.js` végére:

```js file=src/colors.js
// A paletta a cím végére: ['#3FA2C7', '#F0C808', …] → '#3FA2C7-F0C808-…'
export function paletteToHash(hexes) {
  return '#' + hexes.map((hex) => hex.slice(1)).join('-')
}

// Visszafelé: a cím végéből öt színkód. Ha nem öt érvényes kód van ott, null.
export function paletteFromHash(hash) {
  const hexes = hash
    .slice(1)
    .split('-')
    .map((part) => '#' + part.toUpperCase())
  const valid = hexes.length === 5 && hexes.every((hex) => /^#[0-9A-F]{6}$/.test(hex))
  return valid ? hexes : null
}
```

- A `paletteToHash` levágja a kódok elejéről a `#`-et (`slice(1)`), és kötőjelekkel fűzi össze őket.
- A `paletteFromHash` visszafelé dolgozik: levágja a `#`-et, a `split('-')` a kötőjeleknél darabokra vágja a szöveget,
  és minden darab elé visszakerül a `#`.
- Egy linket bárki átírhat, ezért ellenőrizzük: pontosan öt darab van-e, és mindegyik érvényes kód-e. Az `every` akkor
  igaz, ha a tömb **minden** elemére igaz a feltétel. Az ellenőrzést egy [[reguláris kifejezés]] végzi, ami egy
  szövegminta: a `/^#[0-9A-F]{6}$/` jelentése „az elején `#`, utána pontosan hat karakter a 0–9 és az A–F közül, és ott
  vége”. A `test` megmondja, illik-e rá a szöveg.

Az `App` két helyen használja őket: induláskor a címből olvas, és minden változás után visszaírja a palettát a címbe.
Itt a teljes `src/App.jsx`, ahogy a lecke végén kinéz:

```jsx file=src/App.jsx mark=2-8,15-20,23,32,54-57,132-134
import { useEffect, useState } from 'react'
import {
  nextPalette,
  paletteFromHash,
  paletteToHash,
  randomPalette,
  toCssVariables,
} from './colors.js'
import useLocalStorage from './useLocalStorage.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import HarmonyPicker from './components/HarmonyPicker.jsx'
import './App.css'

// Kezdő paletta: a címből, ha egy megosztott linkről jöttünk, különben véletlen.
function initialColors() {
  const shared = paletteFromHash(window.location.hash)
  if (shared) return shared.map((hex) => ({ hex, locked: false }))
  return randomPalette()
}

function App() {
  const [colors, setColors] = useState(initialColors)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useLocalStorage('color-palette-favorites', [])
  const [harmony, setHarmony] = useState('random')

  // Ezeket minden rajzoláskor az állapotból számoljuk ki.
  const hexes = colors.map((color) => color.hex)
  const isSaved = favorites.some((favorite) => favorite.join() === hexes.join())
  const css = toCssVariables(hexes)
  const hash = paletteToHash(hexes)

  // Az üzenet két másodperc múlva magától eltűnik.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Takarítás: ha közben új üzenet jön, a régi időzítő leáll.
    return () => clearTimeout(timer)
  }, [message])

  // Szóközre új paletta. Ha változik a harmónia, a takarítás leveszi a régi figyelőt, és új kerül a helyére.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // ne görgessen az oldal, és ne nyomja meg a fókuszban lévő gombot
      if (event.repeat) return // nyomva tartott billentyűnél csak az első leütés számít
      setColors((current) => nextPalette(current, harmony))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [harmony])

  // A cím mindig a mostani palettát mutatja, így bármikor megosztható.
  useEffect(() => {
    history.replaceState(null, '', hash)
  }, [hash])

  function generate() {
    setColors((current) => nextPalette(current, harmony))
  }

  function changeHarmony(newHarmony) {
    setHarmony(newHarmony)
    // A newHarmony kell: a harmony állapotban itt még a régi érték van.
    setColors((current) => nextPalette(current, newHarmony))
  }

  function toggleLock(index) {
    // Új tömb: a kattintott helyen egy új objektum áll, a többi elem a régi.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  // A label az üzenetben jelenik meg. Ha a hívó nem ad meg ilyet, maga a szöveg lesz az.
  async function copy(text, label = text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Vágólapra másolva: ${label}`)
    } catch {
      setMessage('A böngésző nem engedte a másolást.')
    }
  }

  function saveFavorite() {
    // Új tömb: elöl a mostani paletta, mögötte a régi kedvencek.
    setFavorites((current) => [hexes, ...current])
  }

  function removeFavorite(favorite) {
    // Új tömb, amiből kimarad a törölt kedvenc.
    setFavorites((current) => current.filter((item) => item !== favorite))
  }

  function loadFavorite(favorite) {
    // A mentett szövegekből újra színobjektumok lesznek, zárolás nélkül.
    setColors(favorite.map((hex) => ({ hex, locked: false })))
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          Új paletta
        </button>
        <span className="toolbar__hint">
          vagy nyomd le a <kbd>Szóköz</kbd> billentyűt
        </span>
        <HarmonyPicker harmony={harmony} onChange={changeHarmony} />
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="button" onClick={saveFavorite} disabled={isSaved}>
          {isSaved ? 'Elmentve ✓' : 'Mentés a kedvencekhez'}
        </button>
        <button type="button" className="button" onClick={() => copy(css, 'CSS-változók')}>
          CSS másolása
        </button>
        <button type="button" className="button" onClick={() => copy(window.location.href, 'link')}>
          Link másolása
        </button>
      </div>
      <pre className="export">{css}</pre>

      <Favorites favorites={favorites} onLoad={loadFavorite} onRemove={removeFavorite} />

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

- Az `initialColors` a `useState` lusta kezdőértéke: ha a címben érvényes paletta van, abból indul, különben
  véletlenből. A komponensen kívül áll, mert nem használ semmit a komponensből.
- A `hash` származtatott érték, az új effekt pedig minden változásnál beírja a címbe, a 6. leckéből ismert
  [[history.replaceState]]-tel (ott a megosztott paklit vettük ki vele a címből): újratöltés nélkül írja át a címet, és
  nem készít új bejegyzést az előzményekben. Az első két paraméterére most nincs szükségünk, ezért `null`-t és `''`-t
  adunk neki. A harmadik az új cím: ha `#`-tel kezdődik, mint a `hash`, csak a cím `#`-től kezdődő vége cserélődik, a
  többi része marad.
- Az effekt függősége a `hash`, ami egy szöveg. Két szöveg akkor egyenlő, ha betűre ugyanaz, így az effekt csak akkor
  fut le, ha tényleg változott a paletta. A `hexes` tömb nem lenne jó függőség: az minden rajzoláskor új tömb, akkor
  is, ha ugyanazok vannak benne, így az effekt minden rajzolás után lefutna.
- A „Link másolása” a teljes címet másolja (`window.location.href`), benne a palettával.

:::check Ellenőrizd
A címsorban a `localhost:5173/` után ott a paletta, például `#3FA2C7-F0C808-…`, és minden új palettával változik.
Kattints a „Link másolása” gombra, nyiss egy új lapot, és illeszd be a címet: pontosan ez a paletta nyílik meg. Írj a
cím végére egy `x`-et, és nyisd meg így is egy új lapon: hibás paletta helyett egyszerűen véletlent kapsz. Gratulálok,
kész a palettagenerátorod!
:::

:::mistake Gyakori hiba
`window.location.hash = hash` a `history.replaceState` helyett. Ez is átírja a címet, de minden palettához új
bejegyzést készít az előzményekben: harminc szóköz után harmincszor kell a Vissza gombra kattintanod, hogy elhagyd az
oldalt.
:::

:::try Feladat
Ha egy linket abba a lapba illesztesz be, ahol az app már nyitva van, és csak a `#` utáni rész más, a böngésző nem
tölti újra az oldalt, így a paletta sem változik. Figyeld a `hashchange` eseményt egy effektben (ahogy a szóközt
figyelted, takarítással együtt), és ha a `paletteFromHash` érvényes palettát ad, állítsd be a `setColors`-szal. A saját
`replaceState` hívásaink nem váltanak ki `hashchange`-et, így ez a figyelő csak a kívülről érkező linkekre reagál.
:::
