// Text formats that phones recognize when they scan a QR code.

// A backslash goes before every special character, so the scanner reads it as text, not as a separator.
function escapeChars(text, specials) {
  let result = ''
  for (const char of text) {
    if (specials.includes(char)) result += '\\'
    result += char
  }
  return result
}

// Wi-Fi: WIFI:T:WPA;S:network;P:password;; The phone's camera offers to join the network.
export function wifiText({ ssid, password, security, hidden }) {
  let text = `WIFI:T:${security};S:${escapeChars(ssid, '\\;,:"')};`
  if (security !== 'nopass') text += `P:${escapeChars(password, '\\;,:"')};`
  if (hidden) text += 'H:true;'
  return text + ';'
}

// A contact card in vCard 3.0 form, one detail per line. The phone offers to save it.
export function contactText({ name, phone, email }) {
  const fullName = escapeChars(name.trim(), '\\;,')
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${fullName};;;;`, `FN:${fullName}`]
  if (phone.trim() !== '') lines.push(`TEL:${escapeChars(phone.trim(), '\\;,')}`)
  if (email.trim() !== '') lines.push(`EMAIL:${escapeChars(email.trim(), '\\;,')}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}
