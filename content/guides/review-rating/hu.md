# Mit építünk?

Egy kis webshop véleményoldalát. A Peacock Shop hat terméket árul a páva színeiben, a vásárlók pedig csillagokkal
értékelik őket, és megírják, mit gondolnak róluk. Te építed meg a termékek listáját, minden terméknek saját oldalt a
véleményeivel, egy űrlapot, amin csillagot adhatsz és véleményt írhatsz, aztán az átlagokat, a rendezést és a szűrést,
a végén pedig egy (kitalált) szerverre költözteted a véleményeket, fiókokkal, „hasznos volt” szavazással és
moderálással.

Közben megtanulod, hogyan készül egy [[újra felhasználható komponens]]: a csillagsort egyszer írod meg, és aztán három
helyen is használod. És meglátod, hogy az átlag, a rendezett lista és a szűrt lista mind [[származtatott érték]]: nem
kell eltárolni őket, mert minden rajzoláskor újra kiszámoljuk mindet a véleményekből.

:::levels
- A termékek listája, kattintásra egy termék a véleményeivel és a csillagaival, meg egy űrlap, amivel csillagot adsz és véleményt írsz. | kb. 2,5 óra
- Átlag és csillageloszlás, saját címmel megnyitható adatlap, rendezés értékelés szerint és szűrés csillagokra. | kb. 3 óra
- A vélemények egy szerveren: bejelentkezés, termékenként egy vélemény, „hasznos volt” szavazás és moderálás. | kb. 3 óra
:::

**Előismeret:** az eddigi leckék, legfőképp az 1. (komponensek, props, `useHashRoute`), a 3. (rádiógombok, vezérelt
mezők), a 9. és a 10. (listák `key`-jel, új elem egy tömbben, rendezés `sort`-tal), meg a 14. (`async` és `await`,
betöltés- és hibaállapot). Amit újra felhasználunk, azt pár mondatban felidézzük, minden újat pedig lépésről lépésre
elmagyarázunk.

## Kezdő szint {level=1}

### Mielőtt elkezded

A lecke kiinduló projektje a kurzus repójában van, a `lessons/24-review-rating/exercise` mappában (a fenti „Feladat a
GitHubon” gomb ezt a mappát nyitja meg a GitHubon). Ugyanúgy indulsz, mint az 1. leckében, és annak a 0. lépése minden
parancsot részletesen elmagyaráz. Röviden: nyiss egy terminált a munkamappádban, ahol a `rika-mentoring` repó van, hozd
le az új leckéket, aztán másold ki a repóból ennek a leckének az `exercise` mappáját `peacock-reviews` néven:

```shell
cd rika-mentoring
git pull        # lehozza az új leckéket
cd ..           # vissza a munkamappádba
cp -r rika-mentoring/lessons/24-review-rating/exercise peacock-reviews
```

Ha még nincs meg a repó, az első három sor helyett ezt futtasd:
`git clone https://github.com/mazsola739/rika-mentoring.git`. Ha nincs gited, a
[repó GitHub-oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, és
másold ki belőle a `lessons/24-review-rating/exercise` mappát a munkamappádba, `peacock-reviews` néven. A másolatodban
dolgozol: a repó érintetlen marad, így a `git pull` továbbra is működik.

Nyisd meg a `peacock-reviews` mappát a szerkesztőben, és írd be ezt a két parancsot a szerkesztő termináljába:

```shell
npm install     # egyszer kell: letölti a projekt csomagjait (React, Vite)
npm run dev     # elindítja a fejlesztői szervert
```

:::check Ellenőrizd
Nyisd meg a terminál által kiírt címet (általában `http://localhost:5173`). Az oldal közepén egy fehér kártyát látsz
„Peacock Shop” címmel, alatta két rövid angol mondattal: „Everyday things in peacock colours. Read the reviews, then
write your own.” Más még nincs rajta: a bolt a te dolgod.
:::

Végül csinálj a másolatodból git-repót egyetlen committal, a kezdőállapottal. Az első terminált az `npm run dev`
foglalja, ezért nyiss egy másodikat a szerkesztőben, a `peacock-reviews` mappában:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

Mostantól a `git restore .` a megváltozott fájlokat visszaállítja az utolsó commitod állapotára (az újonnan létrehozott
fájlokat nem törli, azokat kézzel töröld), és érdemes minden működő lépés után commitolni.

Mi van a kiinduló projektben?

- `src/App.jsx`: maga az oldal. Egyelőre csak a címet mutatja, innen indulunk.
- `src/App.css`: a teljes lecke stílusai, készen. Ez a lecke a Reactről szól, nem a CSS-ről, ezért csak a lépésekben
  megadott osztályneveket használod (`product-card`, `stars`, `review`, `summary`…). Azért nézz bele!
- `src/products.js`: a mintaadatok. A `PRODUCTS` a bolt hat terméke (azonosító, név, ár, kép, leírás), a
  `SAMPLE_REVIEWS` pedig az első tizenhárom vélemény.
- `public/images/`: a termékek képei, egyszerű rajzok. A `public` mappa fájljait a Vite úgy adja oda a böngészőnek,
  ahogy vannak: a `/images/notebook.svg` cím a `public/images/notebook.svg` fájlt jelenti.
- `src/fakeApi.js`: egy kitalált szerver, ami a böngésződben fut. Csak a haladó szinten lesz rá szükség, addig ne is
  foglalkozz vele.

A kiinduló projekt mindkét nyelven ugyanaz, ezért a fájlokban lévő megjegyzések, a termékek és a mintavélemények
angolul vannak. Ha szeretnéd, fordítsd le őket nyugodtan: a kód nem függ tőlük, csak az ellenőrző dobozok idézik az
angol neveket. A kódban, amit te írsz, magyar feliratok és megjegyzések lesznek.

:::concept Gyors ismétlés
A [[komponens]] egy függvény, ami [[JSX]]-et ad vissza: HTML-szerű leírást arról, mi jelenjen meg a képernyőn. Adatot a
[[props]]-ain keresztül kap, emlékezni a [[useState]] segítségével tud, és ha egy állapot megváltozik, a React
újrarajzolja. Egy tömbből a `map` készít listát, és a lista minden elemének egyedi [[key]] kell. Ha ezek közül valami
ismeretlennek tűnik, lapozz vissza az 1. és a 9. leckéhez.
:::

### A termékek listája

Kezdjük a bolt kirakatával: hat kártya, mindegyiken egy kép, a termék neve és az ára. A kártya egyetlen propban kapja
meg a terméket, egy [[objektumként|objektum]], mert minden adatára szüksége van. Hozz létre az `src` mappában egy
`components` mappát, benne a `ProductCard.jsx` fájlt:

```jsx file=src/components/ProductCard.jsx
function ProductCard({ product }) {
  return (
    <li className="product-card">
      <img className="product-card__image" src={product.image} alt="" />
      <div className="product-card__body">
        <h2 className="product-card__name">{product.name}</h2>
        <p className="product-card__price">{product.price} €</p>
      </div>
    </li>
  )
}

export default ProductCard
```

A kép `alt` szövege üres: a termék neve ott áll alatta, és egy képernyőolvasó különben kétszer mondaná el. Az
`alt=""` azt jelenti: „ez a kép csak díszítés, nyugodtan átugorhatod”. Ha az `alt` teljesen hiányozna, a
képernyőolvasó a fájl nevét olvasná fel.

Most rakjuk ki a kártyákat. A `PRODUCTS` [[nevesített export]], ezért kapcsos zárójelben töltjük be. Cseréld le az
`src/App.jsx` tartalmát erre:

```jsx file=src/App.jsx mark=1-2,10,13-17
import { PRODUCTS } from './products.js'
import ProductCard from './components/ProductCard.jsx'
import './App.css'

function App() {
  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
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

A `map` minden termékből egy `ProductCard`-ot készít, `key` gyanánt a termék `id`-jával. A kártyákat a CSS rendezi
rácsba (`product-grid`): annyit tesz egy sorba, amennyi kényelmesen elfér.

:::check Ellenőrizd
A cím alatt hat kártya jelenik meg, mindegyiken egy kép, egy angol név és egy ár: „Teal silk scarf 59 €”, „Gold A5
notebook 18 €”… Széles ablakban három kerül egy sorba, keskenyebben kettő, telefonon egy.
:::

:::mistake Gyakori hiba
`<ProductCard product={product} />`, `key` nélkül. Az oldal működik, de a konzolban (++F12++) figyelmeztetés jelenik
meg: „Each child in a list should have a unique "key" prop.” A React a `key`-ből tudja, melyik kártya melyik, amikor a
lista megváltozik. A középszinten, amikor rendezed a termékeket, ez számítani is fog.
:::

:::try Próbáld ki
Írd ki a kártyán a termék leírását is (`product.description`) egy `<p>`-ben, az ár alatt. Ugye, hogy túl sok? Egy
kártyára elég a lényeg; a leírás a következő lépésben a termék saját oldalára kerül. Utána töröld ki.
:::

### Egy termék a véleményeivel

Kattintásra nyíljon meg egy termék: nagy kép, leírás, alatta pedig a vélemények. Egy vélemény így néz ki az
`src/products.js`-ben (a megjegyzéseket most magyarul írtuk hozzá):

```js
{
  id: 'r1',
  productId: 'silk-scarf', // melyik termékről szól
  author: 'Anna K.',
  rating: 5, // hány csillag, 1-től 5-ig
  text: 'The colours glow and the silk feels heavy and soft. …',
  createdAt: '2026-10-02T10:00:00.000Z', // mikor írták
  helpfulBy: ['a1', 'a2', 'a3', 'a4'], // ez csak a haladó szinten kell
}
```

A `createdAt` egy [[ISO-dátum]]: év-hónap-nap, egy `T` betű, aztán az időpont. Gépnek könnyű olvasni, embernek
kevésbé, ezért kiírás előtt átalakítjuk. A vélemények listája saját komponenst kap. Hozd létre az
`src/components/ReviewList.jsx` fájlt:

```jsx file=src/components/ReviewList.jsx
// ISO-dátumból magyar dátum: '2026-10-02T10:00:00.000Z' → '2026. október 2.'
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="empty">Még nincs vélemény. Írd meg te az elsőt!</p>
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

- A `new Date(isoDate)` dátumot készít a szövegből, a `toLocaleDateString` pedig úgy írja ki, ahogy egy nyelvben
  szokás. A `'hu-HU'` a [[locale]]: magyar nyelv, ahogy Magyarországon írják. A második paraméter mondja meg, mi
  kerüljön bele: számmal írt év, kiírt hónapnév, számmal írt nap.
- Ha egy termékhez nincs vélemény, a komponens rögtön egy üzenettel tér vissza, és a lista el sem készül: ez a
  [[korai visszatérés]].

A termék oldala az `src/components/ProductPage.jsx` fájlba kerül:

```jsx file=src/components/ProductPage.jsx
import ReviewList from './ReviewList.jsx'

function ProductPage({ product, reviews, onBack }) {
  return (
    <article className="product-page">
      <button type="button" className="back" onClick={onBack}>
        ← Vissza a termékekhez
      </button>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        <ReviewList reviews={reviews} />
      </section>
    </article>
  )
}

export default ProductPage
```

A `ProductPage` nem tudja, honnan jött a látogató, és azt sem, hogyan lehet visszajutni. Csak annyit tud, hogy a
gombra kattintva meg kell hívnia az `onBack` propot: hogy az mit csinál, azt az `App` dönti el.

A kártyán a termék neve gomb lesz. Cseréld le az `src/components/ProductCard.jsx` tartalmát:

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
        <p className="product-card__price">{product.price} €</p>
      </div>
    </li>
  )
}

