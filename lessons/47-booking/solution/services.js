// What can be booked. Durations are in minutes, prices in EUR.
export const SERVICES = [
  {
    id: 'mentoring',
    duration: 60,
    price: 45,
    name: { en: '1:1 React mentoring', hu: 'Egyéni React mentorálás' },
    description: {
      en: 'A focused session on your current project: components, state, effects or whatever you are stuck on.',
      hu: 'Fókuszált alkalom az aktuális projektedről: komponensek, állapot, effectek, vagy ami épp elakaszt.',
    },
  },
  {
    id: 'code-review',
    duration: 30,
    price: 25,
    name: { en: 'Code review', hu: 'Kódátnézés' },
    description: {
      en: 'Send a repository link beforehand and we go through it together, with concrete suggestions.',
      hu: 'Előtte küldd át a repó linkjét, és együtt végignézzük, konkrét javaslatokkal.',
    },
  },
  {
    id: 'portfolio',
    duration: 45,
    price: 35,
    name: { en: 'Portfolio review', hu: 'Portfólió-átnézés' },
    description: {
      en: 'Feedback on your portfolio site and projects: what to show first, what to polish, what to drop.',
      hu: 'Visszajelzés a portfólióoldaladra és a projektjeidre: mit mutass először, mit csiszolj, mit hagyj ki.',
    },
  },
  {
    id: 'interview',
    duration: 90,
    price: 60,
    name: { en: 'Mock interview', hu: 'Próbainterjú' },
    description: {
      en: 'A realistic junior frontend interview with live coding, followed by detailed feedback.',
      hu: 'Valósághű junior frontend interjú élő kódolással, utána részletes visszajelzéssel.',
    },
  },
]

export const serviceById = (id) => SERVICES.find((s) => s.id === id)

// Opening hours per weekday (0 = Sunday … 6 = Saturday), as [open, close] in hours. null = closed.
export const OPENING_HOURS = {
  0: null,
  1: [9, 17],
  2: [9, 17],
  3: [9, 17],
  4: [12, 20],
  5: [9, 15],
  6: [10, 14],
}

export const SLOT_STEP = 30 // a new slot can start every 30 minutes
export const LEAD_TIME = 2 * 60 * 60 * 1000 // no bookings less than 2 hours ahead
export const MONTHS_AHEAD = 2 // the calendar shows this month and the next two
