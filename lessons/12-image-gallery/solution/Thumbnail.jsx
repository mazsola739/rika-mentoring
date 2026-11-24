import { useState } from 'react'

// One picture of the grid. It opens the large view, can be dragged onto another picture to take its place,
// and has two small buttons that do the same with the keyboard (drag and drop needs a mouse).
export default function Thumbnail({ photo, t, canEarlier, canLater, onOpen, onDropOn, onShift, onRemove }) {
  // Until the picture has arrived it is invisible; then the CSS fades it in.
  const [loaded, setLoaded] = useState(false)
  const [dragging, setDragging] = useState(false)

  function handleDragStart(event) {
    // The drag's "parcel" carries the picture's id: on the drop it tells which picture came.
    event.dataTransfer.setData('text/plain', photo.id)
    event.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }

  function handleDragOver(event) {
    // By default nothing can be dropped on anything: this allows it (and keeps a dropped file from opening).
    event.preventDefault()
  }

  function handleDrop(event) {
    event.preventDefault()
    onDropOn(event.dataTransfer.getData('text/plain'))
  }

  function shift(event, step, allowed) {
    // aria-disabled instead of disabled: a disabled button would lose the keyboard focus at the end of the row.
    if (allowed) onShift(step, event.currentTarget)
  }

  return (
    <li
      className={`ig-grid__item${dragging ? ' is-dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={() => setDragging(false)}
    >
      <button type="button" className="ig-thumb" onClick={onOpen} aria-label={t.openLarge(photo.caption)}>
        <img
          src={photo.src}
          alt=""
          loading="lazy"
          className={loaded ? undefined : 'is-loading'}
          onLoad={() => setLoaded(true)}
          // A file the browser cannot show should not stay invisible for ever.
          onError={() => setLoaded(true)}
        />
        <span className="ig-thumb__caption">{photo.caption}</span>
      </button>
      <div className="ig-moves">
        <button
          type="button"
          className="ig-move"
          aria-label={t.moveEarlier(photo.caption)}
          title={t.moveEarlier(photo.caption)}
          aria-disabled={!canEarlier}
          onClick={(event) => shift(event, -1, canEarlier)}
        >
          ‹
        </button>
        <button
          type="button"
          className="ig-move"
          aria-label={t.moveLater(photo.caption)}
          title={t.moveLater(photo.caption)}
          aria-disabled={!canLater}
          onClick={(event) => shift(event, 1, canLater)}
        >
          ›
        </button>
      </div>
      {onRemove && (
        <button
          type="button"
          className="ig-remove"
          aria-label={t.remove(photo.caption)}
          title={t.remove(photo.caption)}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </li>
  )
}
