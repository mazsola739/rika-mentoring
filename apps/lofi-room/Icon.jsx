// Decorative line icons; the buttons and sliders have their own text labels.
const PATHS = {
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  pause: <path d="M6.5 5h3.8v14H6.5zM13.7 5h3.8v14h-3.8z" fill="currentColor" />,
  reset: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4.5v4h4" />
    </>
  ),
  rain: (
    <>
      <path d="M7 15a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 7.1a3.5 3.5 0 0 1 .5 6.9H7z" />
      <path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5" />
    </>
  ),
  cafe: (
    <>
      <path d="M5 10h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V10z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H15.5" />
      <path d="M9 3.5c-.8 1 .8 2 0 3M12.5 3.5c-.8 1 .8 2 0 3" />
    </>
  ),
  fire: <path d="M12 21a6 6 0 0 0 6-6c0-3.5-2.6-5.4-3.6-8.6C13 8.5 12 9.5 11 9.6c0-2-1-4-2.4-5.6C8.2 7 6 10 6 15a6 6 0 0 0 6 6z" />,
  music: (
    <>
      <path d="M9 18V6.5l10-2.2V16" />
      <circle cx="6.6" cy="18" r="2.4" />
      <circle cx="16.6" cy="16" r="2.4" />
    </>
  ),
}

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
