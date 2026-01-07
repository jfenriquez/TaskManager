"use server";

import { prisma } from "@/src/lib/prisma";
/////traer session
import { auth } from "@/src/lib/auth";
import type { UserWithRole } from "@/src/types/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Tasks } from "@prisma/client";
//import { Tasks } from "@prisma/client";
import { getStartOfDay, getEndOfDay } from "@/src/utils/dateHelpers";
export interface Itask {
  task: {
    id: string;
    title?: string;
    description?: string;
    completed?: boolean;
    timerMinutes?: number | null;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    ExecutionDate?: Date | null;
  };
}

export async function getUserFromSession(): Promise<UserWithRole | null> {
  // obtener sesión desde Better Auth en server
  const session = await auth.api.getSession({
    headers: await headers(), // importantísimo: pasar headers()
    ///cookies: await cookies(), // importantísimo: pasar cookies()
  });
  // Devuelve el usuario tipado o null
  return (session?.user as UserWithRole) ?? null;
}

export async function getUserIdFromSession(): Promise<string | null> {
  try {
    // obtener sesión desde Better Auth en server
    const session = await auth.api.getSession({
      headers: await headers(), // importantísimo: pasar headers()
      ///cookies: await cookies(), // importantísimo: pasar cookies()
    });

    const userId =
      session?.user?.id ?? (session as unknown as { userId?: string })?.userId;

    return userId || null;
  } catch (error) {
    console.error("Error al obtener userId de la sesión:", error);
    return null;
  }
}

//////get
export const getTasks = async () => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      throw new Error("No autenticado: no hay userId en la sesión");
    }
    const res = await prisma.tasks.findMany({
      where: {
        userId: userId.toString(),
      },
      orderBy: { ExecutionDate: "desc" },
      //{ priority: "desc" },
    });
    if (!res) {
      throw new Error("Task not found");
    }
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
////get tasks x day
export const getTasksXDay = async () => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      throw new Error("No autenticado");
    }

    // Obtener TODAS las tareas del usuario
    const allTasks = await prisma.tasks.findMany({
      where: {
        userId: userId.toString(),
      },
      orderBy: [
        { ExecutionDate: "asc" },
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    // Obtener timezone del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      select: { timezone: true },
    });

    const userTimezone = user?.timezone || "UTC";
    console.log("🌍 Zona horaria del usuario:", userTimezone);
    // Fecha de hoy en la zona del usuario
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: userTimezone,
    });

    console.log("🔍 Filtrando tareas para:", today);

    // Filtrar en JavaScript
    const tasksToday = allTasks.filter((task) => {
      // Incluir tareas sin fecha
      if (!task.ExecutionDate) return true;

      // Convertir ExecutionDate a string de fecha en la zona del usuario
      const taskDate = task.ExecutionDate.toLocaleDateString("en-CA", {
        timeZone: userTimezone,
      });

      return taskDate === today;
    });

    console.log("✅ Tareas encontradas:", tasksToday.length);
    console.log(
      "📋 Tareas:",
      tasksToday.map((t) => ({
        title: t.title,
        date: t.ExecutionDate?.toISOString(),
      }))
    );

    return tasksToday;
  } catch (error) {
    console.error("❌ Error en getTasksXDay:", error);
    throw error;
  }
};

/////importTask
export async function importTasks(tasks: Partial<Tasks>[]) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("No autenticado: no hay userId en la sesión");
  }
  try {
    // Crear múltiples tareas en una transacción
    const createdTasks = await prisma.$transaction(
      tasks.map((task) =>
        prisma.tasks.create({
          data: {
            title: task.title || "Sin título",
            description: task.description || null,
            completed: task.completed || false,
            priority: task.priority || "MEDIUM",
            timerMinutes: task.timerMinutes || null,
            ExecutionDate: task.ExecutionDate || null,
            userId: userId, // Ajusta según tu modelo
          },
        })
      )
    );
    revalidatePath("/TasksTable"); // ajusta la ruta según tu app
    return { success: true, count: createdTasks.length };
  } catch (error) {
    console.error("Error al importar tareas:", error);
    throw new Error("Error al importar las tareas");
  }
}

export const getTotalTimerTasks = async () => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      throw new Error("No autenticado");
    }

    // Obtener TODAS las tareas del usuario
    const allTasks = await prisma.tasks.findMany({
      where: {
        userId: userId.toString(),
        timerMinutes: { not: null },
        completed: false,
      },
      orderBy: [
        { ExecutionDate: "asc" },
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    // Obtener timezone del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      select: { timezone: true },
    });

    const userTimezone = user?.timezone || "UTC";
    console.log("🌍 Zona horaria del usuario:", userTimezone);
    // Fecha de hoy en la zona del usuario
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: userTimezone,
    });

    console.log("🔍 Filtrando tareas para:", today);

    // Filtrar en JavaScript
    const tasksToday = allTasks.filter((task) => {
      // Incluir tareas sin fecha
      if (!task.ExecutionDate) return true;

      // Convertir ExecutionDate a string de fecha en la zona del usuario
      const taskDate = task.ExecutionDate.toLocaleDateString("en-CA", {
        timeZone: userTimezone,
      });

      return taskDate === today;
    });

    console.log("✅ Tareas encontradas:", tasksToday.length);
    console.log(
      "📋 Tiempos:",
      tasksToday.map((t) => ({
        timer: t.timerMinutes,
      }))
    );

    const total = tasksToday.reduce((sum, task) => {
      return sum + (task.timerMinutes || 0);
    }, 0);
    console.log("⏱️ Total de minutos:", total);
    return total;
  } catch (error) {
    console.error("❌ Error obteniendo total de tiempo:", error);
    return 0;
  }
};

//////////////////////create task//////////////////////

