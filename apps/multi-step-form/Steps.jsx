import { BIO_MAX, FREQUENCIES, ROLES, TOPICS } from './formSteps.js'
import { Field, FieldError, PasswordInput } from './Field.jsx'

// Every step is a plain presentational component: the wizard owns the state and passes
// `bind(name)` (value + handlers) and `errorFor(name)` (a translated message or undefined).

export function AccountStep({ bind, errorFor, t }) {
  const f = t.fields
  return (
    <div className="msf-grid">
      <Field name="email" label={f.email} error={errorFor('email')} wide>
        {(props) => <input {...props} {...bind('email')} className="input" type="email" autoComplete="email" />}
      </Field>
      <Field name="password" label={f.password} hint={f.passwordHint} error={errorFor('password')}>
        {(props) => <PasswordInput inputProps={props} {...bind('password')} labels={f} autoComplete="new-password" />}
      </Field>
      <Field name="confirm" label={f.confirm} error={errorFor('confirm')}>
        {(props) => <PasswordInput inputProps={props} {...bind('confirm')} labels={f} autoComplete="new-password" />}
      </Field>
    </div>
  )
}

export function ProfileStep({ values, bind, errorFor, t }) {
  const f = t.fields
  return (
    <div className="msf-grid">
      <Field name="fullName" label={f.fullName} error={errorFor('fullName')}>
        {(props) => <input {...props} {...bind('fullName')} className="input" autoComplete="name" />}
      </Field>
      <Field name="username" label={f.username} hint={f.usernameHint} error={errorFor('username')}>
        {(props) => (
          <div className="msf-prefix">
            <span aria-hidden="true">@</span>
            <input {...props} {...bind('username')} className="input" autoComplete="username" autoCapitalize="none" spellCheck={false} />
          </div>
        )}
      </Field>
      <Field name="role" label={f.role} error={errorFor('role')} wide>
        {(props) => (
          <select {...props} {...bind('role')} className="input">
            <option value="">{f.rolePlaceholder}</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {t.roles[role]}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field
        name="bio"
        label={f.bio}
        optional={f.optional}
        hint={`${values.bio.length} / ${BIO_MAX}`}
        error={errorFor('bio')}
        wide
      >
        {(props) => <textarea {...props} {...bind('bio')} className="input msf-textarea" rows={3} />}
      </Field>
    </div>
  )
}

export function PreferencesStep({ values, change, errorFor, t }) {
  const f = t.fields
  const topicsError = errorFor('topics')

  const toggleTopic = (topic) =>
    change('topics', values.topics.includes(topic) ? values.topics.filter((x) => x !== topic) : [...values.topics, topic])

  return (
    <div className="msf-stack">
      <fieldset
        className="msf-group"
        aria-invalid={Boolean(topicsError)}
        aria-describedby={topicsError ? 'msf-topics-error' : undefined}
      >
        <legend>{f.topics}</legend>
        <div className="msf-options">
          {TOPICS.map((topic) => (
            <label key={topic} className="msf-option">
              <input
                type="checkbox"
                name="topics"
                value={topic}
                checked={values.topics.includes(topic)}
                onChange={() => toggleTopic(topic)}
              />
              <span>{t.topics[topic]}</span>
            </label>
          ))}
        </div>
        <FieldError id="msf-topics-error" message={topicsError} />
      </fieldset>

      <fieldset className="msf-group">
        <legend>{f.frequency}</legend>
        <div className="msf-segmented">
          {FREQUENCIES.map((freq) => (
            <label key={freq}>
              <input
                type="radio"
                name="frequency"
                value={freq}
                checked={values.frequency === freq}
                onChange={() => change('frequency', freq)}
              />
              <span>{t.frequencies[freq]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="msf-check">
        <input
          type="checkbox"
          name="reminders"
          checked={values.reminders}
          onChange={(e) => change('reminders', e.target.checked)}
        />
        <span>{f.reminders}</span>
      </label>
    </div>
  )
}

export function ReviewStep({ values, change, errorFor, goTo, t }) {
  const f = t.fields
  const empty = t.review.empty
  const sections = [
    {
      step: 0,
      key: 'account',
      rows: [
        [f.email, values.email],
        [f.password, values.password ? '••••••••' : empty],
      ],
    },
    {
      step: 1,
      key: 'profile',
      rows: [
        [f.fullName, values.fullName],
        [f.username, values.username && `@${values.username}`],
        [f.role, t.roles[values.role]],
        [f.bio, values.bio],
      ],
    },
    {
      step: 2,
      key: 'preferences',
      rows: [
        [f.topics, values.topics.map((topic) => t.topics[topic]).join(', ')],
        [f.frequency, t.frequencies[values.frequency]],
        [f.reminders, values.reminders ? t.review.on : t.review.off],
      ],
    },
  ]
  const agreeError = errorFor('agree')

  return (
    <div className="msf-stack">
      {sections.map((section) => (
        <section key={section.key} className="msf-summary" aria-labelledby={`msf-sum-${section.key}`}>
          <div className="msf-summary__head">
            <h4 id={`msf-sum-${section.key}`}>{t.steps[section.key]}</h4>
            <button
              type="button"
              className="msf-link"
              aria-label={t.review.editSection(t.steps[section.key])}
              onClick={() => goTo(section.step)}
            >
              {t.review.edit}
            </button>
          </div>
          <dl>
            {section.rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || empty}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <div>
        <label className="msf-check">
          <input
            type="checkbox"
            name="agree"
            checked={values.agree}
            aria-invalid={Boolean(agreeError)}
            aria-describedby={agreeError ? 'msf-agree-error' : undefined}
            onChange={(e) => change('agree', e.target.checked)}
          />
          <span>{f.agree}</span>
        </label>
        <FieldError id="msf-agree-error" message={agreeError} />
      </div>
    </div>
  )
}
