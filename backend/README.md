# FastAPI backend

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API starts at `http://localhost:8000`. Swagger documentation is at `/docs`.

The default database is SQLite. Set `DATABASE_URL` to a PostgreSQL URL for deployment. Demo data is enabled by default.

## Demo accounts

```text
customer@example.com / Customer123!
host@example.com     / Host123!
admin@example.com    / Admin123!
reviewer@example.com / Reviewer123!
```

The seeded reviewer account owns past bookings and one review for every seeded listing, so the customer catalog has review data by default.

## Tests

From the repository root:

```powershell
backend\.venv\Scripts\python -m pytest backend/tests -q
```

The prototype uses `Base.metadata.create_all()` at startup. `shortcut: replace startup schema creation with Alembic migrations before production data exists.`
