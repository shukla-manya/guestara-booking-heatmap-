import type { Booking } from "../types";
import { stayNights } from "./dates";

export function bookingsToCsv(rows: readonly Booking[]): string {
  const header = [
    "guestName",
    "roomNumber",
    "roomType",
    "checkIn",
    "checkOut",
    "nights",
    "status",
    "source",
    "totalPrice",
  ];
  const lines = [header.join(",")];
  for (const b of rows) {
    const nights = stayNights(b.checkIn, b.checkOut);
    const cells = [
      csvEscape(b.guestName),
      csvEscape(b.roomNumber),
      csvEscape(b.roomType),
      b.checkIn,
      b.checkOut,
      String(nights),
      b.status,
      csvEscape(b.source),
      String(b.totalPrice),
    ];
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
