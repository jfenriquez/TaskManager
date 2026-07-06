"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePlayerProfile, ok, fail, handleActionError, type ActionResult } from "../utils";

export async function cancelPact(pactId: string): Promise<ActionResult<void>> {
  try {
    const { playerId } = await requirePlayerProfile();
    const playerPact = await prisma.playerPact.findUnique({
      where: { playerId_pactId: { playerId, pactId } },
    });
    if (!playerPact) return fail("Pacto no encontrado");
    if (playerPact.status !== "ACTIVE") return fail("Solo puedes cancelar pactos activos");

    await prisma.playerPact.update({
      where: { id: playerPact.id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/hyde-slayer");
    return ok(undefined);
  } catch (err) {
    return handleActionError(err);
  }
}
