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

// The search and its filters as the part after "?": 'q=the&genre=Mystery&decade=2010'. Empty values are left out.
function searchPart(query, { genre = '', decade = '' } = {}) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (genre) params.set('genre', genre)
  if (decade) params.set('decade', decade)
  return params.toString()
}

// The search page with this search (and these filters) in its address: #/?q=the&genre=Mystery.
export function searchHref(query, filters) {
  const part = searchPart(query, filters)
  return part ? `#/?${part}` : '#/'
}

// A series page that remembers the search it was opened from (#/show/32?q=moon&genre=Comedy),
// so its back link still works after a reload or from a shared link.
export function showHref(id, query, filters) {
  const part = searchPart(query, filters)
  return part ? `#/show/${id}?${part}` : `#/show/${id}`
}

// The filters an address carries next to the search.
export function filtersFrom(params) {
  return { genre: params.get('genre') ?? '', decade: params.get('decade') ?? '' }
}

export function showIdFrom(path) {
  const id = path.match(/^\/show\/(\d+)\/?$/)?.[1]
  return id ? Number(id) : null
}
