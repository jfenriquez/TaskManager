"use client";

import { useState, useRef, useEffect, type InputHTMLAttributes } from "react";
import { FormField } from "./FormField";
import { ChevronDown, X } from "lucide-react";

interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * @deprecated No usado actualmente en ningún componente. Disponible para implementación futura (ej. selector de categorías).
 */
interface FormComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  error?: string;
  helpText?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
}

export function FormCombobox({
  label,
  error,
  helpText,
  required,
  options,
  value,
  onChange,
  onSearch,
  placeholder,
  className,
  ...props
}: FormComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <FormField label={label} error={error} required={required} helpText={helpText}>
      <div ref={ref} className="relative">
        <div
          className={`hs-input w-full flex items-center gap-2 cursor-pointer ${error ? "border-[var(--hs-danger)]" : ""} ${className ?? ""}`}
          onClick={() => setOpen(!open)}
        >
          <input
            readOnly
            value={query || selected?.label || ""}
            placeholder={placeholder || "Seleccionar..."}
            className="flex-1 bg-transparent outline-none text-sm text-[var(--hs-text)] cursor-pointer"
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            {...props}
          />
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setQuery("");
              }}
              className="p-0.5 rounded hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" style={{ color: "var(--hs-text-muted)" }} />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            style={{ color: "var(--hs-text-muted)" }}
          />
        </div>

        {open && (
          <div
            className="absolute z-20 mt-1 w-full rounded-xl overflow-hidden shadow-xl"
            style={{
              background: "var(--hs-card-bg)",
              border: "1px solid var(--hs-glass-border)",
            }}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs" style={{ color: "var(--hs-text-muted)" }}>
                Sin resultados
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  disabled={opt.disabled}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    opt.value === value
                      ? "bg-[var(--hs-primary)]/10 text-[var(--hs-primary)]"
                      : "text-[var(--hs-text)] hover:bg-white/5"
                  } ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}
