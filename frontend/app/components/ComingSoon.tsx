"use client";

import React from "react";

interface ComingSoonProps {
  category?: string;
  title: string;
  description?: string;
  features?: string[];
  progress?: number;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-2xl w-full space-y-3.5 relative z-10">
        {/* Page Title */}
        <h1 className="font-lexend text-3xl sm:text-4xl font-bold tracking-tight text-primary sm:whitespace-nowrap">
          {title}
        </h1>

        {/* Coming Soon Sub-heading with Animated Ellipsis */}
        <div className="text-lg sm:text-xl font-semibold tracking-wide inline-flex items-center justify-center gap-0.5">
          <span className="bg-gradient-to-r from-accent via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Coming Soon
          </span>
          <span className="inline-flex text-accent font-bold ml-0.5">
            <span className="animate-bounce inline-block" style={{ animationDuration: "1s", animationDelay: "0s" }}>.</span>
            <span className="animate-bounce inline-block" style={{ animationDuration: "1s", animationDelay: "0.2s" }}>.</span>
            <span className="animate-bounce inline-block" style={{ animationDuration: "1s", animationDelay: "0.4s" }}>.</span>
          </span>
        </div>

        {/* Description (Consistently 2 lines) */}
        {description && (
          <p className="text-secondary text-sm sm:text-base max-w-lg mx-auto leading-relaxed pt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
