// Connect button and status of the MIDI keyboard. `midi` is what useMidi returns, `t` its texts.
export default function MidiPanel({ midi, t }) {
  const { supported, status, devices, connect } = midi

  let message = t.idle
  if (!supported) message = t.unsupported
  else if (status === 'asking') message = t.asking
  else if (status === 'denied') message = t.denied
  else if (status === 'ready') message = devices.length === 0 ? t.none : t.connected(devices.join(', '))

  return (
    <section className="pn-panel" aria-labelledby="pn-midi-title">
      <h2 id="pn-midi-title" className="pn-panel__title">
        {t.title}
      </h2>
      {supported && status !== 'ready' && (
        <div className="pn-panel__buttons">
          <button type="button" className="btn btn--ghost" onClick={connect} disabled={status === 'asking'}>
            {t.connect}
          </button>
        </div>
      )}
      <p className="pn-panel__status" aria-live="polite">
        {message}
      </p>
    </section>
  )
}
