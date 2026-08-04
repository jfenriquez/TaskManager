"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { updatePlayerProfileSchema } from "@/src/lib/validations/hyde-slayer";
import {
  requirePlayerProfile,
  requireUserId,
  ok,
  fail,
  handleActionError,
  type ActionResult,
} from "./utils";

export async function getPlayerProfile(): Promise<
  ActionResult<{
    id: string;
    level: number;
    xp: number;
    coins: number;
    discipline: number;
    playerName: string;
    streak: number;
  }>
> {
  try {
    const userId = await requireUserId();
    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
    });
    if (!profile) return fail("Perfil no encontrado");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true },
    });

    return ok({
      id: profile.id,
      level: profile.level,
      xp: profile.xp,
      coins: profile.coins,
      discipline: profile.discipline,
      playerName: profile.playerName,
      streak: user?.streak ?? 0,
    });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updatePlayerProfile(
  input: unknown,
): Promise<ActionResult<{ playerName: string }>> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = updatePlayerProfileSchema.parse(input);

    const updated = await prisma.playerProfile.update({
      where: { id: playerId },
      data,
    });

    revalidatePath("/hyde-slayer");
    return ok({ playerName: updated.playerName });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getXpHistory(
  limit = 20,
): Promise<
  ActionResult<
    Array<{ id: string; amount: number; source: string; description: string | null; createdAt: Date }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();
    // Tope superior para evitar queries pesadas con valores arbitrarios.
    const safeLimit = Math.max(1, Math.min(limit, 100));

    const logs = await prisma.xpLog.findMany({
      where: { playerId },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
    });

    return ok(logs);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getDailyLogs(
  days = 7,
): Promise<
  ActionResult<
    Array<{
      date: Date;
      tasksCompleted: number;
      xpEarned: number;
      battleCount: number;
    }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const safeDays = Math.max(1, Math.min(days, 365));
    const since = new Date();
    since.setDate(since.getDate() - safeDays);

    const logs = await prisma.dailyLog.findMany({
      where: { playerId, date: { gte: since } },
      orderBy: { date: "desc" },
      select: { date: true, tasksCompleted: true, xpEarned: true, battleCount: true },
    });

    return ok(logs);
  } catch (err) {
    return handleActionError(err);
  }
}
