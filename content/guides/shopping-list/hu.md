# Mit építünk?

Egy bevásárlólistát, ami a boltban is kézre áll. Felírod, mit és mennyit kell venni. A tételek kategóriák szerint, a
bolt sorrendjében jelennek meg, és amit már a kosárba tettél, azt egy koppintással kipipálod. Közben megtanulod, hogyan
lesz egy egyszerű tömbből csoportosított lista, hogyan teszed ábécérendbe a tételeket (az ékezetes betűkkel is
helyesen), hogyan kezel a React egy több mezőből álló űrlapot, és hogyan marad meg a lista egy újratöltés után is.

:::levels
- Tételek felírása mennyiséggel, kipipálás és törlés. | kb. 2 óra
- Kategóriák a bolt sorrendjében, ábécérend, a kipipált tételek a lista aljára kerülnek, és a lista újratöltés után is megmarad. | kb. 3 óra
- Ajánlások a korábban vett tételekből, közös lista, ami több ablakban valós időben frissül, és offline is működő, telepíthető app (PWA). | kb. 3 óra
:::

**Előismeret:** az eddigi leckék, főleg a 9., a „To-Do List”: listák megjelenítése `key`-jel, elemek felvétele,
módosítása és törlése az állapotban, a `useEffect` és a saját `useLocalStorage` hook. Ezekre építünk, és ahol valamit
új módon használunk, ott újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Töltsd le a lecke **alapját** (fent: „Alap letöltése”), csomagold ki, és nyisd meg a `shopping-list` mappát a
szerkesztőben. Aztán a terminálban:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„Shopping List” címmel. Más még nincs rajta: a listát te építed.
:::

Az alapban ezek a fájlok fontosak ehhez a leckéhez:

- `src/App.jsx`: maga az oldal, egyelőre csak a címmel. Innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért most nem kell
  stílust írnod: csak a lépésekben megadott osztályneveket (`shop`, `add-form`, `shop-item`, …) használod. Azért nézz
  bele, a megjegyzések megmondják, mi mire való.
- `public/icon.svg`, `public/icon-192.png` és `public/icon-512.png`: az app ikonja. Csak a haladó szint legvégén lesz
  rá szükség, amikor telepíthető appot csinálunk a listából.

Az alap mindkét nyelven ugyanaz, ezért a cím és a fájlokban lévő megjegyzések angolul vannak. Ha szeretnéd, írd át a
címet nyugodtan „Bevásárlólista”-ra: a lépések ugyanúgy működnek. A kódot, amit te írsz be, magyar feliratokkal és
megjegyzésekkel mutatjuk.

A mappa most is egy git-repó egyetlen committal, a kezdőállapottal: a `git restore .` minden fájlt visszaállít, és
érdemes minden működő lépés után commitolni.

:::concept Gyors ismétlés a korábbi leckékből
Egy listát úgy jelenítesz meg Reactben, hogy a tömb [[map]] függvényével minden elemből JSX-et készítesz. Minden sor
kap egy [[key]]-t, egy állandó, egyedi azonosítót, amiből a React tudja, melyik sor melyik, amikor a lista változik
(9. lecke). Az állapotban lévő tömböt sosem írjuk át közvetlenül, hanem mindig új tömböt adunk a beállító
függvénynek (7. lecke). Ha ezek közül valami ismeretlennek tűnik, lapozz vissza; minden újat itt elmagyarázunk.
:::

### A lista egy tömbből

