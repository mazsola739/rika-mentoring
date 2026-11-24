// The meme templates of the lesson's own API: 20 original cartoon scenes drawn as SVG.
// Each one leaves room at the top and the bottom for the classic two captions (box_count: 2).
// No text inside the pictures, so they work in every language.

const INK = '#2b2a3a'
const outline = (width = 8, color = INK) =>
  `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`

function svg(width, height, background, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="${background}"/>${body}</svg>`
  )
}

// Small reusable pieces: eyes, blush, a drop of sweat, a heart, a soft shadow and a backdrop circle.
const eye = (x, y, r = 11, color = INK) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="#fff"/>`
const blush = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="9" fill="#ff8fa8" opacity=".65"/>`
const sweat = (x, y, s = 1) =>
  `<path d="M${x} ${y}c${8 * s} ${14 * s} ${14 * s} ${22 * s} ${14 * s} ${30 * s}a${14 * s} ${14 * s} 0 0 1 ${-28 * s} 0c0 ${-8 * s} ${6 * s} ${-16 * s} ${14 * s} ${-30 * s}z" fill="#7fd0ff" ${outline(5)}/>`
const heart = (x, y, s, color = '#ff6b8b') =>
  `<path d="M${x} ${y + s * 0.3}C${x} ${y} ${x - s * 0.5} ${y} ${x - s * 0.5} ${y + s * 0.3}C${x - s * 0.5} ${y + s * 0.6} ${x} ${y + s * 0.8} ${x} ${y + s}C${x} ${y + s * 0.8} ${x + s * 0.5} ${y + s * 0.6} ${x + s * 0.5} ${y + s * 0.3}C${x + s * 0.5} ${y} ${x} ${y} ${x} ${y + s * 0.3}Z" fill="${color}"/>`
const shadow = (x, y, rx, ry = 18) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${INK}" opacity=".15"/>`
const backdrop = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity=".4"/>`
// A thick line with an outline: stroke it twice, dark and wide first, colored and narrower on top.
const limb = (d, color, width = 40) =>
  `<path d="${d}" fill="none" ${outline(width + 16)}/><path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
// A question mark drawn as a path (no fonts in the picture).
const question = (x, y, s = 1, color = '#7a5cff', angle = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})"><path d="M-24 -30a26 26 0 1 1 36 24c-12 6-12 12-12 26" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"/><circle cx="0" cy="48" r="10" fill="${color}"/></g>`
// A cloud made of overlapping circles, outlined.
const puff = (circles, fill = '#ffffff') =>
  circles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 7}" fill="${INK}"/>`).join('') +
  circles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join('')

