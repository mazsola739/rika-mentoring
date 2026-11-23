import ContactForm from './ContactForm.jsx'

export default function Contact({ profile, t }) {
  return (
    <section className="pf-section pf-contact" id="pf-contact" aria-labelledby="pf-contact-title">
      <div className="pf-contact__grid">
        <div>
          <h2 className="pf-section__title" id="pf-contact-title">
            {t.contactTitle}
          </h2>
          <p className="pf-section__lead">{t.contactLead}</p>
          <dl className="pf-facts pf-contact__facts">
            <div>
              <dt>{t.emailLabel}</dt>
              <dd>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </dd>
            </div>
            {profile.facts.slice(0, 2).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ContactForm t={t} />
      </div>
    </section>
  )
}