Egy bevásárlólista tételekből áll, és minden tételről ugyanazt kell tudnunk: mi az, mennyi kell belőle, és a kosárban
van-e már. Ezért minden tétel egy [[objektum]] ugyanazokkal a kulcsokkal, a lista pedig egy tömb, benne ezekkel az
objektumokkal. Írd át így az `src/App.jsx`-et (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1,4-9,12,17-24
import { useState } from 'react'
import './App.css'

// Néhány tétel, hogy ne üres listával induljunk.
const START_ITEMS = [
  { id: 1, name: 'Tej', quantity: 2, done: false },
  { id: 2, name: 'Kenyér', quantity: 1, done: false },
  { id: 3, name: 'Alma', quantity: 6, done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <ul className="shop-list">
        {items.map((item) => (
          <li key={item.id} className="shop-item">
            <span className="shop-item__qty">{item.quantity}×</span>
            <span className="shop-item__name">{item.name}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

- Az `id` az azonosító, ebből lesz a `key`. Most még kézzel adjuk (1, 2, 3); az új tételek a következő lépésben
  maguktól kapnak egyet.
- A `name` a tétel neve, a `quantity` a mennyisége (szám, nem szöveg: nincs idézőjel körülötte), a `done` pedig azt
  mondja meg, hogy a kosárban van-e már (`true` vagy `false`).
- A `START_ITEMS` a komponensen kívül áll, mert csak a kezdőérték: egyszer jön létre, amikor a fájl betöltődik. A lista
  a `useState`-ben él, mert változni fog. A `setItems`-re a következő lépéstől lesz szükség.
- A `map` minden tételből egy `<li>`-t készít. A mennyiség mögötti `×` sima szöveg, így lesz belőle „2× Tej”. A `×`
  önálló karakter, nem az x betű: másold ki a kódblokkból, ahogy a 8. leckében a számológép gombjait (magyar
  billentyűzeten az ++AltGr++ + ++Ú++ is beírja).

:::check Ellenőrizd
A cím alatt három keretes sor látszik: „2× Tej”, „1× Kenyér” és „6× Alma”, a mennyiség mindegyikben egy halványzöld
buborékban.
:::

:::mistake Gyakori hiba
Kimarad a `key={item.id}`. Az oldal ugyanúgy néz ki, de a konzolban (++F12++) figyelmeztetés jelenik meg: „Each child
in a list should have a unique "key" prop.” Később, amikor sorokat törlünk és átrendezünk, `key` nélkül a React csak a
sorok helyéből (sorszámából) találgatja, melyik sor melyik.
:::

:::try Próbáld ki
Írj egy negyedik tételt a `START_ITEMS`-be, például `{ id: 4, name: 'Vaj', quantity: 1, done: false }`, mentsd el, és
töltsd újra az oldalt (++F5++). Az újratöltés kell: a Vite mentéskor megtartja a lista állapotát, a `START_ITEMS` pedig
csak kezdőérték, ami az oldal betöltésekor számít (a középszinten erről még lesz szó). Figyelj az `id`-re: két
tételnek nem lehet ugyanaz.
:::

### Új tétel: vezérelt űrlap

A felíráshoz egy [[űrlap]] kell két mezővel: a tétel nevével és a mennyiséggel. Mindkettő [[vezérelt mező]] lesz,
ahogy az 1. lecke kapcsolati űrlapján, a 3. lecke csúszkájánál és a 4. leckében: az értékét az állapotból kapja, és
minden leütés frissíti az állapotot. Így a React mindig tudja, mi áll a mezőkben, és egy-egy `set…` hívással
alaphelyzetbe is tudja állítani őket.

Az űrlap saját komponenst kap. Hozz létre az `src` mappában egy `components` mappát, benne egy `AddItemForm.jsx`
fájlt:

```jsx file=src/components/AddItemForm.jsx
import { useState } from 'react'

function AddItemForm({ onAdd }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName === '') return
    onAdd(trimmedName, Number(quantity))
    // Kiürítjük a mezőket a következő tételhez.
    setName('')
    setQuantity('1')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label className="field field--name">
        Tétel
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="pl. paradicsom"
          required
        />
      </label>
      <label className="field field--qty">
        Mennyiség
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />
      </label>
      <button type="submit" className="add-form__button">
        Hozzáadás
      </button>
    </form>
  )
}

export default AddItemForm
```

- A `<form>` `onSubmit` eseménye akkor sül el, amikor a felhasználó elküldi az űrlapot: a gombra kattint, vagy
  ++Enter++-t nyom valamelyik mezőben. Az `event.preventDefault()` megakadályozza, hogy a böngésző a régi módon
  elküldje az űrlapot, és újratöltse az oldalt (az 1. lecke kapcsolati űrlapjánál is így volt).
- A mennyiséget **szövegként** tároljuk (`'1'`), mert minden mező szöveget ad, és gépelés közben a mező üres is lehet.
  Csak elküldéskor alakítjuk számmá, a `Number(quantity)`-vel. Ha minden leütésnél átalakítanánk, a kitörölt mezőből
  `Number('')`, vagyis 0 lenne, és a 0 rögtön visszaugrana a mezőbe.
- A `required` (kötelező) és a `min="1"` bekapcsolja a böngésző saját [[űrlap-ellenőrzését|űrlap-ellenőrzés]]: üres
  névvel vagy 1-nél kisebb mennyiséggel el sem küldi az űrlapot, hanem egy kis buborékban szól. A `handleSubmit` ilyenkor
  le sem fut.
- A `required` a csupa szóközből álló nevet is elfogadja. Ezért a `trim()` levágja a szóközöket a szöveg elejéről és
  végéről, és ha semmi sem maradt, a `return` kilép a függvényből: üres tételt nem veszünk fel.
- Az űrlap nem tárolja a listát. Csak szól az `onAdd` propon keresztül, hogy itt egy új tétel; a lista az `App`-ban
  él. Ez az [[állapot felemelése]], ahogy a 3. leckében a csúszkánál: az adat propokon át lefelé megy, az események
  függvényeken át felfelé jönnek.

Az `App`-ban kell egy függvény, ami felveszi az új tételt a listára; ezt kapja meg az űrlap. Írd át így az
`src/App.jsx`-et:

```jsx file=src/App.jsx mark=2,15-18,23
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import './App.css'

// Néhány tétel, hogy ne üres listával induljunk.
const START_ITEMS = [
  { id: 1, name: 'Tej', quantity: 2, done: false },
  { id: 2, name: 'Kenyér', quantity: 1, done: false },
  { id: 3, name: 'Alma', quantity: 6, done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity) {
    const newItem = { id: Date.now(), name, quantity, done: false }
    setItems([...items, newItem])
  }

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />
      <ul className="shop-list">
        {items.map((item) => (
          <li key={item.id} className="shop-item">
            <span className="shop-item__qty">{item.quantity}×</span>
            <span className="shop-item__name">{item.name}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

- A `Date.now()` azt adja meg, hány ezredmásodperc telt el 1970 eleje óta, például `1767258000000`. Minden
  ezredmásodpercben nő, és két tételt kézzel úgysem tudsz ugyanabban az ezredmásodpercben felírni, így azonosítónak
  tökéletes. A 9. leckében erre a `crypto.randomUUID()`-t használtad. Itt a `Date.now()` is elég, és van egy előnye: a
  `crypto.randomUUID()` csak biztonságos címen (`https://` vagy `localhost`) működik, így a telefonodon, egy sima
  `http://192.168…` címen (a haladó szint végén) a felírás hibával elszállna.
- `{ id: Date.now(), name, quantity, done: false }`: ha a kulcs és a változó neve ugyanaz, elég egyszer leírni. A
  `name` itt ugyanaz, mint a `name: name`.
- A `[...items, newItem]` a [[spread]]: a `...` kiteríti a régi tömb elemeit egy új tömbbe, a végére pedig odakerül az
  új tétel. Új tömb, ezért a React észreveszi, hogy változott a lista, és újrarajzolja.

:::check Ellenőrizd
Írd be: „Paradicsom”, a mennyiség legyen 4, és nyomj ++Enter++-t. A lista végén megjelenik a „4× Paradicsom”, a név
mezője kiürül, a mennyiség visszaáll 1-re. Próbáld üres névvel: a böngésző egy buborékban kéri, hogy töltsd ki a
mezőt. Írj be csak szóközöket: nem történik semmi.
:::

:::mistake Gyakori hiba
`items.push(newItem)`, aztán `setItems(items)`. A `push` a régi tömböt írja át, és a Reactnek ugyanazt a tömböt adod
vissza, ezért úgy látja, nem változott semmi: az új tétel nem jelenik meg. Mindig új tömböt adj: `[...items, newItem]`.
:::

:::try Próbáld ki
Kerüljenek az új tételek a lista elejére? Fordítsd meg a sorrendet: `[newItem, ...items]`.
:::

### Kipipálás

A boltban kipipálod, amit már a kosárba tettél. A sorban így lesz egy [[jelölőnégyzet]], a következő lépésben pedig
egy törlésgomb is, ezért a sor saját komponenst kap. Hozd létre az `src/components/ShoppingItem.jsx` fájlt:

```jsx file=src/components/ShoppingItem.jsx
function ShoppingItem({ item, onToggle }) {
  return (
    <li className={item.done ? 'shop-item is-done' : 'shop-item'}>
      <label className="shop-item__check">
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
        <span className="shop-item__qty">{item.quantity}×</span>
        <span className="shop-item__name">{item.name}</span>
      </label>
    </li>
  )
}

export default ShoppingItem
```

- Ahogy a 3. leckében: hogy egy jelölőnégyzet be van-e pipálva, azt a `checked` mondja meg (`true` vagy `false`), és
  minden kattintás az `onChange`-et hívja.
- A `<label>` a négyzetet, a mennyiséget és a nevet is körbeöleli, így nemcsak a kis négyzetre, hanem a tétel nevére
  is lehet kattintani. Telefonon, egy kézzel, a kosár mellett ez sokat számít.
- Az `item.done ? 'shop-item is-done' : 'shop-item'` a már ismert [[ternáris operátor]]: a kipipált sor az `is-done`
  osztályt is megkapja, amitől az `App.css` szerint kiszürkül, a neve pedig áthúzott lesz.
- A komponens nem maga változtatja meg a tételt: csak szól az `onToggle`-lel, hogy melyik `id`-jű tételre kattintottak.
  A lista az `App`-é, a változtatás is ott történik.

Az `App`-ban jön a `toggleItem`, a `map` pedig mostantól `ShoppingItem`-eket rajzol. Írd át így az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=3,21-24,32
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import ShoppingItem from './components/ShoppingItem.jsx'
import './App.css'

// Néhány tétel, hogy ne üres listával induljunk.
const START_ITEMS = [
  { id: 1, name: 'Tej', quantity: 2, done: false },
  { id: 2, name: 'Kenyér', quantity: 1, done: false },
  { id: 3, name: 'Alma', quantity: 6, done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity) {
    const newItem = { id: Date.now(), name, quantity, done: false }
    setItems([...items, newItem])
  }

  // A kattintott tételből másolat készül, megfordított done értékkel; a többi marad, ahogy volt.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />
      <ul className="shop-list">
        {items.map((item) => (
          <ShoppingItem key={item.id} item={item} onToggle={toggleItem} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

A `toggleItem` a 9. leckéből ismert módon módosít: a `map` egy új tömböt készít, ugyanannyi elemmel. Ahol az `id`
egyezik, ott a tétel egy másolata kerül az új tömbbe: a `{ ...item, done: !item.done }` lemásolja a tétel összes
kulcsát, és felülírja a `done`-t az ellentétére (a `!` a `true`-ból `false`-t csinál, és fordítva). A többi tétel
változatlanul kerül át. A `key` most a `<ShoppingItem>`-re kerül, mert a `map` ezt adja vissza.

:::check Ellenőrizd
Kattints a „Tej” jelölőnégyzetére, vagy magára a szóra: a négyzet bepipálódik, a sor kiszürkül, a név áthúzott lesz.
Kattints rá újra: visszaáll.
:::

:::mistake Gyakori hiba
A `key` a `ShoppingItem`-en belülre, a `<li>`-re kerül, nem a `map`-ben a `<ShoppingItem>`-re. A konzol ugyanúgy
hiányolja: a Reactnek annál az elemnél kell a `key`, amit a `map` visszaad.
:::

:::try Feladat
Tegyél a sor végére egy `+` gombot, ami eggyel növeli a mennyiséget. Az `App`-ban egy `increaseQuantity(id)` ugyanúgy
`map`-pel dolgozik, mint a `toggleItem`, csak a másolatban a mennyiséget írja át:
`{ ...item, quantity: item.quantity + 1 }`. A gomb (`<button type="button">`) a `</label>` után jön, és egy új propon,
például `onIncrease`-en keresztül hívja ezt a függvényt.
:::

### Törlés, és ha üres a lista

Ami már nem kell, azt törölni lehessen. A sor végére egy `×` gomb kerül. Cseréld le az `src/components/ShoppingItem.jsx`
tartalmát erre:

```jsx file=src/components/ShoppingItem.jsx mark=1,9-16
function ShoppingItem({ item, onToggle, onDelete }) {
  return (
    <li className={item.done ? 'shop-item is-done' : 'shop-item'}>
      <label className="shop-item__check">
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
        <span className="shop-item__qty">{item.quantity}×</span>
        <span className="shop-item__name">{item.name}</span>
      </label>
      <button
        type="button"
        className="shop-item__delete"
        onClick={() => onDelete(item.id)}
        aria-label={`${item.name} törlése`}
      >
        ×
      </button>
    </li>
  )
}

export default ShoppingItem
```

A gombon csak egy `×` áll. Aki látja, érti, de egy képernyőolvasó csak annyit mondana: „szorzás, gomb”. Az
[[aria-label]] nevet ad a gombnak, és a képernyőolvasó ezt olvassa fel: „Tej törlése, gomb”. A nevet az 1. leckéből
ismert [[template literal]] rakja össze: a két fordított aposztróf (backtick, magyar billentyűzeten ++AltGr++ + ++7++)
közé írt szövegbe a `${…}` illeszti be az `item.name` értékét, ahogy a 4. leckében a történetbe a szavakat. A
`type="button"` jelzi, hogy ez sima gomb, nem az űrlap elküldésére való. Ez a gomb nincs űrlapban, de jó szokás
kiírni: egy `<form>`-on belül a `type` nélküli gomb alapból elküldené az űrlapot.

Az `App`-ban jön a `deleteItem`, és két apróság: egy sor, ami megmutatja, hány tétel van már a kosárban, és egy
üzenet, ha üres a lista. Írd át így az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=26-29,31-32,39-44,48
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import ShoppingItem from './components/ShoppingItem.jsx'
import './App.css'

// Néhány tétel, hogy ne üres listával induljunk.
const START_ITEMS = [
  { id: 1, name: 'Tej', quantity: 2, done: false },
  { id: 2, name: 'Kenyér', quantity: 1, done: false },
  { id: 3, name: 'Alma', quantity: 6, done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity) {
    const newItem = { id: Date.now(), name, quantity, done: false }
    setItems([...items, newItem])
  }

  // A kattintott tételből másolat készül, megfordított done értékkel; a többi marad, ahogy volt.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  // Minden tétel marad, kivéve azt, amelyiknek egyezik az id-ja.
  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  // Származtatott érték: minden rajzoláskor a listából számoljuk, nem kell hozzá saját állapot.
  const doneCount = items.filter((item) => item.done).length

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />

      {items.length === 0 && <p className="shop-empty">Üres a lista. Írd fel, amire szükséged van!</p>}
      {items.length > 0 && (
        <p className="shop-progress">
          {items.length} tételből {doneCount} a kosárban
        </p>
      )}

      <ul className="shop-list">
        {items.map((item) => (
          <ShoppingItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

- A [[filter]] egy új tömböt ad, amiben csak azok az elemek maradnak, amelyekre a kapott függvény `true`-t mond. Itt
  minden tétel marad, aminek az `id`-ja **nem** (`!==`) egyezik a törlendőével.
- A `doneCount` egy [[származtatott érték]], ahogy a 3. leckében az erősségjelző: nem tároljuk külön, hanem minden
  rajzoláskor kiszámoljuk a listából. A `filter` kiválogatja a kipipált tételeket, a `.length` megszámolja őket.
- A `{feltétel && <p>…</p>}` a [[feltételes megjelenítés]]: üres listánál az üzenet jelenik meg, különben a
  számláló.

:::check Ellenőrizd
Előbb töltsd újra az oldalt (++F5++): kódírás közben a Vite megtartja a korábban felvett tételeket, az újratöltés
pedig visszahozza a három kezdő tételt (a felírt paradicsom ilyenkor eltűnik, a mentés a középszinten jön). Aztán
kattints a „Kenyér” sorában az `×`-re: a sor eltűnik, a lista fölött pedig „2 tételből 0 a kosárban” áll. Pipálj ki
egy tételt: „2 tételből 1 a kosárban”. Töröld az összes tételt: megjelenik az „Üres a lista. Írd fel, amire szükséged
van!” felirat. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
Fordított feltétel a `filter`-ben: `item.id === id`. Ekkor épp csak a kattintott tétel marad meg, az összes többi
eltűnik. A `filter` azt **tartja meg**, amire `true` jön ki, nem azt dobja ki.
:::

:::try Feladat
Ha minden tétel ki van pipálva, írd ki a lista alá: „Minden a kosárban, mehetsz a pénztárhoz!” Két feltétel kell
hozzá: van tétel, és a `doneCount` egyenlő az `items.length`-szel. A `shop-progress` osztály jó lesz hozzá.
:::

## Középszint {level=2}

### Kategóriák

A boltban sorról sorra haladsz: zöldség, pékáru, tejtermék… Ha a lista ugyanebben a sorrendben, csoportosítva mutatja
a tételeket, nem kell a tejespulttól visszarohannod a kenyérért. Ehhez minden tételnek kell egy kategória. Hozd létre
az `src/categories.js` fájlt:

```js file=src/categories.js
// A kategóriák abban a sorrendben, ahogy a boltban egymás után jönnek.
export const CATEGORIES = [
  { id: 'produce', label: 'Zöldség, gyümölcs' },
  { id: 'bakery', label: 'Pékáru' },
  { id: 'dairy', label: 'Tejtermék, tojás' },
  { id: 'meat', label: 'Hús, hal' },
  { id: 'pantry', label: 'Tartós élelmiszer' },
  { id: 'frozen', label: 'Mirelit' },
  { id: 'drinks', label: 'Italok' },
  { id: 'household', label: 'Háztartás' },
]
```

Minden kategóriának két neve van. Az `id` egy rövid, angol azonosító: ezt jegyezzük fel a tételben, és sosem
változik. A `label` az, amit a felhasználó lát; ezt bármikor átírhatod („Mirelit” helyett „Fagyasztott”), a már
felírt tételek akkor is megtalálják a kategóriájukat, mert az `id`-jük nem változott. A tömb sorrendje a bolt
sorrendje: a csoportok is ebben a sorrendben jelennek majd meg.

Az űrlapra egy [[legördülő lista]] kerül, HTML-nevén `<select>`, benne minden lehetőség egy `<option>`. A `<select>` is
vezérelt mező lehet, pont úgy, mint az `<input>`: a `value` mondja meg, melyik lehetőség van kiválasztva, és az
`onChange` jelez, ha a felhasználó mást választ. Cseréld le az `src/components/AddItemForm.jsx` tartalmát erre:

```jsx file=src/components/AddItemForm.jsx mark=2,7,13-14,41-50
import { useState } from 'react'
import { CATEGORIES } from '../categories.js'

function AddItemForm({ onAdd }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [category, setCategory] = useState('produce')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName === '') return
    onAdd(trimmedName, Number(quantity), category)
    // A név és a mennyiség kiürül; a kategória marad, mert gyakran több tétel jön ugyanonnan.
    setName('')
    setQuantity('1')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label className="field field--name">
        Tétel
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="pl. paradicsom"
          required
        />
      </label>
      <label className="field field--qty">
        Mennyiség
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />
      </label>
      <label className="field">
        Kategória
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {CATEGORIES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="add-form__button">
        Hozzáadás
      </button>
    </form>
  )
}

export default AddItemForm
```

Az `<option>`-nek két része van: a `value` az az érték, amit a `<select>` választáskor ad (`'dairy'`), a két címke
közötti szöveg pedig az, amit a felhasználó lát („Tejtermék, tojás”). A fájl a `components` mappában van, ezért a
`'../categories.js'` előbb egy mappát feljebb lép (`..`), az `src`-be.

Végül az `App`: a kezdő tételek kategóriát kapnak, és az `addItem` a harmadik értéket is eltárolja. Az
`src/App.jsx`-ben írd át a `START_ITEMS`-et és az `addItem`-et; minden más marad, ahogy volt:

```jsx file=src/App.jsx mark=5-7,13-14
// … az importok, mint eddig

// Néhány tétel, hogy ne üres listával induljunk.
const START_ITEMS = [
  { id: 1, name: 'Tej', quantity: 2, category: 'dairy', done: false },
  { id: 2, name: 'Kenyér', quantity: 1, category: 'bakery', done: false },
  { id: 3, name: 'Alma', quantity: 6, category: 'produce', done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity, category) {
    const newItem = { id: Date.now(), name, quantity, category, done: false }
    setItems([...items, newItem])
  }

  // … a toggleItem, a deleteItem, a doneCount és a return, mint eddig
}
```

Mentés után töltsd újra az oldalt (++F5++). Az 1. leckében láttad, hogy mentéskor a böngésző magától frissül: ez a
Vite gyors újratöltése (hot reload). Reactben ez még okosabb: a Vite csak a megváltozott kódot cseréli ki, és közben
megtartja a komponensek állapotát; ennek a neve [[Fast Refresh]]. Kódírás közben ez nagyon kényelmes, most viszont azt
jelenti, hogy az állapotban még a régi, kategória nélküli tételek vannak. A `START_ITEMS` csak kezdőérték: akkor
számít, amikor a komponens először rajzolódik ki, például egy újratöltés után.

:::check Ellenőrizd
Az űrlapon megjelenik a „Kategória” legördülő lista nyolc lehetőséggel, alapból a „Zöldség, gyümölcs” van
kiválasztva. Válaszd a „Tejtermék, tojás”-t, és vegyél fel egy „Joghurt”-ot: a lista végére kerül, ugyanúgy, mint
eddig. A kategóriát már eltároljuk, a következő lépésben ebből lesznek a csoportok. A „Tejtermék, tojás” a felvétel
után is kiválasztva marad, így egymás után több tejterméket is gyorsan felírhatsz.
:::

:::mistake Gyakori hiba
Kimarad az `<option>`-ök `value`-ja. Ilyenkor a böngésző a látható szöveget adja értéknek, és a tétel kategóriája
`'Tejtermék, tojás'` lesz `'dairy'` helyett. Most még semmi sem látszik belőle, de a következő lépésben az ilyen tétel
egyik csoportba sem illik bele, és egyszerűen eltűnik a listáról.
:::

:::try Próbáld ki
Hogy lásd, tényleg eltárolódik-e a kategória, írd ki ideiglenesen a név mellé a `ShoppingItem`-ben:
`{item.name} ({item.category})`. Ha meggyőződtél róla, töröld ki.
:::

### Csoportosítás a bolt sorrendjében

Most jön a lecke egyik fő ötlete, a [[csoportosítás]]: egy egyszerű tömbből csoportok lesznek, és mindegyikben
csak az odaillő tételek vannak. A terv: végigmegyünk a kategóriákon, a bolt sorrendjében, és mindegyikhez kiválogatjuk a
`filter`-rel a hozzá tartozó tételeket. Írd ezt az `src/categories.js` végére:

```js file=src/categories.js
// A tételeket kategóriák szerint csoportosítja, a bolt sorrendjében. Az üres csoportok kimaradnak.
export function groupByCategory(items) {
  const groups = CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    items: items.filter((item) => item.category === category.id),
  }))
  return groups.filter((group) => group.items.length > 0)
}
```

- A `CATEGORIES.map(…)` minden kategóriából egy csoportot készít: egy objektumot az `id`-vel, a `label`-lel és a
  kategória tételeivel.
- A `(category) => ({ … })` egy objektumot ad vissza. Az objektum kapcsos zárójele köré itt kerek zárójel kell:
  enélkül a JavaScript a nyílfüggvény törzsének hinné a kapcsos zárójelet, és a függvény nem adna vissza semmit.
- A végén a `filter` kidobja az üres csoportokat, hogy ne jelenjen meg nyolc csoportcím, amelyek közül hat alatt semmi
  sincs.

A kezdő tételekből például ez lesz:

```js
[
  { id: 'produce', label: 'Zöldség, gyümölcs', items: [/* Alma */] },
  { id: 'bakery', label: 'Pékáru', items: [/* Kenyér */] },
  { id: 'dairy', label: 'Tejtermék, tojás', items: [/* Tej */] },
]
```

Egy csoport egy címből és a hozzá tartozó sorokból áll. Hozd létre az `src/components/ItemGroup.jsx` fájlt:

```jsx file=src/components/ItemGroup.jsx
import ShoppingItem from './ShoppingItem.jsx'

function ItemGroup({ title, items, onToggle, onDelete }) {
  return (
    <section className="shop-group">
      <h2>
        {title} <span className="shop-group__count">{items.length}</span>
      </h2>
      <ul className="shop-list">
        {items.map((item) => (
          <ShoppingItem key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  )
}

export default ItemGroup
```

A sorokat mostantól az `ItemGroup` rajzolja, ezért a `ShoppingItem` importja is ide költözik. Az `App` a csoportokon
megy végig. Írd át így az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=3-4,32,34,48-56
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import ItemGroup from './components/ItemGroup.jsx'
import { groupByCategory } from './categories.js'
import './App.css'

// Néhány tétel, hogy ne üres listával induljunk.
const START_ITEMS = [
  { id: 1, name: 'Tej', quantity: 2, category: 'dairy', done: false },
  { id: 2, name: 'Kenyér', quantity: 1, category: 'bakery', done: false },
  { id: 3, name: 'Alma', quantity: 6, category: 'produce', done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity, category) {
    const newItem = { id: Date.now(), name, quantity, category, done: false }
    setItems([...items, newItem])
  }

  // A kattintott tételből másolat készül, megfordított done értékkel; a többi marad, ahogy volt.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  // Minden tétel marad, kivéve azt, amelyiknek egyezik az id-ja.
  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  // Származtatott értékek: minden rajzoláskor a listából számoljuk őket.
  const doneCount = items.filter((item) => item.done).length
  const groups = groupByCategory(items)

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />

      {items.length === 0 && <p className="shop-empty">Üres a lista. Írd fel, amire szükséged van!</p>}
      {items.length > 0 && (
        <p className="shop-progress">
          {items.length} tételből {doneCount} a kosárban
        </p>
      )}

      {groups.map((group) => (
        <ItemGroup
          key={group.id}
          title={group.label}
          items={group.items}
          onToggle={toggleItem}
          onDelete={deleteItem}
        />
      ))}
    </main>
  )
}

export default App
```

A `groups` is származtatott érték: nem tároljuk, hanem minden rajzoláskor újra kiszámoljuk az `items`-ből. Ha
kipipálsz vagy törölsz valamit, a csoportok maguktól követik.

:::check Ellenőrizd
Három csoport látszik, a bolt sorrendjében: „Zöldség, gyümölcs” (Alma), „Pékáru” (Kenyér) és „Tejtermék, tojás” (Tej,
és ha az előző lépésben felvetted, a Joghurt), pedig a tejet írtuk fel elsőnek. Minden csoportcím mellett egy szám
mutatja, hány tétel van alatta. Vegyél fel egy
„Mosogatószer”-t a „Háztartás” kategóriába: legalul új csoport jelenik meg. Töröld: a csoport is eltűnik.
:::

:::mistake Gyakori hiba
Kimarad a `groupByCategory` végéről a `filter`. Ekkor mind a nyolc csoportcím megjelenik, a legtöbb alatt üres lista.
:::

:::concept Miért nem Object.groupBy?
A modern JavaScriptben van kész csoportosító is: az `Object.groupBy(items, (item) => item.category)` egy objektumot
ad, amiben minden kategória alatt ott a tételei tömbje. Csakhogy abban a csoportok sorrendje az, ahogy a tételek a
listában előfordulnak, nekünk pedig a bolt sorrendje kell. Ezért indultunk ki a `CATEGORIES`-ből: ott a sorrend a
miénk.
:::

:::try Próbáld ki
Adj hozzá egy új kategóriát a `CATEGORIES`-hez, például `{ id: 'pets', label: 'Kisállat' }` a `household` elé. Semmi
mást nem kell átírnod: a legördülő lista és a csoportosítás is magától követi.
:::

### Ábécérend

Egy csoporton belül a tételek most abban a sorrendben állnak, ahogy felírtad őket. Ábécérendben könnyebb átfutni őket.
Sorba rendezni a tömb [[sort]] függvényével lehet, aminek egy [[összehasonlító függvényt|összehasonlító függvény]]
adunk: ez két elemet kap,
`a`-t és `b`-t, és egy számmal felel. Ha negatív, az `a` jön előbb; ha pozitív, a `b`; ha 0, maradnak, ahogy voltak. A
`sort` ezzel a függvénnyel annyi párt hasonlít össze, amennyi a teljes sorrendhez kell.

Két szöveget a [[localeCompare]] hasonlít össze a legjobban: úgy dönti el a sorrendjüket, ahogy egy adott nyelv
szótára. A `'hu'` a magyar ábécé szabályait kéri: az `á` az `a` mellé kerül, a `cs` a `c` után jön, és a kisbetűs
szavak sem kerülnek a nagybetűsek mögé.
Cseréld le az `src/categories.js` tartalmát erre:

```js file=src/categories.js mark=13-16,19,24
// A kategóriák abban a sorrendben, ahogy a boltban egymás után jönnek.
export const CATEGORIES = [
  { id: 'produce', label: 'Zöldség, gyümölcs' },
  { id: 'bakery', label: 'Pékáru' },
  { id: 'dairy', label: 'Tejtermék, tojás' },
  { id: 'meat', label: 'Hús, hal' },
  { id: 'pantry', label: 'Tartós élelmiszer' },
  { id: 'frozen', label: 'Mirelit' },
  { id: 'drinks', label: 'Italok' },
  { id: 'household', label: 'Háztartás' },
]

// Összehasonlító függvény a sort-nak: negatív számot ad, ha a-nak kell előbb jönnie, pozitívat, ha b-nek.
function byName(a, b) {
  return a.name.localeCompare(b.name, 'hu')
}

// A tételeket kategóriák szerint csoportosítja, a bolt sorrendjében. Az üres csoportok kimaradnak.
// Minden csoporton belül ábécérendben.
export function groupByCategory(items) {
  const groups = CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    items: items.filter((item) => item.category === category.id).sort(byName),
  }))
  return groups.filter((group) => group.items.length > 0)
}
```

Miért kell összehasonlító függvény? Nélküle a `sort` mindent szöveggé alakít, és a karakterek kódja szerint rendez.
Egy objektumból szövegként `"[object Object]"` lesz, vagyis minden tétel egyforma, és semmi sem mozdul. Sima
szövegeknél pedig a nagybetűk a kisbetűk elé kerülnek, az ékezetes betűk a `z` mögé: az „Áfonya” a „Zsemle” után
jönne.

Figyelj egy fontos tulajdonságra: a `sort` [[helyben rendez]]. Nem új tömböt ad, hanem magát a tömböt rendezi át,
amire meghívtad. Itt ez nem baj, mert a `filter` az előbb már egy vadonatúj tömböt készített, és azt rendezzük. Az
állapotban lévő tömböt viszont sosem szabad így átrendezni (lásd lent).

:::check Ellenőrizd
Vegyél fel a „Zöldség, gyümölcs” kategóriába egy „Áfonya” és egy „banán” tételt (az utóbbit kisbetűvel): a csoport
sorrendje „Áfonya, Alma, banán”. Összehasonlító függvény nélkül, sima karakterkód szerint „Alma, banán, Áfonya” lenne.
Ha kedved van, a „Tartós élelmiszer” csoportba írj egy „Csoki” és egy „Cukor” tételt: a „Cukor” kerül előre, mert a
magyar ábécében a `cs` önálló betű, és a `c` után jön.
:::

:::mistake Gyakori hiba
Közvetlenül az állapotot rendezni, például az `App`-ban: `items.sort(byName)`. A `sort` helyben rendez, vagyis a
React tudta nélkül átírja az állapotot, és az oldal ettől furcsán viselkedhet. Ha egy állapotban lévő tömböt kell
rendezned, előbb másold le: `[...items].sort(byName)`. Vagy használd a [[toSorted]]-et, ami eleve új tömböt ad:
`items.toSorted(byName)`.
:::

:::try Próbáld ki
Számokat egyszerű kivonással lehet összehasonlítani. Rendezd a csoportokon belül a tételeket mennyiség szerint, a
legtöbbel kezdve: a `groupByCategory`-ben a `.sort(byName)` helyére írd ezt: `.sort((a, b) => b.quantity - a.quantity)`.
Ha a `b` mennyisége nagyobb, az eredmény pozitív, és a `b` kerül előre. Utána állítsd vissza a `byName`-re.
:::

### A kipipált tételek a lista aljára

Ami már a kosárban van, az csak útban van a csoportok között. Kerüljön a lista aljára, egy külön „A kosárban”
csoportba, ahonnan egy gombbal az egészet törölni lehet, ha hazaértél.

A trükk az, hogy az adatokban semmi sem költözik: a tételek ugyanabban az `items` tömbben maradnak. Csak a rajzolás
válogat két részre: a `filter` egyszer a még megveendő (`!item.done`), egyszer a kosárban lévő tételeket gyűjti ki, és
csak az előbbiek kerülnek a csoportokba. Kipipáláskor a `done` megváltozik, a React újrarajzol, és a tétel máris a
másik helyen jelenik meg. Írd át így az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=32-35,38-40,50,64-71
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import ItemGroup from './components/ItemGroup.jsx'
import { groupByCategory } from './categories.js'
import './App.css'

// Néhány tétel, hogy ne üres listával induljunk.
const START_ITEMS = [
  { id: 1, name: 'Tej', quantity: 2, category: 'dairy', done: false },
  { id: 2, name: 'Kenyér', quantity: 1, category: 'bakery', done: false },
  { id: 3, name: 'Alma', quantity: 6, category: 'produce', done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity, category) {
    const newItem = { id: Date.now(), name, quantity, category, done: false }
    setItems([...items, newItem])
  }

  // A kattintott tételből másolat készül, megfordított done értékkel; a többi marad, ahogy volt.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  // Minden tétel marad, kivéve azt, amelyiknek egyezik az id-ja.
  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  // Kiveszi a listából mindazt, ami már a kosárban van.
  function clearDone() {
    setItems(items.filter((item) => !item.done))
  }

  // Származtatott értékek: minden rajzoláskor a listából számoljuk őket.
  const activeItems = items.filter((item) => !item.done)
  const doneItems = items.filter((item) => item.done)
  const groups = groupByCategory(activeItems)

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />

      {items.length === 0 && <p className="shop-empty">Üres a lista. Írd fel, amire szükséged van!</p>}
      {items.length > 0 && (
        <p className="shop-progress">
          {items.length} tételből {doneItems.length} a kosárban
        </p>
      )}

      {groups.map((group) => (
        <ItemGroup
          key={group.id}
          title={group.label}
          items={group.items}
          onToggle={toggleItem}
          onDelete={deleteItem}
        />
      ))}

      {doneItems.length > 0 && (
        <div className="shop-basket">
          <ItemGroup title="A kosárban" items={doneItems} onToggle={toggleItem} onDelete={deleteItem} />
          <button type="button" className="shop-clear" onClick={clearDone}>
            Kipipáltak törlése
          </button>
        </div>
      )}
    </main>
  )
}

export default App
```

- A `doneCount` helyett most a `doneItems.length` számol: a kipipált tételek tömbje úgyis megvan.
- Az `ItemGroup` másodszor is szerepel, ezúttal „A kosárban” címmel és a kipipált tételekkel. Egy jól megírt
  komponenst más adatokkal is újra lehet használni.
- A `clearDone` megint a `filter`: csak a ki nem pipált tételek maradnak.

:::check Ellenőrizd
Pipáld ki a „Tej”-et: eltűnik a „Tejtermék, tojás” csoportból (ha egyedül volt benne, a csoport is eltűnik), és lent,
„A kosárban” alatt jelenik meg, áthúzva. Vedd ki a pipát: visszakerül a csoportjába, az ábécérend szerinti helyére.
Pipáld ki újra a „Tej”-et és még egy tételt, és kattints a „Kipipáltak törlése” gombra: mindkettő eltűnik, és velük
együtt „A kosárban” rész is.
:::

:::mistake Gyakori hiba
Két külön állapot, egy a megveendő, egy a kosárban lévő tételeknek, és kipipáláskor a tételt átrakni az egyikből a
másikba. Működhet, de minden műveletnél két listára kell figyelni, és egy elfelejtett lépés után egy tétel eltűnik vagy
kétszer szerepel. Egy lista és belőle számolt értékek: így semmi sem csúszhat szét.
:::

:::try Feladat
Egy másik megoldás: a kipipált tételek a saját csoportjuk aljára kerüljenek, ne egy külön kosárba. Ehhez a
`groupByCategory` az összes tételt kapja meg, a `sort` pedig két szempont szerint rendezzen:
`(a, b) => Number(a.done) - Number(b.done) || byName(a, b)`. A `Number(true)` 1, a `Number(false)` 0, így a még
megveendők kerülnek előre. Ha mindkettő ugyanolyan, a különbség 0. A `0` hamisnak számít, ezért ilyenkor a `||` a
jobb oldalát adja: a második szempont, a név dönt.
:::

### A lista megmarad: useLocalStorage

Töltsd újra az oldalt: a lista visszaugrik a három kezdő tételre. Az állapot csak addig él, amíg az oldal nyitva van.
A 9. leckében erre írtál egy [[saját hookot|saját hook]], a `useLocalStorage`-et: úgy működik, mint a `useState`,
de minden változást elment a böngésző [[localStorage]] nevű tárolójába, és onnan olvassa vissza a következő
látogatáskor.

A `localStorage` csak szöveget tud tárolni, a listánk viszont objektumok tömbje. Ezért [[JSON]] formátumba alakítjuk:
a `JSON.stringify` szöveggé alakítja a tömböt, a `JSON.parse` pedig a szövegből visszaépíti. Hozd létre az
`src/useLocalStorage.js` fájlt (ha a 9. leckéből megvan, összevetheted vele):

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Úgy működik, mint a useState, de az érték egy újratöltés után is megmarad.
function useLocalStorage(key, initialValue) {
  // Lusta kezdőérték: a mentést csak egyszer, az első rajzoláskor olvassuk be.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Letiltott tároló vagy hibás mentés: a kezdőértékkel indulunk.
    }
    return initialValue
  })

  // Minden változás után elmentjük, szövegként.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Tele a tároló, vagy nem szabad menteni: az app a memóriában tovább működik.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

- A `useState` egy függvényt kap, ez a [[lusta kezdőérték]] (2. és 3. lecke): a React csak az első rajzoláskor hívja
  meg. Ha van mentés, abból indulunk, ha nincs (`null`), a kapott kezdőértékből.
- A [[try/catch]] azért kell, mert a böngésző letilthatja a tárolót, és egy hibás mentésen a `JSON.parse` elhasalna.
  Ilyenkor sem omlik össze az oldal, csak nem emlékszik.
- Az effekt minden változás után lefut (a [[függőségi tömb]] `[key, value]`), és elmenti az új értéket.
- A hook ugyanazt adja vissza, mint a `useState`: egy értéket és egy beállító függvényt. Ezért az `App` többi része
  változatlan maradhat.

Az `src/App.jsx`-ben két sor változik: az első sorban a `useState` importja helyére a hook importja kerül (az `App` már
nem hívja közvetlenül a `useState`-et), a `useState(START_ITEMS)` helyére pedig a `useLocalStorage(…)` hívás:

```jsx file=src/App.jsx mark=1,10
import useLocalStorage from './useLocalStorage.js'
import AddItemForm from './components/AddItemForm.jsx'
import ItemGroup from './components/ItemGroup.jsx'
import { groupByCategory } from './categories.js'
import './App.css'

// … a START_ITEMS, mint eddig

function App() {
  const [items, setItems] = useLocalStorage('shopping-list:items', START_ITEMS)

  // … minden más, mint eddig
}
```

Az első paraméter a kulcs, ami alatt a lista a tárolóba kerül. A `shopping-list:` előtag segít, hogy egy másik
projekted mentései ne keveredjenek ezzel ugyanazon a címen (a `localhost:5173`-at minden Vite-projekted használja).

:::check Ellenőrizd
Vegyél fel egy tételt, pipálj ki egy másikat, és töltsd újra az oldalt (++F5++): minden ott van, ahol hagytad. A
fejlesztői eszközökben (++F12++) az Application → Local storage → `http://localhost:5173` alatt megtalálod a
`shopping-list:items` kulcsot, mellette a lista JSON-szövegként. Ha törlöd a kulcsot (jobb klikk → Delete), és
újratöltöd az oldalt, visszajön a három kezdő tétel. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Kimarad a `JSON.stringify`, és a hook magát a tömböt adja a `setItem`-nek. A `localStorage` ilyenkor is szöveggé
alakítja, csak rosszul: `"[object Object],[object Object]"`. Újratöltéskor a `JSON.parse` ezen elhasal, a `catch`
elkapja, és a lista minden alkalommal a kezdő tételekkel indul, hibaüzenet nélkül.
:::

:::try Próbáld ki
A böngésző konzoljában (++F12++ → Console) futtasd le: `JSON.parse(localStorage.getItem('shopping-list:items'))`.
Ugyanazt a tömböt kapod vissza, amit az `App` használ.
:::

## Haladó szint {level=3}

### Ajánlások a korábbi tételekből

A bevásárlólisták nagyon hasonlítanak egymásra: tej, kenyér, alma, hétről hétre. Jegyezzük meg, mit írtál már fel
valaha, és ajánljuk fel egy kattintással azt, ami most nincs a listán. Ehhez egy második listát is mentünk, az
előzményeket: minden névhez azt is, melyik kategóriába tartozik, és hányszor írtad fel.

A logika megint nem a Reactről szól, ezért külön fájlba kerül. Hozd létre az `src/history.js` fájlt:

```js file=src/history.js
// Az előzmények: minden tétel, amit valaha felírtál, és hogy hányszor.
// Például: [{ name: 'Tej', category: 'dairy', count: 3 }, …]

// Kis- és nagybetűtől függetlenül ugyanaz-e a két név? („tej” és „Tej”: igen)
function sameName(a, b) {
  return a.toLowerCase() === b.toLowerCase()
}

// Feljegyzi, hogy egy tételt (újra) felírtak. Új tömböt ad, a friss bejegyzéssel az elején.
export function remember(history, name, category) {
  const old = history.find((entry) => sameName(entry.name, name))
  const others = history.filter((entry) => !sameName(entry.name, name))
  const count = old ? old.count + 1 : 1
  return [{ name, category, count }, ...others]
}

// A korábbi tételek, amelyek most nincsenek a listán: a leggyakoribbak elöl, legfeljebb max darab.
export function suggest(history, items, max) {
  const missing = history.filter((entry) => !items.some((item) => sameName(item.name, entry.name)))
  return missing.sort((a, b) => b.count - a.count).slice(0, max)
}
```

Három tömbfüggvény dolgozik itt; mindhárommal találkoztál már a korábbi leckékben:

- A [[find]] az első olyan elemet adja vissza, amire a függvény `true`-t mond, vagy `undefined`-ot, ha nincs ilyen. Ha
  a név már szerepelt, a régi bejegyzésből tudjuk, hányszor; ha nem, a `count` 1 lesz.
- A [[some]] azt mondja meg, van-e **legalább egy** elem, amire a függvény `true`-t mond. A `!items.some(…)` tehát: a
  listán egyetlen tételnek sincs ilyen neve.
- A `slice(0, max)` az első `max` darab elemet adja vissza, új tömbben.

A `remember` sosem módosítja a kapott tömböt: új tömböt ad, amiben a friss bejegyzés áll elöl, mögötte a többi. A
`suggest` a `filter` után kapott új tömböt rendezi, így a `sort` itt sem nyúl az állapothoz. A `b.count - a.count`
csökkenő sorrendet ad, a leggyakoribb jön előre. Ha kettő egyformán gyakori, a `sort` megtartja a sorrendjüket, és
mivel a `remember` mindig előre teszi a frisset, a legutóbb felírt kerül előbbre.

Az ajánlások kis gombok lesznek az űrlap alatt. Hozd létre az `src/components/Suggestions.jsx` fájlt:

```jsx file=src/components/Suggestions.jsx
function Suggestions({ entries, onPick }) {
  // Ha nincs mit ajánlani, nem rajzolunk semmit.
  if (entries.length === 0) return null

  return (
    <div className="suggestions">
      <span className="suggestions__title">Korábban vetted:</span>
      {entries.map((entry) => (
        <button key={entry.name} type="button" className="suggestion" onClick={() => onPick(entry)}>
          + {entry.name}
        </button>
      ))}
    </div>
  )
}

export default Suggestions
```

Ha egy komponens `null`-t ad vissza, a React nem rajzol semmit a helyére. A neveket a `remember` egyedivé teszi, ezért
lehetnek `key`-k.

Az `App`-ban az előzmények egy második `useLocalStorage`-be kerülnek, saját kulccsal, és minden felíráskor
frissülnek. Írd át így az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=4,6,18,23,26-29,50,56
import useLocalStorage from './useLocalStorage.js'
import AddItemForm from './components/AddItemForm.jsx'
import ItemGroup from './components/ItemGroup.jsx'
import Suggestions from './components/Suggestions.jsx'
import { groupByCategory } from './categories.js'
import { remember, suggest } from './history.js'
import './App.css'

// Néhány tétel, hogy ne üres listával induljunk.
const START_ITEMS = [
  { id: 1, name: 'Tej', quantity: 2, category: 'dairy', done: false },
  { id: 2, name: 'Kenyér', quantity: 1, category: 'bakery', done: false },
  { id: 3, name: 'Alma', quantity: 6, category: 'produce', done: false },
]

function App() {
  const [items, setItems] = useLocalStorage('shopping-list:items', START_ITEMS)
  const [history, setHistory] = useLocalStorage('shopping-list:history', [])

  function addItem(name, quantity, category) {
    const newItem = { id: Date.now(), name, quantity, category, done: false }
    setItems([...items, newItem])
    setHistory(remember(history, name, category))
  }

  // Egy ajánlásra kattintva a tétel 1-es mennyiséggel, a korábbi kategóriájában kerül vissza.
  function addSuggestion(entry) {
    addItem(entry.name, 1, entry.category)
  }

  // A kattintott tételből másolat készül, megfordított done értékkel; a többi marad, ahogy volt.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  // Minden tétel marad, kivéve azt, amelyiknek egyezik az id-ja.
  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  // Kiveszi a listából mindazt, ami már a kosárban van.
  function clearDone() {
    setItems(items.filter((item) => !item.done))
  }

  // Származtatott értékek: minden rajzoláskor a listából számoljuk őket.
  const activeItems = items.filter((item) => !item.done)
  const doneItems = items.filter((item) => item.done)
  const groups = groupByCategory(activeItems)
  const suggestions = suggest(history, items, 8)

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />
      <Suggestions entries={suggestions} onPick={addSuggestion} />

      {items.length === 0 && <p className="shop-empty">Üres a lista. Írd fel, amire szükséged van!</p>}
      {items.length > 0 && (
        <p className="shop-progress">
          {items.length} tételből {doneItems.length} a kosárban
        </p>
      )}

      {groups.map((group) => (
        <ItemGroup
          key={group.id}
          title={group.label}
          items={group.items}
          onToggle={toggleItem}
          onDelete={deleteItem}
        />
      ))}

      {doneItems.length > 0 && (
        <div className="shop-basket">
          <ItemGroup title="A kosárban" items={doneItems} onToggle={toggleItem} onDelete={deleteItem} />
          <button type="button" className="shop-clear" onClick={clearDone}>
            Kipipáltak törlése
          </button>
        </div>
      )}
    </main>
  )
}

export default App
```

Az `addItem` most két állapotot is beállít, egymás után. Ez rendben van: a React megvárja, amíg az eseménykezelő
lefut, és csak utána rajzol újra, egyszer. Az ajánlások is származtatott értékek: az előzményekből és a listából
számoljuk őket minden rajzoláskor.

:::check Ellenőrizd
Eleinte nincs ajánlás: az előzmények üresen indulnak, a kezdő tételek nincsenek benne. Írd fel a „Paradicsom”-ot a
„Zöldség, gyümölcs” kategóriába, pipáld ki, és kattints a „Kipipáltak törlése” gombra. Az űrlap alatt megjelenik:
„Korábban vetted: + Paradicsom”. Kattints rá: a paradicsom 1-es mennyiséggel visszakerül a „Zöldség, gyümölcs”
csoportba, a gomb pedig eltűnik, hiszen már a listán van. Az előzmények újratöltés után is megmaradnak.
:::

:::mistake Gyakori hiba
A `sameName` helyett sima `===`. Ekkor a „tej” és a „Tej” két külön bejegyzés lesz az előzményekben, és a
„+ tej” gomb akkor is megjelenik, ha a „Tej” már a listán van.
:::

:::try Feladat
Gépelés közben is jöhetnek ajánlások. Add át a `history`-t az `AddItemForm`-nak egy új propban, és használd a böngésző
beépített ajánlólistáját: a név mezője kapjon egy `list="past-items"` attribútumot, utána pedig jöjjön egy
`<datalist id="past-items">`, benne minden bejegyzéshez egy `<option key={entry.name} value={entry.name} />`. Ha
gépelni kezdesz, a böngésző felkínálja a hasonló neveket.
:::

### Közös lista valós időben

Egy bevásárlólistát ritkán használ egyetlen ember. Amíg te a boltban vagy, otthon valaki még gyorsan felírja a tojást,
és jó lenne, ha a te listádon is azonnal megjelenne. Egy igazi közös listához szerver kell, ami minden változást
továbbad a többi telefonnak. Ebben a kurzusban nem használunk külső szolgáltatást, ezért két böngészőablakkal
gyakorlunk: az egyik te vagy, a másik a lakótársad.

Ugyanannak az oldalnak két ablaka közös `localStorage`-et használ. Ha az egyik ablak átír benne egy kulcsot, a
böngésző az összes **többi** ablaknak küld egy [[storage eseményt|storage esemény]]: „ez a kulcs megváltozott, itt az
új értéke”. Erre kell figyelnünk, és az új értéket betenni az állapotba. Egy eseményre a `window.addEventListener`
iratkozik fel, a `window.removeEventListener` pedig leiratkozik róla (az 1. lecke `useHashRoute`-ja is így figyelte a
cím változását). Cseréld le az `src/useLocalStorage.js` tartalmát erre:

```js file=src/useLocalStorage.js mark=3-4,26-35
import { useEffect, useState } from 'react'

// Úgy működik, mint a useState, de az érték egy újratöltés után is megmarad,
// és a többi nyitott ablakban is azonnal frissül.
function useLocalStorage(key, initialValue) {
  // Lusta kezdőérték: a mentést csak egyszer, az első rajzoláskor olvassuk be.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Letiltott tároló vagy hibás mentés: a kezdőértékkel indulunk.
    }
    return initialValue
  })

  // Minden változás után elmentjük, szövegként.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Tele a tároló, vagy nem szabad menteni: az app a memóriában tovább működik.
    }
  }, [key, value])

  // Egy másik ablak átírta ugyanezt a kulcsot: átvesszük az új értéket.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== key || event.newValue === null) return
      setValue(JSON.parse(event.newValue))
    }
    window.addEventListener('storage', handleStorage)
    // Takarítás: ha a komponens eltűnik, abbahagyjuk a figyelést.
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  return [value, setValue]
}

