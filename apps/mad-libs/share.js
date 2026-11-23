const PREFIX = '#story='

// The address of this page, opening on the Solution tab, with the template at the end (URL-encoded).
// The part after # never reaches a server: the template travels inside the link itself.
export function shareLink(text) {
  const url = new URL(window.location.href)
  url.searchParams.set('view', 'solution')
  url.hash = PREFIX + encodeURIComponent(text)
  return url.href
}

// The template a shared link brings, or null if there is none (or the link is mangled).
export function sharedTemplate() {
  const hash = window.location.hash
  if (!hash.startsWith(PREFIX)) return null
  try {
    return decodeURIComponent(hash.slice(PREFIX.length))
  } catch {
    return null
  }
}
