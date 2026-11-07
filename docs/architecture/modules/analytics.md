# Analytics Module

## Responsibility

Produce simple read-only booking summaries for hosts and admins.

## Public operations

```text
getHostAnalytics(hostId, periodDays) -> AnalyticsSummary
getAdminAnalytics(periodDays) -> AnalyticsSummary
```

`periodDays` must be one of `30`, `60`, or `90`.

## Output contract

```json
{
  "periodDays": 30,
  "totalListings": 3,
  "totalBookings": 12,
  "bookingsByZipCode": [
    { "zipCode": "78701", "bookingCount": 8 },
    { "zipCode": "78702", "bookingCount": 4 }
  ]
}
```

Host analytics includes only listings owned by the host. Admin analytics includes all listings.

## Rules

- Analytics are read-only.
- Count `CONFIRMED` bookings; exclude cancelled bookings.
- The period is measured backward from the current UTC date.
- No revenue or forecasting is required for the MVP.

## Acceptance tests

- Host A cannot see Host B's bookings.
- Admin sees bookings across all hosts.
- Cancelled bookings are excluded.
- 30-, 60-, and 90-day periods produce bounded results when seed data spans those periods.
