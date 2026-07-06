"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Save, Loader2 } from "lucide-react";
import {
  updatePlayerProfileSchema,
  type UpdatePlayerProfileInput,
} from "@/src/lib/validations/hyde-slayer";
import { updatePlayerProfile } from "@/src/lib/server-actions/hyde-slayer/player";
import { FormInput } from "@/src/components/ui/form/FormInput";
import { useFormSubmit } from "@/src/hooks/useFormSubmit";

interface PlayerProfileFormProps {
  defaultName: string;
  onSaved?: (name: string) => void;
}

export function PlayerProfileForm({ defaultName, onSaved }: PlayerProfileFormProps) {
  const { submit, isPending, isSuccess, error } = useFormSubmit({
    action: updatePlayerProfile,
    onSuccess: (data) => onSaved?.(data.playerName),
    resetOnSuccess: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdatePlayerProfileInput>({
    resolver: zodResolver(updatePlayerProfileSchema),
    defaultValues: { playerName: defaultName },
  });

  const onSubmit = handleSubmit((data) => submit(data));

  return (
    <form onSubmit={onSubmit} className="hs-card p-6 space-y-4">
      <h3 className="text-lg font-bold text-[var(--hs-text)]">Editar Perfil</h3>

      <FormInput
        label="Nombre del jugador"
        placeholder="Guerrero"
        error={errors.playerName?.message}
        {...register("playerName")}
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

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="hs-btn text-sm"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-1" />
          )}
          Guardar
        </button>

        {isSuccess && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--hs-success)" }}
          >
            <Check className="w-3.5 h-3.5" />
            Guardado
          </motion.span>
        )}
      </div>
    </form>
  );
}
