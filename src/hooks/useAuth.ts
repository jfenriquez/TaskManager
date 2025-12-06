// hooks/useAuth.ts
import { useSession } from "@/src/lib/auth-client";
import type { UserWithRole } from "@/src/types/auth";

export function useAuth() {
  // Cast the session data to include our UserWithRole shape so TS knows about `role`
  const { data: session, isPending } = useSession() as {
    data?: { user?: UserWithRole } | null;
    isPending: boolean;
  };

  const hasRole = (role: string) => {
    return session?.user?.role === role;
  };

  const isAdmin = () => hasRole("ADMIN");
  const isModerator = () => hasRole("MODERATOR");

  return {
    session,
    user: session?.user as UserWithRole | undefined,
    isLoading: isPending,
    isAuthenticated: !!session,
    hasRole,
    isAdmin,
    isModerator,
  };
}
