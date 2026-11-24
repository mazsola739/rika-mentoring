import { useId } from 'react'

// A labelled row of chips; the chosen one has aria-pressed="true". Used for the stories and for the players.
// The parent keeps the state (lifting state up): it says which chip is chosen and hears back through onSelect.
function ChipPicker({ label, options, selected, onSelect, extra }) {
  const labelId = useId()
  return (
    <div className="ml__picker">
      <span className="ml__picker-label" id={labelId}>
        {label}
      </span>
      <div className="ml__chips" role="group" aria-labelledby={labelId}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={option.value === selected}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
        {extra}
      </div>
    </div>
  )
}

export default ChipPicker