interface TaskInput {
  title: string;
  description?: string | null;
  completed?: boolean;
  timerMinutes: number | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export async function createTask(task: TaskInput) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("No autenticado: no hay userId en la sesión");
  }

  if (!task.title || task.title.trim() === "") {
    throw new Error("El título es obligatorio");
  }

  try {
    const newTask = await prisma.tasks.create({
      data: {
        userId: userId.toString(), // Reemplaza con el ID del usuario correspondiente
        title: task.title,
        description: task.description ?? null,
        completed: task.completed ?? false,

        timerMinutes: task.timerMinutes ?? null,
        priority: task.priority,
      },
    });

    // ✅ Revalida la página raíz (si la usas en SSR)
    revalidatePath("/");

    return newTask;
  } catch (error) {
    console.error("Error creando la tarea:", error);
    throw new Error("No se pudo crear la tarea");
  }
}

export const updateTask = async ({ task }: Itask) => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("No autenticado: no hay userId en la sesión");
  }
  try {
    const res = await prisma.tasks.findFirst({
      where: { id: task.id },
    });
    if (!res) {
      throw new Error("Task not found");
    }

    const updateTask = await prisma.tasks.update({
      data: task,
      where: { id: task.id, userId: userId.toString() },
    });
    revalidatePath("/");

    return updateTask;
  } catch (error) {
    return error;
  }
};

/////////////////////changes complete status/////////////////////
export const updateStatusTask = async (id: string, completed: boolean) => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("No autenticado: no hay userId en la sesión");
  }

  try {
    const res = await prisma.tasks.findFirst({
      where: { id: id, userId: userId.toString() },
    });
    if (!res) {
      throw new Error("Task not found");
    }

    const updateTask = await prisma.tasks.update({
      data: { completed: completed },
      where: { id: id },
    });
    revalidatePath("/");

    return updateTask;
  } catch (error) {
    return error;
  }
};

/////////////////////delete x id/////////////////////
export const deleteTaskXid = async (id: string) => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("No autenticado: no hay userId en la sesión");
  }

  try {
    const res = await prisma.tasks.findFirst({
      where: { id: id, userId: userId.toString() },
    });
    if (!res) {
      throw new Error("Task not found");
    }

    const deleteTask = await prisma.tasks.delete({
      where: { id: id },
    });
    revalidatePath("/");
    return deleteTask;
  } catch (error) {
    return error;
  }
};

/////DELETE TASK COMPLETE
export const deleteTasksCompleted = async () => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("No autenticado: no hay userId en la sesión");
  }
  try {
    const res = await prisma.tasks.findMany({
      where: { completed: true, userId: userId.toString() },
    });
    if (!res) {
      throw new Error("Tasks complete not found");
    }

    const deleteTask = await prisma.tasks.deleteMany({
      where: { completed: true },
    });
    revalidatePath("/");
    return deleteTask;
  } catch (error) {
    return error;
  }
};

/* -------------------- Timer server actions -------------------- */

/**
 * Inicia (o reanuda) el temporizador de una tarea. Lógica:
 * - Si la tarea está pausada (timerRemainingSeconds != null), usa esos segundos.
 * - Si no hay remaining y se pasa `minutes`, usa minutes; si no, usa task.timerMinutes.
 * - Calcula timerEndsAt = now + seconds, set timerRunning = true.
 */
export async function startTaskTimer(taskId: string, minutes?: number) {
  const task = await prisma.tasks.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  // determinar segundos a usar
  const secondsFromRemaining = task.timerRemainingSeconds ?? null;
  const secondsFromMinutes = minutes
    ? Math.floor(minutes * 60)
    : task.timerMinutes
    ? Math.floor(task.timerMinutes * 60)
    : null;

  const secondsToUse = secondsFromRemaining ?? secondsFromMinutes;
  if (!secondsToUse || secondsToUse <= 0) {
    throw new Error(
      "No timer duration provided (pass minutes or set timerMinutes on the task)."
    );
  }

  const now = new Date();
  const endsAt = new Date(Date.now() + secondsToUse * 1000);

  const updated = await prisma.tasks.update({
    where: { id: taskId },
    data: {
      timerStartedAt: now,
      timerEndsAt: endsAt,
      timerRemainingSeconds: null,
      timerRunning: true,
      // keep timerMinutes as config if you want
    },
  });

  // revalidatePath("/tasks");
  return updated;
}

/**
 * Pausa el temporizador: calcula segundos restantes y guarda en timerRemainingSeconds,
 * limpia timerEndsAt y set timerRunning = false.
 */
export async function pauseTaskTimer(taskId: string) {
  const task = await prisma.tasks.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  if (!task.timerRunning || !task.timerEndsAt) {
    // nada que pausar
    return task;
  }

  const now = Date.now();
  const remainingSec = Math.max(
    0,
    Math.ceil((task.timerEndsAt.getTime() - now) / 1000)
  );

  const updated = await prisma.tasks.update({
    where: { id: taskId },
    data: {
      timerRunning: false,
      timerRemainingSeconds: remainingSec,
      timerEndsAt: null,

      // timerStartedAt stays (puede ser útil históricamente) o lo limpiamos si prefieres:
      // timerStartedAt: null,
    },
  });

  // revalidatePath("/tasks");
  return updated;
}

/**
 * Detiene y limpia el temporizador (stop): borra timerStartedAt, timerEndsAt, timerRemainingSeconds y set running false.
 */
export async function stopTaskTimer(taskId: string) {
  const updated = await prisma.tasks.update({
    where: { id: taskId },
    data: {
      timerRunning: false,
      timerRemainingSeconds: null,
      timerEndsAt: null,
      timerStartedAt: null,
    },
  });
  // revalidatePath("/tasks");
  return updated;
}
