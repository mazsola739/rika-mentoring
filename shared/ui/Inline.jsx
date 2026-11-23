// A lecke-szövegekben a `backtick` közti részeket kódként jeleníti meg.
export default function Inline({ text }) {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>))
}
