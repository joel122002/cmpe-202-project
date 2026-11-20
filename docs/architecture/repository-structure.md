# Repository Structure

The repository should use this structure. A coding agent may create missing directories but should not move another contributor's module without agreement.

```text
/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── listings/
│   │   ├── search/
│   │   ├── bookings/
│   │   ├── reviews/
│   │   ├── analytics/
│   │   ├── admin/
│   │   ├── common/
│   │   └── app/
│   ├── tests/
│   ├── migrations/
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── host/
│   │   ├── admin/
│   │   ├── shared/
│   │   └── app/
│   └── README.md
├── database/
│   └── seed-data/
├── docs/
│   ├── architecture/
│   ├── wireframes/
│   └── project-journal/
├── docker-compose.yml
└── README.md
```

## Backend module layout

Each backend module should follow the same layout, adapted to the chosen framework:

```text
<module>/
├── controller/       # HTTP routes and request/response mapping only
├── service/          # business use cases and rules
├── repository/       # persistence queries owned by this module
├── model/            # module entities/value objects
├── dto/              # API input/output types
└── <module>.test.*   # tests near the implementation or in backend/tests
```

## Dependency rule

Allowed direction:

```text
controller -> service -> repository
```

A module may call another module's **public service interface**, but may not import its repository, controller, private model, or database table directly.

The `common` module may contain cross-cutting concerns only:

- authentication context
- error types
- validation helpers
- logging
- configuration

Do not put business logic into `common`.

## Frontend module layout

Frontend features should own their pages, API calls, and feature-specific components. Shared components must be generic and reusable. A feature must not import another feature's internal components.
