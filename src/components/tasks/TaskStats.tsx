import React from "react";
import { TaskStats } from "../../types/task.types";

interface TaskStatsProps {
  stats: TaskStats;
}

export default function TaskStatsComponent({ stats }: TaskStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="card !bg-gradient-to-br !from-blue-500 !to-blue-600 text-white shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-3xl">{stats.total}</h2>
          <p className="opacity-90">Total de tareas</p>
        </div>
      </div>
      <div className="card !bg-gradient-to-br !from-orange-500 !to-orange-600 text-white shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-3xl">{stats.active}</h2>
          <p className="opacity-90">Pendientes</p>
        </div>
      </div>
      <div className="card !bg-gradient-to-br !from-green-500 !to-green-600 text-white shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-3xl">{stats.completed}</h2>
          <p className="opacity-90">Completadas</p>
        </div>
      </div>
    </div>
  );
}
