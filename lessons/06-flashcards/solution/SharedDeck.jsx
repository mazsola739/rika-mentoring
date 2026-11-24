// The offer of a deck that arrived in the link.
export default function SharedDeck({ deck, onAccept, onDismiss, t }) {
  return (
    <section className="fc-shared" aria-label={t.sharedDeck}>
      <p>
        {t.sharedIntro} <strong>{deck.name}</strong> ({t.cardCount(deck.cards.length)})
      </p>
      <div className="fc-shared__buttons">
        <button type="button" className="btn" onClick={onAccept}>
          {t.accept}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onDismiss}>
          {t.dismiss}
        </button>
      </div>
    </section>
  )
}
