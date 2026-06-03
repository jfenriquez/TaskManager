"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export interface MonthlyGoalData {
  id: string;
  title: string;
  completed: boolean;
  month: string;
}

export async function getMonthlyGoal(): Promise<MonthlyGoalData | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const month = currentMonth();
  const goal = await prisma.goal.findUnique({
    where: { userId_month: { userId, month } },
  });

  if (!goal) return null;
  return { id: goal.id, title: goal.title, completed: goal.completed, month: goal.month };
}

export async function setMonthlyGoal(title: string): Promise<MonthlyGoalData> {
  const userId = await getUserId();
  if (!userId) throw new Error("No autenticado");

  const month = currentMonth();
  const goal = await prisma.goal.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, title: title.trim(), month },
    update: { title: title.trim() },
  });

  revalidatePath("/");
  return { id: goal.id, title: goal.title, completed: goal.completed, month: goal.month };
}

export async function toggleMonthlyGoal(): Promise<MonthlyGoalData> {
  const userId = await getUserId();
  if (!userId) throw new Error("No autenticado");

  const month = currentMonth();
  const current = await prisma.goal.findUnique({
    where: { userId_month: { userId, month } },
  });

  if (!current) throw new Error("No hay objetivo este mes");

  const goal = await prisma.goal.update({
    where: { id: current.id },
    data: { completed: !current.completed },
  });

  revalidatePath("/");
  return { id: goal.id, title: goal.title, completed: goal.completed, month: goal.month };
}
