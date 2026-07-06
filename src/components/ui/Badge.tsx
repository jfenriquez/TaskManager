"use client";

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold";
  size?: "sm" | "md";
  className?: string;
}

const variants: Record<string, { bg: string; color: string }> = {
  default: { bg: "rgba(255,255,255,0.08)", color: "var(--hs-text-muted)" },
  success: { bg: "rgba(16,185,129,0.15)", color: "var(--hs-success)" },
  warning: { bg: "rgba(245,158,11,0.15)", color: "var(--hs-gold)" },
  danger: { bg: "rgba(239,68,68,0.15)", color: "var(--hs-danger)" },
  info: { bg: "rgba(59,130,246,0.15)", color: "var(--hs-secondary)" },
  gold: { bg: "rgba(245,158,11,0.2)", color: "var(--hs-gold)" },
};

export function Badge({ children, variant = "default", size = "sm", className = "" }: BadgeProps) {
  const v = variants[variant];
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`hs-badge ${sizeClass} ${className}`}
      style={{ background: v.bg, color: v.color }}
    >
      {children}
    </span>
  );
}
