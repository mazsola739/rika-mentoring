import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import Icon from './Icon.jsx'

export const SOUNDS = ['rain', 'cafe', 'fire']

// One slider per ambient sound. Each keeps its own volume, so they can be mixed freely.
export default function Mixer({ levels, playing, onToggle, onLevel }) {
  const t = useText(TEXT)

  return (
    <section className="lr-card lr-mixer" aria-labelledby="lr-mixer-title">
      <div className="lr-card__head">
        <h2 id="lr-mixer-title" className="lr-card__title">
          {t.ambience}
        </h2>
        <button
          type="button"
          className="lr-round"
          onClick={onToggle}
          aria-pressed={playing}
          aria-label={playing ? t.pauseAmbience : t.playAmbience}
          title={playing ? t.pauseAmbience : t.playAmbience}
        >
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
      </div>

      <ul className="lr-sounds">
        {SOUNDS.map((name) => {
          const label = t.sounds[name]
          const value = levels[name]
          return (
            <li key={name} className="lr-sound">
              <label className="lr-sound__label" htmlFor={`lr-${name}`}>
                <Icon name={name} />
                {label}
              </label>
              <input
                id={`lr-${name}`}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                aria-label={t.volumeOf(label)}
                aria-valuetext={value === 0 ? t.off : `${Math.round(value * 100)}%`}
                onChange={(e) => onLevel(name, Number(e.target.value))}
              />
              <span className="lr-sound__value" aria-hidden="true">
                {value === 0 ? t.off : `${Math.round(value * 100)}%`}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
