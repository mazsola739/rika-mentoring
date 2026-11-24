# Mit építünk?

Egy jegyzetfüzetet a böngészőben: balra a jegyzeteid listája, jobbra a megnyitott jegyzet, amit az app gépelés közben
magától elment. A lecke végére a füzet keres (ékezet nélkül is), kategóriákba rendez, kiírja, mikor szerkesztetted
utoljára, Markdownt olvas, és egy szerverrel is szinkronizál: ha közben elmegy az internet, az app tovább működik, és
amikor visszajön a kapcsolat, magától pótolja a szinkront. Közben megtanulod, hogyan hozz létre, módosíts és törölj
elemeket egy listában, mi az a számolt (származtatott) érték, és hogyan bánik a JavaScript a dátumokkal.

:::levels
- Jegyzetek listája, írás, ami gépelés közben rögtön a listába kerül, új jegyzet, törlés megerősítéssel. | kb. 2 óra
- Mentés a böngészőbe a `useLocalStorage` hookkal, az utolsó módosítás ideje, keresés és kategóriák. | kb. 3 óra
- Markdown-előnézet, #címkék, szinkron egy (kitalált) szerverrel több eszköz között, offline mód. | kb. 3 óra
:::

**Előismeret:** az eddigi leckék, főleg a 9., a „To-Do List”: listák kirajzolása `key`-jel, elemek hozzáadása,
módosítása és törlése az állapotban, és a saját `useLocalStorage` hook. Amit korábbról ismersz, azt egy-két mondatban
felidézzük; minden újat itt, lépésről lépésre elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Ennek a leckének a kiinduló projektje a kurzus GitHub-repójában a `lessons/11-notes/exercise` mappa (a fenti „Feladat
a GitHubon” gomb ezt nyitja meg). Ugyanúgy szerzed meg, mint a korábbi leckékben; az 1. lecke minden lépést
részletesen elmagyaráz. A terminálban, a munkamappádban (abban, amelyikben a `rika-mentoring` mappa van):

```shell
cd rika-mentoring
git pull        # lehozza a repóba az új leckéket
cd ..
cp -r rika-mentoring/lessons/11-notes/exercise notes-app
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git` (git nélkül: a GitHub-oldalon **Code → Download ZIP**).
A mappát a fájlkezelőben is átmásolhatod; az a lényeg, hogy a másolatod neve `notes-app` legyen, és a `rika-mentoring`
mappán kívülre kerüljön: így a `git pull` továbbra is működik. Nyisd meg a másolatodat a szerkesztőben, aztán írd be
ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„Notes” címmel.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. A szervert hagyd futni, és nyiss egy
második terminált (a terminálpanel **+** gombja; ez is a `notes-app` mappában nyílik meg):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára (az új fájlokat kézzel töröld), és
érdemes minden működő lépés után commitolni.

A kiinduló projektben négy fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, ezért most nem kell CSS-t írnod: csak a
  lépésekben megadott osztályneveket (`notes`, `note-list`, `editor`, …) használod.
- `src/sampleNotes.js`: négy mintajegyzet, hogy az app már az első indításkor se legyen üres.
- `src/fakeApi.js`: egy kitalált szerver, ami a böngészőben fut. Csak a haladó szinten lesz rá szükség.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések, a mintajegyzetek és a „Notes” cím
angolul vannak. Ha szeretnéd, fordítsd le őket nyugodtan: a lépések ugyanúgy működnek, csak az „Ellenőrizd” dobozokban
a mintajegyzetek angol címei és címkéi (például „Weekend plans”, `#react`) helyett a saját fordításodat fogod látni. A
kódot, amit te írsz be, magyar feliratokkal és megjegyzésekkel mutatjuk.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza; kívülről a [[props]]-ain át kap adatot, emlékezni pedig a
[[useState]]-tel tud. Egy tömböt a `map` rajzol ki, és minden elemnek egyedi `key` kell. Egy [[vezérelt mező]] értéke
az állapotból jön, és minden gépelés frissíti. Az állapotot sosem írjuk át helyben: mindig új tömböt vagy új objektumot
adunk a `set…` függvénynek, például a [[spread]] (`...`) segítségével. Ha ezek közül valami ismeretlennek tűnik, lapozz
vissza az 1. és a 9. leckéhez.
:::

### A lista és a megnyitott jegyzet

A jegyzetfüzet két részből áll: balra a jegyzetek listája, jobbra az éppen megnyitott jegyzet. Nyisd meg az
`src/sampleNotes.js` fájlt. A `SAMPLE_NOTES` egy [[tömb]], minden eleme egy jegyzet, vagyis egy [[objektum]], mindegyik
ugyanazokkal a mezőkkel. Az `id` a jegyzet állandó, egyedi neve: ebből tudjuk, melyik jegyzetről van szó, akkor is, ha
a címe megváltozik. A `title` a cím, a `body` a szöveg. A `category` és az `updatedAt` mezőt a középszinten használjuk.

Kezdjük a listával. Hozz létre az `src` mappában egy `components` mappát, benne a `NoteList.jsx` fájlt:

```jsx file=src/components/NoteList.jsx
function NoteList({ notes, selectedId, onSelect }) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title}</span>
            <span className="note-list__excerpt">{note.body}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

A `map` minden jegyzetből egy listaelemet készít, a `key` pedig a jegyzet `id`-je: egyedi, és sosem változik. Minden
elem egy gomb, hiszen rá lehet kattintani; kattintáskor az `onSelect` propon keresztül szól, melyik jegyzetet
választottad. Az `aria-current` akkor `true`, ha ez a megnyitott jegyzet: a képernyőolvasó ezt felolvassa, az
`App.css` pedig ez alapján emeli ki az elemet. A szöveg (`note.body`) hosszú is lehet, de a CSS egyetlen sorba vágja,
és három pontot tesz a végére.

A megnyitott jegyzet egyelőre csak megjelenik; a következő lépésben lesz belőle szerkesztő. Hozd létre a `components`
mappában a `NoteEditor.jsx` fájlt:

```jsx file=src/components/NoteEditor.jsx
function NoteEditor({ note, onClose }) {
  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Jegyzetek
        </button>
      </div>
      <h2 className="editor__title">{note.title}</h2>
      <p className="editor__text">{note.body}</p>
    </article>
  )
}

