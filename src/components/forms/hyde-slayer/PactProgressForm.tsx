"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowUp, Loader2 } from "lucide-react";
import {
  updatePactProgressSchema,
  type UpdatePactProgressInput,
} from "@/src/lib/validations/hyde-slayer";
import { incrementPactProgress } from "@/src/lib/server-actions/hyde-slayer/pact";
import { FormInput } from "@/src/components/ui/form/FormInput";
import { useFormSubmit } from "@/src/hooks/useFormSubmit";
import type { ActionResult } from "@/src/lib/server-actions/hyde-slayer/utils";

interface PactProgressFormProps {
  pactId: string;
  onProgressUpdated?: (progress: number, isComplete: boolean) => void;
}

export function PactProgressForm({ pactId, onProgressUpdated }: PactProgressFormProps) {
  const [isComplete, setIsComplete] = useState(false);

  const { submit, isPending, error } = useFormSubmit<
    UpdatePactProgressInput,
    { pactId: string; progress: number; status: string; isComplete: boolean }
  >({
    action: incrementPactProgress as (input: UpdatePactProgressInput) => Promise<
      ActionResult<{ pactId: string; progress: number; status: string; isComplete: boolean }>
    >,
    onSuccess: (data) => {
      setIsComplete(data.isComplete);
      onProgressUpdated?.(data.progress, data.isComplete);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePactProgressInput>({
    resolver: zodResolver(updatePactProgressSchema),
    defaultValues: { pactId, progress: 5 },
  });

  const onSubmit = handleSubmit((data) => submit(data));

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <FormInput
          label="¿Cuánto avanzaste? (+%)"
          type="number"
          min={1}
          max={5}
          error={errors.progress?.message}
          helpText="El avance se suma al progreso actual (máx +5 por vez)"
          {...register("progress", { valueAsNumber: true })}
        />
      </div>

      <button type="submit" disabled={isPending || isComplete} className="hs-btn text-sm py-2.5 px-4">
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isComplete ? (
          <Check className="w-4 h-4" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        )}
      </button>

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
    </form>
  );
}