export default useLocalStorage
```

- Az `event.key` a megváltozott kulcs, az `event.newValue` az új érték, szövegként. Ha nem a mi kulcsunk változott,
  vagy valaki törölte (ilyenkor az új érték `null`), nem csinálunk semmit.
- A `JSON.parse` visszaépíti a tömböt, a `setValue` beteszi az állapotba, és a React újrarajzolja a listát.
- A [[takarító függvény]] leiratkozik az eseményről, így egy eltűnt komponens nem kap több értesítést.

Nem lesz ebből végtelen pingpong? Az ablak, amelyik átvette az új értéket, a saját mentő effektjében visszaírja
ugyanazt a szöveget. A böngésző viszont csak akkor küld `storage` eseményt, ha az érték tényleg megváltozott, így itt
megáll a sor. Az `App`-hoz hozzá sem kell nyúlnod: a lista és az előzmények is ezt a hookot használják, így mindkettő
közös lett.

:::check Ellenőrizd
Nyisd meg a listát két böngészőablakban egymás mellett (ugyanazon a címen, például `http://localhost:5173`). Írj fel
valamit a bal oldaliban: a jobb oldaliban azonnal megjelenik. Pipáld ki a jobb oldaliban: a bal oldaliban is
kipipálódik. Ha a jobb oldaliban a „Kipipáltak törlése” után megjelenik egy ajánlás, a bal oldaliban is ott van.
:::

