import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const roomTypes = ["standard", "deluxe", "suite"];
const sources = ["direct", "ota", "corporate", "walk_in"];
function pad(n) {
  return String(n).padStart(2, "0");
}
function toKey(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function addDaysKey(key, delta) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toKey(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

const firstNames = [
  "Avery",
  "Jordan",
  "Riley",
  "Quinn",
  "Morgan",
  "Casey",
  "Skyler",
  "Reese",
  "Taylor",
  "Cameron",
  "Sam",
  "Jamie",
  "Dakota",
  "Rowan",
  "Sage",
  "Alex",
  "Charlie",
  "Frankie",
  "Harper",
  "Logan",
];

const lastNames = [
  "Nguyen",
  "Patel",
  "Garcia",
  "Silva",
  "Kim",
  "Okafor",
  "Hansen",
  "Costa",
  "Yamamoto",
  "Bakker",
  "Lopez",
  "Fischer",
  "Murphy",
  "Singh",
  "Rossi",
  "Nielsen",
  "Kowalski",
  "Tan",
  "Ibrahim",
  "Carvalho",
];

const bookings = [];
let id = 1;

const roomNumbers = Array.from({ length: 10 }, (_, i) => String(101 + i));

const windowStart = toKey(2026, 2, 1);
const windowEnd = toKey(2026, 5, 31);

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

function randomStayLength() {
  const r = Math.random();
  if (r < 0.35) return randInt(1, 2);
  if (r < 0.75) return randInt(3, 5);
  if (r < 0.92) return randInt(6, 9);
  return randInt(10, 14);
}

function randomStatus() {
  const r = Math.random();
  if (r < 0.82) return pick(["confirmed", "checked_in", "checked_out"]);
  return "cancelled";
}

for (let k = 0; k < 230; k++) {
  const month = randInt(2, 5);
  const dim = daysInMonth(2026, month);
  const day = randInt(1, dim);
  const checkIn = toKey(2026, month, day);
  if (checkIn < windowStart || checkIn > windowEnd) continue;

  const len = randomStayLength();
  const checkOut = addDaysKey(checkIn, len);
  if (checkOut > addDaysKey(windowEnd, 14)) continue;

  const roomNumber = pick(roomNumbers);
  const roomType = roomTypes[roomNumbers.indexOf(roomNumber) % 3];
  const source = pick(sources);
  const status = randomStatus();

  const guestName = `${pick(firstNames)} ${pick(lastNames)}`;
  const nightlyRate =
    roomType === "suite" ? randInt(220, 420) : roomType === "deluxe" ? randInt(140, 260) : randInt(90, 160);

  bookings.push({
    id: `b${id++}`,
    guestName,
    roomNumber,
    roomType,
    source,
    checkIn,
    checkOut,
    status,
    nightlyRate,
  });
}

bookings.push({
  id: `b${id++}`,
  guestName: "Morgan Cross",
  roomNumber: "105",
  roomType: "deluxe",
  source: "corporate",
  checkIn: toKey(2026, 2, 26),
  checkOut: toKey(2026, 3, 6),
  status: "confirmed",
  nightlyRate: 185,
});

const payload = {
  rooms: 10,
  bookings,
};

const out = join(__dirname, "..", "public", "bookings.json");
writeFileSync(out, JSON.stringify(payload, null, 2));
console.log("Wrote", out, "bookings:", payload.bookings.length);
