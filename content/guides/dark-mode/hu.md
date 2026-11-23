# Mit építünk?

Egy kapcsolót, ami nappalból éjszakát csinál egy oldalon. Az oldal neve Stargazer: egy rövid cikk arról, hogyan nézd
a csillagokat az erkélyedről. Pont az a fajta oldal, amit kint, a sötétben olvasol, ahol a vakító fehér képernyő
zavar. A lecke három szintje egymásra épül, és a kapcsoló már az első szint végén működik.

:::levels
- Kapcsoló, ami világos és sötét között váltja az egész oldal színeit. | kb. 2 óra
- Az oldal megjegyzi, mit választottál, és követni tudja a géped világos vagy sötét beállítását. | kb. 2 óra
- Témarendszer az egész appnak Contexttel, egy harmadik téma, villanásmentes betöltés, animált váltás. | kb. 3 óra
:::

**Előismeret:** az 1. lecke, a „Me, Myself & React”. Arra építünk, amit ott tanultál: komponensek, props, JSX,
CSS-fájlok és a React két alapvető hookja, a `useState` és a `useEffect`. Ahol valamit új módon használunk, ott újra
elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Töltsd le a lecke **alapját** (fent: „Alap letöltése”), csomagold ki, és nyisd meg a `stargazer` mappát a
szerkesztőben. Aztán a terminálban:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Egy világos, meleg tónusú oldalt látsz:
fent kékkel a „Stargazer” nevet, alatta egy fehér kártyán a „Stargazing from your balcony” című cikket, egy halványlila
tippdobozzal és egy rövid listával. Kapcsoló még nincs: az lesz a te dolgod.
:::

Az alap most nem üres: az oldal kész, csak a sötét mód hiányzik belőle. Nézz körül az `src` mappában, mindent ismersz
az 1. leckéből:

- Az `src/App.jsx` két komponensből rakja össze az oldalt.
- Az `src/components/Header.jsx` a felső sáv. A benne lévő megjegyzés jelöli, hová kerül majd a kapcsoló.
- Az `src/components/Article.jsx` maga a cikk.
- Az `src/index.css`-ben van az összes stílus. Minden szín kézzel van kiírva, a kék például `#3346a8`.

Az alap mindkét nyelven ugyanaz, ezért a mintacikk angol. Ha szeretnéd, fordítsd le nyugodtan magyarra: a lépések
ugyanúgy működnek. A kódot, amit te írsz be, magyar feliratokkal és megjegyzésekkel mutatjuk.

:::concept Az alap egy git-repó
Ahogy az 1. leckében, a mappában már van egy első commit. A `git restore .` eldob minden változtatást az utolsó commit
óta (az új fájlok megmaradnak, azokat kézzel töröld). Ha egy lépés működik, commitold: `git add .`, majd
`git commit -m "CSS-változók"`.
:::

### A színek egy helyen: CSS-változók

Egy sötét oldalhoz minden színnek változnia kell: a háttérnek, a szövegnek, a kártyának, a vonalaknak, a kéknek. Most
ezek szét vannak szórva az `index.css`-ben, és némelyik többször is szerepel, a kék például háromszor. Egyenként
átírni őket, és mellé még egy éjszakai példányt is karbantartani: rémálom.

Erre valók a [[CSS-változók|CSS-változó]] (hivatalos nevükön custom properties, egyéni tulajdonságok). Egy színnek
egyszer adsz nevet, és mindenhol máshol már csak a nevét használod:

- a `--accent: #3346a8;` létrehoz egy változót. A neve mindig két kötőjellel kezdődik;
- a `color: var(--accent);` felhasználja: a `var()` a változó értékét teszi a helyére.

A `:root` a `<html>` elemet jelenti, az oldal gyökerét. Az itt megadott változó mindenhol látszik, mert minden benne
lévő elem örökli. Cseréld le az `src/index.css` tartalmát erre: a színek a fájl tetejére kerülnek, a lenti szabályok
pedig már csak a nevüket használják.

```css file=src/index.css mark=1-10,20,21,38,43,50,52,63,72,79,81
/* Az oldal összes színe, egy helyen. */
:root {
  --bg: #f4f1ea;
  --surface: #ffffff;
  --text: #1f2433;
  --muted: #666b7a;
  --accent: #3346a8;
  --accent-soft: #ebe8f7;
  --line: #ddd6c8;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
}

.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.logo {
  margin: 0;
  color: var(--accent);
  font-size: 22px;
  font-weight: 800;
}

.article {
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
}

.article h1 {
  margin: 4px 0;
  font-size: 32px;
  line-height: 1.2;
}

.article__kicker {
  margin: 0;
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.article__meta {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
}

.tip {
  margin: 20px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--accent);
  border-radius: 8px;
  background: var(--accent-soft);
}
```

:::check Ellenőrizd
Az oldal pontosan úgy néz ki, mint eddig. Éppen ez a lényeg: a színek nem változtak, csak most egy helyen laknak.
:::

:::try Próbáld ki
Nyisd meg a fejlesztői eszközöket (++F12++), az Elements panelen kattints a `<html>` sorra, és a Styles részben írd át
a `--accent` értékét `crimson`-ra. A fenti név, a cím fölötti kis felirat és a tipp bal oldali vonala egyszerre
változik. (A fejlesztői eszközök paneljeit angol nevükön említjük; ha a Chrome-od magyar nyelvű, a nevük is magyar
lehet, például Elements = Elemek, Console = Konzol.)
:::

:::mistake Gyakori hiba
A `var(accent)` vagy a `var(-accent)` nem csinál semmit: a névhez mindkét kötőjel kell, `var(--accent)`. A böngésző
nem szól érte, egyszerűen kihagyja a sort. Ha egy szín nem akar változni, először a kötőjeleket nézd meg.
:::

### Éjszakai színek

Most írd meg ugyanezeknek a neveknek az éjszakai változatát. Ez akkor érvényes, ha a `<html>` elemen ott van a
`data-theme="dark"` attribútum. Tedd az `src/index.css`-be, közvetlenül a `:root` blokk alá:

