"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { createPactSchema } from "@/src/lib/validations/hyde-slayer";
import { requirePlayerProfile, ok, fail, handleActionError, type ActionResult } from "../utils";

export async function createPact(input: unknown): Promise<
  ActionResult<{ id: string; title: string }>
> {
  try {
    await requirePlayerProfile();
    const data = createPactSchema.parse(input);
    const pact = await prisma.pact.create({ data: data as Prisma.PactCreateInput });
    revalidatePath("/hyde-slayer");
    return ok({ id: pact.id, title: pact.title });
  } catch (err) {
    return handleActionError(err);
  }
}
