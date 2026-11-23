import { useEffect, useMemo, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { REMIND_DAYS, useReminders } from './useReminders.js'
import { createSamples } from './sampleData.js'
import { daysBetween, fromISODate, nextRenewal, todayISO } from './dates.js'
import { convert, costPer, moneyFormatter } from './money.js'
import { CATEGORIES } from './categories.js'
import Totals from './Totals.jsx'
import SubscriptionItem from './SubscriptionItem.jsx'
import SubscriptionForm from './SubscriptionForm.jsx'
import RemindersPanel from './RemindersPanel.jsx'
import { TEXT } from './text.js'
import './app.css'

const SORTERS = {
  renewal: (a, b) => a.days - b.days || a.name.localeCompare(b.name),
  // Compare prices fairly: same period (monthly) and same currency (EUR).
  price: (a, b) => convert(costPer('monthly', b), b.currency, 'EUR') - convert(costPer('monthly', a), a.currency, 'EUR'),
  name: (a, b) => a.name.localeCompare(b.name),
}

// "Today" as a date string that updates itself after midnight while the page is open.
function useToday() {
  const [today, setToday] = useState(todayISO)
  useEffect(() => {
    const timer = setInterval(() => setToday(todayISO()), 60_000)
    return () => clearInterval(timer)
  }, [])
  return today
}

function SubscriptionTracker() {
  const t = useText(TEXT)
  const lang = useLang()
  const today = useToday()
  const [subs, setSubs] = useLocalStorage('rika:subscriptions:items', createSamples)
  const [view, setView] = useLocalStorage('rika:subscriptions:view', 'monthly')
  const [currency, setCurrency] = useLocalStorage('rika:subscriptions:currency', 'EUR')
  const [sort, setSort] = useState('renewal')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState(null) // { kind: 'added' | 'saved' | 'removed', sub }

  const money = moneyFormatter(lang)
  const dateFormat = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
  const date = (iso) => dateFormat.format(fromISODate(iso))

  // Derived data: next renewal and days left are computed, never stored.
  const enriched = useMemo(
    () =>
      subs.map((s) => {
        const next = nextRenewal(s.startDate, s.cycle, today)
        return { ...s, next, days: daysBetween(today, next) }
      }),
    [subs, today],
  )

  const visible = enriched.filter((s) => filter === 'all' || s.category === filter).sort(SORTERS[sort])
  const editing = enriched.find((s) => s.id === editingId) ?? null

  const upcoming = useMemo(
    () =>
      enriched
        .filter((s) => s.days <= REMIND_DAYS)
        .sort(SORTERS.renewal)
        .map((s) => {
          const badge = t.badge(s.days)
          return {
            id: s.id,
            name: s.name,
            nextDate: s.next,
            badge,
            title: t.reminders.notifyTitle(s.name),
            body: t.reminders.notifyBody(badge, money(s.amount, s.currency)),
          }
        }),
    // `money` and `t` are derived from `lang`, so listing `lang` is enough.
    [enriched, lang],
  )
  const reminders = useReminders(upcoming)

  const save = (sub) => {
    const exists = subs.some((s) => s.id === sub.id)
    setSubs((list) => (exists ? list.map((s) => (s.id === sub.id ? sub : s)) : [...list, sub]))
    setMessage({ kind: exists ? 'saved' : 'added', sub })
    setEditingId(null)
  }

  const remove = (sub) => {
    setSubs((list) => list.filter((s) => s.id !== sub.id))
    if (editingId === sub.id) setEditingId(null)
    setMessage({ kind: 'removed', sub })
  }

  const undo = () => {
    const { sub } = message
    setSubs((list) => [...list, { id: sub.id, name: sub.name, amount: sub.amount, currency: sub.currency, cycle: sub.cycle, startDate: sub.startDate, category: sub.category }])
    setMessage(null)
  }

  // Status messages fade out after a while; the cleanup cancels the timer if a new one comes.
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 8000)
    return () => clearTimeout(timer)
  }, [message])

  const messageText =
    message &&
    (message.kind === 'removed'
      ? t.list.removed(message.sub.name)
      : message.kind === 'saved'
        ? t.form.saved(message.sub.name)
        : t.form.added(message.sub.name))

  const presentCategories = CATEGORIES.filter((c) => subs.some((s) => s.category === c.key))

  return (
    <div className="sb">
      <Totals subs={subs} view={view} onView={setView} currency={currency} onCurrency={setCurrency} money={money} t={t} />

      <section className="sb-card sb-list" aria-labelledby="sb-list-title">
        <div className="sb-list__head">
          <h3 id="sb-list-title">{t.list.title}</h3>
          <div className="sb-row">
            <label className="sb-inline-field">
              <span>{t.list.sort}</span>
              <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.keys(SORTERS).map((key) => (
                  <option key={key} value={key}>
                    {t.list.sorts[key]}
                  </option>
                ))}
              </select>
            </label>
            <label className="sb-inline-field">
              <span>{t.list.filter}</span>
              <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">{t.list.all}</option>
                {presentCategories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {t.categories[c.key]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="sb-status" role="status">
          {messageText && (
            <>
              <span>{messageText}</span>
              {message.kind === 'removed' && (
                <button type="button" className="sb-link" onClick={undo}>
                  {t.list.undo}
                </button>
              )}
            </>
          )}
        </div>

        {visible.length ? (
          <ul className="sb-items">
            {visible.map((sub) => (
              <SubscriptionItem key={sub.id} sub={sub} view={view} money={money} date={date} onEdit={setEditingId} onRemove={remove} t={t} />
            ))}
          </ul>
        ) : (
          <div className="sb-empty">
            <p>{subs.length ? t.list.emptyFilter : t.list.empty}</p>
            {!subs.length && (
              <button type="button" className="btn btn--ghost" onClick={() => setSubs(createSamples())}>
                {t.reset}
              </button>
            )}
          </div>
        )}
      </section>

      <div className="sb-columns">
        {/* key: switching between "add" and "edit X" remounts the form with fresh state. */}
        <SubscriptionForm
          key={editing?.id ?? 'new'}
          initial={editing}
          defaultCurrency={lang === 'hu' ? 'HUF' : 'EUR'}
          onSave={save}
          onCancel={() => setEditingId(null)}
          t={t}
        />
        <RemindersPanel upcoming={upcoming} reminders={reminders} t={t} />
      </div>

      <p className="sb-foot">{t.saved}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="subscriptions">
      <SubscriptionTracker />
    </AppFrame>
  )
}
