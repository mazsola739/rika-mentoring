# Mit építünk?

Egy szókitaláló játékot: a gép gondol egy ötbetűs angol szóra, neked pedig hat tippből kell kitalálnod. Minden tipp
után kiszíneződnek a betűk: a zöld jó helyen van, a sárga benne van a szóban, csak máshol, a szürke pedig egyáltalán
nincs benne. Közben megtanulod, hogyan figyeli egy React-alkalmazás a billentyűzetet az egész ablakban, hogyan rajzolunk
ki egy rácsot az állapotból, hogyan írunk le pontosan egy játékszabályt (a dupla betűk a legtrükkösebbek!), és hogyan kel
életre a rács CSS-animációkkal.

:::levels
- Ötbetűs szó kitalálása hat tippből, színes visszajelzéssel és „Új játék” gombbal. | kb. 2 óra
- Képernyő-billentyűzet a betűk színével, ellenőrzés a szólistán és animációk. | kb. 3 óra
- Napi szó (mindenkinek ugyanaz), statisztika és sorozat, színes négyzetekből álló megosztható eredmény, magyar szólista. | kb. 3 óra
:::

**Előismeret:** az előző leckék. Leginkább ezekre építünk: a 3. lecke (`Set`, `setTimeout` takarítással, a vágólap),
a 7. lecke (billentyűfigyelés az egész ablakon, frissítő függvény), a 9. lecke (`useLocalStorage`), a 13. lecke
(CSS-animációk, újrakezdés `key`-vel) és a 16–18. lecke (`useRef`). Ahol egy ismerős dolgot új módon használunk, ott
újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/19-wordle/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Az 1. lecke részletesen elmagyarázza, hogyan jutsz hozzá; itt
csak röviden. Nyiss egy terminált a munkamappádban, ahol a korábbi leckékből a `rika-mentoring` repó van, hozd le az új
leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját `word-guess` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/19-wordle/exercise word-guess
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/19-wordle/exercise` mappát a munkamappádba, `word-guess` néven. A másolatodban dolgozol: a
repó érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `word-guess` mappát a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„Word Guess” címmel. Más még nincs rajta: a játékot te építed meg.
:::

A szervert hagyd futni. Egy második terminálban, a `word-guess` mappában csinálj a másolatodból git-repót egyetlen
committal, a kezdőállapottal:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni.

A kiinduló projektben négy fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a lecke stílusai, készen (a rács, a mezők színei, a billentyűzet, az üzenetek, az eredmény és a
  statisztika). Ezeket nem kell megírnod, csak a lépésekben megadott osztályneveket (`board`, `row`, `tile`, …)
  használod. Kivétel az animáció: azt a középszinten te írod meg, egy saját CSS-fájlban.
- `src/words.js`: az angol szólisták. Az `ANSWERS` a titkos szavak listája (179 közismert szó), az `EXTRA_GUESSES`
  pedig több mint kétezer további szó, amit tippelni lehet, de sosem lesz titkos szó.
- `src/wordsHu.js`: a magyar szólisták a haladó szint utolsó lépéséhez.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a „Word Guess” cím angolul vannak;
a címet nyugodtan írd át „Szókitaláló”-ra. A játék az első két szinten angol szavakkal megy, a magyar szólista a
legvégén érkezik.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza. Kívülről [[props]]-okat kap, emlékezni pedig a [[useState]]
segítségével tud: ha egy állapotérték megváltozik, a React újrarajzolja a komponenst. A rajzoláson kívüli munka, például egy
időzítő vagy egy eseményfigyelő, a [[useEffect]]-be kerül, és amit az effekt elindít, azt a
[[takarító függvénye|takarító függvény]] leállítja. Tömböt és objektumot az állapotban sosem írunk át helyben: mindig
újat adunk a setternek. A lépések röviden emlékeztetnek ezekre.
:::

### A rács

Egy ilyen játék szíve a rács: hat sor, soronként öt mező. Az első sorokban az eddigi tippek állnak, a következőben az,
amit éppen gépelsz, a többi üres.

Mit tároljunk ebből az állapotban? Csábító lenne egy 6 × 5-ös táblázat, de felesleges: a rács minden mezője
kiszámolható két dologból, az eddigi tippek listájából (`['CRANE', 'PILOT']`) és a félig begépelt szóból (`'HO'`). Ha
csak ezt a kettőt tároljuk, a rács sosem mutathat mást, mint ami igaz. Ez az [[egyetlen igazságforrás]] elve (a 13.
leckében így döntöttünk a felfordított kártyákról is), a rács pedig [[származtatott érték]]: minden rajzoláskor ebből
a kettőből készül.

Előbb a játék két alapszabálya. Ezeknek semmi közük a Reacthez, ezért külön fájlba kerülnek. Hozd létre az `src`
mappában a `game.js` fájlt:

```js file=src/game.js
// A játék szabályai két számban.
export const WORD_LENGTH = 5
export const MAX_TRIES = 6
```

Mindkettő [[nevesített export]], ahogy a 3. leckében a `generatePassword`: kapcsos zárójelben, név szerint töltjük be
őket. Ha később más hosszúságú szavakkal vagy több tippel játszanál, csak itt kell átírni.

Most jöhet a rács. Hozz létre az `src` mappában egy `components` mappát, benne egy `Board.jsx` fájlt:

```jsx file=src/components/Board.jsx
import { MAX_TRIES, WORD_LENGTH } from '../game.js'

// A rács egy sora: öt mező. A letters egy szöveg, például 'CRANE' vagy 'HO'.
function Row({ letters }) {
  return (
    <div className="row">
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = letters[i]
        return (
          <div key={i} className={letter ? 'tile is-filled' : 'tile'}>
            {letter}
          </div>
        )
      })}
    </div>
  )
}

// Az egész rács, az eddigi tippekből és a begépelés alatt álló szóból.
function Board({ guesses, current }) {
  return (
    <div className="board">
      {Array.from({ length: MAX_TRIES }, (_, row) => {
        if (row < guesses.length) return <Row key={row} letters={guesses[row]} />
        if (row === guesses.length) return <Row key={row} letters={current} />
        return <Row key={row} letters="" />
      })}
    </div>
  )
}

export default Board
```

- Egy fájlban több komponens is lehet. A `Row`-t csak a `Board` használja, ezért nem exportáljuk: kívülről csak a
  `Board` látszik. A fájl a `components` mappában van, ezért a `'../game.js'` előbb egy mappával feljebb lép (`..`).
- Az [[Array.from]] megadott hosszúságú tömböt készít. Az első paramétere megmondja, mekkorát (`{ length: 5 }`), a
  második egy függvény, ami minden helyre megkapja a hely sorszámát (`i`), és amit visszaad, az kerül oda. A függvény
  első paramétere (a hely eddigi, üres tartalma) nem kell nekünk; az ilyet szokás `_`-nak nevezni. Így az
  `Array.from({ length: 5 }, (_, i) => …)` öt JSX-elemet ad, a React pedig kirajzolja őket, ahogy egy `map`
  eredményét. Minden elem kap [[key]]-t: egy rögzített rácsban a hely sorszáma tökéletesen megfelel.
- A `letters[i]` a szöveg `i`-edik betűje, ahogy a 3. leckében a `CHARS[5]`. Ha a szó rövidebb (a `'HO'`-nak nincs
  harmadik betűje), az érték `undefined`: a feltétel hamis, a mező sima `tile` marad, a `{letter}` pedig nem rajzol
  semmit.
- A `Board` soronként dönt: ha a sor száma kisebb, mint a tippeké, ott egy elküldött tipp áll; ha pont annyi, ott a
  begépelés alatt álló szó; utána üres sorok jönnek. Az `if` utáni `return` rögtön kilép a függvényből, ezért nincs
  szükség `else`-re.

Végül az `App` kirajzolja a rácsot, egyelőre kitalált adatokkal. Cseréld le az `src/App.jsx` tartalmát erre:

```jsx file=src/App.jsx mark=1,5-7,12
import Board from './components/Board.jsx'
import './App.css'

