import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { prisma } from "@/src/lib/prisma";

const MILESTONES = [
  { day: 7, icon: "🥉", label: "Bronce" },
  { day: 14, icon: "🥈", label: "Plata" },
  { day: 30, icon: "🥇", label: "Oro" },
  { day: 60, icon: "⭐", label: "Estrella" },
  { day: 100, icon: "🌟", label: "Superestrella" },
  { day: 200, icon: "💎", label: "Diamante" },
  { day: 365, icon: "👑", label: "Leyenda" },
];

export function registerStreakTools(server: McpServer, userId: string) {
  server.registerTool(
    "get_streak",
    {
      description: "Obtiene los datos de racha del usuario: racha actual, mejor racha, meta diaria y logros",
      inputSchema: z.object({}),
    },
    async () => {
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

      const milestones = MILESTONES.map((m) => ({
        day: m.day,
        achieved: user.streak >= m.day,
        icon: m.icon,
        label: m.label,
      }));

      const result = { currentStreak: user.streak, todayCount, milestones };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