const TEMPLATE_LIST = [
  {
    id: 'tired-mug',
    name: { en: 'Tired Mug', hu: 'Fáradt bögre' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#ffd27a',
        backdrop(400, 430, 260) +
          shadow(390, 588, 180) +
          `<path d="M330 300c-26-30 26-52 0-84M395 290c-26-30 26-52 0-84M460 300c-26-30 26-52 0-84" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" opacity=".9"/>` +
          `<path d="M528 392h34a56 56 0 0 1 0 112h-34" fill="none" stroke="${INK}" stroke-width="40"/><path d="M528 392h34a56 56 0 0 1 0 112h-34" fill="none" stroke="#ffffff" stroke-width="22"/>` +
          `<rect x="250" y="330" width="280" height="250" rx="44" fill="#ffffff" ${outline()}/>` +
          `<ellipse cx="390" cy="350" rx="116" ry="14" fill="#6b3e26"/>` +
          `<rect x="254" y="520" width="272" height="26" fill="#ff7a59"/>` +
          `<path d="M318 440q26 18 52 0M410 440q26 18 52 0" fill="none" ${outline(9)}/>` +
          `<path d="M322 466q22 10 44 0M414 466q22 10 44 0" fill="none" ${outline(5)} opacity=".35"/>` +
          `<ellipse cx="390" cy="498" rx="16" ry="20" fill="${INK}"/>`,
      ),
  },
  {
    id: 'rubber-duck',
    name: { en: 'Rubber Duck Debugger', hu: 'Gumikacsa-hibakereső' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#9fe3ff',
        backdrop(400, 430, 280) +
          shadow(560, 592, 160, 16) +
          shadow(270, 592, 150, 16) +
          `<rect x="452" y="372" width="236" height="170" rx="14" fill="#3a3f58" ${outline()}/>` +
          `<rect x="470" y="390" width="200" height="134" rx="6" fill="#1e2238"/>` +
          `<rect x="486" y="408" width="70" height="11" rx="5" fill="#7fe3ff"/><rect x="504" y="430" width="120" height="11" rx="5" fill="#ffd23f"/>` +
          `<rect x="504" y="452" width="86" height="11" rx="5" fill="#ff7aa8"/><rect x="486" y="474" width="130" height="11" rx="5" fill="#9dffb0"/>` +
          `<rect x="504" y="496" width="60" height="11" rx="5" fill="#7fe3ff"/>` +
          `<path d="M430 542h276l22 34H408z" fill="#c9d2e3" ${outline()}/>` +
          `<path d="M150 470q-30-40 10-60" fill="#ffc21a" ${outline()}/>` +
          `<ellipse cx="270" cy="510" rx="125" ry="82" fill="#ffd23f" ${outline()}/>` +
          `<path d="M205 500q55-46 118 0q-55 40-118 0z" fill="#ffc21a" ${outline(6)}/>` +
          `<circle cx="330" cy="382" r="74" fill="#ffd23f" ${outline()}/>` +
          `<path d="M392 384q44 4 52 24q-32 16-58 4z" fill="#ff9a3c" ${outline(7)}/>` +
          eye(352, 366, 11) +
          `<path d="M266 372a66 66 0 0 1 124-22" fill="none" ${outline(12)}/>` +
          `<circle cx="268" cy="388" r="18" fill="#3a3f58" ${outline(6)}/>` +
          `<path d="M276 404q20 34 92 26" fill="none" ${outline(6)}/><circle cx="372" cy="430" r="8" fill="#3a3f58"/>`,
      ),
  },
  {
    id: 'cactus-hug',
    name: { en: 'Cactus Wants a Hug', hu: 'Ölelni vágyó kaktusz' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#ffe4ec',
        backdrop(400, 440, 270) +
          heart(200, 250, 54) +
          heart(612, 232, 44) +
          heart(640, 340, 30, '#ff9ab0') +
          shadow(400, 664, 130) +
          limb('M340 450H292q-30 0-30-30V340', '#5cc48a', 46) +
          limb('M460 420H508q30 0 30-30V300', '#5cc48a', 46) +
          `<rect x="330" y="290" width="140" height="300" rx="70" fill="#5cc48a" ${outline()}/>` +
          `<path d="M362 340l-10-6M440 350l10-6M356 500l-10-4M448 520l10-4M262 380l-12-4M538 340l12-4" ${outline(5, '#2f7a52')}/>` +
          `<circle cx="400" cy="284" r="16" fill="#ff6b8b" ${outline(6)}/><circle cx="380" cy="292" r="12" fill="#ff9ab0" ${outline(5)}/><circle cx="420" cy="292" r="12" fill="#ff9ab0" ${outline(5)}/>` +
          `<path d="M368 404q15-18 30 0M410 404q15-18 30 0" fill="none" ${outline(8)}/>` +
          blush(362, 432) +
          blush(446, 432) +
          `<path d="M384 440q20 20 40 0" fill="none" ${outline(8)}/>` +
          `<path d="M300 570H500L480 670H320Z" fill="#e07a4f" ${outline()}/>` +
          `<rect x="286" y="548" width="228" height="36" rx="10" fill="#f08a5d" ${outline()}/>`,
      ),
  },
  {
    id: 'toast-landing',
    name: { en: 'Butter Side Down', hu: 'Vajas oldalával lefelé' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#cfe8ff',
        backdrop(400, 400, 260) +
          `<rect y="640" width="800" height="160" fill="#e9d4b8"/><path d="M0 640H800" ${outline(6)}/>` +
          shadow(400, 664, 120, 14) +
          `<path d="M220 330a190 190 0 0 1 110-130M590 470a190 190 0 0 1-90 120" fill="none" ${outline(7)} stroke-dasharray="2 18"/>` +
          `<path d="M248 240l-14-28M262 226l-6-30M536 210l14-26" ${outline(6)} opacity=".5"/>` +
          `<g transform="rotate(158 400 420)">` +
          `<path d="M290 330q0-70 64-70q46-30 92 0q64 0 64 70v200H290z" fill="#d9914a" ${outline()}/>` +
          `<path d="M314 340q0-52 50-52q36-24 72 0q50 0 50 52v168H314z" fill="#f7d9a0"/>` +
          `<rect x="350" y="330" width="100" height="60" rx="10" fill="#fff2a8" ${outline(6)}/>` +
          `</g>` +
          `<path d="M352 372q14-12 28 0M412 358q14-12 28 0" fill="none" ${outline(7)}/>` +
          `<ellipse cx="404" cy="410" rx="13" ry="11" fill="${INK}"/>` +
          sweat(462, 318),
      ),
  },
  {
    id: 'penguin-ice',
    name: { en: 'Thin Ice', hu: 'Vékony jég' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#d9f2ff',
        `<rect y="540" width="800" height="260" fill="#2a7fbf"/>` +
          `<path d="M60 610q30-12 60 0t60 0M560 650q30-12 60 0t60 0M120 720q30-12 60 0t60 0M520 740q30-12 60 0t60 0" fill="none" stroke="#7fc8ff" stroke-width="6" stroke-linecap="round"/>` +
          `<path d="M230 548L570 540L600 580L200 586Z" fill="#f4fbff" ${outline()}/>` +
          `<path d="M408 544l-14 14l18 10l-10 14" fill="none" stroke="#2a7fbf" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<ellipse cx="370" cy="546" rx="30" ry="12" fill="#ff9a3c" ${outline(6)}/><ellipse cx="430" cy="546" rx="30" ry="12" fill="#ff9a3c" ${outline(6)}/>` +
          `<ellipse cx="318" cy="440" rx="22" ry="62" transform="rotate(20 318 440)" fill="#26324a" ${outline()}/>` +
          `<ellipse cx="482" cy="440" rx="22" ry="62" transform="rotate(-20 482 440)" fill="#26324a" ${outline()}/>` +
          `<ellipse cx="400" cy="430" rx="80" ry="112" fill="#26324a" ${outline()}/>` +
          `<ellipse cx="400" cy="458" rx="54" ry="80" fill="#ffffff"/>` +
          `<circle cx="372" cy="380" r="18" fill="#fff"/><circle cx="428" cy="380" r="18" fill="#fff"/>` +
          `<circle cx="376" cy="390" r="8" fill="${INK}"/><circle cx="424" cy="390" r="8" fill="${INK}"/>` +
          `<path d="M386 410h28l-14 18z" fill="#ff9a3c" ${outline(5)}/>` +
          sweat(484, 330),
      ),
  },
  {
    id: 'wilting-plant',
    name: { en: 'Forgot to Water', hu: 'Elfelejtett locsolás' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#f3efe6',
        backdrop(400, 440, 270) +
          shadow(400, 664, 120) +
          `<path d="M400 520C396 420 418 360 486 340" fill="none" ${outline(22)}/><path d="M400 520C396 420 418 360 486 340" fill="none" stroke="#8fbf5a" stroke-width="10" stroke-linecap="round"/>` +
          `<path d="M402 470q-60-6-74 60q50-4 74-60z" fill="#8fbf5a" ${outline(7)}/>` +
          `<path d="M408 410q60 0 66 66q-52-10-66-66z" fill="#7aab48" ${outline(7)}/>` +
          `<g transform="rotate(30 500 370)"><circle cx="490" cy="396" r="22" fill="#ffb3c6" ${outline(6)}/><circle cx="520" cy="384" r="22" fill="#ffb3c6" ${outline(6)}/>` +
          `<circle cx="512" cy="414" r="22" fill="#ffb3c6" ${outline(6)}/><circle cx="505" cy="398" r="14" fill="#ffd23f" ${outline(5)}/></g>` +
          `<g transform="rotate(-35 590 520)"><path d="M590 500q-40 4-44 44q36-4 44-44z" fill="#c8b35a" ${outline(6)}/></g>` +
          `<path d="M612 470l10-14M628 494l16-6" ${outline(5)} opacity=".5"/>` +
          `<path d="M310 520H490L470 660H330Z" fill="#7fb3d5" ${outline()}/>` +
          `<rect x="296" y="500" width="208" height="34" rx="10" fill="#93c4e3" ${outline()}/>` +
          `<path d="M356 584q12-10 24 0M420 584q12-10 24 0" fill="none" ${outline(7)}/>` +
          `<path d="M378 628q22-16 44 0" fill="none" ${outline(7)}/>`,
      ),
  },
  {
    id: 'rain-cloud',
    name: { en: 'Cloud with an Umbrella', hu: 'Esernyős felhő' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#bfe3f2',
        `<path d="M420 250V340" ${outline(10)}/>` +
          `<path d="M250 254A170 120 0 0 1 590 254Q548 230 505 254Q462 230 420 254Q378 230 335 254Q292 230 250 254Z" fill="#ff6b8b" ${outline()}/>` +
          `<path d="M420 136V120" ${outline(10)}/>` +
          puff([
            [320, 410, 78],
            [420, 360, 98],
            [520, 405, 76],
            [430, 440, 86],
            [360, 450, 64],
          ]) +
          `<path d="M392 412q12-10 24 0M444 412q12-10 24 0" fill="none" ${outline(7)}/>` +
          blush(380, 438) +
          blush(482, 438) +
          `<path d="M418 446q12 10 24 0" fill="none" ${outline(6)}/>` +
          [
            [300, 560],
            [360, 620],
            [430, 570],
            [500, 630],
            [550, 560],
            [330, 690],
            [470, 700],
          ]
            .map(([x, y]) => `<path d="M${x} ${y}c6 10 10 16 10 22a10 10 0 0 1-20 0c0-6 4-12 10-22z" fill="#3a8fd8"/>`)
            .join(''),
      ),
  },
  {
    id: 'snail-speed',
    name: { en: 'Full Speed Snail', hu: 'Csiga teljes gőzzel' },
    width: 800,
    height: 600,
    draw: () =>
      svg(
        800,
        600,
        '#d6f5d6',
        `<rect y="456" width="800" height="144" fill="#a8dba0"/><path d="M0 456H800" ${outline(6)}/>` +
          `<path d="M70 300H220M110 350H250M60 400H230" ${outline(8)} opacity=".45"/>` +
          puff(
            [
              [250, 440, 18],
              [222, 430, 13],
              [200, 444, 10],
            ],
            '#eef5ee',
          ) +
          `<path d="M300 452H560Q620 452 622 400Q624 352 590 344Q566 340 560 372V420H300Q276 420 276 436Q276 452 300 452Z" fill="#ffcf8a" ${outline()}/>` +
          `<path d="M574 350L560 280M600 352L618 284" ${outline(7)}/>` +
          eye(558, 276, 13) +
          eye(620, 280, 13) +
          `<path d="M584 398q14 10 28 0" fill="none" ${outline(6)}/>` +
          `<circle cx="420" cy="330" r="106" fill="#ff8a5b" ${outline()}/>` +
          `<path d="M420 330m6 0a6 6 0 1 1-12 0a18 18 0 0 1 36 0a32 32 0 0 1-64 0a50 50 0 0 1 100 0a70 70 0 0 1-140 0" fill="none" ${outline(7)}/>` +
          `<path d="M330 276q90-60 180 0" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity=".7"/>`,
      ),
  },
  {
    id: 'robot-confused',
    name: { en: 'Confused Robot', hu: 'Tanácstalan robot' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#e8e0ff',
        backdrop(400, 440, 270) +
          question(590, 250, 1.3, '#7a5cff', 14) +
          question(210, 300, 0.9, '#a58cff', -16) +
          shadow(400, 664, 140) +
          limb('M300 520Q230 520 230 460Q230 400 270 372', '#b8c4dc', 34) +
          limb('M500 520Q560 540 560 600', '#b8c4dc', 34) +
          `<rect x="300" y="470" width="200" height="180" rx="26" fill="#b8c4dc" ${outline()}/>` +
          `<circle cx="352" cy="540" r="12" fill="#ff6b8b"/><circle cx="400" cy="540" r="12" fill="#ffd23f"/><circle cx="448" cy="540" r="12" fill="#5cc48a"/>` +
          `<rect x="336" y="580" width="128" height="16" rx="8" fill="#8f9bb5"/>` +
          `<path d="M400 280V228" ${outline(9)}/><circle cx="400" cy="220" r="16" fill="#ff6b8b" ${outline(7)}/>` +
          `<rect x="270" y="280" width="260" height="196" rx="38" fill="#d7deee" ${outline()}/>` +
          `<rect x="300" y="310" width="200" height="136" rx="22" fill="#1e2238"/>` +
          `<circle cx="360" cy="372" r="18" fill="#7fe3ff"/><circle cx="442" cy="376" r="10" fill="#7fe3ff"/>` +
          `<path d="M424 340L466 328" stroke="#7fe3ff" stroke-width="8" stroke-linecap="round"/>` +
          `<path d="M356 416q10-10 20 0t20 0t20 0t20 0" fill="none" stroke="#7fe3ff" stroke-width="6" stroke-linecap="round"/>` +
          `<circle cx="270" cy="372" r="22" fill="#b8c4dc" ${outline()}/>`,
      ),
  },
  {
    id: 'lonely-sock',
    name: { en: 'The Lonely Sock', hu: 'A magányos zokni' },
    width: 800,
    height: 600,
    draw: () =>
      svg(
        800,
        600,
        '#fff6d6',
        `<path d="M30 190Q400 260 770 190" fill="none" ${outline(6)}/>` +
          `<clipPath id="sock"><path d="M330 218V420Q330 476 386 476H470Q506 476 506 442Q506 408 470 408H404V218Z"/></clipPath>` +
          `<g clip-path="url(#sock)"><rect x="300" y="200" width="240" height="300" fill="#ff9a3c"/>` +
          `<path d="M300 270H540M300 330H540M300 390H540" stroke="#5b8def" stroke-width="24"/><rect x="300" y="430" width="240" height="60" fill="#ffd8b0"/>` +
          `<rect x="300" y="200" width="240" height="44" fill="#ffffff"/><path d="M342 218v26M356 218v26M370 218v26M384 218v26M398 218v26" stroke="#d8d0c0" stroke-width="4"/></g>` +
          `<path d="M330 218V420Q330 476 386 476H470Q506 476 506 442Q506 408 470 408H404V218Z" fill="none" ${outline()}/>` +
          `<rect x="336" y="200" width="20" height="44" rx="6" fill="#c7a27a" ${outline(5)}/><rect x="380" y="204" width="20" height="44" rx="6" fill="#c7a27a" ${outline(5)}/>` +
          `<path d="M560 226V420Q560 476 616 476H700Q736 476 736 442Q736 408 700 408H634V226" fill="none" stroke="${INK}" stroke-width="5" stroke-dasharray="14 14" opacity=".45"/>` +
          `<rect x="566" y="212" width="20" height="44" rx="6" fill="#c7a27a" ${outline(5)}/><rect x="610" y="216" width="20" height="44" rx="6" fill="#c7a27a" ${outline(5)}/>` +
          question(680, 330, 0.7, '#5b8def', 10),
      ),
  },
  {
    id: 'last-slice',
    name: { en: 'The Last Slice', hu: 'Az utolsó szelet' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#ffe0c2',
        backdrop(400, 440, 270) +
          `<ellipse cx="400" cy="590" rx="260" ry="72" fill="#ffffff" ${outline()}/><ellipse cx="400" cy="584" rx="196" ry="48" fill="#f1ede6"/>` +
          `<path d="M262 318Q400 270 538 318L400 600Z" fill="#ffd55a" ${outline()}/>` +
          `<path d="M262 318Q400 270 538 318" fill="none" stroke="${INK}" stroke-width="52" stroke-linecap="round"/><path d="M262 318Q400 270 538 318" fill="none" stroke="#d88a3a" stroke-width="36" stroke-linecap="round"/>` +
          `<path d="M300 380q-4 30 8 40q10-8 4-36zM498 392q6 34-6 42q-12-10-4-40z" fill="#ffd55a" ${outline(5)}/>` +
          `<circle cx="360" cy="370" r="20" fill="#d9473a" ${outline(5)}/><circle cx="452" cy="380" r="18" fill="#d9473a" ${outline(5)}/><circle cx="410" cy="500" r="16" fill="#d9473a" ${outline(5)}/>` +
          `<circle cx="374" cy="430" r="16" fill="#fff"/><circle cx="426" cy="430" r="16" fill="#fff"/><circle cx="382" cy="432" r="7" fill="${INK}"/><circle cx="434" cy="432" r="7" fill="${INK}"/>` +
          `<path d="M386 466q14-8 28 0" fill="none" ${outline(6)}/>` +
          sweat(470, 410, 0.8) +
          `<circle cx="300" cy="604" r="5" fill="#d88a3a"/><circle cx="520" cy="610" r="4" fill="#d88a3a"/><circle cx="488" cy="620" r="3" fill="#d88a3a"/>`,
      ),
  },
  {
    id: 'laptop-ghost',
    name: { en: 'Ghost in the Laptop', hu: 'Szellem a laptopban' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#2a2350',
        `<circle cx="400" cy="450" r="300" fill="#7fe3ff" opacity=".12"/><circle cx="400" cy="450" r="190" fill="#7fe3ff" opacity=".12"/>` +
          `<circle cx="140" cy="140" r="4" fill="#fff"/><circle cx="660" cy="180" r="5" fill="#fff"/><circle cx="700" cy="560" r="3" fill="#fff"/><circle cx="110" cy="520" r="4" fill="#fff"/>` +
          `<rect x="220" y="330" width="360" height="240" rx="16" fill="#8a83b8" ${outline(8, '#0e0b1f')}/>` +
          `<rect x="242" y="352" width="316" height="196" rx="8" fill="#7fe3ff"/>` +
          `<path d="M310 548V380Q310 270 400 270Q490 270 490 380V548Z" fill="#ffffff" ${outline(8, '#0e0b1f')}/>` +
          `<path d="M314 430Q250 400 240 340M486 430Q550 400 560 340" fill="none" stroke="#0e0b1f" stroke-width="38" stroke-linecap="round"/>` +
          `<path d="M314 430Q250 400 240 340M486 430Q550 400 560 340" fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round"/>` +
          `<ellipse cx="372" cy="370" rx="14" ry="20" fill="#0e0b1f"/><ellipse cx="428" cy="370" rx="14" ry="20" fill="#0e0b1f"/>` +
          `<ellipse cx="400" cy="430" rx="20" ry="26" fill="#0e0b1f"/>` +
          `<path d="M190 570H610L650 610H150Z" fill="#b3acd9" ${outline(8, '#0e0b1f')}/>`,
      ),
  },
  {
    id: 'counting-sheep',
    name: { en: 'Counting Sheep', hu: 'Bárányszámolás' },
    width: 800,
    height: 600,
    draw: () =>
      svg(
        800,
        600,
        '#1f2a5a',
        `<circle cx="660" cy="110" r="48" fill="#ffe9a8"/><circle cx="638" cy="96" r="44" fill="#1f2a5a"/>` +
          [
            [100, 80],
            [220, 140],
            [340, 60],
            [500, 120],
            [740, 220],
            [560, 50],
            [160, 230],
          ]
            .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#ffffff" opacity=".85"/>`)
            .join('') +
          `<path d="M0 470Q400 430 800 470V600H0Z" fill="#2f4a3a"/>` +
          `<rect x="372" y="370" width="18" height="110" fill="#c8a070" ${outline(6)}/><rect x="470" y="370" width="18" height="110" fill="#c8a070" ${outline(6)}/>` +
          `<rect x="340" y="392" width="180" height="16" fill="#c8a070" ${outline(6)}/><rect x="340" y="428" width="180" height="16" fill="#c8a070" ${outline(6)}/>` +
          `<path d="M360 300l-20 30M380 304l-10 34M480 296l24 26M466 300l14 34" ${outline(10)}/>` +
          puff([
            [400, 270, 44],
            [450, 262, 46],
            [480, 285, 36],
            [372, 290, 34],
            [430, 296, 40],
          ]) +
          `<ellipse cx="520" cy="258" rx="30" ry="24" fill="#3a3a4a" ${outline(6)}/>` +
          `<circle cx="530" cy="252" r="5" fill="#fff"/>` +
          `<path d="M250 230q60-70 140-40" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="4 16" stroke-linecap="round" opacity=".7"/>` +
          `<path d="M150 470v32M178 470v32M220 470v32M246 470v32" ${outline(10)}/>` +
          puff([
            [175, 440, 36],
            [215, 436, 38],
            [196, 462, 30],
          ]) +
          `<ellipse cx="252" cy="430" rx="24" ry="20" fill="#3a3a4a" ${outline(6)}/>` +
          `<circle cx="260" cy="426" r="4" fill="#fff"/>`,
      ),
  },
  {
    id: 'volcano-mood',
    name: { en: 'About to Erupt', hu: 'Mindjárt kitör' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#ffd9b8',
        backdrop(400, 420, 280) +
          `<rect y="640" width="800" height="160" fill="#c98b5e"/><path d="M0 640H800" ${outline(6)}/>` +
          puff(
            [
              [360, 250, 34],
              [410, 214, 42],
              [462, 246, 32],
            ],
            '#f2f2f2',
          ) +
          `<path d="M150 650L320 330H480L650 650Z" fill="#8a5a44" ${outline()}/>` +
          `<path d="M320 330H480L466 356Q400 372 334 356Z" fill="#ff5a2a" ${outline(6)}/>` +
          `<path d="M452 352q10 50 0 90q-12 20-20 0q-6-40 4-86" fill="#ff7a2a" ${outline(6)}/>` +
          `<path d="M334 440l50 20M466 440l-50 20" ${outline(9)}/>` +
          eye(370, 478, 11) +
          eye(430, 478, 11) +
          `<rect x="346" y="526" width="108" height="40" rx="10" fill="#ffffff" ${outline(7)}/>` +
          `<path d="M373 526v40M400 526v40M427 526v40" ${outline(5)}/>`,
      ),
  },
  {
    id: 'low-battery',
    name: { en: 'Low Battery', hu: 'Lemerülőben' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#e9f7ef',
        backdrop(400, 440, 270) +
          shadow(400, 676, 140) +
          `<path d="M520 640Q620 660 640 600Q656 548 600 560" fill="none" ${outline(10)}/>` +
          `<rect x="576" y="540" width="44" height="34" rx="6" fill="#b8c0cc" ${outline(6)}/><path d="M586 540v-18M610 540v-18" ${outline(6)}/>` +
          `<rect x="356" y="244" width="88" height="40" rx="10" fill="#b8c0cc" ${outline()}/>` +
          `<rect x="290" y="276" width="220" height="380" rx="32" fill="#ffffff" ${outline()}/>` +
          `<rect x="314" y="590" width="172" height="44" rx="10" fill="#ff4d4d"/>` +
          `<path d="M338 418h48M414 418h48" ${outline(8)}/>` +
          `<path d="M340 436q22 14 44 0M416 436q22 14 44 0" fill="none" ${outline(5)} opacity=".4"/>` +
          `<path d="M366 500q10-8 20 0t20 0t20 0" fill="none" ${outline(7)}/>` +
          sweat(478, 340),
      ),
  },
  {
    id: 'rocket-stuck',
    name: { en: 'Launch Delayed', hu: 'Elhalasztott kilövés' },
    width: 640,
    height: 800,
    draw: () =>
      svg(
        640,
        800,
        '#dff1ff',
        `<rect y="660" width="640" height="140" fill="#9aa8bd"/><path d="M0 660H640" ${outline(6)}/>` +
          `<path d="M230 400L170 520L230 510ZM410 400L470 520L410 510Z" fill="#ff6b6b" ${outline()}/>` +
          `<path d="M320 170Q410 250 410 380V560H230V380Q230 250 320 170Z" fill="#ffffff" ${outline()}/>` +
          `<path d="M266 250Q320 214 374 250" fill="none" stroke="#ff6b6b" stroke-width="18"/>` +
          `<circle cx="320" cy="360" r="46" fill="#7fc8ff" ${outline()}/>` +
          `<path d="M302 352q8-8 16 0M330 352q8-8 16 0" fill="none" ${outline(5)}/><path d="M310 378q14-6 28 0" fill="none" ${outline(5)}/>` +
          `<path d="M250 560H390L370 600H270Z" fill="#8f9bb5" ${outline()}/>` +
          puff(
            [
              [200, 640, 54],
              [290, 650, 62],
              [380, 640, 58],
              [460, 650, 46],
              [130, 656, 38],
              [520, 660, 34],
            ],
            '#f4f6fa',
          ) +
          sweat(420, 300),
      ),
  },
  {
    id: 'octopus-busy',
    name: { en: 'Multitasking Octopus', hu: 'Multitaszkoló polip' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#c9f0f0',
        backdrop(400, 430, 280) +
          limb('M330 420Q240 440 200 500', '#a07ae0', 36) +
          limb('M470 420Q560 440 600 500', '#a07ae0', 36) +
          limb('M350 450Q300 560 250 600', '#a07ae0', 36) +
          limb('M450 450Q500 560 550 600', '#a07ae0', 36) +
          limb('M380 460Q370 570 330 650', '#a07ae0', 36) +
          limb('M420 460Q440 570 480 650', '#a07ae0', 36) +
          `<path d="M150 470h70v70q0 20-20 20h-30q-20 0-20-20z" fill="#ffffff" ${outline(7)}/><path d="M220 486h12a18 18 0 0 1 0 36h-12" fill="none" ${outline(7)}/>` +
          `<rect x="584" y="440" width="58" height="100" rx="12" fill="#3a3f58" ${outline(7)}/><rect x="594" y="452" width="38" height="70" rx="4" fill="#7fe3ff"/>` +
          `<g transform="rotate(-30 240 600)"><rect x="200" y="590" width="100" height="22" fill="#ffd23f" ${outline(6)}/><path d="M300 590l26 11l-26 11z" fill="#f3d1a8" ${outline(6)}/></g>` +
          `<rect x="520" y="580" width="90" height="70" rx="6" fill="#ff6b6b" ${outline(7)}/><path d="M532 594h66" stroke="#ffffff" stroke-width="5"/>` +
          `<ellipse cx="400" cy="340" rx="134" ry="128" fill="#a07ae0" ${outline()}/>` +
          `<path d="M332 320l40 12M468 320l-40 12" ${outline(8)}/>` +
          `<circle cx="360" cy="358" r="20" fill="#fff"/><circle cx="440" cy="358" r="20" fill="#fff"/><circle cx="362" cy="362" r="9" fill="${INK}"/><circle cx="438" cy="362" r="9" fill="${INK}"/>` +
          `<path d="M378 410q8-6 14 0t14 0t14 0" fill="none" ${outline(6)}/>` +
          sweat(500, 250) +
          sweat(300, 270, 0.7),
      ),
  },
  {
    id: 'hedgehog-balloon',
    name: { en: 'Hedgehog and Balloon', hu: 'Sün és lufi' },
    width: 800,
    height: 800,
    draw: () => {
      // The spiky back: a zigzag around a half circle. The balloon is tied to one of the spikes.
      let spikes = ''
      for (let i = 0; i <= 18; i++) {
        const a = Math.PI + (i / 18) * Math.PI
        const r = i % 2 ? 150 : 118
        spikes += `${i ? 'L' : 'M'}${(330 + Math.cos(a) * r).toFixed(1)} ${(560 + Math.sin(a) * r).toFixed(1)}`
      }
      return svg(
        800,
        800,
        '#fff0f5',
        backdrop(420, 420, 280) +
          shadow(380, 640, 190) +
          `<path d="M530 362Q520 410 480 410Q440 410 426 444" fill="none" ${outline(5)}/>` +
          `<ellipse cx="530" cy="250" rx="94" ry="114" fill="#ff4d6d" ${outline()}/>` +
          `<path d="M520 362h20l-10 -12z" fill="#ff4d6d" ${outline(6)}/>` +
          `<path d="M478 196q14-34 46-40" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" opacity=".7"/>` +
          `<path d="${spikes}Z" fill="#8a5a3c" ${outline()}/>` +
          `<path d="M180 560H480Q470 630 400 632H250Q190 630 180 560Z" fill="#f3d1a8" ${outline()}/>` +
          `<path d="M436 492Q500 480 566 552Q526 600 452 600Q414 556 436 492Z" fill="#f3d1a8" ${outline()}/>` +
          `<circle cx="566" cy="552" r="13" fill="${INK}"/>` +
          eye(488, 528, 10) +
          `<path d="M476 506l26-8" ${outline(6)}/>` +
          blush(506, 566) +
          sweat(520, 452, 0.8),
      )
    },
  },
  {
    id: 'goldfish-dream',
    name: { en: 'Goldfish Dreams Big', hu: 'Az aranyhal nagyot álmodik' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#e6f6ff',
        puff([
          [560, 230, 80],
          [640, 250, 70],
          [600, 300, 74],
          [500, 290, 60],
          [680, 310, 50],
        ]) +
          `<path d="M500 300q50-34 100 0t100 0" fill="none" stroke="#3a8fd8" stroke-width="12" stroke-linecap="round"/>` +
          `<path d="M520 268q40-34 80 0" fill="none" stroke="#7fc8ff" stroke-width="10" stroke-linecap="round"/>` +
          `<path d="M560 240q30-40 76-30q-20 6-26 22q36-10 50 10q-40-8-60 14z" fill="#3a8fd8" ${outline(5)}/>` +
          `<circle cx="660" cy="196" r="18" fill="#ffd23f" ${outline(5)}/>` +
          `<circle cx="420" cy="380" r="16" fill="#ffffff" ${outline(5)}/><circle cx="388" cy="414" r="10" fill="#ffffff" ${outline(5)}/>` +
          shadow(320, 712, 170) +
          `<circle cx="320" cy="540" r="172" fill="#bfe8ff" ${outline()}/>` +
          `<path d="M160 480Q320 456 480 480A172 172 0 0 1 160 480Z" fill="#9fdcff" opacity=".6"/>` +
          `<path d="M156 482Q320 456 484 482" fill="none" stroke="#7fc8ff" stroke-width="6"/>` +
          `<path d="M250 560l-50-36v72z" fill="#ff8a3c" ${outline(7)}/>` +
          `<ellipse cx="320" cy="560" rx="76" ry="48" fill="#ff8a3c" ${outline()}/>` +
          eye(352, 548, 10) +
          `<path d="M372 576q-10 6-18 0" fill="none" ${outline(5)}/>` +
          `<path d="M200 400Q320 380 440 400" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity=".6"/>` +
          `<circle cx="372" cy="470" r="8" fill="#ffffff" ${outline(4)}/>`,
      ),
  },
  {
    id: 'alarm-clock',
    name: { en: 'Monday Alarm', hu: 'Hétfői ébresztő' },
    width: 800,
    height: 800,
    draw: () =>
      svg(
        800,
        800,
        '#fff2b3',
        backdrop(400, 440, 280) +
          shadow(400, 648, 150) +
          `<path d="M210 250q-20-40 10-70M190 300q-40-20-50-60M590 250q20-40-10-70M610 300q40-20 50-60" fill="none" ${outline(7)} opacity=".6"/>` +
          `<path d="M300 600l-30 40M500 600l30 40" ${outline(14)}/>` +
          `<path d="M240 300A80 80 0 0 1 350 220Z" fill="#ffd23f" ${outline()}/><path d="M560 300A80 80 0 0 0 450 220Z" fill="#ffd23f" ${outline()}/>` +
          `<path d="M400 244V216M372 210h56" ${outline(10)}/>` +
          `<circle cx="400" cy="440" r="176" fill="#ff6b6b" ${outline()}/>` +
          `<circle cx="400" cy="440" r="138" fill="#ffffff" ${outline(6)}/>` +
          `<path d="M400 318v16M400 546v16M278 440h16M506 440h16" ${outline(6)}/>` +
          `<path d="M346 382l30 12M454 382l-30 12" ${outline(8)}/>` +
          eye(364, 412, 10) +
          eye(436, 412, 10) +
          `<path d="M400 440V476M400 440L446 456" ${outline(8)}/><circle cx="400" cy="440" r="8" fill="${INK}"/>` +
          `<path d="M360 506q40-24 80 0" fill="none" ${outline(7)}/>`,
      ),
  },
]

// Drawing every picture takes a moment, so each one is made on its first request and then kept.
const drawn = new Map()

export const TEMPLATES = TEMPLATE_LIST.map(({ draw, ...template }) => ({
  ...template,
  boxCount: 2,
  get svg() {
    if (!drawn.has(template.id)) drawn.set(template.id, draw())
    return drawn.get(template.id)
  },
}))
