// Starts the pretend rates server. Mock Service Worker (MSW) puts a small helper between the page and
// the network (public/mockServiceWorker.js). It catches the requests to /api/rates/… and answers them
// from handlers.js; every other request (the page itself, scripts, styles) goes through untouched.
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'

export async function startMockApi() {
  const worker = setupWorker(...handlers)
  try {
    // 'bypass': requests that no handler answers (the page itself, Vite's files) go on without a warning.
    await worker.start({ onUnhandledFrame: 'bypass' })
  } catch (error) {
    // For example on an http:// address that is not localhost: browsers allow Service Workers only on
    // secure pages. The app still starts, but its requests to /api/rates/… will fail.
    console.warn('The pretend rates server could not start:', error)
  }
}
