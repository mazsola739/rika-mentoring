# What we build

A currency converter: type an amount, choose what to convert from and to, and the page works it out at once. First we
use a fixed table of exchange rates of our own, then we ask a server for the rates, the way a real app would. This is
the first lesson in which your app talks to a server over the network: you learn how `fetch` asks for data, what the
page shows while it waits for the answer, and what it shows when the answer never comes. All of this becomes a
`useFetch` hook of your own, which you can reuse in later lessons.

:::levels
- An amount and two currencies, conversion at a fixed rate, with nicely formatted numbers. | about 2 hours
- Live rates from an API with your own `useFetch` hook, a swap button, loading and error states, the API address in a `.env` file. | about 3 hours
- A chart of the last 30 days, favourite currency pairs, and the last known rates from a cache when there is no connection. | about 3 hours
:::

**Before you start you need:** the earlier lessons. We build mostly on lesson 3 (`Promise`, `async`/`await`,
`try`/`catch`), lesson 5 (`then`, dropping stale answers with `ignore`), lessons 2, 6 and 9 (custom hooks, `useEffect`
with cleanup, `useLocalStorage`), lesson 11 (`Intl.DateTimeFormat`), lesson 12 (SVG) and lesson 13 (`??`, `<dl>`).
Wherever something familiar is used in a new way, we explain it again.

## Beginner level {level=1}

### Before you start

This lesson's exercise, a ready starting project, is in the course repository, in the
`lessons/14-currency-converter/exercise` folder (the "Exercise on GitHub" button above opens that folder on GitHub). You
start the same way as in lesson 1, and its step 0 explains every command in detail. In short: open a terminal in your
work folder, where the `rika-mentoring` repository is, bring in the new lessons, then copy this lesson's `exercise`
folder out of the repository as `currency-converter`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/14-currency-converter/exercise currency-converter
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/14-currency-converter/exercise` folder out of it into your work folder as `currency-converter`.
You work in your copy: the repository stays untouched, so `git pull` keeps working.

Open the `currency-converter` folder in your editor (in VS Code: **File** → **Open Folder**), open a terminal in it
(**Terminal** → **New Terminal**), and start the project:

```shell
npm install     # needed once: downloads the project's packages (React, Vite, Mock Service Worker)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page,
with the title "Currency Converter". There is nothing else on it yet: you build the converter yourself. If you open the
console (++F12++ → Console), you also see an orange-red `[MSW] Mocking enabled.` line: that is the pretend server you
can read about below.
:::

Leave the server running. In a second terminal (the **+** button of the terminal panel), make your copy a git
repository with one commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step
that works. If git asks who you are, step 0 of lesson 1 shows how to give it your name and e-mail.

The exercise has these files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. You do not write them, you only use the class names the steps
  give you (`converter`, `field`, `pair`, `result`, `status`, `chart`, …).
- `src/mocks/`: a pretend exchange-rate server. You do not need it in the beginner level; you meet it in the
  intermediate one.
- `src/main.jsx`: it has two more lines than in the earlier lessons: they start the pretend server before React.
- `public/mockServiceWorker.js`: one part of the pretend server. You never need to touch it.
- `package.json`: besides React and Vite, it lists the `msw` package; the pretend server runs on it.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]]. It gets data from outside through its [[props]], and remembers
things with [[useState]]: when a state value changes, React draws the component again. Work outside drawing goes into
[[useEffect]]. Anything that takes a while, like copying to the clipboard in lesson 3, returns a [[Promise]]: in an
[[async function]], `await` waits for it, and [[try/catch]] catches the error. The steps remind you of these briefly.
:::

### Fixed rates

An [[exchange rate]] tells you how much one currency is worth in another: for example, 1 euro = 373.55 forints. Banks
and rate services usually give every rate against one single currency, a [[base currency]]. Ours is the euro: our table
says how much **1 euro** is worth in each of the other currencies.

What if you want to change dollars into forints? You do not need a separate dollar–forint row for that: you can go
through the euro. 100 dollars are 100 / 1.099 = about 91 euros, and that is 91 × 373.55 = about 33,990 forints. In
short: 1 dollar = 373.55 / 1.099 forints, that is, the rate of the target currency divided by the rate of the starting
one. This is called a [[cross rate]].

This logic has nothing to do with React, so it goes into a file of its own. Create a `rates.js` file in the `src`
folder:

```js file=src/rates.js
// Fixed sample rates: how much 1 euro is worth in each of the other currencies.
// (The reference rates of a day in November 2026: fine for practice, not for real money.)
export const FIXED_RATES = {
  EUR: 1,
  USD: 1.099,
  GBP: 0.83735,
  CHF: 0.9223,
  JPY: 174.35,
  HUF: 373.55,
  PLN: 4.4583,
  CZK: 24.469,
  RON: 5.3493,
  SEK: 11.2125,
}

// How many units of `to` one unit of `from` is worth. Every rate is given against 1 euro,
// so we go through the euro: from → EUR → to.
export function getRate(from, to, rates) {
  return rates[to] / rates[from]
}
```

`FIXED_RATES` is an [[object]]: its keys are the international three-letter codes of the currencies (`EUR`, `USD`,
`HUF`…), and its values are the rates. `rates[to]` is the square-bracket access you saw in lesson 3: it gives the value
whose key is in the `to` variable. When `to` is `'HUF'`, `rates[to]` is the same as `rates.HUF`, that is, 373.55.

Change `src/App.jsx` to this (the highlighted lines are new):

```jsx file=src/App.jsx mark=1,5-6,11-15
import { FIXED_RATES, getRate } from './rates.js'
import './App.css'

function App() {
  const amount = 100
  const rate = getRate('EUR', 'HUF', FIXED_RATES)

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <section className="result">
        <p className="result__value">
          {amount} EUR = {amount * rate} HUF
        </p>
      </section>
    </main>
  )
}

export default App
```

:::check Check
Under the title, a dark blue box says "100 EUR = 37355 HUF".
:::

:::mistake Common mistake
Dividing the wrong way round: `rates[from] / rates[to]`. The box then says "100 EUR = 0.2677… HUF", as if 100 euros were
not worth a single forint. Think it through with a pair you know: 1 euro is a lot of forints, so the euro → forint rate
has to be a big number.
:::

:::try Try it
Change the call `getRate('EUR', 'HUF', FIXED_RATES)` to `getRate('USD', 'HUF', FIXED_RATES)` (and `EUR` to `USD` in the
JSX): you get something like "100 USD = 33989.99090081893 HUF". It is correct, just unreadable. In the last step of the
beginner level we turn it into a proper number. Then change it back.
:::

### The amount field

The user types the amount. That needs a [[controlled input]], as in the earlier lessons: its value comes from state,
and every keystroke updates the state. This time it is a number field: `<input type="number">`.

```jsx file=src/App.jsx mark=1,6,9-11,13-22,27-40
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const rate = getRate('EUR', 'HUF', FIXED_RATES)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  let result
  if (valid) {
    result = (
      <p className="result__value">
        {value} EUR = {value * rate} HUF
      </p>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <section className="result" aria-live="polite">
        {result}
      </section>
    </main>
  )
}

export default App
```

Let's go through it:

- The state is **text** (`'100'`), not a number, because the field gives text too: `event.target.value` is a string
  even in a number field. That way the field can also be emptied, and then its value is `''`. `Number(amount)` turns it
  into a number when we calculate with it.
- `valid` says whether we can calculate: the field is not empty, and the number is not negative. If someone types
  something that is not a number yet (for example `1e`), the number field gives `''`, and that is not valid either.
- `min="0"` stops the field's arrows at zero, `step="any"` allows decimals (without it the browser would only accept
  whole numbers), and `inputMode="decimal"` asks for a number keyboard on phones.
- The `result` variable holds JSX: an `if` decides what should appear, and the `return` simply shows it. This is
  another form of [[conditional rendering]]; soon there will be a third case, and then one more `else if` branch is
  easier to read than `? :` inside `? :`.
- `aria-live="polite"` asks screen readers to read out the new content of the box when it changes.

:::check Check
Under the title there is an "Amount" field with 100 in it. Type 250: the box says "250 EUR = 93387.5 HUF" straight
away. Empty the field, or type -5: the box shows "Enter an amount (0 or more)."
:::

