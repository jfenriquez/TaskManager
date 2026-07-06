// hooks/useTasks.ts

import { useState, useTransition, useCallback, useRef } from "react";
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
import { Task, NewTaskForm } from "@/src/types/task.types";
import { mapPrismaTaskToTask } from "@/src/utils/mapTask";

export function useTasks(initialData: Tasks[] = []) {
  const [tasks, setTasks] = useState<Task[]>(
    initialData.map(mapPrismaTaskToTask)
  );

  const [isPending, startTransitionLocal] = useTransition();
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const handleAddTask = useCallback(async (newTask: NewTaskForm) => {
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
      priority: newTask.priority,
      categoryId: newTask.categoryId || null,
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    startTransitionLocal(async () => {
      try {
        const created = await createTask({
          title: optimisticTask.title,
          description: optimisticTask.description ?? undefined,
          completed: false,
          timerMinutes: optimisticTask.timerMinutes ?? null,
          priority: optimisticTask.priority ?? "MEDIUM",
          categoryId: optimisticTask.categoryId ?? null,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? (created as Task) : t))
        );
      } catch (err) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        console.error("Error creando tarea:", err);
      }
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransitionLocal(async () => {
      try {
        await deleteTaskXid(id);
      } catch (err) {
        console.error(err);
      }
    });
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const current = tasksRef.current.find((t) => t.id === id);
    const newCompleted = !current?.completed;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));
    startTransitionLocal(async () => {
      try {
        await updateStatusTask(id, newCompleted);
      } catch (err) {
        console.error(err);
      }
    });
  }, []);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );

    updateTask({
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description ?? undefined,
        timerMinutes: updatedTask.timerMinutes ?? null,
        priority: updatedTask.priority ?? "MEDIUM",
        categoryId: updatedTask.categoryId ?? null,
      },
    }).catch((err) => console.error(err));
  }, []);

  const deleteAllCompleted = useCallback(async () => {
    await deleteTasksCompleted();
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  const handleStartTimer = useCallback((taskId: string, minutes?: number) => {
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
  }, []);

  const handlePauseTimer = useCallback((taskId: string) => {
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
  }, []);

  const handleStopTimer = useCallback((taskId: string) => {
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
  }, []);

  const replaceTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  return {
    tasks,
    isPending,
    replaceTasks,
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
