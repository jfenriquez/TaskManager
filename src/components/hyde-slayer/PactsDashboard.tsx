"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  ScrollText,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  TrendingUp,
  Gift,
  Zap,
  Flame,
  Star,
  Loader2,
} from "lucide-react";
import { getPactStats, getPlayerPacts } from "@/src/lib/server-actions/hyde-slayer/pact";
import { Badge } from "@/src/components/ui/Badge";
import { ProgressBar } from "@/src/components/ui/ProgressBar";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

interface PlayerPactRow {
  id: string;
  title: string;
  difficulty: string;
  duration: number;
  status: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  xpReward: number;
  coinReward: number;
}

interface PactStats {
  totalPacts: number;
  activePacts: number;
  completedPacts: number;
  failedPacts: number;
  cancelledPacts: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  totalDisciplineEarned: number;
  currentStreak: number;
  weeklyStats: Array<{ date: string; xp: number; count: number }>;
  monthlyStats: Array<{ month: string; xp: number; count: number }>;
  recentRewards: Array<{
    id: string;
    pactTitle: string;
    xp: number;
    coins: number;
    completedAt: Date;
  }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "Activo", color: "var(--hs-secondary)", bg: "rgba(59,130,246,0.15)" },
  COMPLETED: { label: "Completado", color: "var(--hs-success)", bg: "rgba(16,185,129,0.15)" },
  FAILED: { label: "Fallido", color: "var(--hs-danger)", bg: "rgba(239,68,68,0.15)" },
  CANCELLED: { label: "Cancelado", color: "var(--hs-text-muted)", bg: "rgba(255,255,255,0.05)" },
};

const difficultyColors: Record<string, string> = {
  EASY: "var(--hs-success)",
  MEDIUM: "var(--hs-gold)",
  HARD: "var(--hs-danger)",
  IMPOSSIBLE: "var(--hs-primary)",
};

