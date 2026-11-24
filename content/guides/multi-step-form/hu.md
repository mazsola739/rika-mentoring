# Mit építünk?

Egy regisztrációs űrlapot egy kitalált klubhoz, a Code Clubhoz, rövid lépésekre bontva: először a fiók (e-mail-cím és
jelszó), aztán pár szó rólad, utána az érdeklődési köröd, a végén pedig egy összefoglaló, ahol küldés előtt mindent
átnézhetsz. Egyetlen hosszú űrlapra ránézni is fárasztó; ugyanezek a kérdések kis adagokban gyorsnak tűnnek, és a
felhasználó mindig tudja, hol tart. Az ilyen űrlap neve [[többlépéses űrlap]], vagy angol mintára [[varázsló]]
(wizard).

Közben megtanulod, hogyan tartsd egy helyen az összes lépés válaszait, hogy semmi ne vesszen el, amikor a felhasználó
lépésről lépésre halad; hogyan ellenőrizd a mezőket lépésenként, és hogyan mutass érthető hibaüzenetet a megfelelő
pillanatban; és hogyan működik egy haladásjelző. A haladó szinten megnézed, hogyan gondolkodik az űrlapokról a két
legnépszerűbb könyvtár, a Zod és a React Hook Form, beépítesz egy lépést, ami csak akkor jelenik meg, ha szükség van
rá, piszkozatot mentesz, és a kész űrlapot elküldöd egy szerverre.

:::levels
- Három lépés (fiók, profil, érdeklődés) Vissza és Tovább gombbal, a végén összefoglalóval. | kb. 2 óra
- Szabályok minden lépéshez érthető hibaüzenetekkel, kattintható haladásjelző, és a válaszok megmaradnak, bárhová lépsz. | kb. 3 óra
- Szabályok sémában, ahogy a Zod és a React Hook Form csinálja; egy lépés, ami csak akkor jön, ha kell; mentett piszkozat; küldés egy (kitalált) szerverre. | kb. 3 óra
:::

**Előismeret:** az előző leckék. Leginkább ezekre építünk: az 1. lecke (a kapcsolati űrlap: objektum az állapotban,
`[event.target.name]`, `preventDefault`), a 3. lecke (jelölőnégyzetek, rádiógombok, az állapot felemelése), a 9. lecke
(`useEffect` takarítással, `localStorage`), a 14. lecke (betöltési és hibaállapot, `async` és `await`), a 16. és a 18.
lecke (`useRef` egy oldalelemhez) és a 20. lecke (várakozás, amíg a gépelés abbamarad). Ahol egy ismerős dolgot új
módon használunk, ott újra elmagyarázzuk.

## Kezdő szint {level=1}

### Mielőtt elkezded

Ennek a leckének a kiinduló projektje a kurzus GitHub-repójában a `lessons/22-multi-step-form/exercise` mappa (a fenti
„Feladat a GitHubon” gomb ezt nyitja meg). Ugyanúgy szerzed meg, mint a korábbi leckékben; az 1. lecke minden lépést
részletesen elmagyaráz. A terminálban, a munkamappádban (abban, amelyikben a `rika-mentoring` mappa van):

```shell
cd rika-mentoring
git pull        # lehozza a repóba az új leckéket
cd ..
cp -r rika-mentoring/lessons/22-multi-step-form/exercise code-club-signup
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git` (git nélkül: a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) **Code → Download ZIP**). A mappát a fájlkezelőben
is átmásolhatod; az a lényeg, hogy a másolatod neve `code-club-signup` legyen, és a `rika-mentoring` mappán kívülre
kerüljön: így a `git pull` továbbra is működik. Nyisd meg a másolatodat a szerkesztőben, aztán írd be ezt a két
parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„Join Code Club” címmel, alatta egy sor szöveggel. Űrlap még nincs rajta: azt te építed fel.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. A szervert hagyd futni, és nyiss egy
második terminált (a terminálpanel **+** gombja; ez is a `code-club-signup` mappában nyílik meg):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` minden fájlt visszaállít az utolsó commitod állapotára (az új fájlokat kézzel töröld), és
érdemes minden működő lépés után commitolni.

A kiinduló projektben három fájl fontos ehhez a leckéhez:

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet és a bevezető mondatot mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen (a kártya, a mezők, a hibaüzenetek, a haladásjelző, az
  összefoglaló…). Ezeket nem kell megírnod, csak a lépésekben megadott osztályneveket (`signup`, `step`, `field`,
  `chip`, `summary`, …) használod.
- `src/fakeApi.js`: egy kitalált szerver, ami a böngésződben fut. Csak a legvégén, a haladó szinten lesz rá szükség.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések, a „Join Code Club” cím és az alatta
lévő mondat angolul vannak. Ha szeretnéd, írd át őket nyugodtan magyarra: a lépések ugyanúgy működnek. A kódot, amit te
írsz be, magyar feliratokkal és megjegyzésekkel mutatjuk.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza. Kívülről a [[props]]-ain keresztül kap adatot, és a [[useState]]
segítségével emlékszik: ha egy állapotérték megváltozik, a React újrarajzolja a komponenst. A [[vezérelt mező]] az
állapotból kapja az értékét, az `onChange`-e pedig minden leütést visszaír oda. Az 1. lecke kapcsolati űrlapja az összes
mezőjét egyetlen [[objektum]]ban tartotta, és így frissítette: `{ ...form, [event.target.name]: event.target.value }`. A
[[spread]] lemásolja a régi objektumot, a szögletes zárójelben álló kulcs pedig felülír benne egy mezőt. Az állapotot
sosem módosítjuk helyben: a beállító függvény (például a `setForm`) mindig új objektumot kap. A
`{feltétel && <Valami />}` pedig csak akkor rajzol ki valamit, ha a feltétel igaz ([[feltételes megjelenítés]]).
:::

### Egy objektum az egész űrlapnak

A többlépéses űrlap több képernyő válaszait gyűjti össze, és a végén együtt küldi el őket. A válaszoknak tehát olyan
hely kell, amely az első lépéstől az utolsóig megmarad: egyetlen objektum az `App` állapotában, benne minden lépés
minden mezőjével. Először írd le az egész űrlapot, egy külön fájlba. Hozd létre az `src/formData.js` fájlt:

```js file=src/formData.js
// Az űrlap minden mezője a kezdőértékével: az egész űrlap egyetlen objektum.
export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '', // a jelszó még egyszer
  fullName: '',
  username: '',
  role: '',
  topics: [], // több téma is bejelölhető, ezért ez egy tömb
  frequency: 'weekly',
}
```

Ebben az űrlapban minden címke ugyanúgy áll a mezője fölött, ezt egy apró komponens intézi. Hozz létre az `src`-ben egy
`components` mappát, benne egy `Field.jsx` fájlt:

```jsx file=src/components/Field.jsx
// Egy címke, benne a mezővel. Ami a <Field> és a </Field> közé kerül, az lesz a children.
function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  )
}

export default Field
```

A [[children]] az a különleges prop, amivel a 2. lecke `ThemeProvider`-énél találkoztál: itt az az `<input>`, amit a
`<Field>` belsejébe teszünk. Mivel a mező a `<label>`-en belül van, a címkére kattintva a kurzor a mezőbe ugrik, a
képernyőolvasó pedig a mezővel együtt a címkét is felolvassa.

Az űrlap lépései saját mappát kapnak. Hozd létre az első lépést, az `src/steps/AccountStep.jsx` fájlt:

```jsx file=src/steps/AccountStep.jsx
import Field from '../components/Field.jsx'

function AccountStep({ register }) {
  return (
    <div className="step">
      <Field label="E-mail-cím">
        <input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field label="Jelszó">
        <input type="password" autoComplete="new-password" {...register('password')} />
      </Field>
      <Field label="Jelszó még egyszer">
        <input type="password" autoComplete="new-password" {...register('confirm')} />
      </Field>
    </div>
  )
}

export default AccountStep
```

Minden vezérelt szövegmezőnek ugyanaz a pár dolog kell: egy `value` az állapotból és egy `onChange`, ami az állapotba
ír. Ha minden mezőnél kiírnánk, rengeteg gépelés lenne. Ezért az `App` egy kis segédfüggvényt ad a lépéseknek, a
`register`-t, ami egy objektumban adja vissza ezeket az attribútumokat. Az `<input>`-on belüli `{...register('email')}`
megint a spread, ezúttal JSX-ben: az objektum kulcsait attribútumként teríti szét az elemen ([[attribútumok
szétterítése]]). A két alábbi változat ugyanazt csinálja:

:::compare
```jsx label="Kiírva"
<input
  type="email"
  name="email"
  value={values.email}
  onChange={(event) => setField('email', event.target.value)}
/>
```
```jsx label="A register-rel" now
<input type="email" {...register('email')} />
```
:::

Az `autoComplete` megmondja a böngészőnek és a jelszókezelőknek, mire való egy mező: az `email`-nél a böngésző
felajánlja a címedet, a `new-password`-nél pedig azt, hogy kitalál és megjegyez egy erős jelszót.

Most jöhet az `App`. Cseréld le az `src/App.jsx` tartalmát erre:

```jsx file=src/App.jsx mark=1-3,7,9-12,14-21,30-32,34-35
import { useState } from 'react'
import { INITIAL_VALUES } from './formData.js'
import AccountStep from './steps/AccountStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    }
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <div className="signup__form">
        <AccountStep register={register} />
      </div>

      {/* Egyelőre: a teljes állapot, élőben. A szint végén eltűnik. */}
      <pre className="debug">{JSON.stringify(values, null, 2)}</pre>
    </main>
  )
}

export default App
```

- A `setField(name, value)` bármelyik mezőt módosítja. Ez az 1. lecke `[event.target.name]` trükkje, csak a nevet és
  az értéket paraméterként kapja, mert később nem minden mező lesz szövegmező. A `setValues` egy
  [[frissítő függvényt|frissítő függvény]] kap (6–8. lecke): a React a legfrissebb állapottal (`prev`) hívja meg, és
  amit visszaad, az lesz az új állapot.
- A `register(name)` egy háromkulcsos objektumot ad vissza. A `name,` a `name: name` rövidítése. A `register` nevet egy
  népszerű űrlapkönyvtártól, a React Hook Formtól kölcsönöztük: a haladó szinten találkozol vele.
- A `JSON.stringify(values, null, 2)` [[JSON]]-szöveggé alakítja az állapotot, két szóközzel behúzva. Egy `<pre>`-ben
  pontosan úgy marad, ahogy van, soronként: kis ablak az állapotra, amíg építünk. A `{/* … */}` megjegyzés a JSX-ben.

:::check Ellenőrizd
Az űrlap alatt egy sötét doboz mutatja az állapotot. Gépelj az e-mail-mezőbe: a dobozban az `email` sor minden
leütéssel változik. A jelszómezők pöttyöket mutatnak, a doboz viszont olvashatóan kiírja a jelszót: ez csak a te
eszközöd, és a szint végén eltűnik.
:::

:::mistake Gyakori hiba
`setValues((prev) => ({ [name]: value }))`, a `...prev` nélkül. Ekkor minden leütés egy vadonatúj, egyetlen mezőből
álló objektumot csinál: gépelj az e-mail-mezőbe, és a dobozban csak az `email` marad. A többi mező eltűnt.
:::

:::try Próbáld ki
Nyisd meg a böngésző fejlesztői eszközeit (++F12++), és nézd meg az Elements fülön az e-mail-mezőt: van rajta
`name="email"`, `type="email"` és `autocomplete="email"`. A `name`-et a React tette oda, a `register`-ből.
:::

### Lépések Vissza és Tovább gombbal

Most jönnek a lépések. Hogy melyik lépés látszik, az egy szám az állapotban, a `step`: az első lépés 0, a második 1,
ugyanúgy 0-tól számolva, mint egy tömb elemeit. A lépések listája az `src/formData.js`-be kerül, egy legördülő lista
lehetőségeivel együtt, amelyekre a második lépésnek lesz szüksége. Itt az egész fájl:

```js file=src/formData.js mark=13-17,19-25
// Az űrlap minden mezője a kezdőértékével: az egész űrlap egyetlen objektum.
export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '', // a jelszó még egyszer
  fullName: '',
  username: '',
  role: '',
  topics: [], // több téma is bejelölhető, ezért ez egy tömb
  frequency: 'weekly',
}

// A lépések sorrendben. A key a kódnak szól, a title a felhasználónak.
export const STEPS = [
  { key: 'account', title: 'Fiók' },
  { key: 'profile', title: 'Profil' },
]

