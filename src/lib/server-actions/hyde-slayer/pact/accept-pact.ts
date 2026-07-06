"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { acceptPactSchema } from "@/src/lib/validations/hyde-slayer";
import { requirePlayerProfile, ok, fail, handleActionError, type ActionResult } from "../utils";

export async function acceptPact(input: unknown): Promise<
  ActionResult<{ id: string; title: string }>
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = acceptPactSchema.parse(input);

    const pact = await prisma.pact.findUnique({ where: { id: data.pactId } });
    if (!pact) return fail("Pacto no encontrado");
    if (!pact.isActive) return fail("Este pacto no está disponible");

    const existing = await prisma.playerPact.findUnique({
      where: { playerId_pactId: { playerId, pactId: data.pactId } },
    });
    if (existing) return fail("Ya tienes este pacto activo");

    await prisma.playerPact.create({
      data: { playerId, pactId: data.pactId, status: "ACTIVE" },
    });

    revalidatePath("/hyde-slayer");
    return ok({ id: data.pactId, title: pact.title });
  } catch (err) {
    return handleActionError(err);
  }
}
