import { useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { formatTime } from './formatTime.js'

export default function Playlist({ player }) {
  const t = useText(TEXT)
  const [dragging, setDragging] = useState(false)
  const { tracks, current, playing, notice, demoState } = player
  const total = tracks.reduce((sum, track) => sum + (track.duration || 0), 0)

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files.length) player.addFiles(event.dataTransfer.files)
  }

  return (
    <section
      className={`wa-window wa-list${dragging ? ' is-dragging' : ''}`}
      aria-labelledby="wa-list-title"
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false)
      }}
      onDrop={onDrop}
    >
      <div className="wa-titlebar">
        <h2 id="wa-list-title" className="wa-titlebar__text">
          {t.playlist}
        </h2>
        <span className="wa-titlebar__lines" aria-hidden="true" />
      </div>

      <div className="wa-list__body">
        {demoState === 'loading' && <p className="wa-list__msg">{t.generating}</p>}
        {demoState === 'error' && (
          <p className="wa-list__msg is-error" role="alert">
            {t.demoError}
          </p>
        )}
        {tracks.length === 0 && demoState !== 'loading' && <p className="wa-list__msg">{t.empty}</p>}

        {tracks.length > 0 && (
          <ol className="wa-tracks">
            {tracks.map((track, i) => {
              const isCurrent = current?.id === track.id
              return (
                <li key={track.id} className={`wa-track${isCurrent ? ' is-current' : ''}${track.broken ? ' is-broken' : ''}`}>
                  <button
                    type="button"
                    className="wa-track__play"
                    onClick={() => player.playTrack(track)}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={t.playThis(track.title)}
                  >
                    <span className="wa-track__num">{i + 1}.</span>
                    <span className="wa-track__title">
                      {track.title}
                      {track.kind === 'demo' && <span className="wa-badge">{t.demo}</span>}
                      {track.broken && <span className="wa-badge is-error">{t.broken}</span>}
                    </span>
                    <span className="wa-track__time">
                      {isCurrent && playing && <span aria-hidden="true">▶ </span>}
                      {track.duration ? formatTime(track.duration) : '–:––'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="wa-track__remove"
                    onClick={() => player.remove(track.id)}
                    aria-label={t.remove(track.title)}
                    title={t.remove(track.title)}
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="wa-list__foot">
        <label className="wa-btn wa-btn--wide wa-add">
          + {t.addFiles}
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.oga,.opus,.m4a,.aac,.flac"
            multiple
            className="visually-hidden"
            onChange={(e) => {
              if (e.target.files.length) player.addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
        <span className="wa-list__hint">{dragging ? t.dropNow : t.dropHint}</span>
        <span className="wa-list__total">{t.total(tracks.length, formatTime(total))}</span>
      </div>

      <p className="wa-notice" aria-live="polite">
        {notice?.type === 'added' && t.added(notice.count, notice.skipped)}
        {notice?.type === 'cannotPlay' && <span className="is-error">{t.cannotPlay(notice.title)}</span>}
      </p>
    </section>
  )
}
