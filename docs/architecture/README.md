# Vacation Rental MVP Architecture

This directory is the implementation contract for the vacation-rental MVP. A coding agent should read this file first, then read the module document for the area it is changing and the relevant contract files.

## Goal

Build a small, demonstrable vacation-rental application with three roles:

- **Customer:** search approved rentals, book an available rental, cancel a booking, and review a past booking.
- **Host:** create and maintain rental listings and view basic booking analytics.
- **Admin:** approve or reject listings and view system-wide booking analytics.

The application is a **modular monolith**: one backend deployable, one relational database, and one frontend. The modules are separated by code boundaries and API contracts, not by separate services.

## Required reading order

1. [`system-overview.md`](system-overview.md)
2. [`repository-structure.md`](repository-structure.md)
3. [`contracts.md`](contracts.md)
4. The module document being implemented
5. [`parallel-development.md`](parallel-development.md)

## Scope boundary

Implement only what is documented here. Do not add payments, chat, notifications, social login, password reset, favorites, dynamic pricing, video uploads, host approval of bookings, or microservices unless the team explicitly changes this architecture.

## Definition of done for a module

A module is complete when it has:

1. Its documented API or internal interface.
2. Input validation and the documented error codes.
3. Unit tests for business rules.
4. Integration tests for the module's critical API flow.
5. Seed data or a reproducible setup path where applicable.
6. No direct dependency on another module's database tables or internals.

## Source of truth

When implementation and documentation disagree, stop and update the documentation through a reviewed pull request before changing the public contract. The API and data contracts in this directory are the shared interface between parallel contributors.
