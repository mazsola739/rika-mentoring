# {{N}} · {{TITLE_EN}} – starter

The starting point of Rika Mentoring's lesson {{N}}. The guide walks you through it step by step:
{{GUIDE_URL}}

## Start

You need [Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code.

```bash
npm install     # once: downloads React and Vite
npm run dev     # starts the development server
```

Open the address it prints (usually http://localhost:5173). You should see a dark calculator body with a screen that
shows 0, and no keys yet.

## What is in it

- `src/App.jsx` – the page: for now only the calculator body and its screen.
- `src/App.css` – the styles of the whole lesson, ready; the guide uses its class names.

## If something breaks

This folder is a git repository with one commit, the starting point.
`git log` shows it, and `git restore .` takes every file back to how it was.

The finished app: {{SOLUTION_URL}}

---

# {{N}} · {{TITLE_HU}} – alap

A Rika Mentoring {{N}}. leckéjének kiindulópontja. Az útmutató lépésről lépésre végigvezet rajta:
{{GUIDE_URL}}

## Indítás

Kell hozzá a [Node.js](https://nodejs.org) (az LTS-verzió) és egy kódszerkesztő, például a VS Code.

```bash
npm install     # egyszer: letölti a Reactot és a Vite-ot
npm run dev     # elindítja a fejlesztői szervert
```

Nyisd meg a kiírt címet (általában http://localhost:5173). Egy sötét számológéptestet kell látnod, a kijelzőjén egy
0-val; gombok még nincsenek.

## Mi van benne?

- `src/App.jsx` – az oldal: egyelőre csak a számológép teste és a kijelzője.
- `src/App.css` – a teljes lecke stílusai, készen; az útmutató ezeket az osztályneveket használja.

## Ha valami elromlik

Ez a mappa egy git-repó egy committal, a kiindulóponttal.
A `git log` megmutatja, a `git restore .` pedig minden fájlt visszaállít az eredeti állapotába.

A kész app: {{SOLUTION_URL}}
