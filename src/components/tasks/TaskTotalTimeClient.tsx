"use client";

import { useEffect, useState } from "react";
import PlaylistPlayer from "../AudioPlayer";

import {
  FaClock,
  FaHourglassHalf,
  FaFlag,
  FaCalendarCheck,
} from "react-icons/fa";

export default function TaskTotalClient({ minutes }: { minutes: number }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function formatMinutes(m: number) {
    const h = Math.floor(m / 60);
    const min = m % 60;

    if (h === 0) return `${min} min`;
    if (min === 0) return `${h} h`;
    return `${h} h ${min} min`;
  }

  function getEstimatedFinishTime() {
    const finish = new Date(now.getTime() + minutes * 60 * 1000);

    let hours = finish.getHours();
    const minutesFinish = finish.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    const padded = (n: number) => n.toString().padStart(2, "0");

    return `${hours}:${padded(minutesFinish)} ${ampm}`;
  }

  const finishTime = getEstimatedFinishTime();

  return (
    <div className="space-y-4">
      {/* Audio Player */}
      <div className="mb-6">
        <PlaylistPlayer />
      </div>

      {/* Stats Cards */}
      <div className="space-y-3">
        {/* Reloj en vivo */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="bg-success/10 p-3 rounded-lg">
                <FaClock className="text-success text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-base-content/60 font-medium">
                  Hora actual
                </p>
                <p className="text-lg font-bold text-success">
                  {now.toLocaleTimeString("es-CO")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiempo total estimado */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FaHourglassHalf className="text-primary text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-base-content/60 font-medium">
                  Tiempo total estimado
                </p>
                <p className="text-base font-bold text-primary">
                  {formatMinutes(minutes)}
                </p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  {minutes} minutos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hora de finalización */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="bg-info/10 p-3 rounded-lg">
                <FaFlag className="text-info text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-base-content/60 font-medium">
                  Terminarías a las
                </p>
                <p className="text-lg font-bold text-info">{finishTime}</p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Si empiezas ahora
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="alert alert-success shadow-sm">
        <FaCalendarCheck className="text-lg" />
        <div className="flex-1">
          <p className="text-sm font-semibold">¡Puedes hacerlo!</p>
          <p className="text-xs opacity-80">
            Mantén el enfoque y completa tus tareas
          </p>
        </div>
      </div>
    </div>
  );
}