:::mistake Common mistake
A number in state: `useState(100)` and `onChange={(event) => setAmount(Number(event.target.value))}`. It seems to work
at first, but try to empty the field: `Number('')` is 0, so a 0 pops up in the field at once, and it is never empty.
Keep in state what the field gives you, and turn it into a number only for the calculation.
:::

:::try Try it
Click into the field and press ++↑++ or ++↓++: the browser changes the amount one at a time, and the box recalculates
at every step.
:::

### Two currencies

Now the user chooses what to convert from and to. That is a job for a [[drop-down list]], a `<select>` whose choices
are `<option>` elements. In React it is a controlled input too: the selected item comes from `value`, and `onChange`
reports a change. We need two of them, the same except for the label and the value, so we write one component and use
it twice. Create a `components` folder inside `src`, with a `CurrencySelect.jsx` file in it:

```jsx file=src/components/CurrencySelect.jsx
function CurrencySelect({ label, value, codes, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {codes.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CurrencySelect
```

The list does not keep the choice itself: it shows the `value` it receives, and reports every change through the
`onChange` prop. The chosen currency lives in `App`, because the calculation needs it there ([[lifting state up]]).
`codes.map(…)` turns the array of codes into a list of `<option>`s, each with a unique [[key]].

`App` gets two new pieces of state, `from` and `to`. Here is the whole file:

```jsx file=src/App.jsx mark=3,8-9,11-15,25,47-50
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')

  // For now we always use the fixed table.
  const rates = FIXED_RATES
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  let result
  if (valid) {
    result = (
      <p className="result__value">
        {value} {from} = {value * rate} {to}
      </p>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
    </main>
  )
}

export default App
```

- `Object.keys(rates)` gives the keys of the table in an array: `['EUR', 'USD', 'GBP', …]`. `sort()` puts them in
  alphabetical order (as you saw in lesson 10, it sorts in place, but `Object.keys` gives a new array anyway, so that
  does no harm here).
- `const rates = FIXED_RATES` looks pointless now, but in the intermediate level the live table goes here. The lines
  below it already work with `rates`, so then only this one line has to change.
- `onChange={setFrom}` passes the setter itself: the list calls it with the chosen code, which is exactly what we need.
  It is the same as writing `onChange={(code) => setFrom(code)}`, only shorter.

:::check Check
Under the amount there are two lists side by side, "From" and "To", each with ten currencies in alphabetical order.
Choose USD → HUF. The box: "100 USD = 33989.99090081893 HUF". With the same currency on both sides, the result is the
amount itself.
:::

:::mistake Common mistake
Writing `selected` on the starting `<option>`, as in plain HTML. In React that does not work: the `value` of the
`<select>` decides which item is selected, and the console warns: "Use the `defaultValue` or `value` props on
`<select>` instead of setting `selected` on `<option>`".
:::

:::try Try it
Add a new currency to `FIXED_RATES`, for example `NOK: 10.718` (the Norwegian krone). It appears in both lists, in its
alphabetical place, and you can convert with it right away.
:::

### Readable numbers

"33989.99090081893 HUF" is correct, but nobody writes money like that. In English it is "HUF 33,990" (the forint is
shown without decimals, there are no fillér coins any more), in Hungarian "33 990 Ft". Every language has its own
habits: a decimal point or a decimal comma, a comma or a space between the thousands, the currency sign before or after
the number. We do not have to work these out ourselves: the browser's built-in [[Intl]] tools know the habits of every
language. In lesson 11 you formatted dates with `Intl.DateTimeFormat`; now [[Intl.NumberFormat]] formats the numbers.

```js
new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'HUF' }).format(33989.99) // "HUF 33,990"
```

The first parameter is the code of the language and the country (`'en-GB'`: English, the United Kingdom), the second
holds the settings. `style: 'currency'` asks for an amount of money, and `currency` is the code of the currency. The
formatter rounds by itself (to two decimals for the euro and the dollar, to whole numbers for the forint and the yen).
The rate needs `maximumSignificantDigits: 5`: it shows at most five [[significant digits|significant digit]] (you met
them in lesson 8), so both 373.55 and 0.002677 are easy to read.

The browser knows the names of the currencies too: [[Intl.DisplayNames]] turns the code `'HUF'` into "Hungarian
Forint". All of this goes into a file of its own, so that everything about formatting is in one place. Create
`src/format.js`:

```js file=src/format.js
// Every number and currency name on the page follows the habits of this language.
const LOCALE = 'en-GB'

// 1234.5 and 'EUR' → "€1,234.50"
export function formatMoney(value, currency) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

// At most 5 significant digits: 373.55 or 0.002677
export function formatRate(value) {
  return new Intl.NumberFormat(LOCALE, { maximumSignificantDigits: 5 }).format(value)
}

// The names of the currencies in this language: 'HUF' → "Hungarian Forint"
const currencyNames = new Intl.DisplayNames(LOCALE, { type: 'currency' })

export function currencyName(code) {
  return currencyNames.of(code)
}
```

`{ style: 'currency', currency }` is a shorthand: when the key and the variable have the same name, writing it once is
enough. It means the same as `{ style: 'currency', currency: currency }`. `currencyNames` is made outside the function,
once, when the file loads; the function only uses it.

The list should show the name next to the code. Change `src/components/CurrencySelect.jsx`:

```jsx file=src/components/CurrencySelect.jsx mark=1,10
import { currencyName } from '../format.js'

function CurrencySelect({ label, value, codes, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {codes.map((code) => (
          <option key={code} value={code}>
            {code} · {currencyName(code)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CurrencySelect
```

The file is in the `components` folder, so `'../format.js'` first steps up one folder (`..`) to `src`. In `App`, the
result becomes three lines: what you convert, what it comes to, and the rate itself. Here is the whole `App` at the end
of the beginner level:

```jsx file=src/App.jsx mark=3,25-31
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')

  // For now we always use the fixed table.
  const rates = FIXED_RATES
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  let result
  if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
    </main>
  )
}

export default App
```

`<>` and `</>` are a [[Fragment]] (from lesson 9): they hold the three paragraphs together, so that they go into
`result` as one value, but they leave no trace on the page.

:::check Check
The box has three lines: "€100.00 =", below it in big, bold figures "HUF 37,355", and at the bottom "1 EUR = 373.55 HUF".
The lists show the name next to the code: "HUF · Hungarian Forint", "USD · US Dollar". Choose USD → JPY: "US$100.00 =",
"JP¥15,864". (This is how Chrome and Edge write them; in another browser a detail, such as the number of decimals, may
differ.) The beginner level is done: commit it!
:::

:::mistake Common mistake
A mistyped currency code, for example `'EURO'` in the table. The `Intl` tools only know the international three-letter
codes (ISO 4217), and turn everything else down with a `RangeError`: the whole page goes blank. The console (++F12++)
shows the error, for example "RangeError: invalid_argument": it comes from `currencyName`, which looks up the names for
the list.
:::

:::try Try it
Change `LOCALE` at the top of `format.js` to `'en-US'`, then to `'de-DE'` or `'ja-JP'`, and watch how the numbers and
the currency names change. Then set it back to `'en-GB'`.
:::

## Intermediate level {level=2}

### The swap button

Let's start with something simple. A button between the two lists should swap the two currencies: EUR → HUF becomes
HUF → EUR. `App` gets a function under the `valid` line, and the JSX gets the button between the two lists:

```jsx file=src/App.jsx mark=22-26,60-68
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')

  // For now we always use the fixed table.
  const rates = FIXED_RATES
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // The two currencies change places.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
    </main>
  )
}

export default App
```

