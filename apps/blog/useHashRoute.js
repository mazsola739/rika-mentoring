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

// Route table: the first pattern that matches wins. Unknown paths become "notFound".
const ROUTES = [
  ['list', /^\/?$/],
  ['new', /^\/new\/?$/],
  ['post', /^\/post\/([\w-]+)\/?$/],
  ['edit', /^\/edit\/([\w-]+)\/?$/],
]

export function matchRoute(path) {
  for (const [name, pattern] of ROUTES) {
    const match = path.match(pattern)
    if (match) return { name, id: match[1] ?? null }
  }
  return { name: 'notFound', id: null }
}
