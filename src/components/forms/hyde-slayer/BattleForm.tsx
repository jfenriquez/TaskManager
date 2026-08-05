"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Loader2, ScrollText } from "lucide-react";
import {
  simulateBattleSchema,
  type SimulateBattleInput,
} from "@/src/lib/validations/hyde-slayer";
import { simulateBattle } from "@/src/lib/server-actions/hyde-slayer/battle";
import { FormSelect } from "@/src/components/ui/form/FormSelect";
import { useFormSubmit } from "@/src/hooks/useFormSubmit";

interface EnemyOption {
  id: string;
  name: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
}

interface BattleFormProps {
  enemies: EnemyOption[];
}

export function BattleForm({ enemies }: BattleFormProps) {
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battleResult, setBattleResult] = useState<"VICTORY" | "DEFEAT" | null>(null);

  const { submit, isPending, error } = useFormSubmit({
    action: simulateBattle,
    onSuccess: (data) => {
      setBattleLog(data.log);
      setBattleResult(data.result);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SimulateBattleInput>({
    resolver: zodResolver(simulateBattleSchema),
    defaultValues: {
      enemyId: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    setBattleLog([]);
    setBattleResult(null);
    submit(data);
  });

  const enemyOptions = enemies.map((e) => ({
    value: e.id,
    label: `${e.name} (Nv.${e.level} · HP:${e.hp})`,
  }));

  return (
    <form onSubmit={onSubmit} className="hs-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Swords className="w-5 h-5" style={{ color: "var(--hs-primary)" }} />
        <h3 className="text-lg font-bold text-[var(--hs-text)]">Simular Batalla</h3>
      </div>

      <FormSelect
        label="Enemigo"
        placeholder="Selecciona un enemigo..."
        options={enemyOptions}
        required
        error={errors.enemyId?.message}
        {...register("enemyId")}
      />

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-[var(--hs-danger)]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button type="submit" disabled={isPending} className="hs-btn w-full text-sm justify-center">
        {isPending ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Swords className="w-4 h-4 mr-1" />
        )}
        {isPending ? "Combatiendo..." : "Iniciar batalla"}
      </button>

      {/* Battle Log */}
      <AnimatePresence>
        {battleLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-xl p-4 space-y-1"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: `1px solid ${battleResult === "VICTORY" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="w-4 h-4" style={{ color: "var(--hs-text-muted)" }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--hs-text-muted)" }}>
                  Registro de batalla
                </span>
              </div>
              {battleLog.map((line, i) => (
                <p
                  key={i}
                  className="text-xs font-mono"
                  style={{ color: "var(--hs-text-muted)" }}
                >
                  {line}
                </p>
              ))}
              <p
                className={`mt-2 text-sm font-bold ${
                  battleResult === "VICTORY"
                    ? "text-[var(--hs-success)]"
                    : "text-[var(--hs-danger)]"
                }`}
              >
                {battleResult === "VICTORY" ? "¡Victoria!" : "Derrota"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
