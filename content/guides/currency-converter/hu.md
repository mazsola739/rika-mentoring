# Mit építünk?

Egy pénznemváltót: beírsz egy összeget, kiválasztod, miből mibe váltanád, és az oldal azonnal kiszámolja. Előbb egy
saját, fix árfolyamtáblázattal dolgozunk, aztán az árfolyamokat egy szervertől kérjük el, ahogy egy igazi app is
csinálná. Ez az első lecke, amelyben az appod a hálózaton át beszélget egy szerverrel: megtanulod, hogyan kér adatot a
`fetch`, mit mutat az oldal, amíg a válaszra vár, és mit akkor, ha a válasz nem jön meg. Ebből lesz egy saját
`useFetch` hook, amit a későbbi leckékben is újra használhatsz.

:::levels
- Összeg és két pénznem, átváltás fix árfolyammal, szépen formázott számokkal. | kb. 2 óra
- Élő árfolyamok egy API-ból a saját `useFetch` hookoddal, cseregomb, betöltési és hibaállapot, az API címe egy `.env` fájlban. | kb. 3 óra
- Árfolyamgrafikon az elmúlt 30 napról, kedvenc pénznempárok és az utolsó ismert árfolyamok gyorsítótárból, ha nincs kapcsolat. | kb. 3 óra
:::

**Előismeret:** az előző leckék. Leginkább ezekre építünk: a 3. lecke (`Promise`, `async`/`await`, `try`/`catch`),
az 5. lecke (`then`, az elavult válaszok eldobása `ignore`-ral), a 2., a 6. és a 9. lecke (saját hook, `useEffect`
takarítással, `useLocalStorage`), a 11. lecke (`Intl.DateTimeFormat`), a 12. lecke (SVG) és a 13. lecke (`??`,
`<dl>`). Ahol egy ismerős dolgot új módon használunk, ott újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/14-currency-converter/exercise` mappában (a fenti
„Feladat a GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Ugyanúgy indulsz, mint az 1. leckében, és annak a 0.
lépése minden parancsot részletesen elmagyaráz. Röviden: nyiss egy terminált a munkamappádban, ahol a `rika-mentoring`
repó van, hozd le az új leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját
`currency-converter` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/14-currency-converter/exercise currency-converter
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/14-currency-converter/exercise` mappát a munkamappádba, `currency-converter` néven. A
másolatodban dolgozol: a repó érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `currency-converter` mappát a szerkesztőben (VS Code-ban: **File** → **Open Folder**), nyiss benne egy
terminált (**Terminal** → **New Terminal**), és indítsd el a projektet:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite, Mock Service Worker)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„Currency Converter” címmel. Más még nincs rajta: a pénznemváltót te építed fel. Ha megnyitod a konzolt (++F12++ →
Console), egy narancsvörös `[MSW] Mocking enabled.` sort is látsz: ez a kitalált szerver, amiről lent olvashatsz.
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

A kiinduló projektben ezek a fájlok fontosak ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ezeket nem kell megírnod, csak a lépésekben megadott osztályneveket
  (`converter`, `field`, `pair`, `result`, `status`, `chart`, …) használod.
- `src/mocks/`: egy kitalált árfolyamszerver. A kezdő szinten még nem kell, a középszinten megismered.
- `src/main.jsx`: két sorral több van benne, mint a korábbi leckékben: ezek a React előtt elindítják a kitalált
  szervert.
- `public/mockServiceWorker.js`: a kitalált szerver egyik része. Ehhez sose kell hozzányúlnod.
- `package.json`: a React és a Vite mellett az `msw` csomag is benne van; a kitalált szerver ezzel működik.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a „Currency Converter” cím angolul
vannak. Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te írsz be, magyar
feliratokkal és megjegyzésekkel mutatjuk.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza. Kívülről a [[props]]-ain keresztül kap adatot, és a
[[useState]] segítségével emlékszik: ha egy állapotérték megváltozik, a React újrarajzolja a komponenst. A rajzoláson
kívüli munka a [[useEffect]]-be kerül. Ami eltart egy ideig, például a vágólapra másolás a 3. leckében, az egy
[[Promise]]-t ad vissza: egy [[async függvényben|async függvény]] az `await` megvárja, a [[try/catch]] pedig elkapja a
hibát. Ezekre a lépésekben röviden emlékeztetünk.
:::

### Fix árfolyamok

Az [[árfolyam]] azt mondja meg, mennyit ér egy pénznem egy másikban: például 1 euró = 373,55 forint. A bankok és az
árfolyam-szolgáltatások általában egyetlen pénznemhez, egy [[bázisvalutához|bázisvaluta]] képest adják meg az összes
többit. Nálunk ez az euró: a táblázatunk azt írja le, hogy **1 euró** mennyit ér a többi pénznemben.

Mi van, ha dollárt váltanál forintra? Ehhez nem kell külön dollár–forint sor a táblázatba: elég az eurón keresztül
számolni. 100 dollár 100 / 1,099 = kb. 91 euró, ami 91 × 373,55 = kb. 33 990 forint. Röviden: 1 dollár = 373,55 /
1,099 forint, vagyis a célpénznem árfolyamát elosztjuk a kiindulóéval. Ezt [[keresztárfolyamnak|keresztárfolyam]]
hívják.

Ennek a logikának semmi köze a Reacthez, ezért külön fájlba kerül. Hozd létre az `src` mappában a `rates.js` fájlt:

```js file=src/rates.js
// Fix mintaárfolyamok: 1 euró mennyit ér a többi pénznemben.
// (Egy 2026. novemberi nap referencia-árfolyamai: gyakorlásra jók, igazi pénzhez nem.)
export const FIXED_RATES = {
  EUR: 1,
  USD: 1.099,
  GBP: 0.83735,
  CHF: 0.9223,
  JPY: 174.35,
  HUF: 373.55,
  PLN: 4.4583,
  CZK: 24.469,
  RON: 5.3493,
  SEK: 11.2125,
}

// Mennyit ér 1 egység a from pénznemből a to pénznemben. Minden árfolyam 1 euróhoz képest van megadva,
// ezért az eurón keresztül számolunk: from → EUR → to.
export function getRate(from, to, rates) {
  return rates[to] / rates[from]
}
```

A `FIXED_RATES` egy [[objektum]]: a kulcsai a pénznemek nemzetközi, hárombetűs kódjai (`EUR`, `USD`, `HUF`…), az
értékei pedig az árfolyamok. A JavaScriptben a tizedesjel pont, nem vessző: `1.099`. A `rates[to]` a szögletes
zárójeles elérés, amit a 3. leckében láttál: azt az értéket adja, amelynek a kulcsa a `to` változóban van. Ha a `to`
értéke `'HUF'`, akkor a `rates[to]` ugyanaz, mint a `rates.HUF`, vagyis 373,55.

