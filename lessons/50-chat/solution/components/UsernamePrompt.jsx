import { useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from '../text.js'

export const isValidName = (name) => /^[\p{L}\p{N} _-]{2,20}$/u.test(name.trim())

const ANIMALS = ['Otter', 'Lynx', 'Heron', 'Fox', 'Koala', 'Panda', 'Gecko', 'Robin', 'Seal', 'Hare']
const randomName = () => `${ANIMALS[Math.floor(Math.random() * ANIMALS.length)]} ${Math.floor(10 + Math.random() * 90)}`

const UsernamePrompt = ({ onJoin }) => {
  const t = useText(TEXT)
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const invalid = !isValidName(name)
  const showError = touched && invalid

  return (
    <form
      className="ch-prompt"
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (!invalid) onJoin(name.trim())
      }}
      noValidate
    >
      <span className="ch-prompt__mark" aria-hidden="true" />
      <h3 className="ch-h3">{t.promptTitle}</h3>
      <p className="ch-muted">{t.promptIntro}</p>
      <div className="field">
        <label htmlFor="ch-username">
          <span className="ch-label">{t.username}</span>
        </label>
        <div className="ch-prompt__row">
          <input
            id="ch-username"
            className="input"
            value={name}
            maxLength={20}
            autoComplete="nickname"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={showError}
            aria-describedby={showError ? 'ch-username-error' : undefined}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setName(randomName())
              setTouched(false)
            }}
          >
            {t.random}
          </button>
        </div>
        {showError && (
          <small id="ch-username-error" className="ch-error">
            {t.usernameError}
          </small>
        )}
      </div>
      <button type="submit" className="btn">
        {t.join}
      </button>
    </form>
  )
}

export default UsernamePrompt
