"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { FormField } from "./FormField";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helpText, required, className, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} helpText={helpText}>
        <input
          ref={ref}
          className={`hs-input w-full ${error ? "border-[var(--hs-danger)]" : ""} ${className ?? ""}`}
          {...props}
        />
      </FormField>
    );
  },
);

FormInput.displayName = "FormInput";
