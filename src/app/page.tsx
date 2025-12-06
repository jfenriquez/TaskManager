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

export default async function TaskManager() {
  const tasks = await getTasks();
  // obtener sesión desde Better Auth en server
  const session = await auth.api.getSession({
    headers: await headers(), // importantísimo: pasar headers()
    ///cookies: await cookies(), // importantísimo: pasar cookies()
  });
  console.log("session en page.tsx:", session);
  console.log("tasks from getTasks():", tasks);
  if (Array.isArray(tasks)) {
    console.log(
      "tasks completados:",
      tasks.map((t) => ({ id: t.id, title: t.title, completed: t.completed }))
    );
  }

  return (
    <div className="task-manager">
      {/* UI components and JSX go here */}
      {session?.user.role === "ADMIN" ? (
        <div className="flex gap-2 items-center">
          <div className="skeleton h-10 w-20"></div>
          <div className="skeleton h-10 w-10 rounded-full"></div>
        </div>
      ) : session?.user ? (
        <>
          <TasksUI data={(tasks as Tasks[]) || []} />
        </>
      ) : (
        // User is not logged in TODO:AÑADIR BLOQUES DE TIEMPO COMO UN POMODORO
        <>
          <main className="space-y-28">
            <Hero />

            <section className="container mx-auto">
              <Features />
            </section>
            <section className="container mx-auto">
              <CTA />
            </section>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
