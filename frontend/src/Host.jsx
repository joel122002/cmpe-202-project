import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from './api'
import { ConfirmDialog, Message, price, PropertyPhoto, Status } from './Ui'

export function HostListings() {
  const [listings, setListings] = useState(null)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    api('/hosts/me/listings', { signal: controller.signal }).then(setListings).catch(err => {
      if (!controller.signal.aborted) setError(err.message)
    })
    return () => controller.abort()
  }, [])

  async function remove(listing) {
    setRemoving(null)
    setBusy(true)
    setError('')
    setFeedback('')
    try {
      await api(`/listings/${listing.id}`, { method: 'DELETE' })
      setListings(current => current.map(row => row.id === listing.id ? { ...row, status: 'REMOVED' } : row))
      setFeedback(`${listing.name} was removed.`)
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return <>
    <header className="page-heading workspace-heading">
      <div><h1>My listings</h1><p>Manage your properties. New and edited listings need admin approval.</p></div>
      <Link className="button primary" to="/host/listings/new">Add listing</Link>
    </header>
    <Message error={error} />
    {feedback && <p className="success-message" role="status">{feedback}</p>}
    {!listings && !error && <p className="workspace-empty" role="status">Loading listings…</p>}
    {listings?.length === 0 && <div className="workspace-panel workspace-empty"><h2>Your first stay starts here</h2><p>Add a property to send it for review.</p></div>}
    <section className="stack" aria-label="Your properties" aria-busy={busy}>
      {listings?.map(listing => <article className="workspace-panel host-listing" key={listing.id}>
        <PropertyPhoto src={listing.photoUrls[0]} />
        <div className="host-listing-content">
          <Status value={listing.status} />
          <h2>{listing.name}</h2>
          <p>{listing.address}, {listing.city}, {listing.state} {listing.zipCode}</p>
          <p>{price(listing.pricePerNightCents)} / night · Up to {listing.maxGuests} guests</p>
          {listing.status !== 'REMOVED' && <div className="row-actions">
            <Link className="button" to={`/host/listings/${listing.id}/edit`}>Edit listing</Link>
            <button className="danger-outline" disabled={busy} onClick={() => setRemoving(listing)}>Remove</button>
          </div>}
        </div>
      </article>)}
    </section>
    {removing && <ConfirmDialog title="Remove listing?" action="Remove listing" onClose={() => setRemoving(null)} onConfirm={() => remove(removing)}>
      {removing.name} will no longer appear in customer search or accept new bookings.
    </ConfirmDialog>}
  </>
}

const emptyForm = { name: '', description: '', address: '', city: '', state: '', zipCode: '', latitude: '', longitude: '', pricePerNightCents: 12500, maxGuests: 2, photoUrls: [] }

export function ListingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [loadedId, setLoadedId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const loading = editing && loadedId !== id

  useEffect(() => {
    setError('')
    if (!id) { setForm(emptyForm); setLoadedId(null); return }
    const controller = new AbortController()
    api(`/listings/${id}`, { signal: controller.signal }).then(listing => {
      setForm(Object.fromEntries(Object.keys(emptyForm).map(key => [key, listing[key] ?? emptyForm[key]])))
      setLoadedId(id)
    }).catch(err => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [id])

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        pricePerNightCents: Number(form.pricePerNightCents),
        maxGuests: Number(form.maxGuests),
      }
      await api(editing ? `/listings/${id}` : '/listings', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      navigate('/host/listings')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  const field = (key, label, type = 'text', props = {}) => <label>{label}<input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required {...props} /></label>
  return <>
    <Link className="back-link" to="/host/listings">← My listings</Link>
    <header className="page-heading workspace-heading"><div><h1>{editing ? 'Edit listing' : 'New listing'}</h1><p>Saving sends this property for admin approval.</p></div></header>
    <Message error={error} />
    {loading ? !error && <p role="status">Loading listing…</p> : <section className="form-card">
      <form onSubmit={submit}>
        {field('name', 'Property name')}
        <label>Description<textarea value={form.description} required onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        {field('address', 'Street address')}
        <div className="form-row">{field('city', 'City')}{field('state', 'State')}{field('zipCode', 'ZIP code')}</div>
        <div className="form-row">
          {field('pricePerNightCents', 'Nightly price (cents)', 'number', { min: 1, step: 1 })}
          {field('maxGuests', 'Maximum guests', 'number', { min: 1, step: 1 })}
        </div>
        <div className="form-row">
          {field('latitude', 'Latitude (optional)', 'number', { required: false, step: 'any', min: -90, max: 90 })}
          {field('longitude', 'Longitude (optional)', 'number', { required: false, step: 'any', min: -180, max: 180 })}
        </div>
        <div className="row-actions"><button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save listing'}</button><Link className="button" to="/host/listings">Cancel</Link></div>
      </form>
    </section>}
  </>
}
