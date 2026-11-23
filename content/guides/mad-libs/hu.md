# Mit építünk?

Egy szójátékot, ami a gyerekkori „Ki? Kivel? Hol? Mit csinált?” papírhajtogatós játék rokona (angolul Mad Libs a
neve): a játékos beír néhány szót (egy nevet, egy állatot, egy igét), anélkül hogy tudná, hová kerülnek, aztán egy
gombnyomásra kiderül, milyen történet lett belőlük. Általában nagyon vicces. Közben megtanulod, hogyan kezel a React sok szövegmezőt egyszerre, hogyan rak össze egy program
szöveget darabokból, és hogyan dönti el egy komponens, hogy mit mutasson és mit ne.

:::levels
- Három mező (név, állat, ige), és a beírt szavakból vicces történet lesz. | kb. 2 óra
- Több történet véletlen választással, sablonból készülő mezők, újrakezdés és kiemelt szavak. | kb. 2 óra
- Saját sablon `{főnév}` alakú mezőkkel, megosztható link, felolvasás és kétjátékos mód. | kb. 3 óra
:::

**Előismeret:** az első három lecke. Az 1. leckében (Me, Myself & React) megismerted a komponenseket, a propokat, a
JSX-et, a `useState`-et, a `useEffect`-et és az első űrlapodat; a 3.-ban (Password Generator) a csúszkát, a
jelölőnégyzeteket, a vágólapot, a származtatott értéket és az állapot felemelését. Ahol ezekre építünk, egy-két
mondatban felidézzük őket, minden újat pedig lépésről lépésre elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Töltsd le a lecke **alapját** (fent: „Alap letöltése”), csomagold ki, és nyisd meg a `mad-libs` mappát a
szerkesztőben. Ha megcsináltad az előző leckéket, a Node.js és a VS Code már megvan; ha nem, az 1. lecke 0. lépése
megmutatja, hogyan telepítsd őket. Aztán írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz,
rajta lila betűkkel a „Mad Libs” címet. Más még nincs rajta: a játékot te írod meg.
:::

Az alapban két fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért most sem kell
  stílust írnod: csak a lépésekben megadott osztályneveket (`fields`, `field`, `story`, `chip`, …) használod. Azért
  nézz bele!

Az alap mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések angolul vannak. A kódot, amit te írsz be, magyar
feliratokkal, történetekkel és megjegyzésekkel mutatjuk.

Ahogy eddig, a mappa most is egy git-repó egyetlen committal, a kezdőállapottal: a `git restore .` minden fájlt
visszaállít, és érdemes minden működő lépés után commitolni (`git add .`, majd `git commit -m "Három mező"`).

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza: HTML-szerű leírást arról, mi jelenjen meg a képernyőn.
Kívülről [[props]]-on keresztül kap adatot, emlékezni pedig a [[useState]] segítségével tud: ha egy állapotérték
megváltozik, a React újrarajzolja a komponenst. Egy [[eseménykezelő]] (például az `onChange` vagy az `onClick`
függvénye) akkor fut le, amikor valami történik az oldalon. Ha ezek közül valami ismeretlennek tűnik, lapozz
vissza az 1. leckéhez.
:::

### Három mező, egy állapot

A játékhoz először szavak kellenek: egy név, egy állat és egy ige. Mindegyiknek egy szövegmező jut, és mindhárom
[[vezérelt mező]] lesz. Az 1. lecke kapcsolati űrlapján és a 3. lecke csúszkájánál már találkoztál ilyennel; most
nézzük meg alaposan, mi történik egyetlen billentyűleütéskor:

1. Beírsz egy betűt. A böngésző szól a Reactnek: „változott a mező”, a React pedig meghívja az `onChange`-nek megadott
   függvényt, az `update`-et.
2. Az `update` a `setWords`-szel elmenti az új szöveget az állapotba.
3. A React újrarajzolja a komponenst, és a mező a `value` propjából, vagyis az állapotból kapja vissza a szöveget.

A mező tehát nem maga tárolja a szövegét: mindig azt mutatja, ami az állapotban van. Így a szavak egyetlen helyen
vannak, az állapotban, és a React bármikor tudja, mi áll a mezőkben. Ez kell ahhoz, hogy a szavakból később
történetet írjunk.

Írd át az `src/App.jsx`-et így (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1,5,7-10,15-30
import { useState } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState({ name: '', animal: '', verb: '' })

  // Egy függvény mindhárom mezőhöz: a mező neve (name) mondja meg, melyik szót frissíti.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <form className="word-form">
        <div className="fields">
          <label className="field">
            <span className="field__label">Egy név</span>
            <input name="name" value={words.name} onChange={update} placeholder="pl. Bence" />
          </label>
          <label className="field">
            <span className="field__label">Egy állat</span>
            <input name="animal" value={words.animal} onChange={update} placeholder="pl. zsiráf" />
          </label>
          <label className="field">
            <span className="field__label">Egy ige</span>
            <input name="verb" value={words.verb} onChange={update} placeholder="pl. táncolni" />
          </label>
        </div>
      </form>
    </main>
  )
}

export default App
```

- A három szó egyetlen [[objektumban|objektum]] van: `{ name: '', animal: '', verb: '' }`. Mindhárom üres szövegként
  indul.
- Az `update` mindhárom mezőt kiszolgálja, mint az 1. lecke űrlapján. Az `event.target` az a mező, amelyikbe gépeltek;
  a `name` attribútuma (`'name'`, `'animal'` vagy `'verb'`) mondja meg, melyik kulcsot kell frissíteni, a `value` pedig
  a mező új szövege.
- A `{ ...words, … }` a [[spread]]: lemásolja a régi objektumot, és felülírja benne azt az egy kulcsot, amelyik
  megváltozott. Az
  állapotot sosem módosítjuk közvetlenül, mindig új objektumot adunk a `setWords`-nek.
- A `placeholder` szürke példaszöveg az üres mezőben; amint gépelni kezdesz, eltűnik.
- Mivel a `<label>` magába foglalja a mezőt, a címkére kattintva is a mezőbe kerül a kurzor.

:::check Ellenőrizd
A cím alatt három mező van egymás mellett (keskeny ablakban egymás alatt), bennük szürkén a példák: „pl. Bence”, „pl.
zsiráf”, „pl. táncolni”. Mindhárom mezőbe tudsz írni.
:::

:::mistake Gyakori hiba
Kimarad egy mezőből a `name` attribútum, például az igééből, és abba a mezőbe nem lehet írni. Ilyenkor az
`event.target.name` üres szöveg, így az `update` egy üres nevű kulcsba menti a betűt, a `words.verb` pedig nem
változik. A mező az állapotot mutatja, ezért üres marad.
:::

:::try Próbáld ki
Írd be a `</form>` alá: `<pre>{JSON.stringify(words, null, 2)}</pre>`. A `JSON.stringify` szöveggé ([[JSON]]
formátumúvá, ahogy a JavaScript szövegként leírja az objektumokat és a tömböket) alakítja az objektumot; a `null, 2`
azt kéri, hogy behúzva, több sorba tördelje. A `<pre>` pedig úgy mutatja a szöveget, ahogy van, sortörésekkel együtt.
Így a képernyőn látod az állapotot: gépelj, és figyeld, ahogy betűről betűre változik. Utána töröld ki a sort.
:::

### Szavakból történet

Most jöhet a történet. Szöveget kétféleképpen rakhatsz össze darabokból. Az egyik az [[összefűzés]] a `+` jellel: két
szöveg között a `+` egyetlen szöveget csinál belőlük. A másik a [[template literal]], amit az 1. leckében, a `mailto:`
linknél láttál: a fordított aposztrófok közötti szövegben a `${…}` helyére a kapcsos zárójelben lévő érték kerül. A
kettő ugyanazt adja:

:::compare
```js label="Összefűzés +-szal"
const greeting = 'Szia, ' + name + '! Ma ' + count + ' üzeneted jött.'
```
```js label="Template literal" now
const greeting = `Szia, ${name}! Ma ${count} üzeneted jött.`
```
:::

A template literal olvashatóbb: nem kell idézőjeleket nyitogatni, és jobban látszanak a szóközök. A hosszú
történetünket mégis mindkettővel írjuk: három template literal, egy-egy sor, a `+` pedig összefűzi őket, hogy ne
legyen egyetlen végtelen sor a kódban. Egészítsd ki az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=7-11,37-39
import { useState } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState({ name: '', animal: '', verb: '' })

  // A történet a szavakból készül, minden rajzoláskor újra.
  const story =
    `${words.name} egy reggel arra ébredt, hogy egy ${words.animal} ül az ágya szélén, ` +
    `és nagyon szeretne ${words.verb}. Nem volt mit tenni: egész délelőtt együtt ` +
    `próbáltak ${words.verb}, amíg a szomszédok tapsolni nem kezdtek.`

  // Egy függvény mindhárom mezőhöz: a mező neve (name) mondja meg, melyik szót frissíti.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <form className="word-form">
        <div className="fields">
          <label className="field">
            <span className="field__label">Egy név</span>
            <input name="name" value={words.name} onChange={update} placeholder="pl. Bence" />
          </label>
          <label className="field">
            <span className="field__label">Egy állat</span>
            <input name="animal" value={words.animal} onChange={update} placeholder="pl. zsiráf" />
          </label>
          <label className="field">
            <span className="field__label">Egy ige</span>
            <input name="verb" value={words.verb} onChange={update} placeholder="pl. táncolni" />
          </label>
        </div>
      </form>
      <article className="story">
        <p className="story__text">{story}</p>
      </article>
    </main>
  )
}

export default App
```

A `story` nem állapot, hanem [[származtatott érték]], mint a 3. lecke erősségjelzője: a szavakból következik, ezért
minden rajzoláskor egyszerűen újra kiszámoljuk. Minden billentyűleütés új rajzolást jelent, így a történet mindig a
friss szavakat mutatja. Figyeld meg a szóközt az első két sor végén, a záró fordított aposztróf előtt: a `+` semmit nem
tesz a darabok közé, a szóközt neked kell beírnod.

