import { useEffect, useState } from 'react'
import { logIn as findOrCreateAccount } from './api.js'

const USER_KEY = 'rika:review-rating:user'

function readUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_KEY))
    return saved && typeof saved.id === 'string' ? saved : null
  } catch {
    return null
  }
}

// Who is logged in (an account from the fake server, or null). Kept in localStorage, so a reload keeps you logged in.
export function useAccount() {
  const [user, setUser] = useState(readUser)

  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
      else localStorage.removeItem(USER_KEY)
    } catch {
      // storage blocked: the login lasts for this visit only
    }
  }, [user])

  async function logIn(name) {
    const account = await findOrCreateAccount(name)
    setUser(account)
  }

  function logOut() {
    setUser(null)
  }

  return { user, logIn, logOut }
}
