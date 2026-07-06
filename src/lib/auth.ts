import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Role } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { sendEmail } from "@/src/lib/email";

const appUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  secret: process.env.BETTER_AUTH_SECRET!,
  url: appUrl,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: "Restablece tu contraseña",
        html: `
          <h1>Restablecimiento de contraseña</h1>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;">
            Restablecer contraseña
          </a>
          <p style="color:#6b7280;font-size:14px;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este mensaje.</p>
        `,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      await sendEmail({
        to: user.email,
        subject: "Verifica tu cuenta",
        html: `
          <h1>¡Bienvenido!</h1>
          <p>Gracias por registrarte. Para activar tu cuenta, verifica tu email haciendo clic en el siguiente enlace:</p>
          <a href="${appUrl}/verify-email?token=${token}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;">
            Verificar email
          </a>
          <p style="color:#6b7280;font-size:14px;">Si no creaste una cuenta, ignora este mensaje.</p>
        `,
      });
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
        defaultValue: "USER",
        enum: ["USER", "ADMIN", "MODERATOR"],
      },
    },
  },
});

export async function assignInitialRole(userId: string) {
  const usersCount = await prisma.user.count();
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!current || current.role !== Role.USER) return;

  if (usersCount === 1) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: Role.ADMIN },
    });
  } else if (current.email.endsWith("@tuempresa.com")) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: Role.MODERATOR },
    });
  }
}


