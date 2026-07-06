import { PrismaClient } from "@prisma/client";

// 👇 Se define el tipo incluyendo "undefined" para evitar errores de inicialización
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
  });

// 👇 Se guarda la instancia global solo en desarrollo (importante para hot-reload)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
