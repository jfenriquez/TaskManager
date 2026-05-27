import type { StreakIconInfo, MilestoneDay } from "@/src/types/streak.types";

export function getStreakIconInfo(streak: number): StreakIconInfo {
  if (streak >= 30) {
    return { emoji: "🔥", tier: "fire", color: "#ef4444", label: "Fuego" };
  }
  if (streak >= 7) {
    return { emoji: "🔥", tier: "flame", color: "#f97316", label: "Llama" };
  }
  if (streak >= 3) {
    return { emoji: "✨", tier: "spark", color: "#facc15", label: "Chispa" };
  }
  return { emoji: "–", tier: "none", color: "#6b7280", label: "Sin racha" };
}

export const MILESTONE_CONFIG: Record<MilestoneDay, { icon: string; label: string }> = {
  7: { icon: "🥉", label: "7 días — Bronce" },
  14: { icon: "🥈", label: "14 días — Plata" },
  30: { icon: "🥇", label: "30 días — Oro" },
  60: { icon: "⭐", label: "60 días — Estrella" },
  100: { icon: "🌟", label: "100 días — Superestrella" },
  200: { icon: "💎", label: "200 días — Diamante" },
  365: { icon: "👑", label: "365 días — Leyenda" },
};

export function getTodayInTimezone(tz: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

export function yesterdayInTimezone(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}
