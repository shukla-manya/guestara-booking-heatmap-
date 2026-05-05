import { useMemo } from "react";
import type { Booking } from "../types";
import { compareKeys, eachDayInMonth } from "../lib/dates";

function barSpanInMonth(
  b: Booking,
  monthDays: readonly string[],
): { start: number; end: number } | null {
  const first = monthDays[0];
  const last = monthDays[monthDays.length - 1];
  if (compareKeys(b.checkOut, first) <= 0 || compareKeys(b.checkIn, last) > 0) return null;
  let start = -1;
  let end = -1;
  for (let i = 0; i < monthDays.length; i += 1) {
    const k = monthDays[i];
    if (compareKeys(k, b.checkIn) >= 0 && compareKeys(k, b.checkOut) < 0) {
      if (start < 0) start = i;
      end = i;
    }
  }
  if (start < 0) return null;
  return { start, end };
}

function compareRoomNumbers(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && String(na) === a && String(nb) === b) {
    return na - nb;
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

type Props = {
  year: number;
  monthIndex: number;
  bookings: readonly Booking[];
};

export function RoomTimeline({ year, monthIndex, bookings }: Props) {
  const monthDays = useMemo(() => eachDayInMonth(year, monthIndex), [year, monthIndex]);
  const dim = monthDays.length;

  const rows = useMemo(() => {
    const byRoom = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (!barSpanInMonth(b, monthDays)) continue;
      const list = byRoom.get(b.roomNumber) ?? [];
      list.push(b);
      byRoom.set(b.roomNumber, list);
    }
    const rooms = [...byRoom.keys()].sort(compareRoomNumbers);
    return rooms.map((room) => ({
      room,
      bookings: (byRoom.get(room) ?? []).sort((a, z) => compareKeys(a.checkIn, z.checkIn)),
    }));
  }, [bookings, monthDays]);

  if (rows.length === 0) {
    return (
      <div className="room-timeline" role="region" aria-label="Room stay timeline">
        <p className="empty room-timeline__empty">No stays overlap this month with the current filters.</p>
      </div>
    );
  }

  const ym = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  return (
    <div className="room-timeline" role="region" aria-label={`Room stay timeline, ${ym}`}>
      <div className="room-timeline__scroll">
        <div
          className="room-timeline__row room-timeline__row--head"
          style={{ ["--rt-days" as string]: String(dim) }}
        >
          <div className="room-timeline__corner">Room</div>
          {monthDays.map((k, i) => (
            <div key={k} className="room-timeline__dayhead" aria-hidden>
              {i + 1}
            </div>
          ))}
        </div>
        {rows.map(({ room, bookings: roomBookings }) => (
          <div key={room} className="room-timeline__row" style={{ ["--rt-days" as string]: String(dim) }}>
            <div className="room-timeline__room mono">{room}</div>
            <div className="room-timeline__track">
              {roomBookings.map((b) => {
                const span = barSpanInMonth(b, monthDays);
                if (!span) return null;
                const n = span.end - span.start + 1;
                const leftPct = (span.start / dim) * 100;
                const widthPct = (n / dim) * 100;
                return (
                  <div
                    key={b.id}
                    className={`room-timeline__bar room-timeline__bar--${b.status}`}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    title={`${b.guestName} · ${b.checkIn} → ${b.checkOut} · ${b.status}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