:::mistake Gyakori hiba
A két ablakot két különböző böngészőben (például Chrome és Firefox) vagy egy normál és egy privát (inkognitó) ablakban
nyitod meg. Ezeknek külön `localStorage`-ük van, ezért nem látják egymás változásait. Ugyanabban a böngészőben nyiss
két normál ablakot (vagy lapot).
:::

:::concept Hogyan csinálja egy igazi app?
Egy igazi közös listánál minden telefon tartós kapcsolatban áll egy szerverrel, általában
[[WebSocketen|WebSocket]] keresztül. Ha valaki változtat, a telefonja elküldi a szervernek, a szerver pedig továbbítja
az összes többinek, pont úgy, ahogy nálunk a böngésző küldi a `storage` eseményt a többi ablaknak. A mi megoldásunk
mindig a teljes listát írja felül, így ha ketten pontosan egyszerre változtatnak, az utolsó nyer. Az igazi appok
ezért inkább kis változásokat küldenek („a Tej kipipálva”), és a szerver rakja össze őket. Ha egyszer több lap között
kell üzenetet küldened, a böngésző `BroadcastChannel`-je is erre való.
:::

### Offline is működik: service worker

A pincében lévő boltban gyakran nincs térerő. A listát a `localStorage` már offline is őrzi, de ha nincs net, maga az
oldal nem töltődik be: a böngésző a szervertől kéri a fájlokat, és mivel nem éri el, hibaoldalt mutat. Erre való a
[[service worker]]: egy kis JavaScript-fájl, amit a böngésző az oldal mellett, a háttérben futtat. Az oldal és a
hálózat között áll, minden kérést lát, amit az oldal küld, és maga döntheti el, honnan válaszol: a hálózatról vagy a
saját [[gyorsítótárából|gyorsítótár]] (cache).

