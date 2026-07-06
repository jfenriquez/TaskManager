"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Loader2, Save } from "lucide-react";
import {
  createPactSchema,
  updatePactSchema,
  type CreatePactInput,
  type UpdatePactInput,
} from "@/src/lib/validations/hyde-slayer";
import { createPact, updatePact } from "@/src/lib/server-actions/hyde-slayer/pact";
import { FormInput } from "@/src/components/ui/form/FormInput";
import { FormTextarea } from "@/src/components/ui/form/FormTextarea";
import { FormSelect } from "@/src/components/ui/form/FormSelect";
import { useFormSubmit } from "@/src/hooks/useFormSubmit";

const difficulties = [
  { value: "EASY", label: "Fácil" },
  { value: "MEDIUM", label: "Medio" },
  { value: "HARD", label: "Difícil" },
  { value: "IMPOSSIBLE", label: "Imposible" },
];

interface PactFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreatePactInput> & { id?: string };
  onSuccess?: () => void;
}

function getErr(errors: Record<string, unknown>, field: string): string | undefined {
  const e = errors[field];
  if (typeof e === "object" && e && "message" in e) return (e as { message: string }).message;
  return undefined;
}

export function PactForm({ mode, defaultValues, onSuccess }: PactFormProps) {
  const action = mode === "create" ? createPact : (input: unknown) =>
    updatePact({ ...(input as object), id: defaultValues?.id } as UpdatePactInput);

  const { submit, isPending, isSuccess, error } = useFormSubmit({
    action,
    onSuccess: () => {
      if (mode === "create") reset();
      onSuccess?.();
    },
    resetOnSuccess: mode === "create",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(mode === "create" ? createPactSchema : updatePactSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      duration: defaultValues?.duration ?? 7,
      difficulty: (defaultValues?.difficulty as string) ?? "MEDIUM",
      xpReward: defaultValues?.xpReward ?? 50,
      coinReward: defaultValues?.coinReward ?? 10,
      disciplineReward: defaultValues?.disciplineReward ?? 0,
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (mode === "edit" && defaultValues?.id) {
      submit({ ...data, id: defaultValues.id } as unknown as CreatePactInput);
    } else {
      submit(data);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormInput
        label="Título"
        placeholder="Ej: Estudiar 1 hora diaria"
        error={getErr(errors, "title")}
        {...register("title")}
      />

      <FormTextarea
        label="Descripción"
        placeholder="Describe el pacto en detalle..."
        error={getErr(errors, "description")}
        {...register("description")}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Duración (días)"
          type="number"
          error={getErr(errors, "duration")}
          {...register("duration", { valueAsNumber: true })}
        />
        <FormSelect
          label="Dificultad"
          options={difficulties}
          error={getErr(errors, "difficulty")}
          {...register("difficulty")}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormInput
          label="XP"
          type="number"
          error={getErr(errors, "xpReward")}
          {...register("xpReward", { valueAsNumber: true })}
        />
        <FormInput
          label="Monedas"
          type="number"
          error={getErr(errors, "coinReward")}
          {...register("coinReward", { valueAsNumber: true })}
        />
        <FormInput
          label="Disciplina"
          type="number"
          error={getErr(errors, "disciplineReward")}
          {...register("disciplineReward", { valueAsNumber: true })}
        />
      </div>

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
        <button type="submit" disabled={isPending} className="hs-btn text-sm">
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : mode === "create" ? (
            <Plus className="w-4 h-4 mr-1" />
          ) : (
            <Save className="w-4 h-4 mr-1" />
          )}
          {mode === "create" ? "Crear Pacto" : "Guardar Cambios"}
        </button>

        {isSuccess && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--hs-success)" }}
          >
            <Check className="w-3.5 h-3.5" />
            {mode === "create" ? "Creado" : "Guardado"}
          </motion.span>
        )}
      </div>
    </form>
  );
}
