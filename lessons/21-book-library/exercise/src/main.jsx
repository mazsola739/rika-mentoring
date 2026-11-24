import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startPretendServer } from './mocks/browser.js'
import './index.css'
import App from './App.jsx'

// First the pretend server (src/mocks/) starts, so it already answers the very first fetch('/api/…').
await startPretendServer()

// React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
