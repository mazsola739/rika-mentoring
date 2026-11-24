import { useState } from 'react'
import { downloadDeck, readDeckFile } from './deckFiles.js'
import { makeShareLink } from './share.js'

// Download the deck as a JSON file, load one back, or copy a link that carries the deck.
// The message is stored as data ({ kind, … }), not as text, so it follows a language switch.
export default function DeckTools({ deck, onImport, lang, t }) {
  const [message, setMessage] = useState(null)

  const importFile = async (e) => {
    const file = e.target.files[0]
    // Empty the field, so the same file can be loaded again later (otherwise no new change event).
    e.target.value = ''
    if (!file) return
    try {
      const newDeck = await readDeckFile(file)
      onImport(newDeck)
      setMessage({ kind: 'loaded', name: newDeck.name, count: newDeck.cards.length })
    } catch {
      setMessage({ kind: 'notDeck', error: true })
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(makeShareLink(deck, lang))
      setMessage({ kind: 'copied' })
    } catch {
      setMessage({ kind: 'copyFailed', error: true })
    }
  }

  const messageText = {
    loaded: () => t.loaded(message.name, message.count),
    notDeck: () => t.notDeck,
    copied: () => t.copied,
    copyFailed: () => t.copyFailed,
  }

  return (
    <section className="fc-tools" aria-labelledby="fc-tools-title">
      <div className="fc-tools__head">
        <h3 id="fc-tools-title">{t.saveShare}</h3>
        <p className="fc-muted">{t.toolsHint}</p>
      </div>
      <div className="fc-tools__buttons">
        <button type="button" className="btn btn--ghost" onClick={() => downloadDeck(deck, lang)}>
          {t.download}
        </button>
        {/* A label that looks like a button: clicking it opens the hidden file field inside. */}
        <label className="btn btn--ghost fc-file">
          {t.load}
          <input type="file" accept=".json,application/json" className="visually-hidden" onChange={importFile} />
        </label>
        <button type="button" className="btn btn--ghost" onClick={copyLink}>
          {t.copyLink}
        </button>
      </div>
      <p className={message?.error ? 'fc-message fc-message--error' : 'fc-message'} role="status">
        {message ? messageText[message.kind]() : ''}
      </p>
    </section>
  )
}
