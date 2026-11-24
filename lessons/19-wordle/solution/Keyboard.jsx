// The on-screen keyboard is generated from these rows. Hungarian keyboards swap Y and Z (QWERTZ).
const ROWS = {
  en: ['QWERTYUIOP', 'ASDFGHJKL', '+ZXCVBNM-'],
  hu: ['QWERTZUIOP', 'ASDFGHJKL', '+YXCVBNM-'],
}

export default function Keyboard({ lang, states, onKey, t }) {
  return (
    <div className="wd-keyboard" role="group" aria-label={t.keyboard}>
      {ROWS[lang].map((row) => (
        <div key={row} className="wd-keyboard__row">
          {[...row].map((ch) => {
            if (ch === '+' || ch === '-') {
              const key = ch === '+' ? 'ENTER' : 'BACK'
              return (
                <button
                  key={key}
                  type="button"
                  className="wd-key wd-key--wide"
                  aria-label={ch === '+' ? t.enter : t.backspace}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onKey(key)}
                >
                  {ch === '+' ? t.enterShort : '⌫'}
                </button>
              )
            }
            const state = states[ch]
            return (
              <button
                key={ch}
                type="button"
                className={`wd-key${state ? ` is-${state}` : ''}`}
                aria-label={state ? `${ch}, ${t.states[state]}` : ch}
                // Keeps the focus where it was, so a later physical Enter does not "click" this key again.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onKey(ch)}
              >
                {ch}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
