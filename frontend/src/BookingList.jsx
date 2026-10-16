import { useEffect, useState } from 'react'
import { api } from './api'

export default function BookingList() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/bookings').then(setBookings).catch((requestError) => setError(requestError.message))
  }, [])

  async function cancel(bookingId) {
    await api(`/bookings/${bookingId}/cancel`, { method: 'POST' })
    setBookings(bookings.map((booking) => booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking))
  }

  if (error) return <p role="alert">{error}</p>
  return <section className="panel"><h1>Your bookings</h1>{bookings.map((booking) => <article className="card" key={booking.id}><h2>{booking.listingName}</h2><p>{booking.checkIn} to {booking.checkOut}</p>{booking.status === 'CONFIRMED' && <button onClick={() => cancel(booking.id)}>Cancel</button>}</article>)}</section>
}
