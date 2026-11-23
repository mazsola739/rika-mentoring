import { useEffect, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { useSync } from './useSync.js'
import {
  CATEGORIES,
  CATEGORY_KEYS,
  excerpt,
  findTags,
  label,
  localeOf,
  normalize,
  relativeTime,
  seedNotes,
  tombstone,
} from './notes.js'
import NoteEditor from './NoteEditor.jsx'
import SyncStatus from './SyncStatus.jsx'
import './app.css'

const TEXT = {
  en: {
    search: 'Search notes',
    searchPlaceholder: 'Search… (accents optional)',
    newNote: 'New note',
    all: 'All',
    filterLabel: 'Categories',
    tagsLabel: 'Tags',
    category: 'Category',
    title: 'Title',
    body: 'Note',
    untitled: 'Untitled note',
    bodyPlaceholder: 'Start writing… (# heading, - list, **bold**, *italic*, #tag)',
    noBody: 'No text yet',
    allNotes: 'All notes',
    viewLabel: 'View',
    edit: 'Edit',
    preview: 'Preview',
    previewEmpty: 'Nothing to show yet.',
    edited: (when) => `Edited ${when}`,
    words: (n) => (n === 1 ? '1 word' : `${n} words`),
    delete: 'Delete',
    confirmQuestion: 'Delete this note?',
    confirmDelete: 'Yes, delete it',
    cancel: 'Cancel',
    count: (n) => (n === 1 ? '1 note' : `${n} notes`),
    emptyTitle: 'No notes yet',
    emptyText: 'Ideas, lists, things to remember – write your first note.',
    write: 'Write a note',
    noMatch: (q) => `No notes match “${q}”.`,
    noMatchCategory: 'No notes in this category yet.',
    noMatchFilter: 'No notes match these filters.',
    clearSearch: 'Clear search',
    pick: 'Pick a note from the list, or start a new one.',
    syncNever: 'Not synced yet.',
    synced: (when) => `Synced ${when}`,
    syncing: 'Syncing…',
    syncError: 'Could not reach the server.',
    offline: 'No internet. Your changes are waiting on this device.',
    pending: (n) => `Not on the server yet: ${n}`,
    sync: 'Sync',
    retry: 'Try again',
  },
  hu: {
    search: 'Keresés a jegyzetekben',
    searchPlaceholder: 'Keresés… (ékezet nélkül is)',
    newNote: 'Új jegyzet',
    all: 'Mind',
    filterLabel: 'Kategóriák',
    tagsLabel: 'Címkék',
    category: 'Kategória',
    title: 'Cím',
    body: 'Jegyzet',
    untitled: 'Névtelen jegyzet',
    bodyPlaceholder: 'Kezdj el írni… (# címsor, - lista, **félkövér**, *dőlt*, #címke)',
    noBody: 'Még nincs szöveg',
    allNotes: 'Összes jegyzet',
    viewLabel: 'Nézet',
    edit: 'Szerkesztés',
    preview: 'Előnézet',
    previewEmpty: 'Még nincs mit megmutatni.',
    edited: (when) => `Szerkesztve: ${when}`,
    words: (n) => `${n} szó`,
    delete: 'Törlés',
    confirmQuestion: 'Biztosan törlöd?',
    confirmDelete: 'Igen, törlöm',
    cancel: 'Mégse',
    count: (n) => `${n} jegyzet`,
    emptyTitle: 'Még nincs jegyzeted',
    emptyText: 'Ötletek, listák, amit nem akarsz elfelejteni – írd meg az első jegyzetet.',
    write: 'Jegyzet írása',
    noMatch: (q) => `Nincs találat erre: „${q}”.`,
    noMatchCategory: 'Ebben a kategóriában még nincs jegyzet.',
    noMatchFilter: 'Ezekre a szűrőkre nincs találat.',
    clearSearch: 'Keresés törlése',
    pick: 'Válassz egy jegyzetet a listából, vagy kezdj egy újat.',
    syncNever: 'Még nem szinkronizáltál.',
    synced: (when) => `Szinkronizálva: ${when}`,
    syncing: 'Szinkronizálás…',
    syncError: 'Nem sikerült elérni a szervert.',
    offline: 'Nincs internet. A változásaid ezen az eszközön várnak.',
    pending: (n) => `Még nincs a szerveren: ${n}`,
    sync: 'Szinkronizálás',
    retry: 'Újra',
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
  const [notes, setNotes] = useLocalStorage('rika:notes:notes', seedNotes)
  const [selectedId, setSelectedId] = useState(null)
  const [freshId, setFreshId] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState(null)
  // Two browser tabs act as two devices: each keeps its own notes and syncs them through the pretend server.
  const { online, status, pending, lastSync, sync } = useSync(notes, setNotes)

  // Derived data: filtering and sorting happen during render, nothing is stored twice.
  // Deleted notes stay in `notes` as tombstones for the sync, but every view starts from the live ones.
  const live = notes.filter((n) => !n.deleted)
  const tagsOf = (n) => findTags(label(n.body, lang))
  const allTags = [...new Set(live.flatMap(tagsOf))].sort((a, b) => a.localeCompare(b, localeOf(lang)))
  // A chosen tag that no note has any more (deleted, or the language changed) simply switches the filter off.
  const activeTag = allTags.includes(tag) ? tag : null
  const q = normalize(query.trim())
  const visible = live
    .filter((n) => category === 'all' || n.category === category)
    .filter((n) => activeTag === null || tagsOf(n).includes(activeTag))
    .filter((n) => !q || normalize(`${label(n.title, lang)} ${label(n.body, lang)}`).includes(q))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  const selected = live.find((n) => n.id === selectedId)
  const countFor = (key) => (key === 'all' ? live.length : live.filter((n) => n.category === key).length)
  // Each category borrows a color from the lesson palette (picked so neighbors look different).
  const colorOf = (key) => palette.colors[[0, 4, 2, 5][CATEGORY_KEYS.indexOf(key)] % palette.colors.length] ?? palette.solid

  // Leaving a note that is still completely empty throws it away, so no blank notes pile up.
  const discardIfEmpty = (id) =>
    setNotes((list) => {
      const note = list.find((n) => n.id === id)
      if (!note || note.deleted || label(note.title, lang).trim() || label(note.body, lang).trim()) return list
      // Created after the last sync started: the server has never seen it, so it can simply go.
      if (note.createdAt > lastSync) return list.filter((n) => n.id !== id)
      // The server may have it: leave a tombstone, or the next sync would bring it back.
      return list.map((n) => (n.id === id ? tombstone(n) : n))
    })

  const select = (id) => {
    if (selectedId && selectedId !== id) discardIfEmpty(selectedId)
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
    // The new note should not hide behind a search or a tag.
    setQuery('')
    setTag(null)
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

  // Not removed but marked: the sync carries the deletion to the other devices.
  const remove = (id) => {
    setNotes((list) => list.map((n) => (n.id === id ? tombstone(n) : n)))
    setSelectedId(null)
  }

  let listContent
  if (live.length === 0) {
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
    let message = t.noMatchCategory
    if (activeTag) message = t.noMatchFilter
    if (q) message = t.noMatch(query.trim())
    listContent = (
      <div className="nt-empty">
        <p>{message}</p>
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
          const body = excerpt(label(n.body, lang))
          return (
            <li key={n.id}>
              <button
                type="button"
                className="nt-list__item"
                aria-current={n.id === selectedId ? 'true' : undefined}
                onClick={() => select(n.id)}
              >
                <span className="nt-list__title">{title || t.untitled}</span>
                <span className="nt-list__excerpt">{body || t.noBody}</span>
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

      {allTags.length > 0 && (
        <div className="nt-filters nt-tags" role="group" aria-label={t.tagsLabel}>
          {allTags.map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={activeTag === name}
              // Clicking the chosen tag again switches the tag filter off.
              onClick={() => setTag(activeTag === name ? null : name)}
            >
              #{name}
            </button>
          ))}
        </div>
      )}

      <div className="nt-panes">
        <nav className="nt-side" aria-label={t.allNotes}>
          <p className="nt-side__count" aria-live="polite">
            {t.count(visible.length)}
          </p>
          {listContent}
        </nav>
        <div className="nt-main">
          {selected ? (
            // key: switching notes gives the editor a fresh state (the delete question, the Edit tab).
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
            live.length > 0 && <p className="nt-pick">{t.pick}</p>
          )}
        </div>
      </div>

      <SyncStatus
        online={online}
        status={status}
        pending={pending}
        lastSync={lastSync}
        now={now}
        onSync={sync}
        lang={lang}
        t={t}
      />
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
