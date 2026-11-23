# Mit építünk?

Egy bemutatkozó oldalt, ami rólad szól: ki vagy, mit tudsz, min dolgoztál, és hogyan érnek el. A lecke három szintje
egymásra épül. Az első végén már kész, működő oldalad lesz, a másik kettő ezt bővíti.

:::levels
- Egyoldalas bemutatkozás: név, rövid leírás, készségek, elérhetőség. | kb. 2 óra
- Projektkártyák, külön oldal minden projektnek, működő kapcsolati űrlap. | kb. 3 óra
- Finom animációk, Lighthouse 90+ pont, és az oldal élesben, saját címen. | kb. 3 óra
:::

**Előismeret:** semmi, ez az első lecke. Egy kis HTML jól jön, de nem feltétel: mindent elmagyarázunk, amire szükség van.

## Kezdő szint {level=1}

### Mielőtt elkezded

Két programra lesz szükséged, mindkettő ingyenes:

- **Node.js** (az LTS-verzió, [nodejs.org](https://nodejs.org)): ez futtatja a fejlesztői szervert a gépeden.
- Egy **kódszerkesztő**, például a [VS Code](https://code.visualstudio.com).

Töltsd le a lecke **alapját** (fent: „Alap letöltése”), csomagold ki, és nyisd meg a `me-myself-and-react` mappát a
szerkesztőben. Aztán nyiss egy terminált (VS Code-ban: ++Terminal++ → ++New Terminal++), és írd be ezt a két parancsot:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
A terminál kiír egy címet, általában `http://localhost:5173`. Nyisd meg a böngészőben: egy „Hello, React!” feliratot
látsz. A szervert a terminálban a ++Ctrl++ + ++C++ állítja le.
:::

:::concept Az alap egy git-repó
A letöltött mappában már van egy első commit, a kezdőállapot. A `git log` megmutatja, és ha valami nagyon elromlik, a
`git restore .` minden fájlt visszaállít. Ha megvan egy lépés, érdemes commitolni: `git add .`, majd
`git commit -m "Hero kész"`.
:::

### Mi az a React-komponens?

Egy React-oldal kis, újra felhasználható darabokból épül fel: ezek a [[komponensek|komponens]]. Egy komponens egy
JavaScript-[[függvény]], ami visszaadja, mi jelenjen meg a képernyőn. Nyisd meg az `src/App.jsx` fájlt:

```jsx file=src/App.jsx mark=2
function App() {
  return <h1>Hello, React!</h1>
}

export default App
```

A `return` utáni, HTML-nek látszó rész a [[JSX]]. Valójában JavaScript: a React ebből építi fel az oldalt. Az
`export default` azt jelenti, hogy ezt a függvényt más fájlok is betölthetik. Az `src/main.jsx` éppen ezt teszi: betölti
az `App`-ot, és kirajzolja az `index.html` üres `<div id="root">` dobozába.

:::try Próbáld ki
Írd át a szöveget egy saját köszönésre, és mentsd el a fájlt. A böngésző magától frissül: ez a Vite
[[gyors újratöltése|hot reload]].
:::

:::mistake Gyakori hiba
A komponens neve mindig **nagybetűvel** kezdődik (`App`, nem `app`). Kisbetűvel a React egy HTML-címkének hinné.
:::

### Kitérő: így írták régen

Régebbi kódokban [[osztály]] (class) komponensekkel is találkozhatsz. Ugyanazt csinálják, csak hosszabban. Érdemes
felismerni őket, de ebben a kurzusban **mindenhol függvény-komponenseket** írunk.

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

A 27. leckétől egy még rövidebb formát használunk, a [[nyílfüggvényt|nyílfüggvény]]:
`const Hello = ({ name }) => <h1>Szia, {name}!</h1>`. Addig maradunk a fenti, jól olvasható változatnál.

### Az első saját komponensed: a Hero

A Hero az oldal teteje: a neved és egy mondat arról, mivel foglalkozol. Hozz létre az `src` mappában egy
`components` mappát, benne egy `Hero.jsx` fájlt:

```jsx file=src/components/Hero.jsx mark=1,4,5
function Hero({ name, role }) {
  return (
    <section className="hero">
      <p className="hero__role">{role}</p>
      <h1>{name}</h1>
    </section>
  )
}

export default Hero
```

A `name` és a `role` a komponens [[props]]-ai: így kap adatot kívülről, ahogy egy HTML-címke az attribútumait. A kapcsos
zárójel (`{name}`) egy JavaScript-értéket ír ki a JSX-be. Ha a JSX több soros, kerek zárójelbe tesszük. Most használd
az `App`-ban:

```jsx file=src/App.jsx mark=1,4
import Hero from './components/Hero.jsx'

function App() {
  return <Hero name="Példa Petra" role="Junior frontend-fejlesztő" />
}

export default App
```

:::check Ellenőrizd
Az oldalon megjelenik a neved, fölötte kisebb betűvel a szereped. Írd át a saját nevedre!
:::

:::mistake Gyakori hiba
JSX-ben `className`-et írunk, nem `class`-t, mert a `class` foglalt szó a JavaScriptben (pont az előző lépés osztályai
miatt).
:::

### Lista a készségeidről

A készségeidet egy [[tömbben|tömb]] tárolod, és a `map` segítségével mindegyikből egy listaelem lesz. Így ha új
készséget tanulsz, csak a tömbhöz kell hozzáírnod.

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

A `key` segít a Reactnek megkülönböztetni a listaelemeket, amikor a lista változik. Mindig egyedi érték legyen: itt
maga a készség neve.

Egy komponens csak **egy** dolgot adhat vissza. Ha a Hero alá a Skills is kell, csomagold őket egy közös elembe:

```jsx file=src/App.jsx mark=2,6-9
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'

function App() {
  return (
    <main>
      <Hero name="Példa Petra" role="Junior frontend-fejlesztő" />
      <Skills />
    </main>
  )
}

export default App
```

:::try Feladat
Egészítsd ki a listát két saját készségeddel, és tegyél a lista fölé egy `<h2>Amit tudok</h2>` címet.
:::

:::mistake Gyakori hiba
Ha kimarad a `key`, az oldal működik, de a böngésző konzolja figyelmeztet. Nyisd meg (++F12++ → Console), és nézd meg,
hogyan néz ki egy ilyen üzenet. Érdemes megszokni, hogy a konzolra is ránézel.
:::

### Stílus és reszponzív elrendezés

Minden komponens mellé tehetsz egy saját CSS-fájlt, amit a komponens betölt. A [[Flexbox]] egymás mellé rendezi az
elemeket, egy [[media query]] pedig telefonon egymás alá teszi őket.

```css file=src/components/Hero.css
.hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 48px 0;
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

```jsx file=src/components/Hero.jsx mark=1
import './Hero.css'

function Hero({ name, role }) {
```

A készségekből így lesznek „címkék” egy sorban, amik szükség szerint új sorba törnek:

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

A CSS-fájl csak akkor hat, ha a komponens betölti: írd a `Skills.jsx` legelejére, hogy `import './Skills.css'`, ahogy
a Hero-nál is.

:::check Ellenőrizd
Nyisd meg a fejlesztői eszközöket (++F12++), és kapcsold be a telefonos nézetet (++Ctrl++ + ++Shift++ + ++M++). Keskeny
képernyőn a Hero tartalma középre, egymás alá kerül.
:::

### Elérhetőségek

Az oldal alján legyen ott, hogyan érnek el: egy e-mail-cím és a profiljaid. Az e-mail-linket a `mailto:` kezdetű cím
nyitja meg a levelezőprogramban.

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

A `target="_blank"` új lapon nyitja meg a linket, a `rel="noreferrer"` pedig nem árulja el a megnyitott oldalnak, honnan
érkezett a látogató. A `mailto:` és az e-mail-cím egy [[template literal]] segítségével áll össze: a fordított
aposztrófok közötti szövegben a `${email}` helyére a változó értéke kerül.

:::mistake Gyakori hiba
A link szövege legyen beszédes: „GitHub-profilom”, nem „ide kattints”. Egy képernyőolvasó a linkeket gyakran külön
felsorolja, és ott csak a szöveg hallatszik.
:::

:::check Ellenőrizd
Tedd be a `<Contact email="petra@example.com" />` sort az `App`-ba a Skills alá. Az e-mail-cím kattintható, a profilok
új lapon nyílnak. Ezzel kész a kezdő szint: commitold!
:::

## Közép szint {level=2}

### Projektkártyák

A projektjeid kártyákon jelennek meg. Egy kártya-komponenst írsz, amit [[props]]-szal bármelyik projektre használhatsz,
az adatok pedig egy tömbben vannak, mint a készségeid.

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
      <a href={`#/projects/${project.slug}`}>Részletek</a>
    </article>
  )
}

export default ProjectCard
```

```jsx file=src/data.js
export const PROJECTS = [
  {
    slug: 'idojaras',
    title: 'Időjárás-app',
    summary: 'Ötnapos előrejelzés, keresővel.',
    tags: ['React', 'API'],
    details: 'Az első API-s projektem: megtanultam, hogyan kell adatot lekérni és betöltés közben várakozni.',
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

A kártyák egy [[CSS Grid]]-ben sorakoznak: annyi oszlop, amennyi kifér, mindegyik legalább 240 px széles.

```css file=src/components/Projects.css
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
```

:::try Feladat
Írd meg a `Projects` komponenst, ami a `PROJECTS` tömbből `ProjectCard`-okat rajzol egy `.projects` listába, és tedd be
az `App`-ba. Kell hozzá `import { PROJECTS } from '../data.js'`, `import ProjectCard from './ProjectCard.jsx'` és
`import './Projects.css'`.
:::

### Külön oldalak (routing)

Minden projektnek saját oldala lesz. Ehhez az oldalnak **emlékeznie** kell, melyik címen jársz, és újrarajzolnia magát,
ha a cím változik. Itt jön elő először a React két alapvető [[hook]]-ja.

- A [[useState]] a komponens memóriája: egy érték, és egy függvény, amivel megváltoztathatod. Ha megváltozik, a React
  újrarajzolja a komponenst.
- A [[useEffect]] olyan munkára való, ami a rajzoláson kívül történik, például egy böngészőesemény figyelése.

A cím `#` utáni részét (a „hasht”) figyeljük, mert az nem tölt be új oldalt. Saját hookot írunk rá:

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

Az `App` a címtől függően a kezdőoldalt vagy egy projekt oldalát rajzolja ki:

```jsx file=src/App.jsx mark=7-9,12
import useHashRoute from './useHashRoute.js'
import { PROJECTS } from './data.js'
// … a többi import

function App() {
  const path = useHashRoute()
  const slug = path.startsWith('/projects/') ? path.slice('/projects/'.length) : null
  const project = PROJECTS.find((p) => p.slug === slug)
  if (project) return <ProjectPage project={project} />

  return (
    <main>{/* Hero, Skills, Projects, Contact */}</main>
  )
}
```

:::try Feladat
Írd meg a `ProjectPage` komponenst: a projekt címe, a `details` szövege, és egy „← Vissza” link a `#/` címre.
:::

:::mistake Gyakori hiba
A hook neve mindig `use`-zal kezdődik, és csak komponensben vagy másik hookban hívható, a legfelső szinten (nem `if`-en
vagy cikluson belül). A React ebből tudja, melyik állapot melyik hívásé.
:::

### Kapcsolati űrlap

Az űrlap mezői [[vezérelt mezők|vezérelt mező]]: az értéküket egy `useState` tárolja, és minden gépelés frissíti. Így a
React mindig tudja, mi van a mezőkben, és küldés előtt ellenőrizni tudod őket.

```jsx file=src/components/ContactForm.jsx
import { useState } from 'react'

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // Egy függvény mindhárom mezőhöz: a mező neve (name) mondja meg, mit frissít.
  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function submit(event) {
    event.preventDefault() // ne töltse újra az oldalt
    if (!form.name || !form.email.includes('@') || !form.message) {
      setError('Töltsd ki mindhárom mezőt, és adj meg egy valódi e-mail-címet.')
      return
    }
    setError('')
    setSent(true)
  }

  if (sent) return <p>Köszönöm, {form.name}! Hamarosan válaszolok.</p>

  return (
    <form onSubmit={submit} noValidate>
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
      {error && <p role="alert">{error}</p>}
      <button type="submit">Küldés</button>
    </form>
  )
}

export default ContactForm
```

A `{ ...form, … }` a [[spread]] operátor: lemásolja a régi objektumot, és felülírja benne az egy megváltozott mezőt. Az
állapotot sosem módosítjuk közvetlenül, mindig új értéket adunk a `setForm`-nak.

:::concept Hová megy az üzenet?
Most sehová: a „Köszönöm” üzenet azt mutatja meg, hogyan reagál az oldal. Valódi küldéshez szerver kell; a későbbi,
API-s leckékben megnézzük, hogyan beszél egy React-oldal egy szerverrel.
:::

:::check Ellenőrizd
Üres mezőkkel a Küldés hibaüzenetet ad, kitöltve pedig megjelenik a köszönet. Ezzel kész a közép szint: commitold!
:::

## Haladó szint {level=3}

### Finom animációk

Egy kis mozgás élőbbé teszi az oldalt, ha nem zavar. A kártyák például finoman megemelkedhetnek, amikor föléjük viszed
az egeret:

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
}
```

:::concept Miért fontos a prefers-reduced-motion?
Van, akit a mozgó felület szédít vagy elvonja a figyelmét. Az operációs rendszerben ezt ki lehet kapcsolni, és a
böngésző ezt a [[media query]] segítségével megmondja az oldalnak.
:::

### Lighthouse 90+

A Chrome beépített [[Lighthouse]] eszköze pontozza az oldalt: teljesítmény, akadálymentesség, jó gyakorlatok, keresők.
Futtasd le a kész buildeden:

```shell
npm run build      # elkészíti a végleges változatot a dist mappába
npm run preview    # elindítja a dist mappa előnézetét
```

Nyisd meg a kiírt címet, aztán ++F12++ → Lighthouse → „Analyze page load”. A leggyakoribb javítások:

- minden képnek legyen `alt` szövege, és ne legyen nagyobb, mint ahogy megjelenik;
- a `index.html` `<html lang="hu">` és egy `<meta name="description">` sort kapjon;
- a címek sorrendben kövessék egymást (`h1`, aztán `h2`, …);
- a szöveg és a háttér között legyen elég kontraszt.

:::check Ellenőrizd
Mind a négy kategória legalább 90 pont.
:::

### Feltöltés a GitHub Pages-re

Végül az oldal kikerül az internetre, ingyen, a GitHub Pages-re. Ehhez először a Vite-nak meg kell mondani, hogy az oldal
egy alkönyvtárban fog futni:

```js file=vite.config.js mark=5
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
})
```

Hozz létre egy repót a GitHubon, és töltsd fel a projektet (`git remote add origin …`, majd `git push -u origin main`).
A repó beállításaiban: Settings → Pages → Source: **GitHub Actions**. Aztán add hozzá ezt a fájlt:

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

:::check Ellenőrizd
Commit és push után a repó Actions fülén lefut a „Deploy”, és pár perc múlva az oldalad elérhető a
`https://<felhasználóneved>.github.io/<repó-neve>/` címen. Gratulálok, kész az első saját oldalad!
:::
