import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage.js'

export const REMIND_DAYS = 3
const SENT_KEY = 'rika:subscriptions:notified'
const supported = typeof window !== 'undefined' && 'Notification' in window

function readSent() {
  try {
    const list = JSON.parse(localStorage.getItem(SENT_KEY))
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function notify(title, body, tag) {
  try {
    new Notification(title, { body, tag })
    return true
  } catch {
    // Some mobile browsers only allow notifications from a service worker.
    return false
  }
}

// Browser notifications for renewals coming up within REMIND_DAYS.
// `upcoming` is a list of { id, nextDate, title, body } prepared by the caller.
export function useReminders(upcoming) {
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported')
  const [enabled, setEnabled] = useLocalStorage('rika:subscriptions:reminders', false)
  const active = enabled && permission === 'granted'

  useEffect(() => {
    if (!active) return
    const check = () => {
      const sent = readSent()
      upcoming.forEach((item) => {
        // One notification per subscription *and* renewal date, even across reloads.
        const tag = `${item.id}:${item.nextDate}`
        if (!sent.includes(tag) && notify(item.title, item.body, tag)) sent.push(tag)
      })
      try {
        localStorage.setItem(SENT_KEY, JSON.stringify(sent.slice(-100)))
      } catch {
        // ignore
      }
    }
    check()
    // While the tab stays open, look again every hour (e.g. after midnight).
    const timer = setInterval(check, 60 * 60 * 1000)
    return () => clearInterval(timer)
  }, [active, upcoming])

  const enable = async () => {
    if (!supported) return
    const result = await Notification.requestPermission()
    setPermission(result)
    setEnabled(result === 'granted')
  }

  const disable = () => setEnabled(false)

  const test = (title, body) => notify(title, body, 'rika-subscriptions-test')

  return { supported, permission, active, enable, disable, test }
}
