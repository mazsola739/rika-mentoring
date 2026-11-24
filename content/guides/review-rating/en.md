# What we build

The review pages of a small web shop. The Peacock Shop sells six products in peacock colours, and its customers rate
them with stars and write what they think. You build the product list, a page for every product with its reviews, a
form for giving stars and writing a review, then the averages, sorting and filters, and finally you move the reviews
to a (pretend) server, with accounts, "helpful" votes and moderation.

On the way you learn how to make a [[reusable component]]: you write the row of stars once and use it in three
places. And you see that the average, the sorted list and the filtered list are all [[derived values|derived value]]:
there is no need to store them, because we work them all out again from the reviews every time the page is drawn.

:::levels
- The product list; a click opens a product with its reviews and their stars, and a form to give stars and write a review. | about 2.5 hours
- Averages and a star breakdown, a detail page with its own address, sorting by rating and filtering by stars. | about 3 hours
- The reviews on a server: login, one review per product, "helpful" votes and moderation. | about 3 hours
:::

**Before you start you need:** the earlier lessons, above all lesson 1 (components, props, `useHashRoute`), lesson 3
(radio buttons, controlled inputs), lessons 9 and 10 (lists with `key`, adding to an array, sorting with `sort`) and
lesson 14 (`async` and `await`, loading and error states). What we reuse is recapped in a few sentences, and
everything new is explained step by step.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is in the course's repository, in the `lessons/24-review-rating/exercise` folder (the
"Exercise on GitHub" button above opens this folder on GitHub). You start the same way as in lesson 1, and its step 0
explains every command in detail. In short: open a terminal in your work folder, where the `rika-mentoring` repository
is, bring in the new lessons, then copy this lesson's `exercise` folder out of the repository as `peacock-reviews`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/24-review-rating/exercise peacock-reviews
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/24-review-rating/exercise` folder out of it into your work folder as `peacock-reviews`. You work
in your copy: the repository stays untouched, so `git pull` keeps working.

Open the `peacock-reviews` folder in your editor, and type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page,
with the title "Peacock Shop" and two short sentences under it: "Everyday things in peacock colours. Read the reviews,
then write your own." Nothing else yet: the shop is up to you.
:::

Finally, make your copy a git repository with one commit, the starting point. `npm run dev` keeps the first terminal
busy, so open a second one in the editor, in the `peacock-reviews` folder:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes the changed files back to your last commit (it does not delete the files you
created; delete those by hand), and it is worth committing after every step that works.

What is in the exercise?

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so you only use the class
  names that the steps give you (`product-card`, `stars`, `review`, `summary`…). Have a look inside anyway!
- `src/products.js`: the sample data. `PRODUCTS` holds the six products of the shop (id, name, price, picture,
  description), and `SAMPLE_REVIEWS` the first thirteen reviews.
- `public/images/`: the pictures of the products, simple drawings. Vite hands the files of the `public` folder to the
  browser as they are: the address `/images/notebook.svg` means the file `public/images/notebook.svg`.
- `src/fakeApi.js`: a pretend server that runs in your browser. You need it only in the advanced level, so leave it
  alone until then.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]], the HTML-like description of what should appear on the screen. It
gets data through its [[props]], remembers things with [[useState]], and when a state value changes, React draws it
again. `map` turns an array into a list, and every item of the list needs a unique [[key]]. If any of this feels
unfamiliar, take another look at lessons 1 and 9.
:::

### The product list

Let's start with the shop window: six cards, each with a picture, the product's name and its price. A card gets the
product in one prop, as an [[object]], because it needs all of its data. Create a `components` folder inside `src`, with
a `ProductCard.jsx` file in it:

```jsx file=src/components/ProductCard.jsx
function ProductCard({ product }) {
  return (
    <li className="product-card">
      <img className="product-card__image" src={product.image} alt="" />
      <div className="product-card__body">
        <h2 className="product-card__name">{product.name}</h2>
        <p className="product-card__price">€{product.price}</p>
      </div>
    </li>
  )
}

export default ProductCard
```

The picture's `alt` text is empty: the product's name stands right below it, and a screen reader would say it twice
otherwise. `alt=""` means "this picture is decoration, feel free to skip it". Without any `alt`, a screen reader would
read out the file name instead.

Now let's put the cards on the page. `PRODUCTS` is a [[named export]], so we import it in curly braces. Replace the
contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=1-2,13-17
import { PRODUCTS } from './products.js'
import ProductCard from './components/ProductCard.jsx'
import './App.css'

function App() {
  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
      </header>

      <ul className="product-grid">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

`map` makes a `ProductCard` from every product, with the product's `id` as its `key`. The CSS arranges the cards in a
grid (`product-grid`): it puts as many in a row as fit comfortably.

:::check Check
Six cards appear under the title, each with a picture, a name and a price: "Teal silk scarf €59", "Gold A5 notebook
€18"… In a wide window three fit in a row, in a narrower one two, and on a phone one.
:::

:::mistake Common mistake
`<ProductCard product={product} />` without a `key`. The page works, but the console (++F12++) shows a warning: "Each
child in a list should have a unique "key" prop." React uses the `key` to tell which card is which when the list
changes. In the intermediate level, when you sort the products, it will matter.
:::

:::try Try it
Show the product's description on the card too (`product.description`), in a `<p>` under the price. Too much, isn't
it? A card needs only the essentials; the description goes to the product's own page in the next step. Then delete it
again.
:::

### A product and its reviews

A click should open a product: a big picture, the description, and the reviews below. This is what a review looks like
in `src/products.js` (we added the comments here):

```js
{
  id: 'r1',
  productId: 'silk-scarf', // which product it is about
  author: 'Anna K.',
  rating: 5, // how many stars, from 1 to 5
  text: 'The colours glow and the silk feels heavy and soft. …',
  createdAt: '2026-10-02T10:00:00.000Z', // when it was written
  helpfulBy: ['a1', 'a2', 'a3', 'a4'], // needed only in the advanced level
}
```

`createdAt` is an [[ISO date]]: year-month-day, the letter `T`, then the time. Easy for a computer to read, less so
for a person, so we turn it into something friendlier before showing it. The list of reviews gets a component of its
own. Create `src/components/ReviewList.jsx`:

```jsx file=src/components/ReviewList.jsx
// From an ISO date to a readable one: '2026-10-02T10:00:00.000Z' → '2 October 2026'
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="empty">No reviews yet. Be the first to write one!</p>
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li key={review.id} className="review">
          <p className="review__meta">
            <strong>{review.author}</strong> · {formatDate(review.createdAt)}
          </p>
          <p className="review__text">{review.text}</p>
        </li>
      ))}
    </ul>
  )
}

export default ReviewList
```

- `new Date(isoDate)` makes a date from the text, and `toLocaleDateString` writes it the way a language does. `'en-GB'`
  is the [[locale]]: English, the way it is written in Britain. The second argument says what goes in: the year as a
  number, the month's full name, the day as a number.
- When a product has no reviews, the component returns a message straight away, and the list is never made: this is an
  [[early return]].

The product's page goes into `src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx
import ReviewList from './ReviewList.jsx'

function ProductPage({ product, reviews, onBack }) {
  return (
    <article className="product-page">
      <button type="button" className="back" onClick={onBack}>
        ← Back to the products
      </button>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        <ReviewList reviews={reviews} />
      </section>
    </article>
  )
}

export default ProductPage
```

`ProductPage` does not know where the visitor came from, or how to get back there. All it knows is that a click on the
button has to call the `onBack` prop: what that does is up to `App`.

On the card, the product's name becomes a button. Replace the contents of `src/components/ProductCard.jsx`:

```jsx file=src/components/ProductCard.jsx mark=1,6-10
function ProductCard({ product, onOpen }) {
  return (
    <li className="product-card">
      <img className="product-card__image" src={product.image} alt="" />
      <div className="product-card__body">
        <h2 className="product-card__name">
          <button type="button" className="product-card__link" onClick={onOpen}>
            {product.name}
          </button>
        </h2>
        <p className="product-card__price">€{product.price}</p>
      </div>
    </li>
  )
}

export default ProductCard
```

It is a real button, so it works with the keyboard too (++Tab++, then ++Enter++). That a click anywhere on the card
opens it is the CSS's doing: `product-card__link` stretches an invisible layer (`::after`) over the whole card.

Finally, `App` has to remember which product is open. That is [[state]]: the id of the open product, or [[null]],
JavaScript's "nothing", when none is open and we show the list. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,4,8-9,18-30
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import ProductCard from './components/ProductCard.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

function App() {
  const [openId, setOpenId] = useState(null) // the id of the open product, or null: the list is shown
  const openProduct = PRODUCTS.find((product) => product.id === openId)

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
      </header>

      {openProduct ? (
        <ProductPage
          product={openProduct}
          reviews={SAMPLE_REVIEWS.filter((review) => review.productId === openProduct.id)}
          onBack={() => setOpenId(null)}
        />
      ) : (
        <ul className="product-grid">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={() => setOpenId(product.id)} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
```

- [[find]] returns the first item of the array for which the function says yes, or `undefined` if there is none. While
  `openId` is `null`, no product's `id` matches it, so `openProduct` is `undefined`.
- `condition ? this : that` is the [[ternary operator]]: if a product is open, its page appears; if not, the list.
- [[filter]] keeps only the reviews of this product. It gives a new array and leaves `SAMPLE_REVIEWS` alone.
- Every card gets a small [[arrow function]] of its own: `() => setOpenId(product.id)`. The function remembers which
  product it was made for, so each one opens its own product.

:::check Check
Click the "Teal silk scarf" card: the list disappears, and in its place come a big picture, the product's name, "€59",
a description, then the "Reviews" heading and three reviews, the first starting "Anna K. · 2 October 2026". The
"← Back to the products" button takes you back to the list. The umbrella ("Gold & ruby folding umbrella") has only one
review.
:::

:::mistake Common mistake
`onOpen={setOpenId(product.id)}`, without the arrow function. That does not hand over a function: it calls `setOpenId`
at once, while drawing, for all six cards, one after the other. The last call wins: the page opens straight on the
umbrella ("Gold & ruby folding umbrella"), you never even see the list, and the "← Back to the products" button seems
dead too, because drawing the list opens the umbrella again at once. The arrow function
(`() => setOpenId(product.id)`), on the other hand, runs only on a click.
:::

:::try Try it
In `App`, change the `reviews={…}` prop to `reviews={[]}` for a moment and open a product: the "No reviews yet. Be the
first to write one!" message appears. Then change it back.
:::

### Stars: a reusable component

Every review needs stars: five of them, with as many gold as the customer gave. Stars will be needed elsewhere later
too: in the intermediate level on the cards (with an average, such as 4.7) and in the product's summary (bigger). So we
write them once, as a component that learns everything from its props: how many stars to show, and out of how many. It
does not know where it is, and knows nothing about reviews or products, so it fits anywhere. This is a
[[reusable component]].

How do you draw 4.7 stars? Put two rows of stars on top of each other: five grey ones below, five gold ones above. Then
cut the gold row off at a width: 4.7 stars out of five is 94%. The CSS does the cutting (`stars__row--on`: the row lies
over the other one, and whatever is beyond its width is not shown); we only give the width. Create
`src/components/Stars.jsx`:

