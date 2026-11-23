import { useText } from '@shared/i18n.js'
import { pageWindow } from './tableLogic.js'
import { TEXT } from './text.js'

export const PAGE_SIZES = [10, 25, 50, 100]

export default function Pagination({ page, pageCount, start, end, total, pageSize, format, onPage, onPageSize }) {
  const t = useText(TEXT)

  return (
    <nav className="dt-pager" aria-label={t.pagination}>
      <p className="dt-pager__range">{total > 0 ? t.range(format(start + 1), format(end), format(total)) : t.range(0, 0, 0)}</p>

      <label className="dt-pager__size">
        <span>{t.perPage}</span>
        <select className="dt-select" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <div className="dt-pager__pages">
        <button type="button" className="dt-page" aria-label={t.prev} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <span aria-hidden="true">‹</span>
        </button>
        <span className="dt-pager__of">{t.pageOf(page, pageCount)}</span>
        <ol className="dt-pager__list">
          {pageWindow(page, pageCount).map((p) =>
            typeof p === 'string' ? (
              <li key={p} className="dt-gap" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  className="dt-page"
                  aria-label={t.page(p)}
                  aria-current={p === page ? 'page' : undefined}
                  onClick={() => onPage(p)}
                >
                  {p}
                </button>
              </li>
            ),
          )}
        </ol>
        <button type="button" className="dt-page" aria-label={t.next} disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </nav>
  )
}
