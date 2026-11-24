// The 36 sample pictures of the gallery, the same as in the lesson's starter: three albums of 12
// (landscapes, shapes, patterns), in the same order, so the guide's checks ("Golden Hour", "1 / 36") match.
// The titles are the artworks' names and stay the same in both languages; the alt texts are translated.
// colors: the colors used in the picture, shown as small dots in the large view.

// Every picture is a real SVG file in ./photos. "?no-inline" keeps each one a separate file even though it is
// small: the browser downloads it like a photo, so lazy loading shows in the Network tab.
const FILES = import.meta.glob('./photos/*.svg', { eager: true, query: '?no-inline', import: 'default' })

function file(id) {
  return FILES[`./photos/${id}.svg`]
}

export const PHOTOS = [
  {
    id: 'golden-hour',
    src: file('golden-hour'),
    title: 'Golden Hour',
    alt: {
      en: 'A gold sun setting into a navy sea under a violet and magenta sky',
      hu: 'Arany nap bukik a sötétkék tengerbe, lila és magenta égbolt alatt',
    },
    album: 'landscapes',
    colors: ['#9A03B7', '#F70677', '#FEB800', '#070B1A', '#FD7701'],
  },
  {
    id: 'high-tide',
    src: file('high-tide'),
    title: 'High Tide',
    alt: {
      en: 'Blue, sky blue and deep teal waves under a small turquoise sun on a gold sky',
      hu: 'Kék, égkék és mélytürkiz hullámok, fölöttük kis türkiz nap az arany égen',
    },
    album: 'landscapes',
    colors: ['#FEB800', '#01C5AC', '#013E8E', '#0197D8', '#083F58'],
  },
  {
    id: 'night-mountains',
    src: file('night-mountains'),
    title: 'Night Mountains',
    alt: {
      en: 'Layered blue, violet, magenta and orange mountains under an orange moon at night',
      hu: 'Egymás mögött sorakozó kék, lila, magenta és narancssárga hegyek, fölöttük narancssárga hold az éjszakában',
    },
    album: 'landscapes',
    colors: ['#111E3D', '#FD7701', '#013E8E', '#9A03B7', '#F70677'],
  },
  {
    id: 'starry-hills',
    src: file('starry-hills'),
    title: 'Starry Hills',
    alt: {
      en: 'A gold crescent moon and small stars above violet, magenta and orange hills',
      hu: 'Arany holdsarló és apró csillagok lila, magenta és narancssárga dombok fölött',
    },
    album: 'landscapes',
    colors: ['#070B1A', '#FEB800', '#9A03B7', '#F70677', '#FD7701'],
  },
  {
    id: 'peacock-eye',
    src: file('peacock-eye'),
    title: 'Peacock Eye',
    alt: {
      en: 'Blue, turquoise, sky blue and gold circles inside each other on deep teal',
      hu: 'Egymásba rajzolt kék, türkiz, égkék és arany körök mélytürkiz alapon',
    },
    album: 'shapes',
    colors: ['#083F58', '#013E8E', '#01C5AC', '#0197D8', '#FEB800'],
  },
  {
    id: 'color-blocks',
    src: file('color-blocks'),
    title: 'Color Blocks',
    alt: {
      en: 'Blue, violet, magenta and orange rectangles on midnight blue',
      hu: 'Kék, lila, magenta és narancssárga téglalapok éjkék alapon',
    },
    album: 'shapes',
    colors: ['#111E3D', '#013E8E', '#9A03B7', '#F70677', '#FD7701'],
  },
  {
    id: 'confetti-grid',
    src: file('confetti-grid'),
    title: 'Confetti Grid',
    alt: {
      en: 'A grid of violet, magenta, orange and gold dots on navy',
      hu: 'Lila, magenta, narancssárga és arany pöttyök rácsban, sötétkék alapon',
    },
    album: 'shapes',
    colors: ['#070B1A', '#9A03B7', '#FD7701', '#F70677', '#FEB800'],
  },
  {
    id: 'sea-arches',
    src: file('sea-arches'),
    title: 'Sea Arches',
    alt: {
      en: 'Sky blue, blue, deep teal and turquoise arches inside each other on gold, with a blue sun',
      hu: 'Egymásba rajzolt égkék, kék, mélytürkiz és türkiz ívek és egy kék nap arany alapon',
    },
    album: 'shapes',
    colors: ['#FEB800', '#013E8E', '#0197D8', '#083F58', '#01C5AC'],
  },
  {
    id: 'neon-stripes',
    src: file('neon-stripes'),
    title: 'Neon Stripes',
    alt: {
      en: 'Blue, violet and midnight blue diagonal stripes on orange',
      hu: 'Kék, lila és éjkék ferde csíkok narancssárga alapon',
    },
    album: 'patterns',
    colors: ['#FD7701', '#013E8E', '#9A03B7', '#111E3D'],
  },
  {
    id: 'half-moons',
    src: file('half-moons'),
    title: 'Half Moons',
    alt: {
      en: 'Rows of gold, magenta and orange half circles on navy',
      hu: 'Arany, magenta és narancssárga félkörök sorai sötétkék alapon',
    },
    album: 'patterns',
    colors: ['#070B1A', '#FEB800', '#F70677', '#FD7701'],
  },
  {
    id: 'quarter-turns',
    src: file('quarter-turns'),
    title: 'Quarter Turns',
    alt: {
      en: 'Square tiles in deep teal, blue, sky blue, turquoise and gold, each with a quarter circle in another color',
      hu: 'Mélytürkiz, kék, égkék, türkiz és arany négyzetes csempék, mindegyiken egy más színű negyedkör',
    },
    album: 'patterns',
    colors: ['#083F58', '#0197D8', '#FEB800', '#013E8E', '#01C5AC'],
  },
  {
    id: 'zigzag',
    src: file('zigzag'),
    title: 'Zigzag',
    alt: {
      en: 'Orange, violet, magenta and blue zigzag bands on midnight blue',
      hu: 'Narancssárga, lila, magenta és kék cikcakkos sávok éjkék alapon',
    },
    album: 'patterns',
    colors: ['#111E3D', '#FD7701', '#9A03B7', '#F70677', '#013E8E'],
  },
  {
    id: 'lagoon-sunset',
    src: file('lagoon-sunset'),
    title: 'Lagoon Sunset',
    alt: {
      en: 'A gold sun setting into a deep teal sea under a blue and sky blue sky',
      hu: 'Arany nap bukik a mélytürkiz tengerbe, kék és égkék égbolt alatt',
    },
    album: 'landscapes',
    colors: ['#013E8E', '#0197D8', '#FEB800', '#083F58', '#01C5AC'],
  },
  {
    id: 'morning-swell',
    src: file('morning-swell'),
    title: 'Morning Swell',
    alt: {
      en: 'Blue, violet and midnight blue waves under a small orange sun on a magenta sky',
      hu: 'Kék, lila és éjkék hullámok, fölöttük kis narancssárga nap a magenta égen',
    },
    album: 'landscapes',
    colors: ['#F70677', '#FD7701', '#013E8E', '#9A03B7', '#111E3D'],
  },
  {
    id: 'ember-ridge',
    src: file('ember-ridge'),
    title: 'Ember Ridge',
    alt: {
      en: 'Layered violet, magenta, orange and gold mountains under a gold moon at night',
      hu: 'Egymás mögött sorakozó lila, magenta, narancssárga és arany hegyek, fölöttük arany hold az éjszakában',
    },
    album: 'landscapes',
    colors: ['#070B1A', '#FEB800', '#9A03B7', '#F70677', '#FD7701'],
  },
  {
    id: 'moonrise',
    src: file('moonrise'),
    title: 'Moonrise',
    alt: {
      en: 'A gold crescent moon and small stars above blue, sky blue and turquoise hills',
      hu: 'Arany holdsarló és apró csillagok kék, égkék és türkiz dombok fölött',
    },
    album: 'landscapes',
    colors: ['#083F58', '#FEB800', '#013E8E', '#0197D8', '#01C5AC'],
  },
  {
    id: 'ripples',
    src: file('ripples'),
    title: 'Ripples',
    alt: {
      en: 'Blue, magenta, violet and orange circles inside each other on midnight blue',
      hu: 'Egymásba rajzolt kék, magenta, lila és narancssárga körök éjkék alapon',
    },
    album: 'shapes',
    colors: ['#111E3D', '#013E8E', '#F70677', '#9A03B7', '#FD7701'],
  },
  {
    id: 'city-windows',
    src: file('city-windows'),
    title: 'City Windows',
    alt: {
      en: 'Violet, magenta, orange and gold rectangles on navy',
      hu: 'Lila, magenta, narancssárga és arany téglalapok sötétkék alapon',
    },
    album: 'shapes',
    colors: ['#070B1A', '#9A03B7', '#F70677', '#FD7701', '#FEB800'],
  },
  {
    id: 'bubble-wrap',
    src: file('bubble-wrap'),
    title: 'Bubble Wrap',
    alt: {
      en: 'A grid of blue, sky blue, turquoise and gold dots on deep teal',
      hu: 'Kék, égkék, türkiz és arany pöttyök rácsban, mélytürkiz alapon',
    },
    album: 'shapes',
    colors: ['#083F58', '#0197D8', '#FEB800', '#01C5AC', '#013E8E'],
  },
  {
    id: 'berry-arches',
    src: file('berry-arches'),
    title: 'Berry Arches',
    alt: {
      en: 'Violet, blue, midnight blue and magenta arches inside each other on magenta, with a blue sun',
      hu: 'Egymásba rajzolt lila, kék, éjkék és magenta ívek és egy kék nap magenta alapon',
    },
    album: 'shapes',
    colors: ['#F70677', '#013E8E', '#9A03B7', '#111E3D'],
  },
  {
    id: 'candy-stripes',
    src: file('candy-stripes'),
    title: 'Candy Stripes',
    alt: {
      en: 'Violet, magenta and navy diagonal stripes on gold',
      hu: 'Lila, magenta és sötétkék ferde csíkok arany alapon',
    },
    album: 'patterns',
    colors: ['#FEB800', '#9A03B7', '#F70677', '#070B1A'],
  },
  {
    id: 'moon-phases',
    src: file('moon-phases'),
    title: 'Moon Phases',
    alt: {
      en: 'Rows of gold, sky blue and turquoise half circles on deep teal',
      hu: 'Arany, égkék és türkiz félkörök sorai mélytürkiz alapon',
    },
    album: 'patterns',
    colors: ['#083F58', '#0197D8', '#01C5AC', '#FEB800'],
  },
  {
    id: 'fan-tiles',
    src: file('fan-tiles'),
    title: 'Fan Tiles',
    alt: {
      en: 'Square tiles in midnight blue, blue, violet, magenta and orange, each with a quarter circle in another color',
      hu: 'Éjkék, kék, lila, magenta és narancssárga négyzetes csempék, mindegyiken egy más színű negyedkör',
    },
    album: 'patterns',
    colors: ['#013E8E', '#F70677', '#111E3D', '#9A03B7', '#FD7701'],
  },
  {
    id: 'electric',
    src: file('electric'),
    title: 'Electric',
    alt: {
      en: 'Gold, magenta, orange and violet zigzag bands on navy',
      hu: 'Arany, magenta, narancssárga és lila cikcakkos sávok sötétkék alapon',
    },
    album: 'patterns',
    colors: ['#070B1A', '#FEB800', '#F70677', '#FD7701', '#9A03B7'],
  },
  {
    id: 'violet-evening',
    src: file('violet-evening'),
    title: 'Violet Evening',
    alt: {
      en: 'An orange sun setting into a midnight blue sea under a blue and violet sky',
      hu: 'Narancssárga nap bukik az éjkék tengerbe, kék és lila égbolt alatt',
    },
    album: 'landscapes',
    colors: ['#013E8E', '#9A03B7', '#FD7701', '#111E3D', '#F70677'],
  },
  {
    id: 'night-swim',
    src: file('night-swim'),
    title: 'Night Swim',
    alt: {
      en: 'Violet, magenta and orange waves under a small gold sun on a navy sky',
      hu: 'Lila, magenta és narancssárga hullámok, fölöttük kis arany nap a sötétkék égen',
    },
    album: 'landscapes',
    colors: ['#070B1A', '#FEB800', '#9A03B7', '#F70677', '#FD7701'],
  },
  {
    id: 'glacier-peaks',
    src: file('glacier-peaks'),
    title: 'Glacier Peaks',
    alt: {
      en: 'Layered blue, sky blue, turquoise and gold mountains under a gold moon at night',
      hu: 'Egymás mögött sorakozó kék, égkék, türkiz és arany hegyek, fölöttük arany hold az éjszakában',
    },
    album: 'landscapes',
    colors: ['#083F58', '#FEB800', '#013E8E', '#0197D8', '#01C5AC'],
  },
  {
    id: 'quiet-night',
    src: file('quiet-night'),
    title: 'Quiet Night',
    alt: {
      en: 'An orange crescent moon and small stars above blue, violet and magenta hills',
      hu: 'Narancssárga holdsarló és apró csillagok kék, lila és magenta dombok fölött',
    },
    album: 'landscapes',
    colors: ['#111E3D', '#FD7701', '#013E8E', '#9A03B7', '#F70677'],
  },
  {
    id: 'target-practice',
    src: file('target-practice'),
    title: 'Target Practice',
    alt: {
      en: 'Violet, orange, magenta and gold circles inside each other on navy',
      hu: 'Egymásba rajzolt lila, narancssárga, magenta és arany körök sötétkék alapon',
    },
    album: 'shapes',
    colors: ['#070B1A', '#9A03B7', '#FD7701', '#F70677', '#FEB800'],
  },
  {
    id: 'building-blocks',
    src: file('building-blocks'),
    title: 'Building Blocks',
    alt: {
      en: 'Blue, sky blue, turquoise and gold rectangles on deep teal',
      hu: 'Kék, égkék, türkiz és arany téglalapok mélytürkiz alapon',
    },
    album: 'shapes',
    colors: ['#083F58', '#013E8E', '#0197D8', '#01C5AC', '#FEB800'],
  },
  {
    id: 'polka-night',
    src: file('polka-night'),
    title: 'Polka Night',
    alt: {
      en: 'A grid of blue, violet, magenta and orange dots on midnight blue',
      hu: 'Kék, lila, magenta és narancssárga pöttyök rácsban, éjkék alapon',
    },
    album: 'shapes',
    colors: ['#111E3D', '#F70677', '#013E8E', '#FD7701', '#9A03B7'],
  },
  {
    id: 'sunset-arches',
    src: file('sunset-arches'),
    title: 'Sunset Arches',
    alt: {
      en: 'Magenta, violet, navy and orange arches inside each other on gold, with a violet sun',
      hu: 'Egymásba rajzolt magenta, lila, sötétkék és narancssárga ívek és egy lila nap arany alapon',
    },
    album: 'shapes',
    colors: ['#FEB800', '#9A03B7', '#F70677', '#070B1A', '#FD7701'],
  },
  {
    id: 'rain-stripes',
    src: file('rain-stripes'),
    title: 'Rain Stripes',
    alt: {
      en: 'Blue, sky blue and deep teal diagonal stripes on gold',
      hu: 'Kék, égkék és mélytürkiz ferde csíkok arany alapon',
    },
    album: 'patterns',
    colors: ['#FEB800', '#013E8E', '#0197D8', '#083F58'],
  },
  {
    id: 'tiny-bridges',
    src: file('tiny-bridges'),
    title: 'Tiny Bridges',
    alt: {
      en: 'Rows of orange, violet and magenta half circles on midnight blue',
      hu: 'Narancssárga, lila és magenta félkörök sorai éjkék alapon',
    },
    album: 'patterns',
    colors: ['#111E3D', '#F70677', '#FD7701', '#9A03B7'],
  },
  {
    id: 'pinwheels',
    src: file('pinwheels'),
    title: 'Pinwheels',
    alt: {
      en: 'Square tiles in navy, violet, magenta, orange and gold, each with a quarter circle in another color',
      hu: 'Sötétkék, lila, magenta, narancssárga és arany négyzetes csempék, mindegyiken egy más színű negyedkör',
    },
    album: 'patterns',
    colors: ['#F70677', '#FEB800', '#9A03B7', '#FD7701', '#070B1A'],
  },
  {
    id: 'ribbon-candy',
    src: file('ribbon-candy'),
    title: 'Ribbon Candy',
    alt: {
      en: 'Gold, sky blue, turquoise and blue zigzag bands on deep teal',
      hu: 'Arany, égkék, türkiz és kék cikcakkos sávok mélytürkiz alapon',
    },
    album: 'patterns',
    colors: ['#083F58', '#FEB800', '#0197D8', '#01C5AC', '#013E8E'],
  },
]