Ha egy weboldal offline is működik, és telepíteni is lehet, mint egy appot, [[PWA]]-nak hívjuk (Progressive Web App,
progresszív webalkalmazás). Ebben a lépésben az offline működés jön, a következőben a telepítés.

A service worker nem lehet része a Vite által összecsomagolt kódnak: a böngészőnek egy állandó címen kell megtalálnia.
Ezért a `public` mappába kerül, amit a Vite változatlanul másol a kész oldal mellé. Hozd létre a `public/sw.js`
fájlt:

```js file=public/sw.js
// A service worker a böngésző és a hálózat között áll, és minden kérést lát, amit az oldal küld.
const CACHE_NAME = 'shopping-list-v1'

// Az új service worker rögtön munkába áll, és a már nyitott oldalt is átveszi.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const request = event.request
  // Csak a saját oldalunk letöltéseivel foglalkozunk.
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return

  // Előbb a hálózat: ha sikerül, a válasz másolatát eltesszük a gyorsítótárba.
  // Ha nincs net, a gyorsítótárból válaszolunk.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() => caches.match(request)),
  )
})
```

- A `self` maga a service worker. Három eseményére figyel: az `install` akkor sül el, amikor a böngésző telepíti, az
  `activate`, amikor munkába áll, a `fetch` pedig minden egyes kérésnél, amit az oldal küld (a HTML-nél, a
  JavaScriptnél, a CSS-nél, az ikonoknál).
