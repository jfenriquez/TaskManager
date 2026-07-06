"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Check,
  Trash2,
  Edit3,
  Calendar,
  Split,
  Sparkles,
  Crosshair,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import type { GoalItem } from "@/src/hooks/useGoals";
import GoalModal from "./GoalModal";

interface GoalListProps {
  goals: GoalItem[];
  loading: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (data: {
    id: string;
    title: string;
    description?: string | null;
    purpose?: string | null;
    missions?: string[] | null;
    timeline?: string | null;
  }) => void;
}

export default function GoalList({
  goals,
  loading,
  onToggleComplete,
  onDelete,
  onEdit,
}: GoalListProps) {
  const [editGoal, setEditGoal] = useState<GoalItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleEdit = (goal: GoalItem) => {
    setEditGoal(goal);
    setShowEditModal(true);
    setMenuOpenId(null);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setMenuOpenId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div
            className="w-12 h-12 rounded-2xl mx-auto animate-pulse"
            style={{
              background: "linear-gradient(135deg, var(--hs-primary), var(--hs-secondary))",
            }}
          />
          <p className="text-sm font-medium" style={{ color: "var(--hs-text-muted)" }}>
            Cargando objetivos...
          </p>
        </div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hs-card p-12 text-center"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Crosshair className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--hs-text-muted)" }} />
        </motion.div>
        <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">Sin objetivos aún</h3>
        <p className="text-sm text-[var(--hs-text-muted)] max-w-sm mx-auto">
          Define tu primer objetivo usando el wizard de 6 pasos. Cada gran logro comienza con una decisión.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {goals.map((goal) => {
          const isExpanded = expandedId === goal.id;
          const isMenuOpen = menuOpenId === goal.id;

          return (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hs-card overflow-hidden"
            >
              {/* Main row */}
              <div className="flex items-start gap-3 p-4">
                {/* Checkbox */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onToggleComplete(goal.id)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    goal.completed
                      ? "border-[var(--hs-success)]"
                      : "border-[var(--hs-glass-border)] hover:border-[var(--hs-primary)]"
                  }`}
                  style={{
                    background: goal.completed ? "var(--hs-success)" : "transparent",
                  }}
                >
                  {goal.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </motion.button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        className={`font-bold text-base break-words transition-all ${
                          goal.completed
                            ? "line-through text-[var(--hs-text-muted)]"
                            : "text-[var(--hs-text)]"
                        }`}
                      >
                        {goal.title}
                      </h3>
                      {goal.purpose && (
                        <p
                          className={`text-sm mt-0.5 line-clamp-2 ${
                            goal.completed
                              ? "text-[var(--hs-text-muted)]/50"
                              : "text-[var(--hs-text-muted)]"
                          }`}
                        >
                          {goal.purpose}
                        </p>
                      )}
                    </div>

                    {/* Actions menu */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setMenuOpenId(isMenuOpen ? null : goal.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" style={{ color: "var(--hs-text-muted)" }} />
                      </button>

                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                            className="absolute right-0 top-8 z-10 w-36 rounded-xl overflow-hidden"
                            style={{
                              background: "var(--hs-card-bg)",
                              border: "1px solid var(--hs-glass-border)",
                              boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                            }}
                          >
                            <button
                              onClick={() => handleEdit(goal)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--hs-text)] hover:bg-white/5 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm"
                              style={{ color: "var(--hs-danger)" }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Eliminar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Meta info & expand */}
                  <div className="flex items-center gap-3 mt-2">
                    {goal.missions && goal.missions.length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                        className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: "var(--hs-text-muted)" }}
                      >
                        <Split className="w-3 h-3" />
                        {goal.missions.length} misiones
                      </button>
                    )}
                    {goal.timeline && (
                      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: "var(--hs-text-muted)" }}
                      >
                        <Calendar className="w-3 h-3" />
                        {new Date(goal.timeline).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {goal.completed && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--hs-success)" }}
                      >
                        <Sparkles className="w-3 h-3" />
                        Completado
                      </span>
                    )}
                  </div>

                  {/* Expanded missions */}
                  <AnimatePresence>
                    {isExpanded && goal.missions && goal.missions.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-1.5 overflow-hidden"
                      >
                        {goal.missions.map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                            style={{
                              background: "rgba(16,185,129,0.05)",
                              border: "1px solid rgba(16,185,129,0.08)",
                            }}
                          >
                            <Check className="w-3 h-3" style={{ color: "var(--hs-success)" }} />
                            <span className="text-[var(--hs-text)]">{m}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <GoalModal
        goal={editGoal}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditGoal(null);
        }}
        onSave={onEdit}
      />
    </>
  );
}
