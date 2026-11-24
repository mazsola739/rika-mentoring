# Mit építünk?

Egy teendőlistát: beírod, mit kell elintézned, kipipálod, ha kész, és törlöd, ha már nem kell. Egyszerűnek hangzik,
de szinte minden app így működik belül: egy lista az állapotban, amelybe új elemek kerülnek, a meglévők pedig
változnak vagy eltűnnek. Ha ezt egyszer rendesen megérted, a webshop kosara, a chat üzenetei vagy egy kanbantábla
kártyái már ismerősek lesznek. A végén a lista megjegyzi a feladataidat, húzással átrendezhető, a logikáját automatikus
tesztek ellenőrzik, a feladatokat pedig egy (kitalált) szerveren, saját fiókban tárolja.

:::levels
- Feladat hozzáadása, kipipálása és törlése. | kb. 2 óra
- Szerkesztés, szűrők (összes / aktív / kész) és mentés egy saját `useLocalStorage` hookkal. | kb. 3 óra
- Határidő és fontosság, átrendezés húzással, automatikus tesztek, végül belépés és egy kitalált szerver adatbázissal. | kb. 4 óra
:::

**Előismeret:** az előző nyolc lecke. Leginkább ezekre építünk: komponensek, props, listák a `map`-pel és űrlap (1.
lecke), `localStorage` és saját hook (2. lecke), vezérelt mezők, jelölőnégyzet, `async`/`await` (3. lecke), késve
érkező válaszok eldobása egy effektben (5. lecke), másolattal frissítés, `crypto.randomUUID()` és a `useLocalStorage`
hook (6. lecke), tömbök az állapotban (7. lecke), tiszta függvények és tesztek (8. lecke). Amit felidézünk, azt egy-két
mondatban újra elmagyarázzuk; minden újat lépésről lépésre.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/09-todo/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Az 1. lecke részletesen elmagyarázza, hogyan jutsz hozzá; itt
csak röviden:

1. Hozd le az új leckéket. Ha egy korábbi leckéből már megvan a repó, futtasd le a mappájában a `git pull` parancsot
   (`cd rika-mentoring`, `git pull`, `cd ..`).
   Ha még nincs meg, klónozd le egyszer: `git clone https://github.com/mazsola739/rika-mentoring.git` (git nélkül: a
   GitHub-oldalon **Code → Download ZIP**).
2. Másold ki a `lessons/09-todo/exercise` mappát a repóból a saját munkamappádba, és nevezd el a másolatot így:
   `todo-list`. A másolatodban dolgozol: a repó érintetlen marad, így a `git pull` továbbra is működik.
3. Nyisd meg a `todo-list` mappát a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Halványszürke oldalt látsz, közepén egy
fehér kártyával, rajta sötétkék betűkkel a „To-Do List” cím. Más még nincs rajta: a lista a te dolgod.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. Az első terminált az `npm run dev`
foglalja, ezért nyiss egy másodikat a szerkesztőben, a `todo-list` mappában:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés
után commitolni.

A kiinduló projektben három fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért most nem kell
  stílust írnod: csak a lépésekben megadott osztályneveket (`todo-item`, `add-todo`, `filters`, …) használod. Azért nézz
  bele!
- `src/fakeServer.js`: egy kitalált szerver. Csak a legvégén, a haladó szinten lesz rá szükség.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a „To-Do List” cím angolul vannak.
Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te írsz be, magyar
feliratokkal és megjegyzésekkel mutatjuk.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza: HTML-szerű leírást arról, mi jelenjen meg a képernyőn.
Kívülről a [[props]]-ain keresztül kap adatot, emlékezni pedig a [[useState]] segítségével tud: ha egy állapotérték
megváltozik, a React újrarajzolja a komponenst. A rajzoláson kívüli munka, például a mentés, a [[useEffect]]-be kerül.
Ha ezek közül valami ismeretlennek tűnik, lapozz vissza az 1–3. leckéhez.
:::

:::concept Négy művelet: CRUD
Egy teendőlistával négyféle dolgot csinálhatsz: új feladatot veszel fel (**C**reate, létrehozás), megnézed a feladatokat
(**R**ead, olvasás), módosítasz egyet (**U**pdate, módosítás: például kipipálod vagy átírod), és törölsz egyet
(**D**elete, törlés). A négy angol szó kezdőbetűiből jön a [[CRUD]] rövidítés. Szinte minden app ezt a négy műveletet
végzi, csak más adatokon: termékeken, üzeneteken, fényképeken. Ebben a leckében mind a négyet megírod.
:::

### Lista egy tömbből

Egy feladatnak három adata van: egy [[azonosító]] (`id`), a szövege (`text`), és hogy kész van-e (`done`). Ezért
mindegyik feladat egy [[objektum]], a lista pedig objektumok [[tömbje|tömb]]. Az azonosító egy olyan érték, ami csak
ehhez az egy feladathoz tartozik, és sosem változik: ha két feladat szövege ugyanaz („Bevásárlás”), az azonosítójuk
akkor is különbözik.

Egy feladat megjelenítése saját komponenst kap. Hozz létre az `src` mappában egy `components` mappát, benne egy
`TodoItem.jsx` fájlt:

```jsx file=src/components/TodoItem.jsx
function TodoItem({ todo }) {
  return (
    <li className="todo-item">
      <span className="todo-item__text">{todo.text}</span>
    </li>
  )
}

export default TodoItem
```

A `TodoItem` egy egész feladatot kap egyetlen propként (`todo`), és kiírja a szövegét. Most írd át az `src/App.jsx`-et
így (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1,4-9,15-19
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

function App() {
  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <ul className="todo-list">
        {START_TODOS.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

Az 1. leckében a készségeid listáját ugyanígy rajzoltad ki: a `map` a tömb minden elemére meghívja a függvényt, és a
kapott elemekből lesz a lista. Akkor `key={skill}` volt, most `key={todo.id}`. A [[key]] alapján ismeri fel a React a
sorokat, amikor a lista változik: melyik sor új, melyik tűnt el, melyik került máshová. Ezért olyan érték kell bele,
ami a feladathoz tartozik, és sosem változik: az azonosító. A szöveg nem jó, mert két feladatnak lehet ugyanaz a
szövege, és a szöveget később át is írhatod. A `done` mezőt a 3. lépésben használjuk.

:::check Ellenőrizd
A cím alatt három keretes sor jelenik meg: „Megvenni a tejet”, „Felhívni a nagymamát”, „Megírni a házit”.
:::

:::mistake Gyakori hiba
`key={index}`, vagyis a sor sorszáma a `map((todo, index) => …)` második paraméteréből. Amíg a lista nem változik,
működik, és a konzol sem szól. A baj akkor jön, amikor egy sort törölsz vagy áthelyezel: a sorszámok elcsúsznak, és a
React összekeveri a sorokat. Az 5. lépésben ki is próbálod, mi történik ilyenkor.
:::

:::try Próbáld ki
Írj egy negyedik feladatot a `START_TODOS` tömbbe, `id: 4`-gyel. Mentés után azonnal megjelenik.
:::

### Új feladat hozzáadása

Az új feladatokat egy szövegmezőbe írod, és ++Enter++-rel vagy egy gombbal veszed fel őket. Két dolog kell hozzá: a
mező és egy lista, ami változhat.

Kezdjük a mezővel. Hozd létre az `src/components/AddTodo.jsx` fájlt:

```jsx file=src/components/AddTodo.jsx
import { useState } from 'react'

function AddTodo({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    const trimmed = text.trim()
    if (trimmed === '') return // üres feladatot nem veszünk fel
    onAdd(trimmed)
    setText('')
  }

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        className="add-todo__text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Mit kell elintézni?"
        aria-label="Új feladat"
      />
      <button type="submit" className="button button--primary">
        Hozzáadás
      </button>
    </form>
  )
}

export default AddTodo
```

Ez egy [[vezérelt mező]], mint a 3. lecke csúszkája: az értéke a `text` állapotban él, és minden
billentyű frissíti. A mező és a gomb egy `<form>`-ban van, ezért az ++Enter++ is beküldi az űrlapot, nem csak a gomb. A
beküldést az 1. lecke kapcsolati űrlapjából ismered: az `event.preventDefault()` megakadályozza, hogy a böngésző
újratöltse az oldalt. A `trim()` levágja a szöveg elejéről és végéről a szóközöket, így a csupa szóközből álló
feladatot sem vesszük fel. A végén a `setText('')` kiüríti a mezőt.

Az `AddTodo` nem maga tárolja a listát: csak szól, hogy van egy új feladat, az `onAdd` propon keresztül. A lista az
`App`-ban él, mert a kirajzolásához is ott kell. Ez az [[állapot felemelése]], amit a 3. leckében láttál: az adat
propokon át lefelé megy, az események függvényeken át felfelé jönnek.

Most az `App`. A lista mostantól változik, ezért [[állapot]] lesz belőle, a `START_TODOS` pedig csak a kezdőértéke:

```jsx file=src/App.jsx mark=1-2,14,16-20,25,27
import { useState } from 'react'
import AddTodo from './components/AddTodo.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

function App() {
  const [todos, setTodos] = useState(START_TODOS)

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // Új tömb: az összes régi feladat, a végén az újjal.
    setTodos([...todos, newTodo])
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

- A `handleAdd` egy [[eseménykezelő]]. A neve `handle`-lel kezdődik („kezeld le”): sok React-kódban így jelölik azokat
  a függvényeket, amelyek egy eseményre válaszolnak.
- A `crypto.randomUUID()`-t a 6. leckéből ismered, ott a paklik és a kártyák kaptak vele azonosítót: minden hívásra egy
  hosszú, véletlen azonosítót, egy [[UUID]]-t ad, például `'3b9f0c2e-…'`. Két egyforma gyakorlatilag sosem jön ki, ezért
  jó `id`-nak. (Csak `https://` címen és a `localhost`-on működik, de a fejlesztői szerver pont ilyen.)
- A `{ id: …, text, done: false }` közepén a `text` a `text: text` rövid formája, ahogy a 2. leckében a
  `return { theme, setTheme }`.
- A `[...todos, newTodo]`-ban a [[spread]] egy tömböt terít ki: a régi tömb összes elemét átmásolja egy új tömbbe, a
  végére pedig odakerül az új feladat. Az 1. leckében objektumot másoltál így (`{ ...form }`), a 6. leckében pedig pont
  így bővítetted a paklik listáját (`[...decks, newDeck]`).

Miért nem egyszerűen `todos.push(newTodo)`? A `push` a meglévő tömböt bővíti. A React viszont úgy veszi észre a
változást, hogy összehasonlítja a régi és az új értéket: ha ugyanaz a tömb, szerinte nem történt semmi, és nem rajzol
újra. Ezért az állapotot sosem írjuk át, hanem mindig egy új tömböt adunk a `setTodos`-nak. Ez az
[[immutábilis frissítés]] (immutábilis: megváltoztathatatlan), amit a 6. és a 7. leckében már használtál.

A 6. és a 7. leckében a [[frissítő függvényt|frissítő függvény]] is láttad (`setIndex((i) => …)`,
`setColors((current) => …)`). Ott azért kellett, mert a billentyűfigyelő csak egyszer jött létre, és a régi állapotot
látta. A mi eseménykezelőink minden rajzoláskor újra létrejönnek, és mindig a friss `todos`-t látják, ezért itt elég az
egyszerűbb forma.

:::check Ellenőrizd
Írd be: „Kenyeret venni”, és nyomj ++Enter++-t: a lista végén megjelenik az új feladat, a mező pedig kiürül. Csak
szóközök vagy üres mező mellett a „Hozzáadás” gomb nem csinál semmit.
:::

:::mistake Gyakori hiba
`todos.push(newTodo)`, aztán `setTodos(todos)`. Nem jön hibaüzenet, de az új feladat nem jelenik meg: a `setTodos`
ugyanazt a tömböt kapta, amit a React már ismer. A tömb közben ténylegesen bővült, ezért amikor valami más miatt
újrarajzolódik az oldal, az „elveszett” feladat hirtelen felbukkan. Az ilyen hibát nagyon nehéz megtalálni: mindig új
tömböt adj át.
:::

:::try Próbáld ki
Kerüljenek az új feladatok a lista elejére: `[newTodo, ...todos]`. Aztán állítsd vissza.
:::

### Kipipálás

Egy feladat kipipálása a CRUD „U”-ja: egy meglévő elem módosítása. A `TodoItem` kap egy
[[jelölőnégyzetet|jelölőnégyzet]] és egy `onToggle` propot, amellyel szól, ha rákattintottak. Írd át az
`src/components/TodoItem.jsx`-et:

```jsx file=src/components/TodoItem.jsx mark=1,3-7
function TodoItem({ todo, onToggle }) {
  return (
    <li className={todo.done ? 'todo-item is-done' : 'todo-item'}>
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
    </li>
  )
}

export default TodoItem
```

A jelölőnégyzetet a `checked` vezérli, mint a 3. leckében. A `<label>` körülveszi a négyzetet és a szöveget is, ezért a
szövegre kattintva is pipálhatsz. A `todo.done ? 'todo-item is-done' : 'todo-item'` a [[ternáris operátor]]: kész
feladatnál a sor megkapja az `is-done` osztályt is, amitől az `App.css` szerint áthúzott és halvány lesz.

Az `App`-ban a `handleToggle` végzi a módosítást. Megint új tömböt készít, de most a `map`-pel:

```jsx file=src/App.jsx mark=22-25,33
import { useState } from 'react'
import AddTodo from './components/AddTodo.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

function App() {
  const [todos, setTodos] = useState(START_TODOS)

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // Új tömb: az összes régi feladat, a végén az újjal.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // Új tömb, amelyben csak az a feladat cserélődik, amelyikre kattintottak.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

Olvasd el lassan a `handleToggle` belsejét. A `map` végigmegy a feladatokon, és mindegyikből készít valamit az új
tömbbe:

- ha ez az a feladat, amelyikre kattintottak (egyezik az azonosítója), egy **másolat** kerül a helyére:
  `{ ...todo, done: !todo.done }`.
  A spread átmásolja az összes mezőjét, a vessző utáni rész pedig felülírja a `done`-t az ellentétére (a `!` a
  `true`-ból `false`-t csinál, és fordítva);
- minden más feladat változatlanul, önmagaként kerül át.

Az eredeti feladatot itt sem írjuk át: az is a régi állapot része.

:::check Ellenőrizd
A „Felhívni a nagymamát” már az elején ki van pipálva és át van húzva. Kattints egy másik feladat négyzetére vagy a
szövegére: kipipálódik és áthúzódik; még egy kattintás, és újra nyitott.
:::

:::mistake Gyakori hiba
A spread kimarad: `{ done: !todo.done }`. Kattintás után a feladat szövege eltűnik, mert az új objektumban csak a
`done` mező van meg: az `id` és a `text` elveszett. A `...todo` viszi át a többi mezőt.
:::

### Törlés

A CRUD utolsó betűje, a „D”. A törléshez a tömb [[filter]] függvénye kell: végigmegy az elemeken, és csak azokat tartja
meg egy új tömbben, amelyekre a neki adott függvény `true`-t ad. A `TodoItem` kap egy gombot, ami az `onDelete`-et
hívja:

```jsx file=src/components/TodoItem.jsx mark=1,8-17
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.done ? 'todo-item is-done' : 'todo-item'}>
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <div className="todo-item__actions">
        <button
          type="button"
          className="button button--small"
          onClick={() => onDelete(todo.id)}
          aria-label={`Törlés: ${todo.text}`}
        >
          Törlés
        </button>
      </div>
    </li>
  )
}

