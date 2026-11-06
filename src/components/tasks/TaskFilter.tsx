// components/TaskFilter.tsx

import React from "react";
import { FaPlus, FaVolumeUp, FaStop } from "react-icons/fa";
import { FilterType } from "@/src/types/task.types";

interface TaskFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onAddTask: () => void;
  onReadTasks: () => void;
  isReading?: boolean;
}

export default function TaskFilter({
  filter,
  onFilterChange,
  onAddTask,
  onReadTasks,
  isReading = false,
}: TaskFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <div className="join">
        <button
          className={`btn btn-sm join-item ${
            filter === "all" ? "btn-active btn-primary" : "btn-info-ghost"
          }`}
          onClick={() => onFilterChange("all")}
        >
          Todas
        </button>
        <button
          className={`btn btn-sm join-item ${
            filter === "active" ? "btn-active btn-primary" : "btn-info-ghost"
          }`}
          onClick={() => onFilterChange("active")}
        >
          Activas
        </button>
        <button
          className={`btn btn-sm join-item ${
            filter === "completed" ? "btn-active btn-primary" : "btn-info-ghost"
          }`}
          onClick={() => onFilterChange("completed")}
        >
          Completadas
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          className={`btn gap-2 ${isReading ? "btn-error" : "btn-outline"}`}
          onClick={onReadTasks}
          title="Leer tareas pendientes y objetivo en voz alta (Alt + L)"
        >
          {isReading ? <FaStop size={16} /> : <FaVolumeUp size={16} />}
          {isReading ? "Detener" : "Leer"}
        </button>

        <button className="btn btn-primary gap-2" onClick={onAddTask}>
          <FaPlus size={18} />
          Nueva Tarea
        </button>
      </div>
    </div>
  );
}
