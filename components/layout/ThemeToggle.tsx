"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl w-9 h-9 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-600 dark:text-slate-300 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 rotate-0 hover:rotate-45 transition-transform duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-brand-800 rotate-0 hover:-rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
}
