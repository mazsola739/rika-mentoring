import { useMemo } from 'react'
import { renderMarkdown } from './markdown.js'

// dangerouslySetInnerHTML is only acceptable because renderMarkdown escapes all HTML first
// and then adds a fixed set of tags itself. Never pass unescaped user text here.
export default function Markdown({ source, className = '' }) {
  const html = useMemo(() => renderMarkdown(source), [source])
  return <div className={`bl-md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
