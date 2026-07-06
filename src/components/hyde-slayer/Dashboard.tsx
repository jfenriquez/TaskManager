"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Swords, Target, Flame, ListChecks, Heart, Skull, Coins, ArrowRight, Zap,
} from "lucide-react";
import { usePlayerStats } from "@/src/context/PlayerStatsContext";
import { getAllGoals } from "@/src/actions/goalActions";
import { getBattleHistory } from "@/src/lib/server-actions/hyde-slayer/battle";
import { getDailyLogs } from "@/src/lib/server-actions/hyde-slayer/player";
import DailyMissions from "./DailyMissions";

export default function Dashboard({ onNavigate }: { onNavigate: (key: string) => void }) {
  const { stats } = usePlayerStats();
  const [mainObjective, setMainObjective] = useState("Sin objetivo definido");
  const [objectiveProgress, setObjectiveProgress] = useState(0);
  const [hydeDetected, setHydeDetected] = useState(0);
  const [dailyMissionsDone, setDailyMissionsDone] = useState(0);

  useEffect(() => {
    async function load() {
      const goals = await getAllGoals();
      const activeGoal = goals.find(g => !g.completed);
      if (activeGoal) {
        setMainObjective(activeGoal.title);
        if (activeGoal.missions?.length) {
          setObjectiveProgress(Math.round((goals.filter(g => g.completed).length / goals.length) * 100));
        }
      }

      const battles = await getBattleHistory(100);
      const today = new Date().toDateString();
      const todayBattles = battles.success ? battles.data.filter(b => new Date(b.createdAt).toDateString() === today) : [];
      setHydeDetected(todayBattles.length);

      const logs = await getDailyLogs(1);
      if (logs.success && logs.data.length > 0) {
        setDailyMissionsDone(logs.data[0].battleCount);
      }
    }
    load();
  }, []);

  const data = {
    mainObjective,
    objectiveProgress,
    streak: stats?.streak ?? 0,
    emotionalState: hydeDetected > 5 ? "Bajo ataque" : hydeDetected > 2 ? "En guardia" : "Determinado",
    hydeDetected,
    coins: stats?.coins ?? 0,
    hydePower: Math.max(5, 80 - (stats?.streak ?? 0) * 2 - (stats?.discipline ?? 0) + hydeDetected * 3),
  };

  const quickActions = [
    { key: "batalla", label: "Entrar en batalla", icon: <Swords className="w-5 h-5" />, color: "var(--hs-danger)" },
    { key: "objetivos", label: "Objetivos", icon: <Target className="w-5 h-5" />, color: "var(--hs-primary)" },
    { key: "vitamentes", label: "Vitamentes", icon: <Zap className="w-5 h-5" />, color: "var(--hs-gold)" },
    { key: "inventario", label: "Recompensas", icon: <Coins className="w-5 h-5" />, color: "var(--hs-secondary)" },
    { key: "relajacion", label: "Relajación", icon: <Heart className="w-5 h-5" />, color: "var(--hs-success)" },
    { key: "castillo", label: "Castillo de Hyde", icon: <Skull className="w-5 h-5" />, color: "var(--hs-hyde-purple)" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate(action.key)}
            className="hs-card p-4 flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: `${action.color}20`,
                color: action.color,
              }}
            >
              {action.icon}
            </div>
            <span className="text-xs font-semibold text-[var(--hs-text)] text-center leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Main Objective */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hs-card col-span-1 md:col-span-2 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: "var(--hs-primary)" }} />
              <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider">
                Objetivo Principal
              </h3>
            </div>
            <span className="text-2xl font-black text-[var(--hs-primary)]">{data.objectiveProgress}%</span>
          </div>
          <p className="text-lg font-bold text-[var(--hs-text)] mb-4">{data.mainObjective}</p>
          <div className="hs-progress-bar mb-2">
            <motion.div
              className="hs-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${data.objectiveProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{
                background: "linear-gradient(90deg, var(--hs-primary), var(--hs-glow))",
                boxShadow: "0 0 10px var(--hs-hyde-glow)",
              }}
            />
          </div>
          <button
            onClick={() => onNavigate("objetivos")}
            className="text-xs font-semibold flex items-center gap-1 mt-2"
            style={{ color: "var(--hs-primary)" }}
          >
            Ver detalle <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

        {/* Hyde Power Meter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="hs-card p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5" style={{ color: "var(--hs-danger)" }} />
              <h3 className="text-xs font-bold text-[var(--hs-text)] uppercase tracking-wider">
                Poder de Hyde
              </h3>
            </div>
            <span className="text-lg font-black" style={{ color: "var(--hs-danger)" }}>
              {data.hydePower}%
            </span>
          </div>
          <div className="hs-progress-bar">
            <motion.div
              className="hs-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${data.hydePower}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              style={{
                background: "linear-gradient(90deg, #ef4444, #dc2626)",
              }}
            />
          </div>
          <p className="text-[10px] text-[var(--hs-text-muted)] mt-2">
            Reduce su poder cumpliendo objetivos
          </p>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hs-card p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5" style={{ color: "var(--hs-streak-color)" }} />
            <h3 className="text-xs font-bold text-[var(--hs-text)] uppercase tracking-wider">
              Racha
            </h3>
          </div>
          <p className="text-3xl font-black" style={{ color: "var(--hs-streak-color)" }}>
            {data.streak}
            <span className="text-sm font-medium text-[var(--hs-text-muted)] ml-1">días</span>
          </p>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-1.5 rounded-full"
                style={{
                  background: i < data.streak ? "var(--hs-streak-color)" : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Daily Missions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-1 md:col-span-2 lg:col-span-3"
        >
          <DailyMissions />
        </motion.div>

        {/* Emotional State + Hyde Detected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="hs-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5" style={{ color: "var(--hs-danger)" }} />
            <h3 className="text-xs font-bold text-[var(--hs-text)] uppercase tracking-wider">
              Estado Emocional
            </h3>
          </div>
          <p className="text-lg font-bold text-[var(--hs-text)]">{data.emotionalState}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-[var(--hs-text-muted)]">
            <Skull className="w-3.5 h-3.5" />
            Hyde detectado hoy: <span className="font-bold text-[var(--hs-danger)]">{data.hydeDetected}x</span>
          </div>
        </motion.div>

        {/* Coins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="hs-card p-6 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5" style={{ color: "var(--hs-gold)" }} />
              <h3 className="text-xs font-bold text-[var(--hs-text)] uppercase tracking-wider">
                Monedas de Disciplina
              </h3>
            </div>
            <p className="text-3xl font-black" style={{ color: "var(--hs-gold)" }}>
              {data.coins}
            </p>
          </div>
          <button
            onClick={() => onNavigate("inventario")}
            className="hs-btn text-xs py-2 px-4"
          >
            Canjear
          </button>
        </motion.div>
      </div>
    </div>
  );
}
