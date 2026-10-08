# Listings Module

## Responsibility

Manage rental listing content and lifecycle. This module owns listing data, host ownership checks, and listing status.

## Public operations

```text
createListing(hostId, listingInput) -> Listing
updateListing(hostId, listingId, listingInput) -> Listing
removeListing(actor, listingId) -> void
getListing(actor, listingId) -> Listing
listHostListings(hostId) -> Listing[]
approveListing(adminId, listingId) -> Listing
rejectListing(adminId, listingId) -> Listing
getBookableListing(listingId) -> BookableListing
```

`getBookableListing` is a read-only interface for the bookings module. It must return only the fields needed to validate a booking and calculate its total.

## Rules

- A host may mutate only listings where `listing.hostId == authenticatedUser.id`.
- A new listing starts as `PENDING_APPROVAL`.
- Any host update to an approved listing changes it to `PENDING_APPROVAL`.
- Customers can see only `APPROVED` listings.
- A removed or rejected listing cannot be booked.
- `removeListing` is a soft delete that sets status to `REMOVED`.
- `pricePerNightCents`, `maxGuests`, address, name, and description are required.
- Photo URLs are optional; the MVP does not require upload handling.

## Acceptance tests

- Host creates a pending listing.
- Admin approves it and it becomes searchable.
- Customer cannot see a pending listing in search.
- Host cannot edit another host's listing.
- Admin can reject/remove an inaccurate listing.

## Delivery boundary

Sagar owns listing lifecycle and detail data. Search consumes this module through its read-only listing interface.
