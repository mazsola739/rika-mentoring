import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { colorByKey, itemName } from './data.js'
import ItemImage from './ItemImage.jsx'

export default function ItemCard({ item, onRemove }) {
  const t = useText(TEXT)
  const lang = useLang()
  const [confirming, setConfirming] = useState(false)
  const name = itemName(item, lang)
  const color = colorByKey(item.color)

  return (
    <li className="wr-card">
      <div className="wr-card__media">
        <ItemImage item={item} />
        <span className="wr-card__cat">{t.categories[item.category]}</span>
      </div>
      <div className="wr-card__body">
        <h4 className="wr-card__name">{name}</h4>
        <p className="wr-card__meta">
          <span className="wr-dot" style={{ background: color.hex }} aria-hidden="true" />
          {color[lang]} · {t.seasons[item.season]} · {t.occasions[item.occasion]}
        </p>
        {confirming ? (
          <div className="wr-card__confirm" role="group" aria-label={t.confirmRemove}>
            <span>{t.confirmRemove}</span>
            <button type="button" className="wr-link is-danger" onClick={() => onRemove(item.id)}>
              {t.yes}
            </button>
            <button type="button" className="wr-link" onClick={() => setConfirming(false)} autoFocus>
              {t.no}
            </button>
          </div>
        ) : (
          <button type="button" className="wr-link" onClick={() => setConfirming(true)} aria-label={`${t.remove}: ${name}`}>
            {t.remove}
          </button>
        )}
      </div>
    </li>
  )
}
