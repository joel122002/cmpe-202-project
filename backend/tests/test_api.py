import os
from datetime import date, timedelta
from pathlib import Path

db_path = Path("backend/test_api.db")
if db_path.exists():
    db_path.unlink()

os.environ["DATABASE_URL"] = "sqlite:///./backend/test_api.db"
os.environ["AUTH_SECRET"] = "test-secret"
os.environ["SEED_DEMO_DATA"] = "true"

from fastapi.testclient import TestClient

from backend.app.main import app


def token(client: TestClient, email: str, password: str) -> str:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["data"]["token"]


def test_core_customer_host_admin_flow():
    with TestClient(app) as client:
        host_token = token(client, "host@example.com", "Host123!")
        admin_token = token(client, "admin@example.com", "Admin123!")
        customer_token = token(client, "customer@example.com", "Customer123!")
        review_token = token(client, "customer.review@example.com", "Customer123!")
        reviewed_token = token(client, "customer.reviewed@example.com", "Customer123!")
        review_author_token = token(client, "reviewer@example.com", "Reviewer123!")

        available = client.get(
            "/api/v1/search/listings",
            params={
                "checkIn": (date.today() + timedelta(days=1)).isoformat(),
                "checkOut": (date.today() + timedelta(days=3)).isoformat(),
                "guests": 2,
            },
        )
        assert available.status_code == 200
        available_by_name = {row["name"]: row for row in available.json()["data"]}
        for name in ("Sunny Austin Apartment", "Analytics Family Home"):
            assert available_by_name[name]["photoUrls"]
            assert available_by_name[name]["reviewCount"] >= 1

        reviewer_bookings = client.get(
            "/api/v1/bookings",
            headers={"Authorization": f"Bearer {review_author_token}"},
        )
        assert reviewer_bookings.status_code == 200
        assert len(reviewer_bookings.json()["data"]) >= 22

        review_bookings = client.get("/api/v1/bookings", headers={"Authorization": f"Bearer {review_token}"})
        assert review_bookings.json()["data"][0]["listingPhotoUrl"]
        reviewed_bookings = client.get("/api/v1/bookings", headers={"Authorization": f"Bearer {reviewed_token}"})
        assert reviewed_bookings.json()["data"][0]["listingPhotoUrl"]

        registration = client.post(
            "/api/v1/auth/register",
            json={"name": "Second Customer", "email": "second@example.com", "password": "Second123!", "role": "CUSTOMER"},
        )
        assert registration.status_code == 201
        second_token = token(client, "second@example.com", "Second123!")

        created = client.post(
            "/api/v1/listings",
            headers={"Authorization": f"Bearer {host_token}"},
            json={
                "name": "Test Rental",
                "description": "A test rental",
                "address": "10 Test Street",
                "city": "Austin",
                "state": "TX",
                "zipCode": "78704",
                "latitude": 30.25,
                "longitude": -97.75,
                "pricePerNightCents": 10000,
                "maxGuests": 2,
                "photoUrls": ["https://example.com/test-rental.jpg"],
            },
        )
        assert created.status_code == 201
        listing_id = created.json()["data"]["id"]

        approved = client.post(
            f"/api/v1/admin/listings/{listing_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert approved.status_code == 200
        assert approved.json()["data"]["status"] == "APPROVED"

        locations = client.get("/api/v1/search/locations")
        assert locations.status_code == 200
        assert {"city": "Austin", "state": "TX", "zipCodes": ["78701", "78703", "78704"]} in locations.json()["data"]
        assert {"city": "San Jose", "state": "CA", "zipCodes": ["95113", "95120", "95125", "95134"]} in locations.json()["data"]
        assert len({location["state"] for location in locations.json()["data"]}) >= 10

        booking = {
            "listingId": listing_id,
            "checkIn": "2099-07-10",
            "checkOut": "2099-07-14",
            "guests": 2,
        }
        search = client.get("/api/v1/search/listings", params={**booking, "listingId": None})
        assert search.status_code == 200
        assert any(row["id"] == listing_id for row in search.json()["data"])

        invalid_city = client.get(
            "/api/v1/search/listings",
            params={**booking, "city": "Not a seeded city", "listingId": None},
        )
        assert invalid_city.status_code == 400
        invalid_state = client.get(
            "/api/v1/search/listings",
            params={**booking, "city": "Austin", "state": "CA", "listingId": None},
        )
        assert invalid_state.status_code == 400

        first_booking = client.post(
            "/api/v1/bookings",
            headers={"Authorization": f"Bearer {customer_token}"},
            json=booking,
        )
        assert first_booking.status_code == 201
        assert first_booking.json()["data"]["listingName"] == "Test Rental"
        assert first_booking.json()["data"]["listingPhotoUrl"] == "https://example.com/test-rental.jpg"

        overlap = client.post(
            "/api/v1/bookings",
            headers={"Authorization": f"Bearer {second_token}"},
            json=booking,
        )
        assert overlap.status_code == 409
        assert overlap.json()["error"]["code"] == "BOOKING_DATE_UNAVAILABLE"

        booking_id = first_booking.json()["data"]["id"]
        cancelled = client.post(
            f"/api/v1/bookings/{booking_id}/cancel",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert cancelled.status_code == 200
        assert cancelled.json()["data"]["status"] == "CANCELLED"

        past_bookings = client.get(
            "/api/v1/bookings",
            headers={"Authorization": f"Bearer {review_token}"},
        )
        past_booking = next(row for row in past_bookings.json()["data"] if row["checkOut"] < date.today().isoformat())
        review = client.post(
            f"/api/v1/bookings/{past_booking['id']}/review",
            headers={"Authorization": f"Bearer {review_token}"},
            json={"rating": 5, "comment": "Great demo stay."},
        )
        assert review.status_code == 201

        analytics = client.get(
            "/api/v1/admin/analytics",
            params={"periodDays": 30},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert analytics.status_code == 200
        assert analytics.json()["data"]["totalListings"] >= 1


def test_versioned_health_contract():
    with TestClient(app) as client:
        response = client.get('/api/v1/health')
    assert response.status_code == 200
    assert response.json()['data']['status'] == 'ok'
