// The on-screen keyboard is generated from the rows of the chosen word list (see wordLists.js):
// letters, plus ENTER and BACK as the two wide keys.
export default function Keyboard({ rows, states, onKey, t }) {
  return (
    <div className="wd-keyboard" role="group" aria-label={t.keyboard}>
      {rows.map((row) => (
        <div key={row.join('')} className="wd-keyboard__row">
          {row.map((key) => {
            if (key === 'ENTER' || key === 'BACK') {
              return (
                <button
                  key={key}
                  type="button"
                  className="wd-key wd-key--wide"
                  aria-label={key === 'ENTER' ? t.enter : t.backspace}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onKey(key)}
                >
                  {key === 'ENTER' ? t.enterShort : '⌫'}
                </button>
              )
            }
            const state = states[key]
            return (
              <button
                key={key}
                type="button"
                className={`wd-key${state ? ` is-${state}` : ''}`}
                aria-label={state ? `${key}, ${t.states[state]}` : key}
                // Keeps the focus where it was, so a later physical Enter does not "click" this key again.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onKey(key)}
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
