# 25 · Meme Generator – exercise

The starting point of Rika Mentoring's lesson 25. The guide walks you through it step by step:
https://mazsola739.github.io/rika-mentoring/lessons/25-meme-generator/solution/?view=guide

## Start

No repository yet? Clone it with `git clone https://github.com/mazsola739/rika-mentoring.git`, or choose **Code → Download ZIP** on the
[repository page](https://github.com/mazsola739/rika-mentoring). Step 0 of the guide shows it in detail.

First copy this folder out of the repository into your own work folder and name the copy `meme-generator`: your work
stays separate, and `git pull` in the repository can still bring new lessons. You need
[Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code. In your copy:

```bash
npm install     # once: downloads React, Vite and MSW
npm run dev     # starts the development server
```

Open the address it prints (usually http://localhost:5173). You should see a dark page with the turquoise title
"Meme Generator". Everything else is your job.

## What is in it

- `src/App.jsx` – the page: for now only the title.
- `src/App.css` – the styles of the whole lesson, ready; the guide uses its class names.
- `src/main.jsx` – starts the pretend server first, then draws the app.
- `src/mocks/` – the pretend server (Mock Service Worker): it answers `fetch('/api/memes')` and the template
  pictures (`/api/memes/images/<id>.svg`) in the browser, like a real meme API would. `templates.js` draws the 20
  pictures in code, `handlers.js` lists what it can answer, `helpers.js` has three small helpers for the answers, and
  `browser.js` starts it all (`main.jsx` calls its `startPretendServer`); you do not have to change them.
- `public/mockServiceWorker.js` – the worker script MSW needs. Do not edit it. (`msw` is pinned to the same
  version in `package.json`.)

The pretend server only runs on `http://localhost` (or `https://`): open the page there, not on the "Network" address.

## If something breaks

Step 0 of the guide makes your copy a git repository with one commit. After that, `git restore .` takes every file
back to your last commit, and the original is always here, in the repository.

The finished app: https://mazsola739.github.io/rika-mentoring/lessons/25-meme-generator/solution/?view=solution

---

# 25 · Meme Generator – kiinduló projekt

A Rika Mentoring 25. leckéjének kiindulópontja. Az útmutató lépésről lépésre végigvezet rajta:
https://mazsola739.github.io/rika-mentoring/lessons/25-meme-generator/solution/?view=guide

## Indítás

Még nincs meg a repó? Klónozd le a `git clone https://github.com/mazsola739/rika-mentoring.git` paranccsal, vagy a [repó oldalán](https://github.com/mazsola739/rika-mentoring)
válaszd a **Code → Download ZIP** lehetőséget. Az útmutató 0. lépése részletesen megmutatja.

Először másold ki ezt a mappát a repóból a saját munkamappádba, és nevezd el a másolatot így: `meme-generator`. Így a
munkád külön marad, és a repóban a `git pull` továbbra is le tudja hozni az új leckéket. Kell hozzá a
[Node.js](https://nodejs.org) (az LTS-verzió) és egy kódszerkesztő, például a VS Code. A másolatodban:

```bash
npm install     # egyszer: letölti a Reactot, a Vite-ot és az MSW-t
npm run dev     # elindítja a fejlesztői szervert
```

Nyisd meg a kiírt címet (általában http://localhost:5173). Egy sötét oldalt kell látnod, rajta a türkiz „Meme
Generator” címmel. Minden más a te feladatod.

## Mi van benne?

- `src/App.jsx` – az oldal: egyelőre csak a cím.
- `src/App.css` – a teljes lecke stílusai, készen; az útmutató ezeket az osztályneveket használja.
- `src/main.jsx` – előbb elindítja az álszervert, aztán kirajzolja az appot.
- `src/mocks/` – az álszerver (Mock Service Worker): a böngészőben válaszol a `fetch('/api/memes')` kérésre és a
  sablonképekre (`/api/memes/images/<azonosító>.svg`), ahogy egy igazi mém-API tenné. A `templates.js` kóddal
  rajzolja meg a 20 képet, a `handlers.js` sorolja fel, mire tud válaszolni, a `helpers.js`-ben három kis
  segédfüggvény van a válaszokhoz, a `browser.js` pedig elindítja az egészet (a `main.jsx` ennek a
  `startPretendServer` függvényét hívja); ezeken nem kell változtatnod.
- `public/mockServiceWorker.js` – az MSW-hez szükséges worker-szkript. Ne írd át! (A `package.json` ugyanerre a
  verzióra rögzíti az `msw` csomagot.)

Az álszerver csak a `http://localhost` (vagy egy `https://`) címen fut: ott nyisd meg az oldalt, ne a „Network” címen.

## Ha valami elromlik

Az útmutató 0. lépésében a másolatodból git-repó lesz egy committal. Ezután a `git restore .` minden fájlt
visszaállít az utolsó commitod állapotára, az eredeti pedig mindig itt van, a repóban.

A kész app: https://mazsola739.github.io/rika-mentoring/lessons/25-meme-generator/solution/?view=solution
