import type { Booking, DateKey } from "../types";
import { eachOccupiedNight } from "./dates";

export type OccupancyMap = Map<DateKey, Set<string>>;

export function buildOccupancy(
  bookings: readonly Booking[],
  predicate: (b: Booking) => boolean
): OccupancyMap {
  const map: OccupancyMap = new Map();
  for (const b of bookings) {
    if (!predicate(b)) continue;
    if (b.status === "cancelled") continue;
    for (const night of eachOccupiedNight(b.checkIn, b.checkOut)) {
      let set = map.get(night);
      if (!set) {
        set = new Set();
        map.set(night, set);
      }
      set.add(b.roomNumber);
    }
  }
  return map;
}

export function occupancyCount(map: OccupancyMap, key: DateKey): number {
  return map.get(key)?.size ?? 0;
}
