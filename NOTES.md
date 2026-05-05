Engineering and product notes for this repo. For **setup, folder layout, and how to use the UI**, see [`README.md`](./README.md).

## Open-scope features

1. **Filters (status, room type, source)**  
   Toggle chips update both the heatmap and the side panel. Occupancy still excludes `cancelled` even when that status is enabled in filters, so you can inspect cancelled rows in the panel without polluting night counts.

2. **Month stats strip**  
   Average nightly occupancy, peak night, estimated revenue (sum of `nightlyRate` for each in-month night of non-cancelled stays), longest stay length in the month, and **most-booked room type** by room-nights in that month.

3. **Guest search**  
   Highlights every night touched by stays whose guest name contains the query (case-insensitive). Works across the full dataset, not only filtered rows, so search stays discoverable. Highlights apply to the **Month** grid only (not Year or Rooms).

4. **CSV export**  
   Exports the same overlapping rows shown in the panel for the current selection and filters.

5. **Persistence**  
   `localStorage` keys `guestara:calendar-month` and `guestara:filters-v1` restore the last month and filter chip state after reload. **Toolbar view** (Month / Year / Rooms) is **not** persisted.

6. **Hover preview**  
   Floating tooltip with occupancy and a short guest list; native `title` on cells mirrors the same string for accessibility. **Escape** dismisses the tooltip first; a second **Escape** clears the selection when the tooltip is already closed.

7. **Keyboard navigation & grid semantics**  
   Roving `tabIndex` on month cells (`role="grid"` / `gridcell`), **1-based** `aria-rowindex` / `aria-colindex` on each cell (Sunday-week row layout), `aria-rowcount` / `aria-colcount` on the grid. Arrow keys move by week layout index, **Shift+arrow** extends the range from a fixed anchor (anchor resets when Shift is released or on a non-shift move). **Enter** announces overlapping booking count via `aria-live` and moves focus to the booking panel (`#booking-panel`).

8. **Toolbar views: Month, Year, Rooms**  
   - **Month** — Sunday-start occupancy grid (see trade-offs).  
   - **Year** — One horizontal strip of tiny cells for every day in the **calendar year** of the viewed month (`ym.year`), same heat scale as the month grid; occupancy-only (no search overlay).  
   - **Rooms** — Room-row **timeline** for the **current month**: one row per room (sorted), columns = day-of-month, bars for stays clipped to that month; uses the same **filter chips** as the panel. Search does not drive extra styling here.

9. **Clear selection**  
   Toolbar button clears the range; **Escape** also clears selection when no tooltip is open.

10. **Tests**  
    Vitest + jsdom: `eachOccupiedNight`, `minKey`/`maxKey` span, `monthGridNeighborIndex`, `eachDayInCalendarYear` (incl. leap year), `eachDayInMonth`, `addDays`, and `bookingOverlapsNightRange`; plus `CalendarGrid.integration.test.tsx` (grid `aria-*` indices, `ArrowRight` + selection inside `dir="rtl"`). Run `npm run test` (see `npm run test:watch` in README).

## Trade-offs

- **Sunday week start** — chosen for US front-desk familiarity; documented in the UI.
- **Window `pointerup` / `pointercancel` listeners during a drag** — registered on `pointerdown` and removed when the gesture ends so releasing outside the grid still finalizes the range.
- **Revenue stat** — uses `nightlyRate` summed per in-month night; not invoice-accurate but cheap and consistent with mock data.
- **StrictMode** in dev may double-fetch JSON; production is single fetch.
- **Year strip** — search highlights are month-only; year view is occupancy-only (keeps scope small).
- **Rooms timeline** — same search/month highlight rule as year (month grid owns search UX); overlapping same-room stays in one month are rare in mock data—bars are not lane-stacked.

## Future ideas

- Persist toolbar view mode (e.g. `guestara:view-v1`) if product wants continuity across reloads.
- Configurable week start (locale) with matching `aria-colindex` / weekday header order.
- Deeper a11y for Rooms timeline (e.g. `role="table"` or list semantics + keyboard focus on bars).
