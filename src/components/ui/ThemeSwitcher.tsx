"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiChevronDown } from "react-icons/fi";

type Theme =
  | "light" | "dark" | "cupcake" | "retro" | "luxury"
  | "dim" | "coffee" | "lemonade" | "wireframe" | "fantasy" | "pastel";

interface ThemeOption {
  value: Theme;
  label: string;
  icon: string;
  color: string;
}

const themes: ThemeOption[] = [
  { value: "light", label: "Light", icon: "☀️", color: "from-yellow-400 to-orange-400" },
  { value: "dark", label: "Dark", icon: "🌙", color: "from-slate-700 to-slate-900" },
  { value: "cupcake", label: "Cupcake", icon: "🧁", color: "from-pink-300 to-purple-300" },
  { value: "retro", label: "Retro", icon: "😎", color: "from-orange-400 to-red-400" },
  { value: "luxury", label: "Luxury", icon: "🧛", color: "from-purple-900 to-black" },
  { value: "dim", label: "Dim", icon: "🐍", color: "from-green-700 to-emerald-900" },
  { value: "coffee", label: "Coffee", icon: "☕", color: "from-amber-700 to-brown-900" },
  { value: "lemonade", label: "Lemonade", icon: "🍋", color: "from-lime-300 to-yellow-300" },
  { value: "wireframe", label: "Wireframe", icon: "🌨️", color: "from-gray-200 to-gray-400" },
  { value: "fantasy", label: "Fantasy", icon: "🦑", color: "from-purple-400 to-pink-400" },
  { value: "pastel", label: "Pastel", icon: "🎂", color: "from-blue-200 to-pink-200" },
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = themes.find((t) => t.value === (typeof window !== "undefined" ? (document.documentElement.getAttribute("data-theme") as Theme) : "light")) || themes[0];

  const setTheme = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <div className="fixed top-2 right-4 z-[9999]">
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-circle btn-lg shadow-2xl bg-base-100 border-2 border-base-300 hover:border-primary transition-all duration-300 relative overflow-hidden group"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
          <motion.span
            key={currentTheme.value}
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-2xl relative z-10"
          >
            {currentTheme.icon}
          </motion.span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-1 right-1 text-base-content/40"
          >
            <FiChevronDown size={12} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 -z-10"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="absolute top-20 right-0 w-56 bg-base-100 rounded-2xl shadow-2xl border-2 border-base-300 overflow-hidden backdrop-blur-xl"
              >
                <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                  {themes.map((themeOption, idx) => (
                    <motion.button
                      key={themeOption.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setTheme(themeOption.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                        currentTheme.value === themeOption.value
                          ? "bg-primary text-primary-content shadow-lg"
                          : "hover:bg-base-200"
                      }`}
                    >
                      <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${themeOption.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                        <span className="text-xl">{themeOption.icon}</span>
                        {currentTheme.value === themeOption.value && (
                          <motion.div layoutId="selection" className="absolute inset-0 rounded-lg ring-2 ring-primary-content/50" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`font-semibold text-sm ${currentTheme.value === themeOption.value ? "text-primary-content" : "text-base-content"}`}>
                          {themeOption.label}
                        </div>
                      </div>
                      {currentTheme.value === themeOption.value && (
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-content" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                <div className="border-t border-base-300 p-3 bg-base-200/50">
                  <div className="text-xs text-base-content/60 text-center flex items-center justify-center gap-2">
                    <FiSun size={12} />
                    <span>11 temas disponibles</span>
                    <FiMoon size={12} />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
