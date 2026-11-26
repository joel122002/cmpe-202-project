import { useEffect, useState } from 'react'
import Select from 'react-select'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { api, clearSession, readSearchPreferences, readSession, saveSearchPreferences, saveSession } from './api'

function Layout({ user, onLogout, children }) {
  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/search">Stay Simple</Link>
        <nav>
          <Link to="/search">Search</Link>
          {user?.role === 'CUSTOMER' && <Link to="/bookings">My bookings</Link>}
          {user?.role === 'HOST' && <><Link to="/host/listings">My listings</Link><Link to="/host/analytics">Analytics</Link></>}
          {user?.role === 'ADMIN' && <><Link to="/admin/listings">Moderation</Link><Link to="/admin/analytics">Analytics</Link></>}
          {user ? <button className="link-button" onClick={onLogout}>Log out</button> : <Link to="/login">Log in</Link>}
        </nav>
      </header>
      <main className="container">{children}</main>
    </>
  )
}

function Protected({ user, roles, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/search" replace />
  return children
}

function Message({ error }) {
  return error ? <p className="error">{error}</p> : null
}

function AuthLayout({ titleId, children }) {
  return <div className="auth-shell">
    <Link className="login-back" to="/search">← Explore stays</Link>
    <div className="login-page">
      <section className="login-panel" aria-labelledby={titleId}>{children}</section>
      <aside className="login-visual" aria-label="A little inspiration for your next stay"></aside>
    </div>
  </div>
}

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const auth = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) })
      saveSession(auth)
      onLogin(auth.user)
      navigate('/search')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <AuthLayout titleId="login-title">
      <p className="eyebrow">A different place. A familiar feeling.</p>
      <h1 id="login-title">Welcome back.</h1>
      <p className="login-intro">Log in to find your next stay and pick up where you left off.</p>
      <form className="login-form" onSubmit={submit}>
        <label htmlFor="login-email">Email address<input id="login-email" type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
        <label htmlFor="login-password">Password<input id="login-password" type="password" name="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></label>
        <Message error={error} /><button className="primary login-submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'} <span aria-hidden="true">↗</span></button>
      </form>
      <p className="login-register">New to Stay Simple? <Link to="/register">Create an account ↗</Link></p>
  </AuthLayout>
}

function Register({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) })
      const auth = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) })
      saveSession(auth); onLogin(auth.user); navigate('/search')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <AuthLayout titleId="register-title">
    <p className="eyebrow">A different place. A familiar feeling.</p>
    <h1 id="register-title">Create an account.</h1>
    <p className="login-intro">Find your next getaway or welcome guests to a place of your own.</p>
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="register-name">Your name<input id="register-name" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
      <label htmlFor="register-email">Email address<input id="register-email" name="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
      <label htmlFor="register-password">Password<input id="register-password" name="password" type="password" minLength="8" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} aria-describedby="password-hint" required /><small className="auth-field-hint" id="password-hint">At least 8 characters.</small></label>
      <label htmlFor="register-role">I’m here to<select id="register-role" name="role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="CUSTOMER">Find and book stays</option><option value="HOST">Host a property</option></select></label>
      <Message error={error} /><button className="primary login-submit" disabled={busy}>{busy ? 'Creating your account…' : 'Create account'} <span aria-hidden="true">↗</span></button>
    </form>
    <p className="login-register">Already have an account? <Link to="/login">Log in ↗</Link></p>
  </AuthLayout>
}

