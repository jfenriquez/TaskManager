import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
