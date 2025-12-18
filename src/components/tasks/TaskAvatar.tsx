"use client";

import React, { useEffect, useState } from "react";
import { FaSmile, FaFrown, FaMeh } from "react-icons/fa";

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
  const iconColor =
    mood === "happy"
      ? "text-green-600"
      : mood === "angry"
      ? "text-red-600"
      : "text-yellow-600";
  const Icon = mood === "happy" ? FaSmile : mood === "angry" ? FaFrown : FaMeh;

  const [playerReady, setPlayerReady] = useState(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ce = (
      window as unknown as Window & { customElements?: CustomElementRegistry }
    ).customElements;
    if (ce && typeof ce.get === "function" && ce.get("lottie-player")) {
      queueMicrotask(() => setPlayerReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
    script.async = true;
    script.onload = () => queueMicrotask(() => setPlayerReady(true));
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, []);

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
      <div
        className={`flex items-center justify-center w-3xl h-3xl ${iconColor} `}
      >
        {playerReady ? (
          // @ts-expect-error - lottie-player is a web component loaded at runtime
          <lottie-player
            key={`${mood}-${pending}-${completed}`}
            src={
              mood === "happy"
                ? "/animations/Emoji_34.json"
                : mood === "angry"
                ? "/animations/Emoji_31.json"
                : "/animations/Emoji_29.json"
            }
            background="transparent"
            speed="1"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Icon aria-hidden />
        )}
      </div>
    </div>
  );
}
