export default function ReviewSummary({ averageRating, reviewCount }) {
  return <p aria-label="Review summary">{averageRating ? `${averageRating.toFixed(1)} / 5` : 'No ratings yet'} · {reviewCount} reviews</p>
}