function App() {
  // Egyelőre mintaadat: két elküldött tipp és egy félig begépelt harmadik.
  const guesses = ['CRANE', 'PILOT']
  const current = 'HO'

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Board guesses={guesses} current={current} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A cím alatt egy rács látszik: hat sor, soronként öt négyzet. Az első sorban a CRANE, a másodikban a PILOT betűi állnak,
a harmadikban a H és az O, a többi négyzet üres. A betűs mezőknek sötétebb a kerete.
:::

:::mistake Gyakori hiba
`Array(6).map(…)` az `Array.from` helyett. Az `Array(6)` hat üres hellyel jön létre, a `map` pedig az üres helyeket
egyszerűen átugorja: a rács helyén nem jelenik meg semmi. Az `Array.from({ length: 6 }, …)` minden helyre lefuttatja a
függvényt.
:::

:::try Próbáld ki
Írd át a `game.js`-ben a `MAX_TRIES`-t 8-ra: a rács nyolcsoros lesz, pedig máshoz hozzá sem nyúltál. Utána állítsd
vissza 6-ra.
:::

### Gépelés a billentyűzeten

A begépelés alatt álló szó állapot lesz, hiszen minden leütéskor változik. De ki figyelje a billentyűzetet? Itt nincs
szövegmező, amibe a [[fókusz]] kerülhetne: a játékos egyszerűen elkezd gépelni. Ezért, ahogy a 7. lecke szóköze, most
is az egész ablak figyel: `window.addEventListener('keydown', …)`. Az ablak kívül esik a React világán, ezért egy
effekt teszi fel a figyelőt, és a takarító függvénye veszi le.

A 7. leckében az `event.code`-ot néztük, a billentyű helyét. Most magára a betűre van szükségünk, ezért az `event.key`
kell: a magyar billentyűzeten például a Z ott van, ahol az angolon az Y, nekünk pedig az a betű számít, ami a
billentyűn áll.

Előbb írd a `game.js` végére, milyen betűket fogad el a játék:

```js file=src/game.js
// Ezeket a betűket lehet begépelni.
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
```

A begépelt szó állapotba kerül, a figyelő pedig egy effektbe. Cseréld le az `src/App.jsx` tartalmát erre:

```jsx file=src/App.jsx mark=1-2,7-8,10-14,16-19,21-26,28-30
import { useEffect, useState } from 'react'
import { LETTERS, WORD_LENGTH } from './game.js'
import Board from './components/Board.jsx'
import './App.css'

function App() {
  const guesses = ['CRANE', 'PILOT'] // még mindig mintaadat
  const [current, setCurrent] = useState('')

  // Az egész ablak figyeli a billentyűzetet. A figyelő egyszer kerül fel, a takarítás leveszi.
  useEffect(() => {
    function handleKeyDown(event) {
      // A Ctrl + R, a Ctrl + C és társaik maradjanak a böngészőé.
      if (event.ctrlKey || event.metaKey || event.altKey) return

      if (event.key === 'Backspace') {
        setCurrent((text) => text.slice(0, -1))
        return
      }

      const letter = event.key.toUpperCase()
      if (letter.length === 1 && LETTERS.includes(letter)) {
        // Legfeljebb öt betű: a hatodikat nem vesszük figyelembe.
        setCurrent((text) => (text.length < WORD_LENGTH ? text + letter : text))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Board guesses={guesses} current={current} />
    </main>
  )
}

export default App
```

Sorról sorra:

- Az `event.ctrlKey`, az `event.metaKey` (Macen a ++Cmd++) és az `event.altKey` akkor igaz, ha a billentyűvel együtt
  egy módosítóbillentyűt is nyomva tartasz. Ilyenkor a felhasználó a böngészőnek ad parancsot (a ++Ctrl++ + ++R++
  újratölt), nem tippel, ezért a függvény rögtön visszatér.
- A `text.slice(0, -1)` a törlés. A [[slice]] a 13. leckében egy tömbből vágott ki egy darabot, és szövegen ugyanígy
  működik. A `-1` hátulról számol: a 0. helytől az utolsó előtti betűig, vagyis az utolsó nélkül.
- Az `event.key` a lenyomott billentyű jelentése (`'a'`, `'Enter'`, `'Shift'`…), a `toUpperCase()` pedig nagybetűssé
  alakítja. Hogy betű-e, azt két feltétel dönti el: egy karakter hosszú-e (a `'SHIFT'` öt), és benne van-e a
  `LETTERS`-ben. Szövegen az [[includes]] azt nézi, előfordul-e benne a keresett darab, ezért kell az első feltétel
  is: a `LETTERS.includes('ABC')` is igaz lenne.
- A `setCurrent` [[frissítő függvényt|frissítő függvény]] kap, mint a 7. lecke szóközfigyelője. A figyelő az első
  rajzolás után készül, és mivel a [[függőségi tömb]] üres (`[]`), sosem cserélődik le. Egy függvény azokat a
  változókat látja, amelyek ott voltak, ahol létrejött ([[closure]]), így ha a `current`-et olvasná, örökre az első
  rajzolás üres szövegét látná. A frissítő függvény viszont mindig a friss értéket kapja a Reacttől (ez a `text`).
- A `text.length < WORD_LENGTH ? text + letter : text` a 3. leckéből ismert [[ternáris operátor]]: ha még nincs öt
  betű, hozzáfűzzük az újat, ha van, minden marad.

:::check Ellenőrizd
Kattints az oldalra, és gépelj: a betűk nagybetűvel jelennek meg a harmadik sorban. Ötnél több nem fér el, a
++Backspace++ pedig hátulról törli őket. A számok, a szóköz és a ++Shift++ nem csinálnak semmit, a ++Ctrl++ + ++R++
pedig továbbra is újratölti az oldalt.
:::

:::mistake Gyakori hiba
Elmarad a takarító függvény (`return () => window.removeEventListener(…)`). Fejlesztés közben minden betű duplán
jelenik meg: `HH`, `EE`. A [[StrictMode]] (a `main.jsx`-ben) fejlesztéskor kétszer futtatja le az effektet, hogy az
ilyen hibák kiderüljenek, és takarítás nélkül két figyelő marad az ablakon. Élesben ugyanez történne, ha a komponens
eltűnne, majd újra megjelenne.
:::

:::try Próbáld ki
Írd a `handleKeyDown` elejére: `console.log(event.key)`, és nyomkodj meg néhány billentyűt (++F12++ → Console).
Milyen nevet kap a ++Shift++, a nyilak és a szóköz? (A szóköz neve egyetlen szóköz, `' '`, ezért a sora a konzolban
üresnek látszik.) Utána töröld ki a sort.
:::

### Tipp elküldése

Az ++Enter++ küldi el a tippet: a begépelt szó a tippek listájának végére kerül, a következő sor pedig üresen indul.
Ehhez a tippek is állapotba kerülnek, üres listával; a mintaadat mehet.

Csakhogy az ++Enter++-nek egyszerre két állapotra van szüksége: tudnia kell, mi a `current`, és mi van eddig a
`guesses`-ben. A frissítő függvény egyszerre csak egy állapot friss értékét adja, ezért a [[closure]] gondját most
másképp oldjuk meg: a figyelő közvetlenül olvassa az állapotot, a [[függőségi tömbbe|függőségi tömb]] pedig beírjuk,
mit olvas: `[current, guesses]`. Így minden olyan rajzolás után, amikor ezek közül valamelyik megváltozott, a React előbb
lefuttatja a takarítást (leveszi a régi figyelőt), aztán újra az effektet (feltesz egy újat, ami már az új értékeket
látja). Az ablakon tehát mindig pontosan egy figyelő van, és mindig a legfrissebb. Cseréld le az `src/App.jsx`
tartalmát erre:

```jsx file=src/App.jsx mark=7,10,15-22,25,30-31,37
import { useEffect, useState } from 'react'
import { LETTERS, WORD_LENGTH } from './game.js'
import Board from './components/Board.jsx'
import './App.css'

function App() {
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')

  // A figyelő most a current-et és a guesses-t is olvassa, ezért lecseréljük, valahányszor megváltoznak.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return

      if (event.key === 'Enter') {
        // Csak teli sort lehet elküldeni: a szó a tippek végére kerül, a következő sor üresen indul.
        if (current.length === WORD_LENGTH) {
          setGuesses([...guesses, current])
          setCurrent('')
        }
        return
      }

      if (event.key === 'Backspace') {
        setCurrent(current.slice(0, -1))
        return
      }

      const letter = event.key.toUpperCase()
      if (letter.length === 1 && LETTERS.includes(letter) && current.length < WORD_LENGTH) {
        setCurrent(current + letter)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current, guesses])

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Board guesses={guesses} current={current} />
    </main>
  )
}

export default App
```

- A `[...guesses, current]` a [[spread]]: új tömb, benne a régi tippek, a végén az új. A régit nem írjuk át: a
  `guesses.push(current)` helyben változtatna, és a React nem venné észre.
- Mivel a figyelő most mindig friss értékeket lát, a frissítő függvények sem kellenek már: a `current.slice(0, -1)` és
  a `current + letter` is elég.

:::check Ellenőrizd
A rács üresen indul. Gépelj be öt betűt, és nyomd meg az ++Enter++-t: a szó a helyén marad, a gépelés pedig a
következő sorban folytatódik. Négy betűvel az ++Enter++ nem csinál semmit. Hat tipp után megtelik a rács; hogy utána
mi legyen, azt az 5. lépés dönti el.
:::

:::mistake Gyakori hiba
A függőségi tömb üres marad: `[]`. Ekkor a figyelő örökre az első rajzolás értékeit látja, neki a `current` mindig
`''`. A sorban mindig csak az utoljára leütött betű látszik (`'' + letter`), az ++Enter++ pedig sosem küld el semmit,
mert szerinte nincs meg az öt betű.
:::

:::try Próbáld ki
Írj az effekt elejére egy `console.log('új figyelő')` sort, és gépelj: minden betű után új figyelő kerül fel (a régit
előtte a takarítás leveszi). A középszinten ezt egy `useRef` segítségével egyetlen figyelőre cseréljük.
:::

### Színek

Kell egy titkos szó, és kell egy szabály, ami megmondja, mennyit ér egy tipp. A titkos szót a `words.js` `ANSWERS`
listájából sorsoljuk, a 3. leckéből ismert [[Math.random]] és [[Math.floor]] segítségével.

A szabály első ránézésre egyszerű: ha a betű ott áll, ahol a titkos szóban, zöld; ha máshol van benne, sárga; ha
egyáltalán nincs benne, szürke. A dupla betűk miatt azonban óvatosnak kell lenni. Legyen a titkos szó PIANO, a tipp
pedig PAPER. Az első P zöld, az A sárga. És a második P? A PIANO-ban csak egy P van, és azt már megtalálta az első: a
második P-nek szürkének kell lennie, különben a játékos azt hinné, hogy van még egy P a szóban.

Ezért két körben dolgozunk. Az első körben csak a zöldeket keressük, és közben feljegyezzük, hogy a titkos szó melyik
betűi maradtak szabadon (azok, amelyeket egyetlen zöld sem talált el). A második körben egy rossz helyen álló betű csak
akkor sárga, ha a szabad betűk között van még belőle, és akkor egyet el is használ. Az ilyen pontos, lépésenkénti
eljárás neve [[algoritmus]]. Cseréld le az egész `src/game.js`-t erre:

```js file=src/game.js mark=1,10-12,15-20,22-28,32-36,40
import { ANSWERS } from './words.js'

// A játék szabályai két számban.
export const WORD_LENGTH = 5
export const MAX_TRIES = 6

// Ezeket a betűket lehet begépelni.
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Egy véletlen titkos szó a listából.
export function randomWord() {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
}

// Mennyit ér egy tipp, betűnként: 'correct' (jó betű, jó helyen),
// 'present' (benne van a szóban, de máshol) vagy 'absent' (nincs a szóban).
export function evaluate(guess, answer) {
  const result = []
  // A titkos szó szabadon maradt betűi és a darabszámuk, például { I: 1, A: 1 }.
  const left = {}

  // Első kör: a zöldek. A titkos szó el nem talált betűi a left-be kerülnek.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
    } else {
      result[i] = 'absent'
      left[answer[i]] = (left[answer[i]] ?? 0) + 1
    }
  }

  // Második kör: a rossz helyen álló betű csak akkor sárga, ha van még belőle szabadon.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'absent' && left[guess[i]] > 0) {
      result[i] = 'present'
      left[guess[i]] -= 1
    }
  }

  return result
}
```

- A `left` egy [[objektum]], amit számlálónak használunk: a kulcsai betűk, az értékei darabszámok. A
  `left[answer[i]] ?? 0` a 13. leckéből ismert [[nullish coalescing]]: amikor egy betű először kerül sorra, még nincs
  értéke (`undefined`), és ilyenkor 0-val számolunk. Így a `(… ?? 0) + 1` az első alkalommal 1 lesz, a másodikkal 2.
- A második körben a `left[guess[i]] > 0` akkor is jól működik, ha a betű nincs a `left`-ben: az `undefined > 0`
  hamis.
- Nézzük végig a PIANO és a PAPER példáját! Az első körben a P zöld, a többi hely szürke lesz, a `left` pedig
  `{ I: 1, A: 1, N: 1, O: 1 }`. A második körben az A sárga lesz (és az A darabszáma 0-ra csökken), a második P viszont
  szürke marad, mert a `left`-ben nincs P. Az eredmény: `['correct', 'present', 'absent', 'absent', 'absent']`.

A sorok most az eredményt is megkapják, a mezők pedig ennek megfelelő osztályt kapnak: `is-correct`, `is-present` vagy
`is-absent` (a színek az `App.css`-ben vannak). Cseréld le az `src/components/Board.jsx` tartalmát erre:

```jsx file=src/components/Board.jsx mark=1,3-5,10-12,14,24,28-29
import { MAX_TRIES, WORD_LENGTH, evaluate } from '../game.js'

// A rács egy sora: öt mező. A letters egy szöveg, például 'CRANE' vagy 'HO';
// a states (csak elküldött tippnél) az evaluate eredménye, például ['absent', 'correct', …].
function Row({ letters, states }) {
  return (
    <div className="row">
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = letters[i]
        let tileClass = 'tile'
        if (states) tileClass = `tile is-${states[i]}`
        else if (letter) tileClass = 'tile is-filled'
        return (
          <div key={i} className={tileClass}>
            {letter}
          </div>
        )
      })}
    </div>
  )
}

// Az egész rács, az eddigi tippekből és a begépelés alatt álló szóból.
function Board({ guesses, current, answer }) {
  return (
    <div className="board">
      {Array.from({ length: MAX_TRIES }, (_, row) => {
        if (row < guesses.length) {
          return <Row key={row} letters={guesses[row]} states={evaluate(guesses[row], answer)} />
        }
        if (row === guesses.length) return <Row key={row} letters={current} />
        return <Row key={row} letters="" />
      })}
    </div>
  )
}

export default Board
```

A fordított aposztrófok közötti `tile is-${states[i]}` az 1. leckéből ismert [[template literal]]: a `${…}` helyére
a mező eredménye kerül, így lesz belőle például `'tile is-correct'`. Az eredményt nem tároljuk sehol: minden
rajzoláskor kiszámoljuk a tippből és a titkos szóból.

Végül az `App` sorsol egy titkos szót, és odaadja a `Board`-nak. Az `src/App.jsx`-ben három sor változik: a `game.js`
importja, egy új állapot a többi fölött, és a `<Board>` sora:

```jsx file=src/App.jsx mark=2,7,16
import { useEffect, useState } from 'react'
import { LETTERS, WORD_LENGTH, randomWord } from './game.js'
import Board from './components/Board.jsx'
import './App.css'

function App() {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')

  // … a billentyűzetet figyelő effekt, mint eddig

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Board guesses={guesses} current={current} answer={answer} />
    </main>
  )
}

export default App
```

A `useState(randomWord)` magát a függvényt kapja, nem az eredményét: ez a [[lusta kezdőérték]] a 3. leckéből. A React
csak az első rajzoláskor hívja meg, így a titkos szó nem cserélődik ki minden leütésnél. A `const [answer]` csak az
első elemet veszi ki abból a tömbből, amit a `useState` visszaad: settere nincs, mert egy játék alatt a titkos szó nem
változik.

:::check Ellenőrizd
Írj be egy szót, például `CRANE`-t, és nyomd meg az ++Enter++-t: a mezők kiszíneződnek. A zöld betű jó helyen van, a
sárga benne van a szóban, csak máshol, a szürke nincs benne. A begépelés alatt álló sor továbbra is színtelen.
:::

:::mistake Gyakori hiba
Az egykörös szabály, ami ránézésre jónak tűnik:

```js
if (guess[i] === answer[i]) result[i] = 'correct'
else if (answer.includes(guess[i])) result[i] = 'present'
else result[i] = 'absent'
```

Dupla betűknél hazudik: a PIANO-ra tippelt PAPER második P-je sárga lesz, pedig a szóban nincs második P. A sárgához
azt is tudni kell, maradt-e még szabad a betűből, ezért kell a két kör.
:::

:::try Próbáld ki
Csalj egy kicsit: írd az `App`-ba, a `useState` sorok alá: `console.log(answer)`. A konzolban (++F12++) ott a titkos
szó: gépeld be, és öt zöld mező a jutalmad. A teszteléshez jól jön, de játék előtt töröld ki a sort.
:::

### Nyertél vagy vesztettél

A játéknak kétféle vége lehet: eltaláltad a szót, vagy elfogyott a hat tipp. Egyikhez sem kell új állapot: a tippek
listájából bármikor kiderül, mi a helyzet. Ez is [[származtatott érték]], mint a 13. lecke `won`-ja.

Az „Új játék” gombnak mindent alaphelyzetbe kell állítania: új titkos szó, üres tippek, üres sor. Ezt megtehetnénk
setterekkel (a titkos szónak ehhez külön settert kellene adnunk), de van egyszerűbb út, amit a 3. és a 13. leckében már
láttál: a [[key]]. Ha egy komponens `key`-je megváltozik, a React nem frissíti, hanem eldobja, minden állapotával
együtt, és vadonatújat épít a helyére. Ehhez a játéknak saját komponens kell, amit az `App` egy `key`-vel rajzol ki. A
játék ezért átköltözik az `App`-ból egy új fájlba. Hozd létre az `src/components/Game.jsx` fájlt; nagy része ismerős (a
kiemelt sorok újak vagy megváltoztak):

```jsx file=src/components/Game.jsx mark=2-3,5,10-13,15,18,43,46,48-59,63
import { useEffect, useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, randomWord } from '../game.js'
import Board from './Board.jsx'

function Game({ onNewGame }) {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')

  // Minden rajzoláskor a tippekből számoljuk ki őket: nem kell nekik saját állapot.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // A figyelő a current-et, a guesses-t és az over-t olvassa, ezért lecseréljük, valahányszor megváltoznak.
  useEffect(() => {
    function handleKeyDown(event) {
      if (over) return // vége a játéknak: a billentyűzetnek nincs több dolga
      if (event.ctrlKey || event.metaKey || event.altKey) return

      if (event.key === 'Enter') {
        // Csak teli sort lehet elküldeni: a szó a tippek végére kerül, a következő sor üresen indul.
        if (current.length === WORD_LENGTH) {
          setGuesses([...guesses, current])
          setCurrent('')
        }
        return
      }

      if (event.key === 'Backspace') {
        setCurrent(current.slice(0, -1))
        return
      }

      const letter = event.key.toUpperCase()
      if (letter.length === 1 && LETTERS.includes(letter) && current.length < WORD_LENGTH) {
        setCurrent(current + letter)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current, guesses, over])

  return (
    <>
      <Board guesses={guesses} current={current} answer={answer} />
      {over && (
        <section className="result" role="status">
          <h2>{won ? 'Eltaláltad!' : 'Most nem jött össze'}</h2>
          <p>{won ? `${MAX_TRIES} tippből ${guesses.length} kellett.` : `A megfejtés: ${answer}.`}</p>
          <div className="result__actions">
            <button type="button" className="button" onClick={onNewGame}>
              Új játék
            </button>
          </div>
        </section>
      )}
    </>
  )
}

export default Game
```

- A `guesses.includes(answer)` igaz, ha a titkos szó ott van a tippek között: az [[includes]] tömbön is működik. A
  `lost` akkor igaz, ha nem nyertél (`!won`), **és** elfogyott a hat tipp; az `over`, ha a kettő közül bármelyik.
- Ha vége a játéknak, a figyelő rögtön visszatér: a billentyűk nem csinálnak semmit. Az `over` is a függőségi tömbbe
  került, mert a figyelő ezt is olvassa.
- A `<>…</>` a 13. leckéből ismert [[Fragment]]: több elemet ad vissza egy csomagban, felesleges `<div>` nélkül. Így
  a rács és az eredmény is közvetlenül az `App` fehér kártyájába kerül.
- A `{over && (…)}` [[feltételes megjelenítés]]: az eredmény csak a játék végén jelenik meg. A `role="status"` miatt
  a képernyőolvasók fel is olvassák.
- A gomb nem maga kezdi újra a játékot: szól az `App`-nak az `onNewGame` propon keresztül, az pedig új `key`-t ad.

Az `App` innentől csak keretet ad. Cseréld le az `src/App.jsx` tartalmát erre:

```jsx file=src/App.jsx mark=1-2,6-7,12
import { useState } from 'react'
import Game from './components/Game.jsx'
import './App.css'

function App() {
  // Minden játék saját sorszámot kap. Új sorszám új key, az új key pedig vadonatúj Game.
  const [round, setRound] = useState(0)

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Game key={round} onNewGame={() => setRound(round + 1)} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Találd ki a szót. Ha kell, csalj: a `console.log(answer)` sor most a `Game`-be kerül, a `useState` sorok alá (utána
töröld ki). A rács alatt megjelenik az „Eltaláltad!” felirat, például „6 tippből 4 kellett.”, és a billentyűk már nem
írnak semmit. Az „Új játék” gombra üres rács jön, új titkos szóval. Ha hat tipp után
sem találod el, „Most nem jött össze”, és a játék elárulja a megfejtést. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
Lemarad a `key={round}`. Ekkor az „Új játék” gomb nem csinál semmit: a `round` nő, de a `Game` ugyanaz a komponens
marad, ugyanazokkal az állapotokkal, a React csak frissíti.
:::

:::try Próbáld ki
Hogy ne kelljen hat tippet elpazarolnod a vereség kipróbálásához, állítsd a `MAX_TRIES`-t egy időre 2-re. Utána tedd
vissza 6-ra.
:::

## Középszint {level=2}

### Képernyő-billentyűzet

Telefonon nincs igazi billentyűzet, és mivel nincs szövegmező, a telefon saját billentyűzete sem jelenik meg. A játék
alá ezért egy képernyő-billentyűzet kerül. A gombjainak pontosan ugyanazt kell csinálniuk, mint az igazi billentyűknek. Ezért a logika kiköltözik a figyelőből egy `handleKey(key)`
függvénybe, amit mindkét billentyűzet hív: a `key` értéke `'ENTER'`, `'BACKSPACE'` vagy egy nagybetű.

Az ablak figyelője közben egy [[saját hookba|saját hook]] kerül (a 2., 6. és 9. leckében írtál már ilyet):
`useKeyboard(onKey)`. És ha már költözik, okosabb is lesz. A 3. lépésben a figyelőt minden változáskor lecseréltük.
Most a `handleKey` minden rajzoláskor új függvény (hiszen mindig a friss állapotot kell látnia), így a figyelőt minden
rajzolás után cserélni kellene. Működne, de van jobb megoldás: a [[useRef]] (16–18. lecke). A ref egy doboz (a tartalma a `ref.current`), amit a
React megőriz a rajzolások között, és ha a tartalma megváltozik, a React nem rajzol újra. Minden rajzolás után beletesszük a
legfrissebb `onKey`-t, a figyelő pedig, amit csak egyszer teszünk fel, mindig azt hívja, ami éppen a dobozban van.

Hozd létre az `src/useKeyboard.js` fájlt:

```js file=src/useKeyboard.js
import { useEffect, useRef } from 'react'

// Az egész ablakban figyeli a billentyűzetet, és az onKey-t hívja: 'ENTER', 'BACKSPACE'
// vagy egy nagybetű. A figyelő csak egyszer kerül fel.
function useKeyboard(onKey) {
  // A ref mindig a legfrissebb onKey-t tartja: a lenti figyelő mindig azt hívja.
  const onKeyRef = useRef(onKey)
  useEffect(() => {
    onKeyRef.current = onKey
  })

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Enter') onKeyRef.current('ENTER')
      else if (event.key === 'Backspace') onKeyRef.current('BACKSPACE')
      else if (event.key.length === 1) onKeyRef.current(event.key.toUpperCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

export default useKeyboard
```

- Az első effektnek nincs függőségi tömbje, ezért minden rajzolás után lefut, és a dobozba teszi a legújabb `onKey`-t.
- A második effekt függőségi tömbje üres: egyszer teszi fel a figyelőt, és a takarítás akkor veszi le, amikor a
  komponens eltűnik. A figyelő nem az `onKey`-t hívja (az az első rajzolásé lenne), hanem az `onKeyRef.current`-et.
- A hook csak lefordítja a billentyűt: Enter, Backspace vagy egy egykarakteres billentyű nagybetűvel. Hogy egy karakter
  betűje-e a játéknak, azt már a `Game` dönti el. Így a hook bármilyen játékban működik, a haladó szinten például a
  magyar ékezetes betűkkel is.

Most a képernyő-billentyűzet. Hozd létre az `src/components/Keyboard.jsx` fájlt:

```jsx file=src/components/Keyboard.jsx
// A billentyűk soronként. Az ENTER és a BACKSPACE a két széles gomb.
const ROWS = [
  [...'QWERTYUIOP'],
  [...'ASDFGHJKL'],
  ['ENTER', ...'ZXCVBNM', 'BACKSPACE'],
]

// Ez áll a két széles gombon.
const LABELS = { ENTER: 'Enter', BACKSPACE: '⌫' }

function Keyboard({ onKey }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, index) => (
        <div key={index} className="keyboard__row">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              className={key.length > 1 ? 'key key--wide' : 'key'}
              aria-label={key === 'BACKSPACE' ? 'Betű törlése' : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onKey(key)}
            >
              {LABELS[key] ?? key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
```

- A `[...'QWERTYUIOP']` a [[spread]] egy szövegen: betűnként szedi szét, így egy tízelemű tömb lesz belőle. A harmadik
  sorban a két széles gomb neve közé ömlenek a betűk.
- A `key={key}` első `key`-je a React kulcsa, a második a mi változónk: a billentyű neve, ami úgyis egyedi a sorban.
- A `LABELS[key] ?? key`: ha a billentyűnek van külön felirata, az jelenik meg, egyébként maga a betű.
- A ⌫ jelet a képernyőolvasók nem mindig tudják felolvasni, ezért ez a gomb [[aria-label]]-t kap. A többinél az
  `undefined` azt jelenti, hogy nincs ilyen attribútum.
- Az `onMouseDown` kikapcsolja az egérlenyomás [[alapértelmezett viselkedését|alapértelmezett viselkedés]] (a 7.
  leckéből ismert `preventDefault`). Egy gombra kattintva ugyanis a fókusz a gombra kerül, és egy fókuszban lévő gombot
  az ++Enter++ is „megnyom”. Így a kattintás működik, de a fókusz ott marad, ahol volt.

Végül a `Game`: a figyelő helyére a `handleKey` és a hook kerül, a játék végéig pedig a rács alatt a billentyűzet áll.
Cseréld le az `src/components/Game.jsx` tartalmát erre:

```jsx file=src/components/Game.jsx mark=1,3,5,17-24,26-29,33,38,48-49
import { useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, randomWord } from '../game.js'
import useKeyboard from '../useKeyboard.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'

function Game({ onNewGame }) {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')

  // Minden rajzoláskor a tippekből számoljuk ki őket: nem kell nekik saját állapot.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // Egy függvény mindkét billentyűzetnek. A key értéke 'ENTER', 'BACKSPACE' vagy egy nagybetű.
  function handleKey(key) {
    if (over) return // vége a játéknak: a billentyűzetnek nincs több dolga
    if (key === 'ENTER') {
      // Csak teli sort lehet elküldeni: a szó a tippek végére kerül, a következő sor üresen indul.
      if (current.length === WORD_LENGTH) {
        setGuesses([...guesses, current])
        setCurrent('')
      }
    } else if (key === 'BACKSPACE') {
      setCurrent(current.slice(0, -1))
    } else if (LETTERS.includes(key) && current.length < WORD_LENGTH) {
      setCurrent(current + key)
    }
  }

  useKeyboard(handleKey)

  return (
    <>
      <Board guesses={guesses} current={current} answer={answer} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'Eltaláltad!' : 'Most nem jött össze'}</h2>
          <p>{won ? `${MAX_TRIES} tippből ${guesses.length} kellett.` : `A megfejtés: ${answer}.`}</p>
          <div className="result__actions">
            <button type="button" className="button" onClick={onNewGame}>
              Új játék
            </button>
          </div>
        </section>
      ) : (
        <Keyboard onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

A `handleKey` ugyanazt csinálja, mint eddig a figyelő, csak nem eseményt kap, hanem a billentyű nevét. A JSX végén a
`feltétel ? (…) : (…)` két dolog közül választ: játék közben a billentyűzet, a játék végén az eredmény jelenik meg.

:::check Ellenőrizd
A rács alatt egy háromsoros billentyűzet jelenik meg. Kattints a betűire: a betűk a rácsba kerülnek, az „Enter”
elküldi a tippet, a ⌫ töröl. Az igazi billentyűzet is ugyanúgy működik, és a kettőt keverheted is. A játék végén a
billentyűzet helyén az eredmény áll.
:::

:::mistake Gyakori hiba
Lemarad az `onMouseDown={(event) => event.preventDefault()}`. Kattints a képernyőn az A-ra, gépeld be a szó többi
betűjét az igazi billentyűzeten, és nyomj ++Enter++-t: a tipp elmegy, de a következő sorban megjelenik egy A is. A
fókusz az A gombon maradt, és az ++Enter++ azt is megnyomta.
:::

:::try Próbáld ki
Tegyél egy `console.log('figyelő fel')` sort a `useKeyboard` második effektjébe, közvetlenül az `addEventListener`
elé, és gépelj: az üzenet nem jön minden leütés után, csak induláskor (a StrictMode miatt fejlesztés közben kétszer).
:::

### Színes billentyűk

A billentyűzet is mutassa, mit tudsz már az egyes betűkről: ha egy betű volt már zöld, a gombja is zöld; ha sárga,
sárga; ha kiderült, hogy nincs a szóban, szürke. Egy betű több tippben, sőt egy tippen belül is többször szerepelhet,
különböző eredménnyel: a PAPER első P-je zöld, a második szürke. Ezért mindig a legjobb eredményt tartjuk meg: a zöld
többet ér a sárgánál, a sárga a szürkénél. Ezt egy kis rangsor dönti el. Írd a `game.js` végére:

```js file=src/game.js
// Melyik eredmény mennyit ér: egy betű színe a billentyűzeten csak javulhat.
const RANK = { absent: 1, present: 2, correct: 3 }

// Minden eddig tippelt betű legjobb eredménye, a billentyűzethez: { C: 'absent', R: 'present', … }
export function letterStates(guesses, answer) {
  const states = {}
  for (const guess of guesses) {
    const result = evaluate(guess, answer)
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i]
      // Az első eredmény mindig bekerül; később csak egy jobb írhatja felül.
      if (states[letter] === undefined || RANK[result[i]] > RANK[states[letter]]) {
        states[letter] = result[i]
      }
    }
  }
  return states
}
```

A `for … of` a 3. leckéből ismert: sorra veszi a tippeket. Minden tippet kiértékel, és betűnként frissíti a `states`
objektumot. A `RANK[result[i]] > RANK[states[letter]]` számokat hasonlít össze: például `'correct'` (3) nagyobb, mint
`'present'` (2). Ez is származtatott érték: a tippekből bármikor újra kiszámolható, ezért nem kerül állapotba.

A billentyűzet megkapja a betűk eredményét, és a gombok osztályt kapnak hozzá. Cseréld le az
`src/components/Keyboard.jsx` tartalmát erre:

```jsx file=src/components/Keyboard.jsx mark=11,16-29
// A billentyűk soronként. Az ENTER és a BACKSPACE a két széles gomb.
const ROWS = [
  [...'QWERTYUIOP'],
  [...'ASDFGHJKL'],
  ['ENTER', ...'ZXCVBNM', 'BACKSPACE'],
]

// Ez áll a két széles gombon.
const LABELS = { ENTER: 'Enter', BACKSPACE: '⌫' }

function Keyboard({ states, onKey }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, index) => (
        <div key={index} className="keyboard__row">
          {row.map((key) => {
            let keyClass = key.length > 1 ? 'key key--wide' : 'key'
            if (states[key]) keyClass += ` is-${states[key]}`
            return (
              <button
                key={key}
                type="button"
                className={keyClass}
                aria-label={key === 'BACKSPACE' ? 'Betű törlése' : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onKey(key)}
              >
                {LABELS[key] ?? key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
```

A `row.map((key) => (…))` most `row.map((key) => { … })` lett: kapcsos zárójellel a nyílfüggvénynek teste van, amiben
előbb kiszámoljuk az osztályt, és a végén `return`-nel adjuk vissza a gombot. A széles gombok nem szerepelnek a
`states`-ben, így színtelenek maradnak.

A `Game`-ben két sor változik: a `game.js` importjába bekerül a `letterStates`, a `<Keyboard>` pedig megkapja az
eredményeket:

```jsx file=src/components/Game.jsx mark=2,6
import { useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, letterStates, randomWord } from '../game.js'
// … a többi import és a Game eleje, mint eddig

      ) : (
        <Keyboard states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
```

:::check Ellenőrizd
Küldj el egy tippet: a billentyűzeten a tipp betűi is kiszíneződnek, ugyanúgy, mint a rácsban. Ha egy sárga betűt
később jó helyre teszel, a gombja zöldre vált, és az is marad.
:::

:::mistake Gyakori hiba
A rangsor kimarad, és minden eredmény felülírja az előzőt (`states[letter] = result[i]`). Ha a titkos szó PIANO, és
PAPER-t tippelsz, a P gombja szürke lesz: az első P zöldjét felülírja a második P szürkéje, pedig a P benne van a
szóban.
:::

### Csak létező szavak

Eddig bármilyen öt betűt el lehetett küldeni, az AAAAA-t is. Mostantól csak létező szavakat fogadunk el: egy kitalált
szóra rövid üzenet jelenik meg a rács fölött („Nincs a szólistában”), a sor pedig marad, ahol volt. Ha nincs meg az
öt betű, az is üzenetet kap.

A szavak a `words.js`-ben vannak: a titkos szavak (`ANSWERS`) és a további tippelhető szavak (`EXTRA_GUESSES`). Hogy
egy szó köztük van-e, azt a 3. leckéből ismert [[Set]] mondja meg a leggyorsabban: egyszer elkészítjük, és utána a
`has` azonnal válaszol, bármekkora a lista. Az `src/game.js` első sora erre változik:

```js file=src/game.js
import { ANSWERS, EXTRA_GUESSES } from './words.js'
```

A fájl végére pedig ez kerül:

```js file=src/game.js
// Minden szó, amit tippelni lehet. A Set azonnal megmondja, benne van-e valami (3. lecke).
const VALID_WORDS = new Set([...ANSWERS, ...EXTRA_GUESSES])

export function isValidWord(word) {
  return VALID_WORDS.has(word)
}
```

A `[...ANSWERS, ...EXTRA_GUESSES]` a két tömböt önti egybe, a `new Set(…)` pedig egyszer, a fájl betöltésekor készül
el belőle, nem minden tippnél.

Az üzenet a `Game` állapota lesz, és másfél másodperc múlva eltűnik: ezt a 3. leckéből ismert `setTimeout` intézi egy
effektben. Az ++Enter++ dolga közben annyira megnőtt, hogy saját függvényt kap: `submit`. Cseréld le az
`src/components/Game.jsx` tartalmát erre:

```jsx file=src/components/Game.jsx mark=1-2,11,18-23,25-27,30-33,35-37,39-40,46-48,55-57
import { useEffect, useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, isValidWord, letterStates, randomWord } from '../game.js'
import useKeyboard from '../useKeyboard.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'

function Game({ onNewGame }) {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState(null) // { text }, amíg egy üzenet látszik, különben null

  // Minden rajzoláskor a tippekből számoljuk ki őket: nem kell nekik saját állapot.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // Az üzenet másfél másodperc múlva eltűnik.
  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => setMessage(null), 1500)
    return () => clearTimeout(timer)
  }, [message])

  // Egy tipp, amit nem lehet elküldeni: megmondjuk, miért.
  function reject(text) {
    setMessage({ text })
  }

  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Nincs elég betű')
      return
    }
    if (!isValidWord(current)) {
      reject('Nincs a szólistában')
      return
    }
    setGuesses([...guesses, current])
    setCurrent('')
  }

  // Egy függvény mindkét billentyűzetnek. A key értéke 'ENTER', 'BACKSPACE' vagy egy nagybetű.
  function handleKey(key) {
    if (over) return // vége a játéknak: a billentyűzetnek nincs több dolga
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') setCurrent(current.slice(0, -1))
    else if (LETTERS.includes(key) && current.length < WORD_LENGTH) setCurrent(current + key)
  }

  useKeyboard(handleKey)

  return (
    <>
      <p className="message" role="status">
        {message && message.text}
      </p>
      <Board guesses={guesses} current={current} answer={answer} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'Eltaláltad!' : 'Most nem jött össze'}</h2>
          <p>{won ? `${MAX_TRIES} tippből ${guesses.length} kellett.` : `A megfejtés: ${answer}.`}</p>
          <div className="result__actions">
            <button type="button" className="button" onClick={onNewGame}>
              Új játék
            </button>
          </div>
        </section>
      ) : (
        <Keyboard states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

- A `submit` sorra veszi, mi akadályozhatja a tippet. Ha valami gond van, üzenetet küld, és a `return` rögtön kilép:
  ez a [[korai visszatérés]]. Csak akkor jut el a végéig, ha minden rendben.
- Miért egy objektum az üzenet (`{ text }`), és nem maga a szöveg? Ha kétszer egymás után ugyanaz a szöveg jönne, a
  React azt látná, hogy az állapot nem változott: nem rajzolna újra, az effekt sem futna le, és az időzítő nem indulna
  újra. Az üzenet a második ++Enter++ után hamarabb tűnne el. Egy új objektum viszont mindig új érték, még ha ugyanaz is
  van benne.
- A `{message && message.text}`: ha nincs üzenet (`null`), nem rajzol semmit. Az üres `<p>` megtartja a helyét (így a
  rács nem ugrál), és a `role="status"` miatt a képernyőolvasók felolvassák az üzenetet, amikor megjelenik.

:::check Ellenőrizd
Írj be öt egyforma betűt (AAAAA), és nyomj ++Enter++-t: a rács fölött megjelenik a „Nincs a szólistában” üzenet, a
betűk pedig a sorban maradnak, hogy kijavíthasd őket. Három betűvel a „Nincs elég betű” jön. Az üzenet másfél
másodperc múlva eltűnik. Egy igazi szó, például a `TABLE`, ugyanúgy elmegy, mint eddig.
:::

:::mistake Gyakori hiba
Lemarad a `return` a `reject(…)` után. Az üzenet ugyan megjelenik, de a függvény fut tovább, és a szó mégis elmegy:
az AAAAA is beáll a rácsba.
:::

:::try Feladat
Kerüljön be a játékba egy saját szavad: írj egy ötbetűs angol szót nagybetűvel a `words.js` `EXTRA_GUESSES` listájába,
és próbáld ki, hogy elfogadja.
:::

### Animációk

A játék működik, de még merev. Négy kis animációval keltjük életre: a begépelt betű picit megugrik, az elküldött sor
mezői egymás után megfordulnak, és a fordulás közepén kapják meg a színüket, a visszautasított tipp sora megrázza a
fejét, a nyertes sor pedig a végén ugrik egyet. Végül az eredmény is finoman előtűnik.

A 13. leckéből tudod, hogy egy [[@keyframes]] írja le egy animáció lépéseit, az `animation` tulajdonság pedig
lejátssza. Egy CSS-animáció akkor indul, amikor az elem megkapja: amikor rákerül az osztály, amitől animálni kezd, vagy
amikor maga az elem megszületik. Ha egy osztály már rajta van, egy újrarajzolás nem indítja újra. Ezt fogjuk
kihasználni.

Ezek a stílusok a te munkád, ezért külön fájlba kerülnek. Hozd létre az `src/animations.css` fájlt:

```css file=src/animations.css
/* A begépelt betű picit megugrik. */
.tile.is-filled {
  animation: pop 0.1s ease-out;
}

@keyframes pop {
  50% {
    transform: scale(1.12);
  }
}

/* Az elküldött sor mezőnként fordul meg, negyed másodpercenként a következő. */
.tile.is-correct,
.tile.is-present,
.tile.is-absent {
  animation: flip 0.5s ease both;
  animation-delay: calc(var(--i) * 0.25s);
}

/* A fordulás feléig a mező még begépeltnek látszik, visszafelé már a színét mutatja. */
@keyframes flip {
  0% {
    transform: rotateX(0);
    border-color: #5a6478;
    background: #fff;
    color: #1c2333;
  }
  50% {
    transform: rotateX(90deg);
    border-color: #5a6478;
    background: #fff;
    color: #1c2333;
  }
  100% {
    transform: rotateX(0);
  }
}

/* A visszautasított tipp sora megrázza a fejét. */
.row.is-shaking {
  animation: shake 0.4s ease;
}

@keyframes shake {
  20%,
  60% {
    transform: translateX(-8px);
  }
  40%,
  80% {
    transform: translateX(8px);
  }
}

/* A nyertes sor fordulás után ugrik egyet, mezőnként egy tizedmásodperccel később. */
.row.is-won .tile {
  animation:
    flip 0.5s ease both,
    jump 0.5s ease;
  animation-delay:
    calc(var(--i) * 0.25s),
    calc(1.5s + var(--i) * 0.1s);
}

@keyframes jump {
  40% {
    transform: translateY(-16px);
  }
}

/* Az eredmény az utolsó fordulás után jelenik meg. */
.result {
  animation: appear 0.4s ease 1.5s both;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

/* Kevesebb mozgás annak, aki ezt kérte a gépe beállításaiban. */
@media (prefers-reduced-motion: reduce) {
  .board .row,
  .board .row .tile,
  .result {
    animation: none;
  }
}
```

- A `rotateX` a vízszintes tengely körül fordít ([[transform]], 13. lecke). 90 foknál a mező élére áll, és nem látszik:
  ilyenkor cseréljük a színét. A `0%` és az `50%` a begépelt mező színeit adja; a `100%`-nál nincs szín, ott a mező a
  saját színére, a zöldre, sárgára vagy szürkére érkezik meg.
- Az [[animation-delay]] késlelteti az indulást. A `var(--i)` egy [[CSS-változó]], amit minden mező a saját sorszámával
  kap meg (lásd lent): a 0. mező azonnal fordul, a 4. egy másodperccel később.
- A `both` az animáció [[animation-fill-mode]] beállítása: már a várakozás alatt is az első képkocka látszik (a mező
  fehér marad), a végén pedig megmarad az utolsó. E nélkül a mezők már a sorukra várva is színesek lennének, és
  induláskor fehérre villannának.
- A nyertes sor mezőinek két animációja van, vesszővel elválasztva, és két késleltetése, ugyanabban a sorrendben. Az
  ugrás 1,5 másodpercnél kezdődik, amikor az utolsó mező is megfordult (4 × 0,25 + 0,5).
- Az eredmény is 1,5 másodpercet vár, hogy ne árulja el a végkimenetelt, mielőtt a mezők megfordulnak.
- A [[prefers-reduced-motion]] a 13. leckéből ismert: akinek a gépe kevesebb mozgást kér, annál minden azonnal a helyére
  kerül. A szelektorok azért ilyen hosszúak (`.board .row .tile`), mert számít a [[specificitás]]: ha két szabály
  ugyanazt a tulajdonságot állítja, a pontosabb szelektorú nyer, két egyformán pontos közül pedig a későbbi. A
  `.board .row .tile` három osztályból áll, akárcsak a `.row.is-won .tile`, és később jön, ezért ő nyer.

A `Board` adja a mezőknek a `--i` változót, és a soroknak a két új osztályt. A rázásnál jön a trükk: a rázás akkor
játszódik le újra, ha a sor újra megszületik, és egy sort a legkönnyebben a [[key]]-jével lehet újraszületésre bírni.
Ezért a visszautasított tippeket számoljuk (`shakes`), és a begépelés alatt álló sor kulcsába beleírjuk ezt a számot:
minden visszautasításnál új kulcs, új sor, új rázás. Cseréld le az `src/components/Board.jsx` tartalmát erre:

```jsx file=src/components/Board.jsx mark=2,6,8,15,25,30-33,36-38
import { MAX_TRIES, WORD_LENGTH, evaluate } from '../game.js'
import '../animations.css'

// A rács egy sora: öt mező. A letters egy szöveg, például 'CRANE' vagy 'HO';
// a states (csak elküldött tippnél) az evaluate eredménye, például ['absent', 'correct', …].
function Row({ letters, states, className = '' }) {
  return (
    <div className={`row ${className}`}>
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = letters[i]
        let tileClass = 'tile'
        if (states) tileClass = `tile is-${states[i]}`
        else if (letter) tileClass = 'tile is-filled'
        return (
          <div key={i} className={tileClass} style={{ '--i': i }}>
            {letter}
          </div>
        )
      })}
    </div>
  )
}

// Az egész rács, az eddigi tippekből és a begépelés alatt álló szóból.
function Board({ guesses, current, answer, won, shakes }) {
  return (
    <div className="board">
      {Array.from({ length: MAX_TRIES }, (_, row) => {
        if (row < guesses.length) {
          // A megnyert játék utolsó sora ugrik is.
          const className = won && row === guesses.length - 1 ? 'is-won' : ''
          return (
            <Row key={row} letters={guesses[row]} states={evaluate(guesses[row], answer)} className={className} />
          )
        }
        if (row === guesses.length) {
          // Minden visszautasítás után új key: a React újraépíti a sort, és a rázás újra lejátszódik.
          return <Row key={`current-${shakes}`} letters={current} className={shakes > 0 ? 'is-shaking' : ''} />
        }
        return <Row key={row} letters="" />
      })}
    </div>
  )
}

export default Board
```

- A CSS-fájlt a `Board` tölti be (`import '../animations.css'`), ahogy a 13. leckében a `Card` a saját stílusát.
- A `className = ''` egy [[alapértelmezett paraméter]]: ha a `Row` nem kap `className`-et, üres szöveg lesz.
- A `style={{ '--i': i }}` a 13. leckéből ismert: [[inline stílus]], amivel egy CSS-változót adunk át az elemnek.

A `Game`-ben megjelenik a `shakes` számláló, a `reject` növeli, a `Board` pedig megkapja a `won`-t és a `shakes`-t. Itt
a teljes `src/components/Game.jsx`, ahogy a középszint végén kinéz:

```jsx file=src/components/Game.jsx mark=12,26,29,60
import { useEffect, useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, isValidWord, letterStates, randomWord } from '../game.js'
import useKeyboard from '../useKeyboard.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'

function Game({ onNewGame }) {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState(null) // { text }, amíg egy üzenet látszik, különben null
  const [shakes, setShakes] = useState(0) // hány tippet utasított vissza a játék

  // Minden rajzoláskor a tippekből számoljuk ki őket: nem kell nekik saját állapot.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // Az üzenet másfél másodperc múlva eltűnik.
  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => setMessage(null), 1500)
    return () => clearTimeout(timer)
  }, [message])

  // Egy tipp, amit nem lehet elküldeni: megmondjuk, miért, és megrázzuk a sort.
  function reject(text) {
    setMessage({ text })
    setShakes(shakes + 1)
  }

  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Nincs elég betű')
      return
    }
    if (!isValidWord(current)) {
      reject('Nincs a szólistában')
      return
    }
    setGuesses([...guesses, current])
    setCurrent('')
  }

  // Egy függvény mindkét billentyűzetnek. A key értéke 'ENTER', 'BACKSPACE' vagy egy nagybetű.
  function handleKey(key) {
    if (over) return // vége a játéknak: a billentyűzetnek nincs több dolga
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') setCurrent(current.slice(0, -1))
    else if (LETTERS.includes(key) && current.length < WORD_LENGTH) setCurrent(current + key)
  }

  useKeyboard(handleKey)

  return (
    <>
      <p className="message" role="status">
        {message && message.text}
      </p>
      <Board guesses={guesses} current={current} answer={answer} won={won} shakes={shakes} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'Eltaláltad!' : 'Most nem jött össze'}</h2>
          <p>{won ? `${MAX_TRIES} tippből ${guesses.length} kellett.` : `A megfejtés: ${answer}.`}</p>
          <div className="result__actions">
            <button type="button" className="button" onClick={onNewGame}>
              Új játék
            </button>
          </div>
        </section>
      ) : (
        <Keyboard states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

:::check Ellenőrizd
Gépelés közben minden betű picit megugrik. Az ++Enter++ után a sor mezői balról jobbra, egymás után megfordulnak, és
fordulás közben kapják meg a színüket. Egy nem létező szóra a sor megrázza a fejét, minden alkalommal. A nyertes sor a
fordulás után végigugrál, az eredmény pedig csak utána jelenik meg. Ha a gépeden be van kapcsolva a kevesebb mozgás
(vagy a DevToolsban: ++Ctrl++ + ++Shift++ + ++P++ → „Emulate CSS prefers-reduced-motion: reduce”), minden animáció
elmarad. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
`animation: flip 0.5s ease`, a `both` nélkül. A mezők már a sorukra várva is a végleges színüket mutatják, aztán
amikor a fordulásuk elkezdődik, egy pillanatra fehérre villannak. A `both` tartja az első képkockát a várakozás alatt.
:::

:::try Próbáld ki
Írd át a késleltetést `0.25s`-ről `0.1s`-re (és az ugrás `1.5s`-ét ehhez igazítva `0.9s`-re): pergősebb lesz. Vagy
próbáld ki a `rotateX` helyett a `rotateY`-t: a mezők oldalra fordulnak.
:::

## Haladó szint {level=3}

### A napi szó

Az ismert szókitaláló játékok varázsa, hogy egy adott napon mindenki ugyanazt a szót kapja, és másnap meg lehet
beszélni, ki hányból találta ki. Ehhez nem kell szerver: elég, ha a szót a dátumból számoljuk ki. Aki ugyanazon a napon nyitja meg a játékot,
ugyanazt a dátumot látja, és ugyanazt a szót kapja.

A dátumból két dolog kell: egy rövid szöveg a napról (`'2026-11-23'`), és egy sorszám, hogy hányadik nap ez.
Gyakorláshoz továbbra is jár véletlen szó: a játéknak két módja lesz, a napi szó és a gyakorlás. A napi játékot el is
mentjük, különben egy újratöltés új esélyt adna. Hozd létre az `src/daily.js` fájlt:

```js file=src/daily.js
import { ANSWERS } from './words.js'

// A mai nap ezen a gépen, szövegként: például '2026-11-23'.
export function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Egy nap szava. Ugyanaz a dátum minden gépen ugyanazt a szót adja.
export function dailyWord(dateKey) {
  // Hány nap telt el 1970. január 1. óta: a Date.parse ezredmásodpercet ad, egy nap 86 400 000 ezredmásodperc.
  const dayNumber = Date.parse(dateKey) / 86400000
  // Naponta 37 szóval lépünk tovább, így a szavak nem ábécérendben jönnek.
  return ANSWERS[(dayNumber * 37) % ANSWERS.length]
}

const SAVE_KEY = 'word-guess:daily'

// A nap játékának tippjei, ha aznap már mentettünk.
export function loadDailyGuesses(dateKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY))
    if (saved && saved.date === dateKey) return saved.guesses
  } catch {
    // Letiltott tároló vagy sérült mentés: tippek nélkül indulunk.
  }
  return []
}

export function saveDailyGuesses(dateKey, guesses) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ date: dateKey, guesses }))
  } catch {
    // Nem baj: a játék így is működik, csak nem emlékszik.
  }
}
```

- A `new Date()` a pillanatnyi időpont, a gép órája szerint. A `getMonth()` 0-tól számol (a január 0), ezért kell a
  `+ 1`. A 13. leckéből ismert [[padStart]] két jegyre egészít ki: a `'5'`-ből `'05'` lesz.
- A `Date.parse('2026-11-23')` az [[UTC]] (a világidő) szerinti éjfélt adja meg, 1970 óta eltelt ezredmásodpercben.
  Mivel pontosan éjfél, egy nap hosszával elosztva egész számot kapunk: a nap sorszámát.
- A `%` a 3. leckéből ismert [[modulo]]: az osztás maradéka mindig 0 és a lista hossza mínusz 1 közé esik, vagyis
  érvényes hely a listában. A titkos szavak ábécérendben vannak, ezért nem egyesével lépünk: a szomszédos napok szavát
  különben könnyű lenne kitalálni. A 37 azért jó, mert a lista hosszával, a 179-cel nincs 1-nél nagyobb közös osztója,
  így minden szó sorra kerül, mielőtt bármelyik ismétlődne.
- A mentés a 2., 6. és 9. leckéből ismert: a [[localStorage]] csak szöveget tárol, ezért [[JSON]]-ná alakítjuk, a
  [[try/catch]] pedig megvéd, ha a böngésző letiltja a tárolót. Ha még nincs mentés, a `getItem` `null`-t ad, a
  `JSON.parse(null)` szintén `null`-t, és a feltétel hamis. A dátumot is mentjük: tegnapi tippek ma nem érvényesek.

A `Game` megkapja a módot (`mode`: `'daily'` vagy `'practice'`), és ettől függ, honnan jön a titkos szó, és mivel
indulnak a tippek. Cseréld le az `src/components/Game.jsx` tartalmát erre:

```jsx file=src/components/Game.jsx mark=3,8-12,22-25,73-81
import { useEffect, useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, isValidWord, letterStates, randomWord } from '../game.js'
import { dailyWord, loadDailyGuesses, saveDailyGuesses, todayKey } from '../daily.js'
import useKeyboard from '../useKeyboard.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'

function Game({ mode, onNewGame }) {
  // A nap, amelyikhez ez a játék tartozik. Amíg ez a Game él, nem változik, ezért nincs settere.
  const [today] = useState(todayKey)
  const [answer] = useState(() => (mode === 'daily' ? dailyWord(today) : randomWord()))
  const [guesses, setGuesses] = useState(() => (mode === 'daily' ? loadDailyGuesses(today) : []))
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState(null) // { text }, amíg egy üzenet látszik, különben null
  const [shakes, setShakes] = useState(0) // hány tippet utasított vissza a játék

  // Minden rajzoláskor a tippekből számoljuk ki őket: nem kell nekik saját állapot.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // A napi játékot minden tipp után elmentjük: újratöltés után ott folytatódik, és nem lehet kétszer játszani.
  useEffect(() => {
    if (mode === 'daily') saveDailyGuesses(today, guesses)
  }, [mode, today, guesses])

  // Az üzenet másfél másodperc múlva eltűnik.
  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => setMessage(null), 1500)
    return () => clearTimeout(timer)
  }, [message])

  // Egy tipp, amit nem lehet elküldeni: megmondjuk, miért, és megrázzuk a sort.
  function reject(text) {
    setMessage({ text })
    setShakes(shakes + 1)
  }

  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Nincs elég betű')
      return
    }
    if (!isValidWord(current)) {
      reject('Nincs a szólistában')
      return
    }
    setGuesses([...guesses, current])
    setCurrent('')
  }

  // Egy függvény mindkét billentyűzetnek. A key értéke 'ENTER', 'BACKSPACE' vagy egy nagybetű.
  function handleKey(key) {
    if (over) return // vége a játéknak: a billentyűzetnek nincs több dolga
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') setCurrent(current.slice(0, -1))
    else if (LETTERS.includes(key) && current.length < WORD_LENGTH) setCurrent(current + key)
  }

  useKeyboard(handleKey)

  return (
    <>
      <p className="message" role="status">
        {message && message.text}
      </p>
      <Board guesses={guesses} current={current} answer={answer} won={won} shakes={shakes} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'Eltaláltad!' : 'Most nem jött össze'}</h2>
          <p>{won ? `${MAX_TRIES} tippből ${guesses.length} kellett.` : `A megfejtés: ${answer}.`}</p>
          {mode === 'daily' ? (
            <p>Holnap új szó jön. Addig is gyakorolj!</p>
          ) : (
            <div className="result__actions">
              <button type="button" className="button" onClick={onNewGame}>
                Új szó
              </button>
            </div>
          )}
        </section>
      ) : (
        <Keyboard states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

- A `const [today] = useState(todayKey)` egy állapot setter nélkül: a nap egyszer, a játék születésekor dől el, és
  utána nem változik. Ha valaki éjfélen át játszik, a tippjei ahhoz a naphoz mentődnek, amelyiken a játékot kezdte.
- A titkos szó és az első tippek lusta kezdőértéke most egy-egy nyílfüggvény, mert a módtól függ, mit kell
  kiszámolni. Napi módban a mentett tippekkel indulunk, gyakorlásban üres listával.
- Az új effekt minden tipp után ment, de csak napi módban: a gyakorlás nem kerül a tárolóba.
- A gyakorlás végén a gomb felirata mostantól „Új szó” (eddig „Új játék” volt). Napi módban viszont nincs ilyen gomb:
  a nap szavát csak egyszer lehet kitalálni.

Az `App` adja a módot: két gombot kap, és a `Game` kulcsába a mód is bekerül. Így a mód váltása is vadonatúj `Game`-et
hoz, a saját szavával és tippjeivel. Cseréld le az `src/App.jsx` tartalmát erre:

```jsx file=src/App.jsx mark=6,13-23
import { useState } from 'react'
import Game from './components/Game.jsx'
import './App.css'

function App() {
  const [mode, setMode] = useState('daily') // 'daily' vagy 'practice'
  // Minden játék saját sorszámot kap. Új sorszám új key, az új key pedig vadonatúj Game.
  const [round, setRound] = useState(0)

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <div className="switches">
        <div className="toggle" role="group" aria-label="Játékmód">
          <button type="button" aria-pressed={mode === 'daily'} onClick={() => setMode('daily')}>
            Napi szó
          </button>
          <button type="button" aria-pressed={mode === 'practice'} onClick={() => setMode('practice')}>
            Gyakorlás
          </button>
        </div>
      </div>
      <Game key={`${mode}-${round}`} mode={mode} onNewGame={() => setRound(round + 1)} />
    </main>
  )
}

