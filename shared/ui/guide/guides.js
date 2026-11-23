import { parseGuide } from './parseGuide.js'

// Every guide file, loaded only when its page opens (each one becomes its own small chunk).
const SOURCES = import.meta.glob('/content/guides/*/*.md', { query: '?raw', import: 'default' })

const pathOf = (slug, lang) => `/content/guides/${slug}/${lang}.md`

export const hasGuide = (slug) => Object.keys(SOURCES).some((key) => key.startsWith(`/content/guides/${slug}/`))

// The guide in the page's language, or in the other one while a translation is missing.
export async function loadGuide(slug, lang) {
  const key = [pathOf(slug, lang), pathOf(slug, lang === 'hu' ? 'en' : 'hu')].find((k) => k in SOURCES)
  if (!key) return null
  return { lang: key.endsWith('/hu.md') ? 'hu' : 'en', guide: parseGuide(await SOURCES[key]()) }
}
