# Mit építünk?

Egy saját videólejátszót, a Popcorn Playert. A böngésző magától is tud videót lejátszani, de a saját, böngészőnként
eltérő gombjaival. Mi most minden gombot magunk rajzolunk ki: lejátszás és szünet, egy tekerősáv, amin előre-hátra
tekerhetsz, hangerő, sebesség, teljes képernyő, billentyűparancsok, a végén pedig lejátszási lista, feliratok, és a
lejátszó még arra is emlékszik, hol hagytad abba. Közben megtanulod, hogyan ér el a React egy valódi HTML-elemet, hogyan
irányítja a JavaScript a `<video>` elemet (`play()`, `pause()`, `currentTime`), és hogyan lesznek a saját vezérlők
billentyűzettel és képernyőolvasóval is használhatók.

:::levels
- Videó az oldalon, saját lejátszás / szünet gombbal és az eltelt idővel. | kb. 2 óra
- Tekerősáv, hangerő, lejátszási sebesség, teljes képernyő és billentyűparancsok. | kb. 3 óra
- Lejátszási lista, feliratok, folytatás ott, ahol abbahagytad, és kép a képben mód. | kb. 3 óra
:::

**Előismeret:** az előző leckék. Leginkább ezekre építünk: a `useRef` (16. lecke, a stopper és a gépelőmező; egy
DOM-elemhez már a 12. leckében), billentyűesemények az egész ablakon, `preventDefault` és a closure (7. és 17. lecke),
saját hook és `localStorage` (9. lecke), az `aria-label` (12. lecke), a `formatTime` és az `aria-pressed` (13. lecke).
Ha megcsináltad az 5. lecke haladó szintjét, ott már egy `<video>` elembe tetted a kamera képét. Amit itt új módon
használunk, azt újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A feladat a kurzus GitHub-repójában van, a `lessons/18-video-player/exercise` mappában (a fenti „Feladat a GitHubon”
gomb megnyitja). Ugyanúgy jutsz hozzá, mint az előző leckékben, és az 1. lecke 0. lépése minden parancsot részletesen
elmagyaráz. Röviden: nyiss egy terminált a munkamappádban, ahol a `rika-mentoring` repó van, hozd le az új leckéket,
aztán másold ki a repóból ennek a leckének az `exercise` mappáját `popcorn-player` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/18-video-player/exercise popcorn-player
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/18-video-player/exercise` mappát a munkamappádba, `popcorn-player` néven. A `cp -r` parancs
PowerShellben, Macen és Linuxon is működik; fájlkezelővel is megy: másold át a mappát, és nevezd át a másolatot.
Magához a repóhoz nem nyúlsz, így a `git pull` később is működik; a másolatod a saját projekted.

Nyisd meg a `popcorn-player` mappát a szerkesztőben (VS Code-ban: **File** → **Open Folder**), nyiss benne egy
terminált (**Terminal** → **New Terminal**), és indítsd el a projektet:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Világosszürke oldalt látsz, rajta nagy,
sötét betűkkel a „Popcorn Player” címet, alatta egy szürke sort: „A video player with buttons of our own.” Videó még
nincs: azt a következő lépésben teszed ki.
:::

A szervert hagyd futni. Egy második terminálban (a terminálpanel **+** gombjával) csinálj a másolatodból git-repót
egyetlen committal, a kezdőállapottal:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Ha a git azt kérdezi, ki vagy, az 1. lecke 0. lépése megmutatja, hogyan add meg a nevedet és az e-mail-címedet.

A kiinduló projektben négy fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért nem kell stílust
  írnod: csak a lépésekben megadott osztályneveket (`player`, `seek`, `volume`, `playlist`, …) használod. Azért nézz
  bele!
- `src/Icon.jsx`: kis rajzolt ikonok a gombokhoz. Így használod: `<Icon name="play" />`. A nevek: `play`, `pause`,
  `replay`, `volume`, `mute`, `fullscreen`, `exitFullscreen`, `captions` és `pip`. Az ikonok csak díszek: a gombok a
  nevüket máshonnan kapják, ezt a 2. lépésben meg is mutatjuk.
- `src/videos.js`: a lecke mintaklipjének címe, egyetlen sorban.

```js
export const VIDEO_SRC = 'https://…/media/video-player/rika-sample.mp4'
```

A mintaklip 30 másodperces, hangja is van, és a Rika Mentoring oldalán lakik: a böngésző onnan tölti le, ezért a
leckéhez **internet kell**. Ha inkább a saját videódat játszanád le (vagy épp nincs neted), hozz létre egy `public`
mappát a projekt gyökerében, az `src` mellett, másold bele a videót (például `my-video.mp4` néven), és a `videos.js`-ben
írd át a címet: `export const VIDEO_SRC = '/my-video.mp4'`. A [[public mappa]] a 12. leckéből ismerős: a Vite mindent,
ami benne van, változatlanul kiszolgál a webhely gyökeréből, így a `public/my-video.mp4` a `/my-video.mp4` címen
érhető el. A legbiztosabb formátum az [[MP4]] (H.264 képpel és AAC hanggal): ezt minden böngésző lejátssza.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a cím, az alcím és a fájlokban lévő megjegyzések angolul vannak. Ha
szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te írsz be, magyar feliratokkal
és megjegyzésekkel mutatjuk.

:::concept A másolatod egy git-repó
Ahogy az előző leckékben: a `git restore .` eldob minden változtatást az utolsó commitod óta (az új fájlok megmaradnak,
azokat kézzel töröld). Ha egy lépés működik, commitold: `git add .`, majd `git commit -m "Videó az oldalon"`.
:::

### Videó az oldalon

A HTML-ben a [[videóelem]], a `<video>` játszik le videót. Kezdjük a legegyszerűbb változattal, amiben még
a böngésző saját vezérlői dolgoznak. A lejátszó saját komponenst kap: hozz létre az `src` mappában egy `components`
mappát, benne egy `VideoPlayer.jsx` fájlt:

```jsx file=src/components/VideoPlayer.jsx
function VideoPlayer({ src }) {
  return (
    <div className="player">
      <video className="player__video" src={src} controls preload="metadata" playsInline />
    </div>
  )
}

export default VideoPlayer
```

A `<video>` attribútumai:

- `src`: a videófájl címe. A komponens propként kapja, így bármilyen videót le tud játszani.
- `controls`: kéri a böngésző saját vezérlőit (lejátszás, idősáv, hangerő, teljes képernyő). Érték nélkül írjuk, mert
  ez egy [[logikai attribútum]]: már az, hogy ott van, azt jelenti, hogy „igen”. JSX-ben a `controls` ugyanaz, mint a
  `controls={true}`.
- `preload="metadata"`: a böngésző egyelőre csak a fájl elejét tölti le, amiből kiderül a videó mérete és hossza. A
  teljes videót csak akkor kezdi letölteni, ha valaki elindítja. Ez kíméli a látogató mobilnetét.
- `playsInline`: iPhone-on is az oldalon belül játssza le a videót, és nem ugrik vele rögtön teljes képernyőre. A
  HTML-ben `playsinline`. A JSX-ben a több szóból álló attribútumokban az első utáni minden szó nagybetűvel kezdődik
  (mint a `className` vagy az `onClick`), így lesz belőle `playsInline`. A kivételek az `aria-…` attribútumok: azok
  megtartják a kötőjelet, ahogy a következő lépésben látod.

A `<video>` elemnek nincs tartalma, ezért egyből lezárjuk: `<video … />`. A `player` és a `player__video` osztály adja
a sötét keretet, a lekerekített sarkokat és a 16:9-es képarányt.

Most tedd ki a lejátszót az oldalra. Írd át az `src/App.jsx`-et így (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1-2,13
import { VIDEO_SRC } from './videos.js'
import VideoPlayer from './components/VideoPlayer.jsx'
import './App.css'

function App() {
  return (
    <main className="page">
      <header className="page__header">
        <h1>Popcorn Player</h1>
        <p>A video player with buttons of our own.</p>
      </header>

      <VideoPlayer src={VIDEO_SRC} />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A cím alatt megjelenik egy nagy, lekerekített sarkú videó, alján a böngésző saját vezérlőivel. Indítsd el: hullámzó,
lassan színt váltó háttér előtt a „Rika Mentoring” felirat látszik, jobb alul egy számláló másodpercenként lép
(„1 s”, „2 s”, …), és halk akkordok szólnak. A videó 30 másodperces.
:::

:::mistake Gyakori hiba
A videó helyén csak egy fekete téglalap van, és el sem indul. Ilyenkor a böngésző nem tudta letölteni a fájlt: nincs
internet, vagy elírtad a címet. Nyisd meg a `videos.js`-ben lévő címet egy új böngészőlapon: ha ott sem jön be a videó,
a cím vagy a kapcsolat a hibás. Saját videónál figyelj, hogy a fájl a `public` mappában legyen (ne az `src`-ben), és a
címe `/`-rel kezdődjön.
:::

:::try Próbáld ki
Töröld ki a `controls` attribútumot. A kép ott marad, de a vezérlők eltűnnek, és nem marad gomb, amivel elindíthatnád a
videót.
Pontosan ez lesz a dolgunk: a következő lépéstől a saját gombjaink vezérlik. (Ha visszaírod, a böngésző gombjai is
visszajönnek; a következő lépésben amúgy is kivesszük.)
:::

:::concept Miért saját vezérlők?
A böngésző gombjai minden böngészőben másképp néznek ki, alig lehet őket formázni, és nem tudsz közéjük tenni semmit, ami
a tiéd (lejátszási listát, feliratválasztót). Ezért írnak a videós oldalak saját vezérlőket. Ennek ára van: a
böngésző gombjai eleve működnek billentyűzettel és képernyőolvasóval, a mieinknél viszont erre nekünk kell figyelnünk.
Ezt végig meg is tesszük.
:::

### Saját gomb: a useRef

Jöjjön az első saját gomb: lejátszás és szünet. A `<video>` DOM-eleme ehhez két függvényt ad, a `play()`-t és a
`pause()`-t, a `paused` tulajdonsága pedig megmondja, hogy épp áll-e a videó. Ezek a videóelem [[API]]-jának részei:
függvények és tulajdonságok, amikkel a kódod irányíthatja a videót. JSX-attribútummal viszont nem lehet „lejátszani”,
nincs olyan, hogy `<video playing={true}>`. A valódi elemet kell elérnünk, és ehhez a [[useRef]] kell.

Dolgoztál már így: a 12. leckében a `<dialog>` elemet nyitottad meg a `showModal()`-lal, a 16. leckében az
`inputRef.current.focus()` tette vissza a kurzort a gépelőmezőbe, és ha megcsináltad az 5. lecke haladó szintjét, ott a
kamera képét a `videoRef.current.srcObject`-be írtad. Röviden: a `useRef(null)` egy doboz, ami rajzolásról rajzolásra
megmarad, de ha a tartalma megváltozik, a React nem rajzol újra. Ha egy JSX-elemnek `ref={videoRef}` attribútumot
adsz, a React rajzolás után a valódi [[DOM]]-elemet teszi a doboz `current` mezőjébe. Onnantól a `videoRef.current`
maga a `<video>`.

Írd át az `src/components/VideoPlayer.jsx`-et így:

```jsx file=src/components/VideoPlayer.jsx mark=1-2,5-7,9-18,22,24-33
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'

