# 21 · Book Library – exercise

The starting point of Rika Mentoring's lesson 21. The guide walks you through it step by step:
https://mazsola739.github.io/rika-mentoring/lessons/21-book-library/solution/?view=guide

## Start

No repository yet? Clone it with `git clone https://github.com/mazsola739/rika-mentoring.git`, or choose **Code → Download ZIP** on the
[repository page](https://github.com/mazsola739/rika-mentoring). Step 0 of the guide shows it in detail.

First copy this folder out of the repository into your own work folder and name the copy `book-library`: your work
stays separate, and `git pull` in the repository can still bring new lessons. You need
[Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code. In your copy:

```bash
npm install     # once: downloads React, Vite and MSW
npm run dev     # starts the development server
```

Open the address it prints (usually http://localhost:5173). You should see a dark green band with the title
"Book Library". Everything else is your job.

## What is in it

- `src/App.jsx` – the page: for now only the title.
- `src/App.css` – the styles of the whole lesson, ready; the guide uses its class names.
- `src/main.jsx` – starts the pretend server first, then draws the app.
- `src/mocks/` – the pretend server (Mock Service Worker): it answers `fetch('/api/…')` in the browser, like a
  real book API would. `handlers.js` and `accounts.js` list what it can answer; you do not have to change them.
- `public/mockServiceWorker.js` – the worker script MSW needs. Do not edit it. (`msw` is pinned to the same
  version in `package.json`.)

## If something breaks

Step 0 of the guide makes your copy a git repository with one commit. After that, `git restore .` takes every file
back to your last commit, and the original is always here, in the repository.

The finished app: https://mazsola739.github.io/rika-mentoring/lessons/21-book-library/solution/?view=solution

---

# 21 · Book Library – kiinduló projekt

A Rika Mentoring 21. leckéjének kiindulópontja. Az útmutató lépésről lépésre végigvezet rajta:
https://mazsola739.github.io/rika-mentoring/lessons/21-book-library/solution/?view=guide

## Indítás

Még nincs meg a repó? Klónozd le a `git clone https://github.com/mazsola739/rika-mentoring.git` paranccsal, vagy a [repó oldalán](https://github.com/mazsola739/rika-mentoring)
válaszd a **Code → Download ZIP** lehetőséget. Az útmutató 0. lépése részletesen megmutatja.

Először másold ki ezt a mappát a repóból a saját munkamappádba, és nevezd el a másolatot így: `book-library`. Így a
munkád külön marad, és a repóban a `git pull` továbbra is le tudja hozni az új leckéket. Kell hozzá a
[Node.js](https://nodejs.org) (az LTS-verzió) és egy kódszerkesztő, például a VS Code. A másolatodban:

```bash
npm install     # egyszer: letölti a Reactot, a Vite-ot és az MSW-t
npm run dev     # elindítja a fejlesztői szervert
```

Nyisd meg a kiírt címet (általában http://localhost:5173). Egy sötétzöld sávot kell látnod „Book Library”
címmel. Minden más a te feladatod.

## Mi van benne?

- `src/App.jsx` – az oldal: egyelőre csak a cím.
- `src/App.css` – a teljes lecke stílusai, készen; az útmutató ezeket az osztályneveket használja.
- `src/main.jsx` – előbb elindítja a kitalált szervert, aztán kirajzolja az appot.
- `src/mocks/` – a kitalált szerver (Mock Service Worker): a böngészőben válaszol a `fetch('/api/…')` kérésekre, ahogy
  egy igazi könyv-API tenné. A `handlers.js` és az `accounts.js` sorolja fel, mire tud válaszolni; ezeken nem kell
  változtatnod.
- `public/mockServiceWorker.js` – az MSW-hez szükséges worker-szkript. Ne írd át! (A `package.json` ugyanerre a
  verzióra rögzíti az `msw` csomagot.)

## Ha valami elromlik

Az útmutató 0. lépésében a másolatodból git-repó lesz egy committal. Ezután a `git restore .` minden fájlt
visszaállít az utolsó commitod állapotára, az eredeti pedig mindig itt van, a repóban.

A kész app: https://mazsola739.github.io/rika-mentoring/lessons/21-book-library/solution/?view=solution
