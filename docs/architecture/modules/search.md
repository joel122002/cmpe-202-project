# Search Module

## Responsibility

Return approved listings matching customer criteria and available for the requested dates.

## Public operation

```text
searchListings(criteria) -> SearchResult
getLocationOptions() -> { cities: string[], zipCodes: string[] }
```

```text
criteria = {
  checkIn: date,
  checkOut: date,
  guests: integer,
  city?: string,
  state?: string,
  zipCode?: string
}
```

## Rules

- `checkIn` must be before `checkOut`.
- The stay must be 1–14 nights.
- `guests` must be positive.
- Search includes only `APPROVED` listings.
- Search excludes listings with overlapping `CONFIRMED` bookings.
- Search does not reserve inventory. Booking creation repeats validation transactionally.
- Location options come from distinct city/state/ZIP groups on approved listings.
- State options are filtered by the selected city, and ZIP options are filtered by the selected city and state.
- A supplied city, state, or ZIP code must match an approved listing address.

## Output

Each result contains:

```text
id, name, city, state, zipCode, photoUrls,
pricePerNightCents, maxGuests, averageRating, reviewCount
```

## Acceptance tests

- Location filters match the normalized listing fields.
- A listing with insufficient capacity is excluded.
- An overlapping confirmed booking excludes the listing.
- A cancelled booking does not block the dates.
- A 15-night request returns validation failure.
- The location endpoint returns only approved listing cities and ZIP codes.
- Invalid city and ZIP filters are rejected.

## Ownership

Sagar owns location options, autocomplete validation, availability filtering, and result rendering.

The module boundary is complete at the search response; booking mutations remain outside it.

## Acceptance boundary

Search owns availability, location validation, and result shaping. It never creates or cancels bookings.

## Delivery boundary

Sagar owns search validation, location options, and result rendering. The module reads listing and booking data but does not create reservations.
