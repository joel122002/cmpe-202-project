export default function ListingCard({ listing, onSelect }) {
  return <article className="card"><h2>{listing.name}</h2><p>{listing.city}, {listing.state}</p><p>${listing.pricePerNightCents / 100} per night</p><button onClick={() => onSelect(listing)}>View stay</button></article>
}
