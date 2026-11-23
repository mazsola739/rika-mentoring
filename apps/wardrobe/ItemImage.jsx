import { colorByKey } from './data.js'
import CategoryIcon from './CategoryIcon.jsx'

// An uploaded photo, or — when there is none — a flat tile with the category icon in the item's color.
// Older saved samples may still carry a `pattern` key; it is simply ignored and they get a tile too.
export default function ItemImage({ item, alt = '', className = '' }) {
  const classes = `wr-img ${className}`
  if (item.photo) return <img className={classes} src={item.photo} alt={alt} loading="lazy" />

  const color = colorByKey(item.color)
  const multi = color.key === 'multi'
  return (
    <span
      className={`${classes} wr-img--tile${multi ? ' is-multi' : ''}`}
      // A CSS variable carries the color, so the stylesheet can tint the tile and fill the icon with it.
      style={multi ? undefined : { '--wr-item': color.hex }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <CategoryIcon category={item.category} multi={multi} />
    </span>
  )
}
