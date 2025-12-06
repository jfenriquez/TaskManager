/* components/Footer.tsx */
"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800">
      <div className="container mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          © {new Date().getFullYear()} TaskFlow. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <a href="/terms" className="hover:underline">
            Términos
          </a>
          <a href="/privacy" className="hover:underline">
            Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}
