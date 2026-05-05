import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { DateKey } from "../types";
import { heatBackground, heatTextColor } from "../lib/colors";
import {
  isInClosedRange,
  maxKey,
  minKey,
  monthGrid,
  monthGridIndexOf,
  monthGridNeighborIndex,
  parseKey,
} from "../lib/dates";
import type { OccupancyMap } from "../lib/occupancy";
import { occupancyCount } from "../lib/occupancy";

const MAX_ROOMS = 10;

const ARROWS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"] as const;

export interface Selection {
  start: DateKey;
  end: DateKey;
}

type Props = {
  year: number;
  monthIndex: number;
  occupancy: OccupancyMap;
  selection: Selection | null;
  onSelectionChange: (sel: Selection) => void;
  searchNights: Set<DateKey>;
  tooltipForDay: (key: DateKey) => string;
  onHover: (payload: { key: DateKey; x: number; y: number } | null) => void;
  onEnterPanel?: () => void;
};

export function CalendarGrid({
  year,
  monthIndex,
  occupancy,
  selection,
  onSelectionChange,
  searchNights,
  tooltipForDay,
  onHover,
  onEnterPanel,
}: Props) {
  const cells = useMemo(() => monthGrid(year, monthIndex), [year, monthIndex]);
  const dragRef = useRef<{ anchor: DateKey; focus: DateKey } | null>(null);
  const [dragUi, setDragUi] = useState<{ anchor: DateKey; focus: DateKey } | null>(null);
  const shiftAnchorRef = useRef<DateKey | null>(null);

  const defaultFocusKey = useMemo(() => {
    const firstIn = cells.find((c) => c.inMonth)?.key;
    return firstIn ?? cells[0]?.key ?? null;
  }, [cells]);

  const [focusKey, setFocusKey] = useState<DateKey | null>(null);

  useEffect(() => {
    if (!defaultFocusKey) return;
    if (selection) {
      const endIdx = monthGridIndexOf(cells, selection.end);
      setFocusKey(endIdx >= 0 ? selection.end : defaultFocusKey);
    } else {
      setFocusKey(defaultFocusKey);
    }
  }, [selection, cells, defaultFocusKey, year, monthIndex]);

  useEffect(() => {
    const up = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Shift") shiftAnchorRef.current = null;
    };
    window.addEventListener("keyup", up);
    return () => window.removeEventListener("keyup", up);
  }, []);

  const endDrag = useCallback(() => {
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    const d = dragRef.current;
    dragRef.current = null;
    setDragUi(null);
    if (!d) return;
    shiftAnchorRef.current = null;
    onSelectionChange({
      start: minKey(d.anchor, d.focus),
      end: maxKey(d.anchor, d.focus),
    });
  }, [onSelectionChange]);

  const startDrag = (key: DateKey) => {
    shiftAnchorRef.current = null;
    onHover(null);
    dragRef.current = { anchor: key, focus: key };
    setDragUi({ anchor: key, focus: key });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  };

  const moveDrag = (key: DateKey) => {
    if (!dragRef.current) return;
    const next = { anchor: dragRef.current.anchor, focus: key };
    dragRef.current = next;
    setDragUi(next);
  };

  const preview = dragUi
    ? { start: minKey(dragUi.anchor, dragUi.focus), end: maxKey(dragUi.anchor, dragUi.focus) }
    : null;

  const handleDayKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, key: DateKey) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnterPanel?.();
        return;
      }
      if (!ARROWS.includes(e.key as (typeof ARROWS)[number])) return;

      const idx = monthGridIndexOf(cells, key);
      if (idx < 0) return;

      e.preventDefault();
      const nk = cells[monthGridNeighborIndex(idx, e.key as (typeof ARROWS)[number], cells.length)].key;

      if (!e.shiftKey) {
        shiftAnchorRef.current = null;
        setFocusKey(nk);
        onSelectionChange({ start: nk, end: nk });
        return;
      }

      const anchor = shiftAnchorRef.current ?? key;
      shiftAnchorRef.current = anchor;
      setFocusKey(nk);
      onSelectionChange({ start: minKey(anchor, nk), end: maxKey(anchor, nk) });
    },
    [cells, onEnterPanel, onSelectionChange],
  );

  return (
    <div className="cal" role="region" aria-label="Monthly occupancy calendar">
      <div className="cal__weekdays" aria-hidden>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div
        className="cal__grid"
        role="grid"
        aria-rowcount={Math.ceil(cells.length / 7)}
        aria-colcount={7}
        onPointerLeave={() => onHover(null)}
      >
        {cells.map(({ key, inMonth }, i) => {
          const ariaRow = Math.floor(i / 7) + 1;
          const ariaCol = (i % 7) + 1;
          const occ = Math.min(MAX_ROOMS, occupancyCount(occupancy, key));
          const bg = heatBackground(occ, MAX_ROOMS);
          const fg = heatTextColor(occ, MAX_ROOMS);
          const selected =
            (preview && isInClosedRange(key, preview.start, preview.end)) ||
            (selection && isInClosedRange(key, selection.start, selection.end));
          const { d } = parseKey(key);
          const focused = focusKey !== null && key === focusKey;
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              aria-rowindex={ariaRow}
              aria-colindex={ariaCol}
              aria-selected={selected ? true : false}
              className="day"
              data-muted={!inMonth ? "true" : "false"}
              data-selected={selected ? "true" : "false"}
              data-search={searchNights.has(key) ? "true" : "false"}
              style={{ background: bg, color: fg }}
              tabIndex={focused ? 0 : -1}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                setFocusKey(key);
                startDrag(key);
              }}
              onPointerEnter={(e) => {
                if (e.buttons !== 1) {
                  onHover({ key, x: e.clientX, y: e.clientY });
                  return;
                }
                moveDrag(key);
                onHover({ key, x: e.clientX, y: e.clientY });
              }}
              onPointerMove={(e) => {
                onHover({ key, x: e.clientX, y: e.clientY });
              }}
              onKeyDown={(e) => handleDayKeyDown(e, key)}
              title={tooltipForDay(key)}
              aria-label={tooltipForDay(key)}
            >
              <div className="day__num">{d}</div>
              <div className="day__occ">{occ}/10</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
