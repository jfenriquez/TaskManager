"use client";

import { type SelectHTMLAttributes, forwardRef } from "react";
import { FormField } from "./FormField";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helpText, required, options, placeholder, className, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} helpText={helpText}>
        <select
          ref={ref}
          className={`hs-input w-full ${error ? "border-[var(--hs-danger)]" : ""} ${className ?? ""}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  },
);

FormSelect.displayName = "FormSelect";
