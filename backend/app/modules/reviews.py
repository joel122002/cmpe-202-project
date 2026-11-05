from datetime import date

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Booking, BookingStatus, Review, User
from ..schemas import ReviewInput


def to_dict(review: Review) -> dict:
    return {
        "id": review.id,
        "bookingId": review.booking_id,
        "listingId": review.listing_id,
        "customerId": review.customer_id,
        "rating": review.rating,
        "comment": review.comment,
    }


def rating_summary(db: Session, listing_id: str) -> tuple[float, int]:
    average, count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing_id)
    ).one()
    return round(float(average or 0), 1), int(count or 0)


def create(db: Session, customer: User, booking_id: str, data: ReviewInput) -> Review:
    booking = db.get(Booking, booking_id)
    if not booking or booking.customer_id != customer.id:
        raise HTTPException(403, "Review is not eligible for this customer")
    if booking.status == BookingStatus.CANCELLED.value or booking.check_out >= date.today():
        raise HTTPException(400, "Review is available after the booking has ended")
    if db.scalar(select(Review).where(Review.booking_id == booking_id)):
        raise HTTPException(409, "A review already exists for this booking")
    review = Review(
        booking_id=booking.id,
        listing_id=booking.listing_id,
        customer_id=customer.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
