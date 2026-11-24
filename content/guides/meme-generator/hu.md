# Mit építünk?

Egy mémkészítőt. Kiválasztasz egy képet, ráírod a felső és az alsó szöveget a klasszikus mémbetűkkel (fehér betű,
fekete körvonal), és letöltöd PNG-ként. A képek a lecke saját mém-API-jából jönnek, de a sajátodat is feltöltheted. A
haladó szinten a feliratokat és a matricákat egérrel vagy ujjal oda húzod, ahová csak akarod, el is forgatod őket, a kész
mémeket pedig egy galériába mented, és megosztod.

Közben megtanulod, hogyan rajzol egy React-app a [[canvas]]ra (vászonra): képet, szöveget körvonallal, több sorba
tördelve és elforgatva. Megtanulod azt is, hogyan tölt be a kód egy képet, hogyan dolgozik a felhasználó saját fájljával
úgy, hogy az ki sem mozdul a gépéről, és hogyan lesz a vászonból letölthető, elmenthető és megosztható fájl.

:::levels
- Egy kép a vásznon, rajta a felső és az alsó szöveg, amit gépelés közben írhatsz át, és négy kép, amelyek közül választhatsz. | kb. 2 óra
- Mémsablonok az API-ból, saját kép feltöltése, betűtípus, betűméret és szín, letöltés PNG-ként. | kb. 3 óra
- Húzható és forgatható feliratok, matricák, galéria a kész mémeknek és megosztás. | kb. 3 óra
:::

**Előismeret:** az előző leckék, főleg ezek: az 5. (QR-kód: az első rajzolás a vásznon, Blob és letöltés), a 6.
(kártyaképek kicsinyítése vásznon, a `drawImage` függvénnyel), a 9. (a `useLocalStorage` hook), a 12. (képgaléria:
fájlfeltöltés és objektum-URL), a 14. és a 20. (`fetch`, töltés- és hibaállapot, a `useFetch` hook és az
`AbortController`), a 16. és a 18. (`useRef`), valamint a 17. (pointeresemények). Amit innen újra használunk, azt pár
mondatban felidézzük, minden újat pedig lépésről lépésre elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/25-meme-generator/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Ugyanúgy indulsz, mint az 1. leckében, és annak a 0. lépése minden
parancsot részletesen elmagyaráz. Röviden: nyiss egy terminált a munkamappádban, ahol a `rika-mentoring` repó van, hozd
le az új leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját `meme-generator` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/25-meme-generator/exercise meme-generator
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/25-meme-generator/exercise` mappát a munkamappádba, `meme-generator` néven. A másolatodban
dolgozol: a repó érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `meme-generator` mappát a szerkesztőben (VS Code-ban: **File** → **Open Folder**), nyiss benne egy
terminált (**Terminal** → **New Terminal**), és indítsd el a projektet:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite és MSW)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Egy sötét oldalt látsz, a tetején türkiz betűkkel
a „Meme Generator” címmel. Más még nincs rajta: a mémkészítő a te dolgod.
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

Ami a kiinduló projektben van:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről és a vászonról szól, nem a CSS-ről, ezért nem
  kell stílust írnod: csak a lépésekben megadott osztályneveket (`meme__stage`, `panel`, `field`, `pictures`, …)
  használod. Azért nézz bele!
- `src/mocks/`: a lecke mém-API-ja, az „álszerver”, amelyről rögtön alább olvashatsz. A `templates.js` kóddal rajzolja
  meg a húsz mémsablon képét, a `handlers.js` felsorolja, milyen címekre válaszol, a `helpers.js`-ben három kis
  segédfüggvény van a válaszokhoz, a `browser.js` pedig elindítja az egészet (a `main.jsx` ennek a
  `startPretendServer` függvényét hívja). Egyiken sem kell változtatnod.
- `public/mockServiceWorker.js`: az MSW csomag egyik fájlja. Hagyd úgy, ahogy van.
- `src/main.jsx`: először elindítja az álszervert, és csak utána rajzolja ki az oldalt.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések és a „Meme Generator” cím angolul
vannak. Ha szeretnéd, írd át őket nyugodtan magyarra. A kódot, amit te írsz be, magyar feliratokkal és megjegyzésekkel
mutatjuk.

:::concept Gyors ismétlés: az álszerver
A 14. lecke óta tudod: egy webapp általában egy [[szerver]]től kéri az adatait, egy [[HTTP API]] címein keresztül. Ebben
a kurzusban nem használunk külső szolgáltatást, ezért a kiinduló projekt a saját API-ját is magával hozza. A
[[Mock Service Worker]] (MSW) egy [[service worker]]t indít, egy kis szkriptet, amelyet a böngésző az oldal mellett
futtat, és amely elkapja az oldal `/api/` kezdetű kéréseit. Ezekre az `src/mocks/handlers.js` válaszol, egy kis
késéssel, pontosan úgy, ahogy egy igazi szerver tenné.

Ennek a leckének az API-ja két dolgot tud. Az `/api/memes` a mémsablonok listáját adja (ugyanabban a formában, mint az
igazi, népszerű imgflip API), az `/api/memes/images/<azonosító>.svg` pedig egy sablon képét. A képeket is az álszerver
küldi: ha egy `<img>` vagy a kódod ilyen címet kér, ugyanúgy megkapja, mintha egy képszerverről jönne.
:::

:::mistake Gyakori hiba
Telefonról nyitod meg az oldalt: a szervert `npm run dev -- --host` paranccsal indítod (ahogy a 3. leckében), és a
terminál „Network” sorában kiírt címet (`http://192.168…`) nyitod meg. A böngészők csak biztonságos címeken
futtatnak service workert (`https://…` és `localhost`), ezért ott az álszerver nem indul el, és egyetlen kép sem
töltődik be. Dolgozz a `localhost` címen.
:::

:::try Próbáld ki
Kérdezd meg az API-t, még mielőtt egyetlen sort írnál. Nyisd meg a böngésző konzolját (++F12++ → Console), írd be ezt a
sort, és nyomj ++Enter++-t (ha beilleszted, a Chrome előbb arra kér, hogy gépeld be: `allow pasting`):

```js
fetch('/api/memes?lang=hu').then((response) => response.json()).then(console.log)
```

Egy pillanat múlva megjelenik a válasz: `{ success: true, data: { memes: [...] } }`. A kis háromszögekre kattintva
belenézhetsz: húsz sablon, mindegyiknek van azonosítója (`id`), neve (`name`), képcíme (`url`) és mérete.
:::

### Rajzlap a Reactben: canvas és useRef

A mém egy kép, rajta szöveggel. Ilyet a HTML-ből is össze lehetne rakni (egy `<img>`, rajta két felirat), de azt nem
lehetne egyetlen képfájlként letölteni. Ezért rajzolunk: a `<canvas>` (vászon) egy rajzlap az oldalon, amire
JavaScriptből lehet festeni, és amiről a végén képfájlt lehet készíteni. Az 5. leckében már rajzoltál vászonra: ott a
qrcode könyvtár adta a vásznat, te csak egy logót rajzoltál a közepére. A 6. leckében pedig a `drawImage` függvénnyel
festetted vászonra a kártyák képeit, hogy kisebbek legyenek. Most mi tesszük az oldalra a vásznat, és mindent mi festünk
rá.

Két dolgot kell tudni róla:

- A vászonnak két mérete van. A `width` és a `height` attribútum azt mondja meg, hány pixelből áll a rajzlap: egy
  `width="800"` vászonra 800 pixel széles képet festhetsz. Hogy a képernyőn mekkora, azt a CSS dönti el: az `App.css`
  összenyomja, ha nem fér ki, ilyenkor a rajz is vele együtt kisebb lesz.
- Rajzolni a vászon [[rajzkörnyezetén|rajzkörnyezet]] keresztül lehet: a `canvas.getContext('2d')` egy objektumot ad
  (a neve szokás szerint `ctx`), amelynek a függvényei festenek. A `fillStyle` a festék színe, a `fillRect(x, y,
  szélesség, magasság)` kifest vele egy téglalapot, a `fillText(szöveg, x, y)` szöveget ír. A koordináták a bal felső
  saroktól indulnak: az x jobbra, az y **lefelé** nő.

Ennek a rajzolásnak semmi köze a Reacthez, ezért külön fájlba kerül, ahogy a 3. leckében a jelszógenerátor logikája.
Hozd létre az `src/drawMeme.js` fájlt:

```js file=src/drawMeme.js
// Minden, ami a vászonra rajzol. Reactet nem használ, csak a vászon saját rajzeszközeit.
export function drawMeme(canvas) {
  const ctx = canvas.getContext('2d')

  // Sötét türkiz háttér a teljes vásznon…
  ctx.fillStyle = '#083f58'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // …és egy fehér felirat a közepén.
  ctx.fillStyle = '#ffffff'
  ctx.font = '72px Impact, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Szia, vászon!', canvas.width / 2, canvas.height / 2)
}
```

A `font` ugyanúgy írja le a betűt, mint a CSS `font` tulajdonsága: méret és betűtípus. A `textAlign = 'center'` és a
`textBaseline = 'middle'` miatt a megadott pont a szöveg **közepe** lesz, vízszintesen és függőlegesen is.

A `drawMeme`-nek a vászonelem kell. A JSX-ben leírt `<canvas>`-hoz a [[useRef]] ad hozzáférést, ahogy a 18. leckében a
`<video>`-hoz: a `useRef(null)` egy dobozt ad, a `ref={canvasRef}` pedig megkéri a Reactet, hogy tegye bele a
`current` rekeszébe az igazi HTML-elemet, amint az az oldalra került. Rajzolás közben (amikor a React a komponens
függvényét futtatja) a vászon még nincs az oldalon. A [[useEffect]] viszont csak a kirajzolás után fut le, ezért a
vászonra festés oda kerül. (Ebben a leckében a „rajzolás” kétfélét jelenthet: a React rajzolását, amikor lefut a
komponens függvénye, és a vászonra rajzolást, amikor a `ctx` fest.) Hozz létre az `src` mappában egy `components`
mappát, benne a `MemeCanvas.jsx` fájlt:

```jsx file=src/components/MemeCanvas.jsx
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas() {
  const canvasRef = useRef(null)

  // Festeni csak akkor lehet, amikor a <canvas> már az oldalon van, vagyis a kirajzolás után.
  useEffect(() => {
    drawMeme(canvasRef.current)
  }, [])

  return <canvas ref={canvasRef} className="meme__canvas" width="800" height="600" />
}

export default MemeCanvas
```

Az üres [[függőségi tömb]] (`[]`) azt jelenti, hogy az effekt csak egyszer fut le, az első kirajzolás után. A
fejlesztői módban a [[StrictMode]] kétszer is lefuttatja; ez itt nem baj, kétszer festjük ugyanazt ugyanoda.

Végül tedd a vásznat az oldalra. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=1,8-12
import MemeCanvas from './components/MemeCanvas.jsx'
import './App.css'

function App() {
  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas />
        </div>
      </div>
    </main>
  )
}

export default App
```

A `meme__stage` a sötét doboz, ami körülveszi a vásznat. A `meme__workspace` később két oszlopra osztja az oldalt:
balra a mém, jobbra a beállítások.

:::check Ellenőrizd
A cím alatt egy sötét türkiz téglalap jelenik meg, közepén fehér betűkkel: „Szia, vászon!”. Tedd keskenyebbre a
böngészőablakot: a téglalap a felirattal együtt kisebb lesz, mert a CSS összenyomja, a rajzlap viszont 800 × 600
pixeles marad.
:::

:::mistake Gyakori hiba
A vászon méretét CSS-sel adod meg (például `style={{ width: 800, height: 600 }}`) a `width` és a `height` attribútum
helyett. A rajzlap ilyenkor az alapértelmezett 300 × 150 pixeles marad, a CSS csak felnagyítja és széthúzza: a
felirat homályos, torz, és ki sem fér, hiszen 72 pixeles betűvel nem fér el egy 300 pixel széles lapon. A rajzlap
méretét mindig attribútumként add meg (vagy a kódból: `canvas.width = …`).
:::

:::try Próbáld ki
Rajzolj egy aranysárga kört a felirat fölé. Írd a `drawMeme` végére: `ctx.beginPath()`, aztán
`ctx.arc(400, 140, 60, 0, Math.PI * 2)` (a középpont x és y helye, a sugár, és hogy a kör 0-tól 2π-ig, vagyis körbe
megy), végül `ctx.fillStyle = '#feb800'` és `ctx.fill()`. Ha megnézted, töröld ki.
:::

### Kép a vásznon

Most jöjjön egy igazi kép. A képet előbb be kell tölteni: a böngészőnek le kell kérnie a címéről, és ez időbe telik.
Egy `<img>` ezt magától elintézi, a vászonnak viszont egy kész, betöltött kép kell. Erre való az [[Image]] objektum: a
`new Image()` egy olyan képet hoz létre a kódban, ami sehol sem jelenik meg az oldalon. Amint megkapja az `src`-t,
elkezd letöltődni, és ha kész, meghívja az `onload` függvényét; ha nem sikerült (például nincs ilyen kép), az
`onerror`-t.

A betöltést egy [[saját hook|saját hook]] intézi, ahogy a 14. leckében a `useFetch` a kéréseket: kap egy címet, és
megmondja, hol tart. Hozd létre az `src/useImage.js` fájlt:

```js file=src/useImage.js
import { useEffect, useState } from 'react'

// Betölt egy képet, hogy a vászonra lehessen rajzolni.
// Azt adja vissza, hol tart: { status: 'loading' | 'ready' | 'error', image }
function useImage(src) {
  const [result, setResult] = useState({ status: 'loading', image: null })

  useEffect(() => {
    // Igaz lesz, ha közben új cím jön (vagy eltűnik a komponens): a régi kép akkor már ne írjon az állapotba.
    let ignore = false
    setResult({ status: 'loading', image: null })

    const image = new Image()
    image.onload = () => {
      if (!ignore) setResult({ status: 'ready', image })
    }
    image.onerror = () => {
      if (!ignore) setResult({ status: 'error', image: null })
    }
    // Ettől a sortól kezdi letölteni a böngésző.
    image.src = src

    return () => {
      ignore = true
    }
  }, [src])

  return result
}

export default useImage
```

Az `ignore` változó ugyanaz a trükk, mint a 14. lecke `useFetch` hookjában: ha a felhasználó gyorsan egymás után két
képet választ, az első lassabban is megérkezhet, mint a második. A [[takarító függvény]] ilyenkor
igazra állítja a régi effekt `ignore`-ját, így a késve érkező régi kép már nem írja felül az újat.

A rajzolás is változik. Egy feltöltött fotó lehet 4000 pixel széles, egy sablon 800 × 600 vagy 640 × 800 pixeles. A
vászon mindig felveszi a kép arányait, de legfeljebb 800 × 800 pixel lehet. A kép eredeti méretét a
[[természetes méret]] adja: `image.naturalWidth` és `image.naturalHeight`. Cseréld le az `src/drawMeme.js` tartalmát:

```js file=src/drawMeme.js mark=3-5,7-14,16-23
// Minden, ami a vászonra rajzol. Reactet nem használ, csak a vászon saját rajzeszközeit.

// A mém legfeljebb ekkora lehet (pixelben). A kép arányai közben megmaradnak.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// Mekkora legyen a vászon, hogy a kép torzítás nélkül, egészben ráférjen?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

export function drawMeme(canvas, image) {
  const { width, height } = canvasSize(image)
  // A méret beállítása mindent letöröl a vászonról: tiszta lappal kezdünk.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)
}
```

- A `scale` a nagyítás aránya. Egy 4000 × 3000-es fotónál `Math.min(800 / 4000, 800 / 3000)`, vagyis 0,2: a vászon
  800 × 600 lesz. A kisebbik arány kell, különben a hosszabbik oldal kilógna.
- A `drawImage(kép, x, y, szélesség, magasság)` ráfesti a képet a vászonra, a bal felső sarkától kezdve, a megadott
  méretben.
- A `canvas.width = width` nemcsak átméretez, hanem le is törli a vásznat. Ez most jól jön: minden rajzolás tiszta
  lappal indul.

A vászon komponense megkapja a képet, és valahányszor új kép érkezik, újrafesti magát. Itt a teljes
`src/components/MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=4,7,9-10,12
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ image }) {
  const canvasRef = useRef(null)

  // Az első kirajzolás után, és valahányszor új kép érkezik: újrafestjük a vásznat.
  useEffect(() => {
    if (image) drawMeme(canvasRef.current, image)
  }, [image])

  return <canvas ref={canvasRef} className="meme__canvas" width="800" height="800" />
}

