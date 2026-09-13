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

  const isLight = mounted ? theme === "light" : false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`p-2 text-secondary hover:text-primary rounded-lg bg-bg border border-border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${className}`}
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label="Toggle Theme"
    >
      {isLight ? (
        <Sun size={18} className="text-amber-500" weight="fill" />
      ) : (
        <Moon size={18} className="text-accent" weight="fill" />
      )}
      {showLabel && mounted && (
        <span className="text-xs font-semibold select-none">
          {isLight ? "Light Mode" : "Dark Navy"}
        </span>
      )}
    </button>
  );
}
