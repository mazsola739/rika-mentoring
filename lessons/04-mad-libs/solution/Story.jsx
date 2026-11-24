import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { fieldsOf, fillTemplate, splitTemplate, wordFor } from './templates.js'
import ReadAloudButton from './ReadAloudButton.jsx'

function capitalize(text) {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}

// The finished story: plain text and the player's words, highlighted with <mark>.
// The pieces are rendered one by one, because an element cannot go inside a string.
function Story({ story, words, players, onEdit, onRestart }) {
  const t = useText(TEXT)
  const fields = fieldsOf(story.text)

  // With two players each word gets its owner's colour, from the field's position in `fields`
  // (the order TurnForm asked for them), not from its position among the pieces.
  function ownerClass(field) {
    if (players !== 2) return undefined
    return `ml__player-${(fields.indexOf(field) % 2) + 1}`
  }

  return (
    <article className="ml__story">
      <h2>{story.title}</h2>
      <p className="ml__story-text">
        {splitTemplate(story.text).map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} title={capitalize(part)} className={ownerClass(part)}>
              {wordFor(words, part).trim()}
            </mark>
          ) : (
            part
          ),
        )}
      </p>
      {players === 2 && (
        <p className="ml__legend">
          <span className="ml__player-1">{t.player(1)}</span>
          <span className="ml__player-2">{t.player(2)}</span>
        </p>
      )}
      <div className="ml__actions">
        <ReadAloudButton text={fillTemplate(story.text, words)} />
        <button type="button" className="btn btn--ghost" onClick={onEdit}>
          {t.edit}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          {t.again}
        </button>
      </div>
    </article>
  )
}

export default Story
