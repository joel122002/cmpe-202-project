import { useState } from 'react'
import { api } from './api'

export default function BookingForm({ listingId, preferences, onBooked }) {
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    try {
      await api('/bookings', { method: 'POST', body: JSON.stringify({ listingId, ...preferences }) })
      onBooked()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return <form onSubmit={submit}>{error && <p role="alert">{error}</p>}<button type="submit">Confirm booking</button></form>
}
