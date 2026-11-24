// The site's own HTTP API, running in the browser with Mock Service Worker (MSW).
// Lessons that teach fetch() call it with ordinary requests to /api/..., exactly like a real
// back end; a Service Worker answers them from local data. Nothing leaves the site, so it also
// works on GitHub Pages and offline. (Lessons that only need storage use createMockApi from ./index.js.)
//
// Usage in a lesson's main.jsx:
//   import { startMockApi } from '@shared/mock-api/msw.js'
//   import { handlers } from './mocks/handlers.js'
//   await startMockApi(handlers)
//   createRoot(...).render(...)
import { setupWorker } from 'msw/browser'
import { HttpResponse, delay } from 'msw'

// Lesson pages live at lessons/<NN-slug>/solution/, the worker script at the site root (copied from public/).
// Resolving from the page keeps this right both on localhost and under a GitHub Pages sub-path.
const workerUrl = () => new URL('../../../mockServiceWorker.js', document.baseURI).href

export async function startMockApi(handlers) {
  if (!('serviceWorker' in navigator)) {
    console.warn('This browser has no Service Workers, so the lesson API is not available.')
    return null
  }
  const worker = setupWorker(...handlers)
  try {
    await worker.start({
      serviceWorker: { url: workerUrl() },
      quiet: true,
      // Pages, scripts, fonts and images of the site itself pass through untouched.
      onUnhandledRequest: 'bypass',
    })
  } catch (error) {
    console.warn('The lesson API could not start:', error)
    return null
  }
  return worker
}

// A short, slightly varying wait, so loading states are visible like with a real server.
export const networkDelay = (min = 250, max = 700) => delay(min + Math.round(Math.random() * (max - min)))

// An SVG image as an HTTP response (covers, posters, avatars drawn in code).
export const svgResponse = (svg) =>
  new HttpResponse(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'max-age=3600' } })

// A JSON error in the usual { error, message } shape.
export const errorResponse = (status, error, message) => HttpResponse.json({ error, message }, { status })

// Escapes text for use inside SVG/XML.
export const xml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c])
