import { COLORS } from '../products.js'

// A product "photo" drawn with CSS: a simple flat shape (scarf, notebook, phone case,
// tote bag or art print) in the product's colour, with details in its accent colour.
// The colours reach the CSS as custom properties, so one stylesheet draws every product.
const ProductVisual = ({ product, label, large = false }) => {
  const colors = {
    '--ws-color': COLORS[product.color].hex,
    '--ws-accent': COLORS[product.accent].hex,
  }

  return (
    <div
      className={`ws-visual ws-visual--${product.category}${large ? ' ws-visual--large' : ''}`}
      style={colors}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
    >
      {product.category === 'prints' ? (
        <span className="ws-visual__item">
          <span className="ws-visual__art" />
        </span>
      ) : (
        <span className="ws-visual__item">
          {product.category === 'cases' && <span className="ws-visual__camera" />}
        </span>
      )}
    </div>
  )
}

export default ProductVisual