:::check Ellenőrizd
A mezők alatt egy krémszínű dobozban ott a történet, egyelőre lyukakkal: „egy reggel arra ébredt, hogy egy ül az ágya
szélén…”. (Ha az előző lépés szavai még a mezőkben vannak, a történetben rögtön azok állnak: mentéskor a React
megtartja az állapotot. Töröld ki őket, és meglátod a lyukakat.) Gépelj a mezőkbe: a szavak betűről betűre
megjelennek a történetben.
:::

:::mistake Gyakori hiba
Sima aposztróf (`'`) a fordított helyett. Ekkor a `${words.name}` nem cserélődik ki: betű szerint ott marad a
történetben, dollárjellel és kapcsos zárójelekkel együtt. A `${…}` csak fordított aposztrófok között működik.
Windowsos magyar billentyűzeten a fordított aposztróf az ++AltGr++ + ++7++.
:::

:::try Feladat
Adj a játékhoz egy negyedik szót: egy helyet. Három helyen kell hozzányúlnod: a kezdőállapotban (`place: ''`), egy új
mezővel (`name="place"`, címkéje „Egy hely”, példája „pl. a hűtőben”), és a történetben, például így:
`amíg a szomszédok ${words.place} tapsolni nem kezdtek`. A következő lépések a háromszavas változattal folytatódnak.
:::

### Előbb a szavak, aztán a történet

Így még nem igazi Mad Libs: a játékos látja a történetet, miközben gépel. A történetnek akkor kell megjelennie, amikor
minden szó megvan, és a játékos megnyomja a gombot. Ehhez egy új állapot kell, a `revealed` („felfedve”): `false`, amíg
a mezőket töltjük, és `true`, amikor a történetet mutatjuk.

Az, hogy a képernyőn mi látszik, ettől az állapottól függ: ez a [[feltételes megjelenítés]]. Most a
[[ternáris operátor]] végzi, amellyel a 3. lecke erősségjelzőjében az osztálynevet választottad:
`{feltétel ? (ez) : (az)}`. Ha a feltétel igaz, az első rész jelenik meg, ha hamis, a második. Az 1. és a 3. leckében az `&&`-et is használtad: a `{feltétel && (ez)}` vagy megjelenik, vagy semmi. A `? :`
akkor kell, ha két dolog közül mindig az egyik látszik.

```jsx file=src/App.jsx mark=6,19-22,27-38,53-57,59
import { useState } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState({ name: '', animal: '', verb: '' })
  const [revealed, setRevealed] = useState(false)

  // A történet a szavakból készül, minden rajzoláskor újra.
  const story =
    `${words.name} egy reggel arra ébredt, hogy egy ${words.animal} ül az ágya szélén, ` +
    `és nagyon szeretne ${words.verb}. Nem volt mit tenni: egész délelőtt együtt ` +
    `próbáltak ${words.verb}, amíg a szomszédok tapsolni nem kezdtek.`

  // Egy függvény mindhárom mezőhöz: a mező neve (name) mondja meg, melyik szót frissíti.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    setRevealed(true)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      {revealed ? (
        <article className="story">
          <p className="story__text">{story}</p>
          <div className="actions">
            <button type="button" onClick={() => setRevealed(false)}>
              Szavak módosítása
            </button>
          </div>
        </article>
      ) : (
        <form className="word-form" onSubmit={reveal}>
          <p className="hint">Írj be egy-egy szót! Hogy hová kerülnek, csak a végén derül ki.</p>
          <div className="fields">
            <label className="field">
              <span className="field__label">Egy név</span>
              <input name="name" value={words.name} onChange={update} placeholder="pl. Bence" />
            </label>
            <label className="field">
              <span className="field__label">Egy állat</span>
              <input name="animal" value={words.animal} onChange={update} placeholder="pl. zsiráf" />
            </label>
            <label className="field">
              <span className="field__label">Egy ige</span>
              <input name="verb" value={words.verb} onChange={update} placeholder="pl. táncolni" />
            </label>
          </div>
          <div className="actions">
            <button type="submit" className="button--primary">
              Mutasd a történetet
            </button>
          </div>
        </form>
      )}
    </main>
  )
}

export default App
```

- A `type="submit"` gomb beküldi az űrlapot, és ilyenkor lefut az `onSubmit` függvénye, a `reveal`. Az Enter billentyű
  bármelyik mezőben ugyanezt teszi.
- Az `event.preventDefault()` az 1. lecke űrlapjából ismerős: enélkül a böngésző beküldéskor újratöltené az oldalt.
- A „Szavak módosítása” gomb `type="button"`, vagyis sima gomb, ami nem küld be semmit. Az `onClick`-je egy kis
  [[nyílfüggvény]], ami `false`-ra állítja a `revealed`-et.

És itt jön a vezérelt mezők nagy előnye. Amikor a történet megjelenik, az űrlap a mezőkkel együtt eltűnik az oldalról.
A szavak mégsem vesznek el, mert nem a mezőkben laknak, hanem az `App` állapotában. Amikor a „Szavak módosítása”
visszahozza az űrlapot, az új mezők a `value`-jukból rögtön visszakapják a régi szavakat.

:::check Ellenőrizd
A történet eltűnt, a mezők fölött egy rövid útmutató áll, alattuk a lila „Mutasd a történetet” gomb. Töltsd ki a
mezőket, és kattints a gombra (vagy nyomj ++Enter++-t egy mezőben): az űrlap helyén megjelenik a történet. A „Szavak
módosítása” visszahozza az űrlapot, benne a beírt szavaiddal.
:::

:::mistake Gyakori hiba
Kimarad az `event.preventDefault()`. Ekkor a gombra kattintva az oldal egy pillanatra felvillan és újratöltődik, az
újratöltés pedig mindent alaphelyzetbe állít: üresek a mezők, és a történet sem jelenik meg.
:::

:::try Próbáld ki
Írd át a `? :` részt két `&&`-re: `{revealed && (…)}` a történethez és `{!revealed && (…)}` az űrlaphoz (a `!`
jelentése „nem”). Ugyanúgy működik. Melyiket olvasod könnyebben?
:::

### Csak ha minden mező ki van töltve

Most üres mezőkkel is meg lehet nyomni a gombot, és a történet tele lesz lyukakkal. A gomb legyen letiltva, amíg
valamelyik mező üres, és mellette egy kis számláló mutassa, hány mező van már kitöltve.

Csakhogy mi számít kitöltöttnek? Egy szóköz nem szó. A [[trim]] levágja a szöveg elejéről és végéről a szóközöket: a
`'  zsiráf '.trim()` eredménye `'zsiráf'`, a `'   '.trim()` eredménye pedig `''`, üres szöveg. Az `src/App.jsx` így
néz ki a kezdő szint végén:

```jsx file=src/App.jsx mark=8-11,26,59,62-64
import { useState } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState({ name: '', animal: '', verb: '' })
  const [revealed, setRevealed] = useState(false)

  // Hány mezőbe írtak már valamit? A csak szóközökből álló szó nem számít.
  const filledCount = Object.values(words).filter((word) => word.trim() !== '').length
  const total = Object.keys(words).length
  const complete = filledCount === total

  // A történet a szavakból készül, minden rajzoláskor újra.
  const story =
    `${words.name} egy reggel arra ébredt, hogy egy ${words.animal} ül az ágya szélén, ` +
    `és nagyon szeretne ${words.verb}. Nem volt mit tenni: egész délelőtt együtt ` +
    `próbáltak ${words.verb}, amíg a szomszédok tapsolni nem kezdtek.`

  // Egy függvény mindhárom mezőhöz: a mező neve (name) mondja meg, melyik szót frissíti.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (complete) setRevealed(true)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      {revealed ? (
        <article className="story">
          <p className="story__text">{story}</p>
          <div className="actions">
            <button type="button" onClick={() => setRevealed(false)}>
              Szavak módosítása
            </button>
          </div>
        </article>
      ) : (
        <form className="word-form" onSubmit={reveal}>
          <p className="hint">Írj be egy-egy szót! Hogy hová kerülnek, csak a végén derül ki.</p>
          <div className="fields">
            <label className="field">
              <span className="field__label">Egy név</span>
              <input name="name" value={words.name} onChange={update} placeholder="pl. Bence" />
            </label>
            <label className="field">
              <span className="field__label">Egy állat</span>
              <input name="animal" value={words.animal} onChange={update} placeholder="pl. zsiráf" />
            </label>
            <label className="field">
              <span className="field__label">Egy ige</span>
              <input name="verb" value={words.verb} onChange={update} placeholder="pl. táncolni" />
            </label>
          </div>
          <div className="actions">
            <button type="submit" className="button--primary" disabled={!complete}>
              Mutasd a történetet
            </button>
            <span className="progress" aria-live="polite">
              {filledCount} / {total} mező kitöltve
            </span>
          </div>
        </form>
      )}
    </main>
  )
}

export default App
```

- Az `Object.values(words)` a három szót adja egy tömbben, a `filter` megtartja közülük azokat, amelyek a `trim()`
  után sem üresek, a `length` pedig megszámolja őket. A 3. lecke jelölőnégyzeteinél ugyanígy számoltad meg a
  bepipáltakat. A `!==` jelentése „nem egyenlő”.
- Az `Object.keys(words)` a kulcsokat adja (`['name', 'animal', 'verb']`), ezek száma a mezők száma: 3.
- A `complete` akkor igaz, ha minden mező ki van töltve. Mindhárom érték származtatott, egyiket sem kell állapotban
  tárolni.
- A `disabled={!complete}` letiltja a gombot, amíg a `complete` hamis. Letiltott gombbal az Enter sem küldi be az
  űrlapot, a `reveal` mégis megnézi a `complete`-et: így a szabály magában a függvényben is ott van, nem csak a
  gombon.
- Az `aria-live="polite"` a 3. leckéből ismerős: a képernyőolvasók felolvassák a számlálót, amikor változik.

:::check Ellenőrizd
Mentés után a React megtartja a mezők tartalmát, ezért előbb frissítsd az oldalt (++F5++), hogy a mezők üresen
induljanak. A gomb szürke, mellette: „0 / 3 mező kitöltve”. Ahogy kitöltöd a mezőket, a szám nő, a harmadik szónál
pedig a gomb újra lila lesz, és működik. Írj az egyik mezőbe csak szóközöket: az nem számít bele. Ezzel kész a kezdő
szint: commitold!
:::

