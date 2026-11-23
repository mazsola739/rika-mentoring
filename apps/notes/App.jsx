import { useEffect, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { CATEGORIES, CATEGORY_KEYS, label, normalize, relativeTime, seedNotes } from './notes.js'
import NoteEditor from './NoteEditor.jsx'
import './app.css'

const TEXT = {
  en: {
    search: 'Search notes',
    searchPlaceholder: 'Search… (accents optional)',
    newNote: 'New note',
    all: 'All',
    filterLabel: 'Categories',
    category: 'Category',
    title: 'Title',
    body: 'Note',
    untitled: 'Untitled note',
    bodyPlaceholder: 'Start writing…',
    noBody: 'No text yet',
    allNotes: 'All notes',
    edited: (when) => `Edited ${when}`,
    words: (n) => (n === 1 ? '1 word' : `${n} words`),
    delete: 'Delete',
    confirmDelete: 'Delete note',
    cancel: 'Cancel',
    count: (n) => (n === 1 ? '1 note' : `${n} notes`),
    emptyTitle: 'No notes yet',
    emptyText: 'Ideas, lists, things to remember – write your first note.',
    write: 'Write a note',
    noMatch: (q) => `No notes match “${q}”.`,
    noMatchCategory: 'No notes in this category yet.',
    clearSearch: 'Clear search',
    pick: 'Pick a note from the list, or start a new one.',
  },
  hu: {
    search: 'Keresés a jegyzetekben',
    searchPlaceholder: 'Keresés… (ékezet nélkül is)',
    newNote: 'Új jegyzet',
    all: 'Mind',
    filterLabel: 'Kategóriák',
    category: 'Kategória',
    title: 'Cím',
    body: 'Jegyzet',
    untitled: 'Névtelen jegyzet',
    bodyPlaceholder: 'Kezdj el írni…',
    noBody: 'Még nincs szöveg',
    allNotes: 'Összes jegyzet',
    edited: (when) => `Szerkesztve: ${when}`,
    words: (n) => `${n} szó`,
    delete: 'Törlés',
    confirmDelete: 'Jegyzet törlése',
    cancel: 'Mégse',
    count: (n) => `${n} jegyzet`,
    emptyTitle: 'Még nincs jegyzeted',
    emptyText: 'Ötletek, listák, amit nem akarsz elfelejteni – írd meg az első jegyzetet.',
    write: 'Jegyzet írása',
    noMatch: (q) => `Nincs találat erre: „${q}”.`,
    noMatchCategory: 'Ebben a kategóriában még nincs jegyzet.',
    clearSearch: 'Keresés törlése',
    pick: 'Válassz egy jegyzetet a listából, vagy kezdj egy újat.',
  },
}

// The clock for "5 minutes ago": a new `now` every 30 seconds, and the interval is cleared on unmount.
function useNow(interval = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

function Notes() {
  const lang = useLang()
  const t = useText(TEXT)
  const { palette } = useLesson()
  const now = useNow()
  const [notes, setNotes] = useLocalStorage('rika:notes:items', seedNotes)
  const [selectedId, setSelectedId] = useState(null)
  const [freshId, setFreshId] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  // Derived data: filtering and sorting happen during render, nothing is stored twice.
  const q = normalize(query.trim())
  const visible = notes
    .filter((n) => category === 'all' || n.category === category)
    .filter((n) => !q || normalize(`${label(n.title, lang)} ${label(n.body, lang)}`).includes(q))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  const selected = notes.find((n) => n.id === selectedId)
  const countFor = (key) => (key === 'all' ? notes.length : notes.filter((n) => n.category === key).length)
  // Each category borrows a color from the lesson palette (picked so neighbors look different).
  const colorOf = (key) => palette.colors[[0, 4, 2, 5][CATEGORY_KEYS.indexOf(key)] % palette.colors.length] ?? palette.solid

  // Leaving a note that is still completely empty throws it away, so no blank notes pile up.
  const select = (id) => {
    if (selectedId && selectedId !== id) {
      setNotes((list) => list.filter((n) => n.id !== selectedId || label(n.title, lang).trim() || label(n.body, lang).trim()))
    }
    setSelectedId(id)
    setFreshId(null)
  }

  const create = () => {
    select(null)
    const id = crypto.randomUUID()
    const time = Date.now()
    const note = {
      id,
      title: '',
      body: '',
      category: category === 'all' ? 'personal' : category,
      createdAt: time,
      updatedAt: time,
    }
    setNotes((list) => [note, ...list])
    setQuery('')
    setSelectedId(id)
    setFreshId(id)
  }

  // Editing a bilingual sample note turns it into plain text in the current language.
  const update = (id, patch) =>
    setNotes((list) =>
      list.map((n) =>
        n.id === id ? { ...n, title: label(n.title, lang), body: label(n.body, lang), ...patch, updatedAt: Date.now() } : n,
      ),
    )

  const remove = (id) => {
    setNotes((list) => list.filter((n) => n.id !== id))
    setSelectedId(null)
  }

  let listContent
  if (notes.length === 0) {
    listContent = (
      <div className="nt-empty">
        <h3>{t.emptyTitle}</h3>
        <p>{t.emptyText}</p>
        <button type="button" className="btn" onClick={create}>
          {t.write}
        </button>
      </div>
    )
  } else if (visible.length === 0) {
    listContent = (
      <div className="nt-empty">
        <p>{q ? t.noMatch(query.trim()) : t.noMatchCategory}</p>
        {q && (
          <button type="button" className="btn btn--ghost nt-small" onClick={() => setQuery('')}>
            {t.clearSearch}
          </button>
        )}
      </div>
    )
  } else {
    listContent = (
      <ul className="nt-list">
        {visible.map((n) => {
          const title = label(n.title, lang).trim()
          const body = label(n.body, lang).trim()
          return (
            <li key={n.id}>
              <button
                type="button"
                className="nt-list__item"
                aria-current={n.id === selectedId ? 'true' : undefined}
                onClick={() => select(n.id)}
              >
                <span className="nt-list__title">{title || t.untitled}</span>
                <span className="nt-list__excerpt">{body.split('\n')[0] || t.noBody}</span>
                <span className="nt-list__meta">
                  <span className="nt-dot" style={{ background: colorOf(n.category) }} />
                  {CATEGORIES[n.category]?.[lang] ?? n.category} · {relativeTime(n.updatedAt, now, lang)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className={`nt${selected ? ' has-selection' : ''}`}>
      <div className="nt-top">
        <label className="nt-search">
          <span className="visually-hidden">{t.search}</span>
          <input
            className="input"
            type="search"
            value={query}
            placeholder={t.searchPlaceholder}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="button" className="btn" onClick={create}>
          + {t.newNote}
        </button>
      </div>

      <div className="nt-filters" role="group" aria-label={t.filterLabel}>
        {['all', ...CATEGORY_KEYS].map((key) => (
          <button key={key} type="button" className="chip" aria-pressed={category === key} onClick={() => setCategory(key)}>
            {key !== 'all' && <span className="nt-dot" style={{ background: colorOf(key) }} />}
            {key === 'all' ? t.all : CATEGORIES[key][lang]}
            <span className="nt-count">{countFor(key)}</span>
          </button>
        ))}
      </div>

      <div className="nt-panes">
        <nav className="nt-side" aria-label={t.allNotes}>
          <p className="nt-side__count" aria-live="polite">
            {t.count(visible.length)}
          </p>
          {listContent}
        </nav>
        <div className="nt-main">
          {selected ? (
            // key: switching notes gives the editor a fresh state (e.g. the delete confirmation).
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              autoFocus={selected.id === freshId}
              onChange={update}
              onDelete={remove}
              onBack={() => select(null)}
              lang={lang}
              t={t}
            />
          ) : (
            notes.length > 0 && <p className="nt-pick">{t.pick}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="notes">
      <Notes />
    </AppFrame>
  )
}
