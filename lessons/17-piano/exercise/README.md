# 17 · Musical Instrument – exercise

The starting point of Rika Mentoring's lesson 17. The guide walks you through it step by step:
https://mazsola739.github.io/rika-mentoring/lessons/17-piano/solution/?view=guide

## Start

First copy this folder out of the repository into your own work folder and name the copy `piano`: your work
stays separate, and `git pull` in the repository can still bring new lessons. You need
[Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code. In your copy:

```bash
npm install     # once: downloads React and Vite
npm run dev     # starts the development server
```

Open the address it prints (usually http://localhost:5173). You should see a white panel with the title
"Musical Instrument". Turn your speakers on: from the first steps on, the page makes sound.

## What is in it

- `src/App.jsx` – the page: for now only the title.
- `src/App.css` – the styles of the whole lesson, ready; the guide uses its class names.
- `src/melodies.js` – three short melodies as MIDI numbers, for the teaching mode of the advanced level.

There are no sound files: every note is made by the browser itself, with the Web Audio API.

## If something breaks

Step 0 of the guide makes your copy a git repository with one commit. After that, `git restore .` takes every file
back to your last commit, and the original is always here, in the repository.

The finished app: https://mazsola739.github.io/rika-mentoring/lessons/17-piano/solution/?view=solution

---

# 17 · Musical Instrument – kiinduló projekt

A Rika Mentoring 17. leckéjének kiindulópontja. Az útmutató lépésről lépésre végigvezet rajta:
https://mazsola739.github.io/rika-mentoring/lessons/17-piano/solution/?view=guide

## Indítás

Először másold ki ezt a mappát a repóból a saját munkamappádba, és nevezd el a másolatot így: `piano`. Így a
munkád külön marad, és a repóban a `git pull` továbbra is le tudja hozni az új leckéket. Kell hozzá a
[Node.js](https://nodejs.org) (az LTS-verzió) és egy kódszerkesztő, például a VS Code. A másolatodban:

```bash
npm install     # egyszer: letölti a Reactot és a Vite-ot
npm run dev     # elindítja a fejlesztői szervert
```

Nyisd meg a kiírt címet (általában http://localhost:5173). Egy fehér panelt kell látnod „Musical Instrument”
címmel. Kapcsold be a hangszórót: már az első lépésektől szól az oldal.

## Mi van benne?

- `src/App.jsx` – az oldal: egyelőre csak a cím.
- `src/App.css` – a teljes lecke stílusai, készen; az útmutató ezeket az osztályneveket használja.
- `src/melodies.js` – három rövid dallam MIDI-számokkal, a haladó szint dallamtanító módjához.

Hangfájlok nincsenek: minden hangot maga a böngésző állít elő, a Web Audio API-val.

## Ha valami elromlik

Az útmutató 0. lépésében a másolatodból git-repó lesz egy committal. Ezután a `git restore .` minden fájlt
visszaállít az utolsó commitod állapotára, az eredeti pedig mindig itt van, a repóban.

A kész app: https://mazsola739.github.io/rika-mentoring/lessons/17-piano/solution/?view=solution
