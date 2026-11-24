# Mit építünk?

Egy számológépet, olyat, amilyen a telefonodon is van: számgombok, a négy alapművelet, egyenlőségjel és törlés. Aztán
megtanítjuk a tizedes törtekre, a százalékra és a billentyűzetre, és arra is, hogy megjegyezze az előzményeket; a végén
pedig írsz hozzá egy saját képletértelmezőt, ami tudja, hogy a szorzás előbb jön, mint az összeadás. Közben megtanulod, hogyan
épül fel egy felület apró, újra meg újra felhasznált komponensekből, hogyan fogadja a React a kattintásokat és a
billentyűleütéseket, és hogyan ellenőrzi egy program tesztekkel a saját működését.

:::levels
- Számgombok egy saját gombkomponensből, a négy alapművelet, eredmény és törlés (C). | kb. 2 óra
- Tizedespont, előjelváltás, százalék, billentyűzetes bevitel és az előzmények listája. | kb. 3 óra
- Tesztek, saját képletértelmező műveleti sorrenddel és zárójelekkel, tudományos függvények. | kb. 3 óra
:::

**Előismeret:** az első hét lecke. Leginkább az 1. („Me, Myself & React”), a 3. („Password Generator”) és a 7.
(„Color Palette Generator”) leckére építünk: komponensek, props, `useState`, `useEffect`, eseménykezelők,
billentyűfigyelés és frissítő függvény. Ahol valami korábbit használunk, ott egy-két mondatban felidézzük; minden újat
lépésről lépésre elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke feladata, vagyis a kiinduló projekt, a tananyag GitHub-repójában van, a `lessons/08-calculator/exercise`
mappában (a fenti „Feladat a GitHubon” gomb ezt mutatja meg). Hogy hogyan jutsz hozzá, és hogyan dolgozol benne, azt
az 1. lecke részletesen elmagyarázza; itt röviden csak a parancsok jönnek. Egy terminálban, abban a mappában, ahol a
projektjeidet tartod:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git      # csak az első alkalommal
cp -r rika-mentoring/lessons/08-calculator/exercise calculator    # a feladat saját másolata
```

Ha egy korábbi leckénél már leklónoztad a repót, hagyd ki az első sort, és helyette a `rika-mentoring` mappában
futtasd a `git pull` parancsot (`cd rika-mentoring`, `git pull`, `cd ..`): ez lehozza az új leckéket. Klónozás helyett a
[repó oldalán](https://github.com/mazsola739/rika-mentoring) a **Code → Download ZIP** lehetőséget is választhatod;
ilyenkor abból másold ki a `lessons/08-calculator/exercise` mappát. A másolatod mindkét esetben a `calculator` nevet
kapja, a repó pedig érintetlen marad.

Nyisd meg a szerkesztőben a másolatodat, a `calculator` mappát, és írd be ezt a két parancsot a szerkesztő
termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal felső részén, középen egy sötétkék
számológéptest áll, a tetején kis „CALCULATOR” felirattal, alatta egy fekete kijelzőn egy nagy 0. Gombok még
nincsenek: azokat te készíted el.
:::

Hagyd futni a szervert, nyiss egy második terminált (a terminálpanel **+** gombjával), és tedd a másolatodat
git-repóvá egyetlen committal, a kezdőállapottal:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Ettől kezdve a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni. (Ha a git azt feleli, hogy „Please tell me who you are”, az 1. lecke 0. lépésében megtalálod a két
`git config` parancsot, amely ezt megoldja.)

A kiinduló projektben két fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a számológép testét és a kijelzőjét rajzolja ki; innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért most nem kell
  stílust írnod: csak a lépésekben megadott osztályneveket (`screen`, `keypad`, `key`, `history`, …) használod. Azért
  nézz bele: minden rész előtt egy megjegyzés elmondja, mire való.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a „Calculator” felirat angolul
vannak. Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza: HTML-szerű leírást arról, mi jelenjen meg a képernyőn.
Kívülről a [[props]]-ain keresztül kap adatot, emlékezni pedig a [[useState]] segítségével tud: ha egy állapotérték
megváltozik, a React újrarajzolja a komponenst. Az [[eseménykezelő]] olyan függvény, ami akkor fut le, amikor
történik valami, például egy kattintás. Ezeket mind használtad már; ami új, azt itt elmagyarázzuk.
:::

### Gombok: a Key komponens

Egy számológépen 16 gomb van, és mind ugyanúgy működik: van felirata, van színe, és ha megnyomod, szól, hogy őt
nyomták meg. Ilyenkor nem írunk 16 `<button>`-t egymás alá, hanem egyetlen komponenst, amit 16-szor használunk, mindig
más propokkal. Hozz létre az `src` mappában egy `components` mappát, benne egy `Key.jsx` fájlt:

```jsx file=src/components/Key.jsx
// Egyetlen gomb. Mindent propként kap: a feliratát, a fajtáját, és hogy mit csináljon.
function Key({ label, kind, onPress }) {
  return (
    <button type="button" className={`key key--${kind}`} onClick={() => onPress(label)}>
      {label}
    </button>
  )
}

export default Key
```

- A `label` a gomb felirata, például `'7'` vagy `'+'`.
- A `kind` a gomb fajtája: `'digit'` (számjegy), `'operator'` (műveleti jel), `'equals'` (egyenlőségjel) vagy
  `'function'` (minden más, például a C). A `className` értéke egy [[template literal]], és benne a `${kind}` helyére a
  `kind` értéke kerül: így lesz belőle például `key key--digit`. Ezekhez az osztályokhoz az `App.css` adja a színeket.
- Az `onPress` egy függvény, amit a gomb a szülőjétől kap. A gomb nem tudja, mi a dolga egy számológépben, csak annyit
  mond: „engem nyomtak meg, ez a feliratom”. Ugyanaz az elv, mint a 3. lecke csúszkájánál: az adat propokon át lefelé
  megy, az események függvényeken át felfelé jönnek.

Figyeld meg az `onClick={() => onPress(label)}`-et. Az `onClick` egy függvényt vár, amit a React kattintáskor meghív.
Mi viszont azt szeretnénk, hogy az `onPress` a gomb feliratát is megkapja, ezért egy kis
[[nyílfüggvénybe|nyílfüggvény]] csomagoljuk. A nyílfüggvény rajzoláskor még nem fut le, csak kattintáskor, és akkor
hívja meg az `onPress(label)`-t.

A 16 gomb adatai egy tömbbe kerülnek, a tömbből pedig a `map` készít gombokat, ahogy a 3. leckében a
jelölőnégyzeteket. Hozd létre az `src/components/Keypad.jsx` fájlt:

```jsx file=src/components/Keypad.jsx
import Key from './Key.jsx'

// A gombok sorról sorra, balról jobbra, ahogy a számológépen állnak.
const KEYS = [
  { label: '7', kind: 'digit' },
  { label: '8', kind: 'digit' },
  { label: '9', kind: 'digit' },
  { label: '÷', kind: 'operator' },

  { label: '4', kind: 'digit' },
  { label: '5', kind: 'digit' },
  { label: '6', kind: 'digit' },
  { label: '×', kind: 'operator' },

  { label: '1', kind: 'digit' },
  { label: '2', kind: 'digit' },
  { label: '3', kind: 'digit' },
  { label: '−', kind: 'operator' },

  { label: 'C', kind: 'function' },
  { label: '0', kind: 'digit' },
  { label: '=', kind: 'equals' },
  { label: '+', kind: 'operator' },
]

function Keypad({ onPress }) {
  return (
    <div className="keypad">
      {KEYS.map((item) => (
        <Key key={item.label} label={item.label} kind={item.kind} onPress={onPress} />
      ))}
    </div>
  )
}

export default Keypad
```

A `keypad` osztály egy négyoszlopos rács, ezért a gombok négyesével sorakoznak, pontosan abban a sorrendben, ahogy a
tömbben állnak. A `÷`, a `×` és a `−` nincs rajta a billentyűzeteden: ezek külön karakterek (a `−` hosszabb, mint a
kötőjel), úgyhogy másold ki őket innen, a kódblokk másológombjával.

A `key={item.label}` a [[key]]: az 1. leckéből tudod, hogy a React ebből ismeri fel a lista elemeit. A `key` a React
saját neve, propként el sem jut a komponenshez, ezért a feliratot külön, `label`-ként is átadjuk. A tömb elemét pedig
`item`-nek hívjuk, nem `key`-nek, hogy ne keveredjen össze a React `key`-ével.

A `Keypad` maga sem tudja, mit kell csinálni egy gombnyomásra: a kapott `onPress` függvényt egyszerűen továbbadja
minden gombnak. Az igazi munka az `App`-ban lesz. Egyelőre csak írjuk ki a [[konzolba|konzol]], melyik gombot nyomtad
meg. Írd át az `src/App.jsx`-et így (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1,5-8,17
import Keypad from './components/Keypad.jsx'
import './App.css'

function App() {
  // Egyelőre csak kiírjuk a konzolba, melyik gombot nyomtad meg.
  function handlePress(label) {
    console.log('Megnyomtad:', label)
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <div className="screen">
          <output className="screen__value">0</output>
        </div>
        <Keypad onPress={handlePress} />
      </div>
    </main>
  )
}

export default App
```

A konzol a böngésző üzenőfala a fejlesztőknek: az ++F12++ billentyűvel nyílik, a „Console” fülön. A `console.log(…)`
oda írja ki, amit kap, így belelátsz, mi történik a kódban.

:::check Ellenőrizd
A kijelző alatt négy sorban ott a 16 gomb: a számok sötétkékek, a műveleti jelek narancssárgák, az `=` aranysárga, a
C türkiz betűs. Nyisd meg a konzolt, és nyomkodd a gombokat: minden kattintásra megjelenik egy sor, például
„Megnyomtad: 7”.
:::

:::mistake Gyakori hiba
`onClick={onPress(label)}`, nyílfüggvény nélkül. Ez nem adja át a függvényt, hanem rögtön, rajzolás közben meghívja, és
az eredményét (`undefined`) adja az `onClick`-nek. Már az oldal betöltésekor megjelenik a konzolban
mind a 16 felirat (fejlesztés közben akár kétszer is), a kattintás viszont nem csinál semmit.
:::

:::try Próbáld ki
Cseréld fel a tömbben a `7 8 9` és az `1 2 3` sort (a műveleti jeleik maradjanak a helyükön), ahogy a telefonok
számbillentyűzetén áll: a rács azonnal követi a tömb sorrendjét. Utána állítsd vissza.
:::

### Számok a kijelzőn

Jöjjön az első igazi feladat: a megnyomott számjegyek jelenjenek meg a kijelzőn. Ami az oldal használata közben
változik, az [[állapot]], és ahhoz `useState` kell. A kijelzőn álló számot **szövegként** tároljuk: ha a `'12'` végére
odaírod a `'3'`-at, `'123'` lesz belőle, és pont ez kell. Számokkal a `12 + 3` eredménye 15 lenne.

A kijelző is saját komponenst kap. Hozd létre az `src/components/Display.jsx` fájlt:

```jsx file=src/components/Display.jsx
// A kijelző: azt a számot mutatja, amit a value propban kap.
function Display({ value }) {
  return (
    <div className="screen">
      <output className="screen__value" aria-live="polite">
        {value}
      </output>
    </div>
  )
}

export default Display
```

