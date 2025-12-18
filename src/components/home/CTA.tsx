/* components/CTA.tsx */
"use client";
import React from "react";
import { motion } from "framer-motion";

const benefits = [
  { icon: "✓", text: "Acceso inmediato", color: "success" },
  { icon: "⏱️", text: "Configuración en 2 min", color: "info" },
  { icon: "✓", text: "Cancela cuando quieras", color: "warning" },
];

const stats = [
  { value: "10K+", label: "Usuarios activos", color: "primary" },
  { value: "50K+", label: "Tareas completadas", color: "secondary" },
  { value: "4.9⭐", label: "Calificación", color: "accent" },
];

export default function CTA() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="card bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 shadow-2xl border-2 border-primary/20 overflow-hidden relative hover:shadow-primary/30 transition-all duration-500">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse"></div>
            <div
              className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>

            {/* Grid Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            ></div>

            <div className="card-body relative z-10 p-8 md:p-16">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                  className="flex justify-center"
                >
                  <div className="badge badge-primary badge-lg gap-2 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-default">
                    <span className="animate-bounce">🚀</span>
                    ¡Pruébalo gratis!
                  </div>
                </motion.div>

                {/* Heading */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-5xl font-extrabold text-base-content leading-tight"
                >
                  Empieza a organizar tus días{" "}
                  <span className="text-primary drop-shadow-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    hoy mismo
                  </span>
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-base-content/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                >
                  Prueba TaskFlow gratis. Sin tarjeta de crédito. Sin
                  compromisos.
                </motion.p>

                {/* Benefits Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                  className="flex flex-wrap justify-center gap-4 py-4"
                >
                  {benefits.map((benefit, idx) => (
                    <motion.div
                      key={benefit.text}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.6 + idx * 0.1, type: "spring" }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-2 bg-base-100 px-5 py-3 rounded-full shadow-lg border-2 border-${benefit.color}/20 hover:border-${benefit.color} hover:shadow-xl transition-all duration-300 cursor-default`}
                    >
                      <span
                        className={`text-${benefit.color} text-xl font-bold`}
                      >
                        {benefit.icon}
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {benefit.text}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row justify-center gap-4 pt-6"
                >
                  <a
                    href="/register"
                    className="btn btn-primary btn-lg gap-2 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                  >
                    <span className="group-hover:animate-bounce">🚀</span>
                    Crear cuenta gratis
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 group-hover:translate-x-1 transition-transform"
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
                  </a>
                  <a
                    href="/login"
                    className="btn btn-outline btn-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group gap-2"
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
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Ya tengo cuenta
                  </a>
                </motion.div>

                {/* Social Proof Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  viewport={{ once: true }}
                  className="pt-8"
                >
                  <div className="divider">
                    <span className="text-xs text-base-content/50 font-medium uppercase tracking-wider">
                      Únete a miles de usuarios organizados
                    </span>
                  </div>

                  <div className="flex justify-center items-center gap-6 flex-wrap mt-6">
                    {stats.map((stat, idx) => (
                      <motion.div
                        key={stat.label}
                        initial={{ scale: 0, rotate: -10 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.9 + idx * 0.1, type: "spring" }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        className="stat bg-base-100/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-base-300 hover:border-primary hover:shadow-xl transition-all duration-300"
                      >
                        <div
                          className={`stat-value text-${stat.color} text-3xl font-bold`}
                        >
                          {stat.value}
                        </div>
                        <div className="stat-desc text-xs font-medium mt-1">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  viewport={{ once: true }}
                  className="flex justify-center items-center gap-6 pt-6 flex-wrap"
                >
                  <div className="flex items-center gap-2 text-base-content/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-xs font-medium">SSL Seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-base-content/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-info"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-xs font-medium">
                      Datos protegidos
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-base-content/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-warning"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span className="text-xs font-medium">
                      Garantía de satisfacción
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
