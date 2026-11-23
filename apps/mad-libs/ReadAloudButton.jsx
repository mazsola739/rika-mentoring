import { useEffect, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

// Feature detection: not every browser can read aloud. Without it, the button does not appear.
const CAN_SPEAK = typeof window !== 'undefined' && 'speechSynthesis' in window

function ReadAloudButton({ text }) {
  const lang = useLang()
  const t = useText(TEXT)
  const [speaking, setSpeaking] = useState(false)

  // Cleanup: the browser's reader does not know about React, so stop it when the button leaves the page.
  useEffect(() => {
    return () => {
      if (CAN_SPEAK) window.speechSynthesis.cancel()
    }
  }, [])

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'hu' ? 'hu-HU' : 'en-GB'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel() // drop anything still queued from before
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  // Hooks first, then the early return: hooks always run in the same order.
  if (!CAN_SPEAK) return null

  return (
    <button type="button" className="btn" onClick={toggle}>
      {speaking ? t.stop : t.read}
    </button>
  )
}

export default ReadAloudButton
