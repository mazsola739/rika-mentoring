const STICKERS = ['😂', '😎', '🔥', '💯', '👀', '🎉', '❤️', '🤔']

// A row of emoji buttons: a click puts the sticker in the middle of the meme.
export default function StickerBar({ onAdd, t }) {
  return (
    <fieldset className="mg-stickers">
      <legend className="mg-legend">{t.stickersLegend}</legend>
      <div className="mg-stickers__list">
        {STICKERS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="mg-sticker"
            aria-label={t.addSticker(emoji)}
            onClick={() => onAdd(emoji)}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