export default TodoItem
```

Minden sorban ott lesz egy „Törlés” gomb. A képernyőolvasót használóknak ez kevés: nem tudják, melyik feladat mellett
áll. Az `aria-label` ezért a gomb teljes nevét mondja meg, például „Törlés: Megvenni a tejet”. A szöveg egy
[[template literal]] segítségével áll össze, ahogy az 1. leckében a `mailto:` link.

Az `App`-ban jön a `handleDelete`, és két apróság: egy sor a lista alatt, ami kiírja, hány feladat van még hátra, és
egy üzenet, ha üres a lista.

```jsx file=src/App.jsx mark=15-16,29-32,38,41,44
import { useState } from 'react'
import AddTodo from './components/AddTodo.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

function App() {
  const [todos, setTodos] = useState(START_TODOS)
  // Nem állapot: minden rajzoláskor a todos-ból számoljuk.
  const activeCount = todos.filter((todo) => !todo.done).length

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // Új tömb: az összes régi feladat, a végén az újjal.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // Új tömb, amelyben csak az a feladat cserélődik, amelyikre kattintottak.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleDelete(id) {
    // Új tömb az összes többi feladattal: azokkal, amelyeknek más az azonosítójuk.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      {todos.length === 0 && <p className="todo-empty">Nincs teendő. Írd be fent az elsőt!</p>}
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </ul>
      <p className="todo-footer">Hátralévő feladatok: {activeCount}</p>
    </main>
  )
}

export default App
```

- A `todo.id !== id` akkor igaz, ha a feladat **nem** az, amit törölni kell: így minden megmarad, csak az az egy nem.
- Az `activeCount` egy [[származtatott érték]], mint a 3. lecke erősségjelzője: a `todos`-ból következik, ezért nem kap
  saját állapotot, hanem minden rajzoláskor kiszámoljuk. A `filter` itt a még nyitott feladatokat tartja meg, a
  `length` pedig megszámolja őket.
- A `{todos.length === 0 && …}` [[feltételes megjelenítés]]: az üzenet csak üres listánál jelenik meg.

:::check Ellenőrizd
A lista alatt ez áll: „Hátralévő feladatok: 2”. Pipálj ki egyet: 1 lesz. Törölj egy feladatot a „Törlés” gombbal:
eltűnik, a szám pedig követi. Ha mindet törlöd, a lista helyén ez jelenik meg: „Nincs teendő. Írd be fent az elsőt!”
Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
`todos.filter((todo) => todo.id === id)`, `!==` helyett `===`. Ez éppen fordítva működik: a törölt feladat marad meg,
az összes többi eltűnik.
:::

:::try Feladat
Tegyél a lista alá egy „Készek törlése” gombot, ami egyszerre törli az összes kipipált feladatot. Egy új eseménykezelő
kell hozzá az `App`-ba, ami a `filter`-rel csak a még nyitott feladatokat tartja meg.
:::

:::concept Miért vesztek el a feladataim?
Ha újratöltöd az oldalt (++F5++), a lista visszaáll a három mintafeladatra. Az állapot csak addig él, amíg az oldal
nyitva van. A középszinten elmentjük a böngészőbe.
:::

## Középszint {level=2}

### Szerkesztés

Ha elírtál egy feladatot, ne kelljen törölni és újra beírni: legyen egy „Szerkesztés” gomb. Rákattintva a sor helyén
egy szövegmező jelenik meg, benne a feladat szövegével. Az ++Enter++ vagy a „Mentés” elmenti, az ++Esc++ vagy a „Mégse”
elveti a változtatást.

Hogy egy sor éppen szerkesztés alatt áll-e, azt csak az az egy sor tudja: ez [[helyi állapot]], ami magában a
`TodoItem`-ben él, nem az `App`-ban. Minden `TodoItem` saját `editing` állapotot kap, egymástól függetlenül. Írd át az
`src/components/TodoItem.jsx`-et:

```jsx file=src/components/TodoItem.jsx mark=1,3-45,54-61
import { useState } from 'react'

function TodoItem({ todo, onToggle, onRename, onDelete }) {
  // Helyi állapot: csak ez a sor tudja, hogy éppen szerkesztik-e, és mi van a mezőben.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function startEditing() {
    setDraft(todo.text)
    setEditing(true)
  }

  function handleSave(event) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (trimmed !== '') onRename(todo.id, trimmed)
    setEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <li className="todo-item is-editing">
        <form className="todo-edit" onSubmit={handleSave}>
          <input
            className="todo-edit__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="A feladat új szövege"
            autoFocus
          />
          <button type="submit" className="button button--small button--primary">
            Mentés
          </button>
          <button type="button" className="button button--small" onClick={() => setEditing(false)}>
            Mégse
          </button>
        </form>
      </li>
    )
  }

  return (
    <li className={todo.done ? 'todo-item is-done' : 'todo-item'}>
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <div className="todo-item__actions">
        <button
          type="button"
          className="button button--small"
          onClick={startEditing}
          aria-label={`Szerkesztés: ${todo.text}`}
        >
          Szerkesztés
        </button>
        <button
          type="button"
          className="button button--small"
          onClick={() => onDelete(todo.id)}
          aria-label={`Törlés: ${todo.text}`}
        >
          Törlés
        </button>
      </div>
    </li>
  )
}

