import { useMemo, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import {
  NO_FILTERS,
  STATUSES,
  STATUS_COLOR,
  byAppliedDesc,
  createId,
  formatDate,
  isJobList,
  matchesFilters,
  sampleJobs,
} from './jobs.js'
import JobCard, { EditIcon, InterviewBadge, StatusSelect } from './JobCard.jsx'
import JobDialog from './JobDialog.jsx'
import Stats from './Stats.jsx'
import { TEXT } from './text.js'
import './app.css'

function Filters({ filters, onChange }) {
  const t = useText(TEXT)
  const set = (patch) => onChange({ ...filters, ...patch })
  const active = filters.query || filters.period !== 'any' || filters.upcoming

  return (
    <div className="jt-filters">
      <label className="field jt-filters__search">
        <span>{t.search}</span>
        <input
          className="input"
          type="search"
          value={filters.query}
          placeholder={t.searchPlaceholder}
          onChange={(e) => set({ query: e.target.value })}
        />
      </label>
      <label className="field">
        <span>{t.period}</span>
        <select className="input" value={filters.period} onChange={(e) => set({ period: e.target.value })}>
          {Object.entries(t.periods).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="jt-filters__chips">
        <button type="button" className="chip" aria-pressed={filters.upcoming} onClick={() => set({ upcoming: !filters.upcoming })}>
          {t.upcoming}
        </button>
        {active && (
          <button type="button" className="jt-link" onClick={() => onChange(NO_FILTERS)}>
            {t.clear}
          </button>
        )}
      </div>
    </div>
  )
}

function Board({ jobs, colorOf, onMove, onEdit }) {
  const t = useText(TEXT)
  // The ref is read synchronously by dragover; the state only drives the "lifted" styling.
  const dragIdRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)
  const [overStatus, setOverStatus] = useState(null)

  const startDrag = (id) => {
    dragIdRef.current = id
    // Defer the style change so the browser's drag image is taken from the un-dimmed card.
    setTimeout(() => {
      if (dragIdRef.current === id) setDraggingId(id)
    }, 0)
  }
  const endDrag = () => {
    dragIdRef.current = null
    setDraggingId(null)
    setOverStatus(null)
  }

  return (
    <div className="jt-board">
      {STATUSES.map((status) => {
        const items = jobs.filter((job) => job.status === status)
        return (
          <section
            key={status}
            className={`jt-col${overStatus === status ? ' is-over' : ''}`}
            style={{ '--jt-col': colorOf(status) }}
            aria-labelledby={`jt-col-${status}`}
            onDragOver={(e) => {
              if (!dragIdRef.current) return // ignore files, links and text from elsewhere
              e.preventDefault() // preventDefault marks this element as a valid drop target
              e.dataTransfer.dropEffect = 'move'
              if (overStatus !== status) setOverStatus(status)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setOverStatus((s) => (s === status ? null : s))
            }}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/plain') || dragIdRef.current
              if (id) onMove(id, status)
              endDrag()
            }}
          >
            <header className="jt-col__head">
              <span className="jt-col__dot" aria-hidden="true" />
              <h3 id={`jt-col-${status}`}>{t.statuses[status]}</h3>
              <span className="jt-col__count">{items.length}</span>
            </header>
            {items.length > 0 ? (
              <ul className="jt-col__list">
                {items.map((job) => (
                  <li key={job.id}>
                    <JobCard
                      job={job}
                      isDragging={draggingId === job.id}
                      onDragStart={startDrag}
                      onDragEnd={endDrag}
                      onMove={onMove}
                      onEdit={onEdit}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="jt-col__empty">{t.emptyColumn}</p>
            )}
          </section>
        )
      })}
    </div>
  )
}

function List({ jobs, colorOf, onMove, onEdit }) {
  const lang = useLang()
  const t = useText(TEXT)
  return (
    <ul className="jt-list">
      {jobs.map((job) => (
        <li key={job.id} className="jt-row" style={{ '--jt-col': colorOf(job.status) }}>
          <span className="jt-col__dot" aria-hidden="true" />
          <div className="jt-row__main">
            <strong>{job.company}</strong>
            <span>{job.role}</span>
            <InterviewBadge job={job} />
          </div>
          <span className="jt-row__date">
            <span className="visually-hidden">{t.appliedOn}: </span>
            {formatDate(job.applied, lang)}
          </span>
          <StatusSelect job={job} onMove={onMove} />
          <button type="button" className="jt-icon-btn" aria-label={t.edit(job.company)} title={t.edit(job.company)} onClick={() => onEdit(job)}>
            <EditIcon />
          </button>
        </li>
      ))}
    </ul>
  )
}

function JobTracker() {
  const lang = useLang()
  const t = useText(TEXT)
  const { palette } = useLesson()
  const [jobs, setJobs] = useLocalStorage('rika:job-tracker:jobs', sampleJobs, isJobList)
  const [view, setView] = useLocalStorage('rika:job-tracker:view', 'board', (v) => v === 'board' || v === 'list')
  const [filters, setFilters] = useState(NO_FILTERS)
  const [dialog, setDialog] = useState(null) // null | { job } (edit) | { job: null } (add)
  const [message, setMessage] = useState('')

  const visible = useMemo(
    () => jobs.filter((job) => matchesFilters(job, filters, lang)).sort(byAppliedDesc),
    [jobs, filters, lang],
  )

  const colorOf = (status) => palette.colors[STATUS_COLOR[status]] ?? 'var(--solid)'

  const moveJob = (id, status) => {
    const job = jobs.find((j) => j.id === id)
    if (!job || job.status === status) return
    setJobs((list) => list.map((j) => (j.id === id ? { ...j, status } : j)))
    setMessage(t.moved(job.company, t.statuses[status]))
  }

  const saveJob = (data) => {
    const editing = dialog.job
    if (editing) {
      setJobs((list) => list.map((j) => (j.id === editing.id ? { ...j, ...data } : j)))
      setMessage(t.updated(data.company))
    } else {
      setJobs((list) => [{ id: createId(), ...data }, ...list])
      setMessage(t.added(data.company))
    }
    setDialog(null)
  }

  const deleteJob = () => {
    const { job } = dialog
    setJobs((list) => list.filter((j) => j.id !== job.id))
    setMessage(t.deleted(job.company))
    setDialog(null)
  }

  const resetSample = () => {
    if (window.confirm(t.resetConfirm)) {
      setJobs(sampleJobs())
      setFilters(NO_FILTERS)
    }
  }

  return (
    <div className="jt">
      <div className="jt-top">
        <Stats jobs={jobs} />
      </div>

      <div className="jt-toolbar">
        <Filters filters={filters} onChange={setFilters} />
        <div className="jt-toolbar__end">
          <div className="jt-segment" role="group" aria-label={t.view}>
            {['board', 'list'].map((v) => (
              <button key={v} type="button" className="chip" aria-pressed={view === v} onClick={() => setView(v)}>
                {t[v]}
              </button>
            ))}
          </div>
          <button type="button" className="btn" onClick={() => setDialog({ job: null })}>
            <span aria-hidden="true">+</span> {t.add}
          </button>
        </div>
      </div>

      <p className="jt-summary" aria-live="polite">
        {t.showing(visible.length, jobs.length)}
      </p>

      {jobs.length === 0 ? (
        <div className="jt-empty">
          <p>{t.empty}</p>
          <button type="button" className="btn" onClick={() => setDialog({ job: null })}>
            {t.add}
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="jt-empty">
          <p>{t.noMatches}</p>
          <button type="button" className="btn btn--ghost" onClick={() => setFilters(NO_FILTERS)}>
            {t.clear}
          </button>
        </div>
      ) : view === 'board' ? (
        <>
          <Board jobs={visible} colorOf={colorOf} onMove={moveJob} onEdit={(job) => setDialog({ job })} />
          <p className="jt-hint">{t.hint}</p>
        </>
      ) : (
        <List jobs={visible} colorOf={colorOf} onMove={moveJob} onEdit={(job) => setDialog({ job })} />
      )}

      <div className="jt-footer">
        <button type="button" className="jt-link" onClick={resetSample}>
          {t.reset}
        </button>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {message}
      </p>

      {dialog && (
        <JobDialog
          job={dialog.job}
          onSave={saveJob}
          onDelete={deleteJob}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="job-tracker">
      <JobTracker />
    </AppFrame>
  )
}
