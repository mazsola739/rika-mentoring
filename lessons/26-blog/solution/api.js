import { createMockApi, MockApiError } from '@shared/mock-api/index.js'
import { SEED_AUTHORS, SEED_COMMENTS, SEED_POSTS } from './posts.js'

// One shared fake backend for every page, with three collections: posts, authors and comments.
// About one request in ten fails on purpose. ('blog-v2': the database of the version without
// authors and comments had another name, so data saved by it cannot hide the new collections.)
export const api = createMockApi('blog-v2', {
  seed: { posts: SEED_POSTS, authors: SEED_AUTHORS, comments: SEED_COMMENTS },
  latency: [300, 800],
  failRate: 0.1,
})

// "POST /login": looks for the author with this name and password. The answer is the author
// without the password; if there is none, an error with status 401.
export async function logIn(name, password) {
  const found = await api.list(
    'authors',
    (author) => author.name.toLowerCase() === name.toLowerCase() && author.password === password,
  )
  if (found.length === 0) throw new MockApiError('Wrong name or password.', 401)
  return { id: found[0].id, name: found[0].name }
}

// Deletes a post together with its comments, so that no comment is left without its post.
export async function deletePost(id) {
  const comments = await api.list('comments', (comment) => comment.postId === id)
  for (const comment of comments) {
    await api.remove('comments', comment.id)
  }
  await api.remove('posts', id)
}

// Seed data stores text as { en, hu }; posts and comments written here are plain strings.
export const tx = (value, lang) => (value && typeof value === 'object' ? value[lang] ?? value.en : value ?? '')
export const isBilingual = (value) => Boolean(value) && typeof value === 'object'
