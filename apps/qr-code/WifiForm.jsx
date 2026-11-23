import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

const SECURITY = ['WPA', 'WEP', 'nopass']

// The Wi-Fi details live in one object; update() copies it and changes one field.
function WifiForm({ wifi, onChange }) {
  const t = useText(TEXT)

  function update(field, value) {
    onChange({ ...wifi, [field]: value })
  }

  return (
    <div className="qr__form">
      <label className="field">
        <span>{t.ssid}</span>
        <input className="input" value={wifi.ssid} onChange={(e) => update('ssid', e.target.value)} />
      </label>
      <label className="field">
        <span>{t.security}</span>
        <select className="input" value={wifi.security} onChange={(e) => update('security', e.target.value)}>
          {SECURITY.map((key) => (
            <option key={key} value={key}>
              {t.securityOptions[key]}
            </option>
          ))}
        </select>
      </label>
      {wifi.security !== 'nopass' && (
        <label className="field">
          <span>{t.password}</span>
          <input
            className="input"
            value={wifi.password}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => update('password', e.target.value)}
          />
        </label>
      )}
      <label className="qr__check">
        <input type="checkbox" checked={wifi.hidden} onChange={(e) => update('hidden', e.target.checked)} />
        {t.hidden}
      </label>
      <small className="qr__hint">{t.wifiNote}</small>
    </div>
  )
}

export default WifiForm
