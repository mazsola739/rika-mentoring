# Mit építünk?

Egy jelszógenerátort: elhúzod a csúszkát, kiválasztod, milyen karakterek lehetnek benne, és az oldal máris készít egy
erős jelszót, amit egy kattintással kimásolhatsz. Közben megtanulod, hogyan kezeli a React az űrlapelemeket (csúszka,
jelölőnégyzetek, rádiógombok, szövegmező), hogyan választ egy program véletlenszerűen, és hogyan ír egy weboldal a
vágólapra.

:::levels
- Megadott hosszúságú jelszó, „Új jelszó” és „Másolás” gombbal. | kb. 2 óra
- Kapcsolók a kisbetűkhöz, nagybetűkhöz, számjegyekhez és szimbólumokhoz, meg egy erősségjelző. | kb. 2 óra
- Biztonságos véletlenszámok a `crypto.getRandomValues` segítségével, kiejthető jelszavak és ellenőrzés a kiszivárgott jelszavak listáján. | kb. 3 óra
:::

**Előismeret:** az 1. lecke, a „Me, Myself & React” (komponensek, props, JSX, `useState`, `useEffect`). Minden mást itt,
lépésről lépésre elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Ha megcsináltad az 1. leckét, a Node.js, a VS Code és a Git már megvan; ha nem, az 1. lecke 0. lépése megmutatja,
hogyan telepítsd őket, és részletesen elmagyarázza azt is, ami itt röviden következik.

A feladat a kurzus GitHub-repójában van, a `lessons/03-password-generator/exercise` mappában (a „Feladat a GitHubon”
gomb megnyitja). Nyiss egy terminált a munkamappádban, ahol a projektjeidet tartod. Az első alkalommal klónozd a repót,
aztán másold ki belőle az `exercise` mappát, és a másolat neve legyen `password-generator`:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/03-password-generator/exercise password-generator
```

Ha egy korábbi leckéből már megvan a repó, a `git clone` sor helyett ezt a három parancsot írd be: `cd rika-mentoring`,
`git pull` (ez hozza le az új leckéket), majd `cd ..`; utána jöhet a másolás. A repót `git clone` nélkül is
megszerezheted: a GitHub-oldalán válaszd a **Code → Download ZIP** lehetőséget, csomagold ki, és másold ki belőle a
`lessons/03-password-generator/exercise` mappát `password-generator` néven. Másolni fájlkezelővel is lehet, a `cp -r`
pedig Windowson, a VS Code termináljában is működik. Magához a repóhoz nem nyúlsz, így a `git pull` később is működik; a
másolatod a saját projekted.

Nyisd meg a `password-generator` mappát a szerkesztőben (VS Code-ban: **File** → **Open Folder**), nyiss benne egy
terminált (**Terminal** → **New Terminal**), és írd be ezt a két parancsot:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„Password Generator” címmel.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. Hagyd futni a szervert, nyiss egy második
terminált (a terminálpanel **+** gombjával), és írd be:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Ettől kezdve a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni.

A kiinduló projektben három fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért most nem kell
  stílust írnod: csak a lépésekben megadott osztályneveket (`generator`, `slider`, `choices`, …) használod. Azért nézz
  bele!
- `src/commonPasswords.js`: nagyon gyakori jelszavak listája. Csak a legvégén, a haladó szinten lesz rá szükség.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a „Password Generator” cím angolul
vannak. Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek.

:::concept Gyors ismétlés az 1. leckéből
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza, vagyis HTML-szerű leírást arról, mi jelenjen meg a
képernyőn. Kívülről a [[props]]-ain keresztül kap adatot, emlékezni pedig a [[useState]] segítségével tud: ha egy
állapotérték megváltozik, a React újrarajzolja a komponenst. Ha ezek közül valami ismeretlennek tűnik, lapozz vissza
az 1. leckéhez; minden újat itt elmagyarázunk.
:::

### Véletlen karakterek

Egy jelszó nem más, mint véletlenszerűen kiválasztott karakterek sora. A JavaScript [[Math.random]] függvénye egy
véletlen számot ad 0 és 1 között (a 0 előfordulhat, az 1 soha), például `0.7302…`-t. Ha megszorzod 62-vel, 0 és 62
közé esik; a [[Math.floor]] levágja a tizedesjegyeket, és máris van egy egész számod 0 és 61 között: egy karakter
helye egy 62 karakteres szövegben. (A JavaScriptben az idézőjelek közé írt szöveg neve [[string]], például `'abc'`.)

Ennek a logikának semmi köze a Reacthez, ezért külön fájlba kerül. Hozd létre az `src` mappában a `generator.js`
fájlt:

```js file=src/generator.js
// Minden karakter, ami egy jelszóban előfordulhat (egyelőre).
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// Véletlen egész szám 0-tól max - 1-ig.
export function randomInt(max) {
  return Math.floor(Math.random() * max)
}

// Megadott hosszúságú jelszó, véletlen karakterekből.
export function generatePassword(length) {
  let password = ''
  for (let i = 0; i < length; i++) {
    password += CHARS[randomInt(CHARS.length)]
  }
  return password
}
```

A `let` olyan változót hoz létre, aminek később új értéket adhatsz (a `const`-tal létrehozottat nem lehet átírni): a
`password` üres szövegként indul, és karakterenként nő. A `for` [[ciklus]] `length`-szer ismétli meg a belsejét: az `i`
0-ról indul, és egyesével nő, amíg el nem éri a `length`-et. A `CHARS.length` a szöveg hossza, vagyis 62. A `CHARS[5]`
a szöveg 5. helyén álló karakter (0-tól számolva), a `+=` pedig a `password` végéhez fűzi, vagyis új értéket ad neki.

Most nem írtunk `default`-ot az `export` után. Ez [[nevesített export]]: egy fájlban több is lehet belőle, és név
szerint, kapcsos zárójelben töltöd be őket. Jelenjen meg egy jelszó az oldalon. Írd át az `src/App.jsx`-et így (a
kiemelt sorok újak vagy megváltoztak):

```jsx file=src/App.jsx mark=1,5,10-12
import { generatePassword } from './generator.js'
import './App.css'

function App() {
  const password = generatePassword(16)

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password">{password}</output>
      </section>
    </main>
  )
}

