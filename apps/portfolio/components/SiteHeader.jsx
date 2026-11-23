// A portfólió saját navigációja. A gombok a megfelelő szakaszhoz görgetnek.
export default function SiteHeader({ profile, nav, onNavigate }) {
  return (
    <header className="pf-header">
      <button type="button" className="pf-logo" onClick={() => onNavigate('top')}>
        <span className="pf-logo__mark solid" aria-hidden="true">
          {profile.initials}
        </span>
        <span className="pf-logo__name">{profile.name}</span>
      </button>
      <nav aria-label={profile.name}>
        <ul className="pf-nav">
          {Object.entries(nav).map(([id, label]) => (
            <li key={id}>
              <button type="button" onClick={() => onNavigate(id)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
