## Open-scope features

1. **Filters (status, room type, source)**  
   Toggle chips update both the heatmap and the side panel. Occupancy still excludes `cancelled` even when that status is enabled in filters, so you can inspect cancelled rows in the panel without polluting night counts.

2. **Month stats strip**  
   Average nightly occupancy, peak night, estimated revenue (sum of `nightlyRate` for each in-month night of non-cancelled stays), longest stay length in the month, and **most-booked room type** by room-nights in that month.

3. **Guest search**  
   Highlights every night touched by stays whose guest name contains the query (case-insensitive). Works across the full dataset, not only filtered rows, so search stays discoverable.

4. **CSV export**  
   Exports the same overlapping rows shown in the panel for the current selection and filters.

5. **Persistence**  
   `localStorage` keys `guestara:calendar-month` and `guestara:filters-v1` restore the last month and filter chip state after reload.

6. **Hover preview**  
   Floating tooltip with occupancy and a short guest list; native `title` on cells mirrors the same string for accessibility. **Escape** dismisses the tooltip first; a second **Escape** clears the selection when the tooltip is already closed.

7. **Keyboard navigation**  
   Roving `tabIndex` on month cells (`role="grid"` / `gridcell`), arrow keys move by week layout index, **Shift+arrow** extends the range from a fixed anchor (anchor resets when Shift is released or on a non-shift move). **Enter** announces overlapping booking count via `aria-live` and moves focus to the booking panel (`#booking-panel`).

8. **Year strip (second view)**  
   Toggle **Month / Year** in the toolbar. Year view is one horizontal strip of tiny cells for every day in the calendar year of the currently viewed month (`ym.year`), using the same occupancy heat scale as the month grid.

9. **Clear selection**  
   Toolbar button clears the range; **Escape** also clears selection when no tooltip is open.

10. **Tests**  
    Vitest + jsdom: `eachOccupiedNight`, `minKey`/`maxKey` span, `monthGridNeighborIndex`, `eachDayInCalendarYear` (incl. leap year), `eachDayInMonth`, `addDays`, and `bookingOverlapsNightRange`; plus `CalendarGrid.integration.test.tsx` (grid `aria-*` indices, keyboard in `dir="rtl"`). Run `npm run test`.

## Trade-offs

- **Sunday week start** — chosen for US front-desk familiarity; documented in the UI.
- **Window `pointerup` / `pointercancel` listeners during a drag** — registered on `pointerdown` and removed when the gesture ends so releasing outside the grid still finalizes the range.
- **Revenue stat** — uses `nightlyRate` summed per in-month night; not invoice-accurate but cheap and consistent with mock data.
- **StrictMode** in dev may double-fetch JSON; production is single fetch.
- **Year strip** — search highlights are month-only; year view is occupancy-only (keeps scope small).

## With more time

- ~~Full `aria` row/column indices for the grid.~~ Done (`aria-rowindex` / `aria-colindex` on month `gridcell`s).
- ~~Gantt or room-row timeline view.~~ Done: **Rooms** toolbar view — one row per room, month days as columns, stay bars clipped to the visible month (respects filter chips).
- ~~More integration tests (e.g. keyboard + selection in RTL).~~ Done: `CalendarGrid.integration.test.tsx` (indices + `ArrowRight` inside `dir="rtl"`).
