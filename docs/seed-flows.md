# Seeded Test Flows

The backend seeds these accounts on startup when `SEED_DEMO_DATA=true`. Seeding is idempotent: existing rows are not overwritten, and missing fixtures are added.

All seeded passwords are development-only.

The two review-flow bookings use approved, photo-backed properties: `customer.review@example.com` stays at **Sunny Austin Apartment**, and `customer.reviewed@example.com` stays at **Analytics Family Home**. Their bookings are in the past, so both properties remain available in search for non-overlapping future dates and include a property image.

The default seed also includes 18 additional approved listings across 10 states. The Bay Area has extra coverage: four San Jose listings plus listings in San Francisco, Oakland, Palo Alto, and Berkeley. All added listings include a public photo URL and are available for future-date searches.

`reviewer@example.com` is a review-only customer. The seed gives this account a past booking and one review for every seeded listing, including the expanded catalog.

## Accounts

| Role | Email | Password | Use for |
|---|---|---|---|
| Customer | `customer@example.com` | `Customer123!` | Search and test a fully booked listing |
| Customer | `customer.cancel@example.com` | `Customer123!` | Cancel a future confirmed booking |
| Customer | `customer.review@example.com` | `Customer123!` | Submit a review for a past booking |
| Customer | `customer.reviewed@example.com` | `Customer123!` | Verify duplicate-review rejection |
| Customer | `customer.cancelled@example.com` | `Customer123!` | Verify cancelled bookings do not block dates |
| Customer | `reviewer@example.com` | `Reviewer123!` | Review every seeded property |
| Host | `host@example.com` | `Host123!` | Manage approved listings |
| Host | `host.pending@example.com` | `Host123!` | Create and manage a pending listing |
| Host | `host.analytics@example.com` | `Host123!` | View host analytics |
| Admin | `admin@example.com` | `Admin123!` | Approve/reject listings and view global analytics |

## Customer flows

### Search and unavailable dates

1. Log in as `customer@example.com`.
2. Search Austin for dates 10–13 days from today with two guests.
3. Open **Booked Downtown Loft**.
4. It should not appear for those dates because it has a confirmed booking.

### Book and cancel

1. Log in as `customer.cancel@example.com`.
2. Search for dates 7–10 days from today.
3. Book **Sunny Austin Apartment**.
4. Open **My bookings**.
5. Cancel the new booking.
6. The status should become `CANCELLED`.

### Submit a past review

1. Log in as `customer.review@example.com`.
2. Open **My bookings**.
3. Select the past booking's **Review stay** action.
4. Submit a rating and comment.
5. Return to the listing and confirm the review is visible.

### Duplicate review rejection

1. Log in as `customer.reviewed@example.com`.
2. Open **My bookings**.
3. Try to review the past booking again.
4. The API should reject it with `REVIEW_ALREADY_EXISTS`.

### Review coverage

1. Log in as `reviewer@example.com`.
2. Open **My bookings** to see the seeded past stays.
3. Open any approved property from search.
4. Confirm its review summary and seeded comment are visible.

## Host flows

### Create and edit a listing

1. Log in as `host.pending@example.com`.
2. Open **My listings** and choose **Add listing**.
3. Create a listing.
4. Confirm it has status `PENDING_APPROVAL`.
5. Edit it and confirm it remains pending.

### Host analytics

1. Log in as `host.analytics@example.com`.
2. Open **Analytics**.
3. Switch between 30, 60, and 90 days.
4. Confirm the dashboard only reports that host's listings.

## Admin flows

### Approve a listing

1. Log in as `admin@example.com`.
2. Open **Moderation**.
3. Approve **Pending Hill Country Cabin**.
4. Log in as a customer and confirm it appears in search.

### Reject a listing

1. Create another listing as `host.pending@example.com`, or use an unapproved fixture.
2. Log in as `admin@example.com`.
3. Reject it from **Moderation**.
4. Confirm it does not appear in customer search.

### Admin analytics

1. Log in as `admin@example.com`.
2. Open **Analytics**.
3. Switch between 30, 60, and 90 days.
4. Confirm the dashboard includes listings from multiple hosts.

## Resetting local fixtures

To return to a clean deterministic seed, stop the backend, delete the local SQLite database, and restart it:

```powershell
Remove-Item backend\vacation_rental.db
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```
