from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_role
from ..models import Role, User
from ..modules import analytics

router = APIRouter(prefix="/hosts/me", tags=["analytics"])


@router.get("/analytics", response_model=dict)
def host_analytics(periodDays: int = 30, host: User = Depends(require_role(Role.HOST)), db: Session = Depends(get_db)):
    return {"data": analytics.summary(db, periodDays, host.id), "error": None}
