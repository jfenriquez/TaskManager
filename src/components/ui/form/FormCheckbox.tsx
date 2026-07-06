"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

/**
 * @deprecated No usado actualmente en ningún componente. Disponible para implementación futura.
 */
interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  description?: string;
}

/**
 * @deprecated No usado actualmente en ningún componente.
 */
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, description, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            ref={ref}
            type="checkbox"
            className={`mt-0.5 w-4 h-4 rounded accent-[var(--hs-primary)] ${className ?? ""}`}
            {...props}
          />
          <div>
            <span className="text-sm font-medium text-[var(--hs-text)] group-hover:text-[var(--hs-primary)] transition-colors">
              {label}
            </span>
            {description && (
              <p className="text-[10px] text-[var(--hs-text-muted)]">{description}</p>
            )}
          </div>
        </label>
        {error && (
          <p className="text-[10px] text-[var(--hs-danger)] ml-7">{error}</p>
        )}
      </div>
    );
  },
);

FormCheckbox.displayName = "FormCheckbox";
