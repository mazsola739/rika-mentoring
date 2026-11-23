import { REMIND_DAYS } from './useReminders.js'

export default function RemindersPanel({ upcoming, reminders, t }) {
  const r = t.reminders

  let status
  if (!reminders.supported) status = <p className="sb-muted">{r.unsupported}</p>
  else if (reminders.permission === 'denied') status = <p className="sb-muted">{r.denied}</p>
  else if (reminders.active) {
    status = (
      <>
        <p className="sb-muted">{r.on(REMIND_DAYS)}</p>
        <div className="sb-row">
          <button type="button" className="btn btn--ghost" onClick={() => reminders.test(r.testTitle, r.testBody)}>
            {r.test}
          </button>
          <button type="button" className="sb-link" onClick={reminders.disable}>
            {r.disable}
          </button>
        </div>
      </>
    )
  } else {
    status = (
      <button type="button" className="btn btn--ghost" onClick={reminders.enable}>
        <span aria-hidden="true">🔔</span> {r.enable}
      </button>
    )
  }

  return (
    <section className="sb-card sb-reminders" aria-labelledby="sb-reminders-title">
      <h3 id="sb-reminders-title">{r.title}</h3>
      {upcoming.length ? (
        <>
          <p className="sb-muted">{r.soon(REMIND_DAYS)}</p>
          <ul className="sb-upcoming">
            {upcoming.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.badge}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="sb-muted">{r.none(REMIND_DAYS)}</p>
      )}
      {status}
    </section>
  )
}
