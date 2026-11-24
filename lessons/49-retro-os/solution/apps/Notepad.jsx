import { useEffect, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from '../text.js'

const KEY = 'rika:retro-os:notepad'

function loadText() {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

const Notepad = () => {
  const t = useText(TEXT).notepad
  const [text, setText] = useState(loadText)
  const [saved, setSaved] = useState(true)

  // Save half a second after the last keystroke (a "debounced" save).
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, text)
      } catch {
        // storage blocked: the text stays in memory
      }
      setSaved(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [text])

  return (
    <div className="ro-notepad">
      <div className="ro-menubar">
        <button type="button" className="ro-menubar__btn" onClick={() => setText('')}>
          {t.clear}
        </button>
      </div>
      <textarea
        className="ro-notepad__area"
        aria-label={t.label}
        placeholder={t.placeholder}
        value={text}
        spellCheck={false}
        onChange={(e) => {
          setText(e.target.value)
          setSaved(false)
        }}
      />
      <div className="ro-status">
        <span>{t.chars(text.length)}</span>
        <span>{t.lines(text ? text.split('\n').length : 0)}</span>
        <span aria-live="polite">{saved ? t.saved : '…'}</span>
      </div>
    </div>
  )
}

export default Notepad
