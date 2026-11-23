import { COMMON_PASSWORDS } from './commonPasswords.js'

// Made once, when the file loads. A Set answers "is it in there?" at once.
const COMMON = new Set(COMMON_PASSWORDS)

// The list is lowercase, so "QWERTY" and "Qwerty" are caught too.
export function isCommonPassword(text) {
  return COMMON.has(text.toLowerCase())
}