Írd át az `src/App.jsx`-et így (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1,5-6,11-15
import { FIXED_RATES, getRate } from './rates.js'
import './App.css'

function App() {
  const amount = 100
  const rate = getRate('EUR', 'HUF', FIXED_RATES)

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <section className="result">
        <p className="result__value">
          {amount} EUR = {amount * rate} HUF
        </p>
      </section>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A cím alatt egy sötétkék dobozban ez áll: „100 EUR = 37355 HUF”.
:::

:::mistake Gyakori hiba
Fordítva osztasz: `rates[from] / rates[to]`. Ekkor a doboz „100 EUR = 0.2677… HUF”-ot ír, mintha 100 euró egy
forintot sem érne. Gondold végig egy ismert párral: 1 euró sok forint, tehát az euró → forint árfolyamnak nagy számnak
kell lennie.
:::

:::try Próbáld ki
Írd át a `getRate('EUR', 'HUF', FIXED_RATES)` hívást `getRate('USD', 'HUF', FIXED_RATES)`-re (és a JSX-ben az `EUR`-t
`USD`-re): valami ilyesmit kapsz, hogy „100 USD = 33989.99090081893 HUF”. Helyes, csak olvashatatlan. A kezdő szint
utolsó lépésében szép számot csinálunk belőle. Utána állítsd vissza.
:::

### Az összeg mezője

Az összeget a felhasználó írja be. Ehhez egy [[vezérelt mező]] kell, ahogy az előző leckékben: az értéke az állapotból
jön, és minden billentyűleütés frissíti az állapotot. Most egy számmezőt használunk: `<input type="number">`.

```jsx file=src/App.jsx mark=1,6,9-11,13-22,27-40
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const rate = getRate('EUR', 'HUF', FIXED_RATES)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  let result
  if (valid) {
    result = (
      <p className="result__value">
        {value} EUR = {value * rate} HUF
      </p>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <section className="result" aria-live="polite">
        {result}
      </section>
    </main>
  )
}

export default App
```

Nézzük sorban:

- Az állapot **szöveg** (`'100'`), nem szám, mert a mező is szöveget ad: az `event.target.value` még egy számmezőben is
  string. Így a mezőt ki is lehet üríteni; ilyenkor `''` lesz az értéke. A `Number(amount)` alakítja számmá, amikor
  számolunk vele.
- A `valid` azt mondja meg, lehet-e számolni: nem üres a mező, és a szám nem negatív. Ha valaki betűt vagy félkész
  számot ír (például `1e`), a számmező `''`-t ad, és az is érvénytelen.
- A `min="0"` miatt a mező nyilai nem mennek nulla alá, a `step="any"` megengedi a tizedeseket (nélküle a böngésző
  csak egész számot tartana helyesnek), az `inputMode="decimal"` pedig telefonon számbillentyűzetet kér.
- A `result` változóba JSX kerül: egy `if`-fel eldöntjük, mi jelenjen meg, és a `return`-ben csak kiírjuk. Ez a
  [[feltételes megjelenítés]] egy újabb formája; hamarosan lesz harmadik eset is, és akkor egy `else if` ág
  kényelmesebb, mint az egymásba ágyazott `? :` operátorok.
- Az `aria-live="polite"` arra kéri a képernyőolvasókat, hogy olvassák fel a doboz új tartalmát, amikor változik.

:::check Ellenőrizd
A cím alatt egy „Összeg” mező van 100-zal. Írj be 250-et: a dobozban azonnal „250 EUR = 93387.5 HUF” áll. Töröld ki a
mezőt, vagy írj be -5-öt: a dobozban az „Adj meg egy összeget (0 vagy több).” felirat jelenik meg.
:::

:::mistake Gyakori hiba
Szám az állapotban: `useState(100)` és `onChange={(event) => setAmount(Number(event.target.value))}`. Elsőre működik,
de próbáld kitörölni a mezőt: a `Number('')` értéke 0, ezért a mezőben azonnal megjelenik egy 0, és sose lesz üres.
Az állapot maradjon az, amit a mező ad, és csak a számoláshoz alakítsd számmá.
:::

:::try Próbáld ki
Kattints a mezőbe, és nyomd meg a ++↑++ vagy a ++↓++ billentyűt: a böngésző egyesével lépteti az összeget, a doboz
pedig minden lépésnél újraszámol.
:::

### Két pénznem

Most a felhasználó választja ki, miből mibe vált. Erre egy [[legördülő lista]] való, a `<select>`, aminek a
lehetőségei `<option>` elemek. Reactben ez is vezérelt mező: a kiválasztott elem a `value`-ból jön, a változást az
`onChange` jelzi. Két ilyen lista kell, ugyanúgy, csak más felirattal és más értékkel, ezért egy komponenst írunk, amit
kétszer használunk. Hozz létre az `src` mappában egy `components` mappát, benne a `CurrencySelect.jsx` fájlt:

```jsx file=src/components/CurrencySelect.jsx
function CurrencySelect({ label, value, codes, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {codes.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CurrencySelect
```

A lista nem maga tárolja a választást: megmutatja a kapott `value`-t, és minden változást jelez az `onChange` propon
keresztül. A választott pénznem az `App`-ban lakik, mert a számoláshoz ott kell ([[állapot felemelése]]). A
`codes.map(…)` a kódok tömbjéből `<option>`-ök listáját készíti, mindegyik egyedi [[key]]-jel.

Az `App`-ban két új állapot jön, a `from` és a `to`. Itt a teljes fájl:

```jsx file=src/App.jsx mark=3,8-9,11-15,25,47-50
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')

  // Egyelőre mindig a fix táblázattal számolunk.
  const rates = FIXED_RATES
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  let result
  if (valid) {
    result = (
      <p className="result__value">
        {value} {from} = {value * rate} {to}
      </p>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
    </main>
  )
}

export default App
```

- Az `Object.keys(rates)` a táblázat kulcsait adja egy tömbben: `['EUR', 'USD', 'GBP', …]`. A `sort()` ábécérendbe
  teszi őket (ahogy a 10. leckében láttad, helyben rendez, de az `Object.keys` úgyis új tömböt ad, így ez itt nem baj).
- A `const rates = FIXED_RATES` most fölöslegesnek tűnik, de a középszinten ide kerül majd az élő táblázat. A sorok
  alatta már a `rates`-szel dolgoznak, így akkor csak ezt az egy sort kell átírni.
- Az `onChange={setFrom}` magát a beállító függvényt adja át: a lista a kiválasztott kóddal hívja meg, és pont ez kell
  nekünk. Ugyanaz, mintha `onChange={(code) => setFrom(code)}`-ot írnál, csak rövidebb.

:::check Ellenőrizd
Az összeg alatt két lista van egymás mellett, „Miből” és „Mibe”, mindkettőben tíz pénznem ábécérendben. Válaszd ki: USD
→ HUF. A doboz: „100 USD = 33989.99090081893 HUF”. Ha mindkét oldalon ugyanaz a pénznem, az eredmény az összeg maga.
:::

:::mistake Gyakori hiba
Sima HTML-ként `selected`-et írsz a kezdő `<option>`-re. Reactben ez nem működik: a kiválasztott elemet a `<select>`
`value`-ja dönti el, a konzol pedig figyelmeztet: „Use the `defaultValue` or `value` props on `<select>` instead of
setting `selected` on `<option>`”.
:::

:::try Próbáld ki
Tegyél egy új pénznemet a `FIXED_RATES`-be, például `NOK: 10.718` (norvég korona). Mindkét listában megjelenik, a
helyén, ábécérendben, és máris lehet vele számolni.
:::

### Olvasható számok

A „33989.99090081893 HUF” helyes, de senki nem így írja a pénzt. Magyarul ezt „33 990 Ft”-nak írjuk (forintnál
tizedesek nélkül, hiszen fillér már nincs), angolul „HUF 33,990”-nek. Minden nyelvnek megvannak a saját szokásai:
tizedesvessző vagy -pont, szóköz vagy vessző az ezresek között, a pénznem jele előtt vagy után. Ezt nem kell
magunknak kitalálni: a böngésző beépített [[Intl]] eszközei minden nyelv szokásait ismerik. A 11. leckében az
`Intl.DateTimeFormat`-tal formáztál dátumot; most az [[Intl.NumberFormat]] formázza a számokat.

```js
new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(33989.99) // „33 990 Ft”
```

Az első paraméter a nyelv és az ország kódja (`'hu-HU'`: magyar, Magyarország), a második a beállítások. A
`style: 'currency'` pénzösszeget kér, a `currency` a pénznem kódja. A formázó maga kerekít (eurónál, dollárnál két
tizedesre, forintnál és jennél egészre). Az árfolyamhoz a `maximumSignificantDigits: 5` beállítás kell: legfeljebb öt
[[értékes jegyet|értékes jegy]] mutat (a 8. leckében találkoztál velük), így a 373,55 és a 0,002677 is jól olvasható.

A pénznemek nevét is tudja a böngésző: az [[Intl.DisplayNames]] a `'HUF'` kódból „magyar forint”-ot csinál. Mindezt
egy külön fájlba tesszük, hogy egy helyen legyen minden, ami formázás. Hozd létre az `src/format.js` fájlt:

```js file=src/format.js
// Az oldalon minden szám és pénznemnév ennek a nyelvnek a szokásait követi.
const LOCALE = 'hu-HU'

// 1234.5 és 'EUR' → „1234,50 EUR”
export function formatMoney(value, currency) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

// Legfeljebb 5 értékes jegy: 373,55 vagy 0,002677
export function formatRate(value) {
  return new Intl.NumberFormat(LOCALE, { maximumSignificantDigits: 5 }).format(value)
}

// A pénznemek neve ezen a nyelven: 'HUF' → „magyar forint”
const currencyNames = new Intl.DisplayNames(LOCALE, { type: 'currency' })

export function currencyName(code) {
  return currencyNames.of(code)
}
```

A `{ style: 'currency', currency }` rövidítés: ha a kulcs és a változó neve ugyanaz, elég egyszer leírni. Ugyanaz,
mint a `{ style: 'currency', currency: currency }`. A `currencyNames` a függvényen kívül, egyszer készül el, amikor a
fájl betöltődik; a függvény csak használja.

A listában a kód mellé kerüljön a név is. Írd át az `src/components/CurrencySelect.jsx`-et:

```jsx file=src/components/CurrencySelect.jsx mark=1,10
import { currencyName } from '../format.js'

function CurrencySelect({ label, value, codes, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {codes.map((code) => (
          <option key={code} value={code}>
            {code} · {currencyName(code)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CurrencySelect
```

A fájl a `components` mappában van, ezért a `'../format.js'` előbb egy mappával feljebb lép (`..`), az `src`-be. Az
`App`-ban az eredmény három sor lesz: a kiinduló összeg, az átváltott összeg és maga az árfolyam. Itt a teljes `App` a
kezdő szint végén:

```jsx file=src/App.jsx mark=3,25-31
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')

  // Egyelőre mindig a fix táblázattal számolunk.
  const rates = FIXED_RATES
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  let result
  if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
    </main>
  )
}

export default App
```

Az `<>` és a `</>` egy [[Fragment]] (a 9. leckéből): összefogja a három bekezdést, hogy egyetlen értékként kerüljenek
a `result`-ba, de a lapon nem hagy nyomot.

:::check Ellenőrizd
A dobozban három sor van: „100,00 EUR =”, alatta nagy, félkövér számokkal „37 355 Ft”, legalul „1 EUR = 373,55 HUF”.
A listákban a kód mellett a név is ott van: „HUF · magyar forint”, „USD · USA-dollár”. Válts USD → JPY-ra: „100,00
USD =”, „15 864 ¥”. (Így írja a Chrome és az Edge; más böngészőben egy-egy apróság, például a tizedesek száma, eltérhet.)
Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
Elgépelt pénznemkód, például `'EURO'` a táblázatban. Az `Intl` eszközei csak a hárombetűs nemzetközi kódokat
(ISO 4217) ismerik, minden mást `RangeError` hibával elutasítanak, és az egész oldal fehér lesz. A konzolban (++F12++)
ott a hiba, például „RangeError: invalid_argument”: ez a `currencyName`-ből jön, ami a listához keresi a nevet.
:::

:::try Próbáld ki
Írd át a `format.js` elején a `LOCALE`-t `'en-GB'`-re, aztán `'de-DE'`-re vagy `'ja-JP'`-re, és figyeld, hogyan
változnak a számok és a pénznemnevek. Utána állítsd vissza `'hu-HU'`-ra.
:::

## Középszint {level=2}

### A cseregomb

Kezdjük valami egyszerűvel. A két lista között egy gomb cserélje meg a két pénznemet: EUR → HUF-ból HUF → EUR legyen.
Az `App`-ban a `valid` sora alá kerül egy függvény, a JSX-ben pedig a két lista közé a gomb:

```jsx file=src/App.jsx mark=22-26,60-68
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')

  // Egyelőre mindig a fix táblázattal számolunk.
  const rates = FIXED_RATES
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // A két pénznem helyet cserél.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Pénznemek cseréje"
          title="Pénznemek cseréje"
        >
          ⇄
        </button>
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
    </main>
  )
}

export default App
```

Két változó cseréjéhez általában egy harmadik, ideiglenes változó kell (a 3. lecke keverésében a `temp`), különben az
első értékadás felülírja azt, amire a másodiknak még szüksége van. Itt nem kell, mert a `setFrom(to)` nem írja át
azonnal a `from`-ot: ebben a rajzolásban a `from` és a `to` végig a régi értékeket tartja, mint egy pillanatkép. Az új
értékek a következő rajzolással érkeznek, és a React a két beállítást egyetlen újrarajzolásban intézi el.

A gombon csak egy jel van (⇄), ami a képernyőolvasónak nem sokat mond. Az [[aria-label]] adja meg a gomb nevét, amit a
képernyőolvasó felolvas, a `title` pedig egy kis buborékban mutatja ugyanezt, ha az egérrel a gomb fölé állsz.

:::check Ellenőrizd
A két lista között egy kerek gomb van, ami megfordul, ha fölé viszed az egeret. Kattints rá: a „Miből” HUF lesz, a „Mibe” EUR, a
doboz pedig ezt mutatja: „100 Ft =”, alatta „0,27 EUR”. Még egy kattintás, és visszaáll.
:::

:::mistake Gyakori hiba
Kimarad az `aria-label`. Ránézésre minden rendben, de a képernyőolvasó csak annyit mond: „gomb”, vagy felolvassa a jel
nevét, és senki nem tudja meg, mire való a gomb.
:::

:::try Próbáld ki
Billentyűzettel: a ++Tab++ billentyűvel lépj a gombra, és nyomd meg az ++Enter++-t vagy a szóközt. Egy igazi `<button>`
ezt magától tudja.
:::

### Az első fetch

A fix árfolyamok csak egyetlen napon voltak pontosak. A valódi árfolyamok minden munkanapon változnak, ezért egy igazi
pénznemváltó egy [[szervertől|szerver]] kéri el őket: egy olyan géptől a hálózaton, amelyik adatokat tárol, és kérésre
kiadja őket. Hogy mit lehet kérni tőle, és milyen címeken, azt a szerver [[API]]-ja írja le (a 3. leckében a böngésző
API-jai szerepeltek; itt egy webes API-ról van szó, amit a hálózaton át szólítunk meg).

A böngésző és a szerver a [[HTTP]] nyelvén beszél. A böngésző küld egy [[kérést|kérés]]: „add ide, ami ezen a címen
van”. A szerver [[választ|válasz]] küld vissza, ami két fontos részből áll: egy [[HTTP-státuszkódból|HTTP-státuszkód]],
ami megmondja, hogy sikerült-e (200: rendben, 404: nincs ilyen, 503: a szolgáltatás most nem elérhető), és a válasz
tartalmából, ami nálunk [[JSON]]-szöveg. A JSON-t már ismered: így mentettünk adatot a localStorage-be is.

Az árfolyamokat erről a címről kérjük: `/api/rates/latest?from=EUR`.

- Az `/api/rates/latest` az [[útvonal]]: melyik adatot kérjük. Az API egy-egy ilyen címét [[végpontnak|végpont]]
  hívják.
- A `?` utáni rész a [[lekérdezési paraméterek|lekérdezési paraméter]] sora: `név=érték` párok, `&` jellel elválasztva.
  A `from=EUR` azt kéri, hogy az árfolyamok euróhoz képest legyenek megadva.

:::concept Honnan jön a válasz?
Ebben a kurzusban nem használunk külső szolgáltatásokat, ezért a kiinduló projektben egy kitalált árfolyamszerver van,
az `src/mocks/` mappában. A [[Mock Service Worker]] (MSW) nevű csomag futtatja, a böngésződben. Egy [[service worker]]
(a 10. lecke haladó szintjén találkoztál vele) egy háttérben futó szkript, ami a lap és a hálózat között áll:
az MSW service workere elkapja az `/api/rates/…` címre menő kéréseket, és az `src/mocks/handlers.js` alapján
válaszol, kis késleltetéssel, mint egy igazi szerver. Az appod kódja nem tudja, és nem is kell tudnia, hogy a válasz
nem a hálózatról jön: pontosan ugyanúgy kér, mint egy igazi szervertől. Ha egyszer igazi API-ra váltasz, csak a címet
kell átírnod.
:::

Mielőtt Reactben írnánk, próbáld ki a kérést a konzolban. Nyisd meg az appodat, aztán a konzolt (++F12++ → Console), és
írd be egyenként ezeket a sorokat:

```js
const response = await fetch('/api/rates/latest?from=EUR')
response.status
const data = await response.json()
data
```

A [[fetch]] elküldi a kérést, és egy Promise-t ad vissza, ami akkor teljesül, amikor megjött a válasz. Az `await`
megvárja (a konzolban `async` függvény nélkül is használhatod). A `response` maga a válasz: a `response.status` a
státuszkód, 200. A tartalma még nincs a kezünkben, mert az darabokban érkezhet a hálózaton; a `response.json()`
beolvassa a végéig, és a JSON-szövegből JavaScript-objektumot csinál. Ez is időbe telik, ezért ez is Promise-t ad
vissza, és egy második `await`-tel várjuk meg. A végén a `data` egy objektum:
`{ amount: 1, base: 'EUR', date: '…', rates: { AUD: …, BRL: …, … } }`.

:::check Ellenőrizd
A `response.status` sor után a konzol `200`-at ír ki, a `data` sor után pedig egy objektumot: a kis háromszöggel
kinyithatod, és benne van az `amount`, a `base`, a `date` és a `rates`. Nyisd ki a `rates`-t is: 29 pénznem van
benne, az euró kivételével mindegyik. Az MSW is kiír egy sort minden kérésről, amit elkapott, például
`[MSW] 10:15:03 GET /api/rates/latest (200 OK)`: ha rákattintasz, a kérést és a választ is megmutatja.
:::

:::try Próbáld ki
A konzolban kérd el a forinthoz viszonyított árfolyamokat: `await fetch('/api/rates/latest?from=HUF').then((r) => r.json())`.
Vagy a pénznemek angol nevét: `await fetch('/api/rates/currencies').then((r) => r.json())`. A `then` (5. lecke) itt
ugyanazt csinálja, mint egy második `await`, csak egy sorban.
:::

### Árfolyamok az appban

A válaszban a dátum is benne van (`date`): ezt is kiírjuk az oldalra. Ehhez előbb kell egy új formázó az
`src/format.js` végére, mert az `App` ezt is importálni fogja. Itt a teljes fájl:

```js file=src/format.js mark=21-25
// Az oldalon minden szám és pénznemnév ennek a nyelvnek a szokásait követi.
const LOCALE = 'hu-HU'

// 1234.5 és 'EUR' → „1234,50 EUR”
export function formatMoney(value, currency) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

// Legfeljebb 5 értékes jegy: 373,55 vagy 0,002677
export function formatRate(value) {
  return new Intl.NumberFormat(LOCALE, { maximumSignificantDigits: 5 }).format(value)
}

// A pénznemek neve ezen a nyelven: 'HUF' → „magyar forint”
const currencyNames = new Intl.DisplayNames(LOCALE, { type: 'currency' })

export function currencyName(code) {
  return currencyNames.of(code)
}

// '2026-11-20' → „2026. nov. 20.”
export function formatDate(isoDate) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  return new Intl.DateTimeFormat(LOCALE, options).format(new Date(isoDate))
}
```

A `new Date('2026-11-20')` az adott nap éjfélét jelenti, de a világidő (UTC) szerint. Ha valaki New Yorkban nyitja meg
az oldalt, ott ez még november 19. este. A `timeZone: 'UTC'` miatt a formázó is világidőben számol, így mindenhol
ugyanaz a nap jelenik meg.

Most jöjjön a konzolban kipróbált kérés az appban. A kérés a rajzoláson kívüli munka, ezért a `useEffect`-be kerül,
üres [[függőségi tömbbel|függőségi tömb]]: így egyszer fut le, az első rajzolás után. A válasz egy új állapotba kerül.

```jsx file=src/App.jsx mark=1,3,11,13-21,23-25,86-88
import { useEffect, useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatDate, formatMoney, formatRate } from './format.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const [liveRates, setLiveRates] = useState(null) // a szerver válasza, ha már megjött

  // Az első rajzolás után elkérjük a szervertől a legfrissebb árfolyamokat.
  useEffect(() => {
    async function load() {
      const response = await fetch('/api/rates/latest?from=EUR')
      const data = await response.json()
      setLiveRates(data)
    }
    load()
  }, [])

  // Az élő táblázat, ha már megjött, addig a fix. A válaszban az euró maga nincs benne
  // (1 euró mindig 1 euró), ezért hozzátesszük.
  const rates = liveRates ? { EUR: 1, ...liveRates.rates } : FIXED_RATES
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // A két pénznem helyet cserél.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Pénznemek cseréje"
          title="Pénznemek cseréje"
        >
          ⇄
        </button>
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
      {liveRates && (
        <p className="status">Élő árfolyamok, frissítve: {formatDate(liveRates.date)}</p>
      )}
    </main>
  )
}

export default App
```

- **Miért egy belső `load` függvény?** Az effekt függvénye nem lehet `async`, mert csak egy takarító függvényt adhat
  vissza (vagy semmit), egy Promise-t nem. Ezért a belsejében írunk egy `async function load()`-ot, és rögtön meg is
  hívjuk. A 9. lecke kitalált szerverénél is így csináltuk.
- **`{ EUR: 1, ...liveRates.rates }`.** A szerver az eurót nem írja bele a saját táblázatába (1 euró = 1 euró), a mi
  `getRate` függvényünknek viszont kell. A [[spread]] átmásolja az összes árfolyamot egy új objektumba, az elejére pedig
  odaírjuk az eurót.
- **Amíg nincs válasz,** a `liveRates` `null`, és a fix táblázattal számolunk. Amikor megjön, a `setLiveRates`
  újrarajzolja az appot, és onnantól az élő táblázat számít.

:::check Ellenőrizd
Frissítsd az oldalt (++F5++). Egy pillanatig a régi, fix eredményt látod, aztán egy kicsit más szám jön (az élő
árfolyam), a doboz alatt pedig megjelenik: „Élő árfolyamok, frissítve:” és a mai nap (hétvégén a pénteki). Nyisd ki a
listát: már nem tíz, hanem harminc pénznem van benne. A fejlesztői eszközök **Network** (Hálózat) fülén szűrj a
**Fetch/XHR** gombbal: ott a `latest?from=EUR` kérés 200-as státusszal. Ha rákattintasz, a **Response** (Válasz) fülön
a JSON-válasz is látszik.
:::

:::concept Miért két kérés?
A Network fülön valószínűleg két `latest?from=EUR` kérést látsz. Ez nem hiba: fejlesztés közben a [[StrictMode]]
(ott van az `src/main.jsx`-ben) szándékosan kétszer futtatja az effekteket, hogy kiderüljenek azok a hibák, amelyek
egy kimaradt takarításból jönnek. Az `npm run build`-del készült, éles változatban egy kérés megy. Két lépés múlva
rendet teszünk: a második kérés válaszát használjuk, az elsőt eldobjuk.
:::

:::mistake Gyakori hiba
Kimarad az `await` a `response.json()` elől. Az oldal fehér lesz, a konzolban (++F12++) pedig ez áll: „RangeError:
Invalid time value”. A `data` ilyenkor nem az objektum, hanem egy Promise, aminek nincs se `rates`, se `date` mezője,
így a `formatDate` egy nem létező dátumot kap, és hibát dob. Ha a React rajzolás közben hibába fut, leáll, és nem marad
semmi a lapon.
:::

### Betöltés és hiba

A hálózaton sok minden történhet: a válasz lassan jön, a szerver éppen nem működik, vagy elment a net. Egy jó app sosem
hagyja találgatni a felhasználót. Minden kérésnek három állapota van, és mindhárom látsszon:

- **betöltés** (loading): a kérés elment, a válasz még nincs itt. Látsszon, hogy dolgozunk.
- **siker** (success): megjött a válasz, megmutatjuk.
- **hiba** (error): nem sikerült. Mondjuk meg, és adjunk egy „Újrapróbálás” gombot.

Hogy ezeket ki is tudd próbálni, a kitalált szervernek van egy gyakorlókapcsolója. Nyisd meg az `src/mocks/handlers.js`
fájlt: az elején a `SERVER_MODE` állandó áll, `'normal'` értékkel. Írd át `'broken'`-re, és mentsd el: az oldal
újratöltődik, és mostantól a szerver minden kérésre 503-as hibával válaszol. Mit csinál ilyenkor a mostani appod?

Semmi jót: az oldal fehér lesz, a konzolban pedig ugyanaz a „RangeError: Invalid time value” áll, mint az előző lépés
hibájánál. A [[fetch]] ugyanis csak akkor dob hibát, ha egyáltalán nem jött válasz. A 503 is válasz, csak rossz hírrel,
és a tartalma is JSON: `{ "error": "unavailable", "message": "…" }`. Ebben nincs se `rates`, se `date`, a `formatDate`
pedig nem tud mit kezdeni a hiányzó dátummal. A `response.ok` mondja meg, hogy sikeres-e a válasz: igaz, ha a
státuszkód 200 és 299 között van. Ha nem az, magunk dobunk hibát.

Először a sor, ami az eredmény alatt elmondja, mi a helyzet. Hozd létre az `src/components/RateStatus.jsx` fájlt:

```jsx file=src/components/RateStatus.jsx
import { formatDate } from '../format.js'

// A sor az eredmény alatt: honnan jönnek az árfolyamok, betöltődnek-e még, vagy mi romlott el.
function RateStatus({ status, error, date, onRetry }) {
  if (status === 'loading') {
    return (
      <p className="status" role="status">
        <span className="spinner" aria-hidden="true" />
        A legfrissebb árfolyamok betöltése…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>
          Nem sikerült betölteni az élő árfolyamokat ({error.message}). Helyettük a fix mintaárfolyamokat látod.
        </p>
        <button type="button" className="button" onClick={onRetry}>
          Újrapróbálás
        </button>
      </div>
    )
  }

  return <p className="status">Élő árfolyamok, frissítve: {formatDate(date)}</p>
}

export default RateStatus
```

Mindhárom állapot külön `return`-t kap: ha a státusz `'loading'`, a függvény az első `return`-nél véget ér, és a többi
sor le sem fut. Ez a [[korai visszatérés]], amit a 4. leckében láttál. A `role="status"` a képernyőolvasónak szól: ha
a szöveg változik, felolvassa, de előbb befejezi, amit éppen mond; a `role="alert"` pedig azonnal, mindent
félbeszakítva felolvassa a hibát. A `spinner` egy forgó karika a CSS-ből.

Most az `App` jön. Négy dolgot kell nyilvántartania a kérésről: a választ, a kérés állapotát (`'loading'`,
`'success'` vagy `'error'`), a hibát és azt, hányadszor próbálkozunk. Itt a teljes fájl:

```jsx file=src/App.jsx mark=3,5,13-15,19-31,34,36-38,54-56,101-106
import { useEffect, useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const [liveRates, setLiveRates] = useState(null) // a szerver válasza, ha már megjött
  const [status, setStatus] = useState('loading') // 'loading', 'success' vagy 'error'
  const [error, setError] = useState(null) // mi romlott el, ha valami elromlott
  const [attempt, setAttempt] = useState(0) // az „Újrapróbálás” növeli, és az effekt újra lefut

  useEffect(() => {
    async function load() {
      setStatus('loading')
      try {
        const response = await fetch('/api/rates/latest?from=EUR')
        // A fetch csak akkor hibázik magától, ha egyáltalán nem jött válasz.
        // A hibát jelző választ (404, 503…) nekünk kell észrevennünk.
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        setLiveRates(data)
        setStatus('success')
      } catch (err) {
        setError(err)
        setStatus('error')
      }
    }
    load()
  }, [attempt])

  // Az élő táblázat, ha megjött; ha nem sikerült, a fix mintaárfolyamok.
  let rates = FIXED_RATES
  if (status === 'success') rates = { EUR: 1, ...liveRates.rates }
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // A két pénznem helyet cserél.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (status === 'loading') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Pénznemek cseréje"
          title="Pénznemek cseréje"
        >
          ⇄
        </button>
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
      <RateStatus
        status={status}
        error={error}
        date={liveRates?.date}
        onRetry={() => setAttempt(attempt + 1)}
      />
    </main>
  )
}

export default App
```

A `formatDate` importja kikerült, mert a dátumot mostantól a `RateStatus` formázza.

- **`try`/`catch`.** Minden, ami a kérés közben elromolhat, a `try` részben van: ha a `fetch` nem kap választ, ha mi
  dobunk hibát a `throw new Error(…)`-ral, vagy ha a válasz nem JSON, a kód a `catch` részben folytatódik. Ott
  eltesszük a hibát, és `'error'`-ra állítjuk az állapotot. Az `Error` üzenetébe a [[template literal]] beírja a
  státuszkódot: „HTTP 503”.
- **Újrapróbálás.** Az `attempt` a függőségi tömbben van. A gomb eggyel növeli, ettől az effekt újra lefut: a
  `setStatus('loading')` visszaállítja a betöltési állapotot, és indul az új kérés.
- **Betöltés közben** az eredmény helyén egy halványan csillogó sáv van (`result__skeleton`), mert még nem tudjuk,
  mennyi az árfolyam. Hiba esetén a fix táblázattal számolunk, és a sor alatta megmondja, hogy ez nem élő adat.
- **`liveRates?.date`.** Ez az [[opcionális láncolás]]: ha a `liveRates` `null` (még nincs válasz), az egész kifejezés
  `undefined` lesz, ahelyett, hogy hibát dobna, mint a `liveRates.date`. A `RateStatus` úgyis csak siker esetén
  használja a dátumot.

:::check Ellenőrizd
A `SERVER_MODE` most `'broken'`: egy pillanatra a csillogó sáv és a forgó karika jelenik meg, aztán egy narancssárga
csík: „Nem sikerült betölteni az élő árfolyamokat (HTTP 503). Helyettük a fix mintaárfolyamokat látod.” A dobozban a
fix árfolyammal számolt eredmény van. Ha az „Újrapróbálás” gombra kattintasz, újra betölt, aztán megint hibát mutat.
Próbáld ki a többi módot is: `'slow'`-nál három másodpercig látod a betöltést; `'flaky'`-nél nagyjából minden második
válasz hiba, így néhány „Újrapróbálás” után sikerül; `'offline'`-nál a hiba „Failed to fetch”, mert ott válasz sem
jön. A végén állítsd vissza `'normal'`-ra.
:::

:::mistake Gyakori hiba
Kimarad az `if (!response.ok)` sor. Siker esetén semmi különbség, de `'broken'` módban a hibaüzenet JSON-ja kerül a
`liveRates`-be, a `status` pedig `'success'` lesz, és az oldal megint fehér, ugyanazzal a „RangeError: Invalid time
value” hibával. A `fetch` egy 404-es vagy egy 503-as választ is sikeresnek tekint: azt, hogy jó-e a válasz, neked kell
megnézned.
:::

:::try Próbáld ki
Írd át a címet `'/api/rates/latest?from=XYZ'`-re: „HTTP 404”. A Network fülön a válasz tartalma azt is elárulja, mi a
baj: `{"error":"not_found","message":"Unknown currency: XYZ"}`. Utána írd vissza.
:::

### Saját hook: useFetch

A kérés most négy állapotot és egy effektet foglal el az `App`-ban, pedig az `App` dolga a pénznemváltás. A haladó
szinten jön egy második kérés is (a grafikon adatai), és ugyanezt még egyszer megírni nem lenne jó ötlet. Ezért a kérés
kezelése egy [[saját hookba|saját hook]] kerül. A 2. leckében a `useDarkMode`-dal, a 6.-ban és a 9.-ben a
`useLocalStorage`-dzsel már írtál ilyet: egy `use`-zal kezdődő függvény, ami más hookokat hív.

A hook bármilyen címről tudjon JSON-t kérni: a címet paraméterként kapja. Hozd létre az `src/useFetch.js` fájlt:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// JSON-t kér a megadott címről, és elmondja, hogy áll a kérés: { data, status, error, retry }.
function useFetch(url) {
  const [data, setData] = useState(null) // a válasz tartalma, ha megjött
  const [status, setStatus] = useState('loading') // 'loading', 'success' vagy 'error'
  const [error, setError] = useState(null) // mi romlott el, ha valami elromlott
  const [attempt, setAttempt] = useState(0) // a retry növeli, és az effekt újra lefut

  useEffect(() => {
    let ignore = false

    async function load() {
      setStatus('loading')
      try {
        const response = await fetch(url)
        // A fetch csak akkor hibázik magától, ha egyáltalán nem jött válasz.
        // A hibát jelző választ (404, 503…) nekünk kell észrevennünk.
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const body = await response.json()
        if (ignore) return
        setData(body)
        setStatus('success')
      } catch (err) {
        if (ignore) return
        setError(err)
        setStatus('error')
      }
    }

    load()
    // Takarítás: ha új kérés indul, vagy a komponens eltűnik,
    // ennek a kérésnek a válaszára már nincs szükség.
    return () => {
      ignore = true
    }
  }, [url, attempt])

  function retry() {
    setAttempt(attempt + 1)
  }

  return { data, status, error, retry }
}

export default useFetch
```

Ez ugyanaz a kód, ami eddig az `App`-ban volt, három különbséggel:

- **A cím paraméter,** és benne van a függőségi tömbben. Ha a hook egyszer egy új címet kap, az effekt újra lefut, és
  új kérés indul. A grafikonnál pont ez kell: más pár, más cím, új adatok.
- **`ignore`.** Ha a cím gyorsan változik, egyszerre több kérés is úton lehet, és a válaszok bármilyen sorrendben
  megjöhetnek. Egy lassú, régi válasz felülírhatná az újabbat: ez a [[versenyhelyzet]], amivel az 5. és a 9. leckében
  már találkoztál. A [[takarító függvény]] minden új kérés előtt (és amikor a komponens eltűnik) `true`-ra állítja a
  régi kérés `ignore`-ját, így annak a válaszát eldobjuk. A [[StrictMode]] kettős futtatásánál is így lesz: az első
  kérés válaszát eldobjuk, a másodikét használjuk.
- **Objektumot ad vissza,** nem tömböt, mint a `useState` vagy a `useLocalStorage`. Négy értéknél a nevek többet
  mondanak, mint a sorrend: `latest.status`, `latest.data`, és nem kell emlékezni, hányadik mi.

Az `App` sokkal rövidebb lesz. Itt a teljes fájl:

```jsx file=src/App.jsx mark=1,4,13,17,33,81-84
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import useFetch from './useFetch.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const latest = useFetch('/api/rates/latest?from=EUR')

  // Az élő táblázat, ha megjött; ha nem sikerült, a fix mintaárfolyamok.
  let rates = FIXED_RATES
  if (latest.status === 'success') rates = { EUR: 1, ...latest.data.rates }
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // A két pénznem helyet cserél.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (latest.status === 'loading') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Pénznemek cseréje"
          title="Pénznemek cseréje"
        >
          ⇄
        </button>
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
      <RateStatus
        status={latest.status}
        error={latest.error}
        date={latest.data?.date}
        onRetry={latest.retry}
      />
    </main>
  )
}