```css file=src/index.css
/* Ugyanazok a nevek éjszakai színekkel. Akkor érvényesek, ha a <html>-en data-theme="dark" áll. */
:root[data-theme='dark'] {
  color-scheme: dark;
  --bg: #0f1326;
  --surface: #181e38;
  --text: #e9e6f5;
  --muted: #a3a8c3;
  --accent: #f2c45a;
  --accent-soft: #262b4a;
  --line: #2c3458;
}
```

A `data-theme` egy [[data-attribútum]]: bármelyik HTML-elemnek adhatsz `data-` kezdetű attribútumot, hogy saját
információt tárolj rajta. A `:root[data-theme='dark']` csak addig választja ki a `<html>` elemet, amíg rajta van ez az
attribútum ezzel az értékkel. Ilyenkor ezek az értékek felülírják a világosakat, és a CSS többi részén semmit sem kell
változtatni: minden szabály a `var(--bg)`-t kéri, és azt az értéket kapja, ami éppen érvényes.

A `color-scheme: dark` megmondja a böngészőnek, hogy a saját részeit is sötéten rajzolja, például a görgetősávokat
és az űrlapmezőket.

:::check Ellenőrizd
Írd be ezt a konzolba (++F12++ → Console), és nyomj ++Enter++-t:

```js
document.documentElement.dataset.theme = 'dark'
```

Ha beírás helyett beilleszted, a Chrome először kérheti, hogy írd be: `allow pasting`, és nyomj ++Enter++-t. Ez csak
egy biztonsági ellenőrzés: utána illeszd be újra.

Az oldal éjkék lesz, világos szöveggel és arany kiemelésekkel. A `document.documentElement` a `<html>` elem, a
`dataset.theme` pedig a `data-theme` attribútuma. Az Elements panelen most ez látszik:
`<html lang="en" data-theme="dark">`. Futtasd le újra `'light'`-tal, és visszaváltozik. A kapcsolónak pontosan ennyi
lesz a dolga.
:::

:::mistake Gyakori hiba
A `:root [data-theme='dark']`, szóközzel, mást jelent: „egy ilyen attribútumú elem a `<html>`-en **belül**”. A mi
attribútumunk magán a `<html>`-en van, ezért a `:root` és a `[` közé nem kerülhet szóköz.
:::

### A kapcsoló: állapot és effekt

Jöjjön egy gomb, ami azt csinálja, amit az előbb a konzolos sor. Ehhez az 1. lecke két hookja dolgozik együtt:

- A [[useState]] a komponens memóriája. Megjegyzi, melyik téma van bekapcsolva, `'light'` vagy `'dark'`, és ha
  változik, a React újrarajzolja a komponenst.
- A [[useEffect]] a rajzoláson kívüli munkára való. Az 1. leckében egy böngészőeseményt figyelt, itt a témát írja rá
  a `<html>` elemre.

Miért kell ehhez effekt? A React csak a `<div id="root">` dobozon belül rajzol. A `<html>` elem ezen kívül esik, így
JSX-ben nem tudod ráírni a `data-theme`-et: neked kell beállítanod, miután a React rajzolt. Pont az ilyen munkára
való az effekt. Írd át az `src/App.jsx`-et erre (a kiemelt sorok az újak):

```jsx file=src/App.jsx mark=1,6,8-11,13-15,19-21
import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  const [theme, setTheme] = useState('light')

  // A <html> kívül esik a React dobozán, ezért egy effekt írja rá a témát.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="page">
      <button type="button" onClick={toggleTheme}>
        {theme === 'dark' ? 'Váltás világosra' : 'Váltás sötétre'}
      </button>
      <Header />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

- `onClick={toggleTheme}`: kattintáskor a React meghívja a `toggleTheme` függvényt. Magát a függvényt adjuk át,
  zárójel nélkül.
- A `theme === 'dark' ? 'light' : 'dark'` egy rövid „ha”, a [[feltételes operátor]]: ha a téma sötét (a `===` azt
  nézi, egyenlő-e a két érték), az új világos lesz, különben sötét.
- Az effekt végén álló `[theme]` a [[függőségi tömb]]: a React az első rajzolás után lefuttatja az effektet, és
  utána mindig, amikor a `theme` megváltozik. Az 1. leckében ez egy üres `[]` volt, ami azt jelenti: csak egyszer,
  az elején.

:::check Ellenőrizd
A fejléc fölött megjelenik egy egyszerű „Váltás sötétre” gomb. Váltogatja az oldalt világos és sötét között, és a
felirata mindig azt mutatja, mit csinál a következő kattintás. Az Elements panelen láthatod, ahogy a `<html>` elemen
változik a `data-theme` értéke.
:::

:::mistake Gyakori hiba
Az `onClick={toggleTheme()}`, zárójellel, azonnal meghívja a függvényt, rajzolás közben, nem kattintáskor. Az
megváltoztatja az állapotot, ezért a React újra rajzol, ami megint meghívja… A React végül „Too many re-renders”
hibával megáll. Zárójel nélkül csak átadod a függvényt, hogy majd később hívják meg.
:::

### Egy igazi kapcsolókomponens

A gomb működik, de sima gombnak néz ki, és a fejléc fölött áll. Csináljunk belőle egy kis kapcsolót, amiben egy kör
csúszik ide-oda, és tegyük a fejlécbe, oda, ahová az alap megjegyzése mutat. Saját komponenst kap, egy új fájlban, az
`src/components/ThemeToggle.jsx`-ben:

```jsx file=src/components/ThemeToggle.jsx
import './ThemeToggle.css'

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button type="button" className="toggle" role="switch" aria-checked={isDark} onClick={onToggle}>
      <span className="toggle__track">
        <span className="toggle__knob" />
      </span>
      Sötét mód
    </button>
  )
}

