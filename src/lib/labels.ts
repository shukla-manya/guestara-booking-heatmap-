import type { BookingSource, BookingStatus, RoomType } from "../types";

export function statusLabel(s: BookingStatus): string {
  switch (s) {
    case "confirmed":
      return "Confirmed";
    case "checked_in":
      return "Checked in";
    case "checked_out":
      return "Checked out";
    case "cancelled":
      return "Cancelled";
  }
}

export function roomTypeLabel(t: RoomType): string {
  switch (t) {
    case "standard":
      return "Standard";
    case "deluxe":
      return "Deluxe";
    case "suite":
      return "Suite";
  }
}

export function sourceLabel(s: BookingSource): string {
  switch (s) {
    case "direct":
      return "Direct";
    case "ota":
      return "OTA";
    case "corporate":
      return "Corporate";
    case "walk_in":
      return "Walk-in";
  }
}