export default ProductCard
```

Igazi gomb, így billentyűzettel is működik (++Tab++, aztán ++Enter++). Hogy a kártya bármelyik pontjára lehessen
kattintani, azt a CSS intézi: a `product-card__link` egy láthatatlan réteget (`::after`) feszít ki az egész kártyára.

Végül az `App`-nak emlékeznie kell, melyik termék van nyitva. Ez [[állapot]]: a megnyitott termék azonosítója, vagy
[[null]], vagyis „semmi”, amikor egyik sincs nyitva, és a listát mutatjuk. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=1-2,4,8-9,18-30
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import ProductCard from './components/ProductCard.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

function App() {
  const [openId, setOpenId] = useState(null) // a megnyitott termék id-je, vagy null: a lista látszik
  const openProduct = PRODUCTS.find((product) => product.id === openId)

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
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

- A [[find]] a tömb első olyan elemét adja vissza, amelyikre a függvény igazat mond, vagy `undefined`-ot, ha egyik sem
  ilyen. Amíg az `openId` `null`, egyik termék `id`-je sem egyezik vele, így az `openProduct` `undefined`.
- A `feltétel ? ez : az` a [[ternáris operátor]]: ha van megnyitott termék, az oldala jelenik meg, ha nincs, a lista.
- A [[filter]] csak azokat a véleményeket tartja meg, amelyek ehhez a termékhez tartoznak. Új tömböt ad, a
  `SAMPLE_REVIEWS`-hoz nem nyúl.
- Minden kártya saját kis [[nyílfüggvényt|nyílfüggvény]] kap: `() => setOpenId(product.id)`. A függvény emlékszik rá,
  melyik terméknél készült, ezért mindegyik a saját termékét nyitja meg.

:::check Ellenőrizd
Kattints a „Teal silk scarf” kártyára: a lista eltűnik, helyette nagy kép, a termék neve, „59 €”, egy angol leírás,
alatta pedig a „Vélemények” cím és három vélemény, az első így kezdődik: „Anna K. · 2026. október 2.” A „← Vissza a
termékekhez” gomb visszavisz a listához. Az esernyőnek („Gold & ruby folding umbrella”) csak egy véleménye van.
:::

:::mistake Gyakori hiba
`onOpen={setOpenId(product.id)}`, nyílfüggvény nélkül. Így nem egy függvényt adsz át, hanem rajzolás közben azonnal
meghívod a `setOpenId`-t, mind a hat kártyánál, egymás után. Az utolsó hívás nyer: az oldal rögtön az esernyővel („Gold
& ruby folding umbrella”) nyílik meg, a listát meg sem látod, és a „← Vissza a termékekhez” gomb sem működik, mert a
lista rajzolása azonnal újra megnyitja az esernyőt. A nyílfüggvény (`() => setOpenId(product.id)`) viszont csak
kattintáskor fut le.
:::

:::try Próbáld ki
Írd át ideiglenesen az `App`-ban a `reviews={…}` propot `reviews={[]}`-re, és nyiss meg egy terméket: megjelenik a
„Még nincs vélemény. Írd meg te az elsőt!” üzenet. Utána írd vissza.
:::

### Csillagok: egy újra felhasználható komponens

Minden véleményhez csillagok kellenek: öt, és ebből annyi sárga, ahány csillagot a vásárló adott. Csillagokra később
máshol is szükség lesz: a középszinten a kártyákon (ott egy átlag, például 4,7 lesz a szám) és a termék összesítőjében
(nagyobb méretben). Ezért egyszer írjuk meg, saját komponensként, ami mindent a propjaiból tud meg: hány csillagot
mutasson, és hányból. Nem tudja, hol van, nem tud a véleményekről vagy a termékekről, így bárhová beillik. Ez egy
[[újra felhasználható komponens]].

Hogyan rajzolunk 4,7 csillagot? Két sor csillagot teszünk egymásra: alul öt szürkét, fölé öt sárgát. A sárga sort
levágjuk egy szélességnél: 4,7 csillag az ötből 94%. A levágást a CSS végzi (`stars__row--on`: a sor a másik fölé kerül,
és ami a szélességén túllóg, az nem látszik), nekünk csak a szélességet kell megadnunk. Hozd létre az
`src/components/Stars.jsx` fájlt:

```jsx file=src/components/Stars.jsx
// Csillagok, amiket csak nézni lehet. A value lehet tört is (például 4.7), a max a csillagok száma.
function Stars({ value, max = 5 }) {
  // A sárga sor szélessége: 4 csillag az 5-ből 80%.
  const percent = (value / max) * 100
  const text = value.toLocaleString('hu-HU', { maximumFractionDigits: 1 })

  return (
    <span className="stars" role="img" aria-label={`Értékelés: ${text} / ${max}`}>
      <span className="stars__row">{'★'.repeat(max)}</span>
      <span className="stars__row stars__row--on" style={{ width: `${percent}%` }}>
        {'★'.repeat(max)}
      </span>
    </span>
  )
}

export default Stars
```

- A `max = 5` egy [[alapértelmezett paraméter]]: ha valaki nem adja meg a `max` propot, az értéke 5.
- A `'★'.repeat(max)` egymás után `max`-szor írja le a szöveget: `'★★★★★'`.
- A `style={{ width: … }}` [[inline stílus]]: a külső kapcsos zárójel a JSX-é, a belső egy objektum, amiben a
  CSS-tulajdonságok vannak. A szélesség egy [[template literal]]: `${percent}%`, például `'80%'`.
- A `role="img"` és az `aria-label` miatt a képernyőolvasó egyetlen képnek látja az egészet, és azt mondja:
  „Értékelés: 4 / 5”, nem pedig tízszer azt, hogy „fekete csillag”.
- A `toLocaleString` magyarosan írja ki a számot, legfeljebb egy tizedesjeggyel: a 4 marad 4, a 4.666… pedig 4,7 lesz.

Tedd be a csillagokat minden vélemény elejére. Cseréld le az `src/components/ReviewList.jsx` tartalmát:

```jsx file=src/components/ReviewList.jsx mark=1,17-22
import Stars from './Stars.jsx'

// ISO-dátumból magyar dátum: '2026-10-02T10:00:00.000Z' → '2026. október 2.'
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="empty">Még nincs vélemény. Írd meg te az elsőt!</p>
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

:::check Ellenőrizd
Minden vélemény előtt öt csillag áll, és annyi sárga, ahányat a vásárló adott: a selyemsálnál Anna K. ötöt, Márton B.
négyet adott, a füzetnél („Gold A5 notebook”) Lili H. hármat.
:::

:::mistake Gyakori hiba
`style="width: 80%"`, ahogy HTML-ben írnád. Reactben a `style` egy objektum, nem szöveg: az oldal elfehéredik, a
konzolban pedig ez áll: „The `style` prop expects a mapping from style properties to values, not a string.”
:::

:::try Próbáld ki
A `ReviewList`-ben írd át ideiglenesen a csillagokat `<Stars value={2.5} />`-re: minden véleménynél két és fél csillag
sárga. Aztán próbáld ki a `<Stars value={7} max={10} />`-et is: tíz csillag, hét sárga. Ugyanaz a komponens, csak
más propokkal. Végül állítsd vissza: `<Stars value={review.rating} />`.
:::

### Csillagok kattintásra

Most jöjjenek a csillagok, amikre kattintani lehet, amikor értékelsz. Ez más feladat, mint az előző: a `Stars` megmutat
egy értéket, ez pedig bekér egyet. Ezért külön komponens lesz, a neve `StarPicker`. Két komponens, mindegyiknek egy
dolga van; hogy hasonlóan néznek ki, az csak a CSS-en múlik.

Valójában öt [[rádiógomb]] dolgozik itt, ahogy a 3. leckében: az azonos `name`-mel ellátott rádiógombok egy csoportot
alkotnak, és egyszerre csak egy lehet kiválasztva. A billentyűzetes kezelést a böngésző magától megoldja (a ++Tab++
belép a csoportba, a nyilak lépkednek), a képernyőolvasó pedig felolvassa, hogy „5-ből 3”. A kerek gombokat a CSS
láthatatlanná teszi, de a helyükön hagyja, a csillagok fölött, így a kattintás továbbra is hozzájuk megy.

Egy kényelmi funkció is jár hozzá: ha az egeret a negyedik csillag fölé viszed, kattintás előtt is négy világít. Ehhez
egy második állapot kell, a `hover`: hányadik csillag fölött áll az egér (0, ha egyik fölött sem). Ez csak a kinézetet
befolyásolja, ezért a `StarPicker` maga tárolja. A kiválasztott értéket viszont kívülről kapja (`value`), és minden
kattintást jelez (`onChange`), ahogy a 3. lecke csúszkája: ez egy [[vezérelt mező]]. Hozd létre az
`src/components/StarPicker.jsx` fájlt:

```jsx file=src/components/StarPicker.jsx
import { useState } from 'react'

const WORDS = ['Gyenge', 'Elmegy', 'Jó', 'Nagyon jó', 'Kiváló']

function StarPicker({ value, onChange }) {
  // Hányadik csillag fölött áll az egér (0: egyik fölött sem). Csak a kinézethez kell.
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <fieldset className="star-picker" onMouseLeave={() => setHover(0)}>
      <legend>Értékelésed</legend>
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
                {stars} csillag: {word}
              </span>
            </label>
          )
        })}
        <span className="star-picker__word" aria-hidden="true">
          {shown > 0 ? WORDS[shown - 1] : 'Kattints egy csillagra'}
        </span>
      </div>
    </fieldset>
  )
}

export default StarPicker
```

- A `WORDS` tömb öt szót tartalmaz, egyet minden csillagszámhoz. A `map` második paramétere, az `index`, 0-tól
  számol, ezért a csillagok száma `index + 1`. Mivel itt a `map` függvénye nemcsak egy JSX-et ad vissza, hanem előbb
  kiszámolja a `stars`-t is, kapcsos zárójeles törzse van, és benne egy `return`.
- A `hover || value`: a `||` a bal oldalát adja, ha az nem 0 (vagy üres), különben a jobb oldalát. Ha az egér egy
  csillag fölött áll, az látszik, ha nem, a kiválasztott érték.
- Az `onMouseEnter` akkor fut le, amikor az egér egy elem fölé ér, az `onMouseLeave` pedig akkor, amikor elhagyja. Az
  egész csoport elhagyásakor a `hover` visszaáll 0-ra.
- Egy csillag akkor kapja meg az `is-on` osztályt (és lesz sárga), ha a sorszáma legfeljebb akkora, mint a mutatott
  érték.
- A `<fieldset>` és a `<legend>` címmel ellátott csoportba fogja a gombokat. A `visually-hidden` osztályú szöveg
  (például „4 csillag: Nagyon jó”) a képernyőn nem látszik, de a képernyőolvasó felolvassa: ez a rádiógomb felirata. A
  látható szó a sor végén éppen ezért `aria-hidden`, különben kétszer hallaná.

A csillagválasztó egy űrlapba kerül, amit a következő lépésben teszünk teljessé. Egyelőre csak az értékelést tárolja:
`0`, amíg nem kattintottál. Hozd létre az `src/components/ReviewForm.jsx` fájlt:

```jsx file=src/components/ReviewForm.jsx
import { useState } from 'react'
import StarPicker from './StarPicker.jsx'

function ReviewForm() {
  const [rating, setRating] = useState(0) // 0: még nincs értékelve

  return (
    <form className="review-form">
      <h3>Írd meg a véleményed</h3>
      <StarPicker value={rating} onChange={setRating} />
    </form>
  )
}

export default ReviewForm
```

Az `onChange={setRating}` magát a beállító függvényt adja át: a `StarPicker` a csillag számával hívja meg, és ez
pontosan az, amit el akarunk tárolni. Végül tedd az űrlapot a termék oldalának aljára. Cseréld le az
`src/components/ProductPage.jsx` tartalmát:

```jsx file=src/components/ProductPage.jsx mark=2,25
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

function ProductPage({ product, reviews, onBack }) {
  return (
    <article className="product-page">
      <button type="button" className="back" onClick={onBack}>
        ← Vissza a termékekhez
      </button>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        <ReviewList reviews={reviews} />
      </section>

      <ReviewForm />
    </article>
  )
}

export default ProductPage
```

:::check Ellenőrizd
Nyiss meg egy terméket: a vélemények alatt egy „Írd meg a véleményed” doboz áll, benne öt szürke csillag és a
„Kattints egy csillagra” szöveg. Vidd az egeret a harmadik csillag fölé: három sárga, mellettük a „Jó” szó. Kattints a
negyedikre, és vidd el az egeret: négy marad sárga, „Nagyon jó”. Most billentyűzettel: nyomd a ++Tab++-ot, amíg keret
nem jelenik meg egy csillag körül, aztán a ++←++ és a ++→++ nyíllal változtasd az értékelést.
:::

:::mistake Gyakori hiba
Mindegyik rádiógomb más `name`-et kap (például `name={'rating-' + stars}`), vagy egyik sem kap. Kattintással ugyanúgy
működik, mert a `checked` dönt, de a böngésző nem tekinti őket egy csoportnak: a nyilak nem lépkednek, a ++Tab++ pedig
mind az öt csillagon megáll.
:::

:::try Próbáld ki
Írd át a `WORDS` tömb szavait a saját ízlésed szerint, például `['Csalódás', 'Hát…', 'Rendben', 'Szuper', 'Imádom!']`.
A csillagok száma a tömb hosszából jön: ha kivennél belőle egy szót, csak négy csillag maradna.
:::

### A vélemény elküldése

Most jön a teljes űrlap: név, vélemény és egy „Vélemény küldése” gomb, és az elküldött vélemény azonnal megjelenik a
listában. De hol éljenek a vélemények? Eddig az `App` egyenesen a `SAMPLE_REVIEWS`-t adta tovább, most viszont
változniuk kell, tehát [[állapot]] lesz belőlük. A listának (a `ProductPage`-ben) és az űrlapnak is szüksége van rájuk,
ezért egy közös ősükben kell élniük. A legközelebbi a `ProductPage` lenne, de az eltűnik, amikor visszalépsz a listára,
és vele együtt az állapota is; ezért egy szinttel feljebb, az `App`-ban élnek: ez az [[állapot felemelése]]. Az űrlap
egy függvényt kap, amivel szólhat, hogy új vélemény született.

Az új véleménynek ugyanolyan alakúnak kell lennie, mint a mintáknak. Az azonosítót a böngésző gyártja: a
`crypto.randomUUID()` minden hívásra egy hosszú, véletlen [[UUID]]-t ad. A `new Date().toISOString()` a mostani
pillanat, ugyanabban az ISO-formában, mint a mintaadatokban. Cseréld le az `src/components/ReviewForm.jsx` tartalmát:

