from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import get_settings
from .db import Base, SessionLocal, engine
from .errors import error_response, validation_exception_handler
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
    code = {
        401: "AUTH_UNAUTHENTICATED",
        403: "AUTH_FORBIDDEN",
        404: "RESOURCE_NOT_FOUND",
        409: "BOOKING_DATE_UNAVAILABLE",
    }.get(exc.status_code, "VALIDATION_ERROR")
    message = str(exc.detail)
    if "already exists" in message.lower():
        code = "REVIEW_ALREADY_EXISTS"
    elif "already registered" in message.lower():
        code = "VALIDATION_ERROR"
    if "already cancelled" in message.lower():
        code = "BOOKING_ALREADY_CANCELLED"
    elif "guest" in message.lower() or "stay" in message.lower() or "checkout" in message.lower():
        code = "VALIDATION_ERROR"
    elif "review" in message.lower():
        code = "REVIEW_NOT_ELIGIBLE"
    elif "email" in message.lower():
        code = "VALIDATION_ERROR"
    return error_response(exc.status_code, code, message)


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
