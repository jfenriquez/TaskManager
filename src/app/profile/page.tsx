"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getProfileStats } from "@/src/actions/taskActions";
import { useUserTimezone } from "@/src/hooks/useUserTimezone";

interface Stats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  totalTimerMinutes: number;
  streak: number;
  memberSince: string;
  timezone: string;
  categoryDistribution: { name: string; color: string; minutes: number; taskCount: number }[];
  topTasksByTime: { title: string; minutes: number; categoryName: string | null }[];
  priorityCounts: { HIGH: number; MEDIUM: number; LOW: number };
  recentActivity: { date: string; completed: number; created: number }[];
}

function fmt(minutes: number): string {
  if (minutes === 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function Donut({ data }: { data: { name: string; color: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-base-content/40">
        Sin datos
      </div>
    );
  }
  const segments = data.filter((d) => d.value > 0);
  const conic = segments
    .map((d, i) => {
      const pct = ((d.value / total) * 100).toFixed(1);
      const prevPct = segments
        .slice(0, i)
        .reduce((s, seg) => s + (seg.value / total) * 100, 0);
      return `${d.color} ${prevPct}% ${prevPct + parseFloat(pct)}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-40 h-40 rounded-full"
        style={{ background: `conic-gradient(${conic})` }}
      />
      <div className="flex flex-wrap gap-3 justify-center">
        {segments.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-base-content/70">{d.name}</span>
            <span className="font-medium">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityHeatmap({ days }: { days: Stats["recentActivity"] }) {
  const max = Math.max(...days.map((d) => d.completed), 1);
  const monthLabels: { label: string; index: number }[] = [];
  let lastMonth = "";
  days.forEach((d, i) => {
    const m = d.date.slice(0, 7);
    if (m !== lastMonth) {
      monthLabels.push({ label: d.date.slice(5), index: i });
      lastMonth = m;
    }
  });

  return (
    <div>
      <div className="flex gap-0.5 text-xs text-base-content/40 mb-1 ml-0">
        {monthLabels.map((m) => (
          <span key={m.label} style={{ marginLeft: m.index * 14 }}>
            {m.label}
          </span>
        ))}
      </div>
      <div className="flex gap-0.5 flex-wrap">
        {days.map((d) => {
          const intensity = d.completed / max;
          const bg =
            d.completed === 0
              ? "bg-base-200"
              : intensity > 0.66
              ? "bg-success"
              : intensity > 0.33
              ? "bg-warning"
              : "bg-error/30";
          return (
            <div key={d.date} className="relative group">
              <div className={`w-3 h-3 rounded-sm ${bg} cursor-default`} />
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                <div className="bg-base-content text-base-100 text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {d.date}: {d.completed} completada{d.completed !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarChart({
  data,
  valueKey,
  labelKey,
  colorKey,
  max,
  unit,
}: {
  data: Record<string, any>[];
  valueKey: string;
  labelKey: string;
  colorKey?: string;
  max?: number;
  unit?: string;
}) {
  const maxVal = max ?? Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-1">
            <span className="truncate text-base-content/80">{d[labelKey]}</span>
            <span className="font-mono text-xs">
              {d[valueKey]}{unit ?? ""}
            </span>
          </div>
          <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(d[valueKey] / maxVal) * 100}%`,
                backgroundColor: colorKey ? d[colorKey] : "var(--p)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { timezone, setTimezone, isLoading: tzLoading } = useUserTimezone();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadStats = (sd?: string, ed?: string) => {
    if (!user) return;
    setLoadingStats(true);
    getProfileStats(sd || undefined, ed || undefined)
      .then((data) => setStats(data as unknown as Stats))
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  const applyFilter = () => loadStats(startDate || undefined, endDate || undefined);
  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    loadStats();
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );

  if (!isAuthenticated)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No autenticado</h1>
          <a href="/login" className="text-primary underline">Iniciar sesión</a>
        </div>
      </div>
    );

  const catDist = stats?.categoryDistribution ?? [];
  const donutData = catDist.map((c) => ({ name: c.name, color: c.color, value: c.minutes }));
  const priorityData = stats
    ? [
        { label: "Alta", value: stats.priorityCounts.HIGH, color: "#ef4444" },
        { label: "Media", value: stats.priorityCounts.MEDIUM, color: "#f59e0b" },
        { label: "Baja", value: stats.priorityCounts.LOW, color: "#10b981" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Header */}
        <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
          <div className="flex items-center gap-5">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name ?? "Usuario"}</h1>
              <p className="text-base-content/60">{user?.email}</p>
              <div className="flex gap-2 mt-1">
                <div className="badge badge-outline">{user?.role}</div>
                {stats && (
                  <div className="badge badge-outline">
                    Miembro desde {new Date(stats.memberSince).toLocaleDateString("es")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : stats ? (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Totales", value: stats.totalTasks, color: "bg-primary" },
                { label: "Completadas", value: stats.completedTasks, color: "bg-success" },
                { label: "Activas", value: stats.activeTasks, color: "bg-warning" },
                { label: "Tiempo total", value: fmt(stats.totalTimerMinutes), color: "bg-info" },
              ].map((c) => (
                <div key={c.label} className="card bg-base-100 shadow-md border border-base-300 p-4">
                  <div className={`w-3 h-3 rounded-full mb-2 ${c.color}`} />
                  <p className="text-2xl font-bold">{c.value}</p>
                  <p className="text-xs text-base-content/50">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Streak + Timezone row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
                <h2 className="font-semibold mb-1">Racha actual</h2>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🔥</span>
                  <span className="text-5xl font-black">{stats.streak}</span>
                  <span className="text-base-content/50">días</span>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
                <h2 className="font-semibold mb-3">Zona horaria</h2>
                <select
                  className="select select-bordered w-full bg-base-200"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={tzLoading}
                >
                  {Intl.supportedValuesOf?.("timeZone")?.map((tz: string) => (
                    <option key={tz} value={tz}>{tz}</option>
                  )) ?? <option value={timezone}>{timezone}</option>}
                </select>
              </div>
            </div>

            {/* Category distribution */}
            <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
              <h2 className="font-semibold text-lg mb-4">
                Distribución por categoría
              </h2>
              <p className="text-sm text-base-content/50 mb-4">
                Dónde va realmente tu tiempo
              </p>

              {/* Date filter */}
              <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-base-200 rounded-xl">
                <div>
                  <label className="label py-1">
                    <span className="label-text text-xs">Desde</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm bg-base-100"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label py-1">
                    <span className="label-text text-xs">Hasta</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm bg-base-100"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={applyFilter}>
                  Filtrar
                </button>
                {(startDate || endDate) && (
                  <button className="btn btn-ghost btn-sm" onClick={clearFilter}>
                    Limpiar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Donut data={donutData} />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-base-content/70">
                    Minutos por categoría
                  </p>
                  <BarChart
                    data={catDist.map((c) => ({
                      label: c.name,
                      value: c.minutes,
                      color: c.color,
                    }))}
                    valueKey="value"
                    labelKey="label"
                    colorKey="color"
                    unit=" min"
                  />
                </div>
              </div>
            </div>

            {/* Top 5 */}
            <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
              <h2 className="font-semibold text-lg mb-1">
                Top 5 actividades que más tiempo consumen
              </h2>
              <p className="text-sm text-base-content/50 mb-4">
                Ladrones de tiempo
              </p>
              {stats.topTasksByTime.length === 0 ? (
                <p className="text-base-content/40 text-center py-6">
                  No hay tareas con tiempo registrado
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topTasksByTime.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl bg-base-200"
                    >
                      <span className="text-lg font-black text-base-content/30 w-6 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{t.title}</p>
                        {t.categoryName && (
                          <p className="text-xs text-base-content/50">{t.categoryName}</p>
                        )}
                      </div>
                      <span className="font-mono text-sm font-bold">
                        {fmt(t.minutes)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Priorities */}
            <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
              <h2 className="font-semibold text-lg mb-4">
                Tareas por prioridad
              </h2>
              <BarChart
                data={priorityData}
                valueKey="value"
                labelKey="label"
                colorKey="color"
              />
            </div>

            {/* Activity */}
            <div className="card bg-base-100 shadow-xl border border-base-300 p-6">
              <h2 className="font-semibold text-lg mb-1">
                Actividad últimos 30 días
              </h2>
              <p className="text-sm text-base-content/50 mb-4">
                Tareas completadas por día
              </p>
              <ActivityHeatmap days={stats.recentActivity} />
              <div className="flex items-center gap-2 mt-3 text-xs text-base-content/50">
                <span>Menos</span>
                <div className="w-3 h-3 rounded-sm bg-base-200" />
                <div className="w-3 h-3 rounded-sm bg-error/30" />
                <div className="w-3 h-3 rounded-sm bg-warning" />
                <div className="w-3 h-3 rounded-sm bg-success" />
                <span>Más</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
