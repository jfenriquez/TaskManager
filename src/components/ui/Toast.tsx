"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  show: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: { border: "rgba(16,185,129,0.4)", bg: "rgba(16,185,129,0.15)", color: "var(--hs-success)" },
  error: { border: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.15)", color: "var(--hs-danger)" },
  info: { border: "rgba(59,130,246,0.4)", bg: "rgba(59,130,246,0.15)", color: "var(--hs-secondary)" },
};

export function Toast({ show, message, type = "info", onClose, duration = 4000 }: ToastProps) {
  const Icon = icons[type];
  const c = colors[type];

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[100]"
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl"
            style={{ border: `1px solid ${c.border}`, background: c.bg }}
          >
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: c.color }} />
            <p className="text-sm font-medium text-[var(--hs-text)]">{message}</p>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" style={{ color: "var(--hs-text-muted)" }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