export default App
```

Az `<output>` HTML-elem olyan eredménynek való, amit az oldal számolt ki.

:::check Ellenőrizd
Egy sötét dobozban 16 véletlen betű és szám jelenik meg. Frissítsd az oldalt (++F5++): minden alkalommal más jelszót
kapsz.
:::

:::mistake Gyakori hiba
`Math.floor` helyett `Math.round`. A kerekítés 62-t is adhat, de az utolsó karakter a 61. helyen áll: a `CHARS[62]`
értéke `undefined`, és időnként az „undefined” szó bukkan fel a jelszó közepén.
:::

:::try Próbáld ki
Írd át a `CHARS`-t `'0123456789'`-re, a hosszt pedig 4-re: kész is a PIN-kód-generátor. Utána állítsd vissza
mindkettőt.
:::

### Új jelszó egy kattintásra

A jelszó egyelőre csak az oldal újratöltésekor változik. Egy gombnak kellene újat készítenie, de ehhez nem elég egy
sima változót átírni: azt a React észre sem veszi, és nem rajzolja újra az oldalt. Ami az oldal használata közben
változik, az [[állapot]], és ahhoz `useState` kell:

```jsx file=src/App.jsx mark=1,6,8-10,16,19-23
import { useState } from 'react'
import { generatePassword } from './generator.js'
import './App.css'

