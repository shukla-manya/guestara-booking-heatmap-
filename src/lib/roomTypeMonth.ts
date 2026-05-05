import type { Booking, DateKey, RoomType } from "../types";
import { addDays, compareKeys, keyFromLocalDate } from "./dates";

export interface MostBookedRoomTypeResult {
  roomType: RoomType;
  nightCount: number;
}

export function mostBookedRoomTypeInMonth(
  bookings: readonly Booking[],
  year: number,
  monthIndex: number,
): MostBookedRoomTypeResult | null {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const monthStart: DateKey = keyFromLocalDate(first);
  const monthEnd: DateKey = keyFromLocalDate(last);
  const counts = new Map<RoomType, number>();

  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    let k: DateKey = b.checkIn;
    while (compareKeys(k, b.checkOut) < 0) {
      if (compareKeys(k, monthStart) >= 0 && compareKeys(k, monthEnd) <= 0) {
        counts.set(b.roomType, (counts.get(b.roomType) ?? 0) + 1);
      }
      k = addDays(k, 1);
    }
  }

  let bestType: RoomType | null = null;
  let bestN = 0;
  for (const [t, n] of counts) {
    if (n > bestN) {
      bestN = n;
      bestType = t;
    }
  }
  if (bestType === null || bestN === 0) return null;
  return { roomType: bestType, nightCount: bestN };
}
