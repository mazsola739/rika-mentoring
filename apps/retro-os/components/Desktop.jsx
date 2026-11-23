import { useCallback, useEffect, useRef, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { PROGRAMS, PROGRAM_KEYS } from '../programs.jsx'
import { useWindows } from '../WindowContext.jsx'
import { TEXT } from '../text.js'
import StartMenu from './StartMenu.jsx'
import Taskbar from './Taskbar.jsx'
import Window from './Window.jsx'

function DesktopIcon({ app, selected, onSelect, onOpen }) {
  const t = useText(TEXT)
  const { Icon } = PROGRAMS[app]
  const pointerType = useRef('mouse')

  return (
    <li>
      <button
        type="button"
        className={`ro-icon${selected ? ' is-selected' : ''}`}
        title={t.iconHint}
        onPointerDown={(e) => {
          pointerType.current = e.pointerType
        }}
        // Mouse: click selects, double-click opens. Touch: a tap opens (double-tap is unreliable).
        onClick={() => (pointerType.current === 'touch' ? onOpen() : onSelect())}
        onDoubleClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onOpen()
          }
        }}
      >
        <span className="ro-icon__img">
          <Icon />
        </span>
        <span className="ro-icon__label">{t.iconNames[app]}</span>
      </button>
    </li>
  )
}

export default function Desktop() {
  const t = useText(TEXT)
  const { windows, open, setBounds } = useWindows()
  const ref = useRef(null)
  const startButtonRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Measure the desktop, so windows can be kept inside it. ResizeObserver also reacts to the
  // panel getting narrower (phone rotation, window resize). Disconnect on cleanup.
  useEffect(() => {
    const el = ref.current
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBounds((b) => (b.width === Math.round(width) && b.height === Math.round(height) ? b : { width: Math.round(width), height: Math.round(height) }))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [setBounds])

  return (
    <div
      ref={ref}
      className="ro-desktop"
      aria-label={t.desktop}
      role="region"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget || e.target.classList.contains('ro-wallpaper')) setSelected(null)
      }}
    >
      <div className="ro-wallpaper" aria-hidden="true" />

      <ul className="ro-icons">
        {PROGRAM_KEYS.map((app) => (
          <DesktopIcon
            key={app}
            app={app}
            selected={selected === app}
            onSelect={() => setSelected(app)}
            onOpen={() => {
              setSelected(app)
              open(app)
            }}
          />
        ))}
      </ul>

      {windows.map((win) => (
        <Window key={win.id} win={win} />
      ))}

      {menuOpen && <StartMenu onClose={closeMenu} startButtonRef={startButtonRef} />}
      <Taskbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((o) => !o)} startButtonRef={startButtonRef} />
    </div>
  )
}
