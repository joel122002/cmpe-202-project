# Reviews Module

## Responsibility

Allow a customer to review a past booking and expose listing review summaries.

## Public operations

```text
createReview(customerId, bookingId, input) -> Review
listListingReviews(listingId) -> Review[]
getListingRatingSummary(listingId) -> RatingSummary
```

## Rules

- The booking must belong to the customer.
- The booking's check-out date must be before today.
- The booking must not be cancelled.
- One review per booking is allowed.
- Rating is an integer from 1 to 5.
- Comment is optional.

## Acceptance tests

- Eligible customer can submit a review.
- A customer cannot review another customer's booking.
- A customer cannot submit two reviews for one booking.
- Future and cancelled bookings cannot be reviewed.
- Listing details show average rating and review count.
- Every seeded listing has one review from the review-only fixture customer.

## Delivery boundary

Sonit owns review eligibility and submission. Listing and analytics surfaces consume the review summary as read-only data.
