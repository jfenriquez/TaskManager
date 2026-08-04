import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { prisma } from "../lib/prisma.js";
import { getUserId } from "../lib/user.js";

export function registerStreakTools(server: McpServer) {
  server.registerTool(
    "get_streak",
    {
      description: "Obtiene los datos de racha del usuario: racha actual, mejor racha, meta diaria, hits musicales y logros",
      inputSchema: z.object({}),
    },
    async () => {
      const userId = await getUserId();
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, timezone: true, createdAt: true },
      });
      if (!user) throw new Error("User not found");

      const tz = user.timezone || "UTC";
      const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: tz });

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

      const MILESTONE_CONFIG: Record<number, { icon: string; label: string }> = {
        7: { icon: "🥉", label: "Bronce" },
        14: { icon: "🥈", label: "Plata" },
        30: { icon: "🥇", label: "Oro" },
        60: { icon: "⭐", label: "Estrella" },
        100: { icon: "🌟", label: "Superestrella" },
        200: { icon: "💎", label: "Diamante" },
        365: { icon: "👑", label: "Leyenda" },
      };

      const milestones = [7, 14, 30, 60, 100, 200, 365].map((day) => ({
        day,
        achieved: user.streak >= day,
        icon: MILESTONE_CONFIG[day].icon,
        label: MILESTONE_CONFIG[day].label,
      }));

      const result = {
        currentStreak: user.streak,
        todayCount,
        milestones,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
