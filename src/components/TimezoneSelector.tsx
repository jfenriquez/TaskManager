// components/TimezoneSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { commonTimezones, getUserTimezone } from "@/src/utils/dateHelpers";

interface TimezoneSelectorProps {
  value?: string;
  onChange?: (timezone: string) => void;
  autoDetect?: boolean;
  showDetected?: boolean;
  className?: string;
}

export default function TimezoneSelector({
  value,
  onChange,
  autoDetect = true,
  showDetected = true,
  className = "",
}: TimezoneSelectorProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(
    value || "America/Bogota"
  );
  const [detectedTimezone, setDetectedTimezone] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Auto-detectar timezone del navegador
    if (autoDetect && !value) {
      const detected = getUserTimezone();
      setDetectedTimezone(detected);
      setSelectedTimezone(detected);
      onChange?.(detected);
    } else if (value) {
      setSelectedTimezone(value);
    }
  }, [value, autoDetect, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setSelectedTimezone(newTimezone);
    onChange?.(newTimezone);
  };

  const handleAutoDetect = () => {
    const detected = getUserTimezone();
    setDetectedTimezone(detected);
    setSelectedTimezone(detected);
    onChange?.(detected);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="timezone"
          className="block text-sm font-medium text-base-content/80"
        >
          Zona Horaria
        </label>
        {showDetected && (
          <button
            type="button"
            onClick={handleAutoDetect}
            className="text-xs text-primary hover:text-primary-focus underline"
          >
            Auto-detectar
          </button>
        )}
      </div>

      <select
        id="timezone"
        value={selectedTimezone}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-base-100"
      >
        {commonTimezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>

      {showDetected && detectedTimezone && (
        <p className="text-xs text-base-content/50 mt-1">
          🌍 Detectado: <span className="font-medium">{detectedTimezone}</span>
        </p>
      )}

      <p className="text-xs text-base-content/50">
        Hora actual:{" "}
        {mounted
          ? new Date().toLocaleString("es-ES", {
              timeZone: selectedTimezone,
              dateStyle: "short",
              timeStyle: "short",
            })
          : "---"}
      </p>
    </div>
  );
}
