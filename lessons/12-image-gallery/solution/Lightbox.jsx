import { useEffect, useRef } from 'react'

// A modal built on the native <dialog>: showModal() gives us the backdrop, the focus trap,
// Esc to close and focus return to the thumbnail for free.
export default function Lightbox({ images, index, onClose, onIndex, t }) {
  const ref = useRef(null)
  const image = index === null ? null : images[index]
  const open = Boolean(image)
  const count = images.length

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const step = (delta) => onIndex((index + delta + count) % count)

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  return (
    <dialog
      ref={ref}
      className="ig-lightbox"
      aria-label={image ? image.caption : t.viewer}
      onClose={onClose}
      onKeyDown={onKeyDown}
      // A click on the dark backdrop lands on the <dialog> element itself.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {image && (
        <div className="ig-lightbox__inner">
          <button type="button" className="ig-lightbox__close" onClick={onClose} aria-label={t.close} autoFocus>
            ×
          </button>
          <figure className="ig-lightbox__figure" style={{ background: image.bg }}>
            <img key={image.id} src={image.src} alt={image.alt} />
          </figure>
          <div className="ig-lightbox__bar">
            <button type="button" className="ig-round" onClick={() => step(-1)} aria-label={t.prev} disabled={count < 2}>
              ←
            </button>
            <div className="ig-lightbox__caption" aria-live="polite">
              <strong>{image.caption}</strong>
              <span>
                {t.counter(index + 1, count)}
                {image.colors && (
                  <ul className="ig-swatches" aria-label={t.colors}>
                    {image.colors.map((color) => (
                      <li key={color} style={{ background: color }} title={color} />
                    ))}
                  </ul>
                )}
              </span>
            </div>
            <button type="button" className="ig-round" onClick={() => step(1)} aria-label={t.next} disabled={count < 2}>
              →
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