:::mistake Gyakori hiba
`word !== ''` a `trim()` nélkül. Ekkor már egyetlen szóköz is kitöltött mezőnek számít, és a történetben egy üres lyuk
marad a szó helyén.
:::

:::try Feladat
Ha már csak egy mező hiányzik, jelenjen meg a számláló mellett: „Már csak egy!”. Elég hozzá egy `&&` és egy feltétel:
`filledCount === total - 1`.
:::

## Középszint {level=2}

### Sablonból készülő mezők

Most a történet a kódba van beégetve, a mezőket pedig egyenként, kézzel írtuk meg. Egy új történethez három helyen
kellene átírni a kódot. Ennél sokkal jobb egy [[sablon]]: egy sima szöveg, amelyben a kitöltendő szavak helyén
kapcsos zárójelben a mező neve áll, például: `Egy {állat} szeretne {ige}.` A program maga keresi meg benne a mezőket,
és mindegyikhez készít egy szövegmezőt. Új történethez így elég egy új szöveg.

A sablont fel kell darabolnunk sima szövegre és mezőnevekre. Erre egy kis trükköt használunk. A `replaceAll('}', '{')`
minden `}` jelet `{` jelre cserél, a `split('{')` pedig a `{` jeleknél darabokra vágja a szöveget, és a darabokat egy
[[tömbben|tömb]] adja vissza:

```js
'Egy {állat} szeretne {ige}.'.replaceAll('}', '{')  // 'Egy {állat{ szeretne {ige{.'
'Egy {állat{ szeretne {ige{.'.split('{')            // ['Egy ', 'állat', ' szeretne ', 'ige', '.']
```

Nézd meg a tömböt: a sima szöveg és a mezőnevek felváltva követik egymást. A páros helyeken (0, 2, 4…) a sima szöveg
áll, a páratlanokon (1, 3, 5…) a mezők nevei. Ez akkor is így van, ha a sablon mezővel kezdődik: ilyenkor az első darab
egy üres szöveg. Hozd létre az `src` mappában a `template.js` fájlt:

```js file=src/template.js
// Egy sablon darabjai: minden } jelből { lesz, és a { jeleknél vágjuk szét.
// 'Egy {állat} szeretne {ige}.' → ['Egy ', 'állat', ' szeretne ', 'ige', '.']
// A páratlan helyeken (1, 3, 5…) a mezők nevei állnak, a párosakon a sima szöveg.
export function splitTemplate(text) {
  return text.replaceAll('}', '{').split('{')
}

// A sablon mezői, mindegyik csak egyszer, abban a sorrendben, ahogy először előfordulnak.
export function fieldsOf(text) {
  const names = splitTemplate(text).filter((part, i) => i % 2 === 1)
  return Array.from(new Set(names))
}

// A kész történet: minden mezőnév helyére a hozzá beírt szó kerül.
export function fillTemplate(text, words) {
  return splitTemplate(text)
    .map((part, i) => (i % 2 === 1 ? words[part] : part))
    .join('')
}
```

- A `filter` második paramétere, az `i`, megmondja, hányadik elemnél tartunk, ugyanúgy, mint a `map`-nél az
  erősségjelzőben. A `%` a [[modulo]], vagyis az osztás maradéka (a 3. lecke haladó szintjén már találkozhattál vele):
  az `5 % 2` értéke 1, a `4 % 2` értéke 0. Az `i % 2` tehát páratlan `i`-nél 1, párosnál 0, így az `i % 2 === 1` a
  páratlan helyeken igaz.
- Egy mező többször is szerepelhet a sablonban (a mi történetünkben az `{ige}` kétszer), de csak egyszer kell
  kitölteni. Erre jó a [[Set]] (halmaz). Ha megcsináltad a 3. lecke haladó szintjét, ott azért használtad, mert a
  `has` azonnal megmondja, benne van-e valami. Most egy másik tulajdonsága kell: minden értéket csak egyszer tárol, az
  ismétlődőket eldobja. Az `Array.from` a halmazból újra tömböt csinál, mert a `map`, a `filter` és a `length` tömbön
  működik, halmazon nem.
- A `fillTemplate` a darabokat végigjárja a `map`-pel: a mezőnevek helyére a szót teszi (`words[part]`), a sima szöveget
  meghagyja. A végén a `join('')` egyetlen szöveggé fűzi a darabokat. Ha egy mező még üres, a `words[part]` értéke
  `undefined`, de a `join` az `undefined`-ot üres szövegként fűzi be, így nem jelenik meg a történetben.

A történetek külön fájlba kerülnek: hozd létre az `src/stories.js`-t. Egyelőre egyetlen történet van benne, a kezdő
szint története, csak most sablonként:

```js file=src/stories.js
// A történetek sablonjai. A {kapcsos zárójelbe} írt szavak helyére kerülnek a játékos szavai.
// Ugyanaz a mező többször is szerepelhet: elég egyszer kitölteni.
export const STORIES = [
  {
    id: 'guest',
    title: 'A reggeli vendég',
    text:
      '{név} egy reggel arra ébredt, hogy egy {állat} ül az ágya szélén, és nagyon szeretne {ige}. ' +
      'Nem volt mit tenni: egész délelőtt együtt próbáltak {ige}, amíg a szomszédok tapsolni nem kezdtek.',
  },
]

// Példák a mezőkhöz: szürkén jelennek meg az üres mezőben.
export const HINTS = {
  név: 'pl. Bence',
  állat: 'pl. zsiráf',
  ige: 'pl. táncolni',
}
```

A mezőneveket kisbetűvel írjuk, ahogy a mondat közepén szokás. A címkéken mégis nagy kezdőbetűvel jelennek meg: ezt
az `App.css` intézi (`.field__label::first-letter`). A `HINTS` kulcsai most magyar, ékezetes szavak. Ezek nem
változónevek, hanem a sablon mezőnevei, vagyis a történet szövegének részei, és a JavaScript az ékezetes kulcsot is
elfogadja.

Most írd át az `src/App.jsx`-et, hogy a sablonból dolgozzon: a mezők egy `map`-pel készülnek a `fields` tömbből, a
történet pedig a `fillTemplate`-ből jön. A régi `story` szöveg és a `total` kimarad.

```jsx file=src/App.jsx mark=2-3,6-7,10,13-14,16-17,19,34-35,46-56,63
import { useState } from 'react'
import { HINTS, STORIES } from './stories.js'
import { fieldsOf, fillTemplate } from './template.js'
import './App.css'

// Egyelőre az első történettel játszunk.
const story = STORIES[0]

function App() {
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // A mezők a sablonból jönnek: ['név', 'állat', 'ige'].
  const fields = fieldsOf(story.text)
  // Hány mezőbe írtak már valamit? A csak szóközökből álló szó nem számít.
  const filledCount = fields.filter((field) => (words[field] || '').trim() !== '').length
  const complete = filledCount === fields.length

  // Egy függvény minden mezőhöz: a mező neve (name) mondja meg, melyik szót frissíti.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (complete) setRevealed(true)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      {revealed ? (
        <article className="story">
          <h2>{story.title}</h2>
          <p className="story__text">{fillTemplate(story.text, words)}</p>
          <div className="actions">
            <button type="button" onClick={() => setRevealed(false)}>
              Szavak módosítása
            </button>
          </div>
        </article>
      ) : (
        <form className="word-form" onSubmit={reveal}>
          <p className="hint">Írj be egy-egy szót! Hogy hová kerülnek, csak a végén derül ki.</p>
          <div className="fields">
            {fields.map((field) => (
              <label key={field} className="field">
                <span className="field__label">{field}</span>
                <input
                  name={field}
                  value={words[field] || ''}
                  onChange={update}
                  placeholder={HINTS[field]}
                />
              </label>
            ))}
          </div>
          <div className="actions">
            <button type="submit" className="button--primary" disabled={!complete}>
              Mutasd a történetet
            </button>
            <span className="progress" aria-live="polite">
              {filledCount} / {fields.length} mező kitöltve
            </span>
          </div>
        </form>
      )}
    </main>
  )
}

export default App
```

- A `words` most üres objektumként indul (`{}`), mert a mezők nevét nem mi írjuk be, hanem a sablonból derül ki.
- Amíg egy mezőbe nem írtak semmit, a `words[field]` értéke `undefined`. A `|| ''` jelentése: „vagy üres szöveg, ha
  nincs semmi”, ahogy az 1. lecke `useHashRoute`-jában a `|| '/'`. Így a mező mindig szöveget kap, és a `trim()` sem
  akad el az `undefined`-on.
- A `name={field}` miatt az `update` változatlanul működik: a kulcs most egy mezőnév, például `'állat'`.
- A `HINTS[field]` a mezőhöz tartozó példa. Ha egy mezőhöz nincs példa, az értéke `undefined`, és a mező egyszerűen
  példa nélkül jelenik meg.

:::check Ellenőrizd
Az oldal majdnem ugyanaz, mint eddig, de a címkék most a sablonból jönnek: „Név”, „Állat”, „Ige”, a kész történet
fölött pedig ott a címe, „A reggeli vendég”. Ha épp a történet látszik, lépj vissza a „Szavak módosítása” gombbal. Most
írj az `src/stories.js` szövegébe egy új mezőt, például `egy {állat}` helyett `egy {szín} {állat}`, és mentsd el:
megjelenik a negyedik mező, a számláló pedig már négy mezőt számol (ha a másik hármat kitöltötted, „3 / 4”). Utána
vedd ki.
:::

:::mistake Gyakori hiba
`value={words[field]}`, a `|| ''` nélkül. Amíg a mező üres, a `value` `undefined`, és ilyenkor a React
[[nem vezéreltnek|nem vezérelt mező]] tekinti a mezőt: a böngésző maga tárolja a szövegét. Az első betűnél vezéreltté
válik, és a konzolban (++F12++) figyelmeztetés jelenik meg: „A component is changing an uncontrolled input to be
controlled”. A `|| ''` miatt a mező az első pillanattól vezérelt.
:::

