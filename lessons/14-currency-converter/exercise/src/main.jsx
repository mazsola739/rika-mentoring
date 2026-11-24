import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startMockApi } from './mocks/browser.js'
import './index.css'
import App from './App.jsx'

// First the pretend rates server starts (src/mocks/), so that it can answer the app's very first request.
await startMockApi()

// Then React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
