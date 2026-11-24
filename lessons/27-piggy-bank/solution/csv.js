// Turn rows into CSV text and let the browser download it, without any server.

function cell(value) {
  let text = String(value ?? '')
  // Spreadsheet apps run cells that start with = + @ as formulas: neutralise them.
  if (/^[=+@]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows) {
  return rows.map((row) => row.map(cell).join(',')).join('\r\n')
}

export function downloadCsv(filename, rows) {
  // The BOM (﻿) tells Excel the file is UTF-8, so accents like "é" survive.
  const blob = new Blob(['﻿', toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Free the memory once the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
