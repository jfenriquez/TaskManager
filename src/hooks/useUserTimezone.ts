// hooks/useUserTimezone.ts
"use client";

import { useState, useEffect } from "react";
import { getUserTimezone } from "@/src/utils/dateHelpers";

export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>("America/Bogota");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimezone = async () => {
      try {
        // Intentar obtener del servidor (de la sesión del usuario)
        const response = await fetch("/api/user/timezone");

        if (response.ok) {
          const data = await response.json();
          setTimezone(data.timezone);
        } else {
          // Fallback: usar timezone del navegador
          const detected = getUserTimezone();
          setTimezone(detected);
        }
      } catch (error) {
        console.error("Error obteniendo timezone:", error);
        // Fallback
        const detected = getUserTimezone();
        setTimezone(detected);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimezone();
  }, []);

  const updateTimezone = async (newTimezone: string) => {
    setTimezone(newTimezone);

    try {
      // Guardar en el servidor
      const response = await fetch("/api/user/timezone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: newTimezone }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar timezone");
      }

      return true;
    } catch (error) {
      console.error("Error actualizando timezone:", error);
      return false;
    }
  };

  return { timezone, setTimezone: updateTimezone, isLoading };
}
