# Mit építünk?

Egy bemutatkozó oldalt, ami rólad szól: ki vagy, mit tudsz, min dolgoztál, és hogyan érhetnek el. A lecke három
szintje egymásra épül. Az első végén már kész, működő oldalad lesz, a másik kettő ezt bővíti.

:::levels
- Egyoldalas bemutatkozás: név, rövid leírás, készségek, elérhetőség. | kb. 2 óra
- Projektkártyák, külön oldal minden projektnek, kapcsolati űrlap ellenőrzéssel. | kb. 3 óra
- Finom animációk, Lighthouse 90+ pont, és az oldal élesben, a GitHub Pages-en. | kb. 3 óra
:::

**Előismeret:** semmi, ez az első lecke. Egy kis HTML jól jön, de nem feltétel: mindent elmagyarázunk, amire szükség van.

## Kezdő szint {level=1}

### Mielőtt elkezded

Három programra lesz szükséged, mindhárom ingyenes:

- **Node.js** (az LTS-verzió, [nodejs.org](https://nodejs.org)): ez futtatja a gépeden a
  [[fejlesztői szervert|fejlesztői szerver]], azt a kis programot, amely kiszolgálja az oldaladat a böngészőnek, és
  minden mentés után frissíti.
- Egy **kódszerkesztő**, például a [VS Code](https://code.visualstudio.com).
- A **Git** ([git-scm.com](https://git-scm.com)): ez menti el a munkád egyes állapotait, és a haladó szinten ezzel
  töltöd fel az oldalt. Windowson külön kell telepíteni, Macen az első `git` parancs felajánlja a telepítését.

A parancsokat egy [[terminálban|terminál]] adod ki: ez egy ablak, ahol kattintás helyett szöveggel beszélsz a géppel. A
Node.js-sel együtt érkezik az [[npm]] is: ez tölti le azokat a [[csomagokat|csomag]] (kész kódokat, például a Reactot),
amelyeket a projekt használ. A fejlesztői szervert a [[Vite]] futtatja: erre az eszközre épül a kiinduló projekt.

**A kurzus a GitHubon.** A [[GitHub]] egy weboldal, ahol a programozók a projektjeiket tárolják és megosztják. Egy
ottani projekt neve [[repó]] (az angol repository rövidítése): olyan mappa, amelynek az előzményeit a [[Git]] megőrzi,
így a fájlok minden elmentett állapota visszakereshető. Az egész kurzus egyetlen repó, a `rika-mentoring`. Minden lecke
egy mappa benne (ez itt a `lessons/01-portfolio`), és mindegyikben két projekt van: az `exercise` (feladat) a kiinduló
projekt, erre építesz, a `solution` (megoldás) pedig a kész app, amelyet a Megoldás fülön ki is próbálhatsz. Az oldal
tetején a **Feladat a GitHubon** gomb ennek a leckének az `exercise` mappáját mutatja meg a GitHubon.

Hozz létre egy saját mappát a kurzushoz, például `react-course` néven a Dokumentumok mappádban. Nyisd meg a
szerkesztőben (VS Code-ban: **File** → **Open Folder**), aztán nyiss egy terminált (VS Code-ban: **Terminal** menü →
**New Terminal**): ez a megnyitott mappában indul. Írd be ezt a parancsot, és nyomd meg az ++Enter++ billentyűt:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git
```

A [[klónozás]] egy repó lemásolása a gépedre, a teljes előzményeivel együtt: a `react-course` mappában megjelenik egy
`rika-mentoring` mappa. Ez kapcsolatban marad a GitHubbal, így később egyetlen parancs lehozza az új leckéket: a
`git pull`, ebben a mappában kiadva (a `cd rika-mentoring` belép a mappába, utána jöhet a `git pull`, végül a `cd ..` visszalép). Ha egy korábbi
leckéből már megvan a repó, nem kell újra klónoznod: elég benne egy `git pull`. Ha a terminál nem ismeri fel a `git`
parancsot, zárd be a VS Code-ot, és nyisd meg újra (lásd lent a Gyakori hiba dobozt).

Ha inkább kattintanál: a [repó oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code** →
**Download ZIP** lehetőséget, és a letöltött fájlt csomagold ki a munkamappádba. A kicsomagolt mappa neve
`rika-mentoring-main` (a Windows néha még egy ugyanilyen nevű mappába is beleteszi). Ebben ugyanúgy megtalálod a
`lessons` mappát: a feladatot fájlkezelővel másold ki belőle, ahogy lent olvasod, csak ahol a szöveg `rika-mentoring`
mappát említ, ott a `rika-mentoring-main` mappát nyisd meg. A ZIP viszont egyszeri másolat: nem frissül, az új
leckékhez újra le kell töltened. Ehhez a leckéhez úgyis kell a Git, ezért a klónozás a kényelmesebb.

**A feladat kimásolása.** A repóban sosem dolgozol. A lecke `exercise` mappáját másold ki belőle a munkamappádba, és a
másolatnak add a `me-myself-and-react` nevet: így a repó változatlan marad (a `git pull` továbbra is működik), a munkád
pedig a saját projekted lesz. Fájlkezelővel: nyisd meg a `rika-mentoring` → `lessons` → `01-portfolio` mappát, jelöld ki
az `exercise` mappát, és másold ki (++Ctrl++ + ++C++, Macen ++Cmd++ + ++C++), lépj vissza a `react-course` mappába,
illeszd be (++Ctrl++ + ++V++, Macen ++Cmd++ + ++V++), aztán nevezd át a másolatot (Windowson ++F2++, Macen ++Enter++).
Vagy írd be ezt a terminálba, amely még mindig a `react-course` mappában van:

```shell
cp -r rika-mentoring/lessons/01-portfolio/exercise me-myself-and-react
```

A `cp -r` egy mappát másol le mindenestül egy új mappába, amelynek a nevét a végén adod meg. A VS Code windowsos
terminálja (a PowerShell) is érti. A munkamappádban most két mappa van: a `rika-mentoring` a repó a GitHubról, ezt hagyd
úgy, ahogy van, a `me-myself-and-react` pedig a feladat másolata, ebben dolgozol.

```text
react-course/
  rika-mentoring/
  me-myself-and-react/
```

**Indítás.** Nyisd meg a másolatodat a szerkesztőben (**File** → **Open Folder** → `me-myself-and-react`), ne a
munkamappát, és ne is a repóban lévő `exercise` mappát, mert a parancsoknak ott kell futniuk, ahol a `package.json` van,
a munkád pedig a másolatodba kerül. Aztán nyiss újra egy terminált (**Terminal** → **New Terminal**), és írd be
egyenként ezt a két parancsot; mindegyik után nyomd meg az ++Enter++ billentyűt:

```shell
npm install
npm run dev
```

Az `npm install` letölti a projekt csomagjait (React, Vite); erre csak egyszer van szükség. Az `npm run dev` elindítja a
fejlesztői szervert.

:::check Ellenőrizd
A terminál kiír egy címet, általában `http://localhost:5173`. Nyisd meg a böngészőben: egy „Hello, React!” feliratot
látsz. Amíg dolgozol, hagyd futni a szervert ebben a terminálban. Leállítani a ++Ctrl++ + ++C++ billentyűkkel tudod.
:::

:::mistake Gyakori hiba
Ha az `npm install` azt írja, hogy nem találja a `package.json`-t, rossz mappában van a terminál, például a
`react-course` mappában. Magát a `me-myself-and-react` mappát nyisd meg a szerkesztőben (amelyikben a `package.json`
van), aztán nyiss egy új terminált. Ha a terminál a `git` vagy az `npm` parancsot egyáltalán nem ismeri fel, zárd be a
VS Code-ot, és nyisd meg újra: a terminál csak azokat a programokat találja meg, amelyeket az indulása előtt
telepítettél.
:::

**A kiindulópont mentése.** A másolatod egyelőre egy sima mappa: a repó, amelyből származik, a `rika-mentoring`
mappában maradt. Legyen belőle saját repó, hogy a Git el tudja menteni, hol tartasz. A szervert hagyd futni, a
Git-parancsokhoz pedig nyiss egy második terminált (a terminálpanel **+** gombjával); ez is a `me-myself-and-react`
mappában nyílik meg. Előbb, egyszer s mindenkorra, add meg a gépeden a saját nevedet és e-mail-címedet: ezeket a Git
minden mentésbe (commitba, lásd lent) beírja. A példában Példa Petra adatai állnak. Ha később a GitHubra is feltöltöd a
projektet, ez a cím a commitokban nyilvános lesz.

```shell
git config --global user.name "Példa Petra"
git config --global user.email "petra@example.com"
```

Aztán a másolatodban:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

A `git init -b main` git-repóvá teszi a mappát: mostantól a Git megőrzi az előzményeit, egy rejtett `.git` mappában. A
`-b main` azt mondja meg, hogy az [[ág]] (angolul branch), vagyis az elmentett állapotok sora `main` nevű legyen: a
haladó szinten a GitHub ezt a nevet várja. A `git add .` a mappa összes fájlját kijelöli mentésre (a pont jelentése: „ez
a mappa”), a `git commit -m "Starting point"` pedig elmenti őket egy [[commitba|commit]], vagyis egy pillanatképbe az
összes fájlról, egy rövid üzenettel, amely megmondja, mi ez. A „Starting point” jelentése kiindulópont; a saját
commitjaid üzenetét nyugodtan írd magyarul. A `node_modules` mappát (ebben vannak a letöltött csomagok) a Git kihagyja:
a `.gitignore` fájl sorolja fel, mit hagyjon figyelmen kívül, a csomagokat pedig az `npm install` bármikor újra letölti.

:::check Ellenőrizd
Windowson a `git add .` minden fájlnál kiírhat egy figyelmeztetést („LF will be replaced by CRLF”), most és a későbbi
commitoknál is. Ez ártalmatlan: a Git csak jelzi, hogy a sorvégeket (a minden sor végén álló láthatatlan jelet)
windowsos módon fogja írni. Folytasd a `git commit` paranccsal. Utána a `git log` kilistázza a commitokat: most egyet
látsz, a „Starting point” üzenetűt, a neveddel és a dátummal. Ha a lista nem fér ki az ablakba, a Git oldalanként
mutatja, és a ++Q++ billentyűvel lépsz ki belőle.
:::

:::mistake Gyakori hiba
Ha a `git commit` azt válaszolja, hogy „Author identity unknown” („Please tell me who you are”), a Git még nem ismeri a
nevedet: futtasd le a két `git config` sort, aztán újra a `git commit` parancsot. Ha a `git init` nem ismeri a `-b`
kapcsolót, a Gited a 2.28-as verziónál régebbi: telepítsd a legújabbat a git-scm.com oldalról.
:::

:::concept A másolatodból git-repó lesz
A `me-myself-and-react` mappa mostantól saját repó, semmi köze a `rika-mentoring` repóhoz: amit itt commitolsz, az a te
projektedben marad, és a haladó szinten ezt a repót teszed fel a GitHubra. Munka közben:

- Ha egy lépés elkészült és működik, commitold: `git add .`, majd `git commit -m "Hero kész"`. Minden szint végén az
  útmutató is szól.
- A `git log` kilistázza a commitjaidat.
- Ha valami nagyon elromlik, a `git restore .` visszaállítja a fájlokat az utolsó commit állapotára. Az új fájlokat nem
  törli.
:::

### Mi az a React-komponens?

Egy React-oldal kis, újra felhasználható darabokból épül fel: ezek a [[komponensek|komponens]]. Egy komponens egy
JavaScript-[[függvény]], ami visszaadja, mi jelenjen meg a képernyőn. A függvény egy névvel ellátott kódrészlet, amit le
lehet futtatni; a `return` adja vissza az eredményét, itt azt, ami az oldalon megjelenik. Nyisd meg az `src/App.jsx`
fájlt:

```jsx file=src/App.jsx mark=2
function App() {
  return <h1>Hello, React!</h1>
}

export default App
```

A `return` utáni, HTML-nek látszó rész a [[JSX]]. Valójában JavaScript: a React ebből építi fel az oldalt. Az
`export default` azt jelenti, hogy ezt a függvényt más fájlok is betölthetik. Az `src/main.jsx` éppen ezt teszi: betölti
az `App`-ot, és kirajzolja az `index.html` üres `<div id="root">` dobozába.

A kiinduló projekt fájljaiban (`main.jsx`, `index.css`, `vite.config.js`) angol megjegyzéseket találsz. A megjegyzés a
kódban álló, embereknek szóló magyarázat (a `//` után vagy a `/*` és `*/` között), a gép nem foglalkozik vele. Azért
angolok, mert a magyar és az angol útmutató ugyanazt a kiinduló projektet használja. A saját kódodba nyugodtan írj magyar
szövegeket és megjegyzéseket.

:::try Próbáld ki
Írd át a szöveget egy saját köszönésre, és mentsd el a fájlt. A böngésző magától frissül: ez a Vite
[[gyors újratöltése|hot reload]].
:::

:::mistake Gyakori hiba
A komponens neve mindig **nagybetűvel** kezdődik (`App`, nem `app`). Kisbetűvel a React egy HTML-címkének hinné.
:::

### Kitérő: így írták régen

Régebbi kódokban [[osztálykomponensekkel|osztály]] (class component) is találkozhatsz. Ugyanazt csinálják, csak
hosszabban. Érdemes felismerni őket, de ebben a kurzusban **mindenhol függvénykomponenseket** írunk.

:::compare
```jsx label="Régen: osztály" file=Hello.jsx
import { Component } from 'react'

class Hello extends Component {
  render() {
    return <h1>Szia, {this.props.name}!</h1>
  }
}
```
```jsx label="Ma: függvény" now file=Hello.jsx
function Hello({ name }) {
  return <h1>Szia, {name}!</h1>
}
```
:::

Mindkét változat kívülről kap egy `name` értéket (ez egy prop, a következő lépésben bővebben), és a `{name}` írja be a
köszönésbe.

A 27. leckétől a komponenseket egy még rövidebb formában írjuk, [[nyílfüggvényként|nyílfüggvény]]:
`const Hello = ({ name }) => <h1>Szia, {name}!</h1>`. Addig a komponenseink a fenti, jól olvasható formában maradnak. A
kis segédfüggvényeket viszont, amilyet hamarosan a `map`-nek adunk, már most nyílfüggvényként írjuk: a
`(skill) => <li>{skill}</li>` azt jelenti: „kapsz egy készséget, adj vissza egy listaelemet”.

### Az első saját komponensed: a Hero

A Hero az oldal teteje: a neved, a szereped (vagyis hogy mivel foglalkozol) és egy rövid bemutatkozó mondat. Hozz létre
az `src` mappában egy `components` mappát, benne egy `Hero.jsx` fájlt.

Windowsos magyar billentyűzeten a `{` az ++AltGr++ + ++B++, a `}` az ++AltGr++ + ++N++, a `[` és a `]` az ++AltGr++ +
++F++ és az ++AltGr++ + ++G++, a `<` és a `>` az ++AltGr++ + ++Í++ és az ++AltGr++ + ++Y++.

```jsx file=src/components/Hero.jsx mark=1,4-6
function Hero({ name, role, bio }) {
  return (
    <section className="hero">
      <p className="hero__role">{role}</p>
      <h1>{name}</h1>
      <p>{bio}</p>
    </section>
  )
}

export default Hero
```

A `name`, a `role` és a `bio` a komponens bemenetei, más néven [[props]]: így kap adatot kívülről, ahogy egy HTML-címke
az attribútumait. A `function Hero({ name, role, bio })` kapcsos zárójelei kiveszik ezt a három propot abból a
csomagból, amit a React átad a komponensnek. A JSX-ben a kapcsos zárójel (`{name}`) egy JavaScript-értéket ír ki. Ha a
JSX többsoros, kerek zárójelbe tesszük. Most használd az `App`-ban:

```jsx file=src/App.jsx mark=1,4-10
import Hero from './components/Hero.jsx'

function App() {
  return (
    <Hero
      name="Példa Petra"
      role="Junior frontend-fejlesztő"
      bio="Reacttel építek barátságos weboldalakat."
    />
  )
}

export default App
```

Az `import Hero from './components/Hero.jsx'` betölti a komponenst a fájljából (ez az `export default` párja); a `./`
azt jelenti: „ennek a fájlnak a mappájából indulva”. JSX-ben minden címkét le kell zárni: amelyiknek nincs tartalma, az
`/>`-rel végződik, mint a `<Hero … />`.

:::check Ellenőrizd
Az oldalon megjelenik a „Példa Petra” név, fölötte kisebb betűvel a szerep, alatta a bemutatkozó mondat. Most írd át
mindhármat a sajátodra!
:::

:::mistake Gyakori hiba
JSX-ben `className`-et írunk, nem `class`-t, mert a `class` foglalt szó a JavaScriptben: ezzel a szóval kezdődnek az
előző lépésben látott osztályok.
:::

### Lista a készségeidről

A készségeidet egy [[tömbben|tömb]] tárolod: ez szögletes zárójelbe írt, vesszővel elválasztott értékek listája. A
`const` nevet ad neki; a csupa nagybetű (`SKILLS`) azt jelzi, hogy ez állandó adat, ami nem változik. A `map`
segítségével mindegyik készségből egy listaelem lesz, így ha új készséget tanulsz, csak a tömbhöz kell hozzáírnod. Hozz
létre a `components` mappában egy `Skills.jsx` fájlt:

```jsx file=src/components/Skills.jsx mark=6-8
const SKILLS = ['HTML', 'CSS', 'JavaScript', 'React']

function Skills() {
  return (
    <ul className="skills">
      {SKILLS.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  )
}

export default Skills
```

A `map` a tömb minden elemére meghívja a neki átadott függvényt, és a visszaadott értékekből új tömböt készít. A
`(skill) => ( … )` egy ilyen rövid [[nyílfüggvény]]: megkapja az aktuális készséget `skill` néven, és visszaadja a
zárójelben lévő `<li>` elemet. A `key` segít a Reactnek megkülönböztetni a listaelemeket, amikor a lista változik.
Mindig egyedi érték legyen: itt maga a készség neve.

Egy komponens csak **egy** dolgot adhat vissza. Ha a Hero alá a Skills is kell, csomagold őket egy közös elembe:

```jsx file=src/App.jsx mark=2,6,12-13
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'

function App() {
  return (
    <main>
      <Hero
        name="Példa Petra"
        role="Junior frontend-fejlesztő"
        bio="Reacttel építek barátságos weboldalakat."
      />
      <Skills />
    </main>
  )
}

export default App
```

:::try Feladat
Írj a tömbbe két saját készséget. Aztán adj címet a listának a `Skills`-ben: tedd a `<ul>` fölé, hogy
`<h2>Amit tudok</h2>`, és a kettőt csomagold egy `<section>`-be, mert egy komponens csak egy elemet adhat vissza.
:::

:::mistake Gyakori hiba
Ha kimarad a `key`, az oldal működik, de a React figyelmeztet a böngésző konzoljában. Próbáld ki: töröld egy pillanatra
a `key={skill}` részt, mentsd el, és nyisd meg a konzolt (++F12++, Macen ++Cmd++ + ++Option++ + ++I++ → **Console**,
magyar nyelvű Chrome-ban **Konzol**). Egy figyelmeztetést látsz arról, hogy a lista minden elemének egyedi „key” prop
kell. Aztán tedd vissza a `key`-t. Szokd meg, hogy időnként a konzolra is ránézel.
:::

### Stílus és reszponzív elrendezés

Minden komponens mellé tehetsz egy saját CSS-fájlt, amit a komponens betölt. A szabályok így is az egész oldalra
érvényesek, ezért az osztályok neve mondja meg, hová tartoznak: a `hero__role` a `hero` `role` része (a dupla aláhúzás
csak egy elterjedt elnevezési szokás). A [[Flexbox]] egymás mellé rendezi az elemeket, egy [[media query]] pedig
telefonon egymás alá teszi őket.

A Hero kap egy monogramos kört is a neved első betűjével, így a Flexboxnak lesz mit egymás mellé tennie: balra a kört,
jobbra a szöveget. Hozd létre a `components` mappában, a `Hero.jsx` mellett a `Hero.css` fájlt:

```css file=src/components/Hero.css
.hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 48px 0;
}

.hero__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* a kör ne nyomódjon össze */
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #017b6b;
  color: #fff;
  font-size: 56px;
  font-weight: 700;
}

.hero__role {
  margin: 0;
  color: #017b6b;
  font-weight: 700;
  text-transform: uppercase;
}

/* Telefonon (600 px alatt) egymás alá kerülnek. */
@media (max-width: 600px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
}
```

Aztán írd át a `Hero.jsx`-et. Az első sora betölti a CSS-fájlt (egy CSS-fájl csak akkor hat, ha a komponens betölti), a
`<section>` pedig két részre oszlik: a kör és egy `<div>`, benne a szöveggel.

```jsx file=src/components/Hero.jsx mark=1,6-7,11
import './Hero.css'

function Hero({ name, role, bio }) {
  return (
    <section className="hero">
      <div className="hero__avatar" aria-hidden="true">{name[0]}</div>
      <div>
        <p className="hero__role">{role}</p>
        <h1>{name}</h1>
        <p>{bio}</p>
      </div>
    </section>
  )
}

export default Hero
```

A `name[0]` a név első betűje: a szöveg betűi nullától számozódnak, és a szögletes zárójelben megadott sorszámú betűt
kapod vissza. Az `aria-hidden="true"` elrejti a kört a képernyőolvasók elől, a nevedet úgyis felolvassák. A
`border-radius: 50%` a négyzetből kört csinál, a kör belsejében pedig ugyanaz a Flexbox teszi középre a betűt (az
`align-items` függőlegesen, a `justify-content` vízszintesen).

Hozd létre a `Skills.jsx` mellé a `Skills.css` fájlt is. Ezzel a készségekből „címkék” lesznek egy sorban, amelyek
szükség esetén új sorba törnek:

```css file=src/components/Skills.css
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.skills li {
  padding: 6px 12px;
  border-radius: 999px;
  background: #e8f8f4;
}
```

Ezt is a komponens tölti be: a `Skills.jsx` első sora legyen az `import './Skills.css'`, ahogy a Hero-nál.

:::check Ellenőrizd
Széles ablakban a monogramos kör a szöveg mellett, balra áll, a szerep továbbra is a neved fölött. A készségek
kerekített címkék egy sorban. Most nyisd meg a fejlesztői eszközöket (++F12++, Macen ++Cmd++ + ++Option++ + ++I++),
kapcsold be a telefonos nézetet (++Ctrl++ + ++Shift++ + ++M++, Macen ++Cmd++ + ++Shift++ + ++M++), és fent válassz egy
telefont (például iPhone 12 Pro): a kör a szöveg fölé kerül, és a Hero tartalma középre igazodik.
:::

### Elérhetőségek

Az oldal alján mutasd meg, hogyan érhetnek el: egy e-mail-címet és a profiljaidat. A `mailto:` kezdetű link a látogató
levelezőprogramját nyitja meg. Hozz létre a `components` mappában egy `Contact.jsx` fájlt:

```jsx file=src/components/Contact.jsx
const LINKS = [
  { label: 'GitHub-profilom', href: 'https://github.com/' },
  { label: 'LinkedIn-profilom', href: 'https://www.linkedin.com/' },
]

function Contact({ email }) {
  return (
    <footer className="contact">
      <h2>Elérhetőség</h2>
      <p>
        Írj nekem: <a href={`mailto:${email}`}>{email}</a>
      </p>
      <ul>
        {LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

export default Contact
```

A `LINKS` tömb elemei [[objektumok|objektum]]: kapcsos zárójelben felsorolt név–érték párok
(`label: 'GitHub-profilom'`). Egy objektum egy értékét ponttal éred el: `link.label`, `link.href`. A két címet cseréld a
saját profiljaidra.

A `target="_blank"` új lapon nyitja meg a linket, a `rel="noreferrer"` pedig nem árulja el a megnyitott oldalnak, honnan
érkezett a látogató. A `mailto:` és az e-mail-cím egy [[template literal]] segítségével áll össze: a fordított
aposztrófok közötti szövegben a `${email}` helyére a változó értéke kerül. Windowsos magyar billentyűzeten a fordított
aposztróf az ++AltGr++ + ++7++, a `$` az ++AltGr++ + ++É++.

:::mistake Gyakori hiba
A link szövege legyen beszédes: „GitHub-profilom”, nem „ide kattints”. A képernyőolvasók a linkeket gyakran külön
listában sorolják fel, és ilyenkor csak a link szövegét olvassák fel.
:::

Most tedd az `App` aljára, a Skills alá. Mint minden más fájlban lévő komponenst, ezt is be kell előbb importálni:

```jsx file=src/App.jsx mark=3,14
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'
import Contact from './components/Contact.jsx'

function App() {
  return (
    <main>
      <Hero
        name="Példa Petra"
        role="Junior frontend-fejlesztő"
        bio="Reacttel építek barátságos weboldalakat."
      />
      <Skills />
      <Contact email="petra@example.com" />
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Az e-mail-cím kattintható, a profilok új lapon nyílnak. Ezzel kész a kezdő szint: commitold a második terminálban
(`git add .`, majd `git commit -m "Kezdő szint kész"`)!
:::

## Középszint {level=2}

### Projektkártyák

A projektjeid kártyákon jelennek meg. Egyetlen kártyakomponenst írsz, amelyet a [[props]] segítségével bármelyik
projekthez felhasználhatsz, az adatok pedig egy tömbben vannak, mint a készségeid. Hozd létre a `components` mappában a
`ProjectCard.jsx` fájlt:

```jsx file=src/components/ProjectCard.jsx
function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <ul className="project-card__tags">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <a href={`#/projects/${project.slug}`}>{project.title}: részletek</a>
    </article>
  )
}

export default ProjectCard
```

A link szövegében a projekt címe is benne van, így a képernyőolvasók listájában is megkülönböztethetők a linkek.

Az adatok külön fájlba kerülnek, közvetlenül az `src` mappába (nem a `components`-be): `src/data.js`.

```jsx file=src/data.js
export const PROJECTS = [
  {
    slug: 'idojaras',
    title: 'Időjárás-app',
    summary: 'Ötnapos előrejelzés, keresővel.',
    tags: ['React', 'API'],
    details: 'Az első API-s projektem: megtanultam, hogyan kérek le adatot, és mit mutatok, amíg betöltődik.',
  },
  {
    slug: 'teendok',
    title: 'Teendőlista',
    summary: 'Feladatok, amik a böngészőben maradnak.',
    tags: ['React', 'localStorage'],
    details: 'Itt tanultam meg az állapot kezelését és a mentést a böngésző tárolójába.',
  },
]
```

Minden projekt egy [[objektum]]. A [[slug]] a projekt rövid, címbe illő azonosítója, ékezet és szóköz nélkül: ez kerül
majd a projekt oldalának címébe (`#/projects/idojaras`). Itt `export default` helyett `export const` áll: ez egy
[[nevesített export]], így egy fájlból több dolgot is kiadhatsz. Betölteni a nevével, kapcsos zárójelben kell:
`import { PROJECTS } from '../data.js'`. A `../` azt jelenti, hogy a `components` mappából egy szinttel feljebb, az
`src`-be lépünk.

A kártyák egy [[CSS Grid]]-ben sorakoznak: annyi oszlop, amennyi kifér, mindegyik legalább 240 px széles. A
`padding: 0` és a `list-style: none` eltünteti a lista pöttyeit és behúzását, mint a `Skills.css`-ben, a kártyák pedig
fehér hátteret, vékony keretet és lekerekített sarkokat kapnak. A `height: 100%` miatt egy sorban minden kártya
egyforma magas. Hozd létre a `Projects.css` fájlt:

```css file=src/components/Projects.css
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 0;
  list-style: none;
}

.project-card {
  box-sizing: border-box; /* a padding és a keret is belefér a 100%-ba */
  height: 100%;
  padding: 16px;
  border: 1px solid #dde3ea;
  border-radius: 12px;
  background: #fff;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  list-style: none;
  font-size: 14px;
}

.project-card__tags li {
  padding: 2px 10px;
  border-radius: 999px;
  background: #e8f8f4;
}
```

:::try Feladat
Írd meg az `src/components/Projects.jsx` fájlba a `Projects` komponenst. Egy `<section>`-t adjon vissza, benne egy
`<h2>Projektjeim</h2>` címmel és egy `<ul className="projects">` listával, amelyben a `PROJECTS` minden eleméhez
tartozik egy `<li key={project.slug}>`, benne egy `<ProjectCard project={project} />`-dal. Kell hozzá
`import { PROJECTS } from '../data.js'`, `import ProjectCard from './ProjectCard.jsx'` és `import './Projects.css'`.
Tedd be az `App`-ba (`import Projects from './components/Projects.jsx'`) a Skills és a Contact közé.
:::

:::check Ellenőrizd
Két kártya jelenik meg egymás mellett (telefonon egymás alatt), keretben, pöttyök nélkül. A „részletek” link egyelőre
csak a böngésző címsorában változtatja meg a cím végét (`#/projects/idojaras`): a következő lépésben ebből lesz külön
oldal.
:::

### Külön oldalak (routing)

Minden projektnek saját oldala lesz. Ehhez az oldalnak **emlékeznie** kell, melyik címen jársz, és újrarajzolnia magát,
ha a cím változik. Itt találkozol először a [[hookokkal|hook]]: ezek `use`-zal kezdődő függvények, amelyekkel egy
komponens extra képességeket kap a Reacttől. A két legfontosabb:

- A [[useState]] a komponens memóriája: egy érték, és egy függvény, amivel megváltoztathatod. Ha megváltozik, a React
  újrarajzolja a komponenst.
- A [[useEffect]] olyan munkára való, ami a rajzoláson kívül történik, például egy böngészőesemény figyelése.

A cím `#` utáni részét (a „hasht”) figyeljük, mert ha ez változik, a böngésző nem tölt be új oldalt. Saját hookot írunk
rá, egy új `src/useHashRoute.js` fájlba (közvetlenül az `src` mappába, nem a `components`-be):

```jsx file=src/useHashRoute.js
import { useEffect, useState } from 'react'

const currentPath = () => window.location.hash.slice(1) || '/'

// Visszaadja a cím # utáni részét, és frissül, ha az megváltozik.
function useHashRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    // Takarítás: ha a komponens eltűnik, ne figyeljünk tovább.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export default useHashRoute
```

A `useState` két dolgot ad vissza, ezeket a `const [path, setPath]` nevezi el: az aktuális értéket és a függvényt, amely
megváltoztatja. A `useState(currentPath)` magát a függvényt kapja meg, zárójel nélkül: a React az első rajzoláskor
meghívja, és az eredménye lesz a kezdőérték. A `slice(1)` levágja a `#` jelet, a `|| '/'` pedig azt jelenti: „vagy `/`,
ha nem maradt semmi”. A `hashchange` esemény akkor történik, amikor a cím `#` utáni része megváltozik. A `useEffect`
végén álló üres `[]` azt jelenti: ezt csak egyszer futtasd, amikor a komponens először megjelenik. A visszaadott
függvény a takarítás: a React akkor hívja meg, amikor a komponens eltűnik.

:::try Feladat
Hozd létre az `src/components/ProjectPage.jsx` fájlt, és írd meg benne a `ProjectPage` komponenst. A `project` propot
kapja meg, és jelenítse meg a projekt címét egy `<h1>`-ben, a `details` szövegét, valamint egy „← Vissza” linket, amely
a `#/` címre mutat.
:::

Az `App` a címtől függően a kezdőoldalt vagy egy projekt oldalát rajzolja ki:

```jsx file=src/App.jsx mark=5-7,10-13
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Contact from './components/Contact.jsx'
import ProjectPage from './components/ProjectPage.jsx'
import useHashRoute from './useHashRoute.js'
import { PROJECTS } from './data.js'

function App() {
  const path = useHashRoute()
  const slug = path.startsWith('/projects/') ? path.slice('/projects/'.length) : null
  const project = PROJECTS.find((p) => p.slug === slug)
  if (project) return <ProjectPage project={project} />

  return (
    <main>
      <Hero
        name="Példa Petra"
        role="Junior frontend-fejlesztő"
        bio="Reacttel építek barátságos weboldalakat."
      />
      <Skills />
      <Projects />
      <Contact email="petra@example.com" />
    </main>
  )
}

export default App
```

Csak a kiemelt sorok újak, a többi már megvan a fájlodban (a `Projects` az előző feladatból). A
`feltétel ? a : b` egy rövid ha–különben: ha a cím `/projects/`-szal kezdődik, a `slug` a cím maradéka, különben `null`
(semmi). A `find` sorra odaadja a projekteket a `(p) => p.slug === slug` nyílfüggvénynek, és az elsőt adja vissza,
amelynél a `slug` megegyezik (`===`); ha egyik sem egyezik, semmit. Ha van ilyen projekt, az `App` azonnal visszaadja az
oldalát, és a kezdőoldal nem rajzolódik ki.

:::check Ellenőrizd
Kattints az Időjárás-app kártyáján a „részletek” linkre: a cím végén megjelenik a `#/projects/idojaras`, és a projekt
saját oldala látszik. A „← Vissza” link visszavisz a kezdőoldalra, és a böngésző Vissza gombja is működik.
:::

:::mistake Gyakori hiba
A hook neve mindig `use`-zal kezdődik, és csak komponensben vagy másik hookban hívható, a legfelső szinten (nem `if`-en
vagy cikluson belül). Így minden rajzoláskor ugyanabban a sorrendben futnak, és a React ebből a sorrendből tudja, melyik
állapot melyik `useState`-hívásé.
:::

### Kapcsolati űrlap

Az űrlap mezői [[vezérelt mezők|vezérelt mező]]: az értéküket egy `useState` tárolja, és minden gépelés frissíti. Így a
React mindig tudja, mi van a mezőkben, és küldés előtt ellenőrizni tudod őket. Hozd létre a `components` mappában a
`ContactForm.jsx` fájlt:

```jsx file=src/components/ContactForm.jsx
import { useState } from 'react'
import './ContactForm.css'

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // Egy függvény mindhárom mezőhöz: a mező neve (name) mondja meg, mit frissít.
  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function submit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (!form.name || !form.email.includes('@') || !form.message) {
      setError('Töltsd ki mindhárom mezőt, és adj meg érvényes e-mail-címet.')
      return
    }
    setError('')
    setSent(true)
  }

  if (sent) return <p>Köszönöm, {form.name}! Hamarosan válaszolok.</p>

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <label>
        Név
        <input name="name" value={form.name} onChange={update} />
      </label>
      <label>
        E-mail
        <input name="email" type="email" value={form.email} onChange={update} />
      </label>
      <label>
        Üzenet
        <textarea name="message" value={form.message} onChange={update} />
      </label>
      {error && <p className="contact-form__error" role="alert">{error}</p>}
      <button type="submit">Küldés</button>
    </form>
  )
}

export default ContactForm
```

Az `onChange={update}` azt kéri a Reacttől, hogy a mező minden változásakor hívja meg az `update` függvényt, az
`onSubmit={submit}` pedig azt, hogy küldéskor a `submit` fusson le. Mindkettő megkap egy [[eseményt|esemény]] (`event`):
az `event.target` maga a mező, amelybe gépeltek, az `event.target.value` pedig a szövege. A `[event.target.name]`
szögletes zárójele azt jelenti, hogy a kulcs neve a mező `name` attribútumából jön: a Név mezőnél `name`, az E-mail
mezőnél `email`. Az ellenőrzésben a `!` jelentése „nem”, a `||` jelentése „vagy”. Az `{error && <p …>}` csak akkor
rajzolja ki a hibaüzenetet, ha az `error` nem üres. A `role="alert"` miatt a képernyőolvasó felolvassa a hibát, a
`noValidate` pedig kikapcsolja a böngésző saját felugró ellenőrzését, hogy a miénk látszódjon.

A `...form` a [[spread]] operátor: a régi objektum összes mezőjét átmásolja egy újba, a vessző utáni rész pedig
felülírja azt az egyet, amelyik megváltozott. Az állapotot sosem módosítjuk közvetlenül, mindig új értéket adunk a
`setForm`-nak.

A `ContactForm.jsx` mellé kell a `ContactForm.css` is:

```css file=src/components/ContactForm.css
.contact-form {
  display: grid;
  gap: 12px;
  max-width: 420px;
}

.contact-form label {
  display: grid;
  gap: 4px;
}

.contact-form button {
  justify-self: start;
}

.contact-form__error {
  margin: 0;
  color: #b3261e;
}
```

A címkék és a mezők így egymás alá kerülnek, a gomb pedig megtartja a saját szélességét.

Tedd be az űrlapot az elérhetőségek közé: a `Contact.jsx` elejére írd be, hogy
`import ContactForm from './ContactForm.jsx'`, és a `<ContactForm />` sort tedd közvetlenül az e-mail-címes bekezdés
után.

:::concept Hová megy az üzenet?
Most sehová: a „Köszönöm” üzenet azt mutatja meg, hogyan reagál az oldal. Valódi küldéshez szerver kell; a későbbi,
API-s leckékben megnézzük, hogyan beszél egy React-oldal egy szerverrel. A Megoldás fül már egy lépéssel tovább megy:
az üzenetet egy kitalált, a böngészőben futó szervernek „küldi el”, ezért látsz „Küldés…” állapotot és néha szándékos
hibát. A te változatodnak erre még nincs szüksége.
:::

:::check Ellenőrizd
Ha üresen hagyott mezőkkel megnyomod a **Küldés** gombot, hibaüzenet jelenik meg; ha mindent kitöltesz, megjelenik a
köszönet. Ezzel kész a középszint: commitold!
:::

## Haladó szint {level=3}

### Finom animációk

Egy kis mozgástól élőbb lesz az oldal, amíg nem zavaró. A kártyák például finoman megemelkedhetnek, amikor föléjük
viszed az egeret. Írd ezeket a szabályokat a `Projects.css` végére (a korábbi szabályok maradjanak meg):

```css file=src/components/Projects.css
.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgb(0 0 0 / 0.12);
}

/* Aki a gépén kikapcsolta a mozgást, annak nálunk se mozogjon semmi. */
@media (prefers-reduced-motion: reduce) {
  .project-card {
    transition: none;
  }

  .project-card:hover {
    transform: none;
  }
}
```

:::check Ellenőrizd
Vidd az egeret egy kártya fölé: finoman megemelkedik, és árnyékot kap. A fejlesztői eszközökben (**⋮** →
**More tools** → **Rendering**) állítsd az „Emulate CSS media feature prefers-reduced-motion” értékét `reduce`-ra: így
a kártya a helyén marad, csak az árnyék jelenik meg.
:::

:::concept Miért fontos a prefers-reduced-motion?
Egyeseket megszédít a mozgó felület, másoknak elvonja a figyelmét. Ők az operációs rendszerükben kikapcsolhatják az
animációkat, a böngésző pedig ezt a [[media query]] segítségével jelzi az oldalnak.
:::

### Lighthouse 90+

A Chrome beépített [[Lighthouse]] eszköze négy szempontból pontozza az oldalt: teljesítmény (Performance),
akadálymentesség (Accessibility), bevált gyakorlatok (Best Practices) és keresőoptimalizálás ([[SEO]]: mennyire tudják a
keresők olvasni az oldalt). A mérést a végleges változaton futtasd, ne a fejlesztői szerveren: állítsd le a futó
`npm run dev`-et (++Ctrl++ + ++C++), majd:

```shell
npm run build
npm run preview
```

Az `npm run build` elkészíti a végleges változatot a `dist` mappába, az `npm run preview` pedig elindítja ennek az
előnézetét. Nyisd meg a kiírt címet, aztán ++F12++ → **Lighthouse** → **Analyze page load**. A leggyakoribb javítások:

- ha teszel képet az oldalra, legyen `alt` szövege, és ne legyen nagyobb, mint amekkorának látszik;
- az `index.html` mondja meg az oldal nyelvét: a `<html lang="en">` helyett `<html lang="hu">` álljon; a `<head>`
  részébe, a `<title>` alá pedig kerüljön egy rövid leírás, például
  `<meta name="description" content="Példa Petra, junior frontend-fejlesztő: készségek, projektek, elérhetőség." />`.
  Ha már ott vagy, a `<title>`-t is írd át a nevedre;
- a címek sorrendben kövessék egymást (`h1`, aztán `h2`, …);
- a szöveg és a háttér között legyen elég kontraszt.

:::check Ellenőrizd
Mind a négy kategóriában legalább 90 pontot kapsz.
:::

### Feltöltés a GitHub Pages-re

Végül az oldal ingyen kikerül az internetre, a GitHub Pages-re. Ott nem a cím gyökerében, hanem egy almappában fut
(`/<repó-neve>/`), ezért a `vite.config.js`-be írd be a `base: './'` sort: így a lefordított oldal minden fájlját az
`index.html`-hez képest keresi, bárhol legyen is.

```js file=vite.config.js mark=6
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is the development server and the build tool; the React plugin teaches it JSX.
export default defineConfig({
  base: './',
  plugins: [react()],
})
```

Kell hozzá egy ingyenes GitHub-fiók ([github.com](https://github.com)). Bejelentkezés után hozz létre egy új,
**nyilvános** (Public), **üres** repót, például `me-myself-and-react` néven, mint a mappád (README nélkül, különben a
GitHub visszautasítja az első feltöltést; ingyenes fiókkal a GitHub Pages csak nyilvános repóval működik). Ez a saját
repód: ide kerül a másolatod, nem a `rika-mentoring` repóba, az változatlan marad. Az üres repó oldalán a GitHub mutat
egy „…or push an existing repository from the command line” részt: az ott álló parancsokat másold be a második
terminálba (abba, amelyik a `me-myself-and-react` mappában van). A `git remote add origin` és utána a repód címe
összeköti a projektedet ezzel a repóval, a `git branch -M main` gondoskodik róla, hogy az ág neve `main` legyen (a
`git init -b main` óta már az), a `git push -u origin main` pedig feltölti oda a commitjaidat (a `-u` miatt a Git
megjegyzi ezt a célt, így később elég egy sima `git push`).

Az első push bejelentkezést kér. Windowson ehhez megnyílik egy böngészőablak. Macen a terminál felhasználónevet és
jelszót kér: a fiókod jelszavát a GitHub itt nem fogadja el, helyette egy tokent illessz be (**Settings** →
**Developer settings** → **Personal access tokens** → **Tokens (classic)**, a repo és a workflow jogosultsággal).

A repó beállításaiban válaszd ezt: **Settings** → **Pages** → **Source**: **GitHub Actions**. A GitHub Actions a
GitHub saját gépein futtat le egy [[workflow]]-t, vagyis egy lépéssorozatot: itt letölti a csomagokat, elkészíti a
buildet, és kiteszi az oldalt. A lépéseket egy fájl írja le, amely a projekt gyökerében (ahol a `package.json` is van)
egy `.github` mappán belül, a `workflows` mappában van. A mappanév elején álló pont szándékos. VS Code-ban az új fájl
nevéhez beírhatod egyben is, hogy `.github/workflows/deploy.yml`, és a mappák maguktól létrejönnek.

```yaml file=.github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

Végül commitold és töltsd fel a változásokat a második terminálban: `git add .`, `git commit -m "Közzététel"`, majd
`git push`.

:::check Ellenőrizd
A repó **Actions** fülén lefut a „Deploy”, és pár perc múlva az oldalad elérhető a
`https://<felhasználóneved>.github.io/<repó-neve>/` címen. Gratulálok, a saját oldalad már kint van az interneten!
:::
