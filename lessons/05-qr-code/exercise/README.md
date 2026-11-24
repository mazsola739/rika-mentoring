# 05 · QR Code Generator – exercise

The starting point of Rika Mentoring's lesson 05. The guide walks you through it step by step:
https://mazsola739.github.io/rika-mentoring/lessons/05-qr-code/solution/?view=guide

## Start

First copy this folder out of the repository into your own work folder and name the copy `qr-code-generator`: your work
stays separate, and `git pull` in the repository can still bring new lessons. You need
[Node.js](https://nodejs.org) (the LTS version) and a code editor, for example VS Code. In your copy:

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

Step 0 of the guide makes your copy a git repository with one commit. After that, `git restore .` takes every file
back to your last commit, and the original is always here, in the repository.

The finished app: https://mazsola739.github.io/rika-mentoring/lessons/05-qr-code/solution/?view=solution

---

# 05 · QR Code Generator – kiinduló projekt

A Rika Mentoring 05. leckéjének kiindulópontja. Az útmutató lépésről lépésre végigvezet rajta:
https://mazsola739.github.io/rika-mentoring/lessons/05-qr-code/solution/?view=guide

## Indítás

Először másold ki ezt a mappát a repóból a saját munkamappádba, és nevezd el a másolatot így: `qr-code-generator`. Így a
munkád külön marad, és a repóban a `git pull` továbbra is le tudja hozni az új leckéket. Kell hozzá a
[Node.js](https://nodejs.org) (az LTS-verzió) és egy kódszerkesztő, például a VS Code. A másolatodban:

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

Az útmutató 0. lépésében a másolatodból git-repó lesz egy committal. Ezután a `git restore .` minden fájlt
visszaállít az utolsó commitod állapotára, az eredeti pedig mindig itt van, a repóban.

A kész app: https://mazsola739.github.io/rika-mentoring/lessons/05-qr-code/solution/?view=solution
