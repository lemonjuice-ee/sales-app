"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center w-16 h-8 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors duration-300"
    >
      {/* Sun (left) */}
      <Sun className="absolute left-2 w-4 h-4 text-yellow-500" />
      {/* Moon (right) */}
      <Moon className="absolute right-2 w-4 h-4 text-blue-400" />

      {/* Sliding knob with scale-in animation */}
      <div
        key={isDark ? "dark" : "light"} // force re-render for animation
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-gray-200 shadow-md transform transition-transform duration-300 animate-scale-in ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </button>
  );
}
