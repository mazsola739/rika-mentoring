# Mentorált React projektek (50)

**Időszak:** 2023–2026

Mind React-appok. A lista nehézség szerint halad, a legkönnyebbel kezdődik. Minden projektnél leírtam, mit tanulunk vele, és mit kell megcsinálni kezdő, közép és haladó szinten. Haladó szinten több projekthez backend is kell (Firebase / Supabase vagy saját Node.js szerver).

1. **Me, Myself & React** – Portfólió és önéletrajz
    - **Mit tanulunk:** komponensekre bontás, reszponzív dizájn, routing, űrlap küldése, telepítés (Vercel / Netlify), SEO
    - **Kezdő:** egyoldalas bemutatkozás, készségek, elérhetőség
    - **Közép:** projektek kártyákon, külön oldalak, működő kapcsolati űrlap
    - **Haladó:** tartalom CMS-ből, blog, animációk, Lighthouse 90+ pont, saját domain

2. **Dark Mode** – Sötét / világos mód
    - **Mit tanulunk:** Context API, CSS-változók, `useEffect` és `matchMedia`, saját `useDarkMode` hook
    - **Kezdő:** kapcsoló, ami átváltja az oldal színeit
    - **Közép:** a választás megjegyzése, a rendszerbeállítás (`prefers-color-scheme`) követése
    - **Haladó:** több téma, villanásmentes betöltés, animált átmenet, Context-alapú témarendszer egy egész apphoz

3. **Password Generator** – Biztonságos jelszógenerátor
    - **Mit tanulunk:** vezérelt űrlapelemek (csúszka, jelölőnégyzetek), véletlenszám-logika, vágólap API
    - **Kezdő:** jelszó generálása megadott hosszal, másolás gombbal
    - **Közép:** kis- és nagybetű, szám, speciális karakter kapcsolói, erősségjelző
    - **Haladó:** `crypto.getRandomValues` a `Math.random` helyett, kiejthető jelszavak, ellenőrzés, hogy a jelszó szerepelt-e adatszivárgásban

4. **Mad Libs** – Szóbehelyettesítős játék
    - **Mit tanulunk:** vezérelt űrlapmezők, szövegsablonok és szöveg-összefűzés, feltételes megjelenítés
    - **Kezdő:** néhány mező (név, állat, ige), a beírt szavakból vicces történet lesz
    - **Közép:** több sablon vagy véletlen sablon, a mezők a sablonból generálódnak, újrakezdés
    - **Haladó:** saját sablon írása `{főnév}` jelölőkkel, megosztható link, felolvasás (Speech Synthesis API), kétjátékos mód

5. **QR Code Generator** – QR-kód szövegből vagy linkből
    - **Mit tanulunk:** külső npm-csomag használata, vezérelt input, fájl letöltése a böngészőből
    - **Kezdő:** szöveg vagy link beírása, QR-kód megjelenítése egy könyvtárral
    - **Közép:** szín, méret, logó a közepén, letöltés PNG-ként és SVG-ként
    - **Haladó:** QR-kód beolvasása kamerával, Wi-Fi és névjegy típusú QR-kódok, előzmények

6. **Flashcards** – Tanulókártyák
    - **Mit tanulunk:** kártyafordítás 3D CSS-animációval, lépésenként haladó logika, keverés, mentés a `useLocalStorage` hookkal
    - **Kezdő:** kártyák kérdéssel és válasszal, kattintásra megfordulnak, előző / következő gomb
    - **Közép:** saját paklik, „tudom / nem tudom” jelölés, keverés, haladásjelző, mentés
    - **Haladó:** a nehezebb kártyák gyakrabban jönnek elő (spaced repetition), képek a kártyán, import / export, megosztható paklik

7. **Color Palette Generator** – Véletlen színpaletta
    - **Mit tanulunk:** tömbök az állapotban (frissítés másolattal), billentyűesemények, vágólap API, színkódok
    - **Kezdő:** 5 véletlen szín gombnyomásra, hex kód kiírása, másolás vágólapra
    - **Közép:** színek rögzítése, szóközre új paletta, kedvencek mentése
    - **Haladó:** harmonikus paletták színelmélet alapján, kontrasztellenőrzés (WCAG), export CSS-változóként, megosztható link

