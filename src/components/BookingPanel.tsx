import { forwardRef, useMemo } from "react";
import type { Booking } from "../types";
import { bookingOverlapsNightRange, filterBookingsForPanel } from "../lib/bookings";
import type { FilterState } from "../types";
import { stayNights } from "../lib/dates";
import { roomTypeLabel, sourceLabel, statusLabel } from "../lib/labels";
import type { Selection } from "./CalendarGrid";
import { bookingsToCsv, downloadTextFile } from "../lib/csv";

function statusPillClass(status: Booking["status"]): string {
  if (status === "cancelled") return "pill pill--bad";
  if (status === "checked_out") return "pill pill--ok";
  if (status === "checked_in") return "pill pill--warn";
  return "pill";
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    n,
  );
}

export type BookingPanelProps = {
  selection: Selection | null;
  bookings: readonly Booking[];
  filters: FilterState;
};

export const BookingPanel = forwardRef<HTMLElement, BookingPanelProps>(function BookingPanel(
  { selection, bookings, filters },
  ref,
) {
  const rows = useMemo(() => {
    if (!selection) return [];
    const pool = filterBookingsForPanel(bookings, filters);
    const list = pool.filter((b) => bookingOverlapsNightRange(b, selection.start, selection.end));
    list.sort((a, b) => (a.checkIn < b.checkIn ? -1 : a.checkIn > b.checkIn ? 1 : a.id.localeCompare(b.id)));
    return list;
  }, [bookings, filters, selection]);

  const rangeLabel = useMemo(() => {
    if (!selection) return null;
    if (selection.start === selection.end) return selection.start;
    return `${selection.start} → ${selection.end}`;
  }, [selection]);

  const exportCsv = () => {
    if (!selection) return;
    const csv = bookingsToCsv(rows);
    const safeStart = selection.start;
    const safeEnd = selection.end;
    downloadTextFile(`guestara-bookings_${safeStart}_to_${safeEnd}.csv`, csv);
  };

  return (
    <aside ref={ref} id="booking-panel" className="card panel" tabIndex={-1} aria-labelledby="booking-panel-title">
      <h2 id="booking-panel-title" className="panel__title">
        Booking details
      </h2>
      <p className="panel__meta">
        {selection ? (
          <>
            Selected nights: <span className="mono">{rangeLabel}</span>
          </>
        ) : (
          "Click a day to inspect a single night, or click and drag to select a range."
        )}
      </p>

      {selection ? (
        <div className="panel__actions">
          <button className="btn" type="button" onClick={exportCsv} disabled={rows.length === 0}>
            Export CSV
          </button>
        </div>
      ) : null}

      {!selection ? <div className="empty">No selection yet.</div> : null}

      {selection && rows.length === 0 ? (
        <div className="empty">No bookings overlap this range with the current filters.</div>
      ) : null}

      {selection && rows.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Stay</th>
                <th>Nights</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const nights = stayNights(b.checkIn, b.checkOut);
                return (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 750 }}>{b.guestName}</div>
                      <div className="mono" style={{ color: "var(--muted)", marginTop: 4 }}>
                        {roomTypeLabel(b.roomType)} · {sourceLabel(b.source)}
                      </div>
                    </td>
                    <td className="mono">{b.roomNumber}</td>
                    <td className="mono">
                      {b.checkIn}
                      <br />
                      {b.checkOut}
                    </td>
                    <td className="mono">{nights}</td>
                    <td>
                      <span className={statusPillClass(b.status)}>{statusLabel(b.status)}</span>
                      <div style={{ marginTop: 8, color: "var(--muted)", fontSize: "0.78rem" }}>
                        Est. stay total: {formatMoney(b.totalPrice)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </aside>
  );
});
