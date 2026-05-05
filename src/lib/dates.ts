import type { DateKey } from "../types";

export function parseKey(key: DateKey): { y: number; m0: number; d: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m0: m - 1, d };
}

export function keyFromLocalDate(d: Date): DateKey {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(key: DateKey, delta: number): DateKey {
  const { y, m0, d } = parseKey(key);
  const t = new Date(y, m0, d + delta);
  return keyFromLocalDate(t);
}

export function compareKeys(a: DateKey, b: DateKey): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function minKey(a: DateKey, b: DateKey): DateKey {
  return compareKeys(a, b) <= 0 ? a : b;
}

export function maxKey(a: DateKey, b: DateKey): DateKey {
  return compareKeys(a, b) >= 0 ? a : b;
}

export function isInClosedRange(
  key: DateKey,
  start: DateKey,
  end: DateKey
): boolean {
  return compareKeys(key, start) >= 0 && compareKeys(key, end) <= 0;
}

export function eachOccupiedNight(
  checkIn: DateKey,
  checkOut: DateKey
): DateKey[] {
  const out: DateKey[] = [];
  let k = checkIn;
  while (compareKeys(k, checkOut) < 0) {
    out.push(k);
    k = addDays(k, 1);
  }
  return out;
}

export function monthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function todayYM(): { year: number; monthIndex: number } {
  const t = new Date();
  return { year: t.getFullYear(), monthIndex: t.getMonth() };
}

export function monthGrid(
  year: number,
  monthIndex: number
): { key: DateKey; inMonth: boolean }[] {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const firstKey = keyFromLocalDate(first);
  const lastKey = keyFromLocalDate(last);
  const leading = first.getDay();
  const dim = last.getDate();
  const total = leading + dim;
  const trailing = (7 - (total % 7)) % 7;
  const cells = leading + dim + trailing;
  const gridStart = addDays(firstKey, -leading);
  const out: { key: DateKey; inMonth: boolean }[] = [];
  let k = gridStart;
  for (let i = 0; i < cells; i++) {
    out.push({
      key: k,
      inMonth: compareKeys(k, firstKey) >= 0 && compareKeys(k, lastKey) <= 0,
    });
    k = addDays(k, 1);
  }
  return out;
}

/** Every calendar day in `year` / `monthIndex` (1 … last day), in order. */
export function eachDayInMonth(year: number, monthIndex: number): DateKey[] {
  const dim = new Date(year, monthIndex + 1, 0).getDate();
  const out: DateKey[] = [];
  for (let d = 1; d <= dim; d += 1) {
    out.push(keyFromLocalDate(new Date(year, monthIndex, d)));
  }
  return out;
}

export function stayNights(checkIn: DateKey, checkOut: DateKey): number {
  let n = 0;
  let k = checkIn;
  while (compareKeys(k, checkOut) < 0) {
    n += 1;
    k = addDays(k, 1);
  }
  return n;
}

export function eachDayInCalendarYear(year: number): DateKey[] {
  const out: DateKey[] = [];
  let k = keyFromLocalDate(new Date(year, 0, 1));
  const end = keyFromLocalDate(new Date(year, 11, 31));
  while (compareKeys(k, end) <= 0) {
    out.push(k);
    k = addDays(k, 1);
  }
  return out;
}

export function monthGridIndexOf(cells: readonly { key: DateKey }[], key: DateKey): number {
  const i = cells.findIndex((c) => c.key === key);
  return i;
}

export function monthGridNeighborIndex(
  cellIndex: number,
  key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
  cellCount: number,
): number {
  let i = cellIndex;
  if (key === "ArrowLeft") i -= 1;
  else if (key === "ArrowRight") i += 1;
  else if (key === "ArrowUp") i -= 7;
  else if (key === "ArrowDown") i += 7;
  if (i < 0) return 0;
  if (i >= cellCount) return cellCount - 1;
  return i;
}
