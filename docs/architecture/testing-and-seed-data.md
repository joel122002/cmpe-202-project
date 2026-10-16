# Testing and Seed Data

## Test layers

### Unit tests

Test pure business rules without a database:

- date duration and overlap calculations;
- guest capacity validation;
- total cost calculation;
- role checks;
- review eligibility;
- analytics period validation.

### Integration tests

Use a test database or isolated database schema to verify:

- registration and login;
- listing ownership;
- admin moderation;
- booking transactions and overlap prevention;
- cancellation;
- one-review-per-booking;
- host/admin analytics scope.

### End-to-end smoke test

The minimum demo path is:

```text
Seed host/customer/admin
  -> host creates listing
  -> admin approves listing
  -> customer searches listing
  -> customer books listing
  -> customer cancels or waits until the check-out date passes
  -> customer submits a review for the past booking
  -> host/admin view analytics
```

## Required seed users

Use clearly documented development-only credentials:

```text
customer@example.com  CUSTOMER
host@example.com      HOST
admin@example.com     ADMIN
reviewer@example.com  CUSTOMER, review-only fixture owner
```

Passwords must be supplied through environment variables or a local seed configuration and must never be committed as production credentials.

## Required seed listings

Seed at least:

- one approved listing available for booking;
- one pending listing for admin moderation;
- one listing with a confirmed booking to demonstrate unavailable dates;
- approved photo-backed listings with past bookings for review and duplicate-review flows;
- listings in at least two ZIP codes for analytics.

The default catalog should cover multiple states, with additional San Jose and Bay Area listings so location autocomplete has useful regional variety. Added listings should have public photo URLs and no blocking future bookings.

Every seeded listing also receives a past confirmed booking and one review from the dedicated review-only customer. This keeps review summaries populated across the catalog while preserving the normal duplicate-review and customer-review flows.

## Test isolation

Tests must not depend on execution order or developer-local data. Each test creates or resets its own fixtures.
## Ownership

Mathew owns seed fixtures, analytics verification, and operational test data. Seed changes must remain idempotent and keep the documented demo flows valid.
