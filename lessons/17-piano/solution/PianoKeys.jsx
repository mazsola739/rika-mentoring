import { isBlack, noteName, range, screenOctaves } from './notes.js'

// The keyboard is generated from the note numbers: white keys in a row, black keys placed on top
// between their two white neighbours.
function Key({ midi, black, active, hint, label, name, ariaLabel, style, handlers }) {
  let className = `pn-key ${black ? 'pn-key--black' : 'pn-key--white'}`
  if (hint) className += ' is-hint'
  if (active) className += ' is-active'
  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={ariaLabel}
      onPointerDown={(e) => handlers.down(e, midi)}
      onPointerEnter={(e) => handlers.enter(e, midi)}
      onClick={(e) => e.detail === 0 && handlers.tap(midi)}
    >
      {label && <kbd className="pn-key__kbd">{label}</kbd>}
      {name && <span className="pn-key__name">{name}</span>}
    </button>
  )
}

// `hint` is the MIDI number of the next note in the teaching mode (its key glows gold), or undefined.
export default function PianoKeys({ octave, active, hint, labelFor, lang, handlers, t }) {
  return (
    // No context menu on the keys: a right-click or a long touch would open one over the keyboard.
    <div
      className="pn-keys"
      role="group"
      aria-label={t.keys}
      onPointerLeave={handlers.leave}
      onContextMenu={(e) => e.preventDefault()}
    >
      {screenOctaves(octave).map(({ from, to }) => {
        const notes = range(from, to)
        const whites = notes.filter((n) => !isBlack(n))
        return (
          <div key={from} className="pn-octave" style={{ '--whites': whites.length }}>
            {notes.map((midi) => {
              const black = isBlack(midi)
              const label = labelFor(midi)
              const name = noteName(midi, lang)
              const isHint = midi === hint
              // A black key sits on the border after the white key just below it.
              const left = black ? `${((whites.indexOf(midi - 1) + 1) / whites.length) * 100}%` : undefined
              return (
                <Key
                  key={midi}
                  midi={midi}
                  black={black}
                  active={active.has(midi)}
                  hint={isHint}
                  label={label}
                  name={black ? null : name}
                  ariaLabel={isHint ? `${t.keyLabel(name, label)}, ${t.nextNote}` : t.keyLabel(name, label)}
                  style={black ? { left } : undefined}
                  handlers={handlers}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
