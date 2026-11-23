import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { BASE_USERS, ROLES, STATUSES } from './users.js'
import { downloadText, filterUsers, paginate, sortUsers, toCsv } from './tableLogic.js'
import EditableCell from './EditableCell.jsx'
import Pagination, { PAGE_SIZES } from './Pagination.jsx'
import { TEXT } from './text.js'
import './app.css'

const COLUMNS = ['name', 'email', 'role', 'country', 'status', 'joined']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Edits are stored as patches on top of the generated data: { [id]: { name?, email?, role?, status? } }
const isEdits = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every((patch) => patch && typeof patch === 'object')

function SortIcon({ dir }) {
  return (
    <svg className="dt-sort__icon" viewBox="0 0 12 16" width="10" height="14" aria-hidden="true" focusable="false">
      <path d="M6 1 10 6H2z" fill="currentColor" opacity={dir === 'asc' ? 1 : 0.3} />
      <path d="M6 15 2 10h8z" fill="currentColor" opacity={dir === 'desc' ? 1 : 0.3} />
    </svg>
  )
}

function DataTable() {
  const lang = useLang()
  const t = useText(TEXT)
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'

  const [edits, setEdits] = useLocalStorage('rika:data-table:edits', {}, isEdits)
  const [pageSize, setPageSize] = useLocalStorage('rika:data-table:page-size', 25, (v) => PAGE_SIZES.includes(v))
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(() => new Set())
  const [editing, setEditing] = useState(null) // { id, field }
  const [bulkStatus, setBulkStatus] = useState('')
  const [message, setMessage] = useState('')

  // Typing stays instant: React filters with the "deferred" copy of the query when it has time.
  const deferredQuery = useDeferredValue(query)

  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale])
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }), [locale])
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const users = useMemo(() => BASE_USERS.map((u) => (edits[u.id] ? { ...u, ...edits[u.id] } : u)), [edits])

  // The text shown in a column. Searching, sorting and the CSV all use it, so they match what you see.
  const valueOf = useCallback(
    (user, key) => {
      if (key === 'role') return t.roles[user.role]
      if (key === 'status') return t.statuses[user.status]
      if (key === 'country') return regionNames.of(user.country) ?? user.country
      return user[key]
    },
    [t, regionNames],
  )

  // Build the lowercase search text once per user, not on every keystroke.
  const searchIndex = useMemo(
    () => new Map(users.map((u) => [u.id, ['name', 'email', 'role', 'country', 'status'].map((k) => valueOf(u, k)).join(' ').toLocaleLowerCase()])),
    [users, valueOf],
  )

  const filtered = useMemo(
    () => filterUsers(users, { query: deferredQuery, role, status }, (u) => searchIndex.get(u.id)),
    [users, deferredQuery, role, status, searchIndex],
  )
  const sorted = useMemo(() => sortUsers(filtered, sort, valueOf, locale), [filtered, sort, valueOf, locale])
  const view = paginate(sorted, page, pageSize)

  // ── Filters, sorting, paging ──────────────────────────
  const goTo = (next) => {
    setPage(next)
    setEditing(null)
  }
  const filterWith = (setter) => (e) => {
    setter(e.target.value)
    goTo(1)
  }
  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
    goTo(1)
  }
  const filtersActive = query || role !== 'all' || status !== 'all'
  const clearFilters = () => {
    setQuery('')
    setRole('all')
    setStatus('all')
    goTo(1)
  }

  // ── Selection (a Set of ids survives paging and filtering) ──
  const pageIds = view.rows.map((u) => u.id)
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length
  const allOnPage = pageIds.length > 0 && selectedOnPage === pageIds.length
  const allMatching = sorted.length > 0 && sorted.every((u) => selected.has(u.id))

  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev)
      pageIds.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)))
      return next
    })
  const selectAllMatching = () => setSelected((prev) => new Set([...prev, ...sorted.map((u) => u.id)]))
  const clearSelection = () => setSelected(new Set())

  // ── Editing ───────────────────────────────────────────
  const saveCell = (user, field, value) => {
    setEdits((prev) => ({ ...prev, [user.id]: { ...prev[user.id], [field]: value } }))
    setEditing(null)
    setMessage(t.saved(t.columns[field], field === 'name' ? value : user.name))
  }

  const applyBulkStatus = () => {
    if (!bulkStatus) return
    setEdits((prev) => {
      const next = { ...prev }
      selected.forEach((id) => {
        next[id] = { ...next[id], status: bulkStatus }
      })
      return next
    })
    setMessage(t.bulkDone(number.format(selected.size), t.statuses[bulkStatus]))
    setBulkStatus('')
  }

  const editedCount = Object.keys(edits).length
  const discardEdits = () => {
    if (window.confirm(t.resetConfirm)) {
      setEdits({})
      setEditing(null)
    }
  }

  // ── CSV export ────────────────────────────────────────
  const exportCsv = (rows, name) => {
    const columns = [
      { label: t.id, value: (u) => u.id },
      ...COLUMNS.map((key) => ({ label: t.columns[key], value: (u) => valueOf(u, key) })),
    ]
    const today = new Date().toISOString().slice(0, 10)
    downloadText(toCsv(rows, columns), `${name}-${today}.csv`)
  }
  const exportSelected = () => exportCsv(sortUsers(users.filter((u) => selected.has(u.id)), sort, valueOf, locale), 'users-selected')

  const sortLabel = t.sortedBy(t.columns[sort.key], sort.dir)

  return (
    <div className="dt">
      <div className="dt-filters">
        <label className="field dt-filters__search">
          <span>{t.search}</span>
          <input
            className="input"
            type="search"
            value={query}
            placeholder={t.searchPlaceholder}
            onChange={(e) => {
              setQuery(e.target.value)
              goTo(1)
            }}
          />
        </label>
        <label className="field">
          <span>{t.columns.role}</span>
          <select className="input" value={role} onChange={filterWith(setRole)}>
            <option value="all">{t.anyRole}</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t.roles[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t.columns.status}</span>
          <select className="input" value={status} onChange={filterWith(setStatus)}>
            <option value="all">{t.anyStatus}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t.statuses[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="dt-bar">
        <p className="dt-bar__count" aria-live="polite">
          <strong>{t.found(number.format(sorted.length))}</strong>
          {filtersActive && (
            <button type="button" className="dt-link" onClick={clearFilters}>
              {t.clear}
            </button>
          )}
        </p>
        <button type="button" className="btn btn--ghost" disabled={sorted.length === 0} onClick={() => exportCsv(sorted, 'users')}>
          {t.exportView(number.format(sorted.length))}
        </button>
      </div>

      {selected.size > 0 && (
        <div className="dt-selection" role="region" aria-label={t.selected(number.format(selected.size))}>
          <div className="dt-selection__info">
            <strong>{t.selected(number.format(selected.size))}</strong>
            {allMatching ? (
              <span>{t.allSelected(number.format(sorted.length))}</span>
            ) : (
              allOnPage &&
              sorted.length > pageIds.length && (
                <span>
                  {t.pageSelected(number.format(pageIds.length))}{' '}
                  <button type="button" className="dt-link" onClick={selectAllMatching}>
                    {t.selectAllMatching(number.format(sorted.length))}
                  </button>
                </span>
              )
            )}
          </div>
          <div className="dt-selection__actions">
            <label className="dt-inline">
              <span>{t.setStatus}</span>
              <select className="dt-select" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
                <option value="">{t.chooseStatus}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t.statuses[s]}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn dt-btn-sm" disabled={!bulkStatus} onClick={applyBulkStatus}>
              {t.apply}
            </button>
            <button type="button" className="btn btn--ghost dt-btn-sm" onClick={exportSelected}>
              {t.exportSelected(number.format(selected.size))}
            </button>
            <button type="button" className="dt-link" onClick={clearSelection}>
              {t.clearSelection}
            </button>
          </div>
        </div>
      )}

      {/* Only this wrapper scrolls sideways on small screens; tabIndex lets keyboard users scroll it too. */}
      <div className="dt-scroll" role="region" aria-labelledby="dt-caption" tabIndex={0}>
        <table className="dt-table">
          <caption id="dt-caption" className="visually-hidden">
            {t.caption}, {sortLabel}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="dt-check">
                <input
                  type="checkbox"
                  checked={allOnPage}
                  // "indeterminate" exists only as a DOM property, so it is set through a ref callback.
                  ref={(el) => {
                    if (el) el.indeterminate = selectedOnPage > 0 && !allOnPage
                  }}
                  disabled={pageIds.length === 0}
                  aria-label={t.selectPage}
                  onChange={togglePage}
                />
              </th>
              {COLUMNS.map((key) => (
                <th
                  key={key}
                  scope="col"
                  className={`dt-col-${key}`}
                  aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <button type="button" className="dt-sort" onClick={() => toggleSort(key)}>
                    {t.columns[key]}
                    <SortIcon dir={sort.key === key ? sort.dir : null} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((user) => {
              const isSelected = selected.has(user.id)
              const cell = (field, kind, display, extra = {}) => (
                <EditableCell
                  kind={kind}
                  value={user[field]}
                  display={display}
                  label={t.editCell(t.columns[field], valueOf(user, field))}
                  editing={editing?.id === user.id && editing.field === field}
                  onStart={() => setEditing({ id: user.id, field })}
                  onSave={(value) => saveCell(user, field, value)}
                  onCancel={() => setEditing(null)}
                  {...extra}
                />
              )
              return (
                <tr key={user.id} className={isSelected ? 'is-selected' : undefined}>
                  <td className="dt-check">
                    <input type="checkbox" checked={isSelected} aria-label={t.selectRow(user.name)} onChange={() => toggleRow(user.id)} />
                  </td>
                  <th scope="row" className="dt-col-name">
                    {cell('name', 'text', user.name, { validate: (v) => (v.trim() ? null : t.invalid.name) })}
                  </th>
                  <td className="dt-col-email">
                    {cell('email', 'email', user.email, { validate: (v) => (EMAIL_RE.test(v.trim()) ? null : t.invalid.email) })}
                  </td>
                  <td>{cell('role', 'select', t.roles[user.role], { options: ROLES, optionLabel: (r) => t.roles[r] })}</td>
                  <td>{valueOf(user, 'country')}</td>
                  <td>
                    {cell('status', 'select', <span className={`dt-badge dt-badge--${user.status}`}>{t.statuses[user.status]}</span>, {
                      options: STATUSES,
                      optionLabel: (s) => t.statuses[s],
                    })}
                  </td>
                  <td className="dt-col-joined">
                    <time dateTime={user.joined}>{dateFormat.format(new Date(user.joined))}</time>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {view.rows.length === 0 && (
          <div className="dt-empty">
            <p>{t.noResults}</p>
            {filtersActive && (
              <button type="button" className="btn btn--ghost" onClick={clearFilters}>
                {t.clear}
              </button>
            )}
          </div>
        )}
      </div>

      <Pagination
        page={view.page}
        pageCount={view.pageCount}
        start={view.start}
        end={view.end}
        total={sorted.length}
        pageSize={pageSize}
        format={(n) => number.format(n)}
        onPage={goTo}
        onPageSize={(size) => {
          setPageSize(size)
          goTo(1)
        }}
      />

      <div className="dt-footer">
        <p className="dt-hint">{t.hint}</p>
        {editedCount > 0 && (
          <p className="dt-edited">
            {t.edited(editedCount)} ·{' '}
            <button type="button" className="dt-link" onClick={discardEdits}>
              {t.resetEdits}
            </button>
          </p>
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {message}
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="data-table">
      <DataTable />
    </AppFrame>
  )
}
