import { useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from '../text.js'

const isChannelName = (name) => /^[a-z0-9-]{2,20}$/.test(name)

const NewChannelForm = ({ channels, onCreate, onClose }) => {
  const t = useText(TEXT)
  const [name, setName] = useState('')
  const normalized = name.trim().toLowerCase().replace(/\s+/g, '-')
  const invalid = !isChannelName(normalized) || channels.includes(normalized)
  const [touched, setTouched] = useState(false)

  return (
    <form
      className="ch-newchan"
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (invalid) return
        onCreate(normalized)
        onClose()
      }}
      noValidate
    >
      <label htmlFor="ch-new-channel" className="visually-hidden">
        {t.channelName}
      </label>
      <div className="ch-newchan__input">
        <span aria-hidden="true">#</span>
        <input
          id="ch-new-channel"
          className="input"
          value={name}
          maxLength={20}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          aria-invalid={touched && invalid}
          aria-describedby={touched && invalid ? 'ch-new-channel-error' : undefined}
        />
      </div>
      {touched && invalid && (
        <small id="ch-new-channel-error" className="ch-error">
          {t.channelError}
        </small>
      )}
      <div className="ch-newchan__actions">
        <button type="submit" className="btn ch-btn-sm">
          {t.create}
        </button>
        <button type="button" className="btn btn--ghost ch-btn-sm" onClick={onClose}>
          {t.cancel}
        </button>
      </div>
    </form>
  )
}

const Sidebar = ({ channels, active, unread, online, me, onSelect, onCreate }) => {
  const t = useText(TEXT)
  const [creating, setCreating] = useState(false)

  return (
    <aside className="ch-side" aria-label={t.channels}>
      <section>
        <h3 className="ch-side__title">{t.channels}</h3>
        <ul className="ch-channels">
          {channels.map((c) => (
            <li key={c}>
              <button type="button" className="ch-channel" aria-current={c === active ? 'true' : undefined} onClick={() => onSelect(c)}>
                <span className="ch-channel__name"># {c}</span>
                {unread[c] > 0 && (
                  <span className="ch-badge" aria-label={t.unread(unread[c])}>
                    {unread[c]}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {creating ? (
          <NewChannelForm channels={channels} onCreate={onCreate} onClose={() => setCreating(false)} />
        ) : (
          <button type="button" className="ch-add" onClick={() => setCreating(true)}>
            + {t.newChannel}
          </button>
        )}
      </section>

      <section className="ch-online">
        <h3 className="ch-side__title">{t.online(online.length)}</h3>
        <ul>
          {online.map((name) => (
            <li key={name}>
              <span className="ch-dot" aria-hidden="true" />
              {name}
              {name === me && <span className="ch-tag">{t.you}</span>}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

export default Sidebar
