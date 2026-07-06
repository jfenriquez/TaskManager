"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { FormField } from "./FormField";

/**
 * @deprecated No usado actualmente en ningún componente. Disponible para implementación futura (ej. filtros de tareas por fecha).
 */
interface FormDatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  helpText?: string;
}

/**
 * @deprecated No usado actualmente en ningún componente.
 */
export const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
  ({ label, error, helpText, required, className, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} helpText={helpText}>
        <input
          ref={ref}
          type="date"
          className={`hs-input w-full ${error ? "border-[var(--hs-danger)]" : ""} ${className ?? ""}`}
          {...props}
        />
      </FormField>
    );
  },
);

FormDatePicker.displayName = "FormDatePicker";
