import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

let prisma: PrismaClient | null = null;

async function connectWithRetry(retries = 5, delay = 2000): Promise<PrismaClient> {
  const client = new PrismaClient({ log: ["error", "warn"] });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.$connect();
      return client;
    } catch (err) {
      if (attempt === retries) {
        await client.$disconnect();
        throw err;
      }
      console.warn(`[DB] Connection attempt ${attempt}/${retries} failed, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay * attempt));
    }
  }
  throw new Error("Unreachable");
}

async function getDb(): Promise<PrismaClient> {
  if (!prisma) {
    prisma = await connectWithRetry();
  }
  return prisma;
}

export const TEST_PASSWORD = "TestPass123!";
const TEST_EMAIL_PREFIX = "e2e-test";

export function generateTestEmail(): string {
  const random = crypto.randomBytes(4).toString("hex");
  return `${TEST_EMAIL_PREFIX}-${random}@example.com`;
}

export async function verifyUserEmail(email: string): Promise<void> {
  const db = await getDb();
  await db.user.update({
    where: { email },
    data: { emailVerified: true },
  });
}

export async function cleanupAllTestUsers(): Promise<void> {
  const db = await getDb();
  const users = await db.user.findMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX } },
  });

  for (const u of users) {
    await db.account.deleteMany({ where: { userId: u.id } });
    await db.session.deleteMany({ where: { userId: u.id } });
    await db.tasks.deleteMany({ where: { userId: u.id } });
    await db.category.deleteMany({ where: { userId: u.id } });
    await db.verification.deleteMany({ where: { identifier: u.email } });
    await db.user.delete({ where: { id: u.id } });
  }
}

export async function disconnectDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