export default App
```

A `useEffect` már nem kell az `App`-ban, ezért az első sorból kikerült. A `latest` a hook által visszaadott objektum;
az `onRetry={latest.retry}` a hook `retry` függvényét adja tovább a gombnak.

:::check Ellenőrizd
Kívülről semmi nem változott: ugyanúgy jön a betöltés, aztán az élő árfolyam. Próbáld ki `'flaky'` módban is: a hiba és
az „Újrapróbálás” ugyanúgy működik, mint az előző lépésben. Utána állítsd vissza `'normal'`-ra.
:::

:::mistake Gyakori hiba
Megszokásból tömbként bontod szét, mint a `useState`-et: `const [data, status] = useFetch(…)`. Ez a hook objektumot
ad vissza, amit nem lehet tömbként szétszedni: az oldal fehér lesz, a konzolban pedig ez áll: „useFetch is not a
function or its return value is not iterable”. Objektumot kapcsos zárójellel lehet szétbontani, a nevek alapján:
`const { data, status } = useFetch(…)`, vagy használd egyben, ahogy az `App` teszi: `latest.status`.
:::

:::try Próbáld ki
Írj egy `console.log('megjött a válasz, ignore =', ignore)` sort a `const body = …` sor alá, és frissítsd az oldalt. A
konzolban (a StrictMode miatt) kétszer jelenik meg: egyszer `true`-val (ezt a választ eldobjuk), egyszer `false`-szal.
Utána töröld a sort.
:::

:::concept A kérés megszakítása: AbortController
Az `ignore` eldobja a felesleges választ, de maga a kérés attól még végigfut. A böngészőben van mód a kérés
megszakítására is: egy `AbortController`, aminek a `signal`-ját odaadjuk a `fetch`-nek (`fetch(url, { signal })`), és
a takarító függvényben meghívjuk az `abort()`-ját. Ilyenkor a `fetch` `AbortError` hibát dob, amit a `catch`-ben ki
kell szűrni. Sok kérésnél vagy nagy letöltésnél ez erőforrást takarít meg, a mi kis válaszainknál az `ignore` is elég.
:::

### Az API címe egy .env fájlban

A cím, `/api/rates`, most bele van írva a kódba. Egy igazi projektben ez gyakran változik: fejlesztés közben egy
tesztszerverhez beszélsz, élesben egy másikhoz, és sok API a cím mellé egy kulcsot is kér. Az ilyen beállítások nem a
kódba valók, hanem [[környezeti változókba|környezeti változó]]: ezek a programon kívül, a futtatás környezetében megadott
értékek. A Vite-os projektekben egy `.env` nevű fájlba írod őket.

Hozz létre a projekt gyökerében (a `package.json` mellett, **nem** az `src`-ben) egy `.env` nevű fájlt. A neve tényleg
csak ennyi: pont, utána `env`, kiterjesztés nélkül.

```text file=.env
# Az árfolyam-API címe. A kód az import.meta.env.VITE_RATES_API néven olvassa.
VITE_RATES_API=/api/rates
```

Minden sor egy `NÉV=érték` pár, a `#`-tel kezdődő sorok megjegyzések. Az értéket nem kell idézőjelbe tenni. A Vite
indításkor beolvassa a fájlt, és a kódban az [[import.meta.env]] objektumon keresztül adja oda az értékeket, de csak
azokat, amelyeknek a neve `VITE_`-tel kezdődik. Ez szándékos védelem: a gépeden sok más környezeti változó is van, akár
jelszavak is, és ezek így véletlenül sem kerülhetnek bele az appba.

