"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Plus, Split, Calendar, Target } from "lucide-react";
import type { GoalItem } from "@/src/hooks/useGoals";

interface GoalModalProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id: string;
    title: string;
    description?: string | null;
    purpose?: string | null;
    missions?: string[] | null;
    timeline?: string | null;
  }) => void;
}

export default function GoalModal({ goal, isOpen, onClose, onSave }: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [missions, setMissions] = useState<string[]>([]);
  const [newMission, setNewMission] = useState("");
  const [timeline, setTimeline] = useState("");

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description ?? goal.purpose ?? "");
      setMissions(goal.missions ?? []);
      setTimeline(goal.timeline ? goal.timeline.slice(0, 10) : "");
    } else {
      setTitle("");
      setDescription("");
      setMissions([]);
      setNewMission("");
      setTimeline("");
    }
  }, [goal, isOpen]);

  const addMission = () => {
    if (newMission.trim()) {
      setMissions([...missions, newMission.trim()]);
      setNewMission("");
    }
  };

  const handleSave = () => {
    if (!goal || !title.trim()) return;
    onSave({
      id: goal.id,
      title: title.trim(),
      description: description || null,
      purpose: description || null,
      missions: missions.length > 0 ? missions : null,
      timeline: timeline || null,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-lg rounded-2xl p-6 space-y-5"
            style={{
              background: "var(--hs-card-bg)",
              border: "1px solid var(--hs-glass-border)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" style={{ color: "var(--hs-primary)" }} />
                <h2 className="text-lg font-bold text-[var(--hs-text)]">Editar Objetivo</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: "var(--hs-text-muted)" }} />
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-[var(--hs-text-muted)] mb-1.5 block uppercase tracking-wider">
                Título del objetivo
              </label>
              <input
                className="hs-input"
                placeholder="Ej: Subir 15 kilos de masa muscular"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description / Purpose */}
            <div>
              <label className="text-xs font-semibold text-[var(--hs-text-muted)] mb-1.5 block uppercase tracking-wider">
                Propósito / Descripción
              </label>
              <textarea
                className="hs-input min-h-[80px] resize-none"
                placeholder="¿Por qué quieres esto?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Missions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[var(--hs-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Split className="w-3.5 h-3.5" /> Misiones
                </label>
                {missions.length > 0 && (
                  <span className="text-[10px] text-[var(--hs-text-muted)]">
                    {missions.length} misiones
                  </span>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  className="hs-input flex-1 text-sm"
                  placeholder="Agregar misión..."
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMission()}
                />
                <button
                  onClick={addMission}
                  className="hs-btn text-sm px-3"
                  disabled={!newMission.trim()}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {missions.length > 0 && (
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                  {missions.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                      style={{
                        background: "rgba(16,185,129,0.05)",
                        border: "1px solid rgba(16,185,129,0.1)",
                      }}
                    >
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--hs-success)" }} />
                      <span className="flex-1 text-[var(--hs-text)]">{m}</span>
                      <button
                        onClick={() => setMissions(missions.filter((_, j) => j !== i))}
                        className="text-[10px] text-[var(--hs-text-muted)] hover:text-[var(--hs-danger)]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <label className="text-xs font-semibold text-[var(--hs-text-muted)] mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Fecha límite
              </label>
              <input
                type="date"
                className="hs-input"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="hs-btn-ghost text-sm">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="hs-btn text-sm"
                disabled={!title.trim()}
              >
                <Check className="w-4 h-4 mr-1" />
                Guardar cambios
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
