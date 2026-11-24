// The pretend server. Mock Service Worker (MSW) puts a small program, a service worker
// (public/mockServiceWorker.js), between the page and the network. When the page asks for
// /api/apod…, the worker answers from handlers.js, right here in the browser, exactly like a
// real server would. Nothing leaves your computer. Requests it has no answer for (the page
// itself, scripts, styles) pass through untouched.
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'

export async function startMockApi() {
  if (!('serviceWorker' in navigator)) {
    // Service workers need a secure address: http://localhost or https://.
    console.warn('This browser cannot run service workers here, so the pretend space API is not available.')
    return
  }
  const worker = setupWorker(...handlers)
  try {
    await worker.start({
      // BASE_URL keeps this right when the built site lives in a sub-folder (for example on GitHub Pages).
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
      quiet: true,
      onUnhandledFrame: 'bypass',
    })
  } catch (error) {
    console.warn('The pretend space API could not start:', error)
  }
}