function SearchPage() {
  const [form, setForm] = useState(() => ({ ...readSearchPreferences(), city: null, state: null, zipCode: null }))
  const [locations, setLocations] = useState([])
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { api('/search/locations').then(setLocations).catch(err => setError(err.message)) }, [])
  useEffect(() => { saveSearchPreferences(form) }, [form.checkIn, form.checkOut, form.guests])
  const cityOptions = [...new Set(locations.map(location => location.city))].map(city => ({ value: city, label: city }))
  const stateOptions = [...new Set(locations.filter(location => !form.city || location.city === form.city.value).map(location => location.state))].map(state => ({ value: state, label: state }))
  const zipOptions = [...new Set(locations.filter(location => (!form.city || location.city === form.city.value) && (!form.state || location.state === form.state.value)).flatMap(location => location.zipCodes))].map(zipCode => ({ value: zipCode, label: zipCode }))
  async function search(event) {
    event?.preventDefault()
    try {
      const params = new URLSearchParams({ checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests })
      if (form.city) params.set('city', form.city.value)
      if (form.state) params.set('state', form.state.value)
      if (form.zipCode) params.set('zipCode', form.zipCode.value)
      setResults(await api(`/search/listings?${params}`)); setError('')
    } catch (err) { setError(err.message) }
  }
  return <><section className="hero"><p className="eyebrow">Simple stays</p><h1>Find a place that fits.</h1><p className="muted">Search approved rentals for up to 14 nights.</p></section>
    <form className="search-card" onSubmit={search}><label>Check-in<input type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} required /></label>
      <label>Check-out<input type="date" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} required /></label><label>Guests<input type="number" min="1" value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} required /></label>
      <label>City<Select className="location-select" options={cityOptions} value={form.city} onChange={city => setForm({ ...form, city, state: null, zipCode: null })} isClearable isSearchable placeholder="Any city" /></label><label>State<Select className="location-select" options={stateOptions} value={form.state} onChange={state => setForm({ ...form, state, zipCode: null })} isClearable isSearchable placeholder="Any state" /></label><label>ZIP<Select className="location-select" options={zipOptions} value={form.zipCode} onChange={zipCode => setForm({ ...form, zipCode })} isClearable isSearchable placeholder="Any ZIP" /></label><button className="primary">Search</button></form>
    <Message error={error} /><div className="results-header"><div><p className="eyebrow">Curated for your dates</p><h2>Available stays</h2></div><span className="results-count">{results.length ? `${results.length} ${results.length === 1 ? 'stay' : 'stays'} found` : 'Search to explore stays'}</span></div>{results.length ? <section className="grid">{results.map(listing => <Link className="listing-card" to={`/listings/${listing.id}`} key={listing.id}><img src={listing.photoUrls[0]} alt="" /><div><h2>{listing.name}</h2><p>{listing.city}, {listing.state}</p><p>${(listing.pricePerNightCents / 100).toFixed(0)} / night · {listing.maxGuests} guests</p><p>★ {listing.averageRating || 'New'} ({listing.reviewCount})</p></div></Link>)}</section> : <section className="notice"><strong>Your next stay starts here.</strong><p className="muted">Choose dates and guests above to see available homes.</p></section>}</>
}

