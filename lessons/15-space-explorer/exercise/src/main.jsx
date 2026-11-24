import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startMockApi } from './mocks/browser.js'
import './index.css'
import App from './App.jsx'

// First the pretend space API starts (src/mocks), so even the very first fetch('/api/…') gets an answer.
await startMockApi()

// React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
