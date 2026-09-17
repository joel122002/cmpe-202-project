from fastapi import FastAPI

app = FastAPI(title='Stayfinder API')


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/api/v1/health')
def api_health():
    return {'data': {'status': 'ok'}, 'error': None}
