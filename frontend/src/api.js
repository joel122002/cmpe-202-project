const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export async function api(path, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error?.message || 'Request failed')
  return payload.data
}
