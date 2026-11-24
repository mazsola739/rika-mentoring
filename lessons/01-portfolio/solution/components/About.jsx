export default function About({ profile, t }) {
  return (
    <section className="pf-section pf-about" id="pf-about" aria-labelledby="pf-about-title">
      <h2 className="pf-section__title" id="pf-about-title">
        {t.aboutTitle}
      </h2>
      <div className="pf-about__grid">
        <div className="pf-about__text">
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className="pf-facts">
          {profile.facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