Az `aria-live="polite"` arra kéri a képernyőolvasókat, hogy olvassák fel a kijelző új tartalmát, amikor megváltozik.
Az `App` tárolja a számot, és minden gombnyomásra frissíti:

```jsx file=src/App.jsx mark=1,2,7,8,11-17,24
import { useState } from 'react'
import Display from './components/Display.jsx'
import Keypad from './components/Keypad.jsx'
import './App.css'

function App() {
  // A kijelzőn álló szám, szövegként.
  const [display, setDisplay] = useState('0')

  function handlePress(label) {
    // Egyelőre csak a számjegyekkel foglalkozunk, a többi gombot kihagyjuk.
    if (!'0123456789'.includes(label)) return
    if (display === '0') {
      setDisplay(label)
    } else {
      setDisplay(display + label)
    }
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <Display value={display} />
        <Keypad onPress={handlePress} />
      </div>
    </main>
  )
}

export default App
```

- A `'0123456789'.includes(label)` akkor igaz, ha a `label` benne van ebben a szövegben, vagyis ha számjegy. A `!`
  megfordítja: ha a gomb **nem** számjegy, a `return` azonnal kilép a függvényből, és nem történik semmi.
- Ha a kijelzőn csak egy 0 áll, a számjegy a helyére kerül, különben a végére. Így lesz a 0 után nyomott 5-ből „5”,
  és nem „05”.

:::check Ellenőrizd
Nyomd meg az 1-et, a 2-t és a 3-at: a kijelzőn 123 áll. A kezdő 0 eltűnik, amint megnyomod az első számjegyet. A
műveleti jelek, az `=` és a C még nem csinálnak semmit.
:::

:::mistake Gyakori hiba
`display = display + label` a `setDisplay(…)` helyett. A `display` egy `const`, ezért a böngésző hibát dob
(„Assignment to constant variable”); de ha `let` volna, a képernyőn akkor sem változna semmi. A React csak akkor
rajzol újra, ha a `set…` függvénnyel adsz új értéket az állapotnak.
:::

### Műveletek: egy állapot, több adat

A műveletekhez a számológépnek több dologra is emlékeznie kell. Ha beírod, hogy `12 + 3`, akkor a `+` megnyomásakor el
kell tennie a 12-t és a `+`-t, a kijelzőn ott marad a 12, a következő számjegy (a 3) viszont már új számot kezd. Ez
négy adat:

- `display`: a kijelzőn álló szám, szövegként;
- `stored`: az első szám (a 12), amíg a másodikat írod;
- `operator`: a választott művelet (a `+`);
- `overwrite`: igaz-e, hogy a következő számjegy új számot kezd.

Ez a négy adat együtt változik: egy műveleti jel egyszerre írja át a `stored`-ot, az `operator`-t és az `overwrite`-ot.
Ezért négy külön `useState` helyett egyetlen [[objektumban|objektum]] tartjuk őket.

Hogy mi történik egy gombnyomásra, annak ráadásul semmi köze a Reacthez: sima JavaScript. Ezért a számológép logikája
külön fájlba kerül (ahogy a 3. leckében a jelszókészítés a `generator.js`-be), és csupa
[[tiszta függvényből|tiszta függvény]] áll. A tiszta függvény csak a paramétereiből dolgozik, és csak a visszatérési
értékével hat a világra: semmit nem ír át, és ugyanarra a bemenetre mindig ugyanazt adja vissza. Itt minden függvény
megkapja a régi állapotot (`calc`), és egy **új** állapotot ad vissza. Hozd létre az `src/calculator.js` fájlt:

```js file=src/calculator.js
// A számológép „agya”: sima JavaScript, React nélkül.
// Minden függvény megkapja a régi állapotot, és egy újat ad vissza; a régit sosem írja át.

// Az állapot induláskor.
export const START = {
  display: '0', // a kijelzőn álló szám, szövegként
  stored: null, // az első szám, amíg a másodikat írod
  operator: null, // a választott művelet: '+', '−', '×' vagy '÷'
  overwrite: false, // true: a következő számjegy új számot kezd
}

const OPERATORS = ['+', '−', '×', '÷']

export function inputDigit(calc, digit) {
  if (calc.overwrite) return { ...calc, display: digit, overwrite: false }
  if (calc.display === '0') return { ...calc, display: digit }
  return { ...calc, display: calc.display + digit }
}

export function chooseOperator(calc, operator) {
  return { ...calc, stored: Number(calc.display), operator, overwrite: true }
}

// Melyik gombot nyomták meg? Ez dönti el, melyik függvény dolgozik.
export function press(calc, label) {
  if ('0123456789'.includes(label)) return inputDigit(calc, label)
  if (OPERATORS.includes(label)) return chooseOperator(calc, label)
  return calc
}
```

- A `null` azt jelenti: „nincs érték”. Induláskor még nincs első szám, és nincs választott művelet.
- A `{ ...calc, display: digit }` a 3. leckéből ismert [[spread]]: lemásolja a régi objektumot, és felülír benne egy-két
  kulcsot. Az állapotot sosem írjuk át közvetlenül (`calc.display = …`): a React csak akkor rajzol újra, ha **új**
  objektumot kap.
- Az `inputDigit` az előző lépés logikája, egy új szabállyal: ha az `overwrite` igaz, a számjegy nem a végére kerül,
  hanem új számot kezd.
- A `Number(calc.display)` számot csinál a szövegből (a 3. lecke csúszkájánál is kellett), hiszen a 12-vel majd számolni
  akarunk. A magában álló `operator` ugyanaz, mint az `operator: operator`: ha a kulcs és a változó neve egyezik, elég
  egyszer leírni.
- A `press` az egyetlen függvény, amit az `App` használni fog. Megnézi a gomb feliratát, és a munkát továbbadja a
  megfelelő függvénynek. Ami nem számjegy és nem műveleti jel, azzal még nem tud mit kezdeni: változatlanul adja vissza
  az állapotot.

Az `App`-ban az egész állapot egyetlen `useState`-be kerül, a gombnyomás pedig egyetlen sor lesz:

```jsx file=src/App.jsx mark=2,8,11,18
import { useState } from 'react'
import { START, press } from './calculator.js'
import Display from './components/Display.jsx'
import Keypad from './components/Keypad.jsx'
import './App.css'

function App() {
  const [calc, setCalc] = useState(START)

  function handlePress(label) {
    setCalc(press(calc, label))
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <Display value={calc.display} stored={calc.stored} operator={calc.operator} />
        <Keypad onPress={handlePress} />
      </div>
    </main>
  )
}

export default App
```

A `{ START, press }` két [[nevesített exportot|nevesített export]] tölt be, név szerint, kapcsos zárójelben, ahogy a 3.
lecke `generator.js`-éből is.

Végül a kijelző: a szám fölött, egy kisebb sorban jelenjen meg a félkész művelet, például „12 +”. De csak akkor, ha már
választottál műveletet! Ez a korábbi leckékből (például a 4.-ből) ismert [[feltételes megjelenítés]]: a
`{feltétel && <…>}` csak akkor rajzolja ki a JSX-et, ha a feltétel igaz. Írd át az `src/components/Display.jsx`-et:

```jsx file=src/components/Display.jsx mark=1,2,5-9
// A kijelző: fent a félkész művelet (ha van), alatta a szám.
function Display({ value, stored, operator }) {
  return (
    <div className="screen">
      {operator && (
        <div className="screen__expression">
          {stored} {operator}
        </div>
      )}
      <output className="screen__value" aria-live="polite">
        {value}
      </output>
    </div>
  )
}

export default Display
```

Amíg az `operator` `null`, a `null && …` értéke `null`, és a React a helyére nem rajzol semmit. Amint van művelet,
kirajzolja a sort. A `{stored} {operator}` közötti szóköz a képernyőn is megmarad.

:::check Ellenőrizd
Nyomd meg: 1, 2, +. A kijelzőn, a szám fölött kis betűkkel megjelenik a „12 +”, alatta ott marad a 12. Nyomd meg a 3-at: a
kijelzőn 3 áll, fölötte még mindig „12 +”. Az `=` és a C egyelőre nem csinál semmit.
:::

:::mistake Gyakori hiba
`{stored && …}` az `{operator && …}` helyett. Ha az első szám 0 („0 +”), a feltétel értéke maga a 0 szám. A React a
`false`-t, a `null`-t és az `undefined`-ot nem rajzolja ki, a 0-t viszont igen: a sor helyén egy magányos 0 jelenik meg.
A `&&` elé ne tegyél számot.
:::

### Egyenlő, törlés és a nullával osztás

Jöhet a számolás. Előbb egy függvény, ami két számmal elvégez egy műveletet, aztán az `=`, ami a félkész művelettel és
a kijelzőn álló számmal meghívja. Itt az egész `src/calculator.js`, ahogy a kezdő szint végén kinéz:

```js file=src/calculator.js mark=10,15-22,31-34,37-44,48,49,52,53
// A számológép „agya”: sima JavaScript, React nélkül.
// Minden függvény megkapja a régi állapotot, és egy újat ad vissza; a régit sosem írja át.

// Az állapot induláskor.
export const START = {
  display: '0', // a kijelzőn álló szám, szövegként
  stored: null, // az első szám, amíg a másodikat írod
  operator: null, // a választott művelet: '+', '−', '×' vagy '÷'
  overwrite: false, // true: a következő számjegy új számot kezd
  error: false, // true: valami nem sikerült (nullával osztás)
}

const OPERATORS = ['+', '−', '×', '÷']

// Egy művelet két számmal. Nullával osztva null az eredmény: ez jelzi, hogy nincs értelmes válasz.
export function calculate(a, operator, b) {
  if (operator === '+') return a + b
  if (operator === '−') return a - b
  if (operator === '×') return a * b
  if (b === 0) return null
  return a / b
}

export function inputDigit(calc, digit) {
  if (calc.overwrite) return { ...calc, display: digit, overwrite: false }
  if (calc.display === '0') return { ...calc, display: digit }
  return { ...calc, display: calc.display + digit }
}

export function chooseOperator(calc, operator) {
  // Ha már vár egy művelet (2 + 3, és most jön a ×), előbb azt számoljuk ki, mintha megnyomtad volna az =-t.
  const current = calc.operator && !calc.overwrite ? equals(calc) : calc
  if (current.error) return current
  return { ...current, stored: Number(current.display), operator, overwrite: true }
}

export function equals(calc) {
  // Nincs választott művelet: nincs mit kiszámolni.
  if (!calc.operator) return calc
  const result = calculate(calc.stored, calc.operator, Number(calc.display))
  // Nullával osztottunk: minden elölről kezdődik, csak a hiba látszik.
  if (result === null) return { ...START, error: true }
  return { ...calc, display: String(result), stored: null, operator: null, overwrite: true }
}

// Melyik gombot nyomták meg? Ez dönti el, melyik függvény dolgozik.
export function press(calc, label) {
  // Hiba után minden gomb tiszta lappal indul, mintha előbb a C-t nyomtad volna meg.
  if (calc.error) return press(START, label)
  if ('0123456789'.includes(label)) return inputDigit(calc, label)
  if (OPERATORS.includes(label)) return chooseOperator(calc, label)
  if (label === '=') return equals(calc)
  if (label === 'C') return START
  return calc
}
```

- A `calculate` megnézi a műveleti jelet, és elvégzi a megfelelő műveletet. Nullával nem lehet osztani, ezért ilyenkor
  `null`-t ad vissza: ez jelzi, hogy nincs értelmes eredmény. (A JavaScript magától `Infinity`-t, végtelent adna.)
