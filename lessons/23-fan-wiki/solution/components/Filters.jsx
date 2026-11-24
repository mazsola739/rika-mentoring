import { useRef } from 'react'
import { GENDERS, STATUSES } from '../api.js'

// Controlled inputs whose values come from the URL: onChange writes the URL, the URL re-renders us.
export default function Filters({ filters, onChange, t }) {
  const inputRef = useRef(null)

  return (
    <div className="fw-filters">
      <div className="fw-search">
        <label className="field">
          <span>{t.search}</span>
          <input
            ref={inputRef}
            className="input"
            type="search"
            value={filters.name}
            placeholder={t.placeholder}
            autoComplete="off"
            spellCheck="false"
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </label>
        {filters.name && (
          <button
            type="button"
            className="fw-search__clear"
            aria-label={t.clear}
            onClick={() => {
              onChange({ name: '' })
              inputRef.current?.focus()
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      <fieldset className="fw-filters__status">
        <legend>{t.statusLabel}</legend>
        <div className="fw-chips">
          {['', ...STATUSES].map((value) => (
            <button
              key={value || 'any'}
              type="button"
              className="chip"
              aria-pressed={filters.status === value}
              onClick={() => onChange({ status: value })}
            >
              {value ? t.status[value] : t.any}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field fw-filters__gender">
        <span>{t.genderLabel}</span>
        <select className="input" value={filters.gender} onChange={(e) => onChange({ gender: e.target.value })}>
          <option value="">{t.any}</option>
          {GENDERS.map((value) => (
            <option key={value} value={value}>
              {t.gender[value]}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
