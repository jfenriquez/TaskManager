"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  Plus,
  Check,
  X,
  Clock,
  Trophy,
  Zap,
  Gift,
  Star,
  Flame,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import {
  getPacts,
  getPlayerPacts,
  acceptPact,
  cancelPact,
  completePact,
  deletePact,
} from "@/src/lib/server-actions/hyde-slayer/pact";
import { usePlayerStats } from "@/src/context/PlayerStatsContext";
import { PactForm, PactProgressForm } from "@/src/components/forms/hyde-slayer";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Toast } from "@/src/components/ui/Toast";
import PactsDashboard from "./PactsDashboard";

interface PactTemplate {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  difficulty: string;
  xpReward: number;
  coinReward: number;
  disciplineReward: number;
}

interface PlayerPactItem {
  id: string;
  pactId: string;
  status: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  pact: {
    title: string;
    description: string | null;
    difficulty: string;
    duration: number;
    xpReward: number;
    coinReward: number;
    disciplineReward: number;
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "Activo", color: "var(--hs-secondary)", bg: "rgba(59,130,246,0.15)" },
  COMPLETED: { label: "Completado", color: "var(--hs-success)", bg: "rgba(16,185,129,0.15)" },
  FAILED: { label: "Fallido", color: "var(--hs-danger)", bg: "rgba(239,68,68,0.15)" },
  CANCELLED: { label: "Cancelado", color: "var(--hs-text-muted)", bg: "rgba(255,255,255,0.05)" },
};

interface PactsProps {
  onStatsChange?: () => void;
}

