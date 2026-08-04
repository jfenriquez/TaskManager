// components/TaskList.tsx

import React from "react";
import TaskItem from "./TaskItem";
import { Task, TimerState } from "@/src/types/task.types";

interface TaskListProps {
  tasks: Task[];
  counts: Record<string, TimerState>;
  categories?: { id: string; name: string; color: string }[];
  formatRemaining: (ms: number) => string;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartTimer: (taskId: string) => void;
  onPauseTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
}

export default function TaskList({
  tasks,
  counts,
  categories,
  formatRemaining,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartTimer,
  onPauseTimer,
  onStopTimer,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base-content/70 text-lg transition-colors duration-200">
          No hay tareas para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const timer = counts[task.id] ?? { remainingMs: 0, running: false };
        return (
          <TaskItem
            key={task.id}
            task={task}
            timer={timer}
            categories={categories}
            formatRemaining={formatRemaining}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onStartTimer={onStartTimer}
            onPauseTimer={onPauseTimer}
            onStopTimer={onStopTimer}
          />
        );
      })}
    </div>
  );
}
