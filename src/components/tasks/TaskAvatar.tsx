"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import happyAnimation from "@/src/assets/animations/Emoji_34.json";
import angryAnimation from "@/src/assets/animations/Emoji_31.json";
import neutralAnimation from "@/src/assets/animations/Emoji_29.json";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <span className="loading loading-spinner loading-sm" />,
});

type TaskLike = { completed?: boolean };

type Props = {
  pending?: number;
  completed?: number;
  tasks?: TaskLike[]; // opcional: si se pasa, se ignoran pending/completed
  size?: number | string; // px number or tailwind-friendly string
  className?: string;
};

export default function TaskAvatar({
  pending = 0,
  completed = 0,
  tasks,
  size = 64,
  className = "",
}: Props) {
  // Si nos pasan el array de tareas, calculamos los contadores
  if (Array.isArray(tasks)) {
    completed = tasks.filter((t) => !!t.completed).length;
    pending = tasks.length - completed;
  }

  const mood =
    pending > completed ? "angry" : pending < completed ? "happy" : "neutral";
  const bg =
    mood === "happy"
      ? "bg-green-100"
      : mood === "angry"
      ? "bg-red-100"
      : "bg-yellow-100";

  const animationData =
    mood === "happy"
      ? happyAnimation
      : mood === "angry"
      ? angryAnimation
      : neutralAnimation;

  const [pulse, setPulse] = useState(false);

  // Pulse animation when counts change
  useEffect(() => {
    // trigger a short pulse when counts change
    queueMicrotask(() => setPulse(true));
    const t = setTimeout(() => queueMicrotask(() => setPulse(false)), 350);
    return () => {
      clearTimeout(t);
    };
  }, [pending, completed]);

  // size puede ser número (px) o string (e.g. 'w-16 h-16' si se usa tailwind directamente)
  const style: React.CSSProperties =
    typeof size === "number" ? { width: size, height: size } : {};

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden transform transition-transform duration-300  ${
        pulse ? "scale-100" : "scale-150 "
      } ${bg} ${className}`}
      style={style}
      aria-label={`Avatar de estado: ${mood}. ${pending} pendientes, ${completed} completadas`}
      title={`${pending} tareas pendientes — ${completed} completadas`}
    >
      <div className="flex items-center justify-center w-full h-full">
        <Lottie
          key={`${mood}-${pending}-${completed}`}
          animationData={animationData}
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        />
      </div>
    </div>
  );
}