Írd át az `src/rates.js`-t, a végére jön az `API`:

```js file=src/rates.js mark=22-23
// Fix mintaárfolyamok: 1 euró mennyit ér a többi pénznemben.
// (Egy 2026. novemberi nap referencia-árfolyamai: gyakorlásra jók, igazi pénzhez nem.)
export const FIXED_RATES = {
  EUR: 1,
  USD: 1.099,
  GBP: 0.83735,
  CHF: 0.9223,
  JPY: 174.35,
  HUF: 373.55,
  PLN: 4.4583,
  CZK: 24.469,
  RON: 5.3493,
  SEK: 11.2125,
}

// Mennyit ér 1 egység a from pénznemből a to pénznemben. Minden árfolyam 1 euróhoz képest van megadva,
// ezért az eurón keresztül számolunk: from → EUR → to.
export function getRate(from, to, rates) {
  return rates[to] / rates[from]
}

// Az árfolyam-API címe. Ha a .env fájlban van VITE_RATES_API, az számít; ha nincs, ez az alapértelmezett.
export const API = import.meta.env.VITE_RATES_API ?? '/api/rates'
```

A `??` ([[nullish coalescing]], a 13. leckéből) a bal oldali értéket adja, kivéve ha az `null` vagy `undefined` (itt:
ha nincs `VITE_RATES_API`): ilyenkor a jobb oldalit. Így az app akkor is működik, ha valaki `.env` nélkül indítja. Az
`App`-ban két sor változik: az importban ott az `API`, a `useFetch` címe pedig egy template literal lesz. Itt a teljes
`App` a középszint végén:

```jsx file=src/App.jsx mark=2,13
import { useState } from 'react'
import { API, FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import useFetch from './useFetch.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const latest = useFetch(`${API}/latest?from=EUR`)

  // Az élő táblázat, ha megjött; ha nem sikerült, a fix mintaárfolyamok.
  let rates = FIXED_RATES
  if (latest.status === 'success') rates = { EUR: 1, ...latest.data.rates }
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // A két pénznem helyet cserél.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (latest.status === 'loading') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Pénznemek cseréje"
          title="Pénznemek cseréje"
        >
          ⇄
        </button>
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
      <RateStatus
        status={latest.status}
        error={latest.error}
        date={latest.data?.date}
        onRetry={latest.retry}
      />
    </main>
  )
}

export default App
```

A Vite észreveszi, ha a `.env` megváltozik, és magától újraindítja a fejlesztői szervert. Ha mégsem látod a
változást, állítsd le a terminálban (++Ctrl++ + ++C++), és indítsd el újra: `npm run dev`.

:::check Ellenőrizd
Minden ugyanúgy működik, mint eddig. Most írd át a `.env`-ben a címet `/api/ratez`-re (z-vel), és mentsd: a narancssárga
csíkban valami ilyesmi jelenik meg: „Unexpected token '<', "<!doctype "... is not valid JSON”. Ezt a címet a kitalált
szerver nem ismeri, így a kérés a Vite fejlesztői szerveréhez jutott, ami az `index.html` oldallal felelt, nem
JSON-nal. Az app ezt is hibának veszi, és a fix árfolyamokkal számol tovább. Írd vissza `/api/rates`-re. Ezzel kész a
középszint: commitold!
:::

:::concept Mi kerülhet egy VITE_ változóba?
Amit a `VITE_` változókba írsz, azt a Vite szó szerint beleírja a kész JavaScriptbe, amit minden látogató böngészője
letölt. Bárki megnézheti a fejlesztői eszközökben. Ezért ide csak **nyilvános** érték való: egy cím, vagy egy olyan
[[API-kulcs]], amit a szolgáltató eleve nyilvánosnak szán (és például csak a te domainedről fogad el). Egy titkos
kulcsot sosem szabad a böngészőbe küldeni: azt egy saját szerver tartja magánál, ami a nevedben hívja az API-t, és csak
a választ adja tovább.

Ha egy értéket csak a saját gépeden használsz, például egy saját tesztkulcsot, tedd egy `.env.local` fájlba: az felülírja
a `.env`-et, és nem kerül a git-repóba (a kiinduló projekttel érkezett `.gitignore`-ban már benne van a `*.local`). A `.env` maga a közös
alapértékeké, az commitolható. Az `npm run build` pedig a `.env.production` fájlt is beolvassa, ha van: oda kerülhet az
éles szerver címe.
:::

:::try Próbáld ki
Írj a `.env` végére egy kitalált kulcsot: `VITE_RATES_KEY=titkos-12345`, az `src/rates.js` végére pedig egy sort, ami
használja: `console.log('kulcs:', import.meta.env.VITE_RATES_KEY)`. Futtasd le az `npm run build` parancsot (egy
második terminálban, vagy a fejlesztői szerver leállítása után). A Vite figyelmeztethet, hogy egy darab (chunk, a
kész JavaScript egyik fájlja) nagyobb 500 kB-nál: ez a kitalált szerver, ami szintén belekerül az appba. Nyisd meg a `dist/assets` mappában az
`index-….js` fájlt, és keress rá (++Ctrl++ + ++F++) a `titkos-12345` szövegre: ott van, betűről betűre, bárki
megtalálhatja. Ezért nem való titok egy `VITE_` változóba. Utána töröld mindkét sort.
:::

## Haladó szint {level=3}

### Az elmúlt 30 nap adatai

Hogy egy árfolyam merre tart, az az elmúlt hetekből derül ki. A kitalált szerver egy másik végponton napról napra
visszaadja az árfolyamokat:

```text
/api/rates/2026-10-24..?from=EUR&to=HUF
```

