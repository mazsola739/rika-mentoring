# Mit építünk?

Egy QR-kód-generátort: beírsz egy szöveget vagy egy linket, és az oldal azonnal QR-kódot rajzol belőle, amit a
telefonod kamerájával be is olvashatsz. Aztán színt és méretet adsz neki, a közepére egy kis emoji kerül, és
letöltheted PNG- vagy SVG-képként. A haladó szinten Wi-Fi-jelszót és névjegyet is kóddá alakítasz, az oldal megjegyzi a letöltött
kódokat, és a kamerával be is olvashatsz egyet.

Közben megtanulod, hogyan használj egy külső npm-csomagot, hogyan várj meg egy effektben egy könyvtár válaszát, és
hogyan tölt le egy fájlt a böngésző, szerver nélkül.

:::levels
- Szövegmező és QR-kód a beírt szövegből, a `qrcode` könyvtárral. | kb. 2 óra
- Szín, méret, emoji a kód közepén, letöltés PNG- és SVG-fájlként. | kb. 3 óra
- Wi-Fi- és névjegy-QR-kód, előzmények, QR-kód beolvasása kamerával. | kb. 3 óra
:::

**Előismeret:** az előző négy lecke, főleg a 2., a „Dark Mode” (saját hook, `localStorage`), a 3., a „Password
Generator” (vezérelt mezők, `Promise` és `await`, `useEffect` takarító függvénnyel) és a 4., a „Mad Libs”
(szövegmezők, feltételes megjelenítés, `trim`). Ahol valamit új módon használunk, ott újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke feladata, egy kész kiinduló projekt, a tananyag GitHubon lévő repójában van, a `lessons/05-qr-code/exercise`
mappában (a fenti „Feladat a GitHubon” gomb oda visz). Az 1. lecke 0. lépése részletesen elmagyarázza, hogyan szerzed
meg és állítod be, és azt is, hogyan telepítsd a Node.js-t, a VS Code-ot és a Gitet, ha még nincsenek meg. Itt csak a
parancsok következnek.

Nyiss egy terminált a munkamappádban, ahol a projektjeidet tartod. Ha még nincs meg a repó, klónozd le ide:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git
```

Ha egy korábbi leckéből már megvan, akkor ehelyett a `rika-mentoring` mappában futtasd le a `git pull` parancsot
(`cd rika-mentoring`, `git pull`, `cd ..`): ez lehozza az új leckéket. A `git clone` helyett a [repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) a
**Code** → **Download ZIP** gomb is megfelel.

Másold ki a `lessons/05-qr-code/exercise` mappát a repóból a munkamappádba (a repón kívülre), és nevezd el a másolatot
így: `qr-code-generator`. A munkamappád termináljában ez egyetlen parancs (fájlkezelővel is megy):

```shell
cp -r rika-mentoring/lessons/05-qr-code/exercise qr-code-generator
```

Nyisd meg a másolatodat a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite, qrcode)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„QR Code Generator” címmel. Más még nincs rajta.
:::

A szervert hagyd futni, nyiss egy második terminált (a terminálpanel **+** gombjával), és tedd a másolatodat
git-repóvá egyetlen committal, a kezdőállapottal:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára, és érdemes minden működő lépés után
commitolni.

A kiinduló projektben három fájl fontos ehhez a leckéhez:

- `package.json`: a projekt adatlapja. Az 1. lépésben közelebbről is megnézzük, mert most először van benne egy olyan
  csomag, ami nem a Reacthez és nem a Vite-hoz tartozik.
- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért nem kell stílust
  írnod: csak a lépésekben megadott osztályneveket (`qr__layout`, `field`, `chip`, …) használod.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a „QR Code Generator” cím és a fájlokban lévő megjegyzések angolul
vannak. Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek.

:::concept Készítsd elő a telefonodat is
A QR-kódot úgy ellenőrizheted a legjobban, ha beolvasod. A legtöbb telefon kameraalkalmazása magától felismeri a
kódot, és felajánlja, hogy megnyitja a benne lévő linket; ha a tiéd nem, egy QR-olvasó alkalmazás is megteszi. A
telefonnak nem kell ugyanazon a hálózaton lennie, mint a gépnek: a kódot egyszerűen a képernyőről olvassa le.
:::

### Az első külső npm-csomag: qrcode

Egy QR-kódot megrajzolni bonyolult: a szöveget bitekké kell alakítani, hibajavító adatokat kell számolni hozzá, és az
egészet egy szabályos mintába kell rendezni. Ezt nem neked kell megírnod: valaki már megtette, és közzétette
[[npm-csomagként|npm-csomag]]. Az npm (1. lecke) egy óriási nyilvános gyűjteményből tölti le a csomagokat; a Reactot
és a Vite-ot is onnan kaptad. Az olyan csomagot, amelynek a függvényeit a saját kódodból hívod,
[[könyvtárnak|könyvtár]] is nevezik.

Nyisd meg a `package.json`-t. A `dependencies` rész sorolja fel azokat a csomagokat, amelyekre az appnak futás közben
szüksége van:

```json file=package.json mark=2
  "dependencies": {
    "qrcode": "^1.5.4",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
```

A `qrcode` a projekt egyik [[függősége|függőség]]: az app függ tőle, nélküle nem működik. Az `^1.5.4` a verziószáma; a
`^` azt jelenti, hogy egy újabb 1.x verzió is jó (a 2.0, a következő főverzió viszont már nem: egy főverzió
megváltoztathatja, hogyan kell használni a csomagot, és a kódunk elromolhatna). Az `npm install` a 0. lépésben az
összes itt felsorolt csomagot letöltötte a [[node_modules]] mappába. Ezt a mappát soha nem kell kézzel szerkesztened,
és a git sem menti el (a `.gitignore` fájl kizárja), hiszen bármikor újra letölthető. Egy új csomagot az `npm install
csomagnév` paranccsal veszel fel: ez letölti, és be is írja a `package.json`-ba. A `qrcode`-ot már beírtuk neked, így
most nincs vele dolgod.

Hogy mit tud egy csomag, és hogyan kell használni, azt a [[dokumentációja|dokumentáció]] mondja meg: a `qrcode`
leírását az npmjs.com oldalon találod, ha rákeresel. Nekünk most egyetlen függvény kell belőle. A
`QRCode.toDataURL(szöveg)` QR-kódot készít a szövegből, és egy [[data URL]]-t ad vissza: ez egy egész kép, szövegbe
csomagolva, például `data:image/png;base64,iVBORw0KGgo…`. Az eleje elárulja, hogy PNG-képről van szó, a többi maga a
kép, betűkké és számokká kódolva. Egy `<img>` elem `src` attribútumába ugyanúgy beírható, mint egy közönséges képfájl
címe.

A `toDataURL` nem azonnal adja a képet, hanem egy `Promise`-t, ahogy a 3. leckében a vágólapra írás is. Ott az
`await`-tel vártuk meg; most a Promise [[then]] függvényét használjuk. A `.then(függvény)` megmondja, mi történjen,
amikor az ígéret teljesül, és a függvény paraméterként megkapja az eredményt. A kép elkészítése rajzoláson kívüli
munka, ezért egy `useEffect`-be kerül, a kész képet pedig egy állapotba tesszük, hogy a React kirajzolja. Írd át az
`src/App.jsx`-et így (a kiemelt sorok újak):

```jsx file=src/App.jsx mark=1-2,6-7,9-12,17-24
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

function App() {
  const text = 'https://react.dev'
  const [url, setUrl] = useState('')

  // A könyvtár egy Promise-t ad vissza: a then-ben kapjuk meg a kész képet.
  useEffect(() => {
    QRCode.toDataURL(text).then((dataUrl) => setUrl(dataUrl))
  }, [text])

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">{/* Ide kerülnek majd a mezők. */}</div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">
            {url && <img className="qr__image" src={url} alt={`QR-kód ehhez: ${text}`} />}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
```

- Az `import QRCode from 'qrcode'` elején nincs `./`. A pont nélküli, csupasz név azt jelenti, hogy a csomagot a
  `node_modules`-ban kell keresni. A `QRCode` név a mi választásunk (ez a csomag alapértelmezett exportja, vagyis amit
  `export default`-tal ad ki, mint az 1. leckében a komponensek), a dokumentáció is így hívja.
- `{url && <img … />}`: az első rajzoláskor az `url` még üres szöveg, mert a kép csak később, a `then`-ben érkezik
  meg. Az üres szöveg „hamisnak” számít, így ilyenkor nem jelenik meg semmi. Amint a `setUrl` megkapja a képet, a
  React újrarajzolja az `App`-ot, most már a képpel.
- A `{/* … */}` a JSX-en belüli megjegyzés: nem jelenik meg az oldalon.
- Az `alt` szövege, egy template literal (1. lecke), elmondja a képernyőolvasóknak, mi látható a képen.

Miért nem `await`? Mert az effekt függvénye nem lehet `async`: a React tőle legfeljebb egy takarító függvényt vár
vissza, egy `async` függvény viszont mindig Promise-t ad vissza. A `then` ezt a gondot megkerüli.

:::check Ellenőrizd
Jobb oldalon (keskeny képernyőn a cím alatt) megjelenik egy fekete-fehér QR-kód. Olvasd be a telefonoddal: felajánlja,
hogy megnyitja a `react.dev` oldalt. Kattints jobb gombbal a képre, és válaszd a „Kép megnyitása új lapon”
lehetőséget: a címsorban ott a hosszú `data:image/png;base64,…` cím.
:::

:::mistake Gyakori hiba
`import QRCode from './qrcode'`, ponttal. A `./` a saját `src` mappádban keresi a fájlt, ott pedig nincs ilyen, ezért
a Vite egy piros hibaoldalt mutat: „Failed to resolve import”. Ha kimaradt az `npm install`, már az `npm run dev` sem
indul el: a terminál azt írja, hogy nem ismeri a `vite` parancsot, mert a `node_modules` mappa még nem létezik.
:::

:::try Próbáld ki
Írd át a `text` értékét a portfóliód címére az 1. leckéből, vagy egy rövid üzenetre a barátaidnak, és olvasd be a
telefonnal.
:::

### Szöveg a szövegmezőből

A kód most mindig ugyanazt a linket tartalmazza. A szöveget a felhasználónak kellene beírnia, egy
[[szövegterületbe|textarea]] (`<textarea>`): ez egy többsoros szövegmező. Reactben [[vezérelt mező]] lesz belőle,
ahogy a 3. lecke csúszkája: az értékét az állapotból kapja (`value`), és minden leütés frissíti az állapotot
(`onChange`). A HTML-ben a textarea szövege a nyitó és a záró címke közé kerül, Reactben viszont ugyanúgy `value`-t
kap, mint egy `<input>`.

A szövegmező saját komponenst kap. Hozz létre az `src` mappában egy `components` mappát, benne egy `TextForm.jsx`
fájlt:

```jsx file=src/components/TextForm.jsx
function TextForm({ text, onChange }) {
  return (
    <label className="field">
      <span>Szöveg vagy link</span>
      <textarea
        rows={4}
        value={text}
        placeholder="https://pelda.hu vagy bármilyen szöveg"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
      <small className="field__hint">{text.length} karakter</small>
    </label>
  )
}

export default TextForm
```

A `rows={4}` négy sor magasra állítja a mezőt, a `placeholder` szürke mintaszövege pedig akkor látszik, amikor a mező
üres. A `spellCheck={false}` kikapcsolja a helyesírás-ellenőrzést: a linkeket úgyis mind aláhúzná. Az alsó sor
megszámolja a karaktereket; a következő lépésben kiderül, miért fontos.

Az állapot az `App`-ban él, mert a QR-kódnak is szüksége van rá (a 3. leckéből ismerős [[állapot felemelése]]): a
`TextForm` megkapja a szöveget, és az `onChange`-en keresztül jelzi, ha változott. Írd át így az `src/App.jsx`-et; a
`text` most már állapot:

```jsx file=src/App.jsx mark=3,7,19-21
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import TextForm from './components/TextForm.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [url, setUrl] = useState('')

  // A könyvtár egy Promise-t ad vissza: a then-ben kapjuk meg a kész képet.
  useEffect(() => {
    QRCode.toDataURL(text).then((dataUrl) => setUrl(dataUrl))
  }, [text])

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
        </div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">
            {url && <img className="qr__image" src={url} alt={`QR-kód ehhez: ${text}`} />}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
```

Az `onChange={setText}` a `setText` függvényt adja át a `TextForm`-nak: amikor a mező meghívja az `onChange`-et az új
szöveggel, valójában a `setText` fut le. Az effekt függőségi tömbje, a `[text]`, most kap igazi szerepet: a React
minden olyan rajzolás után lefuttatja az effektet, amikor a `text` megváltozott. Így minden leütés után új kód készül.

:::check Ellenőrizd
Gépelj a mezőbe: a QR-kód minden leütésre megváltozik, a mező alatti számláló pedig számol. Most töröld ki az egész
szöveget: a régi kód ott marad, a konzolban (++F12++ → Console) pedig piros hiba jelenik meg: „Uncaught (in promise)
Error: No input text”. Ezt javítjuk a következő lépésben.
:::

:::mistake Gyakori hiba
Üres függőségi tömb: `}, [])`. Ekkor az effekt csak egyszer fut le, az első rajzolás után: hiába gépelsz, a kód mindig
az első szöveget mutatja.
:::

:::try Próbáld ki
Egy QR-kódban nemcsak webcím lehet. Írd be: `tel:+36301234567` (beolvasáskor a telefon felajánlja a hívást),
`mailto:valaki@example.com` (új e-mail) vagy `geo:47.4979,19.0402` (térkép, Budapest közepe; ezt nem minden telefon
ismeri).
:::

### Üres mező és túl hosszú szöveg

Két dolog is elronthatja a kódkészítést. Üres szövegből nem lehet QR-kód, ezért a könyvtár hibát jelez. A túl hosszú
szöveg sem fér el: egy QR-kódba legfeljebb nagyjából kétezer-háromszáz karakter fér. Mindkét esetben a könyvtár nem
teljesíti a `toDataURL` ígéretét, hanem [[elutasítja|elutasított Promise]]: kép helyett hibát ad. Eddig ezt senki nem
kezelte, ezért jelent meg a konzolban a piros „Uncaught (in promise)” („a Promise hibáját senki nem kapta el”).

A `then` párja a `catch`: a `.catch(függvény)` akkor fut le, ha az ígéret nem teljesül, pont úgy, mint a `try/catch`
`catch` része a 3. leckéből. A két hívás egymás után fűzhető: `ígéret.then(…).catch(…)`. Az üres szöveggel pedig meg
sem próbálkozunk. Írd át így az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=9-11,14-22,24-35,45
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import TextForm from './components/TextForm.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)
  // A szóközöket levágjuk a két végéről: a csupa szóköz is üres szöveg.
  const content = text.trim()

  useEffect(() => {
    // Üres szövegből nem lesz QR-kód: meg sem próbáljuk.
    if (content === '') return
    QRCode.toDataURL(content)
      .then((dataUrl) => {
        setUrl(dataUrl)
        setError(false)
      })
      .catch(() => setError(true))
  }, [content])

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Írj be valamit, és itt megjelenik a QR-kód.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        Ez túl sok egy QR-kódhoz. Rövidíts a szövegen!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR-kód ehhez: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
        </div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">{preview}</div>
        </section>
      </div>
    </main>
  )
}

export default App
```

