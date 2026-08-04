import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { prisma } from "../lib/prisma.js";
import { getUserId } from "../lib/user.js";

const DEFAULT_CATEGORIES = [
  { name: "Trabajo", color: "#ef4444" },
  { name: "Tareas del hogar", color: "#14b8a6" },
  { name: "Ocio y entretenimiento", color: "#f59e0b" },
  { name: "Comidas y bebidas", color: "#f97316" },
  { name: "Sueño", color: "#6366f1" },
  { name: "Desplazamientos", color: "#8b5cf6" },
  { name: "Estudio", color: "#10b981" },
  { name: "Cuidado personal", color: "#ec4899" },
];

async function ensureDefaultCategories(userId: string) {
  const count = await prisma.category.count({ where: { userId } });
  if (count > 0) return;
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId })),
  });
}

export function registerCategoryTools(server: McpServer) {
  server.registerTool(
    "get_categories",
    {
      description: "Obtiene todas las categorías del usuario (crea las 8 por defecto si no existen)",
      inputSchema: z.object({}),
    },
    async () => {
      const userId = await getUserId();
      await ensureDefaultCategories(userId);
      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });
      const text = categories
        .map((c) => `${c.name} (${c.color}) [${c.id}]`)
        .join("\n");
      return {
        content: [
          { type: "text", text: text || "Sin categorías" },
          { type: "text", text: JSON.stringify(categories, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    "create_category",
    {
      description: "Crea una nueva categoría",
      inputSchema: z.object({
        name: z.string().min(1, "El nombre es obligatorio"),
        color: z.string().optional().default("#3b82f6").describe("Color HEX (ej: #ff0000)"),
      }),
    },
    async (input) => {
      const userId = await getUserId();
      const category = await prisma.category.create({
        data: { name: input.name, color: input.color, userId },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(category, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_category",
    {
      description: "Actualiza una categoría existente",
      inputSchema: z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        color: z.string().optional(),
      }),
    },
    async (input) => {
      const userId = await getUserId();
      const data: Record<string, string> = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.color !== undefined) data.color = input.color;
      const category = await prisma.category.update({
        where: { id: input.id, userId },
        data,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(category, null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_category",
    {
      description: "Elimina una categoría. Las tareas asociadas quedan sin categoría.",
      inputSchema: z.object({
        id: z.string(),
      }),
    },
    async (input) => {
      const userId = await getUserId();
      await prisma.tasks.updateMany({
        where: { categoryId: input.id, userId },
        data: { categoryId: null },
      });
      const category = await prisma.category.delete({
        where: { id: input.id, userId },
      });
      return {
        content: [{ type: "text", text: `Categoría "${category.name}" eliminada` }],
      };
    }
  );
}
