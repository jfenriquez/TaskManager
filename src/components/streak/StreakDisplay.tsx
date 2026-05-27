"use client";

import { useEffect, useState } from "react";
import { getStreakData, setDailyTaskGoal } from "@/src/actions/streakActions";
import { getStreakIconInfo, MILESTONE_CONFIG } from "@/src/utils/streakHelpers";
import type { StreakData, MilestoneDay } from "@/src/types/streak.types";

export default function StreakDisplay() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [goalInput, setGoalInput] = useState("1");
  const [showMilestones, setShowMilestones] = useState(false);

  const load = () => {
    setLoading(true);
    getStreakData()
      .then((d) => {
        setData(d);
        setGoalInput(String(d.dailyTaskGoal));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { queueMicrotask(() => load()); }, []);

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
        <div className="flex items-center justify-center py-4">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const icon = getStreakIconInfo(data.currentStreak);
  const isQuotaMetToday = data.todayCount >= data.dailyTaskGoal;
  const progressPct = Math.min(100, (data.todayCount / data.dailyTaskGoal) * 100);
  const nextMilestone = (
    [7, 14, 30, 60, 100, 200, 365] as MilestoneDay[]
  ).find((d) => !data.milestones.find((m) => m.day === d)?.achieved && data.currentStreak < d);

  const handleGoalChange = async () => {
    const val = parseInt(goalInput, 10);
    if (isNaN(val) || val < 1) return;
    await setDailyTaskGoal(val);
    load();
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Racha</h2>
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setShowMilestones(!showMilestones)}
        >
          {showMilestones ? "Ocultar insignias" : "Ver insignias"}
        </button>
      </div>

      {/* Main streak indicator */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="relative flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-500"
          style={{
            background:
              data.currentStreak >= 30
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : data.currentStreak >= 7
                ? "linear-gradient(135deg, #f97316, #ea580c)"
                : data.currentStreak >= 3
                ? "linear-gradient(135deg, #facc15, #eab308)"
                : "linear-gradient(135deg, #374151, #1f2937)",
            transform:
              data.currentStreak >= 30
                ? "scale(1.15)"
                : data.currentStreak >= 7
                ? "scale(1.08)"
                : "scale(1)",
            boxShadow:
              data.currentStreak >= 7
                ? "0 0 24px rgba(249, 115, 22, 0.5), 0 0 60px rgba(249, 115, 22, 0.2)"
                : data.currentStreak >= 3
                ? "0 0 16px rgba(250, 204, 21, 0.4)"
                : "none",
          }}
        >
          <span
            className="text-3xl transition-all duration-500"
            style={{
              filter:
                data.currentStreak >= 3 ? "brightness(1.2)" : "brightness(0.6)",
              transform:
                data.currentStreak >= 30
                  ? "scale(1.2)"
                  : data.currentStreak >= 7
                  ? "scale(1.1)"
                  : "scale(1)",
            }}
          >
            {icon.emoji}
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black">{data.currentStreak}</span>
            <span className="text-base-content/50 text-sm">días</span>
          </div>
          <p className="text-sm text-base-content/60">{icon.label}</p>
          <p className="text-xs text-base-content/40">
            Mejor: {data.bestStreak} días
          </p>
        </div>
      </div>

      {/* Today's progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-base-content/60 mb-1">
          <span>
            Hoy: {data.todayCount} / {data.dailyTaskGoal} tareas
          </span>
          <span>
            {isQuotaMetToday ? "✅ Meta cumplida" : `${data.dailyTaskGoal - data.todayCount} restantes`}
          </span>
        </div>
        <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background:
                isQuotaMetToday
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #f97316, #ea580c)",
            }}
          />
        </div>
      </div>

      {/* Daily goal setting */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-xs text-base-content/60 whitespace-nowrap">
            Meta diaria:
          </label>
          <input
            type="number"
            min={1}
            max={50}
            className="input input-bordered input-xs w-16 bg-base-200 text-center"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onBlur={handleGoalChange}
            onKeyDown={(e) => e.key === "Enter" && handleGoalChange()}
          />
          <span className="text-xs text-base-content/40">tareas/día</span>
        </div>

      {/* Next milestone hint */}
      {nextMilestone && (
        <div className="bg-base-200 rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">{MILESTONE_CONFIG[nextMilestone].icon}</span>
          <div className="flex-1">
            <p className="text-xs font-medium">{MILESTONE_CONFIG[nextMilestone].label}</p>
            <div className="w-full bg-base-300 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(100, (data.currentStreak / nextMilestone) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-base-content/40 mt-0.5">
              {nextMilestone - data.currentStreak} días restantes
            </p>
          </div>
        </div>
      )}

      {/* Milestones grid */}
      {showMilestones && (
        <div className="mt-4 pt-4 border-t border-base-300">
          <h3 className="text-sm font-medium mb-3">Insignias</h3>
          <div className="grid grid-cols-4 gap-2">
            {data.milestones.map((m) => {
              const config = MILESTONE_CONFIG[m.day as MilestoneDay];
              return (
                <div
                  key={m.day}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    m.achieved
                      ? "bg-base-200 opacity-100"
                      : "opacity-30 grayscale"
                  }`}
                  title={config.label}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <span className="text-[10px] text-base-content/60 font-mono">
                    {m.day}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