```jsx file=src/components/Stars.jsx
// Stars to look at. value can be a fraction (for example 4.7); max is the number of stars.
function Stars({ value, max = 5 }) {
  // The width of the gold row: 4 stars out of 5 is 80%.
  const percent = (value / max) * 100
  const text = value.toLocaleString('en-GB', { maximumFractionDigits: 1 })

  return (
    <span className="stars" role="img" aria-label={`Rated ${text} out of ${max}`}>
      <span className="stars__row">{'★'.repeat(max)}</span>
      <span className="stars__row stars__row--on" style={{ width: `${percent}%` }}>
        {'★'.repeat(max)}
      </span>
    </span>
  )
}

export default Stars
```

- `max = 5` is a [[default parameter]]: when nobody passes a `max` prop, it is 5.
- `'★'.repeat(max)` writes the text `max` times in a row: `'★★★★★'`.
- `style={{ width: … }}` is an [[inline style]]: the outer braces belong to JSX, the inner ones are an object with the
  CSS properties in it. The width is a [[template literal]]: `${percent}%`, for example `'80%'`.
- Because of `role="img"` and `aria-label`, a screen reader treats the whole thing as one picture and says "Rated 4
  out of 5", instead of "black star" ten times.
- `toLocaleString` writes the number with at most one decimal: 4 stays 4, and 4.666… becomes 4.7.

Put the stars at the start of every review. Replace the contents of `src/components/ReviewList.jsx`:

```jsx file=src/components/ReviewList.jsx mark=1,17-22
import Stars from './Stars.jsx'

// From an ISO date to a readable one: '2026-10-02T10:00:00.000Z' → '2 October 2026'
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="empty">No reviews yet. Be the first to write one!</p>
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li key={review.id} className="review">
          <div className="review__head">
            <Stars value={review.rating} />
            <p className="review__meta">
              <strong>{review.author}</strong> · {formatDate(review.createdAt)}
            </p>
          </div>
          <p className="review__text">{review.text}</p>
        </li>
      ))}
    </ul>
  )
}

export default ReviewList
```

:::check Check
Every review starts with five stars, with as many gold as the customer gave: on the silk scarf Anna K. gave five and
Márton B. four, and on the notebook ("Gold A5 notebook") Lili H. gave three.
:::

:::mistake Common mistake
`style="width: 80%"`, as you would write it in HTML. In React `style` is an object, not text: the page goes blank, and
the console says "The `style` prop expects a mapping from style properties to values, not a string."
:::

:::try Try it
In `ReviewList`, change the stars to `<Stars value={2.5} />` for a moment: every review shows two and a half gold
stars. Then try `<Stars value={7} max={10} />`: ten stars, seven of them gold. The same component, only with other
props. Finally set it back to `<Stars value={review.rating} />`.
:::

### Stars to click

Now for the stars you click when you rate. This is a different job from the last one: `Stars` shows a value, and this
one asks for one. So it is a separate component, called `StarPicker`. Two components with one job each; that they look
alike is only down to the CSS.

Under the stars, five [[radio buttons|radio button]] do the work, as in lesson 3: radio buttons with the same `name`
form a group, and only one of them can be selected at a time. The browser gives them keyboard support for free
(++Tab++ moves into the group, the arrow keys move between the options), and a screen reader says "3 of 5". The CSS
makes the round buttons invisible, but leaves them in place, over the stars, so the clicks still go to them.

There is a little extra too: when the mouse is over the fourth star, four light up even before you click. That needs a
second piece of state, `hover`: which star the mouse is over (0 when it is over none). It only affects the look, so
`StarPicker` keeps it itself. The chosen value, on the other hand, comes from outside (`value`), and every click is
reported (`onChange`), like the slider of lesson 3: this is a [[controlled input]]. Create
`src/components/StarPicker.jsx`:

```jsx file=src/components/StarPicker.jsx
import { useState } from 'react'

const WORDS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']

function StarPicker({ value, onChange }) {
  // Which star the mouse is over (0: none). It is only for the look.
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <fieldset className="star-picker" onMouseLeave={() => setHover(0)}>
      <legend>Your rating</legend>
      <div className="star-picker__row">
        {WORDS.map((word, index) => {
          const stars = index + 1
          return (
            <label
              key={stars}
              className={stars <= shown ? 'star-picker__star is-on' : 'star-picker__star'}
              onMouseEnter={() => setHover(stars)}
            >
              <input
                type="radio"
                name="rating"
                value={stars}
                checked={value === stars}
                onChange={() => onChange(stars)}
              />
              <span aria-hidden="true">★</span>
              <span className="visually-hidden">
                {stars} out of {WORDS.length}: {word}
              </span>
            </label>
          )
        })}
        <span className="star-picker__word" aria-hidden="true">
          {shown > 0 ? WORDS[shown - 1] : 'Click a star'}
        </span>
      </div>
    </fieldset>
  )
}

export default StarPicker
```

- `WORDS` holds five words, one for every number of stars. The second parameter of `map`, `index`, counts from 0, so
  the number of stars is `index + 1`. Because this `map` function does more than return JSX (it works out `stars`
  first), it has a body in curly braces, with a `return` inside.
- `hover || value`: `||` gives its left side unless that is 0 (or empty), and its right side otherwise. When the mouse
  is over a star, that one shows; when not, the chosen value.
- `onMouseEnter` runs when the mouse moves onto an element, and `onMouseLeave` when it leaves. When the mouse leaves the
  whole group, `hover` goes back to 0.
- A star gets the `is-on` class (and turns gold) when its number is not above the value shown.
- `<fieldset>` and `<legend>` put the buttons into a group with a title. The text with the `visually-hidden` class (for
  example "4 out of 5: Very good") is not visible on the screen, but a screen reader reads it: it is the radio button's
  label. That is why the visible word at the end of the row is `aria-hidden`: otherwise it would be heard twice.

The star picker goes into a form, which the next step completes. For now it only keeps the rating: `0` until you click.
Create `src/components/ReviewForm.jsx`:

```jsx file=src/components/ReviewForm.jsx
import { useState } from 'react'
import StarPicker from './StarPicker.jsx'

function ReviewForm() {
  const [rating, setRating] = useState(0) // 0: not rated yet

  return (
    <form className="review-form">
      <h3>Write a review</h3>
      <StarPicker value={rating} onChange={setRating} />
    </form>
  )
}

export default ReviewForm
```

`onChange={setRating}` hands over the setter itself: `StarPicker` calls it with the number of stars, which is exactly
what we want to store. Finally, put the form at the bottom of the product's page. Replace the contents of
`src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=2,25
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

function ProductPage({ product, reviews, onBack }) {
  return (
    <article className="product-page">
      <button type="button" className="back" onClick={onBack}>
        ← Back to the products
      </button>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        <ReviewList reviews={reviews} />
      </section>

      <ReviewForm />
    </article>
  )
}

export default ProductPage
```

:::check Check
Open a product: under the reviews there is a "Write a review" box with five grey stars and the words "Click a star".
Move the mouse over the third star: three turn gold, with the word "Good" next to them. Click the fourth and move the
mouse away: four stay gold, "Very good". Now with the keyboard: press ++Tab++ until a frame appears around a star, then
change the rating with ++←++ and ++→++.
:::

:::mistake Common mistake
Every radio button gets a different `name` (for example `name={'rating-' + stars}`), or none at all. Clicking still
works, because `checked` decides, but the browser does not treat them as one group: the arrow keys do not move between
them, and ++Tab++ stops at all five stars.
:::

:::try Try it
Change the words in `WORDS` to your taste, for example `['Meh', 'Okay-ish', 'Nice', 'Great', 'Love it!']`. The number
of stars comes from the length of the array: take a word out, and only four stars are left.
:::

### Sending the review

Now the whole form: a name, the review and a "Send review" button, and the review appears in the list as soon as it is
sent. But where should the reviews live? So far `App` has passed `SAMPLE_REVIEWS` straight on, but now they have to
change, so they become [[state]]. Both the list (in `ProductPage`) and the form need them, so they have to live in a
common ancestor. The nearest one would be `ProductPage`, but that disappears when you go back to the list, and its
state goes with it; so they live one level higher, in `App`: this is [[lifting state up]]. The form gets a function to
report that a new review was born.

The new review must have the same shape as the samples. The browser makes the id: `crypto.randomUUID()` gives a long,
random [[UUID]] at every call. `new Date().toISOString()` is the present moment, in the same ISO form as in the sample
data. Replace the contents of `src/components/ReviewForm.jsx`:

```jsx file=src/components/ReviewForm.jsx mark=4,6-9,11-25,27-41,44,47-67
import { useState } from 'react'
import StarPicker from './StarPicker.jsx'

function ReviewForm({ productId, onAdd }) {
  const [rating, setRating] = useState(0) // 0: not rated yet
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false) // did we just send one?

  function handleSubmit(event) {
    event.preventDefault()
    setSent(false)
    if (rating === 0) {
      setError('Choose how many stars you give.')
      return
    }
    if (author.trim() === '') {
      setError('Enter your name.')
      return
    }
    if (text.trim().length < 10) {
      setError('Write at least 10 characters about the product.')
      return
    }

    onAdd({
      id: crypto.randomUUID(),
      productId,
      author: author.trim(),
      rating,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    })
    // Done: the form is emptied for the next review.
    setRating(0)
    setAuthor('')
    setText('')
    setError('')
    setSent(true)
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a review</h3>
      <StarPicker value={rating} onChange={setRating} />
      <label className="field">
        <span>Your name</span>
        <input value={author} onChange={(event) => setAuthor(event.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        <span>Your review</span>
        <textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="form-thanks" role="status">
          Thank you! Your review is live.
        </p>
      )}
      <button type="submit" className="button--primary">
        Send review
      </button>
    </form>
  )
}

export default ReviewForm
```

- The name and the review are [[controlled inputs|controlled input]]: their values come from state, and every keystroke
  updates it. The field for longer text is a [[textarea]].
- `onSubmit` runs when the form is sent: by a click on the button, or by ++Enter++ in the name field.
  `event.preventDefault()` stops the browser's [[default behavior]], which would be to reload the page.
- The checks run in order, and at the first problem `return` leaves the function. [[trim]] cuts the spaces off both
  ends of the text, so a name of nothing but spaces counts as empty too.
- `onAdd` gets an object: the new review. `productId` on its own means the same as `productId: productId`, because the
  key and the variable have the same name. After sending, every field is emptied.
- `{error && …}` draws the error message only when there is one: this is [[conditional rendering]]. Because of
  `role="alert"`, a screen reader reads it out at once.

`ProductPage` only passes `App`'s function on to the form. Replace the contents of `src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=4,25
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

function ProductPage({ product, reviews, onBack, onAddReview }) {
  return (
    <article className="product-page">
      <button type="button" className="back" onClick={onBack}>
        ← Back to the products
      </button>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        <ReviewList reviews={reviews} />
      </section>

      <ReviewForm productId={product.id} onAdd={onAddReview} />
    </article>
  )
}