export default MemeCanvas
```

A `width="800" height="800"` most már csak a kezdőméret, amíg az első kép meg nem jön; utána a `drawMeme` állítja be.
A React nem írja vissza, mert a JSX-ben az érték nem változik. Amíg nincs kép (`image` még `null`), nem festünk semmit.

Az `App` a hookkal betölti az első sablont, a fáradt bögrét, és amíg tölt, vagy ha nem sikerült, kiír egy sort a vászon
aljára. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=1,6,13-23
import useImage from './useImage.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import './App.css'

function App() {
  const { status, image } = useImage('/api/memes/images/tired-mug.svg')

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas image={image} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              A kép betöltése…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              Ezt a képet nem sikerült betölteni.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
```

A `const { status, image } = useImage(…)` a [[destrukturálás]]: a hook által visszaadott objektumból rögtön két
változót csinál. A `role="status"` és a `role="alert"` miatt a képernyőolvasók is felolvassák az üzenetet.

:::check Ellenőrizd
Egy pillanatra megjelenik „A kép betöltése…”, aztán a vásznon ott a fáradt bögre a sárga háttér előtt. A vászon most
négyzet alakú, mert a kép 800 × 800 pixeles.
:::

:::mistake Gyakori hiba
A képet a betöltés megvárása nélkül rajzolod ki: `const image = new Image()`, `image.src = …`, és rögtön utána
`ctx.drawImage(image, …)`. Nem jön hibaüzenet, de a vászon üres marad, mert a rajzolás pillanatában a kép még csak
úton van. A `drawImage` csak a már betöltött képet tudja megfesteni: várd meg az `onload`-ot.
:::

:::try Próbáld ki
Írd át a címet `'/api/memes/images/rubber-duck.svg'`-re: megjelenik a gumikacsa. Aztán egy nem létező képre, például
`'/api/memes/images/unicorn.svg'`-re: az álszerver 404-es hibával válaszol, az `onerror` lefut, és megjelenik a
hibaüzenet. Végül állítsd vissza a bögrét.
:::

### Felső és alsó szöveg

Egy mém két felirattal az igazi: egy a kép tetején, egy az alján. A feliratok az `App` állapotában élnek, egy
objektumban, mert a vászonnak és a szövegmezőknek is szüksége van rájuk: ez a 3. leckéből ismert
[[állapot felemelése]]. A mezőket egy új komponens adja, két
[[vezérelt mezővel|vezérelt mező]], ahogy a 3. leckében. Hozd létre az `src/components/TextFields.jsx` fájlt:

```jsx file=src/components/TextFields.jsx
function TextFields({ text, onChange }) {
  return (
    <fieldset className="panel">
      <legend>Szöveg</legend>
      <label className="field">
        <span>Felső szöveg</span>
        <input type="text" value={text.top} onChange={(event) => onChange('top', event.target.value)} />
      </label>
      <label className="field">
        <span>Alsó szöveg</span>
        <input type="text" value={text.bottom} onChange={(event) => onChange('bottom', event.target.value)} />
      </label>
    </fieldset>
  )
}

export default TextFields
```

Mindkét mező ugyanazt az `onChange` propot hívja; az első paraméter mondja meg, melyik felirat változott (`'top'` vagy
`'bottom'`), a második az új szöveg.

Most jön a mémes betű. A klasszikus mém felirata csupa nagybetű, fehér, vastag fekete [[körvonallal|körvonal]]: így
világos és sötét képen is olvasható. A vásznon ehhez két parancs kell. A `strokeText` csak a betűk körvonalát húzza
meg, a `strokeStyle` színével és a `lineWidth` vastagságával; a `fillText` pedig kitölti őket. Előbb a körvonal, aztán
rá a kitöltés: a vonal fele így a betű alá kerül, és nem takarja ki a vékonyabb részeit. Cseréld le az
`src/drawMeme.js` tartalmát:

```js file=src/drawMeme.js mark=16-30,32,40-44
// Minden, ami a vászonra rajzol. Reactet nem használ, csak a vászon saját rajzeszközeit.

// A mém legfeljebb ekkora lehet (pixelben). A kép arányai közben megmaradnak.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// Mekkora legyen a vászon, hogy a kép torzítás nélkül, egészben ráférjen?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

// Egy felirat mémstílusban: csupa nagybetű, fehér betűk fekete körvonallal.
function drawCaption(ctx, text, { x, y, fontSize, fromBottom }) {
  ctx.font = `${fontSize}px Impact, 'Arial Black', sans-serif`
  ctx.textAlign = 'center'
  // A felső feliratnak a teteje, az alsónak az alja kerül az y magasságba.
  ctx.textBaseline = fromBottom ? 'bottom' : 'top'
  ctx.lineWidth = fontSize / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#ffffff'
  const caption = text.toUpperCase()
  // Előbb a körvonal, aztán rá a kitöltés: így a vonal nem takarja ki a betűket.
  ctx.strokeText(caption, x, y)
  ctx.fillText(caption, x, y)
}

export function drawMeme(canvas, image, text) {
  const { width, height } = canvasSize(image)
  // A méret beállítása mindent letöröl a vászonról: tiszta lappal kezdünk.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // Minden a vászon szélességéhez igazodik: 800 pixelen 60 pixeles betű és 32 pixel margó.
  const padding = width * 0.04
  const fontSize = width * 0.075
  drawCaption(ctx, text.top, { x: width / 2, y: padding, fontSize, fromBottom: false })
  drawCaption(ctx, text.bottom, { x: width / 2, y: height - padding, fontSize, fromBottom: true })
}
```

- A `drawCaption` elől hiányzik az `export`: csak ez a fájl használja. A harmadik paramétere egy objektum, amit rögtön
  szét is szedünk (`{ x, y, fontSize, fromBottom }`): így a hívásnál látszik, melyik szám mit jelent.
- A `textBaseline` mondja meg, a szöveg melyik része kerüljön a megadott y magasságba. A felső feliratnál a teteje
  (`'top'`), az alsónál az alja (`'bottom'`): így a felső a kép tetejétől lefelé, az alsó az aljától felfelé áll.
- A `fromBottom ? 'bottom' : 'top'` a 3. leckéből ismert [[ternáris operátor]].
- A `lineJoin = 'round'` lekerekíti a körvonal sarkait; nélküle a hegyes betűknél (M, V, A) tüskék állnának ki.
- A `toUpperCase()` csupa nagybetűssé alakítja a szöveget; az ékezetes betűket is (`ő` → `Ő`).
- Az Impact a Windowson és a macOS-en ott van a rendszerbetűk között, ahol nincs, ott az Arial Black vagy egy másik
  vastag betű jön helyette. Webes betűtípust szándékosan nem használunk: a vászon csak olyan betűvel tud rajzolni, ami
  a rajzolás pillanatában már be van töltve, a rendszerbetűk pedig mindig készen állnak.

A vászon most a szöveget is megkapja. Mivel a feliratot a képernyőolvasó nem látja (a vászon neki csak egy kép), a
`role="img"` és az `aria-label` mondja el, mi van rajta:

```jsx file=src/components/MemeCanvas.jsx mark=4,7,9-10,12-21
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ image, text }) {
  const canvasRef = useRef(null)

  // Az első kirajzolás után, és valahányszor megváltozik a kép vagy a szöveg: újrafestjük a vásznat.
  useEffect(() => {
    if (image) drawMeme(canvasRef.current, image, text)
  }, [image, text])

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas"
      width="800"
      height="800"
      role="img"
      aria-label={`Mém. Felül: ${text.top}. Alul: ${text.bottom}.`}
    />
  )
}

export default MemeCanvas
```

Az `App` tartja az állapotot, és összeköti a mezőket a vászonnal. A beállítások a jobb oldali oszlopba
(`meme__controls`) kerülnek:

```jsx file=src/App.jsx mark=1,4,8,11-14,21,33-35
import { useState } from 'react'
import useImage from './useImage.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import './App.css'

function App() {
  const [text, setText] = useState({ top: 'Amikor a kód', bottom: 'elsőre lefut' })
  const { status, image } = useImage('/api/memes/images/tired-mug.svg')

  function changeText(key, value) {
    // A text másolata, egy kulcsát új értékre cserélve.
    setText({ ...text, [key]: value })
  }

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas image={image} text={text} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              A kép betöltése…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              Ezt a képet nem sikerült betölteni.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
        </div>
      </div>
    </main>
  )
}

export default App
```

A `{ ...text, [key]: value }` a 3. leckéből ismert [[spread]]: lemásolja a régi objektumot, és felülír benne egy
kulcsot, azt, amelyiknek a neve a `key` változóban van. Minden billentyűleütés új `text` objektumot ad, és mivel a
`text` ott van a vászon effektjének függőségi tömbjében, a vászon minden leütés után újrafesti magát.

:::check Ellenőrizd
A bögre fölött nagy, fehér, fekete körvonalas betűkkel ez áll: „AMIKOR A KÓD”, alul pedig: „ELSŐRE LEFUT”. Jobbra (keskeny
ablakban alatta) egy „Szöveg” kártya két mezővel. Írj bármelyikbe: a vászon minden betű után frissül, kisbetűvel
gépelve is nagybetűvel.
:::

:::mistake Gyakori hiba
Kimarad a `text` a `MemeCanvas` függőségi tömbjéből: `[image]`. Ekkor a React nem tudja, hogy a rajz a szövegtől is
függ: a mezőben változik a szöveg, a vásznon nem. Minden, amit az effekt kívülről használ, és változhat, kerüljön a
tömbbe.
:::

:::try Próbáld ki
Cseréld fel a `strokeText` és a `fillText` sorát a `drawCaption`-ben: a körvonal most a kitöltésre kerül, és a betűk
vékonyak, szinte elfogynak. Aztán próbálj ki egy vastagabb vonalat: `ctx.lineWidth = fontSize / 4`. Ha megnézted,
állítsd vissza mindkettőt.
:::

### Hosszú feliratok több sorban

Írj egy hosszú felső szöveget, például: „Amikor a kód elsőre lefut, és fogalmad sincs, miért”. A felirat kilóg a kép
két oldalán. A HTML egy bekezdést magától több sorba tördel, a vászon nem: a `fillText` egyetlen sort ír, akármilyen
hosszú is. A [[tördelést|tördelés]] nekünk kell megírnunk.

Ehhez tudnunk kell, milyen széles lesz egy szöveg. A [[measureText]] (`ctx.measureText(szöveg)`) megméri a szöveget a
rajzkörnyezetben éppen beállított betűvel, és egy objektumot ad, amelynek a `width` mezője a szöveg szélessége
pixelben. A tördelés ötlete egyszerű: szavanként rakjuk össze a sort, és ha a következő szó már nem férne bele, új
sort kezdünk.

Ha egyetlen szó is túl hosszú (mondjuk egy hosszú link), az egymagában sem fér ki egy sorba, kettévágni pedig nem
tudjuk, mert csak a szóközöknél tördelünk. Ilyenkor kisebb betűvel próbáljuk újra, legfeljebb nyolcszor, minden
alkalommal 10%-kal kisebbel. Itt a teljes `src/drawMeme.js`:

```js file=src/drawMeme.js mark=16-33,35-46,48-50,53-54,58-63,76-79
// Minden, ami a vászonra rajzol. Reactet nem használ, csak a vászon saját rajzeszközeit.

// A mém legfeljebb ekkora lehet (pixelben). A kép arányai közben megmaradnak.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// Mekkora legyen a vászon, hogy a kép torzítás nélkül, egészben ráférjen?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

// Szavanként sorokra bontja a szöveget, hogy egyik sor se legyen szélesebb a maxWidth-nél.
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ').filter((word) => word !== '')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line === '' ? word : `${line} ${word}`
    if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
      // A szó már nem fér ki: a sor kész, a szó a következő sort kezdi.
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line !== '') lines.push(line)
  return lines
}

// Egy felirat mémstílusban: csupa nagybetű, fehér betűk fekete körvonallal, szükség esetén több sorban.
function drawCaption(ctx, text, { x, y, maxWidth, fontSize, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // Ha egy szó egymagában is túl széles, kisebb betűvel próbáljuk újra (legfeljebb nyolcszor).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px Impact, 'Arial Black', sans-serif`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  // Az alsó felirat alulról felfelé nő: annyi sorral feljebb kezdjük, ahány sora van.
  const top = fromBottom ? y - lines.length * lineHeight : y

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#ffffff'
  lines.forEach((line, i) => {
    const lineY = top + i * lineHeight
    // Előbb a körvonal, aztán rá a kitöltés: így a vonal nem takarja ki a betűket.
    ctx.strokeText(line, x, lineY)
    ctx.fillText(line, x, lineY)
  })
}

