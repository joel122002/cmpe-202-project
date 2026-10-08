import { useEffect, useState } from 'react'
import { api } from './api'

export default function ListingDetail({ listingId }) {
  const [listing, setListing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadListing() {
      try {
        setListing(await api(`/listings/${listingId}`))
      } catch (requestError) {
        setError(requestError.message)
      }
    }
    loadListing()
  }, [listingId])

  if (error) return <p role="alert">{error}</p>
  if (!listing) return <p>Loading listing...</p>
  return <article className="panel"><h1>{listing.name}</h1><p>{listing.description}</p><p>{listing.city}, {listing.state}</p></article>
}
