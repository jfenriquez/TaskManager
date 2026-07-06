"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isPending?: boolean;
}

const variants = {
  danger: { btnClass: "hs-btn-danger", icon: AlertTriangle },
  warning: { btnClass: "hs-btn", icon: AlertTriangle },
  default: { btnClass: "hs-btn", icon: AlertTriangle },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  isPending = false,
}: ConfirmDialogProps) {
  const v = variants[variant];
  const Icon = v.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm hs-card p-6 text-center"
          >
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: variant === "danger" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                }}
              >
                <Icon
                  className="w-7 h-7"
                  style={{
                    color: variant === "danger" ? "var(--hs-danger)" : "var(--hs-gold)",
                  }}
                />
              </div>
            </div>
            <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">{title}</h3>
            <p className="text-sm text-[var(--hs-text-muted)] mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={onClose} disabled={isPending} className="hs-btn-ghost flex-1 text-sm py-2.5">
                {cancelLabel}
              </button>
              <button onClick={onConfirm} disabled={isPending} className={`${v.btnClass} flex-1 text-sm py-2.5`}>
                {isPending ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
