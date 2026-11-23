import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { CATEGORIES, EMPTY_FILTERS, OCCASIONS, SEASONS, matches } from './data.js'
import ColorPicker from './ColorPicker.jsx'
import ItemCard from './ItemCard.jsx'
import ItemForm from './ItemForm.jsx'
import CategoryIcon from './CategoryIcon.jsx'

function Filters({ filters, setFilters }) {
  const t = useText(TEXT)
  const f = t.filters
  const set = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))
  const active = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)

  return (
    <section className="wr-filters" aria-label={f.title}>
      <div className="wr-chipset__list" role="group" aria-label={f.category}>
        {['all', ...CATEGORIES].map((cat) => (
          <button key={cat} type="button" className="chip" aria-pressed={filters.category === cat} onClick={() => set('category', cat)}>
            {t.categoriesPlural[cat]}
          </button>
        ))}
      </div>

      <div className="wr-filters__row">
        <label className="field">
          <span>{f.search}</span>
          <input className="input" type="search" value={filters.query} onChange={(e) => set('query', e.target.value)} />
        </label>
        <label className="field">
          <span>{f.season}</span>
          <select className="input" value={filters.season} onChange={(e) => set('season', e.target.value)}>
            <option value="all">{f.any}</option>
            {SEASONS.filter((s) => s !== 'all').map((s) => (
              <option key={s} value={s}>
                {t.seasons[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{f.occasion}</span>
          <select className="input" value={filters.occasion} onChange={(e) => set('occasion', e.target.value)}>
            <option value="all">{f.any}</option>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {t.occasions[o]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ColorPicker
        name="wr-filter-color"
        legend={f.color}
        anyLabel={f.anyColor}
        value={filters.color}
        onChange={(c) => set('color', c)}
      />

      {active && (
        <button type="button" className="wr-link wr-filters__clear" onClick={() => setFilters(EMPTY_FILTERS)}>
          {f.clear}
        </button>
      )}
    </section>
  )
}

export default function ClosetView({ items, onAdd, onRemove, onLoadSamples }) {
  const t = useText(TEXT)
  const lang = useLang()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const empty = items.length === 0
  const showForm = formOpen || empty
  const visible = items.filter((item) => matches(item, filters, lang)).sort((a, b) => b.createdAt - a.createdAt)

  const add = (item) => {
    onAdd(item)
    setAnnouncement(t.form.added(item.name))
  }

  return (
    <div className="wr-closet">
      <div className="wr-bar">
        <p className="wr-count">{t.itemsCount(items.length)}</p>
        {!empty && (
          <button
            type="button"
            className={formOpen ? 'btn btn--ghost' : 'btn'}
            onClick={() => setFormOpen((o) => !o)}
            aria-expanded={formOpen}
          >
            {formOpen ? t.closeForm : `+ ${t.addItem}`}
          </button>
        )}
      </div>

      {empty && (
        <div className="wr-empty">
          <div className="wr-empty__art" aria-hidden="true">
            <CategoryIcon category="top" />
          </div>
          <div>
            <h3>{t.empty.title}</h3>
            <p>{t.empty.text}</p>
            <button type="button" className="btn btn--ghost" onClick={onLoadSamples}>
              {t.empty.samples}
            </button>
          </div>
        </div>
      )}

      {showForm && <ItemForm onAdd={add} onCancel={() => setFormOpen(false)} canCancel={!empty} />}
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>

      {!empty && (
        <>
          <Filters filters={filters} setFilters={setFilters} />
          <p className="wr-showing" aria-live="polite">
            {t.filters.showing(visible.length, items.length)}
          </p>
          {visible.length ? (
            <ul className="wr-grid">
              {visible.map((item) => (
                <ItemCard key={item.id} item={item} onRemove={onRemove} />
              ))}
            </ul>
          ) : (
            <div className="wr-nomatch">
              <p>{t.empty.noMatch}</p>
              <button type="button" className="btn btn--ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
                {t.filters.clear}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
