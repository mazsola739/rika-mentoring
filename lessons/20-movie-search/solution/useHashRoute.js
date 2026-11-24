import { useMemo, useSyncExternalStore } from 'react'

// A tiny router on the part after # (e.g. #/show/17861 or #/?q=dark). React Router does the same job
// with more features; this version shows the idea without a library and works on GitHub Pages.
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

// Same page, new URL, but no new history entry: used while typing, so "back" is not flooded
// with half-typed searches. replaceState fires no event, so we notify the listeners ourselves.
export function replaceRoute(href) {
  if (href === window.location.hash || (href === '#/' && !window.location.hash)) return
  window.history.replaceState(window.history.state, '', href)
  listeners.forEach((callback) => callback())
}

export const searchHref = (query) => (query ? `#/?q=${encodeURIComponent(query)}` : '#/')

// A series page that remembers the search it was opened from (#/show/32?q=moon),
// so its back link still works after a reload or from a shared link.
export const showHref = (id, query) => (query ? `#/show/${id}?q=${encodeURIComponent(query)}` : `#/show/${id}`)

export function showIdFrom(path) {
  const id = path.match(/^\/show\/(\d+)\/?$/)?.[1]
  return id ? Number(id) : null
}
