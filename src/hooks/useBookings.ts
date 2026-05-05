import { useEffect, useState } from "react";
import type { Booking, BookingsPayload, LoadState } from "../types";
import { stayNights } from "../lib/dates";

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function normalizeStatus(raw: string): Booking["status"] {
  const s = raw.replace(/-/g, "_").toLowerCase();
  if (
    s === "confirmed" ||
    s === "checked_in" ||
    s === "checked_out" ||
    s === "cancelled"
  ) {
    return s;
  }
  return "confirmed";
}

function normalizeRoomType(raw: string): Booking["roomType"] {
  const t = raw.toLowerCase();
  if (t === "standard" || t === "deluxe" || t === "suite") return t;
  return "standard";
}

function normalizeSource(raw: string): Booking["source"] {
  const s = raw.toLowerCase().replace(/-/g, "_");
  if (s === "direct" || s === "ota" || s === "corporate" || s === "walk_in") return s;
  if (s === "walkin") return "walk_in";
  return "direct";
}

function parseBooking(row: unknown): Booking | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const id = asString(o.id);
  const guestName = asString(o.guestName);
  const roomNumber = asString(o.roomNumber);
  const roomTypeRaw = asString(o.roomType);
  const sourceRaw = asString(o.source);
  const checkIn = asString(o.checkIn);
  const checkOut = asString(o.checkOut);
  const statusRaw = asString(o.status);
  if (!id || !guestName || !roomNumber || !checkIn || !checkOut || !statusRaw) return null;

  const roomType = roomTypeRaw ? normalizeRoomType(roomTypeRaw) : "standard";
  const source = sourceRaw ? normalizeSource(sourceRaw) : "direct";
  const status = normalizeStatus(statusRaw);

  let nightlyRate = 0;
  if (typeof o.nightlyRate === "number" && Number.isFinite(o.nightlyRate)) {
    nightlyRate = o.nightlyRate;
  } else if (typeof o.totalPrice === "number" && Number.isFinite(o.totalPrice)) {
    const nights = stayNights(checkIn, checkOut);
    nightlyRate = nights > 0 ? Math.round(o.totalPrice / nights) : o.totalPrice;
  }

  let totalPrice = 0;
  if (typeof o.totalPrice === "number" && Number.isFinite(o.totalPrice)) {
    totalPrice = o.totalPrice;
  } else {
    totalPrice = nightlyRate * stayNights(checkIn, checkOut);
  }

  return {
    id,
    guestName,
    roomNumber,
    roomType,
    source,
    checkIn,
    checkOut,
    status,
    nightlyRate,
    totalPrice,
  };
}

export function useBookings(): LoadState {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetch("/bookings.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<BookingsPayload>;
      })
      .then((payload) => {
        if (cancelled) return;
        const list = (payload.bookings ?? [])
          .map(parseBooking)
          .filter((b): b is Booking => b !== null);
        setState({ status: "success", data: list });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
