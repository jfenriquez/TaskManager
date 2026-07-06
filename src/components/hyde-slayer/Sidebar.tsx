"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Swords,
  Crosshair,
  AudioWaveform,
  Wind,
  ScrollText,
  Backpack,
  Castle,
  BarChart3,
  Skull,
} from "lucide-react";

export type ModuleKey =
  | "dashboard"
  | "batalla"
  | "objetivos"
  | "vitamentes"
  | "relajacion"
  | "pactos"
  | "inventario"
  | "castillo"
  | "analytics";

const modules: { key: ModuleKey; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, desc: "Visión general" },
  { key: "batalla", label: "Detector de Hyde", icon: <Swords className="w-5 h-5" />, desc: "Combate en tiempo real" },
  { key: "objetivos", label: "Objetivos", icon: <Crosshair className="w-5 h-5" />, desc: "Lista + wizard" },
  { key: "vitamentes", label: "Vitamentes", icon: <AudioWaveform className="w-5 h-5" />, desc: "Afirmaciones" },
  { key: "relajacion", label: "Relajación", icon: <Wind className="w-5 h-5" />, desc: "Respiración consciente" },
  { key: "pactos", label: "Pactos", icon: <ScrollText className="w-5 h-5" />, desc: "Contratos gamificados" },
  { key: "inventario", label: "Inventario", icon: <Backpack className="w-5 h-5" />, desc: "Objetos y logros" },
  { key: "castillo", label: "Castillo de Hyde", icon: <Castle className="w-5 h-5" />, desc: "Mapa de jefes" },
  { key: "analytics", label: "Analíticas", icon: <BarChart3 className="w-5 h-5" />, desc: "Estadísticas" },
];

export default function Sidebar({
  active,
  onNavigate,
  collapsed,
  onToggle,
}: {
  active: ModuleKey;
  onNavigate: (key: ModuleKey) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex-shrink-0 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
    >
      <div
        className="h-full rounded-2xl p-3 flex flex-col gap-1 overflow-y-auto"
        style={{
          background: "var(--hs-card-bg)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--hs-glass-border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Brand */}
        <div className="px-3 py-4 mb-2 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--hs-primary), var(--hs-secondary))",
            }}
          >
            <Skull className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-[var(--hs-text)]">HYDE</p>
              <p className="text-[10px] font-semibold text-[var(--hs-text-muted)] tracking-widest uppercase">SLAYER</p>
            </div>
          )}
        </div>

        <div className="hs-separator" />

        {/* Nav items */}
        {modules.map((m, i) => (
          <motion.button
            key={m.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onNavigate(m.key)}
            className={active === m.key ? "hs-sidebar-link active" : "hs-sidebar-link"}
          >
            <span className="flex-shrink-0">{m.icon}</span>
            {!collapsed && (
              <div className="text-left min-w-0">
                <p className="text-sm truncate">{m.label}</p>
                <p className="text-[10px] text-[var(--hs-text-muted)] truncate">{m.desc}</p>
              </div>
            )}
            {active === m.key && (
              <motion.div
                layoutId="activeTab"
                className="w-1 h-8 rounded-full ml-auto flex-shrink-0"
                style={{ background: "var(--hs-primary)" }}
              />
            )}
          </motion.button>
        ))}

        <div className="hs-separator" />

        {/* Footer */}
        <div className="mt-auto px-3 py-3">
          <button
            onClick={onToggle}
            className="hs-sidebar-link w-full text-xs justify-center"
          >
            {collapsed ? "→" : "Colapsar"}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
