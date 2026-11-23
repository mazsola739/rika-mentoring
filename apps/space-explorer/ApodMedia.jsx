import { useState } from 'react'
import { apodPageUrl } from './dates.js'

// Turns any YouTube link (watch, youtu.be, embed, shorts) into a privacy-friendly embed URL, or null.
export function youTubeEmbed(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^(www|m)\./, '')
    let id = null
    if (host === 'youtu.be') id = u.pathname.slice(1)
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v')
      else id = u.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1] ?? null
    }
    return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null
  } catch {
    return null
  }
}

// The API sometimes answers with NASA's logo instead of the real picture.
export const isPlaceholder = (apod) => /nasa-logo/i.test(apod.url ?? '')

// Rendering by media type: image, YouTube video, or a link for everything else.
export default function ApodMedia({ apod, t }) {
  const [broken, setBroken] = useState(false)
  const page = apodPageUrl(apod.date)

  if (isPlaceholder(apod)) {
    return (
      <div className="sx-media sx-media--note">
        <p>{t.placeholder}</p>
        <a className="btn" href={page} target="_blank" rel="noreferrer">
          {t.openOriginal}
        </a>
      </div>
    )
  }

  if (apod.media_type === 'image' && !broken) {
    return (
      <figure className="sx-media">
        <img src={apod.url} alt={apod.title} onError={() => setBroken(true)} />
        <figcaption>
          <a href={apod.hdurl || apod.url} target="_blank" rel="noreferrer">
            {t.openFull}
          </a>
        </figcaption>
      </figure>
    )
  }

  const embed = apod.media_type === 'video' ? youTubeEmbed(apod.url) : null
  if (embed) {
    return (
      <figure className="sx-media sx-media--video">
        <iframe
          src={embed}
          title={apod.title}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      </figure>
    )
  }

  // Other videos (Vimeo, NASA's own player…), interactive pages or a failed image: link to the original.
  return (
    <div className="sx-media sx-media--note">
      {apod.thumbnail_url && <img className="sx-media__thumb" src={apod.thumbnail_url} alt="" />}
      <p>{apod.media_type === 'video' ? t.videoElsewhere : t.otherMedia}</p>
      <a className="btn" href={apod.media_type === 'video' && apod.url ? apod.url : page} target="_blank" rel="noreferrer">
        {apod.media_type === 'video' ? t.watchVideo : t.openOriginal}
      </a>
    </div>
  )
}
