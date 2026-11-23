import { LANGS, setLang, useLang } from '../i18n.js'

const LABELS = { hu: 'Magyar', en: 'English' }

export default function LangSwitch({ className = '' }) {
  const lang = useLang()
  return (
    <div className={`langswitch ${className}`} role="group" aria-label={lang === 'hu' ? 'Nyelv' : 'Language'}>
      {LANGS.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} title={LABELS[l]} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
