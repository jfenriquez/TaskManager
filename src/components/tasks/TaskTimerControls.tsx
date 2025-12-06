"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaStop,
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
    <div className="mt-3 flex items-center gap-4 text-slate-900">
      {/* Icon + label group */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-md border-2 flex items-center gap-2 ${
            isFinished
              ? "border-gray-200 bg-gray-50"
              : "border-primary/30 bg-white"
          }`}
          title="Temporizador"
        >
          <FaClock
            className={`w-5 h-5 ${
              isFinished ? "text-gray-400" : "text-primary"
            }`}
          />
          <div className="flex flex-col leading-none">
            <span className="text-xs text-gray-500">Tiempo restante</span>
            <motion.span
              key={timeText}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`font-mono text-sm ${
                isFinished ? "text-gray-400" : "text-gray-800"
              }`}
            >
              {timeText}
            </motion.span>
          </div>
        </div>

        {/* duración configurada */}
        {task.timerMinutes ? (
          <div className="text-xs opacity-80 flex items-center gap-1">
            <FaHourglassHalf className="w-4 h-4" />
            <span>Duración: {task.timerMinutes} min</span>
          </div>
        ) : null}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2 ml-auto">
        {!timer.running ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="btn btn-sm btn-primary gap-2 flex items-center"
            onClick={() => handleStartTimer(task.id)}
            aria-label="Empezar temporizador"
            title="Empezar"
          >
            <FaPlay className="w-4 h-4" />
            <span className="hidden sm:inline">Empezar</span>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="btn btn-sm btn-warning gap-2 flex items-center"
            onClick={() => handlePauseTimer(task.id)}
            aria-label="Pausar temporizador"
            title="Pausar"
          >
            <FaPause className="w-4 h-4" />
            <span className="hidden sm:inline">Pausar</span>
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="btn btn-sm btn-ghost gap-2 flex items-center"
          onClick={() => handleStopTimer(task.id)}
          aria-label="Detener temporizador"
          title="Detener"
        >
          <RiResetLeftLine className="w-4 h-4" />
          <span className="hidden sm:inline">Reiniciar</span>
        </motion.button>

        {/* Notificación / alerta visual cuando termina */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFinished ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center gap-2 p-2 rounded-md ${
            isFinished ? "bg-red-50 border border-red-200" : "hidden"
          }`}
          role="status"
          aria-hidden={!isFinished}
          title={isFinished ? "Temporizador finalizado" : ""}
        >
          <FaBell className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600">Finalizado</span>
        </motion.div>
      </div>
    </div>
  );
}