:::try Próbáld ki
Írd át a sablonban a második `{ige}`-t `{Ige}`-re. Két külön mező lesz belőle, „Ige” és „Ige” címkével: a gép csak a
pontosan egyforma neveket tekinti ugyanannak a mezőnek, a kis- és nagybetű is számít. Aztán írd vissza.
:::

### Több történet, véletlen választással

Egy történet hamar unalmas. Írd át az `src/stories.js`-t: két új történet kerül bele, és a `HINTS` is bővül az új
mezők példáival.

```js file=src/stories.js mark=11-26,34-40
// A történetek sablonjai. A {kapcsos zárójelbe} írt szavak helyére kerülnek a játékos szavai.
// Ugyanaz a mező többször is szerepelhet: elég egyszer kitölteni.
export const STORIES = [
  {
    id: 'guest',
    title: 'A reggeli vendég',
    text:
      '{név} egy reggel arra ébredt, hogy egy {állat} ül az ágya szélén, és nagyon szeretne {ige}. ' +
      'Nem volt mit tenni: egész délelőtt együtt próbáltak {ige}, amíg a szomszédok tapsolni nem kezdtek.',
  },
  {
    id: 'first-app',
    title: 'Az első React-app',
    text:
      '{név} megírta élete első React-appját: egy {melléknév} gombot, amitől minden kattintásra ' +
      '{szám} {állat} jelent meg a képernyőn. A mentora csak ennyit mondott: ' +
      '„{felkiáltás}! Ez nem hiba, hanem egy {szín} funkció.”',
  },
  {
    id: 'holiday',
    title: 'Nyaralás',
    text:
      'Idén nyáron {hely} nyaraltunk. Minden reggel {étel} volt a reggeli, a szomszédunk pedig, egy nyugdíjas ' +
      '{foglalkozás}, mindig {ige} kezdett, amikor meglátott minket. ' +
      'Hazafelé az egész busz ezt énekelte: „{felkiáltás}, {hely}!”',
  },
]

// Példák a mezőkhöz: szürkén jelennek meg az üres mezőben.
export const HINTS = {
  név: 'pl. Bence',
  állat: 'pl. zsiráf',
  ige: 'pl. táncolni',
  melléknév: 'pl. ragacsos',
  szám: 'pl. 42',
  felkiáltás: 'pl. Juhé',
  szín: 'pl. citromsárga',
  hely: 'pl. a hűtőben',
  étel: 'pl. palacsinta',
  foglalkozás: 'pl. tűzoltó',
}
```

Minden történetnek van egy `id`-ja: egy rövid, egyedi név, ami sosem változik, és amivel a kód hivatkozik rá. A
történetválasztó az űrlap fölé kerül, és chipekből áll, vagyis kis, lekerekített gombokból. Hozd létre az `src`
mappában a `components` mappát, benne a `StoryPicker.jsx` fájlt:

```jsx file=src/components/StoryPicker.jsx
function StoryPicker({ stories, selectedId, onSelect, onRandom }) {
  return (
    <div className="picker">
      <span className="picker__label">Válassz történetet</span>
      <div className="chips">
        {stories.map((story) => (
          <button
            key={story.id}
            type="button"
            className="chip"
            aria-pressed={story.id === selectedId}
            onClick={() => onSelect(story.id)}
          >
            {story.title}
          </button>
        ))}
        <button type="button" className="chip chip--random" onClick={onRandom}>
          Véletlen
        </button>
      </div>
    </div>
  )
}

export default StoryPicker
```

Az `aria-pressed` azt jelzi, hogy egy gomb be van-e nyomva, mint egy kapcsoló. A képernyőolvasók felolvassák
(„lenyomva”), az `App.css` pedig ez alapján színezi lilára a kiválasztott chipet. A választó nem tudja, melyik történet
az aktív: az `App` mondja meg neki a `selectedId` propban, és az `onSelect` függvénnyel szól vissza, ha a játékos
másikat választ. Ez a 3. leckéből ismert [[állapot felemelése]]: az állapot az `App`-ban él, mert a játéknak is
szüksége van rá.

Az `App`-ban a `STORIES[0]` helyére egy állapot kerül: a kiválasztott történet `id`-ja. **Töröld** a fájl elejéről a
`const story = STORIES[0]` sort a fölötte lévő megjegyzéssel együtt, tedd be a `StoryPicker` importját a többi import
alá, aztán írd át a függvény elejét és a `return` elejét így. A `…` kezdetű megjegyzések helyén minden marad, ahogy
volt:

```jsx file=src/App.jsx mark=4,8,12-13,18-23,28
import { useState } from 'react'
import { HINTS, STORIES } from './stories.js'
import { fieldsOf, fillTemplate } from './template.js'
import StoryPicker from './components/StoryPicker.jsx'
import './App.css'

function App() {
  const [storyId, setStoryId] = useState(STORIES[0].id)
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // A kiválasztott történet: az, amelyiknek egyezik az id-ja.
  const story = STORIES.find((item) => item.id === storyId)
  // A mezők a sablonból jönnek: ['név', 'állat', 'ige'].
  const fields = fieldsOf(story.text)
  // … a filledCount, a complete, az update és a reveal, mint eddig

  function pickRandom() {
    // Csak a többi történet közül sorsolunk, hogy biztosan másik jöjjön.
    const others = STORIES.filter((item) => item.id !== storyId)
    const next = others[Math.floor(Math.random() * others.length)]
    setStoryId(next.id)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <StoryPicker stories={STORIES} selectedId={storyId} onSelect={setStoryId} onRandom={pickRandom} />
      {/* … a történet vagy az űrlap, mint eddig … */}
    </main>
  )
}

export default App
```

- A `find` az 1. leckéből ismerős: az első olyan elemet adja vissza, amelyre a feltétel igaz.
- A `pickRandom` a 3. lecke [[Math.random]]-ját és [[Math.floor]]-ját használja egy véletlen sorszámhoz. Előbb
  kiszűri a mostani történetet, így a „Véletlen” gomb mindig másikat hoz.
- Az `onSelect={setStoryId}` magát a beállító függvényt adja át: a választó `onSelect(story.id)` hívása egyenesen a
  `setStoryId(story.id)`-t futtatja.

:::check Ellenőrizd
A cím alatt „Válassz történetet”, alatta négy chip: a három történet (az első lila) és a szaggatott keretű
„Véletlen”. Kattints a „Nyaralás”-ra: más mezők jelennek meg (Hely, Étel, Foglalkozás…). A „Véletlen” minden
kattintásra egy másik történetet választ.

Valami azonban furcsa. Válaszd újra „A reggeli vendég”-et, írj be egy nevet, és válts át „Az első React-app”-ra: a név
ott maradt, mert ebben a
történetben is van `{név}`. Sőt, ha egy történet már látszik, és ekkor választasz másikat, rögtön az új történet
jelenik meg, félig üres lyukakkal. A következő lépésben ezt rendbe tesszük.
:::

:::mistake Gyakori hiba
`others` helyett az egész `STORIES` tömbből sorsolni. Akkor a „Véletlen” háromból egyszer ugyanazt a történetet adja,
és úgy tűnik, mintha a gomb nem csinálna semmit.
:::

:::try Feladat
Írj egy negyedik történetet a `STORIES` tömb végére, saját `id`-val, címmel és mezőkkel. A választóban magától
megjelenik a chipje, a mezői pedig a sablonjából készülnek: egyetlen sort sem kell hozzá a komponensekben írnod.
:::

### Tiszta lap: key és újrakezdés

Miért maradtak meg a szavak? Mert a `words` és a `revealed` az `App` állapota, az `App` pedig ugyanaz marad, akármelyik
történetet választod. A megoldás: a játék saját komponenst kap, a `MadLib`-et, és ezt a történet `id`-jával
megjelöljük.

A [[key]] már ismerős: az 1. leckében a listaelemek kapták, a 3.-ban pedig a másológomb, hogy új jelszónál tiszta
lappal induljon. Rajzoláskor a React összeveti az új JSX-et az előzővel, és ha ugyanazon a helyen ugyanolyan
komponenst talál, megtartja az állapotát. Ha viszont a `key` megváltozik, a React úgy veszi, hogy ez egy másik
komponens: a régit az állapotával együtt eldobja, és egy vadonatújat hoz létre, friss kezdőállapottal. Ha tehát a
`MadLib` a történet `id`-ját kapja `key`-nek, minden történet tiszta lappal indul.

Hozd létre az `src/components/MadLib.jsx` fájlt. A tartalma nagyrészt az `App`-ból költözik át, és kap egy
„Újrakezdés” gombot is. A fájl a `components` mappában van, ezért az importokban a `..` előbb egy mappát feljebb lép,
az `src`-be, ahogy a 3. leckében:

```jsx file=src/components/MadLib.jsx mark=5,25-29,31-46
import { useState } from 'react'
import { HINTS } from '../stories.js'
import { fieldsOf, fillTemplate } from '../template.js'

function MadLib({ story }) {
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // A mezők a sablonból jönnek: ['név', 'állat', 'ige'].
  const fields = fieldsOf(story.text)
  // Hány mezőbe írtak már valamit? A csak szóközökből álló szó nem számít.
  const filledCount = fields.filter((field) => (words[field] || '').trim() !== '').length
  const complete = filledCount === fields.length

  // Egy függvény minden mezőhöz: a mező neve (name) mondja meg, melyik szót frissíti.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (complete) setRevealed(true)
  }

  // Újrakezdés: üres mezők, és újra az űrlap látszik.
  function restart() {
    setWords({})
    setRevealed(false)
  }

  if (revealed) {
    return (
      <article className="story">
        <h2>{story.title}</h2>
        <p className="story__text">{fillTemplate(story.text, words)}</p>
        <div className="actions">
          <button type="button" onClick={() => setRevealed(false)}>
            Szavak módosítása
          </button>
          <button type="button" onClick={restart}>
            Újrakezdés
          </button>
        </div>
      </article>
    )
  }

  return (
    <form className="word-form" onSubmit={reveal}>
      <p className="hint">Írj be egy-egy szót! Hogy hová kerülnek, csak a végén derül ki.</p>
      <div className="fields">
        {fields.map((field) => (
          <label key={field} className="field">
            <span className="field__label">{field}</span>
            <input
              name={field}
              value={words[field] || ''}
              onChange={update}
              placeholder={HINTS[field]}
            />
          </label>
        ))}
      </div>
      <div className="actions">
        <button type="submit" className="button--primary" disabled={!complete}>
          Mutasd a történetet
        </button>
        <span className="progress" aria-live="polite">
          {filledCount} / {fields.length} mező kitöltve
        </span>
      </div>
    </form>
  )
}

export default MadLib
```

