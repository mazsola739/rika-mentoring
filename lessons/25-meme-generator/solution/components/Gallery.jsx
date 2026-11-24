import { useState } from 'react'
import { shareImage } from '../download.js'

// The saved memes (newest first), each with Share and Delete. The id of a meme is the moment it was saved.
export default function Gallery({ memes, onDelete, lang, t }) {
  const [message, setMessage] = useState('')
  const format = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })

  async function share(meme) {
    try {
      const result = await shareImage(meme.src)
      setMessage(result === 'downloaded' ? t.shareDownloaded : '')
    } catch {
      setMessage(t.shareFailed)
    }
  }

  return (
    <section className="mg-gallery" aria-labelledby="mg-gallery-title">
      <h3 id="mg-gallery-title" className="mg-section-title">
        {t.gallery}
      </h3>
      {memes.length === 0 ? (
        <p className="mg-muted">{t.galleryEmpty}</p>
      ) : (
        <ul className="mg-gallery__grid">
          {memes.map((meme) => {
            const when = format.format(meme.id)
            return (
              <li key={meme.id} className="mg-gallery__item">
                <img src={meme.src} alt={t.savedMeme(when)} />
                <time className="mg-muted" dateTime={new Date(meme.id).toISOString()}>
                  {when}
                </time>
                <div className="mg-gallery__actions">
                  <button type="button" className="btn btn--ghost" aria-label={t.shareMeme(when)} onClick={() => share(meme)}>
                    {t.share}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    aria-label={t.deleteMeme(when)}
                    onClick={() => onDelete(meme.id)}
                  >
                    {t.delete}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <p className="mg-muted" aria-live="polite">
        {message}
      </p>
    </section>
  )
}
