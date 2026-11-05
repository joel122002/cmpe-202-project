export function validateSearch({ checkIn, checkOut, guests }) {
  if (!checkIn || !checkOut) return 'Choose check-in and check-out dates.'
  if (checkOut <= checkIn) return 'Check-out must be after check-in.'
  if (Number(guests) < 1) return 'At least one guest is required.'
  return ''
}
