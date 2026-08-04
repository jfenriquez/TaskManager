"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { updatePactSchema } from "@/src/lib/validations/hyde-slayer";
import { requireAdmin, ok, fail, handleActionError, type ActionResult } from "../utils";

export async function updatePact(input: unknown): Promise<
  ActionResult<{ id: string }>
> {
  try {
    await requireAdmin();
    const data = updatePactSchema.parse(input);
    const existing = await prisma.pact.findUnique({ where: { id: data.id } });
    if (!existing) return fail("Pacto no encontrado");
    await prisma.pact.update({ where: { id: data.id }, data: data as Prisma.PactUpdateInput });
    revalidatePath("/hyde-slayer");
    return ok({ id: data.id });
  } catch (err) {
    return handleActionError(err);
  }
}
