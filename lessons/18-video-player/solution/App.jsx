import { useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import VideoPlayer from './VideoPlayer.jsx'
import { PLAYLIST } from './playlist.js'
import { TEXT } from './text.js'
import './app.css'

function VideoLesson() {
  const t = useText(TEXT)
  const lang = useLang()
  const { palette } = useLesson()
  // Which clip of the playlist is on: its position in PLAYLIST.
  const [current, setCurrent] = useState(0)
  // The first clip waits for a click; after that, a chosen clip starts by itself.
  const [autoPlay, setAutoPlay] = useState(false)
  const clip = PLAYLIST[current]

  function select(index) {
    setCurrent(index)
    setAutoPlay(true)
  }

  function playNext() {
    // After the last clip the playlist stops.
    if (current + 1 < PLAYLIST.length) select(current + 1)
  }

  return (
    // The darkest palette color frames the video.
    <div className="vp-page" style={{ '--vp-night': palette.colors[0] }}>
      {/* The key gives every clip a brand-new player, with fresh state and a fresh <video> element. */}
      <VideoPlayer
        key={clip.id}
        src={clip.src}
        autoPlay={autoPlay}
        onEnded={playNext}
        storageKey={`rika:video-player:position:${clip.id}`}
      />

      <section className="vp-playlist" aria-labelledby="vp-playlist-title">
        <h2 id="vp-playlist-title">{t.playlist}</h2>
        <ol>
          {PLAYLIST.map((c, i) => (
            <li key={c.id}>
              <button type="button" className="vp-playlist__item" aria-current={i === current} onClick={() => select(i)}>
                <span className="vp-playlist__number">{i + 1}</span>
                {c.title[lang]}
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="vp-keys" aria-labelledby="vp-keys-title">
        <h2 id="vp-keys-title">{t.shortcuts}</h2>
        <dl>
          {t.keys.map(([keys, action]) => (
            <div key={keys.join(' ')}>
              <dt>
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
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
