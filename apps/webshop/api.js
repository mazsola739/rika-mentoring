import { createMockApi } from '@shared/mock-api/index.js'

// Fake order backend: real-looking latency, and about every sixth request fails on purpose,
// so the error handling of the checkout can be seen and practised.
export const api = createMockApi('webshop', { latency: [500, 1200], failRate: 0.17 })
