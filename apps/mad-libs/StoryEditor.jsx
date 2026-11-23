import { useId } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { fieldsOf, templateProblem } from './templates.js'
import ShareButton from './ShareButton.jsx'

// The player writes their own template in a controlled <textarea>; its fields show up as they type.
function StoryEditor({ text, onChange }) {
  const t = useText(TEXT)
  const hintId = useId()
  const problem = templateProblem(text)

  return (
    <div className="ml__editor">
      <label className="field">
        <span>{t.editorLabel}</span>
        <textarea
          className="input ml__textarea"
          value={text}
          maxLength={1000}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <p className="ml__hint" id={hintId}>
        {t.editorHint}
      </p>
      {problem ? (
        <p className="ml__problem" role="alert">
          {t.problems[problem]}
        </p>
      ) : (
        <div className="ml__actions">
          <p className="ml__field-list">{t.fieldList(fieldsOf(text))}</p>
          <ShareButton text={text} />
        </div>
      )}
    </div>
  )
}

export default StoryEditor
