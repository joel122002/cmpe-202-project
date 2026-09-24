from sqlalchemy import func, select
from sqlalchemy.orm import Session

from fastapi import HTTPException

from ..models import Role, User
from ..schemas import RegisterRequest
from ..security import hash_password


def register(db: Session, request: RegisterRequest) -> User:
    if request.role == Role.ADMIN:
        raise HTTPException(400, "Public registration cannot create an admin")
    existing = db.scalar(select(User).where(func.lower(User.email) == request.email.lower()))
    if existing:
        raise HTTPException(409, "Email is already registered")
    user = User(
        name=request.name.strip(),
        email=request.email.lower(),
        password_hash=hash_password(request.password),
        role=request.role.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
