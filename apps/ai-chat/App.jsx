import { useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { pickReply } from './replies.js'
import { TEXT } from './text.js'
import { useConversations } from './useConversations.js'
import { useStreamer } from './useStreamer.js'
import Sidebar from './components/Sidebar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import './app.css'

const AiChat = () => {
  const lang = useLang()
  const t = useText(TEXT)
  const { conversations, activeId, active, dispatch, newId } = useConversations()
  const streamer = useStreamer(dispatch)
  const [sideOpen, setSideOpen] = useState(false)
  const streamingHere = Boolean(streamer.streaming && streamer.streaming.convId === activeId)

  const send = (text) => {
    let convId = activeId
    if (!convId) {
      convId = newId()
      dispatch({ type: 'create', id: convId })
    }
    dispatch({ type: 'addMessage', convId, message: { id: newId(), role: 'user', text } })
    const msgId = newId()
    dispatch({ type: 'addMessage', convId, message: { id: msgId, role: 'assistant', text: '', status: 'streaming' } })
    // The reply is chosen in the current language; it is stored as plain text afterwards.
    streamer.start(convId, msgId, pickReply(text, lang))
  }

  const remove = (id) => {
    if (streamer.streaming?.convId === id) streamer.stop()
    dispatch({ type: 'remove', id })
  }

  return (
    <div className="ac">
      <div className="ac-head">
        <span className="ac-badge">
          <span className="ac-badge__dot" aria-hidden="true" />
          {t.demoBadge}
        </span>
        <p className="ac-head__note">{t.demoNote}</p>
      </div>

      <div className="ac-layout">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          open={sideOpen}
          onToggle={() => setSideOpen((o) => !o)}
          onNew={() => {
            dispatch({ type: 'create', id: newId() })
            setSideOpen(false)
          }}
          onSelect={(id) => {
            dispatch({ type: 'select', id })
            setSideOpen(false)
          }}
          onRename={(id, title) => dispatch({ type: 'rename', id, title })}
          onDelete={remove}
        />
        <ChatPanel conversation={active} streaming={streamingHere} onSend={send} onStop={streamer.stop} />
      </div>
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="ai-chat">
      <AiChat />
    </AppFrame>
  )
}

export default App
