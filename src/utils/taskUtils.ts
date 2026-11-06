// utils/taskUtils.ts

import { Task, TaskStats, FilterType } from "@/src/types/task.types";

export function calculateStats(tasks: Task[]): TaskStats {
  return {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };
}

const PRIORITY_ORDER: Record<NonNullable<Task["priority"]>, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      (PRIORITY_ORDER[b.priority ?? "MEDIUM"] ?? 2) -
      (PRIORITY_ORDER[a.priority ?? "MEDIUM"] ?? 2)
  );
}

export function filterTasks(tasks: Task[], filter: FilterType): Task[] {
  const filtered =
    filter === "active"
      ? tasks.filter((task) => !task.completed)
      : filter === "completed"
        ? tasks.filter((task) => task.completed)
        : tasks;

  return sortTasksByPriority(filtered);
}

export function promptForTimerMinutes(): number | null {
  const input = prompt("Duración en minutos (ej: 20):", "20");
  if (!input) return null;

  const parsed = parseInt(input, 10);
  if (isNaN(parsed) || parsed <= 0) {
    alert("Minutos inválidos");
    return null;
  }

  return parsed;
}
