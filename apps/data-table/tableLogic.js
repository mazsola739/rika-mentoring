// Pure functions for the table: no React here, so each step is easy to test and to reason about.
// The pipeline: all users → filter → sort → paginate.

export function filterUsers(users, { query, role, status }, searchTextOf) {
  const q = query.trim().toLocaleLowerCase()
  return users.filter(
    (user) =>
      (role === 'all' || user.role === role) &&
      (status === 'all' || user.status === status) &&
      (!q || searchTextOf(user).includes(q)),
  )
}

// Sorts by the text the user sees (e.g. translated role names), with the id as a stable tie-breaker.
export function sortUsers(users, { key, dir }, valueOf, locale) {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  const sign = dir === 'desc' ? -1 : 1
  return [...users].sort((a, b) => sign * collator.compare(String(valueOf(a, key)), String(valueOf(b, key))) || a.id - b.id)
}

export function paginate(list, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  const start = (current - 1) * pageSize
  const end = Math.min(start + pageSize, list.length)
  return { rows: list.slice(start, end), page: current, pageCount, start, end }
}

// Page numbers to show around the current page, with gaps: [1, '…', 4, 5, 6, '…', 20]
export function pageWindow(page, pageCount) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['gap-' + p, p] : [p]))
}

// ── CSV ─────────────────────────────────────────────────
function csvCell(value) {
  let text = String(value ?? '')
  // A cell starting with = + - @ would run as a formula in spreadsheet apps ("CSV injection").
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows, columns) {
  const lines = [columns.map((c) => csvCell(c.label)), ...rows.map((row) => columns.map((c) => csvCell(c.value(row))))]
  // The BOM tells Excel the file is UTF-8, so accents like "ő" survive.
  return '﻿' + lines.map((cells) => cells.join(',')).join('\r\n')
}

export function downloadText(text, filename, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0) // free the memory once the download has started
}