8. **Calculator** – Számológép alapműveletekkel
    - **Mit tanulunk:** `useState`, eseménykezelés, komponensek és props (gombok), feltételes megjelenítés
    - **Kezdő:** számgombok, a négy alapművelet, eredmény, törlés (C)
    - **Közép:** billentyűzetes bevitel, tizedesek, százalék, előjelváltás, előzmények listája
    - **Haladó:** műveleti sorrend és zárójelek, tudományos funkciók, saját kifejezés-feldolgozó, tesztek

9. **To-Do List** – Feladatkezelő
    - **Mit tanulunk:** listák renderelése `key`-jel, létrehozás/módosítás/törlés az állapotban, szűrés, `useEffect`, saját `useLocalStorage` hook
    - **Kezdő:** feladat hozzáadása, kipipálása, törlése
    - **Közép:** szerkesztés, szűrés (összes / aktív / kész), mentés a `useLocalStorage` hookkal
    - **Haladó:** határidő és prioritás, húzással átrendezés, backend adatbázissal és bejelentkezéssel, tesztek

10. **Shopping List** – Bevásárlólista
    - **Mit tanulunk:** csoportosítás és rendezés tömbökkel, vezérelt űrlap, adatok megőrzése a `useLocalStorage` hookkal
    - **Kezdő:** tétel hozzáadása mennyiséggel, kipipálás, törlés
    - **Közép:** kategóriák (zöldség, tejtermék, …), mentés, a kész tételek a lista aljára kerülnek
    - **Haladó:** közös lista több felhasználóval valós időben, offline működés (PWA), korábbi tételek ajánlása

11. **Notes App** – Jegyzetek
    - **Mit tanulunk:** létrehozás/módosítás/törlés, keresés és szűrés számolt értékekkel, dátumkezelés, `useLocalStorage` hook
    - **Kezdő:** jegyzet írása, mentése, törlése
    - **Közép:** kategóriák, keresés, mentés a hookkal, utolsó módosítás dátuma
    - **Haladó:** formázott szöveg (Markdown), címkék, szinkron több eszköz között backenddel, offline mód

12. **Image Gallery & Carousel** – Képgaléria lapozóval
    - **Mit tanulunk:** `setInterval` és leállítása a `useEffect`-ben, modális ablak, fájlfeltöltés, billentyűesemények
    - **Kezdő:** képek rácsban, kattintásra nagy nézet
    - **Közép:** képfeltöltés, magától lapozó carousel kézi léptetéssel, nyilakkal is
    - **Haladó:** lusta betöltés, végtelen görgetés, albumok, felhős képtárhely, húzással átrendezés

13. **Memory Game** – Kártyafordítós párkereső
    - **Mit tanulunk:** összetettebb állapot (kártyák, kiválasztott pár), `setTimeout`, keverés, CSS-animációk
    - **Kezdő:** kártyák megfordítása, párok keresése, „nyertél” üzenet
    - **Közép:** lépésszámláló, időmérő, fordítási animáció, nehézségi szintek (rácsméret)
    - **Haladó:** legjobb eredmények mentése, témák (emoji, képek API-ból), kétjátékos mód, billentyűvezérlés

14. **Currency Converter** – Pénznemváltó
    - **Mit tanulunk:** adatlekérés `fetch`-csel, töltés- és hibaállapot, saját `useFetch` hook, API-kulcs környezeti változóban
    - **Kezdő:** összeg és két pénznem, átváltás fix árfolyammal
    - **Közép:** élő árfolyamok API-ból a `useFetch` hookkal, csere gomb, hibakezelés
    - **Haladó:** árfolyamgrafikon az elmúlt 30 napról, kedvenc pénznempárok, gyorsítótárazás, offline az utolsó ismert árfolyam

15. **Space Explorer** – A nap csillagászati képe
    - **Mit tanulunk:** API kulccsal, dátumkezelés, médiatípus szerinti megjelenítés (kép / videó), gyorsítótárazás
    - **Kezdő:** a napi kép címmel és magyarázattal
    - **Közép:** dátumválasztó az archívumhoz, kedvencek, videós napok kezelése
    - **Haladó:** további adatok az API-ból (időszakok, véletlen képek) szűréssel, végtelen görgetés, galéria nagy nézettel

16. **Typing Speed Test** – Gépelési sebességmérő
    - **Mit tanulunk:** `useRef`, időmérés és az időzítő leállítása, számolás minden leütésnél, felesleges újrarenderelések elkerülése
    - **Kezdő:** szöveg begépelése, idő mérése, karakter/perc kiírása
    - **Közép:** valós idejű kiemelés (helyes / hibás), szó/perc és pontosság, időkorlátos mód (30 / 60 mp)
    - **Haladó:** élő grafikon a gépelés közben, előzmények és fejlődés, ranglista, többjátékos verseny

