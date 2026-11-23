import { useEffect, useRef } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { localize } from './places.js'
import { TEXT } from './text.js'

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z M13.5 6.5l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v5 M14 11v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PlaceList({ places, selectedId, colors, emptyText, onSelect, onToggle, onEdit, onDelete }) {
  const lang = useLang()
  const t = useText(TEXT)
  const listRef = useRef(null)

  // When a marker is clicked, bring its list item into view.
  useEffect(() => {
    if (!selectedId) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    listRef.current?.querySelector('.is-selected')?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' })
  }, [selectedId])

  if (places.length === 0) return <p className="tm-empty">{emptyText}</p>

  return (
    <ul ref={listRef} className="tm-list">
      {places.map((place) => {
        const name = localize(place.name, lang)
        const note = localize(place.note, lang)
        const selected = place.id === selectedId
        return (
          <li key={place.id} className={`tm-item${selected ? ' is-selected' : ''}`} style={{ '--pin': colors[place.status] }}>
            <button type="button" className="tm-item__main" aria-pressed={selected} title={t.show(name)} onClick={() => onSelect(place)}>
              {place.photo ? (
                <img className="tm-item__photo" src={place.photo} alt="" />
              ) : (
                <span className="tm-item__pin" aria-hidden="true" />
              )}
              <span className="tm-item__text">
                <strong>{name}</strong>
                <span className="tm-item__status">
                  <span className="tm-dot" aria-hidden="true" />
                  {t.statuses[place.status]}
                </span>
                {note && <span className="tm-item__note">{note}</span>}
              </span>
            </button>
            <div className="tm-item__actions">
              <button type="button" className="tm-mini" onClick={() => onToggle(place)}>
                {place.status === 'want' ? t.markBeen : t.markWant}
              </button>
              <button type="button" className="tm-icon-btn" aria-label={t.edit(name)} title={t.edit(name)} onClick={() => onEdit(place)}>
                <EditIcon />
              </button>
              <button type="button" className="tm-icon-btn" aria-label={t.remove(name)} title={t.remove(name)} onClick={() => onDelete(place)}>
                <TrashIcon />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
