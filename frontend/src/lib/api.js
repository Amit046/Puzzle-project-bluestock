const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const getToken  = () => localStorage.getItem('pd_token')
export const setToken  = t  => localStorage.setItem('pd_token', t)
export const getUser   = () => { try { return JSON.parse(localStorage.getItem('pd_user')) } catch { return null } }
export const setUser   = u  => localStorage.setItem('pd_user', JSON.stringify(u))
export const clearAuth = () => { localStorage.removeItem('pd_token'); localStorage.removeItem('pd_user') }
export const isOnline  = () => navigator.onLine

async function req(path, opts = {}) {
  const token = getToken()
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers }
  })
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed') }
  return res.json()
}

export async function guestLogin() {
  const d = await req('/api/auth/guest', { method: 'POST' })
  setToken(d.token); setUser(d.user)
  return d
}
export async function googleLogin(idToken) {
  const d = await req('/api/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) })
  setToken(d.token); setUser(d.user)
  return d
}
export async function verifyToken() { return req('/api/auth/verify') }
export function logout() { clearAuth() }

export async function syncScores(entries) {
  return req('/api/sync/daily-scores', { method: 'POST', body: JSON.stringify({ entries }) })
}

export function onOnline(cb)  { window.addEventListener('online', cb);  return () => window.removeEventListener('online', cb) }
export function onOffline(cb) { window.addEventListener('offline', cb); return () => window.removeEventListener('offline', cb) }
