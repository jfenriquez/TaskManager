"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaClock,
  FaHourglassHalf,
  FaBell,
} from "react-icons/fa";
import { RiResetLeftLine } from "react-icons/ri";

type Timer = {
  remainingMs: number;
  running: boolean;
};

type Task = {
  id: string;
  timerMinutes?: number | null;
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

  return (
    <div className="mt-3 flex items-center gap-4">
      {/* Icon + label group */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
            isFinished
              ? "border-base-300 bg-base-200"
              : "border-primary/30 bg-base-100"
          }`}
          title="Temporizador"
        >
          <FaClock
            className={`w-5 h-5 ${
              isFinished ? "text-base-content/40" : "text-primary"
            }`}
          />
          <div className="flex flex-col leading-none">
            <span className="text-xs text-base-content/60">
              Tiempo restante
            </span>
            <motion.span
              key={timeText}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`font-mono text-sm font-semibold ${
                isFinished ? "text-base-content/40" : "text-base-content"
              }`}
            >
              {timeText}
            </motion.span>
          </div>
        </div>

        {/* duración configurada */}
        {task.timerMinutes ? (
          <div className="badge badge-ghost gap-1">
            <FaHourglassHalf className="w-3 h-3" />
            <span>{task.timerMinutes} min</span>
          </div>
        ) : null}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2 ml-auto">
        {!timer.running ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="btn btn-sm btn-primary gap-2"
            onClick={() => handleStartTimer(task.id)}
            aria-label="Empezar temporizador"
            title="Empezar"
          >
            <FaPlay className="w-3 h-3" />
            <span className="hidden sm:inline">Empezar</span>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="btn btn-sm btn-warning gap-2"
            onClick={() => handlePauseTimer(task.id)}
            aria-label="Pausar temporizador"
            title="Pausar"
          >
            <FaPause className="w-3 h-3" />
            <span className="hidden sm:inline">Pausar</span>
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="btn btn-sm btn-info gap-2"
          onClick={() => handleStopTimer(task.id)}
          aria-label="Detener temporizador"
          title="Detener"
        >
          <RiResetLeftLine className="w-4 h-4" />
          <span className="hidden sm:inline">Reiniciar</span>
        </motion.button>
      </div>
    </div>
  );
}
