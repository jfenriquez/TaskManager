"use client";

import { useState, useCallback } from "react";
import type { GoalResponse, CreateGoalInput, UpdateGoalInput } from "@/src/actions/goalActions";
import {
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleGoalCompleted,
} from "@/src/actions/goalActions";

export interface GoalItem {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  purpose: string | null;
  visualization: string | null;
  hydeAnswers: Record<string, string> | null;
  missions: string[] | null;
  timeline: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllGoals();
      setGoals(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const addGoal = useCallback(async (input: CreateGoalInput): Promise<GoalResponse> => {
    const created = await createGoal(input);
    setGoals((prev) => [created, ...prev]);
    return created;
  }, []);

  const editGoal = useCallback(async (input: UpdateGoalInput): Promise<GoalResponse> => {
    const updated = await updateGoal(input);
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    return updated;
  }, []);

  const removeGoal = useCallback(async (id: string) => {
    await deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
    try {
      await toggleGoalCompleted(id);
    } catch {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, completed: !g.completed } : g
        )
      );
    }
  }, []);

  return {
    goals,
    loading,
    fetchGoals,
    addGoal,
    editGoal,
    removeGoal,
    toggleComplete,
  };
}
