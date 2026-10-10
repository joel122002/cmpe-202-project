import { useEffect, useState } from 'react'
import { api } from './api'

export default function BookingList() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/bookings').then(setBookings).catch((requestError) => setError(requestError.message))
  }, [])

  if (error) return <p role="alert">{error}</p>
  return <section className="panel"><h1>Your bookings</h1>{bookings.map((booking) => <article className="card" key={booking.id}><h2>{booking.listingName}</h2><p>{booking.checkIn} to {booking.checkOut}</p></article>)}</section>
}
