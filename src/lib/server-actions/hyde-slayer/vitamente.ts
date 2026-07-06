"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createVitamenteSchema,
  updateVitamenteSchema,
  completeVitamenteSchema,
} from "@/src/lib/validations/hyde-slayer";
import {
  requirePlayerProfile,
  ok,
  fail,
  handleActionError,
  awardXp,
  type ActionResult,
} from "./utils";

export async function getVitamentes(): Promise<
  ActionResult<
    Array<{
      id: string;
      title: string;
      content: string;
      category: string | null;
      isActive: boolean;
    }>
  >
> {
  try {
    const vitamentes = await prisma.vitamente.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return ok(vitamentes);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function createVitamente(input: unknown): Promise<
  ActionResult<{ id: string; title: string; content: string }>
> {
  try {
    const data = createVitamenteSchema.parse(input);
    const vitamente = await prisma.vitamente.create({ data });
    revalidatePath("/hyde-slayer");
    return ok({ id: vitamente.id, title: vitamente.title, content: vitamente.content });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updateVitamente(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const data = updateVitamenteSchema.parse(input);
    await prisma.vitamente.update({ where: { id: data.id }, data });
    revalidatePath("/hyde-slayer");
    return ok({ id: data.id });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function completeVitamente(input: unknown): Promise<
  ActionResult<{
    id: string;
    xpEarned: number;
    vitamenteTitle: string;
  }>
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = completeVitamenteSchema.parse(input);

    const exists = await prisma.vitamenteLog.findFirst({
      where: {
        playerId,
        vitamenteId: data.vitamenteId,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    if (exists) return fail("Ya completaste esta vitamente hoy");

    const vitamente = await prisma.vitamente.findUnique({
      where: { id: data.vitamenteId },
    });
    if (!vitamente) return fail("Vitamente no encontrada");

    await prisma.vitamenteLog.create({
      data: { playerId, vitamenteId: data.vitamenteId },
    });

    const XP_REWARD = 10;
    await awardXp(playerId, XP_REWARD, "vitamente", vitamente.title);

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    await prisma.dailyLog.upsert({
      where: { playerId_date: { playerId, date: todayStart } },
      create: { playerId, date: todayStart, xpEarned: XP_REWARD },
      update: { xpEarned: { increment: XP_REWARD } },
    });

    revalidatePath("/hyde-slayer");
    return ok({ id: data.vitamenteId, xpEarned: XP_REWARD, vitamenteTitle: vitamente.title });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getTodayVitamentesLog(): Promise<
  ActionResult<Array<{ vitamenteId: string; completedAt: Date }>>
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const logs = await prisma.vitamenteLog.findMany({
      where: {
        playerId,
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      select: { vitamenteId: true, completedAt: true },
    });
    return ok(logs);
  } catch (err) {
    return handleActionError(err);
  }
}
