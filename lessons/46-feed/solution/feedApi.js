import { createMockApi } from '@shared/mock-api/index.js'
import { SEED_COMMENTS, SEED_POSTS } from './seed.js'

// The fake backend fails now and then (failRate), so the optimistic vote can be seen reverting.
const api = createMockApi('feed', {
  seed: { posts: SEED_POSTS, comments: SEED_COMMENTS },
  latency: [300, 800],
  failRate: 0.1,
})

// Reads are retried once before giving up: a common pattern for flaky networks.
async function withRetry(request, retries = 1) {
  try {
    return await request()
  } catch (err) {
    if (retries > 0) return withRetry(request, retries - 1)
    throw err
  }
}

export async function loadFeed() {
  const [posts, comments] = await Promise.all([withRetry(() => api.list('posts')), withRetry(() => api.list('comments'))])
  return { posts, comments }
}

// The server adds the delta to its own current score (like `score = score + 1` in SQL),
// so a failed request never leaves a half-applied vote behind.
export async function vote(postId, delta) {
  const post = await api.get('posts', postId)
  return api.update('posts', postId, { score: post.score + delta })
}

export const createPost = (data) => api.create('posts', { ...data, score: 1, mine: true })
export const createComment = (data) => api.create('comments', { ...data, mine: true })
export const resetFeed = () => api.reset()
