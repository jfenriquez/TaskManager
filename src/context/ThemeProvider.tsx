"use client";

import { useEffect, useState } from "react";

type Theme =
  | "light" | "dark" | "cupcake" | "retro" | "luxury"
  | "dim" | "coffee" | "lemonade" | "wireframe" | "fantasy" | "pastel";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dim");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  return <>{children}</>;
}
