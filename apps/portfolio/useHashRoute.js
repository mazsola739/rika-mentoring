import { useEffect, useState } from 'react'

// Minimális router a # utáni útvonalra (pl. #/projects/dark-mode).
// Könyvtár nélkül is megmutatja a routing lényegét, és GitHub Pages-en is működik.
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

export function projectSlugFrom(path) {
  return path.match(/^\/projects\/([\w-]+)\/?$/)?.[1] ?? null
}
