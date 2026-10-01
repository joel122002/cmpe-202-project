from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import optional_user, require_role
from ..models import Listing, Role, User
from ..modules import listings as service
from ..schemas import ListingInput

router = APIRouter(tags=["listings"])


@router.post("/listings", response_model=dict, status_code=201)
def create(data: ListingInput, host: User = Depends(require_role(Role.HOST)), db: Session = Depends(get_db)):
    return {"data": service.to_dict(service.create(db, host, data)), "error": None}


@router.delete("/listings/{listing_id}", response_model=dict)
def remove(listing_id: str, host: User = Depends(require_role(Role.HOST)), db: Session = Depends(get_db)):
    service.remove(db, host, listing_id)
    return {"data": None, "error": None}


@router.get("/hosts/me/listings", response_model=dict)
def host_listings(host: User = Depends(require_role(Role.HOST)), db: Session = Depends(get_db)):
    listings = db.query(Listing).filter(Listing.host_id == host.id).order_by(Listing.created_at.desc()).all()
    return {"data": [service.to_dict(listing) for listing in listings], "error": None}
