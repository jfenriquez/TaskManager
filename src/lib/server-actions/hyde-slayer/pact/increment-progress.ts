"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { updatePactProgressSchema } from "@/src/lib/validations/hyde-slayer";
import { requirePlayerProfile, ok, fail, handleActionError, type ActionResult } from "../utils";

export async function incrementPactProgress(input: unknown): Promise<
  ActionResult<{
    pactId: string;
    progress: number;
    status: string;
    isComplete: boolean;
  }>
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = updatePactProgressSchema.parse(input);

    const playerPact = await prisma.playerPact.findUnique({
      where: { playerId_pactId: { playerId, pactId: data.pactId } },
      include: { pact: true },
    });
    if (!playerPact) return fail("Pacto no encontrado");
    if (playerPact.status !== "ACTIVE") return fail("Este pacto ya no está activo");

    const now = new Date();
    const elapsedDays = Math.floor(
      (now.getTime() - playerPact.startedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isOverdue = elapsedDays > playerPact.pact.duration;

    // El progreso lo declara el cliente, pero el servidor lo trata como DELTA
    // con tope por llamada (+5): no se puede fijar el progreso absoluto.
    const newProgress = Math.min(100, playerPact.progress + data.progress);
    const isComplete = newProgress >= 100;

    const updateData: Record<string, unknown> = {
      progress: newProgress,
    };

    // Al llegar a 100 el pacto sigue ACTIVE: las recompensas se otorgan una
    // única vez en `completePact`, que exige progress >= 100.
    if (isOverdue && !isComplete) {
      updateData.status = "FAILED";
      updateData.failedAt = now;
    }

    await prisma.playerPact.update({
      where: { id: playerPact.id },
      data: updateData as Parameters<typeof prisma.playerPact.update>[0]["data"],
    });

    revalidatePath("/hyde-slayer");
    return ok({ pactId: data.pactId, progress: newProgress, status: (updateData.status as string) ?? playerPact.status, isComplete });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getPlayerPactsForProgress(): Promise<
  ActionResult<
    Array<{
      id: string;
      pactId: string;
      status: string;
      progress: number;
      startedAt: Date;
      completedAt: Date | null;
      pact: { title: string; difficulty: string; duration: number; xpReward: number; coinReward: number; disciplineReward: number };
    }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const pacts = await prisma.playerPact.findMany({
      where: { playerId },
      include: {
        pact: {
          select: { title: true, difficulty: true, duration: true, xpReward: true, coinReward: true, disciplineReward: true },
        },
      },
      orderBy: { startedAt: "desc" },
    });
    return ok(pacts);
  } catch (err) {
    return handleActionError(err);
  }
}
