# Bookings Module

## Responsibility

Create, read, and cancel customer bookings while preventing overlapping reservations.

## Public operations

```text
createBooking(customerId, bookingInput) -> Booking
listCustomerBookings(customerId) -> Booking[]
getBooking(actor, bookingId) -> Booking
cancelBooking(customerId, bookingId) -> Booking
getReviewEligibility(customerId, bookingId) -> Eligibility
```

Booking responses include `listingName` and the first listing photo as `listingPhotoUrl` when a photo exists. The customer bookings page uses these fields to identify the booked property visually.

## Rules

- Only customers create bookings.
- The listing must be approved.
- Check-in/check-out and 14-night rules are enforced.
- Guest count cannot exceed listing capacity.
- Total cost is `(number of nights * pricePerNightCents)`.
- Creation runs in a transaction and prevents overlap for confirmed bookings.
- A customer may cancel only their own booking.
- A cancelled booking no longer blocks dates.
- A customer may review a confirmed booking after its check-out date.

## Acceptance tests

- Valid booking is confirmed with the correct total.
- Overlapping concurrent booking attempts produce one success and one `BOOKING_DATE_UNAVAILABLE` failure.
- Customer cannot cancel another customer's booking.
- Cancellation makes the date range bookable again.
- A booking beyond 14 nights is rejected.

## Delivery boundary

Sonit owns reservation state transitions and cancellation. Reviews may read completed bookings but do not mutate booking state.
