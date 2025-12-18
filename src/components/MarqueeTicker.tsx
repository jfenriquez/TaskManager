"use client";
// MarqueeTicker.tsx
// Componente React (TypeScript) para una "tirilla"/marquee que se mueve y muestra textos.
// Mejoras y correcciones realizadas:
//  - Medición precisa usando ResizeObserver (recalcula al cambiar tamaño o contenido).
//  - Distancia de animación correcta: animamos una copia del bloque completo (no -50% fijo).
//  - Duplicación dinámica para cubrir el ancho del contenedor y asegurar continuidad.
//  - Cálculo de duración basado en velocidad (px/s) y distancia real a recorrer.
//  - Compatibilidad con SSR: evita el acceso a window durante la renderización en servidor.
//  - Pausa al hover (playState) y control via prop `pauseOnHover`.
//  - Evita animaciones si no hay suficiente contenido.

import React, { useEffect, useRef, useState } from "react";

type Props = {
  texts: string[];
  speed?: number; // px por segundo
  pauseOnHover?: boolean;
  gap?: number; // px entre items
  className?: string;
};

export default function MarqueeTicker({
  texts,
  speed = 100,
  pauseOnHover = true,
  gap = 40,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  // Construye un array con los textos (filtrados)
  const items = texts.map((t) => String(t));

  // Repetir el bloque hasta que su ancho sea al menos igual al contenedor (para continuidad)
  const buildRepeated = (repeatTarget: number) => {
    if (items.length === 0) return [" "];
    const arr: string[] = [];
    // Concatenar suficientes veces para intentar alcanzar el target en caracteres — usaremos medición real después
    let i = 0;
    while (arr.length < repeatTarget) {
      arr.push(items[i % items.length]);
      i++;
      if (i > 2000) break; // guard rail
    }
    return arr;
  };

  const [repeats, setRepeats] = useState<string[]>(() => buildRepeated(10));

  // Observador para medir anchos en tiempo real
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const ro = new ResizeObserver(() => {
      const cw = Math.ceil(container.getBoundingClientRect().width);
      const w = Math.ceil(content.getBoundingClientRect().width);
      setContainerWidth(cw);
      setContentWidth(w);

      // Si el contenido es más pequeño que el contenedor, aumentamos las repeticiones
      if (w < cw) {
        // Estimamos cuántas copias necesitamos (al menos 2)
        const factor = Math.ceil((cw * 1.5) / Math.max(1, w));
        const newArr = buildRepeated(
          Math.max(items.length * factor, items.length * 2)
        );
        setRepeats(newArr);
        // dejar que se actualicen tamaños; la siguiente invocación de ResizeObserver recalculará
        return;
      }

      // la distancia a recorrer es exactamente el ancho del bloque original (no de la duplicación)
      const distance = w;
      const dur = Math.max(0.1, distance / Math.max(1, speed));
      setDuration(dur);
    });

    ro.observe(container);
    ro.observe(content);

    return () => ro.disconnect();
  }, [items, speed]);

  // Si cambian los textos, actualizar las repeticiones conservadoras para retrigger
  useEffect(() => {
    setRepeats(buildRepeated(10));
  }, [texts.join("|"), gap]);

  // Handlers para hover (pausa)
  const handleMouseEnter = () => {
    if (pauseOnHover) setIsRunning(false);
  };
  const handleMouseLeave = () => {
    if (pauseOnHover) setIsRunning(true);
  };

  return (
    <div
      ref={containerRef}
      className={`marquee-container ${className}`}
      style={{ overflow: "hidden", width: "100%" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Tirilla de texto"
    >
      {/* Contenido: dos copias del mismo bloque para lograr continuidad */}
      <div
        className="marquee-inner text-primary"
        style={{
          display: "flex",
          gap: `${gap}px`,
          alignItems: "center",
          // animación sólo si duration está calculada - usar propiedades separadas
          animationName: duration ? "marquee-scroll" : undefined,
          animationDuration: duration ? `${duration}s` : undefined,
          animationTimingFunction: duration ? "linear" : undefined,
          animationIterationCount: duration ? "infinite" : undefined,
          animationPlayState: isRunning ? "running" : "paused",
          willChange: "transform",
        }}
      >
        <div
          ref={contentRef}
          className="marquee-block"
          style={{
            display: "inline-flex",
            gap: `${gap}px`,
            whiteSpace: "nowrap",
          }}
        >
          {repeats.map((t, i) => (
            <div
              key={`r1-${i}`}
              className="marquee-item"
              aria-hidden={false}
              style={{ padding: "6px 8px", fontSize: 14 }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* segunda copia para continuidad */}
        <div
          className="marquee-block"
          aria-hidden
          style={{
            display: "inline-flex",
            gap: `${gap}px`,
            whiteSpace: "nowrap",
          }}
        >
          {repeats.map((t, i) => (
            <div
              key={`r2-${i}`}
              className="marquee-item"
              aria-hidden
              style={{ padding: "6px 8px", fontSize: 14 }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* CSS in-component para keyframes: animamos la inner hacia la izquierda por el ancho del bloque original */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${contentWidth}px); }
        }
        .marquee-item { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
