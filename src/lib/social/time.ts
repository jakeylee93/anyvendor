// Wall-clock time in a business's time zone <-> UTC, without a date library.

function offsetMs(utc: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(utc));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - utc;
}

/** "2026-12-20T19:30" in Europe/London -> UTC Date. Returns null for invalid input. */
export function zonedToUtc(local: string, timeZone: string): Date | null {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const naive = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let utc = naive - offsetMs(naive, timeZone);
  utc = naive - offsetMs(utc, timeZone);
  return new Date(utc);
}

/** UTC -> "YYYY-MM-DDTHH:mm" in the zone, for datetime-local inputs. */
export function utcToZonedInput(iso: string, timeZone: string) {
  const utc = new Date(iso).getTime();
  const d = new Date(utc + offsetMs(utc, timeZone));
  return d.toISOString().slice(0, 16);
}

export function zonedDayKey(iso: string, timeZone: string) {
  return utcToZonedInput(iso, timeZone).slice(0, 10);
}
