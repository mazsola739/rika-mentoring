// A pretend server for syncing. A real notes app keeps your notes on a server, so your phone and your laptop can both
// reach them. This site has no server, so this file plays one inside the browser:
//   - every request takes a little time, and now and then it fails, like a real one over the internet,
//   - when the browser is offline, the server cannot be reached at all,
//   - its "database" is one localStorage key, so every tab of the app talks to the same server, like two devices.
// It knows two requests: getNotes() reads every note (tombstones too), saveNotes(notes) stores a new list.

const DATABASE_KEY = 'rika:notes:server'
const FAIL_RATE = 0.05 // 1 request in 20 fails, so the error state (and its "Try again") can be seen

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// What the server holds before the first sync: one note "written on another device".
function startingNotes() {
  const time = Date.now() - 30 * 60 * 1000
  return [
    {
      id: 'server-phone',
      category: 'personal',
      title: { en: 'Written on my phone', hu: 'Telefonon írtam' },
      body: {
        en: 'Buy a birthday present for Mum.\nThis note was waiting on the server: your first sync brought it here. #sync',
        hu: 'Szülinapi ajándékot venni anyának.\nEz a jegyzet a szerveren várt: az első szinkron hozta ide. #szinkron',
      },
      createdAt: time,
      updatedAt: time,
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
    try {
      localStorage.setItem(DATABASE_KEY, JSON.stringify(notes))
    } catch {
      throw new Error('Server error (507): the server is out of space.')
    }
    return notes
  })
}
