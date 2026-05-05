import type { Booking, DateKey } from "../types";
import { eachOccupiedNight } from "./dates";

export function buildSearchNightSet(
  bookings: readonly Booking[],
  query: string,
): Set<DateKey> {
  const q = query.trim().toLowerCase();
  if (!q) return new Set();
  const set = new Set<DateKey>();
  for (const b of bookings) {
    if (!b.guestName.toLowerCase().includes(q)) continue;
    for (const night of eachOccupiedNight(b.checkIn, b.checkOut)) {
      set.add(night);
    }
  }
  return set;
}