export default App
```

A két gomb kapcsolóként működik: az [[aria-pressed]] (2. lecke) mondja meg a képernyőolvasóknak, melyik van
bekapcsolva, és az `App.css` is ez alapján színezi ki. A `role="group"` és az `aria-label` egy névvel ellátott csoportba
fogja őket.

:::check Ellenőrizd
A cím alatt egy kétgombos kapcsoló jelenik meg, a „Napi szó” bekapcsolva. Tippelj kettőt, és töltsd újra az oldalt: a két tipp
ott van, ugyanazzal a szóval. Nyisd meg az oldalt egy privát ablakban is, és írd be ugyanazt a két tippet: ugyanazok
a színek jönnek, mert ugyanaz a napi szó. A „Gyakorlás” véletlen szóval, üres ráccsal indul, a végén „Új szó” gomb
vár. Vissza a „Napi szó”-ra: ott a mai játék, ahogy hagytad. Ha a napi szót befejezted, a végén a „Holnap új szó jön.”
üzenet áll.
:::

:::mistake Gyakori hiba
A mentés `if (mode === 'daily')` nélkül. Ekkor a gyakorlás tippjei is a napi mentés helyére kerülnek: visszaváltva a
„Napi szó”-ra a gyakorlás tippjeit látod, a napi szóhoz színezve.
:::

:::concept Mennyire ugyanaz mindenkinek?
A szó a gép órája szerinti dátumból jön, ezért éjfélkor vált, mindenkinek a saját éjfélekor: New Yorkban hat órával
később kapják meg az új szót, mint Budapesten. Ugyanazon a naptári napon viszont mindenki ugyanazt a szót kapja, és
pont erre van szükség, hogy meg lehessen beszélni. Az ismert szójátékok is így működnek. Mivel a szólista és a
számolás is a kódban van, egy ügyes programozó a holnapi szót is ki tudná számolni; egy játékhoz ez belefér.
:::

### Statisztika és sorozat

A játékos szereti látni, hogyan áll: hányszor játszott, hányszor nyert, hány napja nyer egyfolytában (ez a
**sorozat**), és hány tippből szokta kitalálni a szót. A statisztika csak a napi játékokat számolja, és persze
megmarad újratöltés után is.

Mentésre a 9. leckéből ismert [[saját hook]] a legkényelmesebb, a `useLocalStorage`: úgy működik, mint a `useState`,
csak az értéke túléli az újratöltést. Hozd létre az `src/useLocalStorage.js` fájlt (ha megvan a saját változatod a 9.
leckéből, az is jó):

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Úgy működik, mint a useState, de az érték túléli az újratöltést:
// JSON-ként a localStorage-ba kerül, a megadott kulcs alá.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Letiltott tároló vagy sérült mentés: marad a kezdőérték.
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

A sorozathoz tudni kell, mi volt a tegnapi dátum. Írd az `src/daily.js` végére:

```js file=src/daily.js
// Az előző nap ugyanebben az alakban: '2026-11-23' → '2026-11-22'.
export function previousDay(dateKey) {
  const dayBefore = new Date(Date.parse(dateKey) - 86400000)
  return dayBefore.toISOString().slice(0, 10)
}
```

A `Date.parse` az éjfél időpontját adja ezredmásodpercben, ebből levonunk egy napot, a `new Date(…)` pedig
visszaalakítja időponttá. A `toISOString()` UTC szerint írja ki (`'2026-11-22T00:00:00.000Z'`), és ennek az első tíz
karaktere éppen a dátum. Mivel mindkét irány UTC-ben számol, nem zavar bele, hogy nálunk éppen hány óra van.

Maga a statisztika egy objektum, és a számolása nem a Reacté, ezért saját fájlba kerül. Hozd létre az `src/stats.js`
fájlt:

```js file=src/stats.js
import { previousDay } from './daily.js'