export default TodoItem
```

- A komponensnek két `return`-je van. Ha az `editing` igaz, az első fut le, és a függvény ott véget is ér: a sor egy
  űrlap lesz. Különben a második, a megszokott sor.
- A `draft` a szerkesztés alatt álló szöveg: ez vezérli a szerkesztőmezőt, ahogy a `text` az `AddTodo` mezőjét. Csak
  mentéskor kerül át a listába, az `onRename`-en keresztül; ezért lehet a „Mégse” egyszerűen annyi, hogy kilépünk a
  szerkesztésből.
- A `startEditing` minden szerkesztés elején újra a feladat mostani szövegét teszi a `draft`-ba. A `useState(todo.text)`
  kezdőértéke ugyanis csak az első rajzoláskor számít: enélkül a „Mégse” után a következő szerkesztésnél az elvetett
  szöveg várna a mezőben.
- Az `autoFocus` a megjelenő mezőbe teszi a kurzort, így rögtön gépelhetsz.
- Az `onKeyDown` minden billentyű lenyomásakor lefut. Az `event.key` megmondja, melyik billentyű volt, ahogy a 7.
  leckében: itt csak az `'Escape'` érdekel minket.

Az `App`-ban az új `handleRename` ugyanazt a mintát követi, mint a kipipálás, csak most a szöveg cserélődik. A
`TodoItem`-nek közben annyi propja lett, hogy külön sorokba írjuk őket:

```jsx file=src/App.jsx mark=29-32,50
import { useState } from 'react'
import AddTodo from './components/AddTodo.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