```jsx file=src/components/ReviewForm.jsx mark=4,6-9,11-25,27-41,44,47-67
import { useState } from 'react'
import StarPicker from './StarPicker.jsx'

function ReviewForm({ productId, onAdd }) {
  const [rating, setRating] = useState(0) // 0: még nincs értékelve
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false) // az előbb küldtünk el egyet?

  function handleSubmit(event) {
    event.preventDefault()
    setSent(false)
    if (rating === 0) {
      setError('Válaszd ki, hány csillagot adsz.')
      return
    }
    if (author.trim() === '') {
      setError('Írd be a neved.')
      return
    }
    if (text.trim().length < 10) {
      setError('Írj legalább 10 karaktert a termékről.')
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
    // Kész: az űrlap kiürül a következő véleményhez.
    setRating(0)
    setAuthor('')
    setText('')
    setError('')
    setSent(true)
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Írd meg a véleményed</h3>
      <StarPicker value={rating} onChange={setRating} />
      <label className="field">
        <span>Neved</span>
        <input value={author} onChange={(event) => setAuthor(event.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        <span>Véleményed</span>
        <textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="form-thanks" role="status">
          Köszönjük! A véleményed megjelent.
        </p>
      )}
      <button type="submit" className="button--primary">
        Vélemény küldése
      </button>
    </form>
  )
}

export default ReviewForm
```

- A név és a vélemény szövege [[vezérelt mező]]: az értéke állapotból jön, és minden billentyűleütés frissíti. A
  hosszabb szövegnek való mező a [[textarea]].
- Az `onSubmit` akkor fut le, amikor az űrlapot elküldik: a gombra kattintva, vagy ha a névmezőben ++Enter++-t nyomsz.
  Az `event.preventDefault()` letiltja a böngésző [[alapértelmezett viselkedését|alapértelmezett viselkedés]], ami az
  oldal újratöltése lenne.
- Az ellenőrzések sorban mennek, és az első hibánál a `return` kilép a függvényből. A [[trim]] levágja a szöveg elejéről
  és végéről a szóközöket, így a csupa szóközből álló név is üresnek számít.
- Az `onAdd` egy objektumot kap: ez az új vélemény. A `productId` egymagában ugyanazt jelenti, mint a
  `productId: productId`, mert a kulcs és a változó neve egyezik. A küldés után minden mező kiürül.
- Az `{error && …}` csak akkor rajzolja ki a hibaüzenetet, ha van szövege: ez a [[feltételes megjelenítés]]. A
  `role="alert"` miatt a képernyőolvasó azonnal felolvassa.

A `ProductPage` csak továbbadja az `App` függvényét az űrlapnak. Cseréld le az `src/components/ProductPage.jsx`
tartalmát:

```jsx file=src/components/ProductPage.jsx mark=4,25
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

function ProductPage({ product, reviews, onBack, onAddReview }) {
  return (
    <article className="product-page">
      <button type="button" className="back" onClick={onBack}>
        ← Vissza a termékekhez
      </button>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        <ReviewList reviews={reviews} />
      </section>

      <ReviewForm productId={product.id} onAdd={onAddReview} />
    </article>
  )
}

export default ProductPage
```

Az `App`-ban a vélemények állapotba kerülnek, és az `addReview` egy **új** tömbbel cseréli le őket: elöl az új vélemény,
mögötte pedig a [[spread]] (`...`) kiteríti az összes régit. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=8,12-15,27,29
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import ProductCard from './components/ProductCard.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

function App() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS)
  const [openId, setOpenId] = useState(null) // a megnyitott termék id-je, vagy null: a lista látszik
  const openProduct = PRODUCTS.find((product) => product.id === openId)

  function addReview(review) {
    // Új tömb: elöl az új vélemény, mögötte az összes régi.
    setReviews([review, ...reviews])
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
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

:::check Ellenőrizd
Nyisd meg a selyemsálat, és kattints a „Vélemény küldése” gombra anélkül, hogy bármit kitöltenél: „Válaszd ki, hány
csillagot adsz.” Adj négy csillagot, a neved legyen „Teszt Elek”, a vélemény pedig „Puha és meleg, imádom!”, aztán
küldd el: a vélemény megjelenik a lista elején négy csillaggal és a mai dátummal, az űrlap kiürül, és alatta ez áll:
„Köszönjük! A véleményed megjelent.” Most frissítsd az oldalt (++F5++): a véleményed eltűnt. Az állapot csak addig él,
amíg az oldal nyitva van; a haladó szinten egy szerverre kerül. Ezzel kész a kezdő szint: commitold!
:::

:::mistake Gyakori hiba
`reviews.push(review)`, aztán `setReviews(reviews)`. Az űrlap kiürül, és a „Köszönjük!” is megjelenik, de a vélemény
nem kerül a listába: a `push` a régi tömböt módosítja, a React pedig azt látja, hogy ugyanazt a tömböt kapta vissza, és
nem rajzolja újra az `App`-ot. Az állapotot sosem írjuk át helyben: mindig új tömb vagy objektum kell, ahogy a 9.
leckében.
:::

:::try Feladat
Amíg a vélemény rövidebb 10 karakternél, mutasd meg a szövegmező alatt, mennyi hiányzik még: „Még 6 karakter”. A szám
`10 - text.trim().length`; a sort csak akkor rajzold ki, ha a szám nagyobb 0-nál, és a szövegmező nem üres.
:::

## Középszint {level=2}

### Saját cím minden terméknek

A megnyitott termék most egy állapotban él, és ennek ára van. Ha frissíted az oldalt, visszakerülsz a listára. A
böngésző Vissza gombja nem a listára visz, hanem elhagyja az oldalt. És egy termékről nem tudsz linket küldeni
senkinek. Egy igazi adatlapnak saját címe van: a selyemsál a `#/product/silk-scarf`-on lakik, a füzet a
`#/product/notebook`-on. A címből dől el, mit mutat az app: ez a [[routing]].

A routert az 1. leckéből már ismered: a `useHashRoute` hook figyeli a cím `#` utáni részét, a [[hash]]-t, és útvonalként
adja vissza: `'/product/silk-scarf'`, vagy a listánál `'/'`. Ha megvan az 1. vagy a 23. leckés projekted, másold át
onnan a fájlt; ha nincs, hozd létre az `src/useHashRoute.js`-t:

```js file=src/useHashRoute.js
import { useEffect, useState } from 'react'

const currentPath = () => window.location.hash.slice(1) || '/'

// A cím # utáni részét adja vissza, és frissül, amikor az megváltozik.
function useHashRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    // Takarítás: ha a komponens eltűnik, már nem figyelünk.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export default useHashRoute
```

Gyors ismétlés: a `slice(1)` levágja a `#`-et, a `|| '/'` pedig azt jelenti: „vagy `'/'`, ha semmi sem maradt”. A
`useState(currentPath)` egyszer, az elején olvassa ki a címet ([[lusta kezdőérték]]). Az effekt a böngésző
`hashchange` eseményére figyel, ami mindig bekövetkezik, amikor a `#` utáni rész megváltozik, a [[takarító
függvény|takarító függvény]] pedig leiratkozik róla.

Egyetlen címminta szolgál mind a hat termékhez: `/product/:id`, ahol a `:id` helyén mindig az adott termék azonosítója
áll (`silk-scarf`, `notebook`…). Ez a [[dinamikus útvonal]]. Az `App` kiolvassa az útvonalból az azonosítót, és három
dolog közül választ: a lista, egy termék oldala, vagy egy üzenet, ha nincs ilyen
termék. Három esethez a ternáris operátor már nehezen olvasható, ezért egy `page` változóba tesszük, amit mutatni kell,
egy `if … else if … else` sorral. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=3,8-12,16-18,25-53,62
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import useHashRoute from './useHashRoute.js'
import ProductCard from './components/ProductCard.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Minden más útvonal (például a lista: '/') → null.
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
    // Új tömb: elöl az új vélemény, mögötte az összes régi.
    setReviews([review, ...reviews])
  }

  // Mit mutasson az oldal: a listát, egy terméket, vagy azt, hogy nincs ilyen termék.
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
        <p>Nincs ilyen termék.</p>
        <a className="back" href="#/">
          ← Vissza a termékekhez
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
      </header>

      {page}
    </main>
  )
}

export default App
```

- A `productIdFrom` megnézi, hogy az útvonal `/product/`-tal kezdődik-e (`startsWith`), és ha igen, a maradékot adja
  vissza (`slice`): ez a termék azonosítója. A `#/product/teapot` címből `'teapot'` lesz, de ilyen termék nincs, így az
  `openProduct` `undefined`, és a harmadik ág fut le.
- A JSX is érték, ezért változóba tehető: a `page` hol egy lista, hol egy termék oldala, hol egy üzenet, a `return`
  pedig egyszerűen kirajzolja, ami benne van.
- `key={openProduct.id}`: a [[key]] nemcsak listákban működik. Ha megváltozik, a React eldobja a régi komponenst, és
  vadonatújat készít, friss állapottal. Ha a böngésző Vissza gombjával egyenesen egy másik termék oldalára lépsz, a
  félig megírt véleményed nem kerül át a másik termékhez.

A kártyán a gombból link lesz, ami a termék címére mutat. Cseréld le az `src/components/ProductCard.jsx` tartalmát:

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
        <p className="product-card__price">{product.price} €</p>
      </div>
    </li>
  )
}

export default ProductCard
```

Ez egy közönséges link. Ha rákattintasz, csak a hash változik meg: a böngésző nem tölt be új oldalt, hanem kiváltja a
`hashchange` eseményt, a hookunk pedig átadja az új útvonalat az `App`-nak. A termék oldalán a „← Vissza a termékekhez”
gomb is link lesz, és a `#/` címre mutat. Cseréld le az `src/components/ProductPage.jsx` tartalmát:

```jsx file=src/components/ProductPage.jsx mark=1,5-9,13,15
import { useEffect } from 'react'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

function ProductPage({ product, reviews, onAddReview }) {
  // Egy termék oldala mindig felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Vissza a termékekhez
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        <ReviewList reviews={reviews} />
      </section>

      <ReviewForm productId={product.id} onAdd={onAddReview} />
    </article>
  )
}

export default ProductPage
```

Ha a lista aljáról kattintasz egy kártyára, az új oldal különben ugyanott maradna legörgetve, mert a böngésző megtartja
a görgetés helyét. A `window.scrollTo(0, 0)` a lap tetejére görget. Az üres [[függőségi tömb]] (`[]`) miatt az effekt
csak egyszer fut le, amikor az oldal megjelenik; és mivel az `App` minden terméknek saját `key`-t ad, ez minden
terméknél egyszer történik meg.

:::check Ellenőrizd
Kattints a „Teal silk scarf” kártyára: a címsor végén `#/product/silk-scarf` áll. Frissítsd az oldalt: a sál marad. A
böngésző Vissza gombja a listára visz, az Előre gomb megint a sálra. Írd át kézzel a cím végét `#/product/teapot`-ra:
megjelenik a „Nincs ilyen termék.” üzenet, alatta egy link vissza a termékekhez.
:::

:::concept Miért van # a címben?
Egy olyan szerver, mint a GitHub Pages, fájlokat szolgál ki. A `/product/silk-scarf` címre ilyen nevű fájlt keresne,
nem találna, és 404-gyel válaszolna, például ha valaki újratölti az oldalt, vagy megnyit egy elküldött linket. A `#`
utáni rész viszont el sem jut a szerverhez: a szerver mindig az `index.html`-t adja, a többit pedig a mi kódunk olvassa
ki. Ezért működik a hash-alapú router bárhol, a szerver beállítása nélkül. (A 20. lecke „És a React Router?” dobozában
láttad: a React Router szebb, `#` nélküli címeket is tud, de ahhoz a szervert is be kell állítani.)
:::

:::mistake Gyakori hiba
`href="/product/silk-scarf"`, `#` nélkül. A böngésző ilyenkor elhagyja az oldalt, és a szervertől kéri a címet. Az app
elölről indul, a routerünk pedig, ami csak a `#` utáni részt olvassa, a listát mutatja, és a megírt véleményeid is
elvesznek.
:::

### Az átlag: számolt adat

Egy véleményoldal legfontosabb száma az átlag: hány csillagot kapott egy termék átlagosan, és hány vélemény alapján. A
termék oldalán azt is megmutatjuk, hogyan oszlanak meg a csillagok: hány vásárló adott ötöt, hány négyet, és így
tovább.

Ezek közül egyik sem lesz állapot. Mind a vélemények listájából következik, ezért minden rajzoláskor újra kiszámoljuk
őket: ezek [[származtatott értékek|származtatott érték]]. Ha az átlagot állapotban tartanánk, minden új véleménynél
frissíteni kellene, és ha egyszer elfelejtenénk, az oldal hazudna. Így viszont egy új vélemény után az átlag magától
stimmel, mert a következő rajzolás már az új listából számol.

A számoló függvényeknek semmi közük a Reacthez, ezért külön fájlba kerülnek. Hozd létre az `src/stats.js` fájlt:

```js file=src/stats.js
// Számolt adatok: egyik sincs állapotban, mindig a vélemények listájából számoljuk őket.

// Egy termék véleményei az összes közül.
export function reviewsOf(reviews, productId) {
  return reviews.filter((review) => review.productId === productId)
}

// Hány vélemény van, mennyi az átlaguk, és hány jut az egyes csillagszámokra.
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

// 4.666… → '4,7': egy tizedesjegy, tizedesvesszővel.
export function formatRating(value) {
  return value.toLocaleString('hu-HU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// 3 → '3 vélemény'
export function reviewCount(count) {
  return `${count} vélemény`
}
```

- A `summarize` egy `for … of` [[ciklussal|ciklus]] egyszer végigmegy a véleményeken. Közben összeadja a csillagokat
  (`total`), és a `counts` objektumban számolja, hányszor fordult elő az 1, a 2 … az 5. A `counts[review.rating]`
  annak a kulcsnak az értéke, ami a `review.rating`-ben van: egy 4 csillagos véleménynél a `counts[4]` nő eggyel.
