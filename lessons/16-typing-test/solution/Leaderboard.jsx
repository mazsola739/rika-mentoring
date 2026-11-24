import { rankRuns } from './useHistory.js'

const MEDALS = ['🥇', '🥈', '🥉']

// The best five runs in one mode, with the players' names. The run just finished (`latest`) is highlighted.
export default function Leaderboard({ runs, latest, t }) {
  const top = rankRuns(runs).slice(0, 5)

  return (
    <section className="tt-panel" aria-labelledby="tt-board-title">
      <h3 id="tt-board-title" className="tt-panel__title">
        {t.leaderboard}
      </h3>
      {top.length === 0 ? (
        <p className="tt-panel__empty">{t.leaderboardEmpty}</p>
      ) : (
        <ol className="tt-board">
          {top.map((run, i) => (
            <li key={run.at} className={run.at === latest ? 'is-new' : undefined}>
              <span className="tt-board__place">
                <span aria-hidden="true">{MEDALS[i] ?? `${i + 1}.`}</span>
                <span className="visually-hidden">{i + 1}.</span>
              </span>
              <span className="tt-board__name">
                {run.name || t.anonymous}
                {run.at === latest && <span className="visually-hidden"> ({t.latest})</span>}
              </span>
              <strong>{t.wpmValue(run.wpm)}</strong>
              <span>{run.accuracy}%</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