Swapping two variables usually needs a third, temporary one (the `temp` in lesson 3's shuffle), otherwise the first
assignment overwrites what the second one still needs. Not here, because `setFrom(to)` does not change `from` at once:
in this drawing, `from` and `to` keep their old values all the way through, like a snapshot. The new values arrive with
the next drawing, and React handles both updates in a single redraw.

The button only shows a symbol (⇄), which tells a screen reader very little. [[aria-label]] gives the button the name a
screen reader reads out, and `title` shows the same in a tooltip when you point at it with the mouse.

:::check Check
Between the two lists there is a round button that turns when you point at it. Click it: "From" becomes HUF, "To"
becomes EUR, and the box shows "HUF 100 =", with "€0.27" below it. One more click, and it is back.
:::

:::mistake Common mistake
Leaving out `aria-label`. To the eye everything is fine, but the screen reader only says "button", or reads out the
name of the symbol, and nobody learns what it is for.
:::

:::try Try it
With the keyboard: press ++Tab++ until the button is focused, then press ++Enter++ or the space bar. A real `<button>`
does this by itself.
:::

### The first fetch

The fixed rates were only accurate on a single day. Real rates change every working day, so a real converter asks a
[[server]] for them: a computer on the network that stores data and hands it out on request. What you can ask it for,
and at which addresses, is described by the server's [[API]] (lesson 3 used the browser's APIs; this is a web API,
which we reach over the network).

The browser and the server speak [[HTTP]]. The browser sends a [[request]]: "give me what is at this address". The
server sends back a [[response]], which has two important parts: an [[HTTP status code]] that says whether it worked
(200: fine, 404: there is no such thing, 503: the service is not available right now), and the content of the
response, which for us is [[JSON]] text. You know JSON already: it is how we saved data in localStorage too.

We ask for the rates at this address: `/api/rates/latest?from=EUR`.

- `/api/rates/latest` is the [[path]]: which data we want. Each such address of an API is called an [[endpoint]].
- The part after `?` holds the [[query parameters|query parameter]]: `name=value` pairs, separated by `&`. `from=EUR`
  asks for the rates against the euro.

:::concept Where does the answer come from?
This course uses no outside services, so the exercise has a pretend exchange-rate server, in the `src/mocks/` folder.
A package called [[Mock Service Worker]] (MSW) runs it, in your browser. A [[service worker]] (you met one in the
advanced level of lesson 10) is a script that runs in the background, between the page and the network. MSW's service
worker catches the requests to `/api/rates/…` and answers them from `src/mocks/handlers.js`, after a short wait, like a
real server. Your app's code does not know, and does not need to know, that the answer does not come from the network: it
asks exactly as it would ask a real server. If you ever switch to a real API, only the address has to change.
:::

Before writing it in React, try the request in the console. Open your app, then the console (++F12++ → Console), and
type these lines one by one:

```js
const response = await fetch('/api/rates/latest?from=EUR')
response.status
const data = await response.json()
data
```

[[fetch]] sends the request and returns a Promise, which is kept when the response has arrived. `await` waits for it
(in the console you may use it without an `async` function too). `response` is the response itself: `response.status`
is the status code, 200. Its content is not in our hands yet, because it may arrive over the network in pieces;
`response.json()` reads it to the end and turns the JSON text into a JavaScript object. That takes time too, so it also
returns a Promise, and we wait for it with a second `await`. In the end, `data` is an object:
`{ amount: 1, base: 'EUR', date: '…', rates: { AUD: …, BRL: …, … } }`.

:::check Check
After the `response.status` line the console shows `200`, and after the `data` line an object: open it with the small
triangle, and it has `amount`, `base`, `date` and `rates`. Open `rates` too: it has 29 currencies, every one except the
euro. MSW also writes a line for every request it answers, for example
`[MSW] 10:15:03 GET /api/rates/latest (200 OK)`: click it to see the request and the response.
:::

:::try Try it
In the console, ask for the rates against the forint: `await fetch('/api/rates/latest?from=HUF').then((r) => r.json())`.
Or for the English names of the currencies: `await fetch('/api/rates/currencies').then((r) => r.json())`. Here `then`
(lesson 5) does the same as a second `await`, only in one line.
:::

### Fetching in the app

The answer also holds the date of the rates (`date`): we show it on the page too. That needs one more formatter. Add
it at the end of `src/format.js` first, because `App` is going to import it. Here is the whole file:

```js file=src/format.js mark=21-25
// Every number and currency name on the page follows the habits of this language.
const LOCALE = 'en-GB'

// 1234.5 and 'EUR' → "€1,234.50"
export function formatMoney(value, currency) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

// At most 5 significant digits: 373.55 or 0.002677
export function formatRate(value) {
  return new Intl.NumberFormat(LOCALE, { maximumSignificantDigits: 5 }).format(value)
}

// The names of the currencies in this language: 'HUF' → "Hungarian Forint"
const currencyNames = new Intl.DisplayNames(LOCALE, { type: 'currency' })

export function currencyName(code) {
  return currencyNames.of(code)
}

// '2026-11-20' → "20 Nov 2026"
export function formatDate(isoDate) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  return new Intl.DateTimeFormat(LOCALE, options).format(new Date(isoDate))
}
```

`new Date('2026-11-20')` means midnight at the start of that day, but in universal time (UTC). For someone opening the
page in New York, that is still the evening of 19 November. With `timeZone: 'UTC'` the formatter works in universal
time too, so the same day appears everywhere.

Now the request you tried in the console goes into the app. The request is work outside drawing, so it goes into
`useEffect`, with an empty [[dependency array]]: that way it runs once, after the first drawing. The response goes into
a new piece of state.

```jsx file=src/App.jsx mark=1,3,11,13-21,23-25,86-88
import { useEffect, useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatDate, formatMoney, formatRate } from './format.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const [liveRates, setLiveRates] = useState(null) // the server's answer, once it is here

  // After the first drawing, we ask the server for the latest rates.
  useEffect(() => {
    async function load() {
      const response = await fetch('/api/rates/latest?from=EUR')
      const data = await response.json()
      setLiveRates(data)
    }
    load()
  }, [])

  // The live table once it is here, the fixed one until then. The answer leaves out the euro
  // itself (1 euro is always 1 euro), so we add it.
  const rates = liveRates ? { EUR: 1, ...liveRates.rates } : FIXED_RATES
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // The two currencies change places.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
      {liveRates && (
        <p className="status">Live rates, updated {formatDate(liveRates.date)}.</p>
      )}
    </main>
  )
}

export default App
```

- **Why an inner `load` function?** The effect function itself cannot be `async`, because it may only return a
  cleanup function (or nothing), not a Promise. So inside it we write an `async function load()` and call it straight
  away. We did the same with the pretend server of lesson 9.
- **`{ EUR: 1, ...liveRates.rates }`.** The server leaves the euro out of its own table (1 euro = 1 euro), but our
  `getRate` function needs it. The [[spread]] copies every rate into a new object, and we put the euro at the front.
- **Until the answer arrives,** `liveRates` is `null`, and we use the fixed table. When it arrives, `setLiveRates`
  draws the app again, and from then on the live table counts.

:::check Check
Reload the page (++F5++). For a moment you see the old, fixed result, then a slightly different number arrives (the
live rate), and under the box appears "Live rates, updated" with today's date (at the weekend, Friday's). Open the
list: it has thirty currencies now instead of ten. In the developer tools, on the **Network** tab, filter with the
**Fetch/XHR** button: there is the `latest?from=EUR` request with status 200. Click it, and the **Response** tab shows
the JSON response too.
:::

:::concept Why two requests?
On the Network tab you probably see two `latest?from=EUR` requests. That is not a bug: during development,
[[StrictMode]] (it is in `src/main.jsx`) runs effects twice on purpose, to bring out bugs that come from a missing
cleanup. The version built with `npm run build` sends one request. Two steps from now we tidy this up: we use the
second request's answer and throw away the first.
:::

:::mistake Common mistake
Leaving out the `await` before `response.json()`. The page goes blank, and the console (++F12++) says "RangeError:
Invalid time value". `data` is then not the object but a Promise, which has neither a `rates` nor a `date` field, so
`formatDate` gets a date that does not exist, and throws an error. When React runs into an error while drawing, it
stops, and nothing is left on the page.
:::

### Loading and errors

A lot can happen on the network: the answer is slow, the server is down, or the connection is gone. A good app never
leaves the user guessing. Every request has three states, and all three should show:

- **loading**: the request has gone out, the answer is not here yet. Show that we are working on it.
- **success**: the answer has arrived; we show it.
- **error**: it did not work. Say so, and offer a "Try again" button.

So that you can try them out, the pretend server has a practice switch. Open `src/mocks/handlers.js`: near the top is
the `SERVER_MODE` constant, set to `'normal'`. Change it to `'broken'` and save: the page reloads, and from now on the
server answers every request with a 503 error. What does your app do now?

