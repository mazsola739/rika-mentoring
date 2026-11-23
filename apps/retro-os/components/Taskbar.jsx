import { useEffect, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { PROGRAMS } from '../programs.jsx'
import { useWindows } from '../WindowContext.jsx'
import { TEXT } from '../text.js'

// The clock owns its own state, so only this small component re-renders every second.
function Clock() {
  const lang = useLang()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(now)
  const full = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(now)
  return (
    <time className="ro-clock ro-inset" dateTime={now.toISOString()} title={full}>
      {time}
    </time>
  )
}

export default function Taskbar({ menuOpen, onToggleMenu, startButtonRef }) {
  const t = useText(TEXT)
  const { windows, focusedId, taskbarClick } = useWindows()

  return (
    <div className="ro-taskbar" role="group" aria-label={t.taskbar}>
      <button
        ref={startButtonRef}
        type="button"
        className="ro-start ro-raised"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? 'ro-start-menu' : undefined}
        onClick={onToggleMenu}
      >
        <span className="ro-start__logo ro-logo" aria-hidden="true" />
        {t.start}
      </button>
      <ul className="ro-tasks" aria-label={t.openWindows}>
        {windows.map((win) => {
          const { Icon } = PROGRAMS[win.app]
          const pressed = focusedId === win.id && !win.minimized
          return (
            <li key={win.id}>
              <button
                type="button"
                className={`ro-task ${pressed ? 'ro-inset is-active' : 'ro-raised'}`}
                aria-pressed={pressed}
                onClick={() => taskbarClick(win.id)}
              >
                <Icon />
                <span>{t.names[win.app]}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <Clock />
    </div>
  )
}
