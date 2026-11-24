// Two sample decks to practise on. Every card has an id (unique, never shown), a question and an answer.
// The guide starts with REACT_CARDS; later you will write decks of your own in the app itself.

// A little revision of what you learned in the earlier lessons.
export const REACT_CARDS = [
  {
    id: 'jsx',
    question: 'What is JSX?',
    answer: 'HTML-like markup written inside JavaScript. React turns it into function calls.',
  },
  {
    id: 'component',
    question: 'What is a component?',
    answer: 'A function that returns JSX. Its name starts with a capital letter, like <Card />.',
  },
  {
    id: 'props',
    question: 'What are props?',
    answer: 'The inputs a parent gives to a child component, like the arguments of a function.',
  },
  {
    id: 'use-state',
    question: 'What does useState give you?',
    answer: 'A pair: the current value, and a function that sets a new one and makes React draw again.',
  },
  {
    id: 'key',
    question: 'Why do list items need a key?',
    answer: 'So React can tell which item changed, moved or disappeared between two renders.',
  },
  {
    id: 'use-effect',
    question: 'When does useEffect run?',
    answer: 'After React has drawn the screen, and again whenever one of its dependencies changes.',
  },
  {
    id: 'cleanup',
    question: 'What is a cleanup function?',
    answer: 'The function an effect returns. React calls it before the effect runs again and when the component goes away.',
  },
  {
    id: 'controlled',
    question: 'What is a controlled input?',
    answer: 'A form field whose value comes from state and changes only through onChange.',
  },
]

// Fun facts about our neighbourhood in space.
export const SPACE_CARDS = [
  {
    id: 'venus-day',
    question: 'Which planet has a day longer than its year?',
    answer: 'Venus: one turn on its axis takes 243 Earth days, one trip around the Sun only 225.',
  },
  {
    id: 'sunlight',
    question: 'How long does sunlight take to reach Earth?',
    answer: 'About 8 minutes and 20 seconds.',
  },
  {
    id: 'hottest-planet',
    question: 'Which planet is the hottest?',
    answer: 'Venus, at about 465 °C: its thick clouds trap the heat. Mercury is closer to the Sun, but cooler.',
  },
  {
    id: 'olympus-mons',
    question: 'Where is the tallest volcano of the Solar System?',
    answer: 'On Mars: Olympus Mons is about 22 km high, more than twice as tall as Mount Everest.',
  },
  {
    id: 'sun-size',
    question: 'How many Earths would fit inside the Sun?',
    answer: 'About 1.3 million.',
  },
  {
    id: 'uranus',
    question: 'Which planet rolls around the Sun on its side?',
    answer: 'Uranus: its axis is tilted by about 98 degrees.',
  },
  {
    id: 'moon-face',
    question: 'Why do we always see the same side of the Moon?',
    answer: 'The Moon turns once on its axis in exactly the time it takes to go around Earth once.',
  },
  {
    id: 'light-year',
    question: 'Is a light-year a time or a distance?',
    answer: 'A distance: how far light travels in a year, about 9.5 trillion kilometres.',
  },
]
