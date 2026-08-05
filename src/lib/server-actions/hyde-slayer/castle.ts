"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateCastleProgressSchema } from "@/src/lib/validations/hyde-slayer";
import {
  requirePlayerProfile,
  ok,
  fail,
  handleActionError,
  awardXp,
  awardCoins,
  type ActionResult,
} from "./utils";

export async function getCastleLevels(): Promise<
  ActionResult<
    Array<{
      id: string;
      level: number;
      name: string;
      description: string | null;
      xpRequired: number;
      boss: { id: string; name: string; isBoss: boolean } | null;
    }>
  >
> {
  try {
    const levels = await prisma.castleLevel.findMany({
      orderBy: { level: "asc" },
      include: { boss: { select: { id: true, name: true, isBoss: true } } },
    });
    return ok(levels);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getCastleProgress(): Promise<
  ActionResult<
    Array<{
      id: string;
      castleLevelId: string;
      defeated: boolean;
      bestTime: number | null;
      attempts: number;
      firstDefeatedAt: Date | null;
    }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();

    const progress = await prisma.castleProgress.findMany({
      where: { playerId },
    });

    return ok(progress);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updateCastleProgress(input: unknown): Promise<
  ActionResult<{
    castleLevelId: string;
    defeated: boolean;
    xpEarned: number;
    coinsEarned: number;
  }>
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = updateCastleProgressSchema.parse(input);

    const castleLevel = await prisma.castleLevel.findUnique({
      where: { id: data.castleLevelId },
    });
    if (!castleLevel) return fail("Nivel de castillo no encontrado");

    const user = await prisma.playerProfile.findUnique({
      where: { id: playerId },
      select: { xp: true },
    });
    if (!user || user.xp < castleLevel.xpRequired) {
      return fail(`Requieres ${castleLevel.xpRequired} XP para acceder a este nivel`);
    }

    const existing = await prisma.castleProgress.findUnique({
      where: { playerId_castleLevelId: { playerId, castleLevelId: data.castleLevelId } },
    });

    // Un nivel conquistado no se puede desmarcar (evita re-farmeo de recompensas)
    if (data.defeated === false && existing?.defeated) {
      return fail("Una vez conquistado, el nivel no se puede desmarcar");
    }

    // `defeated: true` solo se acepta si existe una victoria REAL contra el
    // jefe de este nivel en el historial de batallas del servidor.
    if (data.defeated === true) {
      if (!castleLevel.bossId) {
        return fail("Este nivel no tiene jefe asignado");
      }
      const bossVictory = await prisma.battleLog.count({
        where: { playerId, enemyId: castleLevel.bossId, result: "VICTORY" },
      });
      if (bossVictory === 0) {
        return fail("Debes derrotar al jefe en combate para conquistar este nivel");
      }
    }

    const progressData: Record<string, unknown> = {};
    if (data.defeated !== undefined) progressData.defeated = data.defeated;
    if (data.bestTime !== undefined) progressData.bestTime = data.bestTime;
    if (data.attempts !== undefined) progressData.attempts = data.attempts;
    if (data.defeated && !existing?.defeated) {
      progressData.firstDefeatedAt = new Date();
    }

    if (existing) {
      await prisma.castleProgress.update({
        where: { id: existing.id },
        data: progressData,
      });
    } else {
      await prisma.castleProgress.create({
        data: {
          playerId,
          castleLevelId: data.castleLevelId,
          defeated: data.defeated ?? false,
          bestTime: data.bestTime ?? null,
          attempts: data.attempts ?? 1,
          firstDefeatedAt: data.defeated ? new Date() : null,
        },
      });
    }

    let xpEarned = 0;
    let coinsEarned = 0;
    if (data.defeated && !existing?.defeated) {
      const BONUS_XP = castleLevel.level * 100;
      const BONUS_COINS = castleLevel.level * 50;
      await awardXp(playerId, BONUS_XP, "castle", `Completaste ${castleLevel.name}`);
      await awardCoins(playerId, BONUS_COINS);
      xpEarned = BONUS_XP;
      coinsEarned = BONUS_COINS;
    }

    revalidatePath("/hyde-slayer");
    return ok({ castleLevelId: data.castleLevelId, defeated: !!data.defeated, xpEarned, coinsEarned });
  } catch (err) {
    return handleActionError(err);
  }
}
