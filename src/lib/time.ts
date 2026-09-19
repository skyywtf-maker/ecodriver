import { BOOKING_RULES } from "@/config/pricing";

const TZ = BOOKING_RULES.timeZone;

function partsIn(date: Date) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
  });
  const p: Record<string, string> = {};
  for (const x of dtf.formatToParts(date)) p[x.type] = x.value;
  return p;
}

function offsetMinutes(date: Date) {
  const p = partsIn(date);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return (asUtc - date.getTime()) / 60000;
}

/** Convertit une date/heure locale Paris ("2026-09-25", "07:30") en Date UTC. */
export function parisLocalToUtc(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const off = offsetMinutes(new Date(guess));
  let res = guess - off * 60000;
  const off2 = offsetMinutes(new Date(res));
  if (off2 !== off) res = guess - off2 * 60000;
  return new Date(res);
}

/** Heure (0-23) et jour de semaine à Paris. */
export function parisHourAndWeekday(date: Date) {
  const p = partsIn(date);
  return { hour: +p.hour, weekday: p.weekday as string };
}

export function formatParis(date: Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  }).format(date);
}

export function minutesFromNow(date: Date) {
  return (date.getTime() - Date.now()) / 60000;
}
