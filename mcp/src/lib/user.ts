import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";

/**
 * MODO LOCAL (stdio) — Clausula para Claude Desktop/Cursor.
 * Este transporte resuelve la identidad por env/primer usuario INTENCIONALMENTE,
 * porque es un proceso local de confianza. NUNCA debe usarse como servicio:
 * si se detecta NODE_ENV=production, se aborta para evitar que estos fallbacks
 * queden expuestos como bypass de autenticación.
 */
if (process.env.NODE_ENV === "production") {
  throw new Error(
    "El servidor MCP stdio no debe ejecutarse en producción. Usa el endpoint HTTP /api/mcp con x-api-key."
  );
}

let cachedUserId: string | null = null;

/**
 * Set the user ID for the current HTTP request context.
 * Overrides env-based resolution. Pass null to clear.
 */
export function setHttpUserId(id: string | null): void {
  cachedUserId = id;
}

export async function getUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  // 1. Try MCP_API_KEY env var
  const apiKey: string | undefined = process.env.MCP_API_KEY;
  if (apiKey) {
    const keys = await prisma.apiKey.findMany({ select: { id: true, keyHash: true, userId: true } });
    for (const row of keys) {
      if (await bcrypt.compare(apiKey, row.keyHash)) {
        cachedUserId = row.userId;
        prisma.apiKey.update({ where: { id: row.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
        return cachedUserId;
      }
    }
    throw new Error(
      "API Key inválida. Verifica MCP_API_KEY en el .env o genera una nueva desde el perfil."
    );
  }

  // 2. Fallback: MCP_USER_EMAIL
  const email: string | undefined = process.env.MCP_USER_EMAIL;
  const userId: string | undefined = process.env.MCP_USER_ID;

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new Error(
        `Usuario con email "${email}" no encontrado. Verifica MCP_USER_EMAIL en el .env`
      );
    }
    cachedUserId = user.id;
    return cachedUserId;
  }

  // 3. Fallback: MCP_USER_ID
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new Error(
        `Usuario con id "${userId}" no encontrado. Verifica MCP_USER_ID en el .env`
      );
    }
    cachedUserId = user.id;
    return cachedUserId;
  }

  // 4. Fallback: primer usuario de la BD
  const firstUser = await prisma.user.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!firstUser) {
    throw new Error(
      "No hay usuarios en la BD. Configura MCP_API_KEY, MCP_USER_EMAIL o MCP_USER_ID en el .env"
    );
  }
  cachedUserId = firstUser.id;
  return cachedUserId;
}
