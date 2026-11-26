from datetime import date
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import BookingStatus, ListingStatus, Role


class ErrorBody(BaseModel):
    code: str
    message: str
    fieldErrors: dict[str, str] = Field(default_factory=dict)


class Envelope(BaseModel):
    data: Any | None = None
    error: ErrorBody | None = None


class RequestBody(BaseModel):
    model_config = ConfigDict(extra="forbid")


class RegisterRequest(RequestBody):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Role


class LoginRequest(RequestBody):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role

    model_config = ConfigDict(from_attributes=True)


class AuthData(BaseModel):
    token: str
    user: UserOut


class ListingInput(RequestBody):
    name: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1)
    address: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=80)
    state: str = Field(min_length=1, max_length=40)
    zipCode: str = Field(min_length=1, max_length=20)
    latitude: float | None = None
    longitude: float | None = None
    pricePerNightCents: int = Field(gt=0)
    maxGuests: int = Field(gt=0)
    photoUrls: list[str] = Field(default_factory=list)


class ListingOut(BaseModel):
    id: str
    hostId: str
    name: str
    description: str
    address: str
    city: str
    state: str
    zipCode: str
    latitude: float | None
    longitude: float | None
    pricePerNightCents: int
    maxGuests: int
    photoUrls: list[str]
    status: ListingStatus


class SearchResult(BaseModel):
    id: str
    name: str
    city: str
    state: str
    zipCode: str
    photoUrls: list[str]
    pricePerNightCents: int
    maxGuests: int
    averageRating: float
    reviewCount: int


class BookingInput(RequestBody):
    listingId: str
    checkIn: date
    checkOut: date
    guests: int = Field(gt=0)

class BookingOut(BaseModel):
    id: str
    listingId: str
    listingName: str | None
    listingPhotoUrl: str | None
    customerId: str
    checkIn: date
    checkOut: date
    guests: int
    totalCostCents: int
    status: BookingStatus


class ReviewInput(RequestBody):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewOut(BaseModel):
    id: str
    bookingId: str
    listingId: str
    customerId: str
    rating: int
    comment: str | None


class AnalyticsOut(BaseModel):
    periodDays: int
    totalListings: int
    totalBookings: int
    bookingsByZipCode: list[dict[str, int | str]]
