"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

/**
 * @deprecated No usado actualmente en ningún componente. Disponible para implementación futura.
 */
interface FormSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

/**
 * @deprecated No usado actualmente en ningún componente.
 */
export const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <label className="flex items-center justify-between gap-4 cursor-pointer group">
        <div>
          <span className="text-sm font-medium text-[var(--hs-text)] group-hover:text-[var(--hs-primary)] transition-colors">
            {label}
          </span>
          {description && (
            <p className="text-[10px] text-[var(--hs-text-muted)]">{description}</p>
          )}
        </div>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          className={`toggle toggle-sm ${className ?? ""}`}
          {...props}
        />
      </label>
    );
  },
);

FormSwitch.displayName = "FormSwitch";
