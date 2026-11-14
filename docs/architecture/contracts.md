# Shared API and Data Contracts

This is the single contract for parallel frontend, backend, and database work. All API paths are relative to `/api/v1`.

## API conventions

- All request and response bodies are JSON.
- IDs are UUID strings.
- Dates use `YYYY-MM-DD`.
- Timestamps are stored in UTC.
- Money is integer cents in USD.
- Unknown request fields are rejected with `400`.

Protected requests send:

```http
Authorization: Bearer <token>
```

Success response:

```json
{
  "data": {},
  "error": null
}
```

Error response:

```json
{
  "data": null,
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "Listing was not found.",
    "fieldErrors": {}
  }
}
```

Status codes:

| Status | Meaning |
|---|---|
| 200 | Successful read, update, or action |
| 201 | Resource created |
| 400 | Invalid input |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but not allowed |
| 404 | Resource not found |
| 409 | Business conflict, especially booking overlap |
| 500 | Unexpected server error |

Standard error codes:

```text
VALIDATION_ERROR
AUTH_INVALID_CREDENTIALS
AUTH_UNAUTHENTICATED
AUTH_FORBIDDEN
RESOURCE_NOT_FOUND
LISTING_NOT_APPROVED
BOOKING_DATE_INVALID
BOOKING_TOO_LONG
BOOKING_GUEST_LIMIT_EXCEEDED
BOOKING_DATE_UNAVAILABLE
BOOKING_NOT_OWNER
BOOKING_ALREADY_CANCELLED
REVIEW_NOT_ELIGIBLE
REVIEW_ALREADY_EXISTS
LISTING_NOT_OWNER
LISTING_INVALID_STATUS
```

Never return password hashes, secrets, or production stack traces.

## Authentication endpoints

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

Registration request:

```json
{
  "name": "Ada Customer",
  "email": "ada@example.com",
  "password": "minimum-password",
  "role": "CUSTOMER"
}
```

Public registration accepts only `CUSTOMER` and `HOST`. Admin users are seeded.

Login response data:

```json
{
  "token": "jwt-or-session-token",
  "user": {
    "id": "uuid",
    "name": "Ada Host",
    "email": "ada@example.com",
    "role": "HOST"
  }
}
```

## Listing endpoints

```text
POST   /listings                 HOST
GET    /listings/{id}            Public if APPROVED; owner/admin otherwise
PATCH  /listings/{id}            HOST owner
DELETE /listings/{id}            HOST owner; soft delete
GET    /hosts/me/listings        HOST
```

Create/update request:

```json
{
  "name": "Sunny Apartment",
  "description": "Two-bedroom apartment near downtown.",
  "address": "1 Main Street",
  "city": "Austin",
  "state": "TX",
  "zipCode": "78701",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "pricePerNightCents": 12500,
  "maxGuests": 4,
  "photoUrls": ["https://example.com/photo.jpg"]
}
```

New listings enter `PENDING_APPROVAL`. Any host update to an approved listing returns it to `PENDING_APPROVAL`. `DELETE` sets status to `REMOVED`; it does not delete the database row.

## Search endpoint

```text
GET /search/listings
```

Required query parameters:

```text
checkIn=2026-07-10
checkOut=2026-07-14
guests=2
```

Optional query parameters:

```text
city=Austin
state=TX
zipCode=78701
```

Search returns only approved listings with sufficient capacity and no overlapping confirmed booking.

Location autocomplete endpoint:

```text
GET /search/locations
```

It returns distinct values from approved listing addresses:

```json
[
  { "city": "Austin", "state": "TX", "zipCodes": ["78701", "78703"] }
]
```

When supplied, `city`, `state`, and `zipCode` must match an approved listing address. The UI uses controlled searchable selects, filters state by city, and filters ZIP code by city and state.

## Booking endpoints

```text
POST /bookings                 CUSTOMER
GET  /bookings                 CUSTOMER
GET  /bookings/{id}            Customer owner or host owner
POST /bookings/{id}/cancel     Customer owner
```

Create request:

```json
{
  "listingId": "uuid",
  "checkIn": "2026-07-10",
  "checkOut": "2026-07-14",
  "guests": 2
}
```

