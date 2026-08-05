"use server";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUserId } from "@/src/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Monthly Goal (legacy, keeps one goal per month) ──────────────

export interface MonthlyGoalData {
  id: string;
  title: string;
  completed: boolean;
  month: string;
}

export async function getMonthlyGoal(): Promise<MonthlyGoalData | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const month = currentMonth();
  const goal = await prisma.goal.findFirst({
    where: { userId, month },
  });

  if (!goal) return null;
  return { id: goal.id, title: goal.title, completed: goal.completed, month: goal.month! };
}

export async function setMonthlyGoal(title: string): Promise<MonthlyGoalData> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const month = currentMonth();
  const existing = await prisma.goal.findFirst({
    where: { userId, month },
  });

  let goal;
  if (existing) {
    goal = await prisma.goal.update({
      where: { id: existing.id },
      data: { title: title.trim() },
    });
  } else {
    goal = await prisma.goal.create({
      data: { userId, title: title.trim(), month },
    });
  }

  revalidatePath("/");
  return { id: goal.id, title: goal.title, completed: goal.completed, month: goal.month! };
}

export async function toggleMonthlyGoal(): Promise<MonthlyGoalData> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const month = currentMonth();
  const current = await prisma.goal.findFirst({
    where: { userId, month },
  });

  if (!current) throw new Error("No hay objetivo este mes");

  const goal = await prisma.goal.update({
    where: { id: current.id, userId },
    data: { completed: !current.completed },
  });

  revalidatePath("/");
  return { id: goal.id, title: goal.title, completed: goal.completed, month: goal.month! };
}

// ─── Hyde-slayer Goals CRUD ───────────────────────────────────────

export interface GoalResponse {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  month: string | null;
  purpose: string | null;
  visualization: string | null;
  hydeAnswers: Record<string, string> | null;
  missions: string[] | null;
  timeline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string | null;
  purpose?: string | null;
  visualization?: string | null;
  hydeAnswers?: Record<string, string> | null;
  missions?: string[] | null;
  timeline?: string | null;
}

export interface UpdateGoalInput {
  id: string;
  title?: string;
  description?: string | null;
  completed?: boolean;
  purpose?: string | null;
  visualization?: string | null;
  hydeAnswers?: Record<string, string> | null;
  missions?: string[] | null;
  timeline?: string | null;
}

function toResponse(goal: {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  month: string | null;
  purpose: string | null;
  visualization: string | null;
  hydeAnswers: unknown;
  missions: unknown;
  timeline: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): GoalResponse {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    completed: goal.completed,
    month: goal.month,
    purpose: goal.purpose,
    visualization: goal.visualization,
    hydeAnswers: goal.hydeAnswers as Record<string, string> | null,
    missions: goal.missions as string[] | null,
    timeline: goal.timeline?.toISOString() ?? null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

export async function getAllGoals(): Promise<GoalResponse[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const goals = await prisma.goal.findMany({
    where: { userId, month: null },
    orderBy: { createdAt: "desc" },
  });

  return goals.map(toResponse);
}

export async function createGoal(input: CreateGoalInput): Promise<GoalResponse> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: input.title.trim(),
      description: input.description ?? null,
      purpose: input.purpose ?? null,
      visualization: input.visualization ?? null,
      hydeAnswers: input.hydeAnswers ?? undefined,
      missions: input.missions ?? undefined,
      timeline: input.timeline ? new Date(input.timeline) : null,
    },
  });

  revalidatePath("/hyde-slayer");
  return toResponse(goal);
}

export async function updateGoal(input: UpdateGoalInput): Promise<GoalResponse> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const existing = await prisma.goal.findFirst({
    where: { id: input.id, userId },
  });
  if (!existing) throw new Error("Objetivo no encontrado");

  const data: Prisma.GoalUpdateInput = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.description !== undefined) data.description = input.description;
  if (input.completed !== undefined) data.completed = input.completed;
  if (input.purpose !== undefined) data.purpose = input.purpose;
  if (input.visualization !== undefined) data.visualization = input.visualization;
  if (input.hydeAnswers !== undefined) data.hydeAnswers = input.hydeAnswers as Prisma.InputJsonValue;
  if (input.missions !== undefined) data.missions = input.missions as Prisma.InputJsonValue;
  if (input.timeline !== undefined) data.timeline = input.timeline ? new Date(input.timeline) : null;

  const updated = await prisma.goal.update({
    where: { id: input.id, userId },
    data,
  });

  revalidatePath("/hyde-slayer");
  return toResponse(updated);
}

export async function deleteGoal(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const deleted = await prisma.goal.deleteMany({
    where: { id, userId },
  });
  if (deleted.count === 0) throw new Error("Objetivo no encontrado");
  revalidatePath("/hyde-slayer");
}

export async function toggleGoalCompleted(id: string): Promise<GoalResponse> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const existing = await prisma.goal.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Objetivo no encontrado");

  const updated = await prisma.goal.update({
    where: { id, userId },
    data: { completed: !existing.completed },
  });

  revalidatePath("/hyde-slayer");
  return toResponse(updated);
}
