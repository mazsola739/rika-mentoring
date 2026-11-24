# Mit építünk?

Egy gépelési sebességmérőt. Megjelenik egy rövid szöveg, te begépeled, az oldal pedig közben méri az időt, és
kiszámolja, milyen gyors és milyen pontos vagy. A jól begépelt betűk sötétre váltanak, az elgépeltek pirosra, egy
villogó vonal pedig mutatja, hol tartasz. A végén grafikonon követheted a sebességedet, ranglistán a legjobb
eredményeidet, és két böngészőablakban versenyezhetsz is.

Közben jobban megismered a `useRef` hookot: egy dobozt, amit a React megőriz a rajzolások között, de ha a tartalma
megváltozik, nem rajzol újra miatta. Megtanulod, hogyan indíts el és állíts le pontosan egy időzítőt, mi mindent számol
ki egy app minden egyes billentyűleütésnél, és hogyan spórold meg a felesleges újrarajzolásokat.

:::levels
- Egy szöveg begépelése, időmérés stopperrel, karakter/perc, újrakezdés. | kb. 2 óra
- Élő kiemelés (helyes / hibás), szó/perc és pontosság, 30 és 60 másodperces mód, kevesebb újrarajzolás. | kb. 3 óra
- Élő grafikon gépelés közben, előzmények és fejlődés, ranglista, verseny két böngészőablak között. | kb. 3 óra
:::

**Előismeret:** az előző leckék. Leginkább ezekre építünk: vezérelt mezők (3. és 4. lecke), a `setInterval` és a
takarító függvény (11–13. lecke), a `useRef` egy HTML-elemhez (12. és 13. lecke), a closure-csapda (7. és 13. lecke) és
a `useLocalStorage` hook (6., 9. és 13. lecke). Ahol egy ismerős dolgot új módon használunk, ott újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Ennek a leckének a kiinduló projektje a kurzus GitHub-repójában a `lessons/16-typing-test/exercise` mappa (fent:
„Feladat a GitHubon”). Ugyanúgy szerzed meg, mint a korábbi leckékben; az 1. lecke minden lépést részletesen
elmagyaráz. A terminálban, a munkamappádban (abban, amelyikben a `rika-mentoring` mappa van):

```shell
cd rika-mentoring
git pull        # lehozza a repóba az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/16-typing-test/exercise typing-test
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/16-typing-test/exercise` mappát a munkamappádba. A mappát a fájlkezelőben is átmásolhatod;
az a lényeg, hogy a másolatod neve `typing-test` legyen, és a `rika-mentoring` mappán kívülre kerüljön: így a
`git pull` továbbra is működik. Nyisd meg a másolatodat a szerkesztőben, aztán írd be ezt a két parancsot a
szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér panelt látsz
„Typing Speed Test” címmel. Más még nincs rajta: a mérőt te építed meg.
:::

A kiinduló projektben három fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja; innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen (a panel, a kis statisztikadobozok, a színes betűk, a villogó kurzor,
  a grafikon, a versenysávok…). Ezeket nem kell megírnod; csak a lépésekben megadott osztályneveket használod
  (`typing`, `stats`, `passage`, …).
- `src/passages.js`: négy rövid gyakorlószöveg egy tömbben. Ezeket fogod begépelni.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések, a cím és a gyakorlószövegek angolul
vannak. A szövegeket nyugodtan cseréld le magyarokra, vagy írj hozzájuk sajátot: az ékezetes betűkkel is működik
minden. Csak egyszerű írásjeleket használj (a „…” idézőjelek és a – gondolatjel nincsenek rajta a billentyűzeten),
különben lesz olyan karakter, amit nem tudsz begépelni.

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. A szervert hagyd futni, és nyiss egy
második terminált (a terminálpanel **+** gombja; ez is a `typing-test` mappában nyílik meg):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Ettől kezdve a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni.

:::concept Gyors ismétlés: mit jelent az, hogy „rajzolás”?
Amikor egy komponens [[állapota|állapot]] megváltozik, a React újra lefuttatja a komponens függvényét, az elejétől a
végéig, és a kapott [[JSX]] alapján frissíti a képernyőt. Ez egy rajzolás (angolul render). Ami a függvényben
`const`-tal vagy `let`-tel születik, az minden rajzoláskor újra létrejön; csak az marad meg, amit a React őriz neked,
például a `useState` értéke. Ebben a leckében sokat építünk erre: a gépelésmérő órája tizedmásodpercenként újrarajzolja az
oldalt.
:::

### A szöveg és a gépelőmező

Először jelenjen meg a begépelendő szöveg, alatta pedig egy mező, ahová gépelhetsz. A `PASSAGES` egy [[tömb]],
amelynek minden eleme egy szöveg ([[string]]), így a `PASSAGES[0]` az első gyakorlószöveg.

A gépelés egy [[textarea]]-ba, vagyis többsoros szövegmezőbe kerül. Ahogy a 3. és a 4. leckében, most is
[[vezérelt mezőt|vezérelt mező]] készítünk belőle: az értékét (`value`) az állapotból kapja, és minden leütésnél az
`onChange` frissíti az állapotot. Minden stringnek van egy `length` tulajdonsága, ami a hosszát adja meg karakterben (a
szóköz és az írásjel is karakter). A `maxLength` attribútum azt kéri a böngészőtől, hogy ennél több karaktert ne
engedjen beírni.

A számok, ahogy a 13. leckében, egy [[leíró listába|leíró lista]] kerülnek: a `<dl>`-ben a `<dt>` egy nevet, a `<dd>`
a hozzá tartozó értéket tartalmazza, az `App.css` `stats` osztálya pedig minden `<div>`-ből egy kis dobozt rajzol.
Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=1-2,6-7,12-32
import { useState } from 'react'
import { PASSAGES } from './passages.js'
import './App.css'

function App() {
  const [typed, setTyped] = useState('')
  const text = PASSAGES[0]

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Karakter</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
      </dl>
      <p className="typing__text">{text}</p>
      <textarea
        className="typing__field"
        aria-label="Ide gépeld a fenti szöveget"
        placeholder="Kezdd el gépelni a fenti szöveget…"
        value={typed}
        maxLength={text.length}
        onChange={(event) => setTyped(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </main>
  )
}

export default App
```

- A `typed` az, amit eddig begépeltél. Üres stringként indul.
- Az `aria-label` nevet ad a mezőnek a képernyőolvasóknak, hiszen nincs mellette látható felirat (a `placeholder`
  szürke szövege eltűnik, amint gépelni kezdesz, ezért nem számít feliratnak).
- Az utolsó négy attribútum kikapcsolja a böngésző „segítségét”: a piros hullámos aláhúzást a helyesírás-ellenőrzéstől,
  a korábban beírt szövegek felajánlását, a telefonok automatikus javítását és a mondat eleji nagybetűt. Egy
  gépelésmérőben ezek csak bekavarnának: a telefon kijavítaná az elgépelésedet, és nem az számítana, amit te írtál.

:::check Ellenőrizd
A cím alatt egy doboz áll: „Karakter 0 / 193” (a nevet az `App.css` csupa nagybetűvel írja). Alatta szürke háttéren az első gyakorlószöveg, legalul egy üres mező
„Kezdd el gépelni a fenti szöveget…” felirattal. Gépelj bele: a szám minden betűvel eggyel nő, a ++Backspace++-re
csökken, a 193. karakter után pedig a mező nem enged többet.
:::

:::mistake Gyakori hiba
`text.length()`, zárójellel. A `length` nem függvény, hanem tulajdonság: egy szám, ami a stringhez tartozik. A
zárójellel a JavaScript meg akarja hívni, és az oldal helyén üres lap marad, a konzolban (++F12++) pedig ez áll:
„text.length is not a function”.
:::

:::try Próbáld ki
Írd át a `PASSAGES[0]`-t `PASSAGES[3]`-ra: megjelenik a negyedik szöveg, hiszen a számozás 0-tól indul. Utána állítsd
vissza.
:::

### Stopperóra: useRef

Most mérjük az időt az első leütéstől az utolsóig. A `Date.now()` a pillanatnyi időt adja egy számként, ezredmásodpercben
(ez az [[időbélyeg]], a 11. leckében már találkoztál vele). Két időbélyeg különbsége az eltelt idő: ha az első leütéskor
eltesszük a `Date.now()` értékét, utána bármikor kiszámolhatjuk, mennyi idő telt el azóta.

Két új állapot kell hozzá: a `startedAt` az első leütés időbélyege, a `now` pedig a „most”. Az eltelt idő a kettő
különbsége, egy [[származtatott érték]]. Hogy az óra gépelés közben is fusson, a `now`-t sűrűn frissíteni kell: erre
való a [[setInterval]], amely tizedmásodpercenként (100 ezredmásodpercenként) meghív egy függvényt.

Az időzítőt eddig mindig egy `useEffect` indította és állította le (a 13. leckében például a `running` értékét figyelte).
Most másképp csináljuk: az időzítőt az első leütés indítja el, és az utolsó állítja le, mindkettőt az `onChange`
[[eseménykezelőben|eseménykezelő]]. A `setInterval` visszaad egy azonosítót (egy számot), és a `clearInterval`-nak ezt
kell odaadni, hogy leállítsa. Csakhogy az azonosító az első leütéskor születik, és csak az utolsónál lesz rá szükség,
majdnem kétszáz leütéssel később. Hol tároljuk addig?

- **Egy sima változóban?** Egy `let timer = null` a komponensben nem jó. A komponens függvénye minden rajzoláskor újra
  lefut, és a `timer` minden alkalommal újra `null`-ként születik. Mire az utolsó betű megérkezik, az azonosító rég
  elveszett, és az órát semmi sem állítja meg.
- **Állapotban?** Működne, de minden mentése újrarajzolná az oldalt, teljesen feleslegesen: az azonosító sosem jelenik
  meg a képernyőn.

Erre való a [[useRef]]. A 12. és a 13. leckében arra használtad, hogy megfogj vele egy HTML-elemet, de valójában egy
egyszerűbb dolog: a `useRef(null)` egy `{ current: null }` objektumot ad, és a React minden rajzoláskor **ugyanazt** az
objektumot adja vissza. Amit a `current` mezőjébe teszel, az ott marad, amíg felül nem írod, és a változásától a React
nem rajzol újra. Egy doboz a komponens mellett. A `ref={…}` attribútummal a React tett bele egy elemet; most mi magunk
teszünk bele egy számot, az időzítő azonosítóját.

:::concept Állapot vagy ref?
- Ha valami megjelenik a képernyőn, és a változásakor újra kell rajzolni: **állapot** (`typed`, `startedAt`, `now`).
- Ha csak a kódodnak kell a rajzolások között, a képernyőn sosem látszik: **ref** (az időzítő azonosítója).
:::

Az időt perc:másodperc.tized alakban mutatjuk. Hozd létre az `src/stats.js` fájlt; ebbe kerülnek a lecke
számolófüggvényei:

```js file=src/stats.js
// Ezredmásodpercből perc:másodperc.tized, például 75 300-ból „1:15.3”.
export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  const tenths = Math.floor((ms % 1000) / 100)
  return `${minutes}:${seconds}.${tenths}`
}
```

Ez a 13. lecke `formatTime`-ja, csak ezredmásodpercet kap, és a tizedmásodpercet is kiírja. A `%` a maradékos osztás
([[modulo]]): a `75300 % 1000` értéke 300, vagyis a megkezdett másodpercből eltelt ezredmásodpercek száma, és ebből
100-zal osztva lesz a tized. A [[padStart]] a másodperc elé írja a nullát: `1:05.3`, nem `1:5.3`. Most cseréld le az
`src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=1,3,8-12,15,17-20,22-24,26-40,46-49,64
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { formatTime } from './stats.js'
import './App.css'

