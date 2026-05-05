export type DateKey = string;

export type BookingStatus =
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type RoomType = "standard" | "deluxe" | "suite";

export type BookingSource = "direct" | "ota" | "corporate" | "walk_in";

export interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: RoomType;
  source: BookingSource;
  checkIn: DateKey;
  checkOut: DateKey;
  status: BookingStatus;
  nightlyRate: number;
  totalPrice: number;
}

export interface BookingsPayload {
  rooms?: number;
  bookings: unknown[];
}

export type LoadState =
  | { status: "loading" }
  | { status: "success"; data: Booking[] }
  | { status: "error"; message: string };

export interface FilterState {
  statuses: Set<BookingStatus>;
  roomTypes: Set<RoomType>;
  sources: Set<BookingSource>;
}

export const ALL_STATUSES: BookingStatus[] = [
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
];

export const ALL_ROOM_TYPES: RoomType[] = ["standard", "deluxe", "suite"];

export const ALL_SOURCES: BookingSource[] = [
  "direct",
  "ota",
  "corporate",
  "walk_in",
];

export function defaultFilterState(): FilterState {
  return {
    statuses: new Set(ALL_STATUSES),
    roomTypes: new Set(ALL_ROOM_TYPES),
    sources: new Set(ALL_SOURCES),
  };
}