export function drawMeme(canvas, image, text) {
  const { width, height } = canvasSize(image)
  // A méret beállítása mindent letöröl a vászonról: tiszta lappal kezdünk.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // Minden a vászon szélességéhez igazodik: 800 pixelen 60 pixeles betű és 32 pixel margó.
  const padding = width * 0.04
  // Ami mindkét feliratnál ugyanaz. A sorok legfeljebb a vászon 92%-át foglalhatják el.
  const common = { x: width / 2, maxWidth: width * 0.92, fontSize: width * 0.075 }
  drawCaption(ctx, text.top, { ...common, y: padding, fromBottom: false })
  drawCaption(ctx, text.bottom, { ...common, y: height - padding, fromBottom: true })
}
```

Sorban, ami új:

- A `wrapLines` a `split(' ')`-tel szavakra vágja a szöveget, a `filter` pedig kidobja az üres darabokat, amelyek két
  egymás melletti szóközből lennének. A `candidate` az eddigi sor, plusz a következő szó. Ha ez már túl széles, a sor
  bekerül a `lines` tömbbe, és a szó új sort kezd; ha nem, a sor hosszabb lesz. A `line !== ''` feltétel csak a
  legelső szónál számít, amikor a `line` még üres: ha már az első szó sem fér ki, nélküle egy üres sor kerülne a
  `lines` tömb elejére, és a felirat egy üres sorral kezdődne.
- A `drawCaption` `for` ciklusa legfeljebb nyolcszor próbálkozik. Az [[every]] akkor igaz, ha a tömb minden elemére
  igaz a feltétel: ha minden sor kifér, a `break` azonnal kilép a ciklusból. Ha nem, a `size` 10%-kal kisebb lesz, és
  újra tördelünk.
- Mostantól minden sort a tetejétől rajzolunk (`textBaseline = 'top'`), egymás alá, `lineHeight` távolságra. Az alsó
  feliratnál a `top` annyi sorral kerül feljebb, ahány sora van: így a felirat alulról nő felfelé.
- A `common` objektumban az van, ami a két feliratnál közös, a spread (`...common`) pedig mindkét hívásba bemásolja.

:::check Ellenőrizd
Írd be a fenti hosszú szöveget: két-három sorba tördelődik, középre igazítva, és sehol sem lóg ki. Írj hosszút az alsó
mezőbe is: az alsó felirat felfelé nő, az utolsó sora a helyén marad. Írj be egy nagyon hosszú szót
(`AAAAAAAAAAAAAAAAAAAAAAAA`): a betűk addig kisebbednek, amíg a szó ki nem fér.
:::

:::mistake Gyakori hiba
A `measureText` a `ctx.font` beállítása előtt fut. A mérés mindig a rajzkörnyezet éppen beállított betűjével számol,
ami kezdetben egy apró, 10 pixeles betű: a mért szélesség töredéke a valódinak, minden egy sorba kerül, és a felirat
ugyanúgy kilóg, mint tördelés nélkül. Előbb a `font`, aztán a mérés.
:::

:::try Próbáld ki
Tedd keskenyebbre a feliratokat: írd át a `maxWidth: width * 0.92` értékét `width * 0.6`-ra. A sorok rövidebbek
lesznek, és több sorba törnek. Utána állítsd vissza.
:::

### Kép választása

A kezdő szint utolsó lépése: lehessen másik képet választani. A képek egy listából jönnek,
[[bélyegképekkel|bélyegkép]] (kicsinyített képekkel) egy rácsban. A középszinten a teljes listát az API-tól kérjük le, most még beírunk négy sablont kézzel.
Hozd létre az `src/pictures.js` fájlt:

```js file=src/pictures.js
// Négy sablon a lecke API-jából. A címükre az álszerver válaszol (src/mocks/handlers.js).
export const PICTURES = [
  { id: 'tired-mug', name: 'Fáradt bögre', url: '/api/memes/images/tired-mug.svg' },
  { id: 'rubber-duck', name: 'Gumikacsa-hibakereső', url: '/api/memes/images/rubber-duck.svg' },
  { id: 'snail-speed', name: 'Csiga teljes gőzzel', url: '/api/memes/images/snail-speed.svg' },
  { id: 'rocket-stuck', name: 'Elhalasztott kilövés', url: '/api/memes/images/rocket-stuck.svg' },
]
```

A mezők neve (`id`, `name`, `url`) szándékosan ugyanaz, mint az API válaszában: így a középszinten a lista egyszerűen
kicserélhető.

A választó minden képhez egy gombot rajzol, benne a bélyegképpel és a nevével. A kiválasztott gombnak az
[[aria-pressed]] attribútuma `true`, ahogy az 5. leckében az emojiválasztónál: ebből tudja a képernyőolvasó, hogy a gomb
„be van nyomva”, a CSS pedig ebből tudja, melyiket kell kiemelni. Hozd létre az `src/components/PicturePicker.jsx`
fájlt:

```jsx file=src/components/PicturePicker.jsx
function PicturePicker({ pictures, selected, onSelect }) {
  return (
    <section className="panel">
      <h2>Válassz képet</h2>
      <ul className="pictures">
        {pictures.map((picture) => (
          <li key={picture.id}>
            <button
              type="button"
              className="picture"
              aria-pressed={picture.id === selected}
              onClick={() => onSelect(picture)}
            >
              <img src={picture.url} alt="" />
              <span>{picture.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PicturePicker
```

A bélyegkép `alt` szövege üres: a kép neve ott áll mellette a gombon, így a képernyőolvasó a nevet olvassa fel, és nem
kétszer ugyanazt. A bélyegképeket is az álszerver küldi: minden `<img>` egy kérés az `/api/memes/images/…` címre.

Az `App`-ban a kiválasztott kép is állapot lesz. Az egész képobjektumot tároljuk (`{ id, name, url }`): a betöltéshez
az `url`, a kiemeléshez az `id` kell. Itt a teljes `src/App.jsx`, ahogy a kezdő szint végén kinéz:

```jsx file=src/App.jsx mark=3,6,10,12,40
import { useState } from 'react'
import useImage from './useImage.js'
import { PICTURES } from './pictures.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import PicturePicker from './components/PicturePicker.jsx'
import './App.css'

function App() {
  const [picture, setPicture] = useState(PICTURES[0])
  const [text, setText] = useState({ top: 'Amikor a kód', bottom: 'elsőre lefut' })
  const { status, image } = useImage(picture.url)

  function changeText(key, value) {
    // A text másolata, egy kulcsát új értékre cserélve.
    setText({ ...text, [key]: value })
  }

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas image={image} text={text} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              A kép betöltése…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              Ezt a képet nem sikerült betölteni.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
        </div>
      </div>
      <PicturePicker pictures={PICTURES} selected={picture.id} onSelect={setPicture} />
    </main>
  )
}

export default App
```

Az `onSelect={setPicture}` egyenesen az állapot beállító függvényét adja át: a választó a képobjektummal hívja meg,
és pont ezt kell eltárolni. Ha a `picture` változik, a `useImage` új címet kap, az effektje újra lefut, és betölti az
új képet. Amíg tölt, a vásznon még a régi kép látszik, alul „A kép betöltése…” sorral. A bélyegképek miatt azonban a
böngészőnek ez a kép általában már megvan, így a csere szinte azonnali.

:::check Ellenőrizd
A vászon alatt egy „Válassz képet” kártya, benne négy bélyegkép a nevükkel; a bögre ki van emelve. Kattints a csigára: a
vászon szélesebb lesz, mint amilyen magas (a kép 800 × 600-as), a rakétánál pedig magasabb, mint amilyen széles. A
feliratok mindig maradnak, és minden képen a tetejére, illetve az aljára kerülnek. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
`onClick={onSelect(picture)}`, nyílfüggvény nélkül. Ez nem kattintáskor hívja meg az `onSelect`-et, hanem rajzolás
közben, mind a négy képpel, egymás után: a vásznon rögtön az utolsó, a rakéta jelenik meg, a kattintás pedig nem csinál
semmit. A konzolban (++F12++) ott a hiba is: „Cannot update a component (`App`) while rendering a different component
(`PicturePicker`)”. Itt egy paramétert is át kell adni, ezért kell a `() => onSelect(picture)`.
:::

:::try Próbáld ki
Nyisd meg a fejlesztői eszközök Network paneljét (++F12++ → Network), és frissítsd az oldalt. Ott a négy bélyegkép
kérése, mind az `/api/memes/images/` alól; a Size oszlopban „(ServiceWorker)” áll, vagyis az álszerver válaszolt. A
vászon képének nincs külön sora: a bögrét a böngésző csak egyszer kéri le, a bélyegkép és a vászon ugyanazt a választ
használja.
:::

## Középszint {level=2}

### Mémsablonok az API-ból

Négy kép kevés. Az API húsz sablont ismer: kérjük le a teljes listát. A kéréshez a 14. lecke [[fetch]]-e és a 20.
lecke (filmkereső) `useFetch` hookja kell. Ahogy ott, most is egy saját hook intézi a kérést, és megmondja, hol tart: töltődik
(`'loading'`), megjött (`'success'`) vagy hiba történt (`'error'`); és egy `retry` függvénnyel újra is lehet
próbálkozni. Hozd létre az `src/useFetch.js` fájlt:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// JSON-t kér le a megadott címről. Azt adja vissza, hol tart: { status, data, retry }
// status: 'loading' | 'success' | 'error'
function useFetch(url) {
  const [result, setResult] = useState({ status: 'loading', data: null })
  const [attempt, setAttempt] = useState(0) // a retry() növeli, és az effekt újra lefut

  useEffect(() => {
    const controller = new AbortController()
    setResult({ status: 'loading', data: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(`A szerver ${response.status} kóddal válaszolt`)
        const data = await response.json()
        setResult({ status: 'success', data })
      } catch {
        // Ha a takarítás állította le, egy újabb kérés vette át a helyét: csendben maradunk.
        if (!controller.signal.aborted) setResult({ status: 'error', data: null })
      }
    }

    load()
    // Takarítás: új cím esetén (vagy ha a komponens eltűnik) leállítjuk a még úton lévő kérést.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt(attempt + 1)
  }

  return { ...result, retry }
}

export default useFetch
```

Ez a 20. lecke hookjának rövidebb változata, új dolog nincs benne: itt mindig van cím, ezért az `'idle'` állapot
elmarad. Az [[AbortController]] le tudja állítani a kérést: a takarító függvény hívja meg, ha a cím megváltozik, vagy a
komponens eltűnik. A megszakított `fetch` is hibával végződik, ezért a `catch` ág előbb megnézi a
`controller.signal.aborted` értékét: ha igaz, nem hiba történt, csak egy újabb kérés vette át a helyét, és csendben
maradunk. A `response.ok` hamis, ha a szerver hibakóddal válaszolt (például 404 vagy 500); ilyenkor mi magunk dobunk
hibát, hogy a `catch` ágba kerüljünk.

Az API nem egy sima tömböt küld, hanem becsomagolja, ahogy az igazi imgflip API is:
`{ success: true, data: { memes: [...] } }`. A `success` mező külön is jelzi, hogy minden rendben volt-e: egy ilyen API
akkor is küldhet `success: false`-t, ha maga a válasz 200-as. Ezt is hibának vesszük.

A választó most a kérés állapotát is megkapja: töltés közben egy rövid üzenetet mutat, hiba esetén egy
„Újrapróbálás” gombot. Itt a teljes `src/components/PicturePicker.jsx`:

```jsx file=src/components/PicturePicker.jsx mark=1,5-17
function PicturePicker({ status, pictures, selected, onSelect, onRetry }) {
  return (
    <section className="panel">
      <h2>Válassz képet</h2>
      {status === 'loading' && (
        <p className="notice" role="status">
          A sablonok betöltése…
        </p>
      )}
      {status === 'error' && (
        <div className="notice notice--error" role="alert">
          <p>Nem sikerült betölteni a mémsablonokat.</p>
          <button type="button" className="button" onClick={onRetry}>
            Újrapróbálás
          </button>
        </div>
      )}
      <ul className="pictures">
        {pictures.map((picture) => (
          <li key={picture.id}>
            <button
              type="button"
              className="picture"
              aria-pressed={picture.id === selected}
              onClick={() => onSelect(picture)}
            >
              <img src={picture.url} alt="" />
              <span>{picture.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PicturePicker
```

Az `App` elkéri a listát, kicsomagolja, és továbbadja. Az első kép nem várhat a listára, ezért a bögre címe most egy
állandóban, a `START_PICTURE`-ben van: a vászon rögtön tölthet, miközben a lista még úton van. A `pictures.js`-re
nincs többé szükség, nyugodtan töröld. Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=3,9-12,15-16,20-24,52-58
import { useState } from 'react'
import useImage from './useImage.js'
import useFetch from './useFetch.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import PicturePicker from './components/PicturePicker.jsx'
import './App.css'

// A lecke mém-API-ja (src/mocks/handlers.js). A lang=hu miatt magyarul kapjuk a sablonok nevét.
const MEMES_API = '/api/memes?lang=hu'
// Ezzel a képpel indulunk, még mielőtt megjönne a sablonok listája.
const START_PICTURE = { id: 'tired-mug', name: 'Fáradt bögre', url: '/api/memes/images/tired-mug.svg' }

function App() {
  const templates = useFetch(MEMES_API)
  const [picture, setPicture] = useState(START_PICTURE)
  const [text, setText] = useState({ top: 'Amikor a kód', bottom: 'elsőre lefut' })
  const { status, image } = useImage(picture.url)

  // Az API így csomagolja a listát: { success: true, data: { memes: [...] } }.
  // Ha a success hamis, az is hiba, akkor is, ha maga a válasz rendben megjött.
  let templateStatus = templates.status
  if (templateStatus === 'success' && !templates.data.success) templateStatus = 'error'
  const memes = templateStatus === 'success' ? templates.data.data.memes : []

  function changeText(key, value) {
    // A text másolata, egy kulcsát új értékre cserélve.
    setText({ ...text, [key]: value })
  }

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas image={image} text={text} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              A kép betöltése…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              Ezt a képet nem sikerült betölteni.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
        </div>
      </div>
      <PicturePicker
        status={templateStatus}
        pictures={memes}
        selected={picture.id}
        onSelect={setPicture}
        onRetry={templates.retry}
      />
    </main>
  )
}

export default App
```

A `templates.data.data.memes` furcsán néz ki, de csak a csomagolást követi: a `templates.data` a teljes válasz, abban a
`data` mező a csomag, abban a `memes` a lista. A `let templateStatus` azért `let`, mert a következő sor új értéket
adhat neki. A lista egy [[származtatott érték]]: nem tároljuk külön állapotban, minden rajzoláskor kiszámoljuk a
kérés eredményéből.

Az API a képek címét teljes címként küldi (`http://localhost:5173/api/memes/images/…`), ahogy egy igazi szerver is
tenné. A kezdőkép címe rövid (`/api/memes/images/…`), ezért a kiemelés nem a címet, hanem az `id`-t hasonlítja össze:
az mindkettőben ugyanaz (`'tired-mug'`).

:::check Ellenőrizd
Frissítsd az oldalt: egy pillanatra megjelenik „A sablonok betöltése…”, aztán húsz bélyegkép magyar nevekkel: „Fáradt
bögre”, „Gumikacsa-hibakereső”, „Ölelni vágyó kaktusz”… A bögre ki van emelve, és bármelyik másikra kattintva az
kerül a vászonra.
:::

:::mistake Gyakori hiba
`templates.data.memes` a `templates.data.data.memes` helyett. A `templates.data`-ban nincs `memes` mező, az értéke
`undefined`, és az oldal összeomlik: a konzolban „Cannot read properties of undefined (reading 'map')”. Ha nem tudod,
milyen egy válasz, nézd meg előbb a konzolban (ahogy a 0. lépésben) vagy a Network panelen.
:::

:::try Próbáld ki
Rontsd el a címet: `'/api/memez?lang=hu'`. Az álszerver nem ismeri, ezért a kérés a fejlesztői szerverhez jut, amely
JSON helyett egy HTML-oldallal válaszol; a `response.json()` hibát dob, és megjelenik a piros doboz az „Újrapróbálás”
gombbal. Írd vissza a helyes címet, és mentsd el: a sablonok maguktól megjönnek, mert megváltozott a `useFetch` címe,
és az effektje újra lefut. Az „Újrapróbálás” gomb ugyanezt teszi kódmódosítás nélkül: egy igazi szerver gyakran csak
egy pillanatra nem érhető el, és a második kérés már sikerül.
:::

### Saját kép feltöltése

Mém a saját fotódból: ehhez fel kell tölteni egy képet. A 12. leckéből tudod, hogyan: egy `<input type="file">`
[[fájlmező]] megnyitja a gép fájlválasztóját, az `event.target.files[0]` pedig a kiválasztott [[File]]. Abból az
`URL.createObjectURL(file)` egy [[objektum-URL]]-t készít (`blob:http://localhost:5173/…`), ami a böngésző memóriájában
lévő fájlra mutat. A kép tehát nem megy sehova: a gépeden marad, a böngésző csak kölcsönad neki egy címet. Erről a
címről a `useImage` ugyanúgy betölti, mint bármelyik sablont.

A feltöltőgomb saját komponens, és maga ellenőrzi, hogy a fájl tényleg kép-e. Az `accept="image/*"` csak kéri a
fájlválasztót, hogy képeket mutasson, de meg lehet kerülni, ezért a [[MIME-típust|MIME-típus]] is megnézzük. Hozd létre
az `src/components/UploadButton.jsx` fájlt:

```jsx file=src/components/UploadButton.jsx
import { useState } from 'react'

function UploadButton({ onFile }) {
  const [error, setError] = useState('')

  function handleChange(event) {
    const file = event.target.files[0]
    // Kiürítjük a mezőt, hogy ugyanazt a fájlt újra is ki lehessen választani.
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Ez a fájl nem kép. Válassz egy JPG-, PNG-, GIF- vagy WebP-fájlt.')
      return
    }
    setError('')
    onFile(file)
  }

  return (
    <div className="upload">
      <label className="button button--primary">
        <input type="file" accept="image/*" className="visually-hidden" onChange={handleChange} />
        Saját kép feltöltése
      </label>
      {error !== '' && (
        <p className="upload__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default UploadButton
```

A `<label>` gombnak látszik, a valódi fájlmező pedig benne van, a `visually-hidden` osztállyal elrejtve: a képernyőn
nem látszik, de a ++Tab++ billentyűvel elérhető, és a képernyőolvasó is megtalálja. Mivel a `<label>` magában foglalja
a mezőt, a feliratára kattintani ugyanaz, mint a mezőre. Ha a fájlmezőn ugyanazt a fájlt választod ki még egyszer, a
böngésző nem küld új `change` eseményt; ezért ürítjük ki a mezőt, miután kiolvastuk belőle a fájlt.

A gomb a választó kártyájának tetejére kerül, a hibaüzenetek fölé: ha a sablonok nem töltődnek be, a saját kép akkor is
működik. Itt a teljes `src/components/PicturePicker.jsx`:

```jsx file=src/components/PicturePicker.jsx mark=1,3,7,15
import UploadButton from './UploadButton.jsx'

function PicturePicker({ status, pictures, selected, onSelect, onRetry, onFile }) {
  return (
    <section className="panel">
      <h2>Válassz képet</h2>
      <UploadButton onFile={onFile} />
      {status === 'loading' && (
        <p className="notice" role="status">
          A sablonok betöltése…
        </p>
      )}
      {status === 'error' && (
        <div className="notice notice--error" role="alert">
          <p>Nem sikerült betölteni a mémsablonokat. A saját képed így is működik.</p>
          <button type="button" className="button" onClick={onRetry}>
            Újrapróbálás
          </button>
        </div>
      )}
      <ul className="pictures">
        {pictures.map((picture) => (
          <li key={picture.id}>
            <button
              type="button"
              className="picture"
              aria-pressed={picture.id === selected}
              onClick={() => onSelect(picture)}
            >
              <img src={picture.url} alt="" />
              <span>{picture.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PicturePicker
```

A feltöltött kép ugyanolyan képobjektum lesz, mint egy sablon: `{ id: 'upload', name: a fájl neve, url: az
objektum-URL }`. Így a választó a rácsban is meg tudja mutatni, az első helyen, és egy kattintással vissza lehet rá
váltani, ha közben egy sablont próbáltál. Az `App`-ban ez a változás (a `…` kezdetű megjegyzések helyén minden marad,
ahogy volt):

```jsx file=src/App.jsx mark=3,7-8,10-16,21,25
function App() {
  // … a templates és a picture, mint eddig
  const [upload, setUpload] = useState(null) // a feltöltött kép, ha van
  // … a text és a useImage, mint eddig

  // … a templateStatus és a memes, mint eddig
  // A saját kép, ha van, a sablonok elé kerül.
  const pictures = upload ? [upload, ...memes] : memes

  function chooseFile(file) {
    // Az előző feltöltés ideiglenes címére már nincs szükség: felszabadítjuk a memóriát.
    if (upload) URL.revokeObjectURL(upload.url)
    const newUpload = { id: 'upload', name: file.name, url: URL.createObjectURL(file) }
    setUpload(newUpload)
    setPicture(newUpload)
  }

  // … a changeText és a return eleje, mint eddig
      <PicturePicker
        status={templateStatus}
        pictures={pictures}
        selected={picture.id}
        onSelect={setPicture}
        onRetry={templates.retry}
        onFile={chooseFile}
      />
  // … a lezáró címkék, mint eddig
```

Az `URL.revokeObjectURL` elengedi a régi címet: amíg egy objektum-URL él, a böngésző a memóriában tartja a fájlt, egy
fotónál ez több megabájt is lehet. Most mindig csak az utolsó feltöltést tartjuk meg, a régit felszabadítjuk.

:::check Ellenőrizd
Kattints a „Saját kép feltöltése” gombra, és válassz egy fotót a gépedről: a vásznon a fotód jelenik meg a két
felirattal, a rácsban pedig az első helyen, a fájl nevével. Kattints egy sablonra, aztán vissza a fotódra: visszajön.
Próbálj feltölteni egy nem képfájlt (a fájlválasztóban állítsd a szűrőt „Minden fájl”-ra): a gomb alatt megjelenik a
piros figyelmeztetés, a vászon nem változik.
:::

:::mistake Gyakori hiba
Előbb üríted ki a mezőt (`event.target.value = ''`), és csak utána olvasod ki a fájlt. A kiürítés a `files` listát
is kiüríti, így a `files[0]` már `undefined`: a fájlválasztó bezárul, és nem történik semmi. Előbb ki kell venni a
fájlt, csak utána szabad üríteni.
:::

:::try Próbáld ki
Lehessen a vászonra egérrel ráhúzni egy képet is. A `meme__stage` doboz kapjon két eseménykezelőt az `App`-ban:
`onDragOver={(event) => event.preventDefault()}` (enélkül a böngésző nem engedi oda ejteni a fájlt) és
`onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) chooseFile(file) }}`.
Húzz rá egy képet a fájlkezelőből! (Csak azt ellenőrzi, hogy érkezett-e fájl, azt nem, hogy kép-e: ha akarod, ezt az
ellenőrzést másold át az `UploadButton`-ból.)
:::

### Betűtípus, méret és szín

A felirat most mindig fehér Impact, 60 pixeles. Legyen választható a betűtípus, a méret és a szín. A három beállítás
egy `style` objektumba kerül az `App` állapotában, ahogy a `text`.

Kezdjük a rajzolással. A betűtípusok egy objektumba kerülnek a `drawMeme.js` elejére: mindegyiknek van egy neve a
választóhoz (`label`) és egy betűcsaládja a vászonnak (`family`). Mind rendszerbetű, mert a vászon csak olyannal tud
rajzolni, ami már be van töltve. Ha a gépeden valamelyik hiányzik, a lista következő betűje jön helyette.

A szín az `<input type="color">` színválasztóból jön, `'#ff0000'` formában, mint a 7. lecke színkódjai. A körvonal
színét nem kell külön választani: világos betűhöz fekete, sötéthez fehér körvonal illik. Hogy egy szín világos vagy
sötét, azt a vörös, a zöld és a kék összetevőjéből számoljuk ki, súlyozva, mert a szemünk a zöldet sokkal
világosabbnak látja, mint a kéket (ez a [[relatív fénysűrűség]] egyszerűsített változata). A `parseInt(szöveg, 16)`
egy [[hexadecimális számot|hexadecimális szám]] alakít számmá: `parseInt('ff', 16)` értéke 255.

A betűméret egy 800 pixel széles mémre vonatkozik; egy keskenyebb vásznon (például egy álló fotónál) arányosan
kisebb lesz, hogy a felirat ugyanakkorának tűnjön. Itt a teljes `src/drawMeme.js`:

```js file=src/drawMeme.js mark=3-9,43-50,52-53,59,73-74,83,92-99
// Minden, ami a vászonra rajzol. Reactet nem használ, csak a vászon saját rajzeszközeit.

// A választható betűtípusok. Mind rendszerbetű: azonnal rajzolhatók, nem kell letölteni őket.
export const FONTS = {
  impact: { label: 'Impact', family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  arial: { label: 'Arial Black', family: "'Arial Black', 'Arial Bold', Arial, sans-serif" },
  comic: { label: 'Comic Sans', family: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" },
  georgia: { label: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
}

// A mém legfeljebb ekkora lehet (pixelben). A kép arányai közben megmaradnak.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// Mekkora legyen a vászon, hogy a kép torzítás nélkül, egészben ráférjen?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

// Szavanként sorokra bontja a szöveget, hogy egyik sor se legyen szélesebb a maxWidth-nél.
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ').filter((word) => word !== '')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line === '' ? word : `${line} ${word}`
    if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
      // A szó már nem fér ki: a sor kész, a szó a következő sort kezdi.
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line !== '') lines.push(line)
  return lines
}

// Világos betűhöz fekete, sötéthez fehér körvonal: így minden képen olvasható marad.
function outlineFor(hex) {
  const red = parseInt(hex.slice(1, 3), 16)
  const green = parseInt(hex.slice(3, 5), 16)
  const blue = parseInt(hex.slice(5, 7), 16)
  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue
  return brightness > 140 ? '#000000' : '#ffffff'
}

// Egy felirat mémstílusban: csupa nagybetű, körvonallal, szükség esetén több sorban.
function drawCaption(ctx, text, { x, y, maxWidth, fontSize, font, color, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // Ha egy szó egymagában is túl széles, kisebb betűvel próbáljuk újra (legfeljebb nyolcszor).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  // Az alsó felirat alulról felfelé nő: annyi sorral feljebb kezdjük, ahány sora van.
  const top = fromBottom ? y - lines.length * lineHeight : y

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    const lineY = top + i * lineHeight
    // Előbb a körvonal, aztán rá a kitöltés: így a vonal nem takarja ki a betűket.
    ctx.strokeText(line, x, lineY)
    ctx.fillText(line, x, lineY)
  })
}

export function drawMeme(canvas, image, { text, style }) {
  const { width, height } = canvasSize(image)
  // A méret beállítása mindent letöröl a vászonról: tiszta lappal kezdünk.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  const padding = width * 0.04
  // Ami mindkét feliratnál ugyanaz. A style.size egy 800 pixel széles mémre vonatkozik.
  const common = {
    x: width / 2,
    maxWidth: width * 0.92,
    fontSize: (style.size * width) / 800,
    font: style.font,
    color: style.color,
  }
  drawCaption(ctx, text.top, { ...common, y: padding, fromBottom: false })
  drawCaption(ctx, text.bottom, { ...common, y: height - padding, fromBottom: true })
}
```

A `drawMeme` harmadik paramétere most egy objektum: `{ text, style }`. Négy-öt paramétert sorrendben megjegyezni nehéz,
egy objektumban viszont mindegyiknek neve van, és a haladó szinten még több jön. A `hex.slice(1, 3)` a `'#ff8800'`
szövegből az `'ff'`-et vágja ki (az 1. helytől a 3. elé), ez a vörös rész.

A beállítások saját kártyát kapnak. A betűtípus egy [[legördülő lista]] (`<select>`): az értékét, ahogy egy
szövegmezőnél, a `value` adja, a lehetőségei pedig a `FONTS` kulcsai. Az [[Object.entries]] kulcs–érték párokat ad
egy objektumból, így egyszerre kapjuk meg a kulcsot (`impact`) és a betűtípus adatait. Hozd létre az
`src/components/StyleControls.jsx` fájlt:

```jsx file=src/components/StyleControls.jsx
import { FONTS } from '../drawMeme.js'

function StyleControls({ style, onChange }) {
  return (
    <fieldset className="panel">
      <legend>Betűk</legend>
      <label className="field">
        <span>Betűtípus</span>
        <select value={style.font} onChange={(event) => onChange('font', event.target.value)}>
          {Object.entries(FONTS).map(([key, font]) => (
            <option key={key} value={key}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Betűméret: {style.size}</span>
        <input
          type="range"
          min="24"
          max="110"
          value={style.size}
          onChange={(event) => onChange('size', Number(event.target.value))}
        />
      </label>
      <label className="field">
        <span>Szín</span>
        <input type="color" value={style.color} onChange={(event) => onChange('color', event.target.value)} />
      </label>
    </fieldset>
  )
}

export default StyleControls
```

A csúszka a 3. leckéből ismerős: az értékét szövegként adja, ezért a `Number()` számmá alakítja. A színválasztó
mindig kisbetűs, hétkarakteres színkódot ad (`'#ffd23f'`), és ugyanilyet vár a `value`-ban is.

A vászon a `style`-t is megkapja, és a `drawMeme`-nek már egy objektumban adja át, amit kell:

```jsx file=src/components/MemeCanvas.jsx mark=4,7,9-10
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ image, text, style }) {
  const canvasRef = useRef(null)

  // Az első kirajzolás után, és valahányszor megváltozik a kép, a szöveg vagy a stílus: újrafestjük a vásznat.
  useEffect(() => {
    if (image) drawMeme(canvasRef.current, image, { text, style })
  }, [image, text, style])

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas"
      width="800"
      height="800"
      role="img"
      aria-label={`Mém. Felül: ${text.top}. Alul: ${text.bottom}.`}
    />
  )
}

export default MemeCanvas
```

Végül az `App`: egy új állapot, egy új függvény, ami ugyanúgy működik, mint a `changeText`, és a két új prop (a `…`
kezdetű megjegyzések helyén minden marad, ahogy volt):

```jsx file=src/App.jsx mark=1,6,9-12,16,20
import StyleControls from './components/StyleControls.jsx'
// … a többi import és a két állandó, mint eddig

function App() {
  // … a templates, a picture, az upload és a text, mint eddig
  const [style, setStyle] = useState({ font: 'impact', size: 60, color: '#ffffff' })
  // … a useImage, a templateStatus, a memes, a pictures, a chooseFile és a changeText, mint eddig

  function changeStyle(key, value) {
    // A style másolata, egy kulcsát új értékre cserélve.
    setStyle({ ...style, [key]: value })
  }

  return (
    // … minden, mint eddig, egészen a vászonig
          <MemeCanvas image={image} text={text} style={style} />
    // … a két üzenet, mint eddig
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
          <StyleControls style={style} onChange={changeStyle} />
        </div>
    // … a választó és a lezáró címkék, mint eddig
  )
}
```

:::check Ellenőrizd
A „Szöveg” alatt megjelenik a „Betűk” kártya. Válaszd a Comic Sans-t: a feliratok betűje megváltozik. Húzd a csúszkát
110-re: a betűk nőnek, a hosszabb feliratok több sorba törnek. Válassz sárgát a színválasztóban: sárga betű, fekete
körvonal. Válassz sötétkéket: a körvonal fehérre vált.
:::

:::mistake Gyakori hiba
A kiválasztott betűtípust a `selected` attribútummal jelölöd: `<option selected={key === style.font}>`. A React
figyelmeztet a konzolban, hogy használd inkább a `value`-t a `<select>`-en. Reactben a legördülő lista is vezérelt
mező: az értékét a `<select value={…}>` adja, nem az egyes `<option>`-ök.
:::

:::try Feladat
Legyen kikapcsolható a csupa nagybetű. Kerüljön a `style`-ba egy `caps: true` mező, a `StyleControls`-ba egy
jelölőnégyzet (`checked={style.caps}`, és az `onChange`-ben `event.target.checked`), a `drawCaption` pedig csak akkor
hívja meg a `toUpperCase()`-t, ha a `caps` igaz. Ehhez a `drawMeme`-nek a `style.caps`-et is be kell tennie a
`common`-ba. (A következő lépések kódja a feladat nélküli változatot mutatja; ha megcsináltad, a `style`
kezdőértékében maradjon meg a `caps: true`, a `drawCaption` paraméterei között a `caps` és vele a feltételes
`toUpperCase()`, a `drawMeme` `common`-jában pedig a `caps`.)
:::

### Letöltés PNG-ként

Kész a mém, töltsük le. Az 5. leckében a QR-kód PNG-jét data URL-ként töltötted le, az SVG-jét pedig egy
[[Blob]]-ból készült objektum-URL-ről. A vászonnak van egy saját függvénye, amely egyenesen Blobot készít: a
`canvas.toBlob(függvény, 'image/png')`. A PNG elkészítése egy nagy képnél eltarthat egy pillanatig, ezért a `toBlob`
nem adja vissza azonnal az eredményt, hanem egy [[visszahívó függvényt|visszahívó függvény]] (callback) vár: egy
függvényt, amit akkor hív meg, amikor kész, és paraméterként átadja neki a kész Blobot. (Ritkán, például egy 0 pixel
széles vásznon, `null` jön Blob helyett: ilyenkor nem töltünk le semmit.)

A letöltés maga ugyanaz a trükk, mint az 5. leckében: egy láthatatlan `<a download>` link, amire a kódból
„kattintunk”. Két függvénybe tesszük, mert a haladó szinten a link még egyszer kelleni fog. Hozd létre az
`src/download.js` fájlt:

```js file=src/download.js
// Letölt egy címet (blob: vagy data: URL) a megadott fájlnévvel: egy láthatatlan linkre „kattintunk”.
export function downloadUrl(url, fileName) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  // Egyes böngészők csak az oldalon lévő linkre indítják el a letöltést, ezért egy pillanatra betesszük.
  document.body.append(link)
  link.click()
  link.remove()
}

// A vászon tartalmát PNG-fájlként tölti le.
export function downloadCanvas(canvas, fileName) {
  // A toBlob elkészíti a PNG-t, aztán meghívja a függvényünket a kész fájllal (vagy null-lal, ha nem sikerült).
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    downloadUrl(url, fileName)
    // Az ideiglenes cím memóriát foglal: ha a letöltés elindult, felszabadítjuk.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
```

A letöltőgombnak a vászonelem kell, az pedig eddig a `MemeCanvas` saját refjében lakott, ahová az `App` nem lát be. A
megoldás ugyanaz, mint az állapotnál: [[felemeljük|állapot felemelése]]. A ref az `App`-ban jön létre, és propként
megy le a vászonhoz, ami a `<canvas>`-ra teszi. A prop neve `canvasRef`: a neve elárulja, mi van benne, és nem
keveredik össze a `<canvas>` elem saját `ref` attribútumával. Itt a teljes `src/components/MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=1,4,8
import { useEffect } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ canvasRef, image, text, style }) {
  // Az első kirajzolás után, és valahányszor megváltozik a kép, a szöveg vagy a stílus: újrafestjük a vásznat.
  useEffect(() => {
    if (image) drawMeme(canvasRef.current, image, { text, style })
  }, [canvasRef, image, text, style])

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas"
      width="800"
      height="800"
      role="img"
      aria-label={`Mém. Felül: ${text.top}. Alul: ${text.bottom}.`}
    />
  )
}

export default MemeCanvas
```

A `canvasRef` a függőségi tömbbe is bekerül, mert az effekt kívülről kapja. Fölösleges újrafestést nem okoz: a ref
objektuma mindig ugyanaz, sosem változik.

:::concept Miért nem tölthető le minden vászon? (szennyezett vászon)
A böngésző nem engedi, hogy egy oldal kiolvassa egy **másik** webhely képét, ha az a webhely ezt nem engedte meg. A
vászonra rárajzolni egy idegen képet lehet, de ettől a vászon [[szennyezett|szennyezett vászon]] lesz (angolul
„tainted”): a `toBlob` és a `toDataURL` ezután hibát dob (`SecurityError`), és a letöltés nem működik. Az engedélyt a
[[CORS]] adja: a képet küldő szerver egy fejléccel jelzi, hogy más oldalak is felhasználhatják, a kód pedig az
`image.crossOrigin = 'anonymous'` sorral kéri ezt az engedélyt még a betöltés előtt.

Ebben a leckében ilyen gond nincs: a sablonokat a saját oldalunk küldi (az álszerver), a feltöltött kép pedig a
saját gépedről jön, objektum-URL-en. Ha egyszer igazi, idegen mém-API-t használsz, erre emlékezz.
:::

Itt a teljes `src/App.jsx`, ahogy a középszint végén kinéz:

```jsx file=src/App.jsx mark=1,4,17,56,71-80
import { useRef, useState } from 'react'
import useImage from './useImage.js'
import useFetch from './useFetch.js'
import { downloadCanvas } from './download.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import StyleControls from './components/StyleControls.jsx'
import PicturePicker from './components/PicturePicker.jsx'
import './App.css'

// A lecke mém-API-ja (src/mocks/handlers.js). A lang=hu miatt magyarul kapjuk a sablonok nevét.
const MEMES_API = '/api/memes?lang=hu'
// Ezzel a képpel indulunk, még mielőtt megjönne a sablonok listája.
const START_PICTURE = { id: 'tired-mug', name: 'Fáradt bögre', url: '/api/memes/images/tired-mug.svg' }

function App() {
  const canvasRef = useRef(null)
  const templates = useFetch(MEMES_API)
  const [picture, setPicture] = useState(START_PICTURE)
  const [upload, setUpload] = useState(null) // a feltöltött kép, ha van
  const [text, setText] = useState({ top: 'Amikor a kód', bottom: 'elsőre lefut' })
  const [style, setStyle] = useState({ font: 'impact', size: 60, color: '#ffffff' })
  const { status, image } = useImage(picture.url)

  // Az API így csomagolja a listát: { success: true, data: { memes: [...] } }.
  // Ha a success hamis, az is hiba, akkor is, ha maga a válasz rendben megjött.
  let templateStatus = templates.status
  if (templateStatus === 'success' && !templates.data.success) templateStatus = 'error'
  const memes = templateStatus === 'success' ? templates.data.data.memes : []
  // A saját kép, ha van, a sablonok elé kerül.
  const pictures = upload ? [upload, ...memes] : memes

  function chooseFile(file) {
    // Az előző feltöltés ideiglenes címére már nincs szükség: felszabadítjuk a memóriát.
    if (upload) URL.revokeObjectURL(upload.url)
    const newUpload = { id: 'upload', name: file.name, url: URL.createObjectURL(file) }
    setUpload(newUpload)
    setPicture(newUpload)
  }

  function changeText(key, value) {
    // A text másolata, egy kulcsát új értékre cserélve.
    setText({ ...text, [key]: value })
  }

  function changeStyle(key, value) {
    // A style másolata, egy kulcsát új értékre cserélve.
    setStyle({ ...style, [key]: value })
  }

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas canvasRef={canvasRef} image={image} text={text} style={style} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              A kép betöltése…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              Ezt a képet nem sikerült betölteni.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
          <StyleControls style={style} onChange={changeStyle} />
          <div className="actions">
            <button
              type="button"
              className="button button--primary"
              disabled={status !== 'ready'}
              onClick={() => downloadCanvas(canvasRef.current, 'meme.png')}
            >
              Letöltés PNG-ként
            </button>
          </div>
        </div>
      </div>
      <PicturePicker
        status={templateStatus}
        pictures={pictures}
        selected={picture.id}
        onSelect={setPicture}
        onRetry={templates.retry}
        onFile={chooseFile}
      />
    </main>
  )
}

export default App
```

A gomb le van tiltva (`disabled`), amíg a kép nincs kész: töltés közben a vásznon még a régi kép látszik, és azt
nem akarjuk letölteni az új helyett.

:::check Ellenőrizd
Kattints a „Letöltés PNG-ként” gombra: a böngésző letölti a `meme.png` fájlt. Nyisd meg: ott a kép a feliratokkal,
pontosan úgy, ahogy a vásznon, csak teljes méretben (a bögrénél 800 × 800 pixel). Válassz egy másik sablont vagy a
saját képedet, és töltsd le azt is: a fájlban mindig az van, ami éppen a vásznon. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
`downloadCanvas(canvasRef, 'meme.png')`, a `.current` nélkül. A `canvasRef` csak a doboz, nem maga a vászon, és a
dobozon nincs `toBlob`: a konzolban „canvas.toBlob is not a function” áll. A vászon a doboz `current` rekeszében van.
:::

:::try Próbáld ki
Tölts le JPEG-et is: a `toBlob` harmadik paramétere a minőség 0 és 1 között, így:
`canvas.toBlob(…, 'image/jpeg', 0.9)`, a fájlnév pedig `meme.jpg`. Hasonlítsd össze a két fájl méretét: a JPEG egy
fotónál sokkal kisebb, a sablonok éles, egyszínű foltjainál viszont a széleken kis maszatok jelennek meg.
:::

## Haladó szint {level=3}

### A feliratok helye és doboza

A feliratok eddig ragaszkodtak a kép tetejéhez és aljához. A következő két lépésben bárhová húzhatók lesznek, egérrel
és ujjal is. Ehhez három dolog kell:

1. A feliratok helye állapot lesz az `App`-ban.
2. A rajzolás megmondja, hová rajzolta a feliratokat: minden feliratnak lesz egy „doboza” a vásznon.
3. A vászon figyeli a mutatót: ha egy dobozban nyomod le, a felirat a mutatóval megy, amíg fel nem engeded.

Ebben a lépésben az első kettő készül el, a mutató a következőben jön.

**A hely.** Egy felirat helyét két szám adja, de nem pixelben, hanem a vászon **arányában**: az `x: 0.5` a vászon
szélességének közepe, az `y: 0.04` a magasságának 4%-a. Így a hely akkor is értelmes marad, ha másik, más méretű képet
választasz. A felső feliratnál ez a felirat tetejének, az alsónál az aljának a helye, ugyanúgy, ahogy eddig.

**A doboz.** Hogy a mutató eltalált-e egy feliratot, azt egy [[találatvizsgálat]] dönti el: benne van-e a pont a
felirat dobozában. A dobozt a `drawCaption` már úgyis tudja, hiszen az számolta ki a sorokat. Ezért visszaadja: a
közepét (`cx`, `cy`), a szélességét (a leghosszabb sor) és a magasságát (a sorok száma × a sormagasság). A `drawMeme`
pedig az összes dobozt visszaadja egy tömbben, mindegyiket a felirat azonosítójával (`'top'` vagy `'bottom'`) és a
helyével együtt.

Az `src/drawMeme.js`-ben három dolog változik: a `drawCaption` visszaadja a dobozát, a `drawMeme` a feliratok helyét is
megkapja, és visszaadja a dobozokat, a végére pedig egy új függvény kerül, az `isInside`. A fájl eleje (`FONTS`,
`canvasSize`, `wrapLines`, `outlineFor`) nem változik; a `drawCaption`-től a fájl végéig cserélj le mindent erre (a `…`
kezdetű megjegyzés helyén minden marad, ahogy volt):

```js file=src/drawMeme.js mark=4,18,20,35-37,40,49-58,61-68
// … a fájl eleje (FONTS, a két MAX_ állandó, canvasSize, wrapLines, outlineFor), mint eddig

// Egy felirat mémstílusban: csupa nagybetű, körvonallal, szükség esetén több sorban.
// Visszaadja a dobozát: a közepét, a szélességét és a magasságát.
function drawCaption(ctx, text, { x, y, maxWidth, fontSize, font, color, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // Ha egy szó egymagában is túl széles, kisebb betűvel próbáljuk újra (legfeljebb nyolcszor).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  const height = lines.length * lineHeight
  // Az alsó felirat alulról felfelé nő: annyi sorral feljebb kezdjük, ahány sora van.
  const top = fromBottom ? y - height : y

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    const lineY = top + i * lineHeight
    // Előbb a körvonal, aztán rá a kitöltés: így a vonal nem takarja ki a betűket.
    ctx.strokeText(line, x, lineY)
    ctx.fillText(line, x, lineY)
  })

  // A doboz szélessége a leghosszabb sor. (A 0 akkor kell, ha a felirat üres, és egy sora sincs.)
  const width = Math.max(0, ...lines.map((line) => ctx.measureText(line).width))
  return { cx: x, cy: top + height / 2, width, height }
}

export function drawMeme(canvas, image, { text, style, positions }) {
  const { width, height } = canvasSize(image)
  // A méret beállítása mindent letöröl a vászonról: tiszta lappal kezdünk.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // Ami mindkét feliratnál ugyanaz. A style.size egy 800 pixel széles mémre vonatkozik.
  const common = { maxWidth: width * 0.92, fontSize: (style.size * width) / 800, font: style.font, color: style.color }
  // A dobozokból tudja majd a húzás, mi hol van a vásznon.
  const boxes = []
  for (const id of ['top', 'bottom']) {
    const { x, y } = positions[id]
    // A hely arány (0 és 1 között), a rajzoláshoz pixel kell: megszorozzuk a vászon méretével.
    const box = drawCaption(ctx, text[id], { ...common, x: x * width, y: y * height, fromBottom: id === 'bottom' })
    boxes.push({ id, x, y, ...box })
  }
  return boxes
}

// Benne van-e a pont a dobozban? 12 pixel ráhagyással, hogy könnyű legyen megfogni.
export function isInside(point, box) {
  // Az üres feliratnak nincs doboza: azt nem lehet megfogni.
  if (box.width === 0) return false
  const dx = Math.abs(point.x - box.cx)
  const dy = Math.abs(point.y - box.cy)
  return dx <= box.width / 2 + 12 && dy <= box.height / 2 + 12
}
```

- A `Math.max(0, ...lines.map(…))` a sorok szélességei közül a legnagyobbat adja. A `...` itt egy tömböt szór szét
  külön paraméterekre, mert a `Math.max` nem tömböt vár, hanem számokat egymás után.
- A `for (const id of ['top', 'bottom'])` egy ciklusban rajzolja mindkét feliratot: a `text[id]` és a `positions[id]`
  azt a mezőt veszi ki, amelynek a neve az `id` változóban van, a `fromBottom` pedig akkor igaz, ha az `id` értéke
  `'bottom'`.
- A `{ id, x, y, ...box }` egy új objektum: az azonosító, a hely, és a doboz négy mezője.
- Az `isInside` a pont és a doboz közepe közötti távolságot nézi, külön vízszintesen és függőlegesen. A `Math.abs` az
  [[abszolút érték]]: elhagyja a mínuszjelet, így mindegy, hogy a pont balra vagy jobbra van a középtől.

A vászon megkapja a feliratok helyét, és továbbadja a `drawMeme`-nek. A visszakapott dobozokat egy refben tartja
(`boxesRef`), nem állapotban: a képernyőn semmi sem függ tőlük közvetlenül, és nem kell újrarajzolni, amikor
beállítjuk őket. A rajzolás tölti fel, a következő lépésben pedig a mutató eseményei olvassák. Itt a teljes
`src/components/MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=1,4-7,9,11-12
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ canvasRef, image, text, style, positions }) {
  // A rajzolás után itt vannak a feliratok dobozai.
  // Nem kell kirajzolni őket, ezért ref, nem állapot: a változásuk nem rajzolja újra a komponenst.
  const boxesRef = useRef([])

  // Az első kirajzolás után, és valahányszor változik valami, amit a mém mutat: újrafestjük a vásznat.
  useEffect(() => {
    if (image) boxesRef.current = drawMeme(canvasRef.current, image, { text, style, positions })
  }, [canvasRef, image, text, style, positions])

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas"
      width="800"
      height="800"
      role="img"
      aria-label={`Mém. Felül: ${text.top}. Alul: ${text.bottom}.`}
    />
  )
}

export default MemeCanvas
```

Az `App`-ban a feliratok helye állapot lesz, és a vászon propként kapja meg. A `setPositions` a következő lépésben kap
munkát, a húzásnál. Ez a változás (a `…` kezdetű megjegyzések helyén minden marad, ahogy volt):

```jsx file=src/App.jsx mark=3-8,12,22
// … az importok és a két állandó, mint eddig

// A feliratok helye a vászon szélességének és magasságának arányában (0 = bal, illetve felső szél, 1 = jobb, illetve
// alsó szél). A felső feliratnál a teteje, az alsónál az alja van az y magasságban.
const START_POSITIONS = {
  top: { x: 0.5, y: 0.04 },
  bottom: { x: 0.5, y: 0.96 },
}

function App() {
  // … a canvasRef, a templates, a picture, az upload, a text és a style, mint eddig
  const [positions, setPositions] = useState(START_POSITIONS)
  // … a useImage, a templateStatus, a memes, a pictures, a chooseFile, a changeText és a changeStyle, mint eddig

  return (
    // … minden, mint eddig, egészen a vászonig
          <MemeCanvas
            canvasRef={canvasRef}
            image={image}
            text={text}
            style={style}
            positions={positions}
          />
    // … minden más, mint eddig
  )
}
```

:::check Ellenőrizd
A vászon ugyanúgy néz ki, mint eddig, csak most a feliratok helye a `positions` állapotból jön. Írd át a
`START_POSITIONS`-ben a felső felirat `y`-ját `0.3`-ra, mentsd el, és frissítsd az oldalt: a felirat lejjebb kerül, a
teteje a kép magasságának 30%-ánál van. (Az újratöltés azért kell, mert a `useState` kezdőértéke csak az első
kirajzoláskor számít.) Válassz egy más alakú képet, például a csigát: a felirat ott is a magasság 30%-ánál áll. Utána
állítsd vissza `0.04`-re.
:::

:::mistake Gyakori hiba
A helyet pixelben írod: `top: { x: 0.5, y: 30 }`. A rajzolás ezt is megszorozza a vászon magasságával, így a felirat
teteje 30 × 800, vagyis 24 000 pixellel kerülne lejjebb, messze a vászon alá: a felirat egyszerűen eltűnik, hibaüzenet
nélkül. A hely mindig 0 és 1 közötti arány.
:::

:::try Próbáld ki
Nézz bele a dobozokba. Írd be az effektbe, a `drawMeme` sora után: `console.log(boxesRef.current)`, és nyisd meg a
konzolt (++F12++ → Console). Az utolsó kiírt tömbben két objektumot látsz, a `'top'` és a `'bottom'` feliratét, a közepükkel (`cx`, `cy`), a
szélességükkel és a magasságukkal. Írj egy hosszabb felső szöveget: a felső doboz `height` értéke nő, ahogy a felirat
több sorba törik. Ha megnézted, töröld ki a sort.
:::

### Húzás a mutatóval

Most jön a harmadik dolog: a vászon figyeli a mutatót, és a megfogott felirat a mutatóval megy.

**A mutató.** A 17. lecke zongorájánál a [[pointeresemények|pointeresemény]] szóltak, ha lenyomtál vagy felengedtél
egy zongorabillentyűt; most a mozgás is kell. A `pointerdown` a lenyomáskor jön, a `pointermove` minden mozdulatnál, a
`pointerup` a felengedéskor, a `pointercancel` pedig akkor, ha a böngésző félbeszakítja a mozdulatot (például egy
értesítés miatt). A mutató helyét az esemény `clientX` és `clientY` mezője adja, az ablak bal felső sarkától, a
képernyő pixeleiben.

Két átváltás kell:

- **A találathoz vászonpixel kell.** A vászon a képernyőn szinte mindig kisebb a rajzlapjánál: széles ablakban is
  legfeljebb kb. 600 pixel széles, egy telefonon a 800 pixeles rajz akár csak 340. A `getBoundingClientRect()` megmondja, hol van a vászon a képernyőn, és mekkora
  ott; ebből a `toCanvasPoint` kiszámolja, a rajzlap melyik pixelére mutat a mutató.
- **A helyhez arány kell.** Ha a mutató a vászon képernyőn látható szélességének 10%-ával ment jobbra, a felirat is
  ennyivel megy: az új `x` a húzás kezdetén érvényes `x`, plusz az elmozdulás osztva a vászon képernyős szélességével.

Ha húzás közben kiér a mutató a vászonról, a `pointermove` események már a mellette lévő elemnek szólnának, és a felirat
megakadna. A [[pointer capture]] (a mutató „lefoglalása”) ezt akadályozza meg: a `setPointerCapture(pointerId)` után
ennek a mutatónak minden eseménye ehhez az elemhez jön, amíg fel nem engeded.

Hogy épp mit húzunk, azt egy második ref jegyzi meg (`dragRef`), ugyanazért, amiért a dobozok is refben vannak: a
képernyőn semmi sem függ tőle közvetlenül, és nem kell újrarajzolni, amikor beállítjuk. Hogy mi hol van a vásznon,
azt a mutató eseményei az előző lépésben feltöltött `boxesRef`-ből olvassák ki. Itt a teljes
`src/components/MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=2,4-7,9-11,13,20-28,30-38,40-49,51-53,58,63-66
import { useEffect, useRef } from 'react'
import { drawMeme, isInside } from '../drawMeme.js'

// Egy szám 0 és 1 közé szorítva: így semmit sem lehet teljesen lehúzni a vászonról.
function clamp(value) {
  return Math.min(1, Math.max(0, value))
}

function MemeCanvas({ canvasRef, image, text, style, positions, onChange }) {
  // A rajzolás után itt vannak a feliratok dobozai, húzás közben pedig az, hogy mit húzunk.
  // Egyiket sem kell kirajzolni, ezért ref, nem állapot: a változásuk nem rajzolja újra a komponenst.
  const boxesRef = useRef([])
  const dragRef = useRef(null)

  // Az első kirajzolás után, és valahányszor változik valami, amit a mém mutat: újrafestjük a vásznat.
  useEffect(() => {
    if (image) boxesRef.current = drawMeme(canvasRef.current, image, { text, style, positions })
  }, [canvasRef, image, text, style, positions])

  // A mutató helye a vászon saját pixeleiben (a képernyőn a vászon kisebb is lehet, mint a rajzlapja).
  function toCanvasPoint(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function handlePointerDown(event) {
    const point = toCanvasPoint(event)
    // Hátulról keresünk: ami később rajzolódott, az van felül.
    const box = boxesRef.current.findLast((item) => isInside(point, item))
    if (!box) return
    // Mostantól ennek a mutatónak minden mozdulata ehhez a vászonhoz jön, akkor is, ha lecsúszik róla.
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: box.id, startX: event.clientX, startY: event.clientY, x: box.x, y: box.y }
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag) return
    const rect = canvasRef.current.getBoundingClientRect()
    // Az elmozdulás a vászon képernyős szélességének, illetve magasságának arányában.
    onChange(drag.id, {
      x: clamp(drag.x + (event.clientX - drag.startX) / rect.width),
      y: clamp(drag.y + (event.clientY - drag.startY) / rect.height),
    })
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas meme__canvas--draggable"
      width="800"
      height="800"
      role="img"
      aria-label={`Mém. Felül: ${text.top}. Alul: ${text.bottom}.`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  )
}

export default MemeCanvas
```

- A `findLast` a tömb végéről indulva adja az első elemet, amelyre a feltétel igaz, ahogy a [[find]] az elejéről. A
  dobozok rajzolási sorrendben vannak, így a legutoljára rajzolt, vagyis a legfelül lévő nyer.
- A `dragRef.current` a húzás kezdetéről mindent megjegyez: mit húzunk, hol volt akkor a mutató, és hol volt a
  felirat. Minden mozdulatnál ezekből számoljuk az új helyet, nem az előző mozdulatból: így nem halmozódnak a
  kerekítési hibák.
- Az `event.currentTarget` maga a vászon (az az elem, amelyiken a kezelő ül).
- A `meme__canvas--draggable` osztály kézre cseréli az egérmutatót, és a `touch-action: none` szabállyal megkéri a
  böngészőt, hogy a vásznon húzott ujjal ne görgesse az oldalt.

Az `App`-ban egy új függvény, az `updateItem` módosítja a feliratok helyét. A vászon a húzás minden mozdulatánál
hívja, másodpercenként akár hatvanszor is. Ezért a `setPositions` itt egy [[frissítő függvényt|frissítő függvény]] kap,
ahogy a 6. és a 7. leckében: a `current` mindig a legfrissebb állapot, akkor is, ha két mozdulat között a React még nem
rajzolt újra. Ez a változás (a `…` kezdetű megjegyzések helyén minden marad, ahogy volt):

```jsx file=src/App.jsx mark=6-10,20
// … az importok, a két állandó és a START_POSITIONS, mint eddig

function App() {
  // … minden állapot és függvény, mint eddig

  // Egy felirat módosítása: a changes mezői (például x és y) felülírják a régieket.
  function updateItem(id, changes) {
    // Frissítő függvény: húzás közben gyors egymásutánban jönnek a hívások, a current mindig a legfrissebb állapot.
    setPositions((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
  }

  return (
    // … minden, mint eddig, egészen a vászonig
          <MemeCanvas
            canvasRef={canvasRef}
            image={image}
            text={text}
            style={style}
            positions={positions}
            onChange={updateItem}
          />
    // … minden más, mint eddig
  )
}
```

:::check Ellenőrizd
Vidd az egeret a vászonra: a mutató kézzé változik. Fogd meg a felső feliratot, és húzd le a kép közepére: a mutatóval
megy, és ott marad, ahol elengeded. Húzd az alsót is valahová. Az üres részeken a húzás nem csinál semmit. Töltsd le a
mémet: a feliratok az új helyükön vannak a PNG-n is. Az érintést a fejlesztői eszközök telefonnézetében próbálhatod
ki (++F12++, aztán ++Ctrl++ + ++Shift++ + ++M++): ott az egér ujjként viselkedik, és a húzás ugyanígy működik. Igazi
telefonon a lecke Megoldás fülén próbálhatod ki, mert a saját appod álszervere csak a `localhost` címen fut.
:::

:::mistake Gyakori hiba
A mutató helyét átváltás nélkül használod: `{ x: event.offsetX, y: event.offsetY }`. Ez csak akkor működne, ha a
vászon a képernyőn is 800 pixel széles lenne, de szinte mindig kisebb a rajzlapjánál: széles ablakban is legfeljebb
kb. 600 pixel, telefonon még keskenyebb. A találat ezért elcsúszik: a feliratot csak tőle jobbra lent lehet megfogni. A
képernyő pixeleit mindig át kell váltani a rajzlap pixeleire.
:::

:::try Feladat
Kerüljön a „Letöltés PNG-ként” gomb mellé egy „Helyek visszaállítása” gomb: `setPositions(START_POSITIONS)`.
Kattintásra mindkét felirat visszaugrik a helyére. (A lecke végén közölt teljes `src/App.jsx` a gomb nélkül mutatja a
kódot; ha megcsináltad, a gombod maradjon a „Letöltés PNG-ként” gomb mellett.)
:::

### Forgatás

Egy ferdén álló felirat sokszor viccesebb. A forgatáshoz két dolog kell: tudni, melyik elemet forgatjuk (a
**kijelölt** elemet), és egy csúszka, ami 180 fokkal balra és jobbra fordítja.

A vászon nem az egyes betűket forgatja, hanem a teljes [[koordináta-rendszerét|koordináta-rendszer]], vagyis azt a
láthatatlan rácsot, amelyen az x és az y helyét méri. A `ctx.translate(x, y)` eltolja a rács origóját, a (0, 0) pontot,
a megadott helyre; a `ctx.rotate(szög)` pedig az origó körül elforgatja a rácsot. Ami ezután rajzolódik, az mind
eltolva és elforgatva kerül a vászonra. A felirat a saját közepe körül forduljon, ezért az origót a közepére toljuk, ott
forgatunk, és a sorokat a (0, 0)-hoz képest rajzoljuk.

A forgatás a következő rajzolásokra is érvényes maradna, a második felirat már a forgatott rácsra kerülne. Ezért a
forgatást a [[save és restore]] párosa fogja közre: a `ctx.save()` elteszi a rajzkörnyezet minden beállítását (az eltolást, a
forgatást, a színeket, a betűt), a `ctx.restore()` pedig pontosan oda állítja vissza.

A `rotate` nem fokban, hanem [[radiánban|radián]] méri a szöget: egy teljes kör 2π radián, vagyis 360 fok egyenlő
2 × 3,14… radiánnal. A felhasználó fokban gondolkodik, a rajzoláshoz pedig ezt váltjuk át: `fok × π / 180`.

A találatvizsgálat is változik. Egy elforgatott doboz már nem egyenes téglalap. A trükk: a pontot forgatjuk vissza a
doboz közepe körül, ugyanakkora szöggel, csak az ellenkező irányba. Az így kapott pont ugyanott van az egyenes
dobozhoz képest, ahol az eredeti a ferdéhez képest, így elég az egyenes dobozt vizsgálni. A forgatás képlete két sor
[[szögfüggvénnyel|szögfüggvény]] (`Math.cos`, `Math.sin`); nem kell fejből tudni, egyszer kell jól megírni.

Az `src/drawMeme.js` fájlban a `drawCaption` forgatva rajzol, és a dobozába a szög is bekerül, a `drawMeme` átadja a
szöget, az `isInside` visszaforgatja a pontot, és van egy új kis függvény, a `toRadians`. Az `outlineFor` utáni részt a
fájl végéig cseréld le erre (a `…` kezdetű megjegyzések helyén minden marad, ahogy volt):

```js file=src/drawMeme.js mark=3-6,8-9,25,29-32,40-43,45-46,48,56,62,70,74-80
// … a fájl eleje (FONTS, a két MAX_ állandó, canvasSize, wrapLines, outlineFor), mint eddig

// Fokból radián: a vászon forgatása radiánban méri a szöget (a teljes kör 2π).
function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

// Egy felirat mémstílusban, a saját közepe körül angle fokkal elforgatva. Visszaadja a dobozát.
function drawCaption(ctx, text, { x, y, angle, maxWidth, fontSize, font, color, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // Ha egy szó egymagában is túl széles, kisebb betűvel próbáljuk újra (legfeljebb nyolcszor).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  const height = lines.length * lineHeight
  // Az alsó felirat alulról felfelé nő: annyi sorral feljebb kezdjük, ahány sora van.
  const top = fromBottom ? y - height : y
  const center = top + height / 2
  // A doboz szélessége a leghosszabb sor. (A 0 akkor kell, ha a felirat üres, és egy sora sincs.)
  const width = Math.max(0, ...lines.map((line) => ctx.measureText(line).width))

  ctx.save()
  // Az origót a felirat közepére toljuk, és ott forgatunk: így a felirat a saját közepe körül fordul.
  ctx.translate(x, center)
  ctx.rotate(toRadians(angle))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    // A sorok helye mostantól a felirat közepéhez képest: a legfelső sor a magasság felével feljebb kezdődik.
    const lineY = -height / 2 + i * lineHeight
    ctx.strokeText(line, 0, lineY)
    ctx.fillText(line, 0, lineY)
  })
  // Vissza minden beállítás (az eltolás és a forgatás is) oda, ahol a save() előtt volt.
  ctx.restore()

  return { cx: x, cy: center, width, height, angle }
}

export function drawMeme(canvas, image, { text, style, positions }) {
  // … a vászon méretezése, a kép és a common, mint eddig
  // A dobozokból tudja majd a húzás, mi hol van a vásznon.
  const boxes = []
  for (const id of ['top', 'bottom']) {
    const { x, y, angle } = positions[id]
    // A hely arány (0 és 1 között), a rajzoláshoz pixel kell: megszorozzuk a vászon méretével.
    const box = drawCaption(ctx, text[id], {
      ...common,
      x: x * width,
      y: y * height,
      angle,
      fromBottom: id === 'bottom',
    })
    boxes.push({ id, x, y, ...box })
  }
  return boxes
}

// Benne van-e a pont az (esetleg elforgatott) dobozban? 12 pixel ráhagyással, hogy könnyű legyen megfogni.
export function isInside(point, box) {
  // Az üres feliratnak nincs doboza: azt nem lehet megfogni.
  if (box.width === 0) return false
  // A pontot visszaforgatjuk a doboz közepe körül: így elég egy egyenes téglalapot vizsgálni.
  const dx = point.x - box.cx
  const dy = point.y - box.cy
  const turn = toRadians(-box.angle)
  const localX = dx * Math.cos(turn) - dy * Math.sin(turn)
  const localY = dx * Math.sin(turn) + dy * Math.cos(turn)
  return Math.abs(localX) <= box.width / 2 + 12 && Math.abs(localY) <= box.height / 2 + 12
}
```

A `drawMeme` eleje, a `// … a vászon méretezése` megjegyzés helyén, szóról szóra ugyanaz, mint eddig: a
`canvasSize`, a két `canvas.` sor, a `ctx`, a `drawImage` és a `common`.

A kijelölést és a csúszkát egy új kártya mutatja. Fent egy-egy gomb minden elemnek (egyelőre a két feliratnak), a
kijelöltnek `aria-pressed="true"`-val, alatta a csúszka. Hozd létre az `src/components/ItemControls.jsx` fájlt:

```jsx file=src/components/ItemControls.jsx
function ItemControls({ items, selectedId, angle, onSelect, onRotate }) {
  return (
    <fieldset className="panel">
      <legend>Kijelölt elem</legend>
      <div className="chips">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={item.id === selectedId}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Forgatás: {angle}°</span>
        <input
          type="range"
          min="-180"
          max="180"
          value={angle}
          onChange={(event) => onRotate(Number(event.target.value))}
        />
      </label>
    </fieldset>
  )
}

export default ItemControls
```

Ha a vásznon fogsz meg egy feliratot, az is legyen kijelölve. A `MemeCanvas` egy új propot kap, az `onSelect`-et, és a
`handlePointerDown` a húzás kezdetén meghívja. A `MemeCanvas.jsx`-ben két hely változik:

```jsx file=src/components/MemeCanvas.jsx mark=1,12
function MemeCanvas({ canvasRef, image, text, style, positions, onSelect, onChange }) {
  // … a két ref, az effekt és a toCanvasPoint, mint eddig

  function handlePointerDown(event) {
    const point = toCanvasPoint(event)
    // Hátulról keresünk: ami később rajzolódott, az van felül.
    const box = boxesRef.current.findLast((item) => isInside(point, item))
    if (!box) return
    // Mostantól ennek a mutatónak minden mozdulata ehhez a vászonhoz jön, akkor is, ha lecsúszik róla.
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: box.id, startX: event.clientX, startY: event.clientY, x: box.x, y: box.y }
    onSelect(box.id)
  }

  // … a handlePointerMove, a handlePointerUp és a return, mint eddig
}
```

Az `App`-ban a feliratok helyéhez a szögük is bekerül (`angle: 0`), egy új állapot megjegyzi, melyik elem van
kijelölve, a `CAPTIONS` pedig a kártya gombjainak a felirata. A csúszka a kijelölt elem szögét mutatja, és ugyanazzal
az `updateItem`-mel forgat, amivel a húzás mozgat; csak most a `changes` objektumban `angle` van, nem `x` és `y`:

```jsx file=src/App.jsx mark=1,6-7,9-13,17,24,29-35
import ItemControls from './components/ItemControls.jsx'
// … a többi import és a két régi állandó, mint eddig

// … a START_POSITIONS fölötti megjegyzés, mint eddig
const START_POSITIONS = {
  top: { x: 0.5, y: 0.04, angle: 0 },
  bottom: { x: 0.5, y: 0.96, angle: 0 },
}
// A kijelölhető elemek a kártya gombjain.
const CAPTIONS = [
  { id: 'top', label: 'Felső szöveg' },
  { id: 'bottom', label: 'Alsó szöveg' },
]

function App() {
  // … minden állapot, mint eddig
  const [selectedId, setSelectedId] = useState('top')
  // … minden függvény, mint eddig

  return (
    // … minden, mint eddig, egészen a vászonig
          <MemeCanvas
            // … a többi prop, mint eddig
            onSelect={setSelectedId}
            onChange={updateItem}
          />
    // … a két üzenet és a vezérlők eleje, mint eddig
          <StyleControls style={style} onChange={changeStyle} />
          <ItemControls
            items={CAPTIONS}
            selectedId={selectedId}
            angle={positions[selectedId].angle}
            onSelect={setSelectedId}
            onRotate={(angle) => updateItem(selectedId, { angle })}
          />
    // … a letöltőgomb és minden más, mint eddig
  )
}
```

:::check Ellenőrizd
Megjelenik a „Kijelölt elem” kártya, a „Felső szöveg” ki van emelve. Húzd lejjebb egy kicsit a felső feliratot, aztán
a csúszkát 20 fokra: a felirat a saját közepe körül elfordul az óramutató járásával megegyező irányba, a jobb vége
lejjebb, a bal vége feljebb kerül. (Ha a kép legtetején hagyod, a bal vége kilóg a vászonról: ez nem hiba, csak húzd
lejjebb.) Kattints a vásznon az alsó feliratra: a kártyán az „Alsó szöveg” lesz kiemelve, a
csúszka pedig 0-ra ugrik, mert annak a szöge még 0. Forgasd el ezt is, aztán fogd meg a ferde felső feliratot
bármelyik betűjénél, és húzd el: a ferde dobozon belül bárhol megfogható.
:::

:::mistake Gyakori hiba
Kimarad a `ctx.restore()`. Az első felirat még jól áll, de a második már az első eltolt és elforgatott rácsára
rajzolódik: rossz helyre kerül, kétszeresen elforgatva, vagy egészen lecsúszik a vászonról. Minden `save()`-hez tartozik
egy `restore()`.
:::

:::try Próbáld ki
Írd át a forgatást a `toRadians` nélkül: `ctx.rotate(angle)`. A csúszka 1-es lépése most egy teljes radián, vagyis
majdnem 60 fok: a felirat már kis mozdulatra is körbe-körbe pörög. Ezért kell az átváltás. Utána állítsd vissza.
:::

### Matricák

Mi kell még egy mémre? Emojimatricák! Egy matrica ugyanúgy húzható és forgatható, mint egy felirat, csak egyetlen
emojiból áll. A matricák listája az `App` állapotában lesz: mindegyiknek van azonosítója, emojija, helye (a közepe, a
vászon arányában) és szöge.

Előbb a választó: egy sor gomb, mindegyiken egy emoji. Kattintásra a matrica a vászon közepére kerül. Hozd létre az
`src/components/StickerBar.jsx` fájlt:

```jsx file=src/components/StickerBar.jsx
const STICKERS = ['😂', '😎', '🔥', '💯', '👀', '🎉', '❤️', '🤔']

function StickerBar({ onAdd }) {
  return (
    <fieldset className="panel">
      <legend>Matricák</legend>
      <div className="stickers">
        {STICKERS.map((emoji) => (
          <button key={emoji} type="button" className="sticker" onClick={() => onAdd(emoji)}>
            {emoji}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default StickerBar
```

Egy emojit a vászon is szövegként rajzol, a `fillText`-tel: ugyanúgy, mint a QR-kód közepére az 5. leckében. A
betűcsalád most a rendszer emojibetűit sorolja fel (Windowson Segoe UI Emoji, Apple gépeken Apple Color Emoji,
Androidon és Linuxon Noto Color Emoji): ezek színesek, és mindegyik rendszer eleve magával hozza a sajátját. A matrica is a saját közepe körül
fordul, és a dobozát is visszaadja. Itt a teljes `src/drawMeme.js`, ahogy a lecke végén kinéz:

```js file=src/drawMeme.js mark=11-12,103-115,117,141-150
// Minden, ami a vászonra rajzol. Reactet nem használ, csak a vászon saját rajzeszközeit.

// A választható betűtípusok. Mind rendszerbetű: azonnal rajzolhatók, nem kell letölteni őket.
export const FONTS = {
  impact: { label: 'Impact', family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  arial: { label: 'Arial Black', family: "'Arial Black', 'Arial Bold', Arial, sans-serif" },
  comic: { label: 'Comic Sans', family: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" },
  georgia: { label: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
}

// A matricák emojijai a rendszer színes emojibetűivel (Windows, Apple, Android és Linux).
const EMOJI_FONT = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif"

// A mém legfeljebb ekkora lehet (pixelben). A kép arányai közben megmaradnak.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// Mekkora legyen a vászon, hogy a kép torzítás nélkül, egészben ráférjen?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

// Szavanként sorokra bontja a szöveget, hogy egyik sor se legyen szélesebb a maxWidth-nél.
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ').filter((word) => word !== '')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line === '' ? word : `${line} ${word}`
    if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
      // A szó már nem fér ki: a sor kész, a szó a következő sort kezdi.
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line !== '') lines.push(line)
  return lines
}

// Világos betűhöz fekete, sötéthez fehér körvonal: így minden képen olvasható marad.
function outlineFor(hex) {
  const red = parseInt(hex.slice(1, 3), 16)
  const green = parseInt(hex.slice(3, 5), 16)
  const blue = parseInt(hex.slice(5, 7), 16)
  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue
  return brightness > 140 ? '#000000' : '#ffffff'
}

// Fokból radián: a vászon forgatása radiánban méri a szöget (a teljes kör 2π).
function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

// Egy felirat mémstílusban, a saját közepe körül angle fokkal elforgatva. Visszaadja a dobozát.
function drawCaption(ctx, text, { x, y, angle, maxWidth, fontSize, font, color, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // Ha egy szó egymagában is túl széles, kisebb betűvel próbáljuk újra (legfeljebb nyolcszor).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  const height = lines.length * lineHeight
  // Az alsó felirat alulról felfelé nő: annyi sorral feljebb kezdjük, ahány sora van.
  const top = fromBottom ? y - height : y
  const center = top + height / 2
  // A doboz szélessége a leghosszabb sor. (A 0 akkor kell, ha a felirat üres, és egy sora sincs.)
  const width = Math.max(0, ...lines.map((line) => ctx.measureText(line).width))

  ctx.save()
  // Az origót a felirat közepére toljuk, és ott forgatunk: így a felirat a saját közepe körül fordul.
  ctx.translate(x, center)
  ctx.rotate(toRadians(angle))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    // A sorok helye mostantól a felirat közepéhez képest: a legfelső sor a magasság felével feljebb kezdődik.
    const lineY = -height / 2 + i * lineHeight
    ctx.strokeText(line, 0, lineY)
    ctx.fillText(line, 0, lineY)
  })
  // Vissza minden beállítás (az eltolás és a forgatás is) oda, ahol a save() előtt volt.
  ctx.restore()

  return { cx: x, cy: center, width, height, angle }
}

// Egy matrica: egy emoji, a közepe az (x, y) pontban, angle fokkal elforgatva. Visszaadja a dobozát.
function drawSticker(ctx, emoji, { x, y, angle, size }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(toRadians(angle))
  ctx.font = `${size}px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 0, 0)
  ctx.restore()

  return { cx: x, cy: y, width: size, height: size, angle }
}

export function drawMeme(canvas, image, { text, style, positions, stickers }) {
  const { width, height } = canvasSize(image)
  // A méret beállítása mindent letöröl a vászonról: tiszta lappal kezdünk.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // Ami mindkét feliratnál ugyanaz. A style.size egy 800 pixel széles mémre vonatkozik.
  const common = { maxWidth: width * 0.92, fontSize: (style.size * width) / 800, font: style.font, color: style.color }
  // A dobozokból tudja majd a húzás, mi hol van a vásznon.
  const boxes = []
  for (const id of ['top', 'bottom']) {
    const { x, y, angle } = positions[id]
    // A hely arány (0 és 1 között), a rajzoláshoz pixel kell: megszorozzuk a vászon méretével.
    const box = drawCaption(ctx, text[id], {
      ...common,
      x: x * width,
      y: y * height,
      angle,
      fromBottom: id === 'bottom',
    })
    boxes.push({ id, x, y, ...box })
  }
  // A matricák a feliratok fölé kerülnek, mindegyik a vászon szélességének 18%-ával.
  for (const sticker of stickers) {
    const box = drawSticker(ctx, sticker.emoji, {
      x: sticker.x * width,
      y: sticker.y * height,
      angle: sticker.angle,
      size: width * 0.18,
    })
    boxes.push({ id: sticker.id, x: sticker.x, y: sticker.y, ...box })
  }
  return boxes
}

// Benne van-e a pont az (esetleg elforgatott) dobozban? 12 pixel ráhagyással, hogy könnyű legyen megfogni.
export function isInside(point, box) {
  // Az üres feliratnak nincs doboza: azt nem lehet megfogni.
  if (box.width === 0) return false
  // A pontot visszaforgatjuk a doboz közepe körül: így elég egy egyenes téglalapot vizsgálni.
  const dx = point.x - box.cx
  const dy = point.y - box.cy
  const turn = toRadians(-box.angle)
  const localX = dx * Math.cos(turn) - dy * Math.sin(turn)
  const localY = dx * Math.sin(turn) + dy * Math.cos(turn)
  return Math.abs(localX) <= box.width / 2 + 12 && Math.abs(localY) <= box.height / 2 + 12
}
```

A matricák a feliratok **után** rajzolódnak, ezért felülre kerülnek, és a dobozaik is a lista végére. A
`handlePointerDown` `findLast`-ja hátulról keres, így egy felirat fölé húzott matricát fogsz meg, nem az alatta lévő
betűket. A matricánál a hely a közepe (`textBaseline = 'middle'`), nem a teteje vagy az alja, mint a feliratoknál.

A vászon a matricákat is megkapja, és átadja a `drawMeme`-nek. A `MemeCanvas.jsx`-ben két hely változik:

```jsx file=src/components/MemeCanvas.jsx mark=1,9-10
function MemeCanvas({ canvasRef, image, text, style, positions, stickers, onSelect, onChange }) {
  // A rajzolás után itt vannak a feliratok dobozai, húzás közben pedig az, hogy mit húzunk.
  // Egyiket sem kell kirajzolni, ezért ref, nem állapot: a változásuk nem rajzolja újra a komponenst.
  const boxesRef = useRef([])
  const dragRef = useRef(null)

  // Az első kirajzolás után, és valahányszor változik valami, amit a mém mutat: újrafestjük a vásznat.
  useEffect(() => {
    if (image) boxesRef.current = drawMeme(canvasRef.current, image, { text, style, positions, stickers })
  }, [canvasRef, image, text, style, positions, stickers])

  // … a toCanvasPoint, a három kezelő és a return, mint eddig
}
```

Végül az `App`. Egy új állapot a matricáknak, egy számláló az azonosítóikhoz, és három változás:

- Az `updateItem` mostantól a matricákat is módosítja. A feliratokat a nevük (`'top'`, `'bottom'`) választja el a
  matricáktól; a matricák közül a `map` azt cseréli le egy módosított másolatra, amelyiknek az azonosítója egyezik.
- A kijelölt elem lehet egy felirat vagy egy matrica. A `positions[selectedId]` egy matrica azonosítójára `undefined`,
  ilyenkor a [[nullish coalescing]] (`??`) a matricák között keres tovább.
- A kártya gombjai között a matricák is megjelennek, és ha egy matrica van kijelölve, egy „Matrica törlése” gomb is.

Az `ItemControls` két új propot kap (`canDelete` és `onDelete`). Itt a teljes `src/components/ItemControls.jsx`:

```jsx file=src/components/ItemControls.jsx mark=1,28-34
function ItemControls({ items, selectedId, angle, canDelete, onSelect, onRotate, onDelete }) {
  return (
    <fieldset className="panel">
      <legend>Kijelölt elem</legend>
      <div className="chips">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={item.id === selectedId}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Forgatás: {angle}°</span>
        <input
          type="range"
          min="-180"
          max="180"
          value={angle}
          onChange={(event) => onRotate(Number(event.target.value))}
        />
      </label>
      {canDelete && (
        <div className="actions">
          <button type="button" className="button" onClick={onDelete}>
            Matrica törlése
          </button>
        </div>
      )}
    </fieldset>
  )
}

export default ItemControls
```

És az `App` változásai (a `…` kezdetű megjegyzések helyén minden marad, ahogy volt):

```jsx file=src/App.jsx mark=1,4-5,9,12,14-18,21-30,32-35,42,48,50-51,54,56
import StickerBar from './components/StickerBar.jsx'
// … a többi import és az állandók, mint eddig

// Minden matrica új azonosítót kap: sticker-1, sticker-2, …
let nextStickerId = 1

function App() {
  // … minden állapot, mint eddig
  const [stickers, setStickers] = useState([])
  // … az updateItem előtti összes függvény, mint eddig

  // Egy felirat vagy egy matrica módosítása: a changes mezői (x, y vagy angle) felülírják a régieket.
  function updateItem(id, changes) {
    if (id === 'top' || id === 'bottom') {
      setPositions((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
    } else {
      setStickers((current) => current.map((sticker) => (sticker.id === id ? { ...sticker, ...changes } : sticker)))
    }
  }

  function addSticker(emoji) {
    const sticker = { id: `sticker-${nextStickerId++}`, emoji, x: 0.5, y: 0.5, angle: 0 }
    setStickers([...stickers, sticker])
    setSelectedId(sticker.id)
  }

  function deleteSticker(id) {
    setStickers(stickers.filter((sticker) => sticker.id !== id))
    setSelectedId('top')
  }

  // A kijelölt elem: egy felirat, vagy ha egyik sem, akkor egy matrica.
  const selected = positions[selectedId] ?? stickers.find((sticker) => sticker.id === selectedId)
  // A kártya gombjai: a két felirat, utánuk a matricák az emojijukkal.
  const items = [...CAPTIONS, ...stickers.map((sticker) => ({ id: sticker.id, label: sticker.emoji }))]

  return (
    // … minden, mint eddig, egészen a vászonig
          <MemeCanvas
            // … a többi prop, mint eddig
            positions={positions}
            stickers={stickers}
            onSelect={setSelectedId}
            onChange={updateItem}
          />
    // … a két üzenet és a vezérlők eleje, mint eddig
          <ItemControls
            items={items}
            selectedId={selectedId}
            angle={selected.angle}
            canDelete={selectedId.startsWith('sticker-')}
            onSelect={setSelectedId}
            onRotate={(angle) => updateItem(selectedId, { angle })}
            onDelete={() => deleteSticker(selectedId)}
          />
          <StickerBar onAdd={addSticker} />
    // … a letöltőgomb és minden más, mint eddig
  )
}
```

A `nextStickerId` a komponensen **kívül** van, ahogy a 12. leckében a feltöltött képek számlálója: egyetlen példányban
létezik, megmarad a rajzolások között, és nem állapot, mert a képernyőn semmi sem függ tőle. A `nextStickerId++` előbb
odaadja a mostani értékét, aztán eggyel növeli. A törlés után a felső felirat lesz kijelölve, mert a törölt matrica már
nem létezik.

:::check Ellenőrizd
Megjelenik a „Matricák” kártya nyolc emojival. Kattints a 😎-ra: a napszemüveges emoji a vászon közepére kerül, és a
„Kijelölt elem” kártyán is megjelenik, kiemelve. Húzd a bögre arcára, forgasd el 30 fokkal. Tegyél fel még egy 🔥-t,
és húzd a felső felirat fölé: a matrica van felül, és ezt fogod meg, nem a betűket. Jelöld ki a 😎-t, és kattints a
„Matrica törlése” gombra: eltűnik. A letöltött PNG-n a matricák is rajta vannak.
:::

:::mistake Gyakori hiba
`setStickers(stickers.push(sticker))`. A `push` a régi tömböt módosítja, és nem a tömböt adja vissza, hanem az új
hosszát: a `stickers` állapotból egy szám lesz, és a következő rajzolásnál „stickers.find is not a function” hibával
összeomlik az oldal. Az állapotot sosem módosítjuk helyben: `[...stickers, sticker]` egy új tömb.
:::

:::try Feladat
Legyen állítható a kijelölt matrica mérete. Kapjon minden matrica egy `size: 0.18` mezőt, a `drawMeme` a
`width * 0.18` helyett `width * sticker.size`-zal rajzolja, az `ItemControls` pedig matricánál egy második csúszkát
mutasson (például `min="0.08"`, `max="0.4"` és `step="0.01"`), ami az `updateItem(selectedId, { size })` hívással
dolgozik. (A „Mentés a galériába” lépés teljes `src/App.jsx`-e a feladat nélküli változatot mutatja; ha megcsináltad,
az `addSticker`-ben maradjon meg a `size: 0.18`, az `<ItemControls>`-on pedig a méretcsúszka propjai.)
:::

### Mentés a galériába

Már csak egy dolog hiányzik: a kész mémeket meg lehessen tartani, és meg lehessen osztani. Ebben a lépésben a mentés
jön. A „Mentés a galériába” gomb a vászon tartalmát elteszi a [[localStorage]]-ba, így az oldal újratöltése után is
megmarad; a galériában minden mém mellett egy „Törlés” gomb lesz. A megosztás a következő, utolsó lépésben jön.

A 9. leckéből ismert `useLocalStorage` hook ugyanúgy működik, mint a `useState`, csak minden változás után el is menti
az értéket, és induláskor a `localStorage`-ból olvassa vissza. Hozd létre az `src/useLocalStorage.js` fájlt (ha a 9. leckéből
megvan, átmásolhatod):

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

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
      // Megtelt vagy le van tiltva a tároló: az érték így is működik, csak az oldal bezárásáig él.
    }
  }, [key, value])

  // Ugyanazt adja vissza, mint a useState: az értéket és a beállító függvényt.
  return [value, setValue]
}

export default useLocalStorage
```

A `localStorage` csak szöveget tárol, oldalanként nagyjából 5 MB-ot. Szövegként egy képet [[data URL]] formájában
lehet tárolni: a `canvas.toDataURL('image/jpeg', 0.85)` a vászon tartalmát egy `data:image/jpeg;base64,…` kezdetű hosszú szöveggé
alakítja, ahogy a 6. leckében a kártyák képeit. JPEG-et mentünk, 85%-os minőséggel: egy 800 pixeles mém így nagyjából
50–150 kB, a PNG ennek a többszöröse is lehet. Hogy biztosan beférjen, legfeljebb 12 mémet tartunk meg, a legújabbakat.

A galéria egy kártya a lap alján, a mentett mémekkel egy rácsban. Ha még üres, egy rövid sor mondja el, mit lehet vele
kezdeni. Hozd létre az `src/components/Gallery.jsx` fájlt:

```jsx file=src/components/Gallery.jsx
function Gallery({ memes, onDelete }) {
  return (
    <section className="panel">
      <h2>Galéria</h2>
      {memes.length === 0 && (
        <p className="notice">Még nincs mentett mémed. A „Mentés a galériába” gombbal ide teheted, ami a vásznon van.</p>
      )}
      <ul className="gallery">
        {memes.map((meme) => (
          <li key={meme.id} className="gallery__item">
            <img src={meme.src} alt="Mentett mém" />
            <div className="gallery__actions">
              <button type="button" className="button" onClick={() => onDelete(meme.id)}>
                Törlés
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Gallery
```

A mentett mém egy `<img>`, aminek az `src`-je maga a data URL: a böngésző ugyanúgy megjeleníti, mint egy címről
letöltött képet.

Itt a teljes `src/App.jsx`, ahogy a lecke végén kinéz. A galéria a `useLocalStorage`-ból jön, a mentés és a törlés
két új függvény, a mentőgomb a letöltőgomb mellé kerül, a `Gallery` pedig a lap aljára:

```jsx file=src/App.jsx mark=4,12,44-45,94-98,100-102,157-159,171
import { useRef, useState } from 'react'
import useImage from './useImage.js'
import useFetch from './useFetch.js'
import useLocalStorage from './useLocalStorage.js'
import { downloadCanvas } from './download.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import StyleControls from './components/StyleControls.jsx'
import ItemControls from './components/ItemControls.jsx'
import StickerBar from './components/StickerBar.jsx'
import PicturePicker from './components/PicturePicker.jsx'
import Gallery from './components/Gallery.jsx'
import './App.css'

// A lecke mém-API-ja (src/mocks/handlers.js). A lang=hu miatt magyarul kapjuk a sablonok nevét.
const MEMES_API = '/api/memes?lang=hu'
// Ezzel a képpel indulunk, még mielőtt megjönne a sablonok listája.
const START_PICTURE = { id: 'tired-mug', name: 'Fáradt bögre', url: '/api/memes/images/tired-mug.svg' }
// A feliratok helye a vászon szélességének és magasságának arányában (0 = bal, illetve felső szél, 1 = jobb, illetve
// alsó szél). A felső feliratnál a teteje, az alsónál az alja van az y magasságban.
const START_POSITIONS = {
  top: { x: 0.5, y: 0.04, angle: 0 },
  bottom: { x: 0.5, y: 0.96, angle: 0 },
}
// A kijelölhető elemek a kártya gombjain.
const CAPTIONS = [
  { id: 'top', label: 'Felső szöveg' },
  { id: 'bottom', label: 'Alsó szöveg' },
]

// Minden matrica új azonosítót kap: sticker-1, sticker-2, …
let nextStickerId = 1

function App() {
  const canvasRef = useRef(null)
  const templates = useFetch(MEMES_API)
  const [picture, setPicture] = useState(START_PICTURE)
  const [upload, setUpload] = useState(null) // a feltöltött kép, ha van
  const [text, setText] = useState({ top: 'Amikor a kód', bottom: 'elsőre lefut' })
  const [style, setStyle] = useState({ font: 'impact', size: 60, color: '#ffffff' })
  const [positions, setPositions] = useState(START_POSITIONS)
  const [selectedId, setSelectedId] = useState('top')
  const [stickers, setStickers] = useState([])
  // A mentett mémek: [{ id, src }], a legújabb elöl. A localStorage-ban is megmaradnak.
  const [gallery, setGallery] = useLocalStorage('meme-generator:gallery', [])
  const { status, image } = useImage(picture.url)

  // Az API így csomagolja a listát: { success: true, data: { memes: [...] } }.
  // Ha a success hamis, az is hiba, akkor is, ha maga a válasz rendben megjött.
  let templateStatus = templates.status
  if (templateStatus === 'success' && !templates.data.success) templateStatus = 'error'
  const memes = templateStatus === 'success' ? templates.data.data.memes : []
  // A saját kép, ha van, a sablonok elé kerül.
  const pictures = upload ? [upload, ...memes] : memes

  function chooseFile(file) {
    // Az előző feltöltés ideiglenes címére már nincs szükség: felszabadítjuk a memóriát.
    if (upload) URL.revokeObjectURL(upload.url)
    const newUpload = { id: 'upload', name: file.name, url: URL.createObjectURL(file) }
    setUpload(newUpload)
    setPicture(newUpload)
  }

  function changeText(key, value) {
    // A text másolata, egy kulcsát új értékre cserélve.
    setText({ ...text, [key]: value })
  }

  function changeStyle(key, value) {
    // A style másolata, egy kulcsát új értékre cserélve.
    setStyle({ ...style, [key]: value })
  }

  // Egy felirat vagy egy matrica módosítása: a changes mezői (x, y vagy angle) felülírják a régieket.
  function updateItem(id, changes) {
    if (id === 'top' || id === 'bottom') {
      setPositions((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
    } else {
      setStickers((current) => current.map((sticker) => (sticker.id === id ? { ...sticker, ...changes } : sticker)))
    }
  }

  function addSticker(emoji) {
    const sticker = { id: `sticker-${nextStickerId++}`, emoji, x: 0.5, y: 0.5, angle: 0 }
    setStickers([...stickers, sticker])
    setSelectedId(sticker.id)
  }

  function deleteSticker(id) {
    setStickers(stickers.filter((sticker) => sticker.id !== id))
    setSelectedId('top')
  }

  function saveToGallery() {
    const src = canvasRef.current.toDataURL('image/jpeg', 0.85)
    // A legújabb kerül előre; legfeljebb 12 mémet tartunk meg, hogy beférjenek a localStorage-ba.
    setGallery([{ id: Date.now(), src }, ...gallery].slice(0, 12))
  }

  function deleteFromGallery(id) {
    setGallery(gallery.filter((meme) => meme.id !== id))
  }

  // A kijelölt elem: egy felirat, vagy ha egyik sem, akkor egy matrica.
  const selected = positions[selectedId] ?? stickers.find((sticker) => sticker.id === selectedId)
  // A kártya gombjai: a két felirat, utánuk a matricák az emojijukkal.
  const items = [...CAPTIONS, ...stickers.map((sticker) => ({ id: sticker.id, label: sticker.emoji }))]

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas
            canvasRef={canvasRef}
            image={image}
            text={text}
            style={style}
            positions={positions}
            stickers={stickers}
            onSelect={setSelectedId}
            onChange={updateItem}
          />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              A kép betöltése…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              Ezt a képet nem sikerült betölteni.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
          <StyleControls style={style} onChange={changeStyle} />
          <ItemControls
            items={items}
            selectedId={selectedId}
            angle={selected.angle}
            canDelete={selectedId.startsWith('sticker-')}
            onSelect={setSelectedId}
            onRotate={(angle) => updateItem(selectedId, { angle })}
            onDelete={() => deleteSticker(selectedId)}
          />
          <StickerBar onAdd={addSticker} />
          <div className="actions">
            <button
              type="button"
              className="button button--primary"
              disabled={status !== 'ready'}
              onClick={() => downloadCanvas(canvasRef.current, 'meme.png')}
            >
              Letöltés PNG-ként
            </button>
            <button type="button" className="button" disabled={status !== 'ready'} onClick={saveToGallery}>
              Mentés a galériába
            </button>
          </div>
        </div>
      </div>
      <PicturePicker
        status={templateStatus}
        pictures={pictures}
        selected={picture.id}
        onSelect={setPicture}
        onRetry={templates.retry}
        onFile={chooseFile}
      />
      <Gallery memes={gallery} onDelete={deleteFromGallery} />
    </main>
  )
}

export default App
```

A `Date.now()` az [[időbélyeg]]: hány ezredmásodperc telt el 1970 eleje óta. Minden kattintásnál más, ezért jó
azonosítónak. A `slice(0, 12)` a tömb első 12 elemét adja, a többi kiesik.

:::check Ellenőrizd
A lap alján megjelenik a „Galéria” kártya, egyelőre a „Még nincs mentett mémed” sorral. Kattints a „Mentés a galériába”
gombra: a kártyán megjelenik a mém. Változtass a szövegen, és mentsd el még egyszer: az új kerül előre. Frissítsd az
oldalt: a galéria megmaradt. A „Törlés” kiveszi a mémet a galériából.
:::

:::mistake Gyakori hiba
A galériába PNG-t mentesz (`canvas.toDataURL()`, típus nélkül). Egy sablonos mém PNG-ként is elfér, de néhány feltöltött
fotó után megtelik az 5 MB: a `setItem` hibát dob, a hook csendben elnyeli, és újratöltés után a galéria a legutóbbi
sikeres mentés állapotában jön vissza, az új mémek nélkül. Nagy adathoz JPEG kell, és korlát, hogy hány darabot tartunk
meg.
:::

:::try Feladat
Írd ki minden mém alá, mikor mentetted. Az azonosító maga az időpont, így a
`new Intl.DateTimeFormat('hu-HU', { dateStyle: 'short', timeStyle: 'short' }).format(meme.id)` szöveggé alakítja
(az `Intl.DateTimeFormat`-ot a 11. leckében használtad). (A következő lépés teljes `Gallery.jsx`-e a feladat nélkül
mutatja a kódot; ha megcsináltad, a dátum maradjon meg a kép alatt.)
:::

### Megosztás

Az utolsó lépés: a galéria mémjeit tovább is lehessen küldeni. A megosztás a böngésző [[Web Share API]]-ja: a
`navigator.share({ files: [fájl] })` megnyitja a rendszer saját megosztási ablakát, telefonon például azt, amelyikből
üzenetben, chatben vagy egy közösségi appban küldheted tovább a képet. Nem minden böngésző tud fájlt megosztani (az
asztali böngészők egy része egyáltalán nem tud megosztani), ezért előbb a `navigator.canShare({ files: [fájl] })`
megkérdezi, menne-e. Ahol nem, ott letöltjük a képet, a középszinten megírt `downloadUrl`-lel. A
`navigator.canShare?.(…)` [[opcionális láncolással|opcionális láncolás]] hívja a függvényt: ha a böngészőben nincs
`canShare`, a hívás egyszerűen `undefined`-ot ad, és nem dob hibát.

A megosztáshoz fájl kell, a galériában viszont data URL van. A [[fetch]] a `data:` címeket is „letölti”: a szövegből
visszakapjuk a kép bájtjait egy Blobban, abból pedig a `new File([blob], név, { type })` fájlt készít. Ha a
felhasználó bezárja a megosztási ablakot, a `share` egy `AbortError` nevű hibával utasítja el az ígéretét: ez nem
igazi hiba, ilyenkor nincs több teendő. Hozd létre az `src/share.js` fájlt:

```js file=src/share.js
import { downloadUrl } from './download.js'

// Egy data URL-ből fájl lesz. A fetch a data: címeket is „letölti”: a szövegből visszakapjuk a kép bájtjait.
async function toFile(dataUrl, fileName) {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  return new File([blob], fileName, { type: blob.type })
}

// Megosztás a rendszer saját megosztási ablakával. Ahol ez nem érhető el, letöltjük a képet.
export async function shareImage(dataUrl) {
  const file = await toFile(dataUrl, 'meme.jpg')
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (error) {
      // AbortError: a felhasználó bezárta az ablakot. Ez nem hiba, nincs több teendő.
      if (error.name === 'AbortError') return
    }
  }
  downloadUrl(dataUrl, 'meme.jpg')
}
```

Ha a `share` más hibával áll le (például mert a rendszer mégsem tudta átvenni a fájlt), a `catch` ág nem tér vissza,
és a kód a letöltéssel folytatódik: a mém ilyenkor sem vész el.

A galériában minden mém mellé egy „Megosztás” gomb kerül, a „Törlés” elé. Itt a teljes `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx mark=1,15-17
import { shareImage } from '../share.js'

function Gallery({ memes, onDelete }) {
  return (
    <section className="panel">
      <h2>Galéria</h2>
      {memes.length === 0 && (
        <p className="notice">Még nincs mentett mémed. A „Mentés a galériába” gombbal ide teheted, ami a vásznon van.</p>
      )}
      <ul className="gallery">
        {memes.map((meme) => (
          <li key={meme.id} className="gallery__item">
            <img src={meme.src} alt="Mentett mém" />
            <div className="gallery__actions">
              <button type="button" className="button" onClick={() => shareImage(meme.src)}>
                Megosztás
              </button>
              <button type="button" className="button" onClick={() => onDelete(meme.id)}>
                Törlés
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Gallery
```

Az `App`-on nem kell változtatni: a galéria mémjei már ott vannak, a megosztást a `Gallery` maga intézi.

:::check Ellenőrizd
Minden mentett mém mellett ott a „Megosztás” gomb. Kattints rá: a Windowson futó Chrome-ban és Edge-ben, valamint a
Mac Safarijában megnyílik a rendszer megosztási ablaka; ahol ilyen nincs (például a Firefoxban), a böngésző letölti a
`meme.jpg` fájlt. (Telefonon a lecke Megoldás fülén próbálhatod ki.) Gratulálok, kész a mémkészítőd!
:::

:::mistake Gyakori hiba
A `canShare` kérdése nélkül osztasz meg: a `shareImage` csak ennyi, `const file = await toFile(dataUrl, 'meme.jpg')`,
aztán rögtön `await navigator.share({ files: [file] })`. Ahol a böngészőben nincs `share` (például az asztali
Firefoxban), a hívás hibát dob, a konzolban „navigator.share is not a function” áll, és a gombra kattintva semmi sem
történik, még letöltés sem. Előbb mindig kérdezd meg a `canShare`-t, és legyen tartalék megoldás.
:::

:::try Próbáld ki
Adj címet is a megosztáshoz: `navigator.share({ files: [file], title: 'Az én mémem' })`. Hogy a cím hol jelenik meg,
az a rendszertől és a kiválasztott apptól függ: van, ahol a megosztási ablak tetején, van, ahol például egy e-mail
tárgyaként.
:::
