import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { thumbnailOf } from './api.js'
import { FIRST_DAY, apodToday, clampDay, formatDay, isIsoDay, randomDay, shiftDay } from './dates.js'
import { cacheDay, useApod } from './useApod.js'
import { useLocalStorage } from './useLocalStorage.js'
import ApodError from './ApodError.jsx'
import ApodMedia from './ApodMedia.jsx'
import Gallery from './Gallery.jsx'
import './app.css'

const FAVORITES_KEY = 'rika:space-explorer:favorite-days'

// Earlier versions of this lesson cached answers from NASA's servers under these keys; they are not needed any more.
for (const oldKey of ['rika:space-explorer:cache', 'rika:space-explorer:favorites']) {
  try {
    localStorage.removeItem(oldKey)
  } catch {
    // storage blocked: nothing to clean up
  }
}

const TEXT = {
  en: {
    intro:
      'Every day of the archive has its own picture of our universe with a short explanation, served by the lesson’s own space API.',
    viewLabel: 'View',
    dayView: 'Picture of the day',
    gallery: 'Gallery',
    date: 'Date',
    prev: 'Previous day',
    next: 'Next day',
    today: 'Today',
    random: 'Random day',
    loading: 'Loading the picture…',
    fromCache: 'Loaded from your browser cache, no request needed.',
    fromApi: (left) =>
      left == null
        ? 'Fetched from the space API.'
        : `Fetched from the space API · ${left} requests left this hour with the demo key.`,
    credit: 'Credit',
    save: 'Save to favorites',
    unsave: 'Remove from favorites',
    favorites: 'Favorites',
    favoritesEmpty: 'Save a picture with the star and it will be waiting for you here.',
    removeFavorite: (title) => `Remove “${title}” from favorites`,
    errors: {
      rate: 'The demo key allows only 30 requests per hour, and they have all been used. Try again later, or reload the page: this is only a practice limit. Days you have already opened and your favorites still load from the cache.',
      key: 'The API did not accept the key (403 Forbidden). Check VITE_APOD_KEY in your .env.local file, or remove it to use DEMO_KEY.',
      notFound: 'There is no picture for this date.',
      server: 'The space API is not responding right now.',
      timeout: 'The space API took too long to answer.',
      offline: 'You seem to be offline. Days you have already opened still work.',
    },
    todayMissing: 'Today’s picture may not be published yet.',
    yesterday: 'Show yesterday’s picture',
    retry: 'Try again',
    openFull: 'Open in full resolution',
    close: 'Close',
    animation: 'Video · animation',
    video: 'Video',
    play: 'Play',
    pause: 'Pause',
    mediaError: 'This picture could not be loaded. Try again later.',
    videoUnsupported: 'This day features a video in a format this page cannot play.',
    otherMedia: 'This day features interactive content that cannot be shown here.',
    sourceLabel: 'Where should the pictures come from?',
    modes: { archive: 'Archive', random: 'Random pictures' },
    filterLabel: 'Filter',
    filters: { all: 'All', image: 'Images', video: 'Videos' },
    galleryLoading: 'Pictures are on their way…',
    galleryMore: 'Scroll on for more pictures!',
    galleryEnd: 'This was the first day of the archive.',
    galleryCount: (n) => (n === 1 ? '1 picture in the gallery.' : `${n} pictures in the gallery.`),
    openAsDay: 'Open as the picture of the day',
    source:
      'Data and pictures: the lesson’s own APOD-style API (/api/apod), running in your browser. Every picture is drawn in code.',
  },
  hu: {
    intro:
      'Az archívum minden napjához tartozik egy kép a világegyetemről, rövid magyarázattal – ezeket a lecke saját űr-API-ja szolgálja ki.',
    viewLabel: 'Nézet',
    dayView: 'A nap képe',
    gallery: 'Galéria',
    date: 'Dátum',
    prev: 'Előző nap',
    next: 'Következő nap',
    today: 'Ma',
    random: 'Véletlen nap',
    loading: 'A kép betöltése…',
    fromCache: 'A böngésző gyorsítótárából, kérés nélkül.',
    fromApi: (left) =>
      left == null ? 'Az űr-API-ból töltve.' : `Az űr-API-ból töltve · a demókulccsal ebben az órában még ${left} kérés maradt.`,
    credit: 'Készítette',
    save: 'Mentés a kedvencek közé',
    unsave: 'Törlés a kedvencek közül',
    favorites: 'Kedvencek',
    favoritesEmpty: 'A csillaggal elmentett képek itt várnak rád.',
    removeFavorite: (title) => `„${title}” törlése a kedvencek közül`,
    errors: {
      rate: 'A demókulcs óránként csak 30 kérést enged, és ezek most elfogytak. Próbáld újra később, vagy töltsd újra az oldalt: ez csak egy gyakorló korlát. A már megnyitott napok és a kedvenceid a gyorsítótárból továbbra is betöltődnek.',
      key: 'Az API nem fogadta el a kulcsot (403 Forbidden). Ellenőrizd a VITE_APOD_KEY értékét a .env.local fájlban, vagy töröld, és a DEMO_KEY lesz használva.',
      notFound: 'Erre a napra nincs kép.',
      server: 'Az űr-API most nem válaszol.',
      timeout: 'Az űr-API túl lassan válaszolt.',
      offline: 'Úgy tűnik, nincs internetkapcsolat. A már megnyitott napok így is működnek.',
    },
    todayMissing: 'Lehet, hogy a mai kép még nem jelent meg.',
    yesterday: 'A tegnapi kép',
    retry: 'Újrapróbálás',
    openFull: 'Megnyitás teljes felbontásban',
    close: 'Bezárás',
    animation: 'Videó · animáció',
    video: 'Videó',
    play: 'Lejátszás',
    pause: 'Szünet',
    mediaError: 'Ezt a képet nem sikerült betölteni. Próbáld újra később!',
    videoUnsupported: 'Ezen a napon olyan formátumú videó szerepel, amelyet ez az oldal nem tud lejátszani.',
    otherMedia: 'Ezen a napon interaktív tartalom szerepel, amelyet itt nem lehet megjeleníteni.',
    sourceLabel: 'Honnan jöjjenek a képek?',
    modes: { archive: 'Archívum', random: 'Véletlen képek' },
    filterLabel: 'Szűrés',
    filters: { all: 'Mind', image: 'Képek', video: 'Videók' },
    galleryLoading: 'Képek érkeznek…',
    galleryMore: 'Görgess lejjebb a további képekért!',
    galleryEnd: 'Ez volt az archívum első napja.',
    galleryCount: (n) => `${n} kép van a galériában.`,
    openAsDay: 'Megnyitás a nap képeként',
    source:
      'Adatok és képek: a lecke saját, APOD-mintájú API-ja (/api/apod), amely a böngésződben fut. Minden kép kóddal rajzolt.',
  },
}