Nothing good: the page goes blank, and the console shows the same "RangeError: Invalid time value" as the mistake in
the previous step. That is because [[fetch]] only fails by itself when no answer comes at all. A 503 is an answer too,
just with bad news, and its content is JSON as well: `{ "error": "unavailable", "message": "…" }`. It has no `rates` and
no `date`, and `formatDate` cannot do anything with a missing date. `response.ok` tells whether the response is a
successful one: it is true when the status code is between 200 and 299. When it is not, we throw an error ourselves.

First, the line under the result that says what is going on. Create `src/components/RateStatus.jsx`:

```jsx file=src/components/RateStatus.jsx
import { formatDate } from '../format.js'

// The line under the result: where the rates come from, whether they are still loading, or what went wrong.
function RateStatus({ status, error, date, onRetry }) {
  if (status === 'loading') {
    return (
      <p className="status" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading the latest rates…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>
          The live rates could not be loaded ({error.message}). Showing fixed sample rates instead.
        </p>
        <button type="button" className="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  return <p className="status">Live rates, updated {formatDate(date)}.</p>
}

export default RateStatus
```

Each of the three states gets its own `return`: when the status is `'loading'`, the function ends at the first
`return`, and the rest never runs. This is the [[early return]] you saw in lesson 4. `role="status"` is for screen
readers: when the text changes, they read it out, but only after finishing what they are saying; `role="alert"` makes
them read the error out at once, interrupting everything. `spinner` is a turning circle from the CSS.

Now comes `App`. It has four things to keep track of about the request: the answer, the state of the request
(`'loading'`, `'success'` or `'error'`), the error, and how many times we have tried. Here is the whole file:

```jsx file=src/App.jsx mark=3,5,13-15,19-31,34,36-38,54-56,101-106
import { useEffect, useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const [liveRates, setLiveRates] = useState(null) // the server's answer, once it is here
  const [status, setStatus] = useState('loading') // 'loading', 'success' or 'error'
  const [error, setError] = useState(null) // what went wrong, if something did
  const [attempt, setAttempt] = useState(0) // "Try again" increases it, and the effect runs again

  useEffect(() => {
    async function load() {
      setStatus('loading')
      try {
        const response = await fetch('/api/rates/latest?from=EUR')
        // fetch only fails by itself when no answer arrives at all.
        // An answer that reports an error (404, 503…) is ours to notice.
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        setLiveRates(data)
        setStatus('success')
      } catch (err) {
        setError(err)
        setStatus('error')
      }
    }
    load()
  }, [attempt])

  // The live table if it has arrived; the fixed sample rates if loading failed.
  let rates = FIXED_RATES
  if (status === 'success') rates = { EUR: 1, ...liveRates.rates }
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // The two currencies change places.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (status === 'loading') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
      <RateStatus
        status={status}
        error={error}
        date={liveRates?.date}
        onRetry={() => setAttempt(attempt + 1)}
      />
    </main>
  )
}

export default App
```

The import of `formatDate` is gone, because from now on `RateStatus` formats the date.

- **`try`/`catch`.** Everything that can go wrong during the request is in the `try` part: when `fetch` gets no
  answer, when we throw an error with `throw new Error(…)`, or when the answer is not JSON, the code carries on in the
  `catch` part. There we keep the error and set the state to `'error'`. The [[template literal]] puts the status code
  into the error's message: "HTTP 503".
- **Trying again.** `attempt` is in the dependency array. The button increases it by one, so the effect runs again:
  `setStatus('loading')` switches back to loading, and a new request goes out.
- **While loading,** a faintly shimmering bar (`result__skeleton`) takes the place of the result, because we do not know
  the rate yet. After an error we calculate with the fixed table, and the line below says that this is not live data.
- **`liveRates?.date`.** This is [[optional chaining]]: when `liveRates` is `null` (no answer yet), the whole
  expression becomes `undefined`, instead of throwing an error like `liveRates.date` would. `RateStatus` only uses the
  date after a success anyway.

:::check Check
`SERVER_MODE` is now `'broken'`: for a moment the shimmering bar and the turning circle appear, then an orange strip:
"The live rates could not be loaded (HTTP 503). Showing fixed sample rates instead." The box shows the result at the
fixed rate. When you click "Try again", it loads again, then shows the error again. Try the other modes as well: with
`'slow'` you see the loading state for three seconds; with `'flaky'` about every second answer is an error, so a few
clicks on "Try again" get through; with `'offline'` the error is "Failed to fetch", because no answer comes at all. In
the end, set it back to `'normal'`.
:::

:::mistake Common mistake
Leaving out the `if (!response.ok)` line. When things work, there is no difference, but in `'broken'` mode the JSON of
the error message goes into `liveRates`, `status` becomes `'success'`, and the page goes blank again, with the same
"RangeError: Invalid time value". `fetch` treats a 404 or a 503 response as a success as well: whether the answer is
any good is yours to check.
:::

:::try Try it
Change the address to `'/api/rates/latest?from=XYZ'`: "HTTP 404". On the Network tab the content of the response tells
you what is wrong too: `{"error":"not_found","message":"Unknown currency: XYZ"}`. Then change it back.
:::

### A custom hook: useFetch

The request now takes up four pieces of state and an effect in `App`, although the job of `App` is converting money.
The advanced level brings a second request (the data of the chart), and writing all this once more would be a bad
idea. So handling a request goes into a [[custom hook]]. You wrote one in lesson 2, `useDarkMode`, and another in
lessons 6 and 9, `useLocalStorage`: a function whose name starts with `use` and that calls other hooks.

The hook should fetch JSON from any address: it gets the address as a parameter. Create `src/useFetch.js`:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// Fetches JSON from the given address, and tells how the request is going: { data, status, error, retry }.
function useFetch(url) {
  const [data, setData] = useState(null) // the content of the answer, once it is here
  const [status, setStatus] = useState('loading') // 'loading', 'success' or 'error'
  const [error, setError] = useState(null) // what went wrong, if something did
  const [attempt, setAttempt] = useState(0) // retry increases it, and the effect runs again

  useEffect(() => {
    let ignore = false

    async function load() {
      setStatus('loading')
      try {
        const response = await fetch(url)
        // fetch only fails by itself when no answer arrives at all.
        // An answer that reports an error (404, 503…) is ours to notice.
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const body = await response.json()
        if (ignore) return
        setData(body)
        setStatus('success')
      } catch (err) {
        if (ignore) return
        setError(err)
        setStatus('error')
      }
    }

    load()
    // Cleanup: when a new request starts, or the component goes away,
    // the answer to this request is not needed any more.
    return () => {
      ignore = true
    }
  }, [url, attempt])

  function retry() {
    setAttempt(attempt + 1)
  }

  return { data, status, error, retry }
}

export default useFetch
```

This is the same code that was in `App`, with three differences:

- **The address is a parameter,** and it is in the dependency array. When the hook gets a new address, the effect runs
  again, and a new request goes out. The chart needs exactly this: another pair, another address, new data.
- **`ignore`.** When the address changes quickly, several requests can be on their way at once, and their answers can
  arrive in any order. A slow, old answer could overwrite a newer one: this is the [[race condition]] you met in
  lessons 5 and 9. Before every new request (and when the component goes away), the [[cleanup function]] sets the old
  request's `ignore` to `true`, so its answer is thrown away. The same happens with [[StrictMode]]'s double run: the
  first request's answer is thrown away, the second one's is used.
- **It returns an object,** not an array like `useState` or `useLocalStorage`. With four values, names say more than
  positions: `latest.status`, `latest.data`, and nobody has to remember which one comes where.

`App` gets much shorter. Here is the whole file:

```jsx file=src/App.jsx mark=1,4,13,17,33,81-84
import { useState } from 'react'
import { FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import useFetch from './useFetch.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const latest = useFetch('/api/rates/latest?from=EUR')

  // The live table if it has arrived; the fixed sample rates if loading failed.
  let rates = FIXED_RATES
  if (latest.status === 'success') rates = { EUR: 1, ...latest.data.rates }
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // The two currencies change places.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (latest.status === 'loading') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
      <RateStatus
        status={latest.status}
        error={latest.error}
        date={latest.data?.date}
        onRetry={latest.retry}
      />
    </main>
  )
}

