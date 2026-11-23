import { useLang } from '@shared/i18n.js'
import { errorKind, useFetch } from '../useFetch.js'
import { bookUrl, toDetails } from '../bookApi.js'

// "fr" → "French" / "francia", from the browser's own list of language names.
function languageName(code, lang) {
  try {
    return new Intl.DisplayNames([lang], { type: 'language' }).of(code)
  } catch {
    return code
  }
}

// More about one book, loaded only when it is opened. The language is part of the URL,
// so switching the language loads the description again in the other language.
export default function BookDetails({ id, t }) {
  const lang = useLang()
  const { status, data, error, retry } = useFetch(bookUrl(id, lang))

  if (status === 'loading') {
    return (
      <p className="bl-details bl-details--loading" role="status">
        {t.detailsLoading}
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="bl-details bl-details--error" role="alert">
        <p>{error?.status === 404 ? t.detailsMissing : t.errors[errorKind(error)]}</p>
        {error?.status !== 404 && (
          <button type="button" className="bl-move" onClick={retry}>
            {t.retry}
          </button>
        )}
      </div>
    )
  }

  if (status !== 'success') return null
  const book = toDetails(data)
  const number = new Intl.NumberFormat(lang === 'hu' ? 'hu-HU' : 'en-GB')
  const facts = [
    [t.firstPublished, book.year],
    [t.pages, book.pages && number.format(book.pages)],
    [t.language, book.language && languageName(book.language, lang)],
    [t.otherTitles, book.otherTitles.join(' · ')],
  ].filter(([, value]) => value)

  return (
    <div className="bl-details">
      {book.description && <p className="bl-details__text">{book.description}</p>}
      <dl className="bl-details__facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {book.subjects.length > 0 && (
        <ul className="bl-details__subjects" aria-label={t.subjects}>
          {book.subjects.map((subject) => (
            <li key={subject}>{subject}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
