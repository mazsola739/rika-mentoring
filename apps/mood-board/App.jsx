import { useId, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { colorName } from './colors.js'
import { useBoards } from './useBoards.js'
import BoardTabs from './BoardTabs.jsx'
import BoardItem from './BoardItem.jsx'
import AddPanel from './AddPanel.jsx'
import './app.css'

function SelectionBar({ item, editing, colors, onColor, onEdit, onFront, onRemove }) {
  const t = useText(TEXT)
  const lang = useLang()
  if (!item) return <p className="mb-bar mb-tip">{t.tip}</p>
  const kind = item.type === 'note' ? t.note : item.type === 'color' ? t.tile : t.photo
  // Notes and color tiles can be recolored; photos cannot.
  const recolor = item.type === 'note' || item.type === 'color'

  return (
    <div className="mb-bar" role="toolbar" aria-label={`${t.selected}: ${kind}`}>
      <span className="mb-bar__label">
        {t.selected}: <strong>{kind}</strong>
      </span>
      {recolor && (
        <span className="mb-bar__colors" role="group" aria-label={item.type === 'note' ? t.noteColor : t.tileColor}>
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              className="mb-color"
              style={{ background: color }}
              aria-pressed={item.color?.toUpperCase() === color.toUpperCase()}
              aria-label={t.colorName(colorName(color, lang))}
              title={colorName(color, lang)}
              onClick={() => onColor(color)}
            />
          ))}
        </span>
      )}
      <span className="mb-bar__actions">
        {item.type === 'note' && (
          <button
            type="button"
            className="btn btn--ghost mb-small"
            // While editing, keep the focus in the note until the click; then onEdit blurs it, which saves.
            onMouseDown={(e) => editing && e.preventDefault()}
            onClick={onEdit}
          >
            {editing ? t.done : t.edit}
          </button>
        )}
        <button type="button" className="btn btn--ghost mb-small" onClick={onFront}>
          {t.front}
        </button>
        <button type="button" className="btn btn--ghost mb-small mb-danger-text" onClick={onRemove}>
          {t.remove}
        </button>
      </span>
    </div>
  )
}

function MoodBoard() {
  const t = useText(TEXT)
  const { palette } = useLesson()
  const boards = useBoards()
  const { active } = boards
  // The board's DOM node: drag distances in px are divided by its width.
  const boardRef = useRef(null)
  const helpId = useId()
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const noteColors = [...palette.colors, '#FFFFFF']
  const selected = active.items.find((i) => i.id === selectedId) ?? null

  const add = (item) => {
    const id = boards.addItem(item)
    setSelectedId(id)
    if (item.type === 'note') setEditingId(id)
  }

  const remove = (id) => {
    boards.removeItem(id)
    if (selectedId === id) setSelectedId(null)
    if (editingId === id) setEditingId(null)
  }

  const finishEdit = (id, text) => {
    boards.updateItem(id, { text })
    setEditingId(null)
  }

  const switchBoard = (id) => {
    setSelectedId(null)
    setEditingId(null)
    boards.selectBoard(id)
  }

  return (
    <div className="mb">
      <BoardTabs
        boards={boards.boards}
        active={active}
        onSelect={switchBoard}
        onAdd={() => {
          setSelectedId(null)
          boards.addBoard()
        }}
        onRename={boards.renameBoard}
        onRemove={boards.removeBoard}
      />

      {boards.saveFailed && (
        <p className="mb-alert" role="alert">
          {t.storageFull}
        </p>
      )}

      <SelectionBar
        item={selected}
        editing={editingId === selected?.id}
        colors={noteColors}
        onColor={(color) => boards.updateItem(selected.id, { color })}
        onEdit={() => (editingId === selected.id ? document.activeElement?.blur() : setEditingId(selected.id))}
        onFront={() => boards.bringToFront(selected.id)}
        onRemove={() => remove(selected.id)}
      />

      <div
        ref={boardRef}
        className="mb-board"
        onPointerDown={(e) => {
          // A press on the empty board clears the selection.
          if (e.target === e.currentTarget) setSelectedId(null)
        }}
      >
        {active.items.length === 0 && <p className="mb-empty">{t.emptyBoard}</p>}
        {active.items.map((item) => (
          <BoardItem
            key={item.id}
            item={item}
            boardRef={boardRef}
            selected={item.id === selectedId}
            editing={item.id === editingId}
            helpId={helpId}
            onSelect={setSelectedId}
            onChange={boards.updateItem}
            onFront={boards.bringToFront}
            onRemove={remove}
            onEdit={setEditingId}
            onEditDone={finishEdit}
          />
        ))}
      </div>
      <p id={helpId} className="visually-hidden">
        {t.help}
      </p>

      <AddPanel colors={palette.colors} noteColor={palette.colors.at(-1)} onAdd={add} />
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="mood-board">
      <MoodBoard />
    </AppFrame>
  )
}
