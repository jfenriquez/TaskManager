"use client";

import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: ReactNode;
}

export function FormField({ label, error, required, helpText, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[var(--hs-text-muted)] uppercase tracking-wider block">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-[10px] text-[var(--hs-text-muted)]">{helpText}</p>
      )}
      {error && (
        <p className="text-[10px] text-[var(--hs-danger)]">{error}</p>
      )}
    </div>
  );
}
