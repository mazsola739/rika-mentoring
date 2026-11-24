import { toISODate } from './money.js'

// [months ago, day, type, cents, category, note]
const SAMPLE = [
  [5, 1, 'deposit', 4000, 'pocket', { en: 'Monthly pocket money', hu: 'Havi zsebpénz' }],
  [5, 9, 'withdrawal', 650, 'food', { en: 'Ice cream with friends', hu: 'Fagyi a barátokkal' }],
  [5, 20, 'withdrawal', 1200, 'fun', { en: 'Cinema', hu: 'Mozi' }],
  [4, 1, 'deposit', 4000, 'pocket', { en: 'Monthly pocket money', hu: 'Havi zsebpénz' }],
  [4, 12, 'deposit', 2500, 'gift', { en: 'Birthday money from Grandma', hu: 'Szülinapi pénz a nagyitól' }],
  [4, 15, 'withdrawal', 800, 'transport', { en: 'Bus pass top-up', hu: 'Bérletfeltöltés' }],
  [4, 23, 'withdrawal', 1890, 'shopping', { en: 'Sketchbook and pens', hu: 'Vázlatfüzet és tollak' }],
  [3, 1, 'deposit', 4000, 'pocket', { en: 'Monthly pocket money', hu: 'Havi zsebpénz' }],
  [3, 6, 'deposit', 1500, 'sale', { en: 'Sold my old comics', hu: 'Eladtam a régi képregényeimet' }],
  [3, 14, 'withdrawal', 920, 'food', { en: 'Pizza night', hu: 'Pizzaest' }],
  [3, 27, 'withdrawal', 2200, 'fun', { en: 'Concert ticket', hu: 'Koncertjegy' }],
  [2, 1, 'deposit', 4000, 'pocket', { en: 'Monthly pocket money', hu: 'Havi zsebpénz' }],
  [2, 10, 'deposit', 6000, 'salary', { en: 'Babysitting', hu: 'Bébiszitterkedés' }],
  [2, 11, 'withdrawal', 999, 'bills', { en: 'Phone credit', hu: 'Telefonegyenleg' }],
  [2, 18, 'withdrawal', 3450, 'shopping', { en: 'Trainers on sale', hu: 'Leárazott sportcipő' }],
  [1, 1, 'deposit', 4000, 'pocket', { en: 'Monthly pocket money', hu: 'Havi zsebpénz' }],
  [1, 5, 'deposit', 2000, 'gift', { en: 'Name day gift', hu: 'Névnapi ajándék' }],
  [1, 15, 'withdrawal', 800, 'transport', { en: 'Bus pass top-up', hu: 'Bérletfeltöltés' }],
  [1, 16, 'withdrawal', 740, 'food', { en: 'Bubble tea', hu: 'Bubble tea' }],
  [1, 24, 'withdrawal', 1500, 'fun', { en: 'Board game café', hu: 'Társasjáték-kávézó' }],
  [0, 1, 'deposit', 4000, 'pocket', { en: 'Monthly pocket money', hu: 'Havi zsebpénz' }],
  [0, 3, 'withdrawal', 480, 'food', { en: 'Bakery', hu: 'Pékség' }],
]

// Sample data is built relative to today, so the chart always has recent months to show.
export function createSampleWallet(today = new Date()) {
  const transactions = SAMPLE.map(([monthsAgo, day, type, amount, category, note], i) => {
    const lastDay = new Date(today.getFullYear(), today.getMonth() - monthsAgo + 1, 0).getDate()
    const date = new Date(today.getFullYear(), today.getMonth() - monthsAgo, Math.min(day, lastDay))
    return { id: `sample-${i}`, type, amount, category, date: toISODate(date), note, createdAt: i }
  }).filter((t) => t.date <= toISODate(today))

  return { transactions, goal: { name: { en: 'New bike', hu: 'Új bicikli' }, target: 30000 } }
}