function App() {
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)

  const text = PASSAGES[0]
  const elapsed = startedAt === null ? 0 : now - startedAt

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát: tizedmásodpercenként frissül.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // Az utolsó karakter megállítja.
    if (value.length === text.length) {
      stopTimer()
    }
    setNow(time)
    setTyped(value)
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Idő</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>Karakter</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
      </dl>
      <p className="typing__text">{text}</p>
      <textarea
        className="typing__field"
        aria-label="Ide gépeld a fenti szöveget"
        placeholder="Kezdd el gépelni a fenti szöveget…"
        value={typed}
        maxLength={text.length}
        onChange={handleChange}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </main>
  )
}

export default App
```

- A `handleChange` minden leütésnél lefut. Ha a `startedAt` még `null`, ez az első: eltesszük az időt, és elindítjuk az
  időzítőt. Az azonosítója a `timerRef.current`-be kerül.
- Az időzítő függvénye nem számolja a tizedeket, hanem minden alkalommal megkérdezi a valódi időt (`Date.now()`). Így
  akkor is pontos marad, ha a böngésző néha késik egy kicsit (a 13. leckében olvashattál erről).
- Ha a begépelt szöveg ugyanolyan hosszú, mint a minta, ez volt az utolsó karakter: a `stopTimer` leállítja az órát.
- A `setNow(time)` a leütés pillanatát is beírja, így az utolsó leütésnél a `now` pontosan a befejezés ideje lesz, és
  ott is marad.
- Az [[effekt|useEffect]] üres [[függőségi tömbbel|függőségi tömb]] csak egyszer fut le, az első rajzolás után. Nem
  csinál semmit, csak visszaad egy [[takarító függvényt|takarító függvény]], amit a React akkor hív meg, amikor a
  komponens eltűnik az oldalról. Az `App` sosem tűnik el, de ez jó szokás: így egyetlen gazdátlan időzítő sem ketyeg
  tovább a semmibe.

:::check Ellenőrizd
Egy új doboz jelenik meg: „Idő 0:00.0”. Amíg nem gépelsz, áll. Az első betűvel elindul, és pörögnek a tizedek. Amikor
beírod az utolsó karaktert (193 / 193), megáll, például 0:52.3-nál, és ott is marad.
:::

:::mistake Gyakori hiba
`clearInterval(timerRef)`, a `.current` nélkül. Ilyenkor magát a dobozt adod át, nem a benne lévő számot; a
`clearInterval` nem ismeri fel, szó nélkül nem csinál semmit, és az óra az utolsó karakter után is tovább jár.
:::

:::try Próbáld ki
Írd a `setInterval` sora alá: `console.log(timerRef.current)`, és nézd meg a konzolt (++F12++ → Console) az első
leütés után. Az azonosító egy sima szám, például 5. Ennyit kell egy refnek őriznie. Utána töröld a sort.
:::

### Karakter per perc

Az idő megvan, jöhet a sebesség. A karakter per perc azt mondja meg, hány karaktert gépelnél le egy egész perc alatt
ezzel a tempóval: a karakterek számát elosztjuk az eltelt percekkel. Az eltelt idő ezredmásodpercben van, egy percben
60 000 ezredmásodperc van, így a percek száma `ms / 60000`. Például 193 karakter 52,3 másodperc (0,87 perc) alatt
nagyjából 221 karakter percenként. Írd ezt az `src/stats.js` végére:

```js file=src/stats.js
// Karakter per perc: ennyi karaktert gépelnél le egy egész perc alatt ezzel a tempóval.
export function charsPerMinute(chars, ms) {
  // Az első másodpercben még vadul ugrálna: 1 karakter 0,1 másodperc alatt 600 lenne percenként.
  if (ms < 1000) return 0
  return Math.round(chars / (ms / 60000))
}
```

A [[Math.round]] a legközelebbi egész számra kerekít. Az `App`-ban két új származtatott érték jön: a `done` igaz, ha
minden karaktert begépeltél, a `cpm` (characters per minute) pedig a sebesség. Ha kész vagy, a mező `readOnly` lesz,
vagyis csak olvasható: látszik, de nem lehet beleírni. Egy sötét sáv pedig kiírja az eredményt; a `role="status"`
miatt a képernyőolvasók fel is olvassák, amikor megjelenik. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=3,16-17,58-61,70,77-81
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { charsPerMinute, formatTime } from './stats.js'
import './App.css'

function App() {
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)

  const text = PASSAGES[0]
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length
  const cpm = charsPerMinute(typed.length, elapsed)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát: tizedmásodpercenként frissül.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // Az utolsó karakter megállítja.
    if (value.length === text.length) {
      stopTimer()
    }
    setNow(time)
    setTyped(value)
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Idő</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>Karakter</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
        <div>
          <dt>Karakter/perc</dt>
          <dd>{cpm}</dd>
        </div>
      </dl>
      <p className="typing__text">{text}</p>
      <textarea
        className="typing__field"
        aria-label="Ide gépeld a fenti szöveget"
        placeholder="Kezdd el gépelni a fenti szöveget…"
        value={typed}
        maxLength={text.length}
        readOnly={done}
        onChange={handleChange}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      {done && (
        <p className="result" role="status">
          Kész! {formatTime(elapsed)} alatt, percenként {cpm} karakter.
        </p>
      )}
    </main>
  )
}

export default App
```

Ez a „számolás minden leütésnél”: a `done` és a `cpm` nincs eltárolva sehol, minden rajzoláskor újra kiszámoljuk őket a
`typed`-ből és az időből. Így sosem fordulhat elő, hogy a kiírt sebesség és a begépelt szöveg nincs összhangban.

:::check Ellenőrizd
A harmadik doboz, a „Karakter/perc”, az első másodpercben 0, aztán gépelés közben ugrál egy kicsit, és lassan
beáll. Az utolsó karakter után a mező kiszürkül, nem enged több betűt, alatta pedig megjelenik egy sötét sáv, például
„Kész! 0:52.3 alatt, percenként 221 karakter.”
:::

:::mistake Gyakori hiba
Kimarad a `Math.round`. Ekkor a dobozban ilyen számok jelennek meg: 221.43678160919541. A számítás nem hibás, csak a
sok tizedesjegy semmit sem mond, és tizedmásodpercenként változik.
:::

:::try Csalók előnyben?
Gépelj be egy betűt, várj két másodpercet, aztán másold ki a szöveg többi részét az egérrel, és illeszd be
(++Ctrl++ + ++V++): pillanatok alatt kész, több ezer karakter percenként. Javítsd ki: a `<textarea>` kapjon egy
`onPaste={(event) => event.preventDefault()}` attribútumot. Az `onPaste` a beillesztéskor fut le, a `preventDefault()`
pedig letiltja a böngésző [[alapértelmezett viselkedését|alapértelmezett viselkedés]], vagyis magát a beillesztést. Az
`App` további teljes listáiban már benne van ez a sor.
:::

### Újrakezdés, kurzorral a mezőben

Egy mérés után biztosan újra nekifutnál, ugyanazzal vagy egy másik szöveggel. Az újrakezdés minden állapotot
visszaállít a kezdőértékére, és leállítja az órát. Ezután jó lenne, ha rögtön gépelhetnél, kattintás nélkül. Ehhez a
kurzornak, vagyis a [[fókusznak|fókusz]], vissza kell kerülnie a mezőbe. A mezőnek van erre egy függvénye, a `focus()`, de azt csak a
valódi HTML-elemen lehet meghívni. Ezt az elemet adja a 12. és a 13. leckéből ismert `ref={…}`: a React a rajzolás
után beleteszi az elemet a dobozba, és onnantól az `inputRef.current` maga a `<textarea>`.

Most már két refed van, két különböző feladatra: a `timerRef` egy értéket őriz (az időzítő azonosítóját), az `inputRef`
egy elemet. Ugyanaz az eszköz: egy doboz, ami túléli a rajzolásokat.

Jöjjön még két dolog:

- **Következő szöveg.** Az `index` állapot mondja meg, melyik szöveget gépeled. A `(index + 1) % PASSAGES.length` a
  modulóval körbejár: 0, 1, 2, 3, aztán megint 0.
- **Billentyűk.** Az `onKeyDown` minden lenyomott billentyűnél lefut, még a beírás előtt, és az `event.key` megmondja,
  melyik volt. Az ++Esc++ újrakezd, az ++Enter++ pedig semmit se csináljon: a szövegben nincs sortörés, így egy beírt
  sortörés csak egy biztos hiba lenne.

Itt a teljes `src/App.jsx`, ahogy a kezdő szint végén kinéz (benne az előző feladat `onPaste` sora is):

```jsx file=src/App.jsx mark=7,14-15,17,47-54,56-59,61-66,89,97-98,109-116
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { charsPerMinute, formatTime } from './stats.js'
import './App.css'

function App() {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)
  // Maga a szövegmező: rajta keresztül a kódból is bele tudjuk tenni a kurzort.
  const inputRef = useRef(null)

  const text = PASSAGES[index]
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length
  const cpm = charsPerMinute(typed.length, elapsed)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát: tizedmásodpercenként frissül.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // Az utolsó karakter megállítja.
    if (value.length === text.length) {
      stopTimer()
    }
    setNow(time)
    setTyped(value)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    // A kurzor visszakerül a mezőbe: rögtön gépelhetsz.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: újrakezdés.
    if (event.key === 'Escape') restart()
    // A szöveg egyetlen hosszú sor: az Enter csak egy hibás karaktert írna.
    if (event.key === 'Enter') event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Idő</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>Karakter</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
        <div>
          <dt>Karakter/perc</dt>
          <dd>{cpm}</dd>
        </div>
      </dl>
      <p className="typing__text">{text}</p>
      <textarea
        ref={inputRef}
        className="typing__field"
        aria-label="Ide gépeld a fenti szöveget"
        placeholder="Kezdd el gépelni a fenti szöveget…"
        value={typed}
        maxLength={text.length}
        readOnly={done}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={(event) => event.preventDefault()}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      {done && (
        <p className="result" role="status">
          Kész! {formatTime(elapsed)} alatt, percenként {cpm} karakter.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Újrakezdés
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Következő szöveg
        </button>
      </div>
    </main>
  )
}

export default App
```

