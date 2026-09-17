"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthModalProvider } from "./AuthModalContext";
import { AuthModal } from "./AuthModal";
import { Toaster } from "sonner";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          {children}
          <AuthModal />
          <Toaster position="top-right" richColors />
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
