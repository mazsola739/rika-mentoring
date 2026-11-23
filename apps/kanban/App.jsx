import { useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { COLUMNS, createId, localize, sampleBoard } from './boardReducer.js'
import { useBoard } from './useBoard.js'
import Board from './Board.jsx'
import CardDialog from './CardDialog.jsx'
import { TEXT } from './text.js'
import './app.css'

// Column accent colors from the lesson palette (light grey → black as work gets done).
const COLUMN_COLOR = { todo: 3, doing: 2, done: 0 }

function Kanban() {
  const lang = useLang()
  const t = useText(TEXT)
  const { palette } = useLesson()
  const [board, dispatch] = useBoard()
  const [dialog, setDialog] = useState(null) // null | { column, card } (card is null when adding)
  const [message, setMessage] = useState('')

  const total = COLUMNS.reduce((sum, column) => sum + board[column].length, 0)
  const done = board.done.length
  const colorOf = (column) => palette.colors[COLUMN_COLOR[column]] ?? 'var(--solid)'

  const save = ({ column, ...fields }) => {
    if (dialog.card) {
      const id = dialog.card.id
      dispatch({ type: 'update', id, changes: fields })
      if (column !== dialog.column) dispatch({ type: 'move', id, to: column })
      setMessage(t.saved(fields.title))
    } else {
      dispatch({ type: 'add', column, card: { id: createId(), ...fields } })
      setMessage(t.added(fields.title))
    }
    setDialog(null)
  }

  const remove = () => {
    dispatch({ type: 'delete', id: dialog.card.id })
    setMessage(t.deleted(localize(dialog.card.title, lang)))
    setDialog(null)
  }

  const reset = () => {
    if (window.confirm(t.resetConfirm)) dispatch({ type: 'reset', board: sampleBoard() })
  }

  return (
    <div className="kb">
      <div className="kb-head">
        <div className="kb-progress">
          <span className="kb-progress__label">{t.progress(done, total)}</span>
          <span className="kb-progress__bar" aria-hidden="true">
            <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </span>
        </div>
        <button type="button" className="btn" onClick={() => setDialog({ column: 'todo', card: null })}>
          <span aria-hidden="true">+</span> {t.addCard}
        </button>
      </div>

      <Board
        board={board}
        dispatch={dispatch}
        colorOf={colorOf}
        announce={setMessage}
        onAdd={(column) => setDialog({ column, card: null })}
        onEdit={(card, column) => setDialog({ column, card })}
      />

      <p id="kb-help" className="kb-help">
        {t.help}
      </p>

      <div className="kb-footer">
        <button type="button" className="kb-link" onClick={reset}>
          {t.reset}
        </button>
      </div>

      <p className="visually-hidden" aria-live="assertive">
        {message}
      </p>

      {dialog && (
        <CardDialog
          card={dialog.card}
          column={dialog.column}
          onSave={save}
          onDelete={remove}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="kanban">
      <Kanban />
    </AppFrame>
  )
}
