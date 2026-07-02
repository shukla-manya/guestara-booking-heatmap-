import { useCallback, useState } from "react";
import { todayYM } from "../lib/dates";
const KEY = "guestara:calendar-month";

type YM = { year: number; monthIndex: number };

function readStored(): YM | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { year?: number; monthIndex?: number };
    if (
      typeof v.year === "number" &&
      typeof v.monthIndex === "number" &&
      v.monthIndex >= 0 &&
      v.monthIndex <= 11
    ) {
      return { year: v.year, monthIndex: v.monthIndex };
    }
  } catch {
    return null;
  }
  return null;
}

function initialYm(): YM {
  return readStored() ?? todayYM();
}

export function usePersistedViewMonth(): [YM, (next: YM) => void] {
  const [ym, setYmState] = useState<YM>(initialYm);

  const setYm = useCallback((next: YM) => {
    setYmState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      return;
    }
  }, []);

  return [ym, setYm];
}
