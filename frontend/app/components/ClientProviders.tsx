"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthModalProvider } from "./AuthModalContext";
import { AuthModal } from "./AuthModal";
import { Toaster } from "react-hot-toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          {children}
          <AuthModal />
          <Toaster position="top-right" reverseOrder={false} />
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