A dátum utáni `..` azt jelenti: ettől a naptól a legutóbbi napig. A válasz így néz ki:

```js
{
  amount: 1,
  base: 'EUR',
  start_date: '2026-10-26',
  end_date: '2026-11-23',
  rates: {
    '2026-10-26': { HUF: 372.1 },
    '2026-10-27': { HUF: 373.4 },
    // … minden munkanapra egy sor
  },
}
```

Hétvégére nincs adat, mert a referencia-árfolyamokat csak munkanapokon teszik közzé.

Most derül ki, mennyit ér a `useFetch`: a második kérés egyetlen sor lesz. Hozd létre az
`src/components/RateChart.jsx` fájlt:

```jsx file=src/components/RateChart.jsx
import { API } from '../rates.js'
import { formatPercent, formatRate } from '../format.js'
import useFetch from '../useFetch.js'

// A mai naptól days nappal korábbi nap, '2026-10-24' alakban.
function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function RateChart({ from, to }) {
  // Más pár, más cím: a useFetch ilyenkor magától újra kér.
  const history = useFetch(`${API}/${daysAgo(30)}..?from=${from}&to=${to}`)

  let body
  if (history.status === 'loading') {
    body = <div className="chart__skeleton" />
  } else if (history.status === 'error') {
    body = (
      <div className="status status--error" role="alert">
        <p>Nem sikerült betölteni az elmúlt 30 nap adatait ({history.error.message}).</p>
        <button type="button" className="button" onClick={history.retry}>
          Újrapróbálás
        </button>
      </div>
    )
  } else {
    // { '2026-10-26': { HUF: 372.1 }, … } → [{ date: '2026-10-26', value: 372.1 }, …]
    const points = Object.entries(history.data.rates).map(([date, day]) => ({ date, value: day[to] }))
    const values = points.map((point) => point.value)
    const first = values[0]
    const last = values[values.length - 1]

    body = (
      <dl className="chart__stats">
        <div>
          <dt>Legalacsonyabb</dt>
          <dd>{formatRate(Math.min(...values))}</dd>
        </div>
        <div>
          <dt>Legmagasabb</dt>
          <dd>{formatRate(Math.max(...values))}</dd>
        </div>
        <div>
          <dt>Változás</dt>
          <dd>{formatPercent((last - first) / first)}</dd>
        </div>
      </dl>
    )
  }

  return (
    <section className="chart">
      <h2>
        Az elmúlt 30 nap · {from} → {to}
      </h2>
      {body}
    </section>
  )
}

export default RateChart
```

- **`daysAgo`.** A `new Date()` a mostani pillanat. A `setDate` átállítja a hónap napját: a `getDate() - 30` akkor is
  jó, ha negatív lesz, mert a dátum ilyenkor visszalép az előző hónapba. A `toISOString()` szabványos alakra hozza
  (`'2026-10-24T09:15:00.000Z'`), a `slice(0, 10)` pedig ebből csak az első tíz karaktert, a dátumot tartja meg.
- **Más pár, más cím.** A `from` és a `to` benne van a címben, így minden párnak saját címe és saját kérése van.
  Ugyanaz a hook, ugyanaz a betöltés- és hibakezelés, csak más címmel: ezért érte meg megírni.
- **`Object.entries`.** Az objektum kulcs–érték párjait adja egy tömbben. Minden pár maga is egy kételemű tömb, például
  `['2026-10-26', { HUF: 372.1 }]`. A `map` minden párt egy egyszerűbb objektummá alakít. A `([date, day])` a
  paraméter helyén bontja szét a párt (tömbös [[destrukturálás]], mint a `useState` soraiban), a `day[to]` pedig az
  adott nap árfolyamát olvassa ki.
- **`Math.min(...values)`.** A `Math.min` és a `Math.max` (6. lecke) külön paraméterekként várja a számokat, nem egy
  tömbben. A [[spread]] itt a tömb elemeit szétteríti paraméterekké: a `Math.min(...[3, 1, 2])` ugyanaz, mint a
  `Math.min(3, 1, 2)`.
- A három adat egy [[leíró listába|leíró lista]] kerül (`<dl>`, a 13. leckéből): a `<dt>` a megnevezés, a `<dd>` az
  érték.

A változást százalékban érdemes mutatni, ehhez kell még egy formázó. Itt a teljes `src/format.js`:

```js file=src/format.js mark=27-31
// Az oldalon minden szám és pénznemnév ennek a nyelvnek a szokásait követi.
const LOCALE = 'hu-HU'

// 1234.5 és 'EUR' → „1234,50 EUR”
export function formatMoney(value, currency) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

// Legfeljebb 5 értékes jegy: 373,55 vagy 0,002677
export function formatRate(value) {
  return new Intl.NumberFormat(LOCALE, { maximumSignificantDigits: 5 }).format(value)
}

// A pénznemek neve ezen a nyelven: 'HUF' → „magyar forint”
const currencyNames = new Intl.DisplayNames(LOCALE, { type: 'currency' })

export function currencyName(code) {
  return currencyNames.of(code)
}

// '2026-11-20' → „2026. nov. 20.”
export function formatDate(isoDate) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  return new Intl.DateTimeFormat(LOCALE, options).format(new Date(isoDate))
}

// 0.0123 → „+1,23%”, -0.004 → „-0,4%”
export function formatPercent(value) {
  const options = { style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero' }
  return new Intl.NumberFormat(LOCALE, options).format(value)
}
```

A `style: 'percent'` a 0,0123-ból 1,23%-ot csinál, a `signDisplay: 'exceptZero'` pedig a pozitív szám elé is kiteszi
az előjelet (a nulla kivételével), így rögtön látszik, merre ment az árfolyam.

Végül a grafikon az `App`-ba, a `RateStatus` alá. Ha a két pénznem ugyanaz, nincs mit rajzolni, ezért ilyenkor egy
rövid szöveg jelenik meg helyette. A `RateChart` belsejében ezt nem dönthetnénk el egy `if`-fel a hook előtt, mert a
hookokat mindig ugyanabban a sorrendben, feltétel nélkül kell hívni ([[hookok szabálya]]); az `App` viszont eldöntheti,
hogy a `RateChart` egyáltalán ott legyen-e.

A `RateChart` egy [[key]]-t is kap: a pár nevét, például `'EUR-HUF'`. A 3. leckében láttad, hogy ha a `key` megváltozik,
a React a komponenst vadonatújnak tekinti: a régit eltávolítja, és egy újat rajzol, friss állapottal. Itt pont ez kell.
Pár váltásakor a régi grafikon eltűnik (a takarító függvénye az `ignore`-ral eldobja a még úton lévő választ), az új
pedig `'loading'` állapotból indul. `key` nélkül a hook ugyanaz maradna: az új címre ugyan új kérést indítana, de az
első rajzolásnál még a régi pár adatait adná vissza, `'success'` státusszal, és a `day[to]` egy olyan pénznemet
keresne bennük, ami nincs ott.

A fájl elejére jön az import, a `</main>` elé pedig a feltételes rész:

```jsx file=src/App.jsx mark=1,10-14
import RateChart from './components/RateChart.jsx'
// … a többi import és az App eleje változatlan

      <RateStatus
        status={latest.status}
        error={latest.error}
        date={latest.data?.date}
        onRetry={latest.retry}
      />
      {from === to ? (
        <p className="muted">Válassz két különböző pénznemet a grafikonhoz.</p>
      ) : (
        <RateChart key={`${from}-${to}`} from={from} to={to} />
      )}
    </main>
  )
}
```

:::check Ellenőrizd
Az árfolyamok forrását mutató sor (például „Élő árfolyamok, frissítve: …”) alatt egy keretes rész van: „Az elmúlt 30
nap · EUR → HUF”, benne három kis dobozzal: legalacsonyabb, legmagasabb, változás (például „+0,52%”). Válts másik
párra: egy pillanatra csillogó sáv jelenik meg, aztán az új számok. Ha mindkét oldalon ugyanaz a pénznem, a keret helyén a „Válassz két különböző pénznemet a
grafikonhoz.” szöveg áll.
:::

:::mistake Gyakori hiba
`day.to` a `day[to]` helyett. A pont után álló név szó szerint értendő: a `day.to` egy `to` nevű kulcsot keres, ami
nincs, így minden érték `undefined`, és a dobozokban „NaN” áll. Ha a kulcs egy változóban van, szögletes zárójel kell.
:::

:::try Próbáld ki
Írd át a `daysAgo(30)`-at `daysAgo(90)`-re (és a címet „Az elmúlt 90 nap”-ra): a szerver 400 napig visszamenőleg ad
adatot. Utána állítsd vissza.
:::

### A vonal: SVG-grafikon

A számok mellé egy vonal is kell, amin látszik, merre ment az árfolyam. A 12. leckében láttad, hogy az [[SVG]]
alakzatokból álló, szövegként leírt kép. A React ugyanúgy rajzol SVG-elemeket, mint HTML-t, így a grafikon egyszerűen
JSX lesz: egy `<svg>`, benne egy `<polyline>`, ami pontokat köt össze egyenes szakaszokkal.

Az SVG-nek saját koordináta-rendszere van, amit a [[viewBox]] ad meg: a `viewBox="0 0 300 100"` egy 300 egység széles
és 100 egység magas rajzlapot jelent. A `preserveAspectRatio="none"` miatt ez a rajzlap annyira nyúlik, amennyire a
CSS engedi (a teljes szélességre, 150 pixel magasra), így a grafikon telefonon és nagy képernyőn is kitölti a helyét.
Egy fontos különbség a matekórához képest: az SVG-ben az y lefelé nő. A 0 a rajzlap teteje, a 100 az alja.

A pontokat így számoljuk ki:

- **x:** az első nap a bal szélen (0), az utolsó a jobb szélen (300), a többi egyenletesen közöttük:
  `i / (values.length - 1) * WIDTH`.
- **y:** a legalacsonyabb érték alul (100), a legmagasabb felül (0). Az `(value - min) / range` (ahol a `range` a
  legnagyobb és a legkisebb érték különbsége) 0 és 1 közé hozza az értéket (0 a legkisebb, 1 a legnagyobb); ezt
  megszorozzuk a magassággal, és kivonjuk a magasságból, mert az y lefelé nő.

Itt a teljes `src/components/RateChart.jsx`:

