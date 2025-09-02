"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-5 h-5 text-yellow-400" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-5 h-5 text-blue-500" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
