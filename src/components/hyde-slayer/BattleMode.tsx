"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Zap, Skull, Heart, Crosshair, Flame, Trophy, ChevronRight, Sparkles, Loader2, Plus, Edit3, X, Check, AlertTriangle } from "lucide-react";
import { getEnemies, createEnemy, updateEnemy, simulateBattle } from "@/src/lib/server-actions/hyde-slayer/battle";
import { getPlayerProfile } from "@/src/lib/server-actions/hyde-slayer/player";

interface Enemy {
  id: string;
  name: string;
  description: string | null;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  xpReward: number;
  coinReward: number;
  isBoss: boolean;
  castleLevel: number | null;
}

const defaultCounters = [
  "¡Nada va a detenerme!",
  "El fracaso no es opcional, rendirse sí lo es.",
  "Cada caída es un paso más cerca de la victoria.",
  "Yo elijo mi actitud. Hoy decido avanzar.",
  "La incomodidad es temporal, el crecimiento es eterno.",
];

export default function BattleMode() {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [playerAttack, setPlayerAttack] = useState(10);
  const [playerDefense, setPlayerDefense] = useState(5);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState<"idle" | "detected" | "counter" | "victory" | "defeat">("idle");
  const [log, setLog] = useState<{ text: string; type: "player" | "hyde" | "system"; xp?: number }[]>([]);
  const [battleCount, setBattleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEnemy, setEditingEnemy] = useState<Enemy | null>(null);
  const [form, setForm] = useState({ name: "", description: "", level: 1, hp: 30, attack: 5, defense: 2, xpReward: 20, coinReward: 5 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [enemiesRes, profileRes] = await Promise.all([
        getEnemies(),
        getPlayerProfile(),
      ]);
      if (enemiesRes.success) setEnemies(enemiesRes.data.filter((e: Enemy) => !e.isBoss));
      if (profileRes.success) {
        setPlayerAttack(Math.max(5, Math.floor(profileRes.data.level * 3)));
        setPlayerDefense(Math.max(2, Math.floor(profileRes.data.level * 1.5)));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingEnemy(null);
    setForm({ name: "", description: "", level: 1, hp: 30, attack: 5, defense: 2, xpReward: 20, coinReward: 5 });
    setShowEditor(true);
  };

  const openEdit = (e: Enemy) => {
    setEditingEnemy(e);
    setForm({ name: e.name, description: e.description ?? "", level: e.level, hp: e.hp, attack: e.attack, defense: e.defense, xpReward: e.xpReward, coinReward: e.coinReward });
    setShowEditor(true);
  };

  const saveEnemy = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingEnemy) {
        await updateEnemy({ id: editingEnemy.id, ...form });
      } else {
        await createEnemy({ ...form, isBoss: false });
      }
      setShowEditor(false);
      setEditingEnemy(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const detectEnemy = useCallback(async (enemy: Enemy) => {
    setCurrentEnemy(enemy);
    setPhase("detected");
    setEnemyHp(enemy.hp);
    setLog((prev) => [...prev, { text: `⚠️ HYDE DETECTADO: "${enemy.name}"`, type: "hyde" }]);
  }, []);

  const attack = async () => {
    if (!currentEnemy || simulating) return;
    setSimulating(true);
    try {
      const result = await simulateBattle({
        enemyId: currentEnemy.id,
        playerAttack: playerAttack + combo * 2,
        playerDefense,
      });
      if (result.success) {
        const data = result.data;
        const isVictory = data.result === "VICTORY";
        const newEnemyHp = isVictory ? 0 : Math.max(0, currentEnemy.hp - data.damageDealt);
        const newPlayerHp = Math.max(0, 100 - data.damageTaken);
        setEnemyHp(newEnemyHp);
        setPlayerHp(newPlayerHp);
        setXp((prev) => prev + data.xpEarned);
        setCoins((prev) => prev + data.coinsEarned);
        data.log.forEach((line: string) => {
          setLog((prev) => [...prev, { text: line, type: line.includes("Atacas") ? "player" : "hyde" }]);
        });
        if (isVictory) {
          setCombo((prev) => prev + 1);
          setPhase("victory");
          setBattleCount((prev) => prev + 1);
          setLog((prev) => [...prev, { text: `🏆 ${currentEnemy.name.toUpperCase()} DERROTADO! +${data.xpEarned} XP, +${data.coinsEarned} 🪙`, type: "system", xp: data.xpEarned }]);
        } else {
          setPhase("defeat");
          setLog((prev) => [...prev, { text: "💀 Has caído... Pero puedes levantarte.", type: "system" }]);
        }
      }
    } finally {
      setSimulating(false);
    }
  };

  const nextBattle = () => {
    setPhase("idle");
    setCurrentEnemy(null);
    setPlayerHp(100);
    setCombo(0);
    setLog([]);
  };

  const reset = () => {
    setPhase("idle");
    setCurrentEnemy(null);
    setEnemyHp(100);
    setPlayerHp(100);
    setCombo(0);
    setLog([]);
    setXp(0);
    setCoins(0);
    setBattleCount(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--hs-primary)" }} />
      </div>
    );
  }

  if (!currentEnemy && phase === "idle") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Swords className="w-6 h-6" style={{ color: "var(--hs-danger)" }} />
            <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">Detector de Hyde</h2>
          </div>
          <button onClick={openCreate} className="hs-btn text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5 inline mr-1" />Nuevo patrón
          </button>
        </div>

        <p className="text-sm text-[var(--hs-text-muted)]">
          Hyde usa constantemente auto-conversaciones negativas para sabotearte.
          Detecta el patrón y responde con el contra-pensamiento adecuado.
        </p>

        {/* Recordatorio */}
        <div className="hs-card p-4 border-l-4" style={{ borderLeftColor: "var(--hs-primary)" }}>
          <p className="text-xs text-[var(--hs-text-muted)] leading-relaxed">
            <strong style={{ color: "var(--hs-text)" }}>Recuerda:</strong> Hyde constantemente usa una auto-conversación negativa para sabotearte.
            De este modo, cuando te encuentres siendo cínico, evasivo, etc., llámate la atención por ello.
            Conscientemente háblate a ti mismo al respecto.
          </p>
        </div>

        {/* Grid de patrones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {enemies.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => detectEnemy(t)}
              className="hs-card-hover p-4 text-left cursor-pointer group relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">😈</span>
                <span className="hs-badge text-[10px]" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                  Nv.{t.level}
                </span>
              </div>
              <p className="text-sm font-bold text-[var(--hs-text)] mb-1">{t.name}</p>
              {t.description && (
                <p className="text-[11px] text-[var(--hs-text-muted)] leading-relaxed line-clamp-3">
                  {t.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-[10px] text-[var(--hs-text-muted)]">
                  <Skull className="w-3 h-3" /> HP: {t.hp} · XP: {t.xpReward}
                </div>
                <span
                  onClick={(e) => { e.stopPropagation(); openEdit(t); }}
                  className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ color: "var(--hs-text-muted)" }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {battleCount > 0 && (
          <div className="flex items-center gap-4">
            <div className="hs-badge" style={{ background: "var(--hs-primary)20", color: "var(--hs-primary)" }}>
              <Trophy className="w-3 h-3 inline mr-1" />{battleCount} batallas
            </div>
            <div className="hs-badge" style={{ background: "var(--hs-gold)20", color: "var(--hs-gold)" }}>
              <Zap className="w-3 h-3 inline mr-1" />{xp} XP
            </div>
            <div className="hs-badge" style={{ background: "rgba(245,158,11,0.2)", color: "var(--hs-gold)" }}>
              🪙 {coins}
            </div>
          </div>
        )}

        {/* Editor Modal */}
        <AnimatePresence>
          {showEditor && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="hs-card p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[var(--hs-text)]">
                    {editingEnemy ? "Editar" : "Nuevo"} patrón de Hyde
                  </h3>
                  <button onClick={() => setShowEditor(false)} className="p-1 rounded-lg" style={{ color: "var(--hs-text-muted)" }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--hs-text-muted)] mb-1">Nombre del patrón</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-black/20 border border-[var(--hs-glass-border)] text-[var(--hs-text)] outline-none focus:border-[var(--hs-primary)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--hs-text-muted)] mb-1">Contra-pensamiento</label>
                    <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={3}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-black/20 border border-[var(--hs-glass-border)] text-[var(--hs-text)] outline-none focus:border-[var(--hs-primary)] resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--hs-text-muted)] mb-1">Nivel</label>
                      <input type="number" value={form.level} onChange={(e) => setForm((prev) => ({ ...prev, level: +e.target.value }))} min={1}
                        className="w-full px-3 py-2 rounded-xl text-sm bg-black/20 border border-[var(--hs-glass-border)] text-[var(--hs-text)] outline-none focus:border-[var(--hs-primary)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--hs-text-muted)] mb-1">HP</label>
                      <input type="number" value={form.hp} onChange={(e) => setForm((prev) => ({ ...prev, hp: +e.target.value }))} min={1}
                        className="w-full px-3 py-2 rounded-xl text-sm bg-black/20 border border-[var(--hs-glass-border)] text-[var(--hs-text)] outline-none focus:border-[var(--hs-primary)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--hs-text-muted)] mb-1">Ataque</label>
                      <input type="number" value={form.attack} onChange={(e) => setForm((prev) => ({ ...prev, attack: +e.target.value }))} min={0}
                        className="w-full px-3 py-2 rounded-xl text-sm bg-black/20 border border-[var(--hs-glass-border)] text-[var(--hs-text)] outline-none focus:border-[var(--hs-primary)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--hs-text-muted)] mb-1">Defensa</label>
                      <input type="number" value={form.defense} onChange={(e) => setForm((prev) => ({ ...prev, defense: +e.target.value }))} min={0}
                        className="w-full px-3 py-2 rounded-xl text-sm bg-black/20 border border-[var(--hs-glass-border)] text-[var(--hs-text)] outline-none focus:border-[var(--hs-primary)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--hs-text-muted)] mb-1">XP reward</label>
                      <input type="number" value={form.xpReward} onChange={(e) => setForm((prev) => ({ ...prev, xpReward: +e.target.value }))} min={0}
                        className="w-full px-3 py-2 rounded-xl text-sm bg-black/20 border border-[var(--hs-glass-border)] text-[var(--hs-text)] outline-none focus:border-[var(--hs-primary)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--hs-text-muted)] mb-1">Monedas</label>
                      <input type="number" value={form.coinReward} onChange={(e) => setForm((prev) => ({ ...prev, coinReward: +e.target.value }))} min={0}
                        className="w-full px-3 py-2 rounded-xl text-sm bg-black/20 border border-[var(--hs-glass-border)] text-[var(--hs-text)] outline-none focus:border-[var(--hs-primary)]" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <button onClick={() => setShowEditor(false)} className="hs-btn-ghost flex-1">Cancelar</button>
                  <button onClick={saveEnemy} disabled={saving || !form.name.trim()} className="hs-btn flex-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 inline mr-1" />}
                    {editingEnemy ? "Actualizar" : "Crear"} patrón
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Swords className="w-6 h-6" style={{ color: "var(--hs-danger)" }} />
          <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">¡Combate!</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hs-badge" style={{ background: "var(--hs-gold)20", color: "var(--hs-gold)" }}>
            <Zap className="w-3 h-3 inline mr-1" /> {xp} XP
          </div>
          {combo > 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="hs-badge" style={{ background: "var(--hs-danger)20", color: "var(--hs-danger)" }}>
              <Flame className="w-3 h-3 inline mr-1" />{combo}x Combo
            </motion.div>
          )}
        </div>
      </div>

      <div className="hs-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 rounded-full"
              style={{ background: phase === "victory" ? "var(--hs-gold)" : "var(--hs-danger)", left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Skull className="w-5 h-5" style={{ color: "var(--hs-danger)" }} />
              <span className="text-sm font-bold" style={{ color: "var(--hs-danger)" }}>HYDE — {currentEnemy?.name}</span>
            </div>
            <div className="hs-progress-bar h-4">
              <motion.div className="hs-progress-fill h-full" animate={{ width: `${(enemyHp / (currentEnemy?.hp ?? 100)) * 100}%` }} transition={{ duration: 0.3 }}
                style={{ background: `linear-gradient(90deg, #dc2626, ${enemyHp > 50 ? "#ef4444" : "#f97316"})` }}
              />
            </div>
            <p className="text-xs font-mono text-[var(--hs-text-muted)] mt-1">
              HP: {enemyHp}/{currentEnemy?.hp ?? 100}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5" style={{ color: "var(--hs-success)" }} />
              <span className="text-sm font-bold" style={{ color: "var(--hs-success)" }}>TÚ — EL HÉROE</span>
            </div>
            <div className="hs-progress-bar h-4">
              <motion.div className="hs-progress-fill h-full" animate={{ width: `${playerHp}%` }} transition={{ duration: 0.3 }}
                style={{ background: `linear-gradient(90deg, var(--hs-success), ${playerHp > 50 ? "#34d399" : "#f59e0b"})` }}
              />
            </div>
            <p className="text-xs font-mono text-[var(--hs-text-muted)] mt-1">HP: {playerHp}/100 · Combo: {combo}x</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <motion.div key={currentEnemy?.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block">
            <div className="px-8 py-6 rounded-2xl text-lg font-bold"
              style={{ background: "rgba(0,0,0,0.4)", border: "2px solid var(--hs-danger)", boxShadow: "0 0 40px rgba(239,68,68,0.2)" }}
            >
              &ldquo;{currentEnemy?.name}&rdquo;
            </div>
            {currentEnemy?.description && (
              <p className="text-xs text-[var(--hs-text-muted)] mt-3 max-w-md mx-auto leading-relaxed">
                {currentEnemy.description}
              </p>
            )}
            <p className="text-xs text-[var(--hs-text-muted)] mt-2">
              Nivel {currentEnemy?.level} · XP: {currentEnemy?.xpReward} · 🪙: {currentEnemy?.coinReward}
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {(phase === "detected" || phase === "counter") && currentEnemy && (
            <motion.div key="actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <p className="text-xs font-bold text-[var(--hs-text)] uppercase tracking-wider text-center mb-4">
                Selecciona tu contraataque:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {(currentEnemy.description ? [currentEnemy.description] : defaultCounters.slice(0, 1)).map((c, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={attack}
                    disabled={simulating}
                    className="hs-card p-4 flex items-center justify-between cursor-pointer group text-left"
                    style={{ borderColor: "var(--hs-glass-border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Crosshair className="w-4 h-4" style={{ color: "var(--hs-secondary)" }} />
                      <span className="text-sm font-medium text-[var(--hs-text)]">&ldquo;{c}&rdquo;</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {simulating ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--hs-xp-color)" }} />
                      ) : (
                        <span className="font-mono font-bold" style={{ color: "var(--hs-xp-color)" }}>+{currentEnemy.xpReward} XP</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[var(--hs-text-muted)]" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "victory" && (
            <motion.div key="victory" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="inline-block mb-4">
                <Trophy className="w-16 h-16" style={{ color: "var(--hs-gold)" }} />
              </motion.div>
              <h3 className="text-3xl font-black mb-2" style={{ color: "var(--hs-gold)" }}>¡VICTORIA!</h3>
              <p className="text-sm text-[var(--hs-text-muted)] mb-6">Has derrotado a {currentEnemy?.name}. La disciplina se fortalece.</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={nextBattle} className="hs-btn"><Swords className="w-4 h-4 inline mr-2" />Siguiente batalla</button>
                <button onClick={reset} className="hs-btn-ghost">Salir</button>
              </div>
            </motion.div>
          )}

          {phase === "defeat" && (
            <motion.div key="defeat" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Skull className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--hs-danger)" }} />
              </motion.div>
              <h3 className="text-2xl font-black mb-2" style={{ color: "var(--hs-danger)" }}>HAS CAÍDO</h3>
              <p className="text-sm text-[var(--hs-text-muted)] mb-6">Pero cada derrota es una lección. Levántate y continúa.</p>
              <button onClick={reset} className="hs-btn"><Sparkles className="w-4 h-4 inline mr-1" />Intentar de nuevo</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {log.length > 0 && (
        <div className="hs-card p-4 max-h-48 overflow-y-auto">
          <p className="text-xs font-bold text-[var(--hs-text)] uppercase tracking-wider mb-3">Bitácora de batalla</p>
          <div className="space-y-1">
            {log.map((entry, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="text-xs py-1 flex items-center gap-2"
                style={{ color: entry.type === "player" ? "var(--hs-success)" : entry.type === "hyde" ? "var(--hs-danger)" : "var(--hs-gold)" }}
              >
                {entry.xp && <span className="font-mono font-bold" style={{ color: "var(--hs-xp-color)" }}>+{entry.xp}XP</span>}
                <span>{entry.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
