export default function Hero({ profile, t, onNavigate }) {
  return (
    <section className="pf-hero" id="pf-top">
      <div className="pf-hero__copy">
        <p className="pf-eyebrow">{profile.role}</p>
        <h1 className="pf-hero__name">{profile.name}</h1>
        <p className="pf-hero__tagline">{profile.tagline}</p>
        <div className="pf-hero__actions">
          <button type="button" className="btn" onClick={() => onNavigate('projects')}>
            {t.ctaProjects}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => onNavigate('contact')}>
            {t.ctaContact}
          </button>
        </div>
      </div>
      {/* A simple monogram avatar instead of a photo. */}
      <div className="pf-avatar solid" aria-hidden="true">
        <span className="pf-avatar__initials">{profile.initials}</span>
      </div>
    </section>
  )
}
