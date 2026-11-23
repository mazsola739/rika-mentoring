import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { BPM, CHORDS } from './lofiLoop.js'
import Icon from './Icon.jsx'

const MusicCard = ({ playing, loading, error, chord, volume, onToggle, onVolume }) => {
  const t = useText(TEXT)
  const label = playing ? t.pauseMusic : t.playMusic

  return (
    <section className={`lr-card lr-music${playing ? ' is-playing' : ''}`} aria-labelledby="lr-music-title">
      <div className="lr-card__head">
        <div className="lr-music__info">
          <h2 id="lr-music-title" className="lr-card__title">
            <Icon name="music" /> {t.loopName}
          </h2>
          <p className="lr-music__meta">{t.loopMeta(BPM)}</p>
        </div>
        <span className="lr-eq" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <button
          type="button"
          className="lr-round lr-round--accent"
          onClick={onToggle}
          aria-pressed={playing}
          aria-label={label}
          title={label}
        >
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
      </div>

      <ol className="lr-chords" aria-label={t.chords}>
        {CHORDS.map((c, i) => (
          <li key={c.name} className={i === chord ? 'is-current' : undefined} aria-current={i === chord ? 'true' : undefined}>
            {c.name}
          </li>
        ))}
      </ol>

      <label className="lr-slider">
        <span>{t.musicVolume}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          aria-valuetext={`${Math.round(volume * 100)}%`}
          onChange={(e) => onVolume(Number(e.target.value))}
        />
      </label>

      <p className="lr-status" aria-live="polite">
        {error ? t.musicError : loading ? t.preparing : ''}
      </p>
    </section>
  )
}

export default MusicCard