- Az `equals` kiszámolja az eredményt, kiírja a kijelzőre (a `String()` szöveggé alakítja), és elfelejti az első számot
  meg a műveletet. Az `overwrite: true` miatt a következő számjegy új számot kezd. Ha nincs választott művelet, nincs
  mit számolni, ezért változatlanul adja vissza az állapotot. Ha pedig a `calculate` `null`-t adott, minden visszaáll a
  kezdőállapotra, csak az `error` lesz `true`.
- A `chooseOperator` is okosabb lett. Ha beírod, hogy `2 + 3 ×`, a `×` megnyomásakor előbb ki kell számolni a
  `2 + 3`-at, különben a 2 elveszne. Ilyenkor tehát először az `equals` fut le, és a következő művelet már az ő
  eredményével (5) indul. A feltétel `!calc.overwrite` része azt nézi, hogy beírtál-e már második számot: a `2 + ×`
  csak lecseréli a műveleti jelet. A `? :` a 3. leckéből ismert [[ternáris operátor]]: ha a feltétel igaz, a
  `current` az `equals(calc)` eredménye, különben maga a `calc`.
- A `press` három új sort kapott. Az `=` az `equals`-t hívja, a C pedig visszaadja a kezdőállapotot. A legelső sor is
  új: hiba után a `press` újra meghívja önmagát, de már a kezdőállapottal, mintha előbb a C-t nyomtad volna meg. Így
  minden gomb tiszta lappal indul.

A hibát a kijelzőnek is meg kell mutatnia. Írd át az `src/components/Display.jsx`-et:

```jsx file=src/components/Display.jsx mark=1,2,10,11
// A kijelző: fent a félkész művelet (ha van), alatta a szám vagy a hibaüzenet.
function Display({ value, stored, operator, error }) {
  return (
    <div className="screen">
      {operator && (
        <div className="screen__expression">
          {stored} {operator}
        </div>
      )}
      <output className={error ? 'screen__value is-error' : 'screen__value'} aria-live="polite">
        {error ? 'Nullával nem lehet osztani' : value}
      </output>
    </div>
  )
}

export default Display
```

Itt kétszer is a ternáris operátor dönt: ha hiba van, a kijelző `is-error` osztályt kap (kisebb, rózsaszín betűk), és a
szám helyett az üzenet jelenik meg. Végül az `src/App.jsx`-ben egyetlen sor változik: a `<Display … />` megkapja az
`error`-t is.

```jsx file=src/App.jsx
        <Display value={calc.display} stored={calc.stored} operator={calc.operator} error={calc.error} />
```

:::check Ellenőrizd
- `12 + 3 =`: a kijelzőn 15, a felső sor eltűnik.
- `2 + 3 × 4 =`: 20. A `×` megnyomásakor már 5 áll a kijelzőn, fölötte „5 ×”. A számológép balról jobbra számol, mint
  egy egyszerű zsebszámológép; a haladó szinten egy képletmezőt is építünk, amelyik már tudja, hogy a szorzás előbb
  jön.
- `7 ÷ 0 =`: „Nullával nem lehet osztani”. Nyomj meg egy számjegyet: az üzenet eltűnik, és a számjegy áll a kijelzőn.
- A C bármikor visszaállítja a 0-t. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
A 12 + 3 eredménye 123. Valahol kimaradt a `Number()`, és az első szám szövegként került a `stored`-ba: a `'12' + 3` a
JavaScriptben szövegösszefűzés, nem összeadás. A `chooseOperator` és az `equals` is számmá alakítja a kijelző
szövegét, mielőtt számolna vele.
:::

:::try Feladat
Jelöld meg a választott műveleti jelet, amíg a második számra vár: legyen fehér a gombja. A `Keypad` kapjon egy
`activeOperator` propot (az `App` a `calc.overwrite ? calc.operator : null` értéket adja neki), és adja tovább minden
`Key`-nek `active={item.label === activeOperator}` alakban. A `Key` osztálynevéhez pedig kerüljön hozzá egy
` is-active`, ha az `active` igaz: ez a stílus már benne van az `App.css`-ben. (A következő lépések kódja a feladat
nélküli változatot mutatja; ha megcsináltad, a te `Key`-edben, `Keypad`-edben és `App`-odban maradjon meg az `active`,
az `activeOperator` és az ` is-active`.)
:::

## Középszint {level=2}

### Tizedespont, előjel, százalék

Három új gomb jön: a tizedespont, az előjelváltás (±) és a százalék (%). Mindegyik egy-egy kis tiszta függvény lesz a
`calculator.js`-ben, de előbb hely kell nekik a gombok között. Az új elrendezés öt sorból áll: legfelül a C, a ± és a
%, legalul pedig a dupla széles 0, a pont és az `=`.

A széles gombhoz a `Key` egy új propot kap, a `wide`-ot. Ha igaz, az osztálynév mögé egy `key--wide` is kerül (ez az
`App.css`-ben két oszlopnyi helyet ad a gombnak). Írd át az `src/components/Key.jsx`-et:

```jsx file=src/components/Key.jsx mark=2-4,6
// Egyetlen gomb. Mindent propként kap: a feliratát, a fajtáját, és hogy mit csináljon.
function Key({ label, kind, wide, onPress }) {
  let className = `key key--${kind}`
  if (wide) className += ' key--wide'
  return (
    <button type="button" className={className} onClick={() => onPress(label)}>
      {label}
    </button>
  )
}

export default Key
```

Ha egy propot nem adsz át, az értéke `undefined`, ami hamisnak számít: a többi gomb ezért nem lesz széles. Az új
elrendezés pedig az `src/components/Keypad.jsx`-be kerül, a `Keypad` a `wide`-ot is továbbadja:

```jsx file=src/components/Keypad.jsx mark=5-8,13,18,23,25-27,34
import Key from './Key.jsx'

// A gombok sorról sorra, balról jobbra, ahogy a számológépen állnak.
const KEYS = [
  { label: 'C', kind: 'function' },
  { label: '±', kind: 'function' },
  { label: '%', kind: 'function' },
  { label: '÷', kind: 'operator' },

  { label: '7', kind: 'digit' },
  { label: '8', kind: 'digit' },
  { label: '9', kind: 'digit' },
  { label: '×', kind: 'operator' },

  { label: '4', kind: 'digit' },
  { label: '5', kind: 'digit' },
  { label: '6', kind: 'digit' },
  { label: '−', kind: 'operator' },

  { label: '1', kind: 'digit' },
  { label: '2', kind: 'digit' },
  { label: '3', kind: 'digit' },
  { label: '+', kind: 'operator' },

  { label: '0', kind: 'digit', wide: true },
  { label: '.', kind: 'digit' },
  { label: '=', kind: 'equals' },
]

function Keypad({ onPress }) {
  return (
    <div className="keypad">
      {KEYS.map((item) => (
        <Key key={item.label} label={item.label} kind={item.kind} wide={item.wide} onPress={onPress} />
      ))}
    </div>
  )
}

export default Keypad
```

Most jöhetnek a függvények. Írd be őket az `src/calculator.js`-be, az `inputDigit` után:

```js file=src/calculator.js
export function inputDecimal(calc) {
  // Új szám kezdődik: a pont elé kell egy 0.
  if (calc.overwrite) return { ...calc, display: '0.', overwrite: false }
  // Egy számban csak egy tizedespont lehet.
  if (calc.display.includes('.')) return calc
  return { ...calc, display: calc.display + '.' }
}

export function toggleSign(calc) {
  if (calc.display === '0') return calc
  if (calc.display.startsWith('-')) return { ...calc, display: calc.display.slice(1) }
  return { ...calc, display: '-' + calc.display }
}

export function percent(calc) {
  const value = Number(calc.display)
  // Összeadásnál és kivonásnál az első szám százaléka: az 50 + 10 % ugyanaz, mint az 50 + 5.
  // Minden más esetben a szám századrésze: a 10 % értéke 0.1.
  const base = calc.operator === '+' || calc.operator === '−' ? calc.stored : 1
  return { ...calc, display: String((base * value) / 100), overwrite: true }
}
```

- A tizedesjel itt pont, nem vessző, ahogy a JavaScriptben és a legtöbb számológépen: a `Number('3.5')` érti, a
  `Number('3,5')` nem (`NaN`, vagyis „nem szám” lesz belőle). Az `includes('.')` megnézi, van-e már pont a számban.
- A `toggleSign` mínuszjelet tesz a szám elé, vagy leveszi róla. A `startsWith('-')` megnézi, hogy a szöveg mínusszal
  kezdődik-e, a `slice(1)` pedig levágja az első karakterét. Itt a sima kötőjel kell, mert a `Number('-5')` ezt érti;
  a `−` csak a gomb felirata. A 0-ból nem csinálunk −0-t.
- A `percent` a legtöbb zsebszámológép szabályát követi: az `50 + 10 %` azt jelenti, „50 meg az 50 tíz százaléka”.
  A `||` jelentése „vagy”: a feltétel akkor igaz, ha az egyik oldala igaz. A % után az `=`-vel zárd le a műveletet,
  mielőtt új műveleti jelet választasz: az `overwrite: true` miatt a `chooseOperator` azt hinné, hogy a második számot
  még nem írtad be, és eldobná a félkész műveletet.

Végül a `press` is megtanulja az új gombokat. Cseréld le az egész függvényt:

```js file=src/calculator.js mark=7-9
// Melyik gombot nyomták meg? Ez dönti el, melyik függvény dolgozik.
export function press(calc, label) {
  // Hiba után minden gomb tiszta lappal indul, mintha előbb a C-t nyomtad volna meg.
  if (calc.error) return press(START, label)
  if ('0123456789'.includes(label)) return inputDigit(calc, label)
  if (OPERATORS.includes(label)) return chooseOperator(calc, label)
  if (label === '.') return inputDecimal(calc)
  if (label === '±') return toggleSign(calc)
  if (label === '%') return percent(calc)
  if (label === '=') return equals(calc)
  if (label === 'C') return START
  return calc
}
```

:::check Ellenőrizd
- Öt sorban állnak a gombok, a 0 két oszlopnyi helyet foglal el.
- `3 . 1 4`: a kijelzőn 3.14; egy második pont nem kerül be. Egy művelet után a pont „0.”-val kezd új számot.
- `5 ±`: -5; még egy ±: újra 5.
- `50 + 10 %`: a % megnyomásakor 5 jelenik meg, az `=` után 55. A `200 × 15 % =` eredménye 30.
:::

:::mistake Gyakori hiba
A 0 nem lett széles, a sor végén üres hely maradt. A `Keypad` nem adta tovább a `wide`-ot: a tömbben hiába áll ott a
`wide: true`, a `Key` csak azt kapja meg, amit a `<Key … />`-nál propként átadsz neki.
:::

### A lebegőpontos csapda

Próbáld ki: `0.1 + 0.2 =`. A kijelzőn 0.30000000000000004 áll. Nem a te hibád: a számítógép kettes számrendszerben
tárolja a számokat, és ott a 0.1-et nem tudja pontosan leírni, ahogy mi sem tudjuk tizedes törtként az 1/3-ot
(0.3333…). A JavaScript számai [[lebegőpontos számok|lebegőpontos szám]]: nagyjából 16
[[értékes jegyig|értékes jegy]] pontosak (az első nem nulla jegytől számolva: a 0.00123-nak három értékes jegye van),
az utolsó jegyekben pedig apró hibák bújnak meg. Minden programnyelvben így van, nem csak a JavaScriptben.