export default function Pacts({ onStatsChange }: PactsProps) {
  const [view, setView] = useState<"list" | "dashboard">("list");
  const [templates, setTemplates] = useState<PactTemplate[]>([]);
  const [playerPacts, setPlayerPacts] = useState<PlayerPactItem[]>([]);
  const globalStats = usePlayerStats();
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ show: true, message, type });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesRes, pactsRes] = await Promise.all([
        getPacts(),
        getPlayerPacts(),
      ]);
      if (templatesRes.success) setTemplates(templatesRes.data);
      if (pactsRes.success && Array.isArray(pactsRes.data)) {
        setPlayerPacts(
          (pactsRes.data as Array<unknown>).map((item) => {
            const p = item as Record<string, unknown>;
            const pact = p.pact as Record<string, unknown>;
            return {
              id: p.id as string,
              pactId: p.pactId as string,
              status: p.status as string,
              progress: p.progress as number,
              startedAt: (p.startedAt as Date).toISOString(),
              completedAt: (p.completedAt as Date | null)?.toISOString() ?? null,
              pact: {
                title: pact.title as string,
                description: pact.description as string | null,
                difficulty: pact.difficulty as string,
                duration: pact.duration as number,
                xpReward: pact.xpReward as number,
                coinReward: pact.coinReward as number,
                disciplineReward: pact.disciplineReward as number,
              },
            };
          }),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAccept = async (pactId: string) => {
    setAcceptingId(pactId);
    const result = await acceptPact({ pactId });
    setAcceptingId(null);
    if (result.success) {
      showToast("Pacto aceptado. ¡Cumple tu promesa!", "success");
      loadData();
      onStatsChange?.();
    } else {
      showToast(result.error, "error");
    }
  };

  const handleCancel = async () => {
    if (!cancellingId) return;
    const result = await cancelPact(cancellingId);
    setCancellingId(null);
    if (result.success) {
      showToast("Pacto cancelado", "info");
      loadData();
    } else {
      showToast(result.error, "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const result = await deletePact({ pactId: deletingId });
    setDeletingId(null);
    if (result.success) {
      showToast("Pacto eliminado del historial", "info");
      loadData();
    } else {
      showToast(result.error, "error");
    }
  };

  const handleComplete = async (pactId: string) => {
    const result = await completePact({ pactId });
    if (result.success) {
      const { rewards, newlyUnlocked } = result.data;
      const rewardMsgs = [
        `+${rewards.xp} XP`,
        `+${rewards.coins} 🪙`,
        `+${rewards.discipline} disciplina`,
      ];
      if (rewards.xpBonus > 0) rewardMsgs.push(`+${rewards.xpBonus} bono racha`);
      showToast(
        `Pacto completado: ${rewardMsgs.join(" · ")}${newlyUnlocked.length > 0 ? ` · Nuevo logro: ${newlyUnlocked[0].name}` : ""}`,
        "success",
      );
      loadData();
      onStatsChange?.();
    } else {
      showToast(result.error, "error");
    }
  };

  const activePacts = playerPacts.filter((p) => p.status === "ACTIVE");
  const completedPacts = playerPacts.filter((p) => p.status === "COMPLETED");

  const availableTemplates = templates.filter(
    (t) => !playerPacts.some((pp) => pp.pactId === t.id),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--hs-primary)" }} />
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowDashboard(false)}
          className="hs-btn-ghost text-sm py-1.5 px-3"
        >
          ← Volver a Pactos
        </button>
        <PactsDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ScrollText className="w-6 h-6" style={{ color: "var(--hs-primary)" }} />
          <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">
            Pactos
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDashboard(true)} className="hs-btn-ghost text-sm py-2">
            <Trophy className="w-4 h-4 inline mr-1" />
            Dashboard
          </button>
          <button onClick={() => setShowCreateForm(true)} className="hs-btn text-sm py-2">
            <Plus className="w-4 h-4 inline mr-1" />
            Nuevo Pacto
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: <Clock className="w-4 h-4" />, label: "Activos", value: activePacts.length, color: "var(--hs-secondary)" },
          { icon: <Check className="w-4 h-4" />, label: "Completados", value: completedPacts.length, color: "var(--hs-success)" },
          { icon: <Star className="w-4 h-4" />, label: "XP total", value: globalStats.stats?.xp ?? 0, color: "var(--hs-xp-color)" },
          { icon: <Gift className="w-4 h-4" />, label: "Monedas", value: globalStats.stats?.coins ?? 0, color: "var(--hs-gold)" },
          { icon: <Flame className="w-4 h-4" />, label: "Racha", value: globalStats.stats?.streak ?? 0, color: "var(--hs-streak-color)" },
        ].map((s) => (
          <div key={s.label} className="hs-card p-3 flex items-center gap-3">
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <p className="text-lg font-black text-[var(--hs-text)]">{s.value}</p>
              <p className="text-[9px] text-[var(--hs-text-muted)] uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Pacts */}
      {activePacts.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "var(--hs-secondary)" }} />
            Pactos Activos ({activePacts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activePacts.map((pp) => {
              const isExpanded = expandedId === pp.id;
              const elapsedDays = Math.floor(
                (Date.now() - new Date(pp.startedAt).getTime()) / (1000 * 60 * 60 * 24),
              );
              const daysLeft = Math.max(pp.pact.duration - elapsedDays, 0);

              return (
                <motion.div
                  key={pp.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hs-card p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--hs-primary), var(--hs-accent))" }}
                      >
                        <ScrollText className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--hs-text)] truncate">{pp.pact.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={pp.pact.difficulty === "EASY" ? "success" : pp.pact.difficulty === "HARD" || pp.pact.difficulty === "IMPOSSIBLE" ? "danger" : "warning"}>
                            {pp.pact.difficulty === "EASY" ? "Fácil" : pp.pact.difficulty === "MEDIUM" ? "Medio" : pp.pact.difficulty === "HARD" ? "Difícil" : "Imposible"}
                          </Badge>
                          <span className="text-[10px] text-[var(--hs-text-muted)]">
                            {daysLeft}d restantes
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCancellingId(pp.pactId)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" style={{ color: "var(--hs-text-muted)" }} />
                    </button>
                  </div>

                  <ProgressBar value={pp.progress} size="md" showValue />

                  <div className="mt-3 flex items-center gap-4 text-[10px] font-mono">
                    <span style={{ color: "var(--hs-xp-color)" }}>+{pp.pact.xpReward} XP</span>
                    <span style={{ color: "var(--hs-gold)" }}>+{pp.pact.coinReward} 🪙</span>
                    {pp.pact.disciplineReward > 0 && (
                      <span style={{ color: "var(--hs-primary)" }}>+{pp.pact.disciplineReward} disc.</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : pp.id)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-colors"
                      style={{ color: "var(--hs-text-muted)" }}
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? "Ocultar" : "Actualizar progreso"}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <PactProgressForm
                            pactId={pp.pactId}
                            onProgressUpdated={(progress, isComplete) => {
                              if (isComplete) {
                                handleComplete(pp.pactId);
                              } else {
                                loadData();
                              }
                            }}
                          />
                          <button
                            onClick={() => handleComplete(pp.pactId)}
                            className="w-full mt-2 hs-btn text-xs py-2"
                          >
                            <Trophy className="w-3 h-3 inline mr-1" />
                            Completar Pacto
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Pacts */}
      {completedPacts.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: "var(--hs-success)" }} />
            Pactos Completados ({completedPacts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {completedPacts.map((pp) => (
              <motion.div
                key={pp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hs-card p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)" }}
                  >
                    <Check className="w-4 h-4" style={{ color: "var(--hs-success)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--hs-text)] truncate">{pp.pact.title}</p>
                    <p className="text-[10px] text-[var(--hs-text-muted)]">
                      {pp.completedAt ? new Date(pp.completedAt).toLocaleDateString("es") : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span style={{ color: "var(--hs-xp-color)" }}>+{pp.pact.xpReward} XP</span>
                  <span style={{ color: "var(--hs-gold)" }}>+{pp.pact.coinReward} 🪙</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Pact Templates */}
      {availableTemplates.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "var(--hs-gold)" }} />
            Pactos Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableTemplates.map((pact) => (
              <motion.div
                key={pact.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hs-card p-4 flex flex-col"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={pact.difficulty === "EASY" ? "success" : pact.difficulty === "HARD" || pact.difficulty === "IMPOSSIBLE" ? "danger" : "warning"}>
                      {pact.difficulty === "EASY" ? "Fácil" : pact.difficulty === "MEDIUM" ? "Medio" : pact.difficulty === "HARD" ? "Difícil" : "Imposible"}
                    </Badge>
                    <span className="text-[10px] text-[var(--hs-text-muted)]">{pact.duration} días</span>
                  </div>
                  <h4 className="font-bold text-[var(--hs-text)] mb-1">{pact.title}</h4>
                  {pact.description && (
                    <p className="text-xs text-[var(--hs-text-muted)] mb-3 line-clamp-2">{pact.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] font-mono mb-3">
                    <span style={{ color: "var(--hs-xp-color)" }}>+{pact.xpReward} XP</span>
                    <span style={{ color: "var(--hs-gold)" }}>+{pact.coinReward} 🪙</span>
                    {pact.disciplineReward > 0 && (
                      <span style={{ color: "var(--hs-primary)" }}>+{pact.disciplineReward} disc.</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAccept(pact.id)}
                  disabled={acceptingId === pact.id}
                  className="hs-btn text-xs py-2 w-full justify-center"
                >
                  {acceptingId === pact.id ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <ScrollText className="w-3 h-3 mr-1" />
                  )}
                  Aceptar Pacto
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activePacts.length === 0 && availableTemplates.length === 0 && completedPacts.length === 0 && (
        <div className="hs-card p-12 text-center">
          <ScrollText className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--hs-text-muted)" }} />
          <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">Sin pactos aún</h3>
          <p className="text-sm text-[var(--hs-text-muted)] mb-6">
            Crea tu primer pacto contigo mismo. Define un objetivo y gana recompensas.
          </p>
          <button onClick={() => setShowCreateForm(true)} className="hs-btn">
            <Plus className="w-4 h-4 inline mr-1" />
            Crear primer pacto
          </button>
        </div>
      )}

      {/* Other status pacts (failed/cancelled) */}
      {playerPacts.filter((p) => p.status === "FAILED" || p.status === "CANCELLED").length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-3">
            Historial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {playerPacts
              .filter((p) => p.status === "FAILED" || p.status === "CANCELLED")
              .map((pp) => {
                const cfg = statusConfig[pp.status] ?? statusConfig.CANCELLED;
                return (
                  <div key={pp.id} className="hs-card p-4 opacity-60 group">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: cfg.bg }}
                      >
                        <X className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--hs-text)] truncate">{pp.pact.title}</p>
                        <span className="hs-badge text-[10px]" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <button
                        onClick={() => setDeletingId(pp.pactId)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "var(--hs-danger)" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Create Pact Modal */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Crear Nuevo Pacto" size="lg">
        <PactForm
          mode="create"
          onSuccess={() => {
            setShowCreateForm(false);
            loadData();
            showToast("Pacto creado exitosamente", "success");
          }}
        />
      </Modal>

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        isOpen={cancellingId !== null}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancel}
        title="Cancelar Pacto"
        message="¿Estás seguro de que quieres cancelar este pacto? Perderás todo el progreso acumulado."
        confirmLabel="Cancelar Pacto"
        variant="danger"
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Eliminar Pacto"
        message="¿Estás seguro de que quieres eliminar este pacto del historial? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
