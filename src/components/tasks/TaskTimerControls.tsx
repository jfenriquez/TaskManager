"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaClock, FaHourglassHalf } from "react-icons/fa";
import { RiResetLeftLine } from "react-icons/ri";

type Timer = {
  remainingMs: number;
  running: boolean;
};

type Task = {
  id: string;
  timerMinutes?: number | null;
  timerStartedAt?: string | null;
  timerEndsAt?: string | null;
};

type Props = {
  task: Task;
  timer: Timer;
  formatRemaining: (ms: number) => string;
  handleStartTimer: (taskId: string) => void;
  handlePauseTimer: (taskId: string) => void;
  handleStopTimer: (taskId: string) => void;
};

export default function TaskTimerControls({
  task,
  timer,
  formatRemaining,
  handleStartTimer,
  handlePauseTimer,
  handleStopTimer,
}: Props) {
  const timeText =
    timer.remainingMs > 0 ? formatRemaining(timer.remainingMs) : "--:--";

  const isFinished = timer.remainingMs === 0;

  const hasActiveTimer = timer.running || timer.remainingMs > 0;

  const totalMs = (() => {
    if (task.timerMinutes && task.timerMinutes > 0) {
      return task.timerMinutes * 60 * 1000;
    }
    if (timer.running && task.timerStartedAt && task.timerEndsAt) {
      const start = new Date(task.timerStartedAt).getTime();
      const end = new Date(task.timerEndsAt).getTime();
      if (end > start) return end - start;
    }
    return null;
  })();

  const progress =
    totalMs && totalMs > 0
      ? Math.min(100, Math.max(0, (timer.remainingMs / totalMs) * 100))
      : null;

  const isCritical = progress !== null && progress <= 10;
  const isLow = progress !== null && progress <= 25 && !isCritical;

  const barColor = isCritical
    ? "bg-error"
    : isLow
      ? "bg-warning"
      : "bg-primary";

  return (
    <div className="space-y-3">
      {/* FILA 1: Tiempo restante y duración - Siempre horizontal */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className={`relative overflow-hidden p-2 rounded-lg border-2 flex items-center gap-2 transition-all flex-1 min-w-0 ${
            isFinished
              ? "border-base-300 bg-base-200"
              : "border-primary/30 bg-base-100"
          }`}
          title="Temporizador"
          role={hasActiveTimer ? "progressbar" : undefined}
          aria-label={hasActiveTimer ? "Tiempo restante del temporizador" : undefined}
          aria-valuemin={hasActiveTimer ? 0 : undefined}
          aria-valuemax={hasActiveTimer ? 100 : undefined}
          aria-valuenow={
            hasActiveTimer && progress !== null
              ? Math.round(progress)
              : undefined
          }
        >
          <FaClock
            className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
              isFinished ? "text-base-content/60" : "text-primary"
            }`}
          />
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-[10px] sm:text-xs text-base-content/80 truncate">
              Tiempo restante
            </span>
            <motion.span
              key={timeText}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`font-mono text-xs sm:text-sm font-semibold ${
                isFinished ? "text-base-content/60" : "text-base-content"
              }`}
            >
              {timeText}
            </motion.span>
          </div>

          {hasActiveTimer && (
            <div className="absolute inset-x-0 bottom-0 h-1.5 overflow-hidden bg-base-300/60">
              <motion.div
                className={`relative h-full rounded-r-full ${barColor} ${
                  isCritical ? "animate-pulse" : ""
                }`}
                initial={false}
                animate={{ width: progress !== null ? `${progress}%` : "100%" }}
                transition={{ ease: "linear", duration: 0.9 }}
              >
                {timer.running && (
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: "linear",
                    }}
                  />
                )}
              </motion.div>
            </div>
          )}
        </div>

        {/* Duración configurada */}
        {task.timerMinutes ? (
          <div className="badge badge-ghost gap-1 flex-shrink-0 text-xs">
            <motion.span
              className="inline-flex"
              animate={
                timer.running ? { rotate: [0, 180, 180, 0] } : { rotate: 0 }
              }
              transition={
                timer.running
                  ? {
                      duration: 4,
                      times: [0, 0.45, 0.55, 1],
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : undefined
              }
            >
              <FaHourglassHalf className="w-3 h-3" />
            </motion.span>
            <span>{task.timerMinutes} min</span>
          </div>
        ) : null}
      </div>

      {/* FILA 2: Controles - Botones más compactos en móvil */}
      <div className="flex items-center gap-2">
        {!timer.running ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="btn btn-xs sm:btn-sm btn-primary gap-1 sm:gap-2 flex-1 sm:flex-initial"
            onClick={() => handleStartTimer(task.id)}
            aria-label="Empezar temporizador"
            title="Empezar"
          >
            <FaPlay className="w-3 h-3" />
            <span className="text-xs sm:text-sm">Empezar</span>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="btn btn-xs sm:btn-sm btn-warning gap-1 sm:gap-2 flex-1 sm:flex-initial"
            onClick={() => handlePauseTimer(task.id)}
            aria-label="Pausar temporizador"
            title="Pausar"
          >
            <FaPause className="w-3 h-3" />
            <span className="text-xs sm:text-sm">Pausar</span>
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="btn btn-xs sm:btn-sm btn-info gap-1 sm:gap-2 flex-1 sm:flex-initial"
          onClick={() => handleStopTimer(task.id)}
          aria-label="Detener temporizador"
          title="Detener"
        >
          <RiResetLeftLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Reiniciar</span>
        </motion.button>
      </div>
    </div>
  );
}
