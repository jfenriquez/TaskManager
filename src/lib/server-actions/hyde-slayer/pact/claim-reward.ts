"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { claimRewardSchema } from "@/src/lib/validations/hyde-slayer";
import { requirePlayerProfile, ok, fail, handleActionError, type ActionResult } from "../utils";

export async function claimPactReward(input: unknown): Promise<
  ActionResult<{
    pactId: string;
    title: string;
    rewards: { xp: number; coins: number; discipline: number } | null;
  }>
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = claimRewardSchema.parse(input);

    const playerPact = await prisma.playerPact.findUnique({
      where: { playerId_pactId: { playerId, pactId: data.pactId } },
      include: { pact: true },
    });
    if (!playerPact) return fail("Pacto no encontrado");
    if (playerPact.status !== "COMPLETED") return fail("El pacto debe estar completado para reclamar recompensas");

    const pact = playerPact.pact;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const rewards = await prisma.$transaction(async (tx) => {
      const difficultyMultiplier: Record<string, number> = {
        EASY: 1,
        MEDIUM: 1.5,
        HARD: 2,
        IMPOSSIBLE: 3,
      };
      const mult = difficultyMultiplier[pact.difficulty] ?? 1;
      const xp = Math.round(pact.xpReward * mult);
      const coins = Math.round(pact.coinReward * mult);
      const discipline = Math.round(pact.disciplineReward * mult);

      await tx.xpLog.create({
        data: { playerId, amount: xp, source: "pact_reward", description: `Recompensa de: ${pact.title}` },
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

      const profile = await tx.playerProfile.findUnique({ where: { id: playerId } });
      const xpPerLevel = 200;
      const newLevel = Math.floor((profile!.xp) / xpPerLevel) + 1;
      if (newLevel > (profile!.level)) {
        await tx.playerProfile.update({
          where: { id: playerId },
          data: { level: newLevel },
        });
      }

      return { xp, coins, discipline };
    });

    revalidatePath("/hyde-slayer");
    return ok({ pactId: data.pactId, title: pact.title, rewards });
  } catch (err) {
    return handleActionError(err);
  }
}
