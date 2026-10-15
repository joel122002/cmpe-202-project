import { useState } from 'react'
import { api, readSearchPreferences, saveSearchPreferences } from './api'

export default function SearchForm({ onResults }) {
  const [form, setForm] = useState(readSearchPreferences())
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    saveSearchPreferences(form)
    try {
      onResults(await api(`/search/listings?${new URLSearchParams(form).toString()}`))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return <form onSubmit={submit}>{error && <p role="alert">{error}</p>}<input type="date" value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} required /><input type="date" value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} required /><input type="number" min="1" value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} required /><button type="submit">Search</button></form>
}
