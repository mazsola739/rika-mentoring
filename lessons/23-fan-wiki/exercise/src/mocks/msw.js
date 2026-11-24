// The "pretend server": Mock Service Worker (MSW) answers the app's requests to /api/… in the browser.
// A Service Worker is a small script that the browser runs next to the page. It can catch the page's
// requests and answer them itself. MSW uses this to answer fetch('/api/…') with the handlers in
// handlers.js, the way a real server would: with a status code, headers and JSON. Nothing leaves your
// computer, so the wiki also works offline and on GitHub Pages.
// main.jsx starts it before React draws the page: await startMockApi(handlers)
import { setupWorker } from 'msw/browser'
import { HttpResponse, delay } from 'msw'

export async function startMockApi(handlers) {
  if (!('serviceWorker' in navigator)) {
    console.warn('This browser has no Service Workers, so the pretend API is not available.')
    return null
  }
  const worker = setupWorker(...handlers)
  try {
    await worker.start({
      // The worker script is public/mockServiceWorker.js, served next to index.html.
      serviceWorker: { url: new URL('mockServiceWorker.js', document.baseURI).href },
      quiet: true,
      // Everything that is not /api/… (the page, its scripts and styles) passes through untouched.
      onUnhandledRequest: 'bypass',
    })
  } catch (error) {
    console.warn('The pretend API could not start:', error)
    return null
  }
  return worker
}

// A short, slightly varying wait, so loading states are visible like with a real server.
export const networkDelay = (min = 250, max = 700) => delay(min + Math.round(Math.random() * (max - min)))

// An SVG image as an HTTP response (the characters' pictures are drawn in code).
export const svgResponse = (svg) =>
  new HttpResponse(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'max-age=3600' } })

// A JSON error in the usual { error, message } shape.
export const errorResponse = (status, error, message) => HttpResponse.json({ error, message }, { status })
