// The archive of the lesson's picture API: 50 entries, each drawn in code by art.js.
// `art` says what to draw; entries with `video: true` are short animations (media_type 'video').
// The texts were written for this lesson, in English and Hungarian.
export const PICTURES = [
  {
    id: 'orion-nebula',
    art: { kind: 'nebula', colors: ['#ff4f7b', '#ff9a6b', '#9fe8ff'], angle: -18 },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Orion Nebula, a Stellar Nursery',
      explanation:
        'Below the three stars of Orion’s Belt hangs a faint smudge that you can see without a telescope. It is the Orion Nebula, a cloud of gas and dust about 1,300 light-years away where new stars are being born. A handful of young, hot stars at its heart flood the cloud with ultraviolet light, and the hydrogen answers with a pinkish-red glow.',
    },
    hu: {
      title: 'Az Orion-köd, a csillagok bölcsője',
      explanation:
        'Az Orion övének három csillaga alatt halvány foltot látunk, akár távcső nélkül is. Ez az Orion-köd, egy nagyjából 1300 fényévre lévő gáz- és porfelhő, amelyben most is új csillagok születnek. A közepén néhány fiatal, forró csillag ultraibolya fénnyel árasztja el a felhőt, a hidrogén pedig rózsaszínes-vörös ragyogással válaszol.',
    },
  },
  {
    id: 'saturn',
    art: {
      kind: 'gasGiant',
      palette: ['#e8d6b0', '#d8bf90', '#cdb07c', '#f0e2c4', '#bfa070'],
      rings: true,
      axis: -14,
      ringTilt: 0.3,
      R: 190,
      smooth: true,
    },
    en: {
      title: 'The Rings of Saturn',
      explanation:
        'Saturn’s rings are made of countless pieces of ice and rock, from tiny grains to boulders as big as a house. The main rings are about 280,000 kilometres wide, yet in most places only about ten metres thick. Saturn itself is so light for its size that, in a big enough bathtub, it would float.',
    },
    hu: {
      title: 'A Szaturnusz gyűrűi',
      explanation:
        'A Szaturnusz gyűrűi számtalan jég- és kődarabból állnak, az apró szemcséktől a ház méretű sziklákig. A fő gyűrűk nagyjából 280 000 kilométer szélesek, a legtöbb helyen mégis csak körülbelül tíz méter vastagok. Maga a Szaturnusz a méretéhez képest olyan könnyű, hogy egy elég nagy kádban úszna a vízen.',
    },
  },
  {
    id: 'aurora-lake',
    art: { kind: 'aurora' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Northern Lights over a Lake',
      explanation:
        'Auroras appear when charged particles from the Sun are guided by Earth’s magnetic field into the upper atmosphere. There they collide with oxygen and nitrogen 100 to 300 kilometres above the ground and make them glow: oxygen gives the common green and the rarer, higher red, while nitrogen adds blue and purple fringes.',
    },
    hu: {
      title: 'Sarki fény egy tó fölött',
      explanation:
        'A sarki fény akkor jelenik meg, amikor a Napból érkező töltött részecskéket a Föld mágneses tere a felső légkörbe tereli. Ott 100–300 kilométeres magasságban oxigén- és nitrogénatomokkal ütköznek, és világításra késztetik őket: az oxigéntől származik a gyakori zöld és a ritkább, magasabban fénylő vörös, a nitrogén pedig kék és lila szegélyt ad.',
    },
  },
  {
    id: 'moon-phases',
    video: true,
    art: { kind: 'moonPhases' },
    en: {
      title: 'A Month of Moon Phases',
      explanation:
        'This short animation squeezes a whole lunar cycle of about 29.5 days into a few seconds. The Moon is always half lit by the Sun; as it orbits Earth we see different amounts of that sunlit half, from the thin crescent through first quarter and full Moon back to darkness. The dark part is still there, just in shadow.',
    },
    hu: {
      title: 'A holdfázisok egy hónapja',
      explanation:
        'Ez a rövid animáció egy teljes, nagyjából 29,5 napos holdciklust sűrít néhány másodpercbe. A Holdat mindig félig világítja meg a Nap; ahogy a Föld körül kering, ebből a megvilágított félből különböző részeket látunk, a vékony sarlótól az első negyeden és a teliholdon át újra a sötétségig. A sötét rész is ott van, csak árnyékban.',
    },
  },
  {
    id: 'andromeda',
    art: { kind: 'spiral', tilt: 0.32, angle: -32, size: 400, winding: 1.25 },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Andromeda Galaxy',
      explanation:
        'On a dark autumn night you can see the Andromeda Galaxy with your own eyes as a faint oval glow. The light reaching you left it about 2.5 million years ago. Andromeda is a spiral galaxy even larger than our Milky Way, and the two are approaching each other: in a few billion years they will merge into one giant galaxy.',
    },
    hu: {
      title: 'Az Androméda-galaxis',
      explanation:
        'Sötét őszi éjszakán az Androméda-galaxis szabad szemmel is látható halvány, ovális derengésként. A szemedbe érkező fény nagyjából 2,5 millió éve indult el onnan. Az Androméda a Tejútrendszernél is nagyobb spirálgalaxis, és a kettő közeledik egymáshoz: néhány milliárd év múlva egyetlen óriásgalaxissá olvadnak össze.',
    },
  },
  {
    id: 'total-eclipse',
    art: { kind: 'eclipse', mode: 'total' },
    en: {
      title: 'The Corona During a Total Eclipse',
      explanation:
        'The Moon is about 400 times smaller than the Sun, but also about 400 times closer, so it can cover the Sun exactly. During those few minutes of totality the sky darkens and the Sun’s corona appears: a pearly crown of gas heated to more than a million degrees. At the edge, small pink prominences peek out.',
    },
    hu: {
      title: 'A napkorona teljes napfogyatkozáskor',
      explanation:
        'A Hold nagyjából 400-szor kisebb a Napnál, de körülbelül 400-szor közelebb is van, ezért pontosan el tudja takarni. A teljes fogyatkozás néhány perce alatt elsötétül az ég, és előtűnik a napkorona: a több mint egymillió fokos gáz gyöngyházfényű koronája. A peremen apró rózsaszín protuberanciák kandikálnak ki.',
    },
  },
  {
    id: 'mars',
    art: { kind: 'rocky', ramp: ['#5a1e0c', '#8a3416', '#b5542a', '#cf7a44', '#e6a070'], freq: 0.009, features: 'mars' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Mars, the Rusty Planet',
      explanation:
        'Mars owes its red colour to iron oxide, better known as rust, in its dust and rocks. Its polar caps are made of water ice topped with frozen carbon dioxide, and they grow and shrink with the seasons. Mars also has the tallest volcano in the Solar System, Olympus Mons, about two and a half times as tall as Mount Everest.',
    },
    hu: {
      title: 'Mars, a rozsdás bolygó',
      explanation:
        'A Mars a porában és kőzeteiben lévő vas-oxidtól, vagyis rozsdától vörös. A sarki sapkái vízjégből állnak, tetejükön fagyott szén-dioxiddal, és az évszakokkal együtt nőnek és zsugorodnak. Itt van a Naprendszer legmagasabb vulkánja is, az Olympus Mons, amely nagyjából két és félszer olyan magas, mint a Mount Everest.',
    },
  },
  {
    id: 'eagle-pillars',
    art: { kind: 'pillars' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Pillars of Gas in the Eagle Nebula',
      explanation:
        'These towering columns of cold gas and dust are several light-years tall, yet they are slowly being worn away. Fierce light from nearby young stars evaporates their surfaces, while inside the densest knots gravity is still pulling material together into new stars. The Eagle Nebula lies about 7,000 light-years away in the constellation Serpens.',
    },
    hu: {
      title: 'Gázoszlopok a Sas-ködben',
      explanation:
        'Ezek a hideg gázból és porból álló, tornyosuló oszlopok több fényév magasak, mégis lassan pusztulnak. A közeli fiatal csillagok erős sugárzása elpárologtatja a felszínüket, a legsűrűbb csomókban viszont a gravitáció még mindig új csillagokká húzza össze az anyagot. A Sas-köd nagyjából 7000 fényévre van, a Kígyó csillagképben.',
    },
  },
  {
    id: 'comet-two-tails',
    art: { kind: 'comet' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'A Comet with Two Tails',
      explanation:
        'As a comet nears the Sun, its icy nucleus, only a few kilometres wide, starts to release gas and dust. The dust forms a broad, curved, yellowish tail that reflects sunlight. The gas is electrically charged and is pushed straight away from the Sun by the solar wind, forming a narrower blue tail. Both always point away from the Sun.',
    },
    hu: {
      title: 'Kétcsóvás üstökös',
      explanation:
        'Ahogy egy üstökös közeledik a Naphoz, a mindössze néhány kilométeres jeges magjából gáz és por kezd kiáramlani. A por széles, ívelt, sárgás csóvát alkot, amely a napfényt veri vissza. A gáz elektromosan töltött, ezért a napszél egyenesen a Nappal ellentétes irányba sodorja: ebből lesz a keskenyebb kék csóva. Mindkét csóva mindig a Nappal ellentétes irányba mutat.',
    },
  },
  {
    id: 'omega-centauri',
    art: { kind: 'globular' },
    en: {
      title: 'Omega Centauri: Ten Million Suns',
      explanation:
        'Omega Centauri is the largest globular cluster of the Milky Way, a ball of roughly ten million stars about 17,000 light-years away. Its stars are around 12 billion years old, almost as old as the universe. Some astronomers think it is the leftover core of a small galaxy that our Milky Way swallowed long ago.',
    },
    hu: {
      title: 'Omega Centauri: tízmillió nap',
      explanation:
        'Az Omega Centauri a Tejútrendszer legnagyobb gömbhalmaza: nagyjából tízmillió csillagból álló gömb, körülbelül 17 000 fényévre. A csillagai mintegy 12 milliárd évesek, majdnem olyan idősek, mint maga a világegyetem. Egyes csillagászok szerint egy kis galaxis megmaradt magja, amelyet a Tejútrendszer réges-régen bekebelezett.',
    },
  },
  {
    id: 'jupiter-spin',
    video: true,
    art: { kind: 'jupiterSpin' },
    en: {
      title: 'Jupiter Spins in Under Ten Hours',
      explanation:
        'Jupiter is the fastest-spinning planet: a day there lasts less than ten hours, even though it is eleven times wider than Earth. In this animation, watch the Great Red Spot ride across the disk while the four large moons discovered by Galileo in 1610 swing back and forth around the planet.',
    },
    hu: {
      title: 'A Jupiter kevesebb mint tíz óra alatt fordul meg',
      explanation:
        'A Jupiter a leggyorsabban forgó bolygó: egy nap ott kevesebb mint tíz óráig tart, pedig tizenegyszer szélesebb a Földnél. Ebben az animációban figyeld, ahogy a Nagy Vörös Folt átvonul a korongon, miközben a Galilei által 1610-ben felfedezett négy nagy hold ide-oda leng a bolygó körül.',
    },
  },
  {
    id: 'ring-nebula',
    art: { kind: 'ringNebula', size: 210, aspect: 0.78, angle: 28 },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Ring Nebula',
      explanation:
        'When a star like our Sun runs out of fuel, it gently puffs its outer layers into space. What remains at the centre is a white dwarf, so hot that its light makes the escaping gas glow. The Ring Nebula in Lyra, about 2,500 light-years away, is one of the best known of these planetary nebulae, named long ago because they looked like round planets in small telescopes.',
    },
    hu: {
      title: 'A Gyűrűs-köd',
      explanation:
        'Amikor egy Napunkhoz hasonló csillag kifogy az üzemanyagból, a külső rétegeit szelíden a világűrbe fújja. A közepén egy fehér törpe marad, amely olyan forró, hogy fénye ragyogásra készteti a távolodó gázt. A Lant csillagképben, nagyjából 2500 fényévre lévő Gyűrűs-köd az ilyen planetáris ködök egyik legismertebbje. A nevüket régen kapták, mert kis távcsőben kerek bolygóknak tűntek.',
    },
  },
  {
    id: 'blue-marble',
    art: { kind: 'earth' },
    en: {
      title: 'The Blue Marble',
      explanation:
        'Seen from space, our planet is mostly blue: oceans cover about 71 percent of its surface. White swirls of cloud drift over the water, and the atmosphere shows up only as a thin blue line along the edge. All the air we breathe fits in a layer that, compared with the size of Earth, is thinner than the skin of an apple.',
    },
    hu: {
      title: 'A kék golyó',
      explanation:
        'A világűrből nézve bolygónk többnyire kék: a felszínének nagyjából 71 százalékát óceánok borítják. A víz fölött fehér felhőörvények sodródnak, a légkör pedig csak vékony kék vonalként látszik a peremen. Az egész levegő, amelyet belélegzünk, olyan rétegben fér el, amely a Föld méretéhez képest vékonyabb egy alma héjánál.',
    },
  },
  {
    id: 'whirlpool',
    art: { kind: 'spiral', tilt: 0.82, angle: 10, size: 300, winding: 1.05, companion: true, y: 370 },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Whirlpool Galaxy and Its Companion',
      explanation:
        'The Whirlpool Galaxy shows two near-perfect spiral arms wound around a bright core. Its beauty has a cause: a smaller companion galaxy is passing by, and its gravity stirs up the gas in the arms, which then forms bright clusters of new stars. The pair is about 30 million light-years away in Canes Venatici.',
    },
    hu: {
      title: 'Az Örvény-galaxis és kísérője',
      explanation:
        'Az Örvény-galaxis két szinte tökéletes spirálkarja egy fényes mag köré tekeredik. A szépségének oka van: egy kisebb kísérőgalaxis halad el mellette, amelynek gravitációja felkavarja a karokban lévő gázt, és abból új csillagok fényes halmazai születnek. A páros nagyjából 30 millió fényévre van, a Vadászebek csillagképben.',
    },
  },
  {
    id: 'blood-moon',
    art: { kind: 'moon', mode: 'blood' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'A Blood Moon',
      explanation:
        'During a total lunar eclipse the Moon moves into Earth’s shadow, yet it does not disappear. Our atmosphere bends a little sunlight into the shadow, and on the way it filters out the blue, leaving red. In a sense, the Moon is lit by all of Earth’s sunrises and sunsets at once. Unlike a solar eclipse, it is perfectly safe to watch.',
    },
    hu: {
      title: 'Vérvörös Hold',
      explanation:
        'Teljes holdfogyatkozáskor a Hold belép a Föld árnyékába, mégsem tűnik el. A légkörünk egy kevés napfényt behajlít az árnyékba, és közben kiszűri belőle a kéket, így a vörös marad. Bizonyos értelemben a Holdat ilyenkor a Föld összes napkeltéje és napnyugtája világítja meg egyszerre. A napfogyatkozással ellentétben teljesen biztonságos nézni.',
    },
  },
  {
    id: 'veil-nebula',
    art: { kind: 'filaments' },
    en: {
      title: 'Threads of the Veil Nebula',
      explanation:
        'Thousands of years ago a star in Cygnus exploded as a supernova. Its blast wave is still racing outward and heating the thin gas in its path, which glows in delicate threads: oxygen shines blue-green and hydrogen red. The whole shell is so large that it spans an area of sky several times wider than the full Moon.',
    },
    hu: {
      title: 'A Fátyol-köd szálai',
      explanation:
        'Sok ezer éve a Hattyú csillagképben egy csillag szupernóvaként felrobbant. A lökéshullám ma is száguld kifelé, és felhevíti az útjába kerülő ritka gázt, amely finom szálakban világít: az oxigén kékeszölden, a hidrogén vörösen. Az egész héj olyan nagy, hogy az égen a telihold átmérőjének többszörösét foglalja el.',
    },
  },
  {
    id: 'io',
    art: { kind: 'rocky', ramp: ['#7a3a10', '#c06a1e', '#e6b23a', '#f2dc6a', '#fbf2c0'], freq: 0.012, features: 'io' },
    en: {
      title: 'Io, the Volcano Moon',
      explanation:
        'Jupiter’s moon Io is the most volcanically active world we know, with hundreds of active volcanoes. It is heated from inside by tides: as it orbits, Jupiter’s gravity squeezes and stretches it again and again. Sulphur from the eruptions paints the surface yellow, orange, red and white, like a giant pizza.',
    },
    hu: {
      title: 'Io, a vulkánok holdja',
      explanation:
        'A Jupiter Io nevű holdja a legaktívabb vulkanikus égitest, amelyet ismerünk: több száz működő vulkánja van. Belülről az árapály fűti: keringés közben a Jupiter gravitációja újra és újra összenyomja és megnyújtja. A kitörésekből származó kén sárgára, narancsra, vörösre és fehérre festi a felszínét, mint egy óriási pizzát.',
    },
  },
  {
    id: 'milky-way-core',
    art: { kind: 'milkyWay' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Heart of the Milky Way',
      explanation:
        'On summer nights far from city lights, the brightest part of the Milky Way rises above the southern horizon in Sagittarius. In that direction, about 26,000 light-years away, lies the centre of our galaxy. The dark rifts that split the glowing band are not gaps between stars but clouds of dust that block the light behind them.',
    },
    hu: {
      title: 'A Tejút szíve',
      explanation:
        'Nyári éjszakákon, távol a városok fényeitől, a Tejút legfényesebb része a déli látóhatár fölött, a Nyilas csillagképben emelkedik fel. Ebben az irányban, nagyjából 26 000 fényévre van galaxisunk központja. A világító sávot kettéhasító sötét hasadékok nem a csillagok közti üres helyek, hanem porfelhők, amelyek elnyelik a mögöttük lévő fényt.',
    },
  },
  {
    id: 'geminids',
    video: true,
    art: { kind: 'meteorShower' },
    en: {
      title: 'The Geminid Meteor Shower',
      explanation:
        'Every December, Earth passes through a trail of dust left by the asteroid 3200 Phaethon. The grains hit our atmosphere at about 35 kilometres per second and burn up as shooting stars. Because the trails all seem to start from the constellation Gemini, the shower is called the Geminids. Under a dark sky you may see more than a hundred per hour at the peak.',
    },
    hu: {
      title: 'A Geminidák meteorraj',
      explanation:
        'A Föld minden decemberben áthalad a 3200 Phaethon kisbolygó által hátrahagyott porfelhőn. A porszemek nagyjából 35 kilométer per másodperces sebességgel csapódnak a légkörbe, és hullócsillagként elégnek. Mivel a nyomok mind az Ikrek csillagképből látszanak indulni, a rajt Geminidáknak nevezik. Sötét égbolt alatt a csúcson óránként akár száznál is több meteort láthatsz.',
    },
  },
  {
    id: 'crab-nebula',
    art: { kind: 'crab' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Crab Nebula, Remains of a Star Seen in 1054',
      explanation:
        'In the year 1054, astronomers in China recorded a new star so bright that it was visible in daylight for weeks. Today, at that spot in Taurus, we find the Crab Nebula: the expanding debris of that supernova. At its centre spins a pulsar, a city-sized neutron star that turns about 30 times every second and powers the nebula’s eerie blue glow.',
    },
    hu: {
      title: 'A Rák-köd, egy 1054-ben látott csillag maradványa',
      explanation:
        '1054-ben kínai csillagászok egy új csillagot jegyeztek fel, amely olyan fényes volt, hogy hetekig nappal is látszott. A Bika csillagkép azon pontján ma a Rák-ködöt találjuk: annak a szupernóvának a táguló maradványát. A közepén egy pulzár forog, egy város méretű neutroncsillag, amely másodpercenként körülbelül harmincszor fordul meg, és ez táplálja a köd kísérteties kék fényét.',
    },
  },
  {
    id: 'venus',
    art: {
      kind: 'rocky',
      ramp: ['#a8844a', '#c8a462', '#dcc080', '#ecd8a4', '#f8eccc'],
      freq: '0.0025 0.012',
      contrast: 1.8,
      features: 'venus',
    },
    en: {
      title: 'Venus, the Veiled Planet',
      explanation:
        'Venus is almost the same size as Earth, but it is wrapped in a thick atmosphere of carbon dioxide and clouds of sulphuric acid. The trapped heat keeps its surface at about 465 °C, hotter than Mercury, even though Mercury is closer to the Sun. Venus also spins backwards, so slowly that one turn on its axis takes longer than one trip around the Sun.',
    },
    hu: {
      title: 'Vénusz, a fátyolos bolygó',
      explanation:
        'A Vénusz majdnem akkora, mint a Föld, de sűrű szén-dioxid-légkör és kénsavfelhők burkolják. A csapdába esett hő miatt a felszíne körülbelül 465 °C-os, forróbb a Merkúrnál, pedig a Merkúr közelebb van a Naphoz. A Vénusz ráadásul visszafelé forog, olyan lassan, hogy egy tengely körüli fordulata tovább tart, mint egy keringése a Nap körül.',
    },
  },
  {
    id: 'pleiades',
    art: { kind: 'openCluster' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Pleiades and Their Blue Veil',
      explanation:
        'The Pleiades, or Seven Sisters, is a young cluster of hot blue stars in Taurus, about 440 light-years away. Most people can count six or seven of them without a telescope. The blue haze around the brightest stars is not left over from their birth: the cluster is drifting through an unrelated cloud of dust, and the dust reflects the stars’ blue light.',
    },
    hu: {
      title: 'A Fiastyúk és kék fátyla',
      explanation:
        'A Fiastyúk (Plejádok) forró, kék csillagok fiatal halmaza a Bika csillagképben, nagyjából 440 fényévre. Szabad szemmel a legtöbben hat-hét csillagát látják. A legfényesebb csillagok körüli kék köd nem a születésükből maradt meg: a halmaz éppen áthalad egy tőle független porfelhőn, és a por a csillagok kék fényét veri vissza.',
    },
  },
  {
    id: 'earthrise',
    art: { kind: 'earthrise' },
    en: {
      title: 'Earthrise',
      explanation:
        'In December 1968 the astronauts of Apollo 8 became the first people to see Earth rise above the Moon’s horizon. There is a surprise hidden in this view: for someone standing on the Moon, Earth hardly moves in the sky, because the Moon always shows the same face to us. Earth only seems to rise when you are orbiting the Moon.',
    },
    hu: {
      title: 'Földkelte',
      explanation:
        '1968 decemberében az Apollo–8 űrhajósai voltak az első emberek, akik látták, ahogy a Föld felemelkedik a Hold látóhatára fölé. Ebben a látványban meglepetés rejlik: a Holdon álló ember egén a Föld szinte meg sem mozdul, mert a Hold mindig ugyanazt az oldalát fordítja felénk. A Föld csak akkor tűnik felkelőnek, ha a Hold körül keringünk.',
    },
  },
  {
    id: 'sombrero',
    art: { kind: 'sombrero' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Sombrero Galaxy',
      explanation:
        'Seen almost exactly edge-on, the Sombrero Galaxy looks like a wide-brimmed hat. The brim is a ring of dark dust silhouetted against a huge, glowing bulge of old stars. At its centre lies a black hole about a billion times heavier than the Sun. The Sombrero is about 30 million light-years away in Virgo.',
    },
    hu: {
      title: 'A Sombrero-galaxis',
      explanation:
        'Mivel szinte pontosan élével látjuk, a Sombrero-galaxis széles karimájú kalapra hasonlít. A karima egy sötét porgyűrű, amely kirajzolódik az idős csillagokból álló óriási, világító központi dudor előtt. A közepén egy nagyjából egymilliárd naptömegű fekete lyuk van. A Sombrero körülbelül 30 millió fényévre található, a Szűz csillagképben.',
    },
  },
  {
    id: 'aurora-dance',
    video: true,
    art: { kind: 'auroraDance' },
    en: {
      title: 'Dancing Curtains of Light',
      explanation:
        'Auroras rarely stand still. As gusts in the solar wind shake Earth’s magnetic field, the glowing curtains ripple, fold and pulse within seconds. During strong geomagnetic storms the aurora can be seen far from the poles: in May 2024 a red aurora lit up the sky even over Hungary.',
    },
    hu: {
      title: 'Táncoló fényfüggönyök',
      explanation:
        'A sarki fény ritkán áll egy helyben. Ahogy a napszél lökései megrázzák a Föld mágneses terét, a világító függönyök másodpercek alatt hullámzanak, gyűrődnek és lüktetnek. Erős geomágneses viharok idején a sarki fény a pólusoktól messze is látható: 2024 májusában vörös sarki fény világította meg az eget még Magyarország fölött is.',
    },
  },
  {
    id: 'jupiter',
    art: {
      kind: 'gasGiant',
      palette: ['#e9d8bf', '#d9b58c', '#c99a6e', '#f1e6d4', '#b88459', '#e3c9a4', '#a87048'],
      spot: true,
      storms: 10,
      stormColors: ['#ffffff', '#f6efe4', '#8a5a3a'],
      axis: 3,
    },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Jupiter and the Great Red Spot',
      explanation:
        'Jupiter is so large that more than 1,300 Earths would fit inside it. Its stripes are bands of clouds moving in opposite directions, driven by fierce winds. The Great Red Spot is a storm wider than Earth that has been raging for at least 150 years, although it has been slowly shrinking in recent decades.',
    },
    hu: {
      title: 'A Jupiter és a Nagy Vörös Folt',
      explanation:
        'A Jupiter olyan nagy, hogy több mint 1300 Föld elférne benne. A csíkjai ellentétes irányban mozgó felhősávok, amelyeket heves szelek hajtanak. A Nagy Vörös Folt egy a Földnél szélesebb vihar, amely legalább 150 éve tombol, bár az utóbbi évtizedekben lassan zsugorodik.',
    },
  },
  {
    id: 'carina-nebula',
    art: { kind: 'nebula', colors: ['#ff7a3d', '#ffb15c', '#8fd8ff'], angle: 12, bg: '#10142a', bright: 7 },
    en: {
      title: 'The Carina Nebula: Bigger and Brighter than Orion',
      explanation:
        'Visible from the Southern Hemisphere, the Carina Nebula is several times larger than the famous Orion Nebula. It is home to Eta Carinae, a pair of massive, restless stars that brightened dramatically in the 1840s and will one day end in a supernova. Dark lanes of dust cut through the glowing gas like rivers on a map.',
    },
    hu: {
      title: 'A Carina-köd: nagyobb és fényesebb az Orionnál',
      explanation:
        'A déli féltekéről látható Carina-köd többször akkora, mint a híres Orion-köd. Itt található az Éta Carinae, egy nagy tömegű, nyughatatlan csillagpár, amely az 1840-es években látványosan felfényesedett, és egyszer szupernóvaként fejezi be életét. A sötét porsávok úgy szelik át a világító gázt, mint folyók a térképet.',
    },
  },
  {
    id: 'earthshine',
    art: { kind: 'moon', mode: 'crescent' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Earthshine on a Crescent Moon',
      explanation:
        'A few days after New Moon, a thin crescent hangs in the evening sky, and if you look closely the rest of the disk glows faintly too. That ghostly light is sunlight reflected from Earth onto the Moon, and then back to our eyes. Leonardo da Vinci explained it correctly more than 500 years ago.',
    },
    hu: {
      title: 'Földfény a holdsarlón',
      explanation:
        'Néhány nappal újhold után vékony sarló látszik az esti égen, és ha jól megnézed, a korong többi része is halványan dereng. Ez a kísérteties fény a Földről a Holdra visszavert napfény, amely onnan újra visszaverődik a szemünkbe. Leonardo da Vinci már több mint 500 éve helyesen megmagyarázta.',
    },
  },
  {
    id: 'black-hole',
    art: { kind: 'blackHole' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Portrait of a Black Hole',
      explanation:
        'A black hole itself gives off no light, but the hot disk of gas spiralling into it does. Gravity near the black hole is so strong that it bends light from the far side of the disk, so we see a glowing ring above and below the dark shadow. This is an illustration; the real black hole at the centre of the Milky Way weighs about four million Suns.',
    },
    hu: {
      title: 'Egy fekete lyuk portréja',
      explanation:
        'A fekete lyuk maga nem bocsát ki fényt, a belé spirálozó forró gázkorong viszont igen. A fekete lyuk közelében olyan erős a gravitáció, hogy a korong túlsó oldaláról érkező fényt is elhajlítja, így a sötét árnyék fölött és alatt is világító gyűrűt látunk. Ez egy illusztráció; a Tejútrendszer közepén lévő valódi fekete lyuk nagyjából négymillió naptömegű.',
    },
  },
  {
    id: 'europa',
    art: {
      kind: 'rocky',
      ramp: ['#9a8a7a', '#bdb2a4', '#d8d2c6', '#ebe7de', '#f8f6f0'],
      freq: 0.014,
      contrast: 1.6,
      features: 'europa',
    },
    en: {
      title: 'Europa’s Cracked Ice',
      explanation:
        'The surface of Jupiter’s moon Europa is a shell of ice crossed by long reddish-brown cracks. Underneath, scientists are confident there is a global ocean of salty water that may hold about twice as much water as all of Earth’s oceans. That makes Europa one of the most promising places to search for life beyond Earth.',
    },
    hu: {
      title: 'Az Európé repedezett jege',
      explanation:
        'A Jupiter Európé nevű holdjának felszíne jégpáncél, amelyet hosszú, vörösesbarna repedések szelnek át. Alatta a kutatók szerint az egész holdat körbeérő sós óceán van, amelyben nagyjából kétszer annyi víz lehet, mint a Föld összes óceánjában. Ezért az Európé az egyik legígéretesebb hely a földön kívüli élet keresésére.',
    },
  },
  {
    id: 'star-trails',
    art: { kind: 'starTrails' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Star Trails Around the Pole Star',
      explanation:
        'Leave a camera pointing at the sky for a few hours and the stars draw circles. It is not the stars that move but our planet, turning once a day. All the trails centre on the celestial pole; in the north, the Pole Star sits so close to it that it barely leaves a trail at all. Every hour, the stars sweep about 15 degrees around the pole.',
    },
    hu: {
      title: 'Csillagnyomok a Sarkcsillag körül',
      explanation:
        'Ha néhány órára az égre irányított fényképezőgépet hagyunk, a csillagok köröket rajzolnak. Nem ők mozognak, hanem a bolygónk, amely naponta egyszer megfordul a tengelye körül. Minden nyom az égi pólus körül fut; északon a Sarkcsillag olyan közel van hozzá, hogy szinte nem is hagy nyomot. Óránként a csillagok körülbelül 15 fokot fordulnak el a pólus körül.',
    },
  },
  {
    id: 'helix-nebula',
    art: {
      kind: 'ringNebula',
      size: 290,
      aspect: 0.88,
      angle: -12,
      inner: '#5fd0ff',
      ring: '#ff9a6a',
      edge: '#ff3d55',
      knots: true,
    },
    en: {
      title: 'The Helix Nebula, an Eye in the Sky',
      explanation:
        'At about 650 light-years, the Helix Nebula is one of the closest planetary nebulae to Earth. Seen face-on, its layers of glowing gas look like a giant eye staring back at us. Close-up pictures reveal thousands of small comet-shaped knots around the inner edge, each one larger than our Solar System.',
    },
    hu: {
      title: 'A Csiga-köd, egy szem az égen',
      explanation:
        'Nagyjából 650 fényéves távolságával a Csiga-köd (Helix-köd) a Földhöz legközelebbi planetáris ködök egyike. Szemből látjuk, ezért a világító gázrétegek egy ránk néző óriási szemre emlékeztetnek. A közeli felvételeken a belső szélén több ezer kis, üstökös alakú csomó látszik, és mindegyik nagyobb a Naprendszerünknél.',
    },
  },
  {
    id: 'exoplanet-transit',
    video: true,
    art: { kind: 'transit' },
    en: {
      title: 'Finding Planets by Their Shadows',
      explanation:
        'Most known exoplanets were found without ever being seen directly. When a planet passes in front of its star, it blocks a tiny part of the starlight, and a sensitive telescope measures the dip in brightness. A Jupiter-sized planet dims a Sun-like star by about one percent; the animation exaggerates the dip. Space telescopes such as Kepler and TESS found thousands of planets this way.',
    },
    hu: {
      title: 'Bolygókeresés az árnyékuk alapján',
      explanation:
        'A legtöbb ismert exobolygót úgy fedezték fel, hogy közvetlenül sosem látták. Amikor egy bolygó elhalad a csillaga előtt, a csillagfény egy apró részét eltakarja, és egy érzékeny távcső kimutatja a fényesség csökkenését. Egy Jupiter méretű bolygó körülbelül egy százalékkal halványítja el a Naphoz hasonló csillagot; az animáció ezt eltúlozza. A Kepler és a TESS űrtávcső több ezer bolygót talált így.',
    },
  },
  {
    id: 'sun-prominence',
    art: { kind: 'sun' },
    en: {
      title: 'Loops of Fire on the Sun',
      explanation:
        'The Sun’s surface is a boiling sea of gas at about 5,500 °C, covered with bubbling cells called granules. Above it, magnetic fields lift glowing gas into huge loops and arches called prominences, which can be many times larger than Earth. Never look at the Sun directly: solar observers use special filters.',
    },
    hu: {
      title: 'Tűzhurkok a Napon',
      explanation:
        'A Nap felszíne körülbelül 5500 °C-os forrongó gáztenger, amelyet granuláknak nevezett pezsgő cellák borítanak. Fölötte a mágneses terek hatalmas hurkokba és ívekbe emelik az izzó gázt: ezek a protuberanciák, amelyek a Földnél sokszor nagyobbak is lehetnek. Soha ne nézz közvetlenül a Napba: a napészlelők speciális szűrőket használnak.',
    },
  },
  {
    id: 'uranus',
    art: {
      kind: 'gasGiant',
      palette: ['#a6e2e8', '#a2dee6', '#aae4ea'],
      streaks: false,
      rings: 'faint',
      axis: -82,
      ringTilt: 0.42,
      R: 200,
      smooth: true,
      ringColors: ['#cfe8ee', '#9ab8c4'],
    },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Uranus, the Sideways Planet',
      explanation:
        'Uranus is tipped over by about 98 degrees, so it rolls around the Sun on its side, probably because of a giant collision long ago. Each pole gets about 42 years of sunlight followed by 42 years of darkness. Methane in its atmosphere absorbs red light, giving the planet its soft blue-green colour. It also has thin, dark rings.',
    },
    hu: {
      title: 'Uránusz, az oldalán fekvő bolygó',
      explanation:
        'Az Uránusz tengelye nagyjából 98 fokkal megdőlt, így az oldalán gurulva kering a Nap körül, valószínűleg egy réges-régi óriási ütközés miatt. Mindkét pólusára nagyjából 42 évnyi napfény, majd 42 évnyi sötétség jut. A légkörében lévő metán elnyeli a vörös fényt, ettől lágy kékeszöld a színe. Vékony, sötét gyűrűi is vannak.',
    },
  },
  {
    id: 'rosette-nebula',
    art: { kind: 'rosette' },
    en: {
      title: 'The Rosette Nebula',
      explanation:
        'Like a cosmic flower, the Rosette Nebula surrounds a young star cluster about 5,000 light-years away in Monoceros. The cluster’s hot stars blow strong winds that have cleared a hollow in the middle of the cloud, leaving a ring of glowing petals about 130 light-years across.',
    },
    hu: {
      title: 'A Rozetta-köd',
      explanation:
        'A Rozetta-köd mint egy kozmikus virág veszi körül azt a fiatal csillaghalmazt, amely nagyjából 5000 fényévre van tőlünk, az Egyszarvú csillagképben. A halmaz forró csillagainak erős szele kifújta a felhő közepét, így egy körülbelül 130 fényév átmérőjű, világító szirmokból álló gyűrű maradt.',
    },
  },
  {
    id: 'twilight-conjunction',
    art: { kind: 'conjunction' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Planets Meet at Dusk',
      explanation:
        'After sunset, a slim crescent Moon and two bright planets gather low in the west. They only look close together. The Moon is less than half a million kilometres away, while the planets are hundreds of millions of kilometres beyond it, lined up by chance in the same direction. Astronomers call such meetings conjunctions.',
    },
    hu: {
      title: 'Bolygótalálkozó alkonyatkor',
      explanation:
        'Napnyugta után egy vékony holdsarló és két fényes bolygó gyűlik össze alacsonyan a nyugati égen. Csak látszólag vannak közel egymáshoz. A Hold kevesebb mint félmillió kilométerre van, a bolygók pedig több száz millió kilométerrel mögötte, véletlenül ugyanabba az irányba esve. Az ilyen találkozásokat a csillagászok együttállásnak nevezik.',
    },
  },
  {
    id: 'magellanic-cloud',
    art: { kind: 'irregular' },
    en: {
      title: 'The Large Magellanic Cloud',
      explanation:
        'From the Southern Hemisphere, the Large Magellanic Cloud looks like a detached piece of the Milky Way. It is actually a small satellite galaxy orbiting ours, about 160,000 light-years away. It contains the Tarantula Nebula, the most active star-forming region known in our Local Group of galaxies.',
    },
    hu: {
      title: 'A Nagy Magellán-felhő',
      explanation:
        'A déli féltekéről nézve a Nagy Magellán-felhő úgy fest, mint a Tejút egy leszakadt darabja. Valójában egy kis kísérőgalaxis, amely a miénk körül kering, nagyjából 160 000 fényévre. Itt van a Tarantula-köd, a Lokális Galaxiscsoport legaktívabb ismert csillagkeletkezési területe.',
    },
  },
  {
    id: 'pulsar',
    video: true,
    art: { kind: 'pulsar' },
    en: {
      title: 'A Pulsar, the Cosmic Lighthouse',
      explanation:
        'A pulsar is a neutron star, the collapsed core of an exploded star: only about 20 kilometres across, yet heavier than the Sun. It spins rapidly and sends beams of radiation from its magnetic poles. When a beam sweeps past Earth we detect a pulse, like the flash of a lighthouse. The first pulsar was discovered in 1967 by Jocelyn Bell Burnell.',
    },
    hu: {
      title: 'Pulzár, a kozmikus világítótorony',
      explanation:
        'A pulzár egy neutroncsillag, egy felrobbant csillag összeroskadt magja: mindössze körülbelül 20 kilométer átmérőjű, mégis nagyobb a tömege a Napénál. Gyorsan forog, és a mágneses pólusaiból sugárnyalábokat bocsát ki. Amikor egy nyaláb végigsöpör a Földön, egy impulzust észlelünk, mint egy világítótorony villanását. Az első pulzárt 1967-ben Jocelyn Bell Burnell fedezte fel.',
    },
  },
  {
    id: 'titan',
    art: {
      kind: 'rocky',
      ramp: ['#8a4a14', '#b0661e', '#c8842e', '#d9a044', '#e8bc66'],
      freq: 0.006,
      contrast: 1.3,
      haze: '#ffa040',
      features: 'titan',
    },
    en: {
      title: 'Titan, a Moon with Weather',
      explanation:
        'Saturn’s largest moon, Titan, is bigger than the planet Mercury and has a thick, hazy orange atmosphere of nitrogen. It is the only place besides Earth known to have rain, rivers, lakes and seas on its surface, but they are filled with liquid methane and ethane, at about −180 °C.',
    },
    hu: {
      title: 'Titán, a hold, ahol időjárás van',
      explanation:
        'A Szaturnusz legnagyobb holdja, a Titán nagyobb a Merkúr bolygónál, és vastag, ködös, narancsszínű nitrogénlégköre van. A Földön kívül ez az egyetlen ismert hely, ahol a felszínen eső, folyók, tavak és tengerek vannak, csakhogy ezekben folyékony metán és etán van, körülbelül −180 °C-on.',
    },
  },
  {
    id: 'pinwheel',
    art: { kind: 'spiral', tilt: 0.92, angle: 40, size: 340, arms: 4, winding: 0.75, armColor: '#c8d8ff' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'The Pinwheel Galaxy, Face-On',
      explanation:
        'We see the Pinwheel Galaxy from directly above, so its whole spiral pattern is on display. It is about 170,000 light-years across, much wider than the Milky Way, and lies about 21 million light-years away near the handle of the Big Dipper. Its arms are lopsided, probably pulled out of shape by encounters with smaller neighbours.',
    },
    hu: {
      title: 'A Szélkerék-galaxis szemből',
      explanation:
        'A Szélkerék-galaxist pontosan felülről látjuk, így a teljes spirálmintázata elénk tárul. Átmérője körülbelül 170 000 fényév, jóval nagyobb a Tejútrendszerénél, és nagyjából 21 millió fényévre van, a Göncölszekér rúdjának közelében. A karjai aszimmetrikusak, valószínűleg a kisebb szomszéd galaxisokkal való találkozások torzították el őket.',
    },
  },
  {
    id: 'diamond-ring',
    art: { kind: 'eclipse', mode: 'diamond' },
    en: {
      title: 'The Diamond Ring',
      explanation:
        'Just before and just after totality, the last bit of sunlight shines through a valley on the Moon’s rugged edge. Together with the thin glowing ring of the corona, this brilliant point looks like the diamond on a ring. It lasts only a second or two, and it is the signal for observers to put their eclipse glasses back on.',
    },
    hu: {
      title: 'A gyémántgyűrű',
      explanation:
        'Közvetlenül a teljes fogyatkozás előtt és után a napfény utolsó sugara a Hold egyenetlen peremének egy völgyén át ragyog elő. A korona vékony, világító gyűrűjével együtt ez a fényes pont olyan, mint egy gyűrű gyémántja. Csak egy-két másodpercig tart, és ez a jel arra, hogy a megfigyelők visszavegyék a napfogyatkozás-szemüveget.',
    },
  },
  {
    id: 'barnard-68',
    art: { kind: 'darkGlobule' },
    en: {
      title: 'Barnard 68: A Hole in the Sky?',
      explanation:
        'At first glance this looks like a hole in the star field, but it is a cloud: a cold, dense globule of gas and dust about 500 light-years away. It blocks the light of every star behind it. Near its edges some starlight leaks through, reddened by the dust, just as the setting Sun turns red in hazy air. One day the cloud may collapse into a new star.',
    },
    hu: {
      title: 'Barnard 68: lyuk az égen?',
      explanation:
        'Első ránézésre lyuknak tűnik a csillagmezőben, pedig egy felhő: nagyjából 500 fényévre lévő hideg, sűrű gáz- és porgomoly. Minden mögötte lévő csillag fényét elnyeli. A széleinél némi fény átszűrődik, és a por vörösre festi, ahogy a lemenő Nap is vörös lesz a párás levegőben. Egyszer talán új csillaggá omlik össze.',
    },
  },
  {
    id: 'neptune',
    art: {
      kind: 'gasGiant',
      palette: ['#2f5fd0', '#3a6ee0', '#2a52b8', '#4a7ee8', '#3466d8'],
      storms: 8,
      stormColors: ['#ffffff', '#1a2a78', '#e8f0ff'],
      axis: -6,
      R: 240,
      smooth: true,
    },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Neptune, World of Winds',
      explanation:
        'Neptune, the farthest planet from the Sun, has the fastest winds in the Solar System, reaching about 2,000 kilometres per hour. When Voyager 2 flew past in 1989, it saw a huge dark storm and bright clouds of methane ice. One trip around the Sun takes Neptune about 165 Earth years.',
    },
    hu: {
      title: 'Neptunusz, a szelek világa',
      explanation:
        'A Naptól legtávolabbi bolygón, a Neptunuszon fújnak a Naprendszer leggyorsabb szelei, nagyjából 2000 kilométer per órás sebességgel. Amikor 1989-ben a Voyager–2 elrepült mellette, egy hatalmas sötét vihart és metánjégből álló fényes felhőket látott. A Neptunusz egy Nap körüli keringése körülbelül 165 földi évig tart.',
    },
  },
  {
    id: 'antennae',
    art: { kind: 'collision' },
    en: {
      title: 'The Antennae Galaxies Collide',
      explanation:
        'Two spiral galaxies are crashing into each other here, about 45 million light-years away. Their stars rarely hit each other, because the space between them is enormous, but their gas clouds do collide, setting off bursts of star formation. Gravity has flung two long tails of stars out into space, like the antennae of an insect.',
    },
    hu: {
      title: 'Az ütköző Csáp-galaxisok',
      explanation:
        'Itt két spirálgalaxis ütközik egymással, nagyjából 45 millió fényévre. A csillagaik ritkán találják el egymást, mert hatalmas a köztük lévő tér, a gázfelhőik viszont összecsapnak, és ez a csillagkeletkezés kitöréseit indítja el. A gravitáció két hosszú csillagcsóvát dobott ki a világűrbe, mint egy rovar csápjait.',
    },
  },
  {
    id: 'full-moon',
    art: { kind: 'moon', mode: 'full' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Craters and Seas of the Full Moon',
      explanation:
        'The dark patches on the Moon are called maria, or seas, although they hold no water: they are vast plains of ancient, solidified lava. The brighter highlands are older and covered with craters. With no wind or rain, the Moon keeps the scars of impacts for billions of years, and the brightest craters are surrounded by rays of splashed-out rock.',
    },
    hu: {
      title: 'A telihold kráterei és tengerei',
      explanation:
        'A Hold sötét foltjait tengereknek (maria) nevezzük, bár egy csepp víz sincs bennük: ősi, megszilárdult lávából álló hatalmas síkságok. A világosabb felföldek idősebbek, és kráterek borítják őket. Szél és eső híján a Hold évmilliárdokig megőrzi a becsapódások nyomait, a legfényesebb krátereket pedig kifröccsent kőzetből álló sugarak veszik körül.',
    },
  },
  {
    id: 'm87-jet',
    art: { kind: 'elliptical' },
    en: {
      title: 'The Jet of Galaxy M87',
      explanation:
        'The giant elliptical galaxy M87 hides a black hole of about 6.5 billion solar masses: in 2019 it became the first black hole ever imaged. Part of the matter swirling around it is blasted away in a narrow jet travelling at nearly the speed of light. The jet stretches about 5,000 light-years out of the galaxy.',
    },
    hu: {
      title: 'Az M87 galaxis jetje',
      explanation:
        'Az M87 óriás elliptikus galaxis közepén egy nagyjából 6,5 milliárd naptömegű fekete lyuk rejtőzik: 2019-ben ez lett az első fekete lyuk, amelyről képet készítettek. A körülötte örvénylő anyag egy részét keskeny, majdnem fénysebességű sugárban (jetben) lövi ki. A jet mintegy 5000 fényévnyire nyúlik ki a galaxisból.',
    },
  },
  {
    id: 'annular-eclipse',
    art: { kind: 'eclipse', mode: 'annular' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'A Ring of Fire at Sunset',
      explanation:
        'When the Moon is near the farthest point of its orbit, it looks slightly smaller than the Sun and cannot cover it completely. During such an annular eclipse, a blazing ring of sunlight remains around the Moon’s dark disk. Because part of the Sun is always visible, it is never safe to watch without a proper solar filter.',
    },
    hu: {
      title: 'Tűzgyűrű naplementekor',
      explanation:
        'Amikor a Hold pályája legtávolabbi pontjának közelében jár, valamivel kisebbnek látszik a Napnál, és nem tudja teljesen eltakarni. Az ilyen gyűrűs napfogyatkozáskor a Hold sötét korongja körül ragyogó napfénygyűrű marad. Mivel a Nap egy része mindig látszik, megfelelő napszűrő nélkül soha nem biztonságos nézni.',
    },
  },
  {
    id: 'pluto',
    art: { kind: 'rocky', ramp: ['#6a4a3a', '#9a7a62', '#bfa184', '#d8c0a2', '#ecdcc4'], freq: 0.012, features: 'pluto' },
    en: {
      title: 'Pluto’s Heart',
      explanation:
        'When the New Horizons spacecraft flew past Pluto in July 2015, it revealed a huge, pale, heart-shaped region on its surface. Part of the heart is a vast plain of frozen nitrogen that slowly churns like a lava lamp. Pluto is now classed as a dwarf planet and has five known moons; the largest, Charon, is about half its size.',
    },
    hu: {
      title: 'A Plútó szíve',
      explanation:
        'Amikor 2015 júliusában a New Horizons űrszonda elrepült a Plútó mellett, egy hatalmas, világos, szív alakú területet fedezett fel a felszínén. A szív egy része fagyott nitrogénből álló óriási síkság, amely lassan forrong, mint egy lávalámpa. A Plútót ma törpebolygónak tekintjük; öt ismert holdja van, a legnagyobb, a Charon, nagyjából fele akkora, mint ő.',
    },
  },
  {
    id: 'betelgeuse',
    art: { kind: 'supergiant' },
    copyright: 'Rika Mentoring',
    en: {
      title: 'Betelgeuse, a Red Supergiant',
      explanation:
        'The orange-red star on Orion’s shoulder is Betelgeuse, a supergiant so large that, placed where our Sun is, it would reach beyond the orbit of Mars. Its surface boils with gigantic bubbles of gas. In 2019 and 2020 it dimmed noticeably, probably behind a cloud of dust it had puffed out. Within the next hundred thousand years, it will explode as a supernova.',
    },
    hu: {
      title: 'Betelgeuse, a vörös szuperóriás',
      explanation:
        'Az Orion vállán ragyogó narancsvörös csillag a Betelgeuse, egy olyan hatalmas szuperóriás, hogy a Nap helyére téve túlnyúlna a Mars pályáján. A felszínén óriási gázbuborékok fortyognak. 2019–2020-ban feltűnően elhalványult, valószínűleg egy általa kilökött porfelhő mögött. A következő százezer évben szupernóvaként fog felrobbanni.',
    },
  },
]
