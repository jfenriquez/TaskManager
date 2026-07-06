// components/TaskHeader.tsx

import React from "react";
import { FaBell } from "react-icons/fa";
import TaskAvatar from "./TaskAvatar";
import { TaskStats } from "@/src/types/task.types";
import StreakBadge from "@/src/components/streak/StreakBadge";

interface TaskHeaderProps {
  userName?: string;
  stats: TaskStats;
  onRequestNotifications: () => void;
}

export default function TaskHeader({
  userName,
  stats,
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

      <div className="flex items-center gap-3">
        <StreakBadge />
      </div>
    </div>
  );
}
