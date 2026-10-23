from threading import Lock

from fastapi import HTTPException
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from ..models import Booking, BookingStatus, Listing, ListingStatus, User
from ..schemas import BookingInput
from .common import nights, overlaps

booking_lock = Lock()
CANCELABLE_STATUSES = {BookingStatus.CONFIRMED.value}


def to_dict(booking: Booking, listing: Listing | None = None) -> dict:
    return {
        "id": booking.id,
        "listingId": booking.listing_id,
        "listingName": listing.name if listing else None,
        "listingPhotoUrl": (listing.photo_urls or [None])[0] if listing else None,
        "customerId": booking.customer_id,
        "checkIn": booking.check_in,
        "checkOut": booking.check_out,
        "guests": booking.guests,
        "totalCostCents": booking.total_cost_cents,
        "status": booking.status,
    }


def create(db: Session, customer: User, data: BookingInput) -> Booking:
    stay_nights = nights(data.checkIn, data.checkOut)
    with booking_lock:
        listing = db.scalar(select(Listing).where(Listing.id == data.listingId).with_for_update())
        if not listing or listing.status != ListingStatus.APPROVED.value:
            raise HTTPException(404, "Listing was not found")
        if data.guests > listing.max_guests:
            raise HTTPException(400, "Guest count exceeds listing capacity")
        existing = db.scalars(
            select(Booking).where(
                and_(
                    Booking.listing_id == listing.id,
                    Booking.status == BookingStatus.CONFIRMED.value,
                    Booking.check_in < data.checkOut,
                    Booking.check_out > data.checkIn,
                )
            )
        ).all()
        if existing:
            raise HTTPException(409, "Listing is unavailable for these dates")
        booking = Booking(
            listing_id=listing.id,
            customer_id=customer.id,
            check_in=data.checkIn,
            check_out=data.checkOut,
            guests=data.guests,
            total_cost_cents=stay_nights * listing.price_per_night_cents,
            status=BookingStatus.CONFIRMED.value,
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking


def get_for_actor(db: Session, actor: User, booking_id: str) -> Booking:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Booking was not found")
    listing = db.get(Listing, booking.listing_id)
    allowed = actor.role == "ADMIN" or actor.id in {booking.customer_id, listing.host_id if listing else None}
    if not allowed:
        raise HTTPException(403, "Booking is not accessible")
    return booking


def cancel(db: Session, customer: User, booking_id: str) -> Booking:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Booking was not found")
    if booking.customer_id != customer.id:
        raise HTTPException(403, "Booking does not belong to this customer")
    if booking.status not in CANCELABLE_STATUSES:
        raise HTTPException(400, "Booking is already cancelled")
    booking.status = BookingStatus.CANCELLED.value
    db.commit()
    db.refresh(booking)
    return booking
