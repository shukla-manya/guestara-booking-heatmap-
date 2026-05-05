export function heatBackground(count: number, maxRooms = 10): string {
  const t = maxRooms <= 0 ? 0 : Math.min(1, count / maxRooms);
  const hueStart = 215;
  const hueEnd = 12;
  const h = hueStart + (hueEnd - hueStart) * t;
  const s = 22 + 58 * t;
  const l = 26 + 22 * (1 - t);
  return `hsl(${h} ${s}% ${l}%)`;
}

export function heatTextColor(count: number, maxRooms = 10): string {
  const t = maxRooms <= 0 ? 0 : Math.min(1, count / maxRooms);
  return t > 0.45 ? "#f1f5f9" : "#0b1220";
}
