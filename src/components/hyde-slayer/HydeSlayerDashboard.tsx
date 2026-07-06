"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Skull, Loader2 } from "lucide-react";
import Sidebar, { type ModuleKey } from "./Sidebar";
import StatsBar from "./StatsBar";
import Dashboard from "./Dashboard";
import BattleMode from "./BattleMode";
import ObjetivosView from "./ObjetivosView";
import Vitamentes from "./Vitamentes";
import Relaxation from "./Relaxation";
import Pacts from "./Pacts";
import Inventory from "./Inventory";
import HydeCastle from "./HydeCastle";
import Analytics from "./Analytics";
import { usePlayerStats } from "@/src/context/PlayerStatsContext";

export default function HydeSlayerDashboard() {
  const { stats, loading, refresh } = usePlayerStats();
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onNavigate={(key: string) => setActiveModule(key as ModuleKey)} />;
      case "batalla":
        return <BattleMode />;
      case "objetivos":
        return <ObjetivosView />;
      case "vitamentes":
        return <Vitamentes />;
      case "relajacion":
        return <Relaxation />;
      case "pactos":
        return <Pacts onStatsChange={refresh} />;
      case "inventario":
        return <Inventory />;
      case "castillo":
        return <HydeCastle />;
      case "analytics":
        return <Analytics />;
      default:
        return <Dashboard onNavigate={(key: string) => setActiveModule(key as ModuleKey)} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex gap-4 min-h-screen"
      style={{
        background: "var(--hs-bg)",
        color: "var(--hs-text)",
      }}
    >
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar
          active={activeModule}
          onNavigate={setActiveModule}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4 py-4 pr-4 overflow-y-auto">
        {/* Mobile nav indicator */}
        <div className="lg:hidden flex items-center gap-2 px-1 mb-2">
          <Skull className="w-5 h-5" style={{ color: "var(--hs-primary)" }} />
          <span className="text-xs font-bold text-[var(--hs-text-muted)] uppercase tracking-wider">
            HYDE SLAYER
          </span>
        </div>

        {/* Stats Bar */}
        {loading ? (
          <div className="hs-glass rounded-2xl px-6 py-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--hs-primary)" }} />
            <span className="text-xs text-[var(--hs-text-muted)]">Cargando estadísticas...</span>
          </div>
        ) : stats ? (
          <StatsBar
            level={stats.level}
            xp={stats.xp}
            xpMax={stats.xpMax}
            streak={stats.streak}
            coins={stats.coins}
            discipline={stats.discipline}
            playerName={stats.playerName}
          />
        ) : null}

        {/* Active Module */}
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderModule()}
        </motion.div>
      </div>
    </motion.div>
  );
}
