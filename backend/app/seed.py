from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Role, User
from .security import hash_password


def get_or_create_user(db: Session, name: str, email: str, password: str, role: Role) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user:
        return user
    user = User(name=name, email=email, password_hash=hash_password(password), role=role.value)
    db.add(user)
    db.flush()
    return user
