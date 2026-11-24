# 20 · Movie Search – exercise

The starting point of Rika Mentoring's lesson 20. The guide walks you through it step by step:
https://mazsola739.github.io/rika-mentoring/lessons/20-movie-search/solution/?view=guide

## Start

No repository yet? Clone it with `git clone https://github.com/mazsola739/rika-mentoring.git`, or choose **Code → Download ZIP** on the
[repository page](https://github.com/mazsola739/rika-mentoring). Step 0 of the guide shows it in detail.

First copy this folder out of the repository into your own work folder and name the copy `movie-search`: your work
stays separate, and `git pull` in the repository can still bring new lessons. You need
[Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code. In your copy:

```bash
npm install     # once: downloads React, Vite and MSW
npm run dev     # starts the development server
```

Open the address it prints (usually http://localhost:5173). You should see a dark page with the title
"Movie Search".

## What is in it

- `src/App.jsx` – the page: for now only the title.
- `src/App.css` – the styles of the whole lesson, ready; the guide uses its class names.
- `src/mocks/` – the lesson's TV API, a "pretend server" that runs in your browser with Mock Service Worker (MSW).
  It answers `fetch('/api/tv/…')` like a real server. The series in it are made up.
- `public/mockServiceWorker.js` – MSW's own worker script. Do not edit it.
- `src/main.jsx` – starts the TV API, then draws the page.

## If something breaks

Step 0 of the guide makes your copy a git repository with one commit. After that, `git restore .` takes every file
back to your last commit, and the original is always here, in the repository.

The finished app: https://mazsola739.github.io/rika-mentoring/lessons/20-movie-search/solution/?view=solution

---

# 20 · Movie Search – kiinduló projekt

A Rika Mentoring 20. leckéjének kiindulópontja. Az útmutató lépésről lépésre végigvezet rajta:
https://mazsola739.github.io/rika-mentoring/lessons/20-movie-search/solution/?view=guide

## Indítás

Még nincs meg a repó? Klónozd le a `git clone https://github.com/mazsola739/rika-mentoring.git` paranccsal, vagy a [repó oldalán](https://github.com/mazsola739/rika-mentoring)
válaszd a **Code → Download ZIP** lehetőséget. Az útmutató 0. lépése részletesen megmutatja.

Először másold ki ezt a mappát a repóból a saját munkamappádba, és nevezd el a másolatot így: `movie-search`. Így a
munkád külön marad, és a repóban a `git pull` továbbra is le tudja hozni az új leckéket. Kell hozzá a
[Node.js](https://nodejs.org) (az LTS-verzió) és egy kódszerkesztő, például a VS Code. A másolatodban:

```bash
npm install     # egyszer: letölti a Reactot, a Vite-ot és az MSW-t
npm run dev     # elindítja a fejlesztői szervert
```

Nyisd meg a kiírt címet (általában http://localhost:5173). Egy sötét oldalt kell látnod „Movie Search” címmel.

## Mi van benne?

- `src/App.jsx` – az oldal: egyelőre csak a cím.
- `src/App.css` – a teljes lecke stílusai, készen; az útmutató ezeket az osztályneveket használja.
- `src/mocks/` – a lecke sorozat-API-ja, egy „álszerver”, amely a böngésződben fut a Mock Service Worker (MSW)
  segítségével. Úgy válaszol a `fetch('/api/tv/…')` kérésekre, mint egy igazi szerver. A sorozatok kitaláltak.
- `public/mockServiceWorker.js` – az MSW saját workerszkriptje. Ne írd át.
- `src/main.jsx` – elindítja a sorozat-API-t, aztán kirajzolja az oldalt.

## Ha valami elromlik

Az útmutató 0. lépésében a másolatodból git-repó lesz egy committal. Ezután a `git restore .` minden fájlt
visszaállít az utolsó commitod állapotára, az eredeti pedig mindig itt van, a repóban.

A kész app: https://mazsola739.github.io/rika-mentoring/lessons/20-movie-search/solution/?view=solution