- Az átlag az összeg osztva a darabszámmal. Ha egy termékhez még nincs vélemény, 0-t adunk, mert a `0 / 0` a JavaScriptben
  `NaN` („nem szám”), és az kiírva elég furán festene.
- A `formatRating` mindig pontosan egy tizedesjegyet ír: a 4 is „4,0” lesz, így a kártyákon egyforma hosszúak a számok.
- A `reviewCount` most nagyon egyszerű, de két helyen is kell majd (a kártyán és az összesítőben). Ha egyszer azt
  szeretnéd, hogy „3 értékelés” álljon ott, csak itt kell átírnod.

Kezdjük az `App`-pal: kiszámolja minden kártya saját összesítőjét, és egy `stats` propban átadja neki; a termék
oldalának pedig mostantól a `reviewsOf` adja a véleményeket. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=4,32,41
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import useHashRoute from './useHashRoute.js'
import { reviewsOf, summarize } from './stats.js'
import ProductCard from './components/ProductCard.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Minden más útvonal (például a lista: '/') → null.
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
    // Új tömb: elöl az új vélemény, mögötte az összes régi.
    setReviews([review, ...reviews])
  }

  // Mit mutasson az oldal: a listát, egy terméket, vagy azt, hogy nincs ilyen termék.
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
        <p>Nincs ilyen termék.</p>
        <a className="back" href="#/">
          ← Vissza a termékekhez
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
      </header>

      {page}
    </main>
  )
}

export default App
```

Az oldalon még semmi sem változott, mert a kártya nem használja a `stats` propot. Most megmutatja: ugyanazt a `Stars`
komponenst használja, mint a vélemények, csak most egy átlaggal. Cseréld le az `src/components/ProductCard.jsx`
tartalmát:

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
          <p className="product-card__rating">Még nincs vélemény</p>
        )}
        <p className="product-card__price">{product.price} €</p>
      </div>
    </li>
  )
}

export default ProductCard
```

A fájl a `components` mappában van, ezért a `'../stats.js'` előbb egy mappát feljebb lép (`..`), az `src`-be.

A termék oldalán egy összesítő jelenik meg: nagyban az átlag, alatta a csillagok, mellette pedig egy-egy sáv minden
csillagszámhoz: minél többen adták azt a csillagszámot, annál hosszabb a sáv. Hozd létre az
`src/components/RatingSummary.jsx` fájlt:

```jsx file=src/components/RatingSummary.jsx
import Stars from './Stars.jsx'
import { formatRating, reviewCount } from '../stats.js'

// Az átlag nagyban, és egy sáv minden csillagszámhoz, 5-től 1-ig.
function RatingSummary({ stats }) {
  return (
    <div className="summary">
      <div className="summary__score">
        <strong>{formatRating(stats.average)}</strong>
        <Stars value={stats.average} />
        <span className="summary__count">{reviewCount(stats.count)} alapján</span>
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

A `[5, 4, 3, 2, 1]` egy helyben megírt tömb: a sávok fentről lefelé az ötcsillagosokkal kezdődnek. A sáv kitöltése
ugyanazzal a trükkel készül, mint a csillagok: egy inline stílussal megadott szélességgel. A `Stars` itt nagyobb, de
ehhez nem kellett hozzányúlni: a CSS az összesítőben nagyobb betűméretet ad neki (`.summary__score .stars`).

A termék oldala kiszámolja az összesítőt, és ha van legalább egy vélemény, megmutatja. Cseréld le az
`src/components/ProductPage.jsx` tartalmát:

```jsx file=src/components/ProductPage.jsx mark=2-3,8-9,33
import { useEffect } from 'react'
import { summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

function ProductPage({ product, reviews, onAddReview }) {
  // Származtatott adat: minden rajzoláskor a vélemények mostani listájából számoljuk.
  const stats = summarize(reviews)

  // Egy termék oldala mindig felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Vissza a termékekhez
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        {stats.count > 0 && <RatingSummary stats={stats} />}
        <ReviewList reviews={reviews} />
      </section>

      <ReviewForm productId={product.id} onAdd={onAddReview} />
    </article>
  )
}

export default ProductPage
```

:::check Ellenőrizd
A kártyákon megjelennek a csillagok és az átlag: „4,7 · 3 vélemény” a selyemsálnál (négy és kétharmad csillag sárga),
„5,0 · 1 vélemény” az esernyőnél. Nyisd meg a sálat: az összesítőben nagy „4,7”, „3 vélemény alapján”, az „5 ★” sávnál 2,
a „4 ★”-nál 1, a többinél 0. Írj egy egycsillagos véleményt: az átlag azonnal 3,8-ra esik, és az „1 ★” sávban is
megjelenik egy csík, mellette 1. Lépj vissza a listára: a sál kártyáján már „3,8 · 4 vélemény” áll.
:::

:::mistake Gyakori hiba
Az átlagot külön `useState`-ben tartani, és egy `useEffect`-ből frissíteni, valahányszor megváltoznak a vélemények.
Működik, de minden változásnál kétszer rajzol, és ha egyszer kimarad egy függőség, az átlag már nem a valódi
véleményekből jön. Amit ki lehet számolni az állapotból, azt számold ki, ne tárold.
:::

:::try Feladat
Írd ki az összesítőben a darabszám alá, hányan ajánlják a terméket, vagyis hány százalékuk adott 4 vagy 5 csillagot:
„A vásárlók 67%-a ajánlja”. A szám: `Math.round(((stats.counts[4] + stats.counts[5]) / stats.count) * 100)`.
:::

### Rendezés

A vásárlók szeretik elöl látni a legjobbakat: a terméklista legyen rendezhető értékelés, a vélemények száma és ár
szerint, a termék oldalán pedig a vélemények dátum és csillagszám szerint.

A 10. leckéből ismered a [[sort]]-ot: egy [[összehasonlító függvényt|összehasonlító függvény]] kap, ami két elemről (`a`
és `b`) mondja meg, melyik jöjjön előbb. Ha negatív számot ad, az `a`, ha pozitívat, a `b`. Számoknál ez egy kivonás:
az `a.price - b.price` növekvő, a `b.price - a.price` csökkenő sorrendet ad. És egy fontos tulajdonság: a `sort`
[[helyben rendez]], vagyis magát a tömböt rendezi át. Állapotot vagy propot ezért sosem rendezünk közvetlenül, hanem
egy új tömböt.

A rendezést egy [[legördülő listából|legördülő lista]] lehet kiválasztani. Két helyen is kell (a termékeknél és a
véleményeknél), csak más lehetőségekkel, ezért ez is újra felhasználható komponens lesz: a lehetőségeket egy propban kapja. Minden rendezést egy
objektum ír le: a felirata (`label`) és az összehasonlító függvénye (`compare`). Hozd létre az
`src/components/SortSelect.jsx` fájlt:

```jsx file=src/components/SortSelect.jsx
// Legördülő lista a rendezéshez. A sorts minden kulcsa egy rendezés: { label, compare }.
function SortSelect({ sorts, value, onChange }) {
  return (
    <label className="sort-select">
      <span>Rendezés</span>
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

Az `Object.keys(sorts)` felsorolja a rendezések kulcsait (például `['rating', 'reviews', 'price']`), és mindegyikből egy
`<option>` lesz. A `<select>` is vezérelt mező: a `value` mondja meg, melyik lehetőség látszik.

A termékek listája most már elég nagy ahhoz, hogy saját komponenst kapjon, a saját rendezési állapotával. Hozd létre az
`src/components/ProductList.jsx` fájlt:

```jsx file=src/components/ProductList.jsx
import { useState } from 'react'
import { PRODUCTS } from '../products.js'
import { reviewsOf, summarize } from '../stats.js'
import ProductCard from './ProductCard.jsx'
import SortSelect from './SortSelect.jsx'

const PRODUCT_SORTS = {
  rating: { label: 'Legjobbra értékelt', compare: (a, b) => b.stats.average - a.stats.average },
  reviews: { label: 'Legtöbb vélemény', compare: (a, b) => b.stats.count - a.stats.count },
  price: { label: 'Legolcsóbb elöl', compare: (a, b) => a.price - b.price },
}

function ProductList({ reviews }) {
  const [sort, setSort] = useState('rating')

  // Minden termék mellé odatesszük az összesítőjét, aztán rendezzük őket. Csupa számolt adat.
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

- A `map` minden termékből egy új objektumot készít: a termék összes adata ([[spread]]), plusz egy `stats` mező. A
  nyílfüggvény itt egy objektumot ad vissza, ezért kerek zárójelbe tesszük: `(product) => ({ … })`. Zárójel nélkül a
  kapcsos zárójelet a függvény törzsének hinné a JavaScript.
- A `map` új tömböt ad, ezért a `sort` nyugodtan rendezheti: a `PRODUCTS`-hoz nem nyúl.
- `PRODUCT_SORTS[sort].compare`: a kiválasztott rendezés összehasonlító függvénye. A `sort` állapot csak a kulcsot
  tárolja (`'rating'`), a függvényt mindig a `PRODUCT_SORTS`-ból vesszük elő.
- A `<>` és `</>` egy [[Fragment]]: összefog két elemet anélkül, hogy egy fölösleges `<div>`-et tenne köréjük.

A véleményeknél dátum szerint is rendezünk. Az ISO-dátumokat nem kell átalakítani hozzá: mivel az évvel kezdődnek, és
utána jön a hónap meg a nap, a betűrendjük egyben az időrendjük is. Két szöveget a [[localeCompare]] hasonlít össze: a
`b.createdAt.localeCompare(a.createdAt)` a legújabbat teszi előre. Cseréld le az `src/components/ProductPage.jsx`
tartalmát:

```jsx file=src/components/ProductPage.jsx mark=1,4,8-12,15,17-18,43-48
import { useEffect, useState } from 'react'
import { summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Legújabb elöl', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Legjobb értékelés elöl', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Leggyengébb értékelés elöl', compare: (a, b) => a.rating - b.rating },
}

function ProductPage({ product, reviews, onAddReview }) {
  const [sort, setSort] = useState('newest')
  const stats = summarize(reviews)
  // A sort helyben rendez, ezért előbb lemásoljuk a tömböt: a propot sosem írjuk át.
  const sorted = [...reviews].sort(REVIEW_SORTS[sort].compare)

  // Egy termék oldala mindig felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Vissza a termékekhez
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
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

Az `App`-ban a lista helyére a `ProductList` kerül, és mivel a kártyákat már ő rakja ki, a `ProductCard` és a
`summarize` importja kikerül. Cseréld le az `src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=4-5,29
import { useState } from 'react'
import { PRODUCTS, SAMPLE_REVIEWS } from './products.js'
import useHashRoute from './useHashRoute.js'
import { reviewsOf } from './stats.js'
import ProductList from './components/ProductList.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Minden más útvonal (például a lista: '/') → null.
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
    // Új tömb: elöl az új vélemény, mögötte az összes régi.
    setReviews([review, ...reviews])
  }

  // Mit mutasson az oldal: a listát, egy terméket, vagy azt, hogy nincs ilyen termék.
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
        <p>Nincs ilyen termék.</p>
        <a className="back" href="#/">
          ← Vissza a termékekhez
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
      </header>

      {page}
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Előbb töltsd újra az oldalt (++F5++): az előző lépés egycsillagos véleménye eltűnik, és csak a mintavélemények
maradnak. A termékek fölött egy „Rendezés” feliratú legördülő lista áll, benne a „Legjobbra értékelt” van kiválasztva:
elöl az esernyő (5,0), aztán a sál (4,7), a nyomat (4,5), a füzet (4,0), a táska (3,7) és a telefontok (3,5). „Legolcsóbb elöl”: a füzet (18 €) az első, a sál (59 €)
az utolsó. A táska („Ruby canvas tote bag”) oldalán „Legújabb elöl” sorrendben James W. (2026. november 8.) az első,
„Leggyengébb értékelés elöl” sorrendben Dóra P. két csillaggal.
:::

:::mistake Gyakori hiba
`reviews.sort(…)`, másolat nélkül. Most még semmi baj nem látszik, mert az `App` a `reviewsOf`-fal egy új tömböt ad át.
De a `ProductPage` ezt nem tudhatja: ha egyszer egyenesen az `App` állapotát kapná, a `sort` a React háta mögött
rendezné át. A propot és az állapotot sosem módosítjuk helyben, és ez a rendezésre is igaz: `[...reviews].sort(…)`, vagy
az eleve új tömböt adó [[toSorted]]: `reviews.toSorted(…)`.
:::

:::try Feladat
Adj a termékekhez egy „Legdrágább elöl” rendezést: egyetlen új sor a `PRODUCT_SORTS`-ban. A legördülő lista magától
megkapja, mert a lehetőségeit ebből az objektumból építi.
:::

### Szűrés

Végül a szűrők. A termékek listáján gombokkal lehessen kiválasztani, hogy csak a jól értékelt termékek látsszanak
(legalább 4, vagy legalább 4,5 csillag). A termék oldalán pedig az összesítő sávjaiból legyenek gombok: az „5 ★” sávra
kattintva csak az ötcsillagos vélemények maradjanak.

A szűrés a [[filter]] dolga, és jól megfér a rendezéssel: előbb szűrünk, aztán rendezünk. A `filter` új tömböt ad,
ezért utána a `sort` már azt rendezi, másolni sem kell. A gombok be- és kikapcsolhatók, ezért [[aria-pressed]]
attribútumot kapnak: ebből tudja a képernyőolvasó (és a CSS), hogy melyik van éppen bekapcsolva.

Kezdjük a termékekkel. Cseréld le az `src/components/ProductList.jsx` tartalmát:

```jsx file=src/components/ProductList.jsx mark=13-17,21,23,27-29,35-47,50-58
import { useState } from 'react'
import { PRODUCTS } from '../products.js'
import { reviewsOf, summarize } from '../stats.js'
import ProductCard from './ProductCard.jsx'
import SortSelect from './SortSelect.jsx'

const PRODUCT_SORTS = {
  rating: { label: 'Legjobbra értékelt', compare: (a, b) => b.stats.average - a.stats.average },
  reviews: { label: 'Legtöbb vélemény', compare: (a, b) => b.stats.count - a.stats.count },
  price: { label: 'Legolcsóbb elöl', compare: (a, b) => a.price - b.price },
}

const MIN_RATINGS = [
  { value: 0, label: 'Mind' },
  { value: 4, label: '4 ★ vagy több' },
  { value: 4.5, label: '4,5 ★ vagy több' },
]

function ProductList({ reviews }) {
  const [sort, setSort] = useState('rating')
  const [minRating, setMinRating] = useState(0)

  // Minden termék mellé odatesszük az összesítőjét, aztán szűrjük és rendezzük őket. Csupa számolt adat.
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
        <div className="chips" role="group" aria-label="Legalább ennyi csillag">
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
        <p className="empty">Egy termék sem felel meg a szűrőnek.</p>
      )}
    </>
  )
}

