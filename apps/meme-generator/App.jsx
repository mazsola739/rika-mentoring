import { useEffect, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { FONTS, drawMeme } from './drawMeme.js'
import { useImage } from './useImage.js'
import { backgroundByKey } from './backgrounds.js'
import SourcePicker from './components/SourcePicker.jsx'
import TextControls from './components/TextControls.jsx'
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
      'This picture’s server does not allow saving it from a canvas, so the browser blocks the download. Pick a solid color background or upload your own image, and downloading will work.',
    exportFailed: 'The download did not work. Try a solid color background or your own image.',
    preview: (top, bottom) => `Meme preview. Top: ${top || 'empty'}. Bottom: ${bottom || 'empty'}.`,
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
      'Ennek a képnek a szervere nem engedi, hogy canvasról elmentsük, ezért a böngésző letiltja a letöltést. Válassz egyszínű hátteret, vagy tölts fel saját képet, és a letöltés működni fog.',
    exportFailed: 'A letöltés nem sikerült. Próbáld egyszínű háttérrel vagy a saját képeddel.',
    preview: (top, bottom) => `Mém előnézet. Felül: ${top || 'üres'}. Alul: ${bottom || 'üres'}.`,
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
    notImage: 'Ez a fájl nem kép. Válassz JPG, PNG, GIF vagy WebP fájlt.',
    templatesCredit:
      'Sablonok: a leckéhez készült saját rajzok, amelyeket a lecke saját mém-API-ja (/api/memes) szolgál ki a böngésződben.',
  },
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
  const [file, setFile] = useState(null)
  const [uploadUrl, setUploadUrl] = useState(null)
  const [fileError, setFileError] = useState(false)
  const [exported, setExported] = useState({ src: null, state: 'idle' })
  const [fontsLoaded, setFontsLoaded] = useState(0)

  // An uploaded file gets a temporary blob: URL. The cleanup releases it when the file changes or we unmount.
  useEffect(() => {
    if (!file) return undefined
    const url = URL.createObjectURL(file)
    setUploadUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const src = source.id === 'upload' ? uploadUrl : source.src
  const image = useImage(src)

  // Web fonts load lazily. Ask the browser for the chosen one, then draw again once it is there.
  useEffect(() => {
    if (!document.fonts?.load) return undefined
    let active = true
    document.fonts
      .load(FONTS[style.font].css(48))
      .then(() => active && setFontsLoaded((n) => n + 1))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [style.font])

  // Canvas drawing is a side effect: React renders the <canvas>, the effect paints on it.
  useEffect(() => {
    if (image.status !== 'ready' || !canvasRef.current) return
    drawMeme(canvasRef.current, image.image, { ...text, ...style })
  }, [image.status, image.image, text, style, fontsLoaded])

  // An image loaded without CORS permission "taints" the canvas: it shows, but cannot be exported.
  const tainted = image.status === 'ready' && !image.cors
  const exportState = exported.src === src ? exported.state : 'idle'

  const pickFile = (picked) => {
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setFileError(true)
      return
    }
    setFileError(false)
    setFile(picked)
    setSource({ id: 'upload', name: picked.name })
  }

  const download = () => {
    const canvas = canvasRef.current
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          setExported({ src, state: 'failed' })
          return
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'meme.png'
        document.body.append(link)
        link.click()
        link.remove()
        // Give the browser a moment to start the download before the URL is released.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        setExported({ src, state: 'done' })
      }, 'image/png')
    } catch {
      // SecurityError: the browser refuses to export a tainted canvas.
      setExported({ src, state: 'failed' })
    }
  }

  const swatches = [...new Set(['#ffffff', '#000000', ...palette.colors.map((c) => c.toLowerCase())])]

  return (
    <div className="mg">
      <div className="mg-workspace">
        <div className="mg-stage" aria-busy={image.status === 'loading'}>
          <canvas
            ref={canvasRef}
            className="mg-canvas"
            data-ready={image.status === 'ready'}
            role="img"
            aria-label={t.preview(text.top, text.bottom)}
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

        <div className="mg-side">
          <TextControls
            text={text}
            onText={(patch) => setText((prev) => ({ ...prev, ...patch }))}
            style={style}
            onStyle={(patch) => setStyle((prev) => ({ ...prev, ...patch }))}
            swatches={swatches}
            t={t}
          />
          <div className="mg-export">
            <button type="button" className="btn mg-download" disabled={image.status !== 'ready' || tainted} onClick={download}>
              <span aria-hidden="true">↓</span> {t.download}
            </button>
            <div aria-live="polite">
              {tainted && <p className="mg-warning">{t.tainted}</p>}
              {!tainted && exportState === 'failed' && <p className="mg-warning">{t.exportFailed}</p>}
              {!tainted && exportState === 'done' && <p className="mg-muted">{t.downloaded}</p>}
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
