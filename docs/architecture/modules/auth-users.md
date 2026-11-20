# Auth and Users Module

## Responsibility

Register customers and hosts, authenticate users, and provide the authenticated identity and role to protected modules.

## Public operations

```text
register(name, email, password, role) -> User
login(email, password) -> AuthResult
getCurrentUser(authContext) -> User
requireRole(authContext, role) -> void or forbidden error
```

## Rules

- Public registration accepts only `CUSTOMER` or `HOST`.
- Email must be unique.
- Passwords must be hashed; never store or return plain text passwords.
- Admin users are seeded or created by deployment configuration.
- Authentication failures use the same generic message for unknown email and wrong password.

## API

See [`../contracts.md`](../contracts.md).

## Acceptance tests

- A customer can register and log in.
- A host can register and log in.
- An admin can log in using seeded credentials.
- A customer cannot call host or admin endpoints.
- A host cannot access another host's listing-management endpoint.
- Password hashes and tokens are not included in user responses except the login token.