export default function PactsDashboard() {
  const [stats, setStats] = useState<PactStats | null>(null);
  const [pacts, setPacts] = useState<PlayerPactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: "startedAt", desc: true }]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const [statsResult, pactsResult] = await Promise.all([getPactStats(), getPlayerPacts()]);
        if (statsResult.success) setStats(statsResult.data);
        if (pactsResult.success && Array.isArray(pactsResult.data)) {
          setPacts(
            pactsResult.data.map((p) => ({
              id: (p as Record<string, unknown>).id as string,
              title: ((p as Record<string, unknown>).pact as Record<string, unknown>).title as string,
              difficulty: ((p as Record<string, unknown>).pact as Record<string, unknown>).difficulty as string,
              duration: ((p as Record<string, unknown>).pact as Record<string, unknown>).duration as number,
              status: (p as Record<string, unknown>).status as string,
              progress: (p as Record<string, unknown>).progress as number,
              startedAt: ((p as Record<string, unknown>).startedAt as Date).toISOString().slice(0, 10),
              completedAt: ((p as Record<string, unknown>).completedAt as Date | null)?.toISOString().slice(0, 10) ?? null,
              xpReward: ((p as Record<string, unknown>).pact as Record<string, unknown>).xpReward as number,
              coinReward: ((p as Record<string, unknown>).pact as Record<string, unknown>).coinReward as number,
            })),
          );
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPacts = useMemo(
    () => (filterStatus === "all" ? pacts : pacts.filter((p) => p.status === filterStatus)),
    [pacts, filterStatus],
  );

  const columns = useMemo<ColumnDef<PlayerPactRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Pacto",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: difficultyColors[row.original.difficulty] ?? "var(--hs-text-muted)" }}
            />
            <span className="font-medium text-[var(--hs-text)] text-sm">{row.original.title}</span>
          </div>
        ),
      },
      {
        accessorKey: "difficulty",
        header: "Dificultad",
        cell: ({ row }) => (
          <Badge variant={row.original.difficulty === "EASY" ? "success" : row.original.difficulty === "HARD" || row.original.difficulty === "IMPOSSIBLE" ? "danger" : "warning"}>
            {row.original.difficulty === "EASY" ? "Fácil" : row.original.difficulty === "MEDIUM" ? "Medio" : row.original.difficulty === "HARD" ? "Difícil" : "Imposible"}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status] ?? statusConfig.ACTIVE;
          return (
            <span
              className="hs-badge text-[10px]"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          );
        },
      },
      {
        accessorKey: "progress",
        header: "Progreso",
        cell: ({ row }) => (
          <div className="w-28">
            <ProgressBar value={row.original.progress} size="sm" showValue />
          </div>
        ),
      },
      {
        accessorKey: "startedAt",
        header: "Inicio",
        cell: ({ row }) => (
          <span className="text-xs text-[var(--hs-text-muted)]">{row.original.startedAt}</span>
        ),
      },
      {
        accessorKey: "xpReward",
        header: "XP",
        cell: ({ row }) => (
          <span className="text-xs font-mono font-bold" style={{ color: "var(--hs-xp-color)" }}>
            +{row.original.xpReward}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredPacts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--hs-primary)" }} />
      </div>
    );
  }

  const chartColors = {
    primary: "rgba(124, 58, 237, 0.8)",
    primaryLight: "rgba(124, 58, 237, 0.2)",
    secondary: "rgba(59, 130, 246, 0.8)",
    gold: "rgba(245, 158, 11, 0.8)",
    border: "rgba(255,255,255,0.08)",
  };

  const weeklyChartData = stats ? {
    labels: stats.weeklyStats.map((w) => w.date.slice(5)),
    datasets: [
      {
        label: "XP",
        data: stats.weeklyStats.map((w) => w.xp),
        backgroundColor: chartColors.primaryLight,
        borderColor: chartColors.primary,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Pactos",
        data: stats.weeklyStats.map((w) => w.count),
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.secondary,
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  } : null;

  const monthlyChartData = stats ? {
    labels: stats.monthlyStats.map((m) => {
      const [y, mo] = m.month.split("-");
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      return `${months[parseInt(mo) - 1]}`;
    }),
    datasets: [
      {
        label: "XP Mensual",
        data: stats.monthlyStats.map((m) => m.xp),
        backgroundColor: "rgba(245, 158, 11, 0.6)",
        borderColor: "rgba(245, 158, 11, 0.9)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  } : null;

  const statusChartData = stats ? {
    labels: ["Activos", "Completados", "Fallidos", "Cancelados"],
    datasets: [
      {
        data: [stats.activePacts, stats.completedPacts, stats.failedPacts, stats.cancelledPacts],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(100, 116, 139, 0.5)",
        ],
        borderWidth: 0,
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="w-6 h-6" style={{ color: "var(--hs-primary)" }} />
        <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">
          Dashboard de Pactos
        </h2>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Clock className="w-5 h-5" />, label: "Activos", value: stats.activePacts, color: "var(--hs-secondary)" },
            { icon: <CheckCircle className="w-5 h-5" />, label: "Completados", value: stats.completedPacts, color: "var(--hs-success)" },
            { icon: <XCircle className="w-5 h-5" />, label: "Fallidos", value: stats.failedPacts, color: "var(--hs-danger)" },
            { icon: <Trophy className="w-5 h-5" />, label: "Totales", value: stats.totalPacts, color: "var(--hs-gold)" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="hs-card p-4"
            >
              <div className="flex items-center gap-2 mb-1" style={{ color: s.color }}>
                {s.icon}
              </div>
              <p className="text-2xl font-black text-[var(--hs-text)]">{s.value}</p>
              <p className="text-[10px] text-[var(--hs-text-muted)] uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rewards Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Star className="w-5 h-5" />, label: "XP Total", value: stats.totalXpEarned, suffix: "xp", color: "var(--hs-xp-color)" },
            { icon: <Gift className="w-5 h-5" />, label: "Monedas", value: stats.totalCoinsEarned, suffix: "", color: "var(--hs-gold)" },
            { icon: <Zap className="w-5 h-5" />, label: "Disciplina", value: stats.totalDisciplineEarned, suffix: "", color: "var(--hs-primary)" },
            { icon: <Flame className="w-5 h-5" />, label: "Racha", value: stats.currentStreak, suffix: "días", color: "var(--hs-streak-color)" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="hs-card p-4"
            >
              <div className="flex items-center gap-2 mb-1" style={{ color: s.color }}>
                {s.icon}
              </div>
              <p className="text-2xl font-black text-[var(--hs-text)]">
                {s.value}
                {s.suffix && <span className="text-sm font-medium text-[var(--hs-text-muted)] ml-1">{s.suffix}</span>}
              </p>
              <p className="text-[10px] text-[var(--hs-text-muted)] uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly XP Chart */}
        {weeklyChartData && stats && stats.weeklyStats.length > 0 && (
          <div className="hs-card p-6">
            <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-4">
              <TrendingUp className="w-4 h-4 inline mr-1" style={{ color: "var(--hs-primary)" }} />
              Progreso Semanal
            </h3>
            <div className="h-48">
              <Line
                data={weeklyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: "var(--hs-text-muted)", font: { size: 10 } },
                    },
                  },
                  scales: {
                    x: {
                      grid: { color: "rgba(255,255,255,0.05)" },
                      ticks: { color: "var(--hs-text-muted)", font: { size: 10 } },
                    },
                    y: {
                      grid: { color: "rgba(255,255,255,0.05)" },
                      ticks: { color: "var(--hs-text-muted)", font: { size: 10 } },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Monthly XP Chart */}
        {monthlyChartData && stats && stats.monthlyStats.length > 0 && (
          <div className="hs-card p-6">
            <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-4">
              <TrendingUp className="w-4 h-4 inline mr-1" style={{ color: "var(--hs-gold)" }} />
              XP Mensual
            </h3>
            <div className="h-48">
              <Bar
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: "var(--hs-text-muted)", font: { size: 10 } },
                    },
                  },
                  scales: {
                    x: {
                      grid: { color: "rgba(255,255,255,0.05)" },
                      ticks: { color: "var(--hs-text-muted)", font: { size: 10 } },
                    },
                    y: {
                      grid: { color: "rgba(255,255,255,0.05)" },
                      ticks: { color: "var(--hs-text-muted)", font: { size: 10 } },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Distribution + Recent Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {statusChartData && stats && (stats.totalPacts > 0) && (
          <div className="hs-card p-6">
            <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-4">
              Distribución de Pactos
            </h3>
            <div className="h-48 flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut
                  data={statusChartData}
                  options={{
                    cutout: "60%",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { color: "var(--hs-text-muted)", font: { size: 10 }, padding: 12 },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent Rewards */}
        {stats && stats.recentRewards.length > 0 && (
          <div className="hs-card p-6">
            <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-4">
              <Gift className="w-4 h-4 inline mr-1" style={{ color: "var(--hs-gold)" }} />
              Recompensas Recientes
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stats.recentRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--hs-text)] truncate">{reward.pactTitle}</p>
                    <p className="text-[10px] text-[var(--hs-text-muted)]">
                      {new Date(reward.completedAt).toLocaleDateString("es")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono font-bold flex-shrink-0 ml-3">
                    <span style={{ color: "var(--hs-xp-color)" }}>+{reward.xp} XP</span>
                    <span style={{ color: "var(--hs-gold)" }}>+{reward.coins} 🪙</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pacts Table */}
      <div className="hs-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider">
            Todos los Pactos
          </h3>
          <div className="flex gap-1">
            {["all", "ACTIVE", "COMPLETED", "FAILED", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filterStatus === s
                    ? "bg-[var(--hs-primary)] text-white"
                    : "text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] hover:bg-white/5"
                }`}
              >
                {s === "all" ? "Todos" : statusConfig[s]?.label ?? s}
              </button>
            ))}
          </div>
        </div>

        {filteredPacts.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--hs-text-muted)" }} />
            <p className="text-sm text-[var(--hs-text-muted)]">No hay pactos que mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="text-[10px] font-bold uppercase tracking-wider text-[var(--hs-text-muted)] pb-3 pr-4 cursor-pointer select-none hover:text-[var(--hs-text)] transition-colors"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-[var(--hs-glass-border)] hover:bg-white/[0.02] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 pr-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
