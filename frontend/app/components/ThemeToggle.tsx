"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-surface/50 animate-pulse ${className}`} />
    );
  }

  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl bg-surface-raised/80 hover:bg-surface border border-border/80 text-secondary hover:text-primary transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
      title={isLight ? "Switch to Navy Dark Mode" : "Switch to Light (White) Mode"}
      aria-label="Toggle Theme"
    >
      {isLight ? (
        <Sun size={18} className="text-amber-500 animate-spin-once" weight="fill" />
      ) : (
        <Moon size={18} className="text-accent animate-pulse" weight="fill" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isLight ? "Light Mode" : "Dark Navy"}
        </span>
      )}
    </button>
  );
}
