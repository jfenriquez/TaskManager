"use client";

import { useState, useTransition, useCallback } from "react";
import type { ActionResult } from "@/src/lib/server-actions/hyde-slayer/utils";

interface UseFormSubmitOptions<TInput, TOutput> {
  action: (input: TInput) => Promise<ActionResult<TOutput>>;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  resetOnSuccess?: boolean;
}

interface UseFormSubmitReturn<TInput, TOutput> {
  submit: (input: TInput) => Promise<void>;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  data: TOutput | null;
  reset: () => void;
}

export function useFormSubmit<TInput, TOutput = void>(
  options: UseFormSubmitOptions<TInput, TOutput>,
): UseFormSubmitReturn<TInput, TOutput> {
  const { action, onSuccess, onError, resetOnSuccess } = options;
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const submit = useCallback(
    async (input: TInput) => {
      setError(null);
      setIsSuccess(false);
      startTransition(async () => {
        try {
          const result = await action(input);
          if (result.success) {
            setData(result.data);
            setIsSuccess(true);
            onSuccess?.(result.data);
            if (resetOnSuccess) {
              setTimeout(() => setIsSuccess(false), 3000);
            }
          } else {
            setError(result.error);
            onError?.(result.error);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Error inesperado";
          setError(msg);
          onError?.(msg);
        }
      });
    },
    [action, onSuccess, onError, resetOnSuccess],
  );

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setData(null);
  }, []);

  return { submit, isPending, isSuccess, error, data, reset };
}