```jsx file=src/components/RateChart.jsx mark=2,5-6,8-21,54,69-82
import { API } from '../rates.js'
import { formatDate, formatPercent, formatRate } from '../format.js'
import useFetch from '../useFetch.js'

const WIDTH = 300
const HEIGHT = 100

// Az értékekből „x,y x,y …” pontsor egy SVG polyline-nak: balra az első nap, jobbra az utolsó,
// lent a legalacsonyabb érték, fent a legmagasabb.
function linePoints(values) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1 // ha minden érték egyforma, ne osszunk nullával
  return values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * WIDTH
      const y = HEIGHT - ((value - min) / range) * HEIGHT
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

// A mai naptól days nappal korábbi nap, '2026-10-24' alakban.
function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function RateChart({ from, to }) {
  // Más pár, más cím: a useFetch ilyenkor magától újra kér.
  const history = useFetch(`${API}/${daysAgo(30)}..?from=${from}&to=${to}`)

  let body
  if (history.status === 'loading') {
    body = <div className="chart__skeleton" />
  } else if (history.status === 'error') {
    body = (
      <div className="status status--error" role="alert">
        <p>Nem sikerült betölteni az elmúlt 30 nap adatait ({history.error.message}).</p>
        <button type="button" className="button" onClick={history.retry}>
          Újrapróbálás
        </button>
      </div>
    )
  } else {
    // { '2026-10-26': { HUF: 372.1 }, … } → [{ date: '2026-10-26', value: 372.1 }, …]
    const points = Object.entries(history.data.rates).map(([date, day]) => ({ date, value: day[to] }))
    const values = points.map((point) => point.value)
    const first = values[0]
    const last = values[values.length - 1]

    body = (
      <>
        <dl className="chart__stats">
          <div>
            <dt>Legalacsonyabb</dt>
            <dd>{formatRate(Math.min(...values))}</dd>
          </div>
          <div>
            <dt>Legmagasabb</dt>
            <dd>{formatRate(Math.max(...values))}</dd>
          </div>
          <div>
            <dt>Változás</dt>
            <dd>{formatPercent((last - first) / first)}</dd>
          </div>
        </dl>
        <svg
          className="chart__svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${from}–${to} árfolyam az elmúlt 30 napban: az első napon ${formatRate(first)}, az utolsón ${formatRate(last)}`}
        >
          <polyline className="chart__line" points={linePoints(values)} />
        </svg>
        <div className="chart__axis">
          <span>{formatDate(points[0].date)}</span>
          <span>{formatDate(points[points.length - 1].date)}</span>
        </div>
      </>
    )
  }

  return (
    <section className="chart">
      <h2>
        Az elmúlt 30 nap · {from} → {to}
      </h2>
      {body}
    </section>
  )
}

export default RateChart
```

- A `toFixed(1)` egy tizedesre kerekíti a koordinátákat, hogy a pontsor rövid maradjon. A `join(' ')` szóközzel fűzi
  össze a pontokat, ahogy a `points` attribútum várja.
- A `|| 1` arra az esetre kell, ha minden érték egyforma: akkor a `max - min` nulla lenne, és nullával osztanánk. A
  `||` ilyenkor az 1-et adja.
- A `role="img"` és az `aria-label` a képernyőolvasónak mondja el szavakban, amit a vonal mutat.
- A vonal színét és vastagságát az `App.css` adja (`chart__line`). A `vector-effect: non-scaling-stroke` miatt a
  vonal akkor is ugyanolyan vastag marad, ha a rajzlap megnyúlik.

:::check Ellenőrizd
A három doboz alatt egy kék vonal fut végig a kereten, alatta balra az első, jobbra az utolsó nap dátuma. Válts EUR →
JPY-ra: más alakú görbe jön. Húzd keskenyre a böngészőablakot: a vonal vele együtt nyúlik és zsugorodik.
:::

:::mistake Gyakori hiba
`const y = ((value - min) / range) * HEIGHT`, a kivonás nélkül. A grafikon fejjel lefelé áll: ha az árfolyam nő, a
vonal lefelé megy. Az SVG-ben az y lefelé nő, ezért kell a `HEIGHT -`.
:::

:::try Feladat
Satírozd be a vonal alatti területet: tegyél a `<polyline>` elé egy `<polygon>`-t. A pontsora a vonal pontjai, plusz a
két alsó sarok, jobbról balra, így a sokszög bezárul:

```jsx
<polygon
  points={`${linePoints(values)} ${WIDTH},${HEIGHT} 0,${HEIGHT}`}
  fill="rgb(1 151 216 / 0.15)"
/>
```
:::

### Kedvenc pénznempárok

Aki rendszeresen ugyanazokat a párokat nézi (mondjuk euró → forint, dollár → forint), annak jó, ha egy kattintással
visszatérhet hozzájuk. A kedvenc párokat a `localStorage`-be mentjük, hogy újratöltés után is megmaradjanak.
Erre a célra a 6. és a 9. leckében már megírtad a `useLocalStorage` hookot. Ha megvan, másold át ebbe a projektbe; ha
nincs, hozd létre az `src/useLocalStorage.js` fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Úgy működik, mint a useState, de az érték túléli az újratöltést:
// JSON-ként tárolja a localStorage-ben, a key nevű kulcs alatt.
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

  // Minden változás után elmentjük.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Nem baj, ha nem sikerül: az érték így is működik, csak nem emlékszik.
    }
  }, [key, value])

  // Ugyanazt adja vissza, mint a useState: az értéket és a beállító függvényt.
  return [value, setValue]
}

export default useLocalStorage
```

Egy pár legyen egyszerűen egy szöveg: `'EUR-HUF'`. A kedvencek gombsora külön komponens. Hozd létre az
`src/components/FavoritePairs.jsx` fájlt:

```jsx file=src/components/FavoritePairs.jsx
// A mentett párok gombsora. Az éppen látott pár gombja be van nyomva.
function FavoritePairs({ pairs, current, onSelect }) {
  return (
    <section>
      <h2 className="section-title">Kedvenc párok</h2>
      {pairs.length === 0 ? (
        <p className="muted">Még nincs mentett párod: a csillaggal elmentheted, amit éppen látsz.</p>
      ) : (
        <div className="chips">
          {pairs.map((pair) => (
            <button
              key={pair}
              type="button"
              className="chip"
              aria-pressed={pair === current}
              onClick={() => onSelect(pair)}
            >
              {pair.replace('-', ' → ')}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default FavoritePairs
```

Az [[aria-pressed]] (a 2. leckéből) jelzi, melyik gomb van „benyomva”: az, amelyik pár éppen látszik; a CSS ezt
kitöltött gombként mutatja. A `pair.replace('-', ' → ')` csak a felirathoz cseréli a kötőjelet nyílra.

Az `App`-ban jön egy csillaggomb az eredménydobozba, ami elmenti vagy törli az éppen látott párt, és a gombsor a
`RateStatus` alá. Itt a teljes fájl:

```jsx file=src/App.jsx mark=5,9,16,30-34,42-49,51-56,105-107,115
import { useState } from 'react'
import { API, FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import useFetch from './useFetch.js'
import useLocalStorage from './useLocalStorage.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import RateChart from './components/RateChart.jsx'
import FavoritePairs from './components/FavoritePairs.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const [pairs, setPairs] = useLocalStorage('currency-pairs', ['EUR-HUF', 'EUR-USD'])
  const latest = useFetch(`${API}/latest?from=EUR`)

  // Az élő táblázat, ha megjött; ha nem sikerült, a fix mintaárfolyamok.
  let rates = FIXED_RATES
  if (latest.status === 'success') rates = { EUR: 1, ...latest.data.rates }
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // Az éppen látott pár egy szövegként, például 'EUR-HUF'.
  const pairKey = `${from}-${to}`
  const saved = pairs.includes(pairKey)
  // Csak azok a párok, amelyeknek mindkét pénzneme benne van a mostani táblázatban.
  const availablePairs = pairs.filter((pair) => pair.split('-').every((code) => code in rates))

  // A két pénznem helyet cserél.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  // A csillag: ha a pár már mentve van, kivesszük, ha nincs, a végére tesszük.
  function togglePair() {
    if (saved) {
      setPairs(pairs.filter((pair) => pair !== pairKey))
    } else {
      setPairs([...pairs, pairKey])
    }
  }

  // Egy kedvenc pár gombja: 'EUR-HUF' → from = 'EUR', to = 'HUF'.
  function selectPair(pair) {
    const [newFrom, newTo] = pair.split('-')
    setFrom(newFrom)
    setTo(newTo)
  }

  let result
  if (latest.status === 'loading') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Pénznemek cseréje"
          title="Pénznemek cseréje"
        >
          ⇄
        </button>
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
        <button type="button" className="star" aria-pressed={saved} onClick={togglePair}>
          {saved ? '★ Mentve' : '☆ Pár mentése'}
        </button>
      </section>
      <RateStatus
        status={latest.status}
        error={latest.error}
        date={latest.data?.date}
        onRetry={latest.retry}
      />
      <FavoritePairs pairs={availablePairs} current={pairKey} onSelect={selectPair} />
      {from === to ? (
        <p className="muted">Válassz két különböző pénznemet a grafikonhoz.</p>
      ) : (
        <RateChart key={`${from}-${to}`} from={from} to={to} />
      )}
    </main>
  )
}

export default App
```

- **`pairs.includes(pairKey)`** megmondja, benne van-e a pár a tömbben. Ebből tudja a csillag, hogy üres (☆) vagy
  teli (★) legyen.
- **Mentés és törlés** ugyanúgy megy, mint a 9. lecke teendőinél: sosem módosítjuk a tömböt helyben. A `filter` egy
  új tömböt ad a pár nélkül, a `[...pairs, pairKey]` egy újat a párral a végén.
- **`pair.split('-')`** a kötőjelnél kettévágja a szöveget: `['EUR', 'HUF']`, a `const [newFrom, newTo] = …` pedig
  két változóba bontja.
- **`availablePairs`.** Ha a szerver nem érhető el, csak a tíz fix pénznemünk van. Egy elmentett `'EUR-AUD'` gombja
  ilyenkor egy olyan párra váltana, amihez nincs árfolyam. Az `in` operátor megmondja, van-e egy kulcs egy objektumban:
  az `'AUD' in rates` igaz, ha a táblázatban van ausztrál dollár. Az [[every]] pedig akkor igaz, ha a pár mindkét
  pénznemére igaz.

