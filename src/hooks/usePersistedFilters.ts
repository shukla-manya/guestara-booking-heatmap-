import { useCallback, useMemo, useState } from "react";
import type {
  BookingSource,
  BookingStatus,
  FilterState,
  RoomType,
} from "../types";
import {
  ALL_ROOM_TYPES,
  ALL_SOURCES,
  ALL_STATUSES,
  defaultFilterState,
} from "../types";
const KEY = "guestara:filters-v1";

function cloneFilters(f: FilterState): FilterState {
  return {
    statuses: new Set(f.statuses),
    roomTypes: new Set(f.roomTypes),
    sources: new Set(f.sources),
  };
}

function isStatus(s: string): s is BookingStatus {
  return (ALL_STATUSES as string[]).includes(s);
}

function isRoomType(s: string): s is RoomType {
  return (ALL_ROOM_TYPES as string[]).includes(s);
}

function isSource(s: string): s is BookingSource {
  return (ALL_SOURCES as string[]).includes(s);
}

function readStored(): FilterState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as {
      statuses?: string[];
      roomTypes?: string[];
      sources?: string[];
    };
    const base = defaultFilterState();
    if (Array.isArray(v.statuses)) {
      const xs = v.statuses.filter(isStatus);
      if (xs.length) base.statuses = new Set(xs);
    }
    if (Array.isArray(v.roomTypes)) {
      const xs = v.roomTypes.filter(isRoomType);
      if (xs.length) base.roomTypes = new Set(xs);
    }
    if (Array.isArray(v.sources)) {
      const xs = v.sources.filter(isSource);
      if (xs.length) base.sources = new Set(xs);
    }
    return base;
  } catch {
    return null;
  }
}

function writeStored(f: FilterState): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        statuses: [...f.statuses],
        roomTypes: [...f.roomTypes],
        sources: [...f.sources],
      }),
    );
  } catch {}
}

export function usePersistedFilters(): [FilterState, (next: FilterState) => void] {
  const [filters, setFiltersState] = useState<FilterState>(
    () => readStored() ?? defaultFilterState(),
  );

  const setFilters = useCallback((next: FilterState) => {
    const copy = cloneFilters(next);
    setFiltersState(copy);
    writeStored(copy);
  }, []);

  return useMemo(() => [filters, setFilters] as const, [filters, setFilters]);
}
