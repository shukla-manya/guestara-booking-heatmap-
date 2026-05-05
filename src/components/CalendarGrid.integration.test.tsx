import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalendarGrid } from "./CalendarGrid";

const noopHover = () => {};

describe("CalendarGrid integration", () => {
  it("exposes 1-based aria-rowindex and aria-colindex on each gridcell", () => {
    render(
      <CalendarGrid
        year={2026}
        monthIndex={2}
        occupancy={new Map()}
        selection={null}
        onSelectionChange={() => {}}
        searchNights={new Set()}
        tooltipForDay={(k) => k}
        onHover={noopHover}
      />,
    );
    const grid = screen.getAllByRole("grid").at(-1)!;
    const cells = within(grid).getAllByRole("gridcell");
    expect(cells.length).toBeGreaterThan(30);
    expect(cells[0].getAttribute("aria-rowindex")).toBe("1");
    expect(cells[0].getAttribute("aria-colindex")).toBe("1");
    expect(cells[7].getAttribute("aria-rowindex")).toBe("2");
    expect(cells[7].getAttribute("aria-colindex")).toBe("1");
    expect(cells[8].getAttribute("aria-colindex")).toBe("2");
  });

  it("updates selection from ArrowRight when wrapped in dir=rtl", () => {
    const onSelectionChange = vi.fn();
    render(
      <div dir="rtl">
        <CalendarGrid
          year={2026}
          monthIndex={2}
          occupancy={new Map()}
          selection={null}
          onSelectionChange={onSelectionChange}
          searchNights={new Set()}
          tooltipForDay={(k) => k}
          onHover={noopHover}
        />
      </div>,
    );
    const grid = screen.getAllByRole("grid").at(-1)!;
    const focusCell = within(grid).getAllByRole("gridcell").find((el) => el.tabIndex === 0);
    expect(focusCell).toBeTruthy();
    const el = focusCell as HTMLElement;
    el.focus();
    expect(document.activeElement).toBe(el);
    fireEvent.keyDown(el, { key: "ArrowRight", shiftKey: false });
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const arg = onSelectionChange.mock.calls[0][0] as { start: string; end: string };
    expect(arg.start).toBe(arg.end);
  });
});
