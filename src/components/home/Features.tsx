/* components/Features.tsx */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiStar, FiClock, FiLayers } from "react-icons/fi";

const items = [
  {
    title: "Prioriza con facilidad",
    desc: "Marca prioridad, crea etiquetas y filtra por foco del día.",
    icon: <FiStar size={20} />,
  },
  {
    title: "Bloques de tiempo",
    desc: "Organiza tu jornada con bloques y temporizadores integrados.",
    icon: <FiClock size={20} />,
  },
  {
    title: "Sincroniza en todos lados",
    desc: "Accede a tus tareas desde móvil, web y extensiones.",
    icon: <FiLayers size={20} />,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold">
          Todo lo que necesitas para tu día
        </h2>
        <p className="mt-3 text-slate-400">
          Funciones pensadas para facilitar tu flujo de trabajo y mejorar tu
          concentración.
        </p>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {items.map((it, idx) => (
          <motion.article
            key={it.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.12 }}
            viewport={{ once: true }}
            className="p-6 rounded-xl bg-slate-800/40"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-700 rounded-lg">{it.icon}</div>
              <div>
                <h3 className="font-semibold">{it.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{it.desc}</p>
              </div>
            </div>

            <div className="mt-6">
              <button className="text-sm px-4 py-2 rounded-md border border-slate-700">
                Probar ahora
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
