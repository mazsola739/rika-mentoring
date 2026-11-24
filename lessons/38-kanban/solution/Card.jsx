import LevelMeter from '@shared/ui/LevelMeter.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { COLUMNS, localize } from './boardReducer.js'
import { TEXT } from './text.js'

const LEVEL = { high: 3, medium: 2, low: 1 }

export const Priority = ({ value }) => {
  const t = useText(TEXT)
  return (
    <span className={`kb-prio kb-prio--${value}`}>
      <LevelMeter value={LEVEL[value]} max={3} />
      <span>
        <span className="visually-hidden">{t.priority}: </span>
        {t.priorities[value]}
      </span>
    </span>
  )
}

const GripIcon = () => {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      {[3, 8, 13].map((y) => [5.5, 10.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor" />))}
    </svg>
  )
}

const EditIcon = () => {
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

// One component for both uses: the real card in a column, and the floating copy while dragging
// (`preview` leaves out every interactive control).
const Card = ({ card, column, preview = false, picked = false, onHandleKey, onHandleBlur, onMoveTo, onEdit }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const title = localize(card.title, lang)
  const description = localize(card.description, lang)
  const titleId = preview ? undefined : `kb-title-${card.id}`

  return (
    <article className={`kb-card kb-card--${card.priority}`} aria-labelledby={titleId}>
      <div className="kb-card__top">
        <Priority value={card.priority} />
        {preview ? (
          <span className="kb-handle" aria-hidden="true">
            <GripIcon />
          </span>
        ) : (
          <button
            type="button"
            className="kb-handle"
            data-drag-handle
            data-focus={`handle-${card.id}`}
            aria-label={t.handle(title)}
            aria-describedby="kb-help"
            aria-pressed={picked}
            onKeyDown={onHandleKey}
            onBlur={onHandleBlur}
          >
            <GripIcon />
          </button>
        )}
      </div>

      <h4 id={titleId} className="kb-card__title">
        {title}
      </h4>
      {description && <p className="kb-card__desc">{description}</p>}

      {!preview && (
        <div className="kb-card__foot">
          <label className="kb-move">
            <span className="visually-hidden">{t.moveTo(title)}</span>
            <select className="kb-select" data-focus={`select-${card.id}`} value={column} onChange={(e) => onMoveTo(e.target.value)}>
              {COLUMNS.map((c) => (
                <option key={c} value={c}>
                  {t.columns[c]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="kb-icon-btn" aria-label={t.edit(title)} title={t.edit(title)} onClick={onEdit}>
            <EditIcon />
          </button>
        </div>
      )}
    </article>
  )
}

export default Card
