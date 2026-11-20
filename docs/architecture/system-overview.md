# System Overview

## Architecture style

Use a modular monolith with a REST/JSON API.

```text
Browser/mobile UI
        |
        v
Application Load Balancer
        |
        v
Backend application instances
        |
        +--> PostgreSQL database
        +--> Google Maps API for listing map markers
```

The backend owns all business rules. The frontend is responsible for presentation, form state, and calling the API; it must not decide whether a booking is valid.

## Runtime components

### Frontend

The web UI provides role-specific screens and calls the backend through the API contract. It must hide or protect screens based on the authenticated role, but the backend remains the final authorization authority.

### Backend

The backend exposes JSON endpoints, validates input, authenticates users, enforces authorization, applies business rules, and persists data.

### Database

Use a relational database. PostgreSQL is recommended. Migrations must be committed and run automatically during deployment or through a documented command.

### Listing photos

The MVP stores one or more photo URLs for a listing. Seeded public URLs are sufficient; no upload service or object storage is required.
Booking responses expose the first listing photo as `listingPhotoUrl` so the customer bookings page can identify the booked property without another request.

### Maps

The MVP displays a Google Maps marker on the listing details page. Search by coordinates is not required. If the API key is unavailable during local development, show the address and a graceful “map unavailable” state.

## Request lifecycle

```text
HTTP request
  -> route/controller
  -> authentication middleware
  -> role authorization
  -> request validation
  -> module service
  -> repository/database
  -> response mapper
  -> JSON response
```

Controllers must remain thin. Business decisions belong in services/use cases. Database queries belong in repositories or query objects.

## Core business rules

- Only `APPROVED` listings are visible in customer search.
- A stay must be at least one night and no more than 14 nights.
- Guest count must be greater than zero and no greater than the listing's `maxGuests`.
- A confirmed booking prevents another confirmed booking for an overlapping date range on the same listing.
- A customer can cancel only their own booking.
- A customer can review only their own completed/past booking, and only once.
- A host can manage only their own listings.
- An admin can approve or reject any pending listing and view global analytics.

## Status values

These values are part of the contract and must not be silently renamed:

```text
UserRole: CUSTOMER | HOST | ADMIN
ListingStatus: PENDING_APPROVAL | APPROVED | REJECTED | REMOVED
BookingStatus: CONFIRMED | CANCELLED
```

## Date and money conventions

- API dates use `YYYY-MM-DD`.
- Date ranges are half-open: `[checkIn, checkOut)`. A guest checking out on a date does not conflict with a new guest checking in on that date.
- Store timestamps in UTC.
- Store money as integer cents in the database and return amounts as integer cents in JSON. Example: `$125.50` is `12550`.
- The initial currency is USD.

## Minimal deployment

Development runs with a frontend, backend, and PostgreSQL database. The demo deployment uses a load balancer, an auto-scaled backend cluster, and a managed PostgreSQL database. Do not add Kubernetes, service discovery, queues, or separate deployments per module.
