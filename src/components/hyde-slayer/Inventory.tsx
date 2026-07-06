"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Backpack, Coins, CheckCircle, Gift, PlusCircle, Loader2, Trophy } from "lucide-react";
import { getPlayerProfile } from "@/src/lib/server-actions/hyde-slayer/player";
import Achievements from "./Achievements";

interface Reward {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

const REWARDS: Reward[] = [
  { id: "reward_cena", name: "Cena favorita", description: "Prepárate o pide tu cena favorita sin culpa", price: 30, icon: "🍽️" },
  { id: "reward_jugar", name: "Jugar 15 min", description: "Tómate un descanso y juega lo que más te guste", price: 15, icon: "🎮" },
  { id: "reward_pelicula", name: "Ver una película", description: "Elige una película y disfrútala de principio a fin", price: 50, icon: "🎬" },
  { id: "reward_serie", name: "Ver un capítulo", description: "Date el gusto de ver un episodio de tu serie favorita", price: 20, icon: "📺" },
  { id: "reward_dulce", name: "Dulce o antojo", description: "Cómprese ese antojo que tanto se te antoja", price: 10, icon: "🍫" },
  { id: "reward_paseo", name: "Salir a caminar", description: "Despeja la mente con un paseo al aire libre", price: 25, icon: "🚶" },
  { id: "reward_libro", name: "Comprar un libro", description: "Invierte en conocimiento con un libro nuevo", price: 80, icon: "📚" },
  { id: "reward_siesta", name: "Siesta de 20 min", description: "Recarga energías con una siesta reparadora", price: 20, icon: "😴" },
  { id: "reward_musica", name: "Escuchar música", description: "Ponte tus audífonos y disfruta de tu playlist favorita", price: 10, icon: "🎵" },
  { id: "reward_redes", name: "15 min de redes", description: "Un vistazo rápido a tus redes sociales sin culpa", price: 15, icon: "📱" },
  { id: "reward_baño", name: "Baño relajante", description: "Date un baño caliente para relajar el cuerpo y la mente", price: 40, icon: "🛁" },
  { id: "reward_amigo", name: "Llamar a un amigo", description: "Ponte al día con esa persona especial", price: 15, icon: "📞" },
];

export default function Inventory() {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"rewards" | "achievements">("rewards");

  useEffect(() => {
    async function load() {
      try {
        const res = await getPlayerProfile();
        if (res.success) setCoins(res.data.coins);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const claim = async (reward: Reward) => {
    if (coins < reward.price || claimed.has(reward.id)) return;
    setClaimingId(reward.id);
    await new Promise((r) => setTimeout(r, 500));
    setClaimed((prev) => new Set(prev).add(reward.id));
    setCoins((prev) => prev - reward.price);
    setClaimingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--hs-primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("rewards")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === "rewards" ? "text-white" : "text-[var(--hs-text-muted)]"}`}
          style={{
            background: tab === "rewards" ? "linear-gradient(135deg, var(--hs-primary), var(--hs-accent))" : "rgba(255,255,255,0.05)",
            border: `1px solid ${tab === "rewards" ? "transparent" : "var(--hs-glass-border)"}`,
          }}
        >
          <Gift className="w-3.5 h-3.5 inline mr-1.5" />
          Recompensas
        </button>
        <button
          onClick={() => setTab("achievements")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === "achievements" ? "text-white" : "text-[var(--hs-text-muted)]"}`}
          style={{
            background: tab === "achievements" ? "linear-gradient(135deg, var(--hs-gold), #fbbf24)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${tab === "achievements" ? "transparent" : "var(--hs-glass-border)"}`,
          }}
        >
          <Trophy className="w-3.5 h-3.5 inline mr-1.5" />
          Logros
        </button>
      </div>

      {tab === "achievements" ? (
        <Achievements />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6" style={{ color: "var(--hs-gold)" }} />
              <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">Recompensas</h2>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" style={{ color: "var(--hs-gold)" }} />
              <span className="text-xl font-black" style={{ color: "var(--hs-gold)" }}>{coins}</span>
              <span className="text-xs text-[var(--hs-text-muted)]">monedas</span>
            </div>
          </div>

          <p className="text-sm text-[var(--hs-text-muted)]">
            Canjea tus monedas de disciplina por recompensas. Pequeños premios que te ayudan a mantener la motivación.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REWARDS.map((reward, i) => {
              const isClaimed = claimed.has(reward.id);
              const canAfford = coins >= reward.price;
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="hs-card p-5 flex flex-col"
                  style={{
                    opacity: isClaimed ? 0.6 : 1,
                    borderColor: isClaimed ? "var(--hs-success)" : "var(--hs-glass-border)",
                  }}
                >
                  <div className="text-3xl mb-3">{reward.icon}</div>
                  <h4 className="text-sm font-bold text-[var(--hs-text)] mb-1">{reward.name}</h4>
                  <p className="text-xs text-[var(--hs-text-muted)] mb-4 flex-1">{reward.description}</p>

                  {isClaimed ? (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--hs-success)" }}>
                      <CheckCircle className="w-3.5 h-3.5" /> Canjeado
                    </div>
                  ) : (
                    <button
                      onClick={() => claim(reward)}
                      disabled={!canAfford || claimingId === reward.id}
                      className={`hs-btn text-xs py-2 w-full ${!canAfford ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {claimingId === reward.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <PlusCircle className="w-3.5 h-3.5 inline mr-1" />
                      )}
                      {reward.price} monedas
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {claimed.size > 0 && (
            <div className="hs-card p-4">
              <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-3">
                <CheckCircle className="w-4 h-4 inline mr-1" style={{ color: "var(--hs-success)" }} />
                Canjeados hoy
              </h3>
              <div className="flex flex-wrap gap-2">
                {REWARDS.filter((r) => claimed.has(r.id)).map((r) => (
                  <span key={r.id} className="hs-badge text-xs" style={{ background: "rgba(16,185,129,0.15)", color: "var(--hs-success)" }}>
                    {r.icon} {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
