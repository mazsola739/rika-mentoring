import { useEffect, useRef } from 'react'

// A native <dialog>: showModal() gives us the backdrop, focus trapping and the Esc key for free.
export default function WinDialog({ open, title, children, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [open])

  return (
    <dialog ref={ref} className="mg-dialog" aria-labelledby="mg-dialog-title" onClose={onClose}>
      <h2 id="mg-dialog-title">{title}</h2>
      {children}
    </dialog>
  )
}
