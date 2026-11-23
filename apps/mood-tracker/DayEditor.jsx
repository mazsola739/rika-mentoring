import { useRef, useState } from 'react'
import MoodPicker from './MoodPicker.jsx'
import { tx } from './text.js'

const NOTE_MAX = 280

// Edits one day. The parent gives it key={date}, so picking another day starts fresh
// from that day's saved entry: no effect is needed to "sync" the local draft.
const DayEditor = ({ date, entry, isToday, colors, fmt, lang, t, onSave, onDelete, onToday }) => {
  const [mood, setMood] = useState(entry?.mood ?? 0)
  const [note, setNote] = useState(() => tx(entry?.note, lang))
  const [status, setStatus] = useState(null) // 'saved' | 'deleted' | 'pickMood'
  const formRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    if (!mood) {
      setStatus('pickMood')
      formRef.current?.elements.mood?.[0]?.focus()
      return
    }
    onSave(date, { mood, note: note.trim(), updatedAt: new Date().toISOString() })
    setStatus('saved')
  }

  const remove = () => {
    onDelete(date)
    setMood(0)
    setNote('')
    setStatus('deleted')
  }

  return (
    <form ref={formRef} className="md-card md-editor" onSubmit={submit} noValidate aria-labelledby="md-editor-title">
      <div className="md-editor__head">
        <h3 id="md-editor-title">{isToday ? t.todayQuestion : t.dayQuestion(fmt.longDate(date))}</h3>
        {!isToday && (
          <button type="button" className="md-link" onClick={onToday}>
            {t.backToToday}
          </button>
        )}
      </div>

      <MoodPicker
        value={mood}
        onChange={(value) => {
          setMood(value)
          setStatus(null)
        }}
        colors={colors}
        labels={t.moods}
        legend={t.moodLegend}
      />

      <label className="field">
        <span>
          {t.note} <small>({t.optional})</small>
        </span>
        <textarea
          className="input md-editor__note"
          rows={3}
          maxLength={NOTE_MAX}
          placeholder={t.notePlaceholder}
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setStatus(null)
          }}
          aria-describedby="md-note-count"
        />
        <small id="md-note-count" className="md-editor__count">
          {note.length} / {NOTE_MAX}
        </small>
      </label>

      <div className="md-row">
        <button type="submit" className="btn">
          {entry ? t.update : t.save}
        </button>
        {entry && (
          <button type="button" className="btn btn--ghost" onClick={remove}>
            {t.delete}
          </button>
        )}
        <p className={`md-editor__status${status === 'pickMood' ? ' is-error' : ''}`} role="status">
          {status && t[status]}
        </p>
      </div>
      {entry?.updatedAt && status !== 'deleted' && (
        <p className="md-muted">{t.lastSaved(fmt.dateTime(entry.updatedAt))}</p>
      )}
    </form>
  )
}

export default DayEditor
