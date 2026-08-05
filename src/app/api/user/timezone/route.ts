// app/api/user/timezone/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUserId } from "@/src/lib/auth-utils";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      select: { timezone: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      timezone: user.timezone || "America/Bogota",
    });
  } catch (error) {
    console.error("Error obteniendo timezone:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { timezone } = await request.json();

    if (!timezone || typeof timezone !== "string") {
      return NextResponse.json({ error: "Timezone inválido" }, { status: 400 });
    }
    if (timezone.length > 64) {
      return NextResponse.json({ error: "Timezone inválido" }, { status: 400 });
    }
    // Solo se aceptan zonas IANA válidas: evita persistir strings arbitrarios
    // que rompan toLocaleDateString({ timeZone }) en rachas y tareas por día.
    const validTimezones = Intl.supportedValuesOf("timeZone");
    if (!validTimezones.includes(timezone)) {
      return NextResponse.json({ error: "Timezone inválido" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId.toString() },
      data: { timezone },
      select: { timezone: true },
    });

    return NextResponse.json({
      success: true,
      timezone: user.timezone,
    });
  } catch (error) {
    console.error("Error actualizando timezone:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
