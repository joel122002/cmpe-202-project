from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import current_user, require_role
from ..models import Booking, Listing, Role, User
from ..modules import bookings as service
from ..schemas import BookingInput

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=dict, status_code=201)
def create(data: BookingInput, customer: User = Depends(require_role(Role.CUSTOMER)), db: Session = Depends(get_db)):
    booking = service.create(db, customer, data)
    return {"data": service.to_dict(booking, db.get(Listing, booking.listing_id)), "error": None}


@router.get("", response_model=dict)
def list_bookings(customer: User = Depends(require_role(Role.CUSTOMER)), db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.customer_id == customer.id).order_by(Booking.check_in.desc()).all()
    listings = {
        listing.id: listing
        for listing in db.scalars(select(Listing).where(Listing.id.in_({booking.listing_id for booking in bookings}))).all()
    }
    return {"data": [service.to_dict(booking, listings.get(booking.listing_id)) for booking in bookings], "error": None}


@router.get("/{booking_id}", response_model=dict)
def get_booking(booking_id: str, actor: User = Depends(current_user), db: Session = Depends(get_db)):
    booking = service.get_for_actor(db, actor, booking_id)
    return {"data": service.to_dict(booking, db.get(Listing, booking.listing_id)), "error": None}


@router.post("/{booking_id}/cancel", response_model=dict, status_code=200)
def cancel(booking_id: str, customer: User = Depends(require_role(Role.CUSTOMER)), db: Session = Depends(get_db)):
    booking = service.cancel(db, customer, booking_id)
    return {"data": service.to_dict(booking, db.get(Listing, booking.listing_id)), "error": None}
