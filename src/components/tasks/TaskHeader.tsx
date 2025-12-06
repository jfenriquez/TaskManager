// components/TaskHeader.tsx

import React from "react";
import { FaTrash } from "react-icons/fa";
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
        <div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text mb-2">
            Gestor de Tareas
          </h1>
          <p className="text-gray-600">
            Organiza tu día de manera efectiva{userName ? `, ${userName}` : ""}
          </p>
          <button
            onClick={onRequestNotifications}
            className="btn btn-sm btn-outline mt-2 bg-amber-300"
          >
            Activar notificaciones
          </button>
        </div>
      </div>

      <div>
        <button
          onClick={onDeleteCompleted}
          className="btn btn-error btn-md text-white gap-2 hover:brightness-110 transition-all duration-200"
        >
          <FaTrash />
          Eliminar tareas completadas
        </button>
      </div>
    </div>
  );
}