export default ThemeToggle
```

A kapcsoló két [[propot|props]] kap: a megjelenítendő témát és az `onToggle`-t, egy függvényt, amelyet kattintáskor
meg kell hívnia. A prop függvény is lehet: így szól egy gyerekkomponens a szülőjének (annak a komponensnek, amelyik
kirajzolja), hogy valami történt. A kapcsoló maga nem változtatja meg a témát. Csak jelzi a kattintást, és az `App`,
amelyiké az állapot, eldönti, mi legyen.

A `role="switch"` és az `aria-checked` [[ARIA]]-attribútumok: megmondják a képernyőolvasóknak, hogy ez a gomb egy
be/ki kapcsoló, és hogy éppen be van-e kapcsolva. A képernyőolvasó nagyjából így olvassa fel: „Sötét mód, kapcsoló,
bekapcsolva”.

A stílusai az `src/components/ThemeToggle.css`-be kerülnek, abba a fájlba, amelyet a komponens az első sorában
importál:

```css file=src/components/ThemeToggle.css
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.toggle__track {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: var(--line);
}

.toggle__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  transition: transform 0.2s ease;
}

/* Bekapcsolt állásban a kör jobbra csúszik. */
.toggle[aria-checked='true'] .toggle__knob {
  transform: translateX(20px);
}
```

A CSS is az `aria-checked`-et olvassa: ugyanaz az attribútum, ami a képernyőolvasót tájékoztatja, csúsztatja el a
kört. És mivel a kapcsoló csak változókat használ, az oldallal együtt vált színt. Van benne néhány új CSS-fogás is:

- A sáv `position: relative`, a kör `position: absolute`: így a kör helyét a sávhoz képest adjuk meg, a `top: 3px` és
  a `left: 3px` a sáv bal felső sarkától számít.
- A `border-radius: 999px` bármekkora dobozból kerek végű „pirulát” csinál, a 18 × 18 px-es négyzetből pedig az `50%`
  kört.
- A `transform: translateX(20px)` 20 pixellel jobbra tolja a kört, így a 44 px széles sáv jobb oldalán is 3 px marad.
  A `transition` miatt a kör odacsúszik, nem ugrik.
- A `:focus-visible` akkor érvényes, ha billentyűzettel (++Tab++) léptél a gombra: ilyenkor egy jól látható keret
  mutatja, hol jársz. Egérkattintásra nem jelenik meg.

A `Header` megkapja a két propot, és továbbadja a kapcsolónak:

```jsx file=src/components/Header.jsx mark=1,3,7
import ThemeToggle from './ThemeToggle.jsx'

function Header({ theme, onToggle }) {
  return (
    <header className="site-header">
      <p className="logo">Stargazer</p>
      <ThemeToggle theme={theme} onToggle={onToggle} />
    </header>
  )
}

export default Header
```

Az `App`-ból töröld ki az ideiglenes gombot, és add át a témát meg a függvényt a `Header`-nek:

```jsx file=src/App.jsx mark=19
import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  const [theme, setTheme] = useState('light')

  // A <html> kívül esik a React dobozán, ezért egy effekt írja rá a témát.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="page">
      <Header theme={theme} onToggle={toggleTheme} />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

:::check Ellenőrizd
A kapcsoló a fejléc jobb szélén van, és sötét módban a kör jobbra csúszik. Billentyűzettel is működik: nyomd meg a
++Tab++ billentyűt (ha kell, többször), amíg a kapcsoló körül keret nem jelenik meg, aztán a ++Szóköz++ billentyűt.
Ezzel kész a kezdő szint: commitold!
:::

:::concept A Header csak továbbadja
A `Header` semmit sem csinál a `theme`-mel és az `onToggle`-lal, csak leadja őket a `ThemeToggle`-nak. Egyetlen köztes
komponensnél ez még rendben van, de egy nagyobb appban ugyanezek a propok sok komponensen utaznának át. Tartsd észben:
a haladó szinten megoldjuk.
:::

## Középszint {level=2}

### Jegyezzük meg a választást

Kapcsolj sötétre, és töltsd újra az oldalt (++F5++): megint világos. Az állapot csak addig él, amíg az oldal nyitva
van. Hogy a választás két látogatás között is megmaradjon, elmentjük a böngésző [[localStorage]] nevű tárolójába. Ezt
minden weboldal megkapja: szövegeket őriz nevek (kulcsok) alatt, és ezek akkor is megmaradnak, ha bezárod a
böngészőt.

- a `localStorage.setItem('stargazer-theme', 'dark')` elment egy szöveget,
- a `localStorage.getItem('stargazer-theme')` visszaolvassa (vagy `null`-t ad, ha nincs ott semmi).

Írd át így az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=5-16,19,26-33
import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

const STORAGE_KEY = 'stargazer-theme'

// Beolvassa az elmentett témát. Ha nincs mentés, vagy le van tiltva a tároló, világossal indulunk.
function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // A tárolót le lehet tiltani a böngészőben: ilyenkor egyszerűen nem emlékszünk.
  }
  return 'light'
}

function App() {
  const [theme, setTheme] = useState(readSavedTheme)

  // A <html> kívül esik a React dobozán, ezért egy effekt írja rá a témát.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Minden változást elmentünk, hogy a választás újratöltés után is megmaradjon.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Nem baj, ha nem sikerül elmenteni.
    }
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="page">
      <Header theme={theme} onToggle={toggleTheme} />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

Három új dolog:

- `useState(readSavedTheme)`: a `useState`-nek magát a függvényt adjuk, nem az eredményét. A React csak egyszer, a
  legelső rajzoláskor hívja meg, hogy megkapja a kezdőértéket. Ennek a neve [[lusta kezdőérték]]. Az 1. leckében már
  láttad: a `useHashRoute` is így indult, `useState(currentPath)`.
- A második effekt minden változást elment. Neki is `[theme]` a függősége, így mindig lefut, amikor a téma változik.
- `try { … } catch { … }`: a böngésző letilthatja a tárolót (egyes privát ablakokban, vagy ha a beállításokban nem
  engeded, hogy az oldalak adatot mentsenek), és ilyenkor a `localStorage` hibát dob. A `try` lefuttatja a kódot, és ha
  közben hiba történik, a `catch` rész fut le, így az oldal nem omlik össze. Nálunk ilyenkor egyszerűen nem emlékszünk.

