import { useCallback, useEffect, useState } from 'react'
import * as feedApi from './feedApi.js'

const VOTES_KEY = 'rika:feed:votes'

function loadVotes() {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY)) ?? {}
  } catch {
    return {}
  }
}

// All feed state in one custom hook: loading, posts, comments, my votes and the actions on them.
export const useFeed = () => {
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [votes, setVotes] = useState(loadVotes) // { [postId]: 1 | -1 }
  const [pending, setPending] = useState({}) // posts with a vote request in flight
  const [voteError, setVoteError] = useState(0) // a counter, so the same message can be announced again
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    setStatus('loading')
    feedApi
      .loadFeed()
      .then((data) => {
        if (ignore) return
        setPosts(data.posts)
        setComments(data.comments)
        setStatus('ready')
      })
      .catch(() => !ignore && setStatus('error'))
    return () => {
      ignore = true
    }
  }, [attempt])

  useEffect(() => {
    try {
      localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
    } catch {
      // votes still work for this visit
    }
  }, [votes])

  // Optimistic update: change the UI first, then tell the server. If the server fails, undo.
  // `previous` is my current vote on the post (the buttons are disabled while a request is in flight).
  const vote = useCallback(async (postId, direction, previous = 0) => {
    const next = previous === direction ? 0 : direction // clicking the same arrow again removes the vote
    const delta = next - previous
    const applyDelta = (d) => setPosts((list) => list.map((p) => (p.id === postId ? { ...p, score: p.score + d } : p)))

    applyDelta(delta)
    setVotes((v) => ({ ...v, [postId]: next }))
    setPending((p) => ({ ...p, [postId]: true }))
    try {
      await feedApi.vote(postId, delta)
    } catch {
      applyDelta(-delta)
      setVotes((v) => ({ ...v, [postId]: previous }))
      setVoteError((n) => n + 1)
    } finally {
      setPending((p) => ({ ...p, [postId]: false }))
    }
  }, [])

  const addPost = useCallback(async (data) => {
    const post = await feedApi.createPost(data)
    setPosts((list) => [post, ...list])
    setVotes((v) => ({ ...v, [post.id]: 1 })) // your own post starts with your upvote, like on Reddit
    return post
  }, [])

  const addComment = useCallback(async (data) => {
    const comment = await feedApi.createComment(data)
    setComments((list) => [...list, comment])
    return comment
  }, [])

  const reset = useCallback(() => {
    feedApi.resetFeed()
    setVotes({})
    setAttempt((n) => n + 1)
  }, [])

  return {
    status,
    posts,
    comments,
    votes,
    pending,
    voteError,
    vote,
    addPost,
    addComment,
    reset,
    retry: () => setAttempt((n) => n + 1),
  }
}
