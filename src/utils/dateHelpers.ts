// utils/dateHelpers.ts

/**
 * Obtiene la zona horaria del navegador del usuario
 */
export const getUserTimezone = (): string => {
  if (typeof window !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return "UTC-5";
};

/**
 * Obtiene el inicio del día actual en la zona horaria especificada
 */
export const getStartOfDay = (timezone: string = "UTC-5"): Date => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  return getDateRangeUtc(today, timezone).start;
};

/**
 * Obtiene el fin del día actual en la zona horaria especificada
 */
export const getEndOfDay = (timezone: string = "UTC-5"): Date => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  return getDateRangeUtc(today, timezone).end;
};

/**
 * Convierte una fecha a string en formato YYYY-MM-DD en la zona horaria especificada
 */
export const formatDateInTimezone = (
  date: Date,
  timezone: string = "UTC-5"
): string => {
  return date.toLocaleDateString("en-CA", { timeZone: timezone });
};

/**
 * Dado un string YYYY-MM-DD y una zona horaria, devuelve un Date UTC
 * que cae a las 12:00 (mediodía) de ese día local.
 * Así se evita el desfase de medianoche UTC en husos negativos.
 */
export function normalizeDateUtc(dateStr: string, timezone: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (noon.toLocaleDateString("en-CA", { timeZone: timezone }) !== dateStr) {
    noon.setUTCDate(noon.getUTCDate() - 1);
  }
  return noon;
}

/**
 * Retorna el rango [start, end) UTC que cubre el día local completo
 * para la fecha y timezone dadas.
 */
export function getDateRangeUtc(dateStr: string, timezone: string) {
  const ref = normalizeDateUtc(dateStr, timezone);
  return {
    start: new Date(ref.getTime() - 12 * 60 * 60 * 1000),
    end: new Date(ref.getTime() + 12 * 60 * 60 * 1000),
  };
}



/**
 * Lista de zonas horarias comunes (opcional, para un selector en el frontend)
 */
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