function DateNav({ date, today, onChange, t }) {
  const inputRef = useRef(null)

  // The field is not controlled by React: while a year is typed digit by digit it holds half-finished dates
  // (0002-…, 0020-…, 0202-…), and writing the open day back after every keystroke would undo the typing.
  // So React only gives it its first value, and when the buttons change the day, an effect writes it in.
  useEffect(() => {
    inputRef.current.value = date
  }, [date])

  // A typed day counts only when it is complete and inside the archive.
  const pick = (value) => {
    if (isIsoDay(value) && value >= FIRST_DAY && value <= today) onChange(value)
  }

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
          ref={inputRef}
          className="input"
          type="date"
          min={FIRST_DAY}
          max={today}
          defaultValue={date}
          onChange={(e) => pick(e.target.value)}
          // Leaving the field with an unfinished or out-of-range date shows the open day again.
          onBlur={(e) => {
            e.target.value = date
          }}
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
      <p className="sx-card__text">{apod.explanation?.trim()}</p>
      <p className="sx-card__meta">{fromCache ? t.fromCache : t.fromApi(remaining)}</p>
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
                <span className="sx-favs__date">
                  {formatDay(fav.date, locale, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
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

// The two views of the app: the picture of one day, and the gallery of many days.
const VIEWS = ['day', 'gallery']

function SpaceExplorer() {
  const lang = useLang()
  const t = useText(TEXT)
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const rootRef = useRef(null)

  const [today] = useState(apodToday)
  const [view, setView] = useState('day')
  const [date, setDate] = useState(today)
  const [stored, setFavorites] = useLocalStorage(FAVORITES_KEY, [])
  const favorites = Array.isArray(stored) ? stored : [] // never trust what is in storage
  const apod = useApod(date, lang)

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
    setFavorites([{ date: data.date, title: data.title, thumb: thumbnailOf(data) }, ...favorites].slice(0, 30))
  }

  // "Open as the picture of the day" in the gallery's large view: the gallery already has the whole answer,
  // so it goes into the cache, and the day view shows it without a new request.
  const openDay = (picture) => {
    cacheDay(lang, picture)
    go(picture.date)
    setView('day')
    if (rootRef.current && rootRef.current.getBoundingClientRect().top < 0) rootRef.current.scrollIntoView()
  }

  return (
    <div className="sx" ref={rootRef}>
      <p className="sx-intro">{t.intro}</p>

      <div className="sx-views" role="group" aria-label={t.viewLabel}>
        {VIEWS.map((value) => (
          <button
            key={value}
            type="button"
            className="sx-views__button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
          >
            {value === 'day' ? t.dayView : t.gallery}
          </button>
        ))}
      </div>

      {view === 'day' && (
        <>
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
        </>
      )}

      {/* The key starts a fresh gallery (first page, empty list) when the language changes. */}
      {view === 'gallery' && <Gallery key={lang} today={today} lang={lang} locale={locale} onOpenDay={openDay} t={t} />}

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
