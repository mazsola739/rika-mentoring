import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import Markdown from '../Markdown.jsx'
import { SUGGESTIONS } from '../replies.js'
import { TEXT } from '../text.js'

const Message = ({ message }) => {
  const t = useText(TEXT)
  const isUser = message.role === 'user'
  const thinking = message.status === 'streaming' && !message.text

  return (
    <li className={`ac-msg ac-msg--${message.role}`}>
      <span className="visually-hidden">{isUser ? t.you : t.assistant}:</span>
      {!isUser && <span className="ac-msg__avatar" aria-hidden="true" />}
      <div className="ac-msg__bubble">
        {isUser ? (
          <p className="ac-msg__plain">{message.text}</p>
        ) : thinking ? (
          <span className="ac-dots" role="status" aria-label={t.thinking}>
            <i />
            <i />
            <i />
          </span>
        ) : (
          <div className={`ac-md${message.status === 'streaming' ? ' is-streaming' : ''}`}>
            <Markdown text={message.text} />
          </div>
        )}
        {message.status === 'stopped' && <span className="ac-msg__stopped">{t.stopped}</span>}
      </div>
    </li>
  )
}

// Keeps the list scrolled to the bottom while new text arrives, unless the user scrolled up to read.
const useAutoScroll = (dep) => {
  const ref = useRef(null)
  const stick = useRef(true)
  const [away, setAway] = useState(false)

  const onScroll = () => {
    const el = ref.current
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    stick.current = nearBottom
    setAway(!nearBottom)
  }

  // useLayoutEffect: scroll before the browser paints, so the text never flickers below the fold.
  useLayoutEffect(() => {
    if (stick.current && ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [dep])

  const jump = () => {
    stick.current = true
    setAway(false)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
  }

  return { ref, onScroll, away, jump }
}

const Composer = ({ streaming, onSend, onStop, focusKey }) => {
  const t = useText(TEXT)
  const [text, setText] = useState('')
  const ref = useRef(null)

  // Focus the input when switching to another conversation (but not on page load).
  const previousKey = useRef(focusKey)
  useEffect(() => {
    if (previousKey.current !== focusKey) ref.current?.focus({ preventScroll: true })
    previousKey.current = focusKey
  }, [focusKey])

  const send = () => {
    if (!text.trim() || streaming) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form
      className="ac-composer"
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
    >
      <label htmlFor="ac-input" className="visually-hidden">
        {t.inputLabel}
      </label>
      <textarea
        ref={ref}
        id="ac-input"
        className="ac-composer__input"
        rows={1}
        maxLength={2000}
        value={text}
        placeholder={t.placeholder}
        aria-describedby="ac-hint"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter adds a line. isComposing protects IME input (e.g. Japanese).
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            send()
          }
        }}
      />
      {streaming ? (
        <button type="button" className="btn ac-composer__btn ac-composer__btn--stop" onClick={onStop}>
          <span className="ac-stop-icon" aria-hidden="true" /> {t.stop}
        </button>
      ) : (
        <button type="submit" className="btn ac-composer__btn" disabled={!text.trim()}>
          {t.send}
        </button>
      )}
      <small id="ac-hint" className="ac-composer__hint">
        {t.hint}
      </small>
    </form>
  )
}

const ChatPanel = ({ conversation, streaming, onSend, onStop }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const messages = conversation?.messages ?? []
  const last = messages[messages.length - 1]
  const scroll = useAutoScroll(`${conversation?.id}:${messages.length}:${last?.text.length ?? 0}`)

  return (
    <section className="ac-chat" aria-label={conversation?.title || t.untitled}>
      <div className="ac-chat__scroll" ref={scroll.ref} onScroll={scroll.onScroll}>
        {messages.length === 0 ? (
          <div className="ac-empty">
            <span className="ac-empty__mark" aria-hidden="true" />
            <h3>{t.emptyTitle}</h3>
            <p>{t.emptyIntro}</p>
            <div className="ac-suggestions">
              {SUGGESTIONS[lang].map((s) => (
                <button key={s} type="button" className="ac-suggestion" onClick={() => onSend(s)} disabled={streaming}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // aria-live is off here on purpose: announcing every streamed letter would be unusable.
          <ol className="ac-msgs">
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
          </ol>
        )}
      </div>
      {scroll.away && (
        <button type="button" className="ac-jump" onClick={scroll.jump}>
          ↓ {t.jump}
        </button>
      )}
      <Composer streaming={streaming} onSend={onSend} onStop={onStop} focusKey={conversation?.id} />
    </section>
  )
}

export default ChatPanel
