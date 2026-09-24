from datetime import datetime, timedelta, timezone
import base64
import hashlib
import hmac
import secrets

from jose import JWTError, jwt

from .config import get_settings

ALGORITHM = "HS256"
PBKDF2_ITERATIONS = 600_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    encode = lambda value: base64.urlsafe_b64encode(value).decode()
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${encode(salt)}${encode(digest)}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected = password_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), base64.urlsafe_b64decode(salt), int(iterations)
        )
        return hmac.compare_digest(base64.urlsafe_b64encode(actual).decode(), expected)
    except (ValueError, TypeError):
        return False


def create_token(user_id: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(hours=24)
    return jwt.encode({"sub": user_id, "exp": expires}, get_settings().auth_secret, algorithm=ALGORITHM)


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, get_settings().auth_secret, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
