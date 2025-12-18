// components/TaskFilter.tsx

import React from "react";
import { FaPlus } from "react-icons/fa";
import { FilterType } from "../../types/task.types";

interface TaskFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onAddTask: () => void;
}

export default function TaskFilter({
  filter,
  onFilterChange,
  onAddTask,
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

      <button className="btn btn-primary gap-2" onClick={onAddTask}>
        <FaPlus size={18} />
        Nueva Tarea
      </button>
    </div>
  );
}
