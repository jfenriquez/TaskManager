// types/task.types.ts

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  timerMinutes?: number | null;
  timerStartedAt?: string | null;
  timerEndsAt?: string | null;
  timerRemainingSeconds?: number | null;
  timerRunning?: boolean | null;
}

export interface NewTaskForm {
  title: string;
  description: string;
  timerMinutes: string;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
}

export type FilterType = "all" | "active" | "completed";

export interface TimerState {
  remainingMs: number;
  running: boolean;
}
