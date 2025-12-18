// components/TaskHeader.tsx

import React from "react";
import { FaTrash, FaBell } from "react-icons/fa";
import TaskAvatar from "./TaskAvatar";
import { TaskStats } from "../../types/task.types";

interface TaskHeaderProps {
  userName?: string;
  stats: TaskStats;
  onDeleteCompleted: () => void;
  onRequestNotifications: () => void;
}

export default function TaskHeader({
  userName,
  stats,
  onDeleteCompleted,
  onRequestNotifications,
}: TaskHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        <TaskAvatar
          pending={stats.active}
          completed={stats.completed}
          size={72}
        />
        <div className="p-5">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            Gestor de Tareas
          </h1>
          <p className="text-base-content/70">
            Organiza tu día de manera efectiva{userName ? `, ${userName}` : ""}
          </p>
          <button
            onClick={onRequestNotifications}
            className="btn btn-sm btn-warning gap-2 mt-2"
          >
            <FaBell size={14} />
            Activar notificaciones
          </button>
        </div>
      </div>

      <div>
        <button
          onClick={onDeleteCompleted}
          className="btn btn-error btn-md gap-2"
        >
          <FaTrash size={16} />
          Eliminar completadas
        </button>
      </div>
    </div>
  );
}
