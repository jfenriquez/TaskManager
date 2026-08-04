import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = `sk_${randomBytes(32).toString("hex")}`;
  const prefix = raw.slice(0, 10);
  const hash = bcrypt.hashSync(raw, 10);
  return { raw, prefix, hash };
}

function respond(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

async function getSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

function handler(fn: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await fn(req);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[api/keys] ${req.method} ${req.url}:`, err);
      return respond({ error: msg }, 500);
    }
  };
}

export const GET = handler(async (req) => {
  const user = await getSessionUser(req);
  if (!user) return respond({ error: "No autenticado" }, 401);

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true },
    orderBy: { createdAt: "desc" },
  });

  return respond(keys);
});

export const POST = handler(async (req) => {
  const user = await getSessionUser(req);
  if (!user) return respond({ error: "No autenticado" }, 401);

  const body = await req.json();
  const { name } = body;
  if (!name || typeof name !== "string" || name.trim() === "") {
    return respond({ error: "El nombre es obligatorio" }, 400);
  }

  const { raw, prefix, hash } = generateApiKey();

  const key = await prisma.apiKey.create({
    data: { name: name.trim(), keyPrefix: prefix, keyHash: hash, userId: user.id },
    select: { id: true, name: true, keyPrefix: true, createdAt: true },
  });

  return respond({ ...key, key: raw });
});

export const DELETE = handler(async (req) => {
  const user = await getSessionUser(req);
  if (!user) return respond({ error: "No autenticado" }, 401);

  const body = await req.json();
  const { id } = body;
  if (!id) return respond({ error: "ID requerido" }, 400);

  const existing = await prisma.apiKey.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return respond({ error: "API Key no encontrada" }, 404);
  }

  await prisma.apiKey.delete({ where: { id } });
  return respond({ success: true });
});
