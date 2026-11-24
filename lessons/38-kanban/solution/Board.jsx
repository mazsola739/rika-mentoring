import { useLayoutEffect, useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { COLUMNS, findCard, localize } from './boardReducer.js'
import { useCardDrag } from './useCardDrag.js'
import Card from './Card.jsx'
import { TEXT } from './text.js'

const Board = ({ board, dispatch, colorOf, onAdd, onEdit, announce }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const [picked, setPicked] = useState(null) // keyboard drag: { id, origin: { column, index } }
  const focusTarget = useRef(null) // which control should get focus after the next render

  // A moved card is re-mounted in its new column, so focus has to be put back by hand.
  useLayoutEffect(() => {
    if (!focusTarget.current) return
    document.querySelector(`[data-focus="${CSS.escape(focusTarget.current)}"]`)?.focus()
    focusTarget.current = null
  })

  const titleOf = (card) => localize(card.title, lang)

  // Where a card ends up: 1-based position and the column size after the move (for announcements).
  const place = (id, to, index) => {
    const from = findCard(board, id)
    if (!from) return null
    const size = board[to].length - (from.column === to ? 1 : 0)
    const at = Math.max(0, Math.min(index ?? size, size))
    return { from, pos: at + 1, total: size + 1 }
  }

  const move = (id, to, index, focus) => {
    const p = place(id, to, index)
    if (!p) return null
    if (focus) focusTarget.current = `${focus}-${id}`
    dispatch({ type: 'move', id, to, index })
    return p
  }

  // Pointer drag & drop
  const { drag, bind, overlayRef } = useCardDrag((id, column, index) => {
    const p = move(id, column, index)
    if (p) announce(t.dropped(titleOf(p.from.card), t.columns[column], p.pos, p.total))
  })

  // Keyboard drag & drop: Space picks up, arrows move, Space drops, Escape restores.
  const onHandleKey = (e, id) => {
    const from = findCard(board, id)
    if (!from) return
    const title = titleOf(from.card)

    if (picked?.id !== id) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setPicked({ id, origin: { column: from.column, index: from.index } })
        announce(t.pickedUp(title, t.columns[from.column], from.index + 1, board[from.column].length))
      }
      return
    }

    const col = COLUMNS.indexOf(from.column)
    const targets = {
      ArrowUp: from.index > 0 && { column: from.column, index: from.index - 1 },
      ArrowDown: from.index < board[from.column].length - 1 && { column: from.column, index: from.index + 1 },
      ArrowLeft: col > 0 && { column: COLUMNS[col - 1], index: from.index },
      ArrowRight: col < COLUMNS.length - 1 && { column: COLUMNS[col + 1], index: from.index },
    }

    if (e.key in targets) {
      e.preventDefault()
      const to = targets[e.key]
      if (!to) return
      const p = move(id, to.column, to.index, 'handle')
      announce(t.position(t.columns[to.column], p.pos, p.total))
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      setPicked(null)
      announce(t.dropped(title, t.columns[from.column], from.index + 1, board[from.column].length))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      move(id, picked.origin.column, picked.origin.index, 'handle')
      setPicked(null)
      announce(t.cancelled(title))
    } else if (e.key === 'Tab') {
      setPicked(null)
    }
  }

  // Clicking elsewhere drops a picked-up card where it is (but not the blur caused by our own move).
  const onHandleBlur = (id) => {
    if (picked?.id === id && !focusTarget.current) setPicked(null)
  }

  const moveTo = (id, column) => {
    const p = move(id, column, undefined, 'select')
    if (p) announce(t.dropped(titleOf(p.from.card), t.columns[column], p.pos, p.total))
  }

  const dragCard = drag ? findCard(board, drag.id)?.card : null

  return (
    <>
      <div className={`kb-board${drag ? ' is-dragging' : ''}`}>
        <div className="kb-columns">
          {COLUMNS.map((column) => {
            const cards = board[column]
            const over = drag?.over?.column === column ? drag.over : null
            // Drop slots are counted without the card being dragged.
            const others = cards.filter((card) => card.id !== drag?.id)
            const slotOf = new Map(others.map((card, i) => [card.id, i]))

            return (
              <section
                key={column}
                className={`kb-col${over ? ' is-over' : ''}`}
                data-column={column}
                style={{ '--kb-col': colorOf(column) }}
                aria-labelledby={`kb-col-${column}`}
              >
                <header className="kb-col__head">
                  <span className="kb-col__dot" aria-hidden="true" />
                  <h3 id={`kb-col-${column}`}>{t.columns[column]}</h3>
                  <span className="kb-count">
                    <span aria-hidden="true">{cards.length}</span>
                    <span className="visually-hidden">{t.cardsIn(cards.length)}</span>
                  </span>
                </header>

                <ul className={`kb-list${over && over.index === others.length ? ' is-drop-end' : ''}`}>
                  {cards.map((card) => {
                    const lifted = drag?.id === card.id
                    const dropBefore = over && !lifted && over.index === slotOf.get(card.id)
                    return (
                      <li
                        key={card.id}
                        className={`kb-item${lifted ? ' is-lifted' : ''}${dropBefore ? ' is-drop-before' : ''}${picked?.id === card.id ? ' is-picked' : ''}`}
                        data-card-id={card.id}
                        {...bind(card.id)}
                      >
                        <Card
                          card={card}
                          column={column}
                          picked={picked?.id === card.id}
                          onHandleKey={(e) => onHandleKey(e, card.id)}
                          onHandleBlur={() => onHandleBlur(card.id)}
                          onMoveTo={(to) => moveTo(card.id, to)}
                          onEdit={() => onEdit(card, column)}
                        />
                      </li>
                    )
                  })}
                </ul>

                {cards.length === 0 && <p className="kb-empty">{t.emptyColumn}</p>}

                <button type="button" className="kb-add" aria-label={t.addTo(t.columns[column])} onClick={() => onAdd(column)}>
                  <span aria-hidden="true">+</span> {t.addCard}
                </button>
              </section>
            )
          })}
        </div>
      </div>

      {/* The floating copy follows the pointer; it sits outside the board so `position: fixed` is relative to the window. */}
      {dragCard && (
        <div className="kb-overlay" ref={overlayRef} style={{ width: drag.width }} aria-hidden="true">
          <Card card={dragCard} column={null} preview />
        </div>
      )}
    </>
  )
}

export default Board
