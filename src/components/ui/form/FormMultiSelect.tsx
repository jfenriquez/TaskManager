"use client";

import { useState, useRef, useEffect } from "react";
import { FormField } from "./FormField";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

/**
 * @deprecated No usado actualmente en ningún componente. Disponible para implementación futura.
 */
interface FormMultiSelectProps {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function FormMultiSelect({
  label,
  error,
  helpText,
  required,
  options,
  values,
  onChange,
  placeholder,
}: FormMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const remove = (val: string) => {
    onChange(values.filter((v) => v !== val));
  };

  return (
    <FormField label={label} error={error} required={required} helpText={helpText}>
      <div ref={ref} className="relative">
        <div
          className={`hs-input w-full min-h-[42px] flex flex-wrap items-center gap-1 cursor-pointer ${error ? "border-[var(--hs-danger)]" : ""}`}
          onClick={() => setOpen(!open)}
        >
          {values.length === 0 && (
            <span className="text-sm" style={{ color: "var(--hs-text-muted)" }}>
              {placeholder || "Seleccionar..."}
            </span>
          )}
          {values.map((val) => {
            const opt = options.find((o) => o.value === val);
            return opt ? (
              <span
                key={val}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "var(--hs-success)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                {opt.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(val);
                  }}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
          <ChevronDown
            className={`ml-auto w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            style={{ color: "var(--hs-text-muted)" }}
          />
        </div>

        {open && (
          <div
            className="absolute z-20 mt-1 w-full rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto"
            style={{
              background: "var(--hs-card-bg)",
              border: "1px solid var(--hs-glass-border)",
            }}
          >
            {options.map((opt) => {
              const selected = values.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                    selected
                      ? "bg-[var(--hs-primary)]/10 text-[var(--hs-primary)]"
                      : "text-[var(--hs-text)] hover:bg-white/5"
                  }`}
                  onClick={() => toggle(opt.value)}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selected
                        ? "border-[var(--hs-primary)] bg-[var(--hs-primary)]"
                        : "border-[var(--hs-glass-border)]"
                    }`}
                  >
                    {selected && <div className="w-2 h-2 rounded-sm bg-white" />}
                  </div>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FormField>
  );
}
