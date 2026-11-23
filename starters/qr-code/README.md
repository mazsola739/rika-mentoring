# {{N}} · {{TITLE_EN}} – starter

The starting point of Rika Mentoring's lesson {{N}}. The guide walks you through it step by step:
{{GUIDE_URL}}

## Start

You need [Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code.

```bash
npm install     # once: downloads React, Vite and the qrcode library
npm run dev     # starts the development server
```

Open the address it prints (usually http://localhost:5173). You should see a white card with the title
"QR Code Generator".

## What is in it

- `package.json` – the project's packages. Besides React and Vite, `qrcode` is already listed: the library that
  draws the QR codes.
- `src/App.jsx` – the page: for now only the title.
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
npm install     # egyszer: letölti a Reactot, a Vite-ot és a qrcode könyvtárat
npm run dev     # elindítja a fejlesztői szervert
```

Nyisd meg a kiírt címet (általában http://localhost:5173). Egy fehér kártyát kell látnod „QR Code Generator”
címmel.

## Mi van benne?

- `package.json` – a projekt csomagjai. A React és a Vite mellett már a `qrcode` is benne van: ez a könyvtár rajzolja
  a QR-kódokat.
- `src/App.jsx` – az oldal: egyelőre csak a cím.
- `src/App.css` – a teljes lecke stílusai, készen; az útmutató ezeket az osztályneveket használja.

## Ha valami elromlik

Ez a mappa egy git-repó egy committal, a kiindulóponttal.
A `git log` megmutatja, a `git restore .` pedig minden fájlt visszaállít az eredeti állapotába.

A kész app: {{SOLUTION_URL}}
