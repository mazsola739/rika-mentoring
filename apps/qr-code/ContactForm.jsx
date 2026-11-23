import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

// Name, phone and email for a vCard. Same pattern as WifiForm: one object, one update().
function ContactForm({ contact, onChange }) {
  const t = useText(TEXT)

  function update(field, value) {
    onChange({ ...contact, [field]: value })
  }

  return (
    <div className="qr__form">
      <label className="field">
        <span>{t.name}</span>
        <input
          className="input"
          value={contact.name}
          autoComplete="name"
          onChange={(e) => update('name', e.target.value)}
        />
      </label>
      <label className="field">
        <span>{t.phone}</span>
        <input
          className="input"
          type="tel"
          value={contact.phone}
          autoComplete="tel"
          onChange={(e) => update('phone', e.target.value)}
        />
      </label>
      <label className="field">
        <span>{t.email}</span>
        <input
          className="input"
          type="email"
          value={contact.email}
          autoComplete="email"
          onChange={(e) => update('email', e.target.value)}
        />
      </label>
    </div>
  )
}

export default ContactForm
