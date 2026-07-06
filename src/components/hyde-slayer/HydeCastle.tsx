"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Castle, Skull, Swords, Shield, Trophy, Lock, Unlock, ChevronRight, Star, Loader2 } from "lucide-react";
import { getCastleLevels, getCastleProgress, updateCastleProgress } from "@/src/lib/server-actions/hyde-slayer/castle";
import { getPlayerProfile } from "@/src/lib/server-actions/hyde-slayer/player";

interface CastleBoss {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
  hp: number;
  xpReward: number;
  color: string;
  defeated: boolean;
  progress: number;
  unlocked: boolean;
  xpRequired: number;
}

const bossIcons: Record<string, string> = {
  cinismo: "😏", negativismo: "😤", derrotismo: "😞", evasion: "😰", postergacion: "😴",
};
const bossColors: Record<string, string> = {
  cinismo: "#8b5cf6", negativismo: "#ef4444", derrotismo: "#7c3aed", evasion: "#f59e0b", postergacion: "#3b82f6",
};

export default function HydeCastle() {
  const [bosses, setBosses] = useState<CastleBoss[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<CastleBoss | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [conqueringId, setConqueringId] = useState<string | null>(null);

  const handleConquer = async (boss: CastleBoss) => {
    setConqueringId(boss.id);
    try {
      const level = bosses.find((b) => b.id === boss.id);
      if (!level) return;
      await updateCastleProgress({
        castleLevelId: boss.id,
        defeated: true,
        attempts: 1,
      });
      const [progressRes] = await Promise.all([getCastleProgress()]);
      if (progressRes.success) {
        const progressMap = new Map(progressRes.data.map(p => [p.castleLevelId, p]));
        setBosses((prev) => prev.map((b) => {
          const prog = progressMap.get(b.id);
          return prog ? { ...b, defeated: prog.defeated } : b;
        }));
      }
    } finally {
      setConqueringId(null);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [levelsRes, progressRes, profileRes] = await Promise.all([
          getCastleLevels(),
          getCastleProgress(),
          getPlayerProfile(),
        ]);

        if (!levelsRes.success) return;
        const progress = progressRes.success ? progressRes.data : [];
        const progressMap = new Map(progress.map(p => [p.castleLevelId, p]));
        const profileXp = profileRes.success ? profileRes.data.xp : 0;
        setTotalXp(profileXp);

        const mapped = levelsRes.data.map((level, i) => {
          const prog = progressMap.get(level.id);
          const prevDefeated = i === 0 ? true : progressMap.get(levelsRes.data[i - 1]?.id ?? "")?.defeated ?? false;
          const name = level.name.toLowerCase();
          return {
            id: level.id,
            name: level.name,
            icon: bossIcons[name] ?? "👹",
            description: level.description ?? "",
            level: level.level,
            hp: 100 + level.level * 50,
            xpReward: level.level * 100,
            color: bossColors[name] ?? "var(--hs-hyde-purple)",
            defeated: prog?.defeated ?? false,
            progress: prog?.defeated ? 100 : Math.min(90, Math.floor((profileXp / (level.xpRequired || 1)) * 100)),
            unlocked: prevDefeated,
            xpRequired: level.xpRequired,
          };
        });
        setBosses(mapped);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Castle className="w-6 h-6" style={{ color: "var(--hs-hyde-purple)" }} />
          <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">Castillo de Hyde</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--hs-text-muted)]">
          <Star className="w-4 h-4" style={{ color: "var(--hs-xp-color)" }} />
          {totalXp} XP total
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {bosses.map((boss, i) => (
            <motion.button
              key={boss.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => boss.unlocked && setSelectedBoss(boss)}
              className={`hs-card p-4 w-full text-left cursor-pointer transition-all group ${!boss.unlocked ? "opacity-50" : ""} ${selectedBoss?.id === boss.id ? "ring-2" : ""}`}
              style={{ borderColor: selectedBoss?.id === boss.id ? boss.color : undefined }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${boss.color}20` }}>
                  {boss.unlocked ? boss.icon : <Lock className="w-5 h-5" style={{ color: "var(--hs-text-muted)" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--hs-text)]">{boss.name}</span>
                    <span className="text-[10px] text-[var(--hs-text-muted)]">Nivel {boss.level}</span>
                  </div>
                  {boss.unlocked && (
                    <>
                      <div className="hs-progress-bar mt-2">
                        <motion.div className="hs-progress-fill" initial={{ width: 0 }} animate={{ width: `${boss.progress}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} style={{ background: boss.color }} />
                      </div>
                      <p className="text-[10px] text-[var(--hs-text-muted)] mt-1">{boss.progress}%</p>
                    </>
                  )}
                  {!boss.unlocked && (
                    <p className="text-[10px] text-[var(--hs-text-muted)] mt-1">Requiere {boss.xpRequired} XP</p>
                  )}
                </div>
                {boss.unlocked && <ChevronRight className="w-4 h-4 text-[var(--hs-text-muted)]" />}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedBoss ? (
            <motion.div key={selectedBoss.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hs-card p-8">
              <div className="flex items-start gap-6 mb-8">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl flex-shrink-0"
                  style={{ background: `${selectedBoss.color}20`, border: `2px solid ${selectedBoss.color}`, boxShadow: `0 0 40px ${selectedBoss.color}40` }}
                >
                  {selectedBoss.icon}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-[var(--hs-text)]">{selectedBoss.name}</h3>
                    <span className="hs-badge text-[10px]" style={{ background: `${selectedBoss.color}20`, color: selectedBoss.color }}>JEFE</span>
                  </div>
                  <p className="text-sm text-[var(--hs-text-muted)] mb-4">{selectedBoss.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-[var(--hs-text-muted)]"><Shield className="w-3.5 h-3.5 inline mr-1" />HP: {selectedBoss.hp}</div>
                    <div className="text-xs text-[var(--hs-text-muted)]"><Swords className="w-3.5 h-3.5 inline mr-1" />XP: {selectedBoss.xpReward}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span style={{ color: selectedBoss.color }}>HP del jefe</span>
                  <span className="text-[var(--hs-text-muted)]">{selectedBoss.defeated ? "Derrotado" : `${selectedBoss.progress}%`}</span>
                </div>
                <div className="hs-progress-bar h-4">
                  <motion.div className="hs-progress-fill h-full" initial={{ width: 0 }} animate={{ width: `${selectedBoss.defeated ? 100 : selectedBoss.progress}%` }}
                    transition={{ duration: 1.5 }}
                    style={{ background: `linear-gradient(90deg, ${selectedBoss.color}, ${selectedBoss.color}88)`, boxShadow: `0 0 20px ${selectedBoss.color}40` }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {selectedBoss.defeated ? (
                  <div className="flex-1 hs-card p-3 text-center" style={{ background: "rgba(16,185,129,0.1)", borderColor: "var(--hs-success)" }}>
                    <Trophy className="w-5 h-5 inline mr-1" style={{ color: "var(--hs-success)" }} />
                    <span className="text-sm font-bold" style={{ color: "var(--hs-success)" }}>¡Derrotado!</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleConquer(selectedBoss)}
                      disabled={conqueringId === selectedBoss.id || totalXp < selectedBoss.xpRequired}
                      className={`hs-btn flex-1 ${totalXp < selectedBoss.xpRequired ? "opacity-50" : ""}`}
                    >
                      {conqueringId === selectedBoss.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      ) : (
                        <Trophy className="w-4 h-4 inline mr-2" />
                      )}
                      {totalXp < selectedBoss.xpRequired ? `Requiere ${selectedBoss.xpRequired} XP` : "¡Conquistar!"}
                    </button>
                    <button className="hs-btn-ghost flex-1" onClick={() => window.location.href = "/hyde-slayer?module=batalla"}>
                      <Swords className="w-4 h-4 inline mr-2" /> Combatir
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="hs-card p-12 text-center h-full flex flex-col items-center justify-center">
              <Castle className="w-20 h-20 mb-6" style={{ color: "var(--hs-text-muted)" }} />
              <h3 className="text-xl font-bold text-[var(--hs-text)] mb-2">Selecciona un jefe</h3>
              <p className="text-sm text-[var(--hs-text-muted)] max-w-md">
                Cada jefe representa una manifestación de Hyde. Derrótalos a todos para liberar tu potencial.
              </p>
              <div className="flex items-center gap-2 mt-6 text-xs text-[var(--hs-text-muted)]">
                <Lock className="w-3 h-3" />
                Derrota al jefe anterior para desbloquear el siguiente
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
