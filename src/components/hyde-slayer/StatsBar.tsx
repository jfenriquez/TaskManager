"use client";

import { motion } from "framer-motion";
import {
  Swords,
  Zap,
  Flame,
  Coins,
  Shield,
  Star,
} from "lucide-react";

interface StatsBarProps {
  level: number;
  xp: number;
  xpMax: number;
  streak: number;
  coins: number;
  discipline: number;
  playerName: string;
}

export default function StatsBar({
  level,
  xp,
  xpMax,
  streak,
  coins,
  discipline,
  playerName,
}: StatsBarProps) {
  const xpPct = Math.min((xp / xpMax) * 100, 100);

  return (
    <div className="hs-glass rounded-2xl px-6 py-4">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{
              background: "linear-gradient(135deg, var(--hs-primary), var(--hs-secondary))",
              boxShadow: "0 0 30px var(--hs-hyde-glow)",
            }}
          >
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: "linear-gradient(135deg, var(--hs-gold), #d97706)",
              color: "white",
            }}
          >
            {level}
          </div>
        </motion.div>

        {/* Name + Level */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--hs-text-muted)]">HYDE SLAYER</p>
          <p className="text-lg font-bold text-[var(--hs-text)] truncate">{playerName}</p>
        </div>

        {/* XP Bar */}
        <div className="flex-1 min-w-[120px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--hs-text-muted)]">
              <Star className="w-3 h-3 inline mr-1" />
              NIVEL {level}
            </span>
            <span className="text-[var(--hs-xp-color)] font-mono font-bold">
              {xp} / {xpMax} XP
            </span>
          </div>
          <div className="hs-progress-bar">
            <motion.div
              className="hs-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: "linear-gradient(90deg, var(--hs-primary), var(--hs-glow))",
                boxShadow: "0 0 10px var(--hs-hyde-glow)",
              }}
            />
          </div>
        </div>

        {/* Stat chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <StatChip icon={<Flame className="w-4 h-4" />} value={streak} label="racha" color="var(--hs-streak-color)" />
          <StatChip icon={<Coins className="w-4 h-4" />} value={coins} label="monedas" color="var(--hs-gold)" />
          <StatChip icon={<Shield className="w-4 h-4" />} value={discipline} label="disciplina" color="var(--hs-primary)" />
          <StatChip icon={<Swords className="w-4 h-4" />} value="BATALLA" label="" color="var(--hs-secondary)" isBadge />
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon,
  value,
  label,
  color,
  isBadge,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
  isBadge?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}20`,
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="text-xs font-bold text-[var(--hs-text)]">
        {value}
        {label && !isBadge && (
          <span className="text-[var(--hs-text-muted)] font-normal ml-1">{label}</span>
        )}
      </span>
    </motion.div>
  );
}