:::check Ellenőrizd
Kapcsolj sötétre, és töltsd újra: sötét marad. A fejlesztői eszközökben az Application → Local storage →
`http://localhost:5173` alatt ott találod a `stargazer-theme` kulcsot és az értékét.
:::

:::mistake Gyakori hiba
Egy elírás a mentés és az olvasás között (itt `stargazer-theme`, ott `stargazer_theme`) nem ad hibát: az oldal
egyszerűen soha nem emlékszik. Ezért van a kulcs egyetlen konstansban, a `STORAGE_KEY`-ben, és mindkét hely azt
használja.
:::

### Saját hook: useDarkMode

Az `App` kezd zsúfolt lenni. Olvassa a tárolót, ment, írja a `<html>`-t… pedig az igazi dolga az, hogy összerakja az
oldalt. Költöztessünk mindent, ami a témáról szól, egy [[saját hookba|saját hook]]. Az 1. leckében már írtál egyet, a
`useHashRoute`-ot: egy `use`-zal kezdődő nevű függvényt, ami más hookokat hívhat, és visszaadja, amire egy
komponensnek szüksége van.

Hozd létre az `src/useDarkMode.js` fájlt, és költöztesd át ide az `App.jsx`-ből a konstanst, a `readSavedTheme`-et, a
`useState` sort és a két effektet:

```js file=src/useDarkMode.js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stargazer-theme'

// Beolvassa az elmentett témát. Ha nincs mentés, vagy le van tiltva a tároló, világossal indulunk.
function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // A tárolót le lehet tiltani a böngészőben: ilyenkor egyszerűen nem emlékszünk.
  }
  return 'light'
}

// Saját hook: a téma, ami két látogatás között is megmarad, és rákerül a <html>-re.
function useDarkMode() {
  const [theme, setTheme] = useState(readSavedTheme)

  // A <html> kívül esik a React dobozán, ezért egy effekt írja rá a témát.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Minden változást elmentünk, hogy a választás újratöltés után is megmaradjon.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Nem baj, ha nem sikerül elmenteni.
    }
  }, [theme])

  return { theme, setTheme }
}

export default useDarkMode
```

Az `App` megint rövid lesz:

```jsx file=src/App.jsx mark=1,6
import useDarkMode from './useDarkMode.js'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  const { theme, setTheme } = useDarkMode()

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="page">
      <Header theme={theme} onToggle={toggleTheme} />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

A hook egy objektumot ad vissza: a `return { theme, setTheme }` a `{ theme: theme, setTheme: setTheme }` rövid formája,
egy objektum, amelynek két mezője a két változóról kapja a nevét. Az `App`-ban a `const { theme, setTheme } = …` újra
két változóba veszi ki a két mezőt. Ez a [[destrukturálás]], ugyanaz, amit az 1. leckében a propokkal csináltál:
`function Hero({ name, role })`.

:::check Ellenőrizd
Minden úgy működik, mint eddig: a kapcsoló kapcsol, és a választás túléli az újratöltést. Csak a kód költözött.
:::

:::mistake Gyakori hiba
Ha kimarad az `export default useDarkMode` sor, az oldal nem frissül, újratöltés után pedig üres marad. A hiba csak a
konzolban (++F12++ → Console) látszik: `does not provide an export named 'default'`. Az `App` csak azt tudja
importálni, amit a másik fájl exportál.
:::

### A rendszerbeállítás követése

A legtöbb számítógépen és telefonon van világos/sötét beállítás, és a böngésző minden oldalnak elárulja, melyik van
bekapcsolva. CSS-ben ez a `prefers-color-scheme` [[media query]], JavaScriptben pedig a [[matchMedia]] teszi fel
ugyanezt a kérdést:

```js
const media = window.matchMedia('(prefers-color-scheme: dark)')
media.matches // true, ha a gép most éppen sötétre van állítva
```

A `media` azt is jelzi, ha a válasz megváltozik: kivált egy `change` eseményt, amit figyelhetsz, ahogy az 1.
leckében a `hashchange`-et figyelted.

Mostantól az oldalnak három **módja** van: `'light'`, `'dark'` és `'system'`. A mód az, amit te választottál, és amit
elmentünk. A **téma** az a színkészlet, amit az oldal mutat: rendszermódban a gép beállításából jön. Ha még nincs
semmi elmentve, a mód `'system'`, így aki először jár itt, azt kapja, amire a gépe be van állítva. Írd át így az
`src/useDarkMode.js`-t:

```js file=src/useDarkMode.js mark=4,5,7,8,11,15,18,20,21,23-31,33-35,42,45,49,51
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stargazer-theme'
const MODES = ['light', 'dark', 'system']
const DARK_QUERY = '(prefers-color-scheme: dark)'

// Beolvassa az elmentett módot. Ha nincs mentés, vagy le van tiltva a tároló, a rendszert követjük.
function readSavedMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (MODES.includes(saved)) return saved
  } catch {
    // A tárolót le lehet tiltani a böngészőben: ilyenkor egyszerűen nem emlékszünk.
  }
  return 'system'
}

// Saját hook: a választott mód, a rendszerbeállítás és a belőlük adódó téma.
function useDarkMode() {
  const [mode, setMode] = useState(readSavedMode)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

  // Figyeljük a rendszerbeállítást, és abbahagyjuk, ha a komponens eltűnik.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    function onChange(event) {
      setSystemDark(event.matches)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Ez nem állapot: a témát minden rajzoláskor a fenti két állapotból számoljuk ki.
  const systemTheme = systemDark ? 'dark' : 'light'
  const theme = mode === 'system' ? systemTheme : mode

  // A <html> kívül esik a React dobozán, ezért egy effekt írja rá a témát.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // A mód minden változását elmentjük, hogy a választás újratöltés után is megmaradjon.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Nem baj, ha nem sikerül elmenteni.
    }
  }, [mode])

  return { mode, setMode, theme }
}

