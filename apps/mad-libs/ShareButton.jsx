import { useEffect, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { shareLink } from './share.js'

// Copies a link that carries the template. The label shows the result for two seconds.
function ShareButton({ text }) {
  const t = useText(TEXT)
  const [status, setStatus] = useState('idle') // 'idle' | 'copied' | 'failed'

  // The cleanup clears the timer if the status changes again (or the button disappears) first.
  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 2000)
    return () => clearTimeout(timer)
  }, [status])

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareLink(text))
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = t.copy
  if (status === 'copied') label = t.copied
  if (status === 'failed') label = t.copyFailed

  return (
    <button type="button" className="btn btn--ghost" onClick={copy}>
      {label}
    </button>
  )
}

export default ShareButton
