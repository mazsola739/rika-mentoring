import AppFrame from '@shared/ui/AppFrame.jsx'
import { WindowProvider } from './WindowContext.jsx'
import { PROGRAM_KEYS } from './programs.jsx'
import Desktop from './components/Desktop.jsx'
import './app.css'

export default function App() {
  return (
    <AppFrame slug="retro-os">
      <WindowProvider apps={PROGRAM_KEYS}>
        <Desktop />
      </WindowProvider>
    </AppFrame>
  )
}
