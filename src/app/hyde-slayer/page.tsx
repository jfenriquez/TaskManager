"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import HydeSlayerDashboard from "@/src/components/hyde-slayer/HydeSlayerDashboard";

export default function HydeSlayerPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--hs-bg)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 animate-pulse"
            style={{
              background: "linear-gradient(135deg, var(--hs-primary), var(--hs-secondary))",
            }}
          />
          <p className="text-sm font-medium" style={{ color: "var(--hs-text-muted)" }}>
            Cargando Hyde Slayer...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <HydeSlayerDashboard />;
}
