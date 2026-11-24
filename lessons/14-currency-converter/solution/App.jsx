import { useEffect, useMemo, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { errorKind, useFetch } from './useFetch.js'
import { API, FALLBACK_RATES, codesOf, isRateTable, rateOf, readStored, writeStored } from './rates.js'
import RateChart from './RateChart.jsx'
import './app.css'

const RATES_KEY = 'rika:currency-converter:last-rates'
const PAIRS_KEY = 'rika:currency-converter:pairs'

const TEXT = {
  en: {
    amount: 'Amount',
    from: 'From',
    to: 'To',
    swap: 'Swap currencies',
    result: 'Converted amount',
    invalid: 'Enter an amount (0 or more).',
    loadingRates: 'Fetching the latest exchange rates…',
    live: (date) => `Current reference rates from the rates API, updated ${date}.`,
    cached: (date) => `Showing the last known rates from ${date}.`,
    fixed: (date) => `Showing fixed sample rates from ${date}. These are not live.`,
    badge: { live: 'Current rate', loading: 'Updating…', cached: 'Last known rate', fixed: 'Fixed rate' },
    errors: {
      offline: 'You seem to be offline.',
      rate: 'The rate service is limiting requests right now.',
      timeout: 'The rate service took too long to answer.',
      server: 'The rate service is not responding.',
      other: 'The current rates could not be loaded.',
    },
    retry: 'Try again',
    savePair: 'Save pair',
    removePair: 'Remove pair',
    pairs: 'Saved pairs',
    pairsEmpty: 'Save a pair with the star to switch back to it with one click.',
    trend: '30-day trend',
    trendLoading: 'Loading the last 30 days…',
    trendError: 'The chart could not be loaded.',
    trendEmpty: 'There is not enough data for a chart yet.',
    trendSame: 'Pick two different currencies to see the trend.',
    trendSummary: (from, to, first, last, change) =>
      `${from} to ${to} over 30 days: from ${first} to ${last}, a change of ${change}.`,
    low: 'Low',
    high: 'High',
    change: 'Change',
    source: 'Rates: the lesson’s own rates API (sample reference rates, updated on working days).',
  },
  hu: {
    amount: 'Összeg',
    from: 'Miből',
    to: 'Mibe',
    swap: 'Pénznemek cseréje',
    result: 'Átváltott összeg',
    invalid: 'Adj meg egy összeget (0 vagy több).',
    loadingRates: 'A legfrissebb árfolyamok betöltése…',
    // The Hungarian date already ends with a full stop ("2026. nov. 24."), so no second one after it.
    live: (date) => `Aktuális referencia-árfolyamok az árfolyam-API-ból, frissítve: ${date}`,
    cached: (date) => `Az utolsó ismert árfolyamokat látod (${date}).`,
    fixed: (date) => `Fix mintaárfolyamokat látod (${date}), ezek nem élő adatok.`,
    badge: { live: 'Aktuális árfolyam', loading: 'Frissítés…', cached: 'Utolsó ismert árfolyam', fixed: 'Fix árfolyam' },
    errors: {
      offline: 'Úgy tűnik, nincs internetkapcsolat.',
      rate: 'Az árfolyam-szolgáltatás most korlátozza a kéréseket.',
      timeout: 'Az árfolyam-szolgáltatás túl lassan válaszolt.',
      server: 'Az árfolyam-szolgáltatás nem válaszol.',
      other: 'Nem sikerült betölteni az aktuális árfolyamokat.',
    },
    retry: 'Újrapróbálás',
    savePair: 'Pár mentése',
    removePair: 'Pár törlése',
    pairs: 'Mentett párok',
    pairsEmpty: 'A csillaggal elmentheted a párt, és egy kattintással visszatérhetsz hozzá.',
    trend: 'Az elmúlt 30 nap',
    trendLoading: 'Az elmúlt 30 nap betöltése…',
    trendError: 'Nem sikerült betölteni a grafikont.',
    trendEmpty: 'Még nincs elég adat a grafikonhoz.',
    trendSame: 'Válassz két különböző pénznemet a grafikonhoz.',
    trendSummary: (from, to, first, last, change) =>
      `${from}–${to} az elmúlt 30 napban: ${first} helyett ${last}, a változás ${change}.`,
    low: 'Legalacsonyabb',
    high: 'Legmagasabb',
    change: 'Változás',
    source: 'Árfolyamok: a lecke saját árfolyam-API-ja (minta referencia-árfolyamok, munkanaponként frissülnek).',
  },
}

// "1 234,5" and "1234.5" both mean the same amount.
const parseAmount = (text) => Number(text.replace(/\s/g, '').replace(',', '.'))

function CurrencySelect({ label, value, codes, nameOf, onChange }) {
  return (
    <label className="field cc-select">
      <span>{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {codes.map((code) => (
          <option key={code} value={code}>
            {code} · {nameOf(code)}
          </option>
        ))}
      </select>
    </label>
  )
}

function RateStatus({ source, table, error, onRetry, t, formatDate }) {
  if (source === 'live') return <p className="cc-status">{t.live(formatDate(table.date))}</p>
  if (source === 'loading') {
    // While the fresh rates load we already convert with the saved table (if there is one), so say which day it is from.
    return (
      <p className="cc-status" role="status">
        <span className="cc-spinner" aria-hidden="true" />
        {t.loadingRates}
        {table && ` ${t.cached(formatDate(table.date))}`}
      </p>
    )
  }
  return (
    <div className="cc-status cc-status--warn" role="alert">
      <p>
        <strong>{t.errors[errorKind(error)]}</strong>{' '}
        {source === 'cached' ? t.cached(formatDate(table.date)) : t.fixed(formatDate(table.date))}
      </p>
      <button type="button" className="btn btn--ghost" onClick={onRetry}>
        {t.retry}
      </button>
    </div>
  )
}

function CurrencyConverter() {
  const lang = useLang()
  const t = useText(TEXT)
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'

  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('USD')
  const [pairs, setPairs] = useState(() => {
    const stored = readStored(PAIRS_KEY, null)
    // Never trust storage: anything that is not a list of strings falls back to the defaults.
    return Array.isArray(stored) && stored.every((p) => typeof p === 'string') ? stored : ['EUR-HUF', 'GBP-EUR']
  })
  // Read once on mount: the rates we saved the last time the API answered.
  const [lastKnown] = useState(() => {
    const stored = readStored(RATES_KEY, null)
    return isRateTable(stored) ? stored : null
  })

  // Two independent requests with the same hook, running in parallel.
  const latest = useFetch(`${API}/latest?from=EUR`)
  const currencies = useFetch(`${API}/currencies`)

  useEffect(() => {
    if (latest.status === 'success' && isRateTable(latest.data)) writeStored(RATES_KEY, latest.data)
  }, [latest.status, latest.data])

  useEffect(() => writeStored(PAIRS_KEY, pairs), [pairs])

  // Which table do we convert with? Live → last known → fixed sample rates.
  let table = lastKnown
  let source = 'loading'
  if (latest.status === 'success' && isRateTable(latest.data)) {
    table = latest.data
    source = 'live'
  } else if (latest.status === 'error' || latest.status === 'success') {
    table = lastKnown ?? FALLBACK_RATES
    source = lastKnown ? 'cached' : 'fixed'
  }

  const codes = codesOf(table ?? FALLBACK_RATES)

  // English names come from the /currencies endpoint; for Hungarian the browser's Intl.DisplayNames translates them.
  const nameOf = useMemo(() => {
    let display = null
    try {
      display = new Intl.DisplayNames([locale], { type: 'currency' })
    } catch {
      // very old browser: codes only
    }
    return (code) =>
      (lang === 'en' ? currencies.data?.[code] : null) ?? display?.of(code) ?? currencies.data?.[code] ?? code
  }, [lang, locale, currencies.data])

  const formatDate = (iso) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(`${iso}T00:00:00Z`),
    )

  const money = (value, code) => {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(value)
    } catch {
      return `${value.toFixed(2)} ${code}`
    }
  }
  const rateFormat = new Intl.NumberFormat(locale, { maximumSignificantDigits: 5 })

  const value = parseAmount(amount)
  const valid = amount.trim() !== '' && Number.isFinite(value) && value >= 0
  const rate = table ? rateOf(from, to, table) : null
  const inverse = table ? rateOf(to, from, table) : null

  const pairKey = `${from}-${to}`
  const saved = pairs.includes(pairKey)
  const visiblePairs = pairs.filter((pair) => pair.split('-').every((code) => codes.includes(code)))

  const togglePair = () =>
    setPairs((prev) => (prev.includes(pairKey) ? prev.filter((p) => p !== pairKey) : [...prev, pairKey].slice(-6)))

  const selectPair = (pair) => {
    const [a, b] = pair.split('-')
    setFrom(a)
    setTo(b)
  }

  return (
    <div className="cc">
      <form className="cc-form" onSubmit={(e) => e.preventDefault()}>
        <label className="field cc-amount">
          <span>{t.amount}</span>
          <input
            className="input"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            aria-invalid={!valid}
            aria-describedby={valid ? undefined : 'cc-amount-hint'}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <div className="cc-pair">
          <CurrencySelect label={t.from} value={from} codes={codes} nameOf={nameOf} onChange={setFrom} />
          <button
            type="button"
            className="cc-swap"
            aria-label={t.swap}
            title={t.swap}
            onClick={() => {
              setFrom(to)
              setTo(from)
            }}
          >
            <span aria-hidden="true">⇄</span>
          </button>
          <CurrencySelect label={t.to} value={to} codes={codes} nameOf={nameOf} onChange={setTo} />
        </div>
      </form>

      <section className="cc-result solid" aria-live="polite" aria-busy={!table}>
        <div className="cc-result__top">
          <span className="cc-result__label">{t.result}</span>
          <span className={`cc-badge cc-badge--${source}`}>{t.badge[source]}</span>
        </div>
        {!valid ? (
          <p id="cc-amount-hint" className="cc-result__value cc-result__value--hint">
            {t.invalid}
          </p>
        ) : table && rate != null ? (
          <>
            <p className="cc-result__value">
              <span className="cc-result__from">{money(value, from)} =</span>
              <strong>{money(value * rate, to)}</strong>
            </p>
            <p className="cc-result__rate">
              1 {from} = {rateFormat.format(rate)} {to} · 1 {to} = {rateFormat.format(inverse)} {from}
            </p>
          </>
        ) : (
          <div className="cc-result__skeleton" aria-hidden="true" />
        )}
        <button type="button" className="cc-star" data-saved={saved} onClick={togglePair}>
          <span aria-hidden="true">{saved ? '★' : '☆'}</span> {saved ? t.removePair : t.savePair}
        </button>
      </section>

      <RateStatus
        source={source}
        table={table}
        error={latest.error}
        onRetry={latest.retry}
        t={t}
        formatDate={formatDate}
      />

      <section className="cc-pairs" aria-label={t.pairs}>
        <h3 className="cc-section-title">{t.pairs}</h3>
        {visiblePairs.length === 0 ? (
          <p className="cc-muted">{t.pairsEmpty}</p>
        ) : (
          <div className="cc-pairs__list">
            {visiblePairs.map((pair) => (
              <button
                key={pair}
                type="button"
                className="chip"
                aria-pressed={pair === pairKey}
                onClick={() => selectPair(pair)}
              >
                {pair.replace('-', ' → ')}
              </button>
            ))}
          </div>
        )}
      </section>

      <RateChart from={from} to={to} locale={locale} t={t} formatDate={formatDate} />

      <p className="cc-muted cc-source">{t.source}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="currency-converter">
      <CurrencyConverter />
    </AppFrame>
  )
}
