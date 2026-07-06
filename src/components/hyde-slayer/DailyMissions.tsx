"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ListChecks, CheckCircle2, Circle, Swords, Target, Wind, AudioWaveform, Zap, Loader2 } from "lucide-react";
import { getDailyLogs } from "@/src/lib/server-actions/hyde-slayer/player";
import { getExerciseLogs } from "@/src/lib/server-actions/hyde-slayer/relaxation";
import { getTodayVitamentesLog } from "@/src/lib/server-actions/hyde-slayer/vitamente";

interface Mission {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  current: number;
  required: number;
  type: "counter" | "boolean";
}

export default function DailyMissions() {
  const [missions, setMissions] = useState<Mission[]>([
    { id: "tasks", label: "Completa 3 tareas", description: "Mantén el enfoque en tus tareas diarias", icon: <Target className="w-4 h-4" />, color: "var(--hs-primary)", current: 0, required: 3, type: "counter" },
    { id: "battles", label: "Derrota 3 enemigos", description: "Enfréntate a los patrones de Hyde", icon: <Swords className="w-4 h-4" />, color: "var(--hs-danger)", current: 0, required: 3, type: "counter" },
    { id: "relaxation", label: "Haz una relajación", description: "Respira y libera tensión", icon: <Wind className="w-4 h-4" />, color: "var(--hs-success)", current: 0, required: 1, type: "boolean" },
    { id: "vitamente", label: "Lee una vitamente", description: "Alimenta tu mente con afirmaciones", icon: <AudioWaveform className="w-4 h-4" />, color: "var(--hs-gold)", current: 0, required: 1, type: "boolean" },
    { id: "xp", label: "Gana 100 XP", description: "Acumula experiencia en tus actividades", icon: <Zap className="w-4 h-4" />, color: "var(--hs-xp-color)", current: 0, required: 100, type: "counter" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [logRes, exerciseRes, vitamenteRes] = await Promise.all([
          getDailyLogs(1),
          getExerciseLogs(1),
          getTodayVitamentesLog(),
        ]);

        const todayLog = logRes.success && logRes.data.length > 0 ? logRes.data[0] : null;
        const relaxationDone = exerciseRes.success && exerciseRes.data.length > 0;
        const vitamenteDone = vitamenteRes.success && vitamenteRes.data.length > 0;

        setMissions((prev) =>
          prev.map((m) => {
            switch (m.id) {
              case "tasks": return { ...m, current: todayLog?.tasksCompleted ?? 0 };
              case "battles": return { ...m, current: todayLog?.battleCount ?? 0 };
              case "relaxation": return { ...m, current: relaxationDone ? 1 : 0 };
              case "vitamente": return { ...m, current: vitamenteDone ? 1 : 0 };
              case "xp": return { ...m, current: todayLog?.xpEarned ?? 0 };
              default: return m;
            }
          })
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completed = missions.filter((m) => m.current >= m.required).length;
  const total = missions.length;

  if (loading) {
    return (
      <div className="hs-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5" style={{ color: "var(--hs-primary)" }} />
          <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider">Misiones Diarias</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--hs-primary)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="hs-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5" style={{ color: "var(--hs-primary)" }} />
          <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider">Misiones Diarias</h3>
        </div>
        <span className="text-lg font-black text-[var(--hs-text)]">
          {completed}
          <span className="text-sm font-medium text-[var(--hs-text-muted)] ml-1">/ {total}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="hs-progress-bar mb-4">
        <motion.div
          className="hs-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(completed / total) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, var(--hs-success), #34d399)",
            boxShadow: "0 0 12px rgba(16,185,129,0.3)",
          }}
        />
      </div>

      {/* Mission list */}
      <div className="space-y-2">
        {missions.map((mission, i) => {
          const done = mission.current >= mission.required;
          const progress = Math.min(mission.current / mission.required, 1);

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${done ? "bg-green-500/10" : "hover:bg-white/5"}`}
              style={{ border: `1px solid ${done ? "rgba(16,185,129,0.2)" : "var(--hs-glass-border)"}` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: done ? "rgba(16,185,129,0.2)" : `${mission.color}15` }}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--hs-success)" }} />
                ) : (
                  <div style={{ color: mission.color }}>{mission.icon}</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${done ? "text-green-400" : "text-[var(--hs-text)]"}`}>
                    {mission.label}
                  </span>
                  {mission.type === "counter" && !done && (
                    <span className="text-xs font-mono whitespace-nowrap" style={{ color: mission.color }}>
                      {mission.current}/{mission.required}
                    </span>
                  )}
                </div>
                {!done && mission.description && (
                  <p className="text-[10px] text-[var(--hs-text-muted)] mt-0.5">{mission.description}</p>
                )}
                {done && (
                  <p className="text-[10px] text-green-400/80 mt-0.5">¡Completada!</p>
                )}

                {mission.type === "counter" && !done && (
                  <div className="hs-progress-bar mt-2 h-1.5">
                    <motion.div
                      className="hs-progress-fill h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      style={{ background: `linear-gradient(90deg, ${mission.color}, ${mission.color}88)`, borderRadius: "inherit" }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