function App() {
  const [todos, setTodos] = useState(START_TODOS)
  // Nem állapot: minden rajzoláskor a todos-ból számoljuk.
  const activeCount = todos.filter((todo) => !todo.done).length

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // Új tömb: az összes régi feladat, a végén az újjal.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // Új tömb, amelyben csak az a feladat cserélődik, amelyikre kattintottak.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleRename(id, text) {
    // Ugyanaz a minta, mint a kipipálásnál, csak most a szöveg cserélődik.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }

  function handleDelete(id) {
    // Új tömb az összes többi feladattal: azokkal, amelyeknek más az azonosítójuk.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      {todos.length === 0 && <p className="todo-empty">Nincs teendő. Írd be fent az elsőt!</p>}
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </ul>
      <p className="todo-footer">Hátralévő feladatok: {activeCount}</p>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Ha a 4. lépésben mindet törölted, előbb töltsd újra az oldalt (++F5++): visszajön a három mintafeladat. Kattints a
„Megvenni a tejet” sorában a „Szerkesztés” gombra: a sor halványzöld hátterű lesz, benne egy szövegmező a feladat
szövegével és a kurzorral, mellette a „Mentés” és a „Mégse” gomb. Írd át „Megvenni a tejet és a kenyeret”-re, és nyomj
++Enter++-t: a sor visszaáll, az új szöveggel. Kezdd újra, írj bele valamit, és nyomd meg az ++Esc++-et: a régi szöveg
marad.
:::

:::try Próbáld ki: mire jó a key?
Most meglátod, miért kell az azonosító a `key`-be. Az `App`-ban írd át ideiglenesen a listát így:
`todos.map((todo, index) => (` és `key={index}`. Kattints a második feladat (a nagymamás) „Szerkesztés” gombjára, aztán
az első feladat „Törlés” gombjára. A szerkesztőmező a második helyen marad, és még mindig a „Felhívni a nagymamát”
áll benne, csakhogy most már a házi feladathoz tartozik: nyomd meg a „Mégse” gombot, és ott a „Megírni a házit”
jelenik meg; ha helyette a „Mentés”-t nyomod, a házi feladat kapja a „Felhívni a nagymamát” szöveget. A React a
sorszám alapján adta tovább a sor állapotát egy másik feladatnak. Állítsd vissza
`key={todo.id}`-re, és próbáld újra: a szerkesztés a nagymamás feladattal együtt mozdul.
:::

:::mistake Gyakori hiba
A „Mégse” gombról lemarad a `type="button"`. Egy űrlapon belül minden gomb alapból beküldő gomb (`type="submit"`),
ezért a „Mégse” is beküldené az űrlapot, vagyis elmentené a változtatást, amit éppen el akartál dobni.
:::

### Szűrők: összes, aktív, kész

Egy hosszabb listában jó lenne csak a még nyitott vagy csak a kész feladatokat látni. A választott szűrő egy újabb
állapot (`'all'`, `'active'` vagy `'done'`), a látható feladatok listája viszont **nem** állapot: a `todos`-ból és a
szűrőből következik, ezért minden rajzoláskor kiszámoljuk.

A szűrés logikájának semmi köze a Reacthez, ezért saját fájlba kerül, ahogy a 3. leckében a `generator.js`. Hozd létre
az `src/todoLogic.js` fájlt:

```js file=src/todoLogic.js
// Feladatlistákkal dolgozó függvények. Nincs bennük React: egy tömböt kapnak, és egy újat adnak vissza.

// A szűrőnek megfelelő feladatok: 'all' (összes), 'active' (még nincs kész) vagy 'done' (kész).
export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((todo) => !todo.done)
  if (filter === 'done') return todos.filter((todo) => todo.done)
  return todos
}
```

A szűrőgombok az `src/components/FilterBar.jsx` fájlba kerülnek:

```jsx file=src/components/FilterBar.jsx
const FILTERS = [
  { value: 'all', label: 'Összes' },
  { value: 'active', label: 'Aktív' },
  { value: 'done', label: 'Kész' },
]

function FilterBar({ filter, counts, onChange }) {
  return (
    <div className="filters" role="group" aria-label="Szűrés">
      {FILTERS.map((item) => (
        <button
          key={item.value}
          type="button"
          className="filters__button"
          aria-pressed={filter === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          <span className="filters__count">{counts[item.value]}</span>
        </button>
      ))}
    </div>
  )
}

export default FilterBar
```

Az `aria-pressed` egy [[ARIA]]-attribútum: megmondja a képernyőolvasónak, hogy a gomb be van-e nyomva, az `App.css`
pedig ez alapján festi sötétre a kiválasztottat. A `counts` egy objektum a három számmal, például
`{ all: 3, active: 2, done: 1 }`; a `counts[item.value]` abból a gombhoz tartozót veszi ki. A `role="group"` és az
`aria-label` egy névvel ellátott csoportba fogja a három gombot.

Az `App`-ban a szűrő állapotot kap, a lista helyére pedig a látható feladatok kerülnek:

```jsx file=src/App.jsx mark=2,4,15-20,24,26,28-29,56-61,71
import { useState } from 'react'
import { filterTodos } from './todoLogic.js'
import AddTodo from './components/AddTodo.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

// Mit írjunk ki, ha a szűrő után egy feladat sem marad.
const EMPTY_MESSAGES = {
  all: 'Nincs teendő. Írd be fent az elsőt!',
  active: 'Minden kész. Szép munka!',
  done: 'Még nincs elvégzett feladat.',
}

function App() {
  const [todos, setTodos] = useState(START_TODOS)
  const [filter, setFilter] = useState('all') // 'all', 'active' vagy 'done'

  // Nem állapot: minden rajzoláskor a todos-ból és a filter-ből számoljuk.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // Új tömb: az összes régi feladat, a végén az újjal.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // Új tömb, amelyben csak az a feladat cserélődik, amelyikre kattintottak.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleRename(id, text) {
    // Ugyanaz a minta, mint a kipipálásnál, csak most a szöveg cserélődik.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }

  function handleDelete(id) {
    // Új tömb az összes többi feladattal: azokkal, amelyeknek más az azonosítójuk.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
      <p className="todo-footer">Hátralévő feladatok: {activeCount}</p>
    </main>
  )
}

export default App
```

- A `FilterBar` `onChange` propja maga a `setFilter`: a gomb a szűrő nevével hívja meg, és az lesz az új állapot.
- A `feltétel ? (…) : (…)` most két JSX-darab közül választ: ha nincs látható feladat, az `EMPTY_MESSAGES`-ből a
  szűrőhöz illő üzenet jelenik meg, különben a lista.
- A kipipálás, a szerkesztés és a törlés továbbra is a teljes `todos`-on dolgozik, az azonosító alapján. Ezért mindegy,
  melyik szűrő látszik éppen.

:::check Ellenőrizd
Az űrlap alatt három gomb: „Összes 3”, „Aktív 2”, „Kész 1” (a három mintafeladattal), az „Összes” sötét.
Kattints az „Aktív”-ra: a kész feladat eltűnik. Pipálj ki itt egy feladatot: az is eltűnik, a számok pedig
frissülnek. Pipáld ki az összeset: „Minden kész. Szép munka!”
:::

:::mistake Gyakori hiba
A szűrt listát visszaírni az állapotba: `setTodos(todos.filter((todo) => !todo.done))` az „Aktív” gombra. Elsőre
működik, de a kész feladatok ezzel **törlődnek**: az „Összes”-re visszakattintva sem jönnek vissza. A szűrés nézet, nem
módosítás: az állapot maradjon a teljes lista, a látható részt pedig számold ki.
:::

### Mentés a böngészőbe

Töltsd újra az oldalt: a lista megint a három mintafeladat. Hogy a feladatok megmaradjanak, elmentjük őket a
[[localStorage]]-be, amit a 2. és a 6. leckéből ismersz: a böngésző nevek (kulcsok) alatt szövegeket őriz benne, és
ezek bezárás után is megmaradnak.

Csakhogy a localStorage **kizárólag szöveget** tud tárolni, mi pedig egy objektumokból álló tömböt szeretnénk. Erre
való a [[JSON]], amit a 6. leckében már használtál: egy szöveges formátum, amellyel tömböket és objektumokat lehet
leírni.

- A `JSON.stringify(todos)` szöveggé alakítja a tömböt: `'[{"id":1,"text":"Megvenni a tejet","done":false},…]'`.
- A `JSON.parse(text)` visszaalakítja ugyanilyen tömbbé.

A mentést egy [[useEffect]] végzi. A 2. leckében is így mentetted a témát: az effekt a rajzolás után fut le, a
[[függőségi tömb]] (`[todos]`) miatt pedig mindig, amikor a lista megváltozott. Írd át az `src/App.jsx` elejét így. Az
`App` függvény második fele, az `activeCount`-tól a `return` végéig, nem változik: a lenti kódban egy `…` kezdetű
megjegyzés jelöli a helyét.

```jsx file=src/App.jsx mark=1,22-33,36,39-46
import { useEffect, useState } from 'react'
import { filterTodos } from './todoLogic.js'
import AddTodo from './components/AddTodo.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

// Mit írjunk ki, ha a szűrő után egy feladat sem marad.
const EMPTY_MESSAGES = {
  all: 'Nincs teendő. Írd be fent az elsőt!',
  active: 'Minden kész. Szép munka!',
  done: 'Még nincs elvégzett feladat.',
}

const STORAGE_KEY = 'todo-list'

// Beolvassa az elmentett feladatokat. Ha nincs mentés, vagy hibás, a mintafeladatokkal indulunk.
function readSavedTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Letiltott tároló vagy hibás mentés: marad a minta.
  }
  return START_TODOS
}

function App() {
  const [todos, setTodos] = useState(readSavedTodos)
  const [filter, setFilter] = useState('all') // 'all', 'active' vagy 'done'

  // Minden változás után elmentjük a listát, JSON-szövegként.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // Nem baj, ha nem sikerül: a lista így is működik, csak nem emlékszik.
    }
  }, [todos])

  // … innen minden marad, ahogy volt: activeCount, counts, visibleTodos, a négy handle… függvény és a return
}

export default App
```

- `useState(readSavedTodos)`: a függvényt adjuk át, nem az eredményét. Ez a [[lusta kezdőérték]] a 2. leckéből: a
  React csak az első rajzoláskor hívja meg, nem minden billentyűleütésnél.
- A `try … catch` miatt nem omlik össze az oldal, ha a böngésző letiltja a tárolót, vagy ha valaki kézzel elrontja a
  mentett szöveget (a `JSON.parse` hibás JSON-nál hibát dob).
- Az effekt a legelső rajzolás után is lefut, és elmenti a kezdő listát. Ez nem baj: ugyanazt írja vissza, amit
  beolvasott.

:::check Ellenőrizd
Adj hozzá egy feladatot, pipálj ki egy másikat, és töltsd újra az oldalt (++F5++): minden úgy maradt. A fejlesztői
eszközökben (++F12++ → Application → Local storage → `http://localhost:5173`) ott a `todo-list` kulcs, és mellette a
listád JSON-ként.
:::

:::mistake Gyakori hiba
`JSON.parse` nélkül: `return saved`. Újratöltés után üres az oldal, a konzolban pedig ez áll: `todos.filter is not a
function`. A `saved` egy szöveg, nem tömb, és a szövegnek nincs `filter` függvénye. Ami JSON-ként ment be, azt a
`JSON.parse`-szal kell kiolvasni.
:::

:::try Próbáld ki
Töröld a `todo-list` kulcsot a fejlesztői eszközökben (jobb klikk → Delete), és töltsd újra: visszajönnek a
mintafeladatok.
:::

### Saját hook: useLocalStorage

A szűrő is megmaradhatna újratöltés után. Ehhez ugyanezt a kódot kellene még egyszer leírnunk, más kulccsal és más
kezdőértékkel. Ehelyett írunk egy [[saját hookot|saját hook]], ami **bármit** el tud menteni. A 2. leckében már írtál
egyet, a `useDarkMode`-ot: egy `use`-zal kezdődő nevű függvényt, ami más hookokat hív. A 6. és a 7. leckében pedig egy
ugyanilyen `useLocalStorage`-et is megírtál már. Most abból a kódból rakjuk össze, ami eddig az `App`-ban volt, így az
is látszik, hogyan lesz egy ismétlődő kódrészletből saját hook. Ha megvan a saját változatod, hasonlítsd össze ezzel.

Hozd létre az `src/useLocalStorage.js` fájlt:

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

Ez ugyanaz a kód, ami eddig az `App`-ban volt, csak a kulcsot és a kezdőértéket paraméterként kapja. A lusta
kezdőérték most egy helyben megírt [[nyílfüggvény]] (`() => { … }`), mert szüksége van a `key`-re és az
`initialValue`-ra. A végén egy kételemű tömböt ad vissza, pont mint a `useState`, ezért ugyanúgy lehet használni:
`const [todos, setTodos] = useLocalStorage(…)`. Ez a tömbös [[destrukturálás]], amit minden `useState` sorban is
használsz: az első elem a `todos`-ba, a második a `setTodos`-ba kerül.

Az `App`-ból így kikerül a `STORAGE_KEY`, a `readSavedTodos` és az effekt. Itt a teljes fájl:

```jsx file=src/App.jsx mark=1,23-24
import useLocalStorage from './useLocalStorage.js'
import { filterTodos } from './todoLogic.js'
import AddTodo from './components/AddTodo.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

// Mit írjunk ki, ha a szűrő után egy feladat sem marad.
const EMPTY_MESSAGES = {
  all: 'Nincs teendő. Írd be fent az elsőt!',
  active: 'Minden kész. Szép munka!',
  done: 'Még nincs elvégzett feladat.',
}

function App() {
  const [todos, setTodos] = useLocalStorage('todo-list', START_TODOS)
  const [filter, setFilter] = useLocalStorage('todo-filter', 'all') // 'all', 'active' vagy 'done'

  // Nem állapot: minden rajzoláskor a todos-ból és a filter-ből számoljuk.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // Új tömb: az összes régi feladat, a végén az újjal.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // Új tömb, amelyben csak az a feladat cserélődik, amelyikre kattintottak.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleRename(id, text) {
    // Ugyanaz a minta, mint a kipipálásnál, csak most a szöveg cserélődik.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }

  function handleDelete(id) {
    // Új tömb az összes többi feladattal: azokkal, amelyeknek más az azonosítójuk.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
      <p className="todo-footer">Hátralévő feladatok: {activeCount}</p>
    </main>
  )
}

export default App
```

A `react`-ből semmit sem kell már importálni: az `App` a saját hookot hívja, a `useState` és a `useEffect` pedig a
hookon belül dolgozik. A feladatok kulcsa ugyanaz maradt (`'todo-list'`), ezért a már elmentett listád megmarad.

:::check Ellenőrizd
A feladatok továbbra is túlélik az újratöltést. Válaszd a „Kész” szűrőt, és töltsd újra: a „Kész” marad kiválasztva. A
Local storage-ben most a `todo-list` mellett ott a `todo-filter` kulcs is (a korábbi leckék kulcsai is ott lehetnek,
hiszen azok is a `http://localhost:5173` címen futottak). Utána kattints újra az „Összes” gombra: a következő lépések
úgy számolnak, hogy minden feladat látszik. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Két `useLocalStorage` ugyanazzal a kulccsal, például mindkettő `'todo-list'`. A két érték ugyanarra a helyre ment, így
a tárolóban mindig csak az utoljára mentett marad meg. Ha például a „Kész” szűrőt választod, a `todo-list` alatt a
`"done"` szöveg lesz, és újratöltés után a `todos` ezt kapja: az oldal üres, a konzolban pedig ott a már ismerős
`todos.filter is not a function`. Minden értéknek saját kulcs kell.
:::

## Haladó szint {level=3}

### Határidő és fontosság

Egy feladatnak lehet határideje és fontossága is. Az új feladat űrlapja kap egy [[legördülő listát|legördülő lista]]
(`<select>`) a fontossághoz („Ráér”, „Normál”, „Sürgős”) és egy dátummezőt (`<input type="date">`) a határidőhöz.
Mindkettő vezérelt mező, ugyanúgy, mint a szövegmező.

A dátummező a dátumot szövegként adja, így: `'2026-11-23'`, vagyis év-hónap-nap, mindig kétjegyű hónappal és nappal. Ez
az [[ISO-dátum]]. Nagy előnye, hogy két ilyen szöveget egyszerűen össze lehet hasonlítani: a `<` és a `>` ugyanazt
mondja, mint a naptár, mert balról jobbra előbb az év, aztán a hónap, végül a nap dönt. Hogy egy határidő lejárt-e,
ahhoz csak a mai napot kell ugyanilyen alakban előállítani. Hozd létre az `src/dates.js` fájlt:

```js file=src/dates.js
// A dátumokat ÉÉÉÉ-HH-NN alakú szövegként kezeljük, például '2026-11-23'. A dátummező is így adja őket.

// A mai nap, a gép órája szerint.
export function todayString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0') // a getMonth() 0-tól számol: a január a 0
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// 'overdue' (lejárt), 'today' (ma esedékes) vagy 'later' (később esedékes).
export function dueStatus(due, today) {
  if (due < today) return 'overdue'
  if (due === today) return 'today'
  return 'later'
}

const DUE_WORDS = { overdue: 'Lejárt', today: 'Ma', later: 'Határidő' }

// A címke szövege, például 'Lejárt: nov. 20.'
export function dueLabel(due, today) {
  const date = new Date(`${due}T00:00`).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
  return `${DUE_WORDS[dueStatus(due, today)]}: ${date}`
}
```

- A `new Date()` a pillanatnyi időpont. A `getFullYear()`, a `getMonth()` és a `getDate()` kiveszi belőle az évet, a
  hónapot és a hónap napját, számként. A `String(…)` szöveggé alakítja a számot, a `padStart(2, '0')` pedig
  kiegészíti, ha egyjegyű: a `'3'`-ból `'03'` lesz, így a hónap és a nap mindig két karakterből áll.
- A `toLocaleDateString` olvasható alakra hozza a dátumot, a megadott nyelv szokásai szerint. A
  `{ month: 'short', day: 'numeric' }` azt kéri, hogy csak a rövidített hónapnév és a nap jelenjen meg: `'hu-HU'`
  mellett például „nov. 20.” lesz belőle.
- A `T00:00` miatt a böngésző a saját időzónád éjfelének veszi a dátumot. Nélküle a világidő (UTC) éjfelének venné, és
  ahol az óra a világidő mögött jár (például Amerikában), az előző napot írná ki.

Most az űrlap. Írd át az `src/components/AddTodo.jsx`-et:

```jsx file=src/components/AddTodo.jsx mark=5-6,12,14-15,27-32
import { useState } from 'react'

function AddTodo({ onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('normal') // 'low', 'normal' vagy 'high'
  const [due, setDue] = useState('') // '' = nincs határidő

  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    const trimmed = text.trim()
    if (trimmed === '') return // üres feladatot nem veszünk fel
    onAdd({ text: trimmed, priority, due })
    setText('')
    setPriority('normal')
    setDue('')
  }

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        className="add-todo__text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Mit kell elintézni?"
        aria-label="Új feladat"
      />
      <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Fontosság">
        <option value="low">Ráér</option>
        <option value="normal">Normál</option>
        <option value="high">Sürgős</option>
      </select>
      <input type="date" value={due} onChange={(event) => setDue(event.target.value)} aria-label="Határidő" />
      <button type="submit" className="button button--primary">
        Hozzáadás
      </button>
    </form>
  )
}

export default AddTodo
```

Az `onAdd` mostantól nemcsak a szöveget kapja, hanem egy objektumot mindhárom adattal. Ezért az `App`-ban a
`handleAdd`-et is át kell írni. Cseréld le az `src/App.jsx`-ben a `handleAdd` függvényt erre:

```jsx file=src/App.jsx
  function handleAdd(values) {
    // A values az űrlap adatai: { text, priority, due }. A ...values mindet átmásolja az új feladatba.
    const newTodo = { id: crypto.randomUUID(), done: false, ...values }
    setTodos([...todos, newTodo])
  }
```

Végül a sorok. A `TodoItem` a szöveg mellé címkéket rajzol: „Sürgős” és „Ráér” a fontossághoz (a „Normál” nem kap
címkét, az a megszokott), és egy színes címkét a határidőhöz. Írd át az `src/components/TodoItem.jsx` elejét és a
második `return`-jét így (a szerkesztés része nem változik, azt a `…` kezdetű megjegyzés jelöli):

```jsx file=src/components/TodoItem.jsx mark=2,5-6,15-19
import { useState } from 'react'
import { dueLabel, dueStatus, todayString } from '../dates.js'

function TodoItem({ todo, onToggle, onRename, onDelete }) {
  // A mai nap, hogy a határidőt össze tudjuk vele hasonlítani.
  const today = todayString()
  // … az editing és a draft állapot, a startEditing, a handleSave, a handleKeyDown és az if (editing) rész, mint eddig

  return (
    <li className={todo.done ? 'todo-item is-done' : 'todo-item'}>
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <span className="todo-item__tags">
        {todo.priority === 'high' && <span className="tag tag--high">Sürgős</span>}
        {todo.priority === 'low' && <span className="tag tag--low">Ráér</span>}
        {todo.due && <span className={`tag tag--${dueStatus(todo.due, today)}`}>{dueLabel(todo.due, today)}</span>}
      </span>
      {/* … a todo-item__actions div a két gombbal, mint eddig … */}
    </li>
  )
}

export default TodoItem
```

A `tag--${…}` megint template literal: a lejárt határidő a `tag--overdue`, a mai a `tag--today`, a későbbi a
`tag--later` osztályt kapja (piros, sárga, kék). A régi feladataidnak és a mintafeladatoknak nincs `priority` és `due`
mezőjük: náluk a `todo.priority` és a `todo.due` értéke `undefined`, így egyik feltétel sem teljesül, és nem kapnak
címkét. Az üres határidő (`''`) is hamisnak számít, ezért a dátum nélkül felvett új feladat sem kap határidőcímkét. Így
a régi mentést sem kell átalakítani.

:::check Ellenőrizd
Az űrlapon a szövegmező alatt egy legördülő lista („Normál”) és egy dátummező jelenik meg. Vegyél fel egy feladatot
„Sürgős” fontossággal és tegnapi határidővel: a sorában egy rózsaszín „Sürgős” és egy piros „Lejárt: …” címke áll. Egy
mai határidő sárga „Ma: …”, egy jövő heti kék „Határidő: …” címkét kap. Hozzáadás után a legördülő lista visszaáll
„Normál”-ra, a dátummező pedig kiürül.
:::

:::mistake Gyakori hiba
`new Date().toISOString().slice(0, 10)` a mai napra. Ez is `'2026-11-23'` alakú, de világidőben (UTC) számol: nálunk
éjfél és hajnali egy-kettő között még a tegnapi dátumot adja, így egy mai határidő éjszaka „Határidő”-nek látszik.
A `todayString` a gép saját órája szerint számol.
:::

:::try Feladat
A sürgős feladatok kerüljenek előre a listában. Az `App`-ban a `visibleTodos`-t rendezd: a
`filterTodos(todos, filter).toSorted((a, b) => …)` egy rendezett másolatot ad, az eredeti tömb nem változik. A
függvény negatív számot adjon, ha az `a` kerül előre, és pozitívat, ha a `b`. A következő lépés előtt vedd ki a
rendezést, mert ott kézzel fogjuk sorba rakni a feladatokat.
:::

### Átrendezés húzással

A feladatok sorrendje eddig a felvétel sorrendje volt. Most átrendezhetővé tesszük őket: egy sort megfogsz az egérrel,
és ráejted arra a sorra, amelyiknek a helyére kerülnie kell. Ehhez a böngésző [[Drag and Drop API]]-ját használjuk (drag
and drop: fogd és vidd). Négy esemény kell hozzá:

- `dragstart`: elkezdtél húzni egy elemet. Csak olyat lehet, aminek `draggable` attribútuma van.
- `dragover`: a húzott elem éppen egy másik fölött jár. A böngésző alapból sehová nem engedi ejteni; ha az
  eseménykezelő meghívja az `event.preventDefault()`-ot, ide igen.
- `drop`: elengedted az egeret egy elem fölött.
- `dragend`: vége a húzásnak, akár sikerült az ejtés, akár nem.

A húzás csak egérrel működik. Hogy billentyűzettel és telefonon is át lehessen rendezni, minden sor kap két kis gombot
is: ↑ és ↓.

Előbb a logika: egy függvény, ami egy feladatot egy másik helyére tesz. Írd az `src/todoLogic.js` végére:

```js file=src/todoLogic.js
// Áthelyezi a fromId feladatot oda, ahol most a toId feladat áll.
export function moveTodo(todos, fromId, toId) {
  const from = todos.findIndex((todo) => todo.id === fromId)
  const to = todos.findIndex((todo) => todo.id === toId)
  if (from === -1 || to === -1) return todos
  const copy = [...todos]
  const [moved] = copy.splice(from, 1) // kivesszük a régi helyéről…
  copy.splice(to, 0, moved) // …és betesszük az újra
  return copy
}
```

- A `findIndex` megmondja, hányadik helyen áll (0-tól számolva) az az elem, amelyre a függvény `true`-t ad. Ha egy sem
  ilyen, `-1`-et ad.
- A `splice` **átírja** a tömböt, amin meghívod: a `splice(from, 1)` kivesz egy elemet a `from` helyről, és egy
  egyelemű tömbben visszaadja (a `const [moved]` destrukturálással kiveszi belőle ezt az elemet); a
  `splice(to, 0, moved)` pedig nem vesz ki semmit, csak beszúrja a `moved`-et a `to` helyre. Mivel átír, előbb egy
  másolatot készítünk (`copy`): az állapotban lévő tömbhöz nem nyúlunk.

Most a `TodoItem`. A sor kapja meg a négy eseményt és a két nyilat. Itt a teljes `src/components/TodoItem.jsx`:

```jsx file=src/components/TodoItem.jsx mark=4,50-52,55-67,79-94
import { useState } from 'react'
import { dueLabel, dueStatus, todayString } from '../dates.js'

function TodoItem({ todo, dragging, onToggle, onRename, onDelete, onMove, onDragStart, onDragEnd, onDrop }) {
  // A mai nap, hogy a határidőt össze tudjuk vele hasonlítani.
  const today = todayString()
  // Helyi állapot: csak ez a sor tudja, hogy éppen szerkesztik-e, és mi van a mezőben.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function startEditing() {
    setDraft(todo.text)
    setEditing(true)
  }

  function handleSave(event) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (trimmed !== '') onRename(todo.id, trimmed)
    setEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <li className="todo-item is-editing">
        <form className="todo-edit" onSubmit={handleSave}>
          <input
            className="todo-edit__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="A feladat új szövege"
            autoFocus
          />
          <button type="submit" className="button button--small button--primary">
            Mentés
          </button>
          <button type="button" className="button button--small" onClick={() => setEditing(false)}>
            Mégse
          </button>
        </form>
      </li>
    )
  }

  let className = 'todo-item'
  if (todo.done) className += ' is-done'
  if (dragging) className += ' is-dragging'

  return (
    <li
      className={className}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', todo.text) // a Firefox enélkül el sem kezdi a húzást
        onDragStart(todo.id)
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()} // enélkül ide nem lehetne ejteni
      onDrop={(event) => {
        event.preventDefault()
        onDrop(todo.id)
      }}
    >
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <span className="todo-item__tags">
        {todo.priority === 'high' && <span className="tag tag--high">Sürgős</span>}
        {todo.priority === 'low' && <span className="tag tag--low">Ráér</span>}
        {todo.due && <span className={`tag tag--${dueStatus(todo.due, today)}`}>{dueLabel(todo.due, today)}</span>}
      </span>
      <div className="todo-item__actions">
        <button
          type="button"
          className="button button--small"
          onClick={() => onMove(todo.id, -1)}
          aria-label={`Feljebb: ${todo.text}`}
        >
          ↑
        </button>
        <button
          type="button"
          className="button button--small"
          onClick={() => onMove(todo.id, 1)}
          aria-label={`Lejjebb: ${todo.text}`}
        >
          ↓
        </button>
        <button
          type="button"
          className="button button--small"
          onClick={startEditing}
          aria-label={`Szerkesztés: ${todo.text}`}
        >
          Szerkesztés
        </button>
        <button
          type="button"
          className="button button--small"
          onClick={() => onDelete(todo.id)}
          aria-label={`Törlés: ${todo.text}`}
        >
          Törlés
        </button>
      </div>
    </li>
  )
}

export default TodoItem
```

- A `className` most három dologtól függ, ezért egy `let` változóban, lépésenként rakjuk össze: a `+=` a végéhez fűz.
- Az `event.dataTransfer` a húzás „csomagja”: ebbe tehetsz adatot, amit az ejtés helyén ki lehet venni. A
  `'text/plain'` azt jelzi, hogy sima szöveg kerül bele. Nekünk nem kell, mert az azonosítót az `App` jegyzi meg, de a
  Firefox csak akkor kezd húzni, ha van benne valami.
- A `drop`-nál az `event.preventDefault()` megakadályozza, hogy a böngésző a saját módján kezelje az ejtést (a Firefox
  például megpróbálná címként megnyitni a szöveget).

Az `App` jegyzi meg, melyik feladatot húzzák éppen (`draggedId`), és az végzi az áthelyezést. A nyilak a **látható**
listában lépnek egyet: ha egy szűrő elrejt néhány feladatot, a nyíl a következő látható feladat helyére visz. Itt a
teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=1,3,26,54-65,80,84-87
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { filterTodos, moveTodo } from './todoLogic.js'
import AddTodo from './components/AddTodo.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

// Mit írjunk ki, ha a szűrő után egy feladat sem marad.
const EMPTY_MESSAGES = {
  all: 'Nincs teendő. Írd be fent az elsőt!',
  active: 'Minden kész. Szép munka!',
  done: 'Még nincs elvégzett feladat.',
}

function App() {
  const [todos, setTodos] = useLocalStorage('todo-list', START_TODOS)
  const [filter, setFilter] = useLocalStorage('todo-filter', 'all') // 'all', 'active' vagy 'done'
  const [draggedId, setDraggedId] = useState(null) // a húzott feladat azonosítója, vagy null

  // Nem állapot: minden rajzoláskor a todos-ból és a filter-ből számoljuk.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(values) {
    // A values az űrlap adatai: { text, priority, due }. A ...values mindet átmásolja az új feladatba.
    const newTodo = { id: crypto.randomUUID(), done: false, ...values }
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // Új tömb, amelyben csak az a feladat cserélődik, amelyikre kattintottak.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleRename(id, text) {
    // Ugyanaz a minta, mint a kipipálásnál, csak most a szöveg cserélődik.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }

  function handleDelete(id) {
    // Új tömb az összes többi feladattal: azokkal, amelyeknek más az azonosítójuk.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // A húzott feladatot a targetId feladatra ejtették: a helyére kerül.
  function handleDrop(targetId) {
    if (draggedId !== null) setTodos(moveTodo(todos, draggedId, targetId))
    setDraggedId(null)
  }

  // A nyilak: egy hellyel feljebb (-1) vagy lejjebb (+1) a látható listában.
  function handleMove(id, step) {
    const index = visibleTodos.findIndex((todo) => todo.id === id)
    const neighbor = visibleTodos[index + step]
    if (neighbor) setTodos(moveTodo(todos, id, neighbor.id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              dragging={draggedId === todo.id}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
              onMove={handleMove}
              onDragStart={setDraggedId}
              onDragEnd={() => setDraggedId(null)}
              onDrop={handleDrop}
            />
          ))}
        </ul>
      )}
      <p className="todo-footer">Hátralévő feladatok: {activeCount}</p>
    </main>
  )
}

