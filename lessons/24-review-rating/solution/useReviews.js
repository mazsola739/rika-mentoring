import { useEffect, useState } from 'react'
import { api } from './api.js'

// All review data lives here, so the list page and the detail page share one source of truth.
export function useReviews() {
  const [state, setState] = useState({ status: 'loading', reviews: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  const [pending, setPending] = useState([]) // ids of reviews whose change is on its way to the server

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

  const reload = () => {
    setState((s) => ({ ...s, status: 'loading' }))
    setAttempt((a) => a + 1)
  }

  const resetDemo = () => {
    api.reset()
    reload()
  }

  const addReview = async (data) => {
    const created = await api.create('reviews', { ...data, helpfulBy: [] })
    setState((s) => ({ ...s, reviews: [...s.reviews, created] }))
    return created
  }

  const replaceReview = (changed) =>
    setState((s) => ({ ...s, reviews: s.reviews.map((r) => (r.id === changed.id ? changed : r)) }))

  // Optimistic update: the change shows at once, and is rolled back if the request fails.
  const changeReview = async (review, changes) => {
    setPending((p) => [...p, review.id])
    replaceReview({ ...review, ...changes })
    try {
      await api.update('reviews', review.id, changes)
    } catch (err) {
      replaceReview(review)
      throw err
    } finally {
      setPending((p) => p.filter((id) => id !== review.id))
    }
  }

  // Votes belong to accounts: helpfulBy holds the ids of the accounts that found the review helpful.
  const toggleHelpful = (review, userId) => {
    const votes = review.helpfulBy ?? []
    const helpfulBy = votes.includes(userId) ? votes.filter((id) => id !== userId) : [...votes, userId]
    return changeReview(review, { helpfulBy })
  }

  // Moderation: a hidden review stays on the server, but only the moderator sees it.
  const setHidden = (review, hidden) => changeReview(review, { hidden })

  return { ...state, reload, resetDemo, addReview, pending, toggleHelpful, setHidden }
}
