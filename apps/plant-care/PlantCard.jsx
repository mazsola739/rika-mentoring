import { useState } from 'react'
import { waterStatus } from './plantMath.js'
import { tx } from './text.js'
import PlantForm from './PlantForm.jsx'
import PlantAvatar, { plantColor } from './PlantAvatar.jsx'

function statusText(status, t) {
  if (status.dueIn < 0) return t.status.overdue(-status.dueIn)
  if (status.dueIn === 0) return t.status.today
  if (status.dueIn === 1) return t.status.soon
  return t.status.ok(status.dueIn)
}

export default function PlantCard({ plant, now, fmt, lang, t, onWater, onSave, onDelete }) {
  const [mode, setMode] = useState('view') // 'view' | 'edit' | 'confirm'
  const name = tx(plant.name, lang)
  const status = waterStatus(plant, now)
  const log = plant.log ?? []

  if (mode === 'edit') {
    return (
      <li className="pc-card pc-plant">
        <PlantForm
          plant={plant}
          lang={lang}
          t={t}
          onCancel={() => setMode('view')}
          onSave={(next) => {
            onSave(next)
            setMode('view')
          }}
        />
      </li>
    )
  }

  return (
    <li className={`pc-card pc-plant is-${status.state}`}>
      <div className="pc-plant__media">
        {plant.photo ? (
          <img src={plant.photo} alt={name} loading="lazy" />
        ) : (
          <span className="pc-plant__blank">
            <PlantAvatar color={plantColor(plant)} />
          </span>
        )}
        <span className={`pc-pill is-${status.state}`}>
          <span aria-hidden="true">{status.state === 'thirsty' ? '💧' : status.state === 'soon' ? '⏳' : '✓'}</span>
          {statusText(status, t)}
        </span>
      </div>

      <div className="pc-plant__body">
        <h4>{name}</h4>
        <p className="pc-plant__meta">
          {t.lastWatered(fmt.relative(status.days))} · {t.every(plant.interval)}
        </p>

        {/* The gauge is decorative; the pill above already says it in words. */}
        <div className="pc-gauge" aria-hidden="true">
          <span style={{ width: `${status.level * 100}%` }} />
        </div>

        {mode === 'confirm' ? (
          <div className="pc-confirm" role="group" aria-label={t.confirmDelete}>
            <p>{t.confirmDelete}</p>
            <div className="pc-row">
              <button type="button" className="btn pc-btn-danger" onClick={() => onDelete(plant.id)}>
                {t.yes}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setMode('view')} autoFocus>
                {t.no}
              </button>
            </div>
          </div>
        ) : (
          <div className="pc-plant__actions">
            <button type="button" className="btn pc-water" aria-label={t.waterName(name)} onClick={() => onWater([plant.id])}>
              <span aria-hidden="true">💧</span> {t.waterNow}
            </button>
            <button type="button" className="pc-icon-btn" aria-label={t.editName(name)} title={t.edit} onClick={() => setMode('edit')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4Z" />
                <path d="m13.5 6.5 4 4" />
              </svg>
            </button>
            <button type="button" className="pc-icon-btn" aria-label={t.deleteName(name)} title={t.delete} onClick={() => setMode('confirm')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </svg>
            </button>
          </div>
        )}

        <details className="pc-log">
          <summary>{t.history(log.length)}</summary>
          {log.length ? (
            <ol>
              {log.map((iso) => (
                <li key={iso}>
                  <time dateTime={iso}>{fmt.dateTime(iso)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <p>{t.noHistory}</p>
          )}
        </details>
      </div>
    </li>
  )
}
