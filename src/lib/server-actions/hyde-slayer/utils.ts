import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { ZodError } from "zod";

// ─── Action result wrapper ─────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { success: false, error };
}

// ─── Auth helpers ──────────────────────────────────────────────

export async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new ActionError("No autenticado");
  }
  return session.user.id;
}

export async function requireAdmin(): Promise<{ userId: string }> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    throw new ActionError("Requiere rol ADMIN");
  }
  return { userId };
}

export async function requirePlayerProfile(): Promise<{
  userId: string;
  playerId: string;
}> {
  const userId = await requireUserId();
  let profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    profile = await prisma.playerProfile.create({
      data: {
        userId,
        playerName: user?.name ?? "Guerrero",
      },
    });
  }
  return { userId, playerId: profile.id };
}

// ─── Error handling ────────────────────────────────────────────

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export function formatZodError(err: ZodError): string {
  const issues = "issues" in err ? (err as unknown as { issues: Array<{ path: (string | number)[]; message: string }> }).issues : [];
  return issues
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
}

export function handleActionError(err: unknown): ActionResult<never> {
  if (err instanceof ActionError) {
    return fail(err.message);
  }
  if (err instanceof ZodError) {
    return fail(formatZodError(err));
  }
  console.error("[ActionError]", err);
  return fail("Error interno del servidor");
}

// ─── XP helpers ────────────────────────────────────────────────

const XP_PER_LEVEL = 200;

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export async function awardXp(
  playerId: string,
  amount: number,
  source: string,
  description?: string | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.xpLog.create({
      data: { playerId, amount, source, description },
    });
    const profile = await tx.playerProfile.update({
      where: { id: playerId },
      data: { xp: { increment: amount } },
    });
    const newLevel = calculateLevel(profile.xp);
    if (newLevel > Math.floor((profile.xp - amount) / XP_PER_LEVEL) + 1) {
      await tx.playerProfile.update({
        where: { id: playerId },
        data: { level: newLevel },
      });
    }
  });
}

export async function awardCoins(
  playerId: string,
  amount: number,
): Promise<void> {
  await prisma.playerProfile.update({
    where: { id: playerId },
    data: { coins: { increment: amount } },
  });
}

export async function awardDiscipline(
  playerId: string,
  amount: number,
): Promise<void> {
  await prisma.playerProfile.update({
    where: { id: playerId },
    data: { discipline: { increment: amount } },
  });
}
