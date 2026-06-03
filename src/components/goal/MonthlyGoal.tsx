"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { FiTarget, FiCheck, FiEdit3, FiX, FiStar } from "react-icons/fi";
import { getMonthlyGoal, setMonthlyGoal, toggleMonthlyGoal } from "@/src/actions/goalActions";
import type { MonthlyGoalData } from "@/src/actions/goalActions";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function currentMonthName(): string {
  const m = new Date().getMonth();
  return MONTHS[m];
}

export default function MonthlyGoal() {
  const [goal, setGoal] = useState<MonthlyGoalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await getMonthlyGoal();
      setGoal(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => load());
  }, [load]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleCreate = useCallback(async () => {
    if (!inputValue.trim()) return;
    const created = await setMonthlyGoal(inputValue);
    setGoal(created);
    setEditing(false);
    setInputValue("");
  }, [inputValue]);

  const handleToggle = useCallback(async () => {
    try {
      const updated = await toggleMonthlyGoal();
      setGoal(updated);

      if (updated.completed && cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { scale: 1 },
          {
            scale: 1.03,
            duration: 0.15,
            yoyo: true,
            repeat: 3,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.to(cardRef.current, {
                boxShadow: "0 0 40px rgba(34, 197, 94, 0.4)",
                duration: 0.4,
                yoyo: true,
                repeat: 1,
              });
            },
          }
        );
      }
    } catch { /* ignore */ }
  }, []);

  const startEdit = useCallback(() => {
    if (goal) {
      setInputValue(goal.title);
      setEditing(true);
    }
  }, [goal]);

  const clearGoal = useCallback(async () => {
    try {
      await setMonthlyGoal("");
      setGoal(null);
      setEditing(true);
    } catch { /* ignore */ }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") setEditing(false);
  }, [handleCreate]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-lg p-5">
        <div className="flex items-center justify-center py-4">
          <span className="loading loading-spinner loading-sm" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
        goal?.completed
          ? "bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-base-100 border border-green-500/30"
          : goal
          ? "bg-gradient-to-br from-primary/10 via-secondary/5 to-base-100 border border-primary/20"
          : "bg-base-100 border border-base-300"
      } shadow-lg`}
    >
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: goal?.completed
            ? "radial-gradient(circle, #22c55e, #16a34a)"
            : "radial-gradient(circle, #3b82f6, #8b5cf6)",
        }}
      />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={goal?.completed ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {goal?.completed ? (
                <FiStar className="w-5 h-5 text-green-500" />
              ) : (
                <FiTarget className="w-5 h-5 text-primary" />
              )}
            </motion.div>
            <span className="text-sm font-semibold text-base-content/80">
              {goal?.completed ? "Objetivo cumplido" : `Objetivo de ${currentMonthName()}`}
            </span>
          </div>

          {goal && !editing && (
            <div className="flex gap-1">
              <button
                onClick={startEdit}
                className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content"
                title="Editar objetivo"
              >
                <FiEdit3 size={14} />
              </button>
              <button
                onClick={clearGoal}
                className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error"
                title="Eliminar objetivo"
              >
                <FiX size={14} />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!goal || editing ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs text-base-content/50 mb-2">
                {goal ? "Edita tu objetivo mensual:" : "¿Cuál es tu objetivo este mes?"}
              </p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="input input-bordered input-sm bg-base-200 flex-1 text-sm"
                  placeholder="Escribe tu objetivo aquí..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-primary btn-sm"
                  onClick={handleCreate}
                  disabled={!inputValue.trim()}
                >
                  <FiCheck size={16} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-start gap-3"
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                onClick={handleToggle}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  goal.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-base-300 hover:border-primary"
                }`}
              >
                {goal.completed && <FiCheck size={12} strokeWidth={3} />}
              </motion.button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-base font-medium leading-relaxed break-words transition-all ${
                    goal.completed
                      ? "line-through text-base-content/40"
                      : "text-base-content"
                  }`}
                >
                  {goal.title}
                </p>
                <p className="text-[10px] text-base-content/30 mt-1">
                  {goal.completed ? "¡Completado este mes!" : "Tócalo para marcar como cumplido"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