export default NoteEditor
```

A „← Jegyzetek” gombra telefonon van szükség. Keskeny képernyőn nem fér el egymás mellett a lista és a jegyzet, ezért amíg
egy jegyzet nyitva van, a lista eltűnik, és ezzel a gombbal jutsz vissza hozzá. Széles képernyőn a CSS elrejti a
gombot.

Most jön a lényeg: honnan tudja az `App`, melyik jegyzet van nyitva? Elég az azonosítóját megjegyezni. Írd át az
`src/App.jsx`-et így (a kiemelt sorok újak vagy megváltoztak):

```jsx file=src/App.jsx mark=1-4,8-9,11-12,15,17,19-30
import { useState } from 'react'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)

  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = notes.find((note) => note.id === selectedId)

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Jegyzetek</h1>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Jegyzetek">
          <NoteList notes={notes} selectedId={selectedId} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor note={selected} onClose={() => setSelectedId(null)} />
          ) : (
            <p className="notes__hint">Válassz egy jegyzetet a listából.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

- A `notes` a jegyzetek listája, a mintajegyzetekkel indul. Azért van állapotban, mert hamarosan változni fog; a
  `setNotes`-ra a következő lépéstől lesz szükség.
- A `selectedId` a megnyitott jegyzet azonosítója. `null`-lal indul, vagyis semmi sincs nyitva. Az
  `onSelect={setSelectedId}` magát a beállító függvényt adja át a listának: amikor a lista meghívja az
  `onSelect(note.id)`-t, az ugyanaz, mintha a `setSelectedId(note.id)`-t hívnánk.
- A `selected` maga a megnyitott jegyzet. Ezt nem tároljuk, hanem minden rajzoláskor kikeressük a listából: ez egy
  [[származtatott érték]]. A `find` sorra odaadja a jegyzeteket a nyílfüggvénynek, és az első olyat adja vissza,
  amelyiknél a függvény igazat ad; ha egyiknél sem, `undefined`-ot. Hogy miért jó, hogy csak az azonosítót tároljuk, a
  következő lépésben kiderül.
- A `{selected ? … : …}` a [[feltételes megjelenítés]]: ha van megnyitott jegyzet, a szerkesztő látszik, ha nincs
  (az `undefined` hamisnak számít), a tipp. Ugyanez a feltétel adja a `notes--editing` osztályt, ami telefonon elrejti a
  listát.

:::check Ellenőrizd
Balra négy mintajegyzet látszik, mindegyiknél a cím és alatta szürkével a szöveg eleje; jobbra egy szaggatott keretű
tipp. Kattints egy jegyzetre: a listában kiemelődik, jobbra pedig megjelenik a címe és a teljes szövege, a sortörésekkel
együtt. Néhány szövegben furcsa jeleket látsz (`**`, `##`, `#react`): ezek Markdown-jelek és címkék, a haladó szinten
megtanítjuk az appot, hogy értse őket. Végül kapcsold be a telefonos nézetet (++F12++, aztán ++Ctrl++ + ++Shift++ +
++M++, Macen ++Cmd++ + ++Shift++ + ++M++): ott a jegyzet a lista helyére kerül, és a „← Jegyzetek” gomb visz vissza.
:::

:::mistake Gyakori hiba
Feltétel nélkül kirajzolni a szerkesztőt: `<NoteEditor note={selected} … />`. Induláskor semmi sincs kiválasztva, a
`selected` értéke `undefined`, a `note.title` pedig hibát dob. Az oldal üres marad, a konzolban (++F12++ → Console)
ez áll: „Cannot read properties of undefined (reading 'title')”.
:::

:::try Próbáld ki
Írj egy ötödik jegyzetet a `SAMPLE_NOTES` tömb végére, egy új `id`-vel: megjelenik a listában. Aztán adj neki egy már
létező `id`-t, például `'sample-hooks'`-ot, és nézd meg a konzolt: a React figyelmeztet, hogy két elemnek ugyanaz a
`key`-e, és ha a kettő közül az egyikre kattintasz, mindkettő kiemelődik. Ezért kell, hogy az `id` egyedi legyen.
Utána töröld az ötödik jegyzetet.
:::

### Írás gépelés közben

A jegyzetet most írni is szeretnénk. A címből egy `<input>`, a szövegből egy `<textarea>` lesz, mindkettő
[[vezérelt mező]]: az értéke a jegyzetből jön, és minden billentyűleütés módosítja a jegyzetet. Ahogy a mai
jegyzetalkalmazásokban, itt sincs „Mentés” gomb: amit beírsz, az azonnal bekerül a jegyzetek listájába. Írd át a
`NoteEditor.jsx`-et:

```jsx file=src/components/NoteEditor.jsx mark=1,9-22
function NoteEditor({ note, onChange, onClose }) {
  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Jegyzetek
        </button>
      </div>
      <input
        className="editor__title"
        aria-label="Cím"
        placeholder="Cím"
        value={note.title}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      <textarea
        className="editor__body"
        aria-label="Jegyzet"
        placeholder="Kezdj el írni…"
        value={note.body}
        onChange={(event) => onChange(note.id, { body: event.target.value })}
      />
    </article>
  )
}

export default NoteEditor
```

A szerkesztő nem maga írja át a jegyzetet, csak szól az `onChange` propon át: melyik jegyzet változott (`note.id`), és
mi (`{ title: … }` vagy `{ body: … }`). A jegyzetek az `App`-ban élnek, ott is változnak. Az `aria-label` a
képernyőolvasóknak ad nevet a mezőnek, mert látható címke most nincs mellette; a `placeholder` szürke szövege erre nem
elég, hiszen eltűnik, amint gépelni kezdesz.

Az `App`-ban jön a függvény, ami egyetlen jegyzetet módosít a listában. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=14-21,36
import { useState } from 'react'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)

  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = notes.find((note) => note.id === selectedId)

  function updateNote(id, changes) {
    // Új tömb: a módosított jegyzet helyén egy új objektum áll.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // a többi jegyzet marad, ami volt
      return { ...note, ...changes }
    })
    setNotes(newNotes)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Jegyzetek</h1>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Jegyzetek">
          <NoteList notes={notes} selectedId={selectedId} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              note={selected}
              onChange={updateNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Válassz egy jegyzetet a listából.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

A `map` most kapcsos zárójeles nyílfüggvényt kap: ebben több sor is lehet, és a `return` mondja meg, mi kerüljön az új
tömbbe. A többi jegyzet változatlanul kerül át, a módosított helyére pedig egy új objektum: a `{ ...note, ...changes }`
lemásolja a jegyzet összes mezőjét, aztán felülírja azokat, amelyek a `changes`-ben vannak. Ha a `changes` értéke
`{ title: 'Bevásárlás' }`, a cím új lesz, minden más marad. A 9. leckében a feladatok kipipálása ugyanígy működött.

És itt térül meg, hogy csak az azonosítót tároltuk: a `selected` minden rajzoláskor a friss listából készül, így a
lista és a szerkesztő mindig ugyanazt mutatja. Ezt hívják [[egyetlen igazságforrásnak|egyetlen igazságforrás]]: minden
adat egy helyen él, és minden mást abból számolunk ki.

:::check Ellenőrizd
Nyiss meg egy jegyzetet, és írj a címébe: a listában betűről betűre változik a cím. Írj a szövegbe is: a lista szürke
sora követi. Válts át egy másik jegyzetre, aztán vissza: a változtatásaid megvannak. Ha viszont újratöltöd az oldalt
(++F5++), minden visszaáll, mert a jegyzetek egyelőre csak a memóriában élnek. Ezen a középszint első lépése segít.
:::

:::mistake Gyakori hiba
A megnyitott jegyzetet lemásolni egy saját állapotba: `const [selected, setSelected] = useState(null)`, és
kattintáskor `setSelected(note)`. Ekkor a szerkesztő egy másolatot mutat, ami gépeléskor nem frissül: a lista
változik, de a mező minden leütés után visszaugrik a régi szövegre, mintha nem engedne gépelni. Ugyanaz az adat két
helyen: ebből mindig baj lesz.
:::

:::try Próbáld ki
Írd ki a szövegdoboz alatt, hány karakterből áll a jegyzet: a `NoteEditor`-ban a `<textarea … />` alá, még az
`</article>` elé tedd be ezt a sort: `<p>{note.body.length} karakter</p>`. Ez is származtatott érték: gépelés közben
magától frissül.
:::

### Új jegyzet

Kell egy gomb, ami üres jegyzetet készít, és rögtön meg is nyitja. Az új jegyzet ugyanolyan alakú legyen, mint a
mintajegyzetek, és kapjon egyedi azonosítót. Erre a 6. és a 9. leckéből ismert `crypto.randomUUID()` való: minden
hívásra egy új, 36 karakteres véletlen azonosítót ad (például `'3f1c9a2e-…'`), ez az [[UUID]]. Akkora a választék,
hogy két egyforma gyakorlatilag sosem jön ki. (Ahogy a 6. leckében láttad, csak biztonságos oldalon működik, vagyis
`https://` címen és a `localhost`-on.) A `Date.now()` a pillanatnyi időt adja egy számként; a középszinten
megismerkedünk vele közelebbről.

Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=14-25,40-42,51,57
import { useState } from 'react'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)

  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    // Ugyanolyan alakú, mint a mintajegyzetek. A kategóriát és az időt a középszinten használjuk.
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      category: 'personal',
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
  }

  function updateNote(id, changes) {
    // Új tömb: a módosított jegyzet helyén egy új objektum áll.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // a többi jegyzet marad, ami volt
      return { ...note, ...changes }
    })
    setNotes(newNotes)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Jegyzetek</h1>
        <button type="button" className="button" onClick={addNote}>
          + Új jegyzet
        </button>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Jegyzetek">
          <NoteList notes={notes} selectedId={selectedId} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              onChange={updateNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Válassz egy jegyzetet a listából, vagy írj egy újat.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

- A `[note, ...notes]` egy új tömb: elöl az új jegyzet, utána a [[spread]] kiteríti a régieket. Így az új jegyzet a
  lista tetejére kerül.
- A `setSelectedId(note.id)` rögtön meg is nyitja.
- A `key={selected.id}` a 3. és a 4. leckéből ismerős: a [[key]] nemcsak listákban használható. Ha egy komponens
  `key`-e megváltozik, a React nem frissíti a régit, hanem eldobja, és egy vadonatújat rajzol a helyére. Így minden
  jegyzet saját, friss szerkesztőt kap, és ennek most hasznát vesszük.

Az üres jegyzet címe üres szöveg, ami a listában semmit sem mutatna. Írd át a `NoteList.jsx` két `<span>`-ját:

```jsx file=src/components/NoteList.jsx mark=12-13
function NoteList({ notes, selectedId, onSelect }) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Névtelen jegyzet'}</span>
            <span className="note-list__excerpt">{note.body || 'Még nincs szöveg'}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

A `||` jelentése „vagy”: ha a bal oldala üres szöveg (az üres szöveg hamisnak számít), a jobb oldalát kapod.

Végül a kurzor magától ugorjon az új jegyzet címébe. A `NoteEditor.jsx` címmezője kap egy `autoFocus`-t:

```jsx file=src/components/NoteEditor.jsx mark=14
function NoteEditor({ note, onChange, onClose }) {
  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Jegyzetek
        </button>
      </div>
      <input
        className="editor__title"
        aria-label="Cím"
        placeholder="Cím"
        value={note.title}
        autoFocus={note.title === ''}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      <textarea
        className="editor__body"
        aria-label="Jegyzet"
        placeholder="Kezdj el írni…"
        value={note.body}
        onChange={(event) => onChange(note.id, { body: event.target.value })}
      />
    </article>
  )
}

export default NoteEditor
```

Az `autoFocus` akkor helyezi a kurzort a mezőbe, amikor az megjelenik az oldalon. Csak cím nélküli jegyzetnél
kérjük: ha minden megnyitáskor odaugrana, telefonon minden kattintásra feljönne a billentyűzet. Itt jön jól a
`key`: mivel minden jegyzet új szerkesztőt kap, a címmező is minden új jegyzetnél újra megjelenik, és az `autoFocus`
újra lefut. `key` nélkül a React ugyanazt a mezőt használná tovább, és a kurzor nem ugrana át.

:::check Ellenőrizd
Kattints a „+ Új jegyzet” gombra: a lista tetején megjelenik egy „Névtelen jegyzet”, jobbra megnyílik, a kurzor a
címmezőben villog. Írj be egy címet, aztán egy szöveget: a lista követi. Nyomd meg még egyszer a gombot, miközben egy
jegyzet nyitva van: a kurzor most is az új jegyzet címébe ugrik.
:::

:::mistake Gyakori hiba
`setNotes(notes.push(note))`. A `push` helyben módosítja a régi tömböt, és nem a tömböt adja vissza, hanem az új
hosszát, egy számot. A `notes` így egy szám lesz, a következő rajzoláskor pedig a `notes.find` hibát dob („notes.find
is not a function”), és az oldal üres marad. Az állapot tömbjét sosem módosítjuk helyben: mindig új tömböt adj a
`setNotes`-nak.
:::

:::try Próbáld ki
Kerüljön az új jegyzet a lista aljára: `[...notes, note]`. Melyik a kényelmesebb? Utána állítsd vissza.
:::

### Törlés megerősítéssel

Egy jegyzetet törölni is kell tudni, de egy elcsúszott kattintás miatt ne vesszen el semmi. Ezért a „Törlés” gomb
először csak megkérdezi: „Biztosan törlöd?”. Hogy a kérdés éppen látszik-e, azt egy új állapot tárolja, a
`confirming`. Ezt egyedül a szerkesztő használja, ezért ott is lakik: nem minden állapotnak kell az `App`-ban élnie,
csak annak, amire több komponensnek is szüksége van. Itt a teljes `NoteEditor.jsx`:

```jsx file=src/components/NoteEditor.jsx mark=1,3-5,29-45
import { useState } from 'react'

function NoteEditor({ note, onChange, onDelete, onClose }) {
  // Az első kattintás a Törlésre csak megkérdezi, biztos-e.
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Jegyzetek
        </button>
      </div>
      <input
        className="editor__title"
        aria-label="Cím"
        placeholder="Cím"
        value={note.title}
        autoFocus={note.title === ''}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      <textarea
        className="editor__body"
        aria-label="Jegyzet"
        placeholder="Kezdj el írni…"
        value={note.body}
        onChange={(event) => onChange(note.id, { body: event.target.value })}
      />
      <footer className="editor__foot">
        {confirming ? (
          <span className="editor__confirm">
            Biztosan törlöd?
            <button type="button" className="button button--danger" onClick={() => onDelete(note.id)}>
              Igen, törlöm
            </button>
            <button type="button" className="button button--ghost" autoFocus onClick={() => setConfirming(false)}>
              Mégse
            </button>
          </span>
        ) : (
          <button type="button" className="button button--ghost" onClick={() => setConfirming(true)}>
            Törlés
          </button>
        )}
      </footer>
    </article>
  )
}