export default App
```

`App` does not need `useEffect` any more, so it is gone from the first line. `latest` is the object the hook returns;
`onRetry={latest.retry}` passes the hook's `retry` function on to the button.

:::check Check
From the outside nothing has changed: the loading state comes as before, then the live rate. Try it in `'flaky'` mode
too: the error and "Try again" work as in the previous step. Then set it back to `'normal'`.
:::

:::mistake Common mistake
Taking it apart like an array, out of habit, as with `useState`: `const [data, status] = useFetch(…)`. This hook
returns an object, which cannot be taken apart as an array: the page goes blank, and the console says "useFetch is not
a function or its return value is not iterable". An object is taken apart with curly braces, by name:
`const { data, status } = useFetch(…)`, or you use it as a whole, as `App` does: `latest.status`.
:::

:::try Try it
Add a line `console.log('answer arrived, ignore =', ignore)` under the `const body = …` line, and reload the page.
Because of StrictMode it appears twice in the console: once with `true` (that answer is thrown away), once with
`false`. Then delete the line.
:::

:::concept Cancelling the request: AbortController
`ignore` throws away the answer that is not needed, but the request itself still runs to the end. The browser can also
cancel a request: an `AbortController`, whose `signal` we hand to `fetch` (`fetch(url, { signal })`), and whose
`abort()` we call in the cleanup function. `fetch` then throws an `AbortError`, which the `catch` has to filter out.
With many requests or big downloads this saves work; for our small answers, `ignore` is enough.
:::

### The API address in a .env file

The address, `/api/rates`, is now written into the code. In a real project it often changes: during development you
talk to a test server, in production to another one, and many APIs also want a key along with the address. Settings
like these do not belong in the code but in [[environment variables|environment variable]]: values given outside the
program, in the environment it runs in. In a Vite project you write them into a file called `.env`.

Create a file named `.env` in the root of the project (next to `package.json`, **not** in `src`). That really is its
whole name: a dot, then `env`, with no extension.

```text file=.env
# The address of the rates API. The code reads it as import.meta.env.VITE_RATES_API.
VITE_RATES_API=/api/rates
```

Every line is a `NAME=value` pair, and lines starting with `#` are comments. The value needs no quotes. Vite reads the
file when it starts, and hands the values to the code through the [[import.meta.env]] object, but only the ones whose
name starts with `VITE_`. This is a deliberate protection: your computer has many other environment variables, some of
them even passwords, and this way none of them can end up in the app by accident.

Change `src/rates.js`; `API` goes at the end:

```js file=src/rates.js mark=22-23
// Fixed sample rates: how much 1 euro is worth in each of the other currencies.
// (The reference rates of a day in November 2026: fine for practice, not for real money.)
export const FIXED_RATES = {
  EUR: 1,
  USD: 1.099,
  GBP: 0.83735,
  CHF: 0.9223,
  JPY: 174.35,
  HUF: 373.55,
  PLN: 4.4583,
  CZK: 24.469,
  RON: 5.3493,
  SEK: 11.2125,
}

// How many units of `to` one unit of `from` is worth. Every rate is given against 1 euro,
// so we go through the euro: from → EUR → to.
export function getRate(from, to, rates) {
  return rates[to] / rates[from]
}

// The address of the rates API. VITE_RATES_API from the .env file wins; without it, this is the default.
export const API = import.meta.env.VITE_RATES_API ?? '/api/rates'
```

`??` ([[nullish coalescing]], from lesson 13) gives the value on its right when the one on its left is `null` or
`undefined` (here: when there is no `VITE_RATES_API`), so the app also works when someone starts it without a `.env`.
In `App` two lines change: the import brings `API`, and the address of `useFetch` becomes a template literal. Here is
the whole `App` at the end of the intermediate level:

```jsx file=src/App.jsx mark=2,13
import { useState } from 'react'
import { API, FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import useFetch from './useFetch.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const latest = useFetch(`${API}/latest?from=EUR`)

  // The live table if it has arrived; the fixed sample rates if loading failed.
  let rates = FIXED_RATES
  if (latest.status === 'success') rates = { EUR: 1, ...latest.data.rates }
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // The two currencies change places.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  let result
  if (latest.status === 'loading') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
      </section>
      <RateStatus
        status={latest.status}
        error={latest.error}
        date={latest.data?.date}
        onRetry={latest.retry}
      />
    </main>
  )
}

export default App
```

Vite notices when `.env` changes, and restarts the development server by itself. If you still do not see the change,
stop the server in the terminal (++Ctrl++ + ++C++) and start it again: `npm run dev`.

:::check Check
Everything works as before. Now change the address in `.env` to `/api/ratez` (with a z) and save: the orange strip
says something like "Unexpected token '<', "<!doctype "... is not valid JSON". The pretend server does not know this
address, so the request went on to Vite's development server, which answered with the `index.html` page instead of
JSON. The app treats that as an error too, and carries on with the fixed rates. Change it back to `/api/rates`. The
intermediate level is done: commit it!
:::

:::concept What may go into a VITE_ variable?
Whatever you write into a `VITE_` variable, Vite copies word for word into the finished JavaScript, which every
visitor's browser downloads. Anyone can look at it in the developer tools. So only **public** values belong there: an
address, or an [[API key]] that the provider means to be public anyway (and that, for example, only works from your
own domain). A secret key must never be sent to the browser: a server of your own keeps it, calls the API on your
behalf, and passes on only the answer.

A value you only use on your own computer, such as a test key of your own, goes into a `.env.local` file: it overrides
`.env`, and it does not go into the git repository (the `.gitignore` that came with the exercise already has `*.local`). `.env` itself
holds the shared defaults, and it can be committed. And `npm run build` also reads a `.env.production` file, if there
is one: that is where the address of the production server can go.
:::

:::try Try it
Add a made-up key at the end of `.env`: `VITE_RATES_KEY=secret-12345`, and a line that uses it at the end of
`src/rates.js`: `console.log('key:', import.meta.env.VITE_RATES_KEY)`. Run `npm run build` (in a second terminal, or
after stopping the development server). Vite may warn that a chunk (one file of the finished JavaScript) is larger
than 500 kB: that is the pretend server, which is built into the app too. Open the `index-….js` file in the `dist/assets` folder, and search it (++Ctrl++ +
++F++) for `secret-12345`: there it is, letter by letter, for anyone to find. That is why a secret does not belong in
a `VITE_` variable. Then delete both lines.
:::

## Advanced level {level=3}

### The last 30 days

You can tell where a rate is heading from its last few weeks. On another endpoint, the pretend server gives the rates
day by day:

```text
/api/rates/2026-10-24..?from=EUR&to=HUF
```

The `..` after the date means: from this day up to the latest one. The answer looks like this:

```js
{
  amount: 1,
  base: 'EUR',
  start_date: '2026-10-26',
  end_date: '2026-11-23',
  rates: {
    '2026-10-26': { HUF: 372.1 },
    '2026-10-27': { HUF: 373.4 },
    // … one line for every working day
  },
}
```

There is no data for weekends, because reference rates are only published on working days.

Now `useFetch` pays off: the second request is a single line. Create `src/components/RateChart.jsx`:

```jsx file=src/components/RateChart.jsx
import { API } from '../rates.js'
import { formatPercent, formatRate } from '../format.js'
import useFetch from '../useFetch.js'

// The day `days` days before today, as '2026-10-24'.
function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function RateChart({ from, to }) {
  // Another pair, another address: useFetch then fetches again by itself.
  const history = useFetch(`${API}/${daysAgo(30)}..?from=${from}&to=${to}`)

  let body
  if (history.status === 'loading') {
    body = <div className="chart__skeleton" />
  } else if (history.status === 'error') {
    body = (
      <div className="status status--error" role="alert">
        <p>The last 30 days could not be loaded ({history.error.message}).</p>
        <button type="button" className="button" onClick={history.retry}>
          Try again
        </button>
      </div>
    )
  } else {
    // { '2026-10-26': { HUF: 372.1 }, … } → [{ date: '2026-10-26', value: 372.1 }, …]
    const points = Object.entries(history.data.rates).map(([date, day]) => ({ date, value: day[to] }))
    const values = points.map((point) => point.value)
    const first = values[0]
    const last = values[values.length - 1]

    body = (
      <dl className="chart__stats">
        <div>
          <dt>Lowest</dt>
          <dd>{formatRate(Math.min(...values))}</dd>
        </div>
        <div>
          <dt>Highest</dt>
          <dd>{formatRate(Math.max(...values))}</dd>
        </div>
        <div>
          <dt>Change</dt>
          <dd>{formatPercent((last - first) / first)}</dd>
        </div>
      </dl>
    )
  }

  return (
    <section className="chart">
      <h2>
        The last 30 days · {from} → {to}
      </h2>
      {body}
    </section>
  )
}

export default RateChart
```

