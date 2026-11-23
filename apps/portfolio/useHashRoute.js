import { useEffect, useState } from 'react'

// A minimal router for the path after # (e.g. #/projects/dark-mode).
// It shows the core of routing without a library, and it works on GitHub Pages too.
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