export default ProductPage
```

In `App` the reviews become state, and `addReview` replaces them with a **new** array: the new review first, then all
the old ones, with the [[spread]] (`...`). Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=8,12-15,27,29
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import ProductCard from './components/ProductCard.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

function App() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS)
  const [openId, setOpenId] = useState(null) // the id of the open product, or null: the list is shown
  const openProduct = PRODUCTS.find((product) => product.id === openId)

  function addReview(review) {
    // A new array: the new review first, then all the old ones.
    setReviews([review, ...reviews])
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
      </header>

      {openProduct ? (
        <ProductPage
          product={openProduct}
          reviews={reviews.filter((review) => review.productId === openProduct.id)}
          onBack={() => setOpenId(null)}
          onAddReview={addReview}
        />
      ) : (
        <ul className="product-grid">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={() => setOpenId(product.id)} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
```

:::check Check
Open the silk scarf and click "Send review" without filling anything in: "Choose how many stars you give." Give four
stars, enter "Test Ella" as your name and "Soft and warm, I love it!" as the review, then send it: the review appears at
the top of the list with four stars and today's date, the form is emptied, and under it you read "Thank you! Your
review is live." Now reload the page (++F5++): your review is gone. State lives only while the page is open; in the
advanced level the reviews go to a server. The beginner level is done: commit it!
:::

:::mistake Common mistake
`reviews.push(review)`, then `setReviews(reviews)`. The form is emptied and "Thank you!" appears, but the review does
not get into the list: `push` changes the old array, and React sees that it got the very same array back, so it does
not draw `App` again. State is never changed in place: it always needs a new array or object, as in lesson 9.
:::

:::try Task
While the review is shorter than 10 characters, show under the text field how many are still missing: "6 more
characters". The number is `10 - text.trim().length`; draw the line only when the number is above 0 and the field is
not empty.
:::

## Intermediate level {level=2}

### An address for every product

The open product lives in state now, and that has a price. Reload the page, and you are back on the list. The browser's
Back button does not go to the list, it leaves the site. And you cannot send anyone a link to a product. A real detail
page has an address of its own: the silk scarf lives at `#/product/silk-scarf`, the notebook at `#/product/notebook`.
The address decides what the app shows: this is [[routing]].

You know the router from lesson 1: the `useHashRoute` hook watches the part of the address after the `#`, the
[[hash]], and returns it as a path: `'/product/silk-scarf'`, or `'/'` for the list. If you have your project from lesson
1 or 23, copy the file from there; if not, create `src/useHashRoute.js`:

```js file=src/useHashRoute.js
import { useEffect, useState } from 'react'

const currentPath = () => window.location.hash.slice(1) || '/'

// Returns the part of the address after the #, and updates when it changes.
function useHashRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    // Clean up: when the component disappears, we stop listening.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export default useHashRoute
```

A quick recap: `slice(1)` cuts off the `#`, and `|| '/'` means "or `'/'` if nothing is left". `useState(currentPath)`
reads the address once, at the start (a [[lazy initial state]]). The effect listens to the browser's `hashchange`
event, which fires whenever the part after the `#` changes, and its [[cleanup function]] unsubscribes.

One address pattern serves all six products: `/product/:id`, where `:id` always stands for the product's id
(`silk-scarf`, `notebook`…). This is a [[dynamic route]]. `App` reads the id from the path and chooses between three
things: the list, a product's page, or a message when there is no such product. For
three cases the ternary operator gets hard to read, so we put what to show into a `page` variable, with an
`if … else if … else`. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=3,8-12,16-18,25-53,62
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import useHashRoute from './useHashRoute.js'
import ProductCard from './components/ProductCard.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Any other path (for example the list: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS)
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  function addReview(review) {
    // A new array: the new review first, then all the old ones.
    setReviews([review, ...reviews])
  }

  // What the page shows: the list, a product, or that there is no such product.
  let page
  if (productId === null) {
    page = (
      <ul className="product-grid">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    )
  } else if (openProduct) {
    page = (
      <ProductPage
        key={openProduct.id}
        product={openProduct}
        reviews={reviews.filter((review) => review.productId === openProduct.id)}
        onAddReview={addReview}
      />
    )
  } else {
    page = (
      <div className="state">
        <p>There is no such product.</p>
        <a className="back" href="#/">
          ← Back to the products
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
      </header>

      {page}
    </main>
  )
}

export default App
```

- `productIdFrom` checks whether the path starts with `/product/` (`startsWith`), and if so, returns the rest
  (`slice`): the product's id. The address `#/product/teapot` gives `'teapot'`, but there is no such product, so
  `openProduct` is `undefined` and the third branch runs.
- JSX is a value too, so it can go into a variable: `page` holds a list, or a product's page, or a message, and
  `return` simply draws whatever is in it.
- `key={openProduct.id}`: a [[key]] works outside lists too. When it changes, React throws the old component away and
  makes a brand new one, with fresh state. If you step from one product's page straight to another one with the
  browser's Back button, your half-written review does not move over to the other product.

On the card the button becomes a link to the product's address. Replace the contents of
`src/components/ProductCard.jsx`:

```jsx file=src/components/ProductCard.jsx mark=1,7,9
function ProductCard({ product }) {
  return (
    <li className="product-card">
      <img className="product-card__image" src={product.image} alt="" />
      <div className="product-card__body">
        <h2 className="product-card__name">
          <a className="product-card__link" href={`#/product/${product.id}`}>
            {product.name}
          </a>
        </h2>
        <p className="product-card__price">€{product.price}</p>
      </div>
    </li>
  )
}

export default ProductCard
```

This is an ordinary link. A click on it changes only the hash: the browser loads no new page, it fires the `hashchange`
event, and our hook hands the new path to `App`. On the product's page, the "← Back to the products" button becomes a
link too, pointing to `#/`. Replace the contents of `src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=1,5-9,13,15
import { useEffect } from 'react'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

function ProductPage({ product, reviews, onAddReview }) {
  // A product's page always starts at the top, however far down the list you scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Back to the products
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        <ReviewList reviews={reviews} />
      </section>

      <ReviewForm productId={product.id} onAdd={onAddReview} />
    </article>
  )
}

export default ProductPage
```

If you click a card at the bottom of the list, the new page would otherwise stay scrolled down, because the browser
keeps the scroll position. `window.scrollTo(0, 0)` scrolls to the top. Because of the empty [[dependency array]]
(`[]`), the effect runs only once, when the page appears; and as `App` gives every product its own `key`, that happens
once for every product.

:::check Check
Click the "Teal silk scarf" card: the address bar ends with `#/product/silk-scarf`. Reload the page: the scarf stays.
The browser's Back button takes you to the list, Forward to the scarf again. Change the address by hand to
`#/product/teapot`: "There is no such product.", with a link back to the products under it.
:::

:::concept Why is there a # in the address?
A server like GitHub Pages serves files. For the address `/product/silk-scarf` it would look for a file of that name,
find none, and answer with a 404, for example when someone reloads the page or opens a link you sent. The part after
the `#`, however, never even reaches the server: the server always sends `index.html`, and our code reads the rest.
That is why a hash router works anywhere, without setting up the server. (Lesson 20's box "What about React Router?"
told you that React Router can also give nicer addresses without a `#`, but those need the server to be set up too.)
:::

:::mistake Common mistake
`href="/product/silk-scarf"`, without the `#`. The browser then leaves the page and asks the server for that address.
The app starts from scratch, our router, which reads only the part after the `#`, shows the list, and the reviews you
wrote are lost too.
:::

### The average: derived data

The most important number on a review page is the average: how many stars a product got on average, and from how many
reviews. On the product's page we also show how the stars are spread: how many customers gave five, how many four, and
so on.

None of these will be state. They all follow from the list of reviews, so we work them out again at every drawing:
they are [[derived values|derived value]]. If the average were kept in state, it would have to be updated with every
new review, and if we forgot once, the page would lie. This way, after a new review the average is simply right,
because the next drawing already counts from the new list.

The counting functions have nothing to do with React, so they go into a file of their own. Create `src/stats.js`:

```js file=src/stats.js
// Derived data: none of it is in state; it is always worked out from the list of reviews.

// The reviews of one product, out of all of them.
export function reviewsOf(reviews, productId) {
  return reviews.filter((review) => review.productId === productId)
}

// How many reviews there are, their average, and how many there are for each number of stars.
export function summarize(reviews) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let total = 0
  for (const review of reviews) {
    total += review.rating
    counts[review.rating] += 1
  }
  return {
    count: reviews.length,
    average: reviews.length > 0 ? total / reviews.length : 0,
    counts,
  }
}

// 4.666… → '4.7': one decimal place.
export function formatRating(value) {
  return value.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// 3 → '3 reviews', 1 → '1 review'
export function reviewCount(count) {
  return count === 1 ? '1 review' : `${count} reviews`
}
```

- `summarize` goes through the reviews once, with a `for … of` [[loop]]. On the way it adds up the stars (`total`),
  and counts in the `counts` object how often 1, 2 … 5 came up. `counts[review.rating]` is the value under the key that
  is in `review.rating`: for a 4-star review, `counts[4]` grows by one.
- The average is the total divided by the count. When a product has no reviews yet, we give 0, because `0 / 0` in
  JavaScript is `NaN` ("not a number"), which would look rather odd on the page.
- `formatRating` always writes exactly one decimal: 4 becomes "4.0" too, so the numbers on the cards are all the same
  length.
- `reviewCount` is needed in two places (on the card and in the summary). English needs "1 review" but "2 reviews",
  and this function makes that choice in one place.

Let's start with `App`: it works out every card's own summary and passes it on in a `stats` prop; and from now on the
product's page gets its reviews from `reviewsOf`. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=4,32,41
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import useHashRoute from './useHashRoute.js'
import { reviewsOf, summarize } from './stats.js'
import ProductCard from './components/ProductCard.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Any other path (for example the list: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS)
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  function addReview(review) {
    // A new array: the new review first, then all the old ones.
    setReviews([review, ...reviews])
  }

  // What the page shows: the list, a product, or that there is no such product.
  let page
  if (productId === null) {
    page = (
      <ul className="product-grid">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} stats={summarize(reviewsOf(reviews, product.id))} />
        ))}
      </ul>
    )
  } else if (openProduct) {
    page = (
      <ProductPage
        key={openProduct.id}
        product={openProduct}
        reviews={reviewsOf(reviews, openProduct.id)}
        onAddReview={addReview}
      />
    )
  } else {
    page = (
      <div className="state">
        <p>There is no such product.</p>
        <a className="back" href="#/">
          ← Back to the products
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
      </header>

      {page}
    </main>
  )
}

export default App
```

Nothing has changed on the page yet, because the card does not use the `stats` prop. Now it shows it: it uses the same
`Stars` component as the reviews, only with an average this time. Replace the contents of
`src/components/ProductCard.jsx`:

```jsx file=src/components/ProductCard.jsx mark=1-2,4,14-21
import Stars from './Stars.jsx'
import { formatRating, reviewCount } from '../stats.js'

function ProductCard({ product, stats }) {
  return (
    <li className="product-card">
      <img className="product-card__image" src={product.image} alt="" />
      <div className="product-card__body">
        <h2 className="product-card__name">
          <a className="product-card__link" href={`#/product/${product.id}`}>
            {product.name}
          </a>
        </h2>
        {stats.count > 0 ? (
          <p className="product-card__rating">
            <Stars value={stats.average} />
            {formatRating(stats.average)} · {reviewCount(stats.count)}
          </p>
        ) : (
          <p className="product-card__rating">No reviews yet</p>
        )}
        <p className="product-card__price">€{product.price}</p>
      </div>
    </li>
  )
}

