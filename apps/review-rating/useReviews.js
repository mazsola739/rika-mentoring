import { useEffect, useState } from 'react'
import { createMockApi } from '@shared/mock-api/index.js'
import { SEED_REVIEWS } from './products.js'

// Fake REST backend with seed data; about one request in ten fails on purpose.
const api = createMockApi('review-rating', { seed: { reviews: SEED_REVIEWS }, latency: [400, 900], failRate: 0.1 })

const VOTES_KEY = 'rika:review-rating:helpful'

function readVotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(VOTES_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// All review data lives here, so the list page and the detail page share one source of truth.
export function useReviews() {
  const [state, setState] = useState({ status: 'loading', reviews: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  const [votes, setVotes] = useState(readVotes) // ids this browser found helpful
  const [pending, setPending] = useState([])

  useEffect(() => {
    let ignore = false // a late answer after unmount (or a newer request) must not overwrite state
    api.list('reviews').then(
      (reviews) => !ignore && setState({ status: 'ready', reviews, error: '' }),
      (err) => !ignore && setState({ status: 'error', reviews: [], error: err.message }),
    )
    return () => {
      ignore = true
    }
  }, [attempt])

  useEffect(() => {
    try {
      localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
    } catch {
      // storage blocked: votes are kept for this visit only
    }
  }, [votes])

  const reload = () => {
    setState((s) => ({ ...s, status: 'loading' }))
    setAttempt((a) => a + 1)
  }

  const resetDemo = () => {
    api.reset()
    setVotes([])
    reload()
  }

  const addReview = async (data) => {
    const created = await api.create('reviews', { ...data, helpful: 0 })
    setState((s) => ({ ...s, reviews: [...s.reviews, created] }))
    return created
  }

  const patchHelpful = (id, delta) =>
    setState((s) => ({
      ...s,
      reviews: s.reviews.map((r) => (r.id === id ? { ...r, helpful: Math.max(0, (r.helpful ?? 0) + delta) } : r)),
    }))

  // Optimistic update: the counter changes at once, and rolls back if the request fails.
  const toggleHelpful = async (review) => {
    const voted = votes.includes(review.id)
    const delta = voted ? -1 : 1
    setPending((p) => [...p, review.id])
    patchHelpful(review.id, delta)
    setVotes((v) => (voted ? v.filter((id) => id !== review.id) : [...v, review.id]))
    try {
      await api.update('reviews', review.id, { helpful: Math.max(0, (review.helpful ?? 0) + delta) })
    } catch (err) {
      patchHelpful(review.id, -delta)
      setVotes((v) => (voted ? [...v, review.id] : v.filter((id) => id !== review.id)))
      throw err
    } finally {
      setPending((p) => p.filter((id) => id !== review.id))
    }
  }

  return { ...state, reload, resetDemo, addReview, votes, pending, toggleHelpful }
}
