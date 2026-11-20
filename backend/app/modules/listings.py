from sqlalchemy import func, select
from sqlalchemy.orm import Session

from fastapi import HTTPException

from ..models import Listing, ListingStatus, Review, User
from ..schemas import ListingInput


def to_dict(listing: Listing) -> dict:
    return {
        "id": listing.id,
        "hostId": listing.host_id,
        "name": listing.name,
        "description": listing.description,
        "address": listing.address,
        "city": listing.city,
        "state": listing.state,
        "zipCode": listing.zip_code,
        "latitude": listing.latitude,
        "longitude": listing.longitude,
        "pricePerNightCents": listing.price_per_night_cents,
        "maxGuests": listing.max_guests,
        "photoUrls": listing.photo_urls or [],
        "status": listing.status,
    }


def rating_summary(db: Session, listing_id: str) -> tuple[float, int]:
    average, count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing_id)
    ).one()
    return round(float(average or 0), 1), int(count or 0)


def create(db: Session, host: User, data: ListingInput) -> Listing:
    listing = Listing(
        host_id=host.id,
        name=data.name.strip(),
        description=data.description.strip(),
        address=data.address.strip(),
        city=data.city.strip(),
        state=data.state.strip(),
        zip_code=data.zipCode.strip(),
        latitude=data.latitude,
        longitude=data.longitude,
        price_per_night_cents=data.pricePerNightCents,
        max_guests=data.maxGuests,
        photo_urls=data.photoUrls,
        status=ListingStatus.PENDING_APPROVAL.value,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def get_owned(db: Session, host: User, listing_id: str) -> Listing:
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(404, "Listing was not found")
    if listing.host_id != host.id:
        raise HTTPException(403, "Listing does not belong to this host")
    return listing


def get_visible(db: Session, listing_id: str, actor: User | None = None) -> Listing:
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(404, "Listing was not found")
    if listing.status != ListingStatus.APPROVED.value and not (
        actor and (actor.id == listing.host_id or actor.role == "ADMIN")
    ):
        raise HTTPException(404, "Listing was not found")
    return listing


def update(db: Session, host: User, listing_id: str, data: ListingInput) -> Listing:
    listing = get_owned(db, host, listing_id)
    for field, value in {
        "name": data.name.strip(),
        "description": data.description.strip(),
        "address": data.address.strip(),
        "city": data.city.strip(),
        "state": data.state.strip(),
        "zip_code": data.zipCode.strip(),
        "latitude": data.latitude,
        "longitude": data.longitude,
        "price_per_night_cents": data.pricePerNightCents,
        "max_guests": data.maxGuests,
        "photo_urls": data.photoUrls,
    }.items():
        setattr(listing, field, value)
    if listing.status == ListingStatus.APPROVED.value:
        listing.status = ListingStatus.PENDING_APPROVAL.value
    db.commit()
    db.refresh(listing)
    return listing


def remove(db: Session, host: User, listing_id: str) -> None:
    listing = get_owned(db, host, listing_id)
    listing.status = ListingStatus.REMOVED.value
    db.commit()


def moderate(db: Session, listing_id: str, status: ListingStatus) -> Listing:
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(404, "Listing was not found")
    if listing.status != ListingStatus.PENDING_APPROVAL.value:
        raise HTTPException(400, "Only pending listings can be moderated")
    listing.status = status.value
    db.commit()
    db.refresh(listing)
    return listing
