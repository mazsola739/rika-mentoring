import { useEffect, useRef } from 'react'
import { useText } from '@shared/i18n.js'
import { PROGRAMS, PROGRAM_KEYS } from '../programs.jsx'
import { useWindows } from '../WindowContext.jsx'
import { TEXT } from '../text.js'

export default function StartMenu({ onClose, startButtonRef }) {
  const t = useText(TEXT)
  const { open, reset } = useWindows()
  const ref = useRef(null)

  // Focus the first item when the menu opens.
  useEffect(() => {
    ref.current?.querySelector('[role="menuitem"]')?.focus()
  }, [])

  // Close on a click outside the menu (the Start button toggles the menu itself).
  useEffect(() => {
    const onPointerDown = (e) => {
      if (ref.current?.contains(e.target) || startButtonRef.current?.contains(e.target)) return
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [onClose, startButtonRef])

  // Arrow keys move between the items, Escape closes and returns focus to the Start button.
  const onKeyDown = (e) => {
    const items = [...ref.current.querySelectorAll('[role="menuitem"]')]
    const index = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[next].focus()
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault()
      onClose()
      startButtonRef.current?.focus()
    }
  }

  const choose = (fn) => {
    fn()
    onClose()
  }

  return (
    <div className="ro-startmenu ro-raised" id="ro-start-menu" role="menu" aria-label={t.startMenu} ref={ref} onKeyDown={onKeyDown}>
      <div className="ro-startmenu__band" aria-hidden="true">
        <span>
          Rika <b>OS 95</b>
        </span>
      </div>
      <div className="ro-startmenu__items">
        {PROGRAM_KEYS.map((key) => {
          const { Icon } = PROGRAMS[key]
          return (
            <button key={key} type="button" role="menuitem" className="ro-startmenu__item" onClick={() => choose(() => open(key))}>
              <Icon />
              {t.names[key]}
            </button>
          )
        })}
        <hr />
        <button type="button" role="menuitem" className="ro-startmenu__item" onClick={() => choose(reset)}>
          <svg viewBox="0 0 32 32" aria-hidden="true" className="ro-svg">
            <path d="M8 22l8-14 8 14z" fill="var(--accent)" stroke="#2b2620" strokeWidth="1.5" />
            <path d="M6 25h20" stroke="#2b2620" strokeWidth="2" />
          </svg>
          {t.reset}
        </button>
      </div>
    </div>
  )
}