- A `text.trim()` levágja a szóközöket és a sortöréseket a szöveg elejéről és végéről. A `content` (tartalom) egy
  [[származtatott érték]], mint a 3. lecke erősségjelzője: minden rajzoláskor kiszámoljuk a `text`-ből, nem kell hozzá
  saját állapot. A QR-kódba mostantól a `content` kerül, ezért az effekt is tőle függ: `[content]`.
- `if (content === '') return`: az effekt rögtön véget ér, ha nincs mit kódolni.
- Siker esetén a `setError(false)` eltünteti a korábbi hibát, hiba esetén a `setError(true)` jelzi, hogy baj van.
- A JSX is érték: egy változóba is tehető. A `preview` (előnézet) `null`-ként indul, ami azt jelenti, hogy „semmit ne
  rajzolj”. Az `if … else if` lánc ezt felülírja azzal, amit éppen mutatni kell: az üres mező szövegét, a hibaüzenetet
  vagy a képet. A kép csak akkor jelenik meg, ha az `url` már nem üres, mert egy üres `src`-ről a React
  figyelmeztetést írna a konzolba.
- A `role="alert"` arra kéri a képernyőolvasókat, hogy rögtön olvassák fel a hibaüzenetet, amint megjelenik.

:::check Ellenőrizd
Töröld ki a szöveget: a szürke dobozban az „Írj be valamit…” felirat jelenik meg, a konzol pedig tiszta marad. A túl
hosszú szöveghez írd át ideiglenesen a kezdőértéket így: `useState('qr'.repeat(1200))`. A `repeat` 1200-szor egymás
után írja a „qr”-t, így 2400 karakter lesz belőle: a számláló 2400-at mutat, a dobozban pedig a piros hibaüzenet áll.
Utána állítsd vissza a kezdőértéket.
:::

:::mistake Gyakori hiba
Kimarad a `setError(false)` a `then`-ből. Ekkor egyetlen túl hosszú szöveg után a hibaüzenet örökre ott marad, akkor
is, ha visszarövidíted a szöveget, mert soha senki nem állítja vissza.
:::

:::concept Mennyi fér egy QR-kódba?
A QR-kód apró fekete és fehér négyzetekből, [[modulokból|modul]] áll. A legkisebb kód 21 × 21 modulos, a legnagyobb
177 × 177. Minél hosszabb a szöveg, annál nagyobb és sűrűbb a kód, és annál nehezebb beolvasni. A legnagyobb kódba, a
könyvtár alapbeállításával, 2331 bájt fér. Egy ékezet nélküli betű egy bájt, egy ékezetes betű kettő, egy emoji
általában négy. A csak
számjegyekből vagy csak nagybetűkből álló szöveget a kód tömörebben tárolja, abból több mint háromezer karakter is
belefér: ezért nem a karakterek száma a pontos határ. Linkből a rövidebb a jobb.
:::

### Saját hook: useQrCode

Az `App` kezd zsúfolt lenni: két állapot és egy effekt csak azért, hogy egy szövegből kép legyen. Költöztessük ezt egy
[[saját hookba|saját hook]], ahogy a 2. leckében a `useDarkMode`-ot: egy `use`-zal kezdődő függvénybe, ami más
hookokat hív, és visszaadja, amire a komponensnek szüksége van. Az `App` pedig csak ennyit kér: „adj egy QR-kódot
ehhez a szöveghez”.

A költözés közben egy rejtett hibát is kijavítunk. Egy Promise válasza nem azonnal érkezik, hanem valamikor később. Ha
gyorsan gépelsz, egyszerre több kérés is úton lehet, és semmi nem garantálja, hogy a válaszok sorrendben érkeznek: egy
hosszú szöveg kódja tovább készülhet, mint egy rövidé. Ha a régi válasz érkezik utoljára, a régi kód marad a
képernyőn, pedig a mezőben már új szöveg áll. Az ilyen hibát [[versenyhelyzetnek|versenyhelyzet]] hívják: két folyamat
versenyez, és a végeredmény azon múlik, melyik ér célba előbb.

A megoldás a [[takarító függvény]] (3. lecke). A React lefuttatja, mielőtt az effekt az új szöveggel újra lefutna. Az
effekt minden lefutásának saját `ignore` (figyelmen kívül hagyás) változója van; a takarítás a régiét `true`-ra
állítja, és a régi válasz így már nem írhatja felül az újat. Hozd létre az `src/useQrCode.js` fájlt:

```js file=src/useQrCode.js mark=13,16,21,25-28
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// A szövegből QR-kódot készít. Visszaadja a kép címét (url), és azt, hogy volt-e hiba (error).
function useQrCode(text) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    // Üres szövegből nem lesz QR-kód: meg sem próbáljuk.
    if (text === '') return

    let ignore = false
    QRCode.toDataURL(text)
      .then((dataUrl) => {
        if (ignore) return
        setUrl(dataUrl)
        setError(false)
      })
      .catch(() => {
        if (ignore) return
        setError(true)
      })

    // Takarítás: ha közben új szöveg jött, ennek a körnek a válaszát eldobjuk.
    return () => {
      ignore = true
    }
  }, [text])

  return { url, error }
}

export default useQrCode
```

A hook egy objektumot ad vissza, benne a két értékkel. Az `App` [[destrukturálással|destrukturálás]] veszi ki belőle
őket, ahogy a 2. leckében a `useDarkMode` eredményét. Az `src/App.jsx`-ből eltűnik a `useEffect`, a két állapot és a
`qrcode` importja; itt az új változata:

```jsx file=src/App.jsx mark=1-2,10
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import TextForm from './components/TextForm.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  // A szóközöket levágjuk a két végéről: a csupa szóköz is üres szöveg.
  const content = text.trim()
  const { url, error } = useQrCode(content)

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Írj be valamit, és itt megjelenik a QR-kód.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        Ez túl sok egy QR-kódhoz. Rövidíts a szövegen!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR-kód ehhez: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
        </div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">{preview}</div>
        </section>
      </div>
    </main>
  )
}

export default App
```

A hookban a paraméter neve `text`, az `App` viszont a `content`-et adja át neki: a hívásnál mindegy, hogyan hívják
kint a változót, a hook a saját nevén látja.

:::check Ellenőrizd
Minden ugyanúgy működik, mint eddig: gépelésre változik a kód, az üres mezőnél ott a felirat, a túl hosszú szövegnél a
hibaüzenet. Kívülről nézve ez a lépés csak rendet rakott: a versenyhelyzet ritkán látszik, de a lenti „Próbáld ki”
doboz megmutatja az `ignore`-t munka közben. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
Lemarad a hook végéről a `return { url, error }`. Ekkor a hook `undefined`-ot ad vissza, az oldal üres lesz, a
konzolban pedig ez áll: „Cannot destructure property 'url' of 'useQrCode(...)' as it is undefined”, vagyis az
`undefined`-ból nem lehet kivenni az `url`-t.
:::

