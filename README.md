# Guestara occupancy calendar

Take-home project: a **hotel occupancy heatmap** and booking explorer built with **React 19**, **TypeScript**, and **Vite**. The UI shows how many distinct rooms are occupied each night, lets you filter and search stays, inspect overlapping bookings in a side panel, and switch between **month**, **year**, and **room timeline** views.

Static data is loaded from `public/bookings.json` on startup (`fetch`), so you briefly see a loading state before the calendar appears.

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

| Command | Purpose |
|--------|---------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Typecheck (`tsc -b`) + production bundle into `dist/` |
| `npm run preview` | Serve the `dist/` build locally |
| `npm run test` | Run Vitest once (unit + integration tests) |
| `npm run test:watch` | Vitest in watch mode |

---

## How to use the app

### Main layout

- **Left card**: month label, **Month / Year / Rooms** view toggle, prev/today/next navigation, **Clear selection**, month statistics, **filter chips** (status, room type, source), **guest search**, then the active view (calendar, year strip, or room timeline) and legend where relevant.
- **Right panel**: bookings that overlap the **selected date range** (or a message when nothing is selected), with **CSV export** for those rows.

### Views

1. **Month** — Sunday-start week grid (US front-desk convention). Each cell: day number, occupancy **x/10** (capped), heat color. **Cancelled** stays never count toward occupancy, even if you enable “cancelled” in filters (you can still see them in the panel).
2. **Year** — One horizontal strip of tiny cells for **every day in the calendar year** of the month you are viewing, same heat scale as the month grid.
3. **Rooms** — **Gantt-style** timeline: one row per room number, columns = days of that month, horizontal bars for stays clipped to the month. Honors the same **filter chips** as the panel.

Dimmed days in the month grid are outside the current month but still selectable (useful for ranges that cross month boundaries).

### Selecting a range

- **Pointer**: press on a day and drag; release anywhere (including outside the grid) to finalize. `pointerup` / `pointercancel` are registered on `window` during the drag so the gesture still completes if you release off the grid.
- **Keyboard**: Tab into the grid. **Arrow keys** move focus along the week layout. **Shift+arrow** extends the range from an anchor (anchor clears when you release Shift or move without Shift). **Enter** announces how many bookings overlap the range (via a polite `aria-live` region) and moves focus to the booking panel.

### Search, filters, and tooltips

- **Search** — Case-insensitive match on **guest name**; matching nights get a highlight on the **month** grid. Search runs over the **full dataset**, not only rows that pass the chips, so you can find a guest even when filters hide their status/type/source.
- **Filter chips** — Narrow which bookings appear in the panel and (where applicable) the heatmap / stats / room timeline. Occupancy math still excludes cancelled nights for the heat colors.
- **Hover** — Floating tooltip with occupancy and a short guest list; cells also expose the same text via `title` / `aria-label`. **Escape** closes the tooltip first; if the tooltip is already closed, **Escape** clears the selection.

### Persistence

After reload, the app restores:

- Last viewed **month** — `localStorage` key `guestara:calendar-month`
- **Filter chip** state — `guestara:filters-v1`

View mode (Month / Year / Rooms) is **not** persisted.

### Regenerating mock data

```bash
node scripts/generate-bookings.mjs
```

Replaces `public/bookings.json`. The script is for demo volume, not production validation.

---

## Folder structure

```text
guestara-booking-heatmap/
├── public/
│   ├── bookings.json      # Loaded at runtime; room list + bookings payload
│   └── favicon.svg
├── scripts/
│   └── generate-bookings.mjs   # Optional: overwrite public/bookings.json
├── src/
│   ├── main.tsx           # React root + StrictMode
│   ├── App.tsx            # Shell: data load, filters, stats, view routing, panel
│   ├── App.css            # Layout, toolbar, calendar, panel, year strip, room timeline
│   ├── index.css          # Global tokens, typography, body background
│   ├── types.ts           # Booking, filters, DateKey, load state types
│   ├── components/
│   │   ├── CalendarGrid.tsx              # Month grid, drag + keyboard selection
│   │   ├── CalendarGrid.integration.test.tsx
│   │   ├── YearStrip.tsx                 # Year occupancy strip
│   │   ├── RoomTimeline.tsx              # Per-room month Gantt bars
│   │   ├── BookingPanel.tsx              # Side panel + CSV export
│   │   └── FilterChips.tsx               # Status / room type / source toggles
│   ├── hooks/
│   │   ├── useBookings.ts                # fetch + parse bookings.json
│   │   ├── usePersistedFilters.ts
│   │   └── usePersistedViewMonth.ts
│   └── lib/
│       ├── dates.ts          # Date keys, month grid, neighbors, eachDayInMonth, …
│       ├── dates.test.ts
│       ├── occupancy.ts      # buildOccupancy, occupancyCount
│       ├── bookings.ts       # filterBookingsForPanel, overlap helpers
│       ├── bookings.test.ts
│       ├── colors.ts         # Heat scale for occupancy
│       ├── search.ts         # Guest search → night set
│       ├── monthStats.ts     # Avg occupancy, peak, revenue, longest stay
│       ├── roomTypeMonth.ts  # Most-booked room type in month
│       ├── csv.ts            # Export panel rows
│       └── labels.ts         # Human-readable status / source / room type
├── dist/                    # Produced by `npm run build` (not committed in many setups)
├── index.html
├── package.json
├── tsconfig.json / tsconfig.*.json
├── vite.config.ts
├── vitest.config.ts
├── NOTES.md                 # Product decisions, trade-offs, test inventory
└── README.md                # This file
```

---

## Data shape (`bookings.json`)

Top-level object:

- **`rooms`** (optional) — number of rooms for display cap (e.g. 10).
- **`bookings`** — array of objects with fields such as: `id`, `guestName`, `roomNumber`, `roomType`, `source`, `checkIn`, `checkOut` (`YYYY-MM-DD`), `status`, `nightlyRate`, `totalPrice` (as used by the app and generator).

Nights are counted in **`[checkIn, checkOut)`** — the checkout calendar date is **not** an occupied night.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite 6** for dev and build
- **Vitest** + **jsdom** + **Testing Library** for tests (no Playwright in this repo)
- **No** third-party calendar or drag libraries — date logic lives in `src/lib/dates.ts`; occupancy in `src/lib/occupancy.ts`

Styling is **plain CSS** (`index.css`, `App.css`), dark theme.

---

## Further reading

Design choices, accessibility behavior, and a checklist of implemented features are summarized in [`NOTES.md`](./NOTES.md).
