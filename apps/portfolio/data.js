// A portfólió tartalma. Minta Mira kitalált mintaprofil – a saját adataiddal bármikor lecserélhető.

export const PROFILE = {
  hu: {
    name: 'Minta Mira',
    initials: 'MM',
    role: 'Junior frontend fejlesztő',
    tagline:
      'Reacttel építek átlátható, gyors és akadálymentes felületeket. Mentorral tanulok, és minden héten elkészül valami új.',
    about: [
      'Grafikusként kezdtem, ezért a pixelpontos részletek és a jó tipográfia ma is fontosak nekem. 2025-ben váltottam frontend fejlesztésre, azóta Reacttel dolgozom.',
      'Azt szeretem a legjobban, amikor egy bonyolult folyamatból egyszerű, érthető felület lesz. Junior pozíciót keresek olyan csapatban, ahol kódáttekintésből és páros programozásból is tanulhatok.',
    ],
    facts: [
      ['Helyszín', 'Budapest'],
      ['Elérhető', '2026 tavaszától'],
      ['Nyelvek', 'magyar, angol'],
    ],
    email: 'mira@example.com',
  },
  en: {
    name: 'Mira Minta',
    initials: 'MM',
    role: 'Junior Frontend Developer',
    tagline:
      'I build clear, fast and accessible interfaces with React. I learn with a mentor and ship something new every week.',
    about: [
      'I started out as a graphic designer, so pixel-perfect details and good typography still matter a lot to me. I switched to frontend development in 2025 and have been working with React ever since.',
      'What I enjoy most is turning a complicated process into a simple, understandable interface. I’m looking for a junior role in a team where I can learn from code reviews and pair programming.',
    ],
    facts: [
      ['Location', 'Budapest, Hungary'],
      ['Available', 'from spring 2026'],
      ['Languages', 'Hungarian, English'],
    ],
    email: 'mira@example.com',
  },
}

// Önértékelés ötfokú skálán – a szintjelző oszlopok mutatják.
export const SKILLS = [
  { name: { hu: 'React', en: 'React' }, level: 4 },
  { name: { hu: 'JavaScript', en: 'JavaScript' }, level: 4 },
  { name: { hu: 'HTML és CSS', en: 'HTML & CSS' }, level: 5 },
  { name: { hu: 'Reszponzív dizájn', en: 'Responsive design' }, level: 4 },
  { name: { hu: 'Akadálymentesség', en: 'Accessibility' }, level: 3 },
  { name: { hu: 'Git és GitHub', en: 'Git & GitHub' }, level: 3 },
  { name: { hu: 'REST API-k', en: 'REST APIs' }, level: 3 },
  { name: { hu: 'Vite', en: 'Vite' }, level: 3 },
]

// A projektek a portfólió többi leckéje: cím, leírás és tananyag a lessons.json-ból jön.
export const PROJECTS = [
  {
    slug: 'dark-mode',
    tags: ['React', 'Context API', 'CSS custom properties', 'localStorage'],
    hu: {
      challenge: 'A felhasználók egy része este böngészik, és ilyenkor a világos felület vakító.',
      solution:
        'Háromállású témaváltó (világos, sötét, rendszer) saját useDarkMode hookkal és Contexttel. A választás megmarad, és az app a gép beállításának változását is követi.',
    },
    en: {
      challenge: 'Many people browse in the evening, when a bright interface is glaring.',
      solution:
        'A three-way theme switch (light, dark, system) built on a custom useDarkMode hook and Context. The choice is remembered, and the app follows changes to the device setting.',
    },
  },
  {
    slug: 'password-generator',
    tags: ['React', 'Web Crypto API', 'Clipboard API'],
    hu: {
      challenge: 'Sokan még mindig gyenge, többször felhasznált jelszavakat használnak.',
      solution:
        'Böngészőben futó generátor a crypto.getRandomValues() segítségével, állítható karakterkészletekkel és entrópiaalapú erősségjelzővel. A jelszó sehova nem kerül elküldésre.',
    },
    en: {
      challenge: 'Many people still rely on weak, reused passwords.',
      solution:
        'A generator that runs in the browser with crypto.getRandomValues(), adjustable character sets and an entropy-based strength meter. The password is never sent anywhere.',
    },
  },
  {
    slug: 'mad-libs',
    tags: ['React', 'Regex', 'i18n'],
    hu: {
      challenge: 'Kellett egy egyszerű, kétnyelvű játék, amin jól gyakorolhatók a vezérelt űrlapok.',
      solution:
        'A mezők a sablon szövegéből generálódnak, így egy új történethez elég egy új sablon. Nyelv- vagy sablonváltáskor az űrlap tiszta lappal indul.',
    },
    en: {
      challenge: 'I needed a simple bilingual game for practising controlled forms.',
      solution:
        'The fields are generated from the template text, so a new story only needs a new template. Switching language or template starts the form from a clean slate.',
    },
  },
]