:::try Próbáld ki
Nézd meg az `ignore`-t munka közben. Írd a `then` belsejének legelejére, az `if (ignore) return` elé:
`console.log('kész:', text, 'eldobjuk:', ignore)`, és töltsd újra az oldalt. A konzolban kétszer jelenik meg a „kész”,
és az első „eldobjuk: true”. Fejlesztés közben ugyanis a React [[StrictMode]]-ja (2. lecke) szándékosan kétszer
futtatja le az effektet, közte a takarítással; az első kör válaszát az `ignore` dobja el. Utána töröld a sort.
:::

## Középszint {level=2}

### Szín és méret

A `qrcode` függvényei egy második paramétert is elfogadnak: egy beállításokat tartalmazó objektumot. A dokumentáció
sorolja fel, mi mindent lehet benne megadni; nekünk három kell:

- `width`: a kép szélessége (és magassága) pixelben.
- `margin`: az üres keret a kód körül, modulokban mérve. Ez a [[csendes zóna]]: a beolvasónak kell egy kis üres hely,
  hogy megtalálja a kód szélét. Az alapértelmezett 4 modul elég vastag; nekünk 2 is bőven megfelel.
- `color`: két szín, a sötét modulok színe (`dark`) és a háttéré (`light`).

Ugyanezeket a beállításokat később az SVG-kép is megkapja majd, ezért a könyvtárat használó kód egy saját fájlba
költözik. Hozd létre az `src/qr.js` fájlt:

```js file=src/qr.js
import QRCode from 'qrcode'

// A mi beállításainkból a qrcode könyvtár beállításai lesznek.
export function qrOptions({ color, size }) {
  return {
    width: size, // a kép szélessége pixelben
    margin: 2, // üres keret a kód körül, modulokban mérve
    color: { dark: color, light: '#ffffff' },
  }
}

// PNG-kép, data URL formában.
export function makePng(text, settings) {
  return QRCode.toDataURL(text, qrOptions(settings))
}
```

A `qrOptions` paraméterében a kapcsos zárójel [[destrukturálás]]: a kapott objektumból rögtön kiveszi a `color`-t és a
`size`-t, ahogy a komponensek a propjaikat. A `makePng` egyszerűen továbbadja a `toDataURL` Promise-át. A hook most
már ezt hívja, és megkapja a beállításokat is. Írd át így az `src/useQrCode.js`-t:

```js file=src/useQrCode.js mark=2,4-6,15,30
import { useEffect, useState } from 'react'
import { makePng } from './qr.js'

// A szövegből és a beállításokból QR-kódot készít.
// Visszaadja a kép címét (url), és azt, hogy volt-e hiba (error).
function useQrCode(text, { color, size }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    // Üres szövegből nem lesz QR-kód: meg sem próbáljuk.
    if (text === '') return

    let ignore = false
    makePng(text, { color, size })
      .then((dataUrl) => {
        if (ignore) return
        setUrl(dataUrl)
        setError(false)
      })
      .catch(() => {
        if (ignore) return
        setError(true)
      })

    // Takarítás: ha közben új szöveg jött, ennek a körnek a válaszát eldobjuk.
    return () => {
      ignore = true
    }
  }, [text, color, size])

  return { url, error }
}

export default useQrCode
```

A `makePng(text, { color, size })` hívásban a `{ color, size }` a 2. leckéből ismert rövidítés: ugyanaz, mint a
`{ color: color, size: size }`. Ha egy objektum kulcsa és a változó neve egyezik, elég egyszer leírni. Figyeld meg a függőségi tömböt: `[text, color, size]`. Nem a
beállítások objektuma áll benne, hanem a három érték külön-külön. Az `App` minden rajzoláskor egy vadonatúj
`{ color, size }` objektumot ad át, és a React a régit az újjal hasonlítja össze. Két külön objektum akkor
is különbözőnek számít, ha ugyanaz van bennük, így az effekt minden egyes rajzolás után újra lefutna. A szöveg és a
szám viszont érték szerint hasonlítható: a `'#1c2333'` mindig egyenlő a `'#1c2333'`-mal.

A színnek és a méretnek egy új komponens ad mezőt. Az `<input type="color">` a böngésző beépített színválasztója:
rákattintva egy színpaletta nyílik, az értéke pedig mindig egy `#` kezdetű, hatjegyű [[hexa színkód|hexa szín]],
például `#1c2333`. A méretet egy csúszka állítja, mint a 3. leckében a jelszó hosszát. Hozd létre az
`src/components/StyleOptions.jsx` fájlt:

```jsx file=src/components/StyleOptions.jsx
function StyleOptions({ color, size, onColorChange, onSizeChange }) {
  return (
    <fieldset className="group">
      <legend>Megjelenés</legend>
      <label className="field field--row">
        <span>Szín</span>
        <input type="color" value={color} onChange={(event) => onColorChange(event.target.value)} />
        <code>{color}</code>
      </label>
      <label className="field">
        <span>
          Méret: <strong>{size} × {size}</strong> pixel
        </span>
        <input
          type="range"
          min="128"
          max="1024"
          step="32"
          value={size}
          onChange={(event) => onSizeChange(Number(event.target.value))}
        />
      </label>
    </fieldset>
  )
}

export default StyleOptions
```

A csúszka `step="32"` attribútuma azt jelenti, hogy 32-esével lép. A `Number()` most is számmá alakítja a csúszka
szöveges értékét. Végül az `App`: két új állapot, és a hook megkapja őket:

```jsx file=src/App.jsx mark=4,9-10,13,34
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import TextForm from './components/TextForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  // A szóközöket levágjuk a két végéről: a csupa szóköz is üres szöveg.
  const content = text.trim()
  const { url, error } = useQrCode(content, { color, size })

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Írj be valamit, és itt megjelenik a QR-kód.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        Ez túl sok egy QR-kódhoz. Rövidíts a szövegen!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR-kód ehhez: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
        </div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">{preview}</div>
        </section>
      </div>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Válassz egy színt: a kód sötét moduljai átszíneződnek, a színválasztó mellett pedig megjelenik a színkód. Húzd balra a csúszkát: a kép
kisebb lesz, a felirat például „160 × 160 pixel”. Jobbra húzva egy ponton túl a kép már nem nő tovább a képernyőn,
mert nem fér el a dobozban, de a valódi mérete tovább nő: ezt a letöltésnél látod majd.
:::

:::mistake Gyakori hiba
A függőségi tömbben csak a `[text]` maradt. A szín és a méret ekkor eljut a hookig, de az effekt nem fut le újra,
amikor változnak: hiába húzod a csúszkát, a kép csak akkor frissül, amikor a szöveget is átírod.
:::

:::try Próbáld ki
Válassz egy világos színt, például világossárgát, és próbáld beolvasni a telefonnal: nem sikerül, vagy csak nehezen. A
beolvasónak erős kontraszt kell a sötét modulok és a háttér között. Sötét színnel viszont nyugodtan kísérletezz: a
sötétkék vagy a bordó ugyanúgy működik, mint a fekete.
:::

### Letöltés PNG-ként

A kép kész, most le kellene tölteni. A legegyszerűbb letöltéshez nem kell más, csak egy link. A HTML `<a>` elemének
[[download attribútuma|download attribútum]] azt mondja a böngészőnek: ne nyisd meg, amire a link mutat, hanem mentsd
el fájlként; az értéke a javasolt fájlnév. A data URL pedig maga az egész kép, így a link a kész fájlra mutat, és nem
kell hozzá szerver.

A gombokat csak akkor mutatjuk, ha van mit letölteni. Ez is származtatott érték: a `ready` (kész) akkor igaz, ha van
tartalom, nincs hiba, és a kép már megérkezett. Írd át így az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=14,39-45
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import TextForm from './components/TextForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  // A szóközöket levágjuk a két végéről: a csupa szóköz is üres szöveg.
  const content = text.trim()
  const { url, error } = useQrCode(content, { color, size })
  const ready = content !== '' && !error && url !== ''

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Írj be valamit, és itt megjelenik a QR-kód.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        Ez túl sok egy QR-kódhoz. Rövidíts a szövegen!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR-kód ehhez: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
        </div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">{preview}</div>
          {ready && (
            <div className="qr__actions">
              <a className="button button--primary" href={url} download="qr-code.png">
                PNG letöltése
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
```

- A `&&` a `ready` sorában azt jelenti, hogy „és”: mindhárom feltételnek igaznak kell lennie. A `!error` a `!` miatt
  akkor igaz, ha **nincs** hiba.
- A link a `button` osztálytól néz ki gombnak, de valójában link marad, és ez így helyes: egy fájlhoz vezet, a linkek
  pedig arra valók, hogy valahová vezessenek (a gombok a műveletekre).

:::check Ellenőrizd
Kattints a „PNG letöltése” gombra: a letöltések között megjelenik a `qr-code.png`. Nyisd meg: akkora, amekkorát a
csúszka mutatott (a képnézegető vagy a fájl tulajdonságai megmondják). Néhány szövegnél egy pixellel kisebb, mert a
könyvtár a számolásnál lefelé kerekíti a szélességet. Töröld ki a szöveget: a gomb eltűnik, mert nincs mit letölteni.
:::

:::mistake Gyakori hiba
Kimarad a `download`. Ekkor a link meg akarja nyitni a képet ugyanazon a lapon, a böngésző azonban biztonsági okból
nem enged egy oldalt data URL-re lépni: a kattintásra nem történik semmi, a konzolban pedig a „Not allowed to navigate
top frame to data URL” hiba jelenik meg.
:::

:::try Próbáld ki
Adj a fájlnak beszédesebb nevet a méretével: `download={'qr-code-' + size + '.png'}`. Ilyenkor kapcsos zárójel kell,
mert a név már nem fix szöveg, hanem kiszámolt érték: a `+` fűzi össze a darabjait, például `qr-code-512.png`-vé.
:::

### Letöltés SVG-ként

A PNG [[pixelgrafika]]: annyi képpontból áll, amennyit a csúszka mondott. Ha egy plakátra kinagyítod, a
modulok szélei elmosódnak vagy lépcsőzetesek lesznek. Az SVG [[vektorgrafika]]: nem képpontokat tárol, hanem alakzatok
leírását („itt egy négyzet, ott egy vonal”), és a gép minden méretben újrarajzolja őket, ezért bármekkorára nagyítva
éles marad. Ráadásul az SVG egyszerű szöveg: bármelyik szerkesztőben megnyitható.

A `qrcode` SVG-t is tud: a `QRCode.toString(szöveg, { type: 'svg' })` egy Promise-t ad, ami az SVG szövegével
teljesül. Egészítsd ki az `src/qr.js`-t a `makeSvg` függvénnyel:

