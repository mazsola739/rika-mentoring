import { useEffect, useLayoutEffect, useRef } from 'react'

// Listens to the physical keyboard on the whole window and turns key presses into
// 'A'…'Z', 'ENTER' and 'BACK'. The listener is attached once; a ref always points to the latest handler.
export function useGlobalKeys(onKey) {
  const handlerRef = useRef(onKey)

  useLayoutEffect(() => {
    handlerRef.current = onKey
  })

  useEffect(() => {
    const listener = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return
      const target = e.target instanceof Element ? e.target : null
      // Typing into a form field is never a guess.
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      // Enter/Space on a focused button should only press that button.
      if ((e.key === 'Enter' || e.key === ' ') && target?.closest('button, a')) return

      let key = null
      if (e.key === 'Enter') key = 'ENTER'
      else if (e.key === 'Backspace') key = 'BACK'
      else if (/^[a-z]$/i.test(e.key)) key = e.key.toUpperCase()
      if (!key) return

      e.preventDefault()
      handlerRef.current(key)
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])
}