function App() {
  const [password, setPassword] = useState(() => generatePassword(16))

  function regenerate() {
    setPassword(generatePassword(16))
  }

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <button type="button" onClick={regenerate}>
            Új jelszó
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
```

- A `regenerate` egy [[eseménykezelő]]: olyan függvény, ami akkor fut le, amikor valami történik, itt egy kattintás.
  Az `onClick={regenerate}` átadja a függvényt a gombnak, a React pedig minden kattintáskor meghívja.
- A `setPassword` eltárolja az új jelszót, és a React újrarajzolja vele az `App`-ot.
- A `useState` most nem egy jelszót kap, hanem egy függvényt: `() => generatePassword(16)`. Az ilyen függvényt a React
  csak egyszer, az első rajzoláskor hívja meg, hogy megkapja a kezdőértéket. Ennek a neve [[lusta kezdőérték]] (az 1.
  lecke `useHashRoute`-ja is így indult: `useState(currentPath)`). A `useState(generatePassword(16))` minden
  rajzoláskor új jelszót gyártana, amit aztán rögtön el is dobna.
- Az `aria-live="polite"` arra kéri a képernyőolvasókat, hogy olvassák fel a doboz új tartalmát, amikor megváltozik;
  így az is hallja az új jelszót, aki nem látja a képernyőt.

:::check Ellenőrizd
Az „Új jelszó” gomb minden kattintásra más jelszót mutat.
:::

:::mistake Gyakori hiba
`onClick={regenerate()}`, zárójellel. Ez rögtön, rajzolás közben meghívja a függvényt, és az eredményét adja az
`onClick`-nek. Itt ráadásul rajzolás közben állítja az állapotot, ezért a React újrarajzolja az oldalt, ami megint
meghívja a függvényt, és így tovább. Végül a React „Too many re-renders” hibával megáll. A függvényt add át, ne hívd
meg.
:::

:::try Feladat
Számold meg, hány jelszót készítettél: egy második állapot, `useState(0)`, amit a `regenerate` eggyel növel, és egy sor
a doboz alatt, ami kiírja.
:::

### Csúszka a hosszhoz

A hosszt egy csúszkával lehessen állítani: `<input type="range">`. Reactben [[vezérelt mezőt|vezérelt mező]] csinálunk
belőle: az értékét az állapotból kapja, és minden mozdulat frissíti az állapotot. Az 1. lecke kapcsolati űrlapjánál már
találkoztál ilyennel; most egy csúszka lesz a mező.

A csúszka saját komponenst kap. Hozz létre az `src` mappában egy `components` mappát, benne egy `LengthSlider.jsx`
fájlt:

```jsx file=src/components/LengthSlider.jsx
function LengthSlider({ value, onChange }) {
  return (
    <label className="slider">
      <span>
        Hossz: <strong>{value}</strong> karakter
      </span>
      <input
        type="range"
        min="6"
        max="40"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

export default LengthSlider
```

Az `<input>` `onChange`-ébe egy kis [[nyílfüggvényt|nyílfüggvény]] írtunk: a React a csúszka minden mozdulatakor
meghívja, és átadja neki az eseményt (`event`). Az `event.target` maga a csúszka, az `event.target.value` pedig az, ahol
éppen áll. Minden űrlapelem **szövegként** adja az értékét (`"16"`), még a csúszka is, ezért a `Number()` számmá
alakítja. Enélkül például a `"16" + 4` eredménye `"164"` lenne, nem 20.

A csúszka nem maga tárolja a hosszt: megmutatja a kapott `value` értéket, és minden mozdulatot jelez az `onChange`
propon keresztül. Figyelj, két `onChange` van itt: az `<input onChange={…}>` a böngésző eseményére figyel, a
nyílfüggvényben meghívott `onChange` pedig a mi propunk, egy függvény, amit az `App` ad. A hossz az `App`-ban él, mert a
jelszónak is szüksége van rá. Ezt hívják az [[állapot felemelésének|állapot felemelése]]: az állapot abban a
legközelebbi komponensben lakik, amelyik mindent tartalmaz, ami használja. Az adat propokon át lefelé megy, az események
függvényeken át felfelé jönnek.

```jsx file=src/App.jsx mark=3,7,11,14-18,34
import { useState } from 'react'
import { generatePassword } from './generator.js'
import LengthSlider from './components/LengthSlider.jsx'
import './App.css'

function App() {
  const [length, setLength] = useState(16)
  const [password, setPassword] = useState(() => generatePassword(16))

  function regenerate() {
    setPassword(generatePassword(length))
  }

  function changeLength(newLength) {
    setLength(newLength)
    // A newLength kell: a length állapotban itt még a régi érték van.
    setPassword(generatePassword(newLength))
  }

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <button type="button" onClick={regenerate}>
            Új jelszó
          </button>
        </div>
      </section>

      <LengthSlider value={length} onChange={changeLength} />
    </main>
  )
}

export default App
```

Miért a `newLength`-et használja a `changeLength`, és nem a `length`-et? A `setLength` nem azonnal írja át a
`length`-et: az új érték a következő rajzoláskor érkezik meg. Ebben a függvényben a `length` még a régi szám, a
`newLength` viszont már a kezünkben van.

:::check Ellenőrizd
Húzd el a csúszkát: a fölötte lévő szám és a jelszó hossza együtt változik. Kattints a csúszkára, és nyomd meg a ++←++
vagy a ++→++ billentyűt: egyesével lép.
:::

:::mistake Gyakori hiba
`value` `onChange` nélkül. Ekkor a React az állapotban lévő értéken tartja a csúszkát, így meg sem mozdul, a konzol
pedig figyelmeztet, hogy a mező csak olvasható. Egy vezérelt mezőhöz mindig mindkettő kell.
:::

:::try Feladat
Állítsd be, hogy a csúszka 8-tól 64-ig menjen. Melyik két attribútumot kell átírnod?
:::

### Másolás a vágólapra

Egy jelszó csak akkor hasznos, ha be tudod illeszteni valahová. A böngésző [[Clipboard API]]-ja (vágólap-API)
szöveget ír a vágólapra: `navigator.clipboard.writeText(text)`. Az [[API]] (programozási felület) függvények
gyűjteménye, amelyeken keresztül a kódod egy másik program, itt a böngésző szolgáltatásait használhatja. A `navigator`
maga a böngésző, a `navigator.clipboard` pedig a vágólapja.

A másolás eltarthat egy pillanatig, és nem is mindig sikerül, például ha a böngésző nem engedi. Ezért a `writeText`
nem válaszol azonnal: egy [[Promise]]-t ad vissza, vagyis egy ígéretet, hogy a munka véget ér, sikeresen vagy hibával.
Egy [[async függvényben|async függvény]] (aminek az elején `async` áll) az `await` megvárja, amíg az ígéret teljesül,
a [[try/catch]] pedig elkapja a hibát, ha nem sikerül: ha a `try` részben bármi elromlik, a kód a `catch` részben
folytatódik. A másológomb is saját komponens lesz: hozd létre az `src/components/CopyButton.jsx` fájlt.

```jsx file=src/components/CopyButton.jsx
import { useState } from 'react'

function CopyButton({ text }) {
  const [status, setStatus] = useState('idle') // 'idle', 'copied' vagy 'failed'

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = 'Másolás'
  if (status === 'copied') label = 'Másolva!'
  if (status === 'failed') label = 'Nem sikerült'

  return (
    <button type="button" className="button--primary" onClick={copy}>
      {label}
    </button>
  )
}

export default CopyButton
```

A gomb a saját állapotában jegyzi meg, mi történt, a felirata pedig ezt követi. Tedd a gombot az „Új jelszó” mellé az
`App`-ban. Itt a teljes fájl, ahogy a kezdő szint végén kinéz:

```jsx file=src/App.jsx mark=4,29
import { useState } from 'react'
import { generatePassword } from './generator.js'
import LengthSlider from './components/LengthSlider.jsx'
import CopyButton from './components/CopyButton.jsx'
import './App.css'

function App() {
  const [length, setLength] = useState(16)
  const [password, setPassword] = useState(() => generatePassword(16))

  function regenerate() {
    setPassword(generatePassword(length))
  }

  function changeLength(newLength) {
    setLength(newLength)
    // A newLength kell: a length állapotban itt még a régi érték van.
    setPassword(generatePassword(newLength))
  }

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <CopyButton text={password} />
          <button type="button" onClick={regenerate}>
            Új jelszó
          </button>
        </div>
      </section>

      <LengthSlider value={length} onChange={changeLength} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Kattints a „Másolás” gombra, aztán illeszd be (++Ctrl++ + ++V++) a szerkesztődbe vagy a böngésző címsorába: ott a
jelszó, a gombon pedig a „Másolva!” felirat áll.
:::

:::mistake Gyakori hiba
Kimarad az `await`. Ekkor a kód nem várja meg a másolást: a „Másolva!” akkor is megjelenik, ha nem sikerült, a `catch`
pedig sosem látja a hibát.
:::

:::concept Mikor nem sikerül a másolás?
A vágólap csak biztonságos oldalakon működik: `https://` címeken és a `localhost`-on. Ha a szervert
`npm run dev -- --host` paranccsal indítod, és a telefonodról a géped IP-címén nyitod meg (`http://192.168…`, a
terminál a „Network” sorban kiírja), a `navigator.clipboard` nem is létezik, és a gomb azt írja: „Nem sikerült”. A
böngészők ráadásul csak akkor engedik írni a vágólapot, ha a felhasználó csinált valamit, például kattintott: egy oldal
nem töltheti tele csendben a vágólapodat.
:::

### Visszajelzés, ami eltűnik

A „Másolva!” most örökre a gombon marad. Másfél másodperc múlva vissza kellene váltania „Másolás”-ra. A várakozás a
[[setTimeout]] dolga: a `setTimeout(fn, 1500)` 1500 ezredmásodperc múlva meghívja az `fn` függvényt.

De hol indítsuk el az időzítőt? Rajzolás közben semmiképp: a rajzolás csak leírja, mi legyen a képernyőn. A
rajzoláson kívüli munka, például egy időzítő, a [[useEffect]]-be kerül. Az 1. leckében már találkoztál vele: a
`useHashRoute` hook ezzel figyelte a cím `#` utáni részét.

```jsx file=src/components/CopyButton.jsx mark=1,6-12
import { useEffect, useState } from 'react'

function CopyButton({ text }) {
  const [status, setStatus] = useState('idle') // 'idle', 'copied' vagy 'failed'

  // Másfél másodperccel a másolás (vagy a sikertelen próbálkozás) után a státusz visszaáll 'idle'-re.
  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 1500)
    // Takarítás: ha a gomb előbb eltűnik, az időzítő leáll.
    return () => clearTimeout(timer)
  }, [status])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = 'Másolás'
  if (status === 'copied') label = 'Másolva!'
  if (status === 'failed') label = 'Nem sikerült'

  return (
    <button type="button" className="button--primary" onClick={copy}>
      {label}
    </button>
  )
}

export default CopyButton
```

- A `[status]` a [[függőségi tömb]]. Ez mondja meg a Reactnek, mikor fusson le az effekt: az első rajzolás után, és
  minden olyan rajzolás után, amikor a `status` megváltozott.
- Amikor a státusz `'copied'` vagy `'failed'` lesz, az effekt elindít egy időzítőt. Másfél másodperc múlva az időzítő
  visszaállítja `'idle'`-re; az effekt újra lefut, látja, hogy `'idle'`, és nem csinál semmit.
- Az a függvény, amit az effekt visszaad, a [[takarító függvény]] (cleanup). A React meghívja, mielőtt újra lefuttatná
  az effektet, és akkor is, amikor a komponens eltűnik az oldalról. Itt leállítja az időzítőt, így egy elfelejtett
  időzítő sosem sül el egy olyan gombon, ami már nem is létezik.

:::check Ellenőrizd
Kattints a „Másolás” gombra: a felirat „Másolva!”, másfél másodperc múlva pedig újra „Másolás”. Ezzel kész a kezdő
szint: commitold!
:::

:::mistake Gyakori hiba
Üres függőségi tömb: `[]`. Ekkor az effekt csak egyszer fut le, az első rajzolás után, amikor a státusz még `'idle'`,
és soha többé: a „Másolva!” örökre a gombon marad.
:::

:::try Próbáld ki
Kattints a „Másolás”, aztán rögtön az „Új jelszó” gombra: a másológombon még mindig „Másolva!” áll, pedig az új jelszó
nincs a vágólapon. Javítsd ki az `App`-ban: `<CopyButton key={password} text={password} />`. Ha a [[key]] megváltozik, a
React vadonatúj gombnak tekinti, friss állapottal. Az `App` további teljes listáiban már benne van ez a `key`.
:::

## Középszint {level=2}

### Karakterkészletek jelölőnégyzetekkel

Mostantól a felhasználó dönti el, mi kerüljön a jelszóba: kisbetűk, nagybetűk, számjegyek, szimbólumok. Mindegyik
kapcsoló egy [[jelölőnégyzet]], az állapotukat pedig egy [[objektum]] tárolja. Az objektum nevekhez (kulcsokhoz)
rendelt értékek gyűjteménye, kapcsos zárójelben: `{ lower: true, upper: true, digits: true, symbols: false }`. Itt minden
kulcs egy készlet neve, az értéke pedig az, hogy be van-e pipálva.

Előbb a generátor: a karakterkészletek nevet kapnak, a `generatePassword` pedig azt is megkapja, melyikeket használja.
Itt a teljes `src/generator.js`:

```js file=src/generator.js
// A karakterkészletek, amelyek közül a felhasználó választhat.
export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
}

// Véletlen egész szám 0-tól max - 1-ig.
export function randomInt(max) {
  return Math.floor(Math.random() * max)
}

// Az options mondja meg, melyik készleteket használjuk, például { lower: true, upper: false, … }.
export function generatePassword(length, options) {
  // A kiválasztott készleteket egy tömbbe gyűjtjük…
  const sets = []
  for (const key of Object.keys(CHARSETS)) {
    if (options[key]) sets.push(CHARSETS[key])
  }
  // …és egyetlen hosszú szöveggé fűzzük, ebből választunk.
  const pool = sets.join('')

  let password = ''
  for (let i = 0; i < length; i++) {
    password += pool[randomInt(pool.length)]
  }
  return password
}
```

Az `Object.keys(CHARSETS)` felsorolja az objektum kulcsait (`['lower', 'upper', 'digits', 'symbols']`), a `for … of`
pedig egyenként végigmegy rajtuk. Az `options[key]` annak a kulcsnak az értéke, amelyiknek a neve a `key`-ben van: ha a
`key` értéke `'lower'`, ugyanaz, mint az `options.lower`. A `sets.push(…)` egy elemet tesz a `sets` tömb végére, a
`sets.join('')` pedig a tömb elemeit egyetlen szöveggé fűzi össze, semmit (`''`) nem téve közéjük. A `CHARS` eltűnt: a
helyét a `pool` vette át.

A jelölőnégyzetek az `src/components/CharsetOptions.jsx` fájlba kerülnek:

```jsx file=src/components/CharsetOptions.jsx
const LABELS = {
  lower: 'Kisbetűk (a–z)',
  upper: 'Nagybetűk (A–Z)',
  digits: 'Számjegyek (0–9)',
  symbols: 'Szimbólumok (!@#…)',
}

function CharsetOptions({ options, onToggle }) {
  return (
    <fieldset className="choices">
      <legend>Felhasznált karakterek</legend>
      {Object.keys(LABELS).map((key) => (
        <label key={key} className="choices__item">
          <input type="checkbox" checked={options[key]} onChange={() => onToggle(key)} />
          {LABELS[key]}
        </label>
      ))}
    </fieldset>
  )
}

export default CharsetOptions
```

Hogy egy jelölőnégyzet be van-e pipálva, azt a `checked` mondja meg (`true` vagy `false`), nem a `value`. A
`<fieldset>` és a `<legend>` egy címmel ellátott csoportba foglalja a négyzeteket, és a képernyőolvasó minden
négyzetnél felolvassa a címet is.

Az `App`-ban a beállítások is állapotba kerülnek. Figyelj: a `generatePassword` mostantól **két** paramétert vár,
úgyhogy írd át mindhárom helyen, ahol meghívod. A lenti kódban a `…` kezdetű megjegyzések helyén minden marad, ahogy
volt, és a fájl végén az `export default App` is.

```jsx file=src/App.jsx mark=1,4,8,9,12,17,20-25,31
import CharsetOptions from './components/CharsetOptions.jsx'
// … a többi import, mint eddig

const START_OPTIONS = { lower: true, upper: true, digits: true, symbols: false }

function App() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(START_OPTIONS)
  const [password, setPassword] = useState(() => generatePassword(16, START_OPTIONS))

  function regenerate() {
    setPassword(generatePassword(length, options))
  }

  function changeLength(newLength) {
    setLength(newLength)
    setPassword(generatePassword(newLength, options))
  }

  function toggleOption(key) {
    // Az options másolata, egy kulcs értékét megfordítva (a true-ból false lesz, és fordítva).
    const newOptions = { ...options, [key]: !options[key] }
    setOptions(newOptions)
    setPassword(generatePassword(length, newOptions))
  }

  return (
    <main className="generator">
      {/* … a cím és a jelszódoboz, mint eddig … */}
      <LengthSlider value={length} onChange={changeLength} />
      <CharsetOptions options={options} onToggle={toggleOption} />
    </main>
  )
}
```

A `{ ...options, [key]: !options[key] }` az 1. lecke kapcsolati űrlapjából ismert [[spread]]: lemásolja a régi
objektumot, és felülír benne egy kulcsot. A szögletes zárójeles `[key]` azt jelenti: „az a kulcs, amelyiknek a neve a
`key` változóban van”, a `!` pedig a `true`-ból `false`-t csinál, és fordítva. Az állapotot most sem módosítjuk
közvetlenül: a `setOptions` egy új objektumot kap.

:::check Ellenőrizd
Vedd ki a pipát a „Nagybetűk” elől: a jelszóban nincs több nagybetű. Pipáld be a „Szimbólumok”-at: megjelenik a `!`, a
`#`, a `%` és társaik.
:::

:::mistake Gyakori hiba
Üres oldal, vagy az „Új jelszó” gomb, illetve a csúszka nem ad új jelszót; a konzolban (++F12++) pedig „Cannot read
properties of undefined (reading 'lower')”. Valamelyik hívás még mindig csak a hosszt adja át, például
`generatePassword(16)` a `generatePassword(16, START_OPTIONS)` helyett, így a függvényen belül az `options` értéke
`undefined`.
:::

:::try Feladat
Adj hozzá egy ötödik, saját készletet, például `'áéíóöőúüű'`-t az ékezetes betűkhöz. Három helyen kell hozzányúlnod:
`CHARSETS`, `LABELS` és `START_OPTIONS`.
:::

### Két észszerű szabály

Ha játszol egy kicsit a négyzetekkel, két gondot is észreveszel:

1. Minden pipát ki lehet venni. Ilyenkor a `pool` üres, nincs miből választani, és a jelszóból
   „undefinedundefined…” lesz.
2. Hiába van mind a négy négyzet bepipálva, egy 6 karakteres jelszóban könnyen lehet, hogy egyetlen számjegy sincs: a
   véletlenen múlik.

Az első szabály: az utolsó bepipált négyzetet nem lehet kikapcsolni. A `disabled` attribútummal ellátott mezőre nem
lehet kattintani.

```jsx file=src/components/CharsetOptions.jsx mark=9-10,20
const LABELS = {
  lower: 'Kisbetűk (a–z)',
  upper: 'Nagybetűk (A–Z)',
  digits: 'Számjegyek (0–9)',
  symbols: 'Szimbólumok (!@#…)',
}

function CharsetOptions({ options, onToggle }) {
  // Hány négyzet van bepipálva? Az utolsónak bekapcsolva kell maradnia.
  const checkedCount = Object.values(options).filter((on) => on).length

  return (
    <fieldset className="choices">
      <legend>Felhasznált karakterek</legend>
      {Object.keys(LABELS).map((key) => (
        <label key={key} className="choices__item">
          <input
            type="checkbox"
            checked={options[key]}
            disabled={options[key] && checkedCount === 1}
            onChange={() => onToggle(key)}
          />
          {LABELS[key]}
        </label>
      ))}
    </fieldset>
  )
}

export default CharsetOptions
```

Az `Object.values` az objektum értékeit adja (`[true, true, true, false]`), a `filter` megtartja közülük a `true`-kat,
a `length` pedig megszámolja őket. Egy négyzet akkor van letiltva, ha be van pipálva, **és** ő az egyetlen.

A második szabály: először minden kiválasztott készletből veszünk egy karaktert, a többit pedig az összes kiválasztott
karakter közül töltjük fel. A végén megkeverjük, különben a garantált karakterek mindig elöl állnának, ugyanabban a sorrendben.
Cseréld le a `generatePassword` függvényt az `src/generator.js`-ben:

```js file=src/generator.js mark=10-15,17-24
export function generatePassword(length, options) {
  // A kiválasztott készleteket egy tömbbe gyűjtjük…
  const sets = []
  for (const key of Object.keys(CHARSETS)) {
    if (options[key]) sets.push(CHARSETS[key])
  }
  // …és egyetlen hosszú szöveggé fűzzük, ebből választunk.
  const pool = sets.join('')

  // Minden kiválasztott készletből egy karakter, hogy mindegyik tényleg szerepeljen…
  const chars = sets.map((set) => set[randomInt(set.length)])
  // …a többi pedig a teljes pool-ból.
  while (chars.length < length) {
    chars.push(pool[randomInt(pool.length)])
  }

  // Keverés (Fisher–Yates), hogy a garantált karakterek bárhová kerülhessenek.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    const temp = chars[i]
    chars[i] = chars[j]
    chars[j] = temp
  }
  return chars.join('')
}
```

A jelszó most egy [[tömbben|tömb]] (`chars`) épül, mert a tömb elemeit fel lehet cserélni; a végén a `join('')` fűzi
őket egyetlen szöveggé. A `while` addig ismétli a belsejét, amíg a feltétele igaz. A [[Fisher–Yates-keverés]] az
utolsó helytől halad az első felé, és minden elemet felcserél egy véletlenszerűen kiválasztottal a még össze nem kevert
részből (akár önmagával is). A cseréhez kell a `temp`: félreteszi az `i`-edik elemet, a helyére beírjuk a `j`-ediket,
végül a félretett elem a `j`-edik helyre kerül. Így minden sorrendnek pontosan ugyanannyi az esélye.

:::check Ellenőrizd
Vedd ki a pipákat, amíg csak egy marad: az kiszürkül, és bepipálva marad. Állítsd a hosszt 6-ra, és pipáld be mind a
négy négyzetet: akárhányszor kattintasz az „Új jelszó” gombra, minden jelszóban lesz kisbetű, nagybetű, számjegy és
szimbólum.
:::

:::mistake Gyakori hiba
A népszerű egysoros keverés: `chars.sort(() => Math.random() - 0.5)`. Véletlennek látszik, de nem egyenletes: a `sort`
olyan összehasonlítást vár, ami ugyanarra a két elemre mindig ugyanazt feleli. Egy véletlenszerűvel bizonyos sorrendek
sokkal gyakrabban jönnek ki, mint mások. Jelszóhoz Fisher–Yates kell.
:::

### Erősségjelző

Mennyire erős egy jelszó? Nagyjából: hány próbálkozás kell egy támadónak ahhoz, hogy minden lehetőséget végignézzen.
62-féle karakterrel egy 1 karakteres jelszónak 62 lehetséges értéke van, egy 2 karakteresnek 62 × 62 = 3844, és minden
újabb karakter megint 62-vel szoroz. Ezek a számok gyorsan óriásira nőnek, ezért inkább [[bitekben|bit]] számolunk:
minden bit megduplázza a próbálkozások számát. Ez a mérőszám a jelszó [[entrópiája|entrópia]]:
`hossz × log2(a lehetséges karakterek száma)`.

A [[Math.log2]] megmondja, hányszor kell az 1-et megduplázni, hogy megkapd az adott számot: a `Math.log2(64)` értéke 6, mert
2 × 2 × 2 × 2 × 2 × 2 = 64. Írj két függvényt az `src/generator.js` végére:

```js file=src/generator.js
// Entrópia bitben: hossz × log2(a választható karakterek száma).
export function entropy(length, options) {
  let poolSize = 0
  for (const key of Object.keys(CHARSETS)) {
    if (options[key]) poolSize += CHARSETS[key].length
  }
  return Math.round(length * Math.log2(poolSize))
}

// A bitekből szint lesz: 0 = gyenge, 1 = közepes, 2 = erős, 3 = nagyon erős.
export function strengthLevel(bits) {
  if (bits < 45) return 0
  if (bits < 65) return 1
  if (bits < 90) return 2
  return 3
}
```

A mérő az `src/components/StrengthMeter.jsx` fájlba kerül:

```jsx file=src/components/StrengthMeter.jsx
import { strengthLevel } from '../generator.js'

const NAMES = ['Gyenge', 'Közepes', 'Erős', 'Nagyon erős']

function StrengthMeter({ bits }) {
  const level = strengthLevel(bits)

  return (
    <div className={`strength strength--${level}`}>
      <span className="strength__bars" aria-hidden="true">
        {NAMES.map((name, i) => (
          <span key={name} className={i <= level ? 'is-on' : ''} />
        ))}
      </span>
      <strong>{NAMES[level]}</strong>
      <span className="strength__bits">kb. {bits} bit</span>
    </div>
  )
}

export default StrengthMeter
```

A fájl a `components` mappában van, ezért a `'../generator.js'` előbb egy mappát feljebb lép (`..`), az `src`-be.

Négy sáv van. A `map` második paramétere, az `i`, megmondja, hányadik sávnál tartunk (0-tól számolva). Az
`i <= level ? 'is-on' : ''` egy [[ternáris operátor]]: a `feltétel ? ez : az` egy olyan `if … else`, ami értéket ad.
Itt: ha a sáv sorszáma legfeljebb akkora, mint a szint, megkapja az `is-on` osztályt, és világít; különben üres osztályt
kap. Gyenge jelszónál így egy sáv világít, nagyon erősnél mind a négy. A színüket a `strength--0` … `strength--3`
osztály adja (piros, narancs, kék, zöld: mind benne van az `App.css`-ben). Az `aria-hidden` elrejti a sávokat a
képernyőolvasók elől, hiszen a mellettük álló szó ugyanazt mondja.

És most jön a lényeg: az erősség **nem** új állapot. A hosszból és a beállításokból következik, ezért egyszerűen
kiszámoljuk minden rajzoláskor. Ez egy [[származtatott érték]]. Itt az `App`, ahogy a középszint végén kinéz:

```jsx file=src/App.jsx mark=2,6,32-33,43,50
import { useState } from 'react'
import { entropy, generatePassword } from './generator.js'
import LengthSlider from './components/LengthSlider.jsx'
import CopyButton from './components/CopyButton.jsx'
import CharsetOptions from './components/CharsetOptions.jsx'
import StrengthMeter from './components/StrengthMeter.jsx'
import './App.css'

const START_OPTIONS = { lower: true, upper: true, digits: true, symbols: false }

function App() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(START_OPTIONS)
  const [password, setPassword] = useState(() => generatePassword(16, START_OPTIONS))

  function regenerate() {
    setPassword(generatePassword(length, options))
  }

  function changeLength(newLength) {
    setLength(newLength)
    setPassword(generatePassword(newLength, options))
  }

  function toggleOption(key) {
    // Az options másolata, egy kulcs értékét megfordítva (a true-ból false lesz, és fordítva).
    const newOptions = { ...options, [key]: !options[key] }
    setOptions(newOptions)
    setPassword(generatePassword(length, newOptions))
  }

  // Minden rajzoláskor az állapotból számoljuk: nem kell hozzá saját állapot.
  const bits = entropy(length, options)

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <CopyButton key={password} text={password} />
          <button type="button" onClick={regenerate}>
            Új jelszó
          </button>
        </div>
      </section>

      <StrengthMeter bits={bits} />
      <LengthSlider value={length} onChange={changeLength} />
      <CharsetOptions options={options} onToggle={toggleOption} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
16 karakter három készletből: „Nagyon erős”, mellette „kb. 95 bit”. Húzd le a hosszt 8-ra: „Közepes”. Vegyél ki minden pipát a
kisbetűkön kívül: a sávok „Gyenge”-re esnek vissza. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Az erősséget külön `useState`-ben tartani, és egy `useEffect`-ből frissíteni, valahányszor változik a hossz vagy a
beállítás. Működik, de az oldal minden változásnál kétszer rajzolódik, és ha egyszer kimarad egy függőség, az
erősségjelző már nem azt mutatja, ami a jelszóra igaz. Amit ki lehet számolni az állapotból, azt számold ki, ne tárold.
:::

:::try Próbáld ki
Hasonlítsd össze: 8 karakter mind a négy készletből, vagy 20 kisbetű. Melyik az erősebb? A hossz többet ér, mint a
változatosság.
:::

## Haladó szint {level=3}

### Biztonságos véletlenszámok: crypto.getRandomValues

A `Math.random` játékokhoz jó, jelszóhoz nem. [[Álvéletlen|álvéletlen]] számokat ad: egy gyors képlettel számolja őket
egy rejtett kezdőértékből, és aki elég sokat lát a számaiból, kitalálhatja a következőket. Titkokhoz a böngésző egy
[[kriptográfiailag biztonságos]] véletlenforrást kínál, vagyis olyat, amelynek a számaiból akkor sem lehet kitalálni a
következőt, ha valaki milliót lát belőlük. Ez a `crypto.getRandomValues`, amely egy [[típusos tömböt|típusos tömb]]
tölt fel véletlen számokkal. A típusos tömb hossza rögzített, és csak egyféle számot tárolhat: egy `Uint32Array`
például 0 és 4 294 967 295 közötti egész számokat (ez 2 a 32. hatványon, mínusz egy). A `new Uint32Array(1)` egy
ilyen, egyetlen elemből álló tömböt hoz létre.

A projektben minden véletlen választás a `randomInt`-en megy keresztül, így az `src/generator.js`-ben csak ezt az egy
függvényt kell lecserélni:

```js file=src/generator.js
// Véletlen egész szám 0-tól max - 1-ig, a böngésző biztonságos véletlenforrásából.
export function randomInt(max) {
  const buffer = new Uint32Array(1)
  // A max legnagyobb többszöröse, ami nem nagyobb 2 ** 32-nél (a lenti doboz elmagyarázza, miért).
  const limit = Math.floor(2 ** 32 / max) * max
  let value
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % max
}
```

A `2 ** 32` azt jelenti: 2 a 32. hatványon. A `%` a maradékos osztás, más néven [[modulo]] jele: a `17 % 5` értéke 2,
mert a 17-ben az 5 háromszor van meg, és marad 2. Ez szorítja be az óriási véletlen számot a 0 és `max - 1` közötti
tartományba. A `do … while` előbb lefuttatja a belsejét, aztán addig ismétli, amíg a feltétel igaz.

:::concept Mire jó a limit? (modulo-torzítás)
Képzelj el egy tízoldalú dobókockát 0-tól 9-ig, és neked egy 0 és 2 közötti szám kell: `value % 3`. A 0, 3, 6 és 9 nullát ad;
az 1, 4 és 7 egyet; a 2, 5 és 8 kettőt. A nulla tízből négyszer jön ki, a másik kettő csak háromszor: az eredmény
torz. Ez a [[modulo-torzítás]]. A megoldás: ha 9-et dobsz, nem veszed figyelembe, és újra dobsz. A `limit` ugyanezt teszi a 2³²
lehetséges értékkel: ez a `max` legnagyobb többszöröse, ami még belefér, és a `limit`-től fölfelé mindent újra dobunk.
Szinte sosem fordul elő, de így minden karakternek pontosan ugyanannyi az esélye.
:::

:::check Ellenőrizd
Minden ugyanúgy működik, mint eddig; a felhasználó nem lát különbséget. Keress rá a projektben a `Math.random`-ra
(VS Code-ban: ++Ctrl++ + ++Shift++ + ++F++): nincs több találat.
:::

:::mistake Gyakori hiba
`new Uint8Array(1)`: ennek a számai csak 0-tól 255-ig mennek. A torzítás így sokkal nagyobb, és ha 256-nál több
karakterből kell választani, néhány karakter sosem jönne ki.
:::

:::try Próbáld ki
A böngésző konzoljában (++F12++ → Console) futtasd le néhányszor: `crypto.getRandomValues(new Uint32Array(5))`.
:::

### Kiejthető jelszavak

Egy véletlen jelszó erős, de nehéz telefonon bediktálni, vagy a tévé távirányítójával begépelni. A kiejthető jelszóban
mássalhangzók és magánhangzók váltják egymást, például `kamorituvesa`. Könnyebb kimondani és megjegyezni, de minden
karakterében kevesebb a véletlen, ezért hosszabbnak kell lennie. Írd ezeket az `src/generator.js` végére:

```js file=src/generator.js
// Kimaradt az l, q, w, x és y: ezeket könnyű összekeverni vagy nehéz kimondani.
const CONSONANTS = 'bcdfghjkmnprstvz'
const VOWELS = 'aeiou'

// Mássalhangzó, magánhangzó, mássalhangzó, magánhangzó…: mint a „ka-mo-ri-tu”.
export function generatePronounceable(length) {
  let password = ''
  for (let i = 0; i < length; i++) {
    const letters = i % 2 === 0 ? CONSONANTS : VOWELS
    password += letters[randomInt(letters.length)]
  }
  return password
}

// Egy mássalhangzó (16-ból egy) 4 bitet ér, egy magánhangzó (5-ből egy) kb. 2,3 bitet.
export function pronounceableEntropy(length) {
  const consonants = Math.ceil(length / 2)
  const vowels = Math.floor(length / 2)
  return Math.round(consonants * Math.log2(CONSONANTS.length) + vowels * Math.log2(VOWELS.length))
}
```

Az `i % 2 === 0` a páros helyeken (0, 2, 4…) igaz: ott mássalhangzó jön, máskor magánhangzó. A `? :` megint a
ternáris operátor, mint az erősségjelzőben. A `Math.ceil` felfelé kerekít, a `Math.floor` lefelé: 7 karakternél
`Math.ceil(7 / 2)` = 4 mássalhangzó és `Math.floor(7 / 2)` = 3 magánhangzó van.

A jelszó fajtája két lehetőség közötti választás: erre valók a [[rádiógombok|rádiógomb]]. Az azonos `name` attribútumú
rádiógombok egy csoportot alkotnak, és egy csoportban egyszerre csak egy lehet kiválasztva. A választó az
`src/components/ModeSwitch.jsx` fájlba kerül:

```jsx file=src/components/ModeSwitch.jsx
const MODES = [
  { value: 'random', label: 'Véletlen karakterek' },
  { value: 'pronounceable', label: 'Kiejthető' },
]

function ModeSwitch({ mode, onChange }) {
  return (
    <fieldset className="choices">
      <legend>A jelszó fajtája</legend>
      {MODES.map((item) => (
        <label key={item.value} className="choices__item">
          <input
            type="radio"
            name="mode"
            value={item.value}
            checked={mode === item.value}
            onChange={() => onChange(item.value)}
          />
          {item.label}
        </label>
      ))}
    </fieldset>
  )
}

export default ModeSwitch
```

Az `App`-ban a hossz és a karakterkészletek mellé egy harmadik állapot kerül: a mód (`mode`). Mostantól három dolog
dönti el, hogyan készül a jelszó, ezért egy segédfüggvény, a `makePassword` kapja meg mindhármat, és minden
eseménykezelő a legfrissebb értékekkel hívja meg. Kiejthető módban a jelölőnégyzeteknek nincs értelme, ezért elrejtjük
őket. Ez a [[feltételes megjelenítés]]: a `{feltétel && <Komponens />}` csak akkor rajzolja ki a komponenst, ha a
feltétel igaz; ha hamis, a helyén nem jelenik meg semmi. Így működött az 1. lecke űrlapjának hibaüzenete is.

```jsx file=src/App.jsx mark=2,7,12-16,21-22,25,30,37,40-43,45-46,64,66
import { useState } from 'react'
import { entropy, generatePassword, generatePronounceable, pronounceableEntropy } from './generator.js'
import LengthSlider from './components/LengthSlider.jsx'
import CopyButton from './components/CopyButton.jsx'
import CharsetOptions from './components/CharsetOptions.jsx'
import StrengthMeter from './components/StrengthMeter.jsx'
import ModeSwitch from './components/ModeSwitch.jsx'
import './App.css'

const START_OPTIONS = { lower: true, upper: true, digits: true, symbols: false }

// Az egyetlen hely, amelyik tudja, hogyan lesz a három beállításból jelszó.
function makePassword(length, options, mode) {
  if (mode === 'pronounceable') return generatePronounceable(length)
  return generatePassword(length, options)
}

function App() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(START_OPTIONS)
  const [mode, setMode] = useState('random') // 'random' vagy 'pronounceable'
  const [password, setPassword] = useState(() => makePassword(16, START_OPTIONS, 'random'))

  function regenerate() {
    setPassword(makePassword(length, options, mode))
  }

  function changeLength(newLength) {
    setLength(newLength)
    setPassword(makePassword(newLength, options, mode))
  }

  function toggleOption(key) {
    // Az options másolata, egy kulcs értékét megfordítva (a true-ból false lesz, és fordítva).
    const newOptions = { ...options, [key]: !options[key] }
    setOptions(newOptions)
    setPassword(makePassword(length, newOptions, mode))
  }

  function changeMode(newMode) {
    setMode(newMode)
    setPassword(makePassword(length, options, newMode))
  }

  // Minden rajzoláskor az állapotból számoljuk: nem kell hozzá saját állapot.
  const bits = mode === 'pronounceable' ? pronounceableEntropy(length) : entropy(length, options)

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <CopyButton key={password} text={password} />
          <button type="button" onClick={regenerate}>
            Új jelszó
          </button>
        </div>
      </section>

      <StrengthMeter bits={bits} />
      <ModeSwitch mode={mode} onChange={changeMode} />
      <LengthSlider value={length} onChange={changeLength} />
      {mode === 'random' && <CharsetOptions options={options} onToggle={toggleOption} />}
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Válaszd a „Kiejthető” módot: a jelszó szótagokból áll, a jelölőnégyzetek eltűnnek, a mérő pedig 16 karakternél csak
„Közepes” (kb. 51 bit). Húzd a csúszkát 30-ra: így már „Nagyon erős”. Ha visszaváltasz a „Véletlen karakterek”-re, a
négyzetek ugyanazokkal a pipákkal térnek vissza, mert az állapotuk az `App`-ban él.
:::

:::mistake Gyakori hiba
Rádiógombok különböző `name`-mel, vagy név nélkül. Ekkor a böngésző nem kezeli őket egy csoportként: a nyílbillentyűk
nem lépkednek köztük, és a képernyőolvasó sem mondja, hogy „2-ből 1”.
:::

:::try Próbáld ki
Kezdődjenek a kiejthető jelszavak nagybetűvel: a `generatePronounceable` végén a
`password[0].toUpperCase() + password.slice(1)` értéket add vissza. Erősebb lesz tőle a jelszó? (Nem: mindig az első
betű nagy, és ezt a támadó is ugyanúgy tudja, mint te.)
:::

### Ellenőrzés a kiszivárgott jelszavak listáján

Időről időre feltörnek egy-egy weboldalt, és az ilyen [[adatszivárgásokból|adatszivárgás]] felhasználók millióinak
jelszava kerül nyilvános listákra az interneten. A támadók ezeket próbálják ki először, ezért ha egy jelszó rajta van egy
ilyen listán, akkor gyenge, akármilyen hosszúnak tűnik is.

Az igazi listák óriásiak, és az ellenőrzéshez egy internetes szolgáltatás kellene. Ebben a kurzusban nem használunk
külső szolgáltatást, ezért egy rövid, helyi listán gyakoroljuk az ötletet: a kiinduló projekttel érkezett
`src/commonPasswords.js` néhány száz nagyon gyakori jelszót tartalmaz, csupa kisbetűvel.

Ha egy tömbben keresel valamit, a gépnek elemenként végig kell mennie rajta. A [[Set]] (halmaz) olyan gyűjtemény, ami
azonnal megmondja, benne van-e valami, akármilyen nagy is. Hozd létre az `src/breach.js` segédfájlt:

```js file=src/breach.js
import { COMMON_PASSWORDS } from './commonPasswords.js'

// Egyszer jön létre, amikor a fájl betöltődik. A Set azonnal megmondja, benne van-e valami.
const COMMON = new Set(COMMON_PASSWORDS)

// A lista csupa kisbetűs, ezért kisbetűsítünk: így a „QWERTY” és a „Qwerty” is fennakad.
export function isCommonPassword(text) {
  return COMMON.has(text.toLowerCase())
}
```

A `new Set(…)` a tömbből halmazt készít, a `has` megmondja, benne van-e egy érték, a `toLowerCase()` pedig csupa
kisbetűssé alakítja a szöveget.

Az ellenőrző saját szövegmezőt kap (megint egy vezérelt mezőt), és gépelés közben válaszol. Az
`src/components/BreachCheck.jsx` fájlba kerül:

```jsx file=src/components/BreachCheck.jsx
import { useState } from 'react'
import { isCommonPassword } from '../breach.js'

function BreachCheck() {
  const [value, setValue] = useState('')
  const found = isCommonPassword(value)

  let message = ''
  if (value !== '' && found) {
    message = 'Ez a jelszó rajta van a gyakori, kiszivárgott jelszavak listáján. Soha ne használd!'
  }
  if (value !== '' && !found) {
    message = 'Nincs rajta a listánkon. Ettől még nem biztos, hogy erős: a lista rövid.'
  }

  return (
    <section className="breach">
      <h2>Rajta van a jelszavad a listán?</h2>
      <label className="breach__field">
        Írj be egy jelszót az ellenőrzéshez
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <p className={found ? 'breach__result is-bad' : 'breach__result'} role="status">
        {message}
      </p>
    </section>
  )
}

export default BreachCheck
```

A `spellCheck={false}` itt fontos: egyes böngészők a mezők szövegét egy online helyesírás-ellenőrzőnek küldik el, egy
jelszónak pedig semmi keresnivalója ott. Az `autoComplete="off"` megkéri a böngészőt, hogy ne ajánlja fel a mezőbe
korábban beírt szövegeket. A `!==` a `===` ellentéte: akkor igaz, ha a két érték különbözik. A `role="status"` miatt a
képernyőolvasók felolvassák a választ, amikor megváltozik. Végül tedd az ellenőrzőt az `App` aljára:

```jsx file=src/App.jsx mark=1,8
import BreachCheck from './components/BreachCheck.jsx'
// … a többi import, a makePassword és az App eleje, mint eddig

  return (
    <main className="generator">
      {/* … minden, mint eddig … */}
      {mode === 'random' && <CharsetOptions options={options} onToggle={toggleOption} />}
      <BreachCheck />
    </main>
  )
}
```

:::check Ellenőrizd
Írd be: `qwerty`, `jelszo123` vagy `Szeretlek`: piros figyelmeztetés. Illeszd be a generált jelszót: „Nincs rajta a
listánkon”. Gratulálok, kész a jelszógenerátorod!
:::

:::concept Hogyan működik az igazi ellenőrzés úgy, hogy a jelszót nem adjuk ki?
Egy igazi szolgáltatás (a legismertebb a Have I Been Pwned) több száz millió kiszivárgott jelszót tárol, de a jelszavadat
bárkinek elküldeni rossz ötlet lenne. Ezért a böngésző először [[hash]]-t készít belőle: egy rögzített hosszúságú
ujjlenyomatot, amiből a jelszót nem lehet visszafejteni. Aztán ennek csak az **első öt karakterét** küldi el. A
szolgáltatás visszaküldi az összes kiszivárgott hash-t, ami ezzel az öt karakterrel kezdődik (több százat), és a
böngésző maga hasonlítja össze őket. A szolgáltatás így sosem tudja meg a jelszót, de még a teljes hash-ét sem. Ezt a
trükköt [[k-anonimitásnak|k-anonimitás]] hívják. Ebben a kurzusban nem hívunk meg ilyen szolgáltatást, de most már
tudod, mi történik, amikor egy jelszókezelő kiszivárgott jelszóra figyelmeztet.
:::

:::mistake Gyakori hiba
A `Set`-et a komponensen belül létrehozni. Ekkor minden billentyűleütésnél, vagyis minden rajzoláskor, újra elkészül a
halmaz az egész listából. Ami sosem változik, annak a komponensen kívül a helye (itt a `breach.js`-ben), ahol csak
egyszer jön létre.
:::

:::try Feladat
Mutasd meg a mező alatt, hány jelszó van a listán: töltsd be a `COMMON_PASSWORDS`-öt a `BreachCheck`-be
(`import { COMMON_PASSWORDS } from '../commonPasswords.js'`), és jelenítsd meg a `COMMON_PASSWORDS.length` értékét.
Aztán írj az `src/commonPasswords.js` tömbjébe néhány jelszót, amiről úgy gondolod, hogy sokan használják (kisbetűvel),
és figyeld, ahogy nő a szám.
:::
