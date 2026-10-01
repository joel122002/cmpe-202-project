from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .errors import validation_exception_handler
from .routers import auth, listings

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
app.include_router(auth.router, prefix='/api/v1')
app.include_router(listings.router, prefix='/api/v1')


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/api/v1/health')
def api_health():
    return {'data': {'status': 'ok'}, 'error': None}
