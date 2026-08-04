"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  createItemSchema,
  updateItemSchema,
  updateInventorySchema,
} from "@/src/lib/validations/hyde-slayer";
import {
  requirePlayerProfile,
  requireAdmin,
  ok,
  fail,
  handleActionError,
  type ActionResult,
} from "./utils";

export async function getItems(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      description: string | null;
      type: string;
      rarity: string;
      effect: unknown;
      iconUrl: string | null;
      buyPrice: number | null;
      sellPrice: number | null;
    }>
  >
> {
  try {
    const items = await prisma.item.findMany({
      orderBy: [{ rarity: "asc" }, { name: "asc" }],
    });
    return ok(items);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function createItem(input: unknown): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    await requireAdmin();
    const data = createItemSchema.parse(input);
    const item = await prisma.item.create({ data: data as Prisma.ItemCreateInput });
    revalidatePath("/hyde-slayer");
    return ok({ id: item.id, name: item.name });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updateItem(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = updateItemSchema.parse(input);
    await prisma.item.update({ where: { id: data.id }, data: data as Prisma.ItemUpdateInput });
    revalidatePath("/hyde-slayer");
    return ok({ id: data.id });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getInventory(): Promise<
  ActionResult<
    Array<{
      id: string;
      itemId: string;
      quantity: number;
      equipped: boolean;
      item: { name: string; type: string; rarity: string; description: string | null; iconUrl: string | null };
    }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();

    const inventory = await prisma.inventory.findMany({
      where: { playerId },
      include: {
        item: { select: { name: true, type: true, rarity: true, description: true, iconUrl: true } },
      },
      orderBy: { acquiredAt: "desc" },
    });

    return ok(inventory);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updateInventoryItem(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = updateInventorySchema.parse(input);

    const result = await prisma.inventory.updateMany({
      where: { id: data.id, playerId },
      data,
    });
    if (result.count === 0) return fail("Ítem no encontrado en tu inventario");

    revalidatePath("/hyde-slayer");
    return ok({ id: data.id });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function removeFromInventory(id: string): Promise<ActionResult<void>> {
  try {
    const { playerId } = await requirePlayerProfile();

    const result = await prisma.inventory.deleteMany({
      where: { id, playerId },
    });
    if (result.count === 0) return fail("Ítem no encontrado en tu inventario");

    revalidatePath("/hyde-slayer");
    return ok(undefined);
  } catch (err) {
    return handleActionError(err);
  }
}
