import { useEffect, useMemo, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { useChat } from './useChat.js'
import UsernamePrompt, { isValidName } from './components/UsernamePrompt.jsx'
import MessageList from './components/MessageList.jsx'
import Sidebar from './components/Sidebar.jsx'
import './app.css'

// sessionStorage is per tab: two tabs of the same browser can be two different people.
const USER_KEY = 'rika:chat:user'
function loadUser() {
  try {
    const name = sessionStorage.getItem(USER_KEY)
    return name && isValidName(name) ? name : null
  } catch {
    return null
  }
}
function saveUser(name) {
  try {
    if (name) sessionStorage.setItem(USER_KEY, name)
    else sessionStorage.removeItem(USER_KEY)
  } catch {
    // fine: the name lives in state anyway
  }
}

const Hint = () => {
  const t = useText(TEXT)
  const supported = typeof BroadcastChannel !== 'undefined'
  return (
    <div className="ch-hint">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="5" width="11" height="9" rx="1.5" />
        <rect x="10.5" y="10" width="11" height="9" rx="1.5" />
      </svg>
      <div>
        <strong>{t.hintTitle}</strong>
        <p>{supported ? t.hintText : t.unsupported}</p>
      </div>
      {/* noopener gives the new tab a fresh sessionStorage, so it asks for a new name. */}
      <a className="btn btn--ghost ch-hint__btn" href={window.location.href} target="_blank" rel="noopener noreferrer">
        {t.openTab} ↗
      </a>
    </div>
  )
}

const Composer = ({ channel, onSend, onTyping, onStopTyping }) => {
  const t = useText(TEXT)
  const [text, setText] = useState('')

  // Leaving the channel (or the page) ends any "typing…" signal we sent.
  useEffect(() => onStopTyping, [onStopTyping])

  return (
    <form
      className="ch-composer"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim()) return
        onSend(text.trim())
        setText('')
      }}
    >
      <label htmlFor="ch-input" className="visually-hidden">
        {t.messageLabel(channel)}
      </label>
      <input
        id="ch-input"
        className="input"
        value={text}
        maxLength={500}
        autoComplete="off"
        placeholder={t.messageLabel(channel)}
        onChange={(e) => {
          setText(e.target.value)
          if (e.target.value.trim()) onTyping()
          else onStopTyping()
        }}
        onBlur={onStopTyping}
      />
      <button type="submit" className="btn" disabled={!text.trim()}>
        {t.send}
      </button>
    </form>
  )
}

const ChatRoom = ({ user, onChangeName }) => {
  const t = useText(TEXT)
  const chat = useChat(user)
  const [active, setActive] = useState('general')
  // When did I last look at each channel? Unread = newer messages from others.
  const [lastRead, setLastRead] = useState(() => ({ default: Date.now() }))

  const channelMessages = useMemo(() => chat.messages.filter((m) => m.channel === active), [chat.messages, active])

  // Reading the active channel marks it as read (also when a new message arrives in it).
  const lastActiveMessage = channelMessages[channelMessages.length - 1]?.at ?? 0
  useEffect(() => {
    setLastRead((r) => ({ ...r, [active]: Math.max(Date.now(), lastActiveMessage) }))
  }, [active, lastActiveMessage])

  const unread = useMemo(() => {
    const counts = {}
    for (const m of chat.messages) {
      if (m.channel === active || m.user === user) continue
      if (m.at > (lastRead[m.channel] ?? lastRead.default)) counts[m.channel] = (counts[m.channel] ?? 0) + 1
    }
    return counts
  }, [chat.messages, lastRead, active, user])

  const typers = chat.typingIn(active)

  return (
    <div className="ch-room">
      <Sidebar
        channels={chat.channels}
        active={active}
        unread={unread}
        online={chat.online}
        me={user}
        onSelect={setActive}
        onCreate={(name) => {
          chat.addChannel(name)
          setActive(name)
        }}
      />
      <section className="ch-main" aria-label={`#${active}`}>
        <header className="ch-main__head">
          <h3 className="ch-h3"># {active}</h3>
          <span className="ch-muted ch-main__tabs">{t.tabs(chat.tabCount)}</span>
          <span className="ch-me">
            {t.signedInAs} <strong>{user}</strong>
            <button type="button" className="ch-link" onClick={onChangeName}>
              {t.changeName}
            </button>
          </span>
        </header>

        {/* key: a fresh list per channel, which also starts scrolled to the newest message. */}
        <MessageList key={active} messages={channelMessages} me={user} />

        <p className="ch-typing" aria-live="polite">
          {typers.length > 0 && (
            <>
              <span className="ch-typing__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {t.typing(typers)}
            </>
          )}
        </p>

        <Composer
          key={active}
          channel={active}
          onSend={(text) => chat.send(active, text)}
          onTyping={() => chat.notifyTyping(active)}
          onStopTyping={chat.stopTyping}
        />
      </section>
      <button type="button" className="ch-reset" onClick={chat.resetHistory}>
        {t.reset}
      </button>
    </div>
  )
}

const Chat = () => {
  const [user, setUser] = useState(loadUser)

  return (
    <div className="ch">
      <Hint />
      {user ? (
        // key: a new name means a new connection (useChat re-announces the tab).
        <ChatRoom
          key={user}
          user={user}
          onChangeName={() => {
            saveUser(null)
            setUser(null)
          }}
        />
      ) : (
        <UsernamePrompt
          onJoin={(name) => {
            saveUser(name)
            setUser(name)
          }}
        />
      )}
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="chat">
      <Chat />
    </AppFrame>
  )
}

export default App