export default ProductList
```

- A `MIN_RATINGS` a szűrőgombok listája: mindegyiknek van értéke és felirata. A 0 azt jelenti: „bármennyi”, hiszen
  minden átlag legalább 0.
- A `.map(…).filter(…).sort(…)` egy lánc: mindegyik lépés az előző eredményén dolgozik. Ha egy sorba nem fér ki, a
  következő lépést új sorba írjuk, ponttal kezdve.
- A `role="group"` és az `aria-label` egy névvel ellátott csoportba fogja a gombokat a képernyőolvasónak.

Az összesítő sávjaiból gombok lesznek. Az összesítő nem tudja, hogyan működik a szűrés: megkapja, melyik csillagszám
van kiválasztva (`filter`), és kattintáskor szól (`onFilter`). Ha a már kiválasztott sávra kattintasz, a szűrő kikapcsol: 0 lesz, ami
azt jelenti, „minden vélemény”. Cseréld le az `src/components/RatingSummary.jsx` tartalmát:

```jsx file=src/components/RatingSummary.jsx mark=4-5,19-33
import Stars from './Stars.jsx'
import { formatRating, reviewCount } from '../stats.js'

// Az átlag nagyban, és egy sáv minden csillagszámhoz. A sávra kattintva csak azok a vélemények látszanak.
function RatingSummary({ stats, filter, onFilter }) {
  return (
    <div className="summary">
      <div className="summary__score">
        <strong>{formatRating(stats.average)}</strong>
        <Stars value={stats.average} />
        <span className="summary__count">{reviewCount(stats.count)} alapján</span>
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
                aria-label={`${stars} csillagos vélemények: ${count}`}
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

A `disabled={count === 0}` letiltja azokat a sávokat, amelyekhez egy vélemény sem tartozik: azokra szűrni úgysem lenne
értelme. Az `aria-label` adja a gomb nevét a képernyőolvasónak, mert az „5 ★ 2” felolvasva elég rejtélyes.

A termék oldalán a szűrő egy új állapot. Ha be van kapcsolva, a rendezés mellett egy sor mondja meg, hány vélemény
látszik, és egy gomb kikapcsolja. Cseréld le az `src/components/ProductPage.jsx` tartalmát:

```jsx file=src/components/ProductPage.jsx mark=16,18-21,45,49-56,59
import { useEffect, useState } from 'react'
import { summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Legújabb elöl', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Legjobb értékelés elöl', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Leggyengébb értékelés elöl', compare: (a, b) => a.rating - b.rating },
}

function ProductPage({ product, reviews, onAddReview }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0: minden vélemény, 1–5: csak az ennyi csillagosak
  const stats = summarize(reviews)
  // Előbb szűrünk, aztán rendezünk. A filter új tömböt ad, így a sort már nem a propot rendezi.
  const visible = reviews
    .filter((review) => filter === 0 || review.rating === filter)
    .sort(REVIEW_SORTS[sort].compare)

  // Egy termék oldala mindig felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Vissza a termékekhez
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        {stats.count > 0 && <RatingSummary stats={stats} filter={filter} onFilter={setFilter} />}
        {stats.count > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
            {filter > 0 && (
              <p className="filter-note">
                Csak {filter} csillagos vélemények: {visible.length} / {reviews.length}
                <button type="button" className="link-button" onClick={() => setFilter(0)}>
                  Összes mutatása
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

A `filter === 0 || review.rating === filter` akkor igaz, ha nincs szűrés, **vagy** a vélemény csillagszáma éppen a
kiválasztott. A `||` itt is a bal oldallal kezd: ha az igaz, a jobb oldalt meg sem nézi.

:::check Ellenőrizd
A termékek fölött a rendezés mellett három gomb áll, a „Mind” be van kapcsolva. „4 ★ vagy több”: négy termék marad, a
táska és a telefontok eltűnik. „4,5 ★ vagy több”: csak az esernyő, a sál és a nyomat. Nyisd meg a táskát, és kattints
az összesítőben az „5 ★” sávra: csak Eszter N. véleménye marad, és a rendezés mellett ez áll: „Csak 5 csillagos
vélemények: 1 / 3”, egy „Összes mutatása” gombbal. Kattints újra a sávra (vagy a gombra): mind a három visszajön. Az
„1 ★” sáv szürke, nem lehet rákattintani. Ezzel kész a középszint: commitold!
:::

:::mistake Gyakori hiba
Kimarad a feltételből a `filter === 0 ||`. Induláskor a `filter` 0, és egyetlen vélemény sem 0 csillagos, így a lista
üres: „Még nincs vélemény”, pedig az összesítő szerint három is van.
:::

:::try Próbáld ki
Írd ki a sávok végén a darabszám mellé a százalékot is, például „2 (67%)”. A `percent` már ott van a `map`-ben; kerekíteni
a `Math.round(percent)` tud.
:::

## Haladó szint {level=3}

### A vélemények a szerveren

A véleményeid most csak a te böngésződ memóriájában élnek: egy frissítés, és eltűnnek, más pedig soha nem is látja
őket. Egy igazi véleményoldal a véleményeket egy [[szerver]]en tárolja, egy adatbázisban, és minden látogató onnan
kéri le őket. A böngésző kéréseket küld (add ide a véleményeket, mentsd el ezt az újat), a szerver pedig válaszol.

Ez a tanfolyam nem használ külső szolgáltatásokat, ezért a kiinduló projekt egy kitalált szervert hoz: az
`src/fakeApi.js`-t. A böngésződben fut, de úgy viselkedik, mint egy igazi:

- az adatokat gyűjteményekben tartja (itt: `reviews` és `users`), és minden elem kap egy `id`-t meg egy `createdAt`
  dátumot, amikor létrehozzák;
- minden kérésre várni kell egy kicsit, mint az interneten, és néha egy kérés elbukik, ahogy az igaziaknál is
  előfordul;
- az „adatbázisa” egyetlen localStorage-kulcs, így amit elmentett, az egy frissítés után is megvan, és a böngésző két
  lapja úgy viselkedik, mint két eszköz, amelyek ugyanazt a szervert használják.

A fájl elején lévő megjegyzés felsorolja a kéréseit: `list` (az összes elem), `create` (új elem), `update` (egy elem
módosítása), `remove` (törlés) és társaik. Mindegyik [[Promise]]-t ad vissza, ezért `await`-tel kell megvárni, és
[[try/catch]]-csel elkapni a hibát, pont úgy, mint a 14. leckében a `fetch`-et.

Először el kell indítani a szervert. Hozd létre az `src/api.js` fájlt:

```js file=src/api.js
import { createMockApi } from './fakeApi.js'
import { SAMPLE_REVIEWS } from './products.js'

// A bolt kitalált szervere. Az adatbázisa a mintavéleményekkel és egyetlen fiókkal, a moderátoréval indul.
// A fiókokra (users) a következő lépésektől lesz szükség.
export const api = createMockApi('peacock-shop', {
  seed: {
    reviews: SAMPLE_REVIEWS,
    users: [{ id: 'moderator', name: 'Moderátor', role: 'moderator' }],
  },
  latency: [400, 900], // minden kérés 0,4–0,9 másodpercig tart
  failRate: 0.1, // és nagyjából minden tizedik elbukik
})
```

A `seed` a kezdőadat: ezzel indul az adatbázis, amikor a böngésződben még nincs elmentve semmi. Ha már van, az
elmentett adatokkal folytatja.

A vélemények betöltése, tárolása és küldése mostantól egy [[saját hookba|saját hook]] kerül. Így az `App` rövid marad,
és egy helyen van minden, ami a szerverrel beszél. Hozd létre az `src/useReviews.js` fájlt:

```js file=src/useReviews.js
import { useEffect, useState } from 'react'
import { api } from './api.js'

// Minden, ami a szerveren lévő véleményekkel kapcsolatos: betöltés, állapot, új vélemény.
function useReviews() {
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' vagy 'error'
  const [attempt, setAttempt] = useState(0) // ha nő, újra betöltjük

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
    // Takarítás: ha közben újra betöltünk, vagy a komponens eltűnik, a régi válasz már nem számít.
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
    // Frissítő függvény: a várakozás alatt a lista változhatott, így a legfrissebbhez adjuk hozzá.
    setReviews((current) => [created, ...current])
  }

  return { reviews, status, retry, addReview }
}

export default useReviews
```

- Az effekt függvénye nem lehet `async` (a Reactnek egy takarító függvény kell tőle, nem egy Promise), ezért belül
  írunk egy async `load` függvényt, és rögtön meg is hívjuk, ahogy a 14. leckében.
- Az `ignore` a takarításé. Ha a válasz akkor érkezik, amikor már nincs rá szükség (közben újra kértük, vagy a
  komponens eltűnt), nem írjuk vele felül az állapotot. Ez véd a [[versenyhelyzet]] ellen, amikor két válasz közül a
  régebbi ér be később.
- Az `attempt` egy számláló, ami a [[függőségi tömbben|függőségi tömb]] van: a `retry` megnöveli, és a React emiatt
  újra lefuttatja az effektet, vagyis újra betölt.
- Az `addReview` megvárja a szervert, és csak a sikeres válasz után teszi a listába az új véleményt. A szerver által
  visszaadott példányt (`created`) tesszük el, mert abban már ott az `id` és a `createdAt`. A `setReviews` most egy
  [[frissítő függvényt|frissítő függvény]] kap: az `await` alatt eltelik egy kis idő, és ha közben más is változtatott a
  listán, a `current` már azt tartalmazza.
- Ha a szerver hibát ad, az `api.create` hibát dob, és mivel itt nincs `try/catch`, a hiba továbbjut az `addReview`
  hívójához: az űrlap majd elkapja, és kiírja.

Az `App` a hooktól kapja a véleményeket, és amíg azok töltődnek, vagy ha hiba történt, ezt jelzi. Cseréld le az
`src/App.jsx` tartalmát:

```jsx file=src/App.jsx mark=1,3,16,21,23-38
import { PRODUCTS } from './products.js'
import useHashRoute from './useHashRoute.js'
import useReviews from './useReviews.js'
import { reviewsOf } from './stats.js'
import ProductList from './components/ProductList.jsx'
import ProductPage from './components/ProductPage.jsx'
import './App.css'

// '/product/silk-scarf' → 'silk-scarf'. Minden más útvonal (például a lista: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const { reviews, status, retry, addReview } = useReviews()
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  // Mit mutasson az oldal: betöltés, hiba, a lista, egy termék, vagy azt, hogy nincs ilyen termék.
  let page
  if (status === 'loading') {
    page = (
      <p className="state" role="status">
        Vélemények betöltése…
      </p>
    )
  } else if (status === 'error') {
    page = (
      <div className="state state--error" role="alert">
        <p>Nem sikerült betölteni a véleményeket.</p>
        <button type="button" onClick={retry}>
          Újrapróbálom
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
        <p>Nincs ilyen termék.</p>
        <a className="back" href="#/">
          ← Vissza a termékekhez
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
      </header>

      {page}
    </main>
  )
}

export default App
```

A `const { reviews, status, retry, addReview } = useReviews()` egy [[destrukturálás]]: a hook egy objektumot ad vissza,
és ez a sor kiveszi belőle a négy mezőt, mindegyiket a saját nevén. A `useState` és a `SAMPLE_REVIEWS` importja kikerül,
mert a vélemények mostantól a hookban élnek, a mintavéleményeket pedig a szerver kapja meg.

Az űrlapnak most várnia kell a szerverre. Amíg a vélemény úton van, a gomb le van tiltva, és „Küldés…” áll rajta, így
nem lehet kétszer elküldeni. Ha a szerver hibát ad, a beírt szöveg megmarad, hogy újra lehessen próbálni. Az `id` és a
`createdAt` kikerül, mert mostantól a szerver adja. Cseréld le az `src/components/ReviewForm.jsx` tartalmát:

```jsx file=src/components/ReviewForm.jsx mark=10,12,28,30-41,66-67
import { useState } from 'react'
import StarPicker from './StarPicker.jsx'

function ReviewForm({ productId, onAdd }) {
  const [rating, setRating] = useState(0) // 0: még nincs értékelve
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false) // az előbb küldtünk el egyet?
  const [sending, setSending] = useState(false) // úton van a vélemény a szerver felé?

  async function handleSubmit(event) {
    event.preventDefault()
    setSent(false)
    if (rating === 0) {
      setError('Válaszd ki, hány csillagot adsz.')
      return
    }
    if (author.trim() === '') {
      setError('Írd be a neved.')
      return
    }
    if (text.trim().length < 10) {
      setError('Írj legalább 10 karaktert a termékről.')
      return
    }

    setSending(true)
    setError('')
    try {
      // Az id-t és a dátumot mostantól a szerver adja.
      await onAdd({ productId, author: author.trim(), rating, text: text.trim() })
      // Kész: az űrlap kiürül a következő véleményhez.
      setRating(0)
      setAuthor('')
      setText('')
      setSent(true)
    } catch {
      setError('A szerver most nem válaszol. A véleményed itt maradt: próbáld újra!')
    }
    setSending(false)
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Írd meg a véleményed</h3>
      <StarPicker value={rating} onChange={setRating} />
      <label className="field">
        <span>Neved</span>
        <input value={author} onChange={(event) => setAuthor(event.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        <span>Véleményed</span>
        <textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="form-thanks" role="status">
          Köszönjük! A véleményed megjelent.
        </p>
      )}
      <button type="submit" className="button--primary" disabled={sending}>
        {sending ? 'Küldés…' : 'Vélemény küldése'}
      </button>
    </form>
  )
}