- **`daysAgo`.** `new Date()` is the present moment. `setDate` sets the day of the month: `getDate() - 30` works even
  when it goes below 1, because the date then steps back into the previous month. `toISOString()` gives the standard
  form (`'2026-10-24T09:15:00.000Z'`), and `slice(0, 10)` keeps only its first ten characters: the date.
- **Another pair, another address.** `from` and `to` are part of the address, so every pair has an address and a
  request of its own. Same hook, same loading and error handling, only another address: that is why it was worth
  writing.
- **`Object.entries`.** It gives the key–value pairs of an object in an array. Each pair is a two-item array itself,
  for example `['2026-10-26', { HUF: 372.1 }]`. `map` turns every pair into a simpler object. `([date, day])` takes
  the pair apart right in the parameter (array [[destructuring]], as in the `useState` lines), and `day[to]` reads that
  day's rate.
- **`Math.min(...values)`.** `Math.min` and `Math.max` (lesson 6) expect the numbers as separate parameters, not in an
  array. Here the [[spread]] spreads the items of the array out into parameters: `Math.min(...[3, 1, 2])` is the same as
  `Math.min(3, 1, 2)`.
- The three figures go into a [[description list]] (`<dl>`, from lesson 13): `<dt>` is the name, `<dd>` the value.

The change is best shown as a percentage, which needs one more formatter. Here is the whole of `src/format.js`:

```js file=src/format.js mark=27-31
// Every number and currency name on the page follows the habits of this language.
const LOCALE = 'en-GB'

// 1234.5 and 'EUR' → "€1,234.50"
export function formatMoney(value, currency) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

// At most 5 significant digits: 373.55 or 0.002677
export function formatRate(value) {
  return new Intl.NumberFormat(LOCALE, { maximumSignificantDigits: 5 }).format(value)
}

// The names of the currencies in this language: 'HUF' → "Hungarian Forint"
const currencyNames = new Intl.DisplayNames(LOCALE, { type: 'currency' })

export function currencyName(code) {
  return currencyNames.of(code)
}

// '2026-11-20' → "20 Nov 2026"
export function formatDate(isoDate) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  return new Intl.DateTimeFormat(LOCALE, options).format(new Date(isoDate))
}

// 0.0123 → "+1.23%", -0.004 → "-0.4%"
export function formatPercent(value) {
  const options = { style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero' }
  return new Intl.NumberFormat(LOCALE, options).format(value)
}
```

`style: 'percent'` turns 0.0123 into 1.23%, and `signDisplay: 'exceptZero'` puts the sign in front of positive numbers
too (except zero), so you see at once which way the rate went.

Finally, the chart goes into `App`, under `RateStatus`. With the same currency on both sides there is nothing to draw,
so a short text appears instead. We could not decide this inside `RateChart` with an `if` before the hook, because
hooks must always be called in the same order, without conditions (the [[rules of hooks]]); but `App` can decide
whether `RateChart` is there at all.

`RateChart` also gets a [[key]]: the name of the pair, for example `'EUR-HUF'`. You saw in lesson 3 that when the `key`
changes, React treats the component as a brand new one: it removes the old one and draws a new one, with fresh state.
That is exactly what we need here. When the pair changes, the old chart goes away (its cleanup function throws away the
answer still on its way, with `ignore`), and the new one starts in the `'loading'` state. Without the `key` the hook
would stay the same: it would send a new request for the new address, but in the first drawing it would still return
the old pair's data, with a `'success'` status, and `day[to]` would look for a currency that is not in there.

The import goes at the top of the file, and the condition before `</main>`:

```jsx file=src/App.jsx mark=1,10-14
import RateChart from './components/RateChart.jsx'
// … the other imports and the start of App, as before

      <RateStatus
        status={latest.status}
        error={latest.error}
        date={latest.data?.date}
        onRetry={latest.retry}
      />
      {from === to ? (
        <p className="muted">Pick two different currencies to see the chart.</p>
      ) : (
        <RateChart key={`${from}-${to}`} from={from} to={to} />
      )}
    </main>
  )
}
```

:::check Check
Under the line that tells where the rates come from (for example "Live rates, updated …") there is a framed section:
"The last 30 days · EUR → HUF", with three small boxes in it: lowest, highest, change (for example "+0.52%"). Choose another pair: for a moment a shimmering bar appears, then the new
figures. With the same currency on both sides, the frame gives way to the text "Pick two different currencies to see
the chart."
:::

:::mistake Common mistake
`day.to` instead of `day[to]`. A name after a dot is taken literally: `day.to` looks for a key called "to", which does
not exist, so every value is `undefined`, and the boxes say "NaN". When the key is in a variable, you need square
brackets.
:::

:::try Try it
Change `daysAgo(30)` to `daysAgo(90)` (and the title to "The last 90 days"): the server has data going back 400 days.
Then change it back.
:::

### The line: an SVG chart

Next to the figures, a line should show which way the rate went. You saw in lesson 12 that [[SVG]] is a picture made
of shapes, written down as text. React draws SVG elements just as it draws HTML, so the chart is simply JSX: an
`<svg>` with a `<polyline>` in it, which joins points with straight lines.

An SVG has a coordinate system of its own, set by the [[viewBox]]: `viewBox="0 0 300 100"` means a drawing area 300
units wide and 100 units high. With `preserveAspectRatio="none"`, this area stretches as far as the CSS lets it (to the
full width, 150 pixels high), so the chart fills its place on a phone and on a big screen alike. One important
difference from maths lessons: in SVG, y grows downwards. 0 is the top of the drawing area, 100 is the bottom.

This is how we work out the points:

- **x:** the first day at the left edge (0), the last at the right edge (300), the others evenly in between:
  `i / (values.length - 1) * WIDTH`.
- **y:** the lowest value at the bottom (100), the highest at the top (0). `(value - min) / range` (where `range` is
  the difference between the largest and the smallest value) brings the value between 0 and 1 (0 for the smallest, 1
  for the largest); we multiply that by the height, and take it away from the height, because y grows downwards.

Here is the whole of `src/components/RateChart.jsx`:

```jsx file=src/components/RateChart.jsx mark=2,5-6,8-21,54,69-82
import { API } from '../rates.js'
import { formatDate, formatPercent, formatRate } from '../format.js'
import useFetch from '../useFetch.js'

const WIDTH = 300
const HEIGHT = 100

// The values as "x,y x,y …" points for an SVG polyline: the first day on the left, the last on the right,
// the lowest value at the bottom, the highest at the top.
function linePoints(values) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1 // when every value is the same, do not divide by zero
  return values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * WIDTH
      const y = HEIGHT - ((value - min) / range) * HEIGHT
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

// The day `days` days before today, as '2026-10-24'.
function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function RateChart({ from, to }) {
  // Another pair, another address: useFetch then fetches again by itself.
  const history = useFetch(`${API}/${daysAgo(30)}..?from=${from}&to=${to}`)

  let body
  if (history.status === 'loading') {
    body = <div className="chart__skeleton" />
  } else if (history.status === 'error') {
    body = (
      <div className="status status--error" role="alert">
        <p>The last 30 days could not be loaded ({history.error.message}).</p>
        <button type="button" className="button" onClick={history.retry}>
          Try again
        </button>
      </div>
    )
  } else {
    // { '2026-10-26': { HUF: 372.1 }, … } → [{ date: '2026-10-26', value: 372.1 }, …]
    const points = Object.entries(history.data.rates).map(([date, day]) => ({ date, value: day[to] }))
    const values = points.map((point) => point.value)
    const first = values[0]
    const last = values[values.length - 1]

    body = (
      <>
        <dl className="chart__stats">
          <div>
            <dt>Lowest</dt>
            <dd>{formatRate(Math.min(...values))}</dd>
          </div>
          <div>
            <dt>Highest</dt>
            <dd>{formatRate(Math.max(...values))}</dd>
          </div>
          <div>
            <dt>Change</dt>
            <dd>{formatPercent((last - first) / first)}</dd>
          </div>
        </dl>
        <svg
          className="chart__svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${from}–${to} rate over the last 30 days, from ${formatRate(first)} to ${formatRate(last)}`}
        >
          <polyline className="chart__line" points={linePoints(values)} />
        </svg>
        <div className="chart__axis">
          <span>{formatDate(points[0].date)}</span>
          <span>{formatDate(points[points.length - 1].date)}</span>
        </div>
      </>
    )
  }

  return (
    <section className="chart">
      <h2>
        The last 30 days · {from} → {to}
      </h2>
      {body}
    </section>
  )
}

