import { useEffect, useReducer, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { PET_COLORS, STATS, levelOf, moodOf, petReducer, restore, savePet, stageOf } from './petLogic.js'
import Pet from './Pet.jsx'
import './app.css'

const TEXT = {
  en: {
    adoptTitle: 'Adopt your pet',
    adoptIntro: 'Give your new friend a name and a colour. It will get hungry, bored and sleepy over time, even while this page is closed.',
    name: 'Name',
    namePlaceholder: 'e.g. Mochi',
    color: 'Colour',
    colors: ['Lavender', 'Aqua', 'Terracotta'],
    adopt: 'Adopt',
    stages: { baby: 'Baby', child: 'Youngster', adult: 'Grown-up' },
    age: (stage, duration) => `${stage} · ${duration} old`,
    moods: {
      happy: (n) => `${n} is happy`,
      okay: (n) => `${n} is doing fine`,
      hungry: (n) => `${n} is hungry`,
      tired: (n) => `${n} is tired`,
      sad: (n) => `${n} feels lonely`,
      sleeping: (n) => `${n} is asleep`,
    },
    stats: { fullness: 'Fullness', happiness: 'Happiness', energy: 'Energy' },
    levels: {
      fullness: ['Hungry', 'Peckish', 'Satisfied', 'Full'],
      happiness: ['Sad', 'Bored', 'Content', 'Cheerful'],
      energy: ['Exhausted', 'Sleepy', 'Rested', 'Lively'],
    },
    actions: 'Care',
    feed: 'Feed',
    play: 'Play',
    sleep: 'Put to bed',
    wake: 'Wake up',
    asleepHint: 'Feeding and playing wait until your pet wakes up.',
    messages: {
      adopt: (n) => `Welcome home, ${n}!`,
      feed: { ok: (n) => `${n} munches happily.`, full: (n) => `${n} is too full to eat more.` },
      play: { ok: (n) => `${n} loves the game!`, tired: (n) => `${n} is too tired to play. Time for a nap?` },
      sleep: (n) => `${n} curls up for a nap.`,
      wake: (n) => `${n} is awake again.`,
      woke: (n) => `${n} woke up fully rested.`,
      rename: (n) => `Hello, ${n}!`,
    },
    awayChanges: { fullness: 'got hungry', happiness: 'got a little lonely', energy: 'got sleepy', woke: 'woke up from a nap' },
    away: (duration, name, list) => `While you were away for ${duration}, ${name} ${list}.`,
    awayFine: (duration, name) => `You were away for ${duration}. ${name} is doing fine.`,
    dismiss: 'OK',
    settings: 'Settings',
    speed: 'Time',
    speeds: { 1: 'Real time', 60: 'Fast (1 min = 1 h)' },
    speedNote: 'Time away from the page always counts at real speed.',
    rename: 'Rename',
    save: 'Save',
    cancel: 'Cancel',
    reset: 'Start over',
    resetConfirm: 'Say goodbye and adopt a new pet?',
    resetYes: 'Yes, start over',
  },
  hu: {
    adoptTitle: 'Fogadj örökbe egy kis kedvencet',
    adoptIntro: 'Adj nevet és színt az új barátodnak. Idővel megéhezik, unatkozik és elálmosodik, akkor is, ha ez az oldal be van zárva.',
    name: 'Név',
    namePlaceholder: 'pl. Mochi',
    color: 'Szín',
    colors: ['Levendula', 'Türkiz', 'Terrakotta'],
    adopt: 'Örökbefogadás',
    stages: { baby: 'Kicsi', child: 'Kamasz', adult: 'Felnőtt' },
    age: (stage, duration) => `${stage} · ${duration} idős`,
    moods: {
      happy: (n) => `${n} boldog`,
      okay: (n) => `${n} jól van`,
      hungry: (n) => `${n} éhes`,
      tired: (n) => `${n} fáradt`,
      sad: (n) => `${n} magányos`,
      sleeping: (n) => `${n} alszik`,
    },
    stats: { fullness: 'Jóllakottság', happiness: 'Kedv', energy: 'Energia' },
    levels: {
      fullness: ['Éhes', 'Kicsit éhes', 'Elégedett', 'Jóllakott'],
      happiness: ['Szomorú', 'Unatkozik', 'Nyugodt', 'Vidám'],
      energy: ['Kimerült', 'Álmos', 'Kipihent', 'Pörgős'],
    },
    actions: 'Gondozás',
    feed: 'Etetés',
    play: 'Játék',
    sleep: 'Lefektetés',
    wake: 'Ébresztés',
    asleepHint: 'Az etetés és a játék megvárja, amíg a kedvenced felébred.',
    messages: {
      adopt: (n) => `Isten hozott itthon, ${n}!`,
      feed: { ok: (n) => `${n} jóízűen falatozik.`, full: (n) => `${n} már túl tele van.` },
      play: { ok: (n) => `${n} imád játszani!`, tired: (n) => `${n} túl fáradt a játékhoz. Jöhet egy kis alvás?` },
      sleep: (n) => `${n} összegömbölyödik, és elszundít.`,
      wake: (n) => `${n} újra ébren van.`,
      woke: (n) => `${n} kipihenten felébredt.`,
      rename: (n) => `Szia, ${n}!`,
    },
    awayChanges: { fullness: 'megéhezett', happiness: 'kicsit magányos lett', energy: 'elálmosodott', woke: 'felébredt a szunyókálásból' },
    away: (duration, name, list) => `Amíg távol voltál (${duration}), ${name} ${list}.`,
    awayFine: (duration, name) => `${duration} voltál távol. ${name} jól van.`,
    dismiss: 'Rendben',
    settings: 'Beállítások',
    speed: 'Idő',
    speeds: { 1: 'Valós idő', 60: 'Gyors (1 perc = 1 óra)' },
    speedNote: 'Az oldalon kívül töltött idő mindig valós sebességgel számít.',
    rename: 'Átnevezés',
    save: 'Mentés',
    cancel: 'Mégse',
    reset: 'Újrakezdés',
    resetConfirm: 'Elbúcsúzol, és új kedvencet fogadsz örökbe?',
    resetYes: 'Igen, újrakezdem',
  },
}

const SPEED_KEY = 'rika:virtual-pet:speed'
const locale = (lang) => (lang === 'hu' ? 'hu-HU' : 'en-GB')

// "3 hours 5 minutes" / "3 óra 5 perc", with the units translated by Intl.
function formatDuration(ms, lang) {
  const minutes = Math.max(0, Math.floor(ms / 60000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60
  const unit = (value, name) => new Intl.NumberFormat(locale(lang), { style: 'unit', unit: name, unitDisplay: 'long' }).format(value)
  const parts = []
  if (days) parts.push(unit(days, 'day'))
  if (hours) parts.push(unit(hours, 'hour'))
  if (!days && (mins || !hours)) parts.push(unit(mins, 'minute'))
  return parts.join(' ')
}

function loadSpeed() {
  try {
    return localStorage.getItem(SPEED_KEY) === '60' ? 60 : 1
  } catch {
    return 1
  }
}

function AdoptForm({ onAdopt, t }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PET_COLORS[0])
  const trimmed = name.trim()

  return (
    <form
      className="vp-adopt"
      onSubmit={(e) => {
        e.preventDefault()
        if (trimmed) onAdopt(trimmed, color)
      }}
    >
      <div className="vp-adopt__preview">
        <Pet color={color} mood="happy" stage="baby" label={trimmed || t.namePlaceholder} />
      </div>
      <div className="vp-adopt__fields">
        <h3>{t.adoptTitle}</h3>
        <p>{t.adoptIntro}</p>
        <label className="field">
          <span>{t.name}</span>
          <input className="input" value={name} maxLength={16} placeholder={t.namePlaceholder} onChange={(e) => setName(e.target.value)} />
        </label>
        <ColorPicker value={color} onChange={setColor} t={t} />
        <button type="submit" className="btn" disabled={!trimmed}>
          {t.adopt}
        </button>
      </div>
    </form>
  )
}

function ColorPicker({ value, onChange, t }) {
  return (
    <fieldset className="vp-colors">
      <legend>{t.color}</legend>
      {PET_COLORS.map((c, i) => (
        <label key={c} className="vp-colors__option">
          <input type="radio" name="vp-color" value={c} checked={value === c} onChange={() => onChange(c)} />
          <span className="vp-colors__dot" style={{ background: c }} aria-hidden="true" />
          {t.colors[i]}
        </label>
      ))}
    </fieldset>
  )
}

function StatBar({ label, value, words }) {
  const rounded = Math.round(value)
  const level = levelOf(value)
  return (
    <div className={`vp-stat is-level-${level}`}>
      <div className="vp-stat__head">
        <span className="vp-stat__label">{label}</span>
        <span className="vp-stat__word">
          {words[level]} · {rounded}%
        </span>
      </div>
      <div className="vp-stat__track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={rounded} aria-valuetext={`${rounded}%, ${words[level]}`}>
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function AwayNotice({ away, name, lang, onDismiss, t }) {
  const duration = formatDuration(away.ms, lang)
  const changes = [...away.drops.map((key) => t.awayChanges[key]), ...(away.wokeUp ? [t.awayChanges.woke] : [])]
  const list = new Intl.ListFormat(locale(lang), { type: 'conjunction' }).format(changes)
  return (
    <div className="vp-away" role="status">
      <p>{changes.length ? t.away(duration, name, list) : t.awayFine(duration, name)}</p>
      <button type="button" className="btn btn--ghost" onClick={onDismiss}>
        {t.dismiss}
      </button>
    </div>
  )
}

function Settings({ pet, speed, onSpeed, dispatch, t }) {
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(pet.name)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <details className="vp-settings">
      <summary>{t.settings}</summary>
      <div className="vp-settings__body">
        <div className="vp-settings__row" role="group" aria-label={t.speed}>
          <span className="vp-settings__label">{t.speed}</span>
          {[1, 60].map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={speed === s} onClick={() => onSpeed(s)}>
              {t.speeds[s]}
            </button>
          ))}
        </div>
        <p className="vp-settings__note">{t.speedNote}</p>

        <ColorPicker value={pet.color} onChange={(color) => dispatch({ type: 'recolor', color, now: Date.now() })} t={t} />

        {renaming ? (
          <form
            className="vp-settings__rename"
            onSubmit={(e) => {
              e.preventDefault()
              if (!draft.trim()) return
              dispatch({ type: 'rename', name: draft.trim(), now: Date.now() })
              setRenaming(false)
            }}
          >
            <label className="field">
              <span>{t.name}</span>
              <input className="input" value={draft} maxLength={16} onChange={(e) => setDraft(e.target.value)} autoFocus />
            </label>
            <button type="submit" className="btn" disabled={!draft.trim()}>
              {t.save}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setRenaming(false)}>
              {t.cancel}
            </button>
          </form>
        ) : (
          <div className="vp-settings__row">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setDraft(pet.name)
                setRenaming(true)
              }}
            >
              {t.rename}
            </button>
            {confirmReset ? (
              <span className="vp-settings__confirm" role="group" aria-label={t.resetConfirm}>
                <span>{t.resetConfirm}</span>
                <button type="button" className="btn vp-danger" onClick={() => dispatch({ type: 'reset', now: Date.now() })}>
                  {t.resetYes}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setConfirmReset(false)}>
                  {t.cancel}
                </button>
              </span>
            ) : (
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmReset(true)}>
                {t.reset}
              </button>
            )}
          </div>
        )}
      </div>
    </details>
  )
}