// Annak a statisztikája, aki még nem játszott.
export const NEW_STATS = {
  played: 0,
  wins: 0,
  streak: 0, // nyerések egymás utáni napokon
  bestStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0], // hány játékot nyert 1, 2, … 6 tippből
  lastWin: null, // az utolsó nyerés dátuma
}

// A statisztika egy újabb befejezett napi játék után. Új objektumot ad, a régi nem változik.
export function addResult(stats, won, tries, dateKey) {
  if (!won) {
    return { ...stats, played: stats.played + 1, streak: 0 }
  }
  // A sorozat csak akkor folytatódik, ha az utolsó nyerés tegnap volt.
  const streak = stats.lastWin === previousDay(dateKey) ? stats.streak + 1 : 1
  const distribution = [...stats.distribution]
  distribution[tries - 1] += 1
  return {
    played: stats.played + 1,
    wins: stats.wins + 1,
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    distribution,
    lastWin: dateKey,
  }
}
```

- Az `addResult` sosem írja át a kapott objektumot: új objektumot ad vissza, a `distribution` tömbről is másolatot
  készít (`[...stats.distribution]`), és csak a másolatot változtatja meg. Ez az [[immutábilis frissítés]], amit az
  állapot megkövetel.
- A vereség nullázza a sorozatot. A nyerés folytatja, ha tegnap is nyertél, különben 1-ről indul újra.
- A `distribution[tries - 1]`: a tömb 0-tól számol, ezért kerül a háromtippes nyerés a 2. helyre.

A statisztikát egy saját komponens rajzolja ki: négy szám és egy-egy sáv a tippek számához. Hozd létre az
`src/components/Stats.jsx` fájlt:

```jsx file=src/components/Stats.jsx
// A napi játékok statisztikája: négy szám és egy sáv minden tippszámhoz.
function Stats({ stats, highlight }) {
  const winPercent = stats.played === 0 ? 0 : Math.round((stats.wins / stats.played) * 100)
  // A leghosszabb sáv a leggyakoribb tippszámé (legalább 1, hogy sose osszunk nullával).
  const most = Math.max(1, ...stats.distribution)

  return (
    <div className="stats">
      <dl className="stats__numbers">
        <div>
          <dt>Játszma</dt>
          <dd>{stats.played}</dd>
        </div>
        <div>
          <dt>Nyerési %</dt>
          <dd>{winPercent}</dd>
        </div>
        <div>
          <dt>Sorozat</dt>
          <dd>{stats.streak}</dd>
        </div>
        <div>
          <dt>Legjobb sorozat</dt>
          <dd>{stats.bestStreak}</dd>
        </div>
      </dl>
      <h3>Tippek eloszlása</h3>
      <ol className="stats__bars">
        {stats.distribution.map((count, index) => (
          <li key={index} className={index + 1 === highlight ? 'is-current' : ''}>
            <span>{index + 1}</span>
            <span className="stats__bar" style={{ width: `${(count / most) * 100}%` }}>
              {count}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default Stats
```

- A számok egy [[leíró lista]] (`<dl>`) elemei, mint a 13. lecke eredményei: a `<dt>` a név, a `<dd>` az
  érték. Az `App.css` a számot teszi felülre.
- A `Math.max(1, ...stats.distribution)`-ban a [[spread]] egy függvényhívásban áll, mint a 14. leckében a
  `Math.min(...values)`: a tömb elemeit külön paraméterekként adja át, mintha `Math.max(1, 0, 2, 5, …)`-t írtunk volna.
- A sáv szélessége a legnagyobbhoz képest számolt százalék, inline stílusban. A `highlight` az éppen befejezett játék
  tippszáma: annak a sávja zöld.

A `Game`-ben négy helyen van dolgunk. Először a fájl tetején a meglévő importok mellé ez a három kerül:

```jsx file=src/components/Game.jsx
import { NEW_STATS, addResult } from '../stats.js'
import useLocalStorage from '../useLocalStorage.js'
import Stats from './Stats.jsx'
```

Aztán a `shakes` állapot alá a statisztika, a saját kulcsa alatt:

```jsx file=src/components/Game.jsx mark=2
  const [shakes, setShakes] = useState(0) // hány tippet utasított vissza a játék
  const [stats, setStats] = useLocalStorage('word-guess:stats', NEW_STATS)
```

A `submit` végén jegyezzük fel az eredményt, ha ezzel a tippel ért véget egy napi játék. Cseréld le a teljes `submit`
függvényt erre:

```jsx file=src/components/Game.jsx mark=10-11,14-18
  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Nincs elég betű')
      return
    }
    if (!isValidWord(current)) {
      reject('Nincs a szólistában')
      return
    }
    const newGuesses = [...guesses, current]
    setGuesses(newGuesses)
    setCurrent('')

    // A befejezett napi játék bekerül a statisztikába. A gyakorlás nem számít bele.
    const guessed = current === answer
    if (mode === 'daily' && (guessed || newGuesses.length === MAX_TRIES)) {
      setStats(addResult(stats, guessed, newGuesses.length, today))
    }
  }
```

Végül a napi játék végén megjelenik a statisztika. Az eredmény `mode === 'daily' ? (` ágát cseréld le erre (a
gyakorlás ága, a `) : (` utáni rész marad):

```jsx file=src/components/Game.jsx mark=2-5
          {mode === 'daily' ? (
            <>
              <Stats stats={stats} highlight={won ? guesses.length : null} />
              <p>Holnap új szó jön. Addig is gyakorolj!</p>
            </>
          ) : (
```

- A `newGuesses` azért kell, mert a `setGuesses` után a `guesses` ebben a függvényben még a régi lista: az új érték a
  következő rajzoláskor érkezik meg (a 3. lecke `changeLength`-je is így dolgozott).
- Az eredményt az eseménykezelő jegyzi fel, abban a pillanatban, amikor a játék véget ér. Így pontosan egyszer
  számolódik, akárhányszor töltöd is újra az oldalt.
- Az új ágban egy `<>…</>` [[Fragment]] fogja össze a statisztikát és a szöveget, mert a `? :` mindkét ága csak egy
  elemet adhat vissza.

:::check Ellenőrizd
Ha a mai napi játékot már az előző lépésben befejezted, az még a statisztika előtt ért véget, ezért nem számolódott
bele. Előbb töröld a mentését: ++F12++ → Application → Local Storage → jobb klikk a `word-guess:daily` soron →
Delete, aztán töltsd újra az oldalt. Ezután fejezd be a mai napi játékot. Az eredmény alatt megjelenik a statisztika:
1 játszma, a nyerési % 100, a sorozat 1, és annak a tippszámnak a sávja zöld, ahányból kitaláltad (vereségnél a
nyerési % és a sorozat is 0). Töltsd újra az oldalt: a statisztika ugyanaz marad, nem számolódott kétszer. Egy
gyakorló játék nem változtat rajta.
:::

:::mistake Gyakori hiba
Az eredmény feljegyzése egy effektben: `useEffect(() => { if (over) setStats(…) }, [over])`. Újratöltés után a
befejezett napi játéknál az `over` már az első rajzoláskor igaz, az effekt lefut, és ugyanaz a játék újra beleszámít:
minden újratöltés egy újabb játszma.
:::

:::try Feladat
Próbáld ki a sorozatot holnapig várás nélkül. A DevToolsban (++F12++ → Application → Local Storage) írd át a
`word-guess:stats` `lastWin` értékét a tegnapi dátumra, töröld a `word-guess:daily` mentést, töltsd újra az oldalt, és
találd ki újra a mai szót (már tudod!): a sorozat 2 lesz.
:::

### Az eredmény megosztása

Az ilyen szókitaláló játékok legismertebb része a megosztás: színes négyzetek, betűk nélkül, így mindenki látja, hogyan jutottál el a
megoldásig, de a megfejtést nem árulod el. A négyzetek [[emojik|emoji]], vagyis közönséges szöveges karakterek, ezért a
vágólapra is szövegként kerülnek.

A négyzetrács a tippekből és a titkos szóból készül. Írd a `game.js` végére:

```js file=src/game.js
// Az eredmény színes négyzetekben, tippenként egy sorban, betűk nélkül: nem árul el semmit.
const SQUARES = { correct: '🟩', present: '🟨', absent: '⬛' }

export function emojiGrid(guesses, answer) {
  return guesses
    .map((guess) => evaluate(guess, answer).map((state) => SQUARES[state]).join(''))
    .join('\n')
}
```

A belső `map` egy tipp eredményéből négyzeteket csinál, a `join('')` egy sorrá ragasztja őket. A külső `map` minden
tippből egy ilyen sort készít, a `join('\n')` pedig sortörésekkel fűzi össze a sorokat. A `'\n'` a [[sortörés]]
karaktere: a fordított perjel azt jelzi, hogy különleges karakter jön, nem az n betű.

A megosztó gomb a 3. lecke másológombjának testvére: másol, és két másodpercig a gombon mondja el, sikerült-e. Hozd
létre az `src/components/ShareButton.jsx` fájlt:

```jsx file=src/components/ShareButton.jsx
import { useEffect, useState } from 'react'

// A vágólapra másolja a szöveget, és két másodpercig a gombon jelzi, sikerült-e.
function ShareButton({ text }) {
  const [status, setStatus] = useState('idle') // 'idle', 'copied' vagy 'failed'

  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 2000)
    return () => clearTimeout(timer)
  }, [status])

  async function share() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = 'Eredmény megosztása'
  if (status === 'copied') label = 'Vágólapra másolva!'
  if (status === 'failed') label = 'Nem sikerült másolni'

  return (
    <button type="button" className="button" onClick={share}>
      {label}
    </button>
  )
}

export default ShareButton
```

Ugyanaz a minta, mint a 3. leckében: a [[Clipboard API]] `writeText`-je egy [[Promise]]-t ad, amit az `await` megvár,
a `try/catch` pedig elkapja, ha a böngésző nem engedi a másolást.

A `Game`-ben három helyen van dolgunk. A fájl tetején a `game.js` importjába bekerül az `emojiGrid`, alá pedig a gomb
importja:

```jsx file=src/components/Game.jsx mark=1,2
import { LETTERS, MAX_TRIES, WORD_LENGTH, emojiGrid, isValidWord, letterStates, randomWord } from '../game.js'
import ShareButton from './ShareButton.jsx'
```

A `useKeyboard(handleKey)` sor alá a megosztandó szöveg:

```jsx file=src/components/Game.jsx mark=3-5
  useKeyboard(handleKey)

  // A megosztott szöveg: a dátum, az eredmény (vereségnél X) és a négyzetek.
  const score = won ? guesses.length : 'X'
  const shareText = `Rika Szókitaláló ${today} ${score}/${MAX_TRIES}\n\n${emojiGrid(guesses, answer)}`
```

Végül a napi ágba, a statisztika alá a gomb. Cseréld le a `mode === 'daily' ? (` ágat erre:

```jsx file=src/components/Game.jsx mark=4-6
          {mode === 'daily' ? (
            <>
              <Stats stats={stats} highlight={won ? guesses.length : null} />
              <div className="result__actions">
                <ShareButton text={shareText} />
              </div>
              <p>Holnap új szó jön. Addig is gyakorolj!</p>
            </>
          ) : (
```

A `shareText` is származtatott érték: minden rajzoláskor elkészül, de csak a játék végén használjuk. A `\n\n` két
sortörés, vagyis egy üres sor a cím és a négyzetek között.

:::check Ellenőrizd
Ha a mai napi játékot még nem fejezted be, fejezd be. Az eredmény alatt, a statisztika után most ott az „Eredmény
megosztása” gomb: kattints rá, a felirata „Vágólapra másolva!” lesz, és két másodperc múlva visszavált. Illeszd be
(++Ctrl++ + ++V++) a szerkesztődbe: az első sorban például „Rika Szókitaláló 2026-11-23 4/6” áll, egy üres sor után
pedig tippenként egy sor színes négyzet.
:::

:::mistake Gyakori hiba
A külső `join` is `join('')` lesz. Ekkor minden négyzet egyetlen hosszú sorba kerül, és nem látszik, hol ér véget egy
tipp. A tippeket a `'\n'` választja el.
:::

:::try Feladat
A gyakorló játék eredményét is lehessen megosztani: a gyakorlás ágában az „Új szó” mellé is kerüljön egy `ShareButton`.
A dátum helyett ott írd azt, hogy „gyakorlás”.
:::

### Magyar szólista

Végül a játék magyarul is tudjon. Az `src/wordsHu.js` a kiinduló projekttel érkezett: 181 titkos szó (`ANSWERS_HU`) és
csaknem háromszáz további tippelhető szó (`EXTRA_GUESSES_HU`). Az ékezetes betűk miatt azonban több minden függ a nyelvtől,
mint gondolnád:

- **a szavak:** a titkos szavak listája és a tippelhető szavak `Set`-je;
- **a betűk:** az Á, É, Í, Ó, Ö, Ő, Ú, Ü és Ű is a játék betűi;
- **a billentyűzet:** a magyar billentyűzeten a Z és az Y helyet cserél, és az ékezetes betűk is kellenek;
- **a mentés:** a magyar napi szónak saját mentés és saját statisztika jár, különben a két nyelv összekeveredne.

Mindazt, ami a nyelvtől függ, nyelvenként egy objektumba gyűjtjük. Hozd létre az `src/wordLists.js` fájlt:

```js file=src/wordLists.js
import { ANSWERS, EXTRA_GUESSES } from './words.js'
import { ANSWERS_HU, EXTRA_GUESSES_HU } from './wordsHu.js'

// Minden, ami a szavak nyelvétől függ, nyelvenként egy objektumban.
export const WORD_LISTS = {
  en: {
    answers: ANSWERS,
    valid: new Set([...ANSWERS, ...EXTRA_GUESSES]),
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    keyboard: [
      [...'QWERTYUIOP'],
      [...'ASDFGHJKL'],
      ['ENTER', ...'ZXCVBNM', 'BACKSPACE'],
    ],
  },
  hu: {
    answers: ANSWERS_HU,
    valid: new Set([...ANSWERS_HU, ...EXTRA_GUESSES_HU]),
    letters: 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ',
    // Magyar billentyűzet: a Z és az Y helyet cserél, az ékezetes betűk saját sort kapnak.
    keyboard: [
      [...'ÁÉÍÓÖŐÚÜŰ'],
      [...'QWERTZUIOP'],
      [...'ASDFGHJKL'],
      ['ENTER', ...'YXCVBNM', 'BACKSPACE'],
    ],
  },
}
```

Az ékezetes betűk a [[Unicode]] szabvány szerint önálló karakterek: az `'Ő'.length` 1, a `'ő'.toUpperCase()` pedig
`'Ő'`. Ezért működik velük változtatás nélkül a `useKeyboard` és az `evaluate` is.

Figyelem: a következő öt fájl egymásra épül. Attól kezdve, hogy lecserélted a `game.js`-t, egészen az `App.jsx`
cseréjéig a játék nem működik: az oldal üres lehet vagy nem frissül, a konzolban (++F12++ → Console) pedig hibák
jelennek meg, például „does not provide an export named 'LETTERS'”. Ez így rendben van: haladj tovább, és a lépés végén
ellenőrizz.

A `game.js`-ből kiköltözik minden, ami a nyelvtől függ: az import, a `LETTERS`, a `VALID_WORDS` és az `isValidWord`. A
`randomWord` pedig paraméterben kapja a listát. Cseréld le az `src/game.js` tartalmát erre:

```js file=src/game.js mark=5-7
// A játék szabályai két számban.
export const WORD_LENGTH = 5
export const MAX_TRIES = 6

// Egy véletlen titkos szó a megadott listából.
export function randomWord(answers) {
  return answers[Math.floor(Math.random() * answers.length)]
}

// Mennyit ér egy tipp, betűnként: 'correct' (jó betű, jó helyen),
// 'present' (benne van a szóban, de máshol) vagy 'absent' (nincs a szóban).
export function evaluate(guess, answer) {
  const result = []
  // A titkos szó szabadon maradt betűi és a darabszámuk, például { I: 1, A: 1 }.
  const left = {}

  // Első kör: a zöldek. A titkos szó el nem talált betűi a left-be kerülnek.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
    } else {
      result[i] = 'absent'
      left[answer[i]] = (left[answer[i]] ?? 0) + 1
    }
  }

  // Második kör: a rossz helyen álló betű csak akkor sárga, ha van még belőle szabadon.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'absent' && left[guess[i]] > 0) {
      result[i] = 'present'
      left[guess[i]] -= 1
    }
  }

  return result
}

// Melyik eredmény mennyit ér: egy betű színe a billentyűzeten csak javulhat.
const RANK = { absent: 1, present: 2, correct: 3 }

// Minden eddig tippelt betű legjobb eredménye, a billentyűzethez: { C: 'absent', R: 'present', … }
export function letterStates(guesses, answer) {
  const states = {}
  for (const guess of guesses) {
    const result = evaluate(guess, answer)
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i]
      // Az első eredmény mindig bekerül; később csak egy jobb írhatja felül.
      if (states[letter] === undefined || RANK[result[i]] > RANK[states[letter]]) {
        states[letter] = result[i]
      }
    }
  }
  return states
}

