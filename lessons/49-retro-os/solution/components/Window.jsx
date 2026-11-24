import { useEffect, useRef } from 'react'
import { useText } from '@shared/i18n.js'
import { PROGRAMS } from '../programs.jsx'
import { TASKBAR_HEIGHT } from '../windowReducer.js'
import { useWindows } from '../WindowContext.jsx'
import { TEXT } from '../text.js'

const KEY_STEP = 16

const Window = ({ win }) => {
  const t = useText(TEXT)
  const { focusedId, bounds, focus, close, minimize, toggleMaximize, move } = useWindows()
  const ref = useRef(null)
  const titleRef = useRef(null)
  const drag = useRef(null) // pointer offset inside the title bar while dragging
  const program = PROGRAMS[win.app]
  const { Component, Icon } = program
  const title = t.names[win.app]
  const active = focusedId === win.id
  const areaHeight = bounds.height - TASKBAR_HEIGHT

  // When a window is (re)opened from an icon or the menu, move keyboard focus into it.
  useEffect(() => {
    if (win.openedAt && Date.now() - win.openedAt < 1500) titleRef.current?.focus({ preventScroll: true })
  }, [win.openedAt])

  // Keep at least a part of the title bar on screen, so the window can always be grabbed again.
  const clamp = (x, y) => {
    const width = ref.current?.offsetWidth ?? 240
    return {
      x: Math.round(Math.min(Math.max(x, 64 - width), bounds.width - 64)),
      y: Math.round(Math.min(Math.max(y, 0), areaHeight - 30)),
    }
  }

  // Dragging with Pointer Events works for mouse, pen and touch. Pointer capture keeps the
  // events coming even if the pointer leaves the title bar during a fast drag.
  const onPointerDown = (e) => {
    if (e.button !== 0 || win.maximized || e.target.closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const { x, y } = clamp(e.clientX - drag.current.dx, e.clientY - drag.current.dy)
    move(win.id, x, y)
  }
  const endDrag = () => {
    drag.current = null
  }

  const onTitleKeyDown = (e) => {
    const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
    if (!delta || win.maximized) return
    e.preventDefault()
    const { x, y } = clamp(win.x + delta[0] * KEY_STEP, win.y + delta[1] * KEY_STEP)
    move(win.id, x, y)
  }

  // Render-time clamping: if the panel got narrower, the window is shown inside it,
  // without changing the saved position.
  const width = program.width === 'auto' ? undefined : Math.min(program.width, bounds.width - 8)
  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: areaHeight, zIndex: win.z }
    : {
        left: Math.min(win.x, bounds.width - 64),
        top: Math.min(win.y, areaHeight - 30),
        width,
        height: program.height === 'auto' ? undefined : Math.min(program.height, areaHeight - 8),
        maxWidth: bounds.width - 8,
        zIndex: win.z,
      }

  return (
    <section
      ref={ref}
      className={`ro-window ro-raised${active ? ' is-active' : ''}${win.maximized ? ' is-max' : ''}`}
      style={style}
      hidden={win.minimized}
      aria-label={title}
      onPointerDownCapture={() => focus(win.id)}
      onFocusCapture={() => focus(win.id)}
    >
      <div
        ref={titleRef}
        className="ro-titlebar"
        tabIndex={0}
        aria-label={`${title}. ${t.moveHint}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => !e.target.closest('button') && toggleMaximize(win.id)}
        onKeyDown={onTitleKeyDown}
      >
        <span className="ro-titlebar__icon">
          <Icon />
        </span>
        <span className="ro-titlebar__text">{title}</span>
        <span className="ro-titlebar__buttons">
          <button type="button" className="ro-tbtn ro-raised" onClick={() => minimize(win.id)} aria-label={t.minimize} title={t.minimize}>
            <svg viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 8h6" />
            </svg>
          </button>
          <button
            type="button"
            className="ro-tbtn ro-raised"
            onClick={() => toggleMaximize(win.id)}
            aria-label={win.maximized ? t.restore : t.maximize}
            title={win.maximized ? t.restore : t.maximize}
          >
            <svg viewBox="0 0 10 10" aria-hidden="true">
              {win.maximized ? <path d="M3 1.5h5.5V7M1.5 3h5.5v5.5H1.5z" /> : <path d="M1.5 1.5h7v7h-7zM1.5 2.5h7" />}
            </svg>
          </button>
          <button type="button" className="ro-tbtn ro-raised" onClick={() => close(win.id)} aria-label={t.close} title={t.close}>
            <svg viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 2l6 6M8 2l-6 6" />
            </svg>
          </button>
        </span>
      </div>
      <div className="ro-window__body">
        <Component />
      </div>
    </section>
  )
}

export default Window
