import { useState } from 'react'
import { api } from './api'

export default function ReviewForm({ bookingId, onSubmitted }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    try {
      await api(`/bookings/${bookingId}/review`, { method: 'POST', body: JSON.stringify({ rating, comment }) })
      onSubmitted()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return <form onSubmit={submit}>{error && <p role="alert">{error}</p>}<input type="number" min="1" max="5" value={rating} onChange={(event) => setRating(Number(event.target.value))} /><textarea value={comment} onChange={(event) => setComment(event.target.value)} required /><button type="submit">Submit review</button></form>
}
