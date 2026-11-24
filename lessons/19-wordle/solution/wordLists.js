import { ANSWERS, EXTRA_GUESSES } from './words.js'
import { ANSWERS_HU, EXTRA_GUESSES_HU } from './wordsHu.js'

// Everything that depends on the language of the words, one object per list.
// ENTER and BACK are the two wide keys of the on-screen keyboard.
export const WORD_LISTS = {
  en: {
    answers: ANSWERS,
    valid: new Set([...ANSWERS, ...EXTRA_GUESSES]),
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    keyboard: [[...'QWERTYUIOP'], [...'ASDFGHJKL'], ['ENTER', ...'ZXCVBNM', 'BACK']],
  },
  hu: {
    answers: ANSWERS_HU,
    valid: new Set([...ANSWERS_HU, ...EXTRA_GUESSES_HU]),
    letters: 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ',
    // A Hungarian keyboard: Z and Y swap places (QWERTZ), and the accented letters get a row of their own.
    keyboard: [[...'ÁÉÍÓÖŐÚÜŰ'], [...'QWERTZUIOP'], [...'ASDFGHJKL'], ['ENTER', ...'YXCVBNM', 'BACK']],
  },
}

export const WORD_LIST_NAMES = { en: 'English', hu: 'Magyar' }