export default App
```

A legelső feladatnál a `visibleTodos[index - 1]` nem létezik: az értéke `undefined`, ezért a ↑ ott nem csinál
semmit. Ugyanígy a ↓ a legutolsónál.

:::check Ellenőrizd
Fogd meg egérrel az első feladatot, húzd rá a harmadikra, és engedd el: a harmadik helyre kerül, a húzás közben pedig
halvány, szaggatott keretes. Kattints egy feladat ↓ gombjára: helyet cserél az alatta lévővel. Töltsd újra az oldalt:
az új sorrend megmaradt, hiszen a `todos` tömb sorrendje változott, és azt menti a hook.
:::

:::mistake Gyakori hiba
Kimarad az `onDragOver={(event) => event.preventDefault()}`. A sor húzható, de bárhol engeded el, visszaugrik, és a
`drop` esemény sosem fut le: a böngésző alapból sehová nem enged ejteni.
:::

:::concept Miért nem működik a húzás a telefonon?
A Drag and Drop API az egérhez készült: a legtöbb telefonos böngésző érintésre nem indítja el. Az érintéses húzáshoz
a Pointer Events (mutatóesemények) kellenek, és jóval több kód: a húzott sort neked kell az ujjad alatt mozgatni. Erre
a későbbi leckékben visszatérünk. Addig a ↑ és ↓ gombok mindenhol működnek, egérrel, billentyűzettel (++Tab++, aztán
++Enter++) és érintéssel is.
:::

### Tiszta függvények és tesztek

Ebben a leckében eddig minden változtatás után kézzel kattintottál végig az appon, hogy működik-e még. Ez egy idő után
fárasztó, és könnyű kifelejteni valamit. A 8. leckében, a számológépnél már írtál erre megoldást: egy
[[automatikus teszt|teszt]] olyan kis program, ami meghívja a kódodat, és ellenőrzi, hogy azt adja-e, amit vársz. Egy
parancs, és pár ezredmásodperc alatt kiderül, hogy minden rendben van-e.

Ahogy a 8. leckében láttad, legkönnyebben a [[tiszta függvényeket|tiszta függvény]] lehet tesztelni. A tiszta függvény
csak a paramétereiből dolgozik, nem ír át semmit (se a paramétereit, se a képernyőt, se a localStorage-et), és ugyanarra
a bemenetre mindig ugyanazt adja. A `filterTodos` és a `moveTodo` ilyen. Az `App` eseménykezelőinek a belseje is lehetne
ilyen, ezért átköltöztetjük őket a `todoLogic.js`-be. Itt a teljes `src/todoLogic.js`:

```js file=src/todoLogic.js mark=3-21
// Feladatlistákkal dolgozó függvények. Nincs bennük React: egy tömböt kapnak, és egy újat adnak vissza.

