import { useText } from '@shared/i18n.js'
import { fromKey, slotsFor } from '../dates.js'
import { OPENING_HOURS } from '../services.js'
import { TEXT, useFormat } from '../text.js'

const SlotPicker = ({ dayKey, service, bookings, selectedStart, onSelect }) => {
  const t = useText(TEXT)
  const format = useFormat()

  if (!dayKey) return <p className="bk-muted bk-slots__hint">{t.noDay}</p>

  const day = fromKey(dayKey)
  if (!OPENING_HOURS[day.getDay()]) return <p className="bk-muted bk-slots__hint">{t.closedDay}</p>

  // Free times = opening hours minus bookings minus the past. Calculated, not stored.
  const slots = slotsFor(day, service, bookings)
  const free = slots.filter((s) => s.status === 'free')
  if (slots.every((s) => s.status === 'past')) return <p className="bk-muted bk-slots__hint">{t.noMoreToday}</p>

  return (
    <div className="bk-slots">
      <h3 className="bk-slots__title">{t.slotsFor(format.longDate(day))}</h3>
      <p className="bk-muted" aria-live="polite">
        {free.length ? t.freeCount(free.length) : t.fullDay}
      </p>
      <div className="bk-slots__grid" role="group" aria-label={t.chooseTime}>
        {slots
          .filter((s) => s.status !== 'past')
          .map((slot) => {
            const iso = slot.start.toISOString()
            const booked = slot.status === 'booked'
            return (
              <button
                key={iso}
                type="button"
                className={`bk-slot${booked ? ' is-booked' : ''}`}
                aria-pressed={selectedStart === iso}
                disabled={booked}
                onClick={() => onSelect(iso)}
              >
                {format.time(slot.start)}
                {booked && <span className="visually-hidden"> ({t.slotBooked})</span>}
              </button>
            )
          })}
      </div>
    </div>
  )
}

export default SlotPicker