- Egy új service worker alapból megvárja, amíg a régi változatot használó összes lap bezárul. A `skipWaiting` és a
  `clients.claim` kihagyja ezt a várakozást: az új service worker azonnal munkába áll, és a már nyitott oldalt is
  átveszi.
- Az `event.waitUntil(…)` megkéri a böngészőt, hogy várjon az indulással, amíg a `clients.claim()` be nem fejeződik.
- A `request.method !== 'GET'` átenged mindent, ami nem sima letöltés (például egy elküldött űrlapot), a
  `self.location.origin` pedig az oldal saját címe (`http://localhost:4173`), így a más oldalakra menő kérésekhez sem
  nyúlunk. Egy `respondWith` nélküli `return` a böngészőre hagyja a kérést, mintha nem is lenne service worker.
- Az `event.respondWith(…)` azt mondja a böngészőnek: erre a kérésre én válaszolok. A `fetch(request)` letölti a
  hálózatról. A `.then` és a `.catch` a `try/catch` párja a [[Promise]]-oknál: a `.then` akkor fut le, ha a letöltés
  sikerült, a `.catch` akkor, ha nem (például mert nincs net).
- Egy válasz tartalmát csak egyszer lehet kiolvasni, ezért a `response.clone()` másolatot készít: az egyik az oldalé, a
  másik a gyorsítótáré. A `caches.open` megnyitja (vagy létrehozza) a gyorsítótárat, a `cache.put` elteszi a választ a
  kérés címe alatt, a `caches.match` pedig előkeresi.

