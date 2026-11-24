import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

// The downloaded codes, newest first. A click puts the text back into the text field.
function History({ items, onPick, onClear }) {
  const t = useText(TEXT)

  return (
    <section className="qr__history" aria-labelledby="qr-history-title">
      <div className="qr__history-head">
        <h2 id="qr-history-title" className="qr__subtitle">
          {t.history}
        </h2>
        {items.length > 0 && (
          <button type="button" className="qr__clear" onClick={onClear}>
            {t.clear}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="qr__history-empty">{t.historyEmpty}</p>
      ) : (
        <ul className="qr__history-list">
          {items.map((item) => (
            <li key={item}>
              <button type="button" className="qr__history-item" title={item} onClick={() => onPick(item)}>
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default History