// Új, még nem kész feladat a lista végén. A values: { text, priority, due }.
export function addTodo(todos, values) {
  return [...todos, { id: crypto.randomUUID(), done: false, ...values }]
}

// A megadott feladat kész lesz, vagy újra nyitott.
export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
}

// A megadott feladat új szöveget kap.
export function renameTodo(todos, id, text) {
  return todos.map((todo) => (todo.id === id ? { ...todo, text } : todo))
}

// Minden feladat, kivéve a megadottat.
export function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id)
}

// A szűrőnek megfelelő feladatok: 'all' (összes), 'active' (még nincs kész) vagy 'done' (kész).
export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((todo) => !todo.done)
  if (filter === 'done') return todos.filter((todo) => todo.done)
  return todos
}

// Áthelyezi a fromId feladatot oda, ahol most a toId feladat áll.
export function moveTodo(todos, fromId, toId) {
  const from = todos.findIndex((todo) => todo.id === fromId)
  const to = todos.findIndex((todo) => todo.id === toId)
  if (from === -1 || to === -1) return todos
  const copy = [...todos]
  const [moved] = copy.splice(from, 1) // kivesszük a régi helyéről…
  copy.splice(to, 0, moved) // …és betesszük az újra
  return copy
}
```

(Az `addTodo` egy kicsit csal: a véletlen azonosító miatt két hívás nem ad pontosan ugyanolyan eredményt. A teszt ezért
nem az azonosítót ellenőrzi, csak a többi mezőt.)

Az `src/App.jsx`-ben a `todoLogic.js` importja mostantól mind a hat függvényt behozza. Cseréld le a régi
`import { filterTodos, moveTodo } from './todoLogic.js'` sort erre:

```jsx file=src/App.jsx
import { addTodo, deleteTodo, filterTodos, moveTodo, renameTodo, toggleTodo } from './todoLogic.js'
```

A négy eseménykezelő belseje pedig egy-egy sor lesz. Cseréld le őket (a `handleDrop` és a `handleMove` marad, ahogy
volt):

```jsx file=src/App.jsx
  function handleAdd(values) {
    setTodos(addTodo(todos, values))
  }

  function handleToggle(id) {
    setTodos(toggleTodo(todos, id))
  }

  function handleRename(id, text) {
    setTodos(renameTodo(todos, id, text))
  }

  function handleDelete(id) {
    setTodos(deleteTodo(todos, id))
  }
```

Most jöhet a teszt. Ahogy a 8. leckében, most is a Node.js beépített [[tesztfuttatóját|tesztfuttató]] használjuk: a
`node --test` parancs megkeresi a projektben a `.test.js` végű fájlokat, és lefuttatja őket. Csomagot sem kell hozzá
telepíteni. Hozd létre az `src/todoLogic.test.js` fájlt:

```js file=src/todoLogic.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addTodo, deleteTodo, filterTodos, moveTodo, toggleTodo } from './todoLogic.js'

// Egy kis mintalista. Minden teszt ebből indul.
const SAMPLE = [
  { id: 1, text: 'Tej', done: false },
  { id: 2, text: 'Kenyér', done: true },
  { id: 3, text: 'Sajt', done: false },
]

// Csak az azonosítók, sorrendben: ezeket könnyű összehasonlítani.
function ids(todos) {
  return todos.map((todo) => todo.id)
}

test('addTodo: az új feladat a lista végére kerül, még nincs kész', () => {
  const result = addTodo(SAMPLE, { text: 'Alma' })
  assert.equal(result.length, 4)
  assert.equal(result[3].text, 'Alma')
  assert.equal(result[3].done, false)
  assert.equal(SAMPLE.length, 3) // az eredeti lista nem változott
})

test('toggleTodo: csak a megadott feladat fordul át', () => {
  const result = toggleTodo(SAMPLE, 2)
  assert.deepEqual(
    result.map((todo) => todo.done),
    [false, false, false],
  )
  assert.equal(SAMPLE[1].done, true) // az eredeti feladat nem változott
})

test('deleteTodo: a megadott feladat eltűnik, a többi marad', () => {
  assert.deepEqual(ids(deleteTodo(SAMPLE, 1)), [2, 3])
})

test('moveTodo: a feladat a célfeladat helyére kerül', () => {
  assert.deepEqual(ids(moveTodo(SAMPLE, 1, 3)), [2, 3, 1])
  assert.deepEqual(ids(moveTodo(SAMPLE, 3, 1)), [3, 1, 2])
})

test('filterTodos: összes, aktív és kész', () => {
  assert.deepEqual(ids(filterTodos(SAMPLE, 'all')), [1, 2, 3])
  assert.deepEqual(ids(filterTodos(SAMPLE, 'active')), [1, 3])
  assert.deepEqual(ids(filterTodos(SAMPLE, 'done')), [2])
})
```

- A `test('név', () => { … })` egy tesztet ír le: egy nevet, ami elmondja, mit vársz, és egy függvényt, ami
  ellenőrzi.
- Az `assert.equal(a, b)` akkor sikeres, ha `a` és `b` ugyanaz; ha nem, a teszt elbukik, és kiírja mindkettőt. A
  `deepEqual` tömböket és objektumokat hasonlít össze elemről elemre (két külön tömb az `equal` szerint sosem ugyanaz,
  akkor sem, ha ugyanaz van bennük).
- A tesztek azt is ellenőrzik, hogy a `SAMPLE` nem változott meg: ez a tiszta függvények ígérete.

Hogy egy rövid paranccsal indíthasd, vedd fel a `package.json` `scripts` részébe a `test` sort (a `preview` sor végére
kell egy vessző):

```json file=package.json mark=4-5
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test"
  },
