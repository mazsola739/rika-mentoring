// The reading statistics, worked out from the books. A pure function: the same books always give the same numbers.
export function readingStats(books, year) {
  const read = books.filter((book) => book.shelf === 'read')
  // Books that were on "Read" before finish dates were kept have no finishedAt: they count only in the total.
  const readThisYear = read.filter((book) => book.finishedAt && new Date(book.finishedAt).getFullYear() === year)
  const rated = read.filter((book) => book.rating > 0)
  const ratingSum = rated.reduce((sum, book) => sum + book.rating, 0)

  return {
    total: books.length,
    read: read.length,
    readThisYear: readThisYear.length,
    averageRating: rated.length > 0 ? ratingSum / rated.length : null,
  }
}
