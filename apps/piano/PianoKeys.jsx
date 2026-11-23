import { OCTAVES, isBlack, noteName, range } from './notes.js'

// The keyboard is generated from the note numbers: white keys in a row, black keys placed on top
// between their two white neighbours.
function Key({ midi, black, active, label, name, ariaLabel, style, handlers }) {
  return (
    <button
      type="button"
      className={`pn-key ${black ? 'pn-key--black' : 'pn-key--white'}${active ? ' is-active' : ''}`}
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

export default function PianoKeys({ active, labelFor, lang, handlers, t }) {
  return (
    <div className="pn-keys" role="group" aria-label={t.keys} onPointerLeave={handlers.leave}>
      {OCTAVES.map(({ from, to }) => {
        const notes = range(from, to)
        const whites = notes.filter((n) => !isBlack(n))
        return (
          <div key={from} className="pn-octave" style={{ '--whites': whites.length }}>
            {notes.map((midi) => {
              const black = isBlack(midi)
              const label = labelFor(midi)
              const name = noteName(midi, lang)
              // A black key sits on the border after the white key just below it.
              const left = black ? `${((whites.indexOf(midi - 1) + 1) / whites.length) * 100}%` : undefined
              return (
                <Key
                  key={midi}
                  midi={midi}
                  black={black}
                  active={active.has(midi)}
                  label={label}
                  name={black ? null : name}
                  ariaLabel={t.keyLabel(name, label)}
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
