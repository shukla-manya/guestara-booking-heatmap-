import type { Booking, DateKey } from "../types";
import { bookingOverlapsNightRange } from "./bookings";
import { addDays, compareKeys, keyFromLocalDate, stayNights } from "./dates";
import type { OccupancyMap } from "./occupancy";
import { occupancyCount } from "./occupancy";

export interface MonthStats {
  avgOccupancy: number;
  peakNight: DateKey | null;
  peakCount: number;
  revenueInMonth: number;
  longestStayNights: number;
}

export function computeMonthStats(
  bookings: readonly Booking[],
  occupancy: OccupancyMap,
  year: number,
  monthIndex: number,
): MonthStats {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  let sumOcc = 0;
  let days = 0;
  let peakNight: DateKey | null = null;
  let peakCount = 0;
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const k = keyFromLocalDate(d);
    const c = occupancyCount(occupancy, k);
    sumOcc += c;
    days += 1;
    if (c > peakCount) {
      peakCount = c;
      peakNight = k;
    }
  }

  let revenueInMonth = 0;
  let longestStayNights = 0;
  const monthStart = keyFromLocalDate(first);
  const monthEnd = keyFromLocalDate(last);

  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    if (!bookingOverlapsNightRange(b, monthStart, monthEnd)) continue;
    longestStayNights = Math.max(longestStayNights, stayNights(b.checkIn, b.checkOut));
    let k = b.checkIn;
    while (compareKeys(k, b.checkOut) < 0) {
      if (compareKeys(k, monthStart) >= 0 && compareKeys(k, monthEnd) <= 0) {
        revenueInMonth += b.nightlyRate;
      }
      k = addDays(k, 1);
    }
  }

  return {
    avgOccupancy: days ? sumOcc / days : 0,
    peakNight,
    peakCount,
    revenueInMonth,
    longestStayNights,
  };
}