export default ReviewForm
```

A `handleSubmit` most [[async függvény]], mert az `await onAdd(…)` megvárja, amíg a szerver válaszol. Ha az `onAdd`
hibát dob, a kód a `catch`-ben folytatódik, és a mezők kiürítése elmarad: a szöveged megmarad. A `setSending(false)` a
`try/catch` után áll, így sikernél és hibánál is lefut.

:::check Ellenőrizd
Frissítsd az oldalt: egy pillanatig „Vélemények betöltése…” látszik, aztán a termékek. Írj egy véleményt az esernyőről:
a gombon egy kis ideig „Küldés…” áll, aztán megjelenik a vélemény. Frissíts: megmaradt! Nyisd meg ugyanezt a címet egy második
lapon is: ott is látszik. Néha a betöltés helyén „Nem sikerült betölteni a véleményeket.” áll egy „Újrapróbálom”
gombbal: ez a kitalált szerver szándékos hibája, kattints a gombra. Ha a küldés bukik el, az űrlap kiírja, és a szöveged
a helyén marad.
:::

:::concept Hol van a „szerver”?
A fejlesztői eszközök (++F12++) **Network** fülén a vélemények betöltésekor vagy küldésekor nem jelenik meg új kérés,
mert a kitalált szerver nem küld igazi kéréseket. Az **Application** fülön viszont (Firefoxban: **Storage**) a **Local Storage** alatt megtalálod a `fake-api:peacock-shop`
kulcsot: ez a szerver teljes adatbázisa, JSON-szövegként. Ha elölről akarod kezdeni, töröld ki a kulcsot, és frissítsd
az oldalt: a szerver újra a mintaadatokkal indul.
:::

:::mistake Gyakori hiba
Kimarad az `await` az `onAdd(…)` elől. A kód ilyenkor nem várja meg a szervert: az űrlap azonnal kiürül, és a
„Köszönjük!” akkor is megjelenik, ha a küldés elbukott. A hibát a `catch` sosem látja, a szöveged pedig elveszett.
:::

:::try Próbáld ki
Az `src/api.js`-ben állítsd a `failRate`-et `1`-re: minden kérés elbukik, és láthatod a hibaüzenetet meg az
„Újrapróbálom” gombot. Aztán a `latency` legyen `[3000, 4000]`: így lassú egy rossz mobilnet. Végül állítsd vissza
mindkettőt.
:::

### Bejelentkezés

Eddig bárki bármilyen nevet beírhatott, és egy termékről akárhány véleményt írhatott. Egy igazi véleményoldalon
[[bejelentkezés]] kell: a vélemény egy fiókhoz tartozik, és egy fiók egy termékről csak egyszer mondhat véleményt.
Ebben a lépésben a bejelentkezés készül el, a következőben a „termékenként egy vélemény” szabály.

A mi bejelentkezésünk kitalált, mint a szerverünk: név alapján megkeresi a fiókot a szerver `users` gyűjteményében, és
ha nincs ilyen, újat nyit. Jelszó nincs, a szerver egyszerűen elhiszi a nevet. (Igazi, jelszavas bejelentkezést a 45.
leckében építesz.) Írd ezt a függvényt az `src/api.js` végére; itt a teljes fájl:

```js file=src/api.js mark=15-21
import { createMockApi } from './fakeApi.js'
import { SAMPLE_REVIEWS } from './products.js'

// A bolt kitalált szervere. Az adatbázisa a mintavéleményekkel és egyetlen fiókkal, a moderátoréval indul.
// A fiókokra (users) a következő lépésektől lesz szükség.
export const api = createMockApi('peacock-shop', {
  seed: {
    reviews: SAMPLE_REVIEWS,
    users: [{ id: 'moderator', name: 'Moderátor', role: 'moderator' }],
  },
  latency: [400, 900], // minden kérés 0,4–0,9 másodpercig tart
  failRate: 0.1, // és nagyjából minden tizedik elbukik
})

// Kitalált bejelentkezés: megkeresi az ilyen nevű fiókot, vagy ha nincs, újat nyit. Jelszó nincs.
export async function logIn(name) {
  // A kis- és nagybetű nem számít: az „anna” ugyanaz a fiók, mint az „Anna”.
  const found = await api.list('users', (user) => user.name.toLowerCase() === name.toLowerCase())
  if (found.length > 0) return found[0]
  return api.create('users', { name, role: 'customer' })
}
```

Az `api.list` második paramétere egy függvény: csak azokat a fiókokat adja vissza, amelyekre ez igazat mond. A
`toLowerCase()` csupa kisbetűssé alakítja a szöveget, így a két név kis- és nagybetűtől függetlenül egyezik. Az új fiók
szerepe (`role`) `'customer'`, vagyis vásárló; a moderátor fiókja már ott van a kezdőadatokban.

A bejelentkezés a fejlécbe kerül. Amíg senki sincs bejelentkezve, egy kis űrlapot mutat, utána a nevet és egy
„Kilépés” gombot. Hozd létre az `src/components/LoginBar.jsx` fájlt:

```jsx file=src/components/LoginBar.jsx
import { useState } from 'react'
import { logIn } from '../api.js'

