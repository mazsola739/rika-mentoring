import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@shared/ui/theme.css'
import { startMockApi } from '@shared/mock-api/msw.js'
import { handlers } from './mocks/handlers.js'
import App from './App.jsx'

// Start the wiki's own API first, so the very first fetch (and every picture) is already answered by it.
await startMockApi(handlers)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
