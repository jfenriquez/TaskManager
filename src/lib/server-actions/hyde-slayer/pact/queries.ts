"use server";

import { prisma } from "@/src/lib/prisma";
import {
  requirePlayerProfile,
  ok,
  fail,
  handleActionError,
  type ActionResult,
} from "../utils";

export async function getPacts(): Promise<
  ActionResult<
    Array<{
      id: string;
      title: string;
      description: string | null;
      duration: number;
      difficulty: string;
      xpReward: number;
      coinReward: number;
      disciplineReward: number;
      isActive: boolean;
    }>
  >
> {
  try {
    const pacts = await prisma.pact.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(pacts);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getPlayerPacts(): Promise<
  ActionResult<
    Array<{
      id: string;
      pactId: string;
      status: string;
      progress: number;
      startedAt: Date;
      completedAt: Date | null;
      pact: {
        title: string;
        description: string | null;
        difficulty: string;
        duration: number;
        xpReward: number;
        coinReward: number;
        disciplineReward: number;
      };
    }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const pacts = await prisma.playerPact.findMany({
      where: { playerId },
      include: {
        pact: {
          select: {
            title: true,
            description: true,
            difficulty: true,
            duration: true,
            xpReward: true,
            coinReward: true,
            disciplineReward: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });
    return ok(pacts);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getPactStats(): Promise<
  ActionResult<{
    totalPacts: number;
    activePacts: number;
    completedPacts: number;
    failedPacts: number;
    cancelledPacts: number;
    totalXpEarned: number;
    totalCoinsEarned: number;
    totalDisciplineEarned: number;
    currentStreak: number;
    weeklyStats: Array<{ date: string; xp: number; count: number }>;
    monthlyStats: Array<{ month: string; xp: number; count: number }>;
    recentRewards: Array<{
      id: string;
      pactTitle: string;
      xp: number;
      coins: number;
      completedAt: Date;
    }>;
  }>
> {
  try {
    const { playerId, userId } = await requirePlayerProfile();

    const [
      activePacts,
      completedPacts,
      failedPacts,
      cancelledPacts,
      user,
      twoWeeksAgo,
      sixMonthsAgo,
    ] = await Promise.all([
      prisma.playerPact.count({ where: { playerId, status: "ACTIVE" } }),
      prisma.playerPact.findMany({
        where: { playerId, status: "COMPLETED" },
        include: { pact: { select: { xpReward: true, coinReward: true, disciplineReward: true } } },
      }),
      prisma.playerPact.count({ where: { playerId, status: "FAILED" } }),
      prisma.playerPact.count({ where: { playerId, status: "CANCELLED" } }),
      prisma.user.findUnique({ where: { id: userId }, select: { streak: true } }),
      (() => { const d = new Date(); d.setDate(d.getDate() - 14); return d; })(),
      (() => { const d = new Date(); d.setMonth(d.getMonth() - 6); return d; })(),
    ]);

    const totalXp = completedPacts.reduce((sum, p) => sum + p.pact.xpReward, 0);
    const totalCoins = completedPacts.reduce((sum, p) => sum + p.pact.coinReward, 0);
    const totalDiscipline = completedPacts.reduce((sum, p) => sum + p.pact.disciplineReward, 0);

    const xpLogs = await prisma.xpLog.findMany({
      where: { playerId, source: "pact", createdAt: { gte: twoWeeksAgo } },
      orderBy: { createdAt: "asc" },
    });

    const weeklyMap = new Map<string, { xp: number; count: number }>();
    for (const log of xpLogs) {
      const key = log.createdAt.toISOString().slice(0, 10);
      const entry = weeklyMap.get(key) ?? { xp: 0, count: 0 };
      entry.xp += log.amount;
      entry.count += 1;
      weeklyMap.set(key, entry);
    }
    const weeklyStats = Array.from(weeklyMap.entries())
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const monthlyLogs = await prisma.xpLog.findMany({
      where: { playerId, source: "pact", createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: "asc" },
    });

    const monthlyMap = new Map<string, { xp: number; count: number }>();
    for (const log of monthlyLogs) {
      const key = log.createdAt.toISOString().slice(0, 7);
      const entry = monthlyMap.get(key) ?? { xp: 0, count: 0 };
      entry.xp += log.amount;
      entry.count += 1;
      monthlyMap.set(key, entry);
    }
    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, val]) => ({ month, ...val }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const recentRewards = await prisma.playerPact.findMany({
      where: { playerId, status: "COMPLETED", completedAt: { not: null } },
      include: { pact: { select: { title: true, xpReward: true, coinReward: true } } },
      orderBy: { completedAt: "desc" },
      take: 10,
    });

    return ok({
      totalPacts: activePacts + completedPacts.length + failedPacts + cancelledPacts,
      activePacts,
      completedPacts: completedPacts.length,
      failedPacts,
      cancelledPacts,
      totalXpEarned: totalXp,
      totalCoinsEarned: totalCoins,
      totalDisciplineEarned: totalDiscipline,
      currentStreak: user?.streak ?? 0,
      weeklyStats,
      monthlyStats,
      recentRewards: recentRewards.map((r) => ({
        id: r.id,
        pactTitle: r.pact.title,
        xp: r.pact.xpReward,
        coins: r.pact.coinReward,
        completedAt: r.completedAt!,
      })),
    });
  } catch (err) {
    return handleActionError(err);
  }
}
