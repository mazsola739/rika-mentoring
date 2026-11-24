import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { colorName } from './colors.js'
import { readImage } from './image.js'

// Everything that can be put on the board: flat color tiles, uploads and notes.
const AddPanel = ({ colors, noteColor, onAdd }) => {
  const t = useText(TEXT)
  const lang = useLang()
  const [status, setStatus] = useState(null) // { type: 'uploading' | 'skipped' | 'failed', count }

  const upload = async (event) => {
    const files = [...event.target.files]
    event.target.value = ''
    const images = files.filter((f) => f.type.startsWith('image/'))
    const skipped = files.length - images.length
    setStatus({ type: 'uploading' })
    let failed = false
    for (const file of images) {
      try {
        const { src, ratio } = await readImage(file)
        onAdd({ type: 'image', src, ratio, w: ratio > 1 ? 0.2 : 0.28 })
      } catch {
        failed = true
      }
    }
    setStatus(failed ? { type: 'failed' } : skipped ? { type: 'skipped', count: skipped } : null)
  }

  const statusText =
    status?.type === 'uploading'
      ? t.uploading
      : status?.type === 'failed'
        ? t.uploadFailed
        : status?.type === 'skipped'
          ? t.notImage(status.count)
          : ''

  return (
    <section className="mb-add" aria-labelledby="mb-add-title">
      <h2 id="mb-add-title" className="mb-add__title">
        {t.add}
      </h2>

      <div className="mb-add__buttons">
        <button type="button" className="btn" onClick={() => onAdd({ type: 'note', text: t.newNote, color: noteColor, w: 0.24, h: 0.18 })}>
          + {t.addNote}
        </button>
        <label className="btn btn--ghost mb-upload">
          {t.upload}
          <input type="file" accept="image/*" multiple className="visually-hidden" onChange={upload} />
        </label>
      </div>
      <p className={`mb-status${status?.type === 'failed' ? ' is-error' : ''}`} aria-live="polite">
        {statusText}
      </p>

      <h3 className="mb-add__sub">{t.tiles}</h3>
      <ul className="mb-tiles">
        {colors.map((color) => {
          const name = colorName(color, lang)
          return (
            <li key={color}>
              <button
                type="button"
                className="mb-tile-btn"
                style={{ background: color }}
                onClick={() => onAdd({ type: 'color', color, w: 0.16, h: 0.16 })}
                aria-label={t.addTile(name)}
                title={name}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default AddPanel
