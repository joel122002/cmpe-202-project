from datetime import date

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..errors import APIError
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


def create(db: Session, customer: User, booking_id: str, data: ReviewInput) -> Review:
    booking = db.get(Booking, booking_id)
    if not booking or booking.customer_id != customer.id:
        raise APIError(403, "REVIEW_NOT_ELIGIBLE", "Review is not eligible for this customer")
    if booking.status == BookingStatus.CANCELLED.value or booking.check_out >= date.today():
        raise APIError(400, "REVIEW_NOT_ELIGIBLE", "Review is available after the booking has ended")
    existing_review = select(Review.id).where(Review.booking_id == booking_id)
    if db.scalar(existing_review):
        raise APIError(409, "REVIEW_ALREADY_EXISTS", "A review already exists for this booking")
    review = Review(
        booking_id=booking.id,
        listing_id=booking.listing_id,
        customer_id=customer.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        if db.scalar(existing_review):
            raise APIError(409, "REVIEW_ALREADY_EXISTS", "A review already exists for this booking") from exc
        raise
    db.refresh(review)
    return review
