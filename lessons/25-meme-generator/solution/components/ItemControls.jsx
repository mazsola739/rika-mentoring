// The "Selected item" card: one chip per caption and sticker, the rotation slider, and Delete for a sticker.
export default function ItemControls({ items, selectedId, angle, canDelete, onSelect, onRotate, onDelete, t }) {
  return (
    <fieldset className="mg-items">
      <legend className="mg-legend">{t.itemsLegend}</legend>
      <div className="mg-items__chips">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={item.id === selectedId}
            aria-label={item.ariaLabel}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="field">
        <span>{t.rotation(angle)}</span>
        <input
          type="range"
          min="-180"
          max="180"
          value={angle}
          onChange={(event) => onRotate(Number(event.target.value))}
        />
      </label>
      {canDelete && (
        <button type="button" className="btn btn--ghost mg-items__delete" onClick={onDelete}>
          {t.deleteSticker}
        </button>
      )}
    </fieldset>
  )
}
