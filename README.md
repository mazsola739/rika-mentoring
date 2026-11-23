# Rika Mentoring

50 React-lecke a teljesen kezdőtől a haladóig, angolul (alapnyelv) és magyarul. Sötét, „webfejlesztős” hangulat a Páva palettával: a főoldal fejléce a pávás kép, a leckék névjegykártya-stílusú flipkártyák (sötét előlap papírhullámokkal, világos hátlap a részletekkel). A kártyák színe a főoldalon állítható (Páva mix, egy szín, vagy egyéni szín).

A Páva színek külön is elmentve: [resources/pava-szinek](resources/pava-szinek) (CSS, JSON, PNG, leírás).

## Indítás

```powershell
npm install
npm run dev
```

Utána: <http://localhost:7020>

## Felépítés

| Mappa / fájl | Mi van benne |
|---|---|
| `sajat-50.md` | A leckék listája magyarul. **Ez adja a sorrendet.** |
| `content/lessons.en.json` | A leckék angol szövegei, slug szerint. |
| `shared/lessons.json` | Generált fájl (`npm run lessons`), kézzel ne szerkeszd. |
| `src/` | A főoldal (50 leckekártya, szűrő, kereső). |
| `apps/<slug>/` | Leckénként egy önálló micro frontend (saját `index.html`, saját bundle). |
| `shared/ui/` | Közös dizájn: pávatollas paletta és akcentszínek (`palette.js`), leckeoldal-keret, nyelvváltó. |
| `shared/mock-api/` | „Kamu backend”: localStorage + késleltetés + hibák, és `BroadcastChannel` a valós időhöz. |
| `resources/` | Referenciák és a korábbi mintaképek eredetijei (az oldal már nem használja őket). |

## Leckék

Mind az 50 lecke elkészült kezdő és közép szinten, angolul (alapnyelv) és magyarul. Egy app módosítása vagy új funkció előtt olvasd el a [docs/lesson-guide.md](docs/lesson-guide.md) szabálykönyvet: felépítés, kétnyelvűség, dizájnszabályok, kamu backend, ellenőrzőlista.

A szövegeket `useText({ en: {…}, hu: {…} })` segítségével add meg, így a nyelvváltó működik.

## Build és GitHub Pages

```powershell
npm run build
```

A `dist/` mappa statikus. Relatív útvonalakkal készül, így bármelyik GitHub Pages címen működik.
