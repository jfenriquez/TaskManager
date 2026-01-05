"use client";

import { Tasks } from "@prisma/client";
import { useTransition } from "react";
import TasksTable from "./TasksTable";
import { importTasks } from "@/src/actions/taskActions";

interface TasksTableWrapperProps {
  initialTasks: Tasks[];
}

export default function TasksTableWrapper({
  initialTasks,
}: TasksTableWrapperProps) {
  const [isPending, startTransition] = useTransition();

  const handleImportTasks = async (tasksToImport: Partial<Tasks>[]) => {
    startTransition(async () => {
      try {
        await importTasks(tasksToImport);
      } catch (error) {
        console.error("Error al importar tareas:", error);
        throw error;
      }
    });
  };

  return <TasksTable tasks={initialTasks} onImportTasks={handleImportTasks} />;
}
