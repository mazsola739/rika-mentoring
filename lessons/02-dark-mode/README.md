# 02 · Dark Mode

Rika Mentoring · lesson 2 of 50 · Beginner · [Magyarul](#magyarul)

Light / dark theme switch

**What you learn:** Context API, CSS custom properties, `useEffect` and `matchMedia`, a custom `useDarkMode` hook

| Folder | What is in it |
|---|---|
| [`exercise/`](exercise/) | The starting project. You build the app here, step by step, following the guide. |
| [`solution/`](solution/) | The finished app, as it runs on the website. |

- The guide, step by step: https://mazsola739.github.io/rika-mentoring/lessons/02-dark-mode/solution/?view=guide
- The finished app: https://mazsola739.github.io/rika-mentoring/lessons/02-dark-mode/solution/?view=solution

## Start

You need [Node.js](https://nodejs.org) (the LTS version), git and a code editor, for example VS Code.

```bash
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/02-dark-mode/exercise stargazer    # your own copy of the exercise
cd stargazer
npm install
npm run dev
```

You work in the copy: the repository stays as it is, and `git pull` in it brings the new lessons. No git? On the
[repository page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**, unpack it and copy the `lessons/02-dark-mode/exercise`
folder out of it. Step 0 of the guide explains everything.

The solution is a page of the website: it uses the site's shared lesson frame from `shared/`. To run it on your
own machine, run `npm install` and `npm run dev` in the root of the repository, then open
http://localhost:7020/lessons/02-dark-mode/solution/.

---

## Magyarul

**02 · Dark Mode** · Rika Mentoring, 2. lecke (50-ből) · Kezdő

Sötét / világos mód

**Mit tanulsz:** Context API, CSS-változók, `useEffect` és `matchMedia`, saját `useDarkMode` hook

| Mappa | Mi van benne? |
|---|---|
| [`exercise/`](exercise/) | A kiinduló projekt: ebben építed fel az appot, lépésről lépésre, az útmutató alapján. |
| [`solution/`](solution/) | A kész app, ahogy a weboldalon fut. |

- Az útmutató, lépésről lépésre: https://mazsola739.github.io/rika-mentoring/lessons/02-dark-mode/solution/?view=guide
- A kész app: https://mazsola739.github.io/rika-mentoring/lessons/02-dark-mode/solution/?view=solution

### Indítás

Kell hozzá a [Node.js](https://nodejs.org) (az LTS-verzió), a git és egy kódszerkesztő, például a VS Code.

```bash
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/02-dark-mode/exercise stargazer    # a feladat saját másolata
cd stargazer
npm install
npm run dev
```

A másolatban dolgozol: a repó változatlan marad, és benne a `git pull` lehozza az új leckéket. Nincs gited? A
[repó oldalán](https://github.com/mazsola739/rika-mentoring) válaszd a **Code → Download ZIP** lehetőséget, csomagold ki, és másold ki belőle a
`lessons/02-dark-mode/exercise` mappát. Az útmutató 0. lépése mindent elmagyaráz.

A megoldás a weboldal egyik oldala: az oldal közös leckekeretét használja a `shared/` mappából. Ha a saját gépeden
futtatnád, a repó gyökerében futtasd az `npm install` és az `npm run dev` parancsot, majd nyisd meg a
http://localhost:7020/lessons/02-dark-mode/solution/ címet.
