import { useEffect, useState } from 'react'

// A tiny router for the part after `#` (e.g. #/product/scarf-teal).
// No library needed, and it works on GitHub Pages because the server never sees the hash.
const readPath = () => window.location.hash.replace(/^#/, '') || '/'

export const useHashRoute = () => {
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

// Turns a path into a route object the app can switch on.
export function matchRoute(path) {
  if (path === '/' || path === '') return { name: 'catalogue' }
  if (path === '/cart') return { name: 'cart' }
  if (path === '/checkout') return { name: 'checkout' }
  if (path === '/orders') return { name: 'orders' }
  const product = path.match(/^\/product\/([\w-]+)\/?$/)
  if (product) return { name: 'product', id: product[1] }
  const order = path.match(/^\/order\/([\w-]+)\/?$/)
  if (order) return { name: 'order', id: order[1] }
  return { name: 'notFound' }
}