export default RateChart
```

- `toFixed(1)` rounds the coordinates to one decimal, so the list of points stays short. `join(' ')` joins the points
  with spaces, the way the `points` attribute expects them.
- `|| 1` is there for the case when every value is the same: then `max - min` would be zero, and we would divide by
  zero. `||` gives 1 instead.
- `role="img"` and `aria-label` tell a screen reader in words what the line shows.
- The colour and the width of the line come from `App.css` (`chart__line`). Thanks to `vector-effect:
  non-scaling-stroke` the line keeps its width even when the drawing area stretches.

:::check Check
Under the three boxes a blue line runs across the frame, with the date of the first day under its left end and the
last day under its right end. Choose EUR → JPY: a curve of another shape appears. Make the browser window narrow: the
line stretches and shrinks with it.
:::

:::mistake Common mistake
`const y = ((value - min) / range) * HEIGHT`, without taking it away from the height. The chart is upside down: when
the rate rises, the line goes down. In SVG, y grows downwards, which is why `HEIGHT -` is needed.
:::

:::try Task
Shade the area under the line: put a `<polygon>` before the `<polyline>`. Its points are the points of the line, plus
the two bottom corners, from right to left, so that the shape closes:

```jsx
<polygon
  points={`${linePoints(values)} ${WIDTH},${HEIGHT} 0,${HEIGHT}`}
  fill="rgb(1 151 216 / 0.15)"
/>
```
:::

### Favourite currency pairs

Someone who checks the same pairs again and again (say, euro → forint and dollar → forint) is happy to get back to them
with one click. We save the favourite pairs in `localStorage`, so they survive a reload. You wrote the
`useLocalStorage` hook for that in lessons 6 and 9. If you have it, copy it into this project; if not, create
`src/useLocalStorage.js`:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Works like useState, but the value survives a reload:
// it is kept in localStorage as JSON, under the given key.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Blocked storage or a broken save: keep the initial value.
    }
    return initialValue
  })

  // Save after every change.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Never mind if it fails: the value still works, it just does not remember.
    }
  }, [key, value])

  // Gives back the same as useState: the value and the function that sets it.
  return [value, setValue]
}

export default useLocalStorage
```

A pair is simply a piece of text: `'EUR-HUF'`. The row of favourites is a component of its own. Create
`src/components/FavoritePairs.jsx`:

```jsx file=src/components/FavoritePairs.jsx
// The buttons of the saved pairs. The button of the pair on screen is pressed.
function FavoritePairs({ pairs, current, onSelect }) {
  return (
    <section>
      <h2 className="section-title">Favourite pairs</h2>
      {pairs.length === 0 ? (
        <p className="muted">No saved pairs yet: the star saves the one you are looking at.</p>
      ) : (
        <div className="chips">
          {pairs.map((pair) => (
            <button
              key={pair}
              type="button"
              className="chip"
              aria-pressed={pair === current}
              onClick={() => onSelect(pair)}
            >
              {pair.replace('-', ' → ')}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default FavoritePairs
```

[[aria-pressed]] (from lesson 2) marks which button is "pressed": the one of the pair on screen, which the CSS shows
as a filled button. `pair.replace('-', ' → ')` swaps the hyphen for an arrow, only for the label.

In `App` the result box gets a star button that saves or removes the pair on screen, and the row of buttons goes under
`RateStatus`. Here is the whole file:

```jsx file=src/App.jsx mark=5,9,16,30-34,42-49,51-56,105-107,115
import { useState } from 'react'
import { API, FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import useFetch from './useFetch.js'
import useLocalStorage from './useLocalStorage.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import RateChart from './components/RateChart.jsx'
import FavoritePairs from './components/FavoritePairs.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const [pairs, setPairs] = useLocalStorage('currency-pairs', ['EUR-HUF', 'EUR-USD'])
  const latest = useFetch(`${API}/latest?from=EUR`)

  // The live table if it has arrived; the fixed sample rates if loading failed.
  let rates = FIXED_RATES
  if (latest.status === 'success') rates = { EUR: 1, ...latest.data.rates }
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // The pair on screen as one piece of text, for example 'EUR-HUF'.
  const pairKey = `${from}-${to}`
  const saved = pairs.includes(pairKey)
  // Only the pairs whose two currencies are both in the current table.
  const availablePairs = pairs.filter((pair) => pair.split('-').every((code) => code in rates))

  // The two currencies change places.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  // The star: a saved pair is taken out, any other pair is added to the end.
  function togglePair() {
    if (saved) {
      setPairs(pairs.filter((pair) => pair !== pairKey))
    } else {
      setPairs([...pairs, pairKey])
    }
  }

  // The button of a favourite pair: 'EUR-HUF' → from = 'EUR', to = 'HUF'.
  function selectPair(pair) {
    const [newFrom, newTo] = pair.split('-')
    setFrom(newFrom)
    setTo(newTo)
  }

  let result
  if (latest.status === 'loading') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
        <button type="button" className="star" aria-pressed={saved} onClick={togglePair}>
          {saved ? '★ Saved' : '☆ Save pair'}
        </button>
      </section>
      <RateStatus
        status={latest.status}
        error={latest.error}
        date={latest.data?.date}
        onRetry={latest.retry}
      />
      <FavoritePairs pairs={availablePairs} current={pairKey} onSelect={selectPair} />
      {from === to ? (
        <p className="muted">Pick two different currencies to see the chart.</p>
      ) : (
        <RateChart key={`${from}-${to}`} from={from} to={to} />
      )}
    </main>
  )
}

export default App
```

- **`pairs.includes(pairKey)`** tells whether the pair is in the array. That is how the star knows whether to be empty
  (☆) or filled (★).
- **Saving and removing** work as with the tasks of lesson 9: we never change the array in place. `filter` gives a new
  array without the pair, and `[...pairs, pairKey]` a new one with the pair at the end.
- **`pair.split('-')`** cuts the text in two at the hyphen: `['EUR', 'HUF']`, and `const [newFrom, newTo] = …` takes it
  apart into two variables.
- **`availablePairs`.** When the server cannot be reached, we only have our ten fixed currencies. The button of a saved
  `'EUR-AUD'` would then switch to a pair that has no rate. The `in` operator tells whether an object has a key:
  `'AUD' in rates` is true when the table has the Australian dollar. And [[every]] is true when that holds for both
  currencies of the pair.

:::check Check
At the bottom of the result box there is a "★ Saved" button, because EUR → HUF is one of the starting favourites;
further down, under the "FAVOURITE PAIRS" heading, there are two buttons: "EUR → HUF" (pressed) and "EUR → USD". Choose the
GBP → HUF pair: the star becomes "☆ Save pair". Click it: "★ Saved", and a "GBP → HUF" button appears. Click the
"EUR → USD" button: both lists switch, and so does the chart. Reload the page: the favourites are still there. The star
removes them too.
:::

:::mistake Common mistake
`pairs.push(pairKey)`, then `setPairs(pairs)`. `push` changes the old array in place, and `setPairs` gets the same
array back, so React sees no change and does not draw again: at first, nothing happens. The button only turns up
later, when something else redraws the app (type a digit into the amount), and even then the pair is not saved:
`useLocalStorage` did not see a new value either, so after a reload it is gone. Always give the setter a new array.
:::

:::try Task
Keep at most six favourites: when saving, `[...pairs, pairKey].slice(-6)` keeps only the last six. What happens to the
oldest favourite when you save a seventh?
:::

### The last known rates