function LoginBar({ user, onLogin, onLogout }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false) // úton van a bejelentkezés?
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '') {
      setError('Írd be a neved.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const account = await logIn(name.trim())
      onLogin(account)
      setName('')
    } catch {
      setError('A szerver most nem válaszol. Próbáld újra!')
    }
    setBusy(false)
  }

  if (user !== null) {
    return (
      <div className="login-bar">
        <span>
          Belépve: <strong>{user.name}</strong>
        </span>
        <button type="button" onClick={onLogout}>
          Kilépés
        </button>
      </div>
    )
  }

  return (
    <form className="login-bar" onSubmit={handleSubmit}>
      <label className="login-bar__field">
        <span>Lépj be a neveddel</span>
        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" />
      </label>
      <button type="submit" className="button--primary" disabled={busy}>
        {busy ? 'Belépés…' : 'Belépés'}
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

A `useState`-hívások a komponens elején állnak, az `if (user !== null) return …` előtt. Ez a [[hookok szabálya|hookok
szabálya]]: a hookokat minden rajzoláskor ugyanabban a sorrendben kell meghívni, ezért nem kerülhetnek egy korai
`return` mögé.

Végül az `App` tárolja, ki van bejelentkezve: a fiókot, vagy `null`-t. A `LoginBar` a fejlécbe kerül, és a termék
oldala is megkapja a fiókot a `user` propban; azt a következő lépésben használja. Cseréld le az `src/App.jsx`
tartalmát:

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

// '/product/silk-scarf' → 'silk-scarf'. Minden más útvonal (például a lista: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const { reviews, status, retry, addReview } = useReviews()
  const [user, setUser] = useState(null) // a bejelentkezett fiók, vagy null
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  // Mit mutasson az oldal: betöltés, hiba, a lista, egy termék, vagy azt, hogy nincs ilyen termék.
  let page
  if (status === 'loading') {
    page = (
      <p className="state" role="status">
        Vélemények betöltése…
      </p>
    )
  } else if (status === 'error') {
    page = (
      <div className="state state--error" role="alert">
        <p>Nem sikerült betölteni a véleményeket.</p>
        <button type="button" onClick={retry}>
          Újrapróbálom
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
        <p>Nincs ilyen termék.</p>
        <a className="back" href="#/">
          ← Vissza a termékekhez
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
        <LoginBar user={user} onLogin={setUser} onLogout={() => setUser(null)} />
      </header>

      {page}
    </main>
  )
}

export default App
```

:::check Ellenőrizd
A fejlécben egy „Lépj be a neveddel” mező áll „Belépés” gombbal. Lépj be „Anna” néven: egy pillanatig „Belépés…”, aztán
„Belépve: Anna” és egy „Kilépés” gomb. Lépj ki, és lépj be „anna” néven: megint „Belépve: Anna” áll ott, mert ez
ugyanaz a fiók. Ha a szerver épp elbukik, a mező alatt pirossal ez jelenik meg: „A szerver most nem válaszol. Próbáld
újra!”
:::

:::mistake Gyakori hiba
Csak a `name` állapota áll a `LoginBar` elején, a `busy` és az `error` `useState`-hívása az
`if (user !== null) return …` **után** kerül. Belépés után a komponens kevesebb hookot hív meg, mint előtte (egyet
három helyett), az oldal elfehéredik, a konzolban pedig ez áll: „Rendered fewer hooks than expected.” A hookok mindig a
komponens elejére kerülnek, minden feltétel elé.
:::

:::try Feladat
Most egy frissítés kiléptet. Tartsd meg a bejelentkezést a localStorage-ben: másold át a 9. leckéből a
`useLocalStorage` hookot (`src/useLocalStorage.js`), és az `App`-ban cseréld le a
`const [user, setUser] = useState(null)` sort erre: `const [user, setUser] = useLocalStorage('peacock-shop:user', null)`.
Ne felejtsd el beimportálni, a `useState` importja pedig kikerülhet.
:::

### Termékenként egy vélemény

Most jön a második szabály: egy fiók egy termékről csak egyszer mondhat véleményt. Ehhez kell a `user`, amit az `App`
az előző lépés óta átad a termék oldalának.

A termék oldala dönti el, mi álljon az űrlap helyén. Ha nincs bejelentkezve senki, egy kérés, hogy lépj be. Ha a
bejelentkezett fióknak már van véleménye erről a termékről, egy üzenet. Az űrlap csak akkor jelenik meg, ha egyik sem
igaz. Ezért nem kell az űrlapnak kiürülnie: egy sikeres küldés után már van véleményed, és az űrlap helyére magától az
üzenet kerül. Cseréld le az `src/components/ProductPage.jsx` tartalmát:

```jsx file=src/components/ProductPage.jsx mark=14,22-23,25-37,78
import { useEffect, useState } from 'react'
import { summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Legújabb elöl', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Legjobb értékelés elöl', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Leggyengébb értékelés elöl', compare: (a, b) => a.rating - b.rating },
}

function ProductPage({ product, reviews, user, onAddReview }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0: minden vélemény, 1–5: csak az ennyi csillagosak
  const stats = summarize(reviews)
  // Előbb szűrünk, aztán rendezünk. A filter új tömböt ad, így a sort már nem a propot rendezi.
  const visible = reviews
    .filter((review) => filter === 0 || review.rating === filter)
    .sort(REVIEW_SORTS[sort].compare)
  // Termékenként egy vélemény: írt már a bejelentkezett fiók erről a termékről?
  const myReview = user === null ? undefined : reviews.find((review) => review.userId === user.id)

  // Mi álljon az űrlap helyén.
  let formArea
  if (user === null) {
    formArea = <p className="form-note">Lépj be fent a neveddel, és írd meg te is a véleményed!</p>
  } else if (myReview) {
    formArea = (
      <p className="form-note">
        Ezt a terméket már értékelted ({myReview.rating} ★). Termékenként egy véleményt írhatsz.
      </p>
    )
  } else {
    formArea = <ReviewForm productId={product.id} user={user} onAdd={onAddReview} />
  }

  // Egy termék oldala mindig felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Vissza a termékekhez
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        {stats.count > 0 && <RatingSummary stats={stats} filter={filter} onFilter={setFilter} />}
        {stats.count > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
            {filter > 0 && (
              <p className="filter-note">
                Csak {filter} csillagos vélemények: {visible.length} / {reviews.length}
                <button type="button" className="link-button" onClick={() => setFilter(0)}>
                  Összes mutatása
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

A `myReview` a ternáris operátorral készül: ha nincs bejelentkezve senki, `undefined` (nincs saját véleményed), ha
van, a `find` megkeresi a fiók véleményét ennél a terméknél. A mintavéleményeknek nincs `userId`-ja, így azok senkiéi.

Az űrlapnak már nem kell névmező: a nevet és az azonosítót a bejelentkezett fiók adja, és a vélemény egy `userId`
mezőben megjegyzi, kié. A sikeres küldés utáni kiürítés és a „Köszönjük!” is kikerül: ahogy a termék oldalánál láttad,
egy sikeres küldés után az űrlap helyére az üzenet kerül. Cseréld le az `src/components/ReviewForm.jsx` tartalmát:

```jsx file=src/components/ReviewForm.jsx mark=4,24-25
import { useState } from 'react'
import StarPicker from './StarPicker.jsx'

function ReviewForm({ productId, user, onAdd }) {
  const [rating, setRating] = useState(0) // 0: még nincs értékelve
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false) // úton van a vélemény a szerver felé?

  async function handleSubmit(event) {
    event.preventDefault()
    if (rating === 0) {
      setError('Válaszd ki, hány csillagot adsz.')
      return
    }
    if (text.trim().length < 10) {
      setError('Írj legalább 10 karaktert a termékről.')
      return
    }

    setSending(true)
    setError('')
    try {
      // A nevet és az azonosítót a bejelentkezett fiók adja.
      await onAdd({ productId, userId: user.id, author: user.name, rating, text: text.trim() })
    } catch {
      setError('A szerver most nem válaszol. A véleményed itt maradt: próbáld újra!')
    }
    setSending(false)
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Írd meg a véleményed</h3>
      <StarPicker value={rating} onChange={setRating} />
      <label className="field">
        <span>Véleményed</span>
        <textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button--primary" disabled={sending}>
        {sending ? 'Küldés…' : 'Vélemény küldése'}
      </button>
    </form>
  )
}

export default ReviewForm
```

:::check Ellenőrizd
Kijelentkezve egy termék oldalán az űrlap helyén ez áll: „Lépj be fent a neveddel, és írd meg te is a véleményed!” Lépj
be „Anna” néven: most már ott az űrlap, névmező nélkül. Írj egy ötcsillagos véleményt a füzetről: megjelenik „Anna”
néven, és az űrlap helyén ez áll: „Ezt a terméket már értékelted (5 ★). Termékenként egy véleményt írhatsz.” Lépj ki,
és lépj be „anna” néven: ugyanaz a fiók, a füzetnél ugyanez az üzenet.
:::

:::concept Mit tud egy igazi szerver?
A mi ellenőrzésünk csak a felületen dönt: ha valaki megkerüli az űrlapot, és egyenesen a szervernek küld egy kérést,
akárhány véleményt írhat. Ezért egy igazi szerver maga is ellenőriz: elutasítja a második véleményt ugyanattól a
fióktól, és csak olyan kérést fogad el, amelyik igazolja, ki küldte (egy [[tokennel|hozzáférési token]], ahogy a 21.
leckében). A felületen azért kell az ellenőrzés, hogy a felhasználó ne is próbálkozzon hiába; a szerveren azért, hogy
senki se csalhasson.
:::

:::mistake Gyakori hiba
`const myReview = reviews.find((review) => review.userId === user.id)`, a `user === null` vizsgálata nélkül.
Kijelentkezve a `user` `null`, a `null`-nak pedig nincs `id`-je: egy termék megnyitásakor az oldal elfehéredik, a
konzolban pedig ez áll: „Cannot read properties of null (reading 'id')”.
:::

:::try Próbáld ki
Szólítsd meg a fiókot a nevén az üzenetben: „Anna, ezt a terméket már értékelted (5 ★)…”. A név a `user.name`-ben
van, a JSX-ben a `{user.name}` írja ki.
:::

### „Hasznos volt” szavazás

A hosszú véleménylistákban a legjobb vélemények azok, amelyekről mások azt mondták: „ez hasznos volt”. Minden vélemény
kap egy 👍 gombot a szavazatok számával. Egy fiók egy véleményre egyszer szavazhat (egy második kattintás visszavonja), a
sajátjára pedig egyáltalán nem.

Hogy kik szavaztak, azt a vélemény `helpfulBy` mezője tárolja: a fiókok azonosítóinak tömbje. A szavazatok száma
egyszerűen a tömb hossza, és mivel a tömbben mindenki csak egyszer szerepelhet, egy fiók sem szavazhat kétszer. A
mintavéleményeknek van `helpfulBy` mezőjük, de az előző lépésekben írt véleményeknek nincs: akkor még nem létezett
ilyen. Ez a szervereken mindennapos helyzet: a régi adatokból hiányzik egy mező, amit csak később találtak ki. Ezért
egy kis segédfüggvény olvassa ki, és ha hiányzik, üres tömböt ad. Írd ezt az `src/stats.js` végére; itt a teljes fájl:

```js file=src/stats.js mark=33-36
// Számolt adatok: egyik sincs állapotban, mindig a vélemények listájából számoljuk őket.

// Egy termék véleményei az összes közül.
export function reviewsOf(reviews, productId) {
  return reviews.filter((review) => review.productId === productId)
}

// Hány vélemény van, mennyi az átlaguk, és hány jut az egyes csillagszámokra.
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

// 4.666… → '4,7': egy tizedesjegy, tizedesvesszővel.
export function formatRating(value) {
  return value.toLocaleString('hu-HU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// 3 → '3 vélemény'
export function reviewCount(count) {
  return `${count} vélemény`
}

// Kik találták hasznosnak a véleményt. A régebben írt véleményeknek még nincs ilyen mezőjük.
export function helpfulVotes(review) {
  return review.helpfulBy ?? []
}
```

A `??` a [[nullish coalescing]] operátor: a bal oldalát adja, kivéve, ha az `undefined` vagy `null`, mert akkor a jobb
oldalát.

Egy szavazat a vélemény módosítása a szerveren: az `api.update` megkapja a vélemény azonosítóját és a megváltozott
mezőket. De ha a gomb a szerver válaszáig (fél másodpercig) semmit sem csinálna, a kattintás lomhának érződne. Ezért
[[optimista frissítést|optimista frissítés]] alkalmazunk: a változást azonnal megmutatjuk, mintha már sikerült volna,
és csak akkor vonjuk vissza, ha a szerver hibát jelez. A hook egy általános `changeReview` függvényt kap, ami bármilyen
módosításra jó; a következő lépésben a moderálás is ezt használja. Cseréld le az `src/useReviews.js` tartalmát:

```js file=src/useReviews.js mark=4,40-43,45-54,56
import { useEffect, useState } from 'react'
import { api } from './api.js'

// Minden, ami a szerveren lévő véleményekkel kapcsolatos: betöltés, állapot, új vélemény, módosítás.
function useReviews() {
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' vagy 'error'
  const [attempt, setAttempt] = useState(0) // ha nő, újra betöltjük

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
    // Takarítás: ha közben újra betöltünk, vagy a komponens eltűnik, a régi válasz már nem számít.
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
    // Frissítő függvény: a várakozás alatt a lista változhatott, így a legfrissebbhez adjuk hozzá.
    setReviews((current) => [created, ...current])
  }

  // Egy vélemény cseréje a listában az új változatára.
  function replaceReview(changed) {
    setReviews((current) => current.map((review) => (review.id === changed.id ? changed : review)))
  }

  // Optimista frissítés: a változás azonnal látszik, és ha a szerver hibát jelez, visszavonjuk.
  async function changeReview(review, changes) {
    replaceReview({ ...review, ...changes })
    try {
      await api.update('reviews', review.id, changes)
    } catch (error) {
      replaceReview(review)
      throw error // így a hívó is megtudja, hogy nem sikerült
    }
  }

  return { reviews, status, retry, addReview, changeReview }
}

export default useReviews
```

- A `replaceReview` a `map`-pel új tömböt készít, amiben a megváltozott vélemény a régi helyére kerül, a többi marad.
- A `{ ...review, ...changes }` két objektumot fésül össze: a vélemény minden mezője, és amit a `changes` megad, az
  felülírja a régit. Egy szavazásnál a `changes` például `{ helpfulBy: ['a1', 'f3c9…'] }`.
- A `catch` megkapja a hibát (`error`), visszateszi a régi változatot, aztán a `throw error` továbbdobja ugyanazt a
  hibát. Így a gomb, amelyik a `changeReview`-t hívta, maga is értesül, és kiírhatja, hogy nem sikerült.

Az `App`-ban csak két sor változik: a hooktól a `changeReview`-t is elkérjük, és továbbadjuk a termék oldalának.
(Ha a bejelentkezés lépésének feladatában a `useLocalStorage`-re cserélted a `user` sorát, hagyd úgy.) Itt a teljes
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

// '/product/silk-scarf' → 'silk-scarf'. Minden más útvonal (például a lista: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const { reviews, status, retry, addReview, changeReview } = useReviews()
  const [user, setUser] = useState(null) // a bejelentkezett fiók, vagy null
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  // Mit mutasson az oldal: betöltés, hiba, a lista, egy termék, vagy azt, hogy nincs ilyen termék.
  let page
  if (status === 'loading') {
    page = (
      <p className="state" role="status">
        Vélemények betöltése…
      </p>
    )
  } else if (status === 'error') {
    page = (
      <div className="state state--error" role="alert">
        <p>Nem sikerült betölteni a véleményeket.</p>
        <button type="button" onClick={retry}>
          Újrapróbálom
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
        <p>Nincs ilyen termék.</p>
        <a className="back" href="#/">
          ← Vissza a termékekhez
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
        <LoginBar user={user} onLogin={setUser} onLogout={() => setUser(null)} />
      </header>

      {page}
    </main>
  )
}

export default App
```

A termék oldalán két dolog változik: egy új rendezés kerül bele („Leghasznosabb elöl”), és továbbadja a `user`-t meg
az `onChangeReview`-t a listának. (A lista egyelőre nem kezd velük semmit: a következő két fájl után már igen.)
Cseréld le az `src/components/ProductPage.jsx` tartalmát:

```jsx file=src/components/ProductPage.jsx mark=2,12-15,18,79
import { useEffect, useState } from 'react'
import { helpfulVotes, summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Legújabb elöl', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Legjobb értékelés elöl', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Leggyengébb értékelés elöl', compare: (a, b) => a.rating - b.rating },
  helpful: {
    label: 'Leghasznosabb elöl',
    compare: (a, b) => helpfulVotes(b).length - helpfulVotes(a).length,
  },
}

function ProductPage({ product, reviews, user, onAddReview, onChangeReview }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0: minden vélemény, 1–5: csak az ennyi csillagosak
  const stats = summarize(reviews)
  // Előbb szűrünk, aztán rendezünk. A filter új tömböt ad, így a sort már nem a propot rendezi.
  const visible = reviews
    .filter((review) => filter === 0 || review.rating === filter)
    .sort(REVIEW_SORTS[sort].compare)
  // Termékenként egy vélemény: írt már a bejelentkezett fiók erről a termékről?
  const myReview = user === null ? undefined : reviews.find((review) => review.userId === user.id)

  // Mi álljon az űrlap helyén.
  let formArea
  if (user === null) {
    formArea = <p className="form-note">Lépj be fent a neveddel, és írd meg te is a véleményed!</p>
  } else if (myReview) {
    formArea = (
      <p className="form-note">
        Ezt a terméket már értékelted ({myReview.rating} ★). Termékenként egy véleményt írhatsz.
      </p>
    )
  } else {
    formArea = <ReviewForm productId={product.id} user={user} onAdd={onAddReview} />
  }

  // Egy termék oldala mindig felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Vissza a termékekhez
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        {stats.count > 0 && <RatingSummary stats={stats} filter={filter} onFilter={setFilter} />}
        {stats.count > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
            {filter > 0 && (
              <p className="filter-note">
                Csak {filter} csillagos vélemények: {visible.length} / {reviews.length}
                <button type="button" className="link-button" onClick={() => setFilter(0)}>
                  Összes mutatása
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

A vélemény most elég sokat tud ahhoz, hogy saját komponenst kapjon: a `ReviewList`-ből kiköltözik a `<li>`, a
`formatDate`-tel együtt, és kiegészül a gombbal. Hozd létre az `src/components/ReviewItem.jsx` fájlt:

```jsx file=src/components/ReviewItem.jsx
import { useState } from 'react'
import Stars from './Stars.jsx'
import { helpfulVotes } from '../stats.js'

// ISO-dátumból magyar dátum: '2026-10-02T10:00:00.000Z' → '2026. október 2.'
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ReviewItem({ review, user, onChange }) {
  const [failed, setFailed] = useState(false) // nem sikerült elmenteni az utolsó változtatást?
  const votes = helpfulVotes(review)
  const voted = user !== null && votes.includes(user.id)
  // Szavazni csak bejelentkezve lehet, és a saját véleményedre nem.
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
    // Ha már szavaztál, a második kattintás visszavonja.
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
          👍 Hasznos · {votes.length}
        </button>
        {failed && (
          <span className="review__error" role="alert">
            Nem sikerült menteni. Próbáld újra!
          </span>
        )}
      </div>
    </li>
  )
}

export default ReviewItem
```

- Az [[includes]] megmondja, benne van-e egy érték a tömbben: ha a te azonosítód benne van, már szavaztál, és a gomb
  bekapcsolt állapotú (`aria-pressed`).
- A `change` egy kis segéd, ami meghívja az `onChange`-et, és ha az hibát dob, bekapcsolja a hibaüzenetet. A
  következő lépésben a moderálás gombja is ezt használja.
- Az új szavazatlistát ugyanazzal a két mozdulattal készítjük, mint bármelyik tömbnél: a `filter` kiveszi az
  azonosítódat, a spread hozzáteszi. A régi tömbhöz egyik sem nyúl.

A `ReviewList` mostantól csak kirakja a `ReviewItem`-eket, és továbbadja nekik a fiókot meg a módosító függvényt.
Cseréld le az `src/components/ReviewList.jsx` tartalmát:

```jsx file=src/components/ReviewList.jsx mark=1,3,11
import ReviewItem from './ReviewItem.jsx'

function ReviewList({ reviews, user, onChange }) {
  if (reviews.length === 0) {
    return <p className="empty">Még nincs vélemény. Írd meg te az elsőt!</p>
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

A `user` és a `changeReview` most az `App`-tól a `ProductPage`-en és a `ReviewList`-en át jut el a `ReviewItem`-ig. A
`ReviewList` egyiket sem használja, csak továbbadja őket, és a `changeReview`-ra a `ProductPage`-nek sincs szüksége.
Ezt hívják [[prop drillingnek|prop drilling]]. Három szint még bőven belefér; ha sokkal mélyebbre kellene, a 2.
leckéből ismert [[Context]] segítene.

:::check Ellenőrizd
Kijelentkezve minden vélemény alatt egy szürke, letiltott „👍 Hasznos · 4” (vagy más szám) gomb áll. Lépj be „Anna”
néven, nyisd meg a selyemsálat, és kattints Márton B. véleményén a „👍 Hasznos · 1” gombra: azonnal „Hasznos · 2” lesz,
és zöldre vált. Kattints rá újra: visszavonod, újra 1. Válaszd a „Leghasznosabb elöl” rendezést: Anna K. (4) marad
elöl, Sofia R. (2) viszont Márton B. elé kerül. Szavazz újra Márton B. véleményére, aztán frissíts, és lépj be újra: a
gombja zöld, „Hasznos · 2”, a szavazatod megmaradt. A füzetnél a saját véleményed gombja le van tiltva: a sajátodra nem
szavazhatsz. Ha a szerver épp elbukik, a szám visszaugrik, és megjelenik a „Nem sikerült menteni.” felirat.
:::

:::concept Optimista vagy óvatos?
Az optimista frissítés gyorsnak érződik, de csak ott jó, ahol a kérés szinte mindig sikerül, és egy kudarc nem nagy
baj: egy kedvelés, egy szavazat, egy csillag. Ahol a hibának súlya van (egy fizetés, egy elküldött vélemény), ott az
óvatos utat választjuk, ahogy az űrlapnál: „Küldés…”, és csak a szerver igenje után jelenik meg az eredmény.
:::

:::mistake Gyakori hiba
`votes.push(user.id)`, aztán `change({ helpfulBy: votes })`. A `push` magát a vélemény tömbjét módosítja, ami még a
React állapotában van. Az optimista frissítés ugyan megjelenik, de hiba esetén a „régi” vélemény, amit a
`changeReview` visszatesz, már a te szavazatodat is tartalmazza: a visszavonás semmit sem von vissza.
:::

### Moderálás

Egy nyilvános véleményoldalon előbb-utóbb megjelenik a reklám, a sértegetés és a teljesen más termékről szóló vélemény.
Ezért kell [[moderálás]]: egy moderátor elrejtheti a nem odavaló véleményeket. Az elrejtett vélemény nem törlődik (a
moderátor meggondolhatja magát), de más nem látja, és nem számít bele az átlagba sem.

Az elrejtést a vélemény egy új mezője jelzi: `hidden: true`. A régi véleményeknek ilyen mezőjük nincs, de ez most nem
baj: a hiányzó mező `undefined`, ami egy feltételben ugyanúgy hamisnak számít, mint a `false`. A moderátor fiókja a szerver kezdőadataiban van,
`role: 'moderator'` szereppel: egy fiók szerepe dönti el, mit szabad vele csinálni.

A vélemény egy „Elrejtés” gombot kap, de csak a moderátornál. Az elrejtett véleményt a moderátor továbbra is látja,
halványítva, egy „Elrejtve” címkével és egy „Megjelenítés” gombbal. Mindkét gomb ugyanazt a `change` segédet hívja,
mint a szavazás. Cseréld le az `src/components/ReviewItem.jsx` tartalmát:

```jsx file=src/components/ReviewItem.jsx mark=16-17,35-36,48-52
import { useState } from 'react'
import Stars from './Stars.jsx'
import { helpfulVotes } from '../stats.js'

// ISO-dátumból magyar dátum: '2026-10-02T10:00:00.000Z' → '2026. október 2.'
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ReviewItem({ review, user, onChange }) {
  const [failed, setFailed] = useState(false) // nem sikerült elmenteni az utolsó változtatást?
  const votes = helpfulVotes(review)
  const voted = user !== null && votes.includes(user.id)
  // Szavazni csak bejelentkezve lehet, és a saját véleményedre nem.
  const canVote = user !== null && review.userId !== user.id
  // Moderálni csak a moderátor szerepű fiók tud.
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
    // Ha már szavaztál, a második kattintás visszavonja.
    const newVotes = voted ? votes.filter((id) => id !== user.id) : [...votes, user.id]
    change({ helpfulBy: newVotes })
  }

  return (
    <li className={review.hidden ? 'review is-hidden' : 'review'}>
      {review.hidden && <p className="review__badge">Elrejtve: csak a moderátor látja</p>}
      <div className="review__head">
        <Stars value={review.rating} />
        <p className="review__meta">
          <strong>{review.author}</strong> · {formatDate(review.createdAt)}
        </p>
      </div>
      <p className="review__text">{review.text}</p>
      <div className="review__actions">
        <button type="button" className="chip" aria-pressed={voted} disabled={!canVote} onClick={toggleHelpful}>
          👍 Hasznos · {votes.length}
        </button>
        {isModerator && (
          <button type="button" className="chip" onClick={() => change({ hidden: !review.hidden })}>
            {review.hidden ? 'Megjelenítés' : 'Elrejtés'}
          </button>
        )}
        {failed && (
          <span className="review__error" role="alert">
            Nem sikerült menteni. Próbáld újra!
          </span>
        )}
      </div>
    </li>
  )
}

export default ReviewItem
```

A `!review.hidden` az ellentéte: egy látható véleményt elrejt, egy elrejtettet megjelenít. Az `undefined`-ból is `true`
lesz, így a régi vélemények is elrejthetők.

A termék oldalán kétféle véleménylista kell. A **nyilvános** vélemények (az elrejtettek nélkül) adják az összesítőt, a
csillagsávokat és az átlagot, mindenkinek. A **mutatott** vélemények a moderátornál az összes, mindenki másnál a
nyilvánosak. A „termékenként egy vélemény” viszont az összesben keres: akinek a véleményét elrejtették, az se írhasson
helyette újat. A rendezés és a „Csak …” sor a mutatott vélemények számával dolgozik, így a moderátor akkor is rendezhet,
ha egy termék minden véleményét elrejtette. Cseréld le az `src/components/ProductPage.jsx` tartalmát:

```jsx file=src/components/ProductPage.jsx mark=21-25,27,30,70,75
import { useEffect, useState } from 'react'
import { helpfulVotes, summarize } from '../stats.js'
import RatingSummary from './RatingSummary.jsx'
import SortSelect from './SortSelect.jsx'
import ReviewList from './ReviewList.jsx'
import ReviewForm from './ReviewForm.jsx'

const REVIEW_SORTS = {
  newest: { label: 'Legújabb elöl', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  highest: { label: 'Legjobb értékelés elöl', compare: (a, b) => b.rating - a.rating },
  lowest: { label: 'Leggyengébb értékelés elöl', compare: (a, b) => a.rating - b.rating },
  helpful: {
    label: 'Leghasznosabb elöl',
    compare: (a, b) => helpfulVotes(b).length - helpfulVotes(a).length,
  },
}

function ProductPage({ product, reviews, user, onAddReview, onChangeReview }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0: minden vélemény, 1–5: csak az ennyi csillagosak
  const isModerator = user !== null && user.role === 'moderator'
  // Az elrejtett vélemények nem számítanak bele az összesítőbe, és csak a moderátor látja őket.
  const publicReviews = reviews.filter((review) => !review.hidden)
  const shown = isModerator ? reviews : publicReviews
  const stats = summarize(publicReviews)
  // Előbb szűrünk, aztán rendezünk. A filter új tömböt ad, így a sort már nem a propot rendezi.
  const visible = shown
    .filter((review) => filter === 0 || review.rating === filter)
    .sort(REVIEW_SORTS[sort].compare)
  // Termékenként egy vélemény: írt már a bejelentkezett fiók erről a termékről? (Az elrejtettek is számítanak.)
  const myReview = user === null ? undefined : reviews.find((review) => review.userId === user.id)

  // Mi álljon az űrlap helyén.
  let formArea
  if (user === null) {
    formArea = <p className="form-note">Lépj be fent a neveddel, és írd meg te is a véleményed!</p>
  } else if (myReview) {
    formArea = (
      <p className="form-note">
        Ezt a terméket már értékelted ({myReview.rating} ★). Termékenként egy véleményt írhatsz.
      </p>
    )
  } else {
    formArea = <ReviewForm productId={product.id} user={user} onAdd={onAddReview} />
  }

  // Egy termék oldala mindig felül kezdődik, akármeddig görgetted le a listát.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="product-page">
      <a className="back" href="#/">
        ← Vissza a termékekhez
      </a>

      <div className="product">
        <img className="product__image" src={product.image} alt="" />
        <div className="product__info">
          <h2>{product.name}</h2>
          <p className="product__price">{product.price} €</p>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="reviews">
        <h3>Vélemények</h3>
        {stats.count > 0 && <RatingSummary stats={stats} filter={filter} onFilter={setFilter} />}
        {shown.length > 0 && (
          <div className="toolbar">
            <SortSelect sorts={REVIEW_SORTS} value={sort} onChange={setSort} />
            {filter > 0 && (
              <p className="filter-note">
                Csak {filter} csillagos vélemények: {visible.length} / {shown.length}
                <button type="button" className="link-button" onClick={() => setFilter(0)}>
                  Összes mutatása
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

Végül a termékek listája: a kártyák átlagába sem számíthatnak bele az elrejtett vélemények. Az `App`-ban csak egy sor
változik (a `useLocalStorage`-es `user` sor, ha van, most is maradhat); itt a teljes `src/App.jsx`:

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

// '/product/silk-scarf' → 'silk-scarf'. Minden más útvonal (például a lista: '/') → null.
function productIdFrom(path) {
  if (!path.startsWith('/product/')) return null
  return path.slice('/product/'.length)
}

function App() {
  const { reviews, status, retry, addReview, changeReview } = useReviews()
  const [user, setUser] = useState(null) // a bejelentkezett fiók, vagy null
  const path = useHashRoute()
  const productId = productIdFrom(path)
  const openProduct = PRODUCTS.find((product) => product.id === productId)

  // Mit mutasson az oldal: betöltés, hiba, a lista, egy termék, vagy azt, hogy nincs ilyen termék.
  let page
  if (status === 'loading') {
    page = (
      <p className="state" role="status">
        Vélemények betöltése…
      </p>
    )
  } else if (status === 'error') {
    page = (
      <div className="state state--error" role="alert">
        <p>Nem sikerült betölteni a véleményeket.</p>
        <button type="button" onClick={retry}>
          Újrapróbálom
        </button>
      </div>
    )
  } else if (productId === null) {
    // A kártyák átlagába csak a nyilvános (el nem rejtett) vélemények számítanak.
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
        <p>Nincs ilyen termék.</p>
        <a className="back" href="#/">
          ← Vissza a termékekhez
        </a>
      </div>
    )
  }

  return (
    <main className="shop">
      <header className="shop__header">
        <h1>Peacock Shop</h1>
        <p>Hétköznapi tárgyak a páva színeiben. Olvasd el a véleményeket, aztán írd meg a sajátodat!</p>
        <LoginBar user={user} onLogin={setUser} onLogout={() => setUser(null)} />
      </header>

      {page}
    </main>
  )
}

export default App
```

:::check Ellenőrizd
Lépj be „Moderátor” néven (ékezettel, ahogy az `src/api.js`-ben áll; a kis- és nagybetű mindegy). Jelszó nélkül itt
bárki megteheti; egy igazi szerveren csak egy adminisztrátor adhatna egy fióknak moderátor szerepet. Minden vélemény
alatt ott az „Elrejtés” gomb. Nyisd meg a táskát, és rejtsd el Dóra P. kétcsillagos véleményét: halvány lesz,
szaggatott kerettel és az „Elrejtve: csak a moderátor látja” címkével, az átlag pedig 3,7-ről 4,5-re ugrik. Lépj vissza
a listára: a táska kártyáján is „4,5 · 2 vélemény” áll. Lépj ki, és nyisd meg újra a táskát: Dóra P. véleménye eltűnt.
Lépj be újra moderátorként, és a „Megjelenítés” gombbal hozd vissza. Gratulálok, kész a véleményoldalad!
:::

:::mistake Gyakori hiba
A `myReview` a `publicReviews`-ban keres, nem az összesben. Ilyenkor, ha a moderátor elrejti valakinek a véleményét, az
illető egyszerűen írhat egy újat, és a moderálás semmit sem ért.
:::

:::try Feladat
Ha a saját véleményedet rejtették el, az „Ezt a terméket már értékelted” üzenet ezt is mondja el: „A moderátor elrejtette, ezért más
nem látja.” A `myReview.hidden`-ből tudod, mikor kell, a `&&`-ből pedig azt, hogyan.
:::
