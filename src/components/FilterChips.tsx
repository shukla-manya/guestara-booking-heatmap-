import type { FilterState } from "../types";
import {
  ALL_ROOM_TYPES,
  ALL_SOURCES,
  ALL_STATUSES,
} from "../types";
import { roomTypeLabel, sourceLabel, statusLabel } from "../lib/labels";

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
};

function clone(f: FilterState): FilterState {
  return {
    statuses: new Set(f.statuses),
    roomTypes: new Set(f.roomTypes),
    sources: new Set(f.sources),
  };
}

function toggleSet<T>(set: Set<T>, v: T, all: readonly T[]): Set<T> {
  const next = new Set(set);
  if (next.has(v)) {
    if (next.size <= 1) return next;
    next.delete(v);
  } else {
    next.add(v);
  }
  if (next.size === 0) return new Set(all);
  return next;
}

export function FilterChips({ filters, onChange }: Props) {
  return (
    <div className="filters">
      <div className="filters__row">
        <div className="filters__title">Status</div>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            data-on={filters.statuses.has(s) ? "true" : "false"}
            onClick={() => {
              const c = clone(filters);
              c.statuses = toggleSet(c.statuses, s, ALL_STATUSES);
              onChange(c);
            }}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>
      <div className="filters__row">
        <div className="filters__title">Room type</div>
        {ALL_ROOM_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className="chip"
            data-on={filters.roomTypes.has(t) ? "true" : "false"}
            onClick={() => {
              const c = clone(filters);
              c.roomTypes = toggleSet(c.roomTypes, t, ALL_ROOM_TYPES);
              onChange(c);
            }}
          >
            {roomTypeLabel(t)}
          </button>
        ))}
      </div>
      <div className="filters__row">
        <div className="filters__title">Source</div>
        {ALL_SOURCES.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            data-on={filters.sources.has(s) ? "true" : "false"}
            onClick={() => {
              const c = clone(filters);
              c.sources = toggleSet(c.sources, s, ALL_SOURCES);
              onChange(c);
            }}
          >
            {sourceLabel(s)}
          </button>
        ))}
      </div>
    </div>
  );
}