function VirtualPet() {
  const t = useText(TEXT)
  const lang = useLang()
  // useReducer with a lazy initialiser: the saved pet is loaded once and the time spent away is replayed.
  const [state, dispatch] = useReducer(petReducer, undefined, () => restore(Date.now()))
  const [speed, setSpeed] = useState(loadSpeed)
  const { pet, away, last } = state
  const hasPet = pet != null

  // Time passes: one tick per second. The reducer works out how much pet time that was.
  useEffect(() => {
    if (!hasPet) return
    const id = setInterval(() => dispatch({ type: 'tick', now: Date.now(), speed }), 1000)
    return () => clearInterval(id)
  }, [hasPet, speed])

  // Every change is saved together with its timestamp, so the next visit can work out the time away.
  useEffect(() => {
    savePet(pet)
  }, [pet])

  useEffect(() => {
    try {
      localStorage.setItem(SPEED_KEY, String(speed))
    } catch {
      // not important if this cannot be stored
    }
  }, [speed])

  if (!pet) {
    return (
      <div className="vp">
        <AdoptForm onAdopt={(name, color) => dispatch({ type: 'adopt', name, color, now: Date.now() })} t={t} />
      </div>
    )
  }

  const mood = moodOf(pet)
  const stage = stageOf(pet)
  const message = last ? (typeof t.messages[last.type] === 'function' ? t.messages[last.type] : t.messages[last.type]?.[last.result])?.(pet.name) : ''
  const act = (type) => dispatch({ type, now: Date.now() })

  return (
    <div className="vp">
      {away && <AwayNotice away={away} name={pet.name} lang={lang} onDismiss={() => dispatch({ type: 'dismissAway' })} t={t} />}

      <div className="vp-main">
        <div className={`vp-stage is-${mood}`}>
          <Pet color={pet.color} mood={mood} stage={stage} last={last} label={t.moods[mood](pet.name)} />
        </div>

        <div className="vp-side">
          <header className="vp-head">
            <h3>{pet.name}</h3>
            <p className="vp-head__age">{t.age(t.stages[stage], formatDuration(pet.age, lang))}</p>
            <p className="vp-head__mood">{t.moods[mood](pet.name)}</p>
          </header>

          <div className="vp-stats">
            {STATS.map((key) => (
              <StatBar key={key} label={t.stats[key]} value={pet.stats[key]} words={t.levels[key]} />
            ))}
          </div>

          <div className="vp-actions" role="group" aria-label={t.actions}>
            <button type="button" className="btn" onClick={() => act('feed')} disabled={pet.sleeping}>
              {t.feed}
            </button>
            <button type="button" className="btn" onClick={() => act('play')} disabled={pet.sleeping}>
              {t.play}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => act(pet.sleeping ? 'wake' : 'sleep')}>
              {pet.sleeping ? t.wake : t.sleep}
            </button>
          </div>
          {pet.sleeping && <p className="vp-hint">{t.asleepHint}</p>}

          <p className="vp-message" aria-live="polite">
            {message}
          </p>
        </div>
      </div>

      <Settings pet={pet} speed={speed} onSpeed={setSpeed} dispatch={dispatch} t={t} />
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="virtual-pet">
      <VirtualPet />
    </AppFrame>
  )
}
