"use client";

import React from "react";
import { AuthModalProvider } from "./AuthModalContext";
import { AuthModal } from "./AuthModal";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthModalProvider>
      {children}
      <AuthModal />
    </AuthModalProvider>
  );
}