Booking creation repeats all search validation inside one transaction and returns `201` with `status: "CONFIRMED"`.

## Review endpoints

```text
POST /bookings/{bookingId}/review    CUSTOMER owner
GET  /listings/{listingId}/reviews  Public for approved listing
```

Request:

```json
{
  "rating": 5,
  "comment": "Clean and comfortable."
}
```

A review is allowed only when the booking belongs to the customer, is not cancelled, and its check-out date is before today.

## Admin and analytics endpoints

```text
GET  /admin/listings/pending        ADMIN
POST /admin/listings/{id}/approve   ADMIN
POST /admin/listings/{id}/reject    ADMIN
GET  /admin/analytics?periodDays=30 ADMIN
GET  /hosts/me/analytics?periodDays=30 HOST
```

Valid `periodDays` values are `30`, `60`, and `90`.

Analytics response data:

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

Host analytics includes only that host's listings. Admin analytics includes all listings.

## Data model

### users

```text
id              UUID primary key
name            string, required
email           string, required, unique
password_hash   string, required
role            CUSTOMER | HOST | ADMIN
created_at      UTC timestamp
updated_at      UTC timestamp
```

### listings

```text
id                    UUID primary key
host_id               UUID -> users.id
name                  string, required
description           string, required
address               string, required
city                  string, required
state                 string, required
zip_code              string, required
latitude              decimal, nullable
longitude             decimal, nullable
price_per_night_cents integer, positive
max_guests            integer, positive
photo_urls            JSON array of strings, nullable
status                PENDING_APPROVAL | APPROVED | REJECTED | REMOVED
created_at            UTC timestamp
updated_at            UTC timestamp
```

### bookings

```text
id               UUID primary key
listing_id       UUID -> listings.id
customer_id      UUID -> users.id
check_in         date
check_out        date
guests           integer, positive
total_cost_cents integer, non-negative
status           CONFIRMED | CANCELLED
created_at       UTC timestamp
updated_at       UTC timestamp
```

### reviews

```text
id          UUID primary key
booking_id  UUID -> bookings.id, unique
listing_id  UUID -> listings.id
customer_id UUID -> users.id
rating      integer from 1 to 5
comment     string, nullable
created_at  UTC timestamp
updated_at  UTC timestamp
```

Required constraints:

- `users.email` is unique, case-insensitively if supported.
- `price_per_night_cents > 0`.
- `max_guests > 0`.
- `check_out > check_in`.
- Booking duration is no more than 14 nights.
- `guests > 0`.
- A review has a unique `booking_id`.
- A confirmed booking cannot overlap another confirmed booking for the same listing.

For half-open ranges `[existing.check_in, existing.check_out)` and `[new.check_in, new.check_out)`, the ranges overlap when:

```text
existing.check_in < new.check_out
AND existing.check_out > new.check_in
```

Apply this check inside the booking transaction.

## Response shapes

Listing:

```json
{
  "id": "uuid",
  "hostId": "uuid",
  "name": "Sunny Apartment",
  "description": "Two-bedroom apartment near downtown.",
  "address": "1 Main Street",
  "city": "Austin",
  "state": "TX",
  "zipCode": "78701",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "pricePerNightCents": 12500,
  "maxGuests": 4,
  "photoUrls": ["https://example.com/photo.jpg"],
  "status": "APPROVED"
}
```

Search result:

```json
{
  "id": "uuid",
  "name": "Sunny Apartment",
  "city": "Austin",
  "state": "TX",
  "zipCode": "78701",
  "photoUrls": ["https://example.com/photo.jpg"],
  "pricePerNightCents": 12500,
  "maxGuests": 4,
  "averageRating": 4.5,
  "reviewCount": 2
}
```

Booking:

```json
{
  "id": "uuid",
  "listingId": "uuid",
  "listingName": "Sunny Apartment",
  "listingPhotoUrl": "https://example.com/photo.jpg",
  "customerId": "uuid",
  "checkIn": "2026-07-10",
  "checkOut": "2026-07-14",
  "guests": 2,
  "totalCostCents": 50000,
  "status": "CONFIRMED"
}
```

Review:

```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "listingId": "uuid",
  "customerId": "uuid",
  "rating": 5,
  "comment": "Clean and comfortable."
}
```
