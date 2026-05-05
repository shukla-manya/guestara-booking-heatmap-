import { describe, expect, it } from "vitest";
import type { Booking } from "../types";
import { bookingOverlapsNightRange } from "./bookings";

const b = (over: Partial<Booking> & Pick<Booking, "checkIn" | "checkOut">): Booking => ({
  id: "x",
  guestName: "Test",
  roomNumber: "101",
  roomType: "standard",
  source: "direct",
  nightlyRate: 100,
  totalPrice: 100,
  status: "confirmed",
  ...over,
});

describe("bookingOverlapsNightRange", () => {
  it("overlaps when range covers a booked night before checkout", () => {
    const booking = b({ checkIn: "2026-02-10", checkOut: "2026-02-13" });
    expect(bookingOverlapsNightRange(booking, "2026-02-12", "2026-02-12")).toBe(true);
  });

  it("does not overlap checkout night only", () => {
    const booking = b({ checkIn: "2026-02-10", checkOut: "2026-02-13" });
    expect(bookingOverlapsNightRange(booking, "2026-02-13", "2026-02-13")).toBe(false);
  });

  it("overlaps when range straddles booking", () => {
    const booking = b({ checkIn: "2026-02-10", checkOut: "2026-02-13" });
    expect(bookingOverlapsNightRange(booking, "2026-02-01", "2026-02-11")).toBe(true);
  });

  it("false when range is entirely after stay", () => {
    const booking = b({ checkIn: "2026-02-10", checkOut: "2026-02-13" });
    expect(bookingOverlapsNightRange(booking, "2026-02-13", "2026-02-20")).toBe(false);
  });
});
