import { useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { shelvesReducer, useShelves } from './useShelves.js'
import { useLocalStorage } from './useLocalStorage.js'
import { useCloudSync } from './useCloudSync.js'
import { saveShelves } from './cloud.js'
import AccountBar from './components/AccountBar.jsx'
import ReadingStats from './components/ReadingStats.jsx'
import SearchPanel from './components/SearchPanel.jsx'
import ShelfView from './components/ShelfView.jsx'
import AddBookForm from './components/AddBookForm.jsx'
import './app.css'

function BookLibrary() {
  const t = useText(TEXT)
  const [books, setBooks] = useShelves()
  const [goal, setGoal] = useLocalStorage('rika:book-library:goal', 12)
  // The logged-in user, { name, token }, or null. Kept in localStorage, so a reload does not log you out.
  const [session, setSession] = useLocalStorage('rika:book-library:session', null)
  const cloud = useCloudSync(session?.token, setBooks)
  const [active, setActive] = useState('reading')
  // The last change, shown (and announced) under the shelves. A removed book is kept for "Undo".
  const [notice, setNotice] = useState(null)
  const shelvesRef = useRef(null)

  // Every change goes through here: the reducer works out the new list, it shows at once,
  // and it is sent to the account when someone is logged in.
  function change(action) {
    const next = shelvesReducer(books, action)
    setBooks(next)
    cloud.save(next)
  }

  function showShelf(shelf) {
    setActive(shelf)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    shelvesRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  // `at` is when it happened: a book that lands on "Read" keeps it as its finish date.
  function add(book, shelf) {
    change({ type: 'add', book, shelf, at: new Date().toISOString() })
    setActive(shelf)
    setNotice({ kind: 'added', title: book.title, shelf })
  }

  function move(book, shelf) {
    change({ type: 'move', id: book.id, shelf, at: new Date().toISOString() })
    setNotice({ kind: 'moved', title: book.title, shelf })
  }

  function remove(book) {
    change({ type: 'remove', id: book.id })
    setNotice({ kind: 'removed', title: book.title, book })
  }

  function undo() {
    change({ type: 'restore', book: notice.book })
    setActive(notice.book.shelf)
    setNotice(null)
  }

  async function logInTo(user) {
    // A new account starts with the shelves of this browser, so nothing is lost.
    if (user.created) await saveShelves(user.token, books)
    setSession({ name: user.name, token: user.token })
  }

  function logOut() {
    setSession(null)
    setNotice(null)
    // Not change([]): that would also save an empty list in the account. Only this browser forgets the shelves.
    setBooks([])
  }

  function retrySync() {
    if (cloud.status === 'load-failed') cloud.reload()
    else cloud.save(books)
  }

  // The notice stores keys (not finished sentences), so it is re-written when the language changes.
  const noticeText = notice
    ? notice.kind === 'removed'
      ? t.removed(notice.title)
      : t[notice.kind](notice.title, t.shelfNames[notice.shelf])
    : ''

  return (
    <div className="bl">
      <AccountBar
        session={session}
        status={cloud.status}
        onLogin={logInTo}
        onLogout={logOut}
        onRetry={retrySync}
        t={t}
      />

      <ReadingStats books={books} goal={goal} onGoalChange={setGoal} t={t} />

      <SearchPanel books={books} onAdd={add} onShow={showShelf} t={t} />

      <div className="bl-shelves-wrap" ref={shelvesRef}>
        <ShelfView
          books={books}
          active={active}
          onSelect={setActive}
          onMove={move}
          onRemove={remove}
          onRate={(book, rating) => change({ type: 'rate', id: book.id, rating })}
          onNote={(book, note) => change({ type: 'note', id: book.id, note })}
          t={t}
        />

        <div className="bl-notice" aria-live="polite">
          {notice && (
            <>
              <span>{noticeText}</span>
              {notice.kind === 'removed' && (
                <button type="button" className="bl-notice__undo" onClick={undo}>
                  {t.undo}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <AddBookForm defaultShelf="want" onAdd={add} t={t} />

      <p className="bl-muted bl-credit">{t.credit}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="book-library">
      <BookLibrary />
    </AppFrame>
  )
}
