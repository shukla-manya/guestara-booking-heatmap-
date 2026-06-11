import type { Booking, DateKey, FilterState } from "../types";
import { compareKeys } from "./dates";
export function bookingOverlapsNightRange(
  b: Booking,
  start: DateKey,
  end: DateKey,
): boolean {
  return !(compareKeys(b.checkOut, start) <= 0 || compareKeys(b.checkIn, end) > 0);
}

export function bookingMatchesFilters(b: Booking, f: FilterState): boolean {
  if (!f.statuses.has(b.status)) return false;
  if (!f.roomTypes.has(b.roomType)) return false;
  if (!f.sources.has(b.source)) return false;
  return true;
}

export function occupancyPredicate(f: FilterState): (b: Booking) => boolean {
  return (b: Booking) => bookingMatchesFilters(b, f);
}

export function filterBookingsForPanel(
  bookings: readonly Booking[],
  f: FilterState,
): Booking[] {
  return bookings.filter((b) => bookingMatchesFilters(b, f));
}
