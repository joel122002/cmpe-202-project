import { useEffect, useState } from 'react'
import { api } from './api'
import { ConfirmDialog, Message, price, PropertyPhoto } from './Ui'

export function AdminListings() {
  const [listings, setListings] = useState(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(null)
  const [rejection, setRejection] = useState(null)
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api('/admin/listings/pending', { signal: controller.signal })
      .then(setListings)
      .catch(err => {
        if (!controller.signal.aborted) setError(err.message)
      })
    return () => controller.abort()
  }, [loadAttempt])

  async function moderate(listing, action) {
    setRejection(null)
    setBusy(listing.id)
    setError('')
    setFeedback('')
    try {
      await api(`/admin/listings/${listing.id}/${action}`, { method: 'POST' })
      setListings(current => current.filter(row => row.id !== listing.id))
      setFeedback(`${listing.name} was ${action === 'approve' ? 'approved' : 'rejected'}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <header className="page-heading workspace-heading">
        <div>
          <h1>Listing moderation</h1>
          <p>Review host submissions before they appear in search.</p>
        </div>
      </header>
      <div role="status" aria-live="polite">
        {feedback && <p className="success-message">{feedback}</p>}
      </div>
      <Message error={error} />
      <section className="workspace-panel" aria-labelledby="pending-title">
        <div className="workspace-panel-header">
          <h2 id="pending-title">Pending listings</h2>
          {listings && <span className="queue-count">{listings.length} pending</span>}
        </div>
        {!listings && (error ? (
          <div className="workspace-empty">
            <button onClick={() => { setError(''); setLoadAttempt(attempt => attempt + 1) }}>Try again</button>
          </div>
        ) : <p className="workspace-empty" role="status">Loading listings…</p>)}
        {listings?.length === 0 && (
          <div className="workspace-empty">
            <h3>You’re caught up</h3>
            <p>New host submissions will appear here.</p>
          </div>
        )}
        {listings?.map(listing => (
          <article className="moderation-row" key={listing.id} aria-busy={busy === listing.id}>
            <PropertyPhoto src={listing.photoUrls[0]} className="moderation-photo" />
            <div className="moderation-content">
              <h3>{listing.name}</h3>
              <p className="moderation-address">{listing.address}, {listing.city}, {listing.state} {listing.zipCode}</p>
              <p>{listing.description}</p>
              <dl className="moderation-facts">
                <div><dt>Nightly rate</dt><dd>{price(listing.pricePerNightCents)}</dd></div>
                <div><dt>Capacity</dt><dd>{listing.maxGuests} {listing.maxGuests === 1 ? 'guest' : 'guests'}</dd></div>
              </dl>
              <div className="row-actions">
                <button className="primary" disabled={busy !== null} onClick={() => moderate(listing, 'approve')}>Approve</button>
                <button className="danger-outline" disabled={busy !== null} onClick={() => setRejection(listing)}>Reject</button>
              </div>
            </div>
          </article>
        ))}
      </section>
      {rejection && (
        <ConfirmDialog
          title="Reject listing?"
          action="Reject listing"
          onClose={() => setRejection(null)}
          onConfirm={() => moderate(rejection, 'reject')}
        >
          {rejection.name} will be removed from the review queue and stay out of customer search.
        </ConfirmDialog>
      )}
    </>
  )
}
