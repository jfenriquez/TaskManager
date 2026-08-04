import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { prisma } from "@/src/lib/prisma";
import { normalizeDateUtc, getDateRangeUtc } from "../mcp-utils/date";

export function registerTaskTools(server: McpServer, userId: string) {
  server.registerTool(
    "create_task",
    {
      description: "Crea una nueva tarea para el usuario autenticado",
      inputSchema: z.object({
        title: z.string().min(1, "El título es obligatorio"),
        description: z.string().optional().nullable(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
        timerMinutes: z.number().int().positive().optional().nullable(),
        categoryId: z.string().optional().nullable(),
        executionDate: z.string().optional().nullable().describe("Formato YYYY-MM-DD"),
      }),
    },
    async (input) => {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
      const tz = user?.timezone || "UTC";

      const task = await prisma.tasks.create({
        data: {
          title: input.title,
          description: input.description ?? null,
          priority: input.priority,
          timerMinutes: input.timerMinutes ?? null,
          categoryId: input.categoryId ?? null,
          ExecutionDate: input.executionDate ? normalizeDateUtc(input.executionDate, tz) : null,
          userId,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
    }
  );

  server.registerTool(
    "update_task",
    {
      description: "Actualiza una tarea existente",
      inputSchema: z.object({
        id: z.string().describe("ID de la tarea"),
        title: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        timerMinutes: z.number().int().positive().optional().nullable(),
        categoryId: z.string().optional().nullable(),
        executionDate: z.string().optional().nullable().describe("Formato YYYY-MM-DD"),
      }),
    },
    async (input) => {
      const existing = await prisma.tasks.findFirst({ where: { id: input.id, userId } });
      if (!existing) throw new Error("Task not found");

      const data: Record<string, unknown> = {};
      if (input.title !== undefined) data.title = input.title;
      if (input.description !== undefined) data.description = input.description;
      if (input.priority !== undefined) data.priority = input.priority;
      if (input.timerMinutes !== undefined) data.timerMinutes = input.timerMinutes;
      if (input.categoryId !== undefined) data.categoryId = input.categoryId;
      if (input.executionDate !== undefined) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
        const tz = user?.timezone || "UTC";
        data.ExecutionDate = input.executionDate ? normalizeDateUtc(input.executionDate, tz) : null;
      }

      const task = await prisma.tasks.update({ where: { id: input.id, userId }, data });
      return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
    }
  );

  server.registerTool(
    "delete_task",
    {
      description: "Elimina una tarea por su ID",
      inputSchema: z.object({ id: z.string().describe("ID de la tarea a eliminar") }),
    },
    async (input) => {
      const existing = await prisma.tasks.findFirst({ where: { id: input.id, userId } });
      if (!existing) throw new Error("Task not found");

      const deleted = await prisma.tasks.deleteMany({ where: { id: input.id, userId } });
      if (deleted.count === 0) throw new Error("Task not found");
      return { content: [{ type: "text", text: `Tarea "${existing.title}" eliminada` }] };
    }
  );

  server.registerTool(
    "get_tasks_by_date",
    {
      description: "Obtiene las tareas de una fecha específica (o todas si no se especifica fecha)",
      inputSchema: z.object({
        date: z.string().optional().describe("Fecha en formato YYYY-MM-DD. Si no se especifica, devuelve todas las tareas"),
      }),
    },
    async (input) => {
      let tasks;

      if (input.date) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
        const tz = user?.timezone || "UTC";
        const { start: startOfDay, end: endOfDay } = getDateRangeUtc(input.date, tz);
        tasks = await prisma.tasks.findMany({
          where: { userId, ExecutionDate: { gte: startOfDay, lte: endOfDay } },
          orderBy: [{ ExecutionDate: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
        });
      } else {
        tasks = await prisma.tasks.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      }

      const count = tasks.length;
      const completed = tasks.filter((t) => t.completed).length;
      const text = [
        `Total: ${count} tareas (${completed} completadas, ${count - completed} activas)`,
        ...tasks.map((t) =>
          `[${t.completed ? "✓" : " "}] ${t.title}${t.priority ? ` (${t.priority})` : ""}${t.ExecutionDate ? ` — ${t.ExecutionDate.toISOString().slice(0, 10)}` : ""}`
        ),
      ].join("\n");

      return { content: [{ type: "text", text }, { type: "text", text: JSON.stringify(tasks, null, 2) }] };
    }
  );

  server.registerTool(
    "toggle_completion",
    {
      description: "Marca/desmarca una tarea como completada. Actualiza la racha del usuario.",
      inputSchema: z.object({
        id: z.string().describe("ID de la tarea"),
        completed: z.boolean().optional().default(true).describe("true para completar, false para desmarcar"),
      }),
    },
    async (input) => {
      const existing = await prisma.tasks.findFirst({ where: { id: input.id, userId } });
      if (!existing) throw new Error("Task not found");

      const task = await prisma.tasks.update({
        where: { id: input.id, userId },
        data: { completed: input.completed },
      });

      if (input.completed) {
        const profile = await prisma.playerProfile.findUnique({ where: { userId } });
        if (profile) {
          const todayStr = new Date().toISOString().slice(0, 10);
          await prisma.dailyLog.upsert({
            where: { playerId_date: { playerId: profile.id, date: todayStr } },
            create: { playerId: profile.id, date: todayStr, tasksCompleted: 1 },
            update: { tasksCompleted: { increment: 1 } },
          });
        }
      }

      return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
    }
  );

  server.registerTool(
    "import_tasks",
    {
      description: "Importa múltiples tareas de una sola vez",
      inputSchema: z.object({
        tasks: z.array(
          z.object({
            title: z.string().min(1),
            description: z.string().optional().nullable(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
            timerMinutes: z.number().int().positive().optional().nullable(),
            executionDate: z.string().optional().nullable().describe("Formato YYYY-MM-DD"),
            categoryId: z.string().optional().nullable(),
          })
        ),
      }),
    },
    async (input) => {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
      const tz = user?.timezone || "UTC";

      const tasks = input.tasks.map((t) => ({
        title: t.title,
        description: t.description ?? null,
        completed: false,
        priority: t.priority,
        timerMinutes: t.timerMinutes ?? null,
        ExecutionDate: t.executionDate ? normalizeDateUtc(t.executionDate, tz) : null,
        categoryId: t.categoryId ?? null,
        userId,
      }));

      const created = await prisma.$transaction(tasks.map((data) => prisma.tasks.create({ data })));
      return { content: [{ type: "text", text: `Importadas ${created.length} tareas correctamente` }] };
    }
  );
}
