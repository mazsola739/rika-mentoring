import { useMemo, useSyncExternalStore } from 'react'

// A tiny router on the part after # (e.g. #/character/1 or #/?name=rick&page=2). React Router does the
// same job with more features; this version shows the idea without a library and works on GitHub Pages.
// The URL is an "external store": useSyncExternalStore re-renders us whenever it changes.
const listeners = new Set()

function subscribe(callback) {
  listeners.add(callback)
  window.addEventListener('hashchange', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('hashchange', callback)
  }
}

const getHash = () => window.location.hash

function parse(hash) {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  return { path: path || '/', params: new URLSearchParams(query) }
}

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getHash)
  return useMemo(() => parse(hash), [hash])
}

// Same page, new URL, but no new history entry: used for filters and typing, so "back" is not
// flooded with every keystroke. replaceState fires no event, so we notify the listeners ourselves.
export function replaceRoute(href) {
  if (href === window.location.hash || (href === '#/' && !window.location.hash)) return
  window.history.replaceState(window.history.state, '', href)
  listeners.forEach((callback) => callback())
}

export function characterIdFrom(path) {
  const id = path.match(/^\/character\/(\d+)\/?$/)?.[1]
  return id ? Number(id) : null
}

// The list's filters live in the URL (#/?name=rick&status=alive&page=2), so they survive a reload
// and the trip to a character page and back. Empty values are left out to keep the URL short.
export function listHref(filters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value && !(key === 'page' && Number(value) === 1)) params.set(key, value)
  }
  const query = params.toString()
  return query ? `#/?${query}` : '#/'
}
