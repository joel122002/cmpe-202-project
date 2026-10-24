from datetime import date, timedelta

from backend.app.modules.common import nights, overlaps


def test_booking_rules_reject_long_stays_and_detect_overlap():
    assert nights(date(2030, 1, 1), date(2030, 1, 3)) == 2
    assert overlaps(date(2030, 1, 1), date(2030, 1, 4), date(2030, 1, 3), date(2030, 1, 5))
    assert not overlaps(date(2030, 1, 1), date(2030, 1, 3), date(2030, 1, 3), date(2030, 1, 5))
