import { useState, useEffect, useRef } from "react";
import { Task, TimerState } from "@/src/types/task.types";

interface UseTimerProps {
  tasks: Task[];
  onTimerEnd: (taskId: string) => void;
}

export function useTimer({ tasks, onTimerEnd }: UseTimerProps) {
  const [counts, setCounts] = useState<Record<string, TimerState>>({});
  const prevCountsRef = useRef<Record<string, number>>({});
  const stopByUserRef = useRef<Record<string, boolean>>({});
  const tasksRef = useRef(tasks);
  const onTimerEndRef = useRef(onTimerEnd);

  tasksRef.current = tasks;
  onTimerEndRef.current = onTimerEnd;

  // Inicializar counts desde tasks
  useEffect(() => {
    const initial: Record<string, TimerState> = {};
    tasks.forEach((t) => {
      const endsAt = t.timerEndsAt ? new Date(t.timerEndsAt).getTime() : null;
      const remainingMs = endsAt
        ? Math.max(0, endsAt - Date.now())
        : t.timerRemainingSeconds
        ? t.timerRemainingSeconds * 1000
        : 0;
      initial[t.id] = { remainingMs, running: !!t.timerRunning && !!endsAt };
    });
    setCounts(initial);
  }, [tasks]);

  // Tick para actualizar countdowns cada segundo (sin dependencias de tasks)
  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => {
        const next = { ...prev };
        const currentTasks = tasksRef.current;
        Object.keys(next).forEach((id) => {
          const task = currentTasks.find((t) => t.id === id);
          if (!task) return;

          if (task.timerRunning && task.timerEndsAt) {
            const rem = Math.max(
              0,
              new Date(task.timerEndsAt).getTime() - Date.now()
            );
            next[id] = { remainingMs: rem, running: true };
          } else {
            const remainingMs = task.timerRemainingSeconds
              ? task.timerRemainingSeconds * 1000
              : 0;
            next[id] = { remainingMs, running: false };
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Detectar cuando un timer llega a 0
  useEffect(() => {
    Object.keys(counts).forEach((taskId) => {
      const prevRem = prevCountsRef.current[taskId] ?? Infinity;
      const curRem = counts[taskId]?.remainingMs ?? 0;

      if (prevRem !== Infinity && prevRem > 0 && curRem === 0) {
        if (stopByUserRef.current[taskId]) {
          stopByUserRef.current[taskId] = false;
        } else {
          const task = tasksRef.current.find((t) => t.id === taskId);
          if (task && task.timerRunning) {
            onTimerEndRef.current(taskId);
          }
        }
      }

      prevCountsRef.current[taskId] = curRem;
    });
  }, [counts]);

  const formatRemaining = (ms: number) => {
    if (ms <= 0) return "00:00";
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hours > 0)
      return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const markStoppedByUser = (taskId: string) => {
    stopByUserRef.current[taskId] = true;
  };

  return {
    counts,
    formatRemaining,
    markStoppedByUser,
  };
}