A megoldás: minden eredményt 12 értékes jegyre kerekítünk. A zaj így eltűnik, a valódi jegyek megmaradnak. A
`toPrecision(12)` a számot 12 értékes jegyű **szöveggé** alakítja (`'0.300000000000'`), a `Number()` pedig visszacsinál
belőle számot, és közben a fölösleges nullák is eltűnnek (0.3). Írd be ezt a függvényt az `src/calculator.js`-be, a
`calculate` fölé:

```js file=src/calculator.js
// 12 értékes jegyre kerekít: a 0.30000000000000004-ből 0.3 lesz.
export function roundResult(value) {
  return Number(value.toPrecision(12))
}
```

Aztán használd ott, ahol eredmény születik: a `calculate`-ben minden műveletnél, és a `percent` utolsó sorában. Cseréld
le a két függvényt:

```js file=src/calculator.js mark=3-5,7,15
// Egy művelet két számmal. Nullával osztva null az eredmény: ez jelzi, hogy nincs értelmes válasz.
export function calculate(a, operator, b) {
  if (operator === '+') return roundResult(a + b)
  if (operator === '−') return roundResult(a - b)
  if (operator === '×') return roundResult(a * b)
  if (b === 0) return null
  return roundResult(a / b)
}

export function percent(calc) {
  const value = Number(calc.display)
  // Összeadásnál és kivonásnál az első szám százaléka: az 50 + 10 % ugyanaz, mint az 50 + 5.
  // Minden más esetben a szám századrésze: a 10 % értéke 0.1.
  const base = calc.operator === '+' || calc.operator === '−' ? calc.stored : 1
  return { ...calc, display: String(roundResult((base * value) / 100)), overwrite: true }
}
```

:::check Ellenőrizd
`0.1 + 0.2 =`: 0.3. `1.1 × 3 =`: 3.3 (kerekítés nélkül 3.3000000000000003 volna). `1 ÷ 3 =`: 0.333333333333, vagyis
12 jegy.
:::

:::mistake Gyakori hiba
Kimarad a `Number()`, és a `roundResult` csak a `value.toPrecision(12)`-t adja vissza. Az eredmény ekkor szöveg, tele
fölösleges nullákkal: az `5 + 5 =` után 10.0000000000 áll a kijelzőn.
:::

:::concept Miért 0.999999999999 az 1 ÷ 3 × 3?
Mert a kerekített eredménnyel számolunk tovább: a 0.333333333333 háromszorosa 0.999999999999. Az igazi számológépek a
háttérben néhány jeggyel többet tárolnak, mint amennyit mutatnak, és csak a kijelzőn kerekítenek. Egy zsebszámológéphez
a mi megoldásunk is bőven elég; a haladó szint képletmezője viszont már a teljes képletet egyben számolja ki, ott ez
a gond elő sem jön.
:::

:::try Próbáld ki
Nyisd meg a böngésző konzolját (++F12++), és írd be: `0.1 + 0.2 === 0.3`. Az eredmény `false`! Ezért nem szabad két
tört számot `===`-vel összehasonlítani.
:::

### Billentyűzettel is

Gyorsabb lenne a billentyűzettel számolni: a számjegyek, a `+ - * /`, az ++Enter++ az egyenlőséghez, az ++Esc++ a
törléshez. A 7. leckében, a színpalettánál már figyeltél billentyűre: egy `useEffect`-ben a `window`-ra tettél egy
`keydown` figyelőt, a takarító függvényben pedig levetted. Itt is így lesz. A billentyűzet jelei viszont nem mindig
egyeznek a gombok feliratával (a `*` a `×`, a `/` a `÷`), ezért kell egy kis szótár: egy objektum, ami minden
billentyűhöz megmondja, melyik gombot jelenti. Írd át az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,7-19,24-40
import { useEffect, useState } from 'react'
import { START, press } from './calculator.js'
import Display from './components/Display.jsx'
import Keypad from './components/Keypad.jsx'
import './App.css'

// A billentyűzet jelei, és hogy melyik gombot jelentik. A számjegyek önmagukat jelentik.
const KEYBOARD = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '.': '.',
  ',': '.',
  '%': '%',
  '=': '=',
  Enter: '=',
  Escape: 'C',
}