export default NoteEditor
```

- Ha a `confirming` hamis, csak a „Törlés” gomb látszik; ha igaz, helyette a kérdés és két gomb. Az „Igen, törlöm” az
  `onDelete` propon át szól az `App`-nak, a „Mégse” visszaállítja a `confirming`-ot.
- Amikor a „Törlés” gomb eltűnik, vele együtt eltűnne a billentyűzet fókusza is. Az `autoFocus` a „Mégse” gombra
  teszi, így aki billentyűzettel dolgozik, az ++Enter++ vagy a ++Tab++ után is ott folytatja, ahol tartott. Azért a
  „Mégse” kapja, és nem az „Igen, törlöm”, mert egy véletlen ++Enter++ így nem töröl semmit.
- Az előző lépés `key`-e itt is segít: ha a kérdés nyitva marad, és átkattintasz egy másik jegyzetre, az új
  szerkesztő a saját, friss `confirming`-jával indul, vagyis a kérdés nem „költözik át” a másik jegyzetre.

Az `App`-ban a törlés egy `filter`: az új tömbben minden jegyzet benne marad, kivéve azt, amelyiknek az `id`-je
egyezik. Itt a teljes `src/App.jsx`, ahogy a kezdő szint végén kinéz:

```jsx file=src/App.jsx mark=36-39,59
import { useState } from 'react'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)

  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    // Ugyanolyan alakú, mint a mintajegyzetek. A kategóriát és az időt a középszinten használjuk.
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      category: 'personal',
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
  }

  function updateNote(id, changes) {
    // Új tömb: a módosított jegyzet helyén egy új objektum áll.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // a többi jegyzet marad, ami volt
      return { ...note, ...changes }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Jegyzetek</h1>
        <button type="button" className="button" onClick={addNote}>
          + Új jegyzet
        </button>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Jegyzetek">
          <NoteList notes={notes} selectedId={selectedId} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Válassz egy jegyzetet a listából, vagy írj egy újat.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

A `setSelectedId(null)` bezárja a szerkesztőt. (A `selected` nélküle is `undefined` lenne, hiszen a `find` nem találná
a törölt jegyzetet, de tisztább, ha az állapot sem mutat olyan jegyzetre, ami már nincs.)

Ha minden jegyzetet kitörölsz, a lista üres lesz, és jobb, ha ezt meg is mondja. A `NoteList` legelején egy korai
`return` dönt:

```jsx file=src/components/NoteList.jsx mark=2-4
function NoteList({ notes, selectedId, onSelect }) {
  if (notes.length === 0) {
    return <p className="note-list__empty">Nincs itt egy jegyzet sem.</p>
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Névtelen jegyzet'}</span>
            <span className="note-list__excerpt">{note.body || 'Még nincs szöveg'}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

:::check Ellenőrizd
Nyiss meg egy jegyzetet, és kattints a „Törlés” gombra: megjelenik a „Biztosan törlöd?”. A „Mégse” visszahozza a
„Törlés” gombot, az „Igen, törlöm” eltünteti a jegyzetet, és bezárja a szerkesztőt. Ha mindent kitörölsz, a lista
helyén ez áll: „Nincs itt egy jegyzet sem.” Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
`note.id === id` a `filter`-ben `!==` helyett. A `filter` azokat tartja meg, amelyekre a feltétel igaz, így pont
fordítva működik: a törölni kívánt jegyzet marad meg, az összes többi eltűnik.
:::

:::try Próbáld ki
Írd bele a kérdésbe a jegyzet címét: `Biztosan törlöd: {note.title || 'Névtelen jegyzet'}?`.
:::

## Középszint {level=2}

### Mentés a böngészőbe: useLocalStorage

Most minden jegyzet elvész, amikor újratöltöd az oldalt. A 2. leckében már elmentettél valamit a böngésző
[[localStorage]] tárolójába, a 9. és a 10. leckében pedig saját hookot is írtál rá, a `useLocalStorage`-et. A 9.
leckés fájlodat átmásolhatod, az alábbi változat ugyanazt tudja. A 10. leckését viszont ne: az a `storage` eseménnyel
összeköti a böngésző lapjait, amitől a haladó szint két „eszköze” szinkron nélkül is látná egymás változásait. Hozd létre az `src/useLocalStorage.js`
fájlt:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Beolvassa a kulcs alatt mentett értéket. Ha nincs ott semmi, vagy nem olvasható, a kezdőértéket adja.
function readValue(key, initialValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Letiltott tároló vagy hibás JSON: a kezdőértékkel indulunk.
  }
  return initialValue
}

// Úgy működik, mint a useState, de az érték túléli az újratöltést.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue))

  // Minden változás után elmentjük, szövegként.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Tele a tároló, vagy le van tiltva: az app a memóriában tovább működik.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

- A localStorage csak szöveget tud tárolni. A [[JSON]] egy szöveges formátum, amiben tömbök és objektumok is
  leírhatók: a `JSON.stringify` a jegyzetek tömbjéből szöveget készít, a `JSON.parse` visszaalakítja.
- A `useState(() => readValue(…))` [[lusta kezdőérték]]: a tárolót csak egyszer, az első rajzoláskor olvassuk ki, nem
  minden gépelésnél.
- Az effekt minden változás után ment. A [[függőségi tömb]] `[key, value]`, vagyis akkor fut le, amikor az érték (vagy
  a kulcs) megváltozik.
- A [[try/catch]] miatt nem omlik össze az app, ha a böngésző letiltja a tárolót, vagy ha a mentett szöveg hibás.
- A hook pontosan úgy néz ki kívülről, mint a `useState`: egy értéket és egy beállító függvényt ad vissza. Ezért elég
  egyetlen sort kicserélni az `App`-ban.

Írd át az `src/App.jsx` elejét így (a többi sor marad):

```jsx file=src/App.jsx mark=2,9-10
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  // A jegyzetek mostantól a böngészőben is megmaradnak.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  // … a többi, mint eddig
```

A kulcs elején azért áll az app neve, mert minden projekt, amit a `localhost:5173` címen futtatsz, ugyanazt a tárolót
látja: így egy másik lecke `notes` kulcsa nem keveredik ezzel. A `selectedId` maradhat sima `useState`: újratöltés után
nyugodtan induljon bezárt jegyzettel.

:::check Ellenőrizd
Írj egy új jegyzetet, és töltsd újra az oldalt: ott van. A fejlesztői eszközökben (++F12++) az **Application** →
**Local storage** → `http://localhost:5173` alatt megtalálod a `notes-app:notes` kulcsot, az értéke a jegyzeteid JSON
szövege. Ha vissza akarod kapni a mintajegyzeteket, töröld itt a kulcsot (jobb klikk → **Delete**), és töltsd újra az
oldalt.
:::

:::mistake Gyakori hiba
`localStorage.setItem(key, value)`, `JSON.stringify` nélkül. A tömbből ilyenkor a „[object Object],[object Object]…”
szöveg lesz, amit a `JSON.parse` nem tud visszaolvasni. Hibaüzenetet nem látsz, mert a `catch` elkapja, de újratöltés
után mindig a mintajegyzetek jönnek vissza, a tieid sehol.
:::

:::try Próbáld ki
Nyisd meg az appot egy második lapon is, írj valamit az egyikben, aztán töltsd újra a másikat: ott is megjelenik, mert
a két lap ugyanazt a tárolót látja. A haladó szinten ebből lesz „két eszköz”.
:::

### Mikor szerkesztetted?

Minden jegyzetnek van egy `updatedAt` mezője: ez mondja meg, mikor módosították utoljára. Az értéke egy
[[időbélyeg]]: azt mutatja, hány ezredmásodperc telt el a világidő szerinti 1970. január 1-jei éjfél óta. Ugyanilyen
számot ad a `Date.now()` is. Egy mostani időbélyeg 1 700 000 000 000 fölötti szám. Miért szám, és nem egy szép dátum? Mert a számot
könnyű összehasonlítani és kivonni, és a JSON is gond nélkül elmenti.

Ha egy jegyzet változik, kapjon friss időbélyeget. Írd át az `App`-ban az `updateNote`-ot:

```jsx file=src/App.jsx mark=2,5
  function updateNote(id, changes) {
    // Új tömb: a módosított jegyzet helyén egy új objektum áll, friss időbélyeggel.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // a többi jegyzet marad, ami volt
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }
```

A legutóbb szerkesztett jegyzet álljon a lista tetején. A rendezés a 10. leckéből ismert `sort` dolga: egy
[[összehasonlító függvényt|összehasonlító függvény]] kap, ami két elemről (`a` és `b`) megmondja, melyik jöjjön előbb.
Ha negatív számot ad, az `a` kerül előre, ha pozitívat, a `b`. A `b.updatedAt - a.updatedAt` akkor pozitív, ha a `b`
az újabb, vagyis az újabb kerül előre.

Csakhogy a `sort`, ahogy a 10. leckében láttad, helyben rendez: magát a tömböt rendezi át, amin meghívod. Az állapot
tömbjét pedig sosem szabad
átírni. Ezért előbb lemásoljuk: a `[...notes]` egy új tömb ugyanazokkal a jegyzetekkel. A rendezett lista
származtatott érték, nem tároljuk: írd a `selected` sora fölé, és ezt kapja a lista:

```jsx file=src/App.jsx mark=1-2
  // Származtatott érték: a legutóbb szerkesztett jegyzet áll elöl. A [...notes] egy másolat.
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = notes.find((note) => note.id === selectedId)
```

A `return`-ben pedig a `<NoteList … />` kapja a rendezett listát (a `notes={notes}` helyett `notes={sortedNotes}`):

```jsx file=src/App.jsx
          <NoteList notes={sortedNotes} selectedId={selectedId} onSelect={setSelectedId} />
```

Most jöhet a dátum kiírása. Az időbélyegből az [[Intl.DateTimeFormat]] készít olvasható dátumot, mégpedig az adott
nyelv szokásai szerint: magyarul „2026. november 23. 14:05”, angolul „23 November 2026 at 14:05”. Az `Intl` a
böngésző beépített, nyelvfüggő formázója. Hozd létre az `src/dates.js` fájlt:

```js file=src/dates.js
// Teljes dátum és idő, például „2026. november 23. 14:05”.
const dateFormat = new Intl.DateTimeFormat('hu-HU', { dateStyle: 'long', timeStyle: 'short' })

export function formatDate(timestamp) {
  return dateFormat.format(timestamp)
}
```

A formázót egyszer, a függvényen kívül hozzuk létre, mert az elkészítése sokkal lassabb, mint a használata. A
`'hu-HU'` a magyar nyelv és Magyarország kódja; a `dateStyle: 'long'` a hónap nevét írja ki, a `timeStyle: 'short'`
az órát és a percet.

A dátum a szerkesztő alján jelenjen meg. A `NoteEditor.jsx` elejére jön az import, a `<footer>` elejére pedig egy új
sor:

```jsx file=src/components/NoteEditor.jsx mark=2,6
import { useState } from 'react'
import { formatDate } from '../dates.js'

// … a NoteEditor eleje, mint eddig
      <footer className="editor__foot">
        <span>Szerkesztve: {formatDate(note.updatedAt)}</span>
        {confirming ? (
        // … a többi, mint eddig
```

:::check Ellenőrizd
Nyisd meg a „Weekend plans” jegyzetet: alul ott áll, mikor szerkesztették utoljára. Írj bele valamit: a dátum a
mostani időre vált, és a jegyzet a lista tetejére ugrik. A korábban létrehozott jegyzeteidnél is ott az idő, hiszen
az `addNote` már a kezdő szinten beírta nekik.
:::

:::mistake Gyakori hiba
`notes.sort(…)` másolat nélkül. A `sort` ilyenkor rajzolás közben magát az állapot tömbjét rendezi át. Elsőre
működik, és épp ez benne az alattomos: a rajzolásnak csak olvasnia szabad az állapotot, átírnia soha, és az ilyen
hibák később, egy egészen más helyen bukkannak elő, ahol nehéz rájuk találni. Előbb másolj (`[...notes]`), aztán
rendezz.
:::

:::try Próbáld ki
Írd át a formázóban a `dateStyle: 'long'`-ot `'full'`-ra: a hét napja is megjelenik. Aztán `'short'`-ra: csak számok.
:::

### „5 perccel ezelőtt”

A „2026. november 23. 14:05” pontos, de egy jegyzetnél többet mond, hogy „5 perccel ezelőtt” vagy „tegnap”. Ezt az
[[Intl.RelativeTimeFormat]] tudja: megkapja, hány egységnyi idő telt el és milyen egységben, majd nyelvhelyesen kiírja.
A `format(-5, 'minute')` eredménye „5 perccel ezelőtt”, a `format(-1, 'day')`-é „tegnap” (ezt a `numeric: 'auto'`
kéri; nélküle „1 nappal ezelőtt” lenne). A negatív szám a múlt, a pozitív a jövő. Írd ezeket az `src/dates.js`
végére:

```js file=src/dates.js
// Relatív idő, például „5 perccel ezelőtt” vagy „tegnap”.
const relativeFormat = new Intl.RelativeTimeFormat('hu-HU', { numeric: 'auto' })

// A legnagyobb egységgel kezdünk: az első, amelyikből legalább egy egész eltelt, nyer.
const UNITS = [
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

export function timeAgo(timestamp, now) {
  const diff = timestamp - now // a múlt negatív szám
  for (const [unit, size] of UNITS) {
    if (Math.abs(diff) >= size) return relativeFormat.format(Math.round(diff / size), unit)
  }
  return relativeFormat.format(0, 'second') // „most”
}
```

A `UNITS` minden eleme egy kételemű tömb: az egység neve és a hossza ezredmásodpercben. A `for (const [unit, size] of
UNITS)` sorra veszi őket, és mindegyiket rögtön két változóba bontja, ahogy a `useState` eredményét szoktad. A
`Math.abs` az előjel nélküli értéket (abszolút értéket) adja: 3 óra különbség egy egész naphoz még kevés, egy órához
már elég, így „3 órával ezelőtt” lesz. Ha egy percnél kevesebb telt el, „most”.

Miért kapja meg a `timeAgo` a `now`-t, ahelyett, hogy maga hívná a `Date.now()`-t? Mert a „most”-nak magától kell
„1 perccel ezelőtt”-té válnia, akkor is, ha senki nem nyúl semmihez. Ehhez kell egy óra, ami időnként újrarajzolja az
oldalt. Ez egy kis saját hook lesz, az `src/useNow.js`:

```js file=src/useNow.js
import { useEffect, useState } from 'react'

// Az aktuális idő, ami félpercenként frissül: így a „most”-ból magától lesz „1 perccel ezelőtt”.
function useNow() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000)
    // Takarítás: ha a komponens eltűnik, az óra is leáll.
    return () => clearInterval(timer)
  }, [])

  return now
}

export default useNow
```

A [[setInterval]] olyan, mint a 3. leckéből ismert `setTimeout`, csak nem egyszer hívja meg a függvényt, hanem újra
és újra, itt 30 másodpercenként. Minden hívás új `now` értéket ad az állapotnak, a React pedig újrarajzol. Az üres
függőségi tömb miatt az óra egyszer indul el, a [[takarító függvény]] pedig a `clearInterval`-lal leállítja, ha a
komponens eltűnik.

Az `App` egyetlen órát indít, és odaadja a `now`-t mindenkinek, akinek kell. Itt a teljes `src/App.jsx`, benne az
előző lépés változásaival is:

```jsx file=src/App.jsx mark=3,13,57,64
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  // A jegyzetek mostantól a böngészőben is megmaradnak.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  const now = useNow()

  // Származtatott érték: a legutóbb szerkesztett jegyzet áll elöl. A [...notes] egy másolat.
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    // Ugyanolyan alakú, mint a mintajegyzetek. A kategóriát és az időt a középszinten használjuk.
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      category: 'personal',
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
  }

  function updateNote(id, changes) {
    // Új tömb: a módosított jegyzet helyén egy új objektum áll, friss időbélyeggel.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // a többi jegyzet marad, ami volt
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Jegyzetek</h1>
        <button type="button" className="button" onClick={addNote}>
          + Új jegyzet
        </button>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Jegyzetek">
          <NoteList notes={sortedNotes} selectedId={selectedId} now={now} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Válassz egy jegyzetet a listából, vagy írj egy újat.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

A listában minden jegyzet alá kerüljön egy harmadik sor az idővel. Itt a teljes `NoteList.jsx`:

```jsx file=src/components/NoteList.jsx mark=1,3,20
import { timeAgo } from '../dates.js'

function NoteList({ notes, selectedId, now, onSelect }) {
  if (notes.length === 0) {
    return <p className="note-list__empty">Nincs itt egy jegyzet sem.</p>
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Névtelen jegyzet'}</span>
            <span className="note-list__excerpt">{note.body || 'Még nincs szöveg'}</span>
            <span className="note-list__meta">{timeAgo(note.updatedAt, now)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

A szerkesztőben is a relatív idő látsszon, a pontos dátum pedig egy buboréksúgóban, ha az egeret fölé viszed: erre
való a `title` attribútum. A `NoteEditor.jsx`-ben az import és a függvény első sora bővül, a `<footer>` első sora pedig
megváltozik:

```jsx file=src/components/NoteEditor.jsx mark=2,4,8
import { useState } from 'react'
import { formatDate, timeAgo } from '../dates.js'

function NoteEditor({ note, now, onChange, onDelete, onClose }) {
  // … minden, mint eddig, egészen a <footer>-ig

      <footer className="editor__foot">
        <span title={formatDate(note.updatedAt)}>Szerkesztve: {timeAgo(note.updatedAt, now)}</span>
        {confirming ? (
        // … a többi, mint eddig
```

:::check Ellenőrizd
A listában minden jegyzet alatt ott az idő, például „2 órával ezelőtt”, „tegnap” vagy „3 nappal ezelőtt”. Írj egy
jegyzetbe: a listában és a szerkesztő alján is „most” lesz. Várj másfél percet, és ne nyúlj semmihez: magától
„1 perccel ezelőtt”-re vált (az óra félpercenként üt, ezért ez egy és másfél perc között bármikor megtörténhet). Vidd
az egeret a szerkesztő alján az idő fölé: a buborékban a pontos dátum áll.
:::

:::mistake Gyakori hiba
A `useNow` kihagyása: az `App` nem indít órát, a `NoteList` pedig maga hívja a `timeAgo(note.updatedAt, Date.now())`-t.
Elsőre ugyanúgy néz ki, de a „most” sosem változik magától, csak akkor, ha valami más miatt újrarajzolódik a lista,
például ha gépelsz. A `useNow` órája pont azért van, hogy az idő múlása is újrarajzolást okozzon.
:::

:::try Próbáld ki
Tegyél egy hetet is a `UNITS` elejére: `['week', 7 * 24 * 60 * 60 * 1000]`. Hogy lásd is, írd át az
`src/sampleNotes.js`-ben a portfóliós jegyzet idejét `now - 10 * DAY`-re, töröld a `notes-app:notes` kulcsot
(Application → Local storage), és töltsd újra az oldalt: a jegyzet alatt „előző hét” áll (ezt a `numeric: 'auto'`
kéri, nélküle „1 héttel ezelőtt” lenne).
:::

### Keresés, ékezet nélkül is

Ha sok a jegyzet, keresni is kell. A keresett szöveg egy új állapot (`query`), a keresőmező pedig vezérelt. A lényeg
megint az, amit **nem** tárolunk: a találatok listája származtatott érték, minden rajzoláskor a jegyzetekből és a
keresett szövegből számoljuk ki.

Mikor számít találatnak egy jegyzet? Ha a címében vagy a szövegében benne van a keresett szöveg, kis- és nagybetűtől függetlenül,
és lehetőleg ékezettől is: aki telefonon gyorsan beírja, hogy „hetfo”, az is találja meg a „Hétfő” című jegyzetet. Ez
a [[normalizálás]]: mindkét szövegből egy egyszerűsített változatot készítünk, és azokat hasonlítjuk össze. Hozd
létre az `src/notes.js` fájlt a jegyzetekhez tartozó segédfüggvényeknek:

```js file=src/notes.js
// Kisbetűs, ékezet nélküli változat: így a „hetfo” keresés is megtalálja a „Hétfő”-t.
export function normalize(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

// Benne van-e a keresett szöveg a jegyzet címében vagy a szövegében?
export function matchesQuery(note, query) {
  const wanted = normalize(query.trim())
  if (wanted === '') return true
  return normalize(note.title + ' ' + note.body).includes(wanted)
}
```

- A `normalize('NFD')` minden ékezetes betűt két részre bont: az „é”-ből egy „e” és egy különálló ékezetjel lesz.
- A saját `normalize` függvényünk nem önmagát hívja: a `text.normalize(…)` a szöveg beépített függvénye, csak ugyanaz
  a neve, mint a miénknek.
- A `/\p{M}/gu` egy [[reguláris kifejezés]], vagyis egy minta, amire a JavaScript szövegrészeket tud keresni. Két
  perjel között áll: a `\p{M}` jelentése „bármilyen ékezetjel” (az M a mark, „jel” rövidítése), a `g` azt kéri, hogy
  minden előfordulást keressen meg, ne csak az elsőt, az `u` pedig bekapcsolja a Unicode-módot, ami a `\p{…}`-hez kell
  (a Unicode az a szabvány, amely minden nyelv minden karakterének, az ékezeteknek is, saját kódot ad). A `replace`
  minden találatot kicserél a második paraméterére, itt üres szövegre: az ékezetek eltűnnek.
- A `toLowerCase()` csupa kisbetűssé alakít, a `trim()` levágja a szöveg elejéről és végéről a szóközöket, az
  `includes` pedig megmondja, benne van-e az egyik szöveg a másikban.
- Üres keresésnél minden jegyzet találat, így a lista teljes.

Az `App`-ban jön az új állapot, a keresőmező a fejlécbe, és a találatok listája a rendezett lista helyére. Itt a
teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=5,15,17-21,36-37,58-65,72
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import { matchesQuery } from './notes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  // A jegyzetek mostantól a böngészőben is megmaradnak.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  const now = useNow()
  const [query, setQuery] = useState('')

  // Származtatott értékek: minden rajzoláskor az állapotból számoljuk őket.
  // A filter új tömböt ad, így a sort már nem az állapotot rendezi át.
  const visibleNotes = notes
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    // Ugyanolyan alakú, mint a mintajegyzetek. A kategóriát és az időt a középszinten használjuk.
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      category: 'personal',
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
    // Az új jegyzet ne bújjon el egy keresés mögé.
    setQuery('')
  }

  function updateNote(id, changes) {
    // Új tömb: a módosított jegyzet helyén egy új objektum áll, friss időbélyeggel.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // a többi jegyzet marad, ami volt
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Jegyzetek</h1>
        <input
          type="search"
          className="notes__search"
          aria-label="Keresés a jegyzetekben"
          placeholder="Keresés…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="button" onClick={addNote}>
          + Új jegyzet
        </button>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Jegyzetek">
          <NoteList notes={visibleNotes} selectedId={selectedId} now={now} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Válassz egy jegyzetet a listából, vagy írj egy újat.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

A `visibleNotes` egy lánc: a `filter` kiválogatja a találatokat, a `sort` sorba rendezi őket. Mivel a `filter`
mindig új tömböt ad, a `sort` már ezt a másolatot rendezi, a `[...notes]` másolásra nincs többé szükség. A
`type="search"` keresőmezőt kér: sok böngésző egy kis ✕-et tesz a végére, és az ++Esc++ is kiüríti.

A megnyitott jegyzet (`selected`) továbbra is a teljes `notes` listából jön, nem a találatokból: ha gépelés közben
eltűnik a listából, a szerkesztőben attól még nyitva marad.

:::check Ellenőrizd
Írd a keresőbe, hogy `meeting`: csak a „Meeting notes – Monday” marad. A `MEETING` ugyanígy működik. Írj egy új
jegyzetet „Hétfői teendők” címmel, aztán keress rá úgy, hogy `hetfoi`: megtalálja. Ha nincs találat, a lista helyén a
„Nincs itt egy jegyzet sem.” áll; a ✕ vagy az ++Esc++ visszahozza az összeset.
:::

:::mistake Gyakori hiba
A találatokat külön állapotba tenni (`const [results, setResults] = useState(notes)`), és egy `useEffect`-ből
frissíteni, valahányszor változik a keresés. Működni látszik, de minden gépelésnél kétszer rajzol, és ha egy
függőség kimarad, a lista régi jegyzeteket mutat: például a szerkesztett cím nem frissül a találatok között. Amit ki
lehet számolni az állapotból, azt számold ki, ne tárold.
:::

:::try Próbáld ki
Írd ki a lista fölé, hány jegyzetet látsz: a `<nav>` elejére egy `<p>{visibleNotes.length} jegyzet</p>`.
:::

### Kategóriák

A mintajegyzeteknek van egy `category` mezője: `'personal'`, `'work'`, `'ideas'` vagy `'learning'`. Ez a kategória
**kulcsa**: rövid, angol, sosem változik, ezt tároljuk a jegyzetben. A képernyőn viszont a **felirata** jelenik meg,
a felhasználó nyelvén. A kettőt egy objektum köti össze. Írd az `src/notes.js` végére:

```js file=src/notes.js
// A kategóriák: a kulcsot tároljuk a jegyzetben, a feliratot mutatjuk a képernyőn.
export const CATEGORIES = {
  personal: 'Személyes',
  work: 'Munka',
  ideas: 'Ötletek',
  learning: 'Tanulás',
}
```

A `CATEGORIES.work` (vagy `CATEGORIES['work']`) értéke „Munka”, az `Object.keys(CATEGORIES)` pedig a kulcsok tömbje:
`['personal', 'work', 'ideas', 'learning']`.

Három helyen kell a kategória. Először is a szerkesztőben: egy legördülő lista (`<select>`) a jegyzet kategóriájával.
Ez is vezérelt mező, pont úgy, mint a cím: a `value` a jegyzetből jön, az `onChange` jelzi a változást. A kategória
a szerkesztő felső sávjába kerül, a „← Jegyzetek” gomb mellé. Itt a teljes `NoteEditor.jsx`:

```jsx file=src/components/NoteEditor.jsx mark=2,15-26
import { useState } from 'react'
import { CATEGORIES } from '../notes.js'
import { formatDate, timeAgo } from '../dates.js'

function NoteEditor({ note, now, onChange, onDelete, onClose }) {
  // Az első kattintás a Törlésre csak megkérdezi, biztos-e.
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Jegyzetek
        </button>
        <select
          className="editor__category"
          aria-label="Kategória"
          value={note.category}
          onChange={(event) => onChange(note.id, { category: event.target.value })}
        >
          {Object.keys(CATEGORIES).map((key) => (
            <option key={key} value={key}>
              {CATEGORIES[key]}
            </option>
          ))}
        </select>
      </div>
      <input
        className="editor__title"
        aria-label="Cím"
        placeholder="Cím"
        value={note.title}
        autoFocus={note.title === ''}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      <textarea
        className="editor__body"
        aria-label="Jegyzet"
        placeholder="Kezdj el írni…"
        value={note.body}
        onChange={(event) => onChange(note.id, { body: event.target.value })}
      />
      <footer className="editor__foot">
        <span title={formatDate(note.updatedAt)}>Szerkesztve: {timeAgo(note.updatedAt, now)}</span>
        {confirming ? (
          <span className="editor__confirm">
            Biztosan törlöd?
            <button type="button" className="button button--danger" onClick={() => onDelete(note.id)}>
              Igen, törlöm
            </button>
            <button type="button" className="button button--ghost" autoFocus onClick={() => setConfirming(false)}>
              Mégse
            </button>
          </span>
        ) : (
          <button type="button" className="button button--ghost" onClick={() => setConfirming(true)}>
            Törlés
          </button>
        )}
      </footer>
    </article>
  )
}

export default NoteEditor
```

Az `<option>` `value`-ja a kulcs, a szövege a felirat. Az `updateNote` semmit sem tud a kategóriákról, mégis működik
vele: a `{ category: 'work' }` ugyanúgy beleolvad a jegyzetbe, mint a cím.

Másodszor a listában: az idő sorának elejére egy színes pötty és a kategória felirata kerül. A pötty színét az
`App.css` adja a `dot--personal`, `dot--work`, … osztályokkal. Itt a teljes `NoteList.jsx`:

```jsx file=src/components/NoteList.jsx mark=1,21-24
import { CATEGORIES } from '../notes.js'
import { timeAgo } from '../dates.js'

function NoteList({ notes, selectedId, now, onSelect }) {
  if (notes.length === 0) {
    return <p className="note-list__empty">Nincs itt egy jegyzet sem.</p>
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Névtelen jegyzet'}</span>
            <span className="note-list__excerpt">{note.body || 'Még nincs szöveg'}</span>
            <span className="note-list__meta">
              <span className={`dot dot--${note.category}`} aria-hidden="true" />
              {CATEGORIES[note.category]} · {timeAgo(note.updatedAt, now)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

A `className` értéke fordított aposztrófok között áll: ez egy [[template literal]], amiben a `${…}` helyére a
kategória kulcsa kerül, így egy munkahelyi jegyzet a `dot dot--work` osztályt kapja.

Harmadszor egy szűrő a lista fölé: egy sor „chip”, vagyis kerek gomb, kategóriánként egy, és egy „Mind”. Mindegyiken
ott a darabszám is. Hozd létre az `src/components/CategoryFilter.jsx` fájlt:

```jsx file=src/components/CategoryFilter.jsx
import { CATEGORIES } from '../notes.js'

function CategoryFilter({ notes, value, onChange }) {
  // Hány jegyzet van egy kategóriában? Az 'all' (Mind) mindet számolja.
  function countOf(key) {
    if (key === 'all') return notes.length
    return notes.filter((note) => note.category === key).length
  }

  return (
    <div className="filters" role="group" aria-label="Kategóriák">
      {['all', ...Object.keys(CATEGORIES)].map((key) => (
        <button
          key={key}
          type="button"
          className="chip"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {key !== 'all' && <span className={`dot dot--${key}`} aria-hidden="true" />}
          {key === 'all' ? 'Mind' : CATEGORIES[key]}
          <span className="chip__count">{countOf(key)}</span>
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
```

- Az `['all', ...Object.keys(CATEGORIES)]` egy új tömb: elöl az `'all'`, utána a négy kategória kulcsa.
- Az `aria-pressed` egy „benyomva maradó” gombot jelez: `true`, ha ez a kiválasztott szűrő. A képernyőolvasó így
  jelzi, hogy be van-e kapcsolva, a CSS pedig ez alapján színezi ki a chipet.
- A `role="group"` és az `aria-label` egy névvel ellátott csoportba fogja a gombokat, ahogy a `<fieldset>` és a
  `<legend>` a jelölőnégyzeteket a 3. leckében.
- A darabszám is származtatott érték: a `countOf` minden rajzoláskor megszámolja.

Végül az `App`: egy új állapot (`category`, `'all'`-lal indul), egy második `filter` a láncban, a szűrő a fejléc alatt,
és az új jegyzet abba a kategóriába kerül, amelyiket éppen nézed. Itt a teljes `src/App.jsx`, ahogy a középszint végén
kinéz:

```jsx file=src/App.jsx mark=8,17,22,33-34,73-75
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import { matchesQuery } from './notes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import './App.css'

function App() {
  // A jegyzetek mostantól a böngészőben is megmaradnak.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  const now = useNow()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  // Származtatott értékek: minden rajzoláskor az állapotból számoljuk őket.
  // A filter új tömböt ad, így a sort már nem az állapotot rendezi át.
  const visibleNotes = notes
    .filter((note) => category === 'all' || note.category === category)
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      // Ha épp egy kategóriát nézel, az új jegyzet is abba kerül.
      category: category === 'all' ? 'personal' : category,
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
    // Az új jegyzet ne bújjon el egy keresés mögé.
    setQuery('')
  }

  function updateNote(id, changes) {
    // Új tömb: a módosított jegyzet helyén egy új objektum áll, friss időbélyeggel.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // a többi jegyzet marad, ami volt
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Jegyzetek</h1>
        <input
          type="search"
          className="notes__search"
          aria-label="Keresés a jegyzetekben"
          placeholder="Keresés…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="button" onClick={addNote}>
          + Új jegyzet
        </button>
      </header>
      <div className="notes__filters">
        <CategoryFilter notes={notes} value={category} onChange={setCategory} />
      </div>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Jegyzetek">
          <NoteList notes={visibleNotes} selectedId={selectedId} now={now} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Válassz egy jegyzetet a listából, vagy írj egy újat.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

A láncban a `category === 'all' || note.category === category` így olvasható: „ha mindet nézzük, vagy ha a jegyzet
ebbe a kategóriába tartozik”. Minden `filter` tovább szűkíti az előző eredményét, így a kategória és a keresés együtt
is működik. A `CategoryFilter` a teljes `notes` listát kapja, nem a találatokat: a darabszámok így a keresés közben sem
változnak.

:::check Ellenőrizd
A lista fölött ott a „Mind 4” (vagy annyi, ahány jegyzeted van) és a négy kategória, mindegyik a saját darabszámával.
Kattints a „Munka” chipre: csak a „Meeting notes – Monday” marad. Nyisd meg, és állítsd a kategóriáját „Ötletek”-re:
eltűnik a listából, a „Munka” száma eggyel csökken, az „Ötletek”-é nő. Amíg az „Ötletek” chip ki van választva, nyomd
meg a „+ Új jegyzet” gombot: az új jegyzet az „Ötletek” közé kerül. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
A felirat tárolása a kulcs helyett: `category: 'Munka'`. A `CATEGORIES['Munka']` értéke `undefined`, ezért a listában
eltűnik a kategória neve, a pötty szürke lesz, és a „Munka” szűrő sem találja meg a jegyzetet. Ha pedig egyszer
angolul is megszólal az app, vagy átnevezed a kategóriát, a régi jegyzetek elvesztenék a kategóriájukat. A kulcs sosem
változik, a felirat bármikor.
:::

:::try Próbáld ki
Adj hozzá egy ötödik kategóriát: `shopping: 'Bevásárlás'`. A pöttye szürke lesz; ha színt is szeretnél, írj az
`App.css`-be egy `.dot--shopping { background: #feb800; }` szabályt.
:::

## Haladó szint {level=3}

### Markdown-előnézet

A [[Markdown]] egy egyszerű írásmód formázott szöveghez: néhány jel mondja meg, mi legyen címsor, lista vagy
félkövér. A jegyzetben sima szöveg marad (így bármilyen szövegdobozba beírható), de egy program szépen meg tudja
jeleníteni. A legfontosabb jelek:

```md
# Címsor
## Alcím
- listaelem
- még egy listaelem
Egy bekezdés **félkövér** és *dőlt* szóval, meg egy `kóddal`.
```

Néhány mintajegyzetben már most is ilyen jelek vannak. Írunk egy kis Markdown-olvasót, ami ebből React-elemeket
készít, és a szerkesztő kap egy „Előnézet” fület. Az igazi Markdown ennél sokkal többet tud; mi a fenti hat jelet
tanítjuk meg. Hozd létre az `src/components/Markdown.jsx` fájlt:

```jsx file=src/components/Markdown.jsx
// Egy kis Markdown-olvasó: # címsor, ## alcím, - lista, **félkövér**, *dőlt* és `kód`.
// HTML-t sosem gyártunk, csak React-elemeket: ami a jegyzetben áll, az szöveg marad.

// 1. A szöveget soronként blokkokra bontjuk: címsor, alcím, lista vagy bekezdés.
function parseBlocks(text) {
  const blocks = []
  for (const line of text.split('\n')) {
    const last = blocks[blocks.length - 1]
    if (line.startsWith('- ')) {
      // Az egymás alatti listaelemek egy listába kerülnek.
      if (last && last.type === 'list') last.items.push(line.slice(2))
      else blocks.push({ type: 'list', items: [line.slice(2)] })
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'subheading', text: line.slice(3) })
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', text: line.slice(2) })
    } else if (line.trim() !== '') {
      blocks.push({ type: 'paragraph', text: line })
    }
  }
  return blocks
}

// 2. Egy soron belül: a zárójeles minta miatt a split a megtalált részeket is visszaadja.
function renderInline(text) {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*|`.+?`)/)
  return parts.map((part, i) => {
    if (i % 2 === 0) return part // a páros helyeken sima szöveg áll
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    return <em key={i}>{part.slice(1, -1)}</em>
  })
}

// 3. A blokkokból React-elemek lesznek.
function Markdown({ text }) {
  const blocks = parseBlocks(text)
  if (blocks.length === 0) {
    return <p className="markdown markdown__empty">Még nincs mit megmutatni.</p>
  }

  return (
    <div className="markdown">
      {blocks.map((block, i) => {
        if (block.type === 'heading') return <h2 key={i}>{renderInline(block.text)}</h2>
        if (block.type === 'subheading') return <h3 key={i}>{renderInline(block.text)}</h3>
        if (block.type === 'list') {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{renderInline(block.text)}</p>
      })}
    </div>
  )
}

export default Markdown
```

Három lépésben dolgozik:

1. A `parseBlocks` a szöveget a `split('\n')` segítségével sorokra vágja (a `\n` a sortörés jele), és minden sorról
   eldönti, mi az. A `startsWith` megmondja, hogy a sor egy adott szöveggel kezdődik-e, a `slice(2)` pedig levágja az
   első két karaktert, vagyis a jelet és az utána álló szóközt. Az eredmény egy sima tömb, benne objektumok:
   `{ type: 'heading', text: '…' }`. Az egymást követő listaelemek egyetlen lista `items` tömbjébe gyűlnek; ez egy
   helyben épülő, saját tömb, nem állapot, ezért itt nyugodtan használhatjuk a `push`-t.
2. A `renderInline` egy soron belül keresi a `**…**`, `*…*` és a fordított aposztrófok közötti részeket egy
   reguláris kifejezéssel. A `\*` egy valódi csillag: magában a `*` a mintában mást jelent, ezért kell elé a `\`. A
   `|` jelentése „vagy”: a három rész közül bármelyik illeszkedhet. A `.+?` jelentése „legalább egy, de a lehető
   legkevesebb karakter”, így a minta az első záró jelnél megáll. Ha a split mintája kerek zárójelben áll, a
   megtalált részek is bekerülnek az eredménybe, mégpedig mindig a páratlan helyekre (1, 3, 5…), ahogy a 4. lecke
   sablonjainál: az `'a **b** c'`-ből `['a ', '**b**', ' c']` lesz. A páros helyeken (0, 2, 4…) sima szöveg áll, a
   páratlanokon a formázott részek. A `%` az ugyanonnan ismert [[modulo]], vagyis az osztás maradéka: az `i % 2` a
   páros helyeken 0, a páratlanokon 1. A `slice(2, -2)` mindkét végéről levág két karaktert.
3. A `Markdown` komponens a blokkokból elemeket rajzol. A `key` itt lehet a sorszám (`i`), mert ezek az elemek nem
   tárolnak állapotot, és minden rajzoláskor elölről készülnek.

A szerkesztő egy új állapotot kap (`preview`: előnézetet nézünk-e), két fület a felső sávban, és a szövegdoboz helyén
előnézetkor a `Markdown` jelenik meg. Itt a teljes `NoteEditor.jsx`:

```jsx file=src/components/NoteEditor.jsx mark=4,9-10,30-37,47-49,57
import { useState } from 'react'
import { CATEGORIES } from '../notes.js'
import { formatDate, timeAgo } from '../dates.js'
import Markdown from './Markdown.jsx'

function NoteEditor({ note, now, onChange, onDelete, onClose }) {
  // Az első kattintás a Törlésre csak megkérdezi, biztos-e.
  const [confirming, setConfirming] = useState(false)
  // Szerkesztjük a szöveget, vagy az előnézetét nézzük?
  const [preview, setPreview] = useState(false)

  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Jegyzetek
        </button>
        <select
          className="editor__category"
          aria-label="Kategória"
          value={note.category}
          onChange={(event) => onChange(note.id, { category: event.target.value })}
        >
          {Object.keys(CATEGORIES).map((key) => (
            <option key={key} value={key}>
              {CATEGORIES[key]}
            </option>
          ))}
        </select>
        <div className="editor__tabs">
          <button type="button" className="chip" aria-pressed={!preview} onClick={() => setPreview(false)}>
            Szerkesztés
          </button>
          <button type="button" className="chip" aria-pressed={preview} onClick={() => setPreview(true)}>
            Előnézet
          </button>
        </div>
      </div>
      <input
        className="editor__title"
        aria-label="Cím"
        placeholder="Cím"
        value={note.title}
        autoFocus={note.title === ''}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      {preview ? (
        <Markdown text={note.body} />
      ) : (
        <textarea
          className="editor__body"
          aria-label="Jegyzet"
          placeholder="Kezdj el írni…"
          value={note.body}
          onChange={(event) => onChange(note.id, { body: event.target.value })}
        />
      )}
      <footer className="editor__foot">
        <span title={formatDate(note.updatedAt)}>Szerkesztve: {timeAgo(note.updatedAt, now)}</span>
        {confirming ? (
          <span className="editor__confirm">
            Biztosan törlöd?
            <button type="button" className="button button--danger" onClick={() => onDelete(note.id)}>
              Igen, törlöm
            </button>
            <button type="button" className="button button--ghost" autoFocus onClick={() => setConfirming(false)}>
              Mégse
            </button>
          </span>
        ) : (
          <button type="button" className="button button--ghost" onClick={() => setConfirming(true)}>
            Törlés
          </button>
        )}
      </footer>
    </article>
  )
}

export default NoteEditor
```

A két fül ugyanazokat a `chip` stílusokat és ugyanazt az `aria-pressed` jelzést használja, mint a kategóriaszűrő. A
`!preview` a `preview` ellentéte: a „Szerkesztés” akkor van benyomva, amikor nem előnézetet nézünk. A `key` miatt
minden jegyzet a „Szerkesztés” fülön nyílik meg.

:::check Ellenőrizd
Nyisd meg a „React hooks cheat sheet” jegyzetet, és kattints az „Előnézet” fülre: a három sor felsorolás lett, a
`useState` és a `useEffect` félkövér, a „custom hooks” dőlt, a `use…` kódként jelenik meg. A „Meeting notes” jegyzetben a
„Decisions” alcím lett. Válts vissza a „Szerkesztés” fülre, és írj egy jegyzetbe egy `# Bevásárlás` sort, alá pedig
két `- ` kezdetű sort: előnézetben címsor és lista lesz belőlük. Most írd be, hogy `<b>szia</b>`: az előnézetben
pontosan így, betűről betűre látszik, nem félkövéren.
:::

:::concept Miért nem HTML-t gyártunk?
Kézenfekvőnek tűnhet a Markdownból HTML-szöveget készíteni, és azt a `dangerouslySetInnerHTML`-lel beírni az oldalba.
A név nem véletlenül ijesztő: ami így bekerül, azt a böngésző HTML-ként futtatja. Ha valaki egy közös jegyzetbe azt
írja, hogy `<img src=x onerror="…">`, akkor az idézőjelek közé írt JavaScript lefut mindenkinél, aki megnyitja. Ez az
[[XSS]] (cross-site scripting), az egyik leggyakoribb webes támadás. A React-elemekbe írt szöveg viszont mindig szöveg
marad: a React gondoskodik róla, hogy a `<` jel `<` jelként jelenjen meg. Ezért építjük az előnézetet elemekből.
:::

:::mistake Gyakori hiba
Kimarad a kerek zárójel a split mintájának két széléről. Ekkor a split a megtalált részeket csak elválasztónak
tekinti, és kidobja őket: a félkövér, a dőlt és a kódként jelölt szavak eltűnnek, a mögöttük álló sima szöveg pedig
páratlan helyre csúszik, ezért dőlt lesz, és elveszti az első és az utolsó karakterét. A hookos jegyzetben a
`**useState**: values that change while the page is open` sorból egy dőlt „ values that change while the page is
ope” lesz.
:::

:::try Próbáld ki
Tanítsd meg az áthúzást: a `~~kész~~` legyen `<s>kész</s>`. A mintába kell egy új rész (`~~.+?~~`), a `renderInline`-ba
pedig egy új sor a `**` mintájára.
:::

### Címkék a szövegben

A kategóriából egy jegyzetnek csak egy lehet, címkéből viszont akárhány. A címkéket nem egy külön mezőbe írjuk, hanem
magába a szövegbe, ahogy a közösségi oldalakon: `#recept`, `#2026-terv`. A címkék listája így megint származtatott
érték: a szövegből számoljuk ki. Írd az `src/notes.js` végére:

```js file=src/notes.js
// #címke: kettőskereszt, utána betűk, számjegyek, kötőjel vagy aláhúzás (#munka, #2026-terv).
const TAG_PATTERN = /(^|\s)#([\p{L}\p{N}_-]+)/gu

// A szövegben szereplő címkék, kisbetűvel, mindegyik csak egyszer.
export function findTags(text) {
  const tags = []
  for (const match of text.matchAll(TAG_PATTERN)) {
    const tag = match[2].toLowerCase()
    if (!tags.includes(tag)) tags.push(tag)
  }
  return tags
}
```

Olvassuk el a mintát darabonként:

- `(^|\s)`: a címke a szöveg elején (`^`) vagy egy szóköz vagy sortörés (`\s`) után kezdődik. Így a `C#` vagy egy
  `oldal.hu/#hash` nem számít címkének.
- `#`: maga a kettőskereszt.
- `([\p{L}\p{N}_-]+)`: a szögletes zárójel a megengedett karakterek listája: bármilyen betű (`\p{L}`, ékezetesek is),
  számjegy (`\p{N}`), aláhúzás vagy kötőjel; a `+` jelentése „egy vagy több”. A `# Címsor` így nem címke, mert a `#`
  után szóköz áll.
- A kerek zárójelek csoportokat jelölnek. A `matchAll` minden találatot visszaad, és mindegyikben a `match[2]` a
  második csoport, vagyis maga a címke, kettőskereszt nélkül.

A címkesor a kategóriák alá kerül, ugyanolyan chipekkel. Egyszerre egy címke lehet kiválasztva, és a kiválasztottra
még egyszer kattintva kikapcsol a szűrés. Hozd létre az `src/components/TagFilter.jsx` fájlt:

```jsx file=src/components/TagFilter.jsx
function TagFilter({ tags, value, onChange }) {
  // Ha még egyik jegyzetben sincs címke, a sor meg sem jelenik.
  if (tags.length === 0) return null

  // A már kiválasztott címkére kattintva kikapcsol a szűrés (null = nincs címkeszűrő).
  function toggle(tag) {
    onChange(value === tag ? null : tag)
  }

  return (
    <div className="filters" role="group" aria-label="Címkék">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="chip chip--tag"
          aria-pressed={value === tag}
          onClick={() => toggle(tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}

export default TagFilter
```

Egy komponens `null`-t is visszaadhat: ilyenkor semmit sem rajzol.

Az `App`-ban egy új állapot (`tag`, `null`-lal indul), egy harmadik `filter` a láncban, és az összes címke listája.
Az `src/App.jsx`-ben négy helyen változik valami. Az importok közül a `notes.js` sora bővül, és jön egy új a
`CategoryFilter` sora alá:

```jsx file=src/App.jsx mark=1,3
import { findTags, matchesQuery } from './notes.js'
import CategoryFilter from './components/CategoryFilter.jsx'
import TagFilter from './components/TagFilter.jsx'
```

Az állapotok közé, a `category` alá jön a `tag`, a származtatott értékek közé pedig a címkeszűrő és az összes címke
listája. A megjegyzések maradnak, a `selected` sorai pedig ugyanúgy az `allTags` után jönnek:

```jsx file=src/App.jsx mark=2,8,11-13
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState(null)

  // Származtatott értékek: minden rajzoláskor az állapotból számoljuk őket.
  // A filter új tömböt ad, így a sort már nem az állapotot rendezi át.
  const visibleNotes = notes
    .filter((note) => category === 'all' || note.category === category)
    .filter((note) => tag === null || findTags(note.body).includes(tag))
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  // Minden címke, ami bármelyik jegyzetben előfordul, egyszer, ábécérendben.
  const allTags = [...new Set(notes.flatMap((note) => findTags(note.body)))]
  allTags.sort((a, b) => a.localeCompare(b))
```

Az új jegyzet ne bújjon el egy címkeszűrő mögött sem. Az `addNote` vége:

```jsx file=src/App.jsx mark=3,5
    setNotes([note, ...notes])
    setSelectedId(note.id)
    // Az új jegyzet ne bújjon el egy keresés vagy egy címke mögé.
    setQuery('')
    setTag(null)
  }
```

Végül a `return`-ben a címkesor a kategóriák alá kerül:

```jsx file=src/App.jsx mark=3
      <div className="notes__filters">
        <CategoryFilter notes={notes} value={category} onChange={setCategory} />
        <TagFilter tags={allTags} value={tag} onChange={setTag} />
      </div>
```

- A `flatMap` olyan, mint a `map`, csak a visszaadott tömböket egyetlen tömbbé lapítja: a jegyzetenkénti
  `['react', 'learning']`, `['release']`, … listákból egyetlen hosszú lista lesz.
- Ugyanaz a címke több jegyzetben is előfordulhat. A 3. leckéből ismert [[Set]] minden értéket csak egyszer tart meg,
  a `[...new Set(…)]` pedig a [[spread]] segítségével újra tömbbé teríti ki (a 4. leckében erre az `Array.from`-ot
  használtuk).
- A `localeCompare` két szöveget a böngésző nyelvének ábécéje szerint hasonlít össze (a 10. leckében a `'hu'`
  paraméterrel külön kértük a magyart), így az „ötlet” a „zene” elé kerül, nem a
  végére, ahogy a sima `sort()` tenné. Itt nyugodtan rendezhetünk helyben, mert az `allTags` egy frissen készült
  tömb, nem állapot.

:::check Ellenőrizd
A kategóriák alatt megjelenik a címkesor: `#learning`, `#portfolio`, `#react`, `#release`, `#weekend`. Kattints a
`#react`-re: csak a „React hooks cheat sheet” marad; kattints rá még egyszer: visszajön az összes. Írd egy jegyzet
végére, hogy `#recept`: gépelés közben megszületik az új chip. A „Meeting notes” `## Decisions` sora nem lesz címke.
:::

:::mistake Gyakori hiba
Kimarad a `g` a minta végéről: `/(^|\s)#([\p{L}\p{N}_-]+)/u`. A `matchAll` csak „globális” mintával működik, ezért
hibát dob („String.prototype.matchAll called with a non-global RegExp argument”), és az oldal üres marad.
:::

:::try Próbáld ki
Írd ki a listában minden jegyzet alá a címkéit is: a `NoteList`-ben a harmadik `<span>` után egy újabb sor, például
`{findTags(note.body).map((tag) => '#' + tag).join(' ')}` (ne felejtsd el importálni a `findTags`-et).
:::

### Szinkron egy szerverrel

A jegyzeteid most a böngésző tárolójában élnek: ha telefonon is látni szeretnéd őket, kell egy szerver, amit minden
eszközöd elér. Egy igazi szerver más gépen fut, de ebben a kurzusban nem használunk külső szolgáltatást, ezért a
kiinduló projekttel érkezett egy kitalált: az `src/fakeApi.js`. Úgy viselkedik, mint egy igazi: minden kérés eltart
egy darabig, és ha nincs internet, nem érhető el. Az „adatbázisa” egy localStorage-kulcs (`notes-app:server`), ezért
a böngésző minden lapja ugyanazt a szervert éri el, ahogy két külön eszköz is tenné. Két kérést ismer:

- `getNotes()`: az összes jegyzet a szerverről,
- `saveNotes(notes)`: mostantól ez a lista legyen a szerveren.

Mindkettő [[Promise]]-t ad vissza, ahogy a 3. lecke vágólapja is; egy [[async függvényben|async függvény]] az `await`
várja meg a választ, a `try/catch` pedig elkapja a hibát.

A [[szinkronizálás]] terve:

1. Lekérjük a szerver jegyzeteit.
2. Összefésüljük a sajátjainkkal: ha egy jegyzet mindkét helyen megvan, az a változat nyer, amelyiket később
   módosították (ezért kell az `updatedAt`). Ami csak az egyik helyen van, az bekerül.
3. Az összefésült listát visszaküldjük a szerverre, és mi is ezt használjuk tovább.

Hozd létre a hookot az `src/useSync.js` fájlban:

```js file=src/useSync.js
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { getNotes, saveNotes } from './fakeApi.js'

// Két jegyzetlistából egy: minden jegyzetből a később módosított változat marad meg.
function mergeNotes(local, remote) {
  const newest = {}
  for (const note of [...remote, ...local]) {
    const seen = newest[note.id]
    if (!seen || note.updatedAt > seen.updatedAt) newest[note.id] = note
  }
  return Object.values(newest)
}

function useSync(notes, setNotes) {
  const [status, setStatus] = useState('idle') // 'idle', 'syncing' vagy 'error'
  const [lastSync, setLastSync] = useLocalStorage('notes-app:last-sync', 0)

  // Származtatott érték: hány jegyzet változott az utolsó szinkron óta?
  const pending = notes.filter((note) => note.updatedAt > lastSync).length

  async function sync() {
    const startedAt = Date.now()
    setStatus('syncing')
    try {
      const serverNotes = await getNotes()
      const merged = mergeNotes(notes, serverNotes)
      await saveNotes(merged)
      // Szinkron közben is gépelhettél: a friss állapotba fésüljük bele, nem felülírjuk.
      setNotes((current) => mergeNotes(current, merged))
      setLastSync(startedAt)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return { status, pending, lastSync, sync }
}

export default useSync
```

- A `mergeNotes` egy objektumot használ „névjegyzéknek”: a kulcs a jegyzet `id`-je, az érték az eddig látott
  legújabb változata. Előbb a szerver jegyzetei mennek bele, aztán a sajátjaink; egy jegyzet csak akkor írja felül a
  korábbit, ha később módosították. Az `Object.values` a végén az értékek tömbjét adja: ez az összefésült lista.
- A `lastSync` az utolsó sikeres szinkron kezdete, a `useLocalStorage` miatt újratöltés után is megmarad. Ami azóta
  változott, az „még nincs a szerveren”: a `pending` ezek száma, és ez is származtatott érték.
- A két `await` alatt akár másfél másodperc is eltelhet, és közben tovább gépelhetsz. A `notes` ebben a függvényben
  még a szinkron indulásakori lista, így a `setNotes(merged)` kitörölné, amit közben írtál. Ezért a `setNotes` egy
  függvényt kap: a 6–8. leckéből ismert [[frissítő függvény]] paraméterként a legfrissebb állapotot kapja a Reacttől
  (`current`), és mi abba fésüljük bele a szerver változásait. A gépelésed az újabb, így nyer.

Az állapotsor egy kis komponens az app alján: színes pötty, egy mondat arról, mi történik, a várakozó változások
száma és egy gomb. Hozd létre az `src/components/SyncStatus.jsx` fájlt:

```jsx file=src/components/SyncStatus.jsx
import { timeAgo } from '../dates.js'

function SyncStatus({ status, pending, lastSync, now, onSync }) {
  // Az üzenet az állapotból következik; a későbbi sor felülírja a korábbit.
  let message = 'Még nem szinkronizáltál.'
  if (lastSync > 0) message = `Szinkronizálva: ${timeAgo(lastSync, now)}`
  if (status === 'syncing') message = 'Szinkronizálás…'
  if (status === 'error') message = 'Nem sikerült elérni a szervert.'

  return (
    <footer className={`sync sync--${status}`}>
      <span className="sync__dot" aria-hidden="true" />
      <p className="sync__text" role="status">
        {message}
        {pending > 0 && <span className="sync__pending">Még nincs a szerveren: {pending}</span>}
      </p>
      <button
        type="button"
        className="button button--ghost"
        disabled={status === 'syncing'}
        onClick={onSync}
      >
        {status === 'error' ? 'Újra' : 'Szinkronizálás'}
      </button>
    </footer>
  )
}

export default SyncStatus
```

A `role="status"` miatt a képernyőolvasó felolvassa az új üzenetet, amikor megváltozik. A gomb szinkron közben le
van tiltva (`disabled`), így nem indulhat el kettő egyszerre.

Végül az `App`, ahol három helyen változik valami. Az importok közé a `useNow` alá jön a `useSync`, a `TagFilter` alá
pedig a `SyncStatus`:

```jsx file=src/App.jsx mark=4,11
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import useSync from './useSync.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import { findTags, matchesQuery } from './notes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import TagFilter from './components/TagFilter.jsx'
import SyncStatus from './components/SyncStatus.jsx'
import './App.css'
```

A hook az állapotok közé kerül, a `tag` alá. Megkapja a jegyzeteket és a beállító függvényüket, és visszaad mindent,
ami az állapotsornak kell:

```jsx file=src/App.jsx mark=2
  const [tag, setTag] = useState(null)
  const { status, pending, lastSync, sync } = useSync(notes, setNotes)
```

Az állapotsor a `return` legvégére kerül: a `notes__panes` sávot lezáró `</div>` alá, de még a legkülső `<div>`-en
belül:

```jsx file=src/App.jsx mark=3
        </main>
      </div>
      <SyncStatus status={status} pending={pending} lastSync={lastSync} now={now} onSync={sync} />
    </div>
  )
```

:::check Ellenőrizd
Az app alján ott az állapotsor: „Még nem szinkronizáltál.”, mellette „Még nincs a szerveren: 4” (vagy ahány
jegyzeted van). Kattints a „Szinkronizálás” gombra: egy pillanatig „Szinkronizálás…”, aztán „Szinkronizálva: most”, a
számláló eltűnik, és a listában megjelenik egy új jegyzet, a „Written on my phone”: ez várt a szerveren. Az
**Application** → **Local storage** alatt a `notes-app:server` kulcsban ott vannak a jegyzeteid.

Most a második „eszköz”: nyisd meg az appot egy új lapon is. Ott írd át az egyik jegyzet címét, és nyomd meg a
„Szinkronizálás” gombot; aztán menj vissza az első lapra, és ott is szinkronizálj: megjelenik az új cím.
:::

:::concept Ki nyer, ha két eszközön ugyanazt írod át?
Nálunk az, amelyiket később módosították: ez a „last write wins”, vagyis az utolsó írás nyer. Egyszerű, és egy
jegyzetfüzetnél többnyire elég, de van ára: ha ugyanazt a jegyzetet két eszközön is átírod szinkron nélkül, a korábbi
változtatás elvész. Ráadásul az eszközök órái sem járnak pontosan együtt. Az igazi szolgáltatások ezért a szerver
idejét vagy verziószámokat használnak, és ütközéskor megkérdezik a felhasználót, vagy mindkét változatot megtartják.
:::

:::mistake Gyakori hiba
`setNotes(merged)` a frissítő függvény helyett. Elsőre működik, de ha a gombra kattintás után rögtön gépelni kezdesz,
a szinkron végén eltűnik, amit közben írtál: a `merged` a szinkron indulásakori jegyzetekből készült, és felülírja a
frissebbet.
:::

:::try Próbáld ki
A szerver most sosem hibázik. Állítsd az `src/fakeApi.js`-ben a `FAIL_RATE`-et `0.3`-ra, vagyis nagyjából minden
harmadik kérés hibázzon, és szinkronizálj néhányszor: a pötty piros lesz, az üzenet „Nem sikerült elérni a
szervert.”, a gombon „Újra” áll, a jegyzeteid pedig megvannak. Utána állítsd vissza `0`-ra.
:::

### Törlés minden eszközön

Törölj egy jegyzetet, és szinkronizálj: visszajön. Miért? Nézd meg újra az előző lépés tervét: ami csak az egyik
helyen van, az bekerül. A mi listánkból eltűnt a jegyzet, de a szerveren még megvan, így az összefésülés
„visszaadja”.

A törölt jegyzetet ezért nem szabad kidobni. Ehelyett egy `deleted: true` jelet kap, friss időbélyeggel. Ez a
[[tombstone]] (sírkő), vagyis a törlés híre: újabb, mint a szerveren lévő példány, ezért nyer az összefésülésnél, a
szinkron elviszi a többi eszközre is, és ott is eltűnik a jegyzet. A sírkövek azért nem maradnak örökké: egy igazi
szolgáltatásban egy idő után, amikor már minden eszköz megkapta, a szerver kitakarítja őket.

Az `App`-ban két dolog változik: a törlés mostantól megjelöl, nem kivesz, és mivel a megjelölt jegyzeteket sehol sem
mutatjuk, a származtatott értékek egy új listából, a `liveNotes`-ból indulnak. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=26-28,34,37,65-67,88
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import useSync from './useSync.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import { findTags, matchesQuery } from './notes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import TagFilter from './components/TagFilter.jsx'
import SyncStatus from './components/SyncStatus.jsx'
import './App.css'

function App() {
  // A jegyzetek mostantól a böngészőben is megmaradnak.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  const now = useNow()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState(null)
  const { status, pending, lastSync, sync } = useSync(notes, setNotes)

  // Származtatott értékek: minden rajzoláskor az állapotból számoljuk őket.
  // A filter új tömböt ad, így a sort már nem az állapotot rendezi át.
  // A törölt jegyzetek a szinkron miatt még megvannak, de már nem mutatjuk őket.
  const liveNotes = notes.filter((note) => !note.deleted)
  const visibleNotes = liveNotes
    .filter((note) => category === 'all' || note.category === category)
    .filter((note) => tag === null || findTags(note.body).includes(tag))
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  // Minden címke, ami bármelyik jegyzetben előfordul, egyszer, ábécérendben.
  const allTags = [...new Set(liveNotes.flatMap((note) => findTags(note.body)))]
  allTags.sort((a, b) => a.localeCompare(b))
  // Csak az azonosítót tároljuk, a jegyzetet minden rajzoláskor kikeressük a listából.
  const selected = liveNotes.find((note) => note.id === selectedId)

  function addNote() {
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      // Ha épp egy kategóriát nézel, az új jegyzet is abba kerül.
      category: category === 'all' ? 'personal' : category,
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
    // Az új jegyzet ne bújjon el egy keresés vagy egy címke mögé.
    setQuery('')
    setTag(null)
  }

  function updateNote(id, changes) {
    // Új tömb: a módosított jegyzet helyén egy új objektum áll, friss időbélyeggel.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // a többi jegyzet marad, ami volt
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    // Nem vesszük ki a listából, csak megjelöljük: a szinkron így a többi eszköznek is elviszi a hírt.
    // A címét és a szövegét kiürítjük, ne maradjon meg semmi a törölt jegyzetből.
    updateNote(id, { deleted: true, title: '', body: '' })
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Jegyzetek</h1>
        <input
          type="search"
          className="notes__search"
          aria-label="Keresés a jegyzetekben"
          placeholder="Keresés…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="button" onClick={addNote}>
          + Új jegyzet
        </button>
      </header>
      <div className="notes__filters">
        <CategoryFilter notes={liveNotes} value={category} onChange={setCategory} />
        <TagFilter tags={allTags} value={tag} onChange={setTag} />
      </div>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Jegyzetek">
          <NoteList notes={visibleNotes} selectedId={selectedId} now={now} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Válassz egy jegyzetet a listából, vagy írj egy újat.</p>
          )}
        </main>
      </div>
      <SyncStatus status={status} pending={pending} lastSync={lastSync} now={now} onSync={sync} />
    </div>
  )
}

export default App
```

- A `deleteNote` az `updateNote`-ra bízza a megjelölést: az beleolvasztja a jegyzetbe a
  `{ deleted: true, title: '', body: '' }` változást, és friss `updatedAt`-et ad neki, így a sírkő lesz a jegyzet
  legújabb változata. A címét és a szövegét kiürítjük, hogy ne maradjon meg semmi a törölt jegyzetből.
- A `liveNotes` megint egy származtatott érték: minden jegyzet, amelyiken nincs ott a jel. Ebből indul a lista, a
  címkék, a kategóriák darabszáma és a megnyitott jegyzet is. A `useSync` viszont továbbra is a teljes `notes` listát
  kapja, a sírkövekkel együtt, hiszen azoknak is el kell jutniuk a szerverre.

:::check Ellenőrizd
Törölj egy jegyzetet, és szinkronizálj: most már nem jön vissza. Az **Application** → **Local storage** alatt a
`notes-app:server` kulcsban a törölt jegyzet még ott van, `"deleted":true` jellel, üres címmel és szöveggel. Most
törölj egy jegyzetet az egyik lapon, szinkronizálj, aztán a másikon is: ott is eltűnik.
:::

:::mistake Gyakori hiba
A `CategoryFilter` a `notes={notes}`-on marad. A lista jó, de a chipek a sírköveket is beleszámolják: törölj egy
jegyzetet, és a „Mind” mellett még mindig a régi szám áll.
:::

:::try Próbáld ki
Írd ki, hány sírkövet őriz az eszközöd: a `<nav>` elejére egy `<p>{notes.length - liveNotes.length} törölt</p>`. Ez
is egy származtatott érték.
:::

### Offline mód

Mi történik, ha elmegy az internet? A jegyzetek a böngészőben vannak, úgyhogy írni és olvasni továbbra is lehet: az
app eleve [[offline-first]], vagyis a saját tárolójából dolgozik, a szerver csak ráadás. Két dolog hiányzik: hogy az
app szóljon, ha nincs kapcsolat, és hogy amikor visszajön a net, magától szinkronizáljon, ne neked kelljen
észrevenned.

A böngésző tudja, van-e hálózat: a `navigator.onLine` értéke `true` vagy `false`, és amikor megváltozik, a `window`
egy `online` vagy `offline` eseményt kap. Ezt figyeljük egy saját hookban, ahogy az 1. leckében a `hashchange`-et és
a 2. leckében a `matchMedia` változását. Hozd létre az `src/useOnline.js` fájlt:

```js file=src/useOnline.js
import { useEffect, useState } from 'react'

// Van-e most internet? A böngésző szól, ha megszakad vagy visszajön a kapcsolat.
function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    function update() {
      setOnline(navigator.onLine)
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    // Takarítás: ha a komponens eltűnik, nem figyelünk tovább.
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  return online
}

export default useOnline
```

A `useSync` használja: az `online` értéket is visszaadja, és egy effekt elindítja a szinkront induláskor és minden
alkalommal, amikor visszajön a kapcsolat. Itt a teljes `src/useSync.js`:

```js file=src/useSync.js mark=1,3,17,40-43,45
import { useEffect, useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useOnline from './useOnline.js'
import { getNotes, saveNotes } from './fakeApi.js'

// Két jegyzetlistából egy: minden jegyzetből a később módosított változat marad meg.
function mergeNotes(local, remote) {
  const newest = {}
  for (const note of [...remote, ...local]) {
    const seen = newest[note.id]
    if (!seen || note.updatedAt > seen.updatedAt) newest[note.id] = note
  }
  return Object.values(newest)
}

function useSync(notes, setNotes) {
  const online = useOnline()
  const [status, setStatus] = useState('idle') // 'idle', 'syncing' vagy 'error'
  const [lastSync, setLastSync] = useLocalStorage('notes-app:last-sync', 0)

  // Származtatott érték: hány jegyzet változott az utolsó szinkron óta?
  const pending = notes.filter((note) => note.updatedAt > lastSync).length

  async function sync() {
    const startedAt = Date.now()
    setStatus('syncing')
    try {
      const serverNotes = await getNotes()
      const merged = mergeNotes(notes, serverNotes)
      await saveNotes(merged)
      // Szinkron közben is gépelhettél: a friss állapotba fésüljük bele, nem felülírjuk.
      setNotes((current) => mergeNotes(current, merged))
      setLastSync(startedAt)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  // Induláskor, és valahányszor visszajön az internet: szinkron.
  useEffect(() => {
    if (online) sync()
  }, [online])

  return { online, status, pending, lastSync, sync }
}

export default useSync
```

Az effekt függősége az `[online]`: lefut az első rajzolás után (induláskor szinkron), és minden alkalommal, amikor az
`online` értéke megváltozik. Ha éppen `false`-ra váltott, nem csinál semmit; ha `true`-ra, szinkronizál.

:::concept Miért fut induláskor kétszer?
Ha a `sync` elejére beírsz egy `console.log('szinkron')` sort, a konzolban induláskor kétszer jelenik meg. Ez a React
[[StrictMode]]-ja
(az `src/main.jsx`-ben ez veszi körül az `<App />`-ot): fejlesztés közben szándékosan kétszer futtatja az effekteket,
hogy kiderüljön, ha egy effekt nem bírja az ismétlést. A miénk bírja: a második szinkron ugyanazt fésüli össze, mint
az első, és ugyanoda jut. Az ilyen műveletet [[idempotensnek|idempotens]] hívják. A kész, lefordított appban csak egy
szinkron fut.
:::

Az állapotsor is jelezze, ha nincs net: szürke pötty, más üzenet, és a gomb le van tiltva, hiszen úgysem érné el a
szervert. Itt a teljes `SyncStatus.jsx`:

```jsx file=src/components/SyncStatus.jsx mark=3,9,12,21
import { timeAgo } from '../dates.js'

function SyncStatus({ online, status, pending, lastSync, now, onSync }) {
  // Az üzenet az állapotból következik; a későbbi sor felülírja a korábbit.
  let message = 'Még nem szinkronizáltál.'
  if (lastSync > 0) message = `Szinkronizálva: ${timeAgo(lastSync, now)}`
  if (status === 'syncing') message = 'Szinkronizálás…'
  if (status === 'error') message = 'Nem sikerült elérni a szervert.'
  if (!online) message = 'Nincs internet. A változásaid ezen az eszközön várnak.'

  return (
    <footer className={`sync sync--${online ? status : 'offline'}`}>
      <span className="sync__dot" aria-hidden="true" />
      <p className="sync__text" role="status">
        {message}
        {pending > 0 && <span className="sync__pending">Még nincs a szerveren: {pending}</span>}
      </p>
      <button
        type="button"
        className="button button--ghost"
        disabled={!online || status === 'syncing'}
        onClick={onSync}
      >
        {status === 'error' ? 'Újra' : 'Szinkronizálás'}
      </button>
    </footer>
  )
}

export default SyncStatus
```

Az `App`-ban két helyen változik valami. A hook eredményéből az `online`-t is kivesszük:

```jsx file=src/App.jsx
  const { online, status, pending, lastSync, sync } = useSync(notes, setNotes)
```

és a `return` végén továbbadjuk az állapotsornak. A sok prop miatt most soronként egyet írunk:

```jsx file=src/App.jsx mark=2
      <SyncStatus
        online={online}
        status={status}
        pending={pending}
        lastSync={lastSync}
        now={now}
        onSync={sync}
      />
```

:::check Ellenőrizd
Töltsd újra az oldalt: magától szinkronizál, és „Szinkronizálva: most” lesz. Most nyisd meg a fejlesztői eszközök
**Network** fülét, és a „No throttling” feliratú legördülőben válaszd az **Offline**-t: a pötty szürke, az üzenet
„Nincs internet. A változásaid ezen az eszközön várnak.”, a gomb halvány. Írj egy új jegyzetet: működik, és megjelenik a
„Még nincs a szerveren: 1”. Állítsd vissza a legördülőt „No throttling”-ra: az app magától szinkronizál, és a
számláló eltűnik. Gratulálok, kész a jegyzetfüzeted!
:::

:::concept Mi kell egy igazi offline apphoz?
Az adataink offline is megvannak, de ha offline töltöd újra az oldalt, a böngésző magát az appot sem tudja
letölteni. Az igazi offline appok egy [[service worker]] segítségével elmentik a saját fájljaikat (HTML, JavaScript,
CSS), és onnan töltik be magukat, ha nincs hálózat. Ettől lesz egy weboldalból telepíthető [[PWA]] (progresszív
webalkalmazás). A 10. lecke haladó szintjén a bevásárlólistát már így tetted offline is működővé.
:::

:::mistake Gyakori hiba
Rövidebbnek tűnik így írni az effektet: `useEffect(() => online && sync(), [online])`. A nyílfüggvény ilyenkor
visszaadja a `sync()` eredményét, egy Promise-t (offline pedig `false`-t), a React pedig a visszaadott értéket
takarító függvénynek hiszi, és meg is próbálja meghívni. Fejlesztés közben a StrictMode rögtön lefuttat egy
takarítást, ezért az oldal üres marad, a konzolban pedig előbb a „useEffect must not return anything besides a
function, which is used for clean-up” figyelmeztetés, aztán a „destroy is not a function” hiba áll. Az effekt kapcsos
zárójeles törzset kapjon, és ne adjon vissza mást, csak takarító függvényt.
:::

:::try Próbáld ki
Írd ki a lap címébe is (ez látszik a böngésző fülén), ha van várakozó változás. Tedd ezt az effektet az `App`-ba, a
`useSync` sora alá (a `pending` csak onnantól létezik), és a `useEffect`-et is importáld:
`import { useEffect, useState } from 'react'`.

```jsx file=src/App.jsx
  useEffect(() => {
    document.title = pending > 0 ? '(' + pending + ') Jegyzetek' : 'Jegyzetek'
  }, [pending])
```

A `document` kívül esik a React dobozán, ezért ez is effektbe való.
:::
