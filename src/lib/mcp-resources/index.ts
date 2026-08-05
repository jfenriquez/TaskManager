import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { prisma } from "@/src/lib/prisma";
import { getDateRangeUtc } from "../mcp-utils/date";

export function registerResources(server: McpServer, userId: string) {
  server.registerResource(
    "task",
    new ResourceTemplate("task://{id}", { list: undefined }),
    {
      description: "Obtiene una tarea específica por su ID",
      mimeType: "application/json",
    },
    async (uri, vars) => {
      const task = await prisma.tasks.findFirst({ where: { id: vars.id as string, userId } });
      if (!task) {
        return { contents: [{ uri: uri.href, mimeType: "text/plain", text: "Task not found" }] };
      }
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(task, null, 2) }] };
    }
  );

  server.registerResource(
    "tasks-today",
    "tasks://today",
    {
      description: "Tareas del día de hoy del usuario autenticado",
      mimeType: "application/json",
    },
    async (uri) => {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
      const tz = user?.timezone || "UTC";
      const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: tz });
      const { start, end } = getDateRangeUtc(todayStr, tz);

      const tasks = await prisma.tasks.findMany({
        where: { userId, OR: [{ ExecutionDate: { gte: start, lte: end } }, { ExecutionDate: null }] },
        orderBy: [{ ExecutionDate: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
      });

      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(tasks, null, 2) }] };
    }
  );

  server.registerResource(
    "tasks-by-date",
    new ResourceTemplate("tasks://date/{date}", { list: undefined }),
    {
      description: "Tareas de una fecha específica (formato YYYY-MM-DD en la URL)",
      mimeType: "application/json",
    },
    async (uri, vars) => {
      const dateStr = vars.date as string;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
      const tz = user?.timezone || "UTC";
      const { start, end } = getDateRangeUtc(dateStr, tz);

      const tasks = await prisma.tasks.findMany({
        where: { userId, ExecutionDate: { gte: start, lte: end } },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      });

      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(tasks, null, 2) }] };
    }
  );

  server.registerResource(
    "categories-list",
    "categories://",
    {
      description: "Lista de todas las categorías del usuario",
      mimeType: "application/json",
    },
    async () => {
      const categories = await prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } });
      return { contents: [{ uri: "categories://", mimeType: "application/json", text: JSON.stringify(categories, null, 2) }] };
    }
  );

  server.registerResource(
    "streak-current",
    "streak://current",
    {
      description: "Datos actuales de racha del usuario",
      mimeType: "application/json",
    },
    async () => {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { streak: true } });
      return { contents: [{ uri: "streak://current", mimeType: "application/json", text: JSON.stringify({ currentStreak: user?.streak ?? 0 }, null, 2) }] };
    }
  );
}
