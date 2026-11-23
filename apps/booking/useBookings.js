import { useCallback, useEffect, useState } from 'react'
import { cancelBooking, createBooking, listBookings } from './bookingApi.js'

// Loads all bookings from the fake server and offers create / cancel.
// Free and busy slots are *derived* from this list, never stored separately.
export const useBookings = () => {
  const [bookings, setBookings] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading')) // keep showing old data while refreshing
    listBookings()
      .then((list) => {
        if (ignore) return
        setBookings(list)
        setStatus('ready')
      })
      .catch(() => !ignore && setStatus((s) => (s === 'ready' ? 'ready' : 'error')))
    return () => {
      ignore = true
    }
  }, [attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  const create = useCallback(async (booking) => {
    const saved = await createBooking(booking)
    setBookings((list) => [...list, saved])
    return saved
  }, [])

  const cancel = useCallback(async (id) => {
    await cancelBooking(id)
    setBookings((list) => list.filter((b) => b.id !== id))
  }, [])

  return { bookings, status, reload, create, cancel }
}
