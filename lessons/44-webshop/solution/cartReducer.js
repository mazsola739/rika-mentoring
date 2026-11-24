// The cart is a pure reducer: (state, action) => new state. No side effects here,
// so it is easy to test and the same action always gives the same result.
// We only store `{ id, qty }` per line; names and prices come from the catalogue.

export const MAX_QTY = 10

const clampQty = (qty) => Math.max(1, Math.min(MAX_QTY, Math.round(qty) || 1))

export function cartReducer(lines, action) {
  switch (action.type) {
    case 'add': {
      const existing = lines.find((line) => line.id === action.id)
      if (existing) {
        return lines.map((line) => (line.id === action.id ? { ...line, qty: clampQty(line.qty + action.qty) } : line))
      }
      return [...lines, { id: action.id, qty: clampQty(action.qty) }]
    }
    case 'setQty':
      return lines.map((line) => (line.id === action.id ? { ...line, qty: clampQty(action.qty) } : line))
    case 'remove':
      return lines.filter((line) => line.id !== action.id)
    case 'clear':
      return []
    case 'replace':
      // Used when another browser tab changed the cart.
      return action.lines
    default:
      throw new Error(`Unknown cart action: ${action.type}`)
  }
}

// Shipping rule of the demo store: free from €60, otherwise a flat fee.
export const FREE_SHIPPING_FROM = 60
export const SHIPPING_FEE = 4.9

export function cartTotals(items) {
  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.product.price, 0)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
  return { count, subtotal, shipping, total: subtotal + shipping }
}
