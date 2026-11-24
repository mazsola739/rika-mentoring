import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { startMockApi } from './mocks/msw.js'
import { handlers } from './mocks/handlers.js'

// First the pretend TV API starts (see src/mocks), so even the very first fetch('/api/tv/…') gets an answer.
await startMockApi(handlers)

// Then React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
