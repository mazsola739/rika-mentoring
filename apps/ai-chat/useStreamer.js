import { useCallback, useEffect, useRef, useState } from 'react'

// Simulates a streamed AI reply: after a short "thinking" pause, a timer appends
// a few characters at a time to the assistant message, until the text is complete or Stop is pressed.
export function useStreamer(dispatch) {
  const [streaming, setStreaming] = useState(null) // { convId, msgId } while a reply is being typed
  const job = useRef(null) // the running job; a ref, because the timer callback needs the latest value
  const timer = useRef(null)

  const finish = useCallback(
    (status) => {
      clearTimeout(timer.current)
      if (job.current) dispatch({ type: 'finish', convId: job.current.convId, msgId: job.current.msgId, status })
      job.current = null
      setStreaming(null)
    },
    [dispatch],
  )

  const start = useCallback(
    (convId, msgId, fullText) => {
      if (job.current) finish('stopped') // only one reply streams at a time
      job.current = { convId, msgId, text: fullText, index: 0 }
      setStreaming({ convId, msgId })

      const tick = () => {
        const current = job.current
        if (!current) return
        // 1–3 characters per tick feels like real token streaming.
        const size = 1 + Math.floor(Math.random() * 3)
        const chunk = current.text.slice(current.index, current.index + size)
        current.index += size
        dispatch({ type: 'append', convId, msgId, chunk })
        if (current.index >= current.text.length) finish('done')
        else timer.current = setTimeout(tick, 14 + Math.random() * 22)
      }
      timer.current = setTimeout(tick, 450 + Math.random() * 450)
    },
    [dispatch, finish],
  )

  const stop = useCallback(() => finish('stopped'), [finish])

  // Cleanup: never leave a timer running after the component is gone.
  useEffect(() => () => clearTimeout(timer.current), [])

  return { streaming, start, stop }
}
