export default function BookingConfirmation({ booking }) {
  return <section className="panel" role="status"><p className="eyebrow">Booking confirmed</p><h1>{booking.listingName}</h1><p>{booking.checkIn} to {booking.checkOut}</p><p>Total: ${booking.totalCostCents / 100}</p></section>
}
