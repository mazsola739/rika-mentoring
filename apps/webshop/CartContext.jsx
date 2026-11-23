import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { cartReducer, cartTotals } from './cartReducer.js'
import { productById } from './products.js'

const STORAGE_KEY = 'rika:webshop:cart'

// Only keep lines that still point to a real product (the catalogue may change).
const sanitize = (lines) =>
  Array.isArray(lines) ? lines.filter((l) => l && productById(l.id) && Number.isInteger(l.qty) && l.qty > 0) : []

function loadCart() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)))
  } catch {
    return []
  }
}

const CartContext = createContext(null)

// Global cart state: any component under <CartProvider> can read or change the cart,
// without passing props through every level (no "prop drilling").
export function CartProvider({ children }) {
  // The third argument is a lazy initializer: localStorage is read only once, on the first render.
  const [lines, dispatch] = useReducer(cartReducer, undefined, loadCart)

  // Persist after every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // storage full or blocked: the cart still works in memory
    }
  }, [lines])

  // Keep several open tabs in sync: the `storage` event fires in the *other* tabs.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return
      try {
        dispatch({ type: 'replace', lines: sanitize(JSON.parse(event.newValue)) })
      } catch {
        // ignore malformed data
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // useMemo keeps the same value object between renders unless the cart changed,
  // so consumers do not re-render for nothing.
  const value = useMemo(() => {
    const items = lines.map((line) => ({ ...line, product: productById(line.id) }))
    return {
      items,
      ...cartTotals(items),
      qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
      add: (id, qty = 1) => dispatch({ type: 'add', id, qty }),
      setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    }
  }, [lines])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside <CartProvider>')
  return cart
}
