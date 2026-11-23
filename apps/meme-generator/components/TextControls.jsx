import { FONTS } from '../drawMeme.js'

export default function TextControls({ text, onText, style, onStyle, swatches, t }) {
  return (
    <div className="mg-controls">
      <label className="field">
        <span>{t.topText}</span>
        <input className="input" value={text.top} maxLength={120} onChange={(e) => onText({ top: e.target.value })} />
      </label>
      <label className="field">
        <span>{t.bottomText}</span>
        <input
          className="input"
          value={text.bottom}
          maxLength={120}
          onChange={(e) => onText({ bottom: e.target.value })}
        />
      </label>

      <div className="mg-row">
        <label className="field">
          <span>{t.font}</span>
          <select className="input" value={style.font} onChange={(e) => onStyle({ font: e.target.value })}>
            {Object.entries(FONTS).map(([key, font]) => (
              <option key={key} value={key}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
        <label className="mg-check">
          <input type="checkbox" checked={style.caps} onChange={(e) => onStyle({ caps: e.target.checked })} />
          {t.caps}
        </label>
      </div>

      <label className="field">
        <span>
          {t.size}: {style.size}
        </span>
        <input
          type="range"
          min="24"
          max="110"
          value={style.size}
          onChange={(e) => onStyle({ size: Number(e.target.value) })}
        />
      </label>

      <fieldset className="mg-colors">
        <legend>{t.color}</legend>
        <div className="mg-colors__list">
          {swatches.map((hex) => (
            <button
              key={hex}
              type="button"
              className="mg-swatch"
              style={{ background: hex }}
              aria-label={t.swatch(hex)}
              aria-pressed={style.color === hex}
              onClick={() => onStyle({ color: hex })}
            />
          ))}
          <label className="mg-swatch mg-swatch--custom" title={t.customColor}>
            <span className="visually-hidden">{t.customColor}</span>
            <input type="color" value={style.color} onChange={(e) => onStyle({ color: e.target.value.toLowerCase() })} />
          </label>
        </div>
      </fieldset>

      <button type="button" className="btn btn--ghost mg-clear" onClick={() => onText({ top: '', bottom: '' })}>
        {t.clearText}
      </button>
    </div>
  )
}
