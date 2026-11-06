from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_role
from ..models import Listing, Review, Role, User
from ..modules import listings as listing_service
from ..modules import reviews as service
from ..schemas import ReviewInput

router = APIRouter(tags=["reviews"])


@router.post("/bookings/{booking_id}/review", response_model=dict, status_code=201)
def create(
    booking_id: str,
    data: ReviewInput,
    customer: User = Depends(require_role(Role.CUSTOMER)),
    db: Session = Depends(get_db),
):
    return {"data": service.to_dict(service.create(db, customer, booking_id, data)), "error": None}


@router.get("/listings/{listing_id}/reviews", response_model=dict)
def list_reviews(listing_id: str, db: Session = Depends(get_db)):
    listing = listing_service.get_visible(db, listing_id)
    reviews = db.scalars(select(Review).where(Review.listing_id == listing.id).order_by(Review.created_at.desc())).all()
    return {"data": [service.to_dict(review) for review in reviews], "error": None}
