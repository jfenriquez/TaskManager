"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  createItemSchema,
  updateItemSchema,
  addToInventorySchema,
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

export async function addToInventory(input: unknown): Promise<ActionResult<{ id: string; itemName: string }>> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = addToInventorySchema.parse(input);

    const item = await prisma.item.findUnique({ where: { id: data.itemId } });
    if (!item) return fail("Ítem no encontrado");

    const existing = await prisma.inventory.findUnique({
      where: { playerId_itemId: { playerId, itemId: data.itemId } },
    });

    if (existing) {
      await prisma.inventory.update({
        where: { id: existing.id },
        data: { quantity: { increment: data.quantity } },
      });
    } else {
      await prisma.inventory.create({
        data: { playerId, itemId: data.itemId, quantity: data.quantity },
      });
    }

    revalidatePath("/hyde-slayer");
    return ok({ id: data.itemId, itemName: item.name });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updateInventoryItem(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = updateInventorySchema.parse(input);

    const inv = await prisma.inventory.findFirst({
      where: { id: data.id, playerId },
    });
    if (!inv) return fail("Ítem no encontrado en tu inventario");

    await prisma.inventory.update({ where: { id: data.id }, data });

    revalidatePath("/hyde-slayer");
    return ok({ id: data.id });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function removeFromInventory(id: string): Promise<ActionResult<void>> {
  try {
    const { playerId } = await requirePlayerProfile();

    const inv = await prisma.inventory.findFirst({
      where: { id, playerId },
    });
    if (!inv) return fail("Ítem no encontrado en tu inventario");

    await prisma.inventory.delete({ where: { id } });

    revalidatePath("/hyde-slayer");
    return ok(undefined);
  } catch (err) {
    return handleActionError(err);
  }
}
