import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { prisma } from "@/src/lib/prisma";

export function registerTimerTools(server: McpServer, userId: string) {
  server.registerTool(
    "start_timer",
    {
      description: "Inicia o reanuda el temporizador de una tarea",
      inputSchema: z.object({
        taskId: z.string().describe("ID de la tarea"),
        minutes: z.number().int().positive().optional().describe("Minutos para el timer (usa timerMinutes de la tarea si no se especifica)"),
      }),
    },
    async (input) => {
      const task = await prisma.tasks.findFirst({ where: { id: input.taskId, userId } });
      if (!task) throw new Error("Task not found");

      const secondsFromRemaining = task.timerRemainingSeconds ?? null;
      const secondsFromMinutes = input.minutes
        ? Math.floor(input.minutes * 60)
        : task.timerMinutes
          ? Math.floor(task.timerMinutes * 60)
          : null;

      const secondsToUse = secondsFromRemaining ?? secondsFromMinutes;
      if (!secondsToUse || secondsToUse <= 0) {
        throw new Error("No hay duración de timer. Especifica 'minutes' o asigna timerMinutes a la tarea.");
      }

      const now = new Date();
      const endsAt = new Date(Date.now() + secondsToUse * 1000);

      const updated = await prisma.tasks.update({
        where: { id: input.taskId },
        data: { timerStartedAt: now, timerEndsAt: endsAt, timerRemainingSeconds: null, timerRunning: true },
      });

      return { content: [{ type: "text", text: JSON.stringify(updated, null, 2) }] };
    }
  );

  server.registerTool(
    "pause_timer",
    {
      description: "Pausa el temporizador de una tarea activa",
      inputSchema: z.object({ taskId: z.string() }),
    },
    async (input) => {
      const task = await prisma.tasks.findFirst({ where: { id: input.taskId, userId } });
      if (!task) throw new Error("Task not found");
      if (!task.timerRunning || !task.timerEndsAt) {
        return { content: [{ type: "text", text: "El timer no está corriendo" }] };
      }

      const remainingSec = Math.max(0, Math.ceil((task.timerEndsAt.getTime() - Date.now()) / 1000));

      const updated = await prisma.tasks.update({
        where: { id: input.taskId },
        data: { timerRunning: false, timerRemainingSeconds: remainingSec, timerEndsAt: null },
      });

      return { content: [{ type: "text", text: JSON.stringify(updated, null, 2) }] };
    }
  );

  server.registerTool(
    "stop_timer",
    {
      description: "Detiene y limpia completamente el temporizador de una tarea",
      inputSchema: z.object({ taskId: z.string() }),
    },
    async (input) => {
      const existing = await prisma.tasks.findFirst({ where: { id: input.taskId, userId } });
      if (!existing) throw new Error("Task not found");

      const updated = await prisma.tasks.update({
        where: { id: input.taskId },
        data: { timerRunning: false, timerRemainingSeconds: null, timerEndsAt: null, timerStartedAt: null },
      });

      return { content: [{ type: "text", text: JSON.stringify(updated, null, 2) }] };
    }
  );
}
