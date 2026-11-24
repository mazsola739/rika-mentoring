import { useId, useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { CATEGORIES, OCCASIONS, itemName, seasonOf, uid } from './data.js'
import ItemImage from './ItemImage.jsx'

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const REQUIRED = ['top', 'bottom', 'shoes']

const Slot = ({ category, item, position, total, hasAny, locked, onPrev, onNext, onLock }) => {
  const t = useText(TEXT)
  const b = t.builder
  const lang = useLang()
  const label = t.categories[category]
  // Nothing to switch to: no options, or the only option is already shown.
  const stuck = total === 0 || (total === 1 && position === 1)

  return (
    <li className="wr-slot">
      <div className="wr-slot__head">
        <span className="wr-label">{label}</span>
        <label className="wr-lock" title={b.lock(label)}>
          <input type="checkbox" checked={locked} onChange={onLock} />
          <span className="visually-hidden">{b.lock(label)}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" />
            <path d={locked ? 'M8 11V8a4 4 0 0 1 8 0v3' : 'M8 11V8a4 4 0 0 1 7.7-1.5'} fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </label>
      </div>

      <div className="wr-slot__media">
        {item ? <ItemImage item={item} /> : <span className="wr-slot__none">{total ? b.none : b.missing(label)}</span>}
      </div>

      <p className="wr-slot__name" aria-live="polite">
        {item ? itemName(item, lang) : total ? b.none : hasAny ? '' : b.addSome}
      </p>

      <div className="wr-slot__nav">
        <button type="button" className="wr-arrow" onClick={onPrev} disabled={stuck} aria-label={b.prev(label)}>
          ‹
        </button>
        <span className="wr-slot__pos">{total && position > 0 ? b.position(position, total) : '–'}</span>
        <button type="button" className="wr-arrow" onClick={onNext} disabled={stuck} aria-label={b.next(label)}>
          ›
        </button>
      </div>
    </li>
  )
}

const OutfitsView = ({ items, outfits, onSave, onRemove }) => {
  const t = useText(TEXT)
  const b = t.builder
  const lang = useLang()
  const id = useId()
  const headingRef = useRef(null)

  const season = seasonOf()
  const [onlySeason, setOnlySeason] = useState(true)
  const [occasion, setOccasion] = useState('all')
  const [selection, setSelection] = useState({}) // category → item id (null = nothing)
  const [locks, setLocks] = useState({})
  const [name, setName] = useState('')
  const [message, setMessage] = useState(null) // { type: 'picked' } | { type: 'saved', name }

  const byId = (itemId) => items.find((i) => i.id === itemId) ?? null

  // Multi-criteria filtering for each slot: category + season + occasion.
  const candidates = Object.fromEntries(
    CATEGORIES.map((cat) => [
      cat,
      items.filter(
        (i) =>
          i.category === cat &&
          (!onlySeason || i.season === season || i.season === 'all') &&
          (occasion === 'all' || i.occasion === occasion),
      ),
    ]),
  )

  // Accessories are optional, so "none" is one of their options.
  const optionsOf = (cat) => (cat === 'accessory' ? [null, ...candidates[cat]] : candidates[cat])

  // What a slot shows: the user's pick if it still exists, otherwise the first match.
  const chosen = (cat) => {
    const picked = cat in selection ? byId(selection[cat]) : null
    if (picked || cat === 'accessory') return picked
    return candidates[cat][0] ?? null
  }

  const outfit = Object.fromEntries(CATEGORIES.map((cat) => [cat, chosen(cat)]))

  const cycle = (cat, dir) => {
    const options = optionsOf(cat)
    if (!options.length) return
    const index = options.findIndex((o) => (o?.id ?? null) === (outfit[cat]?.id ?? null))
    const next = options[(index + dir + options.length) % options.length]
    setSelection((s) => ({ ...s, [cat]: next?.id ?? null }))
  }

  const surprise = () => {
    const next = {}
    for (const cat of CATEGORIES) {
      const list = candidates[cat]
      if (locks[cat]) next[cat] = outfit[cat]?.id ?? null
      else if (cat === 'accessory') next[cat] = list.length && Math.random() < 0.75 ? pick(list).id : null
      else next[cat] = list.length ? pick(list).id : null
    }
    setSelection(next)
    setMessage({ type: 'picked' })
  }

  const complete = REQUIRED.every((cat) => outfit[cat])

  const save = (event) => {
    event.preventDefault()
    if (!complete) return
    const outfitName = name.trim() || b.defaultName(outfits.length + 1)
    onSave({
      id: uid(),
      name: outfitName,
      createdAt: Date.now(),
      items: Object.fromEntries(CATEGORIES.map((cat) => [cat, outfit[cat]?.id ?? null])),
    })
    setName('')
    setMessage({ type: 'saved', name: outfitName })
  }

  const wear = (saved) => {
    setSelection(saved.items)
    setLocks({})
    headingRef.current?.focus()
  }

  const dateText = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { weekday: 'long', month: 'long', day: 'numeric' }).format(
    new Date(),
  )
  const savedDate = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { dateStyle: 'medium' })

  return (
    <div className="wr-outfits">
      <section className="wr-today solid" aria-labelledby={`${id}-today`}>
        <div>
          <h3 id={`${id}-today`}>{b.todayTitle}</h3>
          <p>{b.today(dateText, t.seasons[season])}</p>
        </div>
        <button type="button" className="btn wr-today__btn" onClick={surprise} disabled={!items.length}>
          {b.surprise}
        </button>
      </section>

      <section className="wr-builder" aria-labelledby={`${id}-builder`}>
        <h3 id={`${id}-builder`} ref={headingRef} tabIndex={-1} className="wr-section-title">
          {b.title}
        </h3>

        <div className="wr-builder__filters">
          <label className="wr-check">
            <input type="checkbox" checked={onlySeason} onChange={(e) => setOnlySeason(e.target.checked)} />
            {b.onlySeason(t.seasons[season])}
          </label>
          <label className="field wr-builder__occasion">
            <span>{b.occasion}</span>
            <select className="input" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              <option value="all">{b.anyOccasion}</option>
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>
                  {t.occasions[o]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="wr-slots">
          {CATEGORIES.map((cat) => {
            const options = optionsOf(cat)
            const realCount = candidates[cat].length
            const index = options.findIndex((o) => (o?.id ?? null) === (outfit[cat]?.id ?? null))
            return (
              <Slot
                key={cat}
                category={cat}
                item={outfit[cat]}
                position={index + 1}
                total={realCount ? options.length : 0}
                hasAny={items.some((i) => i.category === cat)}
                locked={!!locks[cat]}
                onPrev={() => cycle(cat, -1)}
                onNext={() => cycle(cat, 1)}
                onLock={() => setLocks((l) => ({ ...l, [cat]: !l[cat] }))}
              />
            )
          })}
        </ul>

        <form className="wr-save" onSubmit={save}>
          <label className="field">
            <span>{b.saveName}</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={b.savePlaceholder}
              maxLength={40}
            />
          </label>
          <button type="submit" className="btn" disabled={!complete}>
            {b.save}
          </button>
        </form>
        <p className={`wr-hint${complete ? ' visually-hidden' : ''}`}>{b.needBasics}</p>
        <p className="wr-message" aria-live="polite">
          {message?.type === 'saved' ? b.saved(message.name) : message?.type === 'picked' ? b.picked : ''}
        </p>
      </section>

      <section aria-labelledby={`${id}-saved`}>
        <h3 id={`${id}-saved`} className="wr-section-title">
          {t.savedOutfits.title}
        </h3>
        {outfits.length === 0 ? (
          <p className="wr-muted">{t.savedOutfits.empty}</p>
        ) : (
          <ul className="wr-saved">
            {[...outfits]
              .sort((x, y) => y.createdAt - x.createdAt)
              .map((saved) => (
                <li key={saved.id} className="wr-saved__card">
                  <div className="wr-saved__thumbs">
                    {CATEGORIES.map((cat) => {
                      const item = byId(saved.items[cat])
                      if (!saved.items[cat]) return null
                      return item ? (
                        <ItemImage key={cat} item={item} alt={itemName(item, lang)} className="wr-saved__thumb" />
                      ) : (
                        <span key={cat} className="wr-img wr-saved__thumb wr-saved__missing" title={t.savedOutfits.deleted}>
                          <span className="visually-hidden">{t.savedOutfits.deleted}</span>
                        </span>
                      )
                    })}
                  </div>
                  <div className="wr-saved__info">
                    <strong>{saved.name}</strong>
                    <small>{savedDate.format(saved.createdAt)}</small>
                  </div>
                  <div className="wr-saved__actions">
                    <button type="button" className="btn btn--ghost wr-small" onClick={() => wear(saved)}>
                      {t.savedOutfits.wear}
                    </button>
                    <button type="button" className="wr-link" onClick={() => onRemove(saved.id)} aria-label={`${t.remove}: ${saved.name}`}>
                      {t.remove}
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default OutfitsView
