import { useLang, useText } from '@shared/i18n.js'
import { STATUSES, formatDate, interviewDays, localize, relativeDays } from './jobs.js'
import { TEXT } from './text.js'

export const EditIcon = () => {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z M13.5 6.5l4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// The keyboard (and touch) alternative to drag & drop: a plain <select>.
export const StatusSelect = ({ job, onMove }) => {
  const t = useText(TEXT)
  return (
    <label className="jt-status">
      <span className="visually-hidden">{t.moveTo(job.company)}</span>
      <select className="jt-select" value={job.status} onChange={(e) => onMove(job.id, e.target.value)}>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {t.statuses[status]}
          </option>
        ))}
      </select>
    </label>
  )
}

export const InterviewBadge = ({ job }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const days = interviewDays(job)
  if (days === null) return null

  const tone = days < 0 ? ' is-past' : days <= 2 ? ' is-soon' : ''
  return (
    <p className={`jt-badge${tone}`}>
      <span className="jt-badge__dot" aria-hidden="true" />
      {t.interviewBadge(relativeDays(days, lang))}
    </p>
  )
}

const JobCard = ({ job, isDragging, onDragStart, onDragEnd, onMove, onEdit }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const headingId = `jt-card-${job.id}`
  const notes = localize(job.notes, lang)

  return (
    <article
      className={`jt-card${isDragging ? ' is-dragging' : ''}`}
      aria-labelledby={headingId}
      draggable
      onDragStart={(e) => {
        // The id travels with the drag; the drop zone reads it back in onDrop.
        e.dataTransfer.setData('text/plain', job.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(job.id)
      }}
      onDragEnd={onDragEnd}
    >
      <div className="jt-card__head">
        <h4 id={headingId} className="jt-card__company">
          {job.company}
        </h4>
        <button type="button" className="jt-icon-btn" aria-label={t.edit(job.company)} title={t.edit(job.company)} onClick={() => onEdit(job)}>
          <EditIcon />
        </button>
      </div>
      <p className="jt-card__role">{job.role}</p>

      <dl className="jt-card__meta">
        <div>
          <dt>{t.appliedOn}</dt>
          <dd>{formatDate(job.applied, lang)}</dd>
        </div>
        {job.salary && (
          <div>
            <dt>{t.salary}</dt>
            <dd>{job.salary}</dd>
          </div>
        )}
      </dl>

      <InterviewBadge job={job} />
      {notes && <p className="jt-card__notes">{notes}</p>}

      <StatusSelect job={job} onMove={onMove} />
    </article>
  )
}

export default JobCard
