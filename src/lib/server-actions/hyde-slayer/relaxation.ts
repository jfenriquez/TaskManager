"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createRelaxationExerciseSchema,
  updateRelaxationExerciseSchema,
  completeRelaxationLogSchema,
} from "@/src/lib/validations/hyde-slayer";
import {
  requirePlayerProfile,
  requireAdmin,
  ok,
  handleActionError,
  awardXp,
  awardDiscipline,
  type ActionResult,
} from "./utils";

export async function getExercises(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      description: string | null;
      duration: number;
      type: string;
    }>
  >
> {
  try {
    const exercises = await prisma.relaxationExercise.findMany({
      orderBy: { createdAt: "asc" },
    });
    return ok(exercises);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function createExercise(input: unknown): Promise<
  ActionResult<{ id: string; name: string }>
> {
  try {
    await requireAdmin();
    const data = createRelaxationExerciseSchema.parse(input);
    const exercise = await prisma.relaxationExercise.create({ data });
    revalidatePath("/hyde-slayer");
    return ok({ id: exercise.id, name: exercise.name });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updateExercise(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = updateRelaxationExerciseSchema.parse(input);
    await prisma.relaxationExercise.update({ where: { id: data.id }, data });
    revalidatePath("/hyde-slayer");
    return ok({ id: data.id });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function completeExercise(input: unknown): Promise<
  ActionResult<{
    id: string;
    xpEarned: number;
    disciplineEarned: number;
    exerciseName: string;
  }>
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = completeRelaxationLogSchema.parse(input);

    const exercise = await prisma.relaxationExercise.findUnique({
      where: { id: data.exerciseId },
    });
    if (!exercise) return { success: false, error: "Ejercicio no encontrado" };

    await prisma.relaxationLog.create({
      data: {
        playerId,
        exerciseId: data.exerciseId,
        duration: data.duration,
      },
    });

    const XP_REWARD = Math.floor(data.duration / 30) * 5 + 5;
    const DISCIPLINE_REWARD = Math.floor(data.duration / 60) + 1;

    await awardXp(playerId, XP_REWARD, "relaxation", exercise.name);
    await awardDiscipline(playerId, DISCIPLINE_REWARD);

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    await prisma.dailyLog.upsert({
      where: { playerId_date: { playerId, date: todayStart } },
      create: { playerId, date: todayStart, xpEarned: XP_REWARD },
      update: { xpEarned: { increment: XP_REWARD } },
    });

    revalidatePath("/hyde-slayer");
    return ok({
      id: data.exerciseId,
      xpEarned: XP_REWARD,
      disciplineEarned: DISCIPLINE_REWARD,
      exerciseName: exercise.name,
    });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getExerciseLogs(limit = 20): Promise<
  ActionResult<
    Array<{
      id: string;
      exerciseId: string;
      duration: number;
      completedAt: Date;
      exercise: { name: string; type: string };
    }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const logs = await prisma.relaxationLog.findMany({
      where: { playerId },
      orderBy: { completedAt: "desc" },
      take: limit,
      include: { exercise: { select: { name: true, type: true } } },
    });
    return ok(logs);
  } catch (err) {
    return handleActionError(err);
  }
}
