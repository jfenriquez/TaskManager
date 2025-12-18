import React from "react";
import { TaskStats } from "../../types/task.types";

interface TaskStatsProps {
  stats: TaskStats;
}

export default function TaskStatsComponent({ stats }: TaskStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total - Usando color Primary */}
      <div className="card bg-primary text-primary-content shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-4xl font-bold">{stats.total}</h2>
          <p className="font-medium">Total de tareas</p>
        </div>
      </div>

      {/* Pendientes - Usando color Secondary o Accent */}
      <div className="card bg-secondary text-secondary-content shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-4xl font-bold">{stats.active}</h2>
          <p className="font-medium">Pendientes</p>
        </div>
      </div>

      {/* Completadas - Usando color Neutral o Accent */}
      <div className="card bg-accent text-accent-content shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-4xl font-bold">{stats.completed}</h2>
          <p className="font-medium">Completadas</p>
        </div>
      </div>
    </div>
  );
}
