/* components/CTA.tsx */
"use client";
import React from "react";

export default function CTA() {
  return (
    <section className="py-12 rounded-xl bg-gradient-to-r from-slate-900/40 to-slate-800/20 p-8">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-2xl font-bold">Empieza a organizar tus días hoy</h3>
        <p className="text-slate-400 mt-2">
          Prueba TaskFlow gratis. Sin tarjeta.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a
            href="/login"
            className="px-6 py-3 rounded-md bg-primary text-white"
          >
            Crear cuenta
          </a>
        </div>
      </div>
    </section>
  );
}
