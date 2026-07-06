"use server";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUserId } from "@/src/lib/auth-utils";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  getTodayInTimezone,
  yesterdayInTimezone,
  MILESTONE_CONFIG,
} from "@/src/utils/streakHelpers";
import type { StreakData, MilestoneDay, MilestoneEntry } from "@/src/types/streak.types";

const GOAL_COOKIE = "dailyTaskGoal";

async function getGoalFromCookies(): Promise<number> {
  const store = await cookies();
  const val = store.get(GOAL_COOKIE)?.value;
  return val ? Math.max(1, Math.min(parseInt(val, 10) || 1, 50)) : 1;
}

export async function updateStreakOnTaskToggle(goal?: number): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  const userTimezone = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const tz = userTimezone?.timezone || "UTC";
  const dailyGoal = goal ?? (await getGoalFromCookies());

  const todayStr = getTodayInTimezone(tz);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const recentCompleted = await prisma.tasks.findMany({
    where: { userId, completed: true, updatedAt: { gte: oneYearAgo } },
    select: { updatedAt: true },
  });

  const tasksByDate = new Map<string, number>();
  for (const task of recentCompleted) {
    const ds = task.updatedAt.toLocaleDateString("en-CA", { timeZone: tz });
    tasksByDate.set(ds, (tasksByDate.get(ds) ?? 0) + 1);
  }

  const todayCount = tasksByDate.get(todayStr) ?? 0;
  let streak = 0;
  let checkDate = todayStr;

  if (todayCount < dailyGoal) {
    checkDate = yesterdayInTimezone(todayStr);
  }

  while (true) {
    const count = tasksByDate.get(checkDate) ?? 0;
    if (count >= dailyGoal) {
      streak++;
      checkDate = yesterdayInTimezone(checkDate);
    } else {
      break;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak },
  });

  return streak;
}

export async function getStreakData(): Promise<StreakData> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { currentStreak: 0, bestStreak: 0, dailyTaskGoal: 1, todayCount: 0, lastStreakDate: null, milestones: [] };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, timezone: true, createdAt: true },
  });
  if (!user) throw new Error("User not found");

  const tz = user.timezone;
  const todayStr = getTodayInTimezone(tz);
  const dailyGoal = await getGoalFromCookies();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const allCompleted = await prisma.tasks.findMany({
    where: { userId, completed: true, updatedAt: { gte: oneYearAgo } },
    select: { updatedAt: true },
  });

  const tasksByDate = new Map<string, number>();
  for (const task of allCompleted) {
    const ds = task.updatedAt.toLocaleDateString("en-CA", { timeZone: tz });
    tasksByDate.set(ds, (tasksByDate.get(ds) ?? 0) + 1);
  }

  const todayCount = tasksByDate.get(todayStr) ?? 0;

  // Calculate best streak
  let bestStreak = 0;
  let currentRun = 0;
  const dates = [...tasksByDate.entries()]
    .filter(([, count]) => count >= dailyGoal)
    .map(([date]) => date)
    .sort()
    .reverse();

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const prev = yesterdayInTimezone(dates[i - 1]);
      if (dates[i] === prev) {
        currentRun++;
      } else {
        bestStreak = Math.max(bestStreak, currentRun);
        currentRun = 1;
      }
    }
  }
  bestStreak = Math.max(bestStreak, currentRun);

  const milestones: MilestoneEntry[] = (
    [7, 14, 30, 60, 100, 200, 365] as MilestoneDay[]
  ).map((day) => ({
    day,
    achieved: user.streak >= day,
    achievedAt: null,
    icon: MILESTONE_CONFIG[day].icon,
    label: MILESTONE_CONFIG[day].label,
  }));

  return {
    currentStreak: user.streak,
    bestStreak,
    dailyTaskGoal: dailyGoal,
    todayCount,
    lastStreakDate: null,
    milestones,
  };
}

export async function setDailyTaskGoal(goal: number): Promise<void> {
  const clamped = Math.max(1, Math.min(goal, 50));
  const cookieStore = await cookies();
  cookieStore.set(GOAL_COOKIE, String(clamped), {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
    httpOnly: true,
  });
  revalidatePath("/profile");
}