// Az eredmény színes négyzetekben, tippenként egy sorban, betűk nélkül: nem árul el semmit.
const SQUARES = { correct: '🟩', present: '🟨', absent: '⬛' }

export function emojiGrid(guesses, answer) {
  return guesses
    .map((guess) => evaluate(guess, answer).map((state) => SQUARES[state]).join(''))
    .join('\n')
}
```

A `daily.js`-ben a napi szó a megadott listából jön, a mentés kulcsába pedig bekerül a nyelv. Cseréld le az
`src/daily.js` tartalmát erre:

```js file=src/daily.js mark=9-10,14,17-18,20,28,30
// A mai nap ezen a gépen, szövegként: például '2026-11-23'.
export function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Egy nap szava a megadott listából. Ugyanaz a dátum minden gépen ugyanazt a szót adja.
export function dailyWord(dateKey, answers) {
  // Hány nap telt el 1970. január 1. óta: a Date.parse ezredmásodpercet ad, egy nap 86 400 000 ezredmásodperc.
  const dayNumber = Date.parse(dateKey) / 86400000
  // Naponta 37 szóval lépünk tovább, így a szavak nem ábécérendben jönnek.
  return answers[(dayNumber * 37) % answers.length]
}

// Minden nyelvnek saját napi játéka van, saját kulcs alatt.
export function loadDailyGuesses(lang, dateKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(`word-guess:${lang}:daily`))
    if (saved && saved.date === dateKey) return saved.guesses
  } catch {
    // Letiltott tároló vagy sérült mentés: tippek nélkül indulunk.
  }
  return []
}

