import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DateKey } from "./types";
import { CalendarGrid, type Selection } from "./components/CalendarGrid";
import { BookingPanel } from "./components/BookingPanel";
import { FilterChips } from "./components/FilterChips";
import { RoomTimeline } from "./components/RoomTimeline";
import { YearStrip } from "./components/YearStrip";
import { useBookings } from "./hooks/useBookings";
import { usePersistedFilters } from "./hooks/usePersistedFilters";
import { usePersistedViewMonth } from "./hooks/usePersistedViewMonth";
import { eachOccupiedNight, monthLabel, todayYM } from "./lib/dates";
import { buildOccupancy, occupancyCount } from "./lib/occupancy";
import { bookingOverlapsNightRange, filterBookingsForPanel, occupancyPredicate } from "./lib/bookings";
import { buildSearchNightSet } from "./lib/search";
import { computeMonthStats } from "./lib/monthStats";
import { mostBookedRoomTypeInMonth } from "./lib/roomTypeMonth";
import { roomTypeLabel } from "./lib/labels";
type HoverTip = { x: number; y: number; title: string; sub: string };
type ViewMode = "month" | "year" | "rooms";
function AppFooter() {
  return (
    <footer className="app__footer">
      Made with love by <span className="app__footer-name">Manya Shukla</span>
    </footer>
  );
}

