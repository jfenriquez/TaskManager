"use client";

import { type TextareaHTMLAttributes, forwardRef } from "react";
import { FormField } from "./FormField";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helpText, required, className, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} helpText={helpText}>
        <textarea
          ref={ref}
          className={`hs-input w-full min-h-[80px] resize-none ${error ? "border-[var(--hs-danger)]" : ""} ${className ?? ""}`}
          {...props}
        />
      </FormField>
    );
  },
);

FormTextarea.displayName = "FormTextarea";
