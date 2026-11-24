# Mit építünk?

Egy zongorát a böngészőben. Egérrel, ujjal vagy a számítógép billentyűzetével játszol rajta, oktávot és hangszínt
váltasz, felveszed és visszajátszod a dallamodat, és ha van MIDI-billentyűzeted, azt is csatlakoztathatod. A végén egy
dallamtanító mód sárgán mutatja, melyik billentyű következik.

Hangfájl egy sincs benne: minden hangot maga a böngésző állít elő menet közben, a Web Audio API segítségével. Közben
megtanulod, hogyan épül fel egy felület egy tömbből, hogyan figyel az oldal a billentyűzetre, és mire jó a `useRef`, ha
nem egy HTML-elemet, hanem szóló hangokat kell kézben tartani.

:::levels
- Egy oktávnyi zongorabillentyű egy tömbből: kattintásra megszólalnak, és addig szólnak, amíg nyomva tartod őket. | kb. 2 óra
- Játék a számítógép billentyűzetével, hangok képletből, oktávváltás és négy hangszín. | kb. 3 óra
- Hangszintézis burkológörbével és szűrővel, felvétel és visszajátszás, MIDI-billentyűzet és dallamtanító mód. | kb. 4 óra
:::

**Előismeret:** az előző leckék, főleg ezek: listák `map`-pel és `key`-jel (9. lecke), billentyűesemények, a closure és
a frissítő függvény (7. lecke), saját hook (9. lecke), a `useEffect` takarító függvénye (3. lecke) és a `useRef`
(16. lecke). Ahol egy ismerős dolgot új módon használunk, ott újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/17-piano/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Az 1. lecke 0. lépése részletesen elmagyarázza, hogyan jutsz
hozzá; itt csak röviden. Nyiss egy terminált a munkamappádban, ahol a `rika-mentoring` repó van, hozd le az új
leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját `piano` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/17-piano/exercise piano
```

Ha még nincs meg a repó, az első három sor helyett egyszer klónozd le:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Git nélkül is megszerezheted: a repó
[GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/17-piano/exercise` mappát a munkamappádba, `piano` néven. A másolatodban dolgozol: a repó
érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `piano` mappát a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér panelt látsz
„Musical Instrument” címmel. Más még nincs rajta: a zongorát te építed fel.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. Az első terminált az `npm run dev`
foglalja, ezért nyiss egy másodikat (a terminálpanel **+** gombjával), a `piano` mappában:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` visszaállítja a megváltozott fájlokat az utolsó commitod állapotára (az újonnan
létrehozottakat nem törli, azokat kézzel töröld), és érdemes minden működő lépés után commitolni.

A kiinduló projektben három fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen (a billentyűk, a gombok, a panelek). Ez a lecke a Reactről és a
  hangról szól, nem a CSS-ről, ezért csak a lépésekben megadott osztályneveket (`keys`, `key`, `panel`, …) használod. A
  billentyűk részénél egy megjegyzés elmagyarázza, hogyan ülnek a fekete billentyűk a fehérek között: érdemes elolvasni.
- `src/melodies.js`: három rövid dallam a haladó szint dallamtanító módjához. Addig nem kell hozzányúlnod.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések, a „Musical Instrument” cím és a
dallamok címe angolul vannak. Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit
te írsz be, magyar feliratokkal és megjegyzésekkel mutatjuk.

Ebben a leckében szólni fog a gép: kapcsold be a hangszórót, vagy vedd fel a fülhallgatót (nem túl hangosan!).

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza. Kívülről a [[props]]-ain keresztül kap adatot, és a
[[useState]] segítségével emlékszik: ha egy állapotérték megváltozik, a React újrarajzolja. Egy tömbből a `map` készít
listát, és minden elem egyedi [[key]]-t kap. A rajzoláson kívüli munka (időzítő, eseményfigyelő) a [[useEffect]]-be
kerül, a takarító függvénye pedig rendet rak utána. A [[useRef]] egy doboz, ami megőrzi a tartalmát a rajzolások
között, de ha a tartalma megváltozik, a React nem rajzol újra. Ezekre a lépésekben röviden emlékeztetünk.
:::

### Billentyűk egy tömbből

A zongora billentyűi szabályos mintát követnek: hét fehér billentyű (C, D, E, F, G, A, H), köztük öt fekete, kettes és
hármas csoportokban. Tizenkét billentyű után a minta elölről kezdődik: ez egy [[oktáv]]. Két szomszédos billentyű
között egy [[félhang]] a különbség.

Minden hang egy rezgés: minél többször rezeg másodpercenként, annál magasabb. A másodpercenkénti rezgések száma a
[[frekvencia]], a mértékegysége a [[hertz]] (Hz). A zenekarok a 440 Hz-es A hangra hangolnak, a zongora közepén lévő C
pedig 261,63 Hz.

A billentyűket nem egyenként írjuk be a JSX-be, hanem egy tömbből készítjük: a tömb minden eleme egy hang adatait írja
le, a komponens pedig a `map`-pel mindegyikből egy gombot csinál. Ha a tömb változik, a billentyűzet magától követi.
Hozd létre az `src` mappában a `notes.js` fájlt:

```js file=src/notes.js
// A zongora egy oktávja: a középső C-től a következő C-ig.
// midi: a billentyű sorszáma (a középső C a 60-as), name: a hang neve,
// black: fekete billentyű-e, frequency: hányszor rezeg a hang másodpercenként (hertz).
export const NOTES = [
  { midi: 60, name: 'C', black: false, frequency: 261.63 },
  { midi: 61, name: 'Cisz', black: true, frequency: 277.18 },
  { midi: 62, name: 'D', black: false, frequency: 293.66 },
  { midi: 63, name: 'Disz', black: true, frequency: 311.13 },
  { midi: 64, name: 'E', black: false, frequency: 329.63 },
  { midi: 65, name: 'F', black: false, frequency: 349.23 },
  { midi: 66, name: 'Fisz', black: true, frequency: 369.99 },
  { midi: 67, name: 'G', black: false, frequency: 392 },
  { midi: 68, name: 'Gisz', black: true, frequency: 415.3 },
  { midi: 69, name: 'A', black: false, frequency: 440 },
  { midi: 70, name: 'B', black: true, frequency: 466.16 },
  { midi: 71, name: 'H', black: false, frequency: 493.88 },
  { midi: 72, name: 'C', black: false, frequency: 523.25 },
]
```

Minden hang egy objektum, négy mezővel:

- `midi`: a billentyű sorszáma. A hangszerek és a zeneprogramok a [[MIDI]]-szabvány szerint félhangonként számozzák a
  hangokat, és ebben a zongora közepén lévő C a 60-as. Nálunk ez lesz a billentyű egyedi azonosítója.
- `name`: a hang neve. A fekete billentyűknek két nevük is lehet (a Cisz például Desz is), mi a felemelt, „-isz” végű
  nevet használjuk, kivéve az A és a H közöttit, amelyet mindenki B-nek hív. Két C is van a sorban, mert a billentyűzet
  a következő oktáv C-jével zárul, ahogy a zongora is.
- `black`: fekete billentyű-e (`true` vagy `false`).
- `frequency`: a frekvencia hertzben. A következő lépésben ebből lesz hang.

A billentyűzet saját komponenst kap. Hozz létre az `src` mappában egy `components` mappát, benne a `PianoKeys.jsx`
fájlt:

```jsx file=src/components/PianoKeys.jsx
function PianoKeys({ notes }) {
  return (
    <div className="keys">
      {notes.map((note) => {
        const className = note.black ? 'key key--black' : 'key key--white'
        return (
          <button key={note.midi} type="button" className={className} aria-label={note.name}>
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

- A `map` minden hangból egy `<button>`-t készít. Gomb lesz, mert kattintani fogunk rá. Most a `map` nyílfüggvénye
  kapcsos zárójeles törzset kapott, mert a gomb előtt még kiszámoljuk az osztálynevét; ilyenkor a végén `return` kell.
- A `key={note.midi}` azonosítja az elemet a React számára, és a MIDI-szám minden billentyűnél más.
- Az osztálynév a `black` mezőtől függ: `key key--white` vagy `key key--black`. Mindkét osztály a kész `App.css`-ben
  van, és a CSS teszi a fekete billentyűt a két fehér szomszédja közé, fölé.
- A hang neve csak a fehér billentyűkön látszik: a `!note.black && …` csak akkor rajzolja ki a `<span>`-t, ha a hang
  nem fekete. Hogy a fekete gombokat is fel tudja olvasni a képernyőolvasó, az `aria-label` mindegyiknek megadja a
  nevét.

Végül tedd a billentyűzetet az oldalra. Írd át az `src/App.jsx`-et így:

```jsx file=src/App.jsx mark=1-2,9
import { NOTES } from './notes.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <PianoKeys notes={NOTES} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A cím alatt egy fekete keretben egy oktávnyi zongora: 8 fehér és 5 fekete billentyű. A fekete billentyűk kettes és
hármas csoportban ülnek a fehérek között, mint egy igazi zongorán, a fehéreken pedig a hangok neve áll: C, D, E, F, G,
A, H, C. Ha rákattintasz egy billentyűre, még nem szól semmi.
:::

:::mistake Gyakori hiba
`key={note.name}`. A sorban két C is van, így két elem kapja ugyanazt a kulcsot, és a konzolban (++F12++)
figyelmeztetés jelenik meg: „Encountered two children with the same key, `C`”. A React ilyenkor összekeverheti a két
gombot. A kulcsnak az egész listában egyedinek kell lennie: ezért kapott minden hang `midi` számot.
:::

:::try Próbáld ki
Írj még két hangot a `NOTES` tömb végére: `{ midi: 73, name: 'Cisz', black: true, frequency: 554.37 }` és
`{ midi: 74, name: 'D', black: false, frequency: 587.33 }`. A billentyűzet magától kibővül, mert a tömbből készül.
Aztán töröld őket: a CSS a 13 billentyűhöz méretezi a feketéket.
:::

### Az első hang

A billentyűk megvannak, jöjjön a hang. A böngészőnek van egy beépített hangstúdiója, a [[Web Audio API]]. Benne a
hangot apró építőelemekből, úgynevezett [[hangcsomópontokból|hangcsomópont]] (node) rakjuk össze, és úgy kötjük
össze őket, mint a kábeleket egy keverőpultban, a hangforrástól a hangszóróig. Az összekötött csomópontok együtt a
[[hanggráf]]. Most
három kell belőlük:

- Az [[oszcillátor]] (`OscillatorNode`) a hangforrás. Egyenletesen ismétlődő rezgést kelt a megadott frekvencián. Nem
  kell hozzá hangfájl: a hang menet közben, számokból születik.
- A [[GainNode]] a hangerő. A rajta átmenő hangot halkítja vagy hangosítja: 0 a csend, 1 a teljes hangerő.
- A `destination` a hangszóró (vagy a fülhallgató).

Mindegyiket egy [[AudioContext]] készíti el. Ez maga a stúdió: ez kapcsolódik a hangkártyához, és ez adja az órát,
amihez minden hangot időzítünk. A hangkeltés egy saját hook lesz, a `useSynth` (a synth a szintetizátor rövidítése:
elektronikusan hangot keltő hangszer). Hozd létre az `src/useSynth.js` fájlt:

```js file=src/useSynth.js
import { useRef } from 'react'

function useSynth() {
  // A hangstúdió (AudioContext). Az első kattintáskor jön létre, utána mindig ugyanazt használjuk.
  const contextRef = useRef(null)

  function play(frequency) {
    if (contextRef.current === null) {
      contextRef.current = new AudioContext()
    }
    const context = contextRef.current
    const now = context.currentTime

    // A hangforrás: egy oszcillátor, ami másodpercenként frequency-szer rezeg.
    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = frequency

    // A hangerő: gyorsan felfut, aztán egy másodperc alatt elhal, mint egy megütött húr.
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1)

    // Oszcillátor → hangerő → hangszóró. Indulás most, leállás egy másodperc múlva.
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 1)
  }

  return { play }
}

export default useSynth
```

Sorról sorra:

- A `context.currentTime` a stúdió órája: hány másodperc telt el, amióta a stúdió létrejött. Minden időpontot ehhez
  képest adunk meg. Az `oscillator.start(now)` most indítja a hangot, az `oscillator.stop(now + 1)` egy másodperc múlva
  leállítja. `setTimeout` nem kell: a stúdió maga tartja az időt, ezredmásodpercre pontosan.
- Az `oscillator.type = 'triangle'` a rezgés alakja (háromszög); a középszinten választhatóvá tesszük. Az
  `oscillator.frequency.value` a frekvencia, amit a billentyűtől kapunk.
- A `gain.gain` a GainNode `gain` nevű beállítása (innen a dupla név). Az ilyen beállításokat előre is be lehet
  programozni: a `setValueAtTime(0, now)` most 0-ra állítja, a `linearRampToValueAtTime(0.3, now + 0.01)` tíz
  ezredmásodperc alatt egyenletesen 0,3-ra emeli, az `exponentialRampToValueAtTime(0.001, now + 1)` pedig egy másodperc
  alatt szinte a csendig halkítja, egyre lassabban, ahogy egy megütött húr cseng le. Az ilyen görbe sosem éri el a
  nullát, ezért a cél 0,001. A hirtelen be- és kikapcsolás kattanna: a hangszóró membránja egy pillanat alatt ugrana.
- A `connect` köti össze a csomópontokat: oszcillátor → hangerő → hangszóró. Amíg a `gain` nincs bekötve a
  `destination`-be, a hang nem jut ki sehová.

A hook egy objektumot ad vissza, benne a `play` függvénnyel. A billentyűzet egy `onPlay` propot kap, és minden
kattintáskor meghívja a kattintott hanggal. Írd át a `PianoKeys.jsx`-et:

```jsx file=src/components/PianoKeys.jsx mark=1,12
function PianoKeys({ notes, onPlay }) {
  return (
    <div className="keys">
      {notes.map((note) => {
        const className = note.black ? 'key key--black' : 'key key--white'
        return (
          <button
            key={note.midi}
            type="button"
            className={className}
            aria-label={note.name}
            onClick={() => onPlay(note)}
          >
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

Az `App` meghívja a hookot, és átadja a billentyűzetnek, mi történjen egy kattintáskor:

```jsx file=src/App.jsx mark=2,7,9-11,16
import { NOTES } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

function App() {
  const synth = useSynth()

  function playNote(note) {
    synth.play(note.frequency)
  }

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <PianoKeys notes={NOTES} onPlay={playNote} />
    </main>
  )
}

export default App
```

:::concept Miért csak az első kattintáskor jön létre az AudioContext?
A böngészők nem engedik, hogy egy oldal magától hangot adjon: képzeld el, ha minden megnyitott oldal azonnal zenélni
kezdene. Ez az [[automatikus lejátszás szabálya|automatikus lejátszás]] (autoplay policy). Egy AudioContext csak akkor
szólhat, ha a felhasználó már csinált valamit az oldalon: kattintott, leütött egy billentyűt vagy megérintette a
képernyőt. Ha az oldal betöltésekor hoznánk létre, „felfüggesztett” (`suspended`) állapotban születne, és a böngészőn
múlna, mikor éled fel: a Chrome az első kattintás utáni hangnál magától elindítja, más böngészők csak akkor, ha a kód
egy kattintás közben külön kéri. Ezért a `play` hozza létre, abban a pillanatban, amikor a felhasználó éppen
kattintott: így a stúdió minden böngészőben azonnal működik.

A stúdióból egy kell az egész oldalnak. Minden kattintásra újat nyitni pazarlás lenne (mindegyik a hangkártyát
foglalja), és a böngészők korlátozzák is, hány lehet belőle. Ezért egy `useRef` dobozba tesszük: a tartalma megmarad a
rajzolások között. Állapot (`useState`) nem kell hozzá, hiszen a stúdió nem látszik a képernyőn, és ha megváltozik,
semmit nem kell újrarajzolni. Egy sima `let context` változó pedig nem jó: az minden rajzoláskor elölről indulna,
`null`-lal.
:::

:::check Ellenőrizd
Kattints egy billentyűre: egy lágy „pling” szól, ami egy másodperc alatt elhal. Minél jobbra kattintasz, annál
magasabb a hang, a két C pedig „ugyanaz a hang”, csak a jobb oldali magasabban szól. Ha gyorsan több billentyűre
kattintasz, a hangok egymásba csengenek.
:::

:::mistake Gyakori hiba
A 0,001 helyére 0 kerül: `exponentialRampToValueAtTime(0, now + 1)`. Logikusnak tűnik, hiszen csendet akarunk, de egy
exponenciális görbe sosem éri el a nullát: a böngésző hibát dob („RangeError: … The float target value provided (0)
should not be in the range…”), a `play` megáll ennél a sornál, és a billentyűk némák maradnak. A célnak egy nagyon
kicsi, de nullánál nagyobb számnak kell lennie.
:::

:::try Próbáld ki
Írd át a `'triangle'`-t `'square'`-re, `'sawtooth'`-ra vagy `'sine'`-ra, és hallgasd meg, hogyan változik a hang
színe. Utána nyújtsd meg a hangot három másodpercre: mindkét helyen írj `now + 3`-at a `now + 1` helyett.
:::

### Hang, amíg nyomva tartod

Egy igazi hangszeren a hang addig szól, amíg nyomva tartod a billentyűt. Ehhez két dolog kell: tudnunk kell, mikor
nyomják le és mikor engedik fel a billentyűt, és el kell tudnunk hallgattatni egy már szóló hangot.

A kattintás (`click`) erre nem jó, mert csak a felengedés után érkezik. A [[pointeresemények|pointeresemény]] viszont
külön szólnak a lenyomásról (`pointerdown`), a felengedésről (`pointerup`) és arról, ha a mutató elhagyja az elemet
(`pointerleave`). A „pointer” bármilyen mutatót jelent: az egeret, az ujjat egy érintőképernyőn és a rajztollat is,
így ugyanaz a kód mindegyikkel működik.

A `play` helyett a hook mostantól két függvényt ad: a `start` megszólaltat egy hangot, a `stop` elhallgattatja. Az
elhallgattatáshoz a `stop`-nak meg kell találnia a szóló oszcillátort, ezért a `start` eltárolja. Egyszerre több hang
is szólhat (akkordot is lehet játszani), ezért egy [[Map]]-ben tartjuk őket, amit a 8. lecke haladó szintjén már
használtál: a kulcs a hang MIDI-száma, az érték az oszcillátor és a hangereje. A `set` betesz egy párt, a `get`
kikeresi, a `delete` kitörli. A Map is egy `useRef` dobozba kerül: megmarad a rajzolások között, és ha változik, nem
rajzol újra semmit. Ezt ígérte a bevezető: a `useRef` most nem egy HTML-elemet, hanem szóló hangokat tart kézben. Írd át
az `src/useSynth.js`-t:

```js file=src/useSynth.js mark=1,4,6-7,9,13-16,18-21,26,28,31,36,39-47,49-56,58
import { useEffect, useRef } from 'react'

function useSynth() {
  // A hangstúdió (AudioContext). Az első billentyűleütéskor jön létre, utána mindig ugyanazt használjuk.
  const contextRef = useRef(null)
  // Az éppen szóló hangok: MIDI-szám → { oscillator, gain }. Ebből tudjuk, mit kell elhallgattatni.
  const voicesRef = useRef(new Map())

  function getContext() {
    if (contextRef.current === null) {
      contextRef.current = new AudioContext()
    }
    // Ha a böngésző szüneteltette a stúdiót, újraindítjuk.
    if (contextRef.current.state === 'suspended') contextRef.current.resume()
    return contextRef.current
  }

  // Megszólal egy hang, és szól, amíg a stop el nem hallgattatja.
  function start(note) {
    const context = getContext()
    stop(note) // ha ez a hang még szól, előbb elhallgattatjuk
    const now = context.currentTime

    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = note.frequency

    // Gyors, de nem kattanó felfutás: 0-ról indul, és néhány ezredmásodperc alatt eléri a 0,3-at.
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.setTargetAtTime(0.3, now, 0.005)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    voicesRef.current.set(note.midi, { oscillator, gain })
  }

  // A hang rövid halkulással elhallgat.
  function stop(note) {
    const voice = voicesRef.current.get(note.midi)
    if (voice === undefined) return
    voicesRef.current.delete(note.midi)
    const now = contextRef.current.currentTime
    voice.gain.gain.setTargetAtTime(0, now, 0.08)
    voice.oscillator.stop(now + 0.5)
  }

  // Ha a komponens eltűnik, a stúdiót is bezárjuk.
  useEffect(() => {
    return () => {
      voicesRef.current.clear()
      if (contextRef.current !== null) contextRef.current.close()
      contextRef.current = null
    }
  }, [])

  return { start, stop }
}

export default useSynth
```

- A `getContext` az előző lépés `if`-je, külön függvénybe téve, mert már nem csak az az egy vizsgálat van benne: egy
  új sor is került bele. Ha a böngésző szüneteltette (`suspended`) a stúdiót, a `resume()` újraindítja. Ez ritkán fordul elő, de
  például egy telefon szünetelteti a hangot, amíg egy hívás tart, és néhány telefonon az első érintés még csak „engedélyt
  ad”: ott a második érintéstől szól a hang.
- A `start` már nem állítja le magától a hangot. A hangerőt most a `setTargetAtTime(0.3, now, 0.005)` viszi fel: ez egy
  célérték felé közelít, egyre lassabban, ahogy egy forró tea hűl a szoba hőmérsékletére. A harmadik szám az
  [[időállandó]]: ennyi idő alatt teszi meg a hátralévő út nagyjából kétharmadát, háromszor ennyi alatt a 95%-át. Itt ez
  5 ezredmásodperc, így a hang egy szempillantás alatt teljes hangerőn szól, és ott is marad. Az oszcillátor a
  hangerejével együtt a Map-be kerül, a hang MIDI-száma alatt.
- A `start` legelején a `stop(note)` elhallgattatja ugyanezt a hangot, ha még szól. Enélkül a Map-ben az új oszcillátor
  felülírná a régit, és a régit soha többé nem találná meg senki: örökké szólna.
- A `stop` kikeresi a hangot. Ha nem szól, nincs dolga (`return`); ha szól, kiveszi a Map-ből, és ugyanígy halkítja
  el: a `setTargetAtTime(0, now, 0.08)` onnan indul, ahol a hangerő éppen tart (akkor is, ha a felfutás még nem ért
  véget), és a 0 felé közelít. Fél másodperc múlva már csend van, ekkor áll le az oszcillátor. Egy leállított
  oszcillátort nem lehet újraindítani, de nem is kell: minden hanghoz újat készítünk, ez olcsó.
- A takarító függvény (3. lecke) bezárja a stúdiót, ha a komponens eltűnik az oldalról, és elfelejti a szóló hangokat.

Most a billentyűzet. Lenyomásra az `onPress`, felengedésre az `onRelease` propot hívja, és azt is megkapja, mely
hangok szólnak éppen (`active`), hogy azok a billentyűk világítsanak:

```jsx file=src/components/PianoKeys.jsx mark=1-2,4,6-7,14-19
function PianoKeys({ notes, active, onPress, onRelease }) {
  // Az onContextMenu miatt a jobb klikk (és a hosszú érintés) nem nyit menüt a billentyűkön.
  return (
    <div className="keys" onContextMenu={(event) => event.preventDefault()}>
      {notes.map((note) => {
        let className = note.black ? 'key key--black' : 'key key--white'
        if (active.includes(note.midi)) className += ' is-active'
        return (
          <button
            key={note.midi}
            type="button"
            className={className}
            aria-label={note.name}
            onPointerDown={() => onPress(note)}
            onPointerUp={() => onRelease(note)}
            onPointerLeave={(event) => {
              // Csak akkor, ha lenyomott gombbal csúszott le róla az egér.
              if (event.buttons > 0) onRelease(note)
            }}
          >
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

- Az osztálynév most `let`, mert ha a hang szól, a végére kerül még egy `is-active` is (a `+=` hozzáfűzi; figyelj a
  szóközre az elején). Az `App.css` ettől színezi türkizre a billentyűt.
- A `pointerleave` akkor is jön, ha az egér csak átsuhan egy billentyű fölött. Az `event.buttons` megmondja, hogy közben
  le van-e nyomva valamelyik egérgomb (0, ha egyik sem), így csak akkor hallgattatjuk el a hangot, ha a játékos lenyomott
  gombbal csúszott le a billentyűről.
- Az `onContextMenu` a jobb klikkre (érintőképernyőn a hosszú érintésre) érkezik, ami magától egy menüt nyitna. A
  `preventDefault()` ezt tiltja le, mint a 7. leckében a szóköz görgetését.

Végül az `App`. Az `active` egy tömb, benne a szóló hangok MIDI-számaival:

```jsx file=src/App.jsx mark=1,9-10,12-15,18-22,27
import { useState } from 'react'
import { NOTES } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

function App() {
  const synth = useSynth()
  // Az éppen szóló hangok MIDI-száma: ezek a billentyűk világítanak.
  const [active, setActive] = useState([])

  // Megszólal egy hang, és kigyullad a billentyűje.
  function press(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // Elhallgat egy hang, és kialszik a billentyűje.
  function release(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <PianoKeys notes={NOTES} active={active} onPress={press} onRelease={release} />
    </main>
  )
}

export default App
```

A két `setActive` a [[frissítő függvényt|frissítő függvény]] kapja (7. lecke): a React a mostani tömbbel hívja meg
(`current`), és amit visszaad, az lesz az új állapot. A `press` egy új tömböt ad, a végén az új hanggal (`[...current, note.midi]`), a
`release` egy olyat, amiből a `filter` kihagyta a hangot. Ha viszont nincs mit változtatni (a hang már világít, vagy nem
is világított), mindkettő a régi tömböt adja vissza változatlanul: a React ilyenkor látja, hogy az állapot ugyanaz, és
nem rajzol újra fölöslegesen (a 16. leckében láttad, miért érdemes erre figyelni).

:::check Ellenőrizd
Nyomd le és tartsd lenyomva az egérgombot egy billentyűn: a hang addig szól, amíg el nem engeded, a billentyű pedig
közben türkiz. Felengedésre a hang gyorsan elhalkul, és a billentyű kialszik. Ha lenyomott gombbal lecsúszol a
billentyűről, a hang elhallgat, ha pedig gomb nélkül húzod át az egeret a billentyűzeten, nem szól semmi. Érintőképernyőn
több ujjal akkordot is játszhatsz. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
`const voices = new Map()` a hookban, `useRef` nélkül. A hang megszólal, a billentyű kigyullad, de amikor elengeded,
csak a billentyű alszik ki: a hang a végtelenségig szól (az oldal újratöltése állítja le). A kigyulladó billentyű miatt
az `App` újrarajzolódott, a hook újra lefutott, és egy vadonatúj, üres Map-et készített, amiben a `stop` már nem talál
semmit. Ami egy rajzolásnál tovább kell, és nem látszik a képernyőn, az refbe való.
:::

:::try Próbáld ki
Csúszó játék (glissando): adj a gombnak egy `onPointerEnter={(event) => { if (event.buttons > 0) onPress(note) }}`
propot. Ha most lenyomott egérgombbal végighúzod a mutatót a billentyűkön, mindegyik megszólal, amelyiken áthaladsz.
(Érintőképernyőn ez nem működik: ott az ujj „hozzáragad” az első billentyűhöz.)
:::

## Középszint {level=2}

### A gép billentyűzete is zongora

Egérrel egyszerre legfeljebb egy hangot játszhatsz, a számítógép billentyűzetén viszont akár tízet is. A 7. leckében a
szóközre figyeltél: minden lenyomásra a böngésző egy `keydown` [[billentyűeseményt|billentyűesemény]] küld, és az
`event.code` megmondja, hol van a lenyomott billentyű a billentyűzeten (`'KeyA'`, `'Space'`). Most a felengedésre is
figyelünk: az a `keyup` esemény.

Melyik gép billentyűje melyik hang legyen? A középső betűsor (A S D F G H J K) adja a fehér billentyűket, a fölötte lévő
sor néhány betűje (W E T Z U) a feketéket, pont úgy elrendezve, mint egy zongorán. Az `src/notes.js` végére írd oda ezt
a tömböt; a sorrendje ugyanaz, mint a `NOTES`-é, így az `i`-edik gépi billentyű az `i`-edik hangot szólaltatja meg:

```js file=src/notes.js
// A számítógép billentyűi, sorban a zongora 13 billentyűjéhez. A code a billentyű helye, a label a rajta lévő
// betű: a magyar billentyűzeten a T és az U között Z áll, de a kódja ott is KeyY.
export const COMPUTER_KEYS = [
  { code: 'KeyA', label: 'A' },
  { code: 'KeyW', label: 'W' },
  { code: 'KeyS', label: 'S' },
  { code: 'KeyE', label: 'E' },
  { code: 'KeyD', label: 'D' },
  { code: 'KeyF', label: 'F' },
  { code: 'KeyT', label: 'T' },
  { code: 'KeyG', label: 'G' },
  { code: 'KeyY', label: 'Z' },
  { code: 'KeyH', label: 'H' },
  { code: 'KeyU', label: 'U' },
  { code: 'KeyJ', label: 'J' },
  { code: 'KeyK', label: 'K' },
]
```

Az `event.code` értékeit az angol (QWERTY) billentyűzet betűiről nevezték el. A magyar billentyűzeten a T és az U
között a Z van, de a helye ugyanaz, mint az angolon az Y-é, ezért a kódja `'KeyY'`. Pont ezért jó a `code`: a zongora
minden billentyűzetkiosztáson ugyanott van. A `label` pedig az, ami a magyar billentyűzeten rá van nyomtatva: ezt írjuk
ki a zongora billentyűire. Ha a te billentyűzeteden más betű van ott (egy angolon például Y), írd át a `label`-t.

A felirat egy `<kbd>` elembe kerül, ami a HTML-ben egy billentyűt jelöl. Hogy melyik gépi billentyű tartozik egy
hanghoz, azt a `map` második paramétere, az `index` mondja meg (0-tól számolva hányadik elemnél tartunk). Írd át a
`PianoKeys.jsx`-et:

```jsx file=src/components/PianoKeys.jsx mark=1,7,10,16,24
import { COMPUTER_KEYS } from '../notes.js'

function PianoKeys({ notes, active, onPress, onRelease }) {
  // Az onContextMenu miatt a jobb klikk (és a hosszú érintés) nem nyit menüt a billentyűkön.
  return (
    <div className="keys" onContextMenu={(event) => event.preventDefault()}>
      {notes.map((note, index) => {
        let className = note.black ? 'key key--black' : 'key key--white'
        if (active.includes(note.midi)) className += ' is-active'
        const label = COMPUTER_KEYS[index].label
        return (
          <button
            key={note.midi}
            type="button"
            className={className}
            aria-label={`${note.name}, ${label} billentyű`}
            onPointerDown={() => onPress(note)}
            onPointerUp={() => onRelease(note)}
            onPointerLeave={(event) => {
              // Csak akkor, ha lenyomott gombbal csúszott le róla az egér.
              if (event.buttons > 0) onRelease(note)
            }}
          >
            <kbd className="key__label">{label}</kbd>
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

Most jön a figyelő. Az ablak kívül esik a React világán, ezért egy effekt teszi fel a figyelőket, és a takarító
függvény veszi le őket, ugyanúgy, mint a 7. leckében. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,24-30,32-39,41-44,46-52
import { useEffect, useState } from 'react'
import { COMPUTER_KEYS, NOTES } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

function App() {
  const synth = useSynth()
  // Az éppen szóló hangok MIDI-száma: ezek a billentyűk világítanak.
  const [active, setActive] = useState([])

  // Megszólal egy hang, és kigyullad a billentyűje.
  function press(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // Elhallgat egy hang, és kialszik a billentyűje.
  function release(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  // A gép billentyűzete is zongora: lenyomásra szól a hang, felengedésre elhallgat.
  useEffect(() => {
    // Melyik hang tartozik ehhez a billentyűhöz? Ha egyik sem, undefined.
    function noteFor(event) {
      const index = COMPUTER_KEYS.findIndex((key) => key.code === event.code)
      return index === -1 ? undefined : NOTES[index]
    }

    function handleKeyDown(event) {
      // Nyomva tartásnál ne induljon újra; a Ctrl, Alt és Cmd kombinációk a böngészőéi.
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
      const note = noteFor(event)
      if (note === undefined) return
      event.preventDefault()
      press(note)
    }

    function handleKeyUp(event) {
      const note = noteFor(event)
      if (note !== undefined) release(note)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <PianoKeys notes={NOTES} active={active} onPress={press} onRelease={release} />
    </main>
  )
}

export default App
```

- A `noteFor` a 9. leckéből ismert `findIndex`-szel megkeresi, hányadik a lenyomott billentyű a `COMPUTER_KEYS`-ben.
  Ha egyik sem (`-1`, például a ++Q++ billentyűnél), `undefined`-ot ad, és a kezelők nem csinálnak semmit.
- `event.repeat`: ha nyomva tartasz egy billentyűt, a böngésző másodpercenként sokszor megismétli a `keydown`-t. A hang
  már szól, nem kell újraindítani.
- `event.ctrlKey`, `event.altKey`, `event.metaKey`: igaz, ha közben a ++Ctrl++, az ++Alt++ vagy (Macen) a ++Cmd++ is
  le van nyomva. Ezek a böngésző gyorsbillentyűi (a ++Ctrl++ + ++W++ például bezárja a lapot), azokba nem szólunk bele.
- Az `event.preventDefault()` (7. lecke) megkéri a böngészőt, hogy ezzel a billentyűvel ne csináljon semmi mást. A
  betűknek itt nincs sok dolguk, de ha például egy legördülő menün állna a fókusz, egy betűre a menü egyik sorára
  ugrana.
- A `keyup` kezelőjében nem kell figyelni az ismétlésre: a felengedés egyszer jön.

Az effekt csak egyszer fut le (`[]`), ezért a benne lévő függvények mindvégig az első rajzolás `press`-ét és
`release`-ét hívják: ez a 7. leckéből ismert [[closure]]. Most ez nem baj, mert ezek a függvények csak olyasmit
használnak, ami minden rajzolásban ugyanaz: a hook refjeit és a frissítő függvényes `setActive`-ot. Két lépés múlva,
amikor váltani lehet az oktávot, ez megváltozik.

:::check Ellenőrizd
Kattints egyszer az oldalra, hogy a billentyűleütések ide érkezzenek (ne például a címsorba), aztán nyomd meg az ++A++
billentyűt: megszólal a C, és a billentyűje kigyullad. A ++W++ a Cisz, az ++S++ a D, és így tovább a ++K++-ig, a felső
C-ig. Minden zongorabillentyűn ott a betű, amelyik megszólaltatja. Amíg nyomva tartod a gépi billentyűt, a hang szól; ha egyszerre nyomod le az
++A++-t, a ++D++-t és a ++G++-t, egy C-dúr akkord szól.
:::

:::mistake Gyakori hiba
`event.key === 'a'` az `event.code` helyett. Működni látszik, de ha be van kapcsolva a ++Caps Lock++, vagy nyomva tartod
a ++Shift++-et, az `event.key` értéke `'A'`, és a billentyű néma marad. Más kiosztású billentyűzeteken pedig egészen más
betűk lennének ott. A billentyű helyéhez az `event.code` kell.
:::

:::try Próbáld ki
Játszd el a billentyűzeten: ++D++ ++D++ ++F++ ++G++ ++G++ ++F++ ++D++ ++S++ ++A++ ++A++ ++S++ ++D++ ++D++ ++S++ ++S++.
Ez Beethoven Örömódájának eleje (E E F G G F E D C C D E E D D).
:::

### Hangok képletből

Nézd meg a `NOTES` tömb első és utolsó C-jét: 261,63 és 523,25 Hz. A második pontosan kétszerese az elsőnek. Ez nem
véletlen: egy oktávval feljebb a frekvencia mindig a duplájára nő. Az oktáv 12 félhangra oszlik, és minden félhang
ugyanazzal a számmal szorozza a frekvenciát. Ha a frekvenciát tizenkétszer egymás után megszorozzuk ezzel a számmal,
pont a kétszeresét kapjuk, tehát ez a szám a 2 tizenkettedik gyöke, kb. 1,0595: egy félhanggal feljebb a frekvencia
kb. 6%-kal nagyobb.

Ebből egy képlet adódik. A MIDI-számozásban a 440 Hz-es A a 69-es. Egy tetszőleges `midi` hang ettől `midi - 69`
félhangra van, a frekvenciája tehát `440 * 2 ** ((midi - 69) / 12)`. A `**` a hatványozás: a `2 ** 3` értéke 8, a
`2 ** (1 / 12)` pedig a 2 tizenkettedik gyöke. A képlettel nem kell kézzel beírni a frekvenciákat, és bármelyik oktávot
elő tudjuk állítani. A hang neve, és az is, hogy fekete vagy fehér billentyű, szintén kiszámolható: a 3. leckéből
ismert maradékos osztás, a `midi % 12` megmondja, hányadik félhang az oktávon belül (0 a C, 1 a Cisz, … 11 a H), mert a
minta 12 hangonként ismétlődik.

Cseréld le az `src/notes.js` elejét, a `NOTES` tömböt; a `COMPUTER_KEYS` marad. Itt a teljes fájl:

```js file=src/notes.js mark=1-4,6-14,16-24
// A hangok nevei egy oktávon belül. A magyar zenei nyelvben a fekete B mellett a fehér billentyű a H.
const NAMES = ['C', 'Cisz', 'D', 'Disz', 'E', 'F', 'Fisz', 'G', 'Gisz', 'A', 'B', 'H']
// Az oktáv 12 félhangja közül melyik fekete billentyű.
const BLACK = [false, true, false, true, false, false, true, false, true, false, true, false]

// Egy hang a MIDI-számából. Az A4 (69) 440 Hz, és minden félhang 2 tizenkettedik gyökével szoroz.
export function makeNote(midi) {
  return {
    midi,
    name: NAMES[midi % 12],
    black: BLACK[midi % 12],
    frequency: 440 * 2 ** ((midi - 69) / 12),
  }
}

// Egy oktáv 13 billentyűje: az oktáv C-jétől a következő C-ig. A 4. oktáv C-je a 60-as.
export function makeNotes(octave) {
  const first = (octave + 1) * 12
  const notes = []
  for (let midi = first; midi <= first + 12; midi++) {
    notes.push(makeNote(midi))
  }
  return notes
}

// A számítógép billentyűi, sorban a zongora 13 billentyűjéhez. A code a billentyű helye, a label a rajta lévő
// betű: a magyar billentyűzeten a T és az U között Z áll, de a kódja ott is KeyY.
export const COMPUTER_KEYS = [
  { code: 'KeyA', label: 'A' },
  { code: 'KeyW', label: 'W' },
  { code: 'KeyS', label: 'S' },
  { code: 'KeyE', label: 'E' },
  { code: 'KeyD', label: 'D' },
  { code: 'KeyF', label: 'F' },
  { code: 'KeyT', label: 'T' },
  { code: 'KeyG', label: 'G' },
  { code: 'KeyY', label: 'Z' },
  { code: 'KeyH', label: 'H' },
  { code: 'KeyU', label: 'U' },
  { code: 'KeyJ', label: 'J' },
  { code: 'KeyK', label: 'K' },
]
```

- A `makeNote` egyetlen hangot készít a MIDI-számából: ugyanolyan objektumot, mint amilyenek eddig a tömbben álltak. A
  `{ midi, … }` rövidítés: ha a mező neve és a változó neve ugyanaz, elég egyszer leírni (`midi: midi` helyett).
- A `NAMES` és a `BLACK` csak ebben a fájlban kell, ezért nem exportáljuk őket.
- A `makeNotes` egy egész oktávot készít, C-től a következő C-ig. A MIDI-számozás a -1. oktávval kezdődik (annak a C-je
  a 0), ezért az oktáv C-je `(octave + 1) * 12`: a 4. oktávé 5 × 12 = 60, a középső C. A `for` ciklus innen 12
  félhanggal feljebbig megy, és minden számból egy hangot tesz a tömbbe. A nemzetközi jelölés ezért hívja a középső
  C-t C4-nek, a 440 Hz-es A-t A4-nek: a betű a hang, a szám az oktáv (a magyar zeneórán ez az egyvonalas c és a).

A régi `NOTES` tömb eltűnt, ezért az `App`-ban a képlettel készítjük el. Cseréld le az `src/App.jsx` elejét, az
importokat; a `function App()` sortól lefelé minden marad:

```jsx file=src/App.jsx mark=2,7-8
import { useEffect, useState } from 'react'
import { COMPUTER_KEYS, makeNotes } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

// A 4. oktáv 13 billentyűje, most már képletből.
const NOTES = makeNotes(4)
```

:::check Ellenőrizd
Minden pontosan úgy néz ki és úgy szól, mint eddig: a képlet ugyanazokat a hangokat adja, mint a kézzel írt tömb. Írd
be a böngésző konzoljába (++F12++ → Console): `440 * 2 ** ((60 - 69) / 12)`. Az eredmény a konzolban `261.6255…` (a
JavaScript tizedesponttal írja), ez a középső C.
:::

:::mistake Gyakori hiba
`440 * 2 ** (midi - 69) / 12`, a külső zárójel nélkül. A műveleti sorrendben a hatványozás megelőzi az osztást, így ez
a 2 hatványát osztja 12-vel, nem a kitevőt. A középső C így 0,07 Hz lenne: tizennégy másodpercenként egyetlen rezgés,
amit a fül nem hall, ezért a billentyűk némák maradnak.
:::

:::try Próbáld ki
Írd át a `makeNotes(4)`-et `makeNotes(3)`-ra, aztán `makeNotes(5)`-re: a billentyűzet ugyanaz marad, de egy oktávval
mélyebben, illetve magasabban szól. Utána állítsd vissza 4-re: a következő lépésben ez gombbal is menni fog.
:::

### Oktávváltás

Egy oktáv kevés: egy igazi zongorának több mint hét van. A képernyőn továbbra is 13 billentyű marad (így telefonon is
elfér), de gombokkal váltani lehet majd, melyik oktáv látszik és szól. Az oktáv a felhasználó választása, tehát állapot. A
billentyűk viszont nem azok: minden rajzoláskor kiszámoljuk őket az oktávból (`makeNotes(octave)`), ahogy a 3. leckében
az erősségjelzőt. Ez egy [[származtatott érték]].

A kapcsoló saját komponens lesz. Hozd létre az `src/components/OctaveSwitch.jsx` fájlt:

```jsx file=src/components/OctaveSwitch.jsx
function OctaveSwitch({ octave, min, max, onChange }) {
  return (
    <div className="octave" role="group" aria-label="Oktáv">
      <span className="octave__title">Oktáv</span>
      <div className="octave__controls">
        <button
          type="button"
          className="octave__button"
          aria-label="Mélyebb oktáv"
          disabled={octave === min}
          onClick={() => onChange(octave - 1)}
        >
          −
        </button>
        <strong className="octave__value" aria-live="polite">
          {octave}
        </strong>
        <button
          type="button"
          className="octave__button"
          aria-label="Magasabb oktáv"
          disabled={octave === max}
          onClick={() => onChange(octave + 1)}
        >
          +
        </button>
      </div>
      <span className="octave__hint">Billentyűzeten: Y és X</span>
    </div>
  )
}

export default OctaveSwitch
```

A „−” gomb mélyebb, a „+” magasabb oktávra vált; a határon a `disabled` letiltja őket. Mivel a gombokon csak egy jel
áll, az `aria-label` mondja meg a képernyőolvasónak, mit csinálnak, az `aria-live="polite"` pedig felolvassa az új
oktávot, amikor megváltozik. Az alsó sor a billentyűzetes gyorsbillentyűket ígéri, ezeket a következő lépésben kötjük
be.

Az `App`-ban a `NOTES` helyére az `octave` állapot és az ebből számolt `notes` kerül. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=5,8-9,15-17,31-34,41,69-72
import { useEffect, useState } from 'react'
import { COMPUTER_KEYS, makeNotes } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import OctaveSwitch from './components/OctaveSwitch.jsx'
import './App.css'

const LOWEST_OCTAVE = 2
const HIGHEST_OCTAVE = 6

function App() {
  const synth = useSynth()
  // Az éppen szóló hangok MIDI-száma: ezek a billentyűk világítanak.
  const [active, setActive] = useState([])
  const [octave, setOctave] = useState(4)
  // A képernyőn lévő 13 billentyű: minden rajzoláskor az oktávból számoljuk.
  const notes = makeNotes(octave)

  // Megszólal egy hang, és kigyullad a billentyűje.
  function press(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // Elhallgat egy hang, és kialszik a billentyűje.
  function release(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  function changeOctave(value) {
    // Math.max és Math.min: az oktáv nem lépheti át a határokat.
    setOctave(Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, value)))
  }

  // A gép billentyűzete is zongora: lenyomásra szól a hang, felengedésre elhallgat.
  useEffect(() => {
    // Melyik hang tartozik ehhez a billentyűhöz? Ha egyik sem, undefined.
    function noteFor(event) {
      const index = COMPUTER_KEYS.findIndex((key) => key.code === event.code)
      return index === -1 ? undefined : notes[index]
    }

    function handleKeyDown(event) {
      // Nyomva tartásnál ne induljon újra; a Ctrl, Alt és Cmd kombinációk a böngészőéi.
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
      const note = noteFor(event)
      if (note === undefined) return
      event.preventDefault()
      press(note)
    }

    function handleKeyUp(event) {
      const note = noteFor(event)
      if (note !== undefined) release(note)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <div className="controls">
        <OctaveSwitch octave={octave} min={LOWEST_OCTAVE} max={HIGHEST_OCTAVE} onChange={changeOctave} />
      </div>
      <PianoKeys notes={notes} active={active} onPress={press} onRelease={release} />
    </main>
  )
}

export default App
```

A `changeOctave` a [[Math.min]] és a [[Math.max]] segítségével a határok közé szorítja az oktávot: a
`Math.max(LOWEST_OCTAVE, value)` a kettő közül a nagyobbat adja, így 2 alá nem mehet, a `Math.min(HIGHEST_OCTAVE, …)` a
kisebbet, így 6 fölé sem. A gombok ugyan letiltják magukat a határon, de a billentyűzetről érkező váltásnál ez a
védelem kell majd.

Próbáld ki egérrel: a „+” után a billentyűk egy oktávval magasabban szólnak. Aztán nyomd meg a gépen az ++A++-t: ugyanaz
a mély C szól, mint az előbb! Az effekt csak egyszer, az első rajzolás után futott le, és a `handleKeyDown` azóta is az
akkori `notes` tömböt látja, a 4. oktávét: ez a closure, ami a 7. lecke szóközénél is csapda volt. Ott a frissítő
függvény segített, de itt nem egy állapotot kell frissíteni, hanem a mostani billentyűkből kell kiválasztani egyet.

Megoldhatnánk úgy is, hogy az effekt függőségi tömbjébe beírjuk a `notes`-t. Csakhogy a `makeNotes` minden rajzoláskor
új tömböt ad, így a React minden rajzolás után levenné és újra feltenné a figyelőket, minden egyes leütésnél. Működne,
de fölösleges munka, és könnyű elrontani. A jobb megoldás a következő lépés.

:::check Ellenőrizd
Kattints a „+” gombra: a szám 5 lesz, és az egér egy oktávval magasabban játszik; a 6.-nál a „+”, a 2.-nál a „−”
elszürkül. A gépi billentyűk még mindig a 4. oktávot szólaltatják meg: ezt a következő lépés javítja.
:::

:::mistake Gyakori hiba
A billentyűket is állapotba tenni: `const [notes, setNotes] = useState(makeNotes(4))`. Ekkor minden oktávváltásnál
két állapotot kellene együtt frissíteni, és ha az egyik kimarad, a képernyő az egyik oktávot mutatja, a hang a
másikból szól. Ami kiszámolható az állapotból, azt számold ki minden rajzoláskor, ne tárold.
:::

:::try Próbáld ki
Írd ki a kapcsolón a látható hangtartományt is, például „C4–C5”: az `OctaveSwitch`-ben az oktáv száma mellé írd oda:
`C{octave}–C{octave + 1}`.
:::

### Mindig a legutóbbi rajzolás: useEffectEvent

A gépi billentyűk a 4. oktávba ragadtak, mert az effekt függvényei az első rajzolást látják. Erre a helyzetre a React
19.2 óta saját eszköz van: az [[Effect Event]], amit a `useEffectEvent` hook készít. Egy
függvényt csomagol be, amit egy effekt használ, és két dolgot ígér: amikor meghívják, mindig a **legutóbbi** rajzolás
változóit látja (a mostani `notes`-t, `octave`-ot, `press`-t), és mégsem kell beírni a függőségi tömbbe, így az effekt
egyszer futhat le. Belül olyan, mint egy ref, amibe a React minden rajzolás után beteszi a függvény legfrissebb
változatát. Két szabálya van: csak effektből (és az effekt által feltett figyelőkből) hívd, és ne add tovább propként
más komponenseknek.

Írd át az első sort, hogy a `useEffectEvent`-et is importáld:
`import { useEffect, useEffectEvent, useState } from 'react'`. Aztán cseréld le a teljes `useEffect` blokkot (az „A gép
billentyűzete is zongora” kezdetű megjegyzéstől a `}, [])` sorig) erre:

```jsx file=src/App.jsx mark=2-4,8,11-20,26-27,31-32
  // Melyik hang tartozik ehhez a gépi billentyűhöz? Ha egyik sem, undefined.
  function noteFor(code) {
    const index = COMPUTER_KEYS.findIndex((key) => key.code === code)
    return index === -1 ? undefined : notes[index]
  }

  // A gép billentyűzete is zongora. Az Effect Event mindig a legutóbbi rajzolás változóit látja.
  const handleKeyDown = useEffectEvent((event) => {
    // Nyomva tartásnál ne induljon újra; a Ctrl, Alt és Cmd kombinációk a böngészőéi.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Y és X (a kódjuk KeyZ és KeyX): oktávváltás.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    const note = noteFor(event.code)
    if (note !== undefined) release(note)
  })

  // A figyelőket egyszer tesszük fel, és a takarítás veszi le őket.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
```

- A `noteFor` kikerült az effektből a komponensbe, és mostantól csak a billentyű kódját kapja. Minden rajzolásnál újra
  létrejön, a mostani `notes`-szal.
- A `handleKeyDown` és a `handleKeyUp` most `useEffectEvent`-be csomagolt függvény. Az effekt csak feltesz és levesz,
  a munkát ezek végzik, mindig a friss adatokkal.
- Két új billentyű is van: a ++Y++ lejjebb, az ++X++ feljebb vált. A kódjuk `'KeyZ'` és `'KeyX'`, mert a magyar
  billentyűzeten az Y ott van, ahol az angolon a Z (fordítva, mint az előbb a Z-nél). Ezek az `octave`-ot olvassák:
  Effect Event nélkül ez is az első rajzolásé lenne, és az ++X++ mindig csak az 5. oktávig vinne.

:::check Ellenőrizd
Kattints a „+” gombra: az 5. oktáv látszik, és egérrel is, az ++A++ billentyűvel is a magasabb C szól. Az ++X++
feljebb, az ++Y++ lejjebb vált. A 6. oktávnál a „+”, a 2.-nál a „−” elszürkül, és a billentyűzettel sem lehet
továbbmenni. A hangok neve és a betűk minden oktávban ugyanott vannak.
:::

:::mistake Gyakori hiba
Csak a `handleKeyUp`-ot csomagolod `useEffectEvent`-be, a `handleKeyDown` sima `function` marad a komponensben, az
effekt pedig továbbra is `[]`. Az effekt így az első rajzolás `handleKeyDown`-ját teszi fel: az ++X++ mindig csak az
5. oktávig visz, az ++A++ a 4. oktáv C-jét szólaltatja meg, és egy ++X++ után a hangja el sem hallgat, mert a
felengedés már az 5. oktávban keresi. Minden függvény, amit az egyszer lefutó effekt az ablaknak átad, legyen Effect
Event.
:::

:::try Próbáld ki
Írd a `handleKeyDown` első sorába: `console.log(octave)`, és nyomd meg néhányszor az ++X++-et. A konzolban mindig az
éppen látható oktáv jelenik meg (a 4.-ről indulva 4, 5, 6, 6), pedig az effekt csak egyszer futott le: ez a
legutóbbi rajzolás `octave`-ja. Aztán töröld a sort.
:::

### Beragadt hangok

Próbáld ki: tartsd nyomva az ++A++-t, közben nyomd meg az ++X++-et, aztán engedd fel az ++A++-t. A mély C tovább szól,
örökre! A felengedéskor a `noteFor` már az új oktávból keresi ki a hangot, és az 5. oktáv C-jét hallgattatja el, ami nem
is szólt. Ugyanez történik, ha egy hang szól, és közben ++Alt++ + ++Tab++-bal átváltasz egy másik ablakra: a felengedés
akkor már a másik ablakhoz megy, a mi oldalunk nem is hallja.

Az első gondra egy újabb ref a megoldás: lenyomáskor megjegyezzük, melyik gépi billentyű melyik hangot indította el, és
felengedéskor azt hallgattatjuk el, akármi történt közben. A második gondra az ablak `blur` eseménye: akkor jön, amikor
az ablak elveszti a fókuszt. Ilyenkor minden hangot leállítunk.

Ehhez a hooknak kell egy `stopAll` függvény. A halkítást egy közös `fadeOut` függvénybe tesszük, mert most már két
helyen kell. Itt a teljes `src/useSynth.js`:

```js file=src/useSynth.js mark=39-44,46,51,54-58,69
import { useEffect, useRef } from 'react'

function useSynth() {
  // A hangstúdió (AudioContext). Az első billentyűleütéskor jön létre, utána mindig ugyanazt használjuk.
  const contextRef = useRef(null)
  // Az éppen szóló hangok: MIDI-szám → { oscillator, gain }. Ebből tudjuk, mit kell elhallgattatni.
  const voicesRef = useRef(new Map())

  function getContext() {
    if (contextRef.current === null) {
      contextRef.current = new AudioContext()
    }
    // Ha a böngésző szüneteltette a stúdiót, újraindítjuk.
    if (contextRef.current.state === 'suspended') contextRef.current.resume()
    return contextRef.current
  }

  // Megszólal egy hang, és szól, amíg a stop el nem hallgattatja.
  function start(note) {
    const context = getContext()
    stop(note) // ha ez a hang még szól, előbb elhallgattatjuk
    const now = context.currentTime

    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = note.frequency

    // Gyors, de nem kattanó felfutás: 0-ról indul, és néhány ezredmásodperc alatt eléri a 0,3-at.
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.setTargetAtTime(0.3, now, 0.005)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    voicesRef.current.set(note.midi, { oscillator, gain })
  }

  // Egy szóló hang rövid halkulással elhallgat.
  function fadeOut(voice) {
    const now = contextRef.current.currentTime
    voice.gain.gain.setTargetAtTime(0, now, 0.08)
    voice.oscillator.stop(now + 0.5)
  }

  // Egy hang elhallgat, ha éppen szól.
  function stop(note) {
    const voice = voicesRef.current.get(note.midi)
    if (voice === undefined) return
    voicesRef.current.delete(note.midi)
    fadeOut(voice)
  }

  // Minden hang elhallgat (például ha az ablak elveszti a fókuszt).
  function stopAll() {
    voicesRef.current.forEach((voice) => fadeOut(voice))
    voicesRef.current.clear()
  }

  // Ha a komponens eltűnik, a stúdiót is bezárjuk.
  useEffect(() => {
    return () => {
      voicesRef.current.clear()
      if (contextRef.current !== null) contextRef.current.close()
      contextRef.current = null
    }
  }, [])

  return { start, stop, stopAll }
}

export default useSynth
```

A `stopAll` a Map `forEach`-ével minden szóló hangot elhalkít, aztán a `clear()` kiüríti a Map-et.

Az `App`-ban az első sorba a `useRef` is bekerül: `import { useEffect, useEffectEvent, useRef, useState } from 'react'`.
A `notes` sora alá jön a ref:

```jsx file=src/App.jsx mark=2-3
  const notes = makeNotes(octave)
  // Melyik gépi billentyű melyik hangot indította el (event.code → hang).
  const heldRef = useRef(new Map())
```

A `noteFor` függvény után pedig cseréld le a kezelőket és az effektet, az „A gép billentyűzete is zongora” kezdetű
megjegyzéstől a `}, [])` sorig:

```jsx file=src/App.jsx mark=17,22-26,29-34,40,44
  // A gép billentyűzete is zongora. Az Effect Event mindig a legutóbbi rajzolás változóit látja.
  const handleKeyDown = useEffectEvent((event) => {
    // Nyomva tartásnál ne induljon újra; a Ctrl, Alt és Cmd kombinációk a böngészőéi.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Y és X (a kódjuk KeyZ és KeyX): oktávváltás.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    heldRef.current.set(event.code, note) // megjegyezzük, melyik hangot indította
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    // Azt a hangot állítjuk le, amelyiket ez a billentyű indította, akkor is, ha közben oktávot váltottunk.
    const note = heldRef.current.get(event.code)
    if (note === undefined) return
    heldRef.current.delete(event.code)
    release(note)
  })

  // Ha az ablak elveszti a fókuszt (például Alt+Tab), a felengedést már nem látjuk: minden hang elhallgat.
  const handleBlur = useEffectEvent(() => {
    heldRef.current.clear()
    synth.stopAll()
    setActive([])
  })

  // A figyelőket egyszer tesszük fel, és a takarítás veszi le őket.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])
```

- Lenyomáskor a `heldRef` Map-jébe a billentyű kódja alá bekerül a hang, amit elindított.
- Felengedéskor a `handleKeyUp` már nem számol, hanem kikeresi a Map-ből, amit ez a billentyű indított. Ha nincs ott
  semmi (például mert közben a `handleBlur` mindent leállított), nincs dolga.
- A `handleBlur` kiüríti a Map-et, elhallgattat minden hangot, és minden billentyűt elsötétít.

Miért ref, és nem állapot? A `heldRef` tartalmát semmi nem rajzolja ki, csak a kezelők olvassák, és mindig a
legfrissebb tartalmára van szükségük, akkor is, ha két billentyűesemény gyorsabban jön egymás után, mint ahogy a React
újrarajzolna.

Az egérrel ugyanígy beragadhat egy hang (tarts nyomva egy zongorabillentyűt az egérrel, és nyomd meg az ++X++-et); ott
egyelőre csak az ablakváltás segít: a lenti feladat ezt is megoldja.

:::check Ellenőrizd
Tartsd nyomva az ++A++-t, nyomd meg az ++X++-et, aztán engedd fel az ++A++-t: a mély C elhallgat. Sőt, amíg az ++A++
szól, a magasabb oktávban dallamot is játszhatsz fölötte. Tarts nyomva két billentyűt, és válts át egy másik ablakra
(++Alt++ + ++Tab++): a hangok elhallgatnak, és a billentyűk kialszanak.
:::

:::mistake Gyakori hiba
A `stopAll`-ban a `clear()` a `forEach` elé kerül. Ekkor a Map már üres, mire végigmennénk rajta: a billentyűk
kialszanak, de a hangok tovább szólnak, és már semmi nem tudja leállítani őket.
:::

:::try Feladat
Az egérnek is ugyanez a baja: tarts nyomva egy zongorabillentyűt az egérrel, nyomd meg az ++X++-et, és engedd fel.
Javítsd ki úgy, mint a gépi billentyűknél: a `PianoKeys` az `event.pointerId`-t is adja át
(`onPress(note, event.pointerId)`, `onRelease(note, event.pointerId)`), az `App` pedig egy `pointersRef` Map-ben
jegyezze meg, melyik mutató melyik hangot indította (mutató → hang), és felengedéskor azt olvassa ki, ne a kapott
hangot.
:::

### Hangszínek

Ugyanazon a frekvencián egy fuvola és egy hegedű egészen másként szól. A különbség a rezgés alakjában, a
[[hullámformában|hullámforma]] van. Egy igazi hangszer hangjában az alaphang (a megszólaltatott frekvencia) mellett
ott vannak a többszörösei is, a [[felhangok|felhang]], és a hullámforma dönti el, melyik felhang mennyire erős. Az oszcillátor négyféle alakot
ismer:

- `sine` (szinusz): tiszta, lágy, felhangok nélkül, mint egy fuvola vagy egy fütty.
- `triangle` (háromszög): kevés, halk felhanggal, kerek; eddig ezt hallottad.
- `square` (négyszög): üreges, „berregő” hang, mint egy orgona vagy egy régi játékgép.
- `sawtooth` (fűrészfog): az összes felhanggal, fényes és éles, mint egy szintetizátor.

Minden hangszín egy kis objektum lesz egy tömbben, a felület pedig ebből készül, mint a billentyűk. Hozd létre az
`src/instruments.js` fájlt:

```js file=src/instruments.js
// A hangszínek. Mindegyik egy oszcillátor-hullámforma: más alakú rezgés, más hangzás.
export const INSTRUMENTS = [
  { id: 'piano', label: 'Zongora', wave: 'triangle' },
  { id: 'organ', label: 'Orgona', wave: 'square' },
  { id: 'synth', label: 'Szinti', wave: 'sawtooth' },
  { id: 'flute', label: 'Fuvola', wave: 'sine' },
]
```

A választáshoz rádiógombokat használunk, mint a 3. lecke jelszófajtáinál: az azonos `name`-mel ellátott rádiógombokból
egyszerre egy lehet kiválasztva, és a nyílbillentyűkkel lehet lépkedni köztük. A CSS a rádiógombot elrejti, és a
mellette lévő feliratot rajzolja „gombnak”. Hozd létre az `src/components/InstrumentPicker.jsx` fájlt:

```jsx file=src/components/InstrumentPicker.jsx
import { INSTRUMENTS } from '../instruments.js'

function InstrumentPicker({ value, onChange }) {
  return (
    <fieldset className="sound">
      <legend>Hangszín</legend>
      <div className="sound__options">
        {INSTRUMENTS.map((item) => (
          <label key={item.id} className="sound__option">
            <input
              type="radio"
              name="instrument"
              value={item.id}
              checked={item.id === value}
              onChange={() => onChange(item.id)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default InstrumentPicker
```

A `<fieldset>` és a `<legend>` a 3. leckéből ismerős: egy címmel ellátott csoportba foglalja a rádiógombokat, és a
képernyőolvasó minden gombnál elmondja a csoport nevét is.

A hook paraméterként kapja meg a hangszínt. Az `src/useSynth.js`-ben két sort írj át. A `function useSynth() {` sorból
ez lesz:

```js file=src/useSynth.js
function useSynth(instrument) {
```

és a `start` függvényben a hullámformát, a `'triangle'` helyére:

```js file=src/useSynth.js
    oscillator.type = instrument.wave
```

Az `App` állapotban tartja, melyik hangszín van kiválasztva, és átadja a hooknak. Itt a középszint végén a teljes
`src/App.jsx`:

```jsx file=src/App.jsx mark=3,7,14-17,100
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { COMPUTER_KEYS, makeNotes } from './notes.js'
import { INSTRUMENTS } from './instruments.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import OctaveSwitch from './components/OctaveSwitch.jsx'
import InstrumentPicker from './components/InstrumentPicker.jsx'
import './App.css'

const LOWEST_OCTAVE = 2
const HIGHEST_OCTAVE = 6

function App() {
  const [instrumentId, setInstrumentId] = useState('piano')
  // A kiválasztott hangszín adatai az azonosítója alapján.
  const instrument = INSTRUMENTS.find((item) => item.id === instrumentId)
  const synth = useSynth(instrument)
  // Az éppen szóló hangok MIDI-száma: ezek a billentyűk világítanak.
  const [active, setActive] = useState([])
  const [octave, setOctave] = useState(4)
  // A képernyőn lévő 13 billentyű: minden rajzoláskor az oktávból számoljuk.
  const notes = makeNotes(octave)
  // Melyik gépi billentyű melyik hangot indította el (event.code → hang).
  const heldRef = useRef(new Map())

  // Megszólal egy hang, és kigyullad a billentyűje.
  function press(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // Elhallgat egy hang, és kialszik a billentyűje.
  function release(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  function changeOctave(value) {
    // Math.max és Math.min: az oktáv nem lépheti át a határokat.
    setOctave(Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, value)))
  }

  // Melyik hang tartozik ehhez a gépi billentyűhöz? Ha egyik sem, undefined.
  function noteFor(code) {
    const index = COMPUTER_KEYS.findIndex((key) => key.code === code)
    return index === -1 ? undefined : notes[index]
  }

  // A gép billentyűzete is zongora. Az Effect Event mindig a legutóbbi rajzolás változóit látja.
  const handleKeyDown = useEffectEvent((event) => {
    // Nyomva tartásnál ne induljon újra; a Ctrl, Alt és Cmd kombinációk a böngészőéi.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Y és X (a kódjuk KeyZ és KeyX): oktávváltás.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    heldRef.current.set(event.code, note) // megjegyezzük, melyik hangot indította
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    // Azt a hangot állítjuk le, amelyiket ez a billentyű indította, akkor is, ha közben oktávot váltottunk.
    const note = heldRef.current.get(event.code)
    if (note === undefined) return
    heldRef.current.delete(event.code)
    release(note)
  })

  // Ha az ablak elveszti a fókuszt (például Alt+Tab), a felengedést már nem látjuk: minden hang elhallgat.
  const handleBlur = useEffectEvent(() => {
    heldRef.current.clear()
    synth.stopAll()
    setActive([])
  })

  // A figyelőket egyszer tesszük fel, és a takarítás veszi le őket.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <div className="controls">
        <InstrumentPicker value={instrumentId} onChange={setInstrumentId} />
        <OctaveSwitch octave={octave} min={LOWEST_OCTAVE} max={HIGHEST_OCTAVE} onChange={changeOctave} />
      </div>
      <PianoKeys notes={notes} active={active} onPress={press} onRelease={release} />
    </main>
  )
}

export default App
```

Az állapotban csak a hangszín azonosítója van (`'piano'`), mert a rádiógombok is ezzel dolgoznak; a hozzá tartozó
objektumot a `find` keresi ki minden rajzoláskor. A hook így mindig a mostani hangszínt kapja. Hogy a billentyűzetről
indított hangok is ezt használják, azt az Effect Event biztosítja: a `handleKeyDown` mindig a legutóbbi rajzolás
`press`-ét hívja, az pedig a legutóbbi `synth`-et.

:::check Ellenőrizd
A billentyűk fölött négy hangszín: Zongora, Orgona, Szinti, Fuvola; a Zongora van kiválasztva. Válaszd az Orgonát, és
játssz: berregőbb, üregesebb hang szól. A Szinti a legélesebb, a Fuvola a leglágyabb. A gépi billentyűkkel és az
egérrel játszott hangok is az új hangszínnel szólnak. Ha egy hang szól, miközben hangszínt váltasz, az még a régivel
szól végig, a következő már az újjal. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Kimarad a hangszín átadása: `useSynth()` a `useSynth(instrument)` helyett. A billentyűk némák maradnak, a konzolban
pedig minden leütésnél ez áll: „Cannot read properties of undefined (reading 'wave')”. A hookban az `instrument`
paraméter értéke ilyenkor `undefined`.
:::

:::try Próbáld ki
Írd el szándékosan egy hullámforma nevét, például `'sqare'`. A böngésző nem fogadja el: a konzolban figyelmeztetés
jelenik meg, hogy ez nem érvényes `OscillatorType`, és az oszcillátor az alapértelmezett szinusz alakkal szól. Aztán
javítsd ki.
:::

## Haladó szint {level=3}

### Hangszintézis: burkológörbe és szűrő

A hangszínek most csak a hullámformában különböznek, pedig egy igazi zongora attól is zongora, ahogyan a hangja
időben változik: a leütés pillanatában a leghangosabb, aztán lassan elhal, akkor is, ha nyomva tartod a billentyűt. Egy
orgona addig szól egyenletesen, amíg nyomod, a fuvola hangja pedig lágyan, egy kis késéssel indul. A hangerő időbeli
alakja a [[burkológörbe]], és a szintetizátorok négy számmal írják le ([[ADSR]]):

- **Attack** (felfutás): hány másodperc alatt éri el a hang a csúcsot a leütés után.
- **Decay** (lecsengés): mennyi idő alatt esik vissza a csúcsról a kitartott szintre.
- **Sustain** (kitartás): milyen hangosan szól tovább, amíg nyomva tartod, a csúcs arányában (0 és 1 között). A
  zongoráé 0: a hang magától elhal.
- **Release** (elengedés): mennyi idő alatt halkul el a felengedés után.

A második eszköz egy [[aluláteresztő szűrő]] (low-pass filter), a Web Audio `BiquadFilterNode`-ja. A megadott
frekvencia alatti részt átengedi, a fölöttit letompítja: a négyszög és a fűrészfog éles, csípős felhangjai így
kellemesebbek lesznek. A szinuszon nem változtat semmit, mert annak nincsenek felhangjai.

A harmadik egy [[kompresszor]] (`DynamicsCompressorNode`). Ha egyszerre öt hang szól, a hangerejük összeadódik, és
túllépheti a hangkártya határát: ilyenkor a hang recseg (ezt hívják [[túlvezérlésnek|túlvezérlés]]). A kompresszor a túl hangos
pillanatokat lehalkítja. Ebből egy kell az egész stúdióba, a közös kimenetre, ezért a hook egy újabb refben tartja.

A hangszínek új mezőket kapnak. Cseréld le az `src/instruments.js`-t:

```js file=src/instruments.js mark=1-2,4-7
// A hangszínek: hullámforma, burkológörbe és szűrő. Az attack, a decay és a release másodpercben van,
// a sustain a csúcshangerő hányada (0 és 1 között), a filter hertzben.
export const INSTRUMENTS = [
  { id: 'piano', label: 'Zongora', wave: 'triangle', attack: 0.005, decay: 1.2, sustain: 0, release: 0.3, filter: 3500 },
  { id: 'organ', label: 'Orgona', wave: 'square', attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.08, filter: 1500 },
  { id: 'synth', label: 'Szinti', wave: 'sawtooth', attack: 0.01, decay: 0.4, sustain: 0.5, release: 0.4, filter: 2500 },
  { id: 'flute', label: 'Fuvola', wave: 'sine', attack: 0.1, decay: 0.2, sustain: 0.85, release: 0.25, filter: 6000 },
]
```

A hook pedig felhasználja őket. Itt a teljes `src/useSynth.js`:

```js file=src/useSynth.js mark=3-4,9-11,16-21,38-41,43,46-47,49-52,54,57-58,60-62,65,70,73,75
import { useEffect, useRef } from 'react'

// Egy hang legnagyobb hangereje. Egy akkordban több hang adódik össze: azt a kompresszor fogja meg.
const PEAK = 0.3

function useSynth(instrument) {
  // A hangstúdió (AudioContext). Az első billentyűleütéskor jön létre, utána mindig ugyanazt használjuk.
  const contextRef = useRef(null)
  // A közös kimenet: ide fut be minden hang, innen megy a hangszóróba.
  const outputRef = useRef(null)
  // Az éppen szóló hangok: MIDI-szám → { oscillator, gain, release }.
  const voicesRef = useRef(new Map())

  function getContext() {
    if (contextRef.current === null) {
      const context = new AudioContext()
      // A kompresszor lehalkítja a túl hangos pillanatokat, így egy akkord sem recseg.
      const compressor = context.createDynamicsCompressor()
      compressor.connect(context.destination)
      contextRef.current = context
      outputRef.current = compressor
    }
    // Ha a böngésző szüneteltette a stúdiót, újraindítjuk.
    if (contextRef.current.state === 'suspended') contextRef.current.resume()
    return contextRef.current
  }

  // Megszólal egy hang, és szól, amíg a stop el nem hallgattatja.
  function start(note) {
    const context = getContext()
    stop(note) // ha ez a hang még szól, előbb elhallgattatjuk
    const now = context.currentTime

    const oscillator = context.createOscillator()
    oscillator.type = instrument.wave
    oscillator.frequency.value = note.frequency

    // Aluláteresztő szűrő: a mély részt átengedi, a csípős magas felhangokat letompítja.
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = instrument.filter

    // Burkológörbe: felfutás (attack) a csúcsig, aztán lecsengés (decay) a kitartott szintre (sustain).
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.setTargetAtTime(PEAK, now, instrument.attack / 3)
    gain.gain.setTargetAtTime(PEAK * instrument.sustain, now + instrument.attack, instrument.decay / 3)

    // Oszcillátor → szűrő → hangerő → kompresszor → hangszóró
    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(outputRef.current)
    oscillator.start(now)
    voicesRef.current.set(note.midi, { oscillator, gain, release: instrument.release })
  }

  // Elengedés (release): a még el sem kezdett lecsengést töröljük, és onnan halkítunk, ahol a hangerő most tart.
  function fadeOut(voice, seconds) {
    const now = contextRef.current.currentTime
    voice.gain.gain.cancelScheduledValues(now)
    voice.gain.gain.setTargetAtTime(0, now, seconds / 3)
    voice.oscillator.stop(now + seconds * 2)
  }

  // Egy hang elhallgat, ha éppen szól, a hangszín saját elengedési idejével.
  function stop(note) {
    const voice = voicesRef.current.get(note.midi)
    if (voice === undefined) return
    voicesRef.current.delete(note.midi)
    fadeOut(voice, voice.release)
  }

  // Minden hang gyorsan elhallgat (például ha az ablak elveszti a fókuszt).
  function stopAll() {
    voicesRef.current.forEach((voice) => fadeOut(voice, 0.05))
    voicesRef.current.clear()
  }

  // Ha a komponens eltűnik, a stúdiót is bezárjuk.
  useEffect(() => {
    return () => {
      voicesRef.current.clear()
      if (contextRef.current !== null) contextRef.current.close()
      contextRef.current = null
    }
  }, [])

  return { start, stop, stopAll }
}

export default useSynth
```

Sorról sorra az újdonságok:

- A `getContext` a stúdióval együtt a kompresszort is elkészíti, és beköti a hangszóróba. Az `outputRef` őrzi: minden
  hang ide fut be a `destination` helyett.
- A hanggráf egy taggal hosszabb: oszcillátor → szűrő → hangerő → kompresszor. A szűrő `frequency` beállítása a vágási
  pont, a hangszín `filter` mezője.
- A burkológörbe első két része a leütéskor egyszerre programozódik be, két `setTargetAtTime`-mal. Az első most indul,
  és a csúcs (`PEAK`) felé visz, a második `attack` másodperc múlva kezdődik, és a kitartott szint
  (`PEAK * instrument.sustain`) felé. A kezdő szintről ismerős „hűlő tea” az időállandó háromszorosa alatt jut el kb.
  95%-ig, ezért adunk meg `attack / 3`-at és `decay / 3`-at: így a felfutás nagyjából `attack`, a lecsengés `decay`
  másodperc alatt ér célba.
- Az elengedés a `fadeOut` dolga. Ha a játékos még a felfutás közben engedi fel a billentyűt, a lecsengés még a jövőre
  van beprogramozva: a hang elhalkulna, aztán a lecsengés kezdetekor visszajönne a kitartott szintre. A
  `cancelScheduledValues(now)` törli a mostantól hátralévő változásokat. Ami már elkezdődött, az marad, így a halkulás
  onnan indul, ahol a hangerő éppen tart, és `seconds` másodperc alatt ér el a csendig.
- A `voicesRef` a hang elengedési idejét is megjegyzi (`release`): ha közben hangszínt váltasz, a szóló hang a sajátjával
  halkul el. A `stopAll` viszont mindent 0,05 másodperc alatt elhallgattat.

:::check Ellenőrizd
Zongora: tarts nyomva egy billentyűt; a hang erősen indul, és körülbelül egy másodperc alatt magától elhal, akkor is,
ha nem engeded fel. Orgona: egyenletesen szól, amíg nyomod, és felengedésre szinte azonnal elhallgat. Fuvola: lágyan,
egy pillanatnyi késéssel indul. A Szinti fényes, de már nem olyan éles, mint az előző szinten. Nyomj le egyszerre öt
gépi billentyűt: az akkord tisztán szól, nem recseg.
:::

:::mistake Gyakori hiba
`voicesRef.current.forEach(fadeOut)`, a nyílfüggvény nélkül. Rövidebbnek tűnik, de a Map `forEach`-e két értéket ad át:
a hangot és a kulcsát. A `fadeOut` így a MIDI-számot kapja `seconds`-nak: egy 60-as hang 20 másodperces időállandóval,
két percig halkul. A billentyűk kialszanak, a hangok pedig még sokáig zúgnak.
:::

:::try Próbáld ki
Hangold át a hangszereket: a zongora `decay`-je legyen 3 (sokáig cseng), az orgona `attack`-je 0,5 (lassan
„felduzzad”), a szinti `filter`-e 500 (tompa, mintha a fal mögül szólna). Kitalálhatsz egy ötödik hangszínt is, például
egy pengetett hangot: `sawtooth`, nagyon rövid `decay`, 0 `sustain`.
:::

### Felvétel és visszajátszás

A felvevő nem hangot rögzít, hanem azt, amit a játékos csinál: melyik hangot mikor nyomta le, és mikor engedte fel.
Egy ilyen [[esemény|hangesemény]] három adatból áll: `time` (hány ezredmásodperccel a felvétel indulása után), `type` (`'on'` a lenyomás,
`'off'` a felengedés) és `midi` (melyik hang). Visszajátszáskor ugyanezeket az eseményeket ugyanazokkal a
szünetekkel „játsszuk el” újra. Így működik a MIDI is: egy dal nem hang, hanem események sora.

Az időt a [[performance.now]] méri: ezredmásodpercben adja meg, mennyi idő telt el az oldal betöltése óta, és a
`Date.now()`-val ellentétben akkor sem ugrik, ha közben átállítják a gép óráját.

Felvétel közben az eseményeket egy refben gyűjtjük. Minden leütésnél bekerül egy újabb, de ettől semmit nem kell
újrarajzolni. Amikor a felvétel véget ér, a kész felvétel (`take`) már állapotba kerül, mert a képernyőn is látszik:
kiírjuk, hány hangból áll, és engedélyezzük a „Visszajátszás” gombot.

A visszajátszás egy effekt, ami a `playing` állapottól függ. Ha `true` lesz, minden eseményhez elindít egy
`setTimeout`-ot (13. lecke). A takarító függvénye leállítja az időzítőket, és elhallgattatja a még szóló hangokat:
akár a „Leállítás” gombbal, akár a felvétel végén lesz a `playing` megint `false`. Hozd létre az `src/useRecorder.js`
fájlt:

```js file=src/useRecorder.js
import { useEffect, useEffectEvent, useRef, useState } from 'react'

// Felvevő: nem hangot rögzít, hanem eseményeket: mikor (ezredmásodperc), mi ('on' vagy 'off'), melyik hang.
function useRecorder(onEvent) {
  const [recording, setRecording] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [take, setTake] = useState(null) // az utolsó felvétel: { events, duration }, vagy null
  const startRef = useRef(0) // mikor indult a felvétel
  const eventsRef = useRef([]) // a felvétel közben gyűlő események

  function log(type, midi) {
    if (!recording) return
    // Az első hang előtti felengedéseket nem jegyezzük fel.
    if (type === 'off' && eventsRef.current.length === 0) return
    eventsRef.current.push({ time: performance.now() - startRef.current, type, midi })
  }

  function startRecording() {
    eventsRef.current = []
    startRef.current = performance.now()
    setRecording(true)
  }

  function stopRecording() {
    setRecording(false)
    const events = eventsRef.current
    if (events.length === 0) return
    // A felvétel az első hanggal kezdődjön, ne a gombnyomással.
    const offset = events[0].time
    setTake({
      events: events.map((event) => ({ ...event, time: event.time - offset })),
      duration: performance.now() - startRef.current - offset,
    })
  }

  function play() {
    setPlaying(true)
  }

  function stop() {
    setPlaying(false)
  }

  // Visszajátszáskor ezen keresztül szólnak a hangok; mindig a legfrissebb onEvent-et hívja.
  const playEvent = useEffectEvent((type, midi) => onEvent(type, midi))

  // Visszajátszás: minden eseményhez egy időzítő. A takarítás leállítja őket, és elhallgattatja, ami még szól.
  useEffect(() => {
    if (!playing) return
    const sounding = new Set()
    const timers = take.events.map((event) =>
      setTimeout(() => {
        if (event.type === 'on') sounding.add(event.midi)
        else sounding.delete(event.midi)
        playEvent(event.type, event.midi)
      }, event.time),
    )
    timers.push(setTimeout(() => setPlaying(false), take.duration))
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      sounding.forEach((midi) => playEvent('off', midi))
    }
  }, [playing, take])

  return { recording, playing, take, log, startRecording, stopRecording, play, stop }
}

export default useRecorder
```

- A `log` minden leütésnél és felengedésnél hívódik, de csak felvétel közben jegyez fel valamit. Az első hang előtti
  felengedés (például egy még a felvétel előtt lenyomott billentyűé) nem kell.
- A `stopRecording` a felvétel elejéről levágja a csendet: az első esemény ideje (`offset`) mindegyikből levonódik, így
  a visszajátszás rögtön az első hanggal indul. A `{ ...event, time: … }` a már ismert spread: egy másolat, új
  `time`-mal. A `duration` a felvétel teljes hossza, az első hangtól a leállításig.
- A `playEvent` egy Effect Event, ahogy a billentyűzetnél: az `onEvent` prop minden rajzolásnál új függvény, de az
  effektnek nem kell újraindulnia miatta, és mégis mindig a legfrissebbet hívja (például a most kiválasztott
  hangszínnel).
- Az effektben a `sounding` egy [[Set]] (3. lecke): azok a hangok, amelyeket a visszajátszás elindított, de még nem
  hallgattatott el. Ha a takarítás közben jön, ezeket elhallgattatja, különben beragadnának. Az utolsó időzítő a
  felvétel végén `false`-ra állítja a `playing`-et, és ettől lefut a takarítás.

A kezelőpanel az `src/components/RecorderPanel.jsx` fájlba kerül:

```jsx file=src/components/RecorderPanel.jsx
function RecorderPanel({ recorder }) {
  const { recording, playing, take } = recorder

  let status = 'Nyomd meg a Felvétel gombot, játssz egy dallamot, állítsd le, aztán játszd vissza.'
  if (recording) {
    status = 'Felvétel folyamatban: játssz!'
  } else if (take !== null) {
    const count = take.events.filter((event) => event.type === 'on').length
    const seconds = (take.duration / 1000).toLocaleString('hu-HU', { maximumFractionDigits: 1 })
    status = `Kész a felvétel: ${count} hang, ${seconds} másodperc.`
  }

  return (
    <section className="panel">
      <h2>Felvevő</h2>
      <div className="panel__buttons">
        {recording ? (
          <button type="button" className="button button--primary is-recording" onClick={recorder.stopRecording}>
            <span className="rec-dot" aria-hidden="true" />
            Felvétel leállítása
          </button>
        ) : (
          <button type="button" className="button" onClick={recorder.startRecording} disabled={playing}>
            <span className="rec-dot" aria-hidden="true" />
            Felvétel
          </button>
        )}
        {playing ? (
          <button type="button" className="button" onClick={recorder.stop}>
            Leállítás
          </button>
        ) : (
          <button type="button" className="button" onClick={recorder.play} disabled={take === null || recording}>
            Visszajátszás
          </button>
        )}
      </div>
      <p className="panel__status" role="status">
        {status}
      </p>
    </section>
  )
}

export default RecorderPanel
```

A panel az egész `recorder` objektumot kapja, és a gombjai a hook függvényeit hívják. A `toLocaleString('hu-HU', …)` a
magyar szokás szerint, tizedesvesszővel írja ki a másodperceket (legfeljebb egy tizedesjeggyel). A piros pötty az
`aria-hidden` miatt a képernyőolvasónak láthatatlan, felvétel közben pedig a CSS villogtatja.

Az `App`-ban szét kell választani két dolgot: a hang megszólaltatását és a játékos mozdulatát. Amit a játékos játszik,
az szól **és** bekerül a felvételbe; amit a visszajátszás játszik, az csak szól, különben a felvétel önmagát venné fel
újra. Ezért a régi `press` és `release` neve `noteOn` és `noteOff` lesz, és új `press` és `release` készül, ami a hang
mellett a felvevőnek is szól. A `makeNote` is kell, mert a felvétel csak MIDI-számokat őriz. Itt a teljes
`src/App.jsx`:

```jsx file=src/App.jsx mark=2,5,9,29,35,40-44,46-50,52-55,123
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { COMPUTER_KEYS, makeNote, makeNotes } from './notes.js'
import { INSTRUMENTS } from './instruments.js'
import useSynth from './useSynth.js'
import useRecorder from './useRecorder.js'
import PianoKeys from './components/PianoKeys.jsx'
import OctaveSwitch from './components/OctaveSwitch.jsx'
import InstrumentPicker from './components/InstrumentPicker.jsx'
import RecorderPanel from './components/RecorderPanel.jsx'
import './App.css'

const LOWEST_OCTAVE = 2
const HIGHEST_OCTAVE = 6

function App() {
  const [instrumentId, setInstrumentId] = useState('piano')
  // A kiválasztott hangszín adatai az azonosítója alapján.
  const instrument = INSTRUMENTS.find((item) => item.id === instrumentId)
  const synth = useSynth(instrument)
  // Az éppen szóló hangok MIDI-száma: ezek a billentyűk világítanak.
  const [active, setActive] = useState([])
  const [octave, setOctave] = useState(4)
  // A képernyőn lévő 13 billentyű: minden rajzoláskor az oktávból számoljuk.
  const notes = makeNotes(octave)
  // Melyik gépi billentyű melyik hangot indította el (event.code → hang).
  const heldRef = useRef(new Map())

  // Megszólal egy hang, és kigyullad a billentyűje.
  function noteOn(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // Elhallgat egy hang, és kialszik a billentyűje.
  function noteOff(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  // Visszajátszáskor a felvett hangok szólnak, de nem kerülnek újra a felvételbe.
  const recorder = useRecorder((type, midi) => {
    if (type === 'on') noteOn(makeNote(midi))
    else noteOff(makeNote(midi))
  })

  // Amit a játékos játszik: szól, és ha épp felvétel van, bekerül a felvételbe.
  function press(note) {
    noteOn(note)
    recorder.log('on', note.midi)
  }

  function release(note) {
    noteOff(note)
    recorder.log('off', note.midi)
  }

  function changeOctave(value) {
    // Math.max és Math.min: az oktáv nem lépheti át a határokat.
    setOctave(Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, value)))
  }

  // Melyik hang tartozik ehhez a gépi billentyűhöz? Ha egyik sem, undefined.
  function noteFor(code) {
    const index = COMPUTER_KEYS.findIndex((key) => key.code === code)
    return index === -1 ? undefined : notes[index]
  }

  // A gép billentyűzete is zongora. Az Effect Event mindig a legutóbbi rajzolás változóit látja.
  const handleKeyDown = useEffectEvent((event) => {
    // Nyomva tartásnál ne induljon újra; a Ctrl, Alt és Cmd kombinációk a böngészőéi.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Y és X (a kódjuk KeyZ és KeyX): oktávváltás.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    heldRef.current.set(event.code, note) // megjegyezzük, melyik hangot indította
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    // Azt a hangot állítjuk le, amelyiket ez a billentyű indította, akkor is, ha közben oktávot váltottunk.
    const note = heldRef.current.get(event.code)
    if (note === undefined) return
    heldRef.current.delete(event.code)
    release(note)
  })

  // Ha az ablak elveszti a fókuszt (például Alt+Tab), a felengedést már nem látjuk: minden hang elhallgat.
  const handleBlur = useEffectEvent(() => {
    heldRef.current.clear()
    synth.stopAll()
    setActive([])
  })

  // A figyelőket egyszer tesszük fel, és a takarítás veszi le őket.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <div className="controls">
        <InstrumentPicker value={instrumentId} onChange={setInstrumentId} />
        <OctaveSwitch octave={octave} min={LOWEST_OCTAVE} max={HIGHEST_OCTAVE} onChange={changeOctave} />
      </div>
      <PianoKeys notes={notes} active={active} onPress={press} onRelease={release} />
      <RecorderPanel recorder={recorder} />
    </main>
  )
}

export default App
```

A billentyűzet, a gépi billentyűk és a `handleBlur` kódja nem változott: továbbra is a `press`-t és a `release`-t hívják,
csak ezek most már a felvevőnek is szólnak. A `useRecorder` egy nyílfüggvényt kap, ami a MIDI-számból a `makeNote`-tal
hangot készít, és a `noteOn`-t vagy a `noteOff`-ot hívja.

:::check Ellenőrizd
A billentyűk alatt megjelenik a Felvevő panel; a „Visszajátszás” gomb még szürke. Kattints a „Felvétel” gombra: a
gomb sötétzöldre telik, a felirata „Felvétel leállítása” lesz, és a piros pötty villog. Várj egy kicsit, játssz egy rövid dallamot, és nyomd meg a „Felvétel leállítása”
gombot: a panel kiírja, hány hangból és hány másodpercből áll a felvétel. A „Visszajátszás” ugyanazzal a ritmussal,
a kezdeti csend nélkül játssza vissza, és közben a billentyűk is kigyulladnak. A „Leállítás” azonnal elhallgattatja.
Ha visszajátszás előtt hangszínt váltasz, a felvétel az új hangszínnel szól.
:::

:::mistake Gyakori hiba
A takarító függvényből kimarad a `clearTimeout`. A „Leállítás” gomb felirata visszavált, de a hangok tovább jönnek a
felvétel végéig, mert az időzítők már el vannak indítva, és senki nem állítja le őket. Ha közben újra megnyomod a
„Visszajátszás” gombot, két felvétel szól egymás hegyén-hátán.
:::

:::try Feladat
Írd ki felvétel közben, hány hangot játszottál eddig. Adj a `useRecorder`-hez egy `count` állapotot: a
`startRecording` 0-ra állítja, a `log` pedig minden `'on'` eseménynél eggyel növeli
(`setCount((current) => current + 1)`). Add vissza a hookból, és írd bele a panel állapotsorába, egy template
literallal: `Felvétel folyamatban: eddig ${recorder.count} hang.` Miért nem egyszerűen az `eventsRef.current.length`? Az a
felengedéseket is számolja, és a ref változása sosem rajzol újra: itt a szám csak azért látszana mozogni, mert minden
leütés az `active`-ot is megváltoztatja, és az véletlenül újrarajzolja az `App`-ot.
:::

### MIDI-billentyűzet

A MIDI 1983 óta a hangszerek közös nyelve. Egy MIDI-billentyűzet nem ad hangot, csak üzeneteket küld a gépnek, és
mindegyik üzenet csak néhány számból áll. A két legfontosabb:

- Lenyomás (note on): `[144, hang, erősség]`. A hang a MIDI-szám (pont, mint a mi `midi` mezőnk), az erősség 1 és 127
  között azt mondja meg, milyen erősen ütötték le a billentyűt.
- Felengedés (note off): `[128, hang, erősség]`. Sok billentyűzet a felengedést 0 erősségű lenyomásként küldi.

Egy MIDI-kapcsolaton 16 [[MIDI-csatorna]] fut egymás mellett, mintha 16 hangszert lehetne külön-külön vezérelni rajta,
és az első szám azt is elárulja, melyik csatornáról jön az üzenet: a lenyomás 144-től 159-ig (144 az első csatorna,
145 a második…), a felengedés 128-tól 143-ig bármi lehet.

A böngészőben a [[Web MIDI API]] olvassa ezeket az üzeneteket. A `navigator.requestMIDIAccess()` engedélyt kér a
hozzáféréshez; a Chrome ilyenkor megkérdezi a felhasználót. Egy [[Promise]]-t ad vissza (3. lecke): ha a felhasználó
engedélyezi, egy `MIDIAccess` objektumot kapunk, aminek az `inputs` mezője a csatlakoztatott eszközöket sorolja fel.
Minden eszköznek van egy `onmidimessage` mezője: az ide tett függvény minden üzenetnél lefut. Ez az eseményfigyelés
régebbi formája; egy eszköznek egyszerre egy ilyen figyelője lehet, és egy új beállítás lecseréli a régit. Ha valamit
be- vagy kihúznak, a `MIDIAccess` `onstatechange` függvénye fut le.

A Web MIDI API-t a Chrome, az Edge és a Firefox ismeri, a Safari nem. Ezért először megnézzük, létezik-e egyáltalán a
`navigator.requestMIDIAccess`. Engedélyt pedig csak akkor kérünk, amikor a felhasználó a „Csatlakoztatás” gombra
kattint: egy oldal ne kérdezgessen betöltéskor olyasmiről, amit a látogató talán nem is akar. Hozd létre az
`src/useMidi.js` fájlt:

```js file=src/useMidi.js
import { useEffect, useEffectEvent, useState } from 'react'

// MIDI-billentyűzet a Web MIDI API-val. Az onNoteOn és az onNoteOff a hang MIDI-számát kapja.
function useMidi(onNoteOn, onNoteOff) {
  const [access, setAccess] = useState(null) // a böngésző engedélye (MIDIAccess), vagy null
  const [status, setStatus] = useState('idle') // 'idle', 'asking', 'ready' vagy 'denied'
  const [devices, setDevices] = useState([]) // a csatlakoztatott billentyűzetek neve
  const supported = 'requestMIDIAccess' in navigator

  async function connect() {
    setStatus('asking')
    try {
      setAccess(await navigator.requestMIDIAccess())
      setStatus('ready')
    } catch {
      setStatus('denied')
    }
  }

  // Egy MIDI-üzenet három szám: [parancs, hang, erősség].
  const handleMessage = useEffectEvent((message) => {
    const [command, midi, velocity] = message.data
    // 144–159: lenyomtak egy billentyűt (a 16 csatorna valamelyikén), 128–143: felengedték.
    // Sok billentyűzet a felengedést 0 erősségű lenyomásként küldi.
    if (command >= 144 && command <= 159 && velocity > 0) onNoteOn(midi)
    else if (command >= 128 && command <= 159) onNoteOff(midi)
  })

  // Minden csatlakoztatott billentyűzetre figyelünk, és arra is, ha valamit be- vagy kihúznak.
  useEffect(() => {
    if (access === null) return
    function listen() {
      const inputs = [...access.inputs.values()].filter((input) => input.state === 'connected')
      inputs.forEach((input) => {
        input.onmidimessage = handleMessage
      })
      setDevices(inputs.map((input) => input.name))
    }
    listen()
    access.onstatechange = listen
    return () => {
      access.onstatechange = null
      access.inputs.forEach((input) => {
        input.onmidimessage = null
      })
    }
  }, [access])

  return { supported, status, devices, connect }
}

export default useMidi
```

- A `'requestMIDIAccess' in navigator` igaz, ha a böngésző ismeri a függvényt. Ez nem állapot: minden rajzolásnál
  ugyanazt adja.
- A `connect` egy `async` függvény (3. lecke): az `await` megvárja a felhasználó válaszát. Ha nemet mond (vagy a
  böngésző tiltja), a `catch` ág fut le.
- A `message.data` az üzenet számai. A `const [command, midi, velocity] = …` szétszedi őket három változóba, ahogy a
  `useState` párját szoktuk. A `velocity > 0` vizsgálat miatt a 0 erősségű lenyomás felengedésnek számít. Minden más
  üzenetet (például a billentyűzet órajelét, ami másodpercenként sokszor jön) a két `if` figyelmen kívül hagy.
- Az effekt akkor fut, amikor megérkezik az engedély (`access`). Az `inputs` egy Map-szerű gyűjtemény: a `values()`
  az eszközöket adja, a `[...]` tömbbé alakítja, a `filter` pedig csak a csatlakoztatottakat tartja meg. Mindegyik
  megkapja a `handleMessage`-et, a nevük pedig a `devices` állapotba kerül. A `listen` az `onstatechange`-re is
  lefut, így egy később bedugott billentyűzet is azonnal működik. A takarító függvény minden figyelőt levesz.
- A `handleMessage` Effect Event, mert a mostani `onNoteOn`-t és `onNoteOff`-ot kell hívnia.

A panel az `src/components/MidiPanel.jsx` fájlba kerül:

```jsx file=src/components/MidiPanel.jsx
function MidiPanel({ midiInput }) {
  const { supported, status, devices } = midiInput

  let message = 'Van MIDI-billentyűzeted? Csatlakoztasd a géphez, és kattints a gombra.'
  if (!supported) message = 'Ez a böngésző nem ismeri a Web MIDI API-t. Próbáld ki Chrome-ban, Edge-ben vagy Firefoxban.'
  else if (status === 'asking') message = 'Engedélyre vár…'
  else if (status === 'denied') message = 'A böngésző nem engedte a MIDI-hozzáférést.'
  else if (status === 'ready' && devices.length === 0) message = 'Nincs csatlakoztatott MIDI-billentyűzet. Dugd be, és máris játszhatsz.'
  else if (status === 'ready') message = `Csatlakoztatva: ${devices.join(', ')}`

  return (
    <section className="panel">
      <h2>MIDI-billentyűzet</h2>
      {supported && status !== 'ready' && (
        <div className="panel__buttons">
          <button type="button" className="button" onClick={midiInput.connect} disabled={status === 'asking'}>
            Csatlakoztatás
          </button>
        </div>
      )}
      <p className="panel__status" role="status">
        {message}
      </p>
    </section>
  )
}

export default MidiPanel
```

Végül az `App`. Az importok közé vedd fel a két új fájlt: `import useMidi from './useMidi.js'` és
`import MidiPanel from './components/MidiPanel.jsx'`. A `release` függvény után hívd meg a hookot. A MIDI-billentyűzet
ugyanúgy a játékos keze, mint az egér, ezért a `press`-t és a `release`-t hívja, így a felvételbe is bekerül:

```jsx file=src/App.jsx mark=6-10
  function release(note) {
    noteOff(note)
    recorder.log('off', note.midi)
  }

  // A MIDI-billentyűzet hangjai ugyanúgy szólnak, mint az egéré vagy a gép billentyűié.
  const midiInput = useMidi(
    (midi) => press(makeNote(midi)),
    (midi) => release(makeNote(midi)),
  )
```

A felvevő panelje alá pedig a MIDI-panel kerül:

```jsx file=src/App.jsx mark=2
      <RecorderPanel recorder={recorder} />
      <MidiPanel midiInput={midiInput} />
```

:::check Ellenőrizd
A Felvevő alatt megjelenik a MIDI-billentyűzet panel. Ha nincs MIDI-billentyűzeted, kattints a „Csatlakoztatás”
gombra, és engedélyezd a hozzáférést: a panel kiírja, hogy nincs csatlakoztatott billentyűzet; a zongora többi része
ugyanúgy működik. Ha van, dugd be USB-n: a panel kiírja a nevét, a billentyűi megszólaltatják a zongorát, és a látható
oktáv billentyűi ki is gyulladnak. Safariban a panel azt írja, hogy a böngésző nem ismeri a Web MIDI API-t.
:::

:::mistake Gyakori hiba
Csak a `command === 144` vizsgálata. Az első csatornán működik, de egy másik csatornára állított billentyűzet néma
marad, és ami még rosszabb: a felengedést (ha 128-cal vagy 0 erősségű 144-gyel jön) senki nem veszi észre, így a hangok
beragadnak. Mindkét tartományt és a 0 erősséget is figyelni kell.
:::

:::try Próbáld ki
Írd a `handleMessage` első sorába: `console.log(message.data)`. Nyomj le billentyűket, mozgasd a hangmagasság-állító
kereket vagy nyomd le a kitartó (sustain) pedált (ha van): a pedál például `[176, 64, 127]` üzenetet küld. Aztán töröld a sort.
:::

### Dallamtanító mód

Az utolsó funkció egy tanár: kiválasztasz egy dallamot, és a következő hang billentyűje sárgán világít. Ha eltalálod,
jön a következő; ha mellényúlsz, a hibák száma nő. A dallamok a kiinduló projekttel érkezett `src/melodies.js`-ben vannak,
mindegyik egy `id`, egy `title` és egy `notes` tömb MIDI-számokkal. A címek angolul vannak (az első Beethoven
Örömódája, a harmadik a „János bácsi”), nyugodtan fordítsd le őket.

A gyakorlás állapota egy objektum: melyik dallam (`melody`), hányadik hangjánál tartunk (`position`), és hány hiba volt
(`mistakes`), vagy `null`, ha nem gyakorolunk. A következő hang (`target`) ebből számolható, ez megint egy
származtatott érték. Hozd létre az `src/useMelodyCoach.js` fájlt:

```js file=src/useMelodyCoach.js
import { useState } from 'react'

// Dallamtanító: melyik dallamot gyakoroljuk, hányadik hangjánál tartunk, és hányat hibáztunk.
function useMelodyCoach() {
  const [practice, setPractice] = useState(null) // { melody, position, mistakes }, vagy null

  function choose(melody) {
    setPractice(melody === undefined ? null : { melody, position: 0, mistakes: 0 })
  }

  // Minden lejátszott hangot ellenőrzünk. A frissítő függvény mindig a legfrissebb állapotból számol.
  function check(midi) {
    setPractice((current) => {
      if (current === null || current.position === current.melody.notes.length) return current
      if (current.melody.notes[current.position] === midi) return { ...current, position: current.position + 1 }
      return { ...current, mistakes: current.mistakes + 1 }
    })
  }

  // A következő hang (ez világít sárgán), vagy undefined, ha nem gyakorolunk, vagy a végére értünk.
  const target = practice === null ? undefined : practice.melody.notes[practice.position]

  return { practice, target, choose, check }
}

export default useMelodyCoach
```

A `check` a frissítő függvényt használja. Egy MIDI-billentyűzetről két hang szinte egyszerre is érkezhet, gyorsabban,
mint ahogy a React újrarajzolna: így a második is a legfrissebb állapotot látja, nem azt, ami az első előtt volt. Ha a
végére értünk, a `practice.melody.notes[practice.position]` már a tömbön túlra mutat, és `undefined`-ot ad: ekkor egy
billentyű sem világít.

A panel egy legördülő menüből választ dallamot. A `<select>` vezérelt mező, mint a 3. lecke csúszkája: az értéke a
kiválasztott dallam `id`-ja (vagy `''`, ha nincs), és minden változás az `onChoose` propot hívja. A dallam hangjai egy
listában is megjelennek, a kész hangok zölden, a következő sárgán. Hozd létre az `src/components/MelodyCoach.jsx`
fájlt:

```jsx file=src/components/MelodyCoach.jsx
import { MELODIES } from '../melodies.js'
import { makeNote } from '../notes.js'

function MelodyCoach({ practice, onChoose }) {
  let status = 'Válassz egy dallamot: a következő hang billentyűje sárgán világít.'
  if (practice !== null) {
    const { melody, position, mistakes } = practice
    if (position === melody.notes.length) {
      status = `Bravó, végigjátszottad! Hibák száma: ${mistakes}.`
    } else {
      status = `${position} / ${melody.notes.length} hang kész. Hibák száma: ${mistakes}.`
    }
  }

  return (
    <section className="panel">
      <h2>Dallamtanító</h2>
      <label className="panel__field">
        Dallam
        <select
          className="select"
          value={practice === null ? '' : practice.melody.id}
          onChange={(event) => onChoose(event.target.value)}
        >
          <option value="">Nincs, szabad játék</option>
          {MELODIES.map((melody) => (
            <option key={melody.id} value={melody.id}>
              {melody.title}
            </option>
          ))}
        </select>
      </label>
      {practice !== null && (
        <>
          <ol className="melody" aria-label="A dallam hangjai">
            {practice.melody.notes.map((midi, index) => {
              let className = ''
              if (index < practice.position) className = 'is-done'
              if (index === practice.position) className = 'is-next'
              return (
                <li key={index} className={className}>
                  {makeNote(midi).name}
                </li>
              )
            })}
          </ol>
          <div className="panel__buttons">
            <button type="button" className="button" onClick={() => onChoose(practice.melody.id)}>
              Elölről
            </button>
          </div>
        </>
      )}
      <p className="panel__status" role="status">
        {status}
      </p>
    </section>
  )
}

export default MelodyCoach
```

A listában most kivételesen az `index` a `key`. A dallamban ugyanaz a hang sokszor ismétlődik (E, E, F, G…), így a
MIDI-szám nem egyedi. A lista viszont egy dallam gyakorlása közben sosem rendeződik át, és elem sem kerül bele vagy
tűnik el belőle, csak az osztálynevek változnak: ilyenkor a sorszám jó kulcs. A `<>…</>` [[Fragment]] (9. lecke) a lista és a gomb köré kell, mert az `&&` után csak egy elem állhat.

A billentyűzet egy `hint` propot kap, a következő hang MIDI-számát. Amelyik billentyű ezt a hangot játssza, az
`is-hint` osztályt kapja, és a CSS sárgán világítja meg. Itt a teljes `src/components/PianoKeys.jsx`:

```jsx file=src/components/PianoKeys.jsx mark=3,10
import { COMPUTER_KEYS } from '../notes.js'

function PianoKeys({ notes, active, hint, onPress, onRelease }) {
  // Az onContextMenu miatt a jobb klikk (és a hosszú érintés) nem nyit menüt a billentyűkön.
  return (
    <div className="keys" onContextMenu={(event) => event.preventDefault()}>
      {notes.map((note, index) => {
        let className = note.black ? 'key key--black' : 'key key--white'
        if (active.includes(note.midi)) className += ' is-active'
        if (note.midi === hint) className += ' is-hint'
        const label = COMPUTER_KEYS[index].label
        return (
          <button
            key={note.midi}
            type="button"
            className={className}
            aria-label={`${note.name}, ${label} billentyű`}
            onPointerDown={() => onPress(note)}
            onPointerUp={() => onRelease(note)}
            onPointerLeave={(event) => {
              // Csak akkor, ha lenyomott gombbal csúszott le róla az egér.
              if (event.buttons > 0) onRelease(note)
            }}
          >
            <kbd className="key__label">{label}</kbd>
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

Az `App` meghívja a hookot, és minden hangot, amit a játékos játszik, ellenőriz vele: ezért a `press`-be kerül, nem a
`noteOn`-ba (a visszajátszott felvétel nem gyakorol helyetted). Dallamválasztáskor a 4. oktávra vált, mert minden
dallam ott van, így a sárga billentyű biztosan látszik. Itt a teljes, kész `src/App.jsx`:

```jsx file=src/App.jsx mark=4,8,14,50,52,56,75-79,141,144
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { COMPUTER_KEYS, makeNote, makeNotes } from './notes.js'
import { INSTRUMENTS } from './instruments.js'
import { MELODIES } from './melodies.js'
import useSynth from './useSynth.js'
import useRecorder from './useRecorder.js'
import useMidi from './useMidi.js'
import useMelodyCoach from './useMelodyCoach.js'
import PianoKeys from './components/PianoKeys.jsx'
import OctaveSwitch from './components/OctaveSwitch.jsx'
import InstrumentPicker from './components/InstrumentPicker.jsx'
import RecorderPanel from './components/RecorderPanel.jsx'
import MidiPanel from './components/MidiPanel.jsx'
import MelodyCoach from './components/MelodyCoach.jsx'
import './App.css'

const LOWEST_OCTAVE = 2
const HIGHEST_OCTAVE = 6

function App() {
  const [instrumentId, setInstrumentId] = useState('piano')
  // A kiválasztott hangszín adatai az azonosítója alapján.
  const instrument = INSTRUMENTS.find((item) => item.id === instrumentId)
  const synth = useSynth(instrument)
  // Az éppen szóló hangok MIDI-száma: ezek a billentyűk világítanak.
  const [active, setActive] = useState([])
  const [octave, setOctave] = useState(4)
  // A képernyőn lévő 13 billentyű: minden rajzoláskor az oktávból számoljuk.
  const notes = makeNotes(octave)
  // Melyik gépi billentyű melyik hangot indította el (event.code → hang).
  const heldRef = useRef(new Map())

  // Megszólal egy hang, és kigyullad a billentyűje.
  function noteOn(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // Elhallgat egy hang, és kialszik a billentyűje.
  function noteOff(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  // Visszajátszáskor a felvett hangok szólnak, de nem kerülnek újra a felvételbe.
  const recorder = useRecorder((type, midi) => {
    if (type === 'on') noteOn(makeNote(midi))
    else noteOff(makeNote(midi))
  })
  const coach = useMelodyCoach()

  // Amit a játékos játszik: szól, bekerül a felvételbe, és a dallamtanító is ellenőrzi.
  function press(note) {
    noteOn(note)
    recorder.log('on', note.midi)
    coach.check(note.midi)
  }

  function release(note) {
    noteOff(note)
    recorder.log('off', note.midi)
  }

  // A MIDI-billentyűzet hangjai ugyanúgy szólnak, mint az egéré vagy a gép billentyűié.
  const midiInput = useMidi(
    (midi) => press(makeNote(midi)),
    (midi) => release(makeNote(midi)),
  )

  function changeOctave(value) {
    // Math.max és Math.min: az oktáv nem lépheti át a határokat.
    setOctave(Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, value)))
  }

  function chooseMelody(id) {
    // A „Nincs, szabad játék” sor értéke '': ahhoz nem talál dallamot a find, így undefined lesz, és a gyakorlás leáll.
    coach.choose(MELODIES.find((melody) => melody.id === id))
    setOctave(4) // minden dallam a 4. oktávban van
  }

  // Melyik hang tartozik ehhez a gépi billentyűhöz? Ha egyik sem, undefined.
  function noteFor(code) {
    const index = COMPUTER_KEYS.findIndex((key) => key.code === code)
    return index === -1 ? undefined : notes[index]
  }

  // A gép billentyűzete is zongora. Az Effect Event mindig a legutóbbi rajzolás változóit látja.
  const handleKeyDown = useEffectEvent((event) => {
    // Nyomva tartásnál ne induljon újra; a Ctrl, Alt és Cmd kombinációk a böngészőéi.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Y és X (a kódjuk KeyZ és KeyX): oktávváltás.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    heldRef.current.set(event.code, note) // megjegyezzük, melyik hangot indította
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    // Azt a hangot állítjuk le, amelyiket ez a billentyű indította, akkor is, ha közben oktávot váltottunk.
    const note = heldRef.current.get(event.code)
    if (note === undefined) return
    heldRef.current.delete(event.code)
    release(note)
  })

  // Ha az ablak elveszti a fókuszt (például Alt+Tab), a felengedést már nem látjuk: minden hang elhallgat.
  const handleBlur = useEffectEvent(() => {
    heldRef.current.clear()
    synth.stopAll()
    setActive([])
  })

  // A figyelőket egyszer tesszük fel, és a takarítás veszi le őket.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <div className="controls">
        <InstrumentPicker value={instrumentId} onChange={setInstrumentId} />
        <OctaveSwitch octave={octave} min={LOWEST_OCTAVE} max={HIGHEST_OCTAVE} onChange={changeOctave} />
      </div>
      <PianoKeys notes={notes} active={active} hint={coach.target} onPress={press} onRelease={release} />
      <RecorderPanel recorder={recorder} />
      <MidiPanel midiInput={midiInput} />
      <MelodyCoach practice={coach.practice} onChoose={chooseMelody} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Legalul megjelenik a Dallamtanító. Válaszd az „Ode to Joy”-t: a 4. oktáv látszik, az E billentyű sárgán világít, és a
panelen ott a dallam összes hangja, az első kiemelve. Játszd az E-t (egérrel, a ++D++ billentyűvel vagy MIDI-n): a
listában az első E zöld lesz, és a második E kerül sorra. Mivel ez is E, a sárga billentyű most a helyén marad; az
F-nél lép tovább. Ha mellényúlsz, a hibák száma nő, a sárga billentyű marad. A végén a panel gratulál,
és kiírja a hibák számát; az „Elölről” újrakezdi, a „Nincs, szabad játék” kikapcsolja a tanítót. Gratulálok, kész a
hangszered!
:::

:::mistake Gyakori hiba
A `coach.check` a `noteOn`-ba kerül a `press` helyett. Ekkor a visszajátszás is „gyakorol”: ha felveszed a dallamot,
és visszajátszod, a tanító hibátlannak látja. Ráadásul ha a felvétel más dallam, minden hangja hibának számít.
:::

:::try Feladat
Írd be a kedvenc dallamodat az `src/melodies.js`-be egy új objektumként (MIDI-számokkal; a fájl elején ott a
segítség, melyik szám melyik hang, de angol hangnevekkel: az ottani B4 a mi H4-ünk, a 71-es, a mi B-nk pedig a fekete
billentyű, a 70-es). Ha egy hangja a 4. oktávon kívül esik, a tanító nem tudja megmutatni: gondold ki,
hogyan választhatná a `chooseMelody` a dallam legmélyebb hangjához illő oktávot (`Math.min(...melody.notes)`).
:::
