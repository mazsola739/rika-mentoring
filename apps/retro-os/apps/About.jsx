import { version } from 'react'
import { useText } from '@shared/i18n.js'
import { useWindows } from '../WindowContext.jsx'
import { TEXT } from '../text.js'

const About = () => {
  const t = useText(TEXT).about
  const { windows } = useWindows() // any mini app can read the shared window state through Context

  return (
    <div className="ro-about">
      <div className="ro-about__head">
        <span className="ro-about__logo ro-logo" aria-hidden="true" />
        <div>
          <h3>{t.title}</h3>
          <p>{t.version}</p>
        </div>
      </div>
      <p>{t.body}</p>
      <ul>
        {t.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <p className="ro-about__sys ro-inset">
        {t.react(version)} · {t.open(windows.length)}
      </p>
    </div>
  )
}

export default About