```

A fejlesztői szervert hagyd futni, és nyiss egy második terminált (VS Code-ban a terminál fülsorában a **+** jellel).
Abba írd be:

```shell
npm test
```

:::check Ellenőrizd
A terminál mind az öt tesztet kiírja, mindegyik előtt egy pipával (✔), a végén pedig: `pass 5` és `fail 0`. Az app a
böngészőben ugyanúgy működik, mint eddig.
:::

:::try Próbáld ki: milyen, ha elbukik?
Rontsd el szándékosan a `deleteTodo`-t: írd a `!==` helyére azt, hogy `===`, és futtasd újra az `npm test`-et. A
`deleteTodo` teszt piros ✖ jelet kap, a végén pedig: `pass 4` és `fail 1`. Alatta a hiba részletei: az `actual` az,
amit a függvény adott (`[ 1 ]`), az `expected` az, amit a teszt várt (`[ 2, 3 ]`). Javítsd ki, és újra minden zöld.
:::

:::try Feladat
Írj egy hatodik tesztet a `renameTodo`-hoz (a fájl eleji importba ezt is vedd fel): nevezd át a 3-as feladatot, és
ellenőrizd az új szöveget, meg azt, hogy a másik két feladat szövege változatlan.
:::

### A lista saját komponensben

A következő lépésben az `App` vagy egy belépési űrlapot, vagy a listát mutatja. Ehhez előbb a lista saját
komponensbe költözik: hozd létre az `src/components/TodoList.jsx` fájlt. A tartalma szinte szóról szóra a mostani
`App`: csak a neve `TodoList`, az importok útvonala változik (ami az `src`-ben van, az most `../`-rel kezdődik, a
szomszédos komponensek pedig `./`-rel), az `App.css` importja kimarad, és nincs benne sem `<main>`, sem cím, mert
ezek az `App`-ban maradnak.

```jsx file=src/components/TodoList.jsx mark=2-6,22,62,86,90
import { useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import { addTodo, deleteTodo, filterTodos, moveTodo, renameTodo, toggleTodo } from '../todoLogic.js'
import AddTodo from './AddTodo.jsx'
import FilterBar from './FilterBar.jsx'
import TodoItem from './TodoItem.jsx'

// Mintafeladatok, hogy legyen mit megjeleníteni.
const START_TODOS = [
  { id: 1, text: 'Megvenni a tejet', done: false },
  { id: 2, text: 'Felhívni a nagymamát', done: true },
  { id: 3, text: 'Megírni a házit', done: false },
]

// Mit írjunk ki, ha a szűrő után egy feladat sem marad.
const EMPTY_MESSAGES = {
  all: 'Nincs teendő. Írd be fent az elsőt!',
  active: 'Minden kész. Szép munka!',
  done: 'Még nincs elvégzett feladat.',
}

function TodoList() {
  const [todos, setTodos] = useLocalStorage('todo-list', START_TODOS)
  const [filter, setFilter] = useLocalStorage('todo-filter', 'all') // 'all', 'active' vagy 'done'
  const [draggedId, setDraggedId] = useState(null) // a húzott feladat azonosítója, vagy null

  // Nem állapot: minden rajzoláskor a todos-ból és a filter-ből számoljuk.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(values) {
    setTodos(addTodo(todos, values))
  }

  function handleToggle(id) {
    setTodos(toggleTodo(todos, id))
  }

  function handleRename(id, text) {
    setTodos(renameTodo(todos, id, text))
  }

  function handleDelete(id) {
    setTodos(deleteTodo(todos, id))
  }

  // A húzott feladatot a targetId feladatra ejtették: a helyére kerül.
  function handleDrop(targetId) {
    if (draggedId !== null) setTodos(moveTodo(todos, draggedId, targetId))
    setDraggedId(null)
  }

  // A nyilak: egy hellyel feljebb (-1) vagy lejjebb (+1) a látható listában.
  function handleMove(id, step) {
    const index = visibleTodos.findIndex((todo) => todo.id === id)
    const neighbor = visibleTodos[index + step]
    if (neighbor) setTodos(moveTodo(todos, id, neighbor.id))
  }

  return (
    <>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              dragging={draggedId === todo.id}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
              onMove={handleMove}
              onDragStart={setDraggedId}
              onDragEnd={() => setDraggedId(null)}
              onDrop={handleDrop}
            />
          ))}
        </ul>
      )}
      <p className="todo-footer">Hátralévő feladatok: {activeCount}</p>
    </>
  )
}

export default TodoList
```

A `<>` és a `</>` egy [[Fragment]]: egy „láthatatlan” csomagolás. Egy komponens csak egy elemet adhat vissza, a
Fragment pedig úgy fog össze többet, hogy maga nem jelenik meg az oldalon. Így az űrlap, a szűrők és a lista továbbra
is közvetlenül a `<main>` kártyájában ülnek, és a stílusuk sem változik.

Az `App` így nagyon rövid lesz. Írd át az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,8
import TodoList from './components/TodoList.jsx'
import './App.css'

function App() {
  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <TodoList />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Az oldal pontosan úgy néz ki, és úgy működik, mint eddig: megvannak a feladataid, a szűrők, a húzás és a nyilak is
működnek. Csak a kód lett más: a lista minden része a `TodoList`-ben van, az `App` pedig a cím alá már csak ezt az
egy komponenst rajzolja ki. Ha így van, commitold!
:::

:::mistake Gyakori hiba
A `TodoList.jsx`-ben `'./useLocalStorage.js'` marad `'../useLocalStorage.js'` helyett. Az oldal helyén a Vite piros
hibaüzenete jelenik meg: `Failed to resolve import "./useLocalStorage.js"`. A `TodoList.jsx` a `components` mappában
van, ezért ami az `src`-ben van, ahhoz egy mappát feljebb kell lépni (`..`); a szomszédos komponensek viszont maradnak
`./`-rel.
:::

### Belépés

Most a teendőid ebben az egy böngészőben élnek. Egy igazi teendőlista egy [[szerveren|szerver]] tárolja őket, egy
[[adatbázisban|adatbázis]]: így a telefonodról és a gépedről is ugyanazt a listát látod, és mindenki csak a sajátját.
Ehhez először tudni kell, ki vagy: kell egy [[bejelentkezés]].

Igazi szervert ebben a kurzusban nem használunk: a kiinduló projekttel érkezett `src/fakeServer.js` csak eljátssza a
szerver szerepét. Az adatbázisa egy kulcs a localStorage-ben, de úgy viselkedik, mint egy szerver: minden válaszra
várni kell egy kicsit, és néha nem is jön válasz. Három függvényt ad:

- `logIn(name, password)`: belépés. Az első belépés egy új névvel létrehozza a fiókot, a jelszóval együtt. Rossz
  jelszónál hibát dob, aminek a `status` mezője `401`.
- `fetchTodos(name)`: a felhasználó feladatai (egy új fióknál üres tömb).
- `saveTodos(name, todos)`: elmenti a felhasználó feladatait.

Mindhárom [[Promise]]-t ad vissza, ezért `await`-tel kell megvárni őket egy [[async függvényben|async függvény]], és
[[try/catch]]-csel elkapni a hibát, ahogy a 3. leckében a vágólapnál. A hibák egy [[HTTP-státuszkódot|HTTP-státuszkód]]
is hoznak: egy háromjegyű számot, amivel az igazi szerverek is jelzik, mi a baj. A `401` azt jelenti, hogy a szerver
nem tudta azonosítani, ki vagy (itt: rossz a jelszó), az `503` pedig azt, hogy a szerver most nem elérhető.

A belépési űrlap az `src/components/LoginForm.jsx` fájlba kerül:

```jsx file=src/components/LoginForm.jsx
import { useState } from 'react'
import { logIn } from '../fakeServer.js'

