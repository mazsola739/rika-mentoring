import LevelMeter from '@shared/ui/LevelMeter.jsx'

export default function Skills({ skills, lang, t }) {
  return (
    <section className="pf-section" id="pf-skills" aria-labelledby="pf-skills-title">
      <h2 className="pf-section__title" id="pf-skills-title">
        {t.skillsTitle}
      </h2>
      <p className="pf-section__lead">{t.skillsLead}</p>
      <ul className="pf-skills">
        {skills.map((skill) => (
          <li key={skill.name.en}>
            <span className="pf-skills__name">{skill.name[lang]}</span>
            <LevelMeter value={skill.level} max={5} label={t.skillLevel(skill.level)} className="pf-skills__meter" />
          </li>
        ))}
      </ul>
    </section>
  )
}
