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
 * Obtiene el inicio del día en la zona horaria especificada
 */
export const getStartOfDay = (timezone: string = "UTC-5"): Date => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  return new Date(`${today}T00:00:00`);
};

/**
 * Obtiene el fin del día en la zona horaria especificada
 */
export const getEndOfDay = (timezone: string = "UTC-5"): Date => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  return new Date(`${today}T23:59:59.999`);
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
