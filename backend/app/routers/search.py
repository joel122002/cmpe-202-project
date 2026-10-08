from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Booking, BookingStatus, Listing, ListingStatus, Review
from ..modules.common import nights

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/locations", response_model=dict)
def search_locations(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Listing.city, Listing.state, Listing.zip_code)
        .where(Listing.status == ListingStatus.APPROVED.value)
        .distinct()
    ).all()
    locations = {}
    for city, state, zip_code in rows:
        locations.setdefault((city, state), set()).add(zip_code)
    return {
        "data": [
            {"city": city, "state": state, "zipCodes": sorted(zip_codes)}
            for (city, state), zip_codes in sorted(locations.items())
        ],
        "error": None,
    }


@router.get("/listings", response_model=dict)
def search_listings(
    checkIn: date,
    checkOut: date,
    guests: int = Query(gt=0),
    city: str | None = None,
    state: str | None = None,
    zipCode: str | None = None,
    db: Session = Depends(get_db),
):
    nights(checkIn, checkOut)
    filters = [
        Listing.status == ListingStatus.APPROVED.value,
        Listing.max_guests >= guests,
        ~select(Booking.id)
        .where(
            and_(
                Booking.listing_id == Listing.id,
                Booking.status == BookingStatus.CONFIRMED.value,
                Booking.check_in < checkOut,
                Booking.check_out > checkIn,
            )
        )
        .exists(),
    ]
    if city:
        city = city.strip()
        if not db.scalar(
            select(Listing.id).where(
                Listing.status == ListingStatus.APPROVED.value,
                func.lower(Listing.city) == city.lower(),
            )
        ):
            raise HTTPException(400, "Choose a city from the available listings")
        filters.append(func.lower(Listing.city) == city.lower())
    if state:
        state = state.strip()
        state_filter = select(Listing.id).where(
            Listing.status == ListingStatus.APPROVED.value,
            func.lower(Listing.state) == state.lower(),
        )
        if city:
            state_filter = state_filter.where(func.lower(Listing.city) == city.lower())
        if not db.scalar(state_filter):
            raise HTTPException(400, "Choose a state from the available listings for this city")
        filters.append(func.lower(Listing.state) == state.lower())
    if zipCode:
        zipCode = zipCode.strip()
        zip_filter = select(Listing.id).where(
            Listing.status == ListingStatus.APPROVED.value,
            Listing.zip_code == zipCode,
        )
        if city:
            zip_filter = zip_filter.where(func.lower(Listing.city) == city.lower())
        if state:
            zip_filter = zip_filter.where(func.lower(Listing.state) == state.lower())
        if not db.scalar(zip_filter):
            raise HTTPException(400, "Choose a ZIP code from the available listings for this location")
        filters.append(Listing.zip_code == zipCode)
    rows = db.scalars(select(Listing).where(*filters).order_by(Listing.created_at.desc())).all()
    data = []
    for listing in rows:
        average, count = db.execute(
            select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing.id)
        ).one()
        data.append(
            {
                "id": listing.id,
                "name": listing.name,
                "city": listing.city,
                "state": listing.state,
                "zipCode": listing.zip_code,
                "photoUrls": listing.photo_urls or [],
                "pricePerNightCents": listing.price_per_night_cents,
                "maxGuests": listing.max_guests,
                "averageRating": round(float(average or 0), 1),
                "reviewCount": int(count or 0),
            }
        )
    return {"data": data, "error": None}
