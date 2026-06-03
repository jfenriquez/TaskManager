"use client";

import { useEffect, useState } from "react";
import { getStreakData } from "@/src/actions/streakActions";
import { getStreakIconInfo } from "@/src/utils/streakHelpers";
import type { StreakData } from "@/src/types/streak.types";

export default function StreakBadge() {
  const [data, setData] = useState<StreakData | null>(null);

  useEffect(() => {
    getStreakData()
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return null;

  const icon = getStreakIconInfo(data.currentStreak);

  return (
    <div className="flex items-center gap-1.5 tooltip tooltip-bottom" data-tip={`Racha: ${data.currentStreak} días`}>
      <span className="text-lg">{icon.emoji}</span>
      <span className="font-bold text-sm">{data.currentStreak}</span>
    </div>
  );
}
