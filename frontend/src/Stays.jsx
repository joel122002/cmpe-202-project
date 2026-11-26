import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, readSearchPreferences, saveSearchPreferences } from './api'
import { ConfirmDialog, displayDate, Message, price, PropertyPhoto, Status } from './Ui'

export function ListingPage({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)
  const [form, setForm] = useState(readSearchPreferences)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setDetails(null)
    setActivePhoto(0)
    setError('')
    Promise.all([api(`/listings/${id}`, { signal: controller.signal }), api(`/listings/${id}/reviews`, { signal: controller.signal })])
      .then(([listing, reviews]) => setDetails({ listing, reviews }))
      .catch(err => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [id])
  useEffect(() => { saveSearchPreferences(form) }, [form.checkIn, form.checkOut, form.guests])

  async function book(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/bookings', { method: 'POST', body: JSON.stringify({ listingId: id, checkIn: form.checkIn, checkOut: form.checkOut, guests: Number(form.guests) }) })
      navigate('/bookings')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  if (!details) return <div className="property-loading"><Link className="back-link" to="/search">← Back to search</Link><Message error={error} />{!error && <><p role="status">Getting your stay ready…</p><div className="property-photo-skeleton" /></>}</div>
  const { listing, reviews } = details
  const hasCoordinates = Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude)
  const address = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zipCode}`
  const query = hasCoordinates ? `${listing.latitude},${listing.longitude}` : address
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  const nights = Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
  const validStay = nights > 0 && nights <= 14
  const photos = [...new Set(listing.photoUrls.filter(Boolean))]
  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : null
  const reviewLabel = reviews.length ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}` : 'No reviews yet'

  return <article className="property-page">
    <div className="property-breadcrumb"><Link to="/search">← All stays</Link><span aria-hidden="true">/</span><span>{listing.city}, {listing.state}</span></div>
    <header className="property-heading">
      <div><p className="eyebrow">Make yourself at home</p><h1>{listing.name}</h1><a className="property-address" href="#property-location"><span aria-hidden="true">⌖</span> {address}</a></div>
      <a className="property-rating" href="#property-reviews"><span aria-hidden="true">★</span><div><strong>{average || 'No rating yet'}</strong><small>{reviewLabel}</small></div></a>
    </header>

    <section className="property-gallery" id="property-photos" aria-label="Property photos">
      <div className="property-cover">
        <PropertyPhoto src={photos[activePhoto]} className="property-cover-photo" loading="eager" alt={`${listing.name}, photo ${activePhoto + 1}`} />
        {photos.length > 0 && <span className="property-photo-count">{activePhoto + 1} / {photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>}
        {photos.length > 1 && <div className="property-gallery-controls"><button aria-label="Previous property photo" onClick={() => setActivePhoto(index => (index + photos.length - 1) % photos.length)}>←</button><button aria-label="Next property photo" onClick={() => setActivePhoto(index => (index + 1) % photos.length)}>→</button></div>}
      </div>
      {photos.length > 1 && <div className="property-thumbnails" aria-label="Choose a property photo">
        {photos.map((src, index) => <button key={src} aria-label={`View property photo ${index + 1}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}><PropertyPhoto src={src} /></button>)}
      </div>}
    </section>

    <div className="property-tabs" aria-label="Property sections"><a href="#property-about">Overview</a><a href="#property-location">Location</a><a href="#property-reviews">Reviews <span>{reviews.length}</span></a></div>
    <div className="property-layout">
      <div className="property-information">
        <section className="property-section" id="property-about">
          <div className="property-overview-intro">
            <div className="property-overview-title">
              <div><p className="eyebrow">About your stay</p><h2>At home in {listing.city}.</h2></div>
              <span className="property-overview-emblem" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7M16 4V2h3v4" /></svg></span>
            </div>
            <p className="property-description">{listing.description}</p>
          </div>
          <dl className="property-facts">
            <div><dt><span className="property-fact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2" /></svg></span>Group size</dt><dd>{listing.maxGuests} {listing.maxGuests === 1 ? 'guest' : 'guests'}<small>Maximum occupancy</small></dd></div>
            <div><dt><span className="property-fact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 5h3m3 0h2" /></svg></span>Stay length</dt><dd>1–14 nights<small>A short stay, your way</small></dd></div>
            <div><dt><span className="property-fact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg></span>Location</dt><dd>{listing.city}<small>{listing.state} · {listing.zipCode}</small></dd></div>
          </dl>
        </section>

        <section className="property-section" id="property-location">
          <div className="property-section-heading"><div><p className="eyebrow">Get to know the area</p><h2>Where you’ll be</h2></div><a className="map-link" href={mapLink} target="_blank" rel="noreferrer">Open map ↗</a></div>
          <p className="property-location-address">{address}</p>
          {hasCoordinates ? <iframe className="map property-map" title="Listing location" src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`} loading="lazy" />
            : <div className="property-map-fallback"><span aria-hidden="true">⌖</span><h3>Explore the neighborhood</h3><p>View this property’s address in Google Maps.</p><a className="button" href={mapLink} target="_blank" rel="noreferrer">Open in Google Maps ↗</a></div>}
        </section>

        <section className="property-section" id="property-reviews">
          <div className="property-section-heading"><div><p className="eyebrow">From the people who stayed</p><h2>Guest reviews <span className="property-review-count">{reviews.length}</span></h2></div>{average && <div className="property-review-score"><span aria-hidden="true">★</span> {average}<small> / 5</small></div>}</div>
          {reviews.length ? <>
            <div className="review-summary" aria-label="Guest rating summary">
              <div className="review-summary-score"><strong>{average}</strong><span>Overall rating</span><small>Based on {reviewLabel}</small></div>
              <div className="review-distribution" aria-label="Rating breakdown">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = reviews.filter(review => review.rating === rating).length
                  return <div className="review-distribution-row" key={rating} role="img" aria-label={`${rating} stars: ${count} ${count === 1 ? 'review' : 'reviews'}`}><span aria-hidden="true">{rating} ★</span><span className="review-distribution-track" aria-hidden="true"><span style={{ width: `${count / reviews.length * 100}%` }} /></span><span aria-hidden="true">{count}</span></div>
                })}
              </div>
            </div>
            <div className="property-review-grid">{reviews.map(review => <article className="property-review" key={review.id}>
              <div className="property-review-top">
                <span className="property-review-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map(star => <svg key={star} className={star > review.rating ? 'is-empty' : undefined} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1Z" /></svg>)}</span>
                <span className="property-review-rating">{review.rating.toFixed(1)}<small>/ 5</small></span>
              </div>
              <span className="property-review-quote" aria-hidden="true">“</span>
              <blockquote className={!review.comment ? 'is-rating-only' : undefined}>{review.comment || 'This guest shared a rating without a written review.'}</blockquote>
              <footer className="property-review-footer"><span className="property-review-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg></span><div><strong>Guest review</strong><small>Experience at this property</small></div></footer>
            </article>)}</div>
          </> : <div className="property-no-reviews"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 10h30a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H22L11 44v-7H9a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4Z" /><path d="m24 16 2.1 4.3 4.8.7-3.5 3.4.8 4.8-4.2-2.3-4.2 2.3.8-4.8-3.5-3.4 4.8-.7Z" /></svg><div><h3>The first review starts with a stay.</h3><p>No reviews yet. After your visit, share the details that made this place yours.</p></div></div>}

        </section>
      </div>
      <aside className="property-booking" aria-labelledby="booking-title">
        <div className="property-booking-price"><strong>{price(listing.pricePerNightCents)}</strong><span>/ night</span></div>
        <h2 id="booking-title">Make this your next stay.</h2><p className="property-booking-intro">Choose your dates. Bring your people.</p>
        {user?.role === 'CUSTOMER' ? <form className="property-booking-form" onSubmit={book}>
          <div className="property-booking-dates">
            <label>Check-in<input type="date" required value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} /></label>
            <label>Check-out<input type="date" min={form.checkIn || undefined} required value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} /></label>
          </div>
          <label>Guests<input type="number" min="1" max={listing.maxGuests} required value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} /></label>
          {validStay ? <div className="property-cost"><div><span>{price(listing.pricePerNightCents)} × {nights} {nights === 1 ? 'night' : 'nights'}</span><span>{price(nights * listing.pricePerNightCents)}</span></div><div className="property-cost-total"><strong>Total for your stay</strong><strong>{price(nights * listing.pricePerNightCents)} total</strong></div></div> : <p className="property-date-hint">Select a stay of 1–14 nights to see your total.</p>}
          {form.checkIn && form.checkOut && !validStay && <p className="error" role="alert">Check-out must be after check-in, with a maximum stay of 14 nights.</p>}
          <Message error={error} /><button className="primary property-book-button" disabled={busy || !validStay}>{busy ? 'Booking your stay…' : 'Book stay'} <span aria-hidden="true">↗</span></button>
        </form> : <>{!user ? <Link className="button primary property-book-button" to="/login">Log in to book <span aria-hidden="true">↗</span></Link> : <p className="notice">Bookings are available to customer accounts.</p>}</>}
        <div className="property-booking-note"><span aria-hidden="true">⌂</span><p>Up to {listing.maxGuests} guests <span>·</span> Maximum 14 nights</p></div>
      </aside>
    </div>
  </article>
}

