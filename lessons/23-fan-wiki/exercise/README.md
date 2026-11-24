# 23 · Fan Wiki – exercise

The starting point of Rika Mentoring's lesson 23. The guide walks you through it step by step:
https://mazsola739.github.io/rika-mentoring/lessons/23-fan-wiki/solution/?view=guide

## Start

First copy this folder out of the repository into your own work folder and name the copy `huebloom-wiki`: your work
stays separate, and `git pull` in the repository can still bring new lessons. You need
[Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code. In your copy:

```bash
npm install     # once: downloads React, Vite and MSW
npm run dev     # starts the development server
```

Open the address it prints (usually http://localhost:5173). You should see a white card with the title "Fan Wiki".

## What is in it

- `src/App.jsx` – the page: for now only the title.
- `src/App.css` – the styles of the whole lesson, ready; the guide uses its class names.
- `src/mocks/` – the wiki's own API, a "pretend server" that runs in your browser with Mock Service Worker (MSW).
  It answers `fetch('/api/…')` like a real server. `handlers.js` lists its addresses, `universe.js` holds the
  characters, places and episodes, `avatars.js` draws the pictures.
- `src/main.jsx` – starts the pretend server, then draws the page.
- `public/mockServiceWorker.js` – the Service Worker script MSW needs. Do not change it.

## If something breaks

Step 0 of the guide makes your copy a git repository with one commit. After that, `git restore .` takes every file
back to your last commit, and the original is always here, in the repository.

The finished app: https://mazsola739.github.io/rika-mentoring/lessons/23-fan-wiki/solution/?view=solution

---

# 23 · Fan Wiki – kiinduló projekt

A Rika Mentoring 23. leckéjének kiindulópontja. Az útmutató lépésről lépésre végigvezet rajta:
https://mazsola739.github.io/rika-mentoring/lessons/23-fan-wiki/solution/?view=guide

## Indítás

Először másold ki ezt a mappát a repóból a saját munkamappádba, és nevezd el a másolatot így: `huebloom-wiki`. Így a
munkád külön marad, és a repóban a `git pull` továbbra is le tudja hozni az új leckéket. Kell hozzá a
[Node.js](https://nodejs.org) (az LTS-verzió) és egy kódszerkesztő, például a VS Code. A másolatodban:

```bash
npm install     # egyszer: letölti a Reactot, a Vite-ot és az MSW-t
npm run dev     # elindítja a fejlesztői szervert
```

Nyisd meg a kiírt címet (általában http://localhost:5173). Egy fehér kártyát kell látnod „Fan Wiki” címmel.

## Mi van benne?

- `src/App.jsx` – az oldal: egyelőre csak a cím.
- `src/App.css` – a teljes lecke stílusai, készen; az útmutató ezeket az osztályneveket használja.
- `src/mocks/` – a wiki saját API-ja, egy „álszerver”, ami a böngésződben fut a Mock Service Worker (MSW)
  segítségével. Úgy válaszol a `fetch('/api/…')` kérésekre, mint egy igazi szerver. A `handlers.js` sorolja fel a
  címeit, a `universe.js`-ben vannak a szereplők, helyszínek és epizódok, az `avatars.js` rajzolja a képeket.
- `src/main.jsx` – elindítja az álszervert, aztán kirajzolja az oldalt.
- `public/mockServiceWorker.js` – az MSW-hez szükséges Service Worker-szkript. Ne írd át.

## Ha valami elromlik

Az útmutató 0. lépésében a másolatodból git-repó lesz egy committal. Ezután a `git restore .` minden fájlt
visszaállít az utolsó commitod állapotára, az eredeti pedig mindig itt van, a repóban.

A kész app: https://mazsola739.github.io/rika-mentoring/lessons/23-fan-wiki/solution/?view=solution
