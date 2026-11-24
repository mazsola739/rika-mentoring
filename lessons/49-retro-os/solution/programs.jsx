import Notepad from './apps/Notepad.jsx'
import Minesweeper from './apps/Minesweeper.jsx'
import About from './apps/About.jsx'
import { AboutIcon, MineIcon, NotepadIcon } from './components/Icons.jsx'

// The registry of mini apps. The desktop, the Start menu and the windows are all built from
// this one list, so adding a new app is a single new entry here.
export const PROGRAMS = {
  notepad: { Icon: NotepadIcon, Component: Notepad, width: 340, height: 250 },
  minesweeper: { Icon: MineIcon, Component: Minesweeper, width: 'auto', height: 'auto' },
  about: { Icon: AboutIcon, Component: About, width: 330, height: 'auto' },
}

export const PROGRAM_KEYS = Object.keys(PROGRAMS)
