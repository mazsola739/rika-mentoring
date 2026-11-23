import { useRef, useState } from 'react'
import { errorKind, useFetch } from '../useFetch.js'
import { BACKGROUNDS } from '../backgrounds.js'

// The address comes from an environment variable (VITE_MEMES_API in a .env file) when there is one.
// The default is the lesson's own template API (mocks/handlers.js), which runs in the browser.
const MEMES_API = import.meta.env.VITE_MEMES_API ?? '/api/memes'
const TABS = ['templates', 'colors', 'upload']

function TemplateGrid({ request, selected, onSelect, t }) {
  const { status, data, error, retry } = request
  // The API answers 200 with { success: false } when something is wrong on its side (imgflip-style).
  const failed = status === 'error' || (status === 'success' && !data?.success)
  const memes = status === 'success' && data?.success ? data.data.memes.slice(0, 30) : []

  if (status === 'loading') {
    return (
      <ul className="mg-grid" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="mg-skel" />
        ))}
      </ul>
    )
  }

  if (failed) {
    return (
      <div className="mg-state" role="alert">
        <p>
          {error ? t.errors[errorKind(error)] : t.errors.other} {t.templatesFallback}
        </p>
        <button type="button" className="btn btn--ghost" onClick={retry}>
          {t.retry}
        </button>
      </div>
    )
  }

  return (
    <ul className="mg-grid">
      {memes.map((meme) => (
        <li key={meme.id}>
          <button
            type="button"
            className="mg-thumb"
            aria-pressed={selected === `template:${meme.id}`}
            onClick={() => onSelect({ id: `template:${meme.id}`, src: meme.url, name: meme.name })}
          >
            {/* crossOrigin here too, so the cached copy can be reused for the canvas. */}
            <img src={meme.url} alt="" crossOrigin="anonymous" loading="lazy" />
            <span>{meme.name}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function ColorGrid({ selected, onSelect, lang }) {
  return (
    <ul className="mg-grid">
      {BACKGROUNDS.map((bg) => {
        const name = bg.name[lang]
        return (
          <li key={bg.id}>
            <button
              type="button"
              className="mg-thumb"
              aria-pressed={selected === bg.id}
              onClick={() => onSelect({ id: bg.id, src: bg.src, name })}
            >
              {/* The thumbnail is just a colored box; the full-size image is made only when it is picked. */}
              <span className="mg-thumb__color" style={{ background: bg.color }} aria-hidden="true" />
              <span>{name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function UploadBox({ fileName, isSelected, onReuse, onFile, t }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div
      className="mg-upload"
      data-dragging={dragging}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        onFile(e.dataTransfer.files?.[0])
      }}
    >
      <p>{t.uploadHint}</p>
      <input
        ref={inputRef}
        id="mg-file"
        className="visually-hidden"
        type="file"
        accept="image/*"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.target.value = '' // the same file can be picked again
        }}
      />
      <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
        {t.chooseFile}
      </button>
      {fileName && isSelected && <p className="mg-muted">{t.uploaded(fileName)}</p>}
      {fileName && !isSelected && (
        <button type="button" className="btn btn--ghost" onClick={onReuse}>
          {t.reuse(fileName)}
        </button>
      )}
      <p className="mg-muted">{t.uploadPrivacy}</p>
    </div>
  )
}

export default function SourcePicker({ selected, onSelect, fileName, onFile, lang, t }) {
  const [tab, setTab] = useState('templates')
  // Fetched here (not inside the grid), so switching tabs does not repeat the request.
  // The template names come in the page's language, so a language switch is a new request.
  const templates = useFetch(`${MEMES_API}?${new URLSearchParams({ lang })}`)

  return (
    <section className="mg-sources" aria-labelledby="mg-sources-title">
      <h3 id="mg-sources-title" className="mg-section-title">
        {t.pickImage}
      </h3>
      <div className="mg-tabs" role="group" aria-label={t.pickImage}>
        {TABS.map((key) => (
          <button key={key} type="button" className="chip" aria-pressed={tab === key} onClick={() => setTab(key)}>
            {t.tabs[key]}
          </button>
        ))}
      </div>
      {tab === 'templates' && <TemplateGrid request={templates} selected={selected} onSelect={onSelect} t={t} />}
      {tab === 'colors' && <ColorGrid selected={selected} onSelect={onSelect} lang={lang} />}
      {tab === 'upload' && (
        <UploadBox
          fileName={fileName}
          isSelected={selected === 'upload'}
          onReuse={() => onSelect({ id: 'upload' })}
          onFile={onFile}
          t={t}
        />
      )}
      {tab === 'templates' && <p className="mg-muted">{t.templatesCredit}</p>}
    </section>
  )
}
