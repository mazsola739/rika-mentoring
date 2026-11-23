import { useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { colorName } from './colors.js'
import { BOARD_HEIGHT, MIN_SIZE, clamp } from './useBoards.js'

export const noteText = (item, lang) => (typeof item.text === 'string' ? item.text : (item.text?.[lang] ?? ''))

// Dark text on light notes, white text on dark ones.
export function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#1d1a16' : '#ffffff'
}

// Keeps a box inside the board; images keep their aspect ratio while resizing.
function fit(box, item) {
  let { x, y, w, h } = box
  w = clamp(w, MIN_SIZE, 1)
  if (item.ratio) h = w * item.ratio
  if (h > BOARD_HEIGHT) {
    h = BOARD_HEIGHT
    if (item.ratio) w = h / item.ratio
  }
  h = Math.max(h, MIN_SIZE * 0.75)
  return { x: clamp(x, 0, 1 - w), y: clamp(y, 0, BOARD_HEIGHT - h), w, h }
}

export default function BoardItem({
  item,
  boardRef,
  selected,
  editing,
  helpId,
  onSelect,
  onChange,
  onFront,
  onRemove,
  onEdit,
  onEditDone,
}) {
  const t = useText(TEXT)
  const lang = useLang()
  // While dragging we only update this local draft; the board (and localStorage) gets
  // the final position once, when the pointer is released.
  const [draft, setDraft] = useState(null)
  const dragRef = useRef(null)
  const box = draft ?? item

  const start = (event, mode) => {
    if (editing || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      unit: boardRef.current.getBoundingClientRect().width, // 1.0 in our units = board width in px
      from: { x: item.x, y: item.y, w: item.w, h: item.h },
    }
    onSelect(item.id)
    onFront(item.id)
  }

  const move = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = (event.clientX - drag.startX) / drag.unit
    const dy = (event.clientY - drag.startY) / drag.unit
    const { from } = drag
    setDraft(
      drag.mode === 'move'
        ? fit({ ...from, x: from.x + dx, y: from.y + dy }, item)
        : fit({ ...from, w: from.w + dx, h: from.h + dy }, item),
    )
  }

  const end = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (draft) onChange(item.id, draft)
    setDraft(null)
  }

  const onKeyDown = (event) => {
    if (editing || event.target !== event.currentTarget) return
    const step = event.shiftKey ? 0.05 : 0.01
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (moves[event.key]) {
      event.preventDefault()
      const [dx, dy] = moves[event.key]
      onChange(item.id, fit({ ...item, x: item.x + dx, y: item.y + dy }, item))
    } else if (event.key === '+' || event.key === '=' || event.key === '-') {
      event.preventDefault()
      const d = event.key === '-' ? -0.02 : 0.02
      onChange(item.id, fit({ ...item, w: item.w + d, h: item.h + d }, item))
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onRemove(item.id)
    } else if (event.key === 'Enter' && item.type === 'note') {
      event.preventDefault()
      onEdit(item.id)
    }
  }

  const label =
    item.type === 'note'
      ? `${t.note}: ${noteText(item, lang)}`
      : item.type === 'color'
        ? t.colorTile(colorName(item.color, lang))
        : t.photo

  const style = {
    left: `${box.x * 100}cqw`,
    top: `${box.y * 100}cqw`,
    width: `${box.w * 100}cqw`,
    height: `${box.h * 100}cqw`,
    zIndex: item.z,
    ...(item.type === 'note' ? { '--note': item.color, '--note-ink': inkFor(item.color) } : null),
    ...(item.type === 'color' ? { background: item.color } : null),
  }

  return (
    <div
      className={`mb-item mb-item--${item.type}${selected ? ' is-selected' : ''}${draft ? ' is-dragging' : ''}`}
      style={style}
      tabIndex={0}
      role="group"
      aria-roledescription={t.item}
      aria-label={label}
      aria-describedby={helpId}
      onPointerDown={(e) => start(e, 'move')}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onFocus={(e) => e.target === e.currentTarget && onSelect(item.id)}
      onKeyDown={onKeyDown}
      onDoubleClick={() => item.type === 'note' && onEdit(item.id)}
    >
      {item.type === 'note' ? (
        editing ? (
          <textarea
            className="mb-note__input"
            defaultValue={noteText(item, lang)}
            placeholder={t.notePlaceholder}
            aria-label={t.note}
            autoFocus
            onFocus={(e) => e.target.select()}
            onBlur={(e) => onEditDone(item.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) e.currentTarget.blur()
            }}
          />
        ) : (
          <p className="mb-note__text">{noteText(item, lang) || t.notePlaceholder}</p>
        )
      ) : item.src ? (
        <img src={item.src} alt="" draggable={false} />
      ) : null}

      {selected && !editing && <span className="mb-handle" onPointerDown={(e) => start(e, 'resize')} aria-hidden="true" title={t.resize} />}
    </div>
  )
}
