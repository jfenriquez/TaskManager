import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { clientIp, rateLimit } from "@/src/lib/rate-limit";

const MAX_NAME_LENGTH = 50;
const RATE_LIMIT = 10;

async function generateApiKey(): Promise<{ raw: string; prefix: string; hash: string }> {
  const raw = `sk_${randomBytes(32).toString("hex")}`;
  const prefix = raw.slice(0, 10);
  const hash = await bcrypt.hash(raw, 10);
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
      console.error(`[api/keys] ${req.method} ${req.url}:`, err);
      return respond({ error: "Error interno del servidor" }, 500);
    }
  };
}

const POST = handler(async (req) => {
  const ip = clientIp(req.headers);
  if (!rateLimit(`keys:post:${ip}`, RATE_LIMIT)) {
    return respond({ error: "Demasiadas solicitudes, inténtalo más tarde" }, 429);
  }

  const user = await getSessionUser(req);
  if (!user) return respond({ error: "No autenticado" }, 401);

  const body = await req.json();
  const { name } = body;
  if (!name || typeof name !== "string" || name.trim() === "") {
    return respond({ error: "El nombre es obligatorio" }, 400);
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return respond({ error: `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres` }, 400);
  }

  const { raw, prefix, hash } = await generateApiKey();

  const key = await prisma.apiKey.create({
    data: { name: name.trim(), keyPrefix: prefix, keyHash: hash, userId: user.id },
    select: { id: true, name: true, keyPrefix: true, createdAt: true },
  });

  const res = respond({ ...key, key: raw }, 201);
  res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  return res;
});

const GET = handler(async (req) => {
  const user = await getSessionUser(req);
  if (!user) return respond({ error: "No autenticado" }, 401);

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true },
    orderBy: { createdAt: "desc" },
  });

  return respond(keys);
});

const DELETE = handler(async (req) => {
  const ip = clientIp(req.headers);
  if (!rateLimit(`keys:delete:${ip}`, RATE_LIMIT)) {
    return respond({ error: "Demasiadas solicitudes, inténtalo más tarde" }, 429);
  }

  const user = await getSessionUser(req);
  if (!user) return respond({ error: "No autenticado" }, 401);

  const body = await req.json();
  const { id } = body;
  if (!id || typeof id !== "string") return respond({ error: "ID requerido" }, 400);

  const existing = await prisma.apiKey.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return respond({ error: "API Key no encontrada" }, 404);
  }

  await prisma.apiKey.delete({ where: { id } });
  return respond({ success: true });
});

export { GET, POST, DELETE };
