import { useEffect, useState } from 'react'

// Tiny router on the part after #, e.g. #/product/notebook. Works on GitHub Pages without a server.
const readPath = () => window.location.hash.replace(/^#/, '') || '/'

export function useHashRoute() {
  // `navigated` tells pages whether the user moved here inside the app (then we move focus).
  const [route, setRoute] = useState(() => ({ path: readPath(), navigated: false }))

  useEffect(() => {
    const onChange = () => setRoute({ path: readPath(), navigated: true })
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export function productIdFrom(path) {
  return path.match(/^\/product\/([\w-]+)\/?$/)?.[1] ?? null
}

// After an in-app navigation, put keyboard focus on the new page's heading.
export function useFocusOnMount(ref, enabled) {
  useEffect(() => {
    if (enabled) ref.current?.focus()
  }, [ref, enabled])
}
