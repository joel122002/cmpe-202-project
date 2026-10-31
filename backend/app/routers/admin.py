from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_role
from ..models import Listing, ListingStatus, Role, User
from ..modules import analytics, listings

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/listings/pending", response_model=dict)
def pending(_: User = Depends(require_role(Role.ADMIN)), db: Session = Depends(get_db)):
    rows = db.scalars(select(Listing).where(Listing.status == ListingStatus.PENDING_APPROVAL.value)).all()
    return {"data": [listings.to_dict(row) for row in rows], "error": None}


@router.post("/listings/{listing_id}/approve", response_model=dict)
def approve(listing_id: str, _: User = Depends(require_role(Role.ADMIN)), db: Session = Depends(get_db)):
    return {"data": listings.to_dict(listings.moderate(db, listing_id, ListingStatus.APPROVED)), "error": None}


@router.post("/listings/{listing_id}/reject", response_model=dict)
def reject(listing_id: str, _: User = Depends(require_role(Role.ADMIN)), db: Session = Depends(get_db)):
    return {"data": listings.to_dict(listings.moderate(db, listing_id, ListingStatus.REJECTED)), "error": None}


@router.get("/analytics", response_model=dict)
def admin_analytics(periodDays: int = 30, _: User = Depends(require_role(Role.ADMIN)), db: Session = Depends(get_db)):
    return {"data": analytics.summary(db, periodDays), "error": None}
