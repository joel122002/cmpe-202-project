from datetime import date

from fastapi import HTTPException


def nights(check_in: date, check_out: date) -> int:
    count = (check_out - check_in).days
    if count < 1:
        raise HTTPException(400, "checkOut must be after checkIn")
    if count > 14:
        raise HTTPException(400, "Stay cannot exceed 14 nights")
    return count


def overlaps(existing_check_in: date, existing_check_out: date, new_check_in: date, new_check_out: date) -> bool:
    return existing_check_in < new_check_out and existing_check_out > new_check_in
