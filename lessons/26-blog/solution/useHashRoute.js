import { useEffect, useState } from 'react'

// Minimal router: the part after # is the path, e.g. #/post/hash-routing.
const readPath = () => window.location.hash.replace(/^#/, '') || '/'

export function useHashRoute() {
  const [path, setPath] = useState(readPath)

  useEffect(() => {
    const onChange = () => setPath(readPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export function navigate(path) {
  window.location.hash = path
}

// '%C3%A9' → 'é'. A broken code (a typed '100%', for example) stays as it is instead of breaking the page.
function decodePart(part) {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

// Route table: the first pattern that matches wins. Unknown paths become "notFound".
// `id` is the variable part of the address: a post's id, or a tag on #/tag/….
const ROUTES = [
  ['list', /^\/?$/],
  ['new', /^\/new\/?$/],
  ['login', /^\/login\/?$/],
  ['post', /^\/post\/([\w-]+)\/?$/],
  ['edit', /^\/edit\/([\w-]+)\/?$/],
  ['tag', /^\/tag\/([^/]+)\/?$/],
]

export function matchRoute(path) {
  for (const [name, pattern] of ROUTES) {
    const match = path.match(pattern)
    if (match) return { name, id: match[1] === undefined ? null : decodePart(match[1]) }
  }
  return { name: 'notFound', id: null }
}
