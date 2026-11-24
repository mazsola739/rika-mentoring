# 15 · Space Explorer – exercise

The starting point of Rika Mentoring's lesson 15. The guide walks you through it step by step:
https://mazsola739.github.io/rika-mentoring/lessons/15-space-explorer/solution/?view=guide

## Start

First copy this folder out of the repository into your own work folder and name the copy `space-explorer`: your work
stays separate, and `git pull` in the repository can still bring new lessons. You need
[Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code. In your copy:

```bash
npm install     # once: downloads React, Vite and Mock Service Worker
npm run dev     # starts the development server
```

Open the address it prints (usually http://localhost:5173). You should see a dark page with the title
"Space Explorer" in gold.

## What is in it

- `src/App.jsx` – the page: for now only the title.
- `src/App.css` – the styles of the whole lesson, ready; the guide uses its class names.
- `src/mocks/` – the pretend space API. It runs in your browser with Mock Service Worker and answers
  `fetch('/api/apod?…')` like a real server. The comment at the top of `handlers.js` describes the API.
  You do not need to change anything in it.
- `public/mockServiceWorker.js` – Mock Service Worker's own file. Do not edit it.
- `src/main.jsx` – starts the pretend API, then draws the app.

## If something breaks

Step 0 of the guide makes your copy a git repository with one commit. After that, `git restore .` takes every file
back to your last commit, and the original is always here, in the repository.

The finished app: https://mazsola739.github.io/rika-mentoring/lessons/15-space-explorer/solution/?view=solution

---

# 15 · Space Explorer – kiinduló projekt

A Rika Mentoring 15. leckéjének kiindulópontja. Az útmutató lépésről lépésre végigvezet rajta:
https://mazsola739.github.io/rika-mentoring/lessons/15-space-explorer/solution/?view=guide

## Indítás

Először másold ki ezt a mappát a repóból a saját munkamappádba, és nevezd el a másolatot így: `space-explorer`. Így a
munkád külön marad, és a repóban a `git pull` továbbra is le tudja hozni az új leckéket. Kell hozzá a
[Node.js](https://nodejs.org) (az LTS-verzió) és egy kódszerkesztő, például a VS Code. A másolatodban:

```bash
npm install     # egyszer: letölti a Reactot, a Vite-ot és a Mock Service Workert
npm run dev     # elindítja a fejlesztői szervert
```

Nyisd meg a kiírt címet (általában http://localhost:5173). Egy sötét oldalt kell látnod, rajta arany betűkkel a
„Space Explorer” címet.

## Mi van benne?

- `src/App.jsx` – az oldal: egyelőre csak a cím.
- `src/App.css` – a teljes lecke stílusai, készen; az útmutató ezeket az osztályneveket használja.
- `src/mocks/` – a kitalált űr-API. A böngésződben fut a Mock Service Workerrel, és úgy válaszol a
  `fetch('/api/apod?…')` kérésekre, mint egy igazi szerver. A `handlers.js` elején álló megjegyzés leírja az API-t.
  Semmit sem kell benne átírnod.
- `public/mockServiceWorker.js` – a Mock Service Worker saját fájlja. Ne írd át.
- `src/main.jsx` – elindítja a kitalált API-t, aztán kirajzolja az appot.

## Ha valami elromlik

Az útmutató 0. lépésében a másolatodból git-repó lesz egy committal. Ezután a `git restore .` minden fájlt
visszaállít az utolsó commitod állapotára, az eredeti pedig mindig itt van, a repóban.

A kész app: https://mazsola739.github.io/rika-mentoring/lessons/15-space-explorer/solution/?view=solution
