from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def error_response(status_code: int, code: str, message: str, field_errors: dict[str, str] | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"data": None, "error": {"code": code, "message": message, "fieldErrors": field_errors or {}}},
    )


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    fields = {}
    for error in exc.errors():
        location = error.get("loc", [])
        field = str(location[-1]) if location else "request"
        fields[field] = error.get("msg", "Invalid value")
    return error_response(400, "VALIDATION_ERROR", "Request validation failed.", fields)
