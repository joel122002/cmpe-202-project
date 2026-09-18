from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

from .errors import validation_exception_handler

app = FastAPI(title='Stayfinder API')
app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/api/v1/health')
def api_health():
    return {'data': {'status': 'ok'}, 'error': None}