export default useDarkMode
```

- A `systemDark` egy második állapot: most éppen sötét-e a gép? A kezdőértékét egy kis [[nyílfüggvény]] számolja ki, a
  `() => window.matchMedia(DARK_QUERY).matches`: ez is [[lusta kezdőérték]], mint a `readSavedMode`, csak itt helyben
  megírva, név nélkül. Az első effekt minden `change` eseménynél frissíti; az esemény `matches` mezője az új válasz. Az
  effekt által visszaadott függvény a [[takarítás]]: ha a komponens eltűnik, abbahagyjuk a figyelést.
- A `theme` nem állapot, csak egy érték, amit minden rajzoláskor kiszámolunk a két állapotból. Ha harmadik állapot
  lenne, kézzel kellene összhangban tartani a másik kettővel. Ökölszabály: amit ki tudsz számolni, azt nem tárolod.
- A `mode`-ot mentjük, nem a `theme`-et: ha a rendszert választottad, az oldal holnap is a rendszert kövesse.
- A `MODES.includes(saved)` ellenőrzi, hogy az elmentett szöveg a három mód egyike-e. Minden mást, például egy régi,
  elírt értéket, figyelmen kívül hagy.

A hook most `setTheme` helyett `setMode`-ot ad, ezért az `App` két sora változik. Itt csak ez a részlet látszik az
`src/App.jsx`-ből; a fölötte lévő importok és a lenti `return` maradnak:

```jsx file=src/App.jsx mark=2,5
function App() {
  const { theme, setMode } = useDarkMode()

  function toggleTheme() {
    setMode(theme === 'dark' ? 'light' : 'dark')
  }
```

:::check Ellenőrizd
A kapcsoló egyelőre csak a világost és a sötétet ismeri, ezért töröld kézzel az elmentett választást: írd be a
konzolba, hogy `localStorage.removeItem('stargazer-theme')`, aztán töltsd újra az oldalt. Most nyisd meg a fejlesztői
eszközök Rendering paneljét: kattints a fejlesztői eszközökbe, nyomd meg a ++Ctrl++ + ++Shift++ + ++P++ billentyűket,
írd be, hogy „rendering”, és nyomj ++Enter++-t. Az „Emulate CSS media feature prefers-color-scheme” értékét állítsd
`prefers-color-scheme: dark`-ra, aztán `prefers-color-scheme: light`-ra. Az oldal azonnal követi, újratöltés nélkül.
:::

:::mistake Gyakori hiba
Takarítás (`return () => media.removeEventListener(…)`) nélkül a figyelő akkor is életben marad, ha a komponense már
eltűnt. Fejlesztés közben a React [[StrictMode]]-ja (az `src/main.jsx`-ben ez veszi körül az `<App />`-ot) szándékosan
lefuttat minden effektet, aztán a takarítását, aztán újra az effektet, hogy az ilyen elfelejtett takarítások
kiderüljenek.
:::

### Világos, sötét vagy rendszer

Egy kétállású kapcsoló nem tudja azt mondani, hogy „kövesd a rendszert”. Ezért lecseréljük három gombra, amelyek közül
a kiválasztott világít. Hozd létre az `src/components/ThemeSwitch.jsx` fájlt:

```jsx file=src/components/ThemeSwitch.jsx
import './ThemeSwitch.css'

const OPTIONS = [
  { mode: 'light', label: 'Világos' },
  { mode: 'dark', label: 'Sötét' },
  { mode: 'system', label: 'Rendszer' },
]

function ThemeSwitch({ mode, onChange }) {
  return (
    <div className="theme-switch" role="group" aria-label="Téma">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          onClick={() => onChange(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitch
```

- Az `OPTIONS` egy tömb, és a `map` minden eleméből egy gombot csinál, mint az 1. leckében a készségek listája.
- A `role="group"` és az `aria-label` megmondja a képernyőolvasónak, hogy a három gomb összetartozik, és mi a közös
  nevük. Az `aria-pressed` azt jelzi, melyik gomb van lenyomva; a CSS a színezéshez is ezt használja.
- `onClick={() => onChange(option.mode)}`: ezúttal a függvénynek át kell adnunk valamit, a gomb módját. Ezért a hívást
  egy kis [[nyílfüggvénybe|nyílfüggvény]] csomagoljuk: kattintáskor a nyílfüggvény fut le, és az hívja meg az
  `onChange`-et a megfelelő móddal.

A stílusa az `src/components/ThemeSwitch.css` fájlba kerül:

```css file=src/components/ThemeSwitch.css
.theme-switch {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
}

.theme-switch button {
  padding: 6px 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

/* A kiválasztott gombot kitölti a kiemelő szín. */
.theme-switch button[aria-pressed='true'] {
  background: var(--accent);
  color: var(--surface);
}

.theme-switch button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

A `Header` most két dolgot ad tovább: a módot és a függvényt, amely átállítja:

```jsx file=src/components/Header.jsx mark=1,3,7
import ThemeSwitch from './ThemeSwitch.jsx'

function Header({ mode, onModeChange }) {
  return (
    <header className="site-header">
      <p className="logo">Stargazer</p>
      <ThemeSwitch mode={mode} onChange={onModeChange} />
    </header>
  )
}

export default Header
```

Az `App`-nak már nem kell a `toggleTheme`: maga a `setMode` megy le a kapcsolóig.

```jsx file=src/App.jsx mark=6,10
import useDarkMode from './useDarkMode.js'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  const { mode, setMode } = useDarkMode()

  return (
    <div className="page">
      <Header mode={mode} onModeChange={setMode} />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

A `ThemeToggle.jsx`-et és a `ThemeToggle.css`-t már semmi sem használja: törölheted őket.

:::check Ellenőrizd
Három gomb a fejlécben, a kiválasztott kiemelőszínnel kitöltve. A „Rendszer” követi a gépet (próbáld ki újra a
Rendering panellel), a „Világos” és a „Sötét” viszont marad, bármire van is állítva a gép. Töltsd újra: a választásod
megmarad. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Az `onClick={onChange(option.mode)}`, nyíl nélkül, megint a zárójeles hiba: rajzolás közben hívja meg az
`onChange`-et, mindhárom gombra. Ilyenkor az oldal a „Rendszer” módban ragad, a gombok nem reagálnak a kattintásra, a
konzolban pedig egy „Cannot update a component … while rendering a different component …” kezdetű piros hibaüzenet
jelenik meg. Ha egy függvénynek paramétert kell átadnod, csomagold be: `onClick={() => onChange(option.mode)}`.
:::

## Haladó szint {level=3}

### Egy téma az egész appnak: Context

Nézd meg, milyen utat jár be most a téma: az `App` meghívja a hookot, a `mode`-ot és a `setMode`-ot odaadja a
`Header`-nek, az pedig továbbadja a `ThemeSwitch`-nek. A `Header` semmit sem csinál velük, csak futár. Ennek a neve
[[prop drilling]] („propfúrás”): a propok olyan komponenseken át utaznak lefelé, amelyeknek nincs rájuk szükségük. Egy
igazi, több tucat komponensből álló appban a komponensek fele a témát cipelné.

Erre a React válasza a [[Context]]. A komponensek egymásba ágyazódnak (az `App`-ban ott a `Header`, abban a
`ThemeSwitch`), ezt a felépítést hívjuk [[komponensfának|komponensfa]]. Képzeld el a Contextet úgy, mint egy
rádióadót: a fa tetején egy [[Provider]] sugároz egy értéket, és bármelyik alatta lévő komponens rá tud hangolódni a
[[useContext]] segítségével, akármilyen mélyen van, propok nélkül.

Hozd létre az `src/ThemeContext.jsx` fájlt:

```jsx file=src/ThemeContext.jsx
import { createContext, useContext } from 'react'
import useDarkMode from './useDarkMode.js'

const ThemeContext = createContext(null)

// Egyszer hívja meg a hookot, és az eredményét megosztja minden benne lévő komponenssel.
export function ThemeProvider({ children }) {
  const value = useDarkMode()
  return <ThemeContext value={value}>{children}</ThemeContext>
}

// A ThemeProvideren belül bármelyik komponens ezzel a hookkal olvassa ki a témát.
export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('A useTheme csak a <ThemeProvider>-en belül használható')
  return value
}
```

- A `createContext(null)` létrehozza a Contextet. A `null` az, amit egy komponens kap, ha nincs fölötte Provider.
- A `<ThemeContext value={value}>` a Provider: a `value`-t sugározza, vagyis a hook által visszaadott objektumot.
- A [[children]] egy különleges prop: az, amit a `<ThemeProvider>` és a `</ThemeProvider>` közé teszel. A Provider
  ezt rajzolja ki, a Contextbe csomagolva.
- A `useTheme` egy kis hook, hogy a többi komponensnek ne is kelljen tudnia a `ThemeContext`-ről. Ráadásul érthető
  hibát ad, ha valaki a Provideren kívül használja: ilyenkor a `value` `null`, a `!value` (vagyis „nincs érték”) igaz,
  és a `throw new Error(…)` leállítja a programot, a konzolban pedig a mi üzenetünk jelenik meg.
- A fájl két függvényt exportál név szerint (`default` nélkül), ezért kapcsos zárójelben importálod őket:
  `import { useTheme } from '…'`, ahogy az 1. leckében a `PROJECTS`-et.
- A fájl `.jsx`-re végződik, mert JSX van benne (`<ThemeContext …>`); a `useDarkMode.js`-ben nincs, ott elég a `.js`.

:::concept Régebbi kódban
A React 19 előtt a Providert így írták: `<ThemeContext.Provider value={value}>`. Ma is működik, és sok projektben
találkozol vele; ebben a kurzusban a rövidebb formát használjuk.
:::

:::concept Egy üzenet a terminálban
Ha mostantól a `useDarkMode.js`-t vagy a `ThemeContext.jsx`-et módosítod, a terminál ilyesmit írhat:
`Could not Fast Refresh ("useTheme" export is incompatible)`, utána pedig `page reload`. Nincs semmi baj: a Vite csak
akkor tud egy fájlt helyben frissíteni, ha az csak komponenseket exportál. A `ThemeContext.jsx` egy hookot, a
`useTheme`-et is exportálja, ezért a Vite inkább az egész oldalt tölti újra.
:::

Csomagold az egész appot a Providerbe, az `src/main.jsx`-ben:

```jsx file=src/main.jsx mark=5,10,12
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'

// React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

Most a `ThemeSwitch` magától hangolódik rá, és senkinek sem kell semmit átadnia neki:

```jsx file=src/components/ThemeSwitch.jsx mark=1,10,11,19
import { useTheme } from '../ThemeContext.jsx'
import './ThemeSwitch.css'

const OPTIONS = [
  { mode: 'light', label: 'Világos' },
  { mode: 'dark', label: 'Sötét' },
  { mode: 'system', label: 'Rendszer' },
]

function ThemeSwitch() {
  const { mode, setMode } = useTheme()
  return (
    <div className="theme-switch" role="group" aria-label="Téma">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          onClick={() => setMode(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitch
```

A `Header` és az `App` elveszíti a témás propjait:

```jsx file=src/components/Header.jsx mark=3,7
import ThemeSwitch from './ThemeSwitch.jsx'

function Header() {
  return (
    <header className="site-header">
      <p className="logo">Stargazer</p>
      <ThemeSwitch />
    </header>
  )
}

export default Header
```

```jsx file=src/App.jsx mark=7
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  return (
    <div className="page">
      <Header />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

Az `App` ugyanolyan lett, amilyen az alapban volt: semmit sem kell tudnia a témákról.

:::check Ellenőrizd
Az oldal pontosan úgy működik, mint a középszint végén, csak a `Header`-nek és az `App`-nak már nincsenek témás
propjai.
:::

:::try Feladat
A cikk is reagáljon a témára. Az `src/components/Article.jsx`-ben importáld a hookot
(`import { useTheme } from '../ThemeContext.jsx'`), olvasd ki a témát a `const { theme } = useTheme()` sorral, és ha
nem `'light'`, írd a cím alatti szürke sor végére, hogy „· kész az éjszakára”. Az 1. lecke űrlapjából ismert
`{error && …}` trükk itt is működik, a `!==` pedig azt jelenti: „nem egyenlő”. Eggyel több komponens hangolódott rá, és
sehol egy új prop.
:::

:::mistake Gyakori hiba
Ha a konzolban ezt látod: „A useTheme csak a `<ThemeProvider>`-en belül használható”, az a mi saját üzenetünk a
`useTheme`-ből. Azt jelenti, hogy egy komponens a Provideren kívül hívta meg a hookot, például mert a `main.jsx` még
mindig Provider nélkül rajzolja ki az `<App />`-ot.
:::

### Harmadik téma: vörös fény

A csillagászok vörös fénynél olvassák a csillagtérképeiket, mert a vörös fény alig zavarja a sötéthez szokott szemet.
Adjunk a Stargazernek egy vörös, éjjellátó témát. A CSS-változóknak és a saját hookunknak köszönhetően ez három apró
változtatás.

A színek az `src/index.css`-be kerülnek, a sötét blokk alá:

```css file=src/index.css
/* A vörös fény alig zavarja a sötéthez szokott szemet: a csillagászok is így olvassák a térképeiket. */
:root[data-theme='red'] {
  color-scheme: dark;
  --bg: #120404;
  --surface: #1c0707;
  --text: #ff6b5e;
  --muted: #d65a4e;
  --accent: #ff3b2f;
  --accent-soft: #2a0b09;
  --line: #3a1210;
}
```

Az új mód bekerül a hook megengedett módjainak listájába. Itt csak az `src/useDarkMode.js` eleje látszik: a `MODES`
sort írd át, a fájl többi része marad:

```js file=src/useDarkMode.js mark=4
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stargazer-theme'
const MODES = ['light', 'dark', 'red', 'system']
```

És kap egy gombot a kapcsolóban. Itt csak az `src/components/ThemeSwitch.jsx` `OPTIONS` tömbje látszik: told be az új
sort, a fájl többi része marad:

```jsx file=src/components/ThemeSwitch.jsx mark=4
const OPTIONS = [
  { mode: 'light', label: 'Világos' },
  { mode: 'dark', label: 'Sötét' },
  { mode: 'red', label: 'Vörös' },
  { mode: 'system', label: 'Rendszer' },
]
```

Más nem változik. A hook eddig is a `mode`-ból számolta ki a `theme`-et, így vörös módban a téma `'red'`, az effekt
`data-theme="red"`-et ír a `<html>`-re, és a fenti CSS-blokk veszi át az irányítást.

:::check Ellenőrizd
Négy gomb. A „Vörös” mélyvörösre színezi az egész oldalt, a kapcsolót is, és újratöltés után is vörös marad.
:::

:::mistake Gyakori hiba
Ha a `'red'` kimarad a `MODES`-ból, a gomb működik, de újratöltés után az oldal visszaáll rendszermódba: a
`readSavedMode` minden olyan elmentett értéket eldob, amit nem ismer.
:::

:::try Feladat
Tervezz egy saját témát, például egy lágy „szépia” témát nappali olvasáshoz. Ennyi kell hozzá: egy CSS-blokk, egy elem
a `MODES`-ban és egy az `OPTIONS`-ban.
:::

### Villanás nélküli betöltés

Válaszd a „Sötét” módot, és töltsd újra az oldalt néhányszor. Néha az oldal egy pillanatra világosan felvillan,
mielőtt elsötétül.
Miért? A böngésző előbb kirajzolja a HTML-t és a CSS-t, és csak utána tölti le és futtatja a Reactot. Amíg az
effektünk le nem fut, a `<html>`-en nincs `data-theme`, ezért a világos színek látszanak. Gyors gépen ez csak egy
pillanat, egy lassú telefonon, sötétben viszont egy fehér villanás egyenesen a szemedbe.

A gyógymód néhány sor sima JavaScript az `index.html`-ben (a projekt gyökerében, nem az `src` mappában), ami
beállítja a `data-theme`-et, mielőtt a böngésző bármit kirajzolna. Egy [[beágyazott szkript]] a `<head>`-ben (egy
`<script>`, benne a kóddal, `src` és `type="module"` nélkül) azonnal lefut, miközben a böngésző még olvassa az
oldalt. Tedd a `<head>` részbe, a `<title>` sor alá:

```html file=index.html mark=9-20
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- No icon yet: an empty one keeps the browser from asking for /favicon.ico (a 404 in the console). -->
    <link rel="icon" href="data:," />
    <title>Dark Mode · Rika Mentoring</title>
    <script>
      // Még az oldal kirajzolása előtt lefut, így már a legelső kép is a jó témát mutatja.
      try {
        let theme = localStorage.getItem('stargazer-theme') || 'system'
        if (theme === 'system') {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        document.documentElement.dataset.theme = theme
      } catch {
        // Nincs tároló: a React egy pillanattal később beállítja a témát.
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Ez a `useDarkMode` logikája dióhéjban: az elmentett mód, rendszermódban pedig a gép beállítása. A `let` új: olyan
változót hoz létre, aminek később új értéket adhatunk (egy `const`-nak nem). A `|| 'system'` ugyanaz, mint az 1. lecke
`useHashRoute`-jában a `|| '/'`: ha nincs elmentett érték (`null`), a `'system'` lesz helyette. Amikor a React
elindul, a hook ugyanarra a témára jut, így semmi látható nem változik.

:::check Ellenőrizd
A különbséget a kész buildben érdemes nézni: a fejlesztői szerver a CSS-t is JavaScriptből tölti be, ezért ott a
szkripttel együtt is felvillanhat egy pillanatra egy üres, fehér oldal. Állítsd le a fejlesztői szervert
(++Ctrl++ + ++C++), futtasd az `npm run build`, majd az `npm run preview` parancsot, és nyisd meg a kiírt címet. A
fejlesztői eszközök Network fülén kapcsold be a „Disable cache” jelölőnégyzetet, állítsd a sebességet „Slow 4G”-re,
válaszd a „Sötét” módot, és töltsd újra: az oldal az első pillanattól sötét. Összehasonlításképp tedd megjegyzésbe a szkriptet
(elé `<!--`, mögé `-->`), állítsd le az előnézetet, futtasd újra a két parancsot, és töltsd újra ugyanígy: most egy
pillanatra felvillan a világos háttér. Utána állítsd le az előnézetet (++Ctrl++ + ++C++), vedd ki a két
megjegyzésjelet, és indítsd újra a fejlesztői szervert (`npm run dev`), mert a következő lépés ott folytatódik.
:::

:::mistake Gyakori hiba
Az `index.html`-ben lévő kulcsnak és a `useDarkMode.js`-ben lévő `STORAGE_KEY`-nek pontosan egyeznie kell. Ha eltér, a
szkript nem talál semmit, és visszajön a villanás, hibaüzenet nélkül.
:::

### Animált váltás

Végül csináljunk egy kis látványosságot magából a váltásból: az új téma körben nő ki a megnyomott gombból, mint amikor
a sötétben felkapcsolsz (vagy lekapcsolsz) egy lámpát.

A nehezét a böngésző [[View Transitions API]]-ja végzi. A `document.startViewTransition(change)` lefényképezi az
oldalt, meghívja a `change`-et, lefényképezi az új állapotot, és animációval átvezet a régi képből az újba. Hogy milyen
animációval, azt a CSS dönti el.

Egy bökkenő van. A React általában egy pillanattal később frissíti az oldalt, mint amikor kéred, a böngésző viszont az
új állapotot rögtön látni akarja, amint a `change` lefutott. A [[flushSync]] (a `react-dom`-ból) azt mondja a
Reactnak: most csináld, még a következő sor előtt. Írd át így az `src/components/ThemeSwitch.jsx`-et:

```jsx file=src/components/ThemeSwitch.jsx mark=1,15-36,45
import { flushSync } from 'react-dom'
import { useTheme } from '../ThemeContext.jsx'
import './ThemeSwitch.css'

const OPTIONS = [
  { mode: 'light', label: 'Világos' },
  { mode: 'dark', label: 'Sötét' },
  { mode: 'red', label: 'Vörös' },
  { mode: 'system', label: 'Rendszer' },
]

function ThemeSwitch() {
  const { mode, setMode } = useTheme()

  function choose(event, nextMode) {
    if (nextMode === mode) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Ez a böngésző nem ismeri a View Transitions API-t, vagy ki van kapcsolva a mozgás: azonnal váltunk.
    if (!document.startViewTransition || reduceMotion) {
      setMode(nextMode)
      return
    }

    // A kör a megnyomott gomb közepéből indul.
    const box = event.currentTarget.getBoundingClientRect()
    const root = document.documentElement
    root.style.setProperty('--reveal-x', `${box.left + box.width / 2}px`)
    root.style.setProperty('--reveal-y', `${box.top + box.height / 2}px`)

    // Régi kép, a változás (a flushSync miatt azonnal), új kép, animáció.
    document.startViewTransition(() => {
      flushSync(() => {
        setMode(nextMode)
      })
    })
  }

  return (
    <div className="theme-switch" role="group" aria-label="Téma">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          onClick={(event) => choose(event, option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitch
```

- `if (nextMode === mode) return`: ha a már kiválasztott gombra kattintasz, nem történik semmi, így a kör sem fut le
  feleslegesen.
- `onClick={(event) => choose(event, option.mode)}`: a React minden kattintáskezelőnek átad egy eseményobjektumot,
  ahogy az 1. lecke űrlapjánál. A nyílfüggvény ezt adja tovább a `choose`-nak, a móddal együtt.
- Az `event.currentTarget` a megnyomott gomb, a `getBoundingClientRect()` pedig megmondja, hol van a képernyőn; ebből
  számoljuk ki a közepét.
- A `root.style.setProperty('--reveal-x', …)` a közepet két CSS-változóba teszi a `<html>`-en. CSS-változót
  JavaScriptből is lehet állítani, és a lenti animáció ezeket olvassa.
- Az API-t nem ismerő böngészők (a `!document.startViewTransition` azt jelenti: nincs ilyen függvény) és azok, akik
  kikapcsolták a mozgást a gépükön (a `prefers-reduced-motion` beállítás az 1. leckéből), az egyszerű, azonnali
  váltást kapják.

Az animáció az `src/index.css` végére kerül:

```css file=src/index.css
/* A témaváltás: az új színek a gombból kinövő körben jelennek meg. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  animation: reveal 0.6s ease-out;
}

@keyframes reveal {
  from {
    clip-path: circle(0 at var(--reveal-x) var(--reveal-y));
  }
  to {
    clip-path: circle(150vmax at var(--reveal-x) var(--reveal-y));
  }
}
```

Váltás közben a böngésző egymásra teszi a két képet: a `::view-transition-old(root)` a régi oldal, a
`::view-transition-new(root)` az új. Kikapcsoljuk az alapértelmezett áttűnésüket (`animation: none`, és
`mix-blend-mode: normal`, hogy a két kép ne keveredjen egymásba), és az új képnek saját animációt adunk, `reveal`
néven. Hogy ez mit csinál, azt a [[@keyframes]] szabály írja le: honnan indul (`from`) és hová ér (`to`). A
[[clip-path]] egy kört vág ki az új képből: az elején 0 széles, a végén nagyobb az ablaknál (a `150vmax` az ablak
hosszabbik oldalának másfélszerese), így minden sarokba elér.

:::check Ellenőrizd
Válaszd a „Világos” módot, aztán kattints a „Sötét” gombra: az éjszaka körben terjed szét a gombtól. Billentyűzettel
is működik, ilyenkor attól a gombtól indul, amelyiken a fókusz van (amelyik körül a keret látszik). A Rendering
panelen az „Emulate CSS media feature prefers-reduced-motion” értékét reduce-ra állítva a váltás megint azonnali. Kész
a lecke: commitold, és jó csillagnézést!
:::

:::mistake Gyakori hiba
`flushSync` nélkül a böngésző lefényképezheti az új állapotot, mielőtt a React frissítette volna az oldalt, és a kör a
régi színeket fedi fel. Ha a `startViewTransition`-nek átadott függvényben React-állapotot változtatsz, a változtatást
mindig csomagold `flushSync`-be.
:::
