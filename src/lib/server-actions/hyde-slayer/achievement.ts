"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  createAchievementSchema,
  updateAchievementSchema,
} from "@/src/lib/validations/hyde-slayer";
import {
  requirePlayerProfile,
  requireAdmin,
  ok,
  fail,
  handleActionError,
  awardXp,
  awardCoins,
  type ActionResult,
} from "./utils";

export async function getAchievements(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      description: string | null;
      category: string;
      condition: unknown;
      xpReward: number;
      coinReward: number;
    }>
  >
> {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return ok(achievements);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function createAchievement(input: unknown): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    await requireAdmin();
    const data = createAchievementSchema.parse(input);
    const achievement = await prisma.achievement.create({ data: data as Prisma.AchievementCreateInput });
    revalidatePath("/hyde-slayer");
    return ok({ id: achievement.id, name: achievement.name });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updateAchievement(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = updateAchievementSchema.parse(input);
    await prisma.achievement.update({ where: { id: data.id }, data: data as Prisma.AchievementUpdateInput });
    revalidatePath("/hyde-slayer");
    return ok({ id: data.id });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getPlayerAchievements(): Promise<
  ActionResult<
    Array<{
      id: string;
      achievementId: string;
      unlockedAt: Date;
      achievement: { name: string; description: string | null; category: string; xpReward: number };
    }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();

    const unlocked = await prisma.playerAchievement.findMany({
      where: { playerId },
      include: {
        achievement: {
          select: { name: true, description: true, category: true, xpReward: true },
        },
      },
      orderBy: { unlockedAt: "desc" },
    });

    return ok(unlocked);
  } catch (err) {
    return handleActionError(err);
  }
}

// Privada: solo se desbloquean logros desde checkAndUnlockAchievements,
// que verifica las condiciones reales en el servidor. Un cliente nunca puede
// invocarla directamente para farmear XP/monedas.
async function unlockAchievement(achievementId: string): Promise<
  ActionResult<{
    name: string;
    xpEarned: number;
    coinsEarned: number;
  }>
> {
  try {
    const { playerId } = await requirePlayerProfile();

    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });
    if (!achievement) return fail("Logro no encontrado");

    const existing = await prisma.playerAchievement.findUnique({
      where: { playerId_achievementId: { playerId, achievementId } },
    });
    if (existing) return fail("Ya tienes este logro");

    await prisma.playerAchievement.create({
      data: { playerId, achievementId },
    });

    await awardXp(playerId, achievement.xpReward, "achievement", achievement.name);
    await awardCoins(playerId, achievement.coinReward);

    revalidatePath("/hyde-slayer");
    return ok({
      name: achievement.name,
      xpEarned: achievement.xpReward,
      coinsEarned: achievement.coinReward,
    });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function checkAndUnlockAchievements(): Promise<
  ActionResult<Array<{ name: string; xpEarned: number }>>
> {
  try {
    const { playerId } = await requirePlayerProfile();

    const allAchievements = await prisma.achievement.findMany();
    const unlocked = await prisma.playerAchievement.findMany({
      where: { playerId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { id: playerId },
      select: { xp: true, level: true, discipline: true },
    });
    if (!playerProfile) return fail("Perfil no encontrado");

    const battleWins = await prisma.battleLog.count({
      where: { playerId, result: "VICTORY" },
    });

    const pactsCompleted = await prisma.playerPact.count({
      where: { playerId, status: "COMPLETED" },
    });

    const inventoryCount = await prisma.inventory.count({ where: { playerId } });

    const relaxationCount = await prisma.relaxationLog.count({ where: { playerId } });

    const vitamenteCount = await prisma.vitamenteLog.count({ where: { playerId } });

    const newlyUnlocked: Array<{ name: string; xpEarned: number }> = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const cond = achievement.condition as Record<string, unknown> | null;
      if (!cond) continue;

      let earned = false;

      switch (cond.type) {
        case "battle_wins":
          earned = (cond.count as number) <= battleWins;
          break;
        case "discipline":
          earned = (cond.count as number) <= playerProfile.discipline;
          break;
        case "level":
          earned = (cond.count as number) <= playerProfile.level;
          break;
        case "items":
          earned = (cond.count as number) <= inventoryCount;
          break;
        case "relaxation":
          earned = (cond.count as number) <= relaxationCount;
          break;
        case "pacts_completed":
          earned = (cond.count as number) <= pactsCompleted;
          break;
        case "vitamente_morning":
          earned = vitamenteCount >= 1;
          break;
        default:
          break;
      }

      if (earned) {
        const result = await unlockAchievement(achievement.id);
        if (result.success) {
          newlyUnlocked.push({ name: result.data.name, xpEarned: result.data.xpEarned });
        }
      }
    }

    return ok(newlyUnlocked);
  } catch (err) {
    return handleActionError(err);
  }
}
