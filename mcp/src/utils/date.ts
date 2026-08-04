export function normalizeDateUtc(dateStr: string, timezone: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (noon.toLocaleDateString("en-CA", { timeZone: timezone }) !== dateStr) {
    noon.setUTCDate(noon.getUTCDate() - 1);
  }
  return noon;
}

export function getDateRangeUtc(dateStr: string, timezone: string) {
  const ref = normalizeDateUtc(dateStr, timezone);
  return {
    start: new Date(ref.getTime() - 12 * 60 * 60 * 1000),
    end: new Date(ref.getTime() + 12 * 60 * 60 * 1000),
  };
}
