import { useState, useEffect, useRef, useCallback } from "react";
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

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    onTimerEndRef.current = onTimerEnd;
  }, [onTimerEnd]);

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
        const currentTasks = tasksRef.current;

        // Nada que actualizar: evita un re-render por segundo sin timers activos
        const hasActiveTimers = currentTasks.some(
          (t) => t.timerRunning || t.timerRemainingSeconds
        );
        if (!hasActiveTimers && Object.keys(prev).length === 0) {
          return prev;
        }

        let changed = false;
        const next: Record<string, TimerState> = {};

        currentTasks.forEach((task) => {
          let entry: TimerState;
          if (task.timerRunning && task.timerEndsAt) {
            const rem = Math.max(
              0,
              new Date(task.timerEndsAt).getTime() - Date.now()
            );
            entry = { remainingMs: rem, running: true };
          } else {
            const remainingMs = task.timerRemainingSeconds
              ? task.timerRemainingSeconds * 1000
              : 0;
            entry = { remainingMs, running: false };
          }

          const prevEntry = prev[task.id];
          if (
            !prevEntry ||
            prevEntry.remainingMs !== entry.remainingMs ||
            prevEntry.running !== entry.running
          ) {
            changed = true;
          }
          next[task.id] = entry;
        });

        if (Object.keys(prev).length !== currentTasks.length) changed = true;

        return changed ? next : prev;
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

  const formatRemaining = useCallback((ms: number) => {
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
  }, []);

  const markStoppedByUser = (taskId: string) => {
    stopByUserRef.current[taskId] = true;
  };

  return {
    counts,
    formatRemaining,
    markStoppedByUser,
  };
}
