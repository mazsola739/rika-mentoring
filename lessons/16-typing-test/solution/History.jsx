import { useMemo } from 'react'
import SpeedChart from './SpeedChart.jsx'

// The saved runs of one mode: progress on a chart (oldest to newest), the last five runs under it.
export default function History({ runs, lang, t }) {
  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [lang],
  )
  // runs starts with the newest; the chart goes forward in time, so it gets a reversed copy.
  const speeds = runs.map((run) => run.wpm).reverse()

  return (
    <section className="tt-panel" aria-labelledby="tt-history-title">
      <h3 id="tt-history-title" className="tt-panel__title">
        {t.history}
      </h3>
      {runs.length === 0 ? (
        <p className="tt-panel__empty">{t.historyEmpty}</p>
      ) : (
        <>
          <SpeedChart values={speeds} caption={t.historyChart} t={t} />
          <ol className="tt-history">
            {runs.slice(0, 5).map((run) => (
              <li key={run.at}>
                <span className="tt-history__date">{dateFormat.format(run.at)}</span>
                <strong>{t.wpmValue(run.wpm)}</strong>
                <span>{run.accuracy}%</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
