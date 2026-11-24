// The pretend server. Mock Service Worker (MSW) answers the page's fetch('/api/…') requests right
// in the browser, as if a real back end had sent them. Nothing leaves your computer.
// The worker script it needs is public/mockServiceWorker.js (do not edit it).
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'
import { accountHandlers } from './accounts.js'

const worker = setupWorker(...handlers, ...accountHandlers)

export async function startPretendServer() {
  try {
    await worker.start({
      quiet: true, // no MSW messages in the console: look at the Network tab instead
      onUnhandledFrame: 'bypass', // everything else (the page, scripts, styles) goes through untouched
    })
  } catch (error) {
    console.warn('The pretend server could not start, so /api/… will not answer.', error)
  }
}