function LoginForm({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false) // fut-e éppen a belépés

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '' || password === '') {
      setError('Add meg a neved és a jelszavad.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const user = await logIn(name.trim(), password)
      onLogin(user.name)
    } catch (err) {
      setError(err.status === 401 ? 'Hibás jelszó.' : 'A szerver nem válaszol. Próbáld újra!')
      setBusy(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h2>Belépés</h2>
      <p className="login__hint">
        Az első belépéskor létrejön a fiókod. Ne a valódi jelszavadat használd: ez csak egy gyakorló szerver.
      </p>
      <label className="field">
        Név
        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" />
      </label>
      <label className="field">
        Jelszó
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--primary" disabled={busy}>
        {busy ? 'Belépés…' : 'Belépés'}
      </button>
    </form>
  )
}

export default LoginForm
```

- A `busy` állapot addig igaz, amíg a szerver válaszára várunk: a `disabled={busy}` ilyenkor letiltja a gombot, és
  „Belépés…” áll rajta, így nem lehet kétszer beküldeni. Sikeres belépés után nem kell visszaállítani, mert az űrlap
  úgyis eltűnik; hibánál viszont igen, hogy újra lehessen próbálkozni.
- A `catch (err)` megkapja a hibát, az `err.status` pedig megmondja, mi történt: rossz jelszó (`401`), vagy a szerver
  nem válaszolt.
- A `role="alert"` arra kéri a képernyőolvasókat, hogy rögtön olvassák fel a hibaüzenetet, amint megjelenik, ahogy az
  5. leckében.
- Az `autoComplete` megmondja a böngészőnek, melyik mező a felhasználónév, és melyik a jelszó.

Az `App` most már két dolgot mutathat: ha senki sincs belépve, az űrlapot, különben a listát. Írd át az
`src/App.jsx`-et (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1-2,7-8,13-24,26-27
import useLocalStorage from './useLocalStorage.js'
import LoginForm from './components/LoginForm.jsx'
import TodoList from './components/TodoList.jsx'
import './App.css'

function App() {
  // Ki van belépve? A név túléli az újratöltést, ahogy egy igazi bejelentkezés is.
  const [user, setUser] = useLocalStorage('todo-user', null)

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      {user === null ? (
        <LoginForm onLogin={setUser} />
      ) : (
        <>
          <div className="todo-user">
            <span>
              Belépve: <strong>{user}</strong>
            </span>
            <button type="button" className="button button--small" onClick={() => setUser(null)}>
              Kilépés
            </button>
          </div>
          <TodoList />
        </>
      )}
    </main>
  )
}

export default App
```

A belépett felhasználó neve is a `useLocalStorage`-be kerül, így újratöltés után sem kell újra belépni. A `null` azt
jelenti, hogy senki sincs belépve; a „Kilépés” erre állítja vissza. A feltétel második ágában megint egy Fragment
fogja össze a felhasználó sávját és a listát.

:::check Ellenőrizd
A cím alatt a „Belépés” űrlap jelenik meg. Írj be egy nevet (például „Anna”) és egy jelszót, és lépj be: a gomb
felirata egy pillanatra „Belépés…” lesz, aztán megjelenik a „Belépve: Anna” sáv, alatta pedig a listád. Lépj ki, és
próbálj belépni ugyanazzal a névvel, de más jelszóval: „Hibás jelszó.” Néha a helyes jelszóra is az jön, hogy „A
szerver nem válaszol”: ez a kitalált szerver rossz napja, próbáld újra.
:::

:::mistake Gyakori hiba
A `catch` ágból kimarad a `setBusy(false)`. Egy rossz jelszó után megjelenik a „Hibás jelszó.” üzenet, de a gomb
letiltva marad, „Belépés…” felirattal: újra próbálkozni csak az oldal újratöltésével lehet.
:::

:::concept Hogyan csinálja egy igazi szerver?
Egy igazi szerver a jelszót sosem tárolja olvasható formában, csak egy [[hash]]-ét (ujjlenyomatát), amiből a jelszót nem
lehet visszafejteni. Sikeres belépés után egy [[tokent|hozzáférési token]] ad: egy hosszú, kitalálhatatlan szöveget,
amit a böngésző minden további kéréshez mellékel, és amiből a szerver tudja, ki kérdez. A mi kitalált szerverünk csak a
nevet kéri, így bárki lekérhetné bárki listáját: gyakorlásnak jó, élesben nem. A belépéssel egy későbbi lecke
foglalkozik részletesen.
:::

### A feladatok a szerveren

Lépj ki, és lépj be egy másik névvel: ugyanazt a listát látod. A feladatok még mindig a böngésző `todo-list` kulcsában
vannak, közösen. Most a szerverre költözik a lista, felhasználónként: minden fiók a saját listáját kapja (egy új fiók
üreset), a mostani feladataid pedig a `todo-list` kulcsban maradnak, a szerverre nem kerülnek át.

A szerverrel egy saját hook tartja a kapcsolatot: ez tölti be a listát, amikor a lista megjelenik, és ez küldi el a
szervernek minden változás után. Hozd létre az `src/useServerTodos.js` fájlt:

```js file=src/useServerTodos.js
import { useEffect, useState } from 'react'
import { fetchTodos, saveTodos } from './fakeServer.js'

// A belépett felhasználó feladatai, a szerverről betöltve, és minden változáskor oda elmentve.
function useServerTodos(user) {
  const [todos, setTodos] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' vagy 'error'
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved', 'saving' vagy 'failed'
  const [attempt, setAttempt] = useState(0) // az „Újra” gomb növeli, és ez újraindítja a betöltést

  // Betöltés: amikor a lista megjelenik, és minden újrapróbálkozáskor.
  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const list = await fetchTodos(user)
        if (ignore) return
        setTodos(list)
        setStatus('ready')
      } catch {
        if (!ignore) setStatus('error')
      }
    }

    load()
    // Takarítás: ha közben kilépett a felhasználó, vagy újra próbálkozunk, ennek a kérésnek a válasza már nem kell.
    return () => {
      ignore = true
    }
  }, [user, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  // Minden változás azonnal látszik, közben pedig elküldjük a szervernek az egész listát.
  async function changeTodos(newTodos) {
    setTodos(newTodos)
    setSaveStatus('saving')
    try {
      await saveTodos(user, newTodos)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('failed')
    }
  }

  return { todos, setTodos: changeTodos, status, saveStatus, retry }
}

export default useServerTodos
```

Olvassuk végig darabonként.

- **Betöltés.** Az effekt a lista első megjelenésekor fut le. Maga az effektfüggvény nem lehet `async`, mert csak egy
  takarító függvényt (vagy semmit) adhat vissza, egy Promise-t nem. Ezért benne írunk egy `async function load()`-ot,
  és rögtön meg is hívjuk.
- **Három állapot.** Amíg a válaszra várunk, a `status` `'loading'`; ha megjött, `'ready'`; ha hiba jött, `'error'`.
  A `retry` visszaállítja `'loading'`-ra, és növeli az `attempt`-et. Mivel az `attempt` a
  [[függőségi tömbben|függőségi tömb]] van, az effekt újra lefut, vagyis újra próbálkozik.
- **Az `ignore`.** A válasz nem azonnal érkezik, és közben sok minden történhet: a felhasználó kilép, vagy az „Újra”
  gomb egy új kérést indít. A [[takarító függvény]] ilyenkor `true`-ra állítja az `ignore`-t, és ennek a kérésnek a
  késve érkező válaszát eldobjuk. Különben egy régi válasz felülírhatná egy újabbét: ezt a hibát
  [[versenyhelyzetnek|versenyhelyzet]] hívják, ahogy az 5. leckében. Fejlesztés közben a [[StrictMode]] szándékosan
  kétszer futtatja az effekteket; az első futás válaszát is az `ignore` dobja el.
- **Mentés.** A `changeTodos` azonnal frissíti a képernyőt, aztán elküldi a teljes listát a szervernek, és közben a
  `saveStatus` mutatja, hol tart. A hook ezt adja ki `setTodos` néven, így a `TodoList` eseménykezelőin semmit sem kell
  változtatni.

Miért nem egy effekt menti a listát, mint a `useLocalStorage`-ben? Az effekt a betöltés után is lefutna, és rögtön
visszaküldené a szervernek azt, amit éppen onnan kapott. És ha a mentés nem sikerül, azt egy effektből nehéz
visszajelezni. A mentés egy felhasználói művelet következménye, ezért ott a helye, ahol a művelet történik.

Most a `TodoList`. A `START_TODOS` kikerül belőle (egy új fiók üres listával indul), a feladatok a szerverről jönnek,
és amíg nincsenek meg, egy üzenet látszik helyettük. Itt a teljes `src/components/TodoList.jsx`:

```jsx file=src/components/TodoList.jsx mark=3,16-21,23-24,62-75,101-111
import { useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import useServerTodos from '../useServerTodos.js'
import { addTodo, deleteTodo, filterTodos, moveTodo, renameTodo, toggleTodo } from '../todoLogic.js'
import AddTodo from './AddTodo.jsx'
import FilterBar from './FilterBar.jsx'
import TodoItem from './TodoItem.jsx'

// Mit írjunk ki, ha a szűrő után egy feladat sem marad.
const EMPTY_MESSAGES = {
  all: 'Nincs teendő. Írd be fent az elsőt!',
  active: 'Minden kész. Szép munka!',
  done: 'Még nincs elvégzett feladat.',
}

// A mentés állapota, a lista alatt.
const SAVE_MESSAGES = {
  saved: 'Minden mentve',
  saving: 'Mentés…',
  failed: 'Nem sikerült menteni.',
}

function TodoList({ user }) {
  const { todos, setTodos, status, saveStatus, retry } = useServerTodos(user)
  const [filter, setFilter] = useLocalStorage('todo-filter', 'all') // 'all', 'active' vagy 'done'
  const [draggedId, setDraggedId] = useState(null) // a húzott feladat azonosítója, vagy null

  // Nem állapot: minden rajzoláskor a todos-ból és a filter-ből számoljuk.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(values) {
    setTodos(addTodo(todos, values))
  }

  function handleToggle(id) {
    setTodos(toggleTodo(todos, id))
  }

  function handleRename(id, text) {
    setTodos(renameTodo(todos, id, text))
  }

  function handleDelete(id) {
    setTodos(deleteTodo(todos, id))
  }

  // A húzott feladatot a targetId feladatra ejtették: a helyére kerül.
  function handleDrop(targetId) {
    if (draggedId !== null) setTodos(moveTodo(todos, draggedId, targetId))
    setDraggedId(null)
  }

  // A nyilak: egy hellyel feljebb (-1) vagy lejjebb (+1) a látható listában.
  function handleMove(id, step) {
    const index = visibleTodos.findIndex((todo) => todo.id === id)
    const neighbor = visibleTodos[index + step]
    if (neighbor) setTodos(moveTodo(todos, id, neighbor.id))
  }

  // Amíg nincs meg a lista, csak egy üzenet látszik. Ezek a return-ök a hookok után jönnek, sosem előttük.
  if (status === 'loading') {
    return <p className="todo-status">Betöltés…</p>
  }
  if (status === 'error') {
    return (
      <div className="todo-status todo-status--error" role="alert">
        <p>Nem sikerült betölteni a feladatokat: a szerver nem válaszol.</p>
        <button type="button" className="button" onClick={retry}>
          Újra
        </button>
      </div>
    )
  }

  return (
    <>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              dragging={draggedId === todo.id}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
              onMove={handleMove}
              onDragStart={setDraggedId}
              onDragEnd={() => setDraggedId(null)}
              onDrop={handleDrop}
            />
          ))}
        </ul>
      )}
      <div className="todo-footer">
        <span>Hátralévő feladatok: {activeCount}</span>
        <span className={`todo-save todo-save--${saveStatus}`} aria-live="polite">
          {SAVE_MESSAGES[saveStatus]}
        </span>
        {saveStatus === 'failed' && (
          <button type="button" className="button button--small" onClick={() => setTodos(todos)}>
            Mentés újra
          </button>
        )}
      </div>
    </>
  )
}

export default TodoList
```

- A `useServerTodos` egy objektumot ad vissza, ezért kapcsos zárójellel, név szerint vesszük ki belőle, amire szükség
  van, ahogy a 2. leckében a `useDarkMode`-nál.
- A szűrő maradt a `useLocalStorage`-ben: az a te böngésződ beállítása, nem a fiókodé.
- A „Mentés újra” gomb a `setTodos(todos)`-zal ugyanazt a listát küldi el még egyszer.
- Az `aria-live="polite"` a 3. és a 8. leckéből ismerős: a képernyőolvasó felolvassa, ha a mentés állapota
  megváltozik. A betöltési hiba a `role="alert"`-et kapja, mint a belépési hiba.

Végül az `App`-ban add át a felhasználó nevét a listának: a `<TodoList />` helyére írd azt, hogy
`<TodoList user={user} />`.

:::check Ellenőrizd
Belépés után egy pillanatra „Betöltés…” látszik, aztán egy új fióknál a „Nincs teendő. Írd be fent az elsőt!” üzenet.
Vegyél fel két feladatot: a lista alatt jobbra egy pillanatra „Mentés…”, aztán „Minden mentve” áll. (Ha „Nem sikerült
menteni.” áll, a kitalált szerver eldobta a kérést: a „Mentés újra” még egyszer elküldi a listát.) Lépj ki, lépj be
egy másik névvel: üres listát kapsz. Lépj vissza az elsővel: ott a két feladatod. Töltsd újra az oldalt többször
egymás után: előbb-utóbb a betöltés elbukik, és megjelenik a piros „Nem sikerült betölteni…” üzenet. Az „Újra” gombbal
még egyszer megpróbálhatod a betöltést. Gratulálok, kész a teendőlistád!
:::

:::mistake Gyakori hiba
A két `if (status === …) return …` sort a hookok **elé** tenni, például a `useLocalStorage` sor fölé. Az oldal
összeomlik, a konzolban pedig: `Rendered more hooks than during the previous render`. A React a hookokat a hívásuk
sorrendje alapján ismeri fel, ezért egy komponensnek minden rajzoláskor ugyanazokat a hookokat, ugyanabban a
sorrendben kell hívnia. Ez a [[hookok szabálya]], amivel a 6. leckében találkoztál: hookot csak a komponens tetején
hívj, sosem egy `if` vagy ciklus belsejében, és sosem egy korai `return` után.
:::

:::try Próbáld ki
Az `src/fakeServer.js` elején a `FAIL_RATE` mondja meg, a kérések mekkora része bukjon el (most 0,15). Állítsd 1-re:
minden kérés hibát ad, így nyugodtan megnézheted a hibaüzeneteket és az „Újra” gombot. Aztán állítsd vissza. A
fejlesztői eszközökben (Application → Local storage) a `todo-fake-server` kulcs alatt láthatod a kitalált szerver
teljes adatbázisát.
:::