function App() {
  const [calc, setCalc] = useState(START)

  useEffect(() => {
    function handleKeyDown(event) {
      // A Ctrl-os (Macen a Cmd-os) parancsok, például a nagyítás, maradjanak a böngészőé.
      // A Ctrl és az Alt együtt viszont az AltGr: magyar billentyűzeten azzal írod például a * jelet.
      if (event.metaKey || (event.ctrlKey && !event.altKey)) return
      const label = '0123456789'.includes(event.key) ? event.key : KEYBOARD[event.key]
      // Ez a billentyű nem a számológépé.
      if (!label) return
      // Az Enter ne nyomja meg azt a gombot is, amelyiken éppen a fókusz áll.
      event.preventDefault()
      setCalc((current) => press(current, label))
    }

    window.addEventListener('keydown', handleKeyDown)
    // Takarítás: ha az App eltűnik az oldalról, a figyelő is megszűnik.
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handlePress(label) {
    setCalc(press(calc, label))
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <Display value={calc.display} stored={calc.stored} operator={calc.operator} error={calc.error} />
        <Keypad onPress={handlePress} />
      </div>
    </main>
  )
}

export default App
```

- Az `event.key` a leütött billentyű neve: `'7'`, `'+'`, `'Enter'`, `'Escape'`. Ha számjegy, önmagát jelenti; ha nem,
  a `KEYBOARD[event.key]` keresi ki a szótárból. Ha nincs benne (például az ++A++ betű), az értéke `undefined`, és a
  `return` kilép.
- Az `event.preventDefault()` a 7. leckéből ismert: letiltja a billentyű
  [[alapértelmezett viselkedését|alapértelmezett viselkedés]]. Erre az ++Enter++ miatt van szükség: ha egérrel
  rákattintasz a 7-re, a [[fókusz]] (az az elem, amelyik a leütéseket kapja) a gombon marad, és a böngésző az ++Enter++
  leütésére újra „megnyomná” a fókuszban lévő gombot. Nélküle a `7 Enter`-ből 77 lenne.
- A Ctrl-os billentyűparancsokhoz nem nyúlunk: a ++Ctrl++ + ++-++ maradjon a kicsinyítésé.
- A `[]` [[függőségi tömb]] üres, ezért az effekt csak egyszer fut le, az első rajzolás után: egyetlen figyelő kerül a
  `window`-ra, és a [[takarító függvény]] veszi le, ha az `App` eltűnik.

És a legfontosabb: `setCalc((current) => press(current, label))`. A `setCalc` most nem az új állapotot kapja, hanem egy
függvényt, ami a **legfrissebb** állapotból kiszámolja az újat. Ez a 6. és a 7. leckéből ismert [[frissítő függvény]]: a
React a mindenkori aktuális állapottal hívja meg. Itt muszáj így írni: a `handleKeyDown` az első rajzoláskor jött
létre, és ha a `calc`-ot olvasná, örökké azt a `calc`-ot látná, ami akkor volt, vagyis a kezdőállapotot. A gombok
`handlePress`-e maradhat a régi formában: az minden rajzoláskor újra létrejön, így mindig a friss `calc`-ot látja.

:::check Ellenőrizd
Kattints az oldal egy üres részére, aztán gépeld be: `12+3`, majd ++Enter++: 15. Az ++Esc++ töröl, a `,` és a `.` is
tizedespontot ír, a `*` szoroz, a `/` oszt. Kattints egérrel a 7-re, aztán nyomj ++Enter++-t: nem lesz belőle 77.
:::

:::mistake Gyakori hiba
`setCalc(press(calc, label))` az effektben is. A gombokkal minden működik, a billentyűzettel viszont mindig csak az
utolsó számjegy látszik: az `1 2`-ből 2 lesz. A `calc` a figyelőben örökre a kezdőállapot, így minden leütés a 0-tól
indul. A frissítő függvény megoldja.
:::

:::try Feladat
A ++Backspace++ törölje a kijelzőn álló szám utolsó jegyét. Írj egy `deleteLast(calc)` függvényt a `calculator.js`-be:
ha az `overwrite` igaz, ne csináljon semmit; különben vágja le az utolsó karaktert (`calc.display.slice(0, -1)`), és ha
üres szöveg vagy egy magányos `-` maradt, legyen `'0'` a kijelzőn. A `press` hívja meg a `'⌫'` feliratra, a `KEYBOARD`
pedig kapjon egy `Backspace: '⌫'` sort. (A következő lépés kódja a feladat nélküli változatot mutatja; ha
megcsináltad, a `calculator.js`-ben maradjon meg a `deleteLast` és a `press` `'⌫'` sora, az `App`-ban pedig a
`KEYBOARD` `Backspace: '⌫'` sora.)
:::

### Előzmények

Az utolsó középszintű funkció: minden kiszámolt művelet kerüljön egy listára, a legújabb legfelülre, és egy
kattintással lehessen újra használni a régi eredményeket.

Hol tároljuk a listát? A számításokat az `equals` végzi, és az `equals` a billentyűzetről is lefut, egy frissítő
függvényben. Ott nem állíthatunk egy másik állapotot, mert a frissítő függvénynek is tisztának kell lennie: fejlesztés
közben a React kétszer is meghívhatja (erről szól a lépés végén a „Gyakori hiba” doboz). Ezért az
előzmények is a `calc` objektumba kerülnek, egy [[tömbben|tömb]]. A 7. leckéből tudod, hogy az állapotban lévő tömböt
sem írjuk át: új tömb készül, a `[entry, ...calc.history]` például a régi elemek elé teszi az újat. Itt az egész
`src/calculator.js`, ahogy a középszint végén kinéz:

```js file=src/calculator.js mark=11,68-85,88-91,95-97,104
// A számológép „agya”: sima JavaScript, React nélkül.
// Minden függvény megkapja a régi állapotot, és egy újat ad vissza; a régit sosem írja át.

// Az állapot induláskor.
export const START = {
  display: '0', // a kijelzőn álló szám, szövegként
  stored: null, // az első szám, amíg a másodikat írod
  operator: null, // a választott művelet: '+', '−', '×' vagy '÷'
  overwrite: false, // true: a következő számjegy új számot kezd
  error: false, // true: valami nem sikerült (nullával osztás)
  history: [], // a korábbi számítások, a legújabb elöl
}

const OPERATORS = ['+', '−', '×', '÷']

// 12 értékes jegyre kerekít: a 0.30000000000000004-ből 0.3 lesz.
export function roundResult(value) {
  return Number(value.toPrecision(12))
}

// Egy művelet két számmal. Nullával osztva null az eredmény: ez jelzi, hogy nincs értelmes válasz.
export function calculate(a, operator, b) {
  if (operator === '+') return roundResult(a + b)
  if (operator === '−') return roundResult(a - b)
  if (operator === '×') return roundResult(a * b)
  if (b === 0) return null
  return roundResult(a / b)
}

export function inputDigit(calc, digit) {
  if (calc.overwrite) return { ...calc, display: digit, overwrite: false }
  if (calc.display === '0') return { ...calc, display: digit }
  return { ...calc, display: calc.display + digit }
}

export function inputDecimal(calc) {
  // Új szám kezdődik: a pont elé kell egy 0.
  if (calc.overwrite) return { ...calc, display: '0.', overwrite: false }
  // Egy számban csak egy tizedespont lehet.
  if (calc.display.includes('.')) return calc
  return { ...calc, display: calc.display + '.' }
}

export function toggleSign(calc) {
  if (calc.display === '0') return calc
  if (calc.display.startsWith('-')) return { ...calc, display: calc.display.slice(1) }
  return { ...calc, display: '-' + calc.display }
}

export function percent(calc) {
  const value = Number(calc.display)
  // Összeadásnál és kivonásnál az első szám százaléka: az 50 + 10 % ugyanaz, mint az 50 + 5.
  // Minden más esetben a szám századrésze: a 10 % értéke 0.1.
  const base = calc.operator === '+' || calc.operator === '−' ? calc.stored : 1
  return { ...calc, display: String(roundResult((base * value) / 100)), overwrite: true }
}

export function chooseOperator(calc, operator) {
  // Ha már vár egy művelet (2 + 3, és most jön a ×), előbb azt számoljuk ki, mintha megnyomtad volna az =-t.
  const current = calc.operator && !calc.overwrite ? equals(calc) : calc
  if (current.error) return current
  return { ...current, stored: Number(current.display), operator, overwrite: true }
}

export function equals(calc) {
  // Nincs választott művelet: nincs mit kiszámolni.
  if (!calc.operator) return calc
  const b = Number(calc.display)
  const result = calculate(calc.stored, calc.operator, b)
  // Nullával osztottunk: minden elölről kezdődik, csak a hiba látszik. Az előzmények megmaradnak.
  if (result === null) return { ...START, history: calc.history, error: true }
  // Új bejegyzés az előzmények elejére. A régi tömböt nem írjuk át: újat készítünk.
  const entry = {
    id: calc.history.length + 1,
    expression: `${calc.stored} ${calc.operator} ${b}`,
    result: String(result),
  }
  return {
    ...calc,
    display: String(result),
    stored: null,
    operator: null,
    overwrite: true,
    history: [entry, ...calc.history],
  }
}

// Egy korábbi eredmény vissza a kijelzőre (az előzménylistából).
export function recall(calc, result) {
  return { ...calc, display: result, overwrite: true, error: false }
}

// Melyik gombot nyomták meg? Ez dönti el, melyik függvény dolgozik.
export function press(calc, label) {
  // A C és a hiba után minden elölről kezdődik, csak az előzmények maradnak meg.
  const fresh = { ...START, history: calc.history }
  if (calc.error) return press(fresh, label)
  if ('0123456789'.includes(label)) return inputDigit(calc, label)
  if (OPERATORS.includes(label)) return chooseOperator(calc, label)
  if (label === '.') return inputDecimal(calc)
  if (label === '±') return toggleSign(calc)
  if (label === '%') return percent(calc)
  if (label === '=') return equals(calc)
  if (label === 'C') return fresh
  return calc
}
```

- Minden bejegyzés egy objektum: `id` (a lista `key`-éhez), `expression` (például „12 + 3”) és `result` (szövegként,
  ahogy a kijelzőn áll). Az `id` a lista hossza plusz egy, így minden bejegyzésé más.
- A `${calc.stored} ${calc.operator} ${b}` template literal ugyanazt a sort rakja össze, amit a kijelzőn, a szám
  fölött láttál, csak most a második szám is benne van.
- A C és a hiba után az új `fresh` állapotból indulunk: ez a kezdőállapot, de a régi előzményekkel. Így a törlés nem
  viszi el a listát.
- A `recall` egy korábbi eredményt tesz vissza a kijelzőre. Az `overwrite: true` miatt egy új számjegy lecseréli, egy
  műveleti jel viszont tovább számol vele. Ha épp vár egy művelet, a visszahozott szám lehet a második száma: a
  `10 +`, aztán a lista 15-öse, aztán az `=` 25-öt ad. Egy újabb műveleti jel viszont eldobná a félkész műveletet,
  ugyanúgy, mint a % után.

A lista saját komponenst kap. Hozd létre az `src/components/History.jsx` fájlt:

```jsx file=src/components/History.jsx
// Az előzmények: a korábbi számítások, a legújabb legfelül. Egy bejegyzésre kattintva az eredmény visszakerül a kijelzőre.
function History({ entries, onPick, onClear }) {
  return (
    <section className="history">
      <div className="history__head">
        <h2>Előzmények</h2>
        {entries.length > 0 && (
          <button type="button" className="history__clear" onClick={onClear}>
            Törlés
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="history__empty">Itt jelennek meg a számításaid.</p>
      ) : (
        <ol className="history__list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button type="button" onClick={() => onPick(entry.result)}>
                <span className="history__expression">{entry.expression} =</span>
                <strong>{entry.result}</strong>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default History
```

Kétféle feltételes megjelenítés van benne. A „Törlés” gomb `&&`-del jelenik meg, csak ha van mit törölni. Lejjebb
viszont két lehetőség közül választunk: üres listánál egy kedves üzenet, különben maga a lista. Erre a ternáris
operátor való, JSX-szel mindkét ágában. Az `<ol>` számozott lista; a számait az `App.css` elrejti, de a
képernyőolvasók így is tudják, hogy sorrend van benne. Billentyűzettel a ++Tab++-bal jutsz el egy bejegyzésig, és a
++Szóköz++-zel nyomod meg: az ++Enter++ nálunk mindig az `=`.

Az `App`-ban a lista megkapja a bejegyzéseket és két függvényt, a kattintáshoz és a törléshez. Itt az egész
`src/App.jsx`, ahogy a középszint végén kinéz:

```jsx file=src/App.jsx mark=2,5,47-54,63
import { useEffect, useState } from 'react'
import { START, press, recall } from './calculator.js'
import Display from './components/Display.jsx'
import Keypad from './components/Keypad.jsx'
import History from './components/History.jsx'
import './App.css'

// A billentyűzet jelei, és hogy melyik gombot jelentik. A számjegyek önmagukat jelentik.
const KEYBOARD = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '.': '.',
  ',': '.',
  '%': '%',
  '=': '=',
  Enter: '=',
  Escape: 'C',
}

function App() {
  const [calc, setCalc] = useState(START)

  useEffect(() => {
    function handleKeyDown(event) {
      // A Ctrl-os (Macen a Cmd-os) parancsok, például a nagyítás, maradjanak a böngészőé.
      // A Ctrl és az Alt együtt viszont az AltGr: magyar billentyűzeten azzal írod például a * jelet.
      if (event.metaKey || (event.ctrlKey && !event.altKey)) return
      const label = '0123456789'.includes(event.key) ? event.key : KEYBOARD[event.key]
      // Ez a billentyű nem a számológépé.
      if (!label) return
      // Az Enter ne nyomja meg azt a gombot is, amelyiken éppen a fókusz áll.
      event.preventDefault()
      setCalc((current) => press(current, label))
    }

    window.addEventListener('keydown', handleKeyDown)
    // Takarítás: ha az App eltűnik az oldalról, a figyelő is megszűnik.
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handlePress(label) {
    setCalc(press(calc, label))
  }

  // Egy korábbi eredmény az előzménylistából.
  function handlePick(result) {
    setCalc(recall(calc, result))
  }

  function handleClearHistory() {
    setCalc({ ...calc, history: [] })
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <Display value={calc.display} stored={calc.stored} operator={calc.operator} error={calc.error} />
        <Keypad onPress={handlePress} />
      </div>
      <History entries={calc.history} onPick={handlePick} onClear={handleClearHistory} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Széles képernyőn a számológép mellett megjelenik egy fehér „Előzmények” kártya (telefonon alatta), benne: „Itt
jelennek meg a számításaid.” Számolj ki valamit: `12 + 3 =`, aztán `2 + 3 × 4 =`. A listán legfelül „5 × 4 = 20”,
alatta „2 + 3 = 5” és „12 + 3 = 15”: a láncolt műveletek lépésenként kerülnek fel. Kattints a 15-re: a kijelzőn 15
áll, és nyomhatod tovább, például `+ 1 =`. A „Törlés” kiüríti a listát; a C viszont csak a kijelzőt törli, a listát
nem. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
`calc.history.unshift(entry)` (vagy `push`) a `[entry, ...calc.history]` helyett. Ezek a régi tömböt írják át, és ez a
frissítő függvénynél jön elő: fejlesztés közben a React a [[StrictMode]] miatt kétszer hívja meg, hogy kiderüljön,
tiszta-e. Billentyűzettel számolva így minden bejegyzés kétszer kerül a listára. Mindig új
tömböt adj vissza.
:::

:::try Feladat
Írd ki a címsor mellé, hány számítás van a listán, például „Előzmények (3)”. Az `entries.length` megmondja.
:::

## Haladó szint {level=3}

### Tesztek

Eddig úgy ellenőrizted a számológépet, hogy nyomkodtad. Ez lassú, és könnyű kihagyni valamit: ha később átírod a
`calculator.js`-t, honnan tudod, hogy a százalék még mindig jól számol? Erre valók a [[tesztek|teszt]]:
kis programok, amelyek lefuttatják a kódodat, és ellenőrzik, hogy azt adja-e, amit vársz. Egyetlen paranccsal fut le
mind, másodpercek alatt.

A Node.js-nek van beépített tesztfuttatója, nem kell hozzá semmit telepíteni. Csak sima JavaScriptet tud futtatni,
JSX-et nem; most derül ki, mennyire jó, hogy a számológép agya React nélkül, tiszta függvényekből áll. Egy tiszta
függvényt a legkönnyebb tesztelni: ugyanarra a bemenetre mindig ugyanazt adja.

Először a `package.json`-ba kerül egy új parancs. A projekt gyökerében van; nyisd meg, és a `scripts` részbe írj egy
`test` sort. Ne felejts el vesszőt tenni az előző sor végére:

```json file=package.json mark=4,5
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test"
  },
```

A fájl többi része (a név és a csomagok listája) nem változik. A `node --test` megkeresi a projektben az összes
`.test.js` végű fájlt, és lefuttatja őket. Hozd létre az `src/calculator.test.js` fájlt:

```js file=src/calculator.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { START, press } from './calculator.js'

// Egymás után megnyomja a gombokat, és visszaadja a végső állapotot.
// A for…of egy szövegen betűnként megy végig: a pressAll('12+3=') az 1, 2, +, 3, = gombot nyomja meg.
function pressAll(keys) {
  let calc = START
  for (const label of keys) {
    calc = press(calc, label)
  }
  return calc
}

test('összead', () => {
  assert.equal(pressAll('12+3=').display, '15')
})

test('balról jobbra számol, mint egy zsebszámológép', () => {
  assert.equal(pressAll('2+3×4=').display, '20')
})

test('a 0.1 + 0.2 pontosan 0.3', () => {
  assert.equal(pressAll('0.1+0.2=').display, '0.3')
})

test('az 50 + 10 % az 50 tíz százalékát adja hozzá', () => {
  assert.equal(pressAll('50+10%=').display, '55')
})

test('nullával osztva hibát jelez, a C után pedig újra 0 áll a kijelzőn', () => {
  const calc = pressAll('7÷0=')
  assert.equal(calc.error, true)
  assert.equal(press(calc, 'C').display, '0')
})
```

- A `node:test` és a `node:assert/strict` a Node beépített moduljai; a `node:` előtag jelzi, hogy nem a `node_modules`
  mappából jönnek.
- A `test(név, függvény)` egy teszt. A név mondja meg, mit ellenőriz, a függvény maga az ellenőrzés.
- Az `assert.equal(kapott, várt)` összehasonlítja a két értéket. Ha nem egyeznek, a teszt elbukik, és a futtató
  mindkettőt kiírja.
- A `'2+3×4='`-ben a `×` megint a gomb felirata, nem az x betű, és a `÷` is az.

Futtasd a teszteket a terminálban. A fejlesztői szervert nem kell leállítanod: nyiss egy második terminált (VS Code-ban
a terminál fülsorában a `+` jellel).

```shell
npm test
```

:::check Ellenőrizd
A terminálban öt sor jelenik meg zöld pipával (✔), mindegyikben egy teszt neve, alatta pedig az összesítés:
`tests 5`, `pass 5`, `fail 0`.
:::

:::mistake Gyakori hiba
`Missing script: "test"`: a `test` sor nem a `scripts` részbe került, vagy nem mentetted el a `package.json`-t. Ha
pedig a hibaüzenetben `EJSONPARSE` vagy `JSON.parse` áll, valószínűleg kimaradt a vessző a `"preview"` sor végéről.
:::

:::try Próbáld ki
Rontsd el szándékosan az első tesztet: a `'15'` helyére írj `'16'`-ot, és futtasd újra. Piros `✖` jelzi a bukást, a
hibaüzenetben pedig ott a kapott (`actual`) és a várt (`expected`) érték is. Utána javítsd vissza.
:::

### A képlet szavai: tokenek

A második teszt kimondja, amit már tudsz: a számológépünk szerint a `2 + 3 × 4` eredménye 20, pedig matekórán 14 jön
ki, mert a szorzás előbb jön, mint az összeadás. Ez a [[műveleti sorrend]]. A zsebszámológép minden műveleti jelnél
azonnal számol, ezért nem tudhatja, mi jön még. Ahhoz, hogy a sorrendet betartsuk, előbb a teljes képletet kell
látnunk: például egy szövegmezőben, ahová beírod, hogy `2 + 3 * 4`.

Az ilyen szöveget egy [[parser]] (magyarul: értelmező) dolgozza fel, és most te írsz egyet. Úgy olvas, ahogy te is:
előbb szavakra bontja a mondatot, aztán megérti. A képlet szavai a [[tokenek|token]]: a számok, a műveleti jelek és a
zárójelek. A `'12+3*(4-1)'` tokenjei: `'12'`, `'+'`, `'3'`, `'*'`, `'('`, `'4'`, `'-'`, `'1'`, `')'`. A szóköz nem
token, csak elválaszt. Mivel a képletet gépelni fogod, a parser a billentyűzet jeleit használja: `*`, `/` és sima `-`.

Hozd létre az `src/parser.js` fájlt:

```js file=src/parser.js
// A képletértelmező. Két lépésben dolgozik: előbb tokenekre bontja a képletet (tokenize),
// aztán a tokenekből kiszámolja az eredményt (evaluate, a következő lépésben).

const DIGITS = '0123456789.'
const SYMBOLS = '+-*/()'

// '12+3*(4-1)' → ['12', '+', '3', '*', '(', '4', '-', '1', ')']
export function tokenize(text) {
  const tokens = []
  let i = 0 // hányadik karakternél tartunk
  while (i < text.length) {
    const char = text[i]
    if (char === ' ') {
      // A szóköz csak elválaszt, nem token.
      i++
    } else if (DIGITS.includes(char)) {
      // Egy szám több karakterből is állhat: addig gyűjtjük, amíg számjegy vagy pont jön.
      let number = ''
      while (i < text.length && DIGITS.includes(text[i])) {
        number += text[i]
        i++
      }
      tokens.push(number)
    } else if (SYMBOLS.includes(char)) {
      tokens.push(char)
      i++
    } else {
      throw new Error(`Ismeretlen jel: ${char}`)
    }
  }
  return tokens
}
```

- A `while` addig ismétli a belsejét, amíg a feltétele igaz. Az `i` mutatja, hányadik karakternél tartunk, és a
  `text[i]` maga a karakter. Minden ágnak léptetnie kell az `i`-t, különben a ciklus örökké ugyanazt a karaktert nézné.
- Egy szám több karakterből is állhat (`'12'`, `'2.5'`), ezért egy belső `while` addig gyűjti a karaktereket, amíg
  számjegy vagy pont jön.
- Ha a karakter ismeretlen, a `throw` [[hibát dob|hibadobás]]: a függvény azonnal leáll, és a hiba addig száll felfelé,
  amíg egy `try/catch` el nem kapja (a 3. lecke másológombjában láttál ilyet). A `new Error(…)` szövege a hibaüzenet;
  később a képletmező ezt írja majd ki.

A parser tesztjei külön fájlba kerülnek. Hozd létre az `src/parser.test.js` fájlt:

```js file=src/parser.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokenize } from './parser.js'

test('számokra, jelekre és zárójelekre bontja a képletet', () => {
  assert.deepEqual(tokenize('12+3*(4-1)'), ['12', '+', '3', '*', '(', '4', '-', '1', ')'])
})

test('kihagyja a szóközöket, a tizedes törtet pedig egyben hagyja', () => {
  assert.deepEqual(tokenize(' 2.5 * 40 '), ['2.5', '*', '40'])
})

test('ismeretlen jelre hibát dob', () => {
  assert.throws(() => tokenize('2 # 3'))
})
```

Az `assert.deepEqual` két tömböt elemenként hasonlít össze. Az `assert.equal` itt nem működne: két külön tömb akkor sem
„ugyanaz”, ha ugyanazok vannak benne. Az `assert.throws` azt ellenőrzi, hogy a kapott függvény hibát dob-e.

:::check Ellenőrizd
Az `npm test` most nyolc tesztet futtat le (az öt régit és a hármat az új fájlból), mindet zöld pipával: `pass 8`.
:::

:::mistake Gyakori hiba
A szóközös ágból kimarad az `i++`. Az első szóköznél a ciklus beragad, és örökké ugyanazt a karaktert nézi: az
`npm test` nem ér véget, a terminál csak vár. ++Ctrl++ + ++C++ leállítja; aztán keresd meg, melyik ágból hiányzik a léptetés.
:::

### Műveleti sorrend és zárójelek

Most jön a parser második fele, ami a tokenekből kiszámolja az eredményt. A trükk az, hogy a képletet ugyanúgy
fogalmazzuk meg, ahogy a matekórán tanultad:

- Egy **képlet** tagok összege vagy különbsége: a `2 + 3*4` két tagból áll, a `2`-ből és a `3*4`-ből.
- Egy **tag** tényezők szorzata vagy hányadosa: a `3*4` két tényező.
- Egy **tényező** egy szám, vagy egy zárójeles rész, ami maga is egy teljes képlet, vagy egy mínuszjel és utána egy
  tényező (`-5`).

Ebből a három mondatból három függvény lesz: `parseExpression` (képlet), `parseTerm` (tag) és `parseFactor` (tényező).
A gyengébb művelet fogja össze az erősebbeket: a `parseExpression` csak akkor ad össze, amikor a `parseTerm` már
kiszámolta a szorzatokat. A `2 + 3*4` szerkezete így ez a fa:

```text
      +
     / \
    2   *
       / \
      3   4
```

Előbb a lenti `*`-ot számoljuk ki (12), aztán a fenti `+`-t (14). Itt az egész `src/parser.js`, az új `evaluate`
függvénnyel:

```js file=src/parser.js mark=1,4,36-100
import { roundResult } from './calculator.js'

// A képletértelmező. Két lépésben dolgozik: előbb tokenekre bontja a képletet (tokenize),
// aztán a tokenekből kiszámolja az eredményt (evaluate).

const DIGITS = '0123456789.'
const SYMBOLS = '+-*/()'

// '12+3*(4-1)' → ['12', '+', '3', '*', '(', '4', '-', '1', ')']
export function tokenize(text) {
  const tokens = []
  let i = 0 // hányadik karakternél tartunk
  while (i < text.length) {
    const char = text[i]
    if (char === ' ') {
      // A szóköz csak elválaszt, nem token.
      i++
    } else if (DIGITS.includes(char)) {
      // Egy szám több karakterből is állhat: addig gyűjtjük, amíg számjegy vagy pont jön.
      let number = ''
      while (i < text.length && DIGITS.includes(text[i])) {
        number += text[i]
        i++
      }
      tokens.push(number)
    } else if (SYMBOLS.includes(char)) {
      tokens.push(char)
      i++
    } else {
      throw new Error(`Ismeretlen jel: ${char}`)
    }
  }
  return tokens
}

// Kiszámolja a képletet, a műveleti sorrendet és a zárójeleket betartva.
export function evaluate(text) {
  const tokens = tokenize(text)
  let position = 0 // hányadik tokennél tartunk

  // A soron következő token: megnézzük, de nem lépünk tovább.
  function peek() {
    return tokens[position]
  }

  // A soron következő token, és lépünk egyet.
  function next() {
    const token = tokens[position]
    position++
    return token
  }

  // A következő tokennek pontosan ennek kell lennie, például egy záró zárójelnek.
  function expect(symbol) {
    if (next() !== symbol) throw new Error(`Hiányzik egy ${symbol}`)
  }

  // Képlet: tagok összege vagy különbsége. A leggyengébb művelet, ezért ez fogja össze a többit.
  function parseExpression() {
    let value = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const operator = next()
      const right = parseTerm()
      value = operator === '+' ? value + right : value - right
    }
    return value
  }

  // Tag: tényezők szorzata vagy hányadosa. Erősebb, ezért előbb kerül sorra.
  function parseTerm() {
    let value = parseFactor()
    while (peek() === '*' || peek() === '/') {
      const operator = next()
      const right = parseFactor()
      if (operator === '/' && right === 0) throw new Error('Nullával nem lehet osztani')
      value = operator === '*' ? value * right : value / right
    }
    return value
  }

  // Tényező: egy szám, egy zárójeles képlet vagy egy negatív előjel.
  function parseFactor() {
    const token = next()
    if (token === undefined) throw new Error('A képlet hiányos')
    if (token === '-') return -parseFactor()
    if (token === '(') {
      const value = parseExpression()
      expect(')')
      return value
    }
    const value = Number(token)
    if (Number.isNaN(value)) throw new Error(`Váratlan jel: ${token}`)
    return value
  }

  const result = parseExpression()
  // Ha maradt még token, azzal nem tudtunk mit kezdeni, például a „2 3” vagy az „(1+2))” végén.
  if (position < tokens.length) throw new Error(`Váratlan jel: ${peek()}`)
  return roundResult(result)
}
```

- Az `evaluate` belsejében is vannak függvények. A belső függvények látják a külső függvény változóit (ez a 7. leckéből
  ismert [[closure]]): a `peek` és a `next` ugyanazt a `tokens` tömböt és `position` számlálót használja, így mindegyik
  belső függvény ugyanott tart a tokenek között.
- A `peek` megnézi a következő tokent, a `next` el is veszi. Ha elfogytak a tokenek, a `tokens[position]` értéke
  `undefined`: a `parseFactor` ilyenkor szól, hogy a képlet hiányos (például `2 +`).
- A `parseExpression` először kér egy tagot, aztán amíg `+` vagy `-` jön, kér még egyet, és hozzáadja vagy levonja. A
  `parseTerm` ugyanezt csinálja tényezőkkel, `*`-gal és `/`-lel. Mivel mindkettő balról jobbra halad, a `10 - 4 - 3`
  helyesen 3 lesz.
- A `parseFactor` a zárójelnél meghívja a `parseExpression`-t, az a `parseTerm`-et, az pedig megint a `parseFactor`-t:
  egy függvény a végén (más függvényeken át) önmagát hívja. Ez a [[rekurzió]]. Nem pörög a végtelenségig, mert minden
  hívás elvesz legalább egy tokent, a tokenek pedig egyszer elfogynak. Ettől működik akármilyen mélyen egymásba
  ágyazott zárójel: `2*(3+(4-1))`.
- A `Number(token)` `NaN`-t ad, ha a token nem szám (például a `*2` elején álló `*`). A `NaN` még önmagával sem
  egyenlő, ezért a `Number.isNaN`-nel vizsgáljuk. Az `expect` a záró zárójelhez kell: ha a következő token bármi más,
  hiányzik a zárójel.
- A végén még egy próba: ha maradt token, a képlet hibás (a `2 3` két szám, művelet nélkül).

Írd át az `src/parser.test.js`-t: az első sorokban az `evaluate` is betöltődik, a végére pedig öt új teszt kerül.

```js file=src/parser.test.js mark=3,17-42
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evaluate, tokenize } from './parser.js'

test('számokra, jelekre és zárójelekre bontja a képletet', () => {
  assert.deepEqual(tokenize('12+3*(4-1)'), ['12', '+', '3', '*', '(', '4', '-', '1', ')'])
})

test('kihagyja a szóközöket, a tizedes törtet pedig egyben hagyja', () => {
  assert.deepEqual(tokenize(' 2.5 * 40 '), ['2.5', '*', '40'])
})

test('ismeretlen jelre hibát dob', () => {
  assert.throws(() => tokenize('2 # 3'))
})

test('a szorzás és az osztás előbb jön, mint az összeadás és a kivonás', () => {
  assert.equal(evaluate('2+3*4'), 14)
  assert.equal(evaluate('10-6/2'), 7)
})

test('a zárójel felülírja a sorrendet', () => {
  assert.equal(evaluate('(2+3)*4'), 20)
  assert.equal(evaluate('2*(3+(4-1))'), 12)
})

test('az egyforma erős műveleteket balról jobbra végzi', () => {
  assert.equal(evaluate('10-4-3'), 3)
  assert.equal(evaluate('16/4/2'), 2)
})

test('érti a negatív számokat, és kerekít', () => {
  assert.equal(evaluate('-2*-3'), 6)
  assert.equal(evaluate('0.1+0.2'), 0.3)
})

test('hibás képletre hibát dob', () => {
  assert.throws(() => evaluate('2+'))
  assert.throws(() => evaluate('(1+2'))
  assert.throws(() => evaluate('2 3'))
  assert.throws(() => evaluate('1/0'))
})
```

:::check Ellenőrizd
Az `npm test` 13 tesztet futtat, mind zöld: `pass 13`.
:::

:::mistake Gyakori hiba
Felcserélődik a `+ -` és a `* /` a `parseExpression` és a `parseTerm` között. A parser ekkor fordított sorrendben
számol: a `2+3*4` szerinte 20. Szerencsére van rá teszt: „a szorzás és az osztás előbb jön…” elbukik, és kiírja, hogy
14 helyett 20 jött ki.
:::

### Képletmező

A parser kész, de még csak a tesztek látják. Kapjon egy saját szövegmezőt a számológép alatt: amit beleírsz, annak az
eredménye azonnal megjelenik alatta. A mező [[vezérelt mező]], ahogy a 3. és a 4. leckében: az értékét az állapotból
kapja, minden leütés pedig frissíti az állapotot. Hozd létre az `src/components/FormulaBar.jsx` fájlt:

```jsx file=src/components/FormulaBar.jsx
import { useState } from 'react'
import { evaluate } from '../parser.js'

function FormulaBar() {
  const [text, setText] = useState('')

  // Az eredmény a beírt szövegből következik: minden rajzoláskor kiszámoljuk, nem tároljuk.
  let message = ''
  let failed = false
  if (text.trim() !== '') {
    try {
      message = '= ' + evaluate(text)
    } catch (error) {
      message = error.message
      failed = true
    }
  }

  return (
    <section className="formula">
      <h2>Képlet</h2>
      <label className="formula__field">
        Írj be egy képletet, például (2 + 3) * 4
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <p className={failed ? 'formula__result is-error' : 'formula__result'} role="status">
        {message}
      </p>
    </section>
  )
}

export default FormulaBar
```

- Az eredmény [[származtatott érték]]: a szövegből következik, ezért nem kap saját állapotot, hanem minden rajzoláskor
  kiszámoljuk, ahogy a 3. lecke erősségjelzőjét.
- A `text.trim()` levágja a szöveg elejéről és végéről a szóközöket. Ha semmi nem marad, nincs mit számolni.
- A `try` részben számolunk. Ha az `evaluate` hibát dob, a `catch` elkapja, és megkapja magát a hibát is (`error`). Az
  `error.message` az a szöveg, amit a parserben a `new Error(…)`-nak adtunk, például „A képlet hiányos”.
- A `role="status"` miatt a képernyőolvasók felolvassák az eredményt, amikor megváltozik.

Tedd a mezőt az `App`-ba, az előzmények után. Van még egy dolog: a billentyűzetfigyelő a `window`-on ül, és minden
leütést megkap, azokat is, amiket a szövegmezőbe írsz. A leütés ugyanis a mezőből felfelé, a szülőkön át
[[buborékol|eseménybuborékolás]] egészen a `window`-ig. Ezért a figyelő mostantól nem foglalkozik azokkal a leütésekkel,
amelyek egy beviteli mezőben történtek: az `event.target` az az elem, ahol a leütés történt, a `tagName` pedig a neve
csupa nagybetűvel. Az `src/App.jsx`-ben három helyen kell változtatni: egy új import a fájl elején, egy új sor a
`handleKeyDown` elején, és a `<FormulaBar />` az előzmények után. Minden más marad, ahogy volt:

```jsx file=src/App.jsx mark=1,9,10,23
import FormulaBar from './components/FormulaBar.jsx'
// … a többi import és a KEYBOARD, mint eddig

function App() {
  // … a calc állapot, mint eddig

  useEffect(() => {
    function handleKeyDown(event) {
      // Amit a képletmezőbe írsz, az a mezőé, nem a számológépé.
      if (event.target.tagName === 'INPUT') return
      // … a függvény többi sora, mint eddig
    }

    // … a figyelő felrakása és levétele, mint eddig
  }, [])

  // … a handlePress, a handlePick és a handleClearHistory, mint eddig

  return (
    <main className="app">
      {/* … a számológép, mint eddig … */}
      <History entries={calc.history} onPick={handlePick} onClear={handleClearHistory} />
      <FormulaBar />
    </main>
  )
}
```

:::check Ellenőrizd
A számológép alatt (telefonon a lap alján, az előzmények után) megjelenik a „Képlet” kártya. Írd be: `2 + 3 * 4`. Alatta zölddel
„= 14”. A `(2 + 3) * 4` eredménye 20, a `2 * (3 + (4 - 1))` eredménye 12. Gépelés közben, amíg a képlet félkész
(például `2 +`), pirossal „A képlet hiányos” áll alatta, a `7 / 0`-nál pedig „Nullával nem lehet osztani”. A
számológép kijelzője közben nem változik.
:::

:::mistake Gyakori hiba
Kimarad a `tagName` vizsgálat. Ekkor a mezőbe gépelt számjegyek és műveleti jelek a számológép kijelzőjén jelennek meg:
a mezőbe be sem jutnak, mert a `preventDefault()` letiltja őket. Az ++Enter++ pedig a mezőből is megnyomja az `=`-t.
:::

:::concept Kétféle számológép
Most két számológéped van, és másképp számolnak. A gombos zsebszámológép a `2 + 3 × 4`-re 20-at mond, mert minden
műveleti jelnél azonnal számol. A képletmező 14-et, mert előbb elolvassa az egész képletet. Mindkettő „helyes” a maga
módján: az olcsó zsebszámológépek ma is az elsőt, a tudományos számológépek és a táblázatkezelők a másodikat követik.
:::

### Tudományos függvények

Az utolsó lépés: a parser megtanulja a hatványozást (`2^10`), a négyzetgyököt (`sqrt(16)`), a szinuszt és a koszinuszt
(`sin(30)`, `cos(60)`), meg a pít (`pi`). Három dolog kell hozzá:

1. A tokenizálónak fel kell ismernie a `^` jelet és a betűkből álló neveket (`sqrt`, `pi`).
2. A hatványozás a szorzásnál is erősebb, ezért új szintet kap: a `parsePower`-t, a `parseTerm` és a `parseFactor`
   közé. Egy új erősségi szint mindig egy új függvény a két szomszédja között.
3. A `parseFactor` felismeri a `pi`-t és a függvényneveket.

A függvényeket egy [[Map]]-be tesszük. A Map neveket párosít értékekhez, mint egy objektum. A `new Map([...])` párok
listájából készít egyet, és minden pár egy kis tömb: elöl a név, utána az érték. A `has(név)` megmondja, benne van-e
egy név (mint a 3. lecke haladó szintjén a `Set`-nél), a `get(név)` pedig visszaadja az értékét. Miért nem egy sima
objektum? Egy objektumnak van néhány rejtett, beépített neve is (például a `constructor`), így aki a képletbe azt írja,
hogy `constructor(2)`, egy olyan „függvényt” találna, amit mi sosem írtunk meg. A Map csak azt ismeri, amit mi raktunk
bele. Az értékek most maguk a függvények: egy függvényt
ugyanúgy el lehet tenni egy gyűjteménybe, mint egy számot. A szögfüggvényeknél vigyázni kell: a `Math.sin`
[[radiánban|radián]] számol, nem fokban. A teljes kör 360 fok, vagyis 2π radián, ezért a fokot `π / 180`-nal szorozva
kapjuk meg a radiánt. Itt az egész `src/parser.js`:

```js file=src/parser.js mark=7,8,10-16,35-42,88,91,98-106,108,118-125,134,135
import { roundResult } from './calculator.js'

// A képletértelmező. Két lépésben dolgozik: előbb tokenekre bontja a képletet (tokenize),
// aztán a tokenekből kiszámolja az eredményt (evaluate).

const DIGITS = '0123456789.'
const SYMBOLS = '+-*/()^'
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

// A függvények neve, és amit csinálnak. A szögfüggvények fokban számolnak, mint a számológépek;
// a toFixed(12) kerekítés miatt lesz a cos(90) pontosan 0.
const FUNCTIONS = new Map([
  ['sqrt', (x) => Math.sqrt(x)],
  ['sin', (x) => Number(Math.sin((x * Math.PI) / 180).toFixed(12))],
  ['cos', (x) => Number(Math.cos((x * Math.PI) / 180).toFixed(12))],
])

// '12+3*(4-1)' → ['12', '+', '3', '*', '(', '4', '-', '1', ')']
export function tokenize(text) {
  const tokens = []
  let i = 0 // hányadik karakternél tartunk
  while (i < text.length) {
    const char = text[i]
    if (char === ' ') {
      // A szóköz csak elválaszt, nem token.
      i++
    } else if (DIGITS.includes(char)) {
      // Egy szám több karakterből is állhat: addig gyűjtjük, amíg számjegy vagy pont jön.
      let number = ''
      while (i < text.length && DIGITS.includes(text[i])) {
        number += text[i]
        i++
      }
      tokens.push(number)
    } else if (LETTERS.includes(char)) {
      // Egy név, például sqrt vagy pi: addig gyűjtjük, amíg betű jön.
      let name = ''
      while (i < text.length && LETTERS.includes(text[i])) {
        name += text[i]
        i++
      }
      tokens.push(name)
    } else if (SYMBOLS.includes(char)) {
      tokens.push(char)
      i++
    } else {
      throw new Error(`Ismeretlen jel: ${char}`)
    }
  }
  return tokens
}

// Kiszámolja a képletet, a műveleti sorrendet és a zárójeleket betartva.
export function evaluate(text) {
  const tokens = tokenize(text)
  let position = 0 // hányadik tokennél tartunk

  // A soron következő token: megnézzük, de nem lépünk tovább.
  function peek() {
    return tokens[position]
  }

  // A soron következő token, és lépünk egyet.
  function next() {
    const token = tokens[position]
    position++
    return token
  }

  // A következő tokennek pontosan ennek kell lennie, például egy záró zárójelnek.
  function expect(symbol) {
    if (next() !== symbol) throw new Error(`Hiányzik egy ${symbol}`)
  }

  // Képlet: tagok összege vagy különbsége. A leggyengébb művelet, ezért ez fogja össze a többit.
  function parseExpression() {
    let value = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const operator = next()
      const right = parseTerm()
      value = operator === '+' ? value + right : value - right
    }
    return value
  }

  // Tag: tényezők szorzata vagy hányadosa. Erősebb, ezért előbb kerül sorra.
  function parseTerm() {
    let value = parsePower()
    while (peek() === '*' || peek() === '/') {
      const operator = next()
      const right = parsePower()
      if (operator === '/' && right === 0) throw new Error('Nullával nem lehet osztani')
      value = operator === '*' ? value * right : value / right
    }
    return value
  }

  // Hatvány: a legerősebb művelet. Jobbról balra halad: a 2^3^2 jelentése 2^(3^2), vagyis 2^9.
  function parsePower() {
    const base = parseFactor()
    if (peek() === '^') {
      next()
      return base ** parsePower()
    }
    return base
  }

  // Tényező: egy szám, a pí, egy függvény, egy zárójeles képlet vagy egy negatív előjel.
  function parseFactor() {
    const token = next()
    if (token === undefined) throw new Error('A képlet hiányos')
    if (token === '-') return -parseFactor()
    if (token === '(') {
      const value = parseExpression()
      expect(')')
      return value
    }
    if (token === 'pi') return Math.PI
    if (FUNCTIONS.has(token)) {
      // A függvény neve után zárójelben jön, amire alkalmazni kell: sqrt(16).
      expect('(')
      const value = parseExpression()
      expect(')')
      return FUNCTIONS.get(token)(value)
    }
    const value = Number(token)
    if (Number.isNaN(value)) throw new Error(`Váratlan jel: ${token}`)
    return value
  }

  const result = parseExpression()
  // Ha maradt még token, azzal nem tudtunk mit kezdeni, például a „2 3” vagy az „(1+2))” végén.
  if (position < tokens.length) throw new Error(`Váratlan jel: ${peek()}`)
  // A sqrt(-1)-nek vagy a 10^400-nak nincs kiírható eredménye.
  if (!Number.isFinite(result)) throw new Error('Ezt nem tudom kiszámolni')
  return roundResult(result)
}
```

- A `LETTERS` ág ugyanúgy gyűjt, mint a számoké, csak betűket: a `sqrt(16)` tokenjei `'sqrt'`, `'('`, `'16'`, `')'`.
- A 7. leckéből ismert `toFixed(12)` a tizedespont után 12 jegyre kerekít, nem 12 értékes jegyre, mint a
  `roundResult`. A szögfüggvényeknél ez számít: a 90 fok koszinusza nem pontosan 0, hanem egy 0.00000000000000006 körüli
  apró szám (a JavaScript így írja: `6.123233995736766e-17`). A `roundResult` ezt meghagyná, mert ennek az apró számnak
  is megvan a maga 12 értékes jegye. A `toFixed(12)` után (és a `Number()` után) pontosan 0 marad belőle.
- A `parsePower` kér egy tényezőt, és ha `^` jön utána, a kitevőt megint a `parsePower`-től kéri: ettől halad jobbról
  balra, ahogy a matekban (a `2^3^2` jelentése 2^(3^2), vagyis 2⁹ = 512). A `**` a JavaScript hatványjele, a 3.
  leckéből ismered.
- A `parseTerm` mostantól a `parsePower`-t hívja, nem a `parseFactor`-t: így kerül az új szint a régiek közé.
- A `FUNCTIONS.get(token)` kiveszi a függvényt a Map-ből, a mögé írt `(value)` pedig rögtön meg is hívja.
- A végén egy új próba: a `Number.isFinite` csak a rendes, véges számokra igaz. A negatív szám gyöke (`NaN`) és a
  túl nagy szám (`Infinity`) hibaüzenetet kap.

Írd a három új tesztet az `src/parser.test.js` végére:

```js file=src/parser.test.js
test('hatványoz, jobbról balra', () => {
  assert.equal(evaluate('2^10'), 1024)
  assert.equal(evaluate('2^3^2'), 512)
  assert.equal(evaluate('2*3^2'), 18)
})

test('ismeri a függvényeket és a pít', () => {
  assert.equal(evaluate('sqrt(16)+1'), 5)
  assert.equal(evaluate('sin(30)'), 0.5)
  assert.equal(evaluate('cos(90)'), 0)
  assert.equal(evaluate('2*pi'), 6.28318530718)
})

test('ismeretlen névre és értelmetlen eredményre hibát dob', () => {
  assert.throws(() => evaluate('foo(2)'))
  assert.throws(() => evaluate('sqrt(-1)'))
})
```

Végül a képletmező kap egy sor gombot a gyakori jelekhez, mert a `^` jelet vagy a zárójelet telefonon nehéz begépelni. Egy
gomb a képlet végére írja a jelét, aztán visszaadja a fókuszt a mezőnek, hogy folytathasd a gépelést. Ehhez a mezőt el
kell érnünk a kódból: erre való a [[useRef]] (az 5. leckében a kamerához használtad). A `useRef(null)` egy kis dobozt ad, aminek a `current` nevű rekeszébe a
React beteszi a mezőt, ha a mező megkapja a `ref={inputRef}` propot. Az `inputRef.current.focus()` így magát a mezőt
fókuszálja. Itt az egész `src/components/FormulaBar.jsx`:

```jsx file=src/components/FormulaBar.jsx mark=1,4-13,17,18,20-24,44,52-58
import { useRef, useState } from 'react'
import { evaluate } from '../parser.js'

// Gombok a gyakori jelekhez: a felirat, és amit a képlet végére írnak.
const SHORTCUTS = [
  { label: '(', insert: '(' },
  { label: ')', insert: ')' },
  { label: 'xʸ', insert: '^' },
  { label: '√', insert: 'sqrt(' },
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'π', insert: 'pi' },
]

function FormulaBar() {
  const [text, setText] = useState('')
  // Egy doboz, amiben a React a beviteli mezőt tartja: így vissza tudjuk adni neki a fókuszt.
  const inputRef = useRef(null)

  function insert(part) {
    setText(text + part)
    // A gombra kattintva a fókusz a gombra kerül; visszaadjuk a mezőnek, hogy folytathasd a gépelést.
    inputRef.current.focus()
  }

  // Az eredmény a beírt szövegből következik: minden rajzoláskor kiszámoljuk, nem tároljuk.
  let message = ''
  let failed = false
  if (text.trim() !== '') {
    try {
      message = '= ' + evaluate(text)
    } catch (error) {
      message = error.message
      failed = true
    }
  }

  return (
    <section className="formula">
      <h2>Képlet</h2>
      <label className="formula__field">
        Írj be egy képletet, például (2 + 3) * 4
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <div className="formula__shortcuts">
        {SHORTCUTS.map((item) => (
          <button key={item.label} type="button" onClick={() => insert(item.insert)}>
            {item.label}
          </button>
        ))}
      </div>
      <p className={failed ? 'formula__result is-error' : 'formula__result'} role="status">
        {message}
      </p>
    </section>
  )
}

export default FormulaBar
```

Még egy utolsó csapda: az új gombokhoz a ++Tab++-bal is eljuthatsz, az `App` billentyűzetfigyelője viszont rajtuk is
`=`-vé változtatná az ++Enter++-t. (Kattintás után ez nem jön elő: az `insert` visszaadja a fókuszt a mezőnek.) Egy új
sor az `src/App.jsx` `handleKeyDown`-jának elején meghagyja az ++Enter++-t a képletkártya gombjainak:

```jsx file=src/App.jsx mark=4,5
    function handleKeyDown(event) {
      // Amit a képletmezőbe írsz, az a mezőé, nem a számológépé.
      if (event.target.tagName === 'INPUT') return
      // Az Enter a képletkártya gombján azt a gombot nyomja meg, nem az =-t.
      if (event.key === 'Enter' && event.target.closest('.formula')) return
      // … a függvény többi sora, mint eddig
    }
```

A `closest('.formula')` magát az elemet vagy a szülei közül azt keresi meg, amelyiken `formula` osztály van, és
`null`-t ad, ha nincs ilyen. A feltétel így csak a képletkártyán belül leütött ++Enter++-re igaz.

:::check Ellenőrizd
Az `npm test` 16 tesztet futtat, mind zöld. A böngészőben a mező alatt megjelenik hét gomb. Kattints a `√`-re, és
gépeld be: `16)`. A mezőben `sqrt(16)` áll, alatta „= 4”. Próbáld ki ezeket is: a `2^10` eredménye 1024, a `sin(30)`
0.5, a `2*pi` 6.28318530718, a `sqrt(-1)`-re pedig „Ezt nem tudom kiszámolni” a válasz. Menj el a ++Tab++-bal
egy gombig, és nyomj ++Enter++-t: a jele bekerül a mezőbe, a számológép kijelzője pedig nem változik. Gratulálok, kész
a számológéped!
:::

:::mistake Gyakori hiba
Kimarad a fok–radián átváltás, és a függvény csak `Math.sin(x)`. A `sin(30)` ekkor 0.5 helyett −0.988031624093, mert a
JavaScript 30 radiánnak érti, ami majdnem öt teljes kör.
:::

:::try Feladat
Tanítsd meg a parsernek a tangenst és a tízes alapú logaritmust: két új sor a `FUNCTIONS`-ben (`'tan'` és `'log'`, a
`Math.tan` és a `Math.log10` segítségével; a tangensnél ne felejtsd el az átváltást), két új gomb a `SHORTCUTS`-ban, és
egy-két teszt. Aztán nézd meg, mennyi a `-2^2`. Itt 4, mert nálunk a mínuszjel erősebb a hatványnál, ahogy a
táblázatkezelőkben is; a matekórán viszont −4. Ha ez zavar, a mínuszt a `parseFactor` helyett egy új szintnek kell
kezelnie, a `parseTerm` és a `parsePower` között.
:::
