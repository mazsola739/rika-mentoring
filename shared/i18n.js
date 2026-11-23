import { useSyncExternalStore } from 'react'

// Two languages: English (default) and Hungarian. The choice lives in localStorage, so the main page
// and every app share it, and it stays in sync across browser tabs.
export const LANGS = ['en', 'hu']
export const DEFAULT_LANG = 'en'
const KEY = 'rika-lang'
const listeners = new Set()

function detect() {
  try {
    const saved = localStorage.getItem(KEY)
    if (LANGS.includes(saved)) return saved
  } catch {
    // private mode or blocked storage: fall back to the default
  }
  return DEFAULT_LANG
}

let current = detect()
document.documentElement.lang = current

function emit() {
  document.documentElement.lang = current
  listeners.forEach((fn) => fn())
}

window.addEventListener('storage', (e) => {
  if (e.key === KEY && LANGS.includes(e.newValue)) {
    current = e.newValue
    emit()
  }
})

export function getLang() {
  return current
}

export function setLang(lang) {
  if (!LANGS.includes(lang) || lang === current) return
  current = lang
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    // nem baj, ha nem menthető
  }
  emit()
}

export function useLang() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}

// Egy { hu: {...}, en: {...} } szótárból az aktuális nyelv szövegei.
export function useText(dict) {
  return dict[useLang()]
}
