import { useText } from '@shared/i18n.js'
import { MAX_QTY } from '../cartReducer.js'
import { TEXT } from '../text.js'

// A controlled quantity input: the parent owns the value, this component only reports changes.
export default function QtyStepper({ value, onChange, label }) {
  const t = useText(TEXT)
  return (
    <div className="ws-qty" role="group" aria-label={label ?? t.quantity}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t.decrease}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max={MAX_QTY}
        value={value}
        aria-label={t.quantity}
        onChange={(e) => {
          const next = Number(e.target.value)
          if (Number.isFinite(next) && next >= 1) onChange(Math.min(MAX_QTY, Math.round(next)))
        }}
      />
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label={t.increase}>
        +
      </button>
    </div>
  )
}
