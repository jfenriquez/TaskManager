import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/src/lib/rate-limit";

const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/unauthorized",
];

const staticFilePattern = /\.(json|mp3|ico|svg|png|jpg|jpeg|gif|webp|woff2?|ttf|otf|eot)$/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Endpoints sensibles de auth: fuerza bruta de contraseña y email bombing
  // (sign-in, sign-up, forget-password, send-verification-email, reset).
  if (pathname.startsWith("/api/auth")) {
    if (!rateLimit(`auth:${clientIp(request.headers)}`, 15)) {
      return NextResponse.json({ error: "Demasiadas solicitudes, inténtalo más tarde" }, { status: 429 });
    }
  }

  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api") ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    staticFilePattern.test(pathname)
  ) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("__Secure-better-auth.session_token") ??
    request.cookies.get("better-auth.session_token");
  const sessionData =
    request.cookies.get("__Secure-better-auth.session_data") ??
    request.cookies.get("better-auth.session_data");
  const sessionCookie = sessionToken || sessionData;

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