```js file=src/qr.js mark=17-20
import QRCode from 'qrcode'

// A mi beállításainkból a qrcode könyvtár beállításai lesznek.
export function qrOptions({ color, size }) {
  return {
    width: size, // a kép szélessége pixelben
    margin: 2, // üres keret a kód körül, modulokban mérve
    color: { dark: color, light: '#ffffff' },
  }
}

// PNG-kép, data URL formában.
export function makePng(text, settings) {
  return QRCode.toDataURL(text, qrOptions(settings))
}

// SVG-kép, szövegként.
export function makeSvg(text, settings) {
  return QRCode.toString(text, { ...qrOptions(settings), type: 'svg' })
}
```

A `{ ...qrOptions(settings), type: 'svg' }` a 3. leckéből ismert [[spread]]: átmásolja a közös beállításokat egy új
objektumba, és hozzáteszi a `type`-ot.

Egy szövegből fájlt kell csinálni, és azt letölteni. A [[Blob]] egy adatcsomag a memóriában, típussal együtt: a `new
Blob([svg], { type: 'image/svg+xml' })` egy SVG-fájlt készít a szövegből, csak éppen nem a lemezen, hanem a
memóriában. A `[svg]` szögletes zárójele nem elírás: a Blob egy tömböt vár, mert több darabból is össze tud rakni egy
fájlt; nekünk most egy darab is elég. Egy Blobnak még nincs címe, amire egy link mutathatna. Az `URL.createObjectURL(blob)` ad neki egy
ideiglenes [[objektum-URL]]-t (`blob:http://localhost:5173/…`), ami addig él, amíg az oldal nyitva van, vagy amíg fel
nem szabadítjuk. Erre a címre már mutathat egy `download`-os link. Ezt a linket most nem a JSX-be írjuk, hanem a
kódból hozzuk létre, és a kódból is „kattintunk” rá. Hozd létre az `src/download.js` fájlt:

```js file=src/download.js
// Letölt egy fájlt (Blob): ideiglenes címet kap, és egy láthatatlan linkre „kattintunk”.
export function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  // Egyes böngészők csak az oldalon lévő linkre indítják el a letöltést, ezért egy pillanatra betesszük.
  document.body.append(link)
  link.click()
  link.remove()
  // Az ideiglenes cím memóriát foglal: ha a letöltés elindult, felszabadítjuk.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
```

A `document.createElement('a')` egy új, egyelőre sehol meg nem jelenő `<a>` elemet hoz létre; a `href` és a `download`
ugyanaz, mint a JSX-ben. A `link.click()` úgy tesz, mintha a felhasználó kattintott volna, aztán a `link.remove()` el
is tünteti. Az `URL.revokeObjectURL` felszabadítja az ideiglenes címet; egy másodpercet várunk vele, hogy a
letöltésnek legyen ideje elindulni.

Az `App`-ban a beállítások most már két helyre mennek (a hooknak és az SVG-nek), ezért egy `settings` változóba
kerülnek. Az SVG-gomb eseménykezelője `async`, mert meg kell várnia a `makeSvg` Promise-át, ahogy a 3. leckében a
másológomb a vágólapot. A lenti kódban a `…` kezdetű megjegyzések helyén minden marad, ahogy volt, és a fájl végén az
`export default App` is:

```jsx file=src/App.jsx mark=3-4,10-11,14-17,29-31
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import { makeSvg } from './qr.js'
import { downloadFile } from './download.js'
// … a többi import, mint eddig

function App() {
  // … a három állapot, mint eddig
  const content = text.trim()
  const settings = { color, size }
  const { url, error } = useQrCode(content, settings)
  const ready = content !== '' && !error && url !== ''

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
  }

  // … a preview, mint eddig

  return (
    <main className="qr">
      {/* … a cím és a mezők, mint eddig */}
          {ready && (
            <div className="qr__actions">
              <a className="button button--primary" href={url} download="qr-code.png">
                PNG letöltése
              </a>
              <button type="button" className="button" onClick={downloadSvg}>
                SVG letöltése
              </button>
            </div>
          )}
      {/* … a lezáró címkék, mint eddig */}
    </main>
  )
}
```

:::check Ellenőrizd
Kattints az „SVG letöltése” gombra: megérkezik a `qr-code.svg`. Nyisd meg a böngészőben (húzd rá egy üres lapra), és
nagyíts rá (++Ctrl++ + ++Plusz++): a modulok szélei bármekkora nagyításnál élesek maradnak. Nyisd meg a szerkesztődben
is: szöveg, `<svg …>` kezdettel. Benne egy rövid `<path>` (útvonal) elem festi ki a fehér hátteret, egy hosszú pedig
az összes sötét modult leírja.
:::

:::mistake Gyakori hiba
Kimarad az `await` a `makeSvg` elől. Ekkor az `svg` változóban nem a kép szövege van, hanem maga a Promise, és a
Blobba a `[object Promise]` felirat kerül: a letöltött fájl nem nyílik meg, mert nem érvényes SVG.
:::

### Emoji a kód közepén

Sok QR-kód közepén egy kis logó ül. Hogyan működhet ez, ha a logó kitakarja a kód egy részét? A QR-kód
[[hibajavítást|hibajavítás]] használ: az adat mellé plusz ellenőrző információ is kerül a kódba, így a beolvasó akkor
is ki tudja olvasni, ha egy része sérült, piszkos vagy le van takarva. Négy szintje van: L (kb. 7%-a hiányozhat a kódnak), M (15%), Q (25%) és
H (30%). A könyvtár alapból M-et használ; ha logó kerül a közepére, H-ra váltunk. Az ára: több adat kell, így a kód
sűrűbb lesz, és rövidebb szöveg fér bele.

A logó egy emoji lesz egy fehér, lekerekített négyzetben. A PNG-képre rá kell rajzolni. Ehhez a [[canvas]] (vászon)
kell: egy olyan HTML-elem, amire JavaScript-parancsokkal lehet rajzolni („fesd fehérre ezt a téglalapot”, „írd ide ezt
a szöveget”). A `QRCode.toCanvas(szöveg, beállítások)` egy új vásznat készít, rajta a kóddal; a `toDataURL`-hez
hasonlóan ezt is egy Promise-on keresztül adja át, ezért `await`-tel várjuk meg. Mi ráírjuk a logót, végül a vászon
`toDataURL()` függvénye ugyanolyan data URL-t készít belőle, amilyet eddig a könyvtártól kaptunk.

Az SVG-ben nem rajzolunk, hanem írunk: két új elemet teszünk a záró `</svg>` címke elé. Egy apró trükk egyszerűvé
teszi a méretezést. Az elemeket egy belső `<svg>`-be csomagoljuk, amelynek a `viewBox="0 0 100 100"` saját
koordinátarendszert ad: a teljes kép 100 egység széles, akármekkora is valójában, így a 38-as kezdés mindig a kép
38%-ánál van. A vásznon ugyanezeket az arányokat a szélességgel szorozzuk. Itt a teljes `src/qr.js`:

```js file=src/qr.js mark=4,8-9,14-19,21-34,36-47
import QRCode from 'qrcode'

// A mi beállításainkból a qrcode könyvtár beállításai lesznek.
export function qrOptions({ color, size, logo }) {
  return {
    width: size, // a kép szélessége pixelben
    margin: 2, // üres keret a kód körül, modulokban mérve
    // A logó kitakar egy darabot: a legerősebb hibajavítás (H) ezt is kibírja.
    errorCorrectionLevel: logo ? 'H' : 'M',
    color: { dark: color, light: '#ffffff' },
  }
}

// PNG-kép, data URL formában. A könyvtár egy vászonra rajzol, mi pedig rárajzoljuk a logót.
export async function makePng(text, settings) {
  const canvas = await QRCode.toCanvas(text, qrOptions(settings))
  if (settings.logo) drawLogo(canvas, settings.logo)
  return canvas.toDataURL('image/png')
}

// Fehér, lekerekített négyzet a kép közepén (a szélesség 24%-a), benne az emoji.
function drawLogo(canvas, logo) {
  const ctx = canvas.getContext('2d')
  const side = canvas.width
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(side * 0.38, side * 0.38, side * 0.24, side * 0.24, side * 0.05)
  ctx.fill()
  ctx.font = `${side * 0.15}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000000'
  ctx.fillText(logo, side / 2, side / 2)
}

// SVG-kép, szövegként. A logó ugyanaz, csak SVG-elemekből, a záró </svg> elé írva.
export async function makeSvg(text, settings) {
  const svg = await QRCode.toString(text, { ...qrOptions(settings), type: 'svg' })
  if (!settings.logo) return svg
  const logo =
    '<svg viewBox="0 0 100 100" width="100%" height="100%">' +
    '<rect x="38" y="38" width="24" height="24" rx="5" fill="#ffffff"/>' +
    '<text x="50" y="50" font-size="15" text-anchor="middle" dominant-baseline="central">' +
    settings.logo +
    '</text></svg>'
  return svg.replace('</svg>', logo + '</svg>')
}
```

- `logo ? 'H' : 'M'`: a ternáris operátor (3. lecke). Ha van logó (a `logo` nem üres szöveg), H, különben M.
- A `getContext('2d')` adja a vászon „ecsetét” (`ctx`), ezen keresztül rajzolunk. A `fillStyle` a festék színe, a
  `beginPath` új alakzatot kezd, a `roundRect(x, y, szélesség, magasság, sugár)` egy lekerekített téglalapot ír le (az
  utolsó szám a sarkok kerekítésének sugara), a `fill` pedig kifesti. A `font` a betűméret (a szélesség 15%-a) és a
  betűtípus, a `textAlign` és a `textBaseline` pedig gondoskodik róla, hogy a szöveg közepe pontosan a megadott pontra
  kerüljön. A `fillText` kiírja a szöveget; előtte a festéket feketére állítjuk, mert a nem színes jelek (például ♥
  vagy ★) különben fehéren tűnnének el a fehér négyzeten.
- A `drawLogo` elől hiányzik az `export`: csak ez a fájl használja.
- A `makePng` és a `makeSvg` most `async` függvény. Az `async` függvény mindig Promise-t ad vissza, így a hook
  ugyanúgy `then`-nel és `catch`-csel kezelheti, mint eddig.
- A `replace('</svg>', …)` kicseréli a záró címkét a logóra és utána egy új záró címkére, vagyis a logó a kép
  legvégére, mindennek a tetejére kerül.

Az emojiválasztó gombokból áll. Mindegyik egy emojit mutat, és az épp kiválasztottnak az [[aria-pressed]] attribútuma
`true`: ez mondja meg a képernyőolvasóknak, hogy a gomb „be van nyomva”, és a CSS is ebből tudja, melyiket kell
kiemelni. Hozd létre az `src/components/LogoPicker.jsx` fájlt:

```jsx file=src/components/LogoPicker.jsx
const LOGOS = ['❤️', '☕', '🎵', '⭐', '🍕']

