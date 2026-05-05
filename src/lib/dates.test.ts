import { describe, expect, it } from "vitest";
import {
  addDays,
  eachDayInCalendarYear,
  eachDayInMonth,
  eachOccupiedNight,
  maxKey,
  minKey,
  monthGridNeighborIndex,
} from "./dates";

describe("eachOccupiedNight", () => {
  it("counts nights as [check-in, check-out) — checkout night excluded", () => {
    expect(eachOccupiedNight("2026-02-10", "2026-02-13")).toEqual(["2026-02-10", "2026-02-11", "2026-02-12"]);
  });

  it("returns empty when check-in equals check-out", () => {
    expect(eachOccupiedNight("2026-03-01", "2026-03-01")).toEqual([]);
  });

  it("handles single-night stay", () => {
    expect(eachOccupiedNight("2026-01-05", "2026-01-06")).toEqual(["2026-01-05"]);
  });
});

describe("minKey / maxKey (selection span)", () => {
  it("normalizes anchor and focus regardless of drag direction", () => {
    const anchor = "2026-02-12";
    const focus = "2026-02-05";
    const start = minKey(anchor, focus);
    const end = maxKey(anchor, focus);
    expect(start).toBe("2026-02-05");
    expect(end).toBe("2026-02-12");
  });
});

describe("monthGridNeighborIndex", () => {
  it("clamps at left edge", () => {
    expect(monthGridNeighborIndex(0, "ArrowLeft", 35)).toBe(0);
  });

  it("clamps at right edge", () => {
    expect(monthGridNeighborIndex(34, "ArrowRight", 35)).toBe(34);
  });

  it("moves down one week", () => {
    expect(monthGridNeighborIndex(3, "ArrowDown", 35)).toBe(10);
  });
});

describe("eachDayInCalendarYear", () => {
  it("includes all days in a non-leap year", () => {
    const days = eachDayInCalendarYear(2026);
    expect(days.length).toBe(365);
    expect(days[0]).toBe("2026-01-01");
    expect(days[364]).toBe("2026-12-31");
  });

  it("includes Feb 29 in a leap year", () => {
    const days = eachDayInCalendarYear(2024);
    expect(days.length).toBe(366);
    expect(days).toContain("2024-02-29");
  });
});

describe("addDays", () => {
  it("crosses month boundary", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
  });
});

describe("eachDayInMonth", () => {
  it("returns ordered keys for February in a leap year", () => {
    const feb2024 = eachDayInMonth(2024, 1);
    expect(feb2024.length).toBe(29);
    expect(feb2024[0]).toBe("2024-02-01");
    expect(feb2024[28]).toBe("2024-02-29");
  });

  it("returns 31 days for March", () => {
    const mar = eachDayInMonth(2026, 2);
    expect(mar.length).toBe(31);
    expect(mar[30]).toBe("2026-03-31");
  });
});
