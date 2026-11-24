import { colorOf, inkOn } from './categories.js'
import { costPer } from './money.js'

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

const urgency = (days) => (days <= 3 ? 'urgent' : days <= 7 ? 'soon' : 'later')

const SubscriptionItem = ({ sub, view, money, date, onEdit, onRemove, t }) => {
  const equivalent = sub.cycle !== view ? costPer(view, sub) : null

  return (
    <li className="sb-item">
      {/* A generated "logo": initials on the category colour. */}
      <span className="sb-logo" style={{ background: colorOf(sub.category), color: inkOn(sub.category) }} aria-hidden="true">
        {initials(sub.name) || '?'}
      </span>

      <div className="sb-item__main">
        <span className="sb-item__name">{sub.name}</span>
        <span className="sb-item__meta">
          {t.categories[sub.category]} · {t.list.renews(date(sub.next))}
        </span>
        <span className={`sb-badge is-${urgency(sub.days)}`}>{t.badge(sub.days)}</span>
      </div>

      <div className="sb-item__price">
        <strong>
          {money(sub.amount, sub.currency)} <span>{t.cycleShort[sub.cycle]}</span>
        </strong>
        {equivalent !== null && (
          <small>
            ≈ {money(equivalent, sub.currency)} {t.cycleShort[view]}
          </small>
        )}
      </div>

      <div className="sb-item__actions">
        <button type="button" className="sb-icon-btn" aria-label={t.list.edit(sub.name)} onClick={() => onEdit(sub.id)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4Z" />
            <path d="m13.5 6.5 4 4" />
          </svg>
        </button>
        <button type="button" className="sb-icon-btn sb-icon-btn--danger" aria-label={t.list.remove(sub.name)} onClick={() => onRemove(sub)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </div>
    </li>
  )
}

export default SubscriptionItem
