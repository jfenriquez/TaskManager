"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock, Loader2, Sparkles, Swords, Target, Flame, Heart, Star, AudioWaveform, ScrollText } from "lucide-react";
import { getAchievements, getPlayerAchievements } from "@/src/lib/server-actions/hyde-slayer/achievement";

const categoryIcons: Record<string, React.ReactNode> = {
  COMBAT: <Swords className="w-4 h-4" />,
  GOALS: <Target className="w-4 h-4" />,
  PACTS: <ScrollText className="w-4 h-4" />,
  VITAMENTES: <AudioWaveform className="w-4 h-4" />,
  STREAK: <Flame className="w-4 h-4" />,
  GENERAL: <Star className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  COMBAT: "#ef4444",
  GOALS: "#8b5cf6",
  PACTS: "#10b981",
  VITAMENTES: "#f59e0b",
  STREAK: "#f97316",
  GENERAL: "#6366f1",
};

const categoryLabels: Record<string, string> = {
  COMBAT: "Combate",
  GOALS: "Metas",
  PACTS: "Pactos",
  VITAMENTES: "Vitamentes",
  STREAK: "Racha",
  GENERAL: "General",
};

const achievementEmojis: Record<string, string> = {
  "Primer paso": "👣",
  "Racha inicial": "🔥",
  "Matutino": "🌅",
  "Cazador de Hyde": "🏹",
  "Matamonstruos": "💀",
  "Leyenda viva": "⚔️",
  "Racha de acero": "🛡️",
  "Racha implacable": "💪",
  "Racha legendaria": "👑",
  "Maestro de la disciplina": "🧘",
  "Rico en experiencia": "📈",
  "Coleccionista": "🎒",
  "Pacificador": "☮️",
  "Contratista": "📜",
  "Cumplidor": "✅",
  "Conquistador del Sótano": "🏚️",
  "Conquistador del Salón": "🏛️",
  "Conquistador de la Torre": "🏰",
  "Señor del Castillo": "👹",
  "Meditador": "🧠",
};

export default function Achievements() {
  const [allAchievements, setAllAchievements] = useState<Array<{
    id: string; name: string; description: string | null; category: string; xpReward: number; coinReward: number;
  }>>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [unlockedDates, setUnlockedDates] = useState<Map<string, Date>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const [allRes, playerRes] = await Promise.all([
          getAchievements(),
          getPlayerAchievements(),
        ]);
        if (allRes.success) setAllAchievements(allRes.data);
        if (playerRes.success) {
          const ids = new Set<string>();
          const dates = new Map<string, Date>();
          playerRes.data.forEach((pa) => {
            ids.add(pa.achievementId);
            dates.set(pa.achievementId, pa.unlockedAt);
          });
          setUnlockedIds(ids);
          setUnlockedDates(dates);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = Array.from(new Set(allAchievements.map((a) => a.category)));
  const filtered = filter === "all"
    ? allAchievements
    : filter === "unlocked"
      ? allAchievements.filter((a) => unlockedIds.has(a.id))
      : filter === "locked"
        ? allAchievements.filter((a) => !unlockedIds.has(a.id))
        : allAchievements.filter((a) => a.category === filter);

  const unlockedCount = allAchievements.filter((a) => unlockedIds.has(a.id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--hs-primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6" style={{ color: "var(--hs-gold)" }} />
          <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">Logros</h2>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--hs-gold)" }}>
          <Trophy className="w-4 h-4" />
          <span className="font-bold">{unlockedCount}</span>
          <span className="text-[var(--hs-text-muted)]">/ {allAchievements.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="hs-card p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[var(--hs-text-muted)]">Progreso total</span>
          <span className="font-bold" style={{ color: "var(--hs-gold)" }}>
            {Math.round((unlockedCount / Math.max(allAchievements.length, 1)) * 100)}%
          </span>
        </div>
        <div className="hs-progress-bar h-3">
          <motion.div
            className="hs-progress-fill h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / Math.max(allAchievements.length, 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg, var(--hs-gold), #fbbf24)", borderRadius: "inherit" }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === "all" ? "text-white" : "text-[var(--hs-text-muted)]"}`}
          style={{ background: filter === "all" ? "linear-gradient(135deg, var(--hs-primary), var(--hs-accent))" : "rgba(255,255,255,0.05)", border: `1px solid ${filter === "all" ? "transparent" : "var(--hs-glass-border)"}` }}
        >
          Todos
        </button>
        <button onClick={() => setFilter("unlocked")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === "unlocked" ? "text-white" : "text-[var(--hs-text-muted)]"}`}
          style={{ background: filter === "unlocked" ? "var(--hs-success)" : "rgba(255,255,255,0.05)", border: `1px solid ${filter === "unlocked" ? "transparent" : "var(--hs-glass-border)"}` }}
        >
          <Trophy className="w-3 h-3 inline mr-1" />Desbloqueados
        </button>
        <button onClick={() => setFilter("locked")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === "locked" ? "text-white" : "text-[var(--hs-text-muted)]"}`}
          style={{ background: filter === "locked" ? "var(--hs-text-muted)" : "rgba(255,255,255,0.05)", border: `1px solid ${filter === "locked" ? "transparent" : "var(--hs-glass-border)"}` }}
        >
          <Lock className="w-3 h-3 inline mr-1" />Bloqueados
        </button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === cat ? "text-white" : "text-[var(--hs-text-muted)]"}`}
            style={{ background: filter === cat ? categoryColors[cat] ?? "var(--hs-primary)" : "rgba(255,255,255,0.05)", border: `1px solid ${filter === cat ? "transparent" : "var(--hs-glass-border)"}` }}
          >
            {categoryIcons[cat]} {categoryLabels[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Achievement List */}
      {filtered.length === 0 ? (
        <div className="hs-card p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--hs-text-muted)" }} />
          <p className="text-sm text-[var(--hs-text-muted)]">No hay logros en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((achievement, i) => {
            const unlocked = unlockedIds.has(achievement.id);
            const unlockedDate = unlockedDates.get(achievement.id);
            const catColor = categoryColors[achievement.category] ?? "var(--hs-primary)";
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="hs-card p-4 flex flex-col"
                style={{ opacity: unlocked ? 1 : 0.5 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: unlocked ? `${catColor}20` : "rgba(255,255,255,0.05)", border: unlocked ? `1px solid ${catColor}40` : "1px solid var(--hs-glass-border)" }}
                  >
                    {unlocked ? (achievementEmojis[achievement.name] ?? "🏆") : <Lock className="w-4 h-4 text-[var(--hs-text-muted)]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[var(--hs-text)] truncate">{achievement.name}</h4>
                    {achievement.description && (
                      <p className="text-[10px] text-[var(--hs-text-muted)] line-clamp-2">{achievement.description}</p>
                    )}
                  </div>
                  {unlocked && (
                    <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: "var(--hs-gold)" }} />
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono mb-3">
                  <span style={{ color: "var(--hs-xp-color)" }}>+{achievement.xpReward} XP</span>
                  <span style={{ color: "var(--hs-gold)" }}>+{achievement.coinReward} 🪙</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: catColor }}>
                    {categoryIcons[achievement.category]} {categoryLabels[achievement.category] ?? achievement.category}
                  </span>
                  {unlocked && unlockedDate && (
                    <span className="text-[9px] text-[var(--hs-text-muted)]">
                      {new Date(unlockedDate).toLocaleDateString("es")}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
