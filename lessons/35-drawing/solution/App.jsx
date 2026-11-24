import { useEffect, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { useHistory } from './useHistory.js'
import { visibleStrokes } from './render.js'
import Canvas from './Canvas.jsx'
import Toolbar, { MAX_SIZE, MIN_SIZE } from './Toolbar.jsx'
import './app.css'

const isTyping = (el) =>
  el.isContentEditable || el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && ['text', 'search', 'email', 'number'].includes(el.type))

const DrawingApp = () => {
  const t = useText(TEXT)
  const { palette } = useLesson()
  // useRef: the parent needs the <canvas> DOM node too, for the PNG export.
  const canvasRef = useRef(null)
  const { history, canUndo, canRedo, push, undo, redo } = useHistory()
  const [tool, setTool] = useState('brush')
  const [size, setSize] = useState(8)
  const [color, setColor] = useState(palette.colors[1] ?? palette.solid)
  const [status, setStatus] = useState(null) // key of the last action, read out by screen readers

  const canClear = visibleStrokes(history).length > 0

  const doUndo = () => {
    if (!canUndo) return
    undo()
    setStatus('undo')
  }
  const doRedo = () => {
    if (!canRedo) return
    redo()
    setStatus('redo')
  }
  const clear = () => {
    if (!canClear) return
    // Clearing is an entry in the history too, so it can be undone.
    push({ type: 'clear' })
    setStatus('clear')
  }

  const download = () => {
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        setStatus('exportFailed')
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${t.fileName}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`
      link.click()
      // Give the browser a moment to start the download before freeing the memory.
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      setStatus('saved')
    }, 'image/png')
  }

  // Keyboard shortcuts. A ref keeps the newest handler so the listener is attached once.
  const keyRef = useRef(null)
  keyRef.current = (e) => {
    if (isTyping(e.target)) return
    const mod = e.ctrlKey || e.metaKey
    const key = e.key.toLowerCase()
    if (mod && key === 'z') {
      e.preventDefault()
      if (e.shiftKey) doRedo()
      else doUndo()
    } else if (mod && key === 'y') {
      e.preventDefault()
      doRedo()
    } else if (!mod && !e.altKey) {
      if (key === 'b') setTool('brush')
      else if (key === 'e') setTool('eraser')
      else if (key === '[') setSize((s) => Math.max(MIN_SIZE, s - 2))
      else if (key === ']') setSize((s) => Math.min(MAX_SIZE, s + 2))
    }
  }
  useEffect(() => {
    const onKey = (e) => keyRef.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="dr">
      <Toolbar
        tool={tool}
        setTool={setTool}
        size={size}
        setSize={setSize}
        color={color}
        setColor={setColor}
        colors={palette.colors}
        canUndo={canUndo}
        canRedo={canRedo}
        canClear={canClear}
        onUndo={doUndo}
        onRedo={doRedo}
        onClear={clear}
        onDownload={download}
      />

      <Canvas
        canvasRef={canvasRef}
        history={history}
        tool={tool}
        color={color}
        size={size}
        label={t.canvas}
        onStroke={(stroke) => push(stroke)}
      />

      <p className="visually-hidden" aria-live="polite">
        {status ? t.status[status] : ''}
      </p>
      {status === 'exportFailed' && (
        <p className="dr-error" role="alert">
          {t.status.exportFailed}
        </p>
      )}

      <details className="dr-keys">
        <summary>{t.shortcuts}</summary>
        <dl>
          {t.keys.map(([key, action]) => (
            <div key={key}>
              <dt>
                <kbd>{key}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="drawing">
      <DrawingApp />
    </AppFrame>
  )
}

export default App
