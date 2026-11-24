// The pretend server. Mock Service Worker (MSW) answers the page's requests to /api/… right in the
// browser, as if a real meme API had sent them: the JSON list of templates and the template pictures.
// Nothing leaves your computer. The worker script it needs is public/mockServiceWorker.js (do not edit it).
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'

const worker = setupWorker(...handlers)

export async function startPretendServer() {
  // Service Workers only run on safe addresses: https://… and http://localhost.
  if (!('serviceWorker' in navigator)) {
    console.warn('This browser cannot run Service Workers here, so /api/… will not answer. Open the page on http://localhost.')
    return
  }
  try {
    await worker.start({
      quiet: true, // no MSW messages in the console: look at the Network tab instead
      onUnhandledFrame: 'bypass', // everything else (the page, scripts, styles) goes through untouched
    })
  } catch (error) {
    console.warn('The pretend server could not start, so /api/… will not answer.', error)
  }
}
