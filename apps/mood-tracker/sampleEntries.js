import { addDays, todayISO } from './dates.js'

// [days ago, mood, note]. Today is left empty so you can log it yourself.
const SAMPLE = [
  [1, 4, { en: 'Finished the calendar grid. Small win!', hu: 'Kész a naptárrács. Kis győzelem!' }],
  [2, 5, { en: 'Long walk by the river, sunny and calm.', hu: 'Hosszú séta a folyóparton, napos és nyugodt.' }],
  [3, 4, null],
  [4, 3, { en: 'Busy day, too many meetings.', hu: 'Sűrű nap, túl sok megbeszélés.' }],
  [5, 3, null],
  [6, 2, { en: 'Slept badly.', hu: 'Rosszul aludtam.' }],
  [7, 3, null],
  [8, 4, { en: 'Coffee with an old friend.', hu: 'Kávé egy régi baráttal.' }],
  [10, 5, { en: 'Weekend trip to the lake!', hu: 'Hétvégi kirándulás a tóhoz!' }],
  [11, 4, null],
  [12, 3, null],
  [13, 1, { en: 'Caught a cold, stayed in bed.', hu: 'Megfáztam, ágyban maradtam.' }],
  [14, 2, null],
  [15, 3, { en: 'Feeling a bit better.', hu: 'Kicsit jobban vagyok.' }],
  [16, 4, null],
  [18, 4, { en: 'Tried a new recipe, it worked.', hu: 'Kipróbáltam egy új receptet, sikerült.' }],
  [19, 5, null],
  [20, 3, null],
  [21, 4, null],
  [22, 2, { en: 'Rainy and grey all day.', hu: 'Egész nap esős és szürke.' }],
  [23, 3, null],
  [24, 4, null],
  [25, 5, { en: 'Concert in the evening.', hu: 'Este koncert.' }],
]

export function createSampleEntries(today = todayISO()) {
  return Object.fromEntries(
    SAMPLE.map(([daysAgo, mood, note]) => [addDays(today, -daysAgo), { mood, note: note ?? '', updatedAt: null }]),
  )
}
