// components/TaskList.tsx

import React from "react";
import TaskItem from "./TaskItem";
import { Task, TimerState } from "../../types/task.types";

interface TaskListProps {
  tasks: Task[];
  counts: Record<string, TimerState>;
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
        <p className="text-gray-400 dark:text-gray-500 text-lg transition-colors duration-200">
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
