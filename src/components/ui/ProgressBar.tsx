"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={`space-y-1 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-[var(--hs-text-muted)]">{label}</span>}
          {showValue && (
            <span className="font-mono font-bold" style={{ color: color || "var(--hs-primary)" }}>
              {value}/{max} ({pct}%)
            </span>
          )}
        </div>
      )}
      <div className={`${heights[size]} hs-progress-bar`}>
        <motion.div
          className="hs-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color || "linear-gradient(90deg, var(--hs-primary), var(--hs-accent))" }}
        />
      </div>
    </div>
  );
}
