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
      <div className="btn-group">
        <button
          className={`btn btn-sm ${filter === "all" ? "btn-active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          Todas
        </button>
        <button
          className={`btn btn-sm ${filter === "active" ? "btn-active" : ""}`}
          onClick={() => onFilterChange("active")}
        >
          Activas
        </button>
        <button
          className={`btn btn-sm ${filter === "completed" ? "btn-active" : ""}`}
          onClick={() => onFilterChange("completed")}
        >
          Completadas
        </button>
      </div>

      <button className="btn btn-primary gap-2" onClick={onAddTask}>
        <FaPlus size={20} />
        Nueva Tarea
      </button>
    </div>
  );
}
