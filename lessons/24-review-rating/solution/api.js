import { createMockApi } from '@shared/mock-api/index.js'
import { SEED_REVIEWS, SEED_USERS } from './products.js'

// Fake REST backend: reviews and accounts. About one request in ten fails on purpose.
// (v2: the data now has accounts, votes per account and hidden reviews, so it starts from a fresh seed.)
export const api = createMockApi('review-rating-v2', {
  seed: { reviews: SEED_REVIEWS, users: SEED_USERS },
  latency: [400, 900],
  failRate: 0.1,
})

// Names match without capitals and accents: "moderátor" finds the "Moderator" account.
function plainName(name) {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Pretend login: finds the account with this name, or opens a new customer account. There is no password.
export async function logIn(name) {
  const found = await api.list('users', (user) => plainName(user.name) === plainName(name))
  if (found.length > 0) return found[0]
  return api.create('users', { name: name.trim(), role: 'customer' })
}
