import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUser, getToken, guestLogin, verifyToken, logout as apiLogout, setUser as storeUser } from '../lib/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const token = getToken()
      const stored = getUser()
      if (token && stored) {
        try {
          const r = await verifyToken()
          setUser(r.valid ? r.user : null)
          if (!r.valid) apiLogout()
        } catch {
          setUser(stored) // offline fallback
        }
      }
      setLoading(false)
    })()
  }, [])

  const loginGuest = async () => {
    try {
      const d = await guestLogin()
      setUser(d.user)
      return d
    } catch {
      // Fully offline fallback
      const id = 'local-' + Date.now()
      const u = { id, name: 'Guest Player', isGuest: true, isLocal: true }
      storeUser(u)
      setUser(u)
      return { user: u }
    }
  }

  const logout = () => { apiLogout(); setUser(null) }

  return <Ctx.Provider value={{ user, loading, loginGuest, logout, setUser }}>{children}</Ctx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
