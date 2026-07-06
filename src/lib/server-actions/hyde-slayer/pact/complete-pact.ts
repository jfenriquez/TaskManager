"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { completePactSchema } from "@/src/lib/validations/hyde-slayer";
import {
  requirePlayerProfile,
  ActionError,
  ok,
  fail,
  handleActionError,
  awardXp,
  awardCoins,
  awardDiscipline,
  type ActionResult,
} from "../utils";
import { checkAndUnlockAchievements } from "../achievement";

interface CompletePactRewards {
  xp: number;
  coins: number;
  discipline: number;
  xpBonus: number;
  streakBonus: number;
}

export async function completePact(input: unknown): Promise<
  ActionResult<{
    pactId: string;
    title: string;
    rewards: CompletePactRewards;
    newlyUnlocked: Array<{ name: string; xpEarned: number }>;
  }>
> {
  try {
    const { playerId, userId } = await requirePlayerProfile();
    const data = completePactSchema.parse(input);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const rewards = await prisma.$transaction(async (tx) => {
      const playerPact = await tx.playerPact.findUnique({
        where: { playerId_pactId: { playerId, pactId: data.pactId } },
        include: { pact: true },
      });
      if (!playerPact) throw new ActionError("Pacto no encontrado");
      if (playerPact.status === "COMPLETED") throw new ActionError("Este pacto ya fue completado");
      if (playerPact.status === "CANCELLED") throw new ActionError("Este pacto fue cancelado");

      const pact = playerPact.pact;
      const elapsedDays = Math.floor(
        (now.getTime() - playerPact.startedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      let streakBonus = 0;
      if (elapsedDays <= pact.duration) {
        const user = await tx.user.findUnique({ where: { id: userId }, select: { streak: true } });
        if (user) {
          streakBonus = Math.floor(user.streak / 7) * 5;
        }
      }

      const difficultyMultiplier: Record<string, number> = {
        EASY: 1,
        MEDIUM: 1.5,
        HARD: 2,
        IMPOSSIBLE: 3,
      };
      const mult = difficultyMultiplier[pact.difficulty] ?? 1;

      const xp = Math.round(pact.xpReward * mult + streakBonus);
      const coins = Math.round(pact.coinReward * mult);
      const discipline = Math.round(pact.disciplineReward * mult);
      const xpBonus = streakBonus;

      await tx.playerPact.update({
        where: { id: playerPact.id },
        data: {
          status: "COMPLETED",
          completedAt: now,
          progress: 100,
        },
      });

      const description = `Completaste: ${pact.title}`;
      await tx.xpLog.create({
        data: { playerId, amount: xp, source: "pact", description },
      });

      await tx.playerProfile.update({
        where: { id: playerId },
        data: {
          coins: { increment: coins },
          discipline: { increment: discipline },
          xp: { increment: xp },
        },
      });

      await tx.dailyLog.upsert({
        where: { playerId_date: { playerId, date: todayStart } },
        create: { playerId, date: todayStart, xpEarned: xp },
        update: { xpEarned: { increment: xp } },
      });

      const pactCount = await tx.playerPact.count({
        where: { playerId, status: "COMPLETED" },
      });

      await tx.user.update({
        where: { id: userId },
        data: { streak: { increment: 1 } },
      });

      const profile = await tx.playerProfile.findUnique({ where: { id: playerId } });
      const xpPerLevel = 200;
      const newLevel = Math.floor((profile!.xp) / xpPerLevel) + 1;
      if (newLevel > (profile!.level)) {
        await tx.playerProfile.update({
          where: { id: playerId },
          data: { level: newLevel },
        });
      }

      return { xp, coins, discipline, xpBonus, streakBonus, pactCount: pactCount + 1, pactTitle: pact.title };
    });

    const achievementResult = await checkAndUnlockAchievements();
    const newlyUnlocked = achievementResult.success ? achievementResult.data : [];

    revalidatePath("/hyde-slayer");
    return ok({
      pactId: data.pactId,
      title: rewards.pactTitle,
      rewards: {
        xp: rewards.xp,
        coins: rewards.coins,
        discipline: rewards.discipline,
        xpBonus: rewards.xpBonus,
        streakBonus: rewards.streakBonus,
      },
      newlyUnlocked,
    });
  } catch (err) {
    return handleActionError(err);
  }
}
