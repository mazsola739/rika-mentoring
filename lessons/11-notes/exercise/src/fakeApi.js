// A pretend server for the advanced level ("sync across devices"). You do not need it before that.
//
// A real notes app keeps your notes on a server, so your phone and your laptop can both reach them.
// This course uses no outside services, so this file plays the server inside the browser:
//   - every request takes a little time, like a real one over the internet,
//   - when the browser is offline, the server cannot be reached and the request fails,
//   - its "database" is one localStorage key, so every tab of the app talks to the same server,
//     just like two devices would.
// It knows only two requests: getNotes() reads every note, saveNotes(notes) stores a new list.
// Both return a Promise, so use them with await.

const DATABASE_KEY = 'notes-app:server'

// Set it to 0.3 to see what your app does when the server fails now and then (0.3 = 3 requests in 10).
const FAIL_RATE = 0

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// What the server holds before your first sync: one note "written on another device".
function startingNotes() {
  return [
    {
      id: 'server-phone',
      title: 'Written on my phone',
      body: 'Buy a birthday present for Mum.\nThis note was waiting on the server: your first sync brought it here. #sync',
      category: 'personal',
      updatedAt: Date.now() - 30 * 60 * 1000,
    },
  ]
}

function readDatabase() {
  try {
    const saved = localStorage.getItem(DATABASE_KEY)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // blocked storage or broken data: start again from the starting notes
  }
  return startingNotes()
}

// Every request goes through here: offline check, a short wait, sometimes a failure, then the work.
async function request(work) {
  if (!navigator.onLine) throw new Error('Network error: the browser is offline.')
  await wait(300 + Math.random() * 500)
  if (Math.random() < FAIL_RATE) throw new Error('Server error (503): please try again later.')
  return structuredClone(work())
}

// "GET /notes": every note on the server, deleted ones too (they are marked with deleted: true).
export function getNotes() {
  return request(() => readDatabase())
}

// "PUT /notes": from now on the server keeps exactly this list.
export function saveNotes(notes) {
  return request(() => {
    localStorage.setItem(DATABASE_KEY, JSON.stringify(notes))
    return notes
  })
}
