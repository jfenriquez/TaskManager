// utils/taskUtils.ts

import { Task, TaskStats, FilterType } from "../types/task.types";

export function calculateStats(tasks: Task[]): TaskStats {
  return {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };
}

export function filterTasks(tasks: Task[], filter: FilterType): Task[] {
  if (filter === "active") return tasks.filter((task) => !task.completed);
  if (filter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
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