A `? :` helyett itt egy [[korai visszatérés]] dönt: ha a `revealed` igaz, a függvény már az `if`-en belül visszaadja a
történetet, és a lenti `return`-ig el sem jut. Az 1. lecke űrlapja is így mutatta a köszönetet (`if (sent) return …`).
Hosszabb JSX-nél ez könnyebben olvasható, mint egy nagy `? :`. Az `App` pedig jóval rövidebb lesz. Itt a teljes
`src/App.jsx`:

```jsx file=src/App.jsx mark=4,24-25
import { useState } from 'react'
import { STORIES } from './stories.js'
import StoryPicker from './components/StoryPicker.jsx'
import MadLib from './components/MadLib.jsx'
import './App.css'

function App() {
  const [storyId, setStoryId] = useState(STORIES[0].id)

  // A kiválasztott történet: az, amelyiknek egyezik az id-ja.
  const story = STORIES.find((item) => item.id === storyId)

  function pickRandom() {
    // Csak a többi történet közül sorsolunk, hogy biztosan másik jöjjön.
    const others = STORIES.filter((item) => item.id !== storyId)
    const next = others[Math.floor(Math.random() * others.length)]
    setStoryId(next.id)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <StoryPicker stories={STORIES} selectedId={storyId} onSelect={setStoryId} onRandom={pickRandom} />
      {/* A key miatt minden történet tiszta lappal indul: új key, új MadLib, üres állapot. */}
      <MadLib key={story.id} story={story} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Írj be pár szót, és válts történetet: az új történet mezői üresek. Válts vissza: a régi szavak is eltűntek, mert az a
`MadLib` már nem létezik. Töltsd ki a mezőket, nézd meg a történetet, és kattints az „Újrakezdés” gombra: ugyanannak a
történetnek az üres űrlapja jön vissza.
:::

:::mistake Gyakori hiba
Kimarad a `key`: `<MadLib story={story} />`. A React ugyanazon a helyen ugyanolyan komponenst talál, ezért megtartja
az állapotát: a beírt szavak és a `revealed` átjönnek a másik történetbe, pont úgy, mint az előző lépésben. A `key`
mondja meg a Reactnek, mikor kell tiszta lap: itt akkor, amikor másik történetet választanak.
:::

:::try Feladat
Kerüljön egy „Másik történet” gomb is az „Újrakezdés” mellé. Add át a `pickRandom`-ot a `MadLib`-nek egy propban
(például `onRandom`), és a gomb `onClick`-je hívja meg. Mivel ilyenkor másik történet jön, a `MadLib` új `key`-t kap,
és magától tiszta lappal indul.
:::

### Kiemelt szavak

Az a legviccesebb a Mad Libsben, amikor látod, hová kerültek a saját szavaid. Emeljük ki őket a történetben! A szöveg
közepén egy szót a `<mark>` HTML-elem emel ki. Csakhogy a `fillTemplate` egyetlen hosszú szöveget ad vissza, abba pedig
nem lehet elemet tenni. Ezért most nem fűzzük össze a darabokat, hanem egyenként jelenítjük meg őket: a sima szöveget
szövegként, a mezőket `<mark>`-ban. A történet saját komponenst kap: hozd létre az `src/components/Story.jsx` fájlt.

```jsx file=src/components/Story.jsx mark=8-17
import { splitTemplate } from '../template.js'

function Story({ story, words, onEdit, onRestart }) {
  return (
    <article className="story">
      <h2>{story.title}</h2>
      <p className="story__text">
        {/* A páratlan helyeken (1, 3, 5…) a mezők állnak: ott a játékos szava jön, kiemelve. */}
        {splitTemplate(story.text).map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} title={part}>
              {words[part]}
            </mark>
          ) : (
            part
          ),
        )}
      </p>
      <div className="actions">
        <button type="button" onClick={onEdit}>
          Szavak módosítása
        </button>
        <button type="button" onClick={onRestart}>
          Újrakezdés
        </button>
      </div>
    </article>
  )
}

export default Story
```

A `map` most vegyes tömböt ad: szövegeket és `<mark>` elemeket. A React mindkettőt meg tudja jeleníteni, egymás után.
A `key` csak az elemeknek kell, a sima szövegeknek nem. Kulcsnak most a sorszám (`i`) is jó, mert a darabok sorrendje
sosem változik. A `title` egy kis buborékot ad: ha az egeret egy kiemelt szó fölé viszed, kiírja a mező nevét.

A gombok függvényei a `MadLib`-ben maradnak, a `Story` csak meghívja őket: az `onEdit` és az `onRestart` propban
kapja meg őket. Itt az `src/components/MadLib.jsx`, ahogy a középszint végén kinéz:

```jsx file=src/components/MadLib.jsx mark=3-4,32-41
import { useState } from 'react'
import { HINTS } from '../stories.js'
import { fieldsOf } from '../template.js'
import Story from './Story.jsx'

function MadLib({ story }) {
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // A mezők a sablonból jönnek: ['név', 'állat', 'ige'].
  const fields = fieldsOf(story.text)
  // Hány mezőbe írtak már valamit? A csak szóközökből álló szó nem számít.
  const filledCount = fields.filter((field) => (words[field] || '').trim() !== '').length
  const complete = filledCount === fields.length

  // Egy függvény minden mezőhöz: a mező neve (name) mondja meg, melyik szót frissíti.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (complete) setRevealed(true)
  }

  // Újrakezdés: üres mezők, és újra az űrlap látszik.
  function restart() {
    setWords({})
    setRevealed(false)
  }

  if (revealed) {
    return (
      <Story
        story={story}
        words={words}
        onEdit={() => setRevealed(false)}
        onRestart={restart}
      />
    )
  }

  return (
    <form className="word-form" onSubmit={reveal}>
      <p className="hint">Írj be egy-egy szót! Hogy hová kerülnek, csak a végén derül ki.</p>
      <div className="fields">
        {fields.map((field) => (
          <label key={field} className="field">
            <span className="field__label">{field}</span>
            <input
              name={field}
              value={words[field] || ''}
              onChange={update}
              placeholder={HINTS[field]}
            />
          </label>
        ))}
      </div>
      <div className="actions">
        <button type="submit" className="button--primary" disabled={!complete}>
          Mutasd a történetet
        </button>
        <span className="progress" aria-live="polite">
          {filledCount} / {fields.length} mező kitöltve
        </span>
      </div>
    </form>
  )
}

export default MadLib
```

:::check Ellenőrizd
A kész történetben a te szavaid halványlila háttérrel, félkövéren állnak. Vidd az egeret az egyik fölé: egy
buborék kiírja, melyik mezőből jött („állat”). Ha egy mező kétszer szerepel, mindkét helyen ki van emelve. Ezzel kész a
középszint: commitold!
:::

:::mistake Gyakori hiba
A kiemelést szövegként összefűzni: `'<mark>' + word + '</mark>'`. A React minden szöveget szövegként jelenít meg, így
a `<mark>` betű szerint, kacsacsőrökkel együtt látszik a történetben. Ez szándékos védelem: ha a React a beírt szöveget
HTML-ként értelmezné, egy rosszindulatú „szó” kódot csempészhetne az oldalba. Elemet csak JSX-szel tudsz készíteni.
:::

:::try Próbáld ki
Írj egy történetet, amelyben a `{név}` háromszor szerepel. A nevet csak egyszer kell beírni, a kész történetben mégis
mindhárom helyen kiemelve jelenik meg.
:::

## Haladó szint {level=3}

### Saját sablon írása

Eddig a történeteket a kódban írtuk. Most a játékos is írhat sajátot, ugyanúgy, kapcsos zárójeles mezőkkel. Egy
szövegdobozba írja a sablont, és ahogy gépel, alatta azonnal megjelennek a mezői.

Egy saját sablon el is romolhat: kimaradhat belőle egy zárójel, vagy nincs benne egyetlen mező sem. Ezért kell egy ellenőrző
függvény. Írd az `src/template.js` végére:

```js file=src/template.js
// Mi a baj a sablonnal? Üres szöveget ad vissza, ha minden rendben van.
export function templateProblem(text) {
  // Ha egy szöveget a { jeleknél vágunk szét, eggyel több darabot kapunk, mint ahány { van benne.
  const opens = text.split('{').length - 1
  const closes = text.split('}').length - 1
  if (opens !== closes) return 'Valamelyik { vagy } jelnek hiányzik a párja.'

  const fields = fieldsOf(text)
  if (fields.length === 0) return 'Tegyél a szövegbe legalább egy mezőt, például így: {főnév}.'
  if (fields.some((field) => field.trim() === '')) return 'Az egyik { } üres: írj bele egy szót.'
  return ''
}
```

A `some` a `filter` rokona: azt mondja meg, van-e **legalább egy** elem, amire a feltétel igaz. Az ellenőrzés egyszerű,
nem fog meg minden furcsaságot, de a gyakori hibákat igen.

A szövegdoboz egy `<textarea>`, ami ugyanúgy vezérelt mező lehet, mint egy `<input>`: `value` és `onChange`. Hozd létre
az `src/components/StoryEditor.jsx` fájlt:

```jsx file=src/components/StoryEditor.jsx mark=10,12
import { fieldsOf, templateProblem } from '../template.js'

function StoryEditor({ text, onChange }) {
  const problem = templateProblem(text)

  return (
    <div className="editor">
      <label className="field">
        <span className="field__label">A saját történeted</span>
        <textarea value={text} onChange={(event) => onChange(event.target.value)} />
      </label>
      <p className="hint">A mezőket kapcsos zárójelbe írd, például így: {'{főnév}'}</p>
      {problem ? (
        <p className="editor__problem" role="alert">
          {problem}
        </p>
      ) : (
        <p className="editor__fields">Mezők: {fieldsOf(text).join(', ')}</p>
      )}
    </div>
  )
}

