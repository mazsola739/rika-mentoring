// Hand-drawn pixel-style icons (own design, no system logos).
export function NotepadIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="ro-svg">
      <path d="M7 3h14l5 5v21H7z" fill="#fffdf6" stroke="#2b2620" strokeWidth="1.5" />
      <path d="M21 3v5h5" fill="#e9e1cf" stroke="#2b2620" strokeWidth="1.5" />
      <path d="M10 13h12M10 17h12M10 21h9M10 25h11" stroke="var(--solid)" strokeWidth="1.6" />
    </svg>
  )
}

export function MineIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="ro-svg">
      <path d="M16 3v6M16 23v6M3 16h6M23 16h6M7 7l4 4M21 21l4 4M25 7l-4 4M11 21l-4 4" stroke="#2b2620" strokeWidth="2" />
      <circle cx="16" cy="16" r="8" fill="#2b2620" />
      <circle cx="13" cy="13" r="2.4" fill="#fffdf6" />
    </svg>
  )
}

export function AboutIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="ro-svg">
      <rect x="3" y="5" width="26" height="18" rx="2" fill="var(--solid)" stroke="#2b2620" strokeWidth="1.5" />
      <rect x="6" y="8" width="20" height="12" fill="var(--solid-light)" />
      <path d="M12 27h8M16 23v4" stroke="#2b2620" strokeWidth="2" />
      <circle cx="16" cy="11" r="1.6" fill="#2b2620" />
      <path d="M16 14v4" stroke="#2b2620" strokeWidth="2" />
    </svg>
  )
}

// Minesweeper face: 'play' | 'won' | 'lost' | 'tense'
export function Face({ mood }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="ro-face">
      <circle cx="12" cy="12" r="10" fill="#ffd35a" stroke="#2b2620" strokeWidth="1.5" />
      {mood === 'lost' ? (
        <path d="M7 8l3 3M10 8l-3 3M14 8l3 3M17 8l-3 3" stroke="#2b2620" strokeWidth="1.5" />
      ) : mood === 'won' ? (
        <path d="M5.5 9.5h13M6 9.5c0 2 1 2.6 2.5 2.6S11 11.5 11 9.5M13 9.5c0 2 1 2.6 2.5 2.6S18 11.5 18 9.5" fill="#2b2620" stroke="#2b2620" strokeWidth="1.2" />
      ) : (
        <>
          <circle cx="8.5" cy="9.5" r="1.4" fill="#2b2620" />
          <circle cx="15.5" cy="9.5" r="1.4" fill="#2b2620" />
        </>
      )}
      {mood === 'lost' ? (
        <path d="M8 17c2-2 6-2 8 0" fill="none" stroke="#2b2620" strokeWidth="1.5" />
      ) : mood === 'tense' ? (
        <circle cx="12" cy="16" r="2" fill="#2b2620" />
      ) : (
        <path d="M7.5 14.5c2.5 3 6.5 3 9 0" fill="none" stroke="#2b2620" strokeWidth="1.5" />
      )}
    </svg>
  )
}