17. **Musical Instrument** – Interaktív zongora
    - **Mit tanulunk:** billentyűesemények, `useRef` hangokhoz, tömbből generált felület, Web Audio API
    - **Kezdő:** zongorabillentyűk, kattintásra hang
    - **Közép:** játék a számítógép billentyűzetével, több oktáv, hangszín választása
    - **Haladó:** hangszintézis Web Audio API-val, felvétel és visszajátszás, MIDI-billentyűzet, dallamtanító mód

18. **Video Player** – Videólejátszó saját vezérlőkkel
    - **Mit tanulunk:** `useRef` a DOM-elemhez, HTML5 videó API (`play`, `currentTime`), saját vezérlők, akadálymentesség
    - **Kezdő:** videó lejátszása saját lejátszás / szünet gombbal
    - **Közép:** tekerősáv, hangerő, teljes képernyő, lejátszási sebesség, billentyűparancsok
    - **Haladó:** lejátszási lista, feliratok, folytatás ott, ahol abbahagytad, kép a képben mód

19. **Wordle-szerű játék** – Szókitaláló
    - **Mit tanulunk:** globális billentyűesemények, rács az állapotban, játéklogika, animációk
    - **Kezdő:** 5 betűs szó kitalálása 6 próbából, színes visszajelzés
    - **Közép:** képernyő-billentyűzet a betűk állapotával, érvényes szavak ellenőrzése, animációk
    - **Haladó:** napi szó (mindenkinek ugyanaz), statisztikák és sorozat, eredmény megosztása emoji-rácsként, magyar szólista

20. **Movie Search** – Filmkereső
    - **Mit tanulunk:** routing (React Router) paraméterekkel, saját `useFetch` és `useDebounce` hook, üres és hibaállapotok
    - **Kezdő:** keresőmező, találatok címmel és poszterrel
    - **Közép:** adatlap külön oldalon, a keresés csak a gépelés után indul (debounce), „nincs találat” kezelése
    - **Haladó:** lapozás vagy végtelen görgetés, szűrés év és műfaj szerint, kedvencek, a keresés az URL-ben marad

21. **Book Library** – Könyvkereső és olvasólista
    - **Mit tanulunk:** keresés API-ban, tételek mozgatása listák között, `useFetch` hook, API-adatok átalakítása
    - **Kezdő:** saját könyvlista (cím, szerző), olvasási státusz
    - **Közép:** könyvkeresés API-ból (a lecke saját könyv-API-ja), polcok: olvasom / elolvastam / szeretném elolvasni
    - **Haladó:** értékelés és jegyzetek, olvasási cél és statisztika, bejelentkezés és felhős mentés

22. **Multi-Step Form** – Többlépéses űrlap
    - **Mit tanulunk:** űrlapállapot több lépésen át, validálás, React Hook Form és Zod, felhasználói élmény
    - **Kezdő:** három lépés előre-hátra gombokkal, összefoglaló a végén
    - **Közép:** validálás lépésenként, haladásjelző, az adatok megmaradnak lépésváltáskor
    - **Haladó:** React Hook Form + Zod, feltételes lépések, piszkozat mentése, beküldés API-ra

23. **Fan Wiki** – Rajongói wiki
    - **Mit tanulunk:** lista és adatlap API-ból, dinamikus routing, keresés és szűrés, lapozás
    - **Kezdő:** szereplők listája képpel és névvel
    - **Közép:** adatlap minden szereplőhöz, keresés és szűrés, adatok API-ból
    - **Haladó:** lapozás, kapcsolatok a szereplők között, epizódlista, szerkeszthető bejegyzések

24. **Review & Rating App** – Értékelő és véleményező app
    - **Mit tanulunk:** újrahasznosítható komponens (csillagok), számolt adatok (átlag), rendezés és szűrés, később backend
    - **Kezdő:** tételek listája, csillagos értékelés, szöveges vélemény
    - **Közép:** átlagos értékelés, rendezés értékelés szerint, szűrés, adatlap
    - **Haladó:** bejelentkezés, egy felhasználó egy értékelés, „hasznos volt” szavazás, moderálás, backend

25. **Meme Generator** – Mémkészítő
    - **Mit tanulunk:** rajzolás canvasra, képfeltöltés, sablonok API-ból, kép letöltése
    - **Kezdő:** kép választása, felső és alsó szöveg rá
    - **Közép:** mémsablonok API-ból, saját kép feltöltése, betűtípus, méret, szín, letöltés
    - **Haladó:** szövegdobozok húzása és forgatása, matricák, mémgaléria és megosztás

