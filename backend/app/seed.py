from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Booking, BookingStatus, Listing, ListingStatus, Review, Role, User
from .security import hash_password


def get_or_create_user(db: Session, name: str, email: str, password: str, role: Role) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user:
        return user
    user = User(name=name, email=email, password_hash=hash_password(password), role=role.value)
    db.add(user)
    db.flush()
    return user


def get_or_create_listing(db: Session, host: User, values: dict) -> Listing:
    listing = db.scalar(select(Listing).where(Listing.name == values["name"]))
    if listing:
        return listing
    listing = Listing(host_id=host.id, **values)
    db.add(listing)
    db.flush()
    return listing


def get_or_create_booking(
    db: Session,
    listing: Listing,
    customer: User,
    check_in: date,
    check_out: date,
    guests: int,
    status: BookingStatus,
) -> Booking:
    booking = db.scalar(
        select(Booking).where(
            Booking.listing_id == listing.id,
            Booking.customer_id == customer.id,
            Booking.check_in == check_in,
        )
    )
    if booking:
        return booking
    booking = Booking(
        listing_id=listing.id,
        customer_id=customer.id,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        total_cost_cents=(check_out - check_in).days * listing.price_per_night_cents,
        status=status.value,
    )
    db.add(booking)
    db.flush()
    return booking


def get_or_create_review(db: Session, booking: Booking, customer: User, rating: int, comment: str) -> Review:
    review = db.scalar(select(Review).where(Review.booking_id == booking.id))
    if review:
        return review
    review = Review(
        booking_id=booking.id,
        listing_id=booking.listing_id,
        customer_id=customer.id,
        rating=rating,
        comment=comment,
    )
    db.add(review)
    db.flush()
    return review


