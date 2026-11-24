import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

export const MIN_SIZE = 1
export const MAX_SIZE = 60

const ICONS = {
  brush: 'M4 20c3 0 5-1.5 5-4a3 3 0 0 0-3-3c-1.7 0-3 1.3-3 3 0 1.5-.5 3-1 4h2zM9.5 12.5 19 3l2 2-9.5 9.5',
  eraser: 'M8 20h12M5.5 14.5l8-8a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L12 18H8.5l-3-3a.7.7 0 0 1 0-.5zM9 11l5 5',
  undo: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  redo: 'M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
  clear: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
}

const Icon = ({ name }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

const Toolbar = ({
  tool,
  setTool,
  size,
  setSize,
  color,
  setColor,
  colors,
  canUndo,
  canRedo,
  canClear,
  onUndo,
  onRedo,
  onClear,
  onDownload,
}) => {
  const t = useText(TEXT)
  const isCustom = !colors.includes(color)

  const chooseColor = (value) => {
    setColor(value)
    setTool('brush') // picking a color means you want to paint
  }

  return (
    <div className="dr-toolbar">
      <div className="dr-group" role="group" aria-label={t.tools}>
        {['brush', 'eraser'].map((name) => (
          <button
            key={name}
            type="button"
            className="dr-tool"
            aria-pressed={tool === name}
            onClick={() => setTool(name)}
            title={`${t[name]} (${name === 'brush' ? 'B' : 'E'})`}
          >
            <Icon name={name} />
            <span>{t[name]}</span>
          </button>
        ))}
      </div>

      <label className="dr-size">
        <span className="dr-label">
          {t.size}: {size} px
        </span>
        <span className="dr-size__row">
          <input type="range" min={MIN_SIZE} max={MAX_SIZE} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          <span className="dr-size__preview" aria-hidden="true">
            <span style={{ width: size, height: size, background: tool === 'eraser' ? '#fff' : color }} />
          </span>
        </span>
      </label>

      <fieldset className="dr-colors">
        <legend className="dr-label">{t.colors}</legend>
        <div className="dr-colors__list">
          {colors.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className="dr-swatch"
              style={{ background: swatch }}
              aria-pressed={tool === 'brush' && color === swatch}
              aria-label={t.colorName(swatch)}
              title={swatch}
              onClick={() => chooseColor(swatch)}
            />
          ))}
          <label className={`dr-swatch dr-swatch--custom${isCustom && tool === 'brush' ? ' is-active' : ''}`} title={t.custom}>
            <span className="visually-hidden">{t.custom}</span>
            <input type="color" value={isCustom ? color : '#000000'} onChange={(e) => chooseColor(e.target.value)} />
          </label>
        </div>
      </fieldset>

      <div className="dr-group dr-actions">
        <button type="button" className="dr-action" onClick={onUndo} disabled={!canUndo} title={`${t.undo} (Ctrl+Z)`}>
          <Icon name="undo" />
          <span>{t.undo}</span>
        </button>
        <button type="button" className="dr-action" onClick={onRedo} disabled={!canRedo} title={`${t.redo} (Ctrl+Y)`}>
          <Icon name="redo" />
          <span>{t.redo}</span>
        </button>
        <button type="button" className="dr-action" onClick={onClear} disabled={!canClear}>
          <Icon name="clear" />
          <span>{t.clear}</span>
        </button>
        <button type="button" className="btn dr-download" onClick={onDownload}>
          <Icon name="download" />
          {t.download}
        </button>
      </div>
    </div>
  )
}

export default Toolbar
