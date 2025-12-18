/* components/Features.tsx */
"use client";

import { motion } from "framer-motion";
import { FiStar, FiClock, FiLayers } from "react-icons/fi";

const items = [
  {
    title: "Prioriza con facilidad",
    desc: "Marca prioridad, crea etiquetas y filtra por foco del día.",
    icon: <FiStar size={24} />,
    color: "primary",
    gradient: "from-primary/20 to-secondary/10",
  },
  {
    title: "Bloques de tiempo",
    desc: "Organiza tu jornada con bloques y temporizadores integrados.",
    icon: <FiClock size={24} />,
    color: "secondary",
    gradient: "from-secondary/20 to-accent/10",
  },
  {
    title: "Sincroniza en todos lados",
    desc: "Accede a tus tareas desde móvil, web y extensiones.",
    icon: <FiLayers size={24} />,
    color: "accent",
    gradient: "from-accent/20 to-primary/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-base-200/50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="badge badge-primary badge-lg mb-4 shadow-md">
            ✨ Características
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-base-content">
            Todo lo que necesitas para tu día
          </h2>
          <p className="mt-4 text-lg text-base-content/70 leading-relaxed">
            Funciones pensadas para facilitar tu flujo de trabajo y mejorar tu
            concentración.
          </p>
          <div className="divider divider-primary mt-8"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {items.map((it, idx) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group"
            >
              <div
                className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-500 border border-base-300 hover:border-${it.color} hover:-translate-y-2`}
              >
                <div className="card-body p-8">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div
                      className={`avatar placeholder transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <div
                        className={`bg-gradient-to-br ${it.gradient} text-${it.color} rounded-2xl w-20 h-20 shadow-lg ring-4 ring-${it.color}/10`}
                      >
                        <div className="flex items-center justify-center w-full h-full">
                          {it.icon}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <h3 className="card-title text-xl justify-center text-base-content group-hover:text-primary transition-colors">
                        {it.title}
                      </h3>
                      <p className="text-base-content/70 leading-relaxed">
                        {it.desc}
                      </p>
                    </div>

                    <div className="card-actions justify-center w-full mt-4">
                      <button
                        className={`btn btn-${it.color} btn-outline btn-sm shadow-md hover:shadow-lg transition-all duration-300 gap-2 w-full`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        Probar ahora
                      </button>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div
                      className={`badge badge-${it.color} badge-sm shadow-md`}
                    >
                      Nuevo
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="stats stats-vertical lg:stats-horizontal shadow-xl bg-base-100 border border-base-300">
            <div className="stat place-items-center">
              <div className="stat-title">Usuarios activos</div>
              <div className="stat-value text-primary">25K+</div>
              <div className="stat-desc">↗︎ 12% este mes</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Tareas completadas</div>
              <div className="stat-value text-secondary">2.4M</div>
              <div className="stat-desc">↗︎ 8% este mes</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Satisfacción</div>
              <div className="stat-value">98%</div>
              <div className="stat-desc text-success">★★★★★ Excelente</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
