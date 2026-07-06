import { Tasks } from "@prisma/client";
import { Task } from "@/src/types/task.types";

export function mapPrismaTaskToTask(task: Tasks): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    timerMinutes: task.timerMinutes ?? null,
    timerStartedAt: task.timerStartedAt
      ? new Date(task.timerStartedAt).toISOString()
      : null,
    timerEndsAt: task.timerEndsAt
      ? new Date(task.timerEndsAt).toISOString()
      : null,
    timerRemainingSeconds: task.timerRemainingSeconds ?? null,
    timerRunning: task.timerRunning ?? false,
    priority: task.priority as "LOW" | "MEDIUM" | "HIGH" | null,
    categoryId: task.categoryId ?? null,
  };
}
