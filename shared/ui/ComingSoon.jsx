import { useText } from '../i18n.js'
import { useLesson } from './AppFrame.jsx'
import { FRAME_TEXT } from './strings.js'
import Inline from './Inline.jsx'

// Helyőrző azokhoz a leckékhez, amiket még élőben kódolunk.
export default function ComingSoon() {
  const lesson = useLesson()
  const t = useText(FRAME_TEXT)
  return (
    <div className="soon">
      <div className="soon__badge solid" aria-hidden="true" />
      <p className="soon__eyebrow">{t.soonTitle}</p>
      <h2>{lesson.text.title}</h2>
      <p>{t.soonText}</p>
      <p className="soon__first">
        <strong>{t.soonFirst}</strong> <Inline text={lesson.text.beginner} />
      </p>
    </div>
  )
}
