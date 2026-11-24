// Categories per transaction type. Labels live in text.js under the same keys.
export const CATEGORIES = {
  deposit: [
    { key: 'pocket', icon: '🪙' },
    { key: 'salary', icon: '💼' },
    { key: 'gift', icon: '🎁' },
    { key: 'sale', icon: '🏷️' },
    { key: 'otherIn', icon: '✨' },
  ],
  withdrawal: [
    { key: 'food', icon: '🍎' },
    { key: 'transport', icon: '🚌' },
    { key: 'fun', icon: '🎨' },
    { key: 'shopping', icon: '🛍️' },
    { key: 'bills', icon: '🧾' },
    { key: 'otherOut', icon: '📦' },
  ],
}

export const ALL_CATEGORIES = [...CATEGORIES.deposit, ...CATEGORIES.withdrawal]

export const iconOf = (key) => ALL_CATEGORIES.find((c) => c.key === key)?.icon ?? '•'
