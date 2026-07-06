"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";

interface AlertProps {
  show: boolean;
  type?: "error" | "success" | "info" | "warning";
  title?: string;
  message: string;
  onClose?: () => void;
  action?: ReactNode;
}

const icons = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  error: "border-error/30 bg-error/10 text-error",
  success: "border-success/30 bg-success/10 text-success",
  info: "border-info/30 bg-info/10 text-info",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

const iconColors = {
  error: "text-error",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
};

export function Alert({ show, type = "info", title, message, onClose, action }: AlertProps) {
  const Icon = icons[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="overflow-hidden"
        >
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-4 border ${colorMap[type]}`}>
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[type]}`} />
            <div className="flex-1 min-w-0">
              {title && (
                <p className={`text-sm font-bold mb-0.5 ${iconColors[type]}`}>
                  {title}
                </p>
              )}
              <p className="text-xs text-base-content/70">
                {message}
              </p>
              {action && <div className="mt-2">{action}</div>}
            </div>
            {onClose && (
              <button onClick={onClose} className="flex-shrink-0 p-1 rounded-lg hover:bg-base-200 transition-colors">
                <X className="w-4 h-4 text-base-content/60" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