// A „Ki vagy?” lehetőségei: a value-t tároljuk, a label-t látja a felhasználó.
export const ROLES = [
  { value: 'student', label: 'Diák' },
  { value: 'developer', label: 'Fejlesztő' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Valami más' },
]
```

A második lépés ugyanúgy épül fel, mint az első. Egy `<select>` ([[legördülő lista]], 10. lecke) ugyanúgy `value`-t és
`onChange`-et kap, mint egy `<input>`, így a `register` neki is jó. Hozd létre az `src/steps/ProfileStep.jsx` fájlt:

```jsx file=src/steps/ProfileStep.jsx
import Field from '../components/Field.jsx'
import { ROLES } from '../formData.js'

function ProfileStep({ register }) {
  return (
    <div className="step">
      <Field label="Teljes név">
        <input autoComplete="name" {...register('fullName')} />
      </Field>
      <Field label="Felhasználónév">
        <input autoComplete="username" {...register('username')} />
      </Field>
      <Field label="Ki vagy?">
        <select {...register('role')}>
          <option value="">Válassz egyet</option>
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}

export default ProfileStep
```

Az első `<option>` értéke üres: amíg a `role` értéke üres szöveg (`''`), addig a lista azt mutatja, hogy „Válassz
egyet”. Most az `App` megkapja a lépéseket, egy igazi `<form>`-ot és a két gombot. Cseréld le az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=2,4,9,11-12,28-30,32-36,45-51,53-54,56-66
import { useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // melyik lépés látszik: 0 az első

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    }
  }

  function back() {
    setStep(step - 1)
  }

  // A „Tovább” küldőgomb: a rá kattintás és bármelyik mezőben az Enter is ide fut be.
  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (!isLast) setStep(step + 1)
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <form className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            {step + 1}. lépés / {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} />}
        {current.key === 'profile' && <ProfileStep register={register} />}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={back}>
              Vissza
            </button>
          )}
          <button type="submit" className="button">
            Tovább
          </button>
        </div>
      </form>

      {/* Egyelőre: a teljes állapot, élőben. A szint végén eltűnik. */}
      <pre className="debug">{JSON.stringify(values, null, 2)}</pre>
    </main>
  )
}

export default App
```

- A `current` és az `isLast` nem új állapot: minden rajzoláskor a `step`-ből számoljuk ki őket.
- Egyszerre csak egy lépés látszik: a `{current.key === 'account' && …}` csak addig rajzolja ki az `AccountStep`-et,
  amíg a fiók a jelenlegi lépés.
- A „Tovább” egy `type="submit"` gomb. Ha rákattintasz, **vagy** bármelyik mezőben ++Enter++-t nyomsz, a böngésző
  elküldi az űrlapot, és mindkét esetben a `handleSubmit` fut le. Az `event.preventDefault()` megakadályozza, hogy a
  böngésző újratöltse az oldalt, ahogy az 1. leckében. A „Vissza” `type="button"`: sima gomb, ami nem küld el semmit.
- A `noValidate` kikapcsolja a böngésző saját felugró ellenőrzését, mint az 1. lecke kapcsolati űrlapján: nélküle a
  `type="email"` egy buborékkal megállítaná a Tovább gombot, amíg a cím nem teljes. Saját ellenőrzést a középszinten
  írunk.
- `{step > 0 && …}`: az első lépésről nincs hová visszamenni, ott nincs Vissza gomb.

:::concept Hová lesz az elrejtett lépés?
Amikor a `step` 1 lesz, az `AccountStep`-et már nem rajzoljuk ki: a React leveszi az oldalról, ennek a neve
[[unmount]] (lecsatolás). Ami egy komponens saját állapotában van, az vele együtt eltűnik. Ezért élnek a válaszok az
`App`-ban, ami végig az oldalon marad: a lépések csak megmutatják őket, és jelentenek minden változást. Ez a 3. lecke
[[állapot felemelése]]. Ha visszalépsz, az `AccountStep` újra kirajzolódik a `values`-ból, és minden ott van.
:::

:::check Ellenőrizd
Írd be az e-mail-címet, és nyomj ++Enter++-t: „2. lépés / 2” (a CSS nagybetűkkel írja ezt a sort), Profil. Ezt is töltsd
ki, aztán kattints a Vissza gombra: az e-mail-cím ott van a mezőjében, a sötét doboz pedig végig mutatta az összes
választ. A második lépésen a Tovább még nem csinál semmit: nincs harmadik lépés.
:::

:::mistake Gyakori hiba
Vissza gomb `type="button"` nélkül. Egy űrlapon belül a típus nélküli gomb küldőgomb, így a Vissza elküldi az
űrlapot, és a `handleSubmit` **előre** visz.
:::

### Választás: jelölőnégyzetek és rádiógombok

A harmadik lépés az érdeklődésről kérdez: a témákból [[jelölőnégyzet]]ekkel bármennyit be lehet jelölni, a klub
hírlevelének gyakoriságát pedig [[rádiógombokkal|rádiógomb]] lehet kiválasztani (mindkettőt ismered a 3. leckéből). Ezek
másképp működnek, mint a szövegmezők: hogy egy doboz be van-e jelölve, az a `checked` attribútumában van, nem a
`value`-ban, a témák pedig egy tömböt alkotnak. Ez a lépés ezért nem a `register`-t használja, hanem a `values`-t és a
`setField`-et kapja.

Előbb az adatok. Itt megint az egész `src/formData.js`, a harmadik lépéssel és két új listával, a témákkal és a
hírlevél gyakoriságaival:

```js file=src/formData.js mark=17,28-34,36-40
// Az űrlap minden mezője a kezdőértékével: az egész űrlap egyetlen objektum.
export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '', // a jelszó még egyszer
  fullName: '',
  username: '',
  role: '',
  topics: [], // több téma is bejelölhető, ezért ez egy tömb
  frequency: 'weekly',
}

// A lépések sorrendben. A key a kódnak szól, a title a felhasználónak.
export const STEPS = [
  { key: 'account', title: 'Fiók' },
  { key: 'profile', title: 'Profil' },
  { key: 'preferences', title: 'Érdeklődés' },
]

// A „Ki vagy?” lehetőségei: a value-t tároljuk, a label-t látja a felhasználó.
export const ROLES = [
  { value: 'student', label: 'Diák' },
  { value: 'developer', label: 'Fejlesztő' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Valami más' },
]

export const TOPICS = [
  { value: 'react', label: 'React' },
  { value: 'css', label: 'CSS' },
  { value: 'games', label: 'Játékok' },
  { value: 'a11y', label: 'Akadálymentesség' },
  { value: 'design', label: 'UI-design' },
]

export const FREQUENCIES = [
  { value: 'daily', label: 'Naponta' },
  { value: 'weekly', label: 'Hetente' },
  { value: 'monthly', label: 'Havonta' },
]
```

Aztán maga a lépés. Hozd létre az `src/steps/PreferencesStep.jsx` fájlt:

```jsx file=src/steps/PreferencesStep.jsx
import { FREQUENCIES, TOPICS } from '../formData.js'

function PreferencesStep({ values, setField }) {
  // Bejelöléskor a téma bekerül a tömbbe, a pipa kivételekor kikerül belőle; mindkétszer új tömb készül.
  function toggleTopic(topic) {
    if (values.topics.includes(topic)) {
      setField('topics', values.topics.filter((item) => item !== topic))
    } else {
      setField('topics', [...values.topics, topic])
    }
  }

  return (
    <div className="step">
      <fieldset className="choices">
        <legend>Ezek a témák érdekelnek</legend>
        <div className="choices__list">
          {TOPICS.map((topic) => (
            <label key={topic.value} className="chip">
              <input
                type="checkbox"
                name="topics"
                checked={values.topics.includes(topic.value)}
                onChange={() => toggleTopic(topic.value)}
              />
              {topic.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="choices">
        <legend>Klubhírlevél</legend>
        <div className="choices__list">
          {FREQUENCIES.map((option) => (
            <label key={option.value} className="chip">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={values.frequency === option.value}
                onChange={() => setField('frequency', option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default PreferencesStep
```

- A `values.topics.includes(topic)` ([[includes]]) megmondja, benne van-e már a téma a tömbben. Ha igen, a `filter`
  egy új tömböt csinál nélküle; ha nem, a `[...values.topics, topic]` egy új tömböt az összes régi témával és a végén
  az újjal. Ahogy mindig (7. lecke), az állapotban lévő tömböt nem módosítjuk helyben.
- Egy doboz akkor van bejelölve, ha a témája benne van a tömbben: ez a `checked`-je. Egy rádiógomb akkor van
  kiválasztva, ha a `frequency` épp az ő értéke.
- Az azonos `name`-ű rádiógombok egy csoportot alkotnak: egyszerre csak egy lehet kiválasztva közülük, és a
  nyílbillentyűk köztük lépkednek. A `<fieldset>` és a `<legend>` címet ad a csoportnak, amit a képernyőolvasó minden
  választással együtt felolvas.

Végül az `App` kirajzolja az új lépést. Az `src/App.jsx`-ben töltsd be a többi lépés mellé, és a `ProfileStep` sora alá
írj még egy sort:

```jsx file=src/App.jsx mark=1,5
import PreferencesStep from './steps/PreferencesStep.jsx'
// … a többi import és az App eleje, a régi

        {current.key === 'profile' && <ProfileStep register={register} />}
        {current.key === 'preferences' && <PreferencesStep values={values} setField={setField} />}
```

:::check Ellenőrizd
3. lépés / 3, Érdeklődés. Kattints néhány témára: zöldre váltanak, a sötét dobozban pedig velük együtt nő és fogy a
`topics` tömb. Válaszd a „Havonta” lehetőséget: a `frequency` megváltozik. Menj vissza az első lépésig, aztán újra
előre: minden pipa megmaradt.
:::

:::mistake Gyakori hiba
A `checked` kimarad. A dobozok kattintásra így is bepipálódnak, a tömb is változik, úgyhogy minden rendben lévőnek
tűnik. De lépj át egy másik lépésre és vissza: minden doboz üres, pedig a sötét dobozban a tömb még tartja a témákat.
`checked` nélkül a doboz nem vezérelt: a pipát a böngésző maga jegyzi meg, és elfelejti, amikor a lépés lekerül az
oldalról.
:::

:::try Próbáld ki
Adj egy hatodik témát a `TOPICS`-hoz, például `{ value: 'music', label: 'Zenés appok' }`. Egyetlen sor, és máris
megjelenik az új téma.
:::

### Összefoglaló a végén

Az utolsó lépés minden választ megmutat, hogy a felhasználó küldés előtt átnézhesse őket. Az `src/formData.js`-ben adj
egy negyedik lépést a `STEPS`-hez (a fájl többi része marad):

```js file=src/formData.js mark=5
export const STEPS = [
  { key: 'account', title: 'Fiók' },
  { key: 'profile', title: 'Profil' },
  { key: 'preferences', title: 'Érdeklődés' },
  { key: 'review', title: 'Ellenőrzés' },
]
```

Az összefoglaló név–érték párok listája, lépésenként egy csoport. Hozd létre az `src/steps/ReviewStep.jsx` fájlt:

```jsx file=src/steps/ReviewStep.jsx
import { FREQUENCIES, ROLES, TOPICS } from '../formData.js'

// Egy tárolt érték felirata, például 'student' → 'Diák'.
function labelOf(options, value) {
  const option = options.find((item) => item.value === value)
  return option ? option.label : ''
}

function ReviewStep({ values }) {
  const sections = [
    {
      key: 'account',
      title: 'Fiók',
      rows: [
        ['E-mail-cím', values.email],
        ['Jelszó', values.password ? '••••••••' : ''],
      ],
    },
    {
      key: 'profile',
      title: 'Profil',
      rows: [
        ['Teljes név', values.fullName],
        ['Felhasználónév', values.username],
        ['Ki vagy?', labelOf(ROLES, values.role)],
      ],
    },
    {
      key: 'preferences',
      title: 'Érdeklődés',
      rows: [
        ['Témák', values.topics.map((topic) => labelOf(TOPICS, topic)).join(', ')],
        ['Hírlevél', labelOf(FREQUENCIES, values.frequency)],
      ],
    },
  ]

  return (
    <div className="summary">
      {sections.map((section) => (
        <section key={section.key} className="summary__section">
          <div className="summary__head">
            <h3>{section.title}</h3>
          </div>
          <dl>
            {section.rows.map(([label, value]) => (
              <div key={label} className="summary__row">
                <dt>{label}</dt>
                {/* Az üres válasz helyén gondolatjel áll, hogy a sor ne tűnjön hibásnak. */}
                <dd>{value || '–'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export default ReviewStep
```

- A `labelOf` megkeresi azt a lehetőséget, amelyiknek a `value`-ja a tárolt érték ([[find]]), és visszaadja a
  feliratát. Mi `'student'`-et tárolunk, a felhasználónak viszont azt kell olvasnia, hogy „Diák”.
- Minden sor egy kételemű tömb: `[felirat, érték]`. A `map(([label, value]) => …)` már a paraméterben szétszedi a két
  elemet: ez a tömbös [[destrukturálás]], ugyanaz, mint a `const [values, setValues] = useState(…)`-ban.
- A `<dl>`, `<dt>` és `<dd>` egy [[leíró listát|leíró lista]] alkot, ahogy a 13. lecke statisztikájában.
- A jelszó még az összefoglalóban sem látszik: csak pöttyök, ha van.

Végül az `App`: a negyedik lépés, egy „Fiók létrehozása” gomb az utolsó lépésen, és egy üdvözlőképernyő. A sötét doboz
elvégezte a dolgát: mostantól az összefoglaló mutat mindent, ezért kikerül. Itt az egész `src/App.jsx` a kezdő szint
végén:

```jsx file=src/App.jsx mark=6,12,38-42,45-50,52-67,87,96
import { useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // melyik lépés látszik: 0 az első
  const [submitted, setSubmitted] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    }
  }

  function back() {
    setStep(step - 1)
  }

  // A „Tovább” küldőgomb: a rá kattintás és bármelyik mezőben az Enter is ide fut be.
  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (isLast) {
      setSubmitted(true)
    } else {
      setStep(step + 1)
    }
  }

  // Újra üres űrlap, az első lépésen.
  function startOver() {
    setValues(INITIAL_VALUES)
    setStep(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Üdv a Code Clubban, {values.fullName}!</h2>
          <p>Elkészült a fiókod. Egy igazi appban most egy megerősítő e-mail menne ide: {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Újrakezdés
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <form className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            {step + 1}. lépés / {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} />}
        {current.key === 'profile' && <ProfileStep register={register} />}
        {current.key === 'preferences' && <PreferencesStep values={values} setField={setField} />}
        {current.key === 'review' && <ReviewStep values={values} />}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={back}>
              Vissza
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Fiók létrehozása' : 'Tovább'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

Ha a `submitted` igaz, az `App` már az elején visszaadja az üdvözlőképernyőt, és az űrlapot ki sem rajzolja: ez
[[korai visszatérés]], mint a 4. leckében. A `startOver` minden állapotot visszaállít a kezdőértékére.

:::check Ellenőrizd
Töltsd ki mindhárom lépést. Az Ellenőrzés lépésen („4. lépés / 4”) három szürke doboz mutatja a válaszaidat; a témák
vesszővel elválasztva állnak, a jelszó helyén csak pöttyök. Kattints a „Fiók létrehozása” gombra: „Üdv a Code
Clubban, …!”, a neveddel és az e-mail-címeddel. Az „Újrakezdés” üres űrlapot hoz az első lépésen. Kész a kezdő szint:
commitold!
:::

:::mistake Gyakori hiba
Egy elfelejtett `key`, például a sorok `<div>`-jén. Az oldal működik, de a konzol (++F12++) figyelmeztet: „Each child in
a list should have a unique key prop”. Minden elemnek, amit a `map` gyárt, kell egy `key`, ami a szomszédai között
egyedi: itt a sor felirata az.
:::

:::try Próbáld ki
Köszöntsd a felhasználót csak a keresztnevén. A magyar sorrendben a keresztnév a végén áll:
`values.fullName.split(' ').at(-1)` szóközöknél szétvágja a nevet, és az utolsó darabot adja vissza.
:::

## Középszint {level=2}

### Szabályok minden lépéshez

Az űrlap most bármit átenged: üres e-mail-címet, háromkarakteres jelszót, és azt is, ha egyetlen témát sem jelölsz
be. Kell neki [[űrlap-ellenőrzés]] (validálás): a válaszokat szabályokhoz mérjük, mielőtt elfogadjuk őket. A 10.
leckében ezt a böngésző végezte a `required`-del; itt az űrlapon `noValidate` van, ami kikapcsolja a böngésző
ellenőrzését, mert saját üzeneteket szeretnénk, a saját helyükön, lépésről lépésre.

A szabályok külön fájlba kerülnek. Hozd létre az `src/validation.js` fájlt:

```js file=src/validation.js
// Valami, egy @, valami, egy pont, valami; és sehol egy szóköz.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// 3–20 karakter: betű, számjegy vagy _.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i

// Egy lépés hibái { mezőnév: üzenet } alakban. Az üres objektum azt jelenti, hogy a lépés rendben van.
export function validateStep(stepKey, values) {
  const errors = {}

  if (stepKey === 'account') {
    if (values.email.trim() === '') {
      errors.email = 'Add meg az e-mail-címed.'
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = 'Ez nem úgy néz ki, mint egy e-mail-cím.'
    }
    if (values.password.length < 8) {
      errors.password = 'Legalább 8 karakter legyen.'
    }
    if (values.confirm === '') {
      errors.confirm = 'Írd be még egyszer a jelszót.'
    } else if (values.confirm !== values.password) {
      errors.confirm = 'A két jelszó nem egyezik.'
    }
  }

  if (stepKey === 'profile') {
    if (values.fullName.trim() === '') {
      errors.fullName = 'Add meg a neved.'
    }
    if (!USERNAME_PATTERN.test(values.username)) {
      errors.username = '3–20 karakter: betű, számjegy vagy _.'
    }
    if (values.role === '') {
      errors.role = 'Válassz egyet.'
    }
  }

  if (stepKey === 'preferences' && values.topics.length === 0) {
    errors.topics = 'Válassz legalább egy témát.'
  }

  return errors
}
```

- Egy lépés hibái egy objektumot alkotnak: a kulcs a mező neve, az érték az üzenet. Ha az objektum üres, a lépés
  rendben van.
- A `trim()` ([[trim]]) levágja a szóközöket a két végéről, így a `'   '` nem számít névnek.
- A két minta [[reguláris kifejezés]], olyan, mint a 7. és a 11. leckében. A `^` a szöveg eleje, a `$` a vége, így az
  egész szövegnek illeszkednie kell. A `[^\s@]+` azt jelenti: „egy vagy több karakter, ami se nem szóköz, se nem @”. A
  `[a-z0-9_]{3,20}` azt: „3–20 betű, számjegy vagy aláhúzás”, a végén álló `i` pedig a nagybetűket is betűnek veszi.
  A `test` megmondja, illeszkedik-e a szöveg.
- A `confirm` szabálya két mezőt hasonlít össze: a szabályok az egész űrlapot láthatják.

Most jöhet az `App`: kiszámolja a jelenlegi lépés hibáit, és a „Tovább” csak akkor lép, ha nincs egy sem. Cseréld le az
`src/App.jsx`-et:

```jsx file=src/App.jsx mark=3,13,18-21,37-40,46-49,53,60,96-100,103-107,111
import { useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import { validateStep } from './validation.js'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // melyik lépés látszik: 0 az első
  const [showErrors, setShowErrors] = useState(false) // igaz, ha ezen a lépésen már megnyomták a „Tovább”-ot
  const [submitted, setSubmitted] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  // Minden rajzoláskor a válaszokból számoljuk: származtatott érték, nem állapot.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0
  const shownErrors = showErrors ? errors : {}

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    }
  }

  // Minden lépésváltás ezen megy át: az új lépés piros üzenetek nélkül indul.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
  }

  // A „Tovább” küldőgomb: a rá kattintás és bármelyik mezőben az Enter is ide fut be.
  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (hasErrors) {
      setShowErrors(true) // mutassuk az üzeneteket, és maradjunk ezen a lépésen
      return
    }
    if (isLast) {
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // Újra üres űrlap, az első lépésen.
  function startOver() {
    setValues(INITIAL_VALUES)
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Üdv a Code Clubban, {values.fullName}!</h2>
          <p>Elkészült a fiókod. Egy igazi appban most egy megerősítő e-mail menne ide: {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Újrakezdés
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <form className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            {step + 1}. lépés / {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'review' && <ReviewStep values={values} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Javítsd ki a pirossal jelölt mezőket.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Vissza
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Fiók létrehozása' : 'Tovább'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- Az `errors` [[származtatott érték]], mint a 3. lecke jelszóerőssége: minden rajzoláskor a `values`-ból számoljuk ki,
  így mindig naprakész. Az `Object.keys(errors)` az objektum kulcsait sorolja fel; ha egy sincs, a lépés rendben van.
- A `showErrors` csak azt jegyzi meg, hogy ezen a lépésen megnyomták-e már a „Tovább”-ot. Addig a lépések üres
  objektumot (`{}`) kapnak, hogy egy friss lépés ne teljen meg piros üzenetekkel, mielőtt a felhasználó bármit
  beírt volna.
- A `back` eltűnt: a Vissza, a Tovább és az Újrakezdés is a `goTo`-n keresztül lép, ami az üzeneteket is elrejti, így
  a következő lépés tisztán indul.
- A `role="alert"` miatt a képernyőolvasó azonnal felolvassa a piros dobozt, amint megjelenik.
- Az `App` már most átadja az üzeneteket a lépéseknek (`errors={shownErrors}`), de a lépések még nem mutatják meg
  őket: ez a következő lépés dolga. Egyelőre a gombok fölötti piros doboz az egyetlen jel.

:::check Ellenőrizd
Nyomd meg a Tovább gombot az üres első lépésen: a gombok fölött megjelenik egy piros doboz, és az 1. lépésen maradsz. A
doboz pirossal jelölt mezőkről beszél, de még semmi nincs megjelölve: az üzenetek a következő lépésben jönnek. Most írj
be egy helyes e-mail-címet, és mindkét jelszómezőbe azt, hogy `secret123`: a piros doboz eltűnik, amint az utolsó mező
is rendben van, mert a hibákat minden rajzoláskor újra kiszámoljuk. A Tovább továbbenged, és a 2. lépés piros doboz
nélkül indul.
:::

:::mistake Gyakori hiba
A hibákat saját állapotban tartani (`const [errors, setErrors] = useState({})`), és a `handleSubmit`-ben kitölteni.
Ekkor a piros doboz nem követi a gépelést: minden mezőt helyesen kitöltesz, a doboz mégis ott marad, amíg újra meg nem
nyomod a Tovább gombot. Amit ki lehet számolni az állapotból, azt számold ki, ne tárold.
:::

### Üzenetek a mezők alatt

A piros doboz azt mondja meg, hogy valami nem jó, de azt nem, hogy mi. Minden üzenetnek a saját mezője alatt kell
megjelennie, ezért a `Field` kap egy `error` propot. Cseréld le az `src/components/Field.jsx`-et:

```jsx file=src/components/Field.jsx mark=2,7
// Egy címke, benne a mezővel. Ami a <Field> és a </Field> közé kerül, az lesz a children.
function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}

export default Field
```

Az üzenet a `<label>`-en belül van, így a képernyőolvasó a címkével együtt felolvassa, amikor a kurzor a mezőbe ér.
Most a lépések továbbadják minden mező üzenetét. Cseréld le az `src/steps/AccountStep.jsx`-et:

```jsx file=src/steps/AccountStep.jsx mark=3,6,9,12
import Field from '../components/Field.jsx'

function AccountStep({ register, errors }) {
  return (
    <div className="step">
      <Field label="E-mail-cím" error={errors.email}>
        <input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field label="Jelszó" error={errors.password}>
        <input type="password" autoComplete="new-password" {...register('password')} />
      </Field>
      <Field label="Jelszó még egyszer" error={errors.confirm}>
        <input type="password" autoComplete="new-password" {...register('confirm')} />
      </Field>
    </div>
  )
}

export default AccountStep
```

Aztán az `src/steps/ProfileStep.jsx`-et:

```jsx file=src/steps/ProfileStep.jsx mark=4,7,10,13
import Field from '../components/Field.jsx'
import { ROLES } from '../formData.js'

function ProfileStep({ register, errors }) {
  return (
    <div className="step">
      <Field label="Teljes név" error={errors.fullName}>
        <input autoComplete="name" {...register('fullName')} />
      </Field>
      <Field label="Felhasználónév" error={errors.username}>
        <input autoComplete="username" {...register('username')} />
      </Field>
      <Field label="Ki vagy?" error={errors.role}>
        <select {...register('role')}>
          <option value="">Válassz egyet</option>
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}

export default ProfileStep
```

A témák nincsenek `Field`-ben, ezért a hibaüzenetüket kézzel tesszük a csoport alá. A `PreferencesStep` is megkapja az
`errors`-t, az első `<fieldset>` pedig egy új sort kap a végén. Cseréld le az `src/steps/PreferencesStep.jsx`-et:

```jsx file=src/steps/PreferencesStep.jsx mark=3,30
import { FREQUENCIES, TOPICS } from '../formData.js'

function PreferencesStep({ values, setField, errors }) {
  // Bejelöléskor a téma bekerül a tömbbe, a pipa kivételekor kikerül belőle; mindkétszer új tömb készül.
  function toggleTopic(topic) {
    if (values.topics.includes(topic)) {
      setField('topics', values.topics.filter((item) => item !== topic))
    } else {
      setField('topics', [...values.topics, topic])
    }
  }

  return (
    <div className="step">
      <fieldset className="choices">
        <legend>Ezek a témák érdekelnek</legend>
        <div className="choices__list">
          {TOPICS.map((topic) => (
            <label key={topic.value} className="chip">
              <input
                type="checkbox"
                name="topics"
                checked={values.topics.includes(topic.value)}
                onChange={() => toggleTopic(topic.value)}
              />
              {topic.label}
            </label>
          ))}
        </div>
        {errors.topics && <p className="field__error">{errors.topics}</p>}
      </fieldset>

      <fieldset className="choices">
        <legend>Klubhírlevél</legend>
        <div className="choices__list">
          {FREQUENCIES.map((option) => (
            <label key={option.value} className="chip">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={values.frequency === option.value}
                onChange={() => setField('frequency', option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default PreferencesStep
```

Az `App` nem változik: már most minden lépésnek átadja az üzeneteit.

:::check Ellenőrizd
Nyomd meg a Tovább gombot az üres első lépésen: most már minden mező alatt is piros üzenet áll. Írj be egy helyes
e-mail-címet: az üzenete azonnal eltűnik. A `secret` túl rövid jelszónak; ha mindkét jelszómezőbe `secret123` kerül,
továbbenged. Az Érdeklődés lépésen téma nélkül a Tovább azt írja: „Válassz legalább egy témát.”
:::

:::mistake Gyakori hiba
Egy lépés nem veszi át az `errors`-t a propjai közül, például így: `function AccountStep({ register })`. Ekkor az
`errors.email`-nek nincs honnan olvasnia: az oldal üres lesz, a konzolban (++F12++) pedig „errors is not defined”
hibát látsz. Egy komponens csak azokat a propokat használhatja, amelyeket a paramétere kapcsos zárójelei között
megnevez.
:::

:::try Feladat
Írj egy saját szabályt: a felhasználónév nem lehet `admin`, akkor sem, ha valaki `Admin`-nak vagy `ADMIN`-nak írja. A
`values.username.toLowerCase() === 'admin'` ezt ellenőrzi: tedd `else if`-ként a felhasználónév meglévő szabálya után,
és írd meg hozzá az üzenetet is.
:::

### Hibaüzenet a megfelelő pillanatban

Két dolog még nem az igazi. Az első: az üzenetek csak a Tovább után jelennek meg. Aki elgépeli az e-mail-címét, csak
a lépés legvégén tudja meg. Az első leütéstől mutatni sem jó: egyetlen betű után az, hogy „Ez nem úgy néz ki, mint egy
e-mail-cím”, csak bosszantó. A szokásos szabály a kettő között van: egy mező üzenete akkor jelenik meg, amikor a
felhasználó **elhagyta** a mezőt, és onnantól élőben követi a gépelést. Az a mező, amit a felhasználó már elhagyott
egyszer, [[érintett mező]] (angolul touched).

A mező elhagyása a [[blur]] esemény (Reactben `onBlur`): a mező elveszíti a [[fókusz]]t. A `register` pedig az az
egyetlen hely, ahol minden szövegmező megkapja az attribútumait, így az új `onBlur`-t csak oda kell beírni.

A második: ha a Tovább után hibák vannak, a kurzor ugorjon az első javítandó mezőbe. Ez mindenkinek segít, leginkább a
billentyűzettel és képernyőolvasóval dolgozóknak. Ehhez el kell érnünk a `<form>` elemet az oldalon, ez pedig a
[[useRef]] dolga (16. és 18. lecke).

Itt megint az egész `src/App.jsx`; csak az `App` komponens változik, a lépések maradnak:

```jsx file=src/App.jsx mark=1,14,16,24-28,41-44,59-61,74,103
import { useRef, useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import { validateStep } from './validation.js'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // melyik lépés látszik: 0 az első
  const [showErrors, setShowErrors] = useState(false) // igaz, ha ezen a lépésen már megnyomták a „Tovább”-ot
  const [touched, setTouched] = useState({}) // a mezők, amelyeket a felhasználó már elhagyott egyszer
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  // Minden rajzoláskor a válaszokból számoljuk: származtatott érték, nem állapot.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0

  // A látható üzenetek: a „Tovább” után mind, egyébként csak a már elhagyott mezőké.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // A mező elhagyása érintetté teszi: onnantól az üzenete követi a gépelést.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // Az üzenetes mező „érvénytelen”: a képernyőolvasó kimondja, a CSS pirosra rajzolja.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Minden lépésváltás ezen megy át: az új lépés piros üzenetek nélkül indul.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
  }

  // A „Tovább” küldőgomb: a rá kattintás és bármelyik mezőben az Enter is ide fut be.
  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (hasErrors) {
      setShowErrors(true) // mutassuk az üzeneteket, és maradjunk ezen a lépésen
      // A kurzor az első javítandó mezőbe kerül.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // Újra üres űrlap, az első lépésen.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Üdv a Code Clubban, {values.fullName}!</h2>
          <p>Elkészült a fiókod. Egy igazi appban most egy megerősítő e-mail menne ide: {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Újrakezdés
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            {step + 1}. lépés / {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'review' && <ReviewStep values={values} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Javítsd ki a pirossal jelölt mezőket.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Vissza
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Fiók létrehozása' : 'Tovább'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- A `touched` egy objektum, például `{ email: true, password: true }`: a kulcsai azoknak a mezőknek a nevei, amelyeket
  a felhasználó már elhagyott. Az `onBlur` egy újabb nevet tesz bele, frissítő függvénnyel és spreaddel, ugyanúgy, ahogy
  a `setField` a `values`-t módosítja.
- A `shownErrors` egy `for … of` ciklussal épül az `errors`-ból: egy üzenet akkor kerül bele, ha a Tovább gombot már
  megnyomták, vagy ha a mezője érintett.
- Az `'aria-invalid'` a kötőjel miatt áll idézőjelben. Az [[aria-invalid]] azt mondja a képernyőolvasónak, hogy a
  mező értéke hibás, az `App.css` pedig piros keretet ad az ilyen mezőknek. A `Boolean(…)` bármilyen értékből `true`-t
  vagy `false`-t csinál: egy üzenetből `true` lesz, az `undefined`-ból (nincs üzenet) `false`.
- A `ref={formRef}` a `<form>` elemet a `formRef.current`-be teszi. A `querySelector` megkeresi benne az első elemet,
  amely illeszkedik egy CSS-szelektorra: a `[name="email"]` jelentése „az az elem, amelyiknek a `name`-je `email`”. A
  szelektort egy [[template literal]] rakja össze (1. lecke). A `?.` ([[opcionális láncolás]], 14. lecke) csak akkor
  hívja meg a `focus()`-t, ha van ilyen elem.
- Az `errors` kulcsainak sorrendje az, amelyikben a `validateStep` beírta őket: ugyanaz, mint a mezők sorrendje a
  képernyőn. Így az `Object.keys(errors)[0]` a legfelső javítandó mező.
- A `startOver` a `touched`-ot is kiüríti: egy friss űrlapon nincs érintett mező.

:::check Ellenőrizd
Kattints az e-mail-mezőbe, írd be, hogy `ada`, és nyomj ++Tab++-ot: megjelenik az üzenet a mező alatt, a mező pedig
piros keretet kap. Kattints vissza az e-mail-mezőbe, és írd tovább: `@example.com`. Az üzenet gépelés közben eltűnik.
Közben a „Jelszó” alatt is megjelenik egy üzenet: üresen hagytad, amikor visszakattintottál, így az is érintett lett.
Egy friss 2. lépésen nyomd meg rögtön a Tovább gombot: három üzenet, és a kurzor már a „Teljes név” mezőben van. Az
Érdeklődés lépésen nyomd meg a Tovább gombot téma nélkül, aztán a ++Szóköz++ billentyűt: az első téma bepipálódik,
mert a fókusz a dobozára került.
:::

:::mistake Gyakori hiba
`onBlur: setTouched({ ...touched, [name]: true })`, a `() =>` nélkül. Ez azonnal, rajzolás közben meghívja a
`setTouched`-ot, és az eredményét adja az `onBlur`-nek. A rajzolás közben beállított állapot újrarajzolást kér, ami
megint beállítja az állapotot… míg a React „Too many re-renders” hibával meg nem áll. Függvényt adj át, ne hívd meg.
:::

:::try Feladat
Lépésváltáskor a fókusz a Tovább gombon marad, így a képernyőolvasó nem olvassa fel az új lépés címét. Vidd a
fókuszt a `<h2>`-re: kapjon `tabIndex={-1}`-et (így megkaphatja a fókuszt, de a ++Tab++ továbbra is átugorja) és egy
`ref`-et, egy `useEffect`-ben pedig, ami a `step` változásakor fut le, hívd meg a `headingRef.current.focus()`-t. A
legelső rajzolást hagyd ki, különben az oldal eleve a címen álló fókusszal nyílik meg: tarts egy
`const shouldFocus = useRef(false)`-t, amit a `goTo` `true`-ra állít, és csak akkor vidd a fókuszt a címre, ha ez
`true` (utána állítsd vissza). A későbbi lépések mindig egy teljesen új `App.jsx`-et adnak: ha megcsináltad ezt a
feladatot, minden alkalommal írd bele újra ezeket a sorokat.
:::

### A haladásjelző

Egy többlépéses űrlapnak mindig mutatnia kell, hol tart a felhasználó, és mennyi van még hátra. Erre való a
[[haladásjelző]]: a lépések címe számokkal, alattuk egy sáv. A már megtett lépések pipát kapnak. És minden lépés
megnyitható egy kattintással, ha az előtte lévő lépések mind helyesen ki vannak töltve: így bármelyik korábbi lépésre
vissza lehet ugrani, és előre is, ameddig a válaszok engedik.

Hogy egy lépés rendben van-e, azt egy újabb függvény mondja meg. Írd az `src/validation.js` végére:

```js file=src/validation.js
// Igaz, ha a lépésnek nincs hibája.
export function isStepValid(stepKey, values) {
  return Object.keys(validateStep(stepKey, values)).length === 0
}
```

A haladásjelző saját komponenst kap. Hozd létre az `src/components/StepIndicator.jsx` fájlt:

```jsx file=src/components/StepIndicator.jsx
// A számozott lépések az űrlap fölött. Az elérhető lépés gomb, ami odavisz.
function StepIndicator({ steps, current, canReach, onSelect }) {
  // Mennyi telik meg a sávból, százalékban: az első lépésen 0, az utolsón 100.
  const percent = (current / (steps.length - 1)) * 100

  return (
    <nav className="progress" aria-label="A regisztráció lépései">
      <ol className="progress__list">
        {steps.map((step, index) => {
          let className = 'progress__item'
          if (index < current) className += ' is-done'
          if (index === current) className += ' is-current'

          return (
            <li key={step.key} className={className}>
              <button
                type="button"
                className="progress__step"
                aria-current={index === current ? 'step' : undefined}
                disabled={index === current || !canReach(index)}
                onClick={() => onSelect(index)}
              >
                <span className="progress__number" aria-hidden="true">
                  {index < current ? '✓' : index + 1}
                </span>
                <span className="progress__title">{step.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="progress__bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </nav>
  )
}

export default StepIndicator
```

- A lépések egy számozott listában (`<ol>`) állnak, egy `<nav>`-on belül, hiszen az űrlapon belüli mozgást szolgálják.
  Az `aria-label` nevet ad a `<nav>`-nak: ezt hallják a képernyőolvasót használók.
- A `className` `'progress__item'`-ként indul, és bővül: `is-done` a jelenlegi előtti lépéseknek, `is-current` a
  jelenleginek. Ezek alapján színezi az `App.css` a köröket.
- Az [[aria-current]]`="step"` azt mondja a képernyőolvasónak: „ez a jelenlegi lépés”. A többi gombon `undefined`, és
  azt a React teljesen kihagyja.
- A jelenlegi lépés gombja le van tiltva, és minden olyan lépésé is, ami még nem érhető el. A `disabled` gombra nem
  lehet kattintani, az `App.css` pedig halványabbra rajzolja.
- A sáv szélessége [[inline stílus]] (7. lecke): a `style` egy objektumot kap, a `${percent}%` pedig a számból például
  `'50%'`-ot csinál.

Az összefoglalóban minden csoport kap egy „Módosítás” gombot, ami a lépésére visz. Cseréld le az
`src/steps/ReviewStep.jsx`-et:

```jsx file=src/steps/ReviewStep.jsx mark=9,44-51
import { FREQUENCIES, ROLES, TOPICS } from '../formData.js'

// Egy tárolt érték felirata, például 'student' → 'Diák'.
function labelOf(options, value) {
  const option = options.find((item) => item.value === value)
  return option ? option.label : ''
}

function ReviewStep({ values, onEdit }) {
  const sections = [
    {
      key: 'account',
      title: 'Fiók',
      rows: [
        ['E-mail-cím', values.email],
        ['Jelszó', values.password ? '••••••••' : ''],
      ],
    },
    {
      key: 'profile',
      title: 'Profil',
      rows: [
        ['Teljes név', values.fullName],
        ['Felhasználónév', values.username],
        ['Ki vagy?', labelOf(ROLES, values.role)],
      ],
    },
    {
      key: 'preferences',
      title: 'Érdeklődés',
      rows: [
        ['Témák', values.topics.map((topic) => labelOf(TOPICS, topic)).join(', ')],
        ['Hírlevél', labelOf(FREQUENCIES, values.frequency)],
      ],
    },
  ]

  return (
    <div className="summary">
      {sections.map((section) => (
        <section key={section.key} className="summary__section">
          <div className="summary__head">
            <h3>{section.title}</h3>
            <button
              type="button"
              className="link-button"
              aria-label={section.title + ' módosítása'}
              onClick={() => onEdit(section.key)}
            >
              Módosítás
            </button>
          </div>
          <dl>
            {section.rows.map(([label, value]) => (
              <div key={label} className="summary__row">
                <dt>{label}</dt>
                {/* Az üres válasz helyén gondolatjel áll, hogy a sor ne tűnjön hibásnak. */}
                <dd>{value || '–'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export default ReviewStep
```

Három „Módosítás” gomb a képernyőolvasónak egyformán hangzana, ezért az `aria-label` mindegyiknek teljes nevet ad
(„Profil módosítása”). Itt az `src/App.jsx` a középszint végén:

```jsx file=src/App.jsx mark=3-4,55-58,60-63,114,129
import { useRef, useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import { isStepValid, validateStep } from './validation.js'
import StepIndicator from './components/StepIndicator.jsx'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // melyik lépés látszik: 0 az első
  const [showErrors, setShowErrors] = useState(false) // igaz, ha ezen a lépésen már megnyomták a „Tovább”-ot
  const [touched, setTouched] = useState({}) // a mezők, amelyeket a felhasználó már elhagyott egyszer
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  // Minden rajzoláskor a válaszokból számoljuk: származtatott érték, nem állapot.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0

  // A látható üzenetek: a „Tovább” után mind, egyébként csak a már elhagyott mezőké.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // A mező elhagyása érintetté teszi: onnantól az üzenete követi a gépelést.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // Az üzenetes mező „érvénytelen”: a képernyőolvasó kimondja, a CSS pirosra rajzolja.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Minden lépésváltás ezen megy át: az új lépés piros üzenetek nélkül indul.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
  }

  // Egy lépés akkor nyitható meg, ha az összes előtte lévő helyesen ki van töltve.
  function canReach(index) {
    return STEPS.slice(0, index).every((s) => isStepValid(s.key, values))
  }

  // Az összefoglalóból: vissza az ilyen kulcsú lépésre.
  function editStep(key) {
    goTo(STEPS.findIndex((s) => s.key === key))
  }

  // A „Tovább” küldőgomb: a rá kattintás és bármelyik mezőben az Enter is ide fut be.
  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (hasErrors) {
      setShowErrors(true) // mutassuk az üzeneteket, és maradjunk ezen a lépésen
      // A kurzor az első javítandó mezőbe kerül.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // Újra üres űrlap, az első lépésen.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Üdv a Code Clubban, {values.fullName}!</h2>
          <p>Elkészült a fiókod. Egy igazi appban most egy megerősítő e-mail menne ide: {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Újrakezdés
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <StepIndicator steps={STEPS} current={step} canReach={canReach} onSelect={goTo} />

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            {step + 1}. lépés / {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'review' && <ReviewStep values={values} onEdit={editStep} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Javítsd ki a pirossal jelölt mezőket.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Vissza
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Fiók létrehozása' : 'Tovább'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- `canReach(index)`: a `STEPS.slice(0, index)` az adott lépés előtti lépések listája, az `every` ([[every]], 13. lecke)
  pedig akkor igaz, ha közülük mindegyik érvényes. Az első lépésnél a lista üres, és egy üres lista `every`-je `true`:
  az első lépés mindig megnyitható.
- A haladásjelző magát a `goTo`-t kapja `onSelect`-ként: egy lépésre kattintani ugyanaz, mint a gombokkal odalépni.
- Az `editStep` egy kulcsot kap az összefoglalótól, a `findIndex` pedig megkeresi, hányadik az ilyen kulcsú lépés.

:::concept Válaszok, amelyek a helyükön maradnak
Az ugrásokon látszik a legjobban, miért az `App`-ban élnek a válaszok. Menj az összefoglalóból a Fiókhoz, írd át az
e-mail-címet, és ugorj egyenesen vissza az Ellenőrzéshez: ott az új cím, és minden más is. Közben minden lépés lekerült
az oldalról, de egyik sem tartott magánál semmit: a `values` az `App`-ban van, az egyetlen komponensben, ami mindig a
képernyőn marad. A `touched` is ott él, ezért egy korábban elhagyott mező visszatéréskor is mutatja az üzenetét.
:::

:::check Ellenőrizd
Az űrlap fölött négy számozott lépés és egy sáv. Az első lépésen csak az 1-es kör színes, a 2–4. kör halvány: ezeket
még nem nyithatod meg. Töltsd ki helyesen a Fiók lépést: a 2-es kör már a Tovább előtt kattinthatóvá válik. Menj
tovább az Ellenőrzésig: három pipa, és tele a sáv. Kattints a Profil melletti „Módosítás”-ra: a 2. lépésen vagy, a
válaszaiddal. Kattints a haladásjelzőben a 4-esre: újra az Ellenőrzésen vagy. Kapcsold be a telefonos nézetet
(++F12++, aztán ++Ctrl++ + ++Shift++ + ++M++, Macen ++Cmd++ + ++Shift++ + ++M++): csak a számok maradnak. Kész a
középszint: commitold!
:::

:::mistake Gyakori hiba
`STEPS.slice(0, index + 1)` a `canReach`-ben. Ekkor a haladásjelző csak akkor nyit meg egy lépést, ha **ő maga** is
érvényes, egy még ki nem töltött lépés pedig sosem az: hiába töltöd ki helyesen a fiókot, a 2-es kör halvány marad, és
a következő lépésre csak a Tovább visz (az nem a `canReach`-et kérdezi).
:::

:::try Feladat
Az első lépésen a sáv üres, mintha a felhasználó még el sem kezdte volna. Írd át a számolást a `StepIndicator`-ban
erre: `((current + 1) / steps.length) * 100`. Így az első lépésen a sáv negyede telik meg, az utolsón pedig az egész.
Melyik tetszik jobban?
:::

## Haladó szint {level=3}

### Szabályok sémában

A `validateStep` működik, de egyetlen hosszú függvény, amiben minden lépés minden szabálya összekeveredik, és minden
szabálynak tudnia kell, melyik lépéshez tartozik. A nagyobb űrlapok másképp csinálják: leírják az adataikat. A
[[séma]] adatként, egyetlen helyen írja le, milyennek kell lennie az egyes mezőknek. Ehhez aztán az űrlap bármelyik
része hozzámérhető: a Tovább gombnál egy lépés mezői, küldés előtt pedig az egész űrlap.

Pontosan erre való a [[Zod]], a legismertebb sémakönyvtár. A legismertebb űrlapkönyvtár, a [[React Hook Form]] pedig
egy Zod-sémához tudja mérni a mezőit. Itt mi magunk írjuk meg ugyanennek az ötletnek egy kicsi változatát, hogy lásd,
mit csinálnak ezek a könyvtárak belül; utána egymás mellett látod, hogyan néz ki ugyanez velük.

Először minden lépés felsorolja a saját mezőit. Az `src/formData.js`-ben cseréld le a `STEPS`-et (a fájl többi része
marad):

```js file=src/formData.js
// A lépések sorrendben. A key a kódnak szól, a title a felhasználónak; a fields mezőit a „Tovább” ellenőrzi.
export const STEPS = [
  { key: 'account', title: 'Fiók', fields: ['email', 'password', 'confirm'] },
  { key: 'profile', title: 'Profil', fields: ['fullName', 'username', 'role'] },
  { key: 'preferences', title: 'Érdeklődés', fields: ['topics', 'frequency'] },
  { key: 'review', title: 'Ellenőrzés', fields: [] },
]
```

Aztán a szabályok. Cseréld le az egész `src/validation.js`-t:

```js file=src/validation.js
import { STEPS } from './formData.js'

// Valami, egy @, valami, egy pont, valami; és sehol egy szóköz.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// 3–20 karakter: betű, számjegy vagy _.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i

// A séma: minden mező szabályai egy helyen. Egy szabály egy teszt és egy üzenet:
// ha a teszt hamisat ad, az üzenet lesz a mező hibája.
const SCHEMA = {
  email: [
    { test: (value) => value.trim() !== '', message: 'Add meg az e-mail-címed.' },
    { test: (value) => EMAIL_PATTERN.test(value.trim()), message: 'Ez nem úgy néz ki, mint egy e-mail-cím.' },
  ],
  password: [
    { test: (value) => value.length >= 8, message: 'Legalább 8 karakter legyen.' },
    { test: (value) => /[a-z]/i.test(value) && /\d/.test(value), message: 'Legyen benne betű és számjegy is.' },
  ],
  confirm: [
    { test: (value) => value !== '', message: 'Írd be még egyszer a jelszót.' },
    // A második paraméter az egész űrlap, így egy szabály két mezőt is összehasonlíthat.
    { test: (value, values) => value === values.password, message: 'A két jelszó nem egyezik.' },
  ],
  fullName: [{ test: (value) => value.trim() !== '', message: 'Add meg a neved.' }],
  username: [{ test: (value) => USERNAME_PATTERN.test(value), message: '3–20 karakter: betű, számjegy vagy _.' }],
  role: [{ test: (value) => value !== '', message: 'Válassz egyet.' }],
  topics: [{ test: (value) => value.length > 0, message: 'Válassz legalább egy témát.' }],
}

// Néhány mező hibái { mezőnév: az első megsértett szabályának üzenete } alakban.
export function validateFields(fields, values) {
  const errors = {}
  for (const name of fields) {
    const rules = SCHEMA[name] ?? [] // a szabály nélküli mező (például a frequency) mindig rendben van
    const broken = rules.find((rule) => !rule.test(values[name], values))
    if (broken) errors[name] = broken.message
  }
  return errors
}

// Egy lépés hibái: a lépés maga sorolja fel a mezőit.
export function validateStep(stepKey, values) {
  const step = STEPS.find((s) => s.key === stepKey)
  return validateFields(step.fields, values)
}

// Igaz, ha a lépésnek nincs hibája.
export function isStepValid(stepKey, values) {
  return Object.keys(validateStep(stepKey, values)).length === 0
}
```

- A `SCHEMA` minden mezőhöz szabályok listáját tartja. Egy szabály egy objektum egy `test` függvénnyel és egy
  `message`-dzsel. A `test` megkapja a mező értékét, és mellé az egész űrlapot is, így a `confirm` szabálya össze
  tudja hasonlítani a jelszóval.
- A `validateFields` végigmegy a megadott mezőkön, a `find` pedig az első olyan szabályt adja vissza, amelyiknek
  elbukik a tesztje: annak az üzenete lesz a hiba. Mezőnként egy üzenet elég; a következő akkor jön, ha az elsőt
  kijavították.
- `SCHEMA[name] ?? []`: a `??` ([[nullish coalescing]], 13. lecke) a jobb oldalt adja, ha a bal oldal `null` vagy
  `undefined`. A szabály nélküli mező üres listát kap, így sosem lesz hibája.
- A jelszó új szabályt kapott (betű és számjegy is): a `/[a-z]/i` egy betűt keres benne, a `/\d/` egy számjegyet (a
  `\d` jelentése: „egy számjegy, 0–9”), és a teszt akkor igaz, ha mindkettő megvan. Egy sor a sémában, és semmi mást
  nem kellett hozzá átírni.
- A `validateStep` és az `isStepValid` neve és paraméterei maradtak, így az `App` egyáltalán nem változik. Nem tudja,
  hogyan zajlik az ellenőrzés, csak azt, hogy kérheti.

:::compare
```js label="A mi sémánk (egy része)" now
const SCHEMA = {
  email: [
    { test: (value) => value.trim() !== '', message: 'Add meg az e-mail-címed.' },
    { test: (value) => EMAIL_PATTERN.test(value.trim()), message: 'Ez nem úgy néz ki, mint egy e-mail-cím.' },
  ],
  password: [{ test: (value) => value.length >= 8, message: 'Legalább 8 karakter legyen.' }],
  confirm: [
    { test: (value, values) => value === values.password, message: 'A két jelszó nem egyezik.' },
  ],
}
```
```js label="Ugyanez Zoddal"
import { z } from 'zod'

const schema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Add meg az e-mail-címed.')
      .email('Ez nem úgy néz ki, mint egy e-mail-cím.'),
    password: z.string().min(8, 'Legalább 8 karakter legyen.'),
    confirm: z.string(),
  })
  .refine((data) => data.confirm === data.password, {
    message: 'A két jelszó nem egyezik.',
    path: ['confirm'],
  })

// { success: true, data } vagy { success: false, error }, az error.issues-ban minden hibával
const result = schema.safeParse(values)
```
:::

A Zodban a szabályok egymás után láncolódnak: a `z.string()` jelentése „szöveg”, a `.min(1, …)` jelentése „legalább egy
karakter”, az `.email(…)` jelentése „e-mail-cím”, mindegyik a saját üzenetével. A két mezőt összehasonlító szabály a
`refine` segítségével az egész objektumra kerül, a `path` pedig megmondja, melyik mező kapja az üzenetét. A Zodnak
mindenhez van kész szabálya (számok, dátumok, listák…), és a TypeScriptnek, a JavaScript típusos változatának is
megmondja, milyen az adat.

A React Hook Form egy ilyen sémát köt a mezőkhöz. A `register`-e ugyanazt csinálja, mint a miénk: mindent megad, ami
egy mezőnek kell, és ugyanazzal a három ponttal terítjük szét a mezőn:

:::compare
```jsx label="A mi App-unk (egy része)" now
const errors = validateStep(current.key, values)

function register(name) {
  return {
    name,
    value: values[name],
    onChange: (event) => setField(name, event.target.value),
    onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
  }
}
```
```jsx label="React Hook Formmal"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function SignupForm() {
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: INITIAL_VALUES })
  const [step, setStep] = useState(0)

  // „Tovább”: csak ennek a lépésnek a mezőit ellenőrzi; a trigger true-t ad, ha rendben vannak.
  async function next() {
    if (await trigger(['email', 'password', 'confirm'])) setStep(step + 1)
  }

  return <input type="email" {...register('email')} />
}
```
:::

A `resolver: zodResolver(schema)` egy kis illesztő a `@hookform/resolvers` csomagból: ezzel ellenőrzi a React Hook Form
a mezőit egy Zod-sémával. A `mode: 'onTouched'` a mi „hibaüzenet a megfelelő pillanatban” szabályunk, a
`trigger(fields)` pedig csak a megadott mezőket ellenőrzi, pont mint a lépéseink `fields` listája. A nagy különbség
belül van: a React Hook Form nem tartja állapotban a válaszokat. Ref-eken keresztül egyenesen a mezőkből olvassa ki őket
([[nem vezérelt mezők|nem vezérelt mező]], 4. lecke), így egy leütés nem rajzolja újra az egész űrlapot. Egy ilyen kis
űrlapnál ez nem számít; egy százmezősnél már igen. Egy igazi projektben a három csomagot az
`npm install react-hook-form zod @hookform/resolvers` paranccsal telepítenéd. Itt a saját változatunknál maradunk: most
már tudod, mit csinálnak.

:::check Ellenőrizd
Minden ugyanúgy működik, mint eddig. Egy újdonság: írd be jelszónak az `abcdefgh`-t, és lépj ki a mezőből (++Tab++):
„Legyen benne betű és számjegy is.” Kattints vissza, és írd át `abcd1234`-re: az üzenet eltűnik. (Az üres „Jelszó még
egyszer” mező alatt is megjelenik egy üzenet: azt is elhagytad.)
:::

:::mistake Gyakori hiba
Egy mező kimarad egy lépés `fields` listájából, például a `confirm`. A szabályai ott vannak a sémában, de senki nem
futtatja le őket: a két jelszó különbözhet, és a Tovább szó nélkül továbbenged.
:::

:::try Feladat
A 40 karakternél hosszabb név gyanús. Adj egy második szabályt a `fullName`-hez, `value.trim().length <= 40`
teszttel és saját üzenettel.
:::

:::try Feladat (nem kötelező): az igazi könyvtárak
Kipróbálnád élesben is a Zodot és a React Hook Formot? Telepítsd őket a projektedbe az
`npm install react-hook-form zod @hookform/resolvers` paranccsal, és készíts egy kis gyakorló űrlapot, csak a fiók
lépés három mezőjével. Hozd létre az `src/AccountDemo.jsx` fájlt:

```jsx file=src/AccountDemo.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Field from './components/Field.jsx'
import './App.css'

const schema = z
  .object({
    email: z.string().trim().min(1, 'Add meg az e-mail-címed.').email('Ez nem úgy néz ki, mint egy e-mail-cím.'),
    password: z.string().min(8, 'Legalább 8 karakter legyen.'),
    confirm: z.string(),
  })
  .refine((data) => data.confirm === data.password, {
    message: 'A két jelszó nem egyezik.',
    path: ['confirm'],
  })

function AccountDemo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched' })

  // A handleSubmit csak akkor hívja meg, ha minden mező rendben van: a data az ellenőrzött válaszokat tartja.
  function onValid(data) {
    console.log('Rendben:', data)
  }

  return (
    <main className="signup">
      <form className="signup__form" onSubmit={handleSubmit(onValid)} noValidate>
        <Field label="E-mail-cím" error={errors.email?.message}>
          <input type="email" {...register('email')} />
        </Field>
        <Field label="Jelszó" error={errors.password?.message}>
          <input type="password" {...register('password')} />
        </Field>
        <Field label="Jelszó még egyszer" error={errors.confirm?.message}>
          <input type="password" {...register('confirm')} />
        </Field>
        <button type="submit" className="button">
          Ellenőrzés
        </button>
      </form>
    </main>
  )
}

export default AccountDemo
```

A React Hook Formban egy hiba egy objektum, a szövege a `message`-ben van; a mi `Field`-ünk változtatás nélkül működik
vele. Amíg kísérletezel, ezt az űrlapot rajzold ki az `App` helyett: az `src/main.jsx`-ben írd át az
`import App from './App.jsx'` sort erre: `import App from './AccountDemo.jsx'`. Hagyd el a mezőket, gépelj, nyomd meg
az Ellenőrzés gombot, és figyeld a konzolt (++F12++). Ha végeztél, állítsd vissza az importot.
:::

### Egy lépés, ami csak akkor jön, ha kell

A Code Clubnak vannak mentorai. Az Érdeklődés lépés végén megjelenik egy új jelölőnégyzet: „Szeretnék mentort”. Ha
bejelölik, az összefoglaló előtt megjelenik egy plusz lépés, ahol a felhasználó leírja, mit tanulna szívesen, és mennyi
ideje van rá. Az olyan lépés, amit csak a felhasználók egy része kap meg, [[feltételes lépés]].

A lépések listája, amin a felhasználónak végig kell mennie, többé nem rögzített: a válaszoktól függ. Így ez is
származtatott érték lesz. Egy lépésnek lehet `showIf` függvénye: ha van neki, a lépés csak akkor látszik, ha a
függvény `true`-t ad vissza a mostani válaszokra. Itt az egész `src/formData.js`:

```js file=src/formData.js mark=11-13,17,21-22,26-29,53-57
// Az űrlap minden mezője a kezdőértékével: az egész űrlap egyetlen objektum.
export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '', // a jelszó még egyszer
  fullName: '',
  username: '',
  role: '',
  topics: [], // több téma is bejelölhető, ezért ez egy tömb
  frequency: 'weekly',
  wantsMentor: false,
  goal: '',
  hours: '',
}

// A lépések sorrendben. A key a kódnak szól, a title a felhasználónak; a fields mezőit a „Tovább” ellenőrzi.
// A showIf-es lépés csak akkor jelenik meg, ha a showIf igazat ad a válaszokra.
export const STEPS = [
  { key: 'account', title: 'Fiók', fields: ['email', 'password', 'confirm'] },
  { key: 'profile', title: 'Profil', fields: ['fullName', 'username', 'role'] },
  { key: 'preferences', title: 'Érdeklődés', fields: ['topics', 'frequency', 'wantsMentor'] },
  { key: 'mentor', title: 'Mentor', fields: ['goal', 'hours'], showIf: (values) => values.wantsMentor },
  { key: 'review', title: 'Ellenőrzés', fields: [] },
]

// A lépések, amelyeken ennek a felhasználónak ezekkel a válaszokkal végig kell mennie.
export function visibleSteps(values) {
  return STEPS.filter((step) => !step.showIf || step.showIf(values))
}

// A „Ki vagy?” lehetőségei: a value-t tároljuk, a label-t látja a felhasználó.
export const ROLES = [
  { value: 'student', label: 'Diák' },
  { value: 'developer', label: 'Fejlesztő' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Valami más' },
]

export const TOPICS = [
  { value: 'react', label: 'React' },
  { value: 'css', label: 'CSS' },
  { value: 'games', label: 'Játékok' },
  { value: 'a11y', label: 'Akadálymentesség' },
  { value: 'design', label: 'UI-design' },
]

export const FREQUENCIES = [
  { value: 'daily', label: 'Naponta' },
  { value: 'weekly', label: 'Hetente' },
  { value: 'monthly', label: 'Havonta' },
]

export const HOURS = [
  { value: '1-2', label: 'Heti 1–2 óra' },
  { value: '3-5', label: 'Heti 3–5 óra' },
  { value: '6+', label: 'Heti 5 óránál több' },
]
```

A `!step.showIf || step.showIf(values)` így olvasandó: „a lépésnek nincs `showIf`-je, **vagy** a `showIf`-je igent
mond”. Egy függvény ugyanúgy eltehető egy objektumba, mint bármilyen más érték, és később meghívható.

A két új mezőnek szabályok kellenek. Az `src/validation.js`-ben a `SCHEMA`-ba, a `topics` után, írd be ezt a két
bejegyzést:

```js file=src/validation.js
  goal: [{ test: (value) => value.trim().length >= 10, message: 'Írj legalább 10 karaktert.' }],
  hours: [{ test: (value) => value !== '', message: 'Válassz egyet.' }],
```

Hozd létre a mentorlépést, az `src/steps/MentorStep.jsx` fájlt. A `<textarea>` ([[szövegterület|textarea]], 5. lecke)
is `value`-t és `onChange`-et kap, így a `register` neki is jó:

```jsx file=src/steps/MentorStep.jsx
import Field from '../components/Field.jsx'
import { HOURS } from '../formData.js'

function MentorStep({ register, errors }) {
  return (
    <div className="step">
      <Field label="Mit tanulnál szívesen egy mentorral?" error={errors.goal}>
        <textarea rows={4} {...register('goal')} />
      </Field>
      <Field label="Mennyi időt tudsz rászánni?" error={errors.hours}>
        <select {...register('hours')}>
          <option value="">Válassz egyet</option>
          {HOURS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}

export default MentorStep
```

A doboz az Érdeklődés lépés végére kerül. Cseréld le az `src/steps/PreferencesStep.jsx`-et:

```jsx file=src/steps/PreferencesStep.jsx mark=51-59
import { FREQUENCIES, TOPICS } from '../formData.js'

function PreferencesStep({ values, setField, errors }) {
  // Bejelöléskor a téma bekerül a tömbbe, a pipa kivételekor kikerül belőle; mindkétszer új tömb készül.
  function toggleTopic(topic) {
    if (values.topics.includes(topic)) {
      setField('topics', values.topics.filter((item) => item !== topic))
    } else {
      setField('topics', [...values.topics, topic])
    }
  }

  return (
    <div className="step">
      <fieldset className="choices">
        <legend>Ezek a témák érdekelnek</legend>
        <div className="choices__list">
          {TOPICS.map((topic) => (
            <label key={topic.value} className="chip">
              <input
                type="checkbox"
                name="topics"
                checked={values.topics.includes(topic.value)}
                onChange={() => toggleTopic(topic.value)}
              />
              {topic.label}
            </label>
          ))}
        </div>
        {errors.topics && <p className="field__error">{errors.topics}</p>}
      </fieldset>

      <fieldset className="choices">
        <legend>Klubhírlevél</legend>
        <div className="choices__list">
          {FREQUENCIES.map((option) => (
            <label key={option.value} className="chip">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={values.frequency === option.value}
                onChange={() => setField('frequency', option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="check">
        <input
          type="checkbox"
          name="wantsMentor"
          checked={values.wantsMentor}
          onChange={(event) => setField('wantsMentor', event.target.checked)}
        />
        Szeretnék mentort (egy rövid lépéssel több)
      </label>
    </div>
  )
}

export default PreferencesStep
```

Egy önálló jelölőnégyzet az `event.target.checked`-ben mondja meg, be van-e pipálva, így a `setField` `true`-t vagy
`false`-t kap.

Végül az `App`: a rögzített `STEPS` helyett mindenhol a látható lépésekkel dolgozik. Cseréld le az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=2,8,20-23,60,65,117,122,132
import { useRef, useState } from 'react'
import { INITIAL_VALUES, visibleSteps } from './formData.js'
import { isStepValid, validateStep } from './validation.js'
import StepIndicator from './components/StepIndicator.jsx'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import MentorStep from './steps/MentorStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // melyik lépés látszik: 0 az első
  const [showErrors, setShowErrors] = useState(false) // igaz, ha ezen a lépésen már megnyomták a „Tovább”-ot
  const [touched, setTouched] = useState({}) // a mezők, amelyeket a felhasználó már elhagyott egyszer
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)

  // A lépések, amelyeken ennek a felhasználónak végig kell mennie: a mentorlépés csak, ha kért mentort.
  const steps = visibleSteps(values)
  const current = steps[step]
  const isLast = step === steps.length - 1
  // Minden rajzoláskor a válaszokból számoljuk: származtatott érték, nem állapot.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0

  // A látható üzenetek: a „Tovább” után mind, egyébként csak a már elhagyott mezőké.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // A mező elhagyása érintetté teszi: onnantól az üzenete követi a gépelést.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // Az üzenetes mező „érvénytelen”: a képernyőolvasó kimondja, a CSS pirosra rajzolja.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Minden lépésváltás ezen megy át: az új lépés piros üzenetek nélkül indul.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
  }

  // Egy lépés akkor nyitható meg, ha az összes előtte lévő helyesen ki van töltve.
  function canReach(index) {
    return steps.slice(0, index).every((s) => isStepValid(s.key, values))
  }

  // Az összefoglalóból: vissza az ilyen kulcsú lépésre.
  function editStep(key) {
    goTo(steps.findIndex((s) => s.key === key))
  }

  // A „Tovább” küldőgomb: a rá kattintás és bármelyik mezőben az Enter is ide fut be.
  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (hasErrors) {
      setShowErrors(true) // mutassuk az üzeneteket, és maradjunk ezen a lépésen
      // A kurzor az első javítandó mezőbe kerül.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // Újra üres űrlap, az első lépésen.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Üdv a Code Clubban, {values.fullName}!</h2>
          <p>Elkészült a fiókod. Egy igazi appban most egy megerősítő e-mail menne ide: {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Újrakezdés
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <StepIndicator steps={steps} current={step} canReach={canReach} onSelect={goTo} />

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            {step + 1}. lépés / {steps.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'mentor' && <MentorStep register={register} errors={shownErrors} />}
        {current.key === 'review' && <ReviewStep values={values} onEdit={editStep} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Javítsd ki a pirossal jelölt mezőket.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Vissza
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Fiók létrehozása' : 'Tovább'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

Ahol eddig a `STEPS` állt, ott most a `steps`: a haladásjelzőnél, a „3. lépés / 5” sorban, az `isLast`-ban, a
`canReach`-ben és az `editStep`-ben. A haladásjelző magától kap egy körrel többet vagy kevesebbet, hiszen csak azt
rajzolja ki, amit kap. Az elrejtett lépés mezőit senki nem ellenőrzi: a `canReach` és a Tovább is csak a látható
lépéseket nézi.

:::check Ellenőrizd
Az Érdeklődés lépésen pipáld be a „Szeretnék mentort” dobozt: a haladásjelző kap egy ötödik kört, Mentor, a sor pedig
azt írja: „3. lépés / 5”. A Tovább a mentorlépésre visz. Ha itt üresen nyomod meg a Tovább gombot, két üzenet jelenik
meg. Menj vissza az Érdeklődéshez, és vedd ki a pipát: megint négy kör van.
:::

:::mistake Gyakori hiba
Egy ott felejtett `STEPS` az `App`-ban, például a `{step + 1}. lépés / {STEPS.length}` sorban. Ha az importból már
kivetted, az oldal üres lesz, a konzolban (++F12++) pedig „STEPS is not defined” hibát látsz. Ha az importban is bent
maradt, a sor akkor is „/ 5”-öt ír, amikor a mentorlépés rejtve van, a haladásjelző pedig csak négy kört mutat. Ha egy
érték származtatott, az oldal minden részének a származtatottat kell használnia.
:::

### A mentor az összefoglalóban

Az összefoglaló még csak a három rögzített csoportját mutatja: a mentorról nem tud semmit. Most egy Mentor csoportot
is kap, de csak akkor, ha a felhasználó kért mentort. Cseréld le az `src/steps/ReviewStep.jsx`-et:

```jsx file=src/steps/ReviewStep.jsx mark=1,34,39-49
import { FREQUENCIES, HOURS, ROLES, TOPICS } from '../formData.js'

// Egy tárolt érték felirata, például 'student' → 'Diák'.
function labelOf(options, value) {
  const option = options.find((item) => item.value === value)
  return option ? option.label : ''
}

function ReviewStep({ values, onEdit }) {
  const sections = [
    {
      key: 'account',
      title: 'Fiók',
      rows: [
        ['E-mail-cím', values.email],
        ['Jelszó', values.password ? '••••••••' : ''],
      ],
    },
    {
      key: 'profile',
      title: 'Profil',
      rows: [
        ['Teljes név', values.fullName],
        ['Felhasználónév', values.username],
        ['Ki vagy?', labelOf(ROLES, values.role)],
      ],
    },
    {
      key: 'preferences',
      title: 'Érdeklődés',
      rows: [
        ['Témák', values.topics.map((topic) => labelOf(TOPICS, topic)).join(', ')],
        ['Hírlevél', labelOf(FREQUENCIES, values.frequency)],
        ['Mentor', values.wantsMentor ? 'Igen, kérek' : 'Nem, köszönöm'],
      ],
    },
  ]

  // Csoport a feltételes lépésnek, csak ha megjelent.
  if (values.wantsMentor) {
    sections.push({
      key: 'mentor',
      title: 'Mentor',
      rows: [
        ['Cél', values.goal],
        ['Idő', labelOf(HOURS, values.hours)],
      ],
    })
  }

  return (
    <div className="summary">
      {sections.map((section) => (
        <section key={section.key} className="summary__section">
          <div className="summary__head">
            <h3>{section.title}</h3>
            <button
              type="button"
              className="link-button"
              aria-label={section.title + ' módosítása'}
              onClick={() => onEdit(section.key)}
            >
              Módosítás
            </button>
          </div>
          <dl>
            {section.rows.map(([label, value]) => (
              <div key={label} className="summary__row">
                <dt>{label}</dt>
                {/* Az üres válasz helyén gondolatjel áll, hogy a sor ne tűnjön hibásnak. */}
                <dd>{value || '–'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export default ReviewStep
```

A `sections.push(…)` helyben módosítja a tömböt, és ez itt rendben van: a `sections` nem állapot, hanem egy vadonatúj
tömb, amit ez a rajzolás most készített magának.

:::check Ellenőrizd
Töltsd ki a mentorlépést, és menj tovább: az összefoglalóban megjelenik egy Mentor csoport, az Érdeklődés csoportban
pedig egy „Mentor: Igen, kérek” sor. Ugorj vissza az Érdeklődéshez, vedd ki a pipát, és menj újra az Ellenőrzésig: a
Mentor csoport eltűnt, a sorban pedig „Nem, köszönöm” áll.
:::

:::try Próbáld ki
Csak diákoknak ajánlj mentort: írd át a mentorlépés `showIf`-jét így:
`(values) => values.wantsMentor && values.role === 'student'`, és regisztrálj fejlesztőként, bepipált dobozzal. A lépés
nem jelenik meg, az összefoglalóban viszont ott a gondolatjelekkel teli Mentor csoport: a `ReviewStep` a
`values.wantsMentor`-t kérdezi, nem a lépéseket. Hogyan javítanád? (Egy megoldás: a `PreferencesStep`-ben feltételes
megjelenítéssel rejtsd el a dobozt, ha a `values.role` nem `'student'`.)
:::

### Piszkozat mentése

Képzeld el, hogy valaki a harmadik lépésnél véletlenül bezárja a lapot: minden, amit beírt, elvész, és kezdheti
elölről. Sok űrlap gépelés közben [[piszkozat]]ot ment, és amikor visszajössz, újra kitölti a mezőket. Erre jó a
`localStorage` (9. lecke). Egyet viszont sosem mentünk el: a jelszavakat, mert bárki elolvashatná őket, aki ugyanazt a
böngészőt használja.

A piszkozat saját kis fájlt kap. Hozd létre az `src/draft.js` fájlt:

```js file=src/draft.js
import { INITIAL_VALUES } from './formData.js'

const DRAFT_KEY = 'code-club:draft'

// Elmenti a válaszokat, de a jelszavakat soha: bárki elolvashatná őket, aki ezt a böngészőt használja.
export function saveDraft(values) {
  const { password, confirm, ...rest } = values
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest))
  } catch {
    // tele a tárhely vagy le van tiltva: az űrlap működik, csak a piszkozat vész el
  }
}

// A mentett piszkozat (üres jelszavakkal), vagy null, ha nincs.
export function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved !== null) return { ...INITIAL_VALUES, ...JSON.parse(saved) }
  } catch {
    // sérült adat vagy letiltott tárhely: üres űrlappal indulunk
  }
  return null
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // letiltott tárhely: nincs mit törölni
  }
}
```

- A `const { password, confirm, ...rest } = values` objektum-destrukturálás [[maradék mintával|maradék minta]] (rest):
  a `password` és a `confirm` mezőt két változóba veszi ki, a `rest` pedig minden más másolatát kapja. A két változóra
  nincs szükségünk: csak azért vannak ott, hogy a `rest`-ből kimaradjanak.
- A `{ ...INITIAL_VALUES, ...JSON.parse(saved) }` először az üres űrlapot teríti szét, aztán rá a mentett válaszokat.
  Így a jelszavak megint üres szövegek (`''`) lesznek, és egy olyan mező is megkapja a kezdőértékét, ami a mentéskor
  még nem létezett.
- A `localStorage` hibát dobhat (tele a tárhely, privát mód, letiltott oldaladatok), ezért minden használata
  `try/catch`-ben van, mint a 9. leckében.

Az `App`-ban három dolog változik: a `values` első értéke a piszkozatból jön, egy effekt menti a válaszokat, és egy
üzenet jelzi a felhasználónak, hogy visszakapta a piszkozatát. Cseréld le az `src/App.jsx`-et:

```jsx file=src/App.jsx mark=1,4,14-17,38-43,67,91,98-104,138-145
import { useEffect, useRef, useState } from 'react'
import { INITIAL_VALUES, visibleSteps } from './formData.js'
import { isStepValid, validateStep } from './validation.js'
import { clearDraft, loadDraft, saveDraft } from './draft.js'
import StepIndicator from './components/StepIndicator.jsx'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import MentorStep from './steps/MentorStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  // A piszkozatot csak egyszer, a legelső rajzoláskor olvassuk be.
  const [draft] = useState(loadDraft)
  const [values, setValues] = useState(draft ?? INITIAL_VALUES)
  const [showNotice, setShowNotice] = useState(draft !== null) // „Üdv újra” csak visszatöltött piszkozat után
  const [step, setStep] = useState(0) // melyik lépés látszik: 0 az első
  const [showErrors, setShowErrors] = useState(false) // igaz, ha ezen a lépésen már megnyomták a „Tovább”-ot
  const [touched, setTouched] = useState({}) // a mezők, amelyeket a felhasználó már elhagyott egyszer
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)

  // A lépések, amelyeken ennek a felhasználónak végig kell mennie: a mentorlépés csak, ha kért mentort.
  const steps = visibleSteps(values)
  const current = steps[step]
  const isLast = step === steps.length - 1
  // Minden rajzoláskor a válaszokból számoljuk: származtatott érték, nem állapot.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0

  // A látható üzenetek: a „Tovább” után mind, egyébként csak a már elhagyott mezőké.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Fél másodperccel az utolsó változás után a válaszok a localStorage-ba kerülnek.
  useEffect(() => {
    if (values === INITIAL_VALUES) return // még semmit nem írtak be: nincs mit menteni
    const timer = setTimeout(() => saveDraft(values), 500)
    return () => clearTimeout(timer) // ha fél másodpercen belül újra gépelnek, a korábbi mentés elmarad
  }, [values])

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // A mező elhagyása érintetté teszi: onnantól az üzenete követi a gépelést.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // Az üzenetes mező „érvénytelen”: a képernyőolvasó kimondja, a CSS pirosra rajzolja.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Minden lépésváltás ezen megy át: az új lépés piros üzenetek nélkül indul.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
    setShowNotice(false)
  }

  // Egy lépés akkor nyitható meg, ha az összes előtte lévő helyesen ki van töltve.
  function canReach(index) {
    return steps.slice(0, index).every((s) => isStepValid(s.key, values))
  }

  // Az összefoglalóból: vissza az ilyen kulcsú lépésre.
  function editStep(key) {
    goTo(steps.findIndex((s) => s.key === key))
  }

  // A „Tovább” küldőgomb: a rá kattintás és bármelyik mezőben az Enter is ide fut be.
  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (hasErrors) {
      setShowErrors(true) // mutassuk az üzeneteket, és maradjunk ezen a lépésen
      // A kurzor az első javítandó mezőbe kerül.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      clearDraft() // kész az űrlap: a piszkozatra már nincs szükség
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // Eldobja a piszkozatot, és üres űrlappal indul.
  function discardDraft() {
    clearDraft()
    setValues(INITIAL_VALUES)
    setTouched({})
    setShowNotice(false)
  }

  // Újra üres űrlap, az első lépésen.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Üdv a Code Clubban, {values.fullName}!</h2>
          <p>Elkészült a fiókod. Egy igazi appban most egy megerősítő e-mail menne ide: {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Újrakezdés
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      {showNotice && (
        <div className="signup__notice">
          <p>Üdv újra! Visszatöltöttük, amit legutóbb beírtál. A jelszót sosem mentjük, ezért azt írd be újra.</p>
          <button type="button" className="link-button" onClick={discardDraft}>
            Piszkozat elvetése
          </button>
        </div>
      )}

      <StepIndicator steps={steps} current={step} canReach={canReach} onSelect={goTo} />

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            {step + 1}. lépés / {steps.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'mentor' && <MentorStep register={register} errors={shownErrors} />}
        {current.key === 'review' && <ReviewStep values={values} onEdit={editStep} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Javítsd ki a pirossal jelölt mezőket.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Vissza
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Fiók létrehozása' : 'Tovább'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- A `useState(loadDraft)` magát a függvényt kapja, zárójelek nélkül: ez [[lusta kezdőérték]] (3. lecke), így a React
  csak egyszer, az első rajzoláskor olvassa a `localStorage`-ot. Az eredménye, a `draft`, a `values` kezdőértéke (a
  `??` az `INITIAL_VALUES`-t adja, ha nincs piszkozat), és ez dönti el, megjelenik-e az üzenet.
- Az effekt a `values` minden változása után lefut. Nem ment azonnal: elindít egy időzítőt, és ha a felhasználó fél
  másodpercen belül újra gépel, a [[takarító függvény]] leállítja, és indul egy új. Így a `localStorage`-ba csak akkor
  írunk, amikor a gépelés abbamaradt: ez a 20. lecke keresőmezőjéből ismert [[debounce]].
- A `values === INITIAL_VALUES` csak addig igaz, amíg semmit nem írtak be: a `setField` mindig **új** objektumot
  csinál, a `===` pedig az objektumokat azonosság szerint hasonlítja össze, nem tartalom szerint. Így egy friss
  látogatás nem ment üres piszkozatot.
- A jelszavak nincsenek a piszkozatban, ezért az űrlap megint az első lépésen indul: a felhasználó beírja a jelszavát,
  a többi válasza pedig már várja. Az üzenet az első lépésváltáskor (`goTo`) eltűnik.
- Sikeres regisztráció után a piszkozat törlődik: a böngésző következő használója üres űrlapot kap.

:::check Ellenőrizd
Töltsd ki az első két lépést, és töltsd újra az oldalt (++F5++). Egy zöld sáv azt írja: „Üdv újra!”, minden mező újra ki
van töltve a két jelszó kivételével, és az 1. lépésen vagy. Nyisd meg a fejlesztői eszközöket (++F12++) → Application →
Local storage: a `code-club:draft` kulcs a válaszaidat tartja, jelszó nélkül. A „Piszkozat elvetése” kiüríti az
űrlapot.
:::

:::mistake Gyakori hiba
`useState(loadDraft())`, zárójellel. Működik, de a `loadDraft` így minden rajzoláskor, vagyis minden leütéskor lefut,
és minden alkalommal kiolvassa és feldolgozza a `localStorage`-ot, csak hogy aztán a React eldobja az eredményt.
Zárójelek nélkül a React csak egyszer hívja meg.
:::

### Küldés a szerverre

Az utolsó darab: egy igazi regisztrációs űrlap a válaszait egy [[szerver]]nek küldi, ami elmenti az új fiókot, és
válaszol. Ehhez a kiinduló projektben kezdettől ott van egy kitalált szerver: az `src/fakeApi.js`. Úgy viselkedik,
mint egy igazi (minden kérés eltart egy darabig, és némelyik elbukik), de a böngészőben fut, és az „adatbázisa” egy
`localStorage`-kulcs. Így kell használni:

- A `createMockApi('code-club', { latency: [700, 1400], failRate: 0.25 })` létrehoz egy szervert: egy válasz 0,7–1,4
  másodpercig tart, és átlagosan minden negyedik kérés szándékosan elbukik, hogy lásd, mit csinál ilyenkor az
  űrlapod.
- Az `api.create('accounts', data)` elment egy új fiókot, a válasza pedig a mentett fiók, egy `id`-vel és egy
  `createdAt` dátummal: ezeket a szerver tette hozzá. [[Promise]]-t ad vissza, ezért `await` kell elé egy
  [[async függvényben|async függvény]], a hibát pedig a `try/catch` kapja el (14. lecke).

Az űrlapnak most már több állapota van, mint „kitöltés” és „kész”: amíg a kérés úton van, **küldés** zajlik, ha pedig
elbukik, **hiba** van. Hogy melyik, azt egyetlen állapotérték mondja meg, a `status`, mint a 14. leckében. A
`submitted` helyett pedig az `App` azt a fiókot tartja meg, amit a szerver visszaküldött. Itt a végleges
`src/App.jsx`:

```jsx file=src/App.jsx mark=5,14-15,25-26,36,71,75,88-101,114,133,136,143-147,156-157,199-203,207-212,216-217
import { useEffect, useRef, useState } from 'react'
import { INITIAL_VALUES, visibleSteps } from './formData.js'
import { isStepValid, validateStep } from './validation.js'
import { clearDraft, loadDraft, saveDraft } from './draft.js'
import { createMockApi } from './fakeApi.js'
import StepIndicator from './components/StepIndicator.jsx'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import MentorStep from './steps/MentorStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

// A kitalált szerver: kicsit lassú, és átlagosan minden negyedik kérés szándékosan elbukik.
const api = createMockApi('code-club', { latency: [700, 1400], failRate: 0.25 })

function App() {
  // A piszkozatot csak egyszer, a legelső rajzoláskor olvassuk be.
  const [draft] = useState(loadDraft)
  const [values, setValues] = useState(draft ?? INITIAL_VALUES)
  const [showNotice, setShowNotice] = useState(draft !== null) // „Üdv újra” csak visszatöltött piszkozat után
  const [step, setStep] = useState(0) // melyik lépés látszik: 0 az első
  const [showErrors, setShowErrors] = useState(false) // igaz, ha ezen a lépésen már megnyomták a „Tovább”-ot
  const [touched, setTouched] = useState({}) // a mezők, amelyeket a felhasználó már elhagyott egyszer
  const [status, setStatus] = useState('editing') // 'editing', 'sending' vagy 'error'
  const [account, setAccount] = useState(null) // az új fiók, amikor a szerver már elmentette
  const formRef = useRef(null)

  // A lépések, amelyeken ennek a felhasználónak végig kell mennie: a mentorlépés csak, ha kért mentort.
  const steps = visibleSteps(values)
  const current = steps[step]
  const isLast = step === steps.length - 1
  // Minden rajzoláskor a válaszokból számoljuk: származtatott érték, nem állapot.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0
  const sending = status === 'sending'

  // A látható üzenetek: a „Tovább” után mind, egyébként csak a már elhagyott mezőké.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Fél másodperccel az utolsó változás után a válaszok a localStorage-ba kerülnek.
  useEffect(() => {
    if (values === INITIAL_VALUES) return // még semmit nem írtak be: nincs mit menteni
    const timer = setTimeout(() => saveDraft(values), 500)
    return () => clearTimeout(timer) // ha fél másodpercen belül újra gépelnek, a korábbi mentés elmarad
  }, [values])

  // Egy mezőt módosít: új objektum az összes régi mezővel, és az új értékkel a mező neve alatt.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Minden, ami egy szövegmezőnek kell az állapotból: a neve, az értéke, és hogy mi legyen, ha megváltozik.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // A mező elhagyása érintetté teszi: onnantól az üzenete követi a gépelést.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // Az üzenetes mező „érvénytelen”: a képernyőolvasó kimondja, a CSS pirosra rajzolja.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Minden lépésváltás ezen megy át: az új lépés piros üzenetek nélkül indul.
  function goTo(index) {
    if (sending) return // küldés közben maradunk ezen a lépésen
    setStep(index)
    setShowErrors(false)
    setShowNotice(false)
    setStatus('editing')
  }

  // Egy lépés akkor nyitható meg, ha az összes előtte lévő helyesen ki van töltve.
  function canReach(index) {
    return steps.slice(0, index).every((s) => isStepValid(s.key, values))
  }

  // Az összefoglalóból: vissza az ilyen kulcsú lépésre.
  function editStep(key) {
    goTo(steps.findIndex((s) => s.key === key))
  }

  // Elküldi a válaszokat a szervernek, és megvárja a válaszát.
  async function sendForm() {
    setStatus('sending')
    try {
      // Az ismételt jelszó nem kell, az igazit pedig szándékosan kihagyjuk: ez a szerver titkosítatlanul tárolná.
      const { password, confirm, ...data } = values
      const saved = await api.create('accounts', data)
      clearDraft() // kész az űrlap: a piszkozatra már nincs szükség
      setAccount(saved)
      setStatus('editing')
    } catch {
      setStatus('error')
    }
  }

  // A „Tovább” küldőgomb: a rá kattintás és bármelyik mezőben az Enter is ide fut be.
  function handleSubmit(event) {
    event.preventDefault() // a böngésző ne töltse újra az oldalt
    if (hasErrors) {
      setShowErrors(true) // mutassuk az üzeneteket, és maradjunk ezen a lépésen
      // A kurzor az első javítandó mezőbe kerül.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      sendForm()
    } else {
      goTo(step + 1)
    }
  }

  // Eldobja a piszkozatot, és üres űrlappal indul.
  function discardDraft() {
    clearDraft()
    setValues(INITIAL_VALUES)
    setTouched({})
    setShowNotice(false)
  }

  // Újra üres űrlap, az első lépésen.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setAccount(null)
  }

  if (account) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Üdv a Code Clubban, {account.fullName}!</h2>
          <p>Elkészült a fiókod. Egy igazi appban most egy megerősítő e-mail menne ide: {account.email}.</p>
          <p>
            Fiókazonosító: <code>{account.id.slice(0, 8)}</code>
          </p>
          <button type="button" className="button" onClick={startOver}>
            Újrakezdés
          </button>
        </section>
      </main>
    )
  }

  let submitLabel = 'Tovább'
  if (isLast) submitLabel = sending ? 'Fiók létrehozása…' : 'Fiók létrehozása'

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      {showNotice && (
        <div className="signup__notice">
          <p>Üdv újra! Visszatöltöttük, amit legutóbb beírtál. A jelszót sosem mentjük, ezért azt írd be újra.</p>
          <button type="button" className="link-button" onClick={discardDraft}>
            Piszkozat elvetése
          </button>
        </div>
      )}

      <StepIndicator steps={steps} current={step} canReach={canReach} onSelect={goTo} />

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            {step + 1}. lépés / {steps.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'mentor' && <MentorStep register={register} errors={shownErrors} />}
        {current.key === 'review' && <ReviewStep values={values} onEdit={editStep} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Javítsd ki a pirossal jelölt mezőket.
          </p>
        )}

        {status === 'error' && (
          <p className="signup__alert" role="alert">
            Nem sikerült létrehozni a fiókot: a szerver nem válaszolt. Nyomd meg újra a „Fiók létrehozása” gombot.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button
              type="button"
              className="button button--ghost"
              disabled={sending}
              onClick={() => goTo(step - 1)}
            >
              Vissza
            </button>
          )}
          <button type="submit" className="button" disabled={sending}>
            {submitLabel}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- Az `api` az `App`-on kívül készül, egyszer, amikor a fájl betöltődik. Az `App`-on belül minden rajzolás új szervert
  csinálna.
- A `sendForm` először `'sending'`-re állítja a státuszt, aztán `await`-tel megvárja a szervert. Ha megjön a válasz, a
  piszkozat törlődik, az `account` pedig megkapja a mentett fiókot; ha a kérés elbukik, a kód a `catch`-be ugrik, és a
  státusz `'error'` lesz. A `handleSubmit` nem vár rá: csak elindítja a küldést.
- A `sending` a `status`-ból származik. Amíg igaz, mindkét gomb `disabled`, így egy gyors dupla kattintás sem hozhat
  létre két fiókot.
- Küldés közben a `goTo` nem csinál semmit: a haladásjelzővel és a „Módosítás” gombokkal sem lehet elmenni a
  lépésről, és visszajönni egy újra bekapcsolt gombhoz.
- A hibaüzenet megmondja, mit tegyen a felhasználó: ugyanaz a „Fiók létrehozása” gomb újrapróbálja. A `goTo` pedig
  visszaállítja a státuszt `'editing'`-re, így a piros doboz eltűnik, ha a felhasználó másik lépésre megy.
- Az `account.id.slice(0, 8)` a szerver által gyártott hosszú azonosító első nyolc karakterét mutatja.

:::concept Miért nem küldjük el a jelszót?
Egy igazi szerver `https://` kapcsolaton kapná meg a jelszót, és csak a [[hash]]-ét tárolná (3. lecke): egy
ujjlenyomatot, amiből a jelszót nem lehet visszafejteni. A mi kitalált szerverünk mindent a `localStorage`-ba ír,
titkosítatlanul, ahol bárki elolvashatná, aki ezt a böngészőt használja. Ezért szándékosan kihagyjuk a jelszót;
egy igazi appban benne lenne a `data`-ban. Az ismételt jelszót (`confirm`) pedig sosem küldjük el: csak az elgépelést
szűri ki, és mire az űrlap elmegy, már elvégezte a dolgát.
:::

:::check Ellenőrizd
Menj végig az egész űrlapon, és nyomd meg a „Fiók létrehozása” gombot: nagyjából egy másodpercig a gomb azt írja, „Fiók
létrehozása…”, és mindkét gomb halvány. Aztán: „Üdv a Code Clubban, …!”, egy fiókazonosítóval. Néha (átlagosan minden
negyedik alkalommal) egy piros doboz jelzi, hogy nem sikerült létrehozni a fiókot: nyomd meg újra a gombot. Sikeres
regisztráció után töltsd újra az oldalt: üres űrlap, és nincs „Üdv újra” üzenet, mert a piszkozat eltűnt. Gratulálok,
kész a többlépéses űrlapod!
:::

:::mistake Gyakori hiba
`const saved = api.create('accounts', data)`, `await` nélkül. Ekkor a `saved` nem a fiók, hanem az ígérete: a
`setAccount` a Promise-t kapja, az üdvözlőképernyő azonnal megjelenik, az `account.id.slice` pedig hibával megállítja
az oldalt, mert egy Promise-nak nincs `id`-je. Az `await`-tel a kód megvárja a szerver válaszát.
:::

:::try Próbáld ki
Állítsd a `createMockApi(…)` hívásban a `failRate`-et `1`-re: most minden kérés elbukik, és nyugodtan megnézheted a
hibaállapotot. Aztán próbáld ki `0`-val: minden kérés sikerül. Végül állítsd vissza `0.25`-re.
:::
