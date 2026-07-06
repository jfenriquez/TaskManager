"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Crosshair, ListChecks } from "lucide-react";
import { useGoals } from "@/src/hooks/useGoals";
import GoalList from "./GoalList";
import GoalSheet from "./GoalSheet";

type ViewMode = "list" | "create";

export default function ObjetivosView() {
  const { goals, loading, fetchGoals, addGoal, editGoal, removeGoal, toggleComplete } = useGoals();
  const [view, setView] = useState<ViewMode>("list");

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSaveGoal = async (data: {
    title: string;
    purpose: string | null;
    visualization: string | null;
    hydeAnswers: Record<string, string> | null;
    missions: string[] | null;
    timeline: string | null;
  }) => {
    await addGoal({
      title: data.title,
      description: data.purpose,
      purpose: data.purpose,
      visualization: data.visualization,
      hydeAnswers: data.hydeAnswers,
      missions: data.missions,
      timeline: data.timeline,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crosshair className="w-6 h-6" style={{ color: "var(--hs-primary)" }} />
          <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">
            Objetivos
          </h2>
          {view === "list" && goals.length > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-lg"
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "var(--hs-success)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              {goals.length} {goals.length === 1 ? "objetivo" : "objetivos"}
            </span>
          )}
        </div>

        {view === "list" && (
          <button
            onClick={() => setView("create")}
            className="hs-btn text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nuevo objetivo
          </button>
        )}
      </div>

      {/* View switcher */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {view === "list" ? (
          <GoalList
            goals={goals}
            loading={loading}
            onToggleComplete={toggleComplete}
            onDelete={removeGoal}
            onEdit={(data) =>
              editGoal({
                id: data.id,
                title: data.title,
                description: data.description,
                purpose: data.purpose,
                missions: data.missions,
                timeline: data.timeline,
              })
            }
          />
        ) : (
          <GoalSheet
            onSave={handleSaveGoal}
            onClose={() => {
              setView("list");
              fetchGoals();
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
