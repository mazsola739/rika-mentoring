import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import VideoPlayer from './VideoPlayer.jsx'
import { TEXT } from './text.js'
import './app.css'
import VIDEO_SRC from './media/rika-sample.mp4'

// The sample clip is served with the site (Vite copies it into the build and gives it a hashed name).
// It is a placeholder until the site's own video arrives: replace media/rika-sample.mp4 to change it.

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

      <p className="vp-credit">{t.credit}</p>
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