export default ProductCard
```

The file is in the `components` folder, so `'../stats.js'` first steps up one folder (`..`) to `src`.

The product's page shows a summary: the average in big numbers, the stars under it, and next to them a bar for every
number of stars, as long as the share of customers who gave that many. Create `src/components/RatingSummary.jsx`:

```jsx file=src/components/RatingSummary.jsx
import Stars from './Stars.jsx'
import { formatRating, reviewCount } from '../stats.js'

// The average in big numbers, and a bar for every number of stars, from 5 down to 1.
function RatingSummary({ stats }) {
  return (
    <div className="summary">
      <div className="summary__score">
        <strong>{formatRating(stats.average)}</strong>
        <Stars value={stats.average} />
        <span className="summary__count">Based on {reviewCount(stats.count)}</span>
      </div>

      <ul className="summary__bars">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = stats.counts[stars]
          const percent = (count / stats.count) * 100
          return (
            <li key={stars} className="bar">
              <span className="bar__label">{stars} ★</span>
              <span className="bar__track" aria-hidden="true">
                <span className="bar__fill" style={{ width: `${percent}%` }} />
              </span>
              <span className="bar__count">{count}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RatingSummary
```

`[5, 4, 3, 2, 1]` is an array written on the spot: the bars start with the five-star ones at the top. A bar's fill is
made with the same trick as the stars: a width given in an inline style. `Stars` is bigger here, but it did not have to
change for that: the CSS gives it a bigger font size inside the summary (`.summary__score .stars`).

The product's page works out the summary and shows it when there is at least one review. Replace the contents of
`src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=2-3,8-9,33
import { useEffect } from 'react'
import { summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

function ProductPage({ product, reviews, onAddReview }) {
  // Derived data: worked out at every drawing from the current list of reviews.
  const stats = summarize(reviews)

  // A product's page always starts at the top, however far down the list you scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Back to the products
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        {stats.count > 0 && <RatingSummary stats={stats} />}
        <ReviewList reviews={reviews} />
      </section>

      <ReviewForm productId={product.id} onAdd={onAddReview} />
    </article>
  )
}

export default ProductPage
```

:::check Check
The cards now show stars and the average: "4.7 · 3 reviews" on the silk scarf (four and two thirds stars gold),
"5.0 · 1 review" on the umbrella. Open the scarf: the summary shows a big "4.7", "Based on 3 reviews", 2 at the "5 ★"
bar, 1 at "4 ★" and 0 at the others. Write a one-star review: the average drops to 3.8 at once, and the "1 ★" bar
gets a gold stripe too, with a 1 next to it. Go back to the list: the scarf's card now says "3.8 · 4 reviews".
:::

:::mistake Common mistake
Keeping the average in a separate `useState`, and updating it from a `useEffect` whenever the reviews change. It works,
but the page is drawn twice at every change, and if a dependency is ever left out, the average no longer comes from the
real reviews. If something can be worked out from the state, work it out: do not store it.
:::

:::try Task
In the summary, under the count, show how many customers recommend the product, that is, what share gave 4 or 5 stars:
"67% of customers recommend it". The number: `Math.round(((stats.counts[4] + stats.counts[5]) / stats.count) * 100)`.
:::

### Sorting

Shoppers like to see the best first: the product list should be sortable by rating, number of reviews and price, and
on a product's page the reviews by date and by stars.

You know [[sort]] from lesson 10: it takes a [[compare function]] that says which of two items (`a` and `b`) comes
first. A negative number means `a`, a positive one `b`. For numbers that is a subtraction: `a.price - b.price` gives
rising order, `b.price - a.price` falling order. And one important property: `sort` [[sorts in place]], that is, it
rearranges the array itself. So we never sort state or a prop directly, only a new array.

A [[drop-down list]] chooses the sorting. It is needed in two places (for the products and for the reviews), only with
different options, so it becomes a reusable component too: it gets the options in a prop. Every sorting is described by
an object: its label (`label`) and its compare function (`compare`). Create `src/components/SortSelect.jsx`:

```jsx file=src/components/SortSelect.jsx
// A drop-down list for sorting. Every key of sorts is one sorting: { label, compare }.
function SortSelect({ sorts, value, onChange }) {
  return (
    <label className="sort-select">
      <span>Sort by</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {Object.keys(sorts).map((key) => (
          <option key={key} value={key}>
            {sorts[key].label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SortSelect
```

`Object.keys(sorts)` lists the keys of the sortings (for example `['rating', 'reviews', 'price']`), and each one
becomes an `<option>`. A `<select>` is a controlled input too: `value` says which option shows.

The product list is now big enough for a component of its own, with its own sorting state. Create
`src/components/ProductList.jsx`:

```jsx file=src/components/ProductList.jsx
import { useState } from 'react'
import { PRODUCTS } from '../products.js'
import { reviewsOf, summarize } from '../stats.js'
import ProductCard from './ProductCard.jsx'
import SortSelect from './SortSelect.jsx'

const PRODUCT_SORTS = {
  rating: { label: 'Top rated', compare: (a, b) => b.stats.average - a.stats.average },
  reviews: { label: 'Most reviews', compare: (a, b) => b.stats.count - a.stats.count },
  price: { label: 'Cheapest first', compare: (a, b) => a.price - b.price },
}

function ProductList({ reviews }) {
  const [sort, setSort] = useState('rating')

  // Every product gets its summary next to it, then we sort them. All of it is derived data.
  const items = PRODUCTS.map((product) => ({
    ...product,
    stats: summarize(reviewsOf(reviews, product.id)),
  })).sort(PRODUCT_SORTS[sort].compare)

  return (
    <>
      <div className="toolbar">
        <SortSelect sorts={PRODUCT_SORTS} value={sort} onChange={setSort} />
      </div>

      <ul className="product-grid">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} stats={item.stats} />
        ))}
      </ul>
    </>
  )
}

export default ProductList
```

- `map` makes a new object from every product: all of the product's data ([[spread]]), plus a `stats` field. The arrow
  function returns an object here, so it goes in round brackets: `(product) => ({ … })`. Without them, JavaScript
  would take the curly braces for the function's body.
- `map` gives a new array, so `sort` may rearrange it: `PRODUCTS` is left alone.
- `PRODUCT_SORTS[sort].compare`: the compare function of the chosen sorting. The `sort` state keeps only the key
  (`'rating'`); the function is always taken from `PRODUCT_SORTS`.
- `<>` and `</>` are a [[Fragment]]: they hold two elements together without adding an extra `<div>` around them.

For the reviews we sort by date too. The ISO dates do not need converting for that: since they start with the year,
followed by the month and the day, their alphabetical order is their time order as well. [[localeCompare]] compares two
texts: `b.createdAt.localeCompare(a.createdAt)` puts the newest first. Replace the contents of
`src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=1,4,8-12,15,17-18,43-48
import { useEffect, useState } from 'react'
import { summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Newest first', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Highest rated first', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Lowest rated first', compare: (a, b) => a.rating - b.rating },
}

function ProductPage({ product, reviews, onAddReview }) {
  const [sort, setSort] = useState('newest')
  const stats = summarize(reviews)
  // sort works in place, so we copy the array first: we never change a prop.
  const sorted = [...reviews].sort(REVIEW_SORTS[sort].compare)

  // A product's page always starts at the top, however far down the list you scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Back to the products
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        {stats.count > 0 && <RatingSummary stats={stats} />}
        {stats.count > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
          </div>
        )}
        <ReviewList reviews={sorted} />
      </section>

      <ReviewForm productId={product.id} onAdd={onAddReview} />
    </article>
  )
}

export default ProductPage
```

In `App`, `ProductList` takes the list's place, and since it draws the cards now, the imports of `ProductCard` and
`summarize` go. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=4-5,29
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import useHashRoute from './useHashRoute.js'
import { reviewsOf } from './stats.js'
import ProductList from './components/ProductList.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Any other path (for example the list: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS)
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  function addReview(review) {
    // A new array: the new review first, then all the old ones.
    setReviews([review, ...reviews])
  }

  // What the page shows: the list, a product, or that there is no such product.
  let page
  if (productId === null) {
    page = <ProductList reviews={reviews} />
  } else if (openProduct) {
    page = (
      <ProductPage
        key={openProduct.id}
        product={openProduct}
        reviews={reviewsOf(reviews, openProduct.id)}
        onAddReview={addReview}
      />
    )
  } else {
    page = (
      <div className="state">
        <p>There is no such product.</p>
        <a className="back" href="#/">
          ← Back to the products
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
      </header>

      {page}
    </main>
  )
}

export default App
```

:::check Check
Reload the page first (++F5++): the one-star review from the last step goes, and only the sample reviews are left.
Above the list there is a "Sort by" list set to "Top rated": first the umbrella (5.0), then the scarf (4.7), the print
(4.5), the notebook (4.0), the tote bag (3.7) and the phone case (3.5). "Cheapest first": the notebook (€18) comes first
and the scarf (€59) last. On the tote bag's page ("Ruby canvas tote bag"), "Newest first" puts James W. (8 November
2026) at the top, and "Lowest rated first" Dóra P. with two stars.
:::

:::mistake Common mistake
`reviews.sort(…)`, without a copy. Nothing seems wrong yet, because `App` passes a new array made by `reviewsOf`. But
`ProductPage` cannot know that: if it ever got `App`'s state directly, `sort` would rearrange it behind React's back.
Props and state are never changed in place, and that goes for sorting too: `[...reviews].sort(…)`, or [[toSorted]],
which gives a new array from the start: `reviews.toSorted(…)`.
:::

:::try Task
Add a "Most expensive first" sorting to the products: one new line in `PRODUCT_SORTS`. The drop-down list picks it up
by itself, because it builds its options from that object.
:::

### Filtering

Last come the filters. On the product list, buttons should let you show only the well-rated products (at least 4, or at
least 4.5 stars). And on a product's page the bars of the summary become buttons: a click on the "5 ★" bar keeps only
the five-star reviews.

Filtering is the job of [[filter]], and it gets on well with sorting: first we filter, then we sort. `filter` gives a
new array, so `sort` then rearranges that one, and no copy is needed. The buttons can be switched on and off, so they
get an [[aria-pressed]] attribute: that is how a screen reader (and the CSS) knows which one is on.

Let's start with the products. Replace the contents of `src/components/ProductList.jsx`:

```jsx file=src/components/ProductList.jsx mark=13-17,21,23,27-29,35-47,50-58
import { useState } from 'react'
import { PRODUCTS } from '../products.js'
import { reviewsOf, summarize } from '../stats.js'
import ProductCard from './ProductCard.jsx'
import SortSelect from './SortSelect.jsx'

const PRODUCT_SORTS = {
  rating: { label: 'Top rated', compare: (a, b) => b.stats.average - a.stats.average },
  reviews: { label: 'Most reviews', compare: (a, b) => b.stats.count - a.stats.count },
  price: { label: 'Cheapest first', compare: (a, b) => a.price - b.price },
}

const MIN_RATINGS = [
  { value: 0, label: 'All' },
  { value: 4, label: '4 ★ & up' },
  { value: 4.5, label: '4.5 ★ & up' },
]

function ProductList({ reviews }) {
  const [sort, setSort] = useState('rating')
  const [minRating, setMinRating] = useState(0)

  // Every product gets its summary next to it, then we filter and sort them. All of it is derived data.
  const items = PRODUCTS.map((product) => ({
    ...product,
    stats: summarize(reviewsOf(reviews, product.id)),
  }))
    .filter((item) => item.stats.average >= minRating)
    .sort(PRODUCT_SORTS[sort].compare)

  return (
    <>
      <div className="toolbar">
        <SortSelect sorts={PRODUCT_SORTS} value={sort} onChange={setSort} />
        <div className="chips" role="group" aria-label="At least this many stars">
          {MIN_RATINGS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="chip"
              aria-pressed={minRating === option.value}
              onClick={() => setMinRating(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="product-grid">
          {items.map((item) => (
            <ProductCard key={item.id} product={item} stats={item.stats} />
          ))}
        </ul>
      ) : (
        <p className="empty">No product matches the filter.</p>
      )}
    </>
  )
}

export default ProductList
```

- `MIN_RATINGS` is the list of filter buttons: each has a value and a label. 0 means "any", since every average is at
  least 0.
- `.map(…).filter(…).sort(…)` is a chain: each step works on the result of the one before. When it does not fit on one
  line, the next step goes on a new line, starting with the dot.
- `role="group"` and `aria-label` put the buttons into a named group for screen readers.

The bars of the summary become buttons. The summary does not know how filtering works: it gets which number of stars
is chosen (`filter`), and reports clicks (`onFilter`). A click on the bar that is already chosen switches the filter off: it
becomes 0, which means "every review". Replace the contents of `src/components/RatingSummary.jsx`:

```jsx file=src/components/RatingSummary.jsx mark=4-5,19-33
import Stars from './Stars.jsx'
import { formatRating, reviewCount } from '../stats.js'

// The average in big numbers, and a bar for every number of stars. A click on a bar shows only those reviews.
function RatingSummary({ stats, filter, onFilter }) {
  return (
    <div className="summary">
      <div className="summary__score">
        <strong>{formatRating(stats.average)}</strong>
        <Stars value={stats.average} />
        <span className="summary__count">Based on {reviewCount(stats.count)}</span>
      </div>

      <ul className="summary__bars">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = stats.counts[stars]
          const percent = (count / stats.count) * 100
          return (
            <li key={stars}>
              <button
                type="button"
                className="bar"
                aria-pressed={filter === stars}
                aria-label={`${stars}-star reviews: ${count}`}
                disabled={count === 0}
                onClick={() => onFilter(filter === stars ? 0 : stars)}
              >
                <span className="bar__label">{stars} ★</span>
                <span className="bar__track" aria-hidden="true">
                  <span className="bar__fill" style={{ width: `${percent}%` }} />
                </span>
                <span className="bar__count">{count}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RatingSummary
```

`disabled={count === 0}` disables the bars that have no reviews: filtering for them would make no sense anyway. The
`aria-label` gives the button its name for screen readers, because "5 ★ 2" read out loud is rather a puzzle.

On the product's page the filter is new state. When it is on, a line next to the sorting tells how many reviews show,
with a button that switches it off. Replace the contents of `src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=16,18-21,45,49-56,59
import { useEffect, useState } from 'react'
import { summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Newest first', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Highest rated first', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Lowest rated first', compare: (a, b) => a.rating - b.rating },
}

function ProductPage({ product, reviews, onAddReview }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0: every review, 1–5: only the ones with that many stars
  const stats = summarize(reviews)
  // First filter, then sort. filter gives a new array, so sort no longer rearranges the prop.
  const visible = reviews
    .filter((review) => filter === 0 || review.rating === filter)
    .sort(REVIEW_SORTS[sort].compare)

  // A product's page always starts at the top, however far down the list you scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Back to the products
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        {stats.count > 0 && <RatingSummary stats={stats} filter={filter} onFilter={setFilter} />}
        {stats.count > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
            {filter > 0 && (
              <p className="filter-note">
                Only {filter}-star reviews: {visible.length} of {reviews.length}
                <button type="button" className="link-button" onClick={() => setFilter(0)}>
                  Show all
                </button>
              </p>
            )}
          </div>
        )}
        <ReviewList reviews={visible} />
      </section>

      <ReviewForm productId={product.id} onAdd={onAddReview} />
    </article>
  )
}

export default ProductPage
```

`filter === 0 || review.rating === filter` is true when there is no filter, **or** when the review has exactly the
chosen number of stars. `||` starts with its left side here too: when that is true, it does not even look at the right.

:::check Check
Next to the sorting above the products there are three buttons, with "All" switched on. "4 ★ & up": four products
remain, the tote bag and the phone case disappear. "4.5 ★ & up": only the umbrella, the scarf and the print. Open the
tote bag and click the "5 ★" bar in the summary: only Eszter N.'s review is left, and next to the sorting you read
"Only 5-star reviews: 1 of 3", with a "Show all" button. Click the bar again (or the button): all three are back. The
"1 ★" bar is grey and cannot be clicked. The intermediate level is done: commit it!
:::

:::mistake Common mistake
Leaving `filter === 0 ||` out of the condition. At the start `filter` is 0, and no review has 0 stars, so the list is
empty: "No reviews yet", although the summary counts three.
:::

:::try Try it
Show the share next to the count at the end of each bar, for example "2 (67%)". `percent` is already there in the
`map`; `Math.round(percent)` rounds it.
:::

## Advanced level {level=3}

### The reviews on a server

Your reviews live only in your browser's memory now: one reload, and they are gone, and nobody else ever sees them. A
real review site keeps its reviews on a [[server]], in a database, and every visitor fetches them from there. The
browser sends requests (give me the reviews, save this new one), and the server answers.

This course uses no outside services, so the exercise brings a pretend server: `src/fakeApi.js`. It runs in your
browser, but it behaves like a real one:

- it keeps its data in collections (here `reviews` and `users`), and every item gets an `id` and a `createdAt` date
  when it is created;
- every request takes a little time, as on the internet, and now and then a request fails, as real ones sometimes do;
- its "database" is a single localStorage key, so what it saved is still there after a reload, and two tabs of the
  browser behave like two devices that use the same server.

The comment at the top of the file lists its requests: `list` (every item), `create` (a new item), `update` (changing
an item), `remove` (deleting) and friends. Each returns a [[Promise]], so you wait for it with `await`, and catch its
errors with [[try/catch]], just like `fetch` in lesson 14.

First the server has to be started. Create `src/api.js`:

```js file=src/api.js
import { createMockApi } from './fakeApi.js'
import { SAMPLE_REVIEWS } from './products.js'

// The shop's pretend server. Its database starts with the sample reviews and one account, the moderator's.
// The accounts (users) are needed from the next steps on.
export const api = createMockApi('peacock-shop', {
  seed: {
    reviews: SAMPLE_REVIEWS,
    users: [{ id: 'moderator', name: 'Moderator', role: 'moderator' }],
  },
  latency: [400, 900], // every request takes 0.4–0.9 seconds
  failRate: 0.1, // and roughly one in ten fails
})
```

`seed` is the starting data: the database starts with it when nothing is saved in your browser yet. When something is,
it carries on with the saved data.

Loading, keeping and sending the reviews now goes into a [[custom hook]]. That keeps `App` short, and everything that
talks to the server is in one place. Create `src/useReviews.js`:

```js file=src/useReviews.js
import { useEffect, useState } from 'react'
import { api } from './api.js'

// Everything about the reviews on the server: loading, status, a new review.
function useReviews() {
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' or 'error'
  const [attempt, setAttempt] = useState(0) // when it grows, we load again

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const list = await api.list('reviews')
        if (ignore) return
        setReviews(list)
        setStatus('ready')
      } catch {
        if (!ignore) setStatus('error')
      }
    }
    load()
    // Clean up: if we load again meanwhile, or the component disappears, the old answer no longer counts.
    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  async function addReview(data) {
    const created = await api.create('reviews', data)
    // Updater function: the list may have changed while we waited, so we add to the newest one.
    setReviews((current) => [created, ...current])
  }

  return { reviews, status, retry, addReview }
}

export default useReviews
```

- The effect's own function cannot be `async` (React wants a cleanup function from it, not a Promise), so we write an
  async `load` function inside it and call it at once, as in lesson 14.
- `ignore` belongs to the cleanup. If the answer arrives when nobody needs it any more (we asked again meanwhile, or the
  component disappeared), we do not overwrite the state with it. This guards against a [[race condition]], where the
  older of two answers arrives last.
- `attempt` is a counter in the [[dependency array]]: `retry` increases it, and that makes React run the effect again,
  that is, load again.
- `addReview` waits for the server, and puts the new review into the list only after a successful answer. We keep the
  copy the server returned (`created`), because that one has the `id` and the `createdAt`. `setReviews` gets an
  [[updater function]] this time: the `await` takes a little while, and if someone changed the list meanwhile,
  `current` already contains that.
- If the server fails, `api.create` throws an error, and since there is no `try/catch` here, the error travels on to
  whoever called `addReview`: the form will catch it and show it.

`App` gets the reviews from the hook, and shows when they are loading, or when something went wrong. Replace the
contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=1,3,16,21,23-38
import { PRODUCTS } from './products.js'
import useHashRoute from './useHashRoute.js'
import useReviews from './useReviews.js'
import { reviewsOf } from './stats.js'
import ProductList from './components/ProductList.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Any other path (for example the list: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const { reviews, status, retry, addReview } = useReviews()
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  // What the page shows: loading, an error, the list, a product, or that there is no such product.
  let page
  if (status === 'loading') {
    page = (
      <p className="state" role="status">
        Loading reviews…
      </p>
    )
  } else if (status === 'error') {
    page = (
      <div className="state state--error" role="alert">
        <p>The reviews could not be loaded.</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  } else if (productId === null) {
    page = <ProductList reviews={reviews} />
  } else if (openProduct) {
    page = (
      <ProductPage
        key={openProduct.id}
        product={openProduct}
        reviews={reviewsOf(reviews, openProduct.id)}
        onAddReview={addReview}
      />
    )
  } else {
    page = (
      <div className="state">
        <p>There is no such product.</p>
        <a className="back" href="#/">
          ← Back to the products
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
      </header>

      {page}
    </main>
  )
}

export default App
```

`const { reviews, status, retry, addReview } = useReviews()` is [[destructuring]]: the hook returns an object, and this
line takes its four fields out of it, each under its own name. The imports of `useState` and `SAMPLE_REVIEWS` go,
because the reviews live in the hook from now on, and the sample reviews go to the server.

The form now has to wait for the server. While the review is on its way, the button is disabled and says "Sending…", so
it cannot be sent twice. If the server fails, what you typed stays, so you can try again. `id` and `createdAt` go,
because the server gives them from now on. Replace the contents of `src/components/ReviewForm.jsx`:

```jsx file=src/components/ReviewForm.jsx mark=10,12,28,30-41,66-67
import { useState } from 'react'
import StarPicker from './StarPicker.jsx'

function ReviewForm({ productId, onAdd }) {
  const [rating, setRating] = useState(0) // 0: not rated yet
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false) // did we just send one?
  const [sending, setSending] = useState(false) // is the review on its way to the server?

  async function handleSubmit(event) {
    event.preventDefault()
    setSent(false)
    if (rating === 0) {
      setError('Choose how many stars you give.')
      return
    }
    if (author.trim() === '') {
      setError('Enter your name.')
      return
    }
    if (text.trim().length < 10) {
      setError('Write at least 10 characters about the product.')
      return
    }

    setSending(true)
    setError('')
    try {
      // The server gives the id and the date from now on.
      await onAdd({ productId, author: author.trim(), rating, text: text.trim() })
      // Done: the form is emptied for the next review.
      setRating(0)
      setAuthor('')
      setText('')
      setSent(true)
    } catch {
      setError('The server is not answering. Your review is still here: try again!')
    }
    setSending(false)
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a review</h3>
      <StarPicker value={rating} onChange={setRating} />
      <label className="field">
        <span>Your name</span>
        <input value={author} onChange={(event) => setAuthor(event.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        <span>Your review</span>
        <textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="form-thanks" role="status">
          Thank you! Your review is live.
        </p>
      )}
      <button type="submit" className="button--primary" disabled={sending}>
        {sending ? 'Sending…' : 'Send review'}
      </button>
    </form>
  )
}

export default ReviewForm
```

`handleSubmit` is an [[async function]] now, because `await onAdd(…)` waits until the server answers. If `onAdd`
throws an error, the code goes on in `catch`, and the fields are not emptied: your text stays. `setSending(false)`
comes after the `try/catch`, so it runs both on success and on failure.

:::check Check
Reload the page: for a moment "Loading reviews…" shows, then the products. Write a review about the umbrella: the
button says "Sending…" for a little while, then the review appears. Reload: it is still there! Open the same address in
a second tab: it shows there too. Sometimes "The reviews could not be loaded." appears instead, with a "Try again"
button: that is the pretend server failing on purpose, so click the button. If sending fails, the form says so, and
your text stays where it was.
:::

:::concept Where is the "server"?
On the **Network** tab of the developer tools (++F12++), no new request appears when the reviews are loaded or sent,
because the pretend server sends no real requests. On the **Application** tab, however (in Firefox: **Storage**), under **Local Storage** you find the key
`fake-api:peacock-shop`: that is the server's whole database, as JSON text. If you want to start over, delete the key
and reload the page: the server starts again with the sample data.
:::

:::mistake Common mistake
Leaving the `await` out in front of `onAdd(…)`. The code then does not wait for the server: the form is emptied at
once, and "Thank you!" appears even when sending failed. `catch` never sees the error, and your text is lost.
:::

:::try Try it
In `src/api.js`, set `failRate` to `1`: every request fails, and you can see the error message and the "Try again"
button. Then make `latency` `[3000, 4000]`: that is how slow a bad mobile connection is. Finally, set both back.
:::

### Login

So far anyone could type any name, and write any number of reviews about a product. A real review site needs a
[[login]]: a review belongs to an account, and an account can review a product only once. This step builds the login;
the next one adds the "one review per product" rule.

Our login is pretend, like our server: it looks the account up by name in the server's `users` collection, and opens a
new one if there is none. There is no password: the server simply believes the name. (You build a real login with a
password in lesson 45.) Add this function to the end of `src/api.js`; here is the whole file:

```js file=src/api.js mark=15-21
import { createMockApi } from './fakeApi.js'
import { SAMPLE_REVIEWS } from './products.js'

// The shop's pretend server. Its database starts with the sample reviews and one account, the moderator's.
// The accounts (users) are needed from the next steps on.
export const api = createMockApi('peacock-shop', {
  seed: {
    reviews: SAMPLE_REVIEWS,
    users: [{ id: 'moderator', name: 'Moderator', role: 'moderator' }],
  },
  latency: [400, 900], // every request takes 0.4–0.9 seconds
  failRate: 0.1, // and roughly one in ten fails
})

// A pretend login: finds the account with this name, or opens a new one if there is none. No password.
export async function logIn(name) {
  // Capitals do not count: "anna" is the same account as "Anna".
  const found = await api.list('users', (user) => user.name.toLowerCase() === name.toLowerCase())
  if (found.length > 0) return found[0]
  return api.create('users', { name, role: 'customer' })
}
```

The second argument of `api.list` is a function: only the accounts for which it says yes come back. `toLowerCase()`
turns the text into lowercase letters, so the two names match whatever their capitals. A new account's role (`role`)
is `'customer'`; the moderator's account is already in the starting data.

Logging in goes into the header. While nobody is logged in, it shows a small form; after that, the name and a "Log out"
button. Create `src/components/LoginBar.jsx`:

```jsx file=src/components/LoginBar.jsx
import { useState } from 'react'
import { logIn } from '../api.js'

function LoginBar({ user, onLogin, onLogout }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false) // is the login on its way?
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '') {
      setError('Enter your name.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const account = await logIn(name.trim())
      onLogin(account)
      setName('')
    } catch {
      setError('The server is not answering. Please try again!')
    }
    setBusy(false)
  }

  if (user !== null) {
    return (
      <div className="login-bar">
        <span>
          Logged in as <strong>{user.name}</strong>
        </span>
        <button type="button" onClick={onLogout}>
          Log out
        </button>
      </div>
    )
  }

  return (
    <form className="login-bar" onSubmit={handleSubmit}>
      <label className="login-bar__field">
        <span>Log in with your name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" />
      </label>
      <button type="submit" className="button--primary" disabled={busy}>
        {busy ? 'Logging in…' : 'Log in'}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default LoginBar
```

The `useState` calls stand at the top of the component, before `if (user !== null) return …`. These are the
[[rules of hooks]]: hooks have to be called in the same order at every drawing, so they cannot go behind an early
`return`.

Finally, `App` keeps who is logged in: the account, or `null`. `LoginBar` goes into the header, and the product's page
gets the account too, in the `user` prop; it uses it in the next step. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=1,7,19,49,69
import { useState } from 'react'
import { PRODUCTS } from './products.js'
import useHashRoute from './useHashRoute.js'
import useReviews from './useReviews.js'
import { reviewsOf } from './stats.js'
import ProductList from './components/ProductList.jsx'
import LoginBar from './components/LoginBar.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Any other path (for example the list: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const { reviews, status, retry, addReview } = useReviews()
  const [user, setUser] = useState(null) // the logged-in account, or null
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  // What the page shows: loading, an error, the list, a product, or that there is no such product.
  let page
  if (status === 'loading') {
    page = (
      <p className="state" role="status">
        Loading reviews…
      </p>
    )
  } else if (status === 'error') {
    page = (
      <div className="state state--error" role="alert">
        <p>The reviews could not be loaded.</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  } else if (productId === null) {
    page = <ProductList reviews={reviews} />
  } else if (openProduct) {
    page = (
      <ProductPage
        key={openProduct.id}
        product={openProduct}
        reviews={reviewsOf(reviews, openProduct.id)}
        user={user}
        onAddReview={addReview}
      />
    )
  } else {
    page = (
      <div className="state">
        <p>There is no such product.</p>
        <a className="back" href="#/">
          ← Back to the products
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
        <LoginBar user={user} onLogin={setUser} onLogout={() => setUser(null)} />
      </header>

      {page}
    </main>
  )
}

export default App
```

:::check Check
The header has a "Log in with your name" field with a "Log in" button. Log in as "Anna": for a moment "Logging in…",
then "Logged in as Anna" with a "Log out" button. Log out and log in as "anna": it says "Logged in as Anna" again,
because it is the same account. If the server happens to fail, a red message appears under the field: "The server is
not answering. Please try again!"
:::

:::mistake Common mistake
Only the `useState` for `name` stays at the top of `LoginBar`; the ones for `busy` and `error` come **after**
`if (user !== null) return …`. After logging in, the component calls fewer hooks than before (one instead of three),
the page goes blank, and the console says "Rendered fewer hooks than expected." Hooks always go at the top of the
component, before any condition.
:::

:::try Task
A reload logs you out now. Keep the login in localStorage: copy the `useLocalStorage` hook from lesson 9
(`src/useLocalStorage.js`), and in `App` change the line `const [user, setUser] = useState(null)` to
`const [user, setUser] = useLocalStorage('peacock-shop:user', null)`. Do not forget to import it; the import of
`useState` can go.
:::

### One review per product

Now for the second rule: an account can review a product only once. For that you need `user`, which `App` has been
passing to the product's page since the last step.

The product's page decides what goes in the form's place. When nobody is logged in, a request to log in. When the
logged-in account has already reviewed this product, a message. The form appears only when neither is true. That is why
the form does not need emptying: after a successful send you have a review, and the message takes the form's place by
itself. Replace the contents of `src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=14,22-23,25-37,78
import { useEffect, useState } from 'react'
import { summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Newest first', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Highest rated first', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Lowest rated first', compare: (a, b) => a.rating - b.rating },
}

function ProductPage({ product, reviews, user, onAddReview }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0: every review, 1–5: only the ones with that many stars
  const stats = summarize(reviews)
  // First filter, then sort. filter gives a new array, so sort no longer rearranges the prop.
  const visible = reviews
    .filter((review) => filter === 0 || review.rating === filter)
    .sort(REVIEW_SORTS[sort].compare)
  // One review per product: has the logged-in account already written about this product?
  const myReview = user === null ? undefined : reviews.find((review) => review.userId === user.id)

  // What goes in the form's place.
  let formArea
  if (user === null) {
    formArea = <p className="form-note">Log in above with your name, and write a review too!</p>
  } else if (myReview) {
    formArea = (
      <p className="form-note">
        You have already rated this product ({myReview.rating} ★). You can write one review per product.
      </p>
    )
  } else {
    formArea = <ReviewForm productId={product.id} user={user} onAdd={onAddReview} />
  }

  // A product's page always starts at the top, however far down the list you scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Back to the products
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        {stats.count > 0 && <RatingSummary stats={stats} filter={filter} onFilter={setFilter} />}
        {stats.count > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
            {filter > 0 && (
              <p className="filter-note">
                Only {filter}-star reviews: {visible.length} of {reviews.length}
                <button type="button" className="link-button" onClick={() => setFilter(0)}>
                  Show all
                </button>
              </p>
            )}
          </div>
        )}
        <ReviewList reviews={visible} />
      </section>

      {formArea}
    </article>
  )
}

export default ProductPage
```

`myReview` is made with the ternary operator: when nobody is logged in, it is `undefined` (you have no review), and
when someone is, `find` looks for the account's review of this product. The sample reviews have no `userId`, so they
belong to nobody.

The form needs no name field any more: the logged-in account gives the name and the id, and the review remembers whose
it is in a `userId` field. Emptying the form after a successful send, and the "Thank you!", go too: as you saw on the
product's page, the message takes the form's place after a successful send. Replace the contents of
`src/components/ReviewForm.jsx`:

```jsx file=src/components/ReviewForm.jsx mark=4,24-25
import { useState } from 'react'
import StarPicker from './StarPicker.jsx'

function ReviewForm({ productId, user, onAdd }) {
  const [rating, setRating] = useState(0) // 0: not rated yet
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false) // is the review on its way to the server?

  async function handleSubmit(event) {
    event.preventDefault()
    if (rating === 0) {
      setError('Choose how many stars you give.')
      return
    }
    if (text.trim().length < 10) {
      setError('Write at least 10 characters about the product.')
      return
    }

    setSending(true)
    setError('')
    try {
      // The logged-in account gives the name and the id.
      await onAdd({ productId, userId: user.id, author: user.name, rating, text: text.trim() })
    } catch {
      setError('The server is not answering. Your review is still here: try again!')
    }
    setSending(false)
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a review</h3>
      <StarPicker value={rating} onChange={setRating} />
      <label className="field">
        <span>Your review</span>
        <textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button--primary" disabled={sending}>
        {sending ? 'Sending…' : 'Send review'}
      </button>
    </form>
  )
}

export default ReviewForm
```

:::check Check
Logged out, a product's page says this where the form was: "Log in above with your name, and write a review too!" Log
in as "Anna": the form is back, without a name field. Write a five-star review about the notebook: it appears under the
name "Anna", and in place of the form you read "You have already rated this product (5 ★). You can write one review
per product." Log out and log in as "anna": the same account, and the same message on the notebook.
:::

:::concept What does a real server do?
Our check runs only in the page: someone who goes round the form and sends a request straight to the server could
write any number of reviews. So a real server checks too: it turns down a second review from the same account, and
accepts only requests that prove who sent them (with a [[token|access token]], as in lesson 21). The page checks so
that users do not try in vain; the server checks so that nobody can cheat.
:::

:::mistake Common mistake
`const myReview = reviews.find((review) => review.userId === user.id)`, without the `user === null` test. Logged
out, `user` is `null`, and `null` has no `id`: opening a product turns the page blank, and the console says "Cannot
read properties of null (reading 'id')".
:::

:::try Try it
Call the account by its name in the message: "Anna, you have already rated this product (5 ★)…". The name is in
`user.name`, and in JSX `{user.name}` writes it out.
:::

### "Helpful" votes

In long lists of reviews, the best ones are those that others called "helpful". Every review gets a 👍 button with the
number of votes. An account can vote for a review once (a second click takes the vote back), and not at all for its
own.

Who voted is kept in the review's `helpfulBy` field: an array of account ids. The number of votes is simply the array's
length, and since everyone can be in the array only once, no account can vote twice. The sample reviews have a
`helpfulBy` field, but the reviews written in the earlier steps do not: it did not exist then. This happens on servers
all the time: old data lacks a field that was only invented later. So a small helper reads it, and gives an empty
array when it is missing. Add this to the end of `src/stats.js`; here is the whole file:

```js file=src/stats.js mark=33-36
// Derived data: none of it is in state; it is always worked out from the list of reviews.

// The reviews of one product, out of all of them.
export function reviewsOf(reviews, productId) {
  return reviews.filter((review) => review.productId === productId)
}

// How many reviews there are, their average, and how many there are for each number of stars.
export function summarize(reviews) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let total = 0
  for (const review of reviews) {
    total += review.rating
    counts[review.rating] += 1
  }
  return {
    count: reviews.length,
    average: reviews.length > 0 ? total / reviews.length : 0,
    counts,
  }
}

// 4.666… → '4.7': one decimal place.
export function formatRating(value) {
  return value.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// 3 → '3 reviews', 1 → '1 review'
export function reviewCount(count) {
  return count === 1 ? '1 review' : `${count} reviews`
}

// Who found the review helpful. Reviews written earlier do not have this field yet.
export function helpfulVotes(review) {
  return review.helpfulBy ?? []
}
```

`??` is the [[nullish coalescing]] operator: it gives its left side, unless that is `undefined` or `null`, in which
case it gives its right side.

A vote changes the review on the server: `api.update` gets the review's id and the fields that changed. But if the
button did nothing until the server answered (half a second), the click would feel sluggish. So we make an
[[optimistic update]]: we show the change at once, as if it had already worked, and undo it only if the server reports
an error. The hook gets a general `changeReview` function that works for any change; in the next step, moderation uses
it too. Replace the contents of `src/useReviews.js`:

```js file=src/useReviews.js mark=4,40-43,45-54,56
import { useEffect, useState } from 'react'
import { api } from './api.js'

// Everything about the reviews on the server: loading, status, a new review, changes.
function useReviews() {
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' or 'error'
  const [attempt, setAttempt] = useState(0) // when it grows, we load again

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const list = await api.list('reviews')
        if (ignore) return
        setReviews(list)
        setStatus('ready')
      } catch {
        if (!ignore) setStatus('error')
      }
    }
    load()
    // Clean up: if we load again meanwhile, or the component disappears, the old answer no longer counts.
    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  async function addReview(data) {
    const created = await api.create('reviews', data)
    // Updater function: the list may have changed while we waited, so we add to the newest one.
    setReviews((current) => [created, ...current])
  }

  // Swaps one review in the list for its new version.
  function replaceReview(changed) {
    setReviews((current) => current.map((review) => (review.id === changed.id ? changed : review)))
  }

  // Optimistic update: the change shows at once, and if the server reports an error, we undo it.
  async function changeReview(review, changes) {
    replaceReview({ ...review, ...changes })
    try {
      await api.update('reviews', review.id, changes)
    } catch (error) {
      replaceReview(review)
      throw error // let the caller know it failed too
    }
  }

  return { reviews, status, retry, addReview, changeReview }
}

export default useReviews
```

- `replaceReview` makes a new array with `map`, with the changed review in the old one's place and the rest as they
  were.
- `{ ...review, ...changes }` merges two objects: every field of the review, and whatever `changes` gives overwrites the
  old value. For a vote, `changes` is for example `{ helpfulBy: ['a1', 'f3c9…'] }`.
- `catch` gets the error (`error`), puts the old version back, then `throw error` throws the same error on. That way
  the button that called `changeReview` hears about it too, and can say that it did not work.

In `App` only two lines change: we ask the hook for `changeReview` too, and pass it on to the product's page. (If you
switched the `user` line to `useLocalStorage` in the task of the login step, keep it that way.) Here is the whole of
`src/App.jsx`:

```jsx file=src/App.jsx mark=18,51
import { useState } from 'react'
import { PRODUCTS } from './products.js'
import useHashRoute from './useHashRoute.js'
import useReviews from './useReviews.js'
import { reviewsOf } from './stats.js'
import ProductList from './components/ProductList.jsx'
import LoginBar from './components/LoginBar.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Any other path (for example the list: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const { reviews, status, retry, addReview, changeReview } = useReviews()
  const [user, setUser] = useState(null) // the logged-in account, or null
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  // What the page shows: loading, an error, the list, a product, or that there is no such product.
  let page
  if (status === 'loading') {
    page = (
      <p className="state" role="status">
        Loading reviews…
      </p>
    )
  } else if (status === 'error') {
    page = (
      <div className="state state--error" role="alert">
        <p>The reviews could not be loaded.</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  } else if (productId === null) {
    page = <ProductList reviews={reviews} />
  } else if (openProduct) {
    page = (
      <ProductPage
        key={openProduct.id}
        product={openProduct}
        reviews={reviewsOf(reviews, openProduct.id)}
        user={user}
        onAddReview={addReview}
        onChangeReview={changeReview}
      />
    )
  } else {
    page = (
      <div className="state">
        <p>There is no such product.</p>
        <a className="back" href="#/">
          ← Back to the products
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
        <LoginBar user={user} onLogin={setUser} onLogout={() => setUser(null)} />
      </header>

      {page}
    </main>
  )
}

export default App
```

Two things change on the product's page: it gets a new sorting ("Most helpful first"), and it passes `user` and
`onChangeReview` on to the list. (The list does nothing with them yet: after the next two files it will.) Replace the
contents of `src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=2,12-15,18,79
import { useEffect, useState } from 'react'
import { helpfulVotes, summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Newest first', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Highest rated first', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Lowest rated first', compare: (a, b) => a.rating - b.rating },
  helpful: {
    label: 'Most helpful first',
    compare: (a, b) => helpfulVotes(b).length - helpfulVotes(a).length,
  },
}

function ProductPage({ product, reviews, user, onAddReview, onChangeReview }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0: every review, 1–5: only the ones with that many stars
  const stats = summarize(reviews)
  // First filter, then sort. filter gives a new array, so sort no longer rearranges the prop.
  const visible = reviews
    .filter((review) => filter === 0 || review.rating === filter)
    .sort(REVIEW_SORTS[sort].compare)
  // One review per product: has the logged-in account already written about this product?
  const myReview = user === null ? undefined : reviews.find((review) => review.userId === user.id)

  // What goes in the form's place.
  let formArea
  if (user === null) {
    formArea = <p className="form-note">Log in above with your name, and write a review too!</p>
  } else if (myReview) {
    formArea = (
      <p className="form-note">
        You have already rated this product ({myReview.rating} ★). You can write one review per product.
      </p>
    )
  } else {
    formArea = <ReviewForm productId={product.id} user={user} onAdd={onAddReview} />
  }

  // A product's page always starts at the top, however far down the list you scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Back to the products
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        {stats.count > 0 && <RatingSummary stats={stats} filter={filter} onFilter={setFilter} />}
        {stats.count > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
            {filter > 0 && (
              <p className="filter-note">
                Only {filter}-star reviews: {visible.length} of {reviews.length}
                <button type="button" className="link-button" onClick={() => setFilter(0)}>
                  Show all
                </button>
              </p>
            )}
          </div>
        )}
        <ReviewList reviews={visible} user={user} onChange={onChangeReview} />
      </section>

      {formArea}
    </article>
  )
}

export default ProductPage
```

A review now does enough to deserve a component of its own: the `<li>` moves out of `ReviewList`, with `formatDate`,
and gets the button. Create `src/components/ReviewItem.jsx`:

```jsx file=src/components/ReviewItem.jsx
import { useState } from 'react'
import Stars from './Stars.jsx'
import { helpfulVotes } from '../stats.js'

// From an ISO date to a readable one: '2026-10-02T10:00:00.000Z' → '2 October 2026'
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ReviewItem({ review, user, onChange }) {
  const [failed, setFailed] = useState(false) // did saving the last change fail?
  const votes = helpfulVotes(review)
  const voted = user !== null && votes.includes(user.id)
  // You can vote only when logged in, and not for your own review.
  const canVote = user !== null && review.userId !== user.id

  async function change(changes) {
    setFailed(false)
    try {
      await onChange(review, changes)
    } catch {
      setFailed(true)
    }
  }

  function toggleHelpful() {
    // If you have already voted, a second click takes the vote back.
    const newVotes = voted ? votes.filter((id) => id !== user.id) : [...votes, user.id]
    change({ helpfulBy: newVotes })
  }

  return (
    <li className="review">
      <div className="review__head">
        <Stars value={review.rating} />
        <p className="review__meta">
          <strong>{review.author}</strong> · {formatDate(review.createdAt)}
        </p>
      </div>
      <p className="review__text">{review.text}</p>
      <div className="review__actions">
        <button type="button" className="chip" aria-pressed={voted} disabled={!canVote} onClick={toggleHelpful}>
          👍 Helpful · {votes.length}
        </button>
        {failed && (
          <span className="review__error" role="alert">
            Could not save. Please try again!
          </span>
        )}
      </div>
    </li>
  )
}

export default ReviewItem
```

- [[includes]] tells whether a value is in the array: if your id is in it, you have voted already, and the button is
  switched on (`aria-pressed`).
- `change` is a little helper that calls `onChange`, and switches the error message on if that throws an error. In the
  next step the moderation button uses it too.
- The new list of votes takes the same two moves as with any array: `filter` takes your id out, the spread adds it.
  Neither touches the old array.

`ReviewList` now only draws the `ReviewItem`s, and passes on the account and the change function to them. Replace
the contents of `src/components/ReviewList.jsx`:

```jsx file=src/components/ReviewList.jsx mark=1,3,11
import ReviewItem from './ReviewItem.jsx'

function ReviewList({ reviews, user, onChange }) {
  if (reviews.length === 0) {
    return <p className="empty">No reviews yet. Be the first to write one!</p>
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} user={user} onChange={onChange} />
      ))}
    </ul>
  )
}

export default ReviewList
```

`user` and `changeReview` now travel from `App` through `ProductPage` and `ReviewList` to `ReviewItem`. `ReviewList`
uses neither of them, it only passes them on, and `ProductPage` does not need `changeReview` either. This is called
[[prop drilling]]. Three levels are still fine; if it went much deeper, [[Context]] from lesson 2 would help.

:::check Check
Logged out, every review has a grey, disabled "👍 Helpful · 4" (or another number) button. Log in as "Anna", open the
silk scarf, and click "👍 Helpful · 1" on Márton B.'s review: it turns into "Helpful · 2" at once, in green. Click it
again: you take the vote back, it is 1 again. Choose "Most helpful first": Anna K.'s review (4) stays on top, but Sofia
R.'s (2) moves ahead of Márton B.'s. Vote for Márton B.'s review again, then reload and log in again: its button is
green, "Helpful · 2": your vote is kept. On the notebook, the button of your own review is disabled: you cannot vote for
yourself. If the server happens to fail, the number jumps back, and "Could not save." appears.
:::

:::concept Optimistic or careful?
An optimistic update feels fast, but it suits only requests that almost always work, and where a failure is no big
deal: a like, a vote, a star. Where a failure matters (a payment, a review you sent), we take the careful way, as in
the form: "Sending…", and the result shows only after the server says yes.
:::

:::mistake Common mistake
`votes.push(user.id)`, then `change({ helpfulBy: votes })`. `push` changes the review's own array, which is still in
React's state. The optimistic update shows, but on failure the "old" review that `changeReview` puts back already has
your vote in it: undoing undoes nothing.
:::

### Moderation

Sooner or later a public review site gets advertising, insults and reviews about some other product entirely. That is
why it needs [[moderation]]: a moderator can hide the reviews that do not belong there. A hidden review is not deleted
(the moderator can change their mind), but nobody else sees it, and it does not count towards the average either.

Hiding is marked by a new field of the review: `hidden: true`. The old reviews have no such field, but that does not
matter here: a missing field is `undefined`, which counts as false in a condition, just like `false`. The moderator's account is in the
server's starting data, with the role `role: 'moderator'`: an account's role decides what it may do.

A review gets a "Hide" button, but only for the moderator. The moderator still sees a hidden review, dimmed, with a
"Hidden" label and a "Show again" button. Both buttons call the same `change` helper as the vote. Replace the contents
of `src/components/ReviewItem.jsx`:

```jsx file=src/components/ReviewItem.jsx mark=16-17,35-36,48-52
import { useState } from 'react'
import Stars from './Stars.jsx'
import { helpfulVotes } from '../stats.js'

// From an ISO date to a readable one: '2026-10-02T10:00:00.000Z' → '2 October 2026'
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ReviewItem({ review, user, onChange }) {
  const [failed, setFailed] = useState(false) // did saving the last change fail?
  const votes = helpfulVotes(review)
  const voted = user !== null && votes.includes(user.id)
  // You can vote only when logged in, and not for your own review.
  const canVote = user !== null && review.userId !== user.id
  // Only an account with the moderator role can moderate.
  const isModerator = user !== null && user.role === 'moderator'

  async function change(changes) {
    setFailed(false)
    try {
      await onChange(review, changes)
    } catch {
      setFailed(true)
    }
  }

  function toggleHelpful() {
    // If you have already voted, a second click takes the vote back.
    const newVotes = voted ? votes.filter((id) => id !== user.id) : [...votes, user.id]
    change({ helpfulBy: newVotes })
  }

  return (
    <li className={review.hidden ? 'review is-hidden' : 'review'}>
      {review.hidden && <p className="review__badge">Hidden: only the moderator sees it</p>}
      <div className="review__head">
        <Stars value={review.rating} />
        <p className="review__meta">
          <strong>{review.author}</strong> · {formatDate(review.createdAt)}
        </p>
      </div>
      <p className="review__text">{review.text}</p>
      <div className="review__actions">
        <button type="button" className="chip" aria-pressed={voted} disabled={!canVote} onClick={toggleHelpful}>
          👍 Helpful · {votes.length}
        </button>
        {isModerator && (
          <button type="button" className="chip" onClick={() => change({ hidden: !review.hidden })}>
            {review.hidden ? 'Show again' : 'Hide'}
          </button>
        )}
        {failed && (
          <span className="review__error" role="alert">
            Could not save. Please try again!
          </span>
        )}
      </div>
    </li>
  )
}

export default ReviewItem
```

`!review.hidden` is the opposite: it hides a visible review and shows a hidden one. `undefined` turns into `true`
too, so old reviews can be hidden as well.

The product's page needs two lists of reviews. The **public** reviews (without the hidden ones) make the summary, the
star bars and the average, for everyone. The **shown** reviews are all of them for the moderator, and the public ones
for everyone else. "One review per product", however, looks among all of them: someone whose review was hidden should
not be able to write a new one instead. The sorting and the "Only …" line work with the number of shown reviews, so the
moderator can sort even when every review of a product is hidden. Replace the contents of
`src/components/ProductPage.jsx`:

```jsx file=src/components/ProductPage.jsx mark=21-25,27,30,70,75
import { useEffect, useState } from 'react'
import { helpfulVotes, summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Newest first', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Highest rated first', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Lowest rated first', compare: (a, b) => a.rating - b.rating },
  helpful: {
    label: 'Most helpful first',
    compare: (a, b) => helpfulVotes(b).length - helpfulVotes(a).length,
  },
}

function ProductPage({ product, reviews, user, onAddReview, onChangeReview }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0: every review, 1–5: only the ones with that many stars
  const isModerator = user !== null && user.role === 'moderator'
  // Hidden reviews do not count towards the summary, and only the moderator sees them.
  const publicReviews = reviews.filter((review) => !review.hidden)
  const shown = isModerator ? reviews : publicReviews
  const stats = summarize(publicReviews)
  // First filter, then sort. filter gives a new array, so sort no longer rearranges the prop.
  const visible = shown
    .filter((review) => filter === 0 || review.rating === filter)
    .sort(REVIEW_SORTS[sort].compare)
  // One review per product: has the logged-in account already written about this product? (Hidden ones count too.)
  const myReview = user === null ? undefined : reviews.find((review) => review.userId === user.id)

  // What goes in the form's place.
  let formArea
  if (user === null) {
    formArea = <p className="form-note">Log in above with your name, and write a review too!</p>
  } else if (myReview) {
    formArea = (
      <p className="form-note">
        You have already rated this product ({myReview.rating} ★). You can write one review per product.
      </p>
    )
  } else {
    formArea = <ReviewForm productId={product.id} user={user} onAdd={onAddReview} />
  }

  // A product's page always starts at the top, however far down the list you scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Back to the products
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">€{product.price}</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Reviews</h3>
        {stats.count > 0 && <RatingSummary stats={stats} filter={filter} onFilter={setFilter} />}
        {shown.length > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
            {filter > 0 && (
              <p className="filter-note">
                Only {filter}-star reviews: {visible.length} of {shown.length}
                <button type="button" className="link-button" onClick={() => setFilter(0)}>
                  Show all
                </button>
              </p>
            )}
          </div>
        )}
        <ReviewList reviews={visible} user={user} onChange={onChangeReview} />
      </section>

      {formArea}
    </article>
  )
}

export default ProductPage
```

Last, the product list: hidden reviews must not count towards the cards' averages either. In `App` only one line
changes (a `useLocalStorage` line for `user`, if you have one, can stay); here is the whole of `src/App.jsx`:

```jsx file=src/App.jsx mark=42-43
import { useState } from 'react'
import { PRODUCTS } from './products.js'
import useHashRoute from './useHashRoute.js'
import useReviews from './useReviews.js'
import { reviewsOf } from './stats.js'
import ProductList from './components/ProductList.jsx'
import LoginBar from './components/LoginBar.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Any other path (for example the list: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const { reviews, status, retry, addReview, changeReview } = useReviews()
  const [user, setUser] = useState(null) // the logged-in account, or null
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  // What the page shows: loading, an error, the list, a product, or that there is no such product.
  let page
  if (status === 'loading') {
    page = (
      <p className="state" role="status">
        Loading reviews…
      </p>
    )
  } else if (status === 'error') {
    page = (
      <div className="state state--error" role="alert">
        <p>The reviews could not be loaded.</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  } else if (productId === null) {
    // Only the public (not hidden) reviews count towards the cards' averages.
    page = <ProductList reviews={reviews.filter((review) => !review.hidden)} />
  } else if (openProduct) {
    page = (
      <ProductPage
        key={openProduct.id}
        product={openProduct}
        reviews={reviewsOf(reviews, openProduct.id)}
        user={user}
        onAddReview={addReview}
        onChangeReview={changeReview}
      />
    )
  } else {
    page = (
      <div className="state">
        <p>There is no such product.</p>
        <a className="back" href="#/">
          ← Back to the products
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Everyday things in peacock colours. Read the reviews, then write your own.</p>
        <LoginBar user={user} onLogin={setUser} onLogout={() => setUser(null)} />
      </header>

      {page}
    </main>
  )
}

export default App
```

:::check Check
Log in as "Moderator", the name of the moderator's account in `src/api.js` (capitals do not matter). With no password,
anyone could do this here; on a real server only an administrator could give an account the moderator role. Every
review now has a "Hide" button. Open the tote bag and hide Dóra P.'s two-star review: it dims, with a dashed border and
the label "Hidden: only the moderator sees it", and the average jumps from 3.7 to 4.5. Go back to the list: the tote
bag's card says "4.5 · 2 reviews" too. Log out and open the tote bag again: Dóra P.'s review is gone. Log in as the
moderator again, and bring it back with "Show again". Congratulations, your review site is done!
:::

:::mistake Common mistake
`myReview` looking in `publicReviews` instead of all the reviews. Then, when the moderator hides someone's review, that
person can simply write a new one, and moderating achieved nothing.
:::

:::try Task
When your own review was hidden, let the "already rated" message say so too: "A moderator has hidden it, so others do
not see it." `myReview.hidden` tells you when, and `&&` tells you how.
:::