Ezt a stratégiát „előbb a hálózat” (angolul network first) néven ismerik. Amíg van net, mindig a friss fájlokat
kapod, így egy új változat azonnal megjelenik; a gyorsítótár csak akkor kell, ha nincs kapcsolat.

A service workert az oldalnak kell regisztrálnia, vagyis megmondania a böngészőnek, hol találja. Írd ezt az
`src/main.jsx` végére:

```jsx file=src/main.jsx
// A service worker csak a kész (buildelt) változatban indul. Fejlesztés közben a Vite élőben
// frissíti a fájlokat, ott a service worker csak útban lenne.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
}
```

- Az `import.meta.env.PROD` értékét a Vite tölti ki: a kész, buildelt változatban `true`, az `npm run dev` alatt
  `false`.
- A `'serviceWorker' in navigator` megnézi, ismeri-e a böngésző a service workert. Ha nem, az oldal service worker
  nélkül, ugyanúgy működik.
- A `./sw.js` az oldal melletti `sw.js`: a `public` mappa tartalma a build után pont oda kerül.

Mivel a service worker csak a kész változatban fut, most build kell. Állítsd le a fejlesztői szervert (++Ctrl++ +
++C++), és futtasd:

```shell
npm run build     # elkészíti a kész oldalt a dist mappába
npm run preview   # kiszolgálja a dist mappát, általában a http://localhost:4173 címen
```

