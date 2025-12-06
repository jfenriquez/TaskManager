// hooks/useTasks.ts

import { useState, useTransition } from "react";
import { Tasks } from "@prisma/client";
import {
  deleteTasksCompleted,
  deleteTaskXid,
  updateStatusTask,
  updateTask,
  createTask,
  startTaskTimer,
  pauseTaskTimer,
  stopTaskTimer,
} from "@/src/actions/taskActions";
import { Task, NewTaskForm } from "../types/task.types";

export function useTasks(initialData: Tasks[] = []) {
  const [tasks, setTasks] = useState<Task[]>(
    initialData.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      timerMinutes: task.timerMinutes ?? null,
      timerStartedAt: task.timerStartedAt
        ? new Date(task.timerStartedAt).toISOString()
        : null,
      timerEndsAt: task.timerEndsAt
        ? new Date(task.timerEndsAt).toISOString()
        : null,
      timerRemainingSeconds: task.timerRemainingSeconds ?? null,
      timerRunning: task.timerRunning ?? false,
    }))
  );

  const [isPending, startTransitionLocal] = useTransition();

  const handleAddTask = async (newTask: NewTaskForm) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      id: tempId,
      title: newTask.title,
      description: newTask.description,
      completed: false,
      timerMinutes: newTask.timerMinutes
        ? parseInt(newTask.timerMinutes, 10)
        : null,
      timerRunning: false,
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    startTransitionLocal(async () => {
      try {
        const created = await createTask({
          title: optimisticTask.title,
          description: optimisticTask.description ?? undefined,
          completed: false,
          timerMinutes: optimisticTask.timerMinutes ?? null,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? (created as Task) : t))
        );
      } catch (err) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        console.error("Error creando tarea:", err);
      }
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransitionLocal(async () => {
      try {
        await deleteTaskXid(id);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const toggleComplete = (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    startTransitionLocal(async () => {
      try {
        await updateStatusTask(id, !current.completed);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );

    updateTask({
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description ?? undefined,
        timerMinutes: updatedTask.timerMinutes ?? null,
      },
    }).catch((err) => console.error(err));
  };

  const deleteAllCompleted = async () => {
    await deleteTasksCompleted();
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const handleStartTimer = (taskId: string, minutes?: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    startTransitionLocal(async () => {
      try {
        const updated = await startTaskTimer(taskId, minutes);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? (updated as Task) : t))
        );
      } catch (err) {
        console.error("Error al iniciar temporizador:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        alert("No se pudo iniciar el temporizador: " + errorMessage);
      }
    });
  };

  const handlePauseTimer = (taskId: string) => {
    startTransitionLocal(async () => {
      try {
        const updated = await pauseTaskTimer(taskId);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? (updated as Task) : t))
        );
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleStopTimer = (taskId: string) => {
    startTransitionLocal(async () => {
      try {
        const updated = await stopTaskTimer(taskId);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? (updated as Task) : t))
        );
      } catch (err) {
        console.error(err);
      }
    });
  };

  return {
    tasks,
    setTasks,
    isPending,
    handleAddTask,
    deleteTask,
    toggleComplete,
    handleUpdateTask,
    deleteAllCompleted,
    handleStartTimer,
    handlePauseTimer,
    handleStopTimer,
  };
}
