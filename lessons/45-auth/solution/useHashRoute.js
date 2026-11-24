import { useMemo, useSyncExternalStore } from 'react'

// Minimal hash router: "#/login?next=/account" → { path: '/login', query: { next: '/account' } }.
// useSyncExternalStore reads the hash during every render, so a redirect and a state change
// made in the same click (e.g. logout + go to /login) are always seen together.
const subscribe = (onChange) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
const getHash = () => window.location.hash

function parse(hash) {
  const raw = hash.replace(/^#/, '') || '/'
  const [path, search = ''] = raw.split('?')
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(search)) }
}

export const useHashRoute = () => {
  const hash = useSyncExternalStore(subscribe, getHash)
  return useMemo(() => parse(hash), [hash])
}

export function navigate(path, { replace = false } = {}) {
  // `replace` swaps the history entry, so the Back button does not return to a redirect.
  if (replace) window.location.replace(`#${path}`)
  else window.location.hash = path
}
