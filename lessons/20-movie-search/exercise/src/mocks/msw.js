// The "pretend server" of this lesson: Mock Service Worker (MSW).
// A Service Worker is a small script the browser runs next to the page. MSW's own worker
// (public/mockServiceWorker.js, do not edit it) catches the page's requests to /api/… and hands them
// to the handlers in this folder, which answer like a real server would. Nothing leaves your computer.
import { setupWorker } from 'msw/browser'
import { HttpResponse, delay } from 'msw'

// Called once in src/main.jsx, before React draws the page.
export async function startMockApi(handlers) {
  // Service Workers only run on safe addresses: https://… and http://localhost.
  if (!('serviceWorker' in navigator)) {
    console.warn('This browser cannot run Service Workers here, so the TV API is not available. Open the page on http://localhost.')
    return null
  }
  const worker = setupWorker(...handlers)
  try {
    await worker.start({
      quiet: true, // no "[MSW] Mocking enabled" message in the console
      onUnhandledRequest: 'bypass', // everything else (the page's own files) passes through untouched
    })
  } catch (error) {
    console.warn('The TV API could not start:', error)
    return null
  }
  return worker
}

// A short, slightly varying wait, so loading states are visible like with a real server.
export const networkDelay = (min = 250, max = 700) => delay(min + Math.round(Math.random() * (max - min)))

// An SVG picture as an HTTP response (the posters are drawn in code).
export const svgResponse = (svg) =>
  new HttpResponse(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'max-age=3600' } })

// A JSON error in the usual { error, message } shape.
export const errorResponse = (status, error, message) => HttpResponse.json({ error, message }, { status })

// Escapes text for use inside SVG/XML.
export const xml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c])
