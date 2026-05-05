# Occupancy calendar

Take-home for Guestara: a month view of how full the hotel is, built with React and Vite. Data lives in `public/bookings.json` and gets loaded with `fetch` when the app starts (so you’ll see a loading state first).

**Run it**

```bash
npm install
npm run dev
```

Vite will print a local URL—usually port 5173.

**Ship a build**

```bash
npm run build
npm run preview
```

Output lands in `dist/`.

**Tests**

```bash
npm run test
```

**About the JSON**

There’s already a `bookings.json` in the repo. If you want to roll new fake data:

```bash
node scripts/generate-bookings.mjs
```

That script replaces the file in `public/`. Don’t expect real-world sanity checks; it’s just for filling the calendar.

**What’s under the hood**

React 19, TypeScript, no calendar or drag libraries. Dates are mostly `YYYY-MM-DD` strings and the native `Date` object. Styles are plain CSS (`index.css` for globals, `App.css` for layout and components).