function LogoPicker({ logo, onChange }) {
  return (
    <fieldset className="group">
      <legend>Emoji középen</legend>
      <div className="chips">
        <button type="button" className="chip" aria-pressed={logo === ''} onClick={() => onChange('')}>
          Nincs
        </button>
        {LOGOS.map((item) => (
          <button
            key={item}
            type="button"
            className="chip chip--emoji"
            aria-pressed={logo === item}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default LogoPicker
```

Az emojik ugyanolyan karakterek, mint a betűk, így egy szöveges tömbben is elférnek. Írd át az `src/useQrCode.js`-t is:
a `logo`-t is továbbadja, és a függőségi tömbbe is beírja:

```js file=src/useQrCode.js mark=6,15,30
import { useEffect, useState } from 'react'
import { makePng } from './qr.js'

// A szövegből és a beállításokból QR-kódot készít.
// Visszaadja a kép címét (url), és azt, hogy volt-e hiba (error).
function useQrCode(text, { color, size, logo }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    // Üres szövegből nem lesz QR-kód: meg sem próbáljuk.
    if (text === '') return

    let ignore = false
    makePng(text, { color, size, logo })
      .then((dataUrl) => {
        if (ignore) return
        setUrl(dataUrl)
        setError(false)
      })
      .catch(() => {
        if (ignore) return
        setError(true)
      })

    // Takarítás: ha közben új szöveg jött, ennek a körnek a válaszát eldobjuk.
    return () => {
      ignore = true
    }
  }, [text, color, size, logo])

  return { url, error }
}

export default useQrCode
```

Itt a teljes `App`, ahogy a középszint végén kinéz:

```jsx file=src/App.jsx mark=7,14,17,46
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import { makeSvg } from './qr.js'
import { downloadFile } from './download.js'
import TextForm from './components/TextForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import LogoPicker from './components/LogoPicker.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  const [logo, setLogo] = useState('')
  // A szóközöket levágjuk a két végéről: a csupa szóköz is üres szöveg.
  const content = text.trim()
  const settings = { color, size, logo }
  const { url, error } = useQrCode(content, settings)
  const ready = content !== '' && !error && url !== ''

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
  }

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Írj be valamit, és itt megjelenik a QR-kód.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        Ez túl sok egy QR-kódhoz. Rövidíts a szövegen!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR-kód ehhez: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
          <LogoPicker logo={logo} onChange={setLogo} />
        </div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">{preview}</div>
          {ready && (
            <div className="qr__actions">
              <a className="button button--primary" href={url} download="qr-code.png">
                PNG letöltése
              </a>
              <button type="button" className="button" onClick={downloadSvg}>
                SVG letöltése
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Válaszd a ☕-t: a kód közepén egy fehér négyzetben megjelenik a kávé, a kód maga pedig sűrűbb lesz (ez a H szint plusz
adata). Olvasd be a telefonoddal: a logó ellenére működik. Töltsd le PNG-ként és SVG-ként is: mindkettőben ott a logó.
Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Logó, de M vagy L hibajavítás (például ha az `errorCorrectionLevel` sor kimarad). A kép ugyanúgy néz ki, de a telefon
gyakran nem tudja beolvasni, mert a logó több modult takar ki, mint amennyit az alacsonyabb szint pótolni tud.
:::

:::try Próbáld ki
Tegyél egy saját emojit a `LOGOS` tömbbe. Aztán nézd meg, meddig bírja a hibajavítás: írd át a `drawLogo`-ban a
négyzetet 24%-ról 40%-ra (`side * 0.3, side * 0.3, side * 0.4, side * 0.4`), és próbáld beolvasni. Utána állítsd
vissza.
:::

## Haladó szint {level=3}

### Wi-Fi-kód

A QR-kód szövegében bármi lehet, de néhány formátumot a telefonok külön felismernek. Ilyen a Wi-Fi-hozzáférés: ha a kód
szövege `WIFI:T:WPA;S:Otthon;P:titok123;;`, a telefon felajánlja, hogy csatlakozik az „Otthon” nevű hálózathoz a
„titok123” jelszóval. A `T:` a titkosítás típusa, az `S:` a hálózat neve (SSID), a `P:` a jelszó; mindegyiket
pontosvessző zárja, az egészet pedig még egy. Ha kiteszed a nappaliba, a vendégeidnek nem kell betűzniük a jelszót.

Mi történik, ha a jelszóban pontosvessző van, például `ti;tok`? A telefon azt hinné, hogy a jelszó a `ti`-nél véget
ért. Ezért a különleges jelek (`\`, `;`, `,`, `:` és `"`) elé egy visszaperjel kerül: `ti\;tok`. Ez az
[[escape-elés]]: a visszaperjel azt üzeni, hogy „a következő karakter a szöveg része, nem elválasztó”. A
JavaScript-szövegekben a visszaperjel maga is különleges, ezért egyetlen visszaperjelet `'\\'` formában kell leírni.

A formátumok egy új fájlba kerülnek, az `src/formats.js`-be:

```js file=src/formats.js
// A különleges jelek elé egy \ kerül, így a beolvasó tudja, hogy a szöveg részei, nem elválasztók.
function escapeChars(text, specials) {
  let result = ''
  for (const char of text) {
    if (specials.includes(char)) result += '\\'
    result += char
  }
  return result
}

// Wi-Fi: WIFI:T:WPA;S:hálózat;P:jelszó;; formában. A telefon kamerája felajánlja a csatlakozást.
export function wifiText({ ssid, password, security, hidden }) {
  let text = `WIFI:T:${security};S:${escapeChars(ssid, '\\;,:"')};`
  if (security !== 'nopass') text += `P:${escapeChars(password, '\\;,:"')};`
  if (hidden) text += 'H:true;'
  return text + ';'
}
```

A `for (const char of text)` karakterenként megy végig a szövegen, az `includes` pedig megmondja, benne van-e a
karakter a különleges jelek listájában. A `wifiText` paraméterében megint destrukturálás: a Wi-Fi-adatok objektumából
rögtön kivesszük a négy mezőt. A `nopass` a jelszó nélküli hálózat, a `H:true` pedig azt jelzi, hogy a hálózat
rejtett: nem jelenik meg a telefon listájában, csak a nevével lehet rá csatlakozni.

Az űrlapot a `WifiForm` komponens rajzolja. A négy mező egyetlen objektumban él, így elég egy közös `update` függvény:
a 3. leckéből ismert spreaddel lemásolja az objektumot, és felülírja benne az egy megváltozott mezőt. Egy új űrlapelem
is van benne: a `<select>`, vagyis a [[legördülő lista]]. Ugyanúgy `value`-t és `onChange`-et kap, mint egy
`<input>`, a választható értékeket pedig az `<option>` elemek adják. A jelölőnégyzetnél, ahogy a 3. leckében, nem a
`value`, hanem a `checked` számít, ezért az eseményből is az `event.target.checked` kell. Hozd létre az
`src/components/WifiForm.jsx` fájlt:

```jsx file=src/components/WifiForm.jsx
function WifiForm({ wifi, onChange }) {
  // Egy mező változott: a régi objektum másolata, benne az egy új értékkel.
  function update(field, value) {
    onChange({ ...wifi, [field]: value })
  }

  return (
    <div className="form">
      <label className="field">
        <span>Hálózat neve (SSID)</span>
        <input value={wifi.ssid} onChange={(event) => update('ssid', event.target.value)} />
      </label>
      <label className="field">
        <span>Titkosítás</span>
        <select value={wifi.security} onChange={(event) => update('security', event.target.value)}>
          <option value="WPA">WPA / WPA2 / WPA3</option>
          <option value="WEP">WEP (régi)</option>
          <option value="nopass">Nincs jelszó</option>
        </select>
      </label>
      {wifi.security !== 'nopass' && (
        <label className="field">
          <span>Jelszó</span>
          <input
            value={wifi.password}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => update('password', event.target.value)}
          />
        </label>
      )}
      <label className="check">
        <input
          type="checkbox"
          checked={wifi.hidden}
          onChange={(event) => update('hidden', event.target.checked)}
        />
        Rejtett hálózat
      </label>
    </div>
  )
}

export default WifiForm
```

A `[field]: value` a 3. leckéből ismert szögletes zárójeles kulcs: „az a kulcs, amelyiknek a neve a `field` változóban
van”. Az `<input>` `type` nélkül sima szövegmező.

Fent egy fülsor választja ki, milyen kódot készítünk: minden fül egy kódfajta. Ugyanolyan gombokból áll, mint az
emojiválasztó, `aria-pressed`-del, csak más a kinézetük. Hozd létre az `src/components/ModeTabs.jsx` fájlt:

```jsx file=src/components/ModeTabs.jsx
const MODES = [
  { value: 'text', label: 'Szöveg' },
  { value: 'wifi', label: 'Wi-Fi' },
]

function ModeTabs({ mode, onChange }) {
  return (
    <div className="modes" role="group" aria-label="A QR-kód fajtája">
      {MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          className="modes__button"
          aria-pressed={mode === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default ModeTabs
```

A `role="group"` és az `aria-label` egy névvel ellátott csoportként mutatja be a gombokat a képernyőolvasóknak, ahogy
a `<fieldset>` a `<legend>`-del.

Az `App`-ban két új állapot kell: a mód (`mode`) és a Wi-Fi-adatok (`wifi`). A QR-kód tartalma most már a módtól függ,
de ez továbbra is származtatott érték: a `let`-tel létrehozott `content` a szöveggel indul, és Wi-Fi-módban
felülírjuk. Az űrlapok közül mindig csak az aktuális módé látszik: ez [[feltételes megjelenítés]] a `&&`-del, ahogy
ennek a leckének az 1. lépésében a képnél (`{url && <img … />}`). Itt a teljes `src/App.jsx`:

```jsx file=src/App.jsx mark=5-6,8,13,16,18,23-25,54-56
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import { makeSvg } from './qr.js'
import { downloadFile } from './download.js'
import { wifiText } from './formats.js'
import ModeTabs from './components/ModeTabs.jsx'
import TextForm from './components/TextForm.jsx'
import WifiForm from './components/WifiForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import LogoPicker from './components/LogoPicker.jsx'
import './App.css'

const START_WIFI = { ssid: '', password: '', security: 'WPA', hidden: false }

function App() {
  const [mode, setMode] = useState('text') // 'text' vagy 'wifi'
  const [text, setText] = useState('https://react.dev')
  const [wifi, setWifi] = useState(START_WIFI)
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  const [logo, setLogo] = useState('')

  // A kód tartalma a módtól függ. Származtatott érték: minden rajzoláskor kiszámoljuk.
  let content = text.trim()
  if (mode === 'wifi') content = wifi.ssid.trim() === '' ? '' : wifiText(wifi)

  const settings = { color, size, logo }
  const { url, error } = useQrCode(content, settings)
  const ready = content !== '' && !error && url !== ''

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
  }

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Írj be valamit, és itt megjelenik a QR-kód.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        Ez túl sok egy QR-kódhoz. Rövidíts a szövegen!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR-kód ehhez: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <ModeTabs mode={mode} onChange={setMode} />
          {mode === 'text' && <TextForm text={text} onChange={setText} />}
          {mode === 'wifi' && <WifiForm wifi={wifi} onChange={setWifi} />}
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
          <LogoPicker logo={logo} onChange={setLogo} />
        </div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">{preview}</div>
          {ready && (
            <div className="qr__actions">
              <a className="button button--primary" href={url} download="qr-code.png">
                PNG letöltése
              </a>
              <button type="button" className="button" onClick={downloadSvg}>
                SVG letöltése
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
```

A `wifi.ssid.trim() === '' ? '' : wifiText(wifi)`: amíg nincs hálózatnév, a tartalom üres, és az előnézet az „Írj be
valamit” feliratot mutatja.

:::check Ellenőrizd
Kattints a „Wi-Fi” fülre, és írd be az otthoni hálózatod nevét és jelszavát. Olvasd be a kódot a telefonoddal:
felajánlja, hogy csatlakozik a hálózathoz. Válaszd a „Nincs jelszó” titkosítást: a jelszómező eltűnik. Kattints vissza
a „Szöveg” fülre: a korábbi szöveged ott van, mert az állapota az `App`-ban él, nem a közben eltűnt `TextForm`-ban.
:::

:::mistake Gyakori hiba
A jelölőnégyzetnél `event.target.value`. Egy jelölőnégyzet `value`-ja mindig `"on"`, akár be van pipálva, akár nem,
így a `hidden` értéke egy szöveg lesz, ami mindig „igaznak” számít: a kódba minden esetben bekerül a `H:true;`. A pipa
állapotát az `event.target.checked` adja.
:::

:::concept Ki láthatja a jelszót?
A Wi-Fi-kódban a jelszó olvasható szövegként áll: bárki, aki lefényképezi a kódot, megtudja. Ezért leginkább
vendéghálózathoz érdemes ilyet kitenni, nem a fő hálózatodhoz.
:::

### Névjegy

A névjegyekre is van szabványos formátum, a [[vCard]]. A telefonok ezt is felismerik, és felajánlják, hogy elmentik a
névjegyek közé:

```text
BEGIN:VCARD
VERSION:3.0
N:Kiss Anna;;;;
FN:Kiss Anna
TEL:+36301234567
EMAIL:anna@example.com
END:VCARD
```

Minden adat külön sorban áll, a sor eleje megmondja, mi az. Az `N` a név részekre bontva, pontosvesszővel
elválasztva: vezetéknév; utónév; további név; előtag; utótag. Mi az egész nevet az első részbe írjuk, a többit üresen
hagyjuk, és a telefonoknak ez elég. Az `FN` a megjelenítendő teljes név, a `TEL` a telefonszám, az `EMAIL` az
e-mail-cím. A `BEGIN` és az `END` sor fogja közre az egészet. A vCardban a visszaperjel, a pontosvessző és a vessző
különleges.

A sorokat egy tömbbe gyűjtjük, és a végén a `join('\n')` fűzi össze őket. A `'\n'` egyetlen karakter, a [[sortörés]]:
a visszaperjel itt is azt jelzi, hogy az utána jövő `n` nem betű, hanem különleges jel. Itt a teljes `src/formats.js`:

```js file=src/formats.js mark=19-27
// A különleges jelek elé egy \ kerül, így a beolvasó tudja, hogy a szöveg részei, nem elválasztók.
function escapeChars(text, specials) {
  let result = ''
  for (const char of text) {
    if (specials.includes(char)) result += '\\'
    result += char
  }
  return result
}

// Wi-Fi: WIFI:T:WPA;S:hálózat;P:jelszó;; formában. A telefon kamerája felajánlja a csatlakozást.
export function wifiText({ ssid, password, security, hidden }) {
  let text = `WIFI:T:${security};S:${escapeChars(ssid, '\\;,:"')};`
  if (security !== 'nopass') text += `P:${escapeChars(password, '\\;,:"')};`
  if (hidden) text += 'H:true;'
  return text + ';'
}

// Névjegy vCard formában: minden adat külön sorban. A telefon felajánlja, hogy elmenti.
export function contactText({ name, phone, email }) {
  const fullName = escapeChars(name, '\\;,')
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${fullName};;;;`, `FN:${fullName}`]
  if (phone !== '') lines.push(`TEL:${escapeChars(phone, '\\;,')}`)
  if (email !== '') lines.push(`EMAIL:${escapeChars(email, '\\;,')}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}
```

A nevet egyszer alakítjuk át (`fullName`), és az `N` meg az `FN` sorban is ezt használjuk. A telefonszám és az e-mail
nem kötelező: a sorukat csak akkor tesszük be, ha nem üresek. Az űrlap ugyanúgy épül fel, mint a Wi-Fi-é, csak három
szövegmezővel. A `type="tel"` és a `type="email"` mezőnél a telefon a megfelelő billentyűzetet hozza elő (számokat,
illetve `@`-ot). Hozd létre az `src/components/ContactForm.jsx` fájlt:

```jsx file=src/components/ContactForm.jsx
function ContactForm({ contact, onChange }) {
  // Egy mező változott: a régi objektum másolata, benne az egy új értékkel.
  function update(field, value) {
    onChange({ ...contact, [field]: value })
  }

  return (
    <div className="form">
      <label className="field">
        <span>Név</span>
        <input value={contact.name} onChange={(event) => update('name', event.target.value)} />
      </label>
      <label className="field">
        <span>Telefonszám</span>
        <input type="tel" value={contact.phone} onChange={(event) => update('phone', event.target.value)} />
      </label>
      <label className="field">
        <span>E-mail-cím</span>
        <input type="email" value={contact.email} onChange={(event) => update('email', event.target.value)} />
      </label>
    </div>
  )
}

export default ContactForm
```

A `ModeTabs` egy harmadik fület kap:

```jsx file=src/components/ModeTabs.jsx mark=4
const MODES = [
  { value: 'text', label: 'Szöveg' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'contact', label: 'Névjegy' },
]

function ModeTabs({ mode, onChange }) {
  return (
    <div className="modes" role="group" aria-label="A QR-kód fajtája">
      {MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          className="modes__button"
          aria-pressed={mode === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default ModeTabs
```

Az `App`-ban ugyanaz kell, mint a Wi-Fi-nél: egy kezdőérték, egy állapot, egy sor a tartalomhoz és egy az űrlaphoz. A
`formats.js` importja is bővül: a régi `import { wifiText } from './formats.js'` sor helyére a lenti kód első sora
kerül, vagyis a `contactText` ugyanabba a kapcsos zárójelbe megy a `wifiText` mellé. Ne írj második importot ugyanabból
a fájlból, mert ugyanazt a nevet nem lehet kétszer importálni. A lenti kódban a `…` kezdetű megjegyzések helyén minden
marad, ahogy volt, és a fájl végén az `export default App` is:

```jsx file=src/App.jsx mark=1-2,6,9,12,18,28
import { contactText, wifiText } from './formats.js'
import ContactForm from './components/ContactForm.jsx'
// … a többi import, mint eddig

const START_WIFI = { ssid: '', password: '', security: 'WPA', hidden: false }
const START_CONTACT = { name: '', phone: '', email: '' }

function App() {
  const [mode, setMode] = useState('text') // 'text', 'wifi' vagy 'contact'
  const [text, setText] = useState('https://react.dev')
  const [wifi, setWifi] = useState(START_WIFI)
  const [contact, setContact] = useState(START_CONTACT)
  // … a szín, a méret és a logó, mint eddig

  // A kód tartalma a módtól függ. Származtatott érték: minden rajzoláskor kiszámoljuk.
  let content = text.trim()
  if (mode === 'wifi') content = wifi.ssid.trim() === '' ? '' : wifiText(wifi)
  if (mode === 'contact') content = contact.name.trim() === '' ? '' : contactText(contact)

  // … a settings, a hook, a downloadSvg és a preview, mint eddig

  return (
    <main className="qr">
      {/* … a cím, mint eddig */}
          <ModeTabs mode={mode} onChange={setMode} />
          {mode === 'text' && <TextForm text={text} onChange={setText} />}
          {mode === 'wifi' && <WifiForm wifi={wifi} onChange={setWifi} />}
          {mode === 'contact' && <ContactForm contact={contact} onChange={setContact} />}
      {/* … a többi, mint eddig */}
    </main>
  )
}
```

:::check Ellenőrizd
Kattints a „Névjegy” fülre, és add meg a neved, a telefonszámod és az e-mail-címed. Olvasd be a telefonoddal:
felajánlja, hogy új névjegyként elmenti, a mezők a helyükön. Amíg a név üres, a kód sem jelenik meg.
:::

:::mistake Gyakori hiba
`join('/n')` a `join('\n')` helyett: a perjel és a visszaperjel könnyen összekeveredik. Ekkor nincs sortörés, az egész
névjegy egyetlen hosszú sor lesz, tele „/n”-ekkel, és a telefon sima szövegként mutatja, nem névjegyként.
:::

:::try Feladat
Adj a névjegyhez weboldalt is, például a portfóliód címét: a vCardban ez az `URL:` sor. Három helyen kell
hozzányúlnod: a `START_CONTACT`-hoz, a `ContactForm`-hoz és a `contactText`-hez.
:::

### Előzmények

Jó lenne, ha az oldal megjegyezné a letöltött kódokat, hogy egy kattintással újra elő lehessen venni őket. A 2.
leckében a `localStorage`-ba mentettük a témát. Ez a tároló azonban csak szöveget tud megőrizni, nekünk pedig egy
tömböt kell elmentenünk. A megoldás a 4. leckében már látott [[JSON]]: egy szöveges formátum, amiben tömböket és
objektumokat lehet leírni. A
`JSON.stringify(['a', 'b'])` szöveget készít a tömbből (`'["a","b"]'`), a `JSON.parse` pedig visszaalakítja tömbbé.

Az előzmények saját hookot kapnak, ugyanúgy felépítve, mint a 2. lecke témamentése: [[lusta kezdőérték]] a
beolvasáshoz, egy effekt a mentéshez, és `try/catch`, mert a tárolót le lehet tiltani, a mentett szöveg pedig akár
hibás is lehet. Hozd létre az `src/useHistory.js` fájlt:

```js file=src/useHistory.js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'qr-history'
const MAX_ITEMS = 8

// Beolvassa a mentett listát. Ha nincs mentés, ha a mentés hibás, vagy ha tiltott a tároló, üres listával indulunk.
function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved
  } catch {
    // Nem baj: ilyenkor nincsenek előzmények.
  }
  return []
}

function useHistory() {
  const [items, setItems] = useState(readHistory)

  // Minden változást elmentünk, hogy a lista újratöltés után is megmaradjon.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Nem baj, ha nem sikerül elmenteni.
    }
  }, [items])

  // Az új elem kerül előre; ha már szerepelt, kivesszük a régi helyéről. Legfeljebb MAX_ITEMS marad.
  function remember(text) {
    setItems([text, ...items.filter((item) => item !== text)].slice(0, MAX_ITEMS))
  }

  function clear() {
    setItems([])
  }

  return { items, remember, clear }
}

export default useHistory
```

- Ha még nincs mentés, a `getItem` `null`-t ad, a `JSON.parse(null)` pedig szintén `null`. Az `Array.isArray(saved)`
  csak akkor igaz, ha tényleg tömb jött vissza; minden más esetben üres listával indulunk.
- A `remember` (megjegyez) egy új tömböt rak össze: elöl az új szöveg, utána a `...` spread beteszi a régi elemek
  közül azokat, amelyek nem egyeznek vele (`filter`, 3. lecke). Így ugyanaz a kód sosem szerepel kétszer. A `slice(0, MAX_ITEMS)` az
  első nyolc elemet tartja meg, a többit levágja.
- Az állapotot most sem módosítjuk közvetlenül: a `setItems` mindig egy új tömböt kap.

A lista a `History` komponensbe kerül. Minden eleme egy gomb, ami visszatölti a szöveget; a [[key]] maga a szöveg,
hiszen az úgyis egyedi. Hozd létre az `src/components/History.jsx` fájlt:

```jsx file=src/components/History.jsx
function History({ items, onPick, onClear }) {
  return (
    <section className="history">
      <div className="history__head">
        <h2>Előzmények</h2>
        {items.length > 0 && (
          <button type="button" className="history__clear" onClick={onClear}>
            Törlés
          </button>
        )}
      </div>
      {items.length === 0 && <p className="history__empty">Itt jelennek meg a letöltött kódok.</p>}
      <ul className="history__list">
        {items.map((item) => (
          <li key={item}>
            <button type="button" className="history__item" onClick={() => onPick(item)}>
              {item}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default History
```

Az `App` mindkét letöltésnél megjegyzi a tartalmat. A PNG-link `onClick`-et kap: a link ettől még letölti a fájlt, de
előtte lefut a mi függvényünk is. Ha egy elemre kattintasz, az `openText` visszavált a „Szöveg” fülre, és beírja a
szöveget a mezőbe. Egy Wi-Fi-kód vagy névjegy így nyersen, `WIFI:…` vagy `BEGIN:VCARD…` formában tér vissza, de a
QR-kód ugyanaz lesz, hiszen a tartalma ugyanaz a szöveg. A lenti kódban a `…` kezdetű megjegyzések helyén minden
marad, ahogy volt, és a fájl végén az `export default App` is:

```jsx file=src/App.jsx mark=1-2,7,14,17-21,32,38-40
import useHistory from './useHistory.js'
import History from './components/History.jsx'
// … a többi import és a két kezdőérték, mint eddig

function App() {
  // … az állapotok, mint eddig
  const history = useHistory()

  // … a content, a settings, a hook és a ready, mint eddig

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
    history.remember(content)
  }

  // Egy korábbi szöveg visszakerül a szövegmezőbe.
  function openText(value) {
    setMode('text')
    setText(value)
  }

  // … a preview, mint eddig

  return (
    <main className="qr">
      {/* … a cím és a mezők, mint eddig */}
              <a
                className="button button--primary"
                href={url}
                download="qr-code.png"
                onClick={() => history.remember(content)}
              >
                PNG letöltése
              </a>
      {/* … az SVG-gomb és a lezáró címkék, mint eddig, a qr__layout végéig */}

      <div className="qr__extras">
        <History items={history.items} onPick={openText} onClear={history.clear} />
      </div>
    </main>
  )
}
```

A `useHistory` egy objektumot ad vissza, és ezt most nem bontjuk szét: a `history.items`, a `history.remember` és a
`history.clear` a nevével együtt is jól olvasható.

:::check Ellenőrizd
Tölts le néhány különböző kódot: megjelennek az előzmények között, a legújabb felül. Írd be újra egy korábbi kód
szövegét, és töltsd le még egyszer: nem duplázódik, hanem a lista tetejére kerül. Töltsd újra az oldalt: a lista
megmarad (a fejlesztői eszközökben: Application → Local storage → `http://localhost:5173` → `qr-history`). Kattints egy elemre: a szövege visszakerül a „Szöveg” fülre, a kód újra megjelenik. A
„Törlés” kiüríti a listát.
:::

:::mistake Gyakori hiba
A `JSON.stringify` nélkül, közvetlenül a tömböt menteni: `localStorage.setItem(STORAGE_KEY, items)`. A tároló ilyenkor
magától szöveggé alakítja a tömböt, de nem JSON-ként, hanem vesszővel összefűzve: `https://react.dev,WIFI:T:WPA…`.
Hibát nem kapsz, de újratöltéskor a `JSON.parse` nem tudja értelmezni, és az előzmények üresen indulnak.
:::

:::concept Előzmények és adatvédelem
Az előzmények a böngészőben maradnak, de bárki láthatja őket, aki ezen a gépen megnyitja az oldalt, a
Wi-Fi-jelszavakkal együtt. Ha közös gépet használsz, használat után nyomd meg a „Törlés” gombot.
:::

### A kamera képe

Végül fordítsuk meg az irányt: a kamera olvasson be egy QR-kódot. Ezt két lépésben építjük fel: ebben a lépésben
bekapcsoljuk a kamerát, és megmutatjuk a képét az oldalon, a következőben pedig felismerjük rajta a kódot. A kamerához
két dolog kell.

- A [[getUserMedia]] (`navigator.mediaDevices.getUserMedia`) bekapcsolja a kamerát. A böngésző előbb engedélyt kér a
  felhasználótól, a `getUserMedia` pedig csak [[biztonságos környezetben|biztonságos környezet]] működik: `https://`
  címen vagy a `localhost`-on, ahogy a 3. lecke vágólapja. Egy Promise-t ad vissza, ami egy
  [[médiafolyammal|médiafolyam]] (`MediaStream`) teljesül: ez a kamera élő képe.
- Egy `<video>` elem mutatja a képet. A folyamot azonban nem lehet JSX-attribútumként átadni: a videóelem `srcObject`
  tulajdonságába kell beírni, közvetlenül a valódi HTML-elembe. Ehhez kell a [[useRef]].

A `useRef` egy doboz, ami rajzolásról rajzolásra megőriz egy értéket, de ha megváltozik, a React nem rajzol újra. A
`useRef(null)` üres dobozzal indul: a `current` mezője eleinte `null`. A leggyakoribb használata: ha egy JSX-elemnek
`ref={videoRef}` attribútumot adsz, a React a valódi HTML-elemet, a [[DOM]]-elemet teszi a doboz `current` mezőjébe,
amint az elem megjelent az oldalon. A DOM a böngésző saját modellje az oldalról: a React a JSX-ből ezeket az elemeket
építi fel, és a `ref` az egyik elemhez ad közvetlen hozzáférést.

A kamera indítása és leállítása rajzoláson kívüli munka, ezért egy effekt végzi, ami akkor fut le, amikor a `scanning`
(szkennelés) állapot változik. A takarító függvény itt nagyon fontos: ez kapcsolja ki a kamerát. Az `ignore` ugyanaz a
trükk, mint a `useQrCode`-ban: ha a szkennert már leállították, mire a kamera engedélyt kapott, a kamera azonnal ki is
kapcsol. Hozd létre az `src/components/Scanner.jsx` fájlt:

```jsx file=src/components/Scanner.jsx
import { useEffect, useRef, useState } from 'react'

// Kikapcsolja a kamerát: a folyam minden sávját (itt csak a videót) leállítja.
function stopCamera(stream) {
  stream.getTracks().forEach((track) => track.stop())
}

function Scanner() {
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!scanning) return

    let ignore = false
    let stream = null

    async function start() {
      try {
        // Telefonon a facingMode: 'environment' a hátsó kamerát kéri.
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      } catch {
        if (ignore) return
        setMessage('Nem sikerült elindítani a kamerát. Engedélyezted a böngészőben?')
        setScanning(false)
        return
      }
      // Ha közben leállították a szkennert, a kamerát rögtön ki is kapcsoljuk.
      if (ignore) {
        stopCamera(stream)
        return
      }
      videoRef.current.srcObject = stream
    }

    start()

    // Takarítás: kikapcsol a kamera, ha a szkenner leáll vagy eltűnik.
    return () => {
      ignore = true
      if (stream) stopCamera(stream)
    }
  }, [scanning])

  function startScanning() {
    setMessage('')
    setScanning(true)
  }

  return (
    <section className="scanner">
      <h2>Beolvasás kamerával</h2>
      {scanning ? (
        <div className="scanner__camera">
          <video ref={videoRef} className="scanner__video" autoPlay playsInline muted />
          <button type="button" className="button" onClick={() => setScanning(false)}>
            Kamera leállítása
          </button>
        </div>
      ) : (
        <button type="button" className="button" onClick={startScanning}>
          Kamera indítása
        </button>
      )}
      {message !== '' && (
        <p className="scanner__note" role="status">
          {message}
        </p>
      )}
    </section>
  )
}

export default Scanner
```

- A `start` egy `async` függvény az effekten belül, mert maga az effekt nem lehet `async`. Az effekt elindítja, és
  nem várja meg.
- Ha a felhasználó nem engedélyezi a kamerát, vagy nincs is kamera, a `getUserMedia` Promise-a elutasított lesz, és a
  `catch` ág fut le, mint a 3. lecke vágólapjánál: kiírja az üzenetet, és leállítja a szkennert.
- A `stream` és az `ignore` az effekt saját változói: a takarító függvény ugyanazokat látja, amelyeket a `start`
  beállított. Ha a `stream` még `null`, mert a kamera még nem indult el, a takarítás nem kapcsol ki semmit; ezt az
  `if (ignore)` ág intézi el, amikor a kamera végül megérkezik.
- A `getTracks()` egy tömbben adja a folyam sávjait (egy kamerának csak videósávja van). A `forEach` a tömb minden
  elemére lefuttatja a nyílfüggvényt, mint a `map`, csak nem készít új tömböt: itt minden sávon meghívja a `stop()`-ot,
  és ettől alszik ki a kamera lámpája.
- A videó `autoPlay` attribútuma magától elindítja a képet, a `playsInline` telefonon megakadályozza, hogy teljes
  képernyőre nyíljon, a `muted` (némított) pedig azért kell, mert a böngészők csak a néma videót engedik magától
  elindulni.

A szkenner az előzmények mellé kerül, a `qr__extras` dobozba. A lenti kódban a `…` kezdetű megjegyzések helyén minden
marad, ahogy volt, és a fájl végén az `export default App` is:

```jsx file=src/App.jsx mark=1,13
import Scanner from './components/Scanner.jsx'
// … a többi import és a két kezdőérték, mint eddig

function App() {
  // … minden, mint eddig, a return-ig

  return (
    <main className="qr">
      {/* … a cím, a mezők és az előnézet, mint eddig, a qr__layout végéig */}

      <div className="qr__extras">
        <History items={history.items} onPick={openText} onClear={history.clear} />
        <Scanner />
      </div>
    </main>
  )
}
```

:::check Ellenőrizd
Kattints a „Kamera indítása” gombra. A böngésző engedélyt kér: engedélyezd, és megjelenik a kamera képe. Kattints a
„Kamera leállítása” gombra: a kép eltűnik, és a kamera lámpája kialszik. Ha a gépednek nincs kamerája, vagy nem adtál
engedélyt, a „Nem sikerült elindítani a kamerát” kezdetű üzenet jelenik meg.
:::

:::mistake Gyakori hiba
A takarító függvényből kimarad a `stopCamera(stream)`. A videó eltűnik az oldalról, de a kamera tovább fut a
háttérben: a lámpája égve marad, és a böngésző fülén a kamera ikonja is jelzi, hogy használatban van. Ami az effektben
elindul, azt a takarításban le kell állítani.
:::

:::try Próbáld ki
Nézd meg, mit ad a `getTracks()`. Írd a `videoRef.current.srcObject = stream` sor alá: `console.log(stream.getTracks())`,
és indítsd el a kamerát. A konzolban egy egyelemű tömb jelenik meg; nyisd le: a benne lévő `MediaStreamTrack` a kamera
videósávja (`kind: "video"`), a `label` pedig a kamera neve. Utána töröld a sort.
:::

:::concept Hogyan próbáld ki telefonon?
A telefon kamerájához `https://` cím kell. Ha a fejlesztői szervert `npm run dev -- --host` paranccsal indítod, és a
telefonon a géped IP-címét nyitod meg (`http://192.168…`), a `navigator.mediaDevices` nem is létezik, és a szkenner
azt írja, hogy nem sikerült elindítani a kamerát. A legegyszerűbb út az 1. lecke haladó szintje: tedd ki az oldalt a
GitHub Pages-re (`base: './'` a `vite.config.js`-ben, a `deploy.yml` workflow és egy `git push`), és nyisd meg a
kapott `https://` címet a telefonon. A következő lépés kódfelismeréséhez androidos Chrome kell.
:::

### A kód felismerése

A kamera képe megvan, most jöhet a felismerés. Ezt a [[BarcodeDetector]] végzi: megkeresi a kódokat egy képen. Ez egy
új böngészőfunkció, ami egyelőre csak néhány helyen érhető el, például az androidos és a macOS-es Chrome-ban;
Windowson, Firefoxban és iPhone-on általában nincs. Ezért a kódnak előbb meg kell néznie, létezik-e egyáltalán. Ez a
[[funkcióészlelés]]: a `'BarcodeDetector' in window` igaz, ha a böngésző ismeri.

Egyetlen pillantás nem elég: a kód akkor kerül a kamera elé, amikor a felhasználó odatartja. Ezért a videó aktuális
képkockáját 300 ezredmásodpercenként újra megnézzük, egy [[setInterval]] segítségével. Ez egy ismétlődő időzítő: a
`setTimeout` testvére, ami nem egyszer, hanem újra és újra lefut, amíg a `clearInterval` le nem állítja. A találatot a
`Scanner` nem maga írja be a szövegmezőbe, hiszen a szöveg az `App` állapota: egy `onResult` propon keresztül szól az
`App`-nak, ahogy a `TextForm` az `onChange`-en. Írd át így az `src/components/Scanner.jsx`-et (a kiemelt sorok újak):

```jsx file=src/components/Scanner.jsx mark=8,11,19,38-50,55,58,64,89-98
import { useEffect, useRef, useState } from 'react'

// Kikapcsolja a kamerát: a folyam minden sávját (itt csak a videót) leállítja.
function stopCamera(stream) {
  stream.getTracks().forEach((track) => track.stop())
}

function Scanner({ onResult }) {
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [found, setFound] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!scanning) return

    let ignore = false
    let stream = null
    let timer = null

    async function start() {
      try {
        // Telefonon a facingMode: 'environment' a hátsó kamerát kéri.
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      } catch {
        if (ignore) return
        setMessage('Nem sikerült elindítani a kamerát. Engedélyezted a böngészőben?')
        setScanning(false)
        return
      }
      // Ha közben leállították a szkennert, a kamerát rögtön ki is kapcsoljuk.
      if (ignore) {
        stopCamera(stream)
        return
      }
      videoRef.current.srcObject = stream

      // Funkcióészlelés: tud-e ez a böngésző QR-kódot felismerni?
      if (!('BarcodeDetector' in window)) {
        setMessage('A kamera működik, de ez a böngésző nem ismeri fel a QR-kódokat.')
        return
      }
      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      // 300 ezredmásodpercenként megnézzük, van-e kód a kamera képén.
      timer = setInterval(async () => {
        const codes = await detector.detect(videoRef.current)
        if (ignore || codes.length === 0) return
        setFound(codes[0].rawValue)
        setScanning(false)
      }, 300)
    }

    start()

    // Takarítás: leáll a figyelés, és kikapcsol a kamera, ha a szkenner leáll vagy eltűnik.
    return () => {
      ignore = true
      clearInterval(timer)
      if (stream) stopCamera(stream)
    }
  }, [scanning])

  function startScanning() {
    setFound('')
    setMessage('')
    setScanning(true)
  }

  return (
    <section className="scanner">
      <h2>Beolvasás kamerával</h2>
      {scanning ? (
        <div className="scanner__camera">
          <video ref={videoRef} className="scanner__video" autoPlay playsInline muted />
          <button type="button" className="button" onClick={() => setScanning(false)}>
            Kamera leállítása
          </button>
        </div>
      ) : (
        <button type="button" className="button" onClick={startScanning}>
          Kamera indítása
        </button>
      )}
      {message !== '' && (
        <p className="scanner__note" role="status">
          {message}
        </p>
      )}
      {found !== '' && (
        <div className="scanner__found">
          <p>
            Találat: <strong>{found}</strong>
          </p>
          <button type="button" className="button button--primary" onClick={() => onResult(found)}>
            Megnyitás a szövegmezőben
          </button>
        </div>
      )}
    </section>
  )
}

export default Scanner
```

- Az időzítőnek átadott függvény egy `async` nyílfüggvény, `async () => { … }`, így `await`-tel megvárhatja a
  `detect` válaszát. A `detect` a videó aktuális képkockáján keres kódokat, és egy tömböt ad; a `rawValue` a kódban
  lévő szöveg. Ha a tömb üres, nincs kód a képen, és a következő kör újra próbálkozik.
- Találatkor a `setScanning(false)` leállítja a szkennert, a többit pedig az effekt takarítása végzi el: leállítja az
  időzítőt, és kikapcsolja a kamerát. Ezért lett a `timer` is az effekt saját változója, a `stream` és az `ignore`
  mellett.
- Ha a böngésző nem ismeri a `BarcodeDetector`-t, a `start` az üzenet után véget ér: a kamera képe látszik, de
  időzítő nem indul.
- Találatkor nem írjuk be rögtön a szöveget, hanem megmutatjuk, és a felhasználó dönti el, megnyitja-e.

Az `App` a szkennernek ugyanazt az `openText`-et adja, mint az előzményeknek. Itt a teljes, kész `src/App.jsx`:

```jsx file=src/App.jsx mark=45,98
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import useHistory from './useHistory.js'
import { makeSvg } from './qr.js'
import { downloadFile } from './download.js'
import { contactText, wifiText } from './formats.js'
import ModeTabs from './components/ModeTabs.jsx'
import TextForm from './components/TextForm.jsx'
import WifiForm from './components/WifiForm.jsx'
import ContactForm from './components/ContactForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import LogoPicker from './components/LogoPicker.jsx'
import History from './components/History.jsx'
import Scanner from './components/Scanner.jsx'
import './App.css'

const START_WIFI = { ssid: '', password: '', security: 'WPA', hidden: false }
const START_CONTACT = { name: '', phone: '', email: '' }

function App() {
  const [mode, setMode] = useState('text') // 'text', 'wifi' vagy 'contact'
  const [text, setText] = useState('https://react.dev')
  const [wifi, setWifi] = useState(START_WIFI)
  const [contact, setContact] = useState(START_CONTACT)
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  const [logo, setLogo] = useState('')
  const history = useHistory()

  // A kód tartalma a módtól függ. Származtatott érték: minden rajzoláskor kiszámoljuk.
  let content = text.trim()
  if (mode === 'wifi') content = wifi.ssid.trim() === '' ? '' : wifiText(wifi)
  if (mode === 'contact') content = contact.name.trim() === '' ? '' : contactText(contact)

  const settings = { color, size, logo }
  const { url, error } = useQrCode(content, settings)
  const ready = content !== '' && !error && url !== ''

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
    history.remember(content)
  }

  // Egy korábbi vagy beolvasott szöveg visszakerül a szövegmezőbe.
  function openText(value) {
    setMode('text')
    setText(value)
  }

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Írj be valamit, és itt megjelenik a QR-kód.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        Ez túl sok egy QR-kódhoz. Rövidíts a szövegen!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR-kód ehhez: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <ModeTabs mode={mode} onChange={setMode} />
          {mode === 'text' && <TextForm text={text} onChange={setText} />}
          {mode === 'wifi' && <WifiForm wifi={wifi} onChange={setWifi} />}
          {mode === 'contact' && <ContactForm contact={contact} onChange={setContact} />}
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
          <LogoPicker logo={logo} onChange={setLogo} />
        </div>
        <section className="qr__preview" aria-label="Előnézet">
          <div className="qr__stage">{preview}</div>
          {ready && (
            <div className="qr__actions">
              <a
                className="button button--primary"
                href={url}
                download="qr-code.png"
                onClick={() => history.remember(content)}
              >
                PNG letöltése
              </a>
              <button type="button" className="button" onClick={downloadSvg}>
                SVG letöltése
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="qr__extras">
        <History items={history.items} onPick={openText} onClear={history.clear} />
        <Scanner onResult={openText} />
      </div>
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Kattints a „Kamera indítása” gombra. Windowsos Chrome-ban a sárga figyelmeztetés jelzi, hogy a kamera működik, de a
felismerés nem elérhető. Androidos vagy macOS-es Chrome-ban (telefonon ehhez `https://` cím kell, lásd az előző lépés
„Hogyan próbáld ki telefonon?” dobozát) tarts a kamera elé egy QR-kódot, például egy másik képernyőn: megjelenik a
„Találat”, a kamera magától kikapcsol, és a „Megnyitás a szövegmezőben” gomb beírja a szövegét a „Szöveg” fül
mezőjébe. Gratulálok, kész a QR-kód-generátorod!
:::

:::mistake Gyakori hiba
A takarításból kimarad a `clearInterval(timer)`. A kamera ugyan kikapcsol, de az időzítő tovább fut, és 300
ezredmásodpercenként egy olyan videón keres kódot, ami már nincs is az oldalon: a konzolban sorra jelennek meg a piros
hibák. Az időzítő is az effektben indul, ezért azt is a takarításnak kell leállítania.
:::

:::try Feladat
A beolvasott kódok is kerüljenek be az előzmények közé. Az `App`-ban adj a `Scanner`-nek egy saját függvényt, ami az
`openText(value)` mellett a `history.remember(value)`-t is meghívja.
:::
