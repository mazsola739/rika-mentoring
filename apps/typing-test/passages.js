// Practice passages per language. Plain ASCII punctuation, so every character can be typed on any keyboard
// (the Hungarian ones naturally contain accented letters).
export const PASSAGES = {
  en: [
    {
      id: 'morning',
      title: 'Morning city',
      text: 'The city wakes up slowly. A baker lifts the shutters, a cyclist rings her bell at the corner, and the first tram hums along the river. Coffee steams in paper cups while the sky turns from grey to gold. Nobody is in a hurry yet, and for a few quiet minutes the streets belong to the pigeons and the people who love early mornings.',
    },
    {
      id: 'habits',
      title: 'Small habits',
      text: 'Big changes rarely happen overnight. They grow from small habits repeated every day: reading ten pages before bed, writing one honest line in a journal, or practising a skill for twenty focused minutes. Each step feels tiny on its own, but together they build momentum. Progress is quiet at first, and then suddenly it is impossible to miss.',
    },
    {
      id: 'ocean',
      title: 'The deep ocean',
      text: 'The ocean covers more than seventy percent of our planet, yet most of it remains unexplored. Sunlight fades within a few hundred metres, and below that lies a cold, dark world full of strange creatures. Some fish make their own light, while giant squid hunt in the deep. Scientists say we know the surface of the Moon better than our own sea floor.',
    },
    {
      id: 'code',
      title: 'Code and coffee',
      text: 'Every app starts as a simple idea and a blank file. You write a component, refresh the browser and watch something appear on the screen. Then a bug shows up, you read the error message twice, and finally you spot the missing bracket. Building software is a long chain of these tiny victories, and each one teaches you something new.',
    },
  ],
  hu: [
    {
      id: 'morning',
      title: 'Reggeli város',
      text: 'A város lassan ébredezik. A pék felhúzza a redőnyt, a sarkon egy biciklis megcsengeti a csengőjét, a folyóparton pedig zümmögve elindul az első villamos. A papírpoharakban gőzölög a kávé, az ég szürkéből lassan aranyszínűre vált. Még senki sem siet, és néhány csendes percig az utcák a galamboké és a korán kelőké.',
    },
    {
      id: 'habits',
      title: 'Apró szokások',
      text: 'A nagy változások ritkán történnek egyik napról a másikra. Apró, mindennap megismételt szokásokból nőnek ki: tíz oldal olvasás lefekvés előtt, egy őszinte mondat a naplóba, vagy húsz perc összpontosított gyakorlás. Egy-egy lépés önmagában jelentéktelennek tűnik, együtt viszont lendületet adnak. A fejlődés eleinte csendes, aztán egyszer csak feltűnik.',
    },
    {
      id: 'ocean',
      title: 'A mély óceán',
      text: 'Az óceán bolygónk több mint hetven százalékát borítja, mégis nagy része feltáratlan. A napfény néhány száz méter mélyen elhalványul, alatta pedig hideg, sötét világ rejtőzik, tele különös élőlényekkel. Egyes halak maguk állítanak elő fényt, a mélyben óriáskalmárok vadásznak. A kutatók szerint a Hold felszínét jobban ismerjük, mint a saját tengerfenekünket.',
    },
    {
      id: 'code',
      title: 'Kód és kávé',
      text: 'Minden alkalmazás egy egyszerű ötlettel és egy üres fájllal kezdődik. Megírsz egy komponenst, frissíted a böngészőt, és figyeled, ahogy valami megjelenik a képernyőn. Aztán felbukkan egy hiba, kétszer is elolvasod a hibaüzenetet, végül észreveszed a hiányzó zárójelet. A szoftverfejlesztés apró győzelmek hosszú láncolata, és mindegyikből tanulsz valamit.',
    },
  ],
}

export const MODES = [
  { id: 'time30', seconds: 30 },
  { id: 'time60', seconds: 60 },
  { id: 'passage', seconds: null },
]

// Timed modes need enough text for fast typists, so the other passages follow the chosen one.
export function textFor(lang, index, mode) {
  const list = PASSAGES[lang]
  if (mode.seconds == null) return list[index].text
  return [...list.slice(index), ...list.slice(0, index)].map((p) => p.text).join(' ')
}
