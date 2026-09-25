from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

from .errors import validation_exception_handler
from .routers import auth

app = FastAPI(title='Stayfinder API')
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.include_router(auth.router, prefix='/api/v1')


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/api/v1/health')
def api_health():
    return {'data': {'status': 'ok'}, 'error': None}