Two things are still annoying. One: every time the app starts, you watch the shimmering bar until the answer arrives,
although you got the rates yesterday, and they have hardly changed since. The other: without a connection you get the
old, fixed sample rates, although there is much fresher data that you downloaded last time.

Both have the same cure: a [[cache]]. We keep a copy of every successful answer. When the app starts, we show the copy
at once, and meanwhile fetch the fresh rates in the background; when they arrive, they take its place. If they never
arrive, the copy stays, and we say which day it is from. The copy goes into `localStorage`, with the `useLocalStorage`
hook.

First `RateStatus`: now we can calculate from three kinds of table (live, last known, fixed), and it should always say
which one you see. Here is the whole of `src/components/RateStatus.jsx`:

```jsx file=src/components/RateStatus.jsx mark=4-7,13,21
import { formatDate } from '../format.js'

// The line under the result: where the rates come from, whether they are still loading, or what went wrong.
function RateStatus({ status, source, date, error, onRetry }) {
  // What you see instead of the live rates, while they are not here.
  const fallback =
    source === 'cached' ? `the last known rates from ${formatDate(date)}` : 'fixed sample rates'

  if (status === 'loading') {
    return (
      <p className="status" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading the latest rates… {source === 'cached' && `Meanwhile showing ${fallback}.`}
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>The live rates could not be loaded ({error.message}). Showing {fallback} instead.</p>
        <button type="button" className="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  return <p className="status">Live rates, updated {formatDate(date)}.</p>
}

export default RateStatus
```

`source` says where the table comes from: `'live'`, `'cached'` (the last known rates) or `'fixed'`.
`{source === 'cached' && …}` only writes something when the condition is true; otherwise it gives `false`, from which
React draws nothing.

In `App` three things change: we save every successful answer, an `if`–`else if` chain decides which table we
calculate with, and when there is a saved table, the shimmering bar is not needed even while loading. Here is the whole `App` at the
end of the lesson:

```jsx file=src/App.jsx mark=1,17,20-23,25,27-37,75,127-128
import { useEffect, useState } from 'react'
import { API, FIXED_RATES, getRate } from './rates.js'
import { formatMoney, formatRate } from './format.js'
import useFetch from './useFetch.js'
import useLocalStorage from './useLocalStorage.js'
import CurrencySelect from './components/CurrencySelect.jsx'
import RateStatus from './components/RateStatus.jsx'
import RateChart from './components/RateChart.jsx'
import FavoritePairs from './components/FavoritePairs.jsx'
import './App.css'

function App() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('HUF')
  const [pairs, setPairs] = useLocalStorage('currency-pairs', ['EUR-HUF', 'EUR-USD'])
  const [lastRates, setLastRates] = useLocalStorage('currency-last-rates', null)
  const latest = useFetch(`${API}/latest?from=EUR`)

  // We save every successful answer: next time it shows at once, and it helps when there is no connection.
  useEffect(() => {
    if (latest.status === 'success') setLastRates(latest.data)
  }, [latest.status, latest.data])

  // Which table do we calculate with? The live one if it arrived; if not, the last saved one; in the end, the fixed one.
  let rates = FIXED_RATES
  let source = 'fixed'
  let date = null
  if (latest.status === 'success') {
    rates = { EUR: 1, ...latest.data.rates }
    source = 'live'
    date = latest.data.date
  } else if (lastRates) {
    rates = { EUR: 1, ...lastRates.rates }
    source = 'cached'
    date = lastRates.date
  }
  // The keys of the table are the currency codes: they make the list, in alphabetical order.
  const codes = Object.keys(rates).sort()
  const rate = getRate(from, to, rates)

  // The field gives text: we turn it into a number, and check whether we can work with it.
  const value = Number(amount)
  const valid = amount !== '' && value >= 0

  // The pair on screen as one piece of text, for example 'EUR-HUF'.
  const pairKey = `${from}-${to}`
  const saved = pairs.includes(pairKey)
  // Only the pairs whose two currencies are both in the current table.
  const availablePairs = pairs.filter((pair) => pair.split('-').every((code) => code in rates))

  // The two currencies change places.
  function swap() {
    setFrom(to)
    setTo(from)
  }

  // The star: a saved pair is taken out, any other pair is added to the end.
  function togglePair() {
    if (saved) {
      setPairs(pairs.filter((pair) => pair !== pairKey))
    } else {
      setPairs([...pairs, pairKey])
    }
  }

  // The button of a favourite pair: 'EUR-HUF' → from = 'EUR', to = 'HUF'.
  function selectPair(pair) {
    const [newFrom, newTo] = pair.split('-')
    setFrom(newFrom)
    setTo(newTo)
  }

  let result
  if (latest.status === 'loading' && source === 'fixed') {
    result = <div className="result__skeleton" />
  } else if (valid) {
    result = (
      <>
        <p className="result__from">{formatMoney(value, from)} =</p>
        <p className="result__value">{formatMoney(value * rate, to)}</p>
        <p className="result__rate">
          1 {from} = {formatRate(rate)} {to}
        </p>
      </>
    )
  } else {
    result = <p className="result__hint">Enter an amount (0 or more).</p>
  }

  return (
    <main className="converter">
      <h1>Currency Converter</h1>
      <label className="field">
        <span>Amount</span>
        <input
          className="amount"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="pair">
        <CurrencySelect label="From" value={from} codes={codes} onChange={setFrom} />
        <button
          type="button"
          className="swap"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>
        <CurrencySelect label="To" value={to} codes={codes} onChange={setTo} />
      </div>
      <section className="result" aria-live="polite">
        {result}
        <button type="button" className="star" aria-pressed={saved} onClick={togglePair}>
          {saved ? '★ Saved' : '☆ Save pair'}
        </button>
      </section>
      <RateStatus
        status={latest.status}
        source={source}
        date={date}
        error={latest.error}
        onRetry={latest.retry}
      />
      <FavoritePairs pairs={availablePairs} current={pairKey} onSelect={selectPair} />
      {from === to ? (
        <p className="muted">Pick two different currencies to see the chart.</p>
      ) : (
        <RateChart key={`${from}-${to}`} from={from} to={to} />
      )}
    </main>
  )
}

export default App
```

- **Saving is an effect.** It is not drawing but keeping the browser's storage in step, and it has to run when a new,
  successful answer has arrived: that is why `latest.status` and `latest.data` are in the dependency array.
- **The `if`–`else if` chain** sets an order of preference: live if there is one; if not, the last known; if that is missing
  too, the fixed one. The three variables (`rates`, `source`, `date`) always change together, so `RateStatus` says
  exactly what the box shows.
- **The shimmering bar** only appears while loading when there is no saved table either (`source === 'fixed'`).
  Otherwise we calculate with the saved rates at once, and the update runs in the background. This approach is also
  called "stale-while-revalidate": show the old copy until the new one arrives.

:::check Check
Reload the page: the result is there at once, without the shimmering bar, and for a moment the line below says
"Loading the latest rates… Meanwhile showing the last known rates from …", then "Live rates, updated …". Now set
`SERVER_MODE` to `'offline'`: the list still has thirty currencies, and the orange strip says: "The live rates could
not be loaded (Failed to fetch). Showing the last known rates from … instead." The chart shows an error too, with a
"Try again" button. Finally, in
the developer tools, under **Application** → **Local Storage**, delete the `currency-last-rates` key and reload: now
the fixed sample rates come, with ten currencies in the list. Set `SERVER_MODE` back to `'normal'`. Congratulations,
your currency converter is done!
:::

:::mistake Common mistake
Saving without the condition: `useEffect(() => setLastRates(latest.data), [latest.data])`. While loading and after an
error, `latest.data` is still `null`, so on its very first run the effect overwrites the good copy with `null`. Offline,
the storage is empty exactly when you need it most.
:::

:::concept How does a real server cache?
In the [[headers|HTTP header]] of the response (name–value pairs that travel before the content of the response), a
server can also say how long the response may be used: `Cache-Control: max-age=3600`, for example, allows an hour. Within that hour the
browser does not even ask the server again, it answers from its own cache. The service worker of a [[PWA]] can even
keep whole pages for offline use. Our copy in `localStorage` is a simple, hand-made version of this, and it is exactly
what a currency converter needs: there is always something to calculate with, and you always know which day it is
from.
:::
