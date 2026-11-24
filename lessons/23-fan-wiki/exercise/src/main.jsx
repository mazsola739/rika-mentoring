import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startMockApi } from './mocks/msw.js'
import { handlers } from './mocks/handlers.js'
import './index.css'
import App from './App.jsx'

// First the pretend server starts (src/mocks), so it can already answer the app's very first request…
await startMockApi(handlers)

// …then React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