export default StoryEditor
```

Figyeld meg a `{'{főnév}'}` részt. A JSX-ben a kapcsos zárójel azt jelenti: „itt JavaScript jön”. Ha a szövegben magát
a kapcsos zárójelet akarod megmutatni, tedd egy stringbe, és a stringet tedd kapcsos zárójelbe. A `problem ? … : …`
azért működik, mert az üres szöveg a feltételben hamisnak számít, mint az 1. lecke űrlapjának `{error && …}` részében:
ha nincs baj, a mezők listája látszik, ha van, a hibaüzenet. A `role="alert"` miatt a képernyőolvasó azonnal
felolvassa a hibát, amikor megjelenik.

A saját történet ugyanolyan alakú objektum lesz, mint a kész történetek (`id`, `title`, `text`), csak a szövege egy
állapotból jön. Ha a többi mellé tesszük egy tömbbe, a választó magától kirajzolja a chipjét, a `MadLib` pedig
ugyanúgy játszik vele, mint bármelyik másikkal. Itt az új `src/App.jsx`:

```jsx file=src/App.jsx mark=3,5,9-11,15,17-20,23,32-35
import { useState } from 'react'
import { STORIES } from './stories.js'
import { templateProblem } from './template.js'
import StoryPicker from './components/StoryPicker.jsx'
import StoryEditor from './components/StoryEditor.jsx'
import MadLib from './components/MadLib.jsx'
import './App.css'

const START_TEMPLATE =
  'Hol volt, hol nem volt, volt egyszer egy {melléknév} {állat}, ' +
  'aki mindennél jobban szeretett {ige}.'

function App() {
  const [storyId, setStoryId] = useState(STORIES[0].id)
  const [customText, setCustomText] = useState(START_TEMPLATE)

  // A saját történet ugyanolyan alakú, mint a többi: id, title, text.
  const customStory = { id: 'custom', title: 'Saját történet', text: customText }
  const stories = [...STORIES, customStory]
  const story = stories.find((item) => item.id === storyId)

  function pickRandom() {
    // Csak a kész történetek közül sorsolunk, és mindig másikat.
    const others = STORIES.filter((item) => item.id !== storyId)
    const next = others[Math.floor(Math.random() * others.length)]
    setStoryId(next.id)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <StoryPicker stories={stories} selectedId={storyId} onSelect={setStoryId} onRandom={pickRandom} />
      {storyId === 'custom' && <StoryEditor text={customText} onChange={setCustomText} />}
      {/* Hibás sablonból nem lehet játszani: amíg baj van vele, a mezők nem jelennek meg. */}
      {templateProblem(story.text) === '' && <MadLib key={story.id} story={story} />}
    </main>
  )
}

export default App
```

- A `[...STORIES, customStory]` a [[spread]] tömbös változata: a `STORIES` minden elemét átmásolja egy új tömbbe, és a
  végére teszi a saját történetet. A `STORIES` maga nem változik.
- A választó mostantól a `stories`-t kapja (benne a saját történettel) a `STORIES` helyett: `stories={stories}`. Ettől
  jelenik meg a chipje.
- A `customStory` származtatott érték: minden rajzoláskor a friss `customText`-ből készül. Ahogy gépelsz, a `MadLib`
  minden betűnél az új sablont kapja, és újraszámolja belőle a mezőket.
- A `key` közben végig `'custom'` marad, ezért a sablon szerkesztése nem törli a már beírt szavakat. Ha viszont a sablon
  hibás lesz, a `MadLib` eltűnik, és vele együtt a szavai is.
- A `pickRandom` továbbra is csak a kész `STORIES` közül sorsol.

:::check Ellenőrizd
Közvetlenül a „Véletlen” előtt megjelent egy új chip: „Saját történet”. Kattints rá: egy szürke dobozban ott a kezdő
sablon, alatta: „Mezők: melléknév, állat, ige”, lent pedig a három mező. Írd a szöveg végére, hogy `{szín}`. Amíg a
zárójel nyitva van, piros üzenet látszik, és a mezők eltűnnek; amint bezárod, visszajönnek, egy új mezővel együtt.
Törölj ki egy `}` jelet: megint a piros üzenet jön; tedd vissza, és a mezők visszajönnek.
:::

:::mistake Gyakori hiba
Kapcsos zárójel a JSX szövegében: `<p>Például így: {főnév}</p>`. A React ezt kódnak veszi, és a `főnév` nevű változót
keresi, ami nem létezik: az oldal üres lesz, a konzolban pedig „főnév is not defined” hibát látsz. A szövegbe szánt
kapcsos zárójelet stringbe kell tenni: `{'{főnév}'}`.
:::

:::try Feladat
Legyen a sablon legfeljebb 500 karakter. A `<textarea>` kapjon egy `maxLength={500}` attribútumot, a dobozban pedig
egy számláló mutassa, hol tartasz: `{text.length} / 500`.
:::

### Megosztható link

A saját történetet jó lenne elküldeni egy barátodnak, hogy ő is kitölthesse. Szerver nélkül is megoldható: a sablon
belekerül a linkbe. Az 1. leckében a cím `#` utáni részét használtad az oldalak közötti váltáshoz. Ugyanide most a
sablon kerül: `http://localhost:5173/#story=Hol%20volt…`. A `#` utáni rész sosem jut el a szerverhez, a böngészőben
marad, és a JavaScript a `window.location.hash`-ből olvassa ki.

A linkben nem lehet akármilyen karakter: a szóköz, az ékezetes betűk, a `#` vagy az `&` összezavarhatja a böngészőt.
Az `encodeURIComponent` ezeket biztonságos kódokká alakítja ([[URL-kódolás]]): a szóközből `%20` lesz, az `á`-ból
`%C3%A1`. A `decodeURIComponent` visszafelé dolgozik, de ha a kód hibás (valaki elrontotta a linket), hibát dob,
ezért a 3. leckéből ismert [[try/catch]] kapja el. Hozd létre az `src/share.js` fájlt:

```js file=src/share.js
const PREFIX = '#story='

// A teljes cím, a végén a sablonnal: ezt lehet elküldeni.
export function shareLink(text) {
  return window.location.origin + window.location.pathname + PREFIX + encodeURIComponent(text)
}

// Ha a cím egy megosztott sablont hoz, visszaadja a szövegét; ha nem, null-t.
export function sharedTemplate() {
  const hash = window.location.hash
  if (!hash.startsWith(PREFIX)) return null
  try {
    return decodeURIComponent(hash.slice(PREFIX.length))
  } catch {
    return null // elrontott link: nem tudjuk visszafejteni
  }
}
```

A `window.location.origin` a cím eleje (`http://localhost:5173`), a `pathname` az utána következő elérési út (`/`). A
`startsWith` megmondja, hogy a szöveg egy adott szöveggel kezdődik-e, a `slice(PREFIX.length)` pedig levágja az elejéről
a `#story=` részt. A `null` jelentése: „nincs semmi”.

A linket a vágólapra másoljuk, ugyanúgy, mint a 3. leckében a jelszót. A gomb majdnem ugyanaz, mint ott a
`CopyButton`: a feliratai mások, két másodpercig mutatja a visszajelzést, és nem magát a `text`-et, hanem a belőle
készült linket másolja. Hozd létre az `src/components/ShareButton.jsx` fájlt:

```jsx file=src/components/ShareButton.jsx
import { useEffect, useState } from 'react'
import { shareLink } from '../share.js'

function ShareButton({ text }) {
  const [status, setStatus] = useState('idle') // 'idle', 'copied' vagy 'failed'

  // Két másodperccel a másolás után a felirat visszaáll.
  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 2000)
    return () => clearTimeout(timer)
  }, [status])

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareLink(text))
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = 'Link másolása'
  if (status === 'copied') label = 'Link kimásolva!'
  if (status === 'failed') label = 'Nem sikerült másolni'

  return (
    <button type="button" onClick={copy}>
      {label}
    </button>
  )
}

export default ShareButton
```

A gomb a szerkesztőbe kerül, a mezők listája mellé. Hibás sablont nincs értelme megosztani, ezért csak akkor látszik,
ha nincs baj. Itt a teljes `src/components/StoryEditor.jsx`:

```jsx file=src/components/StoryEditor.jsx mark=2,19-22
import { fieldsOf, templateProblem } from '../template.js'
import ShareButton from './ShareButton.jsx'

function StoryEditor({ text, onChange }) {
  const problem = templateProblem(text)

  return (
    <div className="editor">
      <label className="field">
        <span className="field__label">A saját történeted</span>
        <textarea value={text} onChange={(event) => onChange(event.target.value)} />
      </label>
      <p className="hint">A mezőket kapcsos zárójelbe írd, például így: {'{főnév}'}</p>
      {problem ? (
        <p className="editor__problem" role="alert">
          {problem}
        </p>
      ) : (
        <div className="actions">
          <p className="editor__fields">Mezők: {fieldsOf(text).join(', ')}</p>
          <ShareButton text={text} />
        </div>
      )}
    </div>
  )
}

export default StoryEditor
```

Végül a másik oldal: aki a linket megnyitja, annak az oldal rögtön a saját történettel induljon. Ezt az `App` két
állapotának kezdőértéke dönti el. Az `src/App.jsx` elején egészítsd ki az importokat, és írd át a két `useState`-et;
a többi marad:

```jsx file=src/App.jsx mark=1,5-7
import { sharedTemplate } from './share.js'
// … a többi import és a START_TEMPLATE, mint eddig

function App() {
  // Ha a cím egy megosztott sablont hoz (#story=…), azzal indulunk.
  const [storyId, setStoryId] = useState(() => (sharedTemplate() ? 'custom' : STORIES[0].id))
  const [customText, setCustomText] = useState(() => sharedTemplate() || START_TEMPLATE)
  // … minden más, mint eddig
```