export function saveDailyGuesses(lang, dateKey, guesses) {
  try {
    localStorage.setItem(`word-guess:${lang}:daily`, JSON.stringify({ date: dateKey, guesses }))
  } catch {
    // Nem baj: a játék így is működik, csak nem emlékszik.
  }
}

// Az előző nap ugyanebben az alakban: '2026-11-23' → '2026-11-22'.
export function previousDay(dateKey) {
  const dayBefore = new Date(Date.parse(dateKey) - 86400000)
  return dayBefore.toISOString().slice(0, 10)
}
```

A 37-es lépés a magyar listával is minden szót sorra vesz: 181 szó van benne, és a 181-nek sincs 1-nél nagyobb közös
osztója a 37-tel.

A billentyűzet sorai mostantól kívülről jönnek: a `ROWS` helyett a `rows` prop. Cseréld le az
`src/components/Keyboard.jsx` tartalmát erre:

```jsx file=src/components/Keyboard.jsx mark=4-5,8
// Ez áll a két széles gombon.
const LABELS = { ENTER: 'Enter', BACKSPACE: '⌫' }

// A rows a billentyűk sorai: betűk, és az ENTER meg a BACKSPACE a két széles gomb.
function Keyboard({ rows, states, onKey }) {
  return (
    <div className="keyboard">
      {rows.map((row, index) => (
        <div key={index} className="keyboard__row">
          {row.map((key) => {
            let keyClass = key.length > 1 ? 'key key--wide' : 'key'
            if (states[key]) keyClass += ` is-${states[key]}`
            return (
              <button
                key={key}
                type="button"
                className={keyClass}
                aria-label={key === 'BACKSPACE' ? 'Betű törlése' : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onKey(key)}
              >
                {LABELS[key] ?? key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
```

A `Game` a `lang` proppal megkapja a nyelvet, és a `WORD_LISTS[lang]`-ból veszi a szavakat, a betűket és a
billentyűzetet. A statisztika kulcsába is bekerül a nyelv. Itt a teljes, kész `src/components/Game.jsx`:

```jsx file=src/components/Game.jsx mark=2,5,13-15,18-19,23,32-33,53,73,109
import { useEffect, useState } from 'react'
import { MAX_TRIES, WORD_LENGTH, emojiGrid, letterStates, randomWord } from '../game.js'
import { dailyWord, loadDailyGuesses, saveDailyGuesses, todayKey } from '../daily.js'
import { NEW_STATS, addResult } from '../stats.js'
import { WORD_LISTS } from '../wordLists.js'
import useKeyboard from '../useKeyboard.js'
import useLocalStorage from '../useLocalStorage.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'
import ShareButton from './ShareButton.jsx'
import Stats from './Stats.jsx'

function Game({ lang, mode, onNewGame }) {
  // Minden, ami a nyelvtől függ: a szavak, a betűk és a billentyűzet.
  const list = WORD_LISTS[lang]
  // A nap, amelyikhez ez a játék tartozik. Amíg ez a Game él, nem változik, ezért nincs settere.
  const [today] = useState(todayKey)
  const [answer] = useState(() => (mode === 'daily' ? dailyWord(today, list.answers) : randomWord(list.answers)))
  const [guesses, setGuesses] = useState(() => (mode === 'daily' ? loadDailyGuesses(lang, today) : []))
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState(null) // { text }, amíg egy üzenet látszik, különben null
  const [shakes, setShakes] = useState(0) // hány tippet utasított vissza a játék
  const [stats, setStats] = useLocalStorage(`word-guess:${lang}:stats`, NEW_STATS)

  // Minden rajzoláskor a tippekből számoljuk ki őket: nem kell nekik saját állapot.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // A napi játékot minden tipp után elmentjük: újratöltés után ott folytatódik, és nem lehet kétszer játszani.
  useEffect(() => {
    if (mode === 'daily') saveDailyGuesses(lang, today, guesses)
  }, [lang, mode, today, guesses])

  // Az üzenet másfél másodperc múlva eltűnik.
  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => setMessage(null), 1500)
    return () => clearTimeout(timer)
  }, [message])

  // Egy tipp, amit nem lehet elküldeni: megmondjuk, miért, és megrázzuk a sort.
  function reject(text) {
    setMessage({ text })
    setShakes(shakes + 1)
  }

  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Nincs elég betű')
      return
    }
    if (!list.valid.has(current)) {
      reject('Nincs a szólistában')
      return
    }
    const newGuesses = [...guesses, current]
    setGuesses(newGuesses)
    setCurrent('')

    // A befejezett napi játék bekerül a statisztikába. A gyakorlás nem számít bele.
    const guessed = current === answer
    if (mode === 'daily' && (guessed || newGuesses.length === MAX_TRIES)) {
      setStats(addResult(stats, guessed, newGuesses.length, today))
    }
  }

  // Egy függvény mindkét billentyűzetnek. A key értéke 'ENTER', 'BACKSPACE' vagy egy nagybetű.
  function handleKey(key) {
    if (over) return // vége a játéknak: a billentyűzetnek nincs több dolga
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') setCurrent(current.slice(0, -1))
    else if (list.letters.includes(key) && current.length < WORD_LENGTH) setCurrent(current + key)
  }

  useKeyboard(handleKey)

  // A megosztott szöveg: a dátum, az eredmény (vereségnél X) és a négyzetek.
  const score = won ? guesses.length : 'X'
  const shareText = `Rika Szókitaláló ${today} ${score}/${MAX_TRIES}\n\n${emojiGrid(guesses, answer)}`

  return (
    <>
      <p className="message" role="status">
        {message && message.text}
      </p>
      <Board guesses={guesses} current={current} answer={answer} won={won} shakes={shakes} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'Eltaláltad!' : 'Most nem jött össze'}</h2>
          <p>{won ? `${MAX_TRIES} tippből ${guesses.length} kellett.` : `A megfejtés: ${answer}.`}</p>
          {mode === 'daily' ? (
            <>
              <Stats stats={stats} highlight={won ? guesses.length : null} />
              <div className="result__actions">
                <ShareButton text={shareText} />
              </div>
              <p>Holnap új szó jön. Addig is gyakorolj!</p>
            </>
          ) : (
            <div className="result__actions">
              <button type="button" className="button" onClick={onNewGame}>
                Új szó
              </button>
            </div>
          )}
        </section>
      ) : (
        <Keyboard rows={list.keyboard} states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

Ha az előző feladatban a gyakorlásnak is adtál megosztó gombot, a saját változtatásaidat (a gyakorlás megosztott
szövegét és az „Új szó” melletti `ShareButton`-t) vidd át ebbe a fájlba is. A `useLocalStorage` kulcsa most a nyelvtől
függ (`word-guess:hu:stats`). Ez azért biztonságos, mert a nyelv váltása új `Game`-et hoz (lásd lent): amíg egy `Game`
él, a kulcsa nem változik, és minden új `Game` a saját kulcsáról olvas.

Az `App` megjegyzi a választott nyelvet (ezt is a `useLocalStorage`-ra bízzuk), kap hozzá két kapcsolót, és a nyelv is
bekerül a `Game` kulcsába. Cseréld le az `src/App.jsx` tartalmát erre:

```jsx file=src/App.jsx mark=2,7,24-31,33
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import Game from './components/Game.jsx'
import './App.css'

function App() {
  const [lang, setLang] = useLocalStorage('word-guess:lang', 'en') // a szavak nyelve: 'en' vagy 'hu'
  const [mode, setMode] = useState('daily') // 'daily' vagy 'practice'
  // Minden játék saját sorszámot kap. Új sorszám új key, az új key pedig vadonatúj Game.
  const [round, setRound] = useState(0)

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <div className="switches">
        <div className="toggle" role="group" aria-label="Játékmód">
          <button type="button" aria-pressed={mode === 'daily'} onClick={() => setMode('daily')}>
            Napi szó
          </button>
          <button type="button" aria-pressed={mode === 'practice'} onClick={() => setMode('practice')}>
            Gyakorlás
          </button>
        </div>
        <div className="toggle" role="group" aria-label="Szólista">
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
            English
          </button>
          <button type="button" aria-pressed={lang === 'hu'} onClick={() => setLang('hu')}>
            Magyar
          </button>
        </div>
      </div>
      <Game key={`${lang}-${mode}-${round}`} lang={lang} mode={mode} onNewGame={() => setRound(round + 1)} />
    </main>
  )
}

export default App
```

A nyelvek gombjain a nyelv saját neve áll („English”, „Magyar”), ahogy a legtöbb oldalon: így az is megtalálja a
sajátját, aki a másikat nem érti. A mentés kulcsai megváltoztak, ezért az eddigi angol napi játék és statisztika
egyszer nulláról indul.

:::check Ellenőrizd
A kapcsolók között megjelenik az „English” és a „Magyar”. A „Magyar”-ra kattintva magyar napi szó jön, a billentyűzet
négysoros lesz: felül az ékezetes betűk, alul a Z helyén az Y. Az igazi billentyűzeten is beírhatod az ékezetes betűket
(magyar kiosztással). Egy szó, mint az ALMÁS, elmegy, egy kitalált viszont, mint az ÁÁÁÁÁ, a „Nincs a szólistában”
üzenetet kapja. Vissza az „English”-re: ott az angol napi játék, ahogy hagytad, és mindkét nyelvnek saját statisztikája van. Újratöltés után a
választott nyelv megmarad. Gratulálunk, kész a szókitaláló!
:::

:::concept Miért két mező a CS?
A magyar ábécében a CS, a GY, az SZ és társaik egy-egy betűnek számítanak, a játékunk viszont karaktereket számol: a
KÖNYV nála öt mező (K-Ö-N-Y-V), pedig a magyar nyelvtan szerint négy betű. Egy igazi magyar változatnak ezeket egy
mezőbe kellene tennie, ehhez viszont minden szót betűkre kellene bontani. Ez trükkösebb, mint amilyennek látszik: a
„házsor” szóban például a Z és az S két külön betű, nem ZS, az „egészség”-ben pedig SZ és S áll egymás mellett, nem S
és ZS. Ezért sok ilyen játék a mi utunkat járja: a szólistában öt karakterből álló szavak vannak, és kész.
:::

:::mistake Gyakori hiba
A mentés kulcsából kimarad a nyelv. Ekkor a két nyelv egy mentésen osztozik: a „Magyar”-ra váltva az angol napi szóhoz
tett tippeid jelennek meg, a magyar szóhoz színezve, és a két nyelv statisztikája is összekeveredik.
:::

:::try Feladat
Bővítsd a magyar szólistát: írj új ötkarakteres szavakat nagybetűvel a `wordsHu.js` `EXTRA_GUESSES_HU` listájába, és
próbáld ki őket. Ha egy szót titkos szónak is szeretnél, az `ANSWERS_HU`-ba tedd. Vigyázz: ha a titkos szavak száma a
37 többszöröse lesz (például 185), a napi szó csak néhány szó között váltakozik; ilyenkor tegyél be még egy szót.
:::