:::check Ellenőrizd
Nyisd meg a kiírt címet (általában `http://localhost:4173`). A lista itt újra a három kezdő tétellel indul: a
`localhost:4173` más cím, mint a `localhost:5173`, és minden címnek saját `localStorage`-e van. A fejlesztői
eszközökben az Application → Service workers
alatt ott a `sw.js`, zöld ponttal: „activated and is running”. Töltsd újra az oldalt egyszer: ekkor már a service
worker tölti le a fájlokat, és közben elteszi őket. Most állítsd le az előnézetet a terminálban (++Ctrl++ + ++C++), és
töltsd újra az oldalt: a lista ugyanúgy megjelenik, pedig nincs, ami kiszolgálja. Ez a service worker műve. Utána
indítsd újra a fejlesztői szervert (`npm run dev`).
:::

:::mistake Gyakori hiba
A `sw.js` az `src` mappába kerül a `public` helyett. Az `src`-ből a Vite csak azt teszi a kész oldalba, amit a kód
importál, és azt is összecsomagolja és átnevezi, így a kész oldal mellett nincs `sw.js`. Az előnézet ilyenkor a
`sw.js` helyett is az oldal HTML-jét küldi vissza, a regisztráció pedig hibával elszáll; a konzolban: „The script has
an unsupported MIME type ('text/html')”.
:::

:::try Próbáld ki
A fejlesztői eszközökben az Application → Cache storage alatt megnyithatod a `shopping-list-v1` gyorsítótárat: ott
sorakozik minden fájl, amit a service worker eltett, az oldal HTML-jétől a JavaScripten át az ikonig.
:::

### Telepíthető app: a manifest

Az utolsó lépés: a listát telepíteni is lehessen, mint egy appot, saját ikonnal, címsor nélkül. Ehhez a böngészőnek
tudnia kell, mi az app neve, milyen ikonja és milyen színe van. Ezt a [[web app manifest]] írja le: egy kis
JSON-fájl. Hozd létre a `public/manifest.webmanifest` fájlt:

```json file=public/manifest.webmanifest
{
  "name": "Bevásárlólista",
  "short_name": "Bevásárlás",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#f7f8fa",
  "theme_color": "#017b6b",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- A `name` a teljes név, a `short_name` az, ami a telefon kezdőképernyőjén az ikon alatt elfér.
- A `start_url` az a cím, amit a telepített app megnyit; a `./` a manifest melletti oldal, vagyis a lista.
- A `"display": "standalone"` saját ablakot kér, címsor és gombok nélkül, mint egy igazi appnál.
- A `background_color` az indulás pillanatában látszik, a `theme_color` pedig a böngésző sávjait színezi (például a
  telefon felső sávját).
- Az ikonok az alappal érkeztek a `public` mappába; a böngészők ezt a két méretet várják.

Végül az `index.html` (a projekt gyökerében, nem az `src`-ben) mondja meg, hol a manifest. Cseréld le a tartalmát
erre:

```html file=index.html mark=2,6-9
<!doctype html>
<html lang="hu">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#017b6b" />
    <title>Bevásárlólista</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Az alap üres ikonja (`href="data:,"`) helyére a kosaras `icon.svg` került (ez látszik a böngésző fülén), a
`lang="hu"` pedig megmondja a böngészőnek és a képernyőolvasóknak, hogy az oldal magyar. A `theme-color` ugyanaz a
szín, mint a manifestben: a böngésző már telepítés előtt is ezzel színezheti a sávjait. A `<title>` a böngészőfülön és
a telepített app ablakán látszó cím.

:::check Ellenőrizd
A böngésző fülén megjelenik a zöld kosaras ikon. Állítsd le a fejlesztői szervert (++Ctrl++ + ++C++), futtasd újra az
`npm run build`, majd az `npm run preview` parancsot, és nyisd meg a kiírt címet. A fejlesztői eszközökben az
Application → Manifest alatt ott a „Bevásárlólista” név, a két ikon és a színek, hibaüzenet nélkül. Chrome-ban és
Edge-ben a címsor jobb szélén megjelenik egy telepítési ikon: kattints rá, és a lista saját ablakban nyílik meg,
címsor nélkül. Telefonon, ha az oldal egy `https://` címen van (lásd lent), a böngésző menüjében a „Hozzáadás a
kezdőképernyőhöz” teszi ugyanezt.
Gratulálok, kész a bevásárlólistád!
:::

:::mistake Gyakori hiba
A `manifest.webmanifest` vagy az ikonok az `src` mappába kerülnek. A böngésző ilyenkor nem találja őket, az
Application → Manifest alatt hibát látsz, és telepítési ikon sem jelenik meg. Minden, amit a böngésző közvetlenül, egy
állandó címen kér el (a manifest, az ikonok, a service worker), a `public` mappába való.
:::

:::concept Telefonon is kipróbálhatod
A service worker csak biztonságos címen működik: `https://` alatt vagy a `localhost`-on. Ha az előnézetet
`npm run preview -- --host` paranccsal indítod, és a telefonodról a géped IP-címén (`http://192.168…`, a terminál a
„Network” sorban kiírja) nyitod meg, az oldal működik, de offline nem, és telepíteni sem lehet. Az 1. leckében
láttad, hogyan kerül fel egy oldal a GitHub Pages-re: ott `https://` címet kap (ne felejtsd el az 1. leckéből a
`base: './'` sort a `vite.config.js`-ben), és a telefonodra is telepítheted a listát.
:::
