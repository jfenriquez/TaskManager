import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de tareas...");

  // Crear (o asegurar) un usuario semilla con id `user1` para asociar las tareas
  const seedUserId = randomUUID();
  const seedEmail = "user1@example.com";
  const seedPassword = "password123"; // contraseña de desarrollo

  await prisma.user.create({
    data: {
      id: seedUserId,
      name: "Seed User",
      email: seedEmail,
      image: null,
      emailVerified: true,
      role: "USER",
    },
  });

  const hashed = await hashPassword(seedPassword);
  // Asegurar que exista un Account con provider 'credentials' que almacene la contraseña
  const existingAccount = await prisma.account.findFirst({
    where: { userId: seedUserId, providerId: "credential" },
  });
  if (!existingAccount) {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        userId: seedUserId,
        accountId: seedEmail,
        providerId: "credential",
        password: hashed,
      },
    });
    console.log(`🔐 Cuenta creada (credentials) para ${seedEmail}`);
  } else {
    console.log(
      `🔐 Cuenta (credentials) existente encontrada para ${seedEmail}`
    );
  }

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Sueño", color: "#6366f1", userId: seedUserId } }),
    prisma.category.create({ data: { name: "Trabajo", color: "#ef4444", userId: seedUserId } }),
    prisma.category.create({ data: { name: "estudio", color: "#10b981", userId: seedUserId } }),
    prisma.category.create({ data: { name: "Ocio y entretenimiento", color: "#f59e0b", userId: seedUserId } }),
    prisma.category.create({ data: { name: "Cuidado personal", color: "#ec4899", userId: seedUserId } }),
    prisma.category.create({ data: { name: "Comidas y bebidas", color: "#f97316", userId: seedUserId } }),
    prisma.category.create({ data: { name: "Tareas del hogar", color: "#14b8a6", userId: seedUserId } }),
    prisma.category.create({ data: { name: "Desplazamientos", color: "#8b5cf6", userId: seedUserId } }),
  ]);

  await prisma.tasks.createMany({
    data: [
      {
        title: "Comprar alimentos",
        description: "Ir al supermercado y comprar frutas, verduras y leche",
        completed: false,
        userId: seedUserId,
        categoryId: categories[5].id,
      },
      {
        title: "Estudiar Next.js 15",
        description: "Repasar conceptos nuevos de App Router y Server Actions",
        completed: false,
        userId: seedUserId,
        categoryId: categories[2].id,
      },
      {
        title: "Ejercicio diario",
        description: "Salir a caminar 30 minutos",
        completed: true,
        userId: seedUserId,
        categoryId: categories[4].id,
      },
      {
        title: "Leer documentación de Prisma",
        description: "Revisar seeding y relaciones entre modelos",
        completed: false,
        userId: seedUserId,
        categoryId: categories[2].id,
      },
    ],
  });

  console.log("✅ Se han insertado categorías y tareas de ejemplo correctamente.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error al ejecutar el seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
