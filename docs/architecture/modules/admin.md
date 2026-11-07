# Admin Module

## Responsibility

Provide admin-only moderation actions and compose global analytics access.

## Public operations

```text
listPendingListings(adminId) -> Listing[]
approveListing(adminId, listingId) -> Listing
rejectListing(adminId, listingId) -> Listing
getAdminAnalytics(adminId, periodDays) -> AnalyticsSummary
```

## Rules

- Every operation requires role `ADMIN`.
- Approval changes a pending listing to `APPROVED`.
- Rejection changes a pending listing to `REJECTED`.
- Admin must not bypass the listings module's status transition logic.

## Acceptance tests

- Customer and host receive `403` from admin endpoints.
- Admin can view pending listings.
- Admin approval makes a listing visible to search.
- Admin rejection keeps a listing out of customer search.
