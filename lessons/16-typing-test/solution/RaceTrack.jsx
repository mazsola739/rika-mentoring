// One lane per open window: how far each player has got in their passage, and how fast.
export default function RaceTrack({ me, rivals, t }) {
  const players = [me, ...rivals]

  return (
    <section className="tt-panel" aria-labelledby="tt-race-title">
      <h3 id="tt-race-title" className="tt-panel__title">
        {t.race}
      </h3>
      <ul className="tt-race">
        {players.map((player) => {
          const isMe = player.id === me.id
          const name = player.name || t.anonymous
          const percent = Math.round(Math.min(1, Math.max(0, player.progress || 0)) * 100)
          return (
            <li key={player.id} className={`tt-race__lane${isMe ? ' is-me' : ''}`}>
              <span className="tt-race__name">
                {name}
                {isMe && ` ${t.you}`}
              </span>
              <span
                className="tt-race__bar"
                role="progressbar"
                aria-label={t.progressOf(name)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <span style={{ width: `${percent}%` }} />
              </span>
              <span className="tt-race__wpm">
                {player.finished && (
                  <span role="img" aria-label={t.finished}>
                    🏁{' '}
                  </span>
                )}
                {t.wpmValue(player.wpm || 0)}
              </span>
            </li>
          )
        })}
      </ul>
      {rivals.length === 0 && <p className="tt-panel__empty">{t.raceHint}</p>}
    </section>
  )
}
