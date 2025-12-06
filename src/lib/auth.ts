import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient, Role } from "@prisma/client";
import { Resend } from "resend";
import { createAuthMiddleware } from "better-auth/api";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // 👇 Aquí van los hooks de eventos
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }
      if (!ctx.body?.email.endsWith("@example.com")) {
        throw new APIError("BAD_REQUEST", {
          message: "Email must end with @example.com",
        });
      }
    }),
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  url: process.env.BETTER_AUTH_URL!,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      await sendVerificationEmail(
        user.email,
        `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}`
      );
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        //defaultValue: "USER",
        enum: ["USER", "ADMIN", "MODERATOR"],
      },
    },
  },
});

async function assignRole(user: any) {
  try {
    console.log("🟢 [assignRole] Iniciando asignación de rol...");
    console.log("📩 Usuario recibido:", JSON.stringify(user, null, 2));

    // 1️⃣ Verificar cuántos usuarios hay en total
    const usersCount = await prisma.user.count();
    console.log("👥 Total de usuarios en DB:", usersCount);

    // 2️⃣ Buscar el usuario actual en la DB
    const current = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!current) {
      console.warn("⚠️ No se encontró el usuario en la base de datos.");
      return;
    }

    console.log("🧾 Usuario actual en DB:", {
      id: current.id,
      email: current.email,
      role: current.role,
    });

    // 3️⃣ Solo reasigna si sigue con el valor por defecto
    if (current.role === Role.USER) {
      console.log(
        "🔄 Usuario con rol por defecto (USER), evaluando reasignación..."
      );

      if (usersCount === 1) {
        console.log("👑 Primer usuario detectado → asignando ADMIN...");
        await prisma.user.update({
          where: { id: user.id },
          data: { role: Role.ADMIN },
        });
        console.log("✅ Rol ADMIN asignado correctamente.");
      } else if (user.email?.endsWith("@tuempresa.com")) {
        console.log("🟠 Correo corporativo detectado → asignando MODERATOR...");
        await prisma.user.update({
          where: { id: user.id },
          data: { role: Role.MODERATOR },
        });
        console.log("✅ Rol MODERATOR asignado correctamente.");
      } else {
        console.log("ℹ️ No cumple condiciones especiales → mantiene USER.");
      }
    } else {
      console.log(
        `⏭️ Usuario ya tiene rol diferente (${current.role}) → no se cambia.`
      );
    }

    // 4️⃣ Verificar el rol final en la base de datos
    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, role: true },
    });

    console.log("📊 Rol final en DB:", updated);

    console.log("🟢 [assignRole] Finalizado correctamente.");
  } catch (error: any) {
    console.error("❌ Error en assignRole:", error.message);
    console.error(error);
  }
}

async function sendVerificationEmail(email: string, verificationUrl: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verifica tu cuenta",
    html: `
      <h1>¡Bienvenido!</h1>
      <p>Por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
      <a href="${verificationUrl}">Verificar Email</a>
    `,
  });
}
