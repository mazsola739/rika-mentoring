import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import LoginForm from './LoginForm.jsx'
import TodoList from './TodoList.jsx'
import './app.css'

const TEXT = {
  en: {
    newTask: 'New task',
    placeholder: 'What needs to be done?',
    add: 'Add',
    priority: 'Priority',
    priorities: { low: 'Low', normal: 'Normal', high: 'High' },
    dueDate: 'Due date',
    filters: { all: 'All', active: 'Active', done: 'Done' },
    filterLabel: 'Show',
    sort: 'Order',
    sorts: { manual: 'My order', due: 'Due date', priority: 'Priority' },
    left: (n) => (n === 1 ? '1 task left' : `${n} tasks left`),
    clearDone: (n) => `Clear completed (${n})`,
    empty: {
      all: 'Nothing to do yet. Add your first task above.',
      active: 'Everything is done. Nice work!',
      done: 'No completed tasks yet.',
    },
    markDone: (text) => `Done: ${text}`,
    moveUp: 'Move up',
    moveDown: 'Move down',
    edit: 'Edit',
    editLabel: 'Edit task',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    due: {
      overdue: (d) => `Overdue · ${d}`,
      today: () => 'Due today',
      tomorrow: () => 'Due tomorrow',
      later: (d) => `Due ${d}`,
    },
    hintManual: 'Tip: drag a task, or use the arrows, to change the order. Double-click a task to edit it: Enter saves, Esc cancels.',
    hintSorted: 'The list is sorted now. Choose “My order” to arrange the tasks by hand.',
    login: {
      title: 'Log in',
      hint: 'Your account is created the first time you log in. This is a practice server: do not use a real password.',
      name: 'Name',
      password: 'Password',
      submit: 'Log in',
      busy: 'Logging in…',
      errors: {
        missing: 'Enter your name and your password.',
        wrong: 'Wrong password.',
        offline: 'The server is not responding. Please try again.',
      },
    },
    loggedInAs: 'Logged in as',
    logOut: 'Log out',
    loading: 'Loading your tasks…',
    loadError: 'Could not load your tasks: the server is not responding.',
    retry: 'Try again',
    missing: 'This account is no longer on the server.',
    logInAgain: 'Log in again',
    saveStatus: { saved: 'All saved', saving: 'Saving…', failed: 'Could not save.' },
    saveAgain: 'Save again',
  },
  hu: {
    newTask: 'Új feladat',
    placeholder: 'Mit kell elintézni?',
    add: 'Hozzáadás',
    priority: 'Fontosság',
    priorities: { low: 'Ráér', normal: 'Normál', high: 'Sürgős' },
    dueDate: 'Határidő',
    filters: { all: 'Összes', active: 'Aktív', done: 'Kész' },
    filterLabel: 'Mutasd',
    sort: 'Sorrend',
    sorts: { manual: 'Saját sorrend', due: 'Határidő', priority: 'Fontosság' },
    left: (n) => `${n} feladat van hátra`,
    clearDone: (n) => `Készek törlése (${n})`,
    empty: {
      all: 'Még nincs teendő. Add hozzá az elsőt fent.',
      active: 'Minden kész. Szép munka!',
      done: 'Még nincs elvégzett feladat.',
    },
    markDone: (text) => `Kész: ${text}`,
    moveUp: 'Feljebb',
    moveDown: 'Lejjebb',
    edit: 'Szerkesztés',
    editLabel: 'Feladat szerkesztése',
    save: 'Mentés',
    cancel: 'Mégse',
    delete: 'Törlés',
    due: {
      overdue: (d) => `Lejárt · ${d}`,
      today: () => 'Ma esedékes',
      tomorrow: () => 'Holnap esedékes',
      later: (d) => `Határidő: ${d}`,
    },
    hintManual:
      'Tipp: húzással vagy a nyilakkal változtathatod meg a sorrendet. Dupla kattintással szerkesztheted a feladatot: Enter: mentés, Esc: mégse.',
    hintSorted: 'A lista most rendezve látszik. A „Saját sorrend” mellett kézzel is átrendezheted a feladatokat.',
    login: {
      title: 'Belépés',
      hint: 'Az első belépéskor létrejön a fiókod. Ez egy gyakorló szerver: ne a valódi jelszavadat használd.',
      name: 'Név',
      password: 'Jelszó',
      submit: 'Belépés',
      busy: 'Belépés…',
      errors: {
        missing: 'Add meg a neved és a jelszavad.',
        wrong: 'Hibás jelszó.',
        offline: 'A szerver nem válaszol. Próbáld újra!',
      },
    },
    loggedInAs: 'Belépve:',
    logOut: 'Kilépés',
    loading: 'A feladatok betöltése…',
    loadError: 'Nem sikerült betölteni a feladatokat: a szerver nem válaszol.',
    retry: 'Újra',
    missing: 'Ez a fiók már nincs meg a szerveren.',
    logInAgain: 'Belépés újra',
    saveStatus: { saved: 'Minden mentve', saving: 'Mentés…', failed: 'Nem sikerült menteni.' },
    saveAgain: 'Mentés újra',
  },
}

function TodoApp() {
  const t = useText(TEXT)
  // Who is logged in ({ id, name } or null)? It survives a reload, like a real login.
  const [user, setUser] = useLocalStorage('rika:todo:user', null)
  const logOut = () => setUser(null)

  if (!user?.id) {
    return (
      <div className="td">
        <LoginForm onLogin={setUser} t={t} />
      </div>
    )
  }

  return (
    <div className="td">
      <div className="td-user">
        <span>
          {t.loggedInAs} <strong>{user.name}</strong>
        </span>
        <button type="button" className="btn btn--ghost td-small" onClick={logOut}>
          {t.logOut}
        </button>
      </div>
      {/* key: another account gets a fresh TodoList, with none of the previous one's state. */}
      <TodoList key={user.id} accountId={user.id} t={t} onLogout={logOut} />
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="todo">
      <TodoApp />
    </AppFrame>
  )
}
