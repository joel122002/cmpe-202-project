# Vacation Rental MVP

FastAPI + React implementation of the vacation-rental MVP described in [`docs/architecture`](docs/architecture/README.md).

## Architecture diagrams

See the [UML diagram sources and exports](docs/architecture/diagrams/README.md) for the component architecture, domain classes, role-based use cases, local Docker deployment, and [proposed AWS deployment with ALB and EC2 Auto Scaling](docs/architecture/diagrams/aws-architecture.svg).

## Local development

Start the backend in one terminal:

```powershell
cd backend
..\backend\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Start the frontend in another:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Docker

```powershell
docker compose up --build
```

## Demo accounts

See [`docs/seed-flows.md`](docs/seed-flows.md) for all seeded users and the flow each one is intended to test.

## Verification

```powershell
backend\.venv\Scripts\python -m pytest backend/tests -q
cd frontend
npm run build
```

The implementation intentionally excludes payments, messaging, notifications, favorites, dynamic pricing, uploads, and microservices.
