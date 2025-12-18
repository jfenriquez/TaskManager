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
        task.completed ? "bg-base-200" : "bg-base-100"
      } shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${
        task.completed ? "border-success" : "border-primary"
      } rounded-xl`}
    >
      <div className="card-body p-4">
        {/* CONTENEDOR RESPONSIVO */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
          {/* Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
            />
          </div>

          {/* INFO PRINCIPAL */}
          <div className="flex-1 mt-2 sm:mt-0">
            <h3
              className={`font-semibold text-lg break-words ${
                task.completed
                  ? "line-through text-base-content/40"
                  : "text-base-content"
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={`text-sm mt-2 leading-snug break-words ${
                  task.completed
                    ? "text-base-content/40"
                    : "text-base-content/70"
                }`}
              >
                {task.description}
              </p>
            )}

            <div className="mt-3">
              <TaskTimerControls
                task={task}
                timer={timer}
                formatRemaining={formatRemaining}
                handleStartTimer={onStartTimer}
                handlePauseTimer={onPauseTimer}
                handleStopTimer={onStopTimer}
              />
            </div>
          </div>

          {/* BOTONES (EDIT / DELETE) — RESPONSIVOS */}
          <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0 sm:ml-2">
            <button
              className="btn btn-sm btn-ghost text-info hover:bg-info/10"
              onClick={() => onEdit(task)}
              aria-label="Editar tarea"
            >
              <FaEdit size={16} />
            </button>

            <button
              className="btn btn-sm btn-ghost text-error hover:bg-error/10"
              onClick={() => onDelete(task.id)}
              aria-label="Eliminar tarea"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