26. **Blog Platform** – Blog
    - **Mit tanulunk:** routing, létrehozás/módosítás/törlés, Markdown megjelenítése, később backend és adatbázis
    - **Kezdő:** bejegyzések listája és egy bejegyzés oldala
    - **Közép:** új bejegyzés írása, szerkesztés, törlés, Markdown-támogatás
    - **Haladó:** backend adatbázissal, szerzők bejelentkezéssel, kommentek, címkék, keresés, SEO

27. **Piggy Bank / Wallet** – Digitális pénztárca és malacpersely
    - **Mit tanulunk:** összetett állapot `useReducer`-rel, számolás tömbökön (`reduce`), grafikonok (Recharts), adatexport
    - **Kezdő:** befizetés és kivétel, egyenleg kiírása
    - **Közép:** kategóriák, tranzakciólista szűréssel, megtakarítási cél haladásjelzővel, mentés
    - **Haladó:** grafikonok havi bontásban, több pénztárca és pénznem, ismétlődő tételek, export CSV-be

28. **Subscription Tracker** – Előfizetéskövető
    - **Mit tanulunk:** dátumszámítás (következő megújulás), összesítés, rendezés, böngészőértesítések
    - **Kezdő:** előfizetések listája névvel és havi díjjal, összesítés
    - **Közép:** havi és éves nézet, megújulási dátum, kategóriák, logók
    - **Haladó:** értesítés a megújulás előtt, költésgrafikon, pénznemváltás, „melyiket mondjam le?” javaslatok

29. **Plant Care Tracker** – Növénygondozó
    - **Mit tanulunk:** időalapú logika (mikor kell öntözni), képfeltöltés, böngészőértesítések, PWA-alapok
    - **Kezdő:** növények listája névvel és fotóval
    - **Közép:** öntözési gyakoriság, „szomjas vagyok” jelzés, öntözési napló
    - **Haladó:** értesítések, gondozási adatok API-ból, telepíthető app (PWA)

30. **Mood Tracker** – Hangulatnapló
    - **Mit tanulunk:** dátumkezelés, naptárrács generálása, grafikonok, adatok összesítése
    - **Kezdő:** napi hangulat kiválasztása emojival, rövid jegyzet
    - **Közép:** színes naptárnézet, mentés, a nap részletei kattintásra
    - **Haladó:** grafikon a hangulat alakulásáról, összefüggések (alvás, sport), heti összefoglaló, emlékeztető értesítés

31. **Virtual Pet (Tamagotchi-szerű)** – Virtuális háziállat
    - **Mit tanulunk:** idővel változó állapot, a bezárás alatt eltelt idő kiszámolása, `useReducer`, animációk, mentés
    - **Kezdő:** háziállat állapotokkal (éhség, kedv), etetés és játék gombok
    - **Közép:** az állapotok idővel csökkennek, hangulat szerinti kinézet, mentés
    - **Haladó:** az idő akkor is telik, ha bezárod az oldalt, fejlődési szakaszok, minijátékok, értesítések

32. **Snake** – Kígyós játék
    - **Mit tanulunk:** játékciklus (`setInterval` / `requestAnimationFrame`), `useRef` a friss állapothoz, ütközésvizsgálat, canvas
    - **Kezdő:** a kígyó mozgatása nyilakkal, étel felvétele, növekedés
    - **Közép:** ütközés a falba és saját magába, pontszám, gyorsuló tempó, szünet
    - **Haladó:** rajzolás canvasra, rekordok mentése, pályák akadályokkal, mobilos húzásvezérlés

33. **Lofi Study Room** – Hangulatos tanulószoba
    - **Mit tanulunk:** több hang lejátszása egyszerre, csúszkák, időzítő leállítással, hangulatos CSS
    - **Kezdő:** háttérkép és lofi zene lejátszása
    - **Közép:** háttérhangok (eső, kávézó, tűz) külön hangerővel, fókuszidőzítő
    - **Haladó:** témák (éjszakai város, erdő), teendőlista a szobában, tanulási statisztika, közös szoba barátokkal valós időben

