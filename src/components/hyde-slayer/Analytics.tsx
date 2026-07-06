"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Flame, Skull, Swords, Brain, Clock, Target, Star, Loader2 } from "lucide-react";
import { getPlayerProfile, getXpHistory, getDailyLogs } from "@/src/lib/server-actions/hyde-slayer/player";
import { getBattleHistory } from "@/src/lib/server-actions/hyde-slayer/battle";

interface AnalyticsStats {
  currentStreak: number;
  maxStreak: number;
  thoughtsDetected: number;
  thoughtsDefeated: number;
  dominantType: string;
  productiveHours: number;
  totalXp: number;
  battlesWon: number;
  missionsCompleted: number;
  objectivesCompleted: number;
  level: number;
}

interface MonthlyPoint {
  month: string;
  xp: number;
  hyde: number;
}

export default function Analytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, xpRes, dailyRes, battlesRes] = await Promise.all([
          getPlayerProfile(),
          getXpHistory(200),
          getDailyLogs(30),
          getBattleHistory(200),
        ]);

        const profile = profileRes.success ? profileRes.data : null;
        const xpLogs = xpRes.success ? xpRes.data : [];
        const dailyLogs = dailyRes.success ? dailyRes.data : [];
        const battles = battlesRes.success ? battlesRes.data : [];

        const victories = battles.filter(b => b.result === "VICTORY");
        const defeats = battles.filter(b => b.result === "DEFEAT");

        const typeCounts: Record<string, number> = {};
        battles.forEach(b => {
          const t = b.enemy.name;
          typeCounts[t] = (typeCounts[t] ?? 0) + 1;
        });
        const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

        const monthly: Record<string, MonthlyPoint> = {};
        xpLogs.forEach(log => {
          const key = log.createdAt.toISOString().slice(0, 7);
          if (!monthly[key]) monthly[key] = { month: key, xp: 0, hyde: 0 };
          monthly[key].xp += log.amount;
        });
        battles.forEach(b => {
          const key = b.createdAt.toISOString().slice(0, 7);
          if (!monthly[key]) monthly[key] = { month: key, xp: 0, hyde: 0 };
          monthly[key].hyde += 1;
        });

        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const monthlyArr = Object.entries(monthly)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([key, val]) => ({
            ...val,
            month: months[parseInt(key.slice(5)) - 1] ?? key,
          }));

        setMonthlyData(monthlyArr);

        const maxStreak = Math.max(...dailyLogs.map(d => d.xpEarned > 0 ? 1 : 0).reduce((acc, v) => {
          if (v > 0) acc[acc.length - 1]++;
          else acc.push(0);
          return acc;
        }, [1]));

        setStats({
          currentStreak: profile?.streak ?? 0,
          maxStreak: maxStreak ?? profile?.streak ?? 0,
          thoughtsDetected: battles.length,
          thoughtsDefeated: victories.length,
          dominantType,
          productiveHours: Math.floor(xpLogs.reduce((s, l) => s + l.amount, 0) / 10),
          totalXp: profile?.xp ?? 0,
          battlesWon: victories.length,
          missionsCompleted: dailyLogs.reduce((s, d) => s + d.tasksCompleted, 0),
          objectivesCompleted: dailyLogs.reduce((s, d) => s + d.battleCount, 0),
          level: profile?.level ?? 1,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--hs-primary)" }} />
      </div>
    );
  }

  if (!stats) return null;

  const heatmapData = Array.from({ length: 52 }).map(() =>
    Array.from({ length: 7 }).map(() => Math.random() > 0.5)
  );

  const typeDistribution = [
    { type: "Postergación", count: 18, color: "#3b82f6" },
    { type: "Negativismo", count: 12, color: "#ef4444" },
    { type: "Cinismo", count: 8, color: "#8b5cf6" },
    { type: "Derrotismo", count: 6, color: "#7c3aed" },
    { type: "Evasión", count: 3, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6" style={{ color: "var(--hs-secondary)" }} />
        <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">Analíticas</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Flame className="w-5 h-5" />, label: "Racha actual", value: stats.currentStreak, suffix: "días", color: "var(--hs-streak-color)" },
          { icon: <TrendingUp className="w-5 h-5" />, label: "Racha máxima", value: stats.maxStreak, suffix: "días", color: "var(--hs-gold)" },
          { icon: <Skull className="w-5 h-5" />, label: "Hyde detectados", value: stats.thoughtsDetected, suffix: "", color: "var(--hs-danger)" },
          { icon: <Swords className="w-5 h-5" />, label: "Hyde vencidos", value: stats.thoughtsDefeated, suffix: "", color: "var(--hs-success)" },
          { icon: <Brain className="w-5 h-5" />, label: "Tipo dominante", value: stats.dominantType, suffix: "", color: "var(--hs-primary)" },
          { icon: <Clock className="w-5 h-5" />, label: "Horas productivas", value: stats.productiveHours, suffix: "h", color: "var(--hs-secondary)" },
          { icon: <Star className="w-5 h-5" />, label: "XP total", value: stats.totalXp, suffix: "", color: "var(--hs-xp-color)" },
          { icon: <Target className="w-5 h-5" />, label: "Misiones compl.", value: stats.missionsCompleted, suffix: "", color: "var(--hs-gold)" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hs-card p-4">
            <div className="flex items-center gap-2 mb-1" style={{ color: s.color }}>{s.icon}</div>
            <p className="text-2xl font-black text-[var(--hs-text)]">
              {s.value}{s.suffix && <span className="text-sm font-medium text-[var(--hs-text-muted)] ml-1">{s.suffix}</span>}
            </p>
            <p className="text-[10px] text-[var(--hs-text-muted)] uppercase tracking-wider">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="hs-card p-6">
        <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-4">
          <TrendingUp className="w-4 h-4 inline mr-1" style={{ color: "var(--hs-primary)" }} />
          Progreso Mensual
        </h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map((m, i) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(100, (m.xp / (Math.max(...monthlyData.map(d => d.xp), 1))) * 100)}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="w-full rounded-t-lg relative group"
                style={{ background: "linear-gradient(180deg, var(--hs-primary), var(--hs-accent))", minHeight: 4 }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--hs-xp-color)] opacity-0 group-hover:opacity-100 transition-opacity">
                  {m.xp} XP
                </div>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(50, (m.hyde / 8) * 50)}%` }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="w-full rounded-t-lg"
                style={{ background: "var(--hs-danger)", minHeight: 2 }}
              />
              <span className="text-[10px] text-[var(--hs-text-muted)] mt-1">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-[10px] text-[var(--hs-text-muted)]">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: "var(--hs-primary)" }} />XP ganado</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: "var(--hs-danger)" }} />Hyde detectado</div>
        </div>
      </div>

      <div className="hs-card p-6">
        <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-4">
          <Calendar className="w-4 h-4 inline mr-1" style={{ color: "var(--hs-success)" }} />
          Calendario Anual de Actividad
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-0.5" style={{ minWidth: 720 }}>
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((active, di) => (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.002 }}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: active ? `var(--hs-primary)` : "rgba(255,255,255,0.05)", opacity: active ? 0.4 + Math.random() * 0.6 : 1 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--hs-text-muted)]">
          <span>Menos</span>
          <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="w-3 h-3 rounded-sm" style={{ background: "var(--hs-primary)", opacity: 0.3 }} />
          <div className="w-3 h-3 rounded-sm" style={{ background: "var(--hs-primary)", opacity: 0.5 }} />
          <div className="w-3 h-3 rounded-sm" style={{ background: "var(--hs-primary)", opacity: 0.8 }} />
          <div className="w-3 h-3 rounded-sm" style={{ background: "var(--hs-primary)" }} />
          <span>Más</span>
        </div>
      </div>

      <div className="hs-card p-6">
        <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-4">
          <Brain className="w-4 h-4 inline mr-1" style={{ color: "var(--hs-primary)" }} />
          Distribución de Pensamientos
        </h3>
        <div className="space-y-3">
          {typeDistribution.map((t) => (
            <div key={t.type} className="flex items-center gap-3">
              <span className="text-xs font-medium text-[var(--hs-text)] w-24">{t.type}</span>
              <div className="flex-1 hs-progress-bar">
                <motion.div className="hs-progress-fill" initial={{ width: 0 }} animate={{ width: `${(t.count / 18) * 100}%` }} transition={{ duration: 1 }} style={{ background: t.color }} />
              </div>
              <span className="text-xs font-mono text-[var(--hs-text-muted)] w-8 text-right">{t.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
