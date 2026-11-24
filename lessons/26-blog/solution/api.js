import { createMockApi } from '@shared/mock-api/index.js'
import { SEED_POSTS } from './posts.js'

// One shared fake backend for every page. About one request in ten fails on purpose.
export const api = createMockApi('blog', { seed: { posts: SEED_POSTS }, latency: [300, 800], failRate: 0.1 })

// Seed posts store text as { en, hu }; posts written here are plain strings.
export const tx = (value, lang) => (value && typeof value === 'object' ? value[lang] ?? value.en : value ?? '')
export const isBilingual = (value) => Boolean(value) && typeof value === 'object'