34. **Digital Wardrobe** – Digitális ruhatár
    - **Mit tanulunk:** képfeltöltés és -kezelés, szűrés több feltétellel, időjárás API, kombinációk generálása
    - **Kezdő:** ruhadarabok feltöltése fotóval és kategóriával
    - **Közép:** szettek összeállítása, szűrés szín, évszak és alkalom szerint
    - **Haladó:** „mit vegyek fel ma?” az aktuális időjárás alapján, viselési napló, háttéreltávolítás a fotókról

35. **Drawing App** – Rajzolóprogram
    - **Mit tanulunk:** canvas API, egér- és érintésesemények, `useRef`, visszavonás (előzmény-verem), kép exportálása
    - **Kezdő:** rajzolás egérrel, szín választása
    - **Közép:** ecsetméret, radír, visszavonás, mentés képként
    - **Haladó:** rétegek, alakzatok, érintőképernyő és toll, közös rajzolás valós időben

36. **Winamp Clone** – Retró zenelejátszó
    - **Mit tanulunk:** hangkezelés, lejátszási lista állapota, OAuth bejelentkezés (Spotify), hangvizualizáció, egyedi retró CSS
    - **Kezdő:** retró kinézetű lejátszó saját zenefájlokkal: lejátszás, szünet, következő
    - **Közép:** lejátszási lista, tekerősáv, hangerő, keverés és ismétlés
    - **Haladó:** Spotify API bejelentkezéssel, hangvizualizáció Web Audio API-val, cserélhető skinek

37. **Job Application Tracker** – Jelentkezéskövető
    - **Mit tanulunk:** drag & drop (dnd-kit), létrehozás/módosítás/törlés, szűrés, dátumok és emlékeztetők, statisztika
    - **Kezdő:** jelentkezések listája (cég, pozíció, dátum, státusz)
    - **Közép:** státusz-oszlopok húzással (jelentkeztem → interjú → ajánlat), keresés, szűrés
    - **Haladó:** interjú-emlékeztetők, statisztikák (válaszarány), önéletrajz-verziók csatolása, bejelentkezés és felhős mentés

38. **Kanban Board** – Feladattábla húzással
    - **Mit tanulunk:** drag & drop könyvtárral (dnd-kit), egymásba ágyazott állapot (oszlopok → kártyák), `useReducer`
    - **Kezdő:** három oszlop (To-Do / In Progress / Done), kártya hozzáadása
    - **Közép:** húzás oszlopok között, prioritás (High / Medium / Low), szerkesztés, mentés
    - **Haladó:** több tábla, határidők, csapattagok, valós idejű közös szerkesztés, backend

39. **Photo Booth** – Webkamerás fotófülke
    - **Mit tanulunk:** kamera elérése (`getUserMedia`), rajzolás canvasra, szűrők, időzítés, kép és GIF készítése
    - **Kezdő:** a webkamera képe az oldalon, fotó gombnyomásra
    - **Közép:** visszaszámlálás, négyképes fotócsík, szűrők, letöltés
    - **Haladó:** polaroid és egyéni keretek, arcra illeszkedő matricák, GIF készítése, galéria

40. **Mood Board** – Inspirációs tábla
    - **Mit tanulunk:** szabad húzás és átméretezés, pozíciók tárolása, képfeltöltés, több tábla kezelése
    - **Kezdő:** képek és jegyzetek feltöltése egy táblára
    - **Közép:** elemek szabad húzása, átméretezés, több tábla
    - **Haladó:** színpaletta kinyerése a képekből, képkeresés Unsplash API-ból, megosztható tábla, export képként

41. **Swipe-os választó (Tinder-szerű)** – Kártyák jobbra-balra
    - **Mit tanulunk:** gesztusok (pointer események), animációk (Framer Motion), API, később valós idejű közös állapot
    - **Kezdő:** kártyák egymás után, igen / nem gombokkal
    - **Közép:** kártyák húzása jobbra-balra animációval, filmek vagy ételek API-ból
    - **Haladó:** közös szoba két embernek, a közös találatok valós időben, szűrők (műfaj, konyha)

42. **Travel Bucket List** – Utazási térkép egy kitalált világban
    - **Mit tanulunk:** térképkönyvtár (React Leaflet) saját térképképpel, jelölők, régiók GeoJSON-ben, képfeltöltés
    - **Kezdő:** helyek listája: jártam ott / szeretnék menni
    - **Közép:** térkép jelölőkkel, jegyzetek és fotók helyenként
    - **Haladó:** a bejárt régiók kiszínezve a térképen, statisztika (szigetek, régiók), megosztható térkép

