from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import current_user
from ..models import User
from ..modules import auth as auth_service
from ..schemas import AuthData, LoginRequest, RegisterRequest, UserOut
from ..security import create_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=dict, status_code=201)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = auth_service.register(db, request)
    return {"data": UserOut.model_validate(user).model_dump(), "error": None}


@router.post("/login", response_model=dict)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    auth = AuthData(token=create_token(user.id), user=UserOut.model_validate(user))
    return {"data": auth.model_dump(), "error": None}


@router.get("/me", response_model=dict)
def me(user: User = Depends(current_user)):
    return {"data": UserOut.model_validate(user).model_dump(), "error": None}
