import { useLang } from '@shared/i18n.js'
import { COLORS } from './data.js'

// A radio group drawn as color dots. Real radio inputs keep it keyboard accessible (arrow keys).
export default function ColorPicker({ name, value, onChange, legend, anyLabel }) {
  const lang = useLang()
  return (
    <fieldset className="wr-swatches">
      <legend>{legend}</legend>
      <div className="wr-swatches__list">
        {anyLabel && (
          <label className="wr-swatch wr-swatch--any" title={anyLabel}>
            <input type="radio" name={name} value="all" checked={value === 'all'} onChange={() => onChange('all')} />
            <span className="wr-swatch__dot" aria-hidden="true" />
            <span className="visually-hidden">{anyLabel}</span>
          </label>
        )}
        {COLORS.map((color) => (
          <label key={color.key} className="wr-swatch" title={color[lang]}>
            <input type="radio" name={name} value={color.key} checked={value === color.key} onChange={() => onChange(color.key)} />
            <span className="wr-swatch__dot" style={{ background: color.hex }} aria-hidden="true" />
            <span className="visually-hidden">{color[lang]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