Mindkét `useState` egy függvényt kap: ez a 3. leckéből ismert [[lusta kezdőérték]]. A React csak az első rajzoláskor
hívja meg, így a címet is csak egyszer, induláskor olvassuk ki. Ha nincs megosztott sablon, a `sharedTemplate()`
`null`-t ad, ami a feltételben hamisnak számít: ilyenkor az első történet és a kezdő sablon marad.

:::check Ellenőrizd
Válaszd a „Saját történet”-et, írj egy rövid sablont, és kattints a „Link másolása” gombra: a felirat „Link
kimásolva!”, két másodperc múlva pedig újra „Link másolása”. Nyiss egy új böngészőlapot, illeszd be a címsorba
(++Ctrl++ + ++V++), és nyomj ++Enter++-t: az oldal rögtön a „Saját történet”-tel nyílik meg, a te sablonoddal és a
mezőivel.
:::

:::mistake Gyakori hiba
A linket ugyanabba a lapba illeszted be, amelyikben az oldal már nyitva van, és nem történik semmi. Ha a címben csak a
`#` utáni rész változik, a böngésző nem tölti újra az oldalt, az `App` pedig a kezdőértékét csak induláskor olvassa ki.
Nyomj ++F5++-öt, vagy nyisd meg új lapon. (Ha az oldalnak menet közben is követnie kellene a cím változását, a
`hashchange` eseményre kellene figyelnie, ahogy az 1. lecke `useHashRoute`-ja tette.)
:::

:::try Feladat
A barátod a linkről érkezve még látja a sablont, vagyis tudja, hová kerülnek a szavai. Rejtsd el előle! Az `App`-ban
jegyezd meg, hogy linkről jött-e: `const [fromLink] = useState(() => sharedTemplate() !== null)`, és a
`StoryEditor` csak akkor jelenjen meg, ha nem onnan jött: `storyId === 'custom' && !fromLink && …`.
:::

### Felolvasás

A kész történet felolvasva még viccesebb. A böngészőnek van beépített hangja: a [[Speech Synthesis API]]
(beszédszintézis). Két része van:

- A `SpeechSynthesisUtterance` egy „mondanivaló”: a felolvasandó szöveg és a beállításai, például a nyelve
  (`lang`), a sebessége (`rate`) és a hangmagassága (`pitch`). Eseményei is vannak: az `onend` akkor fut le, amikor a
  felolvasás véget ér, az `onerror` akkor, ha megszakad.
- A `speechSynthesis` maga a felolvasó: a `speak(…)` felolvassa a mondanivalót, a `cancel()` elhallgattatja.

Nem minden böngésző tud felolvasni. Ezért előbb megnézzük, létezik-e a `speechSynthesis`: ez a [[funkcióészlelés]].
A vizsgálat így szól: `'speechSynthesis' in window`. Ez akkor igaz, ha a `window` objektumnak van ilyen nevű kulcsa.
Ha nincs, a gomb meg sem jelenik. Hozd létre az `src/components/ReadAloudButton.jsx` fájlt:

```jsx file=src/components/ReadAloudButton.jsx
import { useEffect, useState } from 'react'

// Nem minden böngésző tud felolvasni: ha ez hamis, a gomb meg sem jelenik.
const CAN_SPEAK = 'speechSynthesis' in window

function ReadAloudButton({ text }) {
  const [speaking, setSpeaking] = useState(false)

  // Takarítás: ha a gomb eltűnik (például újrakezded), a felolvasás is álljon le.
  useEffect(() => {
    return () => {
      if (CAN_SPEAK) speechSynthesis.cancel()
    }
  }, [])

  function toggle() {
    if (speaking) {
      speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'hu-HU'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  if (!CAN_SPEAK) return null

  return (
    <button type="button" onClick={toggle}>
      {speaking ? 'Állj' : 'Felolvasás'}
    </button>
  )
}

export default ReadAloudButton
```

- A `speaking` állapot dönti el a gomb feliratát: felolvasás közben „Állj”, egyébként „Felolvasás”. Ha felolvasás
  közben kattintasz, a `toggle` elhallgattatja a böngészőt.
- A `useEffect` üres [[függőségi tömbbel|függőségi tömb]] csak egyszer fut le, amikor a gomb megjelenik. Nem csinál
  semmit, csak visszaad egy [[takarító függvényt|takarító függvény]], amit a React akkor hív meg, amikor a gomb eltűnik.
- A `return null` azt jelenti: ez a komponens most nem rajzol semmit. A `return null` a hookok **után** áll: az 1.
  lecke szabálya szerint a hookok mindig ugyanabban a sorrendben, feltétel nélkül futnak.

A gomb a történet alá kerül, a másik kettő mellé. A felolvasáshoz egyetlen szöveg kell, nem darabok, ezért itt újra
hasznát vesszük a `fillTemplate`-nek. Itt a teljes `src/components/Story.jsx`:

```jsx file=src/components/Story.jsx mark=1-2,21
import { fillTemplate, splitTemplate } from '../template.js'
import ReadAloudButton from './ReadAloudButton.jsx'

function Story({ story, words, onEdit, onRestart }) {
  return (
    <article className="story">
      <h2>{story.title}</h2>
      <p className="story__text">
        {/* A páratlan helyeken (1, 3, 5…) a mezők állnak: ott a játékos szava jön, kiemelve. */}
        {splitTemplate(story.text).map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} title={part}>
              {words[part]}
            </mark>
          ) : (
            part
          ),
        )}
      </p>
      <div className="actions">
        <ReadAloudButton text={fillTemplate(story.text, words)} />
        <button type="button" onClick={onEdit}>
          Szavak módosítása
        </button>
        <button type="button" onClick={onRestart}>
          Újrakezdés
        </button>
      </div>
    </article>
  )
}

export default Story
```

:::check Ellenőrizd
A kész történet alatt három gomb van: „Felolvasás”, „Szavak módosítása”, „Újrakezdés”. Kapcsold be a hangszórót, és
kattints a „Felolvasás”-ra: a gép felolvassa a történetet, a gomb felirata pedig „Állj” lesz. Kattints rá: elhallgat. Indítsd
újra, és felolvasás közben kattints a „Szavak módosítása” gombra: a felolvasás azonnal abbamarad.
:::

:::mistake Gyakori hiba
Kimarad a takarítás. Akkor a felolvasás tovább szól, miután visszaléptél az űrlapra, sőt egy másik történet közben is:
a böngésző felolvasója független a Reacttől, és magától nem tudja, hogy a gomb már nincs az oldalon.
:::

:::concept Milyen hangon olvas?
A hangokat az operációs rendszer és a böngésző adja, ezért gépenként mások. A `lang = 'hu-HU'` magyar hangot kér; ha a
gépeden nincs ilyen, a böngésző egy másikat választ, és a történet furcsa, idegen akcentussal szól. Windowson a
**Gépház → Idő és nyelv → Beszéd** alatt adhatsz hozzá magyar hangot.
:::

:::try Próbáld ki
A `speak` előtt állítsd be: `utterance.rate = 1.4` (gyorsabb) és `utterance.pitch = 2` (magasabb hang). A
`pitch` 0 és 2 között, a `rate` 0,1 és 10 között állítható.
:::

### Kétjátékos mód

A Mad Libs eredetileg társasjáték: az egyik játékos sorban kéri a szavakat („Mondj egy állatot!”), a többiek bemondják
őket, és csak a végén derül ki, milyen történetbe kerültek. Nálunk két játékos felváltva tölti ki a mezőket ugyanazon
a gépen. Egyszerre csak egy mező látszik, így senki sem látja, mit írt a másik, és a történet mindkettőjüknek
meglepetés.

A körökhöz egy szám kell: hányadik mezőnél tartunk (`turn`). Ebből minden más kiszámolható: melyik a mező
(`fields[turn]`), és ki jön. A páros sorszámú mezők (0, 2, 4…) az 1. játékoséi, a páratlanok a 2.-éi:
`(turn % 2) + 1` értéke 1, 2, 1, 2… Hozd létre az `src/components/TurnForm.jsx` fájlt:

```jsx file=src/components/TurnForm.jsx
import { useState } from 'react'
import { HINTS } from '../stories.js'

// Két játékos felváltva tölti ki a mezőket. Egyszerre csak egy mező látszik,
// így senki sem látja, mit írt a másik.
function TurnForm({ fields, words, onUpdate, onDone }) {
  const [turn, setTurn] = useState(0) // hányadik mezőnél tartunk (0-tól)

  const field = fields[turn]
  const word = words[field] || ''
  const player = (turn % 2) + 1 // 1, 2, 1, 2…
  const isLast = turn === fields.length - 1

  function next(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (word.trim() === '') return
    if (isLast) onDone()
    else setTurn(turn + 1)
  }

  return (
    <form className={`turn player-${player}`} onSubmit={next}>
      <p className="turn__player">{player}. játékos következik</p>
      <p className="hint">
        A másik játékos ne nézzen ide! Mező: {turn + 1} / {fields.length}
      </p>
      <label className="field">
        <span className="field__label">{field}</span>
        <input
          key={field}
          name={field}
          value={word}
          onChange={onUpdate}
          placeholder={HINTS[field]}
          autoFocus
        />
      </label>
      <div className="actions">
        <button type="submit" className="button--primary" disabled={word.trim() === ''}>
          {isLast ? 'Mutasd a történetet' : 'Tovább'}
        </button>
      </div>
    </form>
  )
}

export default TurnForm
```

- A szavakat nem a `TurnForm` tárolja: az `onUpdate` a `MadLib` `update` függvénye, így a szavak ugyanoda kerülnek,
  mint egyjátékos módban. A `TurnForm` csak azt tudja, hányadik mezőnél tartunk.
- Az osztálynév egy template literal, fordított aposztrófok között: a `turn player-${player}` értéke `'turn player-1'`
  vagy `'turn player-2'`. Az `App.css` ebből tudja, hogy türkiz vagy sárga legyen a kártya.
- Az `autoFocus` az új mezőbe teszi a kurzort, így a játékos rögtön gépelhet. A `key={field}` miatt minden körben új
  `<input>` jön létre, és az `autoFocus` újra működik.
- Az `if (isLast) onDone()` és az `else` egysoros `if … else`: ha ez volt az utolsó mező, jöhet a történet; ha nem, a
  következő mező.

