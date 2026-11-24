import { useEffect, useMemo, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { clamp } from './drawMeme.js'
import { useImage } from './useImage.js'
import { useLocalStorage } from './useLocalStorage.js'
import { downloadUrl } from './download.js'
import { backgroundByKey } from './backgrounds.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import SourcePicker from './components/SourcePicker.jsx'
import TextControls from './components/TextControls.jsx'
import ItemControls from './components/ItemControls.jsx'
import StickerBar from './components/StickerBar.jsx'
import Gallery from './components/Gallery.jsx'
import './app.css'

const TEXT = {
  en: {
    defaults: { top: 'When the code', bottom: 'works on the first try' },
    pickImage: 'Choose a picture',
    tabs: { templates: 'Meme templates', colors: 'Solid colors', upload: 'Your image' },
    topText: 'Top text',
    bottomText: 'Bottom text',
    font: 'Font',
    size: 'Text size',
    color: 'Text color',
    customColor: 'Custom color',
    swatch: (hex) => `Color ${hex}`,
    caps: 'All capitals',
    clearText: 'Clear text',
    download: 'Download PNG',
    downloaded: 'Saved as meme.png.',
    loadingImage: 'Loading the picture…',
    imageError: 'This picture could not be loaded. Pick another one or upload your own.',
    tainted:
      'This picture’s server does not allow saving it from a canvas, so the browser blocks downloading and saving it. Pick a solid color background or upload your own image, and both will work.',
    exportFailed: 'The download did not work. Try a solid color background or your own image.',
    preview: (top, bottom, stickers) =>
      `Meme preview. Top: ${top || 'empty'}. Bottom: ${bottom || 'empty'}.${stickers ? ` Stickers: ${stickers}.` : ''}`,
    dragHint:
      'Drag the captions and stickers on the picture. With the keyboard: Tab to the picture, then the arrow keys move the selected item (Shift for bigger steps) and Delete removes a selected sticker.',
    itemsLegend: 'Selected item',
    stickerChip: (emoji, n) => `Sticker ${n}: ${emoji}`,
    rotation: (degrees) => `Rotation: ${degrees}°`,
    deleteSticker: 'Delete sticker',
    stickersLegend: 'Stickers',
    addSticker: (emoji) => `Add sticker ${emoji}`,
    resetPositions: 'Reset positions',
    saveToGallery: 'Save to gallery',
    savedToGallery: 'Saved to the gallery.',
    saveFailed: 'This meme could not be saved. Try a solid color background or your own image.',
    gallery: 'Gallery',
    galleryEmpty: 'No saved memes yet. “Save to gallery” puts what is on the canvas here.',
    savedMeme: (when) => `Saved meme, ${when}`,
    share: 'Share',
    shareMeme: (when) => `Share the meme from ${when}`,
    delete: 'Delete',
    deleteMeme: (when) => `Delete the meme from ${when}`,
    shareDownloaded: 'Sharing is not available in this browser, so the meme was downloaded as meme.jpg.',
    shareFailed: 'Sharing did not work.',
    errors: {
      offline: 'You seem to be offline.',
      rate: 'The template API is receiving too many requests right now.',
      timeout: 'The template API took too long to answer.',
      server: 'The template API is not responding right now.',
      other: 'The meme templates could not be loaded.',
    },
    templatesFallback: 'Solid color backgrounds and your own images still work.',
    retry: 'Try again',
    uploadHint: 'Drop an image here, or choose one from your device.',
    chooseFile: 'Choose an image',
    uploaded: (name) => `Using ${name}.`,
    reuse: (name) => `Use ${name} again`,
    uploadPrivacy: 'Your image stays in your browser and is never uploaded anywhere.',
    notImage: 'That file is not an image. Pick a JPG, PNG, GIF or WebP file.',
    templatesCredit:
      'Templates: original drawings made for this lesson, served by its own meme API (/api/memes) running in your browser.',
  },
  hu: {
    defaults: { top: 'Amikor a kód', bottom: 'elsőre lefut' },
    pickImage: 'Válassz képet',
    tabs: { templates: 'Mémsablonok', colors: 'Egyszínű hátterek', upload: 'Saját kép' },
    topText: 'Felső szöveg',
    bottomText: 'Alsó szöveg',
    font: 'Betűtípus',
    size: 'Betűméret',
    color: 'Szöveg színe',
    customColor: 'Egyéni szín',
    swatch: (hex) => `Szín: ${hex}`,
    caps: 'Csupa nagybetű',
    clearText: 'Szöveg törlése',
    download: 'Letöltés PNG-ként',
    downloaded: 'Elmentve meme.png néven.',
    loadingImage: 'A kép betöltése…',
    imageError: 'Ezt a képet nem sikerült betölteni. Válassz másikat, vagy tölts fel sajátot.',
    tainted:
      'Ennek a képnek a szervere nem engedi, hogy canvasról elmentsük, ezért a böngésző letiltja a letöltést és a mentést. Válassz egyszínű hátteret, vagy tölts fel saját képet, és mindkettő működni fog.',
    exportFailed: 'A letöltés nem sikerült. Próbáld egyszínű háttérrel vagy a saját képeddel.',
    preview: (top, bottom, stickers) =>
      `Mém előnézet. Felül: ${top || 'üres'}. Alul: ${bottom || 'üres'}.${stickers ? ` Matricák: ${stickers}.` : ''}`,
    dragHint:
      'A feliratokat és a matricákat a képen húzhatod. Billentyűzettel: a Tab gombbal lépj a képre, a nyilak a kijelölt elemet mozgatják (Shift-tel nagyobbat lépnek), a Delete pedig törli a kijelölt matricát.',
    itemsLegend: 'Kijelölt elem',
    stickerChip: (emoji, n) => `${n}. matrica: ${emoji}`,
    rotation: (degrees) => `Forgatás: ${degrees}°`,
    deleteSticker: 'Matrica törlése',
    stickersLegend: 'Matricák',
    addSticker: (emoji) => `${emoji} matrica hozzáadása`,
    resetPositions: 'Helyek visszaállítása',
    saveToGallery: 'Mentés a galériába',
    savedToGallery: 'Elmentve a galériába.',
    saveFailed: 'Ezt a mémet nem sikerült elmenteni. Próbáld egyszínű háttérrel vagy a saját képeddel.',
    gallery: 'Galéria',
    galleryEmpty: 'Még nincs mentett mémed. A „Mentés a galériába” gombbal ide teheted, ami a vásznon van.',
    savedMeme: (when) => `Mentett mém, ${when}`,
    share: 'Megosztás',
    shareMeme: (when) => `A mém megosztása (${when})`,
    delete: 'Törlés',
    deleteMeme: (when) => `A mém törlése (${when})`,
    shareDownloaded: 'Ebben a böngészőben nem lehet megosztani, ezért a mémet letöltöttük meme.jpg néven.',
    shareFailed: 'A megosztás nem sikerült.',
    errors: {
      offline: 'Úgy tűnik, nincs internetkapcsolat.',
      rate: 'A sablon-API most túl sok kérést kap.',
      timeout: 'A sablon-API túl lassan válaszolt.',
      server: 'A sablon-API most nem válaszol.',
      other: 'Nem sikerült betölteni a mémsablonokat.',
    },
    templatesFallback: 'Az egyszínű hátterek és a saját képek így is működnek.',
    retry: 'Újrapróbálás',
    uploadHint: 'Húzz ide egy képet, vagy válassz egyet az eszközödről.',
    chooseFile: 'Kép kiválasztása',
    uploaded: (name) => `Használt kép: ${name}.`,
    reuse: (name) => `${name} használata újra`,
    uploadPrivacy: 'A képed a böngésződben marad, sehova nem töltjük fel.',
    notImage: 'Ez a fájl nem kép. Válassz JPG-, PNG-, GIF- vagy WebP-fájlt.',
    templatesCredit:
      'Sablonok: a leckéhez készült saját rajzok, amelyeket a lecke saját mém-API-ja (/api/memes) szolgál ki a böngésződben.',
  },
}

// Where the captions start, as fractions of the canvas (the top caption hangs from y, the bottom one stands on y).
const START_POSITIONS = {
  top: { x: 0.5, y: 0.035, angle: 0 },
  bottom: { x: 0.5, y: 0.965, angle: 0 },
}
const GALLERY_KEY = 'rika:meme-generator:gallery'
// JPEG data URLs are long: a dozen memes fit comfortably in localStorage.
const GALLERY_SIZE = 12

// Every sticker gets a new id: sticker-1, sticker-2, …
let nextStickerId = 1

function isCaption(id) {
  return id === 'top' || id === 'bottom'
}

function MemeGenerator() {
  const lang = useLang()
  const t = useText(TEXT)
  const { palette } = useLesson()
  const canvasRef = useRef(null)

  // Start with a solid background in the lesson's own color: it is local, so it always loads and can always be downloaded.
  const [source, setSource] = useState(() => {
    const { id, src } = backgroundByKey(palette.key)
    return { id, src }
  })
  const [text, setText] = useState(() => TEXT[lang].defaults)
  const [style, setStyle] = useState({ font: 'impact', size: 60, color: '#ffffff', caps: true })
  const [positions, setPositions] = useState(START_POSITIONS)
  const [stickers, setStickers] = useState([])
  const [selectedId, setSelectedId] = useState('top')
  const [gallery, setGallery] = useLocalStorage(GALLERY_KEY, [])
  const [file, setFile] = useState(null)
  const [uploadUrl, setUploadUrl] = useState(null)
  const [fileError, setFileError] = useState(false)
  // The last message under the buttons, remembered with the picture it belongs to.
  const [notice, setNotice] = useState({ src: null, key: null })

  // An uploaded file gets a temporary blob: URL. The cleanup releases it when the file changes or we unmount.
  useEffect(() => {
    if (!file) return undefined
    const url = URL.createObjectURL(file)
    setUploadUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const src = source.id === 'upload' ? uploadUrl : source.src
  const image = useImage(src)
  // One object for everything the canvas draws; useMemo keeps it the same object until one of them changes.
  const scene = useMemo(() => ({ text, style, positions, stickers }), [text, style, positions, stickers])

  // An image loaded without CORS permission "taints" the canvas: it shows, but cannot be exported.
  const tainted = image.status === 'ready' && !image.cors
  const noticeKey = notice.src === src ? notice.key : null
  const canExport = image.status === 'ready' && !tainted

  function pickFile(picked) {
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setFileError(true)
      return
    }
    setFileError(false)
    setFile(picked)
    setSource({ id: 'upload', name: picked.name })
  }

  // Changes a caption or a sticker: the fields of `changes` (x, y or angle) overwrite the old ones.
  // Updater functions, because while dragging the calls come many times a second.
  function updateItem(id, changes) {
    if (isCaption(id)) {
      setPositions((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
    } else {
      setStickers((current) => current.map((sticker) => (sticker.id === id ? { ...sticker, ...changes } : sticker)))
    }
  }

  // The keyboard way of dragging: move the selected item by a small step.
  function nudgeSelected(dx, dy) {
    const move = (item) => ({ ...item, x: clamp(item.x + dx), y: clamp(item.y + dy) })
    if (isCaption(selectedId)) {
      setPositions((current) => ({ ...current, [selectedId]: move(current[selectedId]) }))
    } else {
      setStickers((current) => current.map((sticker) => (sticker.id === selectedId ? move(sticker) : sticker)))
    }
  }

  function addSticker(emoji) {
    const sticker = { id: `sticker-${nextStickerId++}`, emoji, x: 0.5, y: 0.5, angle: 0 }
    setStickers((current) => [...current, sticker])
    setSelectedId(sticker.id)
  }

  function deleteSelectedSticker() {
    if (isCaption(selectedId)) return
    setStickers((current) => current.filter((sticker) => sticker.id !== selectedId))
    setSelectedId('top')
  }

  function download() {
    const canvas = canvasRef.current
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          setNotice({ src, key: 'exportFailed' })
          return
        }
        const url = URL.createObjectURL(blob)
        downloadUrl(url, 'meme.png')
        // Give the browser a moment to start the download before the URL is released.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        setNotice({ src, key: 'downloaded' })
      }, 'image/png')
    } catch {
      // SecurityError: the browser refuses to export a tainted canvas.
      setNotice({ src, key: 'exportFailed' })
    }
  }

  function saveToGallery() {
    let dataUrl
    try {
      // JPEG at 85%: a few hundred kB at most, where a PNG could be several MB.
      dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85)
    } catch {
      setNotice({ src, key: 'saveFailed' })
      return
    }
    // The newest goes first, and only the last GALLERY_SIZE memes are kept.
    setGallery((current) => [{ id: Date.now(), src: dataUrl }, ...current].slice(0, GALLERY_SIZE))
    setNotice({ src, key: 'savedToGallery' })
  }

  function deleteFromGallery(id) {
    setGallery((current) => current.filter((meme) => meme.id !== id))
  }

  // The selected item: a caption, or else a sticker.
  const selected = positions[selectedId] ?? stickers.find((sticker) => sticker.id === selectedId) ?? positions.top
  const items = [
    { id: 'top', label: t.topText },
    { id: 'bottom', label: t.bottomText },
    ...stickers.map((sticker, i) => ({ id: sticker.id, label: sticker.emoji, ariaLabel: t.stickerChip(sticker.emoji, i + 1) })),
  ]
  const swatches = [...new Set(['#ffffff', '#000000', ...palette.colors.map((c) => c.toLowerCase())])]
  const failed = noticeKey === 'exportFailed' || noticeKey === 'saveFailed'

  return (
    <div className="mg">
      <div className="mg-workspace">
        <div className="mg-preview">
          <div className="mg-stage" aria-busy={image.status === 'loading'}>
            <MemeCanvas
              canvasRef={canvasRef}
              image={image}
              scene={scene}
              label={t.preview(text.top, text.bottom, stickers.map((sticker) => sticker.emoji).join(' '))}
              hintId="mg-drag-hint"
              onSelect={setSelectedId}
              onMove={updateItem}
              onNudge={nudgeSelected}
              onDeleteSelected={deleteSelectedSticker}
            />
            {image.status === 'loading' && (
              <p className="mg-stage__overlay" role="status">
                {t.loadingImage}
              </p>
            )}
            {image.status === 'error' && (
              <p className="mg-stage__overlay mg-stage__overlay--error" role="alert">
                {t.imageError}
              </p>
            )}
          </div>
          <p id="mg-drag-hint" className="mg-muted">
            {t.dragHint}
          </p>
        </div>

        <div className="mg-side">
          <TextControls
            text={text}
            onText={(patch) => setText((prev) => ({ ...prev, ...patch }))}
            style={style}
            onStyle={(patch) => setStyle((prev) => ({ ...prev, ...patch }))}
            swatches={swatches}
            t={t}
          />
          <ItemControls
            items={items}
            selectedId={selectedId}
            angle={selected.angle}
            canDelete={!isCaption(selectedId)}
            onSelect={setSelectedId}
            onRotate={(angle) => updateItem(selectedId, { angle })}
            onDelete={deleteSelectedSticker}
            t={t}
          />
          <StickerBar onAdd={addSticker} t={t} />
          <div className="mg-export">
            <button type="button" className="btn mg-download" disabled={!canExport} onClick={download}>
              <span aria-hidden="true">↓</span> {t.download}
            </button>
            <div className="mg-export__row">
              <button type="button" className="btn btn--ghost" disabled={!canExport} onClick={saveToGallery}>
                {t.saveToGallery}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setPositions(START_POSITIONS)}>
                {t.resetPositions}
              </button>
            </div>
            <div aria-live="polite">
              {tainted && <p className="mg-warning">{t.tainted}</p>}
              {!tainted && noticeKey && <p className={failed ? 'mg-warning' : 'mg-muted'}>{t[noticeKey]}</p>}
            </div>
          </div>
        </div>
      </div>

      {fileError && (
        <p className="mg-warning" role="alert">
          {t.notImage}
        </p>
      )}

      <SourcePicker selected={source.id} onSelect={setSource} fileName={file?.name} onFile={pickFile} lang={lang} t={t} />

      <Gallery memes={gallery} onDelete={deleteFromGallery} lang={lang} t={t} />
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="meme-generator">
      <MemeGenerator />
    </AppFrame>
  )
}
