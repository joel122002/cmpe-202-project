import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import StayScene from './StayScene'
import { api, readSearchPreferences, saveSearchPreferences } from './api'
import { Message, price, PropertyPhoto } from './Ui'

export default function SearchPage() {
  const [form, setForm] = useState(() => ({ ...readSearchPreferences(), city: null, state: null, zipCode: null }))
  const [locations, setLocations] = useState([])
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    api('/search/locations', { signal: controller.signal }).then(setLocations).catch(err => {
      if (!controller.signal.aborted) setError(err.message)
    })
    return () => controller.abort()
  }, [])
  useEffect(() => { saveSearchPreferences(form) }, [form.checkIn, form.checkOut, form.guests])
  const cityOptions = [...new Set(locations.map(location => location.city))].map(city => ({ value: city, label: city }))
  const stateOptions = [...new Set(locations.filter(location => !form.city || location.city === form.city.value).map(location => location.state))].map(state => ({ value: state, label: state }))
  const zipOptions = [...new Set(locations.filter(location => (!form.city || location.city === form.city.value) && (!form.state || location.state === form.state.value)).flatMap(location => location.zipCodes))].map(zipCode => ({ value: zipCode, label: zipCode }))

  const selectMenuProps = {
    menuPortalTarget: typeof document === 'undefined' ? undefined : document.body,
    menuPosition: 'fixed',
    styles: { menuPortal: base => ({ ...base, zIndex: 20 }) },
  }

  async function search(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const params = new URLSearchParams({ checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests })
      if (form.city) params.set('city', form.city.value)
      if (form.state) params.set('state', form.state.value)
      if (form.zipCode) params.set('zipCode', form.zipCode.value)
      setResults(await api(`/search/listings?${params}`))
      setSearched(true)
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return <div className="landing-page">
    <section className="landing-search" id="stay-search" aria-labelledby="search-title">
      <div className="search-section-heading"><h1 id="search-title">Find your next stay.</h1><span className="search-step">Choose your place, dates, and people.</span></div>
      <form className="search-card landing-search-form" onSubmit={search}>
        <div className="search-location"><label htmlFor="search-city">City</label><Select {...selectMenuProps} inputId="search-city" className="location-select" classNamePrefix="location" options={cityOptions} value={form.city} onChange={city => setForm({ ...form, city, state: null, zipCode: null })} isClearable isSearchable placeholder="Any city" /></div>
        <div className="search-location"><label htmlFor="search-state">State</label><Select {...selectMenuProps} inputId="search-state" className="location-select" classNamePrefix="location" options={stateOptions} value={form.state} onChange={state => setForm({ ...form, state, zipCode: null })} isClearable isSearchable placeholder="Any state" /></div>
        <div className="search-location"><label htmlFor="search-zip">ZIP code</label><Select {...selectMenuProps} inputId="search-zip" className="location-select" classNamePrefix="location" options={zipOptions} value={form.zipCode} onChange={zipCode => setForm({ ...form, zipCode })} isClearable isSearchable placeholder="Any ZIP" /></div>
        <label className="search-date" htmlFor="check-in">Check-in<input id="check-in" type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} required /></label>
        <label className="search-date" htmlFor="check-out">Check-out<input id="check-out" type="date" min={form.checkIn || undefined} value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} required /></label>
        <label className="search-guests" htmlFor="search-guests">Your group<input id="search-guests" type="number" min="1" value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} required /></label>
        <button className="primary search-submit" disabled={busy}><span className="search-submit-label">{busy ? 'Finding your stay…' : 'Explore stays'}</span><span aria-hidden="true">↗</span></button>
      </form>
      <Message error={error} />
    </section>

    {!searched && <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-copy">
        <h2 id="landing-title">New scenery.<br /><span>Same feeling<br className="desktop-break" /> of home.</span></h2>
        <p className="landing-intro">A weekend away. A slower morning. Find a place that fits your people, your plans, and your pace.</p>
      </div>
      <StayScene />
    </section>}

    {searched && <section className="landing-results" aria-labelledby="results-title" aria-busy={busy}>
      <div className="results-header"><div><p className="eyebrow">Find your kind of somewhere</p><h2 id="results-title">Good places. Better days.</h2></div><span className="results-count" role="status">{busy ? 'Looking for your next stay…' : `${results.length} ${results.length === 1 ? 'stay' : 'stays'} found`}</span></div>
      {results.length > 0 ? <div className="grid landing-listings">
        {results.map((listing, index) => <Link className="listing-card" style={{ '--card-order': Math.min(index, 5) }} to={`/listings/${listing.id}`} key={listing.id}>
          <div className="stay-card-media"><PropertyPhoto src={listing.photoUrls[0]} /><span className="stay-card-rating">{listing.reviewCount ? `★ ${listing.averageRating.toFixed(1)} · ${listing.reviewCount}` : 'No reviews yet'}</span><span className="stay-card-arrow" aria-hidden="true">↗</span></div>
          <div className="listing-card-content"><p className="stay-card-location">{listing.city}, {listing.state}</p><h3>{listing.name}</h3><div className="stay-card-footer"><span><strong>{price(listing.pricePerNightCents)}</strong> / night</span><span>{listing.maxGuests} guests</span></div></div>
        </Link>)}
      </div> : <div className="discovery-empty">
        <div className="discovery-mark" aria-hidden="true">⌕</div>
        <div><h3>Somewhere else is calling.</h3><p>No homes match this search. Try different dates, a nearby city, or a smaller group.</p></div>
        <a href="#stay-search" aria-label="Back to stay search">Try another search <span aria-hidden="true">↗</span></a>
      </div>}
    </section>}

    <div className="stay-promises" aria-label="Booking essentials">
      <div><span aria-hidden="true">⌂</span><p><strong>A place of your own</strong><small>Browse admin-approved rentals.</small></p></div>
      <div><span aria-hidden="true">☀</span><p><strong>A little time away</strong><small>Plan a stay of up to 14 nights.</small></p></div>
      <div><span aria-hidden="true">↗</span><p><strong>Space for your people</strong><small>Find a home that fits your group.</small></p></div>
    </div>

    <footer className="landing-footer"><span className="brand">Stay Simple</span><p>A different place. A familiar feeling.</p><a href="#stay-search">Back to top ↑</a></footer>
  </div>
}
