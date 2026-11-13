import pytest
from pydantic import ValidationError

from backend.app.schemas import ReviewInput


def test_review_rating_is_bounded():
    assert ReviewInput(rating=5, comment='Great').rating == 5
    with pytest.raises(ValidationError):
        ReviewInput(rating=6, comment='Too high')