function VideoPlayer({ src }) {
  // Egy doboz a valódi <video> elemnek: a React rajzolás után teszi bele.
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="player">
      <video ref={videoRef} className="player__video" src={src} preload="metadata" playsInline />

      <div className="player__controls">
        <button
          type="button"
          className="player__button"
          onClick={togglePlay}
          aria-label={playing ? 'Szünet' : 'Lejátszás'}
        >
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- A `controls` eltűnt: mostantól a mi gombunk az egyetlen vezérlő.
- A `togglePlay` először kiveszi a dobozból a videót (`const video = videoRef.current`), aztán megnézi a `paused`
  tulajdonságát. Ha áll, elindítja, ha megy, megállítja. A `playing` állapot csak arra kell, hogy a gomb tudja, melyik
  ikont mutassa.
- A gombon csak egy ikon van, felirat nincs. Az [[aria-label]] (a 12. leckéből ismerős) ad neki nevet, amit a
  képernyőolvasó felolvas: „Lejátszás” vagy „Szünet”. Az `Icon.jsx` minden ikont elrejt a képernyőolvasó elől
  (`aria-hidden`, az 1. leckéből ismerős), így az csak a gomb nevét olvassa fel.

:::check Ellenőrizd
A böngésző vezérlői eltűntek, a kép alatt egy sötét sáv van egyetlen gombbal, rajta egy ▶ jellel. Kattints rá: a videó
elindul, és a gomb ikonja két függőleges vonalra (szünet) vált. Kattints újra: megáll. A ++Tab++ billentyűvel is
eljutsz a gombra (kék keret mutatja), és az ++Enter++ ugyanúgy megnyomja.
:::

:::mistake Gyakori hiba
`videoRef.play()`, a `.current` nélkül. A konzol (++F12++) azt írja: „videoRef.play is not a function”. A `videoRef`
csak a doboz, a videó a doboz `current` mezőjében van: `videoRef.current.play()`.
:::

:::try Próbáld ki
Indítsd el a videót, és hagyd, hogy a végéig fusson. A videó megáll, de a gomb továbbra is a szünet ikont mutatja,
mintha még menne. A következő lépés ezt rendbe teszi.
:::

### Figyeljünk a videóra: események

Az előbb két helyen tároltuk ugyanazt: a videó tudja magáról, hogy megy-e, és a `playing` állapot is. Amíg csak a
gombunk indítja és állítja meg, a kettő egyezik, de a videó a gombunk nélkül is megállhat: ha a végére ér, ha telefonon
kihúzod a fülhallgatót, vagy ha a billentyűzet médiagombjával állítod meg. Ilyenkor a `playing` hazudik.

A megoldás: legyen a videó az [[egyetlen igazságforrás]], és a React csak kövesse. A videó minden változásról
[[médiaeseményt|médiaesemény]] küld: `play`, amikor elindul, `pause`, amikor megáll, és `ended`, amikor a végére ért.
Reactben ezekre ugyanúgy figyelhetsz, mint egy kattintásra: `onPlay`, `onPause`, `onEnded`. A `togglePlay` így már
nem állítja az állapotot, csak szól a videónak, és a videó eseményei frissítik a `playing`-et. Írd át az
`src/components/VideoPlayer.jsx`-et így:

```jsx file=src/components/VideoPlayer.jsx mark=7,9,14-15,21-29,39-45,49-50
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'

function VideoPlayer({ src }) {
  // Egy doboz a valódi <video> elemnek: a React rajzolás után teszi bele.
  const videoRef = useRef(null)
  // Ezek csak követik a videót: az eseményei tartják őket naprakészen.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      // A play() egy Promise-t ad vissza: ha a videót nem lehet lejátszani, hibával zárul.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  let label = 'Lejátszás'
  let icon = 'play'
  if (ended) {
    label = 'Lejátszás újra'
    icon = 'replay'
  } else if (playing) {
    label = 'Szünet'
    icon = 'pause'
  }

  return (
    <div className="player">
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
      />

      <div className="player__controls">
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- Az `onPlay` a `playing`-et igazra állítja, és az `ended`-et hamisra, hiszen ami megy, az nincs a végén. Az `onPause`
  hamisra állítja a `playing`-et. A videó végén a böngésző előbb `pause`, aztán `ended` eseményt küld, így a végén a
  `playing` hamis, az `ended` igaz.
- A végén a gomb „Lejátszás újra” lesz, egy körbefutó nyíl ikonnal. Ha megnyomod, a `togglePlay` `play()`-t hív, és a
  böngésző a végére ért videót magától az elejéről indítja.
- A `label` és az `icon` nem állapot, hanem az állapotból kiszámolt [[származtatott érték]]: minden rajzoláskor újra
  kiszámoljuk őket. A `let` azért kell, mert az `if` utólag új értéket adhat nekik.
- A `play()` egy [[Promise]]-t ad vissza, mert a lejátszás nem azonnal indul: a böngészőnek előbb be kell töltenie egy
  darabot a videóból. Ha nem sikerül (nincs net, vagy a böngésző nem engedi), a böngésző elutasítja a Promise-t, és a
  konzolban egy piros „Uncaught (in promise)” hiba jelenne meg. A `.catch(() => {})` elkapja és csendben elengedi, ahogy az 5.
  leckében az [[elutasított Promise]]-oknál láttad. A betöltési hibát a következő lépésben rendesen kiírjuk.
- Az `onClick={togglePlay}` a videón azt jelenti, hogy a képre kattintás is elindítja és megállítja. Ez kényelmi
  funkció egérrel és ujjal; a billentyűzettel dolgozóknak ott a gomb.

:::check Ellenőrizd
Indítsd el a videót, aztán kattints magára a képre: megáll, és a gomb ikonja is visszavált ▶-re. Hagyd a végéig
futni: a gomb körbefutó nyílra vált. Nyomd meg: a videó az elejéről indul újra.
:::

:::mistake Gyakori hiba
`onPlay={setPlaying(true)}`, nyílfüggvény nélkül. Ez rajzolás közben azonnal meghívja a `setPlaying`-et, ami új
rajzolást kér, ami megint meghívja, és így tovább: a React végül „Too many re-renders” hibával megáll. Az eseménynek
egy függvényt kell adni, nem a függvény eredményét: `onPlay={() => setPlaying(true)}`.
:::

### Hol tartunk? Az idő

Egy lejátszón látszik, hol tartasz, és milyen hosszú a videó: „0:12 / 0:30”. Ehhez két tulajdonság kell:

- A `duration` a videó hossza másodpercben. Csak akkor derül ki, amikor a böngésző letöltötte a fájl elejét, a
  [[metaadatokat|metaadat]] (a hosszt, a képméretet). Ekkor `loadedmetadata` eseményt küld. Addig a `duration` értéke
  [[NaN]] („nem szám”, mindjárt megnézzük közelebbről).
- A `currentTime` az, hogy hol tart a lejátszás, szintén másodpercben (például `12.37`). Lejátszás közben a videó
  másodpercenként nagyjából négyszer küld `timeupdate` eseményt, és minden ugrás után is küld egyet.

A másodpercekből perc:másodperc lesz, pont úgy, mint a 13. lecke órájánál. Hozd létre az `src/formatTime.js` fájlt:

```js file=src/formatTime.js
// Másodpercekből perc:másodperc, például 75.4-ből „1:15”.
export function formatTime(seconds) {
  // Ha nem igazi szám (például egy még be nem töltött videó hossza), nullát mutatunk.
  if (!Number.isFinite(seconds)) return '0:00'
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const rest = String(whole % 60).padStart(2, '0')
  return `${minutes}:${rest}`
}
```

A `NaN` (Not a Number, „nem szám”) a JavaScript különleges értéke arra, ha egy számolásnak nincs értelmes eredménye.
A `Number.isFinite(x)` csak akkor igaz, ha `x` egy valódi, véges szám: a `NaN`-ra és a végtelenre (`Infinity`, ilyen
egy élő közvetítés hossza) hamis. A `Math.floor` levágja a tizedeseket, a `%` az osztás maradéka (a `75 % 60` értéke
15), a [[padStart]] pedig két jegyre egészíti ki a másodperceket: `'5'`-ből `'05'` lesz.

A lejátszó három új állapotot kap: az időt, a hosszt, és azt, hogy elromlott-e a betöltés. Itt az egész
`src/components/VideoPlayer.jsx`, a kezdő szint végén:

```jsx file=src/components/VideoPlayer.jsx mark=3,11-13,50-52,55-59,65-67
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'

function VideoPlayer({ src }) {
  // Egy doboz a valódi <video> elemnek: a React rajzolás után teszi bele.
  const videoRef = useRef(null)
  // Ezek csak követik a videót: az eseményei tartják őket naprakészen.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      // A play() egy Promise-t ad vissza: ha a videót nem lehet lejátszani, hibával zárul.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  let label = 'Lejátszás'
  let icon = 'play'
  if (ended) {
    label = 'Lejátszás újra'
    icon = 'replay'
  } else if (playing) {
    label = 'Szünet'
    icon = 'pause'
  }

  return (
    <div className="player">
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onTimeUpdate={() => setTime(videoRef.current.currentTime)}
        onError={() => setFailed(true)}
      />

      {failed && (
        <p className="player__error" role="alert">
          Nem sikerült betölteni a videót. Ellenőrizd az internetkapcsolatot, aztán töltsd újra az oldalt.
        </p>
      )}

      <div className="player__controls">
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
        <span className="player__time">
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- Az `onLoadedMetadata` akkor fut le, amikor kiderült a videó hossza: ekkor írjuk át a `duration`-t. Addig 0, így a
  kiírás „0:00”.
- Az `onTimeUpdate` minden `timeupdate`-nél beírja a `currentTime`-ot a `time` állapotba, és a React újrarajzolja az
  időt.
- Ha a videót nem sikerül letölteni, a videó `error` eseményt küld. Ekkor a `failed` igaz lesz, és megjelenik egy
  üzenet. A `role="alert"` miatt a képernyőolvasó rögtön felolvassa, bármit is csinált épp a felhasználó.

:::check Ellenőrizd
Az oldal betöltése után a gomb mellett „0:00 / 0:30” áll. Indítsd el: az első szám másodpercenként lép, és pont azt
mutatja, mint a számláló a kép jobb alsó sarkában. A kezdő szint kész: commitold!
:::

:::mistake Gyakori hiba
Kiírni közvetlenül a ref-ből: `{formatTime(videoRef.current.currentTime)}`. Az első rajzoláskor a doboz még üres, így
a konzol azt írja: „Cannot read properties of null (reading 'currentTime')”, és az oldal üres marad. És ha ezen túl is
jutna, a kiírt idő akkor sem lépne: a ref változása nem rajzol újra, az állapoté igen. Ami a képernyőn változik, az
állapotba kerül.
:::

:::try Próbáld ki
Írj el egy betűt a `videos.js`-ben lévő címben (például írj egy `x`-et a `.mp4` elé), és mentsd el: a kép alatt
megjelenik a sötétpiros hibaüzenet. Aztán javítsd vissza, és töltsd újra az oldalt (++F5++): az üzenet addig ott marad,
mert a `failed` állapotot semmi sem állítja vissza hamisra.
:::

## Középszint {level=2}

### Tekerősáv

A tekerősáv egy csúszka (`<input type="range">`), ami a lejátszás helyét mutatja, és ha elhúzod, oda ugrik a videó.
Ugyanolyan [[vezérelt mező]], mint a 3. lecke hosszcsúszkája: az értékét az állapotból kapja (`time`), és minden
mozdulatot jelez. A különlegessége, hogy a `currentTime` írható is: ha új értéket adsz neki, a videó odaugrik.

A sáv saját komponenst kap. Hozd létre az `src/components/SeekBar.jsx` fájlt:

```jsx file=src/components/SeekBar.jsx
import { formatTime } from '../formatTime.js'

function SeekBar({ time, duration, onSeek }) {
  // Hány százalékát játszottuk már le (ennyit színez türkizre a CSS).
  const progress = duration > 0 ? (time / duration) * 100 : 0

  return (
    <input
      type="range"
      className="seek"
      min="0"
      max={duration}
      step="any"
      value={time}
      disabled={duration === 0}
      onChange={(event) => onSeek(Number(event.target.value))}
      aria-label="Tekerés"
      aria-valuetext={`${formatTime(time)}, összesen ${formatTime(duration)}`}
      style={{ '--progress': `${progress}%` }}
    />
  )
}

export default SeekBar
```

- A csúszka 0-tól a videó hosszáig megy. A `step="any"` bármilyen értéket megenged, nem csak egész számokat, így a
  csúszka nem ugrál másodpercenként, hanem simán halad.
- Amíg a hossz nem ismert, a csúszka `disabled`: nincs hova tekerni.
- A képernyőolvasó magától a csúszka számát olvasná fel („12,37”), ami itt semmit sem mond. Az [[aria-valuetext]] egy
  emberi szöveget ad helyette: „0:12, összesen 0:30”.
- A `style={{ '--progress': … }}` egy [[CSS-változót|CSS-változó]] állít be [[inline stílussal|inline stílus]], ahogy
  a 13. leckében a `--columns` a tábla oszlopainak számát. Az `App.css` ebből tudja, meddig színezze türkizre a sávot.

A `VideoPlayer` két dolgot kap: egy `seek` függvényt, ami a csúszka értékét beírja a videóba, és a `<SeekBar>`-t a
vezérlősor elejére (a CSS magától külön sorba teszi, a gombok fölé). Az alábbi kódban a `…`-tal kezdődő megjegyzések a
változatlan részek helyén állnak: ott hagyd a régi kódot úgy, ahogy volt, magát a megjegyzést pedig ne írd be:

```jsx file=src/components/VideoPlayer.jsx mark=4,9-15,24
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'
import SeekBar from './SeekBar.jsx'

function VideoPlayer({ src }) {
  // … a ref, az állapotok és a togglePlay, ahogy eddig

  function seek(seconds) {
    videoRef.current.currentTime = seconds
    // Azonnal, hogy a csúszka ne ugorjon vissza a következő timeupdate-ig.
    setTime(seconds)
    // Egy ugrás után már nem vagyunk a végén.
    setEnded(false)
  }

  // … a label és az icon, ahogy eddig

  return (
    <div className="player">
      {/* … a videó és a hibaüzenet, ahogy eddig */}

      <div className="player__controls">
        <SeekBar time={time} duration={duration} onSeek={seek} />
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
        <span className="player__time">
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default VideoPlayer
```

Miért állítja a `seek` a `time`-ot is, ha a `timeupdate` úgyis megteszi? Mert az ugrás nem azonnali: a böngészőnek
előbb meg kell keresnie az új helyet a fájlban, és addig a régi idő jönne vissza. A csúszka a húzás közben
visszaugrálna. Az `ended`-et is visszaállítjuk: ha a végéről visszatekersz, a gomb újra „Lejátszás” legyen, ne
„Lejátszás újra”.

:::check Ellenőrizd
A gombok fölött megjelenik egy vékony vonal, rajta egy fehér pöttyel. Lejátszás közben a pötty halad, mögötte a vonal
türkizre színeződik. Húzd el a pöttyöt: a kép és az idő is odaugrik. A vonal bármely pontjára kattintva is odaugrik a
videó. Billentyűzettel: menj a csúszkára a ++Tab++-bal, és a nyilakkal kis lépésekben mozgathatod.
:::

:::mistake Gyakori hiba
A pötty a videó végén is csak a sáv harmadáig jut, pedig a türkiz csík már a végén van. Kimaradt a `max={duration}`:
egy csúszka magától 0-tól 100-ig megy, így a 30 másodperces videó vége, a 30, a sáv 30%-ánál van.
:::

### Hangerő és némítás

A videó hangereje a `volume` tulajdonság, 0 (néma) és 1 (teljes hangerő) között. A némítás külön tulajdonság, a
`muted`: ha igaz, nincs hang, de a `volume` megmarad, így a hang visszakapcsolásakor ugyanolyan hangos lesz, mint
előtte. Mindkettő változásakor a videó `volumechange` eseményt küld, és ugyanúgy követjük, mint a lejátszást: a videó
az igazságforrás, a React csak figyel.

A hangerő is saját komponenst kap: egy némítógombot és egy kis csúszkát. Hozd létre az
`src/components/VolumeControl.jsx` fájlt:

```jsx file=src/components/VolumeControl.jsx
import Icon from '../Icon.jsx'

function VolumeControl({ volume, muted, onVolumeChange, onToggleMute }) {
  // Némításkor a csúszka 0-n áll, de a hangerő megmarad, amikor visszajön a hang.
  const shown = muted ? 0 : volume

  return (
    <div className="volume">
      <button
        type="button"
        className="player__button"
        onClick={onToggleMute}
        aria-label="Némítás"
        aria-pressed={muted}
      >
        <Icon name={shown === 0 ? 'mute' : 'volume'} />
      </button>
      <input
        type="range"
        className="volume__slider"
        min="0"
        max="1"
        step="0.05"
        value={shown}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        aria-label="Hangerő"
        aria-valuetext={`${Math.round(shown * 100)}%`}
      />
    </div>
  )
}

export default VolumeControl
```

A lejátszógomb és a némítógomb két különböző, de egyaránt helyes mintát követ. A lejátszógomb a **nevét** cseréli
(„Lejátszás” vagy „Szünet”), mert mindig azt mondja, mi történik, ha megnyomod. A némítógomb neve mindig „Némítás”, és
az [[aria-pressed]] (a 13. leckéből ismerős) mondja meg, hogy be van-e nyomva: a képernyőolvasó így azt mondja,
„Némítás, kapcsológomb, lenyomva”. A kettőt ne keverd: egy lenyomott „Hang bekapcsolása” gomb már senkinek sem
egyértelmű. Az `App.css` a lenyomott gombot türkizre színezi.

A `VideoPlayer` két új állapotot és két új függvényt kap, a videó egy új eseményt, a vezérlősor pedig a
`<VolumeControl>`-t az idő után:

```jsx file=src/components/VideoPlayer.jsx mark=5,12-13,17-29,50-53,61-66
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'
import SeekBar from './SeekBar.jsx'
import VolumeControl from './VolumeControl.jsx'

function VideoPlayer({ src }) {
  // Egy doboz a valódi <video> elemnek: a React rajzolás után teszi bele.
  const videoRef = useRef(null)
  // Ezek csak követik a videót: az eseményei tartják őket naprakészen.
  // … a playing, az ended, a time, a duration és a failed, ahogy eddig
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)

  // … a togglePlay és a seek, ahogy eddig

  function changeVolume(value) {
    const video = videoRef.current
    video.volume = value
    // 0-n a videó némítva van, ha feljebb húzod, visszajön a hang.
    video.muted = value === 0
  }

  function toggleMute() {
    const video = videoRef.current
    // 0-s hangerőn a visszakapcsolás után is csend lenne, ezért ilyenkor félig felhangosítjuk.
    if (video.muted && video.volume === 0) video.volume = 0.5
    video.muted = !video.muted
  }

  // … a label és az icon, ahogy eddig

  return (
    <div className="player">
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onTimeUpdate={() => setTime(videoRef.current.currentTime)}
        onVolumeChange={() => {
          setVolume(videoRef.current.volume)
          setMuted(videoRef.current.muted)
        }}
        onError={() => setFailed(true)}
      />

      {/* … a hibaüzenet, ahogy eddig */}

      <div className="player__controls">
        {/* … a SeekBar, a lejátszógomb és az idő, ahogy eddig */}
        <VolumeControl
          volume={volume}
          muted={muted}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  )
}

export default VideoPlayer
```

A `changeVolume` és a `toggleMute` csak a videónak szól; az `onVolumeChange` olvassa vissza a videóból mindkét
értéket, és a csúszka meg az ikon ebből rajzolódik.

:::check Ellenőrizd
A sáv jobb oldalán egy hangszóró ikon és egy kis csúszka van. Húzd balra a csúszkát: halkul a hang, 0-n a hangszóró
mellett egy kis × jelenik meg. Kattints a hangszóróra: elnémul, a csúszka 0-ra ugrik, az ikon türkiz lesz. Kattints újra: a hang és a
csúszka is visszajön oda, ahol volt. Keskeny ablakban (telefonon) a csúszka eltűnik, csak a némítógomb marad. iPhone-on
a csúszka nem is működne: ott csak a telefon gombjai állítják a hangerőt.
:::

:::mistake Gyakori hiba
A csúszka meg sem mozdul, akárhogy húzod. Kimaradt az `onVolumeChange`: a `changeVolume` beírja az új hangerőt a
videóba, de senki nem írja vissza a `volume` állapotba, a vezérelt csúszka pedig mindig az állapot értékét mutatja,
vagyis az 1-et.
:::

### Lejátszási sebesség

Egy oktatóvideót gyorsabban, egy nehezebb részt lassabban néznél. A sebesség a `playbackRate` tulajdonság: az `1` a
rendes sebesség, a `2` a dupla, a `0.5` a fele. Ha változik, a videó `ratechange` eseményt küld. A böngészők gyorsításkor
a hangmagasságot megtartják, így a beszéd nem lesz „mókusos”.

A sebességet egy [[legördülő listából|legördülő lista]] választod, ahogy a 10. leckében a kategóriát. Hozd létre az
`src/components/SpeedSelect.jsx` fájlt:

```jsx file=src/components/SpeedSelect.jsx
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function SpeedSelect({ rate, onChange }) {
  return (
    <label className="speed">
      <span className="visually-hidden">Lejátszási sebesség</span>
      <select value={rate} onChange={(event) => onChange(Number(event.target.value))}>
        {SPEEDS.map((speed) => (
          <option key={speed} value={speed}>
            {speed}×
          </option>
        ))}
      </select>
    </label>
  )
}

export default SpeedSelect
```

A listának is kell név, de a sávban nincs hely egy kiírt címkének. A `visually-hidden` osztály (a 6. leckében már
találkoztál vele) a szemek elől elrejti a „Lejátszási sebesség” szöveget, de a képernyőolvasó felolvassa, és a `<label>`
ugyanúgy a listához köti. A `×` a szorzásjel: „1.5×” azt jelenti, másfélszeres sebesség.

A `VideoPlayer`-ben a szokásos három rész: egy állapot, egy függvény, ami szól a videónak, és egy esemény, ami
visszaolvassa. Az új `onRateChange` a `<video>` többi eseménye után, az `onError` elé kerül, a `<SpeedSelect>` pedig a
vezérlősor végére:

```jsx file=src/components/VideoPlayer.jsx mark=1,6,10-12,21,29
import SpeedSelect from './SpeedSelect.jsx'
// … a többi import, ahogy eddig

function VideoPlayer({ src }) {
  // … a ref és az eddigi állapotok, ahogy eddig
  const [rate, setRate] = useState(1)

  // … a togglePlay, a seek, a changeVolume és a toggleMute, ahogy eddig

  function changeRate(value) {
    videoRef.current.playbackRate = value
  }

  // … a label és az icon, ahogy eddig

  return (
    <div className="player">
      <video
        ref={videoRef}
        // … az attribútumok és az események az onVolumeChange-ig, ahogy eddig
        onRateChange={() => setRate(videoRef.current.playbackRate)}
        onError={() => setFailed(true)}
      />

      {/* … a hibaüzenet, ahogy eddig */}

      <div className="player__controls">
        {/* … a SeekBar, a lejátszógomb, az idő és a VolumeControl, ahogy eddig */}
        <SpeedSelect rate={rate} onChange={changeRate} />
      </div>
    </div>
  )
}

export default VideoPlayer
```

:::check Ellenőrizd
A hangszóró mellett egy „1×” feliratú kis doboz jelent meg. Válaszd a „2×”-t: a számláló a kép sarkában kétszer olyan
gyorsan pörög, és az idő is kétszer olyan gyorsan lép. A „0.5×”-nél lelassul. A listát billentyűzettel is használhatod:
++Tab++-bal menj rá, és a nyilakkal válassz.
:::

:::mistake Gyakori hiba
`<select value={rate} onChange={onChange}>`, vagyis a prop közvetlenül a listán. A konzol ezt írja: „Failed to set the
'playbackRate' property on 'HTMLMediaElement': The provided double value is non-finite.” A lista `onChange`-e az
eseményobjektumot adja tovább, nem a kiválasztott számot, és egy objektumból nem lesz sebesség. Az
`(event) => onChange(Number(event.target.value))` szedi ki belőle a számot.
:::

:::try Próbáld ki
Írj a `SPEEDS` tömb végére egy `20`-at, és válaszd ki: a konzolban hiba jelenik meg, és a sebesség nem változik. A
Chrome legfeljebb 16-szoros sebességet enged. Aztán vedd ki.
:::

### Teljes képernyő

A teljes képernyőt a [[Fullscreen API]] intézi. Bármelyik elemnek mondhatod: `elem.requestFullscreen()`, és az az elem
kitölti a képernyőt. Kilépni a `document.exitFullscreen()`-nel lehet, a `document.fullscreenElement` pedig megmondja,
melyik elem van épp teljes képernyőn (vagy `null`, ha egyik sem).

De melyik elem menjen teljes képernyőre? Ha a `<video>`, akkor a mi vezérlősávunk lemarad: teljes képernyőn legfeljebb
a böngésző saját gombjai jelennének meg. Ezért a csomagolót, a `<div className="player">`-t küldjük teljes képernyőre, benne a videóval és
a sávval együtt. Ehhez neki is kell egy ref. A teljes képernyős elem az `App.css`-ben a [[:fullscreen]]
[[pszeudoosztállyal|pszeudoosztály]] kap stílust (a pszeudoosztály, mint a `:hover` vagy a `:focus-visible`, nem
osztálynévre illeszkedik, hanem az elem egy állapotára): a kép kitölti a helyet, a sáv alul marad.

Az ++Esc++ billentyű is kiléptet, a mi gombunk nélkül. Ezért nem a gomb állítja a `fullscreen` állapotot, hanem a
böngésző `fullscreenchange` eseménye, amit a `document` küld, valahányszor változik a teljes képernyő. A `document`
a React világán kívül van, ezért egy effekt teszi fel a figyelőt, és a takarító függvény veszi le, ahogy a 2. leckében
a `matchMedia`-nál és a 7. leckében a billentyűknél:

```jsx file=src/components/VideoPlayer.jsx mark=1,5,7,10,14-28,30-37,42,47-54
import { useEffect, useRef, useState } from 'react'
// … a többi import, ahogy eddig

function VideoPlayer({ src }) {
  // Dobozok a valódi elemeknek: a React rajzolás után teszi beléjük őket.
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  // Ezek csak követik a videót: az eseményei tartják őket naprakészen.
  // … az eddigi állapotok, ahogy eddig
  const [fullscreen, setFullscreen] = useState(false)

  // … a togglePlay, a seek, a changeVolume, a toggleMute és a changeRate, ahogy eddig

  async function toggleFullscreen() {
    const player = playerRef.current
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (player.requestFullscreen) {
        await player.requestFullscreen()
      } else {
        // iPhone: ott csak maga a videó mehet teljes képernyőre, a telefon saját gombjaival.
        videoRef.current.webkitEnterFullscreen()
      }
    } catch {
      // A böngésző nemet mondott: a lejátszó egyszerűen marad, ahogy volt.
    }
  }

  // A teljes képernyőből a gombunk nélkül is ki lehet lépni (Esc), ezért a böngészőre figyelünk.
  useEffect(() => {
    function handleChange() {
      setFullscreen(document.fullscreenElement === playerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // … a label és az icon, ahogy eddig

  return (
    <div className="player" ref={playerRef}>
      {/* … a videó és a hibaüzenet, ahogy eddig */}

      <div className="player__controls">
        {/* … a SeekBar-tól a SpeedSelect-ig minden, ahogy eddig */}
        <button
          type="button"
          className="player__button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Kilépés a teljes képernyőből' : 'Teljes képernyő'}
        >
          <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- A `requestFullscreen` és az `exitFullscreen` is Promise-t ad vissza, mert a váltás eltart egy pillanatig, és a
  böngésző meg is tagadhatja. Ezért a `toggleFullscreen` [[async függvény]], `await`-tel és [[try/catch]]-csel, ahogy
  a 3. lecke másológombjánál.
- iPhone-on a `<div>`-eknek nincs `requestFullscreen` függvénye, a videónak viszont van egy saját függvénye, a
  `webkitEnterFullscreen`.
  Az `else if (player.requestFullscreen)` megnézi, létezik-e a függvény, mielőtt meghívná: ez a 4. leckéből ismerős
  [[funkcióészlelés]]. Ha egyik sincs, a hívás hibát dob, amit a `catch` elkap.
- Az effekt a `[]` miatt csak egyszer fut: egyszer teszi fel a figyelőt, és a takarító függvény akkor veszi le, amikor a
  lejátszó eltűnik az oldalról. A `handleChange` nem azt nézi, hogy van-e valami teljes képernyőn, hanem azt, hogy épp
  a mi lejátszónk van-e ott.

:::check Ellenőrizd
A sáv jobb szélén megjelent a négy sarkot mutató ikon. Kattints rá: a lejátszó kitölti az egész képernyőt, a kép középen, a
sáv alul, az ikon befelé mutató sarkokra vált. Kattints rá újra, vagy nyomd meg az ++Esc++-et: visszaáll minden, és
az ikon az ++Esc++ után is helyesen vált vissza.
:::

:::mistake Gyakori hiba
`videoRef.current.requestFullscreen()` a csomagoló helyett. A videó teljes képernyőre megy, de a mi vezérlősávunk
lemarad: Chrome-ban a böngésző saját gombjai jelennek meg, más böngészőben akár egy sem, a mieink közül pedig semmi, se a
sebességlista, se a teljes képernyős gombunk.
:::

:::concept Miért nem megy teljes képernyőre egy oldal magától?
A teljes képernyőt csak a felhasználó egy mozdulatára (kattintás, billentyűleütés) lehet kérni. Ha egy oldal magától,
például egy időzítőből próbálná, a böngésző elutasítja a Promise-t. Ez védelem: egy rosszindulatú oldal így nem tudja
váratlanul elfoglalni az egész képernyőt, és nem tud például egy hamis bejelentkezési ablakot rajzolni az egész
képernyőre.
:::

### Billentyűparancsok

Egy jó lejátszót egér nélkül is kényelmes használni. A videós oldalakon megszokott [[billentyűparancsok|billentyűparancs]]:
a ++Szóköz++ és a ++K++ elindítja vagy megállítja a videót, a ++←++ és a ++→++ 5 másodpercet ugrik, az ++M++ némít, az
++F++ teljes képernyőre vált.

A 7. leckében a szóköz az egész ablakon új palettát sorsolt: egy effekt tette fel a `keydown` figyelőt a `window`-ra,
a takarító függvény vette le, és a `preventDefault` kapcsolta ki a böngésző [[alapértelmezett viselkedését|alapértelmezett viselkedés]].
Most ugyanígy dolgozunk, de három dologra figyelnünk kell:

1. A [[módosítóbillentyűs|módosítóbillentyű]] kombinációk (++Ctrl++, ++Alt++, a Macen ++Cmd++) a böngészőéi: a
   ++Ctrl++ + ++F++ keresés, nem teljes képernyő. Ezeket békén hagyjuk, a böngésző intézi őket.
2. Ha a [[fókusz]] egy olyan elemen van, ami maga is használja a billentyűt, hagyjuk neki. A legördülő lista minden
   billentyűt használ, a csúszkák a nyilakat, egy gombot pedig a szóköz nyom meg. Ha a szóközt ott is mi kezelnénk, a
   `preventDefault` elnyelné a gombnyomást (ezt a 7. leckében láttad): a némító- vagy a teljes képernyős gombon (később
   a lista gombjain is) a szóköz nem a gombot nyomná meg, hanem a videót indítaná el vagy állítaná meg. Hogy min van a
   fókusz, az `event.target.tagName` mondja meg: az elem neve nagybetűvel, például `'BUTTON'`, `'INPUT'` vagy
   `'SELECT'`.
3. A `preventDefault` csak a mi billentyűinknél kell: a szóköz és a nyilak maguktól görgetnék az oldalt. A többi
   billentyű (például a ++Tab++) dolgozzon tovább a megszokott módon.

Kell még egy `seekBy` függvény is, ami az aktuális helyhez képest ugrik. Itt az egész `src/components/VideoPlayer.jsx`,
a középszint végén:

```jsx file=src/components/VideoPlayer.jsx mark=41-47,92-119
import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'
import SeekBar from './SeekBar.jsx'
import VolumeControl from './VolumeControl.jsx'
import SpeedSelect from './SpeedSelect.jsx'

function VideoPlayer({ src }) {
  // Dobozok a valódi elemeknek: a React rajzolás után teszi beléjük őket.
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  // Ezek csak követik a videót: az eseményei tartják őket naprakészen.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      // A play() egy Promise-t ad vissza: ha a videót nem lehet lejátszani, hibával zárul.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function seek(seconds) {
    videoRef.current.currentTime = seconds
    // Azonnal, hogy a csúszka ne ugorjon vissza a következő timeupdate-ig.
    setTime(seconds)
    // Egy ugrás után már nem vagyunk a végén.
    setEnded(false)
  }

  function seekBy(seconds) {
    const video = videoRef.current
    // Amíg a videó nem töltődött be, a hossza ismeretlen: nincs hova ugrani.
    if (!Number.isFinite(video.duration)) return
    // Se az eleje elé, se a vége után.
    seek(Math.min(Math.max(video.currentTime + seconds, 0), video.duration))
  }

  function changeVolume(value) {
    const video = videoRef.current
    video.volume = value
    // 0-n a videó némítva van, ha feljebb húzod, visszajön a hang.
    video.muted = value === 0
  }

  function toggleMute() {
    const video = videoRef.current
    // 0-s hangerőn a visszakapcsolás után is csend lenne, ezért ilyenkor félig felhangosítjuk.
    if (video.muted && video.volume === 0) video.volume = 0.5
    video.muted = !video.muted
  }

  function changeRate(value) {
    videoRef.current.playbackRate = value
  }

  async function toggleFullscreen() {
    const player = playerRef.current
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (player.requestFullscreen) {
        await player.requestFullscreen()
      } else {
        // iPhone: ott csak maga a videó mehet teljes képernyőre, a telefon saját gombjaival.
        videoRef.current.webkitEnterFullscreen()
      }
    } catch {
      // A böngésző nemet mondott: a lejátszó egyszerűen marad, ahogy volt.
    }
  }

  // A teljes képernyőből a gombunk nélkül is ki lehet lépni (Esc), ezért a böngészőre figyelünk.
  useEffect(() => {
    function handleChange() {
      setFullscreen(document.fullscreenElement === playerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // Billentyűparancsok az egész oldalon.
  useEffect(() => {
    function handleKeyDown(event) {
      // A Ctrl, Alt és Cmd kombinációk a böngészőéi (a Ctrl + F például keresés).
      if (event.ctrlKey || event.altKey || event.metaKey) return
      // Amit a fókuszban lévő elem maga is használ, az nála marad.
      const tag = event.target.tagName
      if (tag === 'SELECT') return
      if (tag === 'INPUT' && event.key.startsWith('Arrow')) return
      if (tag === 'BUTTON' && event.key === ' ') return
      // Lenyomva tartott billentyűnél a keydown ismétlődik: a nyilak tovább tekerhetnek, a többi csak egyszer számít
      // (de a lenyomva tartott szóköz közben se görgesse az oldalt).
      if (event.repeat && !event.key.startsWith('Arrow')) {
        if (event.key === ' ') event.preventDefault()
        return
      }

      if (event.key === ' ' || event.key === 'k' || event.key === 'K') togglePlay()
      else if (event.key === 'ArrowLeft') seekBy(-5)
      else if (event.key === 'ArrowRight') seekBy(5)
      else if (event.key === 'm' || event.key === 'M') toggleMute()
      else if (event.key === 'f' || event.key === 'F') toggleFullscreen()
      else return // nem a miénk: a böngésző azt csinálja vele, amit szokott
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  let label = 'Lejátszás'
  let icon = 'play'
  if (ended) {
    label = 'Lejátszás újra'
    icon = 'replay'
  } else if (playing) {
    label = 'Szünet'
    icon = 'pause'
  }

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onTimeUpdate={() => setTime(videoRef.current.currentTime)}
        onVolumeChange={() => {
          setVolume(videoRef.current.volume)
          setMuted(videoRef.current.muted)
        }}
        onRateChange={() => setRate(videoRef.current.playbackRate)}
        onError={() => setFailed(true)}
      />

      {failed && (
        <p className="player__error" role="alert">
          Nem sikerült betölteni a videót. Ellenőrizd az internetkapcsolatot, aztán töltsd újra az oldalt.
        </p>
      )}

      <div className="player__controls">
        <SeekBar time={time} duration={duration} onSeek={seek} />
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
        <span className="player__time">
          {formatTime(time)} / {formatTime(duration)}
        </span>
        <VolumeControl
          volume={volume}
          muted={muted}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
        />
        <SpeedSelect rate={rate} onChange={changeRate} />
        <button
          type="button"
          className="player__button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Kilépés a teljes képernyőből' : 'Teljes képernyő'}
        >
          <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- A `seekBy` a `Math.max(…, 0)`-val nem enged az elejénél korábbra, a `Math.min(…, video.duration)`-nal pedig a vége
  utánra (a 6. leckéből ismerős páros). A `Number.isFinite` a betöltés előtti `NaN` hosszt szűri ki.
- Az `event.key.startsWith('Arrow')` igaz, ha a billentyű neve `'Arrow'`-val kezdődik, vagyis mind a négy nyílra.
- Az `event.repeat` (a 7. és a 17. leckéből ismerős) akkor igaz, ha egy billentyűt lenyomva tartasz, és a `keydown`
  újra meg újra jön. A lejátszásnál, a némításnál és a teljes képernyőnél csak az első lenyomás számít, különben a videó
  villódzna; a lenyomva tartott nyíl viszont tovább ugorhat. A lenyomva tartott szóköz ilyenkor is kap
  `preventDefault`-ot, különben görgetne az oldal.
- A betűknél a kis- és a nagybetűt is figyeljük (`'k'` vagy `'K'`): bekapcsolt Caps Locknál az `event.key` nagybetű.
- Az `if … else if` láncban mindegyik ág egy parancsot hív. Ha egyik sem illik, az utolsó `else return` kilép, így a
  `preventDefault` csak a mi billentyűinknél fut le.

:::concept A closure most nem csap be
A 7. leckében láttad a [[closure]] csapdáját: az egyszer feltett figyelő az első rajzolás változóit látja, örökre. A
`handleKeyDown` is az első rajzoláskor készült, és az akkori `togglePlay`-t, `seekBy`-t, `toggleMute`-ot hívja. Ez itt
mégsem baj, mert ezek a függvények semmilyen állapotot nem olvasnak: mindent a videótól kérdeznek meg a
`videoRef.current`-en keresztül, és a ref dobozában mindig a mostani elem van. Ez is a „videó az igazságforrás”
előnye.
:::

Végül írjuk ki a parancsokat az oldalra is: amit senki nem talál meg, azt senki nem használja. Hozd létre az
`src/components/Shortcuts.jsx` fájlt:

```jsx file=src/components/Shortcuts.jsx
function Shortcuts() {
  return (
    <section className="shortcuts">
      <h2>Billentyűparancsok</h2>
      <dl>
        <div>
          <dt>
            <kbd>Szóköz</kbd> <kbd>K</kbd>
          </dt>
          <dd>lejátszás / szünet</dd>
        </div>
        <div>
          <dt>
            <kbd>←</kbd> <kbd>→</kbd>
          </dt>
          <dd>5 másodperc vissza / előre</dd>
        </div>
        <div>
          <dt>
            <kbd>M</kbd>
          </dt>
          <dd>hang ki / be</dd>
        </div>
        <div>
          <dt>
            <kbd>F</kbd>
          </dt>
          <dd>teljes képernyő</dd>
        </div>
      </dl>
    </section>
  )
}

export default Shortcuts
```

A [[leíró lista]] (`<dl>`) a 13. leckéből ismerős: a `<dt>` a billentyű, a `<dd>` a magyarázata. A
`<kbd>` elem egy billentyűt jelöl, az `App.css` billentyűsapkának rajzolja. Tedd ki a lejátszó alá; itt az egész
`src/App.jsx`:

```jsx file=src/App.jsx mark=3,15
import { VIDEO_SRC } from './videos.js'
import VideoPlayer from './components/VideoPlayer.jsx'
import Shortcuts from './components/Shortcuts.jsx'
import './App.css'

function App() {
  return (
    <main className="page">
      <header className="page__header">
        <h1>Popcorn Player</h1>
        <p>A video player with buttons of our own.</p>
      </header>

      <VideoPlayer src={VIDEO_SRC} />
      <Shortcuts />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A lejátszó alatt egy fehér dobozban ott a négy parancs. Kattints az oldal egy üres részére (így a fókusz egyik gombon
sincs), és nyomd meg a ++Szóköz++-t: a videó elindul, az oldal nem görget. A ++→++ 5 másodpercet ugrik előre, az ++M++
némít (a hangszóró türkiz lesz), az ++F++ teljes képernyőre vált, újra megnyomva pedig vissza. Most menj ++Tab++-bal a
hangerőcsúszkára: ott a nyilak a hangerőt állítják, nem tekernek. A sebességlistán a nyilak a sebességet váltják. A középszint kész:
commitold!
:::

:::mistake Gyakori hiba
`event.key === 'Space'`. A szóközre nem indul el a videó, legfeljebb az oldal görget egyet. A szóköz `event.key` értéke
egyetlen szóköz karakter: `' '`. A `'Space'` az `event.code`
értéke (a billentyű helye a billentyűzeten), amit a 7. leckében használtál. Ha nem vagy biztos egy billentyű nevében,
írd a `handleKeyDown` elejére: `console.log(event.key)`, és nyomd meg a billentyűt.
:::

:::try Feladat
A számbillentyűk ugorjanak a videó tizedeire, mint a videós oldalakon: a ++0++ az elejére, az ++5++ a felére, a ++9++ a
90%-ára. Egy új ág kell a lánc végére, az `else return` elé:
`else if (event.key >= '0' && event.key <= '9') seek(videoRef.current.duration * Number(event.key) / 10)`.
Vigyázz: a `duration` állapotot itt nem használhatod, mert a figyelő az első rajzoláskor készült, amikor még 0 volt.
A ref viszont mindig a mostani videót adja. (A haladó szint kódja e nélkül mutatja a láncot; ha megcsináltad, tartsd
meg az ágat.)
:::

## Haladó szint {level=3}

### Lejátszási lista

Egy [[lejátszási lista]] több videót sorol fel: rákattintasz egyre, és az indul; ha véget ér, magától jön a következő.
A lista maga csak adat: videók tömbje. Az oldalon egyelőre egyetlen mintaklip van, ezért a listánk ugyanazt a klipet
játssza, különböző pontokról indítva. Erre van egy szabványos trükk, a [[médiafragmens]]: ha egy videó címe végére
`#t=10`-et írsz, a böngésző a 10. másodperctől indítja. Hozd létre az `src/playlist.js` fájlt:

```js file=src/playlist.js
import { VIDEO_SRC } from './videos.js'

// Az oldalon egyelőre egy mintaklip van, ezért a lista különböző pontokról játssza:
// a cím végén a „#t=10” azt jelenti, hogy „a 10. másodperctől”.
export const PLAYLIST = [
  { id: 'whole', title: 'A teljes mintaklip', src: VIDEO_SRC },
  { id: 'from-10', title: 'A 10. másodperctől', src: `${VIDEO_SRC}#t=10` },
  { id: 'last-10', title: 'Az utolsó tíz másodperc', src: `${VIDEO_SRC}#t=20` },
]
```

Minden klipnek van egy egyedi `id`-je, egy `title`-je (címe) és egy `src`-je. Ha vannak saját videóid, tedd őket a
`public` mappába, és sorold fel őket ide a saját fájlnevükkel (`src: '/my-video.mp4'`).

A lista megjelenítése saját komponens. Hozd létre az `src/components/Playlist.jsx` fájlt:

```jsx file=src/components/Playlist.jsx
function Playlist({ clips, current, onSelect }) {
  return (
    <section className="playlist">
      <h2>Lejátszási lista</h2>
      <ol>
        {clips.map((clip, index) => (
          <li key={clip.id}>
            <button
              type="button"
              className="playlist__item"
              aria-current={index === current}
              onClick={() => onSelect(index)}
            >
              <span className="playlist__number">{index + 1}</span>
              {clip.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Playlist
```

Minden klip egy gomb a számozott listában (`<ol>`). Az [[aria-current]] megjelöli azt, amelyik épp megy: a
képernyőolvasó „aktuális”-nak mondja, az `App.css` pedig kiemeli. A `current` a lejátszott klip helye a tömbben, és az
`onSelect` jelzi, ha valaki egy másikat választott.

Hogy melyik klip megy, az az `App` állapotában van, mert a listának és a lejátszónak is tudnia kell: ez az
[[állapot felemelése]] a 3. leckéből, az állapot a legközelebbi közös szülőben él. Itt az egész `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,5,9-23,32-34
import { useState } from 'react'
import { PLAYLIST } from './playlist.js'
import VideoPlayer from './components/VideoPlayer.jsx'
import Shortcuts from './components/Shortcuts.jsx'
import Playlist from './components/Playlist.jsx'
import './App.css'

function App() {
  // Melyik klip megy a listából: a helye a PLAYLIST tömbben.
  const [current, setCurrent] = useState(0)
  // Az első klip kattintásra vár; utána a kiválasztott klip magától indul.
  const [autoPlay, setAutoPlay] = useState(false)
  const clip = PLAYLIST[current]

  function select(index) {
    setCurrent(index)
    setAutoPlay(true)
  }

  function playNext() {
    // Az utolsó klip után a lista megáll.
    if (current + 1 < PLAYLIST.length) select(current + 1)
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1>Popcorn Player</h1>
        <p>A video player with buttons of our own.</p>
      </header>

      {/* A key miatt minden klip vadonatúj lejátszót kap, friss állapottal. */}
      <VideoPlayer key={clip.id} clip={clip} autoPlay={autoPlay} onEnded={playNext} />
      <Playlist clips={PLAYLIST} current={current} onSelect={select} />
      <Shortcuts />
    </main>
  )
}

export default App
```

- A `VIDEO_SRC` importja eltűnt az `App`-ból: a videófájlok címei mostantól a listában vannak. A lejátszó egy egész klipet kap
  (`clip`), nem csak egy címet.
- A `key={clip.id}` a legfontosabb sor. A 3. leckében a másológomb kapott így `key`-t: ha a [[key]] megváltozik, a
  React a régi komponenst eldobja, és vadonatújat rak a helyére, friss állapottal és friss `<video>` elemmel. Klipváltáskor
  pont ez kell: nulláról indul az idő, a hossz, a „Lejátszás újra” állapot, és minden más is.
- Az `autoPlay` prop a `<video>` elem `autoPlay` attribútumát ([[automatikus lejátszás]]) kapcsolja be: az ilyen videó
  magától elindul, amint betöltődött. Az első klipnél hamis, mert a böngészők nem engedik, hogy egy oldal megnyitáskor
  magától hangosan elinduljon: csak azután, hogy a látogató már kattintott valamire az oldalon. Ezért csak az első
  választáskor vált igazra.
- A `playNext` az utolsó klip után nem lép tovább, mert a `PLAYLIST[3]` már nem létezik: a három klip a 0., az 1. és
  a 2. helyen van.

A `VideoPlayer`-ben csak a függvény első sora és a `<video>` eleje változik: a propok között a `src` helyett ott a
`clip`, az `autoPlay` és az `onEnded`, a videó pedig a klip `src`-jét kapja, és a végén szól az `App`-nak. Az importok
maradnak, ahogy eddig (a következő lépésekben is), és a fájl végén az `export default VideoPlayer` is:

```jsx file=src/components/VideoPlayer.jsx mark=1,9-10,19-22
function VideoPlayer({ clip, autoPlay, onEnded }) {
  // … a refek, az állapotok, a függvények és az effektek, ahogy eddig

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        className="player__video"
        src={clip.src}
        autoPlay={autoPlay}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setEnded(true)
          onEnded()
        }}
        // … a többi esemény, ahogy eddig
      />

      {/* … a hibaüzenet és a vezérlősor, ahogy eddig */}
    </div>
  )
}

export default VideoPlayer
```

Figyelj, itt is két `onEnded` van, mint a 3. leckében a két `onChange`: a `<video onEnded={…}>` a böngésző eseményére
figyel, a benne meghívott `onEnded()` pedig az `App`-tól kapott prop, vagyis a `playNext`.

A prop neve azért `clip`, és nem `video`, mert a függvényekben a `const video = videoRef.current` már a `<video>`
elemet jelenti: két különböző dolog ne viselje ugyanazt a nevet.

:::check Ellenőrizd
A lejátszó alatt megjelenik a „Lejátszási lista” három klippel, az első kiemelve. Kattints a másodikra: kiemelődik, és
a videó magától indul, a sarokban a számláló „10 s”-tól számol. Tekerd a végéhez közel, és hagyd lejárni: magától
jön a harmadik, 20 másodperctől. A harmadik után a lista megáll. Klipváltáskor a hangerő és a sebesség is
alaphelyzetbe áll vissza: ezt is a `key` csinálja.
:::

:::mistake Gyakori hiba
A `playNext` ellenőrzés nélkül: `select(current + 1)`. Az utolsó klip végén az oldal elfehéredik, a konzolban:
„Cannot read properties of undefined (reading 'id')”. A `PLAYLIST[3]` nem létezik, így a `clip` `undefined` lesz.
:::

:::try Feladat
Tegyél a lejátszó fölé egy „Következő” gombot, ami a `playNext`-et hívja, és legyen `disabled`, ha az utolsó klip megy.
:::

### Feliratok

A [[feliratok|felirat]] nem csak idegen nyelvű filmekhez kellenek. Siket és nagyothalló nézők így követik a videót,
és mindenki más is hasznát veszi: a buszon, hangos helyen, vagy ha alszik mellette valaki. Az akadálymentességi
irányelvek ([[WCAG]]) elő is írják őket a hangot is tartalmazó, előre felvett videókhoz.

A böngészők a [[WebVTT]] formátumot értik: egy sima szövegfájl, `.vtt` kiterjesztéssel. Hozz létre egy `public`
mappát a projekt gyökerében (az `src` mellett), ha még nincs, benne egy `captions.vtt` fájlt:

```text file=public/captions.vtt
WEBVTT

00:01.000 --> 00:04.500
Szia! Ezek a feliratok egy WebVTT-fájlból jönnek.

00:05.000 --> 00:09.500
Ez a sor 0:05-kor jelenik meg, és 0:09-kor tűnik el.

00:10.000 --> 00:14.500
Minden feliratnak van kezdő és záró időpontja.

00:15.000 --> 00:19.500
Ugorj vissza a ← billentyűvel: a sorok is visszajönnek.

00:20.000 --> 00:24.500
A saját soraidat a public/captions.vtt fájlba írd.

00:25.000 --> 00:29.500
Ennyi volt. Köszönöm, hogy megnézted!
```

Az első sor mindig `WEBVTT`. Utána üres sorokkal elválasztott darabok jönnek, ezek a [[cue]]-k: az első soruk az, hogy
mettől meddig látszik (perc:másodperc.ezredmásodperc), alatta a szöveg. A sorok direkt magukról beszélnek, így
bármilyen videóhoz illenek.

A klipek kapnak egy `captions` mezőt a felirat címével. Itt az egész `src/playlist.js`:

```js file=src/playlist.js mark=6-8
import { VIDEO_SRC } from './videos.js'

// Az oldalon egyelőre egy mintaklip van, ezért a lista különböző pontokról játssza:
// a cím végén a „#t=10” azt jelenti, hogy „a 10. másodperctől”.
export const PLAYLIST = [
  { id: 'whole', title: 'A teljes mintaklip', src: VIDEO_SRC, captions: '/captions.vtt' },
  { id: 'from-10', title: 'A 10. másodperctől', src: `${VIDEO_SRC}#t=10`, captions: '/captions.vtt' },
  { id: 'last-10', title: 'Az utolsó tíz másodperc', src: `${VIDEO_SRC}#t=20`, captions: '/captions.vtt' },
]
```

A feliratfájlt egy `<track>` elem köti a videóhoz, ami a `<video>` **belsejébe** kerül. Ezért a `<video>` most kap egy
záró tagot: `<video …>…</video>`. A böngésző minden `<track>`-ből egy [[szövegsávot|szövegsáv]] készít, és ezek a videó
`textTracks` listájában vannak. Egy szövegsáv `mode`-ja (módja) háromféle lehet: `'showing'` (látszik), `'hidden'` (betöltve,
de nem látszik) és `'disabled'` (ki van kapcsolva). A feliratgomb ezt váltogatja.

```jsx file=src/components/VideoPlayer.jsx mark=3,7-13,23-25,31-41
function VideoPlayer({ clip, autoPlay, onEnded }) {
  // … a refek és az eddigi állapotok, ahogy eddig
  const [captionsOn, setCaptionsOn] = useState(false)

  // … a togglePlay, a seek, a seekBy, a changeVolume, a toggleMute, a changeRate és a toggleFullscreen, ahogy eddig

  function toggleCaptions() {
    // A videó első (és egyetlen) szövegsávja.
    const track = videoRef.current.textTracks[0]
    const show = track.mode !== 'showing'
    track.mode = show ? 'showing' : 'hidden'
    setCaptionsOn(show)
  }

  // … az effektek, a label és az icon, ahogy eddig

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        // … az attribútumok és az események, ahogy eddig
        onError={() => setFailed(true)}
      >
        {clip.captions && <track kind="subtitles" src={clip.captions} srcLang="hu" label="Magyar" />}
      </video>

      {/* … a hibaüzenet, ahogy eddig */}

      <div className="player__controls">
        {/* … a SeekBar-tól a SpeedSelect-ig minden, ahogy eddig */}
        {clip.captions && (
          <button
            type="button"
            className="player__button"
            onClick={toggleCaptions}
            aria-label="Feliratok"
            aria-pressed={captionsOn}
          >
            <Icon name="captions" />
          </button>
        )}
        {/* … a teljes képernyős gomb, ahogy eddig */}
      </div>
    </div>
  )
}

export default VideoPlayer
```

- A `<track>` attribútumai: a `kind="subtitles"` azt mondja, hogy felirat, a `src` a fájl címe, a `srcLang` a nyelve
  (`hu`), a `label` pedig a neve, ha a böngésző menüben mutatná.
- A `{clip.captions && …}` [[feltételes megjelenítés]]: ha egy klipnek nincs felirata, se `<track>`, se gomb nem jelenik
  meg.
- A feliratot maga a böngésző rajzolja a kép aljára, mi csak ki-be kapcsoljuk. A kinézetét a [[::cue]] [[pszeudoelem]]
  adja meg (a pszeudoelemmel egy elem olyan részét formázhatod, aminek nincs saját címkéje a kódodban; a `::cue` a
  feliratszöveg, amit a böngésző a videóra rajzol): az `App.css`-ben a `.player__video::cue` szabály adja a sötét
  hátteret.
- A gomb ugyanazt a mintát követi, mint a némítás: a neve mindig „Feliratok”, és az `aria-pressed` mondja meg, be van-e
  kapcsolva.

:::check Ellenőrizd
A sebesség mellett megjelent egy „CC” ikon. Kattints rá (türkiz lesz), és indítsd el a videót: a kép alján felirat
jelenik meg, 0:01-kor az első sor, 0:05-kor a második. Tekerj vissza: a sorok is visszajönnek. Kattints újra a „CC”-re:
a felirat eltűnik. Teljes képernyőn is látszik.
:::

:::mistake Gyakori hiba
Nem jelenik meg felirat, és hibaüzenet sincs. Két gyakori ok: a fájl az `src` mappában van a `public` helyett (a
böngésző nem találja), vagy az első sora nem pontosan `WEBVTT` (például hiányzik, vagy előtte üres sor van). A második
esetben a böngésző szó nélkül eldobja az egész fájlt. A böngésző fejlesztői eszközeinek Network (Hálózat) fülén
kattints a `captions.vtt` sorra: ha a válaszban `WEBVTT` helyett egy HTML-oldal (`<!doctype html>…`) áll, a Vite nem
találta a fájlt a `public` mappában.
:::

:::try Próbáld ki
Írd egy cue időpontja mögé, ugyanabba a sorba: `line:10%`. Például `00:10.000 --> 00:14.500 line:10%`. Az a sor a kép
tetején jelenik meg, nem az alján: így lehet elvinni a feliratot az útból, ha a videóban lent épp felirat vagy fontos
kép van.
:::

:::concept Kétféle felirat: subtitles vagy captions?
A `kind` lehet `subtitles` vagy `captions` is. A `subtitles` a kimondott szöveg azoknak, akik hallják a hangot, csak
nem értik vagy nem tudják felhangosítani, például egy fordítás. A `captions` a siket és nagyothalló nézőknek szól, ezért
a hangokat is leírja: „[halk zene]”, „[ajtócsapódás]”. A böngésző mindkettőt ugyanúgy rajzolja ki; a különbség az,
hogy mit írsz bele. Egy igazi videóhoz, amiben beszélnek, érdemes `captions`-t készíteni.
:::

### Folytatás ott, ahol abbahagytad

Ha félbehagysz egy videót, és később visszajössz, jó, ha ott folytatódik, ahol abbahagytad. Ehhez a lejátszás helyét
el kell menteni a [[localStorage]]-ba, és betöltéskor visszaugrani oda. A 9. lecke óta tudod, hogy a `localStorage`
egyszerű kulcs–érték tár a böngészőben, ami túléli az újratöltést, és hogy minden használata `try/catch`-be kerül,
mert a böngésző letilthatja.

Ez a logika egy [[saját hook]]ba kerül, ahogy a 9. leckében a `useLocalStorage`: egy `use`-zal kezdődő függvény, ami
más hookokat használ. A hook megkapja a videó ref-jét és egy kulcsot, ami alatt a `localStorage`-ba ment, és egy
objektumot ad vissza: benne a `resumedAt` állapotot és három függvényt. A `restore` visszaugrik a mentett helyre, a
`save` elmenti a mostanit, a `startOver` pedig az elejére állít. Hozd létre az `src/useResumePosition.js` fájlt:

```js file=src/useResumePosition.js
import { useState } from 'react'

// A mentett hely másodpercben; 0, ha nincs (vagy a tár le van tiltva).
function readPosition(key) {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

function writePosition(key, seconds) {
  try {
    if (seconds > 0) localStorage.setItem(key, String(Math.floor(seconds)))
    else localStorage.removeItem(key)
  } catch {
    // Letiltott tár: legközelebb a videó egyszerűen az elejéről indul.
  }
}

// Megjegyzi, hol tart a néző egy videóban, és legközelebb oda viszi vissza.
function useResumePosition(videoRef, storageKey) {
  // Ahonnan folytattuk (másodpercben), vagy null, ha a videó az elejéről indult.
  const [resumedAt, setResumedAt] = useState(null)

  // Akkor hívd, amikor kiderült a videó hossza (loadedmetadata): csak ekkor tud ugrani.
  function restore() {
    const video = videoRef.current
    const saved = readPosition(storageKey)
    // Az első és az utolsó másodpercben nincs mit folytatni.
    if (saved > 1 && saved < video.duration - 1) {
      video.currentTime = saved
      setResumedAt(saved)
    }
  }

  // Minden timeupdate-nél hívd: amíg a videó megy, felírjuk, hol tart.
  function save() {
    const video = videoRef.current
    if (video.ended) writePosition(storageKey, 0)
    else if (!video.paused) writePosition(storageKey, video.currentTime)
  }

  function startOver() {
    videoRef.current.currentTime = 0
    writePosition(storageKey, 0)
    setResumedAt(null)
  }

  return { resumedAt, restore, save, startOver }
}

export default useResumePosition
```

- A `localStorage` csak szöveget tárol, ezért a `Number(…)` számmá alakítja. Ha nincs mentés, a `getItem` `null`-t ad,
  amiből `Number(null)`, vagyis 0 lesz; ha valami értelmetlen van ott, `NaN`. A `|| 0` mindkettőből biztosan 0-t csinál.
- A `restore` csak a `loadedmetadata` után működhet: előtte a `duration` `NaN`, és ugrani sem lehet. Az első és az
  utolsó másodpercre nem ugrik vissza, mert ott nincs mit folytatni.
- A `save` csak lejátszás közben ment. A videó végén pedig törli a mentést, hogy legközelebb az elejéről induljon.
- A `startOver` nemcsak az elejére áll vissza, hanem a mentést is törli, különben egy újratöltés után megint a régi
  helyről folytatódna.
- A `resumedAt` állapot azért kell, hogy a lejátszó ki tudja írni: innen folytattuk.

A `VideoPlayer` klipenként külön kulcsot ad a hooknak (`popcorn-player:whole`, `popcorn-player:from-10`, …), hogy minden
klip a saját helyét jegyezze meg. A hook `restore`-ja akkor fut, amikor a videó betöltődött, a `save`-je pedig minden
időfrissítéskor; a sáv fölött egy csík jelenik meg, ha folytattunk:

```jsx file=src/components/VideoPlayer.jsx mark=1,6,15-22,30-37
import useResumePosition from '../useResumePosition.js'
// … a többi import, ahogy eddig

function VideoPlayer({ clip, autoPlay, onEnded }) {
  // … a refek és az állapotok, ahogy eddig
  const resume = useResumePosition(videoRef, `popcorn-player:${clip.id}`)

  // … a függvények, az effektek, a label és az icon, ahogy eddig

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        // … az attribútumok és az események az onEnded-ig, ahogy eddig
        onLoadedMetadata={() => {
          setDuration(videoRef.current.duration)
          resume.restore()
        }}
        onTimeUpdate={() => {
          setTime(videoRef.current.currentTime)
          resume.save()
        }}
        // … az onVolumeChange, az onRateChange és az onError, ahogy eddig
      >
        {/* … a <track>, ahogy eddig */}
      </video>

      {/* … a hibaüzenet, ahogy eddig */}

      {resume.resumedAt !== null && (
        <p className="player__notice" role="status">
          Ott folytatod, ahol abbahagytad: {formatTime(resume.resumedAt)}.
          <button type="button" onClick={resume.startOver}>
            Előről
          </button>
        </p>
      )}

      {/* … a vezérlősor, ahogy eddig */}
    </div>
  )
}

export default VideoPlayer
```

A `resume` egy objektum, amit a hook visszaadott: a `resume.restore()` hívja a hook `restore` függvényét, a
`resume.resumedAt` a hook állapota. A `role="status"` udvariasan, a mostani mondat végét megvárva olvastatja fel a
csíkot a képernyőolvasóval.

:::check Ellenőrizd
Indítsd el az első klipet, várd meg, amíg 0:12 körül jár, és frissítsd az oldalt (++F5++). A lejátszó nem 0:00-n áll,
hanem ott, ahol abbahagytad: a sáv fölött egy csík írja, „Ott folytatod, ahol abbahagytad: 0:12.”, mellette egy „Előről”
gombbal. Kattints rá: az idő 0:00, a csík eltűnik. A mentéseket a fejlesztői eszközökben is látod: ++F12++ →
Application (Alkalmazás) → Local Storage, `popcorn-player:` kezdetű kulcsokkal.
:::

:::mistake Gyakori hiba
A visszaugrást egy `useEffect`-be tenni, ami a komponens megjelenésekor fut. Semmi sem történik: ilyenkor a videó még
nem töltötte be a metaadatait, a `duration` `NaN`, és a `NaN`-nal minden összehasonlítás hamis (a `saved < NaN - 1`
is). A videó maga szól, amikor kész: az `onLoadedMetadata` a helye.
:::

### Kép a képben

A [[kép a képben]] mód (angolul picture-in-picture, röviden PiP) a videót egy kis, lebegő ablakba teszi, ami minden más
fölött marad: nézheted,
miközben egy másik lapon vagy programban dolgozol. A [[Picture-in-Picture API]] a `video.requestPictureInPicture()`
függvénnyel indítja, a `document.exitPictureInPicture()`-rel zárja, a `document.pictureInPictureElement` pedig
megmondja, melyik videó van épp a kis ablakban.

Nem minden böngésző tudja: a Firefox például a saját gombjával kínálja, de az oldalaknak nem ad hozzá függvényt. A
`document.pictureInPictureEnabled` igaz, ha az oldal használhatja. Ha nem, a gombot meg sem mutatjuk: ez megint
funkcióészlelés.

A kis ablakot a felhasználó a saját bezárógombjával is becsukhatja. Hogy a gombunk ezt is kövesse, a videó két
eseményére figyelünk: `enterpictureinpicture` és `leavepictureinpicture`. Ezekhez a React nem ad `on…` propot (nem
ismer minden eseményt), ezért egy effekt tesz rájuk figyelőt `addEventListener`-rel, ahogy a `fullscreenchange`-re.
Itt az egész `src/components/VideoPlayer.jsx`, a lecke végén:

```jsx file=src/components/VideoPlayer.jsx mark=9-10,27,98-108,119-134,253-263
import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'
import useResumePosition from '../useResumePosition.js'
import SeekBar from './SeekBar.jsx'
import VolumeControl from './VolumeControl.jsx'
import SpeedSelect from './SpeedSelect.jsx'

// Tud-e ez a böngésző kis, lebegő ablakba tenni egy videót?
const CAN_PIP = document.pictureInPictureEnabled === true

function VideoPlayer({ clip, autoPlay, onEnded }) {
  // Dobozok a valódi elemeknek: a React rajzolás után teszi beléjük őket.
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  // Ezek csak követik a videót: az eseményei tartják őket naprakészen.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(false)
  const [pip, setPip] = useState(false)
  const resume = useResumePosition(videoRef, `popcorn-player:${clip.id}`)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      // A play() egy Promise-t ad vissza: ha a videót nem lehet lejátszani, hibával zárul.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function seek(seconds) {
    videoRef.current.currentTime = seconds
    // Azonnal, hogy a csúszka ne ugorjon vissza a következő timeupdate-ig.
    setTime(seconds)
    // Egy ugrás után már nem vagyunk a végén.
    setEnded(false)
  }

  function seekBy(seconds) {
    const video = videoRef.current
    // Amíg a videó nem töltődött be, a hossza ismeretlen: nincs hova ugrani.
    if (!Number.isFinite(video.duration)) return
    // Se az eleje elé, se a vége után.
    seek(Math.min(Math.max(video.currentTime + seconds, 0), video.duration))
  }

  function changeVolume(value) {
    const video = videoRef.current
    video.volume = value
    // 0-n a videó némítva van, ha feljebb húzod, visszajön a hang.
    video.muted = value === 0
  }

  function toggleMute() {
    const video = videoRef.current
    // 0-s hangerőn a visszakapcsolás után is csend lenne, ezért ilyenkor félig felhangosítjuk.
    if (video.muted && video.volume === 0) video.volume = 0.5
    video.muted = !video.muted
  }

  function changeRate(value) {
    videoRef.current.playbackRate = value
  }

  async function toggleFullscreen() {
    const player = playerRef.current
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (player.requestFullscreen) {
        await player.requestFullscreen()
      } else {
        // iPhone: ott csak maga a videó mehet teljes képernyőre, a telefon saját gombjaival.
        videoRef.current.webkitEnterFullscreen()
      }
    } catch {
      // A böngésző nemet mondott: a lejátszó egyszerűen marad, ahogy volt.
    }
  }

  function toggleCaptions() {
    // A videó első (és egyetlen) szövegsávja.
    const track = videoRef.current.textTracks[0]
    const show = track.mode !== 'showing'
    track.mode = show ? 'showing' : 'hidden'
    setCaptionsOn(show)
  }

  async function togglePip() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch {
      // Például ha a videó még nem töltődött be: a böngésző nemet mond.
    }
  }

  // A teljes képernyőből a gombunk nélkül is ki lehet lépni (Esc), ezért a böngészőre figyelünk.
  useEffect(() => {
    function handleChange() {
      setFullscreen(document.fullscreenElement === playerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // A kis ablakot a saját X-ével is be lehet zárni, ezért a videóra figyelünk.
  useEffect(() => {
    const video = videoRef.current
    function handleEnter() {
      setPip(true)
    }
    function handleLeave() {
      setPip(false)
    }
    video.addEventListener('enterpictureinpicture', handleEnter)
    video.addEventListener('leavepictureinpicture', handleLeave)
    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnter)
      video.removeEventListener('leavepictureinpicture', handleLeave)
    }
  }, [])

  // Billentyűparancsok az egész oldalon.
  useEffect(() => {
    function handleKeyDown(event) {
      // A Ctrl, Alt és Cmd kombinációk a böngészőéi (a Ctrl + F például keresés).
      if (event.ctrlKey || event.altKey || event.metaKey) return
      // Amit a fókuszban lévő elem maga is használ, az nála marad.
      const tag = event.target.tagName
      if (tag === 'SELECT') return
      if (tag === 'INPUT' && event.key.startsWith('Arrow')) return
      if (tag === 'BUTTON' && event.key === ' ') return
      // Lenyomva tartott billentyűnél a keydown ismétlődik: a nyilak tovább tekerhetnek, a többi csak egyszer számít
      // (de a lenyomva tartott szóköz közben se görgesse az oldalt).
      if (event.repeat && !event.key.startsWith('Arrow')) {
        if (event.key === ' ') event.preventDefault()
        return
      }

      if (event.key === ' ' || event.key === 'k' || event.key === 'K') togglePlay()
      else if (event.key === 'ArrowLeft') seekBy(-5)
      else if (event.key === 'ArrowRight') seekBy(5)
      else if (event.key === 'm' || event.key === 'M') toggleMute()
      else if (event.key === 'f' || event.key === 'F') toggleFullscreen()
      else return // nem a miénk: a böngésző azt csinálja vele, amit szokott
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  let label = 'Lejátszás'
  let icon = 'play'
  if (ended) {
    label = 'Lejátszás újra'
    icon = 'replay'
  } else if (playing) {
    label = 'Szünet'
    icon = 'pause'
  }

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        className="player__video"
        src={clip.src}
        autoPlay={autoPlay}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setEnded(true)
          onEnded()
        }}
        onLoadedMetadata={() => {
          setDuration(videoRef.current.duration)
          resume.restore()
        }}
        onTimeUpdate={() => {
          setTime(videoRef.current.currentTime)
          resume.save()
        }}
        onVolumeChange={() => {
          setVolume(videoRef.current.volume)
          setMuted(videoRef.current.muted)
        }}
        onRateChange={() => setRate(videoRef.current.playbackRate)}
        onError={() => setFailed(true)}
      >
        {clip.captions && <track kind="subtitles" src={clip.captions} srcLang="hu" label="Magyar" />}
      </video>

      {failed && (
        <p className="player__error" role="alert">
          Nem sikerült betölteni a videót. Ellenőrizd az internetkapcsolatot, aztán töltsd újra az oldalt.
        </p>
      )}

      {resume.resumedAt !== null && (
        <p className="player__notice" role="status">
          Ott folytatod, ahol abbahagytad: {formatTime(resume.resumedAt)}.
          <button type="button" onClick={resume.startOver}>
            Előről
          </button>
        </p>
      )}

      <div className="player__controls">
        <SeekBar time={time} duration={duration} onSeek={seek} />
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
        <span className="player__time">
          {formatTime(time)} / {formatTime(duration)}
        </span>
        <VolumeControl
          volume={volume}
          muted={muted}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
        />
        <SpeedSelect rate={rate} onChange={changeRate} />
        {clip.captions && (
          <button
            type="button"
            className="player__button"
            onClick={toggleCaptions}
            aria-label="Feliratok"
            aria-pressed={captionsOn}
          >
            <Icon name="captions" />
          </button>
        )}
        {CAN_PIP && (
          <button
            type="button"
            className="player__button"
            onClick={togglePip}
            aria-label="Kép a képben"
            aria-pressed={pip}
          >
            <Icon name="pip" />
          </button>
        )}
        <button
          type="button"
          className="player__button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Kilépés a teljes képernyőből' : 'Teljes képernyő'}
        >
          <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- A `CAN_PIP` a komponensen kívül van, ezért csak egyszer számoljuk ki, amikor a fájl betöltődik: a böngésző tudása
  közben nem változik.
- A PiP effekt az elején kiveszi a videót a dobozból (`const video = videoRef.current`), és a takarító függvény is ezt
  a változót használja. Így biztosan ugyanarról az elemről veszi le a figyelőket, amelyikre feltette.
- A `togglePip` ugyanúgy épül fel, mint a `toggleFullscreen`: Promise, `await`, `try/catch`.

:::check Ellenőrizd
Chrome-ban és Edge-ben a „CC” és a teljes képernyős gomb között megjelent egy új ikon (Firefoxban nincs ott, ez a
funkcióészlelés). Indítsd el a videót, és kattints rá: a videó egy kis, lebegő ablakba költözik, a lejátszó helyén
fekete háttéren a böngésző üzenete áll (Chrome-ban: „Lejátszás kép a képben módban”), a gomb türkiz lesz. Válts át egy másik lapra: a kis ablak ott marad. Zárd be a kis
ablakot a saját X-ével: a gomb visszavált. Gratulálok, kész a Popcorn Player!
:::

:::mistake Gyakori hiba
A PiP figyelőit `onEnterPictureInPicture`-rel próbálni a `<video>`-n. A gomb nem vált türkizre, a konzolban pedig ez
áll: „Unknown event handler property `onEnterPictureInPicture`. It will be ignored.” A React csak a gyakori
eseményekhez ad `on…` propot; a többihez marad az `addEventListener` egy effektben.
:::

:::concept A key mindent újrakezd
A lejátszási listánál a `key={clip.id}` minden klipnek vadonatúj `<video>` elemet ad. Ez egyszerű és tiszta, de mindent
újrakezd: a hangerőt, a sebességet, a feliratot, és ha a lejátszó épp teljes képernyőn volt, vagy a videó a kis ablakban
ment, klipváltáskor az is bezárul, mert a régi elemhez tartozott. Egy nagy videós oldal ezért egyetlen `<video>` elemet
tart meg, és csak a `src`-t cseréli, cserébe minden állapotot kézzel állít vissza. Ha szeretnéd, hogy a hangerő és a
felirat túlélje a klipváltást, [[emeld fel őket|állapot felemelése]] az `App`-ba, és add le propként, ahogy a 3. lecke
csúszkájánál láttad: ez jó gyakorló feladat.
:::
