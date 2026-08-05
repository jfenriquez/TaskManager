"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { deletePactSchema } from "@/src/lib/validations/hyde-slayer";
import { requireAdmin, ok, fail, handleActionError, type ActionResult } from "../utils";

export async function deletePact(input: unknown): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    const { pactId } = deletePactSchema.parse(input);
    const existing = await prisma.pact.findUnique({ where: { id: pactId } });
    if (!existing) return fail("Pacto no encontrado");
    await prisma.pact.delete({ where: { id: pactId } });
    revalidatePath("/hyde-slayer");
    return ok(undefined);
  } catch (err) {
    return handleActionError(err);
  }
}