:::check Ellenőrizd
Az eredménydoboz alján egy „★ Mentve” gomb van, mert az EUR → HUF a kezdő kedvencek között van; lejjebb, a „KEDVENC
PÁROK” felirat alatt két gomb: „EUR → HUF” (benyomva) és „EUR → USD”. Válaszd ki a GBP → HUF párt: a csillag „☆ Pár mentése” lesz.
Kattints rá: „★ Mentve”, és megjelenik egy „GBP → HUF” gomb. Kattints az „EUR → USD” gombra: a két lista átvált, és a
grafikon is. Frissítsd az oldalt: a kedvencek megmaradtak. A csillaggal törölni is tudsz.
:::

:::mistake Gyakori hiba
`pairs.push(pairKey)`, aztán `setPairs(pairs)`. A `push` helyben módosítja a régi tömböt, a `setPairs` pedig ugyanazt a
tömböt kapja vissza, így a React úgy látja, hogy semmi sem változott, és nem rajzol újra: elsőre nem történik semmi. A
gomb csak később bukkan fel, amikor valami más újrarajzolja az appot (írj be egy számjegyet az összeghez), és a pár
akkor sincs elmentve: a `useLocalStorage` sem látott új értéket, így újratöltés után eltűnik. Mindig új tömböt adj a
beállítónak.
:::

:::try Feladat
Legfeljebb hat kedvenc legyen: a mentésnél a `[...pairs, pairKey].slice(-6)` csak az utolsó hatot tartja meg. Mi
történik a legrégebbi kedvenccel, ha a hetediket mented?
:::

### Az utolsó ismert árfolyam

Két dolog még bosszantó. Az egyik: minden indításkor a csillogó sávot nézed, amíg a válasz megjön, pedig tegnap már
megkaptad az árfolyamokat, és azóta alig változtak. A másik: ha nincs kapcsolat, a régi, fix mintaárfolyamokat kapod,
pedig van egy sokkal frissebb adat, amit legutóbb letöltöttél.

Mindkettőre ugyanaz a megoldás: egy [[gyorsítótár]] (cache). A sikeres válasz egy másolatát eltesszük. Indításkor
ezt azonnal megmutatjuk, és közben a háttérben elkérjük a frisset; ha az megjött, lecseréljük. Ha nem jön meg, a
másolat marad, és megmondjuk, melyik napi. A másolat a `localStorage`-be kerül, a `useLocalStorage` hookkal.

Előbb a `RateStatus`: most már háromféle táblázatból számolhatunk (élő, utolsó ismert, fix), és a sornak mindig meg
kell mondania, melyiket látod. Itt a teljes `src/components/RateStatus.jsx`:

```jsx file=src/components/RateStatus.jsx mark=4-7,13,21
import { formatDate } from '../format.js'

// A sor az eredmény alatt: honnan jönnek az árfolyamok, betöltődnek-e még, vagy mi romlott el.
function RateStatus({ status, source, date, error, onRetry }) {
  // Mit látsz az élő árfolyamok helyett, amíg nincsenek meg?
  const fallback =
    source === 'cached' ? `az utolsó ismert árfolyamokat (${formatDate(date)})` : 'a fix mintaárfolyamokat'

  if (status === 'loading') {
    return (
      <p className="status" role="status">
        <span className="spinner" aria-hidden="true" />
        A legfrissebb árfolyamok betöltése… {source === 'cached' && `Addig ${fallback} látod.`}
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>Nem sikerült betölteni az élő árfolyamokat ({error.message}). Helyettük {fallback} látod.</p>
        <button type="button" className="button" onClick={onRetry}>
          Újrapróbálás
        </button>
      </div>
    )
  }

  return <p className="status">Élő árfolyamok, frissítve: {formatDate(date)}</p>
}

export default RateStatus
```

A `source` mondja meg, honnan van a táblázat: `'live'` (élő), `'cached'` (utolsó ismert) vagy `'fixed'` (fix). A
`{source === 'cached' && …}` csak akkor ír ki valamit, ha a feltétel igaz; különben `false` lesz, amiből a React nem
rajzol semmit.

Az `App`-ban három dolog változik: elmentjük a sikeres választ, egy `if`–`else if` lánc eldönti, melyik táblázattal
számolunk, és ha van mentett táblázat, betöltés közben sem kell a csillogó sáv. Itt a teljes `App` a lecke végén:

```jsx file=src/App.jsx mark=1,17,20-23,25,27-37,75,127-128
import { useEffect, useState } from 'react'
import { API, FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import useFetch from './useFetch.js'
import useLocalStorage from './useLocalStorage.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import RateChart from './components/RateChart.jsx'
import FavoritePairs from './components/FavoritePairs.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const [pairs, setPairs] = useLocalStorage('currency-pairs', ['EUR-HUF', 'EUR-USD'])
  const [lastRates, setLastRates] = useLocalStorage('currency-last-rates', null)
  const latest = useFetch(`${API}/latest?from=EUR`)

  // Minden sikeres választ elmentünk: legközelebb azonnal látszik, és akkor is segít, ha nincs kapcsolat.
  useEffect(() => {
    if (latest.status === 'success') setLastRates(latest.data)
  }, [latest.status, latest.data])

  // Melyik táblázattal számolunk? Az élővel, ha megjött; ha nem, az utoljára mentettel; végül a fixszel.
  let rates = FIXED_RATES
  let source = 'fixed'
  let date = null
  if (latest.status === 'success') {
    rates = { EUR: 1, ...latest.data.rates }
    source = 'live'
    date = latest.data.date
  } else if (lastRates) {
    rates = { EUR: 1, ...lastRates.rates }
    source = 'cached'
    date = lastRates.date
  }
  // A táblázat kulcsai a pénznemkódok: ezekből lesz a lista, ábécérendben.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // A mező szöveget ad: számmá alakítjuk, és megnézzük, lehet-e vele számolni.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // Az éppen látott pár egy szövegként, például 'EUR-HUF'.
  const pairKey = `${from}-${to}`
  const saved = pairs.includes(pairKey)
  // Csak azok a párok, amelyeknek mindkét pénzneme benne van a mostani táblázatban.
  const availablePairs = pairs.filter((pair) => pair.split('-').every((code) => code in rates))

  // A két pénznem helyet cserél.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  // A csillag: ha a pár már mentve van, kivesszük, ha nincs, a végére tesszük.
  function togglePair() {
    if (saved) {
      setPairs(pairs.filter((pair) => pair !== pairKey))
    } else {
      setPairs([...pairs, pairKey])
    }
  }

  // Egy kedvenc pár gombja: 'EUR-HUF' → from = 'EUR', to = 'HUF'.
  function selectPair(pair) {
    const [newFrom, newTo] = pair.split('-')
    setFrom(newFrom)
    setTo(newTo)
  }

  let result
  if (latest.status === 'loading' && source === 'fixed') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Adj meg egy összeget (0 vagy több).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Összeg</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="Miből" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Pénznemek cseréje"
          title="Pénznemek cseréje"
        >
          ⇄
        </button>
        <CurrencySelect label="Mibe" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
        <button type="button" className="star" aria-pressed={saved} onClick={togglePair}>
          {saved ? '★ Mentve' : '☆ Pár mentése'}
        </button>
      </section>
      <RateStatus
        status={latest.status}
        source={source}
        date={date}
        error={latest.error}
        onRetry={latest.retry}
      />
      <FavoritePairs pairs={availablePairs} current={pairKey} onSelect={selectPair} />
      {from === to ? (
        <p className="muted">Válassz két különböző pénznemet a grafikonhoz.</p>
      ) : (
        <RateChart key={`${from}-${to}`} from={from} to={to} />
      )}
    </main>
  )
}

export default App
```

- **A mentés egy effekt.** Ez nem rajzolás, hanem szinkronizálás a böngésző tárolójával, és akkor kell lefutnia, amikor
  megjött egy új, sikeres válasz: ezért a `latest.status` és a `latest.data` van a függőségi tömbben.
- **Az `if`–`else if` lánc** egy elsőbbségi sorrendet ír le: élő, ha van; ha nincs, utolsó ismert; ha az sincs, fix. A három
  változó (`rates`, `source`, `date`) mindig együtt változik, így a `RateStatus` pontosan azt mondja, amit a doboz
  mutat.
- **A csillogó sáv** csak akkor jelenik meg, ha még tart a betöltés, és nincs mentett táblázat sem
  (`source === 'fixed'`).
  Különben a mentett árfolyamokkal azonnal számolunk, és a frissítés a háttérben megy. Ezt a módszert úgy is hívják,
  hogy „stale-while-revalidate”: mutasd a régit, amíg megjön az új.

:::check Ellenőrizd
Frissítsd az oldalt: az eredmény azonnal ott van, csillogó sáv nélkül, a sor alatta pedig egy pillanatig ezt írja:
„A legfrissebb árfolyamok betöltése… Addig az utolsó ismert árfolyamokat (…) látod.”, aztán „Élő árfolyamok,
frissítve: …”. Most állítsd a `SERVER_MODE`-ot `'offline'`-ra: a listában továbbra is harminc pénznem van, a
narancssárga csíkban pedig ez áll: „Nem sikerült betölteni az élő árfolyamokat (Failed to fetch). Helyettük az utolsó
ismert árfolyamokat (…) látod.” A grafikon helyén is hibaüzenet van, „Újrapróbálás” gombbal. Végül a fejlesztői
eszközök **Application** (Alkalmazás) → **Local Storage** részén töröld a `currency-last-rates` kulcsot, és frissíts:
most már a fix mintaárfolyamok jönnek, a listában tíz pénznemmel. Állítsd vissza a `SERVER_MODE`-ot `'normal'`-ra.
Gratulálok, kész a pénznemváltód!
:::

:::mistake Gyakori hiba
Feltétel nélküli mentés: `useEffect(() => setLastRates(latest.data), [latest.data])`. Betöltés közben és hiba után a
`latest.data` még `null`, így az effekt az első futásnál `null`-lal írja felül a jó mentést. Offline épp akkor nincs
semmi a tárolóban, amikor a legnagyobb szükség lenne rá.
:::

:::concept Hogyan gyorsítótáraz egy igazi szerver?
A szerverek a válasz [[fejléceiben|HTTP-fejléc]] (ezek a válasz tartalma előtt utazó név–érték párok) azt is
megmondhatják, meddig használható a válasz: a `Cache-Control: max-age=3600` például egy órát enged. A böngésző ilyenkor egy órán belül meg
sem kérdezi újra a szervert, hanem a saját gyorsítótárából adja a választ. Egy [[PWA]] service workere pedig egész
oldalakat is eltehet offline használatra. A mi `localStorage`-es másolatunk ennek egy egyszerű, kézzel írt változata,
és pont az, ami egy pénznemváltóhoz kell: mindig van mivel számolni, és mindig tudod, melyik napi.
:::
