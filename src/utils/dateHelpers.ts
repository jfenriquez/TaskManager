// utils/dateHelpers.ts

export const getUserTimezone = (): string => {
  if (typeof window !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return "America/Bogota";
};

function getUTCOffsetMs(dateStr: string, timezone: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utcMidnight = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(utcMidnight);

  const getValue = (type: string): number => {
    const part = parts.find((p) => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  const fy = getValue("year");
  const fm = getValue("month");
  const fd = getValue("day");
  const fh = getValue("hour");
  const fmin = getValue("minute");
  const fs = getValue("second");

  const localAsUTC = Date.UTC(fy, fm - 1, fd, fh, fmin, fs);
  return utcMidnight.getTime() - localAsUTC;
}

export function getDateRangeForTimezone(
  dateStr: string,
  timezone: string,
): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utcMidnight = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const offsetMs = getUTCOffsetMs(dateStr, timezone);

  const start = new Date(utcMidnight.getTime() + offsetMs);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

  return { start, end };
}

export function dateStrToUTCMidnight(dateStr: string, timezone: string): Date {
  const { start } = getDateRangeForTimezone(dateStr, timezone);
  return start;
}

export const getStartOfDay = (timezone: string = "UTC"): Date => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  const { start } = getDateRangeForTimezone(today, timezone);
  return start;
};

export const getEndOfDay = (timezone: string = "UTC"): Date => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  const { end } = getDateRangeForTimezone(today, timezone);
  return end;
};

export const formatDateInTimezone = (
  date: Date,
  timezone: string = "UTC",
): string => {
  return date.toLocaleDateString("en-CA", { timeZone: timezone });
};

export const commonTimezones = [
  { label: "Colombia (Bogotá)", value: "America/Bogota" },
  {
    label: "Argentina (Buenos Aires)",
    value: "America/Argentina/Buenos_Aires",
  },
  { label: "México (Ciudad de México)", value: "America/Mexico_City" },
  { label: "España (Madrid)", value: "Europe/Madrid" },
  { label: "Estados Unidos (New York)", value: "America/New_York" },
  { label: "Estados Unidos (Los Angeles)", value: "America/Los_Angeles" },
  { label: "Brasil (São Paulo)", value: "America/Sao_Paulo" },
  { label: "Chile (Santiago)", value: "America/Santiago" },
  { label: "Perú (Lima)", value: "America/Lima" },
  { label: "UTC", value: "UTC" },
];
