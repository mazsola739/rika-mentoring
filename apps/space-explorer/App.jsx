import { useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { FIRST_DAY, apodToday, clampDay, formatDay, isIsoDay, randomDay, shiftDay } from './dates.js'
import { apodErrorKind, useApod } from './useApod.js'
import { useLocalStorage } from './useLocalStorage.js'
import ApodMedia, { isPlaceholder } from './ApodMedia.jsx'
import './app.css'

const FAVORITES_KEY = 'rika:space-explorer:favorites'

const TEXT = {
  en: {
    intro: 'Every day NASA publishes a new picture of our universe, with a short explanation written by an astronomer.',
    date: 'Date',
    prev: 'Previous day',
    next: 'Next day',
    today: 'Today',
    random: 'Random day',
    loading: 'Loading the picture…',
    fromCache: 'Loaded from your browser cache, no request needed.',
    fromNasa: (left) =>
      left == null
        ? 'Fetched from the NASA API.'
        : `Fetched from the NASA API · ${left} requests left this hour with the demo key.`,
    credit: 'Credit',
    save: 'Save to favorites',
    unsave: 'Remove from favorites',
    favorites: 'Favorites',
    favoritesEmpty: 'Save a picture with the star and it will be waiting for you here.',
    removeFavorite: (title) => `Remove “${title}” from favorites`,
    errors: {
      rate: 'NASA’s demo key allows only a few requests per hour from one network, and that limit has been reached. Please try again later. Days you have already opened and your favorites still load from the cache.',
      notFound: 'There is no picture for this date.',
      server: 'The NASA API is not responding right now.',
      timeout: 'NASA’s server took too long to answer.',
      offline: 'You seem to be offline. Days you have already opened still work.',
    },
    todayMissing: 'Today’s picture may not be published yet.',
    yesterday: 'Show yesterday’s picture',
    retry: 'Try again',
    placeholder: 'For this day the NASA API sent its logo instead of the actual picture.',
    openOriginal: 'Open on apod.nasa.gov',
    openFull: 'Open in full resolution',
    videoElsewhere: 'This day features a video that is hosted outside YouTube.',
    watchVideo: 'Watch the video',
    otherMedia: 'This day features interactive content that cannot be shown here.',
    englishOnly: null,
    source: 'Data: NASA Astronomy Picture of the Day (APOD) API.',
  },
  hu: {
    intro: 'A NASA minden nap közzétesz egy új képet a világegyetemről, egy csillagász rövid magyarázatával.',
    date: 'Dátum',
    prev: 'Előző nap',
    next: 'Következő nap',
    today: 'Ma',
    random: 'Véletlen nap',
    loading: 'A kép betöltése…',
    fromCache: 'A böngésző gyorsítótárából, kérés nélkül.',
    fromNasa: (left) =>
      left == null
        ? 'A NASA API-ból töltve.'
        : `A NASA API-ból töltve · a demókulccsal ebben az órában még ${left} kérés maradt.`,
    credit: 'Készítette',
    save: 'Mentés a kedvencek közé',
    unsave: 'Törlés a kedvencek közül',
    favorites: 'Kedvencek',
    favoritesEmpty: 'A csillaggal elmentett képek itt várnak rád.',
    removeFavorite: (title) => `„${title}” törlése a kedvencek közül`,
    errors: {
      rate: 'A NASA demókulcsa óránként csak néhány kérést enged egy hálózatról, és ez a keret most elfogyott. Próbáld újra később! A már megnyitott napok és a kedvenceid a gyorsítótárból továbbra is betöltődnek.',
      notFound: 'Erre a napra nincs kép.',
      server: 'A NASA API most nem válaszol.',
      timeout: 'A NASA szervere túl lassan válaszolt.',
      offline: 'Úgy tűnik, nincs internetkapcsolat. A már megnyitott napok így is működnek.',
    },
    todayMissing: 'Lehet, hogy a mai kép még nem jelent meg.',
    yesterday: 'A tegnapi kép',
    retry: 'Újrapróbálás',
    placeholder: 'Erre a napra a NASA API a logóját küldte a valódi kép helyett.',
    openOriginal: 'Megnyitás az apod.nasa.gov oldalon',
    openFull: 'Megnyitás teljes felbontásban',
    videoElsewhere: 'Ezen a napon olyan videó szerepel, amely nem a YouTube-on érhető el.',
    watchVideo: 'A videó megnyitása',
    otherMedia: 'Ezen a napon interaktív tartalom szerepel, amelyet itt nem lehet megjeleníteni.',
    englishOnly: 'A NASA leírásai angol nyelvűek.',
    source: 'Adatok: NASA Astronomy Picture of the Day (APOD) API.',
  },
}

function DateNav({ date, today, onChange, t }) {
  return (
    <div className="sx-nav">
      <button
        type="button"
        className="btn btn--ghost sx-nav__step"
        disabled={date <= FIRST_DAY}
        onClick={() => onChange(shiftDay(date, -1))}
      >
        <span aria-hidden="true">‹</span>
        <span className="sx-nav__label">{t.prev}</span>
      </button>
      <label className="field sx-nav__date">
        <span className="visually-hidden">{t.date}</span>
        <input
          className="input"
          type="date"
          min={FIRST_DAY}
          max={today}
          value={date}
          onChange={(e) => isIsoDay(e.target.value) && onChange(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="btn btn--ghost sx-nav__step"
        disabled={date >= today}
        onClick={() => onChange(shiftDay(date, 1))}
      >
        <span className="sx-nav__label">{t.next}</span>
        <span aria-hidden="true">›</span>
      </button>
      <div className="sx-nav__quick">
        <button type="button" className="chip" aria-pressed={date === today} onClick={() => onChange(today)}>
          {t.today}
        </button>
        <button type="button" className="chip" onClick={() => onChange(randomDay(FIRST_DAY, today))}>
          {t.random}
        </button>
      </div>
    </div>
  )
}

function ApodSkeleton() {
  return (
    <div className="sx-card" aria-hidden="true">
      <div className="sx-skel sx-skel--media" />
      <div className="sx-skel sx-skel--line" style={{ width: '30%' }} />
      <div className="sx-skel sx-skel--title" />
      <div className="sx-skel sx-skel--line" />
      <div className="sx-skel sx-skel--line" />
      <div className="sx-skel sx-skel--line" style={{ width: '70%' }} />
    </div>
  )
}

function ApodError({ error, isToday, onRetry, onYesterday, t }) {
  const kind = apodErrorKind(error)
  return (
    <div className="sx-error" role="alert">
      <p>{t.errors[kind]}</p>
      {isToday && kind !== 'rate' && kind !== 'offline' && <p>{t.todayMissing}</p>}
      <div className="sx-error__actions">
        <button type="button" className="btn" onClick={onRetry}>
          {t.retry}
        </button>
        {isToday && (
          <button type="button" className="btn btn--ghost" onClick={onYesterday}>
            {t.yesterday}
          </button>
        )}
      </div>
    </div>
  )
}

function ApodCard({ apod, fromCache, remaining, isFavorite, onToggleFavorite, locale, t }) {
  return (
    <article className="sx-card">
      {/* The key resets ApodMedia's own state (e.g. a broken image) whenever the day changes. */}
      <ApodMedia key={apod.date} apod={apod} t={t} />
      <div className="sx-card__head">
        <div>
          <p className="sx-card__date">
            {formatDay(apod.date, locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h3 className="sx-card__title">{apod.title}</h3>
          {apod.copyright && (
            <p className="sx-card__credit">
              {t.credit}: {apod.copyright.replace(/\s+/g, ' ').trim()}
            </p>
          )}
        </div>
        <button type="button" className="sx-fav" data-on={isFavorite} onClick={onToggleFavorite}>
          <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
          {isFavorite ? t.unsave : t.save}
        </button>
      </div>
      {t.englishOnly && <p className="sx-card__lang">{t.englishOnly}</p>}
      <p className="sx-card__text" lang="en">
        {apod.explanation?.trim()}
      </p>
      <p className="sx-card__meta">{fromCache ? t.fromCache : t.fromNasa(remaining)}</p>
    </article>
  )
}

function Favorites({ favorites, current, onOpen, onRemove, locale, t }) {
  return (
    <section className="sx-favs" aria-labelledby="sx-favs-title">
      <h3 id="sx-favs-title" className="sx-section-title">
        {t.favorites} {favorites.length > 0 && <span className="sx-count">{favorites.length}</span>}
      </h3>
      {favorites.length === 0 ? (
        <p className="sx-muted">{t.favoritesEmpty}</p>
      ) : (
        <ul className="sx-favs__list">
          {favorites.map((fav) => (
            <li key={fav.date} className="sx-favs__item" data-current={fav.date === current}>
              <button type="button" className="sx-favs__open" onClick={() => onOpen(fav.date)}>
                {fav.thumb ? (
                  <img src={fav.thumb} alt="" loading="lazy" />
                ) : (
                  // No picture (e.g. a video day): a flat night-to-teal block with a planet icon.
                  <span className="sx-favs__fallback" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M3.5 15.5c-1.2 2 .1 3.1 3.4 2.6 3.6-.6 8.4-3.1 11.6-6 2.4-2.2 3.3-4.1 2-4.7-.8-.4-2.1-.2-3.8.4" />
                    </svg>
                  </span>
                )}
                <span className="sx-favs__date">{formatDay(fav.date, locale, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span className="sx-favs__title">{fav.title}</span>
              </button>
              <button
                type="button"
                className="sx-favs__remove"
                aria-label={t.removeFavorite(fav.title)}
                onClick={() => onRemove(fav.date)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SpaceExplorer() {
  const lang = useLang()
  const t = useText(TEXT)
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'

  const [today] = useState(apodToday)
  const [date, setDate] = useState(today)
  const [stored, setFavorites] = useLocalStorage(FAVORITES_KEY, [])
  const favorites = Array.isArray(stored) ? stored : [] // never trust what is in storage
  const apod = useApod(date)

  const go = (next) => setDate(clampDay(next, FIRST_DAY, today))

  const data = apod.status === 'success' ? apod.data : null
  const isFavorite = Boolean(data && favorites.some((f) => f.date === data.date))

  const toggleFavorite = () => {
    if (!data) return
    if (isFavorite) {
      setFavorites(favorites.filter((f) => f.date !== data.date))
      return
    }
    // Only what the list needs is saved; the full answer is already in the cache.
    const thumb = isPlaceholder(data) ? null : data.media_type === 'image' ? data.url : (data.thumbnail_url ?? null)
    setFavorites([{ date: data.date, title: data.title, thumb }, ...favorites].slice(0, 30))
  }

  return (
    <div className="sx">
      <p className="sx-intro">{t.intro}</p>

      <DateNav date={date} today={today} onChange={go} t={t} />

      <p className="visually-hidden" aria-live="polite">
        {apod.status === 'loading' ? t.loading : data ? data.title : ''}
      </p>

      {apod.status === 'loading' && <ApodSkeleton />}
      {apod.status === 'error' && (
        <ApodError
          error={apod.error}
          isToday={date === today}
          onRetry={apod.retry}
          onYesterday={() => go(shiftDay(today, -1))}
          t={t}
        />
      )}
      {data && (
        <ApodCard
          apod={data}
          fromCache={apod.fromCache}
          remaining={apod.remaining}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          locale={locale}
          t={t}
        />
      )}

      <Favorites
        favorites={favorites}
        current={date}
        onOpen={go}
        onRemove={(day) => setFavorites(favorites.filter((f) => f.date !== day))}
        locale={locale}
        t={t}
      />

      <p className="sx-muted sx-source">{t.source}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="space-explorer">
      <SpaceExplorer />
    </AppFrame>
  )
}
