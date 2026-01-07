// app/api/user/timezone/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUserIdFromSession } from "@/src/actions/taskActions";

export async function GET() {
  try {
    const userId = await getUserIdFromSession();

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
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { timezone } = await request.json();

    if (!timezone || typeof timezone !== "string") {
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
