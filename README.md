# Rika Mentoring

50 React lessons, from your very first component to a real-time chat app, in English and Hungarian.
[Magyarul lent ↓](#magyarul)

**Website:** https://mazsola739.github.io/rika-mentoring/ (under construction: the guides are still being written)

## How a lesson works

Every lesson is a folder in [`lessons/`](lessons/), numbered from the easiest to the hardest:

| Folder | What is in it |
|---|---|
| `lessons/09-todo/exercise/` | The **exercise**: a ready Vite + React starting project. You build the app here. |
| `lessons/09-todo/solution/` | The **solution**: the finished app, as it runs on the website. |

The step-by-step **guide** of each lesson is on the website, on the lesson's page (the link is in the lesson folder's
README). It starts from the exercise and explains everything from the very basics.

## Start a lesson

You need [Node.js](https://nodejs.org) (the LTS version), git and a code editor, for example VS Code.

```bash
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/01-portfolio/exercise me-myself-and-react    # your own copy of the exercise
cd me-myself-and-react
npm install
npm run dev
```

Every exercise is its own small project. You work in your copy: the repository stays as it is, and `git pull` in it
brings the new lessons. No git? Choose **Code → Download ZIP** on this page, unpack it and copy the lesson's `exercise`
folder out of it. Step 0 of each guide explains everything.

## The lessons

<!-- lessons:start -->
| # | Lesson | Magyarul | Level / Szint |
|---|---|---|---|
| 01 | [Me, Myself & React](lessons/01-portfolio/) | Portfólió és önéletrajz | Beginner / Kezdő |
| 02 | [Dark Mode](lessons/02-dark-mode/) | Sötét / világos mód | Beginner / Kezdő |
| 03 | [Password Generator](lessons/03-password-generator/) | Biztonságos jelszógenerátor | Beginner / Kezdő |
| 04 | [Mad Libs](lessons/04-mad-libs/) | Szóbehelyettesítős játék | Beginner / Kezdő |
| 05 | [QR Code Generator](lessons/05-qr-code/) | QR-kód szövegből vagy linkből | Beginner / Kezdő |
| 06 | [Flashcards](lessons/06-flashcards/) | Tanulókártyák | Beginner / Kezdő |
| 07 | [Color Palette Generator](lessons/07-color-palette/) | Véletlen színpaletta | Beginner / Kezdő |
| 08 | [Calculator](lessons/08-calculator/) | Számológép alapműveletekkel | Beginner / Kezdő |
| 09 | [To-Do List](lessons/09-todo/) | Feladatkezelő | Beginner / Kezdő |
| 10 | [Shopping List](lessons/10-shopping-list/) | Bevásárlólista | Beginner / Kezdő |
| 11 | [Notes App](lessons/11-notes/) | Jegyzetek | Beginner / Kezdő |
| 12 | [Image Gallery & Carousel](lessons/12-image-gallery/) | Képgaléria lapozóval | Beginner / Kezdő |
| 13 | [Memory Game](lessons/13-memory-game/) | Kártyafordítós párkereső | Beginner / Kezdő |
| 14 | [Currency Converter](lessons/14-currency-converter/) | Pénznemváltó | Beginner+ / Kezdő+ |
| 15 | [Space Explorer](lessons/15-space-explorer/) | A nap csillagászati képe | Beginner+ / Kezdő+ |
| 16 | [Typing Speed Test](lessons/16-typing-test/) | Gépelési sebességmérő | Beginner+ / Kezdő+ |
| 17 | [Musical Instrument](lessons/17-piano/) | Interaktív zongora | Beginner+ / Kezdő+ |
| 18 | [Video Player](lessons/18-video-player/) | Videólejátszó saját vezérlőkkel | Beginner+ / Kezdő+ |
| 19 | [Wordle-style Game](lessons/19-wordle/) | Szókitaláló | Beginner+ / Kezdő+ |
| 20 | [Movie Search](lessons/20-movie-search/) | Filmkereső | Beginner+ / Kezdő+ |
| 21 | [Book Library](lessons/21-book-library/) | Könyvkereső és olvasólista | Beginner+ / Kezdő+ |
| 22 | [Multi-Step Form](lessons/22-multi-step-form/) | Többlépéses űrlap | Beginner+ / Kezdő+ |
| 23 | [Fan Wiki](lessons/23-fan-wiki/) | Rajongói wiki | Beginner+ / Kezdő+ |
| 24 | [Review & Rating App](lessons/24-review-rating/) | Értékelő és véleményező app | Beginner+ / Kezdő+ |
| 25 | [Meme Generator](lessons/25-meme-generator/) | Mémkészítő | Beginner+ / Kezdő+ |
| 26 | [Blog Platform](lessons/26-blog/) | Blog | Beginner+ / Kezdő+ |
| 27 | [Piggy Bank / Wallet](lessons/27-piggy-bank/) | Digitális pénztárca és malacpersely | Intermediate / Közép |
| 28 | [Subscription Tracker](lessons/28-subscriptions/) | Előfizetéskövető | Intermediate / Közép |
| 29 | [Plant Care Tracker](lessons/29-plant-care/) | Növénygondozó | Intermediate / Közép |
| 30 | [Mood Tracker](lessons/30-mood-tracker/) | Hangulatnapló | Intermediate / Közép |
| 31 | [Virtual Pet (Tamagotchi-style)](lessons/31-virtual-pet/) | Virtuális háziállat | Intermediate / Közép |
| 32 | [Snake](lessons/32-snake/) | Kígyós játék | Intermediate / Közép |
| 33 | [Lofi Study Room](lessons/33-lofi-room/) | Hangulatos tanulószoba | Intermediate / Közép |
| 34 | [Digital Wardrobe](lessons/34-wardrobe/) | Digitális ruhatár | Intermediate / Közép |
| 35 | [Drawing App](lessons/35-drawing/) | Rajzolóprogram | Intermediate / Közép |
| 36 | [Winamp Clone](lessons/36-winamp/) | Retró zenelejátszó | Intermediate / Közép |
| 37 | [Job Application Tracker](lessons/37-job-tracker/) | Jelentkezéskövető | Intermediate / Közép |
| 38 | [Kanban Board](lessons/38-kanban/) | Feladattábla húzással | Intermediate / Közép |
| 39 | [Photo Booth](lessons/39-photo-booth/) | Webkamerás fotófülke | Intermediate / Közép |
| 40 | [Mood Board](lessons/40-mood-board/) | Inspirációs tábla | Intermediate / Közép |
| 41 | [Swipe Picker (Tinder-style)](lessons/41-swipe/) | Kártyák jobbra-balra | Intermediate / Közép |
| 42 | [Travel Bucket List](lessons/42-travel-map/) | Utazási térkép egy kitalált világban | Intermediate / Közép |
| 43 | [Data Table](lessons/43-data-table/) | Felhasználókezelő táblázat | Advanced / Haladó |
| 44 | [E-commerce Store](lessons/44-webshop/) | Webshop | Advanced / Haladó |
| 45 | [User Authentication System](lessons/45-auth/) | Regisztráció és bejelentkezés | Advanced / Haladó |
| 46 | [Reddit-style Feed](lessons/46-feed/) | Posztok szavazással és kommentekkel | Advanced / Haladó |
| 47 | [Booking App](lessons/47-booking/) | Időpontfoglaló | Advanced / Haladó |
| 48 | [AI Chat Assistant](lessons/48-ai-chat/) | Saját AI chatbot | Advanced / Haladó |
| 49 | [Retro OS Desktop](lessons/49-retro-os/) | Windows 95-szerű asztal a böngészőben | Advanced / Haladó |
| 50 | [Real-Time Chat / Slack Clone](lessons/50-chat/) | Valós idejű chat csatornákkal | Advanced / Haladó |
<!-- lessons:end -->

## The website itself

The site is a Vite + React multi-page app: the main page in `src/`, and every lesson's `solution/` is one more page.

```bash
npm install
npm run dev      # http://localhost:7020
npm run build    # the static site in dist/
```

| Folder / file | What is in it |
|---|---|
| `lessons/<NN-slug>/` | One folder per lesson: `exercise/`, `solution/` and a README (generated). |
| `content/guides/<slug>/` | The guides in Markdown, `hu.md` and `en.md` (format: [docs/guide-format.md](docs/guide-format.md)). |
| `sajat-50.md` | The lesson list in Hungarian. **It sets the order.** |
| `content/lessons.en.json`, `content/cards.json` | The English lesson texts and the texts of the lesson cards. |
| `shared/` | The lesson page frame, the design, the guide viewer and the in-browser mock APIs. `shared/lessons.json` is generated by `npm run lessons`: do not edit it by hand. |
| `src/` | The main page. |
| `docs/` | Rules for the solution apps ([docs/lesson-guide.md](docs/lesson-guide.md)) and the guides. |

Every push to `main` builds the site and publishes it on GitHub Pages (`.github/workflows/deploy.yml`).
The "under construction" strip is switched off with `"underConstruction": false` in `shared/site.json`.

---

## Magyarul

50 React-lecke az első komponenstől egy valós idejű chatappig, magyarul és angolul.

**Weboldal:** https://mazsola739.github.io/rika-mentoring/ (fejlesztés alatt: az útmutatók még készülnek)

### Hogyan épül fel egy lecke?

Minden lecke egy mappa a [`lessons/`](lessons/) alatt, a legkönnyebbtől a legnehezebbig számozva:

| Mappa | Mi van benne? |
|---|---|
| `lessons/09-todo/exercise/` | A **feladat**: kész Vite + React kiinduló projekt. Ebben építed fel az appot. |
| `lessons/09-todo/solution/` | A **megoldás**: a kész app, ahogy a weboldalon fut. |

A leckék lépésről lépésre haladó **útmutatója** a weboldalon van, a lecke oldalán (a linket a lecke mappájának
README-je tartalmazza). A feladatból indul, és mindent az alapoktól magyaráz.

### Egy lecke elkezdése

Kell hozzá a [Node.js](https://nodejs.org) (az LTS-verzió), a git és egy kódszerkesztő, például a VS Code.

```bash
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/01-portfolio/exercise me-myself-and-react    # a feladat saját másolata
cd me-myself-and-react
npm install
npm run dev
```

Minden feladat egy önálló kis projekt. A másolatodban dolgozol: a repó változatlan marad, és benne a `git pull`
lehozza az új leckéket. Nincs gited? Ezen az oldalon válaszd a **Code → Download ZIP** lehetőséget, csomagold ki, és
másold ki belőle a lecke `exercise` mappáját. Minden útmutató 0. lépése mindent elmagyaráz.

A leckék listája fent, „The lessons” alatt van.
