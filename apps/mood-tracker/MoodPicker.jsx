import { MOODS } from './moods.js'

// Five emoji buttons that behave as one radio group (arrow keys move between them).
export default function MoodPicker({ value, onChange, colors, labels, legend }) {
  return (
    <fieldset className="md-picker">
      <legend className="md-label">{legend}</legend>
      <div className="md-picker__options">
        {MOODS.map((m, i) => (
          <label key={m.value} className="md-picker__option" style={{ '--md-color': colors[m.value] }}>
            <input type="radio" name="mood" value={m.value} checked={value === m.value} onChange={() => onChange(m.value)} />
            <span className="md-picker__face" aria-hidden="true">
              {m.emoji}
            </span>
            <span className="md-picker__text">{labels[i]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
