const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const SEARCH_PREFERENCES_KEY = 'searchPreferences'

export async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error?.message || 'Request failed')
  return payload.data
}

export function saveSession(auth) {
  localStorage.setItem('token', auth.token)
  localStorage.setItem('user', JSON.stringify(auth.user))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function readSession() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function saveSearchPreferences(preferences) {
  sessionStorage.setItem(SEARCH_PREFERENCES_KEY, JSON.stringify({
    checkIn: preferences.checkIn,
    checkOut: preferences.checkOut,
    guests: Number(preferences.guests) || 2,
  }))
}

export function readSearchPreferences() {
  try {
    const preferences = JSON.parse(sessionStorage.getItem(SEARCH_PREFERENCES_KEY))
    return {
      checkIn: preferences?.checkIn || '',
      checkOut: preferences?.checkOut || '',
      guests: Number(preferences?.guests) || 2,
    }
  } catch {
    return { checkIn: '', checkOut: '', guests: 2 }
  }
}
