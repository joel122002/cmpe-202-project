from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .errors import error_response, validation_exception_handler
from .routers import admin, auth, bookings, listings, reviews, search

app = FastAPI(title='Stayfinder API')
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    code = {401: 'AUTH_UNAUTHENTICATED', 403: 'AUTH_FORBIDDEN', 404: 'RESOURCE_NOT_FOUND', 409: 'BOOKING_DATE_UNAVAILABLE'}.get(exc.status_code, 'VALIDATION_ERROR')
    return error_response(exc.status_code, code, str(exc.detail))
app.include_router(auth.router, prefix='/api/v1')
app.include_router(listings.router, prefix='/api/v1')
app.include_router(search.router, prefix='/api/v1')
app.include_router(bookings.router, prefix='/api/v1')
app.include_router(reviews.router, prefix='/api/v1')
app.include_router(admin.router, prefix='/api/v1')


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/api/v1/health')
def api_health():
    return {'data': {'status': 'ok'}, 'error': None}
