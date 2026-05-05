import { useMemo } from "react";
import { eachDayInCalendarYear } from "../lib/dates";
import { heatBackground } from "../lib/colors";
import type { OccupancyMap } from "../lib/occupancy";
import { occupancyCount } from "../lib/occupancy";

const MAX_ROOMS = 10;

export function YearStrip({
  year,
  occupancy,
}: {
  year: number;
  occupancy: OccupancyMap;
}) {
  const days = useMemo(() => eachDayInCalendarYear(year), [year]);

  return (
    <div className="year-strip" role="img" aria-label={`Occupancy heatmap for ${year}`}>
      <div className="year-strip__label">{year}</div>
      <div className="year-strip__row">
        {days.map((key) => {
          const occ = Math.min(MAX_ROOMS, occupancyCount(occupancy, key));
          const bg = heatBackground(occ, MAX_ROOMS);
          return (
            <div
              key={key}
              className="year-strip__cell"
              style={{ background: bg }}
              title={`${key}: ${occ}/10`}
              role="presentation"
            >
              <span className="year-strip__sr">{key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
