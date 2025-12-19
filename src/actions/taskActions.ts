"use server";

import { prisma } from "@/src/lib/prisma";
/////traer session
import { auth } from "@/src/lib/auth";
import type { UserWithRole } from "@/src/types/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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

async function getUserIdFromSession(): Promise<string | null> {
  // obtener sesión desde Better Auth en server
  const session = await auth.api.getSession({
    headers: await headers(), // importantísimo: pasar headers()
    ///cookies: await cookies(), // importantísimo: pasar cookies()
  });

  const userId =
    session?.user?.id ?? (session as unknown as { userId?: string })?.userId;
  return userId || null;
}

//////get
export const getTasks = async () => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      throw new Error("No autenticado: no hay userId en la sesión");
    }

    const res = await prisma.tasks.findMany({
      where: { userId: userId.toString() },
      orderBy: { priority: "desc" },
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

// getTotalTimerTasks
export const getTotalTimerTasks = async () => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) throw new Error("No autenticado");

    const tasks = await prisma.tasks.findMany({
      where: { userId: userId.toString(), completed: false },
      select: { timerMinutes: true }, // solo traemos lo necesario
    });

    if (!tasks) return 0;

    const total = tasks.reduce(
      (acc, task) => acc + (task.timerMinutes ?? 0),
      0
    );

    return total;
  } catch (error) {
    console.error(error);
    throw new Error("Error obteniendo total de tiempo");
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