A `MadLib`-ben egy új ág kerül a korai visszatérések közé: két játékosnál a `TurnForm` jelenik meg a sima űrlap helyett.
Itt a teljes `src/components/MadLib.jsx`:

```jsx file=src/components/MadLib.jsx mark=5,7,44-47
import { useState } from 'react'
import { HINTS } from '../stories.js'
import { fieldsOf } from '../template.js'
import Story from './Story.jsx'
import TurnForm from './TurnForm.jsx'

function MadLib({ story, players }) {
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // A mezők a sablonból jönnek: ['név', 'állat', 'ige'].
  const fields = fieldsOf(story.text)
  // Hány mezőbe írtak már valamit? A csak szóközökből álló szó nem számít.
  const filledCount = fields.filter((field) => (words[field] || '').trim() !== '').length
  const complete = filledCount === fields.length

  // Egy függvény minden mezőhöz: a mező neve (name) mondja meg, melyik szót frissíti.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (complete) setRevealed(true)
  }

  // Újrakezdés: üres mezők, és újra az űrlap látszik.
  function restart() {
    setWords({})
    setRevealed(false)
  }

  if (revealed) {
    return (
      <Story
        story={story}
        words={words}
        onEdit={() => setRevealed(false)}
        onRestart={restart}
      />
    )
  }

  // Két játékosnál felváltva, mezőnként töltik ki.
  if (players === 2) {
    return <TurnForm fields={fields} words={words} onUpdate={update} onDone={() => setRevealed(true)} />
  }

  return (
    <form className="word-form" onSubmit={reveal}>
      <p className="hint">Írj be egy-egy szót! Hogy hová kerülnek, csak a végén derül ki.</p>
      <div className="fields">
        {fields.map((field) => (
          <label key={field} className="field">
            <span className="field__label">{field}</span>
            <input
              name={field}
              value={words[field] || ''}
              onChange={update}
              placeholder={HINTS[field]}
            />
          </label>
        ))}
      </div>
      <div className="actions">
        <button type="submit" className="button--primary" disabled={!complete}>
          Mutasd a történetet
        </button>
        <span className="progress" aria-live="polite">
          {filledCount} / {fields.length} mező kitöltve
        </span>
      </div>
    </form>
  )
}

export default MadLib
```

Hogy hány játékos van, azt az `App`-ban választják ki, a történetválasztóhoz hasonló chipekkel. A játékosok száma a
`key`-be is bekerül (például `'guest-2'`): ha menet közben átváltanak, a játék tiszta lappal indul. Itt a teljes
`src/App.jsx`:

```jsx file=src/App.jsx mark=14-17,23,41-61
import { useState } from 'react'
import { STORIES } from './stories.js'
import { templateProblem } from './template.js'
import { sharedTemplate } from './share.js'
import StoryPicker from './components/StoryPicker.jsx'
import StoryEditor from './components/StoryEditor.jsx'
import MadLib from './components/MadLib.jsx'
import './App.css'

const START_TEMPLATE =
  'Hol volt, hol nem volt, volt egyszer egy {melléknév} {állat}, ' +
  'aki mindennél jobban szeretett {ige}.'

const PLAYER_OPTIONS = [
  { count: 1, label: 'Egyedül' },
  { count: 2, label: 'Ketten' },
]

function App() {
  // Ha a cím egy megosztott sablont hoz (#story=…), azzal indulunk.
  const [storyId, setStoryId] = useState(() => (sharedTemplate() ? 'custom' : STORIES[0].id))
  const [customText, setCustomText] = useState(() => sharedTemplate() || START_TEMPLATE)
  const [players, setPlayers] = useState(1)

  // A saját történet ugyanolyan alakú, mint a többi: id, title, text.
  const customStory = { id: 'custom', title: 'Saját történet', text: customText }
  const stories = [...STORIES, customStory]
  const story = stories.find((item) => item.id === storyId)

  function pickRandom() {
    // Csak a kész történetek közül sorsolunk, és mindig másikat.
    const others = STORIES.filter((item) => item.id !== storyId)
    const next = others[Math.floor(Math.random() * others.length)]
    setStoryId(next.id)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <StoryPicker stories={stories} selectedId={storyId} onSelect={setStoryId} onRandom={pickRandom} />
      <div className="picker">
        <span className="picker__label">Játékosok</span>
        <div className="chips">
          {PLAYER_OPTIONS.map((option) => (
            <button
              key={option.count}
              type="button"
              className="chip"
              aria-pressed={players === option.count}
              onClick={() => setPlayers(option.count)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {storyId === 'custom' && players === 1 && <StoryEditor text={customText} onChange={setCustomText} />}
      {/* Hibás sablonból nem lehet játszani. Új történet vagy más játékosszám: új key, tiszta lap. */}
      {templateProblem(story.text) === '' && (
        <MadLib key={`${story.id}-${players}`} story={story} players={players} />
      )}
    </main>
  )
}

export default App
```

Két játékosnál a szerkesztő elbújik: senki nem lesheti meg a sablont, és játék közben sem írhatja át. Ha módosítani
szeretnéd, válts vissza az „Egyedül”-re.

:::check Ellenőrizd
A történetválasztó alatt egy új sor: „Játékosok”, az „Egyedül” chip lila. Válaszd a „Ketten”-t: a mezők helyén egy
türkiz kártya, rajta „1. játékos következik” és egyetlen mező, benne a kurzorral. Írj be egy szót, nyomj ++Enter++-t:
a kártya sárgára vált, „2. játékos következik”, és a következő mező jön. Az utolsó mezőnél a gomb felirata „Mutasd a
történetet”: erre kattintva megjelenik a kész történet. Válaszd a „Saját történet”-et is: két játékosnál a szerkesztő
eltűnik.
:::

:::mistake Gyakori hiba
A `players` kimarad a `key`-ből. Ha ekkor egy félig kitöltött egyjátékos űrlapnál átváltasz „Ketten”-re, a beírt
szavak ott maradnak, és a játékosok a körök közben látják egymás korábbi szavait. A `key` minden olyan értéket
tartalmazzon, amelynek a változásakor tiszta lap kell.
:::

:::try Feladat
Kérd el a játékosok nevét a játék előtt (két mező az `App`-ban, egy-egy állapottal), add át őket a `MadLib`-en
keresztül a `TurnForm`-nak, és a kártyán „1. játékos következik” helyett például „Anna következik” álljon.
:::

### Ki melyik szót írta?

Két játékosnál az a legjobb, amikor kiderül, ki melyik szót írta. Színezzük a kiemelt szavakat a gazdájuk színére:
türkiz az 1., sárga a 2. játékosé. Hogy melyik mező kié, az a sorszámából látszik, ugyanúgy, mint a `TurnForm`-ban. A sorszámot az `indexOf` adja: megmondja, hányadik helyen áll egy elem a tömbben (0-tól számolva). A
`['név', 'állat', 'ige'].indexOf('állat')` értéke 1, vagyis az állatot a 2. játékos írta.

Itt a végleges `src/components/Story.jsx`:

```jsx file=src/components/Story.jsx mark=1,4-12,21,29-34
import { fieldsOf, fillTemplate, splitTemplate } from '../template.js'
import ReadAloudButton from './ReadAloudButton.jsx'

function Story({ story, words, players, onEdit, onRestart }) {
  const fields = fieldsOf(story.text)

  // Két játékosnál minden szó a gazdája színét kapja: a páros sorszámú mezők (0, 2, 4…)
  // az 1. játékoséi voltak, a páratlanok a 2.-éi. Egy játékosnál nincs külön osztály.
  function ownerClass(field) {
    if (players !== 2) return ''
    return `player-${(fields.indexOf(field) % 2) + 1}`
  }

  return (
    <article className="story">
      <h2>{story.title}</h2>
      <p className="story__text">
        {/* A páratlan helyeken (1, 3, 5…) a mezők állnak: ott a játékos szava jön, kiemelve. */}
        {splitTemplate(story.text).map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} title={part} className={ownerClass(part)}>
              {words[part]}
            </mark>
          ) : (
            part
          ),
        )}
      </p>
      {players === 2 && (
        <p className="legend">
          <span className="player-1">1. játékos</span>
          <span className="player-2">2. játékos</span>
        </p>
      )}
      <div className="actions">
        <ReadAloudButton text={fillTemplate(story.text, words)} />
        <button type="button" onClick={onEdit}>
          Szavak módosítása
        </button>
        <button type="button" onClick={onRestart}>
          Újrakezdés
        </button>
      </div>
    </article>
  )
}

export default Story
```

A `Story` most a `players` propot is várja, ezért a `MadLib`-ben add át neki. Az `src/components/MadLib.jsx`-ben az
`if (revealed)` ág legyen ilyen:

```jsx file=src/components/MadLib.jsx mark=6
  if (revealed) {
    return (
      <Story
        story={story}
        words={words}
        players={players}
        onEdit={() => setRevealed(false)}
        onRestart={restart}
      />
    )
  }
```

:::check Ellenőrizd
Játssz végig egy kétjátékos menetet: a kész történetben az 1. játékos szavai türkiz, a 2. játékoséi sárga háttérrel
állnak, alattuk pedig egy kis jelmagyarázat mutatja, melyik szín kié. Egyjátékos módban minden marad halványlila.
Gratulálok, kész a Mad Libs-játékod: commitold!
:::

:::mistake Gyakori hiba
A szó gazdáját a `splitTemplate` darabjainak sorszámából (`i`) számolni, nem a `fields`-ből. A mezők a darabok között
mindig páratlan helyen állnak, ezért az `(i % 2) + 1` minden szónál 2: minden szó sárga lesz. Ügyesebb számolással sem
jó, mert egy mező többször is szerepelhet, a darabok sorrendje tehát nem a `TurnForm` sorrendje. A `fields` minden
mezőt egyszer, a `TurnForm` sorrendjében tartalmaz.
:::

:::try Feladat
Írd ki a jelmagyarázatban azt is, ki hány szót írt. Az 1. játékos mezőit a `fields.filter((field, i) => i % 2 === 0)`
adja, a 2.-éit ugyanez `i % 2 === 1`-gyel, a `length` pedig megszámolja őket: „1. játékos (3 szó)”.
:::