def seed_demo_data(db: Session) -> None:
    """Add deterministic local fixtures without overwriting user-created data."""
    admin = get_or_create_user(db, "Demo Admin", "admin@example.com", "Admin123!", Role.ADMIN)
    host = get_or_create_user(db, "Approved Host", "host@example.com", "Host123!", Role.HOST)
    pending_host = get_or_create_user(db, "Pending Host", "host.pending@example.com", "Host123!", Role.HOST)
    analytics_host = get_or_create_user(db, "Analytics Host", "host.analytics@example.com", "Host123!", Role.HOST)
    search_customer = get_or_create_user(db, "Search Customer", "customer@example.com", "Customer123!", Role.CUSTOMER)
    cancel_customer = get_or_create_user(db, "Cancellation Customer", "customer.cancel@example.com", "Customer123!", Role.CUSTOMER)
    review_customer = get_or_create_user(db, "Review Customer", "customer.review@example.com", "Customer123!", Role.CUSTOMER)
    reviewed_customer = get_or_create_user(db, "Reviewed Customer", "customer.reviewed@example.com", "Customer123!", Role.CUSTOMER)
    cancelled_customer = get_or_create_user(db, "Cancelled Customer", "customer.cancelled@example.com", "Customer123!", Role.CUSTOMER)
    review_author = get_or_create_user(db, "Seed Review Author", "reviewer@example.com", "Reviewer123!", Role.CUSTOMER)

    approved = get_or_create_listing(db, host, {
        "name": "Sunny Austin Apartment",
        "description": "A simple two-bedroom apartment near downtown Austin.",
        "address": "1 Main Street",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78701",
        "latitude": 30.2672,
        "longitude": -97.7431,
        "price_per_night_cents": 12500,
        "max_guests": 4,
        "photo_urls": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900"],
        "status": ListingStatus.APPROVED.value,
    })
    pending = get_or_create_listing(db, pending_host, {
        "name": "Pending Hill Country Cabin",
        "description": "A cabin awaiting admin approval.",
        "address": "2 Oak Road",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78702",
        "latitude": 30.27,
        "longitude": -97.72,
        "price_per_night_cents": 18000,
        "max_guests": 3,
        "photo_urls": ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=900"],
        "status": ListingStatus.PENDING_APPROVAL.value,
    })
    booked = get_or_create_listing(db, host, {
        "name": "Booked Downtown Loft",
        "description": "A demo listing with unavailable dates.",
        "address": "3 Congress Avenue",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78703",
        "latitude": 30.28,
        "longitude": -97.75,
        "price_per_night_cents": 15000,
        "max_guests": 2,
        "photo_urls": ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900"],
        "status": ListingStatus.APPROVED.value,
    })
    analytics_listing = get_or_create_listing(db, analytics_host, {
        "name": "Analytics Family Home",
        "description": "An approved home used for host analytics.",
        "address": "4 River Road",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78704",
        "latitude": 30.25,
        "longitude": -97.76,
        "price_per_night_cents": 20000,
        "max_guests": 6,
        "photo_urls": ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900"],
        "status": ListingStatus.APPROVED.value,
    })
    listing_photos = [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900",
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=900",
    ]
    additional_listings = [
        ("host@example.com", {
            "name": "Willow Glen Garden Stay", "description": "A bright stay near Willow Glen shops and cafes.",
            "address": "1201 Lincoln Avenue", "city": "San Jose", "state": "CA", "zip_code": "95125",
            "latitude": 37.3062, "longitude": -121.8907, "price_per_night_cents": 16800, "max_guests": 4,
            "photo_urls": [listing_photos[0]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Downtown San Jose Loft", "description": "A walkable loft close to downtown San Jose dining.",
            "address": "88 South Market Street", "city": "San Jose", "state": "CA", "zip_code": "95113",
            "latitude": 37.3302, "longitude": -121.8896, "price_per_night_cents": 18200, "max_guests": 2,
            "photo_urls": [listing_photos[1]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "North San Jose Modern", "description": "A modern apartment near North San Jose offices.",
            "address": "2250 Orchard Parkway", "city": "San Jose", "state": "CA", "zip_code": "95134",
            "latitude": 37.4146, "longitude": -121.9292, "price_per_night_cents": 15700, "max_guests": 3,
            "photo_urls": [listing_photos[2]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Almaden Valley Home", "description": "A quiet home with easy access to Almaden trails.",
            "address": "6100 Camden Avenue", "city": "San Jose", "state": "CA", "zip_code": "95120",
            "latitude": 37.2325, "longitude": -121.8799, "price_per_night_cents": 21400, "max_guests": 6,
            "photo_urls": [listing_photos[3]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Mission Bay Sunlit Flat", "description": "A sunny flat near San Francisco waterfront parks.",
            "address": "700 Terry Francois Boulevard", "city": "San Francisco", "state": "CA", "zip_code": "94107",
            "latitude": 37.7687, "longitude": -122.3873, "price_per_night_cents": 23900, "max_guests": 3,
            "photo_urls": [listing_photos[0]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Bernal Heights Retreat", "description": "A cozy retreat with neighborhood views in San Francisco.",
            "address": "300 Cortland Avenue", "city": "San Francisco", "state": "CA", "zip_code": "94110",
            "latitude": 37.7397, "longitude": -122.4148, "price_per_night_cents": 22600, "max_guests": 4,
            "photo_urls": [listing_photos[1]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Lake Merritt Apartment", "description": "A comfortable apartment steps from Lake Merritt.",
            "address": "1900 Madison Street", "city": "Oakland", "state": "CA", "zip_code": "94610",
            "latitude": 37.8044, "longitude": -122.2585, "price_per_night_cents": 17200, "max_guests": 3,
            "photo_urls": [listing_photos[2]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Rockridge Family Home", "description": "A family-friendly home near Rockridge restaurants.",
            "address": "5400 College Avenue", "city": "Oakland", "state": "CA", "zip_code": "94618",
            "latitude": 37.8408, "longitude": -122.2517, "price_per_night_cents": 19800, "max_guests": 5,
            "photo_urls": [listing_photos[3]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Palo Alto Courtyard Stay", "description": "A calm courtyard stay near Stanford and downtown Palo Alto.",
            "address": "400 University Avenue", "city": "Palo Alto", "state": "CA", "zip_code": "94301",
            "latitude": 37.4450, "longitude": -122.1619, "price_per_night_cents": 24500, "max_guests": 3,
            "photo_urls": [listing_photos[0]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Berkeley Hills Hideaway", "description": "A peaceful hideaway above Berkeley with bay views.",
            "address": "1400 Spruce Street", "city": "Berkeley", "state": "CA", "zip_code": "94709",
            "latitude": 37.8796, "longitude": -122.2678, "price_per_night_cents": 18700, "max_guests": 4,
            "photo_urls": [listing_photos[1]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "South Lake Union Studio", "description": "A compact studio near Seattle waterfront offices.",
            "address": "500 Westlake Avenue N", "city": "Seattle", "state": "WA", "zip_code": "98109",
            "latitude": 47.6247, "longitude": -122.3395, "price_per_night_cents": 17600, "max_guests": 2,
            "photo_urls": [listing_photos[2]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Capitol Hill Denver Flat", "description": "A stylish flat close to Denver parks and dining.",
            "address": "900 East 11th Avenue", "city": "Denver", "state": "CO", "zip_code": "80218",
            "latitude": 39.7346, "longitude": -104.9750, "price_per_night_cents": 14900, "max_guests": 3,
            "photo_urls": [listing_photos[3]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "River North City Stay", "description": "A convenient Chicago stay near galleries and restaurants.",
            "address": "350 North Orleans Street", "city": "Chicago", "state": "IL", "zip_code": "60654",
            "latitude": 41.8897, "longitude": -87.6376, "price_per_night_cents": 19200, "max_guests": 4,
            "photo_urls": [listing_photos[0]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "South Beach Miami Escape", "description": "A bright escape near South Beach and the ocean.",
            "address": "1200 Collins Avenue", "city": "Miami Beach", "state": "FL", "zip_code": "33139",
            "latitude": 25.7814, "longitude": -80.1300, "price_per_night_cents": 21800, "max_guests": 4,
            "photo_urls": [listing_photos[1]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Chelsea Brownstone", "description": "A warm brownstone stay in the heart of Chelsea.",
            "address": "210 West 22nd Street", "city": "New York", "state": "NY", "zip_code": "10011",
            "latitude": 40.7442, "longitude": -73.9994, "price_per_night_cents": 26500, "max_guests": 4,
            "photo_urls": [listing_photos[2]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Back Bay Townhouse", "description": "A classic Boston stay close to the Public Garden.",
            "address": "125 Newbury Street", "city": "Boston", "state": "MA", "zip_code": "02116",
            "latitude": 42.3505, "longitude": -71.0785, "price_per_night_cents": 23100, "max_guests": 4,
            "photo_urls": [listing_photos[3]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Music Row Guesthouse", "description": "A comfortable guesthouse near Nashville music venues.",
            "address": "1600 West End Avenue", "city": "Nashville", "state": "TN", "zip_code": "37203",
            "latitude": 36.1512, "longitude": -86.8070, "price_per_night_cents": 16300, "max_guests": 4,
            "photo_urls": [listing_photos[0]], "status": ListingStatus.APPROVED.value,
        }),
        ("host@example.com", {
            "name": "Pearl District Loft", "description": "A modern loft near Portland galleries and coffee shops.",
            "address": "1200 Northwest Marshall Street", "city": "Portland", "state": "OR", "zip_code": "97209",
            "latitude": 45.5282, "longitude": -122.6845, "price_per_night_cents": 15400, "max_guests": 3,
            "photo_urls": [listing_photos[1]], "status": ListingStatus.APPROVED.value,
        }),
    ]
    seeded_listings = [approved, pending, booked, analytics_listing]
    for _, values in additional_listings:
        seeded_listings.append(get_or_create_listing(db, host, values))
    today = date.today()
    get_or_create_booking(db, approved, cancel_customer, today + timedelta(days=7), today + timedelta(days=10), 2, BookingStatus.CONFIRMED)
    get_or_create_booking(db, booked, search_customer, today + timedelta(days=10), today + timedelta(days=13), 2, BookingStatus.CONFIRMED)
    get_or_create_booking(db, analytics_listing, cancelled_customer, today + timedelta(days=14), today + timedelta(days=16), 2, BookingStatus.CANCELLED)
    get_or_create_booking(db, approved, review_customer, today - timedelta(days=8), today - timedelta(days=5), 2, BookingStatus.CONFIRMED)
    past_reviewed = get_or_create_booking(db, analytics_listing, reviewed_customer, today - timedelta(days=12), today - timedelta(days=9), 3, BookingStatus.CONFIRMED)
    get_or_create_review(db, past_reviewed, reviewed_customer, 5, "Already reviewed demo stay.")
    for index, listing in enumerate(seeded_listings):
        check_in = today - timedelta(days=30 + index * 2)
        review_booking = get_or_create_booking(
            db,
            listing,
            review_author,
            check_in,
            check_in + timedelta(days=2),
            min(2, listing.max_guests),
            BookingStatus.CONFIRMED,
        )
        get_or_create_review(db, review_booking, review_author, 5, f"A comfortable stay at {listing.name}.")
    db.commit()