export function App() {
  const load = useBookings();
  const [ym, setYm] = usePersistedViewMonth();
  const [filters, setFilters] = usePersistedFilters();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [search, setSearch] = useState("");
  const [tip, setTip] = useState<HoverTip | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [liveMsg, setLiveMsg] = useState("");
  const panelRef = useRef<HTMLElement>(null);

  const bookings = load.status === "success" ? load.data : [];

  const filteredBookings = useMemo(
    () => filterBookingsForPanel(bookings, filters),
    [bookings, filters],
  );

  const occupancy = useMemo(
    () => buildOccupancy(bookings, occupancyPredicate(filters)),
    [bookings, filters],
  );

  const searchNights = useMemo(() => buildSearchNightSet(bookings, search), [bookings, search]);

  const stats = useMemo(
    () => computeMonthStats(filteredBookings, occupancy, ym.year, ym.monthIndex),
    [filteredBookings, occupancy, ym.year, ym.monthIndex],
  );

  const mostBooked = useMemo(
    () => mostBookedRoomTypeInMonth(filteredBookings, ym.year, ym.monthIndex),
    [filteredBookings, ym.year, ym.monthIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (tip) {
        e.preventDefault();
        setTip(null);
        return;
      }
      if (selection) {
        e.preventDefault();
        setSelection(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tip, selection]);

  const tooltipForDay = useCallback(
    (key: DateKey) => {
      const n = occupancyCount(occupancy, key);
      const guests: string[] = [];
      for (const b of filterBookingsForPanel(bookings, filters)) {
        if (b.status === "cancelled") continue;
        for (const night of eachOccupiedNight(b.checkIn, b.checkOut)) {
          if (night === key) {
            guests.push(b.guestName);
            break;
          }
        }
      }
      const g = guests.slice(0, 4).join(" · ");
      const more = guests.length > 4 ? " · …" : "";
      return `${key}: ${n}/10 rooms${g ? ` — ${g}${more}` : ""}`;
    },
    [bookings, filters, occupancy],
  );

  const onCalendarHover = useCallback(
    (p: { key: DateKey; x: number; y: number } | null) => {
      if (!p) {
        setTip(null);
        return;
      }
      const line = tooltipForDay(p.key);
      const dot = line.indexOf(" — ");
      if (dot === -1) {
        setTip({ x: p.x, y: p.y, title: line, sub: "" });
      } else {
        setTip({
          x: p.x,
          y: p.y,
          title: line.slice(0, dot),
          sub: line.slice(dot + 3),
        });
      }
    },
    [tooltipForDay],
  );

  const onEnterPanel = useCallback(() => {
    if (!selection) return;
    const n = filterBookingsForPanel(bookings, filters).filter((b) =>
      bookingOverlapsNightRange(b, selection.start, selection.end),
    ).length;
    setLiveMsg(`${n} booking${n === 1 ? "" : "s"} in selected range.`);
    queueMicrotask(() => panelRef.current?.focus());
  }, [selection, bookings, filters]);

  const goPrev = () => {
    const d = new Date(ym.year, ym.monthIndex - 1, 1);
    setYm({ year: d.getFullYear(), monthIndex: d.getMonth() });
  };

  const goNext = () => {
    const d = new Date(ym.year, ym.monthIndex + 1, 1);
    setYm({ year: d.getFullYear(), monthIndex: d.getMonth() });
  };

  const goToday = () => setYm(todayYM());

  if (load.status === "loading") {
    return (
      <div className="app">
        <div className="banner banner--load">Loading bookings…</div>
        <AppFooter />
      </div>
    );
  }

  if (load.status === "error") {
    return (
      <div className="app">
        <div className="banner">
          <div style={{ fontWeight: 800 }}>Could not load bookings.json</div>
          <div style={{ marginTop: 8, opacity: 0.9 }}>{load.message}</div>
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="app">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMsg}
      </div>

      <header className="app__header">
        <div>
          <h1 className="app__title">Occupancy calendar</h1>
          <p className="app__subtitle">
            Sunday-start week (US front-desk convention). Each cell counts unique rooms occupied that night using nights
            in <span className="mono">[check-in, check-out)</span>. Cancelled bookings never affect the heatmap. Drag
            across cells (including dimmed adjacent-month days) to select a range; release to finalize. Keyboard: Tab
            into the grid, arrows move the focused day, Shift+arrow extends the range, Enter moves focus to the
            details panel.
          </p>
        </div>
      </header>

      <div className="app__body">
        <section className="card card--main">
          <div className="toolbar">
            <div className="toolbar__left">
              <div className="toolbar__month">{monthLabel(ym.year, ym.monthIndex)}</div>
              <div className="toolbar__view-toggle" role="group" aria-label="Calendar view">
                <button
                  type="button"
                  className={`btn btn--toggle${viewMode === "month" ? " btn--toggle-on" : ""}`}
                  onClick={() => setViewMode("month")}
                >
                  Month
                </button>
                <button
                  type="button"
                  className={`btn btn--toggle${viewMode === "year" ? " btn--toggle-on" : ""}`}
                  onClick={() => setViewMode("year")}
                >
                  Year
                </button>
                <button
                  type="button"
                  className={`btn btn--toggle${viewMode === "rooms" ? " btn--toggle-on" : ""}`}
                  onClick={() => setViewMode("rooms")}
                >
                  Rooms
                </button>
              </div>
            </div>
            <div className="toolbar__nav">
              <button type="button" className="btn btn--ghost" onClick={goPrev}>
                ← Prev
              </button>
              <button type="button" className="btn" onClick={goToday}>
                Today
              </button>
              <button type="button" className="btn btn--ghost" onClick={goNext}>
                Next →
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setSelection(null)} disabled={!selection}>
                Clear selection
              </button>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat__label">Avg occupancy</div>
              <div className="stat__value">{stats.avgOccupancy.toFixed(2)} rooms / night</div>
            </div>
            <div className="stat">
              <div className="stat__label">Peak night</div>
              <div className="stat__value mono">
                {stats.peakNight ? `${stats.peakNight} (${stats.peakCount})` : "—"}
              </div>
            </div>
            <div className="stat">
              <div className="stat__label">Est. revenue (month)</div>
              <div className="stat__value">{money(stats.revenueInMonth)}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Longest stay (nights)</div>
              <div className="stat__value">{stats.longestStayNights || "—"}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Top room type (nights)</div>
              <div className="stat__value">
                {mostBooked ? (
                  <>
                    {roomTypeLabel(mostBooked.roomType)}
                    <span className="stat__sub"> ({mostBooked.nightCount} room-nights)</span>
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          <FilterChips filters={filters} onChange={setFilters} />

          <div className="search">
            <input
              type="search"
              placeholder="Search guest name (highlights nights)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search guest name"
            />
          </div>

          {viewMode === "month" ? (
            <>
              <CalendarGrid
                year={ym.year}
                monthIndex={ym.monthIndex}
                occupancy={occupancy}
                selection={selection}
                onSelectionChange={setSelection}
                searchNights={searchNights}
                tooltipForDay={tooltipForDay}
                onHover={onCalendarHover}
                onEnterPanel={onEnterPanel}
              />
              <div className="legend">
                <span>0 rooms</span>
                <div className="legend__bar" aria-hidden />
                <span>10 rooms</span>
              </div>
            </>
          ) : viewMode === "year" ? (
            <YearStrip year={ym.year} occupancy={occupancy} />
          ) : (
            <RoomTimeline year={ym.year} monthIndex={ym.monthIndex} bookings={filteredBookings} />
          )}
        </section>

        <BookingPanel ref={panelRef} selection={selection} bookings={bookings} filters={filters} />
      </div>

      {tip ? (
        <div className="tooltip" style={{ left: tip.x + 14, top: tip.y + 14 }}>
          <div className="tooltip__title">{tip.title}</div>
          {tip.sub ? <div className="tooltip__sub">{tip.sub}</div> : null}
        </div>
      ) : null}

      <AppFooter />
    </div>
  );
}
