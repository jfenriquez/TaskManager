"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getPlayerProfile } from "@/src/lib/server-actions/hyde-slayer/player";

export interface PlayerStats {
  level: number;
  xp: number;
  xpMax: number;
  streak: number;
  coins: number;
  discipline: number;
  playerName: string;
}

interface PlayerStatsContextType {
  stats: PlayerStats | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PlayerStatsContext = createContext<PlayerStatsContextType>({
  stats: null,
  loading: true,
  refresh: async () => {},
});

export function PlayerStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await getPlayerProfile();
      if (result.success) {
        setStats({
          level: result.data.level,
          xp: result.data.xp,
          xpMax: result.data.level * 200,
          streak: result.data.streak,
          coins: result.data.coins,
          discipline: result.data.discipline,
          playerName: result.data.playerName,
        });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PlayerStatsContext.Provider value={{ stats, loading, refresh }}>
      {children}
    </PlayerStatsContext.Provider>
  );
}

export function usePlayerStats() {
  return useContext(PlayerStatsContext);
}
