/* components/Hero.tsx */
"use client";
import React, { useEffect, useRef } from "react";
import { FiCalendar, FiThumbsUp } from "react-icons/fi";
import { gsap } from "gsap";

export default function Hero() {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const accentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(rightRef.current, {
        x: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      });
      gsap.to(accentRef.current, {
        rotation: 360,
        repeat: -1,
        ease: "linear",
        duration: 18,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="container mx-auto py-20 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div ref={leftRef}>
          <div className="badge badge-primary badge-outline mb-4 shadow-sm">
            ✨ Productividad mejorada
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-primary/70">
            Organiza tus días.{" "}
            <span className="text-primary drop-shadow-lg">
              Avanza sin esfuerzo.
            </span>
          </h1>
          <p className="mt-6 text-base-content/70 max-w-xl text-lg leading-relaxed">
            TaskFlow es un administrador de tareas diario pensado para mantener
            tu foco y ritmo. Planifica, prioriza y consigue más con
            recordatorios inteligentes, modo lista rápida y estadísticas
            simples.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              className="btn btn-primary btn-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 gap-2"
              href="/app"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Abrir App
            </a>
            <a
              className="btn btn-outline btn-lg shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
              href="#features"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Ver características
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="card-body p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl shadow-inner">
                    <FiCalendar size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-base-content">
                      Planificación diaria
                    </div>
                    <div className="text-sm text-base-content/60">
                      Rutinas y bloques de tiempo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="card-body p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 text-success rounded-xl shadow-inner">
                    <FiThumbsUp size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-base-content">
                      Fácil de usar
                    </div>
                    <div className="text-sm text-base-content/60">
                      Interfaz limpia y accesible
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative" ref={rightRef}>
          <div className="card bg-base-100 shadow-2xl hover:shadow-primary/20 transition-all duration-500 border border-base-300">
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="badge badge-primary badge-lg shadow-md">
                    Hoy
                  </div>
                </div>
                <div className="stats shadow-inner bg-base-200">
                  <div className="stat py-2 px-4">
                    <div className="stat-value text-primary text-2xl">3</div>
                    <div className="stat-desc">completadas</div>
                  </div>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="card-body p-4 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="checkbox checkbox-sm" />
                      <div>
                        <div className="font-semibold text-base-content">
                          Revisar emails
                        </div>
                        <div className="text-xs text-base-content/60 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          09:00 • 10 min
                        </div>
                      </div>
                    </div>
                    <div className="badge badge-ghost badge-sm">Baja</div>
                  </div>
                </li>

                <li className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/30">
                  <div className="card-body p-4 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <div>
                        <div className="font-semibold text-base-content">
                          Reunión con equipo
                        </div>
                        <div className="text-xs text-base-content/70 flex items-center gap-2 font-medium">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          11:00 • 30 min
                        </div>
                      </div>
                    </div>
                    <div className="badge badge-error badge-sm shadow-md">
                      Alta
                    </div>
                  </div>
                </li>

                <li className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="card-body p-4 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="checkbox checkbox-sm" />
                      <div>
                        <div className="font-semibold text-base-content">
                          Terminar documento
                        </div>
                        <div className="text-xs text-base-content/60 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          15:00 • 1 h
                        </div>
                      </div>
                    </div>
                    <div className="badge badge-warning badge-sm">Media</div>
                  </div>
                </li>
              </ul>

              <div className="divider"></div>

              <div className="alert shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-info shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-xs">
                  Usa la app para marcar tareas, programar recordatorios y ver
                  tu progreso.
                </span>
              </div>
            </div>
          </div>

          <div
            ref={accentRef}
            className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 blur-2xl pointer-events-none"
          />
          <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-accent to-secondary opacity-15 blur-xl pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