export const UI = {
  hu: {
    sample: 'Mintaprofil',
    nav: { about: 'Rólam', skills: 'Készségek', projects: 'Projektek', contact: 'Kapcsolat' },
    ctaProjects: 'Projektek megtekintése',
    ctaContact: 'Írj nekem',
    aboutTitle: 'Rólam',
    skillsTitle: 'Készségek',
    skillsLead: 'Önértékelés ötfokú skálán.',
    skillLevel: (n) => `${n} / 5`,
    projectsTitle: 'Projektek',
    projectsLead: 'Válogatás a mentorálás során készült munkáimból.',
    details: 'Részletek',
    back: 'Vissza a projektekhez',
    challenge: 'A kihívás',
    solution: 'A megoldás',
    learned: 'Amit közben tanultam',
    tech: 'Technológiák',
    liveDemo: 'Élő demó megnyitása',
    notFound: 'Ez a projekt nem található.',
    contactTitle: 'Kapcsolat',
    contactLead: 'Közös projekt vagy junior pozíció? Írj bátran, általában egy munkanapon belül válaszolok.',
    emailLabel: 'E-mail',
    footer: 'Készült a Rika Mentoring 1. leckéjében.',
    form: {
      title: 'Üzenet küldése',
      name: 'Név',
      email: 'E-mail-cím',
      message: 'Üzenet',
      send: 'Üzenet küldése',
      sending: 'Küldés…',
      sentTitle: 'Köszönöm, megkaptam az üzeneted!',
      sentText: 'Hamarosan válaszolok a megadott e-mail-címre.',
      another: 'Új üzenet írása',
      failed: 'Nem sikerült elküldeni:',
      errors: {
        name: 'Add meg a neved (legalább 2 karakter).',
        email: 'Adj meg egy érvényes e-mail-címet.',
        message: 'Az üzenet legyen legalább 10 karakter.',
      },
      demoNote: (n) =>
        `Demó: az üzenet a kamu backendbe (localStorage) kerül, és néha szándékosan hibát dob. Eddig ${n} üzenet érkezett.`,
    },
  },
  en: {
    sample: 'Sample profile',
    nav: { about: 'About', skills: 'Skills', projects: 'Projects', contact: 'Contact' },
    ctaProjects: 'View projects',
    ctaContact: 'Get in touch',
    aboutTitle: 'About me',
    skillsTitle: 'Skills',
    skillsLead: 'Self-assessment on a five-point scale.',
    skillLevel: (n) => `${n} / 5`,
    projectsTitle: 'Projects',
    projectsLead: 'A selection of work built during my mentoring.',
    details: 'Details',
    back: 'Back to projects',
    challenge: 'The challenge',
    solution: 'The solution',
    learned: 'What I learned along the way',
    tech: 'Technologies',
    liveDemo: 'Open live demo',
    notFound: 'This project could not be found.',
    contactTitle: 'Contact',
    contactLead: 'A project together or a junior role? Feel free to write, I usually reply within one working day.',
    emailLabel: 'Email',
    footer: 'Built in lesson 1 of Rika Mentoring.',
    form: {
      title: 'Send a message',
      name: 'Name',
      email: 'Email address',
      message: 'Message',
      send: 'Send message',
      sending: 'Sending…',
      sentTitle: 'Thank you, I’ve received your message!',
      sentText: 'I’ll reply to the email address you gave shortly.',
      another: 'Write another message',
      failed: 'The message could not be sent:',
      errors: {
        name: 'Please enter your name (at least 2 characters).',
        email: 'Please enter a valid email address.',
        message: 'The message should be at least 10 characters long.',
      },
      demoNote: (n) =>
        `Demo: the message goes to the fake backend (localStorage), which occasionally fails on purpose. Messages so far: ${n}.`,
    },
  },
}
