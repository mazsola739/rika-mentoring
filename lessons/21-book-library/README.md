# 21 · Book Library

Rika Mentoring · lesson 21 of 50 · Beginner+ · [Magyarul](#magyarul)

Book search and reading list

**What you learn:** searching an API, moving items between lists, the `useFetch` hook, transforming API data

| Folder | What is in it |
|---|---|
| [`exercise/`](exercise/) | The starting project. You build the app here, step by step, following the guide. |
| [`solution/`](solution/) | The finished app, as it runs on the website. |

- The guide, step by step: https://mazsola739.github.io/rika-mentoring/lessons/21-book-library/solution/?view=guide
- The finished app: https://mazsola739.github.io/rika-mentoring/lessons/21-book-library/solution/?view=solution

## Start

You need [Node.js](https://nodejs.org) (the LTS version), git and a code editor, for example VS Code.

```bash
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/21-book-library/exercise book-library    # your own copy of the exercise
cd book-library
npm install
npm run dev
```

You work in the copy: the repository stays as it is, and `git pull` in it brings the new lessons. No git? On the
[repository page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**, unpack it and copy the `lessons/21-book-library/exercise`
folder out of it. Step 0 of the guide explains everything.

The solution is a page of the website: it uses the site's shared lesson frame from `shared/`. To run it on your
own machine, run `npm install` and `npm run dev` in the root of the repository, then open
http://localhost:7020/lessons/21-book-library/solution/.

---

## Magyarul

**21 · Book Library** · Rika Mentoring, 21. lecke (50-ből) · Kezdő+

Könyvkereső és olvasólista

**Mit tanulsz:** keresés API-ban, tételek mozgatása listák között, `useFetch` hook, API-adatok átalakítása

| Mappa | Mi van benne? |
|---|---|
| [`exercise/`](exercise/) | A kiinduló projekt: ebben építed fel az appot, lépésről lépésre, az útmutató alapján. |
| [`solution/`](solution/) | A kész app, ahogy a weboldalon fut. |

- Az útmutató, lépésről lépésre: https://mazsola739.github.io/rika-mentoring/lessons/21-book-library/solution/?view=guide
- A kész app: https://mazsola739.github.io/rika-mentoring/lessons/21-book-library/solution/?view=solution

### Indítás

Kell hozzá a [Node.js](https://nodejs.org) (az LTS-verzió), a git és egy kódszerkesztő, például a VS Code.

```bash
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/21-book-library/exercise book-library    # a feladat saját másolata
cd book-library
npm install
npm run dev
```

A másolatban dolgozol: a repó változatlan marad, és benne a `git pull` lehozza az új leckéket. Nincs gited? A
[repó oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, csomagold ki, és másold ki belőle a
`lessons/21-book-library/exercise` mappát. Az útmutató 0. lépése mindent elmagyaráz.

A megoldás a weboldal egyik oldala: az oldal közös leckekeretét használja a `shared/` mappából. Ha a saját gépeden
futtatnád, a repó gyökerében futtasd az `npm install` és az `npm run dev` parancsot, majd nyisd meg a
http://localhost:7020/lessons/21-book-library/solution/ címet.