43. **Data Table** – Felhasználókezelő táblázat
    - **Mit tanulunk:** rendezés, szűrés és lapozás logikája, TanStack Table, teljesítmény nagy adatnál, szerveroldali adatkezelés
    - **Kezdő:** felhasználók táblázatban
    - **Közép:** rendezés oszlopra kattintva, keresés, szűrés, lapozás
    - **Haladó:** szerkesztés a táblázatban, több sor kijelölése, sok ezer sor gyors megjelenítése, szerveroldali lapozás, export

44. **E-commerce Store (Webshop)** – Webshop
    - **Mit tanulunk:** globális állapotkezelés (Context / Redux / Zustand), routing, kosárlogika, fizetés bekötése
    - **Kezdő:** terméklista és termékoldal
    - **Közép:** kosár globális állapottal, végösszeg, szűrés, keresés
    - **Haladó:** checkout, tesztfizetés (Stripe teszt mód), rendeléskezelés, admin felület, bejelentkezés

45. **User Authentication System** – Regisztráció és bejelentkezés
    - **Mit tanulunk:** űrlapvalidálás, védett oldalak, tokenek és session, Firebase / Supabase, majd saját backend
    - **Kezdő:** regisztrációs és bejelentkezési űrlap validálással
    - **Közép:** bejelentkezés kész szolgáltatással (Firebase / Supabase), védett oldalak, kijelentkezés
    - **Haladó:** saját backend JWT-vel vagy sessionnel, jelszó-visszaállítás e-mailben, Google-bejelentkezés, szerepkörök

46. **Reddit-szerű feed** – Posztok szavazással és kommentekkel
    - **Mit tanulunk:** rekurzív komponensek (kommentfa), azonnali felületfrissítés szavazáskor, végtelen görgetés, backend
    - **Kezdő:** posztok listája, fel / le szavazás
    - **Közép:** rendezés (legújabb / legnépszerűbb), kommentek egy szinten, új poszt írása
    - **Haladó:** egymásba ágyazott kommentek tetszőleges mélységig, közösségek, bejelentkezés, végtelen görgetés, backend

47. **Booking App (Időpontfoglaló)** – Időpontfoglaló
    - **Mit tanulunk:** dátum- és időkezelés (date-fns), foglalási ütközések, űrlapok, backend és adatbázis, időzónák
    - **Kezdő:** szolgáltatások listája, időpont választása fix listából
    - **Közép:** naptár szabad és foglalt időpontokkal, foglalási űrlap, visszaigazolás
    - **Haladó:** admin felület a nyitvatartáshoz, ütközések kezelése, e-mail emlékeztető, backend

48. **AI Chat Assistant** – Saját AI chatbot
    - **Mit tanulunk:** folyamatosan érkező (streamelt) válaszok kezelése, backend az API-kulcs elrejtésére, Markdown és kód megjelenítése, több beszélgetés állapota
    - **Kezdő:** chatfelület, üzenet küldése, válasz megjelenítése
    - **Közép:** AI API bekötése, gépelődő válasz, beszélgetés-előzmények
    - **Haladó:** backend az API-kulcshoz, több beszélgetés, kódkiemelés, saját dokumentumokból válaszoló asszisztens

49. **Retro OS Desktop** – Windows 95-szerű asztal a böngészőben
    - **Mit tanulunk:** ablakkezelés állapota (pozíció, sorrend, fókusz), húzás és átméretezés, mini appokból felépülő szerkezet, Context
    - **Kezdő:** asztal ikonokkal, Start menü, óra a tálcán
    - **Közép:** megnyitható, húzható, bezárható ablakok, a kattintott mindig felül
    - **Haladó:** átméretezés, kis méretre tétel a tálcára, mini appok (jegyzettömb, aknakereső, lejátszó), állapot mentése

50. **Real-Time Chat / Slack Clone** – Valós idejű chat csatornákkal
    - **Mit tanulunk:** WebSocket / Socket.io vagy Supabase Realtime, valós idejű állapot, backend, felhasználók és csatornák
    - **Kezdő:** chatfelület, üzenetek listája helyben
    - **Közép:** valós idejű üzenetek, felhasználónevek, időbélyegek
    - **Haladó:** csatornák, privát üzenetek, „gépel…” jelzés, online státusz, fájlküldés, saját Socket.io szerver

---

Kimaradt (ha cserélnél): Quiz / Trivia Game, Jigsaw Puzzle, Tic-Tac-Toe, Countdown Timer, Markdown Previewer, Bookmark Manager, Dictionary App, Survey Builder, Contact Book