export function BookingsPage() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const controller = new AbortController()
    api('/bookings', { signal: controller.signal }).then(setBookings).catch(err => {
      if (!controller.signal.aborted) setError(err.message)
    })
    return () => controller.abort()
  }, [])

  async function cancel(booking) {
    setCancelling(null)
    setBusy(true)
    setError('')
    setFeedback('')
    try {
      await api(`/bookings/${booking.id}/cancel`, { method: 'POST' })
      setBookings(current => current.map(row => row.id === booking.id ? { ...row, status: 'CANCELLED' } : row))
      setFeedback(`Your booking for ${booking.listingName || 'this property'} was cancelled.`)
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  const today = new Date()
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const category = booking => booking.status === 'CANCELLED' ? 'cancelled' : booking.checkOut < todayDate ? 'past' : 'upcoming'
  const counts = { all: bookings?.length ?? 0, upcoming: 0, past: 0, cancelled: 0 }
  bookings?.forEach(booking => counts[category(booking)]++)
  const filtered = bookings?.filter(booking => filter === 'all' || category(booking) === filter)
  const dateParts = value => {
    const date = new Date(`${value}T00:00:00Z`)
    return { day: date.getUTCDate(), month: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }), year: date.getUTCFullYear() }
  }
  return <div className="trips-page">
    <header className="trips-heading"><div><p className="eyebrow">Your stays, all in one place</p><h1>My bookings</h1><p>From your next getaway to the places you’ve already called home.</p></div><Link className="button primary" to="/search">Plan another stay <span aria-hidden="true">↗</span></Link></header>
    <dl className="trips-summary"><div><dt>Total reservations</dt><dd>{bookings ? counts.all : '—'}<small>stays booked</small></dd></div><div><dt>Current & upcoming</dt><dd>{bookings ? counts.upcoming : '—'}<small>stays ahead</small></dd></div><div><dt>Past stays</dt><dd>{bookings ? counts.past : '—'}<small>places remembered</small></dd></div></dl>
    <Message error={error} />
    {feedback && <p className="success-message" role="status">{feedback}</p>}
    {bookings && bookings.length > 0 && <div className="trips-filters" aria-label="Filter bookings">
      {[['all', 'All stays'], ['upcoming', 'Current & upcoming'], ['past', 'Past stays'], ['cancelled', 'Cancelled']].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label} <span>{counts[value]}</span></button>)}
    </div>}
    {!bookings && !error && <><p role="status" className="muted">Getting your stays ready…</p><div className="trip-skeleton" aria-hidden="true" /></>}
    {bookings && filtered.length === 0 && <div className="trip-empty"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="9" width="32" height="31" rx="6" /><path d="M8 19h32M17 5v8m14-8v8m-13 16 4 4 9-9" /></svg><h2>{bookings.length === 0 ? 'Your next getaway starts here.' : 'No stays in this chapter yet.'}</h2><p>{bookings.length === 0 ? 'Find a place that fits your plans. Your reservations will be right here.' : 'Choose another filter to see your reservations, or start planning a new stay.'}</p>{filter === 'all' ? <Link className="button primary" to="/search">Explore stays ↗</Link> : <button onClick={() => setFilter('all')}>Show all stays</button>}</div>}
    <section className="trip-list" aria-label="Your bookings" aria-busy={busy}>
      {filtered?.map(booking => {
        const checkIn = dateParts(booking.checkIn)
        const checkOut = dateParts(booking.checkOut)
        const nights = Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000)
        const tripLabel = booking.status === 'CANCELLED' ? 'Cancelled reservation' : booking.checkOut < todayDate ? 'A stay to remember' : booking.checkIn <= todayDate ? 'Your current stay' : 'Your next getaway'
        return <article className="trip-card" key={booking.id}>
          <div className="trip-card-media"><PropertyPhoto className="trip-card-photo" src={booking.listingPhotoUrl} alt={booking.listingName || 'Booked property'} /><Status value={booking.status} /></div>
          <div className="trip-card-main"><p className="eyebrow">{tripLabel}</p><h2>{booking.listingName || 'Property'}</h2>
            <dl className="trip-date-range"><div><dt>Check-in</dt><dd><time dateTime={booking.checkIn} aria-label={displayDate(booking.checkIn)}><strong>{checkIn.day}</strong><span>{checkIn.month}<small>{checkIn.year}</small></span></time></dd></div><span className="trip-date-arrow" aria-hidden="true">→</span><div><dt>Check-out</dt><dd><time dateTime={booking.checkOut} aria-label={displayDate(booking.checkOut)}><strong>{checkOut.day}</strong><span>{checkOut.month}<small>{checkOut.year}</small></span></time></dd></div></dl>
            <div className="trip-card-meta"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2" /></svg>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span><span>·</span><span>{nights} {nights === 1 ? 'night' : 'nights'}</span></div>
          </div>
          <div className="trip-card-total"><p>Reservation total</p><strong>{price(booking.totalCostCents)}</strong><span className="trip-card-reference">REF {booking.id.slice(0, 8).toUpperCase()}</span>
            {booking.status === 'CONFIRMED' && <div className="trip-card-actions">{booking.checkOut < todayDate && <Link className="button primary" to={`/bookings/${booking.id}/review`}>Review stay ↗</Link>}<button className="trip-cancel" disabled={busy} onClick={() => setCancelling(booking)}>Cancel booking</button></div>}
          </div>
        </article>
      })}
    </section>
    {cancelling && <ConfirmDialog title="Cancel booking?" action="Cancel booking" onClose={() => setCancelling(null)} onConfirm={() => cancel(cancelling)}>
      Your reservation for {cancelling.listingName || 'this property'} from {displayDate(cancelling.checkIn)} to {displayDate(cancelling.checkOut)} will be cancelled.
    </ConfirmDialog>}
  </div>
}
