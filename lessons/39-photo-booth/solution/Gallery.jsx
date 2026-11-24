import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

const Gallery = ({ photos, selectedId, onSelect, onRemove }) => {
  const t = useText(TEXT)
  const lang = useLang()
  const format = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { timeStyle: 'short' })
  const selected = photos.find((p) => p.id === selectedId) ?? photos[0]

  const altOf = (photo) => (photo.kind === 'strip' ? t.altStrip : t.altSingle)(format.format(photo.createdAt))
  const fileName = (photo) => `photo-booth-${new Date(photo.createdAt).toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`

  return (
    <section className="pb-gallery" aria-labelledby="pb-gallery-title">
      <h2 id="pb-gallery-title" className="pb-title">
        {t.gallery}
      </h2>

      {photos.length === 0 ? (
        <p className="pb-muted">{t.galleryEmpty}</p>
      ) : (
        <div className="pb-gallery__layout">
          {selected && (
            <figure className={`pb-result is-${selected.kind}`}>
              <img src={selected.url} alt={altOf(selected)} />
              <figcaption>
                <a className="btn" href={selected.url} download={fileName(selected)}>
                  {t.download}
                </a>
                <button type="button" className="btn btn--ghost" onClick={() => onRemove(selected.id)}>
                  {t.remove}
                </button>
              </figcaption>
            </figure>
          )}

          <ul className="pb-thumbs">
            {photos.map((photo, i) => (
              <li key={photo.id}>
                <button
                  type="button"
                  className="pb-thumb"
                  aria-pressed={selected?.id === photo.id}
                  aria-label={t.open(photos.length - i)}
                  onClick={() => onSelect(photo.id)}
                >
                  <img src={photo.url} alt="" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default Gallery
