"use server";

import { Tasks } from "@prisma/client";
import { getTasks } from "../actions/taskActions";
import TasksUI from "@/src/components/tasks/TasksUI";
import { headers } from "next/headers";
import { auth } from "../lib/auth";
import Footer from "../components/home/Footer";
import CTA from "../components/home/CTA";
import Features from "../components/home/Features";
import Hero from "../components/home/Hero";
import TaskTotalTime from "../components/tasks/TaskTotalTime";
import MarqueeTicker from "../components/MarqueeTicker";

export default async function TaskManager() {
  const tasks = await getTasks();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="task-manager min-h-screen bg-base-200">
      {session?.user.role === "ADMIN" ? (
        <div className="flex gap-2 items-center p-1">
          <div className="skeleton h-10 w-20"></div>
          <div className="skeleton h-10 w-10 rounded-full"></div>
        </div>
      ) : session?.user ? (
        <div className="flex flex-col h-screen">
          {/* Marquee Ticker - Top Bar */}
          <div className="w-full">
            <MarqueeTicker
              texts={[
                "El éxito es la suma de pequeños esfuerzos repetidos día tras día.😉",
                "No dejes para mañana lo que puedes hacer hoy.🚀",
                "Lo que no haces hoy, te persigue mañana.😲",
                "Disciplina o arrepentimiento: elige.🤷",
                "O avanzas o te quedas atrás. No hay pausa.🌟",
                "Domínate o sé dominado.🐍",
                "Gobierna tu mente o ella te gobernará. 🤯",
              ]}
            />
          </div>

          {/* Drawer para mobile + Sidebar permanente en desktop */}
          <div className="drawer lg:drawer-open flex-1">
            <input id="time-drawer" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col">
              {/* Main Content - TasksUI */}
              <main className="flex-1 overflow-y-auto bg-base-200">
                <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-6xl">
                  <div className="card bg-base-100 shadow-xl border border-base-300 p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-base-300">
                      <span className="text-2xl lg:text-3xl">📋</span>
                      <h1 className="text-xl sm:text-2xl font-bold text-base-content">
                        Mis Tareas
                      </h1>
                    </div>
                    <TasksUI data={(tasks as Tasks[]) || []} />
                  </div>
                </div>
              </main>
            </div>

            {/* Sidebar con Tiempo - Oculto por default en mobile, permanente en lg+ */}
            <div className="drawer-side">
              <label
                htmlFor="time-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <aside className="w-80 bg-base-100 min-h-full border-r border-base-300">
                <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-base-300">
                    <span className="text-2xl lg:text-3xl">⏱️</span>
                    <h2 className="text-lg lg:text-xl font-bold text-base-content">
                      Tiempo
                    </h2>
                  </div>

                  {/* TaskTotalTime Component */}
                  <TaskTotalTime />
                </div>
              </aside>
            </div>
          </div>

          {/* Botón flotante en mobile para abrir el drawer (opcional, pero recomendado) */}
          <label
            htmlFor="time-drawer"
            className="btn btn-primary btn-circle fixed bottom-6 right-6 z-50 lg:hidden shadow-lg"
          >
            ⏱️
          </label>
        </div>
      ) : (
        <>
          <main className="space-y-28">
            <Hero />
            <section className="container mx-auto px-4">
              <Features />
            </section>
            <section className="container mx-auto px-4">
              <CTA />
            </section>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
