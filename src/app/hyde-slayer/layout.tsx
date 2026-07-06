"use client";

import { PlayerStatsProvider } from "@/src/context/PlayerStatsContext";

export default function HydeSlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlayerStatsProvider>{children}</PlayerStatsProvider>;
}
