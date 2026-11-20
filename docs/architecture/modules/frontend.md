# Frontend Module

## Responsibility

Provide the minimum screens required to demonstrate the customer, host, and admin flows.

## Routes

```text
/login
/register
/search
/listings/:id
/bookings
/bookings/:id/review
/host/listings
/host/listings/new
/host/listings/:id/edit
/host/analytics
/admin/listings
/admin/analytics
```

## Screen behavior

### Customer

- Search form: check-in, check-out, guests, optional searchable city/state/ZIP selects from approved listing addresses; state and ZIP options are dependent on earlier selections.
- Results list: photo, name, location, price, rating, and availability.
- Details page: listing information, map if available, reviews, and booking action.
- Bookings page: booked property image and name, upcoming/past booking details, and cancel action.
- Review form: rating and optional comment for eligible bookings.

### Host

- Listing list with create, edit, and remove actions.
- Listing form matching the listing API input.
- Analytics page with period selector limited to 30, 60, 90.

### Admin

- Pending listing table with approve/reject actions.
- Analytics page with period selector limited to 30, 60, 90.

## Rules

- Use the documented API response and error envelopes.
- Disable submit buttons while a request is in progress.
- Display field validation errors next to the relevant field.
- Display API business errors in a visible message.
- City, state, and ZIP filters must be selected from the controlled options; state filters by city and ZIP filters by city/state.
- Check-in, check-out, and guest count are stored in tab-scoped session storage and reused on every date-based customer screen.
- Route guards improve UX but do not replace backend authorization.
- Keep API calls in feature API clients, not directly in presentational components.

## Acceptance tests

- A customer can search, view details, book, cancel, and review.
- A host can create a listing and see it waiting for approval.
- An admin can approve the listing.
- The approved listing appears in customer search.
