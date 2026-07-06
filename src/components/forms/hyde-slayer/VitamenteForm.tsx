"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Loader2 } from "lucide-react";
import {
  createVitamenteSchema,
  type CreateVitamenteInput,
} from "@/src/lib/validations/hyde-slayer";
import { createVitamente } from "@/src/lib/server-actions/hyde-slayer/vitamente";
import { FormInput } from "@/src/components/ui/form/FormInput";
import { FormTextarea } from "@/src/components/ui/form/FormTextarea";
import { FormSelect } from "@/src/components/ui/form/FormSelect";
import { useFormSubmit } from "@/src/hooks/useFormSubmit";

const categories = [
  { value: "mañana", label: "Mañana" },
  { value: "tarde", label: "Tarde" },
  { value: "noche", label: "Noche" },
  { value: "motivacion", label: "Motivación" },
  { value: "relajacion", label: "Relajación" },
];

interface VitamenteFormProps {
  onCreated?: () => void;
}

export function VitamenteForm({ onCreated }: VitamenteFormProps) {
  const { submit, isPending, isSuccess, error } = useFormSubmit({
    action: createVitamente,
    onSuccess: () => {
      reset();
      onCreated?.();
    },
    resetOnSuccess: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateVitamenteInput>({
    resolver: zodResolver(createVitamenteSchema),
    defaultValues: { title: "", content: "", category: "" },
  });

  const onSubmit = handleSubmit((data) =>
    submit({ ...data, category: data.category || null }),
  );

  return (
    <form onSubmit={onSubmit} className="hs-card p-6 space-y-4">
      <h3 className="text-lg font-bold text-[var(--hs-text)]">Nueva Vitamente</h3>

      <FormInput
        label="Título"
        placeholder="Ej: Fuerza interior"
        error={errors.title?.message}
        {...register("title")}
      />

      <FormTextarea
        label="Contenido"
        placeholder="Escribe la afirmación..."
        error={errors.content?.message}
        {...register("content")}
      />

      <FormSelect
        label="Categoría"
        options={categories}
        placeholder="Sin categoría"
        error={errors.category?.message}
        {...register("category")}
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
        <button type="submit" disabled={isPending} className="hs-btn text-sm">
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          Crear Vitamente
        </button>

        {isSuccess && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--hs-success)" }}
          >
            <Check className="w-3.5 h-3.5" />
            Creada
          </motion.span>
        )}
      </div>
    </form>
  );
}
