import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

/**
 * Resuelve el userId a partir de una API key del header `x-api-key`.
 *
 * La API key es OBLIGATORIA en el transporte HTTP: no hay fallbacks a
 * variables de entorno ni al primer usuario de la BD (esos mecanismos
 * solo existen en el server stdio local: mcp/src/lib/user.ts).
 *
 * Se busca por `keyPrefix` (indizado) y se compara con bcrypt de forma
 * asíncrona para evitar bloqueo del event loop.
 */
export async function resolveUserIdByApiKey(apiKeyHeader: string | null): Promise<string> {
  if (!apiKeyHeader || typeof apiKeyHeader !== "string") {
    throw new Error("API Key requerida (header x-api-key)");
  }

  const prefix = apiKeyHeader.slice(0, 10);
  const candidates = await prisma.apiKey.findMany({
    where: { keyPrefix: prefix },
    select: { id: true, keyHash: true, userId: true },
  });

  for (const row of candidates) {
    if (await bcrypt.compare(apiKeyHeader, row.keyHash)) {
      prisma.apiKey
        .update({ where: { id: row.id }, data: { lastUsedAt: new Date() } })
        .catch(() => {});
      return row.userId;
    }
  }

  throw new Error("API Key inválida");
}