A `restart` négy állapotot állít be egymás után. Ettől nem rajzol négyszer: a React megvárja, amíg az eseménykezelő
végigfut, és csak utána rajzol, egyszer, az összes változással együtt.

:::check Ellenőrizd
Gépelj be néhány szót, és nyomd meg az ++Esc++-et: a mező kiürül, az óra 0:00.0-ra ugrik, a kurzor pedig ott villog a
mezőben, kattintás nélkül gépelhetsz tovább. A „Következő szöveg” a második gyakorlószöveget hozza, a negyedik után
megint az elsőt. Egy befejezett mérés után az „Újrakezdés” újra írhatóvá teszi a mezőt. Az ++Enter++ nem csinál semmit.
Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
Kimarad a `ref={inputRef}` a `<textarea>`-ról. Ekkor a dobozba sosem kerül elem, az `inputRef.current` `null` marad, és
bár az „Újrakezdés” kiüríti a mezőt és lenullázza az órát, a kurzor nem kerül vissza a mezőbe (a gombon marad), a
konzolban pedig ez áll: „Cannot read properties of null (reading 'focus')”.
:::

:::try Próbáld ki
Írd a `<textarea>`-ra: `autoFocus`. Így már az oldal betöltésekor a mezőben villog a kurzor, és rögtön kezdhetsz.
:::

## Középszint {level=2}

### Élő kiemelés

A szürke dobozt és a mezőt egyetlen színes szövegre cseréljük: minden karakter mutatja, hogy jól gépelted-e. Ehhez a
szöveg minden karaktere külön `<span>`-be kerül, saját osztállyal: `char--ok` (helyes), `char--bad` (hibás) vagy
`char--todo` (még hátravan). Hogy melyik, azt minden rajzoláskor kiszámoljuk: az `i`-edik karakter helyes, ha a `typed`
`i`-edik karaktere ugyanaz.

Az új komponens az `src/components/Passage.jsx` fájlba kerül (hozd létre a `components` mappát is):

```jsx file=src/components/Passage.jsx
// A szöveg karakterenként: helyesen begépelt, elgépelt vagy még hátravan.
function Passage({ text, typed }) {
  return (
    <p className="passage">
      {[...text].map((char, i) => {
        let state = 'todo'
        if (i < typed.length) {
          state = typed[i] === char ? 'ok' : 'bad'
        }
        // A kurzor a következő begépelendő karakter előtt villog.
        const current = i === typed.length ? ' is-current' : ''
        return (
          <span key={i} className={`char char--${state}${current}`}>
            {char}
          </span>
        )
      })}
    </p>
  )
}

export default Passage
```

- A `[...text]` a [[spread]] egy stringre: a szöveget karakterek tömbjévé bontja (`'abc'` → `['a', 'b', 'c']`), és
  ezen már végig lehet menni a `map`-pel.
- A `key` most a karakter sorszáma, az `i`. A 9. leckében azt tanultad, hogy a sorszám rossz kulcs, ha a lista elemei
  helyet cserélhetnek. Itt sosem cserélnek: az ötödik karakter mindig az ötödik marad, így a sorszám tökéletes kulcs.
- Az `is-current` osztályt az a karakter kapja, amelyik következik (a sorszáma épp a begépelt szöveg hosszával
  egyenlő). Az `App.css` ez elé a karakter elé rajzolja a villogó kurzort.

És hová gépelünk? A `<textarea>` marad, csak láthatatlan lesz: a `typing__input` osztály egy apró, átlátszó mezővé
teszi a doboz sarkában. A billentyűket továbbra is ő kapja, a színes szöveg pedig megmutatja, mi történt. Mivel a mező
nem látszik, a dobozra kattintás a refen át adja neki a fókuszt.

Van még egy csapda: a láthatatlan mezőben a nyílbillentyűk (és a ++Home++, ++End++) odébb vinnék a kurzort, és a
következő betű a szöveg közepére kerülne. Ezért ezeket is letiltjuk. Az [[includes]] megmondja, benne van-e egy elem a
tömbben. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=4,7-8,68-69,91-110
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { charsPerMinute, formatTime } from './stats.js'
import Passage from './components/Passage.jsx'
import './App.css'

// Billentyűk, amelyek a láthatatlan mezőben odébb vinnék a kurzort: az mindig a szöveg végén marad.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

