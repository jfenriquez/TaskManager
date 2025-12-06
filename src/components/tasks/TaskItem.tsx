// components/TaskItem.tsx

import React from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import TaskTimerControls from "./TaskTimerControls";
import { Task, TimerState } from "../../types/task.types";

interface TaskItemProps {
  task: Task;
  timer: TimerState;
  formatRemaining: (ms: number) => string;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartTimer: (taskId: string) => void;
  onPauseTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
}

export default function TaskItem({
  task,
  timer,
  formatRemaining,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartTimer,
  onPauseTimer,
  onStopTimer,
}: TaskItemProps) {
  return (
    <div
      className={`card ${
        task.completed ? "bg-gray-50" : "bg-amber-95000"
      } shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${
        task.completed ? "border-green-500" : "border-purple-500"
      }`}
    >
      <div className="card-body p-4">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            className="checkbox checkbox-primary mt-1"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
          />
          <div className="flex-1">
            <h3
              className={`font-semibold text-lg ${
                task.completed ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p
                className={`text-sm mt-1 ${
                  task.completed ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {task.description}
              </p>
            )}

            <TaskTimerControls
              task={task}
              timer={timer}
              formatRemaining={formatRemaining}
              handleStartTimer={onStartTimer}
              handlePauseTimer={onPauseTimer}
              handleStopTimer={onStopTimer}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => onEdit(task)}
            >
              <FaEdit size={16} />
            </button>
            <button
              className="btn btn-ghost btn-sm btn-circle text-error"
              onClick={() => onDelete(task.id)}
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
