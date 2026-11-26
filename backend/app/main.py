from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import get_settings
from .db import Base, SessionLocal, engine
from .errors import APIError, error_response, validation_exception_handler
from .routers import admin, analytics, auth, bookings, listings, reviews, search
from .seed import seed_demo_data

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # shortcut: SQLAlchemy creates the prototype schema; use Alembic before production migrations.
    Base.metadata.create_all(bind=engine)
    if settings.seed_demo_data:
        with SessionLocal() as db:
            seed_demo_data(db)
    yield


app = FastAPI(title="Vacation Rental API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    default_code = {
        401: "AUTH_UNAUTHENTICATED",
        403: "AUTH_FORBIDDEN",
        404: "RESOURCE_NOT_FOUND",
    }.get(exc.status_code, "VALIDATION_ERROR")
    code = exc.code if isinstance(exc, APIError) else default_code
    return error_response(exc.status_code, code, str(exc.detail))


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/v1/health")
def api_health():
    return {"data": {"status": "ok"}, "error": None}


app.include_router(auth.router, prefix="/api/v1")
app.include_router(listings.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
