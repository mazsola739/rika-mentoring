import { useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { useShelves } from './useShelves.js'
import SearchPanel from './components/SearchPanel.jsx'
import ShelfView from './components/ShelfView.jsx'
import AddBookForm from './components/AddBookForm.jsx'
import './app.css'

function BookLibrary() {
  const t = useText(TEXT)
  const [books, dispatch] = useShelves()
  const [active, setActive] = useState('reading')
  // The last change, shown (and announced) under the shelves. A removed book is kept for "Undo".
  const [notice, setNotice] = useState(null)
  const shelvesRef = useRef(null)

  const showShelf = (shelf) => {
    setActive(shelf)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    shelvesRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  const add = (book, shelf) => {
    dispatch({ type: 'add', book, shelf })
    setActive(shelf)
    setNotice({ kind: 'added', title: book.title, shelf })
  }

  const move = (book, shelf) => {
    dispatch({ type: 'move', id: book.id, shelf })
    setNotice({ kind: 'moved', title: book.title, shelf })
  }

  const remove = (book) => {
    dispatch({ type: 'remove', id: book.id })
    setNotice({ kind: 'removed', title: book.title, book })
  }

  const undo = () => {
    dispatch({ type: 'restore', book: notice.book })
    setActive(notice.book.shelf)
    setNotice(null)
  }

  // The notice stores keys (not finished sentences), so it is re-written when the language changes.
  const noticeText = notice
    ? notice.kind === 'removed'
      ? t.removed(notice.title)
      : t[notice.kind](notice.title, t.shelfNames[notice.shelf])
    : ''

  return (
    <div className="bl">
      <SearchPanel books={books} onAdd={add} onShow={showShelf} t={t} />

      <div className="bl-shelves-wrap" ref={shelvesRef}>
        <ShelfView
          books={books}
          active={active}
          onSelect={setActive}
          onMove={move}
          onRemove={remove}
          onRate={(book, rating) => dispatch({ type: 'rate', id: book.id, rating })}
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
