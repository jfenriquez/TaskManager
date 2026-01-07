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
          className="block text-sm font-medium text-gray-700"
        >
          Zona Horaria
        </label>
        {showDetected && (
          <button
            type="button"
            onClick={handleAutoDetect}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Auto-detectar
          </button>
        )}
      </div>

      <select
        id="timezone"
        value={selectedTimezone}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {commonTimezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>

      {showDetected && detectedTimezone && (
        <p className="text-xs text-gray-500 mt-1">
          🌍 Detectado: <span className="font-medium">{detectedTimezone}</span>
        </p>
      )}

      <p className="text-xs text-gray-500">
        Hora actual:{" "}
        {new Date().toLocaleString("es-ES", {
          timeZone: selectedTimezone,
          dateStyle: "short",
          timeStyle: "short",
        })}
      </p>
    </div>
  );
}
