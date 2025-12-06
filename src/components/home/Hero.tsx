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
    <section className="container mx-auto py-20">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div ref={leftRef}>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Organiza tus días.{" "}
            <span className="text-primary">Avanza sin esfuerzo.</span>
          </h1>
          <p className="mt-5 text-slate-300 max-w-xl">
            TaskFlow es un administrador de tareas diario pensado para mantener
            tu foco y ritmo. Planifica, prioriza y consigue más con
            recordatorios inteligentes, modo lista rápida y estadísticas
            simples.
          </p>

          <div className="mt-8 flex gap-4">
            <a
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white shadow hover:scale-105 transition"
              href="/app"
            >
              Abrir App
            </a>
            <a
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-700 text-sm"
              href="#features"
            >
              Ver características
            </a>
          </div>

          <div className="mt-8 flex gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800 rounded-lg">
                <FiCalendar size={18} />
              </div>
              <div>
                <div className="text-sm font-medium">Planificación diaria</div>
                <div className="text-xs text-slate-400">
                  Rutinas y bloques de tiempo
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800 rounded-lg">
                <FiThumbsUp size={18} />
              </div>
              <div>
                <div className="text-sm font-medium">Fácil de usar</div>
                <div className="text-xs text-slate-400">
                  Interfaz limpia y accesible
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative" ref={rightRef}>
          <div className="rounded-2xl overflow-hidden shadow-xl bg-gradient-to-b from-slate-800/60 to-slate-900 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-slate-300">Hoy</div>
              <div className="text-xs text-slate-400">3 tareas completadas</div>
            </div>

            <ul className="space-y-3">
              <li className="bg-slate-800/40 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">Revisar emails</div>
                  <div className="text-xs text-slate-400">09:00 • 10 min</div>
                </div>
                <div className="text-xs text-slate-300">Baja</div>
              </li>

              <li className="bg-gradient-to-r from-primary/20 to-indigo-900/30 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">Reunión con equipo</div>
                  <div className="text-xs text-slate-200">11:00 • 30 min</div>
                </div>
                <div className="text-xs font-semibold">Alta</div>
              </li>

              <li className="bg-slate-800/40 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">Terminar documento</div>
                  <div className="text-xs text-slate-400">15:00 • 1 h</div>
                </div>
                <div className="text-xs text-slate-300">Media</div>
              </li>
            </ul>

            <div className="mt-4 text-xs text-slate-400">
              Usa la app para marcar tareas, programar recordatorios y ver tu
              progreso.
            </div>
          </div>

          <div
            ref={accentRef}
            className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-gradient-to-br from-primary to-indigo-400 opacity-30 blur-xl pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
}
