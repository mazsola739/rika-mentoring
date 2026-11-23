import { useLayoutEffect, useRef } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { useLesson } from '@shared/ui/AppFrame.jsx'
import { BOT } from '../chatStore.js'
import { TEXT, pick } from '../text.js'

const GROUP_MS = 5 * 60_000 // messages of the same person within 5 minutes form one group

// A stable color per username, picked from the lesson palette (with readable text on top).
function avatarColors(name, colors) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0
  const bg = colors[hash % colors.length]
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16))
  const light = 0.299 * r + 0.587 * g + 0.114 * b > 150
  return { background: bg, color: light ? '#111' : '#fff' }
}

const dayKey = (ts) => new Date(ts).toDateString()

export default function MessageList({ messages, me }) {
  const lang = useLang()
  const t = useText(TEXT)
  const { palette } = useLesson()
  const ref = useRef(null)
  const stick = useRef(true)
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
  const full = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' })
  const day = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' })

  const dayLabel = (ts) => {
    const today = new Date()
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
    if (dayKey(ts) === today.toDateString()) return t.today
    if (dayKey(ts) === yesterday.toDateString()) return t.yesterday
    return day.format(ts)
  }

  // Scroll to the newest message, unless the user scrolled up to read older ones.
  useLayoutEffect(() => {
    if (stick.current && ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [messages.length])

  const onScroll = () => {
    const el = ref.current
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  if (messages.length === 0) {
    return (
      <div className="ch-messages ch-messages--empty" ref={ref}>
        <p className="ch-muted">{t.empty}</p>
      </div>
    )
  }

  return (
    <div className="ch-messages" ref={ref} onScroll={onScroll}>
      {/* role="log" + aria-live: screen readers announce new messages politely. */}
      <ol className="ch-log" role="log" aria-live="polite">
        {messages.map((m, i) => {
          const prev = messages[i - 1]
          const newDay = !prev || dayKey(prev.at) !== dayKey(m.at)
          const grouped = !newDay && prev.user === m.user && m.at - prev.at < GROUP_MS
          const mine = m.user === me
          return (
            <li key={m.id} className={`ch-msg${grouped ? ' is-grouped' : ''}${mine ? ' is-mine' : ''}`}>
              {newDay && (
                <div className="ch-day" role="separator">
                  <span>{dayLabel(m.at)}</span>
                </div>
              )}
              <div className="ch-msg__row">
                {grouped ? (
                  <time className="ch-msg__hover-time" dateTime={new Date(m.at).toISOString()} title={full.format(m.at)}>
                    {time.format(m.at)}
                  </time>
                ) : (
                  <span className="ch-avatar" style={avatarColors(m.user, palette.colors)} aria-hidden="true">
                    {m.user.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="ch-msg__body">
                  {!grouped && (
                    <div className="ch-msg__head">
                      <strong>{m.user}</strong>
                      {mine && <span className="ch-tag">{t.you}</span>}
                      {m.user === BOT && <span className="ch-tag ch-tag--bot">{t.bot}</span>}
                      <time dateTime={new Date(m.at).toISOString()} title={full.format(m.at)}>
                        {time.format(m.at)}
                      </time>
                    </div>
                  )}
                  <p className="ch-msg__text">{pick(m.text, lang)}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
