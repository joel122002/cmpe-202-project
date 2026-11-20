# Parallel Development Rules

The project is designed for parallel implementation by multiple contributors or coding agents.

## Work allocation

Ownership is split into four mutually exclusive areas:

| Owner | Responsibility | Current folders/files |
|---|---|---|
| Joel Varghese | Platform, auth, integration, shared contracts | `backend/app/main.py`, `config.py`, `db.py`, `deps.py`, `errors.py`, `models.py`, `schemas.py`, `security.py`, `modules/common.py`, `modules/auth.py`, `routers/auth.py`, `frontend/src/api.js`, `main.jsx`, `styles.css`, shared app wiring, Docker, shared docs |
| Sagar Parker | Listings and customer discovery | `backend/app/modules/listings.py`, `routers/listings.py`, `routers/search.py`, listing/search screens, listings/search docs |
| Sonit Kumar Pradhan | Bookings and reviews | `backend/app/modules/bookings.py`, `modules/reviews.py`, `routers/bookings.py`, `routers/reviews.py`, booking/review screens, bookings/reviews docs |
| Mathew Olickal | Admin, analytics, and seed data | `backend/app/modules/analytics.py`, `routers/admin.py`, `routers/analytics.py`, `seed.py`, host/admin screens, operations/seed docs |

`frontend/src/App.jsx` is route composition only; feature screens are owned by the corresponding person. Shared files are changed by Joel through an interface change reviewed by the affected owner.

Ownership does not prevent review or small fixes by other contributors. It identifies the person responsible for keeping the module complete and its contract accurate.

## Before coding

The coding agent must:

1. Read this architecture directory.
2. Read the target module document.
3. Read `docs/architecture/contracts.md`.
4. Inspect existing code and migrations.
5. Check the current branch for uncommitted changes.
6. Avoid changing another module's public contract without a coordinated update.

## Interface-first workflow

When a module is implemented in parallel:

1. Create or confirm DTOs/types from the API contract.
2. Create service interfaces and test fixtures.
3. Implement the module behind those interfaces.
4. Add integration wiring only after the interface is stable.
5. Add a small end-to-end test covering the public flow.

The frontend may use local fixtures matching the documented JSON while the backend is still being implemented.

## Cross-module calls

Use public service interfaces or read-only query interfaces. For example:

```text
Bookings -> ListingReader.getBookableListing(listingId)
Reviews  -> BookingReader.getReviewEligibility(bookingId, customerId)
Admin    -> ListingModeration.approve(listingId)
Analytics -> ReportingQueries.bookingSummary(criteria)
```

Do not call another module's repository directly.

## Pull request rules

Each pull request should:

- change one coherent module or integration concern;
- include tests for changed business rules;
- describe any contract changes;
- avoid drive-by formatting of unrelated files;
- leave the application buildable.

If an interface must change, update the contract markdown and both consumers in the same pull request, or add a backwards-compatible field first.

## Definition of integration readiness

A module is ready to integrate when:

- it compiles/builds;
- its migrations are repeatable;
- its endpoints return the standard response/error envelope;
- role checks are covered;
- happy path and main failure paths are tested;
- seeded data can demonstrate it in the UI.
