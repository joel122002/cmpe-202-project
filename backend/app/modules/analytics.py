from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Booking, BookingStatus, Listing, User


def validate_period(period_days: int) -> None:
    if period_days not in {30, 60, 90}:
        raise HTTPException(400, "periodDays must be 30, 60, or 90")


def summary(db: Session, period_days: int, host_id: str | None = None) -> dict:
    validate_period(period_days)
    start = date.today() - timedelta(days=period_days)
    listing_query = select(Listing)
    if host_id:
        listing_query = listing_query.where(Listing.host_id == host_id)
    listings = db.scalars(listing_query).all()
    listing_ids = [listing.id for listing in listings]
    if not listing_ids:
        return {"periodDays": period_days, "totalListings": 0, "totalBookings": 0, "bookingsByZipCode": []}
    rows = db.execute(
        select(Listing.zip_code, func.count(Booking.id))
        .join(Booking, Booking.listing_id == Listing.id)
        .where(
            Listing.id.in_(listing_ids),
            Booking.status == BookingStatus.CONFIRMED.value,
            Booking.check_in >= start,
        )
        .group_by(Listing.zip_code)
    ).all()
    total = sum(int(count) for _, count in rows)
    return {
        "periodDays": period_days,
        "totalListings": len(listings),
        "totalBookings": total,
        "bookingsByZipCode": [{"zipCode": zip_code, "bookingCount": int(count)} for zip_code, count in rows],
    }
