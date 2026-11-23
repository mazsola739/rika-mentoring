import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import VideoPlayer from './VideoPlayer.jsx'
import { TEXT } from './text.js'
import './app.css'

// CC0 sample clip from the MDN interactive examples.
const VIDEO_SRC = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

function VideoLesson() {
  const t = useText(TEXT)
  const { palette } = useLesson()

  return (
    // The darkest palette color frames the video.
    <div className="vp-page" style={{ '--vp-night': palette.colors[0] }}>
      <VideoPlayer src={VIDEO_SRC} storageKey="rika:video-player:position" />

      <section className="vp-keys" aria-labelledby="vp-keys-title">
        <h2 id="vp-keys-title">{t.shortcuts}</h2>
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
        <p className="vp-note">{t.hint}</p>
      </section>

      <p className="vp-credit">
        {t.credit}{' '}
        <a href={VIDEO_SRC} target="_blank" rel="noreferrer">
          {t.source}
        </a>
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="video-player">
      <VideoLesson />
    </AppFrame>
  )
}