function App() {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)
  // Maga a szövegmező: rajta keresztül a kódból is bele tudjuk tenni a kurzort.
  const inputRef = useRef(null)

  const text = PASSAGES[index]
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length
  const cpm = charsPerMinute(typed.length, elapsed)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát: tizedmásodpercenként frissül.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // Az utolsó karakter megállítja.
    if (value.length === text.length) {
      stopTimer()
    }
    setNow(time)
    setTyped(value)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    // A kurzor visszakerül a mezőbe: rögtön gépelhetsz.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: újrakezdés.
    if (event.key === 'Escape') restart()
    // Az Enter csak egy hibás karaktert írna, a nyilak pedig odébb vinnék a kurzort.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Idő</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>Karakter</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
        <div>
          <dt>Karakter/perc</dt>
          <dd>{cpm}</dd>
        </div>
      </dl>
      {/* A dobozra kattintva a láthatatlan mező kapja meg a kurzort. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Ide gépeld a szöveget"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Kattints a szövegre, és kezdj el gépelni. Esc: újrakezdés.</p>
      {done && (
        <p className="result" role="status">
          Kész! {formatTime(elapsed)} alatt, percenként {cpm} karakter.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Újrakezdés
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Következő szöveg
        </button>
      </div>
    </main>
  )
}

export default App
```

Minden leütés után a `Passage` újra lefut, és mind a 193 karaktert újra összeveti. Ez a „számolás minden leütésnél”
második fajtája: nem tároljuk, melyik betű volt jó, hanem minden alkalommal kiszámoljuk. Egy számítógépnek pár száz
összehasonlítás semmiség, a másodperc ezredrésze alatt megvan.

:::check Ellenőrizd
A szöveg most egy fehér, keretes dobozban áll, szürke, egyforma szélességű betűkkel, az első betű előtt egy halvány,
álló vonallal. Kattints a dobozra: a kerete zöldre vált, a vonal pedig villogni kezd. Gépelj: a jól eltalált betűk
sötétre váltanak, egy elgépelt betű rózsaszín hátteret és hullámos aláhúzást kap, a villogó vonal pedig halad
előre. Egy ++Backspace++ után a hibás betű újra szürke. A nyílbillentyűk nem csinálnak semmit.
:::

:::mistake Gyakori hiba
Kimarad a `key={i}` a `<span>`-ről. Az oldal működik, de a konzolban piros figyelmeztetés jelenik meg: „Each child in a
list should have a unique "key" prop”. Egy `map`-pel készült lista minden elemének kulcs kell, ezzel tudja a React
követni, melyik melyik.
:::

### Hibák, pontosság és szó/perc

A gépelési sebességet világszerte szó per percben szokás mérni. Hogy egy hosszú és egy rövid szó ne számítson ugyanannyinak,
a szokásos szabály szerint **minden 5 karakter számít egy szónak** (a szóközt is beleértve), és csak a helyes karakterek
számítanak. A szó/perc tehát nagyjából a karakter/perc ötöde, csak a hibák nélkül.

A pontosság azt mutatja, hogy a leütéseid hány százaléka volt helyes. Ezt nem lehet a begépelt szövegből kiszámolni: ha elütsz
egy betűt, aztán kijavítod, a szöveg már hibátlan, de a hibát elkövetted. Ezért a leütéseket és a hibákat abban a
pillanatban számoljuk meg, amikor történnek, a `handleChange`-ben, és két új állapotban tartjuk: `keystrokes` és
`mistakes`. Az igazi gépelésmérők is így csinálják, különben bárki hanyagul gépelhetne, és utólag kijavíthatná.

Előbb a számolás. Írd ezeket az `src/stats.js` végére:

```js file=src/stats.js
// Hány karakter egyezik a szöveggel, helyről helyre összevetve.
export function countCorrect(typed, text) {
  let count = 0
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === text[i]) count++
  }
  return count
}

// Szó per perc: a szokásos szabály szerint minden 5 helyes karakter számít egy szónak.
export function wordsPerMinute(correctChars, ms) {
  if (ms < 1000) return 0
  return Math.round(correctChars / 5 / (ms / 60000))
}

// Pontosság százalékban: a leütések hány százaléka volt helyes. Az első leütés előtt 100.
export function accuracyPercent(keystrokes, mistakes) {
  if (keystrokes === 0) return 100
  return Math.round(((keystrokes - mistakes) / keystrokes) * 100)
}
```

A négy szám egy saját komponensbe kerül, az `src/components/Stats.jsx` fájlba. Az időhöz két prop tartozik: maga az idő
(`time`) és a felirata (`timeLabel`). Most a felirat mindig „Idő”, de a következő lépésben lesz egy visszaszámláló is.

```jsx file=src/components/Stats.jsx
import { formatTime } from '../stats.js'

// Az élő számok egy sorban: sebesség, pontosság, idő.
function Stats({ wpm, accuracy, cpm, time, timeLabel }) {
  return (
    <dl className="stats">
      <div>
        <dt>Szó/perc</dt>
        <dd>{wpm}</dd>
      </div>
      <div>
        <dt>Pontosság</dt>
        <dd>{accuracy}%</dd>
      </div>
      <div>
        <dt>Karakter/perc</dt>
        <dd>{cpm}</dd>
      </div>
      <div>
        <dt>{timeLabel}</dt>
        <dd>{formatTime(time)}</dd>
      </div>
    </dl>
  )
}

export default Stats
```

Az `App`-ban a `handleChange` megnézi, mi az új a szövegben: minden karaktert, ami a régi `typed` vége után jött. Ha a
`value` rövidebb (törlés történt), a ciklus egyszer sem fut le, és nem számolunk semmit. A karakter/perc mostantól szintén
csak a helyes karaktereket számolja. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=3,5,17-19,29-33,56-64,74-75,95,118
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import './App.css'

// Billentyűk, amelyek a láthatatlan mezőben odébb vinnék a kurzort: az mindig a szöveg végén marad.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

function App() {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // Az összes leütés és ebből a hibás leütések száma; a kijavított hiba is hiba marad.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)
  // Maga a szövegmező: rajta keresztül a kódból is bele tudjuk tenni a kurzort.
  const inputRef = useRef(null)

  const text = PASSAGES[index]
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length

  // Minden rajzoláskor újraszámolva: ezek mind az állapotból következnek.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát: tizedmásodpercenként frissül.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // Az utolsó karakter megállítja.
    if (value.length === text.length) {
      stopTimer()
    }
    // Minden új karakter egy leütés; ha nem egyezik a szöveggel, egy hiba is. A törlés nem számít.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    // A kurzor visszakerül a mezőbe: rögtön gépelhetsz.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: újrakezdés.
    if (event.key === 'Escape') restart()
    // Az Enter csak egy hibás karaktert írna, a nyilak pedig odébb vinnék a kurzort.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <Stats wpm={wpm} accuracy={accuracy} cpm={cpm} time={elapsed} timeLabel="Idő" />
      {/* A dobozra kattintva a láthatatlan mező kapja meg a kurzort. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Ide gépeld a szöveget"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Kattints a szövegre, és kezdj el gépelni. Esc: újrakezdés.</p>
      {done && (
        <p className="result" role="status">
          Kész! {wpm} szó/perc, {accuracy}%-os pontosság, {formatTime(elapsed)} alatt.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Újrakezdés
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Következő szöveg
        </button>
      </div>
    </main>
  )
}

export default App
```

A `handleChange` most négy állapotot állít be. Ahogy a `restart`-nál láttad, a React ezeket összegyűjti, és egyetlen
rajzolással teszi ki őket a képernyőre; ezt hívják [[kötegelésnek|kötegelés]] (angolul batching). Egy gépelésmérőben ez
sokat számít: egy gyors gépelő másodpercenként 6–8 billentyűt üt le, és mindegyik egyetlen rajzolás marad, nem négy.

:::check Ellenőrizd
Négy doboz áll a szöveg fölött: „Szó/perc”, „Pontosság 100%”, „Karakter/perc” és „Idő”. Üss el szándékosan egy betűt:
a pontosság leesik (például hat leütésből egy hiba: 83%). Javítsd ki ++Backspace++-szel: a betű újra jó, a pontosság viszont
100% alatt marad. Gépelés közben a szó/perc nagyjából a karakter/perc ötöde. A végén például: „Kész! 44 szó/perc,
96%-os pontosság, 0:52.3 alatt.”
:::

:::mistake Gyakori hiba
A hibákat a begépelt szövegből számolni: `const mistakes = typed.length - correct`. Ez egy származtatott érték, és
amint kijavítasz egy hibát, el is tűnik belőle. A végén szinte mindig 100%-os pontosság jönne ki, akármennyit javítottál
közben. A már megtörtént dolgokat (itt a leütéseket) csak akkor lehet megszámolni, amikor történnek.
:::

### Időre: 30 és 60 másodperc

Sok gépelésmérő nem egy szöveg végéig mér, hanem adott ideig: amit fél perc alatt begépelsz, az számít. Három mód lesz:
a teljes szöveg, 30 másodperc és 60 másodperc. A módok listája az `src/components/ModePicker.jsx` fájlba kerül, a
választó gombokkal együtt:

```jsx file=src/components/ModePicker.jsx
// A mérés módjai. A seconds: null azt jelenti, hogy nincs időkorlát.
export const MODES = [
  { id: 'passage', label: 'Teljes szöveg', seconds: null },
  { id: 'time30', label: '30 másodperc', seconds: 30 },
  { id: 'time60', label: '60 másodperc', seconds: 60 },
]

function ModePicker({ value, onChange }) {
  return (
    <div className="modes" role="group" aria-label="Mód">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          className="chip"
          aria-pressed={mode.id === value}
          onClick={() => onChange(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}

export default ModePicker
```

A fájlnak most egy alapértelmezett exportja (a komponens) és egy [[nevesített exportja|nevesített export]] (a `MODES`)
is van; egy sorban így töltöd be mindkettőt: `import ModePicker, { MODES } from …`. A gombok `aria-pressed`
attribútuma, ahogy a 13. leckében, megmondja a képernyőolvasóknak (és a CSS-nek), melyik van benyomva.

Az `App`-ban ez változik:

- Az időkorlát (`limit`) ezredmásodpercben van, vagy `null`, ha nincs. Időre sok szöveg kell, hogy a gyors gépelők se
  fogyjanak ki belőle: a `timedText` a választott szöveggel kezd, és utána fűzi a többit. A `slice(index)` az `index`-től
  a végéig, a `slice(0, index)` az elejétől az `index`-ig (azt már nem) adja a tömb elemeit; a két darabot a spread önti
  egyetlen tömbbe (`[...a, ...b]`), a `join(' ')` pedig szóközzel egy stringgé fűzi őket.
- A mérés akkor is kész, ha lejárt az idő.
- Az órának magától meg kell állnia, akkor is, ha épp nem gépelsz. Ezt csak az időzítő függvénye veheti észre: minden
  tizedmásodpercben megnézi, eltelt-e már a `limit`. Ezért az indítás saját függvényt kap: `startClock`.
- Az idő dobozában visszaszámlálás látszik („Hátralévő idő”), a módváltás pedig újrakezd.

Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=6,12-15,18,32-35,37,54-65,70,72,106-109,121-130
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import './App.css'

// Billentyűk, amelyek a láthatatlan mezőben odébb vinnék a kurzort: az mindig a szöveg végén marad.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// Időre sok szöveg kell: a választott szöveg, utána sorban az összes többi.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // Az összes leütés és ebből a hibás leütések száma; a kijavított hiba is hiba marad.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)
  // Maga a szövegmező: rajta keresztül a kódból is bele tudjuk tenni a kurzort.
  const inputRef = useRef(null)

  const mode = MODES.find((item) => item.id === modeId)
  // Az időkorlát ezredmásodpercben, vagy null, ha nincs.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Minden rajzoláskor újraszámolva: ezek mind az állapotból következnek.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // Időre mérve az óra magától megáll, amikor lejár az idő.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát, az utolsó megállítja.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Minden új karakter egy leütés; ha nem egyezik a szöveggel, egy hiba is. A törlés nem számít.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    // A kurzor visszakerül a mezőbe: rögtön gépelhetsz.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: újrakezdés.
    if (event.key === 'Escape') restart()
    // Az Enter csak egy hibás karaktert írna, a nyilak pedig odébb vinnék a kurzort.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Idő' : 'Hátralévő idő'}
      />
      {/* A dobozra kattintva a láthatatlan mező kapja meg a kurzort. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Ide gépeld a szöveget"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Kattints a szövegre, és kezdj el gépelni. Esc: újrakezdés.</p>
      {done && (
        <p className="result" role="status">
          Kész! {wpm} szó/perc, {accuracy}%-os pontosság, {formatTime(elapsed)} alatt.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Újrakezdés
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Következő szöveg
        </button>
      </div>
    </main>
  )
}

export default App
```

Az idő dobozában a [[Math.max]] a két szám közül a nagyobbat adja: a `Math.max(0, …)` sosem megy 0 alá. Ha egy leütés
épp a lejárat és az óra következő ketyegése közé esik, az eltelt idő egy pillanatra túllépi a korlátot, és enélkül
negatív hátralévő idő villanna fel.

Nézd meg alaposan a `startClock`-ot, mert itt jön ki igazán, mire jó a ref. Az időzítő függvénye az első leütéskor
születik, és onnantól ugyanaz a függvény fut tizedmásodpercenként. A 7. és a 13. leckéből tudod, hogy egy függvény
azokat a változókat látja, amelyek ott voltak, ahol létrejött: ez a [[closure]]. Ennek a függvénynek a szemében tehát a
`limit` örökre az marad, ami az első leütéskor volt. Itt ez rendben van, mert a mód csak újrakezdéssel változhat. A
`start` a saját paramétere, az sem változik.

És a `stopTimer`? Az is az első leütéskor látott változat, de ez nem baj: a `timerRef` minden rajzoláskor ugyanaz a
doboz, így a régi függvény is a dobozban lévő, legfrissebb azonosítót éri el. Egy állapotváltozóval ez nem működne: egy
régi függvény a régi értéket látná.

:::check Ellenőrizd
A statisztika fölött három gomb áll, a „Teljes szöveg” ki van emelve. Kattints a „30 másodperc”-re: az utolsó doboz
„Hátralévő idő 0:30.0”, a szöveg pedig hosszú lesz (mind a négy gyakorlószöveg egymás után). Az első betűvel elindul a
visszaszámlálás, és 0:00.0-nál a mérés magától véget ér, akkor is, ha épp nem gépelsz: a mező nem enged több betűt,
megjelenik a „Kész! … 0:30.0 alatt.” sáv. Ha mérés közben módot váltasz, minden elölről kezdődik.
:::

:::mistake Gyakori hiba
`const limit = mode.seconds * 1000`, a `null` vizsgálata nélkül. A JavaScriptben a `null * 1000` értéke 0, így a
„Teljes szöveg” módban 0 lesz az időkorlát, és mivel az eltelt idő (0) már eléri, a mérés el sem indul: a mező az első
pillanattól csak olvasható, és ott a „Kész!” sáv.
:::

:::try Próbáld ki
Adj hozzá egy negyedik, 15 másodperces módot: egyetlen új sor kell a `MODES` tömbbe. Az `App`-hoz hozzá sem kell
nyúlnod.
:::

### Kevesebb újrarajzolás: memo

Amíg jár az óra, a `setNow` tizedmásodpercenként új állapotot ad az `App`-nak, és a React minden alkalommal újrarajzolja
az `App`-ot, vele együtt pedig minden gyerekkomponensét is. A `Passage`-et is, ami időre mérve 849 `<span>`-ből áll, és
ugyanazt rajzolja, mint egy tizeddel korábban: a szöveg és a begépelt rész nem változott, csak az óra. Ez felesleges
munka. Egy gyors gépen nem érezni, de egy régi telefonon a gépelés akadozhat tőle.

Előbb tedd láthatóvá. Írd a `Passage` függvény első sorába (az `src/components/Passage.jsx`-ben):

```jsx file=src/components/Passage.jsx mark=2
function Passage({ text, typed }) {
  console.log('Passage rajzolás')
  return (
```

Nyisd meg a konzolt (++F12++ → Console), és kezdj el gépelni, aztán állj meg: a „Passage rajzolás” akkor is ömlik,
amikor nem nyúlsz semmihez, tizedmásodpercenként egyszer (fejlesztés közben kétszer, mert a [[StrictMode]] minden
rajzolást kétszer futtat le). A Chrome az egymás utáni egyforma üzeneteket egy sorba vonja össze, és mellé írja, hányszor
jött: ez a szám gyorsan nő.

A megoldás a [[memo]]. A `memo(Passage)` a `Passage` egy „emlékező” változatát adja: mielőtt újrarajzolná, a React
összeveti az új propokat a legutóbbiakkal, és ha mind egyforma, kihagyja a rajzolást, és a régi eredményt használja.
Cseréld le az `src/components/Passage.jsx` tartalmát:

```jsx file=src/components/Passage.jsx mark=1,25-26
import { memo } from 'react'

// A szöveg karakterenként: helyesen begépelt, elgépelt vagy még hátravan.
function Passage({ text, typed }) {
  console.log('Passage rajzolás')
  return (
    <p className="passage">
      {[...text].map((char, i) => {
        let state = 'todo'
        if (i < typed.length) {
          state = typed[i] === char ? 'ok' : 'bad'
        }
        // A kurzor a következő begépelendő karakter előtt villog.
        const current = i === typed.length ? ' is-current' : ''
        return (
          <span key={i} className={`char char--${state}${current}`}>
            {char}
          </span>
        )
      })}
    </p>
  )
}

// A memo csak akkor rajzolja újra, ha a text vagy a typed megváltozott: az óra ketyegése nem számít.
export default memo(Passage)
```

Az `App`-hoz nem kell nyúlni: ugyanúgy a fájl alapértelmezett exportját tölti be, ami most az emlékező változat. Az
`App` továbbra is tizedmásodpercenként rajzol, és a `Stats` is (benne változik az idő), de az kevés munka: pár szám.

Hogyan dönti el a React, hogy két prop egyforma? A számokat és a stringeket érték szerint veti össze: a `'The city'` és
egy másik `'The city'` egyforma. Az objektumokat, a tömböket és a függvényeket viszont aszerint, hogy **ugyanaz** a
példány-e: egy rajzolás közben újonnan készült tömb sosem egyezik a korábbival, akkor sem, ha ugyanaz van benne. A mi
két propunk string, így minden rendben. (Az időre mért szöveget a `timedText` minden rajzoláskor újra összefűzi, de az
eredmény ugyanaz a string, tehát egyforma.)

:::check Ellenőrizd
Gépelj, aztán állj meg: a konzolban a „Passage rajzolás” száma most csak akkor nő, amikor lenyomsz egy billentyűt, az
óra ketyegésére nem. A betűk ugyanúgy színeződnek, mint eddig. Ha mindent láttál, töröld a `console.log` sort. Ezzel kész
a középszint: commitold!
:::

:::mistake Gyakori hiba
Egy rajzolás közben készült tömb vagy objektum propként, például `<Passage chars={[...text]} typed={typed} />`. Ez minden
rajzoláskor új tömb, a `memo` sosem találja egyformának a régivel, és a `Passage` ugyanúgy tizedmásodpercenként
rajzol, mintha nem is lenne `memo`.
:::

:::concept És a useMemo meg a useCallback?
Ha egy `memo`-s komponensnek mégis objektumot, tömböt vagy függvényt kell kapnia, két hook segít, hogy ne legyen minden
rajzoláskor új. A `useMemo(() => [...text], [text])` csak akkor készít új tömböt, ha a `text` megváltozott; a
`useCallback(fn, [...])` ugyanezt teszi egy függvénnyel. Ebben az appban nincs rájuk szükség. Csak ott érdemes
használni őket, ahol egy mérés vagy egy `console.log` megmutatja, hogy felesleges rajzolás történik.
:::

## Haladó szint {level=3}

### Élő grafikon

Gépelés közben egy vonal mutassa, hogyan alakul a sebességed: másodpercenként egy pont, az addigi szó/perc. A pontok
egy új állapotba kerülnek: a `samples` tömb minden eleme egy-egy másodperc végén mért sebesség.

Ki veszi észre, hogy eltelt egy másodperc? Az időzítő függvénye, ami tizedmásodpercenként fut. Csakhogy ez a függvény
az első leütéskor született, és a closure miatt számára a `typed` örökre üres, a helyes karakterek száma örökre 0. A
[[frissítő függvény]] (`setSamples((list) => …)`) itt nem elég: az a legfrissebb `samples`-t adja, de nekünk egy másik
állapotból, a `typed`-ből számolt érték kell.

A megoldás megint egy ref. A `handleChange` minden leütésnél beleteszi a `correctRef` dobozba a legfrissebb helyes
karakterszámot, az időzítő függvénye pedig onnan olvassa ki. A doboz minden rajzolásnál ugyanaz, így a régi függvény is
mindig a legújabb számot látja. Ez a ref harmadik feladata ebben a leckében: híd az események és egy régi függvény
között.

Egy szabály tartozik hozzá: a refet ne a rajzolás közben (a komponens törzsében) olvasd vagy írd, csak eseménykezelőben,
effektben vagy időzítőben. A React ugyanis nem tudja, mikor változik a ref tartalma, így egy rajzolás, ami belőle
olvas, könnyen elavult dolgot mutatna. A grafikon ezért nem a refből rajzol, hanem a `samples` állapotból.

A grafikon [[SVG]], vagyis alakzatokból álló kép, amit közvetlenül a JSX-be írhatsz. A `viewBox="0 0 300 100"` egy 300
egység széles, 100 egység magas rajzlapot ad; a `<polyline>` pedig egy töröttvonal, amelynek a `points` attribútuma
`x,y` párokat sorol fel szóközzel elválasztva. Az SVG-ben az `y` lefelé nő, ezért egy nagy érték pontja a
`height - …` képlettel kerül feljebb. Hozd létre az `src/components/SpeedChart.jsx` fájlt:

```jsx file=src/components/SpeedChart.jsx
// Vonaldiagram SVG-ben: a values minden eleme egy pont, balról jobbra haladva.
function SpeedChart({ values, caption }) {
  // Egy vonalhoz legalább két pont kell.
  if (values.length < 2) return null

  const width = 300
  const height = 100
  const peak = Math.max(...values)
  // A diagram teteje a legnagyobb érték (de legalább 10, hogy egy lassú kezdés ne legyen égig érő).
  const top = Math.max(10, peak)
  const points = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - (value / top) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points} />
      </svg>
      <figcaption>
        {caption} · csúcs: {peak} szó/perc
      </figcaption>
    </figure>
  )
}

export default SpeedChart
```

- Az első pont a bal szélre (`x = 0`), az utolsó a jobb szélre (`x = 300`) kerül, a többi egyenletesen közéjük.
- A `Math.max(...values)` a tömb legnagyobb eleme: a spread a tömb elemeit egyenként adja át a `Math.max`-nak.
- A `preserveAspectRatio="none"` megengedi, hogy a rajzlap a panel teljes szélességére nyúljon; az `App.css` gondoskodik
  róla, hogy a vonal ettől ne vastagodjon meg.
- Az `aria-hidden` elrejti a képet a képernyőolvasók elől, a `<figcaption>` szövege viszont elmondja a lényeget.

Az `App`-ban a `samples` állapot és a `correctRef` jön, az időzítő minden új másodpercben hozzáad egy pontot, az
újrakezdés pedig mindkettőt kiüríti. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=7,28-29,34-35,68-70,96-97,107-108,176
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import './App.css'

// Billentyűk, amelyek a láthatatlan mezőben odébb vinnék a kurzort: az mindig a szöveg végén marad.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// Időre sok szöveg kell: a választott szöveg, utána sorban az összes többi.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // Az összes leütés és ebből a hibás leütések száma; a kijavított hiba is hiba marad.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // A sebesség (szó/perc) minden eltelt másodperc végén: ebből rajzolódik az élő grafikon.
  const [samples, setSamples] = useState([])
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)
  // Maga a szövegmező: rajta keresztül a kódból is bele tudjuk tenni a kurzort.
  const inputRef = useRef(null)
  // A legfrissebb helyes karakterszám, az óra függvényének: a correct változót ő nem látja frissen.
  const correctRef = useRef(0)

  const mode = MODES.find((item) => item.id === modeId)
  // Az időkorlát ezredmásodpercben, vagy null, ha nincs.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Minden rajzoláskor újraszámolva: ezek mind az állapotból következnek.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // Időre mérve az óra magától megáll, amikor lejár az idő.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      // Minden új másodpercben egy új pont a grafikonra: az addigi sebesség.
      const second = Math.floor(passed / 1000)
      setSamples((list) => (second > list.length ? [...list, wordsPerMinute(correctRef.current, passed)] : list))
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát, az utolsó megállítja.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Minden új karakter egy leütés; ha nem egyezik a szöveggel, egy hiba is. A törlés nem számít.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
    // A dobozba mindig a legfrissebb szám kerül: az óra függvénye innen olvas.
    correctRef.current = countCorrect(value, text)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    setSamples([])
    correctRef.current = 0
    // A kurzor visszakerül a mezőbe: rögtön gépelhetsz.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: újrakezdés.
    if (event.key === 'Escape') restart()
    // Az Enter csak egy hibás karaktert írna, a nyilak pedig odébb vinnék a kurzort.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Idő' : 'Hátralévő idő'}
      />
      {/* A dobozra kattintva a láthatatlan mező kapja meg a kurzort. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Ide gépeld a szöveget"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Kattints a szövegre, és kezdj el gépelni. Esc: újrakezdés.</p>
      {done && (
        <p className="result" role="status">
          Kész! {wpm} szó/perc, {accuracy}%-os pontosság, {formatTime(elapsed)} alatt.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Újrakezdés
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Következő szöveg
        </button>
      </div>
      <SpeedChart values={samples} caption="Sebesség másodpercenként" />
    </main>
  )
}

export default App
```

A `setSamples` egy frissítő függvényt kap. Ha a `second` (az eltelt egész másodpercek száma)
nagyobb, mint ahány pont már van, egy új pont kerül a lista végére; ha nem, a függvény ugyanazt a listát adja vissza.
Ilyenkor a React látja, hogy semmi sem változott, és emiatt nem is rajzol újra. Így a tizedmásodpercenként futó
időzítőből másodpercenként egy pont lesz.

:::check Ellenőrizd
Kezdj el gépelni: két másodperc múlva a gombok alatt megjelenik egy zöld vonal, és minden másodpercben egy ponttal
hosszabb lesz, alatta pedig: „Sebesség másodpercenként · csúcs: 52 szó/perc”. Ha megállsz egy kicsit, a vonal lejt
(az idő megy, a karakterek nem jönnek). A mérés végén a vonal megmarad, az ++Esc++ eltünteti.
:::

:::mistake Gyakori hiba
Az időzítőben a `correct` változót használni a ref helyett: `wordsPerMinute(correct, passed)`. A vonal ott marad a
grafikon alján, mert az időzítő függvénye az első leütéskor született, és számára a `correct` örökre 0. Ez a
closure-csapda; a ref a kiút belőle.
:::

:::try Próbáld ki
Mérj 30 másodpercre, és figyeld a vonal elejét: az első pár másodpercben nagyot ugrál, mert kevés karakterből és rövid
időből számol. Ezért írja ki a `charsPerMinute` és a `wordsPerMinute` az első másodpercben a 0-t.
:::

### Előzmények és fejlődés

Fejlődsz? Hogy ez kiderüljön, minden befejezett mérést el kell menteni, és meg kell mutatni őket egymás után. Az
eredményeknek túl kell élniük az oldal újratöltését, ezért a böngésző [[localStorage]]-ébe kerülnek. A 6., a 9. és a 13.
leckében írtál egy `useLocalStorage` hookot, ami úgy működik, mint a `useState`, de el is menti az értéket. Ha van
kéznél saját változatod, és ugyanígy `[érték, beállító]` párt ad vissza, használd azt. (Ha a te változatod a 10.
leckéből van, és a `storage` eseménnyel minden kulcsot átvesz a többi ablakból, most inkább hozd létre ezt a fájlt: a
verseny két ablakában különben nem lehetne két különböző név.) Ha nincs, hozd létre az `src/useLocalStorage.js`
fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Mint a useState, de az értéket a localStorage-be is elmenti, így túléli az oldal újratöltését.
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
      // Ha nem sikerül, nem baj: akkor csak erre a látogatásra emlékszünk.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

Mikor mentsünk? Amikor a mérés véget ér. De a vége két helyről jöhet: az utolsó leütésből (`handleChange`) vagy az
órából, amikor lejár az idő. Az óra függvénye ráadásul régi értékeket lát, abból nem lehet jó eredményt menteni. Van
viszont egy pont, ahol mindkét út találkozik: az a rajzolás, amelyikben a `done` igazzá válik. Ott minden szám friss.
Ezt egy effekt figyeli: ha a `done` igaz, elmenti az eredményt.

Az effekt függőségi tömbjébe minden bekerül, amit használ. A mérés vége után ezek már nem változnak (az óra áll, a mező
csak olvasható), de hogy biztosan ne legyen dupla mentés, a mentés [[idempotens]]: akárhányszor fut le, ugyanaz az
eredménye. Minden mérésnek saját kezdőideje van (`startedAt`), ez lesz az eredmény azonosítója (`at`); ha a lista már
tartalmazza, a frissítő függvény változatlanul visszaadja. A [[some]] megmondja, van-e a tömbben olyan elem, amelyre a
feltétel igaz. A `slice(0, 100)` a legújabb 100 eredményt tartja meg, hogy a lista ne nőjön a végtelenségig.

Az előzmények doboza az `src/components/History.jsx` fájlba kerül:

```jsx file=src/components/History.jsx
import SpeedChart from './SpeedChart.jsx'

const DATE_FORMAT = new Intl.DateTimeFormat('hu-HU', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// Az eddigi eredmények egy módban: a fejlődés grafikonon, alatta a legutóbbi öt mérés.
function History({ runs }) {
  // A runs elején a legújabb áll. A grafikon balról jobbra halad az időben, ezért megfordítjuk.
  const speeds = runs.map((run) => run.wpm).toReversed()

  return (
    <section className="panel">
      <h2>Előzmények</h2>
      {runs.length === 0 && <p className="empty">Ebben a módban még nincs mentett eredményed.</p>}
      <SpeedChart values={speeds} caption="A méréseid sorban" />
      <ol className="history">
        {runs.slice(0, 5).map((run) => (
          <li key={run.at}>
            <span>{DATE_FORMAT.format(run.at)}</span>
            <strong>{run.wpm} szó/perc</strong>
            <span>{run.accuracy}%</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default History
```

- Az [[Intl.DateTimeFormat]] a 11. leckéből ismerős: egy időbélyegből olvasható dátumot ír, például „nov. 23. 21:35”.
- A `toReversed()` a tömb megfordított másolatát adja, az eredetit nem bántja (mint a `toSorted` a rendezésnél).
- A fejlődés grafikonja ugyanaz a `SpeedChart`, amit az előző lépésben írtál, csak most minden pont egy mérés. Ezért
  érdemes volt külön komponensbe tenni.

Az `App`-ban jön az új állapot (`history`), a választott mód eredményei (`runs`, egy származtatott érték) és a mentő
effekt. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=4,9,32-33,53-54,61-70,194-196
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import useLocalStorage from './useLocalStorage.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import History from './components/History.jsx'
import './App.css'

// Billentyűk, amelyek a láthatatlan mezőben odébb vinnék a kurzort: az mindig a szöveg végén marad.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// Időre sok szöveg kell: a választott szöveg, utána sorban az összes többi.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // Az összes leütés és ebből a hibás leütések száma; a kijavított hiba is hiba marad.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // A sebesség (szó/perc) minden eltelt másodperc végén: ebből rajzolódik az élő grafikon.
  const [samples, setSamples] = useState([])
  // Az eddigi eredmények, a legújabb elöl: túlélik az újratöltést.
  const [history, setHistory] = useLocalStorage('typing-test-history', [])
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)
  // Maga a szövegmező: rajta keresztül a kódból is bele tudjuk tenni a kurzort.
  const inputRef = useRef(null)
  // A legfrissebb helyes karakterszám, az óra függvényének: a correct változót ő nem látja frissen.
  const correctRef = useRef(0)

  const mode = MODES.find((item) => item.id === modeId)
  // Az időkorlát ezredmásodpercben, vagy null, ha nincs.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Minden rajzoláskor újraszámolva: ezek mind az állapotból következnek.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)
  // Csak a választott mód eredményei.
  const runs = history.filter((run) => run.mode === modeId)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // Amikor a mérés véget ér (az utolsó karakterrel vagy az idő lejártával), az eredmény bekerül az előzményekbe.
  useEffect(() => {
    if (!done) return
    setHistory((list) => {
      // A startedAt minden mérésnél más: ha ez a mérés már a listában van, nem kerül be még egyszer.
      if (list.some((run) => run.at === startedAt)) return list
      const result = { at: startedAt, mode: modeId, wpm, accuracy, cpm }
      return [result, ...list].slice(0, 100)
    })
  }, [done, startedAt, modeId, wpm, accuracy, cpm, setHistory])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // Időre mérve az óra magától megáll, amikor lejár az idő.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      // Minden új másodpercben egy új pont a grafikonra: az addigi sebesség.
      const second = Math.floor(passed / 1000)
      setSamples((list) => (second > list.length ? [...list, wordsPerMinute(correctRef.current, passed)] : list))
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát, az utolsó megállítja.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Minden új karakter egy leütés; ha nem egyezik a szöveggel, egy hiba is. A törlés nem számít.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
    // A dobozba mindig a legfrissebb szám kerül: az óra függvénye innen olvas.
    correctRef.current = countCorrect(value, text)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    setSamples([])
    correctRef.current = 0
    // A kurzor visszakerül a mezőbe: rögtön gépelhetsz.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: újrakezdés.
    if (event.key === 'Escape') restart()
    // Az Enter csak egy hibás karaktert írna, a nyilak pedig odébb vinnék a kurzort.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Idő' : 'Hátralévő idő'}
      />
      {/* A dobozra kattintva a láthatatlan mező kapja meg a kurzort. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Ide gépeld a szöveget"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Kattints a szövegre, és kezdj el gépelni. Esc: újrakezdés.</p>
      {done && (
        <p className="result" role="status">
          Kész! {wpm} szó/perc, {accuracy}%-os pontosság, {formatTime(elapsed)} alatt.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Újrakezdés
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Következő szöveg
        </button>
      </div>
      <SpeedChart values={samples} caption="Sebesség másodpercenként" />
      <div className="boards">
        <History runs={runs} />
      </div>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Legalul egy szürke doboz jelenik meg „Előzmények” címmel: „Ebben a módban még nincs mentett eredményed.” Fejezz be egy
mérést: megjelenik az első sor a dátummal (például „nov. 23. 21:35”), a sebességgel („44 szó/perc”) és a pontossággal
(„96%”). Töltsd újra az oldalt (++F5++): az eredmény megmaradt. A második befejezett mérés után megjelenik a fejlődés
vonala is. Válts a „30 másodperc” módra: annak még üres az előzménylistája.
:::

:::mistake Gyakori hiba
A mentést a `handleChange`-be írni, oda, ahol az utolsó karakter megérkezik. A „Teljes szöveg” módban működik, de
időre mérve a mérés az órától ér véget, nem egy leütéstől, és azok az eredmények sosem kerülnek a listába.
:::

:::try Feladat
Írd ki a `History` címe alá, mennyi az utolsó öt mérés átlaga. A `runs.slice(0, 5)` megvan, a számok összeadásához
pedig egy `for … of` ciklus elég (vagy a `reduce`, ha már ismered).
:::

### Ranglista

Ha többen használjátok ugyanazt a gépet, legyen ranglista: a legjobb öt eredmény a választott módban, névvel. A név egy
új mezőbe kerül a módgombok mellé. Ezt is a `useLocalStorage` őrzi, így nem kell minden alkalommal újra beírni. Ha üres,
„Névtelen” lesz belőle (a `trim()` levágja a szóközöket a két végéről, és egy üres string hamisnak számít, így a `||`
jobb oldala jön).

A ranglista nem új állapot: az előzményekből számoljuk ki minden rajzoláskor. A [[toSorted]] a 9. és a 10. leckéből
ismerős: egy rendezett másolatot ad, az [[összehasonlító függvény]] pedig eldönti, melyik elem jöjjön előbb. A
`b.wpm - a.wpm` akkor negatív, ha a `b` a lassabb, így a gyorsabb kerül előre. Ha a két sebesség egyforma, a különbség
0, ami hamis, és a `||` a jobb oldalt adja: a pontosabb kerül előre. Hozd létre az `src/components/Leaderboard.jsx`
fájlt:

```jsx file=src/components/Leaderboard.jsx
const MEDALS = ['🥇', '🥈', '🥉']

// A legjobb öt eredmény egy módban: a gyorsabb előrébb áll, egyenlő sebességnél a pontosabb.
function Leaderboard({ runs, latest }) {
  const top = runs.toSorted((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).slice(0, 5)

  return (
    <section className="panel">
      <h2>Ranglista</h2>
      {top.length === 0 && <p className="empty">Az első eredményed rögtön az élre kerül.</p>}
      <ol className="leaderboard">
        {top.map((run, i) => (
          <li key={run.at} className={run.at === latest ? 'is-new' : ''}>
            <span>{MEDALS[i] ?? `${i + 1}.`}</span>
            <span className="leaderboard__name">{run.name ?? 'Névtelen'}</span>
            <strong>{run.wpm} szó/perc</strong>
            <span>{run.accuracy}%</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Leaderboard
```

- Az első három helyezett érmet kap. A `MEDALS[3]` már `undefined`, ilyenkor a `??` (a 13. leckéből ismert
  [[nullish coalescing]]) a jobb oldalt adja: „4.”, „5.”.
- Az előző lépésben mentett eredményeknek még nincs nevük; nekik is a `??` ad egyet.
- A `latest` a most befejezett mérés azonosítója. Az ő sora kiemelést kap (`is-new`), így látod, hová kerültél.

Az `App`-ban a névmező a `toolbar`-ba kerül, a név az eredménybe (és ezért a mentő effekt függőségei közé), a
`Leaderboard` pedig az előzmények mellé. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=10,33,35,55,70,73,155-164,208
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import useLocalStorage from './useLocalStorage.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import History from './components/History.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import './App.css'

// Billentyűk, amelyek a láthatatlan mezőben odébb vinnék a kurzort: az mindig a szöveg végén marad.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// Időre sok szöveg kell: a választott szöveg, utána sorban az összes többi.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // Az összes leütés és ebből a hibás leütések száma; a kijavított hiba is hiba marad.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // A sebesség (szó/perc) minden eltelt másodperc végén: ebből rajzolódik az élő grafikon.
  const [samples, setSamples] = useState([])
  // Az eddigi eredmények (a legújabb elöl) és a játékos neve: mindkettő túléli az újratöltést.
  const [history, setHistory] = useLocalStorage('typing-test-history', [])
  const [player, setPlayer] = useLocalStorage('typing-test-player', '')
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)
  // Maga a szövegmező: rajta keresztül a kódból is bele tudjuk tenni a kurzort.
  const inputRef = useRef(null)
  // A legfrissebb helyes karakterszám, az óra függvényének: a correct változót ő nem látja frissen.
  const correctRef = useRef(0)

  const mode = MODES.find((item) => item.id === modeId)
  // Az időkorlát ezredmásodpercben, vagy null, ha nincs.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Minden rajzoláskor újraszámolva: ezek mind az állapotból következnek.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)
  const playerName = player.trim() || 'Névtelen'
  // Csak a választott mód eredményei.
  const runs = history.filter((run) => run.mode === modeId)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // Amikor a mérés véget ér (az utolsó karakterrel vagy az idő lejártával), az eredmény bekerül az előzményekbe.
  useEffect(() => {
    if (!done) return
    setHistory((list) => {
      // A startedAt minden mérésnél más: ha ez a mérés már a listában van, nem kerül be még egyszer.
      if (list.some((run) => run.at === startedAt)) return list
      const result = { at: startedAt, mode: modeId, name: playerName, wpm, accuracy, cpm }
      return [result, ...list].slice(0, 100)
    })
  }, [done, startedAt, modeId, playerName, wpm, accuracy, cpm, setHistory])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // Időre mérve az óra magától megáll, amikor lejár az idő.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      // Minden új másodpercben egy új pont a grafikonra: az addigi sebesség.
      const second = Math.floor(passed / 1000)
      setSamples((list) => (second > list.length ? [...list, wordsPerMinute(correctRef.current, passed)] : list))
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát, az utolsó megállítja.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Minden új karakter egy leütés; ha nem egyezik a szöveggel, egy hiba is. A törlés nem számít.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
    // A dobozba mindig a legfrissebb szám kerül: az óra függvénye innen olvas.
    correctRef.current = countCorrect(value, text)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    setSamples([])
    correctRef.current = 0
    // A kurzor visszakerül a mezőbe: rögtön gépelhetsz.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: újrakezdés.
    if (event.key === 'Escape') restart()
    // Az Enter csak egy hibás karaktert írna, a nyilak pedig odébb vinnék a kurzort.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
        <label className="field">
          <span>A neved</span>
          <input
            type="text"
            value={player}
            placeholder="Névtelen"
            maxLength={20}
            onChange={(event) => setPlayer(event.target.value)}
          />
        </label>
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Idő' : 'Hátralévő idő'}
      />
      {/* A dobozra kattintva a láthatatlan mező kapja meg a kurzort. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Ide gépeld a szöveget"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Kattints a szövegre, és kezdj el gépelni. Esc: újrakezdés.</p>
      {done && (
        <p className="result" role="status">
          Kész! {wpm} szó/perc, {accuracy}%-os pontosság, {formatTime(elapsed)} alatt.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Újrakezdés
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Következő szöveg
        </button>
      </div>
      <SpeedChart values={samples} caption="Sebesség másodpercenként" />
      <div className="boards">
        <Leaderboard runs={runs} latest={done ? startedAt : null} />
        <History runs={runs} />
      </div>
    </main>
  )
}

export default App
```

Most derül ki, miért volt jó idempotensre írni a mentést. A név bekerült az effekt függőségei közé, így ha egy mérés
után átírod a neved, az effekt újra lefut, miközben a `done` még igaz. A `some` azonban látja, hogy ez a mérés már a
listában van, és nem lesz belőle második bejegyzés.

:::check Ellenőrizd
A módgombok mellett megjelenik „A neved” mező. Írd be a neved, és fejezz be egy mérést: az előzmények mellett ott a
„Ranglista”, az első helyen 🥇 és a neved, türkiz háttérrel, mert ez a mostani eredményed. Add át a gépet valakinek,
írja be a saját nevét, és próbálja meg: a lista sebesség szerint rendeződik. Ha mérés után átírod a neved, az
előzmények között nem jelenik meg dupla bejegyzés. Újratöltés után a neved ott marad a mezőben.
:::

:::mistake Gyakori hiba
Fordított összehasonlítás: `a.wpm - b.wpm`. Ekkor a lista növekvő sorrendbe kerül, és a leglassabb eredmény kapja az
aranyérmet. Csökkenő sorrendhez a `b` jön előre: `b.wpm - a.wpm`.
:::

:::concept Hogyan működik egy igazi ranglista?
Ez a ranglista csak ezen a gépen él, ebben a böngészőben. Egy igazi, mindenkinek közös ranglistához szerver kell,
ahová minden eredmény befut. És a szervernek ellenőriznie is kell őket: a `localStorage`-et bárki átírhatja a
böngészője fejlesztői eszközeiben, így egy „999 szó/perc” eredmény semmit sem bizonyít. Az igazi oldalak ezért gyakran
a leütések időpontjait is elküldik, és a szerver maga számolja újra a sebességet.
:::

### Verseny két ablak között

Végül versenyezzünk! Egy igazi többjátékos versenyhez szerver kellene, de két böngészőablak szerver nélkül is tud
beszélgetni. A 10. leckében, a közös lista „Hogyan csinálja egy igazi app?” dobozában már szóba került a böngésző
[[BroadcastChannel]]-je: egy névvel ellátott csatorna, amelyen az ugyanarról az oldalról nyitott ablakok üzenhetnek
egymásnak. A `new BroadcastChannel('typing-race')` megnyitja a
csatornát, a `postMessage(…)` egy üzenetet (például egy objektumot) küld rajta minden **más** ablaknak, amelyik
ugyanezt a csatornát nyitotta meg, az `onmessage` pedig akkor fut le, amikor üzenet érkezik; az üzenet az `event.data`.

A csatorna kezelése egy [[saját hookba|saját hook]] kerül, az `src/useRace.js` fájlba:

```js file=src/useRace.js
import { useEffect, useRef, useState } from 'react'

// Minden megnyitott ablak kap egy saját, véletlen azonosítót, például 'k3j9x2ab'.
const MY_ID = Math.random().toString(36).slice(2, 10)

// Verseny a böngészőablakok között: minden ablak elmondja a többinek, hol tart.
function useRace() {
  // A többi ablak legutóbbi üzenete, azonosító szerint: { k3j9x2ab: { id, name, progress, wpm }, … }
  const [rivals, setRivals] = useState({})
  // A csatorna maga. Ref, mert a send is eléri, de rajzolni nem kell tőle.
  const channelRef = useRef(null)

  useEffect(() => {
    const channel = new BroadcastChannel('typing-race')
    channelRef.current = channel
    channel.onmessage = (event) => {
      const message = event.data
      setRivals((current) => ({ ...current, [message.id]: message }))
    }
    // Takarítás: ha a komponens eltűnik, a csatorna bezárul.
    return () => channel.close()
  }, [])

  function send(update) {
    if (channelRef.current) {
      channelRef.current.postMessage({ id: MY_ID, ...update })
    }
  }

  return { rivals: Object.values(rivals), send }
}

export default useRace
```

- **Az azonosító.** Minden ablaknak tudnia kell, kitől jött egy üzenet. A `Math.random().toString(36)` egy véletlen
  számot 36-os számrendszerben ír ki, vagyis számjegyekkel és betűkkel (`'0.k3j9x2abq…'`), a `slice(2, 10)` pedig levágja
  az elejéről a `0.`-t, és nyolc karaktert tart meg.
- **A versenytársak.** A `rivals` egy objektum, amelyben minden másik ablak legutóbbi üzenete az ablak azonosítója
  alatt áll. Az új üzenet a 3. leckéből ismert spreaddel és a szögletes zárójeles kulccsal kerül bele: a régi bejegyzés
  helyére az új. Az `Object.values` a végén a bejegyzések tömbjét adja.
- **A ref negyedik feladata.** A csatorna egy objektum, amit az effekt hoz létre, a `send` pedig egy eseménykezelőből
  használja. A képernyőn nem jelenik meg, tehát nem állapot: a `channelRef` dobozba kerül. Fejlesztés közben a
  [[StrictMode]] a 2. leckéből ismert módon kétszer futtatja az effektet (megnyit, bezár, megint megnyit); a dobozba
  mindig a még nyitott csatorna kerül. A `send` azért nézi meg, van-e már csatorna, mert az első rajzolás pillanatában
  az effekt még nem futott le.

Most már két ablak használja ugyanazt a `localStorage`-et, és ebben egy csapda rejlik. Mindkettő ugyanazt a
`typing-test-history` kulcsot írja, de mindegyik a betöltéskor kapott saját másolatát őrzi az előzményekből. Ha
mindketten befejeztétek, az az ablak, amelyik utoljára ment, a saját listájával felülírja a másikét, és a másik
eredménye elvész. Az előzményeknek ezért át kell venniük, amit a másik ablak mentett, a `storage` eseménnyel, ahogy a 10.
leckében a bevásárlólista. A névnek viszont ablakonként külön kell maradnia: ha azt is átvennék, sosem lehetne két
különböző nevetek. Ezért a `useLocalStorage` kap egy harmadik paramétert, a `sync`-et. A `sync = false` egy
[[alapértelmezett paraméter]]: ha a hívás nem ad meg harmadik értéket, a `sync` értéke `false`, és a hook ugyanúgy
működik, mint eddig. Cseréld le az `src/useLocalStorage.js` tartalmát:

```js file=src/useLocalStorage.js mark=4,24-34
import { useEffect, useState } from 'react'

// Mint a useState, de az értéket a localStorage-be is elmenti, így túléli az oldal újratöltését.
function useLocalStorage(key, initialValue, sync = false) {
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
      // Ha nem sikerül, nem baj: akkor csak erre a látogatásra emlékszünk.
    }
  }, [key, value])

  // sync: ha egy másik ablak átírta ugyanezt a kulcsot, átvesszük az új értéket (mint a 10. leckében).
  useEffect(() => {
    if (!sync) return
    function handleStorage(event) {
      if (event.key !== key || event.newValue === null) return
      setValue(JSON.parse(event.newValue))
    }
    window.addEventListener('storage', handleStorage)
    // Takarítás: ha a komponens eltűnik, abbahagyjuk a figyelést.
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, sync])

  return [value, setValue]
}

export default useLocalStorage
```

A `sync` nélkül az új effekt már az első sorában visszatér: semmit sem figyel, és nincs mit eltakarítani.

A versenypálya az `src/components/RaceTrack.jsx` fájlba kerül. Minden játékos egy sávot kap, a sáv szélességét a
haladása adja, egy [[inline stílussal|inline stílus]] (a 7. leckéből ismerős): a `progress` 0 és 1 közötti szám, így a
`progress * 100` a százalék.

```jsx file=src/components/RaceTrack.jsx
// Egy sáv minden játékosnak: meddig jutott a szövegben, és milyen gyorsan.
function RaceTrack({ me, rivals }) {
  const players = [me, ...rivals]

  return (
    <section className="panel">
      <h2>Verseny</h2>
      <ul className="race__lanes">
        {players.map((player) => (
          <li key={player.id} className={player.id === me.id ? 'race__lane is-me' : 'race__lane'}>
            <span className="race__name">{player.name}</span>
            <span className="race__bar">
              <span style={{ width: `${Math.round(player.progress * 100)}%` }} />
            </span>
            <span>
              {player.progress === 1 ? '🏁 ' : ''}
              {player.wpm} szó/perc
            </span>
          </li>
        ))}
      </ul>
      {rivals.length === 0 && (
        <p className="race__hint">
          Nyisd meg ezt az oldalt egy második ablakban is, és gépelj ott is: itt látod, hol tart a másik.
        </p>
      )}
    </section>
  )
}

export default RaceTrack
```

Az `App` minden leütés után elküldi, hol tartasz: a nevedet, a haladásodat (a begépelt hossz osztva a szöveg
hosszával) és a sebességedet. A sebességhez a kezdőidő kell; az első leütésnél a `startedAt` még `null`, ilyenkor a `??`
a mostani időt adja. Az újrakezdés is szól a többieknek, hogy visszaálltál a rajthoz. Az előzmények harmadik
értékként `true`-t kapnak, így lépést tartanak a másik ablakkal; a név nem kap semmit, így a tiéd marad. Itt a teljes
`src/App.jsx`, a kész alkalmazás:

```jsx file=src/App.jsx mark=5,12,36,38,121-126,138,217
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import useLocalStorage from './useLocalStorage.js'
import useRace from './useRace.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import History from './components/History.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import RaceTrack from './components/RaceTrack.jsx'
import './App.css'

// Billentyűk, amelyek a láthatatlan mezőben odébb vinnék a kurzort: az mindig a szöveg végén marad.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// Időre sok szöveg kell: a választott szöveg, utána sorban az összes többi.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // Mikor volt az első leütés, és mennyi az idő most (ezredmásodpercben).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // Az összes leütés és ebből a hibás leütések száma; a kijavított hiba is hiba marad.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // A sebesség (szó/perc) minden eltelt másodperc végén: ebből rajzolódik az élő grafikon.
  const [samples, setSamples] = useState([])
  // Az eddigi eredmények (a legújabb elöl) és a játékos neve: mindkettő túléli az újratöltést.
  const [history, setHistory] = useLocalStorage('typing-test-history', [], true)
  const [player, setPlayer] = useLocalStorage('typing-test-player', '')
  const { rivals, send } = useRace()
  // A futó időzítő azonosítója. Ref: megmarad a rajzolások között, de a változása nem rajzol újra.
  const timerRef = useRef(null)
  // Maga a szövegmező: rajta keresztül a kódból is bele tudjuk tenni a kurzort.
  const inputRef = useRef(null)
  // A legfrissebb helyes karakterszám, az óra függvényének: a correct változót ő nem látja frissen.
  const correctRef = useRef(0)

  const mode = MODES.find((item) => item.id === modeId)
  // Az időkorlát ezredmásodpercben, vagy null, ha nincs.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Minden rajzoláskor újraszámolva: ezek mind az állapotból következnek.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)
  const playerName = player.trim() || 'Névtelen'
  // Csak a választott mód eredményei.
  const runs = history.filter((run) => run.mode === modeId)

  // Ha a komponens eltűnik, miközben jár az óra, az időzítő is leáll.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // Amikor a mérés véget ér (az utolsó karakterrel vagy az idő lejártával), az eredmény bekerül az előzményekbe.
  useEffect(() => {
    if (!done) return
    setHistory((list) => {
      // A startedAt minden mérésnél más: ha ez a mérés már a listában van, nem kerül be még egyszer.
      if (list.some((run) => run.at === startedAt)) return list
      const result = { at: startedAt, mode: modeId, name: playerName, wpm, accuracy, cpm }
      return [result, ...list].slice(0, 100)
    })
  }, [done, startedAt, modeId, playerName, wpm, accuracy, cpm, setHistory])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // Időre mérve az óra magától megáll, amikor lejár az idő.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      // Minden új másodpercben egy új pont a grafikonra: az addigi sebesség.
      const second = Math.floor(passed / 1000)
      setSamples((list) => (second > list.length ? [...list, wordsPerMinute(correctRef.current, passed)] : list))
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // Az első karakter elindítja az órát, az utolsó megállítja.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Minden új karakter egy leütés; ha nem egyezik a szöveggel, egy hiba is. A törlés nem számít.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
    // A dobozba mindig a legfrissebb szám kerül: az óra függvénye innen olvas.
    correctRef.current = countCorrect(value, text)
    // A többi ablak is lássa, hol tartasz.
    send({
      name: playerName,
      progress: value.length / text.length,
      wpm: wordsPerMinute(correctRef.current, time - (startedAt ?? time)),
    })
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    setSamples([])
    correctRef.current = 0
    send({ name: playerName, progress: 0, wpm: 0 })
    // A kurzor visszakerül a mezőbe: rögtön gépelhetsz.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: újrakezdés.
    if (event.key === 'Escape') restart()
    // Az Enter csak egy hibás karaktert írna, a nyilak pedig odébb vinnék a kurzort.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
        <label className="field">
          <span>A neved</span>
          <input
            type="text"
            value={player}
            placeholder="Névtelen"
            maxLength={20}
            onChange={(event) => setPlayer(event.target.value)}
          />
        </label>
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Idő' : 'Hátralévő idő'}
      />
      {/* A dobozra kattintva a láthatatlan mező kapja meg a kurzort. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Ide gépeld a szöveget"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Kattints a szövegre, és kezdj el gépelni. Esc: újrakezdés.</p>
      {done && (
        <p className="result" role="status">
          Kész! {wpm} szó/perc, {accuracy}%-os pontosság, {formatTime(elapsed)} alatt.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Újrakezdés
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Következő szöveg
        </button>
      </div>
      <SpeedChart values={samples} caption="Sebesség másodpercenként" />
      <RaceTrack me={{ id: 'me', name: playerName, progress: typed.length / text.length, wpm }} rivals={rivals} />
      <div className="boards">
        <Leaderboard runs={runs} latest={done ? startedAt : null} />
        <History runs={runs} />
      </div>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A gombok alatt megjelenik a „Verseny” doboz egyetlen sávval, a tiéddel, alatta a tipp, hogy nyiss egy második
ablakot. Nyisd meg ugyanazt a címet egy új ablakban (ugyanabban a böngészőben), és tedd a kettőt egymás mellé. Adj meg
két különböző nevet. Gépelj az egyikben: a másikban megjelenik egy második sáv a másik névvel, és együtt halad a
gépeléssel, mellette a sebesség. Aki a szöveg végére ér, 🏁 zászlót kap. Ha az egyik ablakban ++Esc++-et nyomsz, a
másikban a sávja visszaugrik a rajthoz. Ha mindketten befejeztétek, mindkét eredmény ott van az előzmények
között, mindkét ablakban.

Ha újratöltesz egy ablakot, új azonosítót kap: a régi sávja megdermedve ott marad a másik ablakban, amíg azt is újra nem
töltöd. A nevet is ugyanazon a kulcson menti a két ablak, ezért egy újratöltött ablakban az a név áll, amelyiket
bármelyikben utoljára beírtad; ilyenkor írd be újra a sajátodat. Gratulálok, kész a gépelési sebességmérőd!
:::

:::mistake Gyakori hiba
A csatornát a komponens törzsében létrehozni, effekt nélkül: `const channel = new BroadcastChannel('typing-race')`.
Ekkor minden rajzolás egy újabb csatornát nyit meg (amíg jár az óra, tizedmásodpercenként egyet), és egyiket sem zárja
be soha. Pár perc után ezrével lógnak nyitva, és a böngésző minden üzenetet mindegyiknek kézbesít. Aminek csak egyszer
szabad létrejönnie, és a végén el kell takarítani, annak az effektben a helye.
:::

:::try Feladat
Tisztességes rajt: legyen egy „Rajt!” gomb, ami egy `{ type: 'start' }` üzenetet küld. Amelyik ablak ilyet kap (és
amelyikben megnyomták), az újrakezd, így mindketten tiszta lappal indultok. Ehhez a `useRace`-nek külön kell kezelnie a
`type: 'start'` üzeneteket: például egy `onStart` függvényt kaphat paraméterként, amit ilyenkor meghív. Vigyázz, ez
megint a closure-csapda: az üzenetkezelő az első rajzoláskor születik, így az ott látott `onStart` az első rajzolás
`restart`-ja maradna, a régi névvel. Tedd egy refbe, ahogy a `correctRef`-et: `const onStartRef = useRef(onStart)`,
egy függőségi tömb nélküli effektben frissítsd (`onStartRef.current = onStart`), az üzenetkezelő pedig az
`onStartRef.current()`-et hívja, és utána `return`, hogy a rajtjel ne kerüljön a versenytársak közé.
:::