function ListingPage({ user }) {
  const { id } = useParams(); const navigate = useNavigate(); const [listing, setListing] = useState(null); const [reviews, setReviews] = useState([]); const [form, setForm] = useState(readSearchPreferences); const [error, setError] = useState('')
  useEffect(() => { Promise.all([api(`/listings/${id}`), api(`/listings/${id}/reviews`)]).then(([l, r]) => { setListing(l); setReviews(r) }).catch(err => setError(err.message)) }, [id])
  useEffect(() => { saveSearchPreferences(form) }, [form.checkIn, form.checkOut, form.guests])
  async function book(event) { event.preventDefault(); try { await api('/bookings', { method: 'POST', body: JSON.stringify({ listingId: id, ...form }) }); navigate('/bookings') } catch (err) { setError(err.message) } }
  if (!listing) return <><Message error={error} /><p>Loading…</p></>
  const mapUrl = `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}&output=embed`
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`
  return <><Link to="/search">← Back to search</Link><section className="detail"><img className="detail-image" src={listing.photoUrls[0]} alt="" /><div><p className="eyebrow">{listing.city}, {listing.state}</p><h1>{listing.name}</h1><p>{listing.description}</p><p>{listing.address} · Up to {listing.maxGuests} guests</p><p>${(listing.pricePerNightCents / 100).toFixed(0)} per night</p><iframe className="map" title="Listing location" src={mapUrl} loading="lazy" /><a className="map-link" href={mapLink} target="_blank" rel="noreferrer">Open in Google Maps</a></div></section>
    {user?.role === 'CUSTOMER' && <form className="form-card booking-form" onSubmit={book}><h2>Book this stay</h2><div className="form-row"><label>Check-in<input type="date" required value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} /></label><label>Check-out<input type="date" required value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} /></label><label>Guests<input type="number" min="1" max={listing.maxGuests} required value={form.guests} onChange={e => setForm({ ...form, guests: Number(e.target.value) })} /></label><button className="primary">Book</button></div><Message error={error} /></form>}
    {!user && <p className="notice"><Link to="/login">Log in</Link> as a customer to book.</p>}<section><h2>Reviews</h2>{reviews.length ? reviews.map(review => <article className="review" key={review.id}><strong>★ {review.rating}</strong><p>{review.comment}</p></article>) : <p className="muted">No reviews yet.</p>}</section></>
}

function BookingsPage() {
  const [bookings, setBookings] = useState([]); const [error, setError] = useState('')
  async function load() { try { setBookings(await api('/bookings')) } catch (err) { setError(err.message) } }
  useEffect(() => { load() }, [])
  async function cancel(id) { try { await api(`/bookings/${id}/cancel`, { method: 'POST' }); load() } catch (err) { setError(err.message) } }
  return <><h1>My bookings</h1><Message error={error} /><section className="stack">{bookings.map(booking => <article className="panel booking-card" key={booking.id}>{booking.listingPhotoUrl && <img className="booking-image" src={booking.listingPhotoUrl} alt={`${booking.listingName || 'Property'} property`} />}<div><p className="eyebrow">Booked stay</p><h2>{booking.listingName || 'Property'}</h2><p>{booking.checkIn} → {booking.checkOut} · {booking.guests} guests</p><p>${(booking.totalCostCents / 100).toFixed(2)} · {booking.status}</p>{booking.status === 'CONFIRMED' && <button onClick={() => cancel(booking.id)}>Cancel booking</button>}{booking.status === 'CONFIRMED' && new Date(`${booking.checkOut}T00:00:00`) < new Date() && <Link className="button" to={`/bookings/${booking.id}/review`}>Review stay</Link>}</div></article>)}</section></>
}

function HostListings() {
  const [listings, setListings] = useState([]); const [error, setError] = useState('')
  useEffect(() => { api('/hosts/me/listings').then(setListings).catch(err => setError(err.message)) }, [])
  return <><div className="page-heading"><div><h1>My listings</h1><p className="muted">Listings need admin approval before customers can book them.</p></div><Link className="button primary" to="/host/listings/new">Add listing</Link></div><Message error={error} /><section className="stack">{listings.map(listing => <article className="panel" key={listing.id}><h2>{listing.name}</h2><p>{listing.city}, {listing.state} · {listing.status}</p><Link className="button" to={`/host/listings/${listing.id}/edit`}>Edit</Link></article>)}</section></>
}

function ListingForm() {
  const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id); const [error, setError] = useState(''); const [form, setForm] = useState({ name: '', description: '', address: '', city: '', state: '', zipCode: '', latitude: '', longitude: '', pricePerNightCents: 12500, maxGuests: 2, photoUrls: [] })
  useEffect(() => { if (editing) api(`/listings/${id}`).then(listing => setForm({ ...listing, photoUrls: listing.photoUrls })).catch(err => setError(err.message)) }, [editing, id])
  async function submit(event) { event.preventDefault(); try { const payload = { ...form, latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null, pricePerNightCents: Number(form.pricePerNightCents), maxGuests: Number(form.maxGuests), photoUrls: form.photoUrls.length ? form.photoUrls : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900'] }; await api(editing ? `/listings/${id}` : '/listings', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); navigate('/host/listings') } catch (err) { setError(err.message) } }
  const field = (key, label, type = 'text') => <label>{label}<input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={!['latitude', 'longitude'].includes(key)} /></label>
  return <section className="form-card"><h1>{editing ? 'Edit listing' : 'New listing'}</h1><form onSubmit={submit}>{field('name', 'Name')}{field('description', 'Description')}{field('address', 'Address')}{field('city', 'City')}{field('state', 'State')}{field('zipCode', 'ZIP code')}<div className="form-row">{field('latitude', 'Latitude', 'number')}{field('longitude', 'Longitude', 'number')}{field('pricePerNightCents', 'Price cents', 'number')}{field('maxGuests', 'Max guests', 'number')}</div><Message error={error} /><button className="primary">Save listing</button></form></section>
}

function AnalyticsPage({ admin = false }) { const [days, setDays] = useState(30); const [data, setData] = useState(null); const [error, setError] = useState(''); useEffect(() => { api(`${admin ? '/admin' : '/hosts/me'}/analytics?periodDays=${days}`).then(setData).catch(err => setError(err.message)) }, [admin, days]); return <><h1>{admin ? 'Admin analytics' : 'Host analytics'}</h1><label>Period<select value={days} onChange={e => setDays(e.target.value)}><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></label><Message error={error} />{data && <section className="metrics"><div><strong>{data.totalListings}</strong><span>Listings</span></div><div><strong>{data.totalBookings}</strong><span>Bookings</span></div></section>}{data?.bookingsByZipCode.map(row => <p className="panel" key={row.zipCode}>{row.zipCode}: {row.bookingCount} bookings</p>)}</> }

function AdminListings() { const [listings, setListings] = useState([]); const [error, setError] = useState(''); async function load() { try { setListings(await api('/admin/listings/pending')) } catch (err) { setError(err.message) } } useEffect(() => { load() }, []); async function moderate(id, action) { try { await api(`/admin/listings/${id}/${action}`, { method: 'POST' }); load() } catch (err) { setError(err.message) } } return <><h1>Pending listings</h1><Message error={error} /><section className="stack">{listings.map(listing => <article className="panel" key={listing.id}><h2>{listing.name}</h2><p>{listing.address}, {listing.city}, {listing.state}</p><button onClick={() => moderate(listing.id, 'approve')}>Approve</button> <button onClick={() => moderate(listing.id, 'reject')}>Reject</button></article>)}</section></> }

function ReviewPage() { const { id } = useParams(); const navigate = useNavigate(); const [form, setForm] = useState({ rating: 5, comment: '' }); const [error, setError] = useState(''); async function submit(event) { event.preventDefault(); try { await api(`/bookings/${id}/review`, { method: 'POST', body: JSON.stringify(form) }); navigate('/bookings') } catch (err) { setError(err.message) } } return <section className="form-card narrow"><h1>Review your stay</h1><form onSubmit={submit}><label>Rating<select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value}</option>)}</select></label><label>Comment<textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} /></label><Message error={error} /><button className="primary">Submit review</button></form></section> }

export default function App() {
  const [user, setUser] = useState(readSession)
  function logout() { clearSession(); setUser(null) }
  return <Layout user={user} onLogout={logout}><Routes>
    <Route path="/login" element={<Login onLogin={setUser} />} /><Route path="/register" element={<Register onLogin={setUser} />} />
    <Route path="/search" element={<SearchPage />} /><Route path="/listings/:id" element={<ListingPage user={user} />} />
    <Route path="/bookings" element={<Protected user={user} roles={['CUSTOMER']}><BookingsPage /></Protected>} />
    <Route path="/bookings/:id/review" element={<Protected user={user} roles={['CUSTOMER']}><ReviewPage /></Protected>} />
    <Route path="/host/listings" element={<Protected user={user} roles={['HOST']}><HostListings /></Protected>} />
    <Route path="/host/listings/new" element={<Protected user={user} roles={['HOST']}><ListingForm /></Protected>} />
    <Route path="/host/listings/:id/edit" element={<Protected user={user} roles={['HOST']}><ListingForm /></Protected>} />
    <Route path="/host/analytics" element={<Protected user={user} roles={['HOST']}><AnalyticsPage /></Protected>} />
    <Route path="/admin/listings" element={<Protected user={user} roles={['ADMIN']}><AdminListings /></Protected>} />
    <Route path="/admin/analytics" element={<Protected user={user} roles={['ADMIN']}><AnalyticsPage admin /></Protected>} />
    <Route path="*" element={<Navigate to="/search" replace />} />
  </Routes></Layout>
}
